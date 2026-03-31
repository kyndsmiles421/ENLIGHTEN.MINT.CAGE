# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor (native)

## What's Been Implemented

### 7-Day Free Plus Trial (Mar 31, 2026)
- Auto-activated on registration: Plus tier, 300 credits, 7-day window
- Trial info in `/api/subscriptions/my-plan` — trial.active, trial.days_left, trial.expires_at
- Auto-expiry in `get_user_credits()` — auto-downgrades to Free when expired
- Trial-aware feature gating: `check-access` returns `is_trial: true` with `trial_days_left`
- **TrialBanner**: Dashboard countdown with urgency state (red at ≤2 days)
- **Pricing trial flow**: `/pricing?from=trial&highlight=plus` shows trial upgrade banner + "KEEP YOUR TRIAL FEATURES" badge on Plus card
- Admin bypass: Admin users unaffected

### Gemini AI — Unified Brain (Mar 31, 2026)
- ALL ~35 LlmChat instances migrated to Gemini 3 Flash
- Context-Aware Cosmos Floating Assistant: 26-page context map, page-specific greetings + AI responses
- Latency: Coach ~2.8s, Cosmos ~2.4s, Translation ~1.1s

### Star Chart Fuzzy Search (Mar 31, 2026)
- Search button in Star Chart toolbar opens search panel
- Fuzzy match algorithm: handles partial names ("cassiop"→Cassiopeia), typos ("tauras"→Taurus)
- Searches both Western and cultural constellations
- Clicking result selects constellation and opens detail panel

### Core Platform (Previously Built)
- Auth (JWT), profiles, dashboard, wellness tracking
- AI Coach (spiritual/wellness/dream oracle/voice), Star Chart (20 cultures)
- Oracle, Numerology, Cardology, Sacred Texts, Trade Circle
- Gamification, achievements, community features
- Starseed Journey (8 origins), Multiverse Realms (6 dimensions)
- MixerContext (Global Audio Engine), SmartDock Mini Controls
- Session Recording (Soundscapes), Premium Tier Gating (Stripe)
- Multi-Language (7 languages, Gemini translation), VR, PWA

## Key DB Collections
- `user_credits`: Tier, balance, trial_active, trial_started_at, trial_expires_at
- `gemini_sessions`, `gemini_translations`, `mixer_sessions`, `coach_sessions`

## Credentials
- Admin: kyndsmiles@gmail.com / password
- App URL: https://zen-energy-bar.preview.emergentagent.com

## Test Report History
- Iteration 145: Gemini chat + context-aware (100%)
- Iteration 146: Trial registration + auto-expiry (100%)
- Iteration 147: Dumb functionality checklist (Backend 21/21, Frontend 12/12 — 100%)

## Upcoming Tasks (Prioritized)

### P1 — Next
- Trial Graduation modal (personalized summary when trial ends)
- Cooperative Boss Encounters (community meditation/frequency goals)
- Loot/Inventory System (manage gems & digital assets)

### P2 — Backlog
- Virtual Rock Hounding (gem resonance tie-in)
- Myths & Legends Encyclopedia
- Global Immersion Level Toggles
- Language preference persistence to user profile

### P3 — Future
- Spore-like Spiritual Avatar Creator
- Gem Resonance engine
- AI Scene Recreations (Vision Mode)

## Architecture Rules
- **Audio**: NEVER instantiate `new AudioContext()` in components — always use `useMixer()`
- **AI**: ALL LLM calls use `.with_model("gemini", "gemini-3-flash-preview")`
- **Trial**: Auto-expiry checked in `get_user_credits()` — no cron needed
