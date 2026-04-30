"""
sage_fx.py — Sage AI Prompt-to-FX Engine
Uses Gemini Flash to interpret natural language prompts into CSS filter parameters.
"""
import os
import json
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/sage-fx", tags=["sage-fx"])

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

SYSTEM_PROMPT = """You are the Sage FX Engine for ENLIGHTEN.MINT.CAFE, an Information · Entertainment · Education · Gamification platform.
Given a user's natural language description of a visual atmosphere, return ONLY a JSON object with CSS filter values.

The JSON must have exactly these keys with numeric values:
- blur: 0-8 (pixels of gaussian blur)
- brightness: 30-200 (percentage, 100 = normal)
- contrast: 50-200 (percentage, 100 = normal)
- hueRotate: 0-359 (degrees of hue rotation)
- saturate: 0-300 (percentage, 100 = normal)
- sepia: 0-100 (percentage)
- invert: 0 or 100

Also include a "mood" key with a 2-3 word poetic description of the atmosphere.

Examples:
User: "sunset over mountains" → {"blur":0,"brightness":120,"contrast":110,"hueRotate":15,"saturate":140,"sepia":30,"invert":0,"mood":"Golden Horizon"}
User: "deep ocean at night" → {"blur":1,"brightness":60,"contrast":120,"hueRotate":210,"saturate":90,"sepia":0,"invert":0,"mood":"Abyssal Depths"}
User: "crystal cave with purple light" → {"blur":0,"brightness":130,"contrast":120,"hueRotate":280,"saturate":160,"sepia":0,"invert":0,"mood":"Amethyst Grotto"}

Return ONLY the JSON object, no markdown, no explanation."""


class PromptRequest(BaseModel):
    prompt: str


@router.post("/prompt-to-fx")
async def prompt_to_fx(req: PromptRequest):
    if not EMERGENT_KEY:
        return {"error": "LLM key not configured", "filters": None}

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"sage-fx-{uuid.uuid4().hex[:8]}",
            system_message=SYSTEM_PROMPT,
        ).with_model("gemini", "gemini-2.5-flash")

        response = await chat.send_message(UserMessage(text=req.prompt))

        # Parse the JSON from response
        text = response.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        filters = json.loads(text)
        mood = filters.pop("mood", "Applied")

        # Clamp values to safe ranges
        filters["blur"] = max(0, min(8, int(filters.get("blur", 0))))
        filters["brightness"] = max(30, min(200, int(filters.get("brightness", 100))))
        filters["contrast"] = max(50, min(200, int(filters.get("contrast", 100))))
        filters["hueRotate"] = max(0, min(359, int(filters.get("hueRotate", 0))))
        filters["saturate"] = max(0, min(300, int(filters.get("saturate", 100))))
        filters["sepia"] = max(0, min(100, int(filters.get("sepia", 0))))
        filters["invert"] = 100 if filters.get("invert", 0) > 50 else 0

        return {"filters": filters, "mood": mood}

    except json.JSONDecodeError:
        return {"error": "Sage could not interpret that atmosphere", "filters": None}
    except Exception as e:
        return {"error": str(e), "filters": None}
