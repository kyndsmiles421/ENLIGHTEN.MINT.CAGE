import React, { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

// Lazy-load target pages for each module
const PAGE_MAP = {
  mixer: lazy(() => import('../pages/SuanpanMixer')),
  trade: lazy(() => import('../pages/TradeCircle')),
  starchart: lazy(() => import('../pages/StarChart')),
  meditation: lazy(() => import('../pages/Meditation')),
  wellness: lazy(() => import('../pages/Frequencies')),
};

function BubbleLoader({ color }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#06060e' }}>
      <motion.div className="w-16 h-16 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, border: `1px solid ${color}20` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
    </div>
  );
}

// ━━━ Single Bubble — Full-screen portal for one module ━━━
function BubbleView({ module, isActive, onClose }) {
  const PageComponent = PAGE_MAP[module.id];

  return (
    <motion.div
      className="flex-shrink-0 w-screen h-full relative overflow-hidden"
      style={{ scrollSnapAlign: 'center' }}
      data-testid={`bubble-view-${module.id}`}
    >
      {/* Curved edge vignette */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          boxShadow: `inset 0 0 80px 20px rgba(0,0,0,0.6), inset 0 0 200px 60px ${module.color}08`,
          borderRadius: '8px',
        }} />

      {/* Module header bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2"
        style={{ background: 'linear-gradient(180deg, rgba(6,6,14,0.95) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: module.color, boxShadow: `0 0 6px ${module.color}` }} />
          <span className="text-[9px] tracking-widest uppercase font-light"
            style={{ color: `${module.color}90`, fontFamily: 'Cormorant Garamond, serif' }}>
            {module.label}
          </span>
        </div>
        <motion.button onClick={() => onClose(module)} className="p-1.5 rounded-lg cursor-pointer"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          data-testid={`bubble-close-${module.id}`}>
          <X size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
        </motion.button>
      </div>

      {/* Page content */}
      <div className="w-full h-full overflow-y-auto pt-10" style={{ background: '#06060e' }}>
        {PageComponent ? (
          <Suspense fallback={<BubbleLoader color={module.color} />}>
            <PageComponent />
          </Suspense>
        ) : (
          <BubbleLoader color={module.color} />
        )}
      </div>
    </motion.div>
  );
}

// ━━━ BUBBLE PORTAL — Multi-screen horizontal rolling overlay ━━━
export default function BubblePortal({ activeBubbles, onCloseBubble, onCloseAll, originPosition }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Track scroll position for globe-like curvature
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const idx = Math.round(scrollLeft / clientWidth);
    setCurrentIndex(idx);
  }, []);

  // Navigate to specific bubble
  const scrollTo = useCallback((index) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: index * scrollRef.current.clientWidth, behavior: 'smooth' });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { onCloseAll(); return; }
      if (e.key === 'ArrowRight') scrollTo(Math.min(currentIndex + 1, activeBubbles.length - 1));
      if (e.key === 'ArrowLeft') scrollTo(Math.max(currentIndex - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, activeBubbles.length, onCloseAll, scrollTo]);

  if (activeBubbles.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[500]"
        style={{ background: '#06060e' }}
        initial={{
          clipPath: originPosition
            ? `circle(60px at ${originPosition.x}px ${originPosition.y}px)`
            : 'circle(0% at 50% 50%)',
          opacity: 0.5,
        }}
        animate={{
          clipPath: 'circle(150% at 50% 50%)',
          opacity: 1,
        }}
        exit={{
          clipPath: originPosition
            ? `circle(0px at ${originPosition.x}px ${originPosition.y}px)`
            : 'circle(0% at 50% 50%)',
          opacity: 0,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        data-testid="bubble-portal"
      >
        {/* Horizontal scroll container with snap */}
        <div
          ref={scrollRef}
          className="w-full h-full flex overflow-x-auto"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={handleScroll}
          data-testid="bubble-scroll-container"
        >
          {activeBubbles.map((mod, i) => (
            <BubbleView
              key={mod.id}
              module={mod}
              isActive={i === currentIndex}
              onClose={onCloseBubble}
            />
          ))}
        </div>

        {/* Navigation dots + controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30"
          data-testid="bubble-nav-dots">
          {/* Left arrow */}
          {activeBubbles.length > 1 && currentIndex > 0 && (
            <motion.button onClick={() => scrollTo(currentIndex - 1)}
              className="p-1.5 rounded-full cursor-pointer"
              style={{ background: 'rgba(248,250,252,0.06)', border: '1px solid rgba(248,250,252,0.08)' }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              data-testid="bubble-nav-left">
              <ChevronLeft size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
            </motion.button>
          )}

          {/* Dots */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}>
            {activeBubbles.map((mod, i) => (
              <motion.button key={mod.id}
                className="rounded-full cursor-pointer"
                style={{
                  width: i === currentIndex ? 16 : 6,
                  height: 6,
                  background: i === currentIndex ? mod.color : 'rgba(248,250,252,0.12)',
                  boxShadow: i === currentIndex ? `0 0 8px ${mod.color}40` : 'none',
                }}
                animate={{ width: i === currentIndex ? 16 : 6 }}
                transition={{ duration: 0.2 }}
                onClick={() => scrollTo(i)}
                data-testid={`bubble-dot-${mod.id}`}
              />
            ))}
          </div>

          {/* Right arrow */}
          {activeBubbles.length > 1 && currentIndex < activeBubbles.length - 1 && (
            <motion.button onClick={() => scrollTo(currentIndex + 1)}
              className="p-1.5 rounded-full cursor-pointer"
              style={{ background: 'rgba(248,250,252,0.06)', border: '1px solid rgba(248,250,252,0.08)' }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              data-testid="bubble-nav-right">
              <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
            </motion.button>
          )}

          {/* Close all */}
          <motion.button onClick={onCloseAll}
            className="p-1.5 rounded-full cursor-pointer ml-2"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            data-testid="bubble-close-all">
            <Minimize2 size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </motion.button>
        </div>

        {/* Globe curvature overlay — subtle perspective effect */}
        <div className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)',
          }} />
      </motion.div>
    </AnimatePresence>
  );
}
