"""
HARMONIC ROUTER API
===================

Exposes the Enlightenment Router for frontend consumption.

Endpoints:
- POST /api/harmonic/process - Process content through harmonic lanes
- POST /api/harmonic/batch - Process multiple items concurrently
- GET /api/harmonic/stats - Get router statistics
- GET /api/harmonic/lanes - Get available lanes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import asyncio

from engines.enlightenment_router import (
    EnlightenmentRouter,
    HarmonicPacket,
    WeightCalculator,
    LANES,
    get_router,
)

router = APIRouter(prefix="/harmonic", tags=["Harmonic Router"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class ProcessRequest(BaseModel):
    """Request to process content through the router."""
    content: str = Field(..., description="Content to process")
    weight: Optional[float] = Field(
        None, 
        ge=0.0, 
        le=1.0,
        description="Information weight (0.0-1.0). If not provided, auto-calculated."
    )
    auto_calculate_weight: bool = Field(
        True,
        description="If True and weight not provided, calculate from content"
    )
    skip_resistance: bool = Field(
        False,
        description="If True, bypass temporal delay (for testing)"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata to attach to packet"
    )


class ProcessResponse(BaseModel):
    """Response from processing."""
    id: str
    content: str
    weight: float
    lane_used: str
    lane_label: str
    lane_emoji: str
    resistance_applied: float
    processing_time_ms: float
    metadata: Dict[str, Any]


class BatchRequest(BaseModel):
    """Request to process multiple items."""
    items: List[ProcessRequest]
    concurrent: bool = Field(
        True,
        description="If True, process all concurrently (slow lanes finish last)"
    )


class BatchResponse(BaseModel):
    """Response from batch processing."""
    results: List[ProcessResponse]
    total_time_ms: float
    items_processed: int


class LaneInfo(BaseModel):
    """Information about a processing lane."""
    key: str
    label: str
    emoji: str
    resistance: float
    description: str
    weight_threshold: str


class StatsResponse(BaseModel):
    """Router statistics."""
    processed_count: int
    total_resistance_seconds: float
    lanes: Dict[str, Dict[str, Any]]


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def packet_to_response(packet: HarmonicPacket) -> ProcessResponse:
    """Convert a processed packet to API response."""
    lane = LANES.get(packet.lane_used, LANES["mid_row"])
    
    return ProcessResponse(
        id=packet.id,
        content=packet.content if isinstance(packet.content, str) else str(packet.content),
        weight=packet.weight,
        lane_used=packet.lane_used or "unknown",
        lane_label=lane.label,
        lane_emoji=lane.emoji,
        resistance_applied=lane.resistance,
        processing_time_ms=packet.processing_time_ms or 0,
        metadata=packet.metadata,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/process", response_model=ProcessResponse)
async def process_content(request: ProcessRequest):
    """
    Process content through the Harmonic Router.
    
    The router will:
    1. Calculate or use provided weight
    2. Select appropriate lane based on weight
    3. Apply harmonic resistance (temporal delay)
    4. Return processed result with lane info
    
    Weight thresholds:
    - > 0.8: Theological (🧘 2.5s delay)
    - > 0.4: Balanced (⚖️ 0.5s delay)
    - ≤ 0.4: Kinetic (⚡ 0.01s delay)
    """
    harmony_router = get_router()
    
    # Determine weight
    if request.weight is not None:
        weight = request.weight
    elif request.auto_calculate_weight:
        weight = WeightCalculator.calculate(request.content)
    else:
        weight = 0.5  # Default balanced
    
    # Create packet
    packet = HarmonicPacket(
        id=f"api_{int(time.time() * 1000)}",
        content=request.content,
        weight=weight,
        source="api",
        metadata=request.metadata,
    )
    
    # Process through router
    result = await harmony_router.process(packet, skip_resistance=request.skip_resistance)
    
    return packet_to_response(result)


@router.post("/batch", response_model=BatchResponse)
async def process_batch(request: BatchRequest):
    """
    Process multiple items through the Harmonic Router.
    
    When concurrent=True (default), all items start processing simultaneously.
    Kinetic items will complete almost instantly, while Theological items
    will take longer due to their natural resistance.
    
    This creates a beautiful cascade effect where quick interactions
    respond immediately, while deep content takes its proper time.
    """
    harmony_router = get_router()
    start_time = time.time()
    
    # Create packets
    packets = []
    for item in request.items:
        if item.weight is not None:
            weight = item.weight
        elif item.auto_calculate_weight:
            weight = WeightCalculator.calculate(item.content)
        else:
            weight = 0.5
        
        packet = HarmonicPacket(
            id=f"batch_{int(time.time() * 1000)}_{len(packets)}",
            content=item.content,
            weight=weight,
            source="api_batch",
            metadata=item.metadata,
        )
        packets.append(packet)
    
    # Process all packets
    results = await harmony_router.process_batch(packets, concurrent=request.concurrent)
    
    elapsed_ms = (time.time() - start_time) * 1000
    
    return BatchResponse(
        results=[packet_to_response(p) for p in results],
        total_time_ms=elapsed_ms,
        items_processed=len(results),
    )


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """
    Get router statistics.
    
    Returns:
    - Total packets processed
    - Total resistance time applied
    - Lane configurations
    """
    harmony_router = get_router()
    stats = harmony_router.get_stats()
    
    return StatsResponse(**stats)


@router.get("/lanes", response_model=List[LaneInfo])
async def get_lanes():
    """
    Get information about available processing lanes.
    
    Each lane has:
    - Resistance (temporal delay in seconds)
    - Weight threshold for selection
    - Description of typical content
    """
    return [
        LaneInfo(
            key=lane.key,
            label=lane.label,
            emoji=lane.emoji,
            resistance=lane.resistance,
            description=lane.description,
            weight_threshold="≤ 0.4" if lane.key == "fast_row" 
                           else "> 0.4 and ≤ 0.8" if lane.key == "mid_row"
                           else "> 0.8"
        )
        for lane in LANES.values()
    ]


@router.post("/calculate-weight")
async def calculate_weight(content: str):
    """
    Calculate the information weight for given content.
    
    This uses keyword analysis to determine if content is:
    - Kinetic (UI interactions, light data)
    - Balanced (standard content)
    - Theological (deep, contemplative content)
    """
    weight = WeightCalculator.calculate(content)
    lane = get_router().select_lane(weight)
    
    return {
        "content_preview": content[:50] + "..." if len(content) > 50 else content,
        "calculated_weight": weight,
        "selected_lane": lane.key,
        "lane_label": f"{lane.emoji} {lane.label}",
        "resistance": lane.resistance,
    }
