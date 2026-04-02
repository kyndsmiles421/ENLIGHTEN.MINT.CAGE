# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. A "Phygital Marketplace" with a centralized "Central Bank" economic model, AI Content Broker revenue engine, and closed-loop content factory.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Power Spot Admin Dashboard & Celestial UI Toggle (Apr 2, 2026) — LATEST

**Power Spot Admin Dashboard (`/admin/power-spot`):**
- Leaflet map where clicking drops a GPS pin for a new Power Spot
- Create form: name, lat/lng (6 decimal precision), description, reward multiplier, radius, active hours
- CRUD operations: deploy, edit (lat/lng/multiplier/desc), delete Power Spots
- "Go Live" toggle: broadcasts spot to all users, creates notification
- Active Broadcasts panel showing recent go-live events
- Deployed Spots list with LIVE/OFFLINE status badges
- Navigate-to-spot button for quick map centering

**Optional Live GPS Tracking (Food Truck):**
- Per-spot Track/Stop toggle button in admin dashboard
- When ON: uses `navigator.geolocation.watchPosition` + 10s interval pings to `PUT /update-location`
- Pulsing "GPS Tracking Active" indicator with last-updated timestamp
- "GPS" badge on spot card header when tracking is active
- Backend rejects location updates when tracking is disabled (guard rail)
- Admin includes_all=true query param shows inactive spots too

**Celestial Dimensional Toggle (in CosmicMap):**
- Ground/Celestial layer toggle button in HUD
- Celestial layer replaces Leaflet map with canvas-based Star Chart
- 6 constellation nodes: Orion's Gate (741Hz), Sirius Nexus (852Hz), Pleiades Beacon (963Hz), Vega Alignment (741Hz), Polaris Lock (852Hz), Antares Bridge (963Hz)
- Click-to-select nodes on star chart, alignment action (60%+ accuracy required)
- Quadratic decay visualization (0.9^t² formula) with pulsing warning

**Backend Fix:** Resolved SyntaxError where `harvest_power_spot` function was split by `go-live` and `broadcasts` route definitions.

**Routes:** `/admin/power-spot` (frontend), Power Spots CRUD + Go-Live + Live Tracking + Broadcasts backend
**Tests:** Iterations 189-190 — 100% Backend / 100% Frontend

### Cosmic Map, Forge Mini-Game & Exponential Decay (Apr 2, 2026)

**Resonance Forge Mini-Game:**
- Waveform matching puzzle for crafting Resonance Builds
- 3 forge patterns: Kinetic Amplifier (432Hz), Zen Flow (528Hz), Chrono-Alchemist (396Hz)
- 13-point waveform with tolerance bands; 70%+ accuracy to forge
- Time-limited (8-12s), time bonus for fast completion
- Canvas-based interactive drawing with real-time point scoring

**Exponential Decay Engine:**
- Formula: y = a × 0.9^days_inactive (decay rate 0.9 per day)
- Minimum resonance floor: 5 (never drops to zero)
- At-risk warning when >0.5 days inactive
- Pulse speed visualization: 0.5 + (days × 0.3), max 3.0 — more erratic as decay worsens
- Applied on app open, visualized in Global Tickers with pulsing red warning

**Cosmic Map (GPS Foundation):**
- Full Leaflet + OpenStreetMap dark CARTO tiles map page
- Procedurally generated nodes based on user coordinates + daily seed
  - 4 Kinetic Nodes (amber, +8-20 Kinetic Dust)
  - 3 Botanical Spots (teal, +5-12 Science Resonance)
  - 3 Star Anchors (violet, +7-17 Science Resonance)
- Proximity-based harvesting (50m radius)
- Rarity system: common/uncommon/rare with reward multipliers
- Node detail slide-up panel with distance, reward, and harvest button
- HUD overlay: coordinates, node type counts, daily harvest summary
- Top-level navigation under Explore category

**Backend Routes:** `/api/cosmic-map/` (decay-status, apply-decay, forge/pattern, forge/attempt, nodes, harvest, harvest-history)
**Frontend:** `/cosmic-map` page, ForgePanel component, decay warning in MasteryAvenues
**Tests**: Iteration 188 — 100% Backend (13/13) / 100% Frontend

### Three Avenues Cosmic Glass Overhaul (Apr 2, 2026)

**UI Reorganization: Six Pillars → Three Avenues of Flow:**
- Material Avenue (Industrial Amber): E-Bike Engineering + Circular Economy
  - Currency: Kinetic Dust
  - Visual: Copper-toned glass, amber accent, 60% opacity expanded
- Living Avenue (Botanical Teal): Botanical Lab + Biometrics + Art
  - Currency: Science Resonance (Low-Mid)
  - Visual: Teal/Mint glass, organic borders, pulse animations
- Ancestral Avenue (Aetheric Violet): History/Alchemy + Sacred Geometry + Thought
  - Currency: Science Resonance (High)
  - Visual: Violet/Gold glass, geometric lines

**Cosmic Glass Design System:**
- Glassmorphism: backdrop-filter blur(8px), rgba(15,15,25,0.6) backgrounds
- Collapsed state: 20% opacity, 10px blur, color-coded edge glow
- Expanded state: 60% opacity, pillar panels slide down
- Global Pinned Tickers: Resonance, Kinetic Dust, Sci Resonance, Tier
- Three-level Information Layering (Glance/Active/Deep-Dive)

**Scaling Marketplace (Education Packs):**
- 9 Education Packs across 3 avenues (material/living/ancestral)
- Dynamic pricing: flat, moderate (×0.3/level), high (×1/level), milestone (×1/3levels)
- Material: E-Bike Performance Maps (Urban/Mountain/Endurance)
- Living: Foundational Lab Kits (Aquafaba/Extraction/Emulsion)
- Ancestral: Alchemy Tiers (Calcination/Dissolution) + Sacred Site Blueprints
- Integrated within each avenue accordion (not separate menu)

**Resonance Builds (Crafting System):**
- 3 builds: Kinetic Amplifier (1.25x dust), Zen Flow (1.2x res), Chrono-Alchemist (1.3x res)
- Each requires specific shop items to be owned before crafting
- Passive bonuses to currency generation

**Widget Overlap Fix:**
- FloatingAssistant: bottom-[72px] right-4 z-[90]
- QuickMeditationWidget: bottom-6 right-4 z-[88]
- Proper vertical stacking with no overlap

**Tests**: Iteration 187 — 100% Backend (19/19) / 100% Frontend

### Science/History Avenues & Circular Economy (Apr 2, 2026)

**Avenue of Science (The Alchemist):**
- Botanical Lab: 5 chemistry simulations with slider-based variable tuning
  - Aquafaba Air Matrix, Monk Fruit Pectin Gelation, Coconut-Hemp Emulsion, Kona Extraction, Lychee Crumb
  - Each sim scores proximity to optimal values (0-100%), mastery at 70%+
  - Science notes explain real chemistry behind each simulation
- Geology Modules: 3 Q&A modules (Earth Layers, Mohs Hardness, Rock Cycle)
- E-Bike Engineering: 2 dual-motor torque/range simulations
  - Torque vs Range: front/rear motor split, terrain, rider contribution
  - Battery Physics: Wh, wattage, speed → estimated range calculation
  - Real-time range display updates as sliders move (P = τ·ω)
- Heart Rate Sync Challenge: match BPM to planetary depth frequency

**Avenue of History (The Chronicler):**
- 4 History modules: Ancient Star Charts, Sacred Sites & Ley Lines, Evolution of Transport, History of Alchemy
- Question-by-question progression with hints and resonance rewards
- Civilization and era context for each module

**Circular Economy Marketplace:**
- 8 shop items across 3 categories: E-Bike Parts, Yoga Equipment, UI Skins
- Dual currency: Kinetic Dust (from Biometrics) and Science Resonance
- Rarity system: Common → Uncommon → Rare → Legendary
- Purchase tracking in economy_purchases collection
- Balance display and category filtering

**Frontend Components:**
- `/components/avenues/BotanicalLabPanel.js` — Slider-based lab simulations
- `/components/avenues/EBikePanel.js` — Torque/range simulator with live output
- `/components/avenues/HistoryPanel.js` — History + Geology Q&A with progress dots
- `/components/avenues/CircularEconomyPanel.js` — Shop with purchase flow

**Tests**: Iteration 186 — 100% Backend (15/15) / 100% Frontend

### Quantum Mechanics & Planetary Stratigraphy (Feb 2026)

**Fractal Sub-Layer Engine (L² Computing Model):**
- 54 total sub-layers: Crust(2²=4) + Mantle(3²=9) + Core(4²=16) + Hollow(5²=25)
- Each sub-layer has unique name, frequency, dust cost, XP reward
- Local Density Rendering: only compute active sub-layer, others collapsed
- Navigation costs dust on first visit, grants XP
- Syncs with planetary depth system

**Six Mastery Avenues (The Six-Pillared Trinity):**
- Mathematics (The Architect): 19 Sacred Geometry challenges (phi, Fibonacci, Metatron, Euler + algebra, trig, calculus, number theory)
  - Categories: sacred_geometry, algebra, trigonometry, calculus, number_theory
  - Achievement: Mathematical Equilibrium → predict Shadow collapse points
- Art (The Visionary): 5 visual resonance prompts
  - Achievement: Vision Mode → stabilize frequencies through aesthetic symmetry
- Thought Theory (The Philosopher): 6 Integration Quests with Jungian archetypes
  - Achievement: Total Individuation → internal/external consciousness sync
- Biometrics (The Sentinel): 8 physical activity types (walking, cycling, running, yoga, martial arts, dance, gym, moving meditation)
  - Kinetic Dust generation: physical effort → cosmic dust (1:1 conversion)
  - Heart Rate bonus: 1.5x dust when BPM within target range
  - Frequency affinity: low-intensity→surface layers, high-intensity→deep layers
  - Achievement: Biological Equilibrium → body as instrument
- Science (The Alchemist): Botanical Lab (5 sims), Geology (3 modules), E-Bike Engineering (2 sims)
  - Achievement: Alchemical Mastery → transform knowledge into creation
- History (The Chronicler): 4 history modules, ancient civilizations, transport evolution
  - Achievement: Temporal Mastery → past and present converge
- Resonance tiers: Initiate→Apprentice→Adept→Master→Grandmaster (0-1000)
- Combined tiers: Seeker→Wayfinder→Resonant→Harmonic→Transcendent

**Fractal Completion Bonus:**
- When all L² sub-layers in a depth are explored → "Depth Mastery" badge
- Bonus: 20 XP per sub-layer (Crust=80, Mantle=180, Core=320, Hollow=500)
- Tracked in mastered_depths array

**Tests**: Iteration 185 — 100% Backend (19/19) / 100% Frontend

**Dimensional Space — The "Demens" Grid (12-Cell Multiverse):**
- 2-axis navigation: Vertical Depth (4 layers) × Horizontal Frequency (3D/4D/5D)
- 3D (Physical): Linear Time, standard GPS, level 1+
- 4D (Astral): Non-Linear / Superposition, Shadow Sprites, level 2+
- 5D (Causal): Entanglement / Unity, shared consciousness, level 3+
- Phase-Shifting: Costs 30 dust per dimension jump ascending, free descending
- Endpoints: grid, phase-shift, status, collective-shadow-map

**Master View — Central Nervous System Audit:**
- Aggregates: player, stratigraphy, psyche, dimensional, quantum, frequency_scaling, subsystems, system_health
- Real-time monitoring of all subsystem states
- Endpoint: /api/master-view/audit

**Collective Shadow Map:**
- Global aggregate heatmap of all players' collapsed Shadow Sprites
- MongoDB aggregation pipeline on quantum_shadows collection
- Hotspot clustering by lat/lng with rarity breakdown
- World map visualization with animated dots

**Tests**: Iteration 183 — 100% Backend (39/39) / 100% Frontend

**Planetary Stratigraphy (4-Layer Depth System):**
- Crust (Surface, 432 Hz, Earth, Persona archetype) — Standard gameplay
- Mantle (Transition, 396 Hz, Fire, Shadow archetype) — High pressure, sacred geometry
- Outer Core (Plasma Sea, 285 Hz, Water, Anima archetype) — Fluid gravity, quantum tunneling
- Hollow Earth (Inner Core, 174 Hz, Ether, The Self archetype) — Inverted gravity, Central Sun
- Consciousness gating: Level 1/2/3/4 for each layer
- Psyche state tracking maps Jungian archetypes to depth
- Endpoints: layers, descend, depth-status, frequency-map

**Quantum Mechanics (Phase 2):**
- Shadow Sprites: Procedural entities in superposition at GPS locations (SHA256-seeded)
  - 4 types: Echo (common), Fragment (uncommon), Archetype (rare), Doppelganger (legendary)
  - 50m observation radius to collapse wave function
  - Jungian integration prompts on collapse
  - Dust + XP rewards per rarity
- Quantum Tunneling: Direct layer traversal costing Cosmic Dust (level 2+)
  - Ascending: 10 dust; Descending: 40 dust per layer crossed
- Entanglement Bonds: Player-to-player quantum links (max 3)
  - Track partner's layer position

**Frontend:**
- `/planetary-depths` — Cross-section visualization with 4 layer bands, frequency spectrum, descent modal with vibrational transition overlay
- `/quantum-field` — Shadow sprite discovery page with GPS, collapse animations, history panel

**Tests**: Iteration 182 — 100% Backend (39/39) / 100% Frontend

### Activity Loop & Streak Heatmap (Feb 2026)

**Activity Loop (Infinite Engagement):**
- GET /api/activity-loop/progress — Unified view of 7 systems
- GET /api/activity-loop/heatmap?days=91 — 91-day calendar
- Connects: Resonance→Dust, GPS→Gems, Gems→Polish, Polish→Gates, Trades→Gates, All→Consciousness, Travel→Gates

**Streak Heatmap Dashboard Widget:**
- 91-day GitHub-style heatmap, element-color-coded, hover tooltips
- Quick stats grid, Engagement Loops mini-panel, streak badge
- CTA linking to Trade Circle

**Tests**: Iteration 181 — 100% Backend (15/15) / 100% Frontend

### Resonance Practice, Mantra of the Day & Rapid City Hotspots (Apr 1, 2026)

**Resonance Practice (5 Practice Types):**
- Meditation (Water, 30s min, 5-15 dust, +10 XP)
- Breathwork (Air, 20s min, 4-10 dust, +8 XP)
- Earth Grounding (Earth, 45s min, 6-21 dust, +12 XP)
- Flame Visualization (Fire, 60s min, 8-32 dust, +15 XP)
- Mantra Chanting (Ether, 90s min, 10-50 dust, +20 XP)
- Quality mini-game: rhythmic tapping for consistency score
- Streak bonuses: 3d=1.1x, 7d=1.25x, 14d=1.4x, 30d=1.6x, 60d=1.8x, 90d=2.0x
- Consciousness level multipliers: L1=1x, L2=1.3x, L3=1.6x, L4=2x, L5=2.5x
- 10 sessions/day limit
- Endpoints: practices, complete, history

**Mantra of the Day Widget:**
- Dashboard widget with daily rotating mantra
- Cached in localStorage per day for consistency
- Shows energy + category labels
- Refresh button on hover

**Rapid City Local Hotspots (5 sites):**
- Memorial Park Spring (Water/Uncommon)
- Skyline Drive Overlook (Earth/Uncommon)
- Storybook Island Grove (Air/Uncommon)
- Dinosaur Park Summit (Fire/Uncommon)
- Canyon Lake Reflection (Water/Rare)
- Collect radius tightened to 50m (was 300m)

**Tests**: Iteration 180 — 100% Backend (15/15) / 100% Frontend

### Chinese Language, Expanded Mantras & Cinematic Gameplay Showcase (Apr 1, 2026)

**Chinese (Mandarin) Language Mode:**
- Added Chinese (中文) as 2nd language option (8 total: EN, ZH, ES, FR, HI, JA, AR, PT)
- Full UI translations for all navigation, auth, pricing, mixer, dashboard, and common keys
- Persisted in localStorage as `cosmic_lang`

**Expanded Mantra Library (31 → 96 mantras, 17 categories):**
- 15 Chinese/Daoist mantras (道可道非常道, 上善若水, 天人合一, 南无阿弥陀佛, etc.)
- New categories: `chinese`, `gates`, `explore`, `cosmic` (expanded), `healing` (expanded)
- Mantras with `lang: "zh"` field for language-specific filtering

**Cinematic Intro Gameplay Showcase:**
- Each of the 5 levels now shows 3 feature showcase cards with icons and descriptions
- Level 1: Rock Hounding, RPG Battles, Daily Quests
- Level 2: Dream Realms, Living Journal, Mood Tracker
- Level 3: Cosmic Forge, Trade Circle, Energy Gates
- Level 4: Cosmic Mixer, GPS Hotspots, Refinement Lab
- Level 5: God Mode, Genesis Mint, Gate of Source
- Cards animate in with staggered delays and glow pulses
- 6 seconds per level (increased from 5 to accommodate cards)

**Tests**: Iteration 179 — 100% Backend (12/12) / 100% Frontend

### GPS Location-based Hotspots (Apr 1, 2026)

**Static Sacred Sites (8 Landmarks):**
- Sedona Vortex (Earth/Legendary), Stonehenge (Ether/Legendary), Machu Picchu (Air/Legendary), Mount Fuji (Fire/Legendary)
- Ganges Source (Water/Rare), Cenote Ik Kil (Water/Rare), Uluru (Earth/Rare), Aurora Gateway (Ether/Rare)

**Dynamic Hotspots (Procedural):**
- 5 hotspots spawn within 2km of user position, refreshing every 4 hours
- Deterministic generation using SHA256(user_id + time_window) for consistency
- Random element assignment, weighted tier distribution (common/uncommon/rare)

**Collection Mechanics:**
- 300m collect radius (haversine distance)
- 2-hour cooldown per hotspot after collection
- Rewards: Cosmic Dust (5-120 based on tier), XP (15-150), raw gems (10-85% chance)
- Raw gems feed into Refinement Lab → polished gems → Energy Gate requirements

**Frontend:**
- `/hotspots` page with GPSRadar component
- `useGeolocation` hook (permission handling, watch mode, error states)
- Hotspot cards with element icons, tier styling, bearing arrows, distance, expand/collect
- Collection history panel
- Added to Explore nav menu

**Backend:** 4 endpoints (static-sites, nearby, collect, history)

**Tests**: Iteration 178 — 100% Backend (19/19) / 100% Frontend

### Starseed Energy Gates, Gate Notifications & TradeCircle Modularization (Apr 1, 2026)

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

## Credentials
- Trade Test: grad_test_522@test.com / password (Founding Architect, Elite)
- RPG Test: rpg_test@test.com / password123
- Founding Architect Codes: COSMIC-FOUNDER-2026, RAPID-CITY-ARCHITECT, STARSEED-TESTER

### Activity Loop & Streak Heatmap (Feb 2026)

**Activity Loop (Infinite Engagement):**
- GET /api/activity-loop/progress — Unified view of 7 interconnected systems: Resonance→Dust, GPS→Gems, Gems→Polish, Polish→Gates, Trades→Gates, All→Consciousness, Travel→Gates
- GET /api/activity-loop/heatmap?days=91 — 91-day activity calendar aggregating resonance practice, hotspot collections, and XP events per day
- Overview: 12 metrics (consciousness_level, xp, dust, polished_gems, raw_gems, trades, gates_unlocked, resonance_sessions, resonance_streak, hotspot_collections, realms_visited, quests_done_today)

**Streak Heatmap Dashboard Widget:**
- 91-day GitHub-style heatmap with element-based color coding (earth/water/fire/air/ether)
- Intensity levels (0-4) based on daily activity count
- Hover tooltips showing per-day breakdown (practice, hotspot, dust earned)
- Quick stats grid: Level, Dust, Gates, Gems
- Engagement Loops mini-panel showing 7 active/inactive system connections
- Streak badge for consecutive practice days
- CTA linking to Trade Circle

**Tests**: Iteration 181 — 100% Backend (15/15) / 100% Frontend

## Key Architecture

```
/app/backend/routes/
  planetary.py        # 4-layer planetary stratigraphy, psyche tracking, descent
  quantum.py          # Shadow sprites, quantum tunneling, entanglement bonds
  dimensions.py       # 3D/4D/5D dimensional grid, phase-shifting, collective shadow map
  master_view.py      # Central nervous system audit with taste test
  sublayers.py        # L² fractal sub-layer engine (54 total layers)
  avenues.py          # 3 Mastery Avenues (Mathematics/Art/Thought)
  activity_loop.py    # Unified cross-system progress + 91-day heatmap
  gps_hotspots.py     # GPS static sites + dynamic hotspots, collection, history
  resonance.py        # Practice mini-game (5 types, streak bonuses)
  energy_gates.py     # Starseed Energy Gates (5 gates, time/travel/warp)
  consciousness.py    # Five Levels progression, XP tracking, feature gating
  forge.py            # Tool Forge, Skill Generator, Genesis Mint, God Mode Dashboard
  revenue.py          # Tiers, Fidelity Boost, AI Content Broker, Founding Architect
  content_factory.py  # Auto-generation functions
  trade_circle.py     # Central Bank, AI Merchant, Escrow, Broker
  refinement.py       # Gem polishing/tumbler (feeds into Energy Gates)
  content.py          # Mantras (96 total, 17 categories, Chinese support), Game Avatars
  rpg.py              # Quests, Inventory, Bosses
  meditations.py      # Mixer, Soundscapes

/app/frontend/src/
  components/
    StreakHeatmap.js         # 91-day activity heatmap + engagement loops
    MantraOfTheDay.js        # Dashboard daily mantra widget
    ResonancePractice.js     # Tapping mini-game
    GPSRadar.js              # Hotspot radar UI with cards, history, geolocation
    ConsciousnessPanel.js    # Level display, XP bar, aura
    CosmicForge.js           # Tool Forge + Skill Generator
    GodModeDashboard.js      # Economy feed
    GenesisMint.js           # 1-of-1 minting UI
    trade/
      TradeCircleWidgets.js  # Extracted modals/cards (9 components)
      CosmicBroker.js, EscrowDashboard.js, ContentBroker.js
    dashboard/
      DashboardSections.js   # 12 dashboard widgets
  hooks/
    useGateNotifications.js  # Global realm travel tracking
    useGeolocation.js        # Reusable GPS hook
  pages/
    TradeCircle.js (12 tabs: Browse, Gates, Broker, Forge, Content, Escrow, Genesis, God Mode, Avatar, My Listings, Offers, Karma)
    HotspotsPage.js, PlanetaryDepths.js, QuantumField.js
    DimensionalSpace.js, MasterView.js, CollectiveShadowMap.js
    FractalEngine.js, MasteryAvenues.js
    Dashboard.js, Settings.js, RPGPage.js, CinematicIntro.js
```

## Key DB Collections
- `users`: wallet, consciousness (xp, level, activity_log), founding_architect, credits
- `planetary_depth`: user_id, current_layer, psyche_state, unlocked_layers[], descent_history[]
- `sublayer_progress`: user_id, explored_sublayers[], current_sublayer, exploration_log[]
- `avenue_progress`: user_id, mathematics{resonance, completed_challenges[]}, art{...}, thought{...}
- `dimensional_state`: user_id, current_dimension, total_shifts, shift_history[]
- `quantum_shadows`: user_id, collapsed[], total_collapsed, total_dust
- `quantum_entanglements`: bond_id, user_a, user_b, active, resonance_score, shared_events[]
- `energy_gates`: user_id, unlocked[], unlock_history[]
- `energy_gate_travel`: user_id, realms[], visited_at
- `resonance_practice`: user_id, total_sessions, current_streak, history[]
- `hotspot_collections`: user_id, total_collections, history[]
- `forge_items`: Tool/skill items with rarity
- `content_assets`: AI-generated marketplace items
- `rpg_inventory`: Items including polished gems (state: "polished")

## Upcoming Tasks

### P0 — Jungian Archetypes & Study Doorways (Phase 3B)
- **Archetypal NPCs** at layer transitions (Wise Elder in Mantle, Anima/Animus in Outer Core, The Self in Hollow Earth)
- **Knowledge Study Sections** — Educational doorways for Geology, Quantum Physics, Jungian Psychology, Botany — each linking into the game loop
- **Shadow Integration Quests** — defeat/integrate Shadow to stabilize area frequency
- **Vibrational Shift Audio** — Frequency scaling with Web Audio API

### P1
- **Vibe Capsules** — Quantum-state trade items from depth frequencies
- **Synchronicity Events** — Circle/Coven party system with entanglement-based events
- **Party System (Circle/Coven)** — Private social spaces with Quantum Entanglement
- **Geology Information System** — Rock identification with educational content
- **Community Garden Center** — Plant identification and cultivation tips

### P2
- **Vision Mode / Active Imagination** — AI dreamscapes from activity data
- **Quantum Haptics** — Erratic vibration patterns at deeper layers
- **Myths & Legends Encyclopedia** — AI Scene Recreations
- Avatar spatial navigation, Biometric Sync
