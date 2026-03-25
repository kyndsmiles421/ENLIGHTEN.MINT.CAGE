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
        return {"user_id": user["id"], "display_name": user_doc.get("name"), "bio": "", "cover_image": COVER_PRESETS[0]["url"], "theme_color": "#D8B4FE", "avatar_style": "purple-teal", "vibe_status": "", "favorite_quote": "", "music_choice": "none", "music_frequency": 432, "show_stats": True, "show_activity": True}
    profile["display_name"] = profile.get("display_name") or user_doc.get("name")
    return profile

@api_router.get("/profile/public/{user_id}")
async def get_public_profile_full(user_id: str):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "email": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0}) or {}
    mood_count = await db.moods.count_documents({"user_id": user_id})
    journal_count = await db.journal.count_documents({"user_id": user_id})
    post_count = await db.community_posts.count_documents({"user_id": user_id})
    ritual_sessions = await db.ritual_completions.count_documents({"user_id": user_id})
    challenge_count = await db.challenge_participants.count_documents({"user_id": user_id})
    follower_count = await db.follows.count_documents({"following_id": user_id})
    recent_posts = await db.community_posts.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(5)
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
         {"id": "l1", "title": "Foundation: Gyan & Anjali Mudra", "description": "Learn the two most fundamental mudras and their energetic effects.", "duration": "20 min", "order": 1},
         {"id": "l2", "title": "Healing Mudras: Prana & Apana", "description": "Discover mudras for vitality and purification.", "duration": "25 min", "order": 2},
         {"id": "l3", "title": "Elemental Balance: Vayu & Surya", "description": "Balance the air and fire elements in your body.", "duration": "20 min", "order": 3},
         {"id": "l4", "title": "Advanced: Dhyana & Shuni", "description": "Deepen meditation and build discipline through mudras.", "duration": "30 min", "order": 4},
         {"id": "l5", "title": "Integration: Daily Mudra Practice", "description": "Create your personal mudra routine combining all you've learned.", "duration": "25 min", "order": 5},
     ]},
    {"id": "cls-yantra-wisdom", "title": "Yantra Wisdom", "description": "Understand the sacred geometry of yantras, learn traditional meditation techniques, and discover how to use yantras for manifestation and healing.", "category": "yantra", "instructor": "Ravi Shankar", "duration": "3 weeks", "level": "Intermediate", "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop", "color": "#EF4444",
     "lessons": [
         {"id": "l1", "title": "What Are Yantras?", "description": "The history, science, and spiritual significance of sacred diagrams.", "duration": "15 min", "order": 1},
         {"id": "l2", "title": "Sri Yantra Deep Dive", "description": "Master the most powerful yantra and its meditation technique.", "duration": "30 min", "order": 2},
         {"id": "l3", "title": "Deity Yantras", "description": "Ganesh, Kali, Lakshmi, and Saraswati yantras for specific intentions.", "duration": "25 min", "order": 3},
         {"id": "l4", "title": "Yantra Meditation Mastery", "description": "Advanced yantra gazing (Trataka) and inner visualization techniques.", "duration": "35 min", "order": 4},
     ]},
    {"id": "cls-tantra-foundations", "title": "Tantra Foundations", "description": "A comprehensive introduction to tantric philosophy and practice — chakras, energy channels, breathwork, mantra, and the science of expanding consciousness.", "category": "tantra", "instructor": "Ananda Ji", "duration": "6 weeks", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop", "color": "#FCD34D",
     "lessons": [
         {"id": "l1", "title": "What Is Tantra?", "description": "Demystifying tantra — the science of energy and consciousness expansion.", "duration": "20 min", "order": 1},
         {"id": "l2", "title": "The Chakra System", "description": "Understanding the 7 energy centers and their role in spiritual evolution.", "duration": "30 min", "order": 2},
         {"id": "l3", "title": "Tantric Breathwork", "description": "Circular breathing, Breath of Fire, and alternate nostril breathing.", "duration": "25 min", "order": 3},
         {"id": "l4", "title": "Mantra Science", "description": "The power of sacred sound — learn key mantras and their effects.", "duration": "20 min", "order": 4},
         {"id": "l5", "title": "Energy Body Activation", "description": "Nadis, kundalini, and practices for awakening subtle energy.", "duration": "35 min", "order": 5},
         {"id": "l6", "title": "Integration & Daily Sadhana", "description": "Build your personal tantric practice for daily transformation.", "duration": "25 min", "order": 6},
     ]},
    {"id": "cls-frequency-healing", "title": "Frequency Healing", "description": "Master the science of sound healing using solfeggio frequencies, binaural beats, and planetary tones for physical, emotional, and spiritual healing.", "category": "frequencies", "instructor": "Sound Healer Akasha", "duration": "3 weeks", "level": "Beginner", "thumbnail": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop", "color": "#8B5CF6",
     "lessons": [
         {"id": "l1", "title": "The Science of Sound", "description": "How frequencies affect the body, brain, and consciousness.", "duration": "20 min", "order": 1},
         {"id": "l2", "title": "Solfeggio Frequencies", "description": "Deep dive into the ancient 9-tone scale and its healing properties.", "duration": "30 min", "order": 2},
         {"id": "l3", "title": "Binaural Beats & Brainwaves", "description": "Using stereo frequencies to entrain your brain into desired states.", "duration": "25 min", "order": 3},
         {"id": "l4", "title": "Planetary Frequencies", "description": "The music of the spheres — planetary tones for cosmic alignment.", "duration": "25 min", "order": 4},
     ]},
    {"id": "cls-consciousness-explorer", "title": "Consciousness Explorer", "description": "A transformative journey combining all practices — mudras, yantras, tantra, frequencies, and divination — into a unified path of awakening.", "category": "advanced", "instructor": "Cosmic Collective Masters", "duration": "8 weeks", "level": "Advanced", "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop", "color": "#2DD4BF",
     "lessons": [
         {"id": "l1", "title": "The Map of Consciousness", "description": "Understanding levels of consciousness and your current state.", "duration": "25 min", "order": 1},
         {"id": "l2", "title": "Energy Mastery", "description": "Combining mudras, breathwork, and visualization for energy control.", "duration": "35 min", "order": 2},
         {"id": "l3", "title": "Sacred Sound & Form", "description": "Integrating mantra with yantra for amplified meditation.", "duration": "30 min", "order": 3},
         {"id": "l4", "title": "The Oracle Within", "description": "Using divination tools as mirrors for self-knowledge.", "duration": "25 min", "order": 4},
         {"id": "l5", "title": "Frequency Attunement", "description": "Advanced frequency work for altered states of consciousness.", "duration": "30 min", "order": 5},
         {"id": "l6", "title": "The Unified Practice", "description": "Creating your personal synthesis of all practices.", "duration": "40 min", "order": 6},
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
