"""
═══════════════════════════════════════════════════════════════════════════════
💰 AUTONOMOUS_TREASURY: SINGULARITY KERNEL V29.0
═══════════════════════════════════════════════════════════════════════════════
👑 ARCHITECT: Steven Michael | 🛡️ MASTER: 708B...291E
❄️ STATE: -183°C | ⚙️ MODE: AUTONOMOUS_CREATOR
═══════════════════════════════════════════════════════════════════════════════

The Self-Sustaining Ledger Protocol enables ENLIGHTEN.MINT.CAFE to manage its own
operating costs automatically using the Golden Ratio (φ) spending cap.

FOUR-TIERED PAY STRUCTURE (V29.0):
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SOVEREIGN LEDGER INTELLIGENCE                            │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   TIER 1        │    │   TIER 2        │    │   TIER 3        │        │
│  │   ESCROW        │    │   LABOR         │    │   BUFFER        │        │
│  │  φ% (1.618%)    │    │  $15/hr Tracks  │    │  $40,000 LOCKED │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                     │                      │                   │
│           └──────────────┬──────┴──────────────────────┘                   │
│                          ▼                                                  │
│              ┌─────────────────────┐                                       │
│              │       TIER 4        │                                       │
│              │     EXPANSION       │  ◄── Liquid 'Cause' Money             │
│              │   (Keystone Fader)  │      Haptic @ $1,000 milestone        │
│              └─────────────────────┘                                       │
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
    💰 SINGULARITY KERNEL V29.0: Four-Tiered Ledger Intelligence
    
    Manages the Equity Reservoir with a transparent 4-tier system:
      T1 ESCROW: φ-based escrow (1.618%)
      T2 LABOR: Volunteer credit tracking ($15/hr)
      T3 BUFFER: Safety floor ($40,000 LOCKED)
      T4 EXPANSION: Liquid 'Cause' money for real-world events
    
    Includes Haptic Milestone Alerts at 80% intensity.
    """
    
    # ═══════════════════════════════════════════════════════════════════════════
    # SACRED CONSTANTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    PHI = 1.618033988749895
    PHI_CAP = 0.01618  # φ-based spending cap (1.618%)
    SAFETY_BUFFER = 40000.00  # Minimum equity floor (TIER 3 - LOCKED)
    SUCCESS_FREQUENCY = 528  # Hz - Healing/Success pulse
    SOLFEGGIO_PULSE = [174, 100, 528, 100, 174]  # Solfeggio-aligned vibration pattern
    VOLUNTEER_RATE = 15.00  # $/hr (TIER 2 tracking)
    HAPTIC_THRESHOLD = 1000.00  # $1,000 milestone for haptic pulse
    HAPTIC_INTENSITY = 0.80  # 80% intensity
    
    # Master Authority
    MASTER_EMAIL = "kyndsmiles@gmail.com"
    MASTER_PRINT_ID = "708B8ED1E974D85585BBBD8E06E0291E"
    
    def __init__(self):
        """Initialize the Singularity Kernel V29.0."""
        
        # Core state
        self.equity_reservoir = 49018.24
        self.escrow_vault = 0.00
        self.autopay_enabled = True
        self.lox_stable = True
        self.lox_temp = -183.0
        
        # V29.0: Four-Tiered Structure
        self.tiers = {
            "T1_ESCROW": 0.0,       # φ-based escrow (1.618%)
            "T2_LABOR": 0.0,        # Volunteer credit tracking
            "T3_BUFFER": self.SAFETY_BUFFER,  # Safety floor (LOCKED)
            "T4_EXPANSION": 0.0,    # Liquid 'Cause' money
        }
        
        # Haptic milestone tracking
        self.last_haptic_milestone = 8000.00  # Baseline starting point
        self.haptic_events: List[Dict[str, Any]] = []
        
        # Refresh tier calculations
        self._refresh_tiers()
        
        # Transaction ledger
        self.ledger: List[Dict[str, Any]] = []
        self.pending_authorizations: List[Dict[str, Any]] = []
        
        # V29.0: Seed with demo transactions for Live Ledger Feed
        self._seed_demo_transactions()
        
        # Wellness Nodes
        self.nodes = {
            "keystone": {"lat": 43.8955, "lon": -103.4182, "revenue": 0.0, "frequency": 528},
            "rapid_city": {"lat": 44.0831, "lon": -103.2244, "revenue": 0.0, "frequency": 639},
            "black_elk": {"lat": 43.8661, "lon": -103.5314, "revenue": 0.0, "frequency": 432},
        }
        
        # Spending categories
        self.spending_categories = {
            "hosting": 0.0,
            "api_keys": 0.0,
            "energy": 0.0,
            "advocacy": 0.0,
            "maintenance": 0.0,
        }
        
        logger.info("💰 SINGULARITY_KERNEL_V29.0: Four-Tiered Ledger Intelligence initialized")
        logger.info(f"   Equity: ${self.equity_reservoir:,.2f} | T4 Expansion: ${self.tiers['T4_EXPANSION']:,.2f}")
    
    def _seed_demo_transactions(self):
        """
        V29.0: Seed demo transactions for the Live Ledger Feed.
        Shows realistic fund flow for the Master Authority view.
        """
        demo_txns = [
            {
                "id": "TXN_SEED_001",
                "amount": 250.00,
                "type": "REVENUE",
                "source": "Seven Seals Advocacy",
                "node": "keystone",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
                "equity_after": 49018.24,
            },
            {
                "id": "TXN_SEED_002",
                "amount": 15.00,
                "type": "REVENUE",
                "source": "Volunteer Credit (1hr)",
                "node": "rapid_city",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat(),
                "equity_after": 49033.24,
            },
            {
                "id": "TXN_SEED_003",
                "amount": 29.99,
                "type": "EXPENSE",
                "vendor": "Vercel Hosting",
                "category": "hosting",
                "status": "COMPLETED",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
                "equity_after": 49003.25,
            },
            {
                "id": "TXN_SEED_004",
                "amount": 500.00,
                "type": "REVENUE",
                "source": "Black Hills Wellness Donation",
                "node": "black_elk",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
                "equity_after": 49503.25,
            },
            {
                "id": "TXN_SEED_005",
                "amount": 45.00,
                "type": "REVENUE",
                "source": "Volunteer Credits (3hr)",
                "node": "keystone",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
                "equity_after": 49548.25,
            },
            {
                "id": "TXN_SEED_006",
                "amount": 75.00,
                "type": "REVENUE",
                "source": "Crystal Workshop Registration",
                "node": "rapid_city",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
                "equity_after": 49623.25,
            },
            {
                "id": "TXN_SEED_007",
                "amount": 100.00,
                "type": "REVENUE",
                "source": "Masonry School Tuition",
                "node": "keystone",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat(),
                "equity_after": 49723.25,
            },
        ]
        
        self.ledger.extend(demo_txns)
        logger.info(f"📜 LIVE_LEDGER: Seeded {len(demo_txns)} demo transactions")
    
    def _refresh_tiers(self):
        """
        V29.0: Recalculate the Four-Tiered distribution.
        
        Formula:
          T1 ESCROW = Reservoir × φ% (1.618%)
          T2 LABOR = Volunteer rate tracking ($15/hr unit)
          T3 BUFFER = $40,000 (LOCKED)
          T4 EXPANSION = Reservoir - Buffer - Escrow (Liquid 'Cause' Money)
        """
        # Tier 1: Phi-based Escrow (1.618%)
        self.tiers["T1_ESCROW"] = self.equity_reservoir * self.PHI_CAP
        
        # Tier 3: Safety Buffer (Locked)
        self.tiers["T3_BUFFER"] = self.SAFETY_BUFFER
        
        # Tier 4: Expansion Fund (The Liquid 'Cause' Money)
        # Formula: Total - Buffer - Escrow
        self.tiers["T4_EXPANSION"] = max(
            0, 
            self.equity_reservoir - self.SAFETY_BUFFER - self.tiers["T1_ESCROW"]
        )
        
        # Tier 2: Labor/Volunteer Credits (Unit representation)
        self.tiers["T2_LABOR"] = self.VOLUNTEER_RATE
        
        # Check for Haptic Milestone
        self._check_haptic_milestone()
    
    def _check_haptic_milestone(self) -> Optional[Dict[str, Any]]:
        """
        V29.0: Check if Tier 4 Expansion Fund crossed a $1,000 milestone.
        
        Returns haptic event data if milestone crossed, None otherwise.
        """
        current_expansion = self.tiers["T4_EXPANSION"]
        
        # Calculate which $1,000 milestone we're at
        current_milestone = int(current_expansion / self.HAPTIC_THRESHOLD) * self.HAPTIC_THRESHOLD
        
        if current_milestone > self.last_haptic_milestone:
            # MILESTONE CROSSED! Generate haptic event
            haptic_event = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "milestone_amount": current_milestone,
                "tier4_balance": current_expansion,
                "pulse_pattern": self.SOLFEGGIO_PULSE,
                "intensity": self.HAPTIC_INTENSITY,
                "frequency": self.SUCCESS_FREQUENCY,
                "message": f"Tier 4 Expansion Fund reached ${current_milestone:,.0f}!"
            }
            
            self.haptic_events.append(haptic_event)
            self.last_haptic_milestone = current_milestone
            
            logger.info(f"📳 HAPTIC MILESTONE: T4 Expansion hit ${current_milestone:,.0f}")
            
            return haptic_event
        
        return None
    
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
        V29.0: Add incoming revenue to the equity reservoir.
        
        Revenue is instantly partitioned across the Four Tiers.
        
        Args:
            amount: Revenue amount
            source: Revenue source (e.g., "volunteer_credit", "advocacy", "seven_seals")
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
        
        # Divert maintenance portion (φ-based) to Tier 1 Escrow
        maintenance_portion = amount * self.PHI_CAP  # 1.618%
        self.escrow_vault += maintenance_portion
        
        # V29.0: Refresh tiers after revenue addition
        haptic_event = self._refresh_tiers()
        
        # Check for haptic milestone
        self._check_haptic_milestone()
        
        logger.info(f"💎 REVENUE: +${amount:.2f} from {source} | T4 Expansion: ${self.tiers['T4_EXPANSION']:,.2f}")
        
        return {
            "status": "RECEIVED",
            "transaction": transaction,
            "maintenance_diverted": maintenance_portion,
            "escrow_balance": self.escrow_vault,
            "tier_update": {k: round(v, 2) for k, v in self.tiers.items()},
            "haptic_triggered": haptic_event is not None,
            "haptic_event": haptic_event,
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
        V29.0: Full Sovereign Ledger Audit - MASTER AUTHORITY ONLY.
        
        Returns the complete 'Blood' view including the Four-Tiered breakdown.
        The 'Blood' is only visible to Steven Michael.
        """
        if user_email != self.MASTER_EMAIL:
            return None
        
        # Refresh tiers before audit
        self._refresh_tiers()
        
        return {
            "version": "V29.0",
            "equity_reservoir": self.equity_reservoir,
            "escrow_vault": self.escrow_vault,
            "safety_buffer": self.SAFETY_BUFFER,
            "phi_cap_amount": self.equity_reservoir * self.PHI_CAP,
            "lox_temp": self.lox_temp,
            "autopay_enabled": self.autopay_enabled,
            "spending_by_category": self.spending_categories,
            "node_revenues": self.nodes,
            "pending_authorizations": self.pending_authorizations,
            "recent_transactions": self.ledger[-20:],
            "master_print_id": self.MASTER_PRINT_ID,
            "system_health": "SUPERCONDUCTING" if self.lox_temp <= -183.0 else "WARMING",
            # V29.0: Four-Tiered Intelligence
            "four_tier_ledger": {
                "T1_ESCROW": {
                    "label": "ESCROW",
                    "amount": round(self.tiers["T1_ESCROW"], 2),
                    "formula": "φ × 1.618%",
                    "status": "🔒 LOCKED",
                    "fader_position": 7,  # Layer A fader #7
                },
                "T2_LABOR": {
                    "label": "LABOR RATE",
                    "amount": self.tiers["T2_LABOR"],
                    "formula": "$15/hr Volunteer Credits",
                    "status": "📊 TRACKING",
                    "fader_position": 2,  # Layer A fader #2 (Equity Gain)
                },
                "T3_BUFFER": {
                    "label": "RED LIMIT",
                    "amount": round(self.tiers["T3_BUFFER"], 2),
                    "formula": "$40,000 Safety Floor",
                    "status": "🔴 LOCKED",
                    "fader_position": None,  # LED indicator only
                },
                "T4_EXPANSION": {
                    "label": "KEYSTONE",
                    "amount": round(self.tiers["T4_EXPANSION"], 2),
                    "formula": "Reservoir - Buffer - Escrow",
                    "status": "🔓 LIQUID",
                    "fader_position": 3,  # Layer A fader #3 (Keystone)
                },
            },
            "haptic_config": {
                "threshold": self.HAPTIC_THRESHOLD,
                "intensity": self.HAPTIC_INTENSITY,
                "last_milestone": self.last_haptic_milestone,
                "pulse_pattern": self.SOLFEGGIO_PULSE,
                "recent_events": self.haptic_events[-5:],  # Last 5 haptic events
            },
            "resonance": (self.PHI ** 2) / math.pi,
        }
    
    def get_tiered_audit_stream(self) -> Dict[str, Any]:
        """
        V29.0: Terminal-style Sovereign Ledger Audit Feed.
        
        Returns data formatted for the scrolling terminal display in the
        Apex Creator Console right panel.
        """
        self._refresh_tiers()
        
        stream_lines = [
            {"type": "header", "text": "--- SOVEREIGN LEDGER V29.0 ---"},
            {"type": "timestamp", "text": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")},
            {"type": "separator", "text": "─" * 40},
            {"type": "tier", "tier": "T1", "label": "ESCROW", "amount": self.tiers["T1_ESCROW"], "icon": "🔒"},
            {"type": "tier", "tier": "T2", "label": "LABOR RATE", "amount": self.tiers["T2_LABOR"], "icon": "📊", "unit": "/hr"},
            {"type": "tier", "tier": "T3", "label": "RED LIMIT (BUFFER)", "amount": self.tiers["T3_BUFFER"], "icon": "🔴"},
            {"type": "tier", "tier": "T4", "label": "KEYSTONE (EXPANSION)", "amount": self.tiers["T4_EXPANSION"], "icon": "🔓"},
            {"type": "separator", "text": "─" * 40},
            {"type": "total", "label": "TOTAL RESERVOIR", "amount": self.equity_reservoir},
            {"type": "status", "text": f"SYSTEM: {'HYPER-CONDUCTIVE' if self.lox_temp <= -183.0 else 'WARMING'}"},
            {"type": "resonance", "value": round((self.PHI ** 2) / math.pi, 4)},
        ]
        
        return {
            "stream": stream_lines,
            "tier_summary": {k: round(v, 2) for k, v in self.tiers.items()},
            "total_reservoir": round(self.equity_reservoir, 2),
            "haptic_pending": len([e for e in self.haptic_events if e["timestamp"] > (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()]),
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
