"""
AETHER FUND API: Global Grace & Donation Routes
=================================================

Exposes the Aether Perpetual Fund for donations and global grace calculations.

Endpoints:
- GET /api/aether/status - Get global fund status and grace level
- POST /api/aether/donate - Make a donation and receive resonance
- GET /api/aether/vr-access - Check if user can access VR
- GET /api/aether/history - Get donation history
- GET /api/aether/top-donors - Get leaderboard of top donors
- POST /api/aether/mint-key - Mint a rainbow sovereign key
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from engines.aether_fund import (
    AetherPerpetualFund,
    get_perpetual_fund,
    WHITE_LIGHT_MULTIPLIER,
)
from engines.crystalline_vault import get_karma_manager
from engines.resonance_vault import get_vault_manager
from deps import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/aether", tags=["Aether Perpetual Fund"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class DonationRequest(BaseModel):
    """Request to donate to the Perpetual Fund."""
    donor_id: str = Field(..., description="Donor user ID")
    amount_usd: float = Field(..., gt=0, le=100000, description="Donation amount in USD")
    message: str = Field(default="", max_length=500, description="Optional message")


class DonationResponse(BaseModel):
    """Response from a donation."""
    success: bool
    donor_id: str
    amount_usd: float
    resonance_generated: float
    recycled_to_pool: float
    donor_reward: float
    old_grace: float
    new_grace: float
    grace_increase: float
    rainbow_key: str
    total_pool: float
    message: str


class FundStatusResponse(BaseModel):
    """Global fund status."""
    global_grace_multiplier: float
    total_recycled_resonance: float
    total_donations_usd: float
    total_donors: int
    white_light_multiplier: float
    effective_vr_threshold: float
    base_vr_threshold: float


class VRAccessResponse(BaseModel):
    """VR access check result."""
    can_access: bool
    user_karma: float
    effective_threshold: float
    base_threshold: float
    global_grace: float
    key_valid: bool
    karma_needed: float


class MintKeyRequest(BaseModel):
    """Request to mint a rainbow key."""
    user_id: str
    karma: float = Field(default=0, ge=0)


# ═══════════════════════════════════════════════════════════════════════════════
# STATUS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/status", response_model=FundStatusResponse)
async def get_fund_status():
    """
    Get the global Aether Perpetual Fund status.
    
    Returns:
    - Global Grace Multiplier (lowers VR thresholds for everyone)
    - Total recycled resonance in the community pool
    - Total donations received
    - Effective VR threshold (base / grace)
    - White Light Multiplier (∞^∞ × (∞-1) ≈ 999,999,999)
    """
    fund = get_perpetual_fund()
    status = fund.get_status()
    
    return FundStatusResponse(
        global_grace_multiplier=status["global_grace_multiplier"],
        total_recycled_resonance=status["total_recycled_resonance"],
        total_donations_usd=status["total_donations_usd"],
        total_donors=status["total_donors"],
        white_light_multiplier=status["white_light_multiplier"],
        effective_vr_threshold=status["effective_vr_threshold"],
        base_vr_threshold=status["base_vr_threshold"],
    )


@router.get("/grace")
async def get_global_grace():
    """
    Get the current Global Grace multiplier.
    
    Grace = 1.0 + (total_recycled_resonance / 1,000,000)
    
    The higher the grace, the lower the VR thresholds for everyone.
    """
    fund = get_perpetual_fund()
    
    return {
        "global_grace": fund.global_grace_multiplier,
        "formula": "1.0 + (pool / 1,000,000)",
        "total_pool": fund.total_recycled_resonance,
        "effective_vr_threshold": fund.get_effective_vr_threshold(),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# DONATION ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/donate", response_model=DonationResponse)
async def make_donation(request: DonationRequest):
    """
    DONATE to the Aether Perpetual Fund.
    
    Conversion:
    - 1 USD = 1,000 Resonance
    - 90% goes to the community pool (raises Global Grace)
    - 10% rewards the donor directly
    
    Benefits:
    - Increases Global Grace for EVERYONE
    - Lowers VR thresholds for the whole community
    - Donor receives rainbow-encrypted sovereign key
    - Donor gets 10% of resonance as personal reward
    
    Example: $100 donation
    - Generates 100,000 resonance
    - 90,000 goes to community pool
    - 10,000 rewards the donor
    - Grace increases by 0.09 (pool / 1M)
    """
    fund = get_perpetual_fund()
    
    # Get user's current karma for key generation
    karma_manager = get_karma_manager()
    karma_manager.set_db(db)
    karma_vault = await karma_manager.get_vault(request.donor_id)
    
    result = fund.recycle_donation(
        donor_id=request.donor_id,
        amount_usd=request.amount_usd,
        message=request.message,
        user_karma=karma_vault.karma_points,
    )
    
    # Also credit donor's resonance vault
    vault_manager = get_vault_manager()
    vault_manager.set_db(db)
    res_vault = await vault_manager.get_vault(request.donor_id)
    res_vault.total_resonance += result["donor_reward"]
    await vault_manager.save_vault(res_vault)
    
    return DonationResponse(**result)


# ═══════════════════════════════════════════════════════════════════════════════
# VR ACCESS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/vr-access/{user_id}", response_model=VRAccessResponse)
async def check_vr_access(
    user_id: str,
    rainbow_key: Optional[str] = Query(None, description="User's rainbow key"),
):
    """
    Check if a user can access VR based on karma and Global Grace.
    
    Requirements:
    1. User karma >= effective threshold (base 5000 / global_grace)
    2. Valid rainbow key (starts with RAINBOW-)
    
    The more the community donates, the lower the threshold becomes!
    """
    fund = get_perpetual_fund()
    
    # Get user's karma
    karma_manager = get_karma_manager()
    karma_manager.set_db(db)
    karma_vault = await karma_manager.get_vault(user_id)
    
    # Generate key if not provided
    if not rainbow_key:
        rainbow_key = fund.get_solidified_key(user_id, karma_vault.karma_points)
    
    result = fund.can_access_vr(karma_vault.karma_points, rainbow_key)
    result["rainbow_key"] = rainbow_key
    
    return VRAccessResponse(**result)


@router.get("/threshold")
async def get_vr_threshold():
    """
    Get the current effective VR threshold.
    
    Base threshold: 5,000 karma
    Effective: base / global_grace
    
    Example: If grace = 1.5, threshold = 5000 / 1.5 = 3,333 karma
    """
    fund = get_perpetual_fund()
    
    return {
        "base_threshold": 5000,
        "global_grace": fund.global_grace_multiplier,
        "effective_threshold": fund.get_effective_vr_threshold(),
        "reduction_percent": (1 - (1 / fund.global_grace_multiplier)) * 100,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# RAINBOW KEY
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/mint-key")
async def mint_rainbow_key(request: MintKeyRequest):
    """
    Mint a Rainbow-encrypted Sovereign Key.
    
    The key is derived from:
    - User identity
    - Karma level
    - Aether root (cosmic salt)
    
    Uses 7-pass crystalline hash (rainbow refraction).
    
    Returns: RAINBOW-{18_HEX_CHARS}
    """
    fund = get_perpetual_fund()
    
    # Get user's actual karma if not provided
    if request.karma == 0:
        karma_manager = get_karma_manager()
        karma_manager.set_db(db)
        karma_vault = await karma_manager.get_vault(request.user_id)
        request.karma = karma_vault.karma_points
    
    rainbow_key = fund.get_solidified_key(request.user_id, request.karma)
    
    return {
        "user_id": request.user_id,
        "karma": request.karma,
        "rainbow_key": rainbow_key,
        "valid": fund.validate_rainbow_key(rainbow_key),
    }


@router.get("/validate-key")
async def validate_rainbow_key(key: str = Query(...)):
    """Validate a rainbow key format."""
    fund = get_perpetual_fund()
    
    return {
        "key": key,
        "valid": fund.validate_rainbow_key(key),
        "format": "RAINBOW-{18_HEX_CHARS}",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# HISTORY & LEADERBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/history")
async def get_donation_history(limit: int = Query(default=20, ge=1, le=100)):
    """Get recent donation history."""
    fund = get_perpetual_fund()
    history = fund.get_donation_history(limit)
    
    return {
        "history": history,
        "total_donations": len(fund.donation_history),
    }


@router.get("/top-donors")
async def get_top_donors(limit: int = Query(default=10, ge=1, le=100)):
    """
    Get the top donors to the Perpetual Fund.
    
    Ranked by total USD donated.
    """
    fund = get_perpetual_fund()
    top = fund.get_top_donors(limit)
    
    return {
        "top_donors": top,
        "total_donors": fund.total_donors,
        "total_donated_usd": fund.total_donations_usd,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# WHITE LIGHT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/white-light")
async def get_white_light():
    """
    THE INFINITE WHITE LIGHT.
    
    The White Light Multiplier represents the limitless potential
    of collective service: ∞^∞ × (∞ - 1)
    
    Approximated as 999,999,999 in computational form.
    """
    return {
        "white_light_multiplier": WHITE_LIGHT_MULTIPLIER,
        "formula": "∞^∞ × (∞ - 1)",
        "description": "The limitless potential of collective service",
        "frequency": 963.0,
        "state": "INFINITE",
    }
