/**
 * ProcessorState.js — Direct State Substitution Engine
 *
 * The Sovereign Engine never unmounts. Tools are not "pages" — they are
 * RENDER MODES of the same matrix. When the user activates a tool, we
 * do NOT navigate. We swap the active processor state, and the matrix's
 * render switch projects the tool's logic into the same coordinate
 * system, same parent stacking context.
 *
 *   IDLE          → MiniLattice (the 9×9 crystalline gear)
 *   AVATAR_GEN    → AvatarCreator's body (its own page chrome stripped)
 *   STARSEED      → StarseedAdventureEngine
 *   ...
 *
 * This is NOT React Router. There is no URL change, no history push,
 * no DOM teardown. The engine remains alive — only its render-mode
 * mutates. WebXR camera locked to the matrix coordinate system stays
 * locked when the mode flips.
 *
 * Module Registry:
 *   Each entry maps a state-id to a render component AND defines
 *   whether it should consume the entire matrix viewport or just the
 *   lattice slot.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { analyzeResonance, blendVectors } from '../services/ResonanceAnalyzer';
import { initResonanceSettings, getResonanceSettings } from './ResonanceSettings';
// Side-effect import — exposes window.ContextBus and boots the
// shared-memory buffer whenever the Sovereign Engine mounts.
import './ContextBus';
import { primerForPrompt, subscribe as busSubscribe } from './ContextBus';

initResonanceSettings();

const ProcessorStateContext = createContext(null);

/**
 * MODULE_FREQUENCIES — each tool's signature pulse vector.
 *
 * When a module is pulled into the matrix slot, the engine emits a
 * `sovereign:pulse` event carrying that module's signature. The
 * ResonanceField is already listening — it converts the vector into
 * brightness, saturation, and starfield twinkle. No new listener, no
 * wrapper around the tool; the state vector itself drives the field.
 *
 * Signature dimensions:
 *   bass    — low-frequency presence  (0..1)  · drives brightness
 *   mid     — mid-frequency density   (0..1)  · drives saturation
 *   treble  — high-frequency detail   (0..1)  · drives starfield
 *   peak    — overall intensity spike (0..1)  · drives momentary flash
 *
 * IDLE returns to a low ambient field. Each tool occupies its own
 * spectral region so the user feels the engine SHIFT when the focal
 * point changes — this is what makes it a Processor, not a menu.
 */
const MODULE_FREQUENCIES = {
  IDLE:            { bass: 0.10, mid: 0.18, treble: 0.20, peak: 0.05 },
  AVATAR_GEN:      { bass: 0.55, mid: 0.62, treble: 0.40, peak: 0.70 },
  COSMIC_PORTRAIT: { bass: 0.28, mid: 0.52, treble: 0.78, peak: 0.55 },
  FORECASTS:       { bass: 0.22, mid: 0.66, treble: 0.58, peak: 0.45 },
  DREAM_VIZ:       { bass: 0.42, mid: 0.38, treble: 0.85, peak: 0.50 },
  STORY_GEN:       { bass: 0.48, mid: 0.74, treble: 0.32, peak: 0.62 },
  SCENE_GEN:       { bass: 0.36, mid: 0.58, treble: 0.66, peak: 0.58 },
  STARSEED:        { bass: 0.78, mid: 0.46, treble: 0.52, peak: 0.85 },
  // Phase 2 — Divination & Oracle band
  ORACLE:          { bass: 0.30, mid: 0.70, treble: 0.62, peak: 0.60 },
  AKASHIC:         { bass: 0.25, mid: 0.55, treble: 0.82, peak: 0.50 },
  STAR_CHART:      { bass: 0.20, mid: 0.48, treble: 0.88, peak: 0.55 },
  NUMEROLOGY:      { bass: 0.32, mid: 0.62, treble: 0.50, peak: 0.45 },
  MAYAN:           { bass: 0.45, mid: 0.58, treble: 0.55, peak: 0.55 },
  CARDOLOGY:       { bass: 0.28, mid: 0.65, treble: 0.58, peak: 0.50 },
  ANIMAL_TOTEMS:   { bass: 0.65, mid: 0.42, treble: 0.48, peak: 0.65 },
  HEXAGRAM:        { bass: 0.38, mid: 0.72, treble: 0.42, peak: 0.55 },
  COSMIC_INSIGHTS: { bass: 0.24, mid: 0.60, treble: 0.74, peak: 0.50 },
  SOUL_REPORTS:    { bass: 0.30, mid: 0.68, treble: 0.66, peak: 0.55 },
  // V68.79 — Entertainment / Education / Gamification core band
  // (Breathwork, Meditation, etc. are entertainment-learning modules —
  // this app is Entertainment · Information · Education · Gamification,
  // NOT a wellness/medical product. Modules are byproducts of the
  // experience, not clinical tools.)
  BREATHWORK:      { bass: 0.72, mid: 0.32, treble: 0.20, peak: 0.40 },
  MEDITATION:      { bass: 0.62, mid: 0.28, treble: 0.18, peak: 0.28 },
  YOGA:            { bass: 0.56, mid: 0.48, treble: 0.30, peak: 0.40 },
  AFFIRMATIONS:    { bass: 0.40, mid: 0.58, treble: 0.44, peak: 0.52 },
  MOOD_TRACKER:    { bass: 0.34, mid: 0.56, treble: 0.48, peak: 0.38 },
  SOUNDSCAPES:     { bass: 0.68, mid: 0.52, treble: 0.60, peak: 0.45 },
  FREQUENCIES:     { bass: 0.48, mid: 0.70, treble: 0.82, peak: 0.58 },
  JOURNAL:         { bass: 0.28, mid: 0.46, treble: 0.38, peak: 0.30 },
  HERBOLOGY:       { bass: 0.44, mid: 0.62, treble: 0.40, peak: 0.42 },
  CRYSTALS:        { bass: 0.36, mid: 0.54, treble: 0.72, peak: 0.50 },
};

function emitPulse(moduleId) {
  const sig = MODULE_FREQUENCIES[moduleId] || MODULE_FREQUENCIES.IDLE;
  try {
    window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: sig }));
    // Companion event so other systems (mini-games, skin shifters, the
    // mixer's resonance camera) can react without colliding with the
    // audio analyser's continuous pulse stream.
    window.dispatchEvent(new CustomEvent('sovereign:state-shift', {
      detail: { moduleId, signature: sig, t: Date.now() },
    }));
  } catch { /* SSR / pre-mount no-op */ }
}

/**
 * emitOutputPulse — public API for tools to amplify resonance when
 * they produce output (story complete, avatar minted, forecast ready).
 *
 * V68.50 — Now flows through the Semantic Middleware: if an `output`
 * payload is provided, the analyzer extracts a content-derived pulse
 * which is blended with the module's steady-state signature. Global
 * `RESONANCE_SETTINGS` (gain + mode) shape the final emission so the
 * user's Tuning panel choices apply to every existing call site
 * without per-tool changes.
 *
 * @param {string} moduleId  e.g. 'STORY_GEN'
 * @param {number|object} intensityOrOpts  number → multiplier; object → {output, intensity}
 */
function clamp01(n) { return Math.max(0, Math.min(1, n)); }

export function emitOutputPulse(moduleId, intensityOrOpts = 1.4) {
  const opts = typeof intensityOrOpts === 'number'
    ? { output: null, intensity: intensityOrOpts }
    : { output: intensityOrOpts?.output ?? null, intensity: intensityOrOpts?.intensity ?? 1.4 };

  const live = getResonanceSettings();
  const base = MODULE_FREQUENCIES[moduleId] || MODULE_FREQUENCIES.IDLE;

  // If we have content, derive a semantic vector and blend 60/40
  // toward content. If not, just amplify the base signature.
  let vec;
  if (opts.output != null) {
    const semantic = analyzeResonance(opts.output, { mode: live.mode });
    vec = blendVectors(base, semantic, 0.6);
  } else {
    vec = { ...base };
  }

  const k = Math.max(0.5, Math.min(2.0, opts.intensity)) * (live.gain || 1);
  const burst = {
    bass:   clamp01(vec.bass   * k),
    mid:    clamp01(vec.mid    * k),
    treble: clamp01(vec.treble * k),
    peak:   clamp01((vec.peak ?? 0.5) * k),
  };
  try {
    window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: burst }));
    // Decay back to module steady-state after ~600ms
    setTimeout(() => {
      const decay = applyGain(base, live.gain);
      window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: decay }));
    }, 600);
  } catch { /* noop */ }
}

function applyGain(vec, gain) {
  const k = Math.max(0, Math.min(2, gain || 1));
  return {
    bass:   clamp01(vec.bass   * k),
    mid:    clamp01(vec.mid    * k),
    treble: clamp01(vec.treble * k),
    peak:   clamp01((vec.peak ?? 0.5) * k),
  };
}

export { MODULE_FREQUENCIES };

/**
 * MODULE_CONSUMES — V68.61 Resonance Cross-Pollination Filter.
 *
 * Each module declares the ContextBus key it OWNS (writes to). The
 * pull() dispatcher computes `primerForPrompt(ownedKey)` — i.e., the
 * cross-pollinated state from EVERY OTHER module — and publishes it
 * to `window.__sovereignPrimer` plus a `sovereign:prime` event.
 *
 * Any generator (frontend hook OR backend prompt builder) that reads
 * the primer auto-receives the engine's current state. Forecast
 * mood bleeds into Tarot draws. Avatar archetype bleeds into Story
 * Gen. Scene palette bleeds into Dream Viz. The 17 wired modules
 * become a single synthetic mind, not a toolbelt.
 *
 * Modules without a writeKey (Star Chart, Numerology, Cardology,
 * Mayan, Animal Totems, Cosmic Insights, Soul Reports, Hexagram)
 * default to entityState/narrativeContext-shaped output — they pull
 * the primer with no skip key, drinking the entire bus.
 */
const MODULE_CONSUMES = {
  IDLE:            null,
  AVATAR_GEN:      'entityState',
  COSMIC_PORTRAIT: 'entityState',
  FORECASTS:       'narrativeContext',
  DREAM_VIZ:       'narrativeContext',
  STORY_GEN:       'narrativeContext',
  SCENE_GEN:       'sceneFrame',
  STARSEED:        'worldMetadata',
  ORACLE:          'narrativeContext',
  AKASHIC:         'narrativeContext',
  STAR_CHART:      null,
  NUMEROLOGY:      null,
  MAYAN:           null,
  CARDOLOGY:       null,
  ANIMAL_TOTEMS:   null,
  HEXAGRAM:        'narrativeContext',
  COSMIC_INSIGHTS: null,
  SOUL_REPORTS:    null,
  // V68.79 — Wellness core. Breathwork/meditation/yoga drive `entityState`
  // (body + mood); affirmations/journal commit `narrativeContext`;
  // herbology/crystals own `entityState` so selections propagate to
  // the Chamber mini-game and Starseed avatar.
  BREATHWORK:      'entityState',
  MEDITATION:      'entityState',
  YOGA:            'entityState',
  AFFIRMATIONS:    'narrativeContext',
  MOOD_TRACKER:    'entityState',
  SOUNDSCAPES:     null,
  FREQUENCIES:     null,
  JOURNAL:         'narrativeContext',
  HERBOLOGY:       'entityState',
  CRYSTALS:        'entityState',
};

function publishPrimer(moduleId) {
  try {
    const skipKey = MODULE_CONSUMES[moduleId] || '';
    const primer = primerForPrompt(skipKey);
    window.__sovereignPrimer = primer;
    window.__sovereignPrimerModule = moduleId;
    window.dispatchEvent(new CustomEvent('sovereign:prime', {
      detail: { moduleId, primer, skipKey, t: Date.now() },
    }));
  } catch { /* SSR / pre-mount no-op */ }
}

export { MODULE_CONSUMES };

/**
 * MODULE_REGISTRY
 *
 * Each module is loaded lazily so the IDLE bundle stays under the
 * 800 KB Metabolic Seal. When pulled, the module renders inside the
 * MiniLattice slot using the lattice's existing stacking context —
 * no portal, no overlay, no fixed positioning.
 */
export const MODULE_REGISTRY = {
  IDLE:       null,
  AVATAR_GEN:      React.lazy(() => import('../engines/AvatarGeneratorEngine')),
  COSMIC_PORTRAIT: React.lazy(() => import('../engines/CosmicPortraitEngine')),
  FORECASTS:       React.lazy(() => import('../engines/ForecastsEngine')),
  DREAM_VIZ:       React.lazy(() => import('../engines/DreamVizEngine')),
  STORY_GEN:       React.lazy(() => import('../engines/StoryGenEngine')),
  SCENE_GEN:       React.lazy(() => import('../engines/SceneGenEngine')),
  STARSEED:        React.lazy(() => import('../engines/StarseedRPGEngine')),
  // Phase 2 — Divination & Oracle band
  ORACLE:          React.lazy(() => import('../engines/OracleEngine')),
  AKASHIC:         React.lazy(() => import('../engines/AkashicEngine')),
  STAR_CHART:      React.lazy(() => import('../engines/StarChartEngine')),
  NUMEROLOGY:      React.lazy(() => import('../engines/NumerologyEngine')),
  MAYAN:           React.lazy(() => import('../engines/MayanEngine')),
  CARDOLOGY:       React.lazy(() => import('../engines/CardologyEngine')),
  ANIMAL_TOTEMS:   React.lazy(() => import('../engines/AnimalTotemsEngine')),
  HEXAGRAM:        React.lazy(() => import('../engines/HexagramEngine')),
  COSMIC_INSIGHTS: React.lazy(() => import('../engines/CosmicInsightsEngine')),
  SOUL_REPORTS:    React.lazy(() => import('../engines/SoulReportsEngine')),
  // V68.79 — Wellness core pillar batch
  BREATHWORK:      React.lazy(() => import('../engines/BreathworkEngine')),
  MEDITATION:      React.lazy(() => import('../engines/MeditationEngine')),
  YOGA:            React.lazy(() => import('../engines/YogaEngine')),
  AFFIRMATIONS:    React.lazy(() => import('../engines/AffirmationsEngine')),
  MOOD_TRACKER:    React.lazy(() => import('../engines/MoodTrackerEngine')),
  SOUNDSCAPES:     React.lazy(() => import('../engines/SoundscapesEngine')),
  FREQUENCIES:     React.lazy(() => import('../engines/FrequenciesEngine')),
  JOURNAL:         React.lazy(() => import('../engines/JournalEngine')),
  HERBOLOGY:       React.lazy(() => import('../engines/HerbologyEngine')),
  CRYSTALS:        React.lazy(() => import('../engines/CrystalsEngine')),
  // V68.81 — Entertainment/Education pillar batch (+15)
  ACUPRESSURE:     React.lazy(() => import('../engines/AcupressureEngine')),
  AROMATHERAPY:    React.lazy(() => import('../engines/AromatherapyEngine')),
  REFLEXOLOGY:     React.lazy(() => import('../engines/ReflexologyEngine')),
  BIBLE:           React.lazy(() => import('../engines/BibleEngine')),
  BLESSINGS:       React.lazy(() => import('../engines/BlessingsEngine')),
  DAILY_RITUAL:    React.lazy(() => import('../engines/DailyRitualEngine')),
  ELIXIRS:         React.lazy(() => import('../engines/ElixirsEngine')),
  ENCYCLOPEDIA:    React.lazy(() => import('../engines/EncyclopediaEngine')),
  COSMIC_CALENDAR: React.lazy(() => import('../engines/CosmicCalendarEngine')),
  SACRED_TEXTS:    React.lazy(() => import('../engines/SacredTextsEngine')),
  MANTRAS:         React.lazy(() => import('../engines/MantrasEngine')),
  MUDRAS:          React.lazy(() => import('../engines/MudrasEngine')),
  RITUALS:         React.lazy(() => import('../engines/RitualsEngine')),
  TEACHINGS:       React.lazy(() => import('../engines/TeachingsEngine')),
  ZEN_GARDEN:      React.lazy(() => import('../engines/ZenGardenEngine')),
  // V68.82 — Building-Equipment / Workshop pillar batch (+15)
  WORKSHOP:          React.lazy(() => import('../engines/WorkshopEngine')),
  TRADE_CIRCLE:      React.lazy(() => import('../engines/TradeCircleEngine')),
  TRADE_PASSPORT:    React.lazy(() => import('../engines/TradePassportEngine')),
  MUSIC_LOUNGE:      React.lazy(() => import('../engines/MusicLoungeEngine')),
  TESSERACT:         React.lazy(() => import('../engines/TesseractEngine')),
  MULTIVERSE_MAP:    React.lazy(() => import('../engines/MultiverseMapEngine')),
  MULTIVERSE_REALMS: React.lazy(() => import('../engines/MultiverseRealmsEngine')),
  MASTER_VIEW:       React.lazy(() => import('../engines/MasterViewEngine')),
  SMARTDOCK:         React.lazy(() => import('../engines/SmartDockEngine')),
  SANCTUARY:         React.lazy(() => import('../engines/SanctuaryEngine')),
  SILENT_SANCTUARY:  React.lazy(() => import('../engines/SilentSanctuaryEngine')),
  REFINEMENT_LAB:    React.lazy(() => import('../engines/RefinementLabEngine')),
  RECURSIVE_DIVE:    React.lazy(() => import('../engines/RecursiveDiveEngine')),
  QUANTUM_FIELD:     React.lazy(() => import('../engines/QuantumFieldEngine')),
  QUANTUM_LOOM:      React.lazy(() => import('../engines/QuantumLoomEngine')),
  // V68.97 — Idle engines brought into the dispatcher.
  // HourglassEngine (Sacred Cosmology — double-cone golden ratio compression)
  // SingularityEngine (10-Step Ascension — fusion layer)
  // ProductionEngine (Trade Circle — modular self-production)
  // These existed as files with no caller. Now reachable via pull().
  HOURGLASS:         React.lazy(() => import('../engines/HourglassEngine')),
  SINGULARITY:       React.lazy(() => import('../engines/SingularityEngine')),
  PRODUCTION:        React.lazy(() => import('../engines/ProductionEngine')),
};

// V1.0.9 — Modules whose output is a generated visual (image/scene).
// The Background Agent Runner skips these auto-advancement when the
// user has `autoVisuals` disabled (or is in 'calm' immersion). The
// Sage chain still completes — visual steps just don't auto-pull.
const RITUAL_VISUAL_MODULES = new Set([
  'SCENE_GEN', 'COSMIC_PORTRAIT', 'AVATAR_GEN', 'DREAM_VIZ', 'STORY_GEN',
]);

function _readSensoryPrefs() {
  try {
    const raw = localStorage.getItem('cosmic_prefs');
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch { return {}; }
}

export function ProcessorStateProvider({ children }) {
  // Single source of truth for the engine's active render-mode.
  const [activeModule, setActiveModule] = useState('IDLE');

  // V1.0.9 — Active Ritual Chain state. When a chain is forged in the
  // RitualChainPanel and "Begin" is pressed, we mount the chain here;
  // the Background Agent Runner advances through it step-by-step,
  // pulling each step's module_id into the matrix slot. UI components
  // (the panel, HUD ribbons) subscribe via useProcessorState() to
  // render progress without owning the orchestration logic.
  const [ritualChain, setRitualChain] = useState(null); // { id, ritual_title, steps:[...], stepIndex, startedAt }
  const ritualTimerRef = React.useRef(null);
  const ritualChainRef = React.useRef(null);
  // Keep ref synced so window-event handlers (which close over the
  // initial value otherwise) always see the latest chain.
  useEffect(() => { ritualChainRef.current = ritualChain; }, [ritualChain]);

  // V68.82 — Time-in-Engine. We stamp when a module is pulled and POST
  // the elapsed seconds back to /api/arsenal/dwell-log on each swap or
  // release. Owner-gated server-side, fire-and-forget client-side, so
  // a network blip never blocks a state swap. We use sendBeacon on
  // page-hide to capture dwell when the tab closes mid-session.
  const dwellStartRef = React.useRef({ moduleId: 'IDLE', startedAt: Date.now() });

  const flushDwell = useCallback(() => {
    try {
      const { moduleId, startedAt } = dwellStartRef.current;
      if (!moduleId || moduleId === 'IDLE') return;
      const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      if (seconds <= 0) return;
      const token = localStorage.getItem('zen_token');
      if (!token || token === 'guest_token') return;
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/arsenal/dwell-log`;
      const body = JSON.stringify({ item_id: moduleId, seconds });
      // sendBeacon survives page-hide; fall back to fetch otherwise.
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon) {
        // sendBeacon can't set auth headers, so use fetch with keepalive.
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body,
          keepalive: true,
        }).catch(() => {});
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body,
        }).catch(() => {});
      }
      // Avoid silencing of `blob` lint without using it
      void blob;
    } catch { /* noop */ }
  }, []);

  const pull = useCallback((moduleId) => {
    if (!Object.prototype.hasOwnProperty.call(MODULE_REGISTRY, moduleId)) {
      // Unknown module — stay IDLE, no-op.
      return;
    }
    flushDwell();
    dwellStartRef.current = { moduleId, startedAt: Date.now() };
    setActiveModule(moduleId);
    emitPulse(moduleId);
    // V68.59 — publish the active module to a global so the
    // time-capsule beacon can capture the user's last "scene" on
    // tab-hide without subscribing to ProcessorState.
    try { window.__sovereignActiveModule = moduleId; } catch { /* noop */ }
    // V68.61 — Resonance Cross-Pollination. Refresh the primer for
    // the newly active module so its first generation already sees
    // the engine's accumulated state from other modules.
    publishPrimer(moduleId);
  }, [flushDwell]);

  const release = useCallback(() => {
    flushDwell();
    dwellStartRef.current = { moduleId: 'IDLE', startedAt: Date.now() };
    setActiveModule('IDLE');
    emitPulse('IDLE');
    try { window.__sovereignActiveModule = 'IDLE'; } catch { /* noop */ }
    publishPrimer('IDLE');
  }, [flushDwell]);

  // Flush dwell when the tab is hidden or unloaded so we don't lose
  // the final session window.
  useEffect(() => {
    const handler = () => flushDwell();
    window.addEventListener('pagehide', handler);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushDwell();
    });
    return () => {
      window.removeEventListener('pagehide', handler);
    };
  }, [flushDwell]);

  // V68.61 — Keep the published primer fresh while a module is open.
  // Any commit to the bus (from any module) re-publishes the primer
  // for the currently active module, so an open Oracle pane always
  // sees the freshest Forecast/Avatar state without re-pulling.
  useEffect(() => {
    publishPrimer(activeModule);
    const unsub = busSubscribe(() => publishPrimer(activeModule));
    return unsub;
  }, [activeModule]);

  // V1.0.9 — Background Agent Runner.
  //
  // Subscribes to window events + ContextBus commits so the active
  // ritual chain advances autonomously: when the current step's module
  // emits a commit (or its duration timer elapses), the runner pulls
  // the next module_id without user intervention.
  //
  // Calm-immersion contract: the runner *still* advances steps, but
  // suppresses the toast/tooltip side effects so the user is never
  // visually interrupted. Auto-Visuals contract: visual modules
  // (scene, story, dream-viz) are skipped when autoVisualsEnabled
  // is false — the chain leapfrogs past them to the next non-visual
  // step instead of generating an unsolicited image.
  const advanceRitualStep = useCallback((targetIndex) => {
    const cur = ritualChainRef.current;
    if (!cur) return;
    const steps = cur.steps || [];
    let idx = Math.max(0, targetIndex | 0);
    const prefs = _readSensoryPrefs();
    const immersion = prefs.immersionLevel || 'full';
    const autoVisuals = prefs.autoVisuals !== false && immersion !== 'calm';

    // Skip-forward over visual steps when auto-visuals are off.
    while (idx < steps.length) {
      const step = steps[idx];
      if (RITUAL_VISUAL_MODULES.has(step.module_id) && !autoVisuals) {
        try {
          window.dispatchEvent(new CustomEvent('ritual:step-skipped', {
            detail: { step, index: idx, reason: 'auto-visuals-off' },
          }));
        } catch { /* noop */ }
        idx += 1;
        continue;
      }
      break;
    }

    if (ritualTimerRef.current) {
      clearTimeout(ritualTimerRef.current);
      ritualTimerRef.current = null;
    }

    if (idx >= steps.length) {
      // Chain complete.
      const finished = { ...cur, stepIndex: steps.length, completedAt: Date.now() };
      ritualChainRef.current = null;
      setRitualChain(null);
      try {
        window.dispatchEvent(new CustomEvent('ritual:chain-complete', { detail: { chain: finished } }));
      } catch { /* noop */ }
      // Drop back to IDLE so the matrix breathes between chains.
      flushDwell();
      dwellStartRef.current = { moduleId: 'IDLE', startedAt: Date.now() };
      setActiveModule('IDLE');
      emitPulse('IDLE');
      try { window.__sovereignActiveModule = 'IDLE'; } catch { /* noop */ }
      publishPrimer('IDLE');
      return;
    }

    const step = steps[idx];
    const moduleId = step.module_id;
    if (!Object.prototype.hasOwnProperty.call(MODULE_REGISTRY, moduleId)) {
      // Unknown module — skip rather than dead-stop the chain.
      ritualChainRef.current = { ...cur, stepIndex: idx + 1, stepStartedAt: Date.now() };
      setRitualChain(ritualChainRef.current);
      advanceRitualStep(idx + 1);
      return;
    }

    flushDwell();
    dwellStartRef.current = { moduleId, startedAt: Date.now() };
    setActiveModule(moduleId);
    emitPulse(moduleId);
    try { window.__sovereignActiveModule = moduleId; } catch { /* noop */ }
    publishPrimer(moduleId);

    const next = { ...cur, stepIndex: idx, stepStartedAt: Date.now() };
    ritualChainRef.current = next;
    setRitualChain(next);

    try {
      window.dispatchEvent(new CustomEvent('ritual:step-active', {
        detail: { step, index: idx, immersion, total: steps.length },
      }));
    } catch { /* noop */ }

    // Auto-advance after the step's declared duration as a safety net.
    // ContextBus commits also trigger advancement (whichever fires first).
    const dur = Math.max(15, Math.min(Number(step.duration) || 180, 600));
    ritualTimerRef.current = setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent('ritual:step-complete', {
          detail: { step, index: idx, source: 'timer' },
        }));
      } catch { /* noop */ }
    }, dur * 1000);
  }, [flushDwell]);

  // Window-event API — the panel + any external trigger talks to the
  // runner via window events so non-React modules can drive it too.
  useEffect(() => {
    const onStart = (e) => {
      const chain = e.detail?.chain;
      if (!chain || !Array.isArray(chain.steps) || chain.steps.length === 0) return;
      const seeded = {
        id: chain.id,
        ritual_title: chain.ritual_title,
        ritual_description: chain.ritual_description,
        steps: chain.steps,
        stepIndex: 0,
        startedAt: Date.now(),
        stepStartedAt: Date.now(),
      };
      ritualChainRef.current = seeded;
      setRitualChain(seeded);
      advanceRitualStep(0);
    };
    const onComplete = () => {
      const cur = ritualChainRef.current;
      if (!cur) return;
      advanceRitualStep((cur.stepIndex | 0) + 1);
    };
    const onAbort = () => {
      if (ritualTimerRef.current) {
        clearTimeout(ritualTimerRef.current);
        ritualTimerRef.current = null;
      }
      ritualChainRef.current = null;
      setRitualChain(null);
      try {
        window.dispatchEvent(new CustomEvent('ritual:chain-aborted'));
      } catch { /* noop */ }
    };
    window.addEventListener('ritual:chain-start', onStart);
    window.addEventListener('ritual:step-complete', onComplete);
    window.addEventListener('ritual:chain-abort', onAbort);
    return () => {
      window.removeEventListener('ritual:chain-start', onStart);
      window.removeEventListener('ritual:step-complete', onComplete);
      window.removeEventListener('ritual:chain-abort', onAbort);
      if (ritualTimerRef.current) {
        clearTimeout(ritualTimerRef.current);
        ritualTimerRef.current = null;
      }
    };
  }, [advanceRitualStep]);

  // ContextBus subscription — when the active step's module commits
  // its output to the bus, that's the most authoritative "step-complete"
  // signal. We early-advance so the user isn't held hostage to the
  // safety-net timer.
  useEffect(() => {
    const unsub = busSubscribe((snapshot) => {
      const cur = ritualChainRef.current;
      if (!cur) return;
      const step = cur.steps?.[cur.stepIndex];
      if (!step) return;
      const last = (snapshot.history || [])[snapshot.history.length - 1];
      if (!last) return;
      // Only count commits that happened after this step became active
      // and that originated from this step's module.
      if (last.t < (cur.stepStartedAt || 0)) return;
      if (last.moduleId && last.moduleId !== step.module_id) return;
      try {
        window.dispatchEvent(new CustomEvent('ritual:step-complete', {
          detail: { step, index: cur.stepIndex, source: 'bus' },
        }));
      } catch { /* noop */ }
    });
    return unsub;
  }, []);

  const startRitualChain = useCallback((chain) => {
    try {
      window.dispatchEvent(new CustomEvent('ritual:chain-start', { detail: { chain } }));
    } catch { /* noop */ }
  }, []);
  const skipRitualStep = useCallback(() => {
    const cur = ritualChainRef.current;
    if (!cur) return;
    try {
      window.dispatchEvent(new CustomEvent('ritual:step-complete', {
        detail: { step: cur.steps?.[cur.stepIndex], index: cur.stepIndex, source: 'manual' },
      }));
    } catch { /* noop */ }
  }, []);
  const abortRitualChain = useCallback(() => {
    try { window.dispatchEvent(new CustomEvent('ritual:chain-abort')); } catch { /* noop */ }
  }, []);

  const value = useMemo(
    () => ({
      activeModule, pull, release,
      ritualChain, startRitualChain, skipRitualStep, abortRitualChain,
    }),
    [activeModule, pull, release, ritualChain, startRitualChain, skipRitualStep, abortRitualChain],
  );

  return (
    <ProcessorStateContext.Provider value={value}>
      {children}
    </ProcessorStateContext.Provider>
  );
}

export function useProcessorState() {
  const ctx = useContext(ProcessorStateContext);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g., during early SSR).
    return {
      activeModule: 'IDLE',
      pull: () => {},
      release: () => {},
      ritualChain: null,
      startRitualChain: () => {},
      skipRitualStep: () => {},
      abortRitualChain: () => {},
    };
  }
  return ctx;
}
