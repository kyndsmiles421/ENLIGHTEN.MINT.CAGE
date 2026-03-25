from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_SECRET = "cosmic-zen-secret-key-2024"
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Models ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class MoodCreate(BaseModel):
    mood: str
    intensity: int = Field(ge=1, le=10)
    note: Optional[str] = None

class JournalCreate(BaseModel):
    title: str
    content: str
    mood: Optional[str] = None

class AffirmationRequest(BaseModel):
    theme: Optional[str] = "general"

class AIGenerateRequest(BaseModel):
    topic: Optional[str] = "general"

class RitualStep(BaseModel):
    type: str  # breathing, meditation, exercise, affirmation, frequency
    name: str
    duration: int  # seconds
    config: Optional[dict] = None

class RitualCreate(BaseModel):
    name: str
    time_of_day: str = "morning"  # morning, evening, anytime
    steps: List[RitualStep]

class RitualComplete(BaseModel):
    duration_seconds: int
    steps_completed: int

# --- Auth Helpers ---
def create_token(user_id: str, name: str):
    payload = {
        "sub": user_id,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": payload["sub"], "name": payload["name"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Auth Routes ---
@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "streak": 0,
        "last_active": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, user.name)
    return {"token": token, "user": {"id": user_id, "name": user.name, "email": user.email}}

@api_router.post("/auth/login")
async def login(user: UserLogin):
    found = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not found or not bcrypt.checkpw(user.password.encode(), found["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(found["id"], found["name"])
    return {"token": token, "user": {"id": found["id"], "name": found["name"], "email": found["email"]}}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    found = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not found:
        raise HTTPException(status_code=404, detail="User not found")
    return found

# --- Mood Routes ---
@api_router.post("/moods")
async def create_mood(mood: MoodCreate, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "mood": mood.mood,
        "intensity": mood.intensity,
        "note": mood.note,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.moods.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/moods")
async def get_moods(user=Depends(get_current_user)):
    moods = await db.moods.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return moods

# --- Journal Routes ---
@api_router.post("/journal")
async def create_journal(entry: JournalCreate, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.journal.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/journal")
async def get_journal(user=Depends(get_current_user)):
    entries = await db.journal.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return entries

@api_router.delete("/journal/{entry_id}")
async def delete_journal(entry_id: str, user=Depends(get_current_user)):
    result = await db.journal.delete_one({"id": entry_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"deleted": True}

# --- Affirmation Routes ---
@api_router.get("/affirmations/daily")
async def get_daily_affirmation():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.affirmations.find_one({"date": today, "type": "daily"}, {"_id": 0})
    if existing:
        return existing
    affirmations = [
        "I am a beacon of light and love in this universe.",
        "Every breath I take fills me with peace and clarity.",
        "I release all that no longer serves my highest good.",
        "The universe conspires in my favor, always.",
        "I am connected to the infinite wisdom within me.",
        "My consciousness expands with every passing moment.",
        "I am worthy of all the beauty life has to offer.",
        "Peace flows through me like a gentle river.",
        "I trust the journey and embrace the unknown.",
        "My energy is a gift I share freely with the world."
    ]
    text = random.choice(affirmations)
    doc = {"id": str(uuid.uuid4()), "text": text, "date": today, "type": "daily", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.affirmations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.post("/affirmations/generate")
async def generate_affirmation(req: AffirmationRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"affirmation-{str(uuid.uuid4())}",
            system_message="You are a spiritual guide and mindfulness teacher. Generate a single powerful, uplifting affirmation that promotes inner peace, consciousness expansion, and positive energy. Keep it to 1-2 sentences. Do not use quotes around it. Be poetic and profound."
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=f"Generate a unique affirmation about: {req.theme}")
        response = await chat.send_message(msg)
        return {"text": response, "theme": req.theme, "generated": True}
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        return {"text": "You are a luminous being of infinite potential, radiating peace in every direction.", "theme": req.theme, "generated": False}

# --- Exercises (Qigong, Tai Chi, etc.) ---
EXERCISES_DATA = [
    {
        "id": "qigong-standing",
        "name": "Standing Like a Tree (Zhan Zhuang)",
        "category": "qigong",
        "duration": "10-20 min",
        "level": "Beginner",
        "description": "The foundational Qigong posture that cultivates deep internal energy. Stand with feet shoulder-width apart, knees slightly bent, arms rounded as if hugging a large tree. Focus on your lower dantian (below navel) and breathe naturally.",
        "benefits": ["Builds Qi energy", "Strengthens legs and core", "Calms the nervous system", "Improves posture and balance"],
        "steps": [
            "Stand with feet shoulder-width apart, toes pointing forward",
            "Bend knees slightly, tucking tailbone under",
            "Raise arms to chest height as if embracing a large ball",
            "Relax shoulders, soften gaze, breathe into lower belly",
            "Hold for 5-20 minutes, gradually increasing time"
        ],
        "color": "#2DD4BF"
    },
    {
        "id": "qigong-eight-brocades",
        "name": "Eight Pieces of Brocade (Ba Duan Jin)",
        "category": "qigong",
        "duration": "15-25 min",
        "level": "Beginner",
        "description": "An ancient set of eight exercises that stretch and strengthen the body, stimulate organ function, and cultivate Qi flow through the meridians.",
        "benefits": ["Enhances flexibility", "Stimulates organ health", "Balances Qi flow", "Reduces stress and tension"],
        "steps": [
            "Two Hands Hold Up the Heavens - stretch arms overhead",
            "Drawing the Bow - archer stance, pull imaginary bow",
            "Separating Heaven and Earth - alternate arms up/down",
            "Wise Owl Gazes Backward - turn head slowly side to side",
            "Sway Head and Shake Tail - deep squat with side bends",
            "Two Hands Hold the Feet - forward fold with spine stretch",
            "Clench Fists and Glare - horse stance with punches",
            "Bouncing on Toes - rise up and drop heels seven times"
        ],
        "color": "#14B8A6"
    },
    {
        "id": "taichi-cloud-hands",
        "name": "Cloud Hands (Yun Shou)",
        "category": "tai_chi",
        "duration": "10-15 min",
        "level": "Beginner",
        "description": "One of the most meditative Tai Chi movements. The hands move like clouds drifting across the sky while weight shifts from side to side, creating a flowing dance of Yin and Yang.",
        "benefits": ["Improves coordination", "Calms the mind", "Enhances body awareness", "Promotes fluid movement"],
        "steps": [
            "Stand in shoulder-width stance, weight centered",
            "Raise right hand to face level, palm facing you",
            "Shift weight to right foot as right hand moves right",
            "Left hand rises as right hand lowers",
            "Shift weight to left foot, hands continue flowing",
            "Repeat the cloud-like movement for 5-10 minutes"
        ],
        "color": "#D8B4FE"
    },
    {
        "id": "taichi-ward-off",
        "name": "Grasp Sparrow's Tail",
        "category": "tai_chi",
        "duration": "15-20 min",
        "level": "Intermediate",
        "description": "The cornerstone sequence of Yang-style Tai Chi containing four essential energies: Ward Off, Roll Back, Press, and Push. This sequence teaches the fundamental principles of yielding and expressing energy.",
        "benefits": ["Develops root and structure", "Teaches energy sensitivity", "Strengthens legs", "Improves martial awareness"],
        "steps": [
            "Begin in Wu Ji (standing meditation) posture",
            "Ward Off (Peng) - expand outward with rounded arm",
            "Roll Back (Lu) - yield and redirect incoming energy",
            "Press (Ji) - compress and release forward energy",
            "Push (An) - ground and express energy through palms",
            "Return to beginning and repeat on other side"
        ],
        "color": "#C084FC"
    },
    {
        "id": "qigong-five-elements",
        "name": "Five Element Qigong",
        "category": "qigong",
        "duration": "20-30 min",
        "level": "Intermediate",
        "description": "A practice based on Traditional Chinese Medicine's Five Elements (Wood, Fire, Earth, Metal, Water). Each movement corresponds to an element, organ system, and emotion, creating holistic balance.",
        "benefits": ["Balances organ systems", "Harmonizes emotions", "Deepens elemental awareness", "Promotes seasonal health"],
        "steps": [
            "Wood (Liver) - Side stretches like a growing tree",
            "Fire (Heart) - Open chest, radiate joy outward",
            "Earth (Spleen) - Centering spiral movements",
            "Metal (Lungs) - Drawing in pure Qi with breath",
            "Water (Kidneys) - Flowing downward like a waterfall"
        ],
        "color": "#FCD34D"
    },
    {
        "id": "taichi-24form",
        "name": "24-Form Tai Chi (Simplified)",
        "category": "tai_chi",
        "duration": "20-30 min",
        "level": "Intermediate",
        "description": "The standardized 24-movement Tai Chi form created in 1956 to make Tai Chi accessible to all. A flowing sequence that embodies meditation in motion and cultivates deep internal harmony.",
        "benefits": ["Full body workout", "Deep meditation in motion", "Improves balance", "Cultivates patience and presence"],
        "steps": [
            "Commencing Form - settle into stillness",
            "Part Wild Horse's Mane - flowing diagonal steps",
            "White Crane Spreads Wings - open and close",
            "Brush Knee and Twist Step - walking with intent",
            "Playing the Lute - single whip posture",
            "Continue through all 24 movements mindfully"
        ],
        "color": "#FDA4AF"
    }
]

@api_router.get("/exercises")
async def get_exercises():
    return EXERCISES_DATA

@api_router.post("/exercises/ai-guide")
async def get_exercise_guide(req: AIGenerateRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"exercise-{str(uuid.uuid4())}",
            system_message="You are a master Qigong and Tai Chi instructor with 40 years of experience. Provide a detailed, warm, and encouraging guided practice session. Include breathing cues, visualization, and energy awareness instructions. Keep response under 300 words."
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=f"Guide me through a {req.topic} practice session. Include step-by-step instructions with breathing and energy visualization cues.")
        response = await chat.send_message(msg)
        return {"guide": response, "topic": req.topic}
    except Exception as e:
        logger.error(f"AI exercise guide error: {e}")
        return {"guide": "Begin by standing quietly. Feel your feet rooted to the earth. Breathe slowly and deeply into your lower belly. Let your arms float upward as you inhale, descend as you exhale. Feel the Qi moving through your body like warm golden light.", "topic": req.topic}

# --- Nourishment / Energy Foods ---
NOURISHMENT_DATA = [
    {
        "id": "golden-milk",
        "name": "Golden Milk (Turmeric Latte)",
        "category": "drinks",
        "energy_type": "warming",
        "description": "An ancient Ayurvedic elixir combining turmeric, ginger, and warming spices in creamy milk. Deeply anti-inflammatory, it calms the mind and nourishes the spirit before meditation or sleep.",
        "ingredients": ["Turmeric", "Ginger", "Cinnamon", "Black pepper", "Coconut milk", "Honey"],
        "benefits": ["Anti-inflammatory", "Promotes restful sleep", "Supports digestion", "Enhances mood"],
        "element": "Fire",
        "color": "#FCD34D"
    },
    {
        "id": "matcha-ceremony",
        "name": "Ceremonial Matcha",
        "category": "drinks",
        "energy_type": "awakening",
        "description": "High-grade matcha used in Japanese tea ceremonies for centuries. Rich in L-theanine which promotes calm alertness - the perfect state for meditation and conscious awareness.",
        "ingredients": ["Ceremonial matcha powder", "Hot water (70-80C)", "Bamboo whisk"],
        "benefits": ["Calm focus", "Rich in antioxidants", "Boosts metabolism", "Enhances concentration"],
        "element": "Wood",
        "color": "#86EFAC"
    },
    {
        "id": "adaptogen-bowl",
        "name": "Adaptogen Power Bowl",
        "category": "meals",
        "energy_type": "balancing",
        "description": "A nourishing bowl featuring adaptogenic superfoods that help the body resist physical, chemical, and biological stressors. Perfect post-meditation fuel.",
        "ingredients": ["Quinoa", "Ashwagandha", "Maca root", "Goji berries", "Hemp seeds", "Avocado", "Spirulina"],
        "benefits": ["Stress adaptation", "Hormone balance", "Sustained energy", "Brain nourishment"],
        "element": "Earth",
        "color": "#2DD4BF"
    },
    {
        "id": "cacao-ceremony",
        "name": "Cacao Ceremony Drink",
        "category": "drinks",
        "energy_type": "heart-opening",
        "description": "Raw ceremonial cacao has been used by indigenous cultures for millennia as a heart-opening medicine. Theobromine gently stimulates the cardiovascular system and releases feel-good endorphins.",
        "ingredients": ["Raw cacao paste", "Cayenne pepper", "Vanilla", "Cinnamon", "Honey", "Hot water"],
        "benefits": ["Heart opening", "Mood elevation", "Rich in magnesium", "Spiritual connection"],
        "element": "Fire",
        "color": "#92400E"
    },
    {
        "id": "qi-soup",
        "name": "Qi Nourishing Bone Broth",
        "category": "meals",
        "energy_type": "grounding",
        "description": "A Traditional Chinese Medicine staple, slow-simmered bone broth infused with astragalus, goji berries, and jujube dates. Deeply nourishing to Qi and blood.",
        "ingredients": ["Organic bones", "Astragalus root", "Goji berries", "Jujube dates", "Ginger", "Scallion"],
        "benefits": ["Builds Qi energy", "Supports immunity", "Nourishes joints", "Warms the body"],
        "element": "Earth",
        "color": "#FDA4AF"
    },
    {
        "id": "sattvic-plate",
        "name": "Sattvic Ayurvedic Plate",
        "category": "meals",
        "energy_type": "elevating",
        "description": "In Ayurveda, Sattvic foods are pure, clean, and promote clarity of mind and lightness of body. This plate combines fresh, seasonal, and minimally processed ingredients for spiritual nourishment.",
        "ingredients": ["Basmati rice", "Mung dal", "Ghee", "Fresh vegetables", "Cumin", "Coriander", "Fresh fruits"],
        "benefits": ["Mental clarity", "Digestive ease", "Spiritual elevation", "Dosha balance"],
        "element": "Air",
        "color": "#D8B4FE"
    },
    {
        "id": "mushroom-elixir",
        "name": "Mushroom Adaptogen Elixir",
        "category": "drinks",
        "energy_type": "grounding",
        "description": "A blend of medicinal mushrooms revered in Eastern medicine for thousands of years. Lion's Mane for the mind, Reishi for the spirit, Chaga for the body.",
        "ingredients": ["Lion's Mane", "Reishi", "Chaga", "Cordyceps", "Oat milk", "Cinnamon"],
        "benefits": ["Cognitive enhancement", "Immune support", "Nervous system calm", "Spiritual grounding"],
        "element": "Water",
        "color": "#7C3AED"
    },
    {
        "id": "prana-smoothie",
        "name": "Prana Life Force Smoothie",
        "category": "drinks",
        "energy_type": "vitalizing",
        "description": "A vibrant green smoothie packed with chlorophyll-rich foods that ancient yogis believed contain concentrated prana (life force energy).",
        "ingredients": ["Spirulina", "Wheatgrass", "Banana", "Moringa", "Coconut water", "Chia seeds", "Fresh mint"],
        "benefits": ["Prana enhancement", "Detoxification", "Energy boost", "Alkalizing"],
        "element": "Air",
        "color": "#22C55E"
    }
]

@api_router.get("/nourishment")
async def get_nourishment():
    return NOURISHMENT_DATA

@api_router.post("/nourishment/suggest")
async def suggest_nourishment(req: AIGenerateRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"nourishment-{str(uuid.uuid4())}",
            system_message="You are an Ayurvedic nutrition expert and Traditional Chinese Medicine food therapist. Suggest a specific food or drink recipe that supports spiritual practice and energy cultivation. Include the recipe name, brief description, key ingredients, and how it supports consciousness expansion. Keep under 200 words."
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=f"Suggest a nourishing recipe for someone who wants to: {req.topic}")
        response = await chat.send_message(msg)
        return {"suggestion": response, "topic": req.topic}
    except Exception as e:
        logger.error(f"AI nourishment error: {e}")
        return {"suggestion": "Try warm lemon water with honey and a pinch of turmeric first thing in the morning. This simple elixir awakens your digestive fire (Agni) and clears stagnant energy from your system.", "topic": req.topic}

# --- Biometric Frequencies ---
FREQUENCIES_DATA = [
    {
        "id": "freq-174",
        "frequency": 174,
        "name": "Foundation Frequency",
        "category": "solfeggio",
        "description": "The lowest Solfeggio frequency acts as a natural anesthetic. It reduces pain, both physical and energetic, giving your organs a sense of security, safety, and love.",
        "benefits": ["Pain reduction", "Grounding energy", "Sense of security", "Physical healing"],
        "chakra": "Root",
        "color": "#EF4444"
    },
    {
        "id": "freq-285",
        "frequency": 285,
        "name": "Quantum Cognition",
        "category": "solfeggio",
        "description": "This frequency helps heal tissues and brings them to their original form by sending a message to restructure damaged organs. It influences the energy field around you.",
        "benefits": ["Tissue healing", "Energy field repair", "Cellular regeneration", "Restructuring"],
        "chakra": "Sacral",
        "color": "#F97316"
    },
    {
        "id": "freq-396",
        "frequency": 396,
        "name": "Liberation from Fear",
        "category": "solfeggio",
        "description": "This frequency liberates the energy of fear and guilt. It cleanses trauma from the cellular memory, helping you achieve your goals by removing subconscious blocks.",
        "benefits": ["Fear release", "Guilt liberation", "Goal achievement", "Trauma clearing"],
        "chakra": "Root",
        "color": "#EF4444"
    },
    {
        "id": "freq-417",
        "frequency": 417,
        "name": "Facilitating Change",
        "category": "solfeggio",
        "description": "Connected to the sacral chakra, this frequency undoes situations and facilitates change. It cleanses traumatic experiences and clears destructive influences of past events.",
        "benefits": ["Change facilitation", "Trauma clearing", "Negative energy removal", "New beginnings"],
        "chakra": "Sacral",
        "color": "#F97316"
    },
    {
        "id": "freq-432",
        "frequency": 432,
        "name": "Universal Harmony",
        "category": "earth",
        "description": "Known as Verdi's A, 432Hz is mathematically consistent with the universe. Music tuned to this frequency fills the listener with warmth and promotes healing and a deep sense of peace.",
        "benefits": ["Universal alignment", "Heart resonance", "Natural harmony", "Deep relaxation"],
        "chakra": "Heart",
        "color": "#22C55E"
    },
    {
        "id": "freq-528",
        "frequency": 528,
        "name": "Miracle Tone / DNA Repair",
        "category": "solfeggio",
        "description": "The 'Love Frequency' resonates at the heart of everything. It is said to repair DNA, bring transformation, and create miracles. Used by biochemists to repair human DNA.",
        "benefits": ["DNA repair", "Transformation", "Miracles", "Love frequency activation"],
        "chakra": "Solar Plexus",
        "color": "#FCD34D"
    },
    {
        "id": "freq-639",
        "frequency": 639,
        "name": "Connecting Relationships",
        "category": "solfeggio",
        "description": "This frequency enhances communication, understanding, tolerance, and love. It can be used to heal relationship problems and re-connect with loved ones.",
        "benefits": ["Harmonious relationships", "Enhanced communication", "Heart opening", "Tolerance"],
        "chakra": "Heart",
        "color": "#22C55E"
    },
    {
        "id": "freq-741",
        "frequency": 741,
        "name": "Awakening Intuition",
        "category": "solfeggio",
        "description": "This frequency cleans the cell from toxins and electromagnetic radiation. It leads to a purer, more stable spiritual life and helps with problem-solving and self-expression.",
        "benefits": ["Toxin cleansing", "Intuition awakening", "Self-expression", "Problem solving"],
        "chakra": "Throat",
        "color": "#3B82F6"
    },
    {
        "id": "freq-852",
        "frequency": 852,
        "name": "Return to Spiritual Order",
        "category": "solfeggio",
        "description": "This frequency is directly connected to the third eye chakra. It raises awareness and opens intuition, allowing you to communicate with the all-embracing Spirit.",
        "benefits": ["Third eye activation", "Spiritual awareness", "Inner strength", "Intuition"],
        "chakra": "Third Eye",
        "color": "#8B5CF6"
    },
    {
        "id": "freq-963",
        "frequency": 963,
        "name": "Divine Consciousness",
        "category": "solfeggio",
        "description": "The highest Solfeggio frequency is associated with the Crown Chakra. Known as the 'God Frequency', it awakens any system to its original, perfect state of oneness.",
        "benefits": ["Crown chakra activation", "Divine connection", "Enlightenment", "Cosmic consciousness"],
        "chakra": "Crown",
        "color": "#D8B4FE"
    },
    {
        "id": "freq-7_83",
        "frequency": 7.83,
        "name": "Schumann Resonance",
        "category": "earth",
        "description": "The Earth's fundamental frequency - the electromagnetic pulse of our planet. Attuning to this frequency grounds us to Earth's natural rhythm and restores our biological clock.",
        "benefits": ["Earth grounding", "Circadian rhythm reset", "Anti-inflammation", "Deep meditation"],
        "chakra": "Root",
        "color": "#854D0E"
    },
    {
        "id": "freq-40",
        "frequency": 40,
        "name": "Gamma Consciousness",
        "category": "binaural",
        "description": "40Hz gamma waves are associated with higher mental activity, peak consciousness, and 'aha' moments. Buddhist monks in deep meditation produce sustained gamma wave activity.",
        "benefits": ["Peak performance", "Enhanced cognition", "Spiritual insight", "Memory enhancement"],
        "chakra": "Crown",
        "color": "#E879F9"
    }
]

@api_router.get("/frequencies")
async def get_frequencies():
    return FREQUENCIES_DATA

# --- Dashboard Stats ---
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    mood_count = await db.moods.count_documents({"user_id": user["id"]})
    journal_count = await db.journal.count_documents({"user_id": user["id"]})
    recent_moods = await db.moods.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(7)
    
    today = datetime.now(timezone.utc).date()
    dates_active = set()
    all_moods = await db.moods.find({"user_id": user["id"]}, {"_id": 0, "created_at": 1}).to_list(1000)
    all_journals = await db.journal.find({"user_id": user["id"]}, {"_id": 0, "created_at": 1}).to_list(1000)
    for m in all_moods:
        dates_active.add(datetime.fromisoformat(m["created_at"]).date())
    for j in all_journals:
        dates_active.add(datetime.fromisoformat(j["created_at"]).date())
    
    streak = 0
    check_date = today
    while check_date in dates_active:
        streak += 1
        check_date -= timedelta(days=1)
    
    return {
        "mood_count": mood_count,
        "journal_count": journal_count,
        "streak": streak,
        "recent_moods": recent_moods
    }

# --- Health ---
@api_router.get("/")
async def root():
    return {"message": "Cosmic Zen API is alive"}

# --- Rituals ---
@api_router.post("/rituals")
async def create_ritual(ritual: RitualCreate, user=Depends(get_current_user)):
    steps_data = [s.model_dump() for s in ritual.steps]
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": ritual.name,
        "time_of_day": ritual.time_of_day,
        "steps": steps_data,
        "total_duration": sum(s.duration for s in ritual.steps),
        "completions": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.rituals.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/rituals")
async def get_rituals(user=Depends(get_current_user)):
    rituals = await db.rituals.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return rituals

@api_router.delete("/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str, user=Depends(get_current_user)):
    result = await db.rituals.delete_one({"id": ritual_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return {"deleted": True}

@api_router.post("/rituals/{ritual_id}/complete")
async def complete_ritual(ritual_id: str, data: RitualComplete, user=Depends(get_current_user)):
    ritual = await db.rituals.find_one({"id": ritual_id, "user_id": user["id"]}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    completion = {
        "id": str(uuid.uuid4()),
        "ritual_id": ritual_id,
        "ritual_name": ritual["name"],
        "user_id": user["id"],
        "duration_seconds": data.duration_seconds,
        "steps_completed": data.steps_completed,
        "total_steps": len(ritual["steps"]),
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ritual_completions.insert_one(completion)
    completion.pop("_id", None)
    
    await db.rituals.update_one(
        {"id": ritual_id},
        {"$inc": {"completions": 1}}
    )
    return completion

@api_router.get("/rituals/history")
async def get_ritual_history(user=Depends(get_current_user)):
    completions = await db.ritual_completions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(100)
    
    total_sessions = len(completions)
    total_minutes = sum(c.get("duration_seconds", 0) for c in completions) // 60
    
    # Streak calc
    today = datetime.now(timezone.utc).date()
    dates = set()
    for c in completions:
        dates.add(datetime.fromisoformat(c["completed_at"]).date())
    streak = 0
    check = today
    while check in dates:
        streak += 1
        check -= timedelta(days=1)
    
    return {
        "completions": completions[:20],
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "ritual_streak": streak
    }

@api_router.get("/rituals/templates")
async def get_ritual_templates():
    return [
        {
            "id": "morning-awakening",
            "name": "Morning Awakening",
            "time_of_day": "morning",
            "description": "Start your day with intention and energy",
            "steps": [
                {"type": "breathing", "name": "Energizing Breath", "duration": 180, "config": {"pattern": "energizing"}},
                {"type": "affirmation", "name": "Morning Affirmation", "duration": 60, "config": None},
                {"type": "exercise", "name": "Eight Pieces of Brocade", "duration": 600, "config": {"exercise_id": "qigong-eight-brocades"}},
                {"type": "meditation", "name": "Intention Setting", "duration": 300, "config": {"preset": "5min"}},
            ],
            "total_duration": 1140,
            "color": "#FCD34D"
        },
        {
            "id": "evening-unwind",
            "name": "Evening Unwind",
            "time_of_day": "evening",
            "description": "Release the day and prepare for restorative sleep",
            "steps": [
                {"type": "breathing", "name": "4-7-8 Relaxation", "duration": 240, "config": {"pattern": "relaxation"}},
                {"type": "frequency", "name": "432Hz Universal Harmony", "duration": 180, "config": {"frequency_id": "freq-432"}},
                {"type": "meditation", "name": "Body Scan", "duration": 600, "config": {"preset": "10min"}},
                {"type": "affirmation", "name": "Gratitude Reflection", "duration": 60, "config": None},
            ],
            "total_duration": 1080,
            "color": "#D8B4FE"
        },
        {
            "id": "energy-boost",
            "name": "Midday Energy Boost",
            "time_of_day": "anytime",
            "description": "Quick recharge for when you need a lift",
            "steps": [
                {"type": "breathing", "name": "Box Breathing", "duration": 120, "config": {"pattern": "box"}},
                {"type": "exercise", "name": "Standing Like a Tree", "duration": 300, "config": {"exercise_id": "qigong-standing"}},
                {"type": "frequency", "name": "528Hz Miracle Tone", "duration": 120, "config": {"frequency_id": "freq-528"}},
            ],
            "total_duration": 540,
            "color": "#2DD4BF"
        },
        {
            "id": "deep-consciousness",
            "name": "Deep Consciousness",
            "time_of_day": "anytime",
            "description": "An extended practice for spiritual exploration",
            "steps": [
                {"type": "breathing", "name": "Pranayama Flow", "duration": 300, "config": {"pattern": "pranayama"}},
                {"type": "frequency", "name": "963Hz Divine Consciousness", "duration": 300, "config": {"frequency_id": "freq-963"}},
                {"type": "exercise", "name": "Cloud Hands", "duration": 600, "config": {"exercise_id": "taichi-cloud-hands"}},
                {"type": "meditation", "name": "Deep Awareness", "duration": 1200, "config": {"preset": "20min"}},
                {"type": "affirmation", "name": "Closing Intention", "duration": 60, "config": None},
            ],
            "total_duration": 2460,
            "color": "#8B5CF6"
        }
    ]

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
