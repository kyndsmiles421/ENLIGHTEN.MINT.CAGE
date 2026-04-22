# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.42)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

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
