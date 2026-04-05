"""
XR SPATIAL ENGINE: AR Anchors & VR Proximity
=============================================

The Phygital Bridge - where digital seeds manifest in physical space.

ARCHITECTURE:
┌────────────────────────────────────────────────────────────────────────────┐
│                         XR SPATIAL ENGINE                                  │
│                                                                            │
│   ┌─────────────────┐                    ┌─────────────────┐              │
│   │   AR ANCHORING  │                    │  VR PROXIMITY   │              │
│   │                 │                    │                 │              │
│   │  72-bit Seed ───┼──► GPS Coords ───┼──► 3D Manifest   │              │
│   │  (from Crystal) │    (lat, lon)    │    (Tesseract)   │              │
│   └─────────────────┘                    └─────────────────┘              │
│                                                                            │
│   TORQUE CALCULATION:                                                      │
│   - As user approaches a seed anchor, gravitational pull increases         │
│   - Torque = 1 / (distance + 0.1)                                         │
│   - This drives the visual intensity and interaction radius                │
│                                                                            │
│   KEITH WRIGHT'S PRINCIPLE:                                                │
│   "The seed becomes a beacon. Walk toward it, and the universe             │
│    responds with increasing resonance. The closer you get,                 │
│    the louder the cosmos speaks."                                          │
└────────────────────────────────────────────────────────────────────────────┘

VISUAL MANIFESTS:
- Crystalline_Tesseract: 4D hypercube projection (963 Hz)
- Oracle_Sphere: Translucent orb with inner glow (852 Hz)
- Sanctuary_Portal: Gateway arch effect (432 Hz)
- Void_Singularity: Black hole with event horizon (0 Hz)
"""

import math
import time
import hashlib
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# VISUAL MANIFESTS (3D Object Templates)
# ═══════════════════════════════════════════════════════════════════════════════

class VisualManifest(Enum):
    """3D visual representations for AR anchors."""
    CRYSTALLINE_TESSERACT = "Crystalline_Tesseract"
    ORACLE_SPHERE = "Oracle_Sphere"
    SANCTUARY_PORTAL = "Sanctuary_Portal"
    VOID_SINGULARITY = "Void_Singularity"
    BREATHING_RIPPLE = "Breathing_Ripple"
    TAROT_CARD = "Tarot_Card"
    HEXAGRAM_GLYPH = "Hexagram_Glyph"
    STAR_CONSTELLATION = "Star_Constellation"


# Frequency to manifest mapping
FREQUENCY_MANIFESTS = {
    (0, 100): VisualManifest.VOID_SINGULARITY,
    (100, 200): VisualManifest.BREATHING_RIPPLE,
    (200, 500): VisualManifest.SANCTUARY_PORTAL,
    (500, 700): VisualManifest.HEXAGRAM_GLYPH,
    (700, 800): VisualManifest.TAROT_CARD,
    (800, 900): VisualManifest.ORACLE_SPHERE,
    (900, 1000): VisualManifest.CRYSTALLINE_TESSERACT,
}


def get_manifest_for_frequency(freq: float) -> VisualManifest:
    """Get the appropriate visual manifest for a frequency."""
    for (low, high), manifest in FREQUENCY_MANIFESTS.items():
        if low <= freq < high:
            return manifest
    return VisualManifest.CRYSTALLINE_TESSERACT


# ═══════════════════════════════════════════════════════════════════════════════
# AR ANCHOR DATA STRUCTURE
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class ARNode:
    """
    A physical anchor point where a seed manifests in AR.
    
    The seed's 72-bit hash becomes a unique identifier for this location,
    creating a permanent link between the digital realm and physical space.
    """
    id: str  # 72-bit seed hash
    coordinates: Dict[str, float]  # {"lat": float, "lon": float}
    visual_manifest: str
    resonance: float
    white_light_multiplier: float
    
    # Metadata
    created_at: float = field(default_factory=time.time)
    created_by: Optional[str] = None
    source_module: str = "Unknown"
    
    # Interaction stats
    total_approaches: int = 0
    total_resonance_captured: float = 0.0
    last_visited: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "coordinates": self.coordinates,
            "visual_manifest": self.visual_manifest,
            "resonance": self.resonance,
            "white_light_multiplier": self.white_light_multiplier,
            "created_at": self.created_at,
            "created_by": self.created_by,
            "source_module": self.source_module,
            "total_approaches": self.total_approaches,
            "total_resonance_captured": self.total_resonance_captured,
            "last_visited": self.last_visited,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# VR ENVIRONMENT STATES
# ═══════════════════════════════════════════════════════════════════════════════

class VREnvironment(Enum):
    """Available VR environment states."""
    SANCTUARY_STANDARD = "Sanctuary_Standard"
    VOID_ABYSS = "Void_Abyss"
    CELESTIAL_DOME = "Celestial_Dome"
    CRYSTAL_CAVE = "Crystal_Cave"
    INFINITE_LIBRARY = "Infinite_Library"
    GARDEN_OF_PATHS = "Garden_of_Paths"


# ═══════════════════════════════════════════════════════════════════════════════
# XR SPATIAL ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class XRSpatialEngine:
    """
    Extended Reality Spatial Engine.
    
    Manages AR anchors (physical seed manifestations) and VR proximity
    calculations (gravitational pull toward nodes).
    
    The Phygital Bridge - where digital seeds manifest in physical space.
    """
    
    def __init__(self):
        # Tracking AR anchor points in the real world
        self.active_ar_nodes: List[ARNode] = []
        self.vr_environment_state: VREnvironment = VREnvironment.SANCTUARY_STANDARD
        
        # User tracking (for VR proximity)
        self.user_positions: Dict[str, Tuple[float, float]] = {}
        
        # Statistics
        self.total_anchors_minted = 0
        self.total_proximity_calculations = 0
        
        logger.info("🌐 [XRSpatialEngine] Initialized - Phygital Bridge Active")
    
    # ─────────────────────────────────────────────────────────────────────────
    # AR ANCHORING: Mint Physical Seeds
    # ─────────────────────────────────────────────────────────────────────────
    
    def generate_ar_anchor(
        self, 
        seed_hash: str, 
        lat: float, 
        lon: float,
        resonance: float = 963.0,
        source_module: str = "Tesseract",
        user_id: Optional[str] = None,
    ) -> ARNode:
        """
        Mints a Physical Anchor.
        
        The 72-bit Seed becomes a visible 3D object in AR at these coordinates.
        
        Args:
            seed_hash: 72-bit seed from Crystal transition
            lat: Latitude coordinate
            lon: Longitude coordinate
            resonance: Frequency in Hz
            source_module: Module that generated this seed
            user_id: User who minted this anchor
            
        Returns:
            ARNode with full anchor data
        """
        # Determine visual manifest based on resonance
        manifest = get_manifest_for_frequency(resonance)
        
        # Calculate white light multiplier (very high for Tesseract, scaled down for others)
        if resonance >= 900:
            white_light = 999999.0  # Near-infinite radiance for highest frequencies
        elif resonance >= 700:
            white_light = 100.0
        elif resonance >= 400:
            white_light = 10.0
        else:
            white_light = 1.0
        
        # Create anchor
        anchor = ARNode(
            id=seed_hash,
            coordinates={"lat": lat, "lon": lon},
            visual_manifest=manifest.value,
            resonance=resonance,
            white_light_multiplier=white_light,
            created_by=user_id,
            source_module=source_module,
        )
        
        self.active_ar_nodes.append(anchor)
        self.total_anchors_minted += 1
        
        logger.info(
            f"📍 [AR] Seed {seed_hash[:12]}... anchored at ({lat:.4f}, {lon:.4f}) "
            f"| {manifest.value} @ {resonance}Hz"
        )
        
        return anchor
    
    def get_ar_anchor(self, seed_hash: str) -> Optional[ARNode]:
        """Get an AR anchor by its seed hash."""
        for node in self.active_ar_nodes:
            if node.id == seed_hash:
                return node
        return None
    
    def get_anchors_in_radius(
        self, 
        lat: float, 
        lon: float, 
        radius_km: float = 1.0
    ) -> List[ARNode]:
        """
        Get all AR anchors within a radius of a point.
        
        Uses Haversine formula for accurate distance calculation.
        """
        nearby = []
        
        for node in self.active_ar_nodes:
            distance = self._haversine_distance(
                lat, lon,
                node.coordinates["lat"], 
                node.coordinates["lon"]
            )
            if distance <= radius_km:
                nearby.append(node)
        
        return nearby
    
    def _haversine_distance(
        self, 
        lat1: float, lon1: float, 
        lat2: float, lon2: float
    ) -> float:
        """Calculate distance between two points in km using Haversine formula."""
        R = 6371  # Earth's radius in km
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi / 2) ** 2 + 
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    # ─────────────────────────────────────────────────────────────────────────
    # VR PROXIMITY: Gravitational Pull Calculation
    # ─────────────────────────────────────────────────────────────────────────
    
    def calculate_vr_proximity(
        self, 
        user_pos: Tuple[float, float], 
        node_pos: Tuple[float, float]
    ) -> float:
        """
        Calculate the 'Pull' of an object in VR space.
        
        As you walk closer to a seed, the Torque increases.
        This creates a gravitational effect where nearby seeds
        exert stronger influence on the user's experience.
        
        Args:
            user_pos: User's current (x, y) position in VR
            node_pos: Node's (x, y) position in VR
            
        Returns:
            VR Torque value (higher = closer/stronger pull)
        """
        self.total_proximity_calculations += 1
        
        # Calculate Euclidean distance
        dist = math.sqrt(
            (user_pos[0] - node_pos[0]) ** 2 + 
            (user_pos[1] - node_pos[1]) ** 2
        )
        
        # Torque increases as distance decreases (Gravitational Pull)
        # Adding 0.1 prevents division by zero at exact position
        vr_torque = 1.0 / (dist + 0.1)
        
        logger.debug(f"🧲 [VR] Distance: {dist:.2f} → Torque: {vr_torque:.2f}")
        
        return vr_torque
    
    def calculate_total_field_torque(
        self,
        user_pos: Tuple[float, float],
        max_distance: float = 100.0
    ) -> Dict[str, Any]:
        """
        Calculate the total torque field from all nearby nodes.
        
        This creates a combined gravitational effect where multiple
        seeds can pull the user in different directions.
        
        Returns:
            Dict with total torque, dominant node, and field vectors
        """
        total_torque = 0.0
        dominant_node = None
        max_individual_torque = 0.0
        field_vectors = []
        
        for node in self.active_ar_nodes:
            node_pos = (node.coordinates["lat"], node.coordinates["lon"])
            torque = self.calculate_vr_proximity(user_pos, node_pos)
            
            # Only count nodes within max_distance
            dist = math.sqrt(
                (user_pos[0] - node_pos[0]) ** 2 + 
                (user_pos[1] - node_pos[1]) ** 2
            )
            
            if dist <= max_distance:
                # Weight by resonance
                weighted_torque = torque * (node.resonance / 1000.0)
                total_torque += weighted_torque
                
                # Track dominant node
                if weighted_torque > max_individual_torque:
                    max_individual_torque = weighted_torque
                    dominant_node = node
                
                # Calculate pull direction
                if dist > 0:
                    dx = (node_pos[0] - user_pos[0]) / dist
                    dy = (node_pos[1] - user_pos[1]) / dist
                else:
                    dx, dy = 0, 0
                
                field_vectors.append({
                    "node_id": node.id,
                    "torque": weighted_torque,
                    "direction": {"x": dx, "y": dy},
                    "distance": dist,
                })
        
        return {
            "total_torque": total_torque,
            "dominant_node": dominant_node.to_dict() if dominant_node else None,
            "field_vectors": field_vectors,
            "node_count": len(field_vectors),
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # VR ENVIRONMENT MANAGEMENT
    # ─────────────────────────────────────────────────────────────────────────
    
    def set_vr_environment(self, environment: str) -> bool:
        """Set the VR environment state."""
        try:
            self.vr_environment_state = VREnvironment(environment)
            logger.info(f"🌌 [VR] Environment changed to {environment}")
            return True
        except ValueError:
            logger.warning(f"❌ [VR] Unknown environment: {environment}")
            return False
    
    def get_vr_environment(self) -> str:
        """Get current VR environment."""
        return self.vr_environment_state.value
    
    def get_available_environments(self) -> List[str]:
        """Get list of available VR environments."""
        return [env.value for env in VREnvironment]
    
    # ─────────────────────────────────────────────────────────────────────────
    # USER POSITION TRACKING
    # ─────────────────────────────────────────────────────────────────────────
    
    def update_user_position(
        self, 
        user_id: str, 
        lat: float, 
        lon: float
    ) -> Dict[str, Any]:
        """
        Update a user's position and calculate their torque field.
        
        Returns nearby anchors and their pull strengths.
        """
        self.user_positions[user_id] = (lat, lon)
        
        # Calculate field
        field = self.calculate_total_field_torque((lat, lon))
        
        # Record approaches to nearby nodes
        for vector in field["field_vectors"]:
            if vector["distance"] < 0.1:  # Within 100m
                node = self.get_ar_anchor(vector["node_id"])
                if node:
                    node.total_approaches += 1
                    node.last_visited = time.time()
        
        return {
            "user_id": user_id,
            "position": {"lat": lat, "lon": lon},
            "field": field,
            "vr_environment": self.vr_environment_state.value,
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # STATISTICS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_stats(self) -> Dict[str, Any]:
        """Get engine statistics."""
        return {
            "total_anchors": len(self.active_ar_nodes),
            "total_minted": self.total_anchors_minted,
            "total_proximity_calculations": self.total_proximity_calculations,
            "active_users": len(self.user_positions),
            "vr_environment": self.vr_environment_state.value,
            "manifests_distribution": self._get_manifest_distribution(),
        }
    
    def _get_manifest_distribution(self) -> Dict[str, int]:
        """Get distribution of visual manifests."""
        dist = {}
        for node in self.active_ar_nodes:
            manifest = node.visual_manifest
            dist[manifest] = dist.get(manifest, 0) + 1
        return dist


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_xr_engine: Optional[XRSpatialEngine] = None

def get_xr_engine() -> XRSpatialEngine:
    """Get the singleton XR engine instance."""
    global _xr_engine
    if _xr_engine is None:
        _xr_engine = XRSpatialEngine()
    return _xr_engine


# ═══════════════════════════════════════════════════════════════════════════════
# DEMO
# ═══════════════════════════════════════════════════════════════════════════════

def demo():
    """Demonstrate the XR Spatial Engine."""
    engine = XRSpatialEngine()
    
    print("═" * 60)
    print("    XR SPATIAL ENGINE: Phygital Bridge Demo")
    print("═" * 60)
    print()
    
    # Mint some anchors
    seeds = [
        ("a1b2c3d4e5f6g7h8i9", 37.7749, -122.4194, 963.0, "Tesseract"),  # SF
        ("j1k2l3m4n5o6p7q8r9", 40.7128, -74.0060, 852.0, "Oracle"),      # NYC
        ("s1t2u3v4w5x6y7z8a9", 51.5074, -0.1278, 432.0, "Sanctuary"),    # London
    ]
    
    for seed, lat, lon, freq, module in seeds:
        engine.generate_ar_anchor(seed, lat, lon, freq, module)
    
    print()
    
    # Simulate user position
    user_pos = (37.7750, -122.4195)  # Near SF anchor
    field = engine.calculate_total_field_torque(user_pos)
    
    print(f"📍 User at ({user_pos[0]}, {user_pos[1]})")
    print(f"🧲 Total Field Torque: {field['total_torque']:.2f}")
    print(f"🏆 Dominant Node: {field['dominant_node']['id'][:12] if field['dominant_node'] else 'None'}...")
    print()
    
    # Get nearby anchors
    nearby = engine.get_anchors_in_radius(37.7749, -122.4194, 10)
    print(f"📡 Anchors within 10km: {len(nearby)}")
    
    print()
    print("─" * 60)
    print("Stats:", engine.get_stats())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    demo()
