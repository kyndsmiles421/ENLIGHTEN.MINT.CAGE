/**
 * SovereignPreferences — the Sovereign Choice Protocol, persisted.
 *
 * Single source of truth for every USER CHOICE that shapes the app:
 *   • audio.frequency  — '432hz' | '528hz' | 'silence'  (default: 'silence')
 *   • visual.skin      — 'refracted-crystal' | 'neo-kyoto'  (default: 'neo-kyoto')
 *   • motion.reduce    — boolean  (epilepsy / vestibular safety)
 *
 * Storage: localStorage (instant, offline-safe). Optional: sync to
 * /api/preferences when the user is signed in (next commit).
 *
 * Every read returns a literal chosen value — NO implicit defaults past
 * what's listed above. Components must adapt to the Sovereign's choice.
 *
 * Subscribe:
 *   const unsub = SovereignPreferences.subscribe(next => render(next));
 *
 * Broadcast to the rest of the app on any change:
 *   window event 'sovereign:preferences' { detail: <full prefs object> }
 */

const LS_KEY = 'sovereign_preferences_v1';

const DEFAULTS = Object.freeze({
  audio: { frequency: 'silence' },       // Silence Shield default — user must choose
  visual: { skin: 'neo-kyoto' },          // current shipped aesthetic is baseline
  motion: { reduce: false },
});

const listeners = new Set();

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function readRaw() {
  if (typeof window === 'undefined') return clone(DEFAULTS);
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return clone(DEFAULTS);
    const parsed = JSON.parse(raw);
    // Deep merge with defaults so new fields don't throw
    return {
      audio: { ...DEFAULTS.audio, ...(parsed.audio || {}) },
      visual: { ...DEFAULTS.visual, ...(parsed.visual || {}) },
      motion: { ...DEFAULTS.motion, ...(parsed.motion || {}) },
    };
  } catch {
    return clone(DEFAULTS);
  }
}

let cache = readRaw();

function writeRaw(next) {
  cache = next;
  try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* quota */ }
  listeners.forEach(fn => { try { fn(clone(cache)); } catch { /* ignore */ } });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sovereign:preferences', { detail: clone(cache) }));
  }
  // Reflect visual skin on <html> for global CSS theming
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-sov-skin', next.visual.skin);
  }
}

function get() { return clone(cache); }
function getAudioFrequency() { return cache.audio.frequency; }
function getVisualSkin() { return cache.visual.skin; }
function getReduceMotion() { return cache.motion.reduce; }

function setAudioFrequency(value) {
  if (!['432hz', '528hz', 'silence'].includes(value)) {
    throw new Error(`[SovereignPreferences] invalid audio.frequency: ${value}`);
  }
  writeRaw({ ...cache, audio: { ...cache.audio, frequency: value } });
}

function setVisualSkin(value) {
  if (!['refracted-crystal', 'neo-kyoto'].includes(value)) {
    throw new Error(`[SovereignPreferences] invalid visual.skin: ${value}`);
  }
  writeRaw({ ...cache, visual: { ...cache.visual, skin: value } });
}

function setReduceMotion(value) {
  writeRaw({ ...cache, motion: { ...cache.motion, reduce: !!value } });
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Initial <html> skin reflection so CSS applies at first paint
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-sov-skin', cache.visual.skin);
}
if (typeof window !== 'undefined') {
  window.__sovereignPreferences = { get, setAudioFrequency, setVisualSkin, setReduceMotion, subscribe };
}

export const SovereignPreferences = {
  get, getAudioFrequency, getVisualSkin, getReduceMotion,
  setAudioFrequency, setVisualSkin, setReduceMotion,
  subscribe,
};

export default SovereignPreferences;
