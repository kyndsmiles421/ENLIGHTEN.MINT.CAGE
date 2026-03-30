# The Cosmic Collective — Product Requirements Document

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Three.js + Context API + Capacitor
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key) | **PWA:** Service worker + manifest

## Complete Feature List
- Landing, Auth (JWT), Creator Dashboard (DND), Star Chart (3D), Crystals & Stones, Sacred Texts
- Starseed Adventure/Realm/Worlds, Spiritual Avatar Creator + Gallery
- Cosmic Ledger, Meditation, Breathwork, Yoga, Journal, Zen Garden
- Cosmic Mixer (multi-layer, accordion, voice commands, tempo sync, founder/seasonal)
- **Cosmic Toolbar** — draggable pill: Zen=GREEN, Voice=BLUE, Wake=AMBER, Top=VIOLET
- **SmartDock** — draggable pill: Cosmos=INDIGO, Sage=PURPLE, Tones=TEAL, Mixer=INDIGO, Feedback=GREEN, Help=YELLOW, Hide=RED
- **Dashboard Customize** — pointer-based drag-to-reorder sections
- Founder Badge, Enhanced Leaderboard, Seasonal Sonic Crystals

### Cosmic Harmonics Engine (NEW)
- **Backend**: `/api/harmonics/celestial` — Real-time moon phase (astronomical math), solar cycle, zodiac transit, personalized frequency/meditation recommendations, atmosphere settings
- **SmartDock Cosmos Panel**: Shows current moon phase + zodiac + solar period at a glance. One-tap activate recommended solfeggio frequency (binaural beat). Suggested meditation and celestial guidance affirmation.
- **VR Atmosphere Adaptation**: 3D scene dynamically adapts nebula colors (celestial accent), fog density (moon illumination), star brightness (particle density) based on current celestial state.
- **VR Celestial Badge**: Top-right HUD showing moon phase + zodiac + solar period.

### VR Immersive Modes
- 3D Cosmic Sanctuary, 7 Portal Orbs with particle ring halos
- Color-coded translucent glass-morphism HUD
- Guided Journeys, Story Theater (video sound FIXED), Quantum Meditation
- 3 concentric breathing rings, ambient cosmic audio

### Capacitor Native (Scaffolded)
- Config, splash, icon assets, NATIVE_BUILD.md. Requires Node 22+ for build.

## Session History
### Session 1-2: Items 1-12 (Mixer, refactoring, toolbar, dock, draggable, dashboard rearrange)
### Session 3: Items 13-15 (Cleanup, Capacitor scaffolding, VR enhancement)
### Session 4: Item 16 (Color-coordinated widgets)
### Session 5 (Current):
17. **Video Sound Fix** — Removed `muted` attribute from VR Story Theater video element
18. **Cosmic Harmonics Engine** — Built backend with astronomical moon phase calculation, solar cycle, zodiac transit detection, and phase-based recommendations (8 phases × frequency/meditation/atmosphere). Added Cosmos panel to SmartDock. VR 3D scene dynamically adapts to celestial state. Celestial badge in VR HUD.

## Test Reports: Iterations 123-131 all 100% pass rate

## Backlog
- No pending P1/P2 items
- Future: WebXR HMD, native app store submission, haptic mantra pulse, AI-generated affirmations
