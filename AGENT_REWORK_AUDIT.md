# AGENT REWORK / FAILURE AUDIT — ENLIGHTEN.MINT.CAFE

**Generated:** 2026-05-10T08:58:23.099123Z  
**Source:** git log mined from /app

This is the audit of every agent **mistake, deletion, rewrite, rewire,**
and **named incident** across the project history. Generated directly from
git — there is no agent-side filtering between git's record and what you read.

---

## TL;DR — failure metrics

- **203** files created by an agent and later DELETED (abandoned work)
- **43** single-commit FILE REWRITES (>= 200 lines added AND removed in one commit)
- **91** RENAMES / MOVES (rewiring)
- **127** HIGH-CHURN files (modified ≥ 10 times)
- **0** explicit REVERT / ROLLBACK commits
- **7** named INCIDENTS (security + compliance + UX)

---

## 1. NAMED INCIDENTS (highest-severity failures)

### 1. Keystore credentials exposed on public /launch.html
- **Category:** Security
- **Severity:** P0 / Critical
- **Discovered:** 2026-05-10
- **Root cause:** Earlier agent embedded the upload-key alias and password directly into the public Vault HTML page so the architect could grab the APK. The file shipped to production unredacted.
- **Remediation:** Locked /launch.html down to a 26-line restricted notice; moved keystore to /app/.private/; gated /api/downloads/* via admin role check in deps.py.
- **Preventive control:** Pre-push CI guard now blocks any keystore filename pattern in public dirs.
- **Fix commits:** `11f147102e43`, `a3102eb0f0ad`, `f6d0c7a49095`

### 2. Medical-claim terminology leaks across 100+ render strings
- **Category:** Play Store / Legal Compliance
- **Severity:** P0 / App-Store-Blocking
- **Discovered:** Ongoing through 2026-02 to 2026-05
- **Root cause:** Earlier agents used wellness/clinical vocabulary ('Healing', 'Therapy', 'Treatment', 'Patient', 'Medical') in user-visible strings. The product is registered as Lifestyle / Entertainment / Education and cannot use medical claims.
- **Remediation:** System-wide scrub: 370+ render strings replaced with 'Resonance / Alignment / Resonant Arts / Restore' equivalents. Backend boundary translator added at /app/backend/utils/compliance_labels.py.
- **Preventive control:** /app/scripts/compliance_guard.sh + /app/scripts/pre-push.sh now grep render-path JSX for forbidden terms; pushes are blocked on hit.

### 3. ~370 empty catch blocks (silent failures swallowing real bugs)
- **Category:** Code Quality / Reliability
- **Severity:** P1
- **Discovered:** 2026-04-2026-05
- **Root cause:** Earlier agents wrote 'try { ... } catch {}' across the React codebase to silence linter warnings. Real runtime errors (voice-engine crashes, navigation failures) were being eaten silently — user reported them as 'broken' without console traces.
- **Remediation:** Sweeping replacement: empty catches converted to 'catch (e) { if (process.env.NODE_ENV !== "production") console.warn(e); }'. Annotated /* SSR-safe */ exemptions where genuine.
- **Preventive control:** compliance_guard.sh now grep-blocks new empty catches.

### 4. Hardcoded setTimeout delays causing 'Double-Click' UI latency
- **Category:** UX Performance
- **Severity:** P1
- **Discovered:** 2026-05
- **Root cause:** Earlier agents inserted 100-500ms setTimeout delays around route navigation 'for animation polish' which made every tap feel like it required two clicks before the user got feedback.
- **Remediation:** All non-essential setTimeout-wrapped navigations stripped. Routes now respond synchronously.

### 5. Workshop modules rendered 'undefined' for Brunton Compass / Seismograph and others
- **Category:** Data / API
- **Severity:** P1
- **Discovered:** 2026-05
- **Root cause:** Workshop tool records had blank `technique` / `description` fields; the React render path printed the literal JS undefined value to screen.
- **Remediation:** All workshop tool records backfilled. Integration test test_compliance_serialization.py now asserts no 'undefined' string can leak from /api/workshop/*.

### 6. ElevenLabs voice stuck in 'Voice Resting' state with no retry path
- **Category:** Integration / UX
- **Severity:** P1
- **Discovered:** 2026-05
- **Root cause:** When the ElevenLabs key was missing or rate-limited, the React state set 'Voice Resting' but never offered a retry. User was permanently locked out of voice narration mid-scene.
- **Remediation:** Tap-to-retry logic added in SageVoiceController.js so the user can re-attempt voice generation without reloading the route.

### 7. 'Nourish & Heal' pillar tile shipped despite the V1.2.4 compliance guard
- **Category:** Compliance Regression
- **Severity:** P0 / User-Visible
- **Discovered:** 2026-02-10 (this session)
- **Root cause:** The previous CI regex caught 'healing' (gerund) but missed the bare verb 'heal'. Three frontend strings slipped past the gate.
- **Remediation:** Replaced with 'Nourish & Restore'. Tightened compliance regex to include heal/heals/healed/healer + therapy/therapeutic + treatment + medical/medicine + diagnosis + prescribed.
- **Fix commits:** `1b89b7f63ad3`

---

## 2. DELETIONS — 203 files created and later deleted

Each row is wasted work: an agent added the file, later realized it was wrong, deleted it.

| Deleted | Created | Path | Subject |
|---|---|---|---|
| 2026-04-29 `31e0a2a4815f` | 2026-04-20 `8c21ac585b2b` | `build_artifacts/KEYSTORE_FINGERPRINTS.txt` | auto-commit for 77fb86cb-f55c-4251-bb2f-ad4c12f5b079 |
| 2026-04-29 `31e0a2a4815f` | 2026-04-20 `8c21ac585b2b` | `build_artifacts/enlighten-mint-cafe-UPLOAD-KEY.keystore` | auto-commit for 77fb86cb-f55c-4251-bb2f-ad4c12f5b079 |
| 2026-04-29 `31e0a2a4815f` | 2026-04-20 `8c21ac585b2b` | `frontend/android/infinity-sovereign.keystore.legacy` | auto-commit for 77fb86cb-f55c-4251-bb2f-ad4c12f5b079 |
| 2026-04-29 `31e0a2a4815f` | 2026-04-13 `478cba3c92de` | `twa/enlighten.keystore` | auto-commit for 77fb86cb-f55c-4251-bb2f-ad4c12f5b079 |
| 2026-04-27 `0a54c4920c6d` | 2026-04-17 `64c7a282c43a` | `frontend/public/docs/ARCHITECTURE.txt` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-17 `64c7a282c43a` | `frontend/public/docs/DEMO_SCRIPT.txt` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-17 `64c7a282c43a` | `frontend/public/docs/README.txt` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-17 `64c7a282c43a` | `frontend/public/docs/master-print.txt` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/01_landing.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/02_auth.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/03_sovereign_hub.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/04_zen_garden.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/05_breathing.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/06_meditation.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/07_journal.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/08_coach.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/09_reflexology.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/10_herbology.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/11_aromatherapy.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/12_crystals.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/13_oracle.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/14_sacred_texts.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/15_encyclopedia.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/16_numerology.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/17_yoga.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/18_mudras.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/19_mantras.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/20_elixirs.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/21_acupressure.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/22_dreams.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/23_soundscapes.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/24_cosmic_calendar.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/25_forecasts.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/26_trade_circle.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/27_sage_advisors.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/28_membership.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/29_settings.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/30_profile.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/A1_lantern_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/A2_lantern_typed.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/A3_lantern_released.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/B1_plant_garden.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/B2_koi_pond.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/B3_sand_drawing.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/B4_rain_scene.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D10_out.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D11_me.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D1_orbit.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D2_mix.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D3_culture.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D4_audio.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D5_text.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D6_layer.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D7_rec.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D8_fx.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/D9_ai.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/index.html` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `1401d6c3948f` | `frontend/public/proof/manifest.json` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/01_auth_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/02_auth_filled.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/03_after_login.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/04_breathing_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/05_breathing_after.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/06_oracle_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/07_oracle_after.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/08_journal_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/09_journal_typed.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/10_journal_saved.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/11_herbology_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/12_herbology_detail.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/13_crystals_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/14_crystals_after.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/15_reflexology_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/16_reflexology_after.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/17_coach_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/20_trade_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/21_lantern_before.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/22_lantern_typed.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/23_lantern_released.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/24_profile_loaded.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/25_dock_idle.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/26_dock_mix_open.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/27_dock_audio_open.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/28_dock_me_open.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `539ef3ff3aff` | `frontend/public/proof2/C1_culture_panel.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `539ef3ff3aff` | `frontend/public/proof2/C2_clapstick_active.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `539ef3ff3aff` | `frontend/public/proof2/C3_two_layers_active.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `539ef3ff3aff` | `frontend/public/proof2/C4_three_layers_active.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `539ef3ff3aff` | `frontend/public/proof2/C5_volume_changed.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `539ef3ff3aff` | `frontend/public/proof2/C6_cleared.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `34cdfd02266b` | `frontend/public/proof2/F1_creator_dashboard.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `34cdfd02266b` | `frontend/public/proof2/F2_creator_export_clicked.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `34cdfd02266b` | `frontend/public/proof2/F3_profile_editing.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `34cdfd02266b` | `frontend/public/proof2/F4_profile_picker_scrolled.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G10_tesseract.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G11_dimensional_space.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G12_multiverse_map.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G1_realms_gallery.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G2_rpg_character.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G3_starseed_adventure.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G4_starseed_worlds.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G5_multiverse_realms.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G6_dream_realms.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G7_cryptic_quest.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G8_games.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `ab8522962ad2` | `frontend/public/proof2/G9_observatory.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN10_vr_index.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN11_sovereign_fabricator.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN12_sovereign_canvas.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN13_sovereign_lab.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN14_sovereign_architecture.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN1_avatar_creator.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN2_spiritual_avatar.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN3_avatar_gallery.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN4_creation_stories.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN5_videos.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN6_dreams_visualizer.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN7_daily_briefing.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN8_forecasts.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `f450e63bee14` | `frontend/public/proof2/GEN9_cosmic_profile.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `452c9b3184d7` | `frontend/public/proof2/M4_props_inside_chamber.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `e02bca889949` | `frontend/public/proof2/PSS1_idle_lattice_with_pill.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `e02bca889949` | `frontend/public/proof2/PSS2_pulled_avatar_gen.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `4b6412ad8ada` | `frontend/public/proof2/Q01_quests_hub.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `4b6412ad8ada` | `frontend/public/proof2/Q02_quest_expanded.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `4b6412ad8ada` | `frontend/public/proof2/Q03_navigated_to_breathing.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `85d3dc27a6c2` | `frontend/public/proof2/RF4_hub_default_levels.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `85d3dc27a6c2` | `frontend/public/proof2/RF5_PRA_only_violet.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `85d3dc27a6c2` | `frontend/public/proof2/RF6_BOD_only_orange.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `85d3dc27a6c2` | `frontend/public/proof2/RF7_all_maxed.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `7456c8780bb5` | `frontend/public/proof2/T1_tesseract_mobile_fixed.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `7456c8780bb5` | `frontend/public/proof2/T4_audio_reactive_pulse.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-27 `74ad75d7d920` | `frontend/public/proof2/UN2_starseed_unlocked_owner.jpeg` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/index.html` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-26 `491361ab3f06` | `frontend/public/proof2/manifest.json` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-15 `04e90d6243d0` | `frontend/public/qr-code.png` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-15 `fa7d4a64a703` | `frontend/public/showcase.mp4` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-27 `0a54c4920c6d` | 2026-04-15 `fa7d4a64a703` | `frontend/public/showcase.webm` | auto-commit for 9718b755-80e4-42e3-b12a-e2597d4172be |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `8c21ac585b2b` | `build_artifacts/enlighten-mint-cafe-v1.0.0.aab` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `763636743ee6` | `build_artifacts/enlighten-mint-cafe-v1.0.1.aab` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/enlighten-mint-cafe-v1.0.2.aab` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-21 `d4d8febaad5e` | `build_artifacts/enlighten-mint-cafe-v1.0.3.aab` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `d91dbc06b513` | `build_artifacts/enlighten-v1.0.1.apk` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `d91dbc06b513` | `build_artifacts/enlighten-v1.0.1.apks` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/enlighten-v1.0.2.apk` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/enlighten-v1.0.2.apks` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-21 `d4d8febaad5e` | `build_artifacts/enlighten-v1.0.3.apk` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-21 `d4d8febaad5e` | `build_artifacts/enlighten-v1.0.3.apks` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/test_shots/01_sovereign_hub.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/test_shots/02_orbital_hub_before.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/test_shots/02_orbital_hub_fixed.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/test_shots/03_cosmic_mixer.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-20 `e170a23dec34` | `build_artifacts/test_shots/04_rock_hounding.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-21 `d4d8febaad5e` | `build_artifacts/test_shots/05_reflexology_study.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-25 `ffe61d3b9edf` | 2026-04-21 `d4d8febaad5e` | `build_artifacts/test_shots/06_reflexology_locate.jpeg` | auto-commit for e3dbe73e-bb4c-40a9-95b6-80493a50350f |
| 2026-04-22 `cb4e3e183a63` | 2026-04-22 `0e106e4e3224` | `backend/routes/buy_time.py` | auto-commit for 3aa8b349-260c-42ae-bf93-37aea52e583b |
| 2026-04-19 `c89ca3655d3e` | 2026-03-30 `4854131bbe0d` | `frontend/public/icon-512.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-07 `2694ef56e089` | `frontend/public/images/hero-bridge.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-09 `d09c61ab3bfb` | `frontend/public/sovereign-grid.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-09 `d09c61ab3bfb` | `frontend/public/sovereign-processor.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-09 `d09c61ab3bfb` | `frontend/public/sovereign-trademark.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-18 `90b6602b4d72` | `frontend/public/store-assets/_captures/cap_dome.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-18 `90b6602b4d72` | `frontend/public/store-assets/_captures/cap_dream.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-18 `90b6602b4d72` | `frontend/public/store-assets/_captures/cap_evolution.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-18 `90b6602b4d72` | `frontend/public/store-assets/_captures/cap_hub.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-18 `90b6602b4d72` | `frontend/public/store-assets/_captures/cap_hub2.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-18 `90b6602b4d72` | `frontend/public/store-assets/_captures/cap_tesseract.png` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-10 `5224fc67ea3a` | `frontend/src/components/AcademyPortal.js` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-10 `18bd6f0bb7cd` | `frontend/src/components/CircularProtocol.js` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-10 `8553b34588dd` | `frontend/src/utils/BiometricSync.js` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-19 `c89ca3655d3e` | 2026-04-10 `8553b34588dd` | `frontend/src/utils/OmnisExecution.js` | auto-commit for afed3034-fb51-4f17-aee8-e549270a6fed |
| 2026-04-18 `75c9f3e1b19e` | 2026-04-18 `e3c823cc0ea6` | `frontend/public/store-assets/icon-1024-source.png` | auto-commit for e1777515-6e5e-497b-9d78-78bbebbf2c34 |
| 2026-04-18 `75c9f3e1b19e` | 2026-04-18 `e3c823cc0ea6` | `frontend/public/store-assets/splash-source.png` | auto-commit for e1777515-6e5e-497b-9d78-78bbebbf2c34 |
| 2026-04-18 `75c9f3e1b19e` | 2026-04-18 `e3c823cc0ea6` | `frontend/public/store-assets/tile-source.png` | auto-commit for e1777515-6e5e-497b-9d78-78bbebbf2c34 |
| 2026-04-18 `cec00c4e0abd` | 2026-04-18 `1b267ed5e8cb` | `frontend/src/components/JourneyTrail.js` | auto-commit for 0f6089ae-d786-4ec4-aaff-b6e4a3f8b0c9 |
| 2026-04-18 `cec00c4e0abd` | 2026-04-18 `1b267ed5e8cb` | `frontend/src/context/JourneyContext.js` | auto-commit for 0f6089ae-d786-4ec4-aaff-b6e4a3f8b0c9 |
| 2026-04-18 `64f19fd615a5` | 2026-04-17 `6121c31df9f9` | `generate-store-assets.js` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/01_obsidian_void_awakening.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `f438ccd07b5f` | `promo_videos/02_crystal_rainbow_refraction.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `f438ccd07b5f` | `promo_videos/03_digital_oracle_interface.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/04_wellness_transformation.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/05_mobile_sanctuary_reveal.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/06_immersive_experience.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/08_brand_finale.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/balance_test.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `227b15c217bb` | `promo_videos/demo_enlighten_cafe.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/enlighten_cafe_promo_84s.mp4` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `b39be5f3ca0b` | `promo_videos/filelist.txt` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-18 `64f19fd615a5` | 2026-04-09 `f438ccd07b5f` | `promo_videos/generation_log.txt` | auto-commit for 37a0252a-3059-49f5-a7ea-8f6143ef254f |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `ccca3223284f` | `frontend/src/pages/BibleStudyWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `9d16d8db0630` | `frontend/src/pages/CarpentryWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `62cf66b26c35` | `frontend/src/pages/ChildCareWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `62cf66b26c35` | `frontend/src/pages/ElderCareWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `ccca3223284f` | `frontend/src/pages/ElectricalWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `ccca3223284f` | `frontend/src/pages/LandscapingWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `c3f561bdd8c8` | `frontend/src/pages/MasonryWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `ccca3223284f` | `frontend/src/pages/NursingWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-17 `cda1b01d26d2` | 2026-04-17 `ccca3223284f` | `frontend/src/pages/PlumbingWorkbench.js` | auto-commit for deb6779a-d01f-47cd-b59c-b907ff363325 |
| 2026-04-08 `703c0c523edc` | 2026-04-08 `0cd3e428cba7` | `frontend/public/images/trademark-banner.png` | auto-commit for 8ab97f60-801a-425e-9096-8ac66cd112a2 |
| 2026-04-08 `703c0c523edc` | 2026-04-08 `b840be760c04` | `frontend/src/components/RainbowTrademarkBanner.js` | auto-commit for 8ab97f60-801a-425e-9096-8ac66cd112a2 |
| 2026-03-30 `4854131bbe0d` | 2026-03-27 `9ff642456081` | `frontend/src/components/BackToTop.js` | auto-commit for d1b74062-58d9-44fc-aca4-f38065a58f4e |
| 2026-03-30 `4854131bbe0d` | 2026-03-30 `1c323d4dcf82` | `frontend/src/components/QuickMeditateFAB.js` | auto-commit for d1b74062-58d9-44fc-aca4-f38065a58f4e |
| 2026-03-30 `4854131bbe0d` | 2026-03-30 `61599beb291b` | `frontend/src/components/VoiceCommandButton.js` | auto-commit for d1b74062-58d9-44fc-aca4-f38065a58f4e |

---

## 3. SINGLE-COMMIT REWRITES — 43 files redone whole

Each row is one file in one commit where the agent added ≥ 200 lines AND removed ≥ 200 lines simultaneously — i.e. a full overwrite, the previous version thrown away.

| Date | SHA | Path | Lines +/− | Subject |
|---|---|---|---|---|
| 2026-04-21 | `c3920ef09a1d` | `frontend/public/landing.html` | +206/−234 | auto-commit for 5ed44359-58fb-4496-b0b4-4850615bd9 |
| 2026-04-16 | `bce58e1880f1` | `frontend/src/components/InteractiveModule.js` | +511/−264 | auto-commit for d23ee077-eaf0-403c-8da8-19f3f46f99 |
| 2026-04-15 | `e204e8d65c6a` | `frontend/src/pages/Observatory.js` | +387/−292 | auto-commit for cc642beb-0a7c-4383-aa62-f22c8f4a36 |
| 2026-04-13 | `22ae20b11661` | `frontend/src/components/UnifiedCreatorConsole.js` | +481/−486 | auto-commit for d8ebe929-c061-4784-bf22-2fde81c5a8 |
| 2026-04-13 | `34f65293e826` | `frontend/src/components/UnifiedCreatorConsole.js` | +351/−280 | auto-commit for 99073166-ac32-4eac-a76c-11c61240c7 |
| 2026-04-13 | `480c4f48051a` | `frontend/src/components/UnifiedCreatorConsole.js` | +417/−379 | auto-commit for 9594db2c-449d-443e-a47d-b38ef5922a |
| 2026-04-10 | `cfa3615e72ac` | `frontend/src/pages/OrbitalHub.js` | +429/−288 | auto-commit for 55f23cf5-3d9d-4476-880f-257a2b9b30 |
| 2026-04-10 | `caa7fa645cc3` | `frontend/src/pages/OrbitalHub.js` | +729/−401 | auto-commit for 90a73bcc-0fa4-4015-b637-a1635e1dc0 |
| 2026-04-10 | `2dc4e61bf4b8` | `frontend/src/pages/OrbitalHub.js` | +283/−285 | auto-commit for 42fe7c7b-9b1f-43d2-bd7a-2005318125 |
| 2026-04-09 | `0f65820959c7` | `frontend/src/pages/OrbitalHub.js` | +280/−752 | auto-commit for b6368f75-6c32-4808-a5ed-c1f2c08da7 |
| 2026-04-09 | `66a4a19718e4` | `frontend/src/utils/EnlightenOS.js` | +229/−246 | auto-commit for e41062a0-c611-480f-a166-ade42ea085 |
| 2026-04-09 | `34582f343283` | `frontend/src/utils/EnlightenOS.js` | +219/−292 | auto-commit for 744b25c9-8440-49f7-a9fc-77fb8aea88 |
| 2026-04-09 | `59bcbcfbbd3e` | `frontend/src/utils/EnlightenOS.js` | +599/−920 | auto-commit for 9cfdac69-0f07-4538-9594-c2a2595657 |
| 2026-04-09 | `173a3e39eea9` | `frontend/src/utils/EnlightenOS.js` | +517/−228 | auto-commit for 6d32e68a-eb85-4c8d-8c66-29516c89fa |
| 2026-04-05 | `63825ce3cd2d` | `frontend/src/pages/EnlightenMintHub.js` | +409/−430 | auto-commit for 3b7427a7-feaa-4a97-bc76-090918a860 |
| 2026-04-05 | `4ae29f4a1cfc` | `frontend/src/pages/CelestialDome.js` | +518/−213 | auto-commit for eda2e8df-4644-42dd-9f1a-9fe006a391 |
| 2026-04-04 | `ebab97ce0ce5` | `frontend/src/components/TieredNavigation.js` | +399/−318 | auto-commit for 3085bac6-bc7a-4a8b-8284-2b67eb2cd8 |
| 2026-04-04 | `b855a8a5305f` | `frontend/src/pages/OrbitalHub.js` | +532/−331 | auto-commit for 918c175b-816f-46ad-9925-573664d7fc |
| 2026-04-04 | `7ce13906876a` | `frontend/src/pages/OrbitalHub.js` | +276/−211 | auto-commit for 853e60cd-a293-4252-ab76-47f06e3294 |
| 2026-04-03 | `2cfa06c2231e` | `backend/routes/sovereigns.py` | +447/−329 | auto-commit for 2f9eac82-6065-4c08-a11a-428b1e6c66 |
| 2026-04-03 | `43b02bfe25d8` | `frontend/src/pages/SovereignAdvisors.js` | +395/−251 | auto-commit for f34c0b0f-60eb-4ee5-bd2c-337afb2752 |
| 2026-04-03 | `55f85e9d4c7c` | `frontend/src/pages/AcademyPage.js` | +338/−478 | auto-commit for 88b45553-fe6e-4b59-98ca-12dd90ac7d |
| 2026-04-03 | `3d574fc420e8` | `frontend/src/pages/AcademyPage.js` | +906/−357 | auto-commit for a4a8b030-46d6-4806-874a-1bb2a9c175 |
| 2026-04-02 | `95a1238f7d43` | `frontend/src/pages/SuanpanMixer.js` | +530/−432 | auto-commit for 029eeed8-b15a-47ef-8ccf-ad6eb50840 |
| 2026-04-02 | `674ba810c7f8` | `frontend/src/pages/SuanpanMixer.js` | +701/−590 | auto-commit for 2a968f42-b8a1-4e22-8e88-76f8967833 |
| 2026-04-02 | `0e7266ce1e72` | `frontend/src/pages/OrbitalHub.js` | +341/−282 | auto-commit for 8b1ce2a8-eee1-499f-92b8-7b0d282752 |
| 2026-04-02 | `e393a0bdf339` | `backend/tests/test_iteration189_power_spots_celestial.py` | +426/−312 | auto-commit for 6d53d7ef-d23e-4b86-8f10-319b74a33d |
| 2026-04-02 | `d7ac46322e27` | `frontend/src/pages/CosmicMap.js` | +382/−218 | auto-commit for f7900bf7-7f96-4c04-b2ba-9cc403fcd9 |
| 2026-04-02 | `ff0322190aa1` | `frontend/src/pages/MasteryAvenues.js` | +561/−240 | auto-commit for a39ebdc1-195b-4629-a8d1-d262a5849b |
| 2026-04-01 | `faf38fbbc0bd` | `frontend/src/pages/DreamRealms.js` | +355/−520 | auto-commit for 89bdc8d0-4cbb-40f3-8617-2d95d5ff5d |
| 2026-03-30 | `3ff14f49a27f` | `frontend/src/components/SmartDock.js` | +293/−295 | auto-commit for 2f62246d-e118-49b8-9980-e6206e0777 |
| 2026-03-30 | `b0f0a4ec2671` | `frontend/src/components/CosmicMixer.js` | +329/−214 | auto-commit for ef3e31b1-f0ad-4b53-a60f-58d531d1c4 |
| 2026-03-29 | `30f048dc7acf` | `frontend/src/pages/LiveRoom.js` | +601/−242 | auto-commit for bb77ea22-f254-4c99-b622-46a5a9969f |
| 2026-03-29 | `1c1846935170` | `frontend/src/pages/CreatorDashboard.js` | +433/−217 | auto-commit for d2b5e162-315a-499e-b0b2-4e5c3db2a5 |
| 2026-03-29 | `0cba7ad2cf5b` | `frontend/src/pages/Dashboard.js` | +647/−412 | auto-commit for 9511d59f-e5f1-412f-ab4b-5509f278e2 |
| 2026-03-29 | `5aef43010138` | `frontend/src/pages/Crystals.js` | +576/−274 | auto-commit for 2dfad2ac-adef-4bd5-a6ea-864274db1c |
| 2026-03-29 | `5aef43010138` | `frontend/src/pages/Encyclopedia.js` | +466/−234 | auto-commit for 2dfad2ac-adef-4bd5-a6ea-864274db1c |
| 2026-03-29 | `7f9b1792b54a` | `frontend/src/pages/CreationStories.js` | +765/−471 | auto-commit for 54c186ec-6064-4485-825b-ac962cd9cf |
| 2026-03-29 | `1e33d563fb13` | `frontend/src/components/GuidedTour.js` | +326/−230 | auto-commit for 76142348-16aa-4df3-a5d1-dc0e84fe92 |
| 2026-03-27 | `e81ed5100f2f` | `frontend/src/components/Navigation.js` | +450/−252 | auto-commit for a3c38845-9de0-4b7f-874c-3f0d77475d |
| 2026-03-26 | `94175be4c965` | `frontend/src/pages/StarChart.js` | +354/−348 | auto-commit for afb072ef-4a8f-464b-a09b-88501fedf5 |
| 2026-03-25 | `1a35b2527767` | `frontend/src/pages/ZenGarden.js` | +556/−276 | auto-commit for 7ea7ee40-16ad-448b-b4a7-9a5cc97040 |
| 2026-03-25 | `08108741db83` | `frontend/src/pages/Meditation.js` | +489/−252 | auto-commit for ba8788f2-29bd-46d6-8703-33ed25d8a0 |

---

## 4. RENAMES / MOVES — 91 files rewired

| Date | SHA | Rename | Similarity |
|---|---|---|---|
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ApexCreatorConsole.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CinematicWalkthrough.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CommandMode.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ConstellationMap.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CosmicAssistant.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CosmicBackground.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CosmicToolbar.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CreatorMixer.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CreatorMixerUI.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CrystalRadianceVisualizer.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/CrystalResonancePanel.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/DeepDataNode.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/DeepDiveSearch.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/DirectorTimeline.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/EconomyPortal.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ElasticNodule.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/EmergencyShutOff.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/EtherNode.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ExpandableInfoCard.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/FloatingAssistant.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/GlobalNodalMap.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/GlowPortal.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/GrandFinaleCoordinator.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/HTTPSHub.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/HarmonicStatus.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/IntroVideo.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/LearningToggle.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/MarketplaceGallery.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/MeshCanvasRenderer.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/MixerV27.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/OrbCorner.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/OrbitalNavigation.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/PaymentGate.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/PersistentWaveform.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/PerspectiveToggle.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/PulseEchoVisualizer.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/QuestHUD.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/QuickMeditationWidget.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/RefractionButton.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/SageAudience.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/SageAvatar.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ShambhalaCrystalSystem.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ShambhalaFrontSide.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/Skeletons.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/SovereignHUD.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/SovereignUI.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/SpatialRecorder.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/TieredAccess.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/TieredNavigation.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/TrialGraduation.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/UniversalCommand.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/VellumOverlay.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/VisualFilters.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ZeroPointExperience.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/orbital/ActiveSatellite.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/orbital/CentralOrb.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/orbital/ConnectionLines.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/orbital/GravityField.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/orbital/SatelliteInspector.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/orbital/WeatherRibbon.js` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/accordion.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/alert-dialog.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/aspect-ratio.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/badge.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/breadcrumb.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/carousel.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/collapsible.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/context-menu.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/drawer.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/dropdown-menu.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/hover-card.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/input-otp.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/menubar.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/navigation-menu.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/pagination.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/popover.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/radio-group.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/resizable.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/scroll-area.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/sheet.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/switch.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/tabs.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/textarea.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/toaster.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/toggle-group.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/ui/tooltip.jsx` | 100% |
| 2026-04-26 | `34cdfd02266b` | `{frontend/src => _orphans/frontend}/components/workshop/WorkshopGameStage.js` | 100% |
| 2026-04-20 | `8c21ac585b2b` | `frontend/android/app/src/androidTest/java/{com/getcapacitor/myapp => cafe/mint/enlighten}/ExampleInstrumentedTest.java` | 78% |
| 2026-04-20 | `8c21ac585b2b` | `frontend/android/app/src/main/java/{com/cosmiccollective/app => cafe/mint/enlighten}/MainActivity.java` | 73% |
| 2026-04-20 | `8c21ac585b2b` | `frontend/android/app/src/test/java/{com/getcapacitor/myapp => cafe/mint/enlighten}/ExampleUnitTest.java` | 91% |
| 2026-04-20 | `8c21ac585b2b` | `frontend/android/{infinity-sovereign.keystore => infinity-sovereign.keystore.legacy}` | 100% |

---

## 5. HIGH-CHURN FILES — modified ≥ 10 times

These files were rebuilt repeatedly. High churn often signals the agent never found the right shape on the first try.

| Modifications | Path |
|---|---|
| 576 | `memory/PRD.md` |
| 273 | `frontend/src/App.js` |
| 174 | `.gitignore` |
| 127 | `backend/server.py` |
| 113 | `frontend/src/index.css` |
| 90 | `frontend/src/pages/SovereignHub.js` |
| 77 | `frontend/src/components/Navigation.js` |
| 69 | `frontend/src/pages/Landing.js` |
| 67 | `frontend/src/pages/Dashboard.js` |
| 44 | `frontend/src/pages/OrbitalHub.js` |
| 40 | `frontend/src/components/SmartDock.js` |
| 40 | `frontend/src/components/UnifiedCreatorConsole.js` |
| 37 | `frontend/src/pages/Meditation.js` |
| 34 | `frontend/src/pages/StarChart.js` |
| 28 | `frontend/src/components/CosmicMixer.js` |
| 27 | `frontend/public/index.html` |
| 25 | `frontend/src/pages/CosmicMixerPage.js` |
| 23 | `frontend/src/pages/TesseractExperience.js` |
| 22 | `frontend/src/pages/Settings.js` |
| 22 | `frontend/src/pages/TradeCircle.js` |
| 21 | `frontend/src/pages/Breathing.js` |
| 21 | `frontend/src/pages/StarseedAdventure.js` |
| 20 | `frontend/src/pages/Oracle.js` |
| 20 | `frontend/src/pages/RPGPage.js` |
| 20 | `frontend/src/pages/FractalEngine.js` |
| 20 | `frontend/src/styles/VoidShield.css` |
| 19 | `frontend/src/pages/SuanpanMixer.js` |
| 19 | `frontend/src/pages/VirtualReality.js` |
| 19 | `frontend/src/state/ProcessorState.js` |
| 19 | `frontend/src/components/BackToHub.js` |
| 19 | `frontend/src/pages/Frequencies.js` |
| 19 | `backend/routes/omnis_nodule.py` |
| 18 | `memory/test_credentials.md` |
| 18 | `frontend/src/components/EmergencyShutOff.js` |
| 17 | `frontend/src/components/InteractiveModule.js` |
| 17 | `frontend/src/pages/Herbology.js` |
| 17 | `frontend/package.json` |
| 17 | `frontend/public/AppController.js` |
| 16 | `frontend/src/pages/Affirmations.js` |
| 16 | `frontend/src/pages/Pricing.js` |
| 16 | `frontend/src/pages/ProfilePage.js` |
| 16 | `backend/routes/ai_visuals.py` |
| 16 | `frontend/src/components/SpatialRoom.js` |
| 16 | `frontend/src/pages/Observatory.js` |
| 15 | `backend/routes/rpg.py` |
| 15 | `frontend/src/pages/AcademyPage.js` |
| 15 | `frontend/src/pages/Soundscapes.js` |
| 15 | `frontend/src/pages/Videos.js` |
| 15 | `frontend/src/components/GuidedTour.js` |
| 15 | `frontend/src/pages/Crystals.js` |
| 15 | `frontend/src/pages/Mudras.js` |
| 14 | `frontend/src/pages/Journey.js` |
| 14 | `frontend/src/components/UniversalWorkshop.js` |
| 14 | `frontend/src/context/MixerContext.js` |
| 14 | `frontend/src/context/SensoryContext.js` |
| 14 | `frontend/src/pages/Forecasts.js` |
| 14 | `frontend/src/pages/Hooponopono.js` |
| 14 | `frontend/src/pages/LightTherapy.js` |
| 14 | `frontend/src/pages/LiveRoom.js` |
| 14 | `frontend/src/pages/Mantras.js` |
| 14 | `frontend/src/pages/Tantra.js` |
| 14 | `frontend/public/manifest.json` |
| 14 | `frontend/src/pages/Exercises.js` |
| 14 | `frontend/src/components/ApexCreatorConsole.js` |
| 14 | `frontend/src/utils/EnlightenOS.js` |
| 13 | `frontend/src/components/games/ChamberMiniGame.js` |
| 13 | `frontend/src/pages/CreationStories.js` |
| 13 | `frontend/src/pages/CreatorDashboard.js` |
| 13 | `frontend/src/pages/Friends.js` |
| 13 | `frontend/src/pages/MultiverseRealms.js` |
| 13 | `frontend/src/pages/Aromatherapy.js` |
| 13 | `frontend/public/landing.html` |
| 13 | `frontend/public/sw.js` |
| 13 | `frontend/src/pages/MoodTracker.js` |
| 13 | `backend/routes/trade_circle.py` |
| 13 | `frontend/public/proof2/index.html` |
| 13 | `frontend/src/pages/Teachings.js` |
| 13 | `frontend/src/pages/Nourishment.js` |
| 13 | `frontend/src/components/CosmicToolbar.js` |
| 12 | `frontend/src/pages/Community.js` |
| 12 | `frontend/src/pages/Create.js` |
| 12 | `frontend/src/pages/Dreams.js` |
| 12 | `frontend/src/pages/LiveSessions.js` |
| 12 | `frontend/src/pages/MayanAstrology.js` |
| 12 | `frontend/src/pages/RockHounding.js` |
| 12 | `frontend/src/pages/StarseedWorlds.js` |
| 12 | `frontend/src/pages/ZenGarden.js` |
| 12 | `frontend/src/pages/CosmicLedger.js` |
| 12 | `backend/routes/sovereign.py` |
| 12 | `frontend/src/pages/Numerology.js` |
| 12 | `frontend/src/pages/Journal.js` |
| 12 | `frontend/src/pages/Yantra.js` |
| 12 | `frontend/src/pages/Yoga.js` |
| 12 | `backend/routes/auth.py` |
| 12 | `frontend/src/components/MissionControl.js` |
| 11 | `.emergent/emergent.yml` |
| 11 | `backend/routes/dynamic.py` |
| 11 | `frontend/src/components/OrbitalMixer.js` |
| 11 | `frontend/src/pages/AvatarCreator.js` |
| 11 | `frontend/src/pages/Classes.js` |
| 11 | `frontend/src/pages/GrowthTimeline.js` |
| 11 | `frontend/src/pages/SovereignAdvisors.js` |
| 11 | `frontend/src/pages/Acupressure.js` |
| 11 | `backend/routes/coach.py` |
| 11 | `frontend/src/pages/SpiritualCoach.js` |
| 11 | `frontend/src/pages/Challenges.js` |
| 11 | `frontend/src/pages/StarseedRealm.js` |
| 10 | `frontend/src/pages/DanceMusicStudio.js` |
| 10 | `frontend/src/pages/EconomyPage.js` |
| 10 | `frontend/src/pages/Botany.js` |
| 10 | `frontend/src/pages/Cardology.js` |
| 10 | `frontend/src/pages/DailyRitual.js` |
| 10 | `frontend/src/pages/DreamRealms.js` |
| 10 | `frontend/src/pages/EvolutionLab.js` |
| 10 | `frontend/src/components/SceneEngine.js` |
| 10 | `frontend/src/pages/SpiritualAvatarCreator.js` |
| 10 | `backend/routes/knowledge.py` |
| 10 | `backend/requirements.txt` |
| 10 | `frontend/src/pages/AkashicRecords.js` |
| 10 | `frontend/android/app/build.gradle` |
| 10 | `frontend/src/pages/Bible.js` |
| 10 | `frontend/src/pages/SacredTexts.js` |
| 10 | `frontend/src/pages/CelestialDome.js` |
| 10 | `frontend/public/.well-known/assetlinks.json` |
| 10 | `frontend/src/components/CosmicAssistant.js` |
| 10 | `frontend/src/pages/CosmicMap.js` |
| 10 | `backend/.env` |

---

## 6. EXPLICIT REVERTS / ROLLBACKS / REGRESSION FIXES — 0

| Date | SHA | Subject |
|---|---|---|

---

**End of audit.** Regenerate any time with `python3 /app/scripts/generate_rework_audit.py`.
