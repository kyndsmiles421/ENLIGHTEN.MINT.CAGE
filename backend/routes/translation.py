"""
translation.py — PUBLIC translator (V68.85 reconciliation header)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════════════════════════════════════════════════════════════════╗
║  TWO TRANSLATORS — DO NOT MERGE, DO NOT DUPLICATE                ║
╠══════════════════════════════════════════════════════════════════╣
║  THIS FILE   → POST /api/translate                               ║
║                Plus-tier+ users · per-translation credit cost    ║
║                · SHA-256 cached translations · gemini-3-flash    ║
║                · audience: paying public, hi-volume general use  ║
║                                                                  ║
║  routes/translator.py → POST /api/translator/translate           ║
║                Owner / Sovereign-tier · sacred-mode etymology    ║
║                · NO cache · gpt-4o-mini · audience: ELIT path    ║
║                                                                  ║
║  Both share SUPPORTED_LANGUAGES set so a language added here     ║
║  is automatically supported there. See V68.85 commit.            ║
╚══════════════════════════════════════════════════════════════════╝
"""
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY
from routes.subscriptions import get_user_credits, tier_level, deduct_credits
from engines.crystal_seal import secure_hash_short
from datetime import datetime, timezone

router = APIRouter()

# V68.85 — Unified language set across BOTH translator endpoints.
# Hawaiian, Mandarin, Cantonese, and Urdu added so paid users get the
# same coverage as the sovereign owner-tier translator.
SUPPORTED_LANGUAGES = {
    "haw": "Hawaiian (ʻŌlelo Hawaiʻi)",
    "zh":  "Chinese (Mandarin)",
    "yue": "Chinese (Cantonese)",
    "es":  "Spanish",
    "fr":  "French",
    "hi":  "Hindi",
    "ur":  "Urdu",
    "ja":  "Japanese",
    "ar":  "Arabic",
    "pt":  "Portuguese",
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

    # Check cache first (SHA-256)
    cache_key = secure_hash_short(f"{text}:{target_lang}:{context}", 32)
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
    llm.with_model("gemini", "gemini-3-flash-preview")
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
