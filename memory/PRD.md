# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking (Yoga, meditations, challenges) with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Vanilla Three.js (NO React Three Fiber/Drei)
- **Backend**: FastAPI (Modular APIRouter), Pydantic, Motor (Async MongoDB)
- **Database**: MongoDB
- **Integrations**: Emergent LLM Key (OpenAI GPT-5.2 / Claude / Gemini via emergentintegrations)

## Architecture
```
/app/
├── backend/
│   ├── server.py            # Main FastAPI app, mounts all routers with /api prefix
│   ├── deps.py              # Shared dependencies (db, auth, logger, LLM key)
│   ├── models.py            # Pydantic models
│   ├── data/                # Static data files (mudras.py, yantras.py, tantra.py)
│   └── routes/              # 40+ modular route files
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components (CosmicBanner, NarrationPlayer, etc.)
│   │   └── pages/           # Page components (50+ pages)
│   └── .env                 # REACT_APP_BACKEND_URL
└── memory/
    └── PRD.md
```

## Implemented Features (Phases 1-44)

### Core Platform
- User auth (JWT), profiles, dashboard
- Mood tracking, journaling, affirmations (daily + AI-generated)
- Gamification (XP, levels, streaks, badges, leaderboard)

### Wellness Content
- **Mudras** (25 sacred hand gestures with images, videos, guided practice)
- **Yantras** (sacred geometry meditation)
- **Tantra** (philosophy, breathwork, energy practices)
- **Exercises** (6 Qigong & Tai Chi practices with step-by-step instructions)
- **Videos** (23 curated videos across 10 categories)
- **Meditations** (guided sessions with timer)
- **Breathwork** (box breathing, pranayama)
- **Frequencies** (solfeggio, binaural, planetary)
- **Nourishment** (Ayurvedic recipes, energy foods)

### Mystical/Divination Systems
- Oracle (I Ching, Tarot, Runes)
- Mayan Astrology, Western Numerology, Cardology
- Cosmic Calendar with planetary events
- Aromatherapy, Herbology, Acupressure, Reiki

### AI Features
- AI Spiritual Coach "Sage" with Dream Analysis ("Dream Oracle" mode)
- AI-generated affirmations, meditations, breathwork, mantras, rituals
- AI Deep Dive for any topic
- AI Exercise Guide

### Advanced Features
- **Daily Rituals** (morning/evening practice tracking with instant completion)
- **Cross-Page Cosmic Interconnection System** (CosmicBanner component)
- **Cosmic Daily Briefing** (/daily-briefing with element energy, lunar guidance)
- **Interactive 3D Star Chart** (/star-chart) - Star Walk 2 style visuals
- **Classes & Certifications**
- **Constellation Mythology Overlays** with multi-stroke figure illustrations
- **TTS Narration & Ambient Music** (CosmicNarrator)
- **Stargazing Journey** planetarium show mode
- **Social Sharing** to Community feed
- **Celestial Badges System** (12 constellation-themed badges)

### Phase 44 Features (2026-03-26)
- **Dynamic Avatar Energy State Integration** (P0):
  - GET /api/avatar/energy-state endpoint computing energy from moods + activities
  - Energy meter, dominant chakra indicator, aura description, activity boosts, recommendation
  - Avatar preview dynamically modifies visuals (particle density, aura intensity, glow, chakra emphasis) based on energy state
  - 7-day mood trend visualization
  - Chakra-based color blending into aura

- **Virtual Reality Cosmic Sanctuary** (/vr):
  - Full-screen immersive Three.js 3D environment
  - Cosmic starfield (8000 stars), nebula clouds, cosmic dust particles
  - User's avatar figure with energy rings, chakra points, breathing animation
  - 6 interactive portal orbs (Meditation, Breathwork, Yoga, Star Chart, Oracle, Teachings) with hover/click navigation
  - Energy HUD showing real-time energy percentage, chakra, mood
  - Ambient cosmic audio (Web Audio API drones)
  - Orbital camera controls (drag, scroll, auto-rotate)
  - Fullscreen toggle, audio toggle
  - Navigation hidden for immersive experience
  - Energy-driven visual updates (aura color, ring brightness, chakra highlight, light intensity)

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/avatar, POST /api/avatar
- GET /api/avatar/energy-state
- GET /api/mudras (25 items)
- GET /api/videos (23 items)
- GET /api/exercises (6 items)
- POST /api/knowledge/tts
- GET /api/gamification/badges
- GET /api/star-chart/constellations

## Test Credentials
- Email: test@test.com, Password: password

## Known Constraints
- DO NOT install React Three Fiber or Drei (conflicts with lucide-react SVG line elements)
- Three.js Star Chart and VR pages use pure vanilla Three.js only
- All backend routes prefixed with /api via server.py include_router

## Backlog
- P1: Constellation-linked personalized guided meditations (generate themed meditations based on zodiac/constellation)
- P2: StarChart.js component splitting (extract JourneyOverlay, CelestialBadgesPanel, MythologyPanel)
- Potential: Meditation completion auto-sharing to community
