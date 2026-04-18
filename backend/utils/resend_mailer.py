"""
Unified outbound mail gateway for ENLIGHTEN.MINT.CAFE.

Order of preference:
    1. RESEND_API_KEY set            → Resend (preferred)
    2. Otherwise SENDGRID_API_KEY set → SendGrid (legacy fallback)
    3. Otherwise the send() call is a no-op that returns a disabled stub
       (useful in pod/preview environments without outbound credentials).

The module is sync on the inside (both SDKs are sync) but exposes an async
wrapper for FastAPI call sites.  Plain Python scripts (master_print.js → spawn
python3) can call `send_email_sync()` directly.

No external state.  No module-level I/O.  Safe to import everywhere.
"""
from __future__ import annotations

import asyncio
import base64
import logging
import mimetypes
import os
from dataclasses import dataclass
from typing import Iterable, Optional

# Ensure backend/.env is always loaded when this module is used from a script
try:
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
except Exception:
    pass

logger = logging.getLogger("resend_mailer")

RESEND_API_KEY      = os.environ.get("RESEND_API_KEY")
RESEND_FROM_EMAIL   = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev")
SENDGRID_API_KEY    = os.environ.get("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.environ.get("SENDGRID_FROM_EMAIL", "kyndsmiles@gmail.com")


# ─── Attachment helper ────────────────────────────────────────────────
@dataclass
class MailAttachment:
    """A file to be attached. Provide either `path` (local file) or `content_bytes`."""
    filename: str
    path: Optional[str] = None
    content_bytes: Optional[bytes] = None
    content_type: Optional[str] = None

    def _load(self) -> bytes:
        if self.content_bytes is not None:
            return self.content_bytes
        if self.path and os.path.exists(self.path):
            with open(self.path, "rb") as fh:
                return fh.read()
        raise FileNotFoundError(f"attachment not found: {self.filename}")

    def as_resend(self) -> dict:
        return {
            "filename": self.filename,
            "content": list(self._load()),  # Resend expects list[int] or base64 str
        }

    def as_sendgrid(self):
        from sendgrid.helpers.mail import (Attachment, FileContent, FileName,
                                           FileType, Disposition)
        a = Attachment()
        a.file_content = FileContent(base64.b64encode(self._load()).decode())
        a.file_name    = FileName(self.filename)
        a.file_type    = FileType(
            self.content_type or mimetypes.guess_type(self.filename)[0]
            or "application/octet-stream"
        )
        a.disposition = Disposition("attachment")
        return a


# ─── Public result type ──────────────────────────────────────────────
@dataclass
class SendResult:
    ok: bool
    provider: str              # "resend" | "sendgrid" | "disabled"
    message_id: Optional[str]  # provider message id
    error: Optional[str] = None


# ─── Resend provider ─────────────────────────────────────────────────
def _send_via_resend(
    to: str, subject: str, html: str,
    attachments: Iterable[MailAttachment],
) -> SendResult:
    import resend
    resend.api_key = RESEND_API_KEY
    params = {
        "from": RESEND_FROM_EMAIL,
        "to": [to] if isinstance(to, str) else list(to),
        "subject": subject,
        "html": html,
    }
    atts = [a.as_resend() for a in attachments]
    if atts:
        params["attachments"] = atts
    try:
        resp = resend.Emails.send(params)
        mid = resp.get("id") if isinstance(resp, dict) else getattr(resp, "id", None)
        logger.info(f"mailer: resend → {to}  id={mid}  atts={len(atts)}")
        return SendResult(ok=True, provider="resend", message_id=mid)
    except Exception as e:
        logger.warning(f"mailer: resend FAILED → {to}: {e}")
        return SendResult(ok=False, provider="resend", message_id=None, error=str(e))


# ─── SendGrid fallback ───────────────────────────────────────────────
def _send_via_sendgrid(
    to: str, subject: str, html: str,
    attachments: Iterable[MailAttachment],
) -> SendResult:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    msg = Mail(from_email=SENDGRID_FROM_EMAIL, to_emails=to,
               subject=subject, html_content=html)
    atts = [a.as_sendgrid() for a in attachments]
    if atts:
        msg.attachment = atts
    try:
        resp = SendGridAPIClient(SENDGRID_API_KEY).send(msg)
        mid = resp.headers.get("X-Message-Id") if hasattr(resp, "headers") else None
        logger.info(f"mailer: sendgrid → {to}  status={resp.status_code}  id={mid}")
        return SendResult(ok=True, provider="sendgrid", message_id=mid)
    except Exception as e:
        logger.warning(f"mailer: sendgrid FAILED → {to}: {e}")
        return SendResult(ok=False, provider="sendgrid", message_id=None, error=str(e))


# ─── Public API ──────────────────────────────────────────────────────
def send_email_sync(
    to: str, subject: str, html: str,
    attachments: Optional[Iterable[MailAttachment]] = None,
) -> SendResult:
    """Blocking send. Call from scripts / CLI tools."""
    attachments = list(attachments or [])
    if RESEND_API_KEY:
        r = _send_via_resend(to, subject, html, attachments)
        if r.ok or not SENDGRID_API_KEY:
            return r
        # Resend failed — fall through to SendGrid as a last resort
        logger.info("mailer: falling back to SendGrid after Resend error")
    if SENDGRID_API_KEY:
        return _send_via_sendgrid(to, subject, html, attachments)
    logger.warning("mailer: no provider configured — email not sent")
    return SendResult(ok=False, provider="disabled", message_id=None,
                      error="Neither RESEND_API_KEY nor SENDGRID_API_KEY is set")


async def send_email(
    to: str, subject: str, html: str,
    attachments: Optional[Iterable[MailAttachment]] = None,
) -> SendResult:
    """Non-blocking async wrapper for FastAPI routes."""
    return await asyncio.to_thread(send_email_sync, to, subject, html, attachments)


def provider_status() -> dict:
    """Introspection helper for debug endpoints."""
    return {
        "resend_configured": bool(RESEND_API_KEY),
        "sendgrid_configured": bool(SENDGRID_API_KEY),
        "active_provider": (
            "resend" if RESEND_API_KEY
            else "sendgrid" if SENDGRID_API_KEY
            else "disabled"
        ),
        "resend_from": RESEND_FROM_EMAIL if RESEND_API_KEY else None,
        "sendgrid_from": SENDGRID_FROM_EMAIL if SENDGRID_API_KEY else None,
    }
