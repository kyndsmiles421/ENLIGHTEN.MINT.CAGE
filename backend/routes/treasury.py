from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/treasury", tags=["Sovereign Treasury"])

# ─── Sovereign Configuration ───
DEFAULT_FEE_PERCENT = 5
SOVEREIGN_ADMIN_ID = "sovereign_master"
INITIAL_CREDITS = 100


async def get_sovereign_config():
    """Get or create the global sovereign configuration."""
    config = await db.sovereign_config.find_one({"id": "global"}, {"_id": 0})
    if not config:
        config = {
            "id": "global",
            "fee_percent": DEFAULT_FEE_PERCENT,
            "is_live": True,
            "mirror_active": True,
            "frozen_transactions": False,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.sovereign_config.insert_one(config)
        config.pop("_id", None)
    return config


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

    # Get dynamic fee from sovereign config
    config = await get_sovereign_config()
    if config.get("frozen_transactions"):
        raise HTTPException(423, "Transactions are currently frozen by the Sovereign")
    fee_percent = config.get("fee_percent", DEFAULT_FEE_PERCENT)

    # Calculate sovereign fee
    sovereign_cut = max(1, int(price * fee_percent / 100))
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
        {**txn_base, "id": str(uuid.uuid4()), "type": "sovereign_fee", "from_id": user["id"], "to_id": SOVEREIGN_ADMIN_ID, "amount": sovereign_cut, "description": f"Harmony Tax ({fee_percent}%)"},
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
    config = await get_sovereign_config()
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
        "fee_percent": config.get("fee_percent", DEFAULT_FEE_PERCENT),
        "is_live": config.get("is_live", True),
        "mirror_active": config.get("mirror_active", True),
        "frozen_transactions": config.get("frozen_transactions", False),
        "total_escrow_contracts": total_escrow,
        "active_escrow": active_escrow,
        "completed_escrow": completed_escrow,
        "total_wallets": total_users,
        "recent_fees": recent,
    }


@router.get("/sovereign/config")
async def get_config(user=Depends(get_current_user)):
    """Get current sovereign configuration."""
    config = await get_sovereign_config()
    return config


@router.patch("/sovereign/config")
async def update_config(body: dict, user=Depends(get_current_user)):
    """Update sovereign configuration — fee slider, mirror toggle, kill-switch."""
    await get_sovereign_config()  # Ensure config exists
    updates = {}

    if "fee_percent" in body:
        fee = body["fee_percent"]
        if not isinstance(fee, (int, float)) or fee < 0 or fee > 50:
            raise HTTPException(400, "Fee must be between 0 and 50")
        updates["fee_percent"] = round(fee, 2)

    if "is_live" in body:
        updates["is_live"] = bool(body["is_live"])

    if "mirror_active" in body:
        updates["mirror_active"] = bool(body["mirror_active"])

    if "frozen_transactions" in body:
        updates["frozen_transactions"] = bool(body["frozen_transactions"])

    if not updates:
        raise HTTPException(400, "No valid fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.sovereign_config.update_one(
        {"id": "global"},
        {"$set": updates}
    )

    updated = await get_sovereign_config()
    return updated


@router.get("/sovereign/mirror")
async def get_mirror_entries(user=Depends(get_current_user), skip: int = 0, limit: int = 50):
    """Get sovereign mirror ledger — all copied blueprints and transactions."""
    entries = await db.sovereign_mirror.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.sovereign_mirror.count_documents({})
    return {"entries": entries, "total": total}


@router.get("/sovereign/escrow")
async def get_escrow_contracts(user=Depends(get_current_user), status: str = None, skip: int = 0, limit: int = 30):
    """List all escrow contracts, optionally filtered by status."""
    query = {}
    if status:
        query["status"] = status
    contracts = await db.escrow.find(
        query, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return contracts


@router.post("/sovereign/freeze/{escrow_id}")
async def freeze_escrow(escrow_id: str, user=Depends(get_current_user)):
    """Freeze a specific escrow contract (kill-switch for individual trades)."""
    result = await db.escrow.update_one(
        {"id": escrow_id},
        {"$set": {"status": "frozen", "frozen_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(404, "Escrow not found")
    return {"frozen": True, "escrow_id": escrow_id}


@router.get("/skeleton/export")
async def skeleton_export():
    """Export the framework skeleton — stripped of cosmic paint for white-label reuse.
    Returns the module registry structure, class archetypes, and treasury config
    as clean JSON ready for domain injection."""
    config = await get_sovereign_config()

    # Module registry skeleton (strip cosmic-specific names/colors)
    from routes.classes import CLASS_ARCHETYPES
    class_skeleton = {}
    for cid, cdata in CLASS_ARCHETYPES.items():
        class_skeleton[cid] = {
            "id": cdata["id"],
            "role": cdata["title"],
            "boosted_affinities": cdata["boosted_affinities"],
            "synergy_bonus": cdata["synergy_bonus"],
            "special_synthesis": cdata["special_synthesis"],
        }

    return {
        "framework": "Universal Synthesis Interface",
        "version": "1.0",
        "skeleton": {
            "module_types": ["frequency", "sound", "instrument", "logic-gate", "engine"],
            "affinity_tags": ["audio", "spiritual", "healing", "nature", "grounding",
                              "awakening", "creative", "geometric", "spatial",
                              "non-linear", "elemental", "cosmic"],
            "tier_levels": {
                "0": {"name": "Foundation", "access": "Base modules + 528Hz"},
                "1": {"name": "Civilization", "access": "Full modules + Classes + Synthesis"},
                "2": {"name": "Sovereignty", "access": "Engines + Marketplace + Escrow"},
            },
            "interaction_model": {
                "drag_and_drop": "orbital_ring",
                "synergy_detection": "affinity_overlap >= 2",
                "magnetic_snap_radius": 75,
                "focus_mode_trigger": "active_modules >= 3",
                "hyper_focus_trigger": "active_modules >= 5",
            },
            "monetization": {
                "fee_percent": config.get("fee_percent", DEFAULT_FEE_PERCENT),
                "initial_credits": INITIAL_CREDITS,
                "escrow_model": "instant_for_digital",
                "mirror_hook": config.get("mirror_active", True),
            },
        },
        "class_archetypes": class_skeleton,
        "config_endpoints": {
            "GET /api/treasury/sovereign/config": "Read current config",
            "PATCH /api/treasury/sovereign/config": "Update fee, toggles",
            "GET /api/treasury/skeleton/export": "This endpoint",
        },
    }
