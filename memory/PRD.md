# The Cosmic Collective - PRD

## Original Problem Statement
Build a full-stack wellness platform ("positive energy bar") for stress relief, enlightenment, and conscious experience enhancement.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, PWA
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

### Build Your Own (AI-Powered)
- Custom Breathing, Meditations, Affirmations, Soundscapes, Mantras

### Spiritual Tools
- Mantras, Ho'oponopono

### Learning
- Beginner's Journey (5 stages, 20 lessons)
- Advanced Progressive Learning Modules (4 levels, 16 lessons)

### Applied Evolution
- Recommendation Engine ("For You" on Dashboard — mood, time, engagement-based)
- Daily Streak Tracker with auto check-in, best streak, total active days

### Wellness Games (NEW - Phase 19)
- **Sacred Symbols** (Memory Match) — Enhances Memory
- **Breath of Life** (Breathing Bubble) — Deep Relaxation
- **Color Harmony** (Palette Sorter) — Uplifts Mood
- **Inner Rhythm** (Pattern Recall) — Reduces Stress
- Score tracking with personal bests per game

### UX & Conversion
- Quick Reset Flow (11 feelings → personalized frequency + tool + nourishment)
- Social Proof (6 testimonials)
- Founding 100 Waitlist
- Culinary Science Section
- Privacy Policy & Wellness Disclaimer
- PWA Manifest

### Profile & Privacy
- Visibility: Public / Friends Only / Private
- Restricted profile view for unauthorized viewers

### Multi-Language Support (NEW - Phase 19)
- 6 languages: English, Spanish, French, Hindi, Japanese, Portuguese
- Language selector on Landing page + Navigation bar
- localStorage persistence
- Translations: nav, dashboard, landing, quickReset, games, learn, profile, common

## Key API Endpoints
- `/api/auth/` - register, login, me
- `/api/dashboard/stats`, `/api/recommendations` - analytics
- `/api/streak`, `/api/streak/checkin` - daily streak
- `/api/games/score`, `/api/games/scores` - game score tracking
- `/api/learning/modules`, `/api/learning/complete-lesson`
- `/api/quick-reset/{feeling}` - personalized reset
- `/api/waitlist/join`, `/api/waitlist/count`
- `/api/profile/me`, `/api/profile/customize`, `/api/profile/public/{id}`
- All CRUD for moods, journal, rituals, community, challenges, etc.

## Database Collections
- users, moods, journal_entries, rituals, ritual_completions
- posts, follows, challenges, challenge_participants
- enrollments, certifications, creations, affirmations
- custom_meditations, custom_breathing, custom_affirmations, custom_soundscapes, custom_mantras
- zen_plants, journey_progress, learning_progress
- waitlist, streaks, game_scores, profiles

## Backlog
- P1: Backend refactoring (server.py → modular APIRouter files — 3100+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
