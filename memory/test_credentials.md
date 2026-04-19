# Test Credentials — ENLIGHTEN.MINT.CAFE

## 👑 Owner / Creator Account
- **Email:** kyndsmiles@gmail.com
- **Password:** Sovereign2026!
- **Role:** creator (auto-elevated to admin on every login)
- **Capabilities:**
  - Bypasses ALL TierGates (Evolution Lab, Celestial Dome, etc.)
  - No credit/trial/upgrade nudges ever shown
  - 999,999 credits · 99,999 Sparks · +10,000 Dust · all 6 Gaming Cards pre-unlocked
  - Full Creator Console + Invite code generator access

## 🧪 Standard Test User
- **Email:** test_v29_user@test.com
- **Password:** testpass123

## 📚 Guest Access
All public content (workshops, materials, tools, meditation, mudras, crystals) open to guests — no auth required.

## Notes
- Backend auth field is `password` (bcrypt-hashed), not `password_hash` — don't mix them.
- CREATOR_EMAIL is hardcoded in `/app/backend/routes/auth.py` line 57. Changing the owner email requires a backend edit.
- **Owner account self-seeds on server startup** via `/app/backend/utils/owner_seed.py`. Password defaults to `Sovereign2026!` unless `OWNER_SEED_PASSWORD` env var is set. Idempotent — re-verifies existing account, creates if missing. This means every fresh deploy (prod Atlas, sandbox, etc.) will have the owner account ready on first backend startup.
