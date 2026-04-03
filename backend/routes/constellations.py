from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, get_current_user_optional, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/constellations", tags=["Constellations"])

# Tier limits for constellation saves
TIER_LIMITS = {0: 3, 1: 50, 2: -1}  # -1 = unlimited


@router.post("")
async def save_constellation(body: dict, user=Depends(get_current_user)):
    """Save an orbital mixer configuration as a Constellation Recipe."""
    tier = user.get("tier", 0)
    limit = TIER_LIMITS.get(tier, 3)

    if limit >= 0:
        count = await db.constellations.count_documents({"creator_id": user["id"]})
        if count >= limit:
            raise HTTPException(
                403,
                f"Tier {tier} allows {limit} constellation{'s' if limit != 1 else ''}. Upgrade to save more."
            )

    module_ids = body.get("module_ids", [])
    if not module_ids:
        raise HTTPException(400, "At least one module required")

    doc = {
        "id": str(uuid.uuid4()),
        "name": body.get("name", "Untitled Constellation"),
        "description": body.get("description", ""),
        "module_ids": module_ids,
        "synergies": body.get("synergies", []),
        "tags": body.get("tags", []),
        "creator_id": user["id"],
        "creator_name": user.get("name", "Anonymous"),
        "is_public": body.get("is_public", False),
        "is_for_sale": body.get("is_for_sale", False),
        "price": body.get("price", 0),
        "likes": [],
        "like_count": 0,
        "load_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Only Tier 2 (Sovereignty) can sell
    if doc["is_for_sale"] and tier < 2:
        doc["is_for_sale"] = False
        doc["price"] = 0

    await db.constellations.insert_one(doc)
    doc.pop("_id", None)

    # ─── Mirror Hook: Copy blueprint to Sovereign Ledger (if active) ───
    config = await db.sovereign_config.find_one({"id": "global"}, {"_id": 0})
    if not config or config.get("mirror_active", True):
        await db.sovereign_mirror.insert_one({
            "id": str(uuid.uuid4()),
            "type": "constellation_created",
            "constellation": {
                "id": doc["id"],
                "name": doc["name"],
                "module_ids": doc["module_ids"],
                "synergies": doc["synergies"],
                "tags": doc["tags"],
            },
            "creator_id": user["id"],
            "creator_name": user.get("name", ""),
            "is_public": doc["is_public"],
            "is_for_sale": doc["is_for_sale"],
            "price": doc["price"],
            "created_at": doc["created_at"],
        })

    if doc["is_public"]:
        await create_activity(user["id"], "constellation", f"shared constellation: {doc['name']}")

    return doc


@router.get("/mine")
async def get_my_constellations(user=Depends(get_current_user)):
    items = await db.constellations.find(
        {"creator_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return items


@router.get("/community")
async def get_community_constellations(skip: int = 0, limit: int = 30):
    items = await db.constellations.find(
        {"is_public": True}, {"_id": 0}
    ).sort("like_count", -1).skip(skip).limit(limit).to_list(limit)
    return items


@router.get("/marketplace")
async def get_marketplace_constellations(skip: int = 0, limit: int = 20):
    items = await db.constellations.find(
        {"is_for_sale": True, "is_public": True}, {"_id": 0}
    ).sort("load_count", -1).skip(skip).limit(limit).to_list(limit)
    return items


@router.get("/{constellation_id}")
async def get_constellation(constellation_id: str):
    item = await db.constellations.find_one({"id": constellation_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Constellation not found")
    return item


@router.post("/{constellation_id}/like")
async def toggle_like(constellation_id: str, user=Depends(get_current_user)):
    item = await db.constellations.find_one({"id": constellation_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Constellation not found")

    likes = item.get("likes", [])
    if user["id"] in likes:
        likes.remove(user["id"])
    else:
        likes.append(user["id"])

    await db.constellations.update_one(
        {"id": constellation_id},
        {"$set": {"likes": likes, "like_count": len(likes)}}
    )
    return {"liked": user["id"] in likes, "like_count": len(likes)}


@router.post("/{constellation_id}/load")
async def load_constellation(constellation_id: str, user=Depends(get_current_user_optional)):
    item = await db.constellations.find_one({"id": constellation_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Constellation not found")

    await db.constellations.update_one(
        {"id": constellation_id},
        {"$inc": {"load_count": 1}}
    )

    return {"module_ids": item["module_ids"], "name": item["name"], "synergies": item.get("synergies", [])}


@router.delete("/{constellation_id}")
async def delete_constellation(constellation_id: str, user=Depends(get_current_user)):
    result = await db.constellations.delete_one({"id": constellation_id, "creator_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(404, "Constellation not found or not yours")
    return {"deleted": True}
