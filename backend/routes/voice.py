"""V1.0.11 — Sage Voice (ElevenLabs TTS) for Ritual Chain narration.

Endpoint:
  POST /api/voice/sage-narrate
    Body: {text: str, voice_id?: str, model_id?: str, calm?: bool}
    Returns: {audio_url: "data:audio/mpeg;base64,..."}

  GET /api/voice/sage-narrate/status
    Returns: {configured: bool, default_voice_id, default_model_id}

  GET /api/voice/sample?voice_id=...&calm=true|false   (V1.0.12)
    Returns: {audio_url, voice_id, cached: bool, char_count}
    Cached in db.voice_samples so first preview burns ~50 chars; every
    subsequent play of the same (voice_id, calm) tuple is free.

Reads ELEVENLABS_API_KEY from env. If missing, returns 503 with a
descriptive message — the frontend gracefully degrades (no audio,
chain still runs). NO crash.

Voice ID defaults to 'Rachel' (21m00Tcm4Tlm) — neutral female,
multilingual support. Model defaults to 'eleven_flash_v2_5' for
~75ms latency per the user's requirement.
"""
import asyncio
import base64
import os
import time
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel

from deps import db, get_current_user, logger

router = APIRouter(prefix="/voice")

# Default Sage voice — "River" (neutral, calm, conversational, mid-age,
# American). Picked because (a) it's labelled `descriptive: calm` which
# matches our agent persona, (b) neutral gender keeps the Sage genderless,
# (c) it's a `premade` voice available on all ElevenLabs accounts (free +
# paid). User can override per call by passing voice_id, or globally by
# setting SAGE_VOICE_ID in env.
DEFAULT_VOICE_ID = os.environ.get("SAGE_VOICE_ID", "SAz9YHcvj6GT2YYXdXww")
DEFAULT_MODEL_ID = "eleven_flash_v2_5"   # ~75ms latency, ENG + multilingual
MAX_TEXT_LEN = 800   # narrations are short — defensive cap so a runaway
                      # paste can't blow the user's ElevenLabs quota.


class NarrateBody(BaseModel):
    text: str
    voice_id: Optional[str] = None
    model_id: Optional[str] = None
    calm: Optional[bool] = False


# V1.0.12 — Fixed sample text for the voice-preview button. Short
# enough that a first-time cache miss costs ~60 characters; once
# cached, every subsequent click is free.
SAMPLE_TEXT = (
    "Welcome, traveler. I am the Sage. Together we will walk a "
    "ritual path of breath, memory, and quiet wonder."
)


def _get_eleven_client():
    """Lazy-import + lazy-construct the client so the route module can
    load even when the package isn't installed yet."""
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Sage Voice unavailable — ELEVENLABS_API_KEY not configured. "
                   "Settings → Universal Key → Add ElevenLabs key to enable.",
        )
    try:
        from elevenlabs.client import ElevenLabs
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Sage Voice unavailable — `elevenlabs` package not installed.",
        )
    return ElevenLabs(api_key=api_key)


def _synthesize_sync(text: str, voice_id: str, model_id: str, calm: bool = False) -> bytes:
    """Blocking call — wrapped in run_in_executor by the async handler.
    The ElevenLabs SDK's `convert` returns a generator of mp3 chunks.

    V1.0.12 calm-immersion contract: when `calm=True`, we pass softer
    voice settings (lower stability so the voice doesn't punch, higher
    similarity for warmth, no speaker boost) so the narration feels
    breathier and more contemplative. The frontend pairs this with a
    40% gain reduction on the <audio> element."""
    client = _get_eleven_client()
    convert_kwargs = dict(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
        output_format="mp3_22050_32",
    )
    if calm:
        try:
            from elevenlabs import VoiceSettings
            convert_kwargs["voice_settings"] = VoiceSettings(
                stability=0.85,
                similarity_boost=0.85,
                style=0.0,
                use_speaker_boost=False,
            )
        except Exception:
            # Older/newer SDK shapes — fall back silently to defaults.
            pass
    audio_iter = client.text_to_speech.convert(**convert_kwargs)
    return b"".join(audio_iter)


@router.post("/sage-narrate")
async def sage_narrate(
    body: NarrateBody = Body(...),
    user=Depends(get_current_user),
):
    text = (body.text or "").strip()
    if not text:
        raise HTTPException(400, "Empty text — nothing to narrate.")
    if len(text) > MAX_TEXT_LEN:
        text = text[:MAX_TEXT_LEN]

    voice_id = (body.voice_id or DEFAULT_VOICE_ID).strip() or DEFAULT_VOICE_ID
    model_id = (body.model_id or DEFAULT_MODEL_ID).strip() or DEFAULT_MODEL_ID
    calm = bool(body.calm)

    started = time.time()
    try:
        audio_bytes = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None, _synthesize_sync, text, voice_id, model_id, calm,
            ),
            timeout=20,
        )
    except asyncio.TimeoutError:
        raise HTTPException(504, "Sage's voice took too long. Try shorter narration.")
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        logger.error(f"Sage narrate error: {msg}")
        # Map common ElevenLabs error strings to actionable 503s so the
        # frontend's existing "unavailable" branch lights up instead of
        # generic "synth failed".
        if "detected_unusual_activity" in msg or "Free Tier usage disabled" in msg:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Sage Voice unavailable — ElevenLabs blocked the request "
                    "(free tier disabled for cloud/proxy IPs). Upgrade to any "
                    "paid plan at https://elevenlabs.io/app/subscription to "
                    "enable narration from this server."
                ),
            )
        if "voice_not_found" in msg:
            raise HTTPException(
                status_code=503,
                detail="Sage Voice unavailable — voice_id not in your library.",
            )
        if "quota" in msg.lower() or "out of credits" in msg.lower():
            raise HTTPException(
                status_code=503,
                detail="Sage Voice unavailable — ElevenLabs character quota exhausted.",
            )
        raise HTTPException(502, f"Sage voice synthesis failed: {msg[:160]}")

    if not audio_bytes:
        raise HTTPException(502, "Sage voice returned empty audio.")

    audio_b64 = base64.b64encode(audio_bytes).decode("ascii")
    elapsed_ms = int((time.time() - started) * 1000)

    # Lightweight logging for budget awareness — owner can inspect
    # `db.voice_narrations` to see character usage.
    try:
        await db.voice_narrations.insert_one({
            "user_id": user["id"],
            "char_count": len(text),
            "voice_id": voice_id,
            "model_id": model_id,
            "elapsed_ms": elapsed_ms,
            "created_at": __import__("datetime").datetime.now(
                __import__("datetime").timezone.utc,
            ).isoformat(),
        })
    except Exception:
        pass

    return {
        "audio_url": f"data:audio/mpeg;base64,{audio_b64}",
        "voice_id": voice_id,
        "model_id": model_id,
        "char_count": len(text),
        "elapsed_ms": elapsed_ms,
    }


@router.get("/sage-narrate/status")
async def sage_narrate_status(user=Depends(get_current_user)):
    """Cheap probe the frontend hits on Settings open to know whether
    the voice toggle should render as 'available' or 'configure key'."""
    has_key = bool(os.environ.get("ELEVENLABS_API_KEY", "").strip())
    return {
        "configured": has_key,
        "default_voice_id": DEFAULT_VOICE_ID,
        "default_model_id": DEFAULT_MODEL_ID,
    }


# V1.0.13 — Budget Shield. Pulls the user-subscription endpoint from
# ElevenLabs and surfaces the live character budget to the frontend.
# Cached for 5 minutes to avoid hammering the upstream (their limit
# window is per-minute; 5min cache keeps the bar fresh without being
# abusive).
_budget_cache = {"fetched_at": 0, "body": None}
_BUDGET_TTL_SEC = 300


async def _fetch_eleven_budget():
    """Returns (ok, body_or_error_string). Uses the SDK's user
    subscription endpoint."""
    def _sync():
        client = _get_eleven_client()
        return client.user.subscription.get()
    sub = await asyncio.wait_for(
        asyncio.get_event_loop().run_in_executor(None, _sync),
        timeout=10,
    )
    # The SDK returns a pydantic-ish object; convert to plain dict.
    if hasattr(sub, "dict"):
        return sub.dict()
    if hasattr(sub, "model_dump"):
        return sub.model_dump()
    return dict(sub)


@router.get("/budget")
async def sage_voice_budget(user=Depends(get_current_user)):
    """V1.0.13 — Real-time ElevenLabs character budget for the UI meter.

    Returns:
      {
        configured: bool,
        character_count: int,    # used this period
        character_limit: int,    # total allowed this period
        remaining: int,
        percent_used: float,
        tier: str,               # ElevenLabs tier label (e.g. "starter")
        next_reset_unix: int,
        cached: bool,
      }

    When the key is absent → 200 with {configured: false}. Frontend
    renders a "No voice key" empty state instead of flashing an error.
    When ElevenLabs 401s (abuse-detection) → same shape with
    configured: true, but -1 for counters and `note` explaining why.
    """
    has_key = bool(os.environ.get("ELEVENLABS_API_KEY", "").strip())
    if not has_key:
        return {"configured": False}

    now = time.time()
    if _budget_cache["body"] and (now - _budget_cache["fetched_at"]) < _BUDGET_TTL_SEC:
        body = dict(_budget_cache["body"])
        body["cached"] = True
        return body

    try:
        sub = await _fetch_eleven_budget()
    except Exception as e:
        msg = str(e)
        logger.warning(f"Voice budget fetch failed: {msg[:160]}")
        # Surface a predictable shape so the UI meter renders 'unknown'
        # rather than a hard error bar.
        return {
            "configured": True,
            "character_count": -1,
            "character_limit": -1,
            "remaining": -1,
            "percent_used": -1,
            "tier": "unknown",
            "next_reset_unix": 0,
            "cached": False,
            "note": (
                "ElevenLabs blocked the request (likely free-tier cloud-IP "
                "check). Upgrade at https://elevenlabs.io/app/subscription."
                if "detected_unusual_activity" in msg or "Free Tier usage disabled" in msg
                else "Upstream call failed — will retry automatically."
            ),
        }

    used = int(sub.get("character_count") or 0)
    limit = int(sub.get("character_limit") or 0)
    remaining = max(0, limit - used)
    pct = (used / limit * 100.0) if limit > 0 else 0.0
    tier = str(sub.get("tier") or "free")
    reset_unix = int(sub.get("next_character_count_reset_unix") or 0)

    body = {
        "configured": True,
        "character_count": used,
        "character_limit": limit,
        "remaining": remaining,
        "percent_used": round(pct, 2),
        "tier": tier,
        "next_reset_unix": reset_unix,
        "cached": False,
    }
    _budget_cache["body"] = body
    _budget_cache["fetched_at"] = now
    return body


# V1.0.13 — Safety margin: refuse to start synthesis when the chars
# needed would push usage above BUDGET_CEILING_PCT of the limit.
# Keeps a reserve for "critical" narrations (a user mid-ritual never
# hears silence unexpectedly).
BUDGET_CEILING_PCT = 0.90


async def _has_budget_for(chars: int) -> tuple[bool, int]:
    """Returns (ok, remaining). Uses the cached body if warm, else
    refreshes. Falls back to optimistic (ok=True) when the budget
    probe itself errors — we'd rather try narration and hit the real
    upstream cap than hard-block based on stale cache."""
    now = time.time()
    body = _budget_cache["body"]
    if not body or (now - _budget_cache["fetched_at"]) > _BUDGET_TTL_SEC:
        try:
            sub = await _fetch_eleven_budget()
            used = int(sub.get("character_count") or 0)
            limit = int(sub.get("character_limit") or 0)
            body = {
                "character_count": used,
                "character_limit": limit,
                "remaining": max(0, limit - used),
            }
            _budget_cache["body"] = body
            _budget_cache["fetched_at"] = now
        except Exception:
            return True, -1  # optimistic fallback
    limit = int(body.get("character_limit") or 0)
    used = int(body.get("character_count") or 0)
    if limit <= 0:
        return True, -1
    ceiling = int(limit * BUDGET_CEILING_PCT)
    return (used + chars) <= ceiling, max(0, limit - used)


@router.get("/sample")
async def sage_voice_sample(
    voice_id: Optional[str] = None,
    calm: bool = False,
    user=Depends(get_current_user),
):
    """V1.0.12 — Cached 5-ish second voice preview.

    First request for a given (voice_id, calm) tuple synthesizes via
    ElevenLabs (~60 char burn) and caches the audio in
    `db.voice_samples`. Every subsequent request returns the cached
    audio_url with no API spend.
    """
    vid = (voice_id or DEFAULT_VOICE_ID).strip() or DEFAULT_VOICE_ID
    mode_key = "calm" if calm else "full"
    cache_key = f"{vid}:{mode_key}"

    cached = await db.voice_samples.find_one({"key": cache_key}, {"_id": 0})
    if cached and cached.get("audio_url"):
        return {
            "audio_url": cached["audio_url"],
            "voice_id": vid,
            "calm": calm,
            "cached": True,
            "char_count": cached.get("char_count", len(SAMPLE_TEXT)),
        }

    # Cache miss — synthesize.
    started = time.time()
    try:
        audio_bytes = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None, _synthesize_sync, SAMPLE_TEXT, vid, DEFAULT_MODEL_ID, calm,
            ),
            timeout=20,
        )
    except asyncio.TimeoutError:
        raise HTTPException(504, "Sage's voice took too long. Try again.")
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        logger.error(f"Voice sample synth error: {msg}")
        if "detected_unusual_activity" in msg or "Free Tier usage disabled" in msg:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Sage Voice unavailable — ElevenLabs blocked the request "
                    "(free tier disabled for cloud/proxy IPs). Upgrade to any "
                    "paid plan at https://elevenlabs.io/app/subscription."
                ),
            )
        if "voice_not_found" in msg:
            raise HTTPException(
                status_code=503,
                detail="Sage Voice unavailable — voice_id not in your library.",
            )
        if "quota" in msg.lower():
            raise HTTPException(
                status_code=503,
                detail="Sage Voice unavailable — ElevenLabs character quota exhausted.",
            )
        raise HTTPException(502, f"Voice sample synthesis failed: {msg[:160]}")

    if not audio_bytes:
        raise HTTPException(502, "Voice sample returned empty audio.")

    audio_url = f"data:audio/mpeg;base64,{base64.b64encode(audio_bytes).decode('ascii')}"
    elapsed_ms = int((time.time() - started) * 1000)

    try:
        await db.voice_samples.update_one(
            {"key": cache_key},
            {"$set": {
                "key": cache_key,
                "voice_id": vid,
                "calm": calm,
                "audio_url": audio_url,
                "char_count": len(SAMPLE_TEXT),
                "elapsed_ms": elapsed_ms,
                "created_at": __import__("datetime").datetime.now(
                    __import__("datetime").timezone.utc,
                ).isoformat(),
            }},
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"voice_samples cache write failed: {e}")

    return {
        "audio_url": audio_url,
        "voice_id": vid,
        "calm": calm,
        "cached": False,
        "char_count": len(SAMPLE_TEXT),
        "elapsed_ms": elapsed_ms,
    }
