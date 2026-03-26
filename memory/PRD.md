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

## Phase 39 Changes (2026-03-26)
- **Feature**: Constellation Mythology Overlays (Star Walk 2 style)
  - Added rich mythology data to all 16 constellations: figure names, Greek/Egyptian/Sumerian origins, deity associations, full narrative stories, cosmic lessons
  - Canvas-drawn mythology figure outlines (ram, bull, twins, crab, lion, maiden, scales, scorpion, archer, sea-goat, water bearer, fish, hunter, bear, lyre, swan) rendered as Three.js sprite overlays with additive blending and glow effects
  - "Mythology" toggle button in Star Chart header with purple glow when active
  - Enhanced constellation detail panel with Mythology/Stars tabs
  - Mythology tab shows figure name, origin, deity, full story narrative, and "Cosmic Lesson" card
  - Stars tab shows individual star names and magnitudes
  - Mythology mode indicator banner at bottom of screen

## Phase 40 Changes (2026-03-26)
- **Feature**: Constellation Story Narration with Ambient Cosmic Music
  - CosmicNarrator component with TTS narration using "fable" (British storyteller) voice at 0.9x speed
  - Ambient cosmic drone generator via Web Audio API: base C2 drone, G2 fifth harmonic, LFO-modulated triangle pad, high shimmer sweep
  - Real-time waveform visualization using Web Audio analyser
  - Progress bar, play/pause/stop controls
  - Narrates full mythology story + cosmic lesson when "Listen to Story" is clicked
  - Ambient drones fade in/out gracefully with narration

## Phase 41 Changes (2026-03-26)
- **Feature (P0)**: Stargazing Journey — Planetarium Show Mode
  - "Stargazing Journey" button in Star Chart header
  - Auto-navigates camera through all 16 constellations in sequence
  - Smooth cinematic camera transitions using spherical coordinate lerp
  - Per-constellation TTS narration with "fable" voice + persistent ambient cosmic drones
  - JourneyOverlay with timeline dots, progress bar, play/pause/skip/stop controls
  - JourneyComplete card after visiting all constellations
  - Auto-enables mythology mode when journey starts

- **Feature (P1)**: Enhanced Constellation Figure Illustrations
  - Multi-stroke canvas-drawn mythology figures for all 16 constellations
  - Recognizable silhouettes: ram horns, bull head, twin figures, crab claws, lion mane, maiden with wheat, scales of justice, scorpion stinger, centaur archer, sea-goat, water bearer pouring, bound fish, Orion with club/shield, great bear, lyre with strings, swan wings
  - Glow effects with additive blending per stroke

- **Feature (P2)**: Social Sharing Enhancements
  - Share constellation discoveries to community (post_type: 'shared_constellation')
  - Share Stargazing Journey completion (post_type: 'shared_journey')
  - Share button in MythologyPanel detail card
  - Share button in Journey Complete card
  - New post type labels in Community page: "Star Discovery", "Stargazing Journey", "Meditation"

- **Feature (P3)**: Gamification — Star Chart XP System
  - POST /api/star-chart/award-xp endpoint
  - XP rewards: constellation_explored (10), mythology_read (15), story_listened (25), journey_completed (100)
  - Duplicate prevention per action+constellation per day
  - XP counts toward global leaderboard
  - Auto-awards XP when exploring constellations, listening to stories, completing journeys

## Phase 42 Changes (2026-03-26)
- **Feature**: Celestial Badges System
  - 12 constellation-themed badges with progress tracking
  - Badges: First Light, Stargazer, Constellation Collector, Story Seeker, Myth Keeper, Orion's Hunter, Neptune's Child, Gaia's Guardian, Zephyr's Voice, Lyra's Musician, Cosmic Voyager, Celestial Master
  - Element-color coded badges (Fire red, Water blue, Air purple, Earth green, Universal cosmic purple)
  - GET /api/badges/celestial endpoint with auto-award on criteria met
  - Progress bars, earned tags, glow effects
  - Badges panel (data-testid='badges-panel') accessible from Star Chart header
  - Stats display: constellations explored, stories listened, journeys completed

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
- Awaiting user feedback on all new features
- Potential: More complex gamification badges specific to star chart mastery
- Potential: Avatar customization linked to constellation alignment
- Potential: Meditation completion auto-sharing to community
