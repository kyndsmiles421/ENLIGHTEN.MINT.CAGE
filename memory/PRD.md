# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. Now a "Phygital Marketplace" with a centralized "Central Bank" economic model.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Central Bank Economy & Phygital Trade Circle (Apr 1, 2026) — LATEST

**Cosmic Broker (Stripe Integration):**
- 4 Credit Packs: Spark ($0.99/5cr), Ember ($4.99/27cr), Flame ($9.99/68cr), Inferno ($24.99/175cr)
- Stripe checkout session creation + payment verification endpoints
- Wallet endpoint: credits, dust, gems
- Broker transaction history

**AI Merchant Storefront:**
- 8-item catalog: 3 Dust packs, 2 Gem packs, 3 Starseed Components
- Buy with credits (server-validated, deducts balance, delivers goods)
- Sell-back to Broker at reduced rate (spread model)
- Fixed prices, unlimited stock

**Cosmic Escrow (Phygital Shipping Bridge):**
- Full lifecycle: Committed → Shipped → Received → Released
- 5% Resonance Fee (transaction tax, burned on release)
- Resonance Code for tracking
- Dispute mechanism (freezes escrow for admin review)
- Server-side asset locking from receiver's wallet

**Trade Circle Frontend Overhaul:**
- 6 tabs: Browse, Broker, Escrow, My Listings, Offers, Karma
- CosmicBroker component: wallet strip, credit packs, merchant catalog, sell-back
- EscrowDashboard component: state filters, timeline, ship/confirm/dispute actions
- Stripe payment redirect handling

**Hidden Dev Console:**
- Triple-tap on nav logo to reveal
- Performance Grade (A/B/C/D), Avg Latency, API Call count
- System Status, Escrow Pipeline stats
- Recent API calls with latency coloring
- JS Heap memory usage

**Tests**: Iteration 169 — 100% Backend / 100% Frontend

### Launch Polish & System Integration (Apr 1, 2026)

**Latency Pulse Indicator:**
- `useLatencyPulse.js`: LatencyProvider context, LatencyHUD, LatencyDot, useLatency hook
- Color-coded dots (green <150ms, blue <300ms, amber <800ms, red >800ms)
- Integrated into 6 pages

**World Veins & NPC Rivals:**
- World Veins: collective boss encounters with resonance progress
- NPC Rival: Compete/Evade with rival archetype display
- Both in RPG Bosses tab

**Tests**: Iterations 166-168 — 100%

### Full-Stack Deep Click Optimization (Apr 1, 2026)
- QuestCard interactivity fix, IntroVideo mute button overlay fix
- Universal Inventory Bridge (rock_hounding → rpg_inventory)
- Transmute Panel (Dust-to-Credit exchange)
- RockHounding.js refactored into modular MiningComponents.js

### Earlier Systems (All 100% Tested)
- Economy Admin (Alchemical Exchange, Feature Flags, Communal Goals)
- Environmental Bosses & NPC Rivals, World Veins
- Living Journal (AI-Generated Narratives)
- Refinement Lab, SmartDock, Wisdom Evolution
- PEP, Marketplace, Seasonal Cycles
- Brain/Skin/Bridge, 5-Layer Universe, Forgotten Languages
- Universal Game Core, Rock Hounding, Adaptive Dashboard
- Dream Realms, Elemental Nexus, Multiversal Map, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Key Architecture

### Code Structure
```
/app/backend/routes/
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker (Stripe)
  rock_hounding.py    # Mining + RPG Inventory bridge
  refinement.py       # Tumbler, Starseed components
  rpg.py              # Quests, Inventory, Bosses
  marketplace.py      # Cosmic Store, Credits
  encounters.py       # Bosses, Rivals, Veins
  subscriptions.py    # Stripe subscriptions, Tiers

/app/frontend/src/
  components/trade/
    CosmicBroker.js     # Broker storefront UI
    EscrowDashboard.js  # Phygital escrow management
  components/
    DevConsole.js       # Hidden performance console
  pages/
    TradeCircle.js      # 6-tab marketplace hub
```

### Key DB Collections
- `users`: user_credit_balance, user_dust_balance, user_gem_balance
- `trade_listings`, `trade_offers`, `trade_reviews`, `trade_karma`
- `escrows`: Phygital escrow records with state_history
- `broker_transactions`: Stripe credit purchase records
- `merchant_transactions`: AI Merchant buy/sell records

## Credentials
- RPG Test: rpg_test@test.com / password123
- Trade Test: grad_test_522@test.com / password

## Upcoming Tasks

### P0
- **Starseed Energy Gates UI** — Progression interface where traded materials/polished gems unlock gates
- **Global Rendering Toggle** — 3 levels: Simplified, Standard, Ultra-Immersive (app-wide visual quality)

### P1
- **Party System (Circle/Coven)** — Private social spaces for high-value trades and boss encounters
- **Mixer Trades / Vibe Capsules** — Seal audio mixes into tradeable digital capsules
- **Elemental Crafting** — Combine specimens using Universal Game Template

### P2 — Backlog
- Myths & Legends Encyclopedia
- Global Immersion Level toggles & Avatar Creator
- AI Scene Recreations / Vision Mode
- GPS Hotspot Spawning
- Biometric Sync
- On-device inference (Nano-Banana SLM)
- 3D mesh morphing for PEP visual evolution
- RPGPage.js refactoring (currently >1200 lines)
