import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NebulaSphere from './NebulaSphere';
import { useSovereign } from '../context/SovereignContext';
import { toast } from 'sonner';

const GRAVITY_WELL_RADIUS = 160;

// Cross-domain injection map — what happens when each module merges with the Mixer
const INJECTION_MAP = {
  starchart: {
    label: 'Star Chart Sync',
    description: 'Frequencies re-tuned to planetary alignments',
    eventType: 'starchart_injection',
  },
  trade: {
    label: 'Trade Injection',
    description: 'NPU Burst mode activated for this session',
    eventType: 'trade_injection',
  },
  meditation: {
    label: 'Meditation Layer',
    description: '8D Binaural Stellar Wash injected',
    eventType: 'meditation_injection',
  },
  wellness: {
    label: 'Phonic Resonance',
    description: 'AI phonic resonance synchronized',
    eventType: 'wellness_injection',
  },
};

// ━━━ Supernova Collision Pulse ━━━
function SupernovaPulse({ position, color, onComplete }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-[300]"
      style={{
        left: position.x - 100,
        top: position.y - 100,
        width: 200,
        height: 200,
      }}
      initial={{ opacity: 1, scale: 0.2 }}
      animate={{ opacity: 0, scale: 3 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      data-testid="supernova-pulse"
    >
      {/* Outer shockwave */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, ${color}15 40%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />
      {/* Inner flash */}
      <motion.div
        className="absolute inset-[30%] rounded-full"
        style={{ background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)` }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      {/* Light ring expansion */}
      <motion.div
        className="absolute inset-[10%] rounded-full border-2"
        style={{ borderColor: `${color}60` }}
        initial={{ scale: 0.3, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

// ━━━ Gravity Well Indicator (around Mixer sphere) ━━━
function GravityWellIndicator({ position, radius, active }) {
  if (!active) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[190]"
      style={{
        left: position.x - radius,
        top: position.y - radius,
        width: radius * 2,
        height: radius * 2,
      }}
      data-testid="gravity-well-indicator"
    >
      {/* Outer pull field */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192,132,252,0.03) 0%, transparent 70%)',
          border: '1px dashed rgba(192,132,252,0.08)',
        }}
        animate={{ rotate: 360, scale: [1, 1.02, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }}
      />
      {/* Inner attraction ring */}
      <motion.div
        className="absolute inset-[25%] rounded-full"
        style={{ border: '1px solid rgba(192,132,252,0.12)' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center core */}
      <motion.div
        className="absolute inset-[40%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 100%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

// ━━━ NEBULA PLAYGROUND — Sphere Orchestration Layer ━━━
export default function NebulaPlayground({ detachedModules, onModuleReattach }) {
  const { publishEvent, enqueue, setNpuBurst, eventBus } = useSovereign();
  const [spherePositions, setSpherePositions] = useState({});
  const [supernovae, setSupernovae] = useState([]);
  const [mergedModules, setMergedModules] = useState([]);
  const containerRef = useRef(null);

  // Mixer as gravity well — center of the screen
  const [gravityWell, setGravityWell] = useState(null);

  useEffect(() => {
    const updateCenter = () => {
      setGravityWell({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        radius: GRAVITY_WELL_RADIUS,
      });
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  // Set initial positions for detached modules — spread around center
  useEffect(() => {
    detachedModules.forEach((mod, i) => {
      if (!spherePositions[mod.id]) {
        const angle = (i / detachedModules.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 200 + Math.random() * 100;
        setSpherePositions(prev => ({
          ...prev,
          [mod.id]: {
            x: window.innerWidth / 2 + Math.cos(angle) * radius - 60,
            y: window.innerHeight / 2 + Math.sin(angle) * radius - 60,
          },
        }));
      }
    });
  }, [detachedModules]);

  // Handle sphere drop into gravity well (Mixer)
  const handleDrop = useCallback((module) => {
    if (mergedModules.includes(module.id)) return;

    const injection = INJECTION_MAP[module.id];
    if (!injection) return;

    // Trigger supernova visual
    setSupernovae(prev => [...prev, {
      id: `sn-${Date.now()}`,
      position: gravityWell,
      color: module.color,
    }]);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([50, 30, 80]);

    // Cross-domain injection via Priority Queue — Priority 1 (critical)
    enqueue({
      execute: async () => {
        publishEvent(injection.eventType, {
          module_id: module.id,
          label: module.label,
          merged_at: Date.now(),
        });
        // Trigger mixer_command for cross-domain effect
        eventBus.publish('mixer_command', {
          action: 'sphere_merge',
          module_id: module.id,
          injection_type: injection.eventType,
        });
      },
      label: `sphere-merge-${module.id}`,
    }, 'critical');

    // NPU Burst for 2 seconds during merge
    setNpuBurst(true);
    setTimeout(() => setNpuBurst(false), 2000);

    // Mark as merged and toast
    setMergedModules(prev => [...prev, module.id]);
    toast.success(
      `${injection.label}: ${injection.description}`,
      { duration: 3000 }
    );

    // Reattach after merge animation
    setTimeout(() => {
      onModuleReattach(module);
      setMergedModules(prev => prev.filter(id => id !== module.id));
      setSpherePositions(prev => {
        const next = { ...prev };
        delete next[module.id];
        return next;
      });
    }, 1500);
  }, [gravityWell, mergedModules, enqueue, publishEvent, eventBus, setNpuBurst, onModuleReattach]);

  const handlePositionChange = useCallback((moduleId, x, y) => {
    setSpherePositions(prev => ({ ...prev, [moduleId]: { x, y } }));
  }, []);

  const activeSpheres = detachedModules.filter(m => !mergedModules.includes(m.id));

  if (activeSpheres.length === 0 && supernovae.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[180] pointer-events-none"
      data-testid="nebula-playground"
    >
      {/* Gravity Well indicator — shows when spheres are detached */}
      {activeSpheres.length > 0 && gravityWell && (
        <GravityWellIndicator
          position={gravityWell}
          radius={GRAVITY_WELL_RADIUS}
          active={true}
        />
      )}

      {/* Floating Nebula Spheres */}
      <AnimatePresence>
        {activeSpheres.map(mod => (
          <NebulaSphere
            key={mod.id}
            module={mod}
            size={120}
            position={spherePositions[mod.id] || { x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 60 }}
            priority={mod.priority}
            onDrop={handleDrop}
            gravityWell={gravityWell}
            onPositionChange={(x, y) => handlePositionChange(mod.id, x, y)}
          />
        ))}
      </AnimatePresence>

      {/* Supernova collision pulses */}
      <AnimatePresence>
        {supernovae.map(sn => (
          <SupernovaPulse
            key={sn.id}
            position={sn.position}
            color={sn.color}
            onComplete={() => setSupernovae(prev => prev.filter(s => s.id !== sn.id))}
          />
        ))}
      </AnimatePresence>

      {/* Instructional hint */}
      {activeSpheres.length > 0 && (
        <motion.div
          className="fixed bottom-32 left-1/2 -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 2 }}
        >
          <p className="text-[8px] tracking-widest uppercase text-center"
            style={{ color: 'rgba(248,250,252,0.15)' }}>
            Drag spheres into the center to merge with the Mixer
          </p>
        </motion.div>
      )}
    </div>
  );
}
