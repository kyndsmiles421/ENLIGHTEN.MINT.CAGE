"""
atmosphere_journal.py — Atmosphere Journal API
Captures, persists, and retrieves Sage FX mood snapshots.
Authenticated users store in MongoDB; guests use frontend localStorage.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from deps import db, get_current_user, get_current_user_optional
import uuid

router = APIRouter(prefix="/atmosphere", tags=["atmosphere"])


class AtmosphereSave(BaseModel):
    name: str
    filters: dict
    source_prompt: Optional[str] = "Manual Adjustment"


class AtmosphereUpdate(BaseModel):
    name: Optional[str] = None


@router.post("/save")
async def save_atmosphere(data: AtmosphereSave, user=Depends(get_current_user)):
    doc = {
        "id": f"atm_{uuid.uuid4().hex[:12]}",
        "user_id": user["id"],
        "name": data.name,
        "filters": data.filters,
        "source_prompt": data.source_prompt,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.atmosphere_journal.insert_one(doc)
    doc.pop("_id", None)
    return {"status": "saved", "atmosphere": doc}


@router.get("/gallery")
async def get_gallery(user=Depends(get_current_user)):
    cursor = db.atmosphere_journal.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50)
    items = await cursor.to_list(length=50)
    return {"gallery": items}


@router.delete("/{atm_id}")
async def delete_atmosphere(atm_id: str, user=Depends(get_current_user)):
    result = await db.atmosphere_journal.delete_one({"id": atm_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        return {"status": "not_found"}
    return {"status": "deleted"}


@router.patch("/{atm_id}")
async def rename_atmosphere(atm_id: str, data: AtmosphereUpdate, user=Depends(get_current_user)):
    update = {}
    if data.name:
        update["name"] = data.name
    if not update:
        return {"status": "no_changes"}
    await db.atmosphere_journal.update_one(
        {"id": atm_id, "user_id": user["id"]},
        {"$set": update}
    )
    return {"status": "updated"}
