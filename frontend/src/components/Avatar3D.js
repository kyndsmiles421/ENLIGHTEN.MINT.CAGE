/**
 * Avatar3D.js — V54.9 Sacred Geometry Light Being
 * 
 * The visible avatar inhabiting the spatial room, governed by Sacred Geometry.
 * - Golden Spiral trail following φ (Phi) angle distribution
 * - Fibonacci-spaced Z-depth indicator (natural acceleration)
 * - Realm morphing: Crystalline veins (HOLLOW_EARTH), Ethereal wings (AIR), Grounded quartz (SURFACE)
 * - Chakra-linked core color based on exploration XP
 * - Stillness ghosting with Seed of Life bloom
 * - Collision radius = φ-scaled proximity field
 */
import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, useSpring } from 'framer-motion';
import {
  PHI, PHI_INV, FIB_DEPTH_STEPS, goldenSpiralPoints,
  seedOfLifeCircles, CHAKRA_COLORS, getChakraColor,
  getFibBreathPhase,
} from '../lib/SacredGeometry';

const GRID_SIZE = 9;

// Realm-specific avatar configurations
const REALM_STYLES = {
  HOLLOW_EARTH: {
    coreColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.35)',
    shellColor: 'rgba(139, 92, 246, 0.15)',
    trailColor: '#8B5CF6',
    filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.6))',
    aura: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    label: 'Crystalline Form',
  },
  SURFACE: {
    coreColor: '#FCD34D',
    glowColor: 'rgba(252, 211, 77, 0.3)',
    shellColor: 'rgba(251, 191, 36, 0.12)',
    trailColor: '#FBBF24',
    filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.5))',
    aura: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
    label: 'Light Being',
  },
  AIR: {
    coreColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    shellColor: 'rgba(14, 165, 233, 0.12)',
    trailColor: '#0EA5E9',
    filter: 'drop-shadow(0 0 16px rgba(56,189,248,0.7))',
    aura: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
    label: 'Ethereal Spirit',
  },
};

// Pre-compute Golden Spiral offsets for trail
const SPIRAL_POINTS = goldenSpiralPoints(8, 20);
const SEED_CIRCLES = seedOfLifeCircles(28);

// Golden Spiral trail particle
const SpiralTrail = memo(function SpiralTrail({ baseX, baseY, color, age, spiralIndex }) {
  const opacity = Math.max(0, 1 - age / 8);
  if (opacity <= 0) return null;
  const sp = SPIRAL_POINTS[spiralIndex % SPIRAL_POINTS.length];
  const fadeScale = 1 - age / 10;
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `calc(${baseX} + ${sp.x * fadeScale}px)`,
        top: `calc(${baseY} + ${sp.y * fadeScale}px)`,
        width: 3 + fadeScale * 4,
        height: 3 + fadeScale * 4,
        background: color,
        opacity: opacity * 0.45,
        transform: `translate(-50%, -50%) rotate(${sp.angle * fadeScale}deg)`,
        transition: 'opacity 0.4s',
        borderRadius: spiralIndex % 2 === 0 ? '50%' : '30%',
      }}
    />
  );
});

/**
 * Avatar3D — The visible Sacred Geometry presence in the spatial room
 */
export default function Avatar3D({
  scrollProgress = 0,
  realm = 'SURFACE',
  theme,
  isScrolling = false,
  stillnessTimer = 0,
  hiddenRevealed = false,
  roomName = '',
  chakraXP = 0,
  customHue = null,
  avatarImage = null,
}) {
  const realmStyle = REALM_STYLES[realm] || REALM_STYLES.SURFACE;
  const chakra = getChakraColor(chakraXP);
  // Chakra default, custom override, or realm fallback
  const avatarColor = customHue || (chakraXP > 0 ? chakra.color : (theme?.accent || realmStyle.coreColor));
  const avatarGlow = customHue
    ? `${customHue}66`
    : (chakraXP > 0 ? chakra.glow : realmStyle.glowColor);

  const [trail, setTrail] = useState([]);
  const lastProgressRef = useRef(0);
  const trailIdRef = useRef(0);
  const breathStartRef = useRef(Date.now());
  const [breathState, setBreathState] = useState({ phase: 'rest', intensity: 0.3 });

  // Smooth spring for avatar position
  const springProgress = useSpring(scrollProgress, { stiffness: 120, damping: 20 });

  // Grid position — Fibonacci-spaced depth
  const fibIndex = Math.min(8, Math.floor(scrollProgress * 8));
  const fibDepth = FIB_DEPTH_STEPS[fibIndex];
  const gridY = Math.floor(fibDepth * (GRID_SIZE - 1));
  const gridX = 4;

  // Movement detection
  const isMoving = Math.abs(scrollProgress - lastProgressRef.current) > 0.002;

  // Stillness states
  const isStill = stillnessTimer > 5;
  const isGhosted = stillnessTimer > 20;
  const isRevealed = hiddenRevealed;

  // Fibonacci breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - breathStartRef.current;
      setBreathState(getFibBreathPhase(elapsed));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Golden Spiral trail generation
  useEffect(() => {
    const delta = Math.abs(scrollProgress - lastProgressRef.current);
    if (delta > 0.012) {
      trailIdRef.current += 1;
      setTrail(prev => [
        { id: trailIdRef.current, y: scrollProgress, age: 0, spiralIdx: trailIdRef.current },
        ...prev.slice(0, 7),
      ]);
    }
    lastProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Age trail
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.map(p => ({ ...p, age: p.age + 1 })).filter(p => p.age < 8));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Avatar vertical position
  const avatarTop = 15 + scrollProgress * 65;

  // Phi-scaled breathing visual
  const breathScale = 1 + breathState.intensity * 0.06 * PHI_INV;

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: '50%',
        top: 0,
        bottom: 0,
        width: 140,
        transform: 'translateX(-50%)',
        zIndex: 3,
      }}
      data-testid="avatar-3d-container"
    >
      {/* Golden Spiral trail particles */}
      {trail.map(p => (
        <SpiralTrail
          key={p.id}
          baseX="50%"
          baseY={`${15 + p.y * 65}%`}
          color={realmStyle.trailColor}
          age={p.age}
          spiralIndex={p.spiralIdx}
        />
      ))}

      {/* Seed of Life bloom during stillness */}
      {isGhosted && (
        <svg
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: `${avatarTop}%`,
            transform: 'translate(-50%, -50%)',
            width: 120,
            height: 120,
            opacity: isRevealed ? 0.25 : 0.12,
            transition: 'opacity 2s',
          }}
          viewBox="-60 -60 120 120"
        >
          {SEED_CIRCLES.map((c, i) => (
            <circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r={28}
              fill="none"
              stroke={avatarColor}
              strokeWidth="0.5"
              opacity={0.3 + (i === 0 ? 0.3 : 0)}
            >
              <animate
                attributeName="r"
                values={`${28};${30};${28}`}
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      )}

      {/* Avatar aura field — φ-scaled proximity radius */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: `${avatarTop}%`,
          width: isRevealed ? 160 : isStill ? 120 : 80,
          height: isRevealed ? 160 : isStill ? 120 : 80,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${avatarColor}15 0%, transparent 70%)`,
          opacity: isGhosted ? 0.8 : 0.4,
          transition: 'width 1s, height 1s, opacity 1s',
        }}
      />

      {/* Main Avatar Body */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: `${avatarTop}%`,
          transform: 'translate(-50%, -50%)',
          filter: `drop-shadow(0 0 ${isGhosted ? 20 : 10}px ${avatarGlow})`,
        }}
        animate={{
          scale: isMoving
            ? [breathScale, breathScale * 1.04, breathScale * 0.97, breathScale]
            : isGhosted ? breathScale * 1.08 : breathScale,
          y: isMoving ? [0, -3, 1, 0] : 0,
        }}
        transition={{
          duration: isMoving ? 0.4 : 2,
          repeat: isMoving ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {/* Avatar Body — User's actual avatar image or crystal fallback */}
        <div
          className="relative"
          style={{
            width: avatarImage ? 52 : 44,
            height: avatarImage ? 52 : 56,
            opacity: isGhosted ? 0.35 : 1,
            transition: 'opacity 2s',
          }}
        >
          {avatarImage ? (
            /* ═══ USER'S AVATAR IMAGE ═══ */
            <div className="relative" style={{ width: '100%', height: '100%' }}>
              {/* Circular avatar with realm-colored ring */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${avatarColor}60`,
                  boxShadow: `0 0 12px ${avatarColor}30, inset 0 0 8px ${avatarColor}15`,
                }}
              >
                <img
                  src={`data:image/png;base64,${avatarImage}`}
                  alt="Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: realm === 'HOLLOW_EARTH'
                      ? 'saturate(1.2) brightness(0.9) hue-rotate(-10deg)'
                      : realm === 'AIR'
                      ? 'saturate(0.9) brightness(1.1) hue-rotate(10deg)'
                      : 'none',
                  }}
                  data-testid="avatar-user-image"
                />
              </div>
              {/* Realm indicator ring */}
              <svg
                viewBox="0 0 56 56"
                width="56"
                height="56"
                className="absolute -top-0.5 -left-0.5"
                style={{ overflow: 'visible', pointerEvents: 'none' }}
              >
                <circle cx="28" cy="28" r="27" fill="none" stroke={avatarColor} strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="r" values="27;28;27" dur="4s" repeatCount="indefinite" />
                </circle>
                {/* Breathing pulse ring */}
                <circle cx="28" cy="28" r="30" fill="none" stroke={avatarColor} strokeWidth="0.3" opacity={breathState.intensity * 0.4}>
                  <animate attributeName="r" values="30;33;30" dur={`${2 + breathState.intensity}s`} repeatCount="indefinite" />
                </circle>
              </svg>
              {/* Chakra indicator dot */}
              {chakraXP > 0 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                  style={{ background: chakra.color, boxShadow: `0 0 6px ${chakra.glow}`, border: '1px solid rgba(0,0,0,0.3)' }} />
              )}
            </div>
          ) : (
            /* ═══ CRYSTAL DIAMOND FALLBACK ═══ */
            <svg viewBox="0 0 44 56" width="44" height="56" style={{ overflow: 'visible' }}>
              <polygon points="22,2 40,22 22,54 4,22" fill={`${avatarColor}18`} stroke={avatarColor} strokeWidth="1.2" strokeLinejoin="round" />
              <line x1="22" y1="2" x2="22" y2="54" stroke={avatarColor} strokeWidth="0.5" opacity="0.3" />
              <line x1="4" y1="22" x2="40" y2="22" stroke={avatarColor} strokeWidth="0.5" opacity="0.3" />
              <circle cx="22" cy="22" r="6" fill={avatarColor} opacity="0.8">
                <animate attributeName="r" values={isStill ? '6;8;6' : `5;${5 + breathState.intensity * 3};5`}
                  dur={isStill ? '3s' : `${1 + breathState.intensity * 2}s`} repeatCount="indefinite" />
              </circle>
              <circle cx="22" cy="16" r="2" fill={avatarColor} opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
              </circle>
              {realm === 'HOLLOW_EARTH' && (
                <>
                  <line x1="13" y1="12" x2="22" y2="22" stroke="#C084FC" strokeWidth="0.4" opacity="0.5" />
                  <line x1="31" y1="12" x2="22" y2="22" stroke="#C084FC" strokeWidth="0.4" opacity="0.5" />
                </>
              )}
              {realm === 'AIR' && (
                <>
                  <ellipse cx="4" cy="20" rx="10" ry="14" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.25">
                    <animate attributeName="rx" values="10;13;10" dur="3s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="40" cy="20" rx="10" ry="14" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.25">
                    <animate attributeName="rx" values="10;13;10" dur="3s" repeatCount="indefinite" />
                  </ellipse>
                </>
              )}
              {chakraXP > 0 && (
                <circle cx="22" cy="48" r="3" fill="none" stroke={chakra.color} strokeWidth="1" opacity="0.6" />
              )}
            </svg>
          )}
        </div>

        {/* Coordinate + Chakra label */}
        <div className="text-center mt-1" style={{ opacity: isGhosted ? 0.25 : 0.7, transition: 'opacity 1s' }}>
          <span className="text-[7px] font-mono tracking-wider" style={{ color: avatarColor }}>
            [{gridX},{gridY}]
          </span>
          {chakraXP > 0 && (
            <span className="text-[6px] ml-1" style={{ color: chakra.color }}>
              {chakra.name}
            </span>
          )}
        </div>
      </motion.div>

      {/* Fibonacci depth indicator — replaces linear 9-segment bar */}
      <div
        className="absolute flex flex-col gap-px items-center"
        style={{
          right: 4,
          top: '15%',
          bottom: '20%',
          width: 8,
          opacity: 0.5,
        }}
        data-testid="fib-depth-indicator"
      >
        {FIB_DEPTH_STEPS.map((step, i) => {
          const isActive = i <= fibIndex;
          const stepHeight = i < FIB_DEPTH_STEPS.length - 1
            ? (FIB_DEPTH_STEPS[i + 1] - step) * 100
            : (1 - step) * 100;
          return (
            <div
              key={i}
              style={{
                flex: `${stepHeight} 0 0`,
                width: '100%',
                borderRadius: 2,
                background: isActive ? avatarColor : 'rgba(255,255,255,0.06)',
                opacity: isActive ? 0.7 : 0.3,
                transition: 'background 0.3s, opacity 0.3s',
              }}
            />
          );
        })}
      </div>

      {/* Stillness state indicator */}
      {isStill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute text-center"
          style={{
            left: '50%',
            top: `${avatarTop + 6}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="text-[7px] font-mono tracking-widest" style={{ color: `${avatarColor}60` }}>
            {isRevealed ? 'DEEP STILLNESS' : breathState.phase !== 'rest' ? breathState.phase.toUpperCase() : `${stillnessTimer}s`}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export { REALM_STYLES };
