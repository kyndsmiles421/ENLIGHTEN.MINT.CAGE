from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File, Form
from fastapi.responses import JSONResponse
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech, OpenAISpeechToText
from quantum_framework import get_quantum_coaching_addon
from datetime import datetime, timezone
import uuid
import asyncio
import base64
import tempfile
import os

router = APIRouter()

COACHING_MODES = {
    "spiritual": {
        "name": "Spiritual Guidance",
        "color": "#D8B4FE",
        "desc": "Deep wisdom from all sacred traditions",
        "system_addon": "You draw from Buddhism, Hinduism, Taoism, Sufism, Kabbalah, Egyptian mysticism, shamanism, and indigenous wisdom traditions. Help the seeker connect to their higher self and divine purpose."
    },
    "life": {
        "name": "Life Coaching",
        "color": "#22C55E",
        "desc": "Practical guidance for life decisions and growth",
        "system_addon": "You blend spiritual wisdom with practical life coaching. Help with career, relationships, life transitions, and personal growth. Be grounded, actionable, and empowering."
    },
    "shadow": {
        "name": "Shadow Work",
        "color": "#6366F1",
        "desc": "Explore and integrate your shadow self",
        "system_addon": "You are skilled in Jungian shadow work, inner child healing, and depth psychology blended with spiritual understanding. Guide the seeker gently but honestly through their shadow aspects with compassion and courage."
    },
    "manifestation": {
        "name": "Manifestation",
        "color": "#FCD34D",
        "desc": "Align with abundance and co-create your reality",
        "system_addon": "You teach manifestation through the lens of energy, vibration, and spiritual alignment — not just positive thinking. Draw from hermetic principles, quantum consciousness, and ancient abundance teachings."
    },
    "healing": {
        "name": "Healing Guide",
        "color": "#EF4444",
        "desc": "Emotional and energetic healing support",
        "system_addon": "You specialize in emotional healing, trauma release, grief processing, and energetic restoration. Recommend specific healing modalities (reiki, acupressure points, herbs, essential oils, elixirs) based on their needs."
    },
    "dream_oracle": {
        "name": "Dream Oracle",
        "color": "#818CF8",
        "desc": "Deep dream analysis through your cosmic lens",
        "system_addon": "You are an expert dream interpreter, weaving Jungian depth psychology, shamanic dreamwork, and spiritual symbolism. You analyze dreams through the seeker's unique cosmic profile — their aura color, moon phase at the time of dreaming, numerology life path, and birth card. Every symbol in their dream is read through these personal lenses for deeply relevant insight."
    },
}


def _build_system_prompt(profile, mode_key):
    mode = COACHING_MODES.get(mode_key, COACHING_MODES["spiritual"])

    # Build rich context from profile
    ctx_parts = []
    if profile.get("dominant_mood"):
        ctx_parts.append(f"Their recent dominant mood is '{profile['dominant_mood']}' with average intensity {profile.get('avg_intensity', 5)}/10.")
    if profile.get("recent_moods"):
        ctx_parts.append(f"Recent mood pattern: {', '.join(profile['recent_moods'][:5])}.")
    if profile.get("streak"):
        ctx_parts.append(f"They have a {profile['streak']}-day practice streak.")
    if profile.get("experience_level"):
        ctx_parts.append(f"Experience level: {profile['experience_level']}.")
    if profile.get("birth_card"):
        ctx_parts.append(f"Their birth card (Sacred Cardology): {profile['birth_card']}.")
    if profile.get("mayan_sign"):
        ctx_parts.append(f"Mayan day sign: {profile['mayan_sign']}.")
    if profile.get("life_path"):
        ctx_parts.append(f"Numerology life path: {profile['life_path']}.")
    if profile.get("aura_color"):
        ctx_parts.append(f"Aura color: {profile['aura_color']}.")
    if profile.get("fav_oils"):
        ctx_parts.append(f"Favorite essential oils: {', '.join(profile['fav_oils'][:5])}.")
    if profile.get("fav_herbs"):
        ctx_parts.append(f"Herbs in their cabinet: {', '.join(profile['fav_herbs'][:5])}.")
    if profile.get("yoga_sessions", 0) > 0:
        ctx_parts.append(f"They've completed {profile['yoga_sessions']} yoga sessions.")
    if profile.get("meditation_count", 0) > 0:
        ctx_parts.append(f"They've meditated {profile['meditation_count']} times.")
    if profile.get("reiki_sessions", 0) > 0:
        ctx_parts.append(f"They've done {profile['reiki_sessions']} reiki sessions.")
    if profile.get("journal_count", 0) > 0:
        ctx_parts.append(f"They've written {profile['journal_count']} journal entries.")
    if profile.get("dreams_count", 0) > 0:
        ctx_parts.append(f"They've logged {profile['dreams_count']} dreams.")

    user_context = " ".join(ctx_parts) if ctx_parts else "This is a new seeker. Be warm and welcoming."

    return f"""You are a wise, deeply compassionate AI spiritual and life coach within The Cosmic Collective — an immersive wellness platform. Your name is Sage.

CORE IDENTITY:
- You are warm, wise, and genuinely caring — never preachy or condescending
- You speak with clarity, depth, and occasional poetic beauty
- You honor ALL spiritual traditions equally — you are eclectic and non-dogmatic
- You give specific, actionable guidance — not vague platitudes
- When appropriate, recommend specific practices from the platform: yoga styles, essential oils, herbs, elixirs, acupressure points, reiki positions, breathing techniques, mantras, meditations, journal prompts
- You are aware of quantum consciousness concepts and can reference them naturally when they illuminate a point, but you don't force them into every response

MODE: {mode['name']}
{mode['system_addon']}
{get_quantum_coaching_addon(mode_key)}

ABOUT THIS SEEKER:
{user_context}

GUIDELINES:
- Keep responses focused and meaningful (2-4 paragraphs unless they ask for more)
- Ask follow-up questions to deepen the conversation
- Reference their personal data naturally (moods, practices, birth data) when relevant
- Suggest specific platform features when it makes sense (e.g., "Try the LV3 acupressure point for that stagnant energy" or "Golden Milk would be perfect for your evening tonight")
- If quantum concepts naturally fit the conversation, weave them in — but don't shoehorn them
- Be honest, even when it's uncomfortable — but always compassionate
- If they share something heavy, hold space first before offering solutions
- Use their spiritual language — mirror their level of understanding"""


async def _get_user_profile(uid):
    """Gather user data for personalization."""
    results = await asyncio.gather(
        db.moods.find({"user_id": uid}, {"_id": 0, "mood": 1, "intensity": 1}).sort("created_at", -1).to_list(20),
        db.journal.count_documents({"user_id": uid}),
        db.yoga_sessions.count_documents({"user_id": uid}),
        db.custom_meditations.count_documents({"user_id": uid}),
        db.dreams.count_documents({"user_id": uid}),
        db.aroma_favorites.find({"user_id": uid}, {"_id": 0, "oil_id": 1}).to_list(10),
        db.herb_cabinet.find({"user_id": uid}, {"_id": 0, "herb_id": 1}).to_list(10),
        db.streaks.find_one({"user_id": uid}, {"_id": 0}),
        db.reiki_sessions.count_documents({"user_id": uid}),
        db.acupressure_sessions.count_documents({"user_id": uid}),
        db.aura_readings.find_one({"user_id": uid}, {"_id": 0, "aura_color": 1}, sort=[("created_at", -1)]),
    )
    mood_docs, journal_ct, yoga_ct, med_ct, dreams_ct, oils, herbs, streak_doc, reiki_ct, acu_ct, aura_doc = results
    moods = [m.get("mood", "") for m in mood_docs]
    avg_int = sum(m.get("intensity", 5) for m in mood_docs) / len(mood_docs) if mood_docs else 5
    dominant = max(set(moods), key=moods.count) if moods else "neutral"
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0

    return {
        "dominant_mood": dominant,
        "recent_moods": moods[:5],
        "avg_intensity": round(avg_int, 1),
        "journal_count": journal_ct,
        "yoga_sessions": yoga_ct,
        "meditation_count": med_ct,
        "dreams_count": dreams_ct,
        "fav_oils": [o.get("oil_id", "") for o in oils],
        "fav_herbs": [h.get("herb_id", "") for h in herbs],
        "streak": streak,
        "reiki_sessions": reiki_ct,
        "acupressure_sessions": acu_ct,
        "aura_color": aura_doc.get("aura_color", "") if aura_doc else "",
        "experience_level": "beginner" if streak < 7 else ("intermediate" if streak < 30 else "advanced"),
    }


@router.get("/coach/modes")
async def get_modes():
    return {"modes": [{**v, "id": k} for k, v in COACHING_MODES.items()]}


@router.post("/coach/sessions")
async def create_session(data: dict = Body(...), user=Depends(get_current_user)):
    mode = data.get("mode", "spiritual")
    session_id = str(uuid.uuid4())
    doc = {
        "id": session_id,
        "user_id": user["id"],
        "mode": mode,
        "messages": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.coach_sessions.insert_one(doc)
    return {"session_id": session_id, "mode": mode}


@router.get("/coach/sessions")
async def get_sessions(user=Depends(get_current_user)):
    sessions = await db.coach_sessions.find(
        {"user_id": user["id"]}, {"_id": 0, "id": 1, "mode": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(30)
    # Add preview (last message snippet)
    for s in sessions:
        full = await db.coach_sessions.find_one({"id": s["id"]}, {"_id": 0, "messages": 1})
        msgs = full.get("messages", []) if full else []
        s["message_count"] = len(msgs)
        s["preview"] = msgs[-1].get("text", "")[:80] if msgs else ""
    return {"sessions": sessions}


@router.get("/coach/sessions/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    session = await db.coach_sessions.find_one(
        {"id": session_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/coach/chat")
async def chat(data: dict = Body(...), user=Depends(get_current_user)):
    session_id = data.get("session_id")
    message = data.get("message", "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message required")

    session = await db.coach_sessions.find_one(
        {"id": session_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    mode = session.get("mode", "spiritual")
    messages = session.get("messages", [])

    # Build profile for personalization
    profile = await _get_user_profile(user["id"])
    system_prompt = _build_system_prompt(profile, mode)

    # Build chat with history context in system message
    try:
        # Include recent conversation in system prompt for context
        history_text = ""
        if messages:
            recent = messages[-8:]  # Last 8 messages for context
            history_parts = []
            for msg in recent:
                role = "Seeker" if msg["role"] == "user" else "Sage"
                history_parts.append(f"{role}: {msg['text']}")
            history_text = "\n\nPREVIOUS CONVERSATION:\n" + "\n".join(history_parts)

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"coach-{session_id}-{uuid.uuid4().hex[:8]}",
            system_message=system_prompt + history_text,
        )

        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=message)),
            timeout=45
        )
        reply = response
    except Exception as e:
        logger.error(f"Coach chat error: {e}")
        reply = "I sense a momentary disruption in our connection. Please try sharing your thoughts again — I'm here for you."

    # Save messages
    now = datetime.now(timezone.utc).isoformat()
    user_msg = {"role": "user", "text": message, "timestamp": now}
    assistant_msg = {"role": "assistant", "text": reply, "timestamp": now}

    await db.coach_sessions.update_one(
        {"id": session_id},
        {"$push": {"messages": {"$each": [user_msg, assistant_msg]}},
         "$set": {"updated_at": now}}
    )

    return {"reply": reply, "session_id": session_id}


@router.delete("/coach/sessions/{session_id}")
async def delete_session(session_id: str, user=Depends(get_current_user)):
    await db.coach_sessions.delete_one({"id": session_id, "user_id": user["id"]})
    return {"status": "deleted"}


@router.get("/coach/dreams")
async def get_user_dreams_for_coach(user=Depends(get_current_user)):
    """Get user's recent dreams for the dream oracle picker."""
    dreams = await db.dreams.find(
        {"user_id": user["id"]}, {"_id": 0, "id": 1, "title": 1, "content": 1, "mood": 1, "moon_phase": 1, "vividness": 1, "lucid": 1, "symbols": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(30)
    return {"dreams": dreams}


@router.post("/coach/analyze-dream")
async def analyze_dream(data: dict = Body(...), user=Depends(get_current_user)):
    """Deep AI dream analysis cross-referenced with user's cosmic profile."""
    dream_id = data.get("dream_id")
    session_id = data.get("session_id")

    if not dream_id or not session_id:
        raise HTTPException(status_code=400, detail="dream_id and session_id required")

    # Fetch dream
    dream = await db.dreams.find_one({"id": dream_id, "user_id": user["id"]}, {"_id": 0})
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")

    # Verify session
    session = await db.coach_sessions.find_one({"id": session_id, "user_id": user["id"]}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Gather cosmic profile data in parallel
    profile, aura_doc, numerology_doc, cardology_doc = await asyncio.gather(
        _get_user_profile(user["id"]),
        db.aura_readings.find_one({"user_id": user["id"]}, {"_id": 0}, sort=[("created_at", -1)]),
        db.profiles.find_one({"user_id": user["id"]}, {"_id": 0, "life_path": 1, "birth_date": 1}),
        db.profiles.find_one({"user_id": user["id"]}, {"_id": 0, "birth_card": 1}),
    )

    # Build cosmic context
    cosmic_parts = []
    aura_color = aura_doc.get("aura_color", "") if aura_doc else ""
    if aura_color:
        cosmic_parts.append(f"AURA COLOR: {aura_color} — this colors the emotional and energetic lens through which their dream should be interpreted.")
    moon_phase = dream.get("moon_phase", "")
    if moon_phase:
        cosmic_parts.append(f"MOON PHASE when dreamed: {moon_phase} — this affects the dream's intensity and symbolic depth.")
    life_path = numerology_doc.get("life_path", "") if numerology_doc else ""
    if life_path:
        cosmic_parts.append(f"NUMEROLOGY LIFE PATH: {life_path} — this reveals the soul's core lessons and how they manifest in dreamscape.")
    birth_card = cardology_doc.get("birth_card", "") if cardology_doc else ""
    if birth_card:
        cosmic_parts.append(f"BIRTH CARD (Sacred Cardology): {birth_card} — this card's energy shapes the archetypal patterns in their dreams.")

    cosmic_context = "\n".join(cosmic_parts) if cosmic_parts else "No cosmic profile data available yet — provide a universal interpretation."

    # Build the dream analysis prompt
    dream_text = f"""DREAM TITLE: {dream.get('title', 'Untitled')}
DREAM CONTENT: {dream.get('content', '')}
DREAM MOOD: {dream.get('mood', 'unknown')}
VIVIDNESS: {dream.get('vividness', 5)}/10
LUCID: {'Yes' if dream.get('lucid') else 'No'}
SYMBOLS DETECTED: {', '.join(dream.get('symbols', [])) if dream.get('symbols') else 'None detected'}
DATE: {dream.get('created_at', 'Unknown')}"""

    system_prompt = f"""You are the Dream Oracle within The Cosmic Collective — a deeply wise interpreter of dreams who weaves together Jungian depth psychology, shamanic dreamwork, archetypal mythology, and the seeker's personal cosmic signature.

{COACHING_MODES['dream_oracle']['system_addon']}
{get_quantum_coaching_addon('dream_oracle')}

SEEKER'S COSMIC PROFILE:
{cosmic_context}

SEEKER'S WELLNESS DATA:
- Dominant mood: {profile.get('dominant_mood', 'neutral')}
- Practice streak: {profile.get('streak', 0)} days
- Experience level: {profile.get('experience_level', 'beginner')}
- Total dreams logged: {profile.get('dreams_count', 0)}

ANALYSIS GUIDELINES:
1. COSMIC MIRROR — Show how the dream reflects their aura color's energy and current moon phase influence
2. KEY SYMBOLS — Identify 3-5 major symbols with layered meanings (personal, collective unconscious, spiritual)
3. NUMEROLOGICAL THREAD — Connect dream themes to their life path number's lessons
4. SHADOW WHISPER — What the dream reveals about their unconscious/shadow self
5. SOUL MESSAGE — The higher self's communication through this dream
6. PRACTICAL ORACLE — Specific, actionable guidance for waking life (suggest platform practices: specific yoga flows, essential oils, herbs, meditation types, acupressure points, or journal prompts)

Be poetic, wise, and deeply personal. This is not a generic interpretation — it's THEIR dream through THEIR cosmic lens. Address them directly in second person."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"dream-oracle-{session_id}-{uuid.uuid4().hex[:8]}",
            system_message=system_prompt,
        )
        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=f"Please provide a deep cosmic interpretation of this dream:\n\n{dream_text}")),
            timeout=60
        )
        reply = response
    except Exception as e:
        logger.error(f"Dream analysis error: {e}")
        reply = "The dream veil is thick at this moment. I sense the symbols stirring but cannot fully reach them. Please try again — your dream holds important messages."

    # Save to session
    now = datetime.now(timezone.utc).isoformat()
    dream_context_msg = {"role": "system_context", "text": f"[Dream Selected: \"{dream.get('title', 'Untitled')}\"] {dream.get('content', '')[:200]}...", "timestamp": now, "dream_id": dream_id}
    assistant_msg = {"role": "assistant", "text": reply, "timestamp": now}

    await db.coach_sessions.update_one(
        {"id": session_id},
        {"$push": {"messages": {"$each": [dream_context_msg, assistant_msg]}},
         "$set": {"updated_at": now, "dream_id": dream_id}}
    )

    return {
        "reply": reply,
        "session_id": session_id,
        "dream": {
            "title": dream.get("title", "Untitled"),
            "mood": dream.get("mood", ""),
            "moon_phase": moon_phase,
        },
        "cosmic_profile": {
            "aura_color": aura_color,
            "life_path": life_path,
            "birth_card": birth_card,
            "moon_phase": moon_phase,
        }
    }



@router.post("/coach/voice-chat")
async def voice_chat(
    audio: UploadFile = File(...),
    session_id: str = Form(...),
    user=Depends(get_current_user),
):
    """Voice conversation: transcribe user audio, get AI reply, return TTS audio."""
    # Validate session
    session = await db.coach_sessions.find_one(
        {"id": session_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save uploaded audio to temp file for Whisper
    tmp_path = None
    try:
        content = await audio.read()
        suffix = ".webm"
        if audio.filename:
            ext = os.path.splitext(audio.filename)[1]
            if ext in (".mp3", ".wav", ".m4a", ".mp4", ".webm", ".ogg", ".mpeg"):
                suffix = ext
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix)
        os.close(tmp_fd)
        with open(tmp_path, "wb") as f:
            f.write(content)

        # Transcribe with Whisper
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        with open(tmp_path, "rb") as audio_file:
            stt_response = await stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="json",
                language="en",
            )
        transcribed_text = stt_response.text.strip()
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise HTTPException(status_code=500, detail="Failed to transcribe audio")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    if not transcribed_text:
        raise HTTPException(status_code=400, detail="Could not understand audio")

    # Get AI response (reuse existing chat logic)
    mode = session.get("mode", "spiritual")
    messages = session.get("messages", [])
    profile = await _get_user_profile(user["id"])
    system_prompt = _build_system_prompt(profile, mode)

    try:
        history_text = ""
        if messages:
            recent = messages[-8:]
            history_parts = []
            for msg in recent:
                role = "Seeker" if msg["role"] == "user" else "Sage"
                history_parts.append(f"{role}: {msg['text']}")
            history_text = "\n\nPREVIOUS CONVERSATION:\n" + "\n".join(history_parts)

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"coach-voice-{session_id}-{uuid.uuid4().hex[:8]}",
            system_message=system_prompt + history_text,
        )
        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=transcribed_text)),
            timeout=45,
        )
        reply = response
    except Exception as e:
        logger.error(f"Coach voice chat LLM error: {e}")
        reply = "I sense a momentary disruption in our connection. Please try sharing your thoughts again."

    # Generate TTS audio for the reply
    audio_b64 = None
    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        # Truncate to 4096 chars for TTS limit
        tts_text = reply[:4096] if len(reply) > 4096 else reply
        audio_b64 = await tts.generate_speech_base64(
            text=tts_text,
            model="tts-1",
            voice="sage",
            response_format="mp3",
        )
    except Exception as e:
        logger.error(f"TTS error: {e}")
        # Non-fatal: return text reply even if TTS fails

    # Save messages to session
    now = datetime.now(timezone.utc).isoformat()
    user_msg = {"role": "user", "text": transcribed_text, "timestamp": now, "voice": True}
    assistant_msg = {"role": "assistant", "text": reply, "timestamp": now, "voice": True}

    await db.coach_sessions.update_one(
        {"id": session_id},
        {
            "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
            "$set": {"updated_at": now},
        },
    )

    return {
        "reply": reply,
        "transcribed_text": transcribed_text,
        "audio_base64": audio_b64,
        "session_id": session_id,
    }
