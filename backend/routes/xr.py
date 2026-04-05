"""
XR SPATIAL API: AR Anchoring, VR Proximity & RPG Harvesting
============================================================

Exposes the XR Spatial Engine for phygital experiences.

Endpoints:
- POST /api/xr/anchor/mint - Mint a new AR anchor from seed
- GET /api/xr/anchor/{seed_id} - Get anchor details
- GET /api/xr/anchors/nearby - Get anchors near coordinates
- POST /api/xr/position - Update user position & get torque field
- GET /api/xr/environment - Get current VR environment
- POST /api/xr/environment - Set VR environment
- GET /api/xr/stats - Get engine statistics
- GET /api/xr/rpg/proximity - Calculate proximity bonus for harvesting
- POST /api/xr/rpg/harvest - Harvest a seed (collect resonance)
- GET /api/xr/rpg/harvestable - Get all harvestable nodes nearby
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
    node_id: Optional[str] = None
    coordinates: Dict[str, float]
    visual_manifest: str
    resonance: float
    white_light_multiplier: float
    radiance: str = "Infinite"
    created_at: float
    source_module: str
    total_approaches: int
    is_harvested: bool = False


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
        node_id=anchor.node_id,
        coordinates=anchor.coordinates,
        visual_manifest=anchor.visual_manifest,
        resonance=anchor.resonance,
        white_light_multiplier=anchor.white_light_multiplier,
        radiance=anchor.radiance,
        created_at=anchor.created_at,
        source_module=anchor.source_module,
        total_approaches=anchor.total_approaches,
        is_harvested=anchor.is_harvested,
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



# ═══════════════════════════════════════════════════════════════════════════════
# RPG HARVESTING ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

class HarvestRequest(BaseModel):
    """Request to harvest a seed."""
    user_id: str = Field(..., description="User identifier")
    node_id: str = Field(..., description="Node ID to harvest")
    lat: float = Field(..., ge=-90, le=90, description="User latitude")
    lon: float = Field(..., ge=-180, le=180, description="User longitude")


class ProximityBonusResponse(BaseModel):
    """Response for proximity bonus calculation."""
    node_id: str
    seed_id: str
    torque: float
    distance_degrees: float
    distance_meters: float
    can_harvest: bool
    is_harvested: bool
    resonance: float
    visual_manifest: str


class HarvestResponse(BaseModel):
    """Response from harvesting a seed."""
    success: bool
    message: str
    node_id: Optional[str] = None
    seed_id: Optional[str] = None
    harvest_bonus: Optional[float] = None
    base_resonance: Optional[float] = None
    radiance: Optional[str] = None
    multiplier: Optional[float] = None
    error: Optional[str] = None


@router.get("/rpg/proximity", response_model=ProximityBonusResponse)
async def get_proximity_bonus(
    node_id: str = Query(..., description="Node ID"),
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    """
    CALCULATE PROXIMITY BONUS for a specific node.
    
    As you walk toward a node, the Spiral Torque increases.
    If within ~11 meters (0.0001 degrees), you can HARVEST.
    
    Use this to show proximity indicators in the AR UI.
    """
    engine = get_xr_engine()
    result = engine.calculate_proximity_bonus(lat, lon, node_id)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return ProximityBonusResponse(**result)


@router.post("/rpg/harvest", response_model=HarvestResponse)
async def harvest_seed(request: HarvestRequest):
    """
    HARVEST A SEED: Walk to it and collect resonance points!
    
    Requirements:
    - Must be within ~11 meters of the node
    - Seed must not already be harvested
    
    Rewards are based on:
    - Base resonance (frequency in Hz)
    - Radiance tier multiplier:
      - Infinite (900+ Hz): 10x
      - Radiant (700-900 Hz): 5x
      - Luminous (400-700 Hz): 2x
      - Dim (0-400 Hz): 1x
    """
    engine = get_xr_engine()
    result = engine.harvest_seed(
        user_id=request.user_id,
        user_lat=request.lat,
        user_lon=request.lon,
        node_id=request.node_id,
    )
    
    return HarvestResponse(
        success=result.get("success", False),
        message=result.get("message", result.get("error", "Unknown error")),
        node_id=result.get("node_id"),
        seed_id=result.get("seed_id"),
        harvest_bonus=result.get("harvest_bonus"),
        base_resonance=result.get("base_resonance"),
        radiance=result.get("radiance"),
        multiplier=result.get("multiplier"),
        error=result.get("error"),
    )


@router.get("/rpg/harvestable")
async def get_harvestable_nodes(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(default=1.0, ge=0.1, le=50),
):
    """
    Get all harvestable nodes near the user's position.
    
    Returns nodes sorted by distance (closest first),
    with proximity torque and harvest eligibility.
    
    Perfect for building a "nearby seeds" radar UI.
    """
    engine = get_xr_engine()
    
    # Convert km to degrees (rough: 1 km ≈ 0.009 degrees)
    radius_degrees = radius_km * 0.009
    
    harvestable = engine.get_harvestable_nodes(lat, lon, radius_degrees)
    
    return {
        "user_position": {"lat": lat, "lon": lon},
        "radius_km": radius_km,
        "nodes": harvestable,
        "total_harvestable": len(harvestable),
        "harvest_threshold_meters": engine.HARVEST_THRESHOLD * 111000,
    }


@router.get("/rpg/leaderboard")
async def get_harvest_leaderboard(limit: int = Query(default=10, ge=1, le=100)):
    """
    Get the top harvesters by total resonance collected.
    
    (Note: This is a placeholder - would need user tracking DB integration)
    """
    engine = get_xr_engine()
    
    # Aggregate by harvested_by
    harvester_totals: Dict[str, float] = {}
    for node in engine.active_ar_nodes:
        if node.is_harvested and node.harvested_by:
            harvester_totals[node.harvested_by] = (
                harvester_totals.get(node.harvested_by, 0) + node.harvest_bonus
            )
    
    # Sort by total
    sorted_harvesters = sorted(
        harvester_totals.items(),
        key=lambda x: x[1],
        reverse=True
    )[:limit]
    
    return {
        "leaderboard": [
            {"user_id": user_id, "total_resonance": total}
            for user_id, total in sorted_harvesters
        ],
        "global_stats": {
            "total_harvests": engine.total_harvests,
            "total_resonance_harvested": engine.total_resonance_harvested,
        }
    }
