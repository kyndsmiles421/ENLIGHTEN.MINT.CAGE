"""
The Cosmic Collective — Dual-Track Economy
Track 1: App Utility Subscriptions (Discovery / Resonance / Sovereign)
Track 2: Learning Packs + Brokerage Commissions
"""
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/economy", tags=["Dual-Track Economy"])

# ─── Track 1: App Subscription Tiers ───
SUBSCRIPTION_TIERS = {
    "discovery": {
        "id": "discovery",
        "name": "Discovery",
        "label": "Base",
        "price_monthly": 0.0,
        "features": [
            "Standard UI & foundational classes",
            "Community forums access",
            "Standard resolution visuals",
        ],
        "marketplace_discount": 0,
        "max_project_slots": 3,
        "fidelity": "Standard",
        "forge_access": False,
        "max_commission_tier": 2,
        "color": "#6B7280",
    },
    "resonance": {
        "id": "resonance",
        "name": "Resonance",
        "label": "Premium",
        "price_monthly": 44.99,
        "features": [
            "Advanced toolsets (Calculators, Repos, Calendars)",
            "15% Marketplace discount",
            "2K visual fidelity",
            "Ghost Skeleton interactive UI",
        ],
        "marketplace_discount": 15,
        "max_project_slots": 10,
        "fidelity": "2K",
        "forge_access": False,
        "max_commission_tier": 3,
        "color": "#818CF8",
    },
    "sovereign": {
        "id": "sovereign",
        "name": "Sovereign",
        "label": "Elite",
        "price_monthly": 89.99,
        "features": [
            "Unlimited project slots",
            "Maximum Marketplace discounts",
            "Synthesis Forge access",
            "4K/8D immersive visuals",
            "Unlocks 27% Master commission",
        ],
        "marketplace_discount": 30,
        "max_project_slots": -1,
        "fidelity": "4K/8D",
        "forge_access": True,
        "max_commission_tier": 4,
        "color": "#FBBF24",
    },
}

# ─── Track 2: Learning Packs ───
LEARNING_PACKS = [
    {
        "id": "coffee_chemistry",
        "name": "Specialty Coffee Chemistry",
        "category": "mini",
        "price": 87.00,
        "description": "Hyper-focused module on extraction science, grind calibration, and sensory profiling.",
        "domain": "culinary",
        "modules_included": 3,
    },
    {
        "id": "gps_proximity",
        "name": "GPS Proximity Logic",
        "category": "mini",
        "price": 127.00,
        "description": "Geolocation algorithms for proximity-based interactions and spatial anchoring.",
        "domain": "engineering",
        "modules_included": 4,
    },
    {
        "id": "ui_animation",
        "name": "UI/UX Animation Systems",
        "category": "mini",
        "price": 177.00,
        "description": "Advanced motion design, easing curves, and micro-interaction patterns.",
        "domain": "engineering",
        "modules_included": 5,
    },
    {
        "id": "cicd_modular",
        "name": "Modular CI/CD Engineering",
        "category": "mastery",
        "price": 447.00,
        "description": "Full pipeline architecture — from containerization to multi-environment deployment.",
        "domain": "engineering",
        "modules_included": 12,
    },
    {
        "id": "organic_horticulture",
        "name": "Full Organic Horticulture",
        "category": "mastery",
        "price": 897.00,
        "description": "Comprehensive growing system — soil biology, companion planting, and harvest optimization.",
        "domain": "horticulture",
        "modules_included": 18,
    },
    {
        "id": "spotless_solutions",
        "name": "Spotless Solutions Maintenance",
        "category": "business",
        "price": 1347.00,
        "description": "Turnkey sanitation business — client acquisition, scheduling, supply chain, and scaling.",
        "domain": "business",
        "modules_included": 24,
    },
    {
        "id": "mobile_cafe",
        "name": "Mobile Enlightenment Cafe",
        "category": "business",
        "price": 1797.00,
        "description": "Complete mobile food service — licensing, menu engineering, route optimization, and growth.",
        "domain": "culinary",
        "modules_included": 30,
    },
]

PACK_CATEGORIES = {
    "mini": {"name": "Mini-Packs", "range": "$87 – $177", "color": "#818CF8"},
    "mastery": {"name": "Mastery Deep-Dives", "range": "$447 – $897", "color": "#22C55E"},
    "business": {"name": "Business-in-a-Box", "range": "$1,347+", "color": "#FBBF24"},
}

# ─── Brokerage Commission Tiers ───
COMMISSION_TIERS = [
    {"level": 1, "name": "Observer", "label": "Foundational", "commission_rate": 0.0, "status": "Student/Viewer", "color": "#6B7280"},
    {"level": 2, "name": "Practitioner", "label": "Focus", "commission_rate": 6.75, "status": "Active user utilizing standard templates", "color": "#818CF8"},
    {"level": 3, "name": "Professional", "label": "Guided", "commission_rate": 13.5, "status": "Ghost Skeleton interactive UI & real-time coaching", "color": "#22C55E"},
    {"level": 4, "name": "Sovereign", "label": "Mastery", "commission_rate": 27.0, "status": "Mentoring, peer-review authority, cross-domain synthesis", "color": "#FBBF24"},
]

# ─── Polymath All-Access Pass ───
POLYMATH_PASS = {
    "id": "polymath_annual",
    "name": "Polymath All-Access Pass",
    "price_annual": 1797.00,
    "inclusions": [
        "Full Sovereign Elite App Subscription ($89.99/mo value)",
        "Instant unlock of all current and future Specialized Packs",
        "Instant Level 4 Sovereign Status (27% Commission) across every module",
    ],
    "color": "#C084FC",
}


# ═══════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════

@router.get("/tiers")
async def get_subscription_tiers(user=Depends(get_current_user)):
    """Get all subscription tiers and user's current tier."""
    profile = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    current_tier = profile.get("tier", "discovery") if profile else "discovery"
    return {
        "tiers": list(SUBSCRIPTION_TIERS.values()),
        "current_tier": current_tier,
        "current_tier_data": SUBSCRIPTION_TIERS.get(current_tier, SUBSCRIPTION_TIERS["discovery"]),
    }


@router.get("/packs")
async def get_learning_packs(user=Depends(get_current_user)):
    """Get available learning packs and user's purchased packs."""
    purchased = await db.pack_purchases.find(
        {"user_id": user["id"], "payment_status": "paid"}, {"_id": 0}
    ).to_list(100)
    purchased_ids = {p["pack_id"] for p in purchased}

    packs = []
    for pack in LEARNING_PACKS:
        packs.append({
            **pack,
            "purchased": pack["id"] in purchased_ids,
            "category_data": PACK_CATEGORIES.get(pack["category"], {}),
        })

    # Check polymath
    polymath = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    has_polymath = polymath.get("polymath", False) if polymath else False

    return {
        "packs": packs,
        "categories": PACK_CATEGORIES,
        "polymath_pass": POLYMATH_PASS,
        "has_polymath": has_polymath,
    }


@router.get("/commissions")
async def get_commission_status(user=Depends(get_current_user)):
    """Get user's brokerage commission tiers per domain."""
    profile = await db.commission_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    current_sub_tier = sub.get("tier", "discovery") if sub else "discovery"
    max_level = SUBSCRIPTION_TIERS.get(current_sub_tier, {}).get("max_commission_tier", 2)
    has_polymath = sub.get("polymath", False) if sub else False

    # Domain-specific levels
    domain_levels = profile.get("domain_levels", {}) if profile else {}

    # Earnings
    earnings = await db.commission_earnings.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("earned_at", -1).to_list(50)
    total_earned = sum(e.get("amount", 0) for e in earnings)

    return {
        "tiers": COMMISSION_TIERS,
        "domain_levels": domain_levels,
        "max_allowed_level": 4 if has_polymath else max_level,
        "has_polymath": has_polymath,
        "total_earned": round(total_earned, 2),
        "recent_earnings": earnings[:10],
        "subscription_tier": current_sub_tier,
    }


@router.get("/profile")
async def get_economy_profile(user=Depends(get_current_user)):
    """Get unified economy profile — subscription, packs, commissions."""
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    current_tier = sub.get("tier", "discovery") if sub else "discovery"
    has_polymath = sub.get("polymath", False) if sub else False

    purchased = await db.pack_purchases.find(
        {"user_id": user["id"], "payment_status": "paid"}, {"_id": 0}
    ).to_list(100)

    comm = await db.commission_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    earnings = await db.commission_earnings.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(50)

    return {
        "subscription": {
            "tier": current_tier,
            "tier_data": SUBSCRIPTION_TIERS.get(current_tier, SUBSCRIPTION_TIERS["discovery"]),
            "polymath": has_polymath,
            "started_at": sub.get("started_at") if sub else None,
        },
        "packs_owned": len(purchased),
        "total_packs": len(LEARNING_PACKS),
        "commission_domains": comm.get("domain_levels", {}) if comm else {},
        "total_commission_earned": round(sum(e.get("amount", 0) for e in earnings), 2),
    }


# ─── Stripe Checkout Endpoints ───

@router.post("/subscribe")
async def create_subscription_checkout(body: dict, user=Depends(get_current_user), request: Request = None):
    """Create Stripe checkout for subscription upgrade."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    tier_id = body.get("tier_id", "")
    origin_url = body.get("origin_url", "")
    if tier_id not in SUBSCRIPTION_TIERS:
        raise HTTPException(400, "Invalid tier")
    tier = SUBSCRIPTION_TIERS[tier_id]
    if tier["price_monthly"] <= 0:
        # Free tier — just set it
        await db.subscriptions.update_one(
            {"user_id": user["id"]},
            {"$set": {"user_id": user["id"], "tier": "discovery", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        return {"status": "activated", "tier": "discovery"}

    if not origin_url:
        raise HTTPException(400, "origin_url required")

    host_url = str(request.base_url).rstrip("/") if request else origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    api_key = os.environ.get("STRIPE_API_KEY", "")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    success_url = f"{origin_url}/economy?session_id={{CHECKOUT_SESSION_ID}}&type=subscription"
    cancel_url = f"{origin_url}/economy"

    checkout_req = CheckoutSessionRequest(
        amount=tier["price_monthly"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "type": "subscription",
            "tier_id": tier_id,
            "tier_name": tier["name"],
        },
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    # Record transaction
    tx_id = str(uuid.uuid4())
    await db.payment_transactions.insert_one({
        "id": tx_id,
        "session_id": session.session_id,
        "user_id": user["id"],
        "type": "subscription",
        "tier_id": tier_id,
        "amount": tier["price_monthly"],
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.post("/purchase-pack")
async def create_pack_checkout(body: dict, user=Depends(get_current_user), request: Request = None):
    """Create Stripe checkout for learning pack purchase."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    pack_id = body.get("pack_id", "")
    origin_url = body.get("origin_url", "")
    pack = next((p for p in LEARNING_PACKS if p["id"] == pack_id), None)
    if not pack:
        raise HTTPException(400, "Invalid pack")
    if not origin_url:
        raise HTTPException(400, "origin_url required")

    # Check if already purchased
    existing = await db.pack_purchases.find_one(
        {"user_id": user["id"], "pack_id": pack_id, "payment_status": "paid"}, {"_id": 0}
    )
    if existing:
        raise HTTPException(400, "Pack already purchased")

    host_url = str(request.base_url).rstrip("/") if request else origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    api_key = os.environ.get("STRIPE_API_KEY", "")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    success_url = f"{origin_url}/economy?session_id={{CHECKOUT_SESSION_ID}}&type=pack"
    cancel_url = f"{origin_url}/economy"

    checkout_req = CheckoutSessionRequest(
        amount=pack["price"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "type": "pack_purchase",
            "pack_id": pack_id,
            "pack_name": pack["name"],
        },
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    tx_id = str(uuid.uuid4())
    await db.payment_transactions.insert_one({
        "id": tx_id,
        "session_id": session.session_id,
        "user_id": user["id"],
        "type": "pack_purchase",
        "pack_id": pack_id,
        "amount": pack["price"],
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.post("/purchase-polymath")
async def create_polymath_checkout(body: dict, user=Depends(get_current_user), request: Request = None):
    """Create Stripe checkout for Polymath All-Access Pass."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    origin_url = body.get("origin_url", "")
    if not origin_url:
        raise HTTPException(400, "origin_url required")

    # Check if already a polymath
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    if sub and sub.get("polymath"):
        raise HTTPException(400, "Already a Polymath member")

    host_url = str(request.base_url).rstrip("/") if request else origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    api_key = os.environ.get("STRIPE_API_KEY", "")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    success_url = f"{origin_url}/economy?session_id={{CHECKOUT_SESSION_ID}}&type=polymath"
    cancel_url = f"{origin_url}/economy"

    checkout_req = CheckoutSessionRequest(
        amount=POLYMATH_PASS["price_annual"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "type": "polymath",
        },
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    tx_id = str(uuid.uuid4())
    await db.payment_transactions.insert_one({
        "id": tx_id,
        "session_id": session.session_id,
        "user_id": user["id"],
        "type": "polymath",
        "amount": POLYMATH_PASS["price_annual"],
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, user=Depends(get_current_user), request: Request = None):
    """Poll checkout status and fulfill on payment confirmation."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(request.base_url).rstrip("/") if request else ""
    webhook_url = f"{host_url}/api/webhook/stripe"
    api_key = os.environ.get("STRIPE_API_KEY", "")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    # Get our transaction record
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(404, "Transaction not found")

    # Fulfill if paid and not already fulfilled
    if status.payment_status == "paid" and tx.get("payment_status") != "paid":
        now = datetime.now(timezone.utc).isoformat()
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "paid_at": now}},
        )

        tx_type = tx.get("type")
        uid = tx.get("user_id")

        if tx_type == "subscription":
            tier_id = tx.get("tier_id", "resonance")
            await db.subscriptions.update_one(
                {"user_id": uid},
                {"$set": {
                    "user_id": uid, "tier": tier_id,
                    "started_at": now, "updated_at": now,
                }},
                upsert=True,
            )

        elif tx_type == "pack_purchase":
            pack_id = tx.get("pack_id")
            await db.pack_purchases.update_one(
                {"user_id": uid, "pack_id": pack_id},
                {"$set": {
                    "user_id": uid, "pack_id": pack_id,
                    "payment_status": "paid", "purchased_at": now,
                }},
                upsert=True,
            )

        elif tx_type == "polymath":
            await db.subscriptions.update_one(
                {"user_id": uid},
                {"$set": {
                    "user_id": uid, "tier": "sovereign",
                    "polymath": True, "polymath_started_at": now,
                    "started_at": now, "updated_at": now,
                }},
                upsert=True,
            )
            # Unlock all packs
            for pack in LEARNING_PACKS:
                await db.pack_purchases.update_one(
                    {"user_id": uid, "pack_id": pack["id"]},
                    {"$set": {
                        "user_id": uid, "pack_id": pack["id"],
                        "payment_status": "paid", "purchased_at": now,
                        "source": "polymath",
                    }},
                    upsert=True,
                )
            # Set all commission domains to level 4
            domains = list({p["domain"] for p in LEARNING_PACKS})
            domain_levels = {d: 4 for d in domains}
            await db.commission_profiles.update_one(
                {"user_id": uid},
                {"$set": {"user_id": uid, "domain_levels": domain_levels, "updated_at": now}},
                upsert=True,
            )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "type": tx.get("type"),
        "tier_id": tx.get("tier_id"),
        "pack_id": tx.get("pack_id"),
    }


@router.post("/downgrade")
async def downgrade_to_discovery(user=Depends(get_current_user)):
    """Downgrade to free Discovery tier."""
    now = datetime.now(timezone.utc).isoformat()
    await db.subscriptions.update_one(
        {"user_id": user["id"]},
        {"$set": {"user_id": user["id"], "tier": "discovery", "updated_at": now}},
        upsert=True,
    )
    return {"tier": "discovery", "message": "Downgraded to Discovery"}
