"""
V68.4 Phase D — SOVEREIGN UNIVERSE INTERCONNECT
Single diagnostic endpoint so the frontend kernel (window.SovereignUniverse)
can fetch everything it needs in ONE round-trip if desired.

The heavy-lifting endpoints already exist:
  /api/sparks/wallet   /api/quests/available   /api/quests/auto_detect
This file just adds a convenience aggregate + signal debug log.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user
from routes.sparks import get_spark_wallet, GAMING_CARDS
from routes.quests import QUESTS

router = APIRouter()


@router.get("/universe/state")
async def get_universe_state(user=Depends(get_current_user)):
    """Aggregate: wallet + quests progress — one round-trip for the Hub."""
    wallet = await get_spark_wallet(user["id"], user.get("role", "user"))
    sparks = wallet["sparks"]
    earned_ids = {c["id"] for c in GAMING_CARDS if sparks >= c["spark_threshold"]}
    for ce in wallet.get("cards_earned", []):
        cid = ce.get("card_id") if isinstance(ce, dict) else None
        if cid:
            earned_ids.add(cid)
    earned_cards = [c for c in GAMING_CARDS if c["id"] in earned_ids]
    next_card = next((c for c in GAMING_CARDS if c["id"] not in earned_ids), None)

    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    quests_out = []
    for q in QUESTS:
        qp = progress.get("quests", {}).get(q["id"], {})
        done_steps = qp.get("completed_steps", [])
        steps = [
            {"id": s["id"], "action": s["action"], "target": s.get("target"), "done": s["id"] in done_steps}
            for s in q["steps"]
        ]
        quests_out.append({
            "id": q["id"], "name": q["name"], "desc": q["desc"], "hint": q["hint"],
            "color": q["color"], "domain_bridge": q["domain_bridge"],
            "reward_sparks": q["reward_sparks"], "steps": steps,
            "completed": qp.get("completed", False),
            "progress": (len(done_steps) / len(q["steps"])) if q["steps"] else 0,
        })
    return {
        "sparks": sparks,
        "total_earned": wallet["total_earned"],
        "cards_earned": earned_cards,
        "cards_total": len(GAMING_CARDS),
        "next_card": next_card,
        "quests": quests_out,
        "immersion_minutes": wallet.get("immersion_seconds", 0) // 60,
        "ts": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/universe/signal")
async def log_signal(data: dict = Body(...), user=Depends(get_current_user)):
    """Lightweight signal breadcrumb — kept in users' personal trail for UX analytics."""
    signal = str(data.get("signal", ""))[:120]
    location = str(data.get("location") or "")[:64]
    if not signal:
        return {"logged": False}
    await db.universe_signals.insert_one({
        "user_id": user["id"],
        "signal": signal,
        "location": location,
        "ts": datetime.now(timezone.utc).isoformat(),
    })
    return {"logged": True}
