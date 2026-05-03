/**
 * SageVoiceController.js — V1.0.11 ElevenLabs narration bridge.
 *
 * A single audio element + a fetch helper. Keeps state out of React
 * because narration is a side effect of ritual events, not UI state:
 *   - speak(text)            → fetch /api/voice/sage-narrate, play returned base64
 *   - stop()                 → cancel current playback
 *   - subscribe(fn)          → ['idle' | 'speaking' | 'unavailable'] state stream
 *
 * Designed to fail gracefully:
 *   - 503 "key not configured" → flips state to 'unavailable' once,
 *     emits an event the HUD can render as a "Configure key" hint, and
 *     stays quiet for the rest of the session (no repeated 503 spam).
 *   - Any other error → state returns to 'idle', user is never blocked.
 *
 * Auth: reads zen_token from localStorage. Skips entirely for guests.
 */

const STATE = { state: 'idle', reason: null };
const subscribers = new Set();
let audioEl = null;
let currentRequestId = 0;
let unavailableNoticed = false;

function _audio() {
  if (!audioEl && typeof Audio !== 'undefined') {
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.addEventListener('ended', () => _setState('idle'));
    audioEl.addEventListener('error', () => _setState('idle'));
  }
  return audioEl;
}

function _setState(next, reason = null) {
  if (STATE.state === next && STATE.reason === reason) return;
  STATE.state = next;
  STATE.reason = reason;
  subscribers.forEach((fn) => { try { fn({ ...STATE }); } catch { /* noop */ } });
  try {
    window.dispatchEvent(new CustomEvent('sage-voice:state', {
      detail: { ...STATE },
    }));
  } catch { /* noop */ }
}

export function subscribe(fn) {
  subscribers.add(fn);
  fn({ ...STATE });
  return () => subscribers.delete(fn);
}

export function getState() { return { ...STATE }; }

export function stop() {
  const a = _audio();
  if (a) {
    try { a.pause(); a.currentTime = 0; } catch { /* noop */ }
  }
  currentRequestId += 1; // any in-flight fetch becomes stale
  _setState('idle');
}

export async function speak(text, opts = {}) {
  const txt = (text || '').trim();
  if (!txt) return;
  if (unavailableNoticed) return;   // be quiet after a 503 'no key' result

  let token = null;
  try { token = localStorage.getItem('zen_token'); } catch { /* noop */ }
  if (!token || token === 'guest_token') return;

  const reqId = ++currentRequestId;
  _setState('loading');

  try {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/voice/sage-narrate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: txt.slice(0, 800),
        voice_id: opts.voiceId,
        model_id: opts.modelId,
      }),
    });
    if (reqId !== currentRequestId) return; // user moved on, drop

    if (res.status === 503) {
      unavailableNoticed = true;
      _setState('unavailable', 'no-key');
      return;
    }
    if (!res.ok) {
      _setState('idle');
      return;
    }
    const data = await res.json();
    if (reqId !== currentRequestId) return;
    if (!data?.audio_url) { _setState('idle'); return; }

    const a = _audio();
    if (!a) { _setState('idle'); return; }
    a.src = data.audio_url;
    _setState('speaking');
    try {
      // Browsers may require user-gesture-bound playback. The wand /
      // HUD speaker click both happen inside a user click, so this is
      // safe in practice. If autoplay is blocked, we drop to idle.
      await a.play();
    } catch {
      _setState('idle');
    }
  } catch {
    if (reqId === currentRequestId) _setState('idle');
  }
}

export async function checkAvailability() {
  let token = null;
  try { token = localStorage.getItem('zen_token'); } catch { /* noop */ }
  if (!token || token === 'guest_token') return { configured: false };
  try {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/voice/sage-narrate/status`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { configured: false };
    return await res.json();
  } catch {
    return { configured: false };
  }
}

if (typeof window !== 'undefined') {
  window.SageVoice = { speak, stop, getState, subscribe, checkAvailability };
}
