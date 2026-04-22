"""
Buy-Time / Gilded Path — one-time, non-recurring "Premium Marketplace
Subscription" unlocks. This route intentionally *mirrors* the Stripe
plumbing pattern in routes/subscriptions.py (create-session + poll-and-
fulfill with idempotency) but:

  1. Stores purchases in a dedicated collection `buy_time_transactions`
     (never collides with subscription `payment_transactions`).
  2. Grants the unlock on `users.gilded_tier` — a field that lives
     entirely separately from `user_credits.tier` so a user can be both a
     monthly subscriber AND a one-time Gilded Path holder without
     either state clobbering the other.
  3. Tags every Stripe session with `category=marketplace_service` +
     a human-readable `service_descriptor` for Google Play auditors
     ("Premium Marketplace Subscription — low-fee TradeCircle listings,
     verified seller badge, priority support"). This is the Marketplace
     Identity posture: the app is an e-commerce platform, the Gilded Path
     is access to a marketplace service, not a digital consumable.

Endpoints:
    POST /api/purchase/one-time                     → creates Stripe session
    GET  /api/purchase/one-time/status/{session_id} → polls + fulfills
    GET  /api/purchase/one-time/my-gilded           → returns current state
"""

from fastapi import APIRouter, HTTPException, Depends, Body, Request
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import os
import uuid

router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# ─── Server-side package catalogue (NEVER trust the frontend) ──────────
# Prices, descriptors, and product_sku live here and only here. The
# BuyTimePanel.js TIERS array is a DISPLAY mirror — a malicious client
# cannot manipulate the amount because the backend ignores any price
# field and always looks up the authoritative value from this dict.
BUY_TIME_PACKAGES = {
    "seed": {
        "label": "Seed",
        "price": 9.00,
        "product_sku": "gilded_path_seed",
        "service_descriptor": (
            "Marketplace Starter Access — cosmetic theme pack + 3 sample "
            "workshop blades for the ENLIGHTEN.MINT.CAFE TradeCircle. "
            "Non-recurring one-time service fee."
        ),
    },
    "artisan": {
        "label": "Artisan",
        "price": 29.00,
        "product_sku": "gilded_path_artisan",
        "service_descriptor": (
            "Marketplace Artisan Access — advanced HUD, Spectrum Filters, "
            "and verified artisan badge for TradeCircle physical-goods "
            "listings. Non-recurring one-time service fee."
        ),
    },
    "sovereign": {
        "label": "Sovereign",
        "price": 89.00,
        "product_sku": "gilded_path_sovereign",
        "service_descriptor": (
            "Marketplace Sovereign Access — full Arsenal unlock (261 "
            "blades), Crystal Fidelity 3D viewer, and priority listing "
            "surface in the TradeCircle. Non-recurring one-time service "
            "fee."
        ),
    },
    "gilded": {
        "label": "Gilded",
        "price": 249.00,
        "product_sku": "gilded_path_gilded",
        "service_descriptor": (
            "Marketplace Gilded Membership — Sovereign tier plus "
            "priority human support, verified-seller badge, low-fee "
            "TradeCircle listings, and Visitor-Mode invitations for "
            "local swaps. Non-recurring one-time service fee. Credits "
            "and blades granted are not redeemable for cash."
        ),
    },
}


@router.get("/purchase/one-time/packages")
async def list_packages():
    """Public catalogue — returns the server-authoritative package list.

    The frontend uses this to render the BuyTimePanel buttons so copy
    and pricing stay in perfect sync with what Stripe actually charges.
    """
    return {
        "packages": [
            {"id": k, **v} for k, v in BUY_TIME_PACKAGES.items()
        ],
        "category": "marketplace_service",
    }


@router.get("/purchase/one-time/my-gilded")
async def get_my_gilded(user=Depends(get_current_user)):
    """Return the currently-active Gilded Path tier for this user (if any)."""
    u = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "gilded_tier": 1, "gilded_purchased_at": 1, "gilded_session_id": 1},
    )
    return {
        "gilded_tier": (u or {}).get("gilded_tier"),
        "purchased_at": (u or {}).get("gilded_purchased_at"),
        "session_id": (u or {}).get("gilded_session_id"),
    }


@router.post("/purchase/one-time")
async def create_one_time_checkout(
    request: Request,
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Create a Stripe Checkout session for a one-time Gilded Path unlock.

    Body: { "tier_id": "seed"|"artisan"|"sovereign"|"gilded", "origin_url": "<window.location.origin>" }

    The amount is looked up server-side from BUY_TIME_PACKAGES — the
    frontend price field is ignored entirely to prevent price tampering.
    """
    from emergentintegrations.payments.stripe.checkout import (
        StripeCheckout,
        CheckoutSessionRequest,
    )

    tier_id = (data.get("tier_id") or "").lower().strip()
    origin_url = (data.get("origin_url") or "").rstrip("/")

    pkg = BUY_TIME_PACKAGES.get(tier_id)
    if not pkg:
        raise HTTPException(status_code=400, detail="Invalid tier_id")
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url required")

    amount = float(pkg["price"])

    # Return to the Arsenal page where BuyTimePanel lives; the panel's
    # effect hook reads ?session_id=... on mount and begins polling.
    success_url = f"{origin_url}/arsenal?session_id={{CHECKOUT_SESSION_ID}}&type=gilded_path"
    cancel_url = f"{origin_url}/arsenal?gilded_canceled=1"

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    checkout_req = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            # Routed by server.py webhook + checkout-status endpoint
            "type": "gilded_path_one_time",
            "category": "marketplace_service",
            "user_id": user["id"],
            "tier_id": tier_id,
            "product_sku": pkg["product_sku"],
            # Truncate descriptor — Stripe caps metadata values at 500 chars
            "service_descriptor": pkg["service_descriptor"][:450],
        },
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.buy_time_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["id"],
        "tier_id": tier_id,
        "product_sku": pkg["product_sku"],
        "amount": amount,
        "currency": "usd",
        "category": "marketplace_service",
        "service_descriptor": pkg["service_descriptor"],
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    logger.info(
        f"[gilded_path] checkout created: user={user['id']} "
        f"tier={tier_id} amount=${amount:.2f} session={session.session_id}"
    )

    return {
        "url": session.url,
        "session_id": session.session_id,
        "amount": amount,
        "tier_id": tier_id,
    }


@router.get("/purchase/one-time/status/{session_id}")
async def get_one_time_status(
    session_id: str,
    request: Request,
    user=Depends(get_current_user),
):
    """Poll a one-time checkout session and fulfill the Gilded Path unlock
    exactly once (idempotent even under concurrent polling).
    """
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    tx = await db.buy_time_transactions.find_one(
        {"session_id": session_id}, {"_id": 0}
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    # Defensive — never let user A poll user B's transaction.
    if tx.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Transaction owner mismatch")

    # Already fulfilled — short-circuit (idempotency guarantee).
    if tx.get("payment_status") == "paid":
        return {
            "payment_status": "paid",
            "already_fulfilled": True,
            "tier_id": tx.get("tier_id"),
            "product_sku": tx.get("product_sku"),
        }

    status = await stripe_checkout.get_checkout_status(session_id)

    if status.payment_status == "paid":
        # Atomically flip status — guarantees only one poller wins even if
        # 5 tabs are all polling simultaneously.
        result = await db.buy_time_transactions.update_one(
            {"session_id": session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {
                "payment_status": "paid",
                "paid_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        if result.modified_count > 0:
            # Winner — grant the tier.
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "gilded_tier": tx["tier_id"],
                    "gilded_product_sku": tx["product_sku"],
                    "gilded_session_id": session_id,
                    "gilded_purchased_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
            logger.info(
                f"[gilded_path] fulfilled: user={user['id']} "
                f"tier={tx['tier_id']} session={session_id}"
            )
        return {
            "payment_status": "paid",
            "already_fulfilled": False,
            "tier_id": tx["tier_id"],
            "product_sku": tx["product_sku"],
        }

    if status.status == "expired":
        await db.buy_time_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired"}},
        )
        return {"payment_status": "expired", "already_fulfilled": False}

    return {"payment_status": status.payment_status, "already_fulfilled": False}
