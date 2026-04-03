import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, X, BookOpen, Eye, EyeOff, Flame, Compass, PenTool, Coins, Users } from 'lucide-react';
import { MODULE_GROUPS, getActiveModules, moduleRegistry, checkSynergy, getSynthesisName } from '../config/moduleRegistry';
import { useMixer, FREQUENCIES, SOUNDS, INSTRUMENT_DRONES } from '../context/MixerContext';
import { useFocus } from '../context/FocusContext';
import { useClass, CLASS_COLORS } from '../context/ClassContext';
import ConstellationPanel from './ConstellationPanel';
import CommunityPanel from './CommunityPanel';

/* ── Haptic helper with weight support ── */
let Haptics;
try { Haptics = require('@capacitor/haptics').Haptics; } catch {}
function haptic(style = 'Light') {
  try { Haptics?.impact({ style }); } catch {
    const ms = style === 'Heavy' ? 25 : style === 'Medium' ? 15 : 8;
    navigator.vibrate?.(ms);
  }
}
function hapticForWeight(weight = 'light') {
  haptic(weight === 'heavy' ? 'Heavy' : weight === 'medium' ? 'Medium' : 'Light');
}

const CLASS_ICONS = { shaman: Flame, nomad: Compass, architect: PenTool, merchant: Coins };

/* ── Constants ── */
const MAGNETIC_RADIUS = 75;
const SNAP_RADIUS = 50;
const PLAYER_SIZE = 100;
const BUBBLE_SIZE = 44;
const BUBBLE_SIZE_MOBILE = 52;

/* ── Orbital position calculator ── */
function getOrbitalPosition(index, total, radius, centerX, centerY, offsetAngle = -Math.PI / 2) {
  const angle = offsetAngle + (index / total) * 2 * Math.PI;
  return {
    x: centerX + Math.cos(angle) * radius - (window.innerWidth < 768 ? BUBBLE_SIZE_MOBILE : BUBBLE_SIZE) / 2,
    y: centerY + Math.sin(angle) * radius - (window.innerWidth < 768 ? BUBBLE_SIZE_MOBILE : BUBBLE_SIZE) / 2,
  };
}

/* ── Map registry module to MixerContext data ── */
function resolveModuleToMixerData(mod) {
  switch (mod.type) {
    case 'frequency':
      return { kind: 'freq', data: FREQUENCIES.find(f => f.hz === mod.hz) };
    case 'sound':
      return { kind: 'sound', data: SOUNDS.find(s => s.id === mod.soundId) };
    case 'instrument':
      return { kind: 'drone', data: INSTRUMENT_DRONES.find(d => d.id === mod.droneId) };
    default:
      return { kind: mod.type, data: null };
  }
}

/* ── Check if a module is currently active in the mixer ── */
function isModuleActive(mod, activeFreqs, activeSounds, activeDrones) {
  switch (mod.type) {
    case 'frequency': return activeFreqs.has(mod.hz);
    case 'sound': return activeSounds.has(mod.soundId);
    case 'instrument': return activeDrones.has(mod.droneId);
    default: return false;
  }
}

/* ══════════════════════════════════════════════
   DRAGGABLE BUBBLE
   ══════════════════════════════════════════════ */
function DraggableBubble({ mod, homePos, playerCenter, onActivate, isActive, isLocked, delay: enterDelay = 0, classBoosted, onDragPos }) {
  const [pos, setPos] = useState(homePos);
  const [dragging, setDragging] = useState(false);
  const [inMagneticZone, setInMagneticZone] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const hapticFired = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const pointerDownTime = useRef(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const size = isMobile ? BUBBLE_SIZE_MOBILE : BUBBLE_SIZE;

  // Reset home position when layout changes
  useEffect(() => {
    if (!dragging && !isActive) setPos(homePos);
  }, [homePos, dragging, isActive]);

  const getBubbleCenter = useCallback((p) => ({
    x: p.x + size / 2,
    y: p.y + size / 2,
  }), [size]);

  const getDistToPlayer = useCallback((p) => {
    const bc = getBubbleCenter(p);
    return Math.hypot(bc.x - playerCenter.x, bc.y - playerCenter.y);
  }, [getBubbleCenter, playerCenter]);

  const onPointerDown = useCallback((e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    hapticFired.current = false;
    dragMoved.current = false;
    pointerDownTime.current = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left,
      y: (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top,
    };
    hapticForWeight(mod.weight || 'light');
  }, [isLocked, mod.weight]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      if (cx == null) return;

      dragMoved.current = true;
      const container = document.querySelector('[data-orbital-container]');
      if (!container) return;
      const cr = container.getBoundingClientRect();

      const newPos = {
        x: cx - cr.left - dragOffset.current.x,
        y: cy - cr.top - dragOffset.current.y,
      };

      // Report drag position for synergy discovery
      if (onDragPos) onDragPos(mod.id, getBubbleCenter(newPos));

      const dist = getDistToPlayer(newPos);

      // Magnetic zone — pull towards center
      if (dist < MAGNETIC_RADIUS) {
        setInMagneticZone(true);
        if (!hapticFired.current) {
          haptic('Medium');
          hapticFired.current = true;
        }

        // Snap to center if very close
        if (dist < SNAP_RADIUS) {
          setSnapped(true);
          setPos({
            x: playerCenter.x - size / 2,
            y: playerCenter.y - size / 2,
          });
          return;
        }

        // Magnetic pull — lerp towards center
        const pull = 0.35;
        const targetX = playerCenter.x - size / 2;
        const targetY = playerCenter.y - size / 2;
        setPos({
          x: newPos.x + (targetX - newPos.x) * pull,
          y: newPos.y + (targetY - newPos.y) * pull,
        });
        setSnapped(false);
      } else {
        setInMagneticZone(false);
        setSnapped(false);
        hapticFired.current = false;
        setPos(newPos);
      }
    };

    const onUp = () => {
      setDragging(false);
      if (onDragPos) onDragPos(mod.id, null); // Clear drag position
      const elapsed = Date.now() - pointerDownTime.current;
      const wasTap = !dragMoved.current || elapsed < 200;

      if (wasTap) {
        // Tap-to-toggle: accessibility shortcut
        haptic('Medium');
        onActivate(mod);
        setInMagneticZone(false);
        setSnapped(false);
        setPos(homePos);
        return;
      }

      const dist = getDistToPlayer(pos);

      if (dist < MAGNETIC_RADIUS) {
        // Successful drop — activate module
        haptic('Heavy');
        onActivate(mod);
        setSnapped(false);
        setInMagneticZone(false);
        // Spring back to home after activation
        setTimeout(() => setPos(homePos), 300);
      } else {
        // Return home
        setInMagneticZone(false);
        setSnapped(false);
        setPos(homePos);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, pos, getDistToPlayer, playerCenter, size, mod, onActivate, homePos]);

  const glowIntensity = inMagneticZone ? (snapped ? 0.5 : 0.25) : (isActive ? 0.2 : (classBoosted ? 0.1 : 0));

  return (
    <motion.div
      className="absolute flex items-center justify-center rounded-full select-none"
      data-testid={`orbital-bubble-${mod.id}`}
      onPointerDown={onPointerDown}
      initial={{ opacity: 0, scale: 0.3, left: playerCenter.x - size / 2, top: playerCenter.y - size / 2 }}
      animate={{
        opacity: 1,
        left: pos.x,
        top: pos.y,
        scale: dragging ? 1.15 : (isActive ? 1.08 : (inMagneticZone ? 1.1 : 1)),
      }}
      transition={dragging
        ? { type: 'tween', duration: 0 }
        : { type: 'spring', stiffness: 300, damping: 25, delay: enterDelay }
      }
      style={{
        width: size,
        height: size,
        cursor: isLocked ? 'not-allowed' : (dragging ? 'grabbing' : 'grab'),
        touchAction: 'none',
        zIndex: dragging ? 100 : (isActive ? 50 : 10),
        background: isActive
          ? `radial-gradient(circle, ${mod.color}30, ${mod.color}10)`
          : `radial-gradient(circle, ${mod.color}18, rgba(10,10,18,0.7))`,
        border: `1.5px solid ${isActive ? `${mod.color}60` : (inMagneticZone ? `${mod.color}50` : `${mod.color}25`)}`,
        boxShadow: glowIntensity > 0
          ? `0 0 ${12 + glowIntensity * 30}px ${mod.color}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}, inset 0 0 8px ${mod.color}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')}`
          : `0 2px 8px rgba(0,0,0,0.3)`,
        opacity: isLocked ? 0.35 : 1,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Inner content */}
      <div className="flex flex-col items-center gap-0.5 pointer-events-none">
        {isLocked ? (
          <Lock size={12} style={{ color: mod.color }} />
        ) : (
          <span className="text-[10px] font-semibold" style={{ color: mod.color }}>
            {mod.type === 'frequency' ? `${mod.hz}` : mod.name?.charAt(0)?.toUpperCase()}
          </span>
        )}
        <span className="text-[7px] font-medium leading-tight text-center max-w-[36px] truncate"
          style={{ color: isActive ? mod.color : `${mod.color}90` }}>
          {mod.name}
        </span>
      </div>

      {/* Active pulse ring */}
      {isActive && !dragging && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ border: `1px solid ${mod.color}40` }}
        />
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   PLAYER HUB — Central drop target
   ══════════════════════════════════════════════ */
function PlayerHub({ center, activeModules, magneticActive, onDeactivate }) {
  const activeMods = activeModules.filter(Boolean);
  const hasActive = activeMods.length > 0;
  const primaryColor = activeMods.length > 0 ? activeMods[0].color : '#C084FC';

  return (
    <div
      id="player-target"
      data-testid="orbital-player-hub"
      className="absolute flex flex-col items-center justify-center rounded-full"
      style={{
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        left: center.x - PLAYER_SIZE / 2,
        top: center.y - PLAYER_SIZE / 2,
        background: hasActive
          ? `radial-gradient(circle, ${primaryColor}12, rgba(6,6,14,0.9))`
          : magneticActive
            ? 'radial-gradient(circle, rgba(192,132,252,0.08), rgba(6,6,14,0.95))'
            : 'radial-gradient(circle, rgba(255,255,255,0.02), rgba(6,6,14,0.95))',
        border: `1.5px solid ${hasActive ? `${primaryColor}35` : (magneticActive ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)')}`,
        boxShadow: hasActive
          ? `0 0 40px ${primaryColor}15, inset 0 0 20px ${primaryColor}08`
          : magneticActive
            ? '0 0 30px rgba(192,132,252,0.08), inset 0 0 15px rgba(192,132,252,0.04)'
            : '0 0 20px rgba(0,0,0,0.3)',
        transition: 'background 0.4s, border 0.4s, box-shadow 0.6s',
        zIndex: 5,
      }}
    >
      {/* Breathing animation */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          scale: magneticActive ? [1, 1.08, 1] : [1, 1.03, 1],
          opacity: magneticActive ? [0.4, 0.15, 0.4] : [0.2, 0.08, 0.2],
        }}
        transition={{ duration: magneticActive ? 1.2 : 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          border: `1px solid ${hasActive ? `${primaryColor}25` : 'rgba(192,132,252,0.1)'}`,
        }}
      />

      {hasActive ? (
        <div className="flex flex-col items-center gap-1 relative z-10">
          {/* Active module dots */}
          <div className="flex gap-1">
            {activeMods.slice(0, 5).map(m => (
              <motion.div key={m.id}
                className="rounded-full cursor-pointer"
                style={{
                  width: 8, height: 8,
                  background: m.color,
                  boxShadow: `0 0 6px ${m.color}60`,
                }}
                whileTap={{ scale: 0.7 }}
                onClick={() => onDeactivate(m)}
                title={`Remove ${m.name}`}
              />
            ))}
          </div>
          <span className="text-[8px] font-mono" style={{ color: `${primaryColor}80` }}>
            {activeMods.length} active
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 relative z-10">
          <Zap size={16} style={{ color: magneticActive ? 'rgba(192,132,252,0.5)' : 'rgba(255,255,255,0.12)' }} />
          <span className="text-[8px]" style={{ color: magneticActive ? 'rgba(192,132,252,0.5)' : 'rgba(255,255,255,0.12)' }}>
            Drop here
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   GROUP LABEL — Ring identifier
   ══════════════════════════════════════════════ */
function RingLabel({ group, center, radius }) {
  const labelAngle = -Math.PI / 2 - 0.3;
  const lx = center.x + Math.cos(labelAngle) * (radius + 22);
  const ly = center.y + Math.sin(labelAngle) * (radius + 22);

  return (
    <div
      className="absolute text-[7px] uppercase tracking-[0.15em] font-medium pointer-events-none"
      style={{
        left: lx,
        top: ly,
        color: `${group.color}50`,
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
      }}
      data-testid={`ring-label-${group.id}`}
    >
      {group.label}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ORBITAL MIXER — Main exported component
   ══════════════════════════════════════════════ */
export default function OrbitalMixer() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [magneticActive, setMagneticActive] = useState(false);
  const [constellationOpen, setConstellationOpen] = useState(false);
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [dragPositions, setDragPositions] = useState({}); // { modId: {x,y} } for synergy discovery
  const { activeFreqs, activeSounds, activeDrones, toggleFreq, toggleSound, toggleDrone } = useMixer();
  const { focusMode, toggleFocus } = useFocus();
  const { activeClass, classData, selectClass, addXP, isBoosted } = useClass();

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDimensions({ w: r.width, h: r.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const isMobile = dimensions.w < 500;
  const centerX = dimensions.w / 2;
  const centerY = dimensions.h / 2;
  const playerCenter = useMemo(() => ({ x: centerX, y: centerY }), [centerX, centerY]);

  // Ring radii — scale based on container size
  const baseRadius = Math.min(dimensions.w, dimensions.h) * 0.32;
  const ringRadii = useMemo(() => {
    if (isMobile) {
      // Mobile: fewer concentric rings, more spread
      const base = Math.min(dimensions.w, dimensions.h) * 0.28;
      return [
        base * 0.55,  // Ring 0: inner frequencies
        base * 0.80,  // Ring 1: outer frequencies
        base * 1.10,  // Ring 2: sounds
        base * 1.40,  // Ring 3: instruments
        base * 1.65,  // Ring 4: engines (locked)
      ];
    }
    return [
      baseRadius * 0.65,  // Ring 0: inner frequencies
      baseRadius * 0.90,  // Ring 1: outer frequencies
      baseRadius * 1.15,  // Ring 2: sounds
      baseRadius * 1.40,  // Ring 3: instruments
      baseRadius * 1.60,  // Ring 4: engines (locked)
    ];
  }, [baseRadius, isMobile, dimensions]);

  // Collect all modules and track active state
  const allModules = useMemo(() => getActiveModules(), []);
  const lockedModules = useMemo(() =>
    Object.values(moduleRegistry).filter(m => m.locked),
  []);

  // Get currently active module objects
  const activeModuleObjects = useMemo(() => {
    const active = [];
    allModules.forEach(m => {
      if (isModuleActive(m, activeFreqs, activeSounds, activeDrones)) {
        active.push(m);
      }
    });
    return active;
  }, [allModules, activeFreqs, activeSounds, activeDrones]);

  // Handle module activation via drop
  const handleActivate = useCallback((mod) => {
    const resolved = resolveModuleToMixerData(mod);
    if (!resolved.data) return;

    switch (resolved.kind) {
      case 'freq':
        toggleFreq(resolved.data);
        break;
      case 'sound':
        toggleSound(resolved.data);
        break;
      case 'drone':
        toggleDrone(resolved.data);
        break;
      default:
        break;
    }
  }, [toggleFreq, toggleSound, toggleDrone]);

  // Handle deactivation from player hub
  const handleDeactivate = useCallback((mod) => {
    haptic('Light');
    handleActivate(mod); // toggle off
  }, [handleActivate]);

  // Compute synergy lines between active modules
  const synergyLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < activeModuleObjects.length; i++) {
      for (let j = i + 1; j < activeModuleObjects.length; j++) {
        const result = checkSynergy(activeModuleObjects[i], activeModuleObjects[j]);
        if (result.synergy) {
          lines.push({
            a: activeModuleObjects[i],
            b: activeModuleObjects[j],
            score: result.score,
            name: getSynthesisName(activeModuleObjects[i], activeModuleObjects[j]),
          });
        }
      }
    }
    return lines;
  }, [activeModuleObjects]);

  // Load a constellation: activate its modules
  const handleLoadConstellation = useCallback((moduleIds) => {
    // First deactivate all current
    activeModuleObjects.forEach(m => handleActivate(m));
    // Then activate constellation modules
    setTimeout(() => {
      moduleIds.forEach(id => {
        const mod = moduleRegistry[id];
        if (mod && !mod.locked) handleActivate(mod);
      });
    }, 100);
    setConstellationOpen(false);
    haptic('Heavy');
  }, [activeModuleObjects, handleActivate]);

  // Track drag positions for synergy discovery
  const handleDragPos = useCallback((modId, center) => {
    setDragPositions(prev => {
      if (!center) {
        const next = { ...prev };
        delete next[modId];
        return next;
      }
      return { ...prev, [modId]: center };
    });
  }, []);

  // Check if a module is class-boosted (any affinity matches active class)
  const isClassBoosted = useCallback((mod) => {
    if (!classData?.boosted_affinities || !mod.affinities) return false;
    return mod.affinities.some(a => classData.boosted_affinities.includes(a));
  }, [classData]);

  // Award XP when activating modules with class synergy
  const handleActivateWithXP = useCallback((mod) => {
    handleActivate(mod);
    if (isClassBoosted(mod) && activeClass) {
      addXP(5); // 5 XP for boosted activation
    }
  }, [handleActivate, isClassBoosted, activeClass, addXP]);

  // Compute nearby synergy pairs during drag (synergy discovery glow)
  const discoveryPairs = useMemo(() => {
    const pairs = [];
    const draggingIds = Object.keys(dragPositions);
    if (draggingIds.length === 0) return pairs;
    const allMods = [...allModules, ...lockedModules];
    for (const dragId of draggingIds) {
      const dragCenter = dragPositions[dragId];
      const dragMod = moduleRegistry[dragId];
      if (!dragMod || !dragCenter) continue;
      for (const other of allMods) {
        if (other.id === dragId) continue;
        const result = checkSynergy(dragMod, other);
        if (result.synergy && result.score > 0.2) {
          pairs.push({ dragId, otherId: other.id, score: result.score, shared: result.shared });
        }
      }
    }
    return pairs;
  }, [dragPositions, allModules, lockedModules]);

  // Organize modules by ring
  const ringModules = useMemo(() => {
    const rings = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    [...allModules, ...lockedModules].forEach(m => {
      const ring = m.ring ?? 0;
      if (rings[ring]) rings[ring].push(m);
    });
    return rings;
  }, [allModules, lockedModules]);

  if (dimensions.w === 0) {
    return (
      <div ref={containerRef} data-orbital-container className="w-full relative" style={{ height: isMobile ? '60vh' : '60vh', minHeight: 420 }} />
    );
  }

  return (
    <div
      ref={containerRef}
      data-orbital-container
      data-testid="orbital-mixer"
      className="w-full relative overflow-hidden"
      style={{
        height: isMobile ? '60vh' : '60vh',
        minHeight: isMobile ? 420 : 380,
        maxHeight: 600,
        background: 'radial-gradient(ellipse at center, rgba(15,15,30,0.6) 0%, rgba(6,6,14,0.95) 70%)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Orbital ring guides */}
      {Object.entries(ringRadii).map(([ring, radius]) => (
        <div
          key={`ring-guide-${ring}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: centerX - radius,
            top: centerY - radius,
            border: `1px solid rgba(255,255,255,${parseInt(ring) < 4 ? '0.025' : '0.015'})`,
          }}
        />
      ))}

      {/* Group labels */}
      {MODULE_GROUPS.map(group => {
        const ringIdx = group.modules[0]?.ring ?? 0;
        return (
          <RingLabel
            key={group.id}
            group={group}
            center={playerCenter}
            radius={ringRadii[ringIdx] || ringRadii[0]}
          />
        );
      })}

      {/* Central Player Hub */}
      <PlayerHub
        center={playerCenter}
        activeModules={activeModuleObjects}
        magneticActive={magneticActive}
        onDeactivate={handleDeactivate}
      />

      {/* Orbital Bubbles */}
      {Object.entries(ringModules).map(([ring, modules]) => {
        let globalIdx = 0;
        return modules.map((mod, i) => {
          const radius = ringRadii[parseInt(ring)] || ringRadii[0];
          const homePos = getOrbitalPosition(i, modules.length, radius, centerX, centerY);
          const active = isModuleActive(mod, activeFreqs, activeSounds, activeDrones);
          globalIdx++;

          const boosted = isClassBoosted(mod);
          const discoveryGlow = discoveryPairs.some(p => p.otherId === mod.id);

          return (
            <DraggableBubble
              key={mod.id}
              mod={mod}
              homePos={homePos}
              playerCenter={playerCenter}
              onActivate={handleActivateWithXP}
              isActive={active}
              isLocked={!!mod.locked}
              delay={globalIdx * 0.04}
              classBoosted={boosted || discoveryGlow}
              onDragPos={handleDragPos}
            />
          );
        });
      })}

      {/* Active modules tethers + Synergy bonds */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* Hub-to-bubble tethers */}
        {activeModuleObjects.map(mod => {
          const ring = mod.ring ?? 0;
          const radius = ringRadii[ring] || ringRadii[0];
          const mods = ringModules[ring] || [];
          const idx = mods.findIndex(m => m.id === mod.id);
          if (idx < 0) return null;
          const pos = getOrbitalPosition(idx, mods.length, radius, centerX, centerY);
          const bSize = isMobile ? BUBBLE_SIZE_MOBILE : BUBBLE_SIZE;
          return (
            <line
              key={`tether-${mod.id}`}
              x1={centerX}
              y1={centerY}
              x2={pos.x + bSize / 2}
              y2={pos.y + bSize / 2}
              stroke={mod.color}
              strokeWidth={1}
              strokeOpacity={0.12}
              strokeDasharray="4 4"
            />
          );
        })}
        {/* Synergy bonds — liquid tethers between synergized modules */}
        {synergyLines.map((syn, i) => {
          const ringA = syn.a.ring ?? 0;
          const ringB = syn.b.ring ?? 0;
          const modsA = ringModules[ringA] || [];
          const modsB = ringModules[ringB] || [];
          const idxA = modsA.findIndex(m => m.id === syn.a.id);
          const idxB = modsB.findIndex(m => m.id === syn.b.id);
          if (idxA < 0 || idxB < 0) return null;
          const posA = getOrbitalPosition(idxA, modsA.length, ringRadii[ringA] || ringRadii[0], centerX, centerY);
          const posB = getOrbitalPosition(idxB, modsB.length, ringRadii[ringB] || ringRadii[0], centerX, centerY);
          const bSize = isMobile ? BUBBLE_SIZE_MOBILE : BUBBLE_SIZE;
          const ax = posA.x + bSize / 2, ay = posA.y + bSize / 2;
          const bx = posB.x + bSize / 2, by = posB.y + bSize / 2;
          const mx = (ax + bx) / 2 + (Math.random() - 0.5) * 20;
          const my = (ay + by) / 2 + (Math.random() - 0.5) * 20;
          return (
            <g key={`synergy-${i}`}>
              <path
                d={`M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`}
                stroke={syn.a.color}
                strokeWidth={1.5}
                strokeOpacity={0.2 + syn.score * 0.3}
                fill="none"
                strokeDasharray="2 3"
              />
              <text
                x={(ax + bx) / 2}
                y={(ay + by) / 2 - 6}
                textAnchor="middle"
                fill={syn.a.color}
                fillOpacity={0.35}
                fontSize={7}
                fontFamily="monospace"
              >
                {syn.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Action buttons: Constellation + Community + Focus */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => { haptic('Light'); setCommunityOpen(!communityOpen); }}
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{
            background: communityOpen ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${communityOpen ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: communityOpen ? '#2DD4BF' : 'rgba(248,250,252,0.4)',
            fontSize: '9px',
            cursor: 'pointer',
          }}
          data-testid="orbital-community-btn"
        >
          <Users size={10} /> Community
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => { haptic('Light'); setConstellationOpen(!constellationOpen); }}
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{
            background: constellationOpen ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${constellationOpen ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: constellationOpen ? '#C084FC' : 'rgba(248,250,252,0.4)',
            fontSize: '9px',
            cursor: 'pointer',
          }}
          data-testid="orbital-constellation-btn"
        >
          <BookOpen size={10} /> Recipes
        </motion.button>

        {activeModuleObjects.length >= 2 && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { haptic('Light'); toggleFocus(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: focusMode ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${focusMode ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}`,
              color: focusMode ? '#C084FC' : 'rgba(248,250,252,0.4)',
              fontSize: '9px',
              cursor: 'pointer',
            }}
            data-testid="orbital-focus-toggle"
          >
            {focusMode ? <EyeOff size={10} /> : <Eye size={10} />}
            {focusMode ? 'Exit Focus' : 'Focus'}
          </motion.button>
        )}
      </div>

      {/* Constellation Panel (slides below action buttons) */}
      <AnimatePresence>
        {constellationOpen && (
          <div className="absolute top-10 right-3 z-30" style={{ width: isMobile ? 260 : 280 }}>
            <ConstellationPanel
              activeModuleIds={activeModuleObjects.map(m => m.id)}
              onLoadConstellation={handleLoadConstellation}
              isOpen={constellationOpen}
              onClose={() => setConstellationOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Community Panel */}
      <AnimatePresence>
        {communityOpen && (
          <div className="absolute top-10 right-3 z-30" style={{ width: isMobile ? 280 : 300 }}>
            <CommunityPanel
              isOpen={communityOpen}
              onClose={() => setCommunityOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Clear all button */}
      <AnimatePresence>
        {activeModuleObjects.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full z-20"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444',
              fontSize: '10px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => {
              haptic('Medium');
              activeModuleObjects.forEach(m => handleDeactivate(m));
            }}
            data-testid="orbital-clear-all"
          >
            <X size={10} /> Clear All
          </motion.button>
        )}
      </AnimatePresence>

      {/* Legend + Class Indicator */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-20">
        {/* Active Class Badge */}
        {activeClass && classData && (() => {
          const ClassIcon = CLASS_ICONS[activeClass] || Flame;
          return (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setClassPickerOpen(!classPickerOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{
                background: `${classData.color}10`,
                border: `1px solid ${classData.color}25`,
                color: classData.color,
                fontSize: '9px',
                cursor: 'pointer',
              }}
              data-testid="class-badge"
            >
              <ClassIcon size={10} />
              <span>{classData.name}</span>
            </motion.button>
          );
        })()}

        {/* No class: show selector prompt */}
        {!activeClass && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setClassPickerOpen(!classPickerOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(248,250,252,0.35)',
              fontSize: '9px',
              cursor: 'pointer',
            }}
            data-testid="class-select-prompt"
          >
            <Flame size={10} /> Choose Class
          </motion.button>
        )}

        {/* Module group legend */}
        <div className="flex flex-wrap gap-2">
          {MODULE_GROUPS.map(g => (
            <div key={g.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: g.color, opacity: 0.5 }} />
              <span className="text-[7px]" style={{ color: `${g.color}60` }}>{g.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Class Picker Panel */}
      <AnimatePresence>
        {classPickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-14 left-3 z-30 rounded-xl p-2.5 space-y-1.5"
            style={{
              background: 'rgba(11,12,21,0.97)',
              border: '1px solid rgba(192,132,252,0.1)',
              backdropFilter: 'blur(20px)',
              width: isMobile ? 200 : 220,
            }}
            data-testid="class-picker"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(192,132,252,0.5)' }}>Archetype</span>
              <button onClick={() => setClassPickerOpen(false)} className="p-0.5 rounded hover:bg-white/5">
                <X size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
              </button>
            </div>
            {['shaman', 'nomad', 'architect', 'merchant'].map(cid => {
              const Icon = CLASS_ICONS[cid] || Flame;
              const color = CLASS_COLORS[cid] || '#C084FC';
              const names = { shaman: 'Shaman', nomad: 'Nomad', architect: 'Architect', merchant: 'Merchant' };
              const titles = { shaman: 'Resonator', nomad: 'Navigator', architect: 'Builder', merchant: 'Catalyst' };
              const isSelected = activeClass === cid;
              return (
                <button
                  key={cid}
                  onClick={() => { selectClass(cid); setClassPickerOpen(false); haptic('Medium'); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all"
                  style={{
                    background: isSelected ? `${color}12` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? `${color}25` : 'rgba(255,255,255,0.04)'}`,
                    cursor: 'pointer',
                  }}
                  data-testid={`class-option-${cid}`}
                >
                  <Icon size={14} style={{ color }} />
                  <div className="text-left">
                    <div className="text-[10px] font-medium" style={{ color: isSelected ? color : '#F8FAFC' }}>{names[cid]}</div>
                    <div className="text-[8px]" style={{ color: `${color}60` }}>{titles[cid]}</div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto w-2 h-2 rounded-full" style={{ background: color }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction overlay — show only when no modules active */}
      {activeModuleObjects.length === 0 && (
        <div className="absolute top-3 left-0 right-0 text-center pointer-events-none z-20">
          <span className="text-[10px] px-3 py-1 rounded-full"
            style={{ background: 'rgba(10,10,18,0.6)', color: 'rgba(248,250,252,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
            Drag or tap bubbles to activate
          </span>
        </div>
      )}

      {/* Synergy counter */}
      {synergyLines.length > 0 && (
        <div className="absolute top-3 left-3 z-20">
          <span className="text-[9px] px-2 py-1 rounded-full"
            style={{
              background: 'rgba(192,132,252,0.08)',
              border: '1px solid rgba(192,132,252,0.12)',
              color: 'rgba(192,132,252,0.6)',
            }}
            data-testid="synergy-counter"
          >
            {synergyLines.length} {synergyLines.length === 1 ? 'synergy' : 'synergies'}
          </span>
        </div>
      )}
    </div>
  );
}
