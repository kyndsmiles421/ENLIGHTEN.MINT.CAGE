"""
@project ENLIGHTEN.MINT.CAFE
@module VIBRATIONAL_ECONOMY_MAPPING
@directive SCHUMANN_SYNC_MASTERY
@author Steven_with_a_V

Syncs node interaction with the Schumann Frequency (7.83 Hz).
PHI-scaled tier frequencies for access validation.
Triggers Silence Shield on frequency mismatch.
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum
import time


# SYSTEM CONSTANTS (LOCKED)
SCHUMANN_BASE = 7.83  # Hz - Earth's heartbeat
PHI = 1.618
FREQUENCY_TOLERANCE = 0.1  # Hz tolerance for matching


class MasteryLevel(Enum):
    """The four tiers of vibrational mastery."""
    GROUNDED = 0   # Base Schumann (7.83 Hz)
    FLOW = 1       # PHI¹ scaled (12.67 Hz)
    INSIGHT = 2    # PHI² scaled (20.49 Hz)
    MASTERY = 3    # PHI³ scaled (33.15 Hz)


class AccessResult(Enum):
    """Interaction validation results."""
    ACCESS_GRANTED = "ACCESS_GRANTED"
    RESISTANCE_DETECTED = "RESISTANCE_DETECTED"
    FREQUENCY_CALIBRATING = "FREQUENCY_CALIBRATING"
    SILENCE_SHIELD_ACTIVE = "SILENCE_SHIELD_ACTIVE"


@dataclass
class TargetNode:
    """Represents a node with tier-locked frequency requirement."""
    id: str
    name: str
    tier: int
    required_freq: float = 0.0
    
    def __post_init__(self):
        # Calculate required frequency based on tier
        self.required_freq = SCHUMANN_BASE * (PHI ** self.tier)


@dataclass
class UserVibrationalState:
    """Tracks user's current vibrational frequency and history."""
    user_id: str
    current_freq: float = SCHUMANN_BASE
    mastery_tier: int = 0
    calibration_count: int = 0
    access_history: List[Dict] = field(default_factory=list)
    last_interaction: float = 0.0
    
    def update_frequency(self, new_freq: float):
        """Update user's vibrational frequency."""
        self.current_freq = new_freq
        self.last_interaction = time.time()
        
        # Determine mastery tier from frequency
        for tier in range(4):
            tier_freq = SCHUMANN_BASE * (PHI ** tier)
            if abs(self.current_freq - tier_freq) < FREQUENCY_TOLERANCE:
                self.mastery_tier = tier
                break


class MasteryTierManager:
    """
    VIBRATIONAL ECONOMY MAPPING
    
    Manages tier-based access control using Schumann-PHI frequencies.
    Only allows interaction when user vibration matches node requirement.
    """
    
    def __init__(self):
        self.base_freq = SCHUMANN_BASE
        self.phi = PHI
        self.tolerance = FREQUENCY_TOLERANCE
        self.tiers = {
            0: "GROUNDED",
            1: "FLOW", 
            2: "INSIGHT", 
            3: "MASTERY"
        }
        self.tier_frequencies = self._calculate_tier_frequencies()
        self.users: Dict[str, UserVibrationalState] = {}
        self.silence_shield_active = False
    
    def _calculate_tier_frequencies(self) -> Dict[int, float]:
        """Pre-calculate frequency thresholds for each tier."""
        return {
            tier: self.base_freq * (self.phi ** tier)
            for tier in self.tiers.keys()
        }
    
    def get_tier_frequency(self, tier: int) -> float:
        """Get the required frequency for a tier."""
        return self.tier_frequencies.get(tier, self.base_freq)
    
    def get_tier_name(self, tier: int) -> str:
        """Get the name of a mastery tier."""
        return self.tiers.get(tier, "UNKNOWN")
    
    def validate_interaction(
        self, 
        user_freq: float, 
        target_node: TargetNode
    ) -> AccessResult:
        """
        Only allows interaction if the user's current 'Vibration'
        matches the node's Tiered Frequency.
        
        Args:
            user_freq: User's current vibrational frequency
            target_node: The node being accessed
        
        Returns:
            AccessResult indicating success or resistance type
        """
        required_freq = self.base_freq * (self.phi ** target_node.tier)
        frequency_delta = abs(user_freq - required_freq)
        
        if frequency_delta < self.tolerance:
            return AccessResult.ACCESS_GRANTED
        else:
            # Triggers the Silence Shield if mismatched
            self.silence_shield_active = True
            return AccessResult.RESISTANCE_DETECTED
    
    def validate_user_access(
        self, 
        user_id: str, 
        target_node: TargetNode
    ) -> Dict[str, Any]:
        """
        Full validation with user state tracking.
        
        Returns detailed access report.
        """
        # Get or create user state
        if user_id not in self.users:
            self.users[user_id] = UserVibrationalState(user_id=user_id)
        
        user = self.users[user_id]
        required_freq = self.get_tier_frequency(target_node.tier)
        frequency_delta = abs(user.current_freq - required_freq)
        
        # Determine access result
        if frequency_delta < self.tolerance:
            result = AccessResult.ACCESS_GRANTED
            self.silence_shield_active = False
        elif frequency_delta < self.tolerance * 3:
            result = AccessResult.FREQUENCY_CALIBRATING
        else:
            result = AccessResult.RESISTANCE_DETECTED
            self.silence_shield_active = True
        
        # Log interaction
        interaction_log = {
            "timestamp": time.time(),
            "target_node": target_node.id,
            "target_tier": target_node.tier,
            "required_freq": required_freq,
            "user_freq": user.current_freq,
            "delta": frequency_delta,
            "result": result.value
        }
        user.access_history.append(interaction_log)
        
        return {
            "result": result.value,
            "user_freq": user.current_freq,
            "required_freq": required_freq,
            "frequency_delta": frequency_delta,
            "tolerance": self.tolerance,
            "tier_name": self.get_tier_name(target_node.tier),
            "silence_shield": self.silence_shield_active,
            "calibration_hint": self._get_calibration_hint(user.current_freq, required_freq)
        }
    
    def _get_calibration_hint(self, current: float, required: float) -> str:
        """Provide hint for frequency calibration."""
        delta = required - current
        if abs(delta) < self.tolerance:
            return "RESONANCE_ACHIEVED"
        elif delta > 0:
            return f"RAISE_VIBRATION_BY_{delta:.2f}Hz"
        else:
            return f"GROUND_VIBRATION_BY_{abs(delta):.2f}Hz"
    
    def calibrate_user(self, user_id: str, target_tier: int) -> Dict[str, Any]:
        """
        Calibrate user to a specific tier frequency.
        Used for progression/upgrade mechanics.
        """
        if user_id not in self.users:
            self.users[user_id] = UserVibrationalState(user_id=user_id)
        
        user = self.users[user_id]
        target_freq = self.get_tier_frequency(target_tier)
        
        # Update user state
        user.update_frequency(target_freq)
        user.calibration_count += 1
        
        return {
            "user_id": user_id,
            "new_frequency": target_freq,
            "new_tier": target_tier,
            "tier_name": self.get_tier_name(target_tier),
            "calibration_count": user.calibration_count,
            "status": "CALIBRATION_COMPLETE"
        }
    
    def get_tier_map(self) -> Dict[str, Any]:
        """Return the complete tier frequency map."""
        return {
            "base_frequency": self.base_freq,
            "phi_multiplier": self.phi,
            "tolerance": self.tolerance,
            "tiers": [
                {
                    "level": tier,
                    "name": name,
                    "frequency": self.tier_frequencies[tier],
                    "formula": f"{self.base_freq} × PHI^{tier}"
                }
                for tier, name in self.tiers.items()
            ]
        }
    
    def get_state(self) -> Dict[str, Any]:
        """Return manager state."""
        return {
            "base_freq": self.base_freq,
            "phi": self.phi,
            "silence_shield_active": self.silence_shield_active,
            "registered_users": len(self.users),
            "tier_frequencies": self.tier_frequencies
        }


def create_mastery_manager() -> MasteryTierManager:
    """Factory function for MasteryTierManager."""
    return MasteryTierManager()


def create_target_node(
    node_id: str, 
    name: str, 
    tier: int
) -> TargetNode:
    """Factory function for TargetNode."""
    return TargetNode(id=node_id, name=name, tier=tier)


# Export
__all__ = [
    'MasteryTierManager',
    'MasteryLevel',
    'AccessResult',
    'TargetNode',
    'UserVibrationalState',
    'create_mastery_manager',
    'create_target_node',
    'SCHUMANN_BASE',
    'PHI',
    'FREQUENCY_TOLERANCE'
]
