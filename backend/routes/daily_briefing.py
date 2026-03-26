from fastapi import APIRouter, Depends, Query
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone
from collections import Counter
import asyncio
import math
import uuid

router = APIRouter()


@router.get("/daily-briefing")
async def get_daily_briefing(user=Depends(get_current_user)):
    """Personalized cosmic daily briefing - a spiritual weather forecast."""
    uid = user["id"]
    today = datetime.now(timezone.utc).date()

    # Gather all data in parallel
    (
        profile_doc, aura_doc, streak_doc,
        recent_moods, recent_dreams,
        yoga_ct, med_ct, ritual_today,
    ) = await asyncio.gather(
        db.profiles.find_one({"user_id": uid}, {"_id": 0}),
        db.aura_readings.find_one({"user_id": uid}, {"_id": 0}, sort=[("created_at", -1)]),
        db.streaks.find_one({"user_id": uid}, {"_id": 0}),
        db.moods.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(7),
        db.dreams.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(5),
        db.yoga_sessions.count_documents({"user_id": uid}),
        db.custom_meditations.count_documents({"user_id": uid}),
        db.daily_rituals.find_one({"user_id": uid, "date": today.isoformat()}, {"_id": 0}),
    )

    # Moon phase
    moon = _calc_moon_phase(today)

    # Mayan
    from routes.mayan import get_mayan_sign
    mayan = get_mayan_sign(today.year, today.month, today.day)

    # Numerology
    from routes.cosmic_calendar import _personal_year, _personal_month, _personal_day, PERSONAL_YEAR_MEANINGS
    birth_date = profile_doc.get("birth_date", "") if profile_doc else ""
    numerology = None
    if birth_date:
        try:
            parts = birth_date.split("-")
            _, bm, bd = int(parts[0]), int(parts[1]), int(parts[2])
            py = _personal_year(bm, bd, today.year)
            pm = _personal_month(py, today.month)
            pd = _personal_day(pm, today.day)
            py_info = PERSONAL_YEAR_MEANINGS.get(py, PERSONAL_YEAR_MEANINGS.get(1, {}))
            pd_info = PERSONAL_YEAR_MEANINGS.get(pd, PERSONAL_YEAR_MEANINGS.get(1, {}))
            numerology = {
                "personal_year": py, "year_theme": py_info.get("theme", ""),
                "personal_day": pd, "day_theme": pd_info.get("theme", ""),
            }
        except Exception:
            pass

    # Aura & mood
    aura_color = aura_doc.get("aura_color", "") if aura_doc else ""
    moods = [m.get("mood", "") for m in recent_moods]
    dominant_mood = max(set(moods), key=moods.count) if moods else "neutral"
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0

    # Dream symbols
    dream_symbols = []
    for d in recent_dreams:
        dream_symbols.extend(d.get("symbols", []))
    top_symbols = [s for s, _ in Counter(dream_symbols).most_common(3)]

    # Element energy
    element = mayan["sign"]["element"]
    element_guidance = {
        "Fire": {"energy": "Dynamic & transformative", "focus": "Take bold action, ignite your passion, practice Sun Salutations", "color": "#EF4444"},
        "Water": {"energy": "Intuitive & flowing", "focus": "Trust your intuition, practice Moon Salutations, connect with emotions", "color": "#3B82F6"},
        "Air": {"energy": "Mental & communicative", "focus": "Journal your thoughts, practice breathwork, share your wisdom", "color": "#A78BFA"},
        "Earth": {"energy": "Grounding & stable", "focus": "Strengthen your foundation, practice grounding yoga, tend to your body", "color": "#22C55E"},
    }.get(element, {"energy": "Balanced", "focus": "Flow with the day", "color": "#D8B4FE"})

    # Practice suggestions
    practices = []
    if element == "Fire":
        practices = [
            {"name": "Sun Salutation Flow", "type": "yoga", "link": "/exercises", "duration": "15 min"},
            {"name": "Cinnamon Aromatherapy", "type": "aromatherapy", "link": "/aromatherapy", "duration": "5 min"},
            {"name": "Solar Plexus Reiki", "type": "reiki", "link": "/reiki", "duration": "10 min"},
        ]
    elif element == "Water":
        practices = [
            {"name": "Moon Salutation Flow", "type": "yoga", "link": "/exercises", "duration": "15 min"},
            {"name": "Chamomile & Ylang Ylang", "type": "aromatherapy", "link": "/aromatherapy", "duration": "5 min"},
            {"name": "Sacral Chakra Healing", "type": "reiki", "link": "/reiki", "duration": "10 min"},
        ]
    elif element == "Air":
        practices = [
            {"name": "Breath of Fire Pranayama", "type": "breathing", "link": "/breathing", "duration": "10 min"},
            {"name": "Eucalyptus Diffusion", "type": "aromatherapy", "link": "/aromatherapy", "duration": "5 min"},
            {"name": "Third Eye Meditation", "type": "meditation", "link": "/meditation", "duration": "15 min"},
        ]
    else:
        practices = [
            {"name": "Grounding Warrior Sequence", "type": "yoga", "link": "/exercises", "duration": "15 min"},
            {"name": "Vetiver & Patchouli", "type": "aromatherapy", "link": "/aromatherapy", "duration": "5 min"},
            {"name": "Root Chakra Activation", "type": "reiki", "link": "/reiki", "duration": "10 min"},
        ]

    # Moon guidance
    moon_guidance = {
        "New Moon": "Set powerful intentions. The cosmos supports new beginnings today.",
        "Waxing Crescent": "Nurture your seeds of intention. Take small, deliberate steps forward.",
        "First Quarter": "Face challenges head-on. The moon empowers decisive action.",
        "Waxing Gibbous": "Refine and adjust. Trust the process as your goals take shape.",
        "Full Moon": "Celebrate and release. Illumination reveals what must be let go.",
        "Waning Gibbous": "Share your wisdom. Gratitude amplifies the moon's waning grace.",
        "Last Quarter": "Forgive and surrender. Clear space for the next cycle.",
        "Waning Crescent": "Rest and reflect. The void before renewal is sacred.",
    }.get(moon["phase"], "Flow with the lunar rhythm.")

    ritual_status = "completed" if (ritual_today and ritual_today.get("completed")) else "pending" if ritual_today else "not_started"

    return {
        "date": today.isoformat(),
        "greeting": _get_greeting(),
        "moon": {**moon, "guidance": moon_guidance},
        "mayan": {
            "kin": mayan["kin"],
            "glyph": mayan["sign"]["glyph"],
            "sign_name": mayan["sign"]["name"],
            "tone": mayan["tone"]["name"],
            "element": element,
            "galactic_signature": mayan["galactic_signature"],
            "meaning": mayan["sign"]["meaning"],
        },
        "numerology": numerology,
        "aura_color": aura_color,
        "element": {**element_guidance, "name": element},
        "mood": {"dominant": dominant_mood, "recent_count": len(moods)},
        "streak": streak,
        "dream_symbols": top_symbols,
        "recent_dreams": [{"title": d.get("title", ""), "mood": d.get("mood", "")} for d in recent_dreams[:3]],
        "practices": practices,
        "ritual_status": ritual_status,
    }


def _get_greeting():
    h = datetime.now(timezone.utc).hour
    if h < 12:
        return "Good morning, cosmic soul"
    elif h < 17:
        return "Good afternoon, radiant one"
    else:
        return "Good evening, stargazer"


def _calc_moon_phase(date):
    year, month, day = date.year, date.month, date.day
    if month <= 2:
        y_calc, m_calc = year - 1, month + 12
    else:
        y_calc, m_calc = year, month
    A = y_calc // 100
    B = A // 4
    C = 2 - A + B
    E = int(365.25 * (y_calc + 4716))
    F = int(30.6001 * (m_calc + 1))
    JD = C + day + E + F - 1524.5
    days_since = JD - 2451550.1
    new_moons = days_since / 29.530588853
    phase_frac = new_moons - int(new_moons)
    moon_age = phase_frac * 29.530588853
    phases = [
        (1.85, "New Moon", "new_moon"), (5.53, "Waxing Crescent", "waxing_crescent"),
        (9.22, "First Quarter", "first_quarter"), (12.91, "Waxing Gibbous", "waxing_gibbous"),
        (16.61, "Full Moon", "full_moon"), (20.30, "Waning Gibbous", "waning_gibbous"),
        (23.99, "Last Quarter", "last_quarter"), (27.68, "Waning Crescent", "waning_crescent"),
        (29.54, "New Moon", "new_moon"),
    ]
    name, code = "New Moon", "new_moon"
    for threshold, n, c in phases:
        if moon_age < threshold:
            name, code = n, c
            break
    return {"phase": name, "code": code, "age": round(moon_age, 1), "illumination": round(50 * (1 - math.cos(2 * math.pi * phase_frac)), 1)}


# ========== STAR CHART ==========

# Bright stars catalog (88 constellations, major stars with RA/Dec coordinates)
CONSTELLATIONS = [
    {"id": "aries", "name": "Aries", "symbol": "Ram", "element": "Fire", "ra": 2.0, "dec": 20.0,
     "stars": [{"name": "Hamal", "ra": 2.12, "dec": 23.46, "mag": 2.0}, {"name": "Sheratan", "ra": 1.91, "dec": 20.81, "mag": 2.6}, {"name": "Mesarthim", "ra": 1.89, "dec": 19.29, "mag": 3.9}],
     "meaning": "The pioneer spirit. Leadership, courage, and new beginnings."},
    {"id": "taurus", "name": "Taurus", "symbol": "Bull", "element": "Earth", "ra": 4.5, "dec": 16.0,
     "stars": [{"name": "Aldebaran", "ra": 4.6, "dec": 16.51, "mag": 0.85}, {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65}, {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87}],
     "meaning": "Steadfast determination. Material abundance, sensual beauty, and patience."},
    {"id": "gemini", "name": "Gemini", "symbol": "Twins", "element": "Air", "ra": 7.0, "dec": 22.0,
     "stars": [{"name": "Pollux", "ra": 7.76, "dec": 28.03, "mag": 1.14}, {"name": "Castor", "ra": 7.58, "dec": 31.89, "mag": 1.58}, {"name": "Alhena", "ra": 6.63, "dec": 16.4, "mag": 1.93}],
     "meaning": "The communicator. Duality, adaptability, intellectual curiosity."},
    {"id": "cancer", "name": "Cancer", "symbol": "Crab", "element": "Water", "ra": 8.5, "dec": 12.0,
     "stars": [{"name": "Tarf", "ra": 8.28, "dec": 9.19, "mag": 3.5}, {"name": "Acubens", "ra": 8.97, "dec": 11.86, "mag": 4.25}, {"name": "Asellus Australis", "ra": 8.74, "dec": 18.15, "mag": 3.94}],
     "meaning": "The nurturer. Emotional depth, intuition, home and belonging."},
    {"id": "leo", "name": "Leo", "symbol": "Lion", "element": "Fire", "ra": 10.5, "dec": 15.0,
     "stars": [{"name": "Regulus", "ra": 10.14, "dec": 11.97, "mag": 1.35}, {"name": "Denebola", "ra": 11.82, "dec": 14.57, "mag": 2.14}, {"name": "Algieba", "ra": 10.33, "dec": 19.84, "mag": 2.28}],
     "meaning": "The sovereign soul. Creative expression, courage, and radiant self."},
    {"id": "virgo", "name": "Virgo", "symbol": "Maiden", "element": "Earth", "ra": 13.0, "dec": -4.0,
     "stars": [{"name": "Spica", "ra": 13.42, "dec": -11.16, "mag": 0.97}, {"name": "Zavijava", "ra": 11.84, "dec": 1.76, "mag": 3.6}, {"name": "Porrima", "ra": 12.69, "dec": -1.45, "mag": 2.74}],
     "meaning": "Sacred service. Healing wisdom, purity, and mindful devotion."},
    {"id": "libra", "name": "Libra", "symbol": "Scales", "element": "Air", "ra": 15.0, "dec": -15.0,
     "stars": [{"name": "Zubeneschamali", "ra": 15.28, "dec": -9.38, "mag": 2.61}, {"name": "Zubenelgenubi", "ra": 14.85, "dec": -16.04, "mag": 2.75}],
     "meaning": "Divine balance. Harmony, partnership, beauty, and justice."},
    {"id": "scorpio", "name": "Scorpio", "symbol": "Scorpion", "element": "Water", "ra": 16.5, "dec": -26.0,
     "stars": [{"name": "Antares", "ra": 16.49, "dec": -26.43, "mag": 0.96}, {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63}, {"name": "Sargas", "ra": 17.62, "dec": -43.0, "mag": 1.87}],
     "meaning": "Transformative power. Death and rebirth, shadow mastery, intensity."},
    {"id": "sagittarius", "name": "Sagittarius", "symbol": "Archer", "element": "Fire", "ra": 19.0, "dec": -25.0,
     "stars": [{"name": "Kaus Australis", "ra": 18.4, "dec": -34.38, "mag": 1.85}, {"name": "Nunki", "ra": 18.92, "dec": -26.3, "mag": 2.02}, {"name": "Ascella", "ra": 19.04, "dec": -29.88, "mag": 2.59}],
     "meaning": "The seeker of truth. Expansion, philosophy, cosmic adventure."},
    {"id": "capricorn", "name": "Capricorn", "symbol": "Sea-Goat", "element": "Earth", "ra": 21.0, "dec": -18.0,
     "stars": [{"name": "Deneb Algedi", "ra": 21.74, "dec": -16.13, "mag": 2.87}, {"name": "Dabih", "ra": 20.35, "dec": -14.78, "mag": 3.08}],
     "meaning": "The master builder. Ambition, discipline, spiritual authority."},
    {"id": "aquarius", "name": "Aquarius", "symbol": "Water Bearer", "element": "Air", "ra": 22.5, "dec": -10.0,
     "stars": [{"name": "Sadalsuud", "ra": 21.53, "dec": -5.57, "mag": 2.91}, {"name": "Sadalmelik", "ra": 22.1, "dec": -0.32, "mag": 2.96}, {"name": "Skat", "ra": 22.91, "dec": -15.82, "mag": 3.27}],
     "meaning": "The visionary. Innovation, collective consciousness, awakening."},
    {"id": "pisces", "name": "Pisces", "symbol": "Fish", "element": "Water", "ra": 0.5, "dec": 8.0,
     "stars": [{"name": "Eta Piscium", "ra": 1.52, "dec": 15.35, "mag": 3.62}, {"name": "Gamma Piscium", "ra": 23.29, "dec": 3.28, "mag": 3.69}],
     "meaning": "The mystic dreamer. Compassion, transcendence, spiritual union."},
    # Major non-zodiac constellations
    {"id": "orion", "name": "Orion", "symbol": "Hunter", "element": "Fire", "ra": 5.5, "dec": 0.0,
     "stars": [{"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5}, {"name": "Rigel", "ra": 5.24, "dec": -8.2, "mag": 0.13}, {"name": "Bellatrix", "ra": 5.42, "dec": 6.35, "mag": 1.64}, {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23}, {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69}, {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77}, {"name": "Saiph", "ra": 5.8, "dec": -9.67, "mag": 2.09}],
     "meaning": "The cosmic warrior. Strength, protection, and guiding light through darkness."},
    {"id": "ursa_major", "name": "Ursa Major", "symbol": "Great Bear", "element": "Earth", "ra": 11.0, "dec": 55.0,
     "stars": [{"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79}, {"name": "Merak", "ra": 11.03, "dec": 56.38, "mag": 2.37}, {"name": "Phecda", "ra": 11.9, "dec": 53.69, "mag": 2.44}, {"name": "Megrez", "ra": 12.26, "dec": 57.03, "mag": 3.31}, {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77}, {"name": "Mizar", "ra": 13.4, "dec": 54.93, "mag": 2.27}, {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86}],
     "meaning": "The guardian. Ancestral wisdom, protection, and navigating by inner compass."},
    {"id": "lyra", "name": "Lyra", "symbol": "Lyre", "element": "Air", "ra": 18.9, "dec": 36.0,
     "stars": [{"name": "Vega", "ra": 18.62, "dec": 38.78, "mag": 0.03}, {"name": "Sheliak", "ra": 18.83, "dec": 33.36, "mag": 3.45}, {"name": "Sulafat", "ra": 18.98, "dec": 32.69, "mag": 3.24}],
     "meaning": "Divine harmony. The music of the spheres, artistic inspiration, celestial beauty."},
    {"id": "cygnus", "name": "Cygnus", "symbol": "Swan", "element": "Water", "ra": 20.5, "dec": 42.0,
     "stars": [{"name": "Deneb", "ra": 20.69, "dec": 45.28, "mag": 1.25}, {"name": "Sadr", "ra": 20.37, "dec": 40.26, "mag": 2.2}, {"name": "Albireo", "ra": 19.51, "dec": 27.96, "mag": 3.08}],
     "meaning": "Transcendent grace. Transformation, soul flight, and cosmic surrender."},
]


@router.get("/star-chart/constellations")
async def get_star_chart(
    lat: float = Query(default=40.7, description="Observer latitude"),
    lng: float = Query(default=-74.0, description="Observer longitude"),
    user=Depends(get_current_user),
):
    """Return constellation data for the 3D star chart, filtered by location visibility."""
    uid = user["id"]
    now = datetime.now(timezone.utc)

    # Calculate Local Sidereal Time (LST) for visibility
    # Simplified: LST in hours = (GMST + longitude/15)
    J2000 = 2451545.0
    # JD calculation
    y, m, d = now.year, now.month, now.day
    if m <= 2:
        y -= 1
        m += 12
    A = y // 100
    B = A // 4
    JD = int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + (2 - A + B) - 1524.5
    JD += (now.hour + now.minute / 60.0) / 24.0
    T = (JD - J2000) / 36525.0
    GMST = 280.46061837 + 360.98564736629 * (JD - J2000) + 0.000387933 * T * T
    GMST = GMST % 360
    LST = (GMST + lng) % 360
    lst_hours = LST / 15.0

    # Filter constellations visible from this latitude
    visible = []
    for c in CONSTELLATIONS:
        # A constellation is visible if its declination is > (lat - 90)
        min_dec = lat - 90
        max_dec = lat + 90
        if c["dec"] >= min_dec and c["dec"] <= max_dec:
            # Calculate altitude (simplified)
            ha = (lst_hours - c["ra"]) * 15  # hour angle in degrees
            alt = math.degrees(math.asin(
                math.sin(math.radians(lat)) * math.sin(math.radians(c["dec"])) +
                math.cos(math.radians(lat)) * math.cos(math.radians(c["dec"])) * math.cos(math.radians(ha))
            ))
            is_above = alt > -10  # slightly below horizon still partially visible
            visible.append({**c, "altitude": round(alt, 1), "above_horizon": is_above})

    # Get user's cosmic profile for avatar constellation mapping
    profile = await db.profiles.find_one({"user_id": uid}, {"_id": 0})
    aura_doc = await db.aura_readings.find_one({"user_id": uid}, {"_id": 0}, sort=[("created_at", -1)])

    # Mayan sign for today
    from routes.mayan import get_mayan_sign
    mayan = get_mayan_sign(now.year, now.month, now.day)
    mayan_element = mayan["sign"]["element"]

    # Map user's cosmic profile to constellation alignments
    birth_date = profile.get("birth_date", "") if profile else ""
    zodiac_sign = _zodiac_from_date(birth_date) if birth_date else None
    aura_color = aura_doc.get("aura_color", "") if aura_doc else ""

    # Mark aligned constellations
    for c in visible:
        c["aligned"] = False
        c["alignment_reason"] = []
        if zodiac_sign and c["id"] == zodiac_sign:
            c["aligned"] = True
            c["alignment_reason"].append("Your birth constellation")
        if c["element"] == mayan_element:
            c["alignment_reason"].append(f"Resonates with today's {mayan_element} energy ({mayan['sign']['glyph']})")

    return {
        "observer": {"lat": lat, "lng": lng, "lst_hours": round(lst_hours, 2)},
        "time": now.isoformat(),
        "constellations": visible,
        "user_zodiac": zodiac_sign,
        "mayan_element": mayan_element,
        "aura_color": aura_color,
        "mayan_glyph": mayan["sign"]["glyph"],
    }


def _zodiac_from_date(birth_date_str):
    """Get zodiac sign ID from birth date string."""
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
