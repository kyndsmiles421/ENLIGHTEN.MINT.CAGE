import asyncio
import uuid
import math
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()


def _zodiac_from_date(birth_date_str):
    try:
        parts = birth_date_str.split("-")
        m, d = int(parts[1]), int(parts[2])
    except Exception:
        return None
    signs = [
        (1, 20, "capricorn"), (2, 19, "aquarius"), (3, 20, "pisces"),
        (4, 20, "aries"), (5, 21, "taurus"), (6, 21, "gemini"),
        (7, 22, "cancer"), (8, 23, "leo"), (9, 23, "virgo"),
        (10, 23, "libra"), (11, 22, "scorpio"), (12, 22, "sagittarius"), (12, 31, "capricorn"),
    ]
    for end_m, end_d, sign in signs:
        if m < end_m or (m == end_m and d <= end_d):
            return sign
    return "capricorn"


ZODIAC_INFO = {
    "aries": {"name": "Aries", "symbol": "Ram", "element": "Fire", "ruling_planet": "Mars", "quality": "Cardinal"},
    "taurus": {"name": "Taurus", "symbol": "Bull", "element": "Earth", "ruling_planet": "Venus", "quality": "Fixed"},
    "gemini": {"name": "Gemini", "symbol": "Twins", "element": "Air", "ruling_planet": "Mercury", "quality": "Mutable"},
    "cancer": {"name": "Cancer", "symbol": "Crab", "element": "Water", "ruling_planet": "Moon", "quality": "Cardinal"},
    "leo": {"name": "Leo", "symbol": "Lion", "element": "Fire", "ruling_planet": "Sun", "quality": "Fixed"},
    "virgo": {"name": "Virgo", "symbol": "Maiden", "element": "Earth", "ruling_planet": "Mercury", "quality": "Mutable"},
    "libra": {"name": "Libra", "symbol": "Scales", "element": "Air", "ruling_planet": "Venus", "quality": "Cardinal"},
    "scorpio": {"name": "Scorpio", "symbol": "Scorpion", "element": "Water", "ruling_planet": "Pluto", "quality": "Fixed"},
    "sagittarius": {"name": "Sagittarius", "symbol": "Archer", "element": "Fire", "ruling_planet": "Jupiter", "quality": "Mutable"},
    "capricorn": {"name": "Capricorn", "symbol": "Sea-Goat", "element": "Earth", "ruling_planet": "Saturn", "quality": "Cardinal"},
    "aquarius": {"name": "Aquarius", "symbol": "Water Bearer", "element": "Air", "ruling_planet": "Uranus", "quality": "Fixed"},
    "pisces": {"name": "Pisces", "symbol": "Fish", "element": "Water", "ruling_planet": "Neptune", "quality": "Mutable"},
}

PLANET_TRANSITS = [
    {"planet": "Mercury", "effect": "communication and mental clarity"},
    {"planet": "Venus", "effect": "love, beauty, and creative expression"},
    {"planet": "Mars", "effect": "energy, drive, and physical vitality"},
    {"planet": "Jupiter", "effect": "expansion, luck, and spiritual growth"},
    {"planet": "Saturn", "effect": "discipline, structure, and karmic lessons"},
    {"planet": "Neptune", "effect": "intuition, dreams, and spiritual connection"},
    {"planet": "Uranus", "effect": "sudden changes, innovation, and awakening"},
    {"planet": "Pluto", "effect": "deep transformation and rebirth"},
]


def _get_current_planetary_context(now):
    day_of_year = now.timetuple().tm_yday
    moon_phase_day = (day_of_year % 29.5)
    if moon_phase_day < 3.7:
        moon_phase = "New Moon"
        moon_energy = "fresh beginnings and setting intentions"
    elif moon_phase_day < 7.4:
        moon_phase = "Waxing Crescent"
        moon_energy = "building momentum and planting seeds"
    elif moon_phase_day < 11.1:
        moon_phase = "First Quarter"
        moon_energy = "taking action and overcoming challenges"
    elif moon_phase_day < 14.8:
        moon_phase = "Waxing Gibbous"
        moon_energy = "refining and adjusting your approach"
    elif moon_phase_day < 18.5:
        moon_phase = "Full Moon"
        moon_energy = "illumination, culmination, and emotional release"
    elif moon_phase_day < 22.1:
        moon_phase = "Waning Gibbous"
        moon_energy = "gratitude, sharing wisdom, and teaching"
    elif moon_phase_day < 25.8:
        moon_phase = "Last Quarter"
        moon_energy = "release, forgiveness, and letting go"
    else:
        moon_phase = "Waning Crescent"
        moon_energy = "rest, reflection, and surrender"

    active_planets = []
    for i, p in enumerate(PLANET_TRANSITS):
        phase = math.sin((day_of_year + i * 37) * 0.05)
        if phase > 0.3:
            active_planets.append(p)

    return {
        "moon_phase": moon_phase,
        "moon_energy": moon_energy,
        "active_transits": active_planets[:4],
    }


@router.post("/star-chart/astrology-reading")
async def get_astrology_reading(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    uid = user["id"]
    constellation_id = data.get("constellation_id", "")
    constellation_name = data.get("constellation_name", "")
    constellation_element = data.get("constellation_element", "")
    constellation_meaning = data.get("constellation_meaning", "")

    now = datetime.now(timezone.utc)

    profile = await db.profiles.find_one({"user_id": uid}, {"_id": 0})
    birth_date = profile.get("birth_date", "") if profile else ""
    user_zodiac = _zodiac_from_date(birth_date) if birth_date else None
    zodiac_info = ZODIAC_INFO.get(user_zodiac, {}) if user_zodiac else {}

    aura_doc = await db.aura_readings.find_one(
        {"user_id": uid}, {"_id": 0}, sort=[("created_at", -1)]
    )
    aura_color = aura_doc.get("aura_color", "") if aura_doc else ""

    recent_moods = await db.mood_entries.find(
        {"user_id": uid}, {"_id": 0, "mood": 1, "intensity": 1}
    ).sort("created_at", -1).to_list(7)
    mood_summary = ", ".join([f"{m['mood']} ({m.get('intensity', 5)}/10)" for m in recent_moods]) if recent_moods else "No recent mood data"

    planetary = _get_current_planetary_context(now)
    transit_desc = "; ".join([f"{t['planet']} influences {t['effect']}" for t in planetary["active_transits"]])

    is_own_constellation = user_zodiac == constellation_id

    system_msg = (
        "You are a wise and mystical astrologer in The Cosmic Collective — a wellness platform "
        "that blends ancient wisdom with modern cosmic awareness. Your readings are warm, insightful, "
        "deeply personalized, and spiritually uplifting. Use poetic but accessible language. "
        "Structure your response as a JSON object with these exact keys:\n"
        '{"cosmic_influence": "2-3 sentences about how this constellation\'s energy currently affects the user",\n'
        '"planetary_message": "2-3 sentences about current planetary influences",\n'
        '"personal_guidance": "3-4 sentences of personalized guidance for the user",\n'
        '"energy_forecast": "brief 1-2 sentence energy forecast for today/this week",\n'
        '"affirmation": "one powerful cosmic affirmation",\n'
        '"power_element": "Fire/Water/Air/Earth - the dominant element affecting them right now",\n'
        '"intensity": 1-10 integer representing cosmic intensity level}\n'
        "Return ONLY valid JSON, no markdown."
    )

    prompt_parts = [
        f"Generate a deeply personalized astrology reading for someone exploring the constellation {constellation_name}.",
        f"Constellation element: {constellation_element}. Meaning: {constellation_meaning}.",
        f"Current moon phase: {planetary['moon_phase']} ({planetary['moon_energy']}).",
    ]
    if transit_desc:
        prompt_parts.append(f"Active planetary transits: {transit_desc}.")
    if zodiac_info:
        prompt_parts.append(
            f"User's birth sign: {zodiac_info.get('name', '')} ({zodiac_info.get('element', '')} sign, "
            f"ruled by {zodiac_info.get('ruling_planet', '')}, {zodiac_info.get('quality', '')} quality)."
        )
    if is_own_constellation:
        prompt_parts.append("This is the user's OWN birth constellation — make the reading extra personal and powerful.")
    if aura_color:
        prompt_parts.append(f"User's current aura color: {aura_color}.")
    if mood_summary and mood_summary != "No recent mood data":
        prompt_parts.append(f"Recent emotional states: {mood_summary}.")
    prompt_parts.append(f"Date: {now.strftime('%B %d, %Y')}.")

    prompt = " ".join(prompt_parts)

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"astro-reading-{uuid.uuid4().hex[:8]}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-4o")
        raw = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=25)
        import json
        raw_text = raw.text if hasattr(raw, 'text') else str(raw)
        raw_text = raw_text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        reading = json.loads(raw_text)
    except Exception as e:
        logger.error(f"Astrology reading AI error: {e}")
        reading = {
            "cosmic_influence": f"The {constellation_element} energy of {constellation_name} flows through you now, activating deep centers of awareness. This constellation's ancient light carries messages specifically attuned to your spiritual frequency.",
            "planetary_message": f"Under the {planetary['moon_phase']}, the cosmos invites {planetary['moon_energy']}. Trust in the rhythms of the universe.",
            "personal_guidance": f"As you gaze upon {constellation_name}, allow its {constellation_element.lower()} energy to guide your intentions. The stars remind you that your path is written in light.",
            "energy_forecast": f"The {planetary['moon_phase']} amplifies {constellation_element.lower()} energies this week.",
            "affirmation": f"I am aligned with the cosmic wisdom of {constellation_name}.",
            "power_element": constellation_element or "Air",
            "intensity": 7,
        }

    result = {
        "reading": reading,
        "constellation": {
            "id": constellation_id,
            "name": constellation_name,
            "element": constellation_element,
        },
        "user_zodiac": zodiac_info.get("name") if zodiac_info else None,
        "is_own_constellation": is_own_constellation,
        "moon_phase": planetary["moon_phase"],
        "moon_energy": planetary["moon_energy"],
        "active_transits": [t["planet"] for t in planetary["active_transits"]],
        "timestamp": now.isoformat(),
    }

    await db.astrology_readings.insert_one({
        "user_id": uid,
        "constellation_id": constellation_id,
        "reading": reading,
        "moon_phase": planetary["moon_phase"],
        "is_own_constellation": is_own_constellation,
        "created_at": now,
    })

    return result
