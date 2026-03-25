# The Cosmic Collective - Positive Energy Bar

## Original Problem Statement
Build a full-stack application for a "positive energy bar to help people de-stress and seek enlightenment and enhance conscious experiences".

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, PWA manifest
- **Backend**: FastAPI, Python, asyncio
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations (Emergent LLM Key)
- **Audio**: Web Audio API, OpenAI TTS (tts-1-hd)

## Implemented Features

### Core Wellness Tools
- Breathing, Meditation, Affirmations, Mood Tracker, Journal, Dashboard
- Soundscapes, Frequencies, Exercises, Nourishment
- Daily Rituals, Community, Challenges
- Oracle Divination, Personalized Profiles
- Mudras, Yantra, Tantra, Videos, Classes
- Creation Studio, AI Knowledge, Voice Narration
- Light Therapy, Zen Garden (5 tabs: Koi Pond, Sand, Lanterns, Plants, Rain)

### Build Your Own (AI-Powered)
- Custom Breathing, Meditations, Affirmations, Soundscapes, Mantras

### Spiritual Tools
- Mantras page, Ho'oponopono page

### Learning & Onboarding
- Beginner's Journey (5-stage, 20-lesson guided path)
- Advanced Progressive Learning Modules (4 levels, 16 lessons)

### Recommendation Engine
- Personalized "For You" section on Dashboard
- Mood-based, time-of-day, and engagement-based suggestions
- Engagement score tracking

### UX & Conversion (Phase 17)
- Quick Reset Flow ("How do you feel?" with 11 options — 5 positive, 6 challenge)
- Social Proof (6 beta tester testimonials)
- Founding 100 Waitlist (email collection)
- Culinary Science Section (4 engineering breakdown cards)
- Privacy Policy & Wellness Disclaimer (footer modals)
- PWA Manifest (Add to Home Screen)

### Profile & Privacy (Phase 18)
- Profile Visibility: Public / Friends Only / Private
- Friends = mutual followers (both follow each other)
- Restricted profile view for non-authorized viewers
- Visibility badge on own profile
- 3-Click Rule audit: all tools reachable in ≤2 clicks from nav
- Dashboard quick actions: 22 tools, all 1-click from Dashboard
- User-created content displays on respective tool pages (already working)

## Key API Endpoints
- `/api/auth/` - register, login, me
- `/api/profile/me`, `/api/profile/customize`, `/api/profile/public/{user_id}` - profile with visibility
- `/api/recommendations` - personalized recommendations
- `/api/learning/modules`, `/api/learning/complete-lesson` - progressive learning
- `/api/quick-reset/{feeling}` - 5-min personalized reset
- `/api/waitlist/join`, `/api/waitlist/count` - founding 100 waitlist
- All CRUD for moods, journal, rituals, community, challenges, etc.

## Backlog
- P1: Backend refactoring (split server.py into APIRouter modules — 3000+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
