from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/treasury", tags=["Sovereign Treasury"])

# ─── Sovereign Configuration ───
SOVEREIGN_FEE_PERCENT = 5  # 5% platform fee on all marketplace trades
SOVEREIGN_ADMIN_ID = "sovereign_master"
INITIAL_CREDITS = 100  # Starting credits for new users


async def get_or_create_wallet(user_id: str):
    """Get or create a user's credit wallet."""
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        wallet = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "balance": INITIAL_CREDITS,
            "total_earned": 0,
            "total_spent": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.wallets.insert_one(wallet)
        wallet.pop("_id", None)
    return wallet


async def get_sovereign_wallet():
    """Get or create the sovereign master wallet (platform treasury)."""
    wallet = await db.wallets.find_one({"user_id": SOVEREIGN_ADMIN_ID}, {"_id": 0})
    if not wallet:
        wallet = {
            "id": str(uuid.uuid4()),
            "user_id": SOVEREIGN_ADMIN_ID,
            "balance": 0,
            "total_earned": 0,
            "total_spent": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.wallets.insert_one(wallet)
        wallet.pop("_id", None)
    return wallet


@router.get("/balance")
async def get_balance(user=Depends(get_current_user)):
    """Get current user's Harmony Credit balance."""
    wallet = await get_or_create_wallet(user["id"])
    return {
        "balance": wallet["balance"],
        "total_earned": wallet.get("total_earned", 0),
        "total_spent": wallet.get("total_spent", 0),
    }


@router.get("/ledger")
async def get_ledger(user=Depends(get_current_user), skip: int = 0, limit: int = 30):
    """Get transaction history."""
    txns = await db.transactions.find(
        {"$or": [{"from_id": user["id"]}, {"to_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return txns


@router.post("/purchase")
async def purchase_constellation(body: dict, user=Depends(get_current_user)):
    """Purchase a constellation recipe from the marketplace using Harmony Credits."""
    constellation_id = body.get("constellation_id")
    if not constellation_id:
        raise HTTPException(400, "constellation_id required")

    constellation = await db.constellations.find_one({"id": constellation_id}, {"_id": 0})
    if not constellation:
        raise HTTPException(404, "Constellation not found")

    if not constellation.get("is_for_sale"):
        raise HTTPException(400, "This constellation is not for sale")

    price = constellation.get("price", 0)
    if price <= 0:
        raise HTTPException(400, "Invalid price")

    seller_id = constellation.get("creator_id")
    if seller_id == user["id"]:
        raise HTTPException(400, "Cannot purchase your own constellation")

    # Check buyer balance
    buyer_wallet = await get_or_create_wallet(user["id"])
    if buyer_wallet["balance"] < price:
        raise HTTPException(402, "Insufficient Harmony Credits")

    # Calculate sovereign fee
    sovereign_cut = max(1, int(price * SOVEREIGN_FEE_PERCENT / 100))
    seller_amount = price - sovereign_cut

    now = datetime.now(timezone.utc).isoformat()
    escrow_id = str(uuid.uuid4())

    # Create escrow record
    escrow = {
        "id": escrow_id,
        "type": "constellation_purchase",
        "status": "completed",  # Instant for digital goods
        "buyer_id": user["id"],
        "seller_id": seller_id,
        "item_id": constellation_id,
        "item_name": constellation.get("name", ""),
        "total_price": price,
        "sovereign_cut": sovereign_cut,
        "seller_amount": seller_amount,
        "created_at": now,
        "completed_at": now,
    }
    await db.escrow.insert_one(escrow)

    # Debit buyer
    await db.wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {"balance": -price, "total_spent": price}}
    )

    # Credit seller
    await get_or_create_wallet(seller_id)
    await db.wallets.update_one(
        {"user_id": seller_id},
        {"$inc": {"balance": seller_amount, "total_earned": seller_amount}}
    )

    # Credit sovereign treasury
    await get_sovereign_wallet()
    await db.wallets.update_one(
        {"user_id": SOVEREIGN_ADMIN_ID},
        {"$inc": {"balance": sovereign_cut, "total_earned": sovereign_cut}}
    )

    # Transaction records
    txn_base = {
        "escrow_id": escrow_id,
        "constellation_id": constellation_id,
        "created_at": now,
    }
    await db.transactions.insert_many([
        {**txn_base, "id": str(uuid.uuid4()), "type": "purchase", "from_id": user["id"], "to_id": seller_id, "amount": -price, "description": f"Purchased: {constellation.get('name', '')}"},
        {**txn_base, "id": str(uuid.uuid4()), "type": "sale", "from_id": user["id"], "to_id": seller_id, "amount": seller_amount, "description": f"Sale: {constellation.get('name', '')}"},
        {**txn_base, "id": str(uuid.uuid4()), "type": "sovereign_fee", "from_id": user["id"], "to_id": SOVEREIGN_ADMIN_ID, "amount": sovereign_cut, "description": f"Harmony Tax ({SOVEREIGN_FEE_PERCENT}%)"},
    ])

    # Increment load count
    await db.constellations.update_one(
        {"id": constellation_id},
        {"$inc": {"load_count": 1}}
    )

    # Mirror hook: copy to sovereign ledger for Creator oversight
    await db.sovereign_mirror.insert_one({
        "id": str(uuid.uuid4()),
        "type": "purchase",
        "constellation": {
            "id": constellation_id,
            "name": constellation.get("name", ""),
            "module_ids": constellation.get("module_ids", []),
            "synergies": constellation.get("synergies", []),
        },
        "buyer_id": user["id"],
        "seller_id": seller_id,
        "price": price,
        "sovereign_cut": sovereign_cut,
        "created_at": now,
    })

    await create_activity(user["id"], "purchase", f"purchased constellation: {constellation.get('name', '')}")

    return {
        "success": True,
        "escrow_id": escrow_id,
        "amount_paid": price,
        "sovereign_fee": sovereign_cut,
        "new_balance": buyer_wallet["balance"] - price,
        "module_ids": constellation.get("module_ids", []),
    }


@router.get("/sovereign/dashboard")
async def sovereign_dashboard(user=Depends(get_current_user)):
    """Sovereign admin dashboard — view total treasury state."""
    sovereign = await get_sovereign_wallet()
    total_escrow = await db.escrow.count_documents({})
    active_escrow = await db.escrow.count_documents({"status": "held"})
    completed_escrow = await db.escrow.count_documents({"status": "completed"})
    total_users = await db.wallets.count_documents({"user_id": {"$ne": SOVEREIGN_ADMIN_ID}})

    # Recent transactions
    recent = await db.transactions.find(
        {"type": "sovereign_fee"}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)

    # Total volume
    pipeline = [
        {"$match": {"type": "sovereign_fee"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    agg = await db.transactions.aggregate(pipeline).to_list(1)
    total_fees = agg[0]["total"] if agg else 0

    return {
        "treasury_balance": sovereign["balance"],
        "total_fees_collected": total_fees,
        "fee_percent": SOVEREIGN_FEE_PERCENT,
        "total_escrow_contracts": total_escrow,
        "active_escrow": active_escrow,
        "completed_escrow": completed_escrow,
        "total_wallets": total_users,
        "recent_fees": recent,
    }
