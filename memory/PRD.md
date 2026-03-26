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
│   ├── data/                # Static data files
│   └── routes/              # 40+ modular route files
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   └── pages/           # 50+ page components
│   └── .env                 # REACT_APP_BACKEND_URL
└── memory/
    └── PRD.md
```

## Implemented Features

### Core Platform
- User auth (JWT), profiles, dashboard
- Mood tracking, journaling, affirmations
- Gamification (XP, levels, streaks, badges, leaderboard)

### Wellness Content
- Mudras (25), Yantras, Tantra, Exercises (6), Videos (23), Meditations, Breathwork, Frequencies, Nourishment

### Mystical/Divination
- Oracle (I Ching, Tarot, Runes), Mayan Astrology, Numerology, Cardology
- Cosmic Calendar, Aromatherapy, Herbology, Acupressure, Reiki

### AI Features
- AI Spiritual Coach "Sage", Dream Oracle, AI-generated content, AI Deep Dive

### Advanced Features
- Daily Rituals, Cosmic Banner, Daily Briefing, Interactive 3D Star Chart
- Classes & Certifications, Constellation Mythology Overlays
- TTS Narration & Ambient Music, Stargazing Journeys
- Social Sharing, Celestial Badges (12)

### Phase 44 (2026-03-26)
- **Dynamic Avatar Energy State** - Avatar visuals dynamically reflect user's wellness journey (particle density, aura, glow, chakra emphasis driven by moods/activities)
- **Virtual Reality Cosmic Sanctuary** (`/vr`) - Immersive 3D Three.js environment with avatar, 8000-star starfield, 6 interactive portal orbs, energy HUD, ambient cosmic audio, orbital camera

### Phase 45 (2026-03-26)
- **Constellation-Linked Personalized Guided Meditations** - 12 zodiac constellation meditation themes with AI-generated immersive meditations. Each draws from constellation mythology, element energy, deity connections. User's birth sign highlighted. Saved meditations replayable/deletable.
  - Endpoints: GET /api/meditation/constellation-themes, POST /api/meditation/generate-constellation, GET /api/meditation/my-constellation, DELETE /api/meditation/constellation/{id}

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/avatar, POST /api/avatar, GET /api/avatar/energy-state
- GET /api/meditation/constellation-themes, POST /api/meditation/generate-constellation
- GET /api/meditation/my-constellation, DELETE /api/meditation/constellation/{id}
- GET /api/mudras, GET /api/videos, GET /api/exercises
- POST /api/knowledge/tts, GET /api/gamification/badges, GET /api/star-chart/constellations

## Test Credentials
- Email: test@test.com, Password: password

## Known Constraints
- NO React Three Fiber/Drei — pure vanilla Three.js only
- All backend routes prefixed with /api

## Backlog
- P2: StarChart.js component splitting (extract JourneyOverlay, CelestialBadgesPanel, MythologyPanel)
- Potential: Meditation completion auto-sharing to community
- Potential: In-VR guided meditation mode (breathing inside the 3D sanctuary)
- Potential: More complex gamification tied to VR interactions
