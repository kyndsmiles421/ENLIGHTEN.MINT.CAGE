/**
 * SovereignKernel — the single tap-through bus that makes every Layer-2
 * and Layer-3 interaction ripple up to the Layer-1 Hub.
 *
 * Usage (from any workshop/tool):
 *   import { SovereignKernel } from '../kernel/SovereignKernel';
 *   SovereignKernel.interact('geology.identify-quartz', { sparks: 3, resonance: 'crystal' });
 *
 * Layer-1 Hub listens:
 *   window.addEventListener('sovereign:interact', e => updateHUD(e.detail));
 *
 * Also controls the Starseed 528Hz transition lock — while active, every
 * audio node except the 528Hz solfeggio tone is muted. The MixerContext
 * subscribes to `sovereign:audio-lock` and respects the active frequency.
 */

import { assertRegistered, getTool } from './SovereignBridge';

const EVENT_INTERACT = 'sovereign:interact';
const EVENT_AUDIO_LOCK = 'sovereign:audio-lock';
const EVENT_AUDIO_UNLOCK = 'sovereign:audio-unlock';
const EVENT_PULSE = 'sovereign:pulse';

function emit(type, detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

/**
 * interact — the One True Entry Point for a user action inside a
 * workshop, material dive, or game. Enforces the Bridge Rule (tool
 * MUST be registered), then fans the event out to the Hub and any
 * HUD listeners. Returns the registered tool entry for convenience.
 */
function interact(toolId, payload = {}) {
  // Bridge-Rule enforcement — will throw in dev if unregistered.
  assertRegistered(toolId, payload.context || 'SovereignKernel.interact');
  const tool = getTool(toolId);
  const detail = {
    toolId,
    layer: tool?.layer ?? null,
    domain: tool?.domain ?? null,
    unlocks: tool?.unlocks ?? [],
    sparks: payload.sparks ?? tool?.sparks ?? 0,
    resonance: payload.resonance ?? null,
    ts: Date.now(),
    ...payload,
  };
  emit(EVENT_INTERACT, detail);
  return tool;
}

/* ─── Starseed 528Hz transition lock ─── */
function lockAudioTo528() {
  emit(EVENT_AUDIO_LOCK, { frequency: 528, reason: 'starseed_transition' });
}
function unlockAudio() {
  emit(EVENT_AUDIO_UNLOCK, { reason: 'starseed_transition_end' });
}

/* ─── 1.618s Sovereign Pulse (compat wrapper — the existing pulse
   already fires from SovereignUniverseContext; this exposes a manual
   fire so new features can request one). */
function pulse(reason = 'manual') {
  emit(EVENT_PULSE, { reason, ts: Date.now() });
}

export const SovereignKernel = {
  interact,
  lockAudioTo528,
  unlockAudio,
  pulse,
  EVENT_INTERACT,
  EVENT_AUDIO_LOCK,
  EVENT_AUDIO_UNLOCK,
  EVENT_PULSE,
};

if (typeof window !== 'undefined') {
  window.__sovereignKernel = SovereignKernel;
}

export default SovereignKernel;
