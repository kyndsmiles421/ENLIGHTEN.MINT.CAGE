import { useCallback, useRef, useEffect } from 'react';
import { ZONE_AUDIO, WEATHER_AUDIO_MAP } from '../components/orbital/constants';

export function useHubAudio() {
  const ctxRef = useRef(null);
  const satOscRef = useRef(null);
  const satGainRef = useRef(null);
  const ambOscRef = useRef(null);
  const ambGainRef = useRef(null);
  const ambLfoRef = useRef(null);
  const ambActiveRef = useRef(false);
  const chordOscsRef = useRef([]);
  const chordGainRef = useRef(null);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playSatellite = useCallback((satId) => {
    const zone = ZONE_AUDIO[satId];
    if (!zone) return;
    try {
      const ctx = ensureCtx();
      if (satGainRef.current) {
        satGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        const old = satOscRef.current;
        setTimeout(() => { try { old?.stop(); } catch {} }, 300);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = zone.type;
      osc.frequency.value = zone.hz;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(zone.gain, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      satOscRef.current = osc;
      satGainRef.current = gain;
    } catch {}
  }, [ensureCtx]);

  const stopSatellite = useCallback(() => {
    if (satGainRef.current && ctxRef.current) {
      satGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
      const old = satOscRef.current;
      setTimeout(() => { try { old?.stop(); } catch {} }, 400);
      satOscRef.current = null;
      satGainRef.current = null;
    }
  }, []);

  const collapseSound = useCallback(() => {
    try {
      const ctx = ensureCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [ensureCtx]);

  const startAmbience = useCallback((weather) => {
    if (!weather || weather.fallback || ambActiveRef.current) return;
    try {
      const ctx = ensureCtx();
      const category = weather.category || 'default';
      const amb = WEATHER_AUDIO_MAP[category] || WEATHER_AUDIO_MAP.default;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = amb.type;
      osc.frequency.value = amb.hz;

      if (weather.temperature_f != null) {
        osc.frequency.value = amb.hz + (weather.temperature_f - 60) * 0.3;
      }

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(amb.gain, ctx.currentTime + 3);
      osc.connect(gain);

      if (amb.lfoRate > 0) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = amb.lfoRate;
        lfoGain.gain.value = amb.gain * 0.4;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start(ctx.currentTime);
        ambLfoRef.current = lfo;
      }

      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      ambOscRef.current = osc;
      ambGainRef.current = gain;
      ambActiveRef.current = true;
    } catch {}
  }, [ensureCtx]);

  const stopAmbience = useCallback(() => {
    if (ambGainRef.current && ctxRef.current) {
      ambGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1.5);
      const osc = ambOscRef.current;
      const lfo = ambLfoRef.current;
      setTimeout(() => {
        try { osc?.stop(); } catch {}
        try { lfo?.stop(); } catch {}
      }, 1700);
      ambOscRef.current = null;
      ambGainRef.current = null;
      ambLfoRef.current = null;
      ambActiveRef.current = false;
    }
  }, []);

  const isAmbienceActive = useCallback(() => ambActiveRef.current, []);

  const playHarmonicChord = useCallback((hz1, hz2) => {
    try {
      const ctx = ensureCtx();
      // Stop existing chord
      if (chordGainRef.current) {
        chordGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        chordOscsRef.current.forEach(o => { setTimeout(() => { try { o.stop(); } catch {} }, 300); });
        chordOscsRef.current = [];
        chordGainRef.current = null;
      }
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.5);
      gain.connect(ctx.destination);
      chordGainRef.current = gain;

      [hz1, hz2, (hz1 + hz2) / 2].forEach(hz => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = hz;
        osc.connect(gain);
        osc.start(ctx.currentTime);
        chordOscsRef.current.push(osc);
      });
    } catch {}
  }, [ensureCtx]);

  const stopHarmonicChord = useCallback(() => {
    if (chordGainRef.current && ctxRef.current) {
      chordGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.8);
      const oscs = chordOscsRef.current;
      setTimeout(() => { oscs.forEach(o => { try { o.stop(); } catch {} }); }, 1000);
      chordOscsRef.current = [];
      chordGainRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      try { satOscRef.current?.stop(); } catch {}
      try { ambOscRef.current?.stop(); } catch {}
      try { ambLfoRef.current?.stop(); } catch {}
      chordOscsRef.current.forEach(o => { try { o.stop(); } catch {} });
    };
  }, []);

  return { playSatellite, stopSatellite, collapseSound, startAmbience, stopAmbience, isAmbienceActive, playHarmonicChord, stopHarmonicChord };
}
