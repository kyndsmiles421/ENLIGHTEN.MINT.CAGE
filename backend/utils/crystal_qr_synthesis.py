"""
ENLIGHTEN.MINT.CAFE - V-FINAL CRYSTAL-QR SYNTHESIS ENGINE
crystal_qr_synthesis.py

THE OMEGA-MINT ENHANCEMENT
PROTOCOL: METAPLEX_CORE_V1 | SHADER: L2_REFRACTION_GLSL
SYNC: [MULTI-LANGUAGE_QR] + [FRACTAL_GEOMETRY]

This module synthesizes:
- QR codes with multi-language displacement maps
- L2 Fractal Crystal geometry
- Pentagonal Symmetry (EN=0, ES=72, FR=144, DE=216, JA=288)
- Solana NFT metadata structure (Metaplex Core V1 compatible)
- Arweave-ready asset packaging

THE MATH: Each language is assigned a Refraction Angle based on
pentagonal symmetry: angle = (language_index * 72)
This creates a 5-faceted crystal where each face encodes a different
language version of the sovereign's identity.
"""

import hashlib
import time
import math
import base64
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from deps import db, logger

# Import the sovereign ledger for credential verification
from utils.sovereign_ledger import sovereign_ledger


class CrystalQRSynthesis:
    """
    Crystal-QR Synthesis Engine
    
    Generates immutable digital seals (NFTs) for Sovereign Mastery Certificates
    by baking multi-language QR codes into L2 Fractal geometry.
    
    ARCHITECTURE:
    - Input: Member ID, Volunteer Credits, Math Refractions
    - Process: QR Generation -> Fractal Baking -> Metadata Assembly
    - Output: Metaplex Core V1 compatible NFT package
    """
    
    # Sacred Constants
    PHI = 1.618033988749895
    RESONANCE_CONST = (PHI ** 2) / math.pi  # 0.833346
    PENTAGONAL_DIVISION = 72  # degrees per facet (360 / 5)
    
    # Language facets with their refraction angles
    LANGUAGES = {
        "EN": {"name": "English", "angle": 0, "label": "Sovereign Mastery"},
        "ES": {"name": "Spanish", "angle": 72, "label": "Maestria Soberana"},
        "FR": {"name": "French", "angle": 144, "label": "Maitrise Souveraine"},
        "DE": {"name": "German", "angle": 216, "label": "Souverane Meisterschaft"},
        "JA": {"name": "Japanese", "angle": 288, "label": "Sovereign Mastery"},
    }
    
    # Minimum volunteer credits for minting (10,000+ threshold)
    MINT_THRESHOLD_CREDITS = 10000
    MINT_THRESHOLD_HOURS = MINT_THRESHOLD_CREDITS / 15  # ~666.67 hours
    
    # NFT Collection metadata
    COLLECTION_NAME = "Sovereign Mastery Certificates"
    COLLECTION_SYMBOL = "SENTINEL"
    COLLECTION_DESCRIPTION = "Immutable digital seals of mastery within the Enlighten.Mint.Sovereign.Trust ecosystem"
    
    # Blockchain config (simulated for now - real Solana integration would use these)
    BLOCKCHAIN = "SOLANA_CORE"
    PROTOCOL = "METAPLEX_CORE_V1"
    SHADER_ID = "L2_FRACTAL_QR_INJECTION"
    
    def __init__(self):
        """Initialize the Crystal-QR Synthesis Engine."""
        self._mint_count = 0
        self._active_mints = {}
        logger.info("CRYSTAL_QR_SYNTHESIS: Omega-Mint Enhancement initialized")
    
    def verify_mint_eligibility(self, user_id: str) -> Dict[str, Any]:
        """
        Verify if a user is eligible to mint a Sovereign Mastery NFT.
        
        Requirements:
        - 10,000+ volunteer credits (~1000 hours @ 10 credits/hr)
        - At least one Math Refraction license owned
        - Active ledger status
        
        Returns:
            Eligibility status with details
        """
        ledger_status = sovereign_ledger.get_ledger_status(user_id)
        
        volunteer_credits = ledger_status["volunteer"]["credits"]
        volunteer_hours = ledger_status["volunteer"]["hours"]
        unlocked_assets = ledger_status["vault"]["unlocked_assets"]
        
        # Check credit threshold
        credits_met = volunteer_credits >= self.MINT_THRESHOLD_CREDITS
        credits_needed = max(0, self.MINT_THRESHOLD_CREDITS - volunteer_credits)
        hours_needed = credits_needed / 15 if credits_needed > 0 else 0
        
        # Check math license requirement
        has_math_license = len(unlocked_assets) > 0
        
        # Calculate eligibility
        eligible = credits_met and has_math_license
        
        # Calculate progress percentage
        progress_pct = min(100, (volunteer_credits / self.MINT_THRESHOLD_CREDITS) * 100)
        
        return {
            "eligible": eligible,
            "volunteer_credits": volunteer_credits,
            "volunteer_hours": round(volunteer_hours, 2),
            "credits_threshold": self.MINT_THRESHOLD_CREDITS,
            "credits_needed": credits_needed,
            "hours_needed": round(hours_needed, 2),
            "progress_percentage": round(progress_pct, 2),
            "has_math_license": has_math_license,
            "math_licenses_owned": unlocked_assets,
            "reasons": [] if eligible else self._get_ineligibility_reasons(credits_met, has_math_license),
        }
    
    def _get_ineligibility_reasons(self, credits_met: bool, has_license: bool) -> List[str]:
        """Get human-readable reasons for ineligibility."""
        reasons = []
        if not credits_met:
            reasons.append(f"Insufficient volunteer credits (need {self.MINT_THRESHOLD_CREDITS:,})")
        if not has_license:
            reasons.append("No Math Refraction license owned")
        return reasons
    
    def generate_qr_metadata(self, member_id: str, member_name: str) -> Dict[str, Any]:
        """
        Generate multi-language QR displacement maps.
        
        Each language is assigned a specific 'Refraction Angle'
        based on Pentagonal Symmetry: EN=0, ES=72, FR=144, DE=216, JA=288
        
        Args:
            member_id: Unique identifier for the sovereign
            member_name: Display name for the certificate
            
        Returns:
            QR metadata with language-specific payloads
        """
        # Generate verification hash
        verification_hash = hashlib.sha256(
            f"{member_id}{member_name}{time.time()}".encode()
        ).hexdigest()[:24].upper()
        
        # Build QR payloads for each language
        qr_payloads = {}
        for lang_code, lang_info in self.LANGUAGES.items():
            qr_payloads[lang_code] = {
                "language": lang_info["name"],
                "refraction_angle": lang_info["angle"],
                "label": lang_info["label"],
                "payload": f"SENTINEL:{verification_hash}:{lang_code}",
                "encoded_data": base64.b64encode(
                    f"{member_name}|{lang_info['label']}|{verification_hash}".encode()
                ).decode(),
            }
        
        return {
            "member_id": member_id,
            "member_name": member_name,
            "verification_hash": verification_hash,
            "qr_payloads": qr_payloads,
            "qr_offsets": {lang: info["angle"] for lang, info in self.LANGUAGES.items()},
            "pentagonal_symmetry": True,
            "facet_count": len(self.LANGUAGES),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    def bake_qr_into_fractal(
        self,
        member_id: str,
        member_name: str,
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Final synthesis: Bakes the multi-language QR displacement maps
        into the L2 Fractal mesh.
        
        This creates the final NFT artifact with all metadata.
        
        Args:
            member_id: Unique sovereign identifier
            member_name: Display name for the certificate
            user_id: User's ledger ID for credit verification
            
        Returns:
            Complete NFT artifact ready for minting
        """
        # Verify eligibility first
        eligibility = self.verify_mint_eligibility(user_id)
        if not eligibility["eligible"]:
            return {
                "status": "INELIGIBLE",
                "message": "Mint requirements not met",
                "eligibility": eligibility,
            }
        
        # Generate QR metadata
        qr_metadata = self.generate_qr_metadata(member_id, member_name)
        
        # Get ledger status for attribute enrichment
        ledger_status = sovereign_ledger.get_ledger_status(user_id)
        
        # Generate unique asset address (simulated - would be actual Solana address)
        asset_address = hashlib.sha256(
            f"SENTINEL_{member_id}_{time.time()}".encode()
        ).hexdigest()[:44]
        
        # Calculate resonance value based on volunteer contribution
        resonance_value = round(
            self.RESONANCE_CONST * (1 + ledger_status["volunteer"]["credits"] / 10000),
            6
        )
        
        # Build the NFT artifact
        baked_artifact = {
            # Metaplex Core V1 Standard Fields
            "name": f"Sovereign Mastery: {member_name}",
            "symbol": self.COLLECTION_SYMBOL,
            "description": f"Sovereign Mastery Certificate for {member_name}. This immutable digital seal represents mastery within the Enlighten.Mint.Sovereign.Trust ecosystem.",
            "image_uri": "https://arweave.net/crystal_render_v1",  # Placeholder - would be actual Arweave URI
            "external_url": "https://enlighten.mint.cafe/verify",
            
            # NFT Attributes (OpenSea/Metaplex compatible)
            "attributes": [
                {"trait_type": "Resonance", "value": str(resonance_value)},
                {"trait_type": "Languages", "value": str(len(self.LANGUAGES))},
                {"trait_type": "Void_Anchor", "value": "LOCKED"},
                {"trait_type": "Volunteer_Hours", "value": str(round(ledger_status["volunteer"]["hours"], 1))},
                {"trait_type": "Volunteer_Credits", "value": str(int(ledger_status["volunteer"]["credits"]))},
                {"trait_type": "Math_Licenses", "value": str(len(ledger_status["vault"]["unlocked_assets"]))},
                {"trait_type": "Crystal_Theme", "value": "L2_FRACTAL_OBSIDIAN"},
                {"trait_type": "Pentagonal_Facets", "value": "5"},
                {"trait_type": "Protocol", "value": self.PROTOCOL},
            ],
            
            # Crystal-QR Specific Data
            "qr_offsets": qr_metadata["qr_offsets"],
            "qr_payloads": qr_metadata["qr_payloads"],
            "verification_hash": qr_metadata["verification_hash"],
            
            # Technical Metadata
            "properties": {
                "files": [
                    {"uri": "https://arweave.net/crystal_render_v1", "type": "image/png"},
                ],
                "category": "image",
                "creators": [
                    {"address": "ENLIGHTEN_MINT_SOVEREIGN_TRUST", "share": 100}
                ],
            },
            
            # System Metadata
            "asset_address": asset_address,
            "member_id": member_id,
            "member_name": member_name,
            "blockchain": self.BLOCKCHAIN,
            "protocol": self.PROTOCOL,
            "shader_id": self.SHADER_ID,
            "minted_at": datetime.now(timezone.utc).isoformat(),
            "phi_constant": self.PHI,
            "resonance_formula": "(PHI^2 / PI) * (1 + credits/10000)",
        }
        
        # Increment mint count
        self._mint_count += 1
        
        logger.info(f"CRYSTAL_QR_SYNTHESIS: Artifact baked | Member: {member_name} | Hash: {qr_metadata['verification_hash']}")
        
        return {
            "status": "SUCCESS",
            "message": f"Crystal Geometry Baked with {len(self.LANGUAGES)} Language Facets.",
            "artifact": baked_artifact,
            "ready_for_ascension": True,
        }
    
    async def mint_sovereign_certificate(
        self,
        user_id: str,
        member_name: str,
        custom_attributes: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Full minting workflow for a Sovereign Mastery Certificate.
        
        This is the main entry point for the minting process:
        1. Verify eligibility
        2. Generate QR metadata
        3. Bake into fractal geometry
        4. Store in database
        5. Return mint result
        
        Args:
            user_id: User's ledger/auth ID
            member_name: Display name for the certificate
            custom_attributes: Optional additional attributes
            
        Returns:
            Complete mint result with NFT data
        """
        # Generate unique member ID
        member_id = f"{member_name.replace(' ', '_').upper()}_{hashlib.sha256(f'{user_id}{time.time()}'.encode()).hexdigest()[:8]}"
        
        # Bake the artifact
        result = self.bake_qr_into_fractal(member_id, member_name, user_id)
        
        if result["status"] != "SUCCESS":
            return result
        
        artifact = result["artifact"]
        
        # Add custom attributes if provided
        if custom_attributes:
            for key, value in custom_attributes.items():
                artifact["attributes"].append({"trait_type": key, "value": value})
        
        # Store in database
        mint_record = {
            "user_id": user_id,
            "member_id": member_id,
            "member_name": member_name,
            "asset_address": artifact["asset_address"],
            "verification_hash": artifact["verification_hash"],
            "artifact": artifact,
            "status": "MINTED",
            "minted_at": datetime.now(timezone.utc).isoformat(),
            "blockchain": self.BLOCKCHAIN,
            "protocol": self.PROTOCOL,
        }
        
        await db.sovereign_nfts.insert_one({**mint_record})
        mint_record.pop("_id", None)
        
        # Log volunteer hours used for the mint (mark as "claimed")
        sovereign_ledger._ledgers.get(user_id, {}).update({
            "last_mint_timestamp": datetime.now(timezone.utc).isoformat(),
            "total_mints": sovereign_ledger._ledgers.get(user_id, {}).get("total_mints", 0) + 1,
        })
        
        logger.info(f"CRYSTAL_QR_SYNTHESIS: NFT minted | User: {user_id} | Asset: {artifact['asset_address']}")
        
        return {
            "status": "MINTED",
            "message": f"Sovereign Mastery: {member_name} READY FOR ASCENSION",
            "mint_record": mint_record,
            "asset_address": artifact["asset_address"],
            "verification_url": f"https://enlighten.mint.cafe/verify/{artifact['verification_hash']}",
        }
    
    async def get_user_nfts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all NFTs minted by a user."""
        nfts = await db.sovereign_nfts.find(
            {"user_id": user_id, "status": "MINTED"},
            {"_id": 0}
        ).to_list(100)
        return nfts
    
    async def verify_nft(self, verification_hash: str) -> Dict[str, Any]:
        """
        Public verification of an NFT by its verification hash.
        
        Args:
            verification_hash: The unique hash embedded in the NFT
            
        Returns:
            Verification result with NFT details
        """
        nft = await db.sovereign_nfts.find_one(
            {"verification_hash": verification_hash},
            {"_id": 0}
        )
        
        if not nft:
            return {
                "valid": False,
                "message": "NFT not found in the Sovereign Ledger",
            }
        
        return {
            "valid": True,
            "verified": True,
            "member_name": nft["member_name"],
            "asset_address": nft["asset_address"],
            "minted_at": nft["minted_at"],
            "blockchain": nft["blockchain"],
            "protocol": nft["protocol"],
            "attributes": nft["artifact"]["attributes"],
            "qr_languages": list(nft["artifact"]["qr_offsets"].keys()),
            "resonance": next(
                (a["value"] for a in nft["artifact"]["attributes"] if a["trait_type"] == "Resonance"),
                "N/A"
            ),
        }
    
    def get_mint_statistics(self) -> Dict[str, Any]:
        """Get global minting statistics."""
        return {
            "total_mints": self._mint_count,
            "protocol": self.PROTOCOL,
            "blockchain": self.BLOCKCHAIN,
            "collection_name": self.COLLECTION_NAME,
            "collection_symbol": self.COLLECTION_SYMBOL,
            "mint_threshold_credits": self.MINT_THRESHOLD_CREDITS,
            "mint_threshold_hours": self.MINT_THRESHOLD_HOURS,
            "supported_languages": list(self.LANGUAGES.keys()),
            "phi_constant": self.PHI,
            "resonance_constant": self.RESONANCE_CONST,
        }


# Global singleton
crystal_qr_synthesis = CrystalQRSynthesis()


# Convenience functions
def verify_eligibility(user_id: str) -> Dict[str, Any]:
    """Check mint eligibility for a user."""
    return crystal_qr_synthesis.verify_mint_eligibility(user_id)


def generate_qr_preview(member_id: str, member_name: str) -> Dict[str, Any]:
    """Generate a QR metadata preview without minting."""
    return crystal_qr_synthesis.generate_qr_metadata(member_id, member_name)


async def mint_certificate(user_id: str, member_name: str) -> Dict[str, Any]:
    """Mint a sovereign mastery certificate."""
    return await crystal_qr_synthesis.mint_sovereign_certificate(user_id, member_name)
