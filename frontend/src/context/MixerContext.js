import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { performanceManager } from '../engines/PerformanceManager';
import { phiVolumeCurve } from '../utils/SovereignMath';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════
   STATIC DATA (shared between context + page)
   ═══════════════════════════════════════════════ */

export const FREQUENCIES = [
  { hz: 174, label: '174 Hz', desc: 'Foundation & Pain Relief', color: '#78716C' },
  { hz: 285, label: '285 Hz', desc: 'Tissue Resonance & Safety', color: '#92400E' },
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
  { id: 'ra-ma', label: 'Ra Ma Da Sa', text: 'Ra Ma Da Sa... Sa Say So Hung... Feel the resonant energy flow. Ra Ma Da Sa... Sa Say So Hung...', tradition: 'Kundalini', color: '#FCD34D' },
  { id: 'peace', label: 'I Am Peace', text: 'I am peace... I am light... I am love... With every breath, I return to stillness. I am peace... I am light... I am love...', tradition: 'Modern', color: '#22C55E' },
  { id: 'gayatri', label: 'Gayatri', text: 'Om Bhur Bhuvaswaha... Tat Savitur Varenyam... Bhargo Devasya Dhimahi... Dhiyo Yo Nah Prachodayat...', tradition: 'Hindu Vedic', color: '#F59E0B' },
  { id: 'gate-gate', label: 'Gate Gate', text: 'Gate Gate... Paragate... Parasamgate... Bodhi Svaha... Gone, gone, gone beyond. Enlightenment. Gate Gate...', tradition: 'Buddhist', color: '#EC4899' },
  { id: 'lokah', label: 'Lokah Samastah', text: 'Lokah Samastah Sukhino Bhavantu... May all beings everywhere be happy and free. Lokah Samastah Sukhino Bhavantu...', tradition: 'Sanskrit', color: '#10B981' },
  { id: 'hu', label: 'Hu', text: 'Hu... Hu... Hu... The ancient sound of the soul. Let it carry you inward. Hu... Hu... Hu...', tradition: 'Sufi', color: '#F97316' },
  { id: 'shema', label: 'Shema', text: 'Shema Yisrael... Adonai Eloheinu... Adonai Echad... Hear, O Israel. Shema Yisrael...', tradition: 'Jewish', color: '#818CF8' },
  { id: 'allah-hu', label: 'Allah Hu', text: 'Allah Hu... Allah Hu... The breath of the Beloved. Allah Hu... Allah Hu...', tradition: 'Islamic Sufi', color: '#0EA5E9' },
  { id: 'nam-myoho', label: 'Nam Myoho Renge Kyo', text: 'Nam Myoho Renge Kyo... I devote myself to the mystic law of cause and effect. Nam Myoho Renge Kyo...', tradition: 'Nichiren Buddhist', color: '#DC2626' },
  { id: 'waheguru', label: 'Waheguru', text: 'Waheguru... Waheguru... Wonderful Lord. The darkness dissolves. Waheguru... Waheguru...', tradition: 'Sikh', color: '#EA580C' },
  { id: 'hooponopono', label: "Ho'oponopono", text: 'I am sorry... Please forgive me... Thank you... I love you... I am sorry... Please forgive me...', tradition: 'Hawaiian', color: '#06B6D4' },
  { id: 'abundance', label: 'I Am Abundance', text: 'I am abundance... I am prosperity... The universe provides for me endlessly. I am abundance...', tradition: 'Modern', color: '#FCD34D' },
  { id: 'ham-sa', label: 'Ham Sa', text: 'Ham... Sa... I am that. The swan of consciousness glides upon the waters of being. Ham... Sa...', tradition: 'Vedantic', color: '#A855F7' },
  { id: 'om-tare', label: 'Om Tare Tuttare', text: 'Om Tare Tuttare Ture Soha... Green Tara, swift protector, dispel all fears. Om Tare Tuttare Ture Soha...', tradition: 'Tibetan Buddhist', color: '#34D399' },
];

/* ═══════════════════════════════════════════════
   V68.27 — TRADE RESONANCE PRESETS
   Baked-in "High-Performance" recipes per chamber. Each preset lists
   the nodules that together form the mastery tincture for that trade.
   A chamber can call applyResonancePreset('masonry') and the mixer
   will activate the correct frequencies/sounds/drones in one shot.
   The user's existing mixer state is preserved — these are additive.
   ═══════════════════════════════════════════════ */
export const RESONANCE_PRESETS = {
  masonry:      { label: 'Masonry Mastery',   freqs: [528],       sounds: ['singing-bowl'], drones: ['sitar-drone'],    color: '#F59E0B' },
  carpentry:    { label: 'Grain Attunement',  freqs: [432],       sounds: ['forest'],       drones: ['flute-drone'],    color: '#D97706' },
  culinary:     { label: 'Hearth Resonance',  freqs: [396],       sounds: ['fire'],         drones: ['hang-drum-drone'],color: '#FB923C' },
  cooking:      { label: 'Hearth Resonance',  freqs: [396],       sounds: ['fire'],         drones: ['hang-drum-drone'],color: '#FB923C' },
  baking:       { label: 'Dough Harmony',     freqs: [528],       sounds: ['fire'],         drones: ['harmonium-drone'],color: '#FBBF24' },
  electrical:   { label: 'Current Alignment', freqs: [40, 111],   sounds: ['thunder'],      drones: ['cello-drone'],    color: '#6366F1' },
  plumbing:     { label: 'Flow Balance',      freqs: [417],       sounds: ['stream'],       drones: ['shakuhachi-drone'],color:'#06B6D4' },
  nursing:      { label: 'Resonant Presence',  freqs: [528, 741],  sounds: ['ocean'],        drones: ['harp-drone'],     color: '#EC4899' },
  childcare:    { label: 'Lullaby Rhythm',    freqs: [432],       sounds: ['rain'],         drones: ['kalimba-drone'],  color: '#A78BFA' },
  eldercare:    { label: 'Dignity Circle',    freqs: [639],       sounds: ['singing-bowl'], drones: ['cello-drone'],    color: '#D8B4FE' },
  landscaping:  { label: 'Root Tending',      freqs: [174, 285],  sounds: ['forest'],       drones: ['didgeridoo-drone'],color:'#22C55E' },
  gardening:    { label: 'Root Tending',      freqs: [174, 285],  sounds: ['forest'],       drones: ['didgeridoo-drone'],color:'#22C55E' },
  herbalism:    { label: 'Herb Bloom',        freqs: [528],       sounds: ['forest'],       drones: ['flute-drone'],    color: '#84CC16' },
  bible:        { label: 'Sacred Study',      freqs: [639, 852],  sounds: ['cave'],         drones: ['harp-drone'],     color: '#FCD34D' },
  meditation:   { label: 'Still Chamber',     freqs: [7.83, 528], sounds: ['singing-bowl'], drones: ['bowl-drone'],     color: '#D8B4FE' },
  geology:      { label: 'Crystal Lattice',   freqs: [111, 528],  sounds: ['cave'],         drones: ['bowl-drone'],     color: '#F59E0B' },
  physics:      { label: 'Resonance Lab',     freqs: [40, 963],   sounds: ['night'],        drones: ['cello-drone'],    color: '#3B82F6' },
  academy:      { label: 'Scholar\'s Calm',   freqs: [432, 852],  sounds: ['forest'],       drones: ['harmonium-drone'],color: '#818CF8' },
  herbology:    { label: 'Apothecary Bloom',  freqs: [528],       sounds: ['forest'],       drones: ['flute-drone'],    color: '#84CC16' },
  aromatherapy: { label: 'Essence Weave',     freqs: [639, 741],  sounds: ['stream'],       drones: ['oud-drone'],      color: '#C084FC' },
};

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
  const [mantraLoading, setMantraLoading] = useState(false);
  const [voiceMorph, setVoiceMorph] = useState({
    pitch: 0, formant: 0, reverb: 20, delay: 0, delayTime: 300,
    chorus: 0, distortion: 0, eqLow: 0, eqMid: 0, eqHigh: 0,
    speed: 100, width: 0, gain: 100,
  });

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
  const mantraSourceRef = useRef(null);
  const voiceChainRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // GATEKEEPER: Golden Ratio Throttle (φ = 1.618)
  // Prevents the "Box Logic vs Spherical Logic" fight by only updating state
  // when changes exceed the 1.618% threshold
  // ═══════════════════════════════════════════════════════════════════════════
  const PHI_THRESHOLD = 0.01618; // 1.618% change required
  
  // Track active count for isPlaying indicator
  // LOOP-FIX: Completely remove isPlaying from dependencies - use ref comparison only
  const prevActiveCountRef = useRef(0);
  const isPlayingRef = useRef(false);
  
  useEffect(() => {
    const currentCount = activeFreqs.size + activeSounds.size + activeDrones.size + (activeMantra ? 1 : 0);
    const shouldBePlaying = currentCount > 0;
    
    // GATEKEEPER: Only update if the discrete state actually changed
    if (shouldBePlaying !== isPlayingRef.current) {
      isPlayingRef.current = shouldBePlaying;
      setIsPlaying(shouldBePlaying);
    }
    prevActiveCountRef.current = currentCount;
    // Note: isPlaying is intentionally NOT in dependencies - the ref tracks it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFreqs.size, activeSounds.size, activeDrones.size, activeMantra]);

  const getCtx = useCallback(async () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      
      // Register globally for EmergencyShutOff
      if (!window.__cosmicAudioContexts) window.__cosmicAudioContexts = [];
      window.__cosmicAudioContexts.push(ctx);
      
      // Register with PerformanceManager for visibility-based suspension
      if (performanceManager.audioCtx !== ctx) {
        performanceManager.audioCtx = ctx;
      }
      
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
    masterGainRef.current.gain.value = muted ? 0 : phiVolumeCurve(masterVol);
    return ctxRef.current;
  }, [masterVol, muted]);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = muted ? 0 : phiVolumeCurve(masterVol);
  }, [masterVol, muted]);

  // V57.7 — Audio-Reactive Resonance Field. Once the master AudioContext
  // exists, drive a low-overhead RAF loop that samples the analyser node
  // and dispatches `sovereign:pulse` events with normalized bass + mid +
  // treble amplitudes. The ResonanceField listens and pulses on beat.
  // Loop self-stops when nothing is playing (gain == 0) to save battery.
  useEffect(() => {
    let raf = 0;
    let bytes = null;
    const tick = () => {
      const an = analyserRef.current;
      if (an) {
        if (!bytes || bytes.length !== an.frequencyBinCount) {
          bytes = new Uint8Array(an.frequencyBinCount);
        }
        an.getByteFrequencyData(bytes);
        // Bass = first 8 bins (~0-700 Hz), Mid = bins 8-32, Treble = bins 32+.
        let bass = 0, mid = 0, treble = 0;
        for (let i = 0; i < bytes.length; i++) {
          if (i < 8) bass += bytes[i];
          else if (i < 32) mid += bytes[i];
          else treble += bytes[i];
        }
        const intensity = {
          bass:   (bass / 8) / 255,
          mid:    (mid / 24) / 255,
          treble: (treble / Math.max(1, bytes.length - 32)) / 255,
          peak:   bytes.reduce((m, v) => v > m ? v : m, 0) / 255,
        };
        // Only dispatch if there's actual signal to react to (saves cycles
        // when the user is on a quiet page).
        if (intensity.peak > 0.04) {
          window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: intensity }));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // V68.31 — 528Hz Starseed Transition Lock (SOVEREIGN CHOICE-GATED).
  // When the Sovereign Kernel broadcasts `sovereign:audio-lock { frequency:528 }`,
  // we ONLY duck the master gain if BOTH conditions hold:
  //   1. The user has explicitly opted into audio (master not muted).
  //   2. The user's persisted Sovereign Preference audio.frequency === '528hz'.
  // This guarantees the Silence Shield + Sovereign Choice Protocol: the
  // system NEVER overrides a user's choice. If they chose Silence or 432Hz,
  // the lock is a no-op — as it must be.
  const audioLockRef = useRef(null);
  useEffect(() => {
    const readPrefFreq = () => {
      try {
        const raw = localStorage.getItem('sovereign_preferences_v1');
        if (!raw) return 'silence';
        return (JSON.parse(raw)?.audio?.frequency) || 'silence';
      } catch { return 'silence'; }
    };
    const onLock = (e) => {
      const pref = readPrefFreq();
      // Choice-gate: only honor the lock when the Sovereign chose 528Hz.
      if (pref !== '528hz') return;
      audioLockRef.current = { frequency: e.detail?.frequency ?? 528 };
      if (masterGainRef.current && !muted) {
        masterGainRef.current.gain.cancelScheduledValues(ctxRef.current?.currentTime || 0);
        masterGainRef.current.gain.linearRampToValueAtTime(
          phiVolumeCurve(masterVol) * 0.5,
          (ctxRef.current?.currentTime || 0) + 0.618
        );
      }
    };
    const onUnlock = () => {
      if (!audioLockRef.current) return;
      audioLockRef.current = null;
      if (masterGainRef.current && !muted) {
        masterGainRef.current.gain.cancelScheduledValues(ctxRef.current?.currentTime || 0);
        masterGainRef.current.gain.linearRampToValueAtTime(
          phiVolumeCurve(masterVol),
          (ctxRef.current?.currentTime || 0) + 0.618
        );
      }
    };
    window.addEventListener('sovereign:audio-lock', onLock);
    window.addEventListener('sovereign:audio-unlock', onUnlock);
    return () => {
      window.removeEventListener('sovereign:audio-lock', onLock);
      window.removeEventListener('sovereign:audio-unlock', onUnlock);
    };
  }, [masterVol, muted]);


  // Battery & Performance Optimization: Suspend/resume AudioContext on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (!ctxRef.current) return;
      
      if (document.visibilityState === 'hidden') {
        // Tab hidden - suspend to save battery
        if (ctxRef.current.state === 'running') {
          ctxRef.current.suspend().catch(() => {});
          console.log('[MixerContext] AudioContext suspended (tab hidden)');
        }
      } else {
        // Tab visible - resume if we have active audio
        const hasActiveAudio = activeFreqs.size > 0 || activeSounds.size > 0 || activeDrones.size > 0 || activeMantra;
        if (hasActiveAudio && ctxRef.current.state === 'suspended') {
          ctxRef.current.resume().catch(() => {});
          console.log('[MixerContext] AudioContext resumed (tab visible)');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeFreqs.size, activeSounds.size, activeDrones.size, activeMantra]);

  // Stop helpers
  const stopNodesForKey = useCallback((mapRef, key) => {
    const nodes = mapRef.current[key];
    if (!nodes) return;
    if (nodes._interval) clearInterval(nodes._interval);
    nodes.forEach?.(n => { try { n.stop?.(); n.disconnect?.(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } });
    delete mapRef.current[key];
  }, []);

  const toggleFreq = useCallback(async (freq, options = {}) => {
    if (activeFreqs.has(freq.hz)) {
      stopNodesForKey(freqNodesMapRef, freq.hz);
      delete freqGainMapRef.current[freq.hz];
      setActiveFreqs(prev => { const n = new Set(prev); n.delete(freq.hz); return n; });
      return;
    }
    const ctx = await getCtx();
    const waveform = options.waveform || 'sine';
    const vol = phiVolumeCurve(channelVols[`freq-${freq.hz}`] ?? 75);
    const channelGain = ctx.createGain();
    channelGain.gain.value = vol * 0.15;
    channelGain.connect(masterGainRef.current);
    freqGainMapRef.current[freq.hz] = channelGain;
    let nodes;
    if (freq.hz < 20) {
      const carrier = 200; const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = waveform; oscL.frequency.value = carrier;
      const gL = ctx.createGain(); gL.gain.value = 1; oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = waveform; oscR.frequency.value = carrier + freq.hz;
      const gR = ctx.createGain(); gR.gain.value = 1; oscR.connect(gR); gR.connect(merger, 0, 1);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq.hz * 16;
      const subG = ctx.createGain(); subG.gain.value = 0.06;
      sub.connect(subG); subG.connect(channelGain); merger.connect(channelGain);
      oscL.start(); oscR.start(); sub.start();
      nodes = [oscL, oscR, sub, merger];
    } else {
      // ━━━ Orchestral Synthesis — Rich layered harmonics ━━━
      const o = ctx.createOscillator(); o.type = waveform; o.frequency.value = freq.hz;
      // Warm overtones (octave + fifth)
      const h2 = ctx.createOscillator(); h2.type = 'sine'; h2.frequency.value = freq.hz * 2;
      const h2g = ctx.createGain(); h2g.gain.value = 0.04; h2.connect(h2g); h2g.connect(channelGain);
      const h3 = ctx.createOscillator(); h3.type = 'sine'; h3.frequency.value = freq.hz * 3;
      const h3g = ctx.createGain(); h3g.gain.value = 0.015; h3.connect(h3g); h3g.connect(channelGain);
      // Subtle detuned unison for warmth
      const det = ctx.createOscillator(); det.type = waveform; det.frequency.value = freq.hz * 1.002;
      const detG = ctx.createGain(); detG.gain.value = 0.06; det.connect(detG); detG.connect(channelGain);
      // Gentle vibrato
      const lfo = ctx.createOscillator(); lfo.frequency.value = 4.5;
      const lg = ctx.createGain(); lg.gain.value = freq.hz * 0.003;
      lfo.connect(lg); lg.connect(o.frequency);
      // Reverb via convolver-like delay feedback
      const delay = ctx.createDelay(0.5); delay.delayTime.value = 0.12;
      const fb = ctx.createGain(); fb.gain.value = 0.15;
      const dryG = ctx.createGain(); dryG.gain.value = 0.9;
      o.connect(dryG); dryG.connect(channelGain);
      o.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(channelGain);
      // ADSR envelope - gentle attack
      channelGain.gain.setValueAtTime(0, ctx.currentTime);
      channelGain.gain.linearRampToValueAtTime(vol * 0.15, ctx.currentTime + 0.8);
      o.start(); h2.start(); h3.start(); det.start(); lfo.start();
      nodes = [o, h2, h3, det, lfo, delay];
    }
    freqNodesMapRef.current[freq.hz] = nodes;
    if (!channelVols[`freq-${freq.hz}`]) setChannelVols(v => ({...v, [`freq-${freq.hz}`]: 75}));
    setActiveFreqs(prev => new Set(prev).add(freq.hz));
    // V68.26 — broadcast to any open HolographicChamber / ChamberMiniGame
    // so mixer nodules have a FUNCTION inside the current module (pulse
    // the prop, bias the rhythm band, etc.).
    try { window.dispatchEvent(new CustomEvent('sovereign:mixer-tick', { detail: { kind: 'freq', id: freq.hz, color: freq.color } })); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [activeFreqs, getCtx, channelVols, stopNodesForKey]);

  const toggleSound = useCallback(async (sound, options = {}) => {
    if (activeSounds.has(sound.id)) {
      stopNodesForKey(soundNodesMapRef, sound.id);
      delete soundGainMapRef.current[sound.id];
      delete soundFilterMapRef.current[sound.id];
      setActiveSounds(prev => { const n = new Set(prev); n.delete(sound.id); return n; });
      return;
    }
    const ctx = await getCtx();
    const vol = phiVolumeCurve(channelVols[`sound-${sound.id}`] ?? 75);
    const channelGain = ctx.createGain();
    channelGain.gain.value = vol * 0.15;
    soundGainMapRef.current[sound.id] = channelGain;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const sf = options.filter || { cutoff: 20000, resonance: 1 };
    filter.frequency.value = sf.cutoff;
    filter.Q.value = sf.resonance;
    soundFilterMapRef.current[sound.id] = filter;
    filter.connect(channelGain);
    channelGain.connect(masterGainRef.current);
    const nodes = sound.gen(ctx, filter);
    soundNodesMapRef.current[sound.id] = nodes;
    if (!channelVols[`sound-${sound.id}`]) setChannelVols(v => ({...v, [`sound-${sound.id}`]: 75}));
    setActiveSounds(prev => new Set(prev).add(sound.id));
    try { window.dispatchEvent(new CustomEvent('sovereign:mixer-tick', { detail: { kind: 'sound', id: sound.id, color: sound.color } })); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [activeSounds, getCtx, channelVols, stopNodesForKey]);

  const toggleDrone = useCallback(async (drone, options = {}) => {
    if (activeDrones.has(drone.id)) {
      stopNodesForKey(droneNodesMapRef, drone.id);
      delete droneGainMapRef.current[drone.id];
      delete droneFilterMapRef.current[drone.id];
      setActiveDrones(prev => { const n = new Set(prev); n.delete(drone.id); return n; });
      return;
    }
    const ctx = await getCtx();
    const vol = phiVolumeCurve(channelVols[`drone-${drone.id}`] ?? 75);
    const channelGain = ctx.createGain();
    channelGain.gain.value = vol * 0.15;
    droneGainMapRef.current[drone.id] = channelGain;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const df = options.filter || { cutoff: drone.filterFreq, resonance: drone.filterQ };
    filter.frequency.value = df.cutoff;
    filter.Q.value = df.resonance;
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

  // Build impulse response for convolution reverb
  const buildReverbIR = useCallback((ctx, duration = 2.5, decay = 3) => {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const ir = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return ir;
  }, []);

  // Build voice effects chain
  const buildVoiceChain = useCallback((ctx, masterGain, morph) => {
    if (voiceChainRef.current) {
      voiceChainRef.current.nodes.forEach(n => { try { n.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } });
    }
    const nodes = [];
    let last;
    const inputGain = ctx.createGain();
    inputGain.gain.value = (morph.gain / 100) * 1.5;
    nodes.push(inputGain); last = inputGain;
    // EQ
    const eqLow = ctx.createBiquadFilter(); eqLow.type = 'lowshelf'; eqLow.frequency.value = 300; eqLow.gain.value = morph.eqLow;
    last.connect(eqLow); nodes.push(eqLow); last = eqLow;
    const eqMid = ctx.createBiquadFilter(); eqMid.type = 'peaking'; eqMid.frequency.value = 1500; eqMid.Q.value = 1; eqMid.gain.value = morph.eqMid;
    last.connect(eqMid); nodes.push(eqMid); last = eqMid;
    const eqHigh = ctx.createBiquadFilter(); eqHigh.type = 'highshelf'; eqHigh.frequency.value = 4000; eqHigh.gain.value = morph.eqHigh;
    last.connect(eqHigh); nodes.push(eqHigh); last = eqHigh;
    // Formant
    if (morph.formant !== 0) {
      const shift = morph.formant * 8;
      [270, 730, 2000, 3400].forEach(f => {
        const bp = ctx.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = Math.max(80, f + shift); bp.Q.value = 4; bp.gain.value = 6;
        last.connect(bp); nodes.push(bp); last = bp;
      });
    }
    // Distortion
    if (morph.distortion > 0) {
      const ws = ctx.createWaveShaper();
      const amount = morph.distortion / 100 * 50;
      const curve = new Float32Array(44100);
      for (let i = 0; i < 44100; i++) { const x = (i * 2) / 44100 - 1; curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x)); }
      ws.curve = curve; ws.oversample = '4x';
      last.connect(ws); nodes.push(ws); last = ws;
    }
    const dryGain = ctx.createGain();
    const wetBus = ctx.createGain();
    const outputMerge = ctx.createGain(); outputMerge.gain.value = 1;
    // Chorus
    if (morph.chorus > 0) {
      const depth = morph.chorus / 100;
      const chorusDelay = ctx.createDelay(0.05); chorusDelay.delayTime.value = 0.025;
      const chorusLFO = ctx.createOscillator(); chorusLFO.frequency.value = 1.5;
      const chorusLFOGain = ctx.createGain(); chorusLFOGain.gain.value = 0.015 * depth;
      chorusLFO.connect(chorusLFOGain); chorusLFOGain.connect(chorusDelay.delayTime); chorusLFO.start();
      const chorusGain = ctx.createGain(); chorusGain.gain.value = depth * 0.6;
      last.connect(chorusDelay); chorusDelay.connect(chorusGain); chorusGain.connect(outputMerge);
      nodes.push(chorusDelay, chorusLFO, chorusLFOGain, chorusGain);
    }
    // Delay
    if (morph.delay > 0) {
      const delayNode = ctx.createDelay(3); delayNode.delayTime.value = morph.delayTime / 1000;
      const feedback = ctx.createGain(); feedback.gain.value = Math.min(0.85, morph.delay / 100 * 0.8);
      const delayWet = ctx.createGain(); delayWet.gain.value = morph.delay / 100 * 0.5;
      last.connect(delayNode); delayNode.connect(feedback); feedback.connect(delayNode);
      delayNode.connect(delayWet); delayWet.connect(outputMerge);
      nodes.push(delayNode, feedback, delayWet);
    }
    // Reverb
    const reverbWet = morph.reverb / 100;
    if (reverbWet > 0.05) {
      const convolver = ctx.createConvolver(); convolver.buffer = buildReverbIR(ctx, 2.5, 2.5);
      const reverbGain = ctx.createGain(); reverbGain.gain.value = reverbWet * 0.6;
      last.connect(convolver); convolver.connect(reverbGain); reverbGain.connect(outputMerge);
      nodes.push(convolver, reverbGain);
    }
    dryGain.gain.value = 1 - (reverbWet * 0.3);
    last.connect(dryGain); dryGain.connect(outputMerge);
    nodes.push(dryGain, wetBus, outputMerge);
    // Stereo Width
    if (morph.width > 0) {
      const panner = ctx.createStereoPanner();
      const panLFO = ctx.createOscillator(); panLFO.frequency.value = 0.3;
      const panGain = ctx.createGain(); panGain.gain.value = morph.width / 100;
      panLFO.connect(panGain); panGain.connect(panner.pan); panLFO.start();
      outputMerge.connect(panner); panner.connect(masterGain);
      nodes.push(panner, panLFO, panGain);
    } else {
      outputMerge.connect(masterGain);
    }
    voiceChainRef.current = { input: inputGain, nodes };
    return inputGain;
  }, [buildReverbIR]);

  // Rebuild voice chain when voiceMorph changes
  useEffect(() => {
    if (!mantraAudioRef.current || !ctxRef.current || !masterGainRef.current) return;
    const source = mantraSourceRef.current;
    if (!source) return;
    try { source.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    const chainInput = buildVoiceChain(ctxRef.current, masterGainRef.current, voiceMorph);
    source.connect(chainInput);
  }, [voiceMorph, buildVoiceChain]);

  const toggleMantra = useCallback(async (mantra, authHeaders) => {
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (mantraSourceRef.current) { try { mantraSourceRef.current.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } mantraSourceRef.current = null; }
    if (voiceChainRef.current) { voiceChainRef.current.nodes.forEach(n => { try { n.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }); voiceChainRef.current = null; }
    if (activeMantra?.id === mantra.id) { setActiveMantra(null); return; }
    setActiveMantra(mantra);
    setMantraLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mixer' }, { headers: authHeaders });
      if (!res.data.audio) { setMantraLoading(false); setActiveMantra(null); return; }
      const ctx = await getCtx();
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      const source = ctx.createMediaElementSource(audio);
      mantraSourceRef.current = source;
      mantraAudioRef.current = audio;
      audio.playbackRate = Math.pow(2, voiceMorph.pitch / 12) * (voiceMorph.speed / 100);
      const chainInput = buildVoiceChain(ctx, masterGainRef.current, voiceMorph);
      source.connect(chainInput);
      await audio.play();
      setMantraLoading(false);
    } catch {
      setMantraLoading(false);
      setActiveMantra(null);
    }
  }, [activeMantra, getCtx, voiceMorph, buildVoiceChain]);

  const setChannelVolume = useCallback((key, val) => {
    setChannelVols(v => ({...v, [key]: val}));
    const [type, ...rest] = key.split('-');
    const id = rest.join('-');
    if (type === 'freq' && freqGainMapRef.current[id]) freqGainMapRef.current[id].gain.value = phiVolumeCurve(val) * 0.15;
    else if (type === 'sound' && soundGainMapRef.current[id]) soundGainMapRef.current[id].gain.value = phiVolumeCurve(val) * 0.15;
    else if (type === 'drone' && droneGainMapRef.current[id]) droneGainMapRef.current[id].gain.value = phiVolumeCurve(val) * 0.15;
  }, []);

  const stopAll = useCallback(() => {
    Object.keys(freqNodesMapRef.current).forEach(k => stopNodesForKey(freqNodesMapRef, k));
    Object.keys(soundNodesMapRef.current).forEach(k => stopNodesForKey(soundNodesMapRef, k));
    Object.keys(droneNodesMapRef.current).forEach(k => stopNodesForKey(droneNodesMapRef, k));
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (mantraSourceRef.current) { try { mantraSourceRef.current.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } mantraSourceRef.current = null; }
    if (voiceChainRef.current) { voiceChainRef.current.nodes.forEach(n => { try { n.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }); voiceChainRef.current = null; }
    setActiveFreqs(new Set()); setActiveSounds(new Set()); setActiveDrones(new Set()); setActiveMantra(null);
    setMantraLoading(false);
  }, [stopNodesForKey]);

  const getSnapshot = useCallback(() => ({
    activeFreqs: Array.from(activeFreqs),
    activeSounds: Array.from(activeSounds),
    activeDrones: Array.from(activeDrones),
    activeMantra: activeMantra?.id || null,
    channelVols,
    masterVol,
    voiceMorph,
  }), [activeFreqs, activeSounds, activeDrones, activeMantra, channelVols, masterVol, voiceMorph]);

  const restoreSnapshot = useCallback(async (snap, authHeaders) => {
    stopAll();
    if (snap.masterVol != null) setMasterVol(snap.masterVol);
    if (snap.channelVols) setChannelVols(snap.channelVols);
    if (snap.voiceMorph) setVoiceMorph(snap.voiceMorph);
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
    if (snap.activeMantra && authHeaders) {
      const m = MANTRAS.find(x => x.id === snap.activeMantra);
      if (m) await toggleMantra(m, authHeaders);
    }
  }, [stopAll, toggleFreq, toggleSound, toggleDrone, toggleMantra]);

  const totalActive = activeFreqs.size + activeSounds.size + activeDrones.size + (activeMantra ? 1 : 0);

  // V68.28 — Haptic Resonance source-of-truth. The dominant active
  // frequency (lowest Hz if multiple) becomes the device vibration
  // period so every chamber tap feels like the trade's resonant tone.
  // Fallback: 40ms default pulse.
  const currentResonanceHz = useMemo(() => {
    if (!activeFreqs.size) return null;
    return Math.min(...Array.from(activeFreqs));
  }, [activeFreqs]);
  useEffect(() => {
    try { window.__sovereignHz = currentResonanceHz || null; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [currentResonanceHz]);

  // ─── V68.27 Resonance Preset application ─────────────────────────
  // Any chamber can call applyResonancePreset('masonry') to activate
  // the baked-in High-Performance recipe for that trade. Nodules that
  // are already active are skipped (additive, not destructive).
  const applyResonancePreset = useCallback(async (presetKey) => {
    const preset = RESONANCE_PRESETS[presetKey];
    if (!preset) return null;
    // Turn ON freqs that aren't already active
    for (const hz of preset.freqs || []) {
      const f = FREQUENCIES.find(x => x.hz === hz);
      if (f && !activeFreqs.has(hz)) { try { await toggleFreq(f); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }
    }
    for (const sid of preset.sounds || []) {
      const s = SOUNDS.find(x => x.id === sid);
      if (s && !activeSounds.has(sid)) { try { await toggleSound(s); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }
    }
    for (const did of preset.drones || []) {
      const d = INSTRUMENT_DRONES.find(x => x.id === did);
      if (d && !activeDrones.has(did)) { try { await toggleDrone(d); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }
    }
    try { window.dispatchEvent(new CustomEvent('sovereign:resonance-preset', { detail: { preset: presetKey, label: preset.label } })); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    return preset;
  }, [activeFreqs, activeSounds, activeDrones, toggleFreq, toggleSound, toggleDrone]);

  // GATEKEEPER: Memoize the context value to prevent cascading re-renders
  // This is critical - without this, every consumer re-renders on every tick
  const value = useMemo(() => ({
    masterVol, setMasterVol, muted, setMuted,
    activeFreqs, activeSounds, activeDrones, activeMantra,
    channelVols, setChannelVols, setChannelVolume,
    isPlaying, totalActive, mantraLoading, setMantraLoading,
    voiceMorph, setVoiceMorph,
    getCtx, toggleFreq, toggleSound, toggleDrone, toggleMantra,
    stopAll, getSnapshot, restoreSnapshot,
    applyResonancePreset, RESONANCE_PRESETS,
    analyserRef, masterGainRef, ctxRef,
    freqNodesMapRef, freqGainMapRef,
    soundNodesMapRef, soundGainMapRef, soundFilterMapRef,
    droneNodesMapRef, droneGainMapRef, droneFilterMapRef,
    mantraAudioRef, mantraSourceRef, voiceChainRef,
    setActiveMantra, setActiveFreqs, setActiveSounds, setActiveDrones,
  }), [
    masterVol, muted, activeFreqs, activeSounds, activeDrones, activeMantra,
    channelVols, isPlaying, totalActive, mantraLoading, voiceMorph,
    getCtx, toggleFreq, toggleSound, toggleDrone, toggleMantra,
    stopAll, getSnapshot, restoreSnapshot, setChannelVolume,
    applyResonancePreset,
  ]);

  return <MixerContext.Provider value={value}>{children}</MixerContext.Provider>;
}

export function useMixer() {
  const ctx = useContext(MixerContext);
  if (!ctx) throw new Error('useMixer must be inside MixerProvider');
  return ctx;
}
