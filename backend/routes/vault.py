"""
SECURITY VAULT ROUTES
Endpoints for encrypted data handling
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.security_vault import vault, encrypt_response, decrypt_request

router = APIRouter(prefix="/vault", tags=["Security Vault"])


class EncryptRequest(BaseModel):
    data: str


class DecryptRequest(BaseModel):
    payload: str


class IdentityRequest(BaseModel):
    identity: str


@router.post("/protect")
async def protect_data(request: EncryptRequest):
    """
    Encrypts data using AES-256-CBC
    Returns: IV:EncryptedData (hex encoded)
    """
    try:
        encrypted = vault.protect(request.data)
        return {
            "success": True,
            "encrypted": encrypted,
            "algorithm": "AES-256-CBC"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")


@router.post("/recover")
async def recover_data(request: DecryptRequest):
    """
    Decrypts data for internal processing
    """
    try:
        decrypted = vault.recover(request.payload)
        return {
            "success": True,
            "decrypted": decrypted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")


@router.post("/hash-identity")
async def hash_identity(request: IdentityRequest):
    """
    Creates a SHA-256 hash of an identity string
    """
    try:
        hashed = vault.hash_identity(request.identity)
        return {
            "success": True,
            "identity": request.identity,
            "hash": hashed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hashing failed: {str(e)}")


@router.get("/generate-key")
async def generate_new_key():
    """
    Generates a new 256-bit encryption key
    WARNING: This is for development only. In production, generate keys securely offline.
    """
    new_key = vault.generate_key()
    return {
        "success": True,
        "key": new_key,
        "warning": "Store this key securely in .env. Never expose in production!"
    }


@router.get("/status")
async def vault_status():
    """
    Check if the vault is operational
    """
    # Test encryption/decryption cycle
    test_data = "SHAMBHALA_VAULT_TEST"
    try:
        encrypted = vault.protect(test_data)
        decrypted = vault.recover(encrypted)
        operational = decrypted == test_data
    except:
        operational = False
    
    return {
        "status": "ACTIVE" if operational else "ERROR",
        "algorithm": "AES-256-CBC",
        "iv_length": 16,
        "key_loaded": True,
        "version": "2.88_SHAMBHALA"
    }
