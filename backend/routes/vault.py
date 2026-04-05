"""
RESONANCE VAULT API: User Wallet & Balance Routes
==================================================

Exposes the Resonance Vault for managing user balances and seed ownership.

Endpoints:
- GET /api/vault/balance - Get user's resonance balance
- GET /api/vault/seeds - Get user's owned seeds
- GET /api/vault/history - Get harvest history
- POST /api/vault/deposit - Manual deposit (admin/testing)
- POST /api/vault/spend - Spend resonance
- GET /api/vault/leaderboard - Top users by balance
- GET /api/vault/stats - Global vault statistics
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from engines.resonance_vault import (
    ResonanceVault,
    VaultManager,
    get_vault_manager,
)
from deps import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vault", tags=["Resonance Vault"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class BalanceResponse(BaseModel):
    """User's vault balance."""
    user_id: str
    total_resonance: float
    seeds_owned: int
    total_harvests: int
    last_harvest_at: Optional[float]


class DepositRequest(BaseModel):
    """Request to deposit resonance (for testing/admin)."""
    user_id: str = Field(..., description="User ID")
    amount: float = Field(..., gt=0, description="Amount to deposit")
    seed_id: Optional[str] = Field(None, description="Associated seed ID")
    reason: str = Field(default="manual_deposit", description="Reason for deposit")


class SpendRequest(BaseModel):
    """Request to spend resonance."""
    user_id: str = Field(..., description="User ID")
    amount: float = Field(..., gt=0, description="Amount to spend")
    reason: str = Field(default="purchase", description="Reason for spending")


class SpendResponse(BaseModel):
    """Response from spending resonance."""
    success: bool
    message: str
    amount_spent: Optional[float] = None
    old_balance: Optional[float] = None
    new_balance: Optional[float] = None
    error: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# BALANCE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/balance/{user_id}", response_model=BalanceResponse)
async def get_balance(user_id: str):
    """
    Get a user's resonance vault balance.
    
    Returns total resonance, seed count, and harvest stats.
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    balance = vault.get_balance()
    
    return BalanceResponse(**balance)


@router.get("/balance")
async def get_my_balance(user_id: str = Query(..., description="User ID")):
    """Get balance for a specific user (query param version)."""
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    return vault.get_balance()


# ═══════════════════════════════════════════════════════════════════════════════
# SEEDS & HISTORY
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/seeds/{user_id}")
async def get_seeds(
    user_id: str,
    limit: int = Query(default=50, ge=1, le=500),
):
    """
    Get list of seeds owned by a user.
    
    Returns seed IDs that can be looked up in the XR system.
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    seeds = vault.get_seeds(limit)
    
    return {
        "user_id": user_id,
        "seeds": seeds,
        "total_owned": len(vault.seeds_collected),
        "returned": len(seeds),
    }


@router.get("/history/{user_id}")
async def get_history(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
):
    """
    Get a user's harvest history.
    
    Returns detailed records of each seed collected including
    location, radiance tier, and resonance earned.
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    history = vault.get_harvest_history(limit)
    
    return {
        "user_id": user_id,
        "history": history,
        "total_harvests": vault.total_harvests,
    }


@router.get("/owns/{user_id}/{seed_id}")
async def check_ownership(user_id: str, seed_id: str):
    """Check if a user owns a specific seed."""
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    owns = vault.owns_seed(seed_id)
    
    return {
        "user_id": user_id,
        "seed_id": seed_id,
        "owns": owns,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# DEPOSIT & SPEND
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/deposit")
async def deposit_resonance(request: DepositRequest):
    """
    Manually deposit resonance into a user's vault.
    
    Primarily for testing and admin purposes. Normal deposits
    happen automatically through the XR harvest system.
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(request.user_id)
    
    # Simple deposit without full harvest record
    old_balance = vault.total_resonance
    vault.total_resonance += request.amount
    
    if request.seed_id and request.seed_id not in vault.seeds_collected:
        vault.seeds_collected.append(request.seed_id)
    
    # Save to DB
    await manager.save_vault(vault)
    
    return {
        "success": True,
        "message": f"Deposited +{request.amount:.0f} resonance",
        "user_id": request.user_id,
        "amount": request.amount,
        "reason": request.reason,
        "old_balance": old_balance,
        "new_balance": vault.total_resonance,
    }


@router.post("/spend", response_model=SpendResponse)
async def spend_resonance(request: SpendRequest):
    """
    Spend resonance from a user's vault.
    
    Used for:
    - Phygital Marketplace purchases
    - Premium content unlocks
    - Minting new seeds
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(request.user_id)
    result = vault.spend_resonance(request.amount, request.reason)
    
    if result["success"]:
        # Save to DB
        await manager.save_vault(vault)
    
    return SpendResponse(
        success=result["success"],
        message=result.get("message", result.get("error", "Unknown")),
        amount_spent=result.get("amount_spent"),
        old_balance=result.get("old_balance"),
        new_balance=result.get("new_balance"),
        error=result.get("error"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# LEADERBOARD & STATS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/leaderboard")
async def get_leaderboard(limit: int = Query(default=10, ge=1, le=100)):
    """
    Get the resonance leaderboard.
    
    Shows top users by total resonance balance.
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    leaderboard = await manager.get_leaderboard(limit)
    
    return {
        "leaderboard": leaderboard,
        "returned": len(leaderboard),
    }


@router.get("/stats")
async def get_global_stats():
    """
    Get global vault statistics.
    
    Shows total vaults, combined resonance, and seed ownership.
    """
    manager = get_vault_manager()
    manager.set_db(db)
    
    stats = await manager.get_global_stats()
    
    return stats
