from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.universal_industry import get_industry_engine
from engines.sovereign_armor import armor_full_artifact

router = APIRouter(prefix="/industry", tags=["Universal Industry Engine"])


class IndustryScanRequest(BaseModel):
    sector: str
    sensor_input: float = 1.0
    N: int = 10
    z: int = 2
    encrypted: bool = False
    armored: bool = False


class BatchScanItem(BaseModel):
    sector: str
    sensor: float


class BatchScanRequest(BaseModel):
    scans: List[BatchScanItem]
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
async def run_industry_scan(request: IndustryScanRequest):
    """
    Run a sector-specific refraction analysis.
    
    Sectors include: welding, masonry, aviation, space, medical, nuclear, quantum, ai, etc.
    Each sector has a unique resistance constant affecting the RI calculation.
    """
    engine = get_industry_engine(request.N, request.z)
    
    if request.encrypted:
        result = engine.run_encrypted_scan(request.sector, request.sensor_input)
        if request.armored:
            result['armored'] = armor_full_artifact(result['encrypted'], version="rainbow", spectrum="violet")
        return result
    else:
        return engine.run_refraction(request.sector, request.sensor_input)


@router.post("/batch")
async def run_batch_scan(request: BatchScanRequest):
    """
    Run multiple sector scans in a single request.
    """
    engine = get_industry_engine(request.N, request.z)
    scans = [{"sector": s.sector, "sensor": s.sensor} for s in request.scans]
    results = engine.batch_scan(scans)
    
    summary = {
        "stable": sum(1 for r in results if r["status"] == "VIOLET_STABLE"),
        "shift": sum(1 for r in results if r["status"] == "RAINBOW_SHIFT")
    }
    
    return {
        "total_scans": len(results),
        "summary": summary,
        "scale": f"{request.N}x{request.z}",
        "results": results
    }


@router.post("/decrypt")
async def decrypt_industry_artifact(request: DecryptRequest):
    """
    Decrypt an industry scan artifact.
    """
    engine = get_industry_engine(request.N, request.z)
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
async def list_sectors(N: int = 10, z: int = 2):
    """
    List all available industry sectors with their resistance constants.
    """
    engine = get_industry_engine(N, z)
    return engine.list_sectors()


@router.get("/sector/{sector_name}")
async def get_sector_info(sector_name: str, N: int = 10, z: int = 2):
    """
    Get detailed information about a specific sector.
    """
    engine = get_industry_engine(N, z)
    const = engine.get_sector_constant(sector_name)
    multiplier = N * z * N * z
    
    if const == 1.0 and sector_name.lower() not in engine.sectors:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_name}' not found. Use /sectors to list available sectors.")
    
    return {
        "sector": sector_name.upper(),
        "resistance_constant": const,
        "multiplier": f"N*z*N*z = {multiplier}",
        "threshold": round(240 * (const / 1.0), 2),
        "formula": f"scaled_ri = ((sensor * {const}) / {engine.PHI}) * {multiplier} - noise",
        "scale": f"{N}x{z}"
    }


@router.get("/status")
async def engine_status(N: int = 10, z: int = 2):
    """
    Returns the current industry engine configuration.
    """
    engine = get_industry_engine(N, z)
    return {
        "status": "active",
        "engine": "UniversalIndustryEngine",
        "phi_constant": engine.PHI,
        "scale_N": N,
        "scale_z": z,
        "multiplier": N * z * N * z,
        "total_sectors": len(engine.sectors),
        "sector_categories": {
            "construction": ["welding", "masonry", "carpentry", "plumbing", "electrical", "hvac"],
            "heavy_industry": ["steel", "concrete", "glass"],
            "aerospace": ["aviation", "space", "submarine", "defense"],
            "biomedical": ["medical", "pharmaceutical", "prosthetics"],
            "energy": ["nuclear", "solar", "wind", "hydro"],
            "digital": ["quantum", "cyber", "ai"]
        }
    }
