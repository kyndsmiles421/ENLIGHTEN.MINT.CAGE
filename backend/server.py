from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import jwt
import hashlib
import bcrypt
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_SECRET = os.environ.get('JWT_SECRET')
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

class CommunityPostCreate(BaseModel):
    post_type: str  # thought, shared_ritual, shared_affirmation, milestone
    content: str
    ritual_data: Optional[dict] = None
    affirmation_text: Optional[str] = None
    milestone_type: Optional[str] = None
    milestone_value: Optional[int] = None

class CommentCreate(BaseModel):
    text: str

class ChallengeCheckin(BaseModel):
    note: Optional[str] = None

class ProfileCustomize(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    vibe_status: Optional[str] = None
    favorite_quote: Optional[str] = None
    cover_image: Optional[str] = None
    avatar_style: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_color: Optional[str] = None
    music_choice: Optional[str] = None
    music_frequency: Optional[float] = None
    show_stats: Optional[bool] = True
    show_activity: Optional[bool] = True
    visibility: Optional[str] = None  # "public", "private", "friends"
    message_privacy: Optional[str] = None  # "everyone", "friends_only", "nobody"

class ReadingRequest(BaseModel):
    reading_type: str
    spread: Optional[str] = None
    zodiac_sign: Optional[str] = None
    birth_year: Optional[int] = None
    question: Optional[str] = None

class ClassEnroll(BaseModel):
    class_id: str

class LessonComplete(BaseModel):
    class_id: str
    lesson_id: str

class NarrationRequest(BaseModel):
    text: str
    speed: Optional[float] = 1.0
    voice: Optional[str] = "nova"

class KnowledgeRequest(BaseModel):
    topic: str
    category: str
    context: Optional[str] = None

class CustomCreation(BaseModel):
    type: str  # affirmation, meditation, ritual, breathwork, mantra
    title: str
    content: str
    tags: Optional[list] = []

class AICreateRequest(BaseModel):
    type: str
    intention: str

class PlantCreate(BaseModel):
    plant_type: str

class GuidedMeditationRequest(BaseModel):
    intention: str
    duration: int = 10
    focus: str = "general"
    name: Optional[str] = None

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

optional_security = HTTPBearer(auto_error=False)

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(optional_security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": payload["sub"], "name": payload["name"]}
    except Exception:
        return None

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
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
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
        "video_url": "https://www.youtube.com/embed/gUB-i92b6tY",
        "description": "The foundational Qigong posture, also known as 'Embracing the Tree'. This deceptively simple standing meditation is considered the single most important practice in internal martial arts and Qigong healing. By holding a static posture with proper alignment, you allow Qi to gather in the lower Dantian (energy center below the navel), strengthen the fascial network, and develop deep root connection with the earth. Masters practice this daily for up to an hour.",
        "philosophy": "In stillness, find the deepest movement. Zhan Zhuang teaches us that power comes not from effort, but from alignment with natural forces. Like a tree with deep roots, the practitioner becomes unshakable yet flexible.",
        "benefits": ["Builds Qi energy in the Dantian", "Strengthens legs, core, and deep stabilizers", "Calms the nervous system and reduces cortisol", "Improves posture and spinal alignment", "Develops energetic sensitivity", "Increases bone density"],
        "steps": [
            "Stand with feet parallel, shoulder-width apart, toes pointing straight forward. Feel even weight across both feet.",
            "Soften and unlock the knees, bending them slightly. Tuck the tailbone gently under — imagine sitting on the edge of a high stool.",
            "Let your arms rise to chest height, elbows slightly below shoulders, as if you are gently hugging a large balloon or tree trunk. Keep space under the armpits.",
            "Relax the shoulders completely — let them drop away from the ears. Soften the chest. The tongue touches the roof of the mouth behind the front teeth.",
            "Breathe naturally into the lower belly (Dantian, about 2 inches below the navel). Don't force the breath — let it settle into a slow, deep rhythm on its own.",
            "Soften your gaze, looking straight ahead or slightly downward. Half-close the eyes. Release tension from the jaw, face, and forehead.",
            "Hold this posture. Begin with 5 minutes and add 1-2 minutes each week. If trembling or heat arises, this is Qi moving — allow it.",
            "To close: slowly lower the arms, bring palms to rest over the lower belly. Stand quietly for 1-2 minutes, feeling the Qi settling."
        ],
        "tips": "If your shoulders ache, lower the arms slightly. The key is relaxation within structure. Pain means misalignment — adjust, don't push through.",
        "color": "#2DD4BF"
    },
    {
        "id": "qigong-eight-brocades",
        "name": "Eight Pieces of Brocade (Ba Duan Jin)",
        "category": "qigong",
        "duration": "15-25 min",
        "level": "Beginner",
        "video_url": "https://www.youtube.com/embed/3FJy0EDoYK0",
        "description": "One of the most widely practiced Qigong sets in the world, dating back over 800 years to the Song Dynasty. The 'Eight Brocades' (Ba Duan Jin) is a complete system of eight exercises that systematically work every organ, joint, and meridian in the body. Each movement targets specific organ systems according to Traditional Chinese Medicine, making this an ideal daily health maintenance routine. The movements are gentle enough for the elderly yet powerful enough to benefit martial artists.",
        "philosophy": "Like eight pieces of fine brocade silk, each movement is beautiful on its own yet together they form a complete tapestry of health. This practice reminds us that wellness requires attention to every aspect of our being.",
        "benefits": ["Stretches and strengthens the entire body", "Stimulates all major organ systems", "Balances Qi flow through all 12 primary meridians", "Reduces stress and muscular tension", "Improves digestion and immune function", "Enhances respiratory capacity"],
        "steps": [
            "Two Hands Hold Up the Heavens (Shuang Shou Tuo Tian): Interlace fingers, turn palms upward and press toward the sky as you rise onto your toes. Stretch the entire Triple Burner meridian. This regulates all three energy centers of the body. Hold for 3 breaths, lower, repeat 8 times.",
            "Drawing the Bow to Shoot the Eagle (Zuo You Kai Gong): Step into a wide horse stance. Extend one arm as if holding a bow, pull the other back as if drawing the string. Gaze at the extended finger. This opens the lungs and strengthens the arms. Alternate sides, 8 repetitions.",
            "Separating Heaven and Earth (Tiao Li Pi Wei): One palm presses up, the other presses down, stretching the stomach and spleen meridians along the sides. This directly improves digestion and nutrient absorption. Alternate arms, 8 repetitions.",
            "Wise Owl Gazes Backward (Wu Lao Qi Shang): Slowly turn your head to look behind you, first left then right. Keep shoulders still. This releases neck tension, stimulates the vagus nerve, and treats the 'five fatigues and seven injuries'. 8 repetitions each side.",
            "Sway the Head and Shake the Tail (Yao Tou Bai Wei): From a deep horse stance, lean forward and circle the upper body side to side, like an ox shaking off water. This releases excess heart fire and calms the spirit. 8 circles each direction.",
            "Two Hands Hold the Feet to Strengthen the Kidneys (Liang Shou Pan Zu): Reach down and hold the backs of your ankles or feet, then slowly rise, sliding hands up the backs of the legs and along the spine. This strengthens the kidneys and lower back. 8 repetitions.",
            "Clench the Fists and Glare Fiercely (Zan Quan Nu Mu): From horse stance, punch forward slowly with intensity while glaring with wide eyes. This builds liver Qi, releases frustration, and increases vitality. 8 punches each side.",
            "Bouncing on the Toes (Bei Hou Qi Dian): Rise up onto the balls of your feet, then drop your heels sharply to the ground. The vibration travels up through the bones and shakes loose stagnant energy. This is said to cure 100 diseases. Repeat 7 times."
        ],
        "tips": "Move slowly with your breath — inhale on expansive movements, exhale on contracting ones. Quality over quantity. Even 1 round done mindfully is more valuable than 10 done mechanically.",
        "color": "#14B8A6"
    },
    {
        "id": "taichi-cloud-hands",
        "name": "Cloud Hands (Yun Shou)",
        "category": "tai_chi",
        "duration": "10-15 min",
        "level": "Beginner",
        "video_url": "https://www.youtube.com/embed/Sqp2FvIQlZw",
        "description": "Cloud Hands is considered the quintessential Tai Chi movement — a living meditation in motion. The hands move like clouds drifting across the sky while weight shifts from side to side. This single movement contains all the essential principles of Tai Chi: weight shifting, waist turning, continuous flow, and the interplay of Yin and Yang. Many masters say that if you could only practice one movement, Cloud Hands would be the one to choose.",
        "philosophy": "Clouds move without effort, without destination, shaped by the wind yet always whole. In Cloud Hands, we learn to move like nature — effortlessly responsive, perpetually transforming, never grasping.",
        "benefits": ["Develops smooth weight shifting and balance", "Calms the mind through rhythmic, meditative movement", "Enhances whole-body coordination and awareness", "Opens the waist and hips for fluid Qi circulation", "Teaches the integration of upper and lower body", "Relieves stress and promotes deep relaxation"],
        "steps": [
            "Begin in a shoulder-width stance, weight evenly distributed. Arms hang naturally at your sides. Take several deep breaths to center yourself.",
            "Shift your weight to the right foot. As you do, the right hand begins to rise, palm facing you, moving from hip level up to face level. The left hand simultaneously descends.",
            "As the right hand reaches face height, begin turning your waist to the right. The entire upper body moves as one unit — arms don't move independently from the torso.",
            "Now shift weight to the left. The left hand rises as the right descends. The waist turns left. Feel the weight pour from one leg to the other like water.",
            "As you grow comfortable, add stepping: when weight shifts fully left, step the right foot in toward the left. When weight shifts right, step the left foot out to shoulder width.",
            "Move continuously without pause. There is no beginning and no end. The transitions between left and right are as important as the positions themselves.",
            "Breathe naturally. Don't try to coordinate breath with movement — let the breath find its own rhythm within the movement.",
            "Practice for 5-10 minutes. To close, gradually make the movements smaller until you return to standing stillness. Rest with hands on the lower Dantian."
        ],
        "tips": "The secret is in the waist — the arms follow the torso, they don't lead it. If your arms are moving but your waist is still, you're doing arm waving, not Tai Chi. Move from the center.",
        "color": "#D8B4FE"
    },
    {
        "id": "taichi-ward-off",
        "name": "Grasp Sparrow's Tail (Lan Que Wei)",
        "category": "tai_chi",
        "duration": "15-20 min",
        "level": "Intermediate",
        "video_url": "https://www.youtube.com/embed/BpfleNSyLWo",
        "description": "Grasp Sparrow's Tail is the cornerstone sequence of Yang-style Tai Chi, containing the four primary energies (Si Zheng): Peng (Ward Off), Lu (Roll Back), Ji (Press), and An (Push). These four energies correspond to the four cardinal directions and represent the fundamental ways energy can be expressed or received. This sequence teaches the complete cycle of yielding and issuing, making it essential for both martial application and health cultivation.",
        "philosophy": "To grasp a sparrow's tail without harming it requires sensitivity, gentleness, and perfect timing — the same qualities needed to handle life's challenges with grace. Too much force and you crush what you hold; too little and it slips away.",
        "benefits": ["Develops structural integrity and rooting", "Teaches the four primary Tai Chi energies", "Strengthens legs and develops patience", "Improves martial awareness and sensitivity", "Cultivates the ability to yield without collapsing", "Trains whole-body connection (Zheng Ti Jin)"],
        "steps": [
            "Begin in Wu Ji (standing meditation) — feet shoulder-width, arms at sides, mind empty. This is the stillness from which all Tai Chi emerges. Stand for 1-2 minutes.",
            "WARD OFF (Peng): Step forward with the right foot. The right arm rises in front of the chest, forearm rounded as if holding a large balloon against your chest. Energy expands outward in all directions. This is yang energy expressing — don't lean forward, root down.",
            "ROLL BACK (Lu): Turn the waist to the right, sitting back onto the rear leg. Both hands guide an incoming force past you, like a bullfighter's cape. This is yin energy — you receive, redirect, and neutralize. Weight shifts 70% to the rear leg.",
            "PRESS (Ji): Shift weight forward again. The rear hand presses against the front wrist/forearm. Energy compresses then releases forward through the joined hands. Like a wave that draws back before crashing on shore.",
            "PUSH (An): Separate the hands to shoulder width, sit back. Then shift forward and push both palms forward at chest height. Ground the push through your back foot — the power comes from the earth, through the legs, directed by the waist, expressed through the hands.",
            "Complete the sequence on the right side, then turn and repeat on the left. Each transition should be smooth — there are no hard stops.",
            "Repeat the full sequence 4-8 times on each side. With practice, the four distinct movements will blend into one continuous flow.",
            "To close, return to Wu Ji standing. Place palms on the lower Dantian. Stand quietly for 2-3 minutes, allowing the Qi to settle and integrate."
        ],
        "tips": "Each of the four energies has a distinct quality — Peng is expansive like inflating a balloon, Lu is yielding like a swinging door, Ji is compressing like a spring, An is rooting like a wave. Feel these qualities, don't just mimic the shapes.",
        "color": "#C084FC"
    },
    {
        "id": "qigong-five-elements",
        "name": "Five Element Qigong (Wu Xing Gong)",
        "category": "qigong",
        "duration": "20-30 min",
        "level": "Intermediate",
        "video_url": "https://www.youtube.com/embed/_6Y8QSVyYhM",
        "description": "Five Element Qigong is a profound healing system based on Traditional Chinese Medicine's Five Element theory (Wu Xing). Each movement corresponds to one of the five elements — Wood, Fire, Earth, Metal, and Water — along with its associated organ system, emotion, season, color, and sound. By practicing all five movements, you create holistic balance throughout your body's energy system. This is both a physical exercise and an internal alchemy practice.",
        "philosophy": "The five elements are not separate forces but aspects of one continuously transforming energy. Wood feeds Fire, Fire creates Earth (ash), Earth bears Metal (minerals), Metal enriches Water (minerals dissolve), Water nourishes Wood (trees). Understanding this cycle within yourself is the key to lasting health.",
        "benefits": ["Balances all five major organ systems (liver, heart, spleen, lungs, kidneys)", "Harmonizes and transforms stuck emotions", "Deepens connection to seasonal and elemental awareness", "Promotes both physical health and spiritual growth", "Enhances understanding of TCM five-element theory", "Creates internal harmony between generating and controlling cycles"],
        "steps": [
            "WOOD (Liver/Gallbladder — Spring — Green — Anger→Kindness): Stand with feet shoulder-width. Stretch sideways like a tree bending in the wind — one arm reaches over the head to the opposite side while the other pushes down. The sound is 'SHHHH' (like wind through leaves). This releases frustration and cultivates decisiveness. 8 repetitions each side.",
            "FIRE (Heart/Small Intestine — Summer — Red — Anxiety→Joy): Open the chest wide, arms spreading out and up like flames dancing. Bring palms together at the heart center. The sound is 'HAWWW' (like a sigh of relief). This releases anxiety and opens the heart to joy and connection. 8 repetitions.",
            "EARTH (Spleen/Stomach — Late Summer — Yellow — Worry→Trust): Create gentle spiraling movements around the center of the body, hands circling the navel area. The sound is 'WHOOOO' (like a low hum). This settles overthinking, improves digestion, and cultivates groundedness. 8 circles each direction.",
            "METAL (Lungs/Large Intestine — Autumn — White — Grief→Courage): Extend arms wide on the inhale, gathering pure Qi. On the exhale, draw arms in and compress toward the lungs. The sound is 'SSSSS' (like air releasing). This processes grief, strengthens immunity, and builds inner courage. 8 repetitions.",
            "WATER (Kidneys/Bladder — Winter — Blue/Black — Fear→Wisdom): Bend forward, letting the upper body flow downward like a waterfall. Hands sweep down the backs of the legs. Rise slowly, hands tracing up the inner legs. The sound is 'CHEWWW' (like blowing out a candle). This dissolves fear, strengthens willpower, and nourishes deep reserves. 8 repetitions.",
            "INTEGRATION: After completing all five elements, stand in Wu Ji for 3-5 minutes. Visualize the five elemental colors circling within you — green, red, yellow, white, and blue — blending into pure golden light at your center.",
            "Place both palms on the lower Dantian. Feel the warmth gathering. This is the balanced energy of all five elements united.",
            "Bow gently to honor the practice and the wisdom of the elements within you."
        ],
        "tips": "Each element has a healing sound — practice the sounds softly on the exhale. The vibration of each sound resonates with its corresponding organ, amplifying the healing effect. Don't rush between elements; each one deserves full presence.",
        "color": "#FCD34D"
    },
    {
        "id": "taichi-24form",
        "name": "24-Form Tai Chi (Simplified Yang Style)",
        "category": "tai_chi",
        "duration": "20-30 min",
        "level": "Intermediate",
        "video_url": "https://www.youtube.com/embed/R8NbQecDygQ",
        "description": "The 24-Form Tai Chi, created in 1956 by the Chinese Sports Commission, distills the essential movements of traditional Yang-style Tai Chi into an accessible yet complete sequence. It is the most practiced Tai Chi form in the world, performed daily by millions. Despite its simplicity compared to the traditional 108-movement form, it contains all the fundamental principles of Tai Chi and serves as both a standalone health practice and a gateway to deeper study.",
        "philosophy": "Tai Chi is sometimes called 'meditation in motion' or 'moving stillness.' The 24-Form teaches us that true mastery lies not in complexity but in depth of understanding. A single step done with complete awareness is worth more than a hundred movements done mechanically.",
        "benefits": ["Complete full-body exercise touching every joint and muscle", "Deep moving meditation that cultivates present-moment awareness", "Proven to improve balance, reducing fall risk by up to 50%", "Reduces blood pressure and improves cardiovascular health", "Builds patience, discipline, and embodied mindfulness", "Gateway to deeper Tai Chi and internal arts practice"],
        "steps": [
            "OPENING: Commencing Form (Qi Shi) — Rise from stillness. Arms float up to shoulder height, then sink down as knees bend. This represents the universe emerging from emptiness (Wu Ji) into Tai Chi (the interplay of Yin and Yang).",
            "Part Wild Horse's Mane (Ye Ma Fen Zong) — Step diagonally forward, one hand sweeps up (mane), the other presses down. Alternate left and right, 3 repetitions. This teaches diagonal energy and weight shifting.",
            "White Crane Spreads Wings (Bai He Liang Chi) — Shift weight to rear leg, one hand rises above the head, the other drops to the hip. A moment of beautiful stillness within the flow. Empty the front foot completely.",
            "Brush Knee and Twist Step (Lou Xi Ao Bu) — Step forward, one hand brushes past the knee while the other pushes forward from the ear. This is one of the most practical self-defense movements, teaching simultaneous defense and attack.",
            "Playing the Lute (Shou Hui Pi Pa) — Step the rear foot forward, hands form a playing-the-lute position with one hand at wrist height of the other. A moment of contained energy, like a coiled spring.",
            "Repulse Monkey (Dao Juan Gong) — Step backward while one hand pulls back and the other pushes forward. Moving backward with confidence teaches us that retreat can be as powerful as advance.",
            "Continue through: Grasp Sparrow's Tail (both sides), Single Whip, Wave Hands Like Clouds, High Pat on Horse, Kick with Right/Left Heel, Strike Ears with Fists, Turn and Kick, Deflect-Parry-Punch, Apparent Close-Up, Cross Hands.",
            "CLOSING: Cross Hands (Shi Zi Shou) and Closing Form (Shou Shi) — Return to Wu Ji standing. All movement resolves back into stillness. The circle is complete. Stand quietly for 2-5 minutes."
        ],
        "tips": "Learn the form in small sections — 3-4 movements at a time. Practice each section until it feels natural before adding more. It takes most people 3-6 months to learn the complete form. There's no rush. The journey IS the practice.",
        "color": "#FDA4AF"
    }
]

@api_router.get("/exercises")
async def get_exercises():
    return JSONResponse(content=EXERCISES_DATA, headers={"Cache-Control": "public, max-age=3600"})

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
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
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
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
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
    return JSONResponse(content=FREQUENCIES_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Dashboard Stats ---
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    # Run all queries concurrently for speed
    uid = user["id"]
    mood_count_t, journal_count_t, recent_moods_t, all_moods_t, all_journals_t = await asyncio.gather(
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.moods.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(7),
        db.moods.find({"user_id": uid}, {"_id": 0, "created_at": 1}).sort("created_at", -1).to_list(365),
        db.journal.find({"user_id": uid}, {"_id": 0, "created_at": 1}).sort("created_at", -1).to_list(365),
    )
    
    today = datetime.now(timezone.utc).date()
    dates_active = set()
    for m in all_moods_t:
        dates_active.add(datetime.fromisoformat(m["created_at"]).date())
    for j in all_journals_t:
        dates_active.add(datetime.fromisoformat(j["created_at"]).date())
    
    streak = 0
    check_date = today
    while check_date in dates_active:
        streak += 1
        check_date -= timedelta(days=1)
    
    return {
        "mood_count": mood_count_t,
        "journal_count": journal_count_t,
        "streak": streak,
        "recent_moods": recent_moods_t
    }

# --- Challenges ---
CHALLENGES_DATA = [
    {
        "id": "7day-meditation",
        "name": "7-Day Meditation Marathon",
        "description": "Meditate every day for 7 consecutive days. Any duration counts — even 5 minutes of stillness is a victory.",
        "duration_days": 7,
        "category": "meditation",
        "difficulty": "Beginner",
        "color": "#D8B4FE",
        "icon": "timer",
        "rewards": ["Inner Peace Badge", "+7 Consciousness Points"]
    },
    {
        "id": "14day-breathwork",
        "name": "14-Day Breathwork Journey",
        "description": "Practice conscious breathing every day for two weeks. Watch how your relationship with breath transforms.",
        "duration_days": 14,
        "category": "breathing",
        "difficulty": "Intermediate",
        "color": "#2DD4BF",
        "icon": "wind",
        "rewards": ["Breath Master Badge", "+14 Consciousness Points"]
    },
    {
        "id": "21day-ritual",
        "name": "21-Day Morning Ritual",
        "description": "They say it takes 21 days to form a habit. Complete your morning ritual every day and transform your life.",
        "duration_days": 21,
        "category": "ritual",
        "difficulty": "Advanced",
        "color": "#FCD34D",
        "icon": "sunrise",
        "rewards": ["Ritual Master Badge", "+21 Consciousness Points", "Custom Ritual Unlock"]
    },
    {
        "id": "30day-journal",
        "name": "30-Day Sacred Journal",
        "description": "Write in your journal every single day for a month. Discover patterns, insights, and the depth of your own consciousness.",
        "duration_days": 30,
        "category": "journal",
        "difficulty": "Advanced",
        "color": "#86EFAC",
        "icon": "book",
        "rewards": ["Scribe of Light Badge", "+30 Consciousness Points"]
    },
    {
        "id": "7day-qigong",
        "name": "7-Day Qigong Flow",
        "description": "Practice any Qigong or Tai Chi exercise daily for a week. Feel the Qi awakening in your body.",
        "duration_days": 7,
        "category": "exercise",
        "difficulty": "Beginner",
        "color": "#FB923C",
        "icon": "zap",
        "rewards": ["Qi Cultivator Badge", "+7 Consciousness Points"]
    },
    {
        "id": "10day-mood",
        "name": "10-Day Emotional Awareness",
        "description": "Log your mood every day for 10 days. Become the witness of your emotional landscape without judgment.",
        "duration_days": 10,
        "category": "mood",
        "difficulty": "Beginner",
        "color": "#FDA4AF",
        "icon": "heart",
        "rewards": ["Emotional Sage Badge", "+10 Consciousness Points"]
    },
    {
        "id": "5day-frequency",
        "name": "5-Day Frequency Immersion",
        "description": "Explore a different healing frequency each day. Attune your biofield to the vibrations of the cosmos.",
        "duration_days": 5,
        "category": "frequency",
        "difficulty": "Beginner",
        "color": "#8B5CF6",
        "icon": "radio",
        "rewards": ["Frequency Adept Badge", "+5 Consciousness Points"]
    }
]

@api_router.get("/challenges")
async def get_challenges():
    # Single aggregation query instead of N+1 (was 14 queries, now 1)
    pipeline = [
        {"$group": {
            "_id": "$challenge_id",
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": ["$completed", 1, 0]}}
        }}
    ]
    counts = {doc["_id"]: {"participant_count": doc["total"], "completion_count": doc["completed"]}
              for doc in await db.challenge_participants.aggregate(pipeline).to_list(None)}
    
    challenges = []
    for c in CHALLENGES_DATA:
        stats = counts.get(c["id"], {"participant_count": 0, "completion_count": 0})
        challenges.append({**c, **stats})
    return challenges

@api_router.post("/challenges/{challenge_id}/join")
async def join_challenge(challenge_id: str, user=Depends(get_current_user)):
    challenge = next((c for c in CHALLENGES_DATA if c["id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    existing = await db.challenge_participants.find_one(
        {"challenge_id": challenge_id, "user_id": user["id"]}, {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this challenge")
    
    doc = {
        "id": str(uuid.uuid4()),
        "challenge_id": challenge_id,
        "challenge_name": challenge["name"],
        "user_id": user["id"],
        "user_name": user["name"],
        "joined_at": datetime.now(timezone.utc).isoformat(),
        "checkins": [],
        "current_streak": 0,
        "best_streak": 0,
        "total_checkins": 0,
        "completed": False,
        "completed_at": None
    }
    await db.challenge_participants.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.post("/challenges/{challenge_id}/checkin")
async def challenge_checkin(challenge_id: str, data: ChallengeCheckin, user=Depends(get_current_user)):
    participant = await db.challenge_participants.find_one(
        {"challenge_id": challenge_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not participant:
        raise HTTPException(status_code=404, detail="Not joined this challenge")
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    checkins = participant.get("checkins", [])
    
    if today in [c.get("date") for c in checkins]:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    checkins.append({
        "date": today,
        "note": data.note,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Calculate streak
    sorted_dates = sorted([c["date"] for c in checkins], reverse=True)
    streak = 0
    check_date = datetime.now(timezone.utc).date()
    for d in sorted_dates:
        if d == check_date.strftime("%Y-%m-%d"):
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    best_streak = max(streak, participant.get("best_streak", 0))
    total_checkins = len(checkins)
    
    challenge = next((c for c in CHALLENGES_DATA if c["id"] == challenge_id), None)
    completed = total_checkins >= challenge["duration_days"] if challenge else False
    
    update = {
        "checkins": checkins,
        "current_streak": streak,
        "best_streak": best_streak,
        "total_checkins": total_checkins,
        "completed": completed,
        "completed_at": datetime.now(timezone.utc).isoformat() if completed and not participant.get("completed") else participant.get("completed_at")
    }
    
    await db.challenge_participants.update_one(
        {"challenge_id": challenge_id, "user_id": user["id"]},
        {"$set": update}
    )
    
    return {
        "checkin_date": today,
        "current_streak": streak,
        "best_streak": best_streak,
        "total_checkins": total_checkins,
        "completed": completed,
        "challenge_name": challenge["name"] if challenge else ""
    }

@api_router.get("/challenges/my")
async def get_my_challenges(user=Depends(get_current_user)):
    participations = await db.challenge_participants.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("joined_at", -1).to_list(50)
    
    result = []
    for p in participations:
        challenge = next((c for c in CHALLENGES_DATA if c["id"] == p["challenge_id"]), None)
        if challenge:
            result.append({
                **p,
                "challenge": challenge,
                "progress": min(100, round((p["total_checkins"] / challenge["duration_days"]) * 100))
            })
    return result

@api_router.get("/challenges/{challenge_id}/leaderboard")
async def get_challenge_leaderboard(challenge_id: str):
    participants = await db.challenge_participants.find(
        {"challenge_id": challenge_id}, {"_id": 0}
    ).sort("current_streak", -1).to_list(20)
    
    return [{
        "user_id": p["user_id"],
        "user_name": p["user_name"],
        "current_streak": p["current_streak"],
        "best_streak": p["best_streak"],
        "total_checkins": p["total_checkins"],
        "completed": p["completed"]
    } for p in participants]

@api_router.get("/challenges/{challenge_id}/details")
async def get_challenge_details(challenge_id: str):
    challenge = next((c for c in CHALLENGES_DATA if c["id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    participant_count = await db.challenge_participants.count_documents({"challenge_id": challenge_id})
    completions = await db.challenge_participants.count_documents({"challenge_id": challenge_id, "completed": True})
    
    return {
        **challenge,
        "participant_count": participant_count,
        "completion_count": completions
    }

# --- Profile Customization ---
COVER_PRESETS = [
    {"id": "cosmic-nebula", "url": "https://images.unsplash.com/photo-1774341148248-4c0f5a2f28da?w=1200&h=400&fit=crop", "name": "Cosmic Nebula"},
    {"id": "aurora-night", "url": "https://images.pexels.com/photos/1661146/pexels-photo-1661146.jpeg?auto=compress&w=1200&h=400&fit=crop", "name": "Aurora Night"},
    {"id": "sunset-mountain", "url": "https://images.unsplash.com/photo-1764364645113-c48cff11d426?w=1200&h=400&fit=crop", "name": "Sunset Mountain"},
    {"id": "bamboo-zen", "url": "https://images.unsplash.com/photo-1772089003331-df509c66ac14?w=1200&h=400&fit=crop", "name": "Bamboo Zen"},
    {"id": "star-cluster", "url": "https://images.unsplash.com/photo-1708559831534-44c30eb3ab0e?w=1200&h=400&fit=crop", "name": "Star Cluster"},
    {"id": "twilight-tree", "url": "https://images.unsplash.com/photo-1766934911591-650c51fa7b55?w=1200&h=400&fit=crop", "name": "Twilight Tree"},
]

@api_router.get("/profile/covers")
async def get_cover_presets():
    return COVER_PRESETS

@api_router.put("/profile/customize")
async def customize_profile(data: ProfileCustomize, user=Depends(get_current_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No changes provided")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.profiles.update_one(
        {"user_id": user["id"]},
        {"$set": update, "$setOnInsert": {"user_id": user["id"], "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return profile

@api_router.get("/profile/me")
async def get_my_profile(user=Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not profile:
        return {"user_id": user["id"], "display_name": user_doc.get("name"), "bio": "", "cover_image": COVER_PRESETS[0]["url"], "theme_color": "#D8B4FE", "avatar_style": "purple-teal", "vibe_status": "", "favorite_quote": "", "music_choice": "none", "music_frequency": 432, "show_stats": True, "show_activity": True, "visibility": "public", "message_privacy": "everyone"}
    profile["display_name"] = profile.get("display_name") or user_doc.get("name")
    profile.setdefault("visibility", "public")
    profile.setdefault("message_privacy", "everyone")
    return profile

@api_router.get("/profile/public/{user_id}")
async def get_public_profile_full(user_id: str, user=Depends(get_current_user_optional)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "email": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0}) or {}

    visibility = profile.get("visibility", "public")
    viewer_id = user.get("id") if user else None
    is_owner = viewer_id == user_id

    # Check visibility permissions
    if not is_owner:
        if visibility == "private":
            return {
                "id": user_id,
                "display_name": profile.get("display_name") or user_doc.get("name"),
                "avatar_style": profile.get("avatar_style", "purple-teal"),
                "theme_color": profile.get("theme_color", "#D8B4FE"),
                "visibility": "private",
                "restricted": True,
                "message": "This profile is private.",
            }
        if visibility == "friends":
            is_friend = False
            if viewer_id:
                # Check mutual follows (both follow each other = friends)
                fwd = await db.follows.find_one({"follower_id": viewer_id, "following_id": user_id})
                rev = await db.follows.find_one({"follower_id": user_id, "following_id": viewer_id})
                is_friend = bool(fwd and rev)
            if not is_friend:
                return {
                    "id": user_id,
                    "display_name": profile.get("display_name") or user_doc.get("name"),
                    "avatar_style": profile.get("avatar_style", "purple-teal"),
                    "theme_color": profile.get("theme_color", "#D8B4FE"),
                    "visibility": "friends",
                    "restricted": True,
                    "message": "This profile is only visible to friends.",
                }

    mood_count, journal_count, post_count, ritual_sessions, challenge_count, follower_count, recent_posts = await asyncio.gather(
        db.moods.count_documents({"user_id": user_id}),
        db.journal.count_documents({"user_id": user_id}),
        db.community_posts.count_documents({"user_id": user_id}),
        db.ritual_completions.count_documents({"user_id": user_id}),
        db.challenge_participants.count_documents({"user_id": user_id}),
        db.follows.count_documents({"following_id": user_id}),
        db.community_posts.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(5),
    )
    return {
        "id": user_id,
        "name": user_doc.get("name"),
        "display_name": profile.get("display_name") or user_doc.get("name"),
        "bio": profile.get("bio", ""),
        "vibe_status": profile.get("vibe_status", ""),
        "favorite_quote": profile.get("favorite_quote", ""),
        "cover_image": profile.get("cover_image", COVER_PRESETS[0]["url"]),
        "avatar_style": profile.get("avatar_style", "purple-teal"),
        "avatar_url": profile.get("avatar_url"),
        "theme_color": profile.get("theme_color", "#D8B4FE"),
        "music_choice": profile.get("music_choice", "none"),
        "music_frequency": profile.get("music_frequency", 432),
        "show_stats": profile.get("show_stats", True),
        "show_activity": profile.get("show_activity", True),
        "visibility": visibility,
        "restricted": False,
        "member_since": user_doc.get("created_at"),
        "stats": {"moods": mood_count, "journals": journal_count, "posts": post_count, "rituals": ritual_sessions, "challenges": challenge_count, "followers": follower_count},
        "recent_posts": recent_posts
    }

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

@api_router.get("/oracle/tarot-deck")
async def get_tarot_deck():
    return TAROT_MAJOR_ARCANA

@api_router.get("/oracle/zodiac")
async def get_zodiac():
    return ZODIAC_SIGNS

@api_router.get("/oracle/chinese-zodiac")
async def get_chinese_zodiac():
    return CHINESE_ZODIAC

@api_router.get("/oracle/sacred-geometry")
async def get_sacred_geometry():
    return SACRED_GEOMETRY

@api_router.post("/oracle/reading")
async def get_reading(req: ReadingRequest):
    try:
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
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
            
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
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
            
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
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
            
            return {"type": "chinese_astrology", "animal": animal, "element": element, "year": year, "reading": response}
        
        elif req.reading_type == "iching":
            hexagram_lines = [random.choice([6, 7, 8, 9]) for _ in range(6)]
            hex_binary = "".join(["1" if ln in [7, 9] else "0" for ln in hexagram_lines])
            hex_num = int(hex_binary, 2) % 64 + 1
            changing = any(ln in [6, 9] for ln in hexagram_lines)
            
            system_msg = "You are a sage I Ching reader with deep understanding of the Book of Changes. Interpret the hexagram with wisdom, referencing the traditional meaning while making it personal and relevant. Include guidance for the seeker. Keep under 250 words."
            prompt = f"I Ching reading: Hexagram #{hex_num}. Lines from bottom to top: {hexagram_lines}. {'There are changing lines.' if changing else 'No changing lines.'}"
            if req.question:
                prompt += f" The seeker asks: {req.question}"
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"iching-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
            
            return {"type": "iching", "hexagram_number": hex_num, "lines": hexagram_lines, "changing": changing, "interpretation": response}
        
        elif req.reading_type == "sacred_geometry":
            pattern = random.choice(SACRED_GEOMETRY)
            
            system_msg = "You are a sacred geometry teacher and mystic. Give a meditation-style reading about this sacred geometry pattern, connecting it to the seeker's spiritual journey. Be poetic and profound. Keep under 200 words."
            prompt = f"Sacred geometry reading: {pattern['name']} - {pattern['description']}"
            if req.question:
                prompt += f" The seeker's intention: {req.question}"
            
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"geometry-{uuid.uuid4()}", system_message=system_msg)
            chat.with_model("openai", "gpt-5.2")
            response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
            
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

@api_router.get("/oracle/history")
async def get_reading_history(user=Depends(get_current_user)):
    readings = await db.oracle_readings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return readings

@api_router.post("/oracle/save")
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

# --- Mudras ---
from data.mudras import MUDRAS_DATA

@api_router.get("/mudras")
async def get_mudras():
    return JSONResponse(content=MUDRAS_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Yantra ---
from data.yantras import YANTRAS_DATA

@api_router.get("/yantras")
async def get_yantras():
    return JSONResponse(content=YANTRAS_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Tantra ---
from data.tantra import TANTRA_DATA

@api_router.get("/tantra")
async def get_tantra_practices():
    return JSONResponse(content=TANTRA_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Videos ---
VIDEOS_DATA = [
    # --- Mudras ---
    {"id": "v-mudra-basics", "title": "Introduction to Sacred Mudras", "category": "mudras", "description": "Learn the foundational hand gestures that channel cosmic energy through your body.", "duration": "12 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/OmS1BCYO_AY", "instructor": "Yoga With Adriene", "tags": ["mudras", "basics", "meditation", "healing"]},
    {"id": "v-mudra-elements", "title": "Mudras of the 5 Elements", "category": "mudras", "description": "Master the five elemental mudras — earth, fire, air, water, and ether — for holistic healing.", "duration": "15 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/dos0eW-YpHs", "instructor": "Brett Larkin", "tags": ["mudras", "elements", "healing"]},
    {"id": "v-mudra-flow", "title": "10-Minute Guided Mudra Meditation", "category": "mudras", "description": "A flowing mudra meditation sequence for new beginnings and heart opening.", "duration": "10 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/GVto6fsR_q0", "instructor": "Yoga With Bird", "tags": ["mudras", "meditation", "flow"]},
    # --- Yantra ---
    {"id": "v-yantra-meditation", "title": "Sri Yantra Guided Meditation", "category": "yantra", "description": "A 21-minute guided Sri Yantra meditation for awakening inner energy and superconsciousness.", "duration": "21 min", "level": "Intermediate", "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/D17GYCn-i7E", "instructor": "Ravi Shankar", "tags": ["yantra", "meditation", "sri yantra", "geometry"]},
    {"id": "v-sacred-geometry", "title": "Sacred Geometry in Nature", "category": "yantra", "description": "Discover the hidden Fibonacci patterns, golden ratio, and sacred geometry woven into all of nature.", "duration": "4 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/kkGeOWYOFoA", "instructor": "Cristobal Vila", "tags": ["yantra", "geometry", "nature", "consciousness"]},
    {"id": "v-yantra-528hz", "title": "Sri Yantra 528Hz & 432Hz Meditation", "category": "yantra", "description": "Gaze upon the Sri Yantra while absorbing solfeggio healing frequencies.", "duration": "30 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/21fW7SxD6BM", "instructor": "Meditative Mind", "tags": ["yantra", "frequencies", "528hz", "geometry"]},
    # --- Tantra ---
    {"id": "v-kundalini-intro", "title": "Kundalini Energy Awakening", "category": "tantra", "description": "Guided chakra activation from root to crown with spiraling energy visualization.", "duration": "38 min", "level": "Intermediate", "thumbnail": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/jH9qjwuuG6c", "instructor": "The Mindful Movement", "tags": ["kundalini", "tantra", "energy", "chakras"]},
    {"id": "v-chakra-healing", "title": "7 Chakra Seed Mantra Chanting", "category": "tantra", "description": "3 minutes per chakra — LAM, VAM, RAM, YAM, HAM, OM, AAH — for complete energy healing.", "duration": "21 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/NmAHY_tg9Es", "instructor": "Meditative Mind", "tags": ["chakras", "tantra", "healing", "mantra"]},
    {"id": "v-tantra-philosophy", "title": "Tantra: Expanding Consciousness", "category": "tantra", "description": "Understanding Tantra as the science of expanding consciousness through the Vigyan Bhairav Tantra.", "duration": "31 min", "level": "Intermediate", "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/rz3Pcx4J3y0", "instructor": "Dhyanse Meditation", "tags": ["tantra", "philosophy", "consciousness"]},
    # --- Breathing ---
    {"id": "v-box-breathing", "title": "Box Breathing Guided Practice", "category": "breathwork", "description": "5-minute guided box breathing (4-4-4-4) for calm focus, stress relief, and nervous system regulation.", "duration": "7 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/HbPXQq1eejY", "instructor": "Tower Yoga", "tags": ["breathwork", "breathing", "box", "pranayama"]},
    {"id": "v-breath-fire", "title": "Breath of Fire Tutorial", "category": "breathwork", "description": "Master the powerful Breath of Fire technique for energy, clarity, and detoxification.", "duration": "15 min", "level": "Advanced", "thumbnail": "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/4FY1-tpccOU", "instructor": "Acharya Dayanand", "tags": ["breathwork", "breathing", "kundalini", "advanced"]},
    {"id": "v-pranayama-intro", "title": "Pranayama for Beginners", "category": "breathwork", "description": "Learn the foundation of yogic breathing — proper technique for deep, conscious breathwork.", "duration": "10 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/5jdM1D6DlEo", "instructor": "YOGABODY", "tags": ["breathwork", "breathing", "pranayama", "beginner"]},
    # --- Meditation ---
    {"id": "v-meditation-beginner", "title": "10-Minute Guided Meditation", "category": "meditation", "description": "A gentle guided meditation for complete beginners — breath awareness and present-moment focus.", "duration": "10 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/U9YKY7fdwyg", "instructor": "Goodful", "tags": ["meditation", "mindfulness", "beginner"]},
    {"id": "v-meditation-calm", "title": "Daily Calm — Be Present", "category": "meditation", "description": "Settle the mind and body with this mindfulness meditation focused on openness and attention.", "duration": "10 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/ZToicYcHIOU", "instructor": "Calm", "tags": ["meditation", "mindfulness", "calm", "daily"]},
    {"id": "v-meditation-energy", "title": "Meditation for Positive Energy", "category": "meditation", "description": "Affirmations combined with full-body relaxation for uplifting your vibration.", "duration": "10 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/cyMxWXlX9sU", "instructor": "Lavendaire", "tags": ["meditation", "energy", "affirmations", "positive"]},
    # --- Frequencies ---
    {"id": "v-solfeggio", "title": "All 9 Solfeggio Frequencies", "category": "frequencies", "description": "Experience all 9 solfeggio frequencies from 174Hz to 963Hz for complete physical and spiritual healing.", "duration": "90 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/goyZbut_KFY", "instructor": "Meditative Mind", "tags": ["frequencies", "solfeggio", "sound healing", "hz"]},
    {"id": "v-528hz", "title": "528Hz Love Frequency Healing", "category": "frequencies", "description": "The miracle tone — 528Hz for DNA repair, emotional transformation, and deep heart healing.", "duration": "33 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/z5W6nCU6ckA", "instructor": "Healing Meditation", "tags": ["frequencies", "528hz", "healing", "hz"]},
    {"id": "v-singing-bowls", "title": "7 Chakra Crystal Singing Bowls", "category": "frequencies", "description": "432Hz crystal singing bowls resonating through all 7 chakras from root to crown.", "duration": "30 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/qn5KYYxYMqU", "instructor": "Inner Lotus Music", "tags": ["frequencies", "chakras", "bowls", "hz", "soundscapes"]},
    # --- Exercises ---
    {"id": "v-qigong-flow", "title": "20-Minute Daily Qigong Routine", "category": "exercises", "description": "A complete daily Qigong routine with warm-ups, full-body movements, and breathing.", "duration": "20 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/cwlvTcWR3Gs", "instructor": "Qigong with Kseny", "tags": ["exercises", "qigong", "morning", "flow"]},
    # --- Mantra ---
    {"id": "v-mantra-chanting", "title": "108 Om Chanting with Singing Bowls", "category": "mantra", "description": "108 repetitions of Om with 432Hz crystal singing bowls for deep meditation.", "duration": "31 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/eGAMRXIHmFo", "instructor": "Inner Lotus Music", "tags": ["mantra", "om", "chanting", "meditation", "soundscapes"]},
    # --- Soundscapes ---
    {"id": "v-nature-sounds", "title": "Forest Sounds for Meditation", "category": "soundscapes", "description": "Immersive forest ambiance — birds singing, wind through trees, and gentle stream sounds.", "duration": "60 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/xNN7iTA57jM", "instructor": "Relaxing Nature", "tags": ["soundscapes", "nature", "forest", "ambient"]},
    {"id": "v-rain-sleep", "title": "Rain Sounds for Deep Sleep", "category": "soundscapes", "description": "Gentle rain on leaves and distant thunder for the deepest relaxation and sleep.", "duration": "180 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/mPZkdNFkNps", "instructor": "The Relaxed Guy", "tags": ["soundscapes", "rain", "sleep", "ambient"]},
    # --- Nourishment ---
    {"id": "v-ayurveda-food", "title": "Ayurvedic Eating for Energy", "category": "nourishment", "description": "How to eat according to your dosha for maximum life force energy and vitality.", "duration": "12 min", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=225&fit=crop", "video_url": "https://www.youtube.com/embed/BpfleNSyLWo", "instructor": "Sahara Rose", "tags": ["nourishment", "ayurveda", "food", "energy"]},
]

@api_router.get("/videos")
async def get_videos():
    return JSONResponse(content=VIDEOS_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Classes & Certifications ---
CLASSES_DATA = [
    {"id": "cls-mudra-mastery", "title": "Mudra Mastery", "description": "Master the 9 essential mudras for healing, meditation, and energy work. Learn proper technique, timing, and combining mudras with breathwork.", "category": "mudras", "instructor": "Maya Chen", "duration": "4 weeks", "level": "Beginner to Intermediate", "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop", "color": "#D8B4FE",
     "lessons": [
         {"id": "l1", "title": "Foundation: Gyan & Anjali Mudra", "description": "Learn the two most fundamental mudras and their energetic effects.", "duration": "20 min", "order": 1, "video_url": "https://www.youtube.com/embed/OmS1BCYO_AY",
          "content": "Gyan Mudra (Gesture of Knowledge): Touch the tip of your index finger to the tip of your thumb, keeping the other three fingers extended and relaxed. Rest hands on your knees, palms facing up.\n\nEffects: Stimulates the root chakra, calms the mind, improves concentration, and relieves anxiety. This is the most commonly used meditation mudra.\n\nHold for: 15-45 minutes during meditation. Can be practiced anytime.\n\nAnjali Mudra (Prayer Position): Press both palms together at heart center with fingers pointing upward. Ensure even pressure across all fingers.\n\nEffects: Balances left and right hemispheres of the brain, centers the heart, and creates a circuit of energy between the hands and heart.\n\nPractice: Begin and end every meditation session with Anjali Mudra. Hold for 5-10 breaths while setting your intention."},
         {"id": "l2", "title": "Healing Mudras: Prana & Apana", "description": "Discover mudras for vitality and purification.", "duration": "25 min", "order": 2, "video_url": "https://www.youtube.com/embed/dos0eW-YpHs",
          "content": "Prana Mudra (Life Force Mudra): Touch the tips of your ring finger and little finger to the tip of your thumb. Index and middle fingers stay extended.\n\nEffects: Activates dormant energy in the body, strengthens the immune system, improves eyesight, and reduces fatigue. This mudra directly increases your vital life force (prana).\n\nHold for: 15-30 minutes daily. Especially powerful during sunrise meditation.\n\nApana Mudra (Purification Mudra): Touch the tips of your middle finger and ring finger to the tip of your thumb. Index and little fingers remain extended.\n\nEffects: Aids digestion and elimination, detoxifies the body, regulates diabetes, and helps with constipation. This is the body's natural cleansing mudra.\n\nPractice: Hold for 15 minutes after meals for improved digestion. Practice 45 minutes daily for deep detoxification."},
         {"id": "l3", "title": "Elemental Balance: Vayu & Surya", "description": "Balance the air and fire elements in your body.", "duration": "20 min", "order": 3, "video_url": "https://www.youtube.com/embed/GVto6fsR_q0",
          "content": "Vayu Mudra (Air Element Mudra): Fold your index finger toward the palm and press the thumb gently over it. Other fingers stay straight.\n\nEffects: Reduces excess air element (Vata) in the body. Relieves gas, bloating, joint pain, neck pain, and sciatica. Calms an overactive nervous system.\n\nHold for: Practice for 45 minutes daily. Can be done in three 15-minute sessions.\n\nSurya Mudra (Fire/Sun Mudra): Fold your ring finger to the base of your thumb. Press the thumb gently over the ring finger. Other fingers remain straight.\n\nEffects: Increases the fire element (Agni). Boosts metabolism, aids weight management, reduces cholesterol, improves thyroid function, and builds internal heat.\n\nPractice: Hold for 15-30 minutes daily. Best practiced in the morning on an empty stomach. Avoid if you have fever."},
         {"id": "l4", "title": "Advanced: Dhyana & Shuni", "description": "Deepen meditation and build discipline through mudras.", "duration": "30 min", "order": 4, "video_url": "https://www.youtube.com/embed/OmS1BCYO_AY",
          "content": "Dhyana Mudra (Meditation Mudra): Place both hands in your lap, right hand resting on top of the left, palms facing up. Touch the tips of both thumbs together forming a triangle.\n\nEffects: The deepest meditation mudra — used by the Buddha. Creates a circuit of energy that draws awareness inward. The triangle formed by the thumbs represents the Three Jewels and the fire of consciousness.\n\nHold for: The entire duration of your meditation practice. This is the primary mudra for Zen and Vipassana meditation.\n\nShuni Mudra (Patience Mudra): Touch the tip of your middle finger to the tip of your thumb. Keep other fingers straight.\n\nEffects: Generates patience, discernment, and discipline. Helps overcome procrastination and builds commitment. Connected to Saturn energy — the teacher planet.\n\nPractice: Hold for 5-15 minutes when you need focus, discipline, or patience. Excellent before important tasks or decisions."},
         {"id": "l5", "title": "Integration: Daily Mudra Practice", "description": "Create your personal mudra routine combining all you've learned.", "duration": "25 min", "order": 5, "video_url": "https://www.youtube.com/embed/dos0eW-YpHs",
          "content": "Building Your Daily Mudra Routine:\n\nMorning Practice (20 minutes):\n1. Begin with Anjali Mudra — 10 breaths to set intention\n2. Prana Mudra — 5 minutes to activate life force\n3. Gyan Mudra — 10 minutes meditation\n4. Close with Anjali Mudra — gratitude\n\nAfternoon Reset (10 minutes):\n1. Surya Mudra — 5 minutes for energy boost\n2. Shuni Mudra — 5 minutes for focus\n\nEvening Wind-Down (15 minutes):\n1. Vayu Mudra — 5 minutes to calm the nervous system\n2. Apana Mudra — 5 minutes for cleansing\n3. Dhyana Mudra — 5 minutes deep stillness\n\nKey Principles:\n- Always practice on an empty or light stomach\n- Both hands should ideally perform the same mudra\n- Combine with conscious breathing for 10x effect\n- Consistency matters more than duration — 10 minutes daily beats 1 hour weekly\n- You can practice mudras while walking, sitting, or lying down"},
     ]},
    {"id": "cls-yantra-wisdom", "title": "Yantra Wisdom", "description": "Understand the sacred geometry of yantras, learn traditional meditation techniques, and discover how to use yantras for manifestation and healing.", "category": "yantra", "instructor": "Ravi Shankar", "duration": "3 weeks", "level": "Intermediate", "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop", "color": "#EF4444",
     "lessons": [
         {"id": "l1", "title": "What Are Yantras?", "description": "The history, science, and spiritual significance of sacred diagrams.", "duration": "15 min", "order": 1, "video_url": "https://www.youtube.com/embed/kkGeOWYOFoA",
          "content": "A Yantra is a sacred geometric diagram used as a tool for meditation and spiritual advancement. The word comes from Sanskrit: 'Yan' (to control) + 'Tra' (instrument) = an instrument for controlling or directing energy.\n\nYantras are the visual equivalent of mantras. While a mantra is a sound form of divine energy, a yantra is its visual form. Together they create a complete circuit of spiritual power.\n\nKey Elements:\n- Bindu (center dot): Represents the source — pure consciousness, the point from which all creation emerges\n- Triangles: Upward triangles represent Shiva (masculine/consciousness). Downward triangles represent Shakti (feminine/energy)\n- Circles: Represent cycles, wholeness, and the rotation of cosmic energy\n- Lotus petals: Represent unfolding consciousness and purity emerging from the material world\n- Square frame (Bhupura): The earthly realm, the boundary between inner sacred space and outer world\n\nYantras are not just art — they are precise mathematical diagrams that, when meditated upon, restructure your consciousness to resonate with the energy pattern they represent."},
         {"id": "l2", "title": "Sri Yantra Deep Dive", "description": "Master the most powerful yantra and its meditation technique.", "duration": "30 min", "order": 2, "video_url": "https://www.youtube.com/embed/D17GYCn-i7E",
          "content": "The Sri Yantra is considered the supreme yantra — the 'king of yantras.' It contains 9 interlocking triangles (4 upward, 5 downward) creating 43 smaller triangles, surrounded by lotus petals and a square gate.\n\nTrataka (Gazing) Meditation with Sri Yantra:\n1. Place the yantra at eye level, about 2 feet away\n2. Light a candle or lamp near it for soft illumination\n3. Gaze at the central bindu (dot) without blinking for as long as comfortable\n4. When tears come, close your eyes and see the after-image on your inner screen\n5. Hold this inner vision as long as possible\n6. When it fades, open eyes and repeat\n\nPractice for 15-20 minutes daily. Over time, the yantra pattern will appear spontaneously in meditation.\n\nThe 9 circuits of Sri Yantra represent 9 levels of consciousness from the physical to the absolute. As you meditate, you traverse these levels inward toward the bindu — the point of pure awareness."},
         {"id": "l3", "title": "Deity Yantras", "description": "Ganesh, Kali, Lakshmi, and Saraswati yantras for specific intentions.", "duration": "25 min", "order": 3, "video_url": "https://www.youtube.com/embed/21fW7SxD6BM",
          "content": "Each deity yantra channels a specific aspect of cosmic energy:\n\nGanesh Yantra: For removing obstacles and new beginnings. Contains a downward triangle (grounding energy) with a bindu. Meditate on this before starting any new project or venture.\n\nLakshmi Yantra: For abundance, prosperity, and beauty. Features interlocking triangles surrounded by lotus petals (representing blooming abundance). Use during financial planning or gratitude practices.\n\nSaraswati Yantra: For knowledge, creativity, and artistic expression. A flowing design representing the river of wisdom. Meditate before study, creative work, or important communication.\n\nKali Yantra: For transformation, dissolving ego, and fearlessness. Contains powerful interlocking triangles with intense energy. Use during times of major life changes or when you need courage to release what no longer serves you.\n\nPractice: Choose one yantra that matches your current intention. Place it in your meditation space. Combine with the deity's seed mantra for amplified effect."},
         {"id": "l4", "title": "Yantra Meditation Mastery", "description": "Advanced yantra gazing and inner visualization techniques.", "duration": "35 min", "order": 4, "video_url": "https://www.youtube.com/embed/D17GYCn-i7E",
          "content": "Advanced Yantra Practice:\n\nLevel 1 — External Trataka: Gaze at the physical yantra with steady, soft focus. Let the geometry absorb your attention completely.\n\nLevel 2 — Internal Trataka: After gazing, close eyes and hold the after-image. When it fades, recreate it mentally. Build up to holding the complete yantra in your mind for 5+ minutes.\n\nLevel 3 — Dynamic Visualization: In meditation, enter the yantra. Visualize yourself shrinking and stepping through the bhupura gate. Walk through each circuit — feel the energy of each layer changing as you move inward toward the bindu.\n\nLevel 4 — Yantra-Mantra Fusion: Combine your visualization with the appropriate seed mantra. As you chant, see the sound vibration activating different parts of the yantra — making it glow, pulse, and radiate.\n\nLevel 5 — Becoming the Yantra: The final stage — your body IS the yantra. The bindu is at your heart center. The triangles are your energy channels. The lotus petals are your chakras. You don't meditate ON the yantra — you ARE the yantra.\n\nDaily Assignment: Practice 20 minutes of yantra meditation using the technique matching your current level."},
     ]},
    {"id": "cls-tantra-foundations", "title": "Tantra Foundations", "description": "A comprehensive introduction to tantric philosophy and practice — chakras, energy channels, breathwork, mantra, and the science of expanding consciousness.", "category": "tantra", "instructor": "Ananda Ji", "duration": "6 weeks", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop", "color": "#FCD34D",
     "lessons": [
         {"id": "l1", "title": "What Is Tantra?", "description": "Demystifying tantra — the science of energy and consciousness expansion.", "duration": "20 min", "order": 1, "video_url": "https://www.youtube.com/embed/rz3Pcx4J3y0",
          "content": "Tantra literally means 'loom' or 'weave' — it is the science of weaving together all aspects of life into a unified spiritual practice. Unlike paths that reject the world, Tantra embraces EVERYTHING as a vehicle for awakening.\n\nCore Principles:\n1. Everything is sacred — the body, desires, emotions, and the material world are not obstacles but doorways\n2. Energy (Shakti) and Consciousness (Shiva) are two aspects of one reality\n3. What you resist persists; what you embrace transforms\n4. The body is your primary temple — it contains all the tools for liberation\n\nTantra is NOT just about sexuality (that's only one small branch). The full tantric path includes: breathwork (pranayama), mantra (sacred sound), yantra (sacred form), mudra (sacred gesture), meditation (dhyana), ritual (puja), and energy work (kundalini practices).\n\nThe Vigyan Bhairav Tantra — the oldest known tantric text — contains 112 meditation techniques given by Shiva to Shakti. Each one is a doorway to expanded consciousness."},
         {"id": "l2", "title": "The Chakra System", "description": "Understanding the 7 energy centers and their role in spiritual evolution.", "duration": "30 min", "order": 2, "video_url": "https://www.youtube.com/embed/NmAHY_tg9Es",
          "content": "The 7 major chakras are energy vortexes along your spine, each governing specific physical, emotional, and spiritual functions:\n\n1. MULADHARA (Root) — Base of spine — RED — Survival, grounding, stability. Seed mantra: LAM\n2. SVADHISTHANA (Sacral) — Below navel — ORANGE — Creativity, pleasure, emotion. Seed mantra: VAM\n3. MANIPURA (Solar Plexus) — Stomach — YELLOW — Willpower, confidence, identity. Seed mantra: RAM\n4. ANAHATA (Heart) — Chest center — GREEN — Love, compassion, connection. Seed mantra: YAM\n5. VISHUDDHA (Throat) — Throat — BLUE — Expression, truth, communication. Seed mantra: HAM\n6. AJNA (Third Eye) — Between brows — INDIGO — Intuition, insight, vision. Seed mantra: OM\n7. SAHASRARA (Crown) — Top of head — VIOLET/WHITE — Unity, transcendence, cosmic consciousness. Seed mantra: Silence\n\nPractice: Sit quietly. Bring attention to each chakra from root to crown. At each center, chant the seed mantra 3 times. Visualize the corresponding color glowing brighter with each chant. Spend 2-3 minutes at each chakra."},
         {"id": "l3", "title": "Tantric Breathwork", "description": "Circular breathing, Breath of Fire, and alternate nostril breathing.", "duration": "25 min", "order": 3, "video_url": "https://www.youtube.com/embed/4FY1-tpccOU",
          "content": "Breath is the bridge between body and consciousness. These three practices form the foundation of tantric breathwork:\n\nNadi Shodhana (Alternate Nostril Breathing): Close right nostril with thumb, inhale left (4 counts). Close both, hold (4 counts). Release right, exhale right (4 counts). Inhale right (4 counts). Close both, hold (4 counts). Release left, exhale left (4 counts). This is one round. Practice 10 rounds.\nEffect: Balances left (lunar/yin) and right (solar/yang) energy channels.\n\nKapalabhati (Breath of Fire): Sharp, forceful exhales through the nose with passive inhales. The belly pumps — pulling in sharply on each exhale. Start with 30 repetitions, rest, repeat 3 rounds.\nEffect: Purifies energy channels, builds internal heat, activates solar plexus.\n\nCircular Breathing: Breathe continuously with no pause between inhale and exhale. Imagine the breath as a circle — up the front of the body on inhale, down the back on exhale.\nEffect: Builds massive energy charge, can induce altered states."},
         {"id": "l4", "title": "Mantra Science", "description": "The power of sacred sound — learn key mantras and their effects.", "duration": "20 min", "order": 4, "video_url": "https://www.youtube.com/embed/eGAMRXIHmFo",
          "content": "Mantras are precise sound formulas that create specific vibrations in your body and energy field.\n\nEssential Mantras:\n\nOM — The primordial sound containing all sounds. Vibrates the entire body. Chant for 5 minutes to reset your energy.\n\nOM MANI PADME HUM — The jewel in the lotus. Compassion mantra that opens the heart and purifies all six realms of consciousness.\n\nSO HUM — 'I am That.' Coordinate with breath: SO on inhale, HUM on exhale. This is the mantra of identity — reminding you that you are one with all that is.\n\nOM NAMAH SHIVAYA — Salutation to the inner Self. The five syllables (Na-Ma-Shi-Va-Ya) correspond to the five elements (earth, water, fire, air, ether) and purify each.\n\n108 Repetitions: Use a mala (prayer beads) to count 108 repetitions. 108 is sacred: 1 (God/unity) × 0 (emptiness/completeness) × 8 (infinity) = the totality of existence.\n\nPractice: Choose one mantra. Chant it aloud 108 times using a mala. Then whisper it 108 times. Then chant it silently 108 times. Notice how the vibration deepens at each level."},
         {"id": "l5", "title": "Energy Body Activation", "description": "Nadis, kundalini, and practices for awakening subtle energy.", "duration": "35 min", "order": 5, "video_url": "https://www.youtube.com/embed/jH9qjwuuG6c",
          "content": "The Energy Body:\nYour physical body is surrounded and interpenetrated by an energy body consisting of 72,000 nadis (energy channels). Three are primary:\n\n- IDA (left/lunar/yin): Cooling, calming, intuitive. Flows from left nostril down the left side of the spine.\n- PINGALA (right/solar/yang): Heating, activating, analytical. Flows from right nostril down the right side.\n- SUSHUMNA (central): The main channel running through the center of the spine. When kundalini rises through this channel, enlightenment occurs.\n\nKundalini Activation Practice (Gentle):\n1. Sit with spine straight. Practice 5 minutes of alternate nostril breathing to balance ida and pingala.\n2. Bring attention to the base of your spine. Visualize a coiled serpent of golden light resting there.\n3. On each inhale, feel a warm, golden energy rising slightly up the spine.\n4. On each exhale, feel it settle and stabilize at whatever height it has reached.\n5. Do NOT force it. Let it rise naturally over weeks and months of practice.\n6. After 15-20 minutes, bring awareness back to your breath. Ground yourself.\n\nWARNING: Kundalini awakening should be gradual. Forced awakening can cause physical and psychological disturbances. Always practice with respect and patience."},
         {"id": "l6", "title": "Integration & Daily Sadhana", "description": "Build your personal tantric practice for daily transformation.", "duration": "25 min", "order": 6, "video_url": "https://www.youtube.com/embed/rz3Pcx4J3y0",
          "content": "Your Personal Daily Sadhana (Spiritual Practice):\n\nMorning Practice (30-45 minutes):\n1. Wake before sunrise. Splash cold water on face.\n2. Sit facing east. Light a candle or incense.\n3. 5 min — Alternate nostril breathing (Nadi Shodhana)\n4. 5 min — Kapalabhati (3 rounds of 30)\n5. 5 min — Chakra seed mantra chanting (LAM through OM)\n6. 15 min — Meditation with your chosen mantra (108 repetitions)\n7. 5 min — Gratitude and intention setting with Anjali Mudra\n\nEvening Practice (15-20 minutes):\n1. 5 min — Gentle circular breathing to release the day\n2. 10 min — Yantra meditation (Sri Yantra or your chosen deity yantra)\n3. 5 min — Body scan and energy sealing (visualize golden light surrounding you)\n\nWeekly Intensive:\nChoose one day per week for a 60-90 minute extended practice. Combine all techniques into one flowing session.\n\nKey Principle: Regularity is more important than duration. 15 minutes every day transforms your consciousness more than 3 hours once a week."},
     ]},
    {"id": "cls-frequency-healing", "title": "Frequency Healing", "description": "Master the science of sound healing using solfeggio frequencies, binaural beats, and planetary tones for physical, emotional, and spiritual healing.", "category": "frequencies", "instructor": "Sound Healer Akasha", "duration": "3 weeks", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop", "color": "#8B5CF6",
     "lessons": [
         {"id": "l1", "title": "The Science of Sound", "description": "How frequencies affect the body, brain, and consciousness.", "duration": "20 min", "order": 1, "video_url": "https://www.youtube.com/embed/goyZbut_KFY",
          "content": "Sound is vibration, and everything in the universe vibrates at specific frequencies. Your body is not solid — it is a symphony of vibrating atoms, cells, and organs, each with their own resonant frequency.\n\nKey Concepts:\n\nResonance: When one vibrating object causes another to vibrate at the same frequency. This is how sound healing works — external frequencies can entrain your body's frequencies.\n\nEntrainment: Your brain naturally synchronizes with dominant external rhythms. This is why drumming induces trance and why binaural beats can shift your brainstate.\n\nCymatics: The study of visible sound. When sound frequencies are applied to water or sand, they create geometric patterns — proving that sound literally shapes matter. Since your body is 60% water, sound directly restructures your physical being.\n\nBrainwave States:\n- Beta (14-40 Hz): Normal waking consciousness, alertness\n- Alpha (8-14 Hz): Relaxed, meditative, creative\n- Theta (4-8 Hz): Deep meditation, dream state, intuition\n- Delta (0.5-4 Hz): Deep sleep, healing, regeneration\n- Gamma (40-100 Hz): Peak consciousness, insight, bliss"},
         {"id": "l2", "title": "The 9 Solfeggio Frequencies", "description": "Deep dive into the ancient 9-tone scale and its healing properties.", "duration": "30 min", "order": 2, "video_url": "https://www.youtube.com/embed/goyZbut_KFY",
          "content": "The solfeggio frequencies are an ancient 9-tone scale believed to have been used in sacred Gregorian chants:\n\n174 Hz — Foundation of Conscious Evolution. Reduces pain and stress. Creates a sense of safety and security.\n\n285 Hz — Quantum Cognition. Heals tissue and organs. Promotes cellular regeneration.\n\n396 Hz — Liberating Guilt and Fear. Releases deeply held emotional patterns. Grounds and stabilizes.\n\n417 Hz — Undoing Situations and Facilitating Change. Clears traumatic experiences. Breaks negative patterns.\n\n528 Hz — The Love Frequency. DNA repair. Heart activation. The most researched frequency — shown to reduce stress hormones by 100%.\n\n639 Hz — Connecting and Relationships. Harmonizes interpersonal connections. Opens heart communication.\n\n741 Hz — Awakening Intuition. Detoxifies cells. Cleans electromagnetic radiation. Enhances self-expression.\n\n852 Hz — Returning to Spiritual Order. Opens third eye. Strengthens intuition. Dissolves illusion.\n\n963 Hz — Divine Consciousness. Activates pineal gland. Connects to source. Known as the 'God Frequency.'\n\nPractice: Listen to each frequency for 10 minutes. Notice which ones resonate most with you. Use those as your primary healing tones."},
         {"id": "l3", "title": "Binaural Beats & Brainwaves", "description": "Using stereo frequencies to entrain your brain into desired states.", "duration": "25 min", "order": 3, "video_url": "https://www.youtube.com/embed/z5W6nCU6ckA",
          "content": "Binaural beats work by playing slightly different frequencies in each ear. Your brain perceives the difference as a third tone and synchronizes to it.\n\nExample: 200 Hz in left ear + 210 Hz in right ear = 10 Hz binaural beat (Alpha state).\n\nPrescriptions:\n- Focus & Study: 14-20 Hz (Beta) — Use while working or reading\n- Creative Flow: 8-12 Hz (Alpha) — Use while brainstorming or creating art\n- Deep Meditation: 4-7 Hz (Theta) — Use during meditation sessions\n- Healing Sleep: 0.5-3 Hz (Delta) — Use while falling asleep\n- Mystical States: 40+ Hz (Gamma) — Advanced practice for peak experiences\n\nIMPORTANT: Binaural beats REQUIRE headphones to work. The two different frequencies must reach each ear separately.\n\nIsochronic Tones: Unlike binaural beats, these use a single pulsing tone and DON'T require headphones. They're equally effective for brainwave entrainment.\n\nPractice: Choose your desired state. Find or generate the appropriate binaural beat. Listen with headphones for 15-30 minutes. Journal your experience afterward."},
         {"id": "l4", "title": "Planetary Frequencies", "description": "The music of the spheres — planetary tones for cosmic alignment.", "duration": "25 min", "order": 4, "video_url": "https://www.youtube.com/embed/qn5KYYxYMqU",
          "content": "Each planet in our solar system has a resonant frequency based on its orbital period, calculated by Hans Cousto's formula. These frequencies connect us to cosmic rhythms:\n\nEarth (OM): 136.10 Hz — The year tone. Grounding, centering, being present. This is the frequency of the 'cosmic OM.'\n\nSun: 126.22 Hz — Vitality, self-confidence, personal power.\n\nMoon: 210.42 Hz — Intuition, emotional healing, feminine energy.\n\nMars: 144.72 Hz — Strength, courage, physical vitality.\n\nVenus: 221.23 Hz — Love, beauty, harmony, artistic expression.\n\nJupiter: 183.58 Hz — Expansion, abundance, wisdom, spiritual growth.\n\nSaturn: 147.85 Hz — Discipline, structure, karmic lessons, patience.\n\nPractice — Planetary Meditation:\nChoose a planet whose energy you want to work with. Play its frequency (use a tuning fork or tone generator). As you listen, visualize the planet's color and energy surrounding you. Hold for 10-15 minutes. This is especially powerful when the planet is prominent in the current astrological transit."},
     ]},
    {"id": "cls-consciousness-explorer", "title": "Consciousness Explorer", "description": "A transformative journey combining all practices — mudras, yantras, tantra, frequencies, and divination — into a unified path of awakening.", "category": "advanced", "instructor": "Cosmic Collective Masters", "duration": "8 weeks", "level": "Advanced", "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop", "color": "#2DD4BF",
     "lessons": [
         {"id": "l1", "title": "The Map of Consciousness", "description": "Understanding levels of consciousness and your current state.", "duration": "25 min", "order": 1, "video_url": "https://www.youtube.com/embed/rz3Pcx4J3y0",
          "content": "Consciousness is not binary (on/off) — it exists on a spectrum from deep unconsciousness to full cosmic awareness.\n\nDavid Hawkins' Scale of Consciousness (simplified):\n- 20-75: Shame, Guilt, Apathy — Contracted, survival states\n- 100-175: Fear, Anger, Pride — Ego-driven states\n- 200: COURAGE — The critical turning point. Below 200, energy contracts. Above 200, energy expands.\n- 250-350: Willingness, Acceptance — Growth states\n- 400: Reason — Intellectual mastery (science, logic)\n- 500: LOVE — Heart opens. You begin to see unity in all things.\n- 540: Joy — Unconditional compassion and service\n- 600: Peace — Transcendent awareness. Rare.\n- 700-1000: Enlightenment — Identification with the Infinite.\n\nSelf-Assessment Exercise:\nSit quietly. Read each level description slowly. Notice where you feel the most resonance — where you spend most of your time. There is no judgment. Awareness of where you are is the first step to moving forward.\n\nEvery practice in this app — from breathing to mudras to frequencies — is designed to help you move up this scale consistently."},
         {"id": "l2", "title": "Energy Mastery", "description": "Combining mudras, breathwork, and visualization for energy control.", "duration": "35 min", "order": 2, "video_url": "https://www.youtube.com/embed/jH9qjwuuG6c",
          "content": "This lesson combines three practices into one powerful energy session:\n\nThe Trinity Practice (30 minutes):\n\nPhase 1 — Breath (10 min):\n- 3 minutes Nadi Shodhana (balance)\n- 3 minutes Kapalabhati (activate)\n- 4 minutes circular breathing (charge)\n\nPhase 2 — Mudra + Visualization (10 min):\n- Prana Mudra with visualization of golden light entering through the crown\n- See the light filling each chakra from crown to root\n- Switch to Gyan Mudra and hold awareness at the third eye\n\nPhase 3 — Sound + Stillness (10 min):\n- 5 minutes: Chant OM, feeling it vibrate through your entire body\n- 5 minutes: Complete silence. Don't meditate ON anything. Just BE.\n\nThis combined practice generates 10x more energy than any single technique alone. The breath charges the body, the mudra directs the energy, and the sound integrates everything.\n\nPractice this sequence 3 times this week. Journal what you experience each time."},
         {"id": "l3", "title": "Sacred Sound & Form", "description": "Integrating mantra with yantra for amplified meditation.", "duration": "30 min", "order": 3, "video_url": "https://www.youtube.com/embed/D17GYCn-i7E",
          "content": "When mantra (sound) and yantra (form) are combined, they create a complete circuit of spiritual energy — like plugging a lamp into both a power source and a light socket.\n\nMantra-Yantra Pairings:\n- OM + Sri Yantra: Universal consciousness. The supreme combination.\n- OM GAM GANAPATAYE NAMAHA + Ganesh Yantra: Obstacle removal\n- OM SHREEM MAHALAKSHMIYEI NAMAHA + Lakshmi Yantra: Abundance\n- OM AIM SARASWATYEI NAMAHA + Saraswati Yantra: Wisdom & creativity\n\nCombined Practice:\n1. Place your chosen yantra at eye level\n2. Light a candle nearby for soft illumination\n3. Begin chanting the corresponding mantra\n4. As you chant, gaze softly at the yantra's center (bindu)\n5. Feel the sound vibrating in your body while the visual pattern absorbs your mind\n6. After 10-15 minutes, close your eyes. Continue chanting. See the yantra glowing on your inner screen.\n7. After another 5 minutes, stop chanting. Hold both the inner sound and inner vision in silence.\n\nThis is the doorway to samadhi — the state where subject (you), object (yantra), and action (meditation) merge into one."},
         {"id": "l4", "title": "The Oracle Within", "description": "Using divination tools as mirrors for self-knowledge.", "duration": "25 min", "order": 4, "video_url": "https://www.youtube.com/embed/kkGeOWYOFoA",
          "content": "Divination tools — Tarot, I Ching, astrology — are NOT fortune-telling devices. They are mirrors that reflect your unconscious mind back to you.\n\nHow Divination Really Works:\nCarl Jung called it 'synchronicity' — meaningful coincidence. When you ask a question and draw a card or cast hexagrams, the result is not random. Your unconscious mind, which is connected to a deeper field of intelligence, guides the outcome.\n\nUsing the Oracle Mindfully:\n1. Frame your question carefully. Avoid yes/no. Ask: 'What do I need to understand about...?'\n2. Center yourself with 3 deep breaths before consulting\n3. Receive the answer without judgment. Your first reaction is usually your ego; your second reaction is your wisdom.\n4. Journal the reading and your interpretation. Return to it in a week — you'll see new layers.\n\nThe I Ching Approach:\nThe I Ching is unique among oracles because it doesn't predict — it advises. Each hexagram describes a universal situation and the wisest response. It teaches that change is the only constant and that wisdom lies in flowing with change rather than resisting it.\n\nPractice: Use the Oracle feature in this app. Ask a genuine question about your spiritual path. Sit with the answer for 24 hours before acting on it."},
         {"id": "l5", "title": "Frequency Attunement", "description": "Advanced frequency work for altered states of consciousness.", "duration": "30 min", "order": 5, "video_url": "https://www.youtube.com/embed/goyZbut_KFY",
          "content": "Advanced Frequency Protocol:\n\nThe Consciousness Elevator (45-minute session):\n\n1. Delta Foundation (5 min): Listen to 2 Hz binaural beats while lying down. Let your body enter deep relaxation. This is the healing base.\n\n2. Theta Exploration (10 min): Shift to 6 Hz. This is the lucid dreaming frequency. Observe whatever images, memories, or insights arise without attachment.\n\n3. Alpha Integration (10 min): Rise to 10 Hz. Sit up slowly. This is the meditation sweet spot. Combine with 528 Hz solfeggio for heart activation.\n\n4. Gamma Peak (5 min): Jump to 40 Hz. This is the 'aha moment' frequency. High-level insights and peak experiences occur here.\n\n5. Return to Earth (5 min): Come back down through Alpha (10 Hz) to natural awareness. Ground yourself by feeling your body, the floor, the room.\n\nCombining Frequencies with Other Practices:\n- Mudra meditation + 528 Hz = Heart healing amplified\n- Yantra gazing + 852 Hz = Third eye activation\n- Mantra chanting + 136 Hz (Earth/OM) = Deep cosmic grounding\n- Kundalini practice + ascending frequencies = Energetic rocket fuel\n\nThe key is experimentation. Your body is unique. Find the combinations that resonate with YOU."},
         {"id": "l6", "title": "The Unified Practice", "description": "Creating your personal synthesis of all practices.", "duration": "40 min", "order": 6, "video_url": "https://www.youtube.com/embed/jH9qjwuuG6c",
          "content": "You have now learned mudras, yantras, tantra, mantras, frequencies, breathwork, and divination. The final step is creating YOUR unique practice — a personal synthesis that serves your specific path.\n\nDesigning Your Unified Practice:\n\n1. Core Daily Practice (non-negotiable, 20 min minimum):\n   - Choose your primary breathing technique\n   - Choose your primary mudra\n   - Choose your primary mantra or frequency\n   - Practice these three EVERY day without exception\n\n2. Weekly Deep Dives (choose 2-3 per week, 30-60 min each):\n   - Monday: Yantra meditation\n   - Wednesday: Frequency healing session\n   - Friday: Full chakra activation\n   - Sunday: Oracle consultation + journaling\n\n3. Monthly Intensive (one full day per month):\n   - Extended 2-3 hour practice combining ALL techniques\n   - Review your journal entries from the month\n   - Adjust your practice based on what's working\n\nRemember: The point of all these tools is not to accumulate techniques — it is to WAKE UP. The practice that makes you more present, more loving, more alive — that is YOUR practice.\n\nCongratulations on completing the Consciousness Explorer course. Your journey continues with every breath."},
     ]},
]

@api_router.get("/classes")
async def get_classes():
    return [{ **c, "lesson_count": len(c["lessons"]) } for c in CLASSES_DATA]

@api_router.get("/classes/{class_id}")
async def get_class_detail(class_id: str):
    cls = next((c for c in CLASSES_DATA if c["id"] == class_id), None)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls

@api_router.post("/classes/enroll")
async def enroll_class(data: ClassEnroll, user=Depends(get_current_user)):
    existing = await db.enrollments.find_one({"user_id": user["id"], "class_id": data.class_id})
    if existing:
        existing.pop("_id", None)
        return existing
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "class_id": data.class_id,
        "completed_lessons": [],
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "certified": False,
    }
    await db.enrollments.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.post("/classes/complete-lesson")
async def complete_lesson(data: LessonComplete, user=Depends(get_current_user)):
    enrollment = await db.enrollments.find_one({"user_id": user["id"], "class_id": data.class_id})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this class")
    completed = enrollment.get("completed_lessons", [])
    if data.lesson_id not in completed:
        completed.append(data.lesson_id)
    cls = next((c for c in CLASSES_DATA if c["id"] == data.class_id), None)
    total_lessons = len(cls["lessons"]) if cls else 0
    certified = len(completed) >= total_lessons and total_lessons > 0
    update_data = {"completed_lessons": completed, "certified": certified}
    if certified and not enrollment.get("completed_at"):
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        cert_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "class_id": data.class_id,
            "class_title": cls["title"] if cls else "",
            "instructor": cls["instructor"] if cls else "",
            "issued_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.certifications.insert_one(cert_doc)
        cert_doc.pop("_id", None)
    await db.enrollments.update_one({"_id": enrollment["_id"]}, {"$set": update_data})
    enrollment.pop("_id", None)
    enrollment["completed_lessons"] = completed
    enrollment["certified"] = certified
    return enrollment

@api_router.get("/classes/my/enrollments")
async def get_my_enrollments(user=Depends(get_current_user)):
    enrollments = await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return enrollments

@api_router.get("/certifications/my")
async def get_my_certifications(user=Depends(get_current_user)):
    certs = await db.certifications.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return certs

# --- User Creations (Custom Affirmations, Meditations, etc.) ---
@api_router.post("/creations")
async def create_custom(data: CustomCreation, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", ""),
        "type": data.type,
        "title": data.title,
        "content": data.content,
        "tags": data.tags or [],
        "shared": False,
        "likes": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.creations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/creations/my")
async def get_my_creations(user=Depends(get_current_user)):
    items = await db.creations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api_router.get("/creations/my/{creation_type}")
async def get_my_creations_by_type(creation_type: str, user=Depends(get_current_user)):
    items = await db.creations.find({"user_id": user["id"], "type": creation_type}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api_router.delete("/creations/{creation_id}")
async def delete_creation(creation_id: str, user=Depends(get_current_user)):
    result = await db.creations.delete_one({"id": creation_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Creation not found")
    return {"status": "deleted"}

@api_router.put("/creations/{creation_id}/share")
async def toggle_share(creation_id: str, user=Depends(get_current_user)):
    doc = await db.creations.find_one({"id": creation_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Creation not found")
    new_shared = not doc.get("shared", False)
    await db.creations.update_one({"id": creation_id}, {"$set": {"shared": new_shared}})
    return {"shared": new_shared}

@api_router.get("/creations/shared")
async def get_shared_creations(creation_type: Optional[str] = None):
    query = {"shared": True}
    if creation_type:
        query["type"] = creation_type
    items = await db.creations.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.put("/creations/{creation_id}/like")
async def like_creation(creation_id: str):
    result = await db.creations.update_one({"id": creation_id, "shared": True}, {"$inc": {"likes": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Creation not found")
    return {"status": "liked"}

@api_router.post("/creations/ai-generate")
async def ai_generate_creation(req: AICreateRequest, user=Depends(get_current_user)):
    type_prompts = {
        "affirmation": f"Create a powerful, personal affirmation for someone whose intention is: '{req.intention}'. Write 3-5 affirmations that are positive, present-tense, emotionally resonant, and deeply personal. Each on a new line.",
        "meditation": f"Create a guided meditation script for the intention: '{req.intention}'. Include an opening (settling in), body scan, visualization, the core meditation aligned with the intention, and a gentle closing. Write it as a narration script, about 300 words.",
        "breathwork": f"Design a custom breathwork sequence for the intention: '{req.intention}'. Include the breath pattern (inhale/hold/exhale counts), duration, visualization to pair with the breath, and the energetic effect. Be specific and practical.",
        "mantra": f"Create a personal mantra or set of mantras for the intention: '{req.intention}'. Include the mantra text, its meaning, how to chant it (aloud, whispered, silent), recommended repetitions, and which mudra to pair with it.",
        "ritual": f"Design a personal daily ritual for the intention: '{req.intention}'. Include morning and evening components, specific practices (mudras, mantras, breathing), timing, and how to track progress. Make it practical and sustainable.",
    }
    prompt = type_prompts.get(req.type, f"Create a personal spiritual practice for: '{req.intention}'")
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"create-{str(uuid.uuid4())}",
            system_message="You are a wise, compassionate spiritual guide. Create deeply personal, meaningful practices. Be specific and practical. Write with warmth.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
        return {"type": req.type, "content": response, "intention": req.intention}
    except Exception as e:
        logger.error(f"AI create error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate content")

@api_router.post("/meditation/generate-guided")
async def generate_guided_meditation(req: GuidedMeditationRequest, user=Depends(get_current_user)):
    """Generate personalized guided meditation steps using AI."""
    focus_labels = {
        "stress": "stress relief and deep relaxation",
        "sleep": "falling into deep restful sleep",
        "focus": "sharpening mental clarity and concentration",
        "healing": "physical and emotional healing",
        "gratitude": "cultivating gratitude and joy",
        "confidence": "building inner strength and self-confidence",
        "letting-go": "releasing attachments and finding freedom",
        "general": "inner peace and spiritual growth",
    }
    focus_desc = focus_labels.get(req.focus, req.focus)
    num_steps = max(6, min(18, req.duration))
    step_dur = (req.duration * 60) // num_steps

    prompt = f"""Create a deeply personal guided meditation for someone whose intention is: "{req.intention}"
Focus area: {focus_desc}
Total duration: {req.duration} minutes
Number of steps: {num_steps}

Return ONLY a JSON array of meditation steps. Each step must have:
- "text": the narration text for this step (2-4 sentences, written as if speaking directly to the meditator in second person, warm and compassionate)
- "duration": duration in seconds (aim for {step_dur} seconds per step)

The meditation should flow naturally: opening/settling -> core practice aligned to their intention -> deepening -> integration -> gentle closing.
Make it deeply personal to the intention "{req.intention}". Use vivid imagery, specific body sensations, and emotional resonance.
Return ONLY valid JSON array, no markdown, no explanation."""

    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"guided-meditation-{str(uuid.uuid4())}",
            system_message="You are a master meditation teacher. Generate deeply personal, transformative guided meditation scripts. Always respond with valid JSON only.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        raw = await asyncio.wait_for(chat.send_message(msg), timeout=45)

        # Parse JSON from response
        import json as json_mod
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        steps_raw = json_mod.loads(cleaned)
        steps = []
        cumulative_time = 0
        for s in steps_raw:
            steps.append({
                "time": cumulative_time,
                "text": s.get("text", ""),
                "duration": s.get("duration", step_dur),
            })
            cumulative_time += s.get("duration", step_dur)

        return {"steps": steps, "intention": req.intention, "focus": req.focus, "duration": req.duration}
    except json_mod.JSONDecodeError:
        # Fallback: split raw text into steps
        paragraphs = [p.strip() for p in raw.split("\n\n") if p.strip()]
        if len(paragraphs) < 3:
            paragraphs = [p.strip() for p in raw.split("\n") if p.strip()]
        steps = []
        cumulative_time = 0
        for p in paragraphs[:num_steps]:
            steps.append({"time": cumulative_time, "text": p, "duration": step_dur})
            cumulative_time += step_dur
        return {"steps": steps, "intention": req.intention, "focus": req.focus, "duration": req.duration}
    except Exception as e:
        logger.error(f"Guided meditation generate error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate meditation. Please try again.")

@api_router.post("/meditation/save-custom")
async def save_custom_meditation(data: dict, user=Depends(get_current_user)):
    """Save a user-built custom guided meditation."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Meditation"),
        "intention": data.get("intention", ""),
        "focus": data.get("focus", "general"),
        "duration": data.get("duration", 10),
        "sound": data.get("sound", "silence"),
        "color": data.get("color", "#D8B4FE"),
        "steps": data.get("steps", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_meditations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/meditation/my-custom")
async def get_custom_meditations(user=Depends(get_current_user)):
    """Get user's saved custom meditations."""
    items = await db.custom_meditations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.delete("/meditation/custom/{meditation_id}")
async def delete_custom_meditation(meditation_id: str, user=Depends(get_current_user)):
    result = await db.custom_meditations.delete_one({"id": meditation_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Breathing Patterns ---

@api_router.post("/breathing/save-custom")
async def save_custom_breathing(data: dict, user=Depends(get_current_user)):
    """Save a user-defined custom breathing pattern."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Pattern"),
        "inhale": max(1, min(20, data.get("inhale", 4))),
        "hold1": max(0, min(20, data.get("hold1", 4))),
        "exhale": max(1, min(20, data.get("exhale", 4))),
        "hold2": max(0, min(20, data.get("hold2", 0))),
        "color": data.get("color", "#2DD4BF"),
        "description": data.get("description", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_breathing.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/breathing/my-custom")
async def get_custom_breathing(user=Depends(get_current_user)):
    items = await db.custom_breathing.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.delete("/breathing/custom/{pattern_id}")
async def delete_custom_breathing(pattern_id: str, user=Depends(get_current_user)):
    result = await db.custom_breathing.delete_one({"id": pattern_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Affirmation Sets ---

@api_router.post("/affirmations/generate-set")
async def generate_affirmation_set(data: dict, user=Depends(get_current_user)):
    """AI-generate a personalized set of affirmations based on user's goal."""
    goal = data.get("goal", "").strip()
    if not goal:
        raise HTTPException(status_code=400, detail="Please provide a goal or intention")
    count = max(3, min(10, data.get("count", 7)))

    prompt = f"""Create {count} deeply personal, powerful affirmations for someone whose intention is: "{goal}"

Rules:
- Each affirmation must start with "I am", "I have", "I attract", "I choose", "I embrace", "I release", or similar empowering first-person language
- Make them specific to the intention, not generic
- They should feel warm, compassionate, and deeply resonant
- Each affirmation should be 1-2 sentences max
- Make each one unique in its approach — some emotional, some grounding, some aspirational

Return ONLY a JSON array of strings. No markdown, no explanation."""

    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"affirmation-set-{str(uuid.uuid4())}",
            system_message="You are a compassionate life coach and spiritual guide. Generate deeply personal affirmations. Always respond with valid JSON only.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        raw = await asyncio.wait_for(chat.send_message(msg), timeout=30)

        import json as json_mod
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        affirmations = json_mod.loads(cleaned)
        if not isinstance(affirmations, list):
            raise ValueError("Expected a list")
        return {"affirmations": affirmations[:count], "goal": goal}
    except Exception as e:
        logger.error(f"Affirmation set generate error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate affirmations. Please try again.")

@api_router.post("/affirmations/save-set")
async def save_affirmation_set(data: dict, user=Depends(get_current_user)):
    """Save a user's custom affirmation set."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Affirmations"),
        "goal": data.get("goal", ""),
        "affirmations": data.get("affirmations", []),
        "color": data.get("color", "#FCD34D"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_affirmations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/affirmations/my-sets")
async def get_affirmation_sets(user=Depends(get_current_user)):
    items = await db.custom_affirmations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.delete("/affirmations/set/{set_id}")
async def delete_affirmation_set(set_id: str, user=Depends(get_current_user)):
    result = await db.custom_affirmations.delete_one({"id": set_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Soundscape Mixes ---

@api_router.post("/soundscapes/save-mix")
async def save_soundscape_mix(data: dict, user=Depends(get_current_user)):
    """Save a user's soundscape mix configuration."""
    volumes = data.get("volumes", {})
    active = {k: v for k, v in volumes.items() if v and v > 0}
    if not active:
        raise HTTPException(status_code=400, detail="No sounds active in this mix")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Mix"),
        "volumes": active,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_soundscapes.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/soundscapes/my-mixes")
async def get_soundscape_mixes(user=Depends(get_current_user)):
    items = await db.custom_soundscapes.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.delete("/soundscapes/mix/{mix_id}")
async def delete_soundscape_mix(mix_id: str, user=Depends(get_current_user)):
    result = await db.custom_soundscapes.delete_one({"id": mix_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Beginner's Journey ---

@api_router.get("/journey/progress")
async def get_journey_progress(user=Depends(get_current_user)):
    """Get user's journey progress."""
    doc = await db.journey_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    if not doc:
        doc = {
            "user_id": user["id"],
            "completed_lessons": [],
            "current_stage": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.journey_progress.insert_one(doc)
        doc.pop("_id", None)
    return doc

@api_router.post("/journey/complete-lesson")
async def complete_journey_lesson(data: dict, user=Depends(get_current_user)):
    """Mark a lesson as completed."""
    lesson_id = data.get("lesson_id", "")
    if not lesson_id:
        raise HTTPException(status_code=400, detail="lesson_id required")
    doc = await db.journey_progress.find_one({"user_id": user["id"]})
    if not doc:
        doc = {
            "user_id": user["id"],
            "completed_lessons": [],
            "current_stage": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.journey_progress.insert_one(doc)
    completed = doc.get("completed_lessons", [])
    if lesson_id not in completed:
        completed.append(lesson_id)
    # Determine current stage based on completed lessons
    stage_counts = [4, 4, 4, 4, 4]  # lessons per stage
    unlocked_stage = 0
    for i, count in enumerate(stage_counts):
        stage_lessons = [item for item in completed if item.startswith(f"s{i}-")]
        if len(stage_lessons) >= count:
            unlocked_stage = i + 1
    await db.journey_progress.update_one(
        {"user_id": user["id"]},
        {"$set": {"completed_lessons": completed, "current_stage": unlocked_stage}},
        upsert=True
    )
    return {"completed_lessons": completed, "current_stage": unlocked_stage, "lesson_id": lesson_id}

# --- Custom Mantra Practices ---

@api_router.get("/mantras/library")
async def get_mantra_library():
    """Return the built-in mantra library."""
    return MANTRA_LIBRARY

@api_router.post("/mantras/save-custom")
async def save_custom_mantra(data: dict, user=Depends(get_current_user)):
    """Save a user-created custom mantra practice."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Mantra"),
        "mantra_text": data.get("mantra_text", ""),
        "meaning": data.get("meaning", ""),
        "repetitions": max(1, min(1008, data.get("repetitions", 108))),
        "sound": data.get("sound", "silence"),
        "color": data.get("color", "#FCD34D"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_mantras.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/mantras/my-custom")
async def get_custom_mantras(user=Depends(get_current_user)):
    items = await db.custom_mantras.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.delete("/mantras/custom/{mantra_id}")
async def delete_custom_mantra(mantra_id: str, user=Depends(get_current_user)):
    result = await db.custom_mantras.delete_one({"id": mantra_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

MANTRA_LIBRARY = [
    {
        "id": "om", "name": "Om (Aum)", "sanskrit": "ॐ",
        "text": "Om", "pronunciation": "Ahhh — Ohhh — Mmmm",
        "category": "meditation",
        "color": "#D8B4FE",
        "meaning": "The primordial sound of the universe. Represents creation, preservation, and dissolution. The vibration from which all existence emerged.",
        "benefits": ["Calms the mind", "Balances nervous system", "Connects to universal consciousness", "Reduces stress and anxiety"],
        "chakra": "Crown (Sahasrara)",
        "tradition": "Vedic / Hindu / Buddhist",
        "practice_tips": "Sit comfortably, take a deep breath, and let the sound flow naturally. Feel the vibration in your chest, throat, and crown.",
        "recommended_reps": 108,
    },
    {
        "id": "om-mani", "name": "Om Mani Padme Hum", "sanskrit": "ॐ मणि पद्मे हूँ",
        "text": "Om Mani Padme Hum", "pronunciation": "Om Mah-nee Pahd-may Hoom",
        "category": "compassion",
        "color": "#2DD4BF",
        "meaning": "The jewel in the lotus. The mantra of Avalokiteshvara, the bodhisattva of compassion. Each syllable purifies one of six realms of existence.",
        "benefits": ["Cultivates compassion", "Purifies karma", "Opens the heart", "Reduces attachment and hatred"],
        "chakra": "Heart (Anahata)",
        "tradition": "Tibetan Buddhist",
        "practice_tips": "Visualize a bright white light emanating from your heart with each repetition. Send compassion to all beings.",
        "recommended_reps": 108,
    },
    {
        "id": "om-namah", "name": "Om Namah Shivaya", "sanskrit": "ॐ नमः शिवाय",
        "text": "Om Namah Shivaya", "pronunciation": "Om Nah-mah Shee-vah-yah",
        "category": "devotion",
        "color": "#3B82F6",
        "meaning": "I bow to Shiva, the supreme consciousness within. The five syllables represent earth, water, fire, air, and ether.",
        "benefits": ["Destroys negative patterns", "Awakens inner divinity", "Brings inner peace", "Supports transformation"],
        "chakra": "Third Eye (Ajna)",
        "tradition": "Shaivite Hindu",
        "practice_tips": "Feel each syllable resonating with a different element within your body. Surrender to the transformative energy.",
        "recommended_reps": 108,
    },
    {
        "id": "so-hum", "name": "So Hum", "sanskrit": "सो ऽहम्",
        "text": "So Hum", "pronunciation": "Soh Hum",
        "category": "meditation",
        "color": "#86EFAC",
        "meaning": "I am That. Identifies the individual self with the universal. 'So' on the inhale (that), 'Hum' on the exhale (I am).",
        "benefits": ["Deepens meditation", "Synchronizes with breath", "Dissolves ego", "Promotes self-realization"],
        "chakra": "Crown (Sahasrara)",
        "tradition": "Vedantic",
        "practice_tips": "Silently think 'So' as you inhale and 'Hum' as you exhale. Let the mantra and breath become one.",
        "recommended_reps": 0,
    },
    {
        "id": "sat-nam", "name": "Sat Nam", "sanskrit": "सत नाम",
        "text": "Sat Nam", "pronunciation": "Saht Nahm",
        "category": "meditation",
        "color": "#FCD34D",
        "meaning": "Truth is my identity. The seed mantra of Kundalini Yoga. 'Sat' means truth, 'Nam' means name or identity.",
        "benefits": ["Awakens kundalini", "Balances chakras", "Reveals authentic self", "Grounds spiritual energy"],
        "chakra": "All chakras",
        "tradition": "Sikh / Kundalini Yoga",
        "practice_tips": "Extend 'Saaat' for 7 times the length of 'Nam'. Feel the vibration travel from the navel to the crown.",
        "recommended_reps": 108,
    },
    {
        "id": "shanti", "name": "Om Shanti Shanti Shanti", "sanskrit": "ॐ शान्तिः शान्तिः शान्तिः",
        "text": "Om Shanti Shanti Shanti", "pronunciation": "Om Shahn-tee Shahn-tee Shahn-tee",
        "category": "peace",
        "color": "#93C5FD",
        "meaning": "Om, Peace, Peace, Peace. Three repetitions invoke peace in body, speech, and mind — or peace from divine, environmental, and internal disturbances.",
        "benefits": ["Deep peace and serenity", "Calms agitation", "Creates protective aura", "Harmonizes environment"],
        "chakra": "Throat (Vishuddha)",
        "tradition": "Vedic / Hindu",
        "practice_tips": "Let each 'Shanti' dissolve a different layer of tension — physical, emotional, spiritual.",
        "recommended_reps": 27,
    },
    {
        "id": "gayatri", "name": "Gayatri Mantra", "sanskrit": "ॐ भूर्भुवः स्वः",
        "text": "Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat",
        "pronunciation": "Om Bhoor Bhoo-vah Swah-ha, Taht Sah-vee-toor Vah-rehn-yahm, Bhar-go Deh-vahs-yah Dhee-mah-hee, Dhee-yo Yo Nah Prah-cho-dah-yaht",
        "category": "illumination",
        "color": "#FB923C",
        "meaning": "We meditate upon the divine light of the radiant source. May it illuminate our intellect. The most sacred Vedic hymn, a prayer to the sun deity Savitri.",
        "benefits": ["Illuminates the mind", "Enhances wisdom", "Purifies consciousness", "Protects the chanter"],
        "chakra": "Third Eye (Ajna)",
        "tradition": "Rig Veda",
        "practice_tips": "Best chanted at sunrise, noon, and sunset. Feel the golden light of the sun filling your entire being with each recitation.",
        "recommended_reps": 108,
    },
    {
        "id": "ra-ma-da-sa", "name": "Ra Ma Da Sa", "sanskrit": "",
        "text": "Ra Ma Da Sa, Sa Say So Hung",
        "pronunciation": "Rah Mah Dah Sah, Sah Say So Hung",
        "category": "healing",
        "color": "#22C55E",
        "meaning": "Sun, Moon, Earth, Infinity — Infinity, experience of totality, I am Thou. A powerful healing mantra that calls upon cosmic forces.",
        "benefits": ["Powerful healing energy", "Boosts immune system", "Sends healing to others", "Connects to cosmic forces"],
        "chakra": "Heart (Anahata)",
        "tradition": "Kundalini Yoga",
        "practice_tips": "Hold your palms up at 60 degrees. Visualize green healing light flowing through your hands as you chant.",
        "recommended_reps": 11,
    },
    {
        "id": "lokah", "name": "Lokah Samastah", "sanskrit": "लोकाः समस्ताः सुखिनो भवन्तु",
        "text": "Lokah Samastah Sukhino Bhavantu",
        "pronunciation": "Lo-kah Sah-mah-stah Soo-khee-no Bhah-vahn-too",
        "category": "compassion",
        "color": "#E879F9",
        "meaning": "May all beings everywhere be happy and free, and may my thoughts, words, and actions contribute to that happiness and freedom.",
        "benefits": ["Expands compassion", "Creates positive karma", "Connects to all beings", "Promotes universal love"],
        "chakra": "Heart (Anahata)",
        "tradition": "Vedic / Yoga",
        "practice_tips": "As you chant, expand your awareness outward — from yourself to loved ones, to your community, to the entire world.",
        "recommended_reps": 27,
    },
    {
        "id": "ham-sa", "name": "Ham Sa", "sanskrit": "हंस",
        "text": "Ham Sa", "pronunciation": "Hahm Sah",
        "category": "meditation",
        "color": "#94A3B8",
        "meaning": "The swan. The natural mantra of the breath — 'Ham' on the exhale, 'Sa' on the inhale. Represents the individual soul (Jiva) recognizing the universal soul (Atman).",
        "benefits": ["Natural breath awareness", "Effortless meditation", "Self-inquiry", "Dissolves duality"],
        "chakra": "Crown (Sahasrara)",
        "tradition": "Advaita Vedanta",
        "practice_tips": "Simply observe your natural breath. Notice 'Ham' sound on exhale, 'Sa' sound on inhale. No effort needed.",
        "recommended_reps": 0,
    },
]

# --- AI Knowledge Engine ---
KNOWLEDGE_PROMPTS = {
    "mudra": "You are an expert in yogic mudra science. Give a thorough guide about '{topic}' covering: origins, precise hand position, benefits (physical/mental/spiritual), chakra and element associations, duration and timing, contraindications, combinations with pranayama and mantras, and any scientific research. Be warm and authoritative.",
    "yantra": "You are a scholar of sacred geometry. Give a thorough guide about '{topic}' covering: origins, geometric symbolism, deity association, complete mantra with pronunciation, meditation technique, consecration, placement, benefits, and advanced practices. Write with reverence.",
    "tantra": "You are a tantric meditation teacher. Give a thorough guide about '{topic}' covering: lineage, energetic mechanisms, detailed step-by-step instructions, common mistakes, signs of progress, safety precautions, chakra connections, preparatory practices, integration, and advanced variations.",
    "frequency": "You are a sound healing specialist. Give a thorough guide about '{topic}' covering: history, scientific research, chakra/organ resonance, listening protocol, brainwave effects, frequency combinations, cultural uses, cellular effects, and practice recommendations.",
    "exercise": "You are a Qigong and Tai Chi master. Give a thorough guide about '{topic}' covering: origins, detailed movement instructions with breathing, alignment corrections, meridians activated, health benefits, modifications, advanced variations, and internal energy dynamics.",
    "nourishment": "You are an Ayurvedic nutrition expert. Give a thorough guide about '{topic}' covering: nutritional profile, Ayurvedic properties, TCM properties, spiritual/energetic effects, preparation methods, timing, contraindications, recipes, cultural significance, and research.",
    "general": "You are a wise spiritual teacher. Give a thorough guide about '{topic}'. {context} Cover it from historical, practical, scientific, and spiritual perspectives with actionable guidance.",
}

@api_router.post("/knowledge/deep-dive")
async def knowledge_deep_dive(req: KnowledgeRequest):
    if not req.topic or len(req.topic.strip()) < 2:
        raise HTTPException(status_code=400, detail="Topic too short")

    # Check MongoDB cache first
    cached = await db.knowledge_cache.find_one(
        {"topic": req.topic, "category": req.category}, {"_id": 0}
    )
    if cached:
        return cached

    category = req.category if req.category in KNOWLEDGE_PROMPTS else "general"
    prompt_template = KNOWLEDGE_PROMPTS[category]
    prompt = prompt_template.replace("{topic}", req.topic)
    if req.context:
        prompt = prompt.replace("{context}", f"Additional context: {req.context}")
    else:
        prompt = prompt.replace("{context}", "")

    # Retry up to 2 times on transient failures, with strict timeout
    last_error = None
    for attempt in range(2):
        try:
            chat = LlmChat(
                api_key=os.getenv("EMERGENT_LLM_KEY"),
                session_id=f"knowledge-{str(uuid.uuid4())}",
                system_message="You are a deeply knowledgeable spiritual teacher and wellness expert. Provide thorough, well-structured guides with markdown formatting.",
            )
            chat.with_model("openai", "gpt-5.2")
            msg = UserMessage(text=prompt)
            response = await asyncio.wait_for(chat.send_message(msg), timeout=45)

            result = {
                "topic": req.topic,
                "category": req.category,
                "content": response,
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

            await db.knowledge_cache.insert_one({**result})
            return result

        except asyncio.TimeoutError:
            last_error = Exception("AI request timed out after 45s")
            logger.warning(f"Knowledge AI attempt {attempt+1} timed out")
        except Exception as e:
            last_error = e
            logger.warning(f"Knowledge AI attempt {attempt+1} failed: {e}")
        
        if attempt == 0:
            await asyncio.sleep(1)

    logger.error(f"Knowledge AI error after retries: {last_error}")
    raise HTTPException(status_code=500, detail="Could not generate knowledge content")

@api_router.get("/knowledge/suggestions/{category}")
async def knowledge_suggestions(category: str):
    suggestions = {
        "mudra": ["Gyan Mudra advanced techniques", "Mudras for anxiety and depression", "Mudras during pregnancy", "Combining mudras with pranayama", "Healing mudras for specific diseases", "Mudras for chakra activation", "The science behind mudras", "Mudras in Buddhist tradition", "Mudras for better sleep", "Hasta mudras vs Kaya mudras"],
        "yantra": ["How to draw Sri Yantra by hand", "Yantra consecration ritual", "Yantra placement in home", "The mathematics of sacred geometry", "Difference between yantra and mandala", "Yantras for specific planets", "Creating personal yantras", "Yantra meditation for beginners", "The 10 Mahavidya Yantras", "Yantra and Vastu Shastra"],
        "tantra": ["Kundalini awakening safety guide", "Chakra blockages and how to clear them", "Tantric breathwork for beginners", "The Nadi system explained", "Bandhas and their effects", "Tantric meditation vs Buddhist meditation", "Working with Shakti energy", "The role of the Guru in Tantra", "Tantra and modern psychology", "Advanced pranayama techniques"],
        "frequency": ["432Hz vs 440Hz tuning", "Binaural beats for deep sleep", "Schumann resonance and Earth connection", "Sound healing with crystal bowls", "Cymatics and visible sound", "Planetary frequencies explained", "Theta waves for creativity", "Sound therapy for pain relief", "Ancient use of sound healing", "Creating a frequency healing practice"],
        "exercise": ["Standing meditation (Zhan Zhuang)", "Eight Pieces of Brocade Qigong", "Tai Chi 24 Form complete guide", "Five Animal Frolics", "Iron Shirt Chi Kung", "Microcosmic orbit meditation", "Dao Yin stretching exercises", "Walking meditation techniques", "Yoga vs Qigong comparison", "Building a daily energy practice"],
        "nourishment": ["Ayurvedic food combining rules", "Foods for each dosha type", "Sattvic diet for meditation", "Adaptogens and their effects", "Fasting for spiritual practice", "The energetics of spices", "Raw food vs cooked in Ayurveda", "Foods that open the third eye", "Healing teas and elixirs", "Conscious eating practice guide"],
    }
    return suggestions.get(category, suggestions.get("general", []))

# --- Text-to-Speech Narration ---
tts_cache = {}

@api_router.post("/tts/narrate")
async def generate_narration(req: NarrationRequest):
    if not req.text or len(req.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text too short")
    text = req.text[:4000]
    voice = req.voice if req.voice in ["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"] else "nova"
    cache_key = hashlib.md5(f"{text}:{req.speed}:{voice}".encode()).hexdigest()
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}
    try:
        tts = OpenAITextToSpeech(api_key=os.getenv("EMERGENT_LLM_KEY"))
        audio_b64 = await tts.generate_speech_base64(
            text=text,
            model="tts-1-hd",
            voice=voice,
            speed=req.speed or 1.0,
            response_format="mp3"
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate narration")

# --- Health ---
@api_router.get("/health")
async def health_check():
    return {"status": "ok", "service": "Cosmic Collective API"}

@api_router.get("/")
async def root():
    return {"message": "Cosmic Collective API is alive"}

# --- Community ---
@api_router.post("/community/posts")
async def create_post(post: CommunityPostCreate, user=Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user_doc.get("name", "Anonymous"),
        "post_type": post.post_type,
        "content": post.content,
        "ritual_data": post.ritual_data,
        "affirmation_text": post.affirmation_text,
        "milestone_type": post.milestone_type,
        "milestone_value": post.milestone_value,
        "likes": [],
        "like_count": 0,
        "comment_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.community_posts.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/community/feed")
async def get_feed(page: int = 0, limit: int = 20):
    skip = page * limit
    posts = await db.community_posts.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).to_list(limit)
    total = await db.community_posts.count_documents({})
    return {"posts": posts, "total": total, "page": page, "has_more": skip + limit < total}

@api_router.post("/community/posts/{post_id}/like")
async def toggle_like(post_id: str, user=Depends(get_current_user)):
    post = await db.community_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    if user["id"] in likes:
        likes.remove(user["id"])
        action = "unliked"
    else:
        likes.append(user["id"])
        action = "liked"
    
    await db.community_posts.update_one(
        {"id": post_id},
        {"$set": {"likes": likes, "like_count": len(likes)}}
    )
    return {"action": action, "like_count": len(likes)}

@api_router.post("/community/posts/{post_id}/comment")
async def add_comment(post_id: str, comment: CommentCreate, user=Depends(get_current_user)):
    post = await db.community_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    doc = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "user_id": user["id"],
        "user_name": user_doc.get("name", "Anonymous"),
        "text": comment.text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.community_comments.insert_one(doc)
    doc.pop("_id", None)
    
    await db.community_posts.update_one(
        {"id": post_id},
        {"$inc": {"comment_count": 1}}
    )
    return doc

@api_router.get("/community/posts/{post_id}/comments")
async def get_comments(post_id: str):
    comments = await db.community_comments.find(
        {"post_id": post_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return comments

@api_router.delete("/community/posts/{post_id}")
async def delete_post(post_id: str, user=Depends(get_current_user)):
    result = await db.community_posts.delete_one({"id": post_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or not yours")
    await db.community_comments.delete_many({"post_id": post_id})
    return {"deleted": True}

@api_router.post("/community/follow/{target_id}")
async def toggle_follow(target_id: str, user=Depends(get_current_user)):
    if target_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    existing = await db.follows.find_one(
        {"follower_id": user["id"], "following_id": target_id}, {"_id": 0}
    )
    if existing:
        await db.follows.delete_one({"follower_id": user["id"], "following_id": target_id})
        return {"action": "unfollowed"}
    else:
        await db.follows.insert_one({
            "id": str(uuid.uuid4()),
            "follower_id": user["id"],
            "following_id": target_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"action": "followed"}

@api_router.get("/community/profile/{user_id}")
async def get_public_profile(user_id: str):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "email": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Run all counts concurrently
    post_count, mood_count, journal_count, ritual_sessions, follower_count, following_count, recent_posts = await asyncio.gather(
        db.community_posts.count_documents({"user_id": user_id}),
        db.moods.count_documents({"user_id": user_id}),
        db.journal.count_documents({"user_id": user_id}),
        db.ritual_completions.count_documents({"user_id": user_id}),
        db.follows.count_documents({"following_id": user_id}),
        db.follows.count_documents({"follower_id": user_id}),
        db.community_posts.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(5),
    )
    
    return {
        "id": user_doc["id"],
        "name": user_doc.get("name", "Anonymous"),
        "created_at": user_doc.get("created_at"),
        "post_count": post_count,
        "mood_count": mood_count,
        "journal_count": journal_count,
        "ritual_sessions": ritual_sessions,
        "follower_count": follower_count,
        "following_count": following_count,
        "recent_posts": recent_posts
    }

@api_router.get("/community/me/following")
async def get_my_following(user=Depends(get_current_user)):
    following = await db.follows.find(
        {"follower_id": user["id"]}, {"_id": 0}
    ).to_list(500)
    return [f["following_id"] for f in following]

@api_router.get("/community/users/active")
async def get_active_users():
    """Get recently active community members for discovery."""
    users_with_posts = await db.community_posts.aggregate([
        {"$group": {"_id": "$user_id", "name": {"$first": "$user_name"}, "post_count": {"$sum": 1}, "last_post": {"$max": "$created_at"}}},
        {"$sort": {"last_post": -1}},
        {"$limit": 20}
    ]).to_list(20)
    
    # Batch follower counts in a single query instead of N+1
    user_ids = [u["_id"] for u in users_with_posts]
    follower_counts = {doc["_id"]: doc["count"] for doc in await db.follows.aggregate([
        {"$match": {"following_id": {"$in": user_ids}}},
        {"$group": {"_id": "$following_id", "count": {"$sum": 1}}}
    ]).to_list(None)} if user_ids else {}
    
    return [
        {
            "id": u["_id"],
            "name": u["name"],
            "post_count": u["post_count"],
            "follower_count": follower_counts.get(u["_id"], 0),
            "last_active": u["last_post"]
        }
        for u in users_with_posts
    ]

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

# ===== ZEN GARDEN =====
PLANT_STAGES = {
    "lotus": ["Seed", "Sprout", "Bud", "Bloom", "Full Bloom"],
    "bamboo": ["Seed", "Shoot", "Young", "Tall", "Flourishing"],
    "bonsai": ["Seed", "Seedling", "Sapling", "Shaped", "Ancient"],
    "fern": ["Spore", "Fiddlehead", "Unfurling", "Lush", "Majestic"],
    "sage": ["Seed", "Sprout", "Growing", "Mature", "Sacred"],
}
PLANT_WATERS_PER_STAGE = {"lotus": 5, "bamboo": 4, "bonsai": 7, "fern": 3, "sage": 5}

@api_router.get("/zen-garden/plants")
async def get_plants(user=Depends(get_current_user)):
    plants = await db.zen_plants.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return plants

@api_router.post("/zen-garden/plants")
async def create_plant(data: PlantCreate, user=Depends(get_current_user)):
    if data.plant_type not in PLANT_STAGES:
        raise HTTPException(status_code=400, detail="Invalid plant type")
    count = await db.zen_plants.count_documents({"user_id": user["id"]})
    if count >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 plants")
    plant = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "plant_type": data.plant_type,
        "stage": PLANT_STAGES[data.plant_type][0],
        "water_count": 0,
        "waters_this_stage": 0,
        "watered_today": False,
        "last_watered": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.zen_plants.insert_one(plant)
    plant.pop("_id", None)
    return plant

@api_router.post("/zen-garden/plants/{plant_id}/water")
async def water_plant(plant_id: str, user=Depends(get_current_user)):
    plant = await db.zen_plants.find_one({"id": plant_id, "user_id": user["id"]})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    today = datetime.now(timezone.utc).date().isoformat()
    if plant.get("last_watered") == today:
        raise HTTPException(status_code=400, detail="Already watered today")
    stages = PLANT_STAGES.get(plant["plant_type"], ["Seed"])
    waters_needed = PLANT_WATERS_PER_STAGE.get(plant["plant_type"], 5)
    new_waters = plant.get("waters_this_stage", 0) + 1
    grew = False
    new_stage = plant["stage"]
    if new_waters >= waters_needed:
        current_idx = stages.index(plant["stage"]) if plant["stage"] in stages else 0
        if current_idx < len(stages) - 1:
            new_stage = stages[current_idx + 1]
            grew = True
            new_waters = 0
    await db.zen_plants.update_one({"id": plant_id}, {"$set": {
        "water_count": plant.get("water_count", 0) + 1,
        "waters_this_stage": new_waters,
        "watered_today": True,
        "last_watered": today,
        "stage": new_stage,
    }})
    return {"grew": grew, "stage": new_stage, "water_count": plant.get("water_count", 0) + 1}

# Reset watered_today at midnight (called lazily on plant fetch)
@api_router.on_event("startup")
async def reset_plant_watering():
    """Reset watered_today for plants not watered today."""
    today = datetime.now(timezone.utc).date().isoformat()
    await db.zen_plants.update_many(
        {"last_watered": {"$ne": today}},
        {"$set": {"watered_today": False}}
    )

# ========== RECOMMENDATION ENGINE ==========

TOOL_CATALOG = [
    {"id": "breathing", "name": "Breathing Exercises", "path": "/breathing", "category": "body", "icon": "wind",
     "color": "#2DD4BF", "desc": "Calm your nervous system with guided breathwork patterns."},
    {"id": "meditation", "name": "Meditation", "path": "/meditation", "category": "mind", "icon": "timer",
     "color": "#D8B4FE", "desc": "Still the mind through guided or silent meditation."},
    {"id": "affirmations", "name": "Affirmations", "path": "/affirmations", "category": "mind", "icon": "sun",
     "color": "#FCD34D", "desc": "Reprogram your mindset with positive affirmations."},
    {"id": "journal", "name": "Journaling", "path": "/journal", "category": "mind", "icon": "book-open",
     "color": "#86EFAC", "desc": "Reflect and process your thoughts through writing."},
    {"id": "mood", "name": "Mood Tracking", "path": "/mood", "category": "awareness", "icon": "heart",
     "color": "#FDA4AF", "desc": "Track your emotional patterns for deeper self-awareness."},
    {"id": "soundscapes", "name": "Soundscapes", "path": "/soundscapes", "category": "senses", "icon": "headphones",
     "color": "#3B82F6", "desc": "Immerse in layered ambient soundscapes for focus or relaxation."},
    {"id": "frequencies", "name": "Frequencies", "path": "/frequencies", "category": "senses", "icon": "radio",
     "color": "#8B5CF6", "desc": "Explore healing solfeggio and binaural frequencies."},
    {"id": "zen-garden", "name": "Zen Garden", "path": "/zen-garden", "category": "decompression", "icon": "sprout",
     "color": "#22C55E", "desc": "Nurture plants, draw in sand, or release lanterns."},
    {"id": "light-therapy", "name": "Light Therapy", "path": "/light-therapy", "category": "senses", "icon": "lightbulb",
     "color": "#A855F7", "desc": "Heal with chromotherapy colors aligned to your chakras."},
    {"id": "mudras", "name": "Mudras", "path": "/mudras", "category": "body", "icon": "hand",
     "color": "#FDA4AF", "desc": "Practice sacred hand gestures for energy flow."},
    {"id": "mantras", "name": "Mantras", "path": "/mantras", "category": "spirit", "icon": "music",
     "color": "#FB923C", "desc": "Chant sacred mantras for deep vibrational healing."},
    {"id": "hooponopono", "name": "Ho'oponopono", "path": "/hooponopono", "category": "spirit", "icon": "heart-handshake",
     "color": "#E879F9", "desc": "Practice the Hawaiian art of forgiveness and reconciliation."},
    {"id": "exercises", "name": "Exercises", "path": "/exercises", "category": "body", "icon": "zap",
     "color": "#FB923C", "desc": "Move your body with Qigong and Tai Chi."},
    {"id": "rituals", "name": "Daily Rituals", "path": "/rituals", "category": "practice", "icon": "sunrise",
     "color": "#FCD34D", "desc": "Build consistent daily wellness routines."},
    {"id": "journey", "name": "Beginner's Journey", "path": "/journey", "category": "learning", "icon": "map",
     "color": "#2DD4BF", "desc": "Follow the guided pathway through all wellness tools."},
    {"id": "learning", "name": "Advanced Learning", "path": "/learn", "category": "learning", "icon": "graduation-cap",
     "color": "#E879F9", "desc": "Deepen your practice with progressive advanced modules."},
]

MOOD_TOOL_MAP = {
    "stressed": ["breathing", "zen-garden", "soundscapes", "meditation"],
    "anxious": ["breathing", "meditation", "hooponopono", "frequencies"],
    "sad": ["affirmations", "light-therapy", "mantras", "journal"],
    "angry": ["breathing", "hooponopono", "zen-garden", "exercises"],
    "happy": ["meditation", "mantras", "journal", "rituals"],
    "peaceful": ["meditation", "frequencies", "mudras", "mantras"],
    "tired": ["exercises", "frequencies", "light-therapy", "breathing"],
    "grateful": ["journal", "mantras", "meditation", "affirmations"],
    "confused": ["journal", "meditation", "mudras", "affirmations"],
    "neutral": ["mood", "breathing", "soundscapes", "journey"],
}

TIME_OF_DAY_TOOLS = {
    "morning": ["breathing", "affirmations", "rituals", "exercises", "meditation"],
    "afternoon": ["frequencies", "light-therapy", "mudras", "soundscapes", "journal"],
    "evening": ["zen-garden", "meditation", "hooponopono", "mantras", "journal"],
    "night": ["soundscapes", "frequencies", "meditation", "zen-garden", "light-therapy"],
}

@api_router.get("/recommendations")
async def get_recommendations(user=Depends(get_current_user)):
    uid = user["id"]
    now = datetime.now(timezone.utc)
    hour = now.hour

    # Gather user activity data concurrently
    mood_count, journal_count, recent_moods, journey_doc, challenge_parts, ritual_count, plants_count = await asyncio.gather(
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.moods.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(5),
        db.journey_progress.find_one({"user_id": uid}, {"_id": 0}),
        db.challenge_participants.count_documents({"user_id": uid}),
        db.ritual_completions.count_documents({"user_id": uid}),
        db.zen_plants.count_documents({"user_id": uid}),
    )

    recommendations = []
    used_ids = set()

    # Determine time period
    if 5 <= hour < 12:
        time_period = "morning"
    elif 12 <= hour < 17:
        time_period = "afternoon"
    elif 17 <= hour < 21:
        time_period = "evening"
    else:
        time_period = "night"

    # 1. Mood-based recommendations
    if recent_moods:
        latest_mood = recent_moods[0].get("mood", "neutral").lower()
        suggested_tools = MOOD_TOOL_MAP.get(latest_mood, MOOD_TOOL_MAP["neutral"])
        for tool_id in suggested_tools[:2]:
            if tool_id not in used_ids:
                tool = next((t for t in TOOL_CATALOG if t["id"] == tool_id), None)
                if tool:
                    recommendations.append({
                        **tool,
                        "reason": f"Based on your recent {latest_mood} mood",
                        "priority": "high",
                        "source": "mood_analysis",
                    })
                    used_ids.add(tool_id)
    else:
        # No mood data — suggest tracking
        tool = next((t for t in TOOL_CATALOG if t["id"] == "mood"), None)
        if tool:
            recommendations.append({
                **tool,
                "reason": "Start tracking your moods for personalized insights",
                "priority": "high",
                "source": "onboarding",
            })
            used_ids.add("mood")

    # 2. Journey-based recommendation
    journey_lessons = journey_doc.get("completed_lessons", []) if journey_doc else []
    if len(journey_lessons) == 0:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "journey"), None)
        if tool and "journey" not in used_ids:
            recommendations.append({
                **tool,
                "reason": "Begin your guided wellness pathway",
                "priority": "high",
                "source": "journey",
            })
            used_ids.add("journey")
    elif len(journey_lessons) < 20:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "journey"), None)
        if tool and "journey" not in used_ids:
            recommendations.append({
                **tool,
                "reason": f"Continue your journey — {len(journey_lessons)}/20 lessons done",
                "priority": "medium",
                "source": "journey",
            })
            used_ids.add("journey")
    else:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "learning"), None)
        if tool and "learning" not in used_ids:
            recommendations.append({
                **tool,
                "reason": "Journey complete! Take your practice deeper",
                "priority": "medium",
                "source": "journey_complete",
            })
            used_ids.add("learning")

    # 3. Time-of-day recommendations
    time_tools = TIME_OF_DAY_TOOLS.get(time_period, [])
    for tool_id in time_tools:
        if tool_id not in used_ids and len(recommendations) < 5:
            tool = next((t for t in TOOL_CATALOG if t["id"] == tool_id), None)
            if tool:
                time_labels = {"morning": "Perfect for morning practice", "afternoon": "Great for an afternoon reset",
                               "evening": "Wind down this evening", "night": "Ideal for late-night calm"}
                recommendations.append({
                    **tool,
                    "reason": time_labels.get(time_period, "Recommended for now"),
                    "priority": "medium",
                    "source": "time_of_day",
                })
                used_ids.add(tool_id)

    # 4. Engagement nudges
    if journal_count == 0 and "journal" not in used_ids and len(recommendations) < 6:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "journal"), None)
        if tool:
            recommendations.append({**tool, "reason": "Start journaling to deepen your self-awareness", "priority": "medium", "source": "engagement"})
            used_ids.add("journal")

    if plants_count == 0 and "zen-garden" not in used_ids and len(recommendations) < 6:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "zen-garden"), None)
        if tool:
            recommendations.append({**tool, "reason": "Plant your first seed in the Zen Garden", "priority": "low", "source": "engagement"})
            used_ids.add("zen-garden")

    if ritual_count == 0 and "rituals" not in used_ids and len(recommendations) < 6:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "rituals"), None)
        if tool:
            recommendations.append({**tool, "reason": "Build a consistent daily routine", "priority": "low", "source": "engagement"})
            used_ids.add("rituals")

    # Cap at 6 recommendations
    recommendations = recommendations[:6]

    return {
        "recommendations": recommendations,
        "time_period": time_period,
        "mood_count": mood_count,
        "journal_count": journal_count,
        "journey_progress": len(journey_lessons),
        "engagement_score": min(100, mood_count * 5 + journal_count * 5 + len(journey_lessons) * 3 + challenge_parts * 10 + ritual_count * 4 + plants_count * 3),
    }


# ========== ADVANCED PROGRESSIVE LEARNING MODULES ==========

LEARNING_MODULES = [
    {
        "id": "foundations",
        "title": "Foundations of Stillness",
        "subtitle": "Master the building blocks of conscious practice",
        "level": 1,
        "color": "#2DD4BF",
        "icon": "layers",
        "duration": "2 weeks",
        "prerequisite": None,
        "description": "Establish a rock-solid foundation in breathwork, meditation, and body awareness. This module transforms basic techniques into deeply embodied skills.",
        "lessons": [
            {"id": "f-1", "title": "The Architecture of Breath", "type": "theory",
             "content": "Breath is the bridge between conscious and unconscious. In this lesson, we explore the anatomy of a complete breath cycle — diaphragmatic expansion, intercostal engagement, and the neurological cascade each exhale triggers.\n\nThe vagus nerve, your body's master relaxation switch, responds directly to breath depth and rhythm. A 6-breath-per-minute pattern activates peak heart rate variability, the measurable signature of resilience.\n\nKey Practice: Sit comfortably. Place one hand on your belly, one on your chest. Breathe so ONLY the belly hand moves for 3 minutes. This is diaphragmatic isolation — the foundation of all advanced breathwork.\n\nDeeper Understanding: Notice the micro-pause between inhale and exhale. This gap — called 'kumbhaka' in yogic tradition — is where the nervous system recalibrates. As you advance, you'll learn to extend and use this pause deliberately.",
             "duration": 12, "tool_link": "/breathing"},
            {"id": "f-2", "title": "Anchor Points in Meditation", "type": "practice",
             "content": "Every meditator needs an anchor — a point of return when the mind wanders. Most beginners use the breath, but advanced practitioners develop multiple anchors they can switch between.\n\nThe Five Classical Anchors:\n1. Breath Sensation (nostrils, belly, or chest)\n2. Body Contact Points (sitting bones, hands on knees)\n3. Sound Field (ambient sounds without labeling)\n4. Visual Focus (candle flame, mandala, or closed-eye light patterns)\n5. Mantra Repetition (silent or whispered)\n\nThis lesson's practice: Set a 10-minute timer. Every 2 minutes, consciously switch your anchor point through all five. Notice how each anchor creates a subtly different quality of attention.\n\nAdvanced Tip: The goal is not to eliminate thoughts — it's to reduce the TIME between noticing you've drifted and returning to the anchor. This 'return speed' is the actual muscle you're training.",
             "duration": 15, "tool_link": "/meditation"},
            {"id": "f-3", "title": "Somatic Intelligence", "type": "theory",
             "content": "Your body stores information your conscious mind has forgotten. Somatic intelligence is the practice of listening to these body-held signals — tension patterns, temperature changes, subtle impulses.\n\nThe Body Scan Protocol:\nStart at the crown of your head. Move attention slowly downward like a warm light beam. At each region, ask: 'What is the quality of sensation here?' Don't try to change anything — just observe.\n\nKey Areas to Investigate:\n- Jaw & temples (stress accumulation)\n- Throat (suppressed expression)\n- Shoulders & upper back (responsibility burden)\n- Solar plexus (anxiety, power dynamics)\n- Lower belly (security, creativity)\n- Hips & lower back (emotional storage)\n\nWhen you find an area of tension, breathe INTO that area. Imagine your breath as warm light dissolving the holding pattern. 3-5 breaths per area is sufficient.\n\nThis becomes the foundation for advanced energy work in later modules.",
             "duration": 15, "tool_link": "/meditation"},
            {"id": "f-4", "title": "Building Your Daily Container", "type": "practice",
             "content": "A 'container' is the consistent time and space you create for practice. Without a container, motivation ebbs and flows. With one, practice becomes as automatic as brushing your teeth.\n\nDesigning Your Container:\n\n1. TIME: Choose the same time daily. Morning is ideal (willpower is highest, fewer interruptions). Even 10 minutes is enough to start.\n\n2. SPACE: Designate a spot. It doesn't need to be a whole room — a corner with a cushion works. Your brain will associate this spot with practice, making entry easier each time.\n\n3. SIGNAL: Create a ritual entry point. Light a candle. Ring a bell. Take 3 deep breaths. This signal tells your nervous system: 'We're shifting modes now.'\n\n4. SEQUENCE: Start with breathwork (3 min) → body scan (3 min) → meditation (4+ min). This sequence warms up the body, then the mind.\n\n5. CLOSURE: End with 3 breaths and a moment of gratitude. This creates a clean boundary between practice and daily life.\n\nYour task: Design your container this week. Write it down. Follow it for 7 consecutive days, then adjust what doesn't work.",
             "duration": 10, "tool_link": "/rituals"},
        ],
    },
    {
        "id": "energy-mastery",
        "title": "Energy Mastery",
        "subtitle": "Harness subtle energy for healing and transformation",
        "level": 2,
        "color": "#8B5CF6",
        "icon": "zap",
        "duration": "3 weeks",
        "prerequisite": "foundations",
        "description": "Move beyond physical techniques into the realm of subtle energy. Learn to sense, direct, and amplify your life force through mudras, frequencies, and chakra activation.",
        "lessons": [
            {"id": "e-1", "title": "The Subtle Body Map", "type": "theory",
             "content": "Across cultures — from Indian chakras to Chinese meridians to Tibetan channels — there is remarkable agreement about the existence of an energy body that interpenetrates the physical body.\n\nThe Seven Primary Energy Centers:\n1. Root (Muladhara) — Base of spine — Security, survival, grounding\n2. Sacral (Svadhisthana) — Below navel — Creativity, pleasure, emotions\n3. Solar Plexus (Manipura) — Upper abdomen — Willpower, confidence, identity\n4. Heart (Anahata) — Center of chest — Love, compassion, connection\n5. Throat (Vishuddha) — Throat — Expression, truth, communication\n6. Third Eye (Ajna) — Between eyebrows — Intuition, insight, vision\n7. Crown (Sahasrara) — Top of head — Spiritual connection, unity\n\nEnergy doesn't just sit in these centers — it FLOWS between them through channels called nadis (yoga) or meridians (TCM). When flow is blocked, we experience physical or emotional symptoms.\n\nPractice: Place your palms 6 inches apart. Slowly move them together and apart. Feel for the subtle magnetic sensation between your hands. This is prana — life force you can learn to direct.",
             "duration": 15, "tool_link": "/mudras"},
            {"id": "e-2", "title": "Mudras as Energy Circuits", "type": "practice",
             "content": "Mudras are not mere hand positions — they are precise electrical circuits that redirect the flow of prana through your subtle body. Each finger represents an element:\n\n- Thumb: Fire (Agni) — willpower, transformation\n- Index: Air (Vayu) — movement, intellect\n- Middle: Space (Akasha) — expansion, connection\n- Ring: Earth (Prithvi) — stability, strength\n- Pinky: Water (Jala) — adaptability, purification\n\nThe Gyan Mudra Protocol (Advanced):\n1. Touch thumb tip to index finger tip\n2. Extend other three fingers comfortably\n3. Rest hands on knees, palms up (receptive) or down (grounding)\n4. Close your eyes and breathe naturally\n5. After 2 minutes, shift attention to the point of contact between thumb and index finger\n6. Notice the subtle warmth or tingling — this is the circuit activating\n7. Now imagine breathing THROUGH this contact point — inhale draws energy in, exhale distributes it\n\nHold for 11 minutes minimum for full effect. The ancient texts say 48 minutes for complete transformation.\n\nCombine with the 396 Hz frequency for grounding, or 528 Hz for heart opening.",
             "duration": 20, "tool_link": "/mudras"},
            {"id": "e-3", "title": "Frequency Resonance & the Body", "type": "theory",
             "content": "Everything vibrates. Every cell, organ, and bone in your body has a resonant frequency. When exposed to specific external frequencies, your body can 'entrain' — synchronize its vibration to match.\n\nThe Solfeggio Frequencies and Their Effects:\n- 174 Hz: Pain reduction, foundation of conscious evolution\n- 285 Hz: Tissue repair, cellular memory healing\n- 396 Hz: Liberating guilt and fear (Root chakra)\n- 417 Hz: Undoing situations, facilitating change (Sacral)\n- 528 Hz: Transformation, DNA repair, 'Love frequency' (Solar Plexus)\n- 639 Hz: Connecting relationships (Heart)\n- 741 Hz: Awakening intuition (Throat)\n- 852 Hz: Returning to spiritual order (Third Eye)\n- 963 Hz: Divine consciousness (Crown)\n\nBinaural beats work differently — they create a 'phantom frequency' when two slightly different tones play in each ear. The brain generates the difference frequency:\n- Delta (0.5-4 Hz): Deep sleep, healing\n- Theta (4-8 Hz): Deep meditation, creativity\n- Alpha (8-13 Hz): Relaxation, flow state\n- Beta (13-30 Hz): Focus, alertness\n- Gamma (30-100 Hz): Peak awareness, insight\n\nPractice: Listen to 528 Hz for 15 minutes while practicing Gyan Mudra. Notice the amplification effect when combining modalities.",
             "duration": 20, "tool_link": "/frequencies"},
            {"id": "e-4", "title": "Chakra Activation Sequence", "type": "practice",
             "content": "This is the crown jewel practice of energy work — a systematic activation of all seven chakras in sequence. This should only be practiced after establishing a foundation in breathwork and meditation.\n\nThe Full Sequence (30 minutes):\n\n1. GROUNDING (3 min): Sit comfortably. Visualize roots extending from your base into the earth. Breathe deeply. Feel gravity.\n\n2. ROOT ACTIVATION (3 min): Focus on the base of your spine. Chant 'LAM' silently or aloud. Visualize a red sphere of light pulsing with each breath.\n\n3. SACRAL (3 min): Shift attention 2 inches below your navel. Chant 'VAM'. Orange sphere. Feel creative energy stirring.\n\n4. SOLAR PLEXUS (3 min): Upper abdomen. 'RAM'. Yellow sphere. Feel your personal power and confidence expanding.\n\n5. HEART (4 min — extra time here): Center of chest. 'YAM'. Green/pink sphere. This is the bridge between lower (physical) and upper (spiritual) chakras. Feel love radiating outward.\n\n6. THROAT (3 min): Throat center. 'HAM'. Blue sphere. Feel your authentic voice clearing.\n\n7. THIRD EYE (3 min): Between eyebrows. 'OM'. Indigo sphere. Feel your inner vision sharpening.\n\n8. CROWN (3 min): Top of head. Silence. Violet/white light. Feel connection to something vast.\n\n9. INTEGRATION (5 min): Visualize a column of white light connecting all seven centers. Breathe and let the energy flow freely.\n\nAftercare: Drink water. Move slowly. Journal any insights immediately.",
             "duration": 35, "tool_link": "/frequencies"},
        ],
    },
    {
        "id": "sound-light-healing",
        "title": "Sound & Light Alchemy",
        "subtitle": "Transform consciousness through sensory immersion",
        "level": 3,
        "color": "#3B82F6",
        "icon": "waves",
        "duration": "3 weeks",
        "prerequisite": "energy-mastery",
        "description": "Discover how sound frequencies, color vibrations, and environmental design can alter your state of consciousness. Combine multiple sensory inputs for amplified healing.",
        "lessons": [
            {"id": "sl-1", "title": "The Science of Sound Healing", "type": "theory",
             "content": "Sound healing is one of humanity's oldest therapeutic modalities. From Aboriginal didgeridoo healing (40,000+ years) to Tibetan singing bowls to modern binaural beats, every culture discovered that specific sounds alter consciousness.\n\nMechanisms of Sound Healing:\n\n1. ENTRAINMENT: Your brainwaves synchronize with external rhythmic stimuli. A steady 10 Hz tone will gradually shift your brain toward alpha state.\n\n2. RESONANCE: Every organ has a natural frequency. When a matching frequency is applied externally, the organ vibrates more efficiently — like pushing a swing at its natural rhythm.\n\n3. VAGAL STIMULATION: Low-frequency sounds (especially chanting, humming, and singing bowls) directly stimulate the vagus nerve, activating the parasympathetic nervous system.\n\n4. CYMATICS: Sound literally shapes matter. Dr. Hans Jenny's cymatics experiments show how different frequencies create distinct geometric patterns in sand, water, and other media. Your body is 60% water — imagine what frequencies are doing to your cellular structure.\n\nPractice Protocol:\n- Start with 5 min of humming (feel the vibration in your chest)\n- Transition to 10 min of 528 Hz listening\n- End with 5 min of silence\n- Journal what you notice",
             "duration": 20, "tool_link": "/soundscapes"},
            {"id": "sl-2", "title": "Chromotherapy: Healing with Color", "type": "practice",
             "content": "Color is visible light — electromagnetic radiation at specific frequencies. Just as sound frequencies affect the body, so do light frequencies.\n\nThe Chromotherapy Spectrum:\n\n- RED (625-740nm): Stimulates circulation, raises blood pressure, activates Root chakra. Use for lethargy, cold, low motivation.\n- ORANGE (590-625nm): Boosts creativity, aids digestion, warms the sacral center. Use for creative blocks, emotional stagnation.\n- YELLOW (565-590nm): Stimulates nervous system, enhances mental clarity, strengthens Solar Plexus. Use for brain fog, low confidence.\n- GREEN (500-565nm): Balances, harmonizes, heals the heart. The most neutral healing color. Use for emotional turbulence, general healing.\n- BLUE (450-500nm): Calms, reduces inflammation, cools the throat center. Use for anxiety, insomnia, overheating.\n- INDIGO (420-450nm): Deepens intuition, supports Third Eye. Use for disconnection from inner wisdom, headaches.\n- VIOLET (380-420nm): Highest visible frequency. Connects to Crown chakra, spiritual awareness. Use for spiritual seeking, transformation.\n\nPractice: Choose the color that corresponds to what you need. Use the Light Therapy tool for a 10-minute immersive session. Combine with the matching chakra tone for amplified effect.\n\nAdvanced: Layer sound + color + mudra for triple-stacking sensory input.",
             "duration": 18, "tool_link": "/light-therapy"},
            {"id": "sl-3", "title": "Crafting Sensory Rituals", "type": "practice",
             "content": "The most powerful wellness practice isn't any single tool — it's the intentional COMBINATION of multiple sensory inputs into a unified experience.\n\nThe Synergy Principle: When you engage multiple senses simultaneously — hearing (soundscapes), seeing (light therapy), feeling (breathing), and directing energy (mudras) — the effects multiply rather than merely add.\n\nDesigning Your Sensory Ritual:\n\n1. SET YOUR INTENTION (1 min): What do you need? Calm? Energy? Clarity? Healing?\n\n2. CHOOSE YOUR STACK based on intention:\n   - CALM: Blue light + Ocean soundscape + 4-7-8 breathing + Dhyana mudra + 432 Hz\n   - ENERGY: Red light + Fire soundscape + Energizing breath + Prana mudra + 396 Hz\n   - CLARITY: Yellow light + Rain soundscape + Box breathing + Gyan mudra + 741 Hz\n   - HEALING: Green light + Forest soundscape + Deep belly breathing + Apana mudra + 528 Hz\n\n3. LAYER SEQUENTIALLY (don't start everything at once):\n   - Minute 0-2: Start breathing pattern\n   - Minute 2-4: Add soundscape\n   - Minute 4-6: Engage light therapy\n   - Minute 6-8: Form mudra\n   - Minute 8-20: Full immersion — let all inputs blend\n   - Minute 20-22: Release mudra, then light, then sound\n   - Minute 22-25: Return to natural breathing in silence\n\nThis layered entry and exit prevents jarring transitions and allows deeper integration.",
             "duration": 25, "tool_link": "/rituals"},
            {"id": "sl-4", "title": "Environmental Design for Practice", "type": "theory",
             "content": "Your practice environment profoundly affects your experience. This lesson covers how to optimize your physical space for deeper states.\n\nThe Five Elements of Sacred Space:\n\n1. LIGHT: Dim, warm lighting (candles ideal). Avoid blue-white LED. Consider colored bulbs for chromotherapy. Dawn and dusk are the most potent natural light times.\n\n2. SOUND: Remove mechanical noise where possible. Add a small water fountain for white noise masking. Have your frequency tools ready.\n\n3. SCENT: Incense, essential oils, or fresh plants. Frankincense deepens meditation. Lavender calms anxiety. Peppermint sharpens focus. Sandalwood grounds.\n\n4. TEXTURE: Your sitting surface matters. Natural materials (cotton, wool, wood) have different vibrational qualities than synthetic. A dedicated cushion or mat becomes 'charged' with practice energy over time.\n\n5. DIRECTION: Traditional practices suggest facing east (direction of sunrise/new beginnings) for morning practice. North for deep meditation. Experiment and notice what feels right.\n\nDigital Environment:\nUse the Zen Garden as your digital sacred space. Nurture your plants before practice. The act of tending your digital garden creates a mindful transition into practice mode.\n\nMinimal Setup: If you can't control your environment, use headphones (soundscapes block external noise) and close your eyes (instant environment change). The most important element is consistent INTENTION.",
             "duration": 15, "tool_link": "/zen-garden"},
        ],
    },
    {
        "id": "integration-mastery",
        "title": "Integration & Mastery",
        "subtitle": "Unify all practices into an awakened daily life",
        "level": 4,
        "color": "#FCD34D",
        "icon": "crown",
        "duration": "4 weeks",
        "prerequisite": "sound-light-healing",
        "description": "The pinnacle of practice: weaving every tool, technique, and insight into a seamless way of living. Transform from practitioner to embodied master.",
        "lessons": [
            {"id": "im-1", "title": "The Art of Non-Doing", "type": "theory",
             "content": "After learning dozens of techniques, the advanced practitioner faces a paradox: the highest practice is no practice at all — or rather, making ALL of life your practice.\n\nWu Wei — The Taoist Art of Non-Doing:\nWu wei doesn't mean passivity. It means acting in perfect alignment with the natural flow of things. Like water flowing downhill — effortless, yet incredibly powerful.\n\nSigns you've arrived at wu wei:\n- You no longer 'try' to meditate — you simply ARE meditative\n- Breath awareness happens spontaneously throughout the day\n- Your body naturally gravitates toward healing foods and movements\n- Emotional reactions are shorter — you feel, process, and release quickly\n- Decisions feel less like choices and more like recognitions\n\nThe Integration Practice:\nFor one full day, make no distinction between 'practice time' and 'regular time.' Maintain the same quality of attention while washing dishes as you do in meditation. Notice the breath while walking. Feel your energy while in conversation.\n\nThis is the real goal of all the previous modules: not to create a perfect practice session, but to dissolve the boundary between practice and life.\n\nThe master meditator doesn't meditate — they live meditatively.",
             "duration": 20, "tool_link": "/meditation"},
            {"id": "im-2", "title": "Emotional Alchemy", "type": "practice",
             "content": "Most people suppress 'negative' emotions or express them destructively. The alchemist does neither — they TRANSFORM emotional energy.\n\nThe Transmutation Protocol:\n\n1. NOTICE: Catch the emotion as early as possible. The sooner you notice, the more energy is available for transformation.\n\n2. NAME: 'I am experiencing anger.' NOT 'I am angry.' This subtle shift creates the observer position.\n\n3. LOCATE: Where in your body is this emotion? Anger often lives in the jaw, fists, and belly. Sadness in the chest and throat. Fear in the gut.\n\n4. BREATHE INTO IT: Don't breathe to make it go away. Breathe to give it MORE space. Expansion, not suppression.\n\n5. FEEL THE CORE: Under anger is usually hurt. Under hurt is usually fear. Under fear is usually love. Keep going deeper.\n\n6. REDIRECT: Once you've reached the core energy, ask: 'How does this energy want to move?' Anger's energy can become fierce determination. Sadness can become deep compassion. Fear can become heightened awareness.\n\nPractice: When a strong emotion arises today, pause for 60 seconds. Run through steps 1-6. Use the Ho'oponopono phrases if needed: 'I'm sorry. Please forgive me. Thank you. I love you.'\n\nThis single skill — emotional alchemy — may be the most valuable thing you learn in this entire program.",
             "duration": 20, "tool_link": "/hooponopono"},
            {"id": "im-3", "title": "Designing Your Unified Practice", "type": "practice",
             "content": "You now have a comprehensive toolkit. This lesson helps you design a sustainable, personalized practice that integrates everything.\n\nThe Unified Practice Framework:\n\nDAILY NON-NEGOTIABLES (15-25 min):\n- Morning: 5 min breathwork + 10 min meditation + 3 affirmations\n- Evening: 5 min body scan + journal entry + 1 min gratitude\n\nWEEKLY DEEP PRACTICES (choose 3-4, rotate):\n- Monday: Chakra activation sequence (30 min)\n- Tuesday: Extended frequency session with mudras (20 min)\n- Wednesday: Sensory ritual stack (25 min)\n- Thursday: Free day — follow intuition\n- Friday: Ho'oponopono forgiveness practice (15 min)\n- Saturday: Mantra meditation (20 min)\n- Sunday: Zen Garden + journaling reflection (20 min)\n\nMONTHLY INTENSIVE (half-day, once per month):\n- Full chakra activation + extended meditation + journaling\n- Review your mood data for patterns\n- Adjust your daily and weekly practice based on what's working\n\nSEASONAL RENEWAL (once per season):\n- Revisit the learning modules that resonated most\n- Set new intentions\n- Try tools you haven't used recently\n\nRemember: The BEST practice is the one you actually DO. A simple 10-minute routine done daily trumps an elaborate 2-hour routine done occasionally.",
             "duration": 20, "tool_link": "/rituals"},
            {"id": "im-4", "title": "The Ongoing Path", "type": "theory",
             "content": "Congratulations — you've completed the Advanced Progressive Learning Modules. But this is not an ending. In fact, the real journey is just beginning.\n\nWhat comes next:\n\n1. DEEPEN, DON'T ACCUMULATE: Resist the urge to seek new techniques. Instead, go deeper into the ones that resonate most. A lifetime of one mudra practiced deeply is worth more than surface knowledge of a hundred.\n\n2. TEACH TO LEARN: Share what you've learned. Teaching forces you to understand at a deeper level. Use the Community features to share insights.\n\n3. TRACK YOUR EVOLUTION: Use mood tracking, journaling, and the recommendation engine to watch your patterns change over months and years. The data tells a story your daily experience might miss.\n\n4. TRUST YOUR INNER TEACHER: By now, you should feel an inner compass guiding your practice. Some days you'll be drawn to silence. Other days to movement. Follow that guidance — your body-mind knows what it needs.\n\n5. RETURN TO BEGINNER'S MIND: Periodically, approach a familiar practice as if for the first time. The breath you've taken 10,000 times in meditation is ALWAYS new if you're truly present.\n\nThe paradox of mastery: The more you know, the more you realize how much there is to discover. This humility IS the practice. This wonder IS the awakening.\n\nYour practice continues with every breath. Namaste.",
             "duration": 15, "tool_link": "/meditation"},
        ],
    },
]

@api_router.get("/learning/modules")
async def get_learning_modules(user=Depends(get_current_user)):
    """Get all learning modules with user progress."""
    progress = await db.learning_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    if not progress:
        progress = {"user_id": user["id"], "completed_lessons": [], "current_module": "foundations", "started_at": datetime.now(timezone.utc).isoformat()}
        await db.learning_progress.insert_one(progress)
        progress.pop("_id", None)

    completed = progress.get("completed_lessons", [])

    modules_with_progress = []
    for mod in LEARNING_MODULES:
        lesson_ids = [l["id"] for l in mod["lessons"]]
        done = [lid for lid in lesson_ids if lid in completed]
        # Check if prerequisite is met
        unlocked = True
        if mod["prerequisite"]:
            prereq = next((m for m in LEARNING_MODULES if m["id"] == mod["prerequisite"]), None)
            if prereq:
                prereq_lessons = [l["id"] for l in prereq["lessons"]]
                unlocked = all(lid in completed for lid in prereq_lessons)
        modules_with_progress.append({
            "id": mod["id"],
            "title": mod["title"],
            "subtitle": mod["subtitle"],
            "level": mod["level"],
            "color": mod["color"],
            "icon": mod["icon"],
            "duration": mod["duration"],
            "prerequisite": mod["prerequisite"],
            "description": mod["description"],
            "lessons": mod["lessons"],
            "completed_count": len(done),
            "total_lessons": len(lesson_ids),
            "unlocked": unlocked,
            "completed": len(done) == len(lesson_ids),
        })

    return {
        "modules": modules_with_progress,
        "total_completed": len(completed),
        "total_lessons": sum(len(m["lessons"]) for m in LEARNING_MODULES),
    }


@api_router.post("/learning/complete-lesson")
async def complete_learning_lesson(data: dict, user=Depends(get_current_user)):
    """Mark a learning module lesson as completed."""
    lesson_id = data.get("lesson_id", "")
    if not lesson_id:
        raise HTTPException(status_code=400, detail="lesson_id required")

    # Validate lesson exists
    valid = any(lesson_id == l["id"] for m in LEARNING_MODULES for l in m["lessons"])
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid lesson_id")

    doc = await db.learning_progress.find_one({"user_id": user["id"]})
    if not doc:
        doc = {"user_id": user["id"], "completed_lessons": [], "current_module": "foundations", "started_at": datetime.now(timezone.utc).isoformat()}
        await db.learning_progress.insert_one(doc)

    completed = doc.get("completed_lessons", [])
    if lesson_id not in completed:
        completed.append(lesson_id)

    # Determine current module
    current_module = "foundations"
    for mod in LEARNING_MODULES:
        mod_lessons = [l["id"] for l in mod["lessons"]]
        if all(lid in completed for lid in mod_lessons):
            idx = LEARNING_MODULES.index(mod)
            if idx + 1 < len(LEARNING_MODULES):
                current_module = LEARNING_MODULES[idx + 1]["id"]
            else:
                current_module = mod["id"]

    await db.learning_progress.update_one(
        {"user_id": user["id"]},
        {"$set": {"completed_lessons": completed, "current_module": current_module}},
        upsert=True
    )

    return {"completed_lessons": completed, "current_module": current_module, "lesson_id": lesson_id}


# ========== WAITLIST ==========

class WaitlistEntry(BaseModel):
    email: str
    name: Optional[str] = None

@api_router.post("/waitlist/join")
async def join_waitlist(entry: WaitlistEntry):
    existing = await db.waitlist.find_one({"email": entry.email}, {"_id": 0})
    if existing:
        return {"status": "already_joined", "message": "You're already on the list!"}
    doc = {
        "id": str(uuid.uuid4()),
        "email": entry.email,
        "name": entry.name or "",
        "joined_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.waitlist.insert_one(doc)
    count = await db.waitlist.count_documents({})
    return {"status": "joined", "message": "Welcome to the Founding 100!", "position": count}

@api_router.get("/waitlist/count")
async def get_waitlist_count():
    count = await db.waitlist.count_documents({})
    return {"count": count}

# ========== QUICK RESET ==========

QUICK_RESET_FLOWS = {
    "happy": {
        "label": "Happy",
        "frequency": {"name": "528 Hz — Love Frequency", "hz": 528, "path": "/frequencies", "desc": "Amplify your joy with the universal frequency of love and harmony"},
        "tool": {"name": "Gratitude Meditation", "path": "/meditation", "desc": "Deepen your happiness through mindful appreciation"},
        "nourishment": {"name": "Cacao Ceremony Drink", "desc": "Raw cacao releases endorphins and amplifies bliss naturally"},
    },
    "curious": {
        "label": "Curious",
        "frequency": {"name": "852 Hz — Spiritual Order", "hz": 852, "path": "/frequencies", "desc": "Open your Third Eye and deepen intuitive insight"},
        "tool": {"name": "Oracle Divination", "path": "/oracle", "desc": "Explore tarot, I Ching, or astrology for cosmic guidance"},
        "nourishment": {"name": "Mushroom Elixir", "desc": "Lion's Mane for cognition, Reishi for grounded exploration"},
    },
    "peaceful": {
        "label": "Peaceful",
        "frequency": {"name": "963 Hz — Divine Connection", "hz": 963, "path": "/frequencies", "desc": "The highest solfeggio tone — connect with universal consciousness"},
        "tool": {"name": "Silent Meditation", "path": "/meditation", "desc": "Ride the wave of calm into deeper stillness"},
        "nourishment": {"name": "Ceremonial Matcha", "desc": "L-theanine sustains your calm with gentle alertness"},
    },
    "energized": {
        "label": "Energized",
        "frequency": {"name": "417 Hz — Change", "hz": 417, "path": "/frequencies", "desc": "Channel your energy into transformation and forward momentum"},
        "tool": {"name": "Qigong Flow", "path": "/exercises", "desc": "Move your energy with ancient body cultivation techniques"},
        "nourishment": {"name": "Prana Smoothie", "desc": "Spirulina + moringa + wheatgrass: concentrated life force"},
    },
    "grateful": {
        "label": "Grateful",
        "frequency": {"name": "639 Hz — Connection", "hz": 639, "path": "/frequencies", "desc": "Harmonize relationships and radiate your gratitude outward"},
        "tool": {"name": "Journaling", "path": "/journal", "desc": "Capture this feeling — your future self will thank you"},
        "nourishment": {"name": "Golden Milk", "desc": "A warm ritual to honor the moment with nourishing intention"},
    },
    "stressed": {
        "label": "Stressed",
        "frequency": {"name": "396 Hz — Liberation", "hz": 396, "path": "/frequencies", "desc": "Release guilt, fear, and tension from your body"},
        "tool": {"name": "4-7-8 Breathing", "path": "/breathing", "desc": "The Navy SEAL technique for instant calm"},
        "nourishment": {"name": "Golden Milk", "desc": "Anti-inflammatory turmeric latte for deep nervous system calm"},
    },
    "anxious": {
        "label": "Anxious",
        "frequency": {"name": "528 Hz — Transformation", "hz": 528, "path": "/frequencies", "desc": "The 'Love frequency' — repairs DNA and calms the mind"},
        "tool": {"name": "Box Breathing", "path": "/breathing", "desc": "4-4-4-4 cadence used by elite performers to reset"},
        "nourishment": {"name": "Ceremonial Matcha", "desc": "L-theanine promotes calm alertness without the jitters"},
    },
    "tired": {
        "label": "Low Energy",
        "frequency": {"name": "417 Hz — Change", "hz": 417, "path": "/frequencies", "desc": "Undoes stagnation and facilitates change in your energy field"},
        "tool": {"name": "Energizing Breath", "path": "/breathing", "desc": "Fast-paced Kapalabhati breathwork to ignite your fire"},
        "nourishment": {"name": "Prana Smoothie", "desc": "Spirulina + moringa + wheatgrass: concentrated life force"},
    },
    "sad": {
        "label": "Down / Sad",
        "frequency": {"name": "639 Hz — Connection", "hz": 639, "path": "/frequencies", "desc": "Harmonize relationships and re-open the heart chakra"},
        "tool": {"name": "Loving Kindness Meditation", "path": "/meditation", "desc": "Metta practice to cultivate warmth and self-compassion"},
        "nourishment": {"name": "Cacao Ceremony Drink", "desc": "Raw cacao opens the heart and releases endorphins"},
    },
    "unfocused": {
        "label": "Unfocused",
        "frequency": {"name": "741 Hz — Intuition", "hz": 741, "path": "/frequencies", "desc": "Awakens intuition and sharpens mental clarity"},
        "tool": {"name": "Breath Awareness Meditation", "path": "/meditation", "desc": "Single-point focus training for laser concentration"},
        "nourishment": {"name": "Mushroom Elixir", "desc": "Lion's Mane for cognition, Reishi for calm focus"},
    },
    "restless": {
        "label": "Restless / Can't Sleep",
        "frequency": {"name": "174 Hz — Foundation", "hz": 174, "path": "/frequencies", "desc": "The lowest solfeggio tone — sedative, pain-reducing, grounding"},
        "tool": {"name": "Body Scan Meditation", "path": "/meditation", "desc": "Progressive relaxation from head to toe for deep rest"},
        "nourishment": {"name": "Golden Milk", "desc": "Turmeric + warm milk = nature's sleep medicine"},
    },
}

@api_router.get("/quick-reset/{feeling}")
async def get_quick_reset(feeling: str):
    flow = QUICK_RESET_FLOWS.get(feeling)
    if not flow:
        raise HTTPException(status_code=404, detail="Unknown feeling. Try: stressed, anxious, tired, sad, unfocused, restless")
    return flow


# ========== DAILY STREAK ==========

@api_router.get("/streak")
async def get_streak(user=Depends(get_current_user)):
    uid = user["id"]
    doc = await db.streaks.find_one({"user_id": uid}, {"_id": 0})
    if not doc:
        return {"current_streak": 0, "longest_streak": 0, "last_active": None, "total_active_days": 0}
    return {
        "current_streak": doc.get("current_streak", 0),
        "longest_streak": doc.get("longest_streak", 0),
        "last_active": doc.get("last_active"),
        "total_active_days": doc.get("total_active_days", 0),
    }

@api_router.post("/streak/checkin")
async def streak_checkin(user=Depends(get_current_user)):
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc = await db.streaks.find_one({"user_id": uid})
    if not doc:
        doc = {"user_id": uid, "current_streak": 1, "longest_streak": 1, "last_active": today, "total_active_days": 1, "active_dates": [today]}
        await db.streaks.insert_one(doc)
        return {"current_streak": 1, "longest_streak": 1, "last_active": today, "total_active_days": 1, "checked_in": True}

    last = doc.get("last_active", "")
    if last == today:
        return {"current_streak": doc["current_streak"], "longest_streak": doc["longest_streak"], "last_active": today, "total_active_days": doc.get("total_active_days", 1), "checked_in": False, "message": "Already checked in today"}

    # Calculate streak
    from datetime import timedelta
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    if last == yesterday:
        new_streak = doc.get("current_streak", 0) + 1
    else:
        new_streak = 1

    longest = max(doc.get("longest_streak", 0), new_streak)
    total = doc.get("total_active_days", 0) + 1
    active_dates = doc.get("active_dates", [])
    if today not in active_dates:
        active_dates.append(today)
        if len(active_dates) > 60:
            active_dates = active_dates[-60:]

    await db.streaks.update_one(
        {"user_id": uid},
        {"$set": {"current_streak": new_streak, "longest_streak": longest, "last_active": today, "total_active_days": total, "active_dates": active_dates}}
    )

    # Activity for milestones
    if new_streak in (3, 7, 14, 30, 60, 100):
        await _create_activity(uid, "streak_milestone", f"reached a {new_streak}-day streak!", {"streak": new_streak})

    return {"current_streak": new_streak, "longest_streak": longest, "last_active": today, "total_active_days": total, "checked_in": True}


# ========== GAMES — SCORE TRACKING ==========

@api_router.post("/games/score")
async def save_game_score(data: dict, user=Depends(get_current_user)):
    game_id = data.get("game_id", "")
    score = data.get("score", 0)
    if not game_id:
        raise HTTPException(status_code=400, detail="game_id required")

    doc = {
        "user_id": user["id"],
        "game_id": game_id,
        "score": score,
        "played_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.game_scores.insert_one(doc)

    # Get best score
    pipeline = [
        {"$match": {"user_id": user["id"], "game_id": game_id}},
        {"$group": {"_id": None, "best": {"$max": "$score"}, "plays": {"$sum": 1}}},
    ]
    agg = await db.game_scores.aggregate(pipeline).to_list(1)
    best = agg[0]["best"] if agg else score
    plays = agg[0]["plays"] if agg else 1

    return {"game_id": game_id, "score": score, "best_score": best, "total_plays": plays}

@api_router.get("/games/scores")
async def get_game_scores(user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$group": {"_id": "$game_id", "best": {"$max": "$score"}, "plays": {"$sum": 1}, "last_played": {"$max": "$played_at"}}},
    ]
    results = await db.game_scores.aggregate(pipeline).to_list(20)
    scores = {}
    for r in results:
        scores[r["_id"]] = {"best_score": r["best"], "total_plays": r["plays"], "last_played": r["last_played"]}
    return {"scores": scores}


# ========== DAILY CHALLENGES ==========

CHALLENGE_POOL = [
    {"id": "breathe-4-7-8", "category": "breathing", "title": "4-7-8 Breath", "description": "Practice the 4-7-8 breathing technique for 5 minutes. Inhale 4s, hold 7s, exhale 8s.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "morning-meditation", "category": "meditation", "title": "Morning Stillness", "description": "Start your day with a 10-minute silent meditation. Focus only on your breath.", "duration": 10, "xp": 75, "difficulty": "intermediate"},
    {"id": "gratitude-3", "category": "journaling", "title": "Gratitude Triple", "description": "Write down 3 things you're grateful for today in your journal.", "duration": 5, "xp": 40, "difficulty": "beginner"},
    {"id": "body-scan", "category": "meditation", "title": "Full Body Scan", "description": "Do a 15-minute progressive body scan relaxation, from toes to crown.", "duration": 15, "xp": 80, "difficulty": "intermediate"},
    {"id": "cold-splash", "category": "physical", "title": "Cold Water Reset", "description": "Splash cold water on your face 3 times. Notice the sensation and your breath.", "duration": 2, "xp": 30, "difficulty": "beginner"},
    {"id": "mindful-walk", "category": "movement", "title": "Mindful Walking", "description": "Take a 20-minute walk with no phone. Notice 5 things you see, 4 you hear, 3 you feel.", "duration": 20, "xp": 90, "difficulty": "intermediate"},
    {"id": "digital-sunset", "category": "mindfulness", "title": "Digital Sunset", "description": "Put away all screens 1 hour before bed tonight. Read, stretch, or simply sit.", "duration": 60, "xp": 100, "difficulty": "advanced"},
    {"id": "heart-coherence", "category": "breathing", "title": "Heart Coherence", "description": "Breathe at 5 breaths per minute for 5 minutes while focusing on your heart area.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "kind-message", "category": "social", "title": "Cosmic Kindness", "description": "Send an encouraging message to someone on the platform. Spread the light.", "duration": 3, "xp": 60, "difficulty": "beginner"},
    {"id": "sound-bath", "category": "sounds", "title": "Sound Immersion", "description": "Listen to a healing frequency soundscape for 10 minutes with eyes closed.", "duration": 10, "xp": 70, "difficulty": "beginner"},
    {"id": "mantra-108", "category": "spiritual", "title": "Mantra 108", "description": "Chant or silently repeat a mantra 108 times. Use your breath as the anchor.", "duration": 15, "xp": 85, "difficulty": "intermediate"},
    {"id": "stretch-flow", "category": "movement", "title": "Morning Flow", "description": "Do 10 minutes of gentle stretching. Focus on spine, hips, and shoulders.", "duration": 10, "xp": 65, "difficulty": "beginner"},
    {"id": "emotion-journal", "category": "journaling", "title": "Emotion Archaeology", "description": "Write about one emotion you felt strongly today. Where did it live in your body?", "duration": 10, "xp": 55, "difficulty": "intermediate"},
    {"id": "sunset-gaze", "category": "mindfulness", "title": "Sky Gazing", "description": "Spend 5 minutes watching the sky — clouds, light, colors. Just observe.", "duration": 5, "xp": 40, "difficulty": "beginner"},
    {"id": "alternate-nostril", "category": "breathing", "title": "Nadi Shodhana", "description": "Practice alternate nostril breathing for 5 minutes to balance your energy.", "duration": 5, "xp": 55, "difficulty": "intermediate"},
    {"id": "loving-kindness", "category": "meditation", "title": "Loving Kindness", "description": "Send loving-kindness to yourself, a loved one, a stranger, and someone difficult.", "duration": 10, "xp": 75, "difficulty": "intermediate"},
    {"id": "earthing", "category": "physical", "title": "Grounding Touch", "description": "Stand barefoot on natural ground for 5 minutes. Feel the Earth beneath you.", "duration": 5, "xp": 45, "difficulty": "beginner"},
    {"id": "vision-board", "category": "mindfulness", "title": "Micro Vision", "description": "Close your eyes and vividly visualize your ideal tomorrow for 5 minutes.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "water-ritual", "category": "physical", "title": "Hydration Ritual", "description": "Drink a full glass of water slowly and mindfully. Set an intention with each sip.", "duration": 3, "xp": 25, "difficulty": "beginner"},
    {"id": "zen-garden-5", "category": "mindfulness", "title": "Zen Garden Session", "description": "Spend 5 minutes in the Zen Garden. Rake sand, feed koi, or watch lanterns.", "duration": 5, "xp": 45, "difficulty": "beginner"},
    {"id": "deep-listen", "category": "social", "title": "Deep Listening", "description": "Have a conversation where you only listen. Don't plan responses — just receive.", "duration": 10, "xp": 70, "difficulty": "intermediate"},
    {"id": "moonlight-meditation", "category": "meditation", "title": "Lunar Meditation", "description": "Meditate for 10 minutes imagining silver moonlight filling your body.", "duration": 10, "xp": 70, "difficulty": "intermediate"},
    {"id": "affirmation-mirror", "category": "spiritual", "title": "Mirror Affirmations", "description": "Look in the mirror and say 5 affirmations to yourself with conviction.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "chakra-breathe", "category": "breathing", "title": "Chakra Breathing", "description": "Breathe into each of your 7 chakras for 1 minute each, bottom to top.", "duration": 7, "xp": 60, "difficulty": "intermediate"},
    {"id": "news-fast", "category": "mindfulness", "title": "Information Fast", "description": "Avoid all news and social media for the rest of the day. Notice how you feel.", "duration": 0, "xp": 100, "difficulty": "advanced"},
    {"id": "creative-express", "category": "journaling", "title": "Creative Expression", "description": "Draw, doodle, or write a poem. No judgment. Express what's inside you.", "duration": 10, "xp": 55, "difficulty": "beginner"},
    {"id": "eye-palming", "category": "physical", "title": "Eye Palming", "description": "Rub your palms together, then gently cup them over your closed eyes for 3 minutes.", "duration": 3, "xp": 30, "difficulty": "beginner"},
    {"id": "share-wellness", "category": "social", "title": "Wellness Ambassador", "description": "Share a wellness tip or your favorite tool from the app with someone.", "duration": 5, "xp": 55, "difficulty": "beginner"},
    {"id": "box-breathing", "category": "breathing", "title": "Box Breathing", "description": "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat for 5 minutes.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "power-nap", "category": "physical", "title": "Conscious Rest", "description": "Lie down for 20 minutes. Don't sleep — just rest with awareness.", "duration": 20, "xp": 80, "difficulty": "intermediate"},
]

CATEGORY_COLORS = {
    "breathing": "#2DD4BF",
    "meditation": "#D8B4FE",
    "journaling": "#FCD34D",
    "physical": "#FB923C",
    "movement": "#22C55E",
    "mindfulness": "#3B82F6",
    "social": "#FDA4AF",
    "spiritual": "#C084FC",
    "sounds": "#06B6D4",
}

def _get_daily_challenge_index():
    """Deterministic daily rotation through the pool."""
    from datetime import date
    day_num = (date.today() - date(2025, 1, 1)).days
    return day_num % len(CHALLENGE_POOL)


@api_router.get("/daily-challenge")
async def get_daily_challenge(user=Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    idx = _get_daily_challenge_index()
    challenge = {**CHALLENGE_POOL[idx]}
    challenge["color"] = CATEGORY_COLORS.get(challenge["category"], "#D8B4FE")
    challenge["date"] = today

    completion = await db.challenge_completions.find_one(
        {"user_id": user["id"], "challenge_id": challenge["id"], "date": today},
        {"_id": 0}
    )
    challenge["completed"] = bool(completion)
    challenge["completed_at"] = completion.get("completed_at") if completion else None

    stats = await db.challenge_completions.count_documents({"user_id": user["id"]})
    streak_data = await db.streaks.find_one({"user_id": user["id"]}, {"_id": 0})

    return {
        "challenge": challenge,
        "stats": {
            "total_completed": stats,
            "current_streak": streak_data.get("current_streak", 0) if streak_data else 0,
        }
    }


@api_router.post("/daily-challenge/complete")
async def complete_daily_challenge(user=Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    idx = _get_daily_challenge_index()
    challenge = CHALLENGE_POOL[idx]

    existing = await db.challenge_completions.find_one(
        {"user_id": user["id"], "challenge_id": challenge["id"], "date": today},
        {"_id": 0}
    )
    if existing:
        return {"status": "already_completed", "message": "Challenge already completed today"}

    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "challenge_id": challenge["id"],
        "challenge_title": challenge["title"],
        "category": challenge["category"],
        "xp_earned": challenge["xp"],
        "date": today,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.challenge_completions.insert_one(doc)

    await _create_activity(
        user["id"],
        "challenge_complete",
        f"completed the daily challenge: {challenge['title']}",
        {"challenge_id": challenge["id"], "xp": challenge["xp"]}
    )

    total = await db.challenge_completions.count_documents({"user_id": user["id"]})
    return {
        "status": "completed",
        "message": f"Challenge complete! +{challenge['xp']} XP",
        "xp_earned": challenge["xp"],
        "total_completed": total,
    }


@api_router.get("/daily-challenge/history")
async def get_challenge_history(limit: int = 14, user=Depends(get_current_user)):
    completions = await db.challenge_completions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(limit)
    total_xp = sum(c.get("xp_earned", 0) for c in completions)
    total = await db.challenge_completions.count_documents({"user_id": user["id"]})
    return {"history": completions, "total_xp": total_xp, "total_completed": total}


@api_router.get("/daily-challenge/leaderboard")
async def get_challenge_leaderboard(user=Depends(get_current_user)):
    pipeline = [
        {"$group": {
            "_id": "$user_id",
            "total_xp": {"$sum": "$xp_earned"},
            "total_completed": {"$sum": 1},
        }},
        {"$sort": {"total_xp": -1}},
        {"$limit": 20},
    ]
    leaders = await db.challenge_completions.aggregate(pipeline).to_list(20)
    result = []
    for i, l in enumerate(leaders):
        user_doc = await db.users.find_one({"id": l["_id"]}, {"_id": 0, "password": 0, "email": 0})
        profile = await db.profiles.find_one({"user_id": l["_id"]}, {"_id": 0}) or {}
        result.append({
            "rank": i + 1,
            "user_id": l["_id"],
            "display_name": profile.get("display_name") or (user_doc.get("name", "") if user_doc else ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "total_xp": l["total_xp"],
            "total_completed": l["total_completed"],
            "is_me": l["_id"] == user["id"],
        })
    return {"leaderboard": result}


# ========== FRIENDS SYSTEM ==========

@api_router.get("/users/discover")
async def discover_users(page: int = 1, limit: int = 20, user=Depends(get_current_user)):
    skip = (page - 1) * limit
    all_users = await db.users.find(
        {"id": {"$ne": user["id"]}},
        {"_id": 0, "password": 0, "email": 0}
    ).skip(skip).limit(limit).to_list(limit)

    user_ids = [u["id"] for u in all_users]
    friendships = await db.friendships.find(
        {"$or": [
            {"user_a": user["id"], "user_b": {"$in": user_ids}},
            {"user_b": user["id"], "user_a": {"$in": user_ids}},
        ]}, {"_id": 0}
    ).to_list(200)
    friend_set = {f["user_a"] if f["user_b"] == user["id"] else f["user_b"] for f in friendships}

    pending = await db.friend_requests.find(
        {"$or": [
            {"from_id": user["id"], "to_id": {"$in": user_ids}, "status": "pending"},
            {"to_id": user["id"], "from_id": {"$in": user_ids}, "status": "pending"},
        ]}, {"_id": 0}
    ).to_list(200)
    pending_set = {p["to_id"] if p["from_id"] == user["id"] else p["from_id"] for p in pending}

    results = []
    for u in all_users:
        profile = await db.profiles.find_one({"user_id": u["id"]}, {"_id": 0}) or {}
        results.append({
            "id": u["id"],
            "name": u.get("name", ""),
            "display_name": profile.get("display_name") or u.get("name", ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "vibe_status": profile.get("vibe_status", ""),
            "streak": 0,
            "is_friend": u["id"] in friend_set,
            "is_pending": u["id"] in pending_set,
            "message_privacy": profile.get("message_privacy", "everyone"),
        })
    total = await db.users.count_documents({"id": {"$ne": user["id"]}})
    return {"users": results, "total": total, "page": page}


@api_router.post("/friends/request")
async def send_friend_request(data: dict, user=Depends(get_current_user)):
    target_id = data.get("user_id", "")
    if not target_id or target_id == user["id"]:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    target = await db.users.find_one({"id": target_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.friend_requests.find_one({
        "$or": [
            {"from_id": user["id"], "to_id": target_id, "status": "pending"},
            {"from_id": target_id, "to_id": user["id"], "status": "pending"},
        ]
    })
    if existing:
        return {"status": "already_pending", "message": "Request already pending"}

    already_friends = await db.friendships.find_one({
        "$or": [
            {"user_a": user["id"], "user_b": target_id},
            {"user_a": target_id, "user_b": user["id"]},
        ]
    })
    if already_friends:
        return {"status": "already_friends", "message": "Already friends"}

    doc = {
        "id": str(uuid.uuid4()),
        "from_id": user["id"],
        "from_name": user["name"],
        "to_id": target_id,
        "to_name": target.get("name", ""),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.friend_requests.insert_one(doc)

    # Create activity
    await _create_activity(user["id"], "friend_request", f"sent a friend request to {target.get('name', 'someone')}", {"target_id": target_id})

    return {"status": "sent", "message": f"Request sent to {target.get('name', '')}"}


@api_router.post("/friends/respond")
async def respond_friend_request(data: dict, user=Depends(get_current_user)):
    request_id = data.get("request_id", "")
    action = data.get("action", "")  # "accept" or "decline"
    if not request_id or action not in ("accept", "decline"):
        raise HTTPException(status_code=400, detail="request_id and action (accept/decline) required")

    req = await db.friend_requests.find_one({"id": request_id, "to_id": user["id"], "status": "pending"})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if action == "accept":
        await db.friend_requests.update_one({"id": request_id}, {"$set": {"status": "accepted"}})
        friendship = {
            "id": str(uuid.uuid4()),
            "user_a": req["from_id"],
            "user_b": req["to_id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.friendships.insert_one(friendship)
        # Also ensure mutual follows
        for pair in [(req["from_id"], req["to_id"]), (req["to_id"], req["from_id"])]:
            exists = await db.follows.find_one({"follower_id": pair[0], "following_id": pair[1]})
            if not exists:
                await db.follows.insert_one({"follower_id": pair[0], "following_id": pair[1], "created_at": datetime.now(timezone.utc).isoformat()})

        await _create_activity(user["id"], "friend_accepted", f"became friends with {req['from_name']}", {"friend_id": req["from_id"]})
        return {"status": "accepted", "message": f"You are now friends with {req['from_name']}"}
    else:
        await db.friend_requests.update_one({"id": request_id}, {"$set": {"status": "declined"}})
        return {"status": "declined", "message": "Request declined"}


@api_router.delete("/friends/{friend_id}")
async def remove_friend(friend_id: str, user=Depends(get_current_user)):
    result = await db.friendships.delete_one({
        "$or": [
            {"user_a": user["id"], "user_b": friend_id},
            {"user_a": friend_id, "user_b": user["id"]},
        ]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friendship not found")
    return {"status": "removed"}


@api_router.get("/friends/list")
async def get_friends_list(user=Depends(get_current_user)):
    friendships = await db.friendships.find(
        {"$or": [{"user_a": user["id"]}, {"user_b": user["id"]}]},
        {"_id": 0}
    ).to_list(200)

    friend_ids = []
    for f in friendships:
        fid = f["user_b"] if f["user_a"] == user["id"] else f["user_a"]
        friend_ids.append(fid)

    friends = []
    for fid in friend_ids:
        u = await db.users.find_one({"id": fid}, {"_id": 0, "password": 0, "email": 0})
        if u:
            profile = await db.profiles.find_one({"user_id": fid}, {"_id": 0}) or {}
            streak = await db.streaks.find_one({"user_id": fid}, {"_id": 0})
            friends.append({
                "id": fid,
                "name": u.get("name", ""),
                "display_name": profile.get("display_name") or u.get("name", ""),
                "avatar_style": profile.get("avatar_style", "purple-teal"),
                "vibe_status": profile.get("vibe_status", ""),
                "theme_color": profile.get("theme_color", "#D8B4FE"),
                "streak": streak.get("current_streak", 0) if streak else 0,
            })

    return {"friends": friends, "count": len(friends)}


@api_router.get("/friends/requests")
async def get_friend_requests(user=Depends(get_current_user)):
    received = await db.friend_requests.find(
        {"to_id": user["id"], "status": "pending"}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    sent = await db.friend_requests.find(
        {"from_id": user["id"], "status": "pending"}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"received": received, "sent": sent}


@api_router.get("/friends/search")
async def search_users(q: str = "", user=Depends(get_current_user)):
    if not q or len(q) < 2:
        return {"users": []}

    results = await db.users.find(
        {"name": {"$regex": q, "$options": "i"}, "id": {"$ne": user["id"]}},
        {"_id": 0, "password": 0, "email": 0}
    ).to_list(20)

    user_ids = [r["id"] for r in results]
    friendships = await db.friendships.find(
        {"$or": [
            {"user_a": user["id"], "user_b": {"$in": user_ids}},
            {"user_b": user["id"], "user_a": {"$in": user_ids}},
        ]},
        {"_id": 0}
    ).to_list(200)
    friend_set = set()
    for f in friendships:
        friend_set.add(f["user_a"] if f["user_b"] == user["id"] else f["user_b"])

    pending = await db.friend_requests.find(
        {"$or": [
            {"from_id": user["id"], "to_id": {"$in": user_ids}, "status": "pending"},
            {"to_id": user["id"], "from_id": {"$in": user_ids}, "status": "pending"},
        ]},
        {"_id": 0}
    ).to_list(200)
    pending_set = set()
    for p in pending:
        pending_set.add(p["to_id"] if p["from_id"] == user["id"] else p["from_id"])

    users = []
    for r in results:
        profile = await db.profiles.find_one({"user_id": r["id"]}, {"_id": 0}) or {}
        users.append({
            "id": r["id"],
            "name": r.get("name", ""),
            "display_name": profile.get("display_name") or r.get("name", ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "vibe_status": profile.get("vibe_status", ""),
            "is_friend": r["id"] in friend_set,
            "is_pending": r["id"] in pending_set,
            "message_privacy": profile.get("message_privacy", "everyone"),
        })

    return {"users": users}


@api_router.get("/friends/suggested")
async def get_suggested_friends(user=Depends(get_current_user)):
    friendships = await db.friendships.find(
        {"$or": [{"user_a": user["id"]}, {"user_b": user["id"]}]},
        {"_id": 0}
    ).to_list(200)
    friend_ids = set()
    for f in friendships:
        friend_ids.add(f["user_b"] if f["user_a"] == user["id"] else f["user_a"])
    friend_ids.add(user["id"])

    all_users = await db.users.find(
        {"id": {"$nin": list(friend_ids)}},
        {"_id": 0, "password": 0, "email": 0}
    ).to_list(10)

    pending = await db.friend_requests.find(
        {"from_id": user["id"], "status": "pending"}, {"_id": 0}
    ).to_list(100)
    pending_ids = {p["to_id"] for p in pending}

    suggested = []
    for u in all_users:
        profile = await db.profiles.find_one({"user_id": u["id"]}, {"_id": 0}) or {}
        streak = await db.streaks.find_one({"user_id": u["id"]}, {"_id": 0})
        suggested.append({
            "id": u["id"],
            "name": u.get("name", ""),
            "display_name": profile.get("display_name") or u.get("name", ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "vibe_status": profile.get("vibe_status", ""),
            "streak": streak.get("current_streak", 0) if streak else 0,
            "is_pending": u["id"] in pending_ids,
        })

    return {"suggested": suggested}


# ========== ACTIVITY FEED ==========

async def _create_activity(user_id: str, activity_type: str, message: str, data: dict = None):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0}) or {}
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_name": profile.get("display_name") or user_doc.get("name", ""),
        "avatar_style": profile.get("avatar_style", "purple-teal"),
        "theme_color": profile.get("theme_color", "#D8B4FE"),
        "type": activity_type,
        "message": message,
        "data": data or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.activity_feed.insert_one(doc)


@api_router.get("/friends/feed")
async def get_friends_feed(user=Depends(get_current_user)):
    friendships = await db.friendships.find(
        {"$or": [{"user_a": user["id"]}, {"user_b": user["id"]}]},
        {"_id": 0}
    ).to_list(200)
    friend_ids = [user["id"]]
    for f in friendships:
        fid = f["user_b"] if f["user_a"] == user["id"] else f["user_a"]
        friend_ids.append(fid)

    activities = await db.activity_feed.find(
        {"user_id": {"$in": friend_ids}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)

    return {"feed": activities}


@api_router.post("/friends/share")
async def share_with_friends(data: dict, user=Depends(get_current_user)):
    share_type = data.get("type", "")  # achievement, score, milestone, tool
    message = data.get("message", "")
    share_data = data.get("data", {})

    if not share_type or not message:
        raise HTTPException(status_code=400, detail="type and message required")

    await _create_activity(user["id"], f"share_{share_type}", message, share_data)
    return {"status": "shared", "message": "Shared with your friends!"}


# ========== DIRECT MESSAGES ==========

@api_router.post("/messages/send")
async def send_message(data: dict, user=Depends(get_current_user)):
    to_id = data.get("to_id", "")
    text = data.get("text", "")
    if not to_id or not text:
        raise HTTPException(status_code=400, detail="to_id and text required")

    target = await db.users.find_one({"id": to_id}, {"_id": 0, "id": 1})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # Check recipient's message privacy setting
    target_profile = await db.profiles.find_one({"user_id": to_id}, {"_id": 0})
    msg_privacy = (target_profile or {}).get("message_privacy", "everyone")
    if msg_privacy == "nobody":
        raise HTTPException(status_code=403, detail="This user has disabled messages")
    if msg_privacy == "friends_only":
        is_friend = await db.friendships.find_one({
            "$or": [
                {"user_a": user["id"], "user_b": to_id},
                {"user_a": to_id, "user_b": user["id"]},
            ]
        })
        if not is_friend:
            raise HTTPException(status_code=403, detail="This user only accepts messages from friends")

    convo_id = "_".join(sorted([user["id"], to_id]))
    doc = {
        "id": str(uuid.uuid4()),
        "conversation_id": convo_id,
        "from_id": user["id"],
        "from_name": user["name"],
        "to_id": to_id,
        "text": text,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(doc)
    return {"status": "sent", "message_id": doc["id"]}


@api_router.get("/messages/conversations")
async def get_conversations(user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"$or": [{"from_id": user["id"]}, {"to_id": user["id"]}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$conversation_id",
            "last_message": {"$first": "$text"},
            "last_from": {"$first": "$from_id"},
            "last_time": {"$first": "$created_at"},
            "unread_count": {"$sum": {"$cond": [{"$and": [{"$eq": ["$to_id", user["id"]]}, {"$eq": ["$read", False]}]}, 1, 0]}},
        }},
        {"$sort": {"last_time": -1}},
    ]
    convos = await db.messages.aggregate(pipeline).to_list(50)

    result = []
    for c in convos:
        parts = c["_id"].split("_")
        other_id = parts[0] if parts[1] == user["id"] else parts[1]
        other_user = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0, "email": 0})
        profile = await db.profiles.find_one({"user_id": other_id}, {"_id": 0}) or {}
        result.append({
            "conversation_id": c["_id"],
            "other_id": other_id,
            "other_name": profile.get("display_name") or (other_user.get("name", "") if other_user else ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "last_message": c["last_message"][:80],
            "last_from": c["last_from"],
            "last_time": c["last_time"],
            "unread_count": c["unread_count"],
        })

    return {"conversations": result}


@api_router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: str, user=Depends(get_current_user)):
    if user["id"] not in conversation_id:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    # Mark as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "to_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )

    return {"messages": messages}


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
