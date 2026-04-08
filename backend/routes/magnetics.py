from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.magnetics_sovereign import get_magnetics_engine
from engines.sovereign_armor import armor_full_artifact

router = APIRouter(prefix="/magnetics", tags=["Magnetics Sovereign Engine"])


class FluxScanRequest(BaseModel):
    sector: str
    flux_input: float = 1.0
    N: int = 10
    z: int = 2
    encrypted: bool = False
    armored: bool = False


class FieldComponent(BaseModel):
    sector: str
    flux: float
    tesla: float = 1.0


class FieldArrayRequest(BaseModel):
    components: List[FieldComponent]
    N: int = 10
    z: int = 2


class DecryptRequest(BaseModel):
    p: str
    k: str
    n: str
    t: str
    N: int = 10
    z: int = 2


@router.post("/flux")
async def execute_flux_scan(request: FluxScanRequest):
    """
    Execute magnetic flux coherence scan.
    
    Flux input represents Tesla-normalized magnetic field density.
    Status: MAGNETIC_COHERENCE (stable) or FLUX_LEAKAGE (unstable)
    """
    engine = get_magnetics_engine(request.N, request.z)
    
    if request.encrypted:
        result = engine.run_encrypted_scan(request.sector, request.flux_input)
        if request.armored:
            result['armored'] = armor_full_artifact(result['encrypted'], version="rainbow", spectrum="blue")
        return result
    else:
        return engine.execute_flux_scan(request.sector, request.flux_input)


@router.post("/array")
async def simulate_field_array(request: FieldArrayRequest):
    """
    Simulate a multi-component magnetic field array.
    
    Example: Tokamak with toroidal + plasma containment fields
    """
    engine = get_magnetics_engine(request.N, request.z)
    components = [{"sector": c.sector, "flux": c.flux, "tesla": c.tesla} 
                  for c in request.components]
    return engine.simulate_field_array(components)


@router.post("/decrypt")
async def decrypt_magnetics_artifact(request: DecryptRequest):
    """Decrypt a magnetic flux artifact."""
    engine = get_magnetics_engine(request.N, request.z)
    encrypted = {
        "p": request.p,
        "k": request.k,
        "n": request.n,
        "t": request.t
    }
    result = engine.decrypt_artifact(encrypted)
    
    if result.get("status") == "DECRYPTION_FAILED":
        raise HTTPException(status_code=400, detail=result)
    
    return result


@router.get("/sectors")
async def list_magnetic_sectors():
    """List all available magnetic sectors."""
    engine = get_magnetics_engine()
    return engine.list_sectors()


@router.get("/sector/{sector_name}")
async def get_sector_info(sector_name: str, N: int = 10, z: int = 2):
    """Get detailed information about a specific magnetic sector."""
    engine = get_magnetics_engine(N, z)
    const = engine.get_sector_constant(sector_name)
    multiplier = N * z * N * z
    
    if const == 1.0 and sector_name.lower() not in engine.sectors:
        raise HTTPException(
            status_code=404, 
            detail=f"Sector '{sector_name}' not found. Use /sectors to list available sectors."
        )
    
    return {
        "sector": sector_name.upper(),
        "magnetic_constant": const,
        "multiplier": f"N*z*N*z = {multiplier}",
        "threshold": round(250 * (const / 1.0), 2),
        "formula": f"scaled_ri = ((flux * {const}) / {engine.PHI}) * {multiplier} - noise",
        "scale": f"{N}x{z}"
    }


@router.get("/status")
async def engine_status(N: int = 10, z: int = 2):
    """Returns the current magnetics engine configuration."""
    engine = get_magnetics_engine(N, z)
    return {
        "status": "active",
        "engine": "MagneticsSovereignEngine",
        "phi_constant": engine.PHI,
        "scale_N": N,
        "scale_z": z,
        "multiplier": N * z * N * z,
        "total_sectors": len(engine.sectors),
        "sector_categories": {
            "toroidal": ["toroidal_flux", "toroidal_plasma", "tokamak"],
            "induction": ["induction_kinetic", "induction_resonant", "wireless_power"],
            "levitation": ["diamagnetic_lev", "superconducting_lev", "maglev_transport"],
            "bioelectromagnetics": ["bio_magnetics", "neural_stim", "cardiac_rhythm", "healing_pemf"],
            "industrial": ["motor_efficiency", "generator_output", "transformer_core"],
            "advanced": ["particle_beam", "mri_imaging", "quantum_spin", "antimatter_trap"]
        },
        "phi_sectors": ["toroidal_flux", "tokamak", "antimatter_trap"],
        "sqrt2_sectors": ["superconducting_lev", "quantum_spin"]
    }
