# The Cosmic Collective — Product Requirements Document

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Three.js + Context API + Capacitor (Native)
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
- **Cosmic Toolbar** — unified translucent pill, freely draggable, tap-to-expand
  - Color-coded: Zen=GREEN, Voice=BLUE, Wake=AMBER, Top=VIOLET
  - Active states show "Stop Zen" / "Wake Off" for clear stop affordance
  - Active glow halos, Capacitor haptics, auto-collapse 5s
  - Auto-hides on /vr route
- **SmartDock** — horizontal pill, freely draggable, tap-to-expand
  - Color-coded: Sage=PURPLE, Tones=TEAL, Mixer=INDIGO, Feedback=GREEN, Help=YELLOW, Hide=RED
  - Active panel labels change to "Close [name]" for stop affordance
  - Minimize/restore, panels open upward
  - Auto-hides on /vr route
- **Dashboard Customize** — Touch-friendly pointer-based drag-to-reorder sections
- Founder Badge, Enhanced Leaderboard (4 categories), Seasonal Sonic Crystals

### VR Immersive Modes
- 3D Cosmic Sanctuary, 7 Portal Orbs with particle ring halos
- Color-coded translucent glass-morphism HUD (all panels)
- Guided Constellation Journeys, VR Story Theater, Quantum Meditation
- 3 concentric breathing rings, ambient cosmic audio

### Capacitor Native (Scaffolded)
- Config, splash (#0B0C15), icon assets, NATIVE_BUILD.md
- Requires Node 22+ for `cap add/sync`

## Session Work History
### 2026-03-30 (Session 1): Items 1-7
### 2026-03-30 (Session 2): Items 8-12
### 2026-03-30 (Session 3): Items 13-15 (Cleanup, Capacitor, VR Enhancement)
### 2026-03-30 (Session 4):
16. **Color-Coordinated Widgets** — Every CosmicToolbar and SmartDock button now has a distinct always-visible identity color (tinted background, border, and icon) matching its function. Active states show brighter glow + "Stop"/"Close" labels for clear stop affordance. Inactive buttons still show their color (not invisible). Hide button uses red for clear close affordance.

## Test Reports
- Iterations 123-129: All passed 100%
- **Iteration 130**: Color-coordination verification — 100% pass, all 10 widget colors verified at pixel level

## Backlog
- No pending P1/P2 items
- Future: WebXR HMD support, native app store submission
