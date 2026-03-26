from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json as json_mod
import random

router = APIRouter()

# ========== COSMIC FORECASTS ==========

FORECAST_PERIODS = ["daily", "weekly", "monthly", "yearly"]

FORECAST_SYSTEMS = {
    "astrology": {
        "name": "Astrology",
        "color": "#C084FC",
        "icon": "star",
        "desc": "Planetary alignments and zodiac insights",
    },
    "tarot": {
        "name": "Tarot",
        "color": "#FDA4AF",
        "icon": "layers",
        "desc": "Cards of fate and spiritual guidance",
    },
    "numerology": {
        "name": "Numerology",
        "color": "#FCD34D",
        "icon": "hash",
        "desc": "Sacred number vibrations and cycles",
    },
    "cardology": {
        "name": "Cardology",
        "color": "#2DD4BF",
        "icon": "creditCard",
        "desc": "Playing card destiny system",
    },
    "chinese": {
        "name": "Chinese Astrology",
        "color": "#EF4444",
        "icon": "globe",
        "desc": "Year animal and elemental wisdom",
    },
    "mayan": {
        "name": "Mayan Astrology",
        "color": "#FB923C",
        "icon": "sun",
        "desc": "Tzolkin calendar and day signs",
    },
}

ZODIAC_SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]


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


def _life_path_number(birth_date_str):
    try:
        digits = [int(c) for c in birth_date_str.replace("-", "") if c.isdigit()]
        total = sum(digits)
        while total > 9 and total not in (11, 22, 33):
            total = sum(int(d) for d in str(total))
        return total
    except Exception:
        return 7


def _chinese_animal(year):
    animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
               "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
    return animals[(year - 4) % 12]


def _cache_key(user_id, system, period):
    now = datetime.now(timezone.utc)
    if period == "daily":
        return f"{user_id}:{system}:{period}:{now.strftime('%Y-%m-%d')}"
    elif period == "weekly":
        week = now.isocalendar()[1]
        return f"{user_id}:{system}:{period}:{now.year}-W{week}"
    elif period == "monthly":
        return f"{user_id}:{system}:{period}:{now.strftime('%Y-%m')}"
    elif period == "yearly":
        return f"{user_id}:{system}:{period}:{now.year}"
    return f"{user_id}:{system}:{period}:{now.strftime('%Y-%m-%d')}"


@router.get("/forecasts/systems")
async def get_forecast_systems():
    """Return available forecast systems and periods."""
    return {
        "systems": FORECAST_SYSTEMS,
        "periods": FORECAST_PERIODS,
    }


@router.post("/forecasts/generate")
async def generate_forecast(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate a cosmic forecast for a given system and period."""
    system = data.get("system", "astrology")
    period = data.get("period", "daily")

    if system not in FORECAST_SYSTEMS:
        raise HTTPException(status_code=400, detail="Invalid forecast system")
    if period not in FORECAST_PERIODS:
        raise HTTPException(status_code=400, detail="Invalid period")

    # Check cache
    cache_key = _cache_key(user["id"], system, period)
    cached = await db.forecasts.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached:
        return cached

    # Get user profile for personalization
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    birth_date = profile.get("birth_date", "")
    zodiac = _zodiac_from_date(birth_date) if birth_date else None
    life_path = _life_path_number(birth_date) if birth_date else 7

    try:
        birth_year = int(birth_date.split("-")[0]) if birth_date else 1990
    except Exception:
        birth_year = 1990
    chinese_animal = _chinese_animal(birth_year)

    now = datetime.now(timezone.utc)
    period_desc = {
        "daily": f"today, {now.strftime('%A %B %d, %Y')}",
        "weekly": f"this week ({now.strftime('%B %d')} - {(now + timedelta(days=6)).strftime('%B %d, %Y')})",
        "monthly": f"this month of {now.strftime('%B %Y')}",
        "yearly": f"the year {now.year}",
    }[period]

    # Get recent mood for context
    recent_mood = await db.moods.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    mood = recent_mood.get("mood", "neutral") if recent_mood else "neutral"

    # Build system-specific prompt
    system_contexts = {
        "astrology": f"Western Astrology forecast. The seeker's zodiac sign is {zodiac or 'unknown'}. Include planetary transits, aspects, and house influences relevant to this sign for {period_desc}.",
        "tarot": f"Tarot card forecast. Draw {3 if period == 'daily' else 5 if period == 'weekly' else 7 if period == 'monthly' else 12} cards for {period_desc}. Name each card (from Major or Minor Arcana), state if upright or reversed, and weave them into a cohesive narrative.",
        "numerology": f"Numerology forecast. The seeker's Life Path number is {life_path}. Calculate the personal {period} number and provide insights for {period_desc}. Include vibrations, favorable numbers, and cosmic timing.",
        "cardology": f"Playing Card Destiny (Cardology) forecast. Use the Card of the Day/Week/Month/Year system for {period_desc}. Draw a card, name it clearly (e.g., 'Seven of Hearts'), and interpret its destiny meaning.",
        "chinese": f"Chinese Astrology forecast. The seeker's year animal is the {chinese_animal}. Provide insights based on the Chinese zodiac, elemental interactions, and auspicious directions for {period_desc}.",
        "mayan": f"Mayan Astrology forecast using the Tzolkin calendar. Calculate or reference the day sign energy for {period_desc}. Include the Mayan day sign (e.g., Imix, Ik, Akbal), its tone number, and the galactic energy.",
    }

    mood_note = f"The seeker's current mood is '{mood}'. Gently acknowledge this and show how the cosmic energies support them." if mood != "neutral" else ""

    prompt = f"""{system_contexts[system]}

{mood_note}

Create a richly detailed, personalized {period} forecast. Structure it as a JSON object with these fields:
- "title": A poetic title for this forecast (e.g., "The Chariot Rides Forward" or "Venus Enters Your Heart House")
- "summary": A 2-3 sentence overview (inspiring, specific, not generic)
- "sections": An array of 3-5 sections, each with "heading" (string), "content" (string, 2-4 sentences), and "energy" (string: "positive", "neutral", "challenging", or "transformative")
- "lucky": An object with "numbers" (array of 3 ints), "colors" (array of 2 strings), "element" (string), "crystal" (string)
- "affirmation": A powerful one-line affirmation for this period
- "overall_energy": A number 1-10 representing the overall cosmic energy level

Return ONLY valid JSON. No markdown, no explanation."""

    system_msg = f"You are a master cosmic forecaster combining ancient wisdom with intuitive insight. You specialize in {FORECAST_SYSTEMS[system]['name']}. Your forecasts are specific, poetic, deeply personal, and never generic. Always respond with valid JSON only."

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"forecast-{uuid.uuid4()}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-5.2")
        raw = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=45)

        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        forecast_data = json_mod.loads(cleaned)

        doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "user_id": user["id"],
            "system": system,
            "system_name": FORECAST_SYSTEMS[system]["name"],
            "system_color": FORECAST_SYSTEMS[system]["color"],
            "period": period,
            "period_desc": period_desc,
            "zodiac": zodiac,
            "forecast": forecast_data,
            "created_at": now.isoformat(),
        }
        await db.forecasts.insert_one(doc)
        doc.pop("_id", None)
        return doc

    except Exception as e:
        logger.error(f"Forecast generation error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate forecast. Please try again.")


@router.get("/forecasts/history")
async def get_forecast_history(user=Depends(get_current_user)):
    """Get user's recent forecasts."""
    items = await db.forecasts.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    return items


@router.delete("/forecasts/{forecast_id}")
async def delete_forecast(forecast_id: str, user=Depends(get_current_user)):
    result = await db.forecasts.delete_one({"id": forecast_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}
