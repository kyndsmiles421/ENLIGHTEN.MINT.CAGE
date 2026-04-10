"""
═══════════════════════════════════════════════════════════════════════════════
V-FINAL ETERNAL SENTINEL: NEXUS API ROUTES
═══════════════════════════════════════════════════════════════════════════════
The Exponential Nexus REST API — Master controller endpoints.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from utils.sentinel_nexus import sentinel_nexus

router = APIRouter(prefix="/nexus", tags=["sentinel-nexus"])


# ═══════════════════════════════════════════════════════════════════════════════
# NEXUS STATUS & MONITORING
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/status")
async def get_nexus_status():
    """
    V-FINAL SENTINEL NEXUS — STATUS
    
    Returns complete Nexus status including all module states,
    global node network, and sacred constants.
    """
    return sentinel_nexus.get_nexus_status()


@router.get("/constants")
async def get_sacred_constants():
    """
    V-FINAL SENTINEL NEXUS — SACRED CONSTANTS
    
    Returns the mathematical constants that govern the system:
    - φ (Phi): Golden Ratio
    - L² Fractal Depth
    - SEG Frequency
    - 9×9 Helix
    """
    return {
        "phi": sentinel_nexus.PHI,
        "inverse_phi": sentinel_nexus.INVERSE_PHI,
        "infinity_minus_one": "∞ - 1 (Symbolic)",
        "l2_fractal_depth": sentinel_nexus.L2_FRACTAL_DEPTH,
        "seg_frequency_hz": sentinel_nexus.SEG_FREQUENCY,
        "helix": sentinel_nexus.HELIX,
        "formula": "9 × 9^math × πr² = L² Fractal Engine",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# GLOBAL PULSE SYNCHRONIZATION
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/pulse")
async def execute_global_pulse(
    notify_phone: Optional[str] = Query(None, description="Phone for SMS notification (E.164)"),
):
    """
    V-FINAL SENTINEL NEXUS — GLOBAL PULSE
    
    Synchronizes all active nodes (Black Hills, Kona, Geneva, etc.).
    Triggers the Holographic UI Breath across the network.
    
    Calculates:
    - Nodal Resonance: (φ² / π)
    - L² Fractal Stability
    - Inverse Pressure Injection
    
    Optionally sends SMS confirmation to the provided phone number.
    """
    result = sentinel_nexus.execute_global_pulse(notify_phone)
    return result


@router.get("/pulse/history")
async def get_pulse_history(
    limit: int = Query(default=50, ge=1, le=500),
):
    """
    V-FINAL SENTINEL NEXUS — PULSE HISTORY
    
    Returns recent global pulse history.
    """
    return {
        "history": sentinel_nexus.get_pulse_history(limit),
        "total_pulses": sentinel_nexus._nexus_state["total_pulses"],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# HOLOGRAPHIC RENDER
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/render")
async def process_holographic_render(
    user_id: str = Query(default="default_user"),
    render_layer: str = Query(
        default="STANDARD",
        description="Render layer: STANDARD, PREMIUM, LEGENDARY, OMEGA"
    ),
    node_id: str = Query(default="BLACK_HILLS_V1", description="Node for prismatic calculations"),
):
    """
    V-FINAL SENTINEL NEXUS — HOLOGRAPHIC RENDER
    
    Processes the holographic UI render based on user's licenses and node location.
    
    Render Layers:
    - STANDARD: Basic crystal overlay (no license required)
    - PREMIUM: Infinity Edge + Prismatic Dispersion
    - LEGENDARY: L² Fractal + Phi Bloom
    - OMEGA: Obsidian Void + Full Telemetry
    
    Returns shader code for Three.js injection.
    """
    valid_layers = ["STANDARD", "PREMIUM", "LEGENDARY", "OMEGA"]
    if render_layer.upper() not in valid_layers:
        raise HTTPException(400, f"Invalid render layer. Must be one of: {valid_layers}")
    
    result = sentinel_nexus.process_holographic_render(
        user_id, render_layer.upper(), node_id
    )
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# ASCENSION PROTOCOL
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/ascend")
async def execute_ascension(
    user_id: str = Query(default="default_user"),
    ascension_level: int = Query(default=1, ge=1, le=4, description="Ascension level (1-4)"),
):
    """
    V-FINAL SENTINEL NEXUS — ASCENSION PROTOCOL
    
    Executes the Ascension Protocol for a user, awarding rewards.
    
    Ascension Levels:
    - Level 1 (Resonant): 50 Dust
    - Level 2 (Harmonic): 100 Dust + 10 Gems
    - Level 3 (Fractal): 200 Dust + 25 Gems
    - Level 4 (Omega): 500 Dust + 50 Gems + 1 Volunteer Hour
    """
    result = sentinel_nexus.execute_ascension_protocol(user_id, ascension_level)
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# NODE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/nodes")
async def get_global_nodes():
    """
    V-FINAL SENTINEL NEXUS — GLOBAL NODES
    
    Returns the Seven Seals nodal network status.
    """
    nodes = sentinel_nexus.GLOBAL_NODES
    active_count = sum(1 for n in nodes.values() if n["status"] == "ACTIVE")
    
    return {
        "network": "SEVEN_SEALS",
        "nodes": nodes,
        "active_count": active_count,
        "total_count": len(nodes),
        "primary_node": sentinel_nexus._nexus_state["primary_node"],
    }


@router.post("/nodes/{node_id}/activate")
async def activate_node(node_id: str):
    """
    V-FINAL SENTINEL NEXUS — ACTIVATE NODE
    
    Activates a global node in the Seven Seals network.
    """
    result = sentinel_nexus.activate_node(node_id)
    
    if result["status"] == "error":
        raise HTTPException(400, result["message"])
    
    return result


@router.post("/nodes/{node_id}/deactivate")
async def deactivate_node(node_id: str):
    """
    V-FINAL SENTINEL NEXUS — DEACTIVATE NODE
    
    Sets a node to STANDBY mode.
    Cannot deactivate the primary node (BLACK_HILLS_V1).
    """
    result = sentinel_nexus.deactivate_node(node_id)
    
    if result["status"] == "error":
        raise HTTPException(400, result["message"])
    
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# UNIFIED SYSTEM TEST
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/integration-test")
async def run_integration_test():
    """
    V-FINAL SENTINEL NEXUS — INTEGRATION TEST
    
    Runs a comprehensive test across all Nexus modules.
    """
    results = {
        "timestamp": sentinel_nexus.get_nexus_status()["timestamp"],
        "tests": {},
    }
    
    # Test 1: Nexus Status
    try:
        status = sentinel_nexus.get_nexus_status()
        results["tests"]["nexus_status"] = {
            "status": "PASS",
            "version": status["nexus"]["version"],
            "active_nodes": status["nexus"]["active_nodes"],
        }
    except Exception as e:
        results["tests"]["nexus_status"] = {"status": "FAIL", "error": str(e)}
    
    # Test 2: Comms Gate
    try:
        comms_status = sentinel_nexus.comms.get_status()
        results["tests"]["comms_gate"] = {
            "status": "PASS",
            "twilio": comms_status["twilio"]["status"],
            "sendgrid": comms_status["sendgrid"]["status"],
        }
    except Exception as e:
        results["tests"]["comms_gate"] = {"status": "FAIL", "error": str(e)}
    
    # Test 3: Physics Engine
    try:
        physics_status = sentinel_nexus.physics.get_full_status()
        results["tests"]["physics_engine"] = {
            "status": "PASS",
            "core_state": physics_status["core"]["core_state"],
            "stability": physics_status["stability"]["stability_coefficient"],
        }
    except Exception as e:
        results["tests"]["physics_engine"] = {"status": "FAIL", "error": str(e)}
    
    # Test 4: Refraction Engine
    try:
        minerals = sentinel_nexus.refraction.get_mineral_catalog()
        math_catalog = sentinel_nexus.refraction.get_math_catalog()
        results["tests"]["refraction_engine"] = {
            "status": "PASS",
            "minerals": len(minerals),
            "math_refractions": len(math_catalog),
        }
    except Exception as e:
        results["tests"]["refraction_engine"] = {"status": "FAIL", "error": str(e)}
    
    # Test 5: Sovereign Ledger
    try:
        market = sentinel_nexus.ledger.get_market_prices()
        results["tests"]["sovereign_ledger"] = {
            "status": "PASS",
            "market_items": len(market["prices"]),
            "tax_rate": market["tax_rate"],
        }
    except Exception as e:
        results["tests"]["sovereign_ledger"] = {"status": "FAIL", "error": str(e)}
    
    # Calculate overall status
    all_passed = all(t["status"] == "PASS" for t in results["tests"].values())
    results["overall"] = "ALL_SYSTEMS_OPERATIONAL" if all_passed else "PARTIAL_DEGRADATION"
    
    return results
