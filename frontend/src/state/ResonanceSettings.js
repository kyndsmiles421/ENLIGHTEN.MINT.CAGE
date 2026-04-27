/**
 * ResonanceSettings.js — Global tuning state for the resonance loop.
 *
 * Backs `window.RESONANCE_SETTINGS` so any module (the analyzer, the
 * pulse emitter, ProcessorState, individual tools) can read the
 * current gain/mode without prop-drilling. The Tuning panel writes
 * to this same object; readers re-read on every pulse so changes
 * apply immediately.
 *
 *   gain  — 0..2  · multiplier on every emitted pulse (default 1.0)
 *   mode  — RAW | STANDARD | CALM | INTENSE
 *
 * RAW       direct data-to-pulse, no shaping (most reactive)
 * STANDARD  default — analyzer's natural curve
 * CALM      low-pass — dampens bass + treble, smooths peaks
 * INTENSE   high-pass — amplifies bass + treble + peaks
 */

export const RESONANCE_MODES = ['RAW', 'STANDARD', 'CALM', 'INTENSE'];

const STORAGE_KEY = 'emcafe_resonance_settings_v1';

const DEFAULTS = { gain: 1.0, mode: 'STANDARD' };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      gain: typeof parsed.gain === 'number' ? Math.max(0, Math.min(2, parsed.gain)) : DEFAULTS.gain,
      mode: RESONANCE_MODES.includes(parsed.mode) ? parsed.mode : DEFAULTS.mode,
    };
  } catch { return { ...DEFAULTS }; }
}

function save(settings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* noop */ }
}

/** Initialize once at app boot. Idempotent. */
export function initResonanceSettings() {
  if (typeof window === 'undefined') return;
  if (!window.RESONANCE_SETTINGS) {
    window.RESONANCE_SETTINGS = load();
  }
}

/** Read the live settings — always returns a fresh object. */
export function getResonanceSettings() {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  if (!window.RESONANCE_SETTINGS) initResonanceSettings();
  return { ...window.RESONANCE_SETTINGS };
}

/** Write — persists to localStorage and notifies the engine. */
export function setResonanceSettings(patch) {
  if (typeof window === 'undefined') return;
  initResonanceSettings();
  const next = { ...window.RESONANCE_SETTINGS, ...patch };
  if (typeof next.gain === 'number') next.gain = Math.max(0, Math.min(2, next.gain));
  if (!RESONANCE_MODES.includes(next.mode)) next.mode = DEFAULTS.mode;
  window.RESONANCE_SETTINGS = next;
  save(next);
  try {
    window.dispatchEvent(new CustomEvent('sovereign:resonance-settings', { detail: next }));
  } catch { /* noop */ }
}
