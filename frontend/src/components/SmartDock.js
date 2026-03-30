import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Waves, Headphones, Send, BookOpen, X, Sparkles, Loader2, Play, Pause, GripHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;
const USAGE_KEY = 'cosmic_dock_usage';
const DOCK_MIN_KEY = 'cosmic_dock_minimized';
const DOCK_POS_KEY = 'cosmic_dock_pos';

/* ── Try native haptics, fallback to vibrate ── */
let Haptics;
try { Haptics = require('@capacitor/haptics').Haptics; } catch {}
function haptic(style = 'Light') {
  try { Haptics?.impact({ style }); } catch { navigator.vibrate?.(8); }
}

function getUsage() {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}'); } catch { return {}; }
}
function trackUsage(id) {
  const u = getUsage();
  u[id] = (u[id] || 0) + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(u));
}
function getSavedPos() {
  try { return JSON.parse(localStorage.getItem(DOCK_POS_KEY)); } catch { return null; }
}

const FREQUENCIES = [
  { name: '432Hz Calm', freq: 432, color: '#D8B4FE' },
  { name: '528Hz Love', freq: 528, color: '#FDA4AF' },
  { name: '396Hz Release', freq: 396, color: '#2DD4BF' },
  { name: '741Hz Intuition', freq: 741, color: '#3B82F6' },
  { name: '852Hz Awakening', freq: 852, color: '#FCD34D' },
  { name: '963Hz Crown', freq: 963, color: '#C084FC' },
];

export default function SmartDock() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(() => {
    try { return localStorage.getItem(DOCK_MIN_KEY) === 'true'; } catch { return false; }
  });
  const [position, setPosition] = useState(() => getSavedPos() || { x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const collapseRef = useRef(null);
  const dockRef = useRef(null);
  const dragStartRef = useRef(null);
  const dragMoved = useRef(false);

  const hidden = location.pathname === '/auth' || location.pathname === '/' || location.pathname === '/tutorial' || location.pathname.startsWith('/live/');

  useEffect(() => {
    localStorage.setItem(DOCK_MIN_KEY, String(minimized));
  }, [minimized]);

  // Persist position
  useEffect(() => {
    if (position.x !== null) {
      localStorage.setItem(DOCK_POS_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Auto-collapse labels after 5s
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

  /* ── Drag handlers ── */
  const snapToEdge = useCallback((x, y) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const el = dockRef.current;
    const w = el?.offsetWidth || 200;
    const h = el?.offsetHeight || 36;
    const SNAP = 50;
    let sx = x, sy = y;

    const midX = x + w / 2;
    if (midX < vw / 2) {
      sx = x < SNAP ? 8 : x;
    } else {
      sx = (vw - x - w) < SNAP ? vw - w - 8 : x;
    }

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
    const rect = dockRef.current?.getBoundingClientRect();
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
      const el = dockRef.current;
      const w = el?.offsetWidth || 200;
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
      setTimeout(() => { dragMoved.current = false; }, 50);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging, snapToEdge]);

  const DOCK_ITEMS = [
    { id: 'assistant', icon: Sparkles, label: 'Sage', color: '#C084FC' },
    { id: 'frequency', icon: Headphones, label: 'Tones', color: '#2DD4BF' },
    { id: 'mixer', icon: Waves, label: 'Mixer', color: '#818CF8' },
    { id: 'feedback', icon: Send, label: 'Feedback', color: '#86EFAC' },
    { id: 'help', icon: BookOpen, label: 'Help', color: '#FCD34D' },
  ];

  const usage = getUsage();
  const sortedItems = [...DOCK_ITEMS].sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0));

  const openPanel = useCallback((id) => {
    haptic('Light');
    trackUsage(id);
    refreshCollapse();
    if (id === 'feedback') { navigate('/feedback'); setActivePanel(null); return; }
    if (id === 'help') { navigate('/help-center'); setActivePanel(null); return; }
    setActivePanel(prev => prev === id ? null : id);
  }, [navigate, refreshCollapse]);

  const toggleExpand = useCallback(() => {
    haptic('Light');
    setExpanded(e => !e);
  }, []);

  const handlePillTap = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('[data-dock-btn]') || e.target.closest('[data-drag-handle]')) return;
    if (dragMoved.current) return;
    toggleExpand();
  }, [toggleExpand]);

  if (hidden) return null;

  // Position logic
  const hasCustomPos = position.x !== null;
  const defaultPos = { bottom: 80, right: 12 };

  // Minimized: tiny restore dot
  if (minimized) {
    const minStyle = hasCustomPos
      ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
      : { bottom: 80, right: 12 };
    return createPortal(
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15, opacity: 0.9 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => { haptic('Light'); setMinimized(false); }}
        className="fixed flex items-center justify-center"
        style={{
          ...minStyle,
          zIndex: 79,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(11,12,21,0.6)',
          border: '1px solid rgba(192,132,252,0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          opacity: 0.5,
        }}
        data-testid="dock-restore"
        title="Open Dock"
      >
        <Sparkles size={10} style={{ color: '#C084FC' }} className="animate-pulse" />
      </motion.button>,
      document.body
    );
  }

  const posStyle = hasCustomPos
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : defaultPos;

  return createPortal(
    <div
      ref={dockRef}
      className="fixed"
      style={{
        ...posStyle,
        zIndex: 79,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'left 0.3s ease, top 0.3s ease, bottom 0.3s ease, right 0.3s ease',
      }}
      data-testid="smart-dock"
    >
      {/* ── Floating panels (render above the dock) ── */}
      <AnimatePresence>
        {activePanel === 'assistant' && (
          <AssistantPanel onClose={() => setActivePanel(null)} token={token} authHeaders={authHeaders} />
        )}
        {activePanel === 'frequency' && (
          <FrequencyPanel onClose={() => setActivePanel(null)} />
        )}
        {activePanel === 'mixer' && (
          <MixerPanel onClose={() => setActivePanel(null)} navigate={navigate} />
        )}
      </AnimatePresence>

      {/* ── Horizontal pill dock ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex items-center"
        onClick={handlePillTap}
        style={{
          padding: expanded ? '4px 6px' : '4px 5px',
          borderRadius: 22,
          background: activePanel ? 'rgba(10,10,18,0.55)' : 'rgba(10,10,18,0.35)',
          border: `1px solid ${activePanel ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.05)'}`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'background 0.4s, border 0.4s, padding 0.3s',
          cursor: isDragging ? 'grabbing' : 'pointer',
          marginTop: 8,
        }}
        data-testid="smart-dock-pill"
      >
        {/* ── Drag handle ── */}
        <div
          data-drag-handle="true"
          onPointerDown={onDragStart}
          className="flex items-center justify-center rounded-full mr-0.5"
          style={{
            width: 16,
            height: 22,
            cursor: isDragging ? 'grabbing' : 'grab',
            flexShrink: 0,
            touchAction: 'none',
          }}
          data-testid="dock-drag-handle"
          title="Drag to reposition"
        >
          <GripHorizontal size={9} style={{ color: 'rgba(192,132,252,0.25)' }} />
        </div>

        {sortedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <DockBtn
              key={item.id}
              testId={`dock-${item.id}`}
              onClick={(e) => { e.stopPropagation(); openPanel(item.id); }}
              active={isActive}
              color={item.color}
              expanded={expanded}
              label={item.label}
            >
              <Icon size={13} style={{ color: isActive ? item.color : 'rgba(248,250,252,0.4)' }} />
            </DockBtn>
          );
        })}

        {/* ── Minimize ── */}
        <DockBtn
          testId="dock-minimize"
          onClick={(e) => { e.stopPropagation(); haptic('Light'); setMinimized(true); setActivePanel(null); }}
          expanded={expanded}
          label="Hide"
          small
        >
          <X size={10} style={{ color: 'rgba(248,250,252,0.25)' }} />
        </DockBtn>

        {/* ── Expand indicator ── */}
        <div
          className="flex items-center justify-center ml-0.5"
          style={{ width: 14, height: 18, flexShrink: 0, pointerEvents: 'none' }}
        >
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-[2px]"
          >
            <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: expanded ? 'rgba(192,132,252,0.55)' : 'rgba(192,132,252,0.3)' }} />
            <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: expanded ? 'rgba(192,132,252,0.55)' : 'rgba(192,132,252,0.3)' }} />
          </motion.div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

/* ── Reusable dock button ── */
function DockBtn({ children, testId, onClick, active, color, expanded, label, small }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.82 }}
      data-dock-btn="true"
      className="relative flex items-center gap-1 rounded-full transition-all overflow-hidden"
      style={{
        height: small ? 26 : 30,
        padding: expanded ? `0 ${small ? 7 : 9}px 0 ${small ? 5 : 7}px` : `0 ${small ? 5 : 7}px`,
        background: active ? `${color || 'rgba(192,132,252)'}15` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? `${color || 'rgba(192,132,252)'}25` : 'rgba(255,255,255,0.03)'}`,
        cursor: 'pointer',
        boxShadow: active ? `0 0 10px ${color || 'rgba(192,132,252)'}15` : 'none',
        transition: 'box-shadow 0.4s, background 0.3s, padding 0.2s',
      }}
      data-testid={testId}
    >
      <span className="relative flex items-center justify-center" style={{ width: small ? 10 : 13, height: small ? 10 : 13, flexShrink: 0 }}>
        {children}
      </span>
      <AnimatePresence>
        {expanded && label && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[8px] font-medium whitespace-nowrap overflow-hidden"
            style={{ color: active ? (color || 'rgba(255,255,255,0.8)') : 'rgba(255,255,255,0.35)' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Mixer Quick-Panel ─── */
function MixerPanel({ onClose, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.95)',
        border: '1px solid rgba(129,140,248,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        width: '200px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      data-testid="dock-mixer-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: '#818CF8' }}>Production Console</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div className="p-2 space-y-1.5">
        <button
          onClick={() => { onClose(); document.querySelector('[data-testid="mixer-toggle"]')?.click(); }}
          className="w-full py-2 rounded-lg text-[10px]"
          style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.12)', color: '#818CF8' }}
          data-testid="dock-open-mixer"
        >
          Open Console
        </button>
        <button
          onClick={() => { onClose(); navigate('/cosmic-mixer'); }}
          className="w-full py-2 rounded-lg text-[10px]"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(248,250,252,0.45)' }}
        >
          Full Mixer Page
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Assistant Panel ─── */
function AssistantPanel({ onClose, token, authHeaders }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !token) return;
    const text = input;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      let sid = sessionId;
      if (!sid) {
        const r = await fetch(`${API}/api/coach/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ mode: 'spiritual' }),
        });
        const d = await r.json();
        sid = d.session_id;
        setSessionId(sid);
      }
      const r = await fetch(`${API}/api/coach/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ session_id: sid, message: text }),
      });
      const d = await r.json();
      setMessages(prev => [...prev, { role: 'assistant', text: d.reply || d.message || 'Let me reflect on that...' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection issue \u2014 try the Help Center for quick answers.' }]);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.97)',
        border: '1px solid rgba(192,132,252,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        width: '280px',
        maxHeight: '350px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      data-testid="assistant-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={11} style={{ color: '#C084FC' }} />
          <span className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>Sage</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div ref={scrollRef} className="px-3 py-2 space-y-2 overflow-y-auto" style={{ maxHeight: '220px', scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <p className="text-[9px] text-center py-4" style={{ color: 'rgba(248,250,252,0.25)' }}>
            {token ? 'Ask anything about wellness or the app' : 'Sign in to chat'}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed"
              style={{
                background: m.role === 'user' ? 'rgba(192,132,252,0.08)' : 'rgba(248,250,252,0.02)',
                color: m.role === 'user' ? '#D8B4FE' : 'rgba(248,250,252,0.65)',
                border: `1px solid ${m.role === 'user' ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)'}`,
              }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <Loader2 size={10} className="animate-spin" style={{ color: '#C084FC' }} />
            </div>
          </div>
        )}
      </div>
      {token && (
        <div className="px-3 py-2" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
          <div className="flex gap-1.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Sage..."
              className="flex-1 px-2.5 py-1.5 rounded-lg text-[10px] outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }}
              data-testid="assistant-input"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-2 rounded-lg disabled:opacity-30"
              style={{ background: 'rgba(192,132,252,0.08)' }}
              data-testid="assistant-send"
            >
              <Send size={10} style={{ color: '#C084FC' }} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Frequency Panel ─── */
function FrequencyPanel({ onClose }) {
  const [playing, setPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef(null);

  const stop = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.gain.gain.linearRampToValueAtTime(0, (audioCtxRef.current?.currentTime || 0) + 0.3);
      setTimeout(() => {
        try { nodesRef.current?.osc.stop(); } catch {}
        try { nodesRef.current?.osc2.stop(); } catch {}
        nodesRef.current = null;
      }, 400);
    }
    setPlaying(null);
  }, []);

  const playFreq = useCallback((freq) => {
    stop();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start();
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq + 4;
    osc2.connect(gain);
    osc2.start();
    nodesRef.current = { osc, osc2, gain };
    setPlaying(freq);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.97)',
        border: '1px solid rgba(45,212,191,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        width: '200px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      data-testid="frequency-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: '#2DD4BF' }}>Solfeggio Tones</span>
        <button onClick={() => { stop(); onClose(); }} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div className="p-2 space-y-0.5">
        {FREQUENCIES.map(f => (
          <button
            key={f.freq}
            onClick={() => playing === f.freq ? stop() : playFreq(f.freq)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-left"
            style={{
              background: playing === f.freq ? `${f.color}10` : 'transparent',
              border: `1px solid ${playing === f.freq ? `${f.color}20` : 'transparent'}`,
            }}
            data-testid={`freq-${f.freq}`}
          >
            {playing === f.freq
              ? <Pause size={10} style={{ color: f.color }} />
              : <Play size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />}
            <span className="text-[9px]" style={{ color: playing === f.freq ? f.color : 'rgba(248,250,252,0.45)' }}>{f.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
