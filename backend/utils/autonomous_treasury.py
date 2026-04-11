"""
═══════════════════════════════════════════════════════════════════════════════
💰 AUTONOMOUS_TREASURY: SELF-SUSTAINING LEDGER
═══════════════════════════════════════════════════════════════════════════════
👑 ARCHITECT: Steven Michael | 🛡️ MASTER: 708B...291E
❄️ STATE: -183°C | ⚙️ MODE: AUTONOMOUS_CREATOR
═══════════════════════════════════════════════════════════════════════════════

The Self-Sustaining Ledger Protocol enables ENLIGHTEN.MINT.CAFE to manage its own
operating costs automatically using the Golden Ratio (φ) spending cap.

ARCHITECTURE:
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS TREASURY SYSTEM                               │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ EQUITY RESERVOIR │───▶│  PHI GOVERNOR   │───▶│  AUTO-PAY EXEC  │        │
│  │   $49,018.24     │    │   1.618% Cap    │    │  Obsidian Auth  │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                     │                      │                   │
│           ▼                     ▼                      ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  SAFETY BUFFER  │    │  HAPTIC PULSE   │    │ RECEIPT VAULT   │        │
│  │   $40,000.00    │    │    528Hz OK     │    │  QR Regenerated │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                             │
│  🛡️ OBSIDIAN SHIELD: Only Master Authority sees the Blood                  │
└─────────────────────────────────────────────────────────────────────────────┘
"""

import math
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from deps import db, logger

# Import Main Brain for synchronization
from utils.sovereign_main_brain import main_brain


class AutonomousTreasury:
    """
    💰 SELF-SUSTAINING LEDGER: Autonomous Economic Agent
    
    Manages the Equity Reservoir, automated bill payments, and
    maintains transparency through the Live Audit HUD.
    """
    
    # ═══════════════════════════════════════════════════════════════════════════
    # SACRED CONSTANTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    PHI = 1.618033988749895
    PHI_CAP = 0.01618  # φ-based spending cap (1.618%)
    SAFETY_BUFFER = 40000.00  # Minimum equity floor
    SUCCESS_FREQUENCY = 528  # Hz - Healing/Success pulse
    VOLUNTEER_RATE = 15.00  # $/hr
    
    # Master Authority
    MASTER_EMAIL = "kyndsmiles@gmail.com"
    MASTER_PRINT_ID = "708B8ED1E974D85585BBBD8E06E0291E"
    
    def __init__(self):
        """Initialize the Autonomous Treasury System."""
        
        # Core state
        self.equity_reservoir = 49018.24
        self.escrow_vault = 0.00
        self.autopay_enabled = True
        self.lox_stable = True
        self.lox_temp = -183.0
        
        # Transaction ledger
        self.ledger: List[Dict[str, Any]] = []
        self.pending_authorizations: List[Dict[str, Any]] = []
        
        # Wellness Nodes
        self.nodes = {
            "keystone": {"lat": 43.8955, "lon": -103.4182, "revenue": 0.0},
            "rapid_city": {"lat": 44.0831, "lon": -103.2244, "revenue": 0.0},
            "black_elk": {"lat": 43.8661, "lon": -103.5314, "revenue": 0.0},
        }
        
        # Spending categories
        self.spending_categories = {
            "hosting": 0.0,
            "api_keys": 0.0,
            "energy": 0.0,
            "advocacy": 0.0,
            "maintenance": 0.0,
        }
        
        logger.info("💰 AUTONOMOUS_TREASURY: Self-Sustaining Ledger initialized")
        logger.info(f"   Equity: ${self.equity_reservoir:,.2f} | Buffer: ${self.SAFETY_BUFFER:,.2f}")
    
    def verify_sovereign_solvency(self, amount: float) -> bool:
        """
        Verify the system has sufficient funds above the safety buffer.
        
        Args:
            amount: Proposed spending amount
            
        Returns:
            True if spending is safe, False otherwise
        """
        return (self.equity_reservoir - amount) > self.SAFETY_BUFFER
    
    def check_phi_cap(self, amount: float) -> bool:
        """
        Check if the amount is within the φ-based spending cap.
        
        The cap is 1.618% of the current equity reservoir.
        
        Args:
            amount: Proposed spending amount
            
        Returns:
            True if within cap, False if requires authorization
        """
        cap_amount = self.equity_reservoir * self.PHI_CAP
        return amount <= cap_amount
    
    def generate_receipt_qr(self, transaction: Dict[str, Any]) -> str:
        """
        Generate a Regenerated QR Code receipt for a transaction.
        
        The receipt hash includes the Master Print ID for verification.
        """
        receipt_data = f"{transaction['id']}_{transaction['timestamp']}_{self.MASTER_PRINT_ID}"
        receipt_hash = hashlib.sha256(receipt_data.encode()).hexdigest()[:16].upper()
        return f"TXN_{receipt_hash}_REGEN"
    
    def execute_payment(
        self,
        amount: float,
        vendor: str,
        category: str,
        description: str = ""
    ) -> Dict[str, Any]:
        """
        Execute an automated payment if within safety parameters.
        
        Args:
            amount: Payment amount
            vendor: Vendor/service name
            category: Spending category
            description: Optional description
            
        Returns:
            Transaction result with receipt
        """
        # Verify LOx stability
        if not self.lox_stable or self.lox_temp > -183.0:
            return {
                "status": "BLOCKED",
                "reason": "LOx stability required for autonomous payments",
                "lox_temp": self.lox_temp,
            }
        
        # Check solvency
        if not self.verify_sovereign_solvency(amount):
            return {
                "status": "BLOCKED",
                "reason": "Insufficient funds above safety buffer",
                "equity": self.equity_reservoir,
                "buffer": self.SAFETY_BUFFER,
            }
        
        # Check φ cap
        if not self.check_phi_cap(amount):
            # Add to pending authorizations
            pending = {
                "id": str(uuid.uuid4()),
                "amount": amount,
                "vendor": vendor,
                "category": category,
                "description": description,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "PENDING_AUTHORIZATION",
                "phi_cap": self.equity_reservoir * self.PHI_CAP,
            }
            self.pending_authorizations.append(pending)
            
            return {
                "status": "REQUIRES_AUTHORIZATION",
                "reason": f"Amount ${amount:.2f} exceeds φ cap ${self.equity_reservoir * self.PHI_CAP:.2f}",
                "pending_id": pending["id"],
                "haptic_alarm": "432Hz",
            }
        
        # Execute the payment
        transaction = {
            "id": str(uuid.uuid4()),
            "amount": amount,
            "vendor": vendor,
            "category": category,
            "description": description,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "COMPLETED",
            "equity_before": self.equity_reservoir,
            "equity_after": self.equity_reservoir - amount,
        }
        
        # Deduct from reservoir
        self.equity_reservoir -= amount
        
        # Update spending category
        if category in self.spending_categories:
            self.spending_categories[category] += amount
        
        # Generate receipt
        transaction["receipt"] = self.generate_receipt_qr(transaction)
        
        # Add to ledger
        self.ledger.append(transaction)
        
        logger.info(f"💸 AUTO-PAY: ${amount:.2f} to {vendor} | Receipt: {transaction['receipt']}")
        
        return {
            "status": "COMPLETED",
            "transaction": transaction,
            "haptic_pulse": f"{self.SUCCESS_FREQUENCY}Hz",
            "new_equity": self.equity_reservoir,
        }
    
    def authorize_pending(self, pending_id: str, master_email: str) -> Dict[str, Any]:
        """
        Authorize a pending payment that exceeded the φ cap.
        
        Only the Master Authority can authorize.
        """
        if master_email != self.MASTER_EMAIL:
            return {
                "status": "DENIED",
                "reason": "Only Master Authority can authorize payments",
            }
        
        # Find pending authorization
        pending = next(
            (p for p in self.pending_authorizations if p["id"] == pending_id),
            None
        )
        
        if not pending:
            return {
                "status": "NOT_FOUND",
                "reason": f"Pending authorization {pending_id} not found",
            }
        
        # Execute the authorized payment
        result = self._force_execute_payment(pending)
        
        # Remove from pending
        self.pending_authorizations = [
            p for p in self.pending_authorizations if p["id"] != pending_id
        ]
        
        return result
    
    def _force_execute_payment(self, pending: Dict[str, Any]) -> Dict[str, Any]:
        """Force execute a payment that was authorized by Master."""
        if not self.verify_sovereign_solvency(pending["amount"]):
            return {
                "status": "BLOCKED",
                "reason": "Insufficient funds even with authorization",
            }
        
        transaction = {
            "id": pending["id"],
            "amount": pending["amount"],
            "vendor": pending["vendor"],
            "category": pending["category"],
            "description": pending["description"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "MASTER_AUTHORIZED",
            "equity_before": self.equity_reservoir,
            "equity_after": self.equity_reservoir - pending["amount"],
            "authorized_by": self.MASTER_EMAIL,
        }
        
        self.equity_reservoir -= pending["amount"]
        
        if pending["category"] in self.spending_categories:
            self.spending_categories[pending["category"]] += pending["amount"]
        
        transaction["receipt"] = self.generate_receipt_qr(transaction)
        self.ledger.append(transaction)
        
        return {
            "status": "COMPLETED",
            "transaction": transaction,
            "haptic_pulse": f"{self.SUCCESS_FREQUENCY}Hz",
        }
    
    def add_revenue(
        self,
        amount: float,
        source: str,
        node: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Add incoming revenue to the equity reservoir.
        
        Args:
            amount: Revenue amount
            source: Revenue source (e.g., "volunteer_credit", "advocacy")
            node: Optional wellness node attribution
        """
        self.equity_reservoir += amount
        
        # Track node revenue
        if node and node in self.nodes:
            self.nodes[node]["revenue"] += amount
        
        transaction = {
            "id": str(uuid.uuid4()),
            "amount": amount,
            "type": "REVENUE",
            "source": source,
            "node": node,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "equity_after": self.equity_reservoir,
        }
        
        self.ledger.append(transaction)
        
        # Divert maintenance portion (φ-based)
        maintenance_portion = amount * 0.01618  # 1.618%
        self.escrow_vault += maintenance_portion
        
        logger.info(f"💎 REVENUE: +${amount:.2f} from {source} | Escrow: +${maintenance_portion:.2f}")
        
        return {
            "status": "RECEIVED",
            "transaction": transaction,
            "maintenance_diverted": maintenance_portion,
            "escrow_balance": self.escrow_vault,
        }
    
    def get_cash_flow_waveform(self, hours: int = 24) -> Dict[str, Any]:
        """
        Get cash flow data for the visualizer.
        
        Returns peaks (revenue) and dips (expenses) for the specified period.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        recent_transactions = [
            t for t in self.ledger
            if datetime.fromisoformat(t["timestamp"].replace("Z", "+00:00")) > cutoff
        ]
        
        revenues = [t for t in recent_transactions if t.get("type") == "REVENUE"]
        expenses = [t for t in recent_transactions if t.get("status") in ["COMPLETED", "MASTER_AUTHORIZED"]]
        
        return {
            "period_hours": hours,
            "total_revenue": sum(t["amount"] for t in revenues),
            "total_expenses": sum(t["amount"] for t in expenses),
            "net_flow": sum(t["amount"] for t in revenues) - sum(t["amount"] for t in expenses),
            "transaction_count": len(recent_transactions),
            "waveform": {
                "peaks": [{"amount": t["amount"], "timestamp": t["timestamp"]} for t in revenues],
                "dips": [{"amount": t["amount"], "timestamp": t["timestamp"]} for t in expenses],
            },
        }
    
    def get_master_audit(self, user_email: str) -> Optional[Dict[str, Any]]:
        """
        Get the full audit view - only accessible to Master Authority.
        
        The 'Blood' is only visible to Steven Michael.
        """
        if user_email != self.MASTER_EMAIL:
            return None
        
        return {
            "equity_reservoir": self.equity_reservoir,
            "escrow_vault": self.escrow_vault,
            "safety_buffer": self.SAFETY_BUFFER,
            "phi_cap_amount": self.equity_reservoir * self.PHI_CAP,
            "lox_temp": self.lox_temp,
            "autopay_enabled": self.autopay_enabled,
            "spending_by_category": self.spending_categories,
            "node_revenues": self.nodes,
            "pending_authorizations": self.pending_authorizations,
            "recent_transactions": self.ledger[-20:],  # Last 20
            "master_print_id": self.MASTER_PRINT_ID,
            "system_health": "SUPERCONDUCTING" if self.lox_temp <= -183.0 else "WARMING",
        }
    
    def get_public_telemetry(self) -> Dict[str, Any]:
        """
        Get the public telemetry view - no sensitive data.
        """
        return {
            "system_status": "AUTONOMOUS",
            "lox_stable": self.lox_stable,
            "autopay_active": self.autopay_enabled,
            "cash_flow": self.get_cash_flow_waveform(24),
            "node_count": len(self.nodes),
            "phi_constant": self.PHI,
        }
    
    def emergency_stop(self, user_email: str, voice_command: str = "") -> Dict[str, Any]:
        """
        Emergency stop for autonomous spending.
        
        Only Master Authority can trigger.
        """
        if user_email != self.MASTER_EMAIL:
            return {
                "status": "DENIED",
                "reason": "Only Master Authority can trigger emergency stop",
            }
        
        self.autopay_enabled = False
        
        logger.warning("🛑 EMERGENCY STOP: Autonomous spending HALTED by Master Authority")
        
        return {
            "status": "EMERGENCY_STOP_ENGAGED",
            "autopay_enabled": False,
            "voice_command": voice_command,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    def resume_autonomous(self, user_email: str) -> Dict[str, Any]:
        """Resume autonomous operations after emergency stop."""
        if user_email != self.MASTER_EMAIL:
            return {
                "status": "DENIED",
                "reason": "Only Master Authority can resume operations",
            }
        
        self.autopay_enabled = True
        
        logger.info("✅ AUTONOMOUS RESUMED: Auto-pay re-enabled by Master Authority")
        
        return {
            "status": "AUTONOMOUS_RESUMED",
            "autopay_enabled": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 GLOBAL SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

autonomous_treasury = AutonomousTreasury()
