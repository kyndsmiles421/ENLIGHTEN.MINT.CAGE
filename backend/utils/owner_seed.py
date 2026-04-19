"""
owner_seed.py — Idempotent owner-account provisioning

Ensures the creator/owner account (kyndsmiles@gmail.com) exists on any
fresh MongoDB deployment. Runs on server startup. Safe to re-run — no-ops
if the account already exists.

Sources the password from OWNER_SEED_PASSWORD env var; falls back to a
one-time default that the owner is expected to change via /password-reset
or the password-reset endpoint on first login.
"""
import os
import uuid
import bcrypt
from datetime import datetime, timezone, timedelta

from deps import db

CREATOR_EMAIL = "kyndsmiles@gmail.com"
CREATOR_NAME  = "Sovereign Creator"
DEFAULT_SEED_PASSWORD = "Sovereign2026!"


async def seed_owner_account() -> dict:
    """
    Ensure the owner account exists and is flagged as admin/is_owner.
    Returns a summary dict for logging.
    """
    existing = await db.users.find_one({"email": CREATOR_EMAIL}, {"_id": 0})
    seed_password = os.environ.get("OWNER_SEED_PASSWORD") or DEFAULT_SEED_PASSWORD

    if existing:
        # Make sure admin flags are on (idempotent patch)
        patch = {}
        if existing.get("role") != "admin":
            patch["role"] = "admin"
        if not existing.get("is_admin"):
            patch["is_admin"] = True
        if not existing.get("is_owner"):
            patch["is_owner"] = True
        if patch:
            await db.users.update_one({"id": existing["id"]}, {"$set": patch})
        # Ensure the owner's credit record is provisioned
        await db.user_credits.update_one(
            {"user_id": existing["id"]},
            {"$setOnInsert": {
                "tier": "super_user",
                "subscription_active": True,
                "is_admin": True,
                "credits": 999999,
                "balance": 999999,
            }},
            upsert=True,
        )
        return {"action": "verified", "user_id": existing["id"], "patches_applied": list(patch.keys())}

    # Create the owner account
    uid = str(uuid.uuid4())
    hashed = bcrypt.hashpw(seed_password.encode(), bcrypt.gensalt()).decode()
    trial_end = datetime.now(timezone.utc) + timedelta(days=7)
    doc = {
        "id": uid,
        "email": CREATOR_EMAIL,
        "password": hashed,
        "name": CREATOR_NAME,
        "role": "admin",
        "is_admin": True,
        "is_owner": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "trial": {"active": True, "tier": "plus", "days": 7, "expires_at": trial_end.isoformat()},
    }
    await db.users.insert_one(doc)
    await db.user_credits.insert_one({
        "user_id": uid,
        "tier": "super_user",
        "subscription_active": True,
        "is_admin": True,
        "credits": 999999,
        "balance": 999999,
    })
    # Seed a Sparks wallet so the HUD/FractalEngine finds non-zero values
    await db.sparks_wallet.update_one(
        {"user_id": uid},
        {"$setOnInsert": {
            "user_id": uid,
            "sparks": 99999,
            "total_earned": 99999,
            "cards_earned": 0,
        }},
        upsert=True,
    )
    return {"action": "created", "user_id": uid}
