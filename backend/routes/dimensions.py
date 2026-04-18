"""
Dimensional Space — The "Demens" Grid.
Intersects Planetary Depth (4 layers) with Dimensional Frequency (3D/4D/5D)
to create a 12-cell multiverse matrix.

Dimensions:
  3D (Physical)  — Linear Time / Solid Matter, standard GPS, 432 Hz
  4D (Astral)    — Non-Linear / Superposition, Shadow Sprites, time-bending
  5D (Causal)    — Entanglement / Unity, shared consciousness, Circle/Coven

Phase-Shifting:
  Users shift dimensions at GPS Hotspots by tuning vibrational frequency.
  The "Observer" trigger collapses the dimensional state.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
from routes.consciousness import level_from_consciousness_xp
import hashlib
import math
import random
import uuid

router = APIRouter(prefix="/dimensions")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DIMENSIONAL DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DIMENSIONS = [
    {
        "id": "3d",
        "name": "3D — Physical",
        "subtitle": "Linear Time / Solid Matter",
        "frequency": 3,
        "color": "#D97706",
        "glow": "rgba(217, 119, 6, 0.2)",
        "key_attribute": "Linear Time / Solid Matter",
        "description": "The standard plane of existence. Operates on linear GPS and standard resonance. Objects behave according to classical physics.",
        "mechanics": ["Standard GPS navigation", "Linear quest progression", "Physical resource gathering"],
        "consciousness_required": 1,
    },
    {
        "id": "4d",
        "name": "4D — Astral",
        "subtitle": "Non-Linear / Superposition",
        "frequency": 4,
        "color": "#8B5CF6",
        "glow": "rgba(139, 92, 246, 0.2)",
        "key_attribute": "Non-Linear / Superposition",
        "description": "The plane of superposition. Shadow Sprites exist in multi-state forms. Time is non-linear — past and future quests can overlap.",
        "mechanics": ["Shadow Sprite observation", "Non-linear quest states", "Time-folded exploration"],
        "consciousness_required": 2,
    },
    {
        "id": "5d",
        "name": "5D — Causal",
        "subtitle": "Entanglement / Unity",
        "frequency": 5,
        "color": "#FBBF24",
        "glow": "rgba(251, 191, 36, 0.25)",
        "key_attribute": "Entanglement / Unity",
        "description": "The plane of unity consciousness. Entanglement Bonds transcend distance. Actions ripple across all connected players instantaneously.",
        "mechanics": ["Entanglement Bonds active", "Synchronicity Events", "Collective consciousness access"],
        "consciousness_required": 3,
    },
]

DIMENSION_MAP = {d["id"]: d for d in DIMENSIONS}

DEPTH_LAYERS = ["crust", "mantle", "outer_core", "hollow_earth"]

# The 12-cell multiverse grid
GRID_CELLS = []
for depth in DEPTH_LAYERS:
    for dim in DIMENSIONS:
        GRID_CELLS.append({
            "cell_id": f"{depth}_{dim['id']}",
            "depth": depth,
            "dimension": dim["id"],
            "dimension_name": dim["name"],
        })


def _haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/grid")
async def get_dimensional_grid(user=Depends(get_current_user)):
    """
    Returns the full 12-cell multiverse grid with the user's
    current position on both axes.
    """
    uid = user["id"]
    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current_depth = (depth_doc or {}).get("current_layer", "crust")

    dim_doc = await db.dimensional_state.find_one({"user_id": uid}, {"_id": 0})
    current_dim = (dim_doc or {}).get("current_dimension", "3d")
    total_shifts = (dim_doc or {}).get("total_shifts", 0)

    grid = []
    for cell_def in GRID_CELLS:
        dim = DIMENSION_MAP[cell_def["dimension"]]
        depth_reqs = {"crust": 1, "mantle": 2, "outer_core": 3, "hollow_earth": 4}
        accessible = level >= dim["consciousness_required"] and level >= depth_reqs.get(cell_def["depth"], 1)
        is_current = cell_def["depth"] == current_depth and cell_def["dimension"] == current_dim

        grid.append({
            **cell_def,
            "accessible": accessible,
            "is_current": is_current,
            "color": dim["color"],
        })

    return {
        "grid": grid,
        "dimensions": DIMENSIONS,
        "current_position": {
            "depth": current_depth,
            "dimension": current_dim,
            "cell_id": f"{current_depth}_{current_dim}",
        },
        "consciousness_level": level,
        "total_shifts": total_shifts,
        "grid_size": {"depths": 4, "dimensions": 3, "total_cells": 12},
    }


@router.post("/phase-shift")
async def phase_shift(
    target_dimension: str = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """
    Phase-shift between dimensions (3D/4D/5D).
    Requires consciousness level and costs Cosmic Dust.
    """
    uid = user["id"]
    if target_dimension not in DIMENSION_MAP:
        raise HTTPException(400, f"Unknown dimension: {target_dimension}")

    target = DIMENSION_MAP[target_dimension]

    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1, "user_dust_balance": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)
    dust = (u or {}).get("user_dust_balance", 0)

    if level < target["consciousness_required"]:
        raise HTTPException(403, f"Requires consciousness level {target['consciousness_required']}")

    dim_doc = await db.dimensional_state.find_one({"user_id": uid}, {"_id": 0})
    current = (dim_doc or {}).get("current_dimension", "3d")

    if current == target_dimension:
        raise HTTPException(400, "Already in this dimension")

    # Cost: shifting up = 30 dust per dimension jump, down = free
    current_freq = DIMENSION_MAP.get(current, DIMENSIONS[0])["frequency"]
    target_freq = target["frequency"]
    shifting_up = target_freq > current_freq
    cost = abs(target_freq - current_freq) * 30 if shifting_up else 0

    if dust < cost:
        raise HTTPException(400, f"Need {cost} Cosmic Dust (have {dust})")

    now = datetime.now(timezone.utc).isoformat()

    if cost > 0:
        await db.users.update_one({"id": uid}, {"$inc": {"user_dust_balance": -cost}})
        # V68.7 — Trade Ledger dust event (spend)
        await db.dust_events.insert_one({
            "user_id": uid, "amount": -cost, "kind": "spend",
            "source": f"dimensions:phase_shift:{target_dimension}", "ts": now,
        })

    shift_entry = {
        "id": str(uuid.uuid4())[:8],
        "from_dimension": current,
        "to_dimension": target_dimension,
        "dust_cost": cost,
        "timestamp": now,
    }

    await db.dimensional_state.update_one(
        {"user_id": uid},
        {
            "$set": {
                "user_id": uid,
                "current_dimension": target_dimension,
                "last_shift": now,
            },
            "$push": {"shift_history": shift_entry},
            "$inc": {"total_shifts": 1},
        },
        upsert=True,
    )

    # XP for phase-shifting
    xp_reward = target_freq * 10
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "phase_shift",
                    "xp": xp_reward,
                    "from": current,
                    "to": target_dimension,
                    "timestamp": now,
                }
            },
        },
    )

    return {
        "success": True,
        "shift": {
            "from_dimension": current,
            "to_dimension": target_dimension,
            "dust_cost": cost,
            "direction": "ascending" if shifting_up else "descending",
        },
        "new_state": {
            "dimension": target_dimension,
            "dimension_info": target,
            "dust_remaining": dust - cost,
        },
        "rewards": {"xp": xp_reward},
        "message": f"Phase-shifted to {target['name']}. {target['key_attribute']}.",
    }


@router.get("/status")
async def get_dimensional_status(user=Depends(get_current_user)):
    """Get current dimensional position and shift history."""
    uid = user["id"]
    dim_doc = await db.dimensional_state.find_one({"user_id": uid}, {"_id": 0})

    current = (dim_doc or {}).get("current_dimension", "3d")
    dim_info = DIMENSION_MAP.get(current, DIMENSIONS[0])

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current_depth = (depth_doc or {}).get("current_layer", "crust")

    return {
        "current_dimension": current,
        "dimension_info": dim_info,
        "current_depth": current_depth,
        "cell_id": f"{current_depth}_{current}",
        "total_shifts": (dim_doc or {}).get("total_shifts", 0),
        "shift_history": (dim_doc or {}).get("shift_history", [])[-10:],
    }


@router.get("/collective-shadow-map")
async def get_collective_shadow_map(user=Depends(get_current_user)):
    """
    Global aggregate heatmap of all players' collapsed Shadow Sprites.
    Visualizes the Collective Unconscious being mapped in real-time.
    """
    # Aggregate all collapsed shadows across all users
    pipeline = [
        {"$unwind": "$collapsed"},
        {"$group": {
            "_id": {
                "lat_bucket": {"$round": [{"$ifNull": ["$collapsed.lat", 0]}, 2]},
                "lng_bucket": {"$round": [{"$ifNull": ["$collapsed.lng", 0]}, 2]},
            },
            "count": {"$sum": 1},
            "total_dust": {"$sum": {"$ifNull": ["$collapsed.dust_earned", 0]}},
            "rarities": {"$push": "$collapsed.rarity"},
            "latest": {"$max": "$collapsed.timestamp"},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 100},
    ]

    cursor = db.quantum_shadows.aggregate(pipeline)
    clusters = await cursor.to_list(length=100)

    # Global stats
    total_doc = await db.quantum_shadows.aggregate([
        {"$group": {
            "_id": None,
            "total_collapsed": {"$sum": "$total_collapsed"},
            "total_dust": {"$sum": "$total_dust"},
            "player_count": {"$sum": 1},
        }}
    ]).to_list(length=1)

    global_stats = total_doc[0] if total_doc else {"total_collapsed": 0, "total_dust": 0, "player_count": 0}
    global_stats.pop("_id", None)

    # Format clusters
    hotspots = []
    for c in clusters:
        rarity_counts = {}
        for r in c.get("rarities", []):
            rarity_counts[r] = rarity_counts.get(r, 0) + 1

        dominant = max(rarity_counts, key=rarity_counts.get) if rarity_counts else "common"
        hotspots.append({
            "lat": c["_id"]["lat_bucket"],
            "lng": c["_id"]["lng_bucket"],
            "collapse_count": c["count"],
            "total_dust": c["total_dust"],
            "dominant_rarity": dominant,
            "rarity_breakdown": rarity_counts,
            "latest_collapse": c.get("latest"),
        })

    return {
        "hotspots": hotspots,
        "global_stats": global_stats,
        "map_description": "The Collective Unconscious — Every collapsed Shadow Sprite contributes to humanity's shared map of integrated shadow material.",
    }
