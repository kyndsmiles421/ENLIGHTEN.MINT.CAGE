# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform with orbital navigation, physics-based interactions, and a tiered subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API
- **PWA**: Service Worker with Solfeggio wave table + instrument caching

## Core System — Bipolar Gravity Ecosystem

### Sovereign Crossbar (fixed top-12, below Navigation)
- Fixed at top-12 (48px below nav), z-[200], 5 draggable module poles
- SNAP_THRESHOLD = 150px, Luminous Tether, Vacuum Catch Y < 115px

### SuanpanPhysics Engine
- Inverse-Square Gravity, Variable Inertia (TIER_FRICTION 0.970→0.997)
- Luminous Trail (4→24 frames), Predictive Snap, Bubble Expansion (300→850ms)

### Weighted Authority
| Tier | Gravity | Bloom | Friction |
|------|---------|-------|----------|
| 1 | 1.0x | 1.0x | 0.980 |
| 2 | 1.3x | 1.4x | 0.988 |
| 3 | 1.8x | 2.0x | 0.993 |
| 4 | 2.5x | 3.0x | 0.997 |

### NebulaSphere (Canvas 2D)
- Golden ratio vertices, Luminous Trail, Double-tap → Bubble Burst, Predictive Snap haptics

### Bubble Burst Portal
- Tiered clip-path (T1=300ms chime → T4=850ms bass rumble), horizontal snap-scroll

## Phonic Resonance Architecture

### Solfeggio Frequencies
Spotless=432Hz, Cafe=528Hz, Tech=741Hz, Meditation=396Hz, Stars=852Hz, Wellness=639Hz, Creative=963Hz

### Generative Flourish
- Movement tracking → Gemini 3 Flash sonic profile (algorithmic fallback)
- Patterns: steady, ascending, descending, arpeggio, ambient, pulsing

### Phase-Locked Proximity Harmonics + Haptic Sync
- Interval-specific haptics: soft [10,20,10,20,10] for 3rds → sharp [30,5,30,5,40] for octaves
- Inverse-square intensity (1/d²), 400ms debounce

### Predictive Sonic Tug
- Cross-fade to destination frequency, Doppler-like shift

### Harmonic Memory
- Tracks pairings >0.6 intensity for 3s → bookmark
- Adjusts initial sphere positions using closeness_factor

### Session Harmony Score
- 0-100 score with 6 grades: Dormant → Seeking → Awakening → Resonant → Harmonious → Transcendent
- Breakdown: resonance_alignment (40pts), exploration_diversity (30pts), harmonic_depth (30pts)
- SVG ring in Control Center (SmartDock HarmonyNPU panel), fetches every 30s (batched)
- Compact badge on dock pill when panel is closed

### Resonance Streak / Golden Pulse
- 3+ consecutive sessions with score ≥ 75 triggers golden pulse + XP award
- XP: 50 base + ((streak // 3) - 1) * 25 per cycle
- Streak dots, best streak, total XP in Control Center panel
- Global golden pulse overlay + XP flash animation

### Organic Audio Engine
- Route-based instrument synthesis: singing_bowl (meditation), flute (star-chart), tabla (elixirs), crystal_bowl (frequencies)
- 2.5s delay after route change for layered organic texture
- Service Worker INSTRUMENT_CACHE for offline support

## Control Center (SmartDock Unified Hub)
- **Architecture**: SovereignHUD data merged into SmartDock as "Control Center" panel
- **Harmony Score**: SVG ring + breakdown bars (Alignment/Explore/Depth)
- **Resonance Streak**: Streak dots + counter + best/XP stats
- **NPU Queue**: Done/Queue/Errors stats + stream visualization canvas
- **Performance**: Canvas only renders when panel is visible (not continuous rAF)
- **Batch Timer**: Single 30s cycle for harmony-score + streak-check (consolidated from 3 timers)
- **Mobile**: Larger touch targets (36px mobile vs 30px desktop), swipe-up gesture to open panel
- **Golden Pulse/XP Flash**: Global overlays via SmartDock portal

## PWA Offline Resilience
- Service Worker caches 7 Solfeggio wave tables (44.1kHz, 2s sine samples)
- Instrument profiles cached for offline support
- App shell caching, /solfeggio/{freq} paths

## Multi-Civilization Star Charts
### Culture Layers (Lazy-loaded)
- **Hopi**: Hotomkam (Orion/Three Mesas), Tsootsma (Pleiades/Wuwuchim), Saquasohuh (Blue Star Kachina). 432Hz
- **Egyptian**: Sah (Osiris/Orion), Sopdet (Isis/Sirius), Meskhetiu (Thoth/Ursa Major). 528Hz
- **Vedic**: Ashwini, Rohini, Pushya, Swati (Nakshatras). 741Hz
- CultureLayerPanel in StarChart (top-28 left-4) with teachings display
- Also in star_cultures_data.json (21 total cultures)

## Sovereign Mastery — 4-Tier Certification
| Tier | Name | Requirement |
|------|------|-------------|
| 1 | Novice / Seeker | Core Orientation |
| 2 | Practitioner | 10 Mixer Collisions |
| 3 | Specialist | Avenue Certification |
| 4 | Sovereign | Mastery of 12 Units |

3 Avenues: Spotless Solutions, Enlightenment Cafe, Tech/Dev (5 lessons each, 1100 XP)

## API Endpoints
### Phonic: /api/phonic/
- POST record-movement, POST generate-flourish, GET harmonic-pairs, GET movement-summary
- POST record-harmonic, GET harmonic-memory, POST harmony-score
- POST streak-check, GET streak-status

### Culture: /api/culture-layers/
- GET / (list), GET /{layer_id} (full data)

### Mastery: /api/sovereign-mastery/
- GET status, POST record, GET avenues, GET certificates

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SmartDock.js (+ Control Center: Harmony, NPU, Streak)
│   ├── OrbitalMixer.js (Drag-and-Drop Mixer with orbital ring layout, synergy bonds, focus toggle, community panel)
│   ├── ConstellationPanel.js (Save/Browse/Load/Like/Sell constellation recipes + sentinel scan)
│   ├── CommunityPanel.js (Guild channels, identity modes, feed posting with sentinel integration)
│   ├── SovereignCrossbar.js, NebulaSphere.js, NebulaPlayground.js
│   ├── OrbitalNavigation.js, BubblePortal.js
│   ├── CultureLayerPanel.js
│   ├── PersistentWaveform.js (React.memo)
│   ├── LearningToggle.js (Global active education overlay switch)
├── hooks/
│   ├── usePhonicResonance.js (+ ProximityHarmonics + SonicTug + HapticSync)
│   ├── useOrganicAudio.js (External organic instrument synthesis)
│   ├── useHarmonyEngine.js (Consolidated harmony/streak/NPU logic)
├── config/
│   ├── moduleRegistry.js (Plug-and-play module manifest with affinities, tiers, synergy engine)
├── context/
│   ├── FocusContext.js (Auto-immersion focus mode: 3+=focus, 5+=hyper-focus)
│   ├── ClassContext.js (Anthropology class: Shaman/Nomad/Architect/Merchant + XP)
│   ├── TreasuryContext.js (Harmony Credits wallet + purchase flow)
│   ├── ModalityContext.js (Quad-core learning & interaction intensity state)
│   ├── LanguageContext.js (8-language i18n with site-wide toggle)
├── pages/
│   ├── SovereignAdvisors.js (5 AI Advisor cards + chat interface + purchase flow)
│   ├── EconomyPage.js (Subscription UI, Pack Studio / Synthesis Forge)
│   ├── AcademyPage.js (Education Hub & Labs)
│   ├── MasteryPath.js, SuanpanPhysics.js, StarChart.js (+ CultureLayerPanel)
/app/frontend/public/
│   ├── sw.js (Solfeggio + instrument cache)

/app/backend/routes/
│   ├── sovereigns.py (5 Sovereign AI Advisors: chat, history, purchase, bridging)
│   ├── economy.py (4-Tier Subscriptions, Stripe hooks, trade logic)
│   ├── copilot.py (Emergent LLM for AI micro-lessons & Pack Generator)
│   ├── academy.py (Progressive Learning & Forge Labs)
│   ├── ai_broker.py (Trade execution)
│   ├── central_bank.py (Dual currency ledger)
│   ├── quad_hexagram.py (H² Engine state tensor)
│   ├── phonic.py (movement + flourish + harmonics + memory + harmony-score + streak)
│   ├── culture_layers.py (Hopi/Egyptian/Vedic)
│   ├── sovereign_mastery.py
│   ├── classes.py (Anthropology class archetypes + selection + XP)
│   ├── treasury.py (Sovereign Treasury: credits, escrow, 5% fee routing, mirror hook, dashboard)
│   ├── constellations.py (Constellation recipes CRUD + marketplace + mirror hook)
│   ├── sentinel.py (Content Sentinel: scan, log, shadow-mute, stats)
│   ├── guilds.py (Guild channels, identity modes, feed posting)
```

## Iteration History
### Iteration 266 — Sovereign LLM Intelligence Engine (9 Steps) (Apr 3, 2026) — LATEST
- **Step 1: Expert-Domain Fine-Tuning**: Each Sovereign has a high-weight knowledge vector with domain-specific data (rosin temps, molecular weights, Solfeggio Hz, CI/CD patterns, GPS datums, HRV metrics)
- **Step 2: 8-Language Cultural DNA**: Language-specific idioms and teaching styles (not post-processing translation) — e.g., Spanish uses "desplegar" for deploy, Japanese uses katakana technical terms
- **Step 3: Cross-Sovereign Memory**: Unified user state — when you talk to Gaea about harvest, Solis knows you're prepping transport. All 10 Sovereigns share context via `get_unified_state()`
- **Step 4: Sovereign Voice TTS**: OpenAI TTS with unique voice per Sovereign (onyx, shimmer, sage, coral, nova, echo, fable, ash). Void button kills audio instantly
- **Step 5: Symbolic Math Verification**: SymPy-powered server-side validation — `POST /api/sovereigns/verify-math` verifies Solfeggio (174-963Hz), sacred geometry (phi=1.618..., pi, sqrt2), molecular weights (monk fruit 1287.43 g/mol)
- **Step 6: SmartDock Pre-Warm**: `GET /api/sovereigns/pre-warm/{page}` pre-loads context-relevant Sovereign per page
- **Step 7: Adaptive Tone**: Detects user communication style (technical/concise/visionary/exploratory/urgent) and calibrates response cadence
- **Step 8: Usage Yield**: Caspian's persona wired to real Dust Ledger — proactive Architect savings calculations
- **Step 10: Void & Fade-Away**: 3-second message fade timer, translucent color-coded auras, Void button toggles text-only mode
- Tests: Backend 31/31 (100%), Frontend 100%

### Iteration 265 — Full App Consolidation (Apr 3, 2026)
- **Dashboard Council Glance Widget**: Shows user tier, Dust balance, tools owned (0/5), and quick-access pills to top council members with "View All" link
- **Dashboard Economy Action Group**: 6 new shortcuts — Council, Economy, Academy, Cosmic Map, Observatory, Archives — available in Explore & Add Shortcuts
- **Landing Page 7th Pillar**: "Sovereign Council" pillar with 6 highlights linking to Council, Economy, Academy, Trade Circle, Cosmic Map, Archives
- **Expanded Consult Overlay Routing**: PAGE_SOVEREIGN_MAP now covers 70+ routes, mapping every page to its relevant Sovereign (e.g., /meditation→Zenith, /botany→Gaea, /frequencies→Master Harmonic)
- Tests: Backend 17/17 (100%), Frontend 100%

### Iteration 264 — SmartDock "Consult" Integration + Solfeggio Pulse + Sovereign Overlay (Apr 3, 2026)
- **SmartDock Consult Button** with Solfeggio geometric pulse animation (hexagonal ring + inner triangle + center circle)
- **Semi-Transparent Sovereign Overlay**: Slides from right, user stays in flow on current page
  - Context-aware auto-selection: `/economy` → Principal Economist, `/star-chart` → Astraeus, `/wellness` → Zenith, etc.
  - Full chat with persistent message history inside the overlay
  - Member selector dropdown to switch between all 10 accessible council members
  - Cross-member bridging buttons in AI responses
  - **Utility Subsidy Nudge**: Faculty members show unpurchased tool with 10% discount inside overlay
- **Files**: `SovereignConsultOverlay.js` (new), `SmartDock.js` (integrated Consult button + overlay render)
- Tests: Backend 15/15 (100%), Frontend 100%

### Iteration 263 — Sovereign Council: 10-Member Unified Council + Faculty Utility Tools + Tiered Knowledge (Apr 3, 2026)
- **10-Member Sovereign Council** (5 Advisors + 5 Faculty Teachers), each with unique backstory, expertise, and domain
  - **5 Advisors**: Grand Architect, Master Harmonic, Principal Economist, Chief Logistics, Sovereign Ethicist
  - **5 Faculty Teachers**: Astraeus the Star-Mapper, Zenith the Silent, Aurelius the Professor, Gaea the Cultivator, Vesta the Chemist
- **5 Utility Tools** (Faculty-linked, purchasable via Dust with 10% Universal Subsidy):
  - The Orion Engine (1000→900 Dust, Architect tier)
  - The Neural Gateway (500→450 Dust, Sovereign tier)
  - The Iteration Vault (2000→1800 Dust, Architect tier)
  - The Terpene Analyzer (300→270 Dust, Resonance tier)
  - The Molecular Substitute Matrix (800→720 Dust, Sovereign tier)
- **Tier-Based Knowledge Depth**: Discovery=foundational, Resonance=intermediate, Sovereign=advanced, Architect=unrestricted
- **Endpoints**:
  - `GET /api/sovereigns/list` — all 10 members with access status + utility tool pricing
  - `POST /api/sovereigns/purchase-utility` — buy lifetime utility license via Dust
  - `GET /api/sovereigns/utilities` — user's tool inventory
  - `POST /api/sovereigns/chat` — AI chat with tiered knowledge depth
  - `POST /api/sovereigns/purchase-session` — chat session for locked members
- **30% Failure Charge Refund Protocol** on malfunctioning utilities
- **Cross-Council Bridging** between all 10 members
- Tests: Backend 27/28 (96%, 1 skipped), Frontend 100%

### Iteration 262 — 5 Sovereign AI Advisors (Apr 3, 2026)
- **5 Domain-Specific AI Personas**, each hard-linked to a platform module:
  1. **The Grand Architect** (Infrastructure & Deployment) — linked to Architect ($89) tier
  2. **The Master Harmonic** (Sound & Wellness) — linked to Sovereign ($49) tier
  3. **The Principal Economist** (Trade Circle & Dust) — linked to Resonance ($27) tier
  4. **The Chief Logistics Officer** (Market Operations) — linked to Resonance ($27) tier
  5. **The Sovereign Ethicist** (Community & Barter) — linked to Discovery (Free) tier
- **Full Conversational Chat**: Persistent message history in MongoDB (`sovereign_chats` collection)
  - `GET /api/sovereigns/list` — returns all 5 with access status based on user tier
  - `POST /api/sovereigns/chat` — sends message, returns AI response with cross-sovereign bridges
  - `GET /api/sovereigns/history/{id}` — retrieves chat history
  - `DELETE /api/sovereigns/history/{id}` — clears chat history
- **Tier-Gated Access**: Free for matching tier and above; lower tiers purchase sessions via Dust (50 Dust/session)
  - `POST /api/sovereigns/purchase-session` — deducts Dust, creates active session
  - 402 error on insufficient Dust, 403 when accessing locked sovereign without session
- **Monetization Sentinel**: All Sovereigns enforce the Central Broker mandate — cash is obsolete, only Dust moves value
- **Cross-Sovereign Bridging**: Auto-detects [BRIDGE:sovereign_id] tags in AI responses and renders navigation buttons
- **Language-Aware**: Responses in user's selected language via LanguageContext (8 languages supported)
- **i18n Sovereign Names**: Each has localized names (en/es/fr/zh/hi/ja/ar/pt)
- **Frontend**: `/sovereigns` page with 5 cards, chat view, purchase modal, protocol info, data-testids
- Tests: Backend 26/26 (100%), Frontend 100%

### Iteration 261 — 4-Tier Subscription Economy Finalization (Apr 3, 2026)
- **4-Tier Model**: Discovery (Free/$0), Resonance ($27), Sovereign ($49), Architect ($89)
- Discount tiers: 0%, 5%, 15%, 30%. Failed Trade Charge: 30%.
- Tests: Backend 49/49 (100%), Frontend 100%

### Iteration 260 — Dual-Track Economy, Synthesis Forge, Learning Toggle & AI Co-Pilot (Apr 3, 2026)
- **Track 1: App Utility Subscriptions** with Stripe Checkout
  - Discovery (Free) / Resonance ($44.99/mo) / Sovereign ($89.99/mo)
  - `POST /api/economy/subscribe` — creates Stripe checkout for paid tiers
  - `POST /api/economy/downgrade` — switches to free Discovery tier
  - Polymath All-Access Pass ($1,797/yr) — unlocks everything + all packs + Level 4 everywhere
- **Track 2: Learning Packs Marketplace** — 7 one-time purchase packs
  - Mini-Packs ($87–177), Mastery Deep-Dives ($447–897), Business-in-a-Box ($1,347+)
  - `POST /api/economy/purchase-pack` — Stripe checkout for pack purchase
- **4-Level Brokerage Commissions**: Observer (0%) → Practitioner (6.75%) → Professional (13.5%) → Sovereign (27%)
  - Per-domain mastery (can be L4 Culinary and L1 Engineering)
  - Sovereign subscription unlocks Master 27% commission
- **Synthesis Forge** (AI Pack Generator):
  - Command Console: niche field + expertise input + pack type selector
  - `POST /api/copilot/generate-pack` — AI generates full curriculum (24 lessons), assessment challenges, brokerage tags
  - Financial Projections Dashboard: retail price, creator revenue, monthly projection, subscriber discounts, commission rates
  - One-Click Publish Gate: `POST /api/copilot/publish-pack/{draft_id}` deploys to Trade Circle Marketplace
  - `GET /api/copilot/marketplace` — browse active marketplace packs
- **Learning Toggle** (Site-Wide):
  - Floating button renders on all pages, toggles Active Education Mode
  - Toggle ON: "Why" tooltips + AI Co-Pilot active; OFF: clean professional UI
  - `GET /api/copilot/toggle-status` — advancement level, modules completed, subscription tier
  - Progressive Advancement: Observer→Practitioner→Professional→Sovereign based on modules completed
- **AI Co-Pilot** (Gemini 3 Flash):
  - `POST /api/copilot/micro-lesson` — generates personalized micro-lessons based on context + struggle point
  - `GET /api/copilot/hint/{context}` — static context hints for trade/hexagram/wallet/forge/sentinel/subscription/commission
  - 5 quick-context buttons (trade/hexagram/wallet/forge/sentinel) + custom question input
- Tests: Backend 26/26 (100%), Frontend 100%

### Iteration 258 — Site-Wide Progressive Learning & Synthesis Engine (Apr 3, 2026)
- **3-Position Interaction Intensity Switch**: Focus (Passive) / Guided (Active) / Immersive (Catalyst)
  - `GET /api/academy/intensity` — returns current level, auto_advance, all 3 levels with properties
  - `PATCH /api/academy/intensity` — switches intensity and optionally sets auto_advance
  - Focus: Silent mode, H² tracks in background, UI stays clean
  - Guided: Contextual micro-lessons as sidebar notifications (default)
  - Immersive: Full-screen forge takeovers, every action is a potential lab, golden visual overlay
- **Segmented Learning Zones**: Academy restructured into 3 functional sections
  - The Foundation (Core): H² logic, Sacred Geometry, Platform Fundamentals (purple indicator)
  - The Forge (Technical): Development, Engineering, simulation mastery (green indicator)
  - The Collective (Synthesis): Broker Architecture, Circular Economy (gold indicator)
  - Zone tabs filter programs by section, programs tagged with zone metadata
- **Teachable Moments Engine**: Context-aware micro-lessons based on user actions
  - `GET /api/academy/teachable-moments?context=trade` — returns trade-specific micro-lessons
  - `POST /api/academy/dismiss-moment` — permanently dismiss a moment
  - Filtered by intensity level (focus blocks all, immersive enables deep challenges)
  - 6 teachable moment triggers across trade, hexagram, post, constellation, surge, and forge contexts
- **Progressive Auto-Scale Logic**: Detects cognitive efficiency and prompts intensity upgrade
  - `GET /api/academy/auto-scale` — checks thresholds (focus→guided: 200RP+2 modules, guided→immersive: 1000RP+8 modules)
  - Auto-advance is optional (user-toggleable), prompts with accept/dismiss
- **Immersive Mode Visual Overlay**: Golden radial gradient shimmer signifying high-growth state
- **All features optional, not mandatory** — user controls everything via the intensity switch
- Tests: Backend 15/15 (100%), Frontend 100%

### Iteration 253 — Omni-Modality Learning System & Forge Simulation Labs (Apr 3, 2026)
- **Quad-Core Learning Modalities**: 4 learning frameworks (Architect/Gaming, Chef/Applied, Researcher/Analytical, Voyager/Sensory)
  - `GET /api/academy/modalities` — returns all 4 modalities with xp_multiplier, colors, labels
  - `GET /api/academy/modality` — user's current modality (default: architect)
  - `PATCH /api/academy/modality` — switch modality, dynamically reskins all module labels
- **Curriculum Programs**: 3 programs with 16 total modules across Initiate/Apprentice/Journeyman tiers
  - `GET /api/academy/programs` — returns programs with modality-skinned labels, progress tracking
  - Programs: Foundations of the Collective (6 modules), The Art of Transmutation (6 modules), Sentinel Operations (4 modules)
- **Lesson Viewer**: Step-through content system with progress dots, key concepts, and modality-themed UI
  - `GET /api/academy/lesson/{module_id}` — returns lesson content with sections and key_concepts
  - 8 lesson modules with full educational content (Central Bank, Identity, H² Matrix, Dust Strategies, etc.)
- **Forge Simulation Labs**: Interactive H² matrix visualization with animated cluster grid
  - `GET /api/academy/forge/{program_id}/{module_id}` — returns 4×4 cluster matrix, cluster scores, H² state, challenge tasks
  - Canvas-based animated ForgeMatrix component showing real-time cluster interference patterns
  - Determinant indicator pulses based on H² state (positive=green, negative=red)
  - 8 forge challenges with weighted task breakdowns
  - H² determinant validation: labs/tests BLOCK completion if determinant ≤ 0
- **Integrated Accreditation**: Unified scoring with mastery tiers and fractal certificates
  - `GET /api/academy/accreditation` — mastery level, progress_to_next, modules_total, certifications
  - 6 mastery tiers: Initiate → Apprentice → Journeyman → Master → Grand Master → Sovereign
  - MasteryRing SVG component with animated progress
  - Resonance points = weighted_focus_time × complexity × modality_xp_multiplier × 10
  - Dust rewards = 50% of resonance points
- **Dynamic Fractal Certificates**: Canvas-rendered fractal patterns seeded from H² binary state
  - FractalCertificate component generates unique radial/bilateral fractals per certification
  - Fingerprint format: hex segments from 24-bit binary (e.g., "F-3-A-2-7-1")
  - Auto-issued when all program modules are completed
  - Mirrored to sovereign_mirror for admin oversight
- **Academy UI**: Full-featured page with expandable/collapsible programs, modality toggle, accreditation stats grid
- Tests: Backend 19/19 (100%), Frontend 100%

### Iteration 252 — Collective Resonance Dashboard + Harmony Surge + Dynamic Fee Adjuster (Apr 3, 2026)
- **Global Matrix Aggregator**: Background task runs every 60s, pulls all user H² tensors, computes element-wise average across the entire platform
  - `POST /api/resonance/trigger-aggregation` — manual trigger
  - `GET /api/resonance/global` — returns global_density, cross_cluster_resonance, 4×4 cluster_heatmap, surge status
  - `GET /api/resonance/matrix` — full global 24×24 matrix (auth required)
  - `GET /api/resonance/heatmap` — condensed 4×4 heatmap for shader rendering
- **Harmony Surge Detection**: Auto-triggers when global density ≥ 85% or any cross-cluster pair ≥ 85%
  - `GET /api/resonance/surge` — current surge status with triggers and effects
  - Surge effects: commerce fee drops to 0.5% (from 2%), transmutation cost -40% (60:1 instead of 100:1)
  - Platform-wide state stored in sovereign_config for all services to query
- **Dynamic Fee Adjuster (AI Broker)**: `_get_surge_status()` checks for active surge before every trade/transmutation
  - Trade commerce fee: 0.5% during surge (normal 2%)
  - Transmutation ratio: 60 Dust per Gem during surge (normal 100)
  - Surge status included in trade response: `harmony_surge_active`, `commerce_fee_rate`
- **WebGL Heatmap Shader (Frontend)**: `CollectiveResonance.js` with custom GLSL fragment shader
  - Deep indigo → violet → gold → emerald color ramp
  - Cells pulse based on intensity, golden shimmer overlay during surge
  - Grid lines at cluster boundaries
  - 4×4 cluster resonance map with animated resonance bars
  - Cross-cluster resonance bars with threshold indicators
  - Auto-refresh every 30s when panel is open
  - Accessible via "Live" button in Orbital Mixer
- Tests: Backend 23/23 (100%), Frontend 100%

### Iteration 251 — H² Hexagram-Squared Engine + Central Bank/Broker Architecture (Apr 3, 2026)
- **H² Engine (24×24 State Matrix)**: Evolved from linear 24-bit vector to 576-intersection State Tensor
  - `POST /api/quad-hex/resolve-h2` — generates full 24×24 matrix with cross-cluster resonance, density, determinant proxy
  - `compute_h2_matrix()` — phase-weighted interference calculation with cross-cluster resonance bonus (+0.25)
  - `compute_matrix_determinant_proxy()` — positive = additive (trade allowed), negative = extractive (trade blocked)
  - `compute_variable_return_tax()` — 15-45% dynamic tax based on matrix density (replaces flat 30%)
  - `apply_cross_cluster_effects()` — Security×Finance restricts transmutation, Location×Evolution reduces tax, Security×Evolution triggers sentinel escalation
  - `GET /api/quad-hex/tensor` — cached full tensor retrieval
- **Central Bank (Vault/Policy)**: Separated from Broker — manages total supply, monetary policy, reserve vault
  - `POST /api/bank/earn` — Cosmic Dust awarded for platform actions (sweat equity)
  - `GET /api/bank/policy` — circulating supply, reserves, transmutation rates, exit tax stats
  - `POST /api/bank/return-tax` — 30% re-circulated to reserve vault (variable via H² matrix)
- **AI Broker (Trade Circle Gatekeeper)**: Recursive 2-pass verification
  - Pass 1: Fundamental 24-line rule check (security ≥ 8/12, finance ≥ 4/12)
  - Pass 2: H² determinant must be positive (trade adds value to Collective)
  - `POST /api/broker/trade` — returns h2_analysis with pass1/pass2/determinant/density/economy_health
  - `POST /api/broker/transmute` — Dust→Gems gated by hexagram alignment ≥ 25%
  - 2% Harmony Commerce Fee, escrow hold during validation
- **Sacred Geometry Grid (Frontend)**: `HexagramGrid.js` component
  - Phase, alignment, density, determinant summary cards
  - 4 cluster score indicators with line-level visualization
  - Expandable 576-cell interference grid (color-coded by intensity)
  - Cross-cluster resonance bars + interference effects panel
  - Accessible via H² button in Orbital Mixer playground
- **Dual Currency System**: Cosmic Dust (earned) + Celestial Gems (premium)
  - SmartDock shows dust|gems micro-wallet badge
  - TreasuryContext updated with bank/broker API integration
- **Real-Time Feed Notifications**: Polling-based new post indicator on Community button
- Tests: Backend 15/15 (100%), Frontend 100%

### Iteration 250 — Content Sentinel + Guild Community + Progressive Disclosure (Apr 3, 2026)
- **Automated Content Sentinel**: Full real-time content moderation system
  - `/api/sentinel/scan` — scans text against prohibited patterns (hate, slurs, sexual, self-harm, violence)
  - Zero-Tolerance Protocol: 3+ violations → automatic shadow-mute (content silently dropped)
  - Violation logging, shadow-mute/unmute management, stats aggregation
  - Frontend integration: Constellation save and feed posts scan text via sentinel before submission
- **Guild & Identity System**: Community channels with privacy controls
  - Identity modes: Full Identity, Avatar (geometric visualization), Ghost (invisible)
  - Mic/Video toggles for Full/Avatar modes
  - Class-based Guild channels (Resonance Circle, Wayfinder Lodge, Blueprint Sanctum, Trade Circle)
  - Widget Feed channels (Frequency Exchange, Soundscape Commons, Synthesis Lab, Forge Workshop)
  - Feed posting with sentinel scanning, ghost mode blocks posting (403)
  - CommunityPanel component accessible from Orbital Mixer playground
- **Progressive Trial Disclosure**: TrialGraduation modal now only appears after 3+ syntheses (Focus Mode triggers). Preserves once-per-profile permanent dismiss lock.
- **Sovereign Dashboard Sentinel Tab**: 6th tab with violation stats, category breakdown, shadow-muted users with unmute, violation log
- Tests: Backend 20/20 (100%), Frontend 100%

### Iteration 249 — Trial Lock + Analytics + Dock Presets (Apr 3, 2026)
- **Trial Modal Fix**: Once-per-profile lock using `sovereign_trial_complete` localStorage flag. Modal shows exactly once, then permanently dismissed. Backward-compatible with old dismiss key.
- **Trial Analytics**: Events tracked (view/dismiss/upgrade_click) via `/api/treasury/trial-event`. Sovereign Dashboard shows conversion metrics (views vs upgrades vs dismissals). "Reset Trial for All" button clears analytics and lets all users see the modal once more.
- **Dock Preset Persistence**: SmartDock saves `dock_orientation` and `dock_snapped` to localStorage after every drag. Restores on mount — switching between sessions preserves the user's kinetic layout.
- Tests: Backend 12/12 (100%), Frontend 100%

### Iteration 248 — Universal Kinetic Dock + Sovereign Dashboard (Apr 3, 2026)
- **Kinetic Dock Architecture**: SmartDock upgraded to physics-based positioning system
  - Magnetic edge snapping: 20px proximity zone triggers weighted haptic snap to any screen edge
  - Vertical/Horizontal pivot: auto-rotates 90° when snapped to left/right margins, icons reflow
  - Double-tap collapse: 350ms detection → minimizes to resonance dot
  - High-density opaque background: `rgba(10,10,18,0.88)` solid — no backdrop-filter, works over any paint/fractal
  - Data attributes: `data-orientation`, `data-snapped` for CSS targeting
- **Sovereign Dashboard** (`/sovereign-admin`): 5-tab admin panel
  - Overview: Stats grid (Treasury balance, Fees, Wallets, Escrow count), platform status
  - Controls: Fee slider (0-25%), System Live toggle, Mirror Hook toggle, Freeze Trades kill-switch
  - Mirror: Real-time sovereign mirror ledger
  - Escrow: All contracts with freeze capability
  - Export: Skeleton download tool (`usi-skeleton-v1.json`)
- **Dynamic Sovereign Config**: DB-backed fee %, PATCH API, kill-switch (HTTP 423)
- Tests: Backend 12/12 (100%), Frontend 100%

### Iteration 247 — Sovereign Dashboard + Skeleton Export (Apr 3, 2026)
- **Sovereign Dashboard** (`/sovereign-admin`): 5-tab admin panel (Overview, Controls, Mirror, Escrow, Export)
  - **Overview**: Stats grid (Treasury balance, Total fees, Wallets, Escrow count), platform status, recent fee ledger
  - **Controls**: Fee slider (0-25%, default 5%), toggle switches (System Live, Mirror Hook, Freeze All Trades kill-switch)
  - **Mirror**: Real-time sovereign mirror ledger — all user-created constellations auto-copied
  - **Escrow**: All active/completed/frozen escrow contracts with status badges
  - **Export**: Skeleton Export tool — generates clean white-label JSON (`usi-skeleton-v1.json`) with downloadable file
- **Dynamic Fee Config**: Stored in DB (`sovereign_config` collection), PATCH endpoint for real-time updates
- **Kill-Switch**: `frozen_transactions` blocks all marketplace purchases with HTTP 423
- **Mirror Toggle**: Constellation creation mirror hook respects `mirror_active` config
- Tests: Backend 13/13 (100%), Frontend 100%

### Iteration 246 — Phase 1 Finalization: Classes + Treasury + Synergy Discovery (Apr 3, 2026)
- **Anthropology Class System**: Shaman (Resonator) / Nomad (Navigator) / Architect (Builder) / Merchant (Catalyst). Each class has boosted affinities, synergy bonus, special synthesis type. XP system: 100 XP per level. Backend: `/api/classes`
- **Sovereign Treasury & Escrow**: Credits wallet (100 initial), 5% platform fee on marketplace trades. Escrow state machine for digital goods. Mirror Hook: every constellation creation/purchase auto-copies to `sovereign_mirror` collection. Backend: `/api/treasury`
- **Synergy Discovery Mode**: Bubbles glow when dragged near compatible partners (proximity-based affinity detection). Class-boosted modules show enhanced glow.
- **Weight-Based Haptic Feedback**: light (freq) = sharp tick, medium (sounds) = pulse, heavy (instruments/engines) = long vibration
- **Constellation Purchase Flow**: Marketplace items show "Buy" button with credit price. One-tap purchase deducts credits, splits fee, auto-loads modules.
- **Class Picker UI**: Orbital playground shows archetype selector with 4 classes, icons, descriptions. Selected class badge persists.
- Tests: Backend 17/17 (100%), Frontend 95% (balance display requires auth — expected)

### Iteration 245 — Universal Synthesis Interface Phase 1 (Apr 3, 2026)
- **Module Registry 3.0**: Affinity tags (`audio`, `spiritual`, `healing`, `nature`, `cosmic`, etc.) + tier access levels (0=Foundation, 1=Civilization, 2=Sovereignty) + weight system for haptic feedback
- **Synergy Engine**: `checkSynergy()` detects shared affinities between modules, `getSynthesisName()` generates combo names (Sacred Resonance, Celestial Chord, etc.), visual SVG "Molecular Bond" tethers between synergized modules
- **Constellation Recipes**: Full CRUD backend (`/api/constellations`) + save/browse/load/like/sell panel in OrbitalMixer. Tiered limits: Free=3, Pro=50, Elite=unlimited+selling rights
- **Focus Mode 4.0**: Auto-triggers at 3+ active modules, SmartDock collapses to pulsing "Resonance Dot", Navigation/Crossbar/Toolbar dissolve via CSS body class. Hyper-focus at 5+ modules. Manual toggle available.
- **Synergy Counter**: Shows active synergy count in orbital playground
- Tests: Backend 13/13 (100%), Frontend 100%

### Iteration 244 — Module Registry & Orbital Drag-Drop Mixer (Apr 3, 2026)
- **Module Registry** (`/app/frontend/src/config/moduleRegistry.js`): Central plug-and-play manifest with MODULE_TYPES, MODULE_GROUPS, 21 modules across 5 rings (frequencies, sounds, instruments, logic-gates, engines)
- **OrbitalMixer** (`/app/frontend/src/components/OrbitalMixer.js`): Orbital ring layout with DraggableBubble, PlayerHub, magnetic snap zone, haptic feedback
- Dual interaction: **Drag-and-drop** to center hub OR **tap-to-toggle** (accessibility)
- Active modules: glowing border, SVG tether lines, hub dot counter, pulsing ring animation
- Locked modules (I Ching, Fractal L², Cosmic Map) show lock icon and are non-interactive
- **Mode toggle**: Console (existing accordion) vs Playground (orbital) on CosmicMixerPage
- Staggered entrance animation from center hub → orbital positions
- Mobile: 52px touch targets, adjusted ring radii, 60vh container height
- Tests: Backend 10/10 (100%), Frontend 100%

### Iteration 243 — Streamline Consolidation: Control Center (Apr 3, 2026)
- SovereignHUD merged into SmartDock as "Control Center" panel (HarmonyNPUPanel)
- useHarmonyEngine hook: consolidated 3 separate 30s timers into single batch cycle
- Canvas only renders when Control Center panel is open (P1 performance)
- PersistentWaveform wrapped in React.memo (P1 performance)
- Mobile dock: larger touch targets (36px vs 30px), swipe-up gesture
- Leaner PageLoader (removed LoadingMantra spinner)
- Golden Pulse + XP Flash overlays moved to global SmartDock portal
- Tests: Backend 5/5 (100%), Frontend 100%

### Iteration 242 — Resonance Streak + Organic Audio Engine
- Streak-check and streak-status endpoints
- Golden Pulse overlay, XP Flash, streak dots in HUD
- useOrganicAudio hook (singing_bowl, flute, tabla, crystal_bowl synthesis)
- Service Worker INSTRUMENT_CACHE
- Tests: Backend 6/6 (100%), Frontend 100%

### Iteration 241 — Session Harmony Score + CultureLayer Integration
### Iteration 240 — Haptic Sync + PWA + Culture Layers + Harmonic Memory
### Iteration 239 — Phonic Architecture + UI Fix
### Iteration 238 — Sentient Streamline Enhancement
### Iteration 237 — Sovereign Mastery + Bubble Burst
### Iterations 234-236 — Foundation

## Upcoming (P0-P1) — Iteration 267+
- **Step 9: Multi-Widget Concurrent Dialogue** — Two Sovereign windows open simultaneously
- **Dust "Clink" Spatial Audio** — "Star particles settling" sound on Dust transfers
- **"Usage Yield" Report UI** — Monthly savings map from Caspian
- **Tool Stacking Visualization** — Mastery Map with "Missing Links" bundle upgrade
- **Haptic Frequency Feedback** — 432Hz/528Hz vibration matching
- **Environmental Sync** — Smart-home protocol linking (Hue, Nest)
- **Context-Aware Sovereign Interruption** — GPS proximity alerts
- **Sovereign "Live" Sessions** — Weekly interactive events

## Upcoming (P1)
- **Focus Mode 4.0 Gesture Controls**: Pinch-to-scale and Swipe-to-rotate
- **Ghost Skeleton UI Optimization**: Skeleton loaders before canvas items render

## Future/Backlog (P2)
- 54-Sublayer L² Fractal Engine deep integration
- GPS-Based Cosmic Map & Phygital Marketplace foraging
- Oracle Navigation Loop: I Ching → GPS Map → Artifact discovery → Forge upgrade
- Harmony Commerce Loop: Frequency + Fractal → Escrow Contract → Trade Circle
- Biometric Resonance Scaling (Haptic Feedback): Cluster-specific vibration patterns during Harmony Surge
- AI Co-Pilot Labs: Machine Experience collaboration in Researcher labs
- Trade Circle Visualization: Circular reciprocity UI
- Gesture Ring: Multi-touch frequency/geometry manipulation
- Tiered Subscription Matrix: Foundation ($0) → Civilization → Sovereignty

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
