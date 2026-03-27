# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS)

## All Implemented Features

### Onboarding & Tutorial
- Interactive 10-step walkthrough on first login (localStorage-persisted)
- Comprehensive Tutorial page (/tutorial) with 38 feature cards across 8 sections + Pro Tips

### Core: Auth, profiles, dashboard, mood tracking, journaling, affirmations, gamification

### Wellness: Mudras (25), Yantras, Tantra, Exercises (6), Videos (23), Meditations (guided + AI + constellation), Breathwork, Frequencies, Soundscapes, Nourishment, Daily Rituals

### Mystical: Oracle (I Ching/Tarot/Runes), Mayan/Chinese Astrology, Numerology, Cardology, Cosmic Calendar, Aromatherapy, Herbology, Acupressure, Reiki

### AI: Sage Coach (text + voice conversations), Dream Oracle, AI-generated content, constellation meditations, cosmic forecasts

### Voice Conversations (Feb 2026)
- Microphone recording in Sage chat with visual recording indicator
- Speech-to-Text via OpenAI Whisper (whisper-1 model)
- Text-to-Speech via OpenAI TTS (tts-1 model, "sage" voice)
- Audio playback with animated indicators on AI response bubbles
- Seamless toggle between voice and text input modes

### Multi-Cultural Star Chart (Feb 2026)
- 4 cultural sky systems: Mayan, Egyptian, Australian Aboriginal, Lakota
- 20 total cultural constellations with unique mythologies, deity stories, and life lessons
- Three.js overlay with cultural-colored constellation lines, figure sprites, star rings, and labels
- "World Skies" toggle in header with dropdown selector
- Backend: GET /api/star-chart/cultures and /api/star-chart/cultures/{id}

### Social Sharing for Forecasts (Feb 2026)
- Share button on each forecast card (appears on hover)
- Posts forecast summary + affirmation to community feed
- Visual confirmation (shared state) after posting

### Guided VR Constellation Journeys (Feb 2026)
- 3 guided journeys: "The Hero's Path", "The Cosmic River", "The Zodiac Circle"
- Camera flythrough with smooth interpolation between constellation waypoints
- Narrated text overlays with progress bar
- Journey constellation markers and connection lines in 3D scene
- Journey picker accessible from VR page compass button

### 3D/Immersive: Star Chart (gyroscope AR mode), VR Sanctuary (meditation + journeys), 3D Avatar (energy-state driven)

### Analytics: Cosmic Profile (recurring patterns), Cosmic Forecasts (6 systems x 4 periods), Zen Garden (auto-water from activities)

### Social: Community feed, meditation auto-sharing, forecast sharing, plant growth toasts

## Test: 52 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: PRODUCTION READY

## Pending Tasks (Priority Order)
- P2: StarChart.js component splitting (1600+ lines refactoring)
