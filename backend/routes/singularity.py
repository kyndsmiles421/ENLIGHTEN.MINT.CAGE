from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys
sys.path.insert(0, '/app/backend')
from engines.sovereign_singularity import get_singularity_engine
from engines.sovereign_armor import armor_full_artifact

router = APIRouter(prefix="/singularity", tags=["Sovereign Singularity Engine"])


class SingularityScanRequest(BaseModel):
    sector: str
    flux_input: float = 1.0
    N: int = 10
    z: int = 2
    encrypted: bool = False
    armored: bool = False


class MultiScanItem(BaseModel):
    sector: str
    flux: float


class MultiScanRequest(BaseModel):
    scans: List[MultiScanItem]
    N: int = 10
    z: int = 2


class DecryptRequest(BaseModel):
    p: str
    k: str
    n: str
    t: str
    N: int = 10
    z: int = 2


@router.post("/scan")
async def execute_singularity_scan(request: SingularityScanRequest):
    """
    Execute singularity detection scan.
    
    Unified 21-sector matrix with elevated threshold (400) for VIOLET_SINGULARITY.
    PHI and SQRT2 sectors have highest singularity potential.
    """
    engine = get_singularity_engine(request.N, request.z)
    
    if request.encrypted:
        result = engine.run_encrypted_scan(request.sector, request.flux_input)
        if request.armored:
            result['armored'] = armor_full_artifact(result['encrypted'], version="rainbow", spectrum="violet")
        return result
    else:
        return engine.execute_singularity_scan(request.sector, request.flux_input)


@router.post("/multi")
async def execute_multi_scan(request: MultiScanRequest):
    """
    Execute multiple singularity scans for convergence analysis.
    
    Returns VIOLET_CONVERGENCE if majority reach singularity threshold.
    """
    engine = get_singularity_engine(request.N, request.z)
    scans = [{"sector": s.sector, "flux": s.flux} for s in request.scans]
    return engine.execute_multi_scan(scans)


@router.post("/decrypt")
async def decrypt_singularity_artifact(request: DecryptRequest):
    """Decrypt a singularity artifact."""
    engine = get_singularity_engine(request.N, request.z)
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


@router.get("/registry")
async def list_registry():
    """List the unified 21-sector registry with constant types."""
    engine = get_singularity_engine()
    return engine.list_registry()


@router.get("/sector/{sector_name}")
async def get_sector_info(sector_name: str, N: int = 10, z: int = 2):
    """Get detailed information about a sector in the registry."""
    engine = get_singularity_engine(N, z)
    const = engine.get_sector_constant(sector_name)
    multiplier = N * z * N * z
    
    const_type = "PHI" if const == engine.PHI else ("SQRT2" if const == engine.SQRT2 else "STANDARD")
    
    # Calculate minimum flux needed for singularity
    # 400 = ((flux * const) / PHI) * multiplier
    # flux = (400 * PHI) / (const * multiplier)
    min_flux_for_singularity = (400 * engine.PHI) / (const * multiplier)
    
    return {
        "sector": sector_name.upper(),
        "constant": const,
        "constant_type": const_type,
        "multiplier": f"N*z*N*z = {multiplier}",
        "singularity_threshold": 400,
        "min_flux_for_singularity": round(min_flux_for_singularity, 4),
        "formula": f"scaled_ri = ((flux * {const}) / {engine.PHI}) * {multiplier} - jitter",
        "scale": f"{N}x{z}"
    }


@router.get("/status")
async def engine_status(N: int = 10, z: int = 2):
    """Returns the current singularity engine configuration."""
    engine = get_singularity_engine(N, z)
    
    phi_sectors = [k for k, v in engine.registry.items() if v == engine.PHI]
    sqrt2_sectors = [k for k, v in engine.registry.items() if v == engine.SQRT2]
    
    return {
        "status": "active",
        "engine": "SovereignMagSingularity",
        "phi_constant": engine.PHI,
        "sqrt2_constant": engine.SQRT2,
        "scale_N": N,
        "scale_z": z,
        "multiplier": N * z * N * z,
        "singularity_threshold": 400,
        "total_sectors": len(engine.registry),
        "phi_sectors": phi_sectors,
        "sqrt2_sectors": sqrt2_sectors,
        "status_types": ["VIOLET_SINGULARITY", "STABLE"],
        "convergence_types": ["VIOLET_CONVERGENCE", "STABLE_MATRIX"]
    }
