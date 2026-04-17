# ENLIGHTEN.MINT.CAFE — MASTER ARCHITECTURE DOCUMENT
## V67.0 Sovereign Deployment — Complete System Blueprint
### Last Updated: April 17, 2026

---

## 1. SYSTEM OVERVIEW

**ENLIGHTEN.MINT.CAFE** is a Sovereign Unified Engine (PWA) — an esoteric, immersive wellness and spiritual platform housing 176 interactive nodules across 11 pillars. At its core: 22 dynamic workshop modules containing 132 materials, 198 tools, and 6-depth recursive dives that bridge physical craftsmanship to universal law.

### The Numbers
| Metric | Value |
|--------|-------|
| Frontend Pages | 167 |
| Frontend Components | 192 |
| Custom Hooks | 35 |
| Engine Files | 66 |
| Utility Files | 59 |
| Context Providers | 25 |
| Backend Route Files | 193 |
| Frontend Routes | 184 |
| Workshop Modules | 22 |
| Total Materials | 132 |
| Total Tools | 198 |
| Hybrid Titles | 13 |
| Core Bundle Size | 791KB |
| Lazy Chunks | 210+ |

---

## 2. TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router 6 |
| Styling | Tailwind CSS + Custom CSS Variables |
| Animation | Framer Motion |
| UI Components | Shadcn/UI + Lucide Icons |
| State Management | React Context (25 providers, consolidated in SovereignProviders.js) |
| HTTP Client | Axios |
| Notifications | Sonner |
| Backend | FastAPI (Python) |
| Database | MongoDB (via motor async driver) |
| Auth | JWT (bcrypt hashed passwords) |
| AI Integration | OpenAI GPT-5.2 via Emergent LLM Key |
| PWA | Service Worker + Manifest |
| Deployment | Kubernetes container (preview: Emergent Platform) |

---

## 3. DIRECTORY STRUCTURE

```
/app
├── frontend/
│   ├── src/
│   │   ├── pages/              # 167 lazy-loaded page components
│   │   ├── components/         # 192 shared components
│   │   │   ├── ui/             # Shadcn/UI primitives
│   │   │   ├── OracleSearch.js # Intent-Based Neural Search
│   │   │   ├── DynamicWorkshop.js  # Ghost Router (/workshop/:moduleId)
│   │   │   ├── UniversalWorkshop.js # Universal Cell DNA
│   │   │   ├── BackToHub.js    # Navigation + Related cross-links
│   │   │   ├── SovereignProviders.js # 25 contexts consolidated
│   │   │   └── ProgressionToast.js   # XP/Dust feedback
│   │   ├── hooks/              # 35 custom hooks
│   │   │   ├── useWorkAccrual.js   # Global XP/Dust heartbeat
│   │   │   ├── useActivityTracker.js
│   │   │   └── useAmbientSoundscape.js
│   │   ├── engines/            # 66 engine files (deferred loading)
│   │   ├── utils/              # 59 utility files
│   │   ├── context/            # 25 React Contexts
│   │   │   ├── AuthContext.js
│   │   │   └── LanguageContext.js
│   │   ├── styles/
│   │   │   └── UniverseMaterials.css
│   │   └── App.js              # Master router (184 routes)
│   ├── public/
│   └── package.json
├── backend/
│   ├── server.py               # FastAPI app entry
│   ├── routes/                 # 193 route files
│   │   ├── auth.py             # JWT authentication
│   │   ├── rpg.py              # RPG system + Trade Passport
│   │   ├── workshop.py         # Original Masonry/Carpentry data
│   │   ├── workshop_v60.py     # MASTER REGISTRY (132 materials)
│   │   ├── transmuter.py       # Dust accrual engine
│   │   └── [190 more route files]
│   ├── deps.py                 # MongoDB connection + dependencies
│   └── requirements.txt
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

---

## 4. CORE ARCHITECTURAL PATTERNS

### 4.1 Dynamic Module Registry (Zero Manual Pages)
The 22 workshop modules are NOT individual React page files. They are entries in a single Python dictionary (`WORKSHOP_REGISTRY` in `workshop_v60.py`) rendered by ONE universal component.

**Data Flow:**
```
URL: /workshop/masonry
  → DynamicWorkshop.js reads :moduleId from URL
  → Fetches GET /api/workshop/registry
  → Finds module config (title, icon, accentColor, skillKey)
  → Renders UniversalWorkshop with that config
  → UniversalWorkshop fetches GET /api/workshop/masonry/materials
  → UniversalWorkshop fetches GET /api/workshop/masonry/tools
  → Renders: Center Block + 9-Tool Sprocket Ring + 6-Depth Dive Panel
```

**To add a new module:** Add data to `workshop_v60.py`. No frontend files needed.

### 4.2 Sprocket Data Highway (791KB Metabolic Seal)
The core bundle must stay under 800KB. This is enforced by:

1. **Eager imports in App.js** are strictly limited (Landing, Auth, CinematicIntro only)
2. **React.lazy()** wraps all 167+ pages
3. **SovereignProviders.js** consolidates 25 context providers into one lazy-loaded chunk
4. **requestIdleCallback** defers 30+ engine/utility imports
5. **All workshop data** lives on the backend, fetched on demand via API

### 4.3 XP Signal Path (Nervous System)
```
User interacts with workshop tool
  → UniversalWorkshop calls window.__workAccrue(skillKey, 12)
  → useWorkAccrual.js buffers locally
  → At threshold (50) or heartbeat (30s):
      POST /api/transmuter/work-submit → earns Dust
      POST /api/rpg/character/gain-xp → earns XP (logged with source)
  → XP log entries accumulate in MongoDB rpg_xp_log collection
  → GET /api/rpg/passport aggregates logs by source
  → SKILL_DOMAINS maps sources to 7 domains
  → HYBRID_TITLES checks cross-domain thresholds
  → Returns: domain mastery, unlocked titles, dive clearance
```

### 4.4 Intent-Based Oracle Search
```
User types query in OracleSearch.js
  → Debounced 250ms → GET /api/workshop/search?q=<query>
  → Backend scores all 22 modules by:
      - Title match (+10)
      - Subtitle match (+5)
      - Domain match (+8)
      - Intent tag match (+3 per tag)
      - Material name match (+7)
      - Material origin match (+2)
      - Tool name match (+4)
      - Tool description match (+1)
  → Returns results sorted by score, grouped by domain
  → Frontend groups by domain, shows bridge indicators
  → Pillar accordion headers glow when their domain has results
```

---

## 5. THE 22 WORKSHOP MODULES

### Trade & Craft (9 modules)
| Module | ID | Materials | Skill Key | Accent |
|--------|----|-----------|-----------|--------|
| Masonry | masonry | Granite, Marble, Limestone, Sandstone, Basalt, Slate | Masonry_Skill | #D4AF37 |
| Carpentry | carpentry | White Oak, Walnut, Cherry, Maple, Cedar, Pine | Carpentry_Skill | #92400E |
| Electrical | electrical | Copper Wire, Romex, Conduit, Fiber Optic, GFCI, Breaker | Electrical_Skill | #F59E0B |
| Plumbing | plumbing | Copper Pipe, PVC, PEX, Cast Iron, SharkBite, Ball Valve | Plumbing_Skill | #3B82F6 |
| Landscaping | landscaping | Topsoil, Gravel, Compost, River Rock, Peat Moss, Mulch | Landscaping_Skill | #22C55E |
| Welding | welding | Mild Steel, Aluminum, Stainless, Flux-Core, Plasma, Underwater | Welding_Skill | #F97316 |
| Automotive | automotive | Engine Block, Brakes, Electrical, Hybrid/EV, Transmission, ECU | Automotive_Skill | #6B7280 |
| HVAC | hvac | Ductwork, Refrigerant, Heat Pump, Compressor, Thermostat, IAQ | HVAC_Skill | #60A5FA |
| Machining | machining | Lathe, Milling, CNC, Surface Grinding, EDM, Threading | Machining_Skill | #6B7280 |

### Healing Arts (5 modules)
| Module | ID | Materials | Skill Key | Accent |
|--------|----|-----------|-----------|--------|
| Nursing | nursing | Vitals, Wound Care, Medication, Fall Risk, Cardiac, Patient Ed | Nursing_Skill | #EF4444 |
| Child Care | childcare | Development, Safety, Nutrition, Behavior, Learning, First Aid | Childcare_Skill | #EC4899 |
| Elderly Care | eldercare | Mobility, Cognition, Medication Mgmt, Fall Prevention, Nutrition, Palliative | Eldercare_Skill | #A78BFA |
| First Aid | first_aid | CPR, Bleeding, Burns, Fractures, Shock, Poisoning | FirstAid_Skill | #EF4444 |
| Nutrition | nutrition | Whole Foods, Fermented, Superfoods, Micronutrients, Gut Microbiome, Metabolic Flexibility | Nutrition_Skill | #22C55E |

### Sacred Knowledge (3 modules)
| Module | ID | Materials | Skill Key | Accent |
|--------|----|-----------|-----------|--------|
| Bible Study | bible | Genesis, Psalms, John, Romans, Proverbs, Revelation | Bible_Study_Skill | #D4AF37 |
| Hermetics | hermetics | Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause & Effect | Hermetics_Skill | #7C3AED |
| Philosophy | philosophy | Ethics, Logic, Metaphysics, Existentialism, Stoicism, Epistemology | Philosophy_Skill | #8B5CF6 |

### Science & Physics (2 modules)
| Module | ID | Materials | Skill Key | Accent |
|--------|----|-----------|-----------|--------|
| Robotics | robotics | Actuators, Sensors, Microcontrollers, Kinematics, AI/ML, Power Systems | Robotics_Skill | #3B82F6 |
| Anatomy | anatomy | Musculoskeletal, Cardiovascular, Nervous, Endocrine, Lymphatic, Integumentary | Anatomy_Skill | #EF4444 |

### Mind & Spirit (1 module)
| Module | ID | Materials | Skill Key | Accent |
|--------|----|-----------|-----------|--------|
| Meditation | meditation | Inner Silence, Breath Awareness, Visualization, Theta Wave, Heart-Math, Stoic Visualization | Meditation_Skill | #6366F1 |

### Exploration (2 modules)
| Module | ID | Materials | Skill Key | Accent |
|--------|----|-----------|-----------|--------|
| Public Speaking | speaking | Audience Analysis, Persuasion, Storytelling, Rhetoric, Body Language, Crisis Comm | Speaking_Skill | #F59E0B |
| Pedagogy | pedagogy | Lesson Design, Assessment, Classroom Mgmt, Curriculum Mapping, Differentiation, Behavioral Psych | Pedagogy_Skill | #3B82F6 |

---

## 6. 7 SKILL DOMAINS (Trade Passport)

| Domain | Color | Source Skills |
|--------|-------|--------------|
| Trade & Craft | #FBBF24 | Masonry, Carpentry, Electrical, Plumbing, Landscaping, Welding, Automotive, HVAC, Machining |
| Healing Arts | #22C55E | Nursing, Child Care, Elderly Care, First Aid, Nutrition |
| Mind & Spirit | #A78BFA | Meditation (+ breathing, yoga, affirmations, mantras, etc.) |
| Science & Physics | #3B82F6 | Robotics, Anatomy (+ quantum, fractal, physics, etc.) |
| Creative Arts | #EC4899 | Generators, creation stories, music, soundscapes |
| Exploration | #F97316 | Public Speaking, Pedagogy (+ VR, discovery, etc.) |
| Sacred Knowledge | #D4AF37 | Bible Study, Hermetics, Philosophy (+ numerology, cardology, etc.) |

---

## 7. 13 HYBRID TITLES

| Title | Requirements | Color |
|-------|-------------|-------|
| General Contractor | Trade ≥ 20, Science ≥ 10 | #FBBF24 |
| Master Artisan | Trade ≥ 50, Creative ≥ 20 | #EC4899 |
| Sovereign Healer | Healing ≥ 30, Sacred ≥ 20 | #22C55E |
| Quantum Architect | Science ≥ 30, Trade ≥ 20 | #6366F1 |
| Renaissance Soul | Trade ≥ 15, Healing ≥ 15, Mind ≥ 15, Creative ≥ 15 | #D4AF37 |
| Cosmic Navigator | Exploration ≥ 40, Science ≥ 20 | #38BDF8 |
| Sage Oracle | Sacred ≥ 30, Mind ≥ 30 | #C084FC |
| Hardscape Engineer | Trade ≥ 40 | #94A3B8 |
| Biomechanical Engineer | Trade ≥ 25, Science ≥ 25 | #60A5FA |
| Climate Architect | Trade ≥ 30, Healing ≥ 15 | #2DD4BF |
| Sovereign Medic | Healing ≥ 40, Science ≥ 15 | #EF4444 |
| Philosopher King | Sacred ≥ 40, Exploration ≥ 20 | #8B5CF6 |
| Sacred Engineer | Trade ≥ 20, Sacred ≥ 20, Mind ≥ 20 | #D4AF37 |

---

## 8. KEY API ENDPOINTS

### Workshop System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workshop/registry | Full 22-module registry with metadata |
| GET | /api/workshop/search?q= | Intent-based neural search across all modules |
| GET | /api/workshop/{module_id}/materials | Materials for a specific module |
| GET | /api/workshop/{module_id}/tools | Tools for a specific module |
| POST | /api/workshop/{module_id}/tool-action | Execute tool action (earns XP) |

### RPG & Passport
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rpg/passport | Full Trade Passport (domains, titles, clearance) |
| POST | /api/rpg/character/gain-xp | Award XP from activity source |
| GET | /api/rpg/character | Get RPG character stats |
| POST | /api/rpg/character/allocate | Allocate stat points |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | JWT login |
| GET | /api/auth/me | Current user profile |

### Dust/Transmuter
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/transmuter/work-submit | Submit work buffer for Dust accrual |

---

## 9. DATABASE COLLECTIONS (MongoDB)

| Collection | Purpose |
|-----------|---------|
| users | User accounts (email, hashed password, profile) |
| rpg_characters | RPG stats, XP, level, stat points |
| rpg_xp_log | Every XP event (user_id, amount, source, timestamp) |
| dust_balances | Dust currency balances |
| sessions | Activity sessions |
| achievements | Unlocked achievements |
| creations | User-generated content |
| [100+ more] | Domain-specific collections |

---

## 10. FRONTEND ROUTING MAP (184 Routes)

### Core Hub
- `/` → Redirect to `/sovereign-hub`
- `/sovereign-hub` → SovereignHub (11-pillar accordion + Oracle Search)
- `/hub` → OrbitalHub
- `/landing` → Landing page
- `/auth` → Authentication
- `/intro` → Cinematic intro

### Workshop System (Dynamic)
- `/workshop/:moduleId` → DynamicWorkshop (any of 22 modules)
- `/trade-passport` → TradePassport (RPG progression)
- `/workshop` → Workshop index

### Legacy Redirects (Preserved)
- `/masonry-workbench` → `/workshop/masonry`
- `/carpentry-workbench` → `/workshop/carpentry`
- `/electrical-workbench` → `/workshop/electrical`
- `/plumbing-workbench` → `/workshop/plumbing`
- `/landscaping-workbench` → `/workshop/landscaping`
- `/nursing-workbench` → `/workshop/nursing`
- `/bible-study-workbench` → `/workshop/bible`
- `/childcare-workbench` → `/workshop/childcare`
- `/eldercare-workbench` → `/workshop/eldercare`

### 11 Sovereign Pillars (175+ pages)
- **Practice:** /breathing, /meditation, /yoga, /mudras, /mantras, /light-therapy, /affirmations, /daily-ritual, /mood, /exercises, /hooponopono, /tantra, /silent-sanctuary, /challenges, /rituals
- **Divination:** /oracle, /akashic-records, /star-chart, /numerology, /dreams, /dream-realms, /mayan, /cosmic-calendar, /cardology, /animal-totems, /hexagram-journal, /forecasts, /cosmic-insights, /soul-reports, /collective-shadow-map
- **Sanctuary:** /zen-garden, /soundscapes, /music-lounge, /dance-music, /frequencies, /vr, /journal, /wisdom-journal, /green-journal, /meditation-history, /sanctuary, /media-library
- **Nourish & Heal:** /nourishment, /aromatherapy, /herbology, /elixirs, /crystals, /acupressure, /reiki, /meal-planning, /botany, /botany-orbital, /rock-hounding, /wellness-reports, /replant
- **Knowledge:** /teachings, /sacred-texts, /bible, /encyclopedia, /creation-stories, /forgotten-languages, /reading-list, /learn, /tutorial, /discover, /videos, /blessings, /yantra, /codex, /codex-orbital, /theory
- **Creators:** /creator-console, /cosmic-mixer, /fabricator, /create, /my-creations, /avatar, /spiritual-avatar, /avatar-gallery, /sovereign-canvas, /seed-gallery, /minting-ceremony, /workshop, /refinement-lab, /smartdock, /nexus
- **Sage AI Coach:** /coach, /daily-briefing, /cosmic-profile, /certifications, /growth-timeline, /journey, /mastery-path, /mastery-avenues, /analytics, /hotspots
- **RPG & Adventure:** /rpg, /games, /starseed-adventure, /starseed-realm, /starseed-worlds, /cryptic-quest, /evolution-lab, /entanglement, /starseed, /void
- **Cosmos & Physics:** /observatory, /fractal-engine, /quantum-field, /quantum-loom, /dimensional-space, /tesseract, /metatron, /planetary-depths, /multiverse-map, /vr/celestial-dome, /ar-portal, /physics-lab, /crystalline-engine, /lattice-view, /recursive-dive, /refractor, /suanpan, /cosmic-map, /multiverse-realms, /enlightenment-os
- **Sovereign Council:** /sovereigns, /economy, /academy, /trade-circle, /trade-orbital, [22 workshop links], /crystal-skins, /archives, /cosmic-ledger, /liquidity-trader, /resource-alchemy, /gravity-well, /community, /friends, /classes, /live, /cosmic-store, /membership, /sovereign-circle, /master-engine, /master-view, /sovereignty, /sovereign, /console, /mint, /lab, /creator, /settings
- **Extras:** /profile, /pricing, /terms, /help-center, /feedback, /admin-setup, /sovereign-admin

---

## 11. THE 6-DEPTH RECURSIVE DIVE PATTERN

Every material follows the same sacred geometry:

| Depth | Label Pattern | Example (Copper Wire) |
|-------|--------------|----------------------|
| L0 | Surface/Physical | Insulated Cable |
| L1 | Component/Structure | Copper Strands |
| L2 | Microstructure/Process | Crystal Grain |
| L3 | Molecular/Principle | Electron Band |
| L4 | Fundamental Law | Fermi Surface |
| L5 | Universal/Quantum | Quantum Tunneling |

**The Transmutation Rule:** L0 is what the apprentice sees. L5 is what the master knows. The journey from wrench to wavefunction is the same in every module.

---

## 12. PERFORMANCE ARCHITECTURE

### Metabolic Seal (791KB)
- **Eager imports:** Only 3 (Landing, Auth, CinematicIntro)
- **Lazy-loaded:** 210+ chunks via React.lazy()
- **Deferred:** 30+ engine/utility files via requestIdleCallback
- **Consolidated:** 25 contexts wrapped in one lazy SovereignProviders chunk
- **API-fetched:** All 132 materials live on the backend, never in the bundle

### Signal Flow
- **useWorkAccrual:** Global heartbeat (30s) + threshold sync (50 buffer)
- **Beacon sync:** navigator.sendBeacon on page exit (no data loss)
- **PHI entropy:** Heartbeat jitter prevents thundering herd

---

*This document describes the complete ENLIGHTEN.MINT.CAFE architecture as of V67.0.*
*The temple is open. Every road leads to Unity.*
