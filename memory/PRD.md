# The Cosmic Collective - PRD

## Original Problem Statement
Build a full-stack wellness platform ("positive energy bar") — a mobile wellness cafe that brings high-frequency services directly to people for stress relief, enlightenment, and conscious experience enhancement. The platform features mystical calculators, daily gamification, 3D holographic avatar creation, Yoga, spiritual teachings, interactive journals, aromatherapy, herbology, elixirs/drinks, and meal planning.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, PWA, Canvas API
- **Backend**: FastAPI, Python, asyncio — **MODULAR ROUTES** (29 route files)
- **Database**: MongoDB
- **AI**: GPT-5.2 + TTS-1-HD via emergentintegrations (Emergent LLM Key)
- **Image Gen**: Gemini Nano Banana

## Architecture (Post-Refactor)
```
/app/backend/
├── server.py          # 62 lines - slim entrypoint
├── deps.py            # Shared: db, auth, LLM key, create_activity
├── models.py          # All Pydantic models
├── routes/            # 29 modular route files
│   ├── auth.py, wellness.py, dashboard.py, challenges.py
│   ├── profiles.py, oracle.py, practices.py, media.py
│   ├── meditations.py, journey.py, knowledge.py, community.py
│   ├── rituals.py, plants.py, recommendations.py, learning.py
│   ├── gamification.py, avatar_yoga.py, mayan.py, cardology.py
│   ├── daily_challenges.py, social.py, teachings.py, numerology.py
│   ├── nature.py, aromatherapy.py, herbology.py, elixirs.py, meals.py
└── data/              # Static data (mudras, yantras, tantra)
```

## All Implemented Features

### Core Wellness Tools
- JWT Auth, Breathing, Meditation, Affirmations, Mood Tracker, Journal, Dashboard
- Soundscapes, Frequencies, Exercises, Nourishment, Daily Rituals
- Community, Challenges, Oracle Divination, Profiles
- Mudras, Yantra, Tantra, Videos, Classes
- Light Therapy, Zen Garden, Ho'oponopono, Mantras

### Sacred Cardology — Robert Lee Camp System
- **Magi Formula**: Solar Value = 55 - (2 x month + day)
- **Yearly Spread**: 7 planetary periods, 52 days each from birthday
- Birth Card, Daily Card, Love Compatibility

### Aromatherapy (Phase 29 - NEW)
- 12 essential oils with chakra, element, uses, emotional & spiritual properties
- 8 curated blend recipes with ratios and methods
- User favorites system with personal notes

### Herbology (Phase 29 - NEW)
- 12 herbs with Latin names, properties, systems, preparations, dosage
- Filter by body system
- Personal herb cabinet

### Elixirs & Drinks (Phase 29 - NEW)
- 10 healing drink recipes across 5 categories (lattes, teas, tonics, smoothies, ceremonial)
- Full ingredients, instructions, tradition, and spiritual intention
- User favorites

### Meal Planning (Phase 29 - NEW)
- 5 themed meal plans (Energizing, Calming, Detox, Grounding, Heart-Opening)
- Each plan: breakfast, lunch, snack, dinner with items and intentions
- AI-powered meal suggestions (GPT-5.2)
- Food journal with mindful eating tracking

### Other Completed Features
- Wisdom Journal, Numerology Module (5 Core Numbers + Compatibility)
- Daily Wisdom, Thoth/Egyptian Mysticism teachings
- Spiritual Teachings (11 Teachers, 49 Teachings, 78+ Quotes, 11 Themes)
- 3D Holographic Avatar Creator + Yoga Module (7 styles)
- Animal Totems (12 birth totems + 8 spirit animals)
- Dream Interpretation (41 symbols + AI interpretation)
- Green/Nature Journal
- Mayan Astrology (Tzolk'in)
- Social Networking & Daily Challenges
- Applied Evolution, Progressive Learning, Gamification, Multi-language, PWA

## Key API Endpoints
- `/api/aromatherapy/oils`, `/api/aromatherapy/blends`, `/api/aromatherapy/oil/{id}`
- `/api/herbology/herbs`, `/api/herbology/herb/{id}`, `/api/herbology/by-system/{system}`
- `/api/elixirs/all`, `/api/elixirs/{id}`, `/api/elixirs/category/{cat}`
- `/api/meals/plans`, `/api/meals/plan/{id}`, `/api/meals/log`, `/api/meals/suggest`
- `/api/cardology/*`, `/api/teachings/*`, `/api/yoga/*`, `/api/avatar`
- `/api/animal-totems/*`, `/api/dreams/*`, `/api/green-journal/*`
- `/api/mayan/*`, `/api/numerology/*`, `/api/oracle/*`

## Backlog
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
