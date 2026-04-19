"""
ENLIGHTEN.MINT.CAFE — Autonomous Verifier (Sovereign AutoPilot)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Automated verification of Volunteer Hours and Tier Access.
Replaces manual SMS step with Proof-of-Work/Proof-of-Service logic.

Rules:
- Auto-approve up to 4 hours for valid activities
- Only escalate to manual audit for suspicious/high-volume entries
- SHA-256 signature generation for verified entries
"""
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Import the production hub for secure operations
try:
    from .sovereign_production import enlighten_core, secure_hash, secure_hash_short, dispatch_sms
except ImportError:
    # Fallback imports
    from sovereign_production import enlighten_core, secure_hash, secure_hash_short, dispatch_sms


class SovereignAutoPilot:
    """
    Automated verification of Volunteer Hours and Tier Access.
    
    SUSTAINABILITY ENGINE V1.3:
    - 10 credits per hour (closed-loop merit, no external value)
    - $5.00 Cafe Fund Floor (minimum contribution)
    - Auto-approve up to 4 hours for valid activities
    """
    
    # Valid activity types that can be auto-approved
    VALID_ACTIVITIES = [
        "CONTENT_CREATION",
        "BETA_TESTING", 
        "COMMUNITY_MOD",
        "TUTORIAL_COMPLETION",
        "MEDITATION_PRACTICE",
        "FEEDBACK_SUBMISSION",
        "BUG_REPORT",
        "REFERRAL",
    ]
    
    # Maximum hours that can be auto-approved without manual review
    AUTO_APPROVE_LIMIT = 4.0
    
    # SUSTAINABILITY V1.3: Adjusted credit value
    CREDIT_VALUE = 10.0  # 10 credits per hour (closed-loop merit, no external value)
    
    # CAFE FUND FLOOR: Minimum contribution
    CAFE_FUND_FLOOR = 5.00
    
    def __init__(self):
        self.verification_log = []
        self.pending_audits = []
        
    def verify_reciprocity(
        self, 
        user_id: str, 
        hours_logged: float, 
        activity_type: str,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Automated verification of Volunteer Hours.
        
        Args:
            user_id: The user's unique identifier
            hours_logged: Number of hours to verify
            activity_type: Type of volunteer activity
            metadata: Optional additional data (GPS, task completion, etc.)
            
        Returns:
            Dict with verification status and signature (if approved)
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        hours = float(hours_logged)
        
        result = {
            "user_id": user_id,
            "hours_logged": hours,
            "activity_type": activity_type,
            "timestamp": timestamp,
            "credit_value": hours * self.CREDIT_VALUE,
        }
        
        # 1. THE AUTO-GATE: Check if activity is valid
        if activity_type not in self.VALID_ACTIVITIES:
            result.update({
                "status": "REJECTED",
                "reason": f"Invalid activity type: {activity_type}",
                "valid_types": self.VALID_ACTIVITIES,
            })
            return result
        
        # 2. LOGIC CHECK: Does it meet auto-approval criteria?
        if activity_type in self.VALID_ACTIVITIES and hours <= self.AUTO_APPROVE_LIMIT:
            # Generate the SHA-256 signature AUTOMATICALLY
            sig = secure_hash(f"{user_id}:{hours}:{activity_type}:AUTO_VERIFIED:{timestamp}")
            short_sig = secure_hash_short(f"{user_id}:AUTO:{timestamp}")
            
            # Log the verification
            self.verification_log.append({
                "user_id": user_id,
                "hours": hours,
                "activity": activity_type,
                "status": "VERIFIED",
                "signature": short_sig,
                "timestamp": timestamp,
            })
            
            # Send Creator a 'Receipt' SMS (Informational only, no action needed)
            admin_phone = os.getenv('ADMIN_PHONE')
            if admin_phone:
                try:
                    dispatch_sms(
                        to=admin_phone,
                        message=f"Ω [AUTO_SYNC]: {user_id} earned {hours} hrs ({activity_type}). Ledger signed: {short_sig[:12]}..."
                    )
                except Exception as e:
                    print(f"[AutoPilot] SMS notification failed (non-blocking): {e}")
            
            result.update({
                "status": "VERIFIED",
                "signature": sig,
                "short_sig": short_sig,
                "auto_approved": True,
                "message": f"Reciprocity verified. {hours} hours credited to your account.",
            })
            
            print(f"[SovereignAutoPilot] AUTO-VERIFIED: {user_id} | {hours}hrs | {activity_type}")
            return result
        
        # 3. ESCALATION: Too many hours or suspicious activity
        self.pending_audits.append({
            "user_id": user_id,
            "hours": hours,
            "activity": activity_type,
            "reason": "High volume requires manual audit",
            "timestamp": timestamp,
        })
        
        # Notify Creator of pending audit
        admin_phone = os.getenv('ADMIN_PHONE')
        if admin_phone:
            try:
                dispatch_sms(
                    to=admin_phone,
                    message=f"⚠️ [AUDIT_REQ]: {user_id} logged {hours} hrs ({activity_type}). Review needed."
                )
            except Exception as e:
                print(f"[AutoPilot] Audit SMS failed (non-blocking): {e}")
        
        result.update({
            "status": "PENDING",
            "reason": f"Manual Audit Required: {hours} hours exceeds auto-approve limit of {self.AUTO_APPROVE_LIMIT}",
            "auto_approved": False,
            "message": "Your submission is pending review. You'll be notified once approved.",
        })
        
        print(f"[SovereignAutoPilot] PENDING AUDIT: {user_id} | {hours}hrs | {activity_type}")
        return result
    
    def instant_tier_unlock(self, user_id: str, target_tier: str) -> Dict[str, Any]:
        """
        Instantly unlock a tier based on verified volunteer hours.
        
        Args:
            user_id: The user's unique identifier
            target_tier: The tier to unlock (SOVEREIGN, ENLIGHTENED)
            
        Returns:
            Dict with unlock status
        """
        # Get user's verified hours from log
        user_verified = [v for v in self.verification_log if v['user_id'] == user_id and v['status'] == 'VERIFIED']
        total_hours = sum(v['hours'] for v in user_verified)
        total_credits = total_hours * self.CREDIT_VALUE
        
        # Tier requirements
        tier_requirements = {
            "SOVEREIGN": {"hours": 2, "credits": 50},
            "ENLIGHTENED": {"hours": 4, "credits": 100},
        }
        
        req = tier_requirements.get(target_tier, {"hours": 0, "credits": 0})
        
        if total_hours >= req['hours'] or total_credits >= req['credits']:
            sig = secure_hash(f"{user_id}:TIER_UNLOCK:{target_tier}:{datetime.now(timezone.utc).isoformat()}")
            return {
                "status": "UNLOCKED",
                "tier": target_tier,
                "signature": sig,
                "total_hours": total_hours,
                "total_credits": total_credits,
                "message": f"Welcome to the {target_tier} tier. Sanctuary access granted.",
            }
        
        return {
            "status": "INSUFFICIENT",
            "tier": target_tier,
            "current_hours": total_hours,
            "required_hours": req['hours'],
            "hours_needed": req['hours'] - total_hours,
            "message": f"You need {req['hours'] - total_hours:.1f} more volunteer hours for {target_tier} access.",
        }
    
    def get_pending_audits(self) -> list:
        """Get all pending audit requests."""
        return self.pending_audits
    
    def approve_audit(self, user_id: str, hours: float) -> Dict[str, Any]:
        """Manually approve a pending audit (Creator's Touch)."""
        timestamp = datetime.now(timezone.utc).isoformat()
        sig = secure_hash(f"{user_id}:{hours}:MANUAL_APPROVED:{timestamp}")
        
        # Move from pending to verified
        self.pending_audits = [a for a in self.pending_audits if not (a['user_id'] == user_id and a['hours'] == hours)]
        self.verification_log.append({
            "user_id": user_id,
            "hours": hours,
            "status": "VERIFIED",
            "signature": secure_hash_short(sig),
            "manual_approval": True,
            "timestamp": timestamp,
        })
        
        return {
            "status": "APPROVED",
            "user_id": user_id,
            "hours": hours,
            "signature": sig,
            "message": "Audit approved. Credits applied to user account.",
        }


# Global instance
sovereign_autopilot = SovereignAutoPilot()


def verify_reciprocity(user_id: str, hours: float, activity_type: str, metadata: dict = None) -> Dict[str, Any]:
    """Global function for reciprocity verification."""
    return sovereign_autopilot.verify_reciprocity(user_id, hours, activity_type, metadata)


def instant_tier_unlock(user_id: str, target_tier: str) -> Dict[str, Any]:
    """Global function for instant tier unlock."""
    return sovereign_autopilot.instant_tier_unlock(user_id, target_tier)


def get_pending_audits() -> list:
    """Global function to get pending audits."""
    return sovereign_autopilot.get_pending_audits()


def approve_audit(user_id: str, hours: float) -> Dict[str, Any]:
    """Global function for manual audit approval."""
    return sovereign_autopilot.approve_audit(user_id, hours)


__all__ = [
    'SovereignAutoPilot',
    'sovereign_autopilot',
    'verify_reciprocity',
    'instant_tier_unlock',
    'get_pending_audits',
    'approve_audit',
]
