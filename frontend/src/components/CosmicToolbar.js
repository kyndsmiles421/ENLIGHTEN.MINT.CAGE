import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronUp, Mic, Loader2, Radio, GripHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTempo } from '../context/TempoContext';
import { useVoiceCommand } from '../context/VoiceCommandContext';

const HIDDEN_ROUTES = ['/auth', '/', '/vr'];
const POS_KEY = 'cosmic_toolbar_pos';

/* ── Try native haptics, fallback to vibrate ── */
let Haptics;
try { Haptics = require('@capacitor/haptics').Haptics; } catch {}
function haptic(style = 'Light') {
  try { Haptics?.impact({ style }); } catch { navigator.vibrate?.(8); }
}

function getSavedPos() {
  try { return JSON.parse(localStorage.getItem(POS_KEY)); } catch { return null; }
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
  const [position, setPosition] = useState(() => getSavedPos() || { x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const masterRef = useRef(null);
  const holdRef = useRef(null);
  const collapseRef = useRef(null);
  const toolbarRef = useRef(null);
  const dragStartRef = useRef(null);
  const dragMoved = useRef(false);

  useEffect(() => {
    const h = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Persist position
  useEffect(() => {
    if (position.x !== null) {
      localStorage.setItem(POS_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Auto-collapse after 5s of inactivity
  useEffect(() => {
    if (expanded) {
      collapseRef.current = setTimeout(() => setExpanded(false), 5000);
      return () => clearTimeout(collapseRef.current);
    }
  }, [expanded]);

  const refreshCollapse = useCallback(() => {
    if (collapseRef.current) clearTimeout(collapseRef.current);
    collapseRef.current = setTimeout(() => setExpanded(false), 5000);
  }, []);

  const toggleExpand = useCallback(() => {
    haptic('Light');
    setExpanded(e => !e);
  }, []);

  const handlePillTap = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('[data-tool-btn]') || e.target.closest('[data-drag-handle]')) return;
    if (dragMoved.current) return;
    toggleExpand();
  }, [toggleExpand]);

  /* ── Drag handlers ── */
  const snapToEdge = useCallback((x, y) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const el = toolbarRef.current;
    const w = el?.offsetWidth || 160;
    const h = el?.offsetHeight || 36;
    const SNAP = 50;
    let sx = x, sy = y;

    // Horizontal snap
    const midX = x + w / 2;
    if (midX < vw / 2) {
      sx = x < SNAP ? 8 : x;
    } else {
      sx = (vw - x - w) < SNAP ? vw - w - 8 : x;
    }

    // Vertical snap
    if (y < SNAP) {
      sy = 12;
    } else if ((vh - y - h) < SNAP) {
      sy = vh - h - 12;
    }

    return { x: Math.max(4, Math.min(vw - w - 4, sx)), y: Math.max(4, Math.min(vh - h - 4, sy)) };
  }, []);

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragMoved.current = false;
    const rect = toolbarRef.current?.getBoundingClientRect();
    dragStartRef.current = {
      offsetX: (e.clientX || e.touches?.[0]?.clientX || 0) - (rect?.left || 0),
      offsetY: (e.clientY || e.touches?.[0]?.clientY || 0) - (rect?.top || 0),
    };
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      if (cx == null || cy == null) return;
      dragMoved.current = true;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const el = toolbarRef.current;
      const w = el?.offsetWidth || 160;
      const h = el?.offsetHeight || 36;
      setPosition({
        x: Math.max(0, Math.min(vw - w, cx - dragStartRef.current.offsetX)),
        y: Math.max(0, Math.min(vh - h, cy - dragStartRef.current.offsetY)),
      });
    };
    const onUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      setPosition(prev => {
        if (prev.x === null) return prev;
        return snapToEdge(prev.x, prev.y);
      });
      // Reset dragMoved after a tick so click handler can check it
      setTimeout(() => { dragMoved.current = false; }, 50);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging, snapToEdge]);

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
  const haloColor = meditating
    ? 'rgba(34,197,94,0.25)'
    : isRecording
      ? 'rgba(239,68,68,0.25)'
      : wakeWordEnabled
        ? 'rgba(34,197,94,0.15)'
        : 'transparent';

  // Position: custom or default top-right
  const hasCustomPos = position.x !== null;
  const posStyle = hasCustomPos
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : { top: 12, right: 12 };

  return createPortal(
    <motion.div
      ref={toolbarRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed flex items-center"
      onClick={handlePillTap}
      style={{
        ...posStyle,
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
        transition: isDragging ? 'none' : 'background 0.4s, border 0.4s, padding 0.3s, box-shadow 0.6s',
        cursor: isDragging ? 'grabbing' : 'pointer',
        touchAction: 'none',
      }}
      data-testid="cosmic-toolbar"
    >
      {anyActive && <ActiveHalo color={haloColor} />}

      {/* ── Drag handle ── */}
      <div
        data-drag-handle="true"
        onPointerDown={onDragStart}
        className="flex items-center justify-center rounded-full mr-0.5"
        style={{
          width: 18,
          height: 24,
          cursor: isDragging ? 'grabbing' : 'grab',
          flexShrink: 0,
          touchAction: 'none',
        }}
        data-testid="toolbar-drag-handle"
        title="Drag to reposition"
      >
        <GripHorizontal size={10} style={{ color: 'rgba(192,132,252,0.3)' }} />
      </div>

      {/* ── Meditate (hidden on Mixer) — GREEN ── */}
      {!onMixer && (
        <ToolBtn
          testId="toolbar-meditate"
          onClick={(e) => { e.stopPropagation(); toggleMeditate(); }}
          active={meditating}
          color="#4ADE80"
          expanded={expanded}
          label={meditating ? 'Stop Zen' : 'Zen'}
        >
          <LotusIcon size={15} color={meditating ? '#4ADE80' : '#4ADE80'} />
          {meditating && <Glow color="rgba(34,197,94,0.4)" speed={3} />}
        </ToolBtn>
      )}

      {/* ── Voice — BLUE ── */}
      <ToolBtn
        testId="toolbar-voice"
        onPointerDown={handleMicDown}
        onPointerUp={handleMicUp}
        onPointerLeave={handleMicUp}
        active={isRecording || holdActive}
        color="#60A5FA"
        expanded={expanded}
        label={isRecording ? 'Release' : 'Voice'}
        badge={wakeWordEnabled && !isRecording}
      >
        {isProcessing
          ? <Loader2 size={14} className="animate-spin" style={{ color: '#60A5FA' }} />
          : <Mic size={14} style={{ color: isRecording ? '#FCA5A5' : '#60A5FA' }} />}
        {isRecording && <Glow color="rgba(239,68,68,0.4)" speed={1} />}
      </ToolBtn>

      {/* ── Wake Word — AMBER ── */}
      <ToolBtn
        testId="toolbar-wake"
        onClick={(e) => { e.stopPropagation(); haptic('Light'); toggleWakeWord(); }}
        active={wakeWordEnabled}
        color="#FBBF24"
        expanded={expanded}
        label={wakeWordEnabled ? 'Wake Off' : 'Wake'}
        small
      >
        <Radio size={12} style={{ color: wakeWordEnabled ? '#FBBF24' : '#FBBF24' }} />
        {wakeWordEnabled && <Glow color="rgba(251,191,36,0.3)" speed={4} />}
      </ToolBtn>

      {/* ── Scroll-to-top — VIOLET ── */}
      <AnimatePresence>
        {showTop && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}>
            <ToolBtn
              testId="toolbar-top"
              onClick={(e) => { e.stopPropagation(); haptic('Light'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              expanded={expanded}
              label="Top"
              color="#A78BFA"
              small
            >
              <ChevronUp size={13} style={{ color: '#A78BFA' }} />
            </ToolBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expand indicator ── */}
      <div
        className="flex items-center justify-center ml-0.5"
        style={{ width: 14, height: 20, flexShrink: 0, pointerEvents: 'none' }}
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

/* ── Animated outer halo ── */
function ActiveHalo({ color }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ inset: -4, borderRadius: 28, border: `1.5px solid ${color}`, filter: 'blur(1px)' }}
      animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.2, 0.6] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      data-testid="toolbar-active-halo"
    />
  );
}

/* ── Reusable toolbar button — always shows its identity color ── */
function ToolBtn({ children, testId, onClick, onPointerDown, onPointerUp, onPointerLeave, active, color, expanded, label, small, badge }) {
  const c = color || '#C084FC';
  return (
    <motion.button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.82 }}
      data-tool-btn="true"
      className="relative flex items-center gap-1.5 rounded-full transition-all overflow-hidden"
      style={{
        height: small ? 28 : 32,
        padding: expanded ? `0 ${small ? 8 : 10}px 0 ${small ? 6 : 8}px` : `0 ${small ? 6 : 8}px`,
        background: active ? `${c}20` : `${c}08`,
        border: `1px solid ${active ? `${c}40` : `${c}18`}`,
        cursor: 'pointer',
        boxShadow: active ? `0 0 16px ${c}25, 0 0 4px ${c}15` : `0 0 4px ${c}06`,
        transition: 'box-shadow 0.4s, background 0.3s, padding 0.2s, border 0.3s',
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
            style={{ color: active ? c : `${c}90` }}
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
