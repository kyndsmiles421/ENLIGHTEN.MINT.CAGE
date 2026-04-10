"""
ENLIGHTEN.MINT.CAFE - V-FINAL SOVEREIGN LEDGER
sovereign_ledger.py

THE COSMIC LEDGER: Tracks all sovereign transactions including:
- Math Refraction Licenses (Proof of Math economy)
- Volunteer Credit ($15/hr) conversions
- Aether Fund equity transfers
- L² Fractal Engine script injections

MATH TAX FORMULA: price × (1 / φ) where φ = 1.618033988749895
This creates a "Golden Ratio Tax" that feeds back into the ecosystem.
"""

import time
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from deps import db, logger


class SovereignLedger:
    """
    V-FINAL SOVEREIGN LEDGER — The Cosmic Transaction Engine
    
    Handles all equity transfers, math licensing, and volunteer credit
    conversions within the Enlighten.Mint.Sovereign.Trust ecosystem.
    """
    
    # Constants
    PHI = 1.618033988749895
    INVERSE_PHI = 1 / PHI  # 0.618... The Math Tax coefficient
    VOLUNTEER_RATE = 15.00  # $15/hr Commonality Constant
    SEG_FREQUENCY = 144  # Hz
    
    # In-memory ledger (production would use MongoDB)
    _ledgers = {}
    _global_transactions = []
    
    # Refraction Market (linked to refraction_engine.py)
    REFRACTION_MARKET = {
        "INFINITY_EDGE": {"price": 50, "tier": "PREMIUM", "equity_value": 79.31},
        "PRISMATIC_DISPERSION": {"price": 75, "tier": "PREMIUM", "equity_value": 118.97},
        "L2_FRACTAL_RECURSION": {"price": 150, "tier": "LEGENDARY", "equity_value": 237.94},
        "PHI_SPIRAL_BLOOM": {"price": 200, "tier": "LEGENDARY", "equity_value": 317.25},
        "OBSIDIAN_VOID_RENDER": {"price": 500, "tier": "OMEGA", "equity_value": 793.13},
    }
    
    @classmethod
    def get_or_create_ledger(cls, user_id: str) -> Dict[str, Any]:
        """Get or create a user's sovereign ledger."""
        if user_id not in cls._ledgers:
            cls._ledgers[user_id] = {
                "user_id": user_id,
                "equity_balance": 1000.00,  # Starting equity
                "dust_balance": 500,
                "gems_balance": 100,
                "volunteer_hours": 0.0,
                "volunteer_credits": 0.0,
                "unlocked_assets": [],
                "transactions": [],
                "tier": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        return cls._ledgers[user_id]
    
    @classmethod
    def process_refraction_license(
        cls, 
        user_id: str, 
        math_artifact_id: str
    ) -> Dict[str, Any]:
        """
        Validates and executes the transfer of Equity for high-tier math.
        Integrates the $15/hr volunteer credit logic into the purchase power.
        
        MATH TAX: price × (1/φ) — The Golden Ratio Tax
        This feeds back into the Aether Fund for ecosystem sustainability.
        """
        ledger = cls.get_or_create_ledger(user_id)
        artifact = cls.REFRACTION_MARKET.get(math_artifact_id.upper())
        
        if not artifact:
            return {
                "status": "ARTIFACT_NOT_FOUND",
                "message": f"Unknown math artifact: {math_artifact_id}",
                "available": list(cls.REFRACTION_MARKET.keys()),
            }
        
        # Check if already licensed
        if math_artifact_id.upper() in ledger["unlocked_assets"]:
            return {
                "status": "ALREADY_LICENSED",
                "message": f"{math_artifact_id} already in your vault",
            }
        
        # Calculate the 'Math Tax' using the Inverse Pressure Coefficient (1/φ)
        base_price = artifact["price"]
        math_tax = base_price * cls.INVERSE_PHI
        total_cost = base_price + math_tax
        
        # Check volunteer credit boost (reduces cost by credit percentage)
        credit_discount = min(ledger["volunteer_credits"] * 0.01, 0.25)  # Max 25% discount
        discounted_cost = total_cost * (1 - credit_discount)
        
        # Convert gems to equity equivalent (1 gem = $1.58 equity at φ rate)
        gems_as_equity = ledger["gems_balance"] * cls.PHI
        total_purchasing_power = ledger["equity_balance"] + gems_as_equity
        
        if total_purchasing_power < discounted_cost:
            return {
                "status": "INSUFFICIENT_FUNDS",
                "required": round(discounted_cost, 2),
                "available_equity": round(ledger["equity_balance"], 2),
                "available_gems": ledger["gems_balance"],
                "gems_as_equity": round(gems_as_equity, 2),
                "total_purchasing_power": round(total_purchasing_power, 2),
                "volunteer_discount_applied": f"{credit_discount * 100:.1f}%",
                "suggestion": f"Earn {round((discounted_cost - total_purchasing_power) / cls.VOLUNTEER_RATE, 1)} more volunteer hours",
            }
        
        # EXECUTE TRANSACTION
        # First deduct from gems, then equity
        gems_used = 0
        equity_used = discounted_cost
        
        if ledger["gems_balance"] > 0:
            max_gems_to_use = min(ledger["gems_balance"], discounted_cost / cls.PHI)
            gems_used = max_gems_to_use
            equity_used = discounted_cost - (gems_used * cls.PHI)
            ledger["gems_balance"] -= int(gems_used)
        
        ledger["equity_balance"] -= equity_used
        
        # Generate transaction hash
        tx_hash = hashlib.sha256(
            f"{user_id}{math_artifact_id}{time.time()}".encode()
        ).hexdigest()[:16].upper()
        
        # Log the transaction in the Cosmic Ledger
        transaction_entry = {
            "tx_id": f"MATH-{tx_hash}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "epoch_time": time.time(),
            "action": "MATH_LICENSE_ISSUED",
            "artifact": math_artifact_id.upper(),
            "tier": artifact["tier"],
            "base_price": base_price,
            "math_tax": round(math_tax, 2),
            "total_cost": round(total_cost, 2),
            "volunteer_discount": round(credit_discount * total_cost, 2),
            "final_cost": round(discounted_cost, 2),
            "gems_used": int(gems_used),
            "equity_used": round(equity_used, 2),
            "system_pulse": "STABLE",
            "seg_frequency": cls.SEG_FREQUENCY,
        }
        
        ledger["transactions"].append(transaction_entry)
        cls._global_transactions.append({
            "user_id": user_id,
            **transaction_entry
        })
        
        # UNLOCK: Inject the L² Fractal Engine scripts into the user's Profile
        ledger["unlocked_assets"].append(math_artifact_id.upper())
        
        logger.info(f"SOVEREIGN_LEDGER: Math license issued | User: {user_id} | Artifact: {math_artifact_id} | TX: {tx_hash}")
        
        return {
            "status": "SUCCESS",
            "message": f"L² Fractal Engine script '{math_artifact_id}' injected into your profile",
            "vault_update": transaction_entry,
            "new_equity_balance": round(ledger["equity_balance"], 2),
            "new_gems_balance": ledger["gems_balance"],
            "unlocked_assets": ledger["unlocked_assets"],
        }
    
    @classmethod
    def log_volunteer_hours(
        cls, 
        user_id: str, 
        hours: float, 
        activity: str = "learning"
    ) -> Dict[str, Any]:
        """
        Log volunteer hours and convert to credits.
        $15/hr Commonality Constant applies.
        """
        ledger = cls.get_or_create_ledger(user_id)
        
        # Calculate credits earned
        credits_earned = hours * cls.VOLUNTEER_RATE
        
        ledger["volunteer_hours"] += hours
        ledger["volunteer_credits"] += credits_earned
        
        # Also add a small equity bonus (φ ratio)
        equity_bonus = credits_earned * cls.INVERSE_PHI
        ledger["equity_balance"] += equity_bonus
        
        tx_hash = hashlib.sha256(
            f"{user_id}volunteer{time.time()}".encode()
        ).hexdigest()[:16].upper()
        
        transaction_entry = {
            "tx_id": f"VOL-{tx_hash}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "VOLUNTEER_CREDIT_EARNED",
            "activity": activity,
            "hours": hours,
            "credits_earned": credits_earned,
            "equity_bonus": round(equity_bonus, 2),
            "rate": cls.VOLUNTEER_RATE,
        }
        
        ledger["transactions"].append(transaction_entry)
        
        return {
            "status": "SUCCESS",
            "hours_logged": hours,
            "credits_earned": credits_earned,
            "equity_bonus": round(equity_bonus, 2),
            "total_volunteer_hours": round(ledger["volunteer_hours"], 2),
            "total_volunteer_credits": round(ledger["volunteer_credits"], 2),
            "new_equity_balance": round(ledger["equity_balance"], 2),
            "transaction": transaction_entry,
        }
    
    @classmethod
    def transfer_equity(
        cls,
        from_user: str,
        to_user: str,
        amount: float,
        memo: str = "Transfer"
    ) -> Dict[str, Any]:
        """
        Transfer equity between users.
        A small transfer tax (1/φ²) goes to the Aether Fund.
        """
        from_ledger = cls.get_or_create_ledger(from_user)
        to_ledger = cls.get_or_create_ledger(to_user)
        
        # Transfer tax (1/φ²)
        transfer_tax = amount * (cls.INVERSE_PHI ** 2)
        total_deduction = amount + transfer_tax
        
        if from_ledger["equity_balance"] < total_deduction:
            return {
                "status": "INSUFFICIENT_FUNDS",
                "required": round(total_deduction, 2),
                "available": round(from_ledger["equity_balance"], 2),
            }
        
        # Execute transfer
        from_ledger["equity_balance"] -= total_deduction
        to_ledger["equity_balance"] += amount
        
        tx_hash = hashlib.sha256(
            f"{from_user}{to_user}{amount}{time.time()}".encode()
        ).hexdigest()[:16].upper()
        
        transaction_entry = {
            "tx_id": f"TXF-{tx_hash}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "EQUITY_TRANSFER",
            "from_user": from_user,
            "to_user": to_user,
            "amount": amount,
            "transfer_tax": round(transfer_tax, 2),
            "memo": memo,
        }
        
        from_ledger["transactions"].append(transaction_entry)
        to_ledger["transactions"].append(transaction_entry)
        cls._global_transactions.append(transaction_entry)
        
        return {
            "status": "SUCCESS",
            "transaction": transaction_entry,
            "from_new_balance": round(from_ledger["equity_balance"], 2),
            "to_new_balance": round(to_ledger["equity_balance"], 2),
        }
    
    @classmethod
    def get_ledger_status(cls, user_id: str) -> Dict[str, Any]:
        """Get full ledger status for a user."""
        ledger = cls.get_or_create_ledger(user_id)
        
        # Calculate purchasing power
        gems_as_equity = ledger["gems_balance"] * cls.PHI
        total_purchasing_power = ledger["equity_balance"] + gems_as_equity
        
        # Calculate volunteer discount potential
        credit_discount = min(ledger["volunteer_credits"] * 0.01, 0.25)
        
        return {
            "user_id": user_id,
            "balances": {
                "equity": round(ledger["equity_balance"], 2),
                "dust": ledger["dust_balance"],
                "gems": ledger["gems_balance"],
                "gems_as_equity": round(gems_as_equity, 2),
                "total_purchasing_power": round(total_purchasing_power, 2),
            },
            "volunteer": {
                "hours": round(ledger["volunteer_hours"], 2),
                "credits": round(ledger["volunteer_credits"], 2),
                "discount_rate": f"{credit_discount * 100:.1f}%",
                "rate_per_hour": cls.VOLUNTEER_RATE,
            },
            "vault": {
                "unlocked_assets": ledger["unlocked_assets"],
                "asset_count": len(ledger["unlocked_assets"]),
            },
            "tier": ledger["tier"],
            "transaction_count": len(ledger["transactions"]),
            "created_at": ledger["created_at"],
        }
    
    @classmethod
    def get_transaction_history(
        cls, 
        user_id: str, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get user's transaction history."""
        ledger = cls.get_or_create_ledger(user_id)
        return ledger["transactions"][-limit:]
    
    @classmethod
    def get_global_transactions(cls, limit: int = 100) -> List[Dict[str, Any]]:
        """Get global transaction history (Cosmic Ledger view)."""
        return cls._global_transactions[-limit:]
    
    @classmethod
    def get_market_prices(cls) -> Dict[str, Any]:
        """Get current refraction market prices with math tax calculations."""
        prices = {}
        for artifact_id, artifact in cls.REFRACTION_MARKET.items():
            base = artifact["price"]
            tax = base * cls.INVERSE_PHI
            prices[artifact_id] = {
                "base_price_gems": base,
                "math_tax_gems": round(tax, 2),
                "total_gems": round(base + tax, 2),
                "equity_value": artifact["equity_value"],
                "tier": artifact["tier"],
            }
        return {
            "market": "REFRACTION_ARTIFACTS",
            "currency": "GEMS",
            "tax_rate": f"{cls.INVERSE_PHI * 100:.2f}% (1/φ)",
            "volunteer_max_discount": "25%",
            "prices": prices,
        }
    
    @classmethod
    def add_gems(cls, user_id: str, amount: int, source: str = "reward") -> Dict[str, Any]:
        """Add gems to user's balance."""
        ledger = cls.get_or_create_ledger(user_id)
        ledger["gems_balance"] += amount
        
        tx_hash = hashlib.sha256(
            f"{user_id}gems{amount}{time.time()}".encode()
        ).hexdigest()[:12].upper()
        
        transaction_entry = {
            "tx_id": f"GEM-{tx_hash}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "GEMS_RECEIVED",
            "amount": amount,
            "source": source,
        }
        
        ledger["transactions"].append(transaction_entry)
        
        return {
            "status": "SUCCESS",
            "gems_added": amount,
            "new_balance": ledger["gems_balance"],
            "transaction": transaction_entry,
        }
    
    @classmethod
    def add_dust(cls, user_id: str, amount: int, source: str = "reward") -> Dict[str, Any]:
        """Add dust to user's balance."""
        ledger = cls.get_or_create_ledger(user_id)
        ledger["dust_balance"] += amount
        
        tx_hash = hashlib.sha256(
            f"{user_id}dust{amount}{time.time()}".encode()
        ).hexdigest()[:12].upper()
        
        transaction_entry = {
            "tx_id": f"DST-{tx_hash}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "DUST_RECEIVED",
            "amount": amount,
            "source": source,
        }
        
        ledger["transactions"].append(transaction_entry)
        
        return {
            "status": "SUCCESS",
            "dust_added": amount,
            "new_balance": ledger["dust_balance"],
            "transaction": transaction_entry,
        }


# Global instance
sovereign_ledger = SovereignLedger()
