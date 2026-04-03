"""
The Cosmic Collective — FastAPI Server
Auto-discovers all route modules, applies GZip compression,
creates DB indexes on startup, and runs background tasks.
"""
import os
import asyncio
import importlib
import pkgutil
from pathlib import Path
from datetime import datetime, timezone

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from middleware.sovereign_tier import SovereignTierMiddleware

from deps import client, db, logger

app = FastAPI()

# ━━━ GZip Compression (min 500 bytes) ━━━
app.add_middleware(GZipMiddleware, minimum_size=500)

# ━━━ Sovereign Tier Middleware ━━━
app.add_middleware(SovereignTierMiddleware)

# ━━━ CORS ━━━
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ━━━ Auto-discover and register all route modules ━━━
import routes as _routes_pkg

_routes_dir = Path(_routes_pkg.__file__).parent
_skip_modules = {"__init__"}

for _info in pkgutil.iter_modules([str(_routes_dir)]):
    if _info.name in _skip_modules:
        continue
    try:
        _mod = importlib.import_module(f"routes.{_info.name}")
        if hasattr(_mod, "router"):
            app.include_router(_mod.router, prefix="/api")
    except Exception as _e:
        logger.error(f"Failed to load route module routes.{_info.name}: {_e}")


# ━━━ WebSocket for Synchronicity / Coven System ━━━
from routes.synchronicity import manager as sync_manager, authenticate_ws

@app.websocket("/api/ws/sync")
async def websocket_sync(ws: WebSocket, token: str = ""):
    user = await authenticate_ws(token)
    if not user:
        await ws.close(code=4001, reason="Unauthorized")
        return

    uid = user["id"]
    await sync_manager.connect(uid, ws)

    membership = await db.coven_members.find_one({"user_id": uid, "active": True}, {"_id": 0})
    coven_id = membership["coven_id"] if membership else None

    user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "avatar": 1, "name": 1})
    avatar = user_doc.get("avatar", {"color": "#FBBF24", "symbol": "star"}) if user_doc else {"color": "#FBBF24", "symbol": "star"}
    display_name = avatar.get("display_name", user.get("name", "Traveler"))

    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "position":
                sync_manager.update_position(uid, {
                    "lat": data.get("lat"),
                    "lng": data.get("lng"),
                    "name": display_name,
                    "coven_id": coven_id,
                    "avatar": avatar,
                })
                if coven_id:
                    members = sync_manager.get_coven_members(coven_id, exclude_uid=uid)
                    await ws.send_json({"type": "coven_positions", "members": members})

            elif msg_type == "ping":
                await ws.send_json({"type": "pong", "online": sync_manager.online_count})

    except WebSocketDisconnect:
        sync_manager.disconnect(uid)
        if coven_id:
            await sync_manager.broadcast_to_coven(coven_id, {
                "type": "member_offline",
                "user_id": uid,
                "name": user.get("name", "Traveler"),
            }, exclude_uid=uid)
    except Exception:
        sync_manager.disconnect(uid)


# ━━━ Stripe Webhook ━━━
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
            broker_tx = await db.broker_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
            if broker_tx and broker_tx.get("payment_status") != "paid":
                await db.broker_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.users.update_one(
                    {"id": broker_tx["user_id"]},
                    {"$inc": {"user_credit_balance": broker_tx["credits"]}}
                )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"status": "error"}


# ━━━ Static Files ━━━
videos_dir = Path(__file__).parent / "static" / "videos"
videos_dir.mkdir(parents=True, exist_ok=True)
app.mount("/api/static", StaticFiles(directory=str(Path(__file__).parent / "static")), name="static")


# ━━━ Startup ━━━
@app.on_event("startup")
async def startup_tasks():
    from db_indexes import ensure_indexes
    from tasks import push_scheduler_loop, credit_refresh_loop
    from routes.plants import reset_plant_watering
    from routes.collective_resonance import resonance_aggregation_loop

    await ensure_indexes()
    await reset_plant_watering()
    asyncio.create_task(push_scheduler_loop())
    asyncio.create_task(credit_refresh_loop())
    asyncio.create_task(resonance_aggregation_loop())
    logger.info("Indexes verified, schedulers started")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
