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
- **Cosmic Toolbar** — unified translucent pill: Quick Zen, Voice, Wake Word, Scroll-to-top
  - Tap-to-expand, active glow halos, Capacitor haptics, auto-collapse 5s
  - **Freely draggable** with grip handle, edge snapping, localStorage persistence
- **SmartDock** — horizontal pill: Sage AI, Tones, Mixer, Feedback, Help
  - Tap-to-expand labels, panels open upward, minimize/restore
  - **Freely draggable** with grip handle, edge snapping, localStorage persistence
- **Dashboard Customize** — Touch-friendly pointer-based drag-to-reorder sections
  - Grip handles, arrow up/down buttons, visibility toggles, Add Shortcuts sheet
  - Layout persisted via PUT /api/dashboard/layout
- Founder Badge, Enhanced Leaderboard (4 categories), Seasonal Sonic Crystals

## Session Work History
### 2026-03-30 (Session 1)
1. Sticky Master Controls Footer on Mixer
2. Major Refactoring: 2,969 → 982 lines (15 components extracted)
3. Quick Meditate FAB (fixed AudioContext + createPortal)
4. Founder Badge + exclusive frequency
5. Enhanced 4-category leaderboard
6. Seasonal Exclusive Frequencies
7. Cosmic Toolbar — merged Voice, Meditate, Wake Word, Back-to-Top

### 2026-03-30 (Session 2)
8. Cosmic Toolbar Enhanced — Tap-to-expand, ActiveHalo, haptics
9. SmartDock Streamlined — Vertical rail → horizontal pill, glass-morphism
10. **CosmicToolbar Draggable** — Grip handle, pointer-based drag, edge snapping, localStorage position persistence
11. **SmartDock Draggable** — Grip handle, pointer-based drag, edge snapping, localStorage position persistence
12. **Dashboard Rearrange Fixed** — Replaced broken native HTML5 drag with pointer-event based touch-friendly drag-to-reorder. Visual feedback (highlight/scale on drag, drop target indicators). Arrow buttons + eye visibility toggles confirmed working.

## Backlog
- P2: Capacitor (Mobile App Store scaffolding completion)
- P2: VR Immersive modes completion
- Cleanup: Remove deprecated QuickMeditateFAB.js, VoiceCommandButton.js, BackToTop.js (unused, functionality in CosmicToolbar)

## Technical Constraints
- `@dnd-kit/sortable` at 8.0.0 | Seasonal Hz values .5 offset
- createPortal for toolbar (z-9998) / dock (z-79) — no conflicts
- Haptics fallback: `navigator.vibrate?.(8)` when Capacitor unavailable
- Dashboard drag uses pointer events (not native HTML5 drag) for touch support
- Toolbar/Dock positions: localStorage keys `cosmic_toolbar_pos`, `cosmic_dock_pos`
