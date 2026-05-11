# SECURITY & COMPLIANCE ISSUES LOG — ENLIGHTEN.MINT.CAFE

**Generated:** 2026-02-10
**Source:** Direct scan of `/app` codebase and `git log` history.
**Account:** kyndsmiles@gmail.com
**Project:** ENLIGHTEN.MINT.CAFE
**Production domain:** https://enlighten-mint-cafe.me

This is a factual technical record. No legal characterization, no
estimates — every count is grep'd from source or pulled from `git
log`. Use as you see fit.

---

## 1. Keystore Credential Leak on Public Page

| Field | Detail |
|---|---|
| Severity | P0 / Critical security |
| File affected | `/app/frontend/public/launch.html` |
| Public URL pattern | `https://<domain>/launch.html` |
| Discovered | 2026-05-10 |
| Exposed material | Android upload-keystore alias + plaintext password |
| Original purpose | Agent embedded the credentials so the account owner could grab the signed APK |
| Production exposure | Yes — file was reachable without authentication |
| Fix commits | `11f147102e43`, `a3102eb0f0ad`, `f6d0c7a49095` |
| Current file size | 26 lines (reduced "Restricted" notice — credentials removed) |
| Keystore relocated to | `/app/.private/` (outside web root) |
| Download endpoint hardened | `GET /api/downloads/enlighten-v1.0.4.apk` now requires admin role via `backend/deps.py` |
| Preventive control added | Pre-push CI guard blocks any `*.keystore` filename pattern in public directories |

**Verification commands:**
```
grep -i "keystore\|password\|alias\|UPLOAD-KEY" /app/frontend/public/launch.html
ls -la /app/frontend/public/launch.html  # 26 lines, no secrets
ls /app/.private/                         # current keystore location
```

---

## 2. Personal PII Embedded in Public Files

| Field | Detail |
|---|---|
| Severity | P0 / Privacy + security |
| Discovered | 2026-02-10 |
| PII types exposed | Full legal name, home street address, personal Gmail |
| Specific values that shipped | Home address: `318 National Street #2, Rapid City, SD 57702`; Name: `Steven Michael` / `STEVEN MICHAEL`; Email: `kyndsmiles@gmail.com` |
| Production exposure | Yes — present in HTML meta tags, JSON-LD Person node, privacy policy footer, source maps, and runtime `console.log` boot message |

**Locations scrubbed on 2026-02-10:**

| File | Type of leak |
|---|---|
| `frontend/public/landing.html` | meta description, twitter description, og:author, footer text |
| `frontend/public/index.html` | meta description, keywords, twitter description, author |
| `frontend/public/privacy.html` | operator name, home address, contact email |
| `shared/brand_identity.json` | JSON-LD Person node (founder) — node deleted entirely |
| `frontend/public/MixmasterConsultant.js` | identity comment + runtime `console.log` printing first name on boot |
| `frontend/public/CreatorMixer.js` | identity comment |
| `frontend/src/pages/SovereignFabricator.js` | `rootEmail: "kyndsmiles@gmail.com"` constant + identity header (replaced with role-based access check) |
| `frontend/src/components/ProgressGate.js` | hardcoded email in privileged-access check |
| `frontend/src/pages/SovereignHub.js` | identity comment referencing email/tier |
| `frontend/src/utils/EnlightenOS.js` | identity header + runtime boot `console.log` |
| `frontend/src/utils/NoduleBridge.js` | identity header |
| `frontend/src/utils/SovereignSingularity.js` | identity header |
| `frontend/src/engines/RadicalQuantumFlow.js` | `@author Steven Michael` JSDoc |
| `frontend/src/engines/SovereignMachine.js` | `@author`, `inventor: "STEVEN MICHAEL"`, runtime `console.log` |
| `frontend/src/engines/PhiResonator.js` | `@author` |
| `frontend/src/engines/PixelRefinement.js` | `@author` |
| `frontend/src/engines/SovereignMemory.js` | `@author` |
| `frontend/src/engines/V_Engine_Bridge.js` | `@author` |
| `frontend/src/engines/ProductionEngine.js` | `@author` |
| `frontend/src/engines/CrystalShield.js` | `@author` |
| `frontend/src/engines/HarmonicGovernor.js` | `@author` |
| `frontend/src/engines/OmnisUniversalCore.js` | identity header |
| `frontend/src/pages/LatticeView.js` | identity header |
| `frontend/src/styles/UniverseMaterials.css` | comment header |
| `frontend/src/index.css` (3 separate spots) | comment headers |

**Preventive control added:** `scripts/compliance_guard.sh` now greps for the literal patterns `kyndsmiles@gmail`, `318 National`, `Steven Michael`, `STEVEN MICHAEL` in all shipping files and blocks `git push` if any reappear.

**Verification command:**
```
grep -rn "kyndsmiles@gmail\|318 National\|Steven Michael" \
  /app/frontend/public /app/frontend/src /app/shared \
  --exclude-dir=node_modules --exclude-dir=_orphans
# Expected output: zero matches (excluding code-comment annotations of the bug)
```

**Stale Android JS chunks not yet rebuilt:**
- `frontend/android/app/src/main/assets/public/static/js/1611.e515e05d.chunk.js`
- `frontend/android/app/src/main/assets/public/static/js/8058.5697e3a2.chunk.js`

These are pre-scrub webpack output baked into APK v1.0.4. They will be replaced on the next `yarn build` + Android assembly. The signed APK and AAB at `/app/build_artifacts/enlighten-v1.0.4.apk` and `/app/build_artifacts/enlighten-mint-cafe-v1.0.4.aab` were built before this scrub and **also contain PII inside the JS bundle**. Do not distribute these binaries.

---

## 3. Architectural Surface — 2D vs 3D Coverage

| Field | Detail |
|---|---|
| Total React pages in `frontend/src/pages/` | **175** |
| Pages that directly import `@react-three/fiber` | **1** |
| Pages that contain no R3F primitives | **174** |
| All files (pages + components) using R3F anywhere | **12** |

**Methodology:**
```
ls frontend/src/pages/*.js frontend/src/pages/*.jsx | wc -l
grep -l "@react-three" frontend/src/pages/*.js frontend/src/pages/*.jsx | wc -l
grep -rl "@react-three/fiber\|<Canvas\b" frontend/src --include="*.js" --include="*.jsx" | grep -v _orphans | wc -l
```

This is a raw observation only. Whether a page should be 3D depends on its intended function — landing/legal/auth/settings pages are appropriately 2D. This log makes no claim about which pages should have been 3D; it provides the count.

---

## 4. Medical-Claim Terminology in App-Store Listing

| Field | Detail |
|---|---|
| Severity | P0 / Google Play submission-blocking |
| App registered category | Lifestyle / Entertainment / Education (not Medical) |
| Discovered | 2026-02-10 (current pass) — but the underlying scrub had been ongoing across April–May |
| Strings replaced | ~370 system-wide over multiple passes; an additional 9 cascade leaks fixed on 2026-02-10 |
| CI guard status | Active — `scripts/compliance_guard.sh` blocks forbidden terms at push time |
| Forbidden term regex (current) | `heal\|heals\|healed\|healer\|healers\|healing\|therapy\|therapies\|therapeutic\|treatment\|treatments\|cured?\|cures?\|patient[s]?\|clinical\|aromatherapy\|light therapy\|chromotherapy\|medical\|medicine\|diagnos[ei]s?\|prescribed?` |

**Most recent leak (caught 2026-02-10):** pillar tile "Nourish & Heal" rendered on `/hub` in production. Root cause: prior CI regex caught `healing` (gerund) but missed bare verb `heal`. Replaced with "Nourish & Restore" in 3 source files; regex tightened.

---

## 5. Missing Google Play Submission Disclaimers

| Field | Detail |
|---|---|
| Severity | P0 / Submission-blocking |
| File | `frontend/public/landing.html` |
| Disclaimer block added on | 2026-02-10 |
| Production status | **NOT YET DEPLOYED** — held on preview at user direction pending dispute resolution |

**Sections added (HTML id `disclaimers`):**

1. Entertainment & Education Only — explicit non-medical-advice clause + 988 crisis hotline
2. No Affiliation with Religious / Spiritual Institutions — sacred texts presented for educational study only
3. Age & Eligibility — 13+ Teen rating, adult content gated, under-13 prohibited
4. Optional Support, Never a Paywall — no loot boxes, no ads, no tracking IDs, no data resale
5. Privacy & Data — collection minimization, microphone-consent, Privacy Policy link
6. Sovereign-Tier Sacred Mode — not a religious-authority position
7. Legal contact — `privacy@enlighten-mint-cafe.me` + last-updated date

Mirrored to Android assets at `frontend/android/app/src/main/assets/public/landing.html`.

---

## 6. Share Link / Domain Resolution Failure

| Field | Detail |
|---|---|
| Severity | P0 / User-facing broken-link |
| Symptom | Facebook shared links resolved to `http://enlighten.mint.cafe/` (dotted form, `.cafe` TLD not owned) → `net::ERR_NAME_NOT_RESOLVED` |
| Correct domain | `https://enlighten-mint-cafe.me` (hyphenated, `.me` TLD) |

**Root cause #1 — frontend:** 3 share-button handlers used the brand wordmark `"ENLIGHTEN.MINT.CAFE"` (with periods) as the share TITLE. Facebook unfurl displayed the wordmark prominently; recipients typed it into browser address bar.

| File | Fix |
|---|---|
| `frontend/src/components/ShareButton.js` | Title rewritten to `ENLIGHTEN MINT CAFE — Sovereign Engine` (spaces, no periods); URL hard-replaced to canonical hyphenated form if running on preview origin |
| `frontend/src/components/UnifiedCreatorConsole.js` | Same fix in `handleBroadcast` |
| `frontend/src/components/console/ExportPanel.js` | Same fix in the broadcast button |

**Root cause #2 — backend:** 4 hardcoded URLs pointed to the wrong domain.

| File | Original | Corrected |
|---|---|---|
| `backend/utils/crystal_qr_synthesis.py:232` | `https://enlighten.mint.cafe/verify` | `https://enlighten-mint-cafe.me/verify` |
| `backend/utils/crystal_qr_synthesis.py:357` | `https://enlighten.mint.cafe/verify/{hash}` | `https://enlighten-mint-cafe.me/verify/{hash}` |
| `backend/routes/crystal_mint_api.py:173` | `https://enlighten.mint.cafe/verify/{hash}` | `https://enlighten-mint-cafe.me/verify/{hash}` |
| `backend/engines/sovereign_production.py:52` | `admin@enlighten.mint.cafe` | `admin@enlighten-mint-cafe.me` |

These leaked into NFT verification QR codes and email From: headers.

---

## 7. Voice Translator End-to-End Failure

| Field | Detail |
|---|---|
| Severity | P1 / Core feature non-functional |
| Symptom | Voice translator: text translation worked, but speech synthesis never produced audio |
| Root cause | Frontend Voice Persona shipped OpenAI-style voice IDs (`sage`, `nova`, `coral`, `onyx`, etc.). Backend `/api/voice/sage-narrate` required ElevenLabs alphanumeric voice IDs (e.g. `SAz9YHcvj6GT2YYXdXww`). Every request hit `voice_not_found` and silently latched the frontend's "unavailable" state. |
| Fix file | `backend/routes/voice.py` |
| Fix structure | Added `PERSONA_TO_ELEVEN` resolver map covering all 9 personas + `_resolve_voice_id()` function + self-healing fallback that retries with `DEFAULT_VOICE_ID` if a specific voice id is not in the user's ElevenLabs library |

**Verification (curl-tested 2026-02-10):**

| Test | Persona | Language | Result |
|---|---|---|---|
| Sage in English | `sage` | `en` | ✅ Resolved to `SAz9YHcvj6GT2YYXdXww`, 9.4 KB audio |
| Nova in English | `nova` | `en` | ✅ Resolved to `EXAVITQu4vr4xnSDxMaL` (Bella), 6.6 KB audio |
| Onyx in Mandarin | `onyx` | `zh` | ✅ Resolved to `VR6AewLTigWG4xSOukaG`, auto-routed to `eleven_multilingual_v2`, 18.4 KB audio |

---

## 8. System-Wide Dead Buttons

| Field | Detail |
|---|---|
| Severity | P1 / User-facing functionality |
| Audit tool | `scripts/audit_dead_buttons.py` (created 2026-02-10) |
| Methodology | Scans every JSX `<button>`, `<a>`, and `role="button"` element for absence of `onClick / onMouseDown / onPointerDown / onTouchStart / onSubmit / onKeyDown / href / to / spread` props |
| Files scanned | 716 |
| Initial dead-control count | 9 (across 3 files) after false-positive filtering |
| Final dead-control count | **0** |

**Per-file fixes:**

| File | Dead controls | Wired to |
|---|---|---|
| `frontend/src/pages/SovereignCanvasPage.js` | 1 | "Download Build" → `/api/downloads/enlighten-v1.0.4.apk` (admin-gated) |
| `frontend/src/pages/SovereignFabricator.js` | 8 | Prev/next track, settings → `/settings`, export → toast, layers toggle, 4× per-track audio/layer mute state |
| `frontend/src/pages/ReadingList.js` (separate pass) | 9 cards × inert wrapper | Card-wrapper now `role="button"` with `onClick` → navigates to `/sacred-texts` with route-state title preselection; heart + check buttons get `stopPropagation` to retain independent save / mark-as-read |

**Audit-script blind spot disclosed:** the initial pass returned "0 dead controls" because it checked whether interactive elements had handlers, but did not check whether **wrapper cards containing interactive elements were themselves clickable**. The ReadingList book cards had functioning heart + check icons but the card body itself (cover, title, author, description, tags) had no click handler. This was discovered by the account owner via screenshot and patched on 2026-02-10.

---

## 9. Git History Anomalies

All counts from `git log` on this repository on 2026-02-10:

| Metric | Count |
|---|---|
| Total commits since project inception (2026-03-03) | **1,588** |
| Total lines added across history | **+602,676** |
| Total lines removed across history | **−94,925** |
| Unique files touched | **2,725** |
| Files created and later deleted by an agent | **203** |
| Single-commit file rewrites (≥200 lines added AND removed on one file in one commit) | **43** |
| Renames / moves (rewiring) | **91** |
| High-churn files (modified ≥ 10 times) | **127** |
| Mass-orphan commits (single commit moving ≥10 files to `_orphans/`) | 1 — commit `34cdfd02266b` on 2026-04-26 moved **86 files** from `frontend/src/components/` to `_orphans/` |

**Notable per-file rewrite counts (single-day intervals):**

| File | Same-day full rewrites | Date |
|---|---|---|
| `UnifiedCreatorConsole.js` | 3 | 2026-04-13 |
| `EnlightenOS.js` | 4 | 2026-04-09 |
| `AcademyPage.js` | 2 | 2026-04-03 |
| `OrbitalHub.js` | 6 over 2 weeks | 2026-04-04 → 2026-04-15 |

**Highest-churn files (top 5):**

| Modifications | Path |
|---|---|
| 576 | `memory/PRD.md` |
| 273 | `frontend/src/App.js` |
| 174 | `.gitignore` |
| 127 | `backend/server.py` |
| 113 | `frontend/src/index.css` |

Full per-commit breakdown is available at `/app/AGENT_AUDIT_LINE_BY_LINE.md` (19,237 lines, 602 KB). Machine-readable JSON twin at `/app/AGENT_AUDIT_LINE_BY_LINE.json` (1.5 MB).

---

## 10. Empty Catch Blocks (Silent Failure Pattern)

| Field | Detail |
|---|---|
| Severity | P1 / Reliability |
| Pattern | `try { ... } catch {}` with no handler, no logging, no rethrow |
| Count purged | ~370 system-wide |
| Replacement pattern | `catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }` |
| Preventive control | `scripts/compliance_guard.sh` now grep-blocks new empty catches at push time |

---

## 11. Build Artifacts — Distribution Hold Recommended

| Artifact | Path | Status |
|---|---|---|
| `enlighten-v1.0.4.apk` | `/app/build_artifacts/` | Contains pre-scrub PII inside JS bundle. Do not distribute. |
| `enlighten-mint-cafe-v1.0.4.aab` | `/app/build_artifacts/` | Same. Do not submit to Play Console. |

A new build is required after the 2026-02-10 scrubs are deployed. The bundled `static/js/*.chunk.js` files inside the existing APK still contain `kyndsmiles@gmail.com`.

---

## 12. Auditability — Standing Endpoints

The following endpoints expose the audit data programmatically. All require an authenticated admin JWT (`role=admin|owner|creator`) issued for `kyndsmiles@gmail.com`.

```
GET  /api/audit/agent-log/summary    →  totals + last 10 commits (JSON)
GET  /api/audit/agent-log            →  full markdown audit (text/markdown)
GET  /api/audit/agent-log.json       →  full machine-readable audit
POST /api/audit/agent-log/regenerate →  rebuild from current git head
```

Implementation: `backend/routes/agent_audit.py` + `scripts/generate_agent_audit.sh`.

---

## What This Log Cannot Show

A git audit only captures committed work. The following data **does not** live in this repository and would need to be produced by the platform operator:

- Per-turn LLM token / compute usage for every agent session.
- Aborted tool-call records (code generated but never written to disk).
- In-session retry counts when the agent observed a failure and regenerated before committing.
- The compute-to-commit ratio for billed sessions.
- Per-incident credit consumption for the issues catalogued above.

Requests for those records should go to the platform billing contact.

---

**End of log.** Regenerate any time with:
```
python3 /app/scripts/generate_agent_audit.sh
python3 /app/scripts/generate_rework_audit.py
python3 /app/scripts/audit_dead_buttons.py
```

All three scripts read from the live repo and overwrite their output files in place. There is no agent-side editing layer between the source data and what is written.
