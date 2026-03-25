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
│   │   │   ├── Navigation.js      # Primary nav + "More" dropdown
│   │   │   ├── NarrationPlayer.js # TTS with voice selection
│   │   │   └── DeepDive.js        # AI knowledge modal
│   │   ├── context/AuthContext.js
│   │   ├── lib/api.js             # Shared axios config with timeout
│   │   └── pages/                 # 23 page components (lazy loaded)
```

## Implemented Features (All Tested & Working)

### Phase 1 - Core MVP
- JWT Authentication (register/login)
- Breathing exercises (5 patterns: Box, 4-7-8, Energizing, Wim Hof, Pranayama)
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
- Daily Ritual builder with templates
- Community feed (posts, likes, comments, follow)
- Community Challenges with streaks & leaderboards (7 challenges)

### Phase 4 - Spiritual Tools & Personalization
- Oracle Divination (Tarot, Western Astrology, Chinese Astrology, I Ching, Sacred Geometry)
- Personalized Profile Pages (MySpace-style)
- Public profile viewing (/profile/:userId)

### Phase 5 - Spiritual Practice & Learning
- Mudras (25 sacred hand gestures with AI Deep Dive)
- Yantra (9 sacred geometric diagrams with SVG, mantras, meditation)
- Tantra (10 practices: energy work, breathwork, mantra)
- Videos (10 guided practice videos with category filters)
- Classes (5 structured courses with lessons, enrollment, certifications)
- Audio across all pages: Web Audio API + OpenAI TTS (tts-1-hd) with voice selection

### Phase 9 - Mudras Visual Enhancement (Feb 2026)
- 25 unique AI-generated images for each mudra showing correct hand positions
- Embedded YouTube tutorial videos for each individual mudra
- New visual gallery layout with image cards (replaced generic Hand icon)
- Category filter buttons (All, Meditation, Healing, Energy, Devotional)
- Detail modal with 3 tabs: Overview, How to Practice, Watch Video
- Hand Position quick-reference descriptions for each mudra
- YouTube iframe embedding with "Watch Tutorial" button
- NarrationPlayer and DeepDive AI tools accessible from practice tab

### Phase 10 - Full Sensory Overhaul (Feb 2026)
- Animated cosmic canvas background (twinkling stars, nebula glow, shooting stars) on all pages
- Ambient audio system with cosmic drone (layered oscillators + filtered noise) via Web Audio API
- UI interaction sounds (click chimes) for navigation and buttons
- Volume toggle in navigation bar with pulsing indicator when active
- Enhanced CSS: glassmorphism glow effects, aurora keyframes, text shimmer, orbit glow, breathing borders
- Page transition animations (framer-motion AnimatePresence) between all routes
- Enhanced navigation with pulsing logo, active glow, dropdown animations
- Enhanced Landing page: aurora overlays, breathing orb with particle ring, text shimmer gradient
- Enhanced Dashboard: animated stat cards, icon glow on hover, breathing borders
- Transparent backgrounds on all pages to show cosmic canvas
- Custom scrollbar, enhanced selection colors, ripple effects on buttons

### Phase 6 - Creation Studio & AI Knowledge
- Creation Studio (/create): Write your own affirmations, meditations, breathwork, mantras, rituals
- AI-powered creation generation from user intentions
- Community sharing of user-created content with likes
- AI Knowledge Engine (Deep Dive): In-depth AI-generated guides on any topic
- Voice narration (NarrationPlayer) with 9 voices, 3 speeds, persistent preferences

### Phase 7 - Performance & Optimization
- React.lazy/Suspense code splitting — only loads pages when navigated
- Backend Cache-Control headers on static data endpoints
- asyncio.gather for concurrent DB queries (Dashboard stats, Profile)
- asyncio.wait_for timeouts (30-45s) on ALL AI/LLM calls to prevent server blocking
- Knowledge endpoint retry logic for transient failures
- Shared API config with 30s default timeout
- Health check endpoint (/api/health)

### Phase 8 - Rich Content & Videos (Latest)
- **23 YouTube videos** across 10 categories: mudras (3), yantra (3), tantra (3), breathing (3), meditation (3), frequencies (3), soundscapes (2), exercises (1), mantra (1), nourishment (1)
- Exercises page rebuilt with embedded YouTube per exercise + philosophy, 8 detailed steps, practice tips
- **Reusable `FeaturedVideos` component** integrated into ALL practice pages: Mudras, Breathing, Meditation, Frequencies, Soundscapes, Yantra, Tantra, Nourishment
- Videos page rebuilt with category filters, inline player with autoplay, and full video library
- All AI endpoints protected with `asyncio.wait_for` timeouts (30-45s) to prevent server blocking
- Rebranded to "The Cosmic Collective — A Gathering Place for Conscious Minds"

## Key API Endpoints
- `/api/health` - service health check
- `/api/auth/` - register, login, me
- `/api/dashboard/stats` - user statistics (concurrent queries)
- `/api/moods/`, `/api/journal/` - tracking
- `/api/affirmations/generate` - AI affirmations
- `/api/rituals/` - CRUD + completion + history + templates
- `/api/community/` - feed, posts, likes, comments, follow, profile
- `/api/challenges/` - join, checkin, leaderboard, details
- `/api/profile/` - customize, me, public/{userId}, covers
- `/api/oracle/` - reading, zodiac, chinese-zodiac, sacred-geometry, tarot-deck
- `/api/mudras`, `/api/yantras`, `/api/tantra` - spiritual tools (cached)
- `/api/videos`, `/api/classes` - content & learning (cached)
- `/api/classes/enroll`, `/api/classes/complete-lesson` - enrollment
- `/api/certifications/my` - user certifications
- `/api/frequencies` - healing tones (cached)
- `/api/exercises` - Qigong/Tai Chi (cached)
- `/api/nourishment` - energy foods
- `/api/creations/` - CRUD, share, like, ai-generate
- `/api/knowledge/deep-dive` - AI knowledge generation (with retry)
- `/api/knowledge/suggestions/{category}` - topic suggestions
- `/api/tts/narrate` - text-to-speech generation

## Database Collections
- users, moods, journal_entries, rituals, ritual_completions
- posts, follows, challenges, challenge_participants
- enrollments, certifications
- creations, knowledge_cache, affirmations

## Backlog (P0/P1/P2)
- P0: Display user-created content in existing pages (Affirmations, Meditation, Rituals) - integrate /api/creations/mine
- P1: Certifications page/section in user profile to view earned certificates
- P1: Backend refactoring (split server.py into APIRouter modules)
- P2: User-uploaded audio/video content for meditations and rituals
- P2: Recommended "Beginner's Journey" learning path
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
