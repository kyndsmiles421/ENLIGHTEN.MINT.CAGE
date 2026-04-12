"""
Master Transmuter Logic — SovereignEngine v2.0
Fibonacci Accrual + Phi Cap + Scholarship Tax + White Light Encryption

ARCHITECT: Steven Michael
KERNEL: V30.3 SOVEREIGN_ENGINE
PROTOCOL: Waste-to-Value Liquidity Loop + Apparatus
"""

import math
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Sacred Constants
PHI = 1.618033988749895
PHI_SQUARED = 2.618033988749895
PHI_CUBED = 4.236067977499790
SOLFEGGIO = {"Transformation": 528, "Harmony": 432, "Spiritual": 963}
SPECTRUM = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "INDIGO", "VIOLET"]
FIB_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

# Tier Definitions (expanded for Scholarship)
TIERS = {
    0: "BASE",
    1: "SEED",
    2: "ARTISAN",
    3: "SOVEREIGN",
}

# Tier Ratios — Fibonacci-derived accrual rates
TIER_RATIOS = [0.09, 0.236, 0.382, 0.618]

# Tier Dynamics — full config per tier
TIER_DYNAMICS = {
    "SOVEREIGN": {"index": 3, "ratio": 0.618, "tax": 0.0,   "label": "High Rebate"},
    "ARTISAN":   {"index": 2, "ratio": 0.382, "tax": 0.05,  "label": "Mid Rebate"},
    "SEED":      {"index": 1, "ratio": 0.236, "tax": 0.15,  "label": "Scholarship"},
    "BASE":      {"index": 0, "ratio": 0.09,  "tax": 0.144, "label": "Scavenger"},
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
}


class SovereignEngine:
    """
    Sovereign Engine Apparatus v2.0
    Fibonacci Accrual + Phi Cap Ceiling + Scholarship Tax
    The Inside: Math. The Outside: Social. The Bridge: Share.
    """

    def __init__(self):
        self.PHI = PHI
        self.SOLFEGGIO = SOLFEGGIO
        self.TIERS = TIERS
        self.ratios = TIER_RATIOS
        self.phi_cap = PHI
        self.scholarship_tax_rate = SCHOLARSHIP_TAX_RATE
        self.fib_sequence = FIB_SEQUENCE

    def get_tier_dynamics(self, tier_name: str) -> Dict[str, Any]:
        """Get full dynamics config for a tier."""
        return TIER_DYNAMICS.get(tier_name.upper(), TIER_DYNAMICS["BASE"])

    def transmute(self, input_amount: float, tier_index: int) -> Dict[str, Any]:
        """
        Core alchemy: apply Fibonacci accrual, Phi Cap ceiling, and Scholarship Tax.
        """
        tier_ratio = self.ratios[tier_index] if tier_index < len(self.ratios) else 0.09
        tier_name = self.TIERS.get(tier_index, "BASE")
        dynamics = self.get_tier_dynamics(tier_name)

        # 1. Gross output with tier-based accrual
        gross_output = input_amount * (1 + tier_ratio)

        # 2. Phi Cap ceiling
        capped_output = min(gross_output, input_amount * self.phi_cap)

        # 3. Tier-specific tax (Scholarship levy for lower tiers)
        tax_rate = dynamics["tax"]
        tax_amount = capped_output * tax_rate
        net_result = capped_output - tax_amount

        return {
            "net_result": round(net_result, 4),
            "tax_amount": round(tax_amount, 4),
            "capped_output": round(capped_output, 4),
            "gross_output": round(gross_output, 4),
            "tier_ratio": tier_ratio,
            "tax_rate": tax_rate,
            "tier_name": tier_name,
            "phi_cap_applied": gross_output > (input_amount * self.phi_cap),
        }

    def process_interaction(
        self, tier_name: str, action: str, interaction_weight: float
    ) -> Dict[str, Any]:
        """
        Process a module interaction with tier-based dynamics.
        Used by the unified /work-submit endpoint.
        """
        dynamics = self.get_tier_dynamics(tier_name)
        ratio = dynamics["ratio"]
        tax_rate = dynamics["tax"]

        # Gross work value
        gross_dust = interaction_weight * ratio

        # Apply tax
        tax_amount = gross_dust * tax_rate
        net_accrual = gross_dust - tax_amount

        # Fibonacci dampening (divide by Fib[3]=3 to keep earned < purchased)
        dampened = net_accrual / self.fib_sequence[3]

        return {
            "earned": round(dampened, 4),
            "taxed_to_master": round(tax_amount, 4),
            "gross_value": round(gross_dust, 4),
            "dampened_value": round(dampened, 4),
            "tier": tier_name,
            "ratio": ratio,
            "tax_rate": tax_rate,
        }

    def calculate_dynamic_phi_cap(self, total_circulating_dust: int) -> float:
        """
        Fibonacci-scaled Phi Cap: as Dust supply increases,
        the exchange rate scales to protect Fan value.
        """
        log_index = int(math.log(max(1, total_circulating_dust + 1), self.PHI))
        fib_index = min(log_index, len(self.fib_sequence) - 1)
        adjustment = self.fib_sequence[fib_index] / self.PHI
        dynamic_cap = BASE_PHI_EXCHANGE * adjustment
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
