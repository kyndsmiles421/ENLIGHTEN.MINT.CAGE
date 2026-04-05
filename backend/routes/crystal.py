"""
CRYSTAL API: Central Crystal & Sovereign Interface Routes
==========================================================

Exposes the Central Crystal system for frontend consumption.

ARCHITECTURE:
┌────────────────────────────────────────────────────────────┐
│                      Frontend                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Pulse Button│  │ Source Cards│  │ State HUD   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │               │
│         ▼                ▼                ▼               │
│  ┌──────────────────────────────────────────────────┐    │
│  │              /api/crystal/* routes               │    │
│  └──────────────────────────────────────────────────┘    │
│         │                │                │               │
│         ▼                ▼                ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Guardrail   │──│   Crystal    │──│   Router     │    │
│  │ (Filter)     │  │ (State)      │  │ (Delay)      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘

Endpoints:
- GET /api/crystal/state - Get current crystal state
- GET /api/crystal/sources - Get available sources
- POST /api/crystal/pulse - Pulse to a new target (with guardrail)
- POST /api/crystal/instant - Instant shift (no transition)
- GET /api/crystal/history - Get transition history
- POST /api/crystal/reset - Reset to Void state
- GET /api/crystal/guardrail/stats - Get guardrail statistics
- POST /api/crystal/guardrail/analyze - Analyze text intent
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import asyncio
import logging

from engines.central_crystal import (
    CentralCrystal,
    SovereignInterface,
    TransitionState,
    CrystalSource,
    DEFAULT_SOURCES,
    get_crystal,
    get_interface,
)
from engines.harmonic_guardrail import (
    HarmonicGuardrail,
    GuardrailResult,
    ResonanceState,
    get_guardrail,
)
from engines.enlightenment_router import get_router as get_harmony_router

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crystal", tags=["Central Crystal"])


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class SourceInfo(BaseModel):
    """Information about a crystal source."""
    id: str
    label: str
    emoji: str
    color: str
    frequency: float
    resistance: float
    description: str
    is_active: bool = False


class CrystalState(BaseModel):
    """Current state of the crystal."""
    frequency: float
    active_module: str
    is_transitioning: bool
    torque: float = 0.0  # Spiral gravitation for 3D lattice
    source_info: Optional[Dict[str, Any]] = None
    transition: Optional[Dict[str, Any]] = None


class PulseRequest(BaseModel):
    """Request to pulse to a new source."""
    target: str = Field(..., description="Target source name or custom name")
    frequency: Optional[float] = Field(None, description="Override frequency")
    resistance: Optional[float] = Field(None, description="Override resistance")
    intent: Optional[str] = Field(
        None, 
        description="User intent (for guardrail analysis)"
    )
    skip_guardrail: bool = Field(False, description="Skip intent analysis")
    skip_resistance: bool = Field(False, description="Skip temporal delay")


class PulseResponse(BaseModel):
    """Response from a pulse operation."""
    success: bool
    status: str = "ALIGNED"  # GROUNDED, ALIGNED, ELEVATED
    message: str
    from_source: str
    to_source: str
    from_frequency: float
    to_frequency: float
    steps: int
    duration_seconds: float
    seed: Optional[str] = None  # 72-bit commemorative seed
    max_torque: float = 0.0  # Peak spiral gravitation
    guardrail_result: Optional[Dict[str, Any]] = None


class InstantShiftRequest(BaseModel):
    """Request for instant shift (no transition)."""
    target: str
    frequency: Optional[float] = None


class GuardrailAnalyzeRequest(BaseModel):
    """Request to analyze text through guardrail."""
    text: str = Field(..., min_length=1)


class GuardrailAnalyzeResponse(BaseModel):
    """Response from guardrail analysis."""
    allowed: bool
    state: str
    resonance: float
    message: str
    grounded_reason: Optional[str] = None
    harmony_detected: List[str]
    dissonance_detected: List[str]


# ═══════════════════════════════════════════════════════════════════════════════
# CRYSTAL STATE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/state", response_model=CrystalState)
async def get_state():
    """
    Get the current state of the Central Crystal.
    
    Returns the current frequency, active module, and any
    ongoing transition information.
    """
    crystal = get_crystal()
    state = crystal.get_state()
    return CrystalState(**state)


@router.get("/sources", response_model=List[SourceInfo])
async def get_sources():
    """
    Get all available crystal sources.
    
    Each source has:
    - Frequency: The resonance frequency in Hz
    - Resistance: Time factor for transitions (higher = slower)
    - Description: What this source represents
    """
    interface = get_interface()
    buttons = interface.get_source_buttons()
    
    return [
        SourceInfo(**btn)
        for btn in buttons
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PULSE ENDPOINTS (Core Functionality)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/pulse", response_model=PulseResponse)
async def pulse_to_target(request: PulseRequest, background_tasks: BackgroundTasks):
    """
    THE HARMONIC PULL: Pulse the crystal toward a new target.
    
    This is the core operation of the Central Crystal. It:
    1. Analyzes user intent through the Harmonic Guardrail (optional)
    2. Calculates transition steps based on resistance
    3. Gradually shifts frequency toward the target
    4. Records transition in history
    
    The resistance determines how many steps (and how long) the
    transition takes. Higher resistance = slower, more contemplative
    transitions (Keith Wright's principle).
    """
    crystal = get_crystal()
    guardrail = get_guardrail()
    
    guardrail_result = None
    
    # Step 1: Guardrail analysis (if intent provided and not skipped)
    if request.intent and not request.skip_guardrail:
        gr = await guardrail.analyze_intent(request.intent)
        guardrail_result = gr.to_dict()
        
        if not gr.allowed:
            logger.warning(
                "[Crystal API] Pulse BLOCKED by Guardrail: %s (resonance=%.2f)",
                request.intent[:30], gr.resonance
            )
            return PulseResponse(
                success=False,
                status="GROUNDED",
                message=gr.message,
                from_source=crystal.active_module,
                to_source=request.target,
                from_frequency=crystal.current_frequency,
                to_frequency=0.0,
                steps=0,
                duration_seconds=0.0,
                seed=None,
                max_torque=0.0,
                guardrail_result=guardrail_result,
            )
    
    # Determine status based on guardrail resonance
    status = "ALIGNED"
    if guardrail_result:
        if guardrail_result.get("resonance", 0.5) >= 0.8:
            status = "ELEVATED"
    
    # Step 2: Execute the pulse
    start_time = time.time()
    from_source = crystal.active_module
    from_freq = crystal.current_frequency
    
    # Calculate max torque for this resistance
    source = crystal.sources.get(request.target)
    resistance = request.resistance or (source.resistance if source else 1.0)
    max_torque = resistance * 100  # Peak torque at progress=0.5 (sin(π/2)=1)
    
    try:
        transition = await crystal.pulse_to_target(
            target_name=request.target,
            target_freq=request.frequency,
            resistance=request.resistance,
            emit_events=True,
        )
        
        duration = time.time() - start_time
        
        return PulseResponse(
            success=True,
            status=status,
            message=f"Crystal locked into {request.target} Source",
            from_source=from_source,
            to_source=transition.to_source,
            from_frequency=from_freq,
            to_frequency=transition.to_frequency,
            steps=transition.total_steps,
            duration_seconds=duration,
            seed=transition.seed,
            max_torque=max_torque,
            guardrail_result=guardrail_result,
        )
        
    except Exception as e:
        logger.error("[Crystal API] Pulse failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/instant")
async def instant_shift(request: InstantShiftRequest):
    """
    Instantly shift to a new source without transition animation.
    
    Use this for:
    - Emergency resets
    - Quick UI updates
    - Bypassing contemplative delays when needed
    
    Note: This skips the guardrail entirely.
    """
    crystal = get_crystal()
    
    from_source = crystal.active_module
    from_freq = crystal.current_frequency
    
    crystal.instant_shift(request.target, request.frequency)
    
    return {
        "success": True,
        "message": f"Instant shift to {request.target}",
        "from_source": from_source,
        "to_source": request.target,
        "from_frequency": from_freq,
        "to_frequency": crystal.current_frequency,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# HISTORY & RESET
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/history")
async def get_history(limit: int = 20):
    """
    Get the crystal's transition history.
    
    Shows the journey the crystal has taken through various
    sources, including timestamps and durations.
    """
    crystal = get_crystal()
    history = crystal.get_history(limit)
    
    return {
        "history": history,
        "count": len(history),
    }


@router.post("/reset")
async def reset_crystal():
    """
    Reset the crystal to Void state.
    
    This is the "Emergency Shut-Off" for the crystal -
    returns it to frequency 0.0 and the Void module.
    """
    crystal = get_crystal()
    
    from_source = crystal.active_module
    from_freq = crystal.current_frequency
    
    crystal.reset()
    
    return {
        "success": True,
        "message": "Crystal reset to Void",
        "from_source": from_source,
        "from_frequency": from_freq,
        "to_source": "Void",
        "to_frequency": 0.0,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# GUARDRAIL ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/guardrail/analyze", response_model=GuardrailAnalyzeResponse)
async def analyze_intent(request: GuardrailAnalyzeRequest):
    """
    Analyze text intent through the Harmonic Guardrail.
    
    This is a standalone endpoint for testing/debugging
    the guardrail without triggering a crystal pulse.
    
    Returns:
    - allowed: Whether the signal would be allowed through
    - state: GROUNDED, ALIGNED, or ELEVATED
    - resonance: Intent frequency (0.0 to 1.0)
    - harmony/dissonance patterns detected
    """
    guardrail = get_guardrail()
    result = await guardrail.analyze_intent(request.text)
    
    return GuardrailAnalyzeResponse(
        allowed=result.allowed,
        state=result.state.value,
        resonance=result.resonance,
        message=result.message,
        grounded_reason=result.grounded_reason,
        harmony_detected=result.harmony_detected,
        dissonance_detected=result.dissonance_detected,
    )


@router.get("/guardrail/stats")
async def get_guardrail_stats():
    """
    Get statistics from the Harmonic Guardrail.
    
    Shows how many signals have been analyzed, grounded,
    aligned, or elevated.
    """
    guardrail = get_guardrail()
    return guardrail.get_stats()


# ═══════════════════════════════════════════════════════════════════════════════
# COMBINED INTERFACE ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/interface")
async def get_interface_state():
    """
    Get the complete interface state for the frontend.
    
    Returns everything needed to render the Sovereign Interface:
    - Current crystal state
    - All source buttons with active status
    - Guardrail stats
    - Harmony router stats
    """
    interface = get_interface()
    guardrail = get_guardrail()
    harmony_router = get_harmony_router()
    
    state = interface.get_current_state()
    
    return {
        "crystal": state["crystal"],
        "buttons": state["buttons"],
        "guardrail": guardrail.get_stats(),
        "router": harmony_router.get_stats(),
    }
