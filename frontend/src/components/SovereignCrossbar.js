import React, { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useSovereign } from '../context/SovereignContext';
import { calcRepulsionLaunch } from '../pages/SuanpanPhysics';
import {
  Music, Globe, Sparkles, Brain, Heart,
  Compass, Zap, Activity,
} from 'lucide-react';

const SNAP_THRESHOLD = 150;

// Module definitions — each becomes a "pole" on the crossbar
const CROSSBAR_MODULES = [
  { id: 'mixer', label: 'Divine Director', icon: Music, color: '#C084FC', route: '/suanpan', priority: 0, mass: 3.0 },
  { id: 'trade', label: 'Trade Circle', icon: Globe, color: '#2DD4BF', route: '/trade-circle', priority: 1, mass: 1.8 },
  { id: 'starchart', label: 'Star Charts', icon: Sparkles, color: '#818CF8', route: '/star-chart', priority: 1, mass: 2.2 },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: '#60A5FA', route: '/meditation', priority: 2, mass: 1.2 },
  { id: 'wellness', label: 'Wellness', icon: Heart, color: '#22C55E', route: '/frequencies', priority: 2, mass: 1.0 },
];

// ━━━ Luminous Tether — Elastic light string between Crossbar and dragging module ━━━
function LuminousTether({ startX, startY, endX, endY, color, tension, snapped }) {
  if (snapped) return null;
  const midX = (startX + endX) / 2 + (Math.sin(tension * Math.PI) * 15);
  const midY = (startY + endY) / 2;
  const alpha = Math.max(0.1, 1 - tension * 0.6);
  const width = Math.max(0.5, 2 - tension * 1.5);

  return (
    <svg
      className="fixed top-0 left-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh', zIndex: 195 }}
      data-testid="luminous-tether"
    >
      <defs>
        <linearGradient id={`tether-grad-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={alpha} />
          <stop offset="50%" stopColor={color} stopOpacity={alpha * 0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={alpha * 0.3} />
        </linearGradient>
        <filter id="tether-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Main tether line */}
      <path
        d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
        stroke={`url(#tether-grad-${color.replace('#','')})`}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        filter="url(#tether-glow)"
      />
      {/* Tension particles along tether */}
      {tension > 0.3 && Array.from({ length: 3 }).map((_, i) => {
        const t = (i + 1) / 4;
        const px = startX * (1 - t) * (1 - t) + 2 * midX * t * (1 - t) + endX * t * t;
        const py = startY * (1 - t) * (1 - t) + 2 * midY * t * (1 - t) + endY * t * t;
        return (
          <circle key={i} cx={px} cy={py} r={1.5 + tension}
            fill={color} opacity={0.4 + tension * 0.3}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
        );
      })}
    </svg>
  );
}

// ━━━ Tether Breakaway Bloom — Particle shower on detach ━━━
function TetherBreakaway({ position, color, onComplete }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-[196]"
      style={{ left: position.x - 40, top: position.y - 40, width: 80, height: 80 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onComplete}
      data-testid="tether-breakaway"
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 20 + Math.random() * 25;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3, height: 3, left: 40, top: 40,
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        );
      })}
    </motion.div>
  );
}

// ━━━ Individual Pole Module with Repulsion Launch ━━━
function PoleModule({ module, onDetach, isDetached, crossbarRect }) {
  const dragY = useMotionValue(0);
  const [currentDragY, setCurrentDragY] = useState(0);
  const [snapped, setSnapped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [moduleCenter, setModuleCenter] = useState({ x: 0, y: 0 });
  const hapticFired = useRef(false);
  const moduleRef = useRef(null);
  const Icon = module.icon;

  const springY = useSpring(dragY, { stiffness: 400, damping: 30, mass: module.mass || 1 });
  const scale = useTransform(springY, [0, SNAP_THRESHOLD], [1, 1.15]);

  const triggerHaptic = useCallback((pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern || 25);
  }, []);

  const handleDragStart = useCallback(() => {
    setDragging(true);
    if (moduleRef.current) {
      const rect = moduleRef.current.getBoundingClientRect();
      setModuleCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, []);

  const handleDrag = useCallback((_, info) => {
    const y = Math.max(0, info.offset.y);
    setCurrentDragY(y);

    // Update tether endpoint
    if (moduleRef.current) {
      const rect = moduleRef.current.getBoundingClientRect();
      setModuleCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + y });
    }

    if (y >= SNAP_THRESHOLD && !hapticFired.current) {
      hapticFired.current = true;
      triggerHaptic([15, 10, 30]); // Sharp snap haptic
      setSnapped(true);
    }
  }, [triggerHaptic]);

  const handleDragEnd = useCallback(() => {
    setDragging(false);
    if (snapped) {
      // Calculate repulsion launch velocity
      const launch = calcRepulsionLaunch(currentDragY);
      onDetach(module, launch);
      triggerHaptic([50, 20, 80]); // Deep launch haptic
    } else {
      setCurrentDragY(0);
    }
    hapticFired.current = false;
    setSnapped(false);
  }, [snapped, module, onDetach, triggerHaptic, currentDragY]);

  if (isDetached) return null;

  const tension = Math.min(currentDragY / SNAP_THRESHOLD, 1);
  const anchorX = moduleCenter.x || 0;
  const anchorY = crossbarRect?.bottom || 50;

  return (
    <div className="relative flex flex-col items-center" ref={moduleRef} data-testid={`pole-module-${module.id}`}>
      {/* Luminous Tether — visible during drag */}
      {dragging && !snapped && anchorX > 0 && (
        <LuminousTether
          startX={anchorX}
          startY={anchorY}
          endX={anchorX}
          endY={anchorY + currentDragY}
          color={module.color}
          tension={tension}
          snapped={snapped}
        />
      )}

      <motion.div
        className="flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing select-none"
        drag="y"
        dragConstraints={{ top: 0, bottom: SNAP_THRESHOLD + 50 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ scale, y: springY }}
        whileHover={{ scale: 1.05 }}
        data-testid={`pole-drag-${module.id}`}
      >
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center relative"
          style={{
            background: `${module.color}12`,
            border: `1px solid ${module.color}${snapped ? '60' : '25'}`,
            boxShadow: snapped
              ? `0 0 20px ${module.color}40, 0 0 40px ${module.color}20`
              : dragging
                ? `0 0 ${8 + tension * 16}px ${module.color}${Math.round(tension * 60).toString(16).padStart(2,'0')}`
                : `0 0 8px ${module.color}10`,
          }}
        >
          <Icon size={14} style={{ color: module.color }} />
          {/* Snap indicator ring */}
          {dragging && currentDragY > SNAP_THRESHOLD * 0.7 && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2"
              style={{ borderColor: module.color }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </motion.div>
        <span
          className="text-[6px] font-medium tracking-wider uppercase whitespace-nowrap"
          style={{ color: `${module.color}80` }}
        >
          {module.label}
        </span>
        {/* Mass indicator */}
        {dragging && (
          <motion.span
            className="text-[5px] font-mono"
            style={{ color: `${module.color}40` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {module.mass?.toFixed(1) || '1.0'}m
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

// ━━━ Vacuum Catch Zone — Visual indicator when sphere approaches crossbar ━━━
function VacuumZone({ active, color }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute -bottom-3 left-0 right-0 h-8 pointer-events-none"
      style={{
        background: `linear-gradient(to bottom, ${color}10, transparent)`,
      }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      data-testid="vacuum-catch-zone"
    />
  );
}

// ━━━ SOVEREIGN CROSSBAR — Main Component ━━━
export default function SovereignCrossbar({ onModuleDetach, detachedModules = [], vacuumActive = false }) {
  const { tier, tierName } = useSovereign();
  const [visible, setVisible] = useState(true);
  const [breakaways, setBreakways] = useState([]);
  const crossbarRef = useRef(null);
  const [crossbarRect, setCrossbarRect] = useState(null);

  // Track crossbar position for tether anchoring
  const updateRect = useCallback(() => {
    if (crossbarRef.current) {
      setCrossbarRect(crossbarRef.current.getBoundingClientRect());
    }
  }, []);

  const tierColors = {
    standard: '#94A3B8', apprentice: '#2DD4BF', artisan: '#C084FC', sovereign: '#EAB308',
  };
  const barColor = tierColors[tier] || '#94A3B8';

  const handleDetach = useCallback((module, launchVelocity) => {
    // Trigger breakaway bloom particles
    const rect = crossbarRef.current?.getBoundingClientRect();
    if (rect) {
      setBreakways(prev => [...prev, {
        id: `brk-${Date.now()}`,
        position: { x: rect.left + rect.width / 2, y: rect.bottom },
        color: module.color,
      }]);
    }
    if (onModuleDetach) onModuleDetach(module, launchVelocity);
  }, [onModuleDetach]);

  return (
    <motion.div
      className="fixed top-12 left-0 right-0 z-[200] flex items-center justify-center"
      initial={{ y: -60 }}
      animate={{ y: visible ? 0 : -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      data-testid="sovereign-crossbar"
      onAnimationComplete={updateRect}
    >
      <div
        ref={crossbarRef}
        className="w-full max-w-4xl mx-auto flex items-center justify-between px-6 py-2 relative"
        style={{
          background: 'rgba(6,6,14,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${barColor}15`,
          boxShadow: `0 4px 30px rgba(0,0,0,0.4), 0 1px 0 ${barColor}08`,
        }}
      >
        {/* Left: Sovereign badge */}
        <div className="flex items-center gap-2">
          <motion.div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${barColor}15`, border: `1px solid ${barColor}25` }}
            animate={{ boxShadow: [`0 0 8px ${barColor}20`, `0 0 16px ${barColor}30`, `0 0 8px ${barColor}20`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap size={10} style={{ color: barColor }} />
          </motion.div>
          <div>
            <p className="text-[7px] font-bold tracking-wider uppercase" style={{ color: barColor }}>
              {tierName}
            </p>
            <p className="text-[5px] tracking-widest uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>
              Sovereign Crossbar
            </p>
          </div>
        </div>

        {/* Center: Module Poles */}
        <div className="flex items-center gap-5">
          {CROSSBAR_MODULES.map(mod => (
            <PoleModule
              key={mod.id}
              module={mod}
              onDetach={handleDetach}
              isDetached={detachedModules.some(d => d.id === mod.id)}
              crossbarRect={crossbarRect}
            />
          ))}
        </div>

        {/* Right: Activity indicator */}
        <div className="flex items-center gap-2">
          <Activity size={10} style={{ color: 'rgba(248,250,252,0.2)' }} />
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ height: 8 + i * 3, background: `${barColor}${30 + i * 15}` }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Vacuum Catch Zone — glows when spheres approach top */}
        <VacuumZone active={vacuumActive} color={barColor} />

        {/* Decorative crossbar line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, ${barColor}30, transparent)` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Toggle */}
      <motion.button
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg cursor-pointer"
        style={{ background: 'rgba(6,6,14,0.9)', border: `1px solid ${barColor}15`, borderTop: 'none' }}
        onClick={() => setVisible(!visible)}
        whileHover={{ y: 2 }}
        data-testid="crossbar-toggle"
      >
        <Compass size={8} style={{
          color: `${barColor}60`,
          transform: visible ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.3s',
        }} />
      </motion.button>

      {/* Tether breakaway particles */}
      <AnimatePresence>
        {breakaways.map(brk => (
          <TetherBreakaway
            key={brk.id}
            position={brk.position}
            color={brk.color}
            onComplete={() => setBreakways(prev => prev.filter(b => b.id !== brk.id))}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export { CROSSBAR_MODULES };
