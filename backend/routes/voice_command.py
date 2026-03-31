from fastapi import APIRouter, HTTPException, Depends
from deps import get_current_user, EMERGENT_LLM_KEY, logger
from pydantic import BaseModel
from typing import Optional
import base64
import tempfile
import os

from emergentintegrations.llm.openai import OpenAISpeechToText, OpenAITextToSpeech
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/voice", tags=["voice"])

class VoiceCommandRequest(BaseModel):
    audio_base64: str
    context: Optional[str] = "full_app"

INTENT_SYSTEM_PROMPT = """You are the voice command interpreter for "The Cosmic Collective", a spiritual wellness app. Parse the user's spoken command and return a JSON response.

Available intents and their parameters:
MIXER CONTROLS:
- {"intent": "mixer_play", "target": "frequency|sound|drone|mantra", "value": "<name or Hz>"}
- {"intent": "mixer_stop", "target": "frequency|sound|drone|mantra|all", "value": "<name or Hz or null>"}
- {"intent": "mixer_volume", "target": "master|frequency|sound|drone|mantra", "direction": "up|down|set", "value": <number 0-100 or null>}
- {"intent": "mixer_tempo", "action": "set|stop", "value": <BPM number or preset name>}

NAVIGATION:
- {"intent": "navigate", "destination": "<page path>"}
  Valid destinations: home, dashboard, star-chart, starseed-adventure, starseed-realm, starseed-worlds, spiritual-avatar, avatar-gallery, cosmic-ledger, cosmic-mixer, crystals, sacred-scriptures, myths, trade-circle, settings, profile

AI SAGE (conversational question):
- {"intent": "sage_query", "question": "<the user's question>"}

RESPONSE FORMAT - Always return valid JSON with these fields:
{
  "intent": "<intent type>",
  "params": {<intent-specific parameters>},
  "response_text": "<brief spoken response to user>",
  "confidence": <0.0-1.0>
}

Examples:
User: "Play ocean sounds" -> {"intent": "mixer_play", "params": {"target": "sound", "value": "ocean"}, "response_text": "Playing ocean sounds", "confidence": 0.95}
User: "Add 528 hertz" -> {"intent": "mixer_play", "params": {"target": "frequency", "value": "528"}, "response_text": "Adding 528 Hz love frequency", "confidence": 0.95}
User: "Stop everything" -> {"intent": "mixer_stop", "params": {"target": "all"}, "response_text": "Stopping all layers", "confidence": 0.98}
User: "Set tempo to 60 BPM" -> {"intent": "mixer_tempo", "params": {"action": "set", "value": 60}, "response_text": "Setting tempo to 60 beats per minute", "confidence": 0.95}
User: "Make it louder" -> {"intent": "mixer_volume", "params": {"target": "master", "direction": "up"}, "response_text": "Turning up the volume", "confidence": 0.9}
User: "Go to my star chart" -> {"intent": "navigate", "params": {"destination": "star-chart"}, "response_text": "Opening your star chart", "confidence": 0.95}
User: "What chakra is associated with green?" -> {"intent": "sage_query", "params": {"question": "What chakra is associated with green?"}, "response_text": "The heart chakra, Anahata, resonates with the color green. It governs love, compassion, and emotional balance.", "confidence": 0.9}
User: "Play sitar and add rain" -> {"intent": "mixer_multi", "params": {"commands": [{"target": "drone", "value": "sitar-drone"}, {"target": "sound", "value": "rain"}]}, "response_text": "Adding sitar drone and rain sounds", "confidence": 0.9}
User: "Resting heart tempo" -> {"intent": "mixer_tempo", "params": {"action": "set", "value": 60}, "response_text": "Setting resting heart tempo at 60 BPM", "confidence": 0.9}
"""

@router.post("/command")
async def process_voice_command(req: VoiceCommandRequest, user=Depends(get_current_user)):
    try:
        # Decode audio
        audio_bytes = base64.b64decode(req.audio_base64)
        
        # Save to temp file for Whisper
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Transcribe with Whisper
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        transcript = await stt.transcribe(tmp_path)
        
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

        if not transcript or not transcript.strip():
            return {
                "transcript": "",
                "intent": "unknown",
                "params": {},
                "response_text": "I didn't catch that. Could you say it again?",
                "confidence": 0,
                "response_audio": None,
            }

        logger.info(f"Voice command transcript: {transcript}")

        # Parse intent with GPT
        chat = LlmChat(api_key=EMERGENT_LLM_KEY)
        chat.with_model("gemini", "gemini-3-flash-preview")
        chat.add_message(UserMessage(content=f"{INTENT_SYSTEM_PROMPT}\n\nUser said: \"{transcript}\"\n\nReturn ONLY valid JSON, nothing else."))
        intent_raw = await chat.chat()

        # Parse the JSON response
        import json
        intent_text = intent_raw.strip()
        if intent_text.startswith("```"):
            intent_text = intent_text.split("\n", 1)[1] if "\n" in intent_text else intent_text[3:]
            if intent_text.endswith("```"):
                intent_text = intent_text[:-3]
            intent_text = intent_text.strip()

        try:
            parsed = json.loads(intent_text)
        except json.JSONDecodeError:
            parsed = {
                "intent": "sage_query",
                "params": {"question": transcript},
                "response_text": intent_text[:200] if intent_text else "I understood you, but had trouble parsing that.",
                "confidence": 0.5,
            }

        response_text = parsed.get("response_text", "Done")

        # Generate spoken response
        response_audio = None
        try:
            tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
            audio_b64 = await tts.generate_speech_base64(
                text=response_text,
                voice="nova",
                model="tts-1",
                speed=1.0,
            )
            if audio_b64:
                response_audio = audio_b64
        except Exception as e:
            logger.warning(f"TTS response failed: {e}")

        return {
            "transcript": transcript,
            "intent": parsed.get("intent", "unknown"),
            "params": parsed.get("params", {}),
            "response_text": response_text,
            "confidence": parsed.get("confidence", 0.5),
            "response_audio": response_audio,
        }

    except Exception as e:
        logger.error(f"Voice command error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
