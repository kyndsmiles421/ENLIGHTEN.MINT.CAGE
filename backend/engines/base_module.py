# /app/backend/engines/base_module.py
"""
ENLIGHTEN.MINT.CAFE - Module Factory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Module Class for ecosystem-wide consistency.
Auto-handles SHA-256 security and Creator Mode audit logging.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .sovereign_production import enlighten_core


class EnlightenModule:
    """
    The template for every module in the ecosystem.
    
    Features:
    - Automatic SHA-256 signature generation
    - Creator Mode audit log sync
    - Standardized action tracking
    - Health monitoring
    
    Usage:
        crystal_module = EnlightenModule("Crystals")
        result = crystal_module.sync_to_creator({"action": "polish", "gem_id": "ruby_001"})
    """
    
    # Class-level registry of all modules
    _registry: Dict[str, 'EnlightenModule'] = {}
    
    def __init__(self, module_name: str, description: str = ""):
        self.module_name = module_name
        self.description = description
        self.core = enlighten_core
        self.created_at = datetime.now(timezone.utc).isoformat()
        self._action_count = 0
        self._last_action = None
        
        # Auto-register module
        EnlightenModule._registry[module_name] = self
        print(f"[EnlightenModule] Registered: {module_name}")
    
    @classmethod
    def get_registry(cls) -> Dict[str, 'EnlightenModule']:
        """Get all registered modules."""
        return cls._registry
    
    @classmethod
    def get_module(cls, name: str) -> Optional['EnlightenModule']:
        """Get a specific module by name."""
        return cls._registry.get(name)

    def sync_to_creator(self, action_data: Any) -> Dict[str, Any]:
        """
        Automatically logs every 'ins and outs' to Creator Mode.
        
        Args:
            action_data: Any data describing the action (dict, str, etc.)
            
        Returns:
            Dict with module name, signature, and sync status
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Generate SHA-256 signature
        data_str = str(action_data) if not isinstance(action_data, str) else action_data
        signature = self.core.secure_hash(f"{self.module_name}_{data_str}")
        
        # Track action
        self._action_count += 1
        self._last_action = {
            "data": action_data,
            "timestamp": timestamp,
            "signature": signature[:16],
        }
        
        # Prepare audit entry
        audit_entry = {
            "module": self.module_name,
            "action": action_data,
            "sig": signature,
            "sig_short": signature[:16],
            "timestamp": timestamp,
            "status": "Synced",
            "action_count": self._action_count,
        }
        
        # Log to console (Creator Mode can capture this)
        print(f"[CreatorMode] {self.module_name}: {signature[:12]}... | Action #{self._action_count}")
        
        return audit_entry
    
    def execute(self, action: str, payload: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute a module action with automatic audit logging.
        
        Args:
            action: Name of the action (e.g., "create", "update", "delete")
            payload: Action payload/parameters
            
        Returns:
            Result dict with action status and audit info
        """
        payload = payload or {}
        
        # Pre-action audit
        audit_data = {
            "action": action,
            "payload_keys": list(payload.keys()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        audit = self.sync_to_creator(audit_data)
        
        return {
            "module": self.module_name,
            "action": action,
            "payload": payload,
            "audit": audit,
            "success": True,
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get module status for health checks."""
        return {
            "module": self.module_name,
            "description": self.description,
            "created_at": self.created_at,
            "action_count": self._action_count,
            "last_action": self._last_action,
            "core_status": self.core.get_status() if hasattr(self.core, 'get_status') else "N/A",
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRE-REGISTERED CORE MODULES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Core Wellness Modules
crystal_module = EnlightenModule("Crystals", "Crystal healing and pairing system")
frequency_module = EnlightenModule("Frequencies", "Sacred frequency spectrum player")
meditation_module = EnlightenModule("Meditation", "Guided meditation sessions")
oracle_module = EnlightenModule("Oracle", "Divination and fortune systems")

# RPG/Starseed Modules
starseed_module = EnlightenModule("Starseed", "Starseed adventure and RPG mechanics")
evolution_module = EnlightenModule("Evolution", "Specimen evolution lab")
refinement_module = EnlightenModule("Refinement", "Gem polishing and refinement")
forge_module = EnlightenModule("Forge", "Cosmic forge mini-game")

# Knowledge Modules
encyclopedia_module = EnlightenModule("Encyclopedia", "Spiritual traditions encyclopedia")
sacred_texts_module = EnlightenModule("SacredTexts", "Sacred texts and scriptures")
creation_stories_module = EnlightenModule("CreationStories", "Mythological creation stories")

# Economy Modules
marketplace_module = EnlightenModule("Marketplace", "Cosmic marketplace and trading")
economy_module = EnlightenModule("Economy", "Dust, gems, and credits economy")

# Social Modules
coven_module = EnlightenModule("Coven", "Synchronicity and party system")
live_sessions_module = EnlightenModule("LiveSessions", "Live streaming sessions")

# Creator Module (Meta)
creator_module = EnlightenModule("CreatorMode", "Creator Mode audit and console")


def get_all_modules() -> Dict[str, Dict[str, Any]]:
    """Get status of all registered modules."""
    return {
        name: mod.get_status() 
        for name, mod in EnlightenModule.get_registry().items()
    }


__all__ = [
    'EnlightenModule',
    'crystal_module',
    'frequency_module',
    'meditation_module',
    'oracle_module',
    'starseed_module',
    'evolution_module',
    'refinement_module',
    'forge_module',
    'encyclopedia_module',
    'sacred_texts_module',
    'creation_stories_module',
    'marketplace_module',
    'economy_module',
    'coven_module',
    'live_sessions_module',
    'creator_module',
    'get_all_modules',
]
