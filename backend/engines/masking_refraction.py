"""
@project ENLIGHTEN.MINT.CAFE
@module MASKING_REFRACTION_ENGINE
@directive COMPUTE_ONLY_VISUAL_SUPPRESSION
@author Steven_with_a_V

Particle masking and refraction calculation.
Influences path physics but NOT visual output.
"""

import math
from typing import List, Dict, Any, Tuple

# CONSTANTS
REFRACTIVE_INDEX = 1.618  # PHI-based refraction
THRESHOLD_RADIUS = 50.0   # Distance threshold for nodule interaction
SCHUMANN_FREQ = 7.83      # Grounding frequency


class Particle:
    """Represents a single particle in the cloud."""
    
    def __init__(self, pos: Tuple[float, float, float], velocity: float = 1.0):
        self.pos = pos
        self.velocity = velocity
        self.render_layer = "STAR_CHART"
        self.forces: List[float] = []
    
    def apply_force(self, force: float):
        """Apply refraction force to particle."""
        self.forces.append(force)
        # Modify velocity based on accumulated forces
        self.velocity += force * 0.01  # Dampening factor
    
    def get_total_force(self) -> float:
        return sum(self.forces)


class Nodule:
    """Represents an interactive nodule/hub point."""
    
    def __init__(self, pos: Tuple[float, float, float], name: str = ""):
        self.pos = pos
        self.name = name
        self.influence_radius = THRESHOLD_RADIUS


def calculate_distance(pos1: Tuple[float, float, float], pos2: Tuple[float, float, float]) -> float:
    """Euclidean distance in 3D space."""
    return math.sqrt(
        (pos2[0] - pos1[0]) ** 2 +
        (pos2[1] - pos1[1]) ** 2 +
        (pos2[2] - pos1[2]) ** 2
    )


def apply_masking_refraction(
    particle_cloud: List[Particle],
    nodules: List[Nodule],
    refractive_index: float = REFRACTIVE_INDEX,
    threshold_radius: float = THRESHOLD_RADIUS
) -> Dict[str, List[Particle]]:
    """
    MASKING & REFRACTION CALCULATION (Computing Side Only)
    
    Applies squared refraction logic to particle physics.
    Influences the path but NOT the visual output.
    
    Returns particles sorted by render layer.
    """
    
    layers = {
        "STAR_CHART": [],
        "DATA_ONLY": []
    }
    
    for particle in particle_cloud:
        # 1. Calculate distance to nearest Nodule
        min_dist = float('inf')
        nearest_nodule = None
        
        for nodule in nodules:
            dist = calculate_distance(particle.pos, nodule.pos)
            if dist < min_dist:
                min_dist = dist
                nearest_nodule = nodule
        
        if min_dist < threshold_radius and nearest_nodule:
            # 2. Apply Squared Refraction Logic to the Vector Physics
            # This influences the path but NOT the visual output
            if min_dist > 0:  # Prevent division by zero
                refraction_force = (particle.velocity ** 2) / (refractive_index * min_dist)
                particle.apply_force(refraction_force)
            
            # 3. Suppress Visual Noise
            # Set alpha/emission to 0 for the refractive "halo"
            particle.render_layer = "DATA_ONLY"
            layers["DATA_ONLY"].append(particle)
        else:
            particle.render_layer = "STAR_CHART"
            layers["STAR_CHART"].append(particle)
    
    return layers


def render_scene(
    layers: Dict[str, List[Particle]],
    include: List[str] = None,
    ignore: List[str] = None
) -> Dict[str, Any]:
    """
    Final Composite (Exclude the Backdrop Noise)
    
    Only renders specified layers, ignoring visual noise.
    """
    
    if include is None:
        include = ["STAR_CHART"]
    
    if ignore is None:
        ignore = ["REFRACTION_GLOW", "BACKDROP_NOISE"]
    
    output = {
        "rendered_particles": [],
        "suppressed_count": 0,
        "total_force_applied": 0.0
    }
    
    for layer_name, particles in layers.items():
        if layer_name in include and layer_name not in ignore:
            output["rendered_particles"].extend(particles)
        else:
            output["suppressed_count"] += len(particles)
        
        # Track total force for physics validation
        for p in particles:
            output["total_force_applied"] += p.get_total_force()
    
    return output


def process_particle_frame(
    particle_cloud: List[Particle],
    nodules: List[Nodule]
) -> Dict[str, Any]:
    """
    Single frame processing pipeline.
    
    1. Apply masking/refraction
    2. Render scene with noise suppression
    3. Return composite data
    """
    
    # Apply physics calculations
    layers = apply_masking_refraction(particle_cloud, nodules)
    
    # 4. Final Composite (Exclude the Backdrop Noise)
    scene = render_scene(
        layers=layers,
        include=["STAR_CHART"],
        ignore=["REFRACTION_GLOW", "BACKDROP_NOISE"]
    )
    
    return {
        "layers": layers,
        "scene": scene,
        "star_chart_count": len(layers.get("STAR_CHART", [])),
        "data_only_count": len(layers.get("DATA_ONLY", [])),
        "status": "FRAME_PROCESSED"
    }


# Export for API integration
__all__ = [
    'Particle',
    'Nodule',
    'calculate_distance',
    'apply_masking_refraction',
    'render_scene',
    'process_particle_frame',
    'REFRACTIVE_INDEX',
    'THRESHOLD_RADIUS',
    'SCHUMANN_FREQ'
]
