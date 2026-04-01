# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. A "Phygital Marketplace" with a centralized "Central Bank" economic model, AI Content Broker revenue engine, and closed-loop content factory.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Starseed Energy Gates, Gate Notifications & TradeCircle Modularization (Apr 1, 2026) — LATEST

**Starseed Energy Gates (5 Dimensional Gateways):**
- Gate of Earth (396 Hz, Amber) → Gate of Flow (417 Hz, Rose) → Gate of Transmutation (528 Hz, Silver) → Gate of the Unseen (741 Hz, Violet) → Gate of Pure Source (963 Hz, Gold)
- Sequential unlock: each gate requires the previous one to be opened
- Multi-resource requirements: polished gems, cosmic dust, completed trades, consciousness level
- **Time Locks**: Higher gates require cooldown after previous gate unlock (0h→4h→12h→24h→48h)
- **Travel Requirements**: Must visit specific app realms (Starseed Journey, Refinement Lab, Cosmic Mixer, Dream Realms, Trade Circle)
- **Warp**: Spend Resonance Credits to bypass time locks (0→2→5→10→20 credits)
- Rewards: XP (100→2000) + Dust (25→500) + realm unlocks per gate
- Aura-themed UI with animated progress bars, expandable gate cards, and unlock animations
- Backend: 7 endpoints (status, unlock, warp, travel, travel-log, history)

**Gate Notifications (Feedback Loop Enhancement):**
- Global `useGateNotifications` hook runs in AnimatedRoutes
- Auto-records realm travel when visiting mapped routes (/starseed→starseed_journey, /refinement-lab→refinement_lab, etc.)
- Checks gate readiness on route changes + 60s interval
- Narrative toasts when gate becomes unlockable (e.g., "The Earth Gate trembles...")
- Uses localStorage cache to track state transitions (only notifies on change)
- First load initializes without notifications

**TradeCircle.js Modularization:**
- Reduced from 1136 → 523 lines (54% reduction)
- Extracted 9 components to `components/trade/TradeCircleWidgets.js` (~647 lines)
- Added "Gates" tab (12 total tabs now)

**Tests**: Iterations 176-177 — 100% Backend / 100% Frontend

### Five Levels of Consciousness & AI Product Generator (Apr 1, 2026)

**Consciousness Progression System:**
- 5 levels: Physical (Earth/Amber), Emotional (Water/Rose-Teal), Mental (Fire/Silver-Blue), Intuitive (Air/Indigo-Violet), Pure Consciousness (Ether/Golden-White Halo)
- XP-based progression with 17 activity types
- Feature gating: Level 1=Basic RPG, Level 2=Social Hub, Level 3=AI Forge, Level 4=Predictive Wellness, Level 5=Master Creation + God Mode
- Dashboard widget: ConsciousnessPanel with level info, XP progress bar, 5-level map, settings
- **Aura UI**: Colors shift per level

**AI Product Generator — Tool Forge (Level 3+):**
- Resonator Keys, Focus Lenses, Resource Harvesters
- Weighted rarity system, AI-generated names via Gemini

**AI Product Generator — Skill Generator (Level 4-5+):**
- Passive Buffs, Active Mantras, Skill Bottling

**God Mode Dashboard (Level 5 / Founding Architect):**
- Real-time economy data feed

**Founder's Minting (Genesis Items):**
- One-time-only 1-of-1 legendary item per Founding Architect

**Tests**: Iterations 173-174 — 100%

### 90-Second Cinematic Intro & JS Modularization (Apr 1, 2026)
- 5-level visual progression cinematic at /intro route
- Dashboard.js: 1250 → 496 lines (60% reduction)
- RPGPage.js cleanup

**Tests**: Iteration 175 — 100%

### Closed-Loop Content Factory & Founding Architect (Apr 1, 2026)
- Auto-Generation Hooks, Predictive Wellness, Founding Architect Program

### AI Content Broker & Fidelity HUD (Apr 1, 2026)
- User Tier Discount Matrix, Fidelity HUD Boost, Free 7-Day Ultra Trial

### Central Bank, Mantras, Avatars, Atmosphere Switch (Apr 1, 2026)
- Tiered Dust Sales, Atmosphere Switch, Sacred Mantras, Game Avatars, Cosmic Broker

### Earlier Systems (All Tested)
- Deep Click E2E, Universal Inventory Bridge, Transmute Panel, Latency Pulse
- World Veins, NPC Rivals, RPG Bosses, Economy Admin
- Living Journal, Refinement Lab, SmartDock, Wisdom Evolution
- PEP, Marketplace, Seasonal Cycles, 5-Layer Universe
- Rock Hounding, Dream Realms, Daily Quests, RPG, Auth, AI Coach

## Key Architecture

```
/app/backend/routes/
  energy_gates.py     # Starseed Energy Gates (5 gates, time/travel/warp)
  consciousness.py    # Five Levels progression, XP tracking, feature gating
  forge.py            # Tool Forge, Skill Generator, Genesis Mint, God Mode Dashboard
  revenue.py          # Tiers, Fidelity Boost, AI Content Broker, Founding Architect
  content_factory.py  # Auto-generation functions
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker
  refinement.py       # Gem polishing/tumbler (feeds into Energy Gates)
  content.py          # Mantras, Game Avatars
  rpg.py              # Quests, Inventory, Bosses
  meditations.py      # Mixer, Soundscapes

/app/frontend/src/
  components/
    EnergyGates.js          # Gate progression UI with Aura theming
    ConsciousnessPanel.js   # Level display, XP bar, aura
    CosmicForge.js          # Tool Forge + Skill Generator
    GodModeDashboard.js     # Economy feed
    GenesisMint.js          # 1-of-1 minting UI
    trade/
      TradeCircleWidgets.js # Extracted modals/cards (9 components)
      CosmicBroker.js, EscrowDashboard.js, ContentBroker.js
    dashboard/
      DashboardSections.js  # 12 dashboard widgets
  pages/
    TradeCircle.js (12 tabs: Browse, Gates, Broker, Forge, Content, Escrow, Genesis, God Mode, Avatar, My Listings, Offers, Karma)
    Dashboard.js, Settings.js, RPGPage.js, CinematicIntro.js
```

## Key DB Collections
- `users`: wallet, consciousness (xp, level), founding_architect, credits
- `energy_gates`: user_id, unlocked[], unlock_history[]
- `energy_gate_travel`: user_id, realms[], visited_at
- `forge_items`: Tool/skill items with rarity
- `content_assets`: AI-generated marketplace items
- `rpg_inventory`: Items including polished gems (state: "polished")

## Credentials
- Trade Test: grad_test_522@test.com / password (Founding Architect, Elite)
- RPG Test: rpg_test@test.com / password123
- Founding Architect Codes: COSMIC-FOUNDER-2026, RAPID-CITY-ARCHITECT, STARSEED-TESTER

## Upcoming Tasks

### P1
- **GPS / Location-based Hotspots** — Real-world location triggers for material gathering
- **Earned Avatar Auto-Unlock** — Milestones trigger avatar unlocks
- **Practice Mechanic** — Resonance Skill from Mixer/Trade usage

### P2
- **Party System (Circle/Coven)** — Private social spaces
- **Mixer Trades / Vibe Capsules** — Audio creations as tradeable assets
- **Myths & Legends Encyclopedia** — AI Scene Recreations (Vision Mode)
- Avatar spatial navigation, Biometric Sync
