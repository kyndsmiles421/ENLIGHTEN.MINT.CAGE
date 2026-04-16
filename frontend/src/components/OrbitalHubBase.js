import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { ResonancePulse, HexagramGlitch } from './ResonancePulse';
import { CosmicSparkline } from './CosmicSparkline';
import { useCosmicState } from '../context/CosmicStateContext';
import { useSensory } from '../context/SensoryContext';
import { OrbitalTransitionPortal } from './OrbitalTransitionPortal';

// ━━━ GRAVITY CONSTANTS ENGINE ━━━
function computeGravityLayout(nodeCount, containerSize, stability) {
  const baseRadius = Math.min(containerSize * 0.3, 120 + nodeCount * 14);
  const speedMultiplier = stability === 'stable' ? 0.3 : stability === 'shifting' ? 0.7 : 1.2;
  const circumference = 2 * Math.PI * baseRadius;
  const nodeSize = 64;
  const minSpacing = nodeSize + 12;
  const requiredCircumference = nodeCount * minSpacing;
  const scaledRadius = requiredCircumference > circumference
    ? (requiredCircumference / (2 * Math.PI))
    : baseRadius;
  const finalRadius = Math.min(scaledRadius, containerSize * 0.42);
  return { radius: finalRadius, speedMultiplier, nodeSize };
}

// ━━━ GRAVITATIONAL PULL — compute damping from cursor proximity to nearest node ━━━
function computeGravitationalDamping(cursorPos, positions, center, pullRadius) {
  if (!cursorPos) return 1.0;
  let minDist = Infinity;
  for (const pos of positions) {
    const nx = center + pos.x;
    const ny = center + pos.y;
    const dx = cursorPos.x - nx;
    const dy = cursorPos.y - ny;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) minDist = dist;
  }
  if (minDist > pullRadius) return 1.0;
  // Quadratic easing: closer = slower (0.05 at surface, 1.0 at pullRadius)
  const t = minDist / pullRadius;
  return 0.05 + 0.95 * t * t;
}

// ━━━ ORBITAL NODE ━━━
function OrbitalNode({ node, x, y, isActive, isLocked, onSelect, onHover, hoveredId, containerCenter, onConfirm }) {
  const Icon = node.icon;
  const isHovered = hoveredId === node.id;
  const scale = isActive ? 1.2 : isHovered ? 1.15 : isLocked ? 0.85 : 1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: containerCenter, top: containerCenter,
        width: 64, height: 64, marginLeft: -32, marginTop: -32,
        zIndex: isActive ? 15 : isHovered ? 12 : 10,
        pointerEvents: isLocked ? 'none' : 'auto',
      }}
      animate={{ x, y, scale, opacity: isLocked ? 0.2 : 1 }}
      transition={{ type: 'spring', stiffness: 65, damping: 18 }}
      onClick={(e) => { e.stopPropagation(); if (!isLocked) { if (onConfirm) onConfirm(node); onSelect(node); } }}
      onHoverStart={() => onHover(node.id)}
      onHoverEnd={() => onHover(null)}
      data-testid={`orbital-node-${node.id}`}
    >
      {/* Sphere hitbox — exclusive interaction target */}
      <div className="w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
        style={{
          background: isActive ? `${node.color}15` : isHovered ? `${node.color}10` : 'rgba(0,0,0,0)',
          border: `${isActive ? '1.5px' : '1px'} solid ${isActive ? node.color + '50' : isHovered ? node.color + '40' : node.color + '12'}`,
          boxShadow: isActive ? `0 0 28px ${node.color}20, inset 0 0 12px ${node.color}08` : 'none',
          backdropFilter: 'none',
          filter: isLocked ? 'grayscale(0.8) blur(1px)' : 'none',
        }}>
        {Icon && <Icon size={isActive ? 20 : 17} style={{ color: isLocked ? 'rgba(248,250,252,0.15)' : node.color }} />}
        <p className="text-[7px] mt-0.5 font-medium text-center leading-tight max-w-[54px] truncate"
          style={{ color: isActive || isHovered ? node.color : 'rgba(248,250,252,0.3)' }}>
          {node.label}
        </p>
        {isLocked && (
          <p className="text-[5px] font-mono uppercase" style={{ color: 'rgba(248,250,252,0.1)' }}>locked</p>
        )}
      </div>
      {/* Resonance Pulse — strictly non-interactive */}
      {!isLocked && (
        <div className="absolute inset-0 pointer-events-none">
          <ResonancePulse sourceId={`orbital-${node.id}`} color={node.color} size={64} />
        </div>
      )}
    </motion.div>
  );
}

// ━━━ CENTER SUN ━━━
function CenterSun({ sun, containerCenter, onBack, depth }) {
  if (!sun) return null;
  const Icon = sun.icon;
  const orbSize = 100;
  return (
    <div className="absolute" style={{
      left: containerCenter - orbSize / 2, top: containerCenter - orbSize / 2,
      width: orbSize, height: orbSize, zIndex: 20,
    }}>
      <motion.div
        className="w-full h-full rounded-full flex flex-col items-center justify-center relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
        style={{
          background: `radial-gradient(circle, ${sun.color}12 0%, rgba(0,0,0,0) 70%)`,
          border: `1.5px solid ${sun.color}30`,
          boxShadow: `0 0 40px ${sun.color}15, inset 0 0 20px ${sun.color}08`,
          backdropFilter: 'none',
        }}
        data-testid="orbital-center-sun"
      >
        {Icon && <Icon size={24} style={{ color: sun.color }} />}
        <p className="text-[8px] mt-1 font-medium text-center max-w-[80px]"
          style={{ color: sun.color, fontFamily: 'Cormorant Garamond, serif' }}>
          {sun.label}
        </p>
        {sun.subtitle && (
          <p className="text-[6px]" style={{ color: `${sun.color}60` }}>{sun.subtitle}</p>
        )}
        {/* Pulse rings */}
        <motion.div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `1px solid ${sun.color}15` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute -inset-2 rounded-full pointer-events-none"
          style={{ border: `1px dashed ${sun.color}08` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      {depth > 0 && (
        <motion.button
          className="absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center z-30"
          style={{
            background: 'rgba(0,0,0,0)',
            border: '1px solid rgba(248,250,252,0.1)',
          }}
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          whileHover={{ scale: 1.15 }}
          data-testid="orbital-back-btn"
        >
          <ChevronLeft size={12} style={{ color: 'rgba(248,250,252,0.5)' }} />
        </motion.button>
      )}
    </div>
  );
}

// ━━━ CONNECTION LINES ━━━
function OrbitalConnections({ positions, nodes, hoveredId, cx, cy, lockedIds }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
      {positions.map((pos, i) => {
        const node = nodes[i];
        if (!node) return null;
        const isH = hoveredId === node.id;
        const isLocked = lockedIds.has(node.id);
        return (
          <line key={node.id} x1={cx} y1={cy} x2={cx + pos.x} y2={cy + pos.y}
            stroke={isH ? node.color : 'rgba(248,250,252,0.02)'}
            strokeWidth={isH ? 1.2 : 0.3}
            strokeDasharray={isH ? 'none' : '3,12'}
            strokeOpacity={isLocked ? 0.05 : 1}
            style={{ transition: 'all 0.5s ease' }}
          />
        );
      })}
    </svg>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ORBITAL HUB BASE — The Universal 3D Orbital Canvas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function OrbitalHubBase({
  sun,               // { id, label, subtitle?, icon, color }
  planets,           // [{ id, label, icon, color, data?, locked? }]
  onPlanetSelect,    // (planet) => void — deep-dive handler
  onBack,            // () => void — navigate back up
  depth = 0,         // recursion depth level
  hexagram,          // hexagram data for gate logic
  showSparkline = true,
  className = '',
  children,          // optional overlay content (detail panels, etc.)
}) {
  const { cosmicState } = useCosmicState();
  const { playConfirmation } = useSensory();
  const stability = cosmicState?.stability || 'stable';

  const [hoveredId, setHoveredId] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [flyingIn, setFlyingIn] = useState(null); // deep-dive transition state
  const animRef = useRef(null);
  const isDragging = useRef(false);
  const lastDragAngle = useRef(0);
  const angularVel = useRef(0);
  const cursorPos = useRef(null); // for gravitational pull

  const containerSize = 580;
  const center = containerSize / 2;

  // Determine locked nodes from hexagram bits
  const lockedIds = useMemo(() => {
    const locked = new Set();
    if (hexagram && planets) {
      planets.forEach(p => {
        if (p.locked) locked.add(p.id);
        // Gate based on hexagram bits — lock nodes that require higher bits
        if (p.requiredBit != null && hexagram.bits && !hexagram.bits[p.requiredBit]) {
          locked.add(p.id);
        }
      });
    }
    return locked;
  }, [hexagram, planets]);

  const visiblePlanets = planets || [];
  const layout = computeGravityLayout(visiblePlanets.length, containerSize, stability);

  // Compute positions
  const positions = visiblePlanets.map((_, i) => {
    const a = (i / visiblePlanets.length) * Math.PI * 2 + orbitAngle;
    return { x: Math.cos(a) * layout.radius, y: Math.sin(a) * layout.radius };
  });

  // Animation loop — continuous rotation with gravitational pull damping
  useEffect(() => {
    let last = performance.now();
    const pullRadius = layout.radius * 0.6; // gravitational capture zone
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!isDragging.current && !flyingIn) {
        // Compute gravitational damping from cursor proximity
        const gravDamp = computeGravitationalDamping(cursorPos.current, positions, center, pullRadius);
        const baseSpeed = 0.08 * layout.speedMultiplier;
        if (Math.abs(angularVel.current) > 0.01) {
          setOrbitAngle(prev => prev + angularVel.current * dt * gravDamp);
          angularVel.current *= 0.96;
        } else {
          setOrbitAngle(prev => prev + baseSpeed * dt * gravDamp);
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [layout.speedMultiplier, flyingIn, positions, center, layout.radius]);

  // Drag handlers for orbit rotation
  const handlePointerDown = useCallback((e) => {
    isDragging.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    lastDragAngle.current = Math.atan2(e.clientY - cy, e.clientX - cx);
  }, []);

  const handlePointerMove = useCallback((e) => {
    // Track cursor for gravitational pull
    const rect = e.currentTarget.getBoundingClientRect();
    cursorPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (!isDragging.current) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    let delta = angle - lastDragAngle.current;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    angularVel.current = delta * 6;
    setOrbitAngle(prev => prev + delta);
    lastDragAngle.current = angle;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    isDragging.current = false;
    cursorPos.current = null; // reset gravitational pull
  }, []);

  // Confirmation chime on node interaction
  const handleConfirm = useCallback((node) => {
    // Map node to frequency — each node gets a unique pitch
    const baseFreq = 440;
    const nodeIdx = visiblePlanets.findIndex(p => p.id === node.id);
    const semitone = nodeIdx * 2;
    const freq = baseFreq * Math.pow(2, semitone / 12);
    playConfirmation(freq, 'medium');
  }, [visiblePlanets, playConfirmation]);

  // Deep-dive: animate fly-in then hand off to parent
  const handleSelect = useCallback((planet) => {
    if (!onPlanetSelect) return;
    // If planet has subPlanets, do fly-in animation
    if (planet.subPlanets) {
      setFlyingIn(planet.id);
      setTimeout(() => {
        setFlyingIn(null);
        onPlanetSelect(planet);
      }, 500);
    } else {
      onPlanetSelect(planet);
    }
  }, [onPlanetSelect]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}
      style={{ minHeight: '100vh', background: '#06060e' }}
      data-testid="orbital-hub-base">

      {/* Sparkline compass overlay */}
      {showSparkline && (
        <div className="absolute top-4 right-4 z-30">
          <CosmicSparkline />
        </div>
      )}

      {/* Orbital Canvas */}
      <HexagramGlitch active={hexagram?.is_transitioning} intensity="low">
        <div className="relative" style={{
          width: containerSize, height: containerSize,
          touchAction: 'none',
        }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {/* Orbit ring */}
          <div className="absolute rounded-full pointer-events-none"
            style={{
              left: center - layout.radius, top: center - layout.radius,
              width: layout.radius * 2, height: layout.radius * 2,
              border: '1px solid rgba(248,250,252,0.02)',
            }}
          />

          {/* Connection lines */}
          <OrbitalConnections
            positions={positions}
            nodes={visiblePlanets}
            hoveredId={hoveredId}
            cx={center}
            cy={center}
            lockedIds={lockedIds}
          />

          {/* Orbiting planets */}
          {visiblePlanets.map((planet, i) => (
            <OrbitalNode
              key={planet.id}
              node={planet}
              x={flyingIn === planet.id ? 0 : (positions[i]?.x || 0)}
              y={flyingIn === planet.id ? 0 : (positions[i]?.y || 0)}
              isActive={flyingIn === planet.id}
              isLocked={lockedIds.has(planet.id)}
              onSelect={handleSelect}
              onHover={setHoveredId}
              hoveredId={hoveredId}
              containerCenter={center}
              onConfirm={handleConfirm}
            />
          ))}

          {/* Central Sun */}
          <CenterSun
            sun={sun}
            containerCenter={center}
            onBack={onBack}
            depth={depth}
          />
        </div>
      </HexagramGlitch>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredId && (() => {
          const hovered = visiblePlanets.find(p => p.id === hoveredId);
          if (!hovered || lockedIds.has(hoveredId)) return null;
          return (
            <motion.div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none z-30"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <p className="text-[11px] font-medium" style={{ color: hovered.color, fontFamily: 'Cormorant Garamond, serif' }}>
                {hovered.label}
              </p>
              {hovered.desc && (
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>{hovered.desc}</p>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Depth breadcrumb trail + back navigation */}
      {depth > 0 && (
        <motion.div className="absolute top-4 left-4 z-30 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{
              background: 'rgba(248,250,252,0.04)',
              border: '1px solid rgba(248,250,252,0.06)',
            }}
            data-testid="orbital-back-btn">
            <ArrowLeft size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
            <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.3)' }}>
              Back
            </span>
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: depth + 1 }).map((_, i) => (
              <div key={i} className="rounded-full transition-all"
                style={{
                  width: i === depth ? 6 : 4,
                  height: i === depth ? 6 : 4,
                  background: i === depth ? (sun?.color || '#A78BFA') : 'rgba(248,250,252,0.1)',
                  boxShadow: i === depth ? `0 0 6px ${sun?.color || '#A78BFA'}30` : 'none',
                }}
              />
            ))}
            <span className="text-[7px] ml-1 font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
              L{depth}
            </span>
          </div>
        </motion.div>
      )}

      {/* Orbital Transition Portal — persistent nav between orbital pages */}
      <OrbitalTransitionPortal />

      {/* Overlay children (detail panels, etc.) */}
      {children}
    </div>
  );
}
