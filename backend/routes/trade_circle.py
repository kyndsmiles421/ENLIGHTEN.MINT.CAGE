from fastapi import APIRouter, HTTPException, Depends, Body, Query
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid
import os

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

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
    valid_categories = {"readings", "healing", "guidance", "meditation", "crafted", "botanical", "frequency_recipe", "goods", "services", "other", "both"}
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail="Invalid category")

    # Gravity mass — items with heavier mass sink lower in the UI grid
    gravity_mass = data.get("gravity_mass", 50)
    if category == "botanical":
        gravity_mass = max(60, min(100, gravity_mass))
    elif category == "frequency_recipe":
        gravity_mass = max(40, min(90, gravity_mass))
    else:
        gravity_mass = max(30, min(80, gravity_mass))

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
        "gravity_mass": gravity_mass,
        "element": data.get("element"),
        "frequency": data.get("frequency"),
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
    {"id": "botanical", "name": "Botanicals", "icon": "leaf", "color": "#22C55E"},
    {"id": "frequency_recipe", "name": "Frequency Recipes", "icon": "zap", "color": "#EAB308"},
    {"id": "goods", "name": "Physical Goods", "icon": "package", "color": "#FB923C"},
    {"id": "other", "name": "Other", "icon": "sparkles", "color": "#94A3B8"},
]


@router.get("/trade-circle/categories")
async def get_categories():
    """Get available trade categories."""
    return {"categories": TRADE_CATEGORIES}



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AI MERCHANT — The "Central Bank"
#  All real-value transactions flow through here.
#  No P2P cash. Server-managed closed-loop.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI_MERCHANT_CATALOG = [
    # Dust packs — Tiered pricing. Bigger = better discount.
    # Base Tier: Standard price (no discount)
    {"id": "dust_500", "name": "Dust Cache", "type": "dust", "amount": 500, "price_credits": 3, "tier": "base", "discount": 0, "description": "500 Cosmic Dust — Base Rate"},
    # Medium Tier: 15% Discount
    {"id": "dust_2000", "name": "Dust Vein", "type": "dust", "amount": 2000, "price_credits": 10, "tier": "medium", "discount": 15, "description": "2,000 Cosmic Dust — 15% Discount"},
    # Premium Tier: 30% Discount (Supernova Bundle)
    {"id": "dust_5000", "name": "Dust Supernova", "type": "dust", "amount": 5000, "price_credits": 18, "tier": "premium", "discount": 30, "description": "5,000 Cosmic Dust — 30% SUPERNOVA Discount"},
    # Gem packs
    {"id": "gems_50", "name": "Gem Cluster", "type": "gems", "amount": 50, "price_credits": 5, "tier": "base", "discount": 0, "description": "50 Stardust Shards"},
    {"id": "gems_200", "name": "Gem Trove", "type": "gems", "amount": 200, "price_credits": 15, "tier": "medium", "discount": 15, "description": "200 Stardust Shards — 15% Discount"},
    # Starseed components
    {"id": "comp_hull", "name": "Hull Plating Blueprint", "type": "component", "component": "hull_plating", "category": "defense", "power": 5, "price_credits": 8, "tier": "base", "discount": 0, "description": "Pre-fabricated Hull Plating for your Starseed vessel"},
    {"id": "comp_nav", "name": "Signal Booster Kit", "type": "component", "component": "signal_booster", "category": "navigation", "power": 4, "price_credits": 6, "tier": "base", "discount": 0, "description": "Navigation Signal Booster"},
    {"id": "comp_engine", "name": "Resonance Drive Core", "type": "component", "component": "resonance_drive", "category": "propulsion", "power": 7, "price_credits": 12, "tier": "base", "discount": 0, "description": "High-tier engine component"},
]

RETURN_PENALTY_PCT = 30  # 30% processing fee on all sell-back/refunds

# Transaction tax (Resonance Fee) — percentage taken by the Central Bank on P2P escrow trades
RESONANCE_FEE_PCT = 5  # 5%


@router.get("/trade-circle/ai-merchant")
async def ai_merchant_catalog(user=Depends(get_current_user)):
    """AI Merchant — the stabilized storefront. All items have fixed server-set prices."""
    user_id = user["id"]
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1, "user_dust_balance": 1})
    credits = u.get("user_credit_balance", 0) if u else 0
    dust = u.get("user_dust_balance", 0) if u else 0

    return {
        "catalog": AI_MERCHANT_CATALOG,
        "your_credits": credits,
        "your_dust": dust,
        "resonance_fee_pct": RESONANCE_FEE_PCT,
        "merchant_message": "Welcome, Traveler. I trade in certainties. My prices are fixed, my stock unlimited.",
    }


@router.post("/trade-circle/ai-merchant/buy")
async def ai_merchant_buy(data: dict = Body(...), user=Depends(get_current_user)):
    """Buy from the AI Merchant using Credits (closed-loop — Credits are server-issued)."""
    item_id = data.get("item_id", "")
    quantity = max(1, data.get("quantity", 1))

    item = next((i for i in AI_MERCHANT_CATALOG if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in Merchant catalog")

    total_cost = item["price_credits"] * quantity
    user_id = user["id"]

    # Check credits
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    current_credits = u.get("user_credit_balance", 0) if u else 0
    if current_credits < total_cost:
        raise HTTPException(status_code=400, detail=f"Need {total_cost} Credits. Have {current_credits}.")

    # Deduct credits
    await db.users.update_one({"id": user_id}, {"$inc": {"user_credit_balance": -total_cost}})

    # Deliver goods
    total_amount = item.get("amount", 1) * quantity
    delivery = {"type": item["type"], "amount": total_amount}

    if item["type"] == "dust":
        await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": total_amount}})
    elif item["type"] == "gems":
        await db.users.update_one({"id": user_id}, {"$inc": {"user_gem_balance": total_amount}})
    elif item["type"] == "component":
        comp = {
            "user_id": user_id,
            "id": str(uuid.uuid4()),
            "specimen_id": f"merchant_{item_id}",
            "component": item["component"],
            "category": item["category"],
            "power": item["power"] * quantity,
            "source": "ai_merchant",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.starseed_components.insert_one(comp)
        delivery["component"] = item["component"]

    # Log transaction
    await db.merchant_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "item_id": item_id,
        "item_name": item["name"],
        "quantity": quantity,
        "total_credits": total_cost,
        "delivery": delivery,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    await create_activity(user_id, "merchant_purchase", f"Bought {item['name']} x{quantity} from AI Merchant")

    return {
        "purchased": item["name"],
        "quantity": quantity,
        "credits_spent": total_cost,
        "delivered": delivery,
        "remaining_credits": current_credits - total_cost,
    }


@router.post("/trade-circle/ai-merchant/sell")
async def ai_merchant_sell(data: dict = Body(...), user=Depends(get_current_user)):
    """Sell resources back to the Cosmic Broker. Applies a 30% Central Bank Processing Fee."""
    resource = data.get("resource", "")  # "dust" or "gems"
    amount = data.get("amount", 0)

    if resource not in ("dust", "gems"):
        raise HTTPException(status_code=400, detail="Can only sell dust or gems")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    user_id = user["id"]

    # Buyback rates
    if resource == "dust":
        field = "user_dust_balance"
        credits_per_unit = 1 / 200  # 200 dust = 1 credit base
    else:
        field = "user_gem_balance"
        credits_per_unit = 1 / 15   # 15 gems = 1 credit base

    u = await db.users.find_one({"id": user_id}, {"_id": 0, field: 1})
    current = u.get(field, 0) if u else 0
    if current < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient {resource}. Have {current}, need {amount}.")

    # Calculate credits BEFORE penalty
    raw_credits = max(1, int(amount * credits_per_unit))
    # Apply 30% Central Bank Processing Fee
    penalty = max(1, int(raw_credits * RETURN_PENALTY_PCT / 100))
    credits_earned = max(1, raw_credits - penalty)

    await db.users.update_one({"id": user_id}, {"$inc": {field: -amount, "user_credit_balance": credits_earned}})

    await db.merchant_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "sell",
        "resource": resource,
        "amount": amount,
        "raw_credits": raw_credits,
        "processing_fee": penalty,
        "processing_fee_pct": RETURN_PENALTY_PCT,
        "credits_earned": credits_earned,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "sold": resource, "amount": amount,
        "raw_credits": raw_credits,
        "processing_fee": penalty,
        "processing_fee_pct": RETURN_PENALTY_PCT,
        "credits_earned": credits_earned,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC ESCROW — Phygital Hold & Release
#  Server-managed. Digital assets locked until
#  physical delivery is verified.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESCROW_STATES = ["committed", "shipped", "received", "released", "disputed", "cancelled"]


@router.post("/trade-circle/escrow/create")
async def create_escrow(data: dict = Body(...), user=Depends(get_current_user)):
    """Create an escrow for a physical-digital trade. Locks digital assets server-side."""
    offer_id = data.get("offer_id", "")
    digital_asset_type = data.get("digital_asset_type", "credits")  # credits, dust, gems, component
    digital_amount = data.get("digital_amount", 0)
    physical_description = data.get("physical_description", "").strip()

    if not offer_id or not physical_description:
        raise HTTPException(status_code=400, detail="Offer ID and physical description required")
    if digital_amount <= 0:
        raise HTTPException(status_code=400, detail="Digital amount must be positive")

    # Verify the offer is accepted
    offer = await db.trade_offers.find_one({"id": offer_id, "status": "accepted"}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Accepted trade offer not found")

    # Determine sender (physical) and receiver
    sender_id = user["id"]
    if sender_id == offer["lister_id"]:
        receiver_id = offer["offerer_id"]
    elif sender_id == offer["offerer_id"]:
        receiver_id = offer["lister_id"]
    else:
        raise HTTPException(status_code=403, detail="You are not part of this trade")

    # Lock the digital assets from the RECEIVER (they pay digital for the physical item)
    balance_field = {"credits": "user_credit_balance", "dust": "user_dust_balance", "gems": "user_gem_balance"}.get(digital_asset_type)
    if not balance_field:
        raise HTTPException(status_code=400, detail="Invalid digital asset type")

    u = await db.users.find_one({"id": receiver_id}, {"_id": 0, balance_field: 1})
    current = u.get(balance_field, 0) if u else 0

    # Apply resonance fee
    fee = max(1, int(digital_amount * RESONANCE_FEE_PCT / 100))
    total_locked = digital_amount + fee

    if current < total_locked:
        raise HTTPException(status_code=400, detail=f"Receiver needs {total_locked} {digital_asset_type} (incl. {fee} Resonance Fee). Has {current}.")

    # Deduct from receiver and lock in escrow
    await db.users.update_one({"id": receiver_id}, {"$inc": {balance_field: -total_locked}})

    escrow_id = str(uuid.uuid4())
    resonance_code = f"RC-{escrow_id[:8].upper()}"

    escrow = {
        "id": escrow_id,
        "offer_id": offer_id,
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "physical_description": physical_description[:500],
        "digital_asset_type": digital_asset_type,
        "digital_amount": digital_amount,
        "resonance_fee": fee,
        "total_locked": total_locked,
        "resonance_code": resonance_code,
        "tracking_id": None,
        "state": "committed",
        "state_history": [{"state": "committed", "at": datetime.now(timezone.utc).isoformat(), "by": sender_id}],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.escrows.insert_one(escrow)
    escrow.pop("_id", None)

    await create_activity(sender_id, "escrow_created", f"Escrow created: {physical_description[:50]}")

    return {
        "escrow": escrow,
        "resonance_code": resonance_code,
        "message": f"Digital assets locked. {digital_amount} {digital_asset_type} + {fee} fee held in Cosmic Escrow.",
    }


@router.post("/trade-circle/escrow/ship")
async def escrow_ship(data: dict = Body(...), user=Depends(get_current_user)):
    """Sender marks the physical item as shipped with a tracking ID."""
    escrow_id = data.get("escrow_id", "")
    tracking_id = data.get("tracking_id", "").strip()

    if not escrow_id:
        raise HTTPException(status_code=400, detail="Escrow ID required")

    escrow = await db.escrows.find_one({"id": escrow_id}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if escrow["sender_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the sender can mark as shipped")
    if escrow["state"] != "committed":
        raise HTTPException(status_code=400, detail=f"Cannot ship from state '{escrow['state']}'")

    now = datetime.now(timezone.utc).isoformat()
    await db.escrows.update_one({"id": escrow_id}, {"$set": {
        "state": "shipped",
        "tracking_id": tracking_id or f"SELF-{escrow_id[:6].upper()}",
        "shipped_at": now,
    }, "$push": {"state_history": {"state": "shipped", "at": now, "by": user["id"], "tracking": tracking_id}}})

    return {"state": "shipped", "tracking_id": tracking_id, "message": "Shipment recorded. Awaiting receiver confirmation."}


@router.post("/trade-circle/escrow/confirm-receipt")
async def escrow_confirm_receipt(data: dict = Body(...), user=Depends(get_current_user)):
    """Receiver confirms physical delivery. Releases digital assets to sender."""
    escrow_id = data.get("escrow_id", "")

    escrow = await db.escrows.find_one({"id": escrow_id}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if escrow["receiver_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the receiver can confirm receipt")
    if escrow["state"] != "shipped":
        raise HTTPException(status_code=400, detail=f"Cannot confirm from state '{escrow['state']}'")

    now = datetime.now(timezone.utc).isoformat()

    # Release digital assets to sender (minus the fee — fee goes to the Central Bank / burned)
    balance_field = {"credits": "user_credit_balance", "dust": "user_dust_balance", "gems": "user_gem_balance"}.get(escrow["digital_asset_type"])
    await db.users.update_one({"id": escrow["sender_id"]}, {"$inc": {balance_field: escrow["digital_amount"]}})

    # Mark escrow as released
    await db.escrows.update_one({"id": escrow_id}, {"$set": {
        "state": "released",
        "released_at": now,
    }, "$push": {"state_history": {"state": "released", "at": now, "by": user["id"]}}})

    # Award karma to both parties
    await award_karma(escrow["sender_id"], "trade_completed", escrow_id)
    await award_karma(escrow["receiver_id"], "trade_completed", escrow_id)

    await create_activity(escrow["sender_id"], "escrow_released", f"Escrow released! +{escrow['digital_amount']} {escrow['digital_asset_type']}")
    await create_activity(escrow["receiver_id"], "escrow_released", "Physical item confirmed received")

    return {
        "state": "released",
        "released_to_sender": escrow["digital_amount"],
        "asset_type": escrow["digital_asset_type"],
        "resonance_fee_burned": escrow["resonance_fee"],
        "message": "Cosmic Escrow released! Trade complete.",
    }


@router.post("/trade-circle/escrow/dispute")
async def escrow_dispute(data: dict = Body(...), user=Depends(get_current_user)):
    """Either party can dispute an escrow. Freezes until admin resolution."""
    escrow_id = data.get("escrow_id", "")
    reason = data.get("reason", "").strip()

    escrow = await db.escrows.find_one({"id": escrow_id}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if user["id"] not in (escrow["sender_id"], escrow["receiver_id"]):
        raise HTTPException(status_code=403, detail="You are not part of this escrow")
    if escrow["state"] in ("released", "cancelled"):
        raise HTTPException(status_code=400, detail="Cannot dispute a completed or cancelled escrow")

    now = datetime.now(timezone.utc).isoformat()
    await db.escrows.update_one({"id": escrow_id}, {"$set": {
        "state": "disputed",
        "disputed_at": now,
        "dispute_reason": reason[:500],
        "disputed_by": user["id"],
    }, "$push": {"state_history": {"state": "disputed", "at": now, "by": user["id"], "reason": reason}}})

    return {"state": "disputed", "message": "Escrow frozen. Admin will review."}


@router.get("/trade-circle/escrows")
async def get_my_escrows(user=Depends(get_current_user)):
    """Get all escrows involving the current user."""
    escrows = await db.escrows.find(
        {"$or": [{"sender_id": user["id"]}, {"receiver_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"escrows": escrows}


@router.get("/trade-circle/escrow/{escrow_id}")
async def get_escrow(escrow_id: str, user=Depends(get_current_user)):
    """Get a single escrow detail."""
    escrow = await db.escrows.find_one({"id": escrow_id}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if user["id"] not in (escrow["sender_id"], escrow["receiver_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    return escrow


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC BROKER — Stripe Credit Purchase
#  Real money → Resonance Credits. The ONLY gateway.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BROKER_CREDIT_PACKS = [
    {"id": "broker_5", "name": "Spark", "credits": 5, "price_cents": 99, "price_display": "$0.99", "bonus": 0},
    {"id": "broker_25", "name": "Ember", "credits": 25, "price_cents": 499, "price_display": "$4.99", "bonus": 2},
    {"id": "broker_60", "name": "Flame", "credits": 60, "price_cents": 999, "price_display": "$9.99", "bonus": 8},
    {"id": "broker_150", "name": "Inferno", "credits": 150, "price_cents": 2499, "price_display": "$24.99", "bonus": 25},
]

BROKER_PACK_MAP = {p["id"]: p for p in BROKER_CREDIT_PACKS}


@router.get("/trade-circle/wallet")
async def get_wallet(user=Depends(get_current_user)):
    """Get user's Trade Circle wallet — credits, dust, gems."""
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0, "user_credit_balance": 1, "user_dust_balance": 1, "user_gem_balance": 1})
    return {
        "credits": u.get("user_credit_balance", 0) if u else 0,
        "dust": u.get("user_dust_balance", 0) if u else 0,
        "gems": u.get("user_gem_balance", 0) if u else 0,
    }


@router.get("/trade-circle/broker/packs")
async def broker_packs(user=Depends(get_current_user)):
    """Get available credit packs from the Cosmic Broker."""
    return {"packs": BROKER_CREDIT_PACKS}


@router.post("/trade-circle/broker/buy-credits")
async def broker_buy_credits(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase Resonance Credits from the Cosmic Broker via Stripe."""
    pack_id = data.get("pack_id", "")
    pack = BROKER_PACK_MAP.get(pack_id)
    if not pack:
        raise HTTPException(status_code=400, detail="Invalid credit pack")

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_API_KEY,
            webhook_url=data.get("webhook_url", ""),
        )
        total_credits = pack["credits"] + pack["bonus"]
        session = await stripe_checkout.create_session(
            line_items=[{
                "name": f"Cosmic Broker: {pack['name']}",
                "description": f"{total_credits} Resonance Credits" + (f" (includes {pack['bonus']} bonus)" if pack["bonus"] else ""),
                "amount": pack["price_cents"],
                "quantity": 1,
            }],
            success_url=data.get("success_url", ""),
            cancel_url=data.get("cancel_url", ""),
        )

        await db.broker_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "pack_id": pack_id,
            "credits": total_credits,
            "amount_cents": pack["price_cents"],
            "session_id": session.session_id,
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        return {"checkout_url": session.checkout_url, "session_id": session.session_id}
    except Exception as e:
        logger.error(f"Broker Stripe error: {e}")
        raise HTTPException(status_code=500, detail="Payment service unavailable")


@router.post("/trade-circle/broker/verify-payment")
async def broker_verify_payment(data: dict = Body(...), user=Depends(get_current_user)):
    """Verify a Stripe payment and award credits. Called after Stripe redirect."""
    session_id = data.get("session_id", "")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")

    tx = await db.broker_transactions.find_one({"session_id": session_id, "user_id": user["id"]}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.get("payment_status") == "paid":
        return {"status": "already_credited", "credits": tx["credits"]}

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        session = await stripe_checkout.get_session(session_id)

        if session.payment_status == "paid":
            await db.users.update_one({"id": user["id"]}, {"$inc": {"user_credit_balance": tx["credits"]}})
            await db.broker_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
            )
            await create_activity(user["id"], "broker_purchase", f"Purchased {tx['credits']} Resonance Credits")
            return {"status": "credited", "credits": tx["credits"]}
        else:
            return {"status": "pending", "payment_status": session.payment_status}
    except Exception as e:
        logger.error(f"Broker verify error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")


@router.get("/trade-circle/broker/history")
async def broker_history(user=Depends(get_current_user)):
    """Get user's Broker transaction history."""
    txs = await db.broker_transactions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    return {"transactions": txs}


# ━━━ Phonetic & Vocal Asset Types ━━━
LINGUISTIC_ASSET_TYPES = {"phonetic_mantra", "vocal_signature"}

@router.post("/trade-circle/escrow/linguistic/create")
async def create_linguistic_escrow(data: dict = Body(...), user=Depends(get_current_user)):
    """Create an escrow for a linguistic asset trade. Requires resonance verification."""
    asset_type = data.get("asset_type", "")
    if asset_type not in LINGUISTIC_ASSET_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid asset type. Must be one of: {', '.join(LINGUISTIC_ASSET_TYPES)}")

    listing_id = data.get("listing_id", "")
    if not listing_id:
        raise HTTPException(status_code=400, detail="listing_id required")

    listing = await db.trade_listings.find_one({"id": listing_id, "status": "active"}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or inactive")
    if listing["user_id"] == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot escrow your own listing")

    # Check mastery tier for linguistic assets
    buyer_mastery = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    buyer_tier = buyer_mastery.get("current_tier", 0) if buyer_mastery else 0
    if buyer_tier < 1:
        raise HTTPException(status_code=403, detail="Tier 1 mastery required to trade linguistic assets")

    escrow = {
        "id": str(uuid.uuid4()),
        "listing_id": listing_id,
        "asset_type": asset_type,
        "seller_id": listing["user_id"],
        "buyer_id": user["id"],
        "status": "pending_verification",
        "resonance_verified": False,
        "verification_data": data.get("verification_data", {}),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trade_escrows.insert_one(escrow)
    escrow.pop("_id", None)
    return escrow


@router.post("/trade-circle/escrow/{escrow_id}/verify")
async def verify_escrow_resonance(escrow_id: str, data: dict = Body(...), user=Depends(get_current_user)):
    """Verify resonance match for an escrowed linguistic asset."""
    escrow = await db.trade_escrows.find_one({"id": escrow_id}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if escrow["buyer_id"] != user["id"] and escrow["seller_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not a party to this escrow")
    if escrow["status"] != "pending_verification":
        raise HTTPException(status_code=400, detail=f"Escrow status is {escrow['status']}, not verifiable")

    frequency_match = data.get("frequency_match", 0)
    vowel_match = data.get("vowel_match", "")
    accuracy = data.get("accuracy", 0)

    verified = accuracy >= 85
    new_status = "verified" if verified else "verification_failed"

    await db.trade_escrows.update_one(
        {"id": escrow_id},
        {"$set": {
            "resonance_verified": verified,
            "verification_accuracy": accuracy,
            "verification_frequency": frequency_match,
            "verification_vowel": vowel_match,
            "status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }}
    )

    if verified:
        # Complete the trade
        await db.trade_escrows.update_one(
            {"id": escrow_id},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        await award_karma(escrow["buyer_id"], "trade_completed", escrow_id)
        await award_karma(escrow["seller_id"], "trade_completed", escrow_id)

    return {
        "escrow_id": escrow_id,
        "verified": verified,
        "accuracy": accuracy,
        "status": new_status if not verified else "completed",
    }


@router.get("/trade-circle/escrows")
async def get_user_escrows(user=Depends(get_current_user)):
    """Get user's escrow history (as buyer or seller)."""
    escrows = await db.trade_escrows.find(
        {"$or": [{"buyer_id": user["id"]}, {"seller_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    return {"escrows": escrows}


@router.post("/trade-circle/listings/linguistic")
async def create_linguistic_listing(data: dict = Body(...), user=Depends(get_current_user)):
    """Create a listing specifically for linguistic assets (phonetic_mantra or vocal_signature)."""
    asset_type = data.get("asset_type", "")
    if asset_type not in LINGUISTIC_ASSET_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid asset type. Must be: {', '.join(LINGUISTIC_ASSET_TYPES)}")

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    frequency_signature = data.get("frequency_signature", {})

    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    # Verify seller has mastery
    seller_mastery = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    seller_tier = seller_mastery.get("current_tier", 0) if seller_mastery else 0
    if seller_tier < 1:
        raise HTTPException(status_code=403, detail="Tier 1 mastery required to list linguistic assets")

    listing = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous"),
        "title": title,
        "description": description[:500],
        "category": asset_type,
        "offering": f"Linguistic Asset: {asset_type.replace('_', ' ').title()}",
        "seeking": data.get("seeking", "Resonance exchange")[:200],
        "frequency_signature": frequency_signature,
        "asset_type": asset_type,
        "images": [],
        "status": "active",
        "offer_count": 0,
        "requires_escrow": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trade_listings.insert_one(listing)
    await create_activity(user["id"], "trade_listing", f"Listed linguistic asset: {title}")
    await award_karma(user["id"], "listing_created", listing["id"])
    listing.pop("_id", None)
    return listing


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BOTANICAL TRADE — Plants & Frequency Recipes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELEMENT_FREQUENCY = {
    "Wood": 396.0, "Fire": 528.0, "Earth": 639.0, "Metal": 741.0, "Water": 852.0,
}

@router.post("/trade-circle/botanical-listing")
async def create_botanical_listing(data: dict = Body(...), user=Depends(get_current_user)):
    """Create a trade listing for botanical seeds, cuttings, or frequency recipes."""
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    plant_id = data.get("plant_id", "")
    element = data.get("element", "Earth")
    nature = data.get("nature", "Neutral")
    listing_type = data.get("listing_type", "botanical")  # botanical or frequency_recipe
    frequency = ELEMENT_FREQUENCY.get(element, 639.0)

    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    # Compute gravity mass from TCM properties
    element_w = {"Wood": 10, "Fire": 15, "Earth": 12, "Metal": 8, "Water": 14}.get(element, 12)
    nature_w = {"Hot": 15, "Warm": 10, "Neutral": 5, "Cool": 10, "Cold": 15}.get(nature, 5)
    gravity_mass = 60 + element_w + nature_w

    listing = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous"),
        "title": title,
        "description": description[:500],
        "category": listing_type,
        "offering": data.get("offering", title)[:200],
        "seeking": data.get("seeking", "Resonance exchange")[:200],
        "plant_id": plant_id,
        "element": element,
        "nature": nature,
        "frequency": frequency,
        "gravity_mass": gravity_mass,
        "images": [],
        "status": "active",
        "offer_count": 0,
        "requires_escrow": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trade_listings.insert_one(listing)
    await create_activity(user["id"], "trade_listing", f"Listed botanical: {title}")
    await award_karma(user["id"], "listing_created", listing["id"])
    listing.pop("_id", None)
    return listing


@router.get("/trade-circle/gravity-weighted")
async def get_gravity_weighted_listings(user=Depends(get_current_user)):
    """Get listings sorted by gravity mass — heavier items sink to bottom."""
    listings = await db.trade_listings.find(
        {"status": "active"},
        {"_id": 0}
    ).sort("gravity_mass", -1).to_list(50)

    # Assign visual positioning based on mass
    for i, listing in enumerate(listings):
        mass = listing.get("gravity_mass", 50)
        listing["visual_scale"] = 0.8 + (mass / 100) * 0.4  # 0.8x to 1.2x
        listing["visual_depth"] = mass / 100  # 0.0 to 1.0 depth layer
        listing["element_color"] = {
            "Wood": "#22C55E", "Fire": "#EF4444", "Earth": "#F59E0B",
            "Metal": "#94A3B8", "Water": "#3B82F6"
        }.get(listing.get("element", ""), "#94A3B8")

    return {"listings": listings}
