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

### Wellness Games
- **Sacred Symbols** (Memory Match) — Enhances Memory
- **Breath of Life** (Breathing Bubble) — Deep Relaxation
- **Color Harmony** (Palette Sorter) — Uplifts Mood
- **Inner Rhythm** (Pattern Recall) — Reduces Stress
- Score tracking with personal bests per game

### Social Networking (NEW - Phase 20)
- **Friends System**: Send/accept/decline friend requests, friends list, suggested friends
- **Open Messaging**: Message any user on the platform (not restricted to friends)
- **Message Privacy**: Users control who can message them (Everyone / Friends Only / Nobody)
- **User Discovery**: Browse all platform users via Discover People section
- **Activity Feed**: See friends' activities (challenges, achievements, shares)
- **Share**: Share achievements, milestones, and wellness tools with friends
- **Search**: Find users by name

### Daily Challenges (NEW - Phase 20)
- **30 rotating challenges** across 9 categories: breathing, meditation, journaling, physical, movement, mindfulness, social, spiritual, sounds
- **XP system**: Each challenge awards XP (25-100 based on difficulty)
- **Completion tracking**: Mark daily challenge as complete, view history
- **Leaderboard**: Ranked by total XP earned across all completions
- **Dashboard integration**: Today's Challenge card with completion status
- **Social integration**: Completions appear in friends' activity feed

### UX & Conversion
- Quick Reset Flow (11 feelings → personalized frequency + tool + nourishment)
- Social Proof (6 testimonials)
- Founding 100 Waitlist
- Culinary Science Section
- Privacy Policy & Wellness Disclaimer
- PWA Manifest

### Profile & Privacy
- Visibility: Public / Friends Only / Private
- Message Privacy: Everyone / Friends Only / Nobody
- Restricted profile view for unauthorized viewers

### Multi-Language Support
- 6 languages: English, Spanish, French, Hindi, Japanese, Portuguese
- Language selector on Landing page + Navigation bar
- localStorage persistence

## Key API Endpoints
- `/api/auth/` - register, login, me
- `/api/dashboard/stats`, `/api/recommendations` - analytics
- `/api/streak`, `/api/streak/checkin` - daily streak
- `/api/games/score`, `/api/games/scores` - game score tracking
- `/api/learning/modules`, `/api/learning/complete-lesson`
- `/api/quick-reset/{feeling}` - personalized reset
- `/api/waitlist/join`, `/api/waitlist/count`
- `/api/profile/me`, `/api/profile/customize`, `/api/profile/public/{id}`
- `/api/daily-challenge`, `/api/daily-challenge/complete`, `/api/daily-challenge/history`, `/api/daily-challenge/leaderboard`
- `/api/users/discover` - browse all users
- `/api/friends/request`, `/api/friends/respond`, `/api/friends/list`, `/api/friends/search`, `/api/friends/suggested`, `/api/friends/feed`, `/api/friends/share`
- `/api/messages/send`, `/api/messages/conversations`, `/api/messages/{conversation_id}`

## Database Collections
- users, moods, journal_entries, rituals, ritual_completions
- posts, follows, challenges, challenge_participants
- enrollments, certifications, creations, affirmations
- custom_meditations, custom_breathing, custom_affirmations, custom_soundscapes, custom_mantras
- zen_plants, journey_progress, learning_progress
- waitlist, streaks, game_scores, profiles
- friendships, friend_requests, messages, feed_activities, challenge_completions

## Backlog
- P1: Backend refactoring (server.py → modular APIRouter files — 3500+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
