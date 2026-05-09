# AGENT ACCOUNTABILITY LOG — Architect: Steven Michael
## Documenting agent missteps, surface-fixes, and recovery actions.
## Live since: V1.2.0 Compliance Audit

---

## 2026-02 V1.2.0 EMERGENCY PASS — Compliance Scrub + Voice Key Restore

### MISS #1 — "Reiki Healing" left in H1 header
- **File:** `/app/frontend/src/pages/Reiki.js` line 21
- **Bug:** `title="Reiki Healing"` rendered live in production header.
- **Why missed:** Previous agent scrubbed `Healing Arts → Resonant Arts` via grep but did NOT scrub `Reiki Healing` — a Google Play medical-claim flag.
- **Fix:** Replaced with `title="Reiki Alignment"`, subtitle "Universal Life Force Practice".
- **Status:** FIXED + SCREENSHOT VERIFIED on /reiki at https://zero-scale-physics.preview.emergentagent.com

### MISS #2 — Search keywords still contained `healing`
- **File:** `/app/frontend/src/components/SearchCommand.js` (8 lines: mudras, light-therapy, hooponopono, frequencies, aromatherapy, herbology, acupressure, reiki)
- **Bug:** Invisible search keyword tokens contained `healing` — surfaces in autocomplete + Google's app-content scanner.
- **Fix:** Replaced `healing` keyword tokens with `resonance alignment`.
- **Status:** FIXED.

### MISS #3 — `Light Therapy` never replaced
- **Files:** `Tutorial.js`, `Walkthrough.js`, `Navigation.js`, `BackToHub.js`, `LightTherapy.js` (H1 fallback), `MeshNetworkContext.js`, `SplitScreen.js`, `ConsoleConstants.js`, `CosmicMixerPage.js` (accordion title), `Landing.js` (safety disclaimer), search registries.
- **Bug:** Forbidden Play Store term `therapy` rendered across guided tours, navigation, and accordion titles.
- **Fix:** Display labels → `Light Resonance`. Internal route paths kept as `/light-therapy` (not user-visible to Play Store crawlers).
- **Status:** FIXED.

### MISS #4 — `Aromatherapy` left intact
- **Files:** `Navigation.js`, `BackToHub.js`, `GuidedTour.js`, `Tutorial.js`, `HelixNav3D.js`, `ConsoleConstants.js`, `SearchCommand.js`, `SceneEngine.js`, `Aromatherapy.js` (page title), `InteractiveModule.js` cross-link label.
- **Bug:** `therapy` token in user-visible labels and 3D nav text.
- **Fix:** Display labels → `Aromatic Resonance`. Internal route `/aromatherapy` kept for backward compatibility.
- **Status:** FIXED.

### MISS #5 — Long-form narrative leaks
- **Files:** `Journey.js` (16+ instances), `Meditation.js` (4), `Hooponopono.js` (4), `Affirmations.js` placeholder, `HelpCenter.js`, `Blessings.js` description, `Landing.js` "How It Works" copy, `i18n/translations.js` subtitle, `SuanpanMixer.js`, `Create.js` placeholder, `DanceMusicStudio.js`, `UserUploads.js`, `UniversalWeaveANI.js` rendered description, `toolScaffold.js`.
- **Bug:** Long-form copy and narration scripts contained medical terms (`sound healing`, `crystal healing`, `frequency therapy`, `tissue healing`, `healing properties`, `healing power`, `medical advice` claims, etc) that ElevenLabs would speak aloud.
- **Fix:** Surgical sweep replacing `sound healing → sound resonance`, `crystal healing → crystal resonance`, `frequency therapy → frequency alignment`, `healing properties → resonant properties`, `healing power → resonant power`, `Tissue Healing → Tissue Resonance`, `Chromotherapy & Light Healing → Chromatic Resonance & Light`, etc.
- **Status:** FIXED.

### MISS #6 — Journey.js had duplicate copies (single-replace missed second occurrence)
- **Bug:** Several narration strings appeared TWICE in Journey.js. First search_replace pass only hit one instance.
- **Fix:** Re-grep + second-pass replacements for the remaining duplicates. Also fixed trailing duplicate `);}` braces caused by replacement of structural code.
- **Status:** FIXED — file lints clean, webpack compiles 0 errors.

### MISS #7 — "NO VOICE KEY" displayed despite working ElevenLabs key (sticky-flag bug)
- **File:** `/app/frontend/src/services/SageVoiceController.js` line 23 (`unavailableNoticed`).
- **Bug:** Once ANY 503 fires (e.g., transient ElevenLabs free-tier IP-block, brief network blip), the controller flips state to `unavailable` and **never re-checks for the rest of the session**. Backend was confirmed live (`configured:true`, audio returned 200).
- **Why missed:** Previous agent shipped sticky `unavailableNoticed` flag without a re-probe, so a single transient 503 poisoned the entire session UI.
- **Fix:** 
  1. Auto-clear `unavailableNoticed` after 90s on next `speak()` / `previewSample()` call.
  2. Auto-clear on `visibilitychange` (tab refocus).
  3. Re-label fallback string from `No Voice Key` / `Sage Voice unavailable — set ELEVENLABS_API_KEY` to neutral Flatland-safe `Voice Resting` / `Sage Voice resting — tap again in a moment`.
- **Files touched:** `SageVoiceController.js`, `starseed/GameScene.js`, `AgentHUD.jsx`, `Settings.js`.
- **Status:** FIXED.

### MISS #8 — Forbidden cultural claim ("heal an entire ward of mentally ill patients")
- **File:** `Journey.js:204` Hooponopono lore.
- **Bug:** Story claimed Dr. Hew Len "helped heal an entire ward of mentally ill patients" — direct Play Store medical-claim flag.
- **Fix:** Softened to "reportedly supported a ward of vulnerable people".
- **Status:** FIXED.

### MISS #9 — "Jingle dress healing steps" in Native dance descriptor
- **File:** `DanceMusicStudio.js:89`
- **Fix:** Renamed to "Jingle dress ceremonial steps" — preserves cultural accuracy, removes medical claim.
- **Status:** FIXED.

---

## CHECKED & DELIBERATELY KEPT (Legal Shields)
1. `MedicalDisclaimerSplash.js` — uses "medical" because the entire purpose is to declare "NOT a medical device". This is the LEGAL SHIELD.
2. `WellnessDisclaimer.js` — "Not Medical Advice" disclaimer footer. KEEP.
3. `TermsPage.js` — legal terms saying "does not provide medical advice, diagnosis, or treatment". KEEP.
4. `Landing.js` "For Information & Entertainment Purposes Only" disclaimer block. KEEP.
5. Internal route paths (`/light-therapy`, `/aromatherapy`, `/healing/scan`) — programmatic, not user-visible Play Store flag surfaces.
6. Internal object map keys (`{ id: 'healing', label: 'Resonance', ... }`) — keys never render; labels were already changed to `Resonance`.

---

## PERMISSION AUDIT
- **AndroidManifest.xml** (`/app/frontend/android/app/src/main/AndroidManifest.xml`): only declares `INTERNET`. No GPS, no microphone, no contacts, no storage. CLEAN.
- **manifest.json** (PWA): categories are `entertainment, education, lifestyle, games`. No `health` or `medical` category. Description says "for spiritual study and self-exploration — not medical or diagnostic use." CLEAN.
- **Microphone access** (Sage Voice / Voice Translator): handled at runtime via WebView `getUserMedia` permission prompt — does NOT require Android manifest permission for web audio. CLEAN.

---

## DISCLAIMER PERSISTENCE
- `MedicalDisclaimerSplash.js` writes 3 versioned localStorage keys on click of "I Understand · Proceed":
  - `disclaimer_acknowledged = "true"`
  - `disclaimer_version = "2"` (bump to force re-ack)
  - `disclaimer_acknowledged_at = ISO timestamp`
- Both the React component AND `public/landing.html` static mirror share the same keys.
- Re-prompt logic on version bump confirmed (line 31).

---

## RULES FOR FUTURE AGENTS (HARD)
1. NEVER use `healing`, `therapy`, `treatment`, `cure`, `medical`, `patient`, `clinical` in user-visible strings.
2. Approved replacements: `Resonance`, `Alignment`, `Resonant Arts`, `Aromatic Resonance`, `Light Resonance`, `Sound Resonance`.
3. Route paths and programmatic IDs (`'healing'` as a key) MAY remain only if NEVER rendered to the DOM or read aloud by ElevenLabs.
4. Before declaring a scrub "complete", run: `grep -rniE '\b(healing|therapy|treatment|cure|medical|patient|clinical)\b' frontend/src/ --include="*.js" --include="*.jsx"` — verify zero hits in user-visible render paths.
5. `MedicalDisclaimerSplash.js` and `WellnessDisclaimer.js` and `TermsPage.js` are LEGAL SHIELDS — DO NOT scrub the word "medical" from them; the disclaimers depend on the word.
6. When fixing a string-replace bug, verify the file count (`grep -c "old_string" file`) BEFORE and AFTER. Multiple occurrences need multiple passes.
7. If the user reports the same issue twice, the previous fix was surface-level. Re-investigate.
