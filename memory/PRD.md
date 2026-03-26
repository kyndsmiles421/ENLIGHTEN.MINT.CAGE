# The Cosmic Collective - PRD

## Original Problem Statement
Build a full-stack wellness platform — an immersive spiritual & wellness companion blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, healing modalities, and conscious nourishment.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, Canvas API
- **Backend**: FastAPI, Python — **38 modular route files** in `/app/backend/routes/`
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations (Emergent LLM Key)

## Architecture
```
/app/backend/
├── server.py          # Slim entrypoint (~80 lines)
├── deps.py            # Shared: db, auth, LLM key, create_activity
├── models.py          # All Pydantic models
├── routes/            # 38 modular route files
│   ├── Core: auth, wellness, dashboard, challenges, profiles
│   ├── Spirit: oracle, practices, teachings, meditations, journey, knowledge
│   ├── Body: avatar_yoga, acupressure, meals
│   ├── Energy: reiki, aromatherapy, herbology, elixirs
│   ├── Mind: numerology, cardology, mayan, nature (totems/dreams/green)
│   ├── Social: community, social, gamification, daily_challenges
│   ├── Media: media, learning, rituals, plants, recommendations
│   ├── Intelligence: coach, daily_ritual, discover
│   ├── Analytics: cosmic_calendar, wellness_reports, meditation_history
│   └── Storage: uploads
└── data/              # Static data (mudras, yantras, tantra)
```

## All Implemented Features (38 modules)

### AI Spiritual Coach — "Sage" (Phase 32 - NEW)
- **5 coaching modes**: Spiritual Guidance, Life Coaching, Shadow Work, Manifestation, Healing Guide
- **Deep personalization**: reads mood patterns, aura color, practice history, streak, birth data, favorite herbs/oils
- **Persistent sessions**: multi-turn conversations stored in MongoDB
- **Context-aware recommendations**: suggests specific practices, oils, herbs, acupressure points

### Personalization Engine
- Daily Wellness Ritual Builder (adaptive morning/evening), Try Something New discovery engine
- Cosmic Calendar (Numerology + Moon + Mayan + Cardology daily overlay)

### Divination & Mystical Systems
- Sacred Cardology (Magi Formula), Mayan Astrology, Numerology, Oracle, Animal Totems, Dreams

### Healing Modalities
- Acupressure (10 points, 6 routines), Reiki & Aura (AI readings), Aromatherapy, Herbology

### Body & Movement
- Yoga (7 styles), 3D Avatar, Breathing, Exercises, Mudras

### Nourishment
- Elixirs (10 recipes, 5 categories), Meal Planning (5 plans, AI suggestions)

### Analytics & Growth
- Wellness Reports (weekly/monthly), Meditation History, Certifications, Media Library

### Community & More
- Social Networking, Challenges, Mantras, Frequencies, Light Therapy, Zen Garden, Ho'oponopono, Rituals

## Credentials
- Test: `test@test.com` / `password`

## Backlog
- P3: Push notifications for daily rituals
- P3: Guided audio meditations with TTS
- P3: Social sharing of cosmic calendar readings
- P3: Community leaderboards
