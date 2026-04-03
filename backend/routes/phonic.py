"""
Phonic Resonance API — Movement tracking, Generative Flourish (Gemini), Proximity Harmonics
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/phonic", tags=["phonic"])

# ── Dependencies ──
from deps import db, get_current_user

# ── Solfeggio frequency map (mirrors frontend) ──
ROUTE_FREQUENCIES = {
    "spotless": 432, "cleaning": 432, "sanitation": 432, "nourishment": 432,
    "elixirs": 528, "herbology": 528, "meal-planning": 528, "aromatherapy": 528,
    "suanpan": 741, "sovereign": 741, "hub": 741, "codex": 741, "mastery-path": 741,
    "meditation": 396, "breathing": 396, "zen-garden": 396, "mantras": 396,
    "star-chart": 852, "oracle": 852, "numerology": 852, "cardology": 852,
    "frequencies": 639, "yoga": 639, "reiki": 639, "wellness-reports": 639,
    "dance-music": 963, "music-lounge": 963, "cosmic-mixer": 963,
}

# ── Time-of-day frequency bias ──
HOUR_BIAS = {
    "morning": {"base_freq": 432, "pattern": "steady", "tempo": 0.6},
    "midday": {"base_freq": 528, "pattern": "ascending", "tempo": 0.8},
    "afternoon": {"base_freq": 741, "pattern": "arpeggio", "tempo": 1.0},
    "evening": {"base_freq": 396, "pattern": "descending", "tempo": 0.5},
    "night": {"base_freq": 639, "pattern": "ambient", "tempo": 0.3},
}

def get_time_period():
    hour = datetime.now(timezone.utc).hour
    if 5 <= hour < 10: return "morning"
    if 10 <= hour < 13: return "midday"
    if 13 <= hour < 17: return "afternoon"
    if 17 <= hour < 21: return "evening"
    return "night"


class MovementRecord(BaseModel):
    route: str
    duration_ms: int = 0
    velocity: float = 0.0


class FlourishRequest(BaseModel):
    session_limit: int = 20


@router.post("/record-movement")
async def record_movement(data: MovementRecord, user=Depends(get_current_user)):
    """Record a route visit with duration and velocity for sonic profile generation."""
    route_key = data.route.strip("/").split("/")[0] if data.route else "hub"
    freq = ROUTE_FREQUENCIES.get(route_key, 432)

    record = {
        "user_id": user["id"],
        "route": data.route,
        "route_key": route_key,
        "frequency": freq,
        "duration_ms": data.duration_ms,
        "velocity": data.velocity,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.movement_history.insert_one(record)
    return {"success": True, "frequency": freq, "route_key": route_key}


@router.post("/generate-flourish")
async def generate_flourish(data: FlourishRequest, user=Depends(get_current_user)):
    """Generate a Sonic Profile from movement history using Gemini 3 Flash."""
    # Fetch recent movement history
    cursor = db.movement_history.find(
        {"user_id": user["id"]},
        {"_id": 0, "route_key": 1, "frequency": 1, "duration_ms": 1, "velocity": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(data.session_limit)
    history = await cursor.to_list(length=data.session_limit)

    if not history:
        # No movement data — return time-based default
        period = get_time_period()
        bias = HOUR_BIAS[period]
        return {
            "sonic_profile": {
                "base_frequency": bias["base_freq"],
                "pattern": bias["pattern"],
                "tempo": bias["tempo"],
                "overtones": [bias["base_freq"] * 1.5, bias["base_freq"] * 2],
                "arpeggio_steps": [],
                "binaural_offset": 7,
                "source": "time_default",
                "period": period,
            }
        }

    # Build movement summary for Gemini
    freq_counts = {}
    total_duration = 0
    for h in history:
        f = h.get("frequency", 432)
        freq_counts[f] = freq_counts.get(f, 0) + 1
        total_duration += h.get("duration_ms", 0)

    dominant_freq = max(freq_counts, key=freq_counts.get) if freq_counts else 432
    route_diversity = len(set(h.get("route_key", "") for h in history))
    avg_velocity = sum(h.get("velocity", 0) for h in history) / len(history)
    period = get_time_period()

    # Try Gemini for advanced flourish generation
    sonic_profile = None
    try:
        from emergentintegrations.llm.chat import Chat, ChatMessage
        emergent_api_key = os.environ.get("EMERGENT_API_KEY", "")
        if emergent_api_key:
            chat = Chat(
                api_key=emergent_api_key,
                model="gemini-2.5-flash",
            )
            prompt = f"""Generate a sonic profile for ambient wellness audio. Return ONLY valid JSON.
Movement data: dominant frequency={dominant_freq}Hz, route diversity={route_diversity}, avg velocity={avg_velocity:.1f}, time period={period}, total duration={total_duration}ms, session count={len(history)}.
Frequency distribution: {freq_counts}.

Return JSON with these exact keys:
{{
  "base_frequency": <number 200-1000>,
  "pattern": "<one of: steady, ascending, descending, arpeggio, ambient, pulsing>",
  "tempo": <number 0.1-2.0>,
  "overtones": [<2-3 harmonic frequencies>],
  "arpeggio_steps": [<3-5 frequency steps if pattern is arpeggio, else empty>],
  "binaural_offset": <number 3-12>,
  "mood": "<one word mood descriptor>"
}}"""
            response = await chat.send_message_async(ChatMessage(role="user", text=prompt))
            # Parse JSON from response
            import json, re
            json_match = re.search(r'\{[^{}]*\}', response.text, re.DOTALL)
            if json_match:
                sonic_profile = json.loads(json_match.group())
                sonic_profile["source"] = "gemini"
                sonic_profile["period"] = period
    except Exception:
        pass

    # Fallback: algorithmic generation
    if not sonic_profile:
        bias = HOUR_BIAS[period]
        # Blend dominant frequency with time-of-day
        blended = int(dominant_freq * 0.6 + bias["base_freq"] * 0.4)
        # Higher diversity = more complex pattern
        pattern = "arpeggio" if route_diversity > 3 else bias["pattern"]
        # Higher velocity = faster tempo
        tempo = min(2.0, max(0.2, bias["tempo"] + avg_velocity * 0.01))

        sonic_profile = {
            "base_frequency": blended,
            "pattern": pattern,
            "tempo": round(tempo, 2),
            "overtones": [int(blended * 1.5), int(blended * 2), int(blended * 3)],
            "arpeggio_steps": [blended, int(blended * 1.25), int(blended * 1.5), int(blended * 1.75), blended * 2] if pattern == "arpeggio" else [],
            "binaural_offset": 7,
            "source": "algorithmic",
            "period": period,
        }

    return {"sonic_profile": sonic_profile}


@router.get("/harmonic-pairs")
async def get_harmonic_pairs(user=Depends(get_current_user)):
    """Return resonance pairs with their harmonic intervals for proximity phase-locking."""
    # Intervals based on compatibility strength
    pairs = [
        {"a": "starchart", "b": "mixer", "freq_a": 852, "freq_b": 741, "interval": "fifth", "ratio": 1.15},
        {"a": "starchart", "b": "meditation", "freq_a": 852, "freq_b": 396, "interval": "octave_plus", "ratio": 2.15},
        {"a": "meditation", "b": "mixer", "freq_a": 396, "freq_b": 741, "interval": "fifth", "ratio": 1.87},
        {"a": "meditation", "b": "wellness", "freq_a": 396, "freq_b": 639, "interval": "third", "ratio": 1.61},
        {"a": "wellness", "b": "mixer", "freq_a": 639, "freq_b": 741, "interval": "second", "ratio": 1.16},
        {"a": "trade", "b": "mixer", "freq_a": 528, "freq_b": 741, "interval": "fourth", "ratio": 1.40},
    ]
    return {"pairs": pairs, "binaural_base": 7}


@router.get("/movement-summary")
async def get_movement_summary(user=Depends(get_current_user)):
    """Return aggregated movement history summary for the user."""
    cursor = db.movement_history.find(
        {"user_id": user["id"]},
        {"_id": 0, "route_key": 1, "frequency": 1, "duration_ms": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(50)
    history = await cursor.to_list(length=50)

    if not history:
        return {"total_sessions": 0, "dominant_frequency": 432, "routes_visited": [], "total_duration_ms": 0}

    freq_counts = {}
    route_set = set()
    total_dur = 0
    for h in history:
        f = h.get("frequency", 432)
        freq_counts[f] = freq_counts.get(f, 0) + 1
        route_set.add(h.get("route_key", ""))
        total_dur += h.get("duration_ms", 0)

    dominant = max(freq_counts, key=freq_counts.get) if freq_counts else 432

    return {
        "total_sessions": len(history),
        "dominant_frequency": dominant,
        "frequency_distribution": freq_counts,
        "routes_visited": list(route_set),
        "total_duration_ms": total_dur,
    }



class HarmonicBookmark(BaseModel):
    module_a: str
    module_b: str
    intensity: float = 0.0
    interval: str = "third"


@router.post("/record-harmonic")
async def record_harmonic(data: HarmonicBookmark, user=Depends(get_current_user)):
    """Bookmark a high-resonance sphere pairing for Harmonic Memory."""
    pair_key = "-".join(sorted([data.module_a, data.module_b]))
    existing = await db.harmonic_memory.find_one(
        {"user_id": user["id"], "pair_key": pair_key},
        {"_id": 0}
    )
    if existing:
        await db.harmonic_memory.update_one(
            {"user_id": user["id"], "pair_key": pair_key},
            {"$inc": {"count": 1, "total_intensity": data.intensity},
             "$set": {"last_interval": data.interval, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.harmonic_memory.insert_one({
            "user_id": user["id"],
            "pair_key": pair_key,
            "module_a": data.module_a,
            "module_b": data.module_b,
            "count": 1,
            "total_intensity": data.intensity,
            "last_interval": data.interval,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
    return {"success": True, "pair_key": pair_key}


@router.get("/harmonic-memory")
async def get_harmonic_memory(user=Depends(get_current_user)):
    """Return preferred sphere pairings with suggested starting positions."""
    cursor = db.harmonic_memory.find(
        {"user_id": user["id"]},
        {"_id": 0, "pair_key": 1, "module_a": 1, "module_b": 1, "count": 1,
         "total_intensity": 1, "last_interval": 1}
    ).sort("count", -1).limit(10)
    memories = await cursor.to_list(length=10)

    # Generate position suggestions — favorite pairs placed closer together
    suggestions = []
    import math
    for i, mem in enumerate(memories):
        avg_intensity = mem.get("total_intensity", 0) / max(1, mem.get("count", 1))
        # Higher interaction count = closer starting distance
        closeness = min(0.8, mem.get("count", 0) * 0.05)
        base_angle = (i / max(1, len(memories))) * 2 * math.pi
        suggestions.append({
            "pair_key": mem["pair_key"],
            "module_a": mem["module_a"],
            "module_b": mem["module_b"],
            "interaction_count": mem.get("count", 0),
            "avg_intensity": round(avg_intensity, 3),
            "closeness_factor": round(closeness, 3),
            "suggested_angle_offset": round(base_angle, 3),
            "last_interval": mem.get("last_interval", "third"),
        })

    return {"memories": suggestions, "total_bookmarks": len(memories)}



class SessionResonanceData(BaseModel):
    active_pairs: list = []
    total_resonances: int = 0
    strongest_interval: str = "none"
    session_duration_ms: int = 0


@router.post("/harmony-score")
async def calculate_harmony_score(data: SessionResonanceData, user=Depends(get_current_user)):
    """Calculate a Session Harmony Score (0-100) comparing current session to historical patterns."""
    import math

    # Fetch historical harmonic memory
    cursor = db.harmonic_memory.find(
        {"user_id": user["id"]},
        {"_id": 0, "pair_key": 1, "count": 1, "total_intensity": 1, "last_interval": 1}
    ).sort("count", -1).limit(20)
    memories = await cursor.to_list(length=20)

    # Fetch recent movement diversity
    mv_cursor = db.movement_history.find(
        {"user_id": user["id"]},
        {"_id": 0, "route_key": 1, "frequency": 1}
    ).sort("timestamp", -1).limit(30)
    movements = await mv_cursor.to_list(length=30)

    if not memories and not movements:
        return {
            "score": 50,
            "grade": "Neutral",
            "breakdown": {
                "resonance_alignment": 50,
                "exploration_diversity": 50,
                "harmonic_depth": 50,
            },
            "insight": "Begin exploring sphere combinations to build your harmonic profile.",
            "historical_pairs": 0,
        }

    # 1. Resonance Alignment (40 pts) — how well current pairs match historical favorites
    alignment_score = 0
    historical_pairs = {m["pair_key"]: m for m in memories}
    if data.active_pairs and historical_pairs:
        matches = sum(1 for p in data.active_pairs if p in historical_pairs)
        alignment_score = min(40, (matches / max(1, len(data.active_pairs))) * 40)
    elif data.total_resonances > 0:
        alignment_score = min(20, data.total_resonances * 4)

    # 2. Exploration Diversity (30 pts) — how many unique routes/frequencies visited
    route_diversity = len(set(m.get("route_key", "") for m in movements))
    freq_diversity = len(set(m.get("frequency", 0) for m in movements))
    diversity_score = min(30, (route_diversity * 3 + freq_diversity * 4))

    # 3. Harmonic Depth (30 pts) — quality of resonance interactions
    interval_weights = {"octave": 10, "fifth": 8, "fourth": 6, "third": 4, "second": 2, "unison": 1}
    depth_score = 0
    if data.strongest_interval and data.strongest_interval != "none":
        depth_score += interval_weights.get(data.strongest_interval, 2) * 2
    total_intensity = sum(m.get("total_intensity", 0) for m in memories)
    depth_score += min(10, total_intensity * 2)
    depth_score = min(30, depth_score)

    total_score = min(100, round(alignment_score + diversity_score + depth_score))

    # Grade
    if total_score >= 90: grade = "Transcendent"
    elif total_score >= 75: grade = "Harmonious"
    elif total_score >= 60: grade = "Resonant"
    elif total_score >= 40: grade = "Awakening"
    elif total_score >= 20: grade = "Seeking"
    else: grade = "Dormant"

    # Insight
    insights = {
        "Transcendent": "Your session is perfectly aligned with your cosmic resonance pattern.",
        "Harmonious": "Strong harmonic coherence. Your sphere interactions reflect deep familiarity.",
        "Resonant": "Good alignment. Try holding compatible spheres closer for deeper phase-lock.",
        "Awakening": "Your harmonic profile is building. Explore new sphere combinations.",
        "Seeking": "Keep exploring — each interaction adds to your resonance memory.",
        "Dormant": "Pull modules from the crossbar to begin building resonance.",
    }

    return {
        "score": total_score,
        "grade": grade,
        "breakdown": {
            "resonance_alignment": round(alignment_score),
            "exploration_diversity": round(diversity_score),
            "harmonic_depth": round(depth_score),
        },
        "insight": insights.get(grade, ""),
        "historical_pairs": len(memories),
    }


@router.post("/streak-check")
async def check_resonance_streak(data: SessionResonanceData, user=Depends(get_current_user)):
    """Check and update Resonance Streak. Awards XP when streak hits 3+ consecutive Harmonious scores."""
    # Get or create streak record
    streak = await db.resonance_streaks.find_one({"user_id": user["id"]}, {"_id": 0})
    if not streak:
        streak = {"user_id": user["id"], "current_streak": 0, "best_streak": 0,
                  "total_xp_earned": 0, "last_score": 0, "streak_active": False}
        await db.resonance_streaks.insert_one({**streak})

    # Calculate current score (lightweight inline)
    score = data.total_resonances * 4 + len(data.active_pairs) * 8
    interval_bonus = {"octave": 15, "fifth": 10, "fourth": 8, "third": 5}.get(data.strongest_interval, 0)
    score = min(100, score + interval_bonus)

    # Streak logic: score >= 75 increments, < 75 resets
    new_streak = streak.get("current_streak", 0)
    streak_triggered = False
    xp_awarded = 0

    if score >= 75:
        new_streak += 1
        if new_streak >= 3 and new_streak % 3 == 0:
            # Award XP: 50 base + 25 per additional 3-streak cycle
            xp_awarded = 50 + ((new_streak // 3) - 1) * 25
            streak_triggered = True
            # Record XP in mastery system
            try:
                mastery = await db.sovereign_mastery.find_one({"user_id": user["id"]})
                if mastery:
                    await db.sovereign_mastery.update_one(
                        {"user_id": user["id"]},
                        {"$inc": {"total_xp": xp_awarded}}
                    )
            except Exception:
                pass
    else:
        new_streak = 0

    best_streak = max(streak.get("best_streak", 0), new_streak)
    total_xp = streak.get("total_xp_earned", 0) + xp_awarded

    await db.resonance_streaks.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "current_streak": new_streak,
            "best_streak": best_streak,
            "total_xp_earned": total_xp,
            "last_score": score,
            "streak_active": new_streak >= 3,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )

    return {
        "current_streak": new_streak,
        "best_streak": best_streak,
        "streak_active": new_streak >= 3,
        "streak_triggered": streak_triggered,
        "xp_awarded": xp_awarded,
        "total_xp_earned": total_xp,
        "score_used": score,
    }


@router.get("/streak-status")
async def get_streak_status(user=Depends(get_current_user)):
    """Get current Resonance Streak status."""
    streak = await db.resonance_streaks.find_one({"user_id": user["id"]}, {"_id": 0})
    if not streak:
        return {"current_streak": 0, "best_streak": 0, "streak_active": False,
                "total_xp_earned": 0, "last_score": 0}
    streak.pop("user_id", None)
    return streak
