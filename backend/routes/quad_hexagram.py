from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/quad-hex", tags=["Quadruple Hexagram Engine"])

# ─── Phase Modes (Adaptive Omni-Key) ───
PHASE_MODES = {
    "harmonic": {
        "id": "harmonic",
        "name": "Harmonic",
        "description": "Resonance-based filtering for wellness atmosphere",
        "trigger": "low_activity",
        "line1_key": "resonance_variance",
    },
    "fractal": {
        "id": "fractal",
        "name": "Fractal",
        "description": "Structural symmetry analysis for high-traffic events",
        "trigger": "high_traffic",
        "line1_key": "structural_symmetry",
    },
    "elemental": {
        "id": "elemental",
        "name": "Elemental",
        "description": "Binary hard-lock grounding for defensive posture",
        "trigger": "security_alert",
        "line1_key": "grounding_lock",
    },
}

DUST_TO_GEM_RATIO = 100
RETURN_TAX_PERCENT = 30
HARMONY_COMMERCE_FEE = 2


async def detect_phase(user_id: str) -> str:
    """Super-Observer: scan platform telemetry to determine active phase."""
    active_mutes = await db.sentinel_mutes.count_documents({"active": True})
    violation_count = await db.sentinel_log.count_documents({})
    if active_mutes >= 2 or violation_count >= 10:
        return "elemental"

    recent_cutoff = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
    recent_posts = await db.feed_posts.count_documents(
        {"created_at": {"$gte": recent_cutoff}}
    )
    if recent_posts >= 20:
        return "fractal"

    return "harmonic"


async def resolve_security(user_id: str, phase: str) -> list:
    """Hexagram 1: Security/Sentinel — Lines 1-6."""
    lines = [0] * 6
    if phase == "harmonic":
        v = await db.sentinel_log.count_documents({"user_id": user_id})
        lines[0] = 1 if v == 0 else 0
    elif phase == "fractal":
        p = await db.class_profiles.find_one({"user_id": user_id})
        lines[0] = 1 if p else 0
    else:
        m = await db.sentinel_mutes.find_one({"user_id": user_id, "active": True})
        lines[0] = 0 if m else 1

    lines[1] = 1 if await db.users.find_one({"id": user_id}) else 0
    lines[2] = 1 if await db.class_profiles.find_one({"user_id": user_id}) else 0
    m = await db.sentinel_mutes.find_one({"user_id": user_id, "active": True})
    lines[3] = 0 if m else 1
    lines[4] = 1 if await db.identity_settings.find_one({"user_id": user_id}) else 0
    lines[5] = 1 if await db.feed_posts.count_documents({"user_id": user_id}) > 0 else 0
    return lines


async def resolve_location(user_id: str) -> list:
    """Hexagram 2: Location/Cosmic Map — Lines 7-12."""
    lines = [0] * 6
    lines[0] = 1 if await db.hub_wallets.find_one({"user_id": user_id}) else 0
    presence = await db.feed_presence.count_documents({"user_id": user_id})
    lines[1] = 1 if presence > 0 else 0
    lines[2] = 1 if await db.constellations.count_documents({"creator_id": user_id}) > 0 else 0
    lines[3] = 1 if presence >= 2 else 0
    lines[4] = 1 if await db.harmony_scores.count_documents({"user_id": user_id}) > 0 else 0
    lines[5] = 1 if await db.constellations.count_documents({"creator_id": user_id, "likes": {"$gt": 0}}) > 0 else 0
    return lines


async def resolve_finance(user_id: str) -> list:
    """Hexagram 3: Finance/Central Hub — Lines 13-18."""
    lines = [0] * 6
    wallet = await db.hub_wallets.find_one({"user_id": user_id}, {"_id": 0})
    lines[0] = 1 if wallet and wallet.get("dust", 0) > 0 else 0
    lines[1] = 1 if wallet and wallet.get("total_dust_earned", 0) > 0 else 0
    lines[2] = 1 if wallet and wallet.get("gems", 0) > 0 else 0
    lines[3] = 1 if await db.hub_ledger.count_documents({"user_id": user_id, "type": {"$in": ["trade_out", "transfer_out"]}}) > 0 else 0
    lines[4] = 1 if await db.broker_escrow.count_documents({"$or": [{"initiator_id": user_id}, {"target_id": user_id}]}) > 0 else 0
    lines[5] = 1 if await db.hub_ledger.count_documents({"user_id": user_id, "type": {"$in": ["trade_in", "transfer_in"]}}) > 0 else 0
    return lines


async def resolve_evolution(user_id: str) -> list:
    """Hexagram 4: Evolution/The Forge — Lines 19-24."""
    lines = [0] * 6
    lines[0] = 1 if await db.mastery_records.count_documents({"user_id": user_id}) > 0 else 0
    streak = await db.resonance_streaks.find_one({"user_id": user_id}, {"_id": 0})
    lines[1] = 1 if streak and streak.get("current_streak", 0) >= 3 else 0
    lines[2] = 1 if await db.constellations.count_documents({"creator_id": user_id, "synergies": {"$exists": True, "$ne": []}}) > 0 else 0
    popular = await db.constellations.find_one({"creator_id": user_id, "load_count": {"$gte": 3}}, {"_id": 0})
    lines[3] = 1 if popular else 0
    lines[4] = 1 if await db.transmutation_log.count_documents({"user_id": user_id}) > 0 else 0
    exit_taxes = await db.transactions.count_documents({"from_id": user_id, "type": "return_tax"})
    lines[5] = 1 if exit_taxes == 0 else 0
    return lines


@router.post("/resolve")
async def resolve_state_vector(body: dict = None, user=Depends(get_current_user)):
    """Generate the full 24-bit State Vector for the current user."""
    phase = await detect_phase(user["id"])

    hex1 = await resolve_security(user["id"], phase)
    hex2 = await resolve_location(user["id"])
    hex3 = await resolve_finance(user["id"])
    hex4 = await resolve_evolution(user["id"])

    all_lines = hex1 + hex2 + hex3 + hex4
    binary_string = ''.join(str(b) for b in all_lines)
    state_integer = int(binary_string, 2)
    alignment = sum(all_lines) / 24.0

    result = {
        "state_vector": state_integer,
        "binary": binary_string,
        "alignment_score": round(alignment, 4),
        "phase_mode": phase,
        "phase_data": PHASE_MODES[phase],
        "hexagrams": {
            "security": {"lines": hex1, "score": round(sum(hex1) / 6, 4)},
            "location": {"lines": hex2, "score": round(sum(hex2) / 6, 4)},
            "finance": {"lines": hex3, "score": round(sum(hex3) / 6, 4)},
            "evolution": {"lines": hex4, "score": round(sum(hex4) / 6, 4)},
        },
        "total_aligned": sum(all_lines),
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.hexagram_states.update_one(
        {"user_id": user["id"]},
        {"$set": {"user_id": user["id"], **result}},
        upsert=True,
    )
    return result


@router.post("/quad-scan")
async def quad_scan(body: dict, user=Depends(get_current_user)):
    """Run the 24-line quad-scan for a P2P transaction."""
    target_user_id = body.get("target_user_id")
    if not target_user_id:
        raise HTTPException(400, "target_user_id required")
    if target_user_id == user["id"]:
        raise HTTPException(400, "Cannot scan against yourself")

    phase = await detect_phase(user["id"])
    i_sec = await resolve_security(user["id"], phase)
    i_fin = await resolve_finance(user["id"])
    t_sec = await resolve_security(target_user_id, phase)
    t_fin = await resolve_finance(target_user_id)

    sec_total = sum(i_sec) + sum(t_sec)
    fin_total = sum(i_fin) + sum(t_fin)
    sec_pass = sec_total >= 8
    fin_pass = fin_total >= 4

    return {
        "cleared": sec_pass and fin_pass,
        "phase_mode": phase,
        "initiator": {"security": sum(i_sec), "finance": sum(i_fin)},
        "target": {"security": sum(t_sec), "finance": sum(t_fin)},
        "checks": {
            "security": {"pass": sec_pass, "combined": sec_total, "required": 8},
            "finance": {"pass": fin_pass, "combined": fin_total, "required": 4},
        },
        "scanned_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/phase")
async def get_current_phase(user=Depends(get_current_user)):
    """Get the current platform phase mode determined by the Super-Observer."""
    phase = await detect_phase(user["id"])
    return {"phase": phase, **PHASE_MODES[phase]}


@router.get("/state")
async def get_cached_state(user=Depends(get_current_user)):
    """Get the most recently resolved state vector."""
    state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})
    if not state:
        raise HTTPException(404, "No state vector resolved yet")
    return state
