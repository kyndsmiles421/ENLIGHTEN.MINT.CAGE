"""
Background Tasks — The ENLIGHTEN.MINT.CAFE
Extracted from server.py for cleaner separation of concerns.
"""
import asyncio
import random
from datetime import datetime, timezone
from deps import db, logger


async def push_scheduler_loop():
    """Background loop: check every 30 min and send push reminders at user-preferred hours."""
    from routes.notifications import send_push_to_user, QUANTUM_REMINDERS
    from routes.astrology_reading import _zodiac_from_date, ZODIAC_INFO, _get_current_planetary_context

    sent_cache = set()

    COSMIC_BRIEFING_TEMPLATES = [
        "The {moon_phase} amplifies your {element} energy today. {transit_msg} Trust the cosmic current, {sign_name}.",
        "{sign_name}, the stars speak clearly: {transit_msg} Under the {moon_phase}, your {element} nature is heightened.",
        "Good morning, {sign_name}. The {moon_phase} whispers of {moon_energy}. {transit_msg} Embrace your {element} power.",
        "Cosmic alignment detected, {sign_name}. {transit_msg} The {moon_phase} calls for {moon_energy}. Shine brightly.",
        "Today's celestial message for {sign_name}: The {moon_phase} supports {moon_energy}. {transit_msg}",
    ]

    while True:
        try:
            await asyncio.sleep(1800)
            now = datetime.now(timezone.utc)
            current_hour = now.hour
            today = now.strftime("%Y-%m-%d")

            sub_user_ids = await db.push_subscriptions.distinct("user_id")
            if not sub_user_ids:
                continue

            planetary = _get_current_planetary_context(now)
            transit_names = [t["planet"] for t in planetary["active_transits"]]
            transit_msg = (
                f"{' and '.join(transit_names[:2])} {'guide' if len(transit_names) <= 2 else 'align to guide'} your path."
                if transit_names else "The cosmic web hums with potential."
            )

            for uid in sub_user_ids:
                prefs = await db.notification_prefs.find_one({"user_id": uid}, {"_id": 0})
                if not prefs or not prefs.get("daily_relaxation", True):
                    continue

                morning_hour = prefs.get("reminder_hour", 8)
                evening_hour = prefs.get("evening_hour", 20)

                briefing_key = f"{today}-briefing-{uid}"
                briefing_hour = max(0, morning_hour - 1)
                if current_hour == briefing_hour and briefing_key not in sent_cache:
                    try:
                        profile = await db.profiles.find_one({"user_id": uid}, {"_id": 0, "birth_date": 1})
                        birth_date = profile.get("birth_date", "") if profile else ""
                        zodiac = _zodiac_from_date(birth_date) if birth_date else None
                        z_info = ZODIAC_INFO.get(zodiac, {})
                        sign_name = z_info.get("name", "Cosmic Traveler")
                        element = z_info.get("element", "cosmic")

                        body = random.choice(COSMIC_BRIEFING_TEMPLATES).format(
                            moon_phase=planetary["moon_phase"],
                            moon_energy=planetary["moon_energy"],
                            element=element.lower(),
                            sign_name=sign_name,
                            transit_msg=transit_msg,
                        )
                        await send_push_to_user(uid, "Your Daily Cosmic Briefing", body, "/star-chart", "cosmic-briefing")
                        sent_cache.add(briefing_key)
                    except Exception as be:
                        logger.error(f"Cosmic briefing error for {uid}: {be}")

                morning_key = f"{today}-morning-{uid}"
                if current_hour == morning_hour and morning_key not in sent_cache:
                    title, body, url = random.choice(QUANTUM_REMINDERS["morning"])
                    await send_push_to_user(uid, title, body, url, "daily-morning")
                    sent_cache.add(morning_key)

                evening_key = f"{today}-evening-{uid}"
                if current_hour == evening_hour and evening_key not in sent_cache:
                    title, body, url = random.choice(QUANTUM_REMINDERS["evening"])
                    await send_push_to_user(uid, title, body, url, "daily-evening")
                    sent_cache.add(evening_key)

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
            await asyncio.sleep(3600)
            now = datetime.now(timezone.utc)
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
