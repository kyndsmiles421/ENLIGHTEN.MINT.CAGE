# ENLIGHTEN.MINT.CAFE — V48.1 AIRTIGHT SHIP
## Last Verified: April 15, 2026

### V48.1: Critical Bug Fixes + Full App Sweep
- **FIXED: Herbology search infinite spinner** — Axios interceptor was too aggressive, aborting ALL guest requests to non-whitelisted endpoints. Switched to deny-list approach: only gate user-specific endpoints (wallet, treasury, classes, etc.), let all content endpoints through.
- **FIXED: Breathing page footer overlapping mixer nav** — Compacted compliance footer from multi-line to single-line (11px), no longer pushes navigation off-screen on mobile.
- **Full app sweep verified**: All 10+ content pages load correctly for guest users on mobile viewport.

### V48.0: Share Cards + Sovereign Live Sessions + Console Decomposition
- Share Card Generator: Canvas 1080x1920 with real SHA-256 Crystal Seal
- Sovereign Live Sessions: WebSocket rooms, Rapid City default node
- Console Decomposition: ConsoleConstants.js + CelestialTorus.js extracted

### V47.0: AI Scene Generator (Nano Banana)
- Blend 2+ colors → Generate AI Scene → unique immersive background

### V46.0: Atmosphere Journal
- Collectible gallery with CRUD, aesthetic cards, one-tap re-apply, share

### V45.0: Sage AI + Resonance Names
- LLM atmosphere generation (Gemini Flash) + phi-seeded 3-style naming

### V44.0: Chromatic Resonance
- Multi-color blending (up to 3), Web Audio API (256Hz-480Hz)

### V43.1: Unified Field Transition Engine
### V42.0: Realm Skin Engine (28 skins, 58 modules)

### 3rd Party Integrations
- Gemini Flash (gemini-2.5-flash) — Sage FX
- Gemini Nano Banana (gemini-3.1-flash-image-preview) — Scene gen
- Web Audio API — Chromotherapy frequencies
- FastAPI WebSocket — Sovereign Live Sessions

### Blocked: Play Store AAB (Google identity verification)
### Next: Frontend Sovereign Circle UI, Live Session host controls
