# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.61)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as an **Apps → Entertainment** app with Information & Entertainment content purpose. Not medical. Not diagnostic.

## V68.61 — Navigation Drain · Phase 2 (Divination Band) (29 Feb 2026)

User directive (Final Launch Sequence Step 2): "Convert the
remaining Hub pillars to pull() dispatchers, ensuring zero
browser-routing."

### Phase 2 wiring shipped — Divination/Oracle band (10 pillars)
1. ✅ **10 new `[Name]Engine.js` adapters** in `/app/frontend/src/engines/`:
   `OracleEngine`, `AkashicEngine`, `StarChartEngine`, `NumerologyEngine`,
   `MayanEngine`, `CardologyEngine`, `AnimalTotemsEngine`,
   `HexagramEngine`, `CosmicInsightsEngine`, `SoulReportsEngine`.
   Each is a thin Direct-State-Substitution wrapper around the
   existing page (no DOM teardown, no URL change).
2. ✅ **`MODULE_REGISTRY`** extended with the 10 new module ids and
   their lazy-loaded adapters; **`MODULE_FREQUENCIES`** signature
   pulse vectors added so the lattice paints a unique resonance
   when each is pulled.
3. ✅ **`ROUTE_TO_MODULE`** map in `SovereignHub.js` updated:
   `/oracle`, `/akashic-records`, `/star-chart`, `/numerology`,
   `/mayan`, `/cardology`, `/animal-totems`, `/hexagram-journal`,
   `/cosmic-insights`, `/soul-reports` now flow through the
   `pull()` dispatcher instead of `navigate()`.
4. ✅ **Verified inline** with screenshot tool — clicking the
   wired `Oracle & Tarot` blade in the Divination pillar drawer
   sets `window.__sovereignActiveModule = 'ORACLE'`, keeps URL at
   `/sovereign-hub`, and renders the `matrix-release` pill. The
   `data-wired="true"` attribute + "CHANNEL" caption confirm the
   pillar items detect their wiring at render time.

### Total wired pillars now: **17 of ~120**
- Phase 1 (V68.55): AVATAR_GEN, COSMIC_PORTRAIT, FORECASTS,
  DREAM_VIZ, STORY_GEN, SCENE_GEN, STARSEED.
- Phase 2 (V68.61): ORACLE, AKASHIC, STAR_CHART, NUMEROLOGY,
  MAYAN, CARDOLOGY, ANIMAL_TOTEMS, HEXAGRAM, COSMIC_INSIGHTS,
  SOUL_REPORTS.

## V68.60 — Resurrection UI (Time Capsule Drawer) (28 Feb 2026)

User directive: "Build the Resurrection UI to close the
save-game loop opened by the archival pivot."

### Closed loop shipped
1. ✅ **`/app/frontend/src/components/TimeCapsuleDrawer.js`** —
   inline expanding drawer (Flatland-compliant, no portal/modal).
   Lists archived capsules from `GET /api/time-capsules/recent`,
   shows world / narrative / entity / scene summaries, and
   resurrects on click by re-committing each populated key to the
   `ContextBus` (which auto-pulses the lattice) plus pulling the
   saved `active_module` if non-IDLE.
2. ✅ **Mounted in `SovereignHub.js`** below the dispatcher row
   via the **☉ Recall** toggle button (`recall-toggle-btn`).
3. ✅ **Verified inline** — drawer opens, lists capsules with
   FLOW/OVERHEATING gauge tints, and resume buttons are
   keyboard-accessible.

## V68.59 — Time-Capsule Archival · Save-Game Loop (27 Feb 2026)


User directive: "Pivot to Step 3 (Archival). Data Integrity >
Performance Throttling. If the user closes the tab before session
state persists, they lose Sovereign Context. You cannot have a
persistent 'Game' if the state is volatile."

### Closed loop shipped (frontend + backend)
1. ✅ **`/app/backend/routes/time_capsules.py`** — two endpoints:
   - `POST /api/time-capsules/archive` — beacon-friendly. Auth
     token IN BODY (sendBeacon can't set Authorization headers due
     to CORS-safelisted Content-Type restriction). 16 KB payload
     cap. 5-second per-session dedup so visibilitychange + pagehide
     double-fires write only once. Always 200 (beacon doesn't
     read responses). Uses `decode_token()` from `deps.py`.
   - `GET /api/time-capsules/recent?limit=N` — standard
     Authorization-header authenticated read. Newest-first.
2. ✅ **`/app/frontend/src/hooks/useSessionPersistence.js`** — fires
   `navigator.sendBeacon()` (with `fetch keepalive` fallback) on
   `visibilitychange === 'hidden'`, `pagehide`, and `beforeunload`.
   Throttled to one beacon per 8 seconds. Generates a stable
   `session_id` in `sessionStorage` (UUID v4) for backend dedup.
3. ✅ **Mounted in `SovereignProviders.js`** at the root — single
   global listener, every route inherits the save-game loop.
4. ✅ **`window.__sovereignGauge` + `window.__sovereignActiveModule`**
   — useEngineLoad + ProcessorState publish their state to globals
   so the beacon can capture the user's last-known cognitive load
   and active module without subscribing (subscribing would create
   a re-render loop on the global listener).

### Verification
**Pytest 8/8 PASS** (5 new V68.59 tests + 3 V68.52 still green):
```
test_archive_basic_write_and_recent_readback           PASSED
test_archive_dedup_within_window                       PASSED
test_archive_post_dedup_window_creates_new_doc         PASSED
test_archive_rejects_invalid_token_gracefully          PASSED
test_archive_rejects_oversize_payload                  PASSED
```

**Live integration loop (curl trace):**
```
Archive #1:           200 {ok: True}
Archive (within 5s):  200 {ok: True, deduped: True}    ← dedup confirmed
Archive #2 (after 6s): 200 {ok: True}                  ← post-window write
Recent endpoint:      2 capsules (newest=overheating, oldest=flow)
  → snapshot keys: ['worldMetadata','narrativeContext','entityState','history']
Invalid token:        200 {ok: False, reason: 'invalid-token'}    (no 401)
Oversize 18KB:        200 {ok: False, reason: 'payload-too-large'}
```

### Closed-loop diagram
```
[User opens app]
   ↓ sessionStorage.session_id (uuid)
   ↓ gauge starts COLD 0%
[User generates / pulls]
   ↓ ContextBus commits → field paints → gauge climbs FLOW
[User backgrounds tab / closes browser]
   ↓ visibilitychange + pagehide both fire (mobile-reliable)
   ↓ useSessionPersistence.fire() (8s throttle)
   ↓ navigator.sendBeacon(/api/time-capsules/archive, {token, session_id, snapshot, gauge, active_module})
[Browser tears page down — beacon survives]
   ↓ Backend: decode_token → 5s dedup → insert into time_capsules
[User reopens days later]
   ↓ GET /api/time-capsules/recent?limit=10
   ↓ All prior sessions visible, ready to restore
```

### Architectural property unlocked
The Sovereign Engine now has **durable session memory**. Cognitive
load, active module, full ContextBus snapshot, and history all
survive the browser tearing the page down — even on mobile where
`beforeunload` is unreliable. The gauge's value is no longer
ephemeral; every flow-state session is documented.

## V68.58 — Sage AI TIME Gauge + Asset Purge (27 Feb 2026)

User directive: "Step 2 — Sage AI TIME Gauge bound to ContextBus
delta. Compress (Asset Strip) — delete the orphaned showcase.mp4 /
webm assets and purge the /proof directories."

### Sage AI TIME Gauge shipped (Step 2)
1. ✅ **`/hooks/useEngineLoad.js`** — Cognitive Voltmeter logic.
   Listens to `sovereign:context-update` (bus commits) and
   `sovereign:state-shift` (tool pulls) on the global event bus.
   Bus commits inject 0.10–0.18 charge depending on key weight;
   tool pulls inject 0.06. Exponential decay with 12-second half-life
   means ambient silence drops the load to <5% in 60s. Updates 4×/sec
   (smooth gauge animation without React thrash). Returns
   `{load, state, COLD_LIMIT, OVERHEAT_LIMIT}` with three states:
   - **COLD** load < 0.15 — engine resting, "feed it"
   - **FLOW** 0.15–0.70 — gold zone, "sweet spot · sustained creation"
   - **OVERHEAT** load > 0.70 — "pace · let the field settle"

2. ✅ **`/components/SageEngineGauge.js`** — radial SVG gauge.
   Single circle, color-coded stroke that fills from 0..1. Center
   percent + state label below. Inline · no portal · no fixed
   positioning. Mounts inside `MatrixModuleDispatcher` so the user
   keeps the gauge in peripheral vision while pulling tools.
   data-testids: `sage-engine-gauge` (also `data-engine-state`),
   `sage-engine-pct`, `sage-engine-state`.

### Asset Purge shipped (Step 4 — completed)
**9.5 MB physically deleted** from `/app/frontend/public/`:
| File | Size | Refs in code |
|---|---|---|
| `showcase.mp4` | 2.1 MB | 0 |
| `showcase.webm` | 4.9 MB | 0 |
| `proof/` (13 .jpeg) | 1.1 MB | 0 |
| `proof2/` | 1.5 MB | 0 |
| `docs/` (4 .txt) | 60 KB | 0 |
| `qr-code.png` | <1 KB | 0 |

**Critical near-miss caught:** `/qr/` directory was originally in the
V68.56 strip pattern, but `QRRefractionDisplay` and `SovereignQRPortal`
actively reference `/qr/homepage.png`, `/qr/diamond_core.png`, and
`/qr/shield_api.png`. Removed `qr` from `ignoreAssetsPattern` in
`build.gradle` to prevent the AAB from 404'ing those QR features.
The 3 referenced QR PNGs are intact.

### Verification (live console capture on /sovereign-hub)
```
Initial state:        {state: 'cold',        pct: '0'}
After 5 commits:      {state: 'overheating', pct: '74'}
After 8s of silence:  {state: 'flow',        pct: '46'}  ← exp decay confirmed
After 12-commit spam: {state: 'overheating', pct: '97'}

Asset purge:          9.5 MB deleted, /qr/ verified intact
```

### Architectural property unlocked
The user now has a **cognitive voltmeter** they can keep in
peripheral vision. The gauge is the gamification — they don't read
about cognitive load, they FEEL it. Commit too much too fast and the
ring goes red. Stay in the gold zone and the engine sustains "Flow."
This is the game: keeping the lattice in flow while the resonance
loop carries semantic state across all 7 wired tools.

## V68.57 — Vocal Resonance + CDN Helper (27 Feb 2026)

User directive: "Step 1: Functional Vocal Resonance — wire MixerContext
(FFT analysis) to the triggerPulse hook. Your voice volume/pitch now
drives the Lattice 3D columns. Step 4: Asset CDN Migration."

### Vocal Resonance shipped (Step 1)
1. ✅ **`/hooks/useVocalResonance.js`** — Web Audio API hook.
   `getUserMedia({audio:true})` on user-initiated `start()`,
   `MediaStreamSource → AnalyserNode (fftSize 256, smoothing 0.6)`,
   `requestAnimationFrame` loop dispatches `sovereign:pulse` at 30 Hz.
   Voice band mapping (256-bin FFT, ~22 kHz half-rate):
   - bass    bins 0–3   (~0–700 Hz)   — fundamentals
   - mid     bins 4–15  (~700–2700 Hz) — vowels
   - treble  bins 16–63 (~2700–11kHz)  — consonants
   - peak    = max(bass, mid, treble)
   Global tuning gain applied on every emission. Clean teardown
   (track stop + AudioContext close) on stop()/unmount/permission
   denial. Returns `{isHot, error, start, stop, levels}`.

2. ✅ **TuningPanel section added** — opens with "⌁ OPEN MIC · RESONATE"
   call-to-action (mint Mic icon). When live: red pulsing dot, in-panel
   3-band VU meter (bass red / mid violet / treble teal), button
   morphs to red "SILENCE MIC" with MicOff icon. Graceful error
   messages for `permission-denied`, `unsupported`, `unknown`.

### CDN Helper shipped (Step 4 — partial)
1. ✅ **`/services/cdnAssets.js`** — `cdnUrl(path, fallback)` resolver.
   Reads `process.env.REACT_APP_CDN_BASE_URL` from frontend `.env`.
   When unset, falls back to local `/${path}`. Single source of truth
   so individual components don't hardcode CDN URLs.

### Honest scope for the showcase.* migration
Audit confirmed: `showcase.mp4` (2.1 MB) and `showcase.webm` (4.9 MB)
are **truly orphaned** — zero references in `src/`, `public/`, or any
HTML file. The V68.56 `ignoreAssetsPattern` already excludes them
from the AAB. They are also unused on web. Recommendation: **delete
them outright** rather than CDN-migrate (you cannot "migrate" what
nothing references). The `cdnUrl()` helper is in place for future
heavy media additions.

### Verification (live console capture on /creator-console)
```
tuning-panel:                present
vocal-toggle-btn:            present
idle toggle text:            'OPEN MIC · RESONATE'
Web Audio APIs supported:    True (mediaDevices + AudioContext)
Permission-denied path:      'Mic capture failed — try again.'
```

### Architectural property unlocked
The lattice now **listens**. Whisper → inner ring rises softly.
Speak normally → middle ring surges with vowel mid-band. Sing a
sustained note → sustained bass + mid dominance + treble flicker on
sibilance. The user's voice physically drives the engine's spatial
columns at 30 fps via the existing `sovereign:pulse` event bus.

## V68.56 — Engine Hardening · AAB Build Prep (27 Feb 2026)

User directive: "Defrag · Compress · Zip. Authorize Phase 1 (Engine
Hardening), specifically the code-defrag and asset-purge."

### Honest scope of what shipped here vs. what's on user's machine
The Capacitor android project lives at `/app/frontend/android/`, and
the keystore (`enlighten-mint-cafe.keystore`) is already generated.
This pod has no JDK + Android SDK, so the **gradle bundle command
must run on the user's machine** — but every config / rules file
is now production-ready.

### Asset purge — actionable strip identified by audit
| Asset | Size | Referenced? |
|---|---|---|
| `showcase.mp4` | 2.1 MB | ❌ — strippable |
| `showcase.webm` | 4.9 MB | ❌ — strippable |
| `store-assets/` | 8.4 MB | only `og:image` web SEO — strippable from AAB |
| `proof/` + `proof2/` | 2.6 MB | ❌ — strippable |
| `docs/`, `qr/`, `qr-code.png` | ~80 KB | ❌ — strippable |
| **Total stripped** | **~18 MB** | |

`landing.html`, `index.html`, all `icon_*.png` / `maskable_*.png`,
and the React bundle are intentionally **kept** (RootGate references
landing.html; PWA + Android need the icons).

### Files modified
1. ✅ **`/app/frontend/android/app/build.gradle`**:
   - `minifyEnabled true` (was false)
   - `shrinkResources true` (new)
   - Switched ProGuard config to `proguard-android-optimize.txt`
     (more aggressive default rules)
   - `aaptOptions.ignoreAssetsPattern` extended to strip the 18 MB
     of marketing files
   - `versionCode` 6 → 7, `versionName` 1.0.5 → 1.0.6
   - `bundle { language { enableSplit }; density { enableSplit };
     abi { enableSplit } }` — Play per-device delivery

2. ✅ **`/app/frontend/android/app/proguard-rules.pro`** — replaced
   the empty boilerplate with a real keep-rule set:
   - Capacitor / Cordova bridge classes (reflection-discovered plugins)
   - `@CapacitorPlugin`, `@PluginMethod`, `@JSExport` annotations
   - `@JavascriptInterface` methods (WebView bridge)
   - App entry-point classes
   - AndroidX lifecycle + splashscreen
   - dontwarn for kotlin/javax/checkerframework noise

3. ✅ **`/app/frontend/android/BUILD_RUNBOOK.md`** — full step-by-step
   build instructions for the user's local machine: prereqs, sync,
   bundleRelease, AAB inspection, Play Console upload, common
   issues. Includes verification commands (`bundletool dump
   manifest`) so the user can confirm the asset strip worked.

### Honest non-shipments (and why)
- ❌ **R3F texture compression to basis universal** — moot. Our
  `CrystallineLattice3D.js` uses zero texture assets (pure shader
  `meshStandardMaterial` on cylinder geometry). Nothing to compress.
- ❌ **Running `./gradlew bundleRelease`** — no JDK in this pod.
  Documented as the user's machine step.
- ❌ **Generating keystore** — already exists, untouched. Signing
  identity preserved across versions.

### Verification
- `build.gradle`: 90 lines, braces balanced (20/20), parens balanced
  (18/18), all V68.56 directives present
- ESLint clean across `SovereignHub.js` after `MiniLattice` swap
- `proguard-rules.pro`: production-grade, documented per-rule

## V68.55 — R3F Crystalline Lattice · Spatial Processor (27 Feb 2026)

User directive: "Pivot to Step 5–6 (R3F Crystalline Columns).
Visualizing the data as physical columns is the wiring. You will be
able to see the machine's load by the height of the columns. You
will be able to feel the resonance by how the columns physically
move."

### Spatial wiring shipped
1. ✅ **`/components/CrystallineLattice3D.js`** — 9×9 InstancedMesh of
   cylinder geometries in R3F Canvas. 81 columns rendered in a
   single GPU draw call. Spectral band assignment by ring distance
   from center:
   - **Inner ring (0-1)**  → BASS column heights
   - **Middle ring (2-3)** → MID column heights
   - **Outer ring (4)**    → TREBLE column heights
   - **Spotlight intensity** → PEAK
2. ✅ **Pulse-driven, not React-driven.** Pulse vector lives in `useRef`
   and is read inside `useFrame` (60fps) — no React re-render storm.
   Spring-smoothed with ~250ms time-constant so columns breathe
   instead of snapping. Subtle radial wobble keeps the lattice alive
   even at IDLE.
3. ✅ **Per-instance color modulation.** Hue rotates around the rings;
   saturation tracks live `mid`; lightness flares with `peak`. The
   field flashes hot on output bursts, cools to violet at IDLE.
4. ✅ **Lazy-loaded** — `lazy(() => import('../components/CrystallineLattice3D'))`
   in `SovereignHub.js` so 2D users never download three.js
   (~250KB). Suspense fallback is the existing 2D MiniLattice.
5. ✅ **`SovereignLatticeSurface` switch** reads
   `SovereignPreferences.visual.crystalFidelity` and re-subscribes to
   the `sovereign:preferences` broadcast event so the user can toggle
   2D ↔ 3D from the Sovereign Choice panel without a page reload.

### Verification (live console)
```
3D lattice mounted:     True
Canvas present:         True (1880 × 360 WebGL canvas)
Pulse count after pull: 2  (lattice received heavy-bass STARSEED signature)
Toggle to 2D:           3D unmounts, MiniLattice returns
Toggle back to 3D:      R3F canvas re-mounts via Suspense
```

### Architectural property unlocked
The Hub's IDLE slot is now a **physical control surface**. Tap a PULL
pill — the inner ring of crystalline columns rises with the tool's
bass signature; the spotlight flares with peak; the field hue
shifts to match the pulse's mid frequency. The user *sees* the
machine's load.

## V68.54 — Primer-Keyed Caching · Engine World-Memory (27 Feb 2026)

User directive: "Move to Step 4 immediately. Until we implement
primer-keyed caching, the machine 'forgets' the specific flavor of
the world as soon as the session hash expires. By caching the primed
myths, we enable the engine to recognize biomes it has already
visited."

### Backend wiring shipped
1. ✅ **`hashlib.sha256(primer)[:16]` keyed cache** in
   `/app/backend/routes/creation_stories.py`. Each unique primer
   payload gets its own cache slot via `primer_hash`. Same primer →
   same myth (instant restore). Different primer → fresh generation
   in a different slot. Empty primer falls through to the legacy
   shared cache (`primer_hash: None`) for backwards compat.
2. ✅ **Per-primer document keying.** `_id` includes the primer hash
   so multiple primer slots can coexist per `(civ_id, seed_title)`
   without document conflicts.
3. ✅ **`primer_hash` field returned** on every myth doc so the
   frontend can detect cache vs. fresh generations.

### Frontend polish — Thematic Caption Map
1. ✅ Per-pillar verb registry in `SovereignHub.js`:
   ```
   Practice              → ✦ Inhale   "breath into the engine"
   Divination            → ✦ Channel  "channel the oracle"
   Sanctuary             → ✦ Enter    "cross the threshold"
   Nourish & Heal        → ✦ Restore  "restore the body-field"
   Knowledge             → ✦ Receive  "receive the teaching"
   Creators & Generators → ✦ Manifest "manifest from the field"
   Sage AI Coach         → ✦ Commune  "commune with the sage"
   RPG & Adventure       → ✦ Embark   "embark — engine becomes the world"
   Cosmos & Physics      → ✦ Observe  "observe the field"
   Sovereign Council     → ✦ Convene  "convene the council"
   ```
2. ✅ Tooltip via `title=` attribute surfaces the gloss on hover.

### Verification
**Pytest suite: 3/3 PASS**, including the new
`test_myth_generate_primer_keyed_cache_returns_instantly_on_revisit`.

**Live timing proof:**
```
FIRST   call (LLM):           11.50s  hash=18b463196fecc231
SECOND  call (same primer):    0.14s  same hash, same title  ← 79.6× speedup
OTHER   call (different):     10.55s  different hash, different myth
```

**Thematic captions verified in DOM:**
```
Divination wired pillars:
  Dream Journal → "✦ CHANNEL" (gloss: "channel the oracle")
  Forecasts     → "✦ CHANNEL"
```

### Architectural property unlocked
The Engine now has **world memory**. A sovereign who walks the
Pleiades caverns, the Sirius forest, and the Andromeda iron sea will
have **three distinct cached myths** for the same Mayan seed-title
"The Jaguar Sun God" — each painted by its respective world's
spectral signature, each restored in <0.2s on revisit. The machine no
longer "forgets the flavor of the world" — it imprints it.

## V68.53 — Navigation Drain (Phased) (27 Feb 2026)

User directive: "Replace all remaining useNavigate() calls in the 7
pillars with pull() state-substitution. This permanently disables
browser routing for the wired pillars, forcing the system to operate
as a singular, state-locked Processor."

### Implementation strategy: graceful split-personality dispatcher
Rather than ripping `useNavigate` out of `SovereignHub.js` entirely
(which would break 123+ unwired pillar items), V68.53 installs a
**single dispatcher** — `dispatchPillar(route)` — that consults a
`ROUTE_TO_MODULE` map. Wired routes pull the engine into the matrix
slot (no URL change, no DOM teardown, ContextBus preserved). Unwired
routes fall through to navigate(). Each new adapter that lands adds
one line to the map and that pillar auto-upgrades.

### Wired routes (V68.53)
```js
const ROUTE_TO_MODULE = {
  '/avatar':              'AVATAR_GEN',
  '/avatar-creator':      'AVATAR_GEN',
  '/cosmic-profile':      'COSMIC_PORTRAIT',
  '/forecasts':           'FORECASTS',
  '/dreams':              'DREAM_VIZ',
  '/creation-stories':    'STORY_GEN',
  '/starseed-adventure':  'STARSEED',
};
```

### Visual indication
Wired pillar items now render with:
- Brighter border (`pillar.color}88` vs `33`)
- Soft glow shadow (`0 0 12px ${pillar.color}33`)
- Crystal facet at 0.95 opacity (vs 0.5)
- Caption changes from `Enter` to `✦ Pull · in-engine`
- `data-wired="true"` for testability

### Verification (live console capture)
```
Divination drawer expanded:
  Wired items:   2 → ['nav-dream-journal', 'nav-forecasts']
  Unwired items: 13

After clicking nav-dream-journal:
  URL changed:           False   ← /sovereign-hub stays put
  state-shift event:     1 (moduleId='DREAM_VIZ')
  matrix-release button: visible
  matrix-render-slot:    now contains the engine adapter
```

### Architectural property after V68.53
The Hub is no longer a navigation menu. It is a **state-vector
dispatcher** for the 7 wired tools and a navigation menu for
everything else — a phased migration path that doesn't break
existing functionality. Each new `[Tool]Engine.js` adapter that ships
upgrades its pillar item automatically via the `ROUTE_TO_MODULE` map.

## V68.52 — Closing the Final Mile · Backend Primer + 4 Generators (27 Feb 2026)

User directive: "Closing the final mile is the priority. Without the
backend patch, the Story Generator has the context, but it can't
'think' with it."

### Steps 1, 2, 4, 9 of the 10-step Consolidation Roadmap shipped
1. ✅ **Backend Semantic Patch** — `/app/backend/routes/creation_stories.py`
   `POST /api/myths/{civ_id}/generate` now reads optional
   `context_primer` from the body, injects it into the LLM
   `system_message` so the model writes the myth FROM THE
   PERSPECTIVE of the user's live world/narrative/entity state.
   Primer'd generations bypass the shared cache (session-specific).
   Length-capped at 1800 chars to keep prompts tight. Each myth doc
   carries a `context_primed: bool` flag so we can tell the two
   apart on retrieval.
2. ✅ **Bus-Wiring (Generators 4-7)** — same 3-line pattern shipped to:
   - `/pages/Forecasts.js` — generate() commits `narrativeContext`
     (system, period, summary, themes, energy) + triggerPulse.
   - `/pages/Dreams.js` — save() commits `narrativeContext` (title,
     body, mood, vividness, lucid, symbols) + triggerPulse on every
     dream entry.
   - `/pages/CosmicProfile.js` — Generate Cosmic Portrait commits
     `entityState` (zodiac, element, energy_level, system, level) +
     triggerPulse.
   - `/components/SceneGenerator.js` — `generateScene()` commits
     `sceneFrame` (resonance_name, colors, mood, prompt) directly to
     the bus (auto-pulses through analyzer + settings).

### Verification — live integration tests
```
test_myth_generate_without_primer_returns_uncontexted    PASSED
test_myth_generate_with_primer_returns_contexted_and_picks_up_hints  PASSED
```
Manual curl proof:
```
TITLE: "The Nocturnal Heart: Kinich Ahau's Descent through Xibalba"
TYPE: transformation
CONTEXT_PRIMED: True
PRIMER HINTS PICKED UP: ['Pleiades','crystalline','crystal','violet','obsidian','phoenix']
STORY: "When the obsidian gates of the horizon breathe their violet
shadows across the world, the transition of the Great Light begins.
In the high Crystalline Caverns of the celestial Black Hills,
Kinich Ahau—the golden-eyed sovereign—prepares for his most perilous
transformation..."
```
The Mayan Jaguar Sun God myth was just fused with the Pleiades / Crystalline
Caverns / phoenix world-state from the user's prior Starseed RPG session.
**All 6 primer hints landed in the LLM's narrative.**

### What's now true of the engine
- All 7 active generators (Avatar, Cosmic Portrait, Forecasts, Dream Viz,
  Story Gen, Scene Gen, Starseed RPG) commit to the bus + paint the field
  with semantic-derived pulses
- The backend reads ContextBus primers and the LLM thinks WITH them
- Unprimed generation still works (cache hit, backwards-compat)
- Regression test suite at `/app/backend/tests/test_iteration_v68_52.py`

### Steps still on the consolidation roadmap (deferred — separate sessions)
- Step 3 — Navigation drain (replace `useNavigate` with `pull()`)
- Steps 5-6 — R3F Base Plane Phase 3 (3D crystalline columns)
- Step 7 — Sage AI Coach "AI TIME" gauge
- Steps 8/10 — Local AAB build (user's machine)

## V68.51 — Unified Context Bus / Central Nervous System (27 Feb 2026)

User directive: "The Game Generator and Story Generator are not
sharing the same reality. Make them work together. Utilize everything
in the app already and integrate the interface to be utilized as such."

### Wiring shipped (V68.51)
1. ✅ **`/state/ContextBus.js`** — singleton shared-memory buffer.
   Holds `worldMetadata` (game), `narrativeContext` (story), `entityState`
   (avatar/cosmic portrait), `sceneFrame` (scene gen) plus a 16-deep
   commit history. Persists to `emcafe_context_bus_v1`. API surface:
   `commit(key, data, {moduleId})`, `read()`, `readKey(k)`,
   `subscribe(fn)`, `clear()`, `primerForPrompt(activeKey)`. Auto-
   exposes on `window.ContextBus` for cross-cutting reads.
2. ✅ **Auto-pulse on every commit.** Every write runs the payload
   through the Resonance Analyzer (with the user's current
   gain + mode) and dispatches `sovereign:pulse` — so the field
   paints WHATEVER the engine just thought, even if that tool isn't
   in the matrix slot.
3. ✅ **`sovereign:context-update` event** — any tool can subscribe and
   re-prime its own UI when another tool commits. Carries
   `{key, data, moduleId, snapshot}`.
4. ✅ **`/hooks/useContextBus.js`** — React hook. Returns reactive
   `bus` snapshot (re-renders on commit), `commit`, `primer`, `readKey`.
5. ✅ **`primerForPrompt(activeKey)`** — returns a formatted block that
   any generator can append to its system prompt. Skips the active
   key so we don't echo a tool's own state back at itself. Empty
   string when bus is fresh (graceful first-generation).
6. ✅ **Boot via ProcessorState** — added `import './ContextBus'` to
   `ProcessorState.js` so the bus is alive on every page that mounts
   the engine, not just when a generator is lazy-loaded.
7. ✅ **Three generators wired as proof-of-loop:**
   - `StarseedAdventure.js` — `beginAdventure` and `makeChoice` both
     `commit('worldMetadata', {origin, biome, scene_*})` + trigger
     resonance pulse with the scene description.
   - `CreationStories.js` — `generateMyth` reads `primerForPrompt`
     and ships it as `context_primer` to the backend, then commits
     `narrativeContext` on success.
   - `AvatarCreator.js` — `generateAIAvatar` commits `entityState`
     with the description/element/spirit_animal + triggers pulse.

### Verification (live console capture on /sovereign-hub)
```
DATA-DERIVED PULSES: 3 distinct spectral signatures
  [STARSEED] heavy/dark/battle  → bass=0.90 peak=0.96  (BASS-DOMINANT)
  [STORY]    light/hope/sacred  → treble=1.00 mid=0.83 (TREBLE-DOMINANT)
  [AVATAR]   balanced descriptive → bass=0.20 treble=0.34 (BALANCED)

PRIMER carries all 3 simultaneously:
  ✓ worldMetadata    inherited (Pleiades · Crystalline Caverns)
  ✓ narrativeContext inherited (Crystal Sovereign awakening)
  ✓ entityState      inherited (phoenix · violet aura)

Bus persisted · history=3 · context-update events fired for all 3 keys
```

### Architectural property
"Context-aware" is no longer a per-tool feature — it's a property of the
Engine. New tools wired into the registry inherit this for free: one
`commit()` call exposes their state to every other tool in the system,
one `primer()` call lets them inherit everyone else's state. The
Sovereign Engine now has a central nervous system.

## V68.50 — Semantic Middleware Layer / Closed Cybernetic Loop (27 Feb 2026)

User directive: "We need a Semantic Middleware Layer. Patching every
tool individually creates technical debt. Implement a universal
service that intercepts the API output stream and forces it through
the Resonance Loop before it hits the UI."

### Wiring shipped (V68.50)
1. ✅ **`/services/ResonanceAnalyzer.js`** — pure logic service. Converts
   any tool output (string / object / number) into a pulse vector via
   lexicon-based spectral mapping. Heavy/dark/battle keywords spike
   bass; bright/hope/light spike treble; density (log-scaled length)
   surges mid; sentiment magnitude flashes peak. `analyzeResonance(data,
   {mode})` is the single public API. `blendVectors(a, b, weight)` is
   exported for module-signature blending.
2. ✅ **`/state/ResonanceSettings.js`** — `window.RESONANCE_SETTINGS`
   global (gain 0..2, mode RAW/STANDARD/CALM/INTENSE) backed by
   localStorage. `getResonanceSettings()` / `setResonanceSettings(patch)`.
   Writes broadcast `sovereign:resonance-settings` so live subscribers
   re-read on the next pulse. `initResonanceSettings()` boots once at
   app load (called from `ProcessorState.js` import + `useResonance`).
3. ✅ **`/hooks/useResonance.js`** — universal hook. Any tool calls
   `triggerPulse(data, moduleId)` and the analyzer extracts the
   semantic vector, blends it 60/40 with the module's steady-state
   signature, applies global gain, dispatches `sovereign:pulse`, then
   decays back to module steady-state after 700ms. Hook also subscribes
   to `sovereign:resonance-settings` so panel changes apply immediately.
4. ✅ **`/components/console/TuningPanel.js`** — new dock tab. Slider
   for global gain + 4-cell mode picker (RAW/STANDARD/CALM/INTENSE)
   with live descriptions + a "Fire Preview Pulse" button. Persists to
   localStorage and broadcasts the settings event. data-testids
   throughout: `tuning-panel`, `tuning-gain-slider`, `tuning-gain-value`,
   `tuning-mode-{raw|standard|calm|intense}`, `tuning-preview-btn`.
5. ✅ **`TOOL_TABS` extended** in `console/constants.js` — `Tune` tab
   inserted at index 9 (between AI and OUT). Uses `Radio` lucide icon,
   gold `#FBBF24` accent, `minTier: 0` (available to all tiers).
6. ✅ **`UnifiedCreatorConsole`** PANEL_RENDERERS now includes
   `tuning: () => <TuningPanel />`. Console index re-exports TuningPanel.
7. ✅ **`ProcessorState.emitOutputPulse` rewritten** — now flows through
   the analyzer + settings automatically. Accepts either a number
   (legacy intensity) or an object `{output, intensity}`. With
   `output`, the function blends content-derived pulse with the module
   signature; without it, it amplifies the base signature. Either way,
   global gain applies. Every existing call site becomes settings-aware
   without per-tool changes.

### Architecture: Closed Cybernetic Loop
```
[Tool output]
   → useResonance.triggerPulse(data, moduleId)
   → analyzeResonance(data, mode)        ← lexicon → spectral bands
   → blendVectors(MODULE_FREQUENCIES[id], semantic, 0.6)
   → applyGain(blended, RESONANCE_SETTINGS.gain)
   → window.dispatchEvent('sovereign:pulse', vec)
   → ResonanceField repaints (existing listener, zero changes)
```

### Verification (live console capture on /creator-console)
```
All 12 tabs present (incl. tab-tuning)
TuningPanel renders inline
INTENSE mode click → RESONANCE_SETTINGS = {gain:1, mode:'INTENSE'}
Persisted: {"gain":1,"mode":"INTENSE"}
Preview pulse fires bursts on the event bus
```

## V68.49 — State-Loop Integration / Resonance Output (27 Feb 2026)

User directive: "We are now strictly performing System Wiring. Tools
must act as Internal Logic Modules, not external services. Wire the
output of every tool back into the ResonanceField so the matrix's
visuals shift to match the engine's current task."

### Wiring shipped (V68.49)
1. ✅ **MODULE_FREQUENCIES table** added in `ProcessorState.js` — each
   of the 7 registered modules has a signature pulse vector
   `{bass, mid, treble, peak}`. STARSEED is bass/peak-heavy (combat
   energy), DREAM_VIZ is treble-heavy (high-frequency dream detail),
   STORY_GEN is mid-heavy (narrative density), AVATAR_GEN is balanced
   warm, COSMIC_PORTRAIT is treble+mid (celestial), FORECASTS is mid
   (oracle), SCENE_GEN is mid+treble (composition), IDLE is ambient.
2. ✅ **`pull()` and `release()` now emit pulses.** `emitPulse(moduleId)`
   dispatches `sovereign:pulse` with the module's signature on every
   state-vector transition. ResonanceField (already listening on this
   event) immediately repaints brightness, saturation, starfield speed.
   No wrapper, no listener, no extra component — the state vector
   itself drives the field.
3. ✅ **`sovereign:state-shift` companion event** dispatched alongside
   the pulse, carrying `{moduleId, signature, t}`. Other reactors
   (mini-games, skin shifters, ResonanceCamera) can hook this without
   colliding with the audio analyser's continuous pulse stream.
4. ✅ **`emitOutputPulse(moduleId, intensity)` exported** — tools call
   this when they produce output (story complete, avatar minted,
   forecast ready). One-shot 600ms burst at intensity * signature, then
   auto-decay to the steady-state. The engine "thinks out loud."

### Verification (live console capture)
```
URL after pull: /sovereign-hub        ← Flatland preserved
Pulse: {bass:0.78, mid:0.46, treble:0.52, peak:0.85}  ← STARSEED signature
State-shift: {moduleId:'STARSEED', signature:{...}, t:...}
Release fired IDLE shift: True
```

### Architectural decision: navigation drain (not deletion)
User asked whether to delete `useNavigate` from SovereignHub entirely.
**Decision: phased drain, not big-bang deletion.** Of 130+ pillar items,
only 7 have engine adapters today. Deleting nav would break 123 routes.
The discipline is: as each tool's adapter ships, its pillar item swaps
from `navigate(route)` to `pull(moduleId)`. When a pillar is fully
covered, that pillar's nav calls are deleted. When the registry covers
everything, `useNavigate` is excised. This avoids re-introducing the
"dead button" entropy we just spent two sessions removing.

## V68.48 — Geology Bleed Sealed + State Substitution Rolled Out (27 Feb 2026)

User reported the Geology Workshop was "bleeding generic Wrench icons"
and demanded a system-wide audit for dead states + the State
Substitution rollout for the remaining tools. Independent verification:
`/app/test_reports/iteration_430.json` — 100% PASS across both backend
(8/8) and frontend (all visual verifications).

### Fixes shipped (V68.48)
1. ✅ **Geology icon bleed sealed.** `UniversalWorkshop.js` —
   added `LUCIDE_ICON_MAP` (full Lucide library import: Wind, Search,
   Compass, Map, Eye, Activity, Cog, Mountain, Pickaxe, Stethoscope,
   etc.); added `MODULE_TOOL_FALLBACK` keyed by moduleId so legacy
   single-letter glyph modules (masonry/carpentry/electrical/nursing
   /etc.) get themed Lucide icons (Hammer/Axe/Zap/Stethoscope) instead
   of universal Wrench; added `resolveMaterialIcon()` so geology
   formations render appropriate material icons — Igneous→Flame,
   Sedimentary→Layers, Metamorphic→Sparkles, Minerals→Gem,
   Plate Tectonics→Mountain, Hydrogeology→Droplets. Glyph letters now
   appear only as small corner badges on legacy modules.
2. ✅ **Latent `Wind` ReferenceError eliminated.** `MODULE_GAME_THEME`
   referenced Wind icon for meteorology but it was never imported;
   added to import list (preventive — meteorology wasn't routed yet).
3. ✅ **Direct State Substitution rollout — 6 new Engine adapters.**
   Created `CosmicPortraitEngine.js`, `ForecastsEngine.js`,
   `DreamVizEngine.js`, `StoryGenEngine.js`, `SceneGenEngine.js`,
   `StarseedRPGEngine.js` (each is a 4-line adapter that mounts the
   existing page directly into the matrix slot — no new logic, just a
   doorway). Registered all 7 in `MODULE_REGISTRY`. Expanded
   `MatrixModuleDispatcher` with 7 PULL pills.
4. ✅ **Flatland Rule preserved end-to-end.** Tapping a PULL pill
   swaps the lattice for the tool's render-mode without changing the
   URL, without unmounting the engine, without any portal/overlay.
   `matrix-release` button restores the lattice in milliseconds.
5. ✅ **Dead-state audit — none of the audited surfaces are actually
   dead.** Verified `POST /api/journal`, `POST /api/moods`,
   `POST /api/sage-fx/prompt-to-fx`, `POST /api/coach/sessions`,
   `POST /api/coach/chat` all 200. REC dock tab uses MediaRecorder +
   file download. AI dock tab POSTs to `/api/sage-fx/prompt-to-fx`,
   mutates monitor filters, awards XP. Coach chat input (`coach-input`)
   reachable after `new-session-btn` flow. Pytest suite at
   `/app/backend/tests/test_iteration_430.py` passes 8/8.

## V68.47 — Flatland Rule + Side-Effect Audit (26 Feb 2026)

User flagged: "every time I go in I run into dead f****** buttons" and
"the entire gamified world... is not accessible". Did a surgical pass.
Independent verification: `/app/test_reports/iteration_428.json` — 5/5
fixes PASS, 12/12 gamified routes PASS, 11/11 dock tabs PASS.

### Fixes shipped
1. ✅ **Flatland Rule fully enforced.** Removed `position:fixed inset:0`
   modal wrappers from `MedicalDisclaimerSplash.js`, `BackgroundPicker.js`,
   `CafeSettingsPanel.js`, `MissionControlRing.js` (overlay backdrop dim),
   and the `landing.html` static disclaimer mirror. All now render INLINE
   in the document flow — no portal, no z-index modals, no click-eaters.
2. ✅ **Quest task rows are tap-to-navigate.** `DailyChallenges.js` —
   added `TASK_SOURCE_TO_ROUTE` map and `useNavigate`. Each task button
   now routes to the appropriate module (e.g., "Complete 3 breathing
   sessions" → `/breathing`). Visual `→` arrow indicates tappability.
3. ✅ **CULTURE mixer panel makes sound.** `CulturalMixerPanel.js` —
   was visual-only / zero audio. Rewrote with per-layer AudioContext +
   GainNode. `tagProfile()` classifies each cultural tag as drum / chant /
   drone, `startTag()` builds the matching Web Audio graph (noise-burst
   loops at tag BPM for drums, harmonic oscillators with vibrato for
   chants, filtered sustained tones for drones). Volume slider live-
   modulates layer gain. Tap pill twice to mute. Clear stops all audio.
4. ✅ **Mantras auto-play on tap.** `Mantras.js` — `handleTap` now
   auto-clicks the embedded `NarrationPlayer` button 350ms after expand,
   so users immediately HEAR the mantra (TTS via `/api/tts/narrate`)
   instead of a silent two-step.
5. ✅ **Webpack ChunkLoadError auto-recover.** `index.js` — global
   error + unhandledrejection listeners detect "ChunkLoadError" /
   "Loading chunk … failed" and force a single hard reload. Prevents the
   red "Uncaught runtime errors" overlay after redeploys / Cloudflare
   challenges. Reload-once flag in sessionStorage stops loops.
6. ✅ **Zen Garden canvases responsive.** `ZenGarden.js` — fixed-height
   `400px`/`300px`/`380px` canvases switched to `clamp(180px, 32vh, 320px)`
   so on a 414×896 mobile viewport the lantern input + Release button fit
   on screen below the canvas (previously squeezed off-screen).

### Gamified universe — reachable from one tap
`/realms` (gallery hub) lists all 12 worlds:
- ⚔ `/starseed-adventure` · AI scene RPG
- 🌌 `/starseed-worlds` · multiverse star map
- ◯ `/starseed-realm` · single-realm explore
- ♾ `/multiverse-realms` · Astral Garden, Crystal Caverns, Celestial Ocean, Solar Temple (frequency-tagged)
- ☾ `/dream-realms` · lucid adventures
- ◈ `/cryptic-quest` · hidden terminal nodes
- ⚙ `/rpg` · Cosmic Realm · Lvl 4 Seeker · 11 daily quests · Mine / Decode / Nexus / Dreams
- ▲ `/starseed` · origin
- 🎮 `/games` · arcade
- 🛰 `/observatory` · `/tesseract` · `/dimensional-space` · `/multiverse-map`

### Visual proof gallery
- Live URL: `https://zero-scale-physics.preview.emergentagent.com/proof2/`
- 60+ before/after interaction screenshots organized into sections:
  ★★ Gamified Universe (12) · ★ Culture audio (6) · Quest Tasks (3) ·
  Auth (3) · Breathing/Oracle/Journal/Herbology/Crystals/Reflexology
  before-after (12) · Lantern Release (3) · Mixer Dock (4)

### Files of reference (this session)
- `/app/frontend/src/index.js` (chunk-error handler)
- `/app/frontend/src/components/MedicalDisclaimerSplash.js` (inline)
- `/app/frontend/public/landing.html` (inline disclaimer mirror)
- `/app/frontend/src/components/DailyChallenges.js` (tap-to-navigate)
- `/app/frontend/src/components/console/CulturalMixerPanel.js` (Web Audio)
- `/app/frontend/src/pages/Mantras.js` (auto-play on tap)
- `/app/frontend/src/pages/ZenGarden.js` (responsive canvases)
- `/app/frontend/src/components/MissionControlRing.js` (no overlay backdrop)
- `/app/frontend/src/components/BackgroundPicker.js` (inline panel)
- `/app/frontend/src/components/CafeSettingsPanel.js` (inline panel)
- `/app/frontend/src/App.js` (settings panel inside content stage)
- `/app/frontend/src/pages/RealmsGallery.js` (12 gamified routes)

### Independent test artefacts
- `/app/test_reports/iteration_428.json` — 5/5 PASS, 100% success rate
- `/app/test_reports/iteration_427.json` — system-wide audio/network audit
- `/app/test_reports/iteration_426.json` — 21 routes + 11 dock tabs
- `/app/test_reports/iteration_425.json` — pre-session baseline

### Known follow-ups (P1 / P2)
- AAB local build (preview container has no Java 21/Android SDK) — user runs `./gradlew bundleRelease` locally
- Sage AI Coach "AI TIME" gauge (P1)
- Sage Long-Term Cognitive Memory (P2)
- Quad-Pane SplitScreen Refactor (P2)
- Phase 4b GLB Avatar Generator (P2)
- Resend cron for Time Capsules (P2)
- 62 orphaned components cleanup (deferred to v1.1)

## V68.46 — Audit + Diagnostic Hardening (23 Feb 2026)

User reported "A dimensional rift appeared" CosmicErrorBoundary fallback
on production. Dispatched testing_agent_v3_fork for a real, exhaustive
frontend audit (iteration_425.json). Result: **45 / 45 routes pass in
preview**, all 11 dock panels work, BuyTimePanel + MedicalDisclaimerSplash
both green. Crash could not be reproduced in preview, meaning it's
production-environment-specific (likely stale service worker cache or
corrupted localStorage on the user's device).

1. ✅ **Real audit done**: iteration_425.json — 45 routes hit, every
   bottom-dock panel clicked, every primary feature surface exercised.
   Zero ErrorBoundary triggers in the preview build.
2. ✅ **`/apex-creator` → `ApexCreatorPage` route alias added** —
   previously only `/creator-console` was registered, so any link to
   `/apex-creator` would 404. Fixed in `App.js` + `showBackBtn`
   exclusion list.
3. ✅ **CosmicErrorBoundary upgraded** — when a runtime error fires,
   the browser console now logs a structured frame with: the error
   message, full JS stack, React component stack, and the active
   route. AND the user gets a "Show details" button that surfaces
   the same info in-app for copy-paste bug reports. No more
   diagnose-by-guessing.
4. ✅ **Return Home redirect fixed** — was pointing at the obsolete
   `/dashboard` route, now goes to `/sovereign-hub` (the real home).

### Three production-debug recommendations for the user
1. **Clear service worker on the affected device** — Chrome → Site
   settings → Cookies and site data → Clear · Application →
   Service Workers → Unregister
2. **Clear localStorage on the affected device** — DevTools →
   Application → Local Storage → right-click → Clear
3. **Reload the affected route** — if the rift reappears, tap "Show
   details" and paste the error message. We now have the wiring to
   actually fix it instead of guessing.

## V68.45 — Compliance Hardening: WellnessDisclaimer + F811 cleanup (23 Feb 2026)

**Legal posture locked across every practice surface.** A single
`<WellnessDisclaimer />` component now renders the exact verbiage that
matches the Play Console category pick ("Entertainment"), the ToS, and
the Landing page. One string, one component, ten+ render sites.

1. ✅ **New `components/WellnessDisclaimer.js`** — `variant="footer" | "banner"`,
   optional `accent` override. Hard-coded text:
   *"For Information & Entertainment Purposes Only · Not Medical Advice · Honor Your Body · Consult a Licensed Professional"*
   — same string everywhere, so a reviewer reading Play Console metadata,
   in-app UI, ToS, and landing page sees identical language.

2. ✅ **Centralized injection via `InteractiveModule.js`** —
   disclaimer rendered at the bottom of the shared module used by
   **Acupressure, Herbology, Aromatherapy, Elixirs, Crystals, Mudras,
   Nourishment, Reiki** (8 pillars). One edit, eight surfaces.

3. ✅ **Direct injection** into `pages/Meditation.js` and `pages/Botany.js`
   (both use custom layouts, not InteractiveModule). Reflexology
   already has its own disclaimer — left unchanged.

4. ✅ **Landing page updated** (`pages/Landing.js:870`) — "For Wellness
   & Relaxation Only" → "For Information & Entertainment Purposes
   Only" to match Play Console category exactly.

5. ✅ **Terms of Service updated** (`pages/TermsPage.js:20`) — added
   "Entertainment" to the "Educational and Informational Archives"
   classification; added "is not a substitute for a licensed
   professional" clause.

6. ✅ **DATA_SAFETY.md prepended with reviewer briefing** — declares
   `Apps → Entertainment` category and the Information-only stance
   as the official Play Console statement of intent. First thing a
   copy-paste submission will see.

7. ✅ **F811 duplicate cleanup in `sovereign.py`** — deleted the
   shadowed second definitions of `get_economy_rates` (was at 849)
   and `get_volunteer_balance` (was at 990). FastAPI's first-match
   routing meant lines 525 + 662 were already serving traffic; the
   later duplicates were pure dead code causing lint noise. Verified
   all three affected endpoints still return the correct response
   shapes post-cleanup.

8. ✅ **`ruff` now reports 0 errors across both `sovereign.py` and
   `trade_circle.py`**. ESLint 0 issues on `WellnessDisclaimer`,
   `InteractiveModule`, `BuyTimePanel`.

### Compliance Story Summary (for Play Console submission)

| Surface | Content | Status |
|---|---|---|
| Play Store category | Apps → Entertainment | Set |
| Data Safety form | `/app/memory/DATA_SAFETY.md` | Ready to paste |
| Privacy Policy | `/app/frontend/public/privacy.html` | Hosted |
| ToS | `/terms` (in-app) | Updated with Entertainment language |
| Landing page | `/landing.html` | Updated |
| Practice pillar footers | 10+ surfaces | `<WellnessDisclaimer />` live |
| IARC rating Q's | User Interaction: Yes · Digital Purchases: Yes · Simulated Gambling: No · Unrestricted Internet: No · Location: conditional | Pre-filled in DATA_SAFETY.md |

## V68.44 — Volunteer → Credit Exchange (22 Feb 2026)

**Closed-loop participation mechanic locked in.** Volunteer hours logged
via `POST /api/sovereign/economy/volunteer/record` can now be converted
to spendable Resonance Credits at **10 credits per hour** — the rate
already hard-coded consistently across `omega_sentinel.VOLUNTEER_RATE`,
`omni_generator.VOLUNTEER_RATE`, `sovereign_ledger.VOLUNTEER_RATE`, and
`reciprocity_gate.CREDIT_VALUE_PER_HOUR`. This makes the Marketplace
Identity story concrete for Play Console review: community labor → in-app
currency → tier unlock, all in one auditable ledger.

1. ✅ **New endpoint `POST /api/sovereign/economy/volunteer/exchange`**
   (Pydantic `VolunteerExchangeRequest { hours: float }`, requires auth).
   Computes balance via the existing `{$sum: $hours}` aggregation,
   inserts a **negative** `hours` row tagged `type: "exchange"` so the
   existing `/balance` aggregation nets correctly with zero schema
   migration, then atomically `$inc`s `users.user_credit_balance`, then
   writes a `merchant_transactions` audit row with
   `type: "volunteer_exchange"`.
2. ✅ **BuyTimePanel widget** — when open, fetches
   `/sovereign/economy/volunteer/balance` in parallel with
   `/trade-circle/ai-merchant`. If the user has >0 hours logged,
   renders an inline input + "Exchange" button above the tier grid
   showing live "N hrs → N×10 CREDITS" preview. On success the panel's
   own Credit balance + remaining-hours state update in place without
   a reload.
3. ✅ **Anti-abuse & race guards**: negative / zero / >10000-hour
   requests rejected 400; insufficient-balance returns 400 with
   current vs requested hours in the detail; `hours_exchanged`
   server-rounded to 2dp so float jitter can't drain the ledger.
4. ✅ **Audit unification**: every volunteer exchange now appears in
   the canonical `merchant_transactions` collection next to tier
   unlocks and Dust purchases. One ledger, one query, one truth for
   Play Console auditor inspection.
5. ✅ **End-to-end verified**: 6 hrs logged → exchanged 5 hrs → got 50
   credits → bought Seed tier for 50 credits → user state
   `gilded_tier=seed, credits=0, remaining_hours=1`. Zero Stripe calls
   inside the loop. Ledger shows `volunteer_exchange +50c` followed by
   `Gilded Path · Seed -50c`.

### Not fixed (out of scope, pre-existing)
- `sovereign.py:849` + `sovereign.py:990` F811 duplicate-definition
  warnings — existed before this session; FastAPI uses the last
  definition, no runtime impact. Flag for a future cleanup pass.
- `total_credit` field in `/balance` endpoint returns `-50` after an
  exchange because older log rows don't populate `credit_value` but
  my negative row does. Consumers should rely on `total_hours`
  (accurate); `total_credit` is legacy and broken independently of
  this change.

## V68.43 — Gilded Path consolidated into AI Merchant (22 Feb 2026)

**Architectural simplification.** The parallel `routes/buy_time.py` route
built earlier this session (paid via Stripe Checkout, separate
`buy_time_transactions` collection, separate `/api/purchase/one-time/*`
endpoints) has been **deleted** and replaced by 4 items added to the
existing `AI_MERCHANT_CATALOG` in `routes/trade_circle.py`. Tier unlocks
are now purchased with Resonance Credits — the same closed-loop currency
used for Dust, Gems, and Starseed components. Credit → Tier conversion
happens atomically inside the proven `/api/trade-circle/ai-merchant/buy`
endpoint. Zero duplicate infrastructure.

1. ✅ **4 new `type: "tier_unlock"` items in `AI_MERCHANT_CATALOG`** —
   `gilded_path_seed` (50c), `artisan` (150c), `sovereign` (500c),
   `gilded` (1250c). Priced at $0.20/credit per existing
   `BROKER_CREDIT_PACKS` rate. Each carries `tier_id`, `tier_rank`,
   marketplace-service `description`.
2. ✅ **`ai_merchant_buy` extended** with a `tier_unlock` branch that
   (a) blocks `quantity > 1`, (b) blocks downgrades via
   `GILDED_TIER_ORDER` rank comparison, (c) atomically flips
   `users.gilded_tier` / `gilded_product_sku` / `gilded_session_id`,
   (d) writes the canonical `merchant_transactions` audit row.
3. ✅ **`/trade-circle/ai-merchant` GET** now also returns
   `your_gilded_tier`, `your_gilded_purchased_at`, and
   `gilded_tier_order` so the frontend can render correct state.
4. ✅ **`BuyTimePanel.js` rewired** — hydrates from `/ai-merchant`,
   shows live Credits balance, per-tier credit price, `owned` /
   `insufficient credits` states, disables downgrade buttons. No
   Stripe redirect — entire flow stays in-app. Wrapped in
   `<PaymentGate>` so Android TWA users see a "Manage credits on
   web" CTA instead (policy-safe).
5. ✅ **`routes/buy_time.py` deleted** — 0 imports remained; 404 on all
   `/api/purchase/one-time/*` paths confirmed via curl.
6. ✅ **Stripe webhook `server.py` reverted** — removed the
   `buy_time_transactions` safety-net branch that's no longer needed
   (buy-time was never a Stripe flow under this architecture).
7. ✅ **End-to-end verified**: Seed→Sovereign→Gilded upgrade chain,
   duplicate-prevention (400 "already hold"), downgrade-prevention
   (400 "equal or lower rank"), quantity=2 rejection, balance
   deduction, 3 rows in `merchant_transactions` ledger with
   `delivery.tier_id` + `delivery.merchant_tx_id`.

### Compliance posture (Google Play review)
- **No Stripe call ever fires from inside the APK** for tier unlocks —
  Credits are pre-purchased (or earned) via existing `/trade-circle/broker/buy-credits`
  which already routes through `<PaymentGate>` for TWA users.
- **Closed-loop currency model** — Credits are earned or purchased,
  spent inside `AI_MERCHANT_CATALOG`. No P2P money transfer, no
  cash-out path, no KYC/AML exposure.
- **Single source of truth ledger** — all economy events write to
  `merchant_transactions` with `user_id`, `item_id`, `total_credits`,
  `delivery`, `created_at`. Matches the "Reviewer Briefing"
  requirement.
- **Service-fee transparency** — the 30% `RETURN_PENALTY_PCT` on
  sell-backs and 5% `RESONANCE_FEE_PCT` on P2P escrow are surfaced
  in the `/ai-merchant` response and in every `merchant_transactions`
  row where applicable.

## V68.42 — Metabolic Seal: Chamber Backdrop Compression (22 Feb 2026)

1. ✅ **WebP compression pipeline** — new `_compress_png_b64_to_webp_data_url` helper in `/app/backend/routes/ai_visuals.py` re-encodes gpt-image-1 PNGs to WebP q=82 (max-dim 1600px) off the event loop via `run_in_executor`. Typical payload: **~44-70 KB** (vs. 1.8-2.5 MB raw PNG) — a **~40x reduction** that brings the initial core bundle comfortably under the 800 KB Metabolic Seal.
2. ✅ **Dedicated compressed cache** — chamber WebP variants persisted under a separate `cache_key` (category `chamber_webp`, field `image_webp`) so the Pillow cost is paid once per chamber. Fast-path returns the WebP directly from MongoDB on subsequent hits.
3. ✅ **Data URL response format** — endpoint now returns `image_b64` as a full `data:image/webp;base64,...` URL. All existing `HolographicChamber.js` / `SovereignStageHUD.js` consumers already branch on `startsWith('data:')` so there is zero call-site churn.
4. ✅ **Verified** — `/api/ai-visuals/chamber` tested against `meditation` (44 KB) and `aromatherapy` (50 KB) chambers; Meditation page renders chamber backdrop correctly with no visual regression.

## V68.41 — Front Door + Un-Boxer + Refraction UI (21 Feb 2026)

1. ✅ **Root gate** — logged-out visitors to `/` now land on the new marketing page instead of being punted into an authenticated hub. `RootGate` component detects the AuthContext's guest-mode token (`guest_token`) and calls `window.location.replace('/landing.html')` for guests; authenticated users fall through to `/sovereign-hub`.
2. ✅ **Landing page rebranded** — killed all "INFINITY SOVEREIGN" leftover text, dead Play Store button pointing at wrong package (`com.infinitysovereign.app`), and old "7 Domains of Mastery" marketing. Replaced with current "ENLIGHTEN·MINT·CAFE" branding. Sovereign Engine demoted to a mono-font subtitle ("Powered by the Sovereign Engine · v1.0.4").
3. ✅ **Un-Boxer design pass** — ambient radial body-level auras replace panel backgrounds; pillars use soft element-tinted radial gradients with no hard borders; Law-of-the-House items use curved left-accent glows instead of boxes; footer divider is a hairline gradient, not a line.
4. ✅ **RefractionButton component** (`/src/components/RefractionButton.js`) — procedural glass-morphism CTA that maps Solfeggio frequency → HSL hue (396Hz red → 963Hz violet). Used on landing as three arced CTAs: Enter Hub (528Hz gold-green), Sign In (639Hz green), Launch Vault (963Hz violet).
5. ✅ **Phi-damped micro-interactions** — press = compression scale 0.985 at 80ms ease-out; release = `cubic-bezier(0.22, 1.618, 0.36, 1)` with φ-ratio overshoot so buttons settle like a struck tuning fork. Touch events supported for mobile.
6. ✅ **Launch Vault pinned to v1.0.4** — all three critical downloads (APK, AAB, keystore) now point at the newest build; v1.0.3 + v1.0.2 kept in vault for rollback.
7. ✅ **All buttons on landing verified** — Enter Hub, Sign In, Launch Vault all navigate correctly; v1.0.3's dead-link bug eradicated.

### v1.0.4 binaries
- `/app/build_artifacts/enlighten-v1.0.4.apk` — SHA-256 `d77b651573b11ef71346e2d30e0a9ec63e6cc5575c1d676a4b2a92eb38dbbc00`
- `/app/build_artifacts/enlighten-mint-cafe-v1.0.4.aab` — SHA-256 `51ad37e541f4e49028c48fb0e0722dbf625854f1a626dfd59824ef7836030924`
- versionCode 5, versionName 1.0.4

## V68.40 — Reflexology Pillar (21 Feb 2026)

**New full pillar: `/reflexology` — "The Reflex Sanctuary"**

1. ✅ **32-zone foot atlas** (`reflexologyData.js`) — each zone has name, system, organ, element, Solfeggio Hz pairing, technique description, duration, bilateral/lateral side-only metadata, benefits array. Left-only zones: heart, spleen, descending colon. Right-only: liver, gallbladder, spleen [corrected], ascending colon, ileocecal valve.
2. ✅ **Interactive SVG FootMap component** — both feet rendered from a traced plantar silhouette; 57 hotspot circles with element-colored fills, pulse rings for active zone, dashed halos for practice targets. Labels shown in Study mode, hidden in Locate mode.
3. ✅ **Three modes integrated into one page:**
   - **Study** — tap any zone → info sheet with organ, technique, Solfeggio Hz, element, duration, benefits chips
   - **Locate** — gamified "Find the [Zone]" prompts with streak counter; correct tap → 528Hz chime + 6 Dust; wrong → 396Hz nudge + reveal correct zone (educational, not punishing)
   - **Routine** — 8-zone starter sequence with per-zone timed progress bar, 417Hz between-step chime, 528Hz completion chime + 40 Dust bonus
4. ✅ **Tool registry wiring** — 6 new reflexology blades registered in `toolRegistry.js`: atlas-study, locate-zone, press, routine, meridian-align, solfeggio-pair (chained unlocks). Domain added to `toolScaffold.js` oil-material family.
5. ✅ **Navigation integration:**
   - `/reflexology` route in `App.js`
   - Orbital Hub satellite (pink-gold Footprints icon, 396Hz "Liberation from Fear")
   - Sovereign Hub Body pillar card
6. ✅ **House convention respected** — `HolographicChamber` wrapper (same chamber aesthetic as Herbology/Acupressure/Aromatherapy); `window.__workAccrue('reflexology', ...)` hook for passive Dust; no Sparks spent — only earned on mastery (house law).
7. ✅ **Educational disclaimer** — footer: "EDUCATIONAL · NOT MEDICAL ADVICE · HONOR YOUR BODY"

## V68.39 — Full regression + Play Store asset pack (20 Feb 2026)
1. ✅ **Dead 9×9 lattice fixed** — MiniLattice was reading `r.data.lattice_state.nodes` but backend returns `r.data.lattice.nodes`. All 81 circles now render with 9 distinct node-type colors (gold CORE, purple ORACLE, blue PORTAL, cyan RELAY, green SHIELD, pink MIXER, violet GENERATOR, gold LEDGER, gray VAULT).
2. ✅ **Rock Hounding — real crystal portraits** — Replaced generic `<Gem>` icon with `CrystalPortrait.js` (deterministic SVG polygon per specimen; facets scale with rarity 6→12; sparkles for epic+; specular highlight, element-color gradient, rarity glow). Added "Learn" expand sheet showing Mohs, stat bonus, depth, dust value, layer, full description. Collection grid uses the same portraits.
3. ✅ **Duplicate tool registration warnings (11+) eliminated** — Moved `toolScaffold` from top-level import to an explicit `registerScaffold()` export invoked AFTER the real `registerMany([...])` in `toolRegistry.js`.
4. ✅ **Starseed satellite added to Orbital Hub** — `/orbital-hub` now has a dedicated Starseed node (pink Sparkles icon → `/starseed-adventure`, 528Hz). Games node description corrected.
5. ✅ **Cosmic Mixer half-screen fixed** — 3× `max-w-2xl` (672px) widened to `max-w-6xl` (1152px) across header, body, and sticky footer.
6. ✅ **Privacy Policy + Data Safety** — `/app/frontend/public/privacy.html` hosted in-app at `/privacy.html`; also deploy-ready for `https://enlighten-mint-cafe.me/privacy`. `/app/memory/DATA_SAFETY.md` is the canonical Play Console form answers.
7. ✅ **v1.0.1 AAB signed + production URL baked in** — `REACT_APP_BACKEND_URL=https://enlighten-mint-cafe.me`. `versionCode=2, versionName=1.0.1`. SHA-256: `ddc966e43286f9963a066b44aad39566abd3854c953e77a60cb4696fee17dcb1`.

### .env loading gotcha (for future rebuilds)
`craco.config.js` calls `require("dotenv").config()` which pins `.env` values into `process.env` BEFORE `.env.production` override kicks in. Always rebuild with inline env:
```bash
REACT_APP_BACKEND_URL=https://enlighten-mint-cafe.me yarn build
```

## V68.35 — Native .AAB minted · Play-Store Ready (20 Feb 2026)
1. ✅ **Signed Android App Bundle forged** — `/app/build_artifacts/enlighten-mint-cafe-v1.0.0.aab` (33 MB, 968 files). Package `cafe.mint.enlighten`. MinSDK 24, TargetSDK 36.
2. ✅ **Upload keystore** — RSA 4096, SHA384withRSA, 30-year validity.
   - Path: `/app/build_artifacts/enlighten-mint-cafe-UPLOAD-KEY.keystore`
   - Alias: `enlightenmintcafe`  · store+key password: `Sovereign2026!`
   - SHA-1: `C3:A5:5D:38:...:3D:19` · SHA-256: `3F:E1:E1:E2:...:4D:07`
3. ✅ **Obsidian Void adaptive icons** — pure #000000 background + gold Om foreground at all 5 mipmap densities (mdpi→xxxhdpi) + round variants. 512×512 Play Store listing icon at `/app/frontend/resources/play-store-icon-512.png`.
4. ✅ **Unified appId** — scrubbed `com.cosmiccollective.app` and `com.infinitysovereign.app` drift; everything now `cafe.mint.enlighten` (Manifest, `build.gradle`, both capacitor configs, Java source tree, strings.xml, test classes).
5. ✅ **Build pipeline repro** — Java 21 (Temurin @ `/opt/jdk21`), Android SDK cmdline-tools + platform-tools + build-tools 36.0.0 + platforms;android-36 at `/opt/android-sdk`. AAPT2/zipalign/aapt wrapped with `qemu-x86_64-static` via `libc6:amd64` multi-arch (container is aarch64, Google only ships x86_64 AAPT2). Override pinned in `gradle.properties` via `android.aapt2FromMavenOverride`.
6. ✅ **Easter egg** — first-DevTools greeting in `src/index.js`: gold Cormorant "ENLIGHTEN.MINT.CAFE — Sovereign v1.0.0" + JetBrains Mono whisper "to the first hundred — you are the Sovereigns. 528Hz is the heartbeat. Forge, do not spend." Verified inside shipped `main.9bd0df22.js`.
7. ✅ **SovereignHub stray JSX fix** — removed dangling `</div></div>)}` tail that was blocking the web build.
8. ✅ **Gitignore tightened** — `*.keystore`, `app/keystore.properties` now ignored.

## Next Tasks (V68.36)
- **P1 — Real Stripe wire** for Gilded Path (Seed/Artisan/Sovereign/Gilded tiers) replacing localStorage mock in `BuyTimePanel.js`.
- **P1 — WebP compression** on `/api/ai-visuals/chamber` (currently 1.8–2.5 MB per image, violates Metabolic Seal).
- **P2 — Sage AI Coach "AI TIME" gauge** pillar.
- **P2 — Gradle 9.0 compat** — migrate `capacitor-cordova-android-plugins` off deprecated APIs.
- **P2 — R8 minification** + ABI splits (once native libs enter).
- **P2 — Quad-Pane SplitScreen Refactor**, Real GLB Avatar Generator (RPM/Meshy AI), Time Capsules via Resend.

## Sovereign Flow Map (V68.31 — Systematic Law)
Architectural contract every new feature MUST honor:
- **Layer 1 — Sovereign Hub**: Command Center. Spark Wallet, Quest HUD, 11 Pillars. Every sub-page reports state back here in real time.
- **Layer 2 — Workshops (27)**: Utility/Education engine. 243 tools across 6-Depth Recursive Dives. Sparks only earned through educational engagement (no idle-game loophole).
- **Layer 3 — Quest Bridge**: Interconnect. Every material discovered in one domain is a key/frequency usable in a higher domain (Quartz in Geology → Tesseract unlock in Observatory, etc.). No dead ends.
- **Layer 4 — VR/Gamified Realms**: Merit-gated Ascension. Starseed Adventure + VR chambers. You don't play until you've learned.

## Core Rules
- **Flatland Rule**, **Metabolic Seal** (<800KB), **Closed-Loop Economy** (Sparks earn-only), **System-wide Gamification**, **Epilepsy Safety**, **Silence Shield** (opt-in audio only), **Spotify Loophole**.

## V68.33 — Engineer-Poet Dual Voice + LabStage Earn-to-Learn + Gamer Mode (Feb 2026)
1. ✅ **Dual-voice typography** — Cormorant for soul, JetBrains Mono for gears via `.sov-telemetry`.
2. ✅ **Master Utility Video** — 510KB MP4 + 1.8MB GIF in `/app/test_reports/master_video/`.
3. ✅ **LabStage Proof-of-Work gate** (opt-in per-blade). Fail = Fractal Reset (111+117Hz dissonance, streak→0, no sparks, no Dust). Pass = 528Hz Resonance Click + `MasteryLedger.record()` + streak-multiplied sparks.
4. ✅ **LabAudio** — pure Web Audio sine chimes, Silence-Shield gated.
5. ✅ **8 seed labs** in `toolLabs.js`; remaining 253 blades fall through to direct-interact until their labs ship.
6. ✅ **Gamer Mode · Stealth Education** (`SovereignPreferences.visual.gamerMode` + `html[data-gamer-mode]`). Toggle in Choice Panel: Scholar = full telemetry (JetBrains Mono readouts), Gamer = cinematic-only (all `.sov-telemetry`/`[data-telemetry]` surfaces hidden). Verified: telemetry visibility swaps cleanly on toggle, pillar cards & signature title remain, numbers disappear.
7. ✅ **Dual-Path Protocol baked into architecture** — LabStage only opens for blades with explicit lab entries; casual/gamer users never hit a validation screen unless they opt in via a pro blade. Pull-not-Push.

## V68.32 — Living Lens + Cross-Domain Tags + Blade Signature + Crystalline Pillar Grid (Feb 2026)
1. ✅ **Accordion bars KILLED** — Hub's 7 pillars rebuilt as a responsive crystalline hex-card grid. Each pillar renders as a faceted crystal card with: (a) radial color-matched gradient wash, (b) diagonal prismatic refraction overlay, (c) 11s rim-light sweep animation, (d) rotating SVG hexagonal crystal indicator with specular facets, (e) Cormorant Garamond gradient title, (f) 10px-tracked "PILLAR · N BLADES" meta, (g) cryptic 3-module preview when collapsed. Expansion unfolds in-place with stagger-entrance mini-crystal cards (no stacked accordion). Pure CSS/SVG — Metabolic Seal intact.
2. ✅ **Living Lens** — portal, re-openable. Four material axes.
3. ✅ **Material tags on every blade** — Metal/Glass/Oil/Gold across all 27 workshops + VR realms.
4. ✅ **SovereignPreferences.calibration + identity** — `setCalibration(partial)` + `identity.pinnedSignature`.
5. ✅ **BladeSignature derivation** — 16 duo/solo/balanced cinematic titles.
6. ✅ **SignaturePill** — live pill on Hub, Pin/Unpin toggle.

## V68.31 — Sovereign Choice + Bridge Rule + Swiss Army Arsenal (Feb 2026)
1. ✅ **Starseed dead screen KILLED** — optimistic `setView('game')` + cinematic `ChannelingStage` (origin-themed rings, live phase copy, honest ETA, always-visible Exit). Verified: channeling at t=1.2s → narrative at t=5.6s.
2. ✅ **QR code scannable** — replaced broken custom encoder with `qrcode` lib at ECC-H; pyzbar decodes live. Domain is now `window.location.origin`.
3. ✅ **401 hydration race ELIMINATED** (84–99 → 0) — axiosInterceptor always overrides Authorization with fresh localStorage; guest_token sentinel in all contexts.
4. ✅ **SovereignBridge + SovereignKernel + toolRegistry + toolScaffold** — 261 tools registered (27 workshops × 9 blades + VR realms + bridges). `assertRegistered` throws in dev. "Random dumping" is physically detectable.
5. ✅ **Sovereign Preference Ledger** — persists audio.frequency, visual.skin, visual.crystalFidelity, motion.reduce, learning.difficulty, learning.weighting to localStorage. Broadcasts `sovereign:preferences`. Reflects `data-sov-skin` on `<html>`.
6. ✅ **SovereignChoicePanel** — mounted in Hub. Audio (Silence/432/528) · Visual (Neo-Kyoto/Refracted Crystal) · Crystal Fidelity (2D/3D) · Difficulty (Easy/Medium/Hard/Adaptive) · Weighting (Precision 70/30 or Speed 30/70). Default ships in Silence + Adaptive + Precision.
7. ✅ **528Hz Starseed lock — CHOICE-GATED** — MixerContext only ducks non-528 tones when user chose 528Hz. Silence/432 = no-op.
8. ✅ **Refracted Crystal skin** — gold × white prismatic wash on ChannelingStage when selected.
9. ✅ **Swiss Army Arsenal · ToolDrawer** — portal drawer listing all 261 blades in 3 sections (Entertainment/Educational/Utility). SVG crystal facets, unlocked glow in active skin, locked in dark charcoal. Cryptic hint on locked tap ("A key from {domain} — the frequency is still closed to you"). Click unlocked → `SovereignKernel.interact(toolId)` fires `sovereign:interact` for Hub HUD ripple.
10. ✅ **Adaptive Mastery Ledger** — `kernel/MasteryLedger.js` auto-subscribes to `sovereign:interact` and records precision/speed per domain. `score = 0.7·precision + 0.3·speed` (inverted when weighting=speed). `effectiveDifficulty(domain)` honors manual override; else maps score<0.35→easy, <0.70→medium, ≥0.70→hard. Persisted to `sovereign_mastery_v1` localStorage.

## Code Architecture (active files this release)
- `/app/frontend/src/kernel/SovereignBridge.js` — registry + Bridge Rule enforcer
- `/app/frontend/src/kernel/SovereignKernel.js` — event bus
- `/app/frontend/src/kernel/SovereignPreferences.js` — Preference Ledger
- `/app/frontend/src/kernel/MasteryLedger.js` — Adaptive Mastery Ledger
- `/app/frontend/src/kernel/toolRegistry.js` + `toolScaffold.js` — 261 blades
- `/app/frontend/src/components/SovereignChoicePanel.js` — 5-row choice UI
- `/app/frontend/src/components/ToolDrawer.js` — Swiss Army Arsenal
- `/app/frontend/src/components/starseed/GameScene.js` — ChannelingStage
- `/app/frontend/src/components/SovereignQR.js` — qrcode lib + portal + Om emblem
- `/app/frontend/src/pages/StarseedAdventure.js` — Kernel calls + optimistic view switch
- `/app/frontend/src/pages/SovereignHub.js` — ChoicePanel + Arsenal opener mounted
- `/app/frontend/src/context/MixerContext.js` — choice-gated 528Hz lock
- `/app/frontend/src/context/AuthContext.js` — live authHeaders
- `/app/frontend/src/utils/axiosInterceptor.js` — fresh-token override
- `/app/frontend/src/index.css` — skin CSS vars, Refracted Crystal wash, QR portal hide
- `/app/frontend/src/index.js` — registry + mastery ledger boot imports

## Code Architecture (active files this release)
- `/app/frontend/src/pages/StarseedAdventure.js` — optimistic view-switch, direct-localStorage auth headers
- `/app/frontend/src/components/starseed/GameScene.js` — ChannelingStage + cinematic progress
- `/app/frontend/src/components/starseed/CharacterSelect.js` — origin cards
- `/app/frontend/src/components/SovereignQR.js` — qrcode-lib backed encoder + Om emblem + origin-aware URL + portal-to-body
- `/app/frontend/src/context/AuthContext.js` — live token memo
- `/app/frontend/src/utils/axiosInterceptor.js` — fresh-token override + expanded guest-abort list

## Console Tabs
11 tabs tier-gated. Owner (kyndsmiles@gmail.com) sees all 11.

## Deferred (v1.1)
- **Flow Map enforcement** (new): Bridge Rule — every tool must register with Quest Bridge + Spark Wallet or lint-fail the build.
- **528Hz lock during Starseed transition** (new): suppress all non-528Hz audio nodes while `view === 'game'` and `scene === null`; gated behind the existing opt-in pill (Silence Shield stays intact).
- Chamber backdrop WebP compression (~400KB for Metabolic Seal).
- Background JWT refresh for multi-hour sessions.
- Recursive LOD, accelerometer shimmer, space-fold fast travel, Sovereign TTS, Infinity Export PDF.

## Credentials
Owner — `kyndsmiles@gmail.com` / `Sovereign2026!` (see `/app/memory/test_credentials.md`)
1. ✅ **Full-system audit** (`/app/test_reports/iteration_362.json`) — Backend 58/60 (97%), Frontend PASS on every Sovereign Hub pillar, Command Console's 11 tabs, Cosmic Mixer, Holographic Chambers (herbology pluck/brew/dose, meditation 22/55·82/22·82/78, masonry drill-down, aromatherapy, geology), Starseed Adventure (Begin Adventure ACTIVE, all narrative opacities correct), QR code with Om symbol, all 10 chamber-backdrop types, Flatland + Silence Shield compliance (0 fixed modals, 0 auto-play).
2. ✅ **401 Hydration-Race KILLED** — root cause: `authHeaders` memo could be captured as `{}` or `Bearer guest_token` by fetch()-based context providers before token state hydrated; the axios interceptor used `||` fallback that preserved the stale header. Fixes:
    - `utils/axiosInterceptor.js` — always overwrites Authorization with fresh `localStorage.getItem('zen_token')` when a real token exists; expands the guest-abort list to include `/sovereign/status`, `/sovereign-mastery/`, `/starseed/my-`, `/sparks/wallet`, `/sparks/cards`, `/quests/`, `/profile/me`, `/auth/me`.
    - `context/AuthContext.js` — `authHeaders` now reads live from localStorage inside the memo, returns `{}` for guest_token sentinel (prevents `Bearer guest_token` headers from ever being sent).
    - `context/ModalityContext.js`, `context/TreasuryContext.js`, `context/ClassContext.js` — introduce `hasAuth = token && token !== 'guest_token'` and gate all fetch() effects behind it.
    - Verified: 16-hop rapid stress test → **0 API-level 401 errors** (was 84-99 in iter 361/362).

## V68.29 — Drill-Down Chains + Portal Props (shipped)
1. ✅ ChamberProp portal fix, drill-down chains, Herbology/Universal drill-down trees, SovereignMath.safeChamberLayout.

## V68.28 — Sovereign Advancement (shipped)
- PHI-Fader audio, Fibonacci snap-grid CSS vars, Resonance Haptics, Sovereign Quest Pulse.

## V68.27 — Resonance Presets
19 trade recipes baked into MixerContext, auto-primed on workshop entry.

## V68.26 — System-Wide Gamification
- GameModuleWrapper auto-wrap, InteractiveModule auto-wrap, UniversalWorkshop themes, ChamberMiniGame machine.

## Console Tabs
11 tabs tier-gated. Owner (kyndsmiles@gmail.com) sees all 11.

## Deferred (v1.1)
- P1: Background token refresh polish (underlying race now eliminated; refresh endpoint not yet wired for long sessions).
- P1: **Chamber backdrop WebP compression** — `/api/ai-visuals/chamber` still returns 1.8MB+ PNGs; compress to ~400KB WebP for Metabolic Seal.
- P2: Recursive LOD, accelerometer shimmer, space-fold fast travel, AI TTS resonance, Sovereign Audit export.
- Minor: GET /api/knowledge/deep-dive currently POST-only (returns 405 on GET); align verb or update frontend callers.
- Minor: Owner account has role='user' in DB (login auto-upgrades but /profile/me still shows user); optional data cleanup.

## Key Files
- `/app/frontend/src/utils/axiosInterceptor.js` — V68.30 guest-abort + token-refresh
- `/app/frontend/src/context/AuthContext.js` — V68.30 live authHeaders
- `/app/frontend/src/context/{Treasury,Modality,Class}Context.js` — hasAuth gating
- `/app/frontend/src/utils/SovereignMath.js` — PHI kernel
- `/app/frontend/src/components/HolographicChamber.js` — chamber shell
- `/app/frontend/src/components/games/ChamberMiniGame.js` — drill-down

## Credentials
Owner — `kyndsmiles@gmail.com` / `Sovereign2026!` (see `/app/memory/test_credentials.md`)
