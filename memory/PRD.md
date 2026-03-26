# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
An immersive, highly personalized spiritual and wellness companion platform ("The Cosmic Collective") that seamlessly blends standard wellness tracking (Yoga, meditations, challenges) with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Shadcn/UI, Three.js
- **Backend**: FastAPI (modular APIRouter), Pydantic
- **Database**: MongoDB (Motor Async)
- **AI**: Emergent LLM Key (GPT-5.2/Claude/Gemini via LlmChat)

## Architecture
```
/app/backend/routes/       # 28+ modular route files
  daily_briefing.py        # Briefing + Star chart APIs
  cosmic_context.py        # Unified cosmic API + dream patterns
  coach.py                 # AI Coach + Dream Oracle
  ...

/app/frontend/src/
  components/CosmicBanner.js  # Cross-page cosmic interconnection
  pages/
    DailyBriefing.js          # Cosmic morning forecast
    StarChart.js              # 3D constellation chart (vanilla Three.js)
    CosmicCalendar.js         # Hub with suggestions & cross-links
    DailyRitual.js            # Timer-based ritual steps
    SpiritualCoach.js         # AI Coach with Dream Oracle mode
    Dreams.js                 # Journal + Patterns dashboard
    MayanAstrology.js         # With cross-links
    Numerology.js             # With cross-links
    ...
```

## Implemented Features

### Core
- Auth (JWT), profiles, avatars, dashboard, gamification, streaks, community

### Wellness Modules (all with CosmicBanner)
- Avatar Yoga, Breathing, Meditations, Aromatherapy, Herbology
- Elixirs, Meal Planning, Acupressure, Reiki, Sound Healing
- Light Therapy, Mudras, Daily Ritual (timer + active states)

### Mystical Systems (all interconnected)
- Mayan Calendar, Numerology, Sacred Cardology, Animal Totems
- Dream Journal + Symbol Library + **Dream Patterns Dashboard**
- Oracle readings, Cosmic Calendar Hub

### AI Features
- Sage: 6 modes (Spiritual, Life, Shadow, Manifestation, Healing, Dream Oracle)
- Dream interpretation cross-referencing aura/moon/numerology

### Cosmic Interconnection System
- **Cosmic Context API**: Unified snapshot (Mayan, moon, numerology, aura, suggestions)
- **CosmicBanner**: Shared across 6+ pages with clickable cross-navigation
- **Cross-links**: Mayan <-> Numerology <-> Calendar <-> Dreams <-> Ritual <-> Coach

### NEW: Cosmic Daily Briefing (`/daily-briefing`)
- Personalized morning spiritual forecast
- Sections: Element Energy, Lunar Guidance, Mayan Tzolk'in, Numerology Cycle, Dream Echoes, Aura Field, Today's Practices
- Quick links to Star Chart, Calendar, Sage

### NEW: 3D Constellation Chart (`/star-chart`)
- Interactive Three.js star field with 2500 background stars + nebula glow
- 16 constellations (12 zodiac + Orion, Ursa Major, Lyra, Cygnus) with labeled stars and connecting lines
- **Location-based visibility**: Stars filtered by observer latitude/longitude via LST calculation
- **Controls**: Drag to rotate, scroll to zoom, touch support for mobile
- **Location picker**: 6 preset cities + custom lat/lng coordinates
- **Avatar marker**: Holographic spinning rings at user's zodiac constellation
- **Element colors**: Fire=red, Water=blue, Air=purple, Earth=green
- **Constellation details**: Clickable stars open side panel with name, symbol, element, meaning, stars list, alignment reasons

## Key Endpoints
- `GET /api/daily-briefing` — Morning cosmic forecast
- `GET /api/star-chart/constellations?lat=X&lng=Y` — Location-based constellation data
- `GET /api/cosmic-context` — Unified cosmic snapshot
- `GET /api/dreams/patterns` — Dream pattern analytics
- `POST /api/coach/analyze-dream` — AI dream analysis

## Test Credentials
- Email: test@test.com, Password: password

## Test Reports
- iteration_33: Daily Ritual bug fix — 100% PASS
- iteration_34: Dream Oracle — 100% PASS
- iteration_35: Cross-page interconnection — 100% PASS
- iteration_36: Daily Briefing + Star Chart — 100% PASS

## Backlog
- P2: Polish/refine based on user feedback
- P3: Additional features per user request
