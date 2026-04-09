"""
ENLIGHTEN.MINT.CAFE - Unified Sovereign Manifesto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Master deployment script combining:
- Frontend Layout Fix
- Production Backend Engine  
- Creator Mode Registry
- Module Factory System
"""
import os
from typing import Dict, Any, List
from datetime import datetime, timezone

# Import all engines
from .sovereign_production import enlighten_core, SovereignEngine
from .base_module import EnlightenModule, get_all_modules
from .crystal_seal import (
    secure_hash, 
    secure_hash_short, 
    sanitize_input,
    EconomyCommon,
    COMMUNAL_GOALS,
)


class UnifiedSovereign:
    """
    The Unified Sovereign Manifesto - Master Controller
    
    Orchestrates:
    - Module Factory (EnlightenModule)
    - Production Engine (SovereignEngine)  
    - Security Layer (CrystalSeal)
    - Creator Mode Registry
    """
    
    VERSION = "3.0.0"
    CODENAME = "OBSIDIAN_MANIFESTO"
    
    def __init__(self):
        self.core = enlighten_core
        self.modules = EnlightenModule.get_registry()
        self.initialized_at = datetime.now(timezone.utc).isoformat()
        self._creator_sessions = {}
        
    @property
    def status(self) -> Dict[str, Any]:
        """Get unified system status."""
        return {
            "version": self.VERSION,
            "codename": self.CODENAME,
            "initialized_at": self.initialized_at,
            "core_status": self.core.get_status(),
            "module_count": len(self.modules),
            "modules_registered": list(self.modules.keys()),
            "economy_fee": EconomyCommon.TRANSACTION_FEE,
        }
    
    def register_module(self, name: str, description: str = "") -> EnlightenModule:
        """Register a new module to the ecosystem."""
        module = EnlightenModule(name, description)
        self.modules[name] = module
        return module
    
    def get_module(self, name: str) -> EnlightenModule:
        """Get a registered module."""
        return self.modules.get(name)
    
    def execute_action(self, module_name: str, action: str, payload: Dict = None) -> Dict[str, Any]:
        """
        Execute an action through the unified system.
        Auto-handles security, logging, and Creator Mode sync.
        """
        module = self.get_module(module_name)
        if not module:
            return {
                "success": False,
                "error": f"Module '{module_name}' not registered",
            }
        
        # Execute with full audit trail
        result = module.execute(action, payload or {})
        
        # Sync to Creator Mode ledger
        creator_entry = {
            "module": module_name,
            "action": action,
            "payload_hash": secure_hash_short(str(payload)),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "signature": result.get("audit", {}).get("sig", ""),
        }
        
        return {
            **result,
            "creator_sync": creator_entry,
        }
    
    def start_creator_session(self, user_id: str) -> Dict[str, Any]:
        """Start a Creator Mode session for audit tracking."""
        session_id = secure_hash_short(f"creator_{user_id}_{datetime.now().isoformat()}")
        self._creator_sessions[session_id] = {
            "user_id": user_id,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "actions": [],
        }
        return {
            "session_id": session_id,
            "status": "active",
        }
    
    def log_creator_action(self, session_id: str, action: Dict[str, Any]) -> bool:
        """Log an action to a Creator Mode session."""
        if session_id not in self._creator_sessions:
            return False
        
        self._creator_sessions[session_id]["actions"].append({
            **action,
            "logged_at": datetime.now(timezone.utc).isoformat(),
        })
        return True
    
    def get_creator_session(self, session_id: str) -> Dict[str, Any]:
        """Get a Creator Mode session."""
        return self._creator_sessions.get(session_id, {})
    
    def health_check(self) -> Dict[str, Any]:
        """Perform full system health check."""
        module_health = {}
        for name, module in self.modules.items():
            try:
                status = module.get_status()
                module_health[name] = {
                    "healthy": True,
                    "action_count": status.get("action_count", 0),
                }
            except Exception as e:
                module_health[name] = {
                    "healthy": False,
                    "error": str(e),
                }
        
        return {
            "status": "OPERATIONAL",
            "version": self.VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "core": self.core.get_status(),
            "modules": module_health,
            "total_modules": len(self.modules),
            "healthy_modules": sum(1 for m in module_health.values() if m.get("healthy")),
        }
    
    def dispatch_notification(self, channel: str, to: str, content: str, **kwargs) -> Dict[str, Any]:
        """
        Unified notification dispatch through the Sovereign Engine.
        
        Args:
            channel: "sms" or "email"
            to: Recipient (phone or email)
            content: Message content
            **kwargs: Additional params (subject for email, etc.)
        """
        if channel == "sms":
            return self.core.dispatch_sms(to, content)
        elif channel == "email":
            subject = kwargs.get("subject", "ENLIGHTEN.MINT.CAFE Notification")
            html_content = kwargs.get("html_content")
            return self.core.dispatch_email(to, subject, content, html_content)
        else:
            return {"success": False, "error": f"Unknown channel: {channel}"}


# Initialize the Unified Sovereign
sovereign = UnifiedSovereign()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONVENIENCE EXPORTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def system_health() -> Dict[str, Any]:
    """Quick access to system health check."""
    return sovereign.health_check()

def system_status() -> Dict[str, Any]:
    """Quick access to system status."""
    return sovereign.status

def execute(module: str, action: str, payload: Dict = None) -> Dict[str, Any]:
    """Quick execute an action through the unified system."""
    return sovereign.execute_action(module, action, payload)

def notify(channel: str, to: str, content: str, **kwargs) -> Dict[str, Any]:
    """Quick dispatch a notification."""
    return sovereign.dispatch_notification(channel, to, content, **kwargs)


__all__ = [
    'UnifiedSovereign',
    'sovereign',
    'system_health',
    'system_status',
    'execute',
    'notify',
    # Re-export from other modules
    'EnlightenModule',
    'SovereignEngine',
    'enlighten_core',
    'secure_hash',
    'secure_hash_short',
    'sanitize_input',
    'get_all_modules',
]
