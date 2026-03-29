from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import ProfileCustomize
import asyncio

COVER_PRESETS = [
    {"id": "cosmic-nebula", "url": "", "label": "Cosmic Nebula"},
    {"id": "zen-garden", "url": "", "label": "Zen Garden"},
    {"id": "ocean-waves", "url": "", "label": "Ocean Waves"},
    {"id": "mountain-peak", "url": "", "label": "Mountain Peak"},
    {"id": "sacred-geometry", "url": "", "label": "Sacred Geometry"},
    {"id": "aurora-borealis", "url": "", "label": "Aurora Borealis"},
]

@router.get("/profile/covers")
async def get_cover_presets():
    return COVER_PRESETS

@router.put("/profile/customize")
async def customize_profile(data: ProfileCustomize, user=Depends(get_current_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No changes provided")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.profiles.update_one(
        {"user_id": user["id"]},
        {"$set": update, "$setOnInsert": {"user_id": user["id"], "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return profile

@router.get("/profile/me")
async def get_my_profile(user=Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not profile:
        return {"user_id": user["id"], "display_name": user_doc.get("name"), "bio": "", "cover_image": COVER_PRESETS[0]["url"], "theme_color": "#D8B4FE", "avatar_style": "purple-teal", "vibe_status": "", "favorite_quote": "", "music_choice": "none", "music_frequency": 432, "show_stats": True, "show_activity": True, "visibility": "public", "message_privacy": "everyone"}
    profile["display_name"] = profile.get("display_name") or user_doc.get("name")
    profile.setdefault("visibility", "public")
    profile.setdefault("message_privacy", "everyone")
    return profile

@router.get("/profile/public/{user_id}")
async def get_public_profile_full(user_id: str, user=Depends(get_current_user_optional)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "email": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0}) or {}

    visibility = profile.get("visibility", "public")
    viewer_id = user.get("id") if user else None
    is_owner = viewer_id == user_id

    # Check visibility permissions
    if not is_owner:
        if visibility == "private":
            return {
                "id": user_id,
                "display_name": profile.get("display_name") or user_doc.get("name"),
                "avatar_style": profile.get("avatar_style", "purple-teal"),
                "theme_color": profile.get("theme_color", "#D8B4FE"),
                "visibility": "private",
                "restricted": True,
                "message": "This profile is private.",
            }
        if visibility == "friends":
            is_friend = False
            if viewer_id:
                # Check mutual follows (both follow each other = friends)
                fwd = await db.follows.find_one({"follower_id": viewer_id, "following_id": user_id})
                rev = await db.follows.find_one({"follower_id": user_id, "following_id": viewer_id})
                is_friend = bool(fwd and rev)
            if not is_friend:
                return {
                    "id": user_id,
                    "display_name": profile.get("display_name") or user_doc.get("name"),
                    "avatar_style": profile.get("avatar_style", "purple-teal"),
                    "theme_color": profile.get("theme_color", "#D8B4FE"),
                    "visibility": "friends",
                    "restricted": True,
                    "message": "This profile is only visible to friends.",
                }

    mood_count, journal_count, post_count, ritual_sessions, challenge_count, follower_count, recent_posts = await asyncio.gather(
        db.moods.count_documents({"user_id": user_id}),
        db.journal.count_documents({"user_id": user_id}),
        db.community_posts.count_documents({"user_id": user_id}),
        db.ritual_completions.count_documents({"user_id": user_id}),
        db.challenge_participants.count_documents({"user_id": user_id}),
        db.follows.count_documents({"following_id": user_id}),
        db.community_posts.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(5),
    )
    return {
        "id": user_id,
        "name": user_doc.get("name"),
        "display_name": profile.get("display_name") or user_doc.get("name"),
        "bio": profile.get("bio", ""),
        "vibe_status": profile.get("vibe_status", ""),
        "favorite_quote": profile.get("favorite_quote", ""),
        "cover_image": profile.get("cover_image", COVER_PRESETS[0]["url"]),
        "avatar_style": profile.get("avatar_style", "purple-teal"),
        "avatar_url": profile.get("avatar_url"),
        "theme_color": profile.get("theme_color", "#D8B4FE"),
        "music_choice": profile.get("music_choice", "none"),
        "music_frequency": profile.get("music_frequency", 432),
        "show_stats": profile.get("show_stats", True),
        "show_activity": profile.get("show_activity", True),
        "visibility": visibility,
        "restricted": False,
        "member_since": user_doc.get("created_at"),
        "stats": {"moods": mood_count, "journals": journal_count, "posts": post_count, "rituals": ritual_sessions, "challenges": challenge_count, "followers": follower_count},
        "recent_posts": recent_posts
    }


