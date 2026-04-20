# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.31)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

## Sovereign Flow Map (V68.31 — Systematic Law)
Architectural contract every new feature MUST honor:
- **Layer 1 — Sovereign Hub**: Command Center. Spark Wallet, Quest HUD, 11 Pillars. Every sub-page reports state back here in real time.
- **Layer 2 — Workshops (27)**: Utility/Education engine. 243 tools across 6-Depth Recursive Dives. Sparks only earned through educational engagement (no idle-game loophole).
- **Layer 3 — Quest Bridge**: Interconnect. Every material discovered in one domain is a key/frequency usable in a higher domain (Quartz in Geology → Tesseract unlock in Observatory, etc.). No dead ends.
- **Layer 4 — VR/Gamified Realms**: Merit-gated Ascension. Starseed Adventure + VR chambers. You don't play until you've learned.

## Core Rules
- **Flatland Rule**, **Metabolic Seal** (<800KB), **Closed-Loop Economy** (Sparks earn-only), **System-wide Gamification**, **Epilepsy Safety**, **Silence Shield** (opt-in audio only), **Spotify Loophole**.

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
