"""
Resonance Practice — Active dust generation through meditation, breathing, and focus.
Yield scales with consciousness level. Streak bonuses for daily practice.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
from routes.consciousness import level_from_consciousness_xp
import random

router = APIRouter(prefix="/resonance")

# Practice types and their base yields
PRACTICE_TYPES = {
    "meditation": {
        "name": "Meditation",
        "description": "Still the mind. Focus on the breath. Generate Water Dust.",
        "element": "water",
        "min_duration_seconds": 30,
        "base_dust": 5,
        "base_xp": 10,
        "max_dust_multiplier": 3.0,
        "color": "#F472B6",
    },
    "breathing": {
        "name": "Breathwork",
        "description": "Rhythmic breathing patterns channel Air energy into Dust.",
        "element": "air",
        "min_duration_seconds": 20,
        "base_dust": 4,
        "base_xp": 8,
        "max_dust_multiplier": 2.5,
        "color": "#8B5CF6",
    },
    "grounding": {
        "name": "Earth Grounding",
        "description": "Connect with the earth beneath you. Generate Earth Dust.",
        "element": "earth",
        "min_duration_seconds": 45,
        "base_dust": 6,
        "base_xp": 12,
        "max_dust_multiplier": 3.5,
        "color": "#D97706",
    },
    "visualization": {
        "name": "Flame Visualization",
        "description": "Visualize inner fire. Transmute stillness into Fire Dust.",
        "element": "fire",
        "min_duration_seconds": 60,
        "base_dust": 8,
        "base_xp": 15,
        "max_dust_multiplier": 4.0,
        "color": "#94A3B8",
    },
    "mantra": {
        "name": "Mantra Chanting",
        "description": "Repeat sacred words to open the Ether channel.",
        "element": "ether",
        "min_duration_seconds": 90,
        "base_dust": 10,
        "base_xp": 20,
        "max_dust_multiplier": 5.0,
        "color": "#FBBF24",
    },
}

# Consciousness level multipliers for dust yield
LEVEL_MULTIPLIERS = {
    1: 1.0,
    2: 1.3,
    3: 1.6,
    4: 2.0,
    5: 2.5,
}

# Streak bonus thresholds
STREAK_BONUSES = [
    (3, 1.1, "3-day streak"),
    (7, 1.25, "7-day streak"),
    (14, 1.4, "14-day streak"),
    (30, 1.6, "30-day streak"),
    (60, 1.8, "60-day streak"),
    (90, 2.0, "90-day streak"),
]

MAX_SESSIONS_PER_DAY = 10


async def _get_practice_stats(user_id: str) -> dict:
    """Get user's resonance practice stats."""
    doc = await db.resonance_practice.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        return {
            "total_sessions": 0,
            "total_dust_earned": 0,
            "total_xp_earned": 0,
            "current_streak": 0,
            "longest_streak": 0,
            "last_practice": None,
            "today_sessions": 0,
            "sessions_by_type": {},
        }

    # Calculate today's session count
    today = datetime.now(timezone.utc).date().isoformat()
    today_sessions = doc.get("daily_counts", {}).get(today, 0)

    return {
        "total_sessions": doc.get("total_sessions", 0),
        "total_dust_earned": doc.get("total_dust_earned", 0),
        "total_xp_earned": doc.get("total_xp_earned", 0),
        "current_streak": doc.get("current_streak", 0),
        "longest_streak": doc.get("longest_streak", 0),
        "last_practice": doc.get("last_practice"),
        "today_sessions": today_sessions,
        "sessions_by_type": doc.get("sessions_by_type", {}),
    }


def _calculate_streak(last_practice: str, current_streak: int) -> int:
    """Calculate if streak continues or resets."""
    if not last_practice:
        return 1
    lp = datetime.fromisoformat(last_practice)
    if lp.tzinfo is None:
        lp = lp.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = (now.date() - lp.date()).days
    if diff == 0:
        return current_streak  # Same day, streak unchanged
    elif diff == 1:
        return current_streak + 1  # Consecutive day
    else:
        return 1  # Streak broken


@router.get("/practices")
async def get_practices(user=Depends(get_current_user)):
    """Get available practice types and user's stats."""
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0, "consciousness": 1})
    level = level_from_consciousness_xp((u or {}).get("consciousness", {}).get("xp", 0))
    stats = await _get_practice_stats(user["id"])

    practices = []
    for key, p in PRACTICE_TYPES.items():
        level_mult = LEVEL_MULTIPLIERS.get(level, 1.0)
        streak_mult = 1.0
        for threshold, bonus, label in STREAK_BONUSES:
            if stats["current_streak"] >= threshold:
                streak_mult = bonus

        base = p["base_dust"]
        max_yield = round(base * p["max_dust_multiplier"] * level_mult * streak_mult)
        min_yield = round(base * level_mult * streak_mult)

        practices.append({
            "id": key,
            "name": p["name"],
            "description": p["description"],
            "element": p["element"],
            "color": p["color"],
            "min_duration_seconds": p["min_duration_seconds"],
            "dust_range": {"min": min_yield, "max": max_yield},
            "xp": round(p["base_xp"] * level_mult),
            "sessions_completed": stats["sessions_by_type"].get(key, 0),
        })

    return {
        "practices": practices,
        "stats": stats,
        "consciousness_level": level,
        "level_multiplier": LEVEL_MULTIPLIERS.get(level, 1.0),
        "streak_bonus": next(
            ({"multiplier": bonus, "label": lbl} for t, bonus, lbl in STREAK_BONUSES if stats["current_streak"] >= t),
            None,
        ),
        "max_daily_sessions": MAX_SESSIONS_PER_DAY,
        "remaining_today": max(0, MAX_SESSIONS_PER_DAY - stats["today_sessions"]),
    }


@router.post("/complete")
async def complete_practice(data: dict = Body(...), user=Depends(get_current_user)):
    """Complete a practice session and earn rewards."""
    practice_type = data.get("practice_type", "")
    duration_seconds = data.get("duration_seconds", 0)
    quality_score = min(1.0, max(0.0, data.get("quality_score", 0.5)))

    if practice_type not in PRACTICE_TYPES:
        raise HTTPException(400, f"Unknown practice type: {practice_type}")

    p = PRACTICE_TYPES[practice_type]
    user_id = user["id"]

    if duration_seconds < p["min_duration_seconds"]:
        raise HTTPException(400, f"Minimum {p['min_duration_seconds']} seconds required for {p['name']}")

    # Check daily limit
    stats = await _get_practice_stats(user_id)
    if stats["today_sessions"] >= MAX_SESSIONS_PER_DAY:
        raise HTTPException(400, "Daily practice limit reached (10 sessions). Rest and return tomorrow.")

    # Calculate rewards
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "consciousness": 1})
    level = level_from_consciousness_xp((u or {}).get("consciousness", {}).get("xp", 0))
    level_mult = LEVEL_MULTIPLIERS.get(level, 1.0)

    # Streak calculation
    new_streak = _calculate_streak(stats["last_practice"], stats["current_streak"])
    streak_mult = 1.0
    streak_label = None
    for threshold, bonus, label in STREAK_BONUSES:
        if new_streak >= threshold:
            streak_mult = bonus
            streak_label = label

    # Duration bonus (diminishing returns after 5 min)
    duration_factor = min(2.0, 1.0 + (duration_seconds - p["min_duration_seconds"]) / 300)

    # Quality multiplier (from frontend mini-game score)
    quality_mult = 0.5 + quality_score * 0.5  # Range: 0.5 to 1.0

    # Calculate final dust
    dust = round(p["base_dust"] * level_mult * streak_mult * duration_factor * quality_mult * p["max_dust_multiplier"] * quality_score)
    dust = max(p["base_dust"], dust)  # Minimum = base
    xp = round(p["base_xp"] * level_mult * quality_mult)

    now = datetime.now(timezone.utc)
    today = now.date().isoformat()

    # Award dust
    await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": dust}})

    # Award XP
    await db.users.update_one({"id": user_id}, {
        "$inc": {"consciousness.xp": xp},
        "$push": {"consciousness.activity_log": {
            "$each": [{"activity": "resonance_practice", "xp": xp,
                       "context": p["name"], "timestamp": now.isoformat()}],
            "$slice": -50,
        }},
    })

    # Update practice stats
    longest = max(stats["longest_streak"], new_streak)
    await db.resonance_practice.update_one(
        {"user_id": user_id},
        {
            "$inc": {
                "total_sessions": 1,
                "total_dust_earned": dust,
                "total_xp_earned": xp,
                f"sessions_by_type.{practice_type}": 1,
                f"daily_counts.{today}": 1,
            },
            "$set": {
                "current_streak": new_streak,
                "longest_streak": longest,
                "last_practice": now.isoformat(),
            },
            "$push": {"history": {
                "$each": [{
                    "type": practice_type,
                    "element": p["element"],
                    "duration": duration_seconds,
                    "quality": quality_score,
                    "dust": dust,
                    "xp": xp,
                    "streak": new_streak,
                    "timestamp": now.isoformat(),
                }],
                "$slice": -100,
            }},
            "$setOnInsert": {"user_id": user_id},
        },
        upsert=True,
    )

    return {
        "completed": True,
        "practice": p["name"],
        "element": p["element"],
        "rewards": {
            "dust": dust,
            "xp": xp,
        },
        "quality_score": quality_score,
        "duration_seconds": duration_seconds,
        "streak": {
            "current": new_streak,
            "longest": longest,
            "bonus": streak_label,
            "multiplier": streak_mult,
        },
        "level_multiplier": level_mult,
    }


@router.get("/history")
async def practice_history(user=Depends(get_current_user)):
    """Get user's practice history."""
    doc = await db.resonance_practice.find_one({"user_id": user["id"]}, {"_id": 0})
    return {
        "history": (doc or {}).get("history", []),
        "total_sessions": (doc or {}).get("total_sessions", 0),
        "total_dust_earned": (doc or {}).get("total_dust_earned", 0),
    }
