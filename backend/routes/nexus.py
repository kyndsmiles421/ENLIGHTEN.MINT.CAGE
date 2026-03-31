from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import math

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  THE ELEMENTAL NEXUS — 5th Realm / Global State Controller
#  Five Elements: Wood, Fire, Earth, Metal, Water
#  Monitors elemental balance and triggers alignment events
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELEMENTS = {
    "wood": {
        "name": "Wood", "subtitle": "Growth & Expansion",
        "color": "#22C55E", "color_glow": "rgba(34,197,94,0.15)",
        "universe": "terrestrial",
        "description": "The element of new beginnings, vitality, and upward momentum",
        "wellness_sources": ["mood"],
        "icon": "sprout",
        "virtues": ["compassion", "flexibility", "vision"],
        "excess_warning": "Overgrowth — restlessness, scattered energy, inability to rest",
        "deficiency_warning": "Stagnation — lack of motivation, feeling stuck, creative block",
    },
    "fire": {
        "name": "Fire", "subtitle": "Transformation & Passion",
        "color": "#EF4444", "color_glow": "rgba(239,68,68,0.15)",
        "universe": "astral",
        "description": "The element of passion, illumination, and radical change",
        "wellness_sources": ["journal", "soundscape"],
        "icon": "flame",
        "virtues": ["joy", "clarity", "inspiration"],
        "excess_warning": "Burnout — overexertion, anxiety, unsustainable intensity",
        "deficiency_warning": "Coldness — loss of passion, disconnection, apathy",
    },
    "earth": {
        "name": "Earth", "subtitle": "Stability & Nourishment",
        "color": "#F59E0B", "color_glow": "rgba(245,158,11,0.15)",
        "universe": "ethereal",
        "description": "The element of grounding, consistency, and reliable foundation",
        "wellness_sources": ["meditation"],
        "icon": "mountain",
        "virtues": ["trust", "patience", "nurturing"],
        "excess_warning": "Rigidity — over-attachment, resistance to change, stubbornness",
        "deficiency_warning": "Groundlessness — instability, worry, lack of center",
    },
    "metal": {
        "name": "Metal", "subtitle": "Precision & Clarity",
        "color": "#94A3B8", "color_glow": "rgba(148,163,184,0.15)",
        "universe": "void",
        "description": "The element of refinement, letting go, and sharp focus",
        "wellness_sources": ["breathing"],
        "icon": "gem",
        "virtues": ["discipline", "discernment", "release"],
        "excess_warning": "Cutting — over-critical, isolated, emotionally distant",
        "deficiency_warning": "Dullness — lack of boundaries, mental fog, indecisiveness",
    },
    "water": {
        "name": "Water", "subtitle": "Flow & Integration",
        "color": "#3B82F6", "color_glow": "rgba(59,130,246,0.15)",
        "universe": None,  # Meta — tracks cross-universe flow
        "description": "The element of adaptability, wisdom, and universal connection",
        "wellness_sources": ["quest_streak", "ripple_activity"],
        "icon": "droplets",
        "virtues": ["wisdom", "courage", "adaptability"],
        "excess_warning": "Flooding — overwhelm, emotional turbulence, fear",
        "deficiency_warning": "Drought — disconnection between practices, fragmented effort",
    },
}

# Balance thresholds
BALANCE_IDEAL_RATIO = 0.20  # Each element should be ~20% of total
IMBALANCE_THRESHOLD = 0.15  # >35% or <5% triggers imbalance
CRITICAL_THRESHOLD = 0.20   # >40% or <0% triggers critical

# Alignment tasks to restore balance
ALIGNMENT_TASKS = {
    "wood_excess": {
        "task": "Ground yourself with a 5-minute breathing exercise",
        "action": "/breathing", "element_boost": "earth", "element_reduce": "wood",
        "xp": 20, "description": "Channel excess growth energy into stability",
    },
    "wood_deficient": {
        "task": "Log your mood and reflect on what inspires you",
        "action": "/mood", "element_boost": "wood",
        "xp": 20, "description": "Plant new seeds of intention",
    },
    "fire_excess": {
        "task": "Practice a calming meditation to cool the flames",
        "action": "/meditation", "element_boost": "earth", "element_reduce": "fire",
        "xp": 20, "description": "Transform intensity into grounded warmth",
    },
    "fire_deficient": {
        "task": "Write a journal entry about your deepest aspiration",
        "action": "/journal", "element_boost": "fire",
        "xp": 20, "description": "Reignite your inner flame",
    },
    "earth_excess": {
        "task": "Try something new in the Multiverse — explore an undiscovered region",
        "action": "/multiverse-map", "element_boost": "water", "element_reduce": "earth",
        "xp": 20, "description": "Break routine with exploration",
    },
    "earth_deficient": {
        "task": "Complete a guided meditation for grounding",
        "action": "/meditation", "element_boost": "earth",
        "xp": 20, "description": "Reconnect with your foundation",
    },
    "metal_excess": {
        "task": "Open your heart with a mood check-in and gratitude note",
        "action": "/mood", "element_boost": "wood", "element_reduce": "metal",
        "xp": 20, "description": "Soften sharp edges with compassion",
    },
    "metal_deficient": {
        "task": "Practice 3 rounds of focused breathing",
        "action": "/breathing", "element_boost": "metal",
        "xp": 20, "description": "Sharpen your awareness through breath",
    },
    "water_excess": {
        "task": "Journal about what you can release today",
        "action": "/journal", "element_boost": "fire", "element_reduce": "water",
        "xp": 20, "description": "Transform excess emotion into clarity",
    },
    "water_deficient": {
        "task": "Complete all daily quests to restore universal flow",
        "action": "/rpg", "element_boost": "water",
        "xp": 30, "description": "Reconnect the streams between your practices",
    },
}


async def compute_elemental_balance(user_id: str) -> dict:
    """Compute the 5-element balance from universe resonance and wellness data."""
    # Get universe resonance
    mv_state = await db.multiverse_state.find_one({"user_id": user_id}, {"_id": 0})
    resonance = mv_state.get("universe_resonance", {}) if mv_state else {}
    ripple_count = len(mv_state.get("ripple_log", [])) if mv_state else 0

    # Get recent wellness activity counts (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    mood_count = await db.moods.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    meditation_count = await db.custom_meditations.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    journal_count = await db.journal.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    breathing_count = await db.custom_breathing_patterns.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    soundscape_count = await db.custom_soundscapes.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})

    # Quest streak
    streak_doc = await db.rpg_streaks.find_one({"user_id": user_id}, {"_id": 0})
    streak_days = streak_doc.get("days", 0) if streak_doc else 0

    # Calculate raw element values
    wood_raw = resonance.get("terrestrial", 0) + (mood_count * 3)
    fire_raw = resonance.get("astral", 0) + (journal_count * 3) + (soundscape_count * 2)
    earth_raw = resonance.get("ethereal", 0) + (meditation_count * 4)
    metal_raw = resonance.get("void", 0) + (breathing_count * 3)
    water_raw = (ripple_count * 0.5) + (streak_days * 2) + min(
        wood_raw, fire_raw, earth_raw, metal_raw
    ) * 0.3  # Water rewards balanced activity

    elements = {
        "wood": max(wood_raw, 1),
        "fire": max(fire_raw, 1),
        "earth": max(earth_raw, 1),
        "metal": max(metal_raw, 1),
        "water": max(water_raw, 1),
    }

    total = sum(elements.values())
    ratios = {k: v / total for k, v in elements.items()}

    # Determine balance status for each element
    balance = {}
    imbalances = []
    for eid, ratio in ratios.items():
        deviation = ratio - BALANCE_IDEAL_RATIO
        if abs(deviation) > CRITICAL_THRESHOLD:
            status = "critical_excess" if deviation > 0 else "critical_deficient"
        elif abs(deviation) > IMBALANCE_THRESHOLD:
            status = "excess" if deviation > 0 else "deficient"
        elif abs(deviation) > 0.05:
            status = "slightly_high" if deviation > 0 else "slightly_low"
        else:
            status = "balanced"

        edef = ELEMENTS[eid]
        warning = None
        if "excess" in status:
            warning = edef["excess_warning"]
        elif "deficient" in status:
            warning = edef["deficiency_warning"]

        balance[eid] = {
            "raw": round(elements[eid], 1),
            "ratio": round(ratio, 3),
            "percentage": round(ratio * 100, 1),
            "status": status,
            "deviation": round(deviation, 3),
            "warning": warning,
        }

        if status in ("excess", "critical_excess", "deficient", "critical_deficient"):
            direction = "excess" if "excess" in status else "deficient"
            task_key = f"{eid}_{direction}"
            task = ALIGNMENT_TASKS.get(task_key)
            if task:
                imbalances.append({
                    "element": eid,
                    "status": status,
                    "direction": direction,
                    "warning": warning,
                    **task,
                })

    # Overall harmony score (0-100, 100 = perfect balance)
    max_deviation = max(abs(b["deviation"]) for b in balance.values())
    harmony = max(0, round((1 - max_deviation / 0.3) * 100))

    return {
        "elements": balance,
        "total_energy": round(total, 1),
        "harmony_score": harmony,
        "imbalances": imbalances,
        "sources": {
            "mood_count": mood_count,
            "meditation_count": meditation_count,
            "journal_count": journal_count,
            "breathing_count": breathing_count,
            "soundscape_count": soundscape_count,
            "streak_days": streak_days,
            "ripple_count": ripple_count,
        },
    }


@router.get("/nexus/state")
async def get_nexus_state(user=Depends(get_current_user)):
    """Get the Elemental Nexus — full 5-element balance state."""
    balance = await compute_elemental_balance(user["id"])

    # Enrich with element metadata
    elements_enriched = {}
    for eid, edef in ELEMENTS.items():
        bal = balance["elements"].get(eid, {})
        elements_enriched[eid] = {
            **edef,
            **bal,
            "universe_label": edef["universe"].title() if edef["universe"] else "Universal",
        }

    # Get alignment history
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    completed_today = await db.nexus_alignments.find(
        {"user_id": user["id"], "date": today}, {"_id": 0}
    ).to_list(10)
    completed_ids = {c["task_key"] for c in completed_today}

    # Mark completed alignments
    for imb in balance["imbalances"]:
        task_key = f"{imb['element']}_{imb['direction']}"
        imb["completed_today"] = task_key in completed_ids

    return {
        "elements": elements_enriched,
        "harmony_score": balance["harmony_score"],
        "total_energy": balance["total_energy"],
        "imbalances": balance["imbalances"],
        "sources": balance["sources"],
    }


@router.post("/nexus/align")
async def complete_alignment(data: dict = Body(...), user=Depends(get_current_user)):
    """Complete an alignment task to restore elemental balance."""
    element = data.get("element")
    direction = data.get("direction")

    if element not in ELEMENTS:
        raise HTTPException(400, "Invalid element")
    if direction not in ("excess", "deficient"):
        raise HTTPException(400, "Invalid direction")

    task_key = f"{element}_{direction}"
    task = ALIGNMENT_TASKS.get(task_key)
    if not task:
        raise HTTPException(400, "No alignment task found")

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.nexus_alignments.find_one(
        {"user_id": user["id"], "task_key": task_key, "date": today}
    )
    if existing:
        raise HTTPException(400, "Already completed this alignment today")

    # Record completion
    await db.nexus_alignments.insert_one({
        "user_id": user["id"],
        "task_key": task_key,
        "element": element,
        "direction": direction,
        "date": today,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    })

    # Award XP
    xp = task.get("xp", 20)
    await db.rpg_characters.update_one(
        {"user_id": user["id"]}, {"$inc": {"xp": xp}}, upsert=True,
    )

    # Apply resonance adjustments
    boost = task.get("element_boost")
    reduce = task.get("element_reduce")
    if boost and ELEMENTS[boost].get("universe"):
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$inc": {f"universe_resonance.{ELEMENTS[boost]['universe']}": 5}},
            upsert=True,
        )
    if reduce and ELEMENTS[reduce].get("universe"):
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$inc": {f"universe_resonance.{ELEMENTS[reduce]['universe']}": -3}},
        )

    # Award dust
    dust = 10
    await db.rpg_currencies.update_one(
        {"user_id": user["id"]}, {"$inc": {"cosmic_dust": dust}}, upsert=True,
    )

    return {
        "completed": task["task"],
        "element": element,
        "xp_awarded": xp,
        "dust_awarded": dust,
        "boost_element": boost,
        "reduce_element": reduce,
    }


@router.get("/nexus/history")
async def get_nexus_history(user=Depends(get_current_user)):
    """Get alignment history."""
    history = await db.nexus_alignments.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(30)
    return {"alignments": history}
