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
- Light Therapy, Zen Garden (Koi Pond, Sand, Lanterns, Plants, Rain)
- Ho'oponopono, Mantras

### Wisdom Journal (NEW - Phase 26)
- **Personal Reflections**: Write reflections linked to any spiritual teacher/teaching/quote
- **Teacher Selector**: Dropdown with all 11 teachers, dynamically loads teachings & quotes
- **CRUD Operations**: Create, read, delete reflections with timestamps
- **MongoDB Persistence**: Entries stored per user in `wisdom_journal` collection

### Numerology Module (NEW - Phase 26)
- **5 Core Numbers**: Life Path, Destiny, Soul Urge, Personality, Birthday
- **Pythagorean System**: Full letter-to-number mapping with master number preservation (11, 22, 33)
- **13 Life Path Meanings**: Detailed descriptions with title, element, strengths, challenges, spiritual lesson
- **Compatibility Calculator**: Harmony score between two people based on life paths
- **Personal Reading & Compatibility Tabs**: Clean form interface with beautiful results display

### Daily Wisdom (Phase 25)
- Dashboard widget with daily quote from rotating spiritual master

### Thoth / Ancient Egyptian Mysticism (Phase 25)
- 11th teacher: 5 teachings (Emerald Tablet, Hermetic Principles, Book of Coming Forth by Day, Nous, Alchemy), 8 quotes, 2 new themes

### Spiritual Teachings Study Section (Phase 24)
- 11 Teachers, 49 Teachings, 78+ Quotes, 11 Themes, AI Contemplation, Audio Narration

### Avatar in Yoga (Phase 24), 3D Avatar Creator (Phase 23), Yoga Module (Phase 23)
### 3D Holographic Guided Meditation (Phase 22), Quick Meditation Widget (Phase 22)
### Sacred Cardology (Phase 21), Mayan Astrology (Phase 21)
### Social Networking & Daily Challenges (Phase 20)
### Previous: Applied Evolution, Progressive Learning, Gamification, Multi-language, PWA

## Key API Endpoints
- `/api/wisdom-journal` (GET/POST/DELETE)
- `/api/numerology/calculate`, `/api/numerology/compatibility`
- `/api/teachings/daily-wisdom`, `/api/teachings/teachers`, `/api/teachings/teacher/{id}`, `/api/teachings/contemplate`
- `/api/yoga/styles`, `/api/yoga/style/{id}`, `/api/yoga/complete`
- `/api/avatar` (GET/POST)
- `/api/guided-experience/generate`
- `/api/cardology/*`, `/api/mayan/*`, `/api/daily-challenge/*`

## Backlog
- P1: Backend refactoring (server.py -> modular APIRouter files — 5400+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
