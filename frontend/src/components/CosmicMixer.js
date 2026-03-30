import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  ChevronUp, ChevronDown, X, Volume2, VolumeX, Waves, Sun, BookOpen,
  Vibrate, Play, Pause, Square, Loader2, Music, Film, Sliders, Maximize2, Minimize2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Layer Definitions ─── */
const FREQUENCIES = [
  { hz: 174, label: '174 Hz', desc: 'Foundation & Pain Relief', color: '#78716C' },
  { hz: 396, label: '396 Hz', desc: 'Liberation from Fear', color: '#EF4444' },
  { hz: 417, label: '417 Hz', desc: 'Undoing & Change', color: '#FB923C' },
  { hz: 528, label: '528 Hz', desc: 'Love & Transformation', color: '#22C55E' },
  { hz: 639, label: '639 Hz', desc: 'Connection & Harmony', color: '#3B82F6' },
  { hz: 741, label: '741 Hz', desc: 'Intuition & Expression', color: '#8B5CF6' },
  { hz: 852, label: '852 Hz', desc: 'Spiritual Awakening', color: '#C084FC' },
  { hz: 963, label: '963 Hz', desc: 'Divine Connection', color: '#E879F9' },
  { hz: 7.83, label: '7.83 Hz', desc: 'Schumann Resonance', color: '#2DD4BF' },
];

const SOUNDS = [
  { id: 'rain', label: 'Rain', color: '#3B82F6', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    src.connect(hp); hp.connect(lp); lp.connect(g); src.start();
    return [src];
  }},
  { id: 'ocean', label: 'Ocean', color: '#06B6D4', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lg = ctx.createGain(); lg.gain.value = 150;
    lfo.connect(lg); lg.connect(lp.frequency);
    src.connect(lp); lp.connect(g); lfo.start(); src.start();
    return [src, lfo];
  }},
  { id: 'wind', label: 'Wind', color: '#A78BFA', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lg = ctx.createGain(); lg.gain.value = 400;
    lfo.connect(lg); lg.connect(bp.frequency);
    src.connect(bp); bp.connect(g); lfo.start(); src.start();
    return [src, lfo];
  }},
  { id: 'fire', label: 'Fire', color: '#F59E0B', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 1.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 3;
    const lg = ctx.createGain(); lg.gain.value = 200;
    lfo.connect(lg); lg.connect(bp.frequency);
    src.connect(bp); bp.connect(g); lfo.start(); src.start();
    return [src, lfo];
  }},
  { id: 'singing-bowl', label: 'Singing Bowl', color: '#FCD34D', gen: (ctx, g) => {
    const nodes = [];
    const play = () => {
      [293.66, 440, 587.33].forEach(f => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const eg = ctx.createGain(); eg.gain.setValueAtTime(0.06, ctx.currentTime);
        eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
        o.connect(eg); eg.connect(g); o.start(); o.stop(ctx.currentTime + 6);
      });
    };
    play();
    const iv = setInterval(play, 5500);
    nodes._interval = iv;
    return nodes;
  }},
];

const MANTRAS = [
  { id: 'om', label: 'Om', text: 'Ommmmm. Ommmmm. Ommmmm.', tradition: 'Universal', color: '#C084FC' },
  { id: 'om-mani', label: 'Om Mani Padme Hum', text: 'Om Mani Padme Hum. Om Mani Padme Hum.', tradition: 'Tibetan Buddhist', color: '#2DD4BF' },
  { id: 'om-namah', label: 'Om Namah Shivaya', text: 'Om Namah Shivaya. Om Namah Shivaya.', tradition: 'Hindu', color: '#8B5CF6' },
  { id: 'so-hum', label: 'So Hum', text: 'So Hum... I am that I am', tradition: 'Vedic', color: '#3B82F6' },
  { id: 'ra-ma', label: 'Ra Ma Da Sa', text: 'Ra Ma Da Sa, Sa Say So Hung', tradition: 'Kundalini', color: '#FCD34D' },
  { id: 'peace', label: 'I Am Peace', text: 'I am peace. I am light. I am love.', tradition: 'Modern', color: '#22C55E' },
];

const LIGHT_MODES = [
  { id: 'sunrise', label: 'Sunrise Glow', colors: ['#FCD34D', '#FB923C', '#EF4444'], speed: 4000 },
  { id: 'aurora', label: 'Aurora', colors: ['#22C55E', '#2DD4BF', '#3B82F6', '#8B5CF6'], speed: 3000 },
  { id: 'calm-blue', label: 'Calm Blue', colors: ['#1E3A5F', '#3B82F6', '#06B6D4'], speed: 5000 },
  { id: 'healing-green', label: 'Healing Green', colors: ['#064E3B', '#22C55E', '#2DD4BF'], speed: 4500 },
  { id: 'violet-flame', label: 'Violet Flame', colors: ['#4C1D95', '#8B5CF6', '#C084FC', '#E879F9'], speed: 3500 },
  { id: 'golden', label: 'Golden Light', colors: ['#78350F', '#F59E0B', '#FCD34D'], speed: 5000 },
];

// World instrument drones for the mixer
const INSTRUMENT_DRONES = [
  { id: 'sitar-drone', label: 'Sitar', color: '#F59E0B', wave: 'sawtooth', freq: 146.83, filterFreq: 1200, filterQ: 8, vibratoRate: 5, vibratoDepth: 8 },
  { id: 'tanpura-drone', label: 'Tanpura', color: '#EA580C', wave: 'sawtooth', freq: 130.81, filterFreq: 600, filterQ: 3, vibratoRate: 2, vibratoDepth: 3 },
  { id: 'didgeridoo-drone', label: 'Didgeridoo', color: '#78350F', wave: 'sawtooth', freq: 65.41, filterFreq: 300, filterQ: 6, vibratoRate: 2, vibratoDepth: 5 },
  { id: 'bowl-drone', label: 'Singing Bowl', color: '#7C3AED', wave: 'sine', freq: 261.63, filterFreq: 800, filterQ: 12, vibratoRate: 1.5, vibratoDepth: 2 },
  { id: 'flute-drone', label: 'Cedar Flute', color: '#059669', wave: 'sine', freq: 329.63, filterFreq: 2000, filterQ: 1, vibratoRate: 4.5, vibratoDepth: 12 },
  { id: 'erhu-drone', label: 'Erhu', color: '#E11D48', wave: 'sawtooth', freq: 293.66, filterFreq: 2500, filterQ: 4, vibratoRate: 5.5, vibratoDepth: 15 },
];

const VIDEO_OVERLAYS = [
  { id: 'none', label: 'None' },
  { id: 'stars', label: 'Starfield', url: 'https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_25fps.mp4', color: '#818CF8' },
  { id: 'northern-lights', label: 'Northern Lights', url: 'https://videos.pexels.com/video-files/3214448/3214448-uhd_2560_1440_25fps.mp4', color: '#2DD4BF' },
  { id: 'ocean-waves', label: 'Ocean', url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4', color: '#3B82F6' },
  { id: 'forest', label: 'Forest', url: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4', color: '#22C55E' },
  { id: 'fire', label: 'Campfire', url: 'https://videos.pexels.com/video-files/855535/855535-hd_1920_1080_30fps.mp4', color: '#F59E0B' },
];

export default function CosmicMixer() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => { if (!fullScreen) setOpen(false); }, [location.pathname, fullScreen]);

  // Master
  const [masterVol, setMasterVol] = useState(60);
  const [muted, setMuted] = useState(false);

  // Active layers
  const [activeFreq, setActiveFreq] = useState(null);
  const [activeSound, setActiveSound] = useState(null);
  const [activeMantra, setActiveMantra] = useState(null);
  const [activeLight, setActiveLight] = useState(null);
  const [activeDrone, setActiveDrone] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [vibeOn, setVibeOn] = useState(false);

  // Per-channel volumes (0-100)
  const [freqVol, setFreqVol] = useState(50);
  const [soundVol, setSoundVol] = useState(50);
  const [mantraVol, setMantraVol] = useState(70);
  const [droneVol, setDroneVol] = useState(40);
  const [lightOpacity, setLightOpacity] = useState(60);
  const [videoOpacity, setVideoOpacity] = useState(40);

  // Audio refs
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const freqGainRef = useRef(null);
  const soundGainRef = useRef(null);
  const droneGainRef = useRef(null);
  const freqNodesRef = useRef([]);
  const soundNodesRef = useRef([]);
  const droneNodesRef = useRef([]);
  const mantraAudioRef = useRef(null);
  const vibeIntervalRef = useRef(null);
  const [mantraLoading, setMantraLoading] = useState(false);

  const getCtx = useCallback(async () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.connect(ctxRef.current.destination);
      // Per-channel gain nodes
      freqGainRef.current = ctxRef.current.createGain();
      freqGainRef.current.connect(masterGainRef.current);
      soundGainRef.current = ctxRef.current.createGain();
      soundGainRef.current.connect(masterGainRef.current);
      droneGainRef.current = ctxRef.current.createGain();
      droneGainRef.current.connect(masterGainRef.current);
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
    return ctxRef.current;
  }, [masterVol, muted]);

  // Update gains in real time
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
  }, [masterVol, muted]);
  useEffect(() => { if (freqGainRef.current) freqGainRef.current.gain.value = freqVol / 100; }, [freqVol]);
  useEffect(() => { if (soundGainRef.current) soundGainRef.current.gain.value = soundVol / 100; }, [soundVol]);
  useEffect(() => { if (droneGainRef.current) droneGainRef.current.gain.value = droneVol / 100; }, [droneVol]);
  useEffect(() => { if (mantraAudioRef.current) mantraAudioRef.current.volume = mantraVol / 100; }, [mantraVol]);

  const stopNodes = (nodesRef) => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    if (nodesRef.current._interval) clearInterval(nodesRef.current._interval);
    nodesRef.current = [];
  };

  // ─── Frequency Layer ───
  const toggleFreq = useCallback(async (freq) => {
    stopNodes(freqNodesRef);
    if (activeFreq?.hz === freq.hz) { setActiveFreq(null); return; }
    const ctx = await getCtx();
    const channelGain = freqGainRef.current;

    if (freq.hz < 20) {
      const carrier = 200;
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = carrier;
      const gL = ctx.createGain(); gL.gain.value = 1;
      oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = carrier + freq.hz;
      const gR = ctx.createGain(); gR.gain.value = 1;
      oscR.connect(gR); gR.connect(merger, 0, 1);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq.hz * 16;
      const subG = ctx.createGain(); subG.gain.value = 0.06;
      sub.connect(subG); subG.connect(channelGain);
      merger.connect(channelGain);
      oscL.start(); oscR.start(); sub.start();
      freqNodesRef.current = [oscL, oscR, sub, merger];
    } else {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq.hz;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(channelGain);
      o.start(); lfo.start();
      freqNodesRef.current = [o, lfo];
    }
    setActiveFreq(freq);
  }, [activeFreq, getCtx]);

  // ─── Sound Layer ───
  const toggleSound = useCallback(async (sound) => {
    stopNodes(soundNodesRef);
    if (activeSound?.id === sound.id) { setActiveSound(null); return; }
    const ctx = await getCtx();
    const nodes = sound.gen(ctx, soundGainRef.current);
    soundNodesRef.current = nodes;
    setActiveSound(sound);
  }, [activeSound, getCtx]);

  // ─── Instrument Drone Layer ───
  const toggleDrone = useCallback(async (drone) => {
    stopNodes(droneNodesRef);
    if (activeDrone?.id === drone.id) { setActiveDrone(null); return; }
    const ctx = await getCtx();
    const channelGain = droneGainRef.current;

    const osc = ctx.createOscillator();
    osc.type = drone.wave;
    osc.frequency.value = drone.freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = drone.filterFreq;
    filter.Q.value = drone.filterQ;
    // Vibrato
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = drone.vibratoRate;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = drone.vibratoDepth;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    // Sub harmonic
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = drone.freq / 2;
    const subGain = ctx.createGain(); subGain.gain.value = 0.3;
    sub.connect(subGain); subGain.connect(filter);

    osc.connect(filter);
    filter.connect(channelGain);
    osc.start(); lfo.start(); sub.start();
    droneNodesRef.current = [osc, lfo, sub];
    setActiveDrone(drone);
  }, [activeDrone, getCtx]);

  // ─── Mantra Layer ───
  const toggleMantra = useCallback(async (mantra) => {
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (activeMantra?.id === mantra.id) { setActiveMantra(null); return; }
    setActiveMantra(mantra);
    setMantraLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mixer' });
      if (!res.data.audio) { setMantraLoading(false); setActiveMantra(null); return; }
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.volume = mantraVol / 100;
      audio.loop = true;
      mantraAudioRef.current = audio;
      audio.play().catch(() => {});
      setMantraLoading(false);
    } catch {
      setMantraLoading(false);
      setActiveMantra(null);
    }
  }, [activeMantra, mantraVol]);

  // ─── Video Overlay Layer ───
  const toggleVideo = useCallback((video) => {
    if (video.id === 'none' || activeVideo?.id === video.id) { setActiveVideo(null); return; }
    setActiveVideo(video);
  }, [activeVideo]);

  // ─── Vibration ───
  const toggleVibe = useCallback(() => {
    if (vibeOn) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      try { navigator.vibrate(0); } catch {}
      setVibeOn(false);
    } else {
      const pattern = activeFreq ? Math.max(50, Math.round(1000 / activeFreq.hz * 10)) : 200;
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      pulse();
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
      setVibeOn(true);
    }
  }, [vibeOn, activeFreq]);

  useEffect(() => {
    if (vibeOn && activeFreq) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      const pattern = Math.max(50, Math.round(1000 / activeFreq.hz * 10));
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
    }
  }, [activeFreq, vibeOn]);

  // ─── Stop All ───
  const stopAll = useCallback(() => {
    stopNodes(freqNodesRef);
    stopNodes(soundNodesRef);
    stopNodes(droneNodesRef);
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
    try { navigator.vibrate(0); } catch {}
    setActiveFreq(null); setActiveSound(null); setActiveMantra(null);
    setActiveLight(null); setActiveDrone(null); setActiveVideo(null); setVibeOn(false);
  }, []);

  useEffect(() => () => { stopAll(); if (ctxRef.current) try { ctxRef.current.close(); } catch {} }, [stopAll]);

  const hasActive = activeFreq || activeSound || activeMantra || activeLight || activeDrone || activeVideo || vibeOn;
  const activeCount = [activeFreq, activeSound, activeMantra, activeLight, activeDrone, activeVideo, vibeOn].filter(Boolean).length;

  if (!user) return null;

  const panelMaxH = fullScreen ? '85vh' : expanded ? '70vh' : '380px';

  return (
    <>
      {/* Visual Overlays — rendered behind everything but above the page */}
      <AnimatePresence>
        {activeLight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: lightOpacity / 100 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-30" data-testid="light-overlay"
            style={{ opacity: lightOpacity / 100 }}>
            <LightOverlay mode={activeLight} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: videoOpacity / 100 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-30 overflow-hidden" data-testid="video-overlay"
            style={{ opacity: videoOpacity / 100 }}>
            <video
              src={activeVideo.url}
              autoPlay loop muted playsInline
              className="w-full h-full object-cover"
              style={{ mixBlendMode: 'screen' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mixer Button */}
      {!open && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: hasActive ? 'rgba(192,132,252,0.2)' : 'rgba(22,24,38,0.9)',
            border: `1px solid ${hasActive ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)'}`,
            backdropFilter: 'blur(16px)',
            boxShadow: hasActive ? '0 0 20px rgba(192,132,252,0.15)' : '0 4px 20px rgba(0,0,0,0.3)',
          }}
          data-testid="mixer-toggle">
          <Sliders size={18} style={{ color: hasActive ? '#C084FC' : 'var(--text-muted)' }} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
              style={{ background: '#C084FC', color: '#fff' }}>{activeCount}</span>
          )}
        </motion.button>
      )}

      {/* Mixer Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => { if (!fullScreen) setOpen(false); }}
              data-testid="mixer-backdrop" />
            <motion.div
              initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-50 rounded-t-2xl ${fullScreen ? 'inset-x-0 bottom-0' : 'bottom-0 left-0 right-0'}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(8,8,18,0.98)',
                border: '1px solid rgba(192,132,252,0.1)',
                borderBottom: 'none',
                backdropFilter: 'blur(32px)',
                maxHeight: panelMaxH,
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
              data-testid="cosmic-mixer-panel">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 sticky top-0 z-10"
                style={{ background: 'rgba(8,8,18,0.98)', borderBottom: '1px solid rgba(192,132,252,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Sliders size={14} style={{ color: '#C084FC' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C084FC' }}>
                    Production Console
                  </span>
                  {activeCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC' }}>
                      {activeCount} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasActive && (
                    <button onClick={stopAll} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#EF4444' }} data-testid="mixer-stop-all" title="Stop All">
                      <Square size={12} />
                    </button>
                  )}
                  <button onClick={() => setFullScreen(!fullScreen)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }} title={fullScreen ? 'Minimize' : 'Maximize'}>
                    {fullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  </button>
                  <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  <button onClick={() => { setOpen(false); setFullScreen(false); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }} data-testid="mixer-close">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4">
                {/* Master Fader */}
                <div className="flex items-center gap-3 py-1">
                  <button onClick={() => setMuted(m => !m)} className="p-1" data-testid="mixer-mute">
                    {muted ? <VolumeX size={14} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={14} style={{ color: '#C084FC' }} />}
                  </button>
                  <span className="text-[9px] uppercase tracking-wider w-14 font-bold" style={{ color: 'var(--text-muted)' }}>Master</span>
                  <Fader value={muted ? 0 : masterVol} onChange={v => { setMasterVol(v); setMuted(false); }} color="#C084FC" testId="mixer-volume" />
                  <span className="text-[9px] w-7 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>{masterVol}%</span>
                </div>

                {/* ── Channel Strips ── */}

                {/* Frequency */}
                <ChannelStrip title="Frequency" icon={Waves} active={activeFreq} color="#C084FC"
                  volume={freqVol} onVolumeChange={setFreqVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {FREQUENCIES.map(f => (
                      <ChipButton key={f.hz} active={activeFreq?.hz === f.hz} color={f.color}
                        onClick={() => toggleFreq(f)} testId={`mixer-freq-${f.hz}`}>{f.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Ambient Sound */}
                <ChannelStrip title="Ambient" icon={Volume2} active={activeSound} color="#3B82F6"
                  volume={soundVol} onVolumeChange={setSoundVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {SOUNDS.map(s => (
                      <ChipButton key={s.id} active={activeSound?.id === s.id} color={s.color}
                        onClick={() => toggleSound(s)} testId={`mixer-sound-${s.id}`}>{s.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Instrument Drones */}
                <ChannelStrip title="Instrument" icon={Music} active={activeDrone} color="#F59E0B"
                  volume={droneVol} onVolumeChange={setDroneVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {INSTRUMENT_DRONES.map(d => (
                      <ChipButton key={d.id} active={activeDrone?.id === d.id} color={d.color}
                        onClick={() => toggleDrone(d)} testId={`mixer-drone-${d.id}`}>{d.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Mantra */}
                <ChannelStrip title="Mantra" icon={BookOpen} active={activeMantra} color="#2DD4BF"
                  volume={mantraVol} onVolumeChange={setMantraVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {MANTRAS.map(m => (
                      <ChipButton key={m.id} active={activeMantra?.id === m.id} color={m.color}
                        onClick={() => toggleMantra(m)} testId={`mixer-mantra-${m.id}`}
                        disabled={mantraLoading && activeMantra?.id !== m.id}>
                        {mantraLoading && activeMantra?.id === m.id && <Loader2 size={8} className="animate-spin" />}
                        {m.label}
                      </ChipButton>
                    ))}
                  </div>
                  {activeMantra && <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{activeMantra.tradition} tradition</p>}
                </ChannelStrip>

                {/* Light Therapy — uses opacity fader */}
                <ChannelStrip title="Light" icon={Sun} active={activeLight} color="#FCD34D"
                  volume={lightOpacity} onVolumeChange={setLightOpacity} faderLabel="Opacity">
                  <div className="flex flex-wrap gap-1.5">
                    {LIGHT_MODES.map(l => (
                      <button key={l.id} onClick={() => { if (activeLight?.id === l.id) setActiveLight(null); else setActiveLight(l); }}
                        className="text-[10px] px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                        style={{
                          background: activeLight?.id === l.id ? `${l.colors[0]}20` : 'rgba(255,255,255,0.03)',
                          color: activeLight?.id === l.id ? l.colors[1] : 'var(--text-muted)',
                          border: `1px solid ${activeLight?.id === l.id ? `${l.colors[1]}40` : 'rgba(255,255,255,0.05)'}`,
                        }}
                        data-testid={`mixer-light-${l.id}`}>
                        <div className="flex gap-0.5">
                          {l.colors.slice(0, 3).map((c, i) => (
                            <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
                          ))}
                        </div>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Video Overlay — uses opacity fader */}
                <ChannelStrip title="Video" icon={Film} active={activeVideo} color="#818CF8"
                  volume={videoOpacity} onVolumeChange={setVideoOpacity} faderLabel="Opacity">
                  <div className="flex flex-wrap gap-1.5">
                    {VIDEO_OVERLAYS.map(v => (
                      <ChipButton key={v.id} active={activeVideo?.id === v.id} color={v.color || '#64748B'}
                        onClick={() => toggleVideo(v)} testId={`mixer-video-${v.id}`}>{v.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Vibration */}
                <ChannelStrip title="Haptic" icon={Vibrate} active={vibeOn} color="#FB923C" noFader>
                  <button onClick={toggleVibe}
                    className="text-[10px] px-3 py-2 rounded-full transition-all flex items-center gap-2"
                    style={{
                      background: vibeOn ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.03)',
                      color: vibeOn ? '#FB923C' : 'var(--text-muted)',
                      border: `1px solid ${vibeOn ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    data-testid="mixer-vibe-toggle">
                    <Vibrate size={12} />
                    {vibeOn ? 'Active' : 'Enable Pulse'}
                  </button>
                  <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {activeFreq ? `Synced to ${activeFreq.label}` : 'Pulses at a calm rhythm'}
                  </p>
                </ChannelStrip>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Channel Strip Component ─── */
function ChannelStrip({ title, icon: Icon, active, color, volume, onVolumeChange, faderLabel, noFader, children }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color: active ? color : 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: active ? color : 'var(--text-muted)' }}>
            {title}
          </span>
          {active && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />}
        </div>
        {!noFader && active && (
          <div className="flex items-center gap-2">
            <span className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{faderLabel || 'Vol'}</span>
            <Fader value={volume} onChange={onVolumeChange} color={color} size="sm" />
            <span className="text-[8px] w-6 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>{volume}%</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Fader / Slider ─── */
function Fader({ value, onChange, color, size, testId }) {
  const w = size === 'sm' ? 'w-20' : 'flex-1';
  return (
    <input type="range" min={0} max={100} value={value}
      onChange={e => onChange(parseInt(e.target.value))}
      className={`${w} h-1 rounded-full appearance-none cursor-pointer`}
      style={{ background: `linear-gradient(to right, ${color} ${value}%, rgba(255,255,255,0.06) ${value}%)`, accentColor: color }}
      data-testid={testId} />
  );
}

/* ─── Chip Button ─── */
function ChipButton({ active, color, onClick, testId, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="text-[10px] px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1"
      style={{
        background: active ? `${color}20` : 'rgba(255,255,255,0.03)',
        color: active ? color : 'var(--text-muted)',
        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.05)'}`,
        opacity: disabled ? 0.5 : 1,
      }}
      data-testid={testId}>
      {children}
    </button>
  );
}

/* ─── Light Therapy Overlay ─── */
function LightOverlay({ mode }) {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setColorIdx(i => (i + 1) % mode.colors.length);
    }, mode.speed);
    return () => clearInterval(iv);
  }, [mode]);

  const currentColor = mode.colors[colorIdx];
  const nextColor = mode.colors[(colorIdx + 1) % mode.colors.length];
  const prevColor = mode.colors[(colorIdx - 1 + mode.colors.length) % mode.colors.length];

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${currentColor}55 0%, ${nextColor}30 40%, transparent 75%)`,
        transition: `background ${mode.speed / 1000}s ease-in-out`,
      }} />
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, ${prevColor}20 0%, transparent 40%, ${currentColor}25 70%, ${nextColor}15 100%)`,
        transition: `background ${mode.speed / 1200}s ease-in-out`,
      }} />
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at 50% 50%, ${currentColor}35 0%, transparent 60%)`,
        animation: `lightPulse ${mode.speed / 1000 * 1.5}s ease-in-out infinite alternate`,
      }} />
      <style>{`
        @keyframes lightPulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
