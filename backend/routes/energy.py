from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.renewable_energy import get_energy_engine
from engines.sovereign_armor import armor_full_artifact

router = APIRouter(prefix="/energy", tags=["Renewable Energy Engine"])


class HarvestRequest(BaseModel):
    sector: str
    environmental_input: float = 1.0
    N: int = 10
    z: int = 2
    encrypted: bool = False
    armored: bool = False


class HybridComponent(BaseModel):
    sector: str
    input: float
    capacity_kw: float = 1.0


class HybridSystemRequest(BaseModel):
    components: List[HybridComponent]
    N: int = 10
    z: int = 2


class DecryptRequest(BaseModel):
    p: str
    k: str
    n: str
    t: str
    N: int = 10
    z: int = 2


@router.post("/harvest")
async def calculate_harvest(request: HarvestRequest):
    """
    Calculate energy harvest potential for a renewable sector.
    
    Environmental input represents conditions (0.0 - 2.0):
    - Solar: sun intensity
    - Wind: wind speed factor
    - Hydro: water flow rate
    - Storage: charge/discharge cycle
    """
    engine = get_energy_engine(request.N, request.z)
    
    if request.encrypted:
        result = engine.run_encrypted_scan(request.sector, request.environmental_input)
        if request.armored:
            result['armored'] = armor_full_artifact(result['encrypted'], version="rainbow", spectrum="green")
        return result
    else:
        return engine.calculate_harvest(request.sector, request.environmental_input)


@router.post("/hybrid")
async def simulate_hybrid_system(request: HybridSystemRequest):
    """
    Simulate a hybrid renewable energy system combining multiple sources.
    
    Example: Solar + Wind + Battery storage system
    """
    engine = get_energy_engine(request.N, request.z)
    components = [{"sector": c.sector, "input": c.input, "capacity_kw": c.capacity_kw} 
                  for c in request.components]
    return engine.simulate_hybrid_system(components)


@router.post("/decrypt")
async def decrypt_energy_artifact(request: DecryptRequest):
    """Decrypt an energy harvest artifact."""
    engine = get_energy_engine(request.N, request.z)
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
async def list_energy_sectors():
    """List all available renewable energy sectors."""
    engine = get_energy_engine()
    return engine.list_sectors()


@router.get("/sector/{sector_name}")
async def get_sector_info(sector_name: str, N: int = 10, z: int = 2):
    """Get detailed information about a specific energy sector."""
    engine = get_energy_engine(N, z)
    const = engine.get_sector_constant(sector_name)
    multiplier = N * z * N * z
    
    if const == 1.0 and sector_name.lower() not in engine.energy_sectors:
        raise HTTPException(
            status_code=404, 
            detail=f"Sector '{sector_name}' not found. Use /sectors to list available sectors."
        )
    
    return {
        "sector": sector_name.upper(),
        "harvest_constant": const,
        "multiplier": f"N*z*N*z = {multiplier}",
        "threshold": round(240 * (const / 1.0), 2),
        "formula": f"scaled_ri = ((env_input * {const}) / {engine.PHI}) * {multiplier} - noise",
        "scale": f"{N}x{z}"
    }


@router.get("/status")
async def engine_status(N: int = 10, z: int = 2):
    """Returns the current energy engine configuration."""
    engine = get_energy_engine(N, z)
    return {
        "status": "active",
        "engine": "RenewableEnergyEngine",
        "phi_constant": engine.PHI,
        "scale_N": N,
        "scale_z": z,
        "multiplier": N * z * N * z,
        "total_sectors": len(engine.energy_sectors),
        "sector_categories": {
            "solar": ["solar_passive", "solar_pv", "solar_concentrated", "solar_hybrid"],
            "wind": ["wind_kinetic", "wind_offshore", "wind_vertical", "wind_micro"],
            "water": ["hydro_dam", "hydro_run", "tidal", "wave"],
            "storage": ["battery_storage", "hydrogen", "pumped_hydro", "thermal_storage", "flywheel"],
            "grid": ["grid_harmony", "grid_micro", "grid_smart"],
            "emerging": ["geothermal", "biomass", "fusion"]
        },
        "phi_sectors": ["battery_storage", "fusion"]
    }
