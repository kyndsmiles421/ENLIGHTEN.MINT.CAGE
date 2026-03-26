from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import GuidedMeditationRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import random

@router.post("/meditation/generate-guided")
async def generate_guided_meditation(req: GuidedMeditationRequest, user=Depends(get_current_user)):
    """Generate personalized guided meditation steps using AI."""
    focus_labels = {
        "stress": "stress relief and deep relaxation",
        "sleep": "falling into deep restful sleep",
        "focus": "sharpening mental clarity and concentration",
        "healing": "physical and emotional healing",
        "gratitude": "cultivating gratitude and joy",
        "confidence": "building inner strength and self-confidence",
        "letting-go": "releasing attachments and finding freedom",
        "general": "inner peace and spiritual growth",
    }
    focus_desc = focus_labels.get(req.focus, req.focus)
    num_steps = max(6, min(18, req.duration))
    step_dur = (req.duration * 60) // num_steps

    prompt = f"""Create a deeply personal guided meditation for someone whose intention is: "{req.intention}"
Focus area: {focus_desc}
Total duration: {req.duration} minutes
Number of steps: {num_steps}

Return ONLY a JSON array of meditation steps. Each step must have:
- "text": the narration text for this step (2-4 sentences, written as if speaking directly to the meditator in second person, warm and compassionate)
- "duration": duration in seconds (aim for {step_dur} seconds per step)

The meditation should flow naturally: opening/settling -> core practice aligned to their intention -> deepening -> integration -> gentle closing.
Make it deeply personal to the intention "{req.intention}". Use vivid imagery, specific body sensations, and emotional resonance.
Return ONLY valid JSON array, no markdown, no explanation."""

    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"guided-meditation-{str(uuid.uuid4())}",
            system_message="You are a master meditation teacher. Generate deeply personal, transformative guided meditation scripts. Always respond with valid JSON only.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        raw = await asyncio.wait_for(chat.send_message(msg), timeout=45)

        # Parse JSON from response
        import json as json_mod
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        steps_raw = json_mod.loads(cleaned)
        steps = []
        cumulative_time = 0
        for s in steps_raw:
            steps.append({
                "time": cumulative_time,
                "text": s.get("text", ""),
                "duration": s.get("duration", step_dur),
            })
            cumulative_time += s.get("duration", step_dur)

        return {"steps": steps, "intention": req.intention, "focus": req.focus, "duration": req.duration}
    except json_mod.JSONDecodeError:
        # Fallback: split raw text into steps
        paragraphs = [p.strip() for p in raw.split("\n\n") if p.strip()]
        if len(paragraphs) < 3:
            paragraphs = [p.strip() for p in raw.split("\n") if p.strip()]
        steps = []
        cumulative_time = 0
        for p in paragraphs[:num_steps]:
            steps.append({"time": cumulative_time, "text": p, "duration": step_dur})
            cumulative_time += step_dur
        return {"steps": steps, "intention": req.intention, "focus": req.focus, "duration": req.duration}
    except Exception as e:
        logger.error(f"Guided meditation generate error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate meditation. Please try again.")

@router.post("/meditation/save-custom")
async def save_custom_meditation(data: dict, user=Depends(get_current_user)):
    """Save a user-built custom guided meditation."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Meditation"),
        "intention": data.get("intention", ""),
        "focus": data.get("focus", "general"),
        "duration": data.get("duration", 10),
        "sound": data.get("sound", "silence"),
        "color": data.get("color", "#D8B4FE"),
        "steps": data.get("steps", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_meditations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/meditation/my-custom")
async def get_custom_meditations(user=Depends(get_current_user)):
    """Get user's saved custom meditations."""
    items = await db.custom_meditations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/meditation/custom/{meditation_id}")
async def delete_custom_meditation(meditation_id: str, user=Depends(get_current_user)):
    result = await db.custom_meditations.delete_one({"id": meditation_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Breathing Patterns ---

@router.post("/breathing/save-custom")
async def save_custom_breathing(data: dict, user=Depends(get_current_user)):
    """Save a user-defined custom breathing pattern."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Pattern"),
        "inhale": max(1, min(20, data.get("inhale", 4))),
        "hold1": max(0, min(20, data.get("hold1", 4))),
        "exhale": max(1, min(20, data.get("exhale", 4))),
        "hold2": max(0, min(20, data.get("hold2", 0))),
        "color": data.get("color", "#2DD4BF"),
        "description": data.get("description", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_breathing.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/breathing/my-custom")
async def get_custom_breathing(user=Depends(get_current_user)):
    items = await db.custom_breathing.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/breathing/custom/{pattern_id}")
async def delete_custom_breathing(pattern_id: str, user=Depends(get_current_user)):
    result = await db.custom_breathing.delete_one({"id": pattern_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Affirmation Sets ---

@router.post("/affirmations/generate-set")
async def generate_affirmation_set(data: dict, user=Depends(get_current_user)):
    """AI-generate a personalized set of affirmations based on user's goal."""
    goal = data.get("goal", "").strip()
    if not goal:
        raise HTTPException(status_code=400, detail="Please provide a goal or intention")
    count = max(3, min(10, data.get("count", 7)))

    prompt = f"""Create {count} deeply personal, powerful affirmations for someone whose intention is: "{goal}"

Rules:
- Each affirmation must start with "I am", "I have", "I attract", "I choose", "I embrace", "I release", or similar empowering first-person language
- Make them specific to the intention, not generic
- They should feel warm, compassionate, and deeply resonant
- Each affirmation should be 1-2 sentences max
- Make each one unique in its approach — some emotional, some grounding, some aspirational

Return ONLY a JSON array of strings. No markdown, no explanation."""

    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"affirmation-set-{str(uuid.uuid4())}",
            system_message="You are a compassionate life coach and spiritual guide. Generate deeply personal affirmations. Always respond with valid JSON only.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=prompt)
        raw = await asyncio.wait_for(chat.send_message(msg), timeout=30)

        import json as json_mod
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        affirmations = json_mod.loads(cleaned)
        if not isinstance(affirmations, list):
            raise ValueError("Expected a list")
        return {"affirmations": affirmations[:count], "goal": goal}
    except Exception as e:
        logger.error(f"Affirmation set generate error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate affirmations. Please try again.")

@router.post("/affirmations/save-set")
async def save_affirmation_set(data: dict, user=Depends(get_current_user)):
    """Save a user's custom affirmation set."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Affirmations"),
        "goal": data.get("goal", ""),
        "affirmations": data.get("affirmations", []),
        "color": data.get("color", "#FCD34D"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_affirmations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/affirmations/my-sets")
async def get_affirmation_sets(user=Depends(get_current_user)):
    items = await db.custom_affirmations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/affirmations/set/{set_id}")
async def delete_affirmation_set(set_id: str, user=Depends(get_current_user)):
    result = await db.custom_affirmations.delete_one({"id": set_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# --- Custom Soundscape Mixes ---

@router.post("/soundscapes/save-mix")
async def save_soundscape_mix(data: dict, user=Depends(get_current_user)):
    """Save a user's soundscape mix configuration."""
    volumes = data.get("volumes", {})
    active = {k: v for k, v in volumes.items() if v and v > 0}
    if not active:
        raise HTTPException(status_code=400, detail="No sounds active in this mix")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Mix"),
        "volumes": active,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_soundscapes.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/soundscapes/my-mixes")
async def get_soundscape_mixes(user=Depends(get_current_user)):
    items = await db.custom_soundscapes.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/soundscapes/mix/{mix_id}")
async def delete_soundscape_mix(mix_id: str, user=Depends(get_current_user)):
    result = await db.custom_soundscapes.delete_one({"id": mix_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}


