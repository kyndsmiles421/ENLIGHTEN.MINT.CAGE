from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from engines.crystal_seal import secure_hash_short
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import KnowledgeRequest, NarrationRequest
from pydantic import BaseModel
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
from emergentintegrations.llm.openai import OpenAITextToSpeech
import random

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

@router.post("/knowledge/deep-dive")
async def knowledge_deep_dive(req: KnowledgeRequest, user=Depends(get_current_user_optional)):
    if not req.topic or len(req.topic.strip()) < 2:
        raise HTTPException(status_code=400, detail="Topic too short")

    uid = user["id"] if user else "anon"
    fresh = req.context and "fresh" in req.context.lower() if req.context else False

    # Track what the user has already seen for this topic
    seen_count = await db.knowledge_views.count_documents({"user_id": uid, "topic": req.topic})

    # If user hasn't seen it and we have a cache, serve it
    if seen_count == 0 and not fresh:
        cached = await db.knowledge_cache.find_one(
            {"topic": req.topic, "category": req.category}, {"_id": 0}
        )
        if cached:
            await db.knowledge_views.insert_one({
                "user_id": uid, "topic": req.topic, "category": req.category,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            return cached

    # User has seen this before — generate fresh perspective
    category = req.category if req.category in KNOWLEDGE_PROMPTS else "general"
    prompt_template = KNOWLEDGE_PROMPTS[category]
    prompt = prompt_template.replace("{topic}", req.topic)
    if req.context:
        prompt = prompt.replace("{context}", f"Additional context: {req.context}")
    else:
        prompt = prompt.replace("{context}", "")

    # Add adaptive perspective rotation based on view count
    perspectives = [
        "Focus on practical application and hands-on exercises the reader can do right now.",
        "Explore the historical and cross-cultural connections — how does this appear in different traditions?",
        "Go deep into the science — what does modern research say about this practice?",
        "Tell a story — use narrative and metaphor to make this teaching come alive.",
        "Focus on common mistakes and misconceptions. What do most people get wrong?",
        "Connect this to daily life — morning routines, work, relationships, sleep.",
        "Explore the esoteric and mystical dimensions that most guides skip.",
        "Frame this as a progressive journey — beginner to advanced stages of mastery.",
    ]
    perspective = perspectives[seen_count % len(perspectives)]
    prompt += f"\n\nIMPORTANT: {perspective} This is visit #{seen_count + 1} for this user — they already know the basics. Go deeper, offer something new."

    last_error = None
    for attempt in range(2):
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"knowledge-{str(uuid.uuid4())}",
                system_message="You are a deeply knowledgeable spiritual teacher and wellness expert. Provide thorough, well-structured guides with markdown formatting. Never repeat what the user already knows — always go deeper.",
            )
            chat.with_model("openai", "gpt-5.2")
            msg = UserMessage(text=prompt)
            response = await asyncio.wait_for(chat.send_message(msg), timeout=45)

            result = {
                "topic": req.topic,
                "category": req.category,
                "content": response,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "perspective": perspective,
                "visit_number": seen_count + 1,
            }

            # Store for this user's history
            await db.knowledge_views.insert_one({
                "user_id": uid, "topic": req.topic, "category": req.category,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            # Cache for first-time viewers
            if seen_count == 0:
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

@router.get("/knowledge/suggestions/{category}")
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


class GuidedExperienceRequest(BaseModel):
    practice_name: str
    description: str
    instructions: list
    category: str = "meditation"
    duration_minutes: int = 10


@router.post("/guided-experience/generate")
async def generate_guided_experience(req: GuidedExperienceRequest, user=Depends(get_current_user)):
    """Transform raw practice instructions into an immersive guided meditation script."""
    steps_text = "\n".join(f"Step {i+1}: {s}" for i, s in enumerate(req.instructions))
    num_segments = max(5, min(15, req.duration_minutes))
    secs_per = (req.duration_minutes * 60) // num_segments

    prompt = f"""Transform these practice instructions into an immersive guided meditation experience.

Practice: "{req.practice_name}"
Category: {req.category}
Description: {req.description}
Original steps:
{steps_text}

Create {num_segments} meditation segments. Each segment should feel like a guided meditation — NOT just reading instructions. Include:
- Breathing cues ("Take a slow, deep breath in...")
- Sensory imagery ("Feel warmth spreading through your chest...")
- Pacing pauses ("Allow a moment of silence...")
- Body awareness ("Notice the sensation in your palms...")
- Emotional guidance ("Let any tension dissolve with each exhale...")

Return ONLY a JSON array. Each item must have:
- "text": narration text (3-5 sentences, second person, warm and present-tense, as if guiding someone through the experience in real-time)
- "duration": seconds for this segment (around {secs_per}s each)
- "cue": one of "breathe", "feel", "visualize", "move", "listen", "rest", "chant" — the primary action
- "intensity": 1-10 scale of energy level for this segment

Flow: gentle opening -> warm-up/settling -> core practice segments -> peak/deepening -> integration -> gentle closing.
Make it feel like a real meditation teacher is with you, guiding you moment by moment.
Return ONLY valid JSON array, no markdown."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"guided-exp-{str(uuid.uuid4())}",
            system_message="You are a master meditation and wellness guide. Transform instructional content into deeply immersive, sensory-rich guided experiences. Always return valid JSON only.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        raw = await asyncio.wait_for(chat.send_message(msg), timeout=45)

        import json as json_mod
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
        segments = json_mod.loads(cleaned)
        if not isinstance(segments, list):
            raise ValueError("Not a list")
        return {
            "practice_name": req.practice_name,
            "category": req.category,
            "segments": segments,
            "total_duration": sum(s.get("duration", secs_per) for s in segments),
        }
    except Exception as e:
        logger.error(f"Guided experience generation error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate guided experience")


# Context-aware voice mapping: each context maps to the most fitting voice + speed
# for a natural, human feel that matches the feature's mood
VOICE_CONTEXT_MAP = {
    "meditation":   {"voice": "shimmer", "speed": 0.85},  # calm, soothing, slow
    "breathing":    {"voice": "shimmer", "speed": 0.80},  # gentle, measured pace
    "yoga":         {"voice": "nova",    "speed": 0.90},  # warm, encouraging
    "mantras":      {"voice": "shimmer", "speed": 0.75},  # reverent, spiritual
    "affirmations": {"voice": "nova",    "speed": 0.90},  # warm, affirming
    "starchart":    {"voice": "fable",   "speed": 0.88},  # storyteller, mythical
    "constellation":{"voice": "fable",   "speed": 0.88},
    "creation":     {"voice": "onyx",    "speed": 0.85},  # dramatic narrator
    "oracle":       {"voice": "fable",   "speed": 0.85},  # mystical, prophetic
    "tarot":        {"voice": "fable",   "speed": 0.85},
    "akashic":      {"voice": "sage",    "speed": 0.82},  # ancient, wise
    "sage":         {"voice": "sage",    "speed": 0.88},  # AI coach, wise guide
    "coach":        {"voice": "sage",    "speed": 0.88},
    "encyclopedia": {"voice": "nova",    "speed": 0.95},  # scholarly but warm
    "knowledge":    {"voice": "nova",    "speed": 0.95},
    "reiki":        {"voice": "shimmer", "speed": 0.80},  # healing, gentle
    "frequency":    {"voice": "shimmer", "speed": 0.82},
    "soundscape":   {"voice": "shimmer", "speed": 0.80},
    "mixer":        {"voice": "nova", "speed": 0.88},
    "journal":      {"voice": "nova",    "speed": 0.90},  # reflective, personal
    "ritual":       {"voice": "fable",   "speed": 0.85},  # ceremonial
    "dream":        {"voice": "fable",   "speed": 0.82},  # dreamlike, mystical
    "crystal":      {"voice": "nova",    "speed": 0.88},  # earthy, grounded
    "numerology":   {"voice": "sage",    "speed": 0.90},  # analytical, wise
    "herbology":    {"voice": "nova",    "speed": 0.90},  # nurturing, grounded
}
VALID_VOICES = {"alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"}


@router.post("/tts/narrate")
async def generate_narration(req: NarrationRequest):
    if not req.text or len(req.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text too short")
    text = req.text[:4000]

    # Resolve voice + speed from context, with explicit overrides taking priority
    ctx_defaults = VOICE_CONTEXT_MAP.get(req.context, {"voice": "nova", "speed": 0.92})
    voice = req.voice if req.voice and req.voice in VALID_VOICES else ctx_defaults["voice"]
    speed = req.speed if req.speed else ctx_defaults["speed"]

    cache_key = secure_hash_short(f"{text}:{speed}:{voice}", 32)
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}
    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=text,
            model="tts-1-hd",
            voice=voice,
            speed=speed,
            response_format="mp3"
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate narration")

# --- Health ---
@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "ENLIGHTEN.MINT.CAFE API"}

@router.get("/")
async def root():
    return {"message": "ENLIGHTEN.MINT.CAFE API is alive"}