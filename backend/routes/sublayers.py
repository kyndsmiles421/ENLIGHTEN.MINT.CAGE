"""
Fractal Sub-Layer Engine — The L² Computing Model.
Each planetary depth contains L² sub-layers where L is the depth index + 2:
  Crust:       2² =  4 sub-layers (Foundational / Physical)
  Mantle:      3² =  9 sub-layers (Archetypal / Psychological)
  Outer Core:  4² = 16 sub-layers (Quantum / Superposition)
  Hollow Earth:5² = 25 sub-layers (Unified / Entangled)
  Total: 54 sub-layers

Sub-layers are arranged in a fractal grid (L×L) within each depth.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user
from datetime import datetime, timezone
from routes.consciousness import level_from_consciousness_xp
import uuid
import math

router = APIRouter(prefix="/sublayers")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SUB-LAYER DEFINITIONS (L² Fractal Grid)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPTH_CONFIG = {
    "crust": {
        "name": "The Crust",
        "L": 2,
        "sub_count": 4,
        "frequency_hz": 432,
        "resonance_quality": "Foundational / Physical",
        "color": "#D97706",
        "element": "earth",
        "consciousness_required": 1,
        "sub_frequency_range": (432, 420),
    },
    "mantle": {
        "name": "The Mantle",
        "L": 3,
        "sub_count": 9,
        "frequency_hz": 396,
        "resonance_quality": "Archetypal / Psychological",
        "color": "#EF4444",
        "element": "fire",
        "consciousness_required": 2,
        "sub_frequency_range": (419, 397),
    },
    "outer_core": {
        "name": "The Outer Core",
        "L": 4,
        "sub_count": 16,
        "frequency_hz": 285,
        "resonance_quality": "Quantum / Superposition",
        "color": "#8B5CF6",
        "element": "water",
        "consciousness_required": 3,
        "sub_frequency_range": (396, 286),
    },
    "hollow_earth": {
        "name": "The Hollow Earth",
        "L": 5,
        "sub_count": 25,
        "frequency_hz": 174,
        "resonance_quality": "Unified / Entangled",
        "color": "#FBBF24",
        "element": "ether",
        "consciousness_required": 4,
        "sub_frequency_range": (285, 174),
    },
}

DEPTH_ORDER = ["crust", "mantle", "outer_core", "hollow_earth"]

SUB_LAYER_THEMES = {
    "crust": [
        "Mineral Veins", "Crystal Plains", "Root Networks", "Surface Winds",
    ],
    "mantle": [
        "Obsidian Gate", "Magma Rivers", "Pressure Crystals", "Shadow Alcove",
        "Sacred Geometry Chamber", "Archetypal Mirror", "Memory Forge",
        "Dissolution Pool", "The Threshold",
    ],
    "outer_core": [
        "Plasma Current Alpha", "Floating Isles", "Vortex Nexus", "Wave Function Field",
        "Probability Cascade", "Superposition Garden", "Entanglement Bridge",
        "Quantum Foam Shore", "Phase Gate North", "Phase Gate South",
        "Particle Stream", "Antiparticle Mirror", "Zero-Point Chamber",
        "Decoherence Rift", "Observer's Seat", "Collapse Horizon",
    ],
    "hollow_earth": [
        "Central Sun Approach", "Inverted Forest Alpha", "Crystalline Cavern",
        "Ancient Library East", "Resonance Cathedral", "Unity Pool",
        "Singularity Rim", "Time Spiral", "Consciousness Well",
        "Akashic Interface", "Collective Dream", "Harmonic Convergence",
        "Source Code Chamber", "Infinite Regress", "Fractal Bloom",
        "Individuation Gate", "Anima Sanctum", "Animus Forge",
        "Self-Recognition Mirror", "Transcendence Ladder", "Void Lotus",
        "Eternal Return", "Omega Point", "Alpha Genesis",
        "The Absolute Center",
    ],
}


def _build_sublayers(depth_id):
    """Generate the L×L fractal grid for a depth."""
    config = DEPTH_CONFIG[depth_id]
    L = config["L"]
    themes = SUB_LAYER_THEMES.get(depth_id, [])
    freq_hi, freq_lo = config["sub_frequency_range"]
    total = L * L

    sublayers = []
    for i in range(total):
        row = i // L
        col = i % L
        freq = round(freq_hi - (freq_hi - freq_lo) * (i / max(total - 1, 1)), 1)
        theme = themes[i] if i < len(themes) else f"Sub-Layer {i + 1}"

        sublayers.append({
            "id": f"{depth_id}_sub_{i}",
            "depth": depth_id,
            "index": i,
            "row": row,
            "col": col,
            "grid_size": L,
            "name": theme,
            "frequency_hz": freq,
            "dust_cost": (i + 1) * 5,
            "xp_reward": (i + 1) * 8,
        })

    return sublayers


# Pre-build all 54 sub-layers
ALL_SUBLAYERS = {}
for d in DEPTH_ORDER:
    ALL_SUBLAYERS[d] = _build_sublayers(d)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/fractal-map")
async def get_fractal_map(user=Depends(get_current_user)):
    """
    Returns the full 54 sub-layer fractal map with user progress.
    Local Density Rendering: full metadata for current depth, summary for others.
    """
    uid = user["id"]
    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current_depth = (depth_doc or {}).get("current_layer", "crust")

    prog_doc = await db.sublayer_progress.find_one({"user_id": uid}, {"_id": 0})
    explored = set((prog_doc or {}).get("explored_sublayers", []))
    current_sub = (prog_doc or {}).get("current_sublayer", f"{current_depth}_sub_0")
    total_explored = len(explored)

    depths = []
    for d_id in DEPTH_ORDER:
        config = DEPTH_CONFIG[d_id]
        subs = ALL_SUBLAYERS[d_id]
        is_current_depth = d_id == current_depth
        accessible = level >= config["consciousness_required"]

        depth_explored = [s["id"] for s in subs if s["id"] in explored]

        depth_entry = {
            "depth_id": d_id,
            "name": config["name"],
            "L": config["L"],
            "sub_count": config["sub_count"],
            "frequency_hz": config["frequency_hz"],
            "resonance_quality": config["resonance_quality"],
            "color": config["color"],
            "element": config["element"],
            "accessible": accessible,
            "is_current": is_current_depth,
            "explored_count": len(depth_explored),
            "completion_pct": round(len(depth_explored) / config["sub_count"] * 100, 1),
        }

        # Local Density Rendering: only unfold current depth
        if is_current_depth:
            depth_entry["sublayers"] = [
                {**s, "explored": s["id"] in explored, "is_current": s["id"] == current_sub}
                for s in subs
            ]
        else:
            depth_entry["sublayers"] = None  # collapsed

        depths.append(depth_entry)

    return {
        "depths": depths,
        "current_depth": current_depth,
        "current_sublayer": current_sub,
        "total_sublayers": 54,
        "total_explored": total_explored,
        "exploration_pct": round(total_explored / 54 * 100, 1),
        "consciousness_level": level,
        "fractal_law": "L² where L = depth_index + 2",
    }


@router.get("/depth/{depth_id}")
async def get_depth_sublayers(depth_id: str, user=Depends(get_current_user)):
    """
    Unfold a specific depth's fractal grid (L×L).
    Returns full sub-layer data for that depth.
    """
    if depth_id not in DEPTH_CONFIG:
        raise HTTPException(400, f"Unknown depth: {depth_id}")

    uid = user["id"]
    config = DEPTH_CONFIG[depth_id]

    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)

    if level < config["consciousness_required"]:
        raise HTTPException(403, f"Requires consciousness level {config['consciousness_required']}")

    prog_doc = await db.sublayer_progress.find_one({"user_id": uid}, {"_id": 0})
    explored = set((prog_doc or {}).get("explored_sublayers", []))
    current_sub = (prog_doc or {}).get("current_sublayer", f"{depth_id}_sub_0")

    subs = ALL_SUBLAYERS[depth_id]
    sublayers = [
        {**s, "explored": s["id"] in explored, "is_current": s["id"] == current_sub}
        for s in subs
    ]

    return {
        "depth_id": depth_id,
        "name": config["name"],
        "L": config["L"],
        "grid_size": config["L"],
        "sub_count": config["sub_count"],
        "frequency_hz": config["frequency_hz"],
        "resonance_quality": config["resonance_quality"],
        "color": config["color"],
        "sublayers": sublayers,
        "explored_count": sum(1 for s in sublayers if s["explored"]),
        "current_sublayer": current_sub,
    }


@router.post("/navigate")
async def navigate_sublayer(
    sublayer_id: str = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """
    Navigate to a specific sub-layer within the fractal grid.
    Costs Cosmic Dust based on sub-layer depth.
    """
    uid = user["id"]

    # Find the sub-layer
    target_sub = None
    target_depth = None
    for d_id, subs in ALL_SUBLAYERS.items():
        for s in subs:
            if s["id"] == sublayer_id:
                target_sub = s
                target_depth = d_id
                break
        if target_sub:
            break

    if not target_sub:
        raise HTTPException(404, "Sub-layer not found")

    config = DEPTH_CONFIG[target_depth]
    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1, "user_dust_balance": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)
    dust = (u or {}).get("user_dust_balance", 0)

    if level < config["consciousness_required"]:
        raise HTTPException(403, f"Requires consciousness level {config['consciousness_required']}")

    cost = target_sub["dust_cost"]
    prog_doc = await db.sublayer_progress.find_one({"user_id": uid}, {"_id": 0})
    explored = set((prog_doc or {}).get("explored_sublayers", []))
    first_visit = sublayer_id not in explored

    # Only charge dust for first visits
    if first_visit:
        if dust < cost:
            raise HTTPException(400, f"Need {cost} Cosmic Dust (have {dust})")
        await db.users.update_one({"id": uid}, {"$inc": {"user_dust_balance": -cost}})

    now = datetime.now(timezone.utc).isoformat()

    update_ops = {
        "$set": {
            "user_id": uid,
            "current_sublayer": sublayer_id,
            "current_depth": target_depth,
            "last_navigation": now,
        },
    }

    if first_visit:
        update_ops["$addToSet"] = {"explored_sublayers": sublayer_id}
        update_ops["$inc"] = {"total_explorations": 1}
        update_ops.setdefault("$push", {})["exploration_log"] = {
            "sublayer_id": sublayer_id,
            "depth": target_depth,
            "timestamp": now,
            "dust_cost": cost,
        }

    await db.sublayer_progress.update_one({"user_id": uid}, update_ops, upsert=True)

    # XP for first exploration
    xp_reward = target_sub["xp_reward"] if first_visit else 0
    if xp_reward > 0:
        await db.users.update_one(
            {"id": uid},
            {
                "$inc": {"consciousness.xp": xp_reward},
                "$push": {
                    "consciousness.activity_log": {
                        "type": "sublayer_explore",
                        "xp": xp_reward,
                        "sublayer": sublayer_id,
                        "timestamp": now,
                    }
                },
            },
        )

    # Also update planetary depth if needed
    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current_planetary = (depth_doc or {}).get("current_layer", "crust")
    if current_planetary != target_depth:
        archetype_map = {"crust": "persona", "mantle": "shadow", "outer_core": "anima", "hollow_earth": "self"}
        await db.planetary_depth.update_one(
            {"user_id": uid},
            {
                "$set": {
                    "user_id": uid,
                    "current_layer": target_depth,
                    "psyche_state": archetype_map.get(target_depth, "persona"),
                    "last_descent": now,
                },
                "$addToSet": {"unlocked_layers": target_depth},
            },
            upsert=True,
        )

    # Check for Fractal Completion Bonus
    depth_mastery = False
    depth_mastery_reward = 0
    if first_visit:
        # Re-fetch to get updated explored list
        updated_prog = await db.sublayer_progress.find_one({"user_id": uid}, {"_id": 0})
        updated_explored = set((updated_prog or {}).get("explored_sublayers", []))
        depth_sub_ids = {s["id"] for s in ALL_SUBLAYERS[target_depth]}
        if depth_sub_ids.issubset(updated_explored):
            depth_mastery = True
            depth_mastery_reward = config["sub_count"] * 20  # 20 XP per sub-layer bonus
            await db.sublayer_progress.update_one(
                {"user_id": uid},
                {"$addToSet": {"mastered_depths": target_depth}},
            )
            await db.users.update_one(
                {"id": uid},
                {
                    "$inc": {"consciousness.xp": depth_mastery_reward},
                    "$push": {
                        "consciousness.activity_log": {
                            "type": "depth_mastery",
                            "xp": depth_mastery_reward,
                            "depth": target_depth,
                            "timestamp": now,
                        }
                    },
                },
            )

    return {
        "success": True,
        "sublayer": {**target_sub, "explored": True, "is_current": True},
        "first_visit": first_visit,
        "dust_cost": cost if first_visit else 0,
        "xp_reward": xp_reward,
        "depth": target_depth,
        "depth_mastery": depth_mastery,
        "depth_mastery_reward": depth_mastery_reward,
        "message": f"Entered {target_sub['name']} ({target_sub['frequency_hz']} Hz)" + (" — DEPTH MASTERY ACHIEVED!" if depth_mastery else ""),
    }


@router.get("/progress")
async def get_sublayer_progress(user=Depends(get_current_user)):
    """Get detailed exploration progress across all 54 sub-layers."""
    uid = user["id"]
    prog_doc = await db.sublayer_progress.find_one({"user_id": uid}, {"_id": 0})
    explored = (prog_doc or {}).get("explored_sublayers", [])

    by_depth = {}
    for d_id in DEPTH_ORDER:
        config = DEPTH_CONFIG[d_id]
        depth_explored = [e for e in explored if e.startswith(f"{d_id}_sub_")]
        by_depth[d_id] = {
            "name": config["name"],
            "total": config["sub_count"],
            "explored": len(depth_explored),
            "completion_pct": round(len(depth_explored) / config["sub_count"] * 100, 1),
            "color": config["color"],
        }

    mastered = (prog_doc or {}).get("mastered_depths", [])

    return {
        "total_sublayers": 54,
        "total_explored": len(explored),
        "exploration_pct": round(len(explored) / 54 * 100, 1),
        "current_sublayer": (prog_doc or {}).get("current_sublayer"),
        "by_depth": by_depth,
        "mastered_depths": mastered,
        "exploration_log": (prog_doc or {}).get("exploration_log", [])[-15:],
    }
