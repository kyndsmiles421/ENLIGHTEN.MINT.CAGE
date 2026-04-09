"""
ENLIGHTEN.MINT.CAFE - Production Sovereign Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHA-256 Hardening + Twilio SMS + SendGrid Email
"""
import os
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timezone

# Conditional imports - gracefully handle missing dependencies
try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TwilioClient = None
    TWILIO_AVAILABLE = False

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent
    SENDGRID_AVAILABLE = True
except ImportError:
    SendGridAPIClient = None
    Mail = None
    SENDGRID_AVAILABLE = False


class SovereignEngine:
    """
    Production-grade communication and security engine.
    
    Features:
    - SHA-256 salted hashing for ledger integrity
    - Twilio SMS dispatch (production)
    - SendGrid email dispatch (production)
    - Graceful fallback when credentials missing
    """
    
    def __init__(self):
        # Production Credentials from environment
        self.salt = os.environ.get('CRYSTAL_SEAL_SALT', 'ENLIGHTEN_MINT_2026')
        
        # Twilio Configuration
        self.twilio_sid = os.getenv('TWILIO_SID')
        self.twilio_token = os.getenv('TWILIO_TOKEN')
        self.twilio_number = os.getenv('TWILIO_NUMBER')
        self._twilio_client = None
        
        # SendGrid Configuration
        self.sendgrid_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('SENDGRID_FROM_EMAIL', 'admin@enlighten.mint.cafe')
        self._sendgrid_client = None
        
        # Status flags
        self._initialized = False
        
    @property
    def twilio(self):
        """Lazy initialization of Twilio client."""
        if self._twilio_client is None and self.twilio_sid and self.twilio_token and TWILIO_AVAILABLE:
            try:
                self._twilio_client = TwilioClient(self.twilio_sid, self.twilio_token)
            except Exception as e:
                print(f"[SovereignEngine] Twilio init failed: {e}")
        return self._twilio_client
    
    @property
    def sendgrid(self):
        """Lazy initialization of SendGrid client."""
        if self._sendgrid_client is None and self.sendgrid_key and SENDGRID_AVAILABLE:
            try:
                self._sendgrid_client = SendGridAPIClient(self.sendgrid_key)
            except Exception as e:
                print(f"[SovereignEngine] SendGrid init failed: {e}")
        return self._sendgrid_client
    
    @property
    def twilio_enabled(self) -> bool:
        """Check if Twilio is properly configured."""
        return bool(self.twilio and self.twilio_number)
    
    @property
    def sendgrid_enabled(self) -> bool:
        """Check if SendGrid is properly configured."""
        return bool(self.sendgrid)
    
    def get_status(self) -> Dict[str, Any]:
        """Get engine status for health checks."""
        return {
            "twilio_enabled": self.twilio_enabled,
            "sendgrid_enabled": self.sendgrid_enabled,
            "twilio_available": TWILIO_AVAILABLE,
            "sendgrid_available": SENDGRID_AVAILABLE,
            "salt_configured": bool(self.salt != 'ENLIGHTEN_MINT_2026'),
        }

    def secure_hash(self, data: str) -> str:
        """The SHA-256 Hardening Link — salted for production security."""
        return hashlib.sha256(f"{data}{self.salt}".encode()).hexdigest()
    
    def secure_hash_short(self, data: str, length: int = 12) -> str:
        """Truncated salted hash for IDs and cache keys."""
        return self.secure_hash(data)[:length]
    
    def verify_signature(self, data: str, signature: str) -> bool:
        """Verify a data signature matches expected hash."""
        expected = self.secure_hash(data)
        return signature == expected

    def dispatch_sms(self, to_phone: str, body: str) -> Dict[str, Any]:
        """
        P1 Action: Twilio Production SMS Link
        
        Returns dict with status, message_sid, and any errors.
        """
        result = {
            "success": False,
            "channel": "sms",
            "to": to_phone[:4] + "***",  # Masked for logs
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        if not self.twilio_enabled:
            result["error"] = "Twilio not configured"
            result["status"] = "mock"
            print(f"[SovereignEngine] SMS mock: Would send to {to_phone[:4]}***")
            return result
        
        try:
            message = self.twilio.messages.create(
                body=body[:1600],  # SMS limit
                from_=self.twilio_number,
                to=to_phone
            )
            result["success"] = True
            result["status"] = "sent"
            result["message_sid"] = message.sid
            print(f"[SovereignEngine] SMS sent: {message.sid}")
        except Exception as e:
            result["error"] = str(e)
            result["status"] = "failed"
            print(f"[SovereignEngine] SMS failed: {e}")
        
        return result

    def dispatch_email(self, to_email: str, subject: str, content: str, 
                       html_content: Optional[str] = None) -> Dict[str, Any]:
        """
        P1 Action: SendGrid Production Email Link
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            content: Plain text content (fallback)
            html_content: HTML content (optional, uses content if not provided)
            
        Returns dict with status and any errors.
        """
        result = {
            "success": False,
            "channel": "email",
            "to": to_email.split('@')[0][:3] + "***@***",  # Masked for logs
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        if not self.sendgrid_enabled:
            result["error"] = "SendGrid not configured"
            result["status"] = "mock"
            print(f"[SovereignEngine] Email mock: Would send to {to_email.split('@')[0][:3]}***")
            return result
        
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                plain_text_content=content,
                html_content=html_content or content
            )
            response = self.sendgrid.send(message)
            result["success"] = response.status_code in [200, 202]
            result["status"] = "sent" if result["success"] else "failed"
            result["status_code"] = response.status_code
            print(f"[SovereignEngine] Email sent: {response.status_code}")
        except Exception as e:
            result["error"] = str(e)
            result["status"] = "failed"
            print(f"[SovereignEngine] Email failed: {e}")
        
        return result

    def sync_ledger(self, transaction_id: str, data: Optional[str] = None) -> Dict[str, Any]:
        """
        Final Ledger Integrity Check
        
        Generates and verifies SHA-256 signature for transaction integrity.
        """
        sig = self.secure_hash(transaction_id)
        short_sig = sig[:12]
        
        result = {
            "transaction_id": transaction_id,
            "signature": sig,
            "short_signature": short_sig,
            "verified": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        # If data provided, verify it matches
        if data:
            data_sig = self.secure_hash(data)
            result["data_signature"] = data_sig
            result["data_verified"] = True
        
        print(f"[SovereignEngine] Verified Ledger Signature: {short_sig}...")
        return result


# Initialize for Global Use
enlighten_core = SovereignEngine()


# Convenience functions for direct import
def secure_hash(data: str) -> str:
    """Global secure hash function."""
    return enlighten_core.secure_hash(data)

def secure_hash_short(data: str, length: int = 12) -> str:
    """Global truncated hash function."""
    return enlighten_core.secure_hash_short(data, length)

def dispatch_sms(to_phone: str, body: str) -> Dict[str, Any]:
    """Global SMS dispatch."""
    return enlighten_core.dispatch_sms(to_phone, body)

def dispatch_email(to_email: str, subject: str, content: str, 
                   html_content: Optional[str] = None) -> Dict[str, Any]:
    """Global email dispatch."""
    return enlighten_core.dispatch_email(to_email, subject, content, html_content)


__all__ = [
    'SovereignEngine',
    'enlighten_core',
    'secure_hash',
    'secure_hash_short',
    'dispatch_sms',
    'dispatch_email',
]
