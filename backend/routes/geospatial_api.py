"""
ENLIGHTEN.MINT.CAFE - GEOSPATIAL WELLNESS ZONES API
geospatial_api.py

API Endpoints for GPS-based Wellness Zones and WebXR AR Portal triggers.

ROUTES:
- GET  /api/wellness-zones              - Get all Wellness Zones
- GET  /api/wellness-zones/{zone_id}    - Get specific zone details
- POST /api/wellness-zones/proximity    - Check proximity to all zones
- GET  /api/wellness-zones/{zone_id}/ar - Get WebXR AR config for a zone
- POST /api/wellness-zones/{zone_id}/enter - Record zone entry
- POST /api/wellness-zones/navigate     - Get navigation guidance to a zone
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from deps import logger, get_current_user
from datetime import datetime, timezone
from typing import Optional

from utils.geospatial_nexus import geospatial_nexus


router = APIRouter()


@router.get("/wellness-zones")
async def get_all_zones():
    """
    Get all Wellness Zones configuration.
    
    Returns:
        All 3 Sacred Nodes with coordinates, utilities, and geofence config.
    """
    try:
        zones = geospatial_nexus.get_all_zones()
        return {
            "status": "success",
            "data": zones,
        }
    except Exception as e:
        logger.error(f"GEOSPATIAL_API: Get zones failed | Error: {str(e)}")
        raise HTTPException(500, f"Failed to get wellness zones: {str(e)}")


@router.get("/wellness-zones/{zone_id}")
async def get_zone_details(zone_id: str):
    """
    Get detailed information about a specific Wellness Zone.
    
    Path Params:
        zone_id: One of 'keystone_gateway', 'rapid_city_central', 'black_elk_sanctuary'
    
    Returns:
        Zone details including AR asset config and shader params.
    """
    try:
        zone = geospatial_nexus.get_zone_details(zone_id)
        if not zone:
            raise HTTPException(404, f"Zone '{zone_id}' not found")
        
        return {
            "status": "success",
            "zone": zone,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GEOSPATIAL_API: Get zone details failed | Zone: {zone_id} | Error: {str(e)}")
        raise HTTPException(500, f"Failed to get zone details: {str(e)}")


@router.post("/wellness-zones/proximity")
async def check_proximity(data: dict = Body(...)):
    """
    Check user proximity to all Wellness Zones.
    
    Request Body:
        lat: float - User's latitude
        lon: float - User's longitude
    
    Returns:
        Proximity data for all zones, AR trigger status, and nearest zone.
    """
    lat = data.get("lat")
    lon = data.get("lon")
    
    if lat is None or lon is None:
        raise HTTPException(400, "Both 'lat' and 'lon' are required")
    
    try:
        lat = float(lat)
        lon = float(lon)
    except (TypeError, ValueError):
        raise HTTPException(400, "Invalid coordinate format")
    
    # Validate coordinate ranges
    if not (-90 <= lat <= 90):
        raise HTTPException(400, "Latitude must be between -90 and 90")
    if not (-180 <= lon <= 180):
        raise HTTPException(400, "Longitude must be between -180 and 180")
    
    try:
        proximity = geospatial_nexus.check_zone_proximity(lat, lon)
        return {
            "status": "success",
            "proximity": proximity,
        }
    except Exception as e:
        logger.error(f"GEOSPATIAL_API: Proximity check failed | Error: {str(e)}")
        raise HTTPException(500, f"Proximity check failed: {str(e)}")


@router.get("/wellness-zones/{zone_id}/ar")
async def get_ar_config(zone_id: str):
    """
    Get WebXR AR Portal configuration for a specific zone.
    
    Returns:
        Complete AR config including WebXR session settings, shader uniforms,
        asset config, haptic patterns, and audio frequencies.
    """
    try:
        config = geospatial_nexus.get_ar_config(zone_id)
        if "error" in config:
            raise HTTPException(404, config["error"])
        
        return {
            "status": "success",
            "ar_config": config,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GEOSPATIAL_API: Get AR config failed | Zone: {zone_id} | Error: {str(e)}")
        raise HTTPException(500, f"Failed to get AR config: {str(e)}")


@router.post("/wellness-zones/{zone_id}/enter")
async def record_zone_entry(
    zone_id: str,
    data: dict = Body(default={}),
    user=Depends(get_current_user)
):
    """
    Record a user entering a Wellness Zone (for analytics).
    
    Requires authentication.
    
    Path Params:
        zone_id: The zone being entered
    
    Request Body (optional):
        entry_type: Type of entry ('ar_session', 'proximity', 'manual')
    """
    entry_type = data.get("entry_type", "ar_session")
    
    try:
        result = geospatial_nexus.record_zone_entry(
            user_id=user["id"],
            zone_id=zone_id,
            entry_type=entry_type
        )
        
        if "error" in result:
            raise HTTPException(404, result["error"])
        
        return {
            "status": "success",
            "entry": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GEOSPATIAL_API: Record entry failed | Zone: {zone_id} | Error: {str(e)}")
        raise HTTPException(500, f"Failed to record zone entry: {str(e)}")


@router.post("/wellness-zones/navigate")
async def get_navigation_guidance(data: dict = Body(...)):
    """
    Get navigation guidance from user position to a target zone.
    
    Request Body:
        lat: float - User's current latitude
        lon: float - User's current longitude
        target_zone: str - Target zone ID
    
    Returns:
        Distance, bearing, cardinal direction, and ETA to target zone.
    """
    lat = data.get("lat")
    lon = data.get("lon")
    target_zone = data.get("target_zone")
    
    if lat is None or lon is None:
        raise HTTPException(400, "Both 'lat' and 'lon' are required")
    if not target_zone:
        raise HTTPException(400, "'target_zone' is required")
    
    try:
        lat = float(lat)
        lon = float(lon)
    except (TypeError, ValueError):
        raise HTTPException(400, "Invalid coordinate format")
    
    try:
        guidance = geospatial_nexus.get_navigation_guidance(lat, lon, target_zone)
        
        if "error" in guidance:
            raise HTTPException(404, guidance["error"])
        
        return {
            "status": "success",
            "navigation": guidance,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GEOSPATIAL_API: Navigation guidance failed | Error: {str(e)}")
        raise HTTPException(500, f"Navigation guidance failed: {str(e)}")


@router.get("/wellness-zones/constants")
async def get_geospatial_constants():
    """
    Get geospatial constants and geofence configuration.
    """
    return {
        "status": "success",
        "constants": {
            "earth_radius_m": geospatial_nexus.EARTH_RADIUS_M,
            "inner_core_radius_m": geospatial_nexus.INNER_CORE_RADIUS,
            "resonance_radius_m": geospatial_nexus.RESONANCE_RADIUS,
            "awareness_radius_m": geospatial_nexus.AWARENESS_RADIUS,
        },
        "zone_types": ["GATEWAY", "ADVOCACY", "RESONANCE"],
        "ar_features": ["hit-test", "plane-detection", "dom-overlay", "light-estimation"],
    }
