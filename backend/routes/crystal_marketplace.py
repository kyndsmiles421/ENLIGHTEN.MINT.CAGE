"""
ENLIGHTEN.MINT.CAFE - V-FINAL CRYSTAL MARKETPLACE API
crystal_marketplace.py

Exposes the Refraction Engine and Sentinel Physics via REST endpoints.
Supports the "Proof of Math" economy.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from utils.refraction_engine import RefractionEngine, refraction_engine
from utils.sentinel_physics_engine import ipc_centrifuge

router = APIRouter(prefix="/crystal", tags=["crystal-marketplace"])


# ═══════════════════════════════════════════════════════════════════════════════
# MINERAL SIGNATURES (BASE TIER)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/minerals")
async def get_mineral_catalog():
    """
    V-FINAL CRYSTAL MARKETPLACE — MINERAL CATALOG
    
    Returns all available mineral signatures with their refraction indices.
    """
    return {
        "version": "V-FINAL",
        "catalog_type": "MINERAL_SIGNATURES",
        "minerals": refraction_engine.get_mineral_catalog(),
        "count": len(RefractionEngine.MINERAL_SIGNATURES),
    }


@router.get("/minerals/{mineral_id}")
async def get_mineral_details(mineral_id: str):
    """
    V-FINAL CRYSTAL MARKETPLACE — MINERAL DETAILS
    
    Get full details of a specific mineral signature.
    """
    mineral = RefractionEngine.MINERAL_SIGNATURES.get(mineral_id.upper())
    if not mineral:
        raise HTTPException(404, f"Unknown mineral: {mineral_id}")
    
    return {
        "id": mineral_id.upper(),
        **mineral,
    }


@router.post("/minerals/purchase")
async def purchase_mineral(
    mineral_id: str = Query(..., description="Mineral ID to purchase"),
    user_id: str = Query(default="default_user"),
    wallet_dust: int = Query(default=1000, description="User's Dust balance"),
):
    """
    V-FINAL CRYSTAL MARKETPLACE — PURCHASE MINERAL
    
    Purchase a mineral signature using Dust currency.
    """
    result = refraction_engine.purchase_mineral(user_id, mineral_id.upper(), wallet_dust)
    
    if result["status"] == "error":
        raise HTTPException(400, result["message"])
    
    return result


@router.post("/minerals/equip")
async def equip_mineral(
    mineral_id: str = Query(..., description="Mineral ID to equip"),
    user_id: str = Query(default="default_user"),
):
    """
    V-FINAL CRYSTAL MARKETPLACE — EQUIP MINERAL
    
    Set a mineral as the active crystal overlay.
    """
    result = refraction_engine.set_active_mineral(user_id, mineral_id.upper())
    
    if result["status"] == "error":
        raise HTTPException(400, result["message"])
    
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# MATH REFRACTIONS (PREMIUM TIER)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/math")
async def get_math_catalog():
    """
    V-FINAL CRYSTAL MARKETPLACE — MATH REFRACTION CATALOG
    
    Returns all available L² Fractal Engine scripts.
    These are the PREMIUM mathematical lenses.
    """
    return {
        "version": "V-FINAL",
        "catalog_type": "MATH_REFRACTIONS",
        "description": "Proof of Math: Buy the rights to see UI through specific mathematical lenses",
        "refractions": refraction_engine.get_math_catalog(),
        "count": len(RefractionEngine.MATH_REFRACTIONS),
    }


@router.get("/math/{math_id}")
async def get_math_details(math_id: str):
    """
    V-FINAL CRYSTAL MARKETPLACE — MATH REFRACTION DETAILS
    
    Get full details of a specific math refraction (excluding shader code).
    """
    refraction = RefractionEngine.MATH_REFRACTIONS.get(math_id.upper())
    if not refraction:
        raise HTTPException(404, f"Unknown refraction: {math_id}")
    
    return {
        "id": math_id.upper(),
        **{k: v for k, v in refraction.items() if k != "shader_injection"},
    }


@router.post("/math/license")
async def license_math_refraction(
    math_id: str = Query(..., description="Math refraction ID to license"),
    user_id: str = Query(default="default_user"),
    wallet_gems: int = Query(default=100, description="User's Gems balance"),
    user_tier: int = Query(default=0, ge=0, le=3, description="User's tier level"),
):
    """
    V-FINAL CRYSTAL MARKETPLACE — LICENSE MATH REFRACTION
    
    Purchase a math refraction license using Gems currency.
    Requires appropriate tier level.
    """
    result = refraction_engine.purchase_math_refraction(
        user_id, math_id.upper(), wallet_gems, user_tier
    )
    
    if result["status"] == "error":
        raise HTTPException(400, result["message"])
    
    return result


@router.post("/math/activate")
async def activate_math_refraction(
    math_id: Optional[str] = Query(None, description="Math ID to activate (None to disable)"),
    user_id: str = Query(default="default_user"),
):
    """
    V-FINAL CRYSTAL MARKETPLACE — ACTIVATE MATH REFRACTION
    
    Set a math refraction as the active layer. Pass None to disable.
    """
    result = refraction_engine.set_active_math(
        user_id, math_id.upper() if math_id else None
    )
    
    if result["status"] == "error":
        raise HTTPException(400, result["message"])
    
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# USER LICENSES & SHADER INJECTION
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/licenses")
async def get_user_licenses(user_id: str = Query(default="default_user")):
    """
    V-FINAL CRYSTAL MARKETPLACE — USER LICENSES
    
    Get all owned minerals and math refractions for a user.
    """
    return refraction_engine.get_user_licenses(user_id)


@router.get("/shader")
async def get_shader_injection(user_id: str = Query(default="default_user")):
    """
    V-FINAL CRYSTAL MARKETPLACE — SHADER INJECTION
    
    Get the complete GLSL shader code for the user's active configuration.
    This is what gets injected into Three.js.
    """
    return refraction_engine.get_shader_injection(user_id)


@router.get("/dispersion")
async def calculate_prismatic_dispersion(
    mineral_id: str = Query(default="CLEAR_QUARTZ"),
    node_lat: float = Query(default=44.0805, description="Node latitude"),
    node_lng: float = Query(default=-103.231, description="Node longitude"),
):
    """
    V-FINAL CRYSTAL MARKETPLACE — PRISMATIC DISPERSION
    
    Calculate how light disperses based on mineral and node location.
    Shows wavelength calculations and rainbow spread.
    """
    return refraction_engine.calculate_prismatic_dispersion(
        mineral_id.upper(), node_lat, node_lng
    )


# ═══════════════════════════════════════════════════════════════════════════════
# SENTINEL PHYSICS ENGINE (IPC)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/physics/status")
async def get_centrifuge_status():
    """
    V-FINAL SENTINEL PHYSICS — CENTRIFUGE STATUS
    
    Returns the complete status of the Inverse Pressure Centrifuge.
    """
    return ipc_centrifuge.get_full_status()


@router.post("/physics/inject")
async def inject_inverse_pressure(
    system_load: float = Query(..., ge=0, le=100, description="System load percentage"),
):
    """
    V-FINAL SENTINEL PHYSICS — INVERSE PRESSURE INJECTION
    
    Inject opposite pressure to stabilize the LOX loop.
    Uses Steven Michael's Inverse Math (φ / π formula).
    """
    return ipc_centrifuge.calculate_inverse_injection(system_load)


@router.post("/physics/rotation")
async def set_centrifuge_rotation(
    rpm: float = Query(..., ge=0, le=50000, description="Rotation speed in RPM"),
):
    """
    V-FINAL SENTINEL PHYSICS — SET ROTATION
    
    Set the centrifuge rotation speed.
    Higher RPM increases magnetic reutilization effect.
    """
    return ipc_centrifuge.set_rotation_speed(rpm)


@router.get("/physics/visuals")
async def get_core_visuals():
    """
    V-FINAL SENTINEL PHYSICS — CORE VISUALS
    
    Get the live telemetry-driven visual mapping from the Opalized Core.
    Colors represent real-time magnetic flux and system state.
    """
    return ipc_centrifuge.get_core_visuals()


@router.get("/physics/stability")
async def get_fractal_stability(
    depth: int = Query(default=54, ge=1, le=144, description="Fractal recursion depth"),
):
    """
    V-FINAL SENTINEL PHYSICS — FRACTAL STABILITY
    
    Calculate the Zero Point stability using L² Fractal recursion.
    """
    return ipc_centrifuge.calculate_fractal_stability(depth)


@router.get("/physics/telemetry")
async def get_telemetry_history(
    limit: int = Query(default=100, ge=1, le=1000),
):
    """
    V-FINAL SENTINEL PHYSICS — TELEMETRY HISTORY
    
    Get recent pressure injection and stability readings.
    """
    return {
        "history": ipc_centrifuge.get_telemetry_history(limit),
        "total_readings": len(ipc_centrifuge._telemetry_history),
    }
