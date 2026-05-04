"""
The ENLIGHTEN.MINT.CAFE — Dual-Track Economy
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
        "label": "Seeker",
        "price_monthly": 0.0,
        "education_level": "Foundation",
        "education_desc": "Intro to Circular Economies, Basic Wellness",
        "monetization": "Consumer Status — buy Time, Energy, or Utilities from the Broker",
        "features": [
            "Foundation-level education",
            "Buy & transfer Dust (no selling)",
            "Standard Map access",
            "Community forums",
        ],
        "marketplace_discount": 0,
        "max_project_slots": 3,
        "fidelity": "Standard",
        "forge_access": False,
        "max_commission_tier": 1,
        "can_sell": False,
        "beacon": False,
        "color": "#6B7280",
    },
    "resonance": {
        "id": "resonance",
        "name": "Resonance",
        "label": "Artisan",
        "price_monthly": 27.00,
        "education_level": "Creator",
        "education_desc": "UI/UX Design, Geometry of Sound, Modular Basics",
        "monetization": "Trusted Trader — P2P Beacon notifications for local bartering",
        "features": [
            "Creator-level education",
            "5% member discount on all purchases",
            "P2P Beacon notifications",
            "Modular UI customization unlocked",
        ],
        "marketplace_discount": 5,
        "max_project_slots": 8,
        "fidelity": "HD",
        "forge_access": False,
        "max_commission_tier": 2,
        "can_sell": True,
        "beacon": True,
        "color": "#818CF8",
    },
    "architect": {
        "id": "architect",
        "name": "Architect",
        "label": "The Builder",
        "price_monthly": 49.00,
        "education_level": "Specialist",
        "education_desc": "Solfeggio Frequencies, AI Sanctuary Management, Sacred Geometry",
        "monetization": "Value Optimizer — full AI integration and priority visibility",
        "features": [
            "Specialist-level education",
            "15% member discount on all Dust & Energy",
            "Full AI integration",
            "Vocal resonance analysis",
            "Priority trade directory visibility",
        ],
        "marketplace_discount": 15,
        "max_project_slots": 20,
        "fidelity": "2K",
        "forge_access": True,
        "max_commission_tier": 3,
        "can_sell": True,
        "beacon": True,
        "color": "#2DD4BF",
    },
    "sovereign": {
        "id": "sovereign",
        "name": "Sovereign Monthly",
        "label": "The Apex",
        "price_monthly": 89.00,
        "price_web": 89.00,
        "price_play_store": 115.70,  # +30% Google Play platform fee
        "term_months": 1,
        "education_level": "Professional",
        "education_desc": "CI/CD Pipelines, Infrastructure Architecture, Business Logistics",
        "monetization": "Infrastructure Partner — full dev suite and priority server resources",
        "features": [
            "Full Utility & Sage Voice access",
            "30% Discount Power on all Dust upgrades",
            "Full Development Suite",
            "Priority server resources",
            "Large-scale operations (Cafe/Maintenance)",
            "Unlocks 27% Master commission",
        ],
        "marketplace_discount": 30,
        "max_project_slots": -1,
        "fidelity": "4K/8D",
        "forge_access": True,
        "max_commission_tier": 4,
        "can_sell": True,
        "beacon": True,
        "is_founder": False,
        "color": "#FBBF24",
    },
    "sovereign_founder": {
        "id": "sovereign_founder",
        "name": "Sovereign Founder",
        "label": "The Apex · 2-Year Lock",
        "price_total": 1777.00,
        "price_web": 1777.00,
        "price_play_store": 2310.10,  # +30% Google Play platform fee
        "price_monthly_equivalent": 74.04,  # 1777 / 24
        "term_months": 24,
        "savings_pct": 60,
        "education_level": "Professional · Total Unlock",
        "education_desc": "Total Academy & Professional Upgrade unlock for 24 months",
        "monetization": "Founder Lock-In — paid once, no renewal trap",
        "features": [
            "Total Academy & Professional Upgrade unlock (24 months)",
            "60% Discount Power on all Dust upgrades",
            "Full Utility & Sage Voice access",
            "Full Development Suite",
            "Priority server resources",
            "Master commission (27%)",
            "Founder badge + exclusive 432Hz Founder's Harmonic",
            "$1,000.80 saved vs Monthly · $2,000.10 saved vs Play Store",
        ],
        "marketplace_discount": 60,
        "max_project_slots": -1,
        "fidelity": "4K/8D",
        "forge_access": True,
        "max_commission_tier": 4,
        "can_sell": True,
        "beacon": True,
        "is_founder": True,
        "color": "#FCD34D",
    },
}

# ─── Sovereign Tier Order (display + comparison) ───
SOVEREIGN_TIER_ORDER = ["discovery", "resonance", "architect", "sovereign", "sovereign_founder"]

# ─── Platform Fee Constants (Transparency Graph) ───
PLATFORM_FEES = {
    "google_play_pct": 30,
    "web_direct_pct": 0,
    "label_play": "Google Play Platform Fee",
    "label_web": "Sovereign Web Direct",
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
    {"level": 1, "name": "Observer", "label": "Foundational", "commission_rate": 0.0, "status": "Consumer — buy only, no selling", "color": "#6B7280"},
    {"level": 2, "name": "Practitioner", "label": "Focus", "commission_rate": 6.75, "status": "Trusted Trader with P2P Beacon access", "color": "#818CF8"},
    {"level": 3, "name": "Professional", "label": "Guided", "commission_rate": 13.5, "status": "Value Optimizer with full AI integration", "color": "#2DD4BF"},
    {"level": 4, "name": "Sovereign", "label": "Mastery", "commission_rate": 27.0, "status": "Infrastructure Partner, peer-review authority", "color": "#FBBF24"},
]

# ─── Integrated Loop: Failed Trade Charge ───
FAILED_TRADE_CHARGE_RATE = 0.30  # 30% of escrowed value lost on failed trades

# ─── Polymath All-Access Pass ───
POLYMATH_PASS = {
    "id": "polymath_annual",
    "name": "Polymath All-Access Pass",
    "price_annual": 1797.00,
    "inclusions": [
        "Full Architect-tier subscription ($89/mo value)",
        "Instant unlock of all current and future Specialized Packs",
        "Instant Level 4 Sovereign Status (27% Commission) across every domain",
        "30% member discount on all assets",
    ],
    "color": "#C084FC",
}


# ═══════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════

@router.get("/tiers")
async def get_subscription_tiers(request: Request):
    """Get all subscription tiers, credit packs, AI costs, and tier order.
    
    Single canonical source for Pricing.js. Includes Sovereign Founder ($1,777/24mo)
    and Sovereign Monthly ($89/mo) plus Web/Play Store transparency pricing.
    """
    # Pull credit packs + AI costs from subscriptions module (single source of truth)
    try:
        from routes.subscriptions import CREDIT_PACKS, AI_COSTS
        credit_packs = {k: {**v, "id": k} for k, v in CREDIT_PACKS.items()}
        ai_costs = AI_COSTS
    except Exception:
        credit_packs, ai_costs = {}, {}

    current_tier = "discovery"
    try:
        from deps import get_current_user
        user = await get_current_user(request)
        profile = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
        current_tier = profile.get("tier", "discovery") if profile else "discovery"
    except Exception:
        pass

    # Return as dict (id -> tier) so Pricing.js can index by tierOrder
    tiers_dict = {tid: tdata for tid, tdata in SUBSCRIPTION_TIERS.items()}

    return {
        "tiers": tiers_dict,
        "tier_order": SOVEREIGN_TIER_ORDER,
        "credit_packs": credit_packs,
        "ai_costs": ai_costs,
        "platform_fees": PLATFORM_FEES,
        "current_tier": current_tier,
        "current_tier_data": SUBSCRIPTION_TIERS.get(current_tier, SUBSCRIPTION_TIERS["discovery"]),
    }


@router.get("/my-plan")
async def get_my_plan(user=Depends(get_current_user)):
    """Return the current user's active subscription state for Pricing.js."""
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_id = (sub or {}).get("tier", "discovery")
    tier = SUBSCRIPTION_TIERS.get(tier_id, SUBSCRIPTION_TIERS["discovery"])
    is_admin = user.get("role") in ("admin", "creator", "council")

    # Bring credit balance via existing AI credits collection (best-effort)
    try:
        bal_doc = await db.user_credits.find_one({"user_id": user["id"]}, {"_id": 0})
        balance = (bal_doc or {}).get("balance", 0)
    except Exception:
        balance = 0

    return {
        "tier": tier_id,
        "tier_name": tier.get("name", "Discovery"),
        "tier_data": tier,
        "is_admin": is_admin,
        "subscription_active": tier_id != "discovery",
        "balance": balance,
        "credits_per_month": -1 if tier.get("is_founder") else 0,  # founders = full unlock
        "is_founder": bool(tier.get("is_founder")),
        "term_months": tier.get("term_months", 1),
        "started_at": (sub or {}).get("started_at"),
        "trial": (sub or {}).get("trial"),
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
    """Create Stripe checkout for subscription upgrade.
    
    Supports:
      - Sovereign Monthly ($89/mo, recurring intent)
      - Sovereign Founder ($1,777 / 24-month one-time lock-in)
      - Discovery (free auto-activation)
    Body: { tier_id, origin_url, platform? ('web'|'play_store') }
    """
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    tier_id = body.get("tier_id", "")
    origin_url = body.get("origin_url", "")
    platform = body.get("platform", "web")  # 'web' or 'play_store'

    if tier_id not in SUBSCRIPTION_TIERS:
        raise HTTPException(400, "Invalid tier")
    tier = SUBSCRIPTION_TIERS[tier_id]

    # Resolve amount: founder uses price_total, monthly uses price_monthly,
    # platform=play_store applies +30% gross-up if price_play_store is defined.
    if tier.get("is_founder"):
        amount = tier.get("price_play_store", tier["price_total"]) if platform == "play_store" else tier["price_total"]
    else:
        amount = tier.get("price_play_store", tier.get("price_monthly", 0)) if platform == "play_store" else tier.get("price_monthly", 0)

    if amount <= 0:
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

    success_url = f"{origin_url}/pricing?session_id={{CHECKOUT_SESSION_ID}}&type=subscription"
    cancel_url = f"{origin_url}/pricing"

    checkout_req = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "type": "subscription",
            "tier_id": tier_id,
            "tier_name": tier["name"],
            "platform": platform,
            "term_months": str(tier.get("term_months", 1)),
            "is_founder": "true" if tier.get("is_founder") else "false",
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
        "platform": platform,
        "amount": amount,
        "currency": "usd",
        "term_months": tier.get("term_months", 1),
        "is_founder": tier.get("is_founder", False),
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id, "amount": amount, "platform": platform}


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
                    "user_id": uid, "tier": "architect",
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


@router.get("/discount-rate")
async def get_discount_rate(user=Depends(get_current_user)):
    """Get user's current discount rate based on subscription tier."""
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_id = sub.get("tier", "discovery") if sub else "discovery"
    tier = SUBSCRIPTION_TIERS.get(tier_id, SUBSCRIPTION_TIERS["discovery"])
    return {
        "tier": tier_id,
        "discount_percent": tier["marketplace_discount"],
        "can_sell": tier.get("can_sell", False),
        "beacon": tier.get("beacon", False),
        "education_level": tier.get("education_level", "Foundation"),
        "failed_trade_charge": FAILED_TRADE_CHARGE_RATE,
    }


@router.post("/apply-discount")
async def apply_discount(body: dict, user=Depends(get_current_user)):
    """Calculate discounted price for a purchase based on tier."""
    base_price = body.get("base_price", 0)
    if base_price <= 0:
        raise HTTPException(400, "base_price must be positive")

    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_id = sub.get("tier", "discovery") if sub else "discovery"
    tier = SUBSCRIPTION_TIERS.get(tier_id, SUBSCRIPTION_TIERS["discovery"])
    discount = tier["marketplace_discount"] / 100.0
    discounted_price = round(base_price * (1 - discount), 2)

    return {
        "base_price": base_price,
        "discount_percent": tier["marketplace_discount"],
        "discount_amount": round(base_price - discounted_price, 2),
        "final_price": discounted_price,
        "tier": tier_id,
    }
