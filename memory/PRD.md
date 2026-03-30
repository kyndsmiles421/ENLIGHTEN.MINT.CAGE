# The Cosmic Collective — Product Requirements Document

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Three.js + Context API + Capacitor
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key) | **PWA:** Service worker + manifest

## Complete Feature List
- Landing, Auth (JWT), Creator Dashboard (DND), Star Chart (3D), Crystals & Stones
- **Sacred Texts** — 15 ancient scriptures with AI generation, inline reading, VR immersive mode, HD narration
  - **Inline Reader**: Tap chapter to read text directly on page. Tradition label, serif font, Listen (TTS), VR Mode button, close, chapter navigation
  - Separate VR button per chapter for immersive 3D reading
- Starseed Adventure/Realm/Worlds, Spiritual Avatar Creator + Gallery
- Cosmic Ledger, Meditation, Breathwork, Yoga, Journal, Zen Garden
- Cosmic Mixer (multi-layer, accordion, voice commands, tempo sync, founder/seasonal)
- **Cosmic Toolbar** — draggable pill: Zen=GREEN, Voice=BLUE, Wake=AMBER, Top=VIOLET
- **SmartDock** — draggable pill: Cosmos=INDIGO, Sage=PURPLE, Tones=TEAL, Mixer=INDIGO, Feedback=GREEN, Help=YELLOW, Hide=RED
- **Dashboard Customize** — pointer-based drag-to-reorder sections
- Founder Badge, Enhanced Leaderboard, Seasonal Sonic Crystals

### Cosmic Harmonics Engine
- Backend: `/api/harmonics/celestial` — astronomical moon phase, solar cycle, zodiac transit
- SmartDock Cosmos Panel: celestial state + one-tap frequency + meditation suggestion
- VR atmosphere adaptation: nebula colors, fog, star brightness adapt to celestial state

### VR Immersive Modes
- 3D Sanctuary, 7 Portal Orbs with particle halos, translucent glass-morphism HUD
- Guided Journeys, Story Theater (video sound FIXED), Quantum Meditation
- Celestial badge in VR HUD

### Capacitor Native (Scaffolded)
- Config, splash, icon assets, NATIVE_BUILD.md. Requires Node 22+ for build.

## Session History
### Sessions 1-4: Items 1-16
### Session 5:
17. Video Sound Fix — removed `muted` from VR Story Theater video
18. Cosmic Harmonics Engine — celestial awareness + atmosphere adaptation
19. **Sacred Texts Inline Reader** — Fixed critical UX bug where generated chapters could only be opened in VR mode. Added InlineReader component with full text display, Listen (TTS narration with play/pause/progress), VR Mode button, close button, and chapter navigation. Split onRead (inline) from onVR (immersive). Chapter subtitle changed from "Tap to read in VR mode" to "Tap to read".

## Test Reports: Iterations 123-132 all 100% pass rate

## Backlog
- Future: Haptic mantra pulse, AI affirmations from mood trends, WebXR HMD, native app store submission
