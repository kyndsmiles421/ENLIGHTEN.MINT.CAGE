# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.30)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

## Core Rules
- **Flatland Rule**, **Metabolic Seal** (<800KB), **Closed-Loop Economy** (Sparks earn-only), **System-wide Gamification**, **Epilepsy Safety**, **Silence Shield**, **Spotify Loophole**.

## V68.30 — Exhaustive "No-Skip Deep Audit" + Hydration-Race Elimination (Feb 2026)
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
