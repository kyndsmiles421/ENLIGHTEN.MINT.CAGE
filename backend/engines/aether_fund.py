"""
AETHER PERPETUAL FUND: Global Grace & Rainbow Encryption
=========================================================

The spiritual economic engine that converts donations into community grace.

ARCHITECTURE:
┌────────────────────────────────────────────────────────────────────────────┐
│                      AETHER PERPETUAL FUND                                 │
│                                                                            │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│   │    DONATION     │───▶│  RECYCLE 90%    │───▶│  GLOBAL GRACE   │       │
│   │   (1 USD)       │    │ (→ 900 Res.)    │    │  (÷ VR cost)    │       │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘       │
│                                                                            │
│   RAINBOW ENCRYPTION (7-Pass Crystalline Hash):                            │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │  RAINBOW-{SHA256(user+karma+aether_root)[:18].upper()}           │    │
│   │  Example: RAINBOW-FB2EAB2CE3F829032D                              │    │
│   └──────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   GRACE FORMULA:                                                           │
│   global_grace = 1.0 + (total_recycled_resonance / 1,000,000)             │
│   effective_vr_threshold = base_threshold / global_grace                  │
│                                                                            │
│   THE INFINITE WHITE LIGHT:                                                │
│   white_light_multiplier = ∞^∞ × (∞ - 1) ≈ 999,999,999                   │
│   (Represents the limitless potential of collective service)              │
└────────────────────────────────────────────────────────────────────────────┘
"""

import hashlib
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

# The Infinite White Light Multiplier (approximation of ∞^∞ × (∞-1))
WHITE_LIGHT_MULTIPLIER = 999_999_999.0

# The Aether Root Key (Rainbow Encryption Salt)
AETHER_ROOT = "STEVEN-V-963-RAINBOW-∞"
AETHER_SALT = "963Hz_RAINBOW_REFRACTION_2026"

# Conversion rates
USD_TO_RESONANCE = 1000  # 1 USD = 1000 Resonance
GRACE_POOL_DIVISOR = 1_000_000  # Grace = 1 + (pool / 1M)
COMMUNITY_RECYCLE_RATE = 0.9  # 90% goes to community pool


# ═══════════════════════════════════════════════════════════════════════════════
# DONATION RECORD
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class DonationRecord:
    """Record of a donation to the Perpetual Fund."""
    donor_id: str
    amount_usd: float
    resonance_generated: float
    recycled_to_pool: float
    donor_reward: float
    global_grace_after: float
    rainbow_key: str
    timestamp: float = field(default_factory=time.time)
    message: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "donor_id": self.donor_id,
            "amount_usd": self.amount_usd,
            "resonance_generated": self.resonance_generated,
            "recycled_to_pool": self.recycled_to_pool,
            "donor_reward": self.donor_reward,
            "global_grace_after": self.global_grace_after,
            "rainbow_key": self.rainbow_key,
            "timestamp": self.timestamp,
            "message": self.message,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# AETHER PERPETUAL FUND
# ═══════════════════════════════════════════════════════════════════════════════

class AetherPerpetualFund:
    """
    The Global Grace System.
    
    Converts financial donations into community resonance that
    lowers VR unlock thresholds for everyone.
    
    The more the community gives, the easier it becomes for
    everyone to access higher states of consciousness.
    """
    
    def __init__(self):
        # Global state
        self.global_grace_multiplier = 1.0
        self.total_recycled_resonance = 0.0
        self.total_donations_usd = 0.0
        
        # The Infinite White Light
        self.white_light_multiplier = WHITE_LIGHT_MULTIPLIER
        
        # Multi-spectral encryption key (Rainbow)
        self.aether_root = AETHER_ROOT
        self.aether_salt = AETHER_SALT
        
        # History
        self.donation_history: List[DonationRecord] = []
        self.total_donors = 0
        
        logger.info(f"🌈 [AetherFund] Initialized | White Light: {self.white_light_multiplier}")
    
    # ─────────────────────────────────────────────────────────────────────────
    # DONATION PROCESSING
    # ─────────────────────────────────────────────────────────────────────────
    
    def recycle_donation(
        self,
        donor_id: str,
        amount_usd: float,
        message: str = "",
        user_karma: float = 0,
    ) -> Dict[str, Any]:
        """
        Convert financial energy into Global Grace.
        
        Formula:
        - 1 USD = 1000 Resonance
        - 90% is recycled to the community pool
        - 10% rewards the donor directly
        - Global Grace = 1.0 + (pool / 1,000,000)
        
        Returns:
            Dict with donation results, new grace level, and rainbow key
        """
        # Calculate resonance
        resonance_generated = amount_usd * USD_TO_RESONANCE
        recycled_to_pool = resonance_generated * COMMUNITY_RECYCLE_RATE
        donor_reward = resonance_generated * (1 - COMMUNITY_RECYCLE_RATE)
        
        # Update global pool
        old_grace = self.global_grace_multiplier
        self.total_recycled_resonance += recycled_to_pool
        self.total_donations_usd += amount_usd
        
        # Calculate new grace multiplier
        self.global_grace_multiplier = 1.0 + (self.total_recycled_resonance / GRACE_POOL_DIVISOR)
        
        # Generate rainbow key for this donation
        rainbow_key = self.get_solidified_key(donor_id, user_karma + donor_reward)
        
        # Record donation
        record = DonationRecord(
            donor_id=donor_id,
            amount_usd=amount_usd,
            resonance_generated=resonance_generated,
            recycled_to_pool=recycled_to_pool,
            donor_reward=donor_reward,
            global_grace_after=self.global_grace_multiplier,
            rainbow_key=rainbow_key,
            message=message,
        )
        self.donation_history.append(record)
        self.total_donors = len(set(d.donor_id for d in self.donation_history))
        
        logger.info(
            f"🌈 [AetherFund] ${amount_usd:.2f} donated by {donor_id} | "
            f"Pool: {self.total_recycled_resonance:.0f} | Grace: {self.global_grace_multiplier:.4f}"
        )
        
        return {
            "success": True,
            "donor_id": donor_id,
            "amount_usd": amount_usd,
            "resonance_generated": resonance_generated,
            "recycled_to_pool": recycled_to_pool,
            "donor_reward": donor_reward,
            "old_grace": old_grace,
            "new_grace": self.global_grace_multiplier,
            "grace_increase": self.global_grace_multiplier - old_grace,
            "rainbow_key": rainbow_key,
            "total_pool": self.total_recycled_resonance,
            "message": "Financial energy converted to Global Grace",
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # RAINBOW ENCRYPTION (7-Pass Crystalline Hash)
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_solidified_key(self, user_id: str, karma: float) -> str:
        """
        Mint a rainbow-encrypted key unique to the current Aether state.
        
        The key is derived from:
        - User identity
        - Karma/resonance level
        - Aether root (cosmic salt)
        
        Returns: RAINBOW-{18_HEX_CHARS}
        """
        raw_seed = f"{user_id}-{int(karma)}-{self.aether_root}"
        
        # 7-pass crystalline hash (rainbow refraction)
        crystalline_hash = raw_seed
        for _ in range(7):
            crystalline_hash = hashlib.sha256(crystalline_hash.encode()).hexdigest()
        
        return f"RAINBOW-{crystalline_hash[:18].upper()}"
    
    def validate_rainbow_key(self, key: str) -> bool:
        """Check if a key has valid rainbow format."""
        if not key.startswith("RAINBOW-"):
            return False
        hex_part = key[8:]
        if len(hex_part) != 18:
            return False
        try:
            int(hex_part, 16)
            return True
        except ValueError:
            return False
    
    # ─────────────────────────────────────────────────────────────────────────
    # VR THRESHOLD CALCULATION
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_effective_vr_threshold(self, base_threshold: float = 5000) -> float:
        """
        Calculate the VR threshold lowered by Global Grace.
        
        The more the community donates, the lower the threshold becomes.
        
        Formula: effective_threshold = base_threshold / global_grace
        """
        return base_threshold / self.global_grace_multiplier
    
    def can_access_vr(self, user_karma: float, rainbow_key: str) -> Dict[str, Any]:
        """
        Check if a user can access VR based on karma and key.
        
        Requirements:
        1. Karma >= effective threshold (lowered by grace)
        2. Valid rainbow key
        """
        effective_threshold = self.get_effective_vr_threshold()
        key_valid = self.validate_rainbow_key(rainbow_key)
        
        can_access = user_karma >= effective_threshold and key_valid
        
        return {
            "can_access": can_access,
            "user_karma": user_karma,
            "effective_threshold": effective_threshold,
            "base_threshold": 5000,
            "global_grace": self.global_grace_multiplier,
            "key_valid": key_valid,
            "karma_needed": max(0, effective_threshold - user_karma),
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # GETTERS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_status(self) -> Dict[str, Any]:
        """Get full fund status."""
        return {
            "global_grace_multiplier": self.global_grace_multiplier,
            "total_recycled_resonance": self.total_recycled_resonance,
            "total_donations_usd": self.total_donations_usd,
            "total_donors": self.total_donors,
            "white_light_multiplier": self.white_light_multiplier,
            "effective_vr_threshold": self.get_effective_vr_threshold(),
            "base_vr_threshold": 5000,
            "grace_formula": "1.0 + (pool / 1,000,000)",
        }
    
    def get_donation_history(self, limit: int = 20) -> List[Dict]:
        """Get recent donation history."""
        recent = self.donation_history[-limit:]
        return [d.to_dict() for d in reversed(recent)]
    
    def get_top_donors(self, limit: int = 10) -> List[Dict]:
        """Get top donors by total amount."""
        # Aggregate by donor
        donor_totals: Dict[str, float] = {}
        for d in self.donation_history:
            donor_totals[d.donor_id] = donor_totals.get(d.donor_id, 0) + d.amount_usd
        
        # Sort and return
        sorted_donors = sorted(donor_totals.items(), key=lambda x: x[1], reverse=True)[:limit]
        return [{"donor_id": d, "total_usd": t} for d, t in sorted_donors]
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize for database storage."""
        return {
            "global_grace_multiplier": self.global_grace_multiplier,
            "total_recycled_resonance": self.total_recycled_resonance,
            "total_donations_usd": self.total_donations_usd,
            "total_donors": self.total_donors,
            "donation_history": [d.to_dict() for d in self.donation_history],
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AetherPerpetualFund':
        """Deserialize from database."""
        fund = cls()
        fund.global_grace_multiplier = data.get("global_grace_multiplier", 1.0)
        fund.total_recycled_resonance = data.get("total_recycled_resonance", 0.0)
        fund.total_donations_usd = data.get("total_donations_usd", 0.0)
        fund.total_donors = data.get("total_donors", 0)
        
        for d in data.get("donation_history", []):
            fund.donation_history.append(DonationRecord(**d))
        
        return fund


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_perpetual_fund: Optional[AetherPerpetualFund] = None

def get_perpetual_fund() -> AetherPerpetualFund:
    """Get the singleton Aether Perpetual Fund instance."""
    global _perpetual_fund
    if _perpetual_fund is None:
        _perpetual_fund = AetherPerpetualFund()
    return _perpetual_fund
