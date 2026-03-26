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
- Zen Garden (plant garden, koi pond, sand drawing, lantern release, rain scene)

### Phase 44 (2026-03-26)
- **Dynamic Avatar Energy State** - Avatar visuals dynamically reflect user's wellness journey
- **Virtual Reality Cosmic Sanctuary** (`/vr`) - Immersive 3D environment with avatar, portals, energy HUD, ambient audio

### Phase 45 (2026-03-26)
- **Constellation-Linked Personalized Guided Meditations** - 12 zodiac themes with AI-generated immersive meditations

### Phase 46 (2026-03-26)
- **Bug Fix: Zen Garden Watering** - Added missing `PLANT_STAGES` and `PLANT_WATERS_PER_STAGE` constants to plants.py (lost during server.py modular refactor). Called `reset_plant_watering()` in get_plants to reset `watered_today` on new days.
- **Star Chart → Constellation Meditation Integration** - Clicking a constellation in the 3D Star Chart now shows a "Meditate" button that navigates to `/meditation?constellation={id}`, auto-switching to Cosmic Meditations mode with that constellation highlighted and scrolled into view.

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/avatar, POST /api/avatar, GET /api/avatar/energy-state
- GET /api/meditation/constellation-themes, POST /api/meditation/generate-constellation
- GET /api/meditation/my-constellation, DELETE /api/meditation/constellation/{id}
- GET /api/zen-garden/plants, POST /api/zen-garden/plants, POST /api/zen-garden/plants/{id}/water
- GET /api/mudras, GET /api/videos, GET /api/exercises
- POST /api/knowledge/tts, GET /api/gamification/badges, GET /api/star-chart/constellations

## Test Credentials
- Email: test@test.com, Password: password

## Known Constraints
- NO React Three Fiber/Drei — pure vanilla Three.js only
- All backend routes prefixed with /api

## Backlog
- P2: StarChart.js component splitting (>1500 lines)
- Potential: In-VR guided meditation mode
- Potential: Meditation completion auto-sharing to community
- Potential: More complex gamification tied to VR interactions
