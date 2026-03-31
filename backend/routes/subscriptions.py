from fastapi import APIRouter, HTTPException, Depends, Request, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import os
import uuid

router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# ─── Tier & Pricing Config ───────────────────────────────────────────────
TIERS = {
    "free": {
        "name": "Free",
        "price": 0,
        "credits_per_month": 50,
        "interval": "month",
        "perks": ["50 AI credits/month", "Full basic site access", "Wellness tracking", "Star Chart", "Trade Circle"],
    },
    "starter": {
        "name": "Starter",
        "price": 4.99,
        "credits_per_month": 100,
        "interval": "month",
        "perks": ["100 AI credits/month", "Everything in Free", "Double the AI allowance"],
    },
    "plus": {
        "name": "Plus",
        "price": 9.99,
        "credits_per_month": 300,
        "interval": "month",
        "perks": [
            "300 AI credits/month",
            "AI-Personalized Frequency Blends",
            "AI-Powered Content Translation",
            "AI Coaching Sound Blends",
            "Cosmic Blueprint Report",
            "Featured Trader badge",
            "Extended Oracle Sessions",
            "Guided Stargazing Journeys",
            "Advanced Mood Analytics",
            "Custom Meditation Builder",
            "Exclusive Creation Stories",
            "Ad-free experience",
            "Plus badge",
        ],
    },
    "premium": {
        "name": "Premium",
        "price": 24.99,
        "credits_per_month": -1,
        "interval": "month",
        "perks": [
            "Unlimited AI usage",
            "Everything in Plus",
            "Sora Video Generation",
            "AI Sage Voice Sessions",
            "Custom Ritual Generator",
            "Priority Trade Circle",
            "Dream Journal with AI Interpretation",
            "Personal Cosmic Calendar",
            "Exclusive Quantum Realm Experiments",
            "Monthly AI Coaching Session",
            "Export & Download Everything",
            "Early Access to new features",
            "Premium badge + profile aura",
        ],
    },
    "super_user": {
        "name": "Super User",
        "price": 49.99,
        "credits_per_month": -1,
        "interval": "month",
        "perks": [
            "Unlimited AI usage",
            "Everything in Premium",
            "White-Label Cosmic Reports",
            "API Access",
            "Multi-Profile Management (5)",
            "Private Trade Circle Rooms",
            "VIP Hourly Cosmic Forecasts",
            "Custom AI Sage Personality",
            "Exclusive Beta Features",
            "Priority Support",
            "Super User badge + celestial aura",
            "Founding Member pricing lock",
        ],
    },
}

CREDIT_PACKS = {
    "pack_100": {"credits": 100, "price": 5.00, "label": "$5 — 100 credits"},
    "pack_225": {"credits": 225, "price": 10.00, "label": "$10 — 225 credits (10% bonus)"},
    "pack_500": {"credits": 500, "price": 20.00, "label": "$20 — 500 credits (25% bonus)"},
}

AI_COSTS = {
    "oracle_reading": 1,
    "text_generation": 1,
    "tts_narration": 1,
    "whisper_stt": 1,
    "image_generation": 3,
    "sora_video": 10,
}

TIER_ORDER = ["free", "starter", "plus", "premium", "super_user"]


def tier_level(tier_id: str) -> int:
    return TIER_ORDER.index(tier_id) if tier_id in TIER_ORDER else 0


# ─── Credit Helpers ──────────────────────────────────────────────────────
async def get_user_credits(user_id: str) -> dict:
    doc = await db.user_credits.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        # Check if user is admin — give them unlimited
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        is_admin = user_doc.get("role") == "admin" if user_doc else False
        doc = {
            "user_id": user_id,
            "balance": 50,
            "tier": "super_user" if is_admin else "free",
            "subscription_active": is_admin,
            "subscription_id": None,
            "credits_refreshed_at": datetime.now(timezone.utc).isoformat(),
            "total_spent": 0,
            "total_credits_used": 0,
            "is_admin": is_admin,
        }
        await db.user_credits.insert_one({**doc})

    # Auto-expire trial if past deadline
    if doc.get("trial_active") and doc.get("trial_expires_at"):
        expires = datetime.fromisoformat(doc["trial_expires_at"])
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) >= expires:
            await db.user_credits.update_one(
                {"user_id": user_id},
                {"$set": {
                    "trial_active": False,
                    "tier": "free",
                    "subscription_active": False,
                    "balance": 50,
                    "trial_expired_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
            doc["trial_active"] = False
            doc["tier"] = "free"
            doc["subscription_active"] = False
            doc["balance"] = 50
            logger.info(f"Trial expired for user {user_id}")

    return doc


async def deduct_credits(user_id: str, action: str, amount: int = None) -> dict:
    credits = await get_user_credits(user_id)
    tier = credits.get("tier", "free")
    cost = amount if amount is not None else AI_COSTS.get(action, 1)

    # Admin users always pass
    if credits.get("is_admin"):
        await db.user_credits.update_one(
            {"user_id": user_id},
            {"$inc": {"total_credits_used": cost}}
        )
        return {"allowed": True, "remaining": -1, "cost": cost, "tier": tier, "low_credits": False}

    # Unlimited tiers skip deduction
    if TIERS.get(tier, {}).get("credits_per_month", 0) == -1 and credits.get("subscription_active"):
        await db.user_credits.update_one(
            {"user_id": user_id},
            {"$inc": {"total_credits_used": cost}}
        )
        return {"allowed": True, "remaining": -1, "cost": cost, "tier": tier, "low_credits": False}

    if credits["balance"] < cost:
        return {"allowed": False, "remaining": credits["balance"], "cost": cost, "tier": tier, "low_credits": True}

    await db.user_credits.update_one(
        {"user_id": user_id},
        {"$inc": {"balance": -cost, "total_credits_used": cost}}
    )
    new_balance = credits["balance"] - cost
    return {"allowed": True, "remaining": new_balance, "cost": cost, "tier": tier, "low_credits": new_balance <= 10}


async def add_credits(user_id: str, amount: int, reason: str = ""):
    await get_user_credits(user_id)
    await db.user_credits.update_one(
        {"user_id": user_id},
        {"$inc": {"balance": amount}}
    )
    await db.credit_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "reason": reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


# ─── API Routes ──────────────────────────────────────────────────────────
@router.get("/subscriptions/tiers")
async def get_tiers():
    """Return all available subscription tiers."""
    return {
        "tiers": {k: {**v, "id": k} for k, v in TIERS.items()},
        "credit_packs": {k: {**v, "id": k} for k, v in CREDIT_PACKS.items()},
        "ai_costs": AI_COSTS,
        "tier_order": TIER_ORDER,
    }


@router.get("/subscriptions/my-plan")
async def get_my_plan(user=Depends(get_current_user)):
    """Get current user's subscription and credit info."""
    credits = await get_user_credits(user["id"])
    tier_id = credits.get("tier", "free")
    tier_info = TIERS.get(tier_id, TIERS["free"])

    result = {
        "tier": tier_id,
        "tier_name": tier_info["name"],
        "credits_per_month": tier_info["credits_per_month"],
        "balance": credits["balance"],
        "subscription_active": credits.get("subscription_active", False),
        "total_credits_used": credits.get("total_credits_used", 0),
        "perks": tier_info["perks"],
        "tier_order": TIER_ORDER,
        "is_admin": credits.get("is_admin", False),
    }

    # Include trial info
    if credits.get("trial_active"):
        expires = datetime.fromisoformat(credits["trial_expires_at"])
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        days_left = max(0, (expires - datetime.now(timezone.utc)).days)
        result["trial"] = {
            "active": True,
            "days_left": days_left,
            "expires_at": credits["trial_expires_at"],
            "started_at": credits.get("trial_started_at", ""),
        }
    elif credits.get("trial_expired_at"):
        result["trial"] = {"active": False, "expired": True}

    return result


@router.post("/subscriptions/checkout")
async def create_subscription_checkout(request: Request, data: dict = Body(...), user=Depends(get_current_user)):
    """Create a Stripe checkout session for a subscription tier."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    tier_id = data.get("tier_id", "")
    origin_url = data.get("origin_url", "")

    if tier_id not in TIERS or tier_id == "free":
        raise HTTPException(status_code=400, detail="Invalid tier")
    if not origin_url:
        raise HTTPException(status_code=400, detail="Origin URL required")

    tier = TIERS[tier_id]
    amount = float(tier["price"])

    success_url = f"{origin_url}/pricing?session_id={{CHECKOUT_SESSION_ID}}&type=subscription"
    cancel_url = f"{origin_url}/pricing"

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

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
        },
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["id"],
        "type": "subscription",
        "tier_id": tier_id,
        "amount": amount,
        "currency": "usd",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.post("/subscriptions/checkout-credits")
async def create_credits_checkout(request: Request, data: dict = Body(...), user=Depends(get_current_user)):
    """Create a Stripe checkout session for a credit pack."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    pack_id = data.get("pack_id", "")
    origin_url = data.get("origin_url", "")

    if pack_id not in CREDIT_PACKS:
        raise HTTPException(status_code=400, detail="Invalid credit pack")
    if not origin_url:
        raise HTTPException(status_code=400, detail="Origin URL required")

    pack = CREDIT_PACKS[pack_id]
    amount = float(pack["price"])

    success_url = f"{origin_url}/pricing?session_id={{CHECKOUT_SESSION_ID}}&type=credits"
    cancel_url = f"{origin_url}/pricing"

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    checkout_req = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "type": "credits",
            "pack_id": pack_id,
            "credits": str(pack["credits"]),
        },
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["id"],
        "type": "credits",
        "pack_id": pack_id,
        "amount": amount,
        "credits": pack["credits"],
        "currency": "usd",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/subscriptions/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, user=Depends(get_current_user)):
    """Poll checkout session status and fulfill if paid."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Prevent double fulfillment
    if tx.get("payment_status") == "paid":
        return {
            "status": status.status,
            "payment_status": "paid",
            "already_fulfilled": True,
            "tier": tx.get("tier_id"),
            "credits_added": tx.get("credits", 0),
        }

    if status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
        )

        if tx["type"] == "subscription":
            tier_id = tx["tier_id"]
            tier = TIERS[tier_id]
            update = {
                "tier": tier_id,
                "subscription_active": True,
                "subscription_id": session_id,
                "subscription_started_at": datetime.now(timezone.utc).isoformat(),
            }
            if tier["credits_per_month"] > 0:
                update["balance"] = tier["credits_per_month"]
                update["credits_refreshed_at"] = datetime.now(timezone.utc).isoformat()

            await get_user_credits(user["id"])
            await db.user_credits.update_one({"user_id": user["id"]}, {"$set": update})

            return {
                "status": status.status,
                "payment_status": "paid",
                "already_fulfilled": False,
                "tier": tier_id,
                "credits_added": tier["credits_per_month"],
            }

        elif tx["type"] == "credits":
            credits_amount = tx["credits"]
            await add_credits(user["id"], credits_amount, f"Credit pack: {tx['pack_id']}")
            return {
                "status": status.status,
                "payment_status": "paid",
                "already_fulfilled": False,
                "credits_added": credits_amount,
            }

    elif status.status == "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired"}}
        )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "already_fulfilled": False,
    }


@router.post("/subscriptions/use-credits")
async def use_credits(data: dict = Body(...), user=Depends(get_current_user)):
    """Deduct credits for an AI action. Called before AI operations."""
    action = data.get("action", "text_generation")
    result = await deduct_credits(user["id"], action)
    if not result["allowed"]:
        raise HTTPException(
            status_code=402,
            detail={
                "message": "Insufficient credits",
                "remaining": result["remaining"],
                "cost": result["cost"],
                "tier": result["tier"],
            }
        )
    return result


@router.post("/subscriptions/cancel")
async def cancel_subscription(user=Depends(get_current_user)):
    """Cancel subscription — downgrade to free at end of period."""
    credits = await get_user_credits(user["id"])
    if credits.get("tier", "free") == "free":
        raise HTTPException(status_code=400, detail="No active subscription")

    await db.user_credits.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "tier": "free",
            "subscription_active": False,
            "subscription_id": None,
            "cancelled_at": datetime.now(timezone.utc).isoformat(),
        }}
    )

    return {"status": "cancelled", "tier": "free"}


@router.get("/subscriptions/credit-history")
async def get_credit_history(user=Depends(get_current_user)):
    """Get recent credit usage/addition history."""
    logs = await db.credit_log.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).limit(30).to_list(30)
    return {"history": logs}



TIER_GATED_FEATURES = {
    "sora_video": "premium",
    "voice_session": "premium",
    "dream_journal": "premium",
    "cosmic_calendar": "premium",
    "quantum_experiments": "premium",
    "export_all": "premium",
    "ai_frequency_blend": "plus",
    "ai_translation": "plus",
    "ai_coaching_blend": "plus",
    "cosmic_blueprint": "plus",
    "extended_oracle": "plus",
    "guided_stargazing": "plus",
    "custom_meditation": "plus",
    "advanced_analytics": "plus",
    "exclusive_stories": "plus",
    "white_label": "super_user",
    "api_access": "super_user",
    "multi_profile": "super_user",
    "private_trade_room": "super_user",
    "custom_ai_personality": "super_user",
}


@router.get("/subscriptions/check-access/{feature}")
async def check_feature_access(feature: str, user=Depends(get_current_user)):
    """Check if user's tier grants access to a gated feature."""
    credits = await get_user_credits(user["id"])

    # Admins have full access
    if credits.get("is_admin"):
        return {"allowed": True, "feature": feature, "tier": "super_user", "is_admin": True}

    user_tier = credits.get("tier", "free")
    user_level = tier_level(user_tier)

    # Trial users get their trial tier access
    is_trial = credits.get("trial_active", False)

    required_tier = TIER_GATED_FEATURES.get(feature)
    if not required_tier:
        return {"allowed": True, "feature": feature, "tier": user_tier, "is_trial": is_trial}

    required_level = tier_level(required_tier)
    allowed = user_level >= required_level

    result = {
        "allowed": allowed,
        "feature": feature,
        "tier": user_tier,
        "required_tier": required_tier,
        "required_tier_name": TIERS.get(required_tier, {}).get("name", ""),
    }
    if is_trial:
        result["is_trial"] = True
        expires = datetime.fromisoformat(credits.get("trial_expires_at", ""))
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        result["trial_days_left"] = max(0, (expires - datetime.now(timezone.utc)).days)

    return result


@router.get("/subscriptions/gated-features")
async def get_gated_features(user=Depends(get_current_user)):
    """Return all gated features and whether the user has access."""
    credits = await get_user_credits(user["id"])
    user_tier = credits.get("tier", "free")
    user_level = tier_level(user_tier)

    features = {}
    for feat, required in TIER_GATED_FEATURES.items():
        req_level = tier_level(required)
        features[feat] = {
            "allowed": user_level >= req_level,
            "required_tier": required,
            "required_tier_name": TIERS.get(required, {}).get("name", ""),
        }
    return {"tier": user_tier, "features": features}
