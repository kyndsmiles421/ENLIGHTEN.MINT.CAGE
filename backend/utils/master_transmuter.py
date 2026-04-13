"""
Master Transmuter Logic — SovereignEngine v3.4
INVERSE EXPONENTIAL SURGE + Fibonacci Accrual + Phi Cap + Scholarship Tax

ARCHITECT: Steven Michael
KERNEL: V34.0 SOVEREIGN_ENGINE
PROTOCOL: Inverse Multiplier // Exponential Accrual // Multi-Dimensional Wealth Generation

MATH:
  - Inverse Multiplier: φ^(-1/(pool+1)) — protects value as pool grows
  - Exponential Accrual: baseRate * e^(resonance * time) * φ
  - Transmutation: input * φ² - scholarshipTax, scaled by inverse multiplier
  - Dynamic Phi Cap: Fibonacci-indexed against circulating supply
"""

import math
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# ═══ SACRED CONSTANTS ═══
PHI = 1.618033988749895
PHI_SQUARED = 2.618033988749895
PHI_CUBED = 4.236067977499790
E = 2.7182818284590452
SOLFEGGIO = {"Transformation": 528, "Harmony": 432, "Spiritual": 963}
SPECTRUM = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "INDIGO", "VIOLET"]
FIB_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

# ═══ TIER DEFINITIONS ═══
TIERS = {
    0: "BASE",
    1: "SEED",
    2: "ARTISAN",
    3: "SOVEREIGN",
}

# Tier Ratios — Fibonacci-derived base accrual rates
TIER_RATIOS = [0.09, 0.236, 0.382, 0.618]

# Tier Dynamics — full config per tier
TIER_DYNAMICS = {
    "SOVEREIGN": {"index": 3, "ratio": 0.618, "tax": 0.0,   "label": "High Rebate",  "resonance_mult": 1.618},
    "ARTISAN":   {"index": 2, "ratio": 0.382, "tax": 0.05,  "label": "Mid Rebate",   "resonance_mult": 1.236},
    "SEED":      {"index": 1, "ratio": 0.236, "tax": 0.15,  "label": "Scholarship",  "resonance_mult": 1.0},
    "BASE":      {"index": 0, "ratio": 0.09,  "tax": 0.144, "label": "Scavenger",    "resonance_mult": 0.618},
}

# Subscription tier -> Transmuter tier mapping
SUBSCRIPTION_TO_TRANSMUTER = {
    "discovery": 1,
    "resonance": 2,
    "sovereign": 3,
    "architect": 3,
}

# Subscription tier -> Tier name
SUBSCRIPTION_TO_TIER_NAME = {
    "discovery": "SEED",
    "resonance": "ARTISAN",
    "sovereign": "SOVEREIGN",
    "architect": "SOVEREIGN",
}

# Phi Cap Exchange Rate: 1618 Dust = 1 Fan/Crystal (base)
BASE_PHI_EXCHANGE = 1618

# Scholarship Tax Rate (community reinvestment)
SCHOLARSHIP_TAX_RATE = 0.15

# Dust complexity rewards per action type
DUST_COMPLEXITY_REWARDS = {
    "module_interaction": 3,
    "task_completion": 10,
    "journal_entry": 8,
    "oracle_reading": 12,
    "meditation_session": 15,
    "breathing_exercise": 7,
    "frequency_mix": 18,
    "blueprint_generation": 25,
    "forge_creation": 20,
    "constellation_trace": 14,
    "mood_log": 5,
    "trade_listing": 16,
    "archive_save": 6,
    "kinetic_movement": 2,
    "daily_login": 10,
    "streak_bonus": 30,
    "creator_console": 15,
}


class SovereignEngine:
    """
    Sovereign Engine Apparatus v3.4 — INVERSE EXPONENTIAL SURGE
    
    Core equations:
      inverse_multiplier(pool) = φ^(-1 / (pool + 1))
      exponential_accrual(base, resonance, time) = base * e^(resonance * time/3600) * φ
      transmute(input) = (input * φ²) * (1 - tax_rate) * inverse_multiplier(input)
    """

    def __init__(self):
        self.PHI = PHI
        self.E = E
        self.SOLFEGGIO = SOLFEGGIO
        self.TIERS = TIERS
        self.ratios = TIER_RATIOS
        self.phi_cap = PHI
        self.scholarship_tax_rate = SCHOLARSHIP_TAX_RATE
        self.fib_sequence = FIB_SEQUENCE

    # ═══ V34.0: INVERSE MULTIPLIER ═══
    def inverse_multiplier(self, pool: float) -> float:
        """
        Gravity Well Logic: As the dust pool grows, individual value is inversely protected.
        φ^(-1 / (pool + 1)) — approaches 1.0 as pool grows (protecting against inflation).
        At pool=0: φ^(-1) = 0.618 (strong dampening)
        At pool=100: φ^(-0.0099) = 0.9952 (minimal dampening — rewarding accumulation)
        """
        return math.pow(self.PHI, -1.0 / (pool + 1))

    # ═══ V34.0: EXPONENTIAL ACCRUAL ═══
    def exponential_accrual(self, base_rate: float, resonance: float, time_seconds: float) -> float:
        """
        The Money Maker: accrual = base * e^(resonance * time/3600) * φ
        - resonance: user's engagement score (0.0 to 1.0, tier-weighted)
        - time_seconds: duration of engagement
        - Result is capped at base * φ³ to prevent runaway inflation
        """
        exponent = resonance * (time_seconds / 3600.0)
        # Cap exponent to prevent overflow: max e^(PHI) ≈ 5.04
        capped_exponent = min(exponent, self.PHI)
        gross = base_rate * math.pow(self.E, capped_exponent) * self.PHI
        # Hard cap: never exceed base * φ³ (4.236x multiplier)
        ceiling = base_rate * PHI_CUBED
        return round(min(gross, ceiling), 8)

    def get_tier_dynamics(self, tier_name: str) -> Dict[str, Any]:
        """Get full dynamics config for a tier."""
        return TIER_DYNAMICS.get(tier_name.upper(), TIER_DYNAMICS["BASE"])

    # ═══ V34.0: TRANSMUTE (Inverse Exponential) ═══
    def transmute(self, input_amount: float, tier_index: int) -> Dict[str, Any]:
        """
        Core alchemy — V34.0 Inverse Exponential Surge:
        1. Surge: input * φ² (exponential square)
        2. Tax: tier-specific scholarship levy
        3. Inverse protection: scale by φ^(-1/(pool+1))
        4. Phi Cap ceiling: never exceed input * φ³
        """
        tier_ratio = self.ratios[tier_index] if tier_index < len(self.ratios) else 0.09
        tier_name = self.TIERS.get(tier_index, "BASE")
        dynamics = self.get_tier_dynamics(tier_name)

        # 1. Exponential Surge: input * φ²
        surge = input_amount * PHI_SQUARED

        # 2. Tier-specific tax
        tax_rate = dynamics["tax"]
        tax_amount = surge * tax_rate
        after_tax = surge - tax_amount

        # 3. Inverse Multiplier protection
        inv_mult = self.inverse_multiplier(input_amount)
        net_result = after_tax * inv_mult

        # 4. Phi Cap ceiling: net cannot exceed input * φ³
        ceiling = input_amount * PHI_CUBED
        capped = min(net_result, ceiling)

        return {
            "net_result": round(capped, 4),
            "tax_amount": round(tax_amount, 4),
            "surge_output": round(surge, 4),
            "after_tax": round(after_tax, 4),
            "inverse_multiplier": round(inv_mult, 6),
            "gross_output": round(surge, 4),
            "capped_output": round(capped, 4),
            "tier_ratio": tier_ratio,
            "tax_rate": tax_rate,
            "tier_name": tier_name,
            "phi_cap_applied": net_result > ceiling,
            "math_version": "V34.0_INVERSE_EXPONENTIAL",
        }

    # ═══ V34.0: PROCESS INTERACTION (Exponential) ═══
    def process_interaction(
        self, tier_name: str, action: str, interaction_weight: float,
        session_duration: float = 0, resonance_score: float = 0.5,
    ) -> Dict[str, Any]:
        """
        Process a module interaction with V34.0 inverse exponential math.
        - interaction_weight: base dust value from the module
        - session_duration: how long user has been engaged (seconds)
        - resonance_score: 0.0 to 1.0 engagement quality
        """
        dynamics = self.get_tier_dynamics(tier_name)
        ratio = dynamics["ratio"]
        tax_rate = dynamics["tax"]
        resonance_mult = dynamics.get("resonance_mult", 1.0)

        # Base dust from linear ratio
        base_dust = interaction_weight * ratio

        # V34.0: Apply exponential accrual if session duration > 0
        if session_duration > 0:
            weighted_resonance = resonance_score * resonance_mult
            accrued = self.exponential_accrual(base_dust, weighted_resonance, session_duration)
        else:
            # Short interaction: apply φ multiplier only
            accrued = base_dust * self.PHI

        # Tax
        tax_amount = accrued * tax_rate
        after_tax = accrued - tax_amount

        # Inverse multiplier: protect against pool inflation
        inv_mult = self.inverse_multiplier(interaction_weight)
        net_earned = after_tax * inv_mult

        # Fibonacci dampening (softer: divide by fib[2]=2 instead of fib[3]=3)
        dampened = net_earned / self.fib_sequence[2]

        return {
            "earned": round(dampened, 4),
            "taxed_to_master": round(tax_amount, 4),
            "gross_value": round(accrued, 4),
            "inverse_multiplier": round(inv_mult, 6),
            "dampened_value": round(dampened, 4),
            "tier": tier_name,
            "ratio": ratio,
            "tax_rate": tax_rate,
            "resonance_mult": resonance_mult,
            "math_version": "V34.0_INVERSE_EXPONENTIAL",
        }

    def calculate_dynamic_phi_cap(self, total_circulating_dust: int) -> float:
        """
        Fibonacci-scaled Phi Cap: as Dust supply increases,
        the exchange rate scales to protect Fan value.
        Uses inverse multiplier to dampen inflation pressure.
        """
        log_index = int(math.log(max(1, total_circulating_dust + 1), self.PHI))
        fib_index = min(log_index, len(self.fib_sequence) - 1)
        adjustment = self.fib_sequence[fib_index] / self.PHI
        # V34.0: Apply inverse multiplier to cap calculation
        inv_protection = self.inverse_multiplier(total_circulating_dust)
        dynamic_cap = BASE_PHI_EXCHANGE * adjustment * inv_protection
        return round(dynamic_cap, 2)

    # === Legacy methods (backward compatible) ===

    def apply_white_light_encryption(self, data_packet: Any) -> Dict[str, str]:
        """Rainbow Refraction Encryption: 7 spectral layers."""
        packet_str = str(data_packet)
        base_hash = hashlib.sha256(packet_str.encode()).hexdigest()
        refracted_data = {}
        for i, color in enumerate(SPECTRUM):
            layer_input = f"{color}_{base_hash}_{i}_{self.PHI}"
            layer_hash = hashlib.sha256(layer_input.encode()).hexdigest()[:16]
            refracted_data[color] = f"REFRACT_{color}_{layer_hash}"
        return refracted_data

    def master_generator(
        self, length: float, width: float, trade_type: str, member_tier: int,
    ) -> Dict[str, Any]:
        """Sacred Blueprint generation with tier-gated overlays."""
        blueprint = {
            "dimensions": f"{length}x{width}",
            "standard_cuts": f"{length / 16} studs on center",
            "trade_type": trade_type,
            "tier": self.TIERS.get(member_tier, "SEED"),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        if member_tier >= 2:
            blueprint["phi_optimized"] = round(length * self.PHI, 6)
            blueprint["masonry_ratio"] = round((width * self.PHI) / 2, 6)
            blueprint["golden_area"] = round(length * width * self.PHI, 4)
        if member_tier >= 3:
            blueprint["sacred_geometry"] = "METATRONS_CUBE_ALIGNED"
            blueprint["resonant_frequency"] = self.SOLFEGGIO["Harmony"]
            blueprint["transformation_frequency"] = self.SOLFEGGIO["Transformation"]
            blueprint["refraction_key"] = self.apply_white_light_encryption(blueprint)
        return blueprint

    def calculate_dust_reward(self, action: str, complexity: float = 1.0) -> int:
        """Calculate Digital Dust reward for a user action."""
        base = DUST_COMPLEXITY_REWARDS.get(action, 3)
        return max(1, int(base * complexity))

    def calculate_phi_exchange_rate(self, market_activity: float = 1.0) -> int:
        """Phi Cap exchange rate, fluctuating with market activity."""
        fluctuation = math.sin(market_activity * self.PHI) * 0.1
        rate = int(BASE_PHI_EXCHANGE * (1 + fluctuation))
        return max(500, min(2618, rate))

    def calculate_conversion(self, dust_amount: int, exchange_rate: int) -> Dict[str, int]:
        """Calculate Fans from Dust at given rate."""
        fans_earned = dust_amount // exchange_rate
        dust_consumed = fans_earned * exchange_rate
        return {
            "fans_earned": fans_earned,
            "dust_consumed": dust_consumed,
            "dust_remainder": dust_amount - dust_consumed,
        }


# Singleton
TRANSMUTER = SovereignEngine()
