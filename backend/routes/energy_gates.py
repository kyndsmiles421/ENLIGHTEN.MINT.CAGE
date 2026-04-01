"""
Starseed Energy Gates — Progression Checkpoints
Gates require polished gems, traded materials, and consciousness level to unlock.
Each gate grants access to new Starseed content and consciousness XP.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from routes.consciousness import get_consciousness, level_from_consciousness_xp, ACTIVITY_XP
import uuid

router = APIRouter(prefix="/energy-gates")

ENERGY_GATES = [
    {
        "id": "gate_earth",
        "name": "Gate of Earth",
        "element": "Earth",
        "frequency": 396,
        "color": "#D97706",
        "min_consciousness": 1,
        "requirements": {
            "polished_gems": 1,
            "dust_cost": 0,
            "trade_count": 0,
        },
        "rewards": {"xp": 100, "dust": 25, "unlock": "starseed_earth_realm"},
        "description": "Ground your energy. Offer a polished gem to activate the Earth Gate.",
        "lore": "The first gate resonates at 396 Hz — the frequency of liberation. It strips away guilt and fear, anchoring you to the planet's core.",
    },
    {
        "id": "gate_water",
        "name": "Gate of Flow",
        "element": "Water",
        "frequency": 417,
        "color": "#F472B6",
        "min_consciousness": 2,
        "requirements": {
            "polished_gems": 3,
            "dust_cost": 50,
            "trade_count": 2,
        },
        "rewards": {"xp": 250, "dust": 50, "unlock": "starseed_water_realm"},
        "description": "Release resistance. Requires 3 polished gems, 2 completed trades, and 50 Dust.",
        "lore": "At 417 Hz the Water Gate dissolves crystallized patterns. Only those who've traded with others can pass — isolation blocks the flow.",
    },
    {
        "id": "gate_fire",
        "name": "Gate of Transmutation",
        "element": "Fire",
        "frequency": 528,
        "color": "#94A3B8",
        "min_consciousness": 3,
        "requirements": {
            "polished_gems": 5,
            "dust_cost": 150,
            "trade_count": 5,
        },
        "rewards": {"xp": 500, "dust": 100, "unlock": "starseed_fire_realm"},
        "description": "Transform base metal to gold. Requires 5 polished gems, 5 trades, and 150 Dust.",
        "lore": "528 Hz — the Love frequency. The Fire Gate only opens for minds sharpened by the Forge. It transmutes knowledge into wisdom.",
    },
    {
        "id": "gate_air",
        "name": "Gate of the Unseen",
        "element": "Air",
        "frequency": 741,
        "color": "#8B5CF6",
        "min_consciousness": 4,
        "requirements": {
            "polished_gems": 8,
            "dust_cost": 300,
            "trade_count": 10,
        },
        "rewards": {"xp": 1000, "dust": 200, "unlock": "starseed_air_realm"},
        "description": "See beyond the veil. Requires 8 polished gems, 10 trades, and 300 Dust.",
        "lore": "741 Hz awakens intuition. The Air Gate reveals what the physical eyes cannot see — the threads connecting all consciousness.",
    },
    {
        "id": "gate_ether",
        "name": "Gate of Pure Source",
        "element": "Ether",
        "frequency": 963,
        "color": "#FBBF24",
        "min_consciousness": 5,
        "requirements": {
            "polished_gems": 12,
            "dust_cost": 500,
            "trade_count": 20,
        },
        "rewards": {"xp": 2000, "dust": 500, "unlock": "starseed_source_realm"},
        "description": "Become the source. Requires 12 polished gems, 20 trades, and 500 Dust.",
        "lore": "963 Hz — the frequency of the crown. The Ether Gate dissolves the boundary between self and cosmos. You are no longer a visitor. You are the source.",
    },
]

GATE_MAP = {g["id"]: g for g in ENERGY_GATES}


async def _get_user_gate_progress(user_id: str) -> dict:
    """Gather user's current resources relevant to gate unlocking."""
    u = await db.users.find_one(
        {"id": user_id},
        {"_id": 0, "user_dust_balance": 1, "consciousness": 1},
    )
    dust = (u or {}).get("user_dust_balance", 0)

    # Count polished gems in inventory
    polished_count = await db.rpg_inventory.count_documents({
        "user_id": user_id,
        "state": "polished",
    })

    # Count completed trades
    trade_count = await db.trade_circle_listings.count_documents({
        "seller_id": user_id,
        "status": "completed",
    })
    # Also count accepted offers
    offer_count = await db.trade_circle_offers.count_documents({
        "$or": [
            {"buyer_id": user_id, "status": "accepted"},
            {"seller_id": user_id, "status": "accepted"},
        ]
    })

    # Get unlocked gates
    gates_doc = await db.energy_gates.find_one({"user_id": user_id}, {"_id": 0})
    unlocked = (gates_doc or {}).get("unlocked", [])

    c = (u or {}).get("consciousness", {})
    level = level_from_consciousness_xp(c.get("xp", 0))

    return {
        "dust": dust,
        "polished_gems": polished_count,
        "trades_completed": trade_count + offer_count,
        "consciousness_level": level,
        "unlocked_gates": unlocked,
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
        can_unlock = meets_consciousness and meets_gems and meets_dust and meets_trades and not unlocked

        gates.append({
            **gate,
            "unlocked": unlocked,
            "can_unlock": can_unlock,
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
            },
        })

    return {
        "gates": gates,
        "user_stats": progress,
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

    # Already unlocked?
    if gate_id in progress["unlocked_gates"]:
        raise HTTPException(400, "Gate already unlocked")

    # Check consciousness
    if progress["consciousness_level"] < gate["min_consciousness"]:
        raise HTTPException(403, f"Requires Consciousness Level {gate['min_consciousness']}")

    reqs = gate["requirements"]

    # Check gems
    if progress["polished_gems"] < reqs["polished_gems"]:
        raise HTTPException(400, f"Need {reqs['polished_gems']} polished gems (have {progress['polished_gems']})")

    # Check dust
    if progress["dust"] < reqs["dust_cost"]:
        raise HTTPException(400, f"Need {reqs['dust_cost']} Dust (have {progress['dust']})")

    # Check trades
    if progress["trades_completed"] < reqs["trade_count"]:
        raise HTTPException(400, f"Need {reqs['trade_count']} completed trades (have {progress['trades_completed']})")

    # Spend dust
    if reqs["dust_cost"] > 0:
        await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": -reqs["dust_cost"]}})

    # Consume polished gems from inventory
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

    # Grant consciousness XP
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


@router.get("/history")
async def gate_history(user=Depends(get_current_user)):
    """Get user's gate unlock history."""
    doc = await db.energy_gates.find_one({"user_id": user["id"]}, {"_id": 0})
    return {
        "unlocked": (doc or {}).get("unlocked", []),
        "history": (doc or {}).get("unlock_history", []),
    }
