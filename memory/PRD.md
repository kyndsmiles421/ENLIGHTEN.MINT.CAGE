# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key) — checkout flow verified
- **Mobile**: Capacitor fully configured (10 plugins, iOS + Android configs)

## Launch Status: COMPLETE (Iteration 99 — 100% pass rate)

### All Verified Features (32+)
1. SmartDock — Minimize (tiny dot bottom-right), drag, snap zones, persist
2. Cosmic Mood Ring — Interactive quick log, 8 moods, navigation
3. Session Replay & Download — Auto-recording, Past Sessions tab, timeline player
4. Recurring Live Sessions — Subscribe, push notifications, auto-spawn
5. Live Sessions — WebSocket, avatars, guided commands, 8 types, 6 scenes
6. Mood Insights — AI weekly summary, stats, charts
7. Crystal Pairing — AI matching, share
8. Blessings — Send/receive, push notifications
9. Creator Dashboard — Admin stats
10. Customizable Dashboard — Drag-and-drop with Rearrange toggle (handles hidden by default)
11. Trade Circle — Barter marketplace, listings, offers
12. Stripe Subscriptions — 5 tiers, real checkout
13. Sacred Texts — 15 texts, chapters, AI narration
14. Encyclopedia — 12 traditions, Myths & Legends
15. Music Lounge — 10 synthesized tracks
16. Cosmic Mixer — 4-layer mixing
17. Frequencies — 12 solfeggio + earth tones, binaural beats for sub-20Hz
18. Soundscapes, Crystals (13), Avatar Creator, VR Modes
19. Entanglement, Community, Friends, Challenges, Games
20. Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
21. Aromatherapy, Herbology, Elixirs, Meals
22. Acupressure, Reiki, Yoga, Green Journal
23. Profile (Share Your Sanctuary), Settings (theme, accessibility)
24. Split Screen Multitasking, PWA with push notifications
25. Capacitor mobile scaffolding (iOS + Android ready)

### Bug Fixes Applied
- 7.83 Hz: binaural beats (was inaudible raw sine)
- Profile API 500: fixed COVER_PRESETS NameError
- SmartDock minimize: tiny dot in bottom-right corner
- Dashboard drag handles: hidden by default, Rearrange toggle added

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

## Post-Launch (P3)
- Live session video recording/replay
- AI-generated guided meditation audio
- Capacitor: run `npx cap add android && npx cap add ios` after `yarn build`
