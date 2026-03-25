# The Cosmic Collective - PRD

## Original Problem Statement
Build a full-stack wellness platform ("positive energy bar") — a mobile wellness cafe that brings high-frequency services directly to people for stress relief, enlightenment, and conscious experience enhancement.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, PWA, Canvas API
- **Backend**: FastAPI, Python, asyncio
- **Database**: MongoDB
- **AI**: GPT-5.2 + TTS-1-HD via emergentintegrations (Emergent LLM Key)
- **Image Gen**: Gemini Nano Banana

## All Implemented Features

### Core Wellness Tools
- JWT Auth, Breathing, Meditation, Affirmations, Mood Tracker, Journal, Dashboard
- Soundscapes, Frequencies, Exercises, Nourishment, Daily Rituals
- Community, Challenges, Oracle Divination, Profiles
- Mudras, Yantra, Tantra, Videos, Classes
- Light Therapy, Zen Garden, Ho'oponopono, Mantras

### Sacred Cardology — Robert Lee Camp System (Phase 26-27)
- **Magi Formula**: Solar Value = 55 - (2 x month + day)
- **Yearly Spread** (NEW Phase 27): 7 planetary periods (Mercury through Neptune), 52 days each from birthday
  - Shows birth card, age, card year, period cards, current period highlight with "Now" badge
  - Each period: planet, focus area, date range, card with meaning
- Birth Card, Daily Card, Love Compatibility — all using correct Magi Formula

### Wisdom Journal (Phase 26)
- Personal reflections linked to spiritual teachers/teachings/quotes, CRUD, MongoDB persistence

### Numerology Module (Phase 26)
- 5 Core Numbers, Compatibility, Master Numbers 11/22/33

### Daily Wisdom (Phase 25), Thoth/Egyptian Mysticism (Phase 25)
### Spiritual Teachings (Phase 24) — 11 Teachers, 49 Teachings, 78+ Quotes, 11 Themes
### Avatar in Yoga (Phase 24), 3D Avatar Creator (Phase 23), Yoga Module (Phase 23)
### 3D Holographic Guided Meditation (Phase 22), Quick Meditation Widget (Phase 22)
### Mayan Astrology (Phase 21)
### Social Networking & Daily Challenges (Phase 20)
### Previous: Applied Evolution, Progressive Learning, Gamification, Multi-language, PWA

## Key API Endpoints
- `/api/cardology/yearly-spread` — 7 planetary period cards for current year
- `/api/cardology/birth-card`, `/api/cardology/daily-card`, `/api/cardology/compatibility`
- `/api/wisdom-journal` (GET/POST/DELETE), `/api/numerology/calculate`, `/api/numerology/compatibility`
- `/api/teachings/*`, `/api/yoga/*`, `/api/avatar`, `/api/guided-experience/generate`
- `/api/mayan/*`, `/api/daily-challenge/*`, `/api/users/discover`, `/api/friends/*`, `/api/messages/*`

## Backlog
- P1: Backend refactoring (server.py -> modular APIRouter files — 5200+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
