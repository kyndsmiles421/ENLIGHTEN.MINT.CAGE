from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import GuidedMeditationRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import random

@router.post("/meditation/generate-guided")
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
            api_key=EMERGENT_LLM_KEY,
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

@router.post("/meditation/generate-audio")
async def generate_meditation_audio(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate TTS audio for meditation steps. Returns base64 audio."""
    steps = data.get("steps", [])
    voice = data.get("voice", "sage")  # sage, shimmer, nova, alloy, echo, fable, onyx
    speed = data.get("speed", 0.85)

    if not steps:
        raise HTTPException(status_code=400, detail="No meditation steps provided")

    # Combine all step texts into one narration with pauses
    narration_parts = []
    for i, step in enumerate(steps):
        text = step.get("text", "").strip()
        if text:
            narration_parts.append(text)
            # Add pause between steps (TTS interprets ... as a pause)
            if i < len(steps) - 1:
                narration_parts.append("... ... ...")

    full_narration = "\n\n".join(narration_parts)
    if not full_narration.strip():
        raise HTTPException(status_code=400, detail="No narration text in steps")

    # Limit to TTS max (4096 chars)
    if len(full_narration) > 4096:
        full_narration = full_narration[:4096]

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=full_narration,
            model="tts-1-hd",
            voice=voice,
            speed=speed,
            response_format="mp3",
        )
        # Save meditation audio record
        doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "voice": voice,
            "step_count": len(steps),
            "text_length": len(full_narration),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.meditation_audio.insert_one(doc)
        return {"audio": audio_b64, "format": "mp3", "voice": voice}
    except Exception as e:
        logger.error(f"Meditation audio generation error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate meditation audio. Please try again.")


@router.get("/meditation/audio-history")
async def get_meditation_audio_history(user=Depends(get_current_user)):
    """Get user's meditation audio generation history."""
    items = await db.meditation_audio.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return {"history": items}



@router.post("/meditation/save-custom")
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

@router.get("/meditation/my-custom")
async def get_custom_meditations(user=Depends(get_current_user)):
    """Get user's saved custom meditations."""
    items = await db.custom_meditations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/meditation/custom/{meditation_id}")
async def delete_custom_meditation(meditation_id: str, user=Depends(get_current_user)):
    result = await db.custom_meditations.delete_one({"id": meditation_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Breathing Patterns ---

@router.post("/breathing/save-custom")
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

@router.get("/breathing/my-custom")
async def get_custom_breathing(user=Depends(get_current_user)):
    items = await db.custom_breathing.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/breathing/custom/{pattern_id}")
async def delete_custom_breathing(pattern_id: str, user=Depends(get_current_user)):
    result = await db.custom_breathing.delete_one({"id": pattern_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Affirmation Sets ---

@router.post("/affirmations/generate-set")
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
            api_key=EMERGENT_LLM_KEY,
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

@router.post("/affirmations/save-set")
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

@router.get("/affirmations/my-sets")
async def get_affirmation_sets(user=Depends(get_current_user)):
    items = await db.custom_affirmations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/affirmations/set/{set_id}")
async def delete_affirmation_set(set_id: str, user=Depends(get_current_user)):
    result = await db.custom_affirmations.delete_one({"id": set_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Soundscape Mixes ---

@router.post("/soundscapes/save-mix")
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
    try:
        from routes.rpg import award_quest_xp
        quest_result = await award_quest_xp(user["id"], "soundscape")
        if quest_result:
            doc["quest_xp"] = quest_result
    except Exception:
        pass
    return doc

@router.get("/soundscapes/my-mixes")
async def get_soundscape_mixes(user=Depends(get_current_user)):
    items = await db.custom_soundscapes.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/soundscapes/mix/{mix_id}")
async def delete_soundscape_mix(mix_id: str, user=Depends(get_current_user)):
    result = await db.custom_soundscapes.delete_one({"id": mix_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}




# ===== CONSTELLATION-LINKED MEDITATIONS =====

ZODIAC_CONSTELLATIONS = [
    {"id": "aries", "name": "Aries", "symbol": "Ram", "element": "Fire", "color": "#EF4444",
     "deity": "Zeus", "figure": "The Golden Ram",
     "theme": "courage, new beginnings, and the pioneer spirit",
     "imagery": "a golden ram soaring through starlight, its fleece blazing like sunrise",
     "lesson": "Sometimes salvation arrives in the most unexpected forms. The courage to accept rescue is itself an act of bravery."},
    {"id": "taurus", "name": "Taurus", "symbol": "Bull", "element": "Earth", "color": "#22C55E",
     "deity": "Zeus/Aphrodite", "figure": "The Celestial Bull",
     "theme": "grounding, sensual presence, abundance, and patience",
     "imagery": "a magnificent white bull standing in a meadow of stars, solid and immovable as the earth",
     "lesson": "True strength is not aggression — it is the patience to endure and the wisdom to stand firm."},
    {"id": "gemini", "name": "Gemini", "symbol": "Twins", "element": "Air", "color": "#C084FC",
     "deity": "Castor & Pollux", "figure": "The Divine Twins",
     "theme": "duality, communication, adaptability, and connection",
     "imagery": "twin figures of light reaching across the cosmos, their hands almost touching",
     "lesson": "We all contain multitudes. Embrace every facet of yourself — light and shadow, mortal and divine."},
    {"id": "cancer", "name": "Cancer", "symbol": "Crab", "element": "Water", "color": "#3B82F6",
     "deity": "Artemis/Selene", "figure": "The Sacred Crab",
     "theme": "emotional depth, nurturing, home, and intuition",
     "imagery": "a luminous crab at the edge of a moonlit cosmic ocean, guarding its treasures",
     "lesson": "Your sensitivity is not weakness — it is your greatest power. The depths you feel are the depths you can heal."},
    {"id": "leo", "name": "Leo", "symbol": "Lion", "element": "Fire", "color": "#FB923C",
     "deity": "Apollo", "figure": "The Nemean Lion",
     "theme": "radiance, self-expression, heart-centered leadership, and creative fire",
     "imagery": "a golden lion with a mane of starfire, roaring light into the darkness",
     "lesson": "Your light was never meant to be hidden. Shine with full brilliance and give others permission to do the same."},
    {"id": "virgo", "name": "Virgo", "symbol": "Maiden", "element": "Earth", "color": "#2DD4BF",
     "deity": "Demeter/Persephone", "figure": "The Harvest Maiden",
     "theme": "sacred service, healing, discernment, and wholeness",
     "imagery": "a maiden holding a sheaf of golden wheat beneath a canopy of stars, her gaze steady and wise",
     "lesson": "Perfection is not the goal — presence is. In attending to each small detail with love, the whole becomes sacred."},
    {"id": "libra", "name": "Libra", "symbol": "Scales", "element": "Air", "color": "#D8B4FE",
     "deity": "Themis/Astraea", "figure": "The Scales of Justice",
     "theme": "balance, harmony, relationships, and beauty",
     "imagery": "golden scales floating in the void, perfectly balanced between starlight and shadow",
     "lesson": "True balance is not rigid equilibrium — it is the graceful dance of constant adjustment."},
    {"id": "scorpio", "name": "Scorpio", "symbol": "Scorpion", "element": "Water", "color": "#6366F1",
     "deity": "Hades/Pluto", "figure": "The Cosmic Scorpion",
     "theme": "transformation, depth, rebirth, and the power of surrender",
     "imagery": "a scorpion made of deep violet starlight, shedding its old form to reveal wings of phoenix fire",
     "lesson": "Every ending is a doorway. What you release makes space for what is trying to be born."},
    {"id": "sagittarius", "name": "Sagittarius", "symbol": "Archer", "element": "Fire", "color": "#FCD34D",
     "deity": "Chiron", "figure": "The Centaur Archer",
     "theme": "expansion, wisdom, adventure, and the quest for truth",
     "imagery": "a centaur archer drawing a bow of pure light, the arrow pointed toward the heart of the galaxy",
     "lesson": "The arrow flies truest when released without attachment. Aim high, then let go."},
    {"id": "capricorn", "name": "Capricorn", "symbol": "Sea-Goat", "element": "Earth", "color": "#78716C",
     "deity": "Pan/Kronos", "figure": "The Sea-Goat",
     "theme": "ambition, mastery, discipline, and the marriage of earth and water",
     "imagery": "a sea-goat climbing a mountain of crystallized starlight, its tail dissolving into cosmic ocean below",
     "lesson": "The mountain is climbed one step at a time. Honor the journey as much as the summit."},
    {"id": "aquarius", "name": "Aquarius", "symbol": "Water Bearer", "element": "Air", "color": "#06B6D4",
     "deity": "Uranus/Ganymede", "figure": "The Water Bearer",
     "theme": "innovation, humanitarianism, vision, and cosmic consciousness",
     "imagery": "a luminous figure pouring streams of liquid starlight from a cosmic vessel, nourishing the universe",
     "lesson": "You carry the waters of the future. Pour generously — there is always more."},
    {"id": "pisces", "name": "Pisces", "symbol": "Fish", "element": "Water", "color": "#818CF8",
     "deity": "Poseidon/Aphrodite", "figure": "The Bound Fish",
     "theme": "transcendence, compassion, dreams, and the dissolution of boundaries",
     "imagery": "two luminous fish swimming in opposite circles through a sea of nebula, connected by a cord of light",
     "lesson": "In the deepest waters of consciousness, all separation dissolves. You are the ocean dreaming it is a wave."},
]

def _zodiac_from_date(birth_date_str):
    try:
        parts = birth_date_str.split("-")
        m, d = int(parts[1]), int(parts[2])
    except Exception:
        return None
    signs = [
        (1, 20, "capricorn"), (2, 19, "aquarius"), (3, 20, "pisces"),
        (4, 20, "aries"), (5, 21, "taurus"), (6, 21, "gemini"),
        (7, 22, "cancer"), (8, 23, "leo"), (9, 23, "virgo"),
        (10, 23, "libra"), (11, 22, "scorpio"), (12, 22, "sagittarius"), (12, 31, "capricorn"),
    ]
    for end_m, end_d, sign in signs:
        if m < end_m or (m == end_m and d <= end_d):
            return sign
    return "capricorn"


@router.get("/meditation/constellation-themes")
async def get_constellation_themes(user=Depends(get_current_user)):
    """Return constellation meditation themes with user's birth sign highlighted."""
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    birth_date = profile.get("birth_date", "") if profile else ""
    user_zodiac = _zodiac_from_date(birth_date) if birth_date else None

    # Check which constellations the user has already generated meditations for
    existing = await db.constellation_meditations.find(
        {"user_id": user["id"]}, {"_id": 0, "constellation_id": 1}
    ).to_list(100)
    existing_ids = {e["constellation_id"] for e in existing}

    themes = []
    for c in ZODIAC_CONSTELLATIONS:
        themes.append({
            **c,
            "is_birth_sign": c["id"] == user_zodiac,
            "has_meditation": c["id"] in existing_ids,
        })

    return {
        "themes": themes,
        "user_zodiac": user_zodiac,
    }


@router.post("/meditation/generate-constellation")
async def generate_constellation_meditation(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate a meditation themed to a specific constellation's mythology and energy."""
    constellation_id = data.get("constellation_id", "").lower()
    duration = max(5, min(20, data.get("duration", 10)))
    constellation = next((c for c in ZODIAC_CONSTELLATIONS if c["id"] == constellation_id), None)
    if not constellation:
        raise HTTPException(status_code=404, detail="Constellation not found")

    # Get user profile for personalization
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    birth_date = profile.get("birth_date", "") if profile else ""
    user_zodiac = _zodiac_from_date(birth_date) if birth_date else None
    is_birth_sign = constellation_id == user_zodiac

    # Get energy state for additional personalization
    energy_data = await db.moods.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(1)
    current_mood = energy_data[0].get("mood", "neutral") if energy_data else "neutral"

    num_steps = max(6, min(16, duration))
    step_dur = (duration * 60) // num_steps

    birth_note = "\nThis is the meditator's BIRTH constellation — make it deeply personal, like coming home to their cosmic origin." if is_birth_sign else ""
    mood_note = f"\nThe meditator's current mood is '{current_mood}'. Weave this awareness in subtly — acknowledge where they are and guide them toward the constellation's healing gifts." if current_mood != "neutral" else ""

    prompt = f"""Create a deeply immersive, constellation-themed guided meditation for the {constellation['name']} constellation.

CONSTELLATION DETAILS:
- Name: {constellation['name']} ({constellation['symbol']})
- Element: {constellation['element']}
- Mythological Figure: {constellation['figure']}
- Deity: {constellation['deity']}
- Theme: {constellation['theme']}
- Cosmic Imagery: {constellation['imagery']}
- Cosmic Lesson: {constellation['lesson']}
{birth_note}{mood_note}

MEDITATION STRUCTURE:
- Duration: {duration} minutes ({num_steps} steps)
- Opening: Guide the meditator to look up at the night sky and find the {constellation['name']} constellation
- Journey: Transport them into the mythology — they should EXPERIENCE the story, not just hear it
- Element Work: Incorporate {constellation['element']} element energy ({"warmth, fire, light" if constellation['element'] == 'Fire' else "grounding, earth, stability" if constellation['element'] == 'Earth' else "breath, wind, clarity" if constellation['element'] == 'Air' else "flow, water, depth"})
- Deity Connection: A moment of connection or blessing from {constellation['deity']}
- Integration: Bring the cosmic lesson into their daily life
- Closing: Return them gently to their body with the constellation's gift

STYLE: Written in second person, deeply poetic and immersive. Use vivid sensory details — sights, sounds, sensations. Each step should be 2-4 sentences. The tone should feel like an ancient storyteller sharing sacred knowledge under the stars.

Return ONLY a valid JSON array of steps, each with "text" (string) and "duration" (integer seconds, aim for {step_dur}). No markdown, no explanation."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"constellation-med-{str(uuid.uuid4())}",
            system_message="You are a cosmic meditation guide who channels the wisdom of the constellations. You weave mythology, astronomy, and deep spiritual insight into transformative guided meditations. Always respond with valid JSON only.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        raw = await asyncio.wait_for(chat.send_message(msg), timeout=50)

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

        # Save to DB
        doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "constellation_id": constellation_id,
            "constellation_name": constellation["name"],
            "element": constellation["element"],
            "duration": duration,
            "steps": steps,
            "is_birth_sign": is_birth_sign,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.constellation_meditations.insert_one(doc)
        doc.pop("_id", None)

        return {
            "meditation": doc,
            "constellation": constellation,
        }
    except Exception as e:
        logger.error(f"Constellation meditation generate error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate constellation meditation. Please try again.")


@router.get("/meditation/my-constellation")
async def get_my_constellation_meditations(user=Depends(get_current_user)):
    """Get user's saved constellation meditations."""
    items = await db.constellation_meditations.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return items


@router.delete("/meditation/constellation/{meditation_id}")
async def delete_constellation_meditation(meditation_id: str, user=Depends(get_current_user)):
    result = await db.constellation_meditations.delete_one({"id": meditation_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}
