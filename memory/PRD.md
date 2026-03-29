# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **Mobile**: Capacitor configured

## All Implemented Features

### Dashboard (FIXED Mar 2026)
- **Stat cards now tappable**: Streak → /growth-timeline, Mood Logs → /mood, Journal → /journal, Games → /games
- **2x2 compact grid** on mobile with chevron tap indicators
- **Walkthrough overlay fixed** — no longer auto-blocks page; opt-in via "?" help button
- Quantum Coherence widget, Daily Challenge, Daily Wisdom, Recent Moods, Recommendations
- Avatar click navigates to Avatar Creator

### Quick Reset (UPGRADED Mar 2026)
- **33 emotions** (Positive, Challenged, Spiritual) with search bar
- Each emotion → personalized 5-min reset (solfeggio frequency, wellness tool, nourishment, mantra)
- Mobile button fixed (touchEnd handler)

### Star Chart — 20 World Cultures (100 constellations)
- Pinch-to-zoom + on-screen zoom buttons
- Culture-aware constellation clicks → open that culture's story
- Culture-aware Journey narration
- Data refactored to JSON seed file

### All Other Features
- Sacred Texts Audiobook Reader, Encyclopedia VR + TTS, Crystal Pairing AI
- Send a Blessing (AI + stats), Accessibility Settings, Guided App Tour
- Myths & Legends, AI Avatar, Cosmic Mixer, Split Screen, Trade Circle
- Stripe Subscriptions, Quantum Entanglement, Hidden Creator Role
- Context-aware Voices, 40+ content pages

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- No P0/P1 items remaining
- P2: Capacitor mobile app build
- P3: Crystal Pairing share, Blessing notifications, Mood trends
