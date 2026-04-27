/**
 * ResonanceAnalyzer.js — Semantic Middleware
 *
 * Pure logic service. Converts arbitrary tool output (text, JSON
 * payload, score, image-meta) into a pulse vector
 *   { bass, mid, treble, peak } ∈ [0..1]
 *
 * No React, no DOM, no events. Just math + lexicon.
 *
 * The vector is consumed by the resonance loop (ProcessorState +
 * ResonanceField) so the engine's atmospheric paint reflects what
 * the engine is actually producing, not just which tool is active.
 *
 *   Heavy / dark / battle / cold / deep   → bass spikes
 *   Bright / hope / light / fast / spark   → treble spikes
 *   Density (length / token count)         → mid surge
 *   Sentiment magnitude                    → peak flash
 */

const HEAVY_RX  = /\b(dark|battle|war|cold|deep|shadow|fear|void|abyss|grief|storm|fire|blood|wound)\b/i;
const LIGHT_RX  = /\b(bright|hope|light|fast|spark|joy|dawn|gold|crystal|breath|laugh|love|peace)\b/i;
const SACRED_RX = /\b(sacred|holy|spirit|divine|cosmos|infinite|eternity|prayer|blessing|silence)\b/i;
const ACTION_RX = /\b(strike|run|jump|cast|wield|forge|leap|charge|burst|blade|attack)\b/i;

function clamp01(n) { return Math.max(0, Math.min(1, n)); }

/**
 * Coerce any input shape into a single string the lexicon can scan.
 * Number → magnitude only. Object → JSON. Null/undefined → ''.
 */
function coerce(data) {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'number') return ''; // numeric only — mid handled below
  if (typeof data === 'object') {
    try { return JSON.stringify(data); } catch { return ''; }
  }
  return String(data);
}

/**
 * analyzeResonance — main entry point.
 *
 * @param {string|object|number} data    Raw tool output
 * @param {object}               opts
 * @param {('STANDARD'|'RAW'|'CALM'|'INTENSE')} opts.mode  Filter shape
 * @returns {{bass:number, mid:number, treble:number, peak:number}}
 */
export function analyzeResonance(data, opts = {}) {
  const { mode = 'STANDARD' } = opts;
  const text = coerce(data);

  // Density — log-scaled so a 50-char haiku ≠ a 5000-char saga.
  const len = text.length || (typeof data === 'number' ? Math.abs(data) * 50 : 0);
  const density = clamp01(Math.log10(1 + len) / 4); // 0 at len=0, ~0.75 at 1k, 1 at 10k

  // Lexicon hits — count occurrences, normalize to 0..1
  const heavyHits  = (text.match(HEAVY_RX)  ? text.match(new RegExp(HEAVY_RX, 'gi'))?.length  : 0) || 0;
  const lightHits  = (text.match(LIGHT_RX)  ? text.match(new RegExp(LIGHT_RX, 'gi'))?.length  : 0) || 0;
  const sacredHits = (text.match(SACRED_RX) ? text.match(new RegExp(SACRED_RX, 'gi'))?.length : 0) || 0;
  const actionHits = (text.match(ACTION_RX) ? text.match(new RegExp(ACTION_RX, 'gi'))?.length : 0) || 0;

  const heavyN  = clamp01(heavyHits  / 5);
  const lightN  = clamp01(lightHits  / 5);
  const sacredN = clamp01(sacredHits / 4);
  const actionN = clamp01(actionHits / 4);

  // Map to spectral bands
  let bass   = clamp01(0.20 + heavyN * 0.70 + actionN * 0.30);
  let mid    = clamp01(0.25 + density * 0.65 + sacredN * 0.20);
  let treble = clamp01(0.20 + lightN * 0.70 + sacredN * 0.30);
  let peak   = clamp01(0.20 + Math.max(heavyN, lightN, actionN) * 0.65 + density * 0.20);

  // Mode shaping — RAW passes through; CALM low-pass; INTENSE high-pass.
  if (mode === 'CALM') {
    bass   *= 0.55;
    treble *= 0.55;
    peak   *= 0.50;
    mid     = clamp01(mid * 0.85 + 0.10);
  } else if (mode === 'INTENSE') {
    bass   = clamp01(bass   * 1.30 + 0.05);
    treble = clamp01(treble * 1.30 + 0.05);
    peak   = clamp01(peak   * 1.45);
    mid    = clamp01(mid    * 1.10);
  } else if (mode === 'RAW') {
    // No shaping — direct lexicon-to-pulse.
  }
  // STANDARD: no shaping (default).

  return { bass, mid, treble, peak };
}

/**
 * blendVectors — weighted blend (used to mix a steady-state module
 * signature with a content-derived burst). Default 50/50.
 */
export function blendVectors(a, b, weight = 0.5) {
  const w = clamp01(weight);
  return {
    bass:   clamp01(a.bass   * (1 - w) + b.bass   * w),
    mid:    clamp01(a.mid    * (1 - w) + b.mid    * w),
    treble: clamp01(a.treble * (1 - w) + b.treble * w),
    peak:   clamp01((a.peak  ?? 0.5) * (1 - w) + (b.peak ?? 0.5) * w),
  };
}
