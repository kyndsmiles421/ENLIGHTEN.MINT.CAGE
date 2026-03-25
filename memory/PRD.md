# Cosmic Zen - Positive Energy Bar

## Original Problem Statement
Build a full-stack application for a "positive energy bar to help people de-stress and seek enlightenment and enhance conscious experiences".

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations (Emergent LLM Key)
- **Audio**: Web Audio API (oscillators, noise generators, filters)

## Core Architecture
```
/app/
├── backend/
│   ├── server.py         # Monolithic FastAPI (all models, routes, static data)
│   └── tests/            # pytest test files
├── frontend/
│   ├── src/
│   │   ├── App.js        # Router (25 routes)
│   │   ├── components/Navigation.js  # Primary nav + "More" dropdown
│   │   ├── context/AuthContext.js
│   │   └── pages/        # 22 page components
```

## Implemented Features (All Tested & Working)

### Phase 1 - Core MVP
- JWT Authentication (register/login)
- Breathing exercises (4-7-8, Box, Wim Hof)
- Meditation timer with ambient sound (Web Audio)
- AI-powered affirmations (GPT-5.2)
- Mood tracker with emotion logging
- Journal with entries
- Dashboard with stats & quick actions

### Phase 2 - Wellness & Content
- Soundscapes mixer (9 layerable sounds, real Web Audio API)
- Frequencies (12 solfeggio/binaural tones, real oscillator audio)
- Exercises (Qigong & Tai Chi)
- Nourishment (energy-boosting foods)

### Phase 3 - Engagement & Social
- Daily Ritual builder
- Community feed (posts, likes, comments)
- Community Challenges with streaks & leaderboards

### Phase 4 - Spiritual Tools & Personalization
- Oracle Divination (Tarot, Western Astrology, Chinese Astrology, I Ching, Sacred Geometry) - AI powered
- Personalized Profile Pages (MySpace-style: cover photos, themes, music tones, avatars)
- Public profile viewing (/profile/:userId)

### Phase 5 - Spiritual Practice & Learning (Latest)
- **Mudras**: 9 sacred hand gestures with benefits, chakras, practice instructions
- **Yantra**: 7 sacred geometric diagrams with SVG visuals, mantras, meditation guidance
- **Tantra**: 6 practices (energy work, breathwork, mantra) with step-by-step instructions
- **Videos**: 10 guided practice videos with category filters (placeholder thumbnails)
- **Classes**: 5 structured courses with lessons, enrollment, progress tracking
- **Certifications**: Auto-issued when all lessons completed, displayed in profile
- **Audio Fix**: Real Web Audio API for Frequencies, Soundscapes, and Meditation ambient sounds

## Key API Endpoints
- `/api/auth/` - register, login, me
- `/api/dashboard/stats` - user statistics
- `/api/moods/`, `/api/journal/` - tracking
- `/api/affirmations/generate` - AI affirmations
- `/api/rituals/` - CRUD + completion
- `/api/community/` - feed, posts, likes, comments, follow
- `/api/challenges/` - join, checkin, leaderboard
- `/api/profile/` - customize, me, public/{userId}, covers
- `/api/oracle/` - reading, zodiac, chinese-zodiac, sacred-geometry
- `/api/mudras`, `/api/yantras`, `/api/tantra` - spiritual tools
- `/api/videos`, `/api/classes` - content & learning
- `/api/classes/enroll`, `/api/classes/complete-lesson` - enrollment
- `/api/certifications/my` - user certifications
- `/api/frequencies` - healing tones

## Database Collections
- users, moods, journal_entries, rituals, ritual_history
- posts, follows, challenges, challenge_participants
- enrollments, certifications

## Backlog (P1/P2)
- P1: Guided meditation audio narration
- P1: Exercise video demonstrations (real videos)
- P2: Weekly/monthly wellness reports
- P2: Backend refactoring (split server.py into APIRouter modules)
- P2: Meditation session history tracking
- P2: Real video content integration for Videos page
