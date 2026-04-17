# ENLIGHTEN.MINT.CAFE — V57.0 → V58.0 Cohesive Organism
## PRD — Last Updated: April 17, 2026

---

## V58.0 — Metabolic Seal + Dead Import Purge

### Bundle Optimization (800KB Progress)
- **Main bundle: 1.03MB** (from 1.1MB) — purged 30+ dead eager imports from App.js
- Removed: CosmicMixer(100KB), SmartDock(64KB), CosmicToolbar(20KB), SageAvatar, SageAudience, QuestHUD, MissionControlRing, CommandMode, LearningToggle, EmergencyShutOff, TieredNavigation, GlowPortal, PulseEchoVisualizer, VellumOverlay, NebulaScene, UniversalCommand, HexagramGhostLayer, ZeroPointExperience, UtilityDock, OrbitalNavigation, TrialGraduation, OrbCorner, PersistentWaveform, ShambhalaToolbar, ShambhalaCrystalSystem, ShambhalaFrontSide, CreatorMixerUI, MeshCanvasRenderer, CrystalBadge, MantraOverlay
- Lazy-loaded: CafeSettingsPanel (only loads when settings opened)
- **Gzipped: 327KB** (from 344KB) — 17KB reduction in what user actually downloads
- 206 lazy chunks for code-split modules

## V57.0 — Trade Workshop Activation + Passport + Neural Signal

### Trade Workshops
- **Masonry Workbench** (`/masonry-workbench`): 6 stones × 9 tools × 6-depth mineral lattice dive
- **Carpentry Workbench** (`/carpentry-workbench`): 6 woods × 9 tools × 6-depth grain dive
- Universal guest access. GPT-5.2 tutorials + RPG XP for authenticated users

### Sovereign Trade Passport
- `GET /api/rpg/passport`: 7 Skill Domains, 8 Hybrid Titles, Dive Clearance L0-L5
- Skill Lattice Web (SVG radar chart), domain mastery rows, expandable title cards

### Neural Context Signal
- AI Panel tracks `window.__moduleJourney` (last 5 module visits)
- Generator context includes journey thread
- `MODULE_SIBLINGS` map connects related cells
- Journey breadcrumb visible in Generator UI

### System-Wide Purge
- Zero duplicate BackToHub renders (global only)
- Cross-cell "Related" navigation for workshops
- 153/156 pages fire `__workAccrue` (16 correctly excluded)

## Architecture
- 156 hub nodules across 10 Command Pillars
- Circular Workshop Engine (reusable DNA)
- Trade Passport Central Registry
- Neural Context Signal (cross-cell AI memory)
- 206 lazy chunks, 1.03MB main bundle (327KB gzipped)

## Key Files
- `/app/frontend/src/pages/MasonryWorkbench.js`
- `/app/frontend/src/pages/CarpentryWorkbench.js`
- `/app/frontend/src/pages/TradePassport.js`
- `/app/backend/routes/workshop.py`
- `/app/backend/routes/rpg.py` (Passport endpoint)
- `/app/frontend/src/components/console/AIPanel.js` (Neural Context Signal)
- `/app/frontend/src/App.js` (purged dead imports)

## Backlog
### P1
- Continue bundle seal: target 800KB (need ~230KB more reduction)
  - Candidates: further lazy-load contexts, defer engine initialization, split PerspectiveToggle/CosmicBackground
- Batch-replicate Circular Workshop DNA to remaining trades (Electrical, Plumbing, Landscaping)
- Intent-based search (index tags/categories from Passport domains)
### P2
- Meritocratic depth tiers (volunteer hours → deeper dive access)
- Sovereign Leaderboard
- Native mobile recording, Phygital NFC hooks
