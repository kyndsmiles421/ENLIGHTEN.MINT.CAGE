# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, AI guidance, and cinematic visuals.

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Context API
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key) | **PWA:** Service worker + manifest

## Complete Feature List
- Landing (Sora 2 cinematic), Auth (JWT), Creator Dashboard (DND @dnd-kit/sortable@8.0.0)
- Star Chart (3D, multi-culture), Crystals & Stones encyclopedia
- Starseed Adventure (AI RPG), Realm (Multiplayer), Worlds (Multiverse)
- Spiritual Avatar Creator + Gallery (Radiate votes)
- Cosmic Ledger, Meditation, Breathwork, Yoga, Journal, Zen Garden
- Sacred Texts with AI Scene Recreations, Stripe subscription
- **Cosmic Mixer** — multi-layer audio, accordion UI, voice commands, tempo sync
  - Sticky Master Controls Footer (Stop All + Volume)
  - Founder's Harmonic (432.11Hz) + Seasonal Frequencies
- **Quick Meditate FAB** — global panic button (528Hz + 174Hz + Ocean + 60BPM)
- **Founder Badge** — exclusive aura, haptic pattern, frequency unlock
- **Enhanced Leaderboard** — Shining Brightest / Brightest Aura / Most Helpful / Founders
- **Seasonal Exclusive Frequencies** — time-gated sonic crystals:
  - Spring Equinox: Vernal Awakening (396.5Hz, Mar 6–Apr 5)
  - Summer Solstice: Solar Zenith (639.5Hz, Jun 7–Jul 7)
  - Autumn Equinox: Harvest Resonance (741.5Hz, Sep 8–Oct 8)
  - Winter Solstice: Stellar Depths (852.5Hz, Dec 7–Jan 7)

## Session Work (2026-03-30)
1. Sticky Master Controls Footer on Mixer
2. Major Refactoring: 2,969 → 982 lines (15 extracted components)
3. Quick Meditate FAB (fixed AudioContext + createPortal for z-index)
4. Founder Badge + exclusive frequency
5. Enhanced 4-category leaderboard
6. Seasonal Exclusive Frequencies with collection system

## Backlog
- P2: Mobile App Store scaffolding (Capacitor)
- P2: VR Immersive modes

## Technical Constraints
- `@dnd-kit/sortable` MUST stay at 8.0.0
- Seasonal Hz values are .5 offset to avoid React key collision with standard Solfeggio
- QuickMeditateFAB uses `createPortal(... document.body)` at z-index 9999

## Test Credentials
- Email: kyndsmiles@gmail.com / Password: password
