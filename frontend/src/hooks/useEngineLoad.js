/**
 * useEngineLoad.js — Cognitive Voltmeter (V68.58)
 *
 * Listens to `sovereign:context-update` and `sovereign:state-shift`
 * events on the global bus and computes a live "engine load" value
 * via a sliding 30-second exponential moving average.
 *
 *   load   ∈ [0..1]   recent activity intensity
 *   state  'cold' | 'flow' | 'overheating'
 *
 * Thresholds:
 *   cold        load < 0.15   — engine idle, columns ambient
 *   flow        0.15..0.70    — gold zone, sustained creation
 *   overheating load > 0.70   — too much, too fast — chaotic field
 *
 * No backend, no setInterval polling — purely event-driven decay
 * via requestAnimationFrame. Lightweight enough to mount in any
 * panel without measurable cost.
 */
import { useEffect, useRef, useState } from 'react';

const DECAY_HALF_LIFE_MS = 12_000; // load halves every 12s of silence
const COLD_LIMIT = 0.15;
const OVERHEAT_LIMIT = 0.70;
const TICK_HZ = 4;               // 4 React updates/sec is plenty for a gauge

function classify(load) {
  if (load < COLD_LIMIT) return 'cold';
  if (load > OVERHEAT_LIMIT) return 'overheating';
  return 'flow';
}

export function useEngineLoad() {
  const [load, setLoad] = useState(0);
  const [state, setState] = useState('cold');
  // Internal accumulator — updated from event listeners + decay loop
  const loadRef = useRef(0);
  const lastTickRef = useRef(performance.now());

  useEffect(() => {
    // Each event "injects" a small charge proportional to the
    // payload's semantic weight. Bus commits weigh more than mere
    // module pulls because they represent persisted state changes.
    const onContext = (e) => {
      const k = e?.detail?.key;
      // worldMetadata / narrative / entity = heavier; sceneFrame lighter
      const weight = k === 'sceneFrame' ? 0.10 : 0.18;
      loadRef.current = Math.min(1, loadRef.current + weight);
    };
    const onShift = () => {
      // Pulling a tool — small spike
      loadRef.current = Math.min(1, loadRef.current + 0.06);
    };
    window.addEventListener('sovereign:context-update', onContext);
    window.addEventListener('sovereign:state-shift', onShift);

    let raf;
    const tickIntervalMs = 1000 / TICK_HZ;
    let lastUiPush = 0;

    const decayDecayPerMs = Math.log(2) / DECAY_HALF_LIFE_MS; // exp decay constant

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = t - lastTickRef.current;
      lastTickRef.current = t;
      // Exponential decay toward 0
      loadRef.current *= Math.exp(-decayDecayPerMs * dt);

      if (t - lastUiPush >= tickIntervalMs) {
        lastUiPush = t;
        const v = Math.max(0, Math.min(1, loadRef.current));
        const st = classify(v);
        setLoad(v);
        setState(st);
        // V68.59 — publish to a global so the time-capsule beacon
        // can read the latest gauge state without subscribing.
        try { window.__sovereignGauge = { load: v, state: st, t: Date.now() }; } catch { /* noop */ }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('sovereign:context-update', onContext);
      window.removeEventListener('sovereign:state-shift', onShift);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { load, state, COLD_LIMIT, OVERHEAT_LIMIT };
}
