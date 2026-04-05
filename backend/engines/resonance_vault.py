"""
RESONANCE VAULT: User Wallet & Seed Ownership
==============================================

Personal wallet tracking resonance balance and owned seeds.

ARCHITECTURE:
┌────────────────────────────────────────────────────────────────────────────┐
│                         RESONANCE VAULT                                    │
│                                                                            │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│   │  HARVEST SEED   │───▶│   ADD DEPOSIT   │───▶│   UPDATE DB     │       │
│   │  (from XR RPG)  │    │ (with 10x mult) │    │  (MongoDB)      │       │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘       │
│                                                                            │
│   OWNERSHIP MODEL:                                                         │
│   - Each 72-bit seed becomes OWNED by harvester's sovereign ID             │
│   - Seeds can be traded/transferred between vaults                         │
│   - Total resonance is the user's "currency" balance                       │
│                                                                            │
│   KEITH WRIGHT'S PRINCIPLE:                                                │
│   "The seed you collect becomes part of your sovereign identity.           │
│    Its resonance frequency forever echoes in your cosmic signature."       │
└────────────────────────────────────────────────────────────────────────────┘
"""

import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# HARVEST RECORD
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class HarvestRecord:
    """Record of a single seed harvest."""
    seed_id: str
    node_id: str
    amount: float
    base_resonance: float
    multiplier: float
    radiance: str
    source_module: str
    coordinates: Dict[str, float]
    harvested_at: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "seed_id": self.seed_id,
            "node_id": self.node_id,
            "amount": self.amount,
            "base_resonance": self.base_resonance,
            "multiplier": self.multiplier,
            "radiance": self.radiance,
            "source_module": self.source_module,
            "coordinates": self.coordinates,
            "harvested_at": self.harvested_at,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# RESONANCE VAULT
# ═══════════════════════════════════════════════════════════════════════════════

class ResonanceVault:
    """
    Personal Resonance Wallet.
    
    Tracks the user's:
    - Total resonance balance (spendable currency)
    - Seeds collected (72-bit ownership records)
    - Harvest history with full metadata
    
    Each harvested seed becomes OWNED by the user's sovereign ID,
    creating a permanent link between the cosmic seed and the collector.
    """
    
    def __init__(
        self, 
        user_id: str,
        initial_resonance: float = 0.0,
        seeds_collected: Optional[List[str]] = None,
        harvest_history: Optional[List[Dict]] = None,
    ):
        self.user_id = user_id
        self.total_resonance = initial_resonance
        self.seeds_collected: List[str] = seeds_collected or []
        self.harvest_history: List[HarvestRecord] = []
        
        # Rebuild harvest records from dict history
        if harvest_history:
            for h in harvest_history:
                self.harvest_history.append(HarvestRecord(**h))
        
        # Stats
        self.total_harvests = len(self.seeds_collected)
        self.created_at = time.time()
        self.last_harvest_at: Optional[float] = None
        
        logger.info(f"💎 [Vault] Initialized for {user_id}: {self.total_resonance:.0f} resonance")
    
    def add_harvest(
        self,
        amount: float,
        seed_id: str,
        node_id: str,
        base_resonance: float,
        multiplier: float,
        radiance: str,
        source_module: str,
        coordinates: Dict[str, float],
    ) -> Dict[str, Any]:
        """
        Deposit harvested resonance and record seed ownership.
        
        The White Light Multiplier has already been applied to the amount
        by the XR engine before reaching here.
        
        Args:
            amount: Final resonance amount (after multiplier)
            seed_id: 72-bit seed hash
            node_id: Short node ID
            base_resonance: Original frequency before multiplier
            multiplier: Radiance multiplier applied
            radiance: Radiance tier name
            source_module: Module that generated the seed
            coordinates: GPS location of harvest
            
        Returns:
            Dict with new balance and harvest record
        """
        # Check if already owned
        if seed_id in self.seeds_collected:
            return {
                "success": False,
                "error": "Seed already in vault",
                "seed_id": seed_id,
            }
        
        # Add to balance
        old_balance = self.total_resonance
        self.total_resonance += amount
        
        # Record ownership
        self.seeds_collected.append(seed_id)
        self.total_harvests += 1
        self.last_harvest_at = time.time()
        
        # Create harvest record
        record = HarvestRecord(
            seed_id=seed_id,
            node_id=node_id,
            amount=amount,
            base_resonance=base_resonance,
            multiplier=multiplier,
            radiance=radiance,
            source_module=source_module,
            coordinates=coordinates,
        )
        self.harvest_history.append(record)
        
        logger.info(
            f"💎 [Vault] {self.user_id} deposited +{amount:.0f} resonance "
            f"(seed: {seed_id[:12]}...) | Balance: {self.total_resonance:.0f}"
        )
        
        return {
            "success": True,
            "message": f"Deposited +{amount:.0f} resonance",
            "seed_id": seed_id,
            "amount_deposited": amount,
            "old_balance": old_balance,
            "new_balance": self.total_resonance,
            "total_seeds": len(self.seeds_collected),
            "harvest_record": record.to_dict(),
        }
    
    def spend_resonance(self, amount: float, reason: str = "") -> Dict[str, Any]:
        """
        Spend resonance from the vault.
        
        Used for:
        - Purchasing items in the Phygital Marketplace
        - Unlocking premium content
        - Minting new seeds
        """
        if amount > self.total_resonance:
            return {
                "success": False,
                "error": "Insufficient resonance",
                "required": amount,
                "available": self.total_resonance,
            }
        
        old_balance = self.total_resonance
        self.total_resonance -= amount
        
        logger.info(
            f"💸 [Vault] {self.user_id} spent {amount:.0f} resonance "
            f"({reason}) | Balance: {self.total_resonance:.0f}"
        )
        
        return {
            "success": True,
            "message": f"Spent {amount:.0f} resonance",
            "reason": reason,
            "amount_spent": amount,
            "old_balance": old_balance,
            "new_balance": self.total_resonance,
        }
    
    def transfer_seed(
        self, 
        seed_id: str, 
        to_vault: 'ResonanceVault'
    ) -> Dict[str, Any]:
        """
        Transfer seed ownership to another vault.
        
        Note: This transfers ownership only, not resonance.
        """
        if seed_id not in self.seeds_collected:
            return {
                "success": False,
                "error": "Seed not owned by this vault",
            }
        
        # Remove from this vault
        self.seeds_collected.remove(seed_id)
        
        # Add to target vault
        to_vault.seeds_collected.append(seed_id)
        
        logger.info(
            f"🔄 [Vault] Seed {seed_id[:12]}... transferred "
            f"from {self.user_id} to {to_vault.user_id}"
        )
        
        return {
            "success": True,
            "message": f"Seed transferred to {to_vault.user_id}",
            "seed_id": seed_id,
            "from_user": self.user_id,
            "to_user": to_vault.user_id,
        }
    
    def get_balance(self) -> Dict[str, Any]:
        """Get current vault balance and stats."""
        return {
            "user_id": self.user_id,
            "total_resonance": self.total_resonance,
            "seeds_owned": len(self.seeds_collected),
            "total_harvests": self.total_harvests,
            "last_harvest_at": self.last_harvest_at,
            "created_at": self.created_at,
        }
    
    def get_seeds(self, limit: int = 50) -> List[str]:
        """Get list of owned seed IDs."""
        return self.seeds_collected[:limit]
    
    def get_harvest_history(self, limit: int = 20) -> List[Dict]:
        """Get recent harvest history."""
        recent = self.harvest_history[-limit:]
        return [h.to_dict() for h in reversed(recent)]
    
    def owns_seed(self, seed_id: str) -> bool:
        """Check if vault owns a specific seed."""
        return seed_id in self.seeds_collected
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize vault for database storage."""
        return {
            "user_id": self.user_id,
            "total_resonance": self.total_resonance,
            "seeds_collected": self.seeds_collected,
            "harvest_history": [h.to_dict() for h in self.harvest_history],
            "total_harvests": self.total_harvests,
            "created_at": self.created_at,
            "last_harvest_at": self.last_harvest_at,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ResonanceVault':
        """Deserialize vault from database."""
        vault = cls(
            user_id=data["user_id"],
            initial_resonance=data.get("total_resonance", 0),
            seeds_collected=data.get("seeds_collected", []),
            harvest_history=data.get("harvest_history", []),
        )
        vault.total_harvests = data.get("total_harvests", len(vault.seeds_collected))
        vault.created_at = data.get("created_at", time.time())
        vault.last_harvest_at = data.get("last_harvest_at")
        return vault


# ═══════════════════════════════════════════════════════════════════════════════
# VAULT MANAGER (In-Memory Cache + DB Persistence)
# ═══════════════════════════════════════════════════════════════════════════════

class VaultManager:
    """
    Manages all user vaults with in-memory cache and MongoDB persistence.
    """
    
    def __init__(self, db=None):
        self._vaults: Dict[str, ResonanceVault] = {}
        self._db = db
        self._collection_name = "resonance_vaults"
        
        logger.info("🏦 [VaultManager] Initialized")
    
    def set_db(self, db):
        """Set the database connection (called after app startup)."""
        self._db = db
    
    async def get_vault(self, user_id: str) -> ResonanceVault:
        """
        Get or create a vault for a user.
        
        Checks cache first, then DB, then creates new.
        """
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
                vault = ResonanceVault.from_dict(doc)
                self._vaults[user_id] = vault
                return vault
        
        # Create new
        vault = ResonanceVault(user_id)
        self._vaults[user_id] = vault
        
        # Save to DB
        if self._db is not None:
            await self._db[self._collection_name].insert_one(vault.to_dict())
        
        return vault
    
    async def save_vault(self, vault: ResonanceVault):
        """Persist vault to database."""
        if self._db is not None:
            await self._db[self._collection_name].update_one(
                {"user_id": vault.user_id},
                {"$set": vault.to_dict()},
                upsert=True
            )
    
    async def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by resonance balance."""
        if self._db is None:
            # Fall back to in-memory
            sorted_vaults = sorted(
                self._vaults.values(),
                key=lambda v: v.total_resonance,
                reverse=True
            )[:limit]
            return [v.get_balance() for v in sorted_vaults]
        
        # Query DB
        cursor = self._db[self._collection_name].find(
            {},
            {"_id": 0, "user_id": 1, "total_resonance": 1, "seeds_collected": 1}
        ).sort("total_resonance", -1).limit(limit)
        
        results = []
        async for doc in cursor:
            results.append({
                "user_id": doc["user_id"],
                "total_resonance": doc.get("total_resonance", 0),
                "seeds_owned": len(doc.get("seeds_collected", [])),
            })
        
        return results
    
    async def get_global_stats(self) -> Dict[str, Any]:
        """Get global vault statistics."""
        if self._db is None:
            total_resonance = sum(v.total_resonance for v in self._vaults.values())
            total_seeds = sum(len(v.seeds_collected) for v in self._vaults.values())
            return {
                "total_vaults": len(self._vaults),
                "total_resonance_stored": total_resonance,
                "total_seeds_owned": total_seeds,
            }
        
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_vaults": {"$sum": 1},
                    "total_resonance": {"$sum": "$total_resonance"},
                    "total_seeds": {"$sum": {"$size": {"$ifNull": ["$seeds_collected", []]}}},
                }
            }
        ]
        
        result = await self._db[self._collection_name].aggregate(pipeline).to_list(1)
        
        if result:
            return {
                "total_vaults": result[0]["total_vaults"],
                "total_resonance_stored": result[0]["total_resonance"],
                "total_seeds_owned": result[0]["total_seeds"],
            }
        
        return {
            "total_vaults": 0,
            "total_resonance_stored": 0,
            "total_seeds_owned": 0,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_vault_manager: Optional[VaultManager] = None

def get_vault_manager() -> VaultManager:
    """Get the singleton vault manager instance."""
    global _vault_manager
    if _vault_manager is None:
        _vault_manager = VaultManager()
    return _vault_manager
