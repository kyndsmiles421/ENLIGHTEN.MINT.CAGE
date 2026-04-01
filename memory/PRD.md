# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. Now a "Phygital Marketplace" with a centralized "Central Bank" economic model.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Session — Central Bank, Mantras, Avatars, Atmosphere Switch (Apr 1, 2026)

**Tiered Dust Sales:**
- Base Tier: 500 Dust = 3 Credits (standard price)
- Medium Tier: 2,000 Dust = 10 Credits (15% discount)
- Premium Tier: 5,000 Dust = 18 Credits (30% "Supernova" discount)

**30% Return Penalty:**
- All sell-back/refund operations apply a 30% Central Bank Processing Fee
- Response includes raw_credits, processing_fee, processing_fee_pct, credits_earned

**Atmosphere Switch (Global Fidelity Toggle):**
- 3 levels: Simplified / Standard / Ultra-Immersive
- Controls CSS variables: --glass-blur, --glow-opacity, --particle-opacity, --transition-speed, --gradient-intensity, --shadow-depth
- Available in nav bar (ImmersionToggle) AND Settings page
- Device notes: "$50 phone friendly" / "Modern smartphones" / "High-end hardware"
- data-fidelity attribute on root element for CSS targeting

**Sacred Mantra System:**
- 31 mantras across 12 categories: affirmation, release, mindfulness, breathing, gratitude, connection, patience, abundance, sacred, cosmic, healing, grounding, trade, mixer
- GET /api/mantras (random), GET /api/mantras?category=X, GET /api/mantras/all
- MantraBanner: rotating display in Dashboard, Mixer, Trade Circle headers
- MantraOverlay: floating ambient text (hidden in Simplified mode)
- LoadingMantra: appears in page loading spinner

**Game Avatar System:**
- 10 avatars: 4 Free (Seeker, Healer, Guardian, Mystic), 3 Earned (Alchemist, Starseed, Dreamwalker), 3 Premium (Phoenix 25cr, Oracle 35cr, Sovereign 50cr)
- Mood-Resonant state: dormant → awakening → flowing → radiant → transcendent
- Resonance Level (0-100) computed from mixer sessions + specimens mined + trade karma
- AvatarOrb: animated orb with tier-specific style animations (ethereal, pulsing, blazing, etc.)
- Avatar tab in Trade Circle for selection, purchase, and profile display
- Purchase with Credits from Cosmic Broker

**Tests**: Iteration 170 — 100% Backend / 100% Frontend

### Previous Session — Central Bank Economy (Apr 1, 2026)

**Cosmic Broker (Stripe):**
- 4 Credit Packs: Spark ($0.99/5cr), Ember ($4.99/27cr), Flame ($9.99/68cr), Inferno ($24.99/175cr)
- Stripe checkout session creation + payment verification endpoints
- Wallet endpoint: credits, dust, gems
- Broker transaction history

**AI Merchant Storefront:**
- 8-item catalog with tiered pricing
- Buy with credits, sell-back with 30% penalty
- Hidden Dev Console (triple-tap nav logo)

**Cosmic Escrow (Phygital Shipping Bridge):**
- Full lifecycle: Committed → Shipped → Received → Released
- 5% Resonance Fee, dispute mechanism

**Tests**: Iteration 169 — 100% Backend / 100% Frontend

### Earlier Systems (All Tested)
- Deep Click E2E Optimization, Universal Inventory Bridge, Transmute Panel, Latency Pulse
- World Veins, NPC Rivals, RPG Bosses
- Economy Admin, Living Journal, Refinement Lab, SmartDock, Wisdom Evolution
- PEP, Marketplace, Seasonal Cycles, Brain/Skin/Bridge, 5-Layer Universe
- Rock Hounding, Dream Realms, Elemental Nexus, Multiversal Map
- Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Key Architecture

### Code Structure
```
/app/backend/routes/
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker (Stripe)
  content.py          # Mantras (31), Game Avatars (10)
  rock_hounding.py, refinement.py, rpg.py, marketplace.py, encounters.py

/app/frontend/src/
  components/
    trade/CosmicBroker.js     # Broker storefront with tiered pricing & 30% penalty
    trade/EscrowDashboard.js  # Phygital escrow management
    MantraSystem.js           # MantraBanner, MantraOverlay, LoadingMantra
    GameAvatar.js             # AvatarOrb, AvatarBadge, GameAvatarPanel
    DevConsole.js             # Hidden performance console
    ImmersionToggle.js        # Atmosphere Switch (3 levels)
  context/SensoryContext.js   # CSS var system for fidelity
  pages/TradeCircle.js        # 7 tabs (Browse, Broker, Escrow, Avatar, My Listings, Offers, Karma)
```

### Key DB Collections
- `users`: user_credit_balance, user_dust_balance, user_gem_balance, game_avatar, unlocked_avatars
- `escrows`, `broker_transactions`, `merchant_transactions`
- `trade_listings`, `trade_offers`, `trade_reviews`, `trade_karma`

## Credentials
- Trade Test: grad_test_522@test.com / password
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### P0
- **Starseed Energy Gates UI** — Progression interface where traded materials/polished gems unlock gates
- **Premium Video Projections** — High-res cinematic video layers in the Mixer, gated by subscription

### P1
- **Party System (Circle/Coven)** — Private social spaces for high-value trades
- **Mixer Trades / Vibe Capsules** — Seal audio creations into tradeable digital capsules
- **Practice Mechanic** — Mixer/Trade Circle usage increases Resonance Skill, unlocking avatar effects

### P2 — Backlog
- Avatar "walking" navigation mechanic (spatial UI)
- Myths & Legends Encyclopedia
- AI Scene Recreations / Vision Mode
- GPS Hotspot Spawning, Biometric Sync
- 3D mesh morphing for PEP visual evolution
- RPGPage.js refactoring (>1200 lines)
