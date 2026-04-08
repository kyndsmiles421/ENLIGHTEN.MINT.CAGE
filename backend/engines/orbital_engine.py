"""
@project ENLIGHTEN.MINT.CAFE
@module ORBITAL_ENGINE
@directive COMPUTE_AND_RENDER_SEPARATION
@author Steven_with_a_V

Core physics engine with strict compute/visual separation.
PHI-locked harmonic scaling with Schumann resonance damping.
"""

import numpy as np
from typing import List, Optional, Any
from dataclasses import dataclass, field

# --- SYSTEM CONSTANTS (LOCKED) ---
PHI = 1.618
THRESHOLD_RADIUS = 50.0
SCHUMANN_FREQ = 7.83


@dataclass
class Particle:
    """Star Chart particle with physics properties."""
    pos: np.ndarray = field(default_factory=lambda: np.zeros(3))
    velocity: float = 1.0
    magnitude: float = 1.0
    layer: str = "STAR_CHART"
    forces: List[float] = field(default_factory=list)
    
    def apply_force(self, force: float):
        """Apply computed force to particle trajectory."""
        self.forces.append(force)
        # Harmonic velocity adjustment
        self.velocity += force * 0.01 * PHI
    
    def get_net_force(self) -> float:
        return sum(self.forces)


@dataclass
class Nodule:
    """Physics anchor point for orbital calculations."""
    pos: np.ndarray = field(default_factory=lambda: np.zeros(3))
    name: str = ""
    influence_radius: float = THRESHOLD_RADIUS
    active: bool = True


class RenderContext:
    """
    Minimal render context for visual output.
    Maintains the 'Silence Shield' and clean backdrop.
    """
    
    def __init__(self):
        self.backdrop_color = (0, 0, 0)  # Pure black
        self.stars_rendered = []
        self.frame_count = 0
    
    def clear_backdrop(self):
        """Forces 0,0,0 Black - Kills 'Backdrop Noise'"""
        self.stars_rendered = []
        self.backdrop_color = (0, 0, 0)
    
    def draw_star(self, pos: np.ndarray, magnitude: float):
        """Add star to render queue."""
        self.stars_rendered.append({
            "pos": pos.tolist() if isinstance(pos, np.ndarray) else pos,
            "magnitude": magnitude,
            "layer": "STAR_CHART"
        })
    
    def get_frame_data(self) -> dict:
        """Return frame data for serialization."""
        return {
            "backdrop": self.backdrop_color,
            "stars": self.stars_rendered,
            "count": len(self.stars_rendered),
            "frame": self.frame_count
        }


class OrbitalEngine:
    """
    Core physics engine with strict compute/visual separation.
    
    STAGE 1: COMPUTE SIDE ONLY - Physics calculations
    STAGE 2: VISUAL SIDE ONLY - Filtered rendering
    """
    
    def __init__(self):
        self.particles: List[Particle] = []  # Star Chart Data
        self.nodules: List[Nodule] = []      # Physics Anchor Points
        self.time_elapsed: float = 0.0
        self.frame_count: int = 0
    
    def add_particle(self, pos: np.ndarray, velocity: float = 1.0, magnitude: float = 1.0) -> Particle:
        """Add a new particle to the star chart."""
        p = Particle(pos=pos, velocity=velocity, magnitude=magnitude)
        self.particles.append(p)
        return p
    
    def add_nodule(self, pos: np.ndarray, name: str = "") -> Nodule:
        """Add a physics anchor nodule."""
        n = Nodule(pos=pos, name=name)
        self.nodules.append(n)
        return n
    
    def update_physics(self, dt: float):
        """
        STAGE 1: COMPUTE SIDE ONLY
        Handles squared refraction and particle trajectory.
        """
        self.time_elapsed += dt
        
        for p in self.particles:
            for n in self.nodules:
                if not n.active:
                    continue
                    
                dist = np.linalg.norm(p.pos - n.pos)
                
                if dist < THRESHOLD_RADIUS and dist > 0:
                    # Apply Refraction Logic (Force-based, not visual)
                    # Locked to PHI for harmonic scaling
                    refraction_force = (p.velocity ** 2) / (PHI * dist)
                    
                    # Apply Schumann resonance as a damping factor 
                    # to prevent 'confetti' jitter
                    damped_force = refraction_force * np.sin(SCHUMANN_FREQ * dt)
                    p.apply_force(damped_force)
                    
                    # Tag as DATA_ONLY to bypass the visual renderer
                    p.layer = "DATA_ONLY"
                else:
                    p.layer = "STAR_CHART"
    
    def render_frame(self, ctx: RenderContext):
        """
        STAGE 2: VISUAL SIDE ONLY
        Strict filter to maintain the 'Silence Shield' and clean backdrop.
        """
        ctx.clear_backdrop()  # Forces 0,0,0 Black - Kills 'Backdrop Noise'
        ctx.frame_count = self.frame_count
        
        for p in self.particles:
            # Only draw what belongs in the Star Chart
            # Refraction Glow and Backdrop Noise are ignored by design
            if p.layer == "STAR_CHART":
                ctx.draw_star(p.pos, p.magnitude)
            
            # Note: DATA_ONLY particles are processed but never ctx.draw-n
        
        self.frame_count += 1
        return ctx.get_frame_data()
    
    def process_frame(self, dt: float) -> dict:
        """
        Complete frame processing pipeline.
        Returns serializable frame data.
        """
        # Stage 1: Physics
        self.update_physics(dt)
        
        # Stage 2: Render
        ctx = RenderContext()
        frame_data = self.render_frame(ctx)
        
        # Add physics metadata
        frame_data["physics"] = {
            "total_particles": len(self.particles),
            "visible_particles": frame_data["count"],
            "data_only_count": len([p for p in self.particles if p.layer == "DATA_ONLY"]),
            "time_elapsed": self.time_elapsed,
            "nodule_count": len(self.nodules)
        }
        
        return frame_data
    
    def get_state(self) -> dict:
        """Return current engine state for debugging."""
        return {
            "particles": len(self.particles),
            "nodules": len(self.nodules),
            "time": self.time_elapsed,
            "frames": self.frame_count,
            "constants": {
                "PHI": PHI,
                "THRESHOLD_RADIUS": THRESHOLD_RADIUS,
                "SCHUMANN_FREQ": SCHUMANN_FREQ
            }
        }


# Factory function for API integration
def create_orbital_engine() -> OrbitalEngine:
    """Create a new OrbitalEngine instance."""
    return OrbitalEngine()


# Export
__all__ = [
    'OrbitalEngine',
    'Particle',
    'Nodule',
    'RenderContext',
    'create_orbital_engine',
    'PHI',
    'THRESHOLD_RADIUS',
    'SCHUMANN_FREQ'
]
