# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking (Yoga, meditations, challenges) with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI (Modular APIRouter), Pydantic, Motor (Async MongoDB)
- Database: MongoDB
- Integrations: Emergent LLM Key (OpenAI GPT-5.2 via emergentintegrations)

## Implemented Features (Complete)

### Core Platform
- JWT auth, profiles, dashboard, mood tracking, journaling, affirmations
- Gamification (XP, levels, streaks, badges, leaderboard)
- Community feed with likes, comments, sharing

### Wellness Content
- Mudras (25), Yantras, Tantra, Exercises (6), Videos (23)
- Meditations (guided + AI custom + constellation-linked)
- Breathwork, Frequencies, Nourishment, Daily Rituals

### Mystical/Divination
- Oracle (I Ching, Tarot, Runes), Mayan Astrology, Numerology, Cardology
- Cosmic Calendar, Aromatherapy, Herbology, Acupressure, Reiki
- **Cosmic Forecasts** — Daily/Weekly/Monthly/Yearly across 6 systems (Astrology, Tarot, Numerology, Cardology, Chinese, Mayan) with caching

### AI Features
- AI Spiritual Coach "Sage" + Dream Oracle
- AI-generated meditations, affirmations, breathwork, mantras, rituals
- AI constellation meditations themed to zodiac mythology
- AI cosmic forecasts with lucky numbers, crystals, elements, affirmations

### 3D / Immersive
- **3D Star Chart** — Star Walk 2 style, mythology overlays, TTS narration, stargazing journeys, celestial badges, gyroscope device orientation for AR-like experience
- **VR Cosmic Sanctuary** — Immersive 3D environment with avatar, portals, energy HUD, ambient audio, **in-VR breathing meditation mode**
- **3D Avatar Creator** — Energy-state driven visuals (aura, particles, chakras reflect wellness data)

### Analytics
- **Cosmic Profile** — Personalized cosmic fingerprint aggregating forecasts, constellation meditations, moods, energy patterns, recurring lucky numbers/crystals/elements, gamification, garden stats
- Zen Garden (plants, koi, sand drawing, lanterns, rain) with auto-watering from wellness activities

### Connectivity
- Meditation completion auto-shares to community
- Plant growth toast notifications on wellness activity completion
- Star Chart → Constellation Meditation seamless navigation

## Test Credentials
- Email: test@test.com, Password: password

## Test Reports
- Iterations 37-49 all passing at 100%

## Status: PRODUCTION READY (user pausing development)
