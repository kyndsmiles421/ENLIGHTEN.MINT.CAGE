from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.n_scaled_refractor import get_n_scaled_refractor
from engines.sovereign_armor import armor_full_artifact, unarmor_full_artifact

router = APIRouter(prefix="/n-refractor", tags=["N-Scaled Refractor"])


class ScaledScanRequest(BaseModel):
    sample_id: str
    sensor_feed: float = 0.998
    N: int = 1
    z: int = 1
    armored: bool = False


class DecryptRequest(BaseModel):
    p: str  # payload
    k: str  # key
    n: str  # nonce
    t: str  # tag
    N: int = 1
    z: int = 1
    armored: bool = False


@router.post("/scan")
async def execute_scaled_scan(request: ScaledScanRequest):
    """
    Execute an N-scaled multi-dimensional scan.
    
    Scale factors:
    - N: Primary scale multiplier
    - z: Complex plane factor
    - armored: If True, wraps email in PGP ASCII Armor
    
    Math: scaled_ri = (base_ri * N*z*N*z) - noise_offset
    Threshold scales with N: 0.615 * N
    """
    refractor = get_n_scaled_refractor(request.N, request.z)
    artifact = refractor.execute_multi_scan(request.sample_id, request.sensor_feed)
    
    if request.armored:
        artifact['email_armored'] = armor_full_artifact(artifact['email'])
    return artifact


@router.post("/decrypt")
async def decrypt_email_body(request: DecryptRequest):
    """
    Decrypt the email body from a scaled scan.
    Must use the same N,z configuration as the original scan.
    Set armored=True if input is PGP ASCII armored.
    """
    refractor = get_n_scaled_refractor(request.N, request.z)
    
    # Handle armored input
    if request.armored:
        email_body = unarmor_full_artifact({
            "shielded_data": request.p,
            "barrier_key": request.k,
            "nonce": request.n,
            "auth_tag": request.t
        })
    else:
        email_body = {
            "p": request.p,
            "k": request.k,
            "n": request.n,
            "t": request.t
        }
    
    result = refractor.decrypt_email(email_body)
    
    if result.get("status") == "DECRYPTION_FAILED":
        raise HTTPException(status_code=400, detail=result)
    
    return result


@router.get("/status")
async def refractor_status(N: int = 1, z: int = 1):
    """
    Returns the current N-scaled refractor configuration.
    """
    refractor = get_n_scaled_refractor(N, z)
    multiplier = N * z * N * z
    return {
        "status": "active",
        "engine": "N_Scaled_Refractor",
        "scale_factor_N": N,
        "plane_factor_z": z,
        "multiplier": f"N*z*N*z = {multiplier}",
        "multiplier_value": multiplier,
        "phi_constant": refractor.PHI,
        "stability_threshold": f"0.615 * N = {0.615 * N}",
        "noise_range": "±9 (quantum uncertainty)",
        "encryption": {
            "outer_barrier": "RSA-2048-OAEP",
            "inner_barrier": "AES-256-EAX"
        }
    }


@router.get("/calculate")
async def calculate_preview(sensor_feed: float = 0.998, N: int = 1, z: int = 1):
    """
    Preview the math calculation without encryption.
    Useful for understanding the N*z*N*z protocol.
    """
    PHI = 1.618033
    base_ri = (sensor_feed * 0.999) / PHI
    multiplier = N * z * N * z
    threshold = 0.615 * N
    
    # Calculate range (min/max with noise)
    scaled_min = (base_ri * multiplier) - 9
    scaled_max = (base_ri * multiplier) + 9
    
    return {
        "input": {
            "sensor_feed": sensor_feed,
            "N": N,
            "z": z
        },
        "calculation": {
            "step_1": f"base_ri = (sensor * 0.999) / PHI = ({sensor_feed} * 0.999) / {PHI}",
            "base_ri": round(base_ri, 6),
            "step_2": f"multiplier = N*z*N*z = {N}*{z}*{N}*{z}",
            "multiplier": multiplier,
            "step_3": "noise_offset = random(0-9) - random(0-9)",
            "noise_range": "[-9, +9]",
            "step_4": "scaled_ri = (base_ri * multiplier) - noise_offset"
        },
        "result_range": {
            "min_scaled_ri": round(scaled_min, 4),
            "max_scaled_ri": round(scaled_max, 4),
            "threshold": round(threshold, 4),
            "likely_status": "STABLE" if scaled_min > threshold else "VARIABLE (depends on noise)"
        }
    }
