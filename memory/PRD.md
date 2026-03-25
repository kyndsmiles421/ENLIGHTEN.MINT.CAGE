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

### 3D Holographic Guided Meditation (NEW - Phase 22)
- **AI Script Generation**: Transforms raw practice instructions into paced, sensory-rich guided meditations
- **Holographic 3D Mode**: Canvas-based visualization with particle field, energy body avatar, chakra system, and breathing-responsive animations
- **Auto-Narrated Segments**: Each segment narrated via TTS with cue types: breathe, feel, visualize, move, listen, rest, chant
- **Integrated Into**: Tantra, Mudras, Mantras, Yantra, Exercises, Frequencies
- **Toggle Controls**: Holographic mode ON/OFF, play/pause, segment progress

### Quick Meditation Widget (NEW - Phase 22)
- **Floating Button**: Fixed bottom-right, globally accessible across all pages
- **4 Healing Frequencies**: 432Hz Calm, 528Hz Love, 396Hz Release, 741Hz Intuition
- **30-Second Sessions**: Binaural-like tones with countdown timer
- **Web Audio API**: Real-time oscillator-based sound generation

### Landing Page Enhancements (Phase 22)
- **"How it Works"** section: 3-step visual guide (Choose Frequency → Immerse & Transform → Track Evolution)
- **"Our Story"**: Describes the mobile wellness cafe concept
- **"Mobile Wellness Unit"** section with "Book a Session" and "Find the Mobile Unit" CTAs
- **Accessibility**: Focus-visible rings, 44px min touch targets, reduced-motion media query, high-contrast text utilities

### Sacred Cardology (Phase 21)
- Birth Card Calculator (52 cards + Joker), Daily Card, Love Compatibility
- Full card meanings with keyword, love, life path, element, planetary ruler

### Mayan Astrology - Tzolk'in (Phase 21)
- Birth Sign Calculator (20 day signs, 13 tones, 260 kin)
- Today's Energy, Galactic Compatibility, shadows, affirmations

### Audio Fixes (Phase 21)
- NarrationPlayer: Pause/resume without restart, playback position tracking
- Soundscapes: AudioContext suspension properly awaited

### Social Networking (Phase 20)
- Friends, Open Messaging, Message Privacy (Everyone/Friends Only/Nobody), User Discovery, Activity Feed

### Daily Challenges (Phase 20)
- 30 rotating challenges, XP system, history, leaderboard

### Previous Features
- Applied Evolution (recommendations), Progressive Learning, Gamification (streaks, 4 games)
- Multi-language (6 languages), PWA, Quick Reset Flow, Profile Visibility

## Key API Endpoints
- `/api/guided-experience/generate` — AI-powered guided meditation generation
- `/api/cardology/birth-card`, `/api/cardology/daily-card`, `/api/cardology/compatibility`
- `/api/mayan/birth-sign`, `/api/mayan/today`, `/api/mayan/compatibility`
- `/api/daily-challenge`, `/api/daily-challenge/complete`
- `/api/users/discover`, `/api/friends/*`, `/api/messages/*`
- `/api/tts/narrate`, `/api/profile/me`, `/api/profile/customize`

## Backlog
- P1: Backend refactoring (server.py → modular APIRouter files — 4300+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
- P2: Numerology readings (life path, destiny, soul urge)
