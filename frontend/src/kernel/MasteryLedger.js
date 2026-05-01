/**
 * MasteryLedger — the Adaptive Mastery Ledger.
 *
 * Records every Sovereign Kernel interaction + lab result and produces
 * per-domain mastery scores using a precision-weighted model:
 *
 *   mastery = 0.70 * precision + 0.30 * speed
 *
 *   precision = correctAttempts / totalAttempts          (0..1)
 *   speed     = 1 - clamp(avgTimeSec / targetTimeSec, 0, 1)
 *
 * The Sovereign can flip weighting to speed via the Preference Ledger,
 * which inverts the coefficients to 0.30/0.70.
 *
 * The Adaptive Model reads these scores and recommends the next
 * difficulty (easy/medium/hard). The Sovereign can always override via
 * the Preference Ledger — their choice is final.
 *
 * Storage: localStorage key `sovereign_mastery_v1`. Persists offline.
 */

import SovereignPreferences from './SovereignPreferences';

const LS_KEY = 'sovereign_mastery_v1';

function readRaw() {
  if (typeof window === 'undefined') return { events: [], scores: {} };
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { events: [], scores: {} };
  } catch {
    return { events: [], scores: {} };
  }
}

function writeRaw(next) {
  cache = next;
  try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* quota */ }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sovereign:mastery', { detail: next }));
  }
}

let cache = readRaw();

/**
 * Record a tool interaction. Precision = 1 if the interaction was the
 * "correct" one (driven by its registered unlocks); else 0. Speed is
 * inferred from `durationSec` vs the domain's target.
 *
 * Call from anywhere: `MasteryLedger.record({ toolId, domain, correct, durationSec })`
 */
function record({ toolId, domain, correct = true, durationSec = null, targetSec = 20 }) {
  const now = Date.now();
  const ev = { toolId, domain, correct: !!correct, durationSec, targetSec, ts: now };
  const next = { ...cache, events: [...cache.events, ev].slice(-500) };

  // Recompute domain score
  const domainEvents = next.events.filter(e => e.domain === domain);
  const total = domainEvents.length;
  const correctCount = domainEvents.filter(e => e.correct).length;
  const timed = domainEvents.filter(e => typeof e.durationSec === 'number');
  const avgTime = timed.length ? timed.reduce((a, e) => a + e.durationSec, 0) / timed.length : null;

  const precision = total ? correctCount / total : 0;
  const speed = avgTime === null ? 0.5 : Math.max(0, 1 - Math.min(1, avgTime / targetSec));

  const prefs = SovereignPreferences.get();
  // V1.0.7 — 'balanced' weights precision and speed equally (Sovereign
  // Omni pattern). 'speed' weights speed-heavy. Default 'precision'.
  const w = prefs.learning.weighting;
  const wPrecision = w === 'speed' ? 0.30 : w === 'balanced' ? 0.50 : 0.70;
  const wSpeed = 1 - wPrecision;
  const score = wPrecision * precision + wSpeed * speed;

  next.scores = {
    ...next.scores,
    [domain]: {
      precision, speed, score,
      total, correctCount, avgTime,
      updatedAt: now,
    },
  };
  writeRaw(next);
  return next.scores[domain];
}

function scoreFor(domain) { return cache.scores[domain] || null; }
function allScores() { return { ...cache.scores }; }

/**
 * Adaptive Model — suggest a difficulty based on the Sovereign's mastery
 * curve. The Sovereign's manual override via Preferences always wins.
 *
 *   score < 0.35 → 'easy'
 *   score < 0.70 → 'medium'
 *   score ≥ 0.70 → 'hard'
 */
function suggestDifficulty(domain) {
  const s = scoreFor(domain);
  if (!s) return 'easy';
  if (s.score < 0.35) return 'easy';
  if (s.score < 0.70) return 'medium';
  return 'hard';
}

/**
 * The effective difficulty to apply RIGHT NOW. Honors manual override.
 */
function effectiveDifficulty(domain) {
  const chosen = SovereignPreferences.get().learning.difficulty;
  if (chosen !== 'adaptive') return chosen;
  return suggestDifficulty(domain);
}

// Auto-record every Sovereign Kernel interaction (default correct=true,
// duration unknown). Labs that need precise timing should call
// `record(...)` directly with durationSec + correctness.
if (typeof window !== 'undefined') {
  window.addEventListener('sovereign:interact', (e) => {
    const { toolId, domain } = e.detail || {};
    if (toolId && domain) {
      try { record({ toolId, domain, correct: true, durationSec: null }); } catch { /* ignore */ }
    }
  });
  window.__sovereignMastery = { record, scoreFor, allScores, suggestDifficulty, effectiveDifficulty };
}

export const MasteryLedger = {
  record, scoreFor, allScores, suggestDifficulty, effectiveDifficulty,
};

export default MasteryLedger;
