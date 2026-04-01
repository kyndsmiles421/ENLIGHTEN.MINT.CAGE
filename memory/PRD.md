# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. A "Phygital Marketplace" with a centralized "Central Bank" economic model, AI Content Broker revenue engine, and closed-loop content factory.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Closed-Loop Content Factory & Founding Architect (Apr 1, 2026) — LATEST

**Auto-Generation Hooks (The Content Factory):**
- Quest completion → auto-generates Victory Mantra via Gemini AI → auto-listed in marketplace
- Mixer session save → auto-generates Recovery Frequency blend → auto-listed in marketplace
- Toast notifications: "New asset generated: [name]" in both RPG and Mixer UIs
- Content attribution links asset to creator and source activity

**Predictive Wellness ("Cosmic Prescription"):**
- Time-of-day analysis: morning (528Hz/beta_energy), afternoon (417Hz/alpha_focus), evening (639Hz/theta_dream), night (963Hz/delta_sleep)
- Recent activity context (quests completed, mixes saved) feeds AI mantra generation
- Dashboard widget: frequency recommendation + binaural preset + mood + personalized mantra

**Founding Architect Program:**
- 3 invite codes: COSMIC-FOUNDER-2026, RAPID-CITY-ARCHITECT, STARSEED-TESTER
- Redeems to: permanent Founding Architect badge + lifetime Elite status (30% discount)
- Badge visible on Dashboard (compact "FOUNDER") and Settings (full panel with Lifetime Elite + 30% Off)
- Admin grant endpoint for admin/creator roles

**Tests**: Iteration 172 — 100% Backend (21/21) / 100% Frontend

### AI Content Broker & Fidelity HUD (Apr 1, 2026)

**User Tier Discount Matrix**: Base 0%, Premium 15%, Elite 30%
**Fidelity HUD Boost**: 3 packs (24h/72h/168h), Dust or Credits, nav HUD with timer
**Free 7-Day Ultra Trial**: One-time for new users
**AI Content Generation**: Recovery Frequencies, Victory Mantras, Group Immersions, Cosmic Blends
**Content Marketplace**: Type filters, tier pricing, 95% creator / 5% platform split

**Tests**: Iteration 171 — 95% Backend / 100% Frontend

### Central Bank, Mantras, Avatars, Atmosphere Switch (Apr 1, 2026)

**Tiered Dust Sales**: Base 0%, Medium 15%, Premium 30% Supernova
**30% Return Penalty**: Processing fee on sell-backs
**Atmosphere Switch**: 3 levels (Simplified/Standard/Ultra-Immersive) + CSS variable system
**Sacred Mantras**: 31 mantras in 12 categories throughout the app
**Game Avatars**: 10 characters (4 Free/3 Earned/3 Premium), mood-resonant states
**Cosmic Broker (Stripe)**: 4 Credit Packs, AI Merchant, Phygital Escrow
**Hidden Dev Console**: Triple-tap nav logo

**Tests**: Iterations 169-170 — 100%

### Earlier Systems (All Tested)
- Deep Click E2E, Universal Inventory Bridge, Transmute Panel, Latency Pulse
- World Veins, NPC Rivals, RPG Bosses, Economy Admin
- Living Journal, Refinement Lab, SmartDock, Wisdom Evolution
- PEP, Marketplace, Seasonal Cycles, 5-Layer Universe
- Rock Hounding, Dream Realms, Daily Quests, RPG, Auth, AI Coach

## Key Architecture

```
/app/backend/routes/
  revenue.py          # Tiers, Fidelity Boost, AI Content Broker, Predictive Wellness, Founding Architect
  content_factory.py  # Auto-generation functions (victory mantra, recovery frequency)
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker (Stripe)
  content.py          # Mantras, Game Avatars
  rpg.py              # Quests (with auto-gen hook), Inventory, Bosses
  meditations.py      # Mixer (with auto-gen hook), Soundscapes

/app/frontend/src/
  components/
    FidelityHUD.js, CosmicPrescription.js, FoundingArchitect.js
    MantraSystem.js, GameAvatar.js, DevConsole.js, ImmersionToggle.js
    trade/CosmicBroker.js, trade/EscrowDashboard.js, trade/ContentBroker.js
  pages/
    TradeCircle.js (8 tabs), Dashboard.js, Settings.js, RPGPage.js, CosmicMixerPage.js
```

## Key DB Collections
- `users`: wallet, game_avatar, fidelity_boost, founding_architect, credits.tier
- `content_assets`: AI-generated marketplace items (auto_generated flag)
- `content_purchases`, `boost_transactions`, `broker_transactions`, `escrows`

## Credentials
- Trade Test: grad_test_522@test.com / password (Founding Architect, Elite)
- RPG Test: rpg_test@test.com / password123
- Founding Architect Codes: COSMIC-FOUNDER-2026, RAPID-CITY-ARCHITECT, STARSEED-TESTER

## Upcoming Tasks

### P0
- **90-Second Cinematic Onboarding** — Multi-step showcase: Mixer → Atmosphere Switch → Ultra → Trade Circle → Avatar → Free Trial prompt
- **Starseed Energy Gates** — Progression checkpoints requiring traded materials/polished gems
- **Premium Video Projections** — Cinematic Mixer layers gated by subscription tier

### P1
- **Earned Avatar Auto-Unlock** — Milestones trigger avatar unlocks
- **Practice Mechanic** — Resonance Skill from Mixer/Trade usage
- **Party System (Circle/Coven)** — Private social spaces
- **Mixer Trades / Vibe Capsules** — Audio creations as tradeable assets

### P2
- Avatar spatial navigation, Myths & Legends, AI Scene Recreations
- GPS Hotspot Spawning, Biometric Sync, RPGPage.js refactoring
