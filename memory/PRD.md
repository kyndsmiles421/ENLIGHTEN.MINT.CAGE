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
/app/backend/routes/         # 45+ modular route files
/app/frontend/src/pages/     # 55+ page components
/app/frontend/src/components/ # Reusable components
```

## Implemented Features

### Core: Auth, Profiles, Dashboard, Mood tracking, Journaling, Affirmations, Gamification (XP, levels, streaks, badges)

### Wellness: Mudras (25), Yantras, Tantra, Exercises (6), Videos (23), Meditations, Breathwork, Frequencies, Nourishment, Zen Garden

### Mystical: Oracle (Tarot/I Ching/Runes), Mayan Astrology, Numerology, Cardology, Cosmic Calendar, Aromatherapy, Herbology, Acupressure, Reiki

### AI: Spiritual Coach "Sage", Dream Oracle, AI-generated content, AI Deep Dive

### Advanced: Daily Rituals, 3D Star Chart (mythology overlays, TTS narration, stargazing journeys, celestial badges), Social Sharing, VR Sanctuary, Classes & Certifications

### Phase 44-47 (2026-03-26)
- Dynamic Avatar Energy State
- Virtual Reality Cosmic Sanctuary (`/vr`)
- Constellation-Linked Guided Meditations
- Zen Garden watering bug fix + auto-water from wellness activities
- Gyroscope Star Chart (DeviceOrientation API)
- Star Chart → Meditation integration

### Phase 48 (2026-03-26)
- **Cosmic Forecasts System** (`/forecasts`): AI-powered Daily/Weekly/Monthly/Yearly forecasts across 6 divination systems (Astrology, Tarot, Numerology, Cardology, Chinese Astrology, Mayan Astrology). Smart caching per period. Expandable forecast cards with sections, lucky numbers/colors/crystals, affirmations, and energy ratings.
- **Plant Growth Toast Notifications**: Completing meditations or daily challenges shows "Your [plant] received cosmic nourishment" toast when a zen garden plant gets auto-watered.

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/avatar, POST /api/avatar, GET /api/avatar/energy-state
- GET/POST/DELETE /api/meditation/constellation-* (constellation meditations)
- GET/POST/DELETE /api/forecasts/* (cosmic forecasts)
- GET/POST /api/zen-garden/plants, POST /api/zen-garden/plants/{id}/water
- POST /api/meditation-history/log (returns plant_growth)
- POST /api/daily-challenge/complete (returns plant_growth)

## Test Credentials
- Email: test@test.com, Password: password

## Known Constraints
- NO React Three Fiber/Drei — pure vanilla Three.js only
- All backend routes prefixed with /api
- Gyroscope only works on mobile devices

## Backlog
- P1: In-VR guided meditation mode (breathing inside the 3D sanctuary)
- P2: StarChart.js component splitting (>1600 lines)
- Potential: Meditation completion auto-sharing to community
- Potential: Plant growth animations
- Potential: More VR gamification
