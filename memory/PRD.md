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
│   └── .env
└── memory/
    └── PRD.md
```

## Implemented Features

### Core Platform
- User auth (JWT), profiles, dashboard, mood tracking, journaling, affirmations
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
- Dynamic Avatar Energy State — avatar visuals reflect wellness journey
- Virtual Reality Cosmic Sanctuary (`/vr`) — immersive 3D portal environment

### Phase 45 (2026-03-26)
- Constellation-Linked Personalized Guided Meditations — 12 zodiac AI meditations

### Phase 46 (2026-03-26)
- Bug Fix: Zen Garden watering (missing PLANT_STAGES/PLANT_WATERS_PER_STAGE constants)
- Star Chart → Constellation Meditation Integration (Meditate button in mythology panel)

### Phase 47 (2026-03-26)
- **Gyroscope/DeviceOrientation Star Chart** — Phone movement controls camera for AR-like stargazing experience. Uses alpha (compass) for horizontal rotation, beta (tilt) for vertical angle. iOS permission request handled. Gyro toggle in toolbar with "Gyro for AR mode" hint.
- **Auto-Water Zen Garden from Wellness Activities** — Completing meditations or daily challenges automatically waters one unwatered zen garden plant. Returns `plant_growth` in API response showing which plant was watered and whether it grew to a new stage. Connected in `meditation_history.py` and `daily_challenges.py`.

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/avatar, POST /api/avatar, GET /api/avatar/energy-state
- GET /api/meditation/constellation-themes, POST /api/meditation/generate-constellation
- GET /api/meditation/my-constellation, DELETE /api/meditation/constellation/{id}
- POST /api/meditation-history/log (now returns plant_growth)
- POST /api/daily-challenges/complete (now returns plant_growth)
- GET /api/zen-garden/plants, POST /api/zen-garden/plants, POST /api/zen-garden/plants/{id}/water
- GET /api/mudras, GET /api/videos, GET /api/exercises
- POST /api/knowledge/tts, GET /api/gamification/badges, GET /api/star-chart/constellations

## Test Credentials
- Email: test@test.com, Password: password

## Known Constraints
- NO React Three Fiber/Drei — pure vanilla Three.js only
- All backend routes prefixed with /api
- Gyroscope only works on devices with DeviceOrientation API (phones, tablets)

## Backlog
- P2: StarChart.js component splitting (>1600 lines)
- Potential: In-VR guided meditation mode
- Potential: Meditation completion auto-sharing to community
- Potential: More complex gamification tied to VR interactions
- Potential: Plant growth animations when completing wellness activities
