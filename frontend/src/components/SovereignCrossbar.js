import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useSovereign } from '../context/SovereignContext';
import {
  Music, Globe, Sparkles, Brain, Heart,
  Compass, Zap, Activity,
} from 'lucide-react';

const SNAP_THRESHOLD = 150;
const TENSION_QUADRATIC_K = 0.0044; // quadratic tension coefficient

// Module definitions — each becomes a "pole" on the crossbar
const CROSSBAR_MODULES = [
  { id: 'mixer', label: 'Divine Director', icon: Music, color: '#C084FC', route: '/suanpan', priority: 0 },
  { id: 'trade', label: 'Trade Circle', icon: Globe, color: '#2DD4BF', route: '/trade-circle', priority: 1 },
  { id: 'starchart', label: 'Star Charts', icon: Sparkles, color: '#818CF8', route: '/star-chart', priority: 1 },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: '#60A5FA', route: '/meditation', priority: 2 },
  { id: 'wellness', label: 'Wellness', icon: Heart, color: '#22C55E', route: '/frequencies', priority: 2 },
];

// ━━━ Elastic Pole SVG ━━━
function ElasticPole({ dragY, color, snapped }) {
  const tension = Math.min(dragY / SNAP_THRESHOLD, 1);
  const curveAmount = tension * 30;
  const poleLength = Math.max(0, dragY);

  if (poleLength < 2) return null;

  return (
    <svg
      width="40"
      height={poleLength + 10}
      className="absolute top-full left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ overflow: 'visible', zIndex: 40 }}
      data-testid="elastic-pole-svg"
    >
      {/* Main pole line with quadratic tension bend */}
      <path
        d={`M 20 0 Q ${20 + curveAmount} ${poleLength * 0.5} 20 ${poleLength}`}
        stroke={snapped ? 'transparent' : color}
        strokeWidth={snapped ? 0 : Math.max(1, 3 - tension * 2)}
        fill="none"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 ${4 + tension * 8}px ${color}60)`,
          opacity: snapped ? 0 : 1 - tension * 0.3,
        }}
      />
      {/* Tension glow at stretch point */}
      {tension > 0.5 && !snapped && (
        <circle
          cx="20"
          cy={poleLength}
          r={3 + tension * 4}
          fill={`${color}30`}
          style={{ filter: `blur(${tension * 3}px)` }}
        />
      )}
      {/* Snap indicator line */}
      {tension > 0.8 && !snapped && (
        <line
          x1="5" y1={SNAP_THRESHOLD}
          x2="35" y2={SNAP_THRESHOLD}
          stroke={`${color}40`}
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      )}
    </svg>
  );
}

// ━━━ Individual Pole Module ━━━
function PoleModule({ module, onDetach, isDetached }) {
  const dragY = useMotionValue(0);
  const [currentDragY, setCurrentDragY] = useState(0);
  const [snapped, setSnapped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hapticFired = useRef(false);
  const Icon = module.icon;

  const springY = useSpring(dragY, { stiffness: 400, damping: 30, mass: 0.8 });
  const scale = useTransform(springY, [0, SNAP_THRESHOLD], [1, 1.15]);
  const glow = useTransform(springY, [0, SNAP_THRESHOLD], [0, 1]);

  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(25);
  }, []);

  const handleDrag = useCallback((_, info) => {
    const y = Math.max(0, info.offset.y);
    setCurrentDragY(y);

    // Quadratic tension — force increases quadratically
    const tension = TENSION_QUADRATIC_K * y * y;

    if (y >= SNAP_THRESHOLD && !hapticFired.current) {
      hapticFired.current = true;
      triggerHaptic();
      setSnapped(true);
    }
  }, [triggerHaptic]);

  const handleDragEnd = useCallback(() => {
    setDragging(false);
    if (snapped) {
      onDetach(module);
      triggerHaptic();
    } else {
      setCurrentDragY(0);
    }
    hapticFired.current = false;
    setSnapped(false);
  }, [snapped, module, onDetach, triggerHaptic]);

  if (isDetached) return null;

  return (
    <div className="relative flex flex-col items-center" data-testid={`pole-module-${module.id}`}>
      <motion.div
        className="flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing select-none"
        drag="y"
        dragConstraints={{ top: 0, bottom: SNAP_THRESHOLD + 50 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
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
      </motion.div>

      {/* Elastic Pole visualization */}
      {dragging && (
        <ElasticPole
          dragY={currentDragY}
          color={module.color}
          snapped={snapped}
        />
      )}
    </div>
  );
}

// ━━━ SOVEREIGN CROSSBAR — Main Component ━━━
export default function SovereignCrossbar({ onModuleDetach, detachedModules = [] }) {
  const { tier, tierName } = useSovereign();
  const [visible, setVisible] = useState(true);

  const tierColors = {
    standard: '#94A3B8', apprentice: '#2DD4BF', artisan: '#C084FC', sovereign: '#EAB308',
  };
  const barColor = tierColors[tier] || '#94A3B8';

  const handleDetach = useCallback((module) => {
    if (onModuleDetach) onModuleDetach(module);
  }, [onModuleDetach]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center"
      initial={{ y: -60 }}
      animate={{ y: visible ? 0 : -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      data-testid="sovereign-crossbar"
    >
      {/* Crossbar background */}
      <div
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
                style={{
                  height: 8 + i * 3,
                  background: `${barColor}${30 + i * 15}`,
                }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Decorative crossbar line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${barColor}30, transparent)`,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Toggle visibility */}
      <motion.button
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg cursor-pointer"
        style={{
          background: 'rgba(6,6,14,0.9)',
          border: `1px solid ${barColor}15`,
          borderTop: 'none',
        }}
        onClick={() => setVisible(!visible)}
        whileHover={{ y: 2 }}
        data-testid="crossbar-toggle"
      >
        <Compass
          size={8}
          style={{
            color: `${barColor}60`,
            transform: visible ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
          }}
        />
      </motion.button>
    </motion.div>
  );
}

export { CROSSBAR_MODULES };
