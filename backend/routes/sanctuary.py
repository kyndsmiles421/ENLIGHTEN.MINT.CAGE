"""
SANCTUARY API: EnlightenMintCafe Unified Routes
=================================================

The unified API for the Positive Karma Machine.

Endpoints:
- GET /api/sanctuary/status - Global Sanctuary status
- GET /api/sanctuary/user/{user_id} - User's karma status
- POST /api/sanctuary/recycle - Donate/recycle energy
- POST /api/sanctuary/deed - Log a good deed
- GET /api/sanctuary/vr-access/{user_id} - Check VR access
- GET /api/sanctuary/deed-types - Available deed types
- GET /api/sanctuary/leaderboard - Top karma earners
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import time

from engines.enlighten_mint_cafe import (
    EnlightenMintCafe,
    get_sanctuary,
    DEED_WEIGHTS,
    FIBONACCI_SCALAR,
    SOLIDIFICATION_THRESHOLD,
    TESSERACT_FREQUENCY,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sanctuary", tags=["EnlightenMintCafe Sanctuary"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class RecycleRequest(BaseModel):
    """Request to recycle energy (donate)."""
    donor_id: str = Field(..., description="Donor user ID")
    amount_usd: float = Field(..., gt=0, le=100000, description="USD amount")
    message: str = Field(default="", max_length=500)


class DeedRequest(BaseModel):
    """Request to log a good deed."""
    user_id: str = Field(..., description="User ID")
    deed_type: str = Field(..., description="Type of deed")
    hours: float = Field(..., gt=0, le=24, description="Hours spent")
    description: str = Field(default="", max_length=500)


class RecycleResponse(BaseModel):
    """Response from recycling energy."""
    success: bool
    message: str
    donor_id: str
    amount_usd: float
    resonance_added: float
    fibonacci_scalar: int
    old_grace: float
    new_grace: float
    grace_increase: float
    total_pool: float
    rainbow_key: str


class DeedResponse(BaseModel):
    """Response from logging a deed."""
    success: bool
    user_id: str
    deed_type: str
    hours: float
    base_impact: float
    grace_multiplier: float
    karma_earned: float
    old_karma: float
    new_karma: float
    is_solidified: bool
    rainbow_key: str
    status: str
    message: Optional[str] = None
    karma_to_solidify: Optional[float] = None
    vr_access: Optional[bool] = None


class UserStatusResponse(BaseModel):
    """User's sanctuary status."""
    user_id: str
    karma: float
    is_solidified: bool
    total_deeds: int
    total_keys: int
    latest_key: Optional[str]
    karma_to_solidify: float
    effective_threshold: float
    grace_multiplier: float


class GlobalStatusResponse(BaseModel):
    """Global sanctuary status."""
    owner: str
    resonance_pool: float
    grace_multiplier: float
    total_donations_usd: float
    total_karma_generated: float
    total_users: int
    total_solidifications: int
    shield_power: float
    frequency: float
    fibonacci_scalar: int
    effective_threshold: float


# ═══════════════════════════════════════════════════════════════════════════════
# STATUS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/status", response_model=GlobalStatusResponse)
async def get_global_status():
    """
    Get global Sanctuary status.
    
    Shows:
    - Global resonance pool (100% recycled donations)
    - Grace multiplier (lowers thresholds for everyone)
    - Shield power: (∞^∞) × (∞-1) ≈ 999,999,999
    - Tesseract frequency: 963Hz
    - Fibonacci scalar: 144 (1 USD = 144 resonance)
    """
    sanctuary = get_sanctuary()
    status = sanctuary.get_global_status()
    return GlobalStatusResponse(**status)


@router.get("/user/{user_id}", response_model=UserStatusResponse)
async def get_user_status(user_id: str):
    """
    Get a user's sanctuary status.
    
    Shows karma, solidification status, and VR access eligibility.
    """
    sanctuary = get_sanctuary()
    status = sanctuary.get_user_status(user_id)
    return UserStatusResponse(**status)


# ═══════════════════════════════════════════════════════════════════════════════
# PERPETUAL FUND (RECYCLE ENERGY)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/recycle", response_model=RecycleResponse)
async def recycle_energy(request: RecycleRequest):
    """
    RECYCLE ENERGY: Donate to the Perpetual Fund.
    
    100% of donations are recycled into Global Grace.
    
    Conversion:
    - 1 USD = 144 Resonance (Fibonacci Scalar)
    - Grace = 1.0 + (pool / 1,000,000)
    
    Benefits:
    - MORE DONATIONS = LOWER THRESHOLDS FOR EVERYONE
    - Donor receives Rainbow Key as proof
    - Grace multiplies ALL future karma earnings
    
    Example: $100 donation
    - Adds 14,400 resonance to pool
    - If pool was 0, grace becomes 1.0144 (1.44% boost)
    - Everyone's karma earnings increase by 1.44%
    """
    sanctuary = get_sanctuary()
    result = sanctuary.recycle_energy(
        donor_id=request.donor_id,
        amount_usd=request.amount_usd,
        message=request.message,
    )
    
    return RecycleResponse(**result)


# ═══════════════════════════════════════════════════════════════════════════════
# KARMA MACHINE (LOG DEEDS)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/deed", response_model=DeedResponse)
async def log_good_deed(request: DeedRequest):
    """
    LOG A GOOD DEED: Translate physical service into VR access.
    
    Formula:
    - Karma = (Impact × Hours × 100) × Grace Multiplier
    
    Impact weights:
    - manual_labor: 5.0
    - mentoring: 4.5
    - healing_service: 4.5
    - cleanup: 4.0
    - community_service: 4.0
    - environmental: 4.0
    - creative_offering: 3.0
    - donation: 2.0
    - meditation: 1.0
    
    SOLIDIFICATION at 5,000 karma:
    - Crystal Hardens
    - VR Gateway Opens
    - Rainbow Key generated as proof
    
    Example: 4 hours of manual_labor with grace 1.5
    - Karma = (5.0 × 4 × 100) × 1.5 = 3,000
    """
    sanctuary = get_sanctuary()
    result = sanctuary.log_good_deed(
        user_id=request.user_id,
        deed_type=request.deed_type,
        hours=request.hours,
        description=request.description,
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return DeedResponse(**result)


# ═══════════════════════════════════════════════════════════════════════════════
# VR ACCESS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/vr-access/{user_id}")
async def check_vr_access(user_id: str):
    """
    Check if user can access VR sanctuary.
    
    Access granted if:
    - Already solidified (karma reached 5000 at some point)
    - OR current karma >= effective_threshold (5000 / grace)
    
    The community's donations lower the threshold for everyone!
    """
    sanctuary = get_sanctuary()
    return sanctuary.check_vr_access(user_id)


@router.get("/threshold")
async def get_threshold():
    """
    Get current effective threshold for VR access.
    
    Base: 5,000 karma
    Effective: 5,000 / grace_multiplier
    
    Example: If grace = 2.0, threshold = 2,500 karma
    """
    sanctuary = get_sanctuary()
    return {
        "base_threshold": SOLIDIFICATION_THRESHOLD,
        "grace_multiplier": sanctuary.grace_multiplier,
        "effective_threshold": SOLIDIFICATION_THRESHOLD / sanctuary.grace_multiplier,
        "resonance_pool": sanctuary.resonance_pool,
        "reduction_percent": (1 - (1 / sanctuary.grace_multiplier)) * 100,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# REFERENCE DATA
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/deed-types")
async def get_deed_types():
    """
    Get available deed types and their impact weights.
    
    Use these values when logging deeds.
    """
    sanctuary = get_sanctuary()
    return sanctuary.get_deed_types()


@router.get("/constants")
async def get_constants():
    """
    Get all Sanctuary constants.
    """
    sanctuary = get_sanctuary()
    return {
        "fibonacci_scalar": FIBONACCI_SCALAR,
        "solidification_threshold": SOLIDIFICATION_THRESHOLD,
        "tesseract_frequency": TESSERACT_FREQUENCY,
        "shield_power": sanctuary.shield_power,
        "grace_multiplier": sanctuary.grace_multiplier,
        "deed_weights": DEED_WEIGHTS,
        "karma_formula": "(impact × hours × 100) × grace_multiplier",
        "resonance_formula": "USD × 144 (Fibonacci)",
        "grace_formula": "1.0 + (pool / 1,000,000)",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# LEADERBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/leaderboard")
async def get_leaderboard(limit: int = Query(default=10, ge=1, le=100)):
    """
    Get karma leaderboard.
    
    Shows top users by karma with solidification status.
    """
    sanctuary = get_sanctuary()
    
    # Get all users sorted by karma
    users = []
    for user_id, user_sanctuary in sanctuary._sanctuaries.items():
        users.append({
            "user_id": user_id,
            "karma": user_sanctuary.karma,
            "is_solidified": user_sanctuary.is_solidified,
            "total_deeds": len(user_sanctuary.deed_history),
        })
    
    # Sort by karma descending
    users.sort(key=lambda x: x["karma"], reverse=True)
    
    return {
        "leaderboard": users[:limit],
        "total_users": len(users),
        "total_solidified": sanctuary.total_solidifications,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# RAINBOW KEY
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/validate-key")
async def validate_rainbow_key(key: str = Query(...)):
    """Validate a rainbow key format."""
    sanctuary = get_sanctuary()
    return {
        "key": key,
        "valid": sanctuary.validate_rainbow_key(key),
        "format": "RAINBOW-{18 uppercase hex}",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# SIMPLIFIED ENDPOINTS FOR FRONTEND
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/karma")
async def get_user_karma(user_id: str = Query(None)):
    """
    Get user's karma. Uses authenticated user or query param.
    Returns simplified karma data for frontend display.
    """
    if not user_id:
        user_id = "anonymous"
    
    sanctuary = get_sanctuary()
    status = sanctuary.get_user_status(user_id)
    
    return {
        "karma": status.get("karma", 0),
        "is_solidified": status.get("is_solidified", False),
        "vr_eligible": status.get("vr_eligible", False),
        "threshold": status.get("threshold", 100),
        "progress_percent": min(100, (status.get("karma", 0) / status.get("threshold", 100)) * 100),
    }


@router.get("/deeds")
async def get_user_deeds(user_id: str = Query(None), limit: int = Query(10, ge=1, le=50)):
    """
    Get user's recent deeds.
    Returns list of deeds for display in the frontend.
    """
    if not user_id:
        user_id = "anonymous"
    
    sanctuary = get_sanctuary()
    user_sanctuary = sanctuary.get_sanctuary(user_id)
    
    # Get deeds from user sanctuary
    deeds = user_sanctuary.deed_history[-limit:] if user_sanctuary.deed_history else []
    
    return {
        "deeds": deeds[::-1],  # Most recent first
        "total_karma": user_sanctuary.karma,
        "deed_count": len(user_sanctuary.deed_history),
    }


class SimpleDeedRequest(BaseModel):
    """Simplified deed request from frontend."""
    deed_type: str = Field(..., description="Type of deed")
    description: str = Field(..., max_length=500)
    karma_value: int = Field(default=10, ge=1, le=100)
    date: str = Field(default="", description="Date of deed (ISO format)")


@router.post("/deed-simple")
async def log_deed_simple(request: SimpleDeedRequest, user_id: str = Query(None)):
    """
    Simplified deed logging for frontend.
    Automatically calculates karma based on deed type.
    """
    if not user_id:
        user_id = "anonymous"
    
    sanctuary = get_sanctuary()
    user_sanctuary = sanctuary.get_sanctuary(user_id)
    
    # Map frontend deed types to karma multipliers
    deed_weights = {
        "service": 1.0,
        "creation": 1.5,
        "teaching": 2.0,
        "environmental": 1.2,
        "healing": 2.5,
        "restoration": 3.0,
    }
    
    weight = deed_weights.get(request.deed_type, 1.0)
    base_karma = request.karma_value * weight
    grace_karma = base_karma * sanctuary.grace_multiplier
    karma_earned = int(grace_karma)
    
    # Store the deed
    deed_record = {
        "deed_type": request.deed_type,
        "description": request.description,
        "karma_value": karma_earned,
        "date": request.date or "today",
        "sealed": True,
        "timestamp": time.time(),
    }
    user_sanctuary.deed_history.append(deed_record)
    user_sanctuary.karma += karma_earned
    user_sanctuary.last_deed_at = time.time()
    
    # Check solidification
    if user_sanctuary.karma >= SOLIDIFICATION_THRESHOLD and not user_sanctuary.is_solidified:
        user_sanctuary.is_solidified = True
        sanctuary.total_solidifications += 1
    
    # Update global stats
    sanctuary.total_karma_generated += karma_earned
    
    return {
        "success": True,
        "deed": deed_record,
        "karma_earned": karma_earned,
        "new_total_karma": user_sanctuary.karma,
        "is_solidified": user_sanctuary.is_solidified,
        "grace_multiplier": sanctuary.grace_multiplier,
        "message": f"Deed sealed! +{karma_earned} Karma",
    }

