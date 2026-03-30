from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/media-library", tags=["Media Library"])


@router.get("")
async def get_my_library(user=Depends(get_current_user)):
    """Get all creations for the current user"""
    items = await db.media_library.find(
        {"creator_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return items


@router.get("/community")
async def get_community_library(skip: int = 0, limit: int = 30, media_type: str = ""):
    """Browse public creations"""
    query = {"is_public": True}
    if media_type:
        query["media_type"] = media_type
    items = await db.media_library.find(
        query, {"_id": 0}
    ).sort("like_count", -1).skip(skip).limit(limit).to_list(limit)
    return items


@router.get("/{item_id}")
async def get_library_item(item_id: str):
    item = await db.media_library.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Item not found")
    # Increment view count
    await db.media_library.update_one({"id": item_id}, {"$inc": {"view_count": 1}})
    return item


@router.post("")
async def save_to_library(body: dict, user=Depends(get_current_user)):
    """Save a creation to the media library"""
    doc = {
        "id": str(uuid.uuid4()),
        "title": body.get("title", "Untitled Creation"),
        "description": body.get("description", ""),
        "media_type": body.get("media_type", "mix_recording"),  # mix_recording, live_recording, journey, custom
        "thumbnail_layers": body.get("thumbnail_layers", []),  # visual layer summary for preview
        "duration_seconds": body.get("duration_seconds", 0),
        "timeline": body.get("timeline", []),  # [{time_sec, mixer_state}] for recordings
        "mixer_snapshot": body.get("mixer_snapshot", {}),  # Static snapshot for presets/mixes
        "tags": body.get("tags", []),
        "creator_id": user["id"],
        "creator_name": user.get("name", ""),
        "is_public": body.get("is_public", False),
        "likes": [],
        "like_count": 0,
        "view_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.media_library.insert_one(doc)
    doc.pop("_id", None)

    if body.get("is_public"):
        await create_activity(user["id"], "media_creation", f"shared: {doc['title']}")

    return doc


@router.put("/{item_id}")
async def update_library_item(item_id: str, body: dict, user=Depends(get_current_user)):
    item = await db.media_library.find_one({"id": item_id, "creator_id": user["id"]}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Item not found or not yours")
    updates = {}
    if "title" in body:
        updates["title"] = body["title"]
    if "description" in body:
        updates["description"] = body["description"]
    if "is_public" in body:
        updates["is_public"] = body["is_public"]
    if "tags" in body:
        updates["tags"] = body["tags"]
    if updates:
        await db.media_library.update_one({"id": item_id}, {"$set": updates})
    return {"updated": True}


@router.post("/{item_id}/like")
async def toggle_like(item_id: str, user=Depends(get_current_user)):
    item = await db.media_library.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Item not found")
    likes = item.get("likes", [])
    if user["id"] in likes:
        likes.remove(user["id"])
    else:
        likes.append(user["id"])
    await db.media_library.update_one(
        {"id": item_id},
        {"$set": {"likes": likes, "like_count": len(likes)}}
    )
    return {"liked": user["id"] in likes, "like_count": len(likes)}


@router.delete("/{item_id}")
async def delete_library_item(item_id: str, user=Depends(get_current_user)):
    result = await db.media_library.delete_one({"id": item_id, "creator_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(404, "Item not found or not yours")
    return {"deleted": True}
