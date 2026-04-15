# ENLIGHTEN.MINT.CAFE — V53.1 AUDIO-VISUAL SOVEREIGN ENGINE
## Last Verified: April 15, 2026

### V53.1: Audio-Visual Bridge (useAudioVisualizer Hook)
- **useAudioVisualizer.js**: New hook bridges MixerContext's existing AnalyserNode to ParticleField
- **3 visualization channels**: Amplitude-to-Scale (particle size), Frequency-to-Hue (Solfeggio spectral mapping), Transient Detection (radial bursts)
- **Solfeggio frequency mapping**: 528Hz → green, 396Hz → red, 741Hz → violet, etc.
- **Spectral centroid analysis**: Weighted average frequency for brightness indication
- **Zero-regression**: ParticleField falls back to ChaosEngine-only when no audio is active
- **13/13 tests PASSED** (Iteration 331)

### V53.0: Console Decomposition + 3D Visualization Hooks
- **UnifiedCreatorConsole.js decomposed**: 1379 → 367 lines (73% reduction)
- **16 extracted modules** in `/components/console/`
- **ParticleField.js**: Canvas particle system driven by ChaosEngine z/z feedback loop
- **15/15 regression tests PASSED** (Iteration 330)

### V52.0: Chaos Engine in Light Therapy + Global Glass-Blur + Dead Card Fix
- Chaos Engine wired into Light Therapy
- Global glass-blur CSS via SceneEngine
- ExpandableInfoCard.js
- 19/19 final comprehensive sweep PASSED

### Architecture
- `/hooks/useAudioVisualizer.js` — Audio-visual bridge (AnalyserNode → particle params)
- `/components/console/` — Decomposed mixer panel architecture (16 files)
- `/components/console/ParticleField.js` — 3D visualization (ChaosEngine + Audio reactive)
- `lib/ChaosEngine.js` — Global z/z feedback oscillator
- `ConsoleConstants.js` — PILLARS, findModule, PHI math
- `CelestialTorus.js` — φ³ Orbital Canvas
- `SovereignViewport.js` — Reusable immersive wrapper
- `ExpandableInfoCard.js` — Universal expandable card
- `SceneEngine.js` — Realm backgrounds + global glass-blur

### Audio-Visual Pipeline
```
MixerContext AudioContext
  ├── masterGain
  │   └── AnalyserNode (fftSize: 256) ← useAudioVisualizer reads from here
  │       └── DynamicsCompressor
  │           └── ctx.destination
  └── freqNodes, soundNodes, droneNodes → masterGain
                                            ↓
                              useAudioVisualizer extracts:
                                amplitude, rms, dominantHz, hueShift,
                                bloomIntensity, isTransient, spectralCentroid
                                            ↓
                              ParticleField renders:
                                size (amplitude), color (frequency),
                                bursts (transients), trail length (rms)
```

### 3rd Party Integrations
- Gemini Flash — Sage FX + Encyclopedia AI
- Gemini Nano Banana (gemini-3.1-flash-image-preview) — Scene generation
- Web Audio API (Chaos Engine + MixerContext) — Full audio pipeline
- FastAPI WebSocket — Sovereign Live Sessions

### Blocked: Play Store AAB (Google identity verification)

### Upcoming Tasks
- Universal MediaVault Access (P1): Lazy-loading video within SceneEngine
- Deeper ParticleField integration: Embed in LightTherapy, Frequencies, Observatory modules
- Phygital Marketplace NFC hooks (P2)
