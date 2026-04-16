/**
 * SovereignViewport.js — Global immersive wrapper for any module.
 * Provides: full-bleed background image, vignette, atmospheric particles, glass content area.
 * Usage: <SovereignViewport bgImage="url" accentColor="#hex" label="Module Name">...children...</SovereignViewport>
 * All props are optional — defaults to deep space black with subtle particles.
 */
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Particles({ color = '#6366F1', count = 18 }) {
  const pts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 1 + Math.random() * 2, dur: 6 + Math.random() * 10,
      delay: Math.random() * 5, drift: -12 + Math.random() * 24,
    })), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {pts.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: color, opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0], y: [0, p.drift], x: [0, p.drift * 0.3] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

export default function SovereignViewport({ bgImage, accentColor = '#6366F1', children, particles = true, particleCount = 18 }) {
  return (
    <div className="sovereign-viewport">
      <AnimatePresence mode="wait">
        {bgImage && (
          <motion.div key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="sovereign-bg-img"
            style={{ backgroundImage: `url(${bgImage})` }} />
        )}
      </AnimatePresence>
      <div className="sovereign-vignette" />
      <motion.div className="absolute inset-0"
        style={{ zIndex: 0, background: `radial-gradient(ellipse at 50% 30%, ${accentColor}12 0%, transparent 65%)` }} />
      {particles && <Particles color={accentColor} count={particleCount} />}
      <div className="sovereign-content">
        {children}
      </div>
    </div>
  );
}
