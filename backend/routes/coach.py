from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone
import uuid
import asyncio

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

MODE: {mode['name']}
{mode['system_addon']}

ABOUT THIS SEEKER:
{user_context}

GUIDELINES:
- Keep responses focused and meaningful (2-4 paragraphs unless they ask for more)
- Ask follow-up questions to deepen the conversation
- Reference their personal data naturally (moods, practices, birth data) when relevant
- Suggest specific platform features when it makes sense (e.g., "Try the LV3 acupressure point for that stagnant energy" or "Golden Milk would be perfect for your evening tonight")
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
