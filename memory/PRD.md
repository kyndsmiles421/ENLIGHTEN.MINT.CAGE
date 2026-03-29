# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key) — checkout flow verified
- **Mobile**: Capacitor scaffolded

## Launch Status: ALL SYSTEMS GO (Iteration 98 — 100% pass rate)

### All Verified Features
1. **SmartDock** — Minimize (tiny dot, bottom-right), drag anywhere, snap zones, persist position
2. **Cosmic Mood Ring** — Interactive quick log, 8 moods, ring animation, navigate to tracker
3. **Session Replay & Download** — Auto-recording, Past Sessions tab, timeline player, JSON export
4. **Recurring Live Sessions** — Subscribe, push notifications, auto-spawn
5. **Live Sessions** — WebSocket rooms, avatars, guided commands, 8 types, 6 scenes
6. **Mood Insights** — AI weekly emotional summary, stats, charts
7. **Crystal Pairing** — AI matching, share feature
8. **Blessings** — Send/receive, in-app + push notifications
9. **Creator Dashboard** — Admin stats, user growth, feedback
10. **Customizable Dashboard** — Drag-and-drop, pin shortcuts
11. **Trade Circle** — Barter marketplace, listings, offers, karma system
12. **Stripe Subscriptions** — 5 tiers (Free→Super User), real Stripe checkout
13. **Sacred Texts** — 15 texts, chapters, AI narration, immersive reading
14. **Encyclopedia** — 12 traditions, Myths & Legends
15. **Music Lounge** — 10 synthesized ambient tracks
16. **Cosmic Mixer** — 4-layer mixing (frequency, sound, mantra, light)
17. **Frequencies** — 12 solfeggio + earth tones, binaural beats for sub-20Hz
18. **Soundscapes** — Ambient environments
19. **Crystals & Stones** — 13 crystals, AI pairing
20. **Avatar Creator** — AI-generated avatars
21. **VR Modes** — Immersive environments
22. **Entanglement** — Quantum experiments
23. **Community** — Posts, likes, comments
24. **Friends** — Social connections
25. **Challenges** — Wellness challenges
26. **Games** — Interactive spiritual games
27. **Star Charts, Numerology, Oracle, Mayan Calendar, Cardology**
28. **Aromatherapy, Herbology, Elixirs, Meals**
29. **Acupressure, Reiki, Yoga**
30. **Green Journal** — Plant tracking
31. **Profile & Settings** — Theme, music, accessibility
32. **PWA** — Push notifications, installable

### Bug Fixes Applied
- 7.83 Hz Schumann Resonance: binaural beats (was inaudible raw sine)
- Profile /api/profile/me: fixed COVER_PRESETS NameError
- SmartDock: minimize now properly tucks to corner

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Post-Launch Backlog (P3)
- Capacitor mobile app store packaging
- Split Screen Multitasking
- Live session video recording/replay
- AI-generated guided meditation audio

## Critical Implementation Notes
- **Modals**: Always use `createPortal(document.body)` — Framer Motion transforms break fixed positioning
- **WebSockets**: K8s ingress may block wss:// — LiveRoom has REST polling fallback
- **MongoDB**: Exclude `_id` from all responses
- **Sub-20Hz audio**: Always use binaural beats (stereo ChannelMerger)
