"""
@project ENLIGHTEN.MINT.CAFE
@module RECURSIVE_ORBITAL_CONTAINMENT
@directive PHI_BASED_COLLISION_PREVENTION
@author Steven_with_a_V

Uses PHI to prevent widget overlap and layout collisions.
Fibonacci-based spacing for spherical mapping.
Mobile-safe (Capacitor/PWA compatible).
"""

import numpy as np
from typing import List, Tuple, Dict, Any
from dataclasses import dataclass, field


# SYSTEM CONSTANTS (LOCKED)
PHI = 1.618
GOLDEN_ANGLE = np.pi * (1 + 5**0.5)  # ~137.5° in radians
BASE_RADIUS = 100.0


@dataclass
class OrbitalNode:
    """Represents a node in the orbital containment system."""
    index: int
    tier: int
    position: List[float] = field(default_factory=lambda: [0.0, 0.0, 0.0])
    radius: float = 0.0
    phi_angle: float = 0.0
    theta_angle: float = 0.0
    name: str = ""
    active: bool = True
    
    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "tier": self.tier,
            "position": self.position,
            "radius": self.radius,
            "angles": {"phi": self.phi_angle, "theta": self.theta_angle},
            "name": self.name,
            "active": self.active
        }


@dataclass
class OrbitalTier:
    """Represents a spherical shell tier in the orbital system."""
    level: int
    radius: float
    nodes: List[OrbitalNode] = field(default_factory=list)
    
    def get_node_count(self) -> int:
        return len(self.nodes)


class OrbitalHub:
    """
    RECURSIVE ORBITAL CONTAINMENT
    
    Uses PHI to prevent widget overlap and layout collisions.
    Fibonacci-based spacing for spherical mapping ensures
    even distribution on any tier level.
    """
    
    def __init__(self, base_radius: float = BASE_RADIUS):
        self.phi = PHI
        self.golden_angle = GOLDEN_ANGLE
        self.base_radius = base_radius
        self.tiers: List[OrbitalTier] = []
        self.all_nodes: List[OrbitalNode] = []
    
    def calculate_node_position(
        self, 
        index: int, 
        total_nodes: int, 
        tier_level: int
    ) -> List[float]:
        """
        Calculates the 3D position of a node on a spherical shell.
        Prevents overlap by using Fibonacci-based spacing.
        
        Args:
            index: Node index within the tier
            total_nodes: Total nodes in this tier
            tier_level: Shell tier (0 = core, 1+ = outer shells)
        
        Returns:
            [x, y, z] position coordinates
        """
        # Radius grows by PHI per tier level
        radius = self.base_radius * (self.phi ** tier_level)
        
        # Golden spiral distribution for spherical mapping
        # Prevents clustering at poles
        phi_angle = np.arccos(1 - 2 * (index + 0.5) / total_nodes)
        theta_angle = self.golden_angle * index
        
        # Spherical to Cartesian conversion
        x = radius * np.cos(theta_angle) * np.sin(phi_angle)
        y = radius * np.sin(theta_angle) * np.sin(phi_angle)
        z = radius * np.cos(phi_angle)
        
        return [float(x), float(y), float(z)]
    
    def create_tier(self, tier_level: int, node_count: int, names: List[str] = None) -> OrbitalTier:
        """
        Create a new orbital tier with evenly distributed nodes.
        
        Args:
            tier_level: Shell tier level
            node_count: Number of nodes for this tier
            names: Optional list of node names
        """
        radius = self.base_radius * (self.phi ** tier_level)
        tier = OrbitalTier(level=tier_level, radius=radius)
        
        for i in range(node_count):
            position = self.calculate_node_position(i, node_count, tier_level)
            
            # Calculate angles for reference
            phi_angle = np.arccos(1 - 2 * (i + 0.5) / node_count)
            theta_angle = self.golden_angle * i
            
            node = OrbitalNode(
                index=i,
                tier=tier_level,
                position=position,
                radius=radius,
                phi_angle=float(phi_angle),
                theta_angle=float(theta_angle),
                name=names[i] if names and i < len(names) else f"node_{tier_level}_{i}"
            )
            
            tier.nodes.append(node)
            self.all_nodes.append(node)
        
        self.tiers.append(tier)
        return tier
    
    def calculate_mobile_bounds(self, screen_width: int, screen_height: int) -> Dict[str, float]:
        """
        ENFORCING THE SPHERE (Mobile/Capacitor/PWA)
        
        Calculates scaling factors to ensure widgets stay within
        orbital containment on any screen size.
        """
        # Calculate maximum safe radius based on screen dimensions
        min_dimension = min(screen_width, screen_height)
        safe_radius = min_dimension * 0.4  # 40% of smallest dimension
        
        # Find the outermost tier radius
        max_radius = max([t.radius for t in self.tiers]) if self.tiers else self.base_radius
        
        # Calculate scale factor to fit within safe bounds
        scale_factor = safe_radius / max_radius if max_radius > 0 else 1.0
        
        return {
            "safe_radius": safe_radius,
            "max_radius": max_radius,
            "scale_factor": scale_factor,
            "center_x": screen_width / 2,
            "center_y": screen_height / 2,
            "phi_ratio": self.phi
        }
    
    def get_scaled_positions(
        self, 
        screen_width: int, 
        screen_height: int
    ) -> List[Dict[str, Any]]:
        """
        Returns all node positions scaled for the given screen dimensions.
        Maintains PHI spacing while fitting within mobile bounds.
        """
        bounds = self.calculate_mobile_bounds(screen_width, screen_height)
        scale = bounds["scale_factor"]
        cx, cy = bounds["center_x"], bounds["center_y"]
        
        scaled_positions = []
        for node in self.all_nodes:
            # Scale and center the position
            scaled_x = cx + (node.position[0] * scale)
            scaled_y = cy + (node.position[1] * scale)
            scaled_z = node.position[2] * scale  # For depth/opacity effects
            
            scaled_positions.append({
                "node": node.name,
                "tier": node.tier,
                "screen_x": scaled_x,
                "screen_y": scaled_y,
                "depth_z": scaled_z,
                "original": node.position,
                "scale_applied": scale
            })
        
        return scaled_positions
    
    def check_collision(self, node_a: OrbitalNode, node_b: OrbitalNode, min_distance: float = 20.0) -> bool:
        """
        Check if two nodes are too close (collision).
        PHI-based spacing should prevent this naturally.
        """
        pos_a = np.array(node_a.position)
        pos_b = np.array(node_b.position)
        distance = np.linalg.norm(pos_a - pos_b)
        return distance < min_distance
    
    def validate_no_collisions(self, min_distance: float = 20.0) -> Dict[str, Any]:
        """
        Validate that no nodes are overlapping.
        Returns collision report.
        """
        collisions = []
        
        for i, node_a in enumerate(self.all_nodes):
            for node_b in self.all_nodes[i+1:]:
                if self.check_collision(node_a, node_b, min_distance):
                    collisions.append({
                        "node_a": node_a.name,
                        "node_b": node_b.name,
                        "distance": float(np.linalg.norm(
                            np.array(node_a.position) - np.array(node_b.position)
                        ))
                    })
        
        return {
            "valid": len(collisions) == 0,
            "collision_count": len(collisions),
            "collisions": collisions,
            "total_nodes": len(self.all_nodes)
        }
    
    def get_state(self) -> Dict[str, Any]:
        """Return current hub state."""
        return {
            "phi": self.phi,
            "base_radius": self.base_radius,
            "tier_count": len(self.tiers),
            "total_nodes": len(self.all_nodes),
            "tiers": [
                {
                    "level": t.level,
                    "radius": t.radius,
                    "node_count": t.get_node_count()
                }
                for t in self.tiers
            ]
        }


def create_orbital_hub(
    tier_configs: List[Tuple[int, int, List[str]]] = None
) -> OrbitalHub:
    """
    Factory function to create a configured OrbitalHub.
    
    Args:
        tier_configs: List of (tier_level, node_count, names) tuples
    
    Example:
        hub = create_orbital_hub([
            (0, 1, ["core"]),           # Core: 1 node
            (1, 8, ["oracle", "meditation", ...]),  # Inner: 8 nodes
            (2, 16, [...])              # Outer: 16 nodes
        ])
    """
    hub = OrbitalHub()
    
    if tier_configs:
        for tier_level, node_count, names in tier_configs:
            hub.create_tier(tier_level, node_count, names)
    
    return hub


# Export
__all__ = [
    'OrbitalHub',
    'OrbitalNode',
    'OrbitalTier',
    'create_orbital_hub',
    'PHI',
    'GOLDEN_ANGLE',
    'BASE_RADIUS'
]
