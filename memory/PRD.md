# ENLIGHTEN.MINT.CAFE — DEPLOYMENT MANIFEST
## Version: V30.4 | Status: PLAY STORE READY
## Last Verified: April 13, 2026

### SYSTEM CHECK: ALL PASS
- 40 navigation buttons on Sovereign Hub — all functional, zero overlaps
- 4 action buttons (Purpose Statement, Creator Mixer, Circular Protocol, Academy) — all open modals
- 5 top bar items: Vault, Broadcast, Journal, Ledger, Sever (hidden on Hub per design)
- 5 bottom nav items: Hub, Trade, Oracle, Discover, Mixer (hidden on Hub per design)
- Zero ghost elements (SmartDock return null, PerspectiveToggle purged, STOP at 0.08)
- Zero sensitive data leaking (scrubbed from all components + utils)
- Legacy toolbars hidden on /sovereign-hub via isHubRoute

### PWA COMPLIANCE: ALL PASS
- manifest.json: name, short_name, start_url(/sovereign-hub), display(standalone), 9 icons, 2 maskable
- Service Worker: fetch handler, offline support, background sync, push notifications
- Offline page: offline.html with reconnect button
- Icons: 48, 96, 144, 180, 192, 512 + maskable 192/512
- assetlinks.json: configured with signing key SHA256
- Production build: /app/frontend/build/

### PLAY STORE DEPLOYMENT ARTIFACTS
- Signing keystore: /app/twa/enlighten.keystore (alias: enlighten-key, pass: enlighten2026)
- SHA256: 3E:3A:69:90:70:14:4B:6C:B9:11:23:AE:11:3C:4B:C7:6F:DF:0C:C5:E2:71:CF:36:B8:59:D2:3F:D7:85:77:E2
- TWA manifest: /app/twa/build/twa-manifest.json
- AAB generator script: /app/twa/generate-aab.sh
- Full deployment guide: /app/twa/PLAY_STORE_GUIDE.md
- Package ID: cafe.enlighten.mint

### 7 PILLARS (Color Coded)
- PRACTICE (purple): Breathwork, Meditation, Yoga, Mudras, Mantras, Light Therapy
- DIVINATION (pink): Oracle & Tarot, Akashic Records, Star Chart, Numerology, Dream Journal, Mayan Astrology
- SANCTUARY (teal): Zen Garden, Soundscapes, Music Lounge, Frequencies, VR Sanctuary, Journaling
- NOURISH & HEAL (green): Nourishment, Aromatherapy, Herbology, Elixirs, Acupressure, Reiki
- EXPLORE (orange): Encyclopedia, Reading List, Creation Stories, Teachings, Community, Blessings
- SAGE AI COACH (blue): Voice Conversations, Spiritual Guidance, Crystals & Stones, Personalized Wisdom
- SOVEREIGN COUNCIL (purple): Council Advisors, Economy & Dust, Academy, Trade Circle, Crystal Skins, Archives

### ECONOMY
- 10 Fans/hr | 15 modules wired for silent dust | Fibonacci accrual | Phi Cap 1.618

### BUGS FIXED (V30.4)
- P0: Sovereign Hub click-blocking — /sovereign-hub added to isHubRoute
- P1: Sensitive data scrubbed from all DOM-renderable components (20+ files)
- P1: CharacterSelect undefined.map crash — safe navigation added
- P1: GravityWellExchange empty market — defensive empty state

### BACKLOG
- Complete Google Play Console identity verification → upload AAB
- Sovereign "Live" Sessions with Sage AI (P2)
- Phygital Marketplace NFC expansion (P2)
- Refactor SovereignHub.js — extract dead components
