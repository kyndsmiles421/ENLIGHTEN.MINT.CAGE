"""
ENLIGHTEN.MINT.CAFE - V-FINAL SOVEREIGN LEDGER API
Routes for the Cosmic Transaction Engine.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from utils.sovereign_ledger import SovereignLedger, sovereign_ledger

router = APIRouter(prefix="/sovereign-ledger", tags=["sovereign-ledger"])


# ═══════════════════════════════════════════════════════════════════════════════
# LEDGER STATUS & BALANCES
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/status")
async def get_ledger_status(user_id: str = Query(default="default_user")):
    """
    V-FINAL SOVEREIGN LEDGER — STATUS
    
    Get complete ledger status including balances, volunteer credits,
    and unlocked assets.
    """
    return sovereign_ledger.get_ledger_status(user_id)


@router.get("/transactions")
async def get_transactions(
    user_id: str = Query(default="default_user"),
    limit: int = Query(default=50, ge=1, le=500),
):
    """
    V-FINAL SOVEREIGN LEDGER — TRANSACTION HISTORY
    
    Get user's transaction history from the Cosmic Ledger.
    """
    return {
        "user_id": user_id,
        "transactions": sovereign_ledger.get_transaction_history(user_id, limit),
    }


@router.get("/cosmic-ledger")
async def get_cosmic_ledger(
    limit: int = Query(default=100, ge=1, le=1000),
):
    """
    V-FINAL SOVEREIGN LEDGER — COSMIC LEDGER VIEW
    
    Global transaction log across all users.
    """
    return {
        "name": "COSMIC_LEDGER",
        "transactions": sovereign_ledger.get_global_transactions(limit),
        "total_count": len(SovereignLedger._global_transactions),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# MATH LICENSING ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/market")
async def get_market_prices():
    """
    V-FINAL SOVEREIGN LEDGER — REFRACTION MARKET
    
    Get current prices for all math refraction artifacts.
    Includes Math Tax (1/φ) calculations.
    """
    return sovereign_ledger.get_market_prices()


@router.post("/license")
async def process_refraction_license(
    user_id: str = Query(default="default_user"),
    math_artifact_id: str = Query(..., description="Math artifact ID to license"),
):
    """
    V-FINAL SOVEREIGN LEDGER — LICENSE MATH REFRACTION
    
    Process the purchase of a math refraction license.
    
    MATH TAX: price × (1/φ) — The Golden Ratio Tax
    Volunteer credits provide up to 25% discount.
    Gems convert to equity at φ rate (1 gem = $1.618 equity).
    """
    result = sovereign_ledger.process_refraction_license(user_id, math_artifact_id)
    
    if result["status"] not in ["SUCCESS", "ALREADY_LICENSED"]:
        raise HTTPException(400, result)
    
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# VOLUNTEER CREDITS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/volunteer")
async def log_volunteer_hours(
    user_id: str = Query(default="default_user"),
    hours: float = Query(..., ge=0.1, le=24, description="Hours to log"),
    activity: str = Query(default="learning", description="Activity type"),
):
    """
    V-FINAL SOVEREIGN LEDGER — LOG VOLUNTEER HOURS
    
    Log volunteer hours and convert to credits at 10 credits/hr rate.
    Also adds equity bonus at 1/φ rate.
    """
    return sovereign_ledger.log_volunteer_hours(user_id, hours, activity)


# ═══════════════════════════════════════════════════════════════════════════════
# EQUITY TRANSFERS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/transfer")
async def transfer_equity(
    from_user: str = Query(..., description="Sender user ID"),
    to_user: str = Query(..., description="Recipient user ID"),
    amount: float = Query(..., ge=0.01, description="Amount to transfer"),
    memo: str = Query(default="Transfer", description="Transaction memo"),
):
    """
    V-FINAL SOVEREIGN LEDGER — TRANSFER EQUITY
    
    Transfer equity between users.
    Transfer tax: 1/φ² (≈38.2%) goes to Aether Fund.
    """
    if from_user == to_user:
        raise HTTPException(400, "Cannot transfer to self")
    
    result = sovereign_ledger.transfer_equity(from_user, to_user, amount, memo)
    
    if result["status"] == "INSUFFICIENT_FUNDS":
        raise HTTPException(400, result)
    
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# CURRENCY REWARDS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/reward/gems")
async def add_gems(
    user_id: str = Query(default="default_user"),
    amount: int = Query(..., ge=1, le=10000, description="Gems to add"),
    source: str = Query(default="reward", description="Source of gems"),
):
    """
    V-FINAL SOVEREIGN LEDGER — ADD GEMS
    
    Add gems to user's balance.
    """
    return sovereign_ledger.add_gems(user_id, amount, source)


@router.post("/reward/dust")
async def add_dust(
    user_id: str = Query(default="default_user"),
    amount: int = Query(..., ge=1, le=100000, description="Dust to add"),
    source: str = Query(default="reward", description="Source of dust"),
):
    """
    V-FINAL SOVEREIGN LEDGER — ADD DUST
    
    Add dust to user's balance.
    """
    return sovereign_ledger.add_dust(user_id, amount, source)


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS & FORMULAS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/formulas")
async def get_ledger_formulas():
    """
    V-FINAL SOVEREIGN LEDGER — ECONOMIC FORMULAS
    
    Returns all the mathematical formulas used in the economy.
    """
    return {
        "constants": {
            "phi": SovereignLedger.PHI,
            "inverse_phi": SovereignLedger.INVERSE_PHI,
            "volunteer_rate": SovereignLedger.VOLUNTEER_RATE,
            "seg_frequency": SovereignLedger.SEG_FREQUENCY,
        },
        "formulas": {
            "math_tax": "price × (1/φ) = price × 0.618...",
            "total_license_cost": "base_price + math_tax",
            "volunteer_discount": "min(credits × 0.01, 0.25) — Max 25%",
            "gems_to_equity": "gems × φ = gems × 1.618...",
            "transfer_tax": "amount × (1/φ²) = amount × 0.382...",
            "volunteer_equity_bonus": "credits_earned × (1/φ)",
        },
        "examples": {
            "infinity_edge_license": {
                "base_price": 50,
                "math_tax": round(50 * SovereignLedger.INVERSE_PHI, 2),
                "total": round(50 + 50 * SovereignLedger.INVERSE_PHI, 2),
            },
            "100_gems_as_equity": round(100 * SovereignLedger.PHI, 2),
            "5_volunteer_hours": {
                "credits": 5 * SovereignLedger.VOLUNTEER_RATE,
                "equity_bonus": round(5 * SovereignLedger.VOLUNTEER_RATE * SovereignLedger.INVERSE_PHI, 2),
            },
        },
    }
