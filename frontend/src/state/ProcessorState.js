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
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { analyzeResonance, blendVectors } from '../services/ResonanceAnalyzer';
import { initResonanceSettings, getResonanceSettings } from './ResonanceSettings';
// Side-effect import — exposes window.ContextBus and boots the
// shared-memory buffer whenever the Sovereign Engine mounts.
import './ContextBus';

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
};

export function ProcessorStateProvider({ children }) {
  // Single source of truth for the engine's active render-mode.
  const [activeModule, setActiveModule] = useState('IDLE');

  const pull = useCallback((moduleId) => {
    if (!Object.prototype.hasOwnProperty.call(MODULE_REGISTRY, moduleId)) {
      // Unknown module — stay IDLE, no-op.
      return;
    }
    setActiveModule(moduleId);
    emitPulse(moduleId);
    // V68.59 — publish the active module to a global so the
    // time-capsule beacon can capture the user's last "scene" on
    // tab-hide without subscribing to ProcessorState.
    try { window.__sovereignActiveModule = moduleId; } catch { /* noop */ }
  }, []);

  const release = useCallback(() => {
    setActiveModule('IDLE');
    emitPulse('IDLE');
    try { window.__sovereignActiveModule = 'IDLE'; } catch { /* noop */ }
  }, []);

  const value = useMemo(
    () => ({ activeModule, pull, release }),
    [activeModule, pull, release],
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
    return { activeModule: 'IDLE', pull: () => {}, release: () => {} };
  }
  return ctx;
}
