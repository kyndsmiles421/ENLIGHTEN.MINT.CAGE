from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import PlantCreate

PLANT_STAGES = {
    "lotus": ["Seed", "Sprout", "Bud", "Bloom", "Full Bloom"],
    "bamboo": ["Seed", "Shoot", "Young", "Tall", "Flourishing"],
    "bonsai": ["Seed", "Seedling", "Sapling", "Shaped", "Ancient"],
    "fern": ["Spore", "Fiddlehead", "Unfurling", "Lush", "Majestic"],
    "sage": ["Seed", "Sprout", "Growing", "Mature", "Sacred"],
}

PLANT_WATERS_PER_STAGE = {
    "lotus": 5,
    "bamboo": 4,
    "bonsai": 7,
    "fern": 3,
    "sage": 5,
}


@router.get("/zen-garden/plants")
async def get_plants(user=Depends(get_current_user)):
    await reset_plant_watering()
    plants = await db.zen_plants.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return plants

@router.post("/zen-garden/plants")
async def create_plant(data: PlantCreate, user=Depends(get_current_user)):
    if data.plant_type not in PLANT_STAGES:
        raise HTTPException(status_code=400, detail="Invalid plant type")
    count = await db.zen_plants.count_documents({"user_id": user["id"]})
    if count >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 plants")
    plant = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "plant_type": data.plant_type,
        "stage": PLANT_STAGES[data.plant_type][0],
        "water_count": 0,
        "waters_this_stage": 0,
        "watered_today": False,
        "last_watered": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.zen_plants.insert_one(plant)
    plant.pop("_id", None)
    return plant

@router.post("/zen-garden/plants/{plant_id}/water")
async def water_plant(plant_id: str, user=Depends(get_current_user)):
    plant = await db.zen_plants.find_one({"id": plant_id, "user_id": user["id"]})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    today = datetime.now(timezone.utc).date().isoformat()
    if plant.get("last_watered") == today:
        raise HTTPException(status_code=400, detail="Already watered today")
    stages = PLANT_STAGES.get(plant["plant_type"], ["Seed"])
    waters_needed = PLANT_WATERS_PER_STAGE.get(plant["plant_type"], 5)
    new_waters = plant.get("waters_this_stage", 0) + 1
    grew = False
    new_stage = plant["stage"]
    if new_waters >= waters_needed:
        current_idx = stages.index(plant["stage"]) if plant["stage"] in stages else 0
        if current_idx < len(stages) - 1:
            new_stage = stages[current_idx + 1]
            grew = True
            new_waters = 0
    await db.zen_plants.update_one({"id": plant_id}, {"$set": {
        "water_count": plant.get("water_count", 0) + 1,
        "waters_this_stage": new_waters,
        "watered_today": True,
        "last_watered": today,
        "stage": new_stage,
    }})
    return {"grew": grew, "stage": new_stage, "water_count": plant.get("water_count", 0) + 1}

# Reset watered_today at midnight (called lazily on plant fetch)
async def reset_plant_watering():
    """Reset watered_today for plants not watered today."""
    today = datetime.now(timezone.utc).date().isoformat()
    await db.zen_plants.update_many(
        {"last_watered": {"$ne": today}},
        {"$set": {"watered_today": False}}
    )


