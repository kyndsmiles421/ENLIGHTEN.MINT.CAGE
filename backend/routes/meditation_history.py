from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from routes.plants import auto_water_plant_for_activity
import uuid

router = APIRouter()


@router.get("/meditation-history")
async def get_meditation_history(user=Depends(get_current_user)):
    uid = user["id"]
    sessions = await db.custom_meditations.find(
        {"user_id": uid}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    guided = await db.guided_meditations.find(
        {"user_id": uid}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    total_minutes = sum(s.get("duration_minutes", s.get("duration", 0)) for s in sessions)
    total_minutes += sum(s.get("duration_minutes", s.get("duration", 0)) for s in guided)
    total_sessions = len(sessions) + len(guided)
    return {
        "sessions": sessions,
        "guided_sessions": guided,
        "stats": {
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "avg_duration": round(total_minutes / total_sessions, 1) if total_sessions > 0 else 0,
        }
    }


@router.post("/meditation-history/log")
async def log_meditation(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": data.get("type", "silent"),
        "duration_minutes": data.get("duration_minutes", 10),
        "focus": data.get("focus", "breath"),
        "intention": data.get("intention", ""),
        "notes": data.get("notes", ""),
        "mood_before": data.get("mood_before", ""),
        "mood_after": data.get("mood_after", ""),
        "depth_rating": data.get("depth_rating", 5),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_meditations.insert_one(doc)
    doc.pop("_id", None)
    # Auto-water a zen garden plant as reward
    plant_growth = await auto_water_plant_for_activity(user["id"], "meditation")

    # Auto-share to community
    share_post = None
    if data.get("share_to_community", False):
        user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
        share_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "user_name": user_doc.get("name", "Anonymous") if user_doc else "Anonymous",
            "post_type": "meditation_complete",
            "content": f"Completed a {data.get('duration_minutes', 0)} minute {data.get('type', 'guided')} meditation focused on {data.get('focus', 'inner peace')}",
            "ritual_data": None,
            "affirmation_text": None,
            "milestone_type": None,
            "milestone_value": None,
            "likes": [],
            "like_count": 0,
            "comment_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.community_posts.insert_one(share_doc)
        share_doc.pop("_id", None)
        share_post = share_doc

    return {"status": "logged", "id": doc["id"], "plant_growth": plant_growth, "shared": share_post}
