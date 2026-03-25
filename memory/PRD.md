# The Cosmic Collective - Positive Energy Bar

## Original Problem Statement
Build a full-stack application for a "positive energy bar to help people de-stress and seek enlightenment and enhance conscious experiences".

## Tech Stack
- **Frontend**: React (with React.lazy/Suspense code splitting), Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: FastAPI, Python (with asyncio.gather for concurrent DB queries)
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations (Emergent LLM Key)
- **Audio**: Web Audio API (oscillators, noise generators, filters), OpenAI TTS (tts-1-hd)

## Core Architecture
```
/app/
├── backend/
│   ├── server.py         # Monolithic FastAPI (all models, routes, static data)
│   ├── data/             # External static data (mudras, yantras, tantra)
│   └── tests/            # pytest test files
├── frontend/
│   ├── src/
│   │   ├── App.js        # Router with lazy-loaded pages (Suspense)
│   │   ├── components/
│   │   │   ├── Navigation.js
│   │   │   ├── NarrationPlayer.js
│   │   │   └── DeepDive.js
│   │   ├── context/AuthContext.js
│   │   └── pages/        # 25+ page components (lazy loaded)
```

## Implemented Features

### Phase 1-8 — Core MVP through Rich Content
- JWT Auth, Breathing, Meditation, Affirmations, Mood Tracker, Journal, Dashboard
- Soundscapes, Frequencies, Exercises, Nourishment
- Daily Rituals, Community, Challenges
- Oracle Divination, Personalized Profiles
- Mudras, Yantra, Tantra, Videos, Classes
- Creation Studio, AI Knowledge, Voice Narration
- Performance optimization

### Phase 9-11 — Visual & Sensory Overhaul
- Cosmic canvas background, ambient audio, interaction sounds
- Glassmorphism, aurora effects, page transitions
- CelebrationBurst, Light Therapy, Zen Garden (5 tabs)

### Phase 12-15 — Customization & Spiritual Tools
- Guided Meditations (6 built-in + Build Your Own)
- Custom Breathing, Affirmations, Soundscapes (Build Your Own)
- Mantras page, Ho'oponopono page
- Beginner's Journey (5-stage, 20-lesson guided path)

### Phase 16 — Applied Evolution (Feb 2026)
- **Recommendation Engine**: Personalized "For You" section on Dashboard
- **Advanced Progressive Learning Modules** (`/learn`): 4-level structured curriculum

### Phase 17 — User Experience & Conversion (Feb 2026)
- **Quick Reset Flow**: "How do you feel?" modal on Landing page with 11 feelings (5 positive + 6 challenge states). Each feeling maps to a personalized 5-min session: frequency + mindset tool + nourishment recommendation.
- **Social Proof**: 6 beta tester testimonials on Landing page
- **Founding 100 Waitlist**: Email collection for physical Enlightenment Cafe opening Late 2026. Backend stores in MongoDB `waitlist` collection with position tracking.
- **Culinary Science Section**: 4 engineering breakdown cards on Nourishment page (flash-chilling espresso, precise macros, piperine-curcumin synergy, bone broth protocol)
- **Privacy Policy & Wellness Disclaimer**: Footer modals with comprehensive content
- **PWA Manifest**: Proper manifest.json + apple-mobile-web-app meta tags for Add to Home Screen

## Key API Endpoints
- `/api/health` - service health check
- `/api/auth/` - register, login, me
- `/api/dashboard/stats` - user statistics
- `/api/recommendations` - personalized tool recommendations
- `/api/learning/modules` - progressive learning modules with progress
- `/api/learning/complete-lesson` - mark learning lesson complete
- `/api/quick-reset/{feeling}` - personalized 5-min reset flow (NEW)
- `/api/waitlist/join` - join founding 100 waitlist (NEW)
- `/api/waitlist/count` - get waitlist count (NEW)
- `/api/moods/`, `/api/journal/` - tracking
- All other existing endpoints preserved

## Database Collections
- users, moods, journal_entries, rituals, ritual_completions
- posts, follows, challenges, challenge_participants
- enrollments, certifications
- creations, knowledge_cache, affirmations
- custom_meditations, custom_breathing, custom_affirmations, custom_soundscapes, custom_mantras
- zen_plants, journey_progress, learning_progress
- waitlist (NEW)

## Backlog (P0/P1/P2)
- P1: Display user-created content in existing pages (integrate /api/creations/mine)
- P1: Backend refactoring (split server.py into APIRouter modules)
- P1: Certifications page/section in user profile
- P2: 3-Click Rule navigation audit
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
