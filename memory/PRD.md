# The Cosmic Collective - PRD

## Original Problem Statement
Build a full-stack wellness platform ("positive energy bar") — a mobile wellness cafe that brings high-frequency services directly to people for stress relief, enlightenment, and conscious experience enhancement. The platform features mystical calculators, daily gamification, 3D holographic avatar creation, Yoga, spiritual teachings, interactive journals, aromatherapy, herbology, elixirs/drinks, meal planning, acupressure, reiki/aura readings, personalized daily rituals, and a discovery engine.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, Canvas API
- **Backend**: FastAPI, Python — **33 modular route files** in `/app/backend/routes/`
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations (Emergent LLM Key) — used for aura readings, meal suggestions, dream interpretation, oracle readings

## Architecture
```
/app/backend/
├── server.py          # 70 lines - slim entrypoint
├── deps.py            # Shared: db, auth, LLM key, create_activity
├── models.py          # All Pydantic models
├── routes/            # 33 modular route files
│   ├── auth.py, wellness.py, dashboard.py, challenges.py
│   ├── profiles.py, oracle.py, practices.py, media.py
│   ├── meditations.py, journey.py, knowledge.py, community.py
│   ├── rituals.py, plants.py, recommendations.py, learning.py
│   ├── gamification.py, avatar_yoga.py, mayan.py, cardology.py
│   ├── daily_challenges.py, social.py, teachings.py, numerology.py
│   ├── nature.py, aromatherapy.py, herbology.py, elixirs.py, meals.py
│   ├── acupressure.py, reiki.py, discover.py, daily_ritual.py
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
- Magi Formula: Solar Value = 55 - (2 x month + day)
- Yearly Spread: 7 planetary periods, 52 days each
- Birth Card, Daily Card, Love Compatibility

### Aromatherapy (Phase 29)
- 12 essential oils with chakra, element, spiritual properties
- 8 curated blend recipes
- User favorites

### Herbology (Phase 29)
- 12 herbs with preparations, dosage, body system filter
- Personal herb cabinet

### Elixirs & Drinks (Phase 29)
- 10 healing drink recipes across 5 categories
- Full ingredients, instructions, tradition, intention

### Meal Planning (Phase 29)
- 5 themed meal plans (Energizing, Calming, Detox, Grounding, Heart-Opening)
- AI-powered meal suggestions (GPT-5.2)
- Food journal with mindful eating tracking

### Acupressure & Massage (Phase 30 - NEW)
- 10 acupressure points with meridian, element, technique, spiritual significance
- 6 healing routines (Stress Relief, Energy Boost, Deep Sleep, Headache, Emotional Balance, Immune Shield)
- Session logging and tracking

### Reiki & Aura Energy (Phase 30 - NEW)
- 7 chakras with frequencies, qualities, healing suggestions
- 10 Reiki hand positions with placement and intentions
- AI-powered personalized aura readings (GPT-5.2) based on mood history and birth data
- 8 aura color profiles with strengths, shadows, guidance
- Healing session logging

### Personalized Daily Wellness Ritual Builder (Phase 30 - NEW)
- Adaptive AI-generated morning and evening rituals
- Combines breathing, aromatherapy, yoga, reiki, acupressure, meditation, elixirs, journaling
- Personalization based on: mood patterns, experience level, streak, activity history
- Step-by-step completion tracking with progress bar
- 3 personalization levels: New, Growing, Deep

### Try Something New Discovery Engine (Phase 30 - NEW)
- Tracks exploration across 23 features
- Mood-based personalized recommendations
- Exploration progress bar with percentage
- Surfaces unexplored features to encourage platform discovery

### Other Completed Features
- Wisdom Journal, Numerology (5 Core Numbers + Compatibility)
- Daily Wisdom, Thoth/Egyptian Mysticism, Spiritual Teachings (11 Teachers)
- 3D Holographic Avatar Creator + Yoga Module (7 styles)
- Animal Totems, Dream Interpretation, Green/Nature Journal
- Mayan Astrology (Tzolk'in), Social Networking, Daily Challenges

## Backlog
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
