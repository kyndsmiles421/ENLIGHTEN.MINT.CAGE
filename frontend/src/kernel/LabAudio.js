/**
 * LabAudio — Solfeggio chimes for the LabStage.
 *
 * Pure Web Audio sine synthesis — no samples, no new dependency, stays
 * under the Metabolic Seal. Respects the Sovereign Silence Shield:
 *   • Never plays unless the user has opted in by reaching a workshop
 *     (Web Audio resumes on user gesture by browser default).
 *   • If Sovereign Preference audio.frequency === 'silence', no-op.
 *
 * Sounds:
 *   playSuccess()  → 528Hz sine, gentle PHI-ramp, ~0.9s ("Resonance Click")
 *   playFail()     → 111Hz+117Hz dissonant pair, ~0.5s (Fractal Reset)
 *   playStreak(n)  → 528Hz harmonic stack, brighter with each streak
 */

let _ctx = null;
function ctx() {
  if (_ctx) return _ctx;
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

function allowedFrequency() {
  try {
    const raw = localStorage.getItem('sovereign_preferences_v1');
    if (!raw) return 'silence';
    return JSON.parse(raw)?.audio?.frequency || 'silence';
  } catch { return 'silence'; }
}

function tone({ freq, dur = 0.7, gain = 0.12, type = 'sine', delay = 0, attack = 0.04, release = 0.3 }) {
  const c = ctx(); if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.linearRampToValueAtTime(0, t0 + dur + release);
  osc.connect(g).connect(c.destination);
  osc.start(t0); osc.stop(t0 + dur + release + 0.05);
}

export function playSuccess() {
  if (allowedFrequency() === 'silence') return;
  // 528Hz Resonance Click — a short foundational tone, a PHI-later fifth,
  // and a very quiet octave shimmer for brightness.
  tone({ freq: 528, dur: 0.42, gain: 0.16 });
  tone({ freq: 792, dur: 0.34, gain: 0.08, delay: 0.16 });   // perfect fifth above
  tone({ freq: 1056, dur: 0.28, gain: 0.04, delay: 0.32 });  // octave
}

export function playFail() {
  if (allowedFrequency() === 'silence') return;
  // Fractal Reset — 111Hz + 117Hz dissonant beats (≈6Hz binaural
  // dissonance) that reads as "rebuke" without being unpleasant.
  tone({ freq: 111, dur: 0.32, gain: 0.12, type: 'triangle' });
  tone({ freq: 117, dur: 0.32, gain: 0.10, type: 'triangle', delay: 0.02 });
}

export function playStreak(n = 1) {
  if (allowedFrequency() === 'silence') return;
  // Each streak adds one harmonic shimmer.
  const partials = [528, 792, 1056, 1320, 1584];
  for (let i = 0; i < Math.min(n, partials.length); i++) {
    tone({ freq: partials[i], dur: 0.3, gain: 0.08 - i * 0.012, delay: i * 0.1 });
  }
}

export default { playSuccess, playFail, playStreak };
