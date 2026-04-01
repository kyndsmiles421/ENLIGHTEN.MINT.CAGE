# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. Now a "Phygital Marketplace" with a centralized "Central Bank" economic model and AI Content Broker revenue engine.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### AI Content Broker & Fidelity HUD Revenue Engine (Apr 1, 2026) — LATEST

**User Tier Discount Matrix:**
- Base (free/starter): 0% discount
- Premium (plus): 15% discount on all marketplace assets and boosts
- Elite (premium/super_user): 30% discount

**Fidelity HUD Boost System:**
- Instant Refresh: 24h Ultra burst (200 Dust / 3 Credits)
- Weekend Pass: 72h (500 Dust / 7 Credits) — 15% savings vs daily
- Explorer's Week: 168h (1000 Dust / 12 Credits) — 28% savings vs daily
- Stacks with existing boosts (extends timer)
- Tier discounts apply to boost costs
- Auto-switches Atmosphere to Ultra when boost purchased
- HUD icon in nav bar with glow ring + timer badge

**Free 7-Day Ultra Trial:**
- One-time trial for new users (within 7 days of signup)
- Activates Ultra fidelity for 168 hours
- Creates natural desire to upgrade after trial ends

**AI Content Generation (Gemini 3 Flash):**
- Recovery Frequencies: Solfeggio + Binaural blends from wellness sessions
- Victory Mantras: AI-generated affirmations from quest completions
- Group Immersions: Community event-generated immersion packs
- Cosmic Blends: Frequency + paired mantra combinations
- All generated content auto-listed on marketplace

**Content Marketplace:**
- Browse with type filters (All/Recovery/Mantra/Immersion/Blend)
- Tier-based pricing (base_price with tier discount applied)
- Purchase flow: 95% to creator, 5% resonance fee to platform
- My Content section: created + purchased assets

**Tests**: Iteration 171 — 95% Backend (1 skip) / 100% Frontend

### Central Bank, Mantras, Avatars, Atmosphere Switch (Apr 1, 2026)

**Tiered Dust Sales**: Base 0%, Medium 15%, Premium 30% Supernova discounts
**30% Return Penalty**: Processing fee on all sell-back operations
**Atmosphere Switch**: 3 levels (Simplified/Standard/Ultra-Immersive) with CSS variable system
**Sacred Mantras**: 31 mantras in 12 categories, woven throughout app
**Game Avatars**: 10 characters (4 Free/3 Earned/3 Premium), mood-resonant states

**Tests**: Iterations 169-170 — 100%

### Earlier Systems (All Tested)
- Central Bank Economy, Cosmic Broker (Stripe), AI Merchant, Phygital Escrow
- Hidden Dev Console (triple-tap), Latency Pulse Indicator
- World Veins, NPC Rivals, RPG Bosses, Universal Inventory
- Deep Click E2E Optimization, Transmute Panel
- Economy Admin, Living Journal, Refinement Lab, SmartDock
- PEP, Marketplace, Seasonal Cycles, 5-Layer Universe
- Rock Hounding, Dream Realms, Daily Quests, RPG, Auth, AI Coach

## Key Architecture

### Code Structure
```
/app/backend/routes/
  revenue.py          # Tier discounts, Fidelity Boost, AI Content Broker
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker (Stripe)
  content.py          # Mantras (31), Game Avatars (10)
  subscriptions.py    # Stripe subscriptions, Tiers

/app/frontend/src/
  components/
    FidelityHUD.js            # Atmosphere Boost nav icon + panel
    trade/ContentBroker.js    # AI Content marketplace UI
    trade/CosmicBroker.js     # Broker storefront
    trade/EscrowDashboard.js  # Phygital escrow
    MantraSystem.js           # MantraBanner, MantraOverlay, LoadingMantra
    GameAvatar.js             # AvatarOrb, GameAvatarPanel
    DevConsole.js             # Hidden performance console
    ImmersionToggle.js        # Atmosphere Switch
  pages/
    TradeCircle.js            # 8 tabs hub
```

### Key DB Collections
- `users`: wallet, game_avatar, unlocked_avatars, fidelity_boost, credits (tier)
- `content_assets`: AI-generated marketplace items
- `content_purchases`: purchase records with creator split
- `boost_transactions`: fidelity boost purchases
- `escrows`, `broker_transactions`, `merchant_transactions`

## Credentials
- Trade Test: grad_test_522@test.com / password
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### P0
- **Starseed Energy Gates UI** — Progression checkpoints requiring traded materials
- **Premium Video Projections** — Cinematic layers in Mixer, gated by subscription tier
- **Auto-generation hooks** — Content auto-generates after Mixer sessions, quest completions, and community events

### P1
- **Earned Avatar Auto-Unlock** — Milestones trigger avatar unlocks (10 mixer = Alchemist, 50 mines = Starseed)
- **Practice Mechanic** — Mixer/Trade usage increases Resonance Skill
- **Party System (Circle/Coven)** — Private social spaces
- **Mixer Trades / Vibe Capsules** — Seal audio into tradeable assets

### P2 — Backlog
- Avatar spatial navigation
- Myths & Legends Encyclopedia
- AI Scene Recreations / Vision Mode
- GPS Hotspot Spawning, Biometric Sync
- RPGPage.js refactoring (>1200 lines)
