import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// ━━━ Solfeggio Frequency Map — Route-based ambient resonance ━━━
// Each domain maps to a specific healing/creative frequency
const ROUTE_FREQUENCIES = {
  // Spotless Solutions domain — 432Hz (steady, grounding, natural)
  '/spotless': 432,
  '/cleaning': 432,
  '/sanitation': 432,
  '/nourishment': 432,

  // Enlightenment Cafe domain — 528Hz (transformation, miracles, DNA repair)
  '/elixirs': 528,
  '/herbology': 528,
  '/meal-planning': 528,
  '/aromatherapy': 528,

  // Tech/Dev domain — 741Hz (expression, solutions, awakening intuition)
  '/suanpan': 741,
  '/sovereign': 741,
  '/hub': 741,
  '/codex': 741,
  '/mastery-path': 741,

  // Meditation — 396Hz (liberation from fear)
  '/meditation': 396,
  '/breathing': 396,
  '/zen-garden': 396,
  '/mantras': 396,

  // Star Charts / Divination — 852Hz (spiritual order, third eye)
  '/star-chart': 852,
  '/oracle': 852,
  '/numerology': 852,
  '/cardology': 852,
  '/mayan': 852,

  // Wellness / Frequencies — 639Hz (connecting, relationships)
  '/frequencies': 639,
  '/yoga': 639,
  '/reiki': 639,
  '/acupressure': 639,
  '/wellness-reports': 639,

  // Creative / Music — 963Hz (pure tone, cosmic consciousness)
  '/dance-music': 963,
  '/music-lounge': 963,
  '/cosmic-mixer': 963,
  '/theory': 963,

  // Default for unmatched routes
  default: 432,
};

// Binaural offset for 8D-like depth (Hz difference between ears)
const BINAURAL_OFFSET = 7; // 7Hz theta wave entrainment

// ━━━ Phonic Resonance Hook ━━━
// Generates ambient Web Audio frequency based on current route
export function usePhonicResonance(enabled = true, volume = 0.03) {
  const location = useLocation();
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const oscRRef = useRef(null); // Right channel for binaural
  const gainRef = useRef(null);
  const panRef = useRef(null);
  const panRRef = useRef(null);
  const currentFreqRef = useRef(0);
  const fadeIntervalRef = useRef(null);

  // Get frequency for current route
  const getFrequency = useCallback(() => {
    const path = location.pathname;
    // Exact match first
    if (ROUTE_FREQUENCIES[path]) return ROUTE_FREQUENCIES[path];
    // Prefix match
    for (const [route, freq] of Object.entries(ROUTE_FREQUENCIES)) {
      if (route !== 'default' && path.startsWith(route)) return freq;
    }
    return ROUTE_FREQUENCIES.default;
  }, [location.pathname]);

  // Smooth frequency transition (avoid clicks)
  const transitionFrequency = useCallback((targetFreq) => {
    if (!oscRef.current || !ctxRef.current) return;
    if (currentFreqRef.current === targetFreq) return;

    const ctx = ctxRef.current;
    oscRef.current.frequency.linearRampToValueAtTime(
      targetFreq, ctx.currentTime + 2.0 // 2-second crossfade
    );
    if (oscRRef.current) {
      oscRRef.current.frequency.linearRampToValueAtTime(
        targetFreq + BINAURAL_OFFSET, ctx.currentTime + 2.0
      );
    }
    currentFreqRef.current = targetFreq;
  }, []);

  // Initialize Web Audio
  useEffect(() => {
    if (!enabled) return;

    // Lazy-init audio context on first interaction
    const initAudio = () => {
      if (ctxRef.current) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctxRef.current = ctx;

        // Master gain (very quiet ambient)
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainRef.current = masterGain;

        // Left oscillator (base frequency)
        const panL = ctx.createStereoPanner();
        panL.pan.setValueAtTime(-0.3, ctx.currentTime);
        panL.connect(masterGain);
        panRef.current = panL;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const freq = getFrequency();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(panL);
        osc.start();
        oscRef.current = osc;
        currentFreqRef.current = freq;

        // Right oscillator (binaural offset for depth)
        const panR = ctx.createStereoPanner();
        panR.pan.setValueAtTime(0.3, ctx.currentTime);
        panR.connect(masterGain);
        panRRef.current = panR;

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(freq + BINAURAL_OFFSET, ctx.currentTime);
        oscR.connect(panR);
        oscR.start();
        oscRRef.current = oscR;

        // Fade in over 3 seconds
        masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);
      } catch {}
    };

    // Only start on user interaction (browser autoplay policy)
    const handleInteraction = () => {
      initAudio();
      // Remove after first trigger
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [enabled, volume, getFrequency]);

  // Update frequency when route changes
  useEffect(() => {
    if (!enabled || !oscRef.current) return;
    const newFreq = getFrequency();
    transitionFrequency(newFreq);
  }, [location.pathname, enabled, getFrequency, transitionFrequency]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gainRef.current && ctxRef.current) {
        try {
          gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5);
          setTimeout(() => {
            if (oscRef.current) oscRef.current.stop();
            if (oscRRef.current) oscRRef.current.stop();
            if (ctxRef.current) ctxRef.current.close();
          }, 600);
        } catch {}
      }
    };
  }, []);

  return { frequency: currentFreqRef.current };
}

export { ROUTE_FREQUENCIES };
