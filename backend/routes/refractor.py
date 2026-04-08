from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.sovereign_refractor import get_refractor

router = APIRouter(prefix="/refractor", tags=["Sovereign Refractor"])


class ScanRequest(BaseModel):
    sample_id: str
    sensor_input: float = 0.998


class SMSData(BaseModel):
    status: str
    refractive_index: float
    sample_id: str
    nonce: str


class EmailBody(BaseModel):
    payload: str
    barrier_key: str
    nonce: str
    auth_tag: str


class ReuniteRequest(BaseModel):
    sms_data: SMSData
    email_body: EmailBody


@router.post("/scan")
async def execute_scan(request: ScanRequest):
    """
    Execute a scan and generate dual-channel artifacts.
    
    Returns:
    - sms_summary: Human-readable status for SMS
    - sms_data: Structured SMS data with nonce
    - email_body: Encrypted payload for email
    
    Both streams must be reunited to decrypt the full report.
    """
    refractor = get_refractor()
    artifact = refractor.execute_scan(request.sample_id, request.sensor_input)
    return artifact


@router.post("/reunite")
async def reunite_streams(request: ReuniteRequest):
    """
    Reunite SMS and Email streams to decrypt the Inner Core.
    
    Both channels must have matching nonces (proving they came from the same scan).
    """
    refractor = get_refractor()
    
    sms_data = {
        "status": request.sms_data.status,
        "refractive_index": request.sms_data.refractive_index,
        "sample_id": request.sms_data.sample_id,
        "nonce": request.sms_data.nonce
    }
    
    email_body = {
        "payload": request.email_body.payload,
        "barrier_key": request.email_body.barrier_key,
        "nonce": request.email_body.nonce,
        "auth_tag": request.email_body.auth_tag
    }
    
    result = refractor.reunite_streams(sms_data, email_body)
    
    if result.get("status") in ["BARRIER_MISMATCH", "DECRYPTION_FAILED"]:
        raise HTTPException(status_code=400, detail=result)
    
    return result


@router.get("/public-key")
async def get_public_key():
    """Export the refractor's public key for external verification."""
    refractor = get_refractor()
    return {
        "public_key": refractor.export_public_key(),
        "algorithm": "RSA-2048-OAEP",
        "inner_cipher": "AES-256-EAX",
        "dual_channel": True
    }


@router.get("/status")
async def refractor_status():
    """Returns the current refractor configuration."""
    refractor = get_refractor()
    return {
        "status": "active",
        "engine": "SovereignRefractor",
        "phi_constant": refractor.PHI,
        "channels": {
            "sms": "Outer Barrier (status + RI + nonce)",
            "email": "Inner Core (encrypted payload)"
        },
        "encryption": {
            "outer_barrier": "RSA-2048-OAEP",
            "inner_barrier": "AES-256-EAX"
        },
        "stability_threshold": 0.615,
        "reunification_required": True
    }
