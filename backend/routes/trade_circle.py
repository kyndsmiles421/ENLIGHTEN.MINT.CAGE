from fastapi import APIRouter, HTTPException, Depends, Body, Query
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.post("/trade-circle/listings")
async def create_listing(data: dict = Body(...), user=Depends(get_current_user)):
    """Create a new trade listing."""
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "goods")
    offering = data.get("offering", "").strip()
    seeking = data.get("seeking", "").strip()
    images = data.get("images", [])

    if not title or not offering:
        raise HTTPException(status_code=400, detail="Title and offering are required")
    if category not in ("goods", "services", "both"):
        raise HTTPException(status_code=400, detail="Invalid category")

    listing = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous"),
        "title": title,
        "description": description[:500],
        "category": category,
        "offering": offering[:200],
        "seeking": seeking[:200],
        "images": images[:4],
        "status": "active",
        "offer_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trade_listings.insert_one(listing)
    await create_activity(user["id"], "trade_listing", f"Listed: {title}")
    listing.pop("_id", None)
    return listing


@router.get("/trade-circle/listings")
async def get_listings(
    category: str = Query(None),
    search: str = Query(None),
    status: str = Query("active"),
    skip: int = Query(0),
    limit: int = Query(20),
    user=Depends(get_current_user),
):
    """Browse trade listings with optional filters."""
    query = {"status": status}
    if category and category != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"offering": {"$regex": search, "$options": "i"}},
            {"seeking": {"$regex": search, "$options": "i"}},
        ]

    total = await db.trade_listings.count_documents(query)
    listings = await db.trade_listings.find(
        query, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    return {"listings": listings, "total": total, "skip": skip, "limit": limit}


@router.get("/trade-circle/my-listings")
async def get_my_listings(user=Depends(get_current_user)):
    """Get current user's listings."""
    listings = await db.trade_listings.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"listings": listings}


@router.get("/trade-circle/listings/{listing_id}")
async def get_listing(listing_id: str, user=Depends(get_current_user)):
    """Get a single listing with its offers."""
    listing = await db.trade_listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    offers = await db.trade_offers.find(
        {"listing_id": listing_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)

    return {"listing": listing, "offers": offers}


@router.put("/trade-circle/listings/{listing_id}")
async def update_listing(listing_id: str, data: dict = Body(...), user=Depends(get_current_user)):
    """Update own listing."""
    listing = await db.trade_listings.find_one({"id": listing_id, "user_id": user["id"]})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not yours")

    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    for field in ["title", "description", "offering", "seeking", "category", "status"]:
        if field in data:
            updates[field] = data[field]

    await db.trade_listings.update_one({"id": listing_id}, {"$set": updates})
    return {"status": "updated"}


@router.delete("/trade-circle/listings/{listing_id}")
async def delete_listing(listing_id: str, user=Depends(get_current_user)):
    """Delete own listing."""
    result = await db.trade_listings.delete_one({"id": listing_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found or not yours")
    await db.trade_offers.delete_many({"listing_id": listing_id})
    return {"status": "deleted"}


@router.post("/trade-circle/offers")
async def make_offer(data: dict = Body(...), user=Depends(get_current_user)):
    """Make a trade offer on a listing."""
    listing_id = data.get("listing_id", "")
    offer_text = data.get("offer_text", "").strip()
    offer_items = data.get("offer_items", "").strip()

    if not listing_id or not offer_items:
        raise HTTPException(status_code=400, detail="Listing ID and offer items required")

    listing = await db.trade_listings.find_one({"id": listing_id, "status": "active"}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not active")
    if listing["user_id"] == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot make an offer on your own listing")

    existing = await db.trade_offers.find_one({
        "listing_id": listing_id, "offerer_id": user["id"], "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending offer on this listing")

    offer = {
        "id": str(uuid.uuid4()),
        "listing_id": listing_id,
        "listing_title": listing["title"],
        "offerer_id": user["id"],
        "offerer_name": user.get("name", "Anonymous"),
        "lister_id": listing["user_id"],
        "offer_items": offer_items[:200],
        "offer_text": offer_text[:300],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trade_offers.insert_one(offer)
    await db.trade_listings.update_one({"id": listing_id}, {"$inc": {"offer_count": 1}})
    await create_activity(user["id"], "trade_offer", f"Offered on: {listing['title']}")
    offer.pop("_id", None)
    return offer


@router.get("/trade-circle/my-offers")
async def get_my_offers(user=Depends(get_current_user)):
    """Get offers made by the user and offers received on user's listings."""
    sent = await db.trade_offers.find(
        {"offerer_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)

    received = await db.trade_offers.find(
        {"lister_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)

    return {"sent": sent, "received": received}


@router.post("/trade-circle/offers/{offer_id}/respond")
async def respond_to_offer(offer_id: str, data: dict = Body(...), user=Depends(get_current_user)):
    """Accept or decline an offer (only the listing owner can do this)."""
    action = data.get("action", "")
    if action not in ("accept", "decline"):
        raise HTTPException(status_code=400, detail="Action must be 'accept' or 'decline'")

    offer = await db.trade_offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer["lister_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the listing owner can respond")
    if offer["status"] != "pending":
        raise HTTPException(status_code=400, detail="Offer already responded to")

    new_status = "accepted" if action == "accept" else "declined"
    await db.trade_offers.update_one({"id": offer_id}, {"$set": {
        "status": new_status,
        "responded_at": datetime.now(timezone.utc).isoformat(),
    }})

    if action == "accept":
        await db.trade_listings.update_one({"id": offer["listing_id"]}, {"$set": {"status": "traded"}})
        await db.trade_offers.update_many(
            {"listing_id": offer["listing_id"], "id": {"$ne": offer_id}, "status": "pending"},
            {"$set": {"status": "declined", "responded_at": datetime.now(timezone.utc).isoformat()}}
        )
        await create_activity(user["id"], "trade_complete", f"Trade completed: {offer['listing_title']}")

    return {"status": new_status, "offer_id": offer_id}


@router.get("/trade-circle/stats")
async def get_trade_stats(user=Depends(get_current_user)):
    """Get trade circle stats."""
    total_active = await db.trade_listings.count_documents({"status": "active"})
    total_traded = await db.trade_listings.count_documents({"status": "traded"})
    my_listings = await db.trade_listings.count_documents({"user_id": user["id"]})
    my_trades = await db.trade_listings.count_documents({"user_id": user["id"], "status": "traded"})
    pending_offers = await db.trade_offers.count_documents({"lister_id": user["id"], "status": "pending"})

    return {
        "total_active": total_active,
        "total_traded": total_traded,
        "my_listings": my_listings,
        "my_trades": my_trades,
        "pending_offers": pending_offers,
    }
