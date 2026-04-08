from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys
sys.path.insert(0, '/app/backend')
from engines.holistic_healing import get_healing_engine
from engines.sovereign_armor import armor_full_artifact

router = APIRouter(prefix="/healing", tags=["Holistic Healing Engine"])


class HealingScanRequest(BaseModel):
    practice: str
    vitality_input: float = 1.0
    N: int = 10
    z: int = 2
    encrypted: bool = False
    armored: bool = False


class ProtocolModality(BaseModel):
    practice: str
    vitality: float
    duration_min: int = 15


class ProtocolRequest(BaseModel):
    modalities: List[ProtocolModality]
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
async def execute_healing_scan(request: HealingScanRequest):
    """
    Execute holistic healing coherence scan.
    
    Vitality input represents current energy level (0.0 - 2.0).
    Status: VITAL_COHERENCE (400+) or RESTORATION_REQUIRED (below 400)
    """
    engine = get_healing_engine(request.N, request.z)
    
    if request.encrypted:
        result = engine.run_encrypted_scan(request.practice, request.vitality_input)
        if request.armored:
            result['armored'] = armor_full_artifact(result['encrypted'], version="rainbow", spectrum="green")
        return result
    else:
        return engine.execute_healing_scan(request.practice, request.vitality_input)


@router.post("/protocol")
async def create_healing_protocol(request: ProtocolRequest):
    """
    Create a multi-modality healing protocol.
    
    Combines multiple practices with duration for comprehensive healing plan.
    Returns FULL_COHERENCE if majority of practices reach threshold.
    """
    engine = get_healing_engine(request.N, request.z)
    modalities = [{"practice": m.practice, "vitality": m.vitality, "duration_min": m.duration_min} 
                  for m in request.modalities]
    return engine.create_healing_protocol(modalities)


@router.post("/decrypt")
async def decrypt_healing_artifact(request: DecryptRequest):
    """Decrypt a healing artifact."""
    engine = get_healing_engine(request.N, request.z)
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


@router.get("/modalities")
async def list_modalities():
    """List all available healing modalities with categories."""
    engine = get_healing_engine()
    return engine.list_modalities()


@router.get("/modality/{modality_name}")
async def get_modality_info(modality_name: str, N: int = 10, z: int = 2):
    """Get detailed information about a specific healing modality."""
    engine = get_healing_engine(N, z)
    const = engine.get_modality_constant(modality_name)
    multiplier = N * z * N * z
    
    const_type = "PHI" if const == engine.PHI else "STANDARD"
    min_vitality = (400 * engine.PHI) / (const * multiplier)
    
    return {
        "modality": modality_name.upper(),
        "constant": const,
        "constant_type": const_type,
        "multiplier": f"N*z*N*z = {multiplier}",
        "coherence_threshold": 400,
        "min_vitality_for_coherence": round(min_vitality, 4),
        "formula": f"scaled_ri = ((vitality * {const}) / {engine.PHI}) * {multiplier} - jitter",
        "scale": f"{N}x{z}"
    }


@router.get("/status")
async def engine_status(N: int = 10, z: int = 2):
    """Returns the current healing engine configuration."""
    engine = get_healing_engine(N, z)
    
    phi_modalities = [k for k, v in engine.modalities.items() if v == engine.PHI]
    
    return {
        "status": "active",
        "engine": "HolisticHealingEngine",
        "phi_constant": engine.PHI,
        "scale_N": N,
        "scale_z": z,
        "multiplier": N * z * N * z,
        "coherence_threshold": 400,
        "total_modalities": len(engine.modalities),
        "phi_modalities": phi_modalities,
        "categories": {
            "breathwork": ["breathwork_rhythm", "pranayama", "wim_hof", "box_breathing", "holotropic"],
            "herbalism": ["herb_synergy", "adaptogen_stack", "nootropic_blend", "tincture_potency", "mushroom_complex"],
            "somatic": ["somatic_release", "fascia_unwinding", "craniosacral", "myofascial", "polyvagal_tone"],
            "circadian": ["circadian_sync", "melatonin_cycle", "cortisol_curve", "ultradian_pulse"],
            "energy": ["chakra_alignment", "meridian_flow", "biofield_tuning", "sound_healing", "light_therapy"],
            "mind_body": ["meditation_depth", "yoga_flow", "tai_chi", "qigong", "mindfulness"]
        },
        "status_types": ["VITAL_COHERENCE", "RESTORATION_REQUIRED"],
        "protocol_types": ["FULL_COHERENCE", "PARTIAL_RESTORATION"]
    }
