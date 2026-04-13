# ENLIGHTEN.MINT.CAFE — DEPLOYMENT MANIFEST
## Version: V30.5 | Status: PLAY STORE READY — ALL GHOSTS PURGED
## Last Verified: April 13, 2026

### SYSTEM CHECK: ALL PASS
- 40 nav buttons on Sovereign Hub — all functional
- ALL sub-pages (Academy, Breathing, Oracle, Mantras, etc.) — zero ghost blockers
- Page content properly clears 60px fixed top bar (padding-top: 64px)
- Top bar: Vault, Broadcast, Journal, Ledger, Sever
- Bottom bar: Hub, Trade, Oracle, Discover, Mixer

### V30.5 GHOST PURGE LOG
- ShambhalaFrontSide (white 66px circle, z-index 2B) — REMOVED from App.js
- ShambhalaToolbar (z-index 2B) — REMOVED from App.js
- Navigation mobile bar (z-50, overlapping sovereign bar) — DISABLED
- vault-access dead pixel (z-999999) — pointer-events:none, z:-1
- Content padding fixed: padding-top 0→64px to clear fixed top bar

### PWA COMPLIANCE: ALL PASS
- manifest.json: 9 icons, 2 maskable, start_url /sovereign-hub, standalone
- Service Worker with offline + background sync + push
- assetlinks.json configured with signing key SHA256
- Production build at /app/frontend/build/

### PLAY STORE
- Keystore: /app/twa/enlighten.keystore
- Guide: /app/twa/PLAY_STORE_GUIDE.md
- Package: cafe.enlighten.mint
- Generate AAB: https://www.pwabuilder.com

### ECONOMY
- 10 Fans/hr | 15 modules silent dust | Fibonacci | Phi Cap 1.618

### BACKLOG
- Google Play Console identity verification → upload AAB
- Sovereign "Live" Sessions with Sage AI (P2)
- Phygital Marketplace NFC expansion (P2)
