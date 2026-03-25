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

### 3D Holographic Avatar Creator (NEW - Phase 23)
- **Canvas-based 3D Avatar**: Customizable holographic energy body with real-time particle animation
- **Body Types**: Slender, Balanced, Broad
- **Aura Colors**: 10 options with adjustable intensity slider
- **Poses**: Standard, Lotus Seated, Standing Tall, Warrior
- **Robe Styles**: Flowing, Fitted, Minimal, Ceremonial (8 color options)
- **Glow Styles**: Soft Aura, Radiant Burst, Crystalline, Plasma Field
- **Particle Density**: Sparse, Medium, Dense, Cosmic
- **Energy Trails**: Toggle on/off
- **Chakra System**: 7 chakras with emphasis options
- **Persistence**: Avatar config saved per user in MongoDB

### Yoga Module (NEW - Phase 23)
- **7 Yoga Styles**: Hatha, Vinyasa Flow, Kundalini, Yin, Restorative, Pranayama, Yoga Nidra
- **Sequences with Poses**: Each style has multiple sequences with 8+ poses each
- **Pose Details**: Name, instruction, breath cue, focus area, duration
- **Progress Tracking**: Mark poses complete, auto-complete session
- **AI Guided Experience**: Integrated GuidedExperience component for immersive narration
- **Audio Narration**: NarrationPlayer for individual pose instructions
- **Session History**: Completed sessions tracked with XP

### 3D Holographic Guided Meditation (Phase 22)
- **AI Script Generation**: Transforms raw practice instructions into paced, sensory-rich guided meditations
- **Holographic 3D Mode**: Canvas-based visualization with particle field, energy body avatar, chakra system, and breathing-responsive animations
- **Auto-Narrated Segments**: Each segment narrated via TTS with cue types: breathe, feel, visualize, move, listen, rest, chant
- **Integrated Into**: Tantra, Mudras, Mantras, Yantra, Exercises, Frequencies
- **Toggle Controls**: Holographic mode ON/OFF, play/pause, segment progress

### Quick Meditation Widget (Phase 22)
- **Floating Button**: Fixed bottom-right, globally accessible across all pages
- **4 Healing Frequencies**: 432Hz Calm, 528Hz Love, 396Hz Release, 741Hz Intuition
- **30-Second Sessions**: Binaural-like tones with countdown timer
- **Web Audio API**: Real-time oscillator-based sound generation

### Landing Page Enhancements (Phase 22)
- **"How it Works"** section: 3-step visual guide
- **"Our Story"**: Describes the mobile wellness cafe concept
- **"Mobile Wellness Unit"** section with CTAs
- **Accessibility**: Focus-visible rings, 44px min touch targets, reduced-motion media query

### Sacred Cardology (Phase 21)
- Birth Card Calculator (52 cards + Joker), Daily Card, Love Compatibility

### Mayan Astrology - Tzolk'in (Phase 21)
- Birth Sign Calculator (20 day signs, 13 tones, 260 kin)

### Social Networking (Phase 20)
- Friends, Open Messaging, Message Privacy, User Discovery, Activity Feed

### Daily Challenges (Phase 20)
- 30 rotating challenges, XP system, history, leaderboard

### Previous Features
- Applied Evolution, Progressive Learning, Gamification (streaks, 4 games)
- Multi-language (6 languages), PWA, Quick Reset Flow, Profile Visibility

## Key API Endpoints
- `/api/yoga/styles`, `/api/yoga/style/{id}`, `/api/yoga/complete`, `/api/yoga/history`
- `/api/avatar` (GET/POST)
- `/api/guided-experience/generate`
- `/api/cardology/birth-card`, `/api/cardology/daily-card`, `/api/cardology/compatibility`
- `/api/mayan/birth-sign`, `/api/mayan/today`, `/api/mayan/compatibility`
- `/api/daily-challenge`, `/api/daily-challenge/complete`
- `/api/users/discover`, `/api/friends/*`, `/api/messages/*`
- `/api/tts/narrate`, `/api/profile/me`, `/api/profile/customize`

## Backlog
- P1: Backend refactoring (server.py -> modular APIRouter files — 4,500+ lines)
- P1: Certifications page for completed classes
- P2: User-uploaded audio/video content
- P2: Weekly/monthly wellness reports
- P2: Meditation session history tracking
- P2: Numerology readings (life path, destiny, soul urge)
