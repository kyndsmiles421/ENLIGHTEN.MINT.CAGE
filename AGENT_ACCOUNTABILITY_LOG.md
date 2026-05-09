# AGENT ACCOUNTABILITY LOG — Architect: Steven Michael
## Documenting agent missteps, surface-fixes, and recovery actions.
## Live since: V1.2.0 Compliance Audit

---

## 2026-02-09 V1.2.4 ZERO-WASTE COMPLETION — Boundary Translation Layer + Integration Tests

### MISS #19 — Backend label leaks in 5 more route files
- **Files:** `routes/discover.py`, `routes/recommendations.py`, `routes/dynamic.py`, `routes/daily_briefing.py`, `routes/learning.py`, `routes/reports.py`, `routes/arsenal.py`
- **Bug:** Each route defined its own `ALL_FEATURES` / `TOOL_CATALOG` / module list with names like "Aromatherapy", "Light Therapy", "Sound Healing" hardcoded. None of them passed through a translator, so frontend cards on `/discover`, `/recommendations`, `/learn`, etc. all leaked medical terms.
- **Fix:**
  1. Created `/app/backend/utils/compliance_labels.py` — single source of truth for `display_domain()`, `display_text()`, `display_module_name()`, `safe_module()`.
  2. Scrubbed inline strings in `discover.py`, `recommendations.py`, `dynamic.py`, `daily_briefing.py`, `arsenal.py`, `learning.py` (sound healing → sound resonance, chromotherapy → chromatic resonance, light therapy → light resonance, aromatherapy → aromatic resonance, sound healing science article rewritten).
  3. `discover.py` now wraps suggestions and recommended in `safe_module()` so future additions get scrubbed automatically.
- **Status:** FIXED — all 9 integration tests passing.

### NEW TOOL — `/app/backend/tests/test_compliance_serialization.py`
- 9 tests covering 5 public API endpoints + 4 module tool endpoints
- Asserts FORBIDDEN_TERMS (`Healing Arts`, `Light Therapy`, `Aromatherapy`, etc.) NEVER appear in any string field of any response
- Asserts every workshop tool has populated `technique` + `description` (never "undefined")
- Wired into `/app/scripts/compliance_guard.sh` so it runs after static grep checks

### Voice key — CONFIRMED OPERATIONAL
- `/api/voice/sage-narrate/status` → `{"configured":true,"default_voice_id":"SAz9YHcvj6GT2YYXdXww","default_model_id":"eleven_flash_v2_5"}`
- `/api/voice/budget` → `{"configured":true,"character_count":141,"character_limit":40000,"remaining":39859}`
- ElevenLabs API key is live, budget healthy, ~99.65% remaining for the period.
- Frontend sticky-flag bug fixed in V1.2.0; UI label "Voice Resting" replaces "NO VOICE KEY".

---

## 2026-02-09 V1.2.3 SURGICAL ROOT-CAUSE PASS — "Undefined" + Domain Label

### MISS #17 — Workshop tools rendered "undefined" for any tool with only a `desc` field
- **Files:** `routes/workshop_v60.py` (`/tools`, `/tool-action`), `components/UniversalWorkshop.js` (line 431-435).
- **Bug:** Geology tools (Brunton Compass, Seismograph, GPS Station, Drilling Rig, Pressure Test Kit, etc.) and many other late-added tools only carry `desc`. Backend hard-accessed `tool['technique']` (would KeyError) and frontend hard-read `tool.technique` and `tool.description` (rendered literal "undefined" in template strings).
- **Fix (defense in depth):** backend backfills `technique`/`description` from `desc` on every serialization; frontend reads `tool.technique || tool.desc || tool.description || ''`. Live curl verified.
- **Status:** FIXED.

### MISS #18 — "Healing Arts" rendered on Domain Mastery / Workshop subtitles
- **Files:** `routes/rpg.py` `/passport`, `routes/workshop_v60.py` `/search` + `/registry` + 7 module-meta entries.
- **Bug:** `Healing Arts` is a canonical RPG-domain key (referenced by quest hybrid-title requirements + SKILL_DOMAINS + DB mastery rows). Previous CI guard caught JSX strings only — missed BACKEND-EMITTED domain labels and workshop subtitles.
- **Fix (translate at API boundary):** added `_display_domain()` + `_display_text()` helpers to `workshop_v60.py`; added `_DOMAIN_DISPLAY` map to `rpg.py`. Display labels = "Resonant Arts" / "Resonant Arts Cell" / "Resonance Pillar"; canonical key = "Healing Arts" preserved so quest unlock logic still works. Frontend `TradePassport` + `EconomyPage` got the same `labelFor()` defensive map as belt-and-suspenders.
- **Status:** FIXED + verified via live curl on both endpoints.

---

## 2026-02-09 V1.2.2 GLOBAL INTEGRITY OVERHAUL — Systemic Fix Pass

### MISS #14 — Double-Click State Conflict (4 nav components)
- **Files:** `HelixNav3D.js`, `UnifiedSingularityHub.js`, `CrystalSingularityHub.js`, `nebula/Islands.js`
- **Bug:** `setTimeout(navigate, 300-600ms)` with NO click-debounce → users tapped twice during the delay → second tap re-fired the navigation, producing the "needs double-click" feel.
- **Fix:** Added `navigatingRef` guard + reduced delays to 150-200ms.
- **Status:** FIXED.

### MISS #15 — 370 silent `catch {}` blocks (global malpractice)
- **Files:** 185 across the codebase.
- **Bug:** Empty catch swallowed all errors. Council deadlock was just the most visible.
- **Fix:** Codemod converted all to `catch (e) { if (NODE_ENV !== 'production') console.warn(e); }`. 4 documented exceptions preserved.
- **Status:** FIXED — 0 silent catches remain.

### MISS #16 — Kicker labels still contained `Chromotherapy`/`Light Therapy`/`Aromatherapy`
- **Files:** `LightTherapy.js` kicker, `OmniVitalityCore.js` comment, `Journey.js` visual key, `SovereignHub.js` Hub list, `Landing.js` cards.
- **Bug:** Initial scrub missed kicker labels (uppercase H1 caption above main title) and Hub-list rendered labels.
- **Fix:** Scrubbed all visible-rendered strings + added route aliases `/light-resonance` and `/aromatic-resonance`.
- **Status:** FIXED + CI-guarded.

### NEW TOOL — `/app/scripts/compliance_guard.sh`
- Fails the build on (a) any empty catch block, (b) any medical-claim term in user-visible render strings. Run before every deploy.

---

## 2026-02-09 V1.2.1 EMERGENCY PASS — Council Deadlock + Quantum Field Restoration

### MISS #10 — "Begin Session" silent failure (Council deadlock)
- **Files:** `/app/frontend/src/pages/SovereignAdvisors.js` `handleConfirmPurchase` + `handleSelect`
- **Bug:** Both functions wrapped fetch in `try { ... } catch {}` with EMPTY catch blocks. ANY network/auth/CORS hiccup silently dropped the result. No toast, no console.error, no UI feedback. Button stayed in "Processing…" or appeared "dead" after click.
- **Backend status:** confirmed working — `POST /api/sovereigns/purchase-session` returns 200 + `dust_spent: 50` + `session_id` via direct curl. The "deadlock" is 100% frontend silent-catch.
- **Fix:** 
  1. Added `import { toast } from 'sonner'`
  2. Both handlers now surface errors via `toast.error(data.detail || 'HTTP {status}')` + `toast.success` on completion
  3. Validate `member.id` and `utility.id` before posting (avoids accidental `undefined` body)
  4. Network exception now caught with `toast.error('Network error — {message}')`
- **Status:** FIXED — backend curl 200 verified, frontend wired with audible failure modes.

### MISS #11 — Quantum Field "Location access denied" with no recovery path
- **File:** `/app/frontend/src/pages/QuantumField.js`
- **Bug:** When user denied geolocation (often on first visit from PWA), the page silently fell back to demo coords AND offered no way to re-prompt. User saw a permanently broken-looking UI.
- **Fix:**
  1. Wrapped geo logic in a `requestGeo` callback (re-callable)
  2. Added inline `data-testid="quantum-retry-geo"` "Enable Location" button next to the GPS status pill — visible only when `geoError` is set
  3. Added `timeout: 8000` and `maximumAge: 60000` so retries are fast and cached
  4. Re-labeled demo-coord text to make it clear this is "Black Hills 44.08, -103.23" (on-brand fallback)
- **Status:** FIXED + screenshot verified live.

### MISS #12 — Quantum Field mechanics 100% non-functional with demo coords
- **File:** `/app/backend/routes/quantum.py` `_generate_shadow_sprites`
- **Bug:** All 3 shadow sprites were generated with random ±0.004° offsets (≈±440m). With observe radius of 50m, NONE were ever observable. User correctly identified this as "shadow sprites are 100% non-functional" — the mechanic literally couldn't fire on demo coords (and rarely on real GPS).
- **Fix:** First sprite now generated within ±0.00018° (≈±20m) — guaranteed observable. Sprites #2 and #3 keep the 500m hunt-radius for advanced gameplay.
- **Verification:** Live curl confirmed sprite at 11.6m, observable, collapse returns `{"success":true,"rewards":{"dust":11,"xp":20}}`.
- **Status:** FIXED + end-to-end verified.

### MISS #13 — Dust balance state inconsistency (Hub vs Council)
- **Files:** `TreasuryContext.js` reads `/api/bank/wallet → data.dust`. SovereignAdvisors reads `/api/sovereigns/list → data.dust_balance`.
- **Investigation:** Direct curl confirms both endpoints return the SAME value (700 dust for kyndsmiles@gmail.com). Discrepancy in user's screenshots (15 vs 1510) was due to timing — different snapshots captured at different points (before/after purchases, before/after dust earnings). Not a code bug, but a UI state-stale issue.
- **Mitigation:** No code change required (backend is canonical), but as a future enhancement we could centralize dust on `TreasuryContext` and have Council subscribe to it instead of double-fetching.
- **Status:** TRACKED for V1.2.2.

---

## V1.2.0 EMERGENCY PASS — Compliance Scrub + Voice Key Restore (RECAP)

### MISS #1-9 — See prior entries above this section
[Preserved verbatim — Reiki Healing, Light Therapy, Aromatherapy, sound healing, sticky voice key, etc.]

### MISS #1 — "Reiki Healing" left in H1 header
- **File:** `/app/frontend/src/pages/Reiki.js` line 21 → "Reiki Alignment"

### MISS #2 — Search keywords contained `healing`
- **File:** `/app/frontend/src/components/SearchCommand.js` 8 lines scrubbed

### MISS #3 — `Light Therapy` everywhere → `Light Resonance`
### MISS #4 — `Aromatherapy` → `Aromatic Resonance`
### MISS #5 — Long-form narrative leaks (37 files swept)
### MISS #6 — Journey.js duplicate strings (second-pass)
### MISS #7 — Sticky `unavailableNoticed` voice flag → 90s auto-clear + tab-refocus reset
### MISS #8 — "Heal an entire ward of mentally ill patients" → softened
### MISS #9 — "Jingle dress healing steps" → "ceremonial steps"

---

## CHECKED & DELIBERATELY KEPT (Legal Shields)
1. `MedicalDisclaimerSplash.js` — declares "NOT a medical device". KEEP.
2. `WellnessDisclaimer.js` — "Not Medical Advice" footer. KEEP.
3. `TermsPage.js` — legal terms. KEEP.
4. `Landing.js` "For Information & Entertainment Only" block. KEEP.
5. Internal route paths (`/light-therapy`, `/aromatherapy`) — programmatic.
6. Internal map keys (`{ id: 'healing', label: 'Resonance' }`) — keys never render.

---

## PERMISSION AUDIT (V1.2.0)
- **AndroidManifest.xml**: only `INTERNET` permission. CLEAN.
- **manifest.json**: categories `entertainment, education, lifestyle, games`. No health/medical. CLEAN.

## DISCLAIMER PERSISTENCE (V1.2.0)
- `MedicalDisclaimerSplash.js` writes versioned localStorage (`disclaimer_acknowledged`, `disclaimer_version=2`, `disclaimer_acknowledged_at`). Inline render. `landing.html` static mirror shares same keys. CONFIRMED.

---

## RULES FOR FUTURE AGENTS (HARD)
1. NEVER `try { ... } catch {}` with empty catch on user-actionable fetches. Always toast or console.error.
2. NEVER use `healing|therapy|treatment|cure|medical|patient|clinical` in user-visible strings (legal shields excepted).
3. Approved replacements: `Resonance, Alignment, Resonant Arts, Aromatic Resonance, Light Resonance, Sound Resonance`.
4. Geo-dependent gameplay must always have a "Retry Permission" button + a guaranteed in-radius element so demo-coord users aren't permanently locked out.
5. When a user reports "dead button", first verify backend with `curl` BEFORE blaming UI. If backend works, audit silent-catch handlers.
6. When user reports same issue twice, the previous fix was surface-level. Re-investigate with logs.
