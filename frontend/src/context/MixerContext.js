import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════
   STATIC DATA (shared between context + page)
   ═══════════════════════════════════════════════ */

export const FREQUENCIES = [
  { hz: 174, label: '174 Hz', desc: 'Foundation & Pain Relief', color: '#78716C' },
  { hz: 285, label: '285 Hz', desc: 'Tissue Healing & Safety', color: '#92400E' },
  { hz: 396, label: '396 Hz', desc: 'Liberation from Fear', color: '#EF4444' },
  { hz: 417, label: '417 Hz', desc: 'Undoing & Change', color: '#FB923C' },
  { hz: 432, label: '432 Hz', desc: 'Universal Harmony', color: '#10B981' },
  { hz: 528, label: '528 Hz', desc: 'Love & Transformation', color: '#22C55E' },
  { hz: 639, label: '639 Hz', desc: 'Connection & Harmony', color: '#3B82F6' },
  { hz: 741, label: '741 Hz', desc: 'Intuition & Expression', color: '#8B5CF6' },
  { hz: 852, label: '852 Hz', desc: 'Spiritual Awakening', color: '#C084FC' },
  { hz: 963, label: '963 Hz', desc: 'Divine Connection', color: '#E879F9' },
  { hz: 7.83, label: '7.83 Hz', desc: 'Schumann Resonance', color: '#2DD4BF' },
  { hz: 10, label: '10 Hz', desc: 'Alpha Relaxation', color: '#06B6D4' },
  { hz: 40, label: '40 Hz', desc: 'Gamma Focus', color: '#F59E0B' },
  { hz: 111, label: '111 Hz', desc: 'Cell Regeneration', color: '#DC2626' },
  { hz: 1111, label: '1111 Hz', desc: 'Angel Frequency', color: '#FCD34D' },
];

export const SOUNDS = [
  { id: 'rain', label: 'Rain', color: '#3B82F6', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000; const sg = ctx.createGain(); sg.gain.value = 0.08; src.connect(hp); hp.connect(lp); lp.connect(sg); sg.connect(g); src.start(); return [src]; }},
  { id: 'ocean', label: 'Ocean', color: '#06B6D4', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08; const lg = ctx.createGain(); lg.gain.value = 150; lfo.connect(lg); lg.connect(lp.frequency); const sg = ctx.createGain(); sg.gain.value = 0.1; src.connect(lp); lp.connect(sg); sg.connect(g); lfo.start(); src.start(); return [src, lfo]; }},
  { id: 'wind', label: 'Wind', color: '#A78BFA', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5; const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12; const lg = ctx.createGain(); lg.gain.value = 400; lfo.connect(lg); lg.connect(bp.frequency); const sg = ctx.createGain(); sg.gain.value = 0.06; src.connect(bp); bp.connect(sg); sg.connect(g); lfo.start(); src.start(); return [src, lfo]; }},
  { id: 'fire', label: 'Fire', color: '#F59E0B', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 1.5; const lfo = ctx.createOscillator(); lfo.frequency.value = 3; const lg = ctx.createGain(); lg.gain.value = 200; lfo.connect(lg); lg.connect(bp.frequency); const sg = ctx.createGain(); sg.gain.value = 0.05; src.connect(bp); bp.connect(sg); sg.connect(g); lfo.start(); src.start(); return [src, lfo]; }},
  { id: 'singing-bowl', label: 'Singing Bowl', color: '#FCD34D', gen: (ctx, g) => { const nodes = []; const play = () => { [293.66, 440, 587.33].forEach(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const eg = ctx.createGain(); eg.gain.setValueAtTime(0.06, ctx.currentTime); eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6); o.connect(eg); eg.connect(g); o.start(); o.stop(ctx.currentTime + 6); }); }; play(); const iv = setInterval(play, 5500); nodes._interval = iv; return nodes; }},
  { id: 'thunder', label: 'Thunder', color: '#6366F1', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; const sg = ctx.createGain(); sg.gain.value = 0.08; src.connect(lp); lp.connect(sg); sg.connect(g); src.start(); return [src]; }},
  { id: 'stream', label: 'Stream', color: '#22D3EE', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 0.3; const sg = ctx.createGain(); sg.gain.value = 0.06; src.connect(bp); bp.connect(sg); sg.connect(g); src.start(); return [src]; }},
  { id: 'forest', label: 'Forest', color: '#16A34A', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3500; bp.Q.value = 2; const sg = ctx.createGain(); sg.gain.value = 0.04; src.connect(bp); bp.connect(sg); sg.connect(g); src.start(); return [src]; }},
  { id: 'cave', label: 'Cave', color: '#78716C', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; const sg = ctx.createGain(); sg.gain.value = 0.07; src.connect(lp); lp.connect(sg); sg.connect(g); src.start(); return [src]; }},
  { id: 'night', label: 'Night', color: '#312E81', gen: (ctx, g) => { const nodes = []; const play = () => { [2800, 3200, 3600].forEach(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f + Math.random() * 200; const eg = ctx.createGain(); eg.gain.setValueAtTime(0.012, ctx.currentTime); eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); o.connect(eg); eg.connect(g); o.start(); o.stop(ctx.currentTime + 1.5); }); }; play(); const iv = setInterval(play, 2200); nodes._interval = iv; return nodes; }},
  { id: 'waterfall', label: 'Waterfall', color: '#0EA5E9', gen: (ctx, g) => { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 200; const sg = ctx.createGain(); sg.gain.value = 0.07; src.connect(hp); hp.connect(lp); lp.connect(sg); sg.connect(g); src.start(); return [src]; }},
];

export const INSTRUMENT_DRONES = [
  { id: 'sitar-drone', label: 'Sitar', color: '#F59E0B', wave: 'sawtooth', freq: 146.83, filterFreq: 1200, filterQ: 8, vibratoRate: 5, vibratoDepth: 8 },
  { id: 'tanpura-drone', label: 'Tanpura', color: '#EA580C', wave: 'sawtooth', freq: 130.81, filterFreq: 600, filterQ: 3, vibratoRate: 2, vibratoDepth: 3 },
  { id: 'didgeridoo-drone', label: 'Didgeridoo', color: '#78350F', wave: 'sawtooth', freq: 65.41, filterFreq: 300, filterQ: 6, vibratoRate: 2, vibratoDepth: 5 },
  { id: 'bowl-drone', label: 'Singing Bowl', color: '#7C3AED', wave: 'sine', freq: 261.63, filterFreq: 800, filterQ: 12, vibratoRate: 1.5, vibratoDepth: 2 },
  { id: 'flute-drone', label: 'Cedar Flute', color: '#059669', wave: 'sine', freq: 329.63, filterFreq: 2000, filterQ: 1, vibratoRate: 4.5, vibratoDepth: 12 },
  { id: 'erhu-drone', label: 'Erhu', color: '#E11D48', wave: 'sawtooth', freq: 293.66, filterFreq: 2500, filterQ: 4, vibratoRate: 5.5, vibratoDepth: 15 },
  { id: 'oud-drone', label: 'Oud', color: '#B45309', wave: 'sawtooth', freq: 196.00, filterFreq: 1000, filterQ: 5, vibratoRate: 3.5, vibratoDepth: 6 },
  { id: 'harmonium-drone', label: 'Harmonium', color: '#9333EA', wave: 'sawtooth', freq: 174.61, filterFreq: 900, filterQ: 2, vibratoRate: 1, vibratoDepth: 2 },
  { id: 'shakuhachi-drone', label: 'Shakuhachi', color: '#047857', wave: 'sine', freq: 392.00, filterFreq: 1800, filterQ: 2, vibratoRate: 3, vibratoDepth: 18 },
  { id: 'koto-drone', label: 'Koto', color: '#DC2626', wave: 'triangle', freq: 440.00, filterFreq: 3000, filterQ: 6, vibratoRate: 6, vibratoDepth: 4 },
  { id: 'hang-drum-drone', label: 'Hang Drum', color: '#2DD4BF', wave: 'sine', freq: 220.00, filterFreq: 700, filterQ: 15, vibratoRate: 0.8, vibratoDepth: 1 },
  { id: 'cello-drone', label: 'Cello', color: '#92400E', wave: 'sawtooth', freq: 130.81, filterFreq: 1500, filterQ: 2, vibratoRate: 5, vibratoDepth: 6 },
  { id: 'tibetan-horn', label: 'Tibetan Horn', color: '#7C2D12', wave: 'sawtooth', freq: 73.42, filterFreq: 250, filterQ: 4, vibratoRate: 1.5, vibratoDepth: 3 },
  { id: 'harp-drone', label: 'Harp', color: '#EC4899', wave: 'sine', freq: 349.23, filterFreq: 2200, filterQ: 1, vibratoRate: 2, vibratoDepth: 5 },
  { id: 'kalimba-drone', label: 'Kalimba', color: '#0EA5E9', wave: 'sine', freq: 523.25, filterFreq: 3500, filterQ: 10, vibratoRate: 0.5, vibratoDepth: 1 },
  { id: 'bagpipe-drone', label: 'Bagpipe', color: '#4338CA', wave: 'sawtooth', freq: 146.83, filterFreq: 500, filterQ: 3, vibratoRate: 1, vibratoDepth: 2 },
];

export const MANTRAS = [
  { id: 'om', label: 'Om', text: 'Om... Om... Om... Let the vibration settle into your being. Om... Om... Om...', tradition: 'Universal', color: '#C084FC' },
  { id: 'om-mani', label: 'Om Mani Padme Hum', text: 'Om Mani Padme Hum... Om Mani Padme Hum... Let compassion fill every cell. Om Mani Padme Hum...', tradition: 'Tibetan Buddhist', color: '#2DD4BF' },
  { id: 'om-namah', label: 'Om Namah Shivaya', text: 'Om Namah Shivaya... I bow to the divine within. Om Namah Shivaya... Om Namah Shivaya...', tradition: 'Hindu', color: '#8B5CF6' },
  { id: 'so-hum', label: 'So Hum', text: 'So... Hum... I am that I am. So... Hum... Breathe in, I am. Breathe out, that. So... Hum...', tradition: 'Vedic', color: '#3B82F6' },
  { id: 'ra-ma', label: 'Ra Ma Da Sa', text: 'Ra Ma Da Sa... Sa Say So Hung... Feel the healing energy flow. Ra Ma Da Sa... Sa Say So Hung...', tradition: 'Kundalini', color: '#FCD34D' },
  { id: 'peace', label: 'I Am Peace', text: 'I am peace... I am light... I am love... With every breath, I return to stillness. I am peace... I am light... I am love...', tradition: 'Modern', color: '#22C55E' },
];

/* ═══════════════════════════════════════════════
   GLOBAL MIXER CONTEXT — audio persists across pages
   ═══════════════════════════════════════════════ */

const MixerContext = createContext(null);

export function MixerProvider({ children }) {
  const [masterVol, setMasterVol] = useState(75);
  const [muted, setMuted] = useState(false);
  const [activeFreqs, setActiveFreqs] = useState(new Set());
  const [activeSounds, setActiveSounds] = useState(new Set());
  const [activeDrones, setActiveDrones] = useState(new Set());
  const [activeMantra, setActiveMantra] = useState(null);
  const [channelVols, setChannelVols] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const analyserRef = useRef(null);
  const freqNodesMapRef = useRef({});
  const freqGainMapRef = useRef({});
  const soundNodesMapRef = useRef({});
  const soundGainMapRef = useRef({});
  const soundFilterMapRef = useRef({});
  const droneNodesMapRef = useRef({});
  const droneGainMapRef = useRef({});
  const droneFilterMapRef = useRef({});
  const mantraAudioRef = useRef(null);

  // Track active count for isPlaying indicator
  useEffect(() => {
    setIsPlaying(activeFreqs.size > 0 || activeSounds.size > 0 || activeDrones.size > 0 || !!activeMantra);
  }, [activeFreqs, activeSounds, activeDrones, activeMantra]);

  const getCtx = useCallback(async () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.connect(analyser);
      analyser.connect(compressor);
      compressor.connect(ctx.destination);
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
    return ctxRef.current;
  }, [masterVol, muted]);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
  }, [masterVol, muted]);

  // Stop helpers
  const stopNodesForKey = useCallback((mapRef, key) => {
    const nodes = mapRef.current[key];
    if (!nodes) return;
    if (nodes._interval) clearInterval(nodes._interval);
    nodes.forEach?.(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    delete mapRef.current[key];
  }, []);

  const toggleFreq = useCallback(async (freq) => {
    if (activeFreqs.has(freq.hz)) {
      stopNodesForKey(freqNodesMapRef, freq.hz);
      delete freqGainMapRef.current[freq.hz];
      setActiveFreqs(prev => { const n = new Set(prev); n.delete(freq.hz); return n; });
      return;
    }
    const ctx = await getCtx();
    const vol = (channelVols[`freq-${freq.hz}`] ?? 75) / 100;
    const channelGain = ctx.createGain();
    channelGain.gain.value = vol * 0.15;
    channelGain.connect(masterGainRef.current);
    freqGainMapRef.current[freq.hz] = channelGain;
    let nodes;
    if (freq.hz < 20) {
      const carrier = 200; const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = carrier;
      const gL = ctx.createGain(); gL.gain.value = 1; oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = carrier + freq.hz;
      const gR = ctx.createGain(); gR.gain.value = 1; oscR.connect(gR); gR.connect(merger, 0, 1);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq.hz * 16;
      const subG = ctx.createGain(); subG.gain.value = 0.06;
      sub.connect(subG); subG.connect(channelGain); merger.connect(channelGain);
      oscL.start(); oscR.start(); sub.start();
      nodes = [oscL, oscR, sub, merger];
    } else {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq.hz;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(channelGain.gain); o.connect(channelGain);
      o.start(); lfo.start();
      nodes = [o, lfo];
    }
    freqNodesMapRef.current[freq.hz] = nodes;
    if (!channelVols[`freq-${freq.hz}`]) setChannelVols(v => ({...v, [`freq-${freq.hz}`]: 75}));
    setActiveFreqs(prev => new Set(prev).add(freq.hz));
  }, [activeFreqs, getCtx, channelVols, stopNodesForKey]);

  const toggleSound = useCallback(async (sound) => {
    if (activeSounds.has(sound.id)) {
      stopNodesForKey(soundNodesMapRef, sound.id);
      delete soundGainMapRef.current[sound.id];
      delete soundFilterMapRef.current[sound.id];
      setActiveSounds(prev => { const n = new Set(prev); n.delete(sound.id); return n; });
      return;
    }
    const ctx = await getCtx();
    const vol = (channelVols[`sound-${sound.id}`] ?? 75) / 100;
    const channelGain = ctx.createGain();
    channelGain.gain.value = vol * 0.15;
    soundGainMapRef.current[sound.id] = channelGain;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 20000;
    filter.Q.value = 1;
    soundFilterMapRef.current[sound.id] = filter;
    filter.connect(channelGain);
    channelGain.connect(masterGainRef.current);
    const nodes = sound.gen(ctx, filter);
    soundNodesMapRef.current[sound.id] = nodes;
    if (!channelVols[`sound-${sound.id}`]) setChannelVols(v => ({...v, [`sound-${sound.id}`]: 75}));
    setActiveSounds(prev => new Set(prev).add(sound.id));
  }, [activeSounds, getCtx, channelVols, stopNodesForKey]);

  const toggleDrone = useCallback(async (drone) => {
    if (activeDrones.has(drone.id)) {
      stopNodesForKey(droneNodesMapRef, drone.id);
      delete droneGainMapRef.current[drone.id];
      delete droneFilterMapRef.current[drone.id];
      setActiveDrones(prev => { const n = new Set(prev); n.delete(drone.id); return n; });
      return;
    }
    const ctx = await getCtx();
    const vol = (channelVols[`drone-${drone.id}`] ?? 75) / 100;
    const channelGain = ctx.createGain();
    channelGain.gain.value = vol * 0.15;
    droneGainMapRef.current[drone.id] = channelGain;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = drone.filterFreq;
    filter.Q.value = drone.filterQ;
    droneFilterMapRef.current[drone.id] = filter;
    filter.connect(channelGain);
    channelGain.connect(masterGainRef.current);
    const osc = ctx.createOscillator(); osc.type = drone.wave; osc.frequency.value = drone.freq;
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = drone.vibratoRate;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = drone.vibratoDepth;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = drone.freq / 2;
    const subGain = ctx.createGain(); subGain.gain.value = 0.3;
    sub.connect(subGain); subGain.connect(filter);
    osc.connect(filter);
    osc.start(); lfo.start(); sub.start();
    droneNodesMapRef.current[drone.id] = [osc, lfo, sub];
    if (!channelVols[`drone-${drone.id}`]) setChannelVols(v => ({...v, [`drone-${drone.id}`]: 75}));
    setActiveDrones(prev => new Set(prev).add(drone.id));
  }, [activeDrones, getCtx, channelVols, stopNodesForKey]);

  const toggleMantra = useCallback(async (mantra, authHeaders) => {
    if (mantraAudioRef.current) {
      mantraAudioRef.current.pause();
      mantraAudioRef.current = null;
    }
    if (activeMantra?.id === mantra.id) { setActiveMantra(null); return; }
    setActiveMantra(mantra);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mixer' }, { headers: authHeaders });
      if (!res.data.audio) { setActiveMantra(null); return; }
      const ctx = await getCtx();
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = 1.5;
      source.connect(gain);
      gain.connect(masterGainRef.current);
      mantraAudioRef.current = audio;
      await audio.play();
    } catch {
      setActiveMantra(null);
    }
  }, [activeMantra, getCtx]);

  const setChannelVolume = useCallback((key, val) => {
    setChannelVols(v => ({...v, [key]: val}));
    const [type, ...rest] = key.split('-');
    const id = rest.join('-');
    if (type === 'freq' && freqGainMapRef.current[id]) freqGainMapRef.current[id].gain.value = (val / 100) * 0.15;
    else if (type === 'sound' && soundGainMapRef.current[id]) soundGainMapRef.current[id].gain.value = (val / 100) * 0.15;
    else if (type === 'drone' && droneGainMapRef.current[id]) droneGainMapRef.current[id].gain.value = (val / 100) * 0.15;
  }, []);

  const stopAll = useCallback(() => {
    Object.keys(freqNodesMapRef.current).forEach(k => stopNodesForKey(freqNodesMapRef, k));
    Object.keys(soundNodesMapRef.current).forEach(k => stopNodesForKey(soundNodesMapRef, k));
    Object.keys(droneNodesMapRef.current).forEach(k => stopNodesForKey(droneNodesMapRef, k));
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    setActiveFreqs(new Set()); setActiveSounds(new Set()); setActiveDrones(new Set()); setActiveMantra(null);
  }, [stopNodesForKey]);

  // Get snapshot of current state for saving
  const getSnapshot = useCallback(() => ({
    activeFreqs: Array.from(activeFreqs),
    activeSounds: Array.from(activeSounds),
    activeDrones: Array.from(activeDrones),
    activeMantra: activeMantra?.id || null,
    channelVols,
    masterVol,
  }), [activeFreqs, activeSounds, activeDrones, activeMantra, channelVols, masterVol]);

  // Restore from snapshot
  const restoreSnapshot = useCallback(async (snap) => {
    stopAll();
    if (snap.masterVol) setMasterVol(snap.masterVol);
    if (snap.channelVols) setChannelVols(snap.channelVols);
    // Re-activate layers
    for (const hz of (snap.activeFreqs || [])) {
      const f = FREQUENCIES.find(x => x.hz === hz);
      if (f) await toggleFreq(f);
    }
    for (const id of (snap.activeSounds || [])) {
      const s = SOUNDS.find(x => x.id === id);
      if (s) await toggleSound(s);
    }
    for (const id of (snap.activeDrones || [])) {
      const d = INSTRUMENT_DRONES.find(x => x.id === id);
      if (d) await toggleDrone(d);
    }
  }, [stopAll, toggleFreq, toggleSound, toggleDrone]);

  const totalActive = activeFreqs.size + activeSounds.size + activeDrones.size + (activeMantra ? 1 : 0);

  const value = {
    masterVol, setMasterVol, muted, setMuted,
    activeFreqs, activeSounds, activeDrones, activeMantra,
    channelVols, setChannelVols, setChannelVolume,
    isPlaying, totalActive,
    getCtx, toggleFreq, toggleSound, toggleDrone, toggleMantra,
    stopAll, getSnapshot, restoreSnapshot,
    analyserRef, masterGainRef, ctxRef,
    freqNodesMapRef, freqGainMapRef,
    soundNodesMapRef, soundGainMapRef, soundFilterMapRef,
    droneNodesMapRef, droneGainMapRef, droneFilterMapRef,
    mantraAudioRef, setActiveMantra,
    setActiveFreqs, setActiveSounds, setActiveDrones,
  };

  return <MixerContext.Provider value={value}>{children}</MixerContext.Provider>;
}

export function useMixer() {
  const ctx = useContext(MixerContext);
  if (!ctx) throw new Error('useMixer must be inside MixerProvider');
  return ctx;
}
