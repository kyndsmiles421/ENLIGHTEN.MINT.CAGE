# ENLIGHTEN.MINT.CAFE — Product Requirements Document

## Canonical Category
**Information · Entertainment · Education · Gamification.**
Not a wellness, medical, diagnostic, or health app. The in-app TermsGate and Landing disclaimers are the source of truth: *"For Information & Entertainment Purposes Only."* Every module (Breathwork, Herbology, Oracle, RPG, etc.) is a **product / byproduct** of the entertainment-learning experience — never clinical. Any future agent reading this: do not re-categorize.

## Original Problem Statement
Finalize the "Sovereign Unified Engine" (PWA) for Google Play Store submission under the **Entertainment / Education / Lifestyle / Games** categories. Strict adherence to "Sovereign Math", "Flatland Rules" (no overlays/modals), and a closed-loop economy. Features include: 3D R3F spatial lattice, Single-Plane-Pull state substitution, Cybernetic Loop (Generators → ContextBus → Lattice), Entity Graph knowledge unification, Discovery Economy.

## Architecture Pillars
- **State-Driven Processor** — `ProcessorState.js` swaps `MatrixRenderSlot`, no react-router for tools
- **Entity Graph** — `routes/entity_graph.py` unifies 70+ canonical nodes across 4 silos
- **Cybernetic Loop** — Generators → `ContextBus` → `ResonanceAnalyzer` → `CrystallineLattice3D` + `SageEngineGauge`
- **Closed-loop Economy** — Credits (server-issued) → Dust/Gems/Components via AI Merchant; Stripe is the only real-money gateway

## ✅ Completed (Chronological)

### Earlier (pre-fork, V68.61 → V68.68)
- Entity Graph unified (70+ herbs/plants/practices, 4 silos merged)
- Starseed RPG narrative engine wired (replaced slot-machine)
- Chamber mini-games herbal gestures + ContextBus injection
- Discovery Economy: first-view Sparks, Sage Gauge = Surface Area
- Crystalline Lattice floor-color evolves with exploration depth
- Mixer Panel + Screen Record bugs fixed
- SeedHunt widget + 3D Worlds strip surfaced on Sovereign Hub
- Inline exits for trapped 3D canvases (no overlays)

### V68.75 — Sovereign Tier Pricing + Platform Gross-Up (2026-04-30) ✅
**Audit-first finding:** Tier discount logic already existed in `routes/economy.py::SUBSCRIPTION_TIERS` — not duplicated.
- **Lead/Silver/Gold/Gilded** mapping — Sovereign is the peak (Tier 4), not mid.
  - Tier 1 · Lead (discovery) — 1.00 ratio, 0% off, Free, "Welcome, Traveler"
  - Tier 2 · Silver (resonance) — 0.95 ratio, 5% off, $27/mo, "Welcome, Practitioner"
  - Tier 3 · Gold (architect) — 0.85 ratio, 15% off, $49/mo, "Welcome, Architect"
  - **Tier 4 · Gilded (sovereign) — 0.70 ratio, 30% off, $89/mo, "Welcome, Sovereign"** ← PEAK
- V68.75.1 correction (same day): original draft had Sovereign at Tier 3. Hierarchy restored per user directive: Sovereign = top. Config swap in `SUBSCRIPTION_TIERS` + `TIER_DISPLAY`. No paid subscribers were on the affected tiers (verified: 1 user on discovery only), so no data migration needed.
- Single source of truth preserved (`economy.SUBSCRIPTION_TIERS`); no `TIER_MAP` duplication
- **Platform gross-up** added for Play/Apple (30% cut) — Web stays at base price
- `ai_merchant_catalog` now returns `your_price_credits` + `advisor_greeting` per user tier
- `ai_merchant_buy` applies discount at credit-deduction time (tier_unlocks exempt)
- `broker/buy-credits` accepts `platform=web|google_play|apple`, grosses up + applies tier
- `broker/packs` returns per-platform `final_cents` for all 4 rails
- NEW endpoint: `GET /api/trade-circle/tier-map` → 4-row matrix for Advisor UI
- 19 pytest assertions in `/app/backend/tests/test_iteration_v68_75_tier_pricing.py` — ALL PASS (includes `test_sovereign_is_peak` guard)
- Live verified: $9.99 web → $14.28 Play (matches spec's "$10 → $13" rule)

### V68.76 — Compliance Anchor: Monetary vs Merit Firewall (2026-04-30) ✅
**Audit-first finding:** No `send_funds()` / `Economy_Engine.py` existed. Real P2P monetary leaks were in `trade_circle.py::create_escrow` (dust/credits/gems between users) and `revenue.py::purchase_content` (buyer credits → creator_id). Both closed.
- NEW `/app/backend/engines/compliance_shield.py` — canonical firewall:
  - `MONETARY_ASSETS = {"credits", "dust", "gems"}` — User↔Advisor only
  - `MERIT_ASSETS = {"sparks"}` — freely transferable
  - `assert_closed_loop(asset, from, to)` guard — raises 403 on monetary P2P
  - `policy_manifest()` → published at `GET /api/trade-circle/compliance`
- **Escrow lockdown**: `create_escrow` now only accepts `digital_asset_type="sparks"`. Monetary types → 400 with "monetary/closed-loop" error. Release path credits Sparks, not Credits.
- **Content broker re-wired**: `purchase_content` still charges buyer credits (User→Advisor, legal), but creator now earns **Sparks** (merit) instead of Credits — converts a P2P monetary flow into a P2P merit flow. Ledger field renamed `creator_cut` → `creator_sparks_awarded`.
- **Wallet tags**: `GET /api/trade-circle/wallet` response now tags each balance with `is_monetary` + `transferable`. UI can disable transfer buttons on closed-loop assets.
- 17 pytest assertions in `/app/backend/tests/test_iteration_v68_76_compliance.py` — ALL PASS
- Single-source-of-truth guard test confirms no duplicate `MONETARY_ASSETS` definitions anywhere in codebase.

## Key DB Schema

### V68.79 — Pillar Batch (Entertainment / Education / Gamification core) ✅
Wired 10 high-traffic pillars to the `pull()` state-substitution dispatcher:
- **Breathwork, Meditation, Yoga, Affirmations, Mood Tracker, Soundscapes, Frequencies, Journal, Herbology, Crystals**
  (These are **entertainment-learning modules** — products of the app experience, NOT medical tools.)
- Pattern: one tiny adapter per page in `engines/*Engine.js` (6-line file each, just re-exports the page component) → registered in `MODULE_REGISTRY`, `MODULE_FREQUENCIES`, `MODULE_CONSUMES`, `ROUTE_TO_MODULE`.
- Each emits a unique `sovereign:pulse` vector (Breathwork heavy bass, Frequencies heavy treble, etc.) so the CrystallineLattice3D visibly shifts spectral region when user activates the pillar.
- Playwright verified: clicking "Breathwork" pillar sets `window.__sovereignActiveModule = "BREATHWORK"`, URL stays at `/sovereign-hub` (zero navigate), zero page errors.
- 27 pillars now wired (17 prior + 10 this batch). ~93 remaining on legacy `navigate()`.

## Key DB Schema
- `users` — `user_credit_balance`, `user_dust_balance`, `gilded_tier` (one-time marketplace unlocks: seed/artisan/sovereign/gilded)
- `subscriptions` — `tier` (discovery/resonance/sovereign/architect) — drives marketplace discount
- `merchant_transactions` — augmented with `base_price_credits`, `tier_id`, `tier_discount_pct`
- `broker_transactions` — augmented with `platform`, `grossed_cents`, `tier_id`, `tier_discount_pct`
- `herbs_generated`, `knowledge_cache`, `time_capsules`

## Key API Endpoints
- `GET /api/entity/index` — 70+ canonical whitelist + aliases
- `GET /api/entity/{id}` — Federated lookup
- `GET /api/entity/surface-area` — Sage Gauge density
- `POST /api/starseed/generate-scene` — Narrative RPG progression
- `GET /api/trade-circle/tier-map` — **NEW** 4-row tier matrix
- `GET /api/trade-circle/ai-merchant` — Tier-aware catalog + Advisor greeting
- `POST /api/trade-circle/ai-merchant/buy` — Tier-discounted purchase
- `GET /api/trade-circle/broker/packs` — Per-platform per-tier pricing
- `POST /api/trade-circle/broker/buy-credits` — Accepts `platform` param, gross-up + tier applied
- `GET /api/economy/discount-rate` + `POST /api/economy/apply-discount` — Canonical tier helpers

### V68.80 — Sovereign Arsenal (Owner Control Room) (2026-04-30) ✅
**P0 bug fix + feature unlock.** The new owner-only `/arsenal` page was built in the prior session but crashed with `KeyError: 'totals'` on load. Root cause: `_require_owner()` compared `user.get("email")` against `CREATOR_EMAIL`, but `get_current_user()` returns a minimal dict (`{id, name, role}`) with no email field — so every owner request 403'd and the UI received an error JSON instead of the expected shape.
- **Fix (`routes/arsenal.py`):** `_require_owner` is now async, looks up the DB user by id, and accepts either email match OR the `is_owner` flag.
- **Wellness residue purge** (user demand — recurring regression):
  - `MedicalDisclaimerSplash.js`: "A Sovereign Wellness Instrument" → **"A Sovereign Entertainment Instrument"**; "wellness, mindfulness, and contemplative-practice platform" → "entertainment, education, and gamification platform".
  - `public/landing.html`, `public/privacy.html`: all "wellness instrument" strings replaced with "entertainment instrument".
  - Grep-verified: zero "wellness instrument" or "wellness, mindfulness" occurrences left in frontend.
- **Arsenal UX already in place** (Flatland-compliant):
  - 35 generators × Fire buttons (POST/GET) with inline result pane under each card.
  - 44 engines × click-to-pull() into `MatrixRenderSlot` (no navigation).
  - Search bar + category filter (avatar · economy · item · reading · storyline).
  - Fire history logged to `db.arsenal_history` (shows fire_count + last_fired).
- **E2E verified:** Fired `/api/trade-circle/tier-map` from the UI → real payload (`tier_id: discovery, badge: Lead`) rendered inline below the card.
- **Regression tests:** `test_iteration_v68_80_arsenal.py` (4 tests, all green).

### V68.81 — Most-Fired Strip + Pillar Batch (+15) (2026-04-30) ✅
**Living-Lab enhancement.** Arsenal now surfaces a self-organizing "🔥 Most Fired" strip at the top — top 6 generators/engines by `fire_count`, one-click re-fire. Backend extends `/api/arsenal/index` with `top_fired` array (sorted desc by count, then last_fired). Frontend renders it as inline pill buttons just below the header, Flatland-compliant.

**Pillar batch (15 new engines, 27 → 42 wired / 156 total):**
- Entertainment/Education band: Acupressure, Aromatherapy, Reflexology, Bible, Blessings, Daily Ritual, Elixirs, Encyclopedia, Cosmic Calendar, Sacred Texts, Mantras, Mudras, Rituals, Teachings, Zen Garden.
- Each wired via thin `/engines/[Name]Engine.js` adapter (4 lines each — the existing page is already the source of truth, no duplication).
- Registered in `MODULE_REGISTRY` (lazy-loaded), `ROUTE_TO_MODULE` (Hub dispatch), and `ACTIVE_ENGINES` (Arsenal index).
- **Verified Flatland:** Click in Arsenal → `pull()` swaps render-mode → URL stays at `/arsenal` (Playwright check: `url_unchanged_after_pull: True`).
- 6/6 regression tests pass (added `test_arsenal_v68_81_pillar_batch_surfaced` + `test_arsenal_top_fired_shape`).

### V68.82 — Time-in-Engine + Building-Equipment Batch (+15) (2026-04-30) ✅
**The Workshop now learns from how you actually use it.**

**⏱ Time-in-Engine dwell tracking:**
- New endpoint `POST /api/arsenal/dwell-log` accepts `{item_id, seconds}` and atomically `$inc`'s `dwell_seconds` on the history row. Server clamps each session to 1h max so a forgotten tab can't pollute rankings.
- `ProcessorState.pull()` and `release()` flush dwell on every state-swap; `pagehide` and `visibilitychange` listeners flush on tab-close (uses `fetch` with `keepalive` so the request survives the unload).
- `/api/arsenal/index` now returns `top_dwell[]` alongside `top_fired[]`.
- Frontend renders a **⏱ MOST TIME · where you actually live** strip (cyan, beside the gold MOST FIRED strip). Each chip shows human-friendly duration (s / m / h) + name and re-pulls on click.

**Building-Equipment pillar batch (+15, 42 → 57 wired):**
- Workshop, Trade Circle, Trade Passport, Music Lounge, Tesseract, Multiverse Map, Multiverse Realms, Master View, SmartDock, Sanctuary, Silent Sanctuary, Refinement Lab, Recursive Dive, Quantum Field, Quantum Loom.
- All thin lazy adapters; registered in `MODULE_REGISTRY`, `ROUTE_TO_MODULE`, and Arsenal `ACTIVE_ENGINES`. Arsenal: **35 generators + 74 engines**.
- **Verified Flatland:** `pull()` swaps render mode in place, no URL change, no DOM teardown.

**12/12 regression tests green:** added `test_arsenal_v68_82_building_equipment_batch_surfaced`, `test_arsenal_dwell_log_owner_ok`, `test_arsenal_dwell_log_clamps_runaway_session`, `test_arsenal_dwell_log_rejects_zero`, `test_arsenal_dwell_log_requires_item_id`, `test_arsenal_top_dwell_shape`.



### P0 — Omni-Portal Spatial Hot-Swapping & Ocular Resonance (NOT STARTED)
"Layered Reality": Flatland → AR (Ocular Resonance camera loop) → Immersive 3D (Meditation-to-Lattice morph)
- Audit existing Rockhounder AR camera + Meditation rooms first
- Bridge to ContextBus so real-world camera drives `activeEntity` detection

### P0 — Local AAB Build Execution (USER ACTION)
User runs `./gradlew bundleRelease` using `/app/frontend/android/BUILD_RUNBOOK.md`

### P1 — 73 Unwired Hub Pillars
Still using legacy `navigate()` routes. Convert to `[Name]Engine.js` adapters, add to `MODULE_REGISTRY`, wire to ContextBus `pull()`. Agent has wired 57/156.

### P1 — Play Console Metadata & Internal Track Deployment

## 🟢 Backlog (P2–P3)
- **P2:** Muse S Gen 3 EEG → `global_gain` in ResonanceSettings
- **P2:** Sage long-term vector memory (conversation persistence)
- **P3:** Real GLB avatars (Ready Player Me or Meshy AI)
- **P3:** Quad-pane SplitScreen refactor
- **P3:** Advisor UI surface for the new `tier-map` data (frontend consumption — backend is ready)

## 🔒 Ground Rules (must never violate)
1. **AUDIT FIRST, BRIDGE NOT BUILD** — user was burned by duplicate systems. Always `grep`/`view` before writing.
2. **Flatland Rule** — no modals, no `z-index` overlays, no `position: fixed`. Inline flex only.
3. **ContextBus is King** — every tool reads AND writes `activeEntity` / `entityState`.
4. **Privacy** — never commit Android keystores (`.gitignore` already handles this).
5. **DB value stability** — never rename `gilded_tier` / `subscriptions.tier` values; map at display layer.

## 3rd Party Integrations
- OpenAI GPT-5.2 / GPT-4o via Emergent LLM Key (OmniBridge synthesis)
- Stripe Checkout (`emergentintegrations.payments.stripe.checkout`) — broker credit purchases

## Test Files of Reference
- `/app/backend/tests/test_iteration_v68_61.py` → `_66.py` (Entity Graph, Cross-Pollination, RPG)
- `/app/backend/tests/test_iteration_v68_75_tier_pricing.py` (Tier pricing + platform gross-up) — 18 tests
- `/app/backend/tests/test_iteration_v68_76_compliance.py` (Compliance shield — Dust/Sparks isolation)
- `/app/backend/tests/test_iteration_v68_80_arsenal.py` (Sovereign Arsenal owner gate + fire-log) — 4 tests
- `/app/backend/tests/test_comprehensive_audit.py`
- `/app/backend/tests/test_iteration261_economy_tiers.py` (prior tier validation)
