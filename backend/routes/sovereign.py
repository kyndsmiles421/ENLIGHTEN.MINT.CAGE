"""
ENLIGHTEN.MINT.CAFE — Sovereign Ledger & Communication Routes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ledger sync for transaction integrity, SMS/Email routing with sanitization.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from deps import db, get_current_user, logger
from engines.crystal_seal import (
    secure_hash, 
    secure_hash_short, 
    sanitize_input,
    EconomyCommon
)
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import os

router = APIRouter(prefix="/sovereign", tags=["sovereign"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PYDANTIC MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LedgerSyncRequest(BaseModel):
    data: Dict[str, Any]
    sig: str  # SHA-256 signature of stringified data


class SMSRequest(BaseModel):
    to: str
    message: str
    type: str = "NOTIFICATION"  # NOTIFICATION, EMERGENCY, VERIFICATION


class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    template: str = "refracted-crystal"  # refracted-crystal, obsidian, pure-light


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LEDGER SYNC — Transaction Integrity
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/ledger/sync")
async def sync_ledger(req: LedgerSyncRequest, user=Depends(get_current_user)):
    """
    Reconciles local state with Crystal Seal SHA-256 signatures.
    Verifies transaction integrity before committing to the ledger.
    """
    user_id = user["id"]
    now = datetime.now(timezone.utc).isoformat()
    
    # Verify signature integrity
    data_str = str(req.data)
    expected_sig = secure_hash(data_str)
    
    if req.sig != expected_sig:
        logger.warning(f"[Ledger] Signature mismatch for user {user_id}")
        return {
            "status": "error",
            "error": "Signature Mismatch — Data integrity check failed",
            "expected_prefix": expected_sig[:12],
            "received_prefix": req.sig[:12] if len(req.sig) >= 12 else req.sig,
        }
    
    # Extract transaction details
    tx_type = req.data.get("type", "unknown")
    tx_amount = req.data.get("amount", 0)
    tx_ref = req.data.get("ref", "")
    
    # Validate transaction using EconomyCommon
    if tx_type in ["dust_transfer", "credit_purchase", "subscription"]:
        is_valid, msg = EconomyCommon.validate_transaction(
            float(tx_amount), 
            float(req.data.get("available", 0))
        )
        if not is_valid:
            return {"status": "error", "error": msg}
    
    # Generate ledger entry ID
    ledger_id = secure_hash_short(f"{user_id}:{now}:{data_str[:100]}")
    
    # Store in ledger
    ledger_entry = {
        "id": ledger_id,
        "user_id": user_id,
        "type": tx_type,
        "amount": tx_amount,
        "ref": sanitize_input(tx_ref, 200),
        "data_hash": expected_sig,
        "verified": True,
        "created_at": now,
    }
    
    await db.sovereign_ledger.insert_one(ledger_entry)
    
    logger.info(f"[Ledger] Entry {ledger_id} synced for user {user_id}")
    
    return {
        "status": "success",
        "id": ledger_id,
        "verified": True,
        "timestamp": now,
    }


@router.get("/ledger/history")
async def get_ledger_history(limit: int = 20, user=Depends(get_current_user)):
    """Get user's ledger transaction history."""
    user_id = user["id"]
    
    cursor = db.sovereign_ledger.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(min(limit, 100))
    
    entries = await cursor.to_list(length=min(limit, 100))
    
    return {
        "entries": entries,
        "count": len(entries),
        "user_id": user_id,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COMMUNICATION ROUTING — SMS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/route/sms")
async def route_sms(req: SMSRequest, user=Depends(get_current_user)):
    """
    Secure SMS routing with input sanitization.
    Scrubs all outgoing metadata to prevent PII leaks.
    
    Note: Requires Twilio integration for production.
    Currently returns mock success for development.
    """
    user_id = user["id"]
    now = datetime.now(timezone.utc).isoformat()
    
    # Sanitize all inputs
    safe_to = sanitize_input(req.to, 20)  # Phone numbers max 20 chars
    safe_message = sanitize_input(req.message, 160)  # SMS char limit
    safe_type = sanitize_input(req.type, 20)
    
    # Generate tracking ID (no PII in the hash)
    tracking_id = secure_hash_short(f"sms:{user_id}:{now}")
    
    # Check rate limiting
    recent_count = await db.comm_log.count_documents({
        "user_id": user_id,
        "channel": "sms",
        "created_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()}
    })
    
    if recent_count >= 10:  # Daily limit
        raise HTTPException(429, "Daily SMS limit reached (10/day)")
    
    # Log communication (sanitized)
    comm_entry = {
        "id": tracking_id,
        "user_id": user_id,
        "channel": "sms",
        "type": safe_type,
        "recipient_hash": secure_hash_short(safe_to),  # Store hash, not actual number
        "message_length": len(safe_message),
        "status": "queued",
        "created_at": now,
    }
    
    await db.comm_log.insert_one(comm_entry)
    
    # TODO: Integrate with Twilio in production
    # For now, return mock success
    twilio_enabled = os.getenv("TWILIO_ACCOUNT_SID") is not None
    
    if twilio_enabled:
        # Production: Would call Twilio API here
        logger.info(f"[SMS] Would send to {safe_to[:3]}***")
    
    return {
        "channel": "sms",
        "tracking_id": tracking_id,
        "status": "dispatched" if twilio_enabled else "queued_mock",
        "message": "SMS queued for delivery" if twilio_enabled else "SMS simulated (Twilio not configured)",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COMMUNICATION ROUTING — EMAIL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Email templates with Refracted Crystal branding
EMAIL_TEMPLATES = {
    "refracted-crystal": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #e2e8f0; margin: 0; padding: 40px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 32px; }}
        .header {{ border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px; }}
        .logo {{ color: #a78bfa; font-size: 24px; font-weight: bold; }}
        .content {{ line-height: 1.6; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #64748b; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✦ ENLIGHTEN.MINT.CAFE</div>
        </div>
        <div class="content">
            <h2 style="color: #f8fafc;">{subject}</h2>
            <p>{body}</p>
        </div>
        <div class="footer">
            <p>This is an automated message from ENLIGHTEN.MINT.CAFE</p>
            <p>© 2026 The Sovereign Engine</p>
        </div>
    </div>
</body>
</html>
""",
    "obsidian": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: monospace; background: #000; color: #22c55e; padding: 40px; }}
        .container {{ max-width: 600px; margin: 0 auto; border: 1px solid #22c55e; padding: 32px; }}
        h2 {{ color: #4ade80; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>[SOVEREIGN TRANSMISSION]</h2>
        <h3>{subject}</h3>
        <pre>{body}</pre>
        <hr style="border-color: #22c55e;">
        <small>ENLIGHTEN.MINT.CAFE // OBSIDIAN PROTOCOL</small>
    </div>
</body>
</html>
""",
    "pure-light": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Georgia, serif; background: #fefefe; color: #1a1a1a; padding: 40px; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 32px; }}
        h2 {{ color: #7c3aed; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>🌟 {subject}</h2>
        <p>{body}</p>
        <hr>
        <small>With light, ENLIGHTEN.MINT.CAFE</small>
    </div>
</body>
</html>
""",
}


@router.post("/route/email")
async def route_email(req: EmailRequest, user=Depends(get_current_user)):
    """
    Secure email routing with refracted-crystal HTML templates.
    Sanitizes all content and logs with hashed PII.
    
    Note: Requires SendGrid integration for production.
    Currently returns mock success for development.
    """
    user_id = user["id"]
    now = datetime.now(timezone.utc).isoformat()
    
    # Sanitize inputs
    safe_to = sanitize_input(req.to, 100)
    safe_subject = sanitize_input(req.subject, 200)
    safe_body = sanitize_input(req.body, 5000)
    safe_template = req.template if req.template in EMAIL_TEMPLATES else "refracted-crystal"
    
    # Generate tracking ID
    tracking_id = secure_hash_short(f"email:{user_id}:{now}")
    
    # Build HTML from template
    html_body = EMAIL_TEMPLATES[safe_template].format(
        subject=safe_subject,
        body=safe_body.replace("\n", "<br>")
    )
    
    # Log communication (sanitized)
    comm_entry = {
        "id": tracking_id,
        "user_id": user_id,
        "channel": "email",
        "recipient_hash": secure_hash_short(safe_to),
        "subject_preview": safe_subject[:50],
        "template": safe_template,
        "body_length": len(safe_body),
        "status": "queued",
        "created_at": now,
    }
    
    await db.comm_log.insert_one(comm_entry)
    
    # TODO: Integrate with SendGrid in production
    sendgrid_enabled = os.getenv("SENDGRID_API_KEY") is not None
    
    if sendgrid_enabled:
        logger.info(f"[Email] Would send to {safe_to.split('@')[0][:3]}***@***")
    
    return {
        "channel": "email",
        "tracking_id": tracking_id,
        "status": "dispatched" if sendgrid_enabled else "queued_mock",
        "template": safe_template,
        "message": "Email queued for delivery" if sendgrid_enabled else "Email simulated (SendGrid not configured)",
        "html_preview": html_body[:500] + "..." if len(html_body) > 500 else html_body,
    }


@router.get("/route/status/{tracking_id}")
async def get_comm_status(tracking_id: str, user=Depends(get_current_user)):
    """Check status of a sent communication."""
    entry = await db.comm_log.find_one(
        {"id": tracking_id, "user_id": user["id"]},
        {"_id": 0}
    )
    
    if not entry:
        raise HTTPException(404, "Communication not found")
    
    return entry
