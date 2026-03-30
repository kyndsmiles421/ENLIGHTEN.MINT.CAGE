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

### All Verified Features (42+)
1. SmartDock — Minimize, drag, snap zones, persist
2. Cosmic Mood Ring — Interactive quick log, 8 moods
3. Session Replay & Download — Auto-recording, Past Sessions tab
4. Recurring Live Sessions — Subscribe, push notifications, auto-spawn
5. Live Sessions — WebSocket, avatars, guided commands, 8 types, 6 scenes
6. **Zoom-Like Video Calling** — WebRTC P2P, camera/mic toggles, responsive video grid, 3 host modes
7. **Screen Sharing** — Share Screen, featured tile, single-sharer lock
8. **Virtual Backgrounds** — 15 backgrounds + 3 blur levels, MediaPipe AI segmentation
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
19. Dance & Music Studio — 17 instruments, 6 scales, 8 sacred dances, recording
20. Custom Virtual Background Uploads in Live Sessions
21. Cosmic Pairs — 6 curated multi-sensory split-screen combos
22. Production Console (CosmicMixer) — Full mixing board with 7 channel strips
23. Mixer Presets System — Save/load/share/like community presets
24. Preset Playlists (Journeys) — Auto-advancing playlists with transition effects
25. Multi-Layer Visual Stack Mixing Board — Fractals, videos, lights simultaneous
26. FractalVisualizer — Audio-reactive canvas fractals
27. VisualFilters — Post-processing CSS/Canvas overlays
28. Media Library (/my-creations) — Full CRUD, community sharing
29. Live Session Mixer Sync — WebSocket mixer_sync for host-to-participant sync
30. Mixer Recording Engine — Record, save, share mixer sessions

### Latest Features (2026-03-30)
31. **In-Star-Chart Astrology Reading** (iteration_111: 100%)
    - "My Reading" toolbar button + "Astrology Reading" in MythologyPanel
    - AI-powered personalized readings using GPT-4o
    - Birth zodiac, mood history, aura color, moon phase, planetary transits
    - Tabbed panel: Cosmic Influence, Planets, Guidance with affirmation
    - API: POST /api/star-chart/astrology-reading
    - Readings saved to astrology_readings collection

32. **Daily Cosmic Briefing Push Notification**
    - Morning push notification with personalized astrology reading
    - Uses birth chart, moon phase, planetary transits
    - Integrated into push_scheduler_loop in server.py
    - 5 rotating cosmic briefing templates

33. **Sacred Scriptures & Lost Books** (iteration_112: 100%, 29/29 backend + all frontend)
    - 136 total texts across 7 categories:
      - Old Testament (39), New Testament (27), Deuterocanonical (7)
      - Lost & Apocryphal (17), Torah & Talmud (12), Kabbalah (10), Quran (24)
    - AI-generated chapter content: Retelling, Key Verses, Commentary
    - AI Q&A "Ask the Scholar" deep-dive chat per chapter
    - Bookmarks system with persistent storage
    - TTS (Text-to-Speech) read-aloud
    - Chapter navigation (prev/next)
    - Search and category filter chips
    - Tradition-aware AI prompts (respects each tradition's context)
    - API: GET /api/bible/categories, GET /api/bible/books, POST /api/bible/ask, etc.
    - Page: /bible

## Test Credentials
- User: test@test.com / password
- Admin: kyndsmiles@gmail.com / password

## Key Routes
- `/bible` — Sacred Scriptures (Bible, Torah, Kabbalah, Quran)
- `/star-chart` — Star Chart with Astrology Reading
- `/my-creations` — Media Library
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
