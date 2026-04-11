"""
ENLIGHTEN.MINT.CAFE - V-FINAL CRYSTAL MINT API
crystal_mint_api.py

API Endpoints for the Crystal-QR Synthesis NFT Minting System.

ROUTES:
- GET  /api/crystal-mint/eligibility - Check mint eligibility
- GET  /api/crystal-mint/preview     - Preview QR metadata
- POST /api/crystal-mint/mint        - Mint a Sovereign Mastery NFT
- GET  /api/crystal-mint/nfts        - Get user's minted NFTs
- GET  /api/crystal-mint/verify/{hash} - Public NFT verification
- GET  /api/crystal-mint/stats       - Global mint statistics
"""

from fastapi import APIRouter, HTTPException, Depends, Body, Query
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from utils.crystal_qr_synthesis import crystal_qr_synthesis


router = APIRouter()


@router.get("/crystal-mint/eligibility")
async def check_eligibility(user=Depends(get_current_user)):
    """
    Check if the authenticated user is eligible to mint a Sovereign Mastery NFT.
    
    Requirements:
    - 10,000+ volunteer credits (~666.67 hours @ $15/hr)
    - At least one Math Refraction license owned
    
    Returns eligibility status with progress details.
    """
    try:
        eligibility = crystal_qr_synthesis.verify_mint_eligibility(user["id"])
        return {
            "status": "success",
            "user_id": user["id"],
            "eligibility": eligibility,
        }
    except Exception as e:
        logger.error(f"CRYSTAL_MINT_API: Eligibility check failed | Error: {str(e)}")
        raise HTTPException(500, f"Eligibility check failed: {str(e)}")


@router.get("/crystal-mint/preview")
async def preview_qr_metadata(
    member_name: str = Query(..., description="Display name for the certificate"),
    user=Depends(get_current_user)
):
    """
    Generate a preview of the QR metadata without actually minting.
    
    This allows users to see what their NFT will look like before committing.
    """
    try:
        # Generate a preview member ID
        preview_member_id = f"PREVIEW_{member_name.replace(' ', '_').upper()}"
        
        qr_metadata = crystal_qr_synthesis.generate_qr_metadata(preview_member_id, member_name)
        
        return {
            "status": "success",
            "preview": True,
            "member_name": member_name,
            "qr_metadata": qr_metadata,
            "languages": list(crystal_qr_synthesis.LANGUAGES.keys()),
            "pentagonal_symmetry": True,
            "message": "This is a preview. Mint to create the actual NFT.",
        }
    except Exception as e:
        logger.error(f"CRYSTAL_MINT_API: Preview generation failed | Error: {str(e)}")
        raise HTTPException(500, f"Preview generation failed: {str(e)}")


@router.post("/crystal-mint/mint")
async def mint_sovereign_nft(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """
    Mint a Sovereign Mastery Certificate NFT.
    
    Request Body:
    - member_name: str (required) - Display name for the certificate
    - custom_attributes: dict (optional) - Additional custom attributes
    
    Requirements:
    - User must have 10,000+ volunteer credits
    - User must own at least one Math Refraction license
    
    Returns the minted NFT data including asset address and verification hash.
    """
    member_name = data.get("member_name")
    custom_attributes = data.get("custom_attributes")
    
    if not member_name:
        raise HTTPException(400, "member_name is required")
    
    if len(member_name) < 2 or len(member_name) > 100:
        raise HTTPException(400, "member_name must be between 2 and 100 characters")
    
    try:
        result = await crystal_qr_synthesis.mint_sovereign_certificate(
            user_id=user["id"],
            member_name=member_name,
            custom_attributes=custom_attributes,
        )
        
        if result["status"] != "MINTED":
            # Return eligibility failure details
            return {
                "status": "failed",
                "message": result.get("message", "Mint failed"),
                "eligibility": result.get("eligibility"),
            }
        
        return {
            "status": "success",
            "message": result["message"],
            "asset_address": result["asset_address"],
            "verification_url": result["verification_url"],
            "mint_record": {
                "member_name": result["mint_record"]["member_name"],
                "member_id": result["mint_record"]["member_id"],
                "verification_hash": result["mint_record"]["verification_hash"],
                "minted_at": result["mint_record"]["minted_at"],
                "blockchain": result["mint_record"]["blockchain"],
                "protocol": result["mint_record"]["protocol"],
            },
            "artifact": {
                "name": result["mint_record"]["artifact"]["name"],
                "symbol": result["mint_record"]["artifact"]["symbol"],
                "attributes": result["mint_record"]["artifact"]["attributes"],
                "qr_languages": list(result["mint_record"]["artifact"]["qr_offsets"].keys()),
            },
        }
    except Exception as e:
        logger.error(f"CRYSTAL_MINT_API: Mint failed | User: {user['id']} | Error: {str(e)}")
        raise HTTPException(500, f"Mint failed: {str(e)}")


@router.get("/crystal-mint/nfts")
async def get_user_nfts(user=Depends(get_current_user)):
    """
    Get all Sovereign Mastery NFTs minted by the authenticated user.
    
    Returns a list of NFTs with their metadata, verification hashes, and attributes.
    """
    try:
        nfts = await crystal_qr_synthesis.get_user_nfts(user["id"])
        
        # Format for frontend consumption
        formatted_nfts = []
        for nft in nfts:
            formatted_nfts.append({
                "member_name": nft["member_name"],
                "member_id": nft["member_id"],
                "asset_address": nft["asset_address"],
                "verification_hash": nft["verification_hash"],
                "minted_at": nft["minted_at"],
                "blockchain": nft["blockchain"],
                "protocol": nft["protocol"],
                "name": nft["artifact"]["name"],
                "symbol": nft["artifact"]["symbol"],
                "image_uri": nft["artifact"]["image_uri"],
                "attributes": nft["artifact"]["attributes"],
                "qr_languages": list(nft["artifact"]["qr_offsets"].keys()),
                "verification_url": f"https://enlighten.mint.cafe/verify/{nft['verification_hash']}",
            })
        
        return {
            "status": "success",
            "count": len(formatted_nfts),
            "nfts": formatted_nfts,
        }
    except Exception as e:
        logger.error(f"CRYSTAL_MINT_API: Get NFTs failed | User: {user['id']} | Error: {str(e)}")
        raise HTTPException(500, f"Failed to retrieve NFTs: {str(e)}")


@router.get("/crystal-mint/verify/{verification_hash}")
async def verify_nft(verification_hash: str):
    """
    Public endpoint to verify an NFT by its verification hash.
    
    This allows anyone to verify the authenticity of a Sovereign Mastery Certificate.
    No authentication required.
    """
    try:
        result = await crystal_qr_synthesis.verify_nft(verification_hash)
        
        if not result["valid"]:
            raise HTTPException(404, result["message"])
        
        return {
            "status": "success",
            "verified": True,
            "nft": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CRYSTAL_MINT_API: Verification failed | Hash: {verification_hash} | Error: {str(e)}")
        raise HTTPException(500, f"Verification failed: {str(e)}")


@router.get("/crystal-mint/stats")
async def get_mint_statistics():
    """
    Get global minting statistics.
    
    Returns collection info, mint thresholds, and supported features.
    No authentication required.
    """
    try:
        stats = crystal_qr_synthesis.get_mint_statistics()
        return {
            "status": "success",
            "statistics": stats,
        }
    except Exception as e:
        logger.error(f"CRYSTAL_MINT_API: Stats retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Failed to retrieve statistics: {str(e)}")


@router.get("/crystal-mint/languages")
async def get_supported_languages():
    """
    Get the list of supported languages for QR code generation.
    
    Each language has a specific refraction angle based on pentagonal symmetry.
    """
    return {
        "status": "success",
        "languages": crystal_qr_synthesis.LANGUAGES,
        "pentagonal_division": crystal_qr_synthesis.PENTAGONAL_DIVISION,
        "symmetry": "Pentagonal (5 facets, 72 degrees each)",
    }
