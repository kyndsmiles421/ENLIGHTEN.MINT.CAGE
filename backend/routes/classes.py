from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/classes", tags=["Anthropology Classes"])

# ─── Class Definitions ───
CLASS_ARCHETYPES = {
    "shaman": {
        "id": "shaman",
        "name": "Shaman",
        "title": "The Resonator",
        "description": "Master of frequencies and spiritual synthesis. Unlocks Cymatic Visuals when combining audio modules.",
        "color": "#C084FC",
        "icon": "flame",
        "tier_required": 1,
        "boosted_affinities": ["audio", "spiritual", "healing", "cosmic"],
        "synergy_bonus": 0.25,
        "special_synthesis": "cymatic_visuals",
    },
    "nomad": {
        "id": "nomad",
        "name": "Nomad",
        "title": "The Navigator",
        "description": "Explorer of sacred coordinates and spatial frequencies. Reveals hidden Oracle Coordinates on the Cosmic Map.",
        "color": "#2DD4BF",
        "icon": "compass",
        "tier_required": 1,
        "boosted_affinities": ["spatial", "nature", "grounding", "elemental"],
        "synergy_bonus": 0.20,
        "special_synthesis": "oracle_navigation",
    },
    "architect": {
        "id": "architect",
        "name": "Architect",
        "title": "The Builder",
        "description": "Constructor of sacred geometries and digital blueprints. Can forge custom assets from synthesis patterns.",
        "color": "#FBBF24",
        "icon": "drafting-compass",
        "tier_required": 1,
        "boosted_affinities": ["geometric", "creative", "non-linear", "cosmic"],
        "synergy_bonus": 0.20,
        "special_synthesis": "blueprint_forge",
    },
    "merchant": {
        "id": "merchant",
        "name": "Merchant",
        "title": "The Catalyst",
        "description": "Alchemist of trade and value. Can package synthesis recipes for marketplace sale and earns from the Trade Circle.",
        "color": "#F59E0B",
        "icon": "coins",
        "tier_required": 1,
        "boosted_affinities": ["creative", "non-linear", "elemental", "grounding"],
        "synergy_bonus": 0.15,
        "special_synthesis": "trade_packaging",
    },
}


@router.get("/archetypes")
async def get_archetypes():
    """Return all class archetypes for UI rendering."""
    return list(CLASS_ARCHETYPES.values())


@router.get("/mine")
async def get_my_class(user=Depends(get_current_user)):
    """Get current user's active class."""
    profile = await db.class_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        return {"class_id": None, "class_data": None, "xp": 0, "level": 1}
    archetype = CLASS_ARCHETYPES.get(profile.get("class_id"))
    return {
        "class_id": profile.get("class_id"),
        "class_data": archetype,
        "xp": profile.get("xp", 0),
        "level": profile.get("level", 1),
        "selected_at": profile.get("selected_at"),
    }


@router.post("/select")
async def select_class(body: dict, user=Depends(get_current_user)):
    """Select or switch class archetype."""
    class_id = body.get("class_id")
    if class_id not in CLASS_ARCHETYPES:
        raise HTTPException(400, f"Invalid class: {class_id}")

    now = datetime.now(timezone.utc).isoformat()
    existing = await db.class_profiles.find_one({"user_id": user["id"]})

    if existing:
        await db.class_profiles.update_one(
            {"user_id": user["id"]},
            {"$set": {"class_id": class_id, "selected_at": now}}
        )
    else:
        await db.class_profiles.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "class_id": class_id,
            "xp": 0,
            "level": 1,
            "selected_at": now,
            "created_at": now,
        })

    await create_activity(user["id"], "class_select", f"chose the {CLASS_ARCHETYPES[class_id]['name']} path")

    return {
        "class_id": class_id,
        "class_data": CLASS_ARCHETYPES[class_id],
    }


@router.post("/xp")
async def add_xp(body: dict, user=Depends(get_current_user)):
    """Add XP to the user's class profile (called after synthesis actions)."""
    amount = body.get("amount", 0)
    if amount <= 0:
        raise HTTPException(400, "XP must be positive")

    profile = await db.class_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(404, "No class selected")

    new_xp = profile.get("xp", 0) + amount
    new_level = 1 + new_xp // 100  # Every 100 XP = 1 level

    await db.class_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"xp": new_xp, "level": new_level}}
    )

    return {"xp": new_xp, "level": new_level, "xp_added": amount}
