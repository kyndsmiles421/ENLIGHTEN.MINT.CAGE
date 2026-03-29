# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod) — checkout flow verified
- **Mobile**: Capacitor configured

## Launch Readiness Status: ALL SYSTEMS GO

### Verified Critical Flows (Iteration 97)
- Stripe checkout → Real Stripe URLs generated ✅
- Trade Circle CRUD → Listing creation, offers, validation ✅
- Sacred Texts (15 texts) → API + UI ✅
- Encyclopedia (12 traditions) → API + UI ✅
- Music Lounge (10 tracks) → Audio playback ✅
- Cosmic Mixer → 4 layers (frequency, sound, mantra, light) ✅
- Frequencies (12) → Including fixed 7.83 Hz binaural beats ✅
- Crystals (13) → Crystal cards + pairing ✅
- Avatar Creator → AI avatar generation ✅
- SmartDock → Minimize, drag, snap zones ✅
- Mood Ring → Interactive quick log with 8 moods ✅
- Live Sessions → WebSocket rooms + recurring series + replay/download ✅
- Pricing → 5 tiers + 3 credit packs ✅

### Bug Fix: 7.83 Hz Schumann Resonance (Mar 2026)
- **Root cause**: Raw 7.83 Hz sine wave is below human hearing (20 Hz minimum)
- **Fix**: Implemented binaural beats — 200 Hz in left ear, 207.83 Hz in right ear, brain perceives 7.83 Hz difference
- **Added**: Sub-bass harmonic pad (7.83 * 16 = ~125 Hz) for body resonance
- **Fixed in**: Frequencies.js, CosmicMixerPage.js, CosmicMixer.js, MusicLounge.js

### All Implemented Features
- SmartDock (minimize, drag, snap zones, persist)
- Interactive Cosmic Mood Ring (quick log, navigation)
- Session Replay & Download (recordings, timeline player, chat sidebar)
- Scheduled Recurring Live Sessions (subscribe, push notifications)
- Live Sessions (WebSocket rooms, avatars, guided commands)
- Mood Insights (AI weekly summary)
- Crystal Pairing (share feature)
- Blessing Notifications (inbox, push)
- Creator Dashboard (admin stats)
- Customizable Dashboard (drag-and-drop)
- Trade Circle barter marketplace
- Stripe subscription system (5 tiers)
- Sacred Texts Audiobook Reader (15 texts, AI narration)
- Encyclopedia / Myths & Legends (12 traditions)
- Music Lounge (10 synthesized tracks)
- Cosmic Mixer (4-layer mixing)
- Frequencies (12 solfeggio + earth tones)
- Soundscapes (ambient environments)
- Crystals & Stones (13 crystals, AI pairing)
- Avatar Creator (AI-generated)
- VR Immersive modes
- Entanglement (quantum experiments)
- Community, Friends, Challenges, Games
- Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
- Aromatherapy, Herbology, Elixirs, Meals
- Acupressure, Reiki, Yoga
- Green Journal (plant tracking)
- Daily Rituals, Cosmic Calendar, Forecasts
- Meditation History, Wellness Reports
- PWA with push notifications

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Remaining Backlog (Post-Launch)
- P3: Mobile App Store packaging (Capacitor — scaffolding exists)
- P3: Split Screen Multitasking
- P3: Live session video recording/replay
- P3: AI-generated guided meditation audio

## Critical Implementation Notes
- **Modals**: Always use `createPortal(document.body)` — Framer Motion transforms break fixed positioning
- **WebSockets**: K8s ingress may block wss:// — LiveRoom has REST polling fallback
- **MongoDB**: Exclude `_id` from all responses
- **Sub-20Hz audio**: Always use binaural beats (stereo ChannelMerger), never raw oscillator
