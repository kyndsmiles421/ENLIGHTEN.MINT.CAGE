/**
 * solfeggioTone.js — V68.4 Phase D
 *
 * Web Audio API Solfeggio tones (no libraries, no new deps).
 * Called on quest-complete to deliver the "Cinematic Card Drop" audio stamp.
 *
 * 528 Hz = "Mi" — the transformation / DNA-repair frequency in Solfeggio tradition.
 * 432 Hz = "Natural" tuning — universal resonance.
 *
 * Usage:
 *   import { playSolfeggio } from '../utils/solfeggioTone';
 *   playSolfeggio(528, 1.8);
 */

let _ctx = null;

function getCtx() {
  if (_ctx) return _ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
  } catch {
    return null;
  }
  return _ctx;
}

/**
 * Play a Solfeggio tone with a soft bell envelope.
 * @param {number} freq  Base frequency in Hz (default 528 — transformation).
 * @param {number} duration Duration in seconds.
 * @param {number} gain  Peak gain (0.0–1.0).
 */
export function playSolfeggio(freq = 528, duration = 1.8, gain = 0.18) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    // ── Layer 1: fundamental tone (sine) ──
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    osc1.connect(g1);
    g1.connect(ctx.destination);

    // ── Layer 2: harmonic octave (soft triangle @ 2x, -12dB) ──
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    osc2.connect(g2);
    g2.connect(ctx.destination);

    // ── Bell envelope: swift attack, long decay ──
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(gain, now + 0.04);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(gain * 0.35, now + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration * 0.7 + 0.05);
  } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
}

/**
 * Cinematic chord: three Solfeggio frequencies stacked for quest completion.
 * 528 (transformation) + 639 (connection) + 741 (awakening).
 */
export function playQuestCompleteChord() {
  playSolfeggio(528, 2.2, 0.16);
  setTimeout(() => playSolfeggio(639, 1.8, 0.12), 140);
  setTimeout(() => playSolfeggio(741, 1.5, 0.10), 280);
}
