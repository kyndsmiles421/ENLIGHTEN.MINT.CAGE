# ENLIGHTEN.MINT.CAFE — Developer Reference (v1.0.7)

**Last updated:** 2026-05-01 (V69.2 + version stamp)

This document is the source of truth for any developer (human or AI agent) working on this codebase. It cross-references every architectural pattern, hook, registry entry, route, and compliance gate so future work doesn't duplicate or undermine existing systems.

If something here disagrees with the live code, the **code wins** — file an issue and update this doc.

---

## What this app IS (and isn't)

**IS:** A multi-denominational spiritual exploration and personal sovereignty instrument. Entertainment / Education / Lifestyle / Gamification. PWA wrapped as a Capacitor Android app for Play Store.

**IS NOT:** A medical device, diagnostic tool, wellness app, or substitute for professional care. The Spiritual Shield (V68.83 → V69.2) explicitly removes self-description language that would trigger Play Store health-app classification.

**Compliance gates that must NEVER be removed:**
- `frontend/src/components/WellnessDisclaimer.js` — legally required language saying "this is NOT medical/wellness/diagnostic"
- `frontend/src/components/MedicalDisclaimerSplash.js` — first-launch acceptance gate
- `backend/routes/coach.py` system prompt — Sage's medical-claim guard ("never a medical, diagnostic, or wellness product")
- `frontend/public/manifest.json` categories: `[entertainment, education, lifestyle, games]` — adding `health` triggers stricter Play Store review

---

## Architecture patterns (the rules)

### 1. **`pull()` dispatcher + Single-Plane-Pull** (Flatland)
- 60 engines registered in `MODULE_REGISTRY` (`frontend/src/state/ProcessorState.js`)
- Engines load INTO the matrix render slot via `pull('ENGINE_KEY')` — they do NOT navigate to new URLs
- No modals. No fixed-position overlays. No z-index wars (except `BackToHub` which sits at z:100000 to escape 3D pages — see V68.94)
- Inline flex everywhere

### 2. **ContextBus** (`frontend/src/state/ContextBus.js`)
The "brain" of the app. A pub/sub event bus with these channels:
- `worldMetadata` — active realm (biome, locale, frequency, ambient)
- `entityState` — current mood (primary, intensity, frequency stack)
- `narrativeContext` — current practice / intent
- `engineLifecycle` — active engine (auto-committed by `SentientEngineWrapper`)
- `sceneFrame` — 3D scene snapshot
- Plus `sovereign:pulse` events derived from commits via `ResonanceAnalyzer`

### 3. **Spiritual Shield** (compliance language layer)
Banned in user-facing copy: `cure`, `treat`, `diagnose`, `heal` (as a verb), `medicine`, `prescription`. Allowed: tradition names ("medicine wheel", "Hawaiian forgiveness"), Sage's shadow-work mode label.

### 4. **Sentience SLO**
- Endpoint: `GET /api/admin/sentience` (owner-only)
- Floor: 19% (regression triggers amber badge)
- Current: **100%** — 16 engines have direct page-level hooks, 40 ride `SentientEngineWrapper` lifecycle commits

---

## Hook layer

| Hook | Where to import | When to use |
|---|---|---|
| `useSentience(moduleId)` | `hooks/useSentience.js` | **Engine-level convenience.** Returns `{realm, mood, narrative, scene, history, commit, primer, moduleId}` with auto-tagged commits. Use this for new engines. |
| `useContextBus()` | `hooks/useContextBus.js` | **General-purpose bus access.** Returns the full bus snapshot + `commit/readKey/primer`. Use when you need keys outside the engine convenience set. |
| `useEngineRealm()` | `components/SentientEngineWrapper.jsx` | **Inside-the-wrapper context.** Any descendant of `<ActiveEngine />` can read realm/mood without re-importing the bus. Cheapest way to get realm awareness in deeply-nested children. |
| `useSentientRegistry(V2)` | `hooks/useSentientRegistry*.js` | **Different system entirely.** Gravity / Suanpan 9×9 hexagram lattice with behavioral memory. Don't confuse with sentience SLO. |

**Rule:** prefer `useSentience` for any new engine. Fall back to `useContextBus` if you need bus internals.

---

## V69.2 components (the new layer — do not duplicate)

| Component | Path | What it does |
|---|---|---|
| `<SentientEngineWrapper>` | `components/SentientEngineWrapper.jsx` | Wraps `<ActiveEngine />` in `MatrixRenderSlot`. Auto-commits engineLifecycle on mount/unmount. Provides `useEngineRealm()` context. |
| `<ArchitectBadge>` | `components/ArchitectBadge.jsx` | Owner-only HUD pill, reads `/api/admin/sentience/summary` every 60s. Hidden on 403/error. |
| `<SovereignVersionStamp>` | `components/SovereignVersionStamp.jsx` | Footer pill, reads `process.env.REACT_APP_VERSION` injected at build time from `package.json`. |
| `<DailyCrossTraditionPairing>` | `components/DailyCrossTraditionPairing.jsx` | Hub home widget, reads `/api/companions/daily`. Deterministic-by-UTC-date concept rotation. |
| `<CompanionChip>` | `components/CompanionChip.jsx` | Inline cross-tradition surfacing on Sacred Texts / Bible. |
| `<TranslateChip>` | `components/TranslateChip.jsx` | Inline phonetic translation on any text. |

---

## MODULE_REGISTRY (60 engines, V69.2 census)

Tap one of these via `pull('KEY')` and it loads into the matrix slot, wrapped automatically in `SentientEngineWrapper`.

### Generators (7)
`AVATAR_GEN`, `COSMIC_PORTRAIT`, `FORECASTS`, `DREAM_VIZ`, `STORY_GEN`, `SCENE_GEN`, `STARSEED`

### Divination (10)
`ORACLE`, `AKASHIC`, `STAR_CHART`, `NUMEROLOGY`, `MAYAN`, `CARDOLOGY`, `ANIMAL_TOTEMS`, `HEXAGRAM`, `COSMIC_INSIGHTS`, `SOUL_REPORTS`

### Practice (8)
`BREATHWORK`, `MEDITATION`, `YOGA`, `AFFIRMATIONS`, `MOOD_TRACKER`, `SOUNDSCAPES`, `FREQUENCIES`, `JOURNAL`

### Body / Earth (5)
`HERBOLOGY`, `CRYSTALS`, `ACUPRESSURE`, `AROMATHERAPY`, `REFLEXOLOGY`

### Sacred Study (10)
`BIBLE`, `BLESSINGS`, `DAILY_RITUAL`, `ELIXIRS`, `ENCYCLOPEDIA`, `COSMIC_CALENDAR`, `SACRED_TEXTS`, `MANTRAS`, `MUDRAS`, `RITUALS`, `TEACHINGS`

### Spaces / Worlds (8)
`ZEN_GARDEN`, `WORKSHOP`, `TRADE_CIRCLE`, `TRADE_PASSPORT`, `MUSIC_LOUNGE`, `TESSERACT`, `MULTIVERSE_MAP`, `MULTIVERSE_REALMS`

### Sovereign HUD / Lab (6)
`MASTER_VIEW`, `SMARTDOCK`, `SANCTUARY`, `SILENT_SANCTUARY`, `REFINEMENT_LAB`, `RECURSIVE_DIVE`

### Physics / Cosmology (5)
`QUANTUM_FIELD`, `QUANTUM_LOOM`, `HOURGLASS`, `SINGULARITY`, `PRODUCTION`

**Sentience status (per `/api/admin/sentience`):**
- 16 with direct page-level hooks: Avatar, Cosmic Portrait, Forecasts, Dream Viz, Starseed RPG, Oracle, Dreams, Breathwork, Mood Tracker, Herbology, Crystals, Acupressure, Mudras, Aromatherapy, Mantras, Multiverse Realms, Creation Stories
- 40 sentient via wrapper auto-commit only (lifecycle tracked but no realm/mood-aware behavior yet)
- 0 deaf engines

---

## Sacred Texts catalog (46 traditions)

Endpoint: `GET /api/sacred-texts` returns the full list grouped by tradition.

**Traditions:** Bible (66 books), Quran (114 surahs), Pali Canon (3 baskets + key suttas), Tao Te Ching, Bhagavad Gita, Upanishads, Mahabharata, Ramayana, Rigveda, Guru Granth Sahib, Heart Sutra, Diamond Sutra, Lankavatara Sutra, Avesta (Zoroastrian), Book of Mormon (LDS), Popol Vuh (Mayan), Egyptian Book of the Dead, Kumulipo (Hawaiian), Whakapapa (Maori), Aboriginal Songlines, Lakota Mitakuye Oyasin, Hopi Koyaanisqatsi, Inipi (sweat lodge), Norse Eddas, Ginnungagap creation, Talmud, Zohar, Sufi (Rumi), and others.

---

## Companion concept bridges (8 ordained cross-tradition concepts)

Endpoint: `GET /api/companions/concept/{concept}`. Maps a concept to texts across traditions that resonate with it.

| Concept | Element | Sample bridges |
|---|---|---|
| `creation` | water | Genesis 1, Kumulipo Pō, Atum from Nun, Ginnungagap, Popol Vuh |
| `stewardship` | earth | Genesis 2, Hopi Koyaanisqatsi, Lakota Mitakuye Oyasin, Aboriginal "Caring for Country" |
| `purification` | fire | Asha vs Druj (Avesta), Tapas, Inipi, Visuddhimagga |
| `emptiness` | ether | Heart Sutra, Diamond Sutra, Lankavatara, Tao Te Ching, Anattalakkhana |
| `sacred_sound` | air | Aum, Saman melodies, Mool Mantar, Logos John 1, Rumi reed flute |
| `maryam` | — | Luke 1, Quran 19, Bhagavad Gita 4 (divine entering human form) |
| `dharma` | — | Gita, Mahabharata, Samyutta Nikaya, Guru Granth Sahib |
| `lineage` | — | (genealogy bridges) |

Daily rotation: `GET /api/companions/daily` returns a deterministic-by-UTC-date concept with calendar overrides for Christmas (maryam), Wesak (emptiness), UN Day (dharma), Earth Day (stewardship).

---

## Multiverse Realms (6, with element mapping)

Endpoint: `GET /api/realms`. Each carries `element` field that drives the cross-tradition surface.

| Realm ID | Element | Frequency | Companion concept | Lucide icon |
|---|---|---|---|---|
| `astral_garden` | earth | 528 Hz | stewardship | TreeDeciduous |
| `crystal_caverns` | earth | (varies) | stewardship | TreeDeciduous |
| `celestial_ocean` | water | (varies) | creation | Waves |
| `solar_temple` | fire | (varies) | purification | Flame |
| `void_sanctum` | ether | (varies) | emptiness | Sparkles |
| `aurora_bridge` | air | (varies) | sacred_sound | Wind |

Realm entry calls `busCommit('worldMetadata', {biome, locale, frequency, ambient, ...}, {moduleId: 'MULTIVERSE_REALMS'})` → `CrystallineLattice3D` ripples → Sage opens with realm-specific framing.

---

## Backend route inventory (208 files)

All auto-mounted by `server.py:44-52` (pkgutil iterator). No manual registration.

**Major route groups:**
- **Auth / users:** `auth`, `users`, `coach` (Sage), `sages`, `sage_fx`, `coach`, `creator`
- **Content:** `sacred_texts`, `bible`, `companions`, `mantras`, `mudras`, `crystals`, `herbology`, `aromatherapy`, `acupressure`, `reflexology`, `affirmations`, `blessings`, `daily_ritual`, `creation_stories`, `teachings`, `rituals`, `elixirs`, `encyclopedia`
- **Divination:** `oracle`, `akashic`, `numerology`, `cardology`, `astrology_reading`, `mayan`, `animal_totems`, `hexagram`, `cosmic_insights`, `soul_reports`
- **Practice:** `breathwork`, `meditation`, `yoga`, `mood`, `frequencies`, `soundscapes`, `journal`
- **Worlds / 3D:** `realms`, `cosmic_map`, `tesseract`, `multiverse`, `dimensions`, `constellations`, `cosmic_calendar`, `cosmic_state`
- **Economy:** `economy`, `economy_admin`, `central_bank`, `cosmic_ledger`, `crystal`, `crystal_marketplace`, `crystal_mint_api`, `cosmetic_bundles`, `subscriptions`, `rpg`, `sparks`, `dust`, `gilded_path`
- **Translation:** `translation`, `translator`, `language_registry`, `culture_layers`
- **Discovery / RPG:** `starseed`, `discover`, `daily_briefing`, `daily_challenges`, `challenges`, `achievements`, `quests`
- **Generation:** `avatar_gallery`, `avatar_yoga`, `dream_viz`, `story_gen`, `scene_gen`, `cosmic_portrait`, `forecasts`, `ai_blend`, `ai_broker`, `ai_visuals`, `content`, `content_factory`
- **Admin:** `arsenal` (owner-only control room), `admin_sentience` (V69.0 SLO endpoint), `dashboard`, `cosmic_profile`, `cosmic_context`
- **Misc:** `aether`, `atmosphere`, `consciousness`, `archives`, `community`, `comms_gate`, `culture_layers`, `detection`, `botany`, `classes`, `academy`, `activity_loop`, `autonomous_treasury_api`, `collective_resonance`, `copilot`

---

## Test coverage

301 test files in `/app/backend/tests/`. The 5 most recent regression-locks (V68.94 → V69.2) are the architectural invariants:

| Test | What it locks |
|---|---|
| `test_iteration_v68_94_never_trapped.py` | BackToHub z-index ≥ 100000, 3D routes never leak into hub-exclusion list |
| `test_iteration_v68_95_sentient_portal.py` | Realm element → companion concept map, ContextBus commit on enter, distinct icons |
| `test_iteration_v68_97_sentient_cleanup.py` | Sentience ≥ 19%, Hourglass/Singularity/Production stay registered, MODULE_REGISTRY ≥ 60 |
| `test_iteration_v69_0_universal_sentience.py` | useSentience hook contract, /api/admin/sentience exists, real oil.element used (not dead hint maps) |
| `test_iteration_v69_2_universal_wrapper.py` | SentientEngineWrapper exists + commits lifecycle, ActiveEngine wrapped, audit counts wrapper-mounted, badge fetches real SLO |

**Run all V69.x regression locks:**
```bash
cd /app/backend && python -m pytest tests/test_iteration_v68_94* tests/test_iteration_v68_95* tests/test_iteration_v68_97* tests/test_iteration_v69_0* tests/test_iteration_v69_2* -q
# Expected: 45 passed
```

---

## Build pipeline

Per `/app/build_artifacts/BUILD_INFO.md`:

```bash
# 1. Bump version (already at 1.0.7 / versionCode 8 as of V69.2)
# 2. Build chain:
cd /app/frontend && yarn build && npx cap sync android
cd android && ./gradlew :app:bundleRelease --no-daemon
# Output: app/build/outputs/bundle/release/app-release.aab
```

Version source of truth: `frontend/package.json:version`. The `yarn build` script auto-injects this as `REACT_APP_VERSION` so the Hub footer always matches the released AAB.

---

## Onboarding checklist for a new agent / dev session

1. Read `memory/PRD.md` for the original problem statement
2. Read this file (`memory/DEVELOPER_REFERENCE.md`) for the current architecture
3. Read `PLAY_STORE_RUNBOOK.md` for the rebuild flow
4. Read `build_artifacts/BUILD_INFO.md` for keystore credentials and Play Console upload steps
5. Run `/api/admin/sentience` (with owner token) to see current SLO number — if it's below 19%, something regressed
6. Run the 5-test regression lock command above — must pass 45/45
7. Check `git log --oneline -20` for recent changes
8. Don't claim "Hidden N modules" without grepping `find /app -name "..."` first — narrative-creep is a recurring trap

**Things future agents commonly miss (so you don't):**
- `/app/build_artifacts/` exists with a signed AAB — the user has done Play Store prep already
- `/app/frontend/android/` is the Capacitor project (NOT `/app/android`)
- `/app/twa/` has the Bubblewrap setup
- `useContextBus()` exists alongside `useSentience()` — not duplicate, complementary
- `useSentientRegistry(V2)` is a 9×9 hexagram lattice, NOT related to the sentience SLO

---

## Hard rules (will get bug-bounty-grade complaints if violated)

1. **NEVER** describe this app as medical, wellness, or health.
2. **NEVER** remove `WellnessDisclaimer.js` content (it's the legal armor).
3. **NEVER** add `health` to manifest.json categories.
4. **NEVER** game the sentience SLO — if it returns 100%, that's because real wrapper coverage exists.
5. **NEVER** use position:fixed / modals / z-index overlays on engine UI (Flatland rule).
6. **NEVER** invent data hint maps without checking the API response shape (V69.0 lesson — `ELEMENT_OIL_HINT` matched zero real oil ids, deleted).
7. **ALWAYS** grep before claiming a file/route exists ("Aloha Living" was a ghost; "Rockhounder" was a ghost).
8. **ALWAYS** prefer editing existing files; only create new files when the pattern doesn't exist.
9. **ALWAYS** add `data-testid` to interactive elements + critical info (per system rules).

---

## Last 5 sessions' net additions

- V69.2 — SentientEngineWrapper, ArchitectBadge, SovereignVersionStamp, audit redefinition, version unification to 1.0.7
- V69.1 — Acupressure / Mudras / Crystals hook adopters
- V69.0 — useSentience hook, /api/admin/sentience SLO endpoint, Aromatherapy + Mantras adopters
- V68.97 — Sentience baseline (19.6%), Hourglass/Singularity/Production wired, Breathing + MoodTracker hooks
- V68.96 — Sage realm-awareness, spiritual-shield word-fix
- V68.95 — Sentient Portal (realm cards: element bridge, ContextBus ripple, distinct icons)
- V68.94 — Never-Trapped audit, Daily Cross-Tradition Pairing
- V68.93 — 46-tradition Sacred Texts catalog, Companion + Translate chips
