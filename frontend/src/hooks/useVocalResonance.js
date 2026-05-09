/**
 * useVocalResonance.js — Microphone-driven pulse emitter (V68.57)
 *
 * Captures the user's voice via Web Audio API, runs a 256-bin FFT,
 * and dispatches `sovereign:pulse` ~30 times/sec so the Crystalline
 * Lattice columns rise and fall with the user's tone in real-time.
 *
 * Voice band mapping (256-bin FFT, ~22kHz half-rate):
 *   bass    bins 0-3      (~0–700 Hz)   — fundamentals
 *   mid     bins 4-15     (~700–2700 Hz) — vowels
 *   treble  bins 16-63    (~2700–11kHz)  — consonants & sibilance
 *   peak    = max(bass, mid, treble) × global gain
 *
 * Opt-in: getUserMedia is only called when start() is invoked. No
 * background mic access. Stop releases the MediaStreamTrack and
 * closes the AudioContext.
 *
 * Returns: { isHot, error, start, stop, levels }
 *   isHot  — true while the mic is actively analysing
 *   error  — null | 'permission-denied' | 'unsupported' | 'unknown'
 *   levels — last-emitted {bass, mid, treble, peak}, useful for
 *            rendering an in-UI VU meter
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getResonanceSettings } from '../state/ResonanceSettings';

const TARGET_HZ = 30;          // dispatch cadence — 30 pulses/sec
const FRAME_MS  = 1000 / TARGET_HZ;

function avg(arr, from, to) {
  let s = 0; let n = 0;
  for (let i = from; i <= to && i < arr.length; i++) { s += arr[i]; n++; }
  return n ? (s / n) / 255 : 0; // normalize 0..1
}

export function useVocalResonance() {
  const [isHot, setIsHot]  = useState(false);
  const [error, setError]  = useState(null);
  const [levels, setLevels] = useState({ bass: 0, mid: 0, treble: 0, peak: 0 });

  const ctxRef     = useRef(null);
  const analyserRef = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const lastTickRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } });
      streamRef.current = null;
    }
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      ctxRef.current = null;
    }
    analyserRef.current = null;
    setIsHot(false);
    setLevels({ bass: 0, mid: 0, treble: 0, peak: 0 });
    // Return the field to ambient
    try {
      window.dispatchEvent(new CustomEvent('sovereign:pulse', {
        detail: { bass: 0.10, mid: 0.18, treble: 0.20, peak: 0.05 },
      }));
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('unsupported');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
        video: false,
      });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) { setError('unsupported'); stream.getTracks().forEach((t) => t.stop()); return false; }
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser);

      streamRef.current = stream;
      ctxRef.current = ctx;
      analyserRef.current = analyser;

      const bins = new Uint8Array(analyser.frequencyBinCount);
      lastTickRef.current = 0;

      const loop = (t) => {
        rafRef.current = requestAnimationFrame(loop);
        if (t - lastTickRef.current < FRAME_MS) return;
        lastTickRef.current = t;

        analyser.getByteFrequencyData(bins);
        const bass   = avg(bins, 0, 3);
        const mid    = avg(bins, 4, 15);
        const treble = avg(bins, 16, 63);
        const peak   = Math.max(bass, mid, treble);

        const live = getResonanceSettings();
        const k = Math.max(0, Math.min(2, live.gain || 1));
        const detail = {
          bass:   Math.min(1, bass   * k),
          mid:    Math.min(1, mid    * k),
          treble: Math.min(1, treble * k),
          peak:   Math.min(1, peak   * k),
        };
        try {
          window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail }));
        } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        setLevels(detail);
      };

      rafRef.current = requestAnimationFrame(loop);
      setIsHot(true);
      return true;
    } catch (e) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') setError('permission-denied');
      else setError('unknown');
      return false;
    }
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { isHot, error, start, stop, levels };
}
