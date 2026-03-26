# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
An immersive, highly personalized spiritual and wellness companion platform ("The Cosmic Collective") that seamlessly blends standard wellness tracking (Yoga, meditations, challenges) with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (modular APIRouter architecture), Pydantic
- **Database**: MongoDB (Motor Async)
- **AI**: Emergent LLM Key (GPT-5.2/Claude Sonnet 4.5/Gemini via LlmChat)

## Architecture
```
/app/backend/
├── server.py          # Slim entry point (~62 lines)
├── deps.py            # Shared dependencies
├── models.py          # Pydantic models
└── routes/            # 26+ modular route files

/app/frontend/src/
├── App.js
├── context/AuthContext.js
├── components/Navigation.js
└── pages/             # All feature pages
```

## Implemented Features (All Tested & Working)

### Core Platform
- User auth (JWT), profiles, avatars
- Dashboard with mood tracking, streaks, gamification
- Community features, social, messaging

### Wellness Modules
- Avatar Yoga, Breathing Exercises, Meditations (custom + guided)
- Aromatherapy (oil library + favorites)
- Herbology (herb cabinet + remedies)
- Elixirs & Meal Planning
- Acupressure Points & Reiki Aura Healing
- Daily Wellness Ritual Builder (with timer + active states)
- Sound Healing, Light Therapy, Mudras

### Mystical/Divination Systems
- Mayan Calendar, Numerology, Sacred Cardology
- Animal Totems, Dream Journal + Symbol Library
- Oracle readings, Cosmic Calendar

### AI Features
- **Sage** (AI Spiritual & Life Coach) - 6 coaching modes:
  - Spiritual Guidance, Life Coaching, Shadow Work
  - Manifestation, Healing Guide, **Dream Oracle** (NEW)
- AI Dream Interpretation (basic + deep cosmic analysis)

### Tracking & Progress
- Wellness Reports, Certifications
- Meditation History, Journey Progress
- User Uploads, Challenge System

## Completed in This Session (March 2026)

### Bug Fix: Daily Ritual Instant-Completion (P0)
- **Problem**: Clicking a ritual step instantly marked it complete, bypassing the actual exercise
- **Fix**: Redesigned `RitualStep` component with collapsed/active/completed states, countdown timer, Start/Pause/Skip controls, and deliberate "Mark Complete" button
- **Testing**: iteration_33.json - 100% pass (10/10 features)

### Feature: AI Dream Oracle Integration (P1)
- Added "Dream Oracle" as 6th coaching mode to Sage
- Dream picker UI showing logged dreams with metadata
- Deep AI analysis cross-referencing aura color, moon phase, numerology, and birth card
- Cosmic Profile Badge displaying the interpretation lens
- Follow-up chat maintaining dream context
- **Backend**: `GET /api/coach/dreams`, `POST /api/coach/analyze-dream`
- **Frontend**: `DreamPicker`, `CosmicProfileBadge` components
- **Testing**: iteration_34.json - 100% pass (10/10 features)

## Key Endpoints
- Auth: POST /api/auth/login, POST /api/auth/register
- Coach: POST /api/coach/chat, POST /api/coach/analyze-dream, GET /api/coach/dreams
- Ritual: GET /api/daily-ritual/generate, POST /api/daily-ritual/complete-step
- Dreams: POST /api/dreams, GET /api/dreams, POST /api/dreams/interpret

## DB Collections
- users, profiles, coach_sessions, daily_rituals, dreams, moods, streaks
- yoga_sessions, custom_meditations, aura_readings, reiki_sessions, acupressure_sessions
- aroma_favorites, herb_cabinet, meal_logs, journal, certifications, user_uploads

## Test Credentials
- Email: test@test.com, Password: password

## Backlog / Future Tasks
- P2: Polish/refine Acupressure, Reiki, Cosmic Calendar based on user feedback
- P3: Additional integrations or features as requested by user

## Critical Technical Notes
- `emergentintegrations` `send_message` returns `str`, not an object with `.text`
- All new routes go in `/app/backend/routes/` and are included via `app.include_router()`
- MongoDB `_id` must be excluded from all responses
