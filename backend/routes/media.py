from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import JSONResponse
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
from typing import Optional
from models import ClassEnroll, LessonComplete, CustomCreation, AICreateRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import asyncio
import os

router = APIRouter()

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

@router.get("/videos")
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

@router.get("/classes")
async def get_classes():
    return [{ **c, "lesson_count": len(c["lessons"]) } for c in CLASSES_DATA]

@router.get("/classes/{class_id}")
async def get_class_detail(class_id: str):
    cls = next((c for c in CLASSES_DATA if c["id"] == class_id), None)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls

@router.post("/classes/enroll")
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

@router.post("/classes/complete-lesson")
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

@router.get("/classes/my/enrollments")
async def get_my_enrollments(user=Depends(get_current_user)):
    enrollments = await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return enrollments

@router.get("/certifications/my")
async def get_my_certifications(user=Depends(get_current_user)):
    certs = await db.certifications.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return certs

# --- User Creations (Custom Affirmations, Meditations, etc.) ---
@router.post("/creations")
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

@router.get("/creations/my")
async def get_my_creations(user=Depends(get_current_user)):
    items = await db.creations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@router.get("/creations/my/{creation_type}")
async def get_my_creations_by_type(creation_type: str, user=Depends(get_current_user)):
    items = await db.creations.find({"user_id": user["id"], "type": creation_type}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@router.delete("/creations/{creation_id}")
async def delete_creation(creation_id: str, user=Depends(get_current_user)):
    result = await db.creations.delete_one({"id": creation_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Creation not found")
    return {"status": "deleted"}

@router.put("/creations/{creation_id}/share")
async def toggle_share(creation_id: str, user=Depends(get_current_user)):
    doc = await db.creations.find_one({"id": creation_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Creation not found")
    new_shared = not doc.get("shared", False)
    await db.creations.update_one({"id": creation_id}, {"$set": {"shared": new_shared}})
    return {"shared": new_shared}

@router.get("/creations/shared")
async def get_shared_creations(creation_type: Optional[str] = None):
    query = {"shared": True}
    if creation_type:
        query["type"] = creation_type
    items = await db.creations.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.put("/creations/{creation_id}/like")
async def like_creation(creation_id: str):
    result = await db.creations.update_one({"id": creation_id, "shared": True}, {"$inc": {"likes": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Creation not found")
    return {"status": "liked"}

@router.post("/creations/ai-generate")
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
            api_key=EMERGENT_LLM_KEY,
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


