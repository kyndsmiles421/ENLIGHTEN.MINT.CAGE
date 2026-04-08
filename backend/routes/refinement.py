from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from routes.evolution import SPECIMEN_METADATA, EVOLUTION_STAGES, _compute_vc, _get_stage
from utils.credits import get_user_credits, modify_credits
from datetime import datetime, timezone, timedelta
import random

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REFINEMENT LAB — Digital Tumbler & Extraction Tools
#  Time-gated refinement: raw → polished (24-48h)
#  Tool selection based on Mohs Hardness Scale
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Extraction Tools ──
EXTRACTION_TOOLS = {
    "brush": {
        "id": "brush",
        "name": "Precision Brush",
        "description": "Gentle bristles for soft, delicate specimens. Optimal for Mohs 1-4.",
        "mohs_range": [1, 4],
        "efficiency": "high",
        "damage_risk": 0.02,
        "icon": "paintbrush",
        "color": "#22C55E",
    },
    "pick": {
        "id": "pick",
        "name": "Geological Pick",
        "description": "Medium-force extraction tool. Optimal for Mohs 4-7.",
        "mohs_range": [4, 7],
        "efficiency": "high",
        "damage_risk": 0.05,
        "icon": "hammer",
        "color": "#F59E0B",
    },
    "chisel": {
        "id": "chisel",
        "name": "Diamond Chisel",
        "description": "High-hardness extraction. Rhythm-based precision for Mohs 7-10.",
        "mohs_range": [7, 10],
        "efficiency": "high",
        "damage_risk": 0.08,
        "icon": "anvil",
        "color": "#3B82F6",
    },
}

# ── Tumbler Durations by rarity ──
TUMBLER_DURATIONS = {
    "common": 4,       # 4 hours
    "uncommon": 8,      # 8 hours
    "rare": 16,         # 16 hours
    "epic": 24,         # 24 hours
    "legendary": 36,    # 36 hours
    "mythic": 48,       # 48 hours
}

# ── Starseed Component Conversion ──
STARSEED_COMPONENTS = {
    "obsidian": {"component": "Atmospheric Shielding", "category": "defense", "power": 15, "color": "#1F2937"},
    "clear_quartz": {"component": "Signal Booster", "category": "communication", "power": 10, "color": "#E5E7EB"},
    "diamond": {"component": "Quantum Core", "category": "power", "power": 50, "color": "#F8FAFC"},
    "ruby": {"component": "Plasma Conduit", "category": "energy", "power": 30, "color": "#EF4444"},
    "sapphire": {"component": "Navigation Matrix", "category": "navigation", "power": 30, "color": "#3B82F6"},
    "emerald": {"component": "Bio-Resonance Array", "category": "life_support", "power": 25, "color": "#22C55E"},
    "moonstone": {"component": "Lunar Stabilizer", "category": "navigation", "power": 15, "color": "#C4B5FD"},
    "lapis_lazuli": {"component": "Wisdom Archive", "category": "knowledge", "power": 20, "color": "#1E40AF"},
    "amber": {"component": "Temporal Capacitor", "category": "power", "power": 20, "color": "#D97706"},
    "jade": {"component": "Harmony Regulator", "category": "life_support", "power": 18, "color": "#16A34A"},
    "garnet": {"component": "Heat Shield", "category": "defense", "power": 12, "color": "#991B1B"},
    "aquamarine": {"component": "Hydrodynamic Filter", "category": "life_support", "power": 18, "color": "#06B6D4"},
    "topaz": {"component": "Solar Collector", "category": "energy", "power": 25, "color": "#F59E0B"},
    "larimar": {"component": "Oceanic Antenna", "category": "communication", "power": 35, "color": "#67E8F9"},
    "platinum_nugget": {"component": "Superconductor Core", "category": "power", "power": 60, "color": "#D1D5DB"},
    "peridot": {"component": "Growth Accelerator", "category": "life_support", "power": 12, "color": "#84CC16"},
    "malachite": {"component": "Toxin Scrubber", "category": "life_support", "power": 12, "color": "#059669"},
    "carnelian": {"component": "Ignition Spark", "category": "energy", "power": 8, "color": "#EA580C"},
    "fire_opal": {"component": "Spectral Lens", "category": "navigation", "power": 18, "color": "#F97316"},
    "tigers_eye": {"component": "Sensor Array", "category": "navigation", "power": 12, "color": "#B45309"},
    "hematite": {"component": "Magnetic Shield", "category": "defense", "power": 12, "color": "#6B7280"},
    "pyrite": {"component": "Spark Generator", "category": "energy", "power": 10, "color": "#CA8A04"},
    "silver_ore": {"component": "Reflective Hull", "category": "defense", "power": 15, "color": "#9CA3AF"},
    "pearl": {"component": "Organic Resonator", "category": "communication", "power": 12, "color": "#FAFAF9"},
    "sunstone": {"component": "Radiance Emitter", "category": "energy", "power": 12, "color": "#FB923C"},
    "smoky_quartz": {"component": "Grounding Rod", "category": "defense", "power": 8, "color": "#78716C"},
    "green_tourmaline": {"component": "Electromagnetic Coil", "category": "power", "power": 18, "color": "#15803D"},
    "jasper": {"component": "Hull Plating", "category": "defense", "power": 6, "color": "#B91C1C"},
    "petrified_wood": {"component": "Ancient Memory Bank", "category": "knowledge", "power": 12, "color": "#8B5E3C"},
    "moss_agate": {"component": "Atmospheric Processor", "category": "life_support", "power": 6, "color": "#4ADE80"},
}


def _get_optimal_tool(mohs: float) -> str:
    """Determine the optimal extraction tool for a given Mohs hardness."""
    if mohs <= 4:
        return "brush"
    elif mohs <= 7:
        return "pick"
    return "chisel"


def _compute_extraction_result(mohs: float, tool_id: str) -> dict:
    """Compute extraction quality based on tool vs hardness match."""
    tool = EXTRACTION_TOOLS.get(tool_id)
    if not tool:
        return {"quality": 0.5, "bonus_xp": 0, "message": "Unknown tool"}

    min_mohs, max_mohs = tool["mohs_range"]
    optimal = _get_optimal_tool(mohs)

    if tool_id == optimal:
        quality = random.uniform(0.85, 1.0)
        bonus_xp = 10
        msg = "Perfect extraction! Optimal tool matched."
    elif min_mohs <= mohs <= max_mohs + 1:
        quality = random.uniform(0.6, 0.85)
        bonus_xp = 5
        msg = "Good extraction. Minor stress fractures."
    else:
        quality = random.uniform(0.3, 0.6)
        bonus_xp = 0
        msg = "Poor tool match. Specimen damaged during extraction."

    return {
        "quality": round(quality, 3),
        "bonus_xp": bonus_xp,
        "message": msg,
        "tool_used": tool_id,
        "optimal_tool": optimal,
        "was_optimal": tool_id == optimal,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@router.get("/refinement/tools")
async def get_tools(user=Depends(get_current_user)):
    """Get available extraction tools with descriptions."""
    return {"tools": list(EXTRACTION_TOOLS.values())}


@router.post("/refinement/extract")
async def extract_specimen(data: dict = Body(...), user=Depends(get_current_user)):
    """Extract a specimen using a specific tool. Quality depends on Mohs-tool match."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")
    tool_id = data.get("tool", "pick")

    if not specimen_id:
        raise HTTPException(400, "specimen_id required")

    # Verify ownership
    owned = await db.rock_hounding_collection.find_one(
        {"user_id": user_id, "specimen_id": specimen_id}
    )
    if not owned:
        raise HTTPException(404, "Specimen not in your collection")

    mohs = owned.get("mohs", 5)
    result = _compute_extraction_result(mohs, tool_id)

    # Save extraction quality
    await db.refinement_extractions.update_one(
        {"user_id": user_id, "specimen_id": specimen_id},
        {"$set": {
            "quality": result["quality"],
            "tool_used": tool_id,
            "extracted_at": datetime.now(timezone.utc).isoformat(),
            "optimal_tool": result["optimal_tool"],
        }},
        upsert=True,
    )

    # Award bonus XP
    if result["bonus_xp"] > 0:
        from routes.game_core import award_xp
        await award_xp(user_id, result["bonus_xp"], f"extraction:{specimen_id}")

    return {
        "extraction": result,
        "specimen_id": specimen_id,
        "mohs": mohs,
        "can_tumble": result["quality"] >= 0.3,
    }


@router.post("/refinement/tumble")
async def start_tumbling(data: dict = Body(...), user=Depends(get_current_user)):
    """Place a specimen in the Digital Tumbler. Time-gated refinement process."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")

    if not specimen_id:
        raise HTTPException(400, "specimen_id required")

    # Check if specimen exists
    owned = await db.rock_hounding_collection.find_one(
        {"user_id": user_id, "specimen_id": specimen_id}
    )
    if not owned:
        raise HTTPException(404, "Specimen not in collection")

    # Check if already tumbling
    existing = await db.refinement_tumbler.find_one(
        {"user_id": user_id, "specimen_id": specimen_id, "status": "tumbling"}
    )
    if existing:
        remaining = _tumble_remaining(existing)
        raise HTTPException(400, f"Already tumbling. {remaining['hours_remaining']}h remaining.")

    # Check tumbler capacity (max 3 simultaneous)
    active_count = await db.refinement_tumbler.count_documents(
        {"user_id": user_id, "status": "tumbling"}
    )
    if active_count >= 3:
        raise HTTPException(400, "Tumbler at capacity (3 slots). Wait for current batch to finish.")

    # Get extraction quality (improves tumble outcome)
    extraction = await db.refinement_extractions.find_one(
        {"user_id": user_id, "specimen_id": specimen_id}, {"_id": 0}
    )
    extraction_quality = (extraction or {}).get("quality", 0.7)

    rarity = owned.get("best_rarity", "common")
    duration_hours = TUMBLER_DURATIONS.get(rarity, 8)

    # Premium subscribers get 50% speed boost
    nexus_sub = await db.nexus_subscriptions.find_one(
        {"user_id": user_id, "status": "active"}, {"_id": 0}
    )
    if nexus_sub:
        duration_hours = max(1, int(duration_hours * 0.5))

    now = datetime.now(timezone.utc)
    completes_at = now + timedelta(hours=duration_hours)

    await db.refinement_tumbler.insert_one({
        "user_id": user_id,
        "specimen_id": specimen_id,
        "specimen_name": owned.get("name", "Unknown"),
        "rarity": rarity,
        "extraction_quality": extraction_quality,
        "status": "tumbling",
        "started_at": now.isoformat(),
        "completes_at": completes_at.isoformat(),
        "duration_hours": duration_hours,
    })

    return {
        "tumbling": True,
        "specimen_id": specimen_id,
        "specimen_name": owned.get("name", "Unknown"),
        "duration_hours": duration_hours,
        "completes_at": completes_at.isoformat(),
        "extraction_quality": extraction_quality,
        "speed_boosted": nexus_sub is not None,
    }


def _tumble_remaining(doc: dict) -> dict:
    """Compute tumble time remaining."""
    completes = datetime.fromisoformat(doc["completes_at"])
    if completes.tzinfo is None:
        completes = completes.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    remaining = max(0, (completes - now).total_seconds())
    return {
        "hours_remaining": round(remaining / 3600, 1),
        "minutes_remaining": round(remaining / 60),
        "is_complete": remaining <= 0,
        "progress": round(max(0, min(100, (1 - remaining / (doc.get("duration_hours", 1) * 3600)) * 100)), 1),
    }


@router.get("/refinement/tumbler")
async def get_tumbler(user=Depends(get_current_user)):
    """Get the current state of the Digital Tumbler."""
    user_id = user["id"]
    slots = await db.refinement_tumbler.find(
        {"user_id": user_id, "status": "tumbling"},
        {"_id": 0, "user_id": 0},
    ).to_list(5)

    active_slots = []
    for slot in slots:
        remaining = _tumble_remaining(slot)
        active_slots.append({
            **slot,
            **remaining,
        })

    # Get completed (ready for collection)
    completed = await db.refinement_tumbler.find(
        {"user_id": user_id, "status": "complete_uncollected"},
        {"_id": 0, "user_id": 0},
    ).to_list(10)

    # Auto-complete any finished tumbles
    for slot in active_slots:
        if slot["is_complete"]:
            await db.refinement_tumbler.update_one(
                {"user_id": user_id, "specimen_id": slot["specimen_id"], "status": "tumbling"},
                {"$set": {"status": "complete_uncollected"}},
            )
            slot["status"] = "complete_uncollected"
            completed.append(slot)

    active_slots = [s for s in active_slots if not s["is_complete"]]

    return {
        "slots_used": len(active_slots),
        "slots_max": 3,
        "active": active_slots,
        "ready_to_collect": completed,
    }


@router.post("/refinement/collect")
async def collect_tumbled(data: dict = Body(...), user=Depends(get_current_user)):
    """Collect a finished tumbled specimen. Unlocks spiritual + starseed potential."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")

    if not specimen_id:
        raise HTTPException(400, "specimen_id required")

    tumble = await db.refinement_tumbler.find_one(
        {"user_id": user_id, "specimen_id": specimen_id}
    )
    if not tumble:
        raise HTTPException(404, "No tumble session found")

    # Check if complete
    remaining = _tumble_remaining(tumble)
    if not remaining["is_complete"] and tumble.get("status") != "complete_uncollected":
        raise HTTPException(400, f"Not ready. {remaining['hours_remaining']}h remaining.")

    extraction_quality = tumble.get("extraction_quality", 0.7)

    # Mark as collected
    await db.refinement_tumbler.update_one(
        {"user_id": user_id, "specimen_id": specimen_id},
        {"$set": {"status": "collected", "collected_at": datetime.now(timezone.utc).isoformat()}},
    )

    # Mark specimen as "polished" in collection
    await db.rock_hounding_collection.update_one(
        {"user_id": user_id, "specimen_id": specimen_id},
        {"$set": {
            "polished": True,
            "polished_at": datetime.now(timezone.utc).isoformat(),
            "polish_quality": extraction_quality,
        }},
    )

    # ── Bridge: Update Universal Inventory state ──
    await db.rpg_inventory.update_one(
        {"user_id": user_id, "specimen_id": specimen_id, "category": "specimen", "state": "raw"},
        {"$set": {
            "state": "polished",
            "polished_at": datetime.now(timezone.utc).isoformat(),
            "polish_quality": extraction_quality,
        }},
    )

    # Grant evolution VC boost for tumbling
    await db.evolution_tracker.update_one(
        {"user_id": user_id, "asset_id": specimen_id},
        {
            "$inc": {"interactions": 3},
            "$set": {"last_interaction_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )

    # Check for Starseed component unlock
    starseed_data = STARSEED_COMPONENTS.get(specimen_id)
    starseed_unlock = None
    if starseed_data:
        power = int(starseed_data["power"] * extraction_quality)
        starseed_unlock = {
            "component": starseed_data["component"],
            "category": starseed_data["category"],
            "power": power,
            "color": starseed_data["color"],
        }
        # Save to starseed inventory
        await db.starseed_components.update_one(
            {"user_id": user_id, "specimen_id": specimen_id},
            {"$set": {
                "user_id": user_id,
                "specimen_id": specimen_id,
                **starseed_data,
                "power": power,
                "unlocked_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True,
        )

    # Spiritual metadata unlock
    meta = SPECIMEN_METADATA.get(specimen_id, {})

    # Award rewards
    from routes.game_core import award_xp, award_currency
    xp = int(20 * extraction_quality)
    dust = int(10 * extraction_quality)
    await award_xp(user_id, xp, f"refinement:{specimen_id}")
    await award_currency(user_id, "cosmic_dust", dust, f"refinement:{specimen_id}")

    return {
        "collected": True,
        "specimen_id": specimen_id,
        "polished": True,
        "polish_quality": round(extraction_quality, 3),
        "starseed_component": starseed_unlock,
        "spiritual_unlock": {
            "chakra": meta.get("chakra"),
            "frequency": meta.get("frequency"),
            "mantra": meta.get("mantra"),
        } if meta else None,
        "rewards": {"xp": xp, "dust": dust},
    }


@router.post("/refinement/instant-finish")
async def instant_finish(data: dict = Body(...), user=Depends(get_current_user)):
    """Pay Cosmic Credits to instantly finish tumbling (time-saver microtransaction)."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")

    if not specimen_id:
        raise HTTPException(400, "specimen_id required")

    tumble = await db.refinement_tumbler.find_one(
        {"user_id": user_id, "specimen_id": specimen_id, "status": "tumbling"}
    )
    if not tumble:
        raise HTTPException(404, "No active tumble for this specimen")

    remaining = _tumble_remaining(tumble)
    if remaining["is_complete"]:
        raise HTTPException(400, "Already complete. Collect it!")

    # Cost: 1 credit per remaining hour (min 1)
    cost = max(1, int(remaining["hours_remaining"]))

    # Using shared credits module (no circular import)
    credits = await get_user_credits(user_id)
    if credits < cost:
        raise HTTPException(400, f"Need {cost} Cosmic Credits. Have {credits}.")

    await modify_credits(user_id, -cost, f"instant_finish:{specimen_id}")

    # Complete the tumble
    await db.refinement_tumbler.update_one(
        {"user_id": user_id, "specimen_id": specimen_id, "status": "tumbling"},
        {"$set": {
            "status": "complete_uncollected",
            "completes_at": datetime.now(timezone.utc).isoformat(),
            "instant_finished": True,
        }},
    )

    return {
        "instant_finished": True,
        "credits_spent": cost,
        "specimen_id": specimen_id,
    }


@router.get("/refinement/starseed-inventory")
async def get_starseed_inventory(user=Depends(get_current_user)):
    """Get user's Starseed component inventory from polished stones."""
    components = await db.starseed_components.find(
        {"user_id": user["id"]}, {"_id": 0, "user_id": 0}
    ).to_list(100)

    # Aggregate by category
    by_category = {}
    total_power = 0
    for c in components:
        cat = c.get("category", "misc")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(c)
        total_power += c.get("power", 0)

    return {
        "components": components,
        "by_category": by_category,
        "total_power": total_power,
        "total_components": len(components),
    }
