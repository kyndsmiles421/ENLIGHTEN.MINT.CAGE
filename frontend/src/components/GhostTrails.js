/**
 * GhostTrails.js — V55.0 Community Presence + Resonance Layer
 * 
 * Renders translucent trails of other users + Resonance Score overlay.
 * Ghost trails visible after 30s Stillness Threshold.
 * Residue sparks persist as Masonry crafting materials.
 * Resonance Score: φ-scaled multiplier for collective stillness.
 */
import React, { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHI_INV } from '../lib/SacredGeometry';

const API = process.env.REACT_APP_BACKEND_URL;

// Residue spark — glowing dot that fades over time
const ResidueSpark = memo(function ResidueSpark({ position, color, age, blessed }) {
  const opacity = Math.max(0.05, 0.3 * (1 - age / 300));
  const sparkSize = blessed ? 5 + (1 - age / 300) * 5 : 3 + (1 - age / 300) * 4;
  const left = 15 + (position.x / 8) * 70;
  const top = 15 + (position.y / 8) * 65;

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: sparkSize,
        height: sparkSize,
        background: color,
        opacity,
        boxShadow: blessed
          ? `0 0 ${sparkSize * 3}px ${color}60, 0 0 ${sparkSize}px ${color}`
          : `0 0 ${sparkSize * 2}px ${color}40`,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 2s',
      }}
    />
  );
});

// Ghost trail path
const GhostPath = memo(function GhostPath({ trail, color }) {
  if (!trail || trail.length < 2) return null;
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}
      viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={trail.map(p => `${15 + (p.x / 8) * 70},${15 + (p.y / 8) * 65}`).join(' ')}
        fill="none" stroke={color} strokeWidth="0.3" strokeLinecap="round" opacity="0.25"
      />
      {trail.length > 0 && (() => {
        const h = trail[trail.length - 1];
        const hx = 15 + (h.x / 8) * 70, hy = 15 + (h.y / 8) * 65;
        return (
          <g>
            <circle cx={hx} cy={hy} r="0.8" fill={color} opacity="0.2" />
            <circle cx={hx} cy={hy} r="0.4" fill={color} opacity="0.35">
              <animate attributeName="r" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })()}
    </svg>
  );
});

// Resonance Score display
function ResonanceIndicator({ resonance }) {
  if (!resonance || resonance.still_count < 1) return null;
  const levelColors = {
    silent: 'rgba(255,255,255,0.2)',
    centered: '#FCD34D',
    attuned: '#22C55E',
    harmonic: '#8B5CF6',
    radiant: '#D946EF',
  };
  const color = levelColors[resonance.level] || levelColors.silent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-16 right-4 text-right pointer-events-none"
      style={{ zIndex: 4 }}
      data-testid="resonance-indicator"
    >
      <div className="flex items-center gap-1.5 justify-end">
        <div className="w-2 h-2 rounded-full" style={{
          background: color,
          boxShadow: `0 0 8px ${color}60`,
          animation: resonance.still_count >= 2 ? 'pulse 2s ease-in-out infinite' : 'none',
        }} />
        <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color }}>
          {resonance.level}
        </span>
      </div>
      <span className="text-[7px] font-mono" style={{ color: `${color}80` }}>
        {resonance.score} RP | {resonance.still_count} still | x{resonance.multiplier}
      </span>
    </motion.div>
  );
}

/**
 * GhostTrails — Community presence + Resonance overlay.
 */
export default function GhostTrails({ room, stillnessTimer = 0, userId, avatarColor, gridPosition }) {
  const [trails, setTrails] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [resonance, setResonance] = useState(null);
  const [visible, setVisible] = useState(false);
  const pollRef = useRef(null);
  const updateRef = useRef(null);

  // Reveal after 30s stillness
  useEffect(() => {
    if (stillnessTimer >= 30 && !visible) setVisible(true);
    else if (stillnessTimer < 5 && visible) setVisible(false);
  }, [stillnessTimer, visible]);

  // Poll ghost trails + resonance
  useEffect(() => {
    if (!room) return;
    const fetchTrails = async () => {
      try {
        const res = await fetch(`${API}/api/ghost-trails/${room}`);
        const data = await res.json();
        setTrails(data.trails || []);
        setSparks(data.sparks || []);
        setResonance(data.resonance || null);
      } catch {}
    };
    fetchTrails();
    pollRef.current = setInterval(fetchTrails, visible ? 5000 : 15000);
    return () => clearInterval(pollRef.current);
  }, [visible, room]);

  // Send position + stillness updates
  useEffect(() => {
    if (!room || !userId) return;
    const sendUpdate = async () => {
      try {
        await fetch(`${API}/api/ghost-trails/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room, user_id: userId,
            position: gridPosition || { x: 4, y: 0 },
            color: avatarColor || '#A78BFA',
            is_still: stillnessTimer >= 30,
            stillness_s: stillnessTimer,
          }),
        });
      } catch {}
    };
    sendUpdate();
    updateRef.current = setInterval(sendUpdate, 8000);
    return () => {
      clearInterval(updateRef.current);
      fetch(`${API}/api/ghost-trails/leave-spark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room, position: gridPosition || { x: 4, y: 0 },
          color: avatarColor || '#A78BFA', user_id: userId || 'anon',
        }),
      }).catch(() => {});
    };
  }, [room, userId, gridPosition, avatarColor, stillnessTimer]);

  const now = Date.now() / 1000;

  return (
    <>
      {/* Resonance Score — always visible when active */}
      <ResonanceIndicator resonance={resonance} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1, opacity: visible ? 0.8 : 0.3, transition: 'opacity 3s' }}
        data-testid="ghost-trails-layer"
      >
        {/* Ghost paths */}
        <AnimatePresence>
          {visible && trails.map(t => (
            <motion.div key={`trail-${t.user_id}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 2 }} className="absolute inset-0">
              <GhostPath trail={t.trail} color={t.color} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Residue sparks */}
        {sparks.map((s, i) => (
          <ResidueSpark key={`spark-${i}`} position={s.position} color={s.color}
            age={now - s.created_at} blessed={s.blessed} />
        ))}

        {/* Active count */}
        {visible && trails.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-4">
            <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {trails.length} soul{trails.length > 1 ? 's' : ''} nearby
            </span>
          </motion.div>
        )}
      </div>
    </>
  );
}
