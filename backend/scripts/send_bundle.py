"""Email the Play Store cover bundle via the unified mailer (Resend→SendGrid fallback)."""
import os, sys
from datetime import datetime, timezone

# Ensure we can import from /app/backend
sys.path.insert(0, "/app/backend")
from utils.resend_mailer import send_email_sync, MailAttachment, provider_status  # noqa: E402

OUT  = "/app/frontend/public/store-assets"
TO   = os.environ.get("BUNDLE_TO", "kyndsmiles@gmail.com")

BACKEND = ""
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL"):
                BACKEND = line.split("=", 1)[1].strip()
                break
except Exception:
    pass

files = [
    "feature-graphic-1024x500.png",
    "app-icon-512.png",
    "app-icon-1024.png",
    "og-cover-1200x630.png",
    "playstore-1-hub.png",
    "playstore-2-observatory.png",
    "playstore-3-lattice.png",
    "enlighten-mint-cafe-covers.zip",
]
attachments = []
for f in files:
    p = os.path.join(OUT, f)
    if not os.path.exists(p):
        print(f"  skip (missing): {f}")
        continue
    attachments.append(MailAttachment(filename=f, path=p))

now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
subject = "ENLIGHTEN.MINT.CAFE — Play Store Cover Bundle"

# Inline-CSS HTML that renders well in Gmail / Apple Mail / Outlook
html = f"""
<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:0;background:#050210;font-family:Georgia,serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#050210">
  <tr><td align="center" style="padding:32px 16px">
    <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px;background:#0a0514;border-radius:16px;color:#f5f0e6">
      <tr><td style="padding:32px;text-align:center;border-bottom:1px solid rgba(240,196,112,0.25)">
        <h1 style="color:#F0C470;letter-spacing:1px;margin:0 0 6px 0;font-size:28px">ENLIGHTEN.MINT.CAFE</h1>
        <p style="color:#FFB450;margin:0;font-size:12px;letter-spacing:2px">THE SOVEREIGN UNIFIED ENGINE</p>
        <p style="color:#FFB450;margin:4px 0 0 0;font-size:10px;letter-spacing:1px">by INFINITY SOVEREIGN</p>
      </td></tr>

      <tr><td style="padding:28px 32px">
        <p style="font-size:15px;line-height:1.6;color:rgba(245,240,230,0.85);margin:0 0 20px">
          Attached is the complete Google Play Store cover bundle, regenerated <b style="color:#F0C470">{now}</b>.
        </p>
        <table role="presentation" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;color:rgba(245,240,230,0.85)">
          <tr style="border-bottom:1px solid #222"><td><b style="color:#F0C470">feature-graphic-1024x500.png</b></td><td style="color:#bbb">Play Store hero banner</td></tr>
          <tr style="border-bottom:1px solid #222"><td><b style="color:#F0C470">app-icon-512.png / 1024.png</b></td><td style="color:#bbb">Store icons (hi-res + master)</td></tr>
          <tr style="border-bottom:1px solid #222"><td><b style="color:#F0C470">og-cover-1200x630.png</b></td><td style="color:#bbb">WhatsApp · X · LinkedIn preview</td></tr>
          <tr style="border-bottom:1px solid #222"><td><b style="color:#F0C470">playstore-1-hub.png</b></td><td style="color:#bbb">176+ Sovereign Nodules frame</td></tr>
          <tr style="border-bottom:1px solid #222"><td><b style="color:#F0C470">playstore-2-observatory.png</b></td><td style="color:#bbb">Meditative Immersion frame</td></tr>
          <tr style="border-bottom:1px solid #222"><td><b style="color:#F0C470">playstore-3-lattice.png</b></td><td style="color:#bbb">9×9 Crystalline Lattice frame</td></tr>
          <tr><td><b style="color:#F0C470">enlighten-mint-cafe-covers.zip</b></td><td style="color:#bbb">Full bundle + build scripts</td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 32px;border-top:1px solid rgba(240,196,112,0.25);border-bottom:1px solid rgba(240,196,112,0.25)">
        <h3 style="color:#F0C470;margin:0 0 10px 0;font-size:14px">Master Regeneration Command</h3>
        <p style="margin:0 0 8px 0;font-size:12px;color:#bbb">Any time you tweak branding, re-run everything with one line:</p>
        <pre style="background:#1a0f2a;color:#F0C470;padding:12px 16px;border-radius:6px;font-family:'Courier New',monospace;font-size:12px;margin:0;overflow-x:auto">node /app/backend/scripts/master_print.js --mail={TO}</pre>
      </td></tr>

      <tr><td style="padding:20px 32px">
        <h3 style="color:#F0C470;margin:0 0 10px 0;font-size:14px">Live URLs</h3>
        <ul style="font-size:12px;line-height:1.8;padding-left:20px;color:#bbb;margin:0">
          <li><a style="color:#F0C470" href="{BACKEND}/store-assets/feature-graphic-1024x500.png">feature-graphic-1024x500.png</a></li>
          <li><a style="color:#F0C470" href="{BACKEND}/store-assets/og-cover-1200x630.png">og-cover-1200x630.png</a></li>
          <li><a style="color:#F0C470" href="{BACKEND}/store-assets/playstore-1-hub.png">playstore-1-hub.png</a></li>
          <li><a style="color:#F0C470" href="{BACKEND}/store-assets/playstore-2-observatory.png">playstore-2-observatory.png</a></li>
          <li><a style="color:#F0C470" href="{BACKEND}/store-assets/playstore-3-lattice.png">playstore-3-lattice.png</a></li>
          <li><a style="color:#F0C470" href="{BACKEND}/store-assets/enlighten-mint-cafe-covers.zip">enlighten-mint-cafe-covers.zip</a></li>
        </ul>
      </td></tr>

      <tr><td style="text-align:center;padding:20px 32px 32px;border-top:1px solid rgba(240,196,112,0.15);color:#666;font-size:10px;letter-spacing:1px">
        Sovereign PWA · 176+ Nodules · 9×9 Crystalline Lattice
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""

print(f"Provider status: {provider_status()}")
print(f"Attachments    : {len(attachments)}")
print(f"Recipient      : {TO}")
print("Sending...")
result = send_email_sync(to=TO, subject=subject, html=html, attachments=attachments)
if result.ok:
    print(f"✓ SENT via {result.provider}  id={result.message_id}")
else:
    print(f"✗ FAILED via {result.provider}: {result.error}")
    sys.exit(1)
