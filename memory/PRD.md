# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js + WebRTC
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key)
- **Mobile**: Capacitor (iOS + Android configs)

## Launch Status: COMPLETE (Iteration 102 — 100% pass rate)

### All Verified Features (36+)
1. SmartDock — Minimize, drag, snap zones, persist
2. Cosmic Mood Ring — Interactive quick log, 8 moods
3. Session Replay & Download — Auto-recording, Past Sessions tab
4. Recurring Live Sessions — Subscribe, push notifications, auto-spawn
5. Live Sessions — WebSocket, avatars, guided commands, 8 types, 6 scenes
6. **Zoom-Like Video Calling — WebRTC peer-to-peer, camera/mic toggles for ALL users, responsive video grid, 3 host video modes (Everyone/Host Only/Off), bottom Zoom-style controls bar, STUN-based ICE negotiation**
7. Mood Insights — AI weekly summary, stats, charts
8. Crystal Pairing — AI matching, share
9. Blessings — Send/receive, push notifications
10. Creator Dashboard — 7 interactive tabs, real-time live feed, broadcast, user management
11. Customizable Dashboard — Drag-and-drop with Rearrange toggle
12. Trade Circle — Barter marketplace
13. Stripe Subscriptions — 5 tiers
14. Sacred Texts — 15 texts, AI narration
15. Encyclopedia — 12 traditions
16. Music Lounge — 10 synthesized tracks
17. Cosmic Mixer — 4-layer mixing
18. Frequencies — Binaural beats for sub-20Hz
19. Soundscapes, Crystals, Avatar Creator, VR Modes
20. Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
21. AI-Generated Meditation Audio — TTS with 7 voice options
22. Live Session Audio Recording — Host record, auto-upload, replay
23. Profile, Settings, Split Screen, PWA, Capacitor scaffolding

### Video Calling Architecture
- **Signaling**: WebSocket relays `rtc_offer`, `rtc_answer`, `ice_candidate` messages between peers
- **Topology**: Mesh (peer-to-peer, optimal for 2-8 participants)
- **Host Controls**: Video Mode dropdown with 3 options
  - **Everyone**: All participants can toggle camera/mic
  - **Host Only**: Only host can share video
  - **Video Off**: No cameras allowed
- **UI**: Responsive video grid (1-4 columns based on count), avatar circle fallback when no cameras active

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

## Post-Launch
- Capacitor: `npx cap add android && npx cap add ios` after `yarn build`
- SFU for larger group calls (10+ participants)
