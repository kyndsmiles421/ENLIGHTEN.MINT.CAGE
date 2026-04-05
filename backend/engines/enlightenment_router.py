"""
ENLIGHTENMENT ROUTER: Harmonic Resistance Data Flow
====================================================

Implements Keith Wright's principle of "slowed momentum" for theological content.

THE THREE LANES:
- Fast Row (⚡ Kinetic): UI interactions, refreshes, light data (0.01s)
- Mid Row (⚖️ Balanced): Standard content, transitions (0.5s)  
- Slow Row (🧘 Theological): Deep wisdom, contemplative content (2.5s)

PHILOSOPHY:
Information weight determines processing lane. Heavy content (theological,
philosophical) naturally requires more "resistance" — this creates space
for contemplation and prevents rushing through sacred material.

FORMULA:
weight > 0.8 → Slow Row (theological pause)
weight > 0.4 → Mid Row (balanced flow)
weight ≤ 0.4 → Fast Row (kinetic response)
"""

import asyncio
import time
from typing import Optional, Dict, Any, Callable, List
from dataclasses import dataclass, field
from enum import Enum
import logging

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# LANE DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

class LaneType(Enum):
    KINETIC = "fast_row"      # ⚡ Quick UI responses
    BALANCED = "mid_row"      # ⚖️ Standard processing
    THEOLOGICAL = "slow_row"  # 🧘 Deep contemplative content


@dataclass
class Lane:
    """A processing lane with harmonic resistance."""
    key: str
    label: str
    emoji: str
    resistance: float  # Delay in seconds
    description: str
    
    def __str__(self):
        return f"{self.emoji} {self.label}"


# The three lanes of the Enlightenment Router
LANES: Dict[str, Lane] = {
    "fast_row": Lane(
        key="fast_row",
        label="Kinetic",
        emoji="⚡",
        resistance=0.01,
        description="Instant UI responses, button clicks, refreshes"
    ),
    "mid_row": Lane(
        key="mid_row",
        label="Balanced",
        emoji="⚖️",
        resistance=0.5,
        description="Standard content flow, transitions, moderate depth"
    ),
    "slow_row": Lane(
        key="slow_row",
        label="Theological",
        emoji="🧘",
        resistance=2.5,
        description="Deep wisdom, contemplative content, sacred pauses"
    ),
}


# ═══════════════════════════════════════════════════════════════════════════════
# DATA PACKET
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class HarmonicPacket:
    """A data packet flowing through the router."""
    id: str
    content: Any
    weight: float  # 0.0 to 1.0 — determines lane selection
    source: str = "unknown"
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)
    processed_at: Optional[float] = None
    lane_used: Optional[str] = None
    
    @property
    def age_ms(self) -> float:
        """Time since packet creation in milliseconds."""
        return (time.time() - self.created_at) * 1000
    
    @property
    def processing_time_ms(self) -> Optional[float]:
        """Time spent in processing in milliseconds."""
        if self.processed_at:
            return (self.processed_at - self.created_at) * 1000
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# WEIGHT CALCULATOR
# ═══════════════════════════════════════════════════════════════════════════════

class WeightCalculator:
    """
    Calculates information weight based on content characteristics.
    Higher weight = deeper content = slower processing lane.
    """
    
    # Keywords that indicate theological/deep content
    THEOLOGICAL_KEYWORDS = {
        'theology', 'philosophical', 'meditation', 'contemplation',
        'sacred', 'divine', 'spiritual', 'wisdom', 'enlightenment',
        'being', 'essence', 'truth', 'transcendent', 'infinite',
        'chapter', 'principles', 'harmony', 'balance', 'nature',
        'soul', 'consciousness', 'awareness', 'presence', 'peace',
    }
    
    # Keywords that indicate light/kinetic content
    KINETIC_KEYWORDS = {
        'click', 'refresh', 'update', 'toggle', 'switch', 'button',
        'scroll', 'hover', 'focus', 'blur', 'resize', 'ping',
    }
    
    @classmethod
    def calculate(cls, content: str, base_weight: float = 0.5) -> float:
        """
        Calculate weight based on content analysis.
        
        Returns a value between 0.0 and 1.0.
        """
        content_lower = content.lower()
        weight = base_weight
        
        # Check for theological keywords (increases weight)
        theological_matches = sum(
            1 for kw in cls.THEOLOGICAL_KEYWORDS 
            if kw in content_lower
        )
        weight += theological_matches * 0.15
        
        # Check for kinetic keywords (decreases weight)
        kinetic_matches = sum(
            1 for kw in cls.KINETIC_KEYWORDS 
            if kw in content_lower
        )
        weight -= kinetic_matches * 0.2
        
        # Longer content tends to be weightier
        word_count = len(content.split())
        if word_count > 50:
            weight += 0.1
        elif word_count > 20:
            weight += 0.05
        elif word_count < 5:
            weight -= 0.1
        
        # Clamp to valid range
        return max(0.0, min(1.0, weight))


# ═══════════════════════════════════════════════════════════════════════════════
# THE ENLIGHTENMENT ROUTER
# ═══════════════════════════════════════════════════════════════════════════════

class EnlightenmentRouter:
    """
    Routes data packets through harmonic resistance lanes.
    
    The router applies temporal delays based on content weight,
    implementing Keith Wright's principle of slowed momentum
    for theological/deep content.
    """
    
    def __init__(self, custom_lanes: Optional[Dict[str, Lane]] = None):
        self.lanes = custom_lanes or LANES
        self.processed_count = 0
        self.total_resistance_applied = 0.0
        self._hooks: List[Callable] = []
        
        logger.info("[EnlightenmentRouter] Initialized with %d lanes", len(self.lanes))
    
    def select_lane(self, weight: float) -> Lane:
        """
        Select the appropriate lane based on weight.
        
        weight > 0.8 → Theological (slow)
        weight > 0.4 → Balanced (mid)
        weight ≤ 0.4 → Kinetic (fast)
        """
        if weight > 0.8:
            return self.lanes["slow_row"]
        elif weight > 0.4:
            return self.lanes["mid_row"]
        else:
            return self.lanes["fast_row"]
    
    async def process(
        self, 
        packet: HarmonicPacket,
        skip_resistance: bool = False
    ) -> HarmonicPacket:
        """
        Process a packet through the appropriate lane.
        
        Args:
            packet: The data packet to process
            skip_resistance: If True, bypasses the temporal delay
            
        Returns:
            The processed packet with updated metadata
        """
        # Select lane based on weight
        lane = self.select_lane(packet.weight)
        packet.lane_used = lane.key
        
        # Log routing decision
        content_preview = str(packet.content)[:30]
        logger.info(
            "[%s] Routing: '%s...' (weight=%.2f)",
            lane, content_preview, packet.weight
        )
        
        # Apply harmonic resistance (temporal pause)
        if not skip_resistance and lane.resistance > 0:
            await asyncio.sleep(lane.resistance)
            self.total_resistance_applied += lane.resistance
        
        # Mark as processed
        packet.processed_at = time.time()
        self.processed_count += 1
        
        # Log completion
        logger.info(
            "[%s] Resolved: %s (Delay: %.2fs, Total: %.1fms)",
            lane,
            content_preview[:20],
            lane.resistance,
            packet.processing_time_ms
        )
        
        # Execute hooks
        for hook in self._hooks:
            try:
                await hook(packet, lane)
            except Exception as e:
                logger.error("Hook error: %s", e)
        
        return packet
    
    async def process_data(self, content: str, weight: float) -> str:
        """
        Simplified interface for processing string content.
        
        Args:
            content: The string content to process
            weight: Information weight (0.0 to 1.0)
            
        Returns:
            The processed content string
        """
        packet = HarmonicPacket(
            id=f"pkt_{int(time.time() * 1000)}",
            content=content,
            weight=weight,
        )
        
        result = await self.process(packet)
        return result.content
    
    async def process_batch(
        self, 
        packets: List[HarmonicPacket],
        concurrent: bool = True
    ) -> List[HarmonicPacket]:
        """
        Process multiple packets.
        
        Args:
            packets: List of packets to process
            concurrent: If True, processes all concurrently
                       (slower lanes will naturally finish last)
                       
        Returns:
            List of processed packets
        """
        if concurrent:
            tasks = [self.process(p) for p in packets]
            return await asyncio.gather(*tasks)
        else:
            results = []
            for packet in packets:
                result = await self.process(packet)
                results.append(result)
            return results
    
    def add_hook(self, hook: Callable) -> None:
        """Add a post-processing hook."""
        self._hooks.append(hook)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get router statistics."""
        return {
            "processed_count": self.processed_count,
            "total_resistance_seconds": self.total_resistance_applied,
            "lanes": {
                key: {
                    "label": lane.label,
                    "resistance": lane.resistance,
                }
                for key, lane in self.lanes.items()
            }
        }


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_router_instance: Optional[EnlightenmentRouter] = None

def get_router() -> EnlightenmentRouter:
    """Get the singleton router instance."""
    global _router_instance
    if _router_instance is None:
        _router_instance = EnlightenmentRouter()
    return _router_instance


# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

def create_router_middleware():
    """
    Create FastAPI middleware that applies harmonic resistance.
    
    Usage:
        app.middleware("http")(create_router_middleware())
    """
    router = get_router()
    
    async def middleware(request, call_next):
        # Determine weight based on endpoint
        path = request.url.path
        
        # Theological endpoints get high weight
        if any(kw in path for kw in ['oracle', 'wisdom', 'meditation', 'chapter']):
            weight = 0.85
        # Standard API endpoints
        elif '/api/' in path:
            weight = 0.5
        # Static/UI endpoints
        else:
            weight = 0.2
        
        # Create packet for request
        packet = HarmonicPacket(
            id=f"req_{int(time.time() * 1000)}",
            content=path,
            weight=weight,
            source="http_request",
            metadata={"method": request.method}
        )
        
        # Process through router (apply resistance)
        await router.process(packet)
        
        # Continue with actual request handling
        response = await call_next(request)
        return response
    
    return middleware


# ═══════════════════════════════════════════════════════════════════════════════
# DEMO / TEST
# ═══════════════════════════════════════════════════════════════════════════════

async def demo():
    """Demonstrate the Enlightenment Router."""
    router = EnlightenmentRouter()
    
    # Simulating a stream of incoming data packets
    tasks = [
        router.process_data("User clicked 'Refresh'", 0.1),
        router.process_data("Theological Excerpt: On the Nature of Being", 0.9),
        router.process_data("Adjusting Ambient Light", 0.2),
        router.process_data("Chapter 4: Principles of Harmonic Flow", 0.85),
        router.process_data("Toggle void mode", 0.15),
        router.process_data("Sacred meditation on the infinite nature of consciousness", 0.95),
    ]
    
    print("═" * 60)
    print("    ENLIGHTENMENT ROUTER: Harmonic Data Stream")
    print("═" * 60)
    print()
    
    # Run all processes concurrently
    # Slower lanes will naturally finish last
    start_time = time.time()
    await asyncio.gather(*tasks)
    elapsed = time.time() - start_time
    
    print()
    print("═" * 60)
    print(f"    All Lanes Reached Equilibrium ({elapsed:.2f}s)")
    print("═" * 60)
    print()
    print("Stats:", router.get_stats())


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s"
    )
    asyncio.run(demo())
