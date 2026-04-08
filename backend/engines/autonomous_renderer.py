"""
@project ENLIGHTEN.MINT.CAFE
@module AUTONOMOUS_RENDERER
@directive SILENCE_SHIELD_ENFORCEMENT
@author Steven_with_a_V

Automated State Guard - System-level visual filtering.
Hard-coded whitelist: If it's not a Star, it doesn't exist to the eyes.
"""

from typing import Set, List, Any, Optional
from dataclasses import dataclass


@dataclass
class RenderPacket:
    """Visual data packet for render pipeline."""
    pos: tuple
    layer: str = "STAR_CHART"
    color: tuple = (255, 255, 255)
    magnitude: float = 1.0
    metadata: dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class GlobalContext:
    """
    Global rendering context.
    Maintains permanent background lock to Obsidian Void.
    """
    
    def __init__(self):
        self.background = (0, 0, 0)  # Permanent black
        self.blending_mode = "NONE"
        self.render_queue: List[dict] = []
        self.physics_buffer: List[RenderPacket] = []
        self.frame_count = 0
    
    def clear_to_black(self):
        """Permanent background lock to Obsidian Void."""
        self.background = (0, 0, 0)
        self.render_queue = []
        print("[V-ENGINE] Background locked to OBSIDIAN_VOID (0,0,0)")
    
    def set_blending(self, mode: str):
        """Set blending mode. NONE = no artifacts."""
        self.blending_mode = mode
    
    def draw_point(self, pos: tuple, color: tuple = (255, 255, 255)):
        """Draw a clean point with no refraction artifacts."""
        self.render_queue.append({
            "type": "STAR",
            "pos": pos,
            "color": color,
            "blending": self.blending_mode
        })
    
    def get_render_data(self) -> dict:
        """Return current render state."""
        return {
            "background": self.background,
            "blending": self.blending_mode,
            "queue_size": len(self.render_queue),
            "physics_buffer_size": len(self.physics_buffer),
            "frame": self.frame_count
        }


class AutonomousRenderer:
    """
    AUTOMATED STATE GUARD
    Enforces the "Silence Shield" at the system level.
    
    Hard-coded whitelist ensures only clean stars reach the visual layer.
    All other data is routed to physics buffer (compute-only).
    """
    
    def __init__(self, context: GlobalContext):
        self.ctx = context
        self.allowed_layers: Set[str] = {"STAR_CHART"}  # Hard-coded whitelist
        self.suppressed_count = 0
        self.rendered_count = 0
    
    def auto_filter_render(self, packet_stream: List[RenderPacket]):
        """
        AUTOMATIC INTERCEPTION:
        If it's not a Star, it doesn't exist to the eyes.
        """
        for packet in packet_stream:
            # Automatic suppression of any 'refraction' or 'noise' tags
            if packet.layer in self.allowed_layers:
                self.draw_clean_star(packet)
                self.rendered_count += 1
            else:
                # Log to compute-side only, ignore visually
                self.pass_to_physics_buffer(packet)
                self.suppressed_count += 1
    
    def draw_clean_star(self, p: RenderPacket):
        """
        Force-clears any remaining refraction artifacts at the pixel level.
        Pure white light on obsidian void.
        """
        self.ctx.set_blending("NONE")
        self.ctx.draw_point(p.pos, color=(255, 255, 255))
    
    def pass_to_physics_buffer(self, packet: RenderPacket):
        """
        Route non-visual data to physics compute buffer.
        Data exists for calculations but not for eyes.
        """
        self.ctx.physics_buffer.append(packet)
    
    def get_filter_stats(self) -> dict:
        """Return filtering statistics."""
        total = self.rendered_count + self.suppressed_count
        return {
            "rendered": self.rendered_count,
            "suppressed": self.suppressed_count,
            "total_processed": total,
            "filter_ratio": self.suppressed_count / total if total > 0 else 0,
            "allowed_layers": list(self.allowed_layers)
        }
    
    def reset_stats(self):
        """Reset frame statistics."""
        self.suppressed_count = 0
        self.rendered_count = 0


# --- GLOBAL CONTEXT SINGLETON ---
global_ctx = GlobalContext()


def initialize_void() -> AutonomousRenderer:
    """
    INITIALIZING THE VOID
    Creates renderer with permanent background lock.
    """
    renderer = AutonomousRenderer(global_ctx)
    renderer.ctx.clear_to_black()  # Permanent background lock
    print("[V-ENGINE] Silence Shield ACTIVE. Void initialized.")
    return renderer


def create_packet(
    pos: tuple,
    layer: str = "STAR_CHART",
    magnitude: float = 1.0
) -> RenderPacket:
    """Factory for render packets."""
    return RenderPacket(pos=pos, layer=layer, magnitude=magnitude)


# Export
__all__ = [
    'AutonomousRenderer',
    'GlobalContext',
    'RenderPacket',
    'global_ctx',
    'initialize_void',
    'create_packet'
]
