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

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

## All Verified Features (45+)

### Core Platform
1. SmartDock, Cosmic Mood Ring, Session Replay & Download
2. Recurring Live Sessions, Push Notifications
3. Zoom-Like Video Calling (WebRTC P2P), Screen Sharing, Virtual Backgrounds
4. AI-Generated Meditation Audio (7 TTS voices)
5. Creator Dashboard (7 tabs, broadcast, user management)
6. Mood Insights, Crystal Pairing, Blessings, Trade Circle
7. Stripe Subscriptions (5 tiers)
8. Sacred Texts (15), Encyclopedia (12 traditions), Music Lounge
9. Cosmic Mixer / Production Console (7 channels)
10. Soundscapes, Crystals (13), Avatar Creator, VR Modes
11. Star Charts, Numerology, Oracle, Mayan Calendar, Cardology
12. Profile, Settings, Split Screen, PWA, Capacitor scaffolding
13. Dance & Music Studio (17 instruments, 8 dances)
14. Cosmic Pairs (6 curated split-screen combos)
15. Mixer Presets, Journeys (playlists), Multi-Layer Visual Stack
16. FractalVisualizer, VisualFilters, Media Library (/my-creations)
17. Live Session Mixer Sync (WebSocket), Recording Engine

### Latest Session Features (2026-03-30)
18. **In-Star-Chart Astrology Reading** (iteration_111: 100%)
    - "My Reading" toolbar + MythologyPanel buttons
    - AI-powered via GPT-4o: birth zodiac, mood, aura, moon phase, transits
    - Tabbed panel: Cosmic Influence, Planets, Guidance

19. **Daily Cosmic Briefing Push Notification**
    - Morning push with personalized astrology based on birth chart + transits
    - 5 rotating cosmic briefing templates
    - Integrated into push_scheduler_loop

20. **Sacred Scriptures & Lost Books** (iteration_112: 100%, 29/29 backend)
    - 136 total texts across 7 categories:
      - Old Testament (39), New Testament (27), Deuterocanonical (7)
      - Lost & Apocryphal (17), Torah & Talmud (12), Kabbalah (10), Quran (24)
    - AI-generated chapter content: Retelling, Key Verses, Commentary
    - AI Q&A "Ask the Scholar" deep-dive per chapter
    - Bookmarks, TTS read-aloud, chapter navigation
    - Tradition-aware AI prompts (Bible, Torah, Kabbalah, Quran contexts)
    - Page: /bible

21. **Scripture Vision Mode** — Animated scene recreations while reading
    - Canvas-based particle systems detect text keywords (water, fire, light, creation, etc.)
    - Tradition-specific palettes and visual themes
    - Scene types: fire, water, light, darkness, creation, mountain, garden, sky, storm, peace, battle, journey, divine, mystical
    - Glass-morphism text overlay for readability

22. **Global Immersion Level Toggle** (iteration_113: 100%)
    - Three tiers: Calm / Standard / Full Immersive
    - Quick-access toggle in navigation bar
    - Full settings in Settings > Experience Level
    - **Calm**: No particles, fractals, or flashing. Safe for epilepsy/motion sensitivity
    - **Standard**: Moderate animations, gentle effects
    - **Full Immersive**: All visual effects enabled
    - Affects: ScriptureVisualizer, FractalVisualizer, Star Chart, Vision Mode
    - Accessibility warning for photosensitive users
    - Persisted in SensoryContext localStorage

## Key Routes
- `/bible` — Sacred Scriptures (7 traditions, 136 texts)
- `/star-chart` — Star Chart with Astrology Reading
- `/my-creations` — Media Library
- `/settings` — Experience Level + all preferences
- `/live/:id` — Live Sessions with Mixer Sync

## Upcoming Tasks
1. Full Launch-Ready Polish & Flow Streamlining (P1)
2. Mobile App Store scaffolding / Capacitor native build checks (P2)
3. VR Immersive modes completion/verification (P2)

## Refactoring Needed
- CosmicMixer.js (~1500 lines) → Break into custom hooks
- LiveRoom.js complexity → Handles WebRTC, MediaPipe, chat, AND visual overlay sync

## 3rd Party Integrations
- OpenAI GPT-4o — Emergent LLM Key
- OpenAI TTS (tts-1-hd) / Whisper STT — Emergent LLM Key
- Sora 2 Video Generation — Emergent LLM Key
- OpenAI Image Generation (GPT Image 1) — Emergent LLM Key
- Stripe (Payments) — Emergent Environment Test Key
- MediaPipe Vision — NPM Package
