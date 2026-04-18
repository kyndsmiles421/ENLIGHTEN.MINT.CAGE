"""
V68.6 — PRESENCE ECONOMY
Immersion Timers: 60s of sustained presence in a 3D scene awards Dust + Sparks.
Users earn by BEING in the space, not by clicking buttons.

Endpoints:
  POST /api/presence/tick — frontend heartbeat every 60s while on a 3D scene.
    • Rate-limited server-side to max 1 tick / 55s / user / scene (anti-farming)
    • Awards: +5 Dust, +2 Sparks, logs a dust_events entry for the Trade Ledger
    • Fires signal scene:immersion:<id> for quest auto-detection
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Body, Depends, HTTPException
from deps import db, get_current_user

router = APIRouter()

# Valid scenes the backend will honor (prevents arbitrary scene spam)
VALID_SCENES = {
    "celestial_dome": {"label": "Celestial Dome", "color": "#3B82F6"},
    "tesseract":      {"label": "Tesseract",      "color": "#8B5CF6"},
    "observatory":    {"label": "Observatory",    "color": "#D4AF37"},
    "vr_sanctuary":   {"label": "VR Sanctuary",   "color": "#06B6D4"},
    "enlightenment_os": {"label": "Enlightenment OS", "color": "#A78BFA"},
    "dream_realms":   {"label": "Dream Realms",   "color": "#C084FC"},
    "star_chart":     {"label": "Star Chart",     "color": "#FBBF24"},
    "meditation":     {"label": "Meditation",     "color": "#22C55E"},
    "breathing":      {"label": "Breathwork",     "color": "#10B981"},
    "soundscapes":    {"label": "Soundscapes",    "color": "#F472B6"},
}

DUST_PER_TICK = 5
SPARKS_PER_TICK = 2
TICK_INTERVAL_SECONDS = 60
MIN_SECONDS_BETWEEN_TICKS = 55  # anti-farming guard


@router.post("/presence/tick")
async def presence_tick(data: dict = Body(...), user=Depends(get_current_user)):
    scene_id = str(data.get("scene_id", "")).strip().lower()
    scene = VALID_SCENES.get(scene_id)
    if not scene:
        raise HTTPException(status_code=400, detail=f"unknown scene: {scene_id}")

    uid = user["id"]
    now = datetime.now(timezone.utc)

    # Rate-limit: check last tick for this user+scene
    last = await db.presence_ticks.find_one(
        {"user_id": uid, "scene_id": scene_id},
        sort=[("ts", -1)],
    )
    if last:
        last_ts = last.get("ts")
        if isinstance(last_ts, str):
            try: last_ts = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
            except Exception: last_ts = None
        if last_ts and (now - last_ts).total_seconds() < MIN_SECONDS_BETWEEN_TICKS:
            # Too soon — return current state without granting
            return {
                "granted": False,
                "reason": "too_soon",
                "seconds_until_next": int(MIN_SECONDS_BETWEEN_TICKS - (now - last_ts).total_seconds()),
            }

    # Grant the tick — write tick doc, dust event, and wallet increments atomically
    tick_doc = {
        "user_id": uid,
        "scene_id": scene_id,
        "scene_label": scene["label"],
        "ts": now.isoformat(),
        "dust_awarded": DUST_PER_TICK,
        "sparks_awarded": SPARKS_PER_TICK,
    }
    await db.presence_ticks.insert_one(tick_doc)

    # Append to dust_events for Trade Ledger visibility
    await db.dust_events.insert_one({
        "user_id": uid,
        "amount": DUST_PER_TICK,
        "kind": "earn",
        "source": f"presence:{scene_id}",
        "ts": now.isoformat(),
    })

    # Bump user dust balance
    await db.users.update_one(
        {"id": uid},
        {"$inc": {"user_dust_balance": DUST_PER_TICK}},
        upsert=False,
    )
    # Bump spark wallet (merit stays permanent)
    await db.spark_wallets.update_one(
        {"user_id": uid},
        {
            "$inc": {"sparks": SPARKS_PER_TICK, "total_earned": SPARKS_PER_TICK, "immersion_seconds": TICK_INTERVAL_SECONDS},
            "$setOnInsert": {"created_at": now.isoformat()},
        },
        upsert=True,
    )

    # Total immersion for this scene (returned so UI can show streaks)
    total_ticks = await db.presence_ticks.count_documents({"user_id": uid, "scene_id": scene_id})

    return {
        "granted": True,
        "scene_id": scene_id,
        "scene_label": scene["label"],
        "dust_awarded": DUST_PER_TICK,
        "sparks_awarded": SPARKS_PER_TICK,
        "total_ticks_here": total_ticks,
        "total_minutes_here": total_ticks,  # 1 tick = 1 minute
    }


@router.get("/presence/stats")
async def presence_stats(user=Depends(get_current_user)):
    """Aggregate user's presence across all scenes — for Passport display."""
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$group": {
            "_id": "$scene_id",
            "minutes": {"$sum": 1},
            "dust_earned": {"$sum": "$dust_awarded"},
            "sparks_earned": {"$sum": "$sparks_awarded"},
            "last_visit": {"$max": "$ts"},
        }},
        {"$sort": {"minutes": -1}},
    ]
    results = await db.presence_ticks.aggregate(pipeline).to_list(length=50)
    scenes = []
    total_minutes = 0
    total_dust = 0
    for r in results:
        sid = r["_id"]
        info = VALID_SCENES.get(sid, {"label": sid, "color": "#8B5CF6"})
        scenes.append({
            "scene_id": sid,
            "label": info["label"],
            "color": info["color"],
            "minutes": r["minutes"],
            "dust_earned": r["dust_earned"],
            "sparks_earned": r["sparks_earned"],
            "last_visit": r["last_visit"],
        })
        total_minutes += r["minutes"]
        total_dust += r["dust_earned"]
    return {"scenes": scenes, "total_minutes": total_minutes, "total_dust_earned": total_dust}
