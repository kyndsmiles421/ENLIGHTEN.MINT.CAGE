# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **Mobile**: Capacitor configured for App Store / Play Store wrapping

## All Implemented Features

### Core
- 6-Pillar Navigation, JWT Auth + Stripe, PWA
- Accessibility: font size picker (4 sizes), high contrast, reduce motion/particles/flashing

### Quick Reset (UPGRADED Mar 2026)
- **33 emotions** across 3 categories: Positive (10), Challenged (19), Spiritual (4)
- Search bar to filter emotions
- Each feeling maps to personalized: solfeggio frequency, wellness tool, nourishment recipe, sacred mantra
- Button fixed for mobile (touchEnd handler, no btn-glass CSS)

### Star Chart — 20 WORLD CULTURES (100 constellations)
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum
- **Pinch-to-zoom** + on-screen +/- zoom buttons
- **Culture-aware clicks**: clicking a cultural constellation opens that culture's story panel
- **Culture-aware Journey mode**: journeys through selected culture's constellations with narration
- Data refactored from Python to JSON seed file

### Sacred Texts Audiobook Reader
- 15 scriptures with AI chapter generation, VR Immersive Reader, HD TTS

### Encyclopedia + Crystals (VR + TTS + AI Crystal Pairing)
- Crystal Pairing AI: mood/intention → AI recommends 3 crystals with explanation + TTS + history
- Rock Hounding, VR Crystal Meditation, HD Voice Guide

### Send a Blessing
- 12 templates + AI-generated custom blessings, stats, 4 tabs (Send/Stream/Received/Sent)

### Guided App Tour
- 12-step card walkthrough with swipe navigation, mobile-reliable button

### Myths & Legends, AI Avatar, Cosmic Mixer, Split Screen, Dashboard, Trade Circle, Stripe Subscriptions, Quantum Entanglement, Hidden Creator Role, Context-aware Voices, 40+ content pages

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- No P0/P1 items remaining
- **P2**: Mobile App Store final packaging (Capacitor build)
- **P3**: Crystal Pairing share, Blessing notifications
