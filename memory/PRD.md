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
├── server.py          # Slim entry point (~80 lines)
├── deps.py            # Shared dependencies
├── models.py          # Pydantic models
└── routes/            # 27+ modular route files
    └── cosmic_context.py  # NEW: Unified cosmic API + dream patterns

/app/frontend/src/
├── App.js
├── context/AuthContext.js
├── components/
│   ├── Navigation.js
│   └── CosmicBanner.js    # NEW: Shared cosmic interconnection component
└── pages/                  # All feature pages (interconnected)
```

## Implemented Features (All Tested & Working)

### Core Platform
- User auth (JWT), profiles, avatars
- Dashboard with mood tracking, streaks, gamification
- Community features, social, messaging

### Wellness Modules
- Avatar Yoga, Breathing Exercises, Meditations (custom + guided)
- Aromatherapy (oil library + favorites) — with cosmic banner
- Herbology (herb cabinet + remedies) — with cosmic banner
- Elixirs & Meal Planning
- Acupressure Points — with cosmic banner
- Reiki Aura Healing — with cosmic banner
- Daily Wellness Ritual Builder (with timer + active states) — with cosmic banner
- Sound Healing, Light Therapy, Mudras

### Mystical/Divination Systems
- Mayan Calendar — with cross-links to Calendar, Dreams, Numerology, Ritual
- Numerology — with cross-links to Calendar, Mayan, Coach, Ritual
- Sacred Cardology
- Animal Totems, Dream Journal + Symbol Library
- Oracle readings

### Cosmic Interconnection System (NEW)
- **Cosmic Context API** (`GET /api/cosmic-context`): Returns unified snapshot — Mayan energy, moon phase, numerology, aura color, streak, mood, recent dreams, recurring symbols, and personalized practice suggestions
- **Dream Patterns Dashboard** (`GET /api/dreams/patterns`): Recurring symbol frequency, moon-symbol correlations, moon phase mood analysis, lucid dream stats, vividness trends, and auto-generated insights
- **CosmicBanner Component**: Shared across Dreams, Daily Ritual, Aromatherapy, Herbology, Reiki, Acupressure — shows today's cosmic alignment with clickable navigation to Mayan, Numerology, Calendar
- **Cosmic Calendar Hub**: Enhanced with Today's Cosmic Practices (element-based yoga, oil, herb, acupoint suggestions), Recent Dreams section, and explore links on every card
- **Cross-Page Connected Systems**: Mayan page links to Calendar, Dreams, Numerology, Ritual. Numerology page links to Calendar, Mayan, Coach, Ritual

### AI Features
- **Sage** (AI Spiritual & Life Coach) - 6 coaching modes:
  - Spiritual Guidance, Life Coaching, Shadow Work
  - Manifestation, Healing Guide, Dream Oracle
- AI Dream Interpretation (basic + deep cosmic analysis with aura/moon/numerology cross-reference)

### Tracking & Progress
- Wellness Reports, Certifications
- Meditation History, Journey Progress
- User Uploads, Challenge System

## Key Routes
| Frontend Path | Page |
|---|---|
| /cosmic-calendar | Cosmic Calendar Hub |
| /daily-ritual | Daily Wellness Ritual |
| /coach | Sage AI Coach |
| /dreams | Dream Journal + Patterns |
| /mayan | Mayan Astrology |
| /numerology | Numerology |
| /aromatherapy | Aromatherapy |
| /herbology | Herbology |
| /reiki | Reiki |
| /acupressure | Acupressure |

## Key Endpoints
- `GET /api/cosmic-context` — Unified cosmic snapshot (authenticated)
- `GET /api/dreams/patterns` — Dream pattern analytics (authenticated)
- `POST /api/coach/analyze-dream` — Deep AI dream analysis
- `GET /api/coach/dreams` — Dreams for oracle picker
- `POST /api/coach/chat` — Coach conversation
- `GET /api/cosmic-calendar/today` — Calendar data (public)
- `GET /api/daily-ritual/generate` — Generate personalized ritual
- `POST /api/daily-ritual/complete-step` — Complete a ritual step

## Test Credentials
- Email: test@test.com, Password: password

## Backlog / Future Tasks
- P2: Polish/refine based on user feedback
- P3: Additional integrations or features as requested

## Critical Technical Notes
- `emergentintegrations` `send_message` returns `str`, not an object with `.text`
- All new routes go in `/app/backend/routes/` and are included via `app.include_router()`
- MongoDB `_id` must be excluded from all responses
- Frontend routes: `/cosmic-calendar`, `/coach`, `/auth`, `/daily-ritual`
