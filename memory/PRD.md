# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)

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
- All using GPT Image 1 via Emergent LLM Key

### Launch-Ready UI/UX Overhaul (Feb 2026)
- Navigation: 60-item flat nav → 6 categorized mega-menu dropdowns + Sage + Profile
- Landing: 24 cards → 6 category pillar cards
- Global Search: Cmd+K command palette with 60-item index, fuzzy search, keyboard nav
- Dashboard: Flat grid → 5 categorized quick action sections

### Sora 2 AI Video Generation (Feb 2026)
- 4-second cinematic video clips for 15 creation stories
- Background generation with polling (2-5 min per video)
- MongoDB + disk caching at /api/static/videos/
- Video toggle in CinematicStoryMode (Creation Stories)
- Video toggle in VR Story Theater
- Backend: 3 endpoints (generate-video, video-status, video-stories)
- Using OpenAIVideoGeneration from emergentintegrations

## Architecture
- `/app/backend/routes/ai_visuals.py` — Image + Video generation, caching, Sora 2 integration
- `/app/backend/server.py` — StaticFiles mount for video serving
- `/app/backend/static/videos/` — Generated video cache on disk
- `/app/frontend/src/components/SearchCommand.js` — Command palette
- `/app/frontend/src/components/Navigation.js` — 6 mega-menus + search
- `/app/frontend/src/pages/CreationStories.js` — Cinema mode with video toggle
- `/app/frontend/src/pages/VirtualReality.js` — VR Theater with video toggle

## Test: 58 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: PRODUCTION READY

## Remaining / Backlog
- P2: StarChart.js component splitting (~2000 lines)
