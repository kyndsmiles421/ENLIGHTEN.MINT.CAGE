"""
CRYSTALLINE VAULT: Karma System & VR Gateway Unlocking
=======================================================

The spiritual layer of the Resonance system - good deeds solidify your crystal.

ARCHITECTURE:
┌────────────────────────────────────────────────────────────────────────────┐
│                       CRYSTALLINE VAULT                                    │
│                                                                            │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│   │   LOG DEED      │───▶│  ADD KARMA      │───▶│  CHECK UNLOCK   │       │
│   │  (Service Act)  │    │ (Impact × 100)  │    │  (5000 Karma)   │       │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘       │
│                                                         │                  │
│                                                         ▼                  │
│                              ┌──────────────────────────────────┐         │
│                              │   GENERATE SOVEREIGN KEY         │         │
│                              │   (72-bit SHA256 hash)           │         │
│                              │   VR Gateway Opens @ 963 Hz      │         │
│                              └──────────────────────────────────┘         │
│                                                                            │
│   KARMA THRESHOLDS:                                                        │
│   - 1000: Dim Crystal (Basic meditation)                                  │
│   - 2500: Luminous Crystal (Sanctuary access)                             │
│   - 5000: Radiant Crystal (VR Gateway opens)                              │
│   - 10000: Infinite Crystal (Full Tesseract access)                       │
│                                                                            │
│   DEED TYPES & IMPACT:                                                     │
│   - Manual Labor: 5.0 impact (physical service)                           │
│   - Community Service: 4.0 impact (helping others)                        │
│   - Environmental: 3.5 impact (nature restoration)                        │
│   - Mentoring: 3.0 impact (teaching/guiding)                              │
│   - Donation: 2.0 impact (financial giving)                               │
│   - Meditation: 1.0 impact (self-cultivation)                             │
└────────────────────────────────────────────────────────────────────────────┘
"""

import hashlib
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# KARMA THRESHOLDS & VR MODES
# ═══════════════════════════════════════════════════════════════════════════════

class CrystalState(Enum):
    """Crystal solidification states based on karma."""
    FORMING = "forming"           # 0 - 999 karma
    DIM = "dim"                   # 1000 - 2499 karma
    LUMINOUS = "luminous"         # 2500 - 4999 karma
    RADIANT = "radiant"           # 5000 - 9999 karma (VR Gateway opens)
    INFINITE = "infinite"         # 10000+ karma (Full access)


class VRMode(Enum):
    """Unlockable VR sanctuary modes."""
    VOID_MEDITATION = "Void_Meditation"           # Default
    BREATHING_CHAMBER = "Breathing_Chamber"       # 1000 karma
    SANCTUARY_GARDEN = "Sanctuary_Garden"         # 2500 karma
    CELESTIAL_DOME = "Celestial_Dome"             # 5000 karma
    CRYSTAL_CAVE = "Crystal_Cave"                 # 7500 karma
    INFINITE_LIBRARY = "Infinite_Library"         # 10000 karma
    TESSERACT_CORE = "Tesseract_Core"             # 15000 karma


# Karma thresholds for each VR mode
VR_UNLOCK_THRESHOLDS = {
    VRMode.VOID_MEDITATION: 0,
    VRMode.BREATHING_CHAMBER: 1000,
    VRMode.SANCTUARY_GARDEN: 2500,
    VRMode.CELESTIAL_DOME: 5000,
    VRMode.CRYSTAL_CAVE: 7500,
    VRMode.INFINITE_LIBRARY: 10000,
    VRMode.TESSERACT_CORE: 15000,
}

# Karma thresholds for crystal states
CRYSTAL_THRESHOLDS = {
    CrystalState.FORMING: 0,
    CrystalState.DIM: 1000,
    CrystalState.LUMINOUS: 2500,
    CrystalState.RADIANT: 5000,
    CrystalState.INFINITE: 10000,
}


# ═══════════════════════════════════════════════════════════════════════════════
# DEED TYPES & IMPACT SCORES
# ═══════════════════════════════════════════════════════════════════════════════

class DeedType(Enum):
    """Types of good deeds that generate karma."""
    MANUAL_LABOR = "manual_labor"           # Physical service work
    COMMUNITY_SERVICE = "community_service" # Helping others directly
    ENVIRONMENTAL = "environmental"         # Nature restoration/cleanup
    MENTORING = "mentoring"                 # Teaching/guiding others
    DONATION = "donation"                   # Financial giving
    MEDITATION = "meditation"               # Self-cultivation
    CREATIVE_OFFERING = "creative_offering" # Art/music for healing
    HEALING_SERVICE = "healing_service"     # Healthcare/wellness work


# Base impact scores for each deed type
DEED_IMPACT_SCORES = {
    DeedType.MANUAL_LABOR: 5.0,
    DeedType.COMMUNITY_SERVICE: 4.0,
    DeedType.ENVIRONMENTAL: 3.5,
    DeedType.MENTORING: 3.0,
    DeedType.DONATION: 2.0,
    DeedType.MEDITATION: 1.0,
    DeedType.CREATIVE_OFFERING: 2.5,
    DeedType.HEALING_SERVICE: 4.5,
}


# ═══════════════════════════════════════════════════════════════════════════════
# DEED RECORD
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class DeedRecord:
    """Record of a logged good deed."""
    deed_type: str
    description: str
    base_impact: float
    hours_spent: float
    karma_earned: float
    location: Optional[Dict[str, float]] = None
    witnesses: List[str] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "deed_type": self.deed_type,
            "description": self.description,
            "base_impact": self.base_impact,
            "hours_spent": self.hours_spent,
            "karma_earned": self.karma_earned,
            "location": self.location,
            "witnesses": self.witnesses,
            "timestamp": self.timestamp,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# CRYSTALLINE VAULT
# ═══════════════════════════════════════════════════════════════════════════════

class CrystallineVault:
    """
    Karma-based spiritual progression system.
    
    Good deeds solidify your crystal, unlocking VR sanctuaries
    and generating sovereign keys for higher realms.
    
    The 'Master Key' is generated from user identity + karma + secret salt.
    """
    
    def __init__(
        self,
        user_id: str,
        karma_points: float = 0,
        secret_salt: Optional[str] = None,
        unlocked_vr_modes: Optional[List[str]] = None,
        deed_history: Optional[List[Dict]] = None,
    ):
        self.user_id = user_id
        self.karma_points = karma_points
        
        # Secret salt for key generation (can be personalized)
        self.secret_salt = secret_salt or "CosmicCollective_2024_Universal"
        
        # Unlocked VR modes
        self.unlocked_vr_modes = unlocked_vr_modes or [VRMode.VOID_MEDITATION.value]
        
        # Deed history
        self.deed_history: List[DeedRecord] = []
        if deed_history:
            for d in deed_history:
                self.deed_history.append(DeedRecord(**d))
        
        # Stats
        self.total_deeds = len(self.deed_history)
        self.created_at = time.time()
        self.last_deed_at: Optional[float] = None
        
        # Current sovereign key (regenerated on karma changes)
        self._sovereign_key: Optional[str] = None
        
        logger.info(f"💎 [CrystallineVault] Initialized for {user_id}: {karma_points:.0f} karma")
    
    # ─────────────────────────────────────────────────────────────────────────
    # SOVEREIGN KEY GENERATION
    # ─────────────────────────────────────────────────────────────────────────
    
    def _generate_sovereign_key(self) -> str:
        """
        Mint the 72-bit key to unlock the VR Sanctuary.
        
        The key is derived from:
        - User ID (identity)
        - Karma points (spiritual progress)
        - Secret salt (personalized seed)
        """
        key_seed = f"{self.user_id}-{int(self.karma_points)}-{self.secret_salt}"
        full_hash = hashlib.sha256(key_seed.encode()).hexdigest()
        
        # Extract 72-bit (18 hex characters)
        sovereign_key = full_hash[:18]
        self._sovereign_key = sovereign_key
        
        return sovereign_key
    
    def get_sovereign_key(self) -> str:
        """Get the current sovereign key (regenerate if needed)."""
        if self._sovereign_key is None:
            self._generate_sovereign_key()
        return self._sovereign_key
    
    # ─────────────────────────────────────────────────────────────────────────
    # CRYSTAL STATE
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_crystal_state(self) -> CrystalState:
        """Get current crystal solidification state based on karma."""
        if self.karma_points >= 10000:
            return CrystalState.INFINITE
        elif self.karma_points >= 5000:
            return CrystalState.RADIANT
        elif self.karma_points >= 2500:
            return CrystalState.LUMINOUS
        elif self.karma_points >= 1000:
            return CrystalState.DIM
        else:
            return CrystalState.FORMING
    
    def get_resonance_frequency(self) -> float:
        """Get resonance frequency based on crystal state."""
        state = self.get_crystal_state()
        frequencies = {
            CrystalState.FORMING: 111.0,
            CrystalState.DIM: 432.0,
            CrystalState.LUMINOUS: 528.0,
            CrystalState.RADIANT: 852.0,
            CrystalState.INFINITE: 963.0,
        }
        return frequencies.get(state, 111.0)
    
    # ─────────────────────────────────────────────────────────────────────────
    # DEED LOGGING
    # ─────────────────────────────────────────────────────────────────────────
    
    def log_good_deed(
        self,
        deed_type: str,
        description: str = "",
        hours_spent: float = 1.0,
        impact_multiplier: float = 1.0,
        location: Optional[Dict[str, float]] = None,
        witnesses: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Process a good deed and 'Solidify' the crystal.
        
        Karma formula: base_impact × hours_spent × multiplier × 100
        
        Args:
            deed_type: Type of deed (manual_labor, community_service, etc.)
            description: What was done
            hours_spent: Time invested
            impact_multiplier: Additional multiplier for exceptional deeds
            location: GPS coordinates if applicable
            witnesses: Other users who can verify
            
        Returns:
            Dict with status, karma earned, and potential unlocks
        """
        # Validate deed type
        try:
            dtype = DeedType(deed_type)
        except ValueError:
            return {
                "success": False,
                "error": f"Unknown deed type: {deed_type}",
                "valid_types": [d.value for d in DeedType],
            }
        
        # Calculate karma
        base_impact = DEED_IMPACT_SCORES.get(dtype, 1.0)
        karma_earned = base_impact * hours_spent * impact_multiplier * 100
        
        old_karma = self.karma_points
        old_state = self.get_crystal_state()
        
        # Add karma
        self.karma_points += karma_earned
        self.total_deeds += 1
        self.last_deed_at = time.time()
        
        # Record deed
        record = DeedRecord(
            deed_type=deed_type,
            description=description,
            base_impact=base_impact,
            hours_spent=hours_spent,
            karma_earned=karma_earned,
            location=location,
            witnesses=witnesses or [],
        )
        self.deed_history.append(record)
        
        # Check for state changes and unlocks
        new_state = self.get_crystal_state()
        newly_unlocked = self._check_vr_unlocks()
        
        # Regenerate sovereign key
        self._generate_sovereign_key()
        
        logger.info(
            f"✨ [Karma] {self.user_id} +{karma_earned:.0f} karma "
            f"({deed_type}) | Total: {self.karma_points:.0f}"
        )
        
        # Build response
        response = {
            "success": True,
            "deed_type": deed_type,
            "description": description,
            "karma_earned": karma_earned,
            "old_karma": old_karma,
            "new_karma": self.karma_points,
            "crystal_state": new_state.value,
            "resonance": self.get_resonance_frequency(),
        }
        
        # Check if we hit the VR Gateway threshold
        if old_state != CrystalState.RADIANT and new_state == CrystalState.RADIANT:
            response["status"] = "SOLIDIFIED"
            response["message"] = "Crystal Hardened. VR Gateway Open."
            response["access_key"] = self._sovereign_key
            response["unlocked_mode"] = VRMode.CELESTIAL_DOME.value
        elif newly_unlocked:
            response["status"] = "RESONATING"
            response["message"] = f"New VR mode unlocked: {newly_unlocked[-1]}"
            response["newly_unlocked"] = newly_unlocked
        else:
            response["status"] = "RESONATING"
            next_threshold = self._get_next_threshold()
            response["points_needed"] = max(0, next_threshold - self.karma_points)
            response["next_unlock"] = self._get_next_unlock()
        
        return response
    
    def _check_vr_unlocks(self) -> List[str]:
        """Check and unlock any new VR modes based on karma."""
        newly_unlocked = []
        
        for mode, threshold in VR_UNLOCK_THRESHOLDS.items():
            if self.karma_points >= threshold and mode.value not in self.unlocked_vr_modes:
                self.unlocked_vr_modes.append(mode.value)
                newly_unlocked.append(mode.value)
                logger.info(f"🔓 [VR] {self.user_id} unlocked: {mode.value}")
        
        return newly_unlocked
    
    def _get_next_threshold(self) -> float:
        """Get karma needed for next crystal state."""
        thresholds = sorted(CRYSTAL_THRESHOLDS.values())
        for t in thresholds:
            if self.karma_points < t:
                return t
        return thresholds[-1]
    
    def _get_next_unlock(self) -> Optional[str]:
        """Get next VR mode to unlock."""
        for mode, threshold in sorted(VR_UNLOCK_THRESHOLDS.items(), key=lambda x: x[1]):
            if mode.value not in self.unlocked_vr_modes:
                return mode.value
        return None
    
    # ─────────────────────────────────────────────────────────────────────────
    # GETTERS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_status(self) -> Dict[str, Any]:
        """Get full vault status."""
        state = self.get_crystal_state()
        return {
            "user_id": self.user_id,
            "karma_points": self.karma_points,
            "crystal_state": state.value,
            "resonance": self.get_resonance_frequency(),
            "sovereign_key": self.get_sovereign_key(),
            "unlocked_vr_modes": self.unlocked_vr_modes,
            "total_deeds": self.total_deeds,
            "last_deed_at": self.last_deed_at,
            "next_unlock": self._get_next_unlock(),
            "points_to_next": max(0, self._get_next_threshold() - self.karma_points),
        }
    
    def get_deed_history(self, limit: int = 20) -> List[Dict]:
        """Get recent deed history."""
        recent = self.deed_history[-limit:]
        return [d.to_dict() for d in reversed(recent)]
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize for database storage."""
        return {
            "user_id": self.user_id,
            "karma_points": self.karma_points,
            "secret_salt": self.secret_salt,
            "unlocked_vr_modes": self.unlocked_vr_modes,
            "deed_history": [d.to_dict() for d in self.deed_history],
            "total_deeds": self.total_deeds,
            "created_at": self.created_at,
            "last_deed_at": self.last_deed_at,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CrystallineVault':
        """Deserialize from database."""
        vault = cls(
            user_id=data["user_id"],
            karma_points=data.get("karma_points", 0),
            secret_salt=data.get("secret_salt"),
            unlocked_vr_modes=data.get("unlocked_vr_modes"),
            deed_history=data.get("deed_history"),
        )
        vault.total_deeds = data.get("total_deeds", len(vault.deed_history))
        vault.created_at = data.get("created_at", time.time())
        vault.last_deed_at = data.get("last_deed_at")
        return vault


# ═══════════════════════════════════════════════════════════════════════════════
# KARMA MANAGER (In-Memory Cache + DB Persistence)
# ═══════════════════════════════════════════════════════════════════════════════

class KarmaManager:
    """Manages all user karma vaults with caching and persistence."""
    
    def __init__(self, db=None):
        self._vaults: Dict[str, CrystallineVault] = {}
        self._db = db
        self._collection_name = "crystalline_vaults"
        
        logger.info("🏛️ [KarmaManager] Initialized")
    
    def set_db(self, db):
        """Set the database connection."""
        self._db = db
    
    async def get_vault(self, user_id: str) -> CrystallineVault:
        """Get or create a karma vault for a user."""
        # Check cache
        if user_id in self._vaults:
            return self._vaults[user_id]
        
        # Check DB
        if self._db is not None:
            doc = await self._db[self._collection_name].find_one(
                {"user_id": user_id},
                {"_id": 0}
            )
            if doc:
                vault = CrystallineVault.from_dict(doc)
                self._vaults[user_id] = vault
                return vault
        
        # Create new
        vault = CrystallineVault(user_id)
        self._vaults[user_id] = vault
        
        # Save to DB
        if self._db is not None:
            await self._db[self._collection_name].insert_one(vault.to_dict())
        
        return vault
    
    async def save_vault(self, vault: CrystallineVault):
        """Persist vault to database."""
        if self._db is not None:
            await self._db[self._collection_name].update_one(
                {"user_id": vault.user_id},
                {"$set": vault.to_dict()},
                upsert=True
            )
    
    async def get_karma_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by karma."""
        if self._db is None:
            sorted_vaults = sorted(
                self._vaults.values(),
                key=lambda v: v.karma_points,
                reverse=True
            )[:limit]
            return [v.get_status() for v in sorted_vaults]
        
        cursor = self._db[self._collection_name].find(
            {},
            {"_id": 0}
        ).sort("karma_points", -1).limit(limit)
        
        results = []
        async for doc in cursor:
            vault = CrystallineVault.from_dict(doc)
            results.append(vault.get_status())
        
        return results


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_karma_manager: Optional[KarmaManager] = None

def get_karma_manager() -> KarmaManager:
    """Get the singleton karma manager instance."""
    global _karma_manager
    if _karma_manager is None:
        _karma_manager = KarmaManager()
    return _karma_manager
