"""
ENLIGHTEN.MINT.CAFE — Sovereign Ledger & Communication Routes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ledger sync for transaction integrity, SMS/Email routing with sanitization.
Uses production SovereignEngine for Twilio & SendGrid integration.
"""
from fastapi import APIRouter, HTTPException, Depends, Body, Header
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



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  EMERGENCY STOP — Kill Switch Endpoint
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/stop")
async def emergency_stop(data: dict = Body(default={})):
    """
    Emergency Stop Kill Switch - halts all multimedia streams.
    
    This is the backend 'Red Alert' that:
    1. Severs multimedia streams
    2. Logs the SHA-256 event to Creator Mode
    3. Returns halt confirmation
    
    Body (optional):
        action: The action type (default: "HARD_STOP")
        timestamp: Client-side timestamp
    """
    from engines.emergency_logic import execute_hard_stop
    
    action = data.get("action", "HARD_STOP")
    client_timestamp = data.get("timestamp")
    
    logger.warning(f"[EMERGENCY] Stop triggered: action={action}")
    
    # Execute the hard stop
    result = execute_hard_stop()
    
    # Add client timestamp to response if provided
    if client_timestamp:
        result["client_timestamp"] = client_timestamp
    
    # Log to sovereign ledger
    try:
        await db.sovereign_ledger.insert_one({
            "id": secure_hash_short(f"emergency:{result.get('timestamp', '')}"),
            "type": "EMERGENCY_STOP",
            "action": action,
            "status": result.get("status"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"[EMERGENCY] Ledger write failed: {e}")
    
    return result


@router.get("/stop/status")
async def get_stop_status():
    """Get emergency controller status."""
    from engines.emergency_logic import get_emergency_status
    return get_emergency_status()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RECIPROCITY GATE — Volunteer-to-Access Bridge
#  ⚠ DEACTIVATED 2026-02-04 per Sovereign Master Blueprint:
#  "VOLUNTEER MODE: DEACTIVATED. All labor-for-credit structures
#   are removed to protect platform solvency."
#  Endpoints return 410 Gone. Code preserved for future re-enable.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VOLUNTEER_MODE_ACTIVE = False
VOLUNTEER_DEACTIVATED_MESSAGE = (
    "Volunteer Mode is permanently deactivated. All labor-for-credit "
    "structures have been removed to protect platform solvency. "
    "Use Dust (hard currency) for upgrades or trade Sparks (XP) in the Trade Circle."
)

@router.post("/economy/volunteer/check")
async def check_volunteer_access(data: dict = Body(...)):
    """
    [DEACTIVATED] Volunteer access bypass.
    
    Returns 410 Gone. The volunteer-to-credit pipeline is permanently disabled
    per Sovereign Master Blueprint (2026-02-04).
    """
    if not VOLUNTEER_MODE_ACTIVE:
        raise HTTPException(status_code=410, detail=VOLUNTEER_DEACTIVATED_MESSAGE)

    from engines.reciprocity_gate import check_access_credits
    
    user_id = data.get("user_id")
    required_credits = data.get("required_credits", 0)
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    result = check_access_credits(user_id, required_credits)
    
    # Log to ledger
    try:
        await db.sovereign_ledger.insert_one({
            "id": secure_hash_short(f"access_check:{user_id}:{datetime.now(timezone.utc).isoformat()}"),
            "type": "ACCESS_CHECK",
            "user_id": user_id,
            "access": result.get("access"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"[ReciprocityGate] Ledger write failed: {e}")
    
    return result


@router.post("/economy/volunteer/record")
async def record_volunteer_activity(data: dict = Body(...)):
    """
    [DEACTIVATED] Record volunteer hours.
    
    Returns 410 Gone. No new volunteer ledger entries can be created.
    """
    if not VOLUNTEER_MODE_ACTIVE:
        raise HTTPException(status_code=410, detail=VOLUNTEER_DEACTIVATED_MESSAGE)

    PHI = 1.618033988749895
    CREDIT_RATE = 10  # 10 Credits/hr — in-app value, not USD
    FAN_RATE = 10     # 10 Fans/hr
    
    user_id = data.get("user_id")
    hours = data.get("hours", 0)
    activity = data.get("activity", "")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    if hours <= 0:
        raise HTTPException(status_code=400, detail="hours must be positive")
    
    # ═══ $5 CREDIT PURCHASE GATE ═══
    # Volunteer credits only activate after user has made initial $5 purchase
    purchase_record = await db.transactions.find_one(
        {"user_id": user_id, "amount": {"$gte": 5}, "status": "completed"},
        {"_id": 0}
    )
    logger.info(f"[VolunteerGate] user_id={user_id}, purchase_found={purchase_record is not None}")
    if not purchase_record:
        # Check subscription too — any paid tier counts
        sub = await db.subscriptions.find_one(
            {"user_id": user_id, "tier": {"$ne": "discovery"}},
            {"_id": 0, "tier": 1}
        )
        if not sub:
            return {
                "status": "locked",
                "message": "Volunteer credits unlock after initial credit purchase ($5 minimum).",
                "gate": "purchase_required",
                "credits": 0,
                "fans": 0,
            }
    
    # ═══ φ-ESCROW CALCULATION ═══
    gross_credits = hours * CREDIT_RATE
    phi_escrow = gross_credits * (PHI / 100)  # 1.618% system escrow
    net_credits = gross_credits - phi_escrow
    fans_earned = hours * FAN_RATE
    
    # Record to volunteer ledger
    try:
        from engines.reciprocity_gate import record_volunteer_hours
        result = record_volunteer_hours(user_id, hours, activity)
    except Exception:
        result = {"status": "recorded"}
    
    # Persist to MongoDB
    try:
        await db.volunteer_ledger.insert_one({
            "id": result.get("ledger_signature", f"vol_{user_id}_{datetime.now(timezone.utc).isoformat()}"),
            "user_id": user_id,
            "hours": hours,
            "activity": activity,
            "gross_credits": gross_credits,
            "phi_escrow": round(phi_escrow, 4),
            "net_credits": round(net_credits, 2),
            "fans_earned": fans_earned,
            "rate": CREDIT_RATE,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"[ReciprocityGate] Volunteer record failed: {e}")
    
    return {
        "status": "recorded",
        "hours": hours,
        "gross_credits": gross_credits,
        "phi_escrow": round(phi_escrow, 4),
        "net_credits": round(net_credits, 2),
        "fans_earned": fans_earned,
        "sovereignty_discount": True,
    }


@router.get("/economy/volunteer/balance")
async def get_volunteer_balance(user_id: str = None, authorization: str = Header(None)):
    """
    [DEACTIVATED] Get volunteer balance.
    
    Historic balances remain queryable as read-only (audit trail),
    but no new balance can be accrued since VOLUNTEER_MODE_ACTIVE=False.
    """
    if not VOLUNTEER_MODE_ACTIVE:
        # Read-only historical view — does not raise 410 so users can see legacy totals,
        # but earning is closed.
        # If you want to completely seal, uncomment the next line:
        # raise HTTPException(status_code=410, detail=VOLUNTEER_DEACTIVATED_MESSAGE)
        pass
    # Try to get user_id from auth token if not provided
    if not user_id and authorization:
        try:
            token = authorization.replace("Bearer ", "")
            # Decode token to get user_id (simplified)
            import jwt
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("user_id") or payload.get("sub")
        except Exception:
            pass
    
    if not user_id:
        return {"total_hours": 0, "total_credit": 0, "message": "No user identified"}
    
    # Query MongoDB for total hours
    try:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "total_hours": {"$sum": "$hours"}, "total_credit": {"$sum": "$credit_value"}}},
        ]
        result = await db.volunteer_ledger.aggregate(pipeline).to_list(1)
        
        if result:
            return {
                "user_id": user_id,
                "total_hours": result[0].get("total_hours", 0),
                "total_credit": result[0].get("total_credit", 0),
            }
    except Exception as e:
        logger.error(f"[ReciprocityGate] Balance query failed: {e}")
    
    return {"user_id": user_id, "total_hours": 0, "total_credit": 0}


class VolunteerExchangeRequest(BaseModel):
    hours: float


@router.post("/economy/volunteer/exchange")
async def exchange_volunteer_hours(
    data: VolunteerExchangeRequest,
    user=Depends(get_current_user),
):
    """
    Convert logged volunteer hours into spendable Resonance Credits.

    Rate: 10 credits per hour (matches omega_sentinel.VOLUNTEER_RATE,
    reciprocity_gate.CREDIT_VALUE_PER_HOUR, sovereign_ledger.VOLUNTEER_RATE).
    
    Balance is computed by summing hours across `volunteer_ledger` — log
    entries add positive hours (via /economy/volunteer/record), exchanges
    add NEGATIVE hours so the existing aggregation naturally nets out.

    Audit trail: a merchant_transactions row is written alongside the
    ledger entry so the exchange shows up in the canonical shop ledger
    that every other in-app currency event lives in.
    """
    import uuid as _uuid
    CREDIT_RATE = 10  # Keep in lockstep with record_volunteer_activity above.
    user_id = user["id"]
    hours_to_exchange = round(float(data.hours), 2)

    if hours_to_exchange <= 0:
        raise HTTPException(status_code=400, detail="hours must be positive")
    if hours_to_exchange > 10000:
        raise HTTPException(status_code=400, detail="hours out of range")

    # 1. Compute current balance by summing every ledger row (positive
    #    records + negative exchanges already in flight).
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total_hours": {"$sum": "$hours"}}},
    ]
    agg = await db.volunteer_ledger.aggregate(pipeline).to_list(1)
    current_hours = float((agg[0].get("total_hours") if agg else 0) or 0)

    if current_hours < hours_to_exchange:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient volunteer hours. Have {current_hours:.2f}, need {hours_to_exchange:.2f}.",
        )

    credits_earned = int(round(hours_to_exchange * CREDIT_RATE))
    exchange_id = str(_uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # 2. Insert the NEGATIVE ledger row first. If anything below fails we
    #    have a record that an exchange was attempted; orphaned negatives
    #    can be reconciled by inspecting merchant_transactions.
    await db.volunteer_ledger.insert_one({
        "id": exchange_id,
        "user_id": user_id,
        "hours": -hours_to_exchange,
        "activity": "volunteer_credit_exchange",
        "credit_value": -(hours_to_exchange * CREDIT_RATE),  # Keeps old aggregation in sync.
        "rate": CREDIT_RATE,
        "type": "exchange",
        "created_at": now,
    })

    # 3. Credit the user's Resonance Credit balance atomically.
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"user_credit_balance": credits_earned}},
    )

    # 4. Write the canonical merchant_transactions audit row — same
    #    schema every other in-app currency event uses so a Play Console
    #    auditor sees a single unified ledger.
    await db.merchant_transactions.insert_one({
        "id": exchange_id,
        "user_id": user_id,
        "type": "volunteer_exchange",
        "source": "volunteer_ledger",
        "hours_spent": hours_to_exchange,
        "rate_per_hour": CREDIT_RATE,
        "credits_granted": credits_earned,
        "created_at": now,
    })

    # 5. Return the fresh balances so the frontend can update in place.
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    return {
        "success": True,
        "hours_exchanged": hours_to_exchange,
        "credits_granted": credits_earned,
        "rate_per_hour": CREDIT_RATE,
        "remaining_hours": round(current_hours - hours_to_exchange, 2),
        "new_credit_balance": (u or {}).get("user_credit_balance", credits_earned),
        "ledger_id": exchange_id,
    }


@router.get("/economy/rates")
async def get_economy_rates(tier: str = "BASIC"):
    """
    Get economy rates including 20% below market pricing.
    """
    from engines.reciprocity_gate import get_tier_access_map, calculate_sovereign_price
    
    tier_map = get_tier_access_map()
    tier_info = tier_map.get(tier.upper(), tier_map.get("BASIC"))
    
    return {
        "tier": tier.upper(),
        "market_rate": 50.00,
        "sovereign_rate": 40.00,  # 20% below market
        "discount": "20%",
        "volunteer_value_per_hour": 25.00,
        "tier_info": tier_info,
        "pricing_breakdown": calculate_sovereign_price(50.00, 0),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AUTONOMOUS VERIFIER — Auto-Pilot Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/economy/auto-verify")
async def auto_verify_volunteer(data: dict = Body(...)):
    """
    Autonomous verification of volunteer hours.
    Auto-approves up to 4 hours for valid activities.
    
    Body:
        hours: Number of hours to verify
        activity_type: Type of activity (BETA_TESTING, CONTENT_CREATION, etc.)
        user_id: (optional) User identifier
    """
    from engines.autonomous_verifier import verify_reciprocity
    
    hours = data.get("hours", 0)
    activity_type = data.get("activity_type", "BETA_TESTING")
    user_id = data.get("user_id", "anonymous")
    
    if hours <= 0:
        raise HTTPException(status_code=400, detail="Hours must be positive")
    
    result = verify_reciprocity(user_id, hours, activity_type)
    
    # Log to MongoDB
    try:
        await db.auto_verifications.insert_one({
            "id": secure_hash_short(f"autoverify:{user_id}:{datetime.now(timezone.utc).isoformat()}"),
            "user_id": user_id,
            "hours": hours,
            "activity_type": activity_type,
            "status": result.get("status"),
            "signature": result.get("short_sig", result.get("signature", "")[:24]),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"[AutoVerify] DB write failed: {e}")
    
    return result


@router.post("/economy/tier-unlock")
async def tier_unlock_check(data: dict = Body(...)):
    """
    Check if user qualifies for tier unlock based on volunteer hours.
    
    Body:
        target_tier: The tier to attempt unlocking (SOVEREIGN, ENLIGHTENED)
        user_id: (optional) User identifier
    """
    from engines.autonomous_verifier import instant_tier_unlock
    
    target_tier = data.get("target_tier", "SOVEREIGN")
    user_id = data.get("user_id", "anonymous")
    
    result = instant_tier_unlock(user_id, target_tier)
    
    # Log tier unlock attempt
    try:
        await db.tier_unlocks.insert_one({
            "id": secure_hash_short(f"tierunlock:{user_id}:{datetime.now(timezone.utc).isoformat()}"),
            "user_id": user_id,
            "target_tier": target_tier,
            "status": result.get("status"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"[TierUnlock] DB write failed: {e}")
    
    return result


@router.get("/economy/pending-audits")
async def get_pending_audits():
    """Get all pending audit requests for manual review."""
    from engines.autonomous_verifier import get_pending_audits
    return {"audits": get_pending_audits()}


@router.post("/economy/approve-audit")
async def approve_audit(data: dict = Body(...)):
    """
    Manually approve a pending audit (Creator's Touch).
    
    Body:
        user_id: User whose audit to approve
        hours: Hours to approve
    """
    from engines.autonomous_verifier import approve_audit
    
    user_id = data.get("user_id")
    hours = data.get("hours")
    
    if not user_id or not hours:
        raise HTTPException(status_code=400, detail="user_id and hours required")
    
    return approve_audit(user_id, hours)


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
# NOTE: `/economy/rates` and `/economy/volunteer/balance` are served by
# the earlier definitions (lines 525 and 662). Duplicate route
# declarations that previously lived here have been removed — they were
# shadowed at startup by FastAPI's first-match routing and caused F811
# lint noise. The remaining routes below are unique.


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


# NOTE: Duplicate volunteer/record route removed — gated version at line 436 handles this
# with $5 purchase gate + φ-escrow + 10 Credits/hr rate
# NOTE: Duplicate `/economy/volunteer/balance` route removed — first-match
# at line 525 serves the aggregate query that includes exchange rows.


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
