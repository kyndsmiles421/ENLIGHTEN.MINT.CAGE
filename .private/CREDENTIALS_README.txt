enlighten.mint.cafe — Upload Key Credentials (PRIVATE)
═══════════════════════════════════════════════════════
Keystore alias:    enlightenmintcafe
Keystore password: Sovereign2026!
Key password:      Sovereign2026!
Keystore file:     /app/.private/enlighten-mint-cafe-UPLOAD-KEY.keystore

⚠ SECURITY NOTICE — V1.2.6
This file replaces the publicly-leaked credentials previously embedded
in /app/build_artifacts/BUILD_INFO.md and /app/frontend/public/launch.html.

URGENT FOLLOW-UP REQUIRED FOR THE ARCHITECT:
1. Treat the password "Sovereign2026!" as COMPROMISED (it was on a public
   page and Google may have indexed it). It is also your auth password.
2. Rotate your enlighten.mint.cafe account password immediately.
3. For the Play Store keystore: this exact key cannot be rotated without
   re-uploading the app under a new package, BUT Google Play App Signing
   lets you upload an upload-key replacement. Open Play Console →
   Setup → App signing → "Request upload key reset" and follow the
   on-screen wizard. Email https://support.google.com/googleplay/android-developer/contact/upload_key
4. Backup THIS file to 1Password / encrypted drive, then delete the
   plaintext copy from /app/.private if you don't trust the dev container.
═══════════════════════════════════════════════════════
