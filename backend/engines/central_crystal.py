"""
CENTRAL CRYSTAL: The Heart of the Enlightenment Cafe
====================================================

The Central Crystal maintains the 'Equilibrium' of the entire system.
It acts as the singular resonance point that all modules pulse toward.

ARCHITECTURE:
┌─────────────────────────────────────────────────────────────┐
│                     CENTRAL CRYSTAL 💎                       │
│              (The Equilibrium Maintainer)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   current_frequency: 0.0 Hz ─────────────────────────┐     │
│                                                       │     │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │
│   │Divination│   │Sanctuary│   │Breathing│   │Star Chart│   │
│   │ 888 Hz  │   │ 432 Hz  │   │ 111 Hz  │   │ 777 Hz  │   │
│   │ R: 2.5  │   │ R: 1.2  │   │ R: 0.2  │   │ R: 1.8  │   │
│   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   │
│        │             │             │             │         │
│        └─────────────┴──────┬──────┴─────────────┘         │
│                             │                               │
│                    HARMONIC PULL                            │
│              (Gradual frequency shift)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

KEITH WRIGHT'S PRINCIPLE:
Higher resistance = more steps = slower transition = deeper contemplation
"""

import asyncio
import time
import math
import hashlib
from typing import Dict, Tuple, Optional, Callable, List, Any
from dataclasses import dataclass, field
from enum import Enum
import logging
import json

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# SACRED FREQUENCIES
# ═══════════════════════════════════════════════════════════════════════════════

class SacredFrequency(Enum):
    """Known sacred/healing frequencies."""
    VOID = 0.0          # Empty state
    SCHUMANN = 7.83     # Earth's resonance
    DELTA = 4.0         # Deep sleep
    THETA = 7.0         # Meditation
    ALPHA = 10.0        # Relaxed awareness
    BETA = 20.0         # Active thinking
    GAMMA = 40.0        # Heightened perception
    SOLFEGGIO_UT = 396  # Liberation
    SOLFEGGIO_RE = 417  # Transmutation  
    SOLFEGGIO_MI = 528  # Miracle/DNA repair
    SOLFEGGIO_FA = 639  # Connection
    SOLFEGGIO_SOL = 741 # Awakening
    SOLFEGGIO_LA = 852  # Intuition
    SOLFEGGIO_SI = 963  # Divine connection


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE DEFINITION
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class CrystalSource:
    """A source that the crystal can resonate with."""
    name: str
    frequency: float
    resistance: float  # Keith Wright's 'weight' — higher = slower transition
    source_type: str = "Balanced"  # Kinetic, Balanced, Nourish, Theological
    description: str = ""
    emoji: str = "🔮"
    color: str = "#10B981"  # Default jade
    
    @property
    def transition_steps(self) -> int:
        """Calculate number of transition steps based on resistance."""
        return int(self.resistance * 20) + 5  # Enhanced spiral steps
    
    @property
    def step_duration(self) -> float:
        """Duration of each transition step in seconds."""
        return 0.05 * (1 + self.resistance)  # Physical resistance factor


# Default sources for the Sovereign Interface
DEFAULT_SOURCES: Dict[str, CrystalSource] = {
    "Void": CrystalSource(
        name="Void",
        frequency=0.0,
        resistance=0.1,
        source_type="Kinetic",
        description="The empty state, the beginning",
        emoji="🌑",
        color="#1a1a2e"
    ),
    "Breathing": CrystalSource(
        name="Breathing",
        frequency=111.0,
        resistance=0.2,
        source_type="Kinetic",
        description="Quick centering, kinetic calm",
        emoji="🌬️",
        color="#3B82F6"
    ),
    "Sanctuary": CrystalSource(
        name="Sanctuary",
        frequency=432.0,
        resistance=0.5,
        source_type="Balanced",
        description="Safe space, harmonic balance",
        emoji="🏛️",
        color="#10B981"
    ),
    "Herbology": CrystalSource(
        name="Herbology",
        frequency=528.0,
        resistance=0.6,
        source_type="Nourish",
        description="Plant wisdom, natural healing",
        emoji="🌿",
        color="#22C55E"
    ),
    "Mixer": CrystalSource(
        name="Mixer",
        frequency=528.0,
        resistance=0.8,
        source_type="Balanced",
        description="Sound synthesis, frequency blending",
        emoji="🎛️",
        color="#A855F7"
    ),
    "I_Ching": CrystalSource(
        name="I Ching",
        frequency=639.0,
        resistance=1.5,
        source_type="Balanced",
        description="Ancient wisdom, hexagram meditation",
        emoji="☯️",
        color="#6366F1"
    ),
    "Tarot": CrystalSource(
        name="Tarot",
        frequency=741.0,
        resistance=1.8,
        source_type="Balanced",
        description="Archetypal journey, symbolic insight",
        emoji="🎴",
        color="#F472B6"
    ),
    "Star_Chart": CrystalSource(
        name="Star Chart",
        frequency=777.0,
        resistance=1.8,
        source_type="Balanced",
        description="Celestial navigation, cosmic alignment",
        emoji="⭐",
        color="#F59E0B"
    ),
    "Oracle": CrystalSource(
        name="Oracle",
        frequency=852.0,
        resistance=2.2,
        source_type="Theological",
        description="Intuitive guidance, inner knowing",
        emoji="👁️",
        color="#EC4899"
    ),
    "Divination": CrystalSource(
        name="Divination",
        frequency=888.0,
        resistance=2.5,
        source_type="Theological",
        description="Oracle wisdom, deep insight",
        emoji="🔮",
        color="#8B5CF6"
    ),
    "Tesseract": CrystalSource(
        name="Tesseract",
        frequency=963.0,
        resistance=2.8,
        source_type="Theological",
        description="4D navigation, recursive depth",
        emoji="💠",
        color="#22D3EE"
    ),
}


# ═══════════════════════════════════════════════════════════════════════════════
# TRANSITION STATE
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class TransitionState:
    """State of a frequency transition."""
    from_source: str
    to_source: str
    from_frequency: float
    to_frequency: float
    current_frequency: float
    progress: float  # 0.0 to 1.0
    step: int
    total_steps: int
    started_at: float
    estimated_completion: float
    torque: float = 0.0  # Spiral gravitation force
    seed: Optional[str] = None  # 72-bit commemorative seed
    is_complete: bool = False


# ═══════════════════════════════════════════════════════════════════════════════
# CENTRAL CRYSTAL
# ═══════════════════════════════════════════════════════════════════════════════

class CentralCrystal:
    """
    The heart of the Enlightenment Cafe.
    Maintains the 'Equilibrium' of the entire system.
    
    TORQUE MECHANICS:
    - Heavier (theological) data creates tighter spirals
    - Torque = sin(progress * π) * (resistance * 100)
    - This drives the 3D Lattice rotation on the frontend
    """
    
    def __init__(self, sources: Optional[Dict[str, CrystalSource]] = None):
        self.sources = sources or DEFAULT_SOURCES
        self.current_frequency = 0.0
        self.active_module = "Void"
        self.is_transitioning = False
        self.torque = 0.0  # Current spiral gravitation force
        self.transition_state: Optional[TransitionState] = None
        self._subscribers: List[Callable] = []
        self._history: List[Dict[str, Any]] = []
        
        logger.info("💎 [CentralCrystal] Initialized in Void state")
    
    # ─────────────────────────────────────────────────────────────────────────
    # 72-BIT SEED GENERATION (Commemorative Mapping)
    # ─────────────────────────────────────────────────────────────────────────
    
    def _generate_seed(self, module_name: str) -> str:
        """
        Generate a 72-bit commemorative seed for this transition.
        
        The seed captures:
        - Module name
        - Timestamp
        - Final frequency
        
        Returns 18-character hex string (72 bits).
        """
        seed_source = f"{module_name}-{time.time()}-{self.current_frequency}"
        seed_hash = hashlib.sha256(seed_source.encode()).hexdigest()[:18]
        return seed_hash
    
    # ─────────────────────────────────────────────────────────────────────────
    # TORQUE CALCULATION (Spiral Gravitation)
    # ─────────────────────────────────────────────────────────────────────────
    
    def _calculate_torque(self, progress: float, resistance: float) -> float:
        """
        Calculate spiral gravitation force.
        
        Heavier (theological) data creates tighter spirals:
        Torque = sin(progress * π) * (resistance * 100)
        
        This drives the 3D Lattice rotation on the frontend.
        """
        return math.sin(progress * math.pi) * (resistance * 100)
    
    # ─────────────────────────────────────────────────────────────────────────
    # CORE: Harmonic Pulse
    # ─────────────────────────────────────────────────────────────────────────
    
    async def pulse_to_target(
        self, 
        target_name: str, 
        target_freq: Optional[float] = None,
        resistance: Optional[float] = None,
        emit_events: bool = True
    ) -> TransitionState:
        """
        The 'Harmonic Pull': Moves the crystal state toward the new source.
        
        Args:
            target_name: Name of the target source
            target_freq: Override frequency (uses source default if None)
            resistance: Override resistance (uses source default if None)
            emit_events: Whether to emit events to subscribers
            
        Returns:
            TransitionState with completion info
        """
        # Get source info
        source = self.sources.get(target_name)
        if source:
            target_freq = target_freq or source.frequency
            resistance = resistance or source.resistance
        else:
            # Custom target
            target_freq = target_freq or 432.0
            resistance = resistance or 1.0
        
        # Already at target?
        if self.active_module == target_name and abs(self.current_frequency - target_freq) < 0.01:
            logger.info(f"💎 [Crystal] Already at {target_name}")
            return TransitionState(
                from_source=self.active_module,
                to_source=target_name,
                from_frequency=self.current_frequency,
                to_frequency=target_freq,
                current_frequency=self.current_frequency,
                progress=1.0,
                step=0,
                total_steps=0,
                started_at=time.time(),
                estimated_completion=time.time(),
                is_complete=True
            )
        
        # Start transition
        self.is_transitioning = True
        from_module = self.active_module
        from_freq = self.current_frequency
        start_time = time.time()
        
        logger.info(f"\n💎 [Crystal] Harmonic shift detected: {from_module} -> {target_name}")
        logger.info(f"   Frequency: {from_freq:.2f} Hz -> {target_freq:.2f} Hz")
        logger.info(f"   Resistance: {resistance} (slower = deeper)")
        
        # Calculate steps (Enhanced spiral steps: weight * 20 + 5)
        steps = int(resistance * 20) + 5
        step_duration = 0.05 * (1 + resistance)  # Physical resistance factor
        
        # Initialize transition state
        self.transition_state = TransitionState(
            from_source=from_module,
            to_source=target_name,
            from_frequency=from_freq,
            to_frequency=target_freq,
            current_frequency=self.current_frequency,
            progress=0.0,
            step=0,
            total_steps=steps,
            started_at=start_time,
            estimated_completion=start_time + (steps * step_duration),
            torque=0.0,
        )
        
        # Gradual frequency shift with SPIRAL GRAVITATION
        for i in range(steps + 1):
            progress = i / steps
            
            # Calculate TORQUE: Tighter spiral for heavier (theological) data
            self.torque = self._calculate_torque(progress, resistance)
            self.transition_state.torque = self.torque
            
            # Linear interpolation of frequency
            self.current_frequency = from_freq + (target_freq - from_freq) * progress
            
            # Update transition state
            self.transition_state.current_frequency = self.current_frequency
            self.transition_state.step = i + 1
            self.transition_state.progress = progress
            
            logger.info(f"✨ [Resonance] Step {i+1}/{steps}: {self.current_frequency:.2f} Hz | Torque: {self.torque:.1f}°")
            
            # Emit progress event with torque
            if emit_events:
                await self._emit_event("transition_progress", {
                    "step": i + 1,
                    "total_steps": steps,
                    "frequency": self.current_frequency,
                    "progress": progress,
                    "torque": self.torque,
                    "target": target_name
                })
            
            # Apply physical resistance delay
            await asyncio.sleep(step_duration)
        
        # Generate 72-bit commemorative seed
        seed = self._generate_seed(target_name)
        self.transition_state.seed = seed
        
        # Complete transition
        self.current_frequency = target_freq
        self.active_module = target_name
        self.is_transitioning = False
        self.torque = 0.0  # Reset torque
        self.transition_state.is_complete = True
        self.transition_state.current_frequency = target_freq
        self.transition_state.progress = 1.0
        self.transition_state.torque = 0.0
        
        # Record in history with seed
        self._history.append({
            "from": from_module,
            "to": target_name,
            "from_freq": from_freq,
            "to_freq": target_freq,
            "resistance": resistance,
            "duration": time.time() - start_time,
            "seed": seed,
            "timestamp": time.time()
        })
        
        # Keep history bounded
        if len(self._history) > 100:
            self._history = self._history[-50:]
        
        logger.info(f"✅ [Crystal] Locked into {target_name} Source at {target_freq:.2f} Hz")
        
        # Emit completion event
        if emit_events:
            await self._emit_event("transition_complete", {
                "source": target_name,
                "frequency": target_freq,
                "duration": time.time() - start_time
            })
        
        return self.transition_state
    
    # ─────────────────────────────────────────────────────────────────────────
    # INSTANT SHIFT (No transition animation)
    # ─────────────────────────────────────────────────────────────────────────
    
    def instant_shift(self, target_name: str, frequency: Optional[float] = None):
        """Instantly shift to a new source without transition."""
        source = self.sources.get(target_name)
        freq = frequency or (source.frequency if source else 432.0)
        
        self.current_frequency = freq
        self.active_module = target_name
        self.is_transitioning = False
        self.transition_state = None
        
        logger.info(f"⚡ [Crystal] Instant shift to {target_name} at {freq:.2f} Hz")
    
    # ─────────────────────────────────────────────────────────────────────────
    # STATE ACCESS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_state(self) -> Dict[str, Any]:
        """Get current crystal state including torque for 3D lattice."""
        source = self.sources.get(self.active_module)
        return {
            "frequency": self.current_frequency,
            "active_module": self.active_module,
            "is_transitioning": self.is_transitioning,
            "torque": self.torque,  # Spiral gravitation for 3D lattice
            "source_info": {
                "name": source.name if source else self.active_module,
                "emoji": source.emoji if source else "🔮",
                "color": source.color if source else "#10B981",
                "description": source.description if source else "",
                "source_type": source.source_type if source else "Balanced",
            } if source else None,
            "transition": {
                "from": self.transition_state.from_source,
                "to": self.transition_state.to_source,
                "progress": self.transition_state.progress,
                "step": self.transition_state.step,
                "total_steps": self.transition_state.total_steps,
                "torque": self.transition_state.torque,
                "seed": self.transition_state.seed,
            } if self.transition_state and self.is_transitioning else None
        }
    
    def get_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get transition history."""
        return self._history[-limit:]
    
    def get_available_sources(self) -> Dict[str, Dict[str, Any]]:
        """Get all available sources."""
        return {
            name: {
                "name": src.name,
                "frequency": src.frequency,
                "resistance": src.resistance,
                "description": src.description,
                "emoji": src.emoji,
                "color": src.color,
                "transition_steps": src.transition_steps,
            }
            for name, src in self.sources.items()
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # SUBSCRIPTION (Event System)
    # ─────────────────────────────────────────────────────────────────────────
    
    def subscribe(self, callback: Callable) -> Callable:
        """Subscribe to crystal events."""
        self._subscribers.append(callback)
        return lambda: self._subscribers.remove(callback)
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emit event to all subscribers."""
        for callback in self._subscribers:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(event_type, data)
                else:
                    callback(event_type, data)
            except Exception as e:
                logger.error(f"Crystal event callback error: {e}")
    
    # ─────────────────────────────────────────────────────────────────────────
    # RESET
    # ─────────────────────────────────────────────────────────────────────────
    
    def reset(self):
        """Reset to Void state."""
        self.current_frequency = 0.0
        self.active_module = "Void"
        self.is_transitioning = False
        self.transition_state = None
        logger.info("💎 [Crystal] Reset to Void")


# ═══════════════════════════════════════════════════════════════════════════════
# SOVEREIGN INTERFACE
# ═══════════════════════════════════════════════════════════════════════════════

class SovereignInterface:
    """
    The user-facing interface to the Central Crystal.
    Maps UI interactions to harmonic transitions.
    """
    
    def __init__(self, crystal: Optional[CentralCrystal] = None):
        self.crystal = crystal or CentralCrystal()
    
    async def activate_source(self, source_name: str) -> TransitionState:
        """Activate a source by name."""
        return await self.crystal.pulse_to_target(source_name)
    
    async def activate_custom(
        self, 
        name: str, 
        frequency: float, 
        resistance: float
    ) -> TransitionState:
        """Activate a custom frequency/resistance combination."""
        return await self.crystal.pulse_to_target(
            target_name=name,
            target_freq=frequency,
            resistance=resistance
        )
    
    def get_source_buttons(self) -> List[Dict[str, Any]]:
        """Get button configuration for UI."""
        return [
            {
                "id": name,
                "label": src.name,
                "emoji": src.emoji,
                "color": src.color,
                "frequency": src.frequency,
                "resistance": src.resistance,
                "description": src.description,
                "is_active": self.crystal.active_module == name,
            }
            for name, src in self.crystal.sources.items()
        ]
    
    def get_current_state(self) -> Dict[str, Any]:
        """Get current interface state."""
        return {
            "crystal": self.crystal.get_state(),
            "buttons": self.get_source_buttons(),
        }


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCES
# ═══════════════════════════════════════════════════════════════════════════════

_crystal_instance: Optional[CentralCrystal] = None
_interface_instance: Optional[SovereignInterface] = None

def get_crystal() -> CentralCrystal:
    """Get the singleton crystal instance."""
    global _crystal_instance
    if _crystal_instance is None:
        _crystal_instance = CentralCrystal()
    return _crystal_instance

def get_interface() -> SovereignInterface:
    """Get the singleton interface instance."""
    global _interface_instance
    if _interface_instance is None:
        _interface_instance = SovereignInterface(get_crystal())
    return _interface_instance


# ═══════════════════════════════════════════════════════════════════════════════
# DEMO
# ═══════════════════════════════════════════════════════════════════════════════

async def demo():
    """Demonstrate the Central Crystal."""
    crystal = CentralCrystal()
    interface = SovereignInterface(crystal)
    
    print("═" * 60)
    print("    CENTRAL CRYSTAL: Harmonic Transitions Demo")
    print("═" * 60)
    
    # Show available sources
    print("\n📋 Available Sources:")
    for btn in interface.get_source_buttons():
        print(f"   {btn['emoji']} {btn['label']}: {btn['frequency']} Hz (R: {btn['resistance']})")
    
    # Transition sequence
    transitions = [
        "Breathing",     # Fast (kinetic)
        "Sanctuary",     # Medium
        "Divination",    # Slow (theological)
        "Void",          # Return to empty
    ]
    
    print("\n" + "─" * 60)
    print("    Starting Transition Sequence")
    print("─" * 60)
    
    for target in transitions:
        await interface.activate_source(target)
        print()
    
    print("═" * 60)
    print("    All Transitions Complete")
    print("═" * 60)
    
    # Show history
    print("\n📜 Transition History:")
    for entry in crystal.get_history():
        print(f"   {entry['from']} -> {entry['to']} ({entry['duration']:.2f}s)")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s"
    )
    asyncio.run(demo())
