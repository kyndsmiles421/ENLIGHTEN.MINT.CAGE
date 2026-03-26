from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone
import uuid
import asyncio
import random
import hashlib

router = APIRouter()

CHAKRAS = [
    {"id": "root", "name": "Root (Muladhara)", "color": "#EF4444", "location": "Base of spine",
     "element": "Earth", "frequency": "396 Hz", "qualities": ["Security", "Grounding", "Survival", "Physical vitality"],
     "blocked_signs": ["Fear", "Anxiety", "Instability", "Disconnection from body"],
     "healing": ["Walking barefoot", "Red foods", "Grounding meditation", "Root vegetables"]},
    {"id": "sacral", "name": "Sacral (Svadhisthana)", "color": "#FB923C", "location": "Below navel",
     "element": "Water", "frequency": "417 Hz", "qualities": ["Creativity", "Pleasure", "Emotions", "Sensuality"],
     "blocked_signs": ["Guilt", "Emotional numbness", "Creative blocks", "Relationship issues"],
     "healing": ["Water activities", "Orange foods", "Hip-opening yoga", "Creative expression"]},
    {"id": "solar", "name": "Solar Plexus (Manipura)", "color": "#FCD34D", "location": "Upper abdomen",
     "element": "Fire", "frequency": "528 Hz", "qualities": ["Willpower", "Confidence", "Personal power", "Transformation"],
     "blocked_signs": ["Shame", "Low self-esteem", "Control issues", "Digestive problems"],
     "healing": ["Core exercises", "Yellow foods", "Sun gazing", "Confidence affirmations"]},
    {"id": "heart", "name": "Heart (Anahata)", "color": "#22C55E", "location": "Center of chest",
     "element": "Air", "frequency": "639 Hz", "qualities": ["Love", "Compassion", "Forgiveness", "Connection"],
     "blocked_signs": ["Grief", "Jealousy", "Fear of intimacy", "Loneliness"],
     "healing": ["Heart-opening yoga", "Green foods", "Rose essential oil", "Forgiveness practice"]},
    {"id": "throat", "name": "Throat (Vishuddha)", "color": "#3B82F6", "location": "Throat center",
     "element": "Ether", "frequency": "741 Hz", "qualities": ["Truth", "Expression", "Communication", "Authenticity"],
     "blocked_signs": ["Fear of speaking", "Sore throat", "Dishonesty", "Inability to listen"],
     "healing": ["Singing/chanting", "Blue foods", "Neck stretches", "Journaling truth"]},
    {"id": "third_eye", "name": "Third Eye (Ajna)", "color": "#6366F1", "location": "Between eyebrows",
     "element": "Light", "frequency": "852 Hz", "qualities": ["Intuition", "Insight", "Vision", "Wisdom"],
     "blocked_signs": ["Confusion", "Lack of direction", "Cynicism", "Headaches"],
     "healing": ["Meditation", "Purple foods", "Visualization", "Dream journaling"]},
    {"id": "crown", "name": "Crown (Sahasrara)", "color": "#C084FC", "location": "Top of head",
     "element": "Cosmic energy", "frequency": "963 Hz", "qualities": ["Unity", "Enlightenment", "Spiritual connection", "Bliss"],
     "blocked_signs": ["Disconnection", "Cynicism", "Spiritual crisis", "Isolation"],
     "healing": ["Silence", "Fasting", "Prayer", "Nature immersion"]},
]

REIKI_POSITIONS = [
    {"id": "head_crown", "name": "Crown Position", "placement": "Hands cupped over crown of head",
     "chakra": "crown", "duration": "3-5 min",
     "intention": "Connect to universal life force, open divine channel",
     "sensations": "Tingling, warmth, pressure at top of head"},
    {"id": "head_eyes", "name": "Eyes/Third Eye Position", "placement": "Hands gently over eyes and forehead",
     "chakra": "third_eye", "duration": "3-5 min",
     "intention": "Awaken intuition, clear mental fog, enhance vision",
     "sensations": "Pulsing between eyebrows, colors behind closed eyes"},
    {"id": "head_ears", "name": "Ears/Temples Position", "placement": "Hands cupped over ears, fingertips at temples",
     "chakra": "third_eye", "duration": "3-5 min",
     "intention": "Balance left and right brain, enhance inner listening",
     "sensations": "Deep peace, muffled silence, internal sounds"},
    {"id": "throat", "name": "Throat Position", "placement": "Hands gently hovering over or lightly touching throat",
     "chakra": "throat", "duration": "3-5 min",
     "intention": "Free authentic expression, release unspoken truths",
     "sensations": "Warmth, urge to swallow or sigh, emotional release"},
    {"id": "heart", "name": "Heart Position", "placement": "One hand on upper chest, one on heart center",
     "chakra": "heart", "duration": "3-5 min",
     "intention": "Open to love, heal grief, cultivate compassion",
     "sensations": "Warmth spreading, emotion, deep peace, tears possible"},
    {"id": "solar", "name": "Solar Plexus Position", "placement": "Hands on upper abdomen, below ribs",
     "chakra": "solar", "duration": "3-5 min",
     "intention": "Restore personal power, transform fear into courage",
     "sensations": "Heat, gurgling, sense of empowerment"},
    {"id": "sacral", "name": "Sacral Position", "placement": "Hands on lower abdomen, below navel",
     "chakra": "sacral", "duration": "3-5 min",
     "intention": "Awaken creativity, balance emotions, honor pleasure",
     "sensations": "Warmth, emotional waves, creative sparks"},
    {"id": "root", "name": "Root Position", "placement": "Hands on upper thighs or hover over base of spine",
     "chakra": "root", "duration": "3-5 min",
     "intention": "Ground into earth, establish safety, connect to body",
     "sensations": "Heavy, grounded, secure, warmth descending"},
    {"id": "knees", "name": "Knee Position", "placement": "One hand on each knee",
     "chakra": "root", "duration": "2-3 min",
     "intention": "Release fear of moving forward, flexibility in life path",
     "sensations": "Warmth, loosening, sense of readiness"},
    {"id": "feet", "name": "Feet Position", "placement": "Hands on soles of feet (or one hand each foot)",
     "chakra": "root", "duration": "3-5 min",
     "intention": "Complete grounding, earth connection, energy circuit closure",
     "sensations": "Tingling, warmth flowing down, deep relaxation, sleepiness"},
]

AURA_COLORS = {
    "red": {"name": "Red Aura", "meaning": "Passionate, energetic, physical vitality, grounded power",
            "chakra": "root", "strengths": "Leadership, courage, physical endurance",
            "shadow": "Anger, impatience, burnout", "advice": "Channel your fire into creative action. Ground daily."},
    "orange": {"name": "Orange Aura", "meaning": "Creative, joyful, emotionally expressive, adventurous",
               "chakra": "sacral", "strengths": "Creativity, social magnetism, emotional intelligence",
               "shadow": "Addiction, emotional overwhelm, scattered energy", "advice": "Create daily. Let emotions flow like water."},
    "yellow": {"name": "Yellow Aura", "meaning": "Intellectual, confident, optimistic, mentally sharp",
               "chakra": "solar", "strengths": "Mental clarity, leadership, manifesting power",
               "shadow": "Control, overthinking, ego inflation", "advice": "Trust your gut. Lead with joy, not dominance."},
    "green": {"name": "Green Aura", "meaning": "Healing, compassionate, nature-connected, heart-centered",
              "chakra": "heart", "strengths": "Natural healer, deep empathy, growth-oriented",
              "shadow": "Over-giving, jealousy, codependence", "advice": "Heal yourself first. Spend time in nature daily."},
    "blue": {"name": "Blue Aura", "meaning": "Truthful, communicative, intuitive, peaceful",
             "chakra": "throat", "strengths": "Authentic expression, teaching ability, calm presence",
             "shadow": "Fear of speaking truth, isolation, coldness", "advice": "Speak your truth gently. Sing, chant, or journal."},
    "indigo": {"name": "Indigo Aura", "meaning": "Deeply intuitive, visionary, spiritually perceptive",
               "chakra": "third_eye", "strengths": "Psychic ability, deep wisdom, pattern recognition",
               "shadow": "Overwhelm from others' energy, escapism, headaches", "advice": "Protect your energy. Meditate daily. Trust your visions."},
    "violet": {"name": "Violet Aura", "meaning": "Spiritually evolved, connected to source, transformative",
               "chakra": "crown", "strengths": "Spiritual leadership, cosmic awareness, healing presence",
               "shadow": "Ungrounded, spiritual bypassing, isolation", "advice": "Stay embodied. Serve others. Balance heaven and earth."},
    "white": {"name": "White/Golden Aura", "meaning": "Pure consciousness, divine protection, enlightened awareness",
              "chakra": "crown", "strengths": "Spiritual purity, angelic connection, universal love",
              "shadow": "Naivety, disconnection from practical life", "advice": "You carry light. Share it without depleting yourself."},
}


def compute_aura_color(mood_history, birth_month, birth_day):
    seed = (birth_month * 31 + birth_day) % 8
    color_keys = list(AURA_COLORS.keys())
    base_color = color_keys[seed]
    if mood_history:
        mood_map = {"happy": "yellow", "peaceful": "green", "grateful": "violet",
                    "stressed": "red", "anxious": "blue", "sad": "indigo",
                    "angry": "red", "tired": "orange", "confused": "indigo", "neutral": "white"}
        recent = mood_history[-1] if mood_history else ""
        if recent in mood_map:
            base_color = mood_map[recent]
    return base_color


@router.get("/reiki/chakras")
async def get_chakras():
    return {"chakras": CHAKRAS}


@router.get("/reiki/positions")
async def get_positions():
    return {"positions": REIKI_POSITIONS}


@router.get("/reiki/aura-colors")
async def get_aura_colors():
    return {"colors": AURA_COLORS}


@router.post("/reiki/aura-reading")
async def aura_reading(data: dict = Body(...), user=Depends(get_current_user)):
    uid = user["id"]
    birth_month = data.get("birth_month", 1)
    birth_day = data.get("birth_day", 1)
    recent_moods = await db.moods.find({"user_id": uid}, {"_id": 0, "mood": 1}).sort("created_at", -1).to_list(10)
    mood_list = [m.get("mood", "") for m in recent_moods]
    aura_key = compute_aura_color(mood_list, birth_month, birth_day)
    aura = AURA_COLORS.get(aura_key, AURA_COLORS["green"])
    chakra_data = next((c for c in CHAKRAS if c["id"] == aura.get("chakra", "heart")), CHAKRAS[3])
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"aura-{uuid.uuid4()}",
                        system_message="You are a gifted energy reader and Reiki master. Give a deeply personal, compassionate aura reading. Be specific, warm, and spiritually insightful. 3-4 paragraphs.")
        mood_str = ", ".join(mood_list[:5]) if mood_list else "no recent moods recorded"
        prompt = f"Give an aura reading for someone with a {aura['name']}. Their recent moods: {mood_str}. Born month {birth_month}, day {birth_day}. Their dominant chakra is {chakra_data['name']}. Include: current energy state, what their aura reveals about their spiritual journey, and guidance for the coming days."
        response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
        reading_text = response
    except Exception as e:
        logger.error(f"Aura reading AI error: {e}")
        reading_text = f"Your energy radiates {aura['name']} — {aura['meaning']}. Your {chakra_data['name']} is calling for attention. {aura['advice']}"
    doc = {
        "id": str(uuid.uuid4()), "user_id": uid,
        "aura_color": aura_key, "aura_data": aura,
        "chakra_focus": chakra_data["id"],
        "reading": reading_text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.aura_readings.insert_one(doc)
    return {"aura_color": aura_key, "aura": aura, "chakra": chakra_data, "reading": reading_text, "id": doc["id"]}


@router.get("/reiki/readings")
async def get_readings(user=Depends(get_current_user)):
    readings = await db.aura_readings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return {"readings": readings}


@router.post("/reiki/healing-session")
async def log_healing(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_type": data.get("session_type", "self_reiki"),
        "positions_used": data.get("positions_used", []),
        "duration_minutes": data.get("duration_minutes", 0),
        "chakras_focused": data.get("chakras_focused", []),
        "intention": data.get("intention", ""),
        "sensations": data.get("sensations", ""),
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reiki_sessions.insert_one(doc)
    return {"status": "logged", "id": doc["id"]}


@router.get("/reiki/sessions")
async def get_healing_sessions(user=Depends(get_current_user)):
    sessions = await db.reiki_sessions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"sessions": sessions}
