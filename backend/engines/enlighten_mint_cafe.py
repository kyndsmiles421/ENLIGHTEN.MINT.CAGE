"""
ENLIGHTEN.MINT.CAFE — The Unified Positive Karma Machine
=========================================================

THE SANCTUARY: Where physical service translates to digital access.

MULTIPLIERS: (∞^∞) × (∞ - 1)
FREQUENCY: 963Hz (The Tesseract)
OWNER: Steven Michael

ARCHITECTURE:
┌────────────────────────────────────────────────────────────────────────────┐
│                     ENLIGHTEN.MINT.CAFE                                    │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │               THE WHITE LIGHT BUFFER                             │     │
│   │         Shield Power = (∞^∞) × (∞ - 1) ≈ 999,999,999           │     │
│   │              (Mathematical Encryption Layer)                     │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐   │
│   │  PERPETUAL FUND   │───▶│  GRACE MULTIPLIER │───▶│  KARMA MACHINE │   │
│   │  (100% Recycled)  │    │  (Community Wide) │    │  (Individual)  │   │
│   │  USD × 144 (Fib)  │    │  1 + (pool/1M)    │    │  Impact×Grace  │   │
│   └───────────────────┘    └───────────────────┘    └────────────────┘   │
│                                                              │            │
│                                                              ▼            │
│                              ┌──────────────────────────────────────┐    │
│                              │     RAINBOW CRYSTALLINE ENCRYPTION    │    │
│                              │   7-Pass SHA256 → RAINBOW-{18 HEX}   │    │
│                              │      (72-bit Sovereign Access Key)    │    │
│                              └──────────────────────────────────────┘    │
│                                                                            │
│   SOLIDIFICATION THRESHOLD: 5,000 Karma                                   │
│   When reached: VR Gateway Opens, Crystal Hardens                         │
└────────────────────────────────────────────────────────────────────────────┘

FIBONACCI SCALAR: 144
- 1 USD = 144 Resonance (The 12th Fibonacci number)
- Represents the golden spiral of energy transformation

DEED WEIGHTS:
- manual_labor: 5.0 (Physical service)
- mentoring: 4.5 (Teaching/guiding)
- cleanup: 4.0 (Environmental restoration)
- community_service: 4.0
- healing_service: 4.5
- creative_offering: 3.0
- meditation: 1.0
"""

import hashlib
import time
import math
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

# The Fibonacci Scalar (12th Fibonacci number)
FIBONACCI_SCALAR = 144

# The White Light Buffer (Mathematical Encryption)
# Represents: (∞^∞) × (∞ - 1)
WHITE_LIGHT_POWER = 999_999_999.0

# Grace Pool Divisor
GRACE_DIVISOR = 1_000_000

# Solidification Threshold
SOLIDIFICATION_THRESHOLD = 5000

# Tesseract Frequency
TESSERACT_FREQUENCY = 963.0

# Deed Impact Weights
DEED_WEIGHTS = {
    "manual_labor": 5.0,
    "mentoring": 4.5,
    "healing_service": 4.5,
    "cleanup": 4.0,
    "community_service": 4.0,
    "environmental": 4.0,
    "creative_offering": 3.0,
    "donation": 2.0,
    "meditation": 1.0,
}


# ═══════════════════════════════════════════════════════════════════════════════
# TRANSACTION RECORDS
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class EnergyTransaction:
    """Record of recycled energy (donation)."""
    donor_id: str
    amount_usd: float
    resonance_added: float
    grace_after: float
    rainbow_key: str
    timestamp: float = field(default_factory=time.time)
    message: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "donor_id": self.donor_id,
            "amount_usd": self.amount_usd,
            "resonance_added": self.resonance_added,
            "grace_after": self.grace_after,
            "rainbow_key": self.rainbow_key,
            "timestamp": self.timestamp,
            "message": self.message,
        }


@dataclass
class KarmaTransaction:
    """Record of a good deed."""
    user_id: str
    deed_type: str
    hours: float
    base_impact: float
    grace_multiplier: float
    karma_earned: float
    total_karma: float
    is_solidified: bool
    rainbow_key: str
    timestamp: float = field(default_factory=time.time)
    description: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "deed_type": self.deed_type,
            "hours": self.hours,
            "base_impact": self.base_impact,
            "grace_multiplier": self.grace_multiplier,
            "karma_earned": self.karma_earned,
            "total_karma": self.total_karma,
            "is_solidified": self.is_solidified,
            "rainbow_key": self.rainbow_key,
            "timestamp": self.timestamp,
            "description": self.description,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# USER SANCTUARY (Individual Karma Vault)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class UserSanctuary:
    """Individual user's karma state within the Sanctuary."""
    user_id: str
    karma: float = 0.0
    is_solidified: bool = False
    deed_history: List[Dict] = field(default_factory=list)
    rainbow_keys: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    last_deed_at: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "karma": self.karma,
            "is_solidified": self.is_solidified,
            "deed_history": self.deed_history,
            "rainbow_keys": self.rainbow_keys,
            "created_at": self.created_at,
            "last_deed_at": self.last_deed_at,
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'UserSanctuary':
        return cls(
            user_id=data["user_id"],
            karma=data.get("karma", 0.0),
            is_solidified=data.get("is_solidified", False),
            deed_history=data.get("deed_history", []),
            rainbow_keys=data.get("rainbow_keys", []),
            created_at=data.get("created_at", time.time()),
            last_deed_at=data.get("last_deed_at"),
        )


# ═══════════════════════════════════════════════════════════════════════════════
# ENLIGHTEN.MINT.CAFE — The Unified System
# ═══════════════════════════════════════════════════════════════════════════════

class EnlightenMintCafe:
    """
    The Unified Positive Karma Machine.
    
    Multipliers: (∞^∞) × (∞ - 1)
    Frequency: 963Hz (The Tesseract)
    """
    
    def __init__(self, owner: str = "Steven Michael"):
        self.owner = owner
        
        # Global State
        self.resonance_pool = 0.0  # Global Donation Fund (100% Recycled)
        self.grace_multiplier = 1.0
        
        # User Sanctuaries (keyed by user_id)
        self._sanctuaries: Dict[str, UserSanctuary] = {}
        
        # Transaction History
        self.energy_transactions: List[EnergyTransaction] = []
        self.karma_transactions: List[KarmaTransaction] = []
        
        # Statistics
        self.total_donations_usd = 0.0
        self.total_karma_generated = 0.0
        self.total_solidifications = 0
        
        # THE WHITE LIGHT BUFFER (Mathematical Encryption)
        self.infinity = float('inf')
        # Note: We approximate ∞^∞ × (∞-1) as a large finite number for computation
        self.shield_power = WHITE_LIGHT_POWER
        
        logger.info(f"🏛️ [Sanctuary] EnlightenMintCafe initialized | Owner: {owner}")
        logger.info(f"   Shield Power: {self.shield_power} | Frequency: {TESSERACT_FREQUENCY}Hz")
    
    # ─────────────────────────────────────────────────────────────────────────
    # USER SANCTUARY MANAGEMENT
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_sanctuary(self, user_id: str) -> UserSanctuary:
        """Get or create a user's sanctuary."""
        if user_id not in self._sanctuaries:
            self._sanctuaries[user_id] = UserSanctuary(user_id=user_id)
        return self._sanctuaries[user_id]
    
    # ─────────────────────────────────────────────────────────────────────────
    # PERPETUAL RECYCLED FUND
    # ─────────────────────────────────────────────────────────────────────────
    
    def recycle_energy(
        self, 
        donor_id: str, 
        amount_usd: float, 
        message: str = ""
    ) -> Dict[str, Any]:
        """
        Recycles 100% of donations into the Global Grace Multiplier.
        
        Formula:
        - Resonance = USD × 144 (Fibonacci Scalar)
        - Grace = 1.0 + (pool / 1,000,000)
        
        Benefits:
        - More donations = Lower barriers for the WHOLE community
        - Donor receives Rainbow Key as receipt
        - Grace multiplies ALL future karma earnings
        """
        # Calculate resonance using Fibonacci scalar
        resonance_added = amount_usd * FIBONACCI_SCALAR
        
        old_grace = self.grace_multiplier
        self.resonance_pool += resonance_added
        self.total_donations_usd += amount_usd
        
        # Update grace multiplier (affects everyone's karma)
        self.grace_multiplier = 1.0 + (self.resonance_pool / GRACE_DIVISOR)
        
        # Generate rainbow key for donor
        rainbow_key = self._generate_rainbow_key(donor_id, resonance_added)
        
        # Get/create donor's sanctuary and add key
        sanctuary = self.get_sanctuary(donor_id)
        sanctuary.rainbow_keys.append(rainbow_key)
        
        # Record transaction
        transaction = EnergyTransaction(
            donor_id=donor_id,
            amount_usd=amount_usd,
            resonance_added=resonance_added,
            grace_after=self.grace_multiplier,
            rainbow_key=rainbow_key,
            message=message,
        )
        self.energy_transactions.append(transaction)
        
        logger.info(
            f"✨ [Sanctuary] ${amount_usd} recycled by {donor_id} | "
            f"Grace: {old_grace:.4f} → {self.grace_multiplier:.4f}"
        )
        
        return {
            "success": True,
            "message": f"✨ ${amount_usd} Recycled. Global Grace: {self.grace_multiplier:.2f}x",
            "donor_id": donor_id,
            "amount_usd": amount_usd,
            "resonance_added": resonance_added,
            "fibonacci_scalar": FIBONACCI_SCALAR,
            "old_grace": old_grace,
            "new_grace": self.grace_multiplier,
            "grace_increase": self.grace_multiplier - old_grace,
            "total_pool": self.resonance_pool,
            "rainbow_key": rainbow_key,
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # THE KARMA MACHINE
    # ─────────────────────────────────────────────────────────────────────────
    
    def log_good_deed(
        self,
        user_id: str,
        deed_type: str,
        hours: float,
        description: str = "",
    ) -> Dict[str, Any]:
        """
        Translates Physical Service into VR/Digital Access.
        
        Formula:
        - Base Impact: DEED_WEIGHTS[deed_type] (manual_labor = 5.0, etc.)
        - Karma Earned = (Impact × Hours × 100) × Grace Multiplier
        
        When karma >= 5,000: SOLIDIFICATION occurs, VR Gateway opens
        
        Returns rainbow key as proof of service.
        """
        # Validate deed type
        if deed_type not in DEED_WEIGHTS:
            return {
                "success": False,
                "error": f"Unknown deed type: {deed_type}",
                "valid_types": list(DEED_WEIGHTS.keys()),
            }
        
        # Get user's sanctuary
        sanctuary = self.get_sanctuary(user_id)
        
        # Calculate karma with grace multiplier
        base_impact = DEED_WEIGHTS[deed_type]
        karma_earned = (base_impact * hours * 100) * self.grace_multiplier
        
        old_karma = sanctuary.karma
        sanctuary.karma += karma_earned
        sanctuary.last_deed_at = time.time()
        self.total_karma_generated += karma_earned
        
        # Check for solidification (5,000 karma threshold)
        newly_solidified = False
        if not sanctuary.is_solidified and sanctuary.karma >= SOLIDIFICATION_THRESHOLD:
            sanctuary.is_solidified = True
            newly_solidified = True
            self.total_solidifications += 1
            logger.info(f"💎 [Sanctuary] {user_id} SOLIDIFIED at {sanctuary.karma:.0f} karma!")
        
        # Generate rainbow key
        rainbow_key = self._generate_rainbow_key(user_id, sanctuary.karma)
        sanctuary.rainbow_keys.append(rainbow_key)
        
        # Record transaction
        transaction = KarmaTransaction(
            user_id=user_id,
            deed_type=deed_type,
            hours=hours,
            base_impact=base_impact,
            grace_multiplier=self.grace_multiplier,
            karma_earned=karma_earned,
            total_karma=sanctuary.karma,
            is_solidified=sanctuary.is_solidified,
            rainbow_key=rainbow_key,
            description=description,
        )
        self.karma_transactions.append(transaction)
        sanctuary.deed_history.append(transaction.to_dict())
        
        logger.info(
            f"🙏 [Sanctuary] {user_id} +{karma_earned:.0f} karma "
            f"({deed_type} × {hours}h × {self.grace_multiplier:.2f}x) | "
            f"Total: {sanctuary.karma:.0f}"
        )
        
        # Build response
        response = {
            "success": True,
            "user_id": user_id,
            "deed_type": deed_type,
            "hours": hours,
            "base_impact": base_impact,
            "grace_multiplier": self.grace_multiplier,
            "karma_earned": karma_earned,
            "old_karma": old_karma,
            "new_karma": sanctuary.karma,
            "is_solidified": sanctuary.is_solidified,
            "rainbow_key": rainbow_key,
        }
        
        if newly_solidified:
            response["status"] = "SOLIDIFIED"
            response["message"] = "💎 Crystal Hardened. VR Gateway Open."
            response["vr_access"] = True
        else:
            response["status"] = "RESONATING"
            response["karma_to_solidify"] = max(0, SOLIDIFICATION_THRESHOLD - sanctuary.karma)
        
        return response
    
    # ─────────────────────────────────────────────────────────────────────────
    # RAINBOW CRYSTALLINE ENCRYPTION
    # ─────────────────────────────────────────────────────────────────────────
    
    def _generate_rainbow_key(self, user_id: str, value: float) -> str:
        """
        Mints a 72-bit Crystalline Access Key.
        
        Seed: {user_id}-{value}-{timestamp}-963HZ
        Method: 7-pass SHA256 refraction
        Format: RAINBOW-{18 uppercase hex}
        """
        seed = f"{self.owner}-{user_id}-{value}-{time.time()}-963HZ"
        
        # 7-pass refraction hash (rainbow encryption)
        rainbow_hash = seed
        for _ in range(7):
            rainbow_hash = hashlib.sha256(rainbow_hash.encode()).hexdigest()
        
        return f"RAINBOW-{rainbow_hash[:18].upper()}"
    
    def validate_rainbow_key(self, key: str) -> bool:
        """Validate rainbow key format."""
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
    # VR ACCESS CHECK
    # ─────────────────────────────────────────────────────────────────────────
    
    def check_vr_access(self, user_id: str) -> Dict[str, Any]:
        """
        Check if user can access VR sanctuary.
        
        Requirements:
        - Karma >= SOLIDIFICATION_THRESHOLD / grace_multiplier
        - OR already solidified
        """
        sanctuary = self.get_sanctuary(user_id)
        effective_threshold = SOLIDIFICATION_THRESHOLD / self.grace_multiplier
        
        can_access = sanctuary.is_solidified or sanctuary.karma >= effective_threshold
        
        return {
            "user_id": user_id,
            "can_access": can_access,
            "is_solidified": sanctuary.is_solidified,
            "karma": sanctuary.karma,
            "effective_threshold": effective_threshold,
            "base_threshold": SOLIDIFICATION_THRESHOLD,
            "grace_multiplier": self.grace_multiplier,
            "karma_needed": max(0, effective_threshold - sanctuary.karma),
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # STATUS & GETTERS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_global_status(self) -> Dict[str, Any]:
        """Get global Sanctuary status."""
        return {
            "owner": self.owner,
            "resonance_pool": self.resonance_pool,
            "grace_multiplier": self.grace_multiplier,
            "total_donations_usd": self.total_donations_usd,
            "total_karma_generated": self.total_karma_generated,
            "total_users": len(self._sanctuaries),
            "total_solidifications": self.total_solidifications,
            "shield_power": self.shield_power,
            "frequency": TESSERACT_FREQUENCY,
            "fibonacci_scalar": FIBONACCI_SCALAR,
            "effective_threshold": SOLIDIFICATION_THRESHOLD / self.grace_multiplier,
        }
    
    def get_user_status(self, user_id: str) -> Dict[str, Any]:
        """Get user's sanctuary status."""
        sanctuary = self.get_sanctuary(user_id)
        effective_threshold = SOLIDIFICATION_THRESHOLD / self.grace_multiplier
        
        return {
            "user_id": user_id,
            "karma": sanctuary.karma,
            "is_solidified": sanctuary.is_solidified,
            "total_deeds": len(sanctuary.deed_history),
            "total_keys": len(sanctuary.rainbow_keys),
            "latest_key": sanctuary.rainbow_keys[-1] if sanctuary.rainbow_keys else None,
            "karma_to_solidify": max(0, effective_threshold - sanctuary.karma),
            "effective_threshold": effective_threshold,
            "grace_multiplier": self.grace_multiplier,
            "created_at": sanctuary.created_at,
            "last_deed_at": sanctuary.last_deed_at,
        }
    
    def get_deed_types(self) -> Dict[str, Any]:
        """Get available deed types and weights."""
        return {
            "deed_types": DEED_WEIGHTS,
            "fibonacci_scalar": FIBONACCI_SCALAR,
            "karma_formula": "(impact × hours × 100) × grace_multiplier",
            "grace_multiplier": self.grace_multiplier,
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize for persistence."""
        return {
            "owner": self.owner,
            "resonance_pool": self.resonance_pool,
            "grace_multiplier": self.grace_multiplier,
            "total_donations_usd": self.total_donations_usd,
            "total_karma_generated": self.total_karma_generated,
            "total_solidifications": self.total_solidifications,
            "sanctuaries": {k: v.to_dict() for k, v in self._sanctuaries.items()},
            "energy_transactions": [t.to_dict() for t in self.energy_transactions],
            "karma_transactions": [t.to_dict() for t in self.karma_transactions],
        }


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_sanctuary: Optional[EnlightenMintCafe] = None

def get_sanctuary() -> EnlightenMintCafe:
    """Get the singleton Sanctuary instance."""
    global _sanctuary
    if _sanctuary is None:
        _sanctuary = EnlightenMintCafe()
    return _sanctuary
