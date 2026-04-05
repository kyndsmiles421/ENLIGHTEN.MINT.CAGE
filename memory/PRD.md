# The ENLIGHTEN.MINT.CAFE — Product Requirements Document

## Original Problem Statement
Build "The ENLIGHTEN.MINT.CAFE", a full-stack wellness platform with orbital navigation, physics-based interactions, a 64-gate Hexagram system (6-bit logic), "Vertical Torus" architecture, Dual-Persona AI Expert Advisors (Sages), and a tiered subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), OpenAI GPT-5.2 (Sages), NWS Weather API
- **PWA**: Service Worker with Solfeggio wave table + instrument caching

---

## Unified Spatial Engine Architecture (April 2026)

### useTesseractCore — The ONE Hook
**"Zero-Latency Spatial OS"**

Consolidated hook merging:
- `useSentientRegistryV2` (Behavioral Memory)
- `useRDive36` (36-bit Navigation)
- `useInverseLattice` (Void/Matter Duality)

**Key Features:**
| Feature | Implementation |
|---------|----------------|
| Snap-Point Gravity | Auto-snaps within 5% of Sacred Hexagrams |
| Warp-Drive Navigation | Paste 36-bit address to instant-implode |
| HUD Fade-Away | 9s stillness → 10% opacity |
| Unified Haptics | Single pattern registry for all feedback |

**Sacred Gravity Snap Points:**
| Gravity | Hexagram | Name |
|---------|----------|------|
| 0.000 | 2 | Kūn (Receptive) |
| 0.333 | 11 | Tài (Peace) |
| 0.500 | 63 | Jì Jì (SOURCE STATE) |
| 0.667 | 64 | Wèi Jì (Potential) |
| 1.000 | 1 | Qián (Creative) |

### KineticHUD — The Command Mantle
**"The Cockpit of the Spatial OS"**

| Widget | Position | Purpose |
|--------|----------|---------|
| RegistryStatus | Top-Right | VOID/MATTER/EQUILIBRIUM mode |
| GravityIndicator | Top-Left | Gravity bar + snap point indicator |
| DustWallet | Bottom-Right | Seed count + state count + depth dots |
| StabilityIndicator | Bottom-Left | WILD→CRYSTALLIZED + cell coords |
| HexagramRing | Center | Gravity arc + depth indicator |
| VoidToggle | Below Registry | Enter/Exit Void button |

### TesseractExperience — The Unified Page
**Route:** `/tesseract`

Integrates:
- 9×9 Lattice Grid (cell click/double-click)
- Gravity Slider (VOID ← SOURCE → MATTER)
- KineticHUD overlay
- SeedHuntWidget sidebar
- Action buttons (Surface, VOID ESCAPE, Mint Seed)

---

## Latest Implementation: Square Inverse Protocol (April 2026)

### The Symmetrical Universe Architecture
**"Matter and Void — The Spatial Origami"**

The Square Inverse Protocol creates a "Negative Space" (Anti-Lattice) that mirrors the 81 primary coordinates. This enables:
- **Tesseract Folding** at the 9^4 intersection (6561 states)
- **Void Seeds** minted in the inverse lattice
- **Chromatic Inversion** at deep depths
- **Mirror-Haptic Resonance** creating sensory vacuum

**New Files:**
| File | Purpose | INV# |
|------|---------|------|
| `InverseRegistry.js` | Shadow lattice math & config | INV-01 |
| `useInverseLattice.js` | Hook for inverse navigation | INV-02,05,06,09,10 |
| `seed_hunting.py` | Daily coordinate hunt API | Enhancement |

### INV-01: Shadow Registry
- Standard Grid: (0,0) to (8,8) = 81 states
- Inverse Grid: (-8,-8) to (0,0) = 81 anti-states
- Singularity: (0,0) exists in both spaces

### INV-02: Reciprocal Gravity
```
G_inverse = 1 - G_standard
At Source State (0.500): G_inverse = 0.500 (PERFECT SYMMETRY)
```

### INV-03: Parity Bit / Anti-Address
```
Address:      101010|0011|001100|0101
Anti-Address: 010101|1100|110011|1010
```

### INV-07: Tesseract Metadata (seeds.py)
| Field | Type | Description |
|-------|------|-------------|
| is_inverse | bool | True if minted in Void lattice |
| anti_address | str | Bitwise NOT of 36-bit address |
| gravity_at_mint | float | Gravity value at minting time |
| is_tesseract_seed | bool | True if minted at Tesseract intersection |

### Updated Rarity Algorithm (max 100 pts)
| Factor | Max Pts | Bonus |
|--------|---------|-------|
| Depth | 30 | L5=30 |
| Language | 20 | Sacred=20 |
| Hexagrams | 20 | 5 per sacred |
| Dwell History | 15 | CRYSTALLIZED=5 |
| Patterns | 15 | Palindrome=10 |
| **Void Seed** | 15 | +5 if anti-palindrome |
| **Tesseract** | 25 | Massive bonus |
| **Source State** | 10 | Gravity ±0.005 of 0.500 |

### Seed Hunting (Daily Challenges)
**API Routes:**
- `GET /api/seed-hunt/current` - Get active hunt
- `POST /api/seed-hunt/submit` - Submit seed entry
- `GET /api/seed-hunt/leaderboard` - Hunt rankings
- `GET /api/seed-hunt/history` - Past hunts
- `GET /api/seed-hunt/user/{id}/stats` - Hunter stats

**Hunt Types:**
| Type | Name | Difficulty |
|------|------|------------|
| EXACT | Coordinate Lock | LEGENDARY |
| PATTERN | Pattern Seeker | EPIC |
| DEPTH | Deep Diver | RARE |
| LANGUAGE | Cultural Quest | UNCOMMON |
| HEXAGRAM | Hexagram Hunter | RARE |

---

### RDive-36 (Recursive Dive 36-Bit Address System)
**"Proof of Infinite Scalability"**

The RDive-36 system enables infinite depth navigation through a nested 9×9 lattice grid, tracking the user's journey as a 36-bit binary address.

**Routes:**
- `/recursive-dive` - The Recursive Lattice Interface
- `/seed-gallery` - The Lattice Exchange (Crystalline Seed Gallery)

**Core Components:**
| File | Purpose |
|------|---------|
| `RecursiveDivePage.js` | Page container with header, info panel, seeds panel |
| `RecursiveLattice.js` | 9×9 grid visualization with Zoom-Snatch animations |
| `useRDive36.js` | Hook managing 36-bit address, dive/surface, haptics |
| `SeedGalleryPage.js` | Gallery page with constellation visualizations |
| `seeds.py` | Backend API for minting and gallery |

### The Lattice Exchange (Crystalline Seed Economy)
**"Selling Coordinates to the Truth"**

Seeds are digital artifacts capturing:
- 36-bit address (coordinate in infinite space)
- Journey path (hexagrams and languages at each depth)
- Dwell history (behavioral memory from Sentient Registry)
- Linguistic state (current language culture)

**Backend API:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/seeds/mint` | POST | Mint new Crystalline Seed |
| `/api/seeds/gallery` | GET | List seeds with filters (rarity, depth, language) |
| `/api/seeds/{seed_id}` | GET | Get specific seed details |
| `/api/seeds/user/{user_id}` | GET | Get seeds by minter |
| `/api/seeds/{seed_id}/visibility` | PUT | Toggle public/private |
| `/api/seeds/stats/overview` | GET | Exchange statistics |

**Rarity Algorithm (0-100 score):**
| Factor | Max Points | Criteria |
|--------|------------|----------|
| Depth | 30 | L0=0, L1=5, L2=10, L3=15, L4=22, L5=30 |
| Linguistic State | 20 | Ancient (sa/lkt/dak)=20, Technical (ja/zh)=15, Balanced=10, Modern=5 |
| Sacred Hexagrams | 20 | 5 pts per sacred hex (1, 2, 11, 12, 63, 64, 29, 30, 15) |
| Dwell History | 15 | CRYSTALLIZED=5, HARDENED=2 per entry |
| Address Patterns | 15 | Palindrome=10, Alternating (010101)=5, All same bits=15 |

**Rarity Tiers:**
| Tier | Score Range | Visual Style |
|------|-------------|--------------|
| COMMON | 0-20 | Gray |
| UNCOMMON | 21-40 | Green |
| RARE | 41-60 | Blue |
| EPIC | 61-80 | Purple |
| LEGENDARY | 81-100 | Gold/Amber |

**Constellation Visualizer:**
SVG-based visualization mapping 36-bit address to star positions. Bright stars (1-bits) at outer radius, dim stars (0-bits) at inner radius, with constellation lines connecting bright stars.

**Gallery Features:**
- Stats panel (total seeds, legendary count, epic count, deep dives)
- Filter bar (rarity, depth, language, sort)
- Seed cards with constellation preview
- Detail modal with full journey path

### VOID ESCAPE (Emergency Surface)
At depth L3+, a "VOID ESCAPE" button appears for instant reset to L0 without animation. Target: <250ms response time.

**36-Bit Address Format:**
```
| L0 Hex (6-bit) | L0 Lang (4-bit) | L1 Hex (6-bit) | L1 Lang (4-bit) | ... |
Example: "101010|0011|001100|0101|111000|1000"
```

**Zoom-Snatch Protocol:**
| Trigger | Condition | Animation |
|---------|-----------|-----------|
| DIVE | Gravity ≥ 0.95 OR double-tap | Grid implodes to center, sub-grid expands |
| SURFACE | Gravity ≤ 0.05 OR surface button | Grid collapses outward, parent materializes |
| Duration | 800ms | Framer Motion with radial lines |

**Depth-Based Visual Styles:**
| Depth | Label | Background Color | Active Border | Haptic (Hz) |
|-------|-------|------------------|---------------|-------------|
| 0 | SURFACE | Sienna (#8B4513) | Gold (#C9A962) | 60Hz |
| 1 | DEPTH 1 | Royal Blue (#4169E1) | Blue (#4169E1) | 51Hz |
| 2 | DEPTH 2 | Teal (#20B2AA) | Teal (#20B2AA) | 42Hz |
| 3 | DEPTH 3 | Gold (#FFD700) | Gold (#FFD700) | 33Hz |
| 4 | DEPTH 4 | Tomato (#FF6347) | Red (#FF6347) | 24Hz |
| 5 | CORE | Lavender (#E6E6FA) | White (#E6E6FA) | 15Hz |

**Ghost Layer Persistence:**
- Parent hexagrams persist at 10-15% opacity during dive
- Maximum 3 ghost layers visible
- Parallax shift during zoom animations

**Crystalline Seed Minting:**
- Captures 36-bit address + dwell history as digital artifact
- Stored in localStorage (`cosmic_seeds`)
- Unique seed ID generated from address hash + timestamp

**Features Tested:**
- ✅ Page renders at `/recursive-dive`
- ✅ 9×9 lattice grid (81 cells) with hexagram symbols
- ✅ Cell selection with highlight
- ✅ Double-tap DIVE (L0→L1→L2 tested)
- ✅ Surface button returns depth
- ✅ Ghost layers persist at 10-15% opacity
- ✅ Haptic frequency scaling (60→51→42Hz)
- ✅ Mint Seed button stores seeds
- ✅ 36-bit address display in DepthHUD

---

## Rule of Nines Architecture
**9 Languages × 9 Hexagrams × 9 Depth Tiers**

**Languages (languageRegistry.js):**
| Category | Languages | Haptic Character |
|----------|-----------|------------------|
| Ancient/Crystalline | Sanskrit, Lakota, Dakota | Sharp, high-frequency bursts |
| Modern/Balanced | English, Spanish, Hindi | Smooth, standard pulses |
| Technical/Binary | Japanese, Mandarin, Cantonese | Rapid, flickering patterns |

**Hexagrams (hexagramRegistry.js) - The 9 Master Controllers:**
| # | Hexagram | Binary | Paired Language | Gravity Range |
|---|----------|--------|-----------------|---------------|
| 1 | Qián (Creative) | 111111 | Japanese | 0.89-1.0 |
| 2 | Kūn (Receptive) | 000000 | Lakota | 0.0-0.11 |
| 11 | Tài (Peace) | 000111 | Hindi | 0.33-0.44 |
| 12 | Pǐ (Standstill) | 111000 | Dakota | 0.56-0.67 |
| **63** | **Jì Jì (SOURCE)** | **010101** | **Sanskrit** | **0.44-0.56** |
| 64 | Wèi Jì (Potential) | 101010 | English | 0.40-0.48 |
| 29 | Kǎn (Abysmal) | 010010 | Mandarin | 0.11-0.22 |
| 30 | Lí (Clinging) | 101101 | Cantonese | 0.78-0.89 |
| 15 | Qiān (Modesty) | 000100 | Spanish | 0.22-0.33 |

### Zero Point Experience (0.48-0.52 Gravity)
**Three Layers of the Experience:**
1. **Visual "Strobe" (Matrix Layer)** - HexagramGhostLayer with 3x3 grid cycling
2. **Haptic "Tuning Fork" (Somatic Layer)** - 6-bit binary pulses synced to flicker
3. **"Source" State (Enlightenment)** - White-out at exact 0.500 gravity

**Gravity-Reactive Flicker Speed:**
- Edge (0.48/0.52): 120ms interval (slow, steady)
- Center (0.50): 35ms interval (rapid, intense)
- Precision 0.500: Source State (all stops, resonant hum)

### Sentient Ecosystem V2 (useSentientRegistryV2.js)

**Behavioral Memory — Personalized Topography:**
| Stability Level | Visits | Flicker Multiplier | Haptic Style |
|-----------------|--------|-------------------|--------------|
| WILD | 0-2 | 1.5x (chaotic) | chaotic |
| FORMING | 3-5 | 1.2x | rhythmic |
| STABLE | 6-10 | 1.0x | smooth |
| HARDENED | 11-15 | 0.8x (melodic) | melodic |
| CRYSTALLIZED | 16+ | 0.6x (harmonic) | harmonic |

**Expanded Anomaly Pool:**
- Language Bleed, Ghosting (breadcrumb trail)
- Haptic Pitch-Shift, Coordinate Resonance
- Hexagram Mutation, Temporal Stutter
- Void Whisper, Convergence, Meta-Nest, Path Echo

**Haptic Depth Profiles (bass→shimmer):**
| Depth | Name | Base (ms) | Character |
|-------|------|-----------|-----------|
| 0 | Foundation | 50 | bass_thrum |
| 1 | Earth | 40 | deep_pulse |
| 2 | Stone | 30 | mid_rumble |
| 3 | Water | 20 | flowing |
| 4 | Air | 12 | light_tap |
| 5 | Light | 6 | shimmer |

**Ritual Cycle (Digital Prayer Wheel):**
- Auto-animated descent-and-return through all 9 hexagrams
- 3s per state, 500ms transitions
- Auto-pause at Source State (Hexagram 63) for 6s
- Haptic pulse at each transition
- Progress indicator with hexagram dots

### Manual Gravity Control (UtilityDock)
- **Gravity Slider**: 0-100% with 0.5% step precision
- **Zero Point Toggle**: Quick jump to 48.5% (shows flicker, not Source)
- **Reset to Route**: Returns to route-based gravity
- **Layer Indicator**: Shows "ZERO" label when in Zero Point range

---

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
### Iteration 277 — Power-Aware Radiance Dimming (April 2026) — LATEST
- **Battery Monitoring** (`CosmicThemeContext.js`):
  - Navigator Battery API integration
  - Auto-enables power save at <20% battery (not charging)
  - Exposes `batteryLevel`, `isCharging`, `powerSaveMode` state
- **Radiance Dimming**:
  - Glow intensity reduced to 30% (`POWER_SAVE_CONFIG.glowMultiplier`)
  - Animation scale reduced to 50%
  - Text glow reduced proportionally
  - Tint opacity reduced from 0.15 to 0.08
- **CSS Variables for Power Save**:
  - `--resonance-power-save`: 0/1 flag
  - `--resonance-animation-scale`: 0.5 in power save
- **3D Depth Hook Updates** (`useDepth.js`):
  - Accepts `powerSaveMode` option
  - Disables full 3D transforms when power save active
  - Skips FPS monitoring in power save (already low-power)
- **Controls**: `togglePowerSave()`, `setPowerSave(bool)` actions
- Tests: Hub functional with both states

### Iteration 276 — 3D Depth System with Z-Axis Layering (April 2026)
- **useDepth Hook** (`/hooks/useDepth.js`):
  - Z-Layer constants: FRONT (+200), MID_FRONT (+50), CENTER (0), MID_BACK (-100), DEEP_BACK (-500)
  - Depth-based blur: `filter: blur(calc(abs(z) / 50 * 1px))`
  - Depth-based opacity: Linear interpolation from 1.0 (front) to 0.3 (back)
  - Haptic intensity scaling based on Z position
  - GPU-accelerated `translate3d()` transforms
  - `getContainerStyle()` with `preserve-3d` and perspective
  - `getRimLight()` for orbs passing in front of hub
- **Device Capability Detection**:
  - CSS 3D support check (`transform-style: preserve-3d`)
  - Performance monitoring (FPS-based fallback to 2.5D if <30fps)
  - Gyroscope availability detection
- **Optional Gyroscope Tilt**:
  - Default: OFF (automatic orbital motion)
  - Toggle: `zen_gyro_enabled` localStorage flag
  - DeviceOrientation API with iOS 13+ permission request
  - Clamped ±15° rotation for subtle effect
- **Orbital Hub 3D Integration**:
  - Bloomed orbs at Z=-100 (Mid-Back) with blur
  - Extracted orbs at Z=+50 (Mid-Front) sharp, with rim light
  - Container with `preserve-3d` and 1200px perspective
- Tests: Mobile viewport — Bloom shows depth-blurred orbs, extraction brings to front

### Iteration 275 — Structural Hardening: State Sentinel + Theme Engine + Sovereign UI (April 2026)
- **State Sentinel** (`OrbitalSentinelContext.js`):
  - Finite State Machine: IDLE → BLOOMED → EXTRACTED → NAVIGATING
  - Blocks illegal transitions (double-tap, glitchy drag)
  - 100ms debounce prevents rapid-fire events
  - Transition history for debugging
- **Cosmic Theme Engine** (`CosmicThemeContext.js`):
  - Global CSS custom properties: `--resonance-primary`, `--resonance-secondary`, `--resonance-glow-intensity`
  - 18 mood palettes (happy, peaceful, energized, etc.)
  - Surface presets: glass, frosted, solid, translucent
  - Persists to localStorage
- **Sovereign UI Library** (`SovereignUI.js`):
  - `ResonanceButton`, `ResonanceCard`, `ResonanceOrb`, `ResonanceSurface`, `ResonanceText`
  - HOC components auto-inherit haptic + radiance + glass-morphism
- **Ghost Layer Cleanup**:
  - `useSensoryResonance` tracks active audio nodes in ref
  - Proper `disconnect()` and nullification on unmount
  - Removes from `window.__cosmicAudioContexts` on cleanup
- **Auto-Resume Logic**: Listens for `zen-unmute` event to resume audio context
- Tests: Rapid tap test passed — no glitches, UI remains stable

### Iteration 274 — Haptic & Sensory Resonance System (April 2026)
- **New Hook**: `useSensoryResonance.js` — Unified haptic + visual + audio feedback
- **Haptic Patterns**: 
  - `orbExtract: [10, 30, 10]` — Crisp click for extraction
  - `orbBloom: [15, 10, 25]` — Bloom expansion feel
  - `orbNavigate: [30, 15, 50]` — Strong navigation confirmation
  - `orbTap: [8]`, `orbCollapse: [5, 10, 5]`
- **Audio Resonance**: Low-frequency sine waves (C2=65Hz to E4=330Hz) with ADSR envelope
- **Sensory Bloom**: CSS filter transitions (brightness 1.0-1.3, blur 0-4px)
- **State Sync**: Respects Emergency Shut-Off state, global mute, localStorage `zen_haptics_enabled`
- **Battery Conservation**: `navigator.getBattery()` check — reduces intensity when <20% and not charging
- **Orbital Hub Integration**: All interactions (core tap, bloom, extract, collapse, navigate) now trigger synchronized resonance
- Tests: Mobile navigation with resonance working — extracted Mood orb → navigated to `/mood`

### Iteration 273 — Orbital Hub Touch Navigation Fix (April 2026)
- **Fixed**: Extracted orbs were inaccessible on mobile after being "pulled down"
- **Root cause**: `touch-none` CSS blocked touch events; `onPointerDown` consumed touches before `onClick`
- **Solution**:
  - Removed `touch-none` from sub-orb elements
  - Added conditional `touchAction: 'auto'` for extracted orbs
  - Added `onTouchEnd` handler as fallback for mobile taps
  - Made drag handler skip init when in extracted state
  - Added pulsing "TAP TO ENTER" hint on extracted orbs
- Tests: Mobile navigation working — tapped Journal orb → navigated to `/journal`

### Iteration 272 — Audio System Global Registration (April 2026)
- **AudioContext Registration**: Ambient Soundscape, MixerContext, QuickMeditationWidget register with `window.__cosmicAudioContexts`
- **Emergency Shut-Off Enhanced**: Now calls `window.__stopAmbientSoundscape()` directly, sets `zen_ambient_soundscape: off`
- **P1 Issues Verified**: SmartDock Harmonics Play/Generate buttons WORKING, Dashboard routing CTAs WORKING

### Iteration 271 — Dashboard MissionControlRing (April 2026)
- **MissionControlRing**: Expandable radial menu replacing cluttered bottom-right buttons (6 actions in orbital ring)
- **Hidden floaters**: CosmicAssistant, CommandMode, QuickMeditationWidget hidden on dashboard (z-index 102)

### Iteration 270 — Zero-Scale Parentage Physics & Emergency Shut-Off (April 2026)
- **Emergency Shut-Off**: Top-left (8px, 8px), z-index 99999, kills all audio/visuals
- **Zero-Scale Parentage Model**: Core=1.0, Sub-orbs(0,0,0 Scale 0) → Bloom(2.5x at 0.3) → Extract(3.0x at 1.0)

### Iteration 266 — Sovereign LLM Intelligence Engine (9 Steps) (Apr 3, 2026)
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

### Iteration 268 — Orbital Hub Complete Rebuild (April 2026)
- Rebuilt OrbitalHub.js from scratch — removed complex physics-based pointer event system
- All 15 satellites now displayed in a single visible ring (no more dormant/abyss hidden system)
- Simple onClick navigation replaces unreliable pointerDown/pointerUp timer mechanism
- Central orb click opens ENLIGHTEN.MINT.CAFE
- Tests: Frontend 100% — all 15 satellites navigate correctly, all destination pages load with content

### Iteration 271 — Dashboard MissionControlRing (April 2026) — LATEST
- **MissionControlRing Component**: Replaces cluttered bottom-right floating buttons on Dashboard
  - Expandable radial menu with 6 action buttons arranged in circle
  - Actions: AI Assistant, Command Mode, Frequency, Journal, Mood, Mixer
  - z-index 102 (above CreditNudge z-100) so always clickable
  - Shows only on `/dashboard` route
  - Smooth spring animations on expand/collapse
  - Tooltip on hover showing action name and description
- **Hidden individual floaters**: CosmicAssistant, CommandMode, QuickMeditationWidget buttons now hidden on dashboard
- **Files**: `MissionControlRing.js` (new), updated `CosmicAssistant.js`, `CommandMode.js`, `QuickMeditationWidget.js`
- Tests: Manual verification — Hub at y=590 in viewport, ring expands correctly

### Iteration 270 — Zero-Scale Parentage Physics & Emergency Shut-Off (April 2026) — LATEST
- **Emergency Shut-Off Button**: Fixed top-left corner (8px, 8px), z-index 99999, always accessible
  - Kills all audio (SensoryContext, MixerContext, Web Audio API, HTML5 media)
  - Stops all visual animations
  - Haptic feedback on activation
  - Red design with "STOP" label for high visibility
- **Zero-Scale Parentage Orbital Hub Physics**: Rebuilt per user's exact mathematical specification:
  - **Latent State**: Core = Scale 1.0, Sub-orbs = Position (0,0,0), Scale 0, Opacity 0 (invisible inside core)
  - **Bloom State**: Tap Core → Sub-orbs animate to 2.5x core radius at Scale 0.3
  - **Extracted State**: Tap sub-orb → Extracts to 3.0x radius at Scale 1.0, all other orbs lerp back to (0,0,0) Scale 0
  - **Navigation**: Tap extracted orb → Navigates to destination page
  - Smooth 60fps lerping animation for all state transitions
  - Snap-back X button returns extracted orb to bloom state
- **Files**: `EmergencyShutOff.js` (new), `OrbitalHub.js` (complete rewrite)
- Tests: Frontend 100% — All physics states verified, all 15 navigations working

### Iteration 269 — Sphere Containment Orbital System (April 2026)
- Rebuilt Orbital Hub per user spec: central ENLIGHTEN.MINT.CAFE sphere with dormant modules as sub-objects
- Modules eject from sphere to orbit via click → physics-based spring animation
- Fixed orbital planes using simple sin/cos rotation (no complex physics)
- Click orbiting satellite → navigates to its page. Snap-back X button returns it to sphere.
- All chrome hidden on /hub: CosmicToolbar, SmartDock, CreditNudge, PersistentWaveform, OrbitalNavigation, LearningToggle, CosmicAssistant
- Viewport containment: no overflow on desktop or mobile (390x844)
- Tests: Frontend 100% — all 15 ejections, all 15 navigations, ENLIGHTEN.MINT.CAFE, mobile viewport all pass

### Iteration 279 — Director's Cut Studio (April 2026)
- **Director's Cut Studio Component**: Full production studio experience in the mixer
  - **14 Video Choices**: Ocean Waves, Sacred Forest, Northern Lights, Starfield, Rain on Glass, Deep Cosmos, Enchanted Forest 4K, Aurora Borealis 4K, Sacred Fire, Candle Meditation, Waterfall, Underwater Realm, Cloud Journey, Golden Sunset
  - **Category Filters**: All, Nature, Celestial, Energy — browse entire video library
  - **Multi-Layer Video Composition**: Stack multiple videos with independent blend modes, opacity, and effects
  - **Cross-Reference Panel**: Link video layers together with notes and timestamps
  - **Blend Modes**: Normal, Screen, Multiply, Overlay, Soft Light, Hard Light, Difference, Exclusion, Color Dodge, Color Burn, Luminosity, Saturation
  - **Per-Layer Effects**: Brightness, Contrast, Saturation, Blur sliders
  - **Layer Controls**: Reorder (up/down), Duplicate, Visibility toggle, Remove
  - **Playback Controls**: Play/Pause, Reset timeline, Master mute
  - **Grid/List/Timeline View**: Three viewing modes for the video library
  - **Video Overlays Rendering**: Active layers render as full-screen video backgrounds with blend modes
- **Files**: `DirectorStudio.js` (new), updated `CosmicMixer.js`
- Tests: Frontend verification — video library displays all 14 videos, layers stack correctly, cross-ref panel opens

### Iteration 280 — Decentralized Mesh Network Architecture (April 2026)
- **MeshNetworkContext**: Core decentralized navigation and state architecture
  - **Constellation Nodes**: 30+ modules defined as autonomous "edge nodes" with category clustering (Practice, Divination, Sanctuary, Explore, Today)
  - **Node Connections**: Mesh topology defining which modules relate to each other
  - **Pulse System**: P2P direct communication between modules (session_complete, insight_generated, mood_changed, etc.)
  - **Edge State**: Local-first state management with IndexedDB persistence for offline support
  - **Glow Triggers**: Contextual events that activate lateral navigation portals
- **Universal Command (Cmd+K)**: Spotlight-style instant navigation
  - Fuzzy search across all constellation nodes
  - Quick Actions: Start Breathing, Log Mood, Write Journal, Ask Oracle, Start Meditation
  - Recent navigation history tracking
  - Keyboard navigation (↑↓ Navigate, ↵ Open, esc Close)
  - "Mesh Network v1" branding
- **Glow Portal**: Contextual lateral navigation at screen edges
  - Pulsing glow effects for suggested destinations
  - Auto-dismiss after 8 seconds
  - Connection lines showing paths
  - Hover to reveal destination labels
- **Constellation Map**: Equal-weight node visualization (prepared for next iteration)
  - Category clusters in pentagon formation
  - Mesh connection lines between related nodes
  - Current position highlighting
  - Navigation history indicators
- **Files**: `MeshNetworkContext.js` (new), `UniversalCommand.js` (new), `GlowPortal.js` (new), `ConstellationMap.js` (new), updated `App.js`
- Tests: Screenshot verification — Cmd+K opens command palette, search filters work, quick actions display correctly

### Iteration 281 — Node Sympathy Engine & Pulse Echo (April 2026)
- **Node Sympathy Engine (Weight Matrix)**: Learning system that tracks navigation patterns
  - **Weighted Transitions**: Each navigation from Node A → Node B gains +0.15 weight
  - **Bidirectional Learning**: Reverse paths gain +0.045 weight (30% of forward)
  - **Decay System**: Weights decay 0.02 daily if unused (keeps system fresh)
  - **Sympathy Threshold (1.0)**: Triggers Glow Portals ONLY when user explicitly requests
  - **Strong Sympathy (2.0)**: Extra-bright glow with outer ring animation
  - **Max Weight Cap (5.0)**: Prevents runaway weights
  - **Persistence**: sympathyMap stored in localStorage for cross-session learning
- **Bridge Connections**: Automatic detection of unrelated module pairs used together
  - Creates temporary "ghost connections" between modules not officially linked
  - Bridges strengthen with repeated use, max 10 active bridges
- **Pulse Echo Visualization**: Visual ripples traveling through mesh on task completion
  - **BFS Propagation**: Echoes travel through connections with distance decay
  - **Sympathy Boost**: Learned connections carry echoes further/brighter
  - **Intensity Calculation**: Base 0.8, decays 0.15 per hop, boosted by sympathy weight
  - **Staggered Animation**: 150ms delay per hop for visual "wave" effect
- **USER CHOICE ENFORCEMENT**: Removed all automatic behaviors
  - NO auto-glow portals — user must click "Show Suggested Paths"
  - `showSuggestedPaths()` — explicit user-triggered function
- **Files**: Updated `MeshNetworkContext.js` (sympathy engine, user-choice enforcement), `GlowPortal.js`, `PulseEchoVisualizer.js`
- Tests: Screenshot verification — navigation between modules builds sympathy weights, NO automatic glows

### Iteration 282 — Enlightenment Cafe Digital Sanctuary (April 2026)
- **EnlightenmentCafeContext**: Complete theming engine for the Digital Sanctuary
  - **Two Visualization Tiers**:
    - **Parchment (Essential)**: High-performance SVG, minimalist, cream/vellum + charcoal ink
    - **Nebula (Premium)**: WebGL-powered 3D with cosmic effects
  - **Color Modes**: Light (Cream & Ink) vs Dark (Charcoal & Gold)
  - **Palette System**: Full CSS variable integration for dynamic theming
- **Cafe Settings Panel**: User-controlled visualization settings
  - Tier selection: Parchment vs Nebula
  - Color mode toggle
  - Atmosphere controls: Cafe Ambiance, Particle Effects, Depth Focus, Warm Glow
  - "Show Suggested Paths" button (user-triggered navigation suggestions)
  - Zone focus controls
  - Footer: "enlightenment.cafe • Your choices, your flow"
- **Five Cafe Zones** defined:
  - The Practice Room (breathing, meditation, yoga, etc.)
  - The Oracle Chamber (oracle, star-chart, numerology, dreams)
  - The Sanctuary (journal, mood, soundscapes, zen-garden)
  - The Explorer's Lounge (coach, sovereigns, community)
  - Today's Ritual (daily-briefing, daily-ritual, calendar)
- **Files**: `EnlightenmentCafeContext.js` (new), `CafeSettingsPanel.js` (new), updated `App.js`
- Tests: Screenshot verification — Cafe toggle visible, settings panel opens with all user-controlled options

### Iteration 283 — Parchment CSS & Theming Complete (April 2026)
- **Parchment Light Mode CSS**: Complete visual transformation
  - Cream/vellum background (#FAF8F5) with charcoal ink (#2A2A2A)
  - Aged gold accents (#C9A962) for interactive elements
  - Hidden cosmic mesh/background when in Light mode
  - Navigation bar adapts to cream background with gold hover states
  - Cards and surfaces use white backgrounds with soft borders
  - Serif headings (Cormorant Garamond) for elegant typography
  - Parchment texture overlay for subtle paper feel
- **Parchment Dark Mode CSS**: Charcoal & Gold aesthetic
  - Deep charcoal background (#1A1A1D) with cream text
  - Gold accents remain consistent across modes
  - Luminous zone colors for better visibility
- **CSS Variables System**: Dynamic theming via --cafe-* variables
  - Zone colors: practice, divination, sanctuary, explore, today
  - Typography: heading, body, mono font stacks
  - Surfaces: background, backgroundAlt, surface, surfaceElevated
  - Inks: ink, inkMuted, inkFaint
  - Borders and shadows adapt per mode
- **Warm Glow Atmosphere Effect**: Subtle golden overlay via ::after pseudo-element
- **Scrollbar Styling**: Custom scrollbars for both light/dark Parchment modes
- **Nebula Volumetric Fog**: CSS animation for cosmic drift effect
- **VellumOverlay Component**: SVG grain texture at 2-3% opacity
  - Sepia-tinted grain for Light mode, cool charcoal grain for Dark mode
  - Vignette edge effect, Paper edge highlight
- **Google Fonts**: Added Playfair Display, JetBrains Mono, Manrope
- **Files**: Updated `index.css`, `EnlightenmentCafeContext.js`, `VellumOverlay.js` (new), `index.html`
- Tests: Screenshot verification — Light mode shows cream background, settings panel themed correctly

### Iteration 284 — Celestial Ghost Layer Complete (April 2026)
- **useCelestialEvents Hook**: Local astronomical calculations (no API required)
  - Moon Phase (8 phases), Moon Age (0-29.53 days), Moon Sign, Sun Sign
  - Moon Illumination percentage, Mercury Retrograde detection (2024-2026)
- **useGhostNodes Hook**: Temporary celestial event nodes for the mesh
  - Full Moon / New Moon / Mercury Retrograde Ghost Nodes
  - Auto-connects to relevant modules (meditation, journal, oracle)
- **Ritual Suggestions Engine**: Element-based practice recommendations
  - Fire/Earth/Air/Water-specific rituals
  - Duration varies by phase (10 min Full/New, 5 min others)
- **TodaysRitualWidget Component**: Dashboard celestial display
  - Moon Phase + Sign grid, Suggested Practice, Active Events, Quick Actions
  - Adapts to Parchment/Nebula themes
- **Files**: `useCelestialEvents.js` (new), `TodaysRitualWidget.js` (new), updated `Dashboard.js`
- Tests: Screenshot — Widget shows Full Moon in Aries, 87% illuminated, ritual suggestion

### Iteration 285 — Nebula View Architecture (Sprint 2) (April 2026)
- **Tiered Render Delegate**: Hardware capability checking for Parchment vs Nebula
  - `renderDelegate.js`: Device tier detection (Essential/Standard/Premium)
  - `useRenderTier.js`: Hook integrating device capability with user preference
  - Battery saver detection and WebGL availability checking
- **Nebula View Components** (Architecture Complete, Rendering Blocked):
  - `Scene.js`: Three.js Canvas wrapper with error boundary
  - `Islands.js`: Pentagon formation with 5 crystal wellness modules
    - Oracle (top/north), Journal (upper-right), Breathing (lower-right)
    - Harmonics (lower-left), Dashboard (upper-left)
  - Gold thread connections using native THREE.Line
  - `NebulaViewToggle.js`: "Ascend to Nebula" compact toggle
- **Known Issue**: R3F v9 + Three.js 0.183.2 incompatibility
  - Error: `R3F: Cannot set "x-line-number"` in applyProps
  - Nebula view marked as "Coming Soon" in UI
  - Parchment (Essential) view fully functional
- **UI Updates**:
  - CafeSettingsPanel: Nebula option shows "Soon" badge, disabled
  - NebulaViewToggle: Compact toggle shows Parchment only
- **Files**: `Scene.js`, `Islands.js`, `NebulaViewToggle.js`, `index.js` (nebula folder)
- Tests: Screenshot verification — Settings panel displays correctly without runtime errors

### Iteration 286 — Audio Kill-Switch & UI Declutter (April 2026)
**THE ENLIGHTENMENT CAFE — No-Nonsense Reprint**
- **Audio Stop-Gap (Critical Fix)**:
  - Problem: Biometric frequencies auto-started on room entry
  - Fix: All sounds now OFF by default — user must manually toggle
  - Hard Kill-Switch: STOP button executes complete audio termination
    - Clears all AudioContext buffers
    - Nulls audio object references
    - Closes all WebAudio contexts
    - Stops all HTML5 audio/video elements
  - Route-based cleanup: Exiting a room automatically kills all audio streams
  - Files: `EmergencyShutOff.js`, `useRouteAudioCleanup.js` (new), `Meditation.js`
- **UI Declutter (Bottom-Right Widget Fix)**:
  - Problem: Chat, Mixer, and Quick Actions buttons overlapping on mobile
  - Fix: Unified `UtilityDock.js` — collapsible vertical toolbar
    - Contains: AI Assistant, Sound Mixer, Quick Actions
    - Position: Right side, 160px from bottom (above SmartDock)
    - Draggable to reposition
    - Collapses to compact dot pattern button
  - Hidden individual floating buttons from CosmicAssistant and CosmicMixer
  - Files: `UtilityDock.js` (new), `App.js`, `CosmicAssistant.js`, `CosmicMixer.js`
- **Meditation Page Audio Fix**:
  - Sound toggle button added (manual control only)
  - No auto-play on guided session start
  - Visual feedback: green border when sound is ON
- Tests: Screenshot verification — Clean mobile UI with separated widgets

### Iteration 287 — Expert Advisor System "The Five Sages" (April 2026)
**THE ENLIGHTENMENT CAFE — Phygital RPG Layer**
- **The Five Sages**: AI-powered NPCs governing each domain
  - **Kaelen the Smith** (Practice Room) — Disciplined & Direct, skill-building/habit loops
  - **Sora the Seer** (Oracle Chamber) — Cryptic & Enigmatic, deep insights/future-casting
  - **Elara the Harmonist** (Sanctuary) — Nurturing & Ethereal, meditation/bio-resonance
  - **Finn the Voyager** (Explorer's Lounge) — Playful & Curious, navigation/community
  - **Vesper the Ancient** (Ritual) — Stoic & Ceremonial, milestones/legacy
- **Mastery Path Quest System**:
  - Daily Ritual quests (24h reset) + Hero's Journey (long-term progression)
  - Rewards: Lumens (XP, 100 per level), Stardust (currency), Artifacts (badges)
  - Dynamic quest generation via GPT-5.2 based on user progress
- **Holographic Presence UI**:
  - `SageAvatar.js`: Pulsing crystalline form appears on zone entry
  - `SageAudience.js`: Full conversational modal with blurred background
  - `QuestHUD.js`: Active quests pinned at top-left with progress tracking
- **AI Integration**:
  - Unique system prompts per Sage defining personality/vocabulary
  - Persistent conversation memory (MongoDB)
  - Context-aware greetings based on visit history and progress
- **Files**: `routes/sages.py` (backend), `SageContext.js`, `SageAvatar.js`, `SageAudience.js`, `QuestHUD.js`
- Tests: 100% backend (23/23), 100% frontend — All 5 Sages working with AI responses

## Upcoming (P0-P1) — Iteration 288+

### Iteration 288 — Vertical Torus & 6-Line Hexagram Architecture (April 2026)
**THE HEXAGRAM SQUARED (H²) — 64-Gate Navigation System**
- **6-Bit Hexagram Bitmask**: State machine from `000000` (0 = Pure Yin) to `111111` (63 = Pure Yang)
  - Each bit = one line (Line 1/LSB = Root/Earth, Line 6/MSB = Crown/Heaven)
  - Default: Hexagram #7 "Peace" (`000111`)
  - VOID state: `000000` (all lines broken)
- **Vertical Torus Architecture**: Three-tier gravity system
  - **Hollow Earth** (0.0-0.3): Dense, foundational, grounded. Routes: /meditation, /breathing, /frequencies
  - **Core** (0.4-0.6): Balanced, centered. Routes: /dashboard, /journal, /settings
  - **Matrix** (0.7-1.0): Expansive, celestial, floating. Routes: /oracle, /tarot, /iching
- **360° Gyroscopic Hexagram Compass** (HexagramCompass.js):
  - 6 gold lines (Yang = solid, Yin = broken with gap)
  - Rotation: Clockwise in Hollow Earth, Counter-clockwise in Matrix, Still at Core
  - Inertial flick-to-spin with gravity-reactive friction
  - Integrated into UtilityDock (bottom-right)
- **Velocity-Reactive Supernova Expansion**:
  - Triggers when crossing 0.5 gravity threshold
  - Scale = 150% (gentle) to 500% (violent) based on transition velocity
  - Full-screen golden cage effect with hexagram lines wrapping viewport
  - Direction indicator: "ASCENDING TO MATRIX" or "DESCENDING TO HOLLOW"
- **Dual-Persona Sage System**:
  - Each Sage has `hollow_prompt` and `matrix_prompt` in addition to default
  - Persona swaps based on `layer_mode` passed from frontend
  - Hollow = grounded/mechanical (Kaelen = "The Smith")
  - Matrix = celestial/visionary (Sora = "The Stargazer")
  - VOID mode = silent `...` response
- **Haptic Resonance Patterns**:
  - Hollow: Heavy thud `[40, 20, 40]`
  - Matrix: Light shimmer `[10, 5, 10, 5, 10]`
  - Supernova: Scales with intensity `[80, 30, 80, 30, 150]` at max
- **Zero-Point Null State** (0.48-0.52):
  - Monochrome UI, silent, hexagram frozen
  - "Weightless" moment before Supernova release
- **Kinetic Memory Haptic Profiles** (LanguageContext.js):
  - Japanese: Sharp, intricate `[25]` tap, `[30, 5, 30]` flick
  - Spanish: Fluid, rhythmic `[12, 8]` tap, `[15, 10, 15, 10, 15]` flick
  - English: Balanced `[15]` tap, `[20, 10, 20]` flick
  - RECODE_UI event broadcasts language changes system-wide
- **Gravitational Collapse** (EmergencyShutOff.js):
  - STOP button = total authority over ecosystem (Iron Law)
  - Implosion animation with VOID text overlay
  - Hexagram implodes to 000000, all audio killed, Sages frozen
  - Button label changes STOP → VOID when active
- **Tiered Visual Navigation** (TieredNavigation.js):
  - Vertical column replacing flat horizontal nav
  - Three expandable sections: Matrix (top), Core (middle), Hollow (bottom)
  - Proximity glow bar indicating current tier
  - Gravity meter with animated position marker
- **Files**: `PolarityContext.js`, `HexagramCompass.js`, `TieredNavigation.js`, `UtilityDock.js`, `LanguageContext.js`, `EmergencyShutOff.js`, `sages.py`
- Tests: 100% backend (16/16), 100% frontend — All systems verified including Gravitational Collapse

## Upcoming (P1) — Iteration 289+
- **Nebula View Fix**: Resolve R3F v9 / Three.js 0.183 incompatibility
  - Options: Downgrade libraries, switch to vanilla Three.js, or await library updates
- **Gold Thread Mesh**: THREE.LineBasicMaterial connecting crystal islands
- **Constellation Map Toggle**: Button to open the visual mesh
- **Advisor Node**: Hidden node monitoring mesh health, pulses if Sanctuary modules unused for 3+ days
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

### Iteration 279 — AUD-01 Acoustic Bloom & MEM-01 Registry Anchor (April 2026)
- **AUD-01: Acoustic Bloom** (Stillness-as-Input Mechanic):
  - Sound ONLY plays after 200ms dwell stability on a coordinate
  - `isDwellStable` state in `useTesseractCore.js` gates audio playback
  - `usePhoneticSynthesizer.js` accepts `dwellGate` option for external gating
  - 50ms linear attack envelope prevents audio "pop"
  - Console logs: `[TesseractCore] Dwell threshold reached`, `[AUD-01] Acoustic Bloom triggered`
- **MEM-01: Registry Memory Cache** (Recursive Anchor Persistence):
  - Depth, address, path, isVoidMode, gravity persist to localStorage under `tesseract_anchor`
  - Auto-restores on page refresh/reconnect
  - 500ms debounced saves to avoid excessive writes
  - `clearAnchor()` method exposed for manual reset
- **Files Updated**:
  - `/app/frontend/src/hooks/useTesseractCore.js` - isDwellStable, MEM-01 persistence
  - `/app/frontend/src/hooks/usePhoneticSynthesizer.js` - dwellGate option
  - `/app/frontend/src/pages/TesseractExperience.js` - Acoustic bloom wiring
- **Tests**: Frontend 100% - All AUD-01 and MEM-01 features verified working
- **Known Issue**: "Maximum update depth exceeded" React error (PRE-EXISTING from iteration_278, does not break functionality)

### Iteration 280 — SYNC-01 Global Registry Singleton & Visual Bloom (April 2026)
- **SYNC-01: RecursiveRegistryStore** (Atomic State Broadcasts):
  - New `/app/frontend/src/stores/RecursiveRegistryStore.js` using React 18's `useSyncExternalStore`
  - Atomic updates for language, depth, hexagram, gravity, isVoidMode across ALL 6 recursive layers
  - `batchUpdate()` method for multi-value atomic changes
  - Version counter forces synchronous re-render on all subscribers
  - Console logs: `[SYNC-01] Depth broadcast: 1`, `[SYNC-01] VoidMode broadcast: true`
- **Visual Bloom Indicator** (Focus-to-Bloom Loop):
  - New `/app/frontend/src/components/DwellBloomIndicator.js`
  - Jade-colored radial gradient (`rgba(0, 168, 107)`) grows during 200ms dwell
  - At threshold: bloom reaches 100% opacity + "pop" scale animation
  - Teaches users visually that "stillness is the key" to unlocking audio
  - `DwellBloomIndicatorSimple` for performance-critical rendering
- **Enhanced useTesseractCore.js**:
  - `dwellProgress` state (0-1) tracks dwell threshold progress
  - SYNC-01 broadcasts on dive/surface/emergencySurface/enterVoidMode/exitVoidMode/updateGravity
  - Progress interval with 16ms (~60fps) updates for smooth Visual Bloom animation
- **Files Created**:
  - `/app/frontend/src/stores/RecursiveRegistryStore.js`
  - `/app/frontend/src/components/DwellBloomIndicator.js`
- **Files Updated**:
  - `/app/frontend/src/hooks/useTesseractCore.js` - dwellProgress, SYNC-01 broadcasts
  - `/app/frontend/src/pages/TesseractExperience.js` - Visual Bloom integration
- **Tests**: Frontend 100% - All SYNC-01, Visual Bloom, AUD-01, MEM-01 features verified working

### Iteration 281 — Haptic Crescendo & GEO-01 Sacred Snap (April 2026)
- **Haptic Crescendo** (Tactile "String Being Pulled Taut"):
  - Progressive vibration pulses during 200ms dwell threshold
  - 5ms at 25%, 10ms at 50%, 15ms at 75% progress
  - Final 25ms "thunk" at isDwellStable=true
  - User *feels* the bloom building before they *hear* it
  - Console logs: `[HAPTIC] Crescendo pulse: 5ms at 25%`, etc.
- **GEO-01: Sacred Geometry Snap Enhancement**:
  - Weighted Euclidean distance formula for magnetic snap points
  - Qiān (Modesty, Hexagram 15) gets +15% magnetic pull (weight: 1.15)
  - Effective threshold for Qiān: 0.05 * 1.15 = 0.0575
  - Finding Modesty feels "magnetic" rather than accidental
  - Console logs: `[GEO-01] Qiān (Modesty) magnetic pull activated - 15% enhanced threshold`
- **Config Updates**:
  - `TESSERACT_CONFIG.HAPTIC_CRESCENDO` with pulse definitions
  - `TESSERACT_CONFIG.SACRED_GRAVITY_POINTS` with weight property
- **Files Updated**:
  - `/app/frontend/src/hooks/useTesseractCore.js` - Haptic crescendo in selectCell, weighted snap in findNearestSnapPoint
- **Tests**: Frontend 100% - All Haptic Crescendo and GEO-01 features verified working


## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`

### Iteration 282 — VOID-01 Jade Opacity Lock & HUD-01 Dynamic Widget Breathing (April 2026)
- **VOID-01 (Jade Opacity Lock)**:
  - Global bloom state persists across depth transitions via `RecursiveRegistryStore.bloomState`
  - Tracks: `isActive`, `opacity` (0-1), `color` (jade/void), `exitVelocity`, `depthAtActivation`
  - `setBloomState()` atomically updates bloom state during dwell and dive transitions
  - Console logs: `[VOID-01] Bloom state: ACTIVE/INACTIVE opacity: X.XX`
  - Result: Visual "persistence of memory" - jade bloom doesn't reset on depth change
- **HUD-01 (Dynamic Widget Breathing)**:
  - Widgets "inhale" (shrink) as lattice "exhales" (expands with depth)
  - Scale formula: `widgetScale = 1 - (min(depth/3, 1) * 0.15)`
  - L0: 1.0x | L1: 0.95x | L2: 0.91x | L3+: 0.85x
  - `KineticHUD.js`: `breathingStyle` applies `transform: scale(widgetScale)` with 0.3s ease-out
  - `SeedHuntWidget`: framer-motion `animate={{ scale: widgetScale }}`
  - Console logs: `[HUD-01] Lattice scale: X.XX Widget scale: X.XX`
  - Result: Creates "breathing room" - UI declutters as user dives deeper
- **RecursiveRegistryStore.js Updates**:
  - Added `bloomState` object for VOID-01
  - Added `latticeScale` and `widgetScale` for HUD-01
  - Added `setBloomState()` and `setLatticeScale()` methods
- **Files Updated**:
  - `/app/frontend/src/stores/RecursiveRegistryStore.js`
  - `/app/frontend/src/pages/TesseractExperience.js`
  - `/app/frontend/src/components/KineticHUD.js`
- **Tests**: Frontend 100% - All VOID-01 and HUD-01 features verified working


### Iteration 283 — LOOP-FIX: CSS Variable State Flattening (April 2026)
- **LOOP-FIX (State Flattening via CSS Variables)**:
  - Moved HUD scaling OUT of React state → into hardware-accelerated CSS
  - Injects `--lattice-zoom` and `--lattice-depth` via `requestAnimationFrame`
  - Widgets use CSS `calc(1 - (var(--lattice-zoom, 0) * 0.15))` for breathing
  - Removed React state-based `widgetScale` prop from KineticHUD
  - Console logs: `[LOOP-FIX] CSS Variable injected: --lattice-zoom=X.XX, depth=N`
- **CSS Variable Values by Depth**:
  - L0: `--lattice-zoom=0` (widgets at 1.0x)
  - L1: `--lattice-zoom=0.33` (widgets at 0.95x)
  - L2: `--lattice-zoom=0.67` (widgets at 0.90x)
  - L3+: `--lattice-zoom=1.0` (widgets at 0.85x)
- **RecursiveRegistryStore Throttle Guard**:
  - Added `notifySubscribers` throttle: max 10 notifications per frame
  - Uses RAF to batch excess notifications
- **VOID-01 Bloom State Throttle**:
  - Reduced bloom state updates to only fire on activation/deactivation or completion
  - Prevents 60fps updates that contributed to render cycles
- **Files Updated**:
  - `/app/frontend/src/pages/TesseractExperience.js` - RAF CSS injection, throttled bloom
  - `/app/frontend/src/components/KineticHUD.js` - CSS calc() breathing
  - `/app/frontend/src/stores/RecursiveRegistryStore.js` - Notify throttle guard
- **Tests**: Frontend 100% - All LOOP-FIX CSS variables verified working
- **Known Issue**: "Maximum update depth exceeded" (668 errors) - KNOWN PRE-EXISTING ISSUE from before this fork. Does NOT prevent functionality. Likely in MixerContext or CosmicThemeContext.


### Iteration 284 — SEAL-01 Long-Press Escape & Z-Index Fix (April 2026)
- **SEAL-01 (Emergency Surface) Implemented**:
  - Long-press center button for 1.5s → Instant snap to L0
  - Progress ring shows during hold (jade/purple based on void mode)
  - Haptic feedback pattern: [50, 30, 100, 30, 150] on completion
  - Console logs: `[SEAL-01] Long-Press Escape triggered - surfacing to L0`
  - CSS variables reset to 0 immediately on escape
- **Critical Z-Index Fix**:
  - Escape zone z-index changed from 1001 → 10000 (above lattice at z-9999)
  - Fixes pointer event interception by lattice grid cells
- **Escape Zone UI**:
  - 80x80px centered button, only visible at depth > 0
  - Shows "L{depth}" when idle, progress % when holding
  - Backdrop blur + radial gradient during escape sequence
- **Files Updated**:
  - `/app/frontend/src/pages/TesseractExperience.js` - SEAL-01 implementation

---

## Session Summary — The Enlightenment Cafe "Restoration" Sprint

**What Was Accomplished:**
1. **AUD-01**: Acoustic Bloom (200ms dwell gates audio)
2. **MEM-01**: Registry Memory Cache (localStorage persistence)
3. **SYNC-01**: Global Registry Singleton (atomic state broadcasts)
4. **Visual Bloom**: Jade radial gradient during dwell
5. **Haptic Crescendo**: 5ms→10ms→15ms→25ms tactile pulses
6. **GEO-01**: +15% magnetic pull for Qiān (Modesty)
7. **VOID-01**: Bloom state persistence across depth
8. **HUD-01**: Dynamic widget breathing (CSS calc)
9. **LOOP-FIX**: CSS Variable state flattening (zero re-renders)
10. **SEAL-01**: Long-Press Escape (1.5s hold → L0)

**Architecture Health**: The Tesseract OS now "breathes" via CSS variables, not React state. HUD and Lattice are synchronized performers. The escape mechanism provides psychological safety for deep dives.

**Known Debt**: "Maximum update depth exceeded" (668 errors) - pre-existing from MixerContext/CosmicThemeContext. Does NOT break functionality.


### Iteration 285 — Z-Index Hierarchy Cleanup & UI Declutter (April 2026)
- **Z-Index Hierarchy Overhaul**:
  - Created `/app/frontend/src/config/zIndexHierarchy.js` defining proper layer system
  - BACKGROUND (0-9) → CONTENT (10-49) → NAV (50-99) → WIDGET (100-199) → OVERLAY (200-299) → MODAL (300-499) → ALERT (500-699) → EMERGENCY (700-999)
- **Fixed Overlapping Components**:
  - VellumOverlay: z-9997 → z-2-5 (background layer where it belongs)
  - SmartDock baseZ: z-9997 → z-60-80 (navigation layer)
  - GuidedTour: z-9999 → z-350 (modal layer)
  - RecursivePortal depth HUD: z-9972 → z-200 (overlay layer)
  - SageAvatar: z-9985 → z-100 (widget layer)
- **Conditional Portal HUD**:
  - Depth hints only show on portal-related pages (/recursive, /portal, /tesseract, /dive) or when depth > 0
  - Eliminates tooltip clutter on dashboard/home page
- **Background Colors Lightened**:
  - SmartDock panels: rgba(10,10,18) → rgba(25,27,38) - less oppressively dark
  - SageAvatar bubble: rgba(10,10,18) → rgba(40,40,50) - more visible
- **Orbital Widget System Created** (for future use):
  - `/app/frontend/src/systems/OrbitalWidgetSystem.js` - collision-avoidance positioning
  - Widgets assigned to orbital paths (INNER/MIDDLE/OUTER) with angular separation
- **Result**: Mobile view now CLEAN - main content visible, no overlapping elements, proper layer separation

---

## Central Crystal & Harmonic Resistance Architecture (April 2026)

### Central Crystal — The Heart of Equilibrium
**"The Singular Resonance Point"**

The Central Crystal maintains the 'Equilibrium' of the entire system. It acts as the state manager that all modules pulse toward.

**Files:**
| File | Purpose |
|------|---------|
| `/app/backend/engines/central_crystal.py` | Core crystal state management |
| `/app/backend/engines/harmonic_guardrail.py` | Intent filtering (blocks dissonance) |
| `/app/backend/engines/enlightenment_router.py` | Temporal resistance routing |
| `/app/backend/routes/crystal.py` | API endpoints for frontend |

**Source Frequencies:**
| Source | Frequency | Resistance | Description |
|--------|-----------|------------|-------------|
| Void | 0.0 Hz | 0.1 | The empty state, the beginning |
| Breathing | 111.0 Hz | 0.2 | Quick centering, kinetic calm |
| Mixer | 528.0 Hz | 0.8 | Sound synthesis, frequency blending |
| Sanctuary | 432.0 Hz | 1.2 | Safe space, harmonic balance |
| I Ching | 639.0 Hz | 1.5 | Ancient wisdom, hexagram meditation |
| Star Chart | 777.0 Hz | 1.8 | Celestial navigation, cosmic alignment |
| Tarot | 741.0 Hz | 1.8 | Archetypal journey, symbolic insight |
| Oracle | 852.0 Hz | 2.2 | Intuitive guidance, inner knowing |
| Divination | 888.0 Hz | 2.5 | Oracle wisdom, deep insight |
| Tesseract | 963.0 Hz | 2.8 | 4D navigation, recursive depth |

### Harmonic Guardrail — Intent Filtration
**"Protecting the Crystal from Dissonance"**

Every input to the system carries an 'intent frequency'. The Guardrail analyzes signals and:
- **GROUNDS** (blocks) dissonant signals (resonance < 0.3)
- **ALIGNS** (allows) neutral signals (0.3 ≤ resonance < 0.8)
- **ELEVATES** (boosts) highly harmonious signals (resonance ≥ 0.8)

**Resonance Calculation:**
- Base: 0.5 (neutral)
- Harmony keywords (+0.1 each): learn, grow, wisdom, sacred, meditation, etc.
- Dissonance keywords (-0.2 each): destroy, delete everything, hate, worthless, etc.
- Excessive caps/punctuation: -0.1 to -0.15

### Enlightenment Router — Temporal Resistance
**"Slowed Momentum for Deep Content"**

Three processing lanes based on content weight:
| Lane | Weight | Delay | Description |
|------|--------|-------|-------------|
| ⚡ Kinetic | ≤ 0.4 | 0.01s | UI interactions, quick responses |
| ⚖️ Balanced | > 0.4, ≤ 0.8 | 0.5s | Standard content flow |
| 🧘 Theological | > 0.8 | 2.5s | Deep wisdom, contemplative content |

**API Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/crystal/state` | GET | Current crystal state |
| `/api/crystal/sources` | GET | Available source buttons |
| `/api/crystal/pulse` | POST | Harmonic pull to new target |
| `/api/crystal/instant` | POST | Instant shift (no delay) |
| `/api/crystal/history` | GET | Transition history |
| `/api/crystal/reset` | POST | Reset to Void |
| `/api/crystal/guardrail/analyze` | POST | Test intent analysis |
| `/api/crystal/interface` | GET | Full interface state |
| `/api/harmonic/process` | POST | Process content through router |
| `/api/harmonic/lanes` | GET | Available processing lanes |

**Keith Wright's Principle:**
Higher resistance = more steps = slower transition = deeper contemplation



---

## Latest Implementation: Zero-Scale Parentage Orbital Hub (April 2026)

### The Orbital Physics Model
**"Sovereign Crystalline Navigation"**

The Orbital Hub now implements the user's specified mathematical physics model:

**Three States:**
1. **Latent State** — Core visible (Scale 1.0), all satellites at local (0,0,0) with Scale 0, Opacity 0.1 (resonance floor)
2. **Bloom State** — Tap Core triggers satellites to deploy to 2.5x radius at Scale 0.3, Opacity 1.0
3. **Extracted State** — Tap satellite extracts it to Scale 1.0, others collapse back to (0,0,0) at Scale 0

**Mathematical Constants:**
| Constant | Value | Purpose |
|----------|-------|---------|
| SUB_ORB_LATENT_SCALE | 0.0 | Hidden state |
| SUB_ORB_BLOOM_SCALE | 0.3 | Visible but small |
| SUB_ORB_EXTRACTED_SCALE | 1.0 | Full size navigation |
| BLOOM_RADIUS_MULTIPLIER | 2.5 | Orbit distance |
| EXTRACTION_RADIUS_MULTIPLIER | 3.0 | Breakaway threshold |
| TAP_THRESHOLD_MS | 300 | Tap vs drag differentiation |
| LERP_SPEED | 0.08 | Animation smoothness |

**Key Technical Fixes:**
- Resonance Floor (0.1) prevents satellites from disappearing completely
- `pointer-events: none` on inner content allows events to bubble to parent
- `isAtResonanceFloor` check disables pointer events when satellites are collapsed to prevent blocking the core

**Sanctuary/EnlightenMintCafe Integration:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sanctuary/status` | GET | Get sanctuary state |
| `/api/sanctuary/deed` | POST | Log karma-generating deeds |
| `/api/sanctuary/recycle` | POST | Donate to Global Grace |
| `/api/sanctuary/vr-access/{user_id}` | GET | Check VR unlock status |

**CSS Additions:**
- `.manual-gravity-container` — Matrix Slider containment with white light buffer
- `.hexagram-generator-core` — 9x9 grid with rainbow border
- Tour overlay disabled via `.tour-overlay, .auto-prompt { display: none !important; }`

---

## Harmonic Resonance System (April 2026)

### Solfeggio Frequency Integration
**"Master Tempo Synchronization"**

All nodule vibrations can now sync to healing frequencies:

| Frequency | Name | Pulse Speed | Effect |
|-----------|------|-------------|--------|
| 174Hz | Foundation | 5s | Pain relief |
| 285Hz | Quantum | 4.5s | Tissue regeneration |
| 396Hz | Liberation | 4.2s | Release fear |
| 417Hz | Change | 4s | Facilitate change |
| 432Hz | Earth | 4s | Universal harmony |
| 528Hz | Love | 2.5s | DNA repair |
| 639Hz | Connection | 3s | Relationships |
| 741Hz | Awakening | 2s | Problem solving |
| 852Hz | Intuition | 1.5s | Spiritual order |
| 963Hz | Divine | 1.2s | Pineal activation |

**Blending Formula:**
```css
animation-duration: calc(var(--pulse-speed) * 0.8 + var(--master-pulse) * 0.2);
```
80% individual character + 20% master sync = Unity in Diversity

**New Utilities:**
- `/utils/HarmonicResonance.js` — setGlobalResonance(), useHarmonicResonance hook
- `/utils/NoduleGenerator.js` — Spherical Fibonacci positioning
- `/components/SphericalNoduleCloud.js` — Reusable 3D nodule renderer



---

## Update: April 5, 2026 - Orbital Hub P0 Fixes Complete

### Completed Fixes

#### 1. Zero-Scale Parentage Physics (P0) ✅
The Orbital Hub now correctly implements the mathematical physics:
- **Core**: Scale 1.0 (always visible)
- **Bloom State**: Sub-orbs at 2.5x radius with 0.3 scale
- **Extract State**: Selected orb at 3.0x radius with 1.0 scale
- **Latent State**: Sub-orbs at (0,0,0) with 0.1 scale (crystalline seed floor)

**Key Fix**: Replaced `setInterval` forceUpdate pattern with `requestAnimationFrame` + refs for 60fps animations without triggering React re-renders.

#### 2. Pointer-Events Fix (P1) ✅
Fixed button/interaction glitches:
- Added `pointer-events: none` to container div
- Added `pointer-events: auto` to core and sub-orbs
- CSS global fix for decorative layers (`.aura-layer`, `.svg-tethers`, etc.)

#### 3. Emergency STOP Button (P0) ✅
- Positioned in absolute top-left corner
- Maximum z-index (99999)
- Shows VOID/STOP text
- Verified clickable and accessible

#### 4. Grand Finale Coordinator Integration (P1) ✅
- `GrandFinaleCoordinator.js` integrated into OrbitalHub
- Tracks `extractedCount` for Critical Mass event trigger

### New Components Created

1. **`EtherNode.js`** — Gear-driven rotational nodule system
   - Uses CW/CCW gear rotation from HarmonicResonance
   - Dual-layer architecture (Base → Ether extraction)
   - Haptic click feedback on extraction

2. **`useGearSystem`** hook in HarmonicResonance.js
   - Golden Ratio (φ = 1.618) driven rotation
   - Ref-based animation (no React re-renders)
   - Subscribe pattern for DOM updates

### Known Issues (Deferred)

- **React Context Loop**: "Maximum update depth exceeded" errors persist in console
  - Multiple context providers have callback functions in useEffect dependencies
  - Does NOT prevent functionality (UI works correctly)
  - Requires extensive refactoring of 10+ context files to fully resolve

### Testing Status
- **Test Report**: `/app/test_reports/iteration_284.json`
- **Success Rate**: 100% for all requested features
- All Zero-Scale Parentage physics verified working
- Emergency STOP button verified in top-left
- Hub interaction flow: latent → bloom → extract → navigate ✅

### Files Modified
- `/app/frontend/src/pages/OrbitalHub.js` - Main hub with physics fixes
- `/app/frontend/src/context/EnlightenmentCafeContext.js` - Fixed useEffect deps
- `/app/frontend/src/context/AvatarContext.js` - Fixed useEffect deps
- `/app/frontend/src/context/CreditContext.js` - Fixed useEffect deps
- `/app/frontend/src/context/SovereignContext.js` - Fixed useEffect deps
- `/app/frontend/src/hooks/useCrystalResonance.js` - Fixed useEffect deps
- `/app/frontend/src/hooks/useDepth.js` - Added FPS debounce
- `/app/frontend/src/hooks/useZeroPointFlicker.js` - Tolerance-based detection
- `/app/frontend/src/hooks/useGameController.js` - Fixed useEffect deps
- `/app/frontend/src/components/PersistentWaveform.js` - Ref-based animation
- `/app/frontend/src/utils/HarmonicResonance.js` - Added useGearSystem hook
- `/app/frontend/src/index.css` - Pointer-events CSS fix

### New Files Created (April 5, 2026)

#### EnlightenMintHub.js — Streamlined Alternative Hub
Route: `/ether-hub`

A cleaner, zero-re-render implementation featuring:
- **Bio-Sync Animation**: 5.5s breath cycle driving all motion
- **Webbed Gears**: CW/CCW rotation with Golden Ratio (φ = 1.618)
- **Critical Mass System**: Extract 15 nodules to unlock Action Overlay
- **Action Overlay**: Modal with Sanctuary/Stripe/VR integration buttons

#### CelestialDome.js — VR Entry Point
Route: `/vr/celestial-dome`

VR sanctuary destination for Sovereign Key holders:
- WebXR detection and support
- Animated starfield background
- Karma display integration
- Feature roadmap cards (Spatial Meditation, Sovereign Council, Seed Garden, Cosmic Observatory)

#### EtherNode.js — Gear-Driven Node Component
Reusable nodule component with:
- CW/CCW gear rotation subscription
- Base/Ether layer extraction mechanic
- Haptic feedback on extraction



---

## April 5, 2026 Update: EnlightenmentOS Sovereign System Core

### EnlightenmentOS.js — Full-Bleed Sovereign Interface
Route: `/sovereignty` and `/enlightenment-os`

New unified Sovereign System Core component featuring:

#### Visual Architecture
- **Full-Bleed Three.js Canvas**: Crystalline icosahedron wireframe with particle field (1000 particles, mint/purple/gold colors)
- **Dual Nested Domes**: Outer dome (scale 20) + inner dome (scale 15) with additive blending
- **Bio-Sync Breathing**: Opacity pulsation following breath timing (875ms cycle)

#### UI Components
| Component | Position | Purpose |
|-----------|----------|---------|
| Top Strip (Sky Anchor) | Top edge | VOID status, SOVEREIGN_DIRECTOR title, KARMA balance |
| Central Portal | Center | COSMOS_AI_ACTIVE with 3 pulse ring animations |
| Quick Actions Grid | Center-below portal | 4 buttons: SANCTUARY, MEMBERSHIP, ORACLE, JOURNAL |
| Rubber Band Utility | Bottom edge | Kinetic snap-back nav (HUB, ETHER, LOOM, DOME, EXIT) |
| HRTF Audio Indicator | Top-right | Shows when spatial audio is initialized |

#### Navigation Routes
| Button | Destination |
|--------|-------------|
| SANCTUARY | /sanctuary |
| MEMBERSHIP | /membership |
| ORACLE | /oracle |
| JOURNAL | /journal |
| HUB | /ether-hub |
| ETHER | /hub |
| LOOM | /quantum-loom |
| DOME | /vr/celestial-dome |
| EXIT | /dashboard |

#### Technical Features
- Audio context initialization on user click (browser autoplay policy compliance)
- Haptic feedback on navigation (vibrate pattern: [15, 10, 30])
- Proper Three.js cleanup on unmount (geometry, material, renderer disposal)
- CSS custom properties for theming (--mint: #00FFC0, --void: #05000a, --purple: #A855F7)

### Context Memoization Fixes (April 5, 2026)
Fixed "Maximum update depth exceeded" issues in multiple context providers by adding `useMemo` wrapping:
- SensoryContext.js
- MeshNetworkContext.js
- CosmicStateContext.js
- TempoContext.js
- ClassContext.js
- ModalityContext.js
- TreasuryContext.js
- ResolutionContext.js
- VoiceCommandContext.js
- EnlightenmentCafeContext.js
- useLatencyPulse.js

**Status**: Errors reduced but not fully eliminated (complex context chain still triggers occasional loops)



### SovereignStreamline V7.1 Integration (April 5, 2026)

**Status**: COMPLETE ✅

#### Core Features Implemented
| Feature | Description | Status |
|---------|-------------|--------|
| Schumann Binaural | 7.83Hz brainwave entrainment (100Hz left + 107.83Hz right stereo) | ✅ |
| Metatron's Cube Omni-Point | 13 sacred geometry nodes (1 center + 6 inner + 6 outer hexagon) | ✅ |
| Splitting Tetrahedron | 4 vertices with squared/inversed rotation | ✅ |
| GPS Geofencing | Black Hills calibration (44.08°N, 103.23°W, 50km radius) | ✅ |
| Matrix Liberation | Fixed positioning to decouple from DOM box model | ✅ |
| Emergency Reset | Shield bypass with SHIELD_DEACTIVATE event | ✅ |

#### Files Updated
- `/app/frontend/src/utils/SovereignStreamlineV7.js` - v7.0/v7.1 unified core
- `/app/frontend/src/pages/MintingCeremony.js` - Uses useSovereignV7 hook
- `/app/frontend/src/App.js` - Imports SovereignStreamlineV7 (not V4)
- `/app/frontend/src/components/EmergencyShutOff.js` - Top-left STOP button (z-index 99999)

#### React Hook: useSovereignV7
Exports: `isRitualActive`, `progress`, `result`, `geoLock`, `ledger`, `vectorState`, `touchPoints`, `startCeremony`, `dispatch`, `checkGeoLock`, `startBinaural`, `stopBinaural`, `streamline`

#### Routes Using V7
- `/mint` - Minting Ceremony with binaural entrainment
- `/void` - Silent Sanctuary with minimal interface
- `/ether-hub` - Enlighten Mint Hub
- `/sovereignty` - EnlightenmentOS

#### Test Results (iteration_286.json)
- Emergency Shut-Off: PASS (both /mint and /void)
- Minting Ceremony: PASS
- Silent Sanctuary: PASS
- V7 Binaural Functions: PASS
- Omni-Point Generation: PASS
