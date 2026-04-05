"""
XR SPATIAL API: AR Anchoring & VR Proximity Routes
====================================================

Exposes the XR Spatial Engine for phygital experiences.

Endpoints:
- POST /api/xr/anchor/mint - Mint a new AR anchor from seed
- GET /api/xr/anchor/{seed_id} - Get anchor details
- GET /api/xr/anchors/nearby - Get anchors near coordinates
- POST /api/xr/position - Update user position & get torque field
- GET /api/xr/environment - Get current VR environment
- POST /api/xr/environment - Set VR environment
- GET /api/xr/stats - Get engine statistics
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from engines.xr_spatial import (
    XRSpatialEngine,
    ARNode,
    VREnvironment,
    get_xr_engine,
)
from engines.central_crystal import get_crystal

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/xr", tags=["XR Spatial"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class MintAnchorRequest(BaseModel):
    """Request to mint a new AR anchor."""
    seed_hash: str = Field(..., description="72-bit seed hash from Crystal")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    resonance: float = Field(default=963.0, ge=0, le=1000, description="Frequency in Hz")
    source_module: str = Field(default="Tesseract", description="Source module name")


class AnchorResponse(BaseModel):
    """Response containing AR anchor data."""
    id: str
    coordinates: Dict[str, float]
    visual_manifest: str
    resonance: float
    white_light_multiplier: float
    created_at: float
    source_module: str
    total_approaches: int


class PositionUpdateRequest(BaseModel):
    """Request to update user position."""
    user_id: str = Field(..., description="User identifier")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")


class FieldVectorResponse(BaseModel):
    """Torque field vector for a single node."""
    node_id: str
    torque: float
    direction: Dict[str, float]
    distance: float


class TorqueFieldResponse(BaseModel):
    """Response containing torque field data."""
    user_id: str
    position: Dict[str, float]
    total_torque: float
    dominant_node: Optional[Dict[str, Any]]
    field_vectors: List[FieldVectorResponse]
    node_count: int
    vr_environment: str


class EnvironmentRequest(BaseModel):
    """Request to change VR environment."""
    environment: str = Field(..., description="VR environment name")


# ═══════════════════════════════════════════════════════════════════════════════
# AR ANCHOR ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/anchor/mint", response_model=AnchorResponse)
async def mint_ar_anchor(request: MintAnchorRequest):
    """
    MINT PHYSICAL ANCHOR: Plant a seed in the real world.
    
    Takes a 72-bit seed hash from a Crystal transition and
    creates a visible 3D AR anchor at the specified GPS coordinates.
    
    The visual manifest is automatically determined by the resonance:
    - 900+ Hz: Crystalline Tesseract
    - 800-900 Hz: Oracle Sphere
    - 700-800 Hz: Tarot Card
    - 400-700 Hz: Sanctuary Portal
    - 0-400 Hz: Void Singularity
    """
    engine = get_xr_engine()
    
    # Check if anchor already exists
    existing = engine.get_ar_anchor(request.seed_hash)
    if existing:
        logger.warning(f"[XR] Anchor {request.seed_hash[:12]}... already exists")
        return AnchorResponse(
            id=existing.id,
            coordinates=existing.coordinates,
            visual_manifest=existing.visual_manifest,
            resonance=existing.resonance,
            white_light_multiplier=existing.white_light_multiplier,
            created_at=existing.created_at,
            source_module=existing.source_module,
            total_approaches=existing.total_approaches,
        )
    
    # Mint new anchor
    anchor = engine.generate_ar_anchor(
        seed_hash=request.seed_hash,
        lat=request.lat,
        lon=request.lon,
        resonance=request.resonance,
        source_module=request.source_module,
    )
    
    return AnchorResponse(
        id=anchor.id,
        coordinates=anchor.coordinates,
        visual_manifest=anchor.visual_manifest,
        resonance=anchor.resonance,
        white_light_multiplier=anchor.white_light_multiplier,
        created_at=anchor.created_at,
        source_module=anchor.source_module,
        total_approaches=anchor.total_approaches,
    )


@router.post("/anchor/mint-from-crystal")
async def mint_from_crystal(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    """
    MINT FROM CRYSTAL: Create anchor from current Crystal state.
    
    Uses the last transition's 72-bit seed and current frequency
    to mint an AR anchor at the specified coordinates.
    """
    engine = get_xr_engine()
    crystal = get_crystal()
    
    # Get latest seed from Crystal history
    history = crystal.get_history(1)
    if not history:
        raise HTTPException(
            status_code=400,
            detail="No Crystal transitions available. Pulse to a source first."
        )
    
    latest = history[0]
    seed_hash = latest.get("seed")
    
    if not seed_hash:
        raise HTTPException(
            status_code=400,
            detail="Latest transition has no seed. Try pulsing again."
        )
    
    # Mint anchor
    anchor = engine.generate_ar_anchor(
        seed_hash=seed_hash,
        lat=lat,
        lon=lon,
        resonance=crystal.current_frequency,
        source_module=crystal.active_module,
    )
    
    return {
        "success": True,
        "message": f"Anchor minted from {crystal.active_module}",
        "anchor": anchor.to_dict(),
    }


@router.get("/anchor/{seed_id}")
async def get_anchor(seed_id: str):
    """Get details of a specific AR anchor by seed ID."""
    engine = get_xr_engine()
    anchor = engine.get_ar_anchor(seed_id)
    
    if not anchor:
        raise HTTPException(status_code=404, detail="Anchor not found")
    
    return anchor.to_dict()


@router.get("/anchors/nearby", response_model=List[AnchorResponse])
async def get_nearby_anchors(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(default=1.0, ge=0.1, le=100),
):
    """
    Get all AR anchors within a radius of coordinates.
    
    Perfect for AR apps to discover nearby seeds when a user
    opens the cosmic map.
    """
    engine = get_xr_engine()
    nearby = engine.get_anchors_in_radius(lat, lon, radius_km)
    
    return [
        AnchorResponse(
            id=node.id,
            coordinates=node.coordinates,
            visual_manifest=node.visual_manifest,
            resonance=node.resonance,
            white_light_multiplier=node.white_light_multiplier,
            created_at=node.created_at,
            source_module=node.source_module,
            total_approaches=node.total_approaches,
        )
        for node in nearby
    ]


@router.get("/anchors/all")
async def get_all_anchors(
    limit: int = Query(default=100, ge=1, le=1000),
):
    """Get all AR anchors (paginated)."""
    engine = get_xr_engine()
    anchors = engine.active_ar_nodes[:limit]
    
    return {
        "anchors": [node.to_dict() for node in anchors],
        "total": len(engine.active_ar_nodes),
        "returned": len(anchors),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# VR PROXIMITY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/position", response_model=TorqueFieldResponse)
async def update_position(request: PositionUpdateRequest):
    """
    UPDATE USER POSITION: Calculate torque field.
    
    Reports the user's GPS position and returns the combined
    gravitational pull from all nearby AR anchors.
    
    As the user approaches a seed:
    - Torque increases (1 / distance)
    - Visual intensity should increase
    - Haptic feedback should intensify
    """
    engine = get_xr_engine()
    result = engine.update_user_position(
        user_id=request.user_id,
        lat=request.lat,
        lon=request.lon,
    )
    
    field = result["field"]
    
    return TorqueFieldResponse(
        user_id=result["user_id"],
        position=result["position"],
        total_torque=field["total_torque"],
        dominant_node=field["dominant_node"],
        field_vectors=[
            FieldVectorResponse(**v) for v in field["field_vectors"]
        ],
        node_count=field["node_count"],
        vr_environment=result["vr_environment"],
    )


@router.get("/proximity")
async def calculate_proximity(
    user_lat: float = Query(..., ge=-90, le=90),
    user_lon: float = Query(..., ge=-180, le=180),
    node_lat: float = Query(..., ge=-90, le=90),
    node_lon: float = Query(..., ge=-180, le=180),
):
    """
    Calculate VR proximity torque between user and a single node.
    
    Returns the gravitational pull strength for direct calculations.
    """
    engine = get_xr_engine()
    torque = engine.calculate_vr_proximity(
        user_pos=(user_lat, user_lon),
        node_pos=(node_lat, node_lon),
    )
    
    return {
        "user_position": {"lat": user_lat, "lon": user_lon},
        "node_position": {"lat": node_lat, "lon": node_lon},
        "torque": torque,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# VR ENVIRONMENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/environment")
async def get_environment():
    """Get current VR environment state."""
    engine = get_xr_engine()
    return {
        "current": engine.get_vr_environment(),
        "available": engine.get_available_environments(),
    }


@router.post("/environment")
async def set_environment(request: EnvironmentRequest):
    """Set the VR environment state."""
    engine = get_xr_engine()
    success = engine.set_vr_environment(request.environment)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown environment: {request.environment}. "
                   f"Available: {engine.get_available_environments()}"
        )
    
    return {
        "success": True,
        "environment": engine.get_vr_environment(),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# STATISTICS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/stats")
async def get_stats():
    """Get XR engine statistics."""
    engine = get_xr_engine()
    return engine.get_stats()
