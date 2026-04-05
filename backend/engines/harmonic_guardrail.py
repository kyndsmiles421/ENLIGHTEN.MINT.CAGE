"""
HARMONIC GUARDRAIL: Protecting the Crystal from Dissonance
==========================================================

The Guardrail acts as a protective filter that 'grounds' negative projections
before they can destabilize the Central Crystal's equilibrium.

PHILOSOPHY:
Every input to the system carries an 'intent frequency'. Aligned signals 
(growth-oriented, constructive) resonate with the Crystal. Dissonant signals 
(negative projections, destructive commands) are grounded before impact.

PROCESS:
1. Input arrives at the Guardrail
2. Intent Resonance is calculated (0.0 to 1.0)
3. If resonance < 0.3 → Signal is GROUNDED (blocked)
4. If resonance >= 0.3 → Signal is ALIGNED (allowed through)

KEITH WRIGHT'S PRINCIPLE:
"The Crystal must be protected from chaos. Not through censorship,
but through harmonic filtration. Dissonance is absorbed, not rejected."
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass, field
from enum import Enum
import time
import re

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# RESONANCE THRESHOLDS
# ═══════════════════════════════════════════════════════════════════════════════

class ResonanceState(Enum):
    """The state of a signal after analysis."""
    GROUNDED = "grounded"      # Blocked - too dissonant
    ALIGNED = "aligned"        # Allowed - sufficiently resonant
    ELEVATED = "elevated"      # High resonance - boosted priority


# ═══════════════════════════════════════════════════════════════════════════════
# PATTERN DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Patterns that indicate negative/destructive intent (lower resonance)
DISSONANCE_PATTERNS = {
    # Destructive commands
    'delete everything', 'destroy', 'crash', 'break', 'kill all',
    'wipe', 'erase all', 'burn it down',
    
    # Negative projections
    'this is stupid', 'hate this', 'worthless', 'garbage',
    'useless', 'terrible', 'disgusting', 'awful',
    
    # Chaos-inducing
    'random chaos', 'mess everything up', 'corrupt',
    
    # Harmful intent
    'harm', 'hurt', 'damage', 'sabotage',
}

# Patterns that indicate growth/constructive intent (higher resonance)
HARMONY_PATTERNS = {
    # Growth-oriented
    'learn', 'grow', 'improve', 'develop', 'evolve',
    'understand', 'explore', 'discover', 'create',
    
    # Constructive
    'build', 'help', 'support', 'nurture', 'cultivate',
    'enhance', 'strengthen', 'illuminate',
    
    # Contemplative
    'meditate', 'reflect', 'contemplate', 'breathe',
    'center', 'balance', 'harmonize', 'align',
    
    # Sacred
    'wisdom', 'insight', 'truth', 'peace', 'love',
    'gratitude', 'compassion', 'healing', 'sacred',
}


# ═══════════════════════════════════════════════════════════════════════════════
# ANALYSIS RESULT
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class GuardrailResult:
    """Result of guardrail analysis."""
    allowed: bool
    state: ResonanceState
    resonance: float
    message: str
    grounded_reason: Optional[str] = None
    harmony_detected: List[str] = field(default_factory=list)
    dissonance_detected: List[str] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "allowed": self.allowed,
            "state": self.state.value,
            "resonance": self.resonance,
            "message": self.message,
            "grounded_reason": self.grounded_reason,
            "harmony_detected": self.harmony_detected,
            "dissonance_detected": self.dissonance_detected,
            "timestamp": self.timestamp,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# HARMONIC GUARDRAIL
# ═══════════════════════════════════════════════════════════════════════════════

class HarmonicGuardrail:
    """
    Protects the Central Crystal from dissonant inputs.
    
    Analyzes incoming signals for intent resonance and either:
    - GROUNDS them (blocks) if too dissonant
    - ALIGNS them (allows) if sufficiently resonant
    - ELEVATES them (boosts) if highly harmonious
    """
    
    def __init__(
        self,
        dissonance_threshold: float = 0.3,
        elevation_threshold: float = 0.8,
        custom_dissonance: Optional[set] = None,
        custom_harmony: Optional[set] = None,
    ):
        """
        Initialize the Guardrail.
        
        Args:
            dissonance_threshold: Below this = GROUNDED (blocked)
            elevation_threshold: Above this = ELEVATED (boosted)
            custom_dissonance: Additional patterns to detect as dissonant
            custom_harmony: Additional patterns to detect as harmonious
        """
        self.dissonance_threshold = dissonance_threshold
        self.elevation_threshold = elevation_threshold
        
        self.dissonance_patterns = DISSONANCE_PATTERNS.copy()
        self.harmony_patterns = HARMONY_PATTERNS.copy()
        
        if custom_dissonance:
            self.dissonance_patterns.update(custom_dissonance)
        if custom_harmony:
            self.harmony_patterns.update(custom_harmony)
        
        # Statistics
        self.total_analyzed = 0
        self.total_grounded = 0
        self.total_aligned = 0
        self.total_elevated = 0
        
        logger.info("[HarmonicGuardrail] Initialized (threshold: %.2f)", dissonance_threshold)
    
    async def analyze_intent(self, user_input: str) -> GuardrailResult:
        """
        Analyze if the input carries a negative projection.
        
        If dissonant, 'Grounds' the signal before it hits the Crystal.
        
        Args:
            user_input: The text to analyze
            
        Returns:
            GuardrailResult with analysis details
        """
        self.total_analyzed += 1
        
        # Calculate resonance
        resonance, harmony_found, dissonance_found = self._calculate_resonance(user_input)
        
        # Determine state
        if resonance < self.dissonance_threshold:
            state = ResonanceState.GROUNDED
            allowed = False
            self.total_grounded += 1
            message = "Signal Grounded: Dissonant projection detected."
            grounded_reason = f"Resonance {resonance:.2f} below threshold {self.dissonance_threshold}"
            
            logger.warning(
                "[Guardrail] GROUNDED: '%s...' (resonance=%.2f, patterns=%s)",
                user_input[:30], resonance, dissonance_found[:3]
            )
            
        elif resonance >= self.elevation_threshold:
            state = ResonanceState.ELEVATED
            allowed = True
            self.total_elevated += 1
            message = "Signal Elevated: High resonance detected."
            grounded_reason = None
            
            logger.info(
                "[Guardrail] ELEVATED: '%s...' (resonance=%.2f)",
                user_input[:30], resonance
            )
            
        else:
            state = ResonanceState.ALIGNED
            allowed = True
            self.total_aligned += 1
            message = "Signal Aligned."
            grounded_reason = None
            
            logger.debug(
                "[Guardrail] ALIGNED: '%s...' (resonance=%.2f)",
                user_input[:30], resonance
            )
        
        return GuardrailResult(
            allowed=allowed,
            state=state,
            resonance=resonance,
            message=message,
            grounded_reason=grounded_reason,
            harmony_detected=harmony_found,
            dissonance_detected=dissonance_found,
        )
    
    def _calculate_resonance(self, text: str) -> Tuple[float, List[str], List[str]]:
        """
        Calculate the 'Sentiment/Intent' Frequency of the text.
        
        Higher score = More aligned / Lower score = More dissonant
        
        Returns:
            Tuple of (resonance, harmony_patterns_found, dissonance_patterns_found)
        """
        text_lower = text.lower()
        
        # Base resonance (neutral)
        resonance = 0.5
        
        harmony_found = []
        dissonance_found = []
        
        # Check for harmony patterns (increase resonance)
        for pattern in self.harmony_patterns:
            if pattern in text_lower:
                harmony_found.append(pattern)
                resonance += 0.1
        
        # Check for dissonance patterns (decrease resonance)
        for pattern in self.dissonance_patterns:
            if pattern in text_lower:
                dissonance_found.append(pattern)
                resonance -= 0.2  # Dissonance has stronger effect
        
        # Length factor - very short inputs are slightly suspicious
        word_count = len(text.split())
        if word_count < 3:
            resonance -= 0.05
        elif word_count > 20:
            # Longer, thoughtful inputs are slightly more resonant
            resonance += 0.05
        
        # Excessive punctuation/caps can indicate aggression
        exclaim_count = text.count('!')
        if exclaim_count > 3:
            resonance -= 0.1
        
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        if caps_ratio > 0.5 and len(text) > 10:
            resonance -= 0.15
        
        # Clamp to valid range
        resonance = max(0.0, min(1.0, resonance))
        
        return resonance, harmony_found, dissonance_found
    
    def sync_analyze(self, user_input: str) -> GuardrailResult:
        """Synchronous version of analyze_intent."""
        return asyncio.get_event_loop().run_until_complete(
            self.analyze_intent(user_input)
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get guardrail statistics."""
        return {
            "total_analyzed": self.total_analyzed,
            "total_grounded": self.total_grounded,
            "total_aligned": self.total_aligned,
            "total_elevated": self.total_elevated,
            "grounded_rate": self.total_grounded / max(self.total_analyzed, 1),
            "elevation_rate": self.total_elevated / max(self.total_analyzed, 1),
            "thresholds": {
                "dissonance": self.dissonance_threshold,
                "elevation": self.elevation_threshold,
            }
        }
    
    def reset_stats(self):
        """Reset statistics."""
        self.total_analyzed = 0
        self.total_grounded = 0
        self.total_aligned = 0
        self.total_elevated = 0


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

_guardrail_instance: Optional[HarmonicGuardrail] = None

def get_guardrail() -> HarmonicGuardrail:
    """Get the singleton guardrail instance."""
    global _guardrail_instance
    if _guardrail_instance is None:
        _guardrail_instance = HarmonicGuardrail()
    return _guardrail_instance


# ═══════════════════════════════════════════════════════════════════════════════
# DEMO
# ═══════════════════════════════════════════════════════════════════════════════

async def demo():
    """Demonstrate the Harmonic Guardrail."""
    guardrail = HarmonicGuardrail()
    
    test_inputs = [
        "I want to learn about meditation and grow spiritually",
        "DELETE EVERYTHING NOW!!!",
        "Help me understand the sacred texts",
        "This is stupid and worthless garbage",
        "Let me contemplate the wisdom of balance",
        "DESTROY ALL THE DATA BURN IT DOWN",
        "I seek healing and compassion",
        "refresh the page",
        "Crash the system and corrupt everything",
    ]
    
    print("═" * 60)
    print("    HARMONIC GUARDRAIL: Intent Analysis Demo")
    print("═" * 60)
    print()
    
    for text in test_inputs:
        result = await guardrail.analyze_intent(text)
        status = "✅" if result.allowed else "🛑"
        print(f"{status} [{result.state.value.upper():8}] {text[:40]}...")
        print(f"   Resonance: {result.resonance:.2f} | {result.message}")
        print()
    
    print("─" * 60)
    print("Statistics:", guardrail.get_stats())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    asyncio.run(demo())
