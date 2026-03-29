# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js + WebRTC
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key)
- **Mobile**: Capacitor (iOS + Android configs)

## Launch Status: COMPLETE (Iteration 103 — 100% pass rate)

### All Verified Features (37+)
1. SmartDock — Minimize, drag, snap zones, persist
2. Cosmic Mood Ring — Interactive quick log, 8 moods
3. Session Replay & Download — Auto-recording, Past Sessions tab
4. Recurring Live Sessions — Subscribe, push notifications, auto-spawn
5. Live Sessions — WebSocket, avatars, guided commands, 8 types, 6 scenes
6. **Zoom-Like Video Calling — WebRTC P2P, camera/mic toggles for ALL users, responsive video grid (1-4 columns), 3 host video modes (Everyone/Host Only/Off)**
7. **Screen Sharing — Share Screen button, featured tile (55% height) with SCREEN SHARE badge and sharer name, single-sharer lock, auto-stop when user closes browser share dialog**
8. AI-Generated Meditation Audio — TTS with 7 voice options, download MP3
9. Real-time Live Feed on Creator Dashboard (auto-refresh 5s)
10. Creator Dashboard — 7 interactive tabs, broadcast, user management
11. Mood Insights, Crystal Pairing, Blessings
12. Trade Circle, Stripe Subscriptions (5 tiers)
13. Sacred Texts (15), Encyclopedia (12 traditions)
14. Music Lounge, Cosmic Mixer, Frequencies (binaural beats)
15. Soundscapes, Crystals (13), Avatar Creator, VR Modes
16. Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
17. Profile, Settings, Split Screen, PWA, Capacitor scaffolding

### Video Calling Architecture
- **Signaling**: WebSocket relays rtc_offer/answer/ice_candidate + camera_toggle + screen_share
- **Topology**: Mesh (P2P, optimal for 2-8 participants)
- **Host Controls**: Video Mode dropdown — Everyone | Host Only | Video Off
- **Screen Share**: getDisplayMedia, featured tile at top, SCREEN SHARE badge, single-sharer limit
- **Layout**: Responsive video grid (1-4 cols), avatar circle fallback when no cameras

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

## Post-Launch
- Capacitor: `npx cap add android && npx cap add ios` after `yarn build`
- SFU for larger group calls (10+ participants)
