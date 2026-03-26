# The Cosmic Collective - PRD

## Original Problem Statement
Build a full-stack wellness platform — an immersive spiritual & wellness companion blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, healing modalities, and conscious nourishment.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, Canvas API
- **Backend**: FastAPI, Python — **37 modular route files** in `/app/backend/routes/`
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations (Emergent LLM Key)

## Architecture
```
/app/backend/
├── server.py          # Slim entrypoint (~75 lines)
├── deps.py            # Shared: db, auth, LLM key, create_activity
├── models.py          # All Pydantic models
├── routes/            # 37 modular route files
│   ├── Core: auth, wellness, dashboard, challenges, profiles
│   ├── Spirit: oracle, practices, teachings, meditations, journey, knowledge
│   ├── Body: avatar_yoga, acupressure, meals
│   ├── Energy: reiki, aromatherapy, herbology, elixirs
│   ├── Mind: numerology, cardology, mayan, nature (totems/dreams/green)
│   ├── Social: community, social, gamification, daily_challenges
│   ├── Media: media, learning, rituals, plants, recommendations
│   ├── New: cosmic_calendar, wellness_reports, meditation_history
│   ├── New: uploads, discover, daily_ritual
└── data/              # Static data (mudras, yantras, tantra)
```

## All Implemented Features (37 modules)

### Personalization Engine
- **Daily Wellness Ritual Builder** — Adaptive morning/evening rituals based on mood, streak, history
- **Try Something New** — Discovery engine tracking 23+ features, mood-based recommendations
- **Cosmic Calendar** — Daily energetic dashboard: Numerology + Moon Phase + Mayan Tzolk'in + Cardology

### Divination & Mystical Systems
- Sacred Cardology (Robert Lee Camp Magi Formula), Mayan Astrology, Numerology
- Oracle Divination (Tarot, I Ching, Zodiac), Animal Totems, Dream Interpretation

### Healing Modalities
- Acupressure (10 points, 6 routines), Reiki & Aura Energy (AI-powered readings)
- Aromatherapy (12 oils, 8 blends), Herbology (12 herbs, body system filter)

### Body & Movement
- Yoga (7 styles), 3D Holographic Avatar, Breathing, Exercises, Mudras

### Nourishment
- Elixirs & Drinks (10 recipes, 5 categories), Meal Planning (5 plans, AI suggestions)

### Mind & Wisdom
- Spiritual Teachings (11 Teachers), Wisdom Journal, Green/Nature Journal
- Meditation History & Logging, Wellness Reports (weekly/monthly)

### Community & Growth
- Social Networking, Certifications, User Media Library (audio/video uploads)
- Daily Challenges, Gamification, Streaks, Mantras, Frequencies
- Light Therapy, Zen Garden, Ho'oponopono, Rituals

## Credentials
- Test: `test@test.com` / `password`

## Backlog
- P3: Push notifications for daily rituals
- P3: Guided audio meditations with TTS
- P3: Social sharing of cosmic calendar readings
- P3: Community leaderboards
