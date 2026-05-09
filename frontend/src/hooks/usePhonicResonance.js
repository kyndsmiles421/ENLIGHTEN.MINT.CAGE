import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

// ━━━ Solfeggio Frequency Map — Route-based ambient resonance ━━━
const ROUTE_FREQUENCIES = {
  '/spotless': 432, '/cleaning': 432, '/sanitation': 432, '/nourishment': 432,
  '/elixirs': 528, '/herbology': 528, '/meal-planning': 528, '/aromatherapy': 528,
  '/suanpan': 741, '/sovereign': 741, '/hub': 741, '/codex': 741, '/mastery-path': 741,
  '/meditation': 396, '/breathing': 396, '/zen-garden': 396, '/mantras': 396,
  '/star-chart': 852, '/oracle': 852, '/numerology': 852, '/cardology': 852,
  '/frequencies': 639, '/yoga': 639, '/reiki': 639, '/wellness-reports': 639,
  '/dance-music': 963, '/music-lounge': 963, '/cosmic-mixer': 963,
  default: 432,
};

// Module-specific frequencies for proximity harmonics
const MODULE_FREQUENCIES = {
  mixer: 741, trade: 528, starchart: 852, meditation: 396, wellness: 639,
};

const BINAURAL_OFFSET = 7;

// ━━━ Pattern generators for Generative Flourish ━━━
function applyPattern(ctx, osc, profile, startTime) {
  if (!profile || !osc) return;
  const baseFreq = profile.base_frequency || 432;
  const tempo = profile.tempo || 0.6;
  const pattern = profile.pattern || 'steady';
  const cycleDur = 4 / tempo; // Seconds per cycle

  switch (pattern) {
    case 'ascending': {
      const steps = profile.overtones || [baseFreq * 1.25, baseFreq * 1.5];
      const totalSteps = steps.length + 1;
      osc.frequency.setValueAtTime(baseFreq, startTime);
      steps.forEach((f, i) => {
        osc.frequency.linearRampToValueAtTime(f, startTime + ((i + 1) / totalSteps) * cycleDur);
      });
      osc.frequency.linearRampToValueAtTime(baseFreq, startTime + cycleDur);
      break;
    }
    case 'descending': {
      const peak = baseFreq * 1.5;
      osc.frequency.setValueAtTime(peak, startTime);
      osc.frequency.linearRampToValueAtTime(baseFreq, startTime + cycleDur);
      break;
    }
    case 'arpeggio': {
      const steps = profile.arpeggio_steps?.length > 0
        ? profile.arpeggio_steps
        : [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.75, baseFreq * 2];
      const stepDur = cycleDur / steps.length;
      steps.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, startTime + i * stepDur);
      });
      break;
    }
    case 'pulsing': {
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.02, startTime + cycleDur * 0.25);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.98, startTime + cycleDur * 0.5);
      osc.frequency.linearRampToValueAtTime(baseFreq, startTime + cycleDur);
      break;
    }
    default: // 'steady' or 'ambient'
      osc.frequency.setValueAtTime(baseFreq, startTime);
      break;
  }
}

// ━━━ Main Phonic Resonance Hook ━━━
export function usePhonicResonance(enabled = true, volume = 0.025) {
  const location = useLocation();
  const { authHeaders } = useAuth();
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const oscRRef = useRef(null);
  const gainRef = useRef(null);
  const currentFreqRef = useRef(0);
  const routeEnterRef = useRef(Date.now());
  const lastRouteRef = useRef('');
  const [sonicProfile, setSonicProfile] = useState(null);
  const flourishIntervalRef = useRef(null);
  const initRef = useRef(false);

  // Get frequency for current route
  const getFrequency = useCallback(() => {
    const path = location.pathname;
    if (ROUTE_FREQUENCIES[path]) return ROUTE_FREQUENCIES[path];
    for (const [route, freq] of Object.entries(ROUTE_FREQUENCIES)) {
      if (route !== 'default' && path.startsWith(route)) return freq;
    }
    return ROUTE_FREQUENCIES.default;
  }, [location.pathname]);

  // Record movement to backend (batch — not per-frame)
  const recordMovement = useCallback(async (route, durationMs) => {
    if (!authHeaders?.Authorization) return;
    try {
      await axios.post(`${API}/api/phonic/record-movement`, {
        route, duration_ms: durationMs, velocity: 0,
      }, { headers: authHeaders });
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [authHeaders]);

  // Fetch generative flourish from backend
  const fetchFlourish = useCallback(async () => {
    if (!authHeaders?.Authorization) return;
    try {
      const res = await axios.post(`${API}/api/phonic/generate-flourish`, {
        session_limit: 20,
      }, { headers: authHeaders });
      if (res.data?.sonic_profile) {
        setSonicProfile(res.data.sonic_profile);
      }
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [authHeaders]);

  // Smooth frequency transition
  const transitionFrequency = useCallback((targetFreq, profile) => {
    if (!oscRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const fadeDur = 2.0;

    if (profile && profile.pattern !== 'steady') {
      // Apply generative pattern
      applyPattern(ctx, oscRef.current, { ...profile, base_frequency: targetFreq }, ctx.currentTime + fadeDur);
      if (oscRRef.current) {
        const binOffset = profile.binaural_offset || BINAURAL_OFFSET;
        applyPattern(ctx, oscRRef.current, { ...profile, base_frequency: targetFreq + binOffset }, ctx.currentTime + fadeDur);
      }
    } else {
      oscRef.current.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + fadeDur);
      if (oscRRef.current) {
        oscRRef.current.frequency.linearRampToValueAtTime(
          targetFreq + (profile?.binaural_offset || BINAURAL_OFFSET), ctx.currentTime + fadeDur
        );
      }
    }
    currentFreqRef.current = targetFreq;
  }, []);

  // Initialize Web Audio
  useEffect(() => {
    if (!enabled) return;

    const initAudio = () => {
      if (ctxRef.current || initRef.current) return;
      initRef.current = true;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainRef.current = masterGain;

        // Left oscillator
        const panL = ctx.createStereoPanner();
        panL.pan.setValueAtTime(-0.3, ctx.currentTime);
        panL.connect(masterGain);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const freq = getFrequency();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(panL);
        osc.start();
        oscRef.current = osc;
        currentFreqRef.current = freq;

        // Right oscillator (binaural)
        const panR = ctx.createStereoPanner();
        panR.pan.setValueAtTime(0.3, ctx.currentTime);
        panR.connect(masterGain);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(freq + BINAURAL_OFFSET, ctx.currentTime);
        oscR.connect(panR);
        oscR.start();
        oscRRef.current = oscR;

        // Fade in
        masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);

        // Fetch initial flourish
        fetchFlourish();

        // Refresh flourish every 5 minutes
        flourishIntervalRef.current = setInterval(fetchFlourish, 5 * 60 * 1000);
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    };

    const handleInteraction = () => { initAudio(); };
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [enabled, volume, getFrequency, fetchFlourish]);

  // Track route changes → record movement + update frequency
  useEffect(() => {
    if (!enabled) return;
    const path = location.pathname;

    // Record previous route duration
    if (lastRouteRef.current && lastRouteRef.current !== path) {
      const duration = Date.now() - routeEnterRef.current;
      recordMovement(lastRouteRef.current, duration);
    }
    lastRouteRef.current = path;
    routeEnterRef.current = Date.now();

    // Update frequency
    if (oscRef.current) {
      const newFreq = getFrequency();
      transitionFrequency(newFreq, sonicProfile);
    }
  }, [location.pathname, enabled, getFrequency, transitionFrequency, recordMovement, sonicProfile]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (flourishIntervalRef.current) clearInterval(flourishIntervalRef.current);
      if (gainRef.current && ctxRef.current) {
        try {
          gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5);
          setTimeout(() => {
            try { oscRef.current?.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
            try { oscRRef.current?.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
            try { ctxRef.current?.close(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
          }, 600);
        } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      }
    };
  }, []);

  return { frequency: currentFreqRef.current, sonicProfile };
}

// ━━━ Haptic Transient Patterns — interval-specific vibration ━━━
const HAPTIC_PATTERNS = {
  unison:  [5],                    // Minimal
  second:  [8, 15, 8],             // Light flutter
  third:   [10, 20, 10, 20, 10],   // Soft rhythmic hum
  fourth:  [15, 15, 15],           // Medium pulse
  fifth:   [20, 10, 20, 10, 20],   // Strong rhythmic
  octave:  [30, 5, 30, 5, 40],     // Sharp, decisive
};

function getIntervalType(ratio) {
  if (ratio < 1.05) return 'unison';
  if (ratio < 1.2) return 'second';
  if (ratio < 1.35) return 'third';
  if (ratio < 1.55) return 'fifth';
  if (ratio < 1.8) return 'fourth';
  return 'octave';
}

// ━━━ Proximity Harmonics Hook — Phase-locks compatible spheres ━━━
export function useProximityHarmonics() {
  const ctxRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainRef = useRef(null);
  const lastHapticRef = useRef({});

  // Initialize shared audio context
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctxRef.current.createGain();
        gain.gain.setValueAtTime(0, ctxRef.current.currentTime);
        gain.connect(ctxRef.current.destination);
        gainRef.current = gain;
      } catch { return null; }
    }
    return ctxRef.current;
  }, []);

  // Start harmonic resonance between two modules
  const startResonance = useCallback((modA, modB, distance, maxDistance = 180) => {
    const ctx = getCtx();
    if (!ctx || !gainRef.current) return;
    const freqA = MODULE_FREQUENCIES[modA] || 432;
    const freqB = MODULE_FREQUENCIES[modB] || 432;

    // Inverse-square intensity: 1/d² normalized
    const normalized = Math.max(0, 1 - distance / maxDistance);
    const intensity = normalized * normalized; // Inverse-square feel

    const pairKey = [modA, modB].sort().join('-');

    // Create or update oscillators for this pair
    if (!oscillatorsRef.current[pairKey]) {
      const oscA = ctx.createOscillator();
      oscA.type = 'sine';
      oscA.frequency.setValueAtTime(freqA, ctx.currentTime);

      const oscB = ctx.createOscillator();
      oscB.type = 'sine';
      oscB.frequency.setValueAtTime(freqB, ctx.currentTime);

      const pairGain = ctx.createGain();
      pairGain.gain.setValueAtTime(0, ctx.currentTime);
      pairGain.connect(gainRef.current);

      oscA.connect(pairGain);
      oscB.connect(pairGain);
      oscA.start();
      oscB.start();

      gainRef.current.gain.setValueAtTime(0.02, ctx.currentTime);

      oscillatorsRef.current[pairKey] = { oscA, oscB, gain: pairGain };
    }

    // Update intensity based on distance
    const pair = oscillatorsRef.current[pairKey];
    pair.gain.gain.linearRampToValueAtTime(intensity * 0.03, ctx.currentTime + 0.1);

    // Phase-lock: snap frequencies to harmonic intervals as they get closer
    if (intensity > 0.5) {
      // Strong resonance → snap to perfect harmonic (octave or fifth)
      const ratio = freqB / freqA;
      const nearestHarmonic = ratio > 1.8 ? 2.0 : ratio > 1.3 ? 1.5 : 1.0;
      pair.oscB.frequency.linearRampToValueAtTime(
        freqA * nearestHarmonic, ctx.currentTime + 0.5
      );

      // Haptic Sync — interval-specific vibration pattern
      const now = Date.now();
      const lastHaptic = lastHapticRef.current[pairKey] || 0;
      if (now - lastHaptic > 400 && navigator.vibrate) {
        const interval = getIntervalType(Math.max(ratio, 1 / ratio));
        const pattern = HAPTIC_PATTERNS[interval] || HAPTIC_PATTERNS.third;
        navigator.vibrate(pattern);
        lastHapticRef.current[pairKey] = now;
      }
    }

    return intensity;
  }, [getCtx]);

  // Stop resonance for a pair
  const stopResonance = useCallback((modA, modB) => {
    const pairKey = [modA, modB].sort().join('-');
    const pair = oscillatorsRef.current[pairKey];
    if (pair && ctxRef.current) {
      pair.gain.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
      setTimeout(() => {
        try { pair.oscA.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        try { pair.oscB.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        delete oscillatorsRef.current[pairKey];
      }, 400);
    }
  }, []);

  // Cleanup all
  useEffect(() => {
    return () => {
      Object.values(oscillatorsRef.current).forEach(pair => {
        try { pair.oscA.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        try { pair.oscB.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      });
      try { ctxRef.current?.close(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    };
  }, []);

  return { startResonance, stopResonance };
}

// ━━━ Predictive Sonic Tug — Cross-fade to destination frequency ━━━
export function usePredictiveSonicTug() {
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const engage = useCallback((moduleId, intensity) => {
    if (intensity < 0.1) {
      disengage();
      return;
    }

    const freq = MODULE_FREQUENCIES[moduleId] || 741;

    if (!ctxRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctxRef.current = ctx;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.connect(ctx.destination);
        gainRef.current = gain;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        oscRef.current = osc;
      } catch { return; }
    }

    if (!ctxRef.current || !gainRef.current) return;

    // Sonic magnet: volume increases with proximity (inverse-square)
    const vol = intensity * intensity * 0.04;
    gainRef.current.gain.linearRampToValueAtTime(vol, ctxRef.current.currentTime + 0.1);

    // Frequency slightly shifts as sphere approaches (Doppler-like)
    if (oscRef.current) {
      const shifted = freq * (1 + intensity * 0.02);
      oscRef.current.frequency.linearRampToValueAtTime(shifted, ctxRef.current.currentTime + 0.2);
    }
  }, []);

  const disengage = useCallback(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
    }
  }, []);

  useEffect(() => {
    return () => {
      try { oscRef.current?.stop(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      try { ctxRef.current?.close(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    };
  }, []);

  return { engage, disengage };
}

export { ROUTE_FREQUENCIES, MODULE_FREQUENCIES, HAPTIC_PATTERNS };
