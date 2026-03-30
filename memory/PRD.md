# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Context API
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key)
- **PWA:** Service worker + manifest

## Core Features (Implemented)
- Landing, Auth (JWT), Creator Dashboard (DND @dnd-kit/sortable@8.0.0)
- Star Chart (3D, multi-culture), Crystals & Stones
- Starseed Adventure (AI RPG), Realm (Multiplayer), Worlds (Multiverse)
- Spiritual Avatar Creator + Gallery (Radiate votes)
- Cosmic Ledger (cross-origin persistence)
- Cosmic Mixer (multi-layer audio, accordion UI, voice commands, tempo sync)
  - Sticky Master Controls Footer
  - Founder's Harmonic exclusive frequency (432.11Hz)
- Quick Meditate FAB (global panic button for peace)
- Founder Badge system with exclusive frequency unlock
- Enhanced multi-category leaderboard (Shining/Aura/Helpful/Founders)
- Meditation, Breathwork, Yoga, Journal, Zen Garden
- Sacred Texts with AI Scene Recreations
- Stripe subscription system

## Completed This Session (2026-03-30)
1. Sticky Master Controls Footer on Mixer (Stop All + Volume, always pinned)
2. Major Refactoring: 2,969 → 982 lines (67% reduction, 15 extracted components)
3. Quick Meditate FAB — global floating lotus button, one-tap Deep Zen preset (528Hz + 174Hz + Ocean + 60BPM), createPortal for z-index reliability
4. Founder Badge + exclusive 432.11Hz frequency in Mixer
5. Enhanced leaderboard with 4 wellness-positive categories
6. Fixed FAB click bug (AudioContext resume + gain anchor + createPortal)

## Backlog
- P2: Mobile App Store scaffolding (Capacitor)
- P2: VR Immersive modes
- P3: Seasonal exclusive frequencies

## Technical Constraints
- `@dnd-kit/sortable` MUST stay at 8.0.0
- Mixer uses `Map` for multi-select state
- QuickMeditateFAB uses `createPortal(... document.body)` to bypass z-index stacking

## Test Credentials
- Email: kyndsmiles@gmail.com / Password: password
