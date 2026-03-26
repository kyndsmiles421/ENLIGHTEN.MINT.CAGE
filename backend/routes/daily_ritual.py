from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone, timedelta
import uuid
import asyncio
import random

router = APIRouter()


async def _build_user_profile(uid):
    """Gather comprehensive user data to build personalization profile."""
    mood_docs, journal_count, yoga_sessions, meditation_count, dreams_count, meal_count, aroma_favs, herb_cabinet, streak_doc, reiki_sessions, acupressure_sessions = await asyncio.gather(
        db.moods.find({"user_id": uid}, {"_id": 0, "mood": 1, "intensity": 1}).sort("created_at", -1).to_list(20),
        db.journal.count_documents({"user_id": uid}),
        db.yoga_sessions.count_documents({"user_id": uid}),
        db.custom_meditations.count_documents({"user_id": uid}),
        db.dreams.count_documents({"user_id": uid}),
        db.meal_logs.count_documents({"user_id": uid}),
        db.aroma_favorites.find({"user_id": uid}, {"_id": 0}).to_list(20),
        db.herb_cabinet.find({"user_id": uid}, {"_id": 0}).to_list(20),
        db.streaks.find_one({"user_id": uid}, {"_id": 0}),
        db.reiki_sessions.count_documents({"user_id": uid}),
        db.acupressure_sessions.count_documents({"user_id": uid}),
    )
    moods = [m.get("mood", "") for m in mood_docs]
    avg_intensity = sum(m.get("intensity", 5) for m in mood_docs) / len(mood_docs) if mood_docs else 5
    dominant_mood = max(set(moods), key=moods.count) if moods else "neutral"
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0
    return {
        "dominant_mood": dominant_mood,
        "recent_moods": moods[:5],
        "avg_intensity": round(avg_intensity, 1),
        "journal_count": journal_count,
        "yoga_sessions": yoga_sessions,
        "meditation_count": meditation_count,
        "dreams_count": dreams_count,
        "meal_count": meal_count,
        "fav_oils": [f.get("oil_id", "") for f in aroma_favs],
        "fav_herbs": [h.get("herb_id", "") for h in herb_cabinet],
        "streak": streak,
        "reiki_sessions": reiki_sessions,
        "acupressure_sessions": acupressure_sessions,
        "experience_level": "beginner" if streak < 7 else ("intermediate" if streak < 30 else "advanced"),
    }


def _build_ritual_template(profile, time_of_day):
    """Generate a ritual template based on profile data."""
    is_morning = time_of_day == "morning"
    mood = profile["dominant_mood"]
    level = profile["experience_level"]
    steps = []
    # Breathing
    if is_morning:
        steps.append({"type": "breathing", "name": "Energizing Breath (Kapalabhati)", "duration": 3,
                       "instruction": "Sit tall. Sharp exhales through the nose, passive inhales. Start with 30 rounds.",
                       "icon": "wind"})
    else:
        steps.append({"type": "breathing", "name": "Calming 4-7-8 Breath", "duration": 3,
                       "instruction": "Inhale 4 counts, hold 7 counts, exhale 8 counts. Repeat 4 cycles.",
                       "icon": "wind"})
    # Aromatherapy
    if is_morning:
        steps.append({"type": "aromatherapy", "name": "Peppermint & Rosemary Awakening", "duration": 2,
                       "instruction": "Add 2 drops peppermint + 1 drop rosemary to diffuser or inhale from palms.",
                       "icon": "droplets"})
    else:
        oil = "Lavender & Chamomile" if mood in ["stressed", "anxious"] else "Frankincense & Sandalwood"
        steps.append({"type": "aromatherapy", "name": f"{oil} Ritual", "duration": 2,
                       "instruction": f"Diffuse {oil.lower()} blend. Take 3 deep inhales, releasing tension with each exhale.",
                       "icon": "droplets"})
    # Movement / Body
    if is_morning:
        steps.append({"type": "yoga", "name": "Sun Salutation Flow", "duration": 7,
                       "instruction": "3-5 rounds of Surya Namaskar. Move with breath. Honor your body.",
                       "icon": "flame"})
    else:
        steps.append({"type": "yoga", "name": "Yin Restore", "duration": 7,
                       "instruction": "Child's pose (2 min), Legs up wall (3 min), Savasana (2 min).",
                       "icon": "flame"})
    # Energy work
    if profile["reiki_sessions"] > 0 or level != "beginner":
        steps.append({"type": "reiki", "name": "Self-Reiki Heart & Crown", "duration": 5,
                       "instruction": "Place hands on heart center. Breathe love in. Move to crown. Channel universal energy.",
                       "icon": "sparkles"})
    if profile["acupressure_sessions"] > 0 or mood in ["stressed", "tired", "anxious"]:
        point = "ST36 (Zu San Li)" if is_morning else "HT7 (Shen Men)"
        steps.append({"type": "acupressure", "name": f"Acupressure: {point}", "duration": 3,
                       "instruction": f"Press {point} firmly for 1-2 minutes each side. Breathe into the point.",
                       "icon": "target"})
    # Meditation / Mindfulness
    dur = 5 if level == "beginner" else (10 if level == "intermediate" else 15)
    steps.append({"type": "meditation", "name": "Seated Meditation", "duration": dur,
                   "instruction": f"Sit in stillness for {dur} minutes. Focus on breath. Let thoughts pass like clouds.",
                   "icon": "timer"})
    # Nourishment
    if is_morning:
        steps.append({"type": "elixir", "name": "Morning Elixir", "duration": 5,
                       "instruction": "Prepare a lemon-ginger wellness shot or golden milk. Drink with gratitude.",
                       "icon": "wine"})
    else:
        steps.append({"type": "elixir", "name": "Evening Tea Ceremony", "duration": 5,
                       "instruction": "Brew tulsi rose tea or moon milk. Sip slowly, being fully present with each taste.",
                       "icon": "wine"})
    # Intention / Journal
    if is_morning:
        steps.append({"type": "journal", "name": "Morning Intention", "duration": 3,
                       "instruction": "Write 1 intention for the day. What energy do you want to embody?",
                       "icon": "pen-tool"})
    else:
        steps.append({"type": "journal", "name": "Gratitude Reflection", "duration": 3,
                       "instruction": "Write 3 things you're grateful for. What did you learn today?",
                       "icon": "pen-tool"})
    total = sum(s["duration"] for s in steps)
    return {"steps": steps, "total_duration": total}


@router.get("/daily-ritual/generate")
async def generate_daily_ritual(time_of_day: str = "morning", user=Depends(get_current_user)):
    uid = user["id"]
    profile = await _build_user_profile(uid)
    ritual = _build_ritual_template(profile, time_of_day)
    today = datetime.now(timezone.utc).date().isoformat()
    existing = await db.daily_rituals.find_one(
        {"user_id": uid, "date": today, "time_of_day": time_of_day}, {"_id": 0})
    if existing:
        return existing
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "date": today,
        "time_of_day": time_of_day,
        "profile_snapshot": profile,
        "ritual": ritual,
        "completed_steps": [],
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.daily_rituals.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.post("/daily-ritual/complete-step")
async def complete_step(data: dict = Body(...), user=Depends(get_current_user)):
    ritual_id = data.get("ritual_id")
    step_index = data.get("step_index")
    ritual = await db.daily_rituals.find_one({"id": ritual_id, "user_id": user["id"]})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    completed = ritual.get("completed_steps", [])
    if step_index not in completed:
        completed.append(step_index)
    total_steps = len(ritual.get("ritual", {}).get("steps", []))
    is_complete = len(completed) >= total_steps
    await db.daily_rituals.update_one({"id": ritual_id}, {"$set": {
        "completed_steps": completed,
        "completed": is_complete,
        "completed_at": datetime.now(timezone.utc).isoformat() if is_complete else None,
    }})
    # Update personalization preferences
    if is_complete:
        await db.ritual_preferences.update_one(
            {"user_id": user["id"]},
            {"$inc": {"total_completed": 1}, "$set": {"last_completed": datetime.now(timezone.utc).isoformat()}},
            upsert=True)
    return {"completed_steps": completed, "is_complete": is_complete, "total_steps": total_steps}


@router.get("/daily-ritual/history")
async def get_ritual_history(user=Depends(get_current_user)):
    rituals = await db.daily_rituals.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    total_completed = sum(1 for r in rituals if r.get("completed"))
    return {"rituals": rituals, "total_completed": total_completed}


@router.get("/daily-ritual/profile")
async def get_wellness_profile(user=Depends(get_current_user)):
    profile = await _build_user_profile(user["id"])
    prefs = await db.ritual_preferences.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    return {
        "profile": profile,
        "preferences": prefs,
        "personalization_level": "Deep" if prefs.get("total_completed", 0) > 10 else ("Growing" if prefs.get("total_completed", 0) > 3 else "New"),
    }
