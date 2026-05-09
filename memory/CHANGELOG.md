# CHANGELOG — ENLIGHTEN.MINT.CAFE
Append-only running log of work shipped. Most recent first.

---

## 2026-02-09 — V1.2.0 EMERGENCY: Compliance Scrub + Voice Key Restore

### 🔴 P0 — System-Wide Compliance Terminology Scrub
Removed every Google-Play-banned medical-claim term from user-visible UI:
- `Reiki Healing` → **Reiki Alignment** (page H1, search keywords) ✅ verified live
- `Light Therapy` → **Light Resonance** (Navigation, Tutorial, Walkthrough, BackToHub, MeshNetworkContext, SplitScreen, ConsoleConstants, CosmicMixerPage accordion title, LightTherapy.js H1 fallback, Landing safety disclaimer)
- `Aromatherapy` → **Aromatic Resonance** (Navigation, BackToHub, GuidedTour, Tutorial, HelixNav3D 3D label, ConsoleConstants, SearchCommand keywords, SceneEngine spa scene name, Aromatherapy.js page title, InteractiveModule cross-link)
- `Sound Healing` → **Sound Resonance** | `Crystal Healing` → **Crystal Resonance** | `Frequency Therapy` → **Frequency Alignment** | `Tissue Healing` → **Tissue Resonance** (Journey.js x16, Meditation.js x4, Hooponopono.js x4, Landing.js, HelpCenter, Blessings, SuanpanMixer, UserUploads, Affirmations placeholder, Create.js placeholder, DanceMusicStudio "Jingle dress healing steps"→"ceremonial steps", UniversalWeaveANI rendered desc, toolScaffold VR realm purpose, i18n/translations subtitle, MasterKey, OmnisTotality)
- Hooponopono Hew Len lore "heal an entire ward of mentally ill patients" → softened to "supported a ward of vulnerable people"
- Search keywords scrubbed across SearchCommand.js (8 entries) so autocomplete + Google's app-content scanner don't flag invisible tokens

**Files Touched (37):** Reiki, SearchCommand, Navigation, BackToHub, GuidedTour, Walkthrough, Tutorial, Hooponopono, Meditation, Journey, Landing, HelpCenter, Blessings, LightTherapy, Aromatherapy, CosmicMixerPage, Affirmations, Create, DanceMusicStudio, UserUploads, SuanpanMixer, Sanctuary, ConsoleConstants, HelixNav3D, MeshNetworkContext, MixerContext, SplitScreen, SceneEngine, CosmicMixer, CosmicPrescription, InteractiveModule, MasterKey, OmnisTotality, HarmonicResonance, UniversalWeaveANI, toolScaffold, i18n/translations.

**Deliberately Kept (Legal Shields):** MedicalDisclaimerSplash.js, WellnessDisclaimer.js, TermsPage.js, Landing "For Information & Entertainment Only" block — these declare what the app is NOT and are required for legal protection.

### 🔴 P0 — Voice Key Restoration ("NO VOICE KEY" sticky-flag bug)
- **Root cause:** `SageVoiceController.unavailableNoticed` flag was set sticky-true on first 503 from ElevenLabs (e.g., transient free-tier IP block) and never re-checked. Backend was confirmed live the entire time (`/api/voice/budget` → `configured:true`, `/api/voice/sage-narrate` → 200 with audio).
- **Fix:** Auto-clear after 90s on next speak/preview call, AND clear on `visibilitychange` tab refocus. Re-labeled fallback string from `No Voice Key` (jargon, looks broken) to `Voice Resting` (Flatland-safe, neutral).
- **Files:** `services/SageVoiceController.js`, `components/starseed/GameScene.js`, `components/AgentHUD.jsx`, `pages/Settings.js`.

### 🔴 P0 — Permission/Privacy Audit
- `AndroidManifest.xml`: confirmed minimal — only `INTERNET` permission. No GPS/Mic/Contacts/Storage. CLEAN.
- `manifest.json`: categories are `entertainment, education, lifestyle, games`. No health/medical category. Description states "for spiritual study and self-exploration — not medical or diagnostic use." CLEAN.

### 🟡 P1 — Disclaimer Persistence
- `MedicalDisclaimerSplash.js` confirmed: writes 3 versioned localStorage keys (`disclaimer_acknowledged`, `disclaimer_version=2`, `disclaimer_acknowledged_at`). Re-prompts on version bump. Inline (no portal/modal). `landing.html` static mirror shares same keys.

### 🟡 P1 — Routing/404 Audit
- Static `/landing.html` already shipped as share-target (V1.2.0 prior work).
- `NotFound.js` already shipped as auto-redirect (V1.2.0 prior work).
- FastAPI does not need a catch-all because frontend ingress fallback to React index.html is handled by Kubernetes ingress + CRA dev server.

### 📸 Verification
- Live screenshot https://zero-scale-physics.preview.emergentagent.com/reiki — confirmed H1 "Reiki Alignment" + page body has zero "Healing" text.
- Webpack compiled with 0 errors (4 pre-existing react-hooks warnings only).
- Backend curl: `/api/voice/sage-narrate/status` → `{"configured":true,...}`; `/api/voice/sage-narrate` → 200 with audio_url payload.

### 📋 Follow-up
See `/app/AGENT_ACCOUNTABILITY_LOG.md` for full miss-list and forward rules.
