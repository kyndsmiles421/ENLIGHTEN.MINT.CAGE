/**
 * ContextBus.js — Unified Shared-Memory Buffer
 *
 * The Sovereign Engine's central nervous system. Every active
 * generator commits its output here; every newly pulled tool reads
 * from here to pre-prime its prompt with the engine's current state.
 *
 * No backend, no React context — a plain singleton living for the
 * lifetime of the engine session. Survives module swaps (the
 * ProcessorState pull/release does NOT clear the bus). Cleared only
 * on logout / hard refresh.
 *
 *   worldMetadata   — { biome, threatLevel, era, locale, … }   (Game)
 *   narrativeContext — { theme, mood, lastBeat, history, … }   (Story / Forecast / Dream)
 *   entityState      — { name, archetype, traits, glyph, … }    (Avatar / Cosmic Portrait)
 *   sceneFrame       — { paletteHex, composition, motion, … }  (Scene Gen)
 *
 * The Resonance Analyzer is auto-subscribed: every commit fires a
 * `sovereign:pulse` derived from the new payload, so the field
 * paints WHATEVER the engine is currently thinking — even when the
 * user isn't actively in that tool's render slot.
 */
import { analyzeResonance } from '../services/ResonanceAnalyzer';
import { getResonanceSettings } from './ResonanceSettings';

const STORAGE_KEY = 'emcafe_context_bus_v1';

const initial = () => ({
  worldMetadata: null,
  narrativeContext: null,
  entityState: null,
  sceneFrame: null,
  history: [], // ordered log of last 16 commits, oldest dropped
});

let state = (() => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch { /* noop */ }
  return initial();
})();

const subscribers = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch { /* noop */ }
}

function clamp01(n) { return Math.max(0, Math.min(1, n)); }

/**
 * commit(key, data) — write to the bus.
 *
 * @param {'worldMetadata'|'narrativeContext'|'entityState'|'sceneFrame'} key
 * @param {object|string} data    The tool's output (object preferred).
 * @param {object}        [meta]  Optional { moduleId } so the auto-pulse
 *                                blends with the originating tool's
 *                                signature.
 */
export function commit(key, data, meta = {}) {
  if (!key || data == null) return;
  state = {
    ...state,
    [key]: data,
    history: [
      ...state.history.slice(-15),
      { key, t: Date.now(), moduleId: meta.moduleId || null },
    ],
  };
  persist();

  // 1) Notify any subscribed tools (cross-tool priming reactivity)
  try {
    window.dispatchEvent(new CustomEvent('sovereign:context-update', {
      detail: { key, data, moduleId: meta.moduleId || null, snapshot: { ...state } },
    }));
  } catch { /* noop */ }

  // 2) Drive the Resonance Field — the field paints whatever was just
  //    committed, even if the user isn't currently in that tool's slot.
  try {
    const live = getResonanceSettings();
    const vec = analyzeResonance(data, { mode: live.mode });
    const k = Math.max(0, Math.min(2, live.gain || 1));
    const burst = {
      bass:   clamp01(vec.bass   * k),
      mid:    clamp01(vec.mid    * k),
      treble: clamp01(vec.treble * k),
      peak:   clamp01((vec.peak ?? 0.5) * k),
    };
    window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: burst }));
  } catch { /* noop */ }

  // 3) Local subscribers (React hook callers)
  subscribers.forEach((fn) => { try { fn(state); } catch { /* noop */ } });
}

/** read() — current snapshot. Always returns a fresh object. */
export function read() { return { ...state }; }

/** readKey(key) — single field. Convenience for primer prompts. */
export function readKey(key) { return state[key] ?? null; }

/** subscribe(fn) — receives the full snapshot on every commit. */
export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** clear() — wipe the bus (logout / new sovereign session). */
export function clear() {
  state = initial();
  persist();
  subscribers.forEach((fn) => { try { fn(state); } catch { /* noop */ } });
  try {
    window.dispatchEvent(new CustomEvent('sovereign:context-update', {
      detail: { key: '__cleared__', data: null, snapshot: { ...state } },
    }));
  } catch { /* noop */ }
}

/**
 * primerForPrompt(activeKey) — formatted string a generator can
 * append to its system prompt. Returns '' when the bus is empty so
 * tools degrade gracefully on the first generation of a session.
 */
export function primerForPrompt(activeKey) {
  const parts = [];
  const skip = activeKey || '';
  if (state.worldMetadata && skip !== 'worldMetadata') {
    parts.push(`Current world: ${typeof state.worldMetadata === 'string' ? state.worldMetadata : JSON.stringify(state.worldMetadata)}`);
  }
  if (state.narrativeContext && skip !== 'narrativeContext') {
    parts.push(`Current narrative: ${typeof state.narrativeContext === 'string' ? state.narrativeContext.slice(0, 600) : JSON.stringify(state.narrativeContext).slice(0, 600)}`);
  }
  if (state.entityState && skip !== 'entityState') {
    parts.push(`Current sovereign entity: ${typeof state.entityState === 'string' ? state.entityState : JSON.stringify(state.entityState)}`);
  }
  if (state.sceneFrame && skip !== 'sceneFrame') {
    parts.push(`Current scene palette: ${typeof state.sceneFrame === 'string' ? state.sceneFrame : JSON.stringify(state.sceneFrame)}`);
  }
  if (!parts.length) return '';
  return `\n\n[ContextBus — the engine's current state, weave this into your output where natural]\n${parts.join('\n')}\n`;
}

// Expose to window for cross-cutting reads from non-React modules
if (typeof window !== 'undefined') {
  window.ContextBus = { commit, read, readKey, subscribe, clear, primerForPrompt };
}
