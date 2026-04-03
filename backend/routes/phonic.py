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
