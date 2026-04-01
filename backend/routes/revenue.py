from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid
import random

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TIER DISCOUNT MATRIX
#  Maps subscription tier to marketplace discount %
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIER_DISCOUNT = {
    "free": 0,
    "starter": 0,
    "plus": 15,       # Premium = 15% off
    "premium": 30,    # Elite = 30% off
    "super_user": 30,
}

TIER_LABEL = {
    "free": "Base",
    "starter": "Base",
    "plus": "Premium",
    "premium": "Elite",
    "super_user": "Elite",
}


async def get_user_tier(user_id: str) -> dict:
    """Get user's subscription tier, discount rate, and fidelity status."""
    u = await db.users.find_one({"id": user_id}, {
        "_id": 0, "credits": 1, "fidelity_boost": 1,
    })
    credits_doc = u.get("credits", {}) if u else {}
    tier_id = credits_doc.get("tier", "free")
    discount = TIER_DISCOUNT.get(tier_id, 0)
    label = TIER_LABEL.get(tier_id, "Base")

    # Check active fidelity boost
    boost = u.get("fidelity_boost", {}) if u else {}
    boost_active = False
    boost_remaining = 0
    if boost and boost.get("expires_at"):
        expires = datetime.fromisoformat(boost["expires_at"])
        if expires > datetime.now(timezone.utc):
            boost_active = True
            boost_remaining = int((expires - datetime.now(timezone.utc)).total_seconds() / 3600)

    return {
        "tier_id": tier_id,
        "tier_label": label,
        "discount_pct": discount,
        "fidelity_boost_active": boost_active,
        "fidelity_boost_hours_remaining": boost_remaining,
        "fidelity_boost_level": boost.get("level", "standard") if boost_active else None,
    }


def apply_tier_discount(base_price: int, discount_pct: int) -> dict:
    """Calculate discounted price and savings."""
    discount_amount = max(0, int(base_price * discount_pct / 100))
    final = max(1, base_price - discount_amount)
    return {"base_price": base_price, "discount_pct": discount_pct, "discount_amount": discount_amount, "final_price": final}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FIDELITY BOOST — Timed Ultra Access
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOOST_PACKS = [
    {"id": "boost_24h", "name": "Instant Refresh", "hours": 24, "level": "ultra",
     "cost_dust": 200, "cost_credits": 3, "description": "24-hour Ultra Fidelity burst"},
    {"id": "boost_3d", "name": "Weekend Pass", "hours": 72, "level": "ultra",
     "cost_dust": 500, "cost_credits": 7, "description": "3-day Premium Atmosphere — 15% savings vs daily"},
    {"id": "boost_7d", "name": "Explorer's Week", "hours": 168, "level": "ultra",
     "cost_dust": 1000, "cost_credits": 12, "description": "7-day Ultra Immersive — 28% savings vs daily"},
]

BOOST_MAP = {b["id"]: b for b in BOOST_PACKS}


@router.get("/fidelity/status")
async def fidelity_status(user=Depends(get_current_user)):
    """Get user's current tier, discount rate, and fidelity boost status."""
    tier = await get_user_tier(user["id"])
    return {
        **tier,
        "boost_packs": BOOST_PACKS,
        "free_trial_eligible": await _check_free_trial(user["id"]),
    }


async def _check_free_trial(user_id: str) -> bool:
    """Check if user qualifies for the free Ultra week."""
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "free_ultra_trial_used": 1, "created_at": 1})
    if not u:
        return False
    if u.get("free_ultra_trial_used"):
        return False
    # Only new users (within 7 days of signup)
    try:
        created = datetime.fromisoformat(u.get("created_at", ""))
        if datetime.now(timezone.utc) - created > timedelta(days=7):
            return False
    except (ValueError, TypeError):
        pass
    return True


@router.post("/fidelity/activate-trial")
async def activate_free_trial(user=Depends(get_current_user)):
    """Activate the free 7-day Ultra trial for new users."""
    user_id = user["id"]
    eligible = await _check_free_trial(user_id)
    if not eligible:
        raise HTTPException(status_code=400, detail="Free trial not available")

    expires = datetime.now(timezone.utc) + timedelta(days=7)
    await db.users.update_one({"id": user_id}, {"$set": {
        "fidelity_boost": {"level": "ultra", "source": "free_trial", "activated_at": datetime.now(timezone.utc).isoformat(), "expires_at": expires.isoformat()},
        "free_ultra_trial_used": True,
    }})

    return {"activated": True, "level": "ultra", "hours": 168, "expires_at": expires.isoformat()}


@router.post("/fidelity/boost")
async def buy_fidelity_boost(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a timed fidelity boost with Dust or Credits."""
    pack_id = data.get("pack_id", "")
    currency = data.get("currency", "dust")  # "dust" or "credits"

    pack = BOOST_MAP.get(pack_id)
    if not pack:
        raise HTTPException(status_code=400, detail="Invalid boost pack")

    user_id = user["id"]
    tier = await get_user_tier(user_id)

    # Apply tier discount to the cost
    if currency == "credits":
        base_cost = pack["cost_credits"]
        pricing = apply_tier_discount(base_cost, tier["discount_pct"])
        cost = pricing["final_price"]
        field = "user_credit_balance"
    else:
        base_cost = pack["cost_dust"]
        pricing = apply_tier_discount(base_cost, tier["discount_pct"])
        cost = pricing["final_price"]
        field = "user_dust_balance"

    u = await db.users.find_one({"id": user_id}, {"_id": 0, field: 1, "fidelity_boost": 1})
    balance = u.get(field, 0) if u else 0
    if balance < cost:
        raise HTTPException(status_code=400, detail=f"Need {cost} {currency}. Have {balance}.")

    # Stack onto existing boost if active
    existing_boost = u.get("fidelity_boost", {}) if u else {}
    now = datetime.now(timezone.utc)
    if existing_boost and existing_boost.get("expires_at"):
        try:
            current_exp = datetime.fromisoformat(existing_boost["expires_at"])
            if current_exp > now:
                expires = current_exp + timedelta(hours=pack["hours"])
            else:
                expires = now + timedelta(hours=pack["hours"])
        except (ValueError, TypeError):
            expires = now + timedelta(hours=pack["hours"])
    else:
        expires = now + timedelta(hours=pack["hours"])

    await db.users.update_one({"id": user_id}, {
        "$inc": {field: -cost},
        "$set": {
            "fidelity_boost": {
                "level": pack["level"],
                "source": pack_id,
                "activated_at": now.isoformat(),
                "expires_at": expires.isoformat(),
            },
        },
    })

    await db.boost_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "pack_id": pack_id,
        "currency": currency,
        "base_cost": base_cost,
        "discount_pct": tier["discount_pct"],
        "final_cost": cost,
        "hours": pack["hours"],
        "expires_at": expires.isoformat(),
        "created_at": now.isoformat(),
    })

    hours_left = int((expires - now).total_seconds() / 3600)
    return {
        "activated": True,
        "pack": pack["name"],
        "level": pack["level"],
        "cost": cost,
        "currency": currency,
        "discount_applied": tier["discount_pct"],
        "hours_remaining": hours_left,
        "expires_at": expires.isoformat(),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AI CONTENT BROKER — Generated Assets Marketplace
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSET_TYPES = {
    "recovery_frequency": {"name": "Recovery Frequency", "source": "Wellness/Mixer", "base_price": 5},
    "victory_mantra": {"name": "Victory Mantra", "source": "RPG/Quests", "base_price": 3},
    "group_immersion": {"name": "Group Immersion", "source": "Community", "base_price": 8},
    "cosmic_blend": {"name": "Cosmic Blend", "source": "AI Mixer", "base_price": 6},
}

SOLFEGGIO_FREQUENCIES = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
BINAURAL_PRESETS = ["alpha_focus", "theta_dream", "delta_sleep", "gamma_insight", "beta_energy"]


async def _generate_ai_mantra(context: str) -> str:
    """Generate a personalized mantra using Gemini."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        llm = LlmChat(api_key=EMERGENT_LLM_KEY)
        llm.with_model("gemini", "gemini-3-flash-preview")
        response = await llm.chat([
            UserMessage(content=f"Generate ONE short, powerful spiritual affirmation or mantra (max 15 words) inspired by this context: {context}. Return only the mantra text, nothing else.")
        ])
        return response.content.strip().strip('"').strip("'")
    except Exception as e:
        logger.error(f"AI mantra gen error: {e}")
        fallback = [
            "Your victory echoes through the cosmos",
            "Strength flows where intention goes",
            "The universe rewards your persistence",
            "You are the author of your own legend",
        ]
        return random.choice(fallback)


async def _generate_frequency_blend(mood: str, activity: str) -> dict:
    """Generate a unique frequency blend based on context."""
    base_freq = random.choice(SOLFEGGIO_FREQUENCIES)
    binaural = random.choice(BINAURAL_PRESETS)
    secondary_freq = random.choice([f for f in SOLFEGGIO_FREQUENCIES if f != base_freq])

    return {
        "primary_hz": base_freq,
        "secondary_hz": secondary_freq,
        "binaural_preset": binaural,
        "blend_name": f"{base_freq}Hz {mood.title()} Resonance",
        "description": f"A {binaural.replace('_', ' ')} blend tuned to {base_freq}Hz, generated from {activity}",
    }


@router.post("/content-broker/generate")
async def generate_content(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate AI content asset after an activity trigger."""
    asset_type = data.get("type", "")
    context = data.get("context", "")
    activity_source = data.get("source", "")

    if asset_type not in ASSET_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid asset type. Options: {list(ASSET_TYPES.keys())}")

    user_id = user["id"]
    asset_config = ASSET_TYPES[asset_type]

    # Generate the content based on type
    content = {}
    if asset_type == "victory_mantra":
        mantra_text = await _generate_ai_mantra(context or "completing a challenging quest")
        content = {"mantra": mantra_text, "energy": "victory", "context": context}
    elif asset_type == "recovery_frequency":
        blend = await _generate_frequency_blend(data.get("mood", "calm"), activity_source or "mixer session")
        content = blend
    elif asset_type == "cosmic_blend":
        blend = await _generate_frequency_blend(data.get("mood", "focused"), activity_source or "cosmic practice")
        mantra = await _generate_ai_mantra(context or "deepening cosmic awareness")
        content = {**blend, "paired_mantra": mantra}
    elif asset_type == "group_immersion":
        mantra = await _generate_ai_mantra(context or "community gathering")
        blend = await _generate_frequency_blend("collective", activity_source or "group event")
        content = {**blend, "group_mantra": mantra, "participant_count": data.get("participants", 1)}

    asset_id = str(uuid.uuid4())
    asset = {
        "id": asset_id,
        "type": asset_type,
        "name": content.get("blend_name") or content.get("mantra", asset_config["name"]),
        "description": content.get("description", f"AI-generated {asset_config['name']}"),
        "content": content,
        "base_price": asset_config["base_price"],
        "source_section": asset_config["source"],
        "creator_id": user_id,
        "activity_context": context,
        "listed": True,
        "purchases": 0,
        "rating": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.content_assets.insert_one({**asset})

    # Remove _id
    asset.pop("_id", None)

    return {"asset": asset}


@router.get("/content-broker/catalog")
async def content_catalog(asset_type: str = "", limit: int = 20, user=Depends(get_current_user)):
    """Browse the AI-generated content marketplace with tier-based pricing."""
    user_id = user["id"]
    tier = await get_user_tier(user_id)

    query = {"listed": True}
    if asset_type:
        query["type"] = asset_type

    assets = await db.content_assets.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)

    # Apply tier pricing to each asset
    for a in assets:
        pricing = apply_tier_discount(a["base_price"], tier["discount_pct"])
        a["pricing"] = pricing
        a["is_own"] = a.get("creator_id") == user_id

    return {
        "assets": assets,
        "user_tier": tier["tier_label"],
        "discount_pct": tier["discount_pct"],
        "asset_types": list(ASSET_TYPES.keys()),
    }


@router.post("/content-broker/purchase")
async def purchase_content(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase an AI-generated content asset from the marketplace."""
    asset_id = data.get("asset_id", "")
    asset = await db.content_assets.find_one({"id": asset_id, "listed": True}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    user_id = user["id"]
    if asset.get("creator_id") == user_id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own content")

    # Check if already purchased
    existing = await db.content_purchases.find_one({"user_id": user_id, "asset_id": asset_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already purchased")

    tier = await get_user_tier(user_id)
    pricing = apply_tier_discount(asset["base_price"], tier["discount_pct"])
    cost = pricing["final_price"]

    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    credits = u.get("user_credit_balance", 0) if u else 0
    if credits < cost:
        raise HTTPException(status_code=400, detail=f"Need {cost} Credits. Have {credits}.")

    # Deduct credits from buyer, credit creator (minus resonance fee)
    resonance_fee = max(1, int(cost * 0.05))
    creator_cut = cost - resonance_fee

    await db.users.update_one({"id": user_id}, {"$inc": {"user_credit_balance": -cost}})
    if asset.get("creator_id"):
        await db.users.update_one({"id": asset["creator_id"]}, {"$inc": {"user_credit_balance": creator_cut}})

    await db.content_assets.update_one({"id": asset_id}, {"$inc": {"purchases": 1}})

    await db.content_purchases.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "asset_id": asset_id,
        "asset_type": asset["type"],
        "cost": cost,
        "tier_discount": tier["discount_pct"],
        "resonance_fee": resonance_fee,
        "creator_cut": creator_cut,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "purchased": asset["name"],
        "cost": cost,
        "discount_applied": tier["discount_pct"],
        "content": asset["content"],
    }


@router.get("/content-broker/my-content")
async def my_generated_content(user=Depends(get_current_user)):
    """Get content generated by the user + content they've purchased."""
    user_id = user["id"]

    created = await db.content_assets.find(
        {"creator_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(30).to_list(30)

    purchased = await db.content_purchases.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(30).to_list(30)

    # Get full asset details for purchased items
    purchased_ids = [p["asset_id"] for p in purchased]
    purchased_assets = []
    if purchased_ids:
        purchased_assets = await db.content_assets.find(
            {"id": {"$in": purchased_ids}}, {"_id": 0}
        ).to_list(len(purchased_ids))

    return {
        "created": created,
        "purchased": purchased_assets,
        "total_created": len(created),
        "total_purchased": len(purchased_assets),
    }
