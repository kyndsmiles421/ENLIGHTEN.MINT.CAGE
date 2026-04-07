from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.refractive_shield import get_shield, RefractiveShield

router = APIRouter(prefix="/shield", tags=["Refractive Shield"])


class EncryptRequest(BaseModel):
    plaintext: str


class DecryptRequest(BaseModel):
    outer_barrier: str
    inner_core: str
    nonce: str
    tag: str
    refractive_index: str


@router.post("/encrypt")
async def encrypt_data(request: EncryptRequest):
    """
    Encrypts plaintext through the Refractive Shield dual-barrier system.
    Returns encrypted packet with outer_barrier (RSA), inner_core (AES-256), 
    nonce, tag, and refractive_index (HMAC binding).
    """
    shield = get_shield()
    result = shield.encrypt(request.plaintext)
    return result


@router.post("/decrypt")
async def decrypt_data(request: DecryptRequest):
    """
    Decrypts a shield packet using the private key.
    Validates refractive index before breaching inner core.
    """
    shield = get_shield()
    packet = {
        "outer_barrier": request.outer_barrier,
        "inner_core": request.inner_core,
        "nonce": request.nonce,
        "tag": request.tag,
        "refractive_index": request.refractive_index
    }
    result = shield.decrypt(packet)
    
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result)
    
    return result


@router.get("/public-key")
async def get_public_key():
    """
    Export the public key for external barrier synchronization.
    """
    shield = get_shield()
    return {
        "public_key": shield.export_public_key(),
        "algorithm": "RSA-2048",
        "inner_cipher": "AES-256-EAX",
        "binding": "HMAC-SHA256"
    }


@router.get("/status")
async def shield_status():
    """
    Returns the current shield configuration status.
    """
    shield = get_shield()
    return {
        "status": "active",
        "barriers": {
            "outer": "RSA-2048-OAEP",
            "inner": "AES-256-EAX"
        },
        "refractive_binding": "HMAC-SHA256",
        "key_loaded": shield.key_pair is not None
    }
