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
- 6-Pillar Navigation, JWT Auth + Stripe, PWA, Accessibility (font size, high contrast, reduce motion/particles/flashing)

### Gaming-Level Star Chart — 20 WORLD CULTURES (100 constellations)
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum
- 20 cultures: Mayan, Egyptian, Aboriginal, Lakota, Chinese, Vedic, Norse, Polynesian, Greek, Japanese, Yoruba, Celtic, Inuit, Aztec, Sumerian, Persian, Bantu, Native American, Slavic, Maori
- Each: 5 constellations with real RA/Dec star coordinates, mythology, deities, lessons, drawing paths
- **REFACTORED** (Mar 2026): Data moved from 2500 lines of Python to JSON seed file (`data/star_cultures_data.json`)

### Sacred Texts Audiobook Reader
- 15 scriptures with AI chapter generation, VR Immersive Reader, HD TTS, progress tracking

### World Spiritual Traditions Encyclopedia (VR + TTS)
- 12 living traditions, VR Immersive Mode, HD Voice Narration, AI "Ask the Oracle"

### Crystals & Stones (UPGRADED Mar 2026)
- 12 sacred crystals with VR Crystal Meditation, HD Voice Guide, 3 tabs + NEW Crystal Pairing tab
- **Crystal Pairing AI** (NEW): Select mood (12 options) + intention (12 options), AI recommends 3 crystals with personalized explanation and ritual suggestion, TTS narration, pairing history
- **Rock Hounding**: 3 environments, daily dig limit, auto-add to collection

### Send a Blessing (UPGRADED Mar 2026)
- 12 blessing templates, **AI-generated custom blessings**, stats dashboard (sent/received/community)
- 4 tabs: Send, Stream, Received, Sent
- Template mode + AI Blessing mode with context input

### Accessibility Settings (UPGRADED Mar 2026)
- Font size picker (Small/Default/Large/X-Large)
- High contrast mode
- Reduce motion, particles, flashing
- 5 color themes

### Myths & Legends Database
- 20 civilizations, 120+ seed myths, AI generation, search, HD voice narration

### AI Avatar Generator
- AI Manifestation + Energy Builder + Avatar Gallery + Global Display

### Context-Aware Human Voices (tts-1-hd)
- 35+ NarrationPlayer instances + encyclopedia/crystal narrators with tradition-mapped voices

### Guided App Tour
- 12-step card walkthrough (video phase bypassed for reliability)

### Other
- Cosmic Mixer, Split Screen, Dashboard, Ambient Soundscapes, 40+ content pages, Sora 2 Videos
- Trade Circle barter marketplace with karma system
- Stripe subscription system with tiers and credits
- Quantum Entanglement meditation sessions
- Hidden Creator role (auto-activates for kyndsmiles@gmail.com)

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- No P0/P1 items remaining
- **P2**: Mobile App Store final packaging (Capacitor build)
- **P3**: Crystal Pairing share results feature
- **P3**: Blessing notification when someone blesses you
