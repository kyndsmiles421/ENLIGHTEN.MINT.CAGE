# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1)

## All Implemented Features

### Core: Auth, profiles, dashboard, mood, journaling, affirmations, gamification
### Wellness: Mudras (25), Yantras, Tantra, Exercises, Videos, Meditations, Breathwork, Frequencies, Soundscapes, Nourishment, Rituals
### Mystical: Oracle, Astrology, Numerology, Cardology, Cosmic Calendar, Aromatherapy, Herbology, Acupressure, Reiki
### Tutorial: Interactive walkthrough + Tutorial page

### AI Voice: Sage Coach (text+voice via Whisper STT + TTS "sage" voice)
### Multi-Cultural Star Chart: Mayan/Egyptian/Aboriginal/Lakota (20 constellations) + Cultural Story Explorer with voice narration
### Creation Stories: 15 world civilizations with full origin myths, region filtering, search, TTS narration
### Social: Community feed, forecast sharing, meditation sharing
### VR: Sanctuary (meditation + 3 guided constellation journeys + Story Theater)
### Analytics: Cosmic Profile, Forecasts (6 systems x 4 periods), Zen Garden
### 3D: Star Chart (gyroscope AR), VR Sanctuary, 3D Avatar

### AI Cinematic Visuals (Feb 2026)
- Creation Stories Cinema, VR Story Theater, Forecast Visuals, Dream Visuals
- Cosmic Portrait, Daily Card, Meditation Ambient
- Backend: 7 AI visual endpoints with MongoDB caching (ai_visuals_cache collection)
- All using GPT Image 1 via Emergent LLM Key

### Launch-Ready UI/UX Overhaul (Feb 2026)
- **Navigation Redesign**: Replaced 60-item flat nav with 6 categorized mega-menu dropdowns:
  - Today (4 items), Practice (12), Divination (9), Sanctuary (7), Nourish (7), Explore (12)
  - Sage AI Coach direct link with teal accent
  - Profile dropdown with Dashboard, Profile, Avatar, Reports, Certs, History, Media, Tutorial
  - Mobile: Accordion-based categories replacing flat 60-item scroll
- **Landing Page Streamline**: Replaced 24 feature cards with 6 curated category pillar cards
  - Each pillar: icon, title, subtitle, color-coded highlight tags
  - Matches nav categories for consistent IA

## Test: 56 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: PRODUCTION READY — LAUNCH READY

## Remaining / Backlog
- P1: Sora 2 AI Video Generation for Creation Stories & VR Theater
- P2: StarChart.js component splitting (~2000 lines)
