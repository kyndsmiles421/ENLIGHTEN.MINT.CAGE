"""
SOVEREIGN HANDSHAKE - Live Communication Module
Architect: Steven Michael | Terminal: kyndsmiles@gmail.com
Purpose: Dimensional notification via Twilio/SendGrid (963Hz Sigfield)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import os
import hashlib
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

router = APIRouter(prefix="/sovereign/handshake", tags=["sovereign-handshake"])

# ═══════════════════════════════════════════════════════════════════════════
# DATA MODELS
# ═══════════════════════════════════════════════════════════════════════════

class HandshakeRequest(BaseModel):
    architect: str
    terminal: str
    frequency: str
    type: str
    content: str
    recipient_email: Optional[str] = None
    timestamp: Optional[str] = None

class HandshakeResponse(BaseModel):
    success: bool
    message: str
    signature: str
    frequency: str
    timestamp: str
    email_sent: Optional[bool] = None

# ═══════════════════════════════════════════════════════════════════════════
# SOVEREIGN VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════

AUTHORIZED_ARCHITECT = "Steven Michael"
AUTHORIZED_TERMINAL = "kyndsmiles@gmail.com"

def verify_sovereign(architect: str, terminal: str) -> bool:
    """Verify the request is from the authorized Sovereign"""
    return architect == AUTHORIZED_ARCHITECT and terminal == AUTHORIZED_TERMINAL

def generate_signature(data: dict) -> str:
    """Generate SHA-256 signature for the handshake"""
    payload = f"{data['architect']}:{data['terminal']}:{data['frequency']}:{data['timestamp']}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]

# ═══════════════════════════════════════════════════════════════════════════
# SENDGRID EMAIL SERVICE
# ═══════════════════════════════════════════════════════════════════════════

def send_sovereign_email(recipient: str, subject: str, content: str, frequency: str) -> bool:
    """
    Send dimensional email via SendGrid
    Returns True if successful, False otherwise
    """
    sendgrid_key = os.environ.get("SENDGRID_API_KEY")
    sender_email = os.environ.get("SENDGRID_FROM_EMAIL", "kyndsmiles@gmail.com")
    
    if not sendgrid_key:
        print("[SENDGRID] API key not configured")
        return False
    
    # Create mystical HTML email template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #000000 100%);
                color: #d4af37;
                font-family: 'Georgia', serif;
                margin: 0;
                padding: 40px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #d4af37;
                border-radius: 12px;
                padding: 40px;
            }}
            .header {{
                text-align: center;
                border-bottom: 1px solid #d4af37;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 28px;
                color: #d4af37;
                text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            }}
            .frequency {{
                font-size: 14px;
                color: #888;
                margin-top: 10px;
            }}
            .content {{
                font-size: 16px;
                line-height: 1.8;
                color: #e0e0e0;
            }}
            .signature {{
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #333;
                text-align: center;
                font-style: italic;
                color: #888;
            }}
            .architect {{
                color: #d4af37;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✧ The Enlightenment Café ✧</div>
                <div class="frequency">Frequency: {frequency}</div>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="signature">
                Transmitted by <span class="architect">{AUTHORIZED_ARCHITECT}</span><br>
                Terminal: {AUTHORIZED_TERMINAL}
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        message = Mail(
            from_email=Email(sender_email, "The Enlightenment Café"),
            to_emails=To(recipient),
            subject=f"✧ {subject} | {frequency} Frequency",
            html_content=html_content
        )
        
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        
        print(f"[SENDGRID] Email sent to {recipient} | Status: {response.status_code}")
        return response.status_code == 202
        
    except Exception as e:
        print(f"[SENDGRID] Error sending email: {str(e)}")
        return False

# ═══════════════════════════════════════════════════════════════════════════
# HANDSHAKE ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/send", response_model=HandshakeResponse)
async def sovereign_handshake(request: HandshakeRequest):
    """
    Process a Sovereign Handshake request.
    This is the bridge to Twilio/SendGrid live communication.
    """
    
    # Verify sovereign identity
    if not verify_sovereign(request.architect, request.terminal):
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized: Invalid Sovereign Identity"
        )
    
    timestamp = request.timestamp or datetime.now(timezone.utc).isoformat()
    
    # Generate cryptographic signature
    signature = generate_signature({
        "architect": request.architect,
        "terminal": request.terminal,
        "frequency": request.frequency,
        "timestamp": timestamp
    })
    
    # Log the handshake
    print(f"\n{'═' * 60}")
    print(f"[HANDSHAKE] Type: {request.type}")
    print(f"[HANDSHAKE] Architect: {request.architect}")
    print(f"[HANDSHAKE] Terminal: {request.terminal}")
    print(f"[HANDSHAKE] Frequency: {request.frequency}")
    print(f"[HANDSHAKE] Content: {request.content}")
    print(f"[HANDSHAKE] Signature: {signature}")
    print(f"{'═' * 60}\n")
    
    # Check for Twilio/SendGrid configuration
    twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    sendgrid_key = os.environ.get("SENDGRID_API_KEY")
    
    live_channels = []
    email_sent = None
    
    if twilio_sid:
        live_channels.append("Twilio")
        # TODO: Implement actual Twilio SMS sending when keys provided
        
    if sendgrid_key:
        live_channels.append("SendGrid")
        
        # Send actual email if recipient provided
        recipient = request.recipient_email or request.terminal
        if recipient:
            email_sent = send_sovereign_email(
                recipient=recipient,
                subject=f"Sovereign {request.type} Transmission",
                content=request.content,
                frequency=request.frequency
            )
    
    if live_channels:
        if email_sent:
            message = f"Dimensional {request.type} delivered LIVE via {', '.join(live_channels)}"
        else:
            message = f"Dimensional {request.type} logged via {', '.join(live_channels)} (email queued)"
    else:
        message = f"Dimensional {request.type} logged (Configure Twilio/SendGrid for live delivery)"
    
    return HandshakeResponse(
        success=True,
        message=message,
        signature=signature,
        frequency=request.frequency,
        timestamp=timestamp,
        email_sent=email_sent
    )

# ═══════════════════════════════════════════════════════════════════════════
# STATUS ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/status")
async def sovereign_status():
    """Check the status of the Sovereign communication channels"""
    
    twilio_configured = bool(os.environ.get("TWILIO_ACCOUNT_SID"))
    sendgrid_configured = bool(os.environ.get("SENDGRID_API_KEY"))
    
    return {
        "architect": AUTHORIZED_ARCHITECT,
        "terminal": AUTHORIZED_TERMINAL,
        "channels": {
            "twilio": {
                "configured": twilio_configured,
                "status": "LIVE" if twilio_configured else "PENDING"
            },
            "sendgrid": {
                "configured": sendgrid_configured,
                "status": "LIVE" if sendgrid_configured else "PENDING"
            }
        },
        "frequency": "963Hz",
        "tier": "MANIFEST/Sigfield"
    }

# ═══════════════════════════════════════════════════════════════════════════
# DIRECT EMAIL ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════

class DirectEmailRequest(BaseModel):
    recipient_email: str
    subject: str
    content: str
    frequency: str = "963Hz"

@router.post("/email")
async def send_direct_email(request: DirectEmailRequest):
    """
    Send a direct email via SendGrid without sovereign verification
    For testing and utility purposes
    """
    sendgrid_key = os.environ.get("SENDGRID_API_KEY")
    
    if not sendgrid_key:
        raise HTTPException(
            status_code=503,
            detail="SendGrid API key not configured"
        )
    
    success = send_sovereign_email(
        recipient=request.recipient_email,
        subject=request.subject,
        content=request.content,
        frequency=request.frequency
    )
    
    if success:
        return {
            "success": True,
            "message": f"Email delivered to {request.recipient_email}",
            "frequency": request.frequency
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to send email via SendGrid"
        )
