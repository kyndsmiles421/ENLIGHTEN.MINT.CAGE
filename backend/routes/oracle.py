from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import ReadingRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import random

# --- Oracle / Divination ---
TAROT_MAJOR_ARCANA = [
    {"num": 0, "name": "The Fool", "upright": "New beginnings, innocence, spontaneity, free spirit", "reversed": "Recklessness, taken advantage of, inconsideration", "element": "Air"},
    {"num": 1, "name": "The Magician", "upright": "Willpower, desire, creation, manifestation", "reversed": "Trickery, illusions, out of touch", "element": "Mercury"},
    {"num": 2, "name": "The High Priestess", "upright": "Intuition, sacred knowledge, divine feminine, the subconscious mind", "reversed": "Secrets, disconnected from intuition, withdrawal", "element": "Moon"},
    {"num": 3, "name": "The Empress", "upright": "Femininity, beauty, nature, nurturing, abundance", "reversed": "Creative block, dependence on others", "element": "Venus"},
    {"num": 4, "name": "The Emperor", "upright": "Authority, establishment, structure, father figure", "reversed": "Domination, excessive control, rigidity", "element": "Aries"},
    {"num": 5, "name": "The Hierophant", "upright": "Spiritual wisdom, religious beliefs, conformity, tradition", "reversed": "Personal beliefs, freedom, challenging the status quo", "element": "Taurus"},
    {"num": 6, "name": "The Lovers", "upright": "Love, harmony, relationships, values alignment, choices", "reversed": "Self-love, disharmony, imbalance, misalignment", "element": "Gemini"},
    {"num": 7, "name": "The Chariot", "upright": "Control, willpower, success, action, determination", "reversed": "Self-discipline, opposition, lack of direction", "element": "Cancer"},
    {"num": 8, "name": "Strength", "upright": "Strength, courage, persuasion, influence, compassion", "reversed": "Inner strength, self-doubt, low energy", "element": "Leo"},
    {"num": 9, "name": "The Hermit", "upright": "Soul searching, introspection, being alone, inner guidance", "reversed": "Isolation, loneliness, withdrawal", "element": "Virgo"},
    {"num": 10, "name": "Wheel of Fortune", "upright": "Good luck, karma, life cycles, destiny, a turning point", "reversed": "Bad luck, resistance to change, breaking cycles", "element": "Jupiter"},
    {"num": 11, "name": "Justice", "upright": "Justice, fairness, truth, cause and effect, law", "reversed": "Unfairness, lack of accountability, dishonesty", "element": "Libra"},
    {"num": 12, "name": "The Hanged Man", "upright": "Surrender, letting go, new perspectives, pause", "reversed": "Delays, resistance, stalling, indecision", "element": "Neptune"},
    {"num": 13, "name": "Death", "upright": "Endings, change, transformation, transition", "reversed": "Resistance to change, personal transformation, inner purging", "element": "Scorpio"},
    {"num": 14, "name": "Temperance", "upright": "Balance, moderation, patience, purpose", "reversed": "Imbalance, excess, self-healing, re-alignment", "element": "Sagittarius"},
    {"num": 15, "name": "The Devil", "upright": "Shadow self, attachment, addiction, restriction", "reversed": "Releasing limiting beliefs, exploring dark thoughts, detachment", "element": "Capricorn"},
    {"num": 16, "name": "The Tower", "upright": "Sudden change, upheaval, chaos, revelation, awakening", "reversed": "Personal transformation, fear of change, averting disaster", "element": "Mars"},
    {"num": 17, "name": "The Star", "upright": "Hope, faith, purpose, renewal, spirituality", "reversed": "Lack of faith, despair, self-trust, disconnection", "element": "Aquarius"},
    {"num": 18, "name": "The Moon", "upright": "Illusion, fear, anxiety, subconscious, intuition", "reversed": "Release of fear, repressed emotion, inner confusion", "element": "Pisces"},
    {"num": 19, "name": "The Sun", "upright": "Positivity, fun, warmth, success, vitality", "reversed": "Inner child, feeling down, overly optimistic", "element": "Sun"},
    {"num": 20, "name": "Judgement", "upright": "Judgement, rebirth, inner calling, absolution", "reversed": "Self-doubt, inner critic, ignoring the call", "element": "Pluto"},
    {"num": 21, "name": "The World", "upright": "Completion, integration, accomplishment, travel", "reversed": "Seeking personal closure, short-cuts, delays", "element": "Saturn"},
]

ZODIAC_SIGNS = [
    {"sign": "Aries", "dates": "Mar 21 - Apr 19", "element": "Fire", "ruler": "Mars", "symbol": "Ram", "color": "#EF4444"},
    {"sign": "Taurus", "dates": "Apr 20 - May 20", "element": "Earth", "ruler": "Venus", "symbol": "Bull", "color": "#22C55E"},
    {"sign": "Gemini", "dates": "May 21 - Jun 20", "element": "Air", "ruler": "Mercury", "symbol": "Twins", "color": "#FCD34D"},
    {"sign": "Cancer", "dates": "Jun 21 - Jul 22", "element": "Water", "ruler": "Moon", "symbol": "Crab", "color": "#94A3B8"},
    {"sign": "Leo", "dates": "Jul 23 - Aug 22", "element": "Fire", "ruler": "Sun", "symbol": "Lion", "color": "#FB923C"},
    {"sign": "Virgo", "dates": "Aug 23 - Sep 22", "element": "Earth", "ruler": "Mercury", "symbol": "Maiden", "color": "#86EFAC"},
    {"sign": "Libra", "dates": "Sep 23 - Oct 22", "element": "Air", "ruler": "Venus", "symbol": "Scales", "color": "#FDA4AF"},
    {"sign": "Scorpio", "dates": "Oct 23 - Nov 21", "element": "Water", "ruler": "Pluto", "symbol": "Scorpion", "color": "#8B5CF6"},
    {"sign": "Sagittarius", "dates": "Nov 22 - Dec 21", "element": "Fire", "ruler": "Jupiter", "symbol": "Archer", "color": "#D8B4FE"},
    {"sign": "Capricorn", "dates": "Dec 22 - Jan 19", "element": "Earth", "ruler": "Saturn", "symbol": "Goat", "color": "#64748B"},
    {"sign": "Aquarius", "dates": "Jan 20 - Feb 18", "element": "Air", "ruler": "Uranus", "symbol": "Water Bearer", "color": "#3B82F6"},
    {"sign": "Pisces", "dates": "Feb 19 - Mar 20", "element": "Water", "ruler": "Neptune", "symbol": "Fish", "color": "#2DD4BF"},
]

CHINESE_ZODIAC = [
    {"animal": "Rat", "years": "1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020", "element_cycle": "Water", "traits": "Quick-witted, resourceful, versatile, kind", "color": "#3B82F6"},
    {"animal": "Ox", "years": "1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021", "element_cycle": "Earth", "traits": "Diligent, dependable, strong, determined", "color": "#92400E"},
    {"animal": "Tiger", "years": "1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022", "element_cycle": "Wood", "traits": "Brave, competitive, confident, unpredictable", "color": "#FB923C"},
    {"animal": "Rabbit", "years": "1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023", "element_cycle": "Wood", "traits": "Quiet, elegant, kind, responsible", "color": "#FDA4AF"},
    {"animal": "Dragon", "years": "1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024", "element_cycle": "Earth", "traits": "Confident, intelligent, enthusiastic, ambitious", "color": "#EF4444"},
    {"animal": "Snake", "years": "1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025", "element_cycle": "Fire", "traits": "Enigmatic, intelligent, wise, intuitive", "color": "#8B5CF6"},
    {"animal": "Horse", "years": "1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026", "element_cycle": "Fire", "traits": "Animated, active, energetic, free-spirited", "color": "#D97706"},
    {"animal": "Goat", "years": "1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027", "element_cycle": "Earth", "traits": "Calm, gentle, sympathetic, creative", "color": "#86EFAC"},
    {"animal": "Monkey", "years": "1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028", "element_cycle": "Metal", "traits": "Sharp, smart, curious, mischievous", "color": "#FCD34D"},
    {"animal": "Rooster", "years": "1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029", "element_cycle": "Metal", "traits": "Observant, hardworking, courageous, talented", "color": "#EF4444"},
    {"animal": "Dog", "years": "1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030", "element_cycle": "Earth", "traits": "Loyal, honest, amiable, kind, prudent", "color": "#92400E"},
    {"animal": "Pig", "years": "1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031", "element_cycle": "Water", "traits": "Compassionate, generous, diligent, optimistic", "color": "#FDA4AF"},
]

ICHING_TRIGRAMS = ["Heaven", "Lake", "Fire", "Thunder", "Wind", "Water", "Mountain", "Earth"]

SACRED_GEOMETRY = [
    {"id": "flower-of-life", "name": "Flower of Life", "description": "The Flower of Life is a geometrical figure composed of evenly-spaced, overlapping circles arranged in a flower-like pattern with a six-fold symmetry. It contains the patterns of creation as they emerged from the Great Void.", "meaning": "Creation, unity, interconnectedness of all life", "color": "#D8B4FE"},
    {"id": "seed-of-life", "name": "Seed of Life", "description": "Seven circles placed with sixfold symmetry, forming a pattern of circles and lenses. It is the basis of the Flower of Life and represents the seven days of creation.", "meaning": "Creation, fertility, blessing, protection", "color": "#86EFAC"},
    {"id": "metatrons-cube", "name": "Metatron's Cube", "description": "A complex sacred geometry figure derived from the Flower of Life. It contains every shape that exists in the universe, including the five Platonic Solids.", "meaning": "Balance, harmony, universal knowledge", "color": "#FCD34D"},
    {"id": "sri-yantra", "name": "Sri Yantra", "description": "Nine interlocking triangles radiating from a central point. Four upward triangles represent Shiva (masculine), five downward represent Shakti (feminine). The cosmos emerged from their union.", "meaning": "Cosmic creation, divine union, manifestation", "color": "#EF4444"},
    {"id": "vesica-piscis", "name": "Vesica Piscis", "description": "The intersection of two circles of the same radius where the center of each lies on the circumference of the other. It represents the womb of creation.", "meaning": "Duality, creation, divine feminine, sacred portal", "color": "#FDA4AF"},
    {"id": "golden-spiral", "name": "Golden Spiral (Phi)", "description": "A logarithmic spiral whose growth factor is the golden ratio (1.618...). Found throughout nature in shells, hurricanes, galaxies, and DNA.", "meaning": "Divine proportion, natural harmony, infinite growth", "color": "#2DD4BF"},
    {"id": "merkaba", "name": "Merkaba (Star Tetrahedron)", "description": "Two interlocking tetrahedra creating a three-dimensional Star of David. 'Mer' means light, 'Ka' means spirit, 'Ba' means body. It is the divine light vehicle.", "meaning": "Ascension, light body activation, interdimensional travel", "color": "#3B82F6"},
    {"id": "torus", "name": "Torus", "description": "A donut-shaped energy field that surrounds all living things. The human energy field is toroidal. Galaxies, atoms, and the Earth itself all have toroidal fields.", "meaning": "Energy flow, self-sustaining creation, unity", "color": "#8B5CF6"},
]

@router.get("/oracle/tarot-deck")
async def get_tarot_deck():
    return TAROT_MAJOR_ARCANA

@router.get("/oracle/zodiac")
async def get_zodiac():
    return ZODIAC_SIGNS

@router.get("/oracle/chinese-zodiac")
async def get_chinese_zodiac():
    return CHINESE_ZODIAC

@router.get("/oracle/sacred-geometry")
async def get_sacred_geometry():
    return SACRED_GEOMETRY

@router.post("/oracle/reading")
async def get_reading(req: ReadingRequest):
    try:
        # V68.61 — Resonance Cross-Pollination. The frontend sends the
        # ContextBus primer (Forecast mood, Avatar archetype, Story
        # narrative, etc.) so the reading reflects the user's current
        # engine state instead of being a stand-alone draw.
        primer_text = (req.context_primer or "").strip()[:1800]
        primer_clause = (
            f"\n\nContext from the seeker's current sovereign engine state — "
            f"weave its themes into the reading where they fit naturally:\n{primer_text}"
            if primer_text else ""
        )
        if req.reading_type == "tarot":
            cards = random.sample(TAROT_MAJOR_ARCANA, 3 if req.spread == "three_card" else 1)
            reversed_flags = [random.choice([True, False]) for _ in cards]
            card_desc = "; ".join([f"{c['name']} ({'Reversed' if r else 'Upright'}): {c['reversed'] if r else c['upright']}" for c, r in zip(cards, reversed_flags)])
            
            system_msg = "You are a wise and mystical tarot reader with deep knowledge of the Major Arcana. Give an insightful, poetic, and deeply personal reading. Be specific and meaningful, not generic. Keep under 250 words."
            prompt = f"Tarot reading - Cards drawn: {card_desc}."
            if req.question:
                prompt += f" The seeker's question: {req.question}"
            prompt += " Give a profound interpretation connecting the cards together."
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"tarot-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt + primer_clause)), timeout=30)
            
            return {"type": "tarot", "cards": [{"name": c["name"], "reversed": r, "keywords": c["reversed"] if r else c["upright"], "element": c["element"]} for c, r in zip(cards, reversed_flags)], "interpretation": response}
        
        elif req.reading_type == "astrology":
            sign = next((s for s in ZODIAC_SIGNS if s["sign"].lower() == (req.zodiac_sign or "").lower()), None)
            if not sign:
                return {"type": "astrology", "error": "Please select a zodiac sign"}
            
            system_msg = "You are an expert astrologer with deep knowledge of Western astrology. Give a detailed, personal daily horoscope reading. Reference planetary positions and aspects. Be specific and insightful. Keep under 200 words."
            prompt = f"Give a daily horoscope for {sign['sign']} ({sign['element']} sign, ruled by {sign['ruler']}). Today's date: {datetime.now(timezone.utc).strftime('%B %d, %Y')}."
            if req.question:
                prompt += f" Focus area: {req.question}"
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"astro-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt + primer_clause)), timeout=30)
            
            return {"type": "astrology", "sign": sign, "reading": response}
        
        elif req.reading_type == "chinese_astrology":
            year = req.birth_year or 2000
            animal_idx = (year - 4) % 12
            animals_order = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
            animal_name = animals_order[animal_idx]
            animal = next((a for a in CHINESE_ZODIAC if a["animal"] == animal_name), CHINESE_ZODIAC[0])
            elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
            element = elements[((year - 4) % 10) // 2]
            
            system_msg = "You are a master of Chinese astrology and the Five Elements. Give a detailed, insightful reading based on the animal sign and element. Include advice for the current year. Keep under 200 words."
            prompt = f"Chinese astrology reading for {element} {animal_name} (born in {year}). Current year: {datetime.now(timezone.utc).year}."
            if req.question:
                prompt += f" Focus: {req.question}"
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"chinese-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt + primer_clause)), timeout=30)
            
            return {"type": "chinese_astrology", "animal": animal, "element": element, "year": year, "reading": response}
        
        elif req.reading_type == "iching":
            hexagram_lines = [random.choice([6, 7, 8, 9]) for _ in range(6)]
            hex_binary = "".join(["1" if ln in [7, 9] else "0" for ln in hexagram_lines])
            hex_num = int(hex_binary, 2) % 64 + 1
            changing = any(ln in [6, 9] for ln in hexagram_lines)
            
            system_msg = "You are a sage I Ching reader within ENLIGHTEN.MINT.CAFE — a multi-denominational spiritual exploration instrument. Frame insights as traditional Taoist wisdom and personal-sovereignty exploration, never as advice or prediction. Interpret the hexagram with depth, referencing the traditional meaning while making it personal and resonant. Include guidance for the seeker as a contemplative offering. Keep under 250 words."
            prompt = f"I Ching reading: Hexagram #{hex_num}. Lines from bottom to top: {hexagram_lines}. {'There are changing lines.' if changing else 'No changing lines.'}"
            if req.question:
                prompt += f" The seeker asks: {req.question}"
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"iching-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt + primer_clause)), timeout=30)
            
            return {"type": "iching", "hexagram_number": hex_num, "lines": hexagram_lines, "changing": changing, "interpretation": response}
        
        elif req.reading_type == "sacred_geometry":
            pattern = random.choice(SACRED_GEOMETRY)
            
            system_msg = "You are a sacred geometry teacher and mystic. Give a meditation-style reading about this sacred geometry pattern, connecting it to the seeker's spiritual journey. Be poetic and profound. Keep under 200 words."
            prompt = f"Sacred geometry reading: {pattern['name']} - {pattern['description']}"
            if req.question:
                prompt += f" The seeker's intention: {req.question}"
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"geometry-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt + primer_clause)), timeout=30)
            
            return {"type": "sacred_geometry", "pattern": pattern, "meditation": response}
        
        else:
            raise HTTPException(status_code=400, detail="Unknown reading type")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Oracle reading error: {e}")
        fallback_messages = {
            "tarot": "The cards whisper of transformation. Trust the journey unfolding before you.",
            "astrology": "The stars align in your favor today. Embrace the cosmic energy flowing through you.",
            "chinese_astrology": "Your animal spirit guides you toward harmony. Listen to its ancient wisdom.",
            "iching": "Change is the only constant. The hexagram speaks of movement toward balance.",
            "sacred_geometry": "The universe speaks in patterns. You are an expression of divine geometry."
        }
        return {"type": req.reading_type, "interpretation": fallback_messages.get(req.reading_type, "The cosmos holds wisdom for you."), "fallback": True}

@router.get("/oracle/history")
async def get_reading_history(user=Depends(get_current_user)):
    readings = await db.oracle_readings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return readings

@router.post("/oracle/save")
async def save_reading(user=Depends(get_current_user), reading: dict = {}):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **{k: v for k, v in reading.items() if k != "_id"},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.oracle_readings.insert_one(doc)
    doc.pop("_id", None)
    return doc


