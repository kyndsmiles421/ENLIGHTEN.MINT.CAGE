# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD)

## All Implemented Features

### Onboarding & Tutorial
- Interactive walkthrough + Tutorial page (/tutorial)

### Core: Auth, profiles, dashboard, mood, journaling, affirmations, gamification

### Wellness: Mudras (25), Yantras, Tantra, Exercises (6), Videos (23), Meditations (guided+AI+constellation), Breathwork, Frequencies, Soundscapes, Nourishment, Rituals

### Mystical: Oracle (I Ching/Tarot/Runes), Mayan/Chinese Astrology, Numerology, Cardology, Cosmic Calendar, Aromatherapy, Herbology, Acupressure, Reiki

### AI: Sage Coach (text+voice), Dream Oracle, constellation meditations, cosmic forecasts

### Voice Conversations
- Mic recording, Whisper STT, OpenAI TTS ("sage" voice), seamless voice/text toggle

### Multi-Cultural Star Chart
- 4 sky systems: Mayan, Egyptian, Aboriginal, Lakota (20 cultural constellations)
- Three.js overlay with cultural lines, figure sprites, star rings, labels
- **Cultural Story Explorer** with tabbed navigation + **Voice narration** (CosmicNarrator)

### Creation Stories Page (NEW - Feb 2026)
- 15 world civilizations: Mayan, Egyptian, Aboriginal, Lakota, Hindu, Norse, Greek, Japanese, Yoruba, Maori, Chinese, Celtic, Inuit, Aztec, Sumerian
- Full origin myths with deities, eras, sacred symbols, and cosmic lessons
- Region filtering (Africa, Americas, Asia, Europe, Oceania, Arctic & Middle East)
- Search by culture, deity, or title
- Split-view: story grid + detail panel with full narrative text
- **Voice narration** via TTS-1-HD for every creation story
- Backend: GET /api/creation-stories, GET /api/creation-stories/{id}, POST /api/creation-stories/{id}/narrate

### Social Sharing: Forecast cards → community feed
### Guided VR Journeys: 3 narrated constellation flythrough paths
### 3D/Immersive: Star Chart (gyroscope AR), VR Sanctuary, 3D Avatar
### Analytics: Cosmic Profile, Forecasts (6 systems x 4 periods), Zen Garden

## Test: 54 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: PRODUCTION READY

## Remaining Tasks
- P2: StarChart.js component splitting (~2000 lines)
