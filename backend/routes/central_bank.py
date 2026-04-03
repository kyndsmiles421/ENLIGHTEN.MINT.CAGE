from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/bank", tags=["Central Bank — Vault & Monetary Policy"])

# ─── Monetary Policy Constants ───
INITIAL_DUST = 500
INITIAL_GEMS = 0
DUST_TO_GEM_RATIO = 100  # Sliding scale: 100 Dust = 1 Gem
RETURN_TAX_PERCENT = 30   # 30% exit tax — re-circulated to prevent inflation
SOVEREIGN_ADMIN_ID = "sovereign_master"

# ─── Earning Rates (Cosmic Dust per action) ───
DUST_REWARDS = {
    "synthesis": 15,
    "constellation_create": 25,
    "feed_post": 5,
    "feed_join": 10,
    "streak_bonus": 50,
    "mastery_record": 30,
    "daily_login": 20,
}


async def get_or_create_vault_wallet(user_id: str):
    """Get or create a dual-currency wallet managed by the Central Bank."""
    wallet = await db.hub_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        wallet = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "dust": INITIAL_DUST,
            "gems": INITIAL_GEMS,
            "total_dust_earned": 0,
            "total_dust_spent": 0,
            "total_gems_earned": 0,
            "total_gems_spent": 0,
            "transmutation_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.hub_wallets.insert_one(wallet)
        wallet.pop("_id", None)
    return wallet


async def get_reserve_vault():
    """Get the Central Bank's reserve vault (sovereign treasury)."""
    wallet = await db.hub_wallets.find_one({"user_id": SOVEREIGN_ADMIN_ID}, {"_id": 0})
    if not wallet:
        wallet = {
            "id": str(uuid.uuid4()),
            "user_id": SOVEREIGN_ADMIN_ID,
            "dust": 0,
            "gems": 0,
            "total_dust_earned": 0,
            "total_dust_spent": 0,
            "total_gems_earned": 0,
            "total_gems_spent": 0,
            "transmutation_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.hub_wallets.insert_one(wallet)
        wallet.pop("_id", None)
    return wallet


@router.get("/wallet")
async def get_wallet(user=Depends(get_current_user)):
    """Get user's Cosmic Dust + Celestial Gems balance from the vault."""
    wallet = await get_or_create_vault_wallet(user["id"])
    return {
        "dust": wallet["dust"],
        "gems": wallet["gems"],
        "total_dust_earned": wallet.get("total_dust_earned", 0),
        "total_gems_earned": wallet.get("total_gems_earned", 0),
        "transmutation_count": wallet.get("transmutation_count", 0),
        "transmutation_rate": f"{DUST_TO_GEM_RATIO} Dust = 1 Gem",
        "return_tax_rate": f"{RETURN_TAX_PERCENT}%",
    }


@router.post("/earn")
async def earn_dust(body: dict, user=Depends(get_current_user)):
    """Award Cosmic Dust for platform activity (Sweat Equity)."""
    action = body.get("action", "")
    if action not in DUST_REWARDS:
        raise HTTPException(400, f"Unknown action. Valid: {list(DUST_REWARDS.keys())}")

    amount = DUST_REWARDS[action]
    await get_or_create_vault_wallet(user["id"])
    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {"dust": amount, "total_dust_earned": amount}},
    )

    await db.hub_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": "earn",
        "currency": "dust",
        "amount": amount,
        "action": action,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    wallet = await get_or_create_vault_wallet(user["id"])
    return {
        "earned": amount,
        "action": action,
        "dust_balance": wallet["dust"],
        "gems_balance": wallet["gems"],
    }


@router.get("/policy")
async def get_monetary_policy(user=Depends(get_current_user)):
    """Get current monetary policy parameters set by the Central Bank."""
    reserve = await get_reserve_vault()
    total_wallets = await db.hub_wallets.count_documents({"user_id": {"$ne": SOVEREIGN_ADMIN_ID}})

    dust_pipeline = [
        {"$match": {"user_id": {"$ne": SOVEREIGN_ADMIN_ID}}},
        {"$group": {"_id": None, "total": {"$sum": "$dust"}}},
    ]
    gem_pipeline = [
        {"$match": {"user_id": {"$ne": SOVEREIGN_ADMIN_ID}}},
        {"$group": {"_id": None, "total": {"$sum": "$gems"}}},
    ]
    dust_agg = await db.hub_wallets.aggregate(dust_pipeline).to_list(1)
    gem_agg = await db.hub_wallets.aggregate(gem_pipeline).to_list(1)

    total_transmutations = await db.transmutation_log.count_documents({})
    total_taxes = await db.hub_ledger.count_documents({"type": "return_tax"})

    return {
        "dust_to_gem_ratio": DUST_TO_GEM_RATIO,
        "return_tax_percent": RETURN_TAX_PERCENT,
        "dust_rewards": DUST_REWARDS,
        "total_wallets": total_wallets,
        "circulating_dust": dust_agg[0]["total"] if dust_agg else 0,
        "circulating_gems": gem_agg[0]["total"] if gem_agg else 0,
        "reserve_dust": reserve["dust"],
        "reserve_gems": reserve["gems"],
        "total_transmutations": total_transmutations,
        "total_exit_taxes": total_taxes,
    }


@router.post("/return-tax")
async def apply_return_tax(body: dict, user=Depends(get_current_user)):
    """Apply the 30% Return Tax when value exits the circular economy.
    Tax is re-circulated into the reserve vault to prevent inflation."""
    currency = body.get("currency", "gems")
    amount = body.get("amount", 0)

    if currency not in ("dust", "gems"):
        raise HTTPException(400, "Currency must be 'dust' or 'gems'")
    if not isinstance(amount, (int, float)) or amount <= 0:
        raise HTTPException(400, "Amount must be positive")

    amount = int(amount)
    wallet = await get_or_create_vault_wallet(user["id"])
    if wallet[currency] < amount:
        raise HTTPException(402, f"Insufficient {currency}")

    tax = int(amount * RETURN_TAX_PERCENT / 100)
    net_exit = amount - tax
    now = datetime.now(timezone.utc).isoformat()

    # Debit user
    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {currency: -amount, f"total_{currency}_spent": amount}},
    )

    # Tax re-circulated to reserve vault
    await get_reserve_vault()
    await db.hub_wallets.update_one(
        {"user_id": SOVEREIGN_ADMIN_ID},
        {"$inc": {currency: tax, f"total_{currency}_earned": tax}},
    )

    await db.hub_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": "return_tax",
        "currency": currency,
        "gross_amount": amount,
        "tax": tax,
        "net_exit": net_exit,
        "tax_rate": RETURN_TAX_PERCENT,
        "created_at": now,
    })

    # Record in permanent central bank ledger
    await db.central_bank_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "type": "return_tax",
        "user_id": user["id"],
        "currency": currency,
        "tax_collected": tax,
        "net_exit_value": net_exit,
        "created_at": now,
    })

    updated = await get_or_create_vault_wallet(user["id"])
    return {
        "taxed": True,
        "currency": currency,
        "gross_amount": amount,
        "tax_applied": tax,
        "net_exit_value": net_exit,
        "tax_rate": f"{RETURN_TAX_PERCENT}%",
        "balance": {"dust": updated["dust"], "gems": updated["gems"]},
    }


@router.get("/ledger")
async def get_bank_ledger(user=Depends(get_current_user), skip: int = 0, limit: int = 30):
    """Get the Central Bank's permanent master ledger."""
    entries = await db.central_bank_ledger.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.central_bank_ledger.count_documents({})
    return {"entries": entries, "total": total}


@router.get("/user-ledger")
async def get_user_hub_ledger(user=Depends(get_current_user), skip: int = 0, limit: int = 30):
    """Get user's personal transaction history."""
    entries = await db.hub_ledger.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.hub_ledger.count_documents({"user_id": user["id"]})
    return {"entries": entries, "total": total}
