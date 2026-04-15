# ENLIGHTEN.MINT.CAFE — V48.2 AUTH FIX
## Last Verified: April 15, 2026

### V48.2: Authentication Fix + Password Reset
- **FIXED: kyndsmiles@gmail.com login** — Account re-created after environment reset, bcrypt hash verified
- **NEW: Password Reset flow** — `POST /api/auth/reset-password` + frontend "Forgot password?" link
  - Reset Password screen with email + new password fields
  - Auto-returns to login with password pre-filled after reset
  - "Remember your password? Welcome back" link
- **FIXED: Herbology search spinner** (V48.1) — Interceptor deny-list approach
- **FIXED: Breathing footer overlap** (V48.1) — Compacted to 11px

### V48.0-V48.1: Share Cards, Sovereign Live, Console Decomp, Bug Fixes
### V47.0: AI Scene Generator (Nano Banana)
### V46.0: Atmosphere Journal
### V45.0: Sage AI + Resonance Names
### V44.0: Chromatic Resonance
### V43.1-V42.0: Unified Field + Realm Skins

### 3rd Party Integrations
- Gemini Flash + Nano Banana, Web Audio API, FastAPI WebSocket

### Blocked: Play Store AAB (Google identity verification)
### Next: Frontend Sovereign Circle UI, Live Session host controls
