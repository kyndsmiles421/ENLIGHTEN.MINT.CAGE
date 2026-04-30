"""
translator.py — Universal Translator Middleware (V68.84)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Multi-denominational spiritual exploration cuts across language. This
endpoint translates ad-hoc text (verses, generator output, UI strings)
into a target language while preserving the spiritual / traditional
framing of the source. Powered by the Emergent LLM Key — no separate
translation API, no per-language SDK.

Tier policy:
  • All tiers       → text translation across the supported set.
  • Sovereign tier  → "sacred-language nuance" mode: the model also
                       returns the original tradition's key term
                       (Sanskrit/Greek/Hebrew/Hawaiian/etc.) and a
                       brief contextual note, used by the Bible /
                       Sacred Texts engines to teach as it translates.

Hawaiian (haw / ʻŌlelo Hawaiʻi) is supported as a first-class language
to honor the Aloha framing.
"""
import asyncio
from fastapi import APIRouter, Body, Depends, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

router = APIRouter()


SUPPORTED_LANGS = {
    "en":  "English",
    "haw": "Hawaiian (ʻŌlelo Hawaiʻi)",
    "zh":  "Chinese (Mandarin)",
    "es":  "Spanish",
    "fr":  "French",
    "hi":  "Hindi",
    "ja":  "Japanese",
    "ar":  "Arabic",
    "pt":  "Portuguese",
}


# Voice / Translation tier feature matrix. Single source of truth that
# both the backend (entitlement check) and the frontend (UI gating)
# consume via /api/voice/tier-features.
TIER_FEATURE_MATRIX = {
    # Free tier — basic accessibility for everyone.
    "discovery": {
        "voice_modes":          ["tactile", "narrative"],
        "tts_quality":          "browser",
        "translation_text":     True,
        "translation_voice":    False,
        "sacred_language_mode": False,
        "stt_listening":        False,
    },
    # Tier 1 / Silver — practitioners.
    "resonance": {
        "voice_modes":          ["tactile", "narrative", "interactive"],
        "tts_quality":          "browser",
        "translation_text":     True,
        "translation_voice":    False,
        "sacred_language_mode": False,
        "stt_listening":        True,
    },
    # Tier 2 / Gold — architects.
    "architect": {
        "voice_modes":          ["tactile", "narrative", "interactive"],
        "tts_quality":          "high",
        "translation_text":     True,
        "translation_voice":    True,
        "sacred_language_mode": False,
        "stt_listening":        True,
    },
    # Tier 3 / Gilded / Sovereign — peak.
    "sovereign": {
        "voice_modes":          ["tactile", "narrative", "interactive"],
        "tts_quality":          "high",
        "translation_text":     True,
        "translation_voice":    True,
        "sacred_language_mode": True,
        "stt_listening":        True,
    },
}


async def _resolve_tier(user: dict) -> str:
    """Look up the user's gilded_tier, falling back to discovery for
    unknown values so we never deny free users their basic features."""
    doc = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "gilded_tier": 1, "is_owner": 1},
    ) or {}
    if doc.get("is_owner"):
        return "sovereign"
    tier = doc.get("gilded_tier", "discovery")
    return tier if tier in TIER_FEATURE_MATRIX else "discovery"


@router.get("/voice/tier-features")
async def voice_tier_features(user=Depends(get_current_user)):
    """Return the user's voice + translation entitlements. The frontend
    uses this to render the Tactile / Narrative / Interactive toggle and
    grey-out gated features (sacred-language, real-time voice)."""
    tier = await _resolve_tier(user)
    features = TIER_FEATURE_MATRIX[tier]
    # Find the next-tier locked feature to drive the upsell chip.
    tier_order = ["discovery", "resonance", "architect", "sovereign"]
    locked = []
    if tier != "sovereign":
        next_tier = tier_order[tier_order.index(tier) + 1] if tier in tier_order else None
        if next_tier:
            cur = features
            nxt = TIER_FEATURE_MATRIX[next_tier]
            for k, v in nxt.items():
                if cur.get(k) != v and v not in (False, None, []):
                    locked.append({"feature": k, "unlock_tier": next_tier})
    return {
        "tier": tier,
        "features": features,
        "supported_languages": [{"code": k, "label": v} for k, v in SUPPORTED_LANGS.items()],
        "locked_features": locked,
    }


@router.post("/translator/translate")
async def translator_translate(data: dict = Body(...), user=Depends(get_current_user)):
    """Translate ad-hoc text into a target language. Preserves the
    multi-denominational spiritual framing — the model is instructed
    NEVER to medicalize or prescribe.

    Body:
      text:        (str) source string
      target_lang: (str) one of SUPPORTED_LANGS
      sacred:      (bool, optional) sovereign-tier sacred-language mode
    """
    text = (data.get("text") or "").strip()
    target_lang = (data.get("target_lang") or "").strip().lower()
    want_sacred = bool(data.get("sacred", False))

    if not text:
        raise HTTPException(status_code=400, detail="text required")
    if target_lang not in SUPPORTED_LANGS:
        raise HTTPException(
            status_code=400,
            detail=f"target_lang must be one of {list(SUPPORTED_LANGS.keys())}",
        )
    if len(text) > 4000:
        raise HTTPException(status_code=400, detail="text too long (max 4000 chars)")

    tier = await _resolve_tier(user)
    features = TIER_FEATURE_MATRIX[tier]

    # English passthrough — no LLM call needed.
    if target_lang == "en" and not want_sacred:
        return {
            "translation": text,
            "target_lang": "en",
            "sacred_mode": False,
            "tier": tier,
        }

    # Sacred-language mode is a Sovereign-only feature.
    sacred_mode = want_sacred and features.get("sacred_language_mode", False)

    sovereign_framing = (
        "You are the Universal Translator inside ENLIGHTEN.MINT.CAFE — a "
        "multi-denominational spiritual exploration and personal sovereignty "
        "instrument. Always preserve the spiritual / traditional / philosophical "
        "framing of the source. Never medicalize, prescribe, or diagnose. "
        "Honor every tradition equally."
    )

    if sacred_mode:
        instruction = (
            f"{sovereign_framing}\n\n"
            f"Translate the following text into {SUPPORTED_LANGS[target_lang]}. "
            "Then, on a new line starting with 'SACRED:', identify the most important "
            "key term in the source and provide its original-tradition root "
            "(Sanskrit / Hebrew / Greek / Arabic / Hawaiian / Latin etc.) plus a "
            "1-sentence contextual note. Output exactly:\n"
            "TRANSLATION:\n<translated text>\n\nSACRED:\n<root term — note>"
        )
    else:
        instruction = (
            f"{sovereign_framing}\n\n"
            f"Translate the following text into {SUPPORTED_LANGS[target_lang]}. "
            "Output ONLY the translated text — no preamble, no quotes, no notes."
        )

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"translator-{user['id']}-{uuid.uuid4().hex[:8]}",
            system_message=instruction,
        )
        chat.with_model("openai", "gpt-4o-mini")
        result = await asyncio.wait_for(
            chat.send_message(UserMessage(text=text)),
            timeout=30,
        )
        out = result.strip() if isinstance(result, str) else str(result)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Translation timed out")
    except Exception as e:
        logger.error(f"translator error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed")

    sacred_note = None
    translation = out
    if sacred_mode and "SACRED:" in out:
        parts = out.split("SACRED:", 1)
        translation = parts[0].replace("TRANSLATION:", "").strip()
        sacred_note = parts[1].strip()

    return {
        "translation": translation,
        "target_lang": target_lang,
        "sacred_mode": sacred_mode,
        "sacred_note": sacred_note,
        "tier": tier,
    }
