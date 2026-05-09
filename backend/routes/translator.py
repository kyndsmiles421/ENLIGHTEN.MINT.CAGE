"""
translator.py — SOVEREIGN translator (V68.84 + V68.85 reconciliation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════════════════════════════════════════════════════════════════╗
║  TWO TRANSLATORS — DO NOT MERGE, DO NOT DUPLICATE                ║
╠══════════════════════════════════════════════════════════════════╣
║  THIS FILE   → POST /api/translator/translate                    ║
║                Sovereign-tier extras: sacred-mode etymology,     ║
║                multi-denominational sovereign framing,           ║
║                NO credit cost for owner. gpt-4o-mini.            ║
║                                                                  ║
║  routes/translation.py → POST /api/translate                     ║
║                Plus-tier+ public path. SHA-256 cached.           ║
║                Per-translation credit cost. gemini-3-flash.      ║
║                                                                  ║
║  Both share the same SUPPORTED_LANGS set (V68.85).               ║
╚══════════════════════════════════════════════════════════════════╝

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

Hawaiian (haw / ʻŌlelo Hawaiʻi), Mandarin (zh), Cantonese (yue), and
Urdu (ur, RTL) are first-class languages.
"""
import asyncio
import hashlib
import json as _json
from fastapi import APIRouter, Body, Depends, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

router = APIRouter()


def _cache_key(text: str, target_lang: str, sacred: bool) -> str:
    """Deterministic cache key. SHA-256 over (text|target|sacred)."""
    raw = f"{target_lang}|{int(bool(sacred))}|{text}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


# V68.85 — Single source of truth for both translator endpoints.
# Mirrored in routes/translation.py::SUPPORTED_LANGUAGES.
SUPPORTED_LANGS = {
    "en":  "English",
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
    unknown values so we never deny free users their basic features.
    V1.1.24 — Owner / admin / creator accounts always resolve to
    sovereign so the app owner is never tier-gated on their own app."""
    doc = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "gilded_tier": 1, "is_owner": 1, "is_admin": 1, "role": 1, "tier": 1},
    ) or {}
    if (
        doc.get("is_owner")
        or doc.get("is_admin")
        or (doc.get("role") or "").lower() in ("admin", "owner", "creator")
        or (doc.get("tier") or "").lower() in ("creator", "admin", "owner")
    ):
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

    # V1.1.21 — Server-side cache. Identical (text, target_lang, sacred)
    # tuples now return in <50ms instead of hitting gpt-4o-mini every
    # time. The page-translator was making 200 sequential calls per
    # page; once a page is fully translated for a language, every
    # subsequent visit by any user is essentially instant.
    sacred_mode = want_sacred and features.get("sacred_language_mode", False)
    ckey = _cache_key(text, target_lang, sacred_mode)
    try:
        cached = await db.translation_cache.find_one({"_cache_key": ckey}, {"_id": 0})
    except Exception:
        cached = None
    if cached and cached.get("translation"):
        return {
            "translation": cached["translation"],
            "target_lang": target_lang,
            "sacred_mode": sacred_mode,
            "sacred_note": cached.get("sacred_note"),
            "tier": tier,
            "cached": True,
        }

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

    # V1.1.21 — Persist to cache so the next caller (anyone, anywhere)
    # gets this same translation instantly.
    try:
        await db.translation_cache.update_one(
            {"_cache_key": ckey},
            {"$set": {
                "_cache_key": ckey,
                "target_lang": target_lang,
                "sacred_mode": sacred_mode,
                "translation": translation,
                "sacred_note": sacred_note,
                "text_hash_short": ckey[:12],
            }},
            upsert=True,
        )
    except Exception as cache_err:
        logger.warning(f"translation_cache upsert failed: {cache_err}")

    return {
        "translation": translation,
        "target_lang": target_lang,
        "sacred_mode": sacred_mode,
        "sacred_note": sacred_note,
        "tier": tier,
    }


@router.post("/translator/batch")
async def translator_batch(data: dict = Body(...), user=Depends(get_current_user)):
    """V1.1.21 — Batch translate up to 60 strings in ONE LLM call.
    The page-translator was making 200 sequential calls per page; this
    endpoint collapses that to a handful of batches so a full page
    translation completes in 5-10 seconds instead of 60+.

    Body:
      texts:       (list[str]) source strings (max 60)
      target_lang: (str) one of SUPPORTED_LANGS
      sacred:      (bool, optional) sovereign-tier sacred-language mode

    Returns:
      { translations: list[str] }   (1:1 alignment with input texts)
    """
    texts = data.get("texts") or []
    target_lang = (data.get("target_lang") or "").strip().lower()
    want_sacred = bool(data.get("sacred", False))

    if not isinstance(texts, list) or not texts:
        raise HTTPException(status_code=400, detail="texts (non-empty list) required")
    if len(texts) > 60:
        raise HTTPException(status_code=400, detail="max 60 texts per batch")
    if target_lang not in SUPPORTED_LANGS:
        raise HTTPException(
            status_code=400,
            detail=f"target_lang must be one of {list(SUPPORTED_LANGS.keys())}",
        )

    tier = await _resolve_tier(user)
    features = TIER_FEATURE_MATRIX[tier]
    sacred_mode = want_sacred and features.get("sacred_language_mode", False)

    # English passthrough.
    if target_lang == "en" and not sacred_mode:
        return {"translations": [str(t or "") for t in texts]}

    # Resolve every input from cache first.
    keys = [_cache_key(str(t or ""), target_lang, sacred_mode) for t in texts]
    out_translations: list = [None] * len(texts)
    try:
        cursor = db.translation_cache.find(
            {"_cache_key": {"$in": keys}},
            {"_id": 0, "_cache_key": 1, "translation": 1},
        )
        cache_map = {}
        async for doc in cursor:
            cache_map[doc["_cache_key"]] = doc.get("translation")
        for i, k in enumerate(keys):
            if k in cache_map and cache_map[k]:
                out_translations[i] = cache_map[k]
    except Exception as e:
        logger.warning(f"batch cache lookup failed: {e}")

    # Indices that still need generation.
    todo_idx = [i for i, v in enumerate(out_translations) if v is None]
    if not todo_idx:
        return {"translations": out_translations, "from_cache": len(texts)}

    todo_texts = [str(texts[i] or "") for i in todo_idx]

    sovereign_framing = (
        "You are the Universal Translator inside ENLIGHTEN.MINT.CAFE. "
        "Preserve spiritual / traditional / philosophical framing. "
        "Never medicalize or prescribe. Honor every tradition equally."
    )
    instruction = (
        f"{sovereign_framing}\n\n"
        f"Translate each of the JSON array entries below into "
        f"{SUPPORTED_LANGS[target_lang]}. Output ONLY a valid JSON "
        f"array of strings, same length and same order as the input. "
        f"No preamble, no markdown, no notes. If an entry is empty, "
        f"return an empty string in the same position."
    )
    payload = _json.dumps(todo_texts, ensure_ascii=False)

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"translator-batch-{user['id']}-{uuid.uuid4().hex[:8]}",
            system_message=instruction,
        )
        chat.with_model("openai", "gpt-4o-mini")
        result = await asyncio.wait_for(
            chat.send_message(UserMessage(text=payload)),
            timeout=45,
        )
        raw = result.strip() if isinstance(result, str) else str(result)
        # Strip code-fence wrapping if the model added one.
        if raw.startswith("```"):
            raw = raw.strip("`")
            # remove an optional 'json' tag on the first line
            nl = raw.find("\n")
            if nl != -1 and raw[:nl].strip().lower() in ("json", ""):
                raw = raw[nl + 1:]
            raw = raw.strip("` \n")
        try:
            parsed = _json.loads(raw)
        except Exception:
            # Salvage: try to find the first '[' and last ']'
            lb, rb = raw.find("["), raw.rfind("]")
            if lb != -1 and rb != -1 and rb > lb:
                parsed = _json.loads(raw[lb:rb + 1])
            else:
                raise
        if not isinstance(parsed, list):
            raise ValueError("model did not return a JSON array")
        # Right-pad / truncate to match expected length.
        while len(parsed) < len(todo_texts):
            parsed.append(todo_texts[len(parsed)])
        parsed = parsed[: len(todo_texts)]
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Batch translation timed out")
    except Exception as e:
        logger.error(f"translator_batch error: {e}")
        raise HTTPException(status_code=500, detail="Batch translation failed")

    # Place generated values + persist to cache.
    cache_writes = []
    for slot, translated in zip(todo_idx, parsed):
        s = str(translated) if translated is not None else ""
        out_translations[slot] = s
        cache_writes.append({
            "_cache_key": keys[slot],
            "target_lang": target_lang,
            "sacred_mode": sacred_mode,
            "translation": s,
            "sacred_note": None,
            "text_hash_short": keys[slot][:12],
        })
    try:
        for doc in cache_writes:
            await db.translation_cache.update_one(
                {"_cache_key": doc["_cache_key"]},
                {"$set": doc},
                upsert=True,
            )
    except Exception as cache_err:
        logger.warning(f"batch cache write failed: {cache_err}")

    return {
        "translations": out_translations,
        "from_cache": len(texts) - len(todo_idx),
        "from_llm": len(todo_idx),
    }
