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

### Spiritual Teachings Study Section (NEW - Phase 24)
- **10 Spiritual Teachers**: Buddha, Jesus, Muhammad, Krishna, Lao Tzu, Rumi, Thich Nhat Hanh, Yogananda, Ram Dass, Alan Watts
- **44 Deep Teachings**: Each teacher has 3-5 detailed study lessons with content, practice exercises
- **70+ Wisdom Quotes**: Rotating quote display per teacher
- **9 Themes**: Love, Suffering, Consciousness, Mindfulness, Surrender, Compassion, Impermanence, Nature, Simplicity
- **AI Guided Contemplation**: GPT-5.2 generates personalized contemplation sessions based on any teaching
- **Audio Narration**: Listen to teachings and contemplations via TTS
- **Search & Filter**: Search teachers by name/tradition, browse by theme
- **Teachers/Themes View Toggle**: Two ways to explore the wisdom library

### Avatar Integration in Yoga (NEW - Phase 24)
- **YogaAvatarMini**: User's custom holographic avatar displays alongside yoga sequences
- **Pose-Adaptive Silhouette**: Avatar automatically matches the current pose (warrior, lotus, standing)
- **Seamless Integration**: Uses saved avatar config (aura, body type, robe, glow, chakras)

### 3D Holographic Avatar Creator (Phase 23)
- Canvas-based 3D Avatar with customizable body type, aura, pose, robe, glow, particles, chakras, energy trails

### Yoga Module (Phase 23)
- 7 Yoga Styles (Hatha, Vinyasa, Kundalini, Yin, Restorative, Pranayama, Nidra) with sequences and poses

### 3D Holographic Guided Meditation (Phase 22)
- AI Script Generation, Holographic 3D Mode, Auto-Narrated Segments

### Quick Meditation Widget (Phase 22)
- Floating button, 4 healing frequencies, 30-second sessions

### Sacred Cardology (Phase 21)
- Birth Card Calculator, Daily Card, Love Compatibility

### Mayan Astrology (Phase 21)
- Birth Sign Calculator, Today's Energy, Galactic Compatibility

### Social Networking (Phase 20)
- Friends, Open Messaging, Message Privacy, User Discovery

### Daily Challenges (Phase 20)
- 30 rotating challenges, XP system, leaderboard

### Previous Features
- Applied Evolution, Progressive Learning, Gamification (streaks, 4 games)
- Multi-language (6 languages), PWA, Quick Reset Flow

## Key API Endpoints
- `/api/teachings/teachers`, `/api/teachings/teacher/{id}`, `/api/teachings/themes`, `/api/teachings/theme/{id}`, `/api/teachings/contemplate`
- `/api/yoga/styles`, `/api/yoga/style/{id}`, `/api/yoga/complete`, `/api/yoga/history`
- `/api/avatar` (GET/POST)
- `/api/guided-experience/generate`
- `/api/cardology/birth-card`, `/api/cardology/daily-card`, `/api/cardology/compatibility`
- `/api/mayan/birth-sign`, `/api/mayan/today`, `/api/mayan/compatibility`
- `/api/daily-challenge`, `/api/daily-challenge/complete`
- `/api/users/discover`, `/api/friends/*`, `/api/messages/*`
- `/api/tts/narrate`, `/api/profile/me`, `/api/profile/customize`

## Backlog
- P1: Backend refactoring (server.py -> modular APIRouter files — 5000+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
- P2: Numerology readings (life path, destiny, soul urge)
