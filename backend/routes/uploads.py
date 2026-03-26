from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File, Form
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/uploads/media")
async def upload_media(
    file: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    media_type: str = Form("audio"),
    tags: str = Form(""),
    user=Depends(get_current_user),
):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 50MB.")

    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    allowed = {".mp3", ".wav", ".ogg", ".m4a", ".aac", ".mp4", ".webm", ".mov"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed. Allowed: {', '.join(allowed)}")

    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    doc = {
        "id": file_id,
        "user_id": user["id"],
        "title": title or file.filename or "Untitled",
        "description": description,
        "media_type": media_type,
        "filename": filename,
        "original_name": file.filename,
        "file_size": len(content),
        "file_ext": ext,
        "tags": [t.strip() for t in tags.split(",") if t.strip()] if tags else [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.user_uploads.insert_one(doc)
    return {"status": "uploaded", "id": file_id, "filename": filename}


@router.get("/uploads/my")
async def get_my_uploads(user=Depends(get_current_user)):
    uploads = await db.user_uploads.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"uploads": uploads}


@router.delete("/uploads/{file_id}")
async def delete_upload(file_id: str, user=Depends(get_current_user)):
    doc = await db.user_uploads.find_one({"id": file_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    filepath = os.path.join(UPLOAD_DIR, doc.get("filename", ""))
    if os.path.exists(filepath):
        os.remove(filepath)
    await db.user_uploads.delete_one({"id": file_id, "user_id": user["id"]})
    return {"status": "deleted"}


@router.get("/uploads/file/{filename}")
async def serve_file(filename: str):
    from fastapi.responses import FileResponse
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)
