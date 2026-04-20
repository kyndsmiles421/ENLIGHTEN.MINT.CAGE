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

## V68.31 — Starseed "Dead Screen" Eliminated + QR Fix + 401 Race Gone (Feb 2026)
1. ✅ **Starseed "Begin Adventure" ghost button KILLED** — root cause: the button called `create-character` (0.4s) + `generate-scene` (6–8s LLM). `GameScene` rendered `null` while scene was channeling, leaving a blank page. Users bailed before GPT-5.2 finished.
    - Fix A: `StarseedAdventure.js.startNewAdventure/resumeAdventure` now flips `setView('game')` OPTIMISTICALLY the moment the user clicks, so the game canvas appears instantly.
    - Fix B: `GameScene.js` now renders a new `ChannelingStage` component while `scene` is null — cinematic origin-themed pulsing rings, live phase copy ("Aligning your Mintakan resonance… → Pulling threads of memory… → Composing with GPT-5.2… → Weaving gem resonance… → Almost there…"), progress bar with `Ns ELAPSED / GPT-5.2 CHANNELING…`, always-visible Exit button. Zero dead screens possible.
    - Verified live: channeling stage at t=1.2s, full narrative "RESONANCE WITH THE RELIC" + 3 choice buttons at t=5.6s.
2. ✅ **QR code scannability FIXED** — the previous custom 400-line byte-mode encoder wrote invalid format-info bits; zbar refused to decode even the raw output. Replaced with battle-tested `qrcode` npm library at ECC-H (30% recovery), kept identical public API and Om emblem overlay. Verified: pyzbar decodes the live-generated QR+Om back to the exact target URL. Also fixed hardcoded `enlighten-mint-cafe.me` → now uses `window.location.origin` so QR always points to the active host.
3. ✅ **401 hydration race ELIMINATED** (84–99 errors → 0) — `axiosInterceptor.js` now always overwrites Authorization with fresh localStorage token; expanded guest-abort list (sovereign-mastery, starseed/my-, sparks, quests, profile/me, auth/me). `AuthContext.js` reads live token inside `authHeaders` memo. `Treasury/Modality/ClassContext` gated on `hasAuth = token && token !== 'guest_token'`.

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
