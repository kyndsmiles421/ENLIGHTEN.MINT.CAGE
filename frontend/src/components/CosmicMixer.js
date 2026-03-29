import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, X, Volume2, VolumeX, Waves, Sun, BookOpen, Vibrate, Play, Pause, Square, Loader2 } from 'lucide-react';
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
    const sg = ctx.createGain(); sg.gain.value = 0.08;
    src.connect(hp); hp.connect(lp); lp.connect(sg); sg.connect(g); src.start();
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
    const sg = ctx.createGain(); sg.gain.value = 0.1;
    src.connect(lp); lp.connect(sg); sg.connect(g); lfo.start(); src.start();
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
    const sg = ctx.createGain(); sg.gain.value = 0.06;
    src.connect(bp); bp.connect(sg); sg.connect(g); lfo.start(); src.start();
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
    const sg = ctx.createGain(); sg.gain.value = 0.05;
    src.connect(bp); bp.connect(sg); sg.connect(g); lfo.start(); src.start();
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
  { id: 'om', label: 'Om', text: 'Om', tradition: 'Universal', color: '#C084FC' },
  { id: 'om-mani', label: 'Om Mani Padme Hum', text: 'Om Mani Padme Hum', tradition: 'Tibetan Buddhist', color: '#2DD4BF' },
  { id: 'om-namah', label: 'Om Namah Shivaya', text: 'Om Namah Shivaya', tradition: 'Hindu', color: '#8B5CF6' },
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

export default function CosmicMixer() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [masterVol, setMasterVol] = useState(60);
  const [muted, setMuted] = useState(false);

  // Active layers
  const [activeFreq, setActiveFreq] = useState(null);
  const [activeSound, setActiveSound] = useState(null);
  const [activeMantra, setActiveMantra] = useState(null);
  const [activeLight, setActiveLight] = useState(null);
  const [vibeOn, setVibeOn] = useState(false);

  // Audio refs
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const freqNodesRef = useRef([]);
  const soundNodesRef = useRef([]);
  const mantraIntervalRef = useRef(null);
  const mantraAudioRef = useRef(null);
  const vibeIntervalRef = useRef(null);
  const lightIdxRef = useRef(0);
  const [mantraLoading, setMantraLoading] = useState(false);

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

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
  }, [masterVol, muted]);

  // Stop helpers
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
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq.hz;
    const g = ctx.createGain(); g.gain.value = 0.12;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lg = ctx.createGain(); lg.gain.value = 0.04;
    lfo.connect(lg); lg.connect(g.gain);
    o.connect(g); g.connect(masterGainRef.current);
    o.start(); lfo.start();
    freqNodesRef.current = [o, lfo];
    setActiveFreq(freq);
  }, [activeFreq, getCtx]);

  // ─── Sound Layer ───
  const toggleSound = useCallback(async (sound) => {
    stopNodes(soundNodesRef);
    if (activeSound?.id === sound.id) { setActiveSound(null); return; }
    const ctx = await getCtx();
    const nodes = sound.gen(ctx, masterGainRef.current);
    soundNodesRef.current = nodes;
    setActiveSound(sound);
  }, [activeSound, getCtx]);

  // ─── Mantra Layer (OpenAI TTS — natural human voice) ───
  const toggleMantra = useCallback(async (mantra) => {
    if (mantraIntervalRef.current) { clearInterval(mantraIntervalRef.current); mantraIntervalRef.current = null; }
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (activeMantra?.id === mantra.id) { setActiveMantra(null); return; }
    setActiveMantra(mantra);
    setMantraLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mixer' });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.volume = 0.7;
      mantraAudioRef.current = audio;
      const playLoop = () => {
        if (!mantraAudioRef.current) return;
        const a = mantraAudioRef.current.cloneNode();
        a.volume = 0.7;
        mantraAudioRef.current = a;
        a.onended = () => {};
        a.play().catch(() => {});
      };
      audio.onended = () => {};
      audio.play().catch(() => {});
      mantraIntervalRef.current = setInterval(playLoop, 10000);
      setMantraLoading(false);
    } catch {
      setMantraLoading(false);
      setActiveMantra(null);
    }
  }, [activeMantra]);

  // ─── Vibration Layer ───
  const toggleVibe = useCallback(() => {
    if (vibeOn) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      vibeIntervalRef.current = null;
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

  // Update vibe pattern when frequency changes
  useEffect(() => {
    if (vibeOn && activeFreq) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      const pattern = Math.max(50, Math.round(1000 / activeFreq.hz * 10));
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
    }
  }, [activeFreq, vibeOn]);

  // ─── Light Layer ───
  const toggleLight = useCallback((mode) => {
    if (activeLight?.id === mode.id) { setActiveLight(null); return; }
    setActiveLight(mode);
    lightIdxRef.current = 0;
  }, [activeLight]);

  // ─── Stop All ───
  const stopAll = useCallback(() => {
    stopNodes(freqNodesRef);
    stopNodes(soundNodesRef);
    if (mantraIntervalRef.current) clearInterval(mantraIntervalRef.current);
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
    try { navigator.vibrate(0); } catch {}
    setActiveFreq(null); setActiveSound(null); setActiveMantra(null);
    setActiveLight(null); setVibeOn(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { stopAll(); if (ctxRef.current) ctxRef.current.close(); }, [stopAll]);

  const hasActive = activeFreq || activeSound || activeMantra || activeLight || vibeOn;
  const activeCount = [activeFreq, activeSound, activeMantra, activeLight, vibeOn].filter(Boolean).length;

  if (!user) return null;

  return (
    <>
      {/* Light Therapy Overlay */}
      <AnimatePresence>
        {activeLight && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-30"
            data-testid="light-overlay">
            <LightOverlay mode={activeLight} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mixer Button */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: hasActive ? 'rgba(192,132,252,0.2)' : 'rgba(22,24,38,0.9)',
            border: `1px solid ${hasActive ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)'}`,
            backdropFilter: 'blur(16px)',
            boxShadow: hasActive ? '0 0 20px rgba(192,132,252,0.15)' : '0 4px 20px rgba(0,0,0,0.3)',
          }}
          data-testid="mixer-toggle">
          <Waves size={18} style={{ color: hasActive ? '#C084FC' : 'var(--text-muted)' }} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
              style={{ background: '#C084FC', color: '#fff' }}>{activeCount}</span>
          )}
        </motion.button>
      )}

      {/* Mixer Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{
              background: 'var(--bg-secondary, rgba(13,14,26,0.98))',
              border: '1px solid rgba(192,132,252,0.08)',
              borderBottom: 'none',
              backdropFilter: 'blur(32px)',
              maxHeight: expanded ? '85vh' : '320px',
              overflowY: 'auto',
            }}
            data-testid="cosmic-mixer-panel">

            {/* Handle bar */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
              style={{ background: 'inherit', borderBottom: '1px solid rgba(192,132,252,0.05)' }}>
              <div className="flex items-center gap-2">
                <Waves size={14} style={{ color: '#C084FC' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cosmic Mixer</span>
                {activeCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC' }}>
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasActive && (
                  <button onClick={stopAll} className="p-1.5 rounded-lg" style={{ color: '#EF4444' }} data-testid="mixer-stop-all">
                    <Square size={12} />
                  </button>
                )}
                <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} data-testid="mixer-close">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-4">
              {/* Master Volume */}
              <div className="flex items-center gap-3">
                <button onClick={() => setMuted(m => !m)} className="p-1" data-testid="mixer-mute">
                  {muted ? <VolumeX size={14} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={14} style={{ color: '#C084FC' }} />}
                </button>
                <input type="range" min={0} max={100} value={muted ? 0 : masterVol}
                  onChange={e => { setMasterVol(parseInt(e.target.value)); setMuted(false); }}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #C084FC ${masterVol}%, rgba(255,255,255,0.06) ${masterVol}%)` }}
                  data-testid="mixer-volume" />
                <span className="text-[9px] w-7 text-right" style={{ color: 'var(--text-muted)' }}>{masterVol}%</span>
              </div>

              {/* Frequency Layer */}
              <LayerSection title="Frequency" icon={Waves} active={activeFreq} color="#C084FC">
                <div className="flex flex-wrap gap-1.5">
                  {FREQUENCIES.map(f => (
                    <button key={f.hz} onClick={() => toggleFreq(f)}
                      className="text-[10px] px-2.5 py-1.5 rounded-full transition-all"
                      style={{
                        background: activeFreq?.hz === f.hz ? `${f.color}20` : 'rgba(255,255,255,0.03)',
                        color: activeFreq?.hz === f.hz ? f.color : 'var(--text-muted)',
                        border: `1px solid ${activeFreq?.hz === f.hz ? `${f.color}40` : 'rgba(255,255,255,0.05)'}`,
                      }}
                      data-testid={`mixer-freq-${f.hz}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </LayerSection>

              {/* Sound Layer */}
              <LayerSection title="Ambient Sound" icon={Volume2} active={activeSound} color="#3B82F6">
                <div className="flex flex-wrap gap-1.5">
                  {SOUNDS.map(s => (
                    <button key={s.id} onClick={() => toggleSound(s)}
                      className="text-[10px] px-2.5 py-1.5 rounded-full transition-all"
                      style={{
                        background: activeSound?.id === s.id ? `${s.color}20` : 'rgba(255,255,255,0.03)',
                        color: activeSound?.id === s.id ? s.color : 'var(--text-muted)',
                        border: `1px solid ${activeSound?.id === s.id ? `${s.color}40` : 'rgba(255,255,255,0.05)'}`,
                      }}
                      data-testid={`mixer-sound-${s.id}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </LayerSection>

              {/* Mantra Layer */}
              <LayerSection title="Mantra" icon={BookOpen} active={activeMantra} color="#2DD4BF">
                <div className="flex flex-wrap gap-1.5">
                  {MANTRAS.map(m => (
                    <button key={m.id} onClick={() => toggleMantra(m)}
                      disabled={mantraLoading && activeMantra?.id !== m.id}
                      className="text-[10px] px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1"
                      style={{
                        background: activeMantra?.id === m.id ? `${m.color}20` : 'rgba(255,255,255,0.03)',
                        color: activeMantra?.id === m.id ? m.color : 'var(--text-muted)',
                        border: `1px solid ${activeMantra?.id === m.id ? `${m.color}40` : 'rgba(255,255,255,0.05)'}`,
                        opacity: mantraLoading && activeMantra?.id !== m.id ? 0.5 : 1,
                      }}
                      data-testid={`mixer-mantra-${m.id}`}>
                      {mantraLoading && activeMantra?.id === m.id && <Loader2 size={8} className="animate-spin" />}
                      {m.label}
                    </button>
                  ))}
                </div>
                {activeMantra && <p className="text-[9px] mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{activeMantra.tradition} tradition</p>}
              </LayerSection>

              {/* Light Therapy Layer */}
              <LayerSection title="Light Therapy" icon={Sun} active={activeLight} color="#FCD34D">
                <div className="flex flex-wrap gap-1.5">
                  {LIGHT_MODES.map(l => (
                    <button key={l.id} onClick={() => toggleLight(l)}
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
              </LayerSection>

              {/* Vibration Layer */}
              <LayerSection title="Vibration" icon={Vibrate} active={vibeOn} color="#FB923C">
                <button onClick={toggleVibe}
                  className="text-[10px] px-3 py-2 rounded-full transition-all flex items-center gap-2"
                  style={{
                    background: vibeOn ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.03)',
                    color: vibeOn ? '#FB923C' : 'var(--text-muted)',
                    border: `1px solid ${vibeOn ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                  data-testid="mixer-vibe-toggle">
                  <Vibrate size={12} />
                  {vibeOn ? 'Vibrating — Tap to Stop' : 'Enable Haptic Pulse'}
                </button>
                <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {activeFreq ? `Synced to ${activeFreq.label}` : 'Pulses at a calm rhythm'}
                </p>
              </LayerSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Layer Section Component ─── */
function LayerSection({ title, icon: Icon, active, color, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} style={{ color: active ? color : 'var(--text-muted)' }} />
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: active ? color : 'var(--text-muted)' }}>
          {title}
        </span>
        {active && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />}
      </div>
      {children}
    </div>
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
      {/* Primary radial glow — strong center */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${currentColor}55 0%, ${nextColor}30 40%, transparent 75%)`,
        transition: `background ${mode.speed / 1000}s ease-in-out`,
      }} />
      {/* Secondary ambient wash — fills edges */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, ${prevColor}20 0%, transparent 40%, ${currentColor}25 70%, ${nextColor}15 100%)`,
        transition: `background ${mode.speed / 1200}s ease-in-out`,
      }} />
      {/* Soft breathing pulse */}
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
