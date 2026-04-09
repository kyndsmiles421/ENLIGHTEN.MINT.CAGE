"""
ENLIGHTEN.MINT.CAFE — Sovereign Ledger & Communication Routes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ledger sync for transaction integrity, SMS/Email routing with sanitization.
Uses production SovereignEngine for Twilio & SendGrid integration.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from deps import db, get_current_user, logger
from engines.crystal_seal import sanitize_input, EconomyCommon
from engines.sovereign_production import (
    enlighten_core, 
    secure_hash, 
    secure_hash_short,
    dispatch_sms,
    dispatch_email
)
from datetime import datetime, timezone
from typing import Optional, Dict, Any

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
    Uses production Twilio integration when configured.
    Scrubs all outgoing metadata to prevent PII leaks.
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
    
    # Dispatch via production engine
    result = dispatch_sms(safe_to, safe_message)
    
    # Log communication (sanitized)
    comm_entry = {
        "id": tracking_id,
        "user_id": user_id,
        "channel": "sms",
        "type": safe_type,
        "recipient_hash": secure_hash_short(safe_to),  # Store hash, not actual number
        "message_length": len(safe_message),
        "status": result.get("status", "unknown"),
        "message_sid": result.get("message_sid"),
        "created_at": now,
    }
    
    await db.comm_log.insert_one(comm_entry)
    
    return {
        "channel": "sms",
        "tracking_id": tracking_id,
        "status": result.get("status"),
        "success": result.get("success", False),
        "message": "SMS delivered" if result.get("success") else result.get("error", "SMS queued"),
        "twilio_enabled": enlighten_core.twilio_enabled,
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
    Uses production SendGrid integration when configured.
    Sanitizes all content and logs with hashed PII.
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
    
    # Dispatch via production engine
    result = dispatch_email(safe_to, safe_subject, safe_body, html_body)
    
    # Log communication (sanitized)
    comm_entry = {
        "id": tracking_id,
        "user_id": user_id,
        "channel": "email",
        "recipient_hash": secure_hash_short(safe_to),
        "subject_preview": safe_subject[:50],
        "template": safe_template,
        "body_length": len(safe_body),
        "status": result.get("status", "unknown"),
        "created_at": now,
    }
    
    await db.comm_log.insert_one(comm_entry)
    
    return {
        "channel": "email",
        "tracking_id": tracking_id,
        "status": result.get("status"),
        "success": result.get("success", False),
        "template": safe_template,
        "message": "Email delivered" if result.get("success") else result.get("error", "Email queued"),
        "sendgrid_enabled": enlighten_core.sendgrid_enabled,
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



@router.get("/status")
async def get_sovereign_status():
    """Get Sovereign Engine status - integrations health check."""
    return {
        "engine": "SovereignEngine",
        "version": "2.0.0",
        **enlighten_core.get_status(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health")
async def get_unified_health():
    """Get full Unified Sovereign system health check."""
    from engines.enlighten_unified import sovereign
    return sovereign.health_check()


@router.get("/modules")
async def get_modules():
    """Get all registered modules and their status."""
    from engines.base_module import get_all_modules
    return {
        "modules": get_all_modules(),
        "count": len(get_all_modules()),
    }


@router.post("/execute")
async def execute_action(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """
    Execute an action through the Unified Sovereign system.
    
    Body:
        module: Module name (e.g., "Crystals")
        action: Action name (e.g., "polish")
        payload: Action payload (optional)
    """
    from engines.enlighten_unified import sovereign
    
    module_name = data.get("module")
    action = data.get("action")
    payload = data.get("payload", {})
    
    if not module_name or not action:
        raise HTTPException(400, "module and action are required")
    
    # Add user context to payload
    payload["_user_id"] = user["id"]
    payload["_timestamp"] = datetime.now(timezone.utc).isoformat()
    
    result = sovereign.execute_action(module_name, action, payload)
    
    return result



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SOVEREIGN ECONOMY ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/economy/rates")
async def get_economy_rates(tier: str = "NOVICE"):
    """Get rate breakdown for a specific tier."""
    from engines.sovereign_economy import sovereign_economy
    return sovereign_economy.get_rate_breakdown(tier)


@router.get("/economy/tiers")
async def get_all_tiers():
    """Get all tier information."""
    from engines.sovereign_economy import sovereign_economy
    return sovereign_economy.get_all_tiers()


@router.post("/economy/session/start")
async def start_economy_session(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """Start a machine session for billing."""
    from engines.sovereign_economy import sovereign_economy
    
    tier = data.get("tier", "NOVICE")
    session = sovereign_economy.start_session(user["id"], tier)
    
    # Log to database
    await db.economy_sessions.insert_one({
        **session,
        "user_id": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    return session


@router.post("/economy/session/heartbeat")
async def record_heartbeat(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """Record a heartbeat for an active session."""
    from engines.sovereign_economy import sovereign_economy
    
    session_id = data.get("session_id")
    machine_time = data.get("machine_time", 0)
    
    if not session_id:
        raise HTTPException(400, "session_id required")
    
    result = sovereign_economy.record_heartbeat(session_id, machine_time)
    
    if result.get("error"):
        raise HTTPException(404, result["error"])
    
    return result


@router.post("/economy/session/end")
async def end_economy_session(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """End a machine session and calculate final bill."""
    from engines.sovereign_economy import sovereign_economy
    
    session_id = data.get("session_id")
    final_time = data.get("final_time", 0)
    
    if not session_id:
        raise HTTPException(400, "session_id required")
    
    result = sovereign_economy.end_session(session_id, final_time)
    
    if result.get("error"):
        raise HTTPException(404, result["error"])
    
    # Update database
    await db.economy_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": result.get("ended_at") or datetime.now(timezone.utc).isoformat(),
            "final_cost": result["final_cost"],
            "savings": result["savings"],
            "ledger_signature": result["ledger_signature"],
            "status": "completed",
        }}
    )
    
    return result


@router.post("/creator/heartbeat")
async def creator_heartbeat(data: dict = Body(...)):
    """
    Creator Console heartbeat - tracks machine usage.
    Called every 60 seconds during active broadcast.
    """
    machine_time = data.get("machine_time", 0)
    stream_status = data.get("stream_status", "idle")
    output_type = data.get("output_type", "frequency")
    
    # Log heartbeat
    await db.creator_heartbeats.insert_one({
        "machine_time": machine_time,
        "stream_status": stream_status,
        "output_type": output_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    
    return {
        "received": True,
        "machine_time": machine_time,
        "status": stream_status,
    }



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  VOLUNTEER & PACKAGE ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/economy/package-cost")
async def get_package_cost(
    tier: str = "NOVICE",
    volunteer_hours: float = 0,
):
    """
    Calculate package cost with 10% April reduction + volunteer credits.
    
    Query params:
        tier: NOVICE, SOVEREIGN, or ENLIGHTENED
        volunteer_hours: Hours of volunteer work to apply as credit
    """
    from engines.sovereign_economy import sovereign_economy
    return sovereign_economy.calculate_package_cost(tier, volunteer_hours)


@router.post("/economy/volunteer/record")
async def record_volunteer_hours(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """
    Record volunteer hours for a user.
    
    Body:
        hours: Number of hours volunteered
        activity: Description of volunteer activity
    """
    from engines.sovereign_economy import sovereign_economy
    
    hours = data.get("hours", 0)
    activity = data.get("activity", "")
    
    if hours <= 0:
        raise HTTPException(400, "Hours must be positive")
    
    result = sovereign_economy.record_volunteer_hours(user["id"], hours, activity)
    
    # Also store in database
    await db.volunteer_ledger.insert_one({
        "user_id": user["id"],
        "hours": hours,
        "activity": activity,
        "credit_value": hours * sovereign_economy.volunteer_credit_value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    
    return result


@router.get("/economy/volunteer/balance")
async def get_volunteer_balance(user=Depends(get_current_user)):
    """Get volunteer balance and credit for the current user."""
    from engines.sovereign_economy import sovereign_economy
    
    # Get from database
    cursor = db.volunteer_ledger.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1)
    
    activities = await cursor.to_list(length=100)
    
    total_hours = sum(a.get("hours", 0) for a in activities)
    total_credit = total_hours * sovereign_economy.volunteer_credit_value
    
    return {
        "user_id": user["id"],
        "total_hours": total_hours,
        "total_credit": total_credit,
        "credit_rate": sovereign_economy.volunteer_credit_value,
        "activity_count": len(activities),
        "recent_activities": activities[:10],  # Last 10 activities
    }


@router.get("/economy/packages")
async def get_all_packages():
    """Get all package pricing with April reduction applied."""
    from engines.sovereign_economy import sovereign_economy
    
    packages = {}
    for tier in ["NOVICE", "SOVEREIGN", "ENLIGHTENED"]:
        packages[tier] = sovereign_economy.calculate_package_cost(tier, 0)
    
    return {
        "packages": packages,
        "volunteer_credit_rate": sovereign_economy.volunteer_credit_value,
        "april_reduction": f"{sovereign_economy.april_reduction_percent}%",
        "note": "Apply volunteer hours to reduce package cost",
    }
