"""V1.0.11 — Sage Voice (ElevenLabs TTS) for Ritual Chain narration.

Endpoint:
  POST /api/voice/sage-narrate
    Body: {text: str, voice_id?: str, model_id?: str}
    Returns: {audio_url: "data:audio/mpeg;base64,..."}

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


def _synthesize_sync(text: str, voice_id: str, model_id: str) -> bytes:
    """Blocking call — wrapped in run_in_executor by the async handler.
    The ElevenLabs SDK's `convert` returns a generator of mp3 chunks."""
    client = _get_eleven_client()
    audio_iter = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
        output_format="mp3_22050_32",  # tiny mp3 — narration, not music
    )
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

    started = time.time()
    try:
        audio_bytes = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None, _synthesize_sync, text, voice_id, model_id,
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
