from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys
sys.path.insert(0, '/app/backend')
from engines.omni_vitality import get_omni_engine
from engines.sovereign_armor import armor_full_artifact

router = APIRouter(prefix="/omni", tags=["Omni Vitality Engine"])


class VitalityStreamRequest(BaseModel):
    module: str
    input_data: float = 1.0
    N: int = 10
    z: int = 2
    encrypted: bool = False
    armored: bool = False


class LifecycleStream(BaseModel):
    module: str
    input: float


class LifecycleMatrixRequest(BaseModel):
    streams: List[LifecycleStream]
    N: int = 10
    z: int = 2


class DecryptRequest(BaseModel):
    p: str
    k: str
    n: str
    t: str
    N: int = 10
    z: int = 2


@router.post("/stream")
async def process_vitality_stream(request: VitalityStreamRequest):
    """
    Process vitality stream through lifecycle nodule.
    
    Covers foundational sciences, clinical applications, developmental stages,
    community dynamics, cognitive functions, and transpersonal dimensions.
    """
    engine = get_omni_engine(request.N, request.z)
    
    if request.encrypted:
        result = engine.run_encrypted_stream(request.module, request.input_data)
        if request.armored:
            result['armored'] = armor_full_artifact(result['encrypted'], version="rainbow", spectrum="indigo")
        return result
    else:
        return engine.process_vitality_stream(request.module, request.input_data)


@router.post("/matrix")
async def process_lifecycle_matrix(request: LifecycleMatrixRequest):
    """
    Process multiple vitality streams across the lifecycle matrix.
    
    Returns OMNI_COHERENCE if majority reach resonance threshold.
    """
    engine = get_omni_engine(request.N, request.z)
    streams = [{"module": s.module, "input": s.input} for s in request.streams]
    return engine.process_lifecycle_matrix(streams)


@router.post("/decrypt")
async def decrypt_vitality_artifact(request: DecryptRequest):
    """Decrypt a vitality artifact."""
    engine = get_omni_engine(request.N, request.z)
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


@router.get("/nodules")
async def list_nodules():
    """List all available lifecycle nodules with categories."""
    engine = get_omni_engine()
    return engine.list_nodules()


@router.get("/nodule/{nodule_name}")
async def get_nodule_info(nodule_name: str, N: int = 10, z: int = 2):
    """Get detailed information about a specific lifecycle nodule."""
    engine = get_omni_engine(N, z)
    const = engine.get_nodule_constant(nodule_name)
    multiplier = N * z * N * z
    
    const_type = "PHI" if const == engine.PHI else ("SQRT2" if const == engine.SQRT2 else "STANDARD")
    threshold = 400 * (const / 1.25)
    min_input = (threshold * engine.PHI) / (const * multiplier)
    
    return {
        "nodule": nodule_name.upper(),
        "constant": const,
        "constant_type": const_type,
        "multiplier": f"N*z*N*z = {multiplier}",
        "threshold": round(threshold, 2),
        "min_input_for_resonance": round(min_input, 4),
        "formula": f"scaled_ri = ((input * {const}) / {engine.PHI}) * {multiplier} - jitter",
        "scale": f"{N}x{z}"
    }


@router.get("/generational")
async def generational_comparison(input_data: float = 1.0, N: int = 10, z: int = 2):
    """
    Compare vitality across generational nodules.
    
    Runs simultaneous scans across child, adult, and elderly modules.
    """
    engine = get_omni_engine(N, z)
    
    generational = [
        {"module": "child_edu_prime", "input": input_data},
        {"module": "adolescent_transition", "input": input_data},
        {"module": "adult_maintenance", "input": input_data},
        {"module": "elderly_wisdom_sync", "input": input_data}
    ]
    
    return engine.process_lifecycle_matrix(generational)


@router.get("/status")
async def engine_status(N: int = 10, z: int = 2):
    """Returns the current omni vitality engine configuration."""
    engine = get_omni_engine(N, z)
    
    phi_nodules = [k for k, v in engine.nodules.items() if v == engine.PHI]
    sqrt2_nodules = [k for k, v in engine.nodules.items() if v == engine.SQRT2]
    
    return {
        "status": "active",
        "engine": "OmniVitalityEngine",
        "phi_constant": engine.PHI,
        "sqrt2_constant": engine.SQRT2,
        "scale_N": N,
        "scale_z": z,
        "multiplier": N * z * N * z,
        "total_nodules": len(engine.nodules),
        "phi_nodules": phi_nodules,
        "sqrt2_nodules": sqrt2_nodules,
        "categories": {
            "foundational": ["physiology_anatomy", "biochemistry", "genetics", "microbiology"],
            "clinical": ["nursing_clinical", "diagnostics", "pharmacology", "emergency_response"],
            "developmental": ["prenatal_formation", "child_edu_prime", "adolescent_transition", "adult_maintenance", "elderly_wisdom_sync"],
            "community": ["community_awareness", "family_dynamics", "cultural_integration", "collective_healing"],
            "cognitive": ["cognitive_function", "emotional_regulation", "memory_consolidation", "neuroplasticity"],
            "transpersonal": ["spiritual_emergence", "ancestral_connection", "purpose_alignment", "death_transition"]
        },
        "status_types": ["VIOLET_RESONANCE", "GROWTH_PHASE"],
        "matrix_types": ["OMNI_COHERENCE", "DEVELOPMENTAL_PHASE"]
    }
