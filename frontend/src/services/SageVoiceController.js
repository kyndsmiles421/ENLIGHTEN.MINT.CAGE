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
 *     emits an event the HUD can render as a "Configure key" hint, but
 *     auto-clears after 90s and on tab refocus so a single transient
 *     ElevenLabs 503 (free-tier IP block, brief network blip) does NOT
 *     poison the UI for the rest of the session.
 *   - Any other error → state returns to 'idle', user is never blocked.
 *
 * Auth: reads zen_token from localStorage. Skips entirely for guests.
 */

const STATE = { state: 'idle', reason: null };
const subscribers = new Set();
let audioEl = null;
let currentRequestId = 0;
let unavailableNoticed = false;
let _gestureUnlocked = false;

// V1.2.5 — Auto-clear sticky 'unavailable' so a single transient 503
// from ElevenLabs (free-tier cloud-IP block, brief network blip, rate
// limiter) does not silence Sage Voice for the rest of the session.
// Reduced from 90s → 25s based on user reports of being stuck on
// "Voice Resting" mid-scene with no recovery path. Also cleared on
// any explicit `speak()` call (the user retry) below.
const UNAVAILABLE_RESET_MS = 25 * 1000;
let _unavailableSetAt = 0;

function _maybeResetUnavailable() {
  if (!unavailableNoticed) return;
  if (Date.now() - _unavailableSetAt > UNAVAILABLE_RESET_MS) {
    unavailableNoticed = false;
    _setState('idle');
  }
}

/** Force-clear the unavailable flag — used when the user explicitly
 *  taps the narration pill. A user tap is itself a re-probe signal:
 *  if they're tapping, they want voice and we should try again. */
export function retry() {
  unavailableNoticed = false;
  _unavailableSetAt = 0;
  if (STATE.state === 'unavailable') _setState('idle');
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Tab refocused — give the user another shot at voice.
      unavailableNoticed = false;
      if (STATE.state === 'unavailable') _setState('idle');
    }
  });
}

function _audio() {
  if (!audioEl && typeof Audio !== 'undefined') {
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.crossOrigin = 'anonymous';  // V1.0.16 — allow MediaElementSource for FFT
    audioEl.addEventListener('ended', () => _setState('idle'));
    audioEl.addEventListener('error', () => _setState('idle'));
  }
  return audioEl;
}

/**
 * V1.1.25 — Mobile autoplay unlock. Call this synchronously inside a
 * user-gesture handler (e.g. button onClick) BEFORE any async work.
 * Plays a 1-frame silent buffer to "unlock" the cached audio element
 * for subsequent fetched narration. Without this, iOS Safari and
 * Android Chrome reject Audio.play() with NotAllowedError after any
 * `await fetch(...)` has elapsed — which is why "HEAR IT" buttons
 * appeared dead on mobile.
 *
 * Idempotent — safe to call on every gesture.
 */
export function unlockAudio() {
  if (_gestureUnlocked) return;
  const a = _audio();
  if (!a) return;
  try {
    a.muted = true;
    a.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID/////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAAAnFD9Hgf////////////////////////////////////////////////////////////////////////////////////////////////////////8=';
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => { /* ok */ });
    setTimeout(() => {
      try { a.pause(); a.currentTime = 0; a.muted = false; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    }, 50);
    _gestureUnlocked = true;
  } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
}

// V1.0.16 — Singleton AudioContext + AnalyserNode for FFT vertex
// displacement. Wired ONCE on first speak() so we don't violate the
// browser's "user gesture required" autoplay policy. Consumed by
// useSageFFT() inside Chamber3DGame.
let _audioCtx = null;
let _analyser = null;
let _sourceNode = null;
const _fftBins = 64;

function _ensureAnalyser() {
  if (_analyser) return _analyser;
  const a = _audio();
  if (!a) return null;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _audioCtx = new Ctx();
    _sourceNode = _audioCtx.createMediaElementSource(a);
    _analyser = _audioCtx.createAnalyser();
    _analyser.fftSize = 256;  // → 128 frequency bins
    _analyser.smoothingTimeConstant = 0.7;
    _sourceNode.connect(_analyser);
    _analyser.connect(_audioCtx.destination);
  } catch (e) {
    // Some browsers throw if MediaElementSource was already created;
    // safe to swallow — we just won't have FFT this session.
    return null;
  }
  return _analyser;
}

export function getSageAnalyser() {
  return _ensureAnalyser();
}

export function getSageAudioContext() {
  _ensureAnalyser();
  return _audioCtx;
}

// V1.0.12 — Calm-immersion contract: when user is in calm mode the
// audio is BOTH (a) synthesized with softer ElevenLabs settings (server
// side) AND (b) played at 40% gain client side. Both contribute — the
// server side affects timbre, the client side affects loudness.
function _isCalm() {
  try {
    const raw = localStorage.getItem('cosmic_prefs');
    if (!raw) return false;
    return (JSON.parse(raw) || {}).immersionLevel === 'calm';
  } catch { return false; }
}

function _setState(next, reason = null) {
  if (STATE.state === next && STATE.reason === reason) return;
  STATE.state = next;
  STATE.reason = reason;
  subscribers.forEach((fn) => { try { fn({ ...STATE }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } });
  try {
    window.dispatchEvent(new CustomEvent('sage-voice:state', {
      detail: { ...STATE },
    }));
  } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
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
    try { a.pause(); a.currentTime = 0; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }
  currentRequestId += 1; // any in-flight fetch becomes stale
  _setState('idle');
}

export async function speak(text, opts = {}) {
  const txt = (text || '').trim();
  if (!txt) return;
  _maybeResetUnavailable();
  if (unavailableNoticed) return;   // be quiet after a 503 'no key' result

  let token = null;
  try { token = localStorage.getItem('zen_token'); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  if (!token || token === 'guest_token') return;

  const reqId = ++currentRequestId;
  _setState('loading');

  // V1.0.12 — auto-detect calm so both server-side timbre + client-side
  // gain drop in lockstep without the caller having to know.
  const calm = opts.calm !== undefined ? !!opts.calm : _isCalm();

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
        language: opts.language,  // V1.1.14 — LanguageBar → backend voice routing
        calm,
      }),
    });
    if (reqId !== currentRequestId) return; // user moved on, drop

    if (res.status === 503) {
      unavailableNoticed = true;
      _unavailableSetAt = Date.now();
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
    a.volume = calm ? 0.4 : 1.0;
    // V1.0.16 — wire analyser graph just-in-time (after first user gesture)
    _ensureAnalyser();
    if (_audioCtx && _audioCtx.state === 'suspended') { try { await _audioCtx.resume(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }
    _setState('speaking');
    try {
      // Notify any FFT consumers (Chamber3DGame meshes) that Sage is speaking
      try { window.dispatchEvent(new CustomEvent('sage:narrate', { detail: { url: data.audio_url } })); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      await a.play();
    } catch {
      _setState('idle');
    }
  } catch {
    if (reqId === currentRequestId) _setState('idle');
  }
}

// V1.0.12 — Voice sample preview. Reads from the cached
// /api/voice/sample endpoint so repeat clicks don't burn characters.
// The HUD subscribes to the same state stream as `speak()`, so the
// HUD speaker icon mirrors the "speaking" state during preview —
// keeping visual feedback consistent across the system.
export async function previewSample(opts = {}) {
  _maybeResetUnavailable();
  if (unavailableNoticed) return;
  let token = null;
  try { token = localStorage.getItem('zen_token'); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  if (!token || token === 'guest_token') return;

  const reqId = ++currentRequestId;
  _setState('loading');

  const calm = opts.calm !== undefined ? !!opts.calm : _isCalm();
  const params = new URLSearchParams();
  if (opts.voiceId) params.set('voice_id', opts.voiceId);
  if (calm) params.set('calm', 'true');

  try {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/voice/sample?${params.toString()}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (reqId !== currentRequestId) return;
    if (res.status === 503) {
      unavailableNoticed = true;
      _unavailableSetAt = Date.now();
      _setState('unavailable', 'no-key');
      return;
    }
    if (!res.ok) { _setState('idle'); return; }
    const data = await res.json();
    if (reqId !== currentRequestId) return;
    if (!data?.audio_url) { _setState('idle'); return; }

    const a = _audio();
    if (!a) { _setState('idle'); return; }
    a.src = data.audio_url;
    a.volume = calm ? 0.4 : 1.0;
    _setState('speaking');
    try { await a.play(); } catch { _setState('idle'); }
  } catch {
    if (reqId === currentRequestId) _setState('idle');
  }
}

export async function checkAvailability() {
  let token = null;
  try { token = localStorage.getItem('zen_token'); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
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
  window.SageVoice = { speak, previewSample, stop, getState, subscribe, checkAvailability, retry };
}
