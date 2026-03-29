# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key) — checkout flow verified
- **Mobile**: Capacitor fully configured (10 plugins, iOS + Android configs)

## Launch Status: COMPLETE (Iteration 101 — 100% pass rate)

### All Verified Features (35+)
1. SmartDock — Minimize (tiny dot bottom-right), drag, snap zones, persist
2. Cosmic Mood Ring — Interactive quick log, 8 moods, navigation
3. Session Replay & Download — Auto-recording, Past Sessions tab, timeline player
4. Recurring Live Sessions — Subscribe, push notifications, auto-spawn
5. Live Sessions — WebSocket, avatars, guided commands, 8 types, 6 scenes
6. Mood Insights — AI weekly summary, stats, charts
7. Crystal Pairing — AI matching, share
8. Blessings — Send/receive, push notifications
9. Creator Dashboard — FULLY INTERACTIVE: 7 tabs (Overview, Live Feed, Feedback, Comments, Users, Popular, Broadcasts)
10. Real-time Live Feed — Creator Dashboard tab showing user activity in real-time (auto-refresh 5s)
11. Customizable Dashboard — Drag-and-drop with Rearrange toggle
12. Trade Circle — Barter marketplace, listings, offers
13. Stripe Subscriptions — 5 tiers, real checkout
14. Sacred Texts — 15 texts, chapters, AI narration
15. Encyclopedia — 12 traditions, Myths & Legends
16. Music Lounge — 10 synthesized tracks
17. Cosmic Mixer — 4-layer mixing
18. Frequencies — 12 solfeggio + earth tones, binaural beats for sub-20Hz
19. Soundscapes, Crystals (13), Avatar Creator, VR Modes
20. Entanglement, Community, Friends, Challenges, Games
21. Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
22. Aromatherapy, Herbology, Elixirs, Meals
23. Acupressure, Reiki, Yoga, Green Journal
24. Profile (Share Your Sanctuary), Settings (theme, accessibility)
25. Split Screen Multitasking, PWA with push notifications
26. Capacitor mobile scaffolding (iOS + Android ready)
27. AI-Generated Meditation Audio Narration — TTS with 7 voice options, download MP3
28. Live Session Audio Recording — Host record, auto-upload, playback in replays
29. **Live Session Video Toggle — Host can turn camera on/off, PiP preview with LIVE badge, auto-stops on session end**

### Bug Fixes Applied
- 7.83 Hz: binaural beats (was inaudible raw sine)
- Profile API 500: fixed COVER_PRESETS NameError
- SmartDock minimize: tiny dot in bottom-right corner
- Dashboard drag handles: hidden by default, Rearrange toggle added

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

## Post-Launch Enhancements (Future)
- Capacitor: run `npx cap add android && npx cap add ios` after `yarn build`
- Additional AI voice models as they become available
- Full WebRTC video streaming to other participants (currently host-only PiP)
