"""
═══════════════════════════════════════════════════════════════════════════════
⚡ L² FRACTAL RESONANCE GENERATOR: API ROUTES
═══════════════════════════════════════════════════════════════════════════════
The Heart of the SovereignHub — System-Wide Coherence Generator
"""

from fastapi import APIRouter, Query, HTTPException, BackgroundTasks
from typing import Optional
from utils.omni_generator import omni_generator

router = APIRouter(prefix="/generator", tags=["l2-fractal-generator"])


# ═══════════════════════════════════════════════════════════════════════════════
# GENERATOR STATUS & SYNC
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/status")
async def get_generator_status():
    """
    ⚡ L² GENERATOR — STATUS
    
    Returns complete generator status including:
    - Thermal efficiency (LOX superconductivity)
    - Economic thrust (Aether Fund)
    - Community pulse (volunteer credits)
    - System coherence level
    - Sector breakdown
    """
    return omni_generator.get_generator_status()


@router.post("/sync")
async def sync_all_components():
    """
    ⚡ L² GENERATOR — MASTER SYNC
    
    The Master Handshake: Connects every module to the Generator.
    
    Checks:
    1. Physics: LOX cooling status
    2. Economics: Aether Fund fuel level
    3. Nodal: Seven Seals synchronization
    
    Formula: Output = (φ × Stability) × Efficiency × Nodal Load
    """
    return omni_generator.sync_all_components()


@router.post("/pulse")
async def execute_omni_pulse():
    """
    ⚡ L² GENERATOR — OMNI-PULSE
    
    Distributes the Generator Output back to the Nodal Network.
    
    Calculates resonance yield using:
    L² = (Thermal × Economic × Community) / π
    """
    return omni_generator.execute_omni_pulse()


# ═══════════════════════════════════════════════════════════════════════════════
# MIXER INJECTION
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/inject-mixer")
async def inject_to_mixer():
    """
    ⚡ L² GENERATOR — MIXER INJECTION
    
    Feeds the Generator output back into the UI Mixer V27.0.
    
    The Crystal Rainbow intensity is tied to the Generator Output:
    - OMEGA_LIQUID_LIGHT: Output > 1.5
    - LEGENDARY_CRYSTAL: Output > 1.0
    - PREMIUM_REFRACTION: Output > 0.5
    - STANDARD_QUARTZ: Default
    """
    return omni_generator.inject_to_mixer()


# ═══════════════════════════════════════════════════════════════════════════════
# SECTOR MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/sectors")
async def get_sector_dashboard():
    """
    ⚡ L² GENERATOR — SECTOR DASHBOARD
    
    Returns all sectors with their weights, contributions, and status:
    - CULINARY (25%): Professional Cooking & Cottage Food
    - ENGINEERING (30%): LOX Cooling & Superconductivity
    - ECONOMY (25%): Aether Fund & Math Tax
    - ADVOCACY (20%): Community Engagement & Volunteers
    """
    return omni_generator.get_sector_dashboard()


@router.post("/sectors/update")
async def update_sector_status(
    sector: str = Query(..., description="Sector: CULINARY, ENGINEERING, ECONOMY, ADVOCACY"),
    status: str = Query(..., description="Status: ACTIVE, STABLE, SYNCED, DEGRADED, OFFLINE"),
):
    """
    ⚡ L² GENERATOR — UPDATE SECTOR
    
    Update the operational status of a specific sector.
    
    Valid Sectors: CULINARY, ENGINEERING, ECONOMY, ADVOCACY
    Valid Statuses: ACTIVE, STABLE, SYNCED, DEGRADED, OFFLINE
    """
    result = omni_generator.update_sector_status(sector, status)
    
    if result.get("status") == "error":
        raise HTTPException(400, result["message"])
    
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# AUTONOMOUS HEARTBEAT
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/heartbeat")
async def execute_heartbeat_cycle(
    cycles: int = Query(default=3, ge=1, le=10, description="Number of cycles to execute"),
):
    """
    ⚡ L² GENERATOR — HEARTBEAT CYCLE
    
    Execute the autonomous heartbeat cycle.
    
    Each cycle:
    1. Stabilizes thermal (engineering)
    2. Generates resonance (omni-output)
    3. Injects to mixer (UI update)
    
    Normal rhythm: φ × 10 = 16.18 seconds per cycle
    """
    results = await omni_generator.autonomous_heartbeat_cycle(cycles)
    return {
        "cycles_executed": len(results),
        "total_cycle_count": omni_generator._cycle_count,
        "results": results,
    }


@router.post("/heartbeat/stop")
async def stop_heartbeat():
    """
    ⚡ L² GENERATOR — STOP HEARTBEAT
    
    Stops the autonomous heartbeat cycle.
    """
    return omni_generator.stop_heartbeat()


# ═══════════════════════════════════════════════════════════════════════════════
# VOLUMETRIC DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/dashboard/volumetric")
async def get_volumetric_dashboard(user_id: str = Query(default="default_user")):
    """
    ⚡ L² GENERATOR — VOLUMETRIC DASHBOARD
    
    Get the 3D Volumetric Dashboard configuration for Three.js rendering.
    
    Telemetry Layers:
    - Thermal Core: Blue-white sphere (LOX loop at -183°C)
    - Equity Pulse: Golden φ spiral (Aether Fund)
    - Nodal Web: 3D map of Seven Seals with tax flow lines (38.2%)
    
    Target: 120 FPS WebGL Volumetric Rendering
    """
    return omni_generator.get_volumetric_dashboard(user_id)


# ═══════════════════════════════════════════════════════════════════════════════
# COHERENCE CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/coherence/calculate")
async def calculate_coherence():
    """
    ⚡ L² GENERATOR — CALCULATE COHERENCE
    
    Recalculate system-wide coherence.
    
    Formula: L² = (Thermal × Economic × Community) / π
    
    Returns the resonance yield in Φ-Units.
    """
    yield_val = omni_generator.calculate_system_coherence()
    return {
        "resonance_yield": round(yield_val, 6),
        "unit": "Φ-Units",
        "formula": "L² = (T × E × C) / π",
        "components": {
            "thermal_efficiency": omni_generator._generator_state["thermal_efficiency"],
            "economic_thrust": omni_generator._generator_state["economic_thrust"],
            "community_pulse": omni_generator._generator_state["community_pulse"],
        },
        "coherence_level": f"{omni_generator._generator_state['coherence_level']:.2f}%",
        "entropy": omni_generator._generator_state["system_entropy"],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# PULSE HISTORY
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/pulse/history")
async def get_pulse_history(
    limit: int = Query(default=50, ge=1, le=500),
):
    """
    ⚡ L² GENERATOR — PULSE HISTORY
    
    Returns recent pulse execution history.
    """
    return {
        "history": omni_generator.get_pulse_history(limit),
        "total_cycles": omni_generator._cycle_count,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# FORMULA REFERENCE
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/formulas")
async def get_generator_formulas():
    """
    ⚡ L² GENERATOR — FORMULA REFERENCE
    
    Returns all mathematical formulas used by the generator.
    """
    return {
        "primary_formula": {
            "name": "L² Coherence",
            "equation": "L² = (T × E × C) / π",
            "components": {
                "T": "Thermal Efficiency (LOX @ -183°C = 1.0)",
                "E": "Economic Thrust (Equity / Baseline × φ)",
                "C": "Community Pulse (Resonance × (1 + Credits/1000))",
            },
        },
        "secondary_formula": {
            "name": "Generator Output",
            "equation": "Output = (φ × Stability) × Efficiency × Nodal Load",
        },
        "constants": {
            "phi": omni_generator.PHI,
            "resonance": omni_generator.RESONANCE,
            "pi": 3.141592653589793,
            "lox_critical_temp": omni_generator.LOX_CRITICAL_TEMP,
            "baseline_equity": omni_generator.BASELINE_EQUITY,
        },
        "sector_weights": omni_generator.SECTORS,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# INTEGRATION TEST
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/integration-test")
async def generator_integration_test():
    """
    ⚡ L² GENERATOR — INTEGRATION TEST
    
    Runs comprehensive test across all generator systems.
    """
    results = {
        "timestamp": omni_generator.get_generator_status()["timestamp"],
        "tests": {},
    }
    
    # Test 1: Generator Status
    try:
        status = omni_generator.get_generator_status()
        results["tests"]["generator_status"] = {
            "status": "PASS",
            "version": status["generator"]["version"],
            "is_superconducting": status["generator"]["is_superconducting"],
            "coherence": f"{status['generator']['coherence_level']:.2f}%",
        }
    except Exception as e:
        results["tests"]["generator_status"] = {"status": "FAIL", "error": str(e)}
    
    # Test 2: Master Sync
    try:
        sync = omni_generator.sync_all_components()
        results["tests"]["master_sync"] = {
            "status": "PASS",
            "system_sync": sync["system_sync"],
            "output_resonance": sync["output_resonance"],
        }
    except Exception as e:
        results["tests"]["master_sync"] = {"status": "FAIL", "error": str(e)}
    
    # Test 3: Omni Pulse
    try:
        pulse = omni_generator.execute_omni_pulse()
        results["tests"]["omni_pulse"] = {
            "status": "PASS",
            "pulse_id": pulse["pulse_id"],
            "yield": pulse["yield"],
            "lox_status": pulse["lox_status"],
        }
    except Exception as e:
        results["tests"]["omni_pulse"] = {"status": "FAIL", "error": str(e)}
    
    # Test 4: Mixer Injection
    try:
        mixer = omni_generator.inject_to_mixer()
        results["tests"]["mixer_injection"] = {
            "status": "PASS",
            "prismatic_mode": mixer["prismatic_mode"],
            "intensity": mixer["prismatic_intensity"],
        }
    except Exception as e:
        results["tests"]["mixer_injection"] = {"status": "FAIL", "error": str(e)}
    
    # Test 5: Sector Dashboard
    try:
        sectors = omni_generator.get_sector_dashboard()
        results["tests"]["sector_dashboard"] = {
            "status": "PASS",
            "active_sectors": sectors["active_sectors"],
            "coherence": sectors["system_coherence"],
        }
    except Exception as e:
        results["tests"]["sector_dashboard"] = {"status": "FAIL", "error": str(e)}
    
    # Calculate overall status
    all_passed = all(t["status"] == "PASS" for t in results["tests"].values())
    results["overall"] = "GENERATOR_OPERATIONAL" if all_passed else "PARTIAL_COHERENCE"
    
    return results
