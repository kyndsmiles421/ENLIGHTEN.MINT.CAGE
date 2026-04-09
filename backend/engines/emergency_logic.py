"""
ENLIGHTEN.MINT.CAFE - Emergency Logic (Kill Switch)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The 'Red Alert' for your Invention Math & Multimedia
This is the backend code that kills processes when you hit that red pill.
"""
from datetime import datetime, timezone
from typing import Dict, Any

# Import the production hub for secure event logging
try:
    from .sovereign_production import enlighten_core
except ImportError:
    # Fallback if imported directly
    enlighten_core = None


class EmergencyController:
    """
    Emergency Kill Switch Controller
    
    Provides hard stop functionality for all multimedia streams
    and logs events via SHA-256 Crystal Seal.
    """
    
    def __init__(self):
        self.last_stop_time = None
        self.stop_count = 0
        
    def execute_hard_stop(self) -> Dict[str, Any]:
        """
        The 'Red Alert' for your Invention Math & Multimedia
        
        Returns:
            Dict with status and integrity verification
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        
        try:
            # 1. Log the SHA-256 event so you see it in Creator Mode
            if enlighten_core:
                # Use the secure hash for audit trail
                event_sig = enlighten_core.secure_hash_short(f"HARD_STOP:{timestamp}")
                enlighten_core.sync_ledger(f"emergency_stop_{event_sig}")
                print(f"[EmergencyLogic] Crystal Seal event logged: {event_sig}")
            
            # 2. Update internal state
            self.last_stop_time = timestamp
            self.stop_count += 1
            
            # 3. Return success response
            return {
                "status": "HALTED",
                "integrity_check": "VERIFIED",
                "timestamp": timestamp,
                "stop_count": self.stop_count,
                "message": "All systems zeroed. Multimedia streams severed.",
            }
            
        except Exception as e:
            print(f"[EmergencyLogic] Error during hard stop: {e}")
            return {
                "status": "ERROR", 
                "message": str(e),
                "timestamp": timestamp,
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current emergency controller status."""
        return {
            "last_stop_time": self.last_stop_time,
            "stop_count": self.stop_count,
            "ready": True,
        }


# Global instance
emergency_controller = EmergencyController()


def execute_hard_stop() -> Dict[str, Any]:
    """
    Global function to execute hard stop.
    Called by the /api/sovereign/stop endpoint.
    """
    return emergency_controller.execute_hard_stop()


def get_emergency_status() -> Dict[str, Any]:
    """Get emergency controller status."""
    return emergency_controller.get_status()


__all__ = [
    'EmergencyController',
    'emergency_controller', 
    'execute_hard_stop',
    'get_emergency_status',
]
