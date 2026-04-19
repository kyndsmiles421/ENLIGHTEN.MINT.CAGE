"""
═══════════════════════════════════════════════════════════════════════════════
📍 GEOSPATIAL_NEXUS: THE WELLNESS ZONE ENGINE
═══════════════════════════════════════════════════════════════════════════════
🛰️ SIGNAL: GPS + GLONASS | 💎 SYNC: SOVEREIGN_MAIN_BRAIN
🛡️ RADIUS: 50m GEOFENCE | 🌀 STATE: SUPERCONDUCTING
═══════════════════════════════════════════════════════════════════════════════

This module manages the GPS-based Wellness Zones that trigger the WebXR AR Portal
based on user proximity to the Three Sacred Nodes of the Black Hills.

THE THREE NODES:
┌─────────────────────────────────────────────────────────────────────────────┐
│  NODE 1: KEYSTONE GATEWAY (43.8955°N, 103.4182°W)                          │
│  └─ Type: GATEWAY | Utility: Public Portal with Multi-Language QR Crystal  │
│                                                                             │
│  NODE 2: RAPID CITY CENTRAL (44.0831°N, 103.2244°W)                        │
│  └─ Type: ADVOCACY | Utility: Legislative Sync & Volunteer Hub (10 credits/hr)    │
│                                                                             │
│  NODE 3: BLACK ELK SANCTUARY (43.8661°N, 103.5314°W)                       │
│  └─ Type: RESONANCE | Utility: Deep LOx-cooled Superconducting Sessions    │
└─────────────────────────────────────────────────────────────────────────────┘

GEOFENCE RADII:
- Inner Core: 10m (Maximum resonance, haptic pulse active)
- Resonance Field: 50m (AR Portal trigger zone)
- Awareness Zone: 500m (Notification zone, approach guidance)
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from deps import logger

# Import Main Brain for synchronization
from utils.sovereign_main_brain import main_brain


class GeospatialNexus:
    """
    📍 GEOSPATIAL NEXUS: GPS-Aware Wellness Zone Engine
    
    Manages the Three Sacred Nodes and triggers WebXR AR Portal
    based on user proximity calculations using Haversine formula.
    """
    
    # ═══════════════════════════════════════════════════════════════════════════
    # SACRED CONSTANTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    EARTH_RADIUS_KM = 6371.0  # Earth's radius in kilometers
    EARTH_RADIUS_M = 6371000.0  # Earth's radius in meters
    
    # Geofence radii (meters)
    INNER_CORE_RADIUS = 10.0   # Maximum resonance zone
    RESONANCE_RADIUS = 50.0    # AR Portal trigger zone
    AWARENESS_RADIUS = 500.0   # Notification/guidance zone
    
    # The Three Sacred Nodes of the Black Hills
    WELLNESS_ZONES = {
        "keystone_gateway": {
            "name": "Keystone Gateway",
            "lat": 43.8955,
            "lon": -103.4182,
            "type": "GATEWAY",
            "utility": "Public Portal: Multi-Language QR Crystal",
            "description": "Welcomes the community with the Universal Welcome QR codes",
            "ar_asset": "sovereign_prism_gateway",
            "haptic_pattern": [100, 50, 100],  # Welcome pulse
            "resonance_frequency": 528.0,  # Hz - Love frequency
        },
        "rapid_city_central": {
            "name": "Rapid City Central",
            "lat": 44.0831,
            "lon": -103.2244,
            "type": "ADVOCACY",
            "utility": "Advocacy Hub: Legislative & Volunteer Sync",
            "description": "Memorial Park/Main St Square for community engagement",
            "ar_asset": "sovereign_prism_advocacy",
            "haptic_pattern": [200, 100, 200, 100, 200],  # Active pulse
            "resonance_frequency": 639.0,  # Hz - Connection frequency
        },
        "black_elk_sanctuary": {
            "name": "Black Elk Sanctuary",
            "lat": 43.8661,
            "lon": -103.5314,
            "type": "RESONANCE",
            "utility": "Deep Resonance: LOx-cooled Superconducting Sessions",
            "description": "Highest point for silent, deep meditation protocols",
            "ar_asset": "sovereign_prism_deep",
            "haptic_pattern": [500],  # Deep, sustained pulse
            "resonance_frequency": 432.0,  # Hz - Universal frequency
        },
    }
    
    def __init__(self):
        """Initialize the Geospatial Nexus with all zone configurations."""
        self.active_sessions = {}
        self.zone_visit_counts = {zone_id: 0 for zone_id in self.WELLNESS_ZONES}
        self.last_proximity_check = None
        
        logger.info("📍 GEOSPATIAL_NEXUS: Wellness Zone Engine initialized")
        logger.info(f"   Zones: {len(self.WELLNESS_ZONES)} | Resonance Radius: {self.RESONANCE_RADIUS}m")
    
    def haversine_distance(
        self, 
        lat1: float, 
        lon1: float, 
        lat2: float, 
        lon2: float
    ) -> float:
        """
        Calculate the great-circle distance between two points using Haversine formula.
        
        Args:
            lat1, lon1: First coordinate (user position)
            lat2, lon2: Second coordinate (zone center)
            
        Returns:
            Distance in meters
        """
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        # Haversine formula
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return self.EARTH_RADIUS_M * c
    
    def check_zone_proximity(
        self, 
        user_lat: float, 
        user_lon: float
    ) -> Dict[str, Any]:
        """
        Check user proximity to all Wellness Zones.
        
        Args:
            user_lat: User's latitude
            user_lon: User's longitude
            
        Returns:
            Proximity data for all zones with trigger status
        """
        self.last_proximity_check = datetime.now(timezone.utc).isoformat()
        
        results = {
            "timestamp": self.last_proximity_check,
            "user_position": {"lat": user_lat, "lon": user_lon},
            "zones": [],
            "nearest_zone": None,
            "ar_trigger": None,
            "in_resonance_field": False,
            "in_inner_core": False,
        }
        
        nearest_distance = float('inf')
        
        for zone_id, zone_data in self.WELLNESS_ZONES.items():
            distance = self.haversine_distance(
                user_lat, user_lon,
                zone_data["lat"], zone_data["lon"]
            )
            
            # Determine proximity level
            proximity_level = "OUT_OF_RANGE"
            if distance <= self.INNER_CORE_RADIUS:
                proximity_level = "INNER_CORE"
            elif distance <= self.RESONANCE_RADIUS:
                proximity_level = "RESONANCE_FIELD"
            elif distance <= self.AWARENESS_RADIUS:
                proximity_level = "AWARENESS_ZONE"
            
            zone_result = {
                "zone_id": zone_id,
                "name": zone_data["name"],
                "type": zone_data["type"],
                "distance_m": round(distance, 2),
                "proximity_level": proximity_level,
                "coordinates": {"lat": zone_data["lat"], "lon": zone_data["lon"]},
                "utility": zone_data["utility"],
                "ar_asset": zone_data["ar_asset"],
                "resonance_frequency": zone_data["resonance_frequency"],
            }
            
            # Check for AR trigger
            if distance <= self.RESONANCE_RADIUS:
                zone_result["ar_trigger"] = True
                zone_result["haptic_pattern"] = zone_data["haptic_pattern"]
                results["in_resonance_field"] = True
                
                if distance <= self.INNER_CORE_RADIUS:
                    results["in_inner_core"] = True
                    zone_result["max_resonance"] = True
            else:
                zone_result["ar_trigger"] = False
            
            results["zones"].append(zone_result)
            
            # Track nearest zone
            if distance < nearest_distance:
                nearest_distance = distance
                results["nearest_zone"] = {
                    "zone_id": zone_id,
                    "name": zone_data["name"],
                    "distance_m": round(distance, 2),
                    "bearing": self._calculate_bearing(
                        user_lat, user_lon,
                        zone_data["lat"], zone_data["lon"]
                    ),
                }
        
        # Set AR trigger data if within resonance field
        if results["in_resonance_field"]:
            triggered_zone = next(
                (z for z in results["zones"] if z.get("ar_trigger")),
                None
            )
            if triggered_zone:
                results["ar_trigger"] = {
                    "active": True,
                    "zone": triggered_zone["name"],
                    "zone_id": triggered_zone["zone_id"],
                    "type": triggered_zone["type"],
                    "asset": triggered_zone["ar_asset"],
                    "frequency": triggered_zone["resonance_frequency"],
                    "haptic": triggered_zone.get("haptic_pattern"),
                    "inner_core": results["in_inner_core"],
                }
                
                # Increment visit count
                self.zone_visit_counts[triggered_zone["zone_id"]] += 1
        
        return results
    
    def _calculate_bearing(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """Calculate bearing from point 1 to point 2 in degrees."""
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lon = math.radians(lon2 - lon1)
        
        x = math.sin(delta_lon) * math.cos(lat2_rad)
        y = (math.cos(lat1_rad) * math.sin(lat2_rad) - 
             math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(delta_lon))
        
        bearing = math.atan2(x, y)
        bearing = math.degrees(bearing)
        bearing = (bearing + 360) % 360
        
        return round(bearing, 1)
    
    def get_zone_details(self, zone_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific zone."""
        if zone_id not in self.WELLNESS_ZONES:
            return None
        
        zone = self.WELLNESS_ZONES[zone_id]
        
        # Get Main Brain shader params for AR rendering
        shader_params = main_brain.inject_shader_parameters()
        
        return {
            "zone_id": zone_id,
            "name": zone["name"],
            "type": zone["type"],
            "coordinates": {"lat": zone["lat"], "lon": zone["lon"]},
            "utility": zone["utility"],
            "description": zone["description"],
            "ar_asset": zone["ar_asset"],
            "resonance_frequency": zone["resonance_frequency"],
            "haptic_pattern": zone["haptic_pattern"],
            "geofence_radii": {
                "inner_core_m": self.INNER_CORE_RADIUS,
                "resonance_m": self.RESONANCE_RADIUS,
                "awareness_m": self.AWARENESS_RADIUS,
            },
            "visit_count": self.zone_visit_counts[zone_id],
            "shader_params": shader_params,
        }
    
    def get_all_zones(self) -> Dict[str, Any]:
        """Get all Wellness Zones configuration."""
        zones = []
        for zone_id, zone_data in self.WELLNESS_ZONES.items():
            zones.append({
                "zone_id": zone_id,
                "name": zone_data["name"],
                "type": zone_data["type"],
                "coordinates": {"lat": zone_data["lat"], "lon": zone_data["lon"]},
                "utility": zone_data["utility"],
                "resonance_frequency": zone_data["resonance_frequency"],
                "visit_count": self.zone_visit_counts[zone_id],
            })
        
        return {
            "total_zones": len(zones),
            "zones": zones,
            "geofence_config": {
                "inner_core_m": self.INNER_CORE_RADIUS,
                "resonance_m": self.RESONANCE_RADIUS,
                "awareness_m": self.AWARENESS_RADIUS,
            },
            "earth_radius_m": self.EARTH_RADIUS_M,
        }
    
    def get_ar_config(self, zone_id: str) -> Dict[str, Any]:
        """
        Get WebXR AR configuration for a specific zone.
        
        Returns shader uniforms and AR session config merged with zone data.
        """
        zone = self.get_zone_details(zone_id)
        if not zone:
            return {"error": f"Zone {zone_id} not found"}
        
        # Main Brain shader params
        shader_params = main_brain.inject_shader_parameters()
        
        return {
            "zone": zone,
            "webxr_config": {
                "mode": "immersive-ar",
                "plane_detection": True,
                "required_features": ["hit-test", "plane-detection"],
                "optional_features": ["dom-overlay", "light-estimation"],
                "plane_type": "horizontal",  # Horizontal planes only for stability
            },
            "shader_uniforms": shader_params,
            "asset_config": {
                "asset_id": zone["ar_asset"],
                "scale": 0.5,  # Half meter diameter crystal
                "rotation_speed": main_brain.PHI * 0.01,  # Golden ratio rotation
                "glow_intensity": zone["shader_params"]["u_shield_intensity"],
            },
            "haptic_config": {
                "pattern": zone["haptic_pattern"],
                "trigger_distance_m": self.RESONANCE_RADIUS,
                "intensity_curve": "inverse_square",  # Stronger as you approach
            },
            "audio_config": {
                "frequency_hz": zone["resonance_frequency"],
                "volume_curve": "proximity_linear",
            },
        }
    
    def record_zone_entry(
        self,
        user_id: str,
        zone_id: str,
        entry_type: str = "ar_session"
    ) -> Dict[str, Any]:
        """Record a user entering a zone for analytics."""
        if zone_id not in self.WELLNESS_ZONES:
            return {"error": f"Zone {zone_id} not found"}
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        session_data = {
            "user_id": user_id,
            "zone_id": zone_id,
            "zone_name": self.WELLNESS_ZONES[zone_id]["name"],
            "entry_type": entry_type,
            "timestamp": timestamp,
        }
        
        # Store in active sessions
        session_key = f"{user_id}_{zone_id}"
        self.active_sessions[session_key] = session_data
        
        logger.info(f"📍 ZONE_ENTRY: User {user_id} entered {self.WELLNESS_ZONES[zone_id]['name']}")
        
        return {
            "status": "recorded",
            "session": session_data,
        }
    
    def get_navigation_guidance(
        self,
        user_lat: float,
        user_lon: float,
        target_zone_id: str
    ) -> Dict[str, Any]:
        """Get navigation guidance to a specific zone."""
        if target_zone_id not in self.WELLNESS_ZONES:
            return {"error": f"Zone {target_zone_id} not found"}
        
        zone = self.WELLNESS_ZONES[target_zone_id]
        distance = self.haversine_distance(user_lat, user_lon, zone["lat"], zone["lon"])
        bearing = self._calculate_bearing(user_lat, user_lon, zone["lat"], zone["lon"])
        
        # Convert bearing to cardinal direction
        directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
        direction_index = round(bearing / 45) % 8
        cardinal = directions[direction_index]
        
        return {
            "target": {
                "zone_id": target_zone_id,
                "name": zone["name"],
                "coordinates": {"lat": zone["lat"], "lon": zone["lon"]},
            },
            "navigation": {
                "distance_m": round(distance, 2),
                "distance_km": round(distance / 1000, 3),
                "bearing_degrees": bearing,
                "cardinal_direction": cardinal,
                "eta_walking_min": round(distance / 83.33, 1),  # ~5 km/h walking
            },
            "resonance_field_entry_m": round(distance - self.RESONANCE_RADIUS, 2),
        }


# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 GLOBAL SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

geospatial_nexus = GeospatialNexus()


# ═══════════════════════════════════════════════════════════════════════════════
# 🔧 CONVENIENCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def check_proximity(user_lat: float, user_lon: float) -> Dict[str, Any]:
    """Check user proximity to all Wellness Zones."""
    return geospatial_nexus.check_zone_proximity(user_lat, user_lon)


def get_zones() -> Dict[str, Any]:
    """Get all Wellness Zones."""
    return geospatial_nexus.get_all_zones()


def get_ar_config(zone_id: str) -> Dict[str, Any]:
    """Get WebXR AR config for a zone."""
    return geospatial_nexus.get_ar_config(zone_id)
