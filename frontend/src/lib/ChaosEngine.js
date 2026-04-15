/**
 * ENLIGHTEN.MINT.CAFE | Chaos Engine V1.0
 * z^z / z^(z-1) feedback loop for organic "breathing" audio + visuals.
 * 
 * One source of truth. Import into Observatory, LightTherapy, SovereignCircle.
 * The chaos is OPTIONAL — each module opts in via useChaosOscillator().
 */

const PHI = 1.618033988749895;

/**
 * Core z/z math: returns a value that wobbles and snaps back to center.
 * Range: approximately -1.0 to 1.0, centered near 0.
 * @param {number} t - time in seconds
 * @param {number} coeff - chaos coefficient (1.0 = Earth, 1.618 = phi-tuned)
 */
export function chaosValue(t, coeff = 1.0) {
  const z = Math.sin(t * PHI * coeff);
  if (Math.abs(z) < 0.001) return 0;
  // z^z / z^(z-1) — the snap-back feedback loop
  const absZ = Math.abs(z);
  const sign = z >= 0 ? 1 : -1;
  const zz = Math.pow(absZ, absZ);
  const zzm1 = Math.pow(absZ, Math.max(0.01, absZ - 1));
  const raw = (zz / zzm1) * sign;
  return isFinite(raw) ? raw : 0;
}

/**
 * Map a chaos value to a frequency drift in Hz.
 * @param {number} baseHz - fundamental frequency
 * @param {number} chaos - output of chaosValue()
 * @param {number} range - max drift in Hz (default ±5)
 */
export function chaosDrift(baseHz, chaos, range = 5) {
  return baseHz + chaos * range;
}

/**
 * Map a chaos value to a visual intensity (0.3 - 0.7).
 */
export function chaosGlow(chaos) {
  return 0.45 + Math.abs(chaos) * 0.25;
}

/**
 * React hook: Chaos-modulated persistent audio oscillator.
 * Toggle-based. Returns { toggle, isPlaying, activeName, chaosState }.
 * 
 * @param {Object} options
 * @param {number} options.chaosCoeff - per-body chaos signature (default 1.0)
 * @param {number} options.driftRange - max Hz drift (default 5)
 * @param {boolean} options.chaosEnabled - master chaos toggle (default true)
 */
export function useChaosOscillator({ chaosCoeff = 1.0, driftRange = 5, chaosEnabled = true } = {}) {
  const { useRef, useState, useCallback, useEffect } = require('react');
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);
  const rafRef = useRef(null);
  const [activeHz, setActiveHz] = useState(null);
  const [activeName, setActiveName] = useState(null);
  const [chaosState, setChaosState] = useState(0);

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const ctx = ctxRef.current;
    if (ctx && nodesRef.current) {
      nodesRef.current.forEach(n => {
        try { n.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); } catch {}
      });
      setTimeout(() => {
        nodesRef.current?.forEach(n => { try { n.osc.stop(); } catch {} });
        nodesRef.current = null;
      }, 900);
    }
    setActiveHz(null);
    setActiveName(null);
    setChaosState(0);
  }, []);

  const toggle = useCallback((hz, name, bodyCoeff) => {
    // Toggle off if same
    if (activeName === name && nodesRef.current) {
      stopAll();
      return;
    }

    // Stop previous
    if (nodesRef.current) {
      cancelAnimationFrame(rafRef.current);
      nodesRef.current.forEach(n => {
        try { n.gain.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3); } catch {}
        setTimeout(() => { try { n.osc.stop(); } catch {} }, 400);
      });
      nodesRef.current = null;
    }

    // Start new
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      const ctx = ctxRef.current;
      const nodes = [];
      const coeff = bodyCoeff || chaosCoeff;

      // Primary tone
      const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = hz;
      const g1 = ctx.createGain(); g1.gain.setValueAtTime(0, ctx.currentTime);
      g1.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 1.5);
      osc1.connect(g1); g1.connect(ctx.destination); osc1.start();
      nodes.push({ osc: osc1, gain: g1, base: hz, coeff });

      // Sub-harmonic
      const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = hz / 2;
      const g2 = ctx.createGain(); g2.gain.setValueAtTime(0, ctx.currentTime);
      g2.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2);
      osc2.connect(g2); g2.connect(ctx.destination); osc2.start();
      nodes.push({ osc: osc2, gain: g2, base: hz / 2, coeff });

      // Fifth
      const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = hz * 1.5;
      const g3 = ctx.createGain(); g3.gain.setValueAtTime(0, ctx.currentTime);
      g3.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 2.5);
      osc3.connect(g3); g3.connect(ctx.destination); osc3.start();
      nodes.push({ osc: osc3, gain: g3, base: hz * 1.5, coeff });

      nodesRef.current = nodes;
      setActiveHz(hz);
      setActiveName(name);

      // Chaos modulation loop (optional)
      if (chaosEnabled) {
        const startTime = Date.now();
        const drift = () => {
          if (!nodesRef.current) return;
          const t = (Date.now() - startTime) * 0.001;
          const cv = chaosValue(t, coeff);
          setChaosState(cv);
          nodesRef.current.forEach(n => {
            const drifted = chaosDrift(n.base, cv, driftRange * (n.base / hz));
            try { n.osc.frequency.setTargetAtTime(drifted, ctx.currentTime, 0.08); } catch {}
          });
          rafRef.current = requestAnimationFrame(drift);
        };
        rafRef.current = requestAnimationFrame(drift);
      }
    } catch {}
  }, [activeName, stopAll, chaosCoeff, driftRange, chaosEnabled]);

  // Cleanup on unmount
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    nodesRef.current?.forEach(n => { try { n.osc.stop(); } catch {} });
    try { ctxRef.current?.close(); } catch {};
  }, []);

  return { toggle, activeHz, activeName, chaosState, stopAll };
}
