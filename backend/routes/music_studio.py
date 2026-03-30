from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
UPLOAD_DIR = "/app/uploads"


# ─── Custom Background Upload ───

@router.post("/backgrounds/upload")
async def upload_custom_background(
    image: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """Upload a custom virtual background image."""
    content = await image.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

    ext = image.filename.split(".")[-1].lower() if image.filename and "." in image.filename else "jpg"
    if ext not in ("jpg", "jpeg", "png", "webp"):
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP allowed")

    file_id = str(uuid.uuid4())
    filename = f"bg_{file_id}.{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    doc = {
        "id": file_id,
        "user_id": user["id"],
        "filename": filename,
        "url": f"/api/uploads/file/{filename}",
        "name": image.filename or "Custom Background",
        "size": len(content),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_backgrounds.insert_one(doc)
    return {"id": file_id, "url": doc["url"], "name": doc["name"]}


@router.get("/backgrounds/my")
async def get_my_backgrounds(user=Depends(get_current_user)):
    """Get user's uploaded custom backgrounds."""
    items = await db.custom_backgrounds.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"backgrounds": items}


@router.delete("/backgrounds/{bg_id}")
async def delete_custom_background(bg_id: str, user=Depends(get_current_user)):
    """Delete a custom background."""
    bg = await db.custom_backgrounds.find_one({"id": bg_id, "user_id": user["id"]})
    if not bg:
        raise HTTPException(status_code=404, detail="Background not found")
    filepath = os.path.join(UPLOAD_DIR, bg["filename"])
    if os.path.exists(filepath):
        os.remove(filepath)
    await db.custom_backgrounds.delete_one({"id": bg_id})
    return {"deleted": True}


# ─── Music Recordings ───

@router.post("/music/recordings")
async def save_recording(data: dict = Body(...), user=Depends(get_current_user)):
    """Save a music recording."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": data.get("title", "Untitled"),
        "instrument": data.get("instrument", ""),
        "duration": data.get("duration", 0),
        "notes": data.get("notes", []),
        "bpm": data.get("bpm", 120),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.music_recordings.insert_one(doc)
    return {"id": doc["id"], "title": doc["title"]}


@router.get("/music/recordings")
async def get_my_recordings(user=Depends(get_current_user)):
    """Get user's saved music recordings."""
    items = await db.music_recordings.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"recordings": items}


@router.delete("/music/recordings/{rec_id}")
async def delete_recording(rec_id: str, user=Depends(get_current_user)):
    """Delete a recording."""
    result = await db.music_recordings.delete_one({"id": rec_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recording not found")
    return {"deleted": True}


@router.get("/music/recordings/{rec_id}")
async def get_recording(rec_id: str, user=Depends(get_current_user)):
    """Get a specific recording."""
    rec = await db.music_recordings.find_one({"id": rec_id}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    return rec
