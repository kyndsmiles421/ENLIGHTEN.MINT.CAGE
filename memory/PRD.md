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
- **Cosmic Toolbar** — unified translucent pill: Quick Zen, Voice, Wake Word, Scroll-to-top
  - Tap-to-expand, active glow halos, Capacitor haptics, auto-collapse 5s
  - Freely draggable with grip handle, edge snapping, localStorage persistence
  - **Auto-hides on /vr route** (VR has its own HUD)
- **SmartDock** — horizontal pill: Sage AI, Tones, Mixer, Feedback, Help
  - Tap-to-expand labels, panels open upward, minimize/restore
  - Freely draggable with grip handle, edge snapping, localStorage persistence
  - **Auto-hides on /vr route**
- **Dashboard Customize** — Touch-friendly pointer-based drag-to-reorder sections
  - Grip handles, arrow up/down buttons, visibility toggles, Add Shortcuts sheet
- Founder Badge, Enhanced Leaderboard (4 categories), Seasonal Sonic Crystals

### VR Immersive Modes (Enhanced)
- 3D Cosmic Sanctuary with Three.js (starfield, nebulae, cosmic dust, avatar)
- **7 Portal Orbs** with particle ring halos orbiting around each portal
- Color-coded portals: Meditation (purple), Quantum (#00E5FF), Breathwork (teal), Yoga (orange), Star Chart (yellow), Oracle (indigo), Teachings (green)
- **Guided Constellation Journeys** — 4 journeys (Hero's Path, Cosmic River, Zodiac Circle, Quantum Realm) with camera fly-through and narrated text
- **VR Story Theater** — AI-generated cinematic creation stories with scene images, narration, and Sora 2 video generation
- **Quantum Meditation** — 5 meditations based on quantum physics principles with breathing rings
- **Translucent Glass-Morphism HUD** — All panels use backdrop-blur(20px) with color-coded glowing borders
- Enhanced meditation overlay with 3 concentric breathing rings
- Ambient cosmic audio (65Hz + 98Hz drone + shimmer pad)

### Capacitor Native (Scaffolded)
- `capacitor.config.ts` with app ID `com.cosmiccollective.app`
- Splash screen: #0B0C15 background, 2.5s auto-hide, immersive
- App icon (1024x1024) and splash screen (1024x1536) assets generated
- Build guide: `/frontend/NATIVE_BUILD.md`
- Requires Node 22+ for `cap add/sync` (scaffolding files ready)

## Session Work History
### 2026-03-30 (Session 1)
1-7: Mixer footer, refactoring, Quick Meditate, Founder Badge, leaderboard, seasonal frequencies, Cosmic Toolbar

### 2026-03-30 (Session 2)
8-12: Toolbar tap-to-expand + haptics, SmartDock horizontal streamline, Toolbar/Dock draggable, Dashboard rearrange fix

### 2026-03-30 (Session 3)
13. **Cleanup** — Deleted deprecated QuickMeditateFAB.js, VoiceCommandButton.js, BackToTop.js (zero ghost imports)
14. **Capacitor Scaffolding** — Generated branded splash (1024x1536) and icon (1024x1024), configured splash screen config (2.5s, immersive, #0B0C15), created NATIVE_BUILD.md with complete build instructions. Note: `cap add/sync` requires Node 22+ (build machine task).
15. **VR Immersive Enhancement** — Enhanced portal orbs with 24-particle ring halos orbiting each portal. Upgraded ALL HUD panels with translucent glass-morphism (backdrop-blur 20px) and color-coded glowing borders: Energy HUD (chakra color), Journey picker (golden-yellow), Theater picker (orange), Quantum picker (cyan), portal legend (per-portal colors). Added 3rd concentric breathing ring to meditation overlay. HUD buttons get color-coded active states with box-shadow glow. CosmicToolbar and SmartDock auto-hide on /vr route.

## Backlog
- (No P2 items remain — all scheduled tasks completed)

## Technical Constraints
- Seasonal Hz values .5 offset
- createPortal for toolbar (z-9998) / dock (z-79) — no conflicts
- Dashboard drag uses pointer events (not native HTML5 drag) for touch support
- Toolbar/Dock positions: localStorage keys `cosmic_toolbar_pos`, `cosmic_dock_pos`
- VR particle rings use THREE.Points with AdditiveBlending
- Capacitor native build requires Node >= 22.0.0

## Test Reports
- Iteration 123-126: Starseed refactoring, leaderboards, seasonal frequencies, cosmic toolbar (all 100%)
- Iteration 127: Toolbar/SmartDock basic functionality (100%)
- Iteration 128: Draggable UI + Dashboard rearrange (100%)
- Iteration 129: VR enhancements + Capacitor + Cleanup (100%)
