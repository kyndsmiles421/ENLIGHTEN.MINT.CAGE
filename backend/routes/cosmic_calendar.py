from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid
import math

router = APIRouter()


def _personal_year(birth_month, birth_day, current_year):
    digits = [int(d) for d in str(birth_month)] + [int(d) for d in str(birth_day)] + [int(d) for d in str(current_year)]
    total = sum(digits)
    while total > 9 and total not in (11, 22, 33):
        total = sum(int(d) for d in str(total))
    return total


def _personal_month(personal_year, current_month):
    total = personal_year + current_month
    while total > 9 and total not in (11, 22, 33):
        total = sum(int(d) for d in str(total))
    return total


def _personal_day(personal_month, current_day):
    total = personal_month + current_day
    while total > 9 and total not in (11, 22, 33):
        total = sum(int(d) for d in str(total))
    return total


PERSONAL_YEAR_MEANINGS = {
    1: {"theme": "New Beginnings", "energy": "Initiation, independence, leadership", "advice": "Plant seeds. Start new projects. Step into your power.", "color": "#EF4444"},
    2: {"theme": "Partnership & Patience", "energy": "Cooperation, sensitivity, diplomacy", "advice": "Build relationships. Practice patience. Trust divine timing.", "color": "#3B82F6"},
    3: {"theme": "Creative Expression", "energy": "Joy, communication, artistic flow", "advice": "Create freely. Express yourself. Embrace social connections.", "color": "#FCD34D"},
    4: {"theme": "Foundation Building", "energy": "Discipline, structure, hard work", "advice": "Build solid foundations. Organize your life. Commit to your goals.", "color": "#22C55E"},
    5: {"theme": "Change & Freedom", "energy": "Adventure, transformation, versatility", "advice": "Embrace change. Travel. Break free from restrictions.", "color": "#FB923C"},
    6: {"theme": "Love & Responsibility", "energy": "Home, family, service, healing", "advice": "Nurture relationships. Create beauty. Accept responsibility with love.", "color": "#EC4899"},
    7: {"theme": "Spiritual Deepening", "energy": "Introspection, wisdom, inner work", "advice": "Go within. Study. Meditate. Trust your intuition above all.", "color": "#8B5CF6"},
    8: {"theme": "Abundance & Power", "energy": "Manifestation, authority, material mastery", "advice": "Step into your power. Manifest boldly. Balance giving and receiving.", "color": "#D4AF37"},
    9: {"theme": "Completion & Release", "energy": "Endings, wisdom, humanitarianism", "advice": "Let go of what no longer serves. Share your wisdom. Prepare for rebirth.", "color": "#6366F1"},
    11: {"theme": "Spiritual Awakening", "energy": "Illumination, inspiration, mastery", "advice": "You're being called to a higher purpose. Trust the downloads.", "color": "#C084FC"},
    22: {"theme": "Master Builder", "energy": "Large-scale creation, visionary leadership", "advice": "Build something that serves humanity. Think big. Act with precision.", "color": "#D4AF37"},
    33: {"theme": "Master Healer", "energy": "Compassion, teaching, selfless service", "advice": "Heal through love. Teach what you know. Serve with an open heart.", "color": "#22C55E"},
}


@router.get("/cosmic-calendar/today")
async def get_cosmic_today(birth_month: int = 1, birth_day: int = 1, birth_year: int = 1990):
    now = datetime.now(timezone.utc)
    today = now.date()

    # Personal year/month/day
    py = _personal_year(birth_month, birth_day, today.year)
    pm = _personal_month(py, today.month)
    pd = _personal_day(pm, today.day)
    py_info = PERSONAL_YEAR_MEANINGS.get(py, PERSONAL_YEAR_MEANINGS[1])
    pm_info = PERSONAL_YEAR_MEANINGS.get(pm, PERSONAL_YEAR_MEANINGS[1])
    pd_info = PERSONAL_YEAR_MEANINGS.get(pd, PERSONAL_YEAR_MEANINGS[1])

    # Moon phase (reuse logic)
    year, month, day = today.year, today.month, today.day
    if month <= 2:
        year -= 1
        month += 12
    A = year // 100
    B = A // 4
    C = 2 - A + B
    E = int(365.25 * (year + 4716))
    F = int(30.6001 * (month + 1))
    JD = C + day + E + F - 1524.5
    days_since = JD - 2451550.1
    new_moons = days_since / 29.530588853
    phase_frac = new_moons - int(new_moons)
    moon_age = phase_frac * 29.530588853
    phases = [
        (1.85, "New Moon", "new_moon", "Seed planting, intention setting, new beginnings"),
        (5.53, "Waxing Crescent", "waxing_crescent", "Setting intentions, building momentum"),
        (9.22, "First Quarter", "first_quarter", "Taking action, overcoming challenges"),
        (12.91, "Waxing Gibbous", "waxing_gibbous", "Refinement, patience, trust the process"),
        (16.61, "Full Moon", "full_moon", "Illumination, culmination, celebration"),
        (20.30, "Waning Gibbous", "waning_gibbous", "Gratitude, sharing wisdom, teaching"),
        (23.99, "Last Quarter", "last_quarter", "Release, forgiveness, letting go"),
        (27.68, "Waning Crescent", "waning_crescent", "Rest, surrender, reflection"),
        (29.54, "New Moon", "new_moon", "Seed planting, intention setting, new beginnings"),
    ]
    moon_name, moon_code, moon_guidance = "New Moon", "new_moon", ""
    for threshold, name, code, guidance in phases:
        if moon_age < threshold:
            moon_name, moon_code, moon_guidance = name, code, guidance
            break

    # Mayan Tzolk'in
    known_kin_date = datetime(2012, 12, 21, tzinfo=timezone.utc).date()
    known_kin = 207
    delta = (today - known_kin_date).days
    kin = ((known_kin - 1 + delta) % 260) + 1
    sign_num = ((kin - 1) % 20)
    tone_num = ((kin - 1) % 13) + 1
    sign_names = ["Imix","Ik","Akbal","Kan","Chicchan","Cimi","Manik","Lamat","Muluc","Oc","Chuen","Eb","Ben","Ix","Men","Cib","Caban","Etznab","Cauac","Ahau"]
    sign_glyphs = ["Red Dragon","White Wind","Blue Night","Yellow Seed","Red Serpent","White Worldbridger","Blue Hand","Yellow Star","Red Moon","White Dog","Blue Monkey","Yellow Human","Red Skywalker","White Wizard","Blue Eagle","Yellow Warrior","Red Earth","White Mirror","Blue Storm","Yellow Sun"]
    tone_names = ["Magnetic","Lunar","Electric","Self-Existing","Overtone","Rhythmic","Resonant","Galactic","Solar","Planetary","Spectral","Crystal","Cosmic"]

    # Cardology daily card
    solar_val = 55 - (2 * today.month + today.day)
    while solar_val < 1:
        solar_val += 52
    while solar_val > 52:
        solar_val -= 52
    suits = ["Hearts", "Clubs", "Diamonds", "Spades"]
    suit_idx = (solar_val - 1) // 13
    value_idx = (solar_val - 1) % 13
    values = ["Ace","2","3","4","5","6","7","8","9","10","Jack","Queen","King"]
    suit_colors = {"Hearts": "#EF4444", "Clubs": "#22C55E", "Diamonds": "#FCD34D", "Spades": "#6366F1"}
    card_suit = suits[min(suit_idx, 3)]
    card_value = values[min(value_idx, 12)]

    # Compile energy theme
    energies = [py_info["theme"], moon_name, sign_glyphs[sign_num]]
    energy_summary = f"A day of {pd_info['theme']} under the {moon_name}. The Mayan energy of {sign_glyphs[sign_num]} brings {sign_glyphs[sign_num].split(' ')[-1].lower()} energy. Your {card_value} of {card_suit} guides your path."

    return {
        "date": today.isoformat(),
        "energy_summary": energy_summary,
        "numerology": {
            "personal_year": {"number": py, **py_info},
            "personal_month": {"number": pm, **pm_info},
            "personal_day": {"number": pd, **pd_info},
        },
        "moon": {
            "phase": moon_name, "code": moon_code, "age": round(moon_age, 1),
            "guidance": moon_guidance,
        },
        "mayan": {
            "kin": kin,
            "day_sign": sign_names[sign_num],
            "glyph": sign_glyphs[sign_num],
            "tone": {"number": tone_num, "name": tone_names[tone_num - 1]},
            "galactic_signature": f"{tone_names[tone_num - 1]} {sign_glyphs[sign_num]}",
        },
        "cardology": {
            "card": f"{card_value} of {card_suit}",
            "suit": card_suit,
            "value": card_value,
            "color": suit_colors.get(card_suit, "#F8FAFC"),
        },
    }
