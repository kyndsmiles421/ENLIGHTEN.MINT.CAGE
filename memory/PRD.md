# The Cosmic Collective — Product Requirements Document

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Three.js + Context API + Capacitor
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key) | **PWA:** Service worker + manifest

## Complete Feature List

### Core
- Landing, Auth (JWT), Creator Dashboard (DND drag-to-reorder), Star Chart (3D), Crystals & Stones
- Sacred Texts (15 scriptures, inline reader, VR immersive mode, TTS narration)
- Starseed Adventure/Realm/Worlds, Spiritual Avatar Creator + Gallery
- Cosmic Ledger, Meditation, Breathwork, Yoga, Journal, Zen Garden

### Cosmic Mixer
- Multi-layer audio: Solfeggio, Ambient Sound, World Instruments, Drones, Mantra, Light Therapy, Haptic Vibration
- **Mood Presets**: Deep Sleep (174Hz/Ocean/50BPM), Focus Flow (396Hz/Rain/72BPM), Active Refinement (417Hz/Forest/90BPM), Heart Opening (528Hz/Singing Bowl/60BPM), Cosmic Download (963Hz/Space/40BPM)
- Sticky Master Controls Footer, Founder's Harmonic, Seasonal Frequencies, Voice Commands, Tempo Sync

### Cosmic Toolbar (Draggable, top-right)
- Color-coded: Zen=GREEN, Voice=BLUE, Wake=AMBER, Top=VIOLET
- Tap-to-expand, active glow halos, auto-collapse 5s, Capacitor haptics

### SmartDock (Draggable, bottom-right)
- Color-coded: Cosmos=INDIGO, Sage=PURPLE, Tones=TEAL, Mixer=INDIGO, Feedback=GREEN, Help=YELLOW, Hide=RED
- **Cosmos Panel**: Moon phase + zodiac + solar period + recommended frequency + AI-generated personalized affirmation

### Cosmic Harmonics Engine
- `/api/harmonics/celestial` — astronomical moon phase, solar cycle, zodiac transit, phase-based recommendations
- `/api/harmonics/affirmation` — AI-generated personalized affirmation from mood trends + celestial alignment (GPT-4o)
- VR 3D atmosphere dynamically adapts to celestial state (nebula colors, fog, star brightness)

### Haptic Mantra Pulse
- BPM-synced double-pulse heartbeat vibration via @capacitor/haptics
- Fallback to navigator.vibrate for web

### VR Immersive Modes
- 3D Sanctuary, 7 Portal Orbs with particle halos, translucent glass-morphism HUD
- Guided Journeys, Story Theater (video sound working), Quantum Meditation
- Celestial badge in VR HUD, 3 concentric breathing rings

### Capacitor Native (Scaffolded)
- Config, splash (#0B0C15), icon assets, NATIVE_BUILD.md. Requires Node 22+ for build.

## Session History
### Sessions 1-4: Items 1-16 (Mixer, refactoring, toolbar, dock, dashboard, color coordination)
### Session 5: Items 17-19 (Video sound fix, Cosmic Harmonics, Sacred Texts inline reader)
### Session 6 (Current):
20. **Haptic Mantra Pulse** — Double-pulse heartbeat vibration pattern synced to BPM in TempoContext. Uses @capacitor/haptics with navigator.vibrate fallback.
21. **Mixer Mood Presets** — 5 one-tap macro buttons that auto-set frequency + ambient sound + BPM + light therapy. ACTIVE badge toggle. Stop via re-tap or Stop All.
22. **AI Affirmations from Mood Trends** — Backend aggregates last 7 days of mood/journal entries, generates personalized affirmation via GPT-4o aligned with current celestial state. SmartDock Harmonics panel shows Generate/Refresh button.

## Test Reports: Iterations 123-133 all 100% pass rate

## Backlog
- Performance refactoring (lazy-load heavy pages, memoize)
- 3D Spatial Audio in VR (positional audio tied to camera orbit)
- WebXR HMD support
- Native app store submission (Node 22+ required)
