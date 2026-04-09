"""
ENLIGHTEN.MINT.CAFE — Reciprocity Gate Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The "Nodule" that ensures the platform can't charge them if they've put in the work.
It checks the Volunteer Ledger before the "Box" even asks for a credit card.

This is the VOLUNTEER-TO-ACCESS BRIDGE.
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Import the production hub for secure operations
try:
    from .sovereign_production import enlighten_core, secure_hash, secure_hash_short
except ImportError:
    # Fallback if imported directly
    from sovereign_production import enlighten_core, secure_hash, secure_hash_short


class ReciprocityGate:
    """
    The Reciprocity Gate — Volunteer Hours → Access Credits
    
    Core Math:
    - $25.00 per volunteer hour
    - If volunteer credit >= required credits → 100% bypass (GRATIS)
    - Otherwise → 20% below market rate suggested
    """
    
    CREDIT_VALUE_PER_HOUR = 25.00  # $25 per volunteer hour
    MARKET_RATE = 50.00  # Standard market rate
    SOVEREIGN_DISCOUNT = 0.20  # 20% below market
    
    def __init__(self):
        self.volunteer_ledger = {}  # In-memory cache (use DB in production)
        
    def get_volunteer_ledger(self, user_id: str) -> float:
        """
        Get total volunteer hours for a user.
        In production, this queries the MongoDB volunteer_ledger collection.
        """
        return self.volunteer_ledger.get(user_id, 0.0)
    
    def record_volunteer_hours(self, user_id: str, hours: float, activity: str = "") -> Dict[str, Any]:
        """
        Record volunteer hours for a user.
        """
        current = self.volunteer_ledger.get(user_id, 0.0)
        self.volunteer_ledger[user_id] = current + hours
        
        # Generate ledger signature
        sig = secure_hash_short(f"{user_id}:VOLUNTEER:{hours}:{datetime.now(timezone.utc).isoformat()}")
        
        return {
            "user_id": user_id,
            "hours_added": hours,
            "total_hours": self.volunteer_ledger[user_id],
            "activity": activity,
            "credit_value": self.volunteer_ledger[user_id] * self.CREDIT_VALUE_PER_HOUR,
            "ledger_signature": sig,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    def check_access_credits(self, user_id: str, required_credits: float) -> Dict[str, Any]:
        """
        Checks if the user has enough Volunteer Hours to bypass the paywall.
        If yes, it returns a 100% discount signature (GRATIS).
        
        This is THE BYPASS — the platform can't charge them if they've done the work.
        
        Args:
            user_id: The user's unique identifier
            required_credits: Dollar amount required for access
            
        Returns:
            Dict with access status, signature, and cost breakdown
        """
        user_vol_hours = self.get_volunteer_ledger(user_id)
        total_value = user_vol_hours * self.CREDIT_VALUE_PER_HOUR
        
        result = {
            "user_id": user_id,
            "volunteer_hours": user_vol_hours,
            "credit_value": total_value,
            "required_credits": required_credits,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        if total_value >= required_credits:
            # GRATIS — They've earned it through service
            bypass_sig = secure_hash(f"{user_id}:BYPASS:GRATIS:{datetime.now(timezone.utc).isoformat()}")
            
            result.update({
                "access": "GRANTED",
                "sig": bypass_sig,
                "cost": 0.00,
                "reason": "VOLUNTEER_CREDIT_BYPASS",
                "message": "Access granted through volunteer service. Thank you for your contribution.",
                "remaining_credit": total_value - required_credits,
            })
            
            print(f"[ReciprocityGate] BYPASS GRANTED for {user_id} - Volunteer credit: ${total_value:.2f}")
            
        else:
            # Payment required, but at 20% below market
            sovereign_rate = self.MARKET_RATE * (1 - self.SOVEREIGN_DISCOUNT)
            shortfall = required_credits - total_value
            hours_needed = shortfall / self.CREDIT_VALUE_PER_HOUR
            
            result.update({
                "access": "PAYMENT_REQUIRED",
                "cost": shortfall,
                "suggested_rate": f"{int(self.SOVEREIGN_DISCOUNT * 100)}%_BELOW_MARKET",
                "sovereign_rate": sovereign_rate,
                "market_rate": self.MARKET_RATE,
                "savings_per_hour": self.MARKET_RATE - sovereign_rate,
                "credit_shortfall": shortfall,
                "hours_to_earn_bypass": hours_needed,
                "message": f"You need ${shortfall:.2f} more or {hours_needed:.1f} volunteer hours for free access.",
            })
            
            print(f"[ReciprocityGate] PAYMENT REQUIRED for {user_id} - Shortfall: ${shortfall:.2f}")
        
        return result
    
    def calculate_sovereign_price(self, market_price: float, volunteer_hours: float = 0) -> Dict[str, Any]:
        """
        Calculate the Sovereign price with 20% discount + volunteer credit applied.
        
        Args:
            market_price: The standard market price
            volunteer_hours: Hours of volunteer work to apply as credit
            
        Returns:
            Dict with full price breakdown
        """
        # Apply 20% discount
        sovereign_price = market_price * (1 - self.SOVEREIGN_DISCOUNT)
        
        # Apply volunteer credit
        volunteer_credit = volunteer_hours * self.CREDIT_VALUE_PER_HOUR
        final_price = max(0, sovereign_price - volunteer_credit)
        
        return {
            "market_price": market_price,
            "sovereign_discount": f"{int(self.SOVEREIGN_DISCOUNT * 100)}%",
            "sovereign_price": sovereign_price,
            "volunteer_hours": volunteer_hours,
            "volunteer_credit": volunteer_credit,
            "final_price": final_price,
            "total_savings": market_price - final_price,
            "is_gratis": final_price == 0,
        }
    
    def get_tier_access_map(self) -> Dict[str, Dict[str, Any]]:
        """
        Returns the tier access requirements and benefits.
        """
        return {
            "BASIC": {
                "monthly_cost": 0,
                "volunteer_hours_required": 0,
                "access": ["Practice", "Today", "Explore"],
                "description": "Foundation access - breathing, meditation, journaling",
            },
            "SOVEREIGN": {
                "monthly_cost": self.MARKET_RATE * (1 - self.SOVEREIGN_DISCOUNT),  # $40/mo
                "volunteer_hours_required": 2,  # 2 hrs = $50 credit
                "access": ["Practice", "Today", "Explore", "Sanctuary", "Economy"],
                "description": "Full sanctuary access + economy features",
            },
            "ENLIGHTENED": {
                "monthly_cost": self.MARKET_RATE * 2 * (1 - self.SOVEREIGN_DISCOUNT),  # $80/mo
                "volunteer_hours_required": 4,  # 4 hrs = $100 credit
                "access": ["Practice", "Today", "Explore", "Sanctuary", "Economy", "Divination", "Creator"],
                "description": "Complete access including divination + creator tools",
            },
        }


# Global instance
reciprocity_gate = ReciprocityGate()


def check_access_credits(user_id: str, required_credits: float) -> Dict[str, Any]:
    """
    Global function to check access credits.
    Called by routes to verify volunteer bypass eligibility.
    """
    return reciprocity_gate.check_access_credits(user_id, required_credits)


def record_volunteer_hours(user_id: str, hours: float, activity: str = "") -> Dict[str, Any]:
    """
    Global function to record volunteer hours.
    """
    return reciprocity_gate.record_volunteer_hours(user_id, hours, activity)


def calculate_sovereign_price(market_price: float, volunteer_hours: float = 0) -> Dict[str, Any]:
    """
    Global function to calculate Sovereign pricing.
    """
    return reciprocity_gate.calculate_sovereign_price(market_price, volunteer_hours)


def get_tier_access_map() -> Dict[str, Dict[str, Any]]:
    """
    Global function to get tier access requirements.
    """
    return reciprocity_gate.get_tier_access_map()


__all__ = [
    'ReciprocityGate',
    'reciprocity_gate',
    'check_access_credits',
    'record_volunteer_hours',
    'calculate_sovereign_price',
    'get_tier_access_map',
]
