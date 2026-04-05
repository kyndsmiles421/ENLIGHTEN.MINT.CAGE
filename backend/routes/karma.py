"""
KARMA API: Crystalline Vault & Deed Logging Routes
====================================================

Exposes the karma system for spiritual progression and VR unlocks.

Endpoints:
- GET /api/karma/status - Get user's karma status and crystal state
- POST /api/karma/deed - Log a good deed and earn karma
- GET /api/karma/history - Get deed history
- GET /api/karma/vr-modes - Get unlocked VR modes
- GET /api/karma/leaderboard - Top karma earners
- GET /api/karma/deed-types - Available deed types and impacts
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from engines.crystalline_vault import (
    CrystallineVault,
    KarmaManager,
    DeedType,
    VRMode,
    DEED_IMPACT_SCORES,
    VR_UNLOCK_THRESHOLDS,
    get_karma_manager,
)
from deps import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/karma", tags=["Karma & Crystalline Vault"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class DeedRequest(BaseModel):
    """Request to log a good deed."""
    user_id: str = Field(..., description="User identifier")
    deed_type: str = Field(..., description="Type of deed performed")
    description: str = Field(default="", description="What was done")
    hours_spent: float = Field(default=1.0, gt=0, le=24, description="Hours spent")
    impact_multiplier: float = Field(default=1.0, ge=0.5, le=5.0, description="Impact multiplier")
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Location latitude")
    lon: Optional[float] = Field(None, ge=-180, le=180, description="Location longitude")
    witnesses: Optional[List[str]] = Field(None, description="Witness user IDs")


class DeedResponse(BaseModel):
    """Response from logging a deed."""
    success: bool
    deed_type: Optional[str] = None
    karma_earned: Optional[float] = None
    old_karma: Optional[float] = None
    new_karma: Optional[float] = None
    crystal_state: Optional[str] = None
    resonance: Optional[float] = None
    status: Optional[str] = None
    message: Optional[str] = None
    access_key: Optional[str] = None
    newly_unlocked: Optional[List[str]] = None
    points_needed: Optional[float] = None
    error: Optional[str] = None


class KarmaStatusResponse(BaseModel):
    """User's karma vault status."""
    user_id: str
    karma_points: float
    crystal_state: str
    resonance: float
    sovereign_key: str
    unlocked_vr_modes: List[str]
    total_deeds: int
    next_unlock: Optional[str]
    points_to_next: float


# ═══════════════════════════════════════════════════════════════════════════════
# STATUS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/status/{user_id}", response_model=KarmaStatusResponse)
async def get_karma_status(user_id: str):
    """
    Get a user's karma vault status.
    
    Returns:
    - Current karma points
    - Crystal solidification state (forming/dim/luminous/radiant/infinite)
    - Resonance frequency
    - Sovereign key (72-bit access token)
    - Unlocked VR modes
    - Progress to next unlock
    """
    manager = get_karma_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    status = vault.get_status()
    
    return KarmaStatusResponse(**status)


@router.get("/vr-modes/{user_id}")
async def get_unlocked_vr_modes(user_id: str):
    """
    Get user's unlocked VR sanctuary modes.
    
    Modes are unlocked based on karma thresholds:
    - Void_Meditation: 0 karma (default)
    - Breathing_Chamber: 1,000 karma
    - Sanctuary_Garden: 2,500 karma
    - Celestial_Dome: 5,000 karma (VR Gateway)
    - Crystal_Cave: 7,500 karma
    - Infinite_Library: 10,000 karma
    - Tesseract_Core: 15,000 karma
    """
    manager = get_karma_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    
    # Get all modes with unlock status
    all_modes = []
    for mode, threshold in sorted(VR_UNLOCK_THRESHOLDS.items(), key=lambda x: x[1]):
        all_modes.append({
            "mode": mode.value,
            "threshold": threshold,
            "unlocked": mode.value in vault.unlocked_vr_modes,
            "karma_needed": max(0, threshold - vault.karma_points),
        })
    
    return {
        "user_id": user_id,
        "karma_points": vault.karma_points,
        "unlocked_modes": vault.unlocked_vr_modes,
        "all_modes": all_modes,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# DEED LOGGING
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/deed", response_model=DeedResponse)
async def log_good_deed(request: DeedRequest):
    """
    LOG A GOOD DEED: Earn karma and solidify your crystal.
    
    Karma formula: base_impact × hours_spent × multiplier × 100
    
    Base impacts by deed type:
    - manual_labor: 5.0 (physical service)
    - community_service: 4.0 (helping others)
    - healing_service: 4.5 (healthcare/wellness)
    - environmental: 3.5 (nature restoration)
    - mentoring: 3.0 (teaching/guiding)
    - creative_offering: 2.5 (art/music for healing)
    - donation: 2.0 (financial giving)
    - meditation: 1.0 (self-cultivation)
    
    Example: 2 hours of community_service = 4.0 × 2 × 1.0 × 100 = 800 karma
    
    At 5,000 karma, the VR Gateway opens and you receive your Sovereign Key.
    """
    manager = get_karma_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(request.user_id)
    
    # Build location dict if provided
    location = None
    if request.lat is not None and request.lon is not None:
        location = {"lat": request.lat, "lon": request.lon}
    
    result = vault.log_good_deed(
        deed_type=request.deed_type,
        description=request.description,
        hours_spent=request.hours_spent,
        impact_multiplier=request.impact_multiplier,
        location=location,
        witnesses=request.witnesses,
    )
    
    if result.get("success"):
        # Save to DB
        await manager.save_vault(vault)
    
    return DeedResponse(
        success=result.get("success", False),
        deed_type=result.get("deed_type"),
        karma_earned=result.get("karma_earned"),
        old_karma=result.get("old_karma"),
        new_karma=result.get("new_karma"),
        crystal_state=result.get("crystal_state"),
        resonance=result.get("resonance"),
        status=result.get("status"),
        message=result.get("message"),
        access_key=result.get("access_key"),
        newly_unlocked=result.get("newly_unlocked"),
        points_needed=result.get("points_needed"),
        error=result.get("error"),
    )


@router.get("/history/{user_id}")
async def get_deed_history(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
):
    """
    Get a user's good deed history.
    
    Returns recent deeds with karma earned, type, and description.
    """
    manager = get_karma_manager()
    manager.set_db(db)
    
    vault = await manager.get_vault(user_id)
    history = vault.get_deed_history(limit)
    
    return {
        "user_id": user_id,
        "history": history,
        "total_deeds": vault.total_deeds,
        "total_karma": vault.karma_points,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# REFERENCE DATA
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/deed-types")
async def get_deed_types():
    """
    Get available deed types and their base impact scores.
    
    Use these when logging deeds to ensure valid types.
    """
    return {
        "deed_types": [
            {
                "type": deed.value,
                "base_impact": score,
                "description": {
                    "manual_labor": "Physical service work (construction, repair, cleanup)",
                    "community_service": "Helping others directly (volunteering, assistance)",
                    "healing_service": "Healthcare and wellness work",
                    "environmental": "Nature restoration and cleanup",
                    "mentoring": "Teaching, guiding, and coaching",
                    "creative_offering": "Art, music, or creative work for healing",
                    "donation": "Financial contributions to causes",
                    "meditation": "Self-cultivation and spiritual practice",
                }.get(deed.value, ""),
                "example_karma": f"{score * 2 * 100:.0f} karma for 2 hours",
            }
            for deed, score in DEED_IMPACT_SCORES.items()
        ],
        "formula": "base_impact × hours_spent × multiplier × 100",
    }


@router.get("/thresholds")
async def get_karma_thresholds():
    """
    Get karma thresholds for crystal states and VR unlocks.
    """
    return {
        "crystal_states": {
            "forming": {"min": 0, "max": 999, "resonance": 111.0},
            "dim": {"min": 1000, "max": 2499, "resonance": 432.0},
            "luminous": {"min": 2500, "max": 4999, "resonance": 528.0},
            "radiant": {"min": 5000, "max": 9999, "resonance": 852.0, "note": "VR Gateway opens"},
            "infinite": {"min": 10000, "max": None, "resonance": 963.0},
        },
        "vr_modes": {
            mode.value: threshold
            for mode, threshold in sorted(VR_UNLOCK_THRESHOLDS.items(), key=lambda x: x[1])
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# LEADERBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/leaderboard")
async def get_karma_leaderboard(limit: int = Query(default=10, ge=1, le=100)):
    """
    Get the karma leaderboard.
    
    Shows top users by karma with their crystal state and VR unlocks.
    """
    manager = get_karma_manager()
    manager.set_db(db)
    
    leaderboard = await manager.get_karma_leaderboard(limit)
    
    return {
        "leaderboard": leaderboard,
        "returned": len(leaderboard),
    }
