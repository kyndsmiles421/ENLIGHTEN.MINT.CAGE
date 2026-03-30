import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Volume2, VolumeX, Waves, Sun, BookOpen, Vibrate, Music, Radio, ChevronDown,
  Play, Pause, Square, Loader2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTempo } from '../context/TempoContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FREQUENCIES = [
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

const SOUNDS = [
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

const MANTRAS = [
  { id: 'om', label: 'Om', text: 'Om... Om... Om... Let the vibration settle into your being. Om... Om... Om...', tradition: 'Universal', color: '#C084FC' },
  { id: 'om-mani', label: 'Om Mani Padme Hum', text: 'Om Mani Padme Hum... Om Mani Padme Hum... Let compassion fill every cell. Om Mani Padme Hum...', tradition: 'Tibetan Buddhist', color: '#2DD4BF' },
  { id: 'om-namah', label: 'Om Namah Shivaya', text: 'Om Namah Shivaya... I bow to the divine within. Om Namah Shivaya... Om Namah Shivaya...', tradition: 'Hindu', color: '#8B5CF6' },
  { id: 'so-hum', label: 'So Hum', text: 'So... Hum... I am that I am. So... Hum... Breathe in, I am. Breathe out, that. So... Hum...', tradition: 'Vedic', color: '#3B82F6' },
  { id: 'ra-ma', label: 'Ra Ma Da Sa', text: 'Ra Ma Da Sa... Sa Say So Hung... Feel the healing energy flow. Ra Ma Da Sa... Sa Say So Hung...', tradition: 'Kundalini', color: '#FCD34D' },
  { id: 'peace', label: 'I Am Peace', text: 'I am peace... I am light... I am love... With every breath, I return to stillness. I am peace... I am light... I am love...', tradition: 'Modern', color: '#22C55E' },
  { id: 'gayatri', label: 'Gayatri', text: 'Om Bhur Bhuvaswaha... Tat Savitur Varenyam... Bhargo Devasya Dhimahi... Dhiyo Yo Nah Prachodayat...', tradition: 'Hindu Vedic', color: '#F59E0B' },
  { id: 'gate-gate', label: 'Gate Gate', text: 'Gate Gate... Paragate... Parasamgate... Bodhi Svaha... Gone, gone, gone beyond. Enlightenment. Gate Gate...', tradition: 'Buddhist', color: '#EC4899' },
  { id: 'lokah', label: 'Lokah Samastah', text: 'Lokah Samastah Sukhino Bhavantu... May all beings everywhere be happy and free. Lokah Samastah Sukhino Bhavantu...', tradition: 'Sanskrit', color: '#10B981' },
  { id: 'hu', label: 'Hu', text: 'Hu... Hu... Hu... The ancient sound of the soul. Let it carry you inward. Hu... Hu... Hu...', tradition: 'Sufi', color: '#F97316' },
  { id: 'shema', label: 'Shema', text: 'Shema Yisrael... Adonai Eloheinu... Adonai Echad... Hear, O Israel. Shema Yisrael...', tradition: 'Jewish', color: '#818CF8' },
  { id: 'allah-hu', label: 'Allah Hu', text: 'Allah Hu... Allah Hu... The breath of the Beloved. Allah Hu... Allah Hu...', tradition: 'Islamic Sufi', color: '#0EA5E9' },
  { id: 'nam-myoho', label: 'Nam Myoho Renge Kyo', text: 'Nam Myoho Renge Kyo... I devote myself to the mystic law of cause and effect. Nam Myoho Renge Kyo...', tradition: 'Nichiren Buddhist', color: '#DC2626' },
  { id: 'waheguru', label: 'Waheguru', text: 'Waheguru... Waheguru... Wonderful Lord. The darkness dissolves. Waheguru... Waheguru...', tradition: 'Sikh', color: '#EA580C' },
  { id: 'hooponopono', label: 'Ho\'oponopono', text: 'I am sorry... Please forgive me... Thank you... I love you... I am sorry... Please forgive me...', tradition: 'Hawaiian', color: '#06B6D4' },
  { id: 'abundance', label: 'I Am Abundance', text: 'I am abundance... I am prosperity... The universe provides for me endlessly. I am abundance...', tradition: 'Modern', color: '#FCD34D' },
  { id: 'ham-sa', label: 'Ham Sa', text: 'Ham... Sa... I am that. The swan of consciousness glides upon the waters of being. Ham... Sa...', tradition: 'Vedantic', color: '#A855F7' },
  { id: 'om-tare', label: 'Om Tare Tuttare', text: 'Om Tare Tuttare Ture Soha... Green Tara, swift protector, dispel all fears. Om Tare Tuttare Ture Soha...', tradition: 'Tibetan Buddhist', color: '#34D399' },
];

const INSTRUMENT_DRONES = [
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

const LIGHT_MODES = [
  { id: 'sunrise', label: 'Sunrise Glow', colors: ['#FCD34D', '#FB923C', '#EF4444'], speed: 4000 },
  { id: 'aurora', label: 'Aurora', colors: ['#22C55E', '#2DD4BF', '#3B82F6', '#8B5CF6'], speed: 3000 },
  { id: 'calm-blue', label: 'Calm Blue', colors: ['#1E3A5F', '#3B82F6', '#06B6D4'], speed: 5000 },
  { id: 'healing-green', label: 'Healing Green', colors: ['#064E3B', '#22C55E', '#2DD4BF'], speed: 4500 },
  { id: 'violet-flame', label: 'Violet Flame', colors: ['#4C1D95', '#8B5CF6', '#C084FC', '#E879F9'], speed: 3500 },
  { id: 'golden', label: 'Golden Light', colors: ['#78350F', '#F59E0B', '#FCD34D'], speed: 5000 },
];

export default function CosmicMixerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bpm, setBpm, activePreset, setTempoFromPreset, tapTempo, stopTempo, beatPulse, connectToGains, TEMPO_PRESETS } = useTempo();
  const [masterVol, setMasterVol] = useState(60);
  const [muted, setMuted] = useState(false);

  const [activeFreqs, setActiveFreqs] = useState(new Set());
  const [activeSounds, setActiveSounds] = useState(new Set());
  const [activeMantra, setActiveMantra] = useState(null);
  const [activeDrones, setActiveDrones] = useState(new Set());
  const [activeLight, setActiveLight] = useState(null);
  const [vibeOn, setVibeOn] = useState(false);
  const [mantraLoading, setMantraLoading] = useState(false);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const freqNodesMapRef = useRef({});
  const soundNodesMapRef = useRef({});
  const droneNodesMapRef = useRef({});
  const mantraAudioRef = useRef(null);
  const vibeIntervalRef = useRef(null);

  const getCtx = useCallback(async () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
    return ctxRef.current;
  }, [masterVol, muted]);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
  }, [masterVol, muted]);

  const stopNodesForKey = (mapRef, key) => {
    const nodes = mapRef.current[key]; if (!nodes) return;
    nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    if (nodes._interval) clearInterval(nodes._interval);
    delete mapRef.current[key];
  };
  const stopAllInMap = (mapRef) => { Object.keys(mapRef.current).forEach(key => stopNodesForKey(mapRef, key)); };

  const toggleFreq = useCallback(async (freq) => {
    if (activeFreqs.has(freq.hz)) {
      stopNodesForKey(freqNodesMapRef, freq.hz);
      setActiveFreqs(prev => { const n = new Set(prev); n.delete(freq.hz); return n; });
      return;
    }
    const ctx = await getCtx();
    const g = masterGainRef.current;
    let nodes;
    if (freq.hz < 20) {
      const carrier = 200; const merger = ctx.createChannelMerger(2);
      const gn = ctx.createGain(); gn.gain.value = 0.15;
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = carrier;
      const gL = ctx.createGain(); gL.gain.value = 1; oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = carrier + freq.hz;
      const gR = ctx.createGain(); gR.gain.value = 1; oscR.connect(gR); gR.connect(merger, 0, 1);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq.hz * 16;
      const subG = ctx.createGain(); subG.gain.value = 0.06;
      sub.connect(subG); subG.connect(gn); merger.connect(gn); gn.connect(g);
      oscL.start(); oscR.start(); sub.start();
      nodes = [oscL, oscR, sub, merger];
    } else {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq.hz;
      const gn = ctx.createGain(); gn.gain.value = 0.12;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(gn.gain); o.connect(gn); gn.connect(g);
      o.start(); lfo.start();
      nodes = [o, lfo];
    }
    freqNodesMapRef.current[freq.hz] = nodes;
    setActiveFreqs(prev => new Set(prev).add(freq.hz));
  }, [activeFreqs, getCtx]);

  const toggleSound = useCallback(async (sound) => {
    if (activeSounds.has(sound.id)) {
      stopNodesForKey(soundNodesMapRef, sound.id);
      setActiveSounds(prev => { const n = new Set(prev); n.delete(sound.id); return n; });
      return;
    }
    const ctx = await getCtx();
    const nodes = sound.gen(ctx, masterGainRef.current);
    soundNodesMapRef.current[sound.id] = nodes;
    setActiveSounds(prev => new Set(prev).add(sound.id));
  }, [activeSounds, getCtx]);

  const toggleDrone = useCallback(async (drone) => {
    if (activeDrones.has(drone.id)) {
      stopNodesForKey(droneNodesMapRef, drone.id);
      setActiveDrones(prev => { const n = new Set(prev); n.delete(drone.id); return n; });
      return;
    }
    const ctx = await getCtx();
    const g = masterGainRef.current;
    const osc = ctx.createOscillator(); osc.type = drone.wave; osc.frequency.value = drone.freq;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = drone.filterFreq; filter.Q.value = drone.filterQ;
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = drone.vibratoRate;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = drone.vibratoDepth;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = drone.freq / 2;
    const subGain = ctx.createGain(); subGain.gain.value = 0.3;
    sub.connect(subGain); subGain.connect(filter);
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.12;
    osc.connect(filter); filter.connect(droneGain); droneGain.connect(g);
    osc.start(); lfo.start(); sub.start();
    droneNodesMapRef.current[drone.id] = [osc, lfo, sub];
    setActiveDrones(prev => new Set(prev).add(drone.id));
  }, [activeDrones, getCtx]);

  const toggleMantra = useCallback(async (mantra) => {
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (activeMantra?.id === mantra.id) { setActiveMantra(null); return; }
    setActiveMantra(mantra);
    setMantraLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mixer' });
      if (!res.data.audio) { setMantraLoading(false); setActiveMantra(null); return; }
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.volume = 0.7;
      audio.loop = true;
      mantraAudioRef.current = audio;
      audio.play().catch(() => {});
      setMantraLoading(false);
    } catch {
      setMantraLoading(false);
      setActiveMantra(null);
    }
  }, [activeMantra]);

  const firstActiveFreq = activeFreqs.size > 0 ? FREQUENCIES.find(f => activeFreqs.has(f.hz)) : null;

  const toggleVibe = useCallback(() => {
    if (vibeOn) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      try { navigator.vibrate(0); } catch {}
      setVibeOn(false);
    } else {
      const pattern = firstActiveFreq ? Math.max(50, Math.round(1000 / firstActiveFreq.hz * 10)) : 200;
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      pulse();
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
      setVibeOn(true);
    }
  }, [vibeOn, firstActiveFreq]);

  useEffect(() => {
    if (vibeOn && firstActiveFreq) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      const pattern = Math.max(50, Math.round(1000 / firstActiveFreq.hz * 10));
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
    }
  }, [firstActiveFreq, vibeOn]);

  const toggleLight = useCallback((mode) => {
    if (activeLight?.id === mode.id) { setActiveLight(null); return; }
    setActiveLight(mode);
  }, [activeLight]);

  const stopAll = useCallback(() => {
    stopAllInMap(freqNodesMapRef); stopAllInMap(soundNodesMapRef); stopAllInMap(droneNodesMapRef);
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
    try { navigator.vibrate(0); } catch {}
    setActiveFreqs(new Set()); setActiveSounds(new Set()); setActiveDrones(new Set());
    setActiveMantra(null); setActiveLight(null); setVibeOn(false);
  }, []);

  useEffect(() => () => { stopAll(); if (ctxRef.current) ctxRef.current.close(); }, [stopAll]);

  // Tempo LFO: modulate master gain to the beat
  const tempoCleanupRef = useRef(null);
  useEffect(() => {
    if (tempoCleanupRef.current) { tempoCleanupRef.current(); tempoCleanupRef.current = null; }
    if (bpm > 0 && ctxRef.current && masterGainRef.current) {
      tempoCleanupRef.current = connectToGains(ctxRef.current, [masterGainRef.current]);
    }
    return () => { if (tempoCleanupRef.current) { tempoCleanupRef.current(); tempoCleanupRef.current = null; } };
  }, [bpm, connectToGains]);

  // ─── Session Mode ───
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [sessionPhaseIdx, setSessionPhaseIdx] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [sessionPhaseTimeLeft, setSessionPhaseTimeLeft] = useState(0);
  const sessionIntervalRef = useRef(null);

  const SESSIONS = [
    { id: 'morning', label: 'Morning Awakening', duration: 900, icon: '☀', color: '#F59E0B',
      phases: [
        { dur: 180, bpm: 40, freq: [7.83], sound: ['ocean'], drone: [], mantra: null, light: 'calm-blue', desc: 'Gentle Awakening' },
        { dur: 180, bpm: 60, freq: [432], sound: ['stream'], drone: ['bowl-drone'], mantra: null, light: 'sunrise', desc: 'Rising Energy' },
        { dur: 180, bpm: 72, freq: [528], sound: ['forest'], drone: ['flute-drone'], mantra: 'om', light: 'healing-green', desc: 'Heart Opening' },
        { dur: 180, bpm: 80, freq: [639, 741], sound: ['singing-bowl'], drone: ['tanpura-drone'], mantra: 'gayatri', light: 'golden', desc: 'Full Radiance' },
        { dur: 180, bpm: 60, freq: [528], sound: ['stream'], drone: [], mantra: 'peace', light: 'sunrise', desc: 'Gentle Integration' },
      ]},
    { id: 'deep-sleep', label: 'Deep Sleep Descent', duration: 1200, icon: '🌙', color: '#6366F1',
      phases: [
        { dur: 240, bpm: 60, freq: [432], sound: ['rain'], drone: ['harmonium-drone'], mantra: 'so-hum', light: 'calm-blue', desc: 'Settling In' },
        { dur: 240, bpm: 50, freq: [174, 285], sound: ['ocean'], drone: ['cello-drone'], mantra: null, light: 'calm-blue', desc: 'Deepening' },
        { dur: 240, bpm: 40, freq: [7.83], sound: ['cave'], drone: ['tibetan-horn'], mantra: null, light: 'violet', desc: 'Delta Descent' },
        { dur: 240, bpm: 40, freq: [7.83], sound: ['night'], drone: [], mantra: null, light: null, desc: 'Deep Rest' },
        { dur: 240, bpm: 0, freq: [], sound: ['rain'], drone: [], mantra: null, light: null, desc: 'Silence' },
      ]},
    { id: 'chakra', label: 'Chakra Activation', duration: 840, icon: '🔮', color: '#C084FC',
      phases: [
        { dur: 120, bpm: 60, freq: [396], sound: ['thunder'], drone: ['didgeridoo-drone'], mantra: 'om', light: null, desc: 'Root — Grounding' },
        { dur: 120, bpm: 65, freq: [417], sound: ['ocean'], drone: ['oud-drone'], mantra: null, light: null, desc: 'Sacral — Flow' },
        { dur: 120, bpm: 70, freq: [528], sound: ['fire'], drone: ['sitar-drone'], mantra: 'ra-ma', light: 'golden', desc: 'Solar Plexus — Power' },
        { dur: 120, bpm: 72, freq: [639], sound: ['forest'], drone: ['harp-drone'], mantra: 'lokah', light: 'healing-green', desc: 'Heart — Love' },
        { dur: 120, bpm: 75, freq: [741], sound: ['wind'], drone: ['flute-drone'], mantra: 'ham-sa', light: 'calm-blue', desc: 'Throat — Expression' },
        { dur: 120, bpm: 72, freq: [852], sound: ['singing-bowl'], drone: ['bowl-drone'], mantra: 'om-mani', light: 'violet', desc: 'Third Eye — Insight' },
        { dur: 120, bpm: 60, freq: [963], sound: ['singing-bowl'], drone: ['kalimba-drone'], mantra: 'gate-gate', light: 'aurora', desc: 'Crown — Connection' },
      ]},
    { id: 'shamanic', label: 'Shamanic Journey', duration: 900, icon: '🦅', color: '#78350F',
      phases: [
        { dur: 180, bpm: 80, freq: [111], sound: ['fire'], drone: ['didgeridoo-drone'], mantra: 'hu', light: null, desc: 'Calling In' },
        { dur: 180, bpm: 120, freq: [7.83, 40], sound: ['thunder'], drone: ['didgeridoo-drone', 'tibetan-horn'], mantra: null, light: null, desc: 'Descent' },
        { dur: 180, bpm: 140, freq: [40], sound: ['wind'], drone: ['bagpipe-drone', 'didgeridoo-drone'], mantra: null, light: 'violet', desc: 'Deep Trance' },
        { dur: 180, bpm: 100, freq: [528], sound: ['forest'], drone: ['flute-drone'], mantra: 'om-tare', light: 'healing-green', desc: 'Return Journey' },
        { dur: 180, bpm: 60, freq: [432], sound: ['stream'], drone: [], mantra: 'peace', light: 'golden', desc: 'Integration' },
      ]},
    { id: 'ocean-calm', label: 'Ocean Calm', duration: 600, icon: '🌊', color: '#06B6D4',
      phases: [
        { dur: 150, bpm: 60, freq: [432], sound: ['ocean'], drone: ['hang-drum-drone'], mantra: null, light: 'calm-blue', desc: 'Arrival' },
        { dur: 150, bpm: 50, freq: [528, 639], sound: ['ocean', 'stream'], drone: ['harp-drone'], mantra: 'hooponopono', light: 'calm-blue', desc: 'Immersion' },
        { dur: 150, bpm: 40, freq: [174], sound: ['ocean', 'waterfall'], drone: [], mantra: null, light: 'calm-blue', desc: 'Deep Calm' },
        { dur: 150, bpm: 50, freq: [432], sound: ['ocean'], drone: [], mantra: 'peace', light: 'calm-blue', desc: 'Gentle Return' },
      ]},
  ];

  const startSession = useCallback((session) => {
    stopAll();
    setSessionData(session);
    setSessionPhaseIdx(0);
    setSessionTimeLeft(session.duration);
    setSessionPhaseTimeLeft(session.phases[0].dur);
    setSessionActive(true);
  }, [stopAll]);

  const stopSession = useCallback(() => {
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    setSessionActive(false);
    setSessionData(null);
    stopAll();
  }, [stopAll]);

  // Load phase layers
  const loadPhase = useCallback((phase) => {
    stopAll();
    setTimeout(() => {
      if (phase.bpm > 0) setBpm(phase.bpm);
      else stopTempo();
      phase.freq.forEach((hz, i) => {
        const f = FREQUENCIES.find(x => x.hz === hz);
        if (f) setTimeout(() => toggleFreq(f), 100 + i * 60);
      });
      (phase.sound || []).forEach((id, i) => {
        const s = SOUNDS.find(x => x.id === id);
        if (s) setTimeout(() => toggleSound(s), 200 + i * 60);
      });
      (phase.drone || []).forEach((id, i) => {
        const d = INSTRUMENT_DRONES.find(x => x.id === id);
        if (d) setTimeout(() => toggleDrone(d), 300 + i * 60);
      });
      if (phase.mantra) {
        const m = MANTRAS.find(x => x.id === phase.mantra);
        if (m) setTimeout(() => toggleMantra(m), 500);
      }
      if (phase.light) {
        const l = LIGHT_MODES.find(x => x.id === phase.light);
        if (l) setActiveLight(l);
      } else {
        setActiveLight(null);
      }
    }, 200);
  }, [stopAll, setBpm, stopTempo, toggleFreq, toggleSound, toggleDrone, toggleMantra]);

  // Session timer
  useEffect(() => {
    if (!sessionActive || !sessionData) return;
    loadPhase(sessionData.phases[0]);

    sessionIntervalRef.current = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1) { stopSession(); return 0; }
        return prev - 1;
      });
      setSessionPhaseTimeLeft(prev => {
        if (prev <= 1) {
          setSessionPhaseIdx(idx => {
            const nextIdx = idx + 1;
            if (nextIdx >= sessionData.phases.length) { stopSession(); return idx; }
            loadPhase(sessionData.phases[nextIdx]);
            setSessionPhaseTimeLeft(sessionData.phases[nextIdx].dur);
            return nextIdx;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current); };
  }, [sessionActive, sessionData]);

  // ─── Haptic intensity ───
  const [hapticIntensity, setHapticIntensity] = useState(70);

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ─── Collapsible accordion state ───
  const [openSections, setOpenSections] = useState({ freq: true, sound: false, drone: false, mantra: false, light: false, haptic: false, tempo: false, session: false });
  const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  const hasActive = activeFreqs.size > 0 || activeSounds.size > 0 || activeDrones.size > 0 || activeMantra || activeLight || vibeOn;
  const activeCount = activeFreqs.size + activeSounds.size + activeDrones.size + (activeMantra ? 1 : 0) + (activeLight ? 1 : 0) + (vibeOn ? 1 : 0);

  return (
    <div className="min-h-screen relative" data-testid="cosmic-mixer-page">
      {activeLight && <div className="fixed inset-0 pointer-events-none z-10"><LightOverlay mode={activeLight} /></div>}

      {/* Session progress bar */}
      {sessionActive && sessionData && (
        <div className="fixed top-0 left-0 right-0 z-40" style={{ background: 'rgba(10,10,18,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{sessionData.icon}</span>
                <span className="text-xs font-medium" style={{ color: sessionData.color }}>{sessionData.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums" style={{ color: 'rgba(248,250,252,0.5)' }}>{fmtTime(sessionTimeLeft)}</span>
                <button onClick={stopSession} className="text-[10px] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} data-testid="session-stop">End</button>
              </div>
            </div>
            <div className="flex gap-1 mb-1">
              {sessionData.phases.map((p, i) => (
                <div key={i} className="h-1 rounded-full flex-1 transition-all" style={{ background: i < sessionPhaseIdx ? sessionData.color : i === sessionPhaseIdx ? `${sessionData.color}80` : 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: sessionData.color }}>Phase {sessionPhaseIdx + 1}/{sessionData.phases.length}: {sessionData.phases[sessionPhaseIdx]?.desc}</span>
              <span className="text-[9px] tabular-nums" style={{ color: 'rgba(248,250,252,0.3)' }}>{fmtTime(sessionPhaseTimeLeft)} left</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sticky Master Controls Footer ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50" data-testid="mixer-sticky-footer"
        style={{ background: 'rgba(10,10,18,0.94)', backdropFilter: 'blur(24px)', borderTop: `1px solid ${hasActive ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setMuted(m => !m)} className="p-1.5 rounded-lg flex-shrink-0 transition-all active:scale-90"
              style={{ background: muted ? 'rgba(239,68,68,0.1)' : 'transparent' }} data-testid="sticky-mute">
              {muted ? <VolumeX size={18} style={{ color: '#EF4444' }} /> : <Volume2 size={18} style={{ color: '#C084FC' }} />}
            </button>
            <input type="range" min={0} max={100} value={muted ? 0 : masterVol}
              onChange={e => { setMasterVol(parseInt(e.target.value)); setMuted(false); }}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #C084FC ${muted ? 0 : masterVol}%, rgba(255,255,255,0.08) ${muted ? 0 : masterVol}%)` }}
              data-testid="sticky-volume" />
            <span className="text-[11px] w-8 text-right tabular-nums flex-shrink-0" style={{ color: 'rgba(248,250,252,0.5)' }}>{muted ? 0 : masterVol}%</span>
            <button onClick={stopAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl flex-shrink-0 transition-all active:scale-95"
              style={{
                background: hasActive ? 'rgba(239,68,68,0.15)' : 'rgba(248,250,252,0.04)',
                border: `1px solid ${hasActive ? 'rgba(239,68,68,0.3)' : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid="sticky-stop-all">
              <Square size={12} style={{ color: hasActive ? '#EF4444' : 'rgba(248,250,252,0.3)' }} />
              <span className="text-[11px] font-medium" style={{ color: hasActive ? '#EF4444' : 'rgba(248,250,252,0.3)' }}>Stop All</span>
            </button>
          </div>
          {hasActive && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C084FC' }} />
              <span className="text-[9px]" style={{ color: 'rgba(192,132,252,0.6)' }}>{activeCount} layer{activeCount !== 1 ? 's' : ''} active</span>
            </div>
          )}
        </div>
      </div>

      <div className={`max-w-2xl mx-auto px-4 pb-32 relative z-20 ${sessionActive ? 'pt-24' : 'pt-6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => { stopAll(); stopSession(); navigate(-1); }} className="p-2 rounded-xl transition-all hover:scale-105" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }} data-testid="mixer-back">
            <ArrowLeft size={18} style={{ color: 'rgba(248,250,252,0.6)' }} />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Waves size={16} style={{ color: '#C084FC' }} />
              <h1 className="text-lg font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>Cosmic Mixer</h1>
            </div>
          </div>
          <div className="w-10" /> {/* spacer for alignment */}
        </div>

        {/* Accordion Sections */}
        <div className="space-y-2">
          <AccordionSection title="Session Mode" icon={Play} color="#EC4899" open={openSections.session} onToggle={() => toggleSection('session')} badge={sessionActive ? sessionData?.label : null}>
            {sessionActive ? (
              <div className="text-center py-3">
                <p className="text-xs mb-2" style={{ color: 'rgba(248,250,252,0.5)' }}>Session in progress</p>
                <button onClick={stopSession} className="text-xs px-5 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} data-testid="session-stop-inner">End Session</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SESSIONS.map(s => (
                  <button key={s.id} onClick={() => startSession(s)} className="text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }} data-testid={`session-${s.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{fmtTime(s.duration)} — {s.phases.length} phases</span>
                  </button>
                ))}
              </div>
            )}
          </AccordionSection>

          <AccordionSection title="Solfeggio Frequency" icon={Waves} color="#C084FC" open={openSections.freq} onToggle={() => toggleSection('freq')} badge={activeFreqs.size > 0 ? `${activeFreqs.size} active` : null}>
            <div className="flex flex-wrap gap-1.5">
              {FREQUENCIES.map(f => (
                <button key={f.hz} onClick={() => toggleFreq(f)} className="flex-shrink-0 text-left px-3 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]"
                  style={{ background: activeFreqs.has(f.hz) ? `${f.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeFreqs.has(f.hz) ? `${f.color}35` : 'rgba(255,255,255,0.04)'}` }}
                  data-testid={`mixer-freq-${f.hz}`}>
                  <span className="text-[11px] font-medium block" style={{ color: activeFreqs.has(f.hz) ? f.color : 'rgba(248,250,252,0.7)' }}>{f.label}</span>
                  <span className="text-[8px] block" style={{ color: 'rgba(248,250,252,0.25)' }}>{f.desc}</span>
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Ambient Sound" icon={Volume2} color="#3B82F6" open={openSections.sound} onToggle={() => toggleSection('sound')} badge={activeSounds.size > 0 ? `${activeSounds.size} active` : null}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {SOUNDS.map(s => (
                <button key={s.id} onClick={() => toggleSound(s)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]"
                  style={{ background: activeSounds.has(s.id) ? `${s.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeSounds.has(s.id) ? `${s.color}35` : 'rgba(255,255,255,0.04)'}` }}
                  data-testid={`mixer-sound-${s.id}`}>
                  {activeSounds.has(s.id) ? <Pause size={10} style={{ color: s.color }} /> : <Play size={10} style={{ color: 'rgba(248,250,252,0.25)' }} />}
                  <span className="text-[11px]" style={{ color: activeSounds.has(s.id) ? s.color : 'rgba(248,250,252,0.55)' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="World Instruments" icon={Music} color="#F59E0B" open={openSections.drone} onToggle={() => toggleSection('drone')} badge={activeDrones.size > 0 ? `${activeDrones.size} active` : null}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {INSTRUMENT_DRONES.map(d => (
                <button key={d.id} onClick={() => toggleDrone(d)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]"
                  style={{ background: activeDrones.has(d.id) ? `${d.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeDrones.has(d.id) ? `${d.color}35` : 'rgba(255,255,255,0.04)'}` }}
                  data-testid={`mixer-drone-${d.id}`}>
                  {activeDrones.has(d.id) ? <Pause size={10} style={{ color: d.color }} /> : <Play size={10} style={{ color: 'rgba(248,250,252,0.25)' }} />}
                  <span className="text-[11px]" style={{ color: activeDrones.has(d.id) ? d.color : 'rgba(248,250,252,0.55)' }}>{d.label}</span>
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Mantra" icon={BookOpen} color="#2DD4BF" open={openSections.mantra} onToggle={() => toggleSection('mantra')} badge={activeMantra ? activeMantra.label : null}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {MANTRAS.map(m => (
                <button key={m.id} onClick={() => toggleMantra(m)} disabled={mantraLoading && activeMantra?.id !== m.id}
                  className="text-left px-2.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] flex items-center gap-1.5"
                  style={{ background: activeMantra?.id === m.id ? `${m.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeMantra?.id === m.id ? `${m.color}35` : 'rgba(255,255,255,0.04)'}`, opacity: mantraLoading && activeMantra?.id !== m.id ? 0.4 : 1 }}
                  data-testid={`mixer-mantra-${m.id}`}>
                  {mantraLoading && activeMantra?.id === m.id && <Loader2 size={9} className="animate-spin flex-shrink-0" style={{ color: m.color }} />}
                  <div>
                    <span className="text-[11px] font-medium block" style={{ color: activeMantra?.id === m.id ? m.color : 'rgba(248,250,252,0.65)' }}>{m.label}</span>
                    <span className="text-[8px] block" style={{ color: 'rgba(248,250,252,0.2)' }}>{m.tradition}</span>
                  </div>
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Light Therapy" icon={Sun} color="#FCD34D" open={openSections.light} onToggle={() => toggleSection('light')} badge={activeLight ? activeLight.label : null}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {LIGHT_MODES.map(l => (
                <button key={l.id} onClick={() => toggleLight(l)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: activeLight?.id === l.id ? `${l.colors[0]}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeLight?.id === l.id ? `${l.colors[1]}35` : 'rgba(255,255,255,0.04)'}` }}
                  data-testid={`mixer-light-${l.id}`}>
                  <div className="flex gap-0.5 flex-shrink-0">{l.colors.slice(0, 3).map((c, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />)}</div>
                  <span className="text-[11px]" style={{ color: activeLight?.id === l.id ? l.colors[1] : 'rgba(248,250,252,0.55)' }}>{l.label}</span>
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Haptic Vibration" icon={Vibrate} color="#FB923C" open={openSections.haptic} onToggle={() => toggleSection('haptic')} badge={vibeOn ? `${hapticIntensity}%` : null}>
            <div className="space-y-2.5">
              <button onClick={toggleVibe} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] w-full"
                style={{ background: vibeOn ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${vibeOn ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.04)'}` }}
                data-testid="mixer-vibe-toggle">
                <Vibrate size={16} style={{ color: vibeOn ? '#FB923C' : 'rgba(248,250,252,0.4)' }} />
                <div className="text-left">
                  <span className="text-xs block" style={{ color: vibeOn ? '#FB923C' : 'rgba(248,250,252,0.6)' }}>{vibeOn ? 'Vibrating — Tap to Stop' : 'Enable Haptic Pulse'}</span>
                  <span className="text-[9px] block" style={{ color: 'rgba(248,250,252,0.3)' }}>{firstActiveFreq ? `Synced to ${firstActiveFreq.label}` : 'Pulses at a calm rhythm'}</span>
                </div>
              </button>
              {vibeOn && (
                <div className="flex items-center gap-3 px-2">
                  <span className="text-[10px] w-14" style={{ color: 'rgba(251,146,60,0.6)' }}>Intensity</span>
                  <input type="range" min={10} max={100} value={hapticIntensity} onChange={e => setHapticIntensity(Number(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #FB923C ${hapticIntensity}%, rgba(255,255,255,0.06) ${hapticIntensity}%)`, accentColor: '#FB923C' }}
                    data-testid="haptic-intensity" />
                  <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: 'rgba(251,146,60,0.5)' }}>{hapticIntensity}%</span>
                </div>
              )}
            </div>
          </AccordionSection>

          <AccordionSection title="Tempo & Beat" icon={Radio} color="#EC4899" open={openSections.tempo} onToggle={() => toggleSection('tempo')} badge={bpm > 0 ? `${bpm} BPM` : null}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tabular-nums w-16" style={{ color: bpm > 0 ? '#EC4899' : 'rgba(248,250,252,0.35)' }}>{bpm > 0 ? `${bpm} BPM` : 'Off'}</span>
                <input type="range" min="0" max="200" step="1" value={bpm} onChange={e => setBpm(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer" style={{ background: `linear-gradient(to right, #EC4899 ${bpm / 2}%, rgba(255,255,255,0.06) ${bpm / 2}%)`, accentColor: '#EC4899' }}
                  data-testid="tempo-slider-page" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={tapTempo} className="text-xs px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#EC4899' }} data-testid="tap-tempo-page">Tap Tempo</button>
                {bpm > 0 && (
                  <>
                    <button onClick={stopTempo} className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} data-testid="tempo-stop-page">Stop</button>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full transition-all" style={{ background: beatPulse ? '#EC4899' : 'rgba(236,72,153,0.15)', boxShadow: beatPulse ? '0 0 12px rgba(236,72,153,0.5)' : 'none', transform: beatPulse ? 'scale(1.4)' : 'scale(1)' }} />
                      <span className="text-[10px]" style={{ color: 'rgba(236,72,153,0.5)' }}>Breathing</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TEMPO_PRESETS.map(p => (
                  <button key={p.id} onClick={() => setTempoFromPreset(p)} className="text-[10px] px-2.5 py-1.5 rounded-xl transition-all hover:scale-[1.03]"
                    style={{ background: activePreset?.id === p.id ? `${p.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activePreset?.id === p.id ? `${p.color}35` : 'rgba(255,255,255,0.04)'}`, color: activePreset?.id === p.id ? p.color : 'rgba(248,250,252,0.5)' }}
                    data-testid={`tempo-preset-page-${p.id}`}>{p.label}</button>
                ))}
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
}

function AccordionSection({ title, icon: Icon, color, open, onToggle, badge, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(248,250,252,0.015)', border: `1px solid ${badge ? `${color}18` : 'rgba(248,250,252,0.03)'}` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
        data-testid={`accordion-${title.toLowerCase().replace(/[^a-z]/g, '-')}`}>
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: badge ? color : 'rgba(248,250,252,0.4)' }} />
          <span className="text-[11px] uppercase tracking-[0.12em] font-semibold" style={{ color: badge ? color : 'rgba(248,250,252,0.45)' }}>{title}</span>
          {badge && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>{badge}</span>}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LightOverlay({ mode }) {
  const [colorIdx, setColorIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setColorIdx(i => (i + 1) % mode.colors.length), mode.speed);
    return () => clearInterval(iv);
  }, [mode]);
  const cur = mode.colors[colorIdx];
  const next = mode.colors[(colorIdx + 1) % mode.colors.length];
  const prev = mode.colors[(colorIdx - 1 + mode.colors.length) % mode.colors.length];
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${cur}55 0%, ${next}30 40%, transparent 75%)`,
        transition: `background ${mode.speed / 1000}s ease-in-out`,
      }} />
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, ${prev}20 0%, transparent 40%, ${cur}25 70%, ${next}15 100%)`,
        transition: `background ${mode.speed / 1200}s ease-in-out`,
      }} />
    </div>
  );
}
