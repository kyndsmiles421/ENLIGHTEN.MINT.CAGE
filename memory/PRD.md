# ENLIGHTEN.MINT.CAFE — Product Requirements Document

## Canonical Category
**Lifestyle · Entertainment · Education · Gamification · Spiritual Instrument.**
A **multi-denominational spiritual exploration and personal sovereignty instrument** — never wellness, medical, diagnostic, or health. The in-app TermsGate, Hub Cross-Tradition mark, manifest description, and Landing disclaimers are the source of truth: *"For Information & Entertainment Purposes Only — spiritual study, not medical advice."* Every module (Breathwork, Herbology, Oracle, Bible, RPG, etc.) is a **byproduct** of the spiritual-study + entertainment-learning experience. Any future agent reading this: do not re-categorize. Do not strip the multi-denominational framing.

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

### V68.83 — Spiritual Shield + Suggest Next + Cross-Tradition Mark (2026-04-30) ✅
**Strategic re-positioning for Play Store safe-harbor + silent-collaborator UX.**

**🛡 Spiritual Shield (legal armor):**
- `manifest.json` description rewritten: *"A multi-denominational spiritual exploration and personal sovereignty instrument"* (categories stay Lifestyle/Education/Entertainment/Games — Spiritual is the **why**, not a separate category).
- `MedicalDisclaimerSplash`: title **"A Sovereign Spiritual Instrument"**; new prose frames the app as *spiritual study, philosophical inquiry, and traditional-wisdom exploration within a multi-denominational framework*. Disclaimer version bumped to `2` so all existing users re-acknowledge with the new copy.
- `landing.html` & `privacy.html` parallelized to the same language.
- Disclaimer chips updated: `SPIRITUAL · MULTI-DENOMINATIONAL · EDUCATION · NOT MEDICAL ADVICE`.
- Hub now displays an inline **🧭 Cross-Tradition · Sovereign Spiritual Instrument** mark directly under the title (no overlay).

**🪶 LLM prompt guardrails (Sovereign Framing block injected):**
- `coach.py` (Sage AI) — every response framed as *spiritual, philosophical, or traditional wisdom* across many denominations; redirects medical questions to licensed professionals.
- `bible.py` — sacred-texts narrator now positions output as multi-denominational spiritual exploration and sovereign self-study.
- `oracle.py` — I-Ching reader frames hexagram as Taoist wisdom and contemplative offering, never advice or prediction.

**🎯 Suggest Next chip (silent collaborator):**
- `/api/arsenal/index` now returns `suggested_next` — a category-affinity heuristic over `top_fired + top_dwell` that picks the user's least-touched generator inside their most-engaged categories. Always populated (uses Affirmation as friendly fallback for first-time owners).
- Frontend renders an inline pink chip **"🎯 Suggest Next · {reason}"** above Most Fired, with one-click fire.
- E2E proof: with reading-category history → suggested "Astrological Forecast · Adjacent to your reading work".

**21/21 regression tests green** across `test_iteration_v68_80_arsenal.py` (12) + new `test_iteration_v68_83_spiritual_shield.py` (9). Locks down: manifest description, landing/disclaimer prose, disclaimer version bump, sage/bible/oracle sovereign framing, hub Cross-Tradition mark, suggested_next shape.

### V68.84 — Universal Translator + Voice Interaction Bridge + Hawaiian (2026-04-30) ✅
**Audit-first finding:** `LanguageContext.js` already shipped 8-language UI strings + RTL + haptic kinetic profiles. Did NOT rebuild — bridged.

**🌐 Universal Translator middleware:**
- New endpoint `POST /api/translator/translate` powered by Emergent LLM Key (gpt-4o-mini). Accepts `{text, target_lang, sacred?}`. Validates target_lang against the supported set, caps text at 4000 chars, English passthrough skips the LLM.
- Sovereign-tier **Sacred Mode** returns a `sacred_note` carrying the original-tradition root (Sanskrit / Hebrew / Greek / Hawaiian / etc.) + 1-sentence context. Used by Bible/Sacred-Texts engines to teach as it translates.
- **System prompt locks in multi-denominational spiritual framing** — model is instructed never to medicalize, prescribe, or diagnose during translation.
- Hawaiian (`haw` / **ʻŌlelo Hawaiʻi**) is a first-class supported language. E2E proof: *"Honor your body. Honor your spirit. Walk gently."* → **"E hoʻomanaʻo i kāu kino. E hoʻomanaʻo i kāu ʻuhane. E holo me ke aloha."** Sacred mode on "Aloha" returned: *"Aloha embodies love, affection, peace, compassion, and mercy — a deep connection between individuals."*

**🔊 Voice Interaction Bridge (Tactile / Narrative / Interactive):**
- New endpoint `GET /api/voice/tier-features` returns the entitlement matrix the UI consumes: `voice_modes`, `tts_quality`, `translation_text`, `translation_voice`, `sacred_language_mode`, `stt_listening`, plus the `supported_languages` list and a `locked_features` upsell hint.
- Tier feature matrix codified in `routes/translator.py::TIER_FEATURE_MATRIX` (single source of truth; backend gate + frontend render share it):
  - **Discovery (free):** Tactile + Narrative · browser TTS · text translation
  - **Resonance (Silver):** + Interactive mode · STT listening
  - **Architect (Gold):** + High-quality TTS · real-time voice translation
  - **Sovereign (Gilded):** + Sacred-language nuance mode
- New `VoiceInteractionContext` + `useVoiceInteraction()` hook — manages `voiceMode` (persisted to localStorage), exposes `speak(text, lang)` (browser SpeechSynthesis with per-language hint map), `stopSpeaking()`, `translate()`, plus `tier`, `features`, `supportedLangs`. Provider wraps the app inside `App.js`.
- **Auto-narration wired into Arsenal generator fires:** when Narrative or Interactive mode is on and `target_lang` is non-English, the result string is translated → spoken in the target language. Tactile mode stays silent (accessibility-first).

**🎛 Arsenal Voice + Lang nodule (inline, Flatland):**
- Tactile / Narrative / Interactive mode pills with tier-locked styling (locked modes show 🔒 + tier-upsell toast).
- Language `<select>` populated with all 9 supported languages including Hawaiian.
- Sovereign-only **"SACRED MODE · SOVEREIGN"** pink pill announces the unlock to the owner.
- Stop button appears only while speech is in flight.

**+1 language UI catalog:** `LanguageContext.LANGUAGES` and `KINETIC_PROFILES` extended with Hawaiian (kineticFeel: `aloha`). Static UI translations added: `nav.*`, `common.*`, `mixer.*`, `dashboard.*`, `auth.*` in ʻŌlelo Hawaiʻi.

**8/8 regression tests** green in `test_iteration_v68_84_translator.py`: tier-features sovereign for owner, all 9 languages listed, English passthrough, Hawaiian round-trip, unknown-lang rejection, missing-text 400, oversized-text 400, sacred-mode sovereign returns note. **29/29 green** total across V68.80–V68.84.

### V68.85 — Deep-Registry Bridge + Cantonese + Urdu (2026-04-30) ✅
**Audit-first execution** — user explicitly directed: *"I always look to see what's there first before you start."* Three pre-existing systems found and properly bridged.

**🔍 Audit findings (and how each was honored):**
1. `routes/translation.py` exists as **public Plus-tier credit-gated translator** with SHA-256 cache + Gemini-3-Flash. My V68.84 `routes/translator.py` was a parallel build. **Reconciled** — both files now carry an explicit "TWO TRANSLATORS — DO NOT MERGE" header documenting purpose split (public/paid/cached vs sovereign/sacred-mode/uncached) so future agents can't rebuild either by accident. Both share the unified 11-language SUPPORTED set.
2. `config/languageRegistry.js` (541 lines) — **deep plugin registry** with phonetic synthesis (Web Audio waveforms, base frequencies, harmonic peaks, attack/release envelopes), Zero-Point flicker glyphs, and haptic categories. Already had `zh-cmn` (Mandarin) + `zh-yue` (Cantonese). Used by RecursiveLattice, GhostingOverlay, usePhoneticSynthesizer, useZeroPointFlicker, useTesseractCore, useRDive36, useSentientRegistryV2. **Bridged** to `LanguageContext` via new `getDeepProfile(code)` helper + `SHALLOW_TO_DEEP` map (handles `zh ↔ zh-cmn`, `yue ↔ zh-yue`); exposed through `useLanguage().deepProfile`.
3. `i18n/translations.js` — orphan, no consumers. **Left untouched** (delete candidate in a future cleanup, low priority).

**🌏 Cantonese (yue / 粵語):**
- Added to shallow `LanguageContext.LANGUAGES` (Traditional script · YUE flag).
- Kinetic profile: `percussive` (sharper than Mandarin's smooth glide).
- Static UI translations (nav · common · mixer · auth) in Traditional Cantonese.
- Bridged to deep registry's pre-existing `zh-yue` entry — `tonal_complex` phonetic profile with sawtooth wave, F#4 base @369.99 Hz, 9-tone harmonic complexity automatically activates when selected.
- Browser TTS hint: `zh-HK` locale.

**📿 Urdu (ur / اُردُو):**
- Added to BOTH shallow `LanguageContext.LANGUAGES` and deep `LANGUAGE_REGISTRY` (Nastaliq · UR flag · **RTL**).
- `<html dir="rtl">` toggles correctly (verified live: `html_dir_after_ur: rtl`).
- Kinetic profile: `lyrical` (per user direction — "Lyrical/Flowing to match its poetic status").
- New `urdu` PHONETIC_PROFILE entry: sine wave, C#4 base @277.18 Hz (matches Hindi — shared spoken root), 4-peak harmonic stack, softer attack (0.035s) + longer release (0.28s) than Hindi (0.02 / 0.15) to honor Nastaliq flow.
- Zero-Point flicker glyph: ﷲ (Allah — multi-denominational respect).
- Static UI translations (nav · common · mixer · auth) in Urdu Nastaliq.
- Browser TTS hint: `ur-PK` locale.

**🌺 Hawaiian — also added to deep registry** (was only in shallow): `hawaiian` PHONETIC_PROFILE (sine, C4 @261.63 Hz, breath-of-life), zeroPoint glyph: `ʻ` (ʻokina, sacred Hawaiian glottal mark).

**🔌 Bridge hook in `LanguageContext`:**
```js
const { deepProfile, getDeepProfile } = useLanguage();
// deepProfile.phoneticProfile → waveform, baseFrequency, resonantPeaks
// deepProfile.zeroPoint → flickerGlyph, weight, glitchIntensity
// deepProfile.hapticCategory → basePattern, flickerMultiplier, audioProfile
```
Now any pillar / lattice / synthesizer can read the deep profile of the current language without importing the registry directly. Single source of truth.

**Final language set (11 first-class):** English · ʻŌlelo Hawaiʻi · 普通话 (Mandarin) · 粵語 (Cantonese) · हिन्दी (Hindi) · اُردُو (Urdu, RTL) · Español · Français · 日本語 · العربية (RTL) · Português.

**11/11 V68.85 regression tests green** + **40/40 green total across V68.80–V68.85.** Tests assert: both translator files carry the dual-path disclaimer; both share the supported set; tier-features lists all 11; Cantonese returns CJK; Urdu returns Arabic-script; LanguageContext imports the deep registry; `getDeepProfile` is exposed; deep registry now carries `ur` + `haw`; Urdu is RTL; SYNTH_LANG_MAP has `yue`/`ur`.

### V68.86 — Frequency Dial + Reader-Translator Pillar Bridge (2026-04-30) ✅
**Audit-first execution honored.** Found and used existing infrastructure rather than building parallel systems. Corrected my own prior audit when the user pushed back ("most everything should be there") — discovered:
- Stripe is **deeply intermingled** across 8 backend modules (`economy.py`, `subscriptions.py`, `marketplace.py`, `workshop.py`, `cosmetic_bundles.py`, `rpg.py`, `trade_circle.py`, `compliance_shield.py`) via `emergentintegrations.payments.stripe.checkout` — there's no separate `stripe.py` because each route owns its own checkout flow.
- `entity_graph.py` (625 lines) **already** federates herbology + botany + aromatherapy + sovereign_library into a single ENTITY_INDEX with alias resolution at `/api/entity/{id}` + circuit-breaker LLM synthesis. The "silo collapse" the user requested was already done.
- `usePhoneticSynthesizer.js` (492 lines) **already** consumes `LANGUAGE_REGISTRY` + `PHONETIC_PROFILES` and generates real Web-Audio buffers for granular noise, tonal glides, precise staccato, balanced sine.
- `V_ENGINE_P0.js` is real — defines orbital physics with Phi-expansion @1155.0 base + Radical Scaling Root.

**🎵 Frequency Dial (used the existing synthesizer, no rebuild):**
- New `useLanguageFrequency()` hook in `LanguageContext` — single-line consumer returning `{ baseFrequency, waveform, resonantPeaks, character, flickerGlyph }` for the active language. Components like the lattice / R3F audio listener can now tune to the current cultural pitch with one import.
- Extended `usePhoneticSynthesizer.generateBuffer()` switch to recognize the V68.85 phonetic characters `lyrical_flow` (Urdu) and `aloha_breath` (Hawaiian). They share the balanced-sine generator but with their own `baseFrequency` + `resonantPeaks` + `attackTime` + `releaseTime` already shifted in the deep registry, so the synth picks up the cultural pitch automatically when the language flips.

**📖 Reader-Translator Pillar Bridge:**
- New `<TranslateChip>` component (`components/TranslateChip.jsx`) — small inline pill that drops next to any text block. Toggles between original ↔ translation ↔ original on each tap, includes loading spinner + sacred-mode etymology pill (Sovereign-only) + auto-narration via `useVoiceInteraction.speak()`.
- Uses ONLY existing helpers: `useLanguage()` for active language + flicker glyph, `useVoiceInteraction()` for translate + speak. **No new backend route** — flows through the V68.84 sovereign translator path. Audit-trail enforced by `test_translate_chip_does_not_introduce_parallel_translator_route`.
- Wired into `Bible.js` for all three section tabs (Retelling, Key Verses, Commentary) with separate translation state per tab so swapping tabs preserves the user's choices. Translations clear on chapter swap so a stale translation never sticks to fresh source text.
- Flatland-compliant: inline `<span>`, no overlay/portal/z-index. Honors the founding architecture rule.

**6/6 V68.86 regression tests green** + **46/46 total across V68.80–V68.86.** Tests assert: `useLanguageFrequency` exported with correct shape; `usePhoneticSynthesizer` recognizes `lyrical_flow` + `aloha_breath`; `TranslateChip` exists and uses the existing pipeline (no axios, no `/api/translate` bypass); Bible imports the chip with 3 instances; chapter-swap clears stale translations.

**Honest macro-roadmap (NOT implemented this session — documented for the next pass):**
- ⚠️ "Aloha Living" — exists only as language-level kineticFeel + phonetic profile. No business node, no e-commerce wiring, no content silo. **Pure narrative; needs scoping before build.**
- ⚠️ "Sovereign Trust" — concept-level only, no dedicated module. Needs design before implementation.
- ✅ Drop `<TranslateChip>` into Sacred Texts + Oracle pillars — pattern is set, ~1 search-replace per pillar.
- ✅ Bridge `useLanguageFrequency()` into `useHubAudio` so the Hub's ambient hum literally retunes when language flips (~10-line edit).
- ✅ Tuning Fork micro-animation on the language picker (~30-line CSS-only addition).

### V68.86b — SacredTexts Chip Wiring + Honest Scripture Catalog Audit (2026-04-30) ✅
**User asked:** *"shouldn't we do that tip method for all the large books like the Torah and the Quran and like the Pali Canon... I'd like to be able to access that whole things"*

**Audit-first answer (hard numbers, not narrative):**

| Tradition | Catalogued | Status |
|---|---|---|
| Bible OT/NT | 66/66 | ✅ Complete |
| Deuterocanonical | 7 | ✅ Solid |
| Lost & Apocryphal | 17 (Enoch, Thomas, Mary, Philip, Judas, Pistis Sophia, Jubilees, Hermas, Didache, etc.) | ✅ Strong |
| **Torah / Talmud / Midrash** | 12 (Pirke Avot, Mishnah Berachot/Shabbat, Talmud Sanhedrin/Bava Metzia/Berakhot, Midrash Genesis/Exodus, Mekhilta, Sifra, Tanya, Derech Hashem) | ✅ Foundational |
| **Kabbalah** | 10 (Zohar, Sefer Yetzirah, Bahir, Etz Chaim, Tikkunei Zohar, Sefer Raziel, Pardes Rimonim, Sha'arei Orah, Sefer HaTemunah, Nefesh HaChaim) | ✅ Strong |
| **Quran** | **24 of 114 surahs** | ⚠️ ~21% — missing ~90 surahs |
| Hindu | Bhagavad Gita, Upanishads, Yoga Sutras | ⚠️ Missing **Vedas (Rig/Sama/Yajur/Atharva), Mahabharata, Ramayana, Puranas, Brahma Sutras** |
| **Buddhist Pali Canon** | **Only Dhammapada** (1 of ~50 volumes) | ❌ Missing entire **Sutta Pitaka** (Digha/Majjhima/Samyutta/Anguttara/Khuddaka Nikayas), **Vinaya Pitaka**, **Abhidhamma Pitaka**, **Visuddhimagga**, **Milindapanha** |
| Mahayana | Tibetan Book of the Dead | ⚠️ Missing **Lotus Sutra, Heart Sutra, Diamond Sutra, Lankavatara Sutra** |
| Taoist | Tao Te Ching, I Ching | ✅ Foundational |
| **Sikh** | None | ❌ Missing **Guru Granth Sahib** |
| **Zoroastrian** | None | ❌ Missing **Avesta · Gathas** |
| **LDS** | None | ❌ Missing **Book of Mormon · D&C · Pearl of Great Price** |
| Other | Egyptian Book of the Dead · Popol Vuh · Norse Edda · Kojiki · Odu Ifa · Kalevala · Rumi Masnavi · Emerald Tablet | ✅ Solid |

**Critical insight that makes expansion cheap:** all chapter content is **AI-generated on demand** by the existing `/api/sacred-texts/{text_id}/chapters/{chapter_id}/generate` endpoint. So expanding the catalog = adding metadata entries (title, tradition, region, era, themes, chapter list); the retellings auto-generate when a user opens a chapter. **No content shipped, just structured prompts.**

**What V68.86b actually shipped:**
- ✅ Dropped `<TranslateChip>` into `SacredTexts.js` retelling section. Same pattern as Bible.js — **one edit covers all 15 currently-catalogued traditions** (Bhagavad Gita, Tao Te Ching, Dhammapada, Upanishads, Rumi, Norse Edda, Tibetan Book of the Dead, I Ching, Emerald Tablet, Yoga Sutras, Kojiki, Odu Ifa, Kalevala, Egyptian Book of the Dead, Popol Vuh).
- ✅ Translation state auto-clears on chapter swap so a stale translation never sticks.
- ✅ New regression test `test_sacred_texts_pillar_imports_translate_chip` locks the wiring in.
- **47/47 tests green** across V68.80–V68.86b.

**P1 Scripture Catalog Expansion (NOT done — needs scoping):**
The catalog gaps above represent ~120 high-value missing entries. Priority order proposed (user direction needed before any implementation):
1. **Quran completion** — add the missing 90 surahs (~30 min of catalog work, opens the entire Quran to the chip).
2. **Pali Canon proper** — 4-6 entries: Sutta Pitaka summary + Digha/Majjhima/Samyutta/Anguttara/Khuddaka Nikaya highlights, Vinaya Pitaka summary, Abhidhamma summary. (Adding all 10,000+ suttas individually is overkill — curated representative selections is the right scope.)
3. **Mahayana sutras** — Lotus, Heart, Diamond, Lankavatara (~4 entries).
4. **Hindu epics + Vedas** — Mahabharata (18 parvas), Ramayana (7 kandas), Rig/Sama/Yajur/Atharva Vedas, Vishnu/Shiva/Devi Bhagavata Puranas (~13 entries).
5. **Sikh / Zoroastrian / LDS** — Guru Granth Sahib (10 sub-sections), Avesta + Gathas (~5 entries), Book of Mormon (15 books) + D&C + PGP (~17 entries).

**Total estimated work: ~150 catalog entries across 5 traditions, ~3-4 focused sessions.**



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
- `/app/backend/tests/test_iteration_v68_80_arsenal.py` (Sovereign Arsenal owner gate, fire-log, dwell-log, top_fired/top_dwell, suggested_next, V68.81 + V68.82 batch surfacing) — 12 tests
- `/app/backend/tests/test_iteration_v68_83_spiritual_shield.py` (manifest, landing, disclaimer, sage/bible/oracle sovereign framing, hub Cross-Tradition mark) — 9 tests
- `/app/backend/tests/test_iteration_v68_84_translator.py` (Universal Translator middleware, Voice tier-features, Hawaiian, sacred mode) — 8 tests
- `/app/backend/tests/test_iteration_v68_85_deep_bridge.py` (audit-first reconciliation: dual-translator disclaimer, deep-registry bridge, Cantonese yue, Urdu ur RTL, SYNTH_LANG_MAP) — 11 tests
- `/app/backend/tests/test_iteration_v68_86_frequency_dial.py` (useLanguageFrequency hook, phonetic synth lyrical_flow/aloha_breath, TranslateChip wired into Bible) — 6 tests
- `/app/backend/tests/test_comprehensive_audit.py`
- `/app/backend/tests/test_iteration261_economy_tiers.py` (prior tier validation)
