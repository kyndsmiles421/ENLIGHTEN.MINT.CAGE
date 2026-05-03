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

# Default Sage voice — neutral female, multilingual ("Rachel" preset).
# User can override per call by passing voice_id, or globally by
# setting SAGE_VOICE_ID in env.
DEFAULT_VOICE_ID = os.environ.get("SAGE_VOICE_ID", "21m00Tcm4Tlm")
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
        logger.error(f"Sage narrate error: {e}")
        # Return a structured error the frontend can display in the
        # HUD without crashing the active ritual chain.
        raise HTTPException(502, f"Sage voice synthesis failed: {str(e)[:160]}")

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
        logger.error(f"Voice sample synth error: {e}")
        raise HTTPException(502, f"Voice sample synthesis failed: {str(e)[:160]}")

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
