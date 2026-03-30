import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronUp, Mic, Loader2, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTempo } from '../context/TempoContext';
import { useVoiceCommand } from '../context/VoiceCommandContext';

const HIDDEN_ROUTES = ['/auth', '/'];

/* ── Try native haptics, fallback to vibrate ── */
let Haptics;
try { Haptics = require('@capacitor/haptics').Haptics; } catch {}
function haptic(style = 'Light') {
  try { Haptics?.impact({ style }); } catch { navigator.vibrate?.(8); }
}

function LotusIcon({ size = 15, color = '#C084FC' }) {
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

  const [expanded, setExpanded] = useState(false);
  const [meditating, setMeditating] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [holdActive, setHoldActive] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const masterRef = useRef(null);
  const holdRef = useRef(null);
  const collapseRef = useRef(null);

  useEffect(() => {
    const h = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Auto-collapse after 5s of inactivity
  useEffect(() => {
    if (expanded) {
      collapseRef.current = setTimeout(() => setExpanded(false), 5000);
      return () => clearTimeout(collapseRef.current);
    }
  }, [expanded]);

  // Reset collapse timer on any interaction
  const refreshCollapse = useCallback(() => {
    if (collapseRef.current) clearTimeout(collapseRef.current);
    collapseRef.current = setTimeout(() => setExpanded(false), 5000);
  }, []);

  const toggleExpand = useCallback(() => {
    haptic('Light');
    setExpanded(e => !e);
  }, []);

  // Tap on the pill body expands; tapping a button inside won't trigger this
  const handlePillTap = useCallback((e) => {
    // Don't expand when clicking a child button
    if (e.target.closest('button') || e.target.closest('[data-tool-btn]')) return;
    toggleExpand();
  }, [toggleExpand]);

  /* ── Voice ── */
  const handleMicDown = useCallback((e) => {
    e.preventDefault();
    setHoldActive(true);
    haptic('Medium');
    refreshCollapse();
    holdRef.current = setTimeout(() => startRecording(), 150);
  }, [startRecording, refreshCollapse]);
  const handleMicUp = useCallback((e) => {
    e.preventDefault();
    setHoldActive(false);
    if (holdRef.current) clearTimeout(holdRef.current);
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  /* ── Meditate ── */
  const stopMeditate = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    if (masterRef.current) { try { masterRef.current.disconnect(); } catch {} masterRef.current = null; }
    if (ctxRef.current && ctxRef.current.state !== 'closed') { try { ctxRef.current.close(); } catch {} }
    ctxRef.current = null;
  }, []);

  const toggleMeditate = useCallback(() => {
    haptic('Heavy');
    refreshCollapse();
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
      noise.connect(lp); lp.connect(oG); oG.connect(master); lfo.start(); noise.start();
      nodesRef.current = [osc528, osc174, noise, lfo];
      setBpm(60);
      setMeditating(true);
      toast('Deep Zen activated', {
        description: '528Hz + 174Hz + Ocean \u00b7 60 BPM',
        style: { background: 'linear-gradient(135deg, rgba(10,10,18,0.95), rgba(20,40,20,0.95))', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80' },
      });
    } catch { toast.error('Audio unavailable'); }
  }, [meditating, stopMeditate, setBpm, refreshCollapse]);

  useEffect(() => () => stopMeditate(), [stopMeditate]);

  const hidden = !user || HIDDEN_ROUTES.includes(location.pathname);
  const onMixer = location.pathname === '/cosmic-mixer';
  if (hidden) return null;

  const anyActive = meditating || isRecording || wakeWordEnabled;

  // Determine halo color based on highest-priority active state
  const haloColor = meditating
    ? 'rgba(34,197,94,0.25)'
    : isRecording
      ? 'rgba(239,68,68,0.25)'
      : wakeWordEnabled
        ? 'rgba(34,197,94,0.15)'
        : 'transparent';

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed flex items-center"
      onClick={handlePillTap}
      style={{
        top: 12,
        right: 12,
        zIndex: 9998,
        padding: expanded ? '5px 8px' : '5px 6px',
        borderRadius: 24,
        background: anyActive ? 'rgba(10,10,18,0.55)' : 'rgba(10,10,18,0.35)',
        border: `1px solid ${anyActive ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.05)'}`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: anyActive
          ? `0 0 20px ${haloColor}, 0 0 40px ${haloColor}, 0 4px 16px rgba(0,0,0,0.3)`
          : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'background 0.4s, border 0.4s, padding 0.3s, box-shadow 0.6s',
        cursor: 'pointer',
      }}
      data-testid="cosmic-toolbar"
    >
      {/* Outer animated halo for active states */}
      {anyActive && <ActiveHalo color={haloColor} />}

      {/* ── Meditate (hidden on Mixer) ── */}
      {!onMixer && (
        <ToolBtn
          testId="toolbar-meditate"
          onClick={(e) => { e.stopPropagation(); toggleMeditate(); }}
          active={meditating}
          glowColor="rgba(34,197,94,0.35)"
          expanded={expanded}
          label={meditating ? 'Stop' : 'Zen'}
        >
          <LotusIcon size={15} color={meditating ? '#4ADE80' : '#C084FC'} />
          {meditating && <Glow color="rgba(34,197,94,0.3)" speed={3} />}
        </ToolBtn>
      )}

      {/* ── Voice ── */}
      <ToolBtn
        testId="toolbar-voice"
        onPointerDown={handleMicDown}
        onPointerUp={handleMicUp}
        onPointerLeave={handleMicUp}
        active={isRecording || holdActive}
        glowColor={isRecording ? 'rgba(239,68,68,0.35)' : 'rgba(59,130,246,0.25)'}
        expanded={expanded}
        label={isRecording ? 'Listening' : 'Voice'}
        badge={wakeWordEnabled && !isRecording}
      >
        {isProcessing
          ? <Loader2 size={14} className="animate-spin" style={{ color: '#E9D5FF' }} />
          : <Mic size={14} style={{ color: isRecording ? '#FCA5A5' : 'rgba(192,132,252,0.65)' }} />}
        {isRecording && <Glow color="rgba(239,68,68,0.4)" speed={1} />}
      </ToolBtn>

      {/* ── Wake Word ── */}
      <ToolBtn
        testId="toolbar-wake"
        onClick={(e) => { e.stopPropagation(); haptic('Light'); toggleWakeWord(); }}
        active={wakeWordEnabled}
        glowColor="rgba(34,197,94,0.2)"
        expanded={expanded}
        label={wakeWordEnabled ? 'Wake On' : 'Wake'}
        small
      >
        <Radio size={12} style={{ color: wakeWordEnabled ? '#22C55E' : 'rgba(255,255,255,0.3)' }} />
        {wakeWordEnabled && <Glow color="rgba(34,197,94,0.2)" speed={4} />}
      </ToolBtn>

      {/* ── Scroll-to-top ── */}
      <AnimatePresence>
        {showTop && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}>
            <ToolBtn
              testId="toolbar-top"
              onClick={(e) => { e.stopPropagation(); haptic('Light'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              expanded={expanded}
              label="Top"
              small
            >
              <ChevronUp size={13} style={{ color: 'rgba(192,132,252,0.6)' }} />
            </ToolBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expand indicator dots ── */}
      <div
        className="flex items-center justify-center ml-0.5"
        style={{ width: 16, height: 20, flexShrink: 0, pointerEvents: 'none' }}
        data-testid="toolbar-expand-indicator"
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-[2px]"
        >
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: expanded ? 'rgba(192,132,252,0.6)' : 'rgba(192,132,252,0.35)' }} />
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: expanded ? 'rgba(192,132,252,0.6)' : 'rgba(192,132,252,0.35)' }} />
          {!expanded && <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(192,132,252,0.2)' }} />}
        </motion.div>
      </div>
    </motion.div>,
    document.body
  );
}

/* ── Animated outer halo that pulses around the entire toolbar ── */
function ActiveHalo({ color }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        inset: -4,
        borderRadius: 28,
        border: `1.5px solid ${color}`,
        filter: `blur(1px)`,
      }}
      animate={{
        scale: [1, 1.06, 1],
        opacity: [0.6, 0.2, 0.6],
      }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      data-testid="toolbar-active-halo"
    />
  );
}

/* ── Reusable toolbar button ── */
function ToolBtn({ children, testId, onClick, onPointerDown, onPointerUp, onPointerLeave, active, glowColor, expanded, label, small, badge }) {
  return (
    <motion.button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.82 }}
      className="relative flex items-center gap-1.5 rounded-full transition-all overflow-hidden"
      data-tool-btn="true"
      style={{
        height: small ? 28 : 32,
        padding: expanded ? `0 ${small ? 8 : 10}px 0 ${small ? 6 : 8}px` : `0 ${small ? 6 : 8}px`,
        background: active ? (glowColor || 'rgba(192,132,252,0.15)') : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
        cursor: 'pointer',
        boxShadow: active ? `0 0 14px ${glowColor || 'rgba(192,132,252,0.1)'}` : 'none',
        transition: 'box-shadow 0.4s, background 0.3s, padding 0.2s',
      }}
      data-testid={testId}
    >
      <span className="relative flex items-center justify-center" style={{ width: small ? 12 : 15, height: small ? 12 : 15, flexShrink: 0 }}>
        {children}
      </span>
      {badge && (
        <div className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full"
          style={{ background: '#22C55E', border: '1.5px solid rgba(10,10,18,0.9)' }} />
      )}
      <AnimatePresence>
        {expanded && label && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[9px] font-medium whitespace-nowrap overflow-hidden"
            style={{ color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Animated glow ring ── */
function Glow({ color, speed = 2 }) {
  return (
    <motion.div
      className="absolute inset-[-3px] rounded-full pointer-events-none"
      style={{ border: `1.5px solid ${color}` }}
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ repeat: Infinity, duration: speed, ease: 'easeInOut' }}
    />
  );
}
