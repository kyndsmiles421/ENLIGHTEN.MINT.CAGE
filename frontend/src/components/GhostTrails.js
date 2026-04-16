/**
 * GhostTrails.js — V55.0 Community Presence Layer
 * 
 * Renders translucent trails of other users in the same 9x9 space.
 * Only visible after 30s Stillness Threshold.
 * Ghost trails leave "residue sparks" that persist after the user departs.
 */
import React, { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHI_INV } from '../lib/SacredGeometry';

const API = process.env.REACT_APP_BACKEND_URL;

// Residue spark — glowing dot that fades over time
const ResidueSpark = memo(function ResidueSpark({ position, color, age }) {
  const opacity = Math.max(0.05, 0.3 * (1 - age / 300));
  const sparkSize = 3 + (1 - age / 300) * 4;
  // Map grid position (x:0-8, y:0-8) to viewport percentage
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
        boxShadow: `0 0 ${sparkSize * 2}px ${color}40`,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 2s',
      }}
    />
  );
});

// Ghost trail path — translucent line following another user's movement
const GhostPath = memo(function GhostPath({ trail, color }) {
  if (!trail || trail.length < 2) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`ghost-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline
        points={trail.map(p => {
          const x = 15 + (p.x / 8) * 70;
          const y = 15 + (p.y / 8) * 65;
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke={`url(#ghost-grad-${color.replace('#', '')})`}
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* Ghost avatar at trail head */}
      {trail.length > 0 && (() => {
        const head = trail[trail.length - 1];
        const hx = 15 + (head.x / 8) * 70;
        const hy = 15 + (head.y / 8) * 65;
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

/**
 * GhostTrails — Community presence overlay for SpatialRoom.
 * Fetches ghost trail data and renders translucent paths + residue sparks.
 * Only activates when stillnessTimer >= 30.
 */
export default function GhostTrails({ room, stillnessTimer = 0, userId, avatarColor, gridPosition }) {
  const [trails, setTrails] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [visible, setVisible] = useState(false);
  const pollRef = useRef(null);
  const updateRef = useRef(null);

  // Reveal ghost trails after 30s stillness
  useEffect(() => {
    if (stillnessTimer >= 30 && !visible) {
      setVisible(true);
    } else if (stillnessTimer < 5 && visible) {
      // Fade out when user starts moving again
      setVisible(false);
    }
  }, [stillnessTimer, visible]);

  // Poll for ghost trails when visible
  useEffect(() => {
    if (!visible || !room) return;

    const fetchTrails = async () => {
      try {
        const res = await fetch(`${API}/api/ghost-trails/${room}`);
        const data = await res.json();
        setTrails(data.trails || []);
        setSparks(data.sparks || []);
      } catch {}
    };

    fetchTrails();
    pollRef.current = setInterval(fetchTrails, 5000);
    return () => clearInterval(pollRef.current);
  }, [visible, room]);

  // Send own position updates periodically
  useEffect(() => {
    if (!room || !userId) return;

    const sendUpdate = async () => {
      try {
        await fetch(`${API}/api/ghost-trails/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            user_id: userId,
            position: gridPosition || { x: 4, y: 0 },
            color: avatarColor || '#A78BFA',
          }),
        });
      } catch {}
    };

    sendUpdate();
    updateRef.current = setInterval(sendUpdate, 8000);

    // Leave residue spark on unmount (room departure)
    return () => {
      clearInterval(updateRef.current);
      fetch(`${API}/api/ghost-trails/leave-spark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room,
          position: gridPosition || { x: 4, y: 0 },
          color: avatarColor || '#A78BFA',
        }),
      }).catch(() => {});
    };
  }, [room, userId, gridPosition, avatarColor]);

  // Only render when visible (stillness achieved)
  if (!visible && sparks.length === 0) return null;

  const now = Date.now() / 1000;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: visible ? 0.8 : 0.3, transition: 'opacity 3s' }}
      data-testid="ghost-trails-layer"
    >
      {/* Ghost trail paths */}
      <AnimatePresence>
        {visible && trails.map((t, i) => (
          <motion.div
            key={`trail-${t.user_id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <GhostPath trail={t.trail} color={t.color} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Residue sparks (always visible once created) */}
      {sparks.map((s, i) => (
        <ResidueSpark
          key={`spark-${i}`}
          position={s.position}
          color={s.color}
          age={now - s.created_at}
        />
      ))}

      {/* Active count indicator */}
      {visible && trails.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4"
        >
          <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {trails.length} soul{trails.length > 1 ? 's' : ''} nearby
          </span>
        </motion.div>
      )}
    </div>
  );
}
