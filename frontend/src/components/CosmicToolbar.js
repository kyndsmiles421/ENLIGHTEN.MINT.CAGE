import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronUp, Mic, Loader2, Radio, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTempo } from '../context/TempoContext';
import { useVoiceCommand } from '../context/VoiceCommandContext';

const HIDDEN_ROUTES = ['/auth', '/'];

/* ── Lotus icon (inline SVG for crispness) ── */
function LotusIcon({ size = 16, color = '#C084FC' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ width: size, height: size, stroke: color }}>
      <path d="M12 21c0 0-3-3-3-7.5S12 3 12 3s3 6 3 10.5S12 21 12 21z" />
      <path d="M12 21c0 0-6-2-7.5-6.5S6 3 6 3" opacity="0.5" />
      <path d="M12 21c0 0 6-2 7.5-6.5S18 3 18 3" opacity="0.5" />
    </svg>
  );
}

export default function CosmicToolbar() {
  const { user } = useAuth();
  const location = useLocation();
  const { setBpm } = useTempo();
  const { isRecording, isProcessing, startRecording, stopRecording, wakeWordEnabled, toggleWakeWord } = useVoiceCommand();

  /* ── Meditate state ── */
  const [meditating, setMeditating] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const masterRef = useRef(null);

  /* ── Scroll-to-top ── */
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const h = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  /* ── Voice recording ── */
  const holdRef = useRef(null);
  const [holdActive, setHoldActive] = useState(false);
  const handleMicDown = useCallback((e) => {
    e.preventDefault();
    setHoldActive(true);
    holdRef.current = setTimeout(() => startRecording(), 200);
  }, [startRecording]);
  const handleMicUp = useCallback((e) => {
    e.preventDefault();
    setHoldActive(false);
    if (holdRef.current) clearTimeout(holdRef.current);
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  /* ── Meditate audio ── */
  const stopMeditate = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    if (masterRef.current) { try { masterRef.current.disconnect(); } catch {} masterRef.current = null; }
    if (ctxRef.current && ctxRef.current.state !== 'closed') { try { ctxRef.current.close(); } catch {} }
    ctxRef.current = null;
  }, []);

  const toggleMeditate = useCallback(() => {
    if (meditating) {
      try { if (masterRef.current && ctxRef.current) masterRef.current.gain.linearRampToValueAtTime(0.001, ctxRef.current.currentTime + 1.2); } catch {}
      setTimeout(() => { stopMeditate(); setMeditating(false); }, 1400);
      setBpm(0);
      toast('Meditation ended', { style: { background: 'rgba(10,10,18,0.92)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.6)' } });
      return;
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);
      masterRef.current = master;
      master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1.5);

      const osc528 = ctx.createOscillator(); osc528.type = 'sine'; osc528.frequency.value = 528;
      const g528 = ctx.createGain(); g528.gain.value = 0.18;
      osc528.connect(g528); g528.connect(master); osc528.start();

      const osc174 = ctx.createOscillator(); osc174.type = 'sine'; osc174.frequency.value = 174;
      const g174 = ctx.createGain(); g174.gain.value = 0.12;
      osc174.connect(g174); g174.connect(master); osc174.start();

      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
      const lfoG = ctx.createGain(); lfoG.gain.value = 200;
      lfo.connect(lfoG); lfoG.connect(lp.frequency);
      const oG = ctx.createGain(); oG.gain.value = 0.4;
      noise.connect(lp); lp.connect(oG); oG.connect(master);
      lfo.start(); noise.start();

      nodesRef.current = [osc528, osc174, noise, lfo];
      setBpm(60);
      setMeditating(true);
      toast('Deep Zen activated', {
        description: '528Hz + 174Hz + Ocean · 60 BPM',
        style: { background: 'linear-gradient(135deg, rgba(10,10,18,0.95), rgba(20,40,20,0.95))', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80', boxShadow: '0 0 20px rgba(34,197,94,0.1)' },
      });
    } catch { toast.error('Audio unavailable — tap again'); }
  }, [meditating, stopMeditate, setBpm]);

  useEffect(() => () => stopMeditate(), [stopMeditate]);

  const hidden = !user || HIDDEN_ROUTES.includes(location.pathname);
  const onMixer = location.pathname === '/cosmic-mixer';
  if (hidden) return null;

  const TOOLS = [
    !onMixer && {
      id: 'meditate',
      icon: <LotusIcon size={15} color={meditating ? '#4ADE80' : '#C084FC'} />,
      onClick: toggleMeditate,
      active: meditating,
      activeColor: 'rgba(34,197,94,0.25)',
      activeBorder: 'rgba(34,197,94,0.4)',
      label: meditating ? 'Stop Zen' : 'Quick Zen',
      testId: 'toolbar-meditate',
    },
    {
      id: 'voice',
      icon: isProcessing
        ? <Loader2 size={14} className="animate-spin" style={{ color: '#E9D5FF' }} />
        : <Mic size={14} style={{ color: isRecording ? '#FCA5A5' : 'rgba(192,132,252,0.7)' }} />,
      onPointerDown: handleMicDown,
      onPointerUp: handleMicUp,
      onPointerLeave: handleMicUp,
      active: isRecording || holdActive,
      activeColor: isRecording ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.2)',
      activeBorder: isRecording ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.3)',
      pulse: isRecording,
      label: isRecording ? 'Listening...' : 'Voice',
      testId: 'toolbar-voice',
    },
    {
      id: 'wake',
      icon: <Radio size={13} style={{ color: wakeWordEnabled ? '#22C55E' : 'rgba(255,255,255,0.35)' }} />,
      onClick: toggleWakeWord,
      active: wakeWordEnabled,
      activeColor: 'rgba(34,197,94,0.15)',
      activeBorder: 'rgba(34,197,94,0.3)',
      small: true,
      label: wakeWordEnabled ? '"Hey Cosmos" on' : 'Wake word',
      testId: 'toolbar-wake',
    },
    showTop && {
      id: 'top',
      icon: <ChevronUp size={14} style={{ color: '#C084FC' }} />,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      label: 'Top',
      testId: 'toolbar-top',
    },
  ].filter(Boolean);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed flex items-center gap-1"
      style={{
        top: 12,
        right: 12,
        zIndex: 9998,
        padding: '4px 6px',
        borderRadius: 28,
        background: 'rgba(10,10,18,0.45)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      data-testid="cosmic-toolbar"
    >
      {TOOLS.map(tool => (
        <motion.button
          key={tool.id}
          onClick={tool.onClick}
          onPointerDown={tool.onPointerDown}
          onPointerUp={tool.onPointerUp}
          onPointerLeave={tool.onPointerLeave}
          whileTap={{ scale: 0.85 }}
          className="relative flex items-center justify-center rounded-full transition-all"
          style={{
            width: tool.small ? 30 : 34,
            height: tool.small ? 30 : 34,
            background: tool.active ? tool.activeColor : 'rgba(255,255,255,0.04)',
            border: `1px solid ${tool.active ? tool.activeBorder : 'rgba(255,255,255,0.06)'}`,
            cursor: 'pointer',
          }}
          title={tool.label}
          data-testid={tool.testId}
        >
          {tool.icon}
          {tool.pulse && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px solid rgba(239,68,68,0.4)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          {tool.id === 'voice' && wakeWordEnabled && !isRecording && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: '#22C55E', border: '1.5px solid rgba(10,10,18,0.9)' }} />
          )}
          {tool.id === 'meditate' && meditating && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ border: '1px solid rgba(34,197,94,0.35)' }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>,
    document.body
  );
}
