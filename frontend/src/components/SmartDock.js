import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Headphones, Send, BookOpen, X, Sparkles, Loader2, Play, Pause, GripHorizontal, Moon, Volume2, VolumeX, Square, Globe, Activity, Zap, Music, Award, Crown, Shield, Hexagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMixer } from '../context/MixerContext';
import { useFocus } from '../context/FocusContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useSensory } from '../context/SensoryContext';
import { useTreasury } from '../context/TreasuryContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHarmonyEngine, getHarmonyColor } from '../hooks/useHarmonyEngine';
import SovereignConsultOverlay, { SolfeggioGlow } from './SovereignConsultOverlay';
import { AlchemicalLab } from './AlchemicalLab';

const API = process.env.REACT_APP_BACKEND_URL;
const USAGE_KEY = 'cosmic_dock_usage';
const DOCK_MIN_KEY = 'cosmic_dock_minimized';
const DOCK_POS_KEY = 'cosmic_dock_pos';
const WIDGET_FOCUS_KEY = 'cosmic_widget_focus';

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
  const { isMuted, sovereignMuteToggle, sovereignKillAll, audioSources } = useSensory();
  const { focusMode, hyperFocus, exitFocus } = useFocus();
  const [activePanel, setActivePanel] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const longPressRef = useRef(null);
  const [minimized, setMinimized] = useState(() => {
    try { return localStorage.getItem(DOCK_MIN_KEY) === 'true'; } catch { return false; }
  });
  const [position, setPosition] = useState(() => getSavedPos() || { x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dockOrientation, setDockOrientation] = useState(() => {
    try { return localStorage.getItem('dock_orientation') || 'horizontal'; } catch { return 'horizontal'; }
  });
  const [consultOpen, setConsultOpen] = useState(false);
  const [alchemicalLabOpen, setAlchemicalLabOpen] = useState(false);
  const [snappedEdge, setSnappedEdge] = useState(() => {
    try { const e = localStorage.getItem('dock_snapped'); return e && e !== 'none' ? e : null; } catch { return null; }
  });
  const [zBoost, setZBoost] = useState(() => {
    try { return localStorage.getItem(WIDGET_FOCUS_KEY) === 'dock'; } catch { return false; }
  });
  const collapseRef = useRef(null);
  const dockRef = useRef(null);
  const dragStartRef = useRef(null);
  const dragMoved = useRef(false);
  const swipeStartRef = useRef(null);
  const doubleTapRef = useRef(0);

  // Mobile: detect swipe-up on dock to expand panel, swipe-down to collapse
  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('[data-drag-handle]')) return;
    swipeStartRef.current = { y: e.touches[0].clientY, t: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!swipeStartRef.current) return;
    const dy = swipeStartRef.current.y - e.changedTouches[0].clientY;
    const dt = Date.now() - swipeStartRef.current.t;
    swipeStartRef.current = null;
    if (dt > 400) return; // too slow
    if (dy > 40) {
      // Swipe up — open harmony panel
      haptic('Light');
      setActivePanel(prev => prev ? null : 'harmony');
    } else if (dy < -40 && activePanel) {
      // Swipe down — close panel
      haptic('Light');
      setActivePanel(null);
    }
  }, [activePanel]);

  // Bring to front on interaction
  const bringToFront = useCallback(() => {
    localStorage.setItem(WIDGET_FOCUS_KEY, 'dock');
    setZBoost(true);
    window.dispatchEvent(new CustomEvent('widget-focus', { detail: 'dock' }));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail !== 'dock') setZBoost(false);
    };
    window.addEventListener('widget-focus', handler);
    return () => window.removeEventListener('widget-focus', handler);
  }, []);

  // Listen for Alchemical Lab open event
  useEffect(() => {
    const openLabHandler = () => setAlchemicalLabOpen(true);
    window.addEventListener('openAlchemicalLab', openLabHandler);
    return () => window.removeEventListener('openAlchemicalLab', openLabHandler);
  }, []);

  const hidden = location.pathname === '/auth' || location.pathname === '/' || location.pathname === '/tutorial' || location.pathname === '/vr' || location.pathname === '/intro' || location.pathname === '/hub' || location.pathname.startsWith('/live/');

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

  /* ── Drag handlers — Kinetic Architecture ── */
  const MAGNETIC_ZONE = 20; // 20px edge proximity for magnetic snap
  const snapToEdge = useCallback((x, y) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const el = dockRef.current;
    const w = el?.offsetWidth || 200;
    const h = el?.offsetHeight || 36;
    let sx = x, sy = y;
    let edge = null;
    let orient = 'horizontal';

    // Edge detection with magnetic zone
    const distLeft = x;
    const distRight = vw - x - w;
    const distTop = y;
    const distBottom = vh - y - h;

    // Find closest edge within magnetic zone
    const edges = [
      { name: 'left', dist: distLeft, snap: () => { sx = 6; orient = 'vertical'; } },
      { name: 'right', dist: distRight, snap: () => { sx = vw - w - 6; orient = 'vertical'; } },
      { name: 'top', dist: distTop, snap: () => { sy = 6; orient = 'horizontal'; } },
      { name: 'bottom', dist: distBottom, snap: () => { sy = vh - h - 6; orient = 'horizontal'; } },
    ];

    const closest = edges.reduce((a, b) => a.dist < b.dist ? a : b);
    if (closest.dist < MAGNETIC_ZONE) {
      closest.snap();
      edge = closest.name;
      // Weighted haptic pulse on magnetic snap
      haptic('Heavy');
    } else {
      // Soft snap to nearest edge within 50px
      const softSnap = edges.reduce((a, b) => a.dist < b.dist ? a : b);
      if (softSnap.dist < 50) {
        softSnap.snap();
        edge = softSnap.name;
        haptic('Light');
      }
    }

    sx = Math.max(4, Math.min(vw - w - 4, sx));
    sy = Math.max(4, Math.min(vh - h - 4, sy));

    setSnappedEdge(edge);
    setDockOrientation(orient);

    // Persist dock orientation for class preset restore
    try { localStorage.setItem('dock_orientation', orient); localStorage.setItem('dock_snapped', edge || 'none'); } catch {}

    return { x: sx, y: sy };
  }, []);

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront();
    setIsDragging(true);
    dragMoved.current = false;
    const rect = dockRef.current?.getBoundingClientRect();
    dragStartRef.current = {
      offsetX: (e.clientX || e.touches?.[0]?.clientX || 0) - (rect?.left || 0),
      offsetY: (e.clientY || e.touches?.[0]?.clientY || 0) - (rect?.top || 0),
    };
    document.body.style.userSelect = 'none';
  }, [bringToFront]);

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

  // Harmony Engine — unified harmony/streak/NPU data
  const harmonyEngine = useHarmonyEngine();
  const { dust, gems } = useTreasury();

  const DOCK_ITEMS = [
    { id: 'harmony', icon: Activity, label: 'Harmony', color: '#A78BFA' },
    { id: 'consult', icon: Shield, label: 'Consult', color: '#C084FC' },
    { id: 'harmonics', icon: Moon, label: 'Cosmos', color: '#818CF8' },
    { id: 'assistant', icon: Sparkles, label: 'Sage', color: '#C084FC' },
    { id: 'frequency', icon: Headphones, label: 'Tones', color: '#2DD4BF' },
    { id: 'mixer', icon: Waves, label: 'Mixer', color: '#818CF8' },
    { id: 'academy', icon: Award, label: 'Academy', color: '#FBBF24' },
    { id: 'economy', icon: Crown, label: 'Economy', color: '#C084FC' },
    { id: 'language', icon: Globe, label: 'Lang', color: '#F59E0B' },
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
    if (id === 'economy') { navigate('/economy'); setActivePanel(null); return; }
    if (id === 'consult') { setConsultOpen(prev => !prev); setActivePanel(null); return; }
    setActivePanel(prev => prev === id ? null : id);
  }, [navigate, refreshCollapse]);

  const toggleExpand = useCallback(() => {
    haptic('Light');
    setExpanded(e => !e);
  }, []);

  const handlePillTap = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('[data-dock-btn]') || e.target.closest('[data-drag-handle]')) return;
    if (dragMoved.current) return;

    // Double-tap detection → collapse to resonance dot
    const now = Date.now();
    if (now - doubleTapRef.current < 350) {
      // Double-tap: minimize dock
      haptic('Medium');
      setMinimized(true);
      setActivePanel(null);
      doubleTapRef.current = 0;
      return;
    }
    doubleTapRef.current = now;

    bringToFront();
    toggleExpand();
  }, [toggleExpand, bringToFront, setMinimized, setActivePanel]);

  if (hidden) return null;

  // Position logic
  const hasCustomPos = position.x !== null;
  const defaultPos = { bottom: 80, left: 12 };
  // Z-INDEX: Using proper layer hierarchy instead of 9999
  const baseZ = zBoost ? 80 : 60;  // NAV_BUTTONS : NAV_DOCK

  // Focus Mode: collapse dock to a resonance dot
  if (focusMode && !minimized) {
    const focusDotStyle = hasCustomPos
      ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
      : { bottom: 80, left: 12 };
    return createPortal(
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        onClick={() => { haptic('Medium'); exitFocus(); }}
        className="fixed flex items-center justify-center"
        style={{
          ...focusDotStyle,
          zIndex: baseZ,
          width: hyperFocus ? 28 : 32,
          height: hyperFocus ? 28 : 32,
          borderRadius: '50%',
          background: hyperFocus
            ? 'radial-gradient(circle, rgba(192,132,252,0.12), rgba(6,6,14,0.9))'
            : 'radial-gradient(circle, rgba(192,132,252,0.08), rgba(6,6,14,0.85))',
          border: `1px solid rgba(192,132,252,${hyperFocus ? '0.25' : '0.12'})`,
          backdropFilter: 'none',
          WebkitBackdropFilter: 'blur(16px)',
          cursor: 'pointer',
          boxShadow: `0 0 ${hyperFocus ? 24 : 14}px rgba(192,132,252,${hyperFocus ? '0.15' : '0.08'})`,
        }}
        data-testid="dock-resonance-dot"
        title="Exit Focus Mode"
      >
        <motion.div
          className="rounded-full"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{ duration: hyperFocus ? 1.5 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: hyperFocus ? 8 : 6,
            height: hyperFocus ? 8 : 6,
            background: '#C084FC',
            boxShadow: '0 0 8px rgba(192,132,252,0.4)',
          }}
        />
      </motion.button>,
      document.body
    );
  }

  // Minimized: tiny restore dot
  if (minimized) {
    const minStyle = hasCustomPos
      ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
      : { bottom: 80, left: 12 };
    // V30.3: SmartDock restore button PURGED - ghost element killer
    return null;
  }

  const posStyle = hasCustomPos
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : defaultPos;

  return createPortal(
    <div
      ref={dockRef}
      className="fixed"
      onPointerDown={bringToFront}
      style={{
        ...posStyle,
        zIndex: baseZ,
        touchAction: 'none',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        transition: isDragging ? 'none' : 'left 0.3s ease, top 0.3s ease, bottom 0.3s ease, right 0.3s ease',
      }}
      data-testid="smart-dock"
      data-orientation={dockOrientation}
      data-snapped={snappedEdge || 'none'}
    >
      {/* ── Floating panels (render above the dock) ── */}
      <AnimatePresence>
        {activePanel === 'harmony' && (
          <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <HarmonyNPUPanel onClose={() => setActivePanel(null)} engine={harmonyEngine} />
          </div>
        )}
        {activePanel === 'harmonics' && (
          <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <HarmonicsPanel onClose={() => setActivePanel(null)} token={token} authHeaders={authHeaders} />
          </div>
        )}
        {activePanel === 'assistant' && (
          <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <AssistantPanel onClose={() => setActivePanel(null)} token={token} authHeaders={authHeaders} />
          </div>
        )}
        {activePanel === 'frequency' && (
          <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <FrequencyPanel onClose={() => setActivePanel(null)} />
          </div>
        )}
        {activePanel === 'mixer' && (
          <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <MixerPanel onClose={() => setActivePanel(null)} navigate={navigate} />
          </div>
        )}
        {activePanel === 'language' && (
          <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <LanguagePanel onClose={() => setActivePanel(null)} />
          </div>
        )}
        {activePanel === 'academy' && (() => { navigate('/academy'); setActivePanel(null); return null; })()}
      </AnimatePresence>

      {/* ── Kinetic dock pill — adapts to horizontal/vertical orientation ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={dockOrientation === 'vertical' ? 'flex flex-col items-center' : 'flex items-center'}
        onClick={handlePillTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          padding: expanded ? '6px' : '4px 5px',
          borderRadius: dockOrientation === 'vertical' ? 16 : 22,
          background: activePanel ? 'rgba(30,32,45,0.92)' : 'rgba(25,27,38,0.88)',
          border: `1px solid ${activePanel ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.02)',
          transition: 'background 0.4s, border 0.4s, padding 0.3s, border-radius 0.3s',
          cursor: isDragging ? 'grabbing' : 'pointer',
          marginTop: dockOrientation === 'vertical' ? 0 : 8,
          gap: dockOrientation === 'vertical' ? 2 : 0,
          maxHeight: dockOrientation === 'vertical' ? 'calc(100vh - 80px)' : 'auto',
          overflowY: dockOrientation === 'vertical' ? 'auto' : 'visible',
        }}
        data-testid="smart-dock-pill"
      >
        {/* ── Drag handle — pivots with orientation ── */}
        <div
          data-drag-handle="true"
          onPointerDown={onDragStart}
          className="flex items-center justify-center rounded-full"
          style={{
            width: dockOrientation === 'vertical' ? 22 : 16,
            height: dockOrientation === 'vertical' ? 16 : 22,
            cursor: isDragging ? 'grabbing' : 'grab',
            flexShrink: 0,
            touchAction: 'none',
            marginRight: dockOrientation === 'vertical' ? 0 : 2,
            marginBottom: dockOrientation === 'vertical' ? 2 : 0,
          }}
          data-testid="dock-drag-handle"
          title="Drag to reposition (double-tap to collapse)"
        >
          <GripHorizontal size={9} style={{
            color: 'rgba(192,132,252,0.3)',
            transform: dockOrientation === 'vertical' ? 'rotate(90deg)' : 'none',
          }} />
        </div>

        {sortedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id || (item.id === 'consult' && consultOpen);
          return (
            <DockBtn
              key={item.id}
              testId={`dock-${item.id}`}
              onClick={(e) => { e.stopPropagation(); openPanel(item.id); }}
              active={isActive}
              color={item.color}
              expanded={expanded}
              label={isActive ? `Close ${item.label}` : item.label}
              pulse={item.id === 'consult'}
            >
              <Icon size={13} style={{ color: item.color }} />
              {item.id === 'consult' && <SolfeggioGlow color={item.color} size={28} />}
            </DockBtn>
          );
        })}

        {/* ── Zen Toggle — Global Audio Master Switch ── */}
        <DockBtn
          testId="dock-zen-toggle"
          onClick={(e) => { e.stopPropagation(); sovereignMuteToggle(); haptic('Medium'); }}
          onPointerDown={(e) => {
            // Long-press (1s) = Kill All
            longPressRef.current = setTimeout(() => {
              sovereignKillAll();
              haptic('Heavy');
              longPressRef.current = null;
            }, 1000);
          }}
          onPointerUp={() => {
            if (longPressRef.current) {
              clearTimeout(longPressRef.current);
              longPressRef.current = null;
            }
          }}
          onPointerLeave={() => {
            if (longPressRef.current) {
              clearTimeout(longPressRef.current);
              longPressRef.current = null;
            }
          }}
          active={isMuted}
          color={isMuted ? '#EF4444' : '#22C55E'}
          expanded={expanded}
          label={isMuted ? 'Unmute (long-press: kill all)' : 'Mute (long-press: kill all)'}
        >
          {isMuted
            ? <VolumeX size={13} style={{ color: '#EF4444' }} />
            : <Volume2 size={13} style={{ color: '#22C55E' }} />}
          {audioSources.length > 0 && !isMuted && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#22C55E' }} />
          )}
        </DockBtn>

        {/* ── Harmony score micro-badge (visible when panel closed) ── */}
        {!expanded && harmonyEngine.harmonyScore && activePanel !== 'harmony' && (
          <motion.div
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full cursor-pointer"
            style={{
              background: `${getHarmonyColor(harmonyEngine.harmonyScore.score)}10`,
              border: `1px solid ${getHarmonyColor(harmonyEngine.harmonyScore.score)}20`,
            }}
            onClick={(e) => { e.stopPropagation(); openPanel('harmony'); }}
            whileTap={{ scale: 0.9 }}
            data-testid="harmony-score-badge"
          >
            <span className="text-[7px] font-mono font-bold" style={{ color: getHarmonyColor(harmonyEngine.harmonyScore.score) }}>
              {harmonyEngine.harmonyScore.score}
            </span>
            {harmonyEngine.streak.current_streak > 0 && (
              <span className="text-[6px] font-mono" style={{ color: '#FBBF24' }}>
                {harmonyEngine.streak.current_streak}x
              </span>
            )}
          </motion.div>
        )}

        {/* ── Dust & Gems micro-wallet badge ── */}
        {!expanded && (dust > 0 || gems > 0) && (
          <motion.div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.12)',
            }}
            data-testid="wallet-micro-badge"
          >
            <span className="text-[6px] font-mono" style={{ color: '#FBBF24' }}>{dust}</span>
            <span className="text-[5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>|</span>
            <span className="text-[6px] font-mono" style={{ color: '#818CF8' }}>{gems}</span>
          </motion.div>
        )}


        {/* ── Minimize — RED tinted ── */}
        <DockBtn
          testId="dock-minimize"
          onClick={(e) => { e.stopPropagation(); haptic('Light'); setMinimized(true); setActivePanel(null); }}
          expanded={expanded}
          label="Hide"
          color="#F87171"
          small
        >
          <X size={10} style={{ color: '#F87171' }} />
        </DockBtn>

        {/* ── Expand indicator — rotates with orientation ── */}
        <div
          className="flex items-center justify-center"
          style={{
            width: dockOrientation === 'vertical' ? 18 : 14,
            height: dockOrientation === 'vertical' ? 14 : 18,
            flexShrink: 0,
            pointerEvents: 'none',
            marginLeft: dockOrientation === 'vertical' ? 0 : 2,
            marginTop: dockOrientation === 'vertical' ? 2 : 0,
          }}
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

      {/* ── Golden Pulse Overlay — streak trigger ── */}
      <AnimatePresence>
        {harmonyEngine.goldenPulse && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[5]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.15, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.12) 0%, transparent 70%)',
              border: 'none',
            }}
            data-testid="golden-pulse"
          />
        )}
      </AnimatePresence>

      {/* ── XP Flash — earned XP on streak trigger ── */}
      <AnimatePresence>
        {harmonyEngine.xpFlash && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-[650]"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1.5 }}
            data-testid="xp-flash"
          >
            <span className="text-sm font-mono font-bold px-4 py-2 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)', backdropFilter: 'none'}}>
              +{harmonyEngine.xpFlash} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sovereign Consult Overlay ── */}
      <SovereignConsultOverlay
        isOpen={consultOpen}
        onClose={() => setConsultOpen(false)}
        pathname={location.pathname}
      />

      {/* ── V64.0 Alchemical Lab ── */}
      <AlchemicalLab
        isOpen={alchemicalLabOpen}
        onClose={() => setAlchemicalLabOpen(false)}
      />
    </div>,
    document.body
  );
}

/* ── Reusable dock button — always shows its identity color, larger on mobile ── */
function DockBtn({ children, testId, onClick, active, color, expanded, label, small, onPointerDown, onPointerUp, onPointerLeave, pulse }) {
  const c = color || '#C084FC';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const h = small ? (isMobile ? 30 : 26) : (isMobile ? 36 : 30);
  return (
    <motion.button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.82 }}
      data-dock-btn="true"
      className="relative flex items-center gap-1 rounded-full transition-all overflow-hidden"
      style={{
        height: h,
        padding: expanded ? `0 ${small ? 7 : 9}px 0 ${small ? 5 : 7}px` : `0 ${small ? 5 : 7}px`,
        background: active ? `${c}18` : `${c}08`,
        border: `1px solid ${active ? `${c}35` : `${c}15`}`,
        cursor: 'pointer',
        boxShadow: active
          ? `0 0 14px ${c}20, 0 0 4px ${c}12`
          : pulse ? `0 0 8px ${c}10` : `0 0 3px ${c}05`,
        transition: 'box-shadow 0.4s, background 0.3s, padding 0.2s, border 0.3s',
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
            style={{ color: active ? c : `${c}90` }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Harmonics Panel — Celestial awareness + environmental guidance ─── */
function HarmonicsPanel({ onClose, token, authHeaders }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [affirmation, setAffirmation] = useState(null);
  const [affirmationLoading, setAffirmationLoading] = useState(false);
  const { toggleFreq, activeFreqs } = useMixer();

  useEffect(() => {
    fetch(`${API}/api/harmonics/celestial`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchAffirmation = useCallback(() => {
    if (!token || affirmationLoading) return;
    setAffirmationLoading(true);
    fetch(`${API}/api/harmonics/affirmation`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => { setAffirmation(d); setAffirmationLoading(false); })
      .catch(() => setAffirmationLoading(false));
  }, [token, authHeaders, affirmationLoading]);

  const playRecommended = useCallback(() => {
    if (!data?.guidance?.recommended_frequency) return;
    const hz = data.guidance.recommended_frequency;
    const freq = { hz, label: `${hz} Hz`, desc: data.guidance.recommended_frequency_name || '', color: data.atmosphere?.accent || '#818CF8' };
    toggleFreq(freq);
  }, [data, toggleFreq]);

  const isRecPlaying = data?.guidance?.recommended_frequency ? activeFreqs.has(data.guidance.recommended_frequency) : false;

  const MOON_GLYPHS = {
    new: '\u25CF', waxing_crescent: '\u25D1', first_quarter: '\u25D1',
    waxing_gibbous: '\u25D0', full: '\u25CB', waning_gibbous: '\u25D0',
    last_quarter: '\u25D1', waning_crescent: '\u25D1',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(25,27,38,0.95)',
        border: `1px solid ${data?.atmosphere?.accent || '#818CF8'}18`,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        width: '260px',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        boxShadow: `0 0 24px ${data?.atmosphere?.accent || '#818CF8'}08, 0 8px 32px rgba(0,0,0,0.1)`,
      }}
      data-testid="harmonics-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Moon size={11} style={{ color: data?.atmosphere?.accent || '#818CF8' }} />
          <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: `${data?.atmosphere?.accent || '#818CF8'}CC` }}>Cosmic Harmonics</span>
        </div>
        <button onClick={() => { onClose(); }} className="p-1 rounded-lg hover:bg-white/5">
          <X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={14} className="animate-spin" style={{ color: '#818CF8' }} />
        </div>
      ) : data ? (
        <div className="p-3 space-y-3">
          {/* Moon + Solar + Zodiac row */}
          <div className="flex items-stretch gap-2">
            {/* Moon */}
            <div className="flex-1 rounded-lg p-2" style={{ background: `${data.atmosphere.accent}08`, border: `1px solid ${data.atmosphere.accent}12` }}>
              <div className="text-center">
                <div className="text-lg leading-none mb-1" style={{ color: data.atmosphere.accent, textShadow: `0 0 8px ${data.atmosphere.accent}40` }}>
                  {MOON_GLYPHS[data.moon.phase_id] || '\u25CF'}
                </div>
                <p className="text-[8px] font-medium" style={{ color: `${data.atmosphere.accent}CC` }}>{data.moon.phase}</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{Math.round(data.moon.illumination * 100)}% lit</p>
              </div>
            </div>
            {/* Zodiac */}
            <div className="flex-1 rounded-lg p-2" style={{ background: `${data.zodiac.color}08`, border: `1px solid ${data.zodiac.color}12` }}>
              <div className="text-center">
                <p className="text-[10px] font-medium" style={{ color: `${data.zodiac.color}CC` }}>{data.zodiac.sign}</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{data.zodiac.element}</p>
                <p className="text-[7px] mt-0.5 leading-tight" style={{ color: `${data.zodiac.color}80` }}>{data.zodiac.theme.split(' & ')[0]}</p>
              </div>
            </div>
            {/* Solar */}
            <div className="flex-1 rounded-lg p-2" style={{ background: `${data.solar.color}08`, border: `1px solid ${data.solar.color}12` }}>
              <div className="text-center">
                <p className="text-[10px] font-medium" style={{ color: `${data.solar.color}CC` }}>{data.solar.period}</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Energy: {data.guidance.energy}</p>
              </div>
            </div>
          </div>

          {/* Recommended frequency — one-tap activate */}
          <button
            onClick={playRecommended}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all"
            style={{
              background: isRecPlaying ? `${data.atmosphere.accent}15` : `${data.atmosphere.accent}06`,
              border: `1px solid ${isRecPlaying ? `${data.atmosphere.accent}30` : `${data.atmosphere.accent}10`}`,
              boxShadow: isRecPlaying ? `0 0 16px ${data.atmosphere.accent}15` : 'none',
            }}
            data-testid="harmonics-play-freq"
          >
            {isRecPlaying
              ? <Pause size={12} style={{ color: data.atmosphere.accent }} />
              : <Play size={12} style={{ color: data.atmosphere.accent }} />}
            <div className="text-left flex-1">
              <p className="text-[10px] font-medium" style={{ color: isRecPlaying ? data.atmosphere.accent : `${data.atmosphere.accent}CC` }}>
                {data.guidance.recommended_frequency_name}
              </p>
              <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Aligned with {data.moon.phase}
              </p>
            </div>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${data.atmosphere.accent}10`, color: `${data.atmosphere.accent}90` }}>
              {isRecPlaying ? 'Stop' : 'Play'}
            </span>
          </button>

          {/* Meditation suggestion */}
          <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: `${data.atmosphere.accent}60` }}>Suggested Practice</p>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{data.guidance.recommended_meditation}</p>
          </div>

          {/* AI Affirmation — personalized from mood trends + celestial */}
          <div className="rounded-lg px-3 py-2" style={{ background: `${data.zodiac.color}04`, border: `1px solid ${data.zodiac.color}08` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] uppercase tracking-widest" style={{ color: `${data.zodiac.color}50` }}>Personal Affirmation</p>
              {token && (
                <button onClick={fetchAffirmation} disabled={affirmationLoading}
                  className="text-[8px] px-1.5 py-0.5 rounded-full hover:bg-white/5 transition-colors"
                  style={{ color: `${data.zodiac.color}70`, border: `1px solid ${data.zodiac.color}15` }}
                  data-testid="harmonics-gen-affirmation">
                  {affirmationLoading ? 'Generating...' : affirmation ? 'Refresh' : 'Generate'}
                </button>
              )}
            </div>
            {affirmation ? (
              <p className="text-[9px] italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {affirmation.affirmation}
              </p>
            ) : (
              <p className="text-[9px] italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {data.guidance.affirmation_seed.charAt(0).toUpperCase() + data.guidance.affirmation_seed.slice(1)}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-[9px] text-center py-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Unable to load celestial data</p>
      )}
    </motion.div>
  );
}

/* ─── Mixer Quick-Panel ─── */
function MixerPanel({ onClose, navigate }) {
  const { masterVol, setMasterVol, muted, setMuted, isPlaying, totalActive, stopAll, activeMantra } = useMixer();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.95)',
        border: '1px solid rgba(129,140,248,0.12)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        width: '220px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
      data-testid="dock-mixer-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: '#818CF8' }}>Production Console</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
      </div>

      {/* Master Volume */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
        <button
          onClick={() => setMuted(m => !m)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: muted ? 'rgba(239,68,68,0.12)' : 'rgba(129,140,248,0.08)' }}
          data-testid="dock-mute-toggle"
        >
          {muted ? <VolumeX size={13} style={{ color: '#EF4444' }} /> : <Volume2 size={13} style={{ color: '#818CF8' }} />}
        </button>
        <input
          type="range" min={0} max={100} value={masterVol}
          onChange={e => setMasterVol(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #818CF8 ${masterVol}%, rgba(255,255,255,0.06) ${masterVol}%)`,
            accentColor: '#818CF8',
          }}
          data-testid="dock-volume-slider"
        />
        <span className="text-[9px] w-7 text-right tabular-nums" style={{ color: 'rgba(129,140,248,0.6)' }}>{masterVol}%</span>
      </div>

      {/* Active layers indicator */}
      {isPlaying && (
        <div className="px-3 py-1.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {totalActive} layer{totalActive !== 1 ? 's' : ''} active
            {activeMantra && <span style={{ color: '#2DD4BF' }}> + voice</span>}
          </span>
        </div>
      )}

      <div className="p-2 space-y-1.5">
        {/* Stop All */}
        {isPlaying && (
          <button
            onClick={stopAll}
            className="w-full py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-colors hover:bg-red-500/15"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444' }}
            data-testid="dock-stop-all"
          >
            <Square size={10} /> Stop All
          </button>
        )}
        {/* V29.0: Direct route to Apex Creator Console */}
        <button
          onClick={() => { onClose(); navigate('/creator-console'); }}
          className="w-full py-2 rounded-lg text-[10px]"
          style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.12)', color: '#818CF8' }}
          data-testid="dock-open-mixer"
        >
          Apex Console V29
        </button>
        <button
          onClick={() => { onClose(); navigate('/creator-console'); }}
          className="w-full py-2 rounded-lg text-[10px]"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)' }}
          data-testid="dock-open-mixer-page"
        >
          Full Mixer Page
        </button>
        <button
          onClick={() => { 
            onClose(); 
            // Dispatch custom event to open Alchemical Lab
            window.dispatchEvent(new CustomEvent('openAlchemicalLab'));
          }}
          className="w-full py-2 rounded-lg text-[10px] flex items-center justify-center gap-1.5"
          style={{ 
            background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(244,114,182,0.12))', 
            border: '1px solid rgba(129,140,248,0.2)', 
            color: '#818CF8' 
          }}
          data-testid="dock-open-alchemical-lab"
        >
          <Hexagon size={10} /> Alchemical Lab
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
        background: 'rgba(25,27,38,0.95)',
        border: '1px solid rgba(192,132,252,0.12)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        width: '280px',
        maxHeight: '350px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
      data-testid="assistant-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={11} style={{ color: '#C084FC' }} />
          <span className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>Sage</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
      </div>
      <div ref={scrollRef} className="px-3 py-2 space-y-2 overflow-y-auto" style={{ maxHeight: '220px', scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <p className="text-[9px] text-center py-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {token ? 'Ask anything about wellness or the app' : 'Sign in to chat'}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed"
              style={{
                background: m.role === 'user' ? 'rgba(192,132,252,0.08)' : 'rgba(248,250,252,0.02)',
                color: m.role === 'user' ? '#D8B4FE' : 'rgba(255,255,255,0.85)',
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
  const { activeFreqs, toggleFreq: ctxToggleFreq } = useMixer();

  const playFreq = useCallback((freq, color) => {
    const mixerFreq = { hz: freq, label: `${freq} Hz`, desc: '', color };
    ctxToggleFreq(mixerFreq);
  }, [ctxToggleFreq]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(25,27,38,0.95)',
        border: '1px solid rgba(45,212,191,0.12)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        width: '200px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
      data-testid="frequency-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: '#2DD4BF' }}>Solfeggio Tones</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
      </div>
      <div className="p-2 space-y-0.5">
        {FREQUENCIES.map(f => {
          const isActive = activeFreqs.has(f.freq);
          return (
            <button
              key={f.freq}
              onClick={() => playFreq(f.freq, f.color)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-left"
              style={{
                background: isActive ? `${f.color}10` : 'transparent',
                border: `1px solid ${isActive ? `${f.color}20` : 'transparent'}`,
              }}
              data-testid={`freq-${f.freq}`}
            >
              {isActive
                ? <Pause size={10} style={{ color: f.color }} />
                : <Play size={10} style={{ color: 'rgba(255,255,255,0.65)' }} />}
              <span className="text-[9px]" style={{ color: isActive ? f.color : 'rgba(255,255,255,0.75)' }}>{f.name}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Harmony + NPU Control Panel ─── */
const CHANNEL_META = {
  0: { label: 'Nexus', color: '#EAB308' },
  1: { label: 'Sensory', color: '#C084FC' },
  2: { label: 'Background', color: '#60A5FA' },
};

function HarmonyNPUPanel({ onClose, engine }) {
  const { harmonyScore, streak, npuStats, recentTasks, tierColor } = engine;
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dataRef = useRef({ streams: [[], [], []] });

  // Canvas stream visualization — only runs while panel is mounted
  const drawStreams = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const centerX = w / 2;
    const centerY = h;

    [0, 1, 2].forEach(ch => {
      const meta = CHANNEL_META[ch];
      const stream = dataRef.current.streams[ch];
      const startX = (ch / 2) * w;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.quadraticCurveTo(startX, h * 0.6, centerX, centerY);
      ctx.strokeStyle = `${meta.color}15`;
      ctx.lineWidth = 1;
      ctx.stroke();

      stream.forEach((packet) => {
        packet.age += 0.02;
        if (packet.age > 1) return;
        const t = packet.age;
        const px = startX + (centerX - startX) * t * t;
        const py = t * centerY;
        ctx.beginPath();
        ctx.arc(px, py, 2 + (1 - t) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${meta.color}${Math.round((1 - t) * 180).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
      dataRef.current.streams[ch] = stream.filter(p => p.age < 1);
    });

    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 12);
    grad.addColorStop(0, `rgba(234,179,8,${npuStats.active > 0 ? 0.3 : 0.05})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(centerX - 15, centerY - 15, 30, 30);
    animRef.current = requestAnimationFrame(drawStreams);
  }, [npuStats.active]);

  useEffect(() => {
    drawStreams();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [drawStreams]);

  // Feed new task events into canvas streams
  useEffect(() => {
    recentTasks.forEach(t => {
      const ch = t.priority ?? 2;
      if (dataRef.current.streams[ch].length < 10) {
        dataRef.current.streams[ch].push({ value: 1, age: 0 });
      }
    });
  }, [recentTasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(20,22,32,0.95)',
        border: '1px solid rgba(167,139,250,0.12)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        width: '260px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 0 20px rgba(167,139,250,0.06)',
      }}
      data-testid="harmony-npu-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Activity size={11} style={{ color: '#A78BFA' }} />
          <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: '#A78BFACC' }}>Control Center</span>
          {npuStats.npu_burst && (
            <motion.span className="text-[6px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308' }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}>
              BURST
            </motion.span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
          <X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>

      {/* Harmony Score Section */}
      {harmonyScore && (
        <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }} data-testid="harmony-score-panel">
          <div className="flex items-center gap-3">
            {/* Score ring */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(248,250,252,0.04)" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none"
                  stroke={getHarmonyColor(harmonyScore.score)}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(harmonyScore.score / 100) * 125.6} 125.6`}
                  transform="rotate(-90 24 24)"
                  style={{ filter: `drop-shadow(0 0 4px ${getHarmonyColor(harmonyScore.score)}40)`, transition: 'stroke-dasharray 0.8s ease' }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold"
                style={{ color: getHarmonyColor(harmonyScore.score) }} data-testid="harmony-score-value">
                {harmonyScore.score}
              </span>
            </div>
            {/* Breakdown bars */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Music size={8} style={{ color: getHarmonyColor(harmonyScore.score) }} />
                  <span className="text-[8px] font-medium" style={{ color: getHarmonyColor(harmonyScore.score) }}>
                    {harmonyScore.grade}
                  </span>
                </div>
              </div>
              {[
                { label: 'Alignment', value: harmonyScore.breakdown.resonance_alignment, max: 40, color: '#818CF8' },
                { label: 'Explore', value: harmonyScore.breakdown.exploration_diversity, max: 30, color: '#34D399' },
                { label: 'Depth', value: harmonyScore.breakdown.harmonic_depth, max: 30, color: '#F59E0B' },
              ].map(bar => (
                <div key={bar.label} className="flex items-center gap-1.5">
                  <span className="text-[6px] font-mono w-10 text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {bar.label}
                  </span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: bar.color }}
                      initial={{ width: 0 }} animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }} />
                  </div>
                  <span className="text-[6px] font-mono w-4" style={{ color: `${bar.color}80` }}>
                    {bar.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Insight */}
          <p className="text-[7px] mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
            {harmonyScore.insight}
          </p>
        </div>
      )}

      {/* Resonance Streak Section */}
      {streak.current_streak > 0 && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }} data-testid="streak-panel">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap size={9} style={{ color: streak.streak_active ? '#FBBF24' : 'rgba(255,255,255,0.65)' }} />
              <span className="text-[7px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Resonance Streak
              </span>
            </div>
            <motion.span className="text-[11px] font-mono font-bold"
              style={{ color: streak.streak_active ? '#FBBF24' : 'rgba(255,255,255,0.7)' }}
              animate={streak.streak_active ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              data-testid="streak-value">
              {streak.current_streak}x
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(9, Math.max(3, streak.current_streak)) }, (_, i) => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{
                    background: i < streak.current_streak
                      ? (i >= 2 ? '#FBBF24' : 'rgba(251,191,36,0.4)')
                      : 'rgba(248,250,252,0.06)',
                    boxShadow: i < streak.current_streak && i >= 2 ? '0 0 4px rgba(251,191,36,0.3)' : 'none',
                  }} />
              ))}
            </div>
            <div className="flex-1" />
            <div className="text-right">
              <p className="text-[6px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Best: {streak.best_streak}x
              </p>
              {streak.total_xp_earned > 0 && (
                <p className="text-[6px] font-mono" style={{ color: 'rgba(251,191,36,0.5)' }}>
                  +{streak.total_xp_earned} XP
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NPU Queue Stats */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
        <p className="text-[6px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(248,250,252,0.15)' }}>NPU Queue</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-[11px] font-mono font-bold" style={{ color: '#22C55E' }}>{npuStats.completed}</p>
            <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Done</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-mono font-bold" style={{ color: '#EAB308' }}>{npuStats.pending}</p>
            <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Queue</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-mono font-bold" style={{ color: npuStats.errors > 0 ? '#EF4444' : 'rgba(255,255,255,0.6)' }}>{npuStats.errors}</p>
            <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Errors</p>
          </div>
        </div>
      </div>

      {/* Stream Visualization — canvas only runs while mounted */}
      <div className="relative h-14">
        <canvas ref={canvasRef} width={260} height={56} className="w-full h-full" />
        <div className="absolute top-1 left-0 right-0 flex justify-between px-2">
          {Object.entries(CHANNEL_META).map(([ch, meta]) => (
            <span key={ch} className="text-[5px] font-mono" style={{ color: `${meta.color}50` }}>
              {meta.label}
            </span>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      {recentTasks.length > 0 && (
        <div className="px-3 py-1.5 max-h-16 overflow-y-auto" style={{ borderTop: '1px solid rgba(248,250,252,0.03)' }}>
          {recentTasks.slice(0, 4).map((task, i) => (
            <div key={`${task.id}-${i}`} className="flex items-center gap-1 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{
                background: task.type === 'complete' ? '#22C55E' : task.type === 'error' ? '#EF4444' : '#EAB308',
              }} />
              <span className="text-[6px] font-mono truncate flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {task.label || task.channel}
              </span>
              <span className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                {task.type === 'complete' ? 'done' : task.type === 'error' ? 'err' : 'q'}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LanguagePanel({ onClose }) {
  const { language, setLanguage } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(25,27,38,0.95)',
        border: '1px solid rgba(245,158,11,0.12)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        width: '200px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
      data-testid="language-panel"
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: '#F59E0B' }}>Language</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
      </div>
      <div className="p-2 space-y-0.5">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => { setLanguage(l.code); onClose(); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left"
            style={{
              background: language === l.code ? 'rgba(245,158,11,0.08)' : 'transparent',
              border: `1px solid ${language === l.code ? 'rgba(245,158,11,0.15)' : 'transparent'}`,
            }}
            data-testid={`lang-${l.code}`}
          >
            <span className="text-[9px] font-bold w-5" style={{ color: language === l.code ? '#F59E0B' : 'rgba(255,255,255,0.65)' }}>{l.flag}</span>
            <span className="text-[10px] flex-1" style={{ color: language === l.code ? '#F59E0B' : 'rgba(255,255,255,0.75)' }}>{l.label}</span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{l.native}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
