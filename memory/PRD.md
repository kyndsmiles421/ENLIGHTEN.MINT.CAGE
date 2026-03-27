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
- **Navigation Redesign**: 60-item flat nav -> 6 categorized mega-menu dropdowns (Today, Practice, Divination, Sanctuary, Nourish, Explore) + Sage direct link + Profile dropdown. Mobile: accordion categories.
- **Landing Page**: 24 feature cards -> 6 curated category pillar cards with color-coded highlight tags
- **Global Search Command Palette** (Feb 2026): Cmd+K / Ctrl+K spotlight search across all 60 pages/features. Fuzzy matching, category-grouped results, keyboard navigation (arrow keys + Enter), accessible from nav bar on desktop + mobile.
- **Dashboard Categorization** (Feb 2026): Flat 24-item grid -> 5 categorized sections (Today, Practice, Divination, Sanctuary, Explore) with colored headers matching nav structure.

## Architecture
- `/app/frontend/src/components/SearchCommand.js` — Command palette with 60-item SEARCH_INDEX
- `/app/frontend/src/components/Navigation.js` — 6 mega-menu categories + search trigger + Cmd+K listener
- `/app/frontend/src/pages/Landing.js` — 6 category pillar cards
- `/app/frontend/src/pages/Dashboard.js` — 5 categorized quick action sections

## Test: 57 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: PRODUCTION READY — LAUNCH READY

## Remaining / Backlog
- P1: Sora 2 AI Video Generation for Creation Stories & VR Theater
- P2: StarChart.js component splitting (~2000 lines)
