from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import RitualCreate, RitualComplete

# --- Rituals ---
@router.post("/rituals")
async def create_ritual(ritual: RitualCreate, user=Depends(get_current_user)):
    steps_data = [s.model_dump() for s in ritual.steps]
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": ritual.name,
        "time_of_day": ritual.time_of_day,
        "steps": steps_data,
        "total_duration": sum(s.duration for s in ritual.steps),
        "completions": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.rituals.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/rituals")
async def get_rituals(user=Depends(get_current_user)):
    rituals = await db.rituals.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return rituals

@router.delete("/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str, user=Depends(get_current_user)):
    result = await db.rituals.delete_one({"id": ritual_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return {"deleted": True}

@router.post("/rituals/{ritual_id}/complete")
async def complete_ritual(ritual_id: str, data: RitualComplete, user=Depends(get_current_user)):
    ritual = await db.rituals.find_one({"id": ritual_id, "user_id": user["id"]}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    completion = {
        "id": str(uuid.uuid4()),
        "ritual_id": ritual_id,
        "ritual_name": ritual["name"],
        "user_id": user["id"],
        "duration_seconds": data.duration_seconds,
        "steps_completed": data.steps_completed,
        "total_steps": len(ritual["steps"]),
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ritual_completions.insert_one(completion)
    completion.pop("_id", None)
    
    await db.rituals.update_one(
        {"id": ritual_id},
        {"$inc": {"completions": 1}}
    )
    return completion

@router.get("/rituals/history")
async def get_ritual_history(user=Depends(get_current_user)):
    completions = await db.ritual_completions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(100)
    
    total_sessions = len(completions)
    total_minutes = sum(c.get("duration_seconds", 0) for c in completions) // 60
    
    # Streak calc
    today = datetime.now(timezone.utc).date()
    dates = set()
    for c in completions:
        dates.add(datetime.fromisoformat(c["completed_at"]).date())
    streak = 0
    check = today
    while check in dates:
        streak += 1
        check -= timedelta(days=1)
    
    return {
        "completions": completions[:20],
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "ritual_streak": streak
    }

@router.get("/rituals/templates")
async def get_ritual_templates():
    return [
        {
            "id": "morning-awakening",
            "name": "Morning Awakening",
            "time_of_day": "morning",
            "description": "Start your day with intention and energy",
            "steps": [
                {"type": "breathing", "name": "Energizing Breath", "duration": 180, "config": {"pattern": "energizing"}},
                {"type": "affirmation", "name": "Morning Affirmation", "duration": 60, "config": None},
                {"type": "exercise", "name": "Eight Pieces of Brocade", "duration": 600, "config": {"exercise_id": "qigong-eight-brocades"}},
                {"type": "meditation", "name": "Intention Setting", "duration": 300, "config": {"preset": "5min"}},
            ],
            "total_duration": 1140,
            "color": "#FCD34D"
        },
        {
            "id": "evening-unwind",
            "name": "Evening Unwind",
            "time_of_day": "evening",
            "description": "Release the day and prepare for restorative sleep",
            "steps": [
                {"type": "breathing", "name": "4-7-8 Relaxation", "duration": 240, "config": {"pattern": "relaxation"}},
                {"type": "frequency", "name": "432Hz Universal Harmony", "duration": 180, "config": {"frequency_id": "freq-432"}},
                {"type": "meditation", "name": "Body Scan", "duration": 600, "config": {"preset": "10min"}},
                {"type": "affirmation", "name": "Gratitude Reflection", "duration": 60, "config": None},
            ],
            "total_duration": 1080,
            "color": "#D8B4FE"
        },
        {
            "id": "energy-boost",
            "name": "Midday Energy Boost",
            "time_of_day": "anytime",
            "description": "Quick recharge for when you need a lift",
            "steps": [
                {"type": "breathing", "name": "Box Breathing", "duration": 120, "config": {"pattern": "box"}},
                {"type": "exercise", "name": "Standing Like a Tree", "duration": 300, "config": {"exercise_id": "qigong-standing"}},
                {"type": "frequency", "name": "528Hz Miracle Tone", "duration": 120, "config": {"frequency_id": "freq-528"}},
            ],
            "total_duration": 540,
            "color": "#2DD4BF"
        },
        {
            "id": "deep-consciousness",
            "name": "Deep Consciousness",
            "time_of_day": "anytime",
            "description": "An extended practice for spiritual exploration",
            "steps": [
                {"type": "breathing", "name": "Pranayama Flow", "duration": 300, "config": {"pattern": "pranayama"}},
                {"type": "frequency", "name": "963Hz Divine Consciousness", "duration": 300, "config": {"frequency_id": "freq-963"}},
                {"type": "exercise", "name": "Cloud Hands", "duration": 600, "config": {"exercise_id": "taichi-cloud-hands"}},
                {"type": "meditation", "name": "Deep Awareness", "duration": 1200, "config": {"preset": "20min"}},
                {"type": "affirmation", "name": "Closing Intention", "duration": 60, "config": None},
            ],
            "total_duration": 2460,
            "color": "#8B5CF6"
        }
    ]

# ===== ZEN GARDEN =====
PLANT_STAGES = {
    "lotus": ["Seed", "Sprout", "Bud", "Bloom", "Full Bloom"],
    "bamboo": ["Seed", "Shoot", "Young", "Tall", "Flourishing"],
    "bonsai": ["Seed", "Seedling", "Sapling", "Shaped", "Ancient"],
    "fern": ["Spore", "Fiddlehead", "Unfurling", "Lush", "Majestic"],
    "sage": ["Seed", "Sprout", "Growing", "Mature", "Sacred"],
}
PLANT_WATERS_PER_STAGE = {"lotus": 5, "bamboo": 4, "bonsai": 7, "fern": 3, "sage": 5}


