# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. A "Phygital Marketplace" with a centralized "Central Bank" economic model, AI Content Broker revenue engine, and closed-loop content factory.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Five Levels of Consciousness & AI Product Generator (Apr 1, 2026) — LATEST

**Consciousness Progression System:**
- 5 levels: Physical (Earth/Amber), Emotional (Water/Rose-Teal), Mental (Fire/Silver-Blue), Intuitive (Air/Indigo-Violet), Pure Consciousness (Ether/Golden-White Halo)
- XP-based progression with 17 activity types (mood_log=10, quest_complete=25, boss_defeat=50, forge_creation=40, etc.)
- Feature gating: Level 1=Basic RPG, Level 2=Social Hub, Level 3=AI Forge, Level 4=Predictive Wellness, Level 5=Master Creation + God Mode
- User-controlled display mode: Rank badge, Aura glow, or Hybrid (both)
- Dashboard widget: ConsciousnessPanel with level info, XP progress bar, 5-level map, settings
- **Aura UI**: Colors shift per level — social status symbol in trade/social hubs
  - L1: Amber/Red, L2: Rose/Teal, L3: Silver/Blue, L4: Indigo/Violet, L5: Golden/White Halo

**AI Product Generator — Tool Forge (Level 3+):**
- Resonator Keys: Consumable items to unlock frequency gates
- Focus Lenses: Extend Ultra fidelity duration for free
- Resource Harvesters: Automate Dust collection during idle periods
- Weighted rarity system (common->legendary), AI-generated names via Gemini
- Cost: 25 Dust per forge attempt

**AI Product Generator — Skill Generator (Level 4-5+):**
- Passive Buffs: Energy recovery, Dust bonus, XP boost, market alerts (Level 4+)
- Active Mantras: HUD multipliers, atmosphere shifts, XP surges (Level 4+)
- Skill Bottling: Package mastered skills for Trade Circle sale (Level 5+)
- Cost: 3 Credits per generation

**God Mode Dashboard (Level 5 / Founding Architect):**
- Real-time economy data feed: total users, architects, forge items, marketplace assets
- Asset type distribution with purchase counts
- Consciousness level distribution across all users
- Recent forge activity (with Genesis tags), Recent broker trades
- Accessible to Level 5 users OR Founding Architects

**Founder's Minting (Genesis Items):**
- One-time-only 1-of-1 legendary item per Founding Architect
- Always legendary rarity with 10x stats and "genesis" tag
- 6 Genesis types (Resonator Key, Focus Lens, Harvester, Buff, Mantra, Skill Bottle)
- AI-generated names with "Genesis:" prefix
- Can be listed on Trade Circle marketplace

**144-Slot Cap on Founding Architect:**
- Maximum 144 Founding Architect slots
- Slot number tracked per architect
- Remaining slots visible in status endpoint and UI

**Tests**: Iterations 173-174 — 100% Backend / 100% Frontend

### 90-Second Cinematic Intro & JS Modularization (Apr 1, 2026)

**Cinematic Intro (/intro route):**
- 5-level visual progression: Physical (amber) → Emotional (rose) → Mental (silver) → Intuitive (indigo) → Pure Consciousness (gold halo)
- Auto-advances every 4 seconds through all levels
- Manual navigation via clickable level dots
- Skip button → /auth, CTA → "Start 7-Day Free Ultra Trial"
- Fullscreen: hides Navigation, SmartDock, CosmicBackground, CosmicMesh

**Dashboard.js Modularization:**
- Reduced from 1250 → 496 lines (60% reduction)
- 12 section components extracted to `components/dashboard/DashboardSections.js` (~740 lines)
- StatsSection, CosmicWeatherSection, NexusIntentSection, PinnedSection, SuggestionsSection, ScriptureSection, CoherenceSection, ChallengeSection, WisdomSection, MoodsSection, RecommendationsSection, ActionsSection

**RPGPage.js Cleanup:**
- Inline sub-components reformatted and consolidated (StatBar, ItemCard, EquipSlot, RegionNode, BossCard, QuestCard)
- Constants grouped at top (STAT_ICONS, STAT_COLORS, SLOT_ICONS, RARITY_BG, RARITY_COLORS)

**Tests**: Iteration 175 — 100% Backend / 100% Frontend

### Closed-Loop Content Factory & Founding Architect (Apr 1, 2026)

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

### AI Content Broker & Fidelity HUD (Apr 1, 2026)

**User Tier Discount Matrix**: Base 0%, Premium 15%, Elite 30%
**Fidelity HUD Boost**: 3 packs (24h/72h/168h), Dust or Credits, nav HUD with timer
**Free 7-Day Ultra Trial**: One-time for new users
**AI Content Generation**: Recovery Frequencies, Victory Mantras, Group Immersions, Cosmic Blends
**Content Marketplace**: Type filters, tier pricing, 95% creator / 5% platform split

### Central Bank, Mantras, Avatars, Atmosphere Switch (Apr 1, 2026)

**Tiered Dust Sales**: Base 0%, Medium 15%, Premium 30% Supernova
**30% Return Penalty**: Processing fee on sell-backs
**Atmosphere Switch**: 3 levels (Simplified/Standard/Ultra-Immersive) + CSS variable system
**Sacred Mantras**: 31 mantras in 12 categories throughout the app
**Game Avatars**: 10 characters (4 Free/3 Earned/3 Premium), mood-resonant states
**Cosmic Broker (Stripe)**: 4 Credit Packs, AI Merchant, Phygital Escrow
**Hidden Dev Console**: Triple-tap nav logo

### Earlier Systems (All Tested)
- Deep Click E2E, Universal Inventory Bridge, Transmute Panel, Latency Pulse
- World Veins, NPC Rivals, RPG Bosses, Economy Admin
- Living Journal, Refinement Lab, SmartDock, Wisdom Evolution
- PEP, Marketplace, Seasonal Cycles, 5-Layer Universe
- Rock Hounding, Dream Realms, Daily Quests, RPG, Auth, AI Coach

## Key Architecture

```
/app/backend/routes/
  consciousness.py    # Five Levels progression, XP tracking, feature gating, display mode
  forge.py            # Tool Forge, Skill Generator, Genesis Mint, God Mode Dashboard, inventory
  revenue.py          # Tiers, Fidelity Boost, AI Content Broker, Predictive Wellness, Founding Architect (144-cap)
  content_factory.py  # Auto-generation functions (victory mantra, recovery frequency)
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker (Stripe)
  content.py          # Mantras, Game Avatars
  rpg.py              # Quests (with auto-gen hook), Inventory, Bosses
  meditations.py      # Mixer (with auto-gen hook), Soundscapes

/app/frontend/src/
  components/
    ConsciousnessPanel.js  # Level display, XP bar, aura (updated colors), rank badge, display mode toggle
    CosmicForge.js         # Tool Forge + Skill Generator + Inventory UI
    GodModeDashboard.js    # Level 5 / Founder real-time economy feed
    GenesisMint.js         # 1-of-1 Genesis artifact minting UI
    FidelityHUD.js, CosmicPrescription.js, FoundingArchitect.js
    MantraSystem.js, GameAvatar.js, DevConsole.js, ImmersionToggle.js
    trade/CosmicBroker.js, trade/EscrowDashboard.js, trade/ContentBroker.js
  pages/
    TradeCircle.js (11 tabs: Browse, Broker, Forge, Content, Escrow, Genesis, God Mode, Avatar, My Listings, Offers, Karma)
    Dashboard.js, Settings.js, RPGPage.js, CosmicMixerPage.js
```

## Key DB Collections
- `users`: wallet, game_avatar, fidelity_boost, founding_architect, credits.tier, consciousness (xp, level, display_mode, activity_log)
- `forge_items`: Tool and skill items with rarity, properties, listing status
- `content_assets`: AI-generated marketplace items (auto_generated flag)
- `content_purchases`, `boost_transactions`, `broker_transactions`, `escrows`

## Credentials
- Trade Test: grad_test_522@test.com / password (Founding Architect, Elite)
- RPG Test: rpg_test@test.com / password123
- Founding Architect Codes: COSMIC-FOUNDER-2026, RAPID-CITY-ARCHITECT, STARSEED-TESTER

## Upcoming Tasks

### P0
- **Starseed Energy Gates** — Progression checkpoints requiring traded materials/polished gems

### P1
- **Earned Avatar Auto-Unlock** — Milestones trigger avatar unlocks
- **Practice Mechanic** — Resonance Skill from Mixer/Trade usage
- **Party System (Circle/Coven)** — Private social spaces
- **Mixer Trades / Vibe Capsules** — Audio creations as tradeable assets

### P2
- Avatar spatial navigation, Myths & Legends, AI Scene Recreations
- GPS Hotspot Spawning, Biometric Sync
