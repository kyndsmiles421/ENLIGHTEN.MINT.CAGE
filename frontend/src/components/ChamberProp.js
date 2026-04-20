/**
 * ChamberProp.js — V68.24 Interactive chamber hotspot
 *
 * A tap-activated glowing hotspot that sits ON TOP of the chamber
 * backdrop. When tapped, it triggers a gameplay callback. Used to
 * surface real interactive mini-games inside any holographic room
 * (meditation cushion, mason's chisel, wooden beam, mixing bowl,
 * lab pendulum, etc.).
 *
 * Props:
 *   x, y        — percentage position on the chamber (0-100)
 *   size        — hotspot diameter in px (default 72)
 *   label       — short verb shown on hover/focus, e.g. "BREATHE"
 *   icon        — single lucide icon (React component) or text glyph
 *   color       — accent colour of the prop glow
 *   onActivate  — called when the prop is tapped/clicked
 *   testid      — data-testid for QA
 *   disabled    — hide / ignore taps while a mini-game is active
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function ChamberProp({
  x, y,
  size = 72,
  label = '',
  icon = null,
  color = '#00ffcc',
  onActivate,
  testid = 'chamber-prop',
  disabled = false,
}) {
  if (disabled) return null;
  const isStringGlyph = typeof icon === 'string';
  const IconComp = !isStringGlyph && icon ? icon : null;
  return (
    <motion.button
      type="button"
      onClick={onActivate}
      data-testid={testid}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'fixed',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: `radial-gradient(circle at center, ${color}33 0%, ${color}11 50%, transparent 80%)`,
        boxShadow: `0 0 36px ${color}66, inset 0 0 16px ${color}55`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 6,
        backdropFilter: 'blur(2px)',
        padding: 0,
      }}
    >
      {/* Outer pulse ring (never stops so the prop reads as "alive") */}
      <motion.span
        animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `2px solid ${color}`,
          pointerEvents: 'none',
        }}
      />
      {/* Second delayed ring for staggered pulse */}
      <motion.span
        animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
        style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `2px solid ${color}`,
          pointerEvents: 'none',
        }}
      />
      {/* Icon / glyph */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, lineHeight: 1 }}>
        {IconComp ? <IconComp size={size * 0.42} /> : (isStringGlyph ? icon : null)}
      </span>
      {/* Label — always visible under the prop */}
      {label && (
        <span style={{
          position: 'absolute',
          top: size + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          letterSpacing: 2,
          fontFamily: 'monospace',
          color,
          whiteSpace: 'nowrap',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>
          {label}
        </span>
      )}
    </motion.button>
  );
}
