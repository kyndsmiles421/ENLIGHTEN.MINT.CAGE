import React, { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Minimize2 } from 'lucide-react';
import { getBubbleExpandDuration } from '../pages/SuanpanPhysics';

// Lazy-load target pages for each module
const PAGE_MAP = {
  mixer: lazy(() => import('../pages/SuanpanMixer')),
  trade: lazy(() => import('../pages/TradeCircle')),
  starchart: lazy(() => import('../pages/StarChart')),
  meditation: lazy(() => import('../pages/Meditation')),
  wellness: lazy(() => import('../pages/Frequencies')),
};

// ━━━ Web Audio Expansion Tone ━━━
// Tier 1: Quick high-pitch chime (2000Hz, 200ms)
// Tier 4: Deep bass rumble (60Hz, 600ms, oscillating)
function playExpansionTone(masteryTier = 0) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = Math.min(4, Math.max(0, masteryTier)) / 4; // 0→1

    // Frequency: 2000Hz (tier 0) → 60Hz (tier 4)
    const baseFreq = 2000 - t * 1940;
    // Duration: 200ms (tier 0) → 600ms (tier 4)
    const duration = 0.2 + t * 0.4;
    // Gain: lighter at tier 0, fuller at tier 4
    const maxGain = 0.08 + t * 0.12;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Tier 0-1: sine (clean chime), Tier 3-4: triangle (warmer rumble)
    osc.type = t < 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    // Higher tiers: frequency sweep downward for bass rumble effect
    if (t > 0.3) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(30, baseFreq * 0.4), ctx.currentTime + duration * 0.8
      );
    }

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);

    // Higher tiers: add sub-bass harmonic
    if (t > 0.5) {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.type = 'sine';
      sub.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);
      sub.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
      subGain.gain.setValueAtTime(0, ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(maxGain * 0.6, ctx.currentTime + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      sub.start(ctx.currentTime);
      sub.stop(ctx.currentTime + duration + 0.05);
    }

    setTimeout(() => ctx.close(), (duration + 0.2) * 1000);
  } catch {}
}

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
      {/* Curved edge vignette — spherical distortion reminder */}
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

// ━━━ BUBBLE PORTAL — Tiered Multi-screen expansion overlay ━━━
export default function BubblePortal({ activeBubbles, onCloseBubble, onCloseAll, originPosition, masteryTier = 0 }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const soundPlayedRef = useRef(false);

  // Tiered expansion duration
  const expandDuration = getBubbleExpandDuration(masteryTier) / 1000; // seconds

  // Play expansion tone on mount
  useEffect(() => {
    if (activeBubbles.length > 0 && !soundPlayedRef.current) {
      playExpansionTone(masteryTier);
      soundPlayedRef.current = true;
      // Tiered haptic: short snap (T1) vs deep rumble (T4)
      const hapticDuration = 20 + masteryTier * 15;
      if (navigator.vibrate) navigator.vibrate([hapticDuration, 10, hapticDuration * 0.5]);
    }
    if (activeBubbles.length === 0) soundPlayedRef.current = false;
  }, [activeBubbles.length, masteryTier]);

  // Track scroll position
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
    if (activeBubbles.length === 0) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { onCloseAll(); return; }
      if (e.key === 'ArrowRight') scrollTo(Math.min(currentIndex + 1, activeBubbles.length - 1));
      if (e.key === 'ArrowLeft') scrollTo(Math.max(currentIndex - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, activeBubbles.length, onCloseAll, scrollTo]);

  if (activeBubbles.length === 0) return null;

  // Tiered easing: T1 = snappy, T4 = cinematic
  const tierT = Math.min(4, Math.max(0, masteryTier)) / 4;
  const easing = tierT < 0.3
    ? [0.25, 1, 0.5, 1]       // Snappy ease-out
    : [0.16, 1, 0.3, 1];      // Cinematic ease-out

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
        transition={{ duration: expandDuration, ease: easing }}
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
          {activeBubbles.length > 1 && currentIndex > 0 && (
            <motion.button onClick={() => scrollTo(currentIndex - 1)}
              className="p-1.5 rounded-full cursor-pointer"
              style={{ background: 'rgba(248,250,252,0.06)', border: '1px solid rgba(248,250,252,0.08)' }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              data-testid="bubble-nav-left">
              <ChevronLeft size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
            </motion.button>
          )}

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

          {activeBubbles.length > 1 && currentIndex < activeBubbles.length - 1 && (
            <motion.button onClick={() => scrollTo(currentIndex + 1)}
              className="p-1.5 rounded-full cursor-pointer"
              style={{ background: 'rgba(248,250,252,0.06)', border: '1px solid rgba(248,250,252,0.08)' }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              data-testid="bubble-nav-right">
              <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
            </motion.button>
          )}

          <motion.button onClick={onCloseAll}
            className="p-1.5 rounded-full cursor-pointer ml-2"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            data-testid="bubble-close-all">
            <Minimize2 size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </motion.button>
        </div>

        {/* Globe curvature vignette overlay */}
        <div className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)',
          }} />
      </motion.div>
    </AnimatePresence>
  );
}
