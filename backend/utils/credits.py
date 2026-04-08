# ENLIGHTEN.MINT.CAFE - Shared Credit Operations
# This module provides credit operations to prevent circular imports between:
# - economy_admin.py
# - marketplace.py
# - refinement.py
# - energy_gates.py
from deps import db
from datetime import datetime, timezone


async def get_user_credits(user_id: str) -> int:
    """Get current credit balance for a user."""
    doc = await db.cosmic_credits.find_one({"user_id": user_id}, {"_id": 0})
    return (doc or {}).get("balance", 0)


async def modify_credits(user_id: str, amount: int, source: str) -> int:
    """
    Add or subtract credits from user balance.
    Returns new balance.
    """
    await db.cosmic_credits.update_one(
        {"user_id": user_id},
        {
            "$inc": {"balance": amount},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True,
    )
    await db.marketplace_transactions.insert_one({
        "user_id": user_id,
        "type": "credits",
        "amount": amount,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return await get_user_credits(user_id)


async def get_user_dust(user_id: str) -> int:
    """Get current cosmic dust balance."""
    doc = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0})
    return (doc or {}).get("cosmic_dust", 0)


async def modify_dust(user_id: str, amount: int, source: str) -> int:
    """Add or subtract dust from user balance. Returns new balance."""
    await db.rpg_currencies.update_one(
        {"user_id": user_id},
        {
            "$inc": {"cosmic_dust": amount},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True,
    )
    new_balance = await get_user_dust(user_id)
    return new_balance


# Re-export from crystal_seal for convenience
from engines.crystal_seal import (
    EconomyCommon,
    economy_common,
    COMMUNAL_GOALS,
    secure_hash_short,
)

__all__ = [
    'get_user_credits',
    'modify_credits',
    'get_user_dust',
    'modify_dust',
    'EconomyCommon',
    'economy_common',
    'COMMUNAL_GOALS',
    'secure_hash_short',
]
