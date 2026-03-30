from fastapi import APIRouter, Depends
from deps import db, get_current_user, get_current_user_optional, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/mixer-presets", tags=["Mixer Presets"])

# Featured starter presets (seeded on first request if collection empty)
STARTER_PRESETS = [
    {
        "name": "Morning Awakening",
        "description": "Energize your morning with liberating frequencies, gentle rain, and warm sunrise light",
        "layers": {
            "frequency": {"hz": 396, "label": "396 Hz"},
            "sound": {"id": "rain"},
            "light": {"id": "sunrise"},
        },
        "tags": ["morning", "energy", "awakening"],
    },
    {
        "name": "Deep Meditation",
        "description": "528 Hz love frequency with singing bowl and calming blue immersion",
        "layers": {
            "frequency": {"hz": 528, "label": "528 Hz"},
            "sound": {"id": "singing-bowl"},
            "drone": {"id": "tanpura-drone"},
            "light": {"id": "calm-blue"},
        },
        "tags": ["meditation", "deep", "calm"],
    },
    {
        "name": "Creative Flow",
        "description": "Unlock intuition with sitar drones, crackling fire, and aurora light",
        "layers": {
            "frequency": {"hz": 741, "label": "741 Hz"},
            "sound": {"id": "fire"},
            "drone": {"id": "sitar-drone"},
            "light": {"id": "aurora"},
        },
        "tags": ["creative", "flow", "inspiration"],
    },
    {
        "name": "Sleep Journey",
        "description": "Schumann resonance with ocean waves, violet flame, and starfield for deep sleep",
        "layers": {
            "frequency": {"hz": 7.83, "label": "7.83 Hz"},
            "sound": {"id": "ocean"},
            "light": {"id": "violet-flame"},
            "video": {"id": "stars"},
        },
        "volumes": {"freqVol": 30, "soundVol": 40, "lightOpacity": 30, "videoOpacity": 25},
        "tags": ["sleep", "relax", "dream"],
    },
    {
        "name": "Heart Opening",
        "description": "Harmony frequency with gentle wind, healing green light, and cedar flute",
        "layers": {
            "frequency": {"hz": 639, "label": "639 Hz"},
            "sound": {"id": "wind"},
            "drone": {"id": "flute-drone"},
            "light": {"id": "healing-green"},
        },
        "tags": ["heart", "love", "healing"],
    },
    {
        "name": "Third Eye Activation",
        "description": "Awaken spiritual vision with 852 Hz, singing bowl drone, and northern lights",
        "layers": {
            "frequency": {"hz": 852, "label": "852 Hz"},
            "drone": {"id": "bowl-drone"},
            "light": {"id": "violet-flame"},
            "video": {"id": "northern-lights"},
        },
        "volumes": {"freqVol": 60, "droneVol": 50, "lightOpacity": 40, "videoOpacity": 35},
        "tags": ["spiritual", "intuition", "vision"],
    },
    {
        "name": "Forest Retreat",
        "description": "Cedar flute with rain, healing green, and forest video for nature immersion",
        "layers": {
            "sound": {"id": "rain"},
            "drone": {"id": "flute-drone"},
            "light": {"id": "healing-green"},
            "video": {"id": "forest"},
        },
        "volumes": {"soundVol": 55, "droneVol": 35, "lightOpacity": 25, "videoOpacity": 50},
        "tags": ["nature", "forest", "grounding"],
    },
    {
        "name": "Cosmic Dance",
        "description": "Divine 963 Hz with erhu drone, golden light, and campfire warmth",
        "layers": {
            "frequency": {"hz": 963, "label": "963 Hz"},
            "drone": {"id": "erhu-drone"},
            "sound": {"id": "fire"},
            "light": {"id": "golden"},
        },
        "tags": ["cosmic", "dance", "divine"],
    },
]


async def seed_featured_presets():
    count = await db.mixer_presets.count_documents({"is_featured": True})
    if count == 0:
        for p in STARTER_PRESETS:
            doc = {
                "id": str(uuid.uuid4()),
                "name": p["name"],
                "description": p["description"],
                "layers": p["layers"],
                "volumes": p.get("volumes", {}),
                "tags": p.get("tags", []),
                "creator_id": "system",
                "creator_name": "Cosmic Collective",
                "is_public": True,
                "is_featured": True,
                "likes": [],
                "like_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.mixer_presets.insert_one(doc)


@router.get("/featured")
async def get_featured_presets():
    await seed_featured_presets()
    presets = await db.mixer_presets.find(
        {"is_featured": True}, {"_id": 0}
    ).sort("name", 1).to_list(50)
    return presets


@router.get("/community")
async def get_community_presets(skip: int = 0, limit: int = 30):
    presets = await db.mixer_presets.find(
        {"is_public": True}, {"_id": 0}
    ).sort("like_count", -1).skip(skip).limit(limit).to_list(limit)
    return presets


@router.get("/mine")
async def get_my_presets(user=Depends(get_current_user)):
    presets = await db.mixer_presets.find(
        {"creator_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return presets


@router.post("")
async def save_preset(body: dict, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.get("name", "Untitled Mix"),
        "description": body.get("description", ""),
        "layers": body.get("layers", {}),
        "volumes": body.get("volumes", {}),
        "tags": body.get("tags", []),
        "creator_id": user["id"],
        "creator_name": user.get("name", ""),
        "is_public": body.get("is_public", False),
        "is_featured": False,
        "likes": [],
        "like_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.mixer_presets.insert_one(doc)
    doc.pop("_id", None)

    if body.get("is_public"):
        await create_activity(user["id"], "mixer_preset", f"shared a mix preset: {doc['name']}")

    return doc


@router.post("/{preset_id}/like")
async def toggle_like(preset_id: str, user=Depends(get_current_user)):
    preset = await db.mixer_presets.find_one({"id": preset_id}, {"_id": 0})
    if not preset:
        from fastapi import HTTPException
        raise HTTPException(404, "Preset not found")

    likes = preset.get("likes", [])
    if user["id"] in likes:
        likes.remove(user["id"])
    else:
        likes.append(user["id"])

    await db.mixer_presets.update_one(
        {"id": preset_id},
        {"$set": {"likes": likes, "like_count": len(likes)}}
    )
    return {"liked": user["id"] in likes, "like_count": len(likes)}


@router.delete("/{preset_id}")
async def delete_preset(preset_id: str, user=Depends(get_current_user)):
    result = await db.mixer_presets.delete_one({"id": preset_id, "creator_id": user["id"]})
    if result.deleted_count == 0:
        from fastapi import HTTPException
        raise HTTPException(404, "Preset not found or not yours")
    return {"deleted": True}


# ─── Playlists ───

STARTER_PLAYLISTS = [
    {
        "name": "Morning to Night Journey",
        "description": "A full-day meditation progression from awakening energy to deep sleep",
        "steps": [
            {"preset_name": "Morning Awakening", "duration": 30},
            {"preset_name": "Heart Opening", "duration": 30},
            {"preset_name": "Creative Flow", "duration": 25},
            {"preset_name": "Deep Meditation", "duration": 30},
            {"preset_name": "Sleep Journey", "duration": 40},
        ],
        "tags": ["journey", "full-day", "progression"],
    },
    {
        "name": "Quick Recharge",
        "description": "15-minute energy boost — clear, activate, ground",
        "steps": [
            {"preset_name": "Third Eye Activation", "duration": 5},
            {"preset_name": "Creative Flow", "duration": 5},
            {"preset_name": "Forest Retreat", "duration": 5},
        ],
        "tags": ["quick", "recharge", "energy"],
    },
    {
        "name": "Deep Sleep Protocol",
        "description": "45-minute wind-down sequence for restful sleep",
        "steps": [
            {"preset_name": "Heart Opening", "duration": 10},
            {"preset_name": "Deep Meditation", "duration": 15},
            {"preset_name": "Sleep Journey", "duration": 20},
        ],
        "tags": ["sleep", "night", "relaxation"],
    },
    {
        "name": "Cosmic Exploration",
        "description": "Journey through spiritual dimensions with ascending frequencies",
        "steps": [
            {"preset_name": "Forest Retreat", "duration": 10},
            {"preset_name": "Deep Meditation", "duration": 15},
            {"preset_name": "Third Eye Activation", "duration": 15},
            {"preset_name": "Cosmic Dance", "duration": 15},
        ],
        "tags": ["cosmic", "spiritual", "exploration"],
    },
]


async def seed_playlists():
    count = await db.mixer_playlists.count_documents({"is_featured": True})
    if count > 0:
        return
    # Resolve preset names to IDs
    all_presets = await db.mixer_presets.find({"is_featured": True}, {"_id": 0, "id": 1, "name": 1}).to_list(50)
    name_to_id = {p["name"]: p["id"] for p in all_presets}

    for pl in STARTER_PLAYLISTS:
        steps = []
        for s in pl["steps"]:
            pid = name_to_id.get(s["preset_name"])
            if pid:
                steps.append({"preset_id": pid, "preset_name": s["preset_name"], "duration": s["duration"]})
        if not steps:
            continue
        total = sum(s["duration"] for s in steps)
        doc = {
            "id": str(uuid.uuid4()),
            "name": pl["name"],
            "description": pl["description"],
            "steps": steps,
            "total_minutes": total,
            "tags": pl.get("tags", []),
            "creator_id": "system",
            "creator_name": "Cosmic Collective",
            "is_public": True,
            "is_featured": True,
            "likes": [],
            "like_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.mixer_playlists.insert_one(doc)


@router.get("/playlists/featured")
async def get_featured_playlists():
    await seed_featured_presets()
    await seed_playlists()
    playlists = await db.mixer_playlists.find({"is_featured": True}, {"_id": 0}).sort("name", 1).to_list(50)
    return playlists


@router.get("/playlists/community")
async def get_community_playlists(skip: int = 0, limit: int = 30):
    playlists = await db.mixer_playlists.find({"is_public": True}, {"_id": 0}).sort("like_count", -1).skip(skip).limit(limit).to_list(limit)
    return playlists


@router.get("/playlists/mine")
async def get_my_playlists(user=Depends(get_current_user)):
    playlists = await db.mixer_playlists.find({"creator_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return playlists


@router.post("/playlists")
async def save_playlist(body: dict, user=Depends(get_current_user)):
    steps = body.get("steps", [])
    total = sum(s.get("duration", 10) for s in steps)
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.get("name", "Untitled Journey"),
        "description": body.get("description", ""),
        "steps": steps,
        "total_minutes": total,
        "tags": body.get("tags", []),
        "creator_id": user["id"],
        "creator_name": user.get("name", ""),
        "is_public": body.get("is_public", False),
        "is_featured": False,
        "likes": [],
        "like_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.mixer_playlists.insert_one(doc)
    doc.pop("_id", None)
    if body.get("is_public"):
        await create_activity(user["id"], "mixer_playlist", f"shared a journey: {doc['name']}")
    return doc


@router.post("/playlists/{playlist_id}/like")
async def toggle_playlist_like(playlist_id: str, user=Depends(get_current_user)):
    pl = await db.mixer_playlists.find_one({"id": playlist_id}, {"_id": 0})
    if not pl:
        from fastapi import HTTPException
        raise HTTPException(404, "Playlist not found")
    likes = pl.get("likes", [])
    if user["id"] in likes:
        likes.remove(user["id"])
    else:
        likes.append(user["id"])
    await db.mixer_playlists.update_one({"id": playlist_id}, {"$set": {"likes": likes, "like_count": len(likes)}})
    return {"liked": user["id"] in likes, "like_count": len(likes)}


@router.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str, user=Depends(get_current_user)):
    result = await db.mixer_playlists.delete_one({"id": playlist_id, "creator_id": user["id"]})
    if result.deleted_count == 0:
        from fastapi import HTTPException
        raise HTTPException(404, "Playlist not found or not yours")
    return {"deleted": True}
