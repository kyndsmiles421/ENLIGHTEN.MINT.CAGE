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

## Implemented Features (Phases 1-37)

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
- **Interactive 3D Star Chart** (/star-chart) - Star Walk 2 style visuals:
  - Pure Three.js with shader-based star rendering
  - 6000+ background stars with magnitude-based glow
  - Nebula cloud sprites with additive blending
  - Constellation line drawing animation (staggered entrance)
  - Birth constellation pulsing with personalized toast message
  - Element-color coded constellations
  - Location-based rendering with preset cities
  - Drag/zoom/touch controls
- **Classes & Certifications** (Mudra Mastery, Yantra Wisdom, Tantra Foundations, Frequency Healing, Consciousness Explorer)

## Phase 37 Changes (2026-03-26)
- **Bug Fix**: Restored missing JSONResponse import in media.py, practices.py, wellness.py → Mudras/Videos/Exercises pages now display all content
- **Enhancement**: Star Chart upgraded to Star Walk 2 style with constellation drawing animation, nebula clouds, shader-based stars, and birth constellation pulsing

## Phase 38 Changes (2026-03-26)
- **Bug Fix**: Fixed guided meditation "Build Your Own" mode and TTS Voice Guide — `os.getenv("EMERGENT_LLM_KEY")` used without `os` import in meditations.py, knowledge.py, media.py; replaced with already-imported `EMERGENT_LLM_KEY` from deps
- **Bug Fix**: Fixed TTS caching — `hashlib` used without import in knowledge.py

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/mudras (25 items)
- GET /api/videos (23 items)
- GET /api/exercises (6 items)
- GET /api/media/classes, /api/media/videos
- GET /api/wellness/nourishment, /api/wellness/frequencies
- POST /api/coach/analyze-dream
- GET /api/cosmic/context, /api/cosmic/daily-briefing
- GET /api/star-chart/constellations

## Test Credentials
- Email: test@test.com, Password: password

## Known Constraints
- DO NOT install React Three Fiber or Drei (conflicts with lucide-react SVG line elements)
- Three.js Star Chart uses pure vanilla Three.js only
- All backend routes prefixed with /api via server.py include_router

## Backlog
- Awaiting user feedback on new features
- Potential: Social sharing, community features expansion, avatar customization
