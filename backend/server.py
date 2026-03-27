from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import os
import asyncio
from pathlib import Path
from datetime import datetime, timezone
from deps import client, db, logger

from routes.auth import router as auth_router
from routes.wellness import router as wellness_router
from routes.dashboard import router as dashboard_router
from routes.challenges import router as challenges_router
from routes.profiles import router as profiles_router
from routes.oracle import router as oracle_router
from routes.practices import router as practices_router
from routes.media import router as media_router
from routes.meditations import router as meditations_router
from routes.journey import router as journey_router
from routes.knowledge import router as knowledge_router
from routes.community import router as community_router
from routes.rituals import router as rituals_router
from routes.plants import router as plants_router
from routes.plants import reset_plant_watering
from routes.recommendations import router as recommendations_router
from routes.learning import router as learning_router
from routes.gamification import router as gamification_router
from routes.avatar_yoga import router as avatar_yoga_router
from routes.mayan import router as mayan_router
from routes.cardology import router as cardology_router
from routes.daily_challenges import router as daily_challenges_router
from routes.social import router as social_router
from routes.teachings import router as teachings_router
from routes.numerology import router as numerology_router
from routes.nature import router as nature_router
from routes.aromatherapy import router as aromatherapy_router
from routes.herbology import router as herbology_router
from routes.elixirs import router as elixirs_router
from routes.meals import router as meals_router
from routes.acupressure import router as acupressure_router
from routes.reiki import router as reiki_router
from routes.discover import router as discover_router
from routes.daily_ritual import router as daily_ritual_router
from routes.cosmic_calendar import router as cosmic_calendar_router
from routes.wellness_reports import router as wellness_reports_router
from routes.meditation_history import router as meditation_history_router
from routes.uploads import router as uploads_router
from routes.coach import router as coach_router
from routes.cosmic_context import router as cosmic_context_router
from routes.daily_briefing import router as daily_briefing_router
from routes.forecasts import router as forecasts_router
from routes.cosmic_profile import router as cosmic_profile_router
from routes.star_cultures import router as star_cultures_router
from routes.creation_stories import router as creation_stories_router
from routes.ai_visuals import router as ai_visuals_router
from routes.notifications import router as notifications_router
from routes.achievements import router as achievements_router
from routes.trade_circle import router as trade_circle_router
from routes.subscriptions import router as subscriptions_router

app = FastAPI()

all_routers = [
    auth_router, wellness_router, dashboard_router, challenges_router,
    profiles_router, oracle_router, practices_router, media_router,
    meditations_router, journey_router, knowledge_router, community_router,
    rituals_router, plants_router, recommendations_router, learning_router,
    gamification_router, avatar_yoga_router, mayan_router, cardology_router,
    daily_challenges_router, social_router, teachings_router,
    numerology_router, nature_router,
    aromatherapy_router, herbology_router, elixirs_router, meals_router,
    acupressure_router, reiki_router, discover_router, daily_ritual_router,
    cosmic_calendar_router, wellness_reports_router, meditation_history_router,
    uploads_router, coach_router, cosmic_context_router, daily_briefing_router,
    forecasts_router,
    cosmic_profile_router,
    star_cultures_router,
    creation_stories_router,
    ai_visuals_router,
    notifications_router,
    achievements_router,
    trade_circle_router,
    subscriptions_router,
]

for r in all_routers:
    app.include_router(r, prefix="/api")


# Stripe webhook handler (at /api/webhook/stripe)
@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    try:
        body = await request.body()
        stripe_sig = request.headers.get("Stripe-Signature", "")
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get("STRIPE_API_KEY", ""),
            webhook_url=webhook_url,
        )
        event = await stripe_checkout.handle_webhook(body, stripe_sig)
        logger.info(f"Stripe webhook: {event.event_type} session={event.session_id}")

        if event.payment_status == "paid":
            tx = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
            if tx and tx.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"status": "error"}

# Serve generated videos as static files
videos_dir = Path(__file__).parent / "static" / "videos"
videos_dir.mkdir(parents=True, exist_ok=True)
app.mount("/api/static", StaticFiles(directory=str(Path(__file__).parent / "static")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


async def push_scheduler_loop():
    """Background loop: check every 30 min and send push reminders at user-preferred hours."""
    from routes.notifications import send_push_to_user, QUANTUM_REMINDERS
    import random
    from datetime import datetime, timezone

    sent_cache = set()

    while True:
        try:
            await asyncio.sleep(1800)  # 30 min
            now = datetime.now(timezone.utc)
            current_hour = now.hour
            today = now.strftime("%Y-%m-%d")

            # Find users with active subscriptions
            sub_user_ids = await db.push_subscriptions.distinct("user_id")
            if not sub_user_ids:
                continue

            for uid in sub_user_ids:
                prefs = await db.notification_prefs.find_one({"user_id": uid}, {"_id": 0})
                if not prefs or not prefs.get("daily_relaxation", True):
                    continue

                morning_hour = prefs.get("reminder_hour", 8)
                evening_hour = prefs.get("evening_hour", 20)

                # Morning reminder
                morning_key = f"{today}-morning-{uid}"
                if current_hour == morning_hour and morning_key not in sent_cache:
                    title, body, url = random.choice(QUANTUM_REMINDERS["morning"])
                    await send_push_to_user(uid, title, body, url, "daily-morning")
                    sent_cache.add(morning_key)

                # Evening reminder
                evening_key = f"{today}-evening-{uid}"
                if current_hour == evening_hour and evening_key not in sent_cache:
                    title, body, url = random.choice(QUANTUM_REMINDERS["evening"])
                    await send_push_to_user(uid, title, body, url, "daily-evening")
                    sent_cache.add(evening_key)

            # Clear old cache entries daily
            if len(sent_cache) > 1000:
                sent_cache.clear()

        except Exception as e:
            logger.error(f"Push scheduler error: {e}")
            await asyncio.sleep(60)


async def credit_refresh_loop():
    """Background loop: refresh credits monthly for free/starter/plus tiers."""
    from routes.subscriptions import TIERS
    while True:
        try:
            await asyncio.sleep(3600)  # Check every hour
            now = datetime.now(timezone.utc)
            # Only run on the 1st of each month between 00:00-01:00 UTC
            if now.day == 1 and now.hour == 0:
                tiers_to_refresh = {k: v for k, v in TIERS.items() if v["credits_per_month"] > 0}
                for tier_id, tier_info in tiers_to_refresh.items():
                    result = await db.user_credits.update_many(
                        {"tier": tier_id},
                        {"$set": {
                            "balance": tier_info["credits_per_month"],
                            "credits_refreshed_at": now.isoformat(),
                        }}
                    )
                    if result.modified_count > 0:
                        logger.info(f"Credit refresh: {tier_id} - {result.modified_count} users reset to {tier_info['credits_per_month']}")
        except Exception as e:
            logger.error(f"Credit refresh error: {e}")
            await asyncio.sleep(300)


@app.on_event("startup")
async def startup_tasks():
    await reset_plant_watering()
    asyncio.create_task(push_scheduler_loop())
    asyncio.create_task(credit_refresh_loop())
    logger.info("Push scheduler loop started")
    logger.info("Credit refresh loop started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
