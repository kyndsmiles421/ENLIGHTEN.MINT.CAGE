# The Cosmic Collective — Product Requirements Document

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Context API + Capacitor (Native)
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
  - Tap-to-expand (entire pill tappable), active glow halos, Capacitor haptics, auto-collapse 5s
- **SmartDock** — redesigned horizontal pill (bottom-right): Sage AI, Tones, Mixer, Feedback, Help
  - Tap-to-expand labels, panels open upward, minimize/restore, glass-morphism aesthetic
- Founder Badge, Enhanced Leaderboard (4 categories), Seasonal Sonic Crystals

## Session Work (2026-03-30 continued)
1. Sticky Master Controls Footer on Mixer
2. Major Refactoring: 2,969 → 982 lines (15 components extracted)
3. Quick Meditate FAB (fixed AudioContext + createPortal)
4. Founder Badge + exclusive frequency
5. Enhanced 4-category leaderboard
6. Seasonal Exclusive Frequencies
7. **Cosmic Toolbar** — merged Voice, Meditate, Wake Word, Back-to-Top into one translucent glass-morphism pill at top-right. Uses createPortal(document.body) at z-9998.
8. **Cosmic Toolbar Enhanced** — Tap-to-expand (entire pill body tappable, not just expand button). ActiveHalo pulsing ring for active states. Glow rings on Wake Word. Capacitor haptics on all interactions. Auto-collapse after 5s.
9. **SmartDock Streamlined** — Converted from vertical rail to horizontal compact pill at bottom-right. Glass-morphism matching Cosmic Toolbar. Tap-to-expand labels. Panels open upward. Haptics integrated. Minimize to subtle dot, restore on tap.

## Backlog
- P2: Capacitor (Mobile App Store scaffolding completion)
- P2: VR Immersive modes completion
- Cleanup: Remove deprecated QuickMeditateFAB.js, VoiceCommandButton.js, BackToTop.js

## Technical Constraints
- `@dnd-kit/sortable` at 8.0.0 | Seasonal Hz values .5 offset | createPortal for toolbar/dock
- SmartDock z-index: 79, CosmicToolbar z-index: 9998 — no overlap
- Haptics fallback: `navigator.vibrate?.(8)` when Capacitor unavailable
