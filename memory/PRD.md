# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js + WebRTC + MediaPipe
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **ML**: MediaPipe Selfie Segmenter (browser-side, GPU-accelerated)
- **Payments**: Stripe (test key)
- **Mobile**: Capacitor (iOS + Android configs)

## Launch Status: COMPLETE (Iteration 104 — 100% pass rate)

### All Verified Features (38+)
1. SmartDock — Minimize, drag, snap zones, persist
2. Cosmic Mood Ring — Interactive quick log, 8 moods
3. Session Replay & Download — Auto-recording, Past Sessions tab
4. Recurring Live Sessions — Subscribe, push notifications, auto-spawn
5. Live Sessions — WebSocket, avatars, guided commands, 8 types, 6 scenes
6. **Zoom-Like Video Calling** — WebRTC P2P, camera/mic toggles, responsive video grid, 3 host modes
7. **Screen Sharing** — Share Screen, featured tile, single-sharer lock
8. **Virtual Backgrounds** — 15 backgrounds (Sacred Sites, Nature, Cosmic) + 3 blur levels, MediaPipe AI segmentation, BackgroundPicker modal
9. AI-Generated Meditation Audio — TTS with 7 voice options
10. Real-time Live Feed on Creator Dashboard
11. Creator Dashboard — 7 interactive tabs, broadcast, user management
12. Mood Insights, Crystal Pairing, Blessings
13. Trade Circle, Stripe Subscriptions (5 tiers)
14. Sacred Texts (15), Encyclopedia (12 traditions)
15. Music Lounge, Cosmic Mixer, Frequencies (binaural beats)
16. Soundscapes, Crystals (13), Avatar Creator, VR Modes
17. Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
18. Profile, Settings, Split Screen, PWA, Capacitor scaffolding

### Virtual Background Architecture
- **Segmentation**: MediaPipe Selfie Segmenter (selfie_segmenter.tflite, float16, GPU delegate)
- **Processing**: Canvas API + requestAnimationFrame at 30fps
- **Output**: captureStream() from Canvas → replaces raw camera in WebRTC
- **Backgrounds**: 15 images from Unsplash (sacred sites, forests, cosmic scenes)
- **Blur**: Canvas filter with 3 levels (8px, 16px, 28px)

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

### Recent Updates (2026-03-30)
- Dance & Music Studio: 17 instruments, 6 scales, 8 sacred dances, recording — DONE (iteration_105: 100%)
- Custom Virtual Background Uploads in Live Sessions — DONE (iteration_105: 100%)
- Search bars for Instruments (by name/origin/category) and Sacred Dances (by name/origin/tradition) — DONE
- Category filter chips for instruments (by origin/region) — DONE
- Split Screen: Added Dance & Music, Light Therapy, Cosmic Mixer, Videos to split-view registry — DONE
- Cosmic Pairs: 6 curated multi-sensory combos (Third Eye Journey, Harmonic Resonance, Forest Healing, Tribal Immersion, Celestial Stillness, Zen Flow) — DONE
  - Placement 1: Horizontal card strip on Dance & Music Studio page
  - Placement 2: Top section of Split View dropdown (accessible from any page)

## Post-Launch
- Capacitor native: `npx cap add android && npx cap add ios` after `yarn build`
- SFU for 10+ participant video calls
- Additional virtual backgrounds (user uploads)
