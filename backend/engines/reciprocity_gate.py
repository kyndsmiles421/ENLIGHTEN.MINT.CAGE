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
    
    SUSTAINABILITY ENGINE V1.3:
    - $15.00 per volunteer hour (adjusted reciprocity)
    - $5.00 Cafe Fund Floor (minimum contribution)
    - 20% Early Adopter Discount
    """
    
    CREDIT_VALUE_PER_HOUR = 15.00  # ADJUSTED: $15 per volunteer hour
    MARKET_RATE = 50.00  # Standard market rate
    SOVEREIGN_DISCOUNT = 0.20  # 20% below market
    CAFE_FUND_FLOOR = 5.00  # Minimum contribution to cover operational costs
    
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
        Checks if the user has enough Volunteer Hours to reduce their payment.
        
        SUSTAINABILITY ENGINE V1.3:
        - User always contributes at least $5.00 (Cafe Fund Floor)
        - Volunteer credits reduce the price but never below the floor
        
        Args:
            user_id: The user's unique identifier
            required_credits: Dollar amount required for access
            
        Returns:
            Dict with access status, signature, and cost breakdown
        """
        user_vol_hours = self.get_volunteer_ledger(user_id)
        volunteer_credit = user_vol_hours * self.CREDIT_VALUE_PER_HOUR
        sovereign_rate = self.MARKET_RATE * (1 - self.SOVEREIGN_DISCOUNT)  # $40
        
        # Calculate with Cafe Fund Floor
        calculated_due = sovereign_rate - volunteer_credit
        final_cost = max(self.CAFE_FUND_FLOOR, calculated_due)
        is_funded = calculated_due <= self.CAFE_FUND_FLOOR
        
        result = {
            "user_id": user_id,
            "volunteer_hours": user_vol_hours,
            "volunteer_credit": volunteer_credit,
            "sovereign_rate": sovereign_rate,
            "calculated_due": calculated_due,
            "cafe_fund_floor": self.CAFE_FUND_FLOOR,
            "final_cost": final_cost,
            "is_funded": is_funded,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        # Generate signature
        sig = secure_hash(f"{user_id}:ACCESS:{final_cost}:{datetime.now(timezone.utc).isoformat()}")
        
        result.update({
            "access": "GRANTED",
            "sig": sig,
            "cost": final_cost,
            "status": "CAFE_FUND_SUPPORTER" if is_funded else "DISCOUNTED",
            "message": f"Access granted. Cafe Fund contribution: ${final_cost:.2f}",
        })
        
        print(f"[ReciprocityGate] ACCESS for {user_id} - Volunteer credit: ${volunteer_credit:.2f}, Final: ${final_cost:.2f}")
        
        return result
    
    def calculate_sovereign_price(self, market_price: float, volunteer_hours: float = 0) -> Dict[str, Any]:
        """
        Calculate the Sovereign price with 20% discount + volunteer credit applied.
        
        SUSTAINABILITY ENGINE V1.3:
        - Always maintains $5.00 Cafe Fund Floor
        
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
        calculated_due = sovereign_price - volunteer_credit
        
        # CAFE FUND FLOOR - Never below $5
        final_price = max(self.CAFE_FUND_FLOOR, calculated_due)
        is_funded = calculated_due <= self.CAFE_FUND_FLOOR
        
        return {
            "market_price": market_price,
            "sovereign_discount": f"{int(self.SOVEREIGN_DISCOUNT * 100)}%",
            "sovereign_price": sovereign_price,
            "volunteer_hours": volunteer_hours,
            "volunteer_credit": volunteer_credit,
            "calculated_due": calculated_due,
            "cafe_fund_floor": self.CAFE_FUND_FLOOR,
            "final_price": final_price,
            "total_savings": market_price - final_price,
            "is_funded": is_funded,
            "is_gratis": False,  # Never fully free
            "status": "CAFE_FUND_SUPPORTER" if is_funded else "DISCOUNTED",
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
