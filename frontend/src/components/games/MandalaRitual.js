/**
 * MandalaRitual.js — V68.25 Inline focus mini-game
 *
 * Replaces the old "jump to cosmic mode" action on the mandala prop
 * with an actual 30-second focus ritual played IN the chamber:
 *
 *   1. A mandala with 8 rotating segments appears.
 *   2. One segment glows "target". Player taps when the rotating
 *      indicator aligns with the target → +2 Sparks XP.
 *   3. Miss → no penalty, just no reward.
 *   4. Every hit speeds the rotation slightly (harder with progress).
 *   5. 30 seconds, then auto-close with a session summary.
 *
 * Sparks credited via POST /api/sparks/immersion (RANK XP only).
 */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SESSION_MS = 30000;
const SEGMENTS = 8;
const ALIGN_TOLERANCE = (Math.PI * 2) / SEGMENTS * 0.35; // ~40% of segment arc

export default function MandalaRitual({ open, onClose, color = '#F472B6' }) {
  const [angle, setAngle]       = useState(0);
  const [targetIdx, setTargetIdx] = useState(0);
  const [hits, setHits]         = useState(0);
  const [misses, setMisses]     = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_MS / 1000);
  const [xp, setXP]             = useState(0);
  const startRef = useRef(0);
  const speedRef = useRef(1.0);
  const lastAlignScore = useRef(0);

  useEffect(() => {
    if (!open) return;
    startRef.current = performance.now();
    speedRef.current = 1.0;
    setAngle(0); setHits(0); setMisses(0); setXP(0);
    setTargetIdx(Math.floor(Math.random() * SEGMENTS));
    let raf;
    const tick = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;
      const left = Math.max(0, SESSION_MS - elapsed);
      setTimeLeft(Math.ceil(left / 1000));
      // Rotate CCW
      setAngle((a) => (a + 0.018 * speedRef.current) % (Math.PI * 2));
      if (left <= 0) {
        // Close out the session — final XP is the running total
        window.setTimeout(() => onClose?.(), 200);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleTap = () => {
    const segment = (Math.PI * 2) / SEGMENTS;
    const indicatorSeg = Math.round(angle / segment) % SEGMENTS;
    const targetAngle = targetIdx * segment;
    const delta = Math.min(
      Math.abs(angle - targetAngle),
      Math.PI * 2 - Math.abs(angle - targetAngle),
    );
    if (delta <= ALIGN_TOLERANCE) {
      // HIT
      setHits((h) => h + 1);
      setXP((x) => x + 2);
      lastAlignScore.current = 1;
      speedRef.current = Math.min(2.2, speedRef.current + 0.07);
      setTargetIdx(Math.floor(Math.random() * SEGMENTS));
      const token = localStorage.getItem('zen_token');
      if (token && token !== 'guest_token') {
        axios.post(
          `${API}/sparks/immersion`,
          { seconds: 5, zone: 'mandala_ritual' },
          { headers: { Authorization: `Bearer ${token}` } },
        ).catch(() => {});
      }
      window.dispatchEvent(new CustomEvent('sovereign:immersion-tick'));
    } else {
      setMisses((m) => m + 1);
      lastAlignScore.current = 0;
    }
    // Intentional noop on indicatorSeg — may be used for future haptics
    void indicatorSeg;
  };

  if (!open) return null;

  const cx = 160, cy = 160, r = 130;
  const segmentArc = (Math.PI * 2) / SEGMENTS;
  return (
    <AnimatePresence>
      <motion.div
        key="mandala-ritual"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          userSelect: 'none', touchAction: 'none',
        }}
        data-testid="mandala-ritual"
      >
        <button
          type="button"
          onClick={onClose}
          data-testid="mandala-ritual-close"
          style={{
            position: 'absolute', top: 18, right: 18,
            background: 'rgba(0,0,0,0.5)', border: `1px solid ${color}55`,
            color, borderRadius: 999, padding: 6, cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
        {/* Stats */}
        <div style={{
          position: 'absolute', top: 18, left: 18,
          display: 'flex', gap: 16, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, color,
        }}>
          <span data-testid="mandala-xp">+{xp} SPARKS · XP</span>
          <span data-testid="mandala-hits">{hits} ALIGN · {misses} MISS</span>
          <span data-testid="mandala-time" style={{ color: timeLeft <= 5 ? '#F87171' : color }}>
            {timeLeft}s
          </span>
        </div>

        {/* The mandala itself */}
        <svg
          viewBox="0 0 320 320"
          width="320" height="320"
          onClick={handleTap}
          data-testid="mandala-ritual-svg"
          style={{ cursor: 'crosshair', touchAction: 'manipulation' }}
        >
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={`${color}44`} strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r - 18} fill="none" stroke={`${color}33`} strokeWidth="1" />
          {/* 8 segments */}
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const a1 = i * segmentArc;
            const x1 = cx + Math.cos(a1) * (r - 18);
            const y1 = cy + Math.sin(a1) * (r - 18);
            const x2 = cx + Math.cos(a1) * (r + 12);
            const y2 = cy + Math.sin(a1) * (r + 12);
            const isTarget = i === targetIdx;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isTarget ? color : `${color}55`}
                strokeWidth={isTarget ? 3 : 1}
                style={{ filter: isTarget ? `drop-shadow(0 0 6px ${color})` : 'none' }}
              />
            );
          })}
          {/* Target glyph */}
          <circle
            cx={cx + Math.cos(targetIdx * segmentArc) * r}
            cy={cy + Math.sin(targetIdx * segmentArc) * r}
            r="10"
            fill={color}
            style={{ filter: `drop-shadow(0 0 10px ${color})` }}
          />
          {/* Rotating indicator */}
          <g transform={`rotate(${(angle * 180) / Math.PI} ${cx} ${cy})`}>
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#fff" strokeWidth="2" />
            <circle cx={cx + r} cy={cy} r="7" fill="#fff" />
          </g>
          {/* Center */}
          <circle cx={cx} cy={cy} r="6" fill={color} />
        </svg>
        <div style={{
          marginTop: 14, textAlign: 'center',
          color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
          maxWidth: 420, lineHeight: 1.6,
        }}>
          TAP WHEN THE WHITE INDICATOR ALIGNS WITH THE GLOWING TARGET · HITS SPEED THE WHEEL · 30s RITUAL
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
