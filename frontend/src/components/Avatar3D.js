/**
 * Avatar3D.js — V54.8 Visual 3D Avatar Presence
 * 
 * A CSS 3D "Light Being" that inhabits the spatial room.
 * - Follows scroll Z-position through the 9x9 grid
 * - Realm-specific appearance (Crystalline in HOLLOW_EARTH, Ethereal in AIR, Grounded on SURFACE)
 * - Idle breathing animation + walk bobbing when scrolling
 * - Stillness ghosting (translucent glow after 30s)
 * - Collision radius emits proximity field to nearby items
 * - Trail particles mark the avatar's path
 */
import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

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

// Trail particle that fades behind the avatar
const TrailParticle = memo(function TrailParticle({ x, y, color, age }) {
  const opacity = Math.max(0, 1 - age / 8);
  if (opacity <= 0) return null;
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: 4 + (1 - age / 8) * 4,
        height: 4 + (1 - age / 8) * 4,
        background: color,
        opacity: opacity * 0.4,
        transform: `translate(-50%, -50%) scale(${1 - age / 12})`,
        transition: 'opacity 0.5s',
      }}
    />
  );
});

/**
 * Avatar3D — The visible presence in the spatial room
 */
export default function Avatar3D({
  scrollProgress = 0,
  realm = 'SURFACE',
  theme,
  isScrolling = false,
  stillnessTimer = 0,
  hiddenRevealed = false,
  roomName = '',
}) {
  const style = REALM_STYLES[realm] || REALM_STYLES.SURFACE;
  const accentColor = theme?.accent || style.coreColor;
  const [trail, setTrail] = useState([]);
  const lastProgressRef = useRef(0);
  const trailIdRef = useRef(0);
  const frameRef = useRef(0);

  // Smooth spring for avatar Y position
  const springProgress = useSpring(scrollProgress, { stiffness: 120, damping: 20 });

  // Grid position calculation
  const gridY = Math.floor(scrollProgress * (GRID_SIZE - 1));
  const gridX = 4; // Center column

  // Detect scroll movement for walk animation
  const isMoving = Math.abs(scrollProgress - lastProgressRef.current) > 0.002;

  // Stillness state
  const isStill = stillnessTimer > 5;
  const isGhosted = stillnessTimer > 20;
  const isRevealed = hiddenRevealed;

  // Trail generation
  useEffect(() => {
    const delta = Math.abs(scrollProgress - lastProgressRef.current);
    if (delta > 0.015) {
      trailIdRef.current += 1;
      setTrail(prev => [
        { id: trailIdRef.current, y: scrollProgress, age: 0 },
        ...prev.slice(0, 6),
      ]);
    }
    lastProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Age trail particles
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev =>
        prev.map(p => ({ ...p, age: p.age + 1 })).filter(p => p.age < 8)
      );
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Breathing animation frame
  useEffect(() => {
    let raf;
    const tick = () => {
      frameRef.current += 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Avatar vertical position maps to viewport
  const avatarTop = 15 + scrollProgress * 65; // 15% to 80% of viewport

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: '50%',
        top: 0,
        bottom: 0,
        width: 120,
        transform: 'translateX(-50%)',
        zIndex: 3,
      }}
      data-testid="avatar-3d-container"
    >
      {/* Trail particles */}
      {trail.map(p => (
        <TrailParticle
          key={p.id}
          x="50%"
          y={`${15 + p.y * 65}%`}
          color={style.trailColor}
          age={p.age}
        />
      ))}

      {/* Avatar aura field — proximity radius */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: `${avatarTop}%`,
          width: isRevealed ? 160 : isStill ? 120 : 80,
          height: isRevealed ? 160 : isStill ? 120 : 80,
          transform: 'translate(-50%, -50%)',
          background: style.aura,
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
          filter: style.filter,
        }}
        animate={{
          scale: isMoving ? [1, 1.04, 0.97, 1] : isGhosted ? 1.08 : 1,
          y: isMoving ? [0, -3, 1, 0] : 0,
        }}
        transition={{
          duration: isMoving ? 0.4 : 2,
          repeat: isMoving ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {/* Outer shell — geometric light form */}
        <div
          className="relative"
          style={{
            width: 44,
            height: 56,
            opacity: isGhosted ? 0.4 : 1,
            transition: 'opacity 2s',
          }}
        >
          {/* Diamond/crystal body shape */}
          <svg
            viewBox="0 0 44 56"
            width="44"
            height="56"
            style={{ overflow: 'visible' }}
          >
            {/* Body — diamond crystal form */}
            <polygon
              points="22,2 40,22 22,54 4,22"
              fill={style.shellColor}
              stroke={accentColor}
              strokeWidth="1.2"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 6px ${accentColor}40)`,
              }}
            />
            {/* Inner facet lines */}
            <line x1="22" y1="2" x2="22" y2="54" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
            <line x1="4" y1="22" x2="40" y2="22" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
            <line x1="22" y1="2" x2="4" y2="22" stroke={accentColor} strokeWidth="0.3" opacity="0.2" />
            <line x1="22" y1="2" x2="40" y2="22" stroke={accentColor} strokeWidth="0.3" opacity="0.2" />

            {/* Core energy point */}
            <circle
              cx="22"
              cy="22"
              r="6"
              fill={accentColor}
              opacity="0.8"
            >
              <animate
                attributeName="r"
                values={isStill ? '6;8;6' : '5;6.5;5'}
                dur={isStill ? '3s' : '2s'}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values={isGhosted ? '0.3;0.6;0.3' : '0.7;1;0.7'}
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Eye / consciousness point */}
            <circle cx="22" cy="16" r="2" fill={accentColor} opacity="0.9">
              <animate
                attributeName="opacity"
                values="0.9;0.5;0.9"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Realm-specific decorations */}
            {realm === 'HOLLOW_EARTH' && (
              <>
                {/* Crystal facets */}
                <line x1="13" y1="12" x2="22" y2="22" stroke="#C084FC" strokeWidth="0.4" opacity="0.5" />
                <line x1="31" y1="12" x2="22" y2="22" stroke="#C084FC" strokeWidth="0.4" opacity="0.5" />
                <line x1="13" y1="32" x2="22" y2="22" stroke="#C084FC" strokeWidth="0.4" opacity="0.5" />
                <line x1="31" y1="32" x2="22" y2="22" stroke="#C084FC" strokeWidth="0.4" opacity="0.5" />
              </>
            )}
            {realm === 'AIR' && (
              <>
                {/* Ethereal wings */}
                <ellipse cx="6" cy="20" rx="8" ry="12" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="rx" values="8;10;8" dur="3s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="38" cy="20" rx="8" ry="12" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="rx" values="8;10;8" dur="3s" repeatCount="indefinite" />
                </ellipse>
              </>
            )}
          </svg>

          {/* Ghosting overlay for stillness */}
          {isGhosted && (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle, ${accentColor}20, transparent)`,
                animation: 'pulse 3s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Coordinate label below avatar */}
        <div
          className="text-center mt-1"
          style={{
            opacity: isGhosted ? 0.3 : 0.7,
            transition: 'opacity 1s',
          }}
        >
          <span
            className="text-[7px] font-mono tracking-wider"
            style={{ color: accentColor }}
          >
            [{gridX},{gridY}]
          </span>
        </div>
      </motion.div>

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
          <span
            className="text-[7px] font-mono tracking-widest"
            style={{ color: `${accentColor}60` }}
          >
            {isRevealed ? 'DEEP STILLNESS' : `${stillnessTimer}s`}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export { REALM_STYLES };
