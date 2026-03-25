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

### Daily Wisdom (NEW - Phase 25)
- **Dashboard Widget**: Daily quote + teaching from a different spiritual master each day
- **Deterministic**: Same wisdom per day using day-of-year seed
- **Clickable**: Navigates to /teachings for deeper study
- **Shows**: Teacher name, tradition, quote, teaching title, practice suggestion

### Thoth / Ancient Egyptian Mysticism (NEW - Phase 25)
- **11th Spiritual Teacher**: Thoth / Hermes Trismegistus (Ancient Egyptian Mysticism / Hermeticism)
- **5 Teachings**: The Emerald Tablet, The Seven Hermetic Principles, The Book of Coming Forth by Day, The Divine Mind (Nous), The Great Work (Spiritual Alchemy)
- **8 Wisdom Quotes**: Including "As above, so below", "The lips of wisdom are closed, except to the ears of understanding"
- **2 New Themes**: Mysticism & Alchemy, Sacred Transformation

### Spiritual Teachings Study Section (Phase 24)
- **11 Spiritual Teachers**: Buddha, Jesus, Muhammad, Krishna, Lao Tzu, Rumi, Thich Nhat Hanh, Yogananda, Ram Dass, Alan Watts, Thoth
- **49 Deep Teachings** with practices, **78+ Wisdom Quotes**
- **11 Themes** for cross-teacher exploration
- **AI Guided Contemplation** (GPT-5.2), **Audio Narration** (TTS)

### Avatar Integration in Yoga (Phase 24)
- YogaAvatarMini with pose-adaptive silhouette during sequences

### 3D Holographic Avatar Creator (Phase 23)
- Canvas-based 3D Avatar with full customization

### Yoga Module (Phase 23)
- 7 Yoga Styles with sequences and poses

### 3D Holographic Guided Meditation (Phase 22)
- AI Script Generation, Holographic 3D Mode, Auto-Narrated Segments

### Quick Meditation Widget (Phase 22)
- Floating button, 4 healing frequencies, 30-second sessions

### Sacred Cardology (Phase 21) & Mayan Astrology (Phase 21)
### Social Networking & Daily Challenges (Phase 20)
### Previous: Applied Evolution, Progressive Learning, Gamification, Multi-language, PWA

## Key API Endpoints
- `/api/teachings/daily-wisdom` — deterministic daily wisdom
- `/api/teachings/teachers`, `/api/teachings/teacher/{id}`, `/api/teachings/themes`, `/api/teachings/contemplate`
- `/api/yoga/styles`, `/api/yoga/style/{id}`, `/api/yoga/complete`
- `/api/avatar` (GET/POST)
- `/api/guided-experience/generate`
- `/api/cardology/*`, `/api/mayan/*`, `/api/daily-challenge/*`
- `/api/users/discover`, `/api/friends/*`, `/api/messages/*`

## Backlog
- P1: Backend refactoring (server.py -> modular APIRouter files — 5200+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
- P2: Numerology readings (life path, destiny, soul urge)
