from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid
import asyncio

router = APIRouter(prefix="/gemini")

SYSTEM_PROMPT = """You are Cosmos, a wise and warm AI companion within The ENLIGHTEN.MINT.CAFE — an immersive wellness and spiritual growth platform.

CORE IDENTITY:
- You are friendly, insightful, and gently mystical
- You can help with anything: wellness questions, spiritual guidance, app navigation, translation, general knowledge
- You honor all spiritual traditions equally and are non-dogmatic
- You give specific, actionable answers — not vague platitudes
- You can translate text between languages when asked
- You're aware of the app's features: meditation, yoga, breathing exercises, mood tracking, journaling, sound healing frequencies, oracle/divination, star charts, sacred texts, trade circle, crystals, and more
- Keep responses concise (1-3 paragraphs) unless the user asks for more detail
- Use occasional poetic language but stay grounded and practical
- If asked about something outside your knowledge, be honest about it

TRANSLATION CAPABILITIES:
- When a user asks to translate something, provide the translation directly
- Support all major languages
- Maintain spiritual/wellness tone in translations

GUIDELINES:
- Be conversational and warm, not robotic
- Ask follow-up questions when appropriate
- Suggest relevant app features when they naturally fit the conversation
- Never be preachy or condescending"""


@router.post("/chat")
async def gemini_chat(data: dict = Body(...), user=Depends(get_current_user)):
    """Conversational AI chat powered by Gemini 3 Flash."""
    session_id = data.get("session_id")
    message = data.get("message", "").strip()
    page_context = data.get("page_context")

    if not message:
        raise HTTPException(400, "Message required")

    # Create or get session
    if not session_id:
        session_id = str(uuid.uuid4())
        await db.gemini_sessions.insert_one({
            "id": session_id,
            "user_id": user["id"],
            "messages": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        messages = []
    else:
        session = await db.gemini_sessions.find_one(
            {"id": session_id, "user_id": user["id"]}, {"_id": 0}
        )
        if not session:
            raise HTTPException(404, "Session not found")
        messages = session.get("messages", [])

    # Build conversation history for context
    history_text = ""
    if messages:
        recent = messages[-10:]
        parts = []
        for msg in recent:
            role = "User" if msg["role"] == "user" else "Cosmos"
            parts.append(f"{role}: {msg['text']}")
        history_text = "\n\nCONVERSATION HISTORY:\n" + "\n".join(parts)

    # Build page context awareness
    page_awareness = ""
    if page_context and isinstance(page_context, dict):
        area = page_context.get("area", "")
        hint = page_context.get("hint", "")
        if area:
            page_awareness = f"\n\nCURRENT PAGE CONTEXT: The user is currently on the {area} page ({hint}). Tailor your response to be relevant to what they're viewing. If their question relates to this page, give specific guidance about features available here."

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gemini-{session_id}-{uuid.uuid4().hex[:6]}",
            system_message=SYSTEM_PROMPT + page_awareness + history_text,
        )
        chat.with_model("gemini", "gemini-3-flash-preview")

        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=message)),
            timeout=30
        )
        reply = response.strip()
    except Exception as e:
        logger.error(f"Gemini chat error: {e}")
        reply = "The cosmic connection wavered for a moment. Could you try again?"

    # Save messages
    now = datetime.now(timezone.utc).isoformat()
    user_msg = {"role": "user", "text": message, "timestamp": now}
    assistant_msg = {"role": "assistant", "text": reply, "timestamp": now}

    await db.gemini_sessions.update_one(
        {"id": session_id},
        {
            "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
            "$set": {"updated_at": now},
        }
    )

    return {"reply": reply, "session_id": session_id}


@router.get("/sessions")
async def get_sessions(user=Depends(get_current_user)):
    """Get user's Gemini chat sessions."""
    sessions = await db.gemini_sessions.find(
        {"user_id": user["id"]},
        {"_id": 0, "id": 1, "created_at": 1, "updated_at": 1, "messages": {"$slice": -1}}
    ).sort("updated_at", -1).to_list(20)

    result = []
    for s in sessions:
        msgs = s.get("messages", [])
        result.append({
            "id": s["id"],
            "created_at": s["created_at"],
            "updated_at": s["updated_at"],
            "preview": msgs[-1]["text"][:60] if msgs else "",
        })
    return result


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    """Get a single session with full message history."""
    session = await db.gemini_sessions.find_one(
        {"id": session_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user=Depends(get_current_user)):
    await db.gemini_sessions.delete_one({"id": session_id, "user_id": user["id"]})
    return {"status": "deleted"}


@router.post("/translate")
async def gemini_translate(data: dict = Body(...), user=Depends(get_current_user_optional)):
    """Quick translation via Gemini — available to all users."""
    text = data.get("text", "").strip()
    target_lang = data.get("target_lang", "es")
    source_lang = data.get("source_lang", "auto")

    if not text:
        raise HTTPException(400, "No text provided")

    # Check cache (SHA-256)
    from engines.crystal_seal import secure_hash_short
    cache_key = secure_hash_short(f"{text}:{target_lang}:{source_lang}", 32)
    cached = await db.gemini_translations.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached:
        return {"translated": cached["translated"], "target_lang": target_lang, "cached": True}

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        lang_prompt = f"from {source_lang}" if source_lang != "auto" else ""
        prompt = f"""Translate the following text {lang_prompt} to {target_lang}. 
Only return the translated text, nothing else. Maintain the original tone and formatting.

{text}"""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"translate-{cache_key[:8]}",
            system_message="You are a professional translator. Only return translated text, no explanations.",
        )
        chat.with_model("gemini", "gemini-3-flash-preview")

        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)),
            timeout=20
        )
        translated = response.strip()
    except Exception as e:
        logger.error(f"Gemini translate error: {e}")
        raise HTTPException(500, "Translation failed")

    # Cache result
    await db.gemini_translations.insert_one({
        "cache_key": cache_key,
        "original": text,
        "translated": translated,
        "target_lang": target_lang,
        "source_lang": source_lang,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"translated": translated, "target_lang": target_lang, "cached": False}
