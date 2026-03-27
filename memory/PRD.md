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

### AI Cinematic Visuals
- Creation Stories Cinema, VR Story Theater, Forecast Visuals, Dream Visuals
- Cosmic Portrait, Daily Card, Meditation Ambient
- All using GPT Image 1 via Emergent LLM Key

### Launch-Ready UI/UX Overhaul
- Navigation: 60-item flat → 6 categorized mega-menu dropdowns + Sage + Profile
- Landing: 24 cards → 6 category pillar cards
- Global Search: Cmd+K command palette with 60-item index
- Dashboard: Flat grid → 5 categorized quick action sections

### Sora 2 AI Video Generation
- 4-second cinematic video clips for 15 creation stories
- Background generation with polling, MongoDB + disk caching
- Video toggles in CinematicStoryMode and VR Story Theater

### Video Gallery (Cosmic Cinema)
- `/videos` page with two tabs: Cosmic Cinema (15 Sora 2 stories) + Practice Videos
- Cinema cards with generate/watch per story, video player modal
- SORA 2 badge for cached videos, progress counter (x/15)

### StarChart.js Component Splitting
- Reduced from ~2042 to ~1424 lines
- Extracted: StarChartOverlays.js (5 overlay components), StarChartAudio.js (ambient + narrator)

## Architecture
- `/app/backend/routes/ai_visuals.py` — Image + Video generation with Sora 2
- `/app/backend/static/videos/` — Generated video file cache
- `/app/frontend/src/components/SearchCommand.js` — Command palette
- `/app/frontend/src/components/Navigation.js` — 6 mega-menus + search
- `/app/frontend/src/components/StarChartOverlays.js` — Extracted StarChart overlays
- `/app/frontend/src/components/StarChartAudio.js` — Extracted StarChart audio
- `/app/frontend/src/pages/Videos.js` — Video Gallery with Cosmic Cinema tab

## Test: 59 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: PRODUCTION READY

## Remaining / Backlog
- None — all requested features and refactoring complete
