from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
import math

# ========== MAYAN ASTROLOGY (TZOLK'IN) ==========

MAYAN_DAY_SIGNS = [
    {"num": 1, "name": "Imix", "glyph": "Red Dragon", "meaning": "Primordial Mother, Nurturing, Birth", "element": "Water",
     "desc": "You are the origin point — a nurturer and creator. Your energy is primal, protective, and deeply connected to the source of all life. You trust instinct over logic and have a powerful ability to birth new beginnings.",
     "shadow": "Codependency, over-giving, difficulty receiving",
     "affirmation": "I am the source. I nurture creation with trust and ease.",
     "color": "#EF4444", "direction": "East"},
    {"num": 2, "name": "Ik", "glyph": "White Wind", "meaning": "Communication, Spirit, Breath", "element": "Air",
     "desc": "You carry divine messages. Your words have power to inspire, heal, and transform. You are a channel for spirit, deeply sensitive to the unseen currents that move through all things.",
     "shadow": "Scattered energy, over-talking, difficulty grounding",
     "affirmation": "I am the breath of spirit. My words carry truth and healing.",
     "color": "#F8FAFC", "direction": "North"},
    {"num": 3, "name": "Akbal", "glyph": "Blue Night", "meaning": "Dreams, Intuition, Abundance", "element": "Water",
     "desc": "You are the dreamer — connected to the vast inner world of the subconscious. Your intuition is your compass. In darkness, you find the deepest treasures of wisdom and unlimited possibility.",
     "shadow": "Materialism, nightmares, fear of the unknown",
     "affirmation": "I journey into the deep and return with treasures of wisdom.",
     "color": "#3B82F6", "direction": "West"},
    {"num": 4, "name": "Kan", "glyph": "Yellow Seed", "meaning": "Flowering, Potential, Awareness", "element": "Fire",
     "desc": "You are pure potential waiting to bloom. Every thought you plant grows into reality. You carry the blueprint of your highest expression within you, like a seed carries an entire forest.",
     "shadow": "Self-doubt, unrealized potential, scattered focus",
     "affirmation": "I plant seeds of intention that blossom into my highest vision.",
     "color": "#FCD34D", "direction": "South"},
    {"num": 5, "name": "Chicchan", "glyph": "Red Serpent", "meaning": "Life Force, Instinct, Kundalini", "element": "Fire",
     "desc": "Primal life force energy pulses through you. You are deeply embodied, sensual, and vitally alive. Your body is your temple and your instincts are razor-sharp. Kundalini energy rises naturally within you.",
     "shadow": "Anger, manipulation, survival-mode thinking",
     "affirmation": "I honor my body as sacred. My life force flows freely and powerfully.",
     "color": "#EF4444", "direction": "East"},
    {"num": 6, "name": "Cimi", "glyph": "White Worldbridger", "meaning": "Death, Surrender, Release", "element": "Earth",
     "desc": "You walk between worlds — a bridge between what was and what will be. Letting go is your superpower. Through surrender, you access profound transformation and rebirth.",
     "shadow": "Fear of change, control issues, grief avoidance",
     "affirmation": "I release what no longer serves me and embrace sacred transformation.",
     "color": "#F8FAFC", "direction": "North"},
    {"num": 7, "name": "Manik", "glyph": "Blue Hand", "meaning": "Healing, Accomplishment, Knowing", "element": "Water",
     "desc": "Healing flows through your hands and your presence. You accomplish through dedicated practice and have the gift of completion. Your touch — physical or energetic — restores balance.",
     "shadow": "Overwork, martyrdom, physical depletion",
     "affirmation": "I am a vessel of healing. My hands carry the power to restore wholeness.",
     "color": "#3B82F6", "direction": "West"},
    {"num": 8, "name": "Lamat", "glyph": "Yellow Star", "meaning": "Beauty, Elegance, Harmony", "element": "Air",
     "desc": "You are a star being — drawn to beauty, art, and cosmic harmony. Your very presence brings elegance and grace. You see the sacred geometry in all things and radiate light naturally.",
     "shadow": "Vanity, judgment of imperfection, escapism through beauty",
     "affirmation": "I am a radiant star. Beauty flows through me and transforms all it touches.",
     "color": "#FCD34D", "direction": "South"},
    {"num": 9, "name": "Muluc", "glyph": "Red Moon", "meaning": "Universal Water, Purification, Flow", "element": "Water",
     "desc": "You move with the tides of emotion and cosmic rhythm. Water is your teacher — it shows you how to purify, how to flow around obstacles, and how to trust the current of life.",
     "shadow": "Emotional overwhelm, stagnation, resistance to change",
     "affirmation": "I flow with life's sacred rhythm. My emotions are my wisdom.",
     "color": "#EF4444", "direction": "East"},
    {"num": 10, "name": "Oc", "glyph": "White Dog", "meaning": "Love, Loyalty, Heart", "element": "Fire",
     "desc": "Unconditional love is your essence. You are loyal, devoted, and deeply heart-centered. Your capacity to love without conditions inspires others to open their own hearts.",
     "shadow": "Neediness, jealousy, conditional love",
     "affirmation": "My heart is infinite. I love without conditions and attract deep loyalty.",
     "color": "#F8FAFC", "direction": "North"},
    {"num": 11, "name": "Chuen", "glyph": "Blue Monkey", "meaning": "Play, Magic, Illusion", "element": "Water",
     "desc": "You are the divine trickster — playful, magical, and endlessly creative. Humor is your medicine. Through play, you access higher truths that serious minds cannot reach.",
     "shadow": "Manipulation, deception, avoiding responsibility through humor",
     "affirmation": "I embrace the cosmic play. Through joy and laughter, I access divine magic.",
     "color": "#3B82F6", "direction": "West"},
    {"num": 12, "name": "Eb", "glyph": "Yellow Human", "meaning": "Free Will, Wisdom, Influence", "element": "Earth",
     "desc": "You embody the gift of free will — the ability to choose your path consciously. Your choices ripple outward, influencing the collective. Wisdom grows through honoring your own sovereignty.",
     "shadow": "Overthinking, indecision, using free will destructively",
     "affirmation": "I choose wisely and with love. My decisions shape a beautiful reality.",
     "color": "#FCD34D", "direction": "South"},
    {"num": 13, "name": "Ben", "glyph": "Red Skywalker", "meaning": "Exploration, Space, Wakefulness", "element": "Air",
     "desc": "You walk between heaven and earth — a cosmic explorer bridging dimensions. Your spirit yearns for expansion beyond ordinary reality. You are here to explore the vastness of consciousness.",
     "shadow": "Restlessness, inability to ground, spiritual bypassing",
     "affirmation": "I bridge heaven and earth. My explorations expand consciousness for all.",
     "color": "#EF4444", "direction": "East"},
    {"num": 14, "name": "Ix", "glyph": "White Wizard", "meaning": "Timelessness, Receptivity, Enchantment", "element": "Earth",
     "desc": "You are a natural enchanter — your presence alone shifts energy. Timeless wisdom flows through you effortlessly. You access magic through stillness, receptivity, and alignment with heart.",
     "shadow": "Manipulation, control through charm, disconnection from emotion",
     "affirmation": "I am aligned with timeless wisdom. My magic comes from an open heart.",
     "color": "#F8FAFC", "direction": "North"},
    {"num": 15, "name": "Men", "glyph": "Blue Eagle", "meaning": "Vision, Mind, Creativity", "element": "Water",
     "desc": "You see from the highest perspective — the eagle's view. Your visionary mind creates powerful blueprints for reality. Creativity and technical mastery combine in everything you do.",
     "shadow": "Judgment from above, cold intellectualism, escapism",
     "affirmation": "I see with the eyes of the eagle. My vision creates beauty and truth.",
     "color": "#3B82F6", "direction": "West"},
    {"num": 16, "name": "Cib", "glyph": "Yellow Warrior", "meaning": "Intelligence, Fearlessness, Grace", "element": "Fire",
     "desc": "You are a spiritual warrior — courageous, questioning, and deeply intelligent. You face fear with grace and transform obstacles into stepping stones. Your quest is for truth above all else.",
     "shadow": "Aggression, stubbornness, fight without purpose",
     "affirmation": "I walk my path with courage and grace. I question everything with love.",
     "color": "#FCD34D", "direction": "South"},
    {"num": 17, "name": "Caban", "glyph": "Red Earth", "meaning": "Navigation, Synchronicity, Evolution", "element": "Earth",
     "desc": "You are deeply attuned to Earth's intelligence. Synchronicities are your guideposts. You navigate life through signs, feelings, and an innate knowing of where to go and when.",
     "shadow": "Overthinking signs, losing touch with body, ignoring practical needs",
     "affirmation": "I trust the signs. The Earth guides my every step toward evolution.",
     "color": "#EF4444", "direction": "East"},
    {"num": 18, "name": "Etznab", "glyph": "White Mirror", "meaning": "Reflection, Endlessness, Truth", "element": "Air",
     "desc": "You are the mirror of truth — reflecting reality without distortion. Your clarity cuts through illusion like a sacred blade. You see the infinite in the finite and the truth in every story.",
     "shadow": "Harsh judgment, projection, shattering others' illusions painfully",
     "affirmation": "I am a clear mirror. I reflect truth with compassion and clarity.",
     "color": "#F8FAFC", "direction": "North"},
    {"num": 19, "name": "Cauac", "glyph": "Blue Storm", "meaning": "Catalysis, Transformation, Energy", "element": "Water",
     "desc": "You are the storm that clears the sky. Transformation is your constant companion. Where you go, old structures dissolve and new life emerges. You catalyze evolution in everyone you meet.",
     "shadow": "Chaos, destruction without purpose, emotional storms",
     "affirmation": "I am the sacred storm. I clear the way for new life and beauty.",
     "color": "#3B82F6", "direction": "West"},
    {"num": 20, "name": "Ahau", "glyph": "Yellow Sun", "meaning": "Enlightenment, Wholeness, Ascension", "element": "Fire",
     "desc": "You carry the energy of the Sun itself — enlightenment, wholeness, and unconditional love. You are the culmination of all 20 day signs. Your path is one of solar consciousness and divine mastery.",
     "shadow": "Ego inflation, spiritual pride, burnout from shining too bright",
     "affirmation": "I am the Sun. I shine my light equally on all beings with unconditional love.",
     "color": "#FCD34D", "direction": "South"},
]

MAYAN_TONES = [
    {"num": 1, "name": "Magnetic", "purpose": "Unify", "action": "Attract", "desc": "You set things in motion. Your energy draws experiences and people toward you. You are a beginning point.", "color": "#EF4444"},
    {"num": 2, "name": "Lunar", "purpose": "Polarize", "action": "Stabilize", "desc": "You see both sides. Duality teaches you balance. Challenge refines your understanding.", "color": "#F8FAFC"},
    {"num": 3, "name": "Electric", "purpose": "Activate", "action": "Bond", "desc": "You spark energy into action. Service to others electrifies your gifts. You catalyze connection.", "color": "#3B82F6"},
    {"num": 4, "name": "Self-Existing", "purpose": "Define", "action": "Measure", "desc": "You create structure and form. Your clarity defines the container for growth.", "color": "#FCD34D"},
    {"num": 5, "name": "Overtone", "purpose": "Empower", "action": "Command", "desc": "You radiate authority. Your empowerment comes from aligning with your core purpose.", "color": "#EF4444"},
    {"num": 6, "name": "Rhythmic", "purpose": "Organize", "action": "Balance", "desc": "You bring order from chaos. Physical balance and organic flow are your gifts.", "color": "#F8FAFC"},
    {"num": 7, "name": "Resonant", "purpose": "Channel", "action": "Inspire", "desc": "You are a cosmic channel. Attunement to higher frequencies allows you to inspire and align.", "color": "#3B82F6"},
    {"num": 8, "name": "Galactic", "purpose": "Harmonize", "action": "Model", "desc": "You walk your talk. Integrity and harmony between inner and outer worlds is your mastery.", "color": "#FCD34D"},
    {"num": 9, "name": "Solar", "purpose": "Pulse", "action": "Realize", "desc": "You bring intention into form. Your solar will manifests through focused pulse and action.", "color": "#EF4444"},
    {"num": 10, "name": "Planetary", "purpose": "Perfect", "action": "Produce", "desc": "You manifest tangible results. Your creations are perfect expressions of divine intention.", "color": "#F8FAFC"},
    {"num": 11, "name": "Spectral", "purpose": "Dissolve", "action": "Release", "desc": "You liberate and release. Dissolution of what no longer serves creates space for the new.", "color": "#3B82F6"},
    {"num": 12, "name": "Crystal", "purpose": "Dedicate", "action": "Cooperate", "desc": "You shine through cooperation. Sharing your clarity with community amplifies your light.", "color": "#FCD34D"},
    {"num": 13, "name": "Cosmic", "purpose": "Endure", "action": "Transcend", "desc": "You transcend all limitation. Your cosmic nature endures beyond time and space. You are the completion.", "color": "#C084FC"},
]

# Tzolk'in reference date: Aug 11, 3114 BCE (Long Count 0.0.0.0.0) = Kin 1 (1 Imix)
TZOLKIN_EPOCH_JDN = 584283  # Julian Day Number for the Mayan epoch

def _jdn_from_date(year, month, day):
    """Compute Julian Day Number from a Gregorian date."""
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    return day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

def get_mayan_sign(year: int, month: int, day: int):
    jdn = _jdn_from_date(year, month, day)
    diff = jdn - TZOLKIN_EPOCH_JDN
    kin = (diff % 260)
    if kin <= 0:
        kin += 260
    tone_num = ((kin - 1) % 13) + 1
    sign_num = ((kin - 1) % 20) + 1
    sign = MAYAN_DAY_SIGNS[sign_num - 1]
    tone = MAYAN_TONES[tone_num - 1]
    return {
        "kin": kin,
        "sign": sign,
        "tone": tone,
        "galactic_signature": f"{tone['name']} {sign['glyph']}",
    }


@router.get("/mayan/birth-sign")
async def mayan_birth_sign(year: int, month: int, day: int):
    if month < 1 or month > 12 or day < 1 or day > 31 or year < 1:
        raise HTTPException(status_code=400, detail="Invalid date")
    result = get_mayan_sign(year, month, day)
    return result


@router.get("/mayan/compatibility")
async def mayan_compatibility(year1: int, month1: int, day1: int, year2: int, month2: int, day2: int):
    r1 = get_mayan_sign(year1, month1, day1)
    r2 = get_mayan_sign(year2, month2, day2)
    score = 50
    if r1["sign"]["element"] == r2["sign"]["element"]:
        score += 20
    if r1["sign"]["direction"] == r2["sign"]["direction"]:
        score += 10
    if r1["tone"]["num"] == r2["tone"]["num"]:
        score += 15
    if abs(r1["sign"]["num"] - r2["sign"]["num"]) <= 2:
        score += 10
    comp_elements = {("Fire", "Air"), ("Air", "Fire"), ("Water", "Earth"), ("Earth", "Water")}
    if (r1["sign"]["element"], r2["sign"]["element"]) in comp_elements:
        score += 15
    score = min(100, score)
    msgs = []
    if score >= 80:
        msgs.append("A powerful galactic resonance. Your souls vibrate in deep harmony across the Tzolk'in.")
    elif score >= 60:
        msgs.append("Strong cosmic compatibility. Your energies complement and amplify each other's growth.")
    else:
        msgs.append("A journey of growth. Your differences create a rich tapestry of learning and evolution.")
    if r1["sign"]["element"] == r2["sign"]["element"]:
        msgs.append(f"Shared {r1['sign']['element']} element — you speak the same elemental language.")
    if r1["sign"]["direction"] == r2["sign"]["direction"]:
        msgs.append(f"Both oriented {r1['sign']['direction']} — aligned purpose and worldview.")
    return {"person1": r1, "person2": r2, "score": score, "messages": msgs}


@router.get("/mayan/today")
async def mayan_today():
    from datetime import date
    today = date.today()
    result = get_mayan_sign(today.year, today.month, today.day)
    result["date"] = today.isoformat()
    return result



