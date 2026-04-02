"""
Starseed Energy Gates — Progression Checkpoints
Gates require polished gems, traded materials, consciousness level, time cooldowns,
and realm travel to unlock. Warp allows credit-based time skip.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
from routes.consciousness import get_consciousness, level_from_consciousness_xp, ACTIVITY_XP
import uuid

router = APIRouter(prefix="/energy-gates")

# Travel realms required per gate (user must have visited these app areas)
TRAVEL_REALMS = {
    "gate_earth": [],
    "gate_water": ["starseed_journey", "refinement_lab"],
    "gate_fire": ["starseed_journey", "refinement_lab", "cosmic_mixer"],
    "gate_air": ["starseed_journey", "refinement_lab", "cosmic_mixer", "dream_realms"],
    "gate_ether": ["starseed_journey", "refinement_lab", "cosmic_mixer", "dream_realms", "trade_circle"],
}

ENERGY_GATES = [
    {
        "id": "gate_earth",
        "name": "Gate of Earth",
        "element": "Earth",
        "frequency": 396,
        "color": "#D97706",
        "aura_glow": "rgba(217, 119, 6, 0.3)",
        "min_consciousness": 1,
        "requirements": {
            "polished_gems": 1,
            "dust_cost": 0,
            "trade_count": 0,
        },
        "time_lock_hours": 0,
        "travel_realms": TRAVEL_REALMS["gate_earth"],
        "warp_cost_credits": 0,
        "rewards": {"xp": 100, "dust": 25, "unlock": "starseed_earth_realm"},
        "description": "Ground your energy. Offer a polished gem to activate the Earth Gate.",
        "lore": "The first gate resonates at 396 Hz \u2014 the frequency of liberation. It strips away guilt and fear, anchoring you to the planet's core.",
    },
    {
        "id": "gate_water",
        "name": "Gate of Flow",
        "element": "Water",
        "frequency": 417,
        "color": "#F472B6",
        "aura_glow": "rgba(244, 114, 182, 0.3)",
        "min_consciousness": 2,
        "requirements": {
            "polished_gems": 3,
            "dust_cost": 50,
            "trade_count": 2,
        },
        "time_lock_hours": 4,
        "travel_realms": TRAVEL_REALMS["gate_water"],
        "warp_cost_credits": 2,
        "rewards": {"xp": 250, "dust": 50, "unlock": "starseed_water_realm"},
        "description": "Release resistance. Requires 3 polished gems, 2 completed trades, and 50 Dust.",
        "lore": "At 417 Hz the Water Gate dissolves crystallized patterns. Only those who've traded with others can pass \u2014 isolation blocks the flow.",
    },
    {
        "id": "gate_fire",
        "name": "Gate of Transmutation",
        "element": "Fire",
        "frequency": 528,
        "color": "#94A3B8",
        "aura_glow": "rgba(148, 163, 184, 0.35)",
        "min_consciousness": 3,
        "requirements": {
            "polished_gems": 5,
            "dust_cost": 150,
            "trade_count": 5,
        },
        "time_lock_hours": 12,
        "travel_realms": TRAVEL_REALMS["gate_fire"],
        "warp_cost_credits": 5,
        "rewards": {"xp": 500, "dust": 100, "unlock": "starseed_fire_realm"},
        "description": "Transform base metal to gold. Requires 5 polished gems, 5 trades, and 150 Dust.",
        "lore": "528 Hz \u2014 the Love frequency. The Fire Gate only opens for minds sharpened by the Forge. It transmutes knowledge into wisdom.",
    },
    {
        "id": "gate_air",
        "name": "Gate of the Unseen",
        "element": "Air",
        "frequency": 741,
        "color": "#8B5CF6",
        "aura_glow": "rgba(139, 92, 246, 0.35)",
        "min_consciousness": 4,
        "requirements": {
            "polished_gems": 8,
            "dust_cost": 300,
            "trade_count": 10,
        },
        "time_lock_hours": 24,
        "travel_realms": TRAVEL_REALMS["gate_air"],
        "warp_cost_credits": 10,
        "rewards": {"xp": 1000, "dust": 200, "unlock": "starseed_air_realm"},
        "description": "See beyond the veil. Requires 8 polished gems, 10 trades, and 300 Dust.",
        "lore": "741 Hz awakens intuition. The Air Gate reveals what the physical eyes cannot see \u2014 the threads connecting all consciousness.",
    },
    {
        "id": "gate_ether",
        "name": "Gate of Pure Source",
        "element": "Ether",
        "frequency": 963,
        "color": "#FBBF24",
        "aura_glow": "rgba(251, 191, 36, 0.45)",
        "min_consciousness": 5,
        "requirements": {
            "polished_gems": 12,
            "dust_cost": 500,
            "trade_count": 20,
        },
        "time_lock_hours": 48,
        "travel_realms": TRAVEL_REALMS["gate_ether"],
        "warp_cost_credits": 20,
        "rewards": {"xp": 2000, "dust": 500, "unlock": "starseed_source_realm"},
        "description": "Become the source. Requires 12 polished gems, 20 trades, and 500 Dust.",
        "lore": "963 Hz \u2014 the frequency of the crown. The Ether Gate dissolves the boundary between self and cosmos. You are no longer a visitor. You are the source.",
    },
]

GATE_MAP = {g["id"]: g for g in ENERGY_GATES}
GATE_ORDER = [g["id"] for g in ENERGY_GATES]


async def _get_user_gate_progress(user_id: str) -> dict:
    """Gather user's current resources relevant to gate unlocking."""
    u = await db.users.find_one(
        {"id": user_id},
        {"_id": 0, "user_dust_balance": 1, "consciousness": 1},
    )
    dust = (u or {}).get("user_dust_balance", 0)

    polished_count = await db.rpg_inventory.count_documents({
        "user_id": user_id,
        "state": "polished",
    })

    trade_count = await db.trade_circle_listings.count_documents({
        "seller_id": user_id,
        "status": "completed",
    })
    offer_count = await db.trade_circle_offers.count_documents({
        "$or": [
            {"buyer_id": user_id, "status": "accepted"},
            {"seller_id": user_id, "status": "accepted"},
        ]
    })

    gates_doc = await db.energy_gates.find_one({"user_id": user_id}, {"_id": 0})
    unlocked = (gates_doc or {}).get("unlocked", [])
    unlock_history = (gates_doc or {}).get("unlock_history", [])

    # Get travel log
    travel_doc = await db.energy_gate_travel.find_one({"user_id": user_id}, {"_id": 0})
    realms_visited = (travel_doc or {}).get("realms", [])

    c = (u or {}).get("consciousness", {})
    level = level_from_consciousness_xp(c.get("xp", 0))

    # Get user credits for warp cost display
    credits_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "credits": 1})
    credits_val = (credits_doc or {}).get("credits", 0)
    credits = credits_val.get("balance", 0) if isinstance(credits_val, dict) else credits_val if isinstance(credits_val, (int, float)) else 0

    return {
        "dust": dust,
        "polished_gems": polished_count,
        "trades_completed": trade_count + offer_count,
        "consciousness_level": level,
        "unlocked_gates": unlocked,
        "unlock_history": unlock_history,
        "realms_visited": realms_visited,
        "credits": credits,
    }


def _time_lock_remaining(unlock_history: list, gate_id: str) -> dict:
    """Check if a time lock is active for this gate based on previous gate unlock time."""
    gate_idx = GATE_ORDER.index(gate_id)
    if gate_idx == 0:
        return {"locked": False, "hours_remaining": 0, "unlocks_at": None}

    prev_gate_id = GATE_ORDER[gate_idx - 1]
    gate = GATE_MAP[gate_id]
    time_lock_hours = gate.get("time_lock_hours", 0)
    if time_lock_hours == 0:
        return {"locked": False, "hours_remaining": 0, "unlocks_at": None}

    # Find when previous gate was unlocked
    prev_unlock_time = None
    for entry in unlock_history:
        if entry.get("gate_id") == prev_gate_id:
            prev_unlock_time = entry.get("timestamp")
            break

    if not prev_unlock_time:
        return {"locked": True, "hours_remaining": time_lock_hours, "unlocks_at": None, "reason": "previous_gate_required"}

    unlock_dt = datetime.fromisoformat(prev_unlock_time)
    if unlock_dt.tzinfo is None:
        unlock_dt = unlock_dt.replace(tzinfo=timezone.utc)
    available_at = unlock_dt + timedelta(hours=time_lock_hours)
    now = datetime.now(timezone.utc)

    if now >= available_at:
        return {"locked": False, "hours_remaining": 0, "unlocks_at": available_at.isoformat()}

    remaining = (available_at - now).total_seconds() / 3600
    return {
        "locked": True,
        "hours_remaining": round(remaining, 1),
        "unlocks_at": available_at.isoformat(),
    }


@router.get("/status")
async def gates_status(user=Depends(get_current_user)):
    """Get all energy gates with user's progress toward each."""
    progress = await _get_user_gate_progress(user["id"])

    gates = []
    for gate in ENERGY_GATES:
        reqs = gate["requirements"]
        unlocked = gate["id"] in progress["unlocked_gates"]
        meets_consciousness = progress["consciousness_level"] >= gate["min_consciousness"]
        meets_gems = progress["polished_gems"] >= reqs["polished_gems"]
        meets_dust = progress["dust"] >= reqs["dust_cost"]
        meets_trades = progress["trades_completed"] >= reqs["trade_count"]

        # Travel check
        required_realms = gate.get("travel_realms", [])
        visited = progress["realms_visited"]
        missing_realms = [r for r in required_realms if r not in visited]
        meets_travel = len(missing_realms) == 0

        # Time lock check
        time_lock = _time_lock_remaining(progress["unlock_history"], gate["id"])
        meets_time = not time_lock["locked"]

        # Previous gate must be unlocked (sequential)
        gate_idx = GATE_ORDER.index(gate["id"])
        prev_unlocked = gate_idx == 0 or GATE_ORDER[gate_idx - 1] in progress["unlocked_gates"]

        can_unlock = (
            meets_consciousness and meets_gems and meets_dust
            and meets_trades and meets_travel and meets_time
            and prev_unlocked and not unlocked
        )

        gates.append({
            "id": gate["id"],
            "name": gate["name"],
            "element": gate["element"],
            "frequency": gate["frequency"],
            "color": gate["color"],
            "aura_glow": gate["aura_glow"],
            "min_consciousness": gate["min_consciousness"],
            "requirements": reqs,
            "time_lock_hours": gate.get("time_lock_hours", 0),
            "travel_realms": required_realms,
            "warp_cost_credits": gate.get("warp_cost_credits", 0),
            "rewards": gate["rewards"],
            "description": gate["description"],
            "lore": gate["lore"],
            "unlocked": unlocked,
            "can_unlock": can_unlock,
            "prev_unlocked": prev_unlocked,
            "progress": {
                "consciousness": {
                    "current": progress["consciousness_level"],
                    "required": gate["min_consciousness"],
                    "met": meets_consciousness,
                },
                "polished_gems": {
                    "current": progress["polished_gems"],
                    "required": reqs["polished_gems"],
                    "met": meets_gems,
                },
                "dust": {
                    "current": progress["dust"],
                    "required": reqs["dust_cost"],
                    "met": meets_dust,
                },
                "trades": {
                    "current": progress["trades_completed"],
                    "required": reqs["trade_count"],
                    "met": meets_trades,
                },
                "travel": {
                    "required": required_realms,
                    "visited": [r for r in required_realms if r in visited],
                    "missing": missing_realms,
                    "met": meets_travel,
                },
                "time_lock": time_lock,
            },
        })

    return {
        "gates": gates,
        "user_stats": {
            "dust": progress["dust"],
            "polished_gems": progress["polished_gems"],
            "trades_completed": progress["trades_completed"],
            "consciousness_level": progress["consciousness_level"],
            "realms_visited": progress["realms_visited"],
            "credits": progress["credits"],
        },
        "total_unlocked": len(progress["unlocked_gates"]),
        "total_gates": len(ENERGY_GATES),
    }


@router.post("/unlock")
async def unlock_gate(data: dict = Body(...), user=Depends(get_current_user)):
    """Unlock an energy gate by spending resources."""
    gate_id = data.get("gate_id", "")
    if gate_id not in GATE_MAP:
        raise HTTPException(400, f"Unknown gate: {gate_id}")

    gate = GATE_MAP[gate_id]
    user_id = user["id"]
    progress = await _get_user_gate_progress(user_id)

    if gate_id in progress["unlocked_gates"]:
        raise HTTPException(400, "Gate already unlocked")

    # Sequential check
    gate_idx = GATE_ORDER.index(gate_id)
    if gate_idx > 0 and GATE_ORDER[gate_idx - 1] not in progress["unlocked_gates"]:
        raise HTTPException(403, "Must unlock the previous gate first")

    if progress["consciousness_level"] < gate["min_consciousness"]:
        raise HTTPException(403, f"Requires Consciousness Level {gate['min_consciousness']}")

    reqs = gate["requirements"]

    if progress["polished_gems"] < reqs["polished_gems"]:
        raise HTTPException(400, f"Need {reqs['polished_gems']} polished gems (have {progress['polished_gems']})")

    if progress["dust"] < reqs["dust_cost"]:
        raise HTTPException(400, f"Need {reqs['dust_cost']} Dust (have {progress['dust']})")

    if progress["trades_completed"] < reqs["trade_count"]:
        raise HTTPException(400, f"Need {reqs['trade_count']} completed trades (have {progress['trades_completed']})")

    # Travel check
    required_realms = gate.get("travel_realms", [])
    missing = [r for r in required_realms if r not in progress["realms_visited"]]
    if missing:
        raise HTTPException(400, f"Must visit realms: {', '.join(missing)}")

    # Time lock check
    time_lock = _time_lock_remaining(progress["unlock_history"], gate_id)
    if time_lock["locked"]:
        raise HTTPException(400, f"Time lock active. {time_lock['hours_remaining']}h remaining. Use Warp to skip.")

    # Spend dust
    if reqs["dust_cost"] > 0:
        await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": -reqs["dust_cost"]}})

    # Consume polished gems
    gems_to_consume = reqs["polished_gems"]
    polished_items = await db.rpg_inventory.find(
        {"user_id": user_id, "state": "polished"}
    ).limit(gems_to_consume).to_list(gems_to_consume)
    for gem in polished_items:
        await db.rpg_inventory.delete_one({"_id": gem["_id"]})

    # Record gate unlock
    now = datetime.now(timezone.utc).isoformat()
    await db.energy_gates.update_one(
        {"user_id": user_id},
        {
            "$addToSet": {"unlocked": gate_id},
            "$push": {"unlock_history": {
                "$each": [{"gate_id": gate_id, "timestamp": now}],
                "$slice": -20,
            }},
            "$setOnInsert": {"user_id": user_id},
        },
        upsert=True,
    )

    # Grant rewards
    rewards = gate["rewards"]
    if rewards["dust"] > 0:
        await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": rewards["dust"]}})

    xp = rewards["xp"]
    await db.users.update_one({"id": user_id}, {
        "$inc": {"consciousness.xp": xp},
        "$push": {"consciousness.activity_log": {
            "$each": [{"activity": "gate_unlock", "xp": xp, "context": gate["name"], "timestamp": now}],
            "$slice": -50,
        }},
    })

    return {
        "unlocked": True,
        "gate": gate["name"],
        "element": gate["element"],
        "frequency": gate["frequency"],
        "rewards": {
            "xp_gained": xp,
            "dust_gained": rewards["dust"],
            "dust_spent": reqs["dust_cost"],
            "gems_consumed": reqs["polished_gems"],
            "realm_unlocked": rewards["unlock"],
        },
        "lore": gate["lore"],
    }


@router.post("/warp")
async def warp_gate(data: dict = Body(...), user=Depends(get_current_user)):
    """Spend credits to skip a gate's time lock."""
    gate_id = data.get("gate_id", "")
    if gate_id not in GATE_MAP:
        raise HTTPException(400, f"Unknown gate: {gate_id}")

    gate = GATE_MAP[gate_id]
    user_id = user["id"]
    progress = await _get_user_gate_progress(user_id)

    time_lock = _time_lock_remaining(progress["unlock_history"], gate_id)
    if not time_lock.get("locked"):
        raise HTTPException(400, "No time lock to warp through")

    if time_lock.get("reason") == "previous_gate_required":
        raise HTTPException(400, "Previous gate must be unlocked first")

    warp_cost = gate.get("warp_cost_credits", 0)
    if warp_cost <= 0:
        raise HTTPException(400, "This gate has no time lock")

    if progress["credits"] < warp_cost:
        raise HTTPException(400, f"Need {warp_cost} credits (have {progress['credits']})")

    # Deduct credits
    from routes.marketplace import modify_credits
    await modify_credits(user_id, -warp_cost, f"warp_gate:{gate_id}")

    # Remove the time lock by backdating the previous gate's unlock
    gate_idx = GATE_ORDER.index(gate_id)
    prev_gate_id = GATE_ORDER[gate_idx - 1]
    backdate = (datetime.now(timezone.utc) - timedelta(hours=gate["time_lock_hours"] + 1)).isoformat()

    await db.energy_gates.update_one(
        {"user_id": user_id, "unlock_history.gate_id": prev_gate_id},
        {"$set": {"unlock_history.$.timestamp": backdate}},
    )

    return {
        "warped": True,
        "gate_id": gate_id,
        "credits_spent": warp_cost,
        "message": f"Time lock bypassed for {gate['name']}. You may now attempt to unlock it.",
    }


@router.post("/travel")
async def record_travel(data: dict = Body(...), user=Depends(get_current_user)):
    """Record that a user visited a realm (called from frontend on page visit)."""
    realm = data.get("realm", "")
    valid_realms = set()
    for r_list in TRAVEL_REALMS.values():
        valid_realms.update(r_list)

    if realm not in valid_realms:
        raise HTTPException(400, f"Unknown realm: {realm}")

    now = datetime.now(timezone.utc).isoformat()
    await db.energy_gate_travel.update_one(
        {"user_id": user["id"]},
        {
            "$addToSet": {"realms": realm},
            "$set": {f"visited_at.{realm}": now},
            "$setOnInsert": {"user_id": user["id"]},
        },
        upsert=True,
    )

    return {"recorded": True, "realm": realm}


@router.get("/travel-log")
async def get_travel_log(user=Depends(get_current_user)):
    """Get user's realm travel log."""
    doc = await db.energy_gate_travel.find_one({"user_id": user["id"]}, {"_id": 0})
    all_realms = set()
    for r_list in TRAVEL_REALMS.values():
        all_realms.update(r_list)

    visited = (doc or {}).get("realms", [])
    return {
        "realms_visited": visited,
        "all_realms": sorted(all_realms),
        "total_visited": len(visited),
        "total_realms": len(all_realms),
    }


@router.get("/history")
async def gate_history(user=Depends(get_current_user)):
    """Get user's gate unlock history."""
    doc = await db.energy_gates.find_one({"user_id": user["id"]}, {"_id": 0})
    return {
        "unlocked": (doc or {}).get("unlocked", []),
        "history": (doc or {}).get("unlock_history", []),
    }
