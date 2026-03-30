# The Cosmic Collective — Product Requirements Document

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Context API
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key) | **PWA:** Service worker + manifest

## Complete Feature List
- Landing (Sora 2 cinematic), Auth (JWT), Creator Dashboard (DND)
- Star Chart (3D), Crystals & Stones, Sacred Texts
- Starseed Adventure/Realm/Worlds, Spiritual Avatar Creator + Gallery
- Cosmic Ledger, Meditation, Breathwork, Yoga, Journal, Zen Garden
- Cosmic Mixer (multi-layer, accordion, voice commands, tempo sync)
  - Sticky Master Controls Footer, Founder's Harmonic, Seasonal Frequencies
- **Cosmic Toolbar** — unified translucent pill (top-right): Quick Zen, Voice, Wake Word, Scroll-to-top
- Founder Badge, Enhanced Leaderboard (4 categories), Seasonal Sonic Crystals

## Session Work (2026-03-30)
1. Sticky Master Controls Footer on Mixer
2. Major Refactoring: 2,969 → 982 lines (15 components extracted)
3. Quick Meditate FAB (fixed AudioContext + createPortal)
4. Founder Badge + exclusive frequency
5. Enhanced 4-category leaderboard
6. Seasonal Exclusive Frequencies
7. **Cosmic Toolbar** — merged Voice, Meditate, Wake Word, Back-to-Top into one translucent glass-morphism pill at top-right. Uses createPortal(document.body) at z-9998. Replaces VoiceCommandButton + QuickMeditateFAB + BackToTop.

## Backlog
- P2: Capacitor (Mobile App Store scaffolding)
- P2: VR Immersive modes

## Technical Constraints
- `@dnd-kit/sortable` at 8.0.0 | Seasonal Hz values .5 offset | createPortal for toolbar
