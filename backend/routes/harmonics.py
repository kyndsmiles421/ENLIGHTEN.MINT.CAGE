from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
import math
import asyncio
import uuid

router = APIRouter(prefix="/harmonics", tags=["harmonics"])

# ── Moon phase calculation (pure astronomical math — no external API) ──
def get_moon_phase():
    """Calculate current moon phase using synodic period."""
    now = datetime.now(timezone.utc)
    # Known new moon reference: Jan 6 2000 18:14 UTC
    ref = datetime(2000, 1, 6, 18, 14, 0, tzinfo=timezone.utc)
    days_since = (now - ref).total_seconds() / 86400
    synodic = 29.53058770576
    cycle = (days_since % synodic) / synodic  # 0.0 = new, 0.5 = full

    if cycle < 0.0625:
        name, emoji = "New Moon", "new"
    elif cycle < 0.1875:
        name, emoji = "Waxing Crescent", "waxing_crescent"
    elif cycle < 0.3125:
        name, emoji = "First Quarter", "first_quarter"
    elif cycle < 0.4375:
        name, emoji = "Waxing Gibbous", "waxing_gibbous"
    elif cycle < 0.5625:
        name, emoji = "Full Moon", "full"
    elif cycle < 0.6875:
        name, emoji = "Waning Gibbous", "waning_gibbous"
    elif cycle < 0.8125:
        name, emoji = "Last Quarter", "last_quarter"
    elif cycle < 0.9375:
        name, emoji = "Waning Crescent", "waning_crescent"
    else:
        name, emoji = "New Moon", "new"

    illumination = round((1 - math.cos(2 * math.pi * cycle)) / 2, 3)
    return {"phase": name, "phase_id": emoji, "cycle": round(cycle, 4), "illumination": illumination}


# ── Solar position ──
def get_solar_cycle():
    """Determine time of day category based on UTC hour."""
    hour = datetime.now(timezone.utc).hour
    if 5 <= hour < 7:
        return {"period": "Golden Hour", "period_id": "golden_dawn", "color": "#FCD34D"}
    elif 7 <= hour < 12:
        return {"period": "Morning Light", "period_id": "morning", "color": "#FBBF24"}
    elif 12 <= hour < 16:
        return {"period": "Solar Zenith", "period_id": "zenith", "color": "#F59E0B"}
    elif 16 <= hour < 18:
        return {"period": "Golden Hour", "period_id": "golden_dusk", "color": "#F97316"}
    elif 18 <= hour < 20:
        return {"period": "Blue Hour", "period_id": "blue_hour", "color": "#818CF8"}
    elif 20 <= hour < 23:
        return {"period": "Deep Night", "period_id": "night", "color": "#6366F1"}
    else:
        return {"period": "Cosmic Void", "period_id": "void", "color": "#4F46E5"}


# ── Zodiac transit ──
def get_zodiac_transit():
    """Current zodiac sign based on ecliptic solar position."""
    now = datetime.now(timezone.utc)
    day = now.timetuple().tm_yday
    signs = [
        (20, "Aquarius", "#00E5FF", "Air", "Innovation & cosmic consciousness"),
        (49, "Pisces", "#818CF8", "Water", "Intuition & spiritual depth"),
        (80, "Aries", "#EF4444", "Fire", "Courage & new beginnings"),
        (110, "Taurus", "#22C55E", "Earth", "Stability & sensory grounding"),
        (141, "Gemini", "#FBBF24", "Air", "Communication & dual awareness"),
        (172, "Cancer", "#C084FC", "Water", "Nurturing & emotional wisdom"),
        (204, "Leo", "#F97316", "Fire", "Creative radiance & self-expression"),
        (235, "Virgo", "#2DD4BF", "Earth", "Healing & sacred service"),
        (266, "Libra", "#FDA4AF", "Air", "Balance & harmonious flow"),
        (296, "Scorpio", "#DC2626", "Water", "Transformation & deep truth"),
        (326, "Sagittarius", "#A855F7", "Fire", "Expansion & higher knowledge"),
        (356, "Capricorn", "#64748B", "Earth", "Discipline & cosmic structure"),
        (366, "Capricorn", "#64748B", "Earth", "Discipline & cosmic structure"),
    ]
    for end_day, name, color, element, theme in signs:
        if day <= end_day:
            return {"sign": name, "color": color, "element": element, "theme": theme}
    return {"sign": "Capricorn", "color": "#64748B", "element": "Earth", "theme": "Discipline & cosmic structure"}


# ── Phase-based recommendations ──
PHASE_GUIDANCE = {
    "new": {
        "energy": "introspective",
        "frequency": 174,
        "frequency_name": "174Hz Foundation",
        "meditation": "New Moon Intention Setting",
        "atmosphere": {"bg": "#0A0A14", "accent": "#4F46E5", "particle_density": 0.3, "nebula_intensity": 0.2},
        "affirmation_seed": "new beginnings, planting seeds of intention, quiet inner space",
    },
    "waxing_crescent": {
        "energy": "building",
        "frequency": 285,
        "frequency_name": "285Hz Cellular Renewal",
        "meditation": "Growth Visualization",
        "atmosphere": {"bg": "#0A0C14", "accent": "#22C55E", "particle_density": 0.4, "nebula_intensity": 0.3},
        "affirmation_seed": "steady growth, nurturing dreams, first steps toward manifestation",
    },
    "first_quarter": {
        "energy": "action",
        "frequency": 396,
        "frequency_name": "396Hz Liberation",
        "meditation": "Overcoming Obstacles",
        "atmosphere": {"bg": "#0C0A14", "accent": "#FBBF24", "particle_density": 0.5, "nebula_intensity": 0.4},
        "affirmation_seed": "decisive action, breaking through barriers, courage under cosmic alignment",
    },
    "waxing_gibbous": {
        "energy": "refining",
        "frequency": 417,
        "frequency_name": "417Hz Change",
        "meditation": "Refinement & Trust",
        "atmosphere": {"bg": "#0C0C18", "accent": "#2DD4BF", "particle_density": 0.6, "nebula_intensity": 0.5},
        "affirmation_seed": "fine-tuning, trusting the process, preparing for fulfillment",
    },
    "full": {
        "energy": "peak",
        "frequency": 528,
        "frequency_name": "528Hz Love Miracle",
        "meditation": "Full Moon Illumination",
        "atmosphere": {"bg": "#0E0E1A", "accent": "#F8FAFC", "particle_density": 0.9, "nebula_intensity": 0.8},
        "affirmation_seed": "peak radiance, full illumination, gratitude and release of what no longer serves",
    },
    "waning_gibbous": {
        "energy": "sharing",
        "frequency": 639,
        "frequency_name": "639Hz Connection",
        "meditation": "Gratitude & Sharing",
        "atmosphere": {"bg": "#0C0A16", "accent": "#FDA4AF", "particle_density": 0.7, "nebula_intensity": 0.6},
        "affirmation_seed": "sharing wisdom, expressing gratitude, connecting with community",
    },
    "last_quarter": {
        "energy": "releasing",
        "frequency": 741,
        "frequency_name": "741Hz Intuition",
        "meditation": "Release & Forgive",
        "atmosphere": {"bg": "#0A0A14", "accent": "#818CF8", "particle_density": 0.4, "nebula_intensity": 0.4},
        "affirmation_seed": "letting go, forgiveness, clearing space for renewal",
    },
    "waning_crescent": {
        "energy": "rest",
        "frequency": 852,
        "frequency_name": "852Hz Awakening",
        "meditation": "Surrender & Rest",
        "atmosphere": {"bg": "#080810", "accent": "#6366F1", "particle_density": 0.2, "nebula_intensity": 0.15},
        "affirmation_seed": "deep rest, surrender, spiritual downloading before the next cycle",
    },
}


@router.get("/celestial")
async def get_celestial_state():
    """Returns current moon phase, solar cycle, zodiac transit, and recommendations."""
    moon = get_moon_phase()
    solar = get_solar_cycle()
    zodiac = get_zodiac_transit()
    guidance = PHASE_GUIDANCE.get(moon["phase_id"], PHASE_GUIDANCE["new"])

    return {
        "moon": moon,
        "solar": solar,
        "zodiac": zodiac,
        "guidance": {
            "energy": guidance["energy"],
            "recommended_frequency": guidance["frequency"],
            "recommended_frequency_name": guidance["frequency_name"],
            "recommended_meditation": guidance["meditation"],
            "affirmation_seed": guidance["affirmation_seed"],
        },
        "atmosphere": guidance["atmosphere"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/atmosphere")
async def get_atmosphere():
    """Returns just the visual atmosphere settings for the current celestial state."""
    moon = get_moon_phase()
    guidance = PHASE_GUIDANCE.get(moon["phase_id"], PHASE_GUIDANCE["new"])
    return {
        "moon_phase": moon["phase"],
        "moon_illumination": moon["illumination"],
        **guidance["atmosphere"],
    }


@router.get("/affirmation")
async def get_personalized_affirmation(user=Depends(get_current_user)):
    """Generate AI affirmation based on mood trends + celestial alignment."""
    uid = user["id"]
    moon = get_moon_phase()
    zodiac = get_zodiac_transit()
    guidance = PHASE_GUIDANCE.get(moon["phase_id"], PHASE_GUIDANCE["new"])

    # Gather last 7 days of mood + journal data
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_moods = await db.moods.find(
        {"user_id": uid, "created_at": {"$gte": week_ago.isoformat()}},
        {"_id": 0, "mood": 1, "energy": 1}
    ).sort("created_at", -1).to_list(20)

    recent_journals = await db.journals.find(
        {"user_id": uid, "created_at": {"$gte": week_ago.isoformat()}},
        {"_id": 0, "content": 1, "mood": 1}
    ).sort("created_at", -1).to_list(5)

    mood_list = [m.get("mood", "") for m in recent_moods if m.get("mood")]
    energy_list = [m.get("energy", 0) for m in recent_moods if m.get("energy")]
    journal_snippets = [j.get("content", "")[:100] for j in recent_journals if j.get("content")]

    mood_summary = ", ".join(mood_list[:8]) if mood_list else "no recent moods recorded"
    avg_energy = round(sum(energy_list) / len(energy_list), 1) if energy_list else None
    journal_summary = " | ".join(journal_snippets[:3]) if journal_snippets else ""

    # Build the affirmation
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"affirmation-{uuid.uuid4()}",
            system_message=(
                "You are a celestial wisdom guide for The Cosmic Collective. "
                "Generate a deeply personal, spiritually resonant affirmation (2-3 sentences). "
                "Weave together the person's emotional patterns, the current moon phase, and zodiac transit. "
                "Be warm, specific, and empowering. Do NOT use generic platitudes. "
                "Speak as if the cosmos is addressing them directly."
            )
        )
        prompt = (
            f"Generate a personalized affirmation for someone with these recent moods: {mood_summary}. "
            f"{'Average energy level: ' + str(avg_energy) + '/10. ' if avg_energy else ''}"
            f"{'Recent journal themes: ' + journal_summary + '. ' if journal_summary else ''}"
            f"Current moon: {moon['phase']} ({moon['illumination']*100:.0f}% illumination). "
            f"Zodiac transit: {zodiac['sign']} ({zodiac['element']}), theme: {zodiac['theme']}. "
            f"Cosmic energy: {guidance['energy']}. Affirmation seed: {guidance['affirmation_seed']}."
        )
        response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=20)
        affirmation_text = response
    except Exception as e:
        logger.error(f"Affirmation AI error: {e}")
        # Fallback: use the seed directly
        seed = guidance["affirmation_seed"]
        affirmation_text = f"Under the {moon['phase']}, the {zodiac['sign']} energy guides you toward {seed}. Trust this cosmic rhythm."

    return {
        "affirmation": affirmation_text,
        "moon_phase": moon["phase"],
        "zodiac": zodiac["sign"],
        "energy_type": guidance["energy"],
        "mood_trend": mood_summary,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
