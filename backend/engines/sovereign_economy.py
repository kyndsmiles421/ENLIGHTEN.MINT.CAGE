# /app/backend/engines/sovereign_economy.py
"""
ENLIGHTEN.MINT.CAFE - Sovereign Economy System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tiered pricing with 20% below market rate + tier bonuses.
Machine time tracking and financial transaction audit.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .sovereign_production import enlighten_core


class SovereignEconomy:
    """
    Manages the ENLIGHTEN.MINT.CAFE economic system.
    
    Features:
    - 20% below market rate base pricing
    - Tiered discounts (Novice, Sovereign, Enlightened)
    - Machine time tracking
    - SHA-256 financial transaction signatures
    - 80/20 community benefit split
    """
    
    def __init__(self):
        self.market_rate_per_hour = 50.00  # Market average
        self.discount_factor = 0.80        # 20% below market
        self.user_tiers = {
            "NOVICE": 1.0,       # Base discounted rate
            "SOVEREIGN": 0.9,    # Additional 10% off for Pro
            "ENLIGHTENED": 0.8   # Additional 20% off for Ultra
        }
        self.tier_labels = {
            "NOVICE": "Novice",
            "SOVEREIGN": "Sovereign", 
            "ENLIGHTENED": "Enlightened"
        }
        # Community split: 80% to house, 20% for community benefits
        self.house_split = 0.80
        self.community_split = 0.20
        
        # Session tracking
        self._active_sessions = {}

    def calculate_machine_rate(self, tier: str = "NOVICE") -> float:
        """
        Calculates the 20% below market rate + tier discounts.
        
        Args:
            tier: User tier (NOVICE, SOVEREIGN, ENLIGHTENED)
            
        Returns:
            Final hourly rate
        """
        base_rate = self.market_rate_per_hour * self.discount_factor
        tier_multiplier = self.user_tiers.get(tier.upper(), 1.0)
        final_rate = base_rate * tier_multiplier
        return round(final_rate, 2)

    def get_rate_breakdown(self, tier: str = "NOVICE") -> Dict[str, Any]:
        """
        Get full rate breakdown with savings calculations.
        
        Returns:
            Dict with market rate, your rate, savings, tier info
        """
        tier = tier.upper() if tier else "NOVICE"
        base_rate = self.market_rate_per_hour * self.discount_factor
        tier_multiplier = self.user_tiers.get(tier, 1.0)
        your_rate = round(base_rate * tier_multiplier, 2)
        
        total_savings = round(self.market_rate_per_hour - your_rate, 2)
        tier_bonus = round(base_rate - your_rate, 2)
        
        return {
            "market_rate": self.market_rate_per_hour,
            "base_rate": base_rate,
            "your_rate": your_rate,
            "total_savings": total_savings,
            "base_discount": f"{int((1 - self.discount_factor) * 100)}%",
            "tier": tier,
            "tier_label": self.tier_labels.get(tier, "Novice"),
            "tier_multiplier": tier_multiplier,
            "tier_bonus_savings": tier_bonus,
            "tier_bonus_percent": f"{int((1 - tier_multiplier) * 100)}%",
            "house_split": f"{int(self.house_split * 100)}%",
            "community_split": f"{int(self.community_split * 100)}%",
        }

    def calculate_session_cost(self, seconds: int, tier: str = "NOVICE") -> Dict[str, Any]:
        """
        Calculate cost for a machine session.
        
        Args:
            seconds: Session duration in seconds
            tier: User tier
            
        Returns:
            Dict with cost breakdown
        """
        hours = seconds / 3600
        your_rate = self.calculate_machine_rate(tier)
        market_rate = self.market_rate_per_hour
        
        your_cost = round(hours * your_rate, 2)
        market_cost = round(hours * market_rate, 2)
        savings = round(market_cost - your_cost, 2)
        
        return {
            "duration_seconds": seconds,
            "duration_hours": round(hours, 4),
            "your_cost": your_cost,
            "market_cost": market_cost,
            "savings": savings,
            "rate_used": your_rate,
            "tier": tier,
        }

    def start_session(self, user_id: str, tier: str = "NOVICE") -> Dict[str, Any]:
        """Start a machine session for a user."""
        session_id = enlighten_core.secure_hash_short(
            f"session:{user_id}:{datetime.now(timezone.utc).isoformat()}"
        )
        
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "tier": tier.upper(),
            "started_at": datetime.now(timezone.utc).isoformat(),
            "rate": self.calculate_machine_rate(tier),
            "heartbeats": 0,
            "status": "active",
        }
        
        self._active_sessions[session_id] = session
        
        return {
            "session_id": session_id,
            "rate": session["rate"],
            "started_at": session["started_at"],
            "status": "active",
        }

    def record_heartbeat(self, session_id: str, machine_time: int) -> Dict[str, Any]:
        """Record a heartbeat for an active session."""
        session = self._active_sessions.get(session_id)
        if not session:
            return {"error": "Session not found", "status": "invalid"}
        
        session["heartbeats"] += 1
        session["last_heartbeat"] = datetime.now(timezone.utc).isoformat()
        session["machine_time"] = machine_time
        
        # Calculate current cost
        cost_info = self.calculate_session_cost(machine_time, session["tier"])
        
        return {
            "session_id": session_id,
            "heartbeats": session["heartbeats"],
            "machine_time": machine_time,
            "current_cost": cost_info["your_cost"],
            "status": "active",
        }

    def end_session(self, session_id: str, final_time: int) -> Dict[str, Any]:
        """End a machine session and calculate final bill."""
        session = self._active_sessions.pop(session_id, None)
        if not session:
            return {"error": "Session not found", "status": "invalid"}
        
        session["ended_at"] = datetime.now(timezone.utc).isoformat()
        session["final_time"] = final_time
        session["status"] = "completed"
        
        # Calculate final cost
        cost_info = self.calculate_session_cost(final_time, session["tier"])
        
        # Generate ledger signature
        ledger_sig = self.sync_to_ledger(
            session["user_id"],
            cost_info["your_cost"],
            session_id
        )
        
        return {
            "session_id": session_id,
            "user_id": session["user_id"],
            "duration_seconds": final_time,
            "final_cost": cost_info["your_cost"],
            "savings": cost_info["savings"],
            "tier": session["tier"],
            "ledger_signature": ledger_sig,
            "status": "completed",
        }

    def sync_to_ledger(self, user_id: str, amount: float, reference: str = "") -> str:
        """
        SHA-256 signature for the financial transaction.
        
        Args:
            user_id: User identifier
            amount: Transaction amount
            reference: Optional reference (session_id, etc.)
            
        Returns:
            SHA-256 signature
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        data = f"{user_id}:{amount}:{reference}:{timestamp}:DEPOSIT"
        signature = enlighten_core.secure_hash(data)
        
        print(f"[SovereignEconomy] Ledger sync: user={user_id}, amount=${amount}, sig={signature[:12]}...")
        
        return signature

    def get_tier_info(self, tier: str = "NOVICE") -> Dict[str, Any]:
        """Get information about a specific tier."""
        tier = tier.upper() if tier else "NOVICE"
        
        return {
            "tier": tier,
            "label": self.tier_labels.get(tier, "Novice"),
            "multiplier": self.user_tiers.get(tier, 1.0),
            "discount_percent": f"{int((1 - self.user_tiers.get(tier, 1.0)) * 100)}%",
            "hourly_rate": self.calculate_machine_rate(tier),
            "market_rate": self.market_rate_per_hour,
        }

    def get_all_tiers(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all tiers."""
        return {
            tier: self.get_tier_info(tier)
            for tier in self.user_tiers.keys()
        }


# Singleton instance
sovereign_economy = SovereignEconomy()


# Convenience exports
def calculate_rate(tier: str = "NOVICE") -> float:
    """Quick access to rate calculation."""
    return sovereign_economy.calculate_machine_rate(tier)

def get_rate_breakdown(tier: str = "NOVICE") -> Dict[str, Any]:
    """Quick access to full rate breakdown."""
    return sovereign_economy.get_rate_breakdown(tier)

def sync_to_ledger(user_id: str, amount: float, reference: str = "") -> str:
    """Quick access to ledger sync."""
    return sovereign_economy.sync_to_ledger(user_id, amount, reference)


__all__ = [
    'SovereignEconomy',
    'sovereign_economy',
    'calculate_rate',
    'get_rate_breakdown',
    'sync_to_ledger',
]
