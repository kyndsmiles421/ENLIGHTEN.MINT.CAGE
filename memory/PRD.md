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

### Session 7 (Current — Batch 2):
23. **3D Spatial Audio in VR** — Web Audio PannerNode (HRTF model, inverse distance) routed through all ambient oscillators. AudioListener position synced to THREE.js camera in animation loop. Sound source orbits a nebula point in 3D space, creating near/far/left/right panning as user rotates camera. AudioContext auto-resumes on user gesture.
24. **Virtualized Sacred Texts Lists** — react-window v1.8.10 FixedSizeList for chapter lists (>6 chapters) and text grid (>9 items). Reduces DOM nodes from 15+ complex blocks to only 2-3 visible in viewport. Smart threshold: skip virtualization for small lists to avoid overhead.
25. **WebXR HMD Gaze Reticle** — Centered 2px dot reticle with SVG fuse progress ring. 1500ms gaze timer: staring at a portal fills the ring, then triggers portal activation (navigate, meditation, quantum picker). Removes need for external controllers for basic navigation.
26. **Capacitor Native Build Unblocked** — Installed nvm + Node 22.22.2 alongside Node 20. `cap add android`, `cap add ios`, `cap sync` all succeeded. Both `android/` and `ios/` project directories generated with production web build. 8 Capacitor plugins synced (haptics, splash, status-bar, keyboard, push-notifications, share, browser, app).
27. **Native App Icons & Splash Screens** — Ran `@capacitor/assets generate` from source images in `resources/`. Generated 162 assets total: 60 Android (adaptive icons, round icons, splash in all DPIs + dark mode) and 10 iOS (AppIcon 1024px, splash @1x-3x + dark). All icons use the cosmic lotus branding.
28. **GitHub Actions CI/CD Pipeline** — Created `.github/workflows/build.yml` with 4 jobs: web-build (craco), android-build (Gradle APK + Firebase App Distribution), ios-build (Xcode simulator check), and notify. Produces downloadable debug APK artifact on every push to `main`. Firebase App Distribution auto-sends APK to beta-testers group on merge. iOS TestFlight deployment scaffolded with commented config.
29. **PWA Push Notifications Live** — Service worker (`sw.js`) now handles `push` events with vibration patterns, action buttons (Open/Later), and `notificationclick` navigation to deep links. Registered in `index.js` on app load. Backend has full VAPID-based Web Push via `pywebpush`: subscribe/unsubscribe, preference management (morning/evening reminders), quantum coherence scoring, scheduled bulk delivery, and in-app notification inbox.

### Session 8 (Current — Trade Circle + Widget Fix):
30. **Widget Overlap Fix** — Both SmartDock and CosmicToolbar now use shared `widget-focus` CustomEvent + localStorage key for bring-to-front z-index management. Clicking/dragging either widget raises it to z-9999, the other drops to z-9997. SmartDock default moved to bottom-left to prevent overlap. Both widgets have minimize (X) buttons that collapse them to a tiny restore dot.
31. **Trade Circle Marketplace** — Full barter marketplace with wellness categories (Readings, Healing, Guidance, Meditation, Crafted, Goods, Services). Features: create/browse listings, make/accept/decline offers, category filtering, search, stats dashboard, karma leaderboard, reviews.
32. **Cosmic Handshake** — Mutual trade confirmation system: after accepting an offer, listing moves to "in-trade" status. Both lister and offerer must independently POST `/handshake` to confirm fulfillment. Only after both confirm does the trade complete and karma is awarded.
33. **Trust Score System** — Composite trust metric: Quantum Coherence (40%, from practice consistency) + Trade Rating (40%, from review stars) + Trade Volume (20%, from completed trades). 5 tiers: Newcomer → Seeker → Light Bearer → Star Guardian → Cosmic Elder. Displayed as badge on listing details.

### Session 9 (Current — Mixer Revamp):
34. **Voice Morphing Engine** — 13-parameter real-time voice effects processor: Pitch Shift, Formant, Speed, Reverb (convolution), Echo (delay+feedback), Chorus, Distortion (waveshaper), 3-band EQ, Stereo Width, Voice Gain. Routes TTS audio through Web Audio API chain instead of HTML Audio, fixing the "voice drowned out" issue. 8 presets: Clean, Deep Elder, Celestial, Whisper, Cosmic Echo, Dark Oracle, Angelic, Glitch.
35. **Per-Channel Volume Faders** — Every active frequency, ambient sound, and drone instrument gets its own gain slider appearing inline when activated. Real-time gain node control.
36. **Waveform Selectors** — Per-frequency waveform type switcher (sine/triangle/sawtooth/square). Updates live oscillator type in real-time.
37. **Per-Sound Filter Sweeps** — Cutoff + resonance controls on each active ambient sound and drone instrument. Uses BiquadFilter nodes (lowpass for sounds, bandpass for drones).
38. **Live Waveform Visualizer** — Real-time canvas-based oscilloscope at top of mixer. Uses AnalyserNode with `getByteTimeDomainData` synced via `requestAnimationFrame`. Multi-color gradient waveform.
39. **Master FX Bus** — Global reverb (60% ceiling), delay, chorus applied on master output. Compressor toggle (DynamicsCompressor: -18dB threshold, 4:1 ratio). Prevents clipping and glues layers.
40. **Layer Crossfade Controls** — Two dual-gradient sliders: Freq↔Ambient and Instruments↔Voice. Adjusts gain proportionally across layer groups for smooth blending.
41. **Audio Routing Upgrade** — Master chain: MasterGain → AnalyserNode → DynamicsCompressor → Destination. All per-channel gains feed into master. AudioContext auto-resumes on user gesture.

## Test Reports: Iterations 123-138 all 100% pass rate

## Backlog
- Starseed Choose Your Own Adventure
- Cooperative Boss encounters
- Loot/Inventory system
- Multiverse realms
- Spore-like Spiritual Avatar Creator enhancements
- Gem Resonance engine
- Myths & Legends encyclopedia
