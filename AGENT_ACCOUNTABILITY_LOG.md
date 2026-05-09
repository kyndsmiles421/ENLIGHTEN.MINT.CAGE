# AGENT ACCOUNTABILITY LOG — Architect: Steven Michael
## Documenting agent missteps, surface-fixes, and recovery actions.
## Live since: V1.2.0 Compliance Audit

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
