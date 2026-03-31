from fastapi import APIRouter, HTTPException, Depends, Body, Query
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

KARMA_AWARDS = {
    "trade_completed": 10,
    "review_given": 3,
    "listing_created": 1,
    "offer_made": 1,
}
KARMA_TIERS = [
    {"min": 0, "name": "Seedling", "color": "#94A3B8"},
    {"min": 10, "name": "Sprout", "color": "#22C55E"},
    {"min": 30, "name": "Bloom", "color": "#2DD4BF"},
    {"min": 60, "name": "Guardian", "color": "#818CF8"},
    {"min": 100, "name": "Elder", "color": "#C084FC"},
    {"min": 200, "name": "Luminary", "color": "#EAB308"},
]


def get_karma_tier(points: int):
    tier = KARMA_TIERS[0]
    for t in KARMA_TIERS:
        if points >= t["min"]:
            tier = t
    return tier


async def award_karma(user_id: str, action: str, related_id: str = ""):
    pts = KARMA_AWARDS.get(action, 0)
    if pts == 0:
        return
    await db.trade_karma.update_one(
        {"user_id": user_id},
        {
            "$inc": {"points": pts, f"breakdown.{action}": pts},
            "$setOnInsert": {"user_id": user_id, "created_at": datetime.now(timezone.utc).isoformat()},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )
    await db.karma_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "points": pts,
        "related_id": related_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


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
    # Valid categories: wellness categories + legacy goods/services
    valid_categories = {"readings", "healing", "guidance", "meditation", "crafted", "other", "goods", "services", "both"}
    if category not in valid_categories:
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
    await award_karma(user["id"], "listing_created", listing["id"])
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
    await award_karma(user["id"], "offer_made", offer["id"])
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
        "lister_confirmed": False,
        "offerer_confirmed": False,
    }})

    if action == "accept":
        # Move listing to "in-trade" (pending handshake), not fully completed yet
        await db.trade_listings.update_one({"id": offer["listing_id"]}, {"$set": {"status": "in-trade"}})
        await db.trade_offers.update_many(
            {"listing_id": offer["listing_id"], "id": {"$ne": offer_id}, "status": "pending"},
            {"$set": {"status": "declined", "responded_at": datetime.now(timezone.utc).isoformat()}}
        )

    return {"status": new_status, "offer_id": offer_id}


@router.post("/trade-circle/offers/{offer_id}/handshake")
async def cosmic_handshake(offer_id: str, user=Depends(get_current_user)):
    """Cosmic Handshake — both parties independently confirm the trade was fulfilled."""
    offer = await db.trade_offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer["status"] != "accepted":
        raise HTTPException(status_code=400, detail="Offer must be accepted before handshake")

    # Determine which party is confirming
    update = {}
    if user["id"] == offer["lister_id"]:
        update["lister_confirmed"] = True
    elif user["id"] == offer["offerer_id"]:
        update["offerer_confirmed"] = True
    else:
        raise HTTPException(status_code=403, detail="You are not part of this trade")

    await db.trade_offers.update_one({"id": offer_id}, {"$set": update})

    # Reload to check if both confirmed
    updated = await db.trade_offers.find_one({"id": offer_id}, {"_id": 0})
    lister_ok = updated.get("lister_confirmed", False) or (user["id"] == offer["lister_id"])
    offerer_ok = updated.get("offerer_confirmed", False) or (user["id"] == offer["offerer_id"])

    if lister_ok and offerer_ok:
        # Both confirmed — complete the trade
        await db.trade_offers.update_one({"id": offer_id}, {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }})
        await db.trade_listings.update_one({"id": offer["listing_id"]}, {"$set": {"status": "traded"}})
        await create_activity(offer["lister_id"], "trade_complete", f"Trade completed: {offer['listing_title']}")
        await create_activity(offer["offerer_id"], "trade_complete", f"Trade completed: {offer['listing_title']}")
        await award_karma(offer["lister_id"], "trade_completed", offer_id)
        await award_karma(offer["offerer_id"], "trade_completed", offer_id)
        return {"status": "completed", "message": "Cosmic Handshake complete — trade fulfilled!"}

    return {"status": "waiting", "message": "Your confirmation recorded. Waiting for the other party."}


@router.get("/trade-circle/stats")
async def get_trade_stats(user=Depends(get_current_user)):
    """Get trade circle stats including karma."""
    total_active = await db.trade_listings.count_documents({"status": "active"})
    total_traded = await db.trade_listings.count_documents({"status": "traded"})
    my_listings = await db.trade_listings.count_documents({"user_id": user["id"]})
    my_trades = await db.trade_listings.count_documents({"user_id": user["id"], "status": "traded"})
    pending_offers = await db.trade_offers.count_documents({"lister_id": user["id"], "status": "pending"})

    karma = await db.trade_karma.find_one({"user_id": user["id"]}, {"_id": 0})
    karma_points = karma["points"] if karma else 0
    tier = get_karma_tier(karma_points)

    reviews = await db.trade_reviews.find({"reviewee_id": user["id"]}, {"_id": 0}).to_list(100)
    avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 1) if reviews else 0

    return {
        "total_active": total_active,
        "total_traded": total_traded,
        "my_listings": my_listings,
        "my_trades": my_trades,
        "pending_offers": pending_offers,
        "karma": karma_points,
        "karma_tier": tier,
        "review_count": len(reviews),
        "avg_rating": avg_rating,
    }


@router.get("/trade-circle/karma/{user_id}")
async def get_user_karma(user_id: str, user=Depends(get_current_user)):
    """Get a user's public karma profile."""
    karma = await db.trade_karma.find_one({"user_id": user_id}, {"_id": 0})
    points = karma["points"] if karma else 0
    tier = get_karma_tier(points)

    reviews = await db.trade_reviews.find(
        {"reviewee_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 1) if reviews else 0

    completed_trades = await db.trade_listings.count_documents({
        "$or": [{"user_id": user_id, "status": "traded"}]
    })
    offers_accepted = await db.trade_offers.count_documents({
        "offerer_id": user_id, "status": "accepted"
    })

    return {
        "user_id": user_id,
        "points": points,
        "tier": tier,
        "reviews": reviews,
        "avg_rating": avg_rating,
        "review_count": len(reviews),
        "completed_trades": completed_trades + offers_accepted,
    }


@router.post("/trade-circle/reviews")
async def leave_review(data: dict = Body(...), user=Depends(get_current_user)):
    """Leave a review for a trade partner after a completed trade."""
    offer_id = data.get("offer_id", "").strip()
    rating = data.get("rating", 0)
    comment = data.get("comment", "").strip()

    if not offer_id:
        raise HTTPException(status_code=400, detail="Offer ID required")
    if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    offer = await db.trade_offers.find_one({"id": offer_id, "status": "accepted"}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Accepted offer not found")

    # Determine who is reviewing whom
    if user["id"] == offer["lister_id"]:
        reviewee_id = offer["offerer_id"]
        reviewee_name = offer["offerer_name"]
    elif user["id"] == offer["offerer_id"]:
        reviewee_id = offer["lister_id"]
        # Look up lister name
        listing = await db.trade_listings.find_one({"id": offer["listing_id"]}, {"_id": 0})
        reviewee_name = listing["user_name"] if listing else "Unknown"
    else:
        raise HTTPException(status_code=403, detail="You are not part of this trade")

    existing = await db.trade_reviews.find_one({
        "offer_id": offer_id, "reviewer_id": user["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this trade")

    review = {
        "id": str(uuid.uuid4()),
        "offer_id": offer_id,
        "listing_id": offer["listing_id"],
        "reviewer_id": user["id"],
        "reviewer_name": user.get("name", "Anonymous"),
        "reviewee_id": reviewee_id,
        "reviewee_name": reviewee_name,
        "rating": int(rating),
        "comment": comment[:300],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trade_reviews.insert_one(review)
    await award_karma(user["id"], "review_given", offer_id)
    review.pop("_id", None)
    return review


@router.get("/trade-circle/karma-leaderboard")
async def karma_leaderboard(user=Depends(get_current_user)):
    """Top 10 karma holders in the Trade Circle."""
    top = await db.trade_karma.find(
        {}, {"_id": 0}
    ).sort("points", -1).limit(10).to_list(10)

    results = []
    for k in top:
        tier = get_karma_tier(k["points"])
        # Get user name
        u = await db.users.find_one({"id": k["user_id"]}, {"_id": 0, "name": 1})
        results.append({
            "user_id": k["user_id"],
            "name": u.get("name", "Anonymous") if u else "Anonymous",
            "points": k["points"],
            "tier": tier,
        })

    return {"leaderboard": results}


@router.get("/trade-circle/trust-score/{user_id}")
async def get_trust_score(user_id: str, user=Depends(get_current_user)):
    """Composite Trust Score = Quantum Coherence (40%) + Trade Rating (40%) + Trade Volume (20%)."""
    from datetime import timedelta

    # 1. Quantum Coherence (practice consistency from last 7 days)
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    mood_count = await db.mood_logs.count_documents({"user_id": user_id, "timestamp": {"$gte": week_ago}})
    journal_count = await db.journals.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    med_count = await db.meditation_sessions.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    breath_count = await db.breath_sessions.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    variety = min(4, sum(1 for c in [mood_count, journal_count, med_count, breath_count] if c > 0))
    frequency = min(20, mood_count + journal_count + med_count + breath_count)
    coherence_raw = (variety * 12.5) + (frequency * 2.5)  # max 100
    coherence_score = min(100, coherence_raw)

    # 2. Trade Rating (average stars from reviews)
    reviews = await db.trade_reviews.find({"reviewee_id": user_id}, {"_id": 0, "rating": 1}).to_list(100)
    avg_rating = (sum(r["rating"] for r in reviews) / len(reviews)) if reviews else 0
    rating_score = (avg_rating / 5) * 100  # normalize to 0-100

    # 3. Trade Volume (completed trades count)
    completed = await db.trade_offers.count_documents({"status": "completed", "$or": [{"lister_id": user_id}, {"offerer_id": user_id}]})
    volume_score = min(100, completed * 10)  # 10 trades = max

    # Composite: 40% coherence + 40% rating + 20% volume
    trust = round(coherence_score * 0.4 + rating_score * 0.4 + volume_score * 0.2)

    # Trust tier
    if trust >= 80:
        trust_tier = {"name": "Cosmic Elder", "color": "#EAB308", "level": 5}
    elif trust >= 60:
        trust_tier = {"name": "Star Guardian", "color": "#C084FC", "level": 4}
    elif trust >= 40:
        trust_tier = {"name": "Light Bearer", "color": "#818CF8", "level": 3}
    elif trust >= 20:
        trust_tier = {"name": "Seeker", "color": "#2DD4BF", "level": 2}
    else:
        trust_tier = {"name": "Newcomer", "color": "#94A3B8", "level": 1}

    return {
        "user_id": user_id,
        "trust_score": trust,
        "trust_tier": trust_tier,
        "breakdown": {
            "coherence": round(coherence_score),
            "rating": round(rating_score),
            "volume": round(volume_score),
        },
        "details": {
            "avg_rating": round(avg_rating, 1),
            "review_count": len(reviews),
            "completed_trades": completed,
        },
    }


TRADE_CATEGORIES = [
    {"id": "readings", "name": "Readings", "icon": "eye", "color": "#C084FC"},
    {"id": "healing", "name": "Healing", "icon": "heart", "color": "#FDA4AF"},
    {"id": "guidance", "name": "Guidance", "icon": "compass", "color": "#2DD4BF"},
    {"id": "meditation", "name": "Meditation", "icon": "moon", "color": "#818CF8"},
    {"id": "crafted", "name": "Crafted Items", "icon": "gem", "color": "#FCD34D"},
    {"id": "other", "name": "Other", "icon": "sparkles", "color": "#94A3B8"},
]


@router.get("/trade-circle/categories")
async def get_categories():
    """Get available trade categories."""
    return {"categories": TRADE_CATEGORIES}

