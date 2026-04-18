# ENLIGHTEN.MINT.CAFE — V68.4 Sovereign Guide
## PRD — Last Updated: Feb 18, 2026

Sovereign Unified Engine (PWA). 176+ surfaced nodules, zero hidden modules.
No modals, no overlays — inline expansion only. Core bundle <800KB (Metabolic Seal).
Dynamic Registry (`workshop_v60.py`). RPG + Gamified Economy (Sparks & Dust).

## Architecture Snapshot
- Frontend: React + React-Router + framer-motion, context-driven state, lazy routes.
- Backend: FastAPI auto-discovers `/app/backend/routes/*.py` under `/api` prefix.
- DB: MongoDB (collections: `spark_wallets`, `quest_progress`, `universe_signals`, `rpg_xp_log`, …).
- Emergent LLM key for text/image gen (OpenAI GPT-5.2 + Nano Banana + Sora 2).

## 27 Workshop Cells — 100% Parity
Trade & Craft (10), Healing Arts (6), Sacred Knowledge (4), Science & Physics (3),
Creative Arts (1), Mind & Spirit (1), Exploration (2). 162 materials × 6-depth Dives × 243 tools.

## Changelog

### V68.4 (Feb 18, 2026) — Phase D: The Sovereign Guide
- **Sovereign Universe Kernel** (`/app/frontend/src/context/SovereignUniverseContext.js`)
  - React Context + vanilla `window.SovereignUniverse` bridge (version 68.4)
  - Exposes `checkQuestLogic`, `refreshGlobalUI`, `awardSpark`, `hasCard`
  - Broadcasts `sovereign:update` CustomEvent for non-React listeners
- **Quest Auto-Detect** (`/app/backend/routes/quests.py`)
  - Each step has `auto_signal` (e.g. `geology:material:minerals`, `forestry:dive:wildfire:3`)
  - `POST /api/quests/auto_detect` enforces ordered completion + idempotency
  - Legacy `/quests/advance` preserved
- **Aggregate Endpoint** (`/app/backend/routes/sovereign_universe.py`)
  - `GET /api/universe/state` — wallet + quests in one round-trip
  - `POST /api/universe/signal` — signal breadcrumb log
- **Active Mission HUD** (`/app/frontend/src/components/ActiveMissionHUD.js`)
  - Inline pill beneath Spark Wallet in `SovereignHub.js`
  - Expands inline to reveal step list, hint, jump-to links
  - Shows auto-advance toast ribbons (inline — no fixed overlay)
  - Plays 528Hz Solfeggio ping on step advance, triple-chord on quest complete
  - Inline Gaming Card cinematic on quest complete (no modal)
- **Tier Gating** (`/app/frontend/src/components/TierGate.js`)
  - `/evolution-lab` + `/vr/celestial-dome` require `celestial_navigator` Gaming Card
  - Creator/admin/council bypass. Guests get sign-in CTA.
- **Terminal Signal Triggers** (`/app/frontend/src/components/QuestTerminalTrigger.js`)
  - Mounted on `/tesseract`, `/dream-realms`, `/observatory`
  - Renders inline only when prior quest steps are complete — self-hides otherwise
- **Solfeggio Tone Utility** (`/app/frontend/src/utils/solfeggioTone.js`)
  - Web Audio API bell-envelope oscillators (no new deps)
  - 528Hz "transformation" tone + 528/639/741 chord stack on quest complete
- **Card-earned API fix** (`/app/backend/routes/sparks.py` + `sovereign_universe.py`)
  - `/sparks/wallet`, `/sparks/cards`, `/universe/state` now merge threshold-based
    AND quest-reward cards (e.g. tesseract_key is visible even at 2398 sparks)
- **Workshop Signal Wiring** (`UniversalWorkshop.js`)
  - `handleMatTap` fires `<module>:material:<id>` when user opens a dive
  - "Dive Deeper" fires `<module>:dive:<material>:<depth>`

### V68.3 — Spark Engine + Observatory Overhaul
- 12 Spark reward streams + 6 Gaming Cards
- Observatory: 20 Western Constellations + NASA imagery + continuous audio
- "Resonant Frequency" cross-domain quest

### V68.0 — Five New Modules (Full Parity)
Forestry, Geology, Economics, Music Theory, Permaculture

## Backlog
### P1
- Tesseract / Dream Realms / Observatory pages — fire `checkQuestLogic` on their own activation events (wake_tesseract, dream_realms:fire_extinguish, observatory:decode)
- Membership page polish (Council/Sovereign/Citizen hierarchy copy)
- Spark-sink purchases (unlock individual dives or tools for Sparks)

### P2
- Meritocratic depth gating (higher dives require prior XP)
- Sovereign Leaderboard
- Predictive navigation
- Native mobile screen recording
- Phygital Marketplace NFC hooks

### Known Environment Limits
- Pod is ARM64 — cannot compile Android AAB/APK. Deployment path is PWABuilder.com.
- `/app` disk usage ~90% — avoid large new deps.
