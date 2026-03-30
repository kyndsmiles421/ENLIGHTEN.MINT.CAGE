import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from deps import db, get_current_user, logger

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AVATAR SHOWCASE GALLERY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/starseed/gallery/publish")
async def publish_to_gallery(data: dict = Body(...), user=Depends(get_current_user)):
    """Publish avatar to the community gallery."""
    avatar = await db.spiritual_avatars.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    if not avatar or not avatar.get("avatar_base64"):
        raise HTTPException(status_code=400, detail="Generate an avatar first before publishing")

    existing = await db.avatar_gallery.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )

    title = data.get("title", "").strip()[:80] or f"{user.get('name', 'Starseed')}'s Creation"
    description = data.get("description", "").strip()[:200]

    gallery_entry = {
        "id": existing["id"] if existing else str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous Starseed"),
        "title": title,
        "description": description,
        "avatar_base64": avatar["avatar_base64"],
        "selections": avatar.get("selections", {}),
        "custom_notes": avatar.get("custom_notes", ""),
        "radiate_count": existing.get("radiate_count", 0) if existing else 0,
        "radiated_by": existing.get("radiated_by", []) if existing else [],
        "published_at": existing.get("published_at", datetime.now(timezone.utc).isoformat()) if existing else datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.avatar_gallery.update_one(
        {"user_id": user["id"]},
        {"$set": gallery_entry},
        upsert=True,
    )
    return {"published": True, "gallery_id": gallery_entry["id"]}


@router.get("/starseed/gallery")
async def browse_gallery(
    base_form: str = Query(None),
    aura: str = Query(None),
    sort: str = Query("recent"),
    page: int = Query(1),
    limit: int = Query(20),
    user=Depends(get_current_user),
):
    """Browse the avatar gallery with optional filters."""
    query = {}

    if base_form:
        query["selections.base_form"] = base_form
    if aura:
        query["selections.aura"] = aura

    sort_key = {"recent": ("updated_at", -1), "popular": ("radiate_count", -1), "oldest": ("published_at", 1)}
    sort_field, sort_dir = sort_key.get(sort, ("updated_at", -1))

    skip = (max(1, page) - 1) * limit
    total = await db.avatar_gallery.count_documents(query)

    entries = await db.avatar_gallery.find(
        query, {"_id": 0, "avatar_base64": 0}
    ).sort(sort_field, sort_dir).skip(skip).limit(min(limit, 50)).to_list(50)

    # Add thumbnail (first 500 chars of base64 for preview, or flag)
    for entry in entries:
        entry["has_avatar"] = True
        entry["user_radiated"] = user["id"] in entry.get("radiated_by", [])

    # Get available filter options
    all_forms = await db.avatar_gallery.distinct("selections.base_form")
    all_auras = await db.avatar_gallery.distinct("selections.aura")

    return {
        "entries": entries,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
        "filters": {
            "base_forms": [f for f in all_forms if f],
            "auras": [a for a in all_auras if a],
        },
    }


@router.get("/starseed/gallery/{gallery_id}")
async def get_gallery_entry(gallery_id: str, user=Depends(get_current_user)):
    """Get a single gallery entry with full avatar image."""
    entry = await db.avatar_gallery.find_one(
        {"id": gallery_id}, {"_id": 0}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Gallery entry not found")

    entry["user_radiated"] = user["id"] in entry.get("radiated_by", [])
    return {"entry": entry}


@router.get("/starseed/gallery/{gallery_id}/traits")
async def get_gallery_traits(gallery_id: str, user=Depends(get_current_user)):
    """View the trait selections of a gallery avatar (inspiration mode)."""
    entry = await db.avatar_gallery.find_one(
        {"id": gallery_id}, {"_id": 0, "selections": 1, "custom_notes": 1, "user_name": 1, "title": 1}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Gallery entry not found")
    return {"traits": entry}


@router.post("/starseed/gallery/{gallery_id}/radiate")
async def radiate_avatar(gallery_id: str, user=Depends(get_current_user)):
    """Send cosmic energy (upvote) to an avatar."""
    entry = await db.avatar_gallery.find_one(
        {"id": gallery_id}, {"_id": 0}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Gallery entry not found")

    if entry.get("user_id") == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot radiate your own avatar")

    radiated_by = entry.get("radiated_by", [])
    already_radiated = user["id"] in radiated_by

    if already_radiated:
        radiated_by.remove(user["id"])
        new_count = max(0, entry.get("radiate_count", 0) - 1)
    else:
        radiated_by.append(user["id"])
        new_count = entry.get("radiate_count", 0) + 1

    await db.avatar_gallery.update_one(
        {"id": gallery_id},
        {"$set": {"radiated_by": radiated_by, "radiate_count": new_count}}
    )
    return {"radiate_count": new_count, "user_radiated": not already_radiated}
