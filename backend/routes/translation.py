from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY
from routes.subscriptions import get_user_credits, tier_level, deduct_credits
from datetime import datetime, timezone
import hashlib

router = APIRouter()

SUPPORTED_LANGUAGES = {
    "es": "Spanish", "fr": "French", "hi": "Hindi",
    "ja": "Japanese", "ar": "Arabic", "pt": "Portuguese",
}


@router.post("/translate")
async def translate_content(body: dict = Body(...), user=Depends(get_current_user)):
    """AI-powered dynamic content translation (Premium feature).
    Caches translations to avoid repeat costs.
    """
    text = body.get("text", "")
    target_lang = body.get("target_lang", "es")
    context = body.get("context", "general")

    if not text:
        raise HTTPException(400, "No text provided")
    if target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(400, f"Unsupported language: {target_lang}")
    if target_lang == "en":
        return {"translated": text, "source_lang": "en", "target_lang": "en", "cached": True}

    # Check tier gate
    credits = await get_user_credits(user["id"])
    user_tier = credits.get("tier", "free")
    user_level = tier_level(user_tier)
    plus_level = tier_level("plus")

    if user_level < plus_level and not credits.get("is_admin"):
        raise HTTPException(403, detail={
            "message": "AI Translation requires Plus tier or higher",
            "required_tier": "plus",
            "current_tier": user_tier,
        })

    # Check cache first
    cache_key = hashlib.md5(f"{text}:{target_lang}:{context}".encode()).hexdigest()
    cached = await db.translation_cache.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached:
        return {
            "translated": cached["translated"],
            "source_lang": "en",
            "target_lang": target_lang,
            "cached": True,
        }

    # Deduct credits
    deduction = await deduct_credits(user["id"], "text_generation")
    if not deduction["allowed"]:
        raise HTTPException(402, detail={
            "message": "Insufficient credits",
            "remaining": deduction["remaining"],
        })

    # AI Translation
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    lang_name = SUPPORTED_LANGUAGES[target_lang]
    prompt = f"""Translate the following {context} content to {lang_name}. 
Keep the spiritual/wellness tone. Preserve any formatting, line breaks, and special characters.
Only return the translated text, nothing else.

Text to translate:
{text}"""

    llm = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"translate-{cache_key[:8]}",
        system_message="You are a professional translator specializing in spiritual and wellness content."
    )
    response = await llm.send_message(UserMessage(text=prompt))
    translated = response.strip()

    # Cache the result
    await db.translation_cache.insert_one({
        "cache_key": cache_key,
        "original": text,
        "translated": translated,
        "target_lang": target_lang,
        "context": context,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "translated": translated,
        "source_lang": "en",
        "target_lang": target_lang,
        "cached": False,
        "remaining_credits": deduction.get("remaining"),
    }
