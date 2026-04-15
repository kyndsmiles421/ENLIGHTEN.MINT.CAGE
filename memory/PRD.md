# ENLIGHTEN.MINT.CAFE — V53.2 RESONANCE CAMERA ENGINE
## Last Verified: April 15, 2026

### V53.2: Resonance Camera (Canvas + Audio Capture Pipeline)
- **useResonanceCapture.js**: Full capture pipeline — `canvas.captureStream(30fps)` + `MediaStreamAudioDestinationNode` → muxed `MediaRecorder` → WebM/VP9+Opus
- **ResonanceCamera.js**: Compact UI strip in Orbit panel with 3 states: Idle (Record button), Recording (Stop + pulsing timer), Preview (Download/Share/Discard)
- **ParticleField.js**: Now uses `forwardRef` + `useImperativeHandle` to expose canvas element for the capture pipeline
- **17/17 tests PASSED** (Iteration 332) including logged-in state verification

### V53.1: Audio-Visual Bridge (useAudioVisualizer Hook)
- **useAudioVisualizer.js**: Bridges MixerContext's AnalyserNode to ParticleField
- **3 channels**: Amplitude-to-Scale, Frequency-to-Hue (Solfeggio map), Transient Detection

### V53.0: Console Decomposition + 3D Visualization Hooks
- **UnifiedCreatorConsole.js decomposed**: 1379 → ~390 lines (72% reduction)
- **18 extracted modules** in `/components/console/`

### Architecture
```
/components/console/
├── index.js                  (barrel exports)
├── TorusPanel.js             (orbital navigation)
├── MixPanel.js               (channel faders)
├── RecordPanel.js            (media recording)
├── AudioPanel.js             (audio controls)
├── TextPanel.js              (text overlays)
├── OverlayPanel.js           (image overlays)
├── EffectsPanel.js           (CSS filters)
├── AIPanel.js                (Sage FX prompt-to-fx)
├── ExportPanel.js            (export/share/print)
├── AccountPanel.js           (user account)
├── StoreView.js              (mixer store)
├── MixerNavBar.js            (bottom nav bar)
├── ParticleField.js          (3D particles — ChaosEngine + Audio)
├── ResonanceCamera.js        (capture UI)
├── useResonanceCapture.js    (capture pipeline hook)
├── useMediaControls.js       (media recorder hook)
└── constants.js              (TOOL_TABS config)

/hooks/
└── useAudioVisualizer.js     (AnalyserNode → visual params)
```

### Capture Pipeline
```
ParticleField Canvas ──→ captureStream(30fps) ──→ videoTrack ─┐
                                                                ├→ MediaRecorder → WebM/VP9+Opus
MixerContext AudioCtx ──→ MediaStreamDestination ──→ audioTrack ─┘
                                                                     ↓
                                                          Download / Share (Web Share API)
```

### 3rd Party Integrations
- Gemini Flash — Sage FX + Encyclopedia AI
- Gemini Nano Banana — Scene generation
- Web Audio API — Full audio pipeline + Chaos Engine
- FastAPI WebSocket — Sovereign Live Sessions

### Blocked: Play Store AAB (Google identity verification)

### Upcoming Tasks
- Universal MediaVault Access (P1): Glass-stack z-layered video with lazy loading
- Deeper ParticleField embedding: LightTherapy, Frequencies, Observatory modules
- AAB signing logic preparation
- Phygital Marketplace NFC hooks (P2)
