from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import JSONResponse
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()

# --- Mudras ---
from data.mudras import MUDRAS_DATA

@router.get("/mudras")
async def get_mudras():
    return JSONResponse(content=MUDRAS_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Yantra ---
from data.yantras import YANTRAS_DATA

@router.get("/yantras")
async def get_yantras():
    return JSONResponse(content=YANTRAS_DATA, headers={"Cache-Control": "public, max-age=3600"})

# --- Tantra ---
from data.tantra import TANTRA_DATA

@router.get("/tantra")
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


