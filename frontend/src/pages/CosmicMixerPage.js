import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Volume2, VolumeX, Waves, Sun, BookOpen, Vibrate,
  Play, Pause, Square, Loader2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

export default function CosmicMixerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [masterVol, setMasterVol] = useState(60);
  const [muted, setMuted] = useState(false);

  const [activeFreq, setActiveFreq] = useState(null);
  const [activeSound, setActiveSound] = useState(null);
  const [activeMantra, setActiveMantra] = useState(null);
  const [activeLight, setActiveLight] = useState(null);
  const [vibeOn, setVibeOn] = useState(false);
  const [mantraLoading, setMantraLoading] = useState(false);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const freqNodesRef = useRef([]);
  const soundNodesRef = useRef([]);
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

  const stopNodes = (nodesRef) => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    if (nodesRef.current._interval) clearInterval(nodesRef.current._interval);
    nodesRef.current = [];
  };

  const toggleFreq = useCallback(async (freq) => {
    stopNodes(freqNodesRef);
    if (activeFreq?.hz === freq.hz) { setActiveFreq(null); return; }
    const ctx = await getCtx();

    if (freq.hz < 20) {
      // Sub-audible: use binaural beats (stereo) with a 200 Hz carrier
      const carrier = 200;
      const merger = ctx.createChannelMerger(2);
      const g = ctx.createGain(); g.gain.value = 0.15;
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = carrier;
      const gL = ctx.createGain(); gL.gain.value = 1;
      oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = carrier + freq.hz;
      const gR = ctx.createGain(); gR.gain.value = 1;
      oscR.connect(gR); gR.connect(merger, 0, 1);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq.hz * 16;
      const subG = ctx.createGain(); subG.gain.value = 0.06;
      sub.connect(subG); subG.connect(g);
      merger.connect(g); g.connect(masterGainRef.current);
      oscL.start(); oscR.start(); sub.start();
      freqNodesRef.current = [oscL, oscR, sub, merger];
    } else {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq.hz;
      const g = ctx.createGain(); g.gain.value = 0.12;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(masterGainRef.current);
      o.start(); lfo.start();
      freqNodesRef.current = [o, lfo];
    }
    setActiveFreq(freq);
  }, [activeFreq, getCtx]);

  const toggleSound = useCallback(async (sound) => {
    stopNodes(soundNodesRef);
    if (activeSound?.id === sound.id) { setActiveSound(null); return; }
    const ctx = await getCtx();
    const nodes = sound.gen(ctx, masterGainRef.current);
    soundNodesRef.current = nodes;
    setActiveSound(sound);
  }, [activeSound, getCtx]);

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

  const toggleLight = useCallback((mode) => {
    if (activeLight?.id === mode.id) { setActiveLight(null); return; }
    setActiveLight(mode);
  }, [activeLight]);

  const stopAll = useCallback(() => {
    stopNodes(freqNodesRef);
    stopNodes(soundNodesRef);
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
    try { navigator.vibrate(0); } catch {}
    setActiveFreq(null); setActiveSound(null); setActiveMantra(null);
    setActiveLight(null); setVibeOn(false);
  }, []);

  useEffect(() => () => { stopAll(); if (ctxRef.current) ctxRef.current.close(); }, [stopAll]);

  const hasActive = activeFreq || activeSound || activeMantra || activeLight || vibeOn;
  const activeCount = [activeFreq, activeSound, activeMantra, activeLight, vibeOn].filter(Boolean).length;

  return (
    <div className="min-h-screen relative" data-testid="cosmic-mixer-page">
      {/* Light therapy overlay */}
      {activeLight && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <LightOverlay mode={activeLight} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-28 relative z-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { stopAll(); navigate(-1); }}
            className="p-2 rounded-xl transition-all hover:scale-105"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
            data-testid="mixer-back">
            <ArrowLeft size={18} style={{ color: 'rgba(248,250,252,0.6)' }} />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Waves size={16} style={{ color: '#C084FC' }} />
              <h1 className="text-lg font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>Cosmic Mixer</h1>
            </div>
            {activeCount > 0 && (
              <p className="text-[10px] mt-0.5" style={{ color: '#C084FC' }}>{activeCount} layer{activeCount > 1 ? 's' : ''} active</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasActive && (
              <button onClick={stopAll} className="p-2 rounded-xl" style={{ color: '#EF4444' }} data-testid="mixer-stop-all">
                <Square size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-3 mb-6 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
          <button onClick={() => setMuted(m => !m)} className="p-1" data-testid="mixer-mute">
            {muted ? <VolumeX size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /> : <Volume2 size={16} style={{ color: '#C084FC' }} />}
          </button>
          <input type="range" min={0} max={100} value={muted ? 0 : masterVol}
            onChange={e => { setMasterVol(parseInt(e.target.value)); setMuted(false); }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #C084FC ${masterVol}%, rgba(255,255,255,0.06) ${masterVol}%)` }}
            data-testid="mixer-volume" />
          <span className="text-xs w-8 text-right tabular-nums" style={{ color: 'rgba(248,250,252,0.5)' }}>{masterVol}%</span>
        </div>

        {/* Layers */}
        <div className="space-y-5">
          {/* Frequency Layer */}
          <LayerSection title="Solfeggio Frequency" icon={Waves} active={activeFreq} color="#C084FC">
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map(f => (
                <button key={f.hz} onClick={() => toggleFreq(f)}
                  className="text-left px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: activeFreq?.hz === f.hz ? `${f.color}15` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeFreq?.hz === f.hz ? `${f.color}35` : 'rgba(255,255,255,0.04)'}`,
                  }}
                  data-testid={`mixer-freq-${f.hz}`}>
                  <span className="text-xs font-medium block" style={{ color: activeFreq?.hz === f.hz ? f.color : 'rgba(248,250,252,0.7)' }}>{f.label}</span>
                  <span className="text-[9px] block mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>{f.desc}</span>
                </button>
              ))}
            </div>
          </LayerSection>

          {/* Sound Layer */}
          <LayerSection title="Ambient Sound" icon={Volume2} active={activeSound} color="#3B82F6">
            <div className="grid grid-cols-3 gap-2">
              {SOUNDS.map(s => (
                <button key={s.id} onClick={() => toggleSound(s)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: activeSound?.id === s.id ? `${s.color}15` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeSound?.id === s.id ? `${s.color}35` : 'rgba(255,255,255,0.04)'}`,
                  }}
                  data-testid={`mixer-sound-${s.id}`}>
                  {activeSound?.id === s.id ? <Pause size={12} style={{ color: s.color }} /> : <Play size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />}
                  <span className="text-xs" style={{ color: activeSound?.id === s.id ? s.color : 'rgba(248,250,252,0.6)' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </LayerSection>

          {/* Mantra Layer */}
          <LayerSection title="Mantra" icon={BookOpen} active={activeMantra} color="#2DD4BF">
            <div className="grid grid-cols-2 gap-2">
              {MANTRAS.map(m => (
                <button key={m.id} onClick={() => toggleMantra(m)}
                  disabled={mantraLoading && activeMantra?.id !== m.id}
                  className="text-left px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2"
                  style={{
                    background: activeMantra?.id === m.id ? `${m.color}15` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeMantra?.id === m.id ? `${m.color}35` : 'rgba(255,255,255,0.04)'}`,
                    opacity: mantraLoading && activeMantra?.id !== m.id ? 0.5 : 1,
                  }}
                  data-testid={`mixer-mantra-${m.id}`}>
                  {mantraLoading && activeMantra?.id === m.id && <Loader2 size={10} className="animate-spin flex-shrink-0" style={{ color: m.color }} />}
                  <div>
                    <span className="text-xs font-medium block" style={{ color: activeMantra?.id === m.id ? m.color : 'rgba(248,250,252,0.7)' }}>{m.label}</span>
                    <span className="text-[9px] block" style={{ color: 'rgba(248,250,252,0.25)' }}>{m.tradition}</span>
                  </div>
                </button>
              ))}
            </div>
          </LayerSection>

          {/* Light Therapy Layer */}
          <LayerSection title="Light Therapy" icon={Sun} active={activeLight} color="#FCD34D">
            <div className="grid grid-cols-2 gap-2">
              {LIGHT_MODES.map(l => (
                <button key={l.id} onClick={() => toggleLight(l)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: activeLight?.id === l.id ? `${l.colors[0]}15` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeLight?.id === l.id ? `${l.colors[1]}35` : 'rgba(255,255,255,0.04)'}`,
                  }}
                  data-testid={`mixer-light-${l.id}`}>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {l.colors.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: activeLight?.id === l.id ? l.colors[1] : 'rgba(248,250,252,0.6)' }}>{l.label}</span>
                </button>
              ))}
            </div>
          </LayerSection>

          {/* Vibration Layer */}
          <LayerSection title="Haptic Vibration" icon={Vibrate} active={vibeOn} color="#FB923C">
            <button onClick={toggleVibe}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] w-full"
              style={{
                background: vibeOn ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${vibeOn ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.04)'}`,
              }}
              data-testid="mixer-vibe-toggle">
              <Vibrate size={16} style={{ color: vibeOn ? '#FB923C' : 'rgba(248,250,252,0.4)' }} />
              <div className="text-left">
                <span className="text-xs block" style={{ color: vibeOn ? '#FB923C' : 'rgba(248,250,252,0.6)' }}>
                  {vibeOn ? 'Vibrating — Tap to Stop' : 'Enable Haptic Pulse'}
                </span>
                <span className="text-[9px] block" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  {activeFreq ? `Synced to ${activeFreq.label}` : 'Pulses at a calm rhythm'}
                </span>
              </div>
            </button>
          </LayerSection>
        </div>
      </div>
    </div>
  );
}

function LayerSection({ title, icon: Icon, active, color, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'rgba(248,250,252,0.015)', border: `1px solid ${active ? `${color}18` : 'rgba(248,250,252,0.03)'}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} style={{ color: active ? color : 'rgba(248,250,252,0.4)' }} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: active ? color : 'rgba(248,250,252,0.4)' }}>
          {title}
        </span>
        {active && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />}
      </div>
      {children}
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
