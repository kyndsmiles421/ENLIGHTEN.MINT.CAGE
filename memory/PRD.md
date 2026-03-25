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

### Sacred Cardology (NEW - Phase 21)
- **Birth Card Calculator**: Enter birthday → reveals personal card from 52-card deck
- **Card Meanings**: Full interpretations for all 52 cards + Joker (keyword, description, love, life path, element, planet)
- **Daily Card**: Deterministic daily card rotation with guidance
- **Love Compatibility**: Two-person compatibility scoring based on suit, element, and value
- **Suit Themes**: Hearts (Love), Clubs (Knowledge), Diamonds (Values), Spades (Wisdom)
- **Planetary Rulers**: Each card value maps to a planetary influence

### Mayan Astrology - Tzolk'in (NEW - Phase 21)
- **Birth Sign Calculator**: Enter full birth date → Galactic Signature (day sign + tone)
- **20 Day Signs**: Full descriptions, elements, directions, shadows, affirmations (Imix through Ahau)
- **13 Galactic Tones**: Purpose, action, and description for each tone
- **Kin Number**: Position within the 260-day sacred calendar
- **Today's Energy**: Daily Mayan energy reading
- **Galactic Compatibility**: Two-person compatibility based on elements, directions, tones
- **Accurate Tzolk'in Math**: Julian Day Number calculation from Mayan epoch

### Guided Meditation Experience (NEW - Phase 21)
- **AI-Generated Immersive Scripts**: Transforms raw practice instructions into paced, sensory-rich guided meditations
- **Breathing Cues**: Automatic breathing animations during breathe segments
- **Step-by-Step Progress**: Visual segment dots, elapsed time, progress bar
- **Auto-Narration**: Each segment is narrated via TTS with ambient pacing
- **Integrated Into**: Tantra, Mudras, Mantras, Yantra, Exercises, Frequencies
- **Cue Types**: breathe, feel, visualize, move, listen, rest, chant

### Audio Fixes (Phase 21)
- **NarrationPlayer**: Fixed audio stopping mid-sentence. Now tracks playback position, supports pause/resume, handles browser-initiated pauses gracefully
- **Soundscapes**: Fixed AudioContext suspension issue — `resume()` now properly awaited before starting sounds

### Social Networking (Phase 20)
- Friends System, Open Messaging, Message Privacy, User Discovery, Activity Feed, Share

### Daily Challenges (Phase 20)
- 30 rotating challenges, XP system, history, leaderboard, dashboard integration

### Enhanced Visual Design (Phase 21)
- Richer glass-morphism with multi-layer shadows and inset highlights
- Subtle background radial gradients (purple/teal/blue)
- Enhanced select styling for dark theme
- Dimensional hover lifts with perspective transforms
- Color accent variables (coral, sapphire)

### Previous Features
- Progressive Learning Modules (4 levels, 16 lessons)
- Recommendation Engine, Streak Tracker, Wellness Games (4 mini-games)
- Multi-language (6 languages), PWA, Quick Reset Flow
- Profile Visibility Controls, Ho'oponopono, Mantras

## Key API Endpoints
- `/api/cardology/birth-card`, `/api/cardology/daily-card`, `/api/cardology/compatibility`
- `/api/mayan/birth-sign`, `/api/mayan/today`, `/api/mayan/compatibility`
- `/api/guided-experience/generate`
- `/api/daily-challenge`, `/api/daily-challenge/complete`, `/api/daily-challenge/history`, `/api/daily-challenge/leaderboard`
- `/api/users/discover`, `/api/friends/*`, `/api/messages/*`
- `/api/tts/narrate`, `/api/profile/me`, `/api/profile/customize`

## Database Collections
- users, moods, journal_entries, rituals, profiles, streaks, game_scores
- friendships, friend_requests, messages, feed_activities, challenge_completions
- community_posts, follows, enrollments, creations, learning_progress, zen_plants

## Backlog
- P1: Backend refactoring (server.py → modular APIRouter files — 4100+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
