import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NebulaSphere from './NebulaSphere';
import { useSovereign } from '../context/SovereignContext';
import { detectResonance, PROXIMITY_THRESHOLD } from '../pages/SuanpanPhysics';
import { toast } from 'sonner';

const GRAVITY_WELL_RADIUS = 180;

// Cross-domain injection map
const INJECTION_MAP = {
  starchart: { label: 'Star Chart Sync', description: 'Frequencies re-tuned to planetary alignments', eventType: 'starchart_injection' },
  trade: { label: 'Trade Injection', description: 'NPU Burst mode activated for this session', eventType: 'trade_injection' },
  meditation: { label: 'Meditation Layer', description: '8D Binaural Stellar Wash injected', eventType: 'meditation_injection' },
  wellness: { label: 'Phonic Resonance', description: 'AI phonic resonance synchronized', eventType: 'wellness_injection' },
};

// ━━━ Supernova Collision Pulse ━━━
function SupernovaPulse({ position, color, onComplete }) {
  return (
    <motion.div className="fixed pointer-events-none z-[300]"
      style={{ left: position.x - 120, top: position.y - 120, width: 240, height: 240 }}
      initial={{ opacity: 1, scale: 0.1 }} animate={{ opacity: 0, scale: 3.5 }}
      transition={{ duration: 1.5, ease: 'easeOut' }} onAnimationComplete={onComplete}
      data-testid="supernova-pulse">
      <div className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}50 0%, ${color}20 30%, transparent 70%)`, filter: 'blur(8px)' }} />
      <motion.div className="absolute inset-[25%] rounded-full"
        style={{ background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)` }}
        initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />
      <motion.div className="absolute inset-[5%] rounded-full border-2"
        style={{ borderColor: `${color}80` }}
        initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }} />
      {/* Secondary shockwave ring */}
      <motion.div className="absolute inset-[15%] rounded-full border"
        style={{ borderColor: `${color}40` }}
        initial={{ scale: 0.5, opacity: 0.8 }} animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} />
    </motion.div>
  );
}

// ━━━ Resonance Tether — Glowing line between compatible spheres ━━━
function ResonanceTether({ posA, posB, colorA, colorB, intensity }) {
  const midX = (posA.x + posB.x) / 2;
  const midY = (posA.y + posB.y) / 2;
  const alpha = Math.round(intensity * 80).toString(16).padStart(2, '0');

  return (
    <svg className="fixed top-0 left-0 pointer-events-none" style={{ width: '100vw', height: '100vh', zIndex: 179 }}
      data-testid="resonance-tether">
      <defs>
        <linearGradient id={`res-${colorA.replace('#','')}-${colorB.replace('#','')}`}>
          <stop offset="0%" stopColor={colorA} stopOpacity={intensity * 0.5} />
          <stop offset="100%" stopColor={colorB} stopOpacity={intensity * 0.5} />
        </linearGradient>
      </defs>
      <line x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
        stroke={`url(#res-${colorA.replace('#','')}-${colorB.replace('#','')})`}
        strokeWidth={1 + intensity * 2} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 ${intensity * 6}px ${colorA}40)` }} />
      {/* Midpoint resonance node */}
      <circle cx={midX} cy={midY} r={3 + intensity * 4} fill={`${colorA}${alpha}`}
        style={{ filter: `drop-shadow(0 0 8px ${colorA})` }}>
        <animate attributeName="r" values={`${3 + intensity * 2};${5 + intensity * 4};${3 + intensity * 2}`}
          dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ━━━ Gravity Well Indicator (enhanced with intensity) ━━━
function GravityWellIndicator({ position, radius, active, intensity = 0 }) {
  if (!active) return null;
  return (
    <motion.div className="fixed pointer-events-none z-[175]"
      style={{ left: position.x - radius, top: position.y - radius, width: radius * 2, height: radius * 2 }}
      data-testid="gravity-well-indicator">
      {/* Outer pull field */}
      <motion.div className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(192,132,252,${0.03 + intensity * 0.05}) 0%, transparent 70%)`,
          border: '1px dashed rgba(192,132,252,0.08)',
        }}
        animate={{ rotate: 360, scale: [1, 1.02, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }} />
      {/* Inner attraction ring — intensifies when spheres approach */}
      <motion.div className="absolute inset-[25%] rounded-full"
        style={{ border: `${1 + intensity * 2}px solid rgba(192,132,252,${0.12 + intensity * 0.2})` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
      {/* Core — pulses stronger with proximity */}
      <motion.div className="absolute inset-[40%] rounded-full"
        style={{ background: `radial-gradient(circle, rgba(192,132,252,${0.08 + intensity * 0.15}) 0%, transparent 100%)` }}
        animate={{ scale: [1, 1.3 + intensity * 0.3, 1], opacity: [0.3, 0.6 + intensity * 0.3, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }} />
      {/* Inner snap zone ring */}
      <motion.div className="absolute inset-[55%] rounded-full"
        style={{ border: `1px solid rgba(234,179,8,${0.05 + intensity * 0.15})` }}
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
    </motion.div>
  );
}

// ━━━ NEBULA PLAYGROUND — Sphere Orchestration Layer ━━━
export default function NebulaPlayground({ detachedModules, onModuleReattach, launchVelocities = {},
  gravityMultiplier = 1.0, bloomMultiplier = 1.0, onBubbleActivate = null }) {
  const { publishEvent, enqueue, setNpuBurst, eventBus } = useSovereign();
  const [spherePositions, setSpherePositions] = useState({});
  const [supernovae, setSupernovae] = useState([]);
  const [mergedModules, setMergedModules] = useState([]);
  const [resonances, setResonances] = useState([]);
  const [vacuumActive, setVacuumActive] = useState(false);
  const [wellIntensity, setWellIntensity] = useState(0);
  const resonanceTimerRef = useRef(null);

  // Gravity well — center of viewport
  const [gravityWell, setGravityWell] = useState(null);
  useEffect(() => {
    const update = () => setGravityWell({ x: window.innerWidth / 2, y: window.innerHeight / 2, radius: GRAVITY_WELL_RADIUS });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Set initial positions — scattered below crossbar, away from vacuum zone
  useEffect(() => {
    detachedModules.forEach((mod, i) => {
      if (!spherePositions[mod.id]) {
        const angle = (i / Math.max(1, detachedModules.length)) * Math.PI * 1.5 + Math.PI * 0.25;
        const r = 180 + Math.random() * 80;
        setSpherePositions(prev => ({
          ...prev,
          [mod.id]: {
            x: window.innerWidth / 2 + Math.cos(angle) * r - 60,
            y: Math.max(200, window.innerHeight / 2 + Math.sin(angle) * r - 60),
          },
        }));
      }
    });
  }, [detachedModules]);

  // Resonance detection — runs every 200ms
  useEffect(() => {
    resonanceTimerRef.current = setInterval(() => {
      const activeIds = detachedModules.filter(m => !mergedModules.includes(m.id)).map(m => m.id);
      if (activeIds.length < 2) { setResonances([]); return; }
      const detected = detectResonance(spherePositions, activeIds);
      setResonances(detected);

      // Update well intensity based on closest sphere
      let maxIntensity = 0;
      Object.values(spherePositions).forEach(pos => {
        if (!gravityWell) return;
        const dx = pos.x - gravityWell.x + 60;
        const dy = pos.y - gravityWell.y + 60;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const intensity = Math.max(0, 1 - dist / GRAVITY_WELL_RADIUS);
        maxIntensity = Math.max(maxIntensity, intensity);
      });
      setWellIntensity(maxIntensity);

      // Check if any sphere is near crossbar (vacuum zone)
      const nearTop = Object.values(spherePositions).some(p => p.y < 80);
      setVacuumActive(nearTop);
    }, 200);
    return () => clearInterval(resonanceTimerRef.current);
  }, [detachedModules, mergedModules, spherePositions, gravityWell]);

  // Handle sphere drop into gravity well
  const handleDrop = useCallback((module) => {
    if (mergedModules.includes(module.id)) return;
    const injection = INJECTION_MAP[module.id];
    if (!injection) return;

    setSupernovae(prev => [...prev, { id: `sn-${Date.now()}`, position: gravityWell, color: module.color }]);
    if (navigator.vibrate) navigator.vibrate([50, 30, 80, 20, 100]);

    enqueue({
      execute: async () => {
        publishEvent(injection.eventType, { module_id: module.id, label: module.label, merged_at: Date.now() });
        eventBus.publish('mixer_command', { action: 'sphere_merge', module_id: module.id, injection_type: injection.eventType });
      },
      label: `sphere-merge-${module.id}`,
    }, 'critical');

    setNpuBurst(true);
    setTimeout(() => setNpuBurst(false), 2000);

    setMergedModules(prev => [...prev, module.id]);
    toast.success(`${injection.label}: ${injection.description}`, { duration: 3000 });

    setTimeout(() => {
      onModuleReattach(module);
      setMergedModules(prev => prev.filter(id => id !== module.id));
      setSpherePositions(prev => { const n = { ...prev }; delete n[module.id]; return n; });
    }, 1500);
  }, [gravityWell, mergedModules, enqueue, publishEvent, eventBus, setNpuBurst, onModuleReattach]);

  // Handle vacuum catch — sphere tossed back to crossbar
  const handleVacuumCatch = useCallback((module) => {
    if (navigator.vibrate) navigator.vibrate([20, 10, 40]);
    toast(`${module.label} returned to Crossbar`, { duration: 1500 });
    onModuleReattach(module);
    setSpherePositions(prev => { const n = { ...prev }; delete n[module.id]; return n; });
  }, [onModuleReattach]);

  const handlePositionChange = useCallback((moduleId, x, y) => {
    setSpherePositions(prev => ({ ...prev, [moduleId]: { x, y } }));
  }, []);

  const activeSpheres = detachedModules.filter(m => !mergedModules.includes(m.id));
  const moduleMap = Object.fromEntries(detachedModules.map(m => [m.id, m]));

  if (activeSpheres.length === 0 && supernovae.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[180] pointer-events-none" data-testid="nebula-playground">

      {/* Gravity Well indicator */}
      {activeSpheres.length > 0 && gravityWell && (
        <GravityWellIndicator position={gravityWell} radius={GRAVITY_WELL_RADIUS} active={true} intensity={wellIntensity} />
      )}

      {/* Resonance tethers between compatible spheres */}
      {resonances.map((res, i) => {
        const posA = spherePositions[res.a];
        const posB = spherePositions[res.b];
        const modA = moduleMap[res.a];
        const modB = moduleMap[res.b];
        if (!posA || !posB || !modA || !modB) return null;
        return (
          <ResonanceTether key={`res-${i}`}
            posA={posA} posB={posB}
            colorA={modA.color} colorB={modB.color}
            intensity={res.intensity} />
        );
      })}

      {/* Floating Nebula Spheres */}
      <AnimatePresence>
        {activeSpheres.map(mod => {
          // Find resonance data for this sphere
          const myResonance = resonances.find(r => r.a === mod.id || r.b === mod.id);
          let resonatingWith = null;
          if (myResonance) {
            const otherId = myResonance.a === mod.id ? myResonance.b : myResonance.a;
            const otherMod = moduleMap[otherId];
            if (otherMod) {
              resonatingWith = { color: otherMod.color, intensity: myResonance.intensity };
            }
          }

          return (
            <NebulaSphere key={mod.id} module={mod} size={120}
              position={spherePositions[mod.id] || { x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 60 }}
              priority={mod.priority} onDrop={handleDrop} gravityWell={gravityWell}
              onPositionChange={(x, y) => handlePositionChange(mod.id, x, y)}
              onVacuumCatch={handleVacuumCatch}
              resonatingWith={resonatingWith}
              launchVelocity={launchVelocities[mod.id]}
              gravityMultiplier={gravityMultiplier}
              bloomMultiplier={bloomMultiplier}
              onBubbleActivate={onBubbleActivate} />
          );
        })}
      </AnimatePresence>

      {/* Supernova collision pulses */}
      <AnimatePresence>
        {supernovae.map(sn => (
          <SupernovaPulse key={sn.id} position={sn.position} color={sn.color}
            onComplete={() => setSupernovae(prev => prev.filter(s => s.id !== sn.id))} />
        ))}
      </AnimatePresence>

      {/* Instructional hint */}
      {activeSpheres.length > 0 && (
        <motion.div className="fixed bottom-32 left-1/2 -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2 }}>
          <p className="text-[8px] tracking-widest uppercase text-center" style={{ color: 'rgba(248,250,252,0.15)' }}>
            {activeSpheres.length > 1
              ? 'Compatible spheres resonate together. Drop into center to merge with Mixer. Toss up to retract.'
              : 'Drag sphere into center to merge. Toss upward to return to Crossbar.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export { GRAVITY_WELL_RADIUS };
