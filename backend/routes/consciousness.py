"""
Five Levels of Consciousness — Progression & Gating System
Maps psychological/spiritual growth to UI, audio, and marketplace access.

Level 1: Physical (The Grit) — Basic RPG, standard resource gathering
Level 2: Emotional (The Flow) — Social Hub, mood-resonance tracking
Level 3: Mental (The Logic) — AI Forge for asset customization
Level 4: Intuitive (The Frequency) — Predictive wellness, 8D Solfeggio
Level 5: Pure Consciousness (The Source) — Master content creation, Founding Architect trade
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/consciousness")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LEVEL DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSCIOUSNESS_LEVELS = [
    {
        "level": 1,
        "name": "Physical",
        "subtitle": "The Grit",
        "element": "Earth",
        "color": "#D97706",
        "aura_color": "#B45309",
        "aura_glow": "rgba(217, 119, 6, 0.3)",
        "xp_required": 0,
        "description": "Ground yourself in the physical realm. Master basic RPG mechanics and resource gathering.",
        "unlocks": ["rpg_basic", "resource_gathering", "basic_quests"],
        "gate_label": "Basic RPG & Resources",
    },
    {
        "level": 2,
        "name": "Emotional",
        "subtitle": "The Flow",
        "element": "Water",
        "color": "#F472B6",
        "aura_color": "#2DD4BF",
        "aura_glow": "rgba(244, 114, 182, 0.3)",
        "xp_required": 500,
        "description": "Open the emotional channels. Unlock mood-resonance tracking and the Social Hub.",
        "unlocks": ["social_hub", "mood_resonance", "community", "journal_advanced"],
        "gate_label": "Social Hub & Mood Resonance",
    },
    {
        "level": 3,
        "name": "Mental",
        "subtitle": "The Logic",
        "element": "Fire",
        "color": "#94A3B8",
        "aura_color": "#3B82F6",
        "aura_glow": "rgba(148, 163, 184, 0.35)",
        "xp_required": 1500,
        "description": "Sharpen the mind. Gain full access to the AI Forge for asset customization.",
        "unlocks": ["ai_forge", "tool_forge", "content_broker", "trade_circle_full"],
        "gate_label": "AI Forge & Trade Circle",
    },
    {
        "level": 4,
        "name": "Intuitive",
        "subtitle": "The Frequency",
        "element": "Air",
        "color": "#8B5CF6",
        "aura_color": "#6366F1",
        "aura_glow": "rgba(139, 92, 246, 0.35)",
        "xp_required": 3500,
        "description": "Tune into the unseen. Predictive wellness alerts and 8D Solfeggio audio unlock.",
        "unlocks": ["predictive_wellness", "8d_audio", "skill_generator", "oracle_advanced"],
        "gate_label": "Predictive Wellness & 8D Audio",
    },
    {
        "level": 5,
        "name": "Pure Consciousness",
        "subtitle": "The Source",
        "element": "Ether",
        "color": "#FBBF24",
        "aura_color": "#FFFBEB",
        "aura_glow": "rgba(251, 191, 36, 0.45)",
        "xp_required": 7000,
        "description": "Become the source. Master content creation, God Mode analytics, and Founding Architect trade status.",
        "unlocks": ["master_creation", "founding_trade", "skill_bottling", "ultra_fidelity_bonus", "god_mode"],
        "gate_label": "Master Creation & God Mode",
    },
]

LEVEL_MAP = {lv["level"]: lv for lv in CONSCIOUSNESS_LEVELS}

# XP rewards for various activities
ACTIVITY_XP = {
    "mood_log": 10,
    "journal_entry": 15,
    "meditation_complete": 20,
    "quest_complete": 25,
    "mixer_save": 15,
    "trade_complete": 20,
    "community_post": 10,
    "oracle_reading": 15,
    "daily_ritual": 30,
    "boss_defeat": 50,
    "content_created": 35,
    "content_purchased": 10,
    "breathing_session": 10,
    "yoga_session": 15,
    "daily_challenge": 20,
    "forge_creation": 40,
    "skill_generation": 45,
}


def level_from_consciousness_xp(xp: int) -> int:
    """Determine consciousness level from total XP."""
    current = 1
    for lvl in CONSCIOUSNESS_LEVELS:
        if xp >= lvl["xp_required"]:
            current = lvl["level"]
    return current


async def get_consciousness(user_id: str) -> dict:
    """Get or initialize user consciousness state."""
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "consciousness": 1})
    consciousness = (u or {}).get("consciousness")
    if not consciousness:
        consciousness = {
            "xp": 0,
            "level": 1,
            "display_mode": "hybrid",
            "activity_log": [],
            "level_up_history": [],
            "initialized_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"consciousness": consciousness}},
        )
    return consciousness


@router.get("/status")
async def consciousness_status(user=Depends(get_current_user)):
    """Get user's current consciousness level, XP, and progression info."""
    c = await get_consciousness(user["id"])
    current_xp = c.get("xp", 0)
    current_level = level_from_consciousness_xp(current_xp)
    level_info = LEVEL_MAP[current_level]

    # Calculate progress to next level
    next_level = min(current_level + 1, 5)
    next_info = LEVEL_MAP[next_level]
    xp_into_level = current_xp - level_info["xp_required"]
    xp_for_next = next_info["xp_required"] - level_info["xp_required"] if next_level > current_level else 1
    progress_pct = min(100, int((xp_into_level / max(1, xp_for_next)) * 100)) if current_level < 5 else 100

    return {
        "level": current_level,
        "level_info": level_info,
        "xp_total": current_xp,
        "xp_into_level": xp_into_level,
        "xp_for_next": xp_for_next if current_level < 5 else 0,
        "progress_pct": progress_pct,
        "next_level": next_info if current_level < 5 else None,
        "display_mode": c.get("display_mode", "hybrid"),
        "all_levels": CONSCIOUSNESS_LEVELS,
        "is_max_level": current_level == 5,
        "recent_activity": c.get("activity_log", [])[-5:],
    }


@router.post("/progress")
async def add_consciousness_xp(data: dict = Body(...), user=Depends(get_current_user)):
    """Award consciousness XP for completing activities."""
    activity = data.get("activity", "")
    context = data.get("context", "")

    xp_reward = ACTIVITY_XP.get(activity, 0)
    if xp_reward == 0:
        raise HTTPException(status_code=400, detail=f"Unknown activity: {activity}")

    user_id = user["id"]
    c = await get_consciousness(user_id)
    old_level = level_from_consciousness_xp(c.get("xp", 0))
    new_xp = c.get("xp", 0) + xp_reward
    new_level = level_from_consciousness_xp(new_xp)

    log_entry = {
        "activity": activity,
        "xp": xp_reward,
        "context": context,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    update = {
        "$set": {"consciousness.xp": new_xp, "consciousness.level": new_level},
        "$push": {
            "consciousness.activity_log": {
                "$each": [log_entry],
                "$slice": -50,
            }
        },
    }

    leveled_up = new_level > old_level
    if leveled_up:
        level_info = LEVEL_MAP[new_level]
        update["$push"]["consciousness.level_up_history"] = {
            "$each": [{
                "from_level": old_level,
                "to_level": new_level,
                "name": level_info["name"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }],
            "$slice": -10,
        }

    await db.users.update_one({"id": user_id}, update)

    result = {
        "xp_gained": xp_reward,
        "total_xp": new_xp,
        "level": new_level,
        "leveled_up": leveled_up,
        "activity": activity,
    }

    if leveled_up:
        result["new_level_info"] = LEVEL_MAP[new_level]

    return result


@router.post("/display-mode")
async def set_display_mode(data: dict = Body(...), user=Depends(get_current_user)):
    """Set how consciousness level is displayed: 'rank', 'aura', or 'hybrid'."""
    mode = data.get("mode", "hybrid")
    if mode not in ("rank", "aura", "hybrid"):
        raise HTTPException(status_code=400, detail="Mode must be 'rank', 'aura', or 'hybrid'")

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"consciousness.display_mode": mode}},
    )
    return {"display_mode": mode}


@router.get("/gate-check/{feature}")
async def check_feature_gate(feature: str, user=Depends(get_current_user)):
    """Check if a feature is unlocked at the user's consciousness level."""
    c = await get_consciousness(user["id"])
    current_level = level_from_consciousness_xp(c.get("xp", 0))

    # Find which level unlocks this feature
    required_level = None
    for lvl in CONSCIOUSNESS_LEVELS:
        if feature in lvl["unlocks"]:
            required_level = lvl["level"]
            break

    if required_level is None:
        return {"feature": feature, "unlocked": True, "message": "Feature not gated"}

    unlocked = current_level >= required_level
    return {
        "feature": feature,
        "unlocked": unlocked,
        "current_level": current_level,
        "required_level": required_level,
        "required_level_info": LEVEL_MAP.get(required_level),
    }


@router.get("/levels")
async def list_levels():
    """Return all consciousness level definitions."""
    return {"levels": CONSCIOUSNESS_LEVELS}
