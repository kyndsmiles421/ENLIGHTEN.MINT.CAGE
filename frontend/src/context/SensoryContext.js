import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const SensoryContext = createContext(null);

export function SensoryProvider({ children }) {
  const [ambientOn, setAmbientOn] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const nodesRef = useRef([]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = 0;
      gainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const startAmbient = useCallback(() => {
    const ctx = getAudioCtx();
    // Stop any existing
    nodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} try { n.disconnect(); } catch(e) {} });
    nodesRef.current = [];

    // Deep cosmic drone - layered oscillators
    const freqs = [55, 82.5, 110, 165];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.3 : 0.08;

      // Slow LFO for shimmer
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = f * 0.005;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(g);
      g.connect(gainRef.current);
      osc.start();
      nodesRef.current.push(osc, lfo);
    });

    // Filtered noise for atmosphere
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    noiseFilter.Q.value = 1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainRef.current);
    noiseSource.start();
    nodesRef.current.push(noiseSource);

    // Fade in
    gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    gainRef.current.gain.setValueAtTime(0, ctx.currentTime);
    gainRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
  }, [getAudioCtx, volume]);

  const stopAmbient = useCallback(() => {
    if (gainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
      gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} });
        nodesRef.current = [];
      }, 1200);
    }
  }, []);

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800 + Math.random() * 400;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }, [getAudioCtx]);

  const playChime = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0;
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } catch(e) {}
  }, [getAudioCtx]);

  const toggleAmbient = useCallback(() => {
    setAmbientOn(prev => {
      if (!prev) { startAmbient(); } else { stopAmbient(); }
      return !prev;
    });
  }, [startAmbient, stopAmbient]);

  useEffect(() => {
    if (ambientOn && gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume, ambientOn]);

  useEffect(() => {
    return () => {
      nodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} });
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  return (
    <SensoryContext.Provider value={{ ambientOn, volume, setVolume, toggleAmbient, playClick, playChime }}>
      {children}
    </SensoryContext.Provider>
  );
}

export function useSensory() {
  const ctx = useContext(SensoryContext);
  if (!ctx) throw new Error('useSensory must be inside SensoryProvider');
  return ctx;
}
