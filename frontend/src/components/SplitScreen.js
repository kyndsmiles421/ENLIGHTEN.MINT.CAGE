import React, { useState, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Columns, Maximize2, Minimize2, GripVertical, ArrowLeft, Sparkles } from 'lucide-react';
import { playOpen, playClose } from '../hooks/useSoundEngine';

const SplitScreenContext = createContext(null);

export function useSplitScreen() {
  return useContext(SplitScreenContext);
}

// Registry of pages that can be opened in split view
const SPLIT_PAGES = {
  '/meditation': { label: 'Meditation', color: '#D8B4FE' },
  '/breathing': { label: 'Breathwork', color: '#2DD4BF' },
  '/journal': { label: 'Journal', color: '#818CF8' },
  '/mood-tracker': { label: 'Mood', color: '#FDA4AF' },
  '/mantras': { label: 'Mantras', color: '#FCD34D' },
  '/star-chart': { label: 'Star Chart', color: '#60A5FA' },
  '/oracle': { label: 'Oracle', color: '#E879F9' },
  '/coach': { label: 'Sage AI', color: '#D8B4FE' },
  '/music-lounge': { label: 'Music', color: '#34D399' },
  '/frequencies': { label: 'Frequencies', color: '#FB923C' },
  '/crystals': { label: 'Crystals', color: '#A78BFA' },
  '/yoga': { label: 'Yoga', color: '#2DD4BF' },
  '/soundscapes': { label: 'Soundscapes', color: '#22D3EE' },
  '/dreams': { label: 'Dream Journal', color: '#818CF8' },
  '/tarot': { label: 'Tarot', color: '#E879F9' },
  '/affirmations': { label: 'Affirmations', color: '#FCD34D' },
  '/dashboard': { label: 'Dashboard', color: '#D8B4FE' },
  '/growth-timeline': { label: 'Journey', color: '#86EFAC' },
  '/soul-reports': { label: 'Soul Reports', color: '#C084FC' },
  '/reading-list': { label: 'Reading List', color: '#FB923C' },
  '/daily-ritual': { label: 'Daily Ritual', color: '#FCD34D' },
  '/blessings': { label: 'Blessings', color: '#FDA4AF' },
  '/exercises': { label: 'Exercises', color: '#2DD4BF' },
  '/numerology': { label: 'Numerology', color: '#818CF8' },
  '/zen-garden': { label: 'Zen Garden', color: '#86EFAC' },
  '/hooponopono': { label: "Ho'oponopono", color: '#22D3EE' },
  '/dance-music': { label: 'Dance & Music', color: '#F59E0B' },
  '/media-library': { label: 'Media Library', color: '#C084FC' },
  '/my-creations': { label: 'My Creations', color: '#C084FC' },
  '/light-therapy': { label: 'Light Therapy', color: '#A855F7' },
  '/cosmic-mixer': { label: 'Cosmic Mixer', color: '#EC4899' },
  '/videos': { label: 'Videos', color: '#F97316' },
};

// Curated multi-sensory experience pairs
export const COSMIC_PAIRS = [
  {
    id: 'sitar-indigo',
    name: 'Third Eye Journey',
    description: 'Sitar melodies with indigo light for deep intuition',
    pages: ['/dance-music', '/light-therapy'],
    colors: ['#F59E0B', '#6366F1'],
    icon: 'eye',
  },
  {
    id: 'bowl-frequencies',
    name: 'Harmonic Resonance',
    description: 'Singing bowls layered with healing frequencies',
    pages: ['/dance-music', '/frequencies'],
    colors: ['#7C3AED', '#FB923C'],
    icon: 'waves',
  },
  {
    id: 'flute-healing',
    name: 'Forest Healing',
    description: 'Cedar flute with green heart chakra light',
    pages: ['/dance-music', '/light-therapy'],
    colors: ['#059669', '#22C55E'],
    icon: 'leaf',
  },
  {
    id: 'drums-soundscape',
    name: 'Tribal Immersion',
    description: 'Djembe rhythms over ambient soundscapes',
    pages: ['/dance-music', '/soundscapes'],
    colors: ['#B91C1C', '#22D3EE'],
    icon: 'flame',
  },
  {
    id: 'hang-meditation',
    name: 'Celestial Stillness',
    description: 'Hang drum tones with guided meditation',
    pages: ['/dance-music', '/meditation'],
    colors: ['#4338CA', '#D8B4FE'],
    icon: 'moon',
  },
  {
    id: 'kalimba-zen',
    name: 'Zen Flow',
    description: 'Kalimba plucks in a serene zen garden',
    pages: ['/dance-music', '/zen-garden'],
    colors: ['#0891B2', '#86EFAC'],
    icon: 'droplet',
  },
];

export function SplitScreenProvider({ children }) {
  const [splitPanel, setSplitPanel] = useState(null);
  const [splitWidth, setSplitWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const openSplit = useCallback((path) => {
    setSplitPanel({ path });
    setIsCollapsed(false);
    playOpen();
  }, []);

  const closeSplit = useCallback(() => {
    setSplitPanel(null);
    playClose();
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX || e.touches?.[0]?.clientX;
    const startWidth = splitWidth;

    const onMove = (ev) => {
      const clientX = ev.clientX || ev.touches?.[0]?.clientX;
      const delta = ((clientX - startX) / window.innerWidth) * 100;
      setSplitWidth(Math.max(25, Math.min(75, startWidth + delta)));
    };
    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
  }, [splitWidth]);

  const contextValue = {
    openSplit,
    closeSplit,
    splitPanel,
    isActive: !!splitPanel,
    availablePages: SPLIT_PAGES,
  };

  return (
    <SplitScreenContext.Provider value={contextValue}>
      {children}

      {/* Split panel — rendered as a fixed overlay */}
      <AnimatePresence>
        {splitPanel && !isCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${100 - splitWidth}%`, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-0 right-0 bottom-0 border-l overflow-hidden"
            style={{
              borderColor: 'rgba(192,132,252,0.1)',
              background: 'rgba(3,3,8,0.98)',
              zIndex: 55,
              minWidth: '25%',
            }}
            data-testid="split-screen-panel"
          >
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-50 flex items-center justify-center group hover:bg-purple-500/10 transition-colors"
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              data-testid="split-resize-handle"
            >
              <div className="w-0.5 h-12 rounded-full bg-purple-400/20 group-hover:bg-purple-400/40 transition-colors" />
            </div>

            {/* Split panel header */}
            <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 border-b"
              style={{
                background: 'rgba(3,3,8,0.95)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(192,132,252,0.08)',
              }}>
              <div className="flex items-center gap-2">
                <Columns size={12} style={{ color: SPLIT_PAGES[splitPanel.path]?.color || '#D8B4FE' }} />
                <span className="text-xs font-medium" style={{ color: SPLIT_PAGES[splitPanel.path]?.color || '#D8B4FE' }}>
                  {SPLIT_PAGES[splitPanel.path]?.label || 'Panel'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleCollapse}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  data-testid="split-collapse-btn">
                  <Minimize2 size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button onClick={closeSplit}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  data-testid="split-close-btn">
                  <X size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>

            {/* Split panel content via iframe */}
            <iframe
              src={`${window.location.origin}${splitPanel.path}?splitview=true`}
              className="w-full border-0"
              style={{ height: 'calc(100vh - 40px)' }}
              title={`Split: ${SPLIT_PAGES[splitPanel.path]?.label || 'Panel'}`}
              data-testid="split-screen-iframe"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed split indicator */}
      <AnimatePresence>
        {splitPanel && isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
          >
            <button
              onClick={toggleCollapse}
              className="flex items-center gap-2 px-2 py-4 rounded-l-xl transition-all hover:px-3"
              style={{
                background: 'rgba(3,3,8,0.9)',
                border: '1px solid rgba(192,132,252,0.15)',
                borderRight: 'none',
                backdropFilter: 'blur(20px)',
              }}
              data-testid="split-expand-btn"
            >
              <Maximize2 size={14} style={{ color: SPLIT_PAGES[splitPanel.path]?.color || '#D8B4FE' }} />
              <span className="text-[10px]"
                style={{ color: SPLIT_PAGES[splitPanel.path]?.color, writingMode: 'vertical-rl' }}>
                {SPLIT_PAGES[splitPanel.path]?.label}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resize overlay */}
      {isResizing && <div className="fixed inset-0 z-[100] cursor-col-resize" />}
    </SplitScreenContext.Provider>
  );
}

// Quick-access split screen launcher button
export function SplitScreenLauncher() {
  const ctx = useSplitScreen();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllPages, setShowAllPages] = useState(false);
  const navigate = useNavigate();

  if (!ctx) return null;

  const pages = Object.entries(ctx.availablePages);

  const launchPair = (pair) => {
    const [primary, secondary] = pair.pages;
    navigate(primary);
    ctx.openSplit(secondary);
    setIsOpen(false);
  };

  return (
    <div className="relative" data-testid="split-screen-launcher">
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) playOpen(); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all hover:scale-105"
        style={{
          background: ctx.isActive ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${ctx.isActive ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.06)'}`,
          color: ctx.isActive ? '#D8B4FE' : 'var(--text-muted)',
        }}
        data-testid="split-screen-toggle"
      >
        <Columns size={12} />
        <span className="hidden md:inline">Split View</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 max-h-[420px] overflow-y-auto rounded-2xl z-50 p-2"
            style={{
              background: 'rgba(10,10,18,0.95)',
              border: '1px solid rgba(192,132,252,0.12)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(192,132,252,0.05)',
              scrollbarWidth: 'none',
            }}
            data-testid="split-screen-menu"
          >
            {/* Cosmic Pairs Section */}
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1.5 mb-1 flex items-center gap-1.5"
              style={{ color: '#C084FC' }}>
              <Sparkles size={9} /> Cosmic Pairs
            </p>
            {COSMIC_PAIRS.slice(0, 3).map(pair => (
              <button
                key={pair.id}
                onClick={() => launchPair(pair)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all hover:bg-white/5 group"
                data-testid={`pair-${pair.id}`}
              >
                <div className="flex -space-x-1 flex-shrink-0">
                  {pair.colors.map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-black/50" style={{ background: c }} />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{pair.name}</p>
                  <p className="text-[8px] truncate" style={{ color: 'var(--text-muted)' }}>{pair.description}</p>
                </div>
              </button>
            ))}

            {/* Divider */}
            <div className="my-1.5 mx-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />

            {/* Regular pages toggle */}
            <button
              onClick={() => setShowAllPages(!showAllPages)}
              className="w-full text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1.5 mb-1 text-left flex items-center justify-between"
              style={{ color: 'var(--text-muted)' }}
            >
              Open in Split View
              <span className="text-[8px] font-normal normal-case tracking-normal">{showAllPages ? 'Hide' : `${pages.length} apps`}</span>
            </button>
            {showAllPages && pages.map(([path, info]) => (
              <button
                key={path}
                onClick={() => { ctx.openSplit(path); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
                data-testid={`split-option-${path.slice(1)}`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: info.color }} />
                {info.label}
              </button>
            ))}
            {ctx.isActive && (
              <button
                onClick={() => { ctx.closeSplit(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs text-left transition-all hover:bg-red-500/10 border-t"
                style={{ color: '#F87171', borderColor: 'rgba(255,255,255,0.04)' }}
                data-testid="split-close-option"
              >
                <X size={10} /> Close Split View
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
