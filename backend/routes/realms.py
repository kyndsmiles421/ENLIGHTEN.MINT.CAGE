from fastapi import APIRouter, Depends
from deps import db, get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/realms")

REALMS = [
    {
        "id": "astral_garden",
        "name": "Astral Garden",
        "subtitle": "The Healing Meadow Between Worlds",
        "desc": "A luminous garden where every plant is a living frequency. Walk among flowers that sing 528 Hz and trees that hum with ancient wisdom. Time moves differently here.",
        "color": "#22C55E",
        "gradient": ["#064E3B", "#022C22"],
        "element": "earth",
        "frequency": 528,
        "practices": ["grounding", "plant_medicine", "earth_healing"],
        "ambient": "forest",
        "drone": "flute-drone",
        "unlock_level": 0,
    },
    {
        "id": "crystal_caverns",
        "name": "Crystal Caverns",
        "subtitle": "The Resonance Chambers Below",
        "desc": "Deep beneath the surface, vast caverns of living crystal pulse with geometric light. Each crystal stores the memory of a star system. Touch one and feel its story.",
        "color": "#8B5CF6",
        "gradient": ["#3B0764", "#1E1B4B"],
        "element": "earth",
        "frequency": 963,
        "practices": ["crystal_healing", "sound_bath", "past_life"],
        "ambient": "cave",
        "drone": "bowl-drone",
        "unlock_level": 2,
    },
    {
        "id": "celestial_ocean",
        "name": "Celestial Ocean",
        "subtitle": "The Waters of Cosmic Memory",
        "desc": "An infinite ocean of liquid starlight. Dive beneath the surface to find memories of your soul's journey across lifetimes. The tides move with the breath of the universe.",
        "color": "#06B6D4",
        "gradient": ["#164E63", "#0C4A6E"],
        "element": "water",
        "frequency": 432,
        "practices": ["water_healing", "emotional_release", "dream_work"],
        "ambient": "ocean",
        "drone": "hang-drum-drone",
        "unlock_level": 3,
    },
    {
        "id": "solar_temple",
        "name": "Solar Temple",
        "subtitle": "The Chamber of Divine Fire",
        "desc": "A temple built of concentrated sunlight at the center of a dying star. Here, transformation is absolute. What enters as lead leaves as gold. Bring only what you wish to transmute.",
        "color": "#F59E0B",
        "gradient": ["#78350F", "#451A03"],
        "element": "fire",
        "frequency": 741,
        "practices": ["fire_ceremony", "transmutation", "willpower"],
        "ambient": "fire",
        "drone": "tibetan-horn",
        "unlock_level": 5,
    },
    {
        "id": "void_sanctum",
        "name": "The Void Sanctum",
        "subtitle": "Where All Becomes Nothing Becomes All",
        "desc": "Beyond the last star, beyond the edge of thought, lies the Void. Not emptiness, but infinite potential. Here, you can unmake and remake yourself. Approach with reverence.",
        "color": "#818CF8",
        "gradient": ["#1E1B4B", "#0B0A15"],
        "element": "ether",
        "frequency": 7.83,
        "practices": ["void_meditation", "ego_death", "rebirth"],
        "ambient": "night",
        "drone": "tanpura-drone",
        "unlock_level": 8,
    },
    {
        "id": "aurora_bridge",
        "name": "Aurora Bridge",
        "subtitle": "The Rainbow Path Between Dimensions",
        "desc": "A bridge of living light connecting all realms. Walk its prismatic surface and feel every chakra activate in sequence. At its center, you can see all possible timelines.",
        "color": "#EC4899",
        "gradient": ["#831843", "#4A044E"],
        "element": "air",
        "frequency": 852,
        "practices": ["chakra_alignment", "timeline_healing", "interdimensional"],
        "ambient": "wind",
        "drone": "harp-drone",
        "unlock_level": 10,
    },
]


@router.get("/")
async def get_realms():
    return REALMS


@router.get("/{realm_id}")
async def get_realm(realm_id: str):
    realm = next((r for r in REALMS if r["id"] == realm_id), None)
    if not realm:
        from fastapi import HTTPException
        raise HTTPException(404, "Realm not found")
    return realm


@router.post("/{realm_id}/enter")
async def enter_realm(realm_id: str, user=Depends(get_current_user)):
    """Log a realm visit for the user."""
    realm = next((r for r in REALMS if r["id"] == realm_id), None)
    if not realm:
        from fastapi import HTTPException
        raise HTTPException(404, "Realm not found")

    visit = {
        "user_id": user["id"],
        "realm_id": realm_id,
        "realm_name": realm["name"],
        "entered_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.realm_visits.insert_one(visit)

    # Count total visits for this user
    total = await db.realm_visits.count_documents({"user_id": user["id"]})
    realm_visits = await db.realm_visits.count_documents({"user_id": user["id"], "realm_id": realm_id})

    return {
        "realm": realm,
        "total_visits": total,
        "realm_visits": realm_visits,
        "suggested_frequency": realm["frequency"],
        "suggested_ambient": realm["ambient"],
        "suggested_drone": realm["drone"],
    }


@router.get("/visits/stats")
async def get_visit_stats(user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$group": {"_id": "$realm_id", "count": {"$sum": 1}, "last_visit": {"$max": "$entered_at"}}},
        {"$sort": {"count": -1}},
    ]
    stats = await db.realm_visits.aggregate(pipeline).to_list(20)
    return [{"realm_id": s["_id"], "visits": s["count"], "last_visit": s["last_visit"]} for s in stats]
