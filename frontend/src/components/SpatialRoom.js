/**
 * SpatialRoom.js — CSS 3D Spatial Environment Wrapper
 * 
 * Transforms flat pages into spatial "rooms" users enter.
 * Uses CSS perspective, translateZ, rotateX for depth.
 * Each room has: floor, walls (parallax layers), ambient particles,
 * and an entry transition that feels like walking through a door.
 * 
 * The mixer bar becomes a HUD at the bottom of the viewport,
 * not a floating overlay — it's part of the room's Z-space.
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ROOM_THEMES = {
  nourishment:  { floor: '#0d1a0f', wall: '#0a150c', accent: '#22C55E', ambient: 'rgba(34,197,94,0.03)', particles: '#22C55E', icon: '🍃', name: 'The Living Kitchen' },
  herbology:    { floor: '#0f1a0d', wall: '#0c150a', accent: '#84CC16', ambient: 'rgba(132,204,22,0.03)', particles: '#84CC16', icon: '🌿', name: 'Herb Garden Sanctum' },
  crystals:     { floor: '#0d0d1a', wall: '#0a0a15', accent: '#8B5CF6', ambient: 'rgba(139,92,246,0.03)', particles: '#8B5CF6', icon: '💎', name: 'Crystal Chamber' },
  aromatherapy: { floor: '#1a0d1a', wall: '#150a15', accent: '#C084FC', ambient: 'rgba(192,132,252,0.03)', particles: '#C084FC', icon: '🌸', name: 'Essence Temple' },
  meditation:   { floor: '#0d0d18', wall: '#0a0a14', accent: '#D8B4FE', ambient: 'rgba(216,180,254,0.03)', particles: '#D8B4FE', icon: '🧘', name: 'Meditation Hall' },
  breathing:    { floor: '#0d1518', wall: '#0a1214', accent: '#2DD4BF', ambient: 'rgba(45,212,191,0.03)', particles: '#2DD4BF', icon: '🌬', name: 'Breath Chamber' },
  yoga:         { floor: '#18150d', wall: '#14120a', accent: '#FCD34D', ambient: 'rgba(252,211,77,0.03)', particles: '#FCD34D', icon: '🕉', name: 'Yoga Studio' },
  elixirs:      { floor: '#1a160d', wall: '#15120a', accent: '#FCD34D', ambient: 'rgba(252,211,77,0.03)', particles: '#FCD34D', icon: '🧪', name: 'Alchemy Lab' },
  acupressure:  { floor: '#0d1518', wall: '#0a1214', accent: '#2DD4BF', ambient: 'rgba(45,212,191,0.03)', particles: '#2DD4BF', icon: '🤲', name: 'Meridian Room' },
  oracle:       { floor: '#150d18', wall: '#120a14', accent: '#E879F9', ambient: 'rgba(232,121,249,0.03)', particles: '#E879F9', icon: '🔮', name: 'Oracle Chamber' },
  star_chart:   { floor: '#0a0a14', wall: '#080810', accent: '#6366F1', ambient: 'rgba(99,102,241,0.03)', particles: '#6366F1', icon: '✨', name: 'Observatory' },
  teachings:    { floor: '#1a150d', wall: '#15120a', accent: '#D4AF37', ambient: 'rgba(212,175,55,0.03)', particles: '#D4AF37', icon: '📿', name: 'Temple of Wisdom' },
  encyclopedia: { floor: '#18120d', wall: '#140e0a', accent: '#FB923C', ambient: 'rgba(251,146,60,0.03)', particles: '#FB923C', icon: '📖', name: 'Grand Library' },
  frequencies:  { floor: '#120d18', wall: '#0e0a14', accent: '#8B5CF6', ambient: 'rgba(139,92,246,0.03)', particles: '#8B5CF6', icon: '🎵', name: 'Frequency Lab' },
  sacred_texts: { floor: '#1a160d', wall: '#15120a', accent: '#D4AF37', ambient: 'rgba(212,175,55,0.03)', particles: '#D4AF37', icon: '📜', name: 'Sacred Archive' },
  community:    { floor: '#0d1518', wall: '#0a1214', accent: '#38BDF8', ambient: 'rgba(56,189,248,0.03)', particles: '#38BDF8', icon: '🌐', name: 'Gathering Hall' },
  default:      { floor: '#0a0a12', wall: '#08080e', accent: '#A78BFA', ambient: 'rgba(167,139,250,0.03)', particles: '#A78BFA', icon: '✦', name: 'Sovereign Space' },
};

function AmbientParticles({ color, count = 12 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            background: color,
            opacity: 0.15 + Math.random() * 0.15,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function SpatialRoom({ room = 'default', children }) {
  const theme = ROOM_THEMES[room] || ROOM_THEMES.default;
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative min-h-screen"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 40%',
        background: theme.floor,
        overflow: 'hidden',
      }}
      data-testid={`spatial-room-${room}`}
    >
      {/* Floor gradient — depth cue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${theme.wall} 0%, ${theme.floor} 30%, ${theme.floor} 70%, ${theme.wall}80 100%)`,
          zIndex: 0,
        }}
      />

      {/* Side wall gradients — peripheral depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute left-0 top-0 bottom-0 w-12" style={{ background: `linear-gradient(90deg, ${theme.wall}60, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-12" style={{ background: `linear-gradient(-90deg, ${theme.wall}60, transparent)` }} />
      </div>

      {/* Ceiling accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `${theme.accent}15`, zIndex: 1 }} />

      {/* Ambient floating particles */}
      <AmbientParticles color={theme.particles} count={14} />

      {/* Room entrance header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -20 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute top-3 left-5 flex items-center gap-2 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <span className="text-lg">{theme.icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.25em]"
          style={{ color: `${theme.accent}60` }}>
          {theme.name}
        </span>
      </motion.div>

      {/* Content — enters with a spatial push from behind */}
      <motion.div
        initial={{ opacity: 0, transform: 'translateZ(-80px) rotateX(2deg)' }}
        animate={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateZ(0px) rotateX(0deg)' : 'translateZ(-80px) rotateX(2deg)',
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ zIndex: 1, transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export { ROOM_THEMES };
