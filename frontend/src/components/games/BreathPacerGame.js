/**
 * BreathPacerGame.js — V68.24 Interactive meditation mini-game
 *
 * Tap-to-breathe rhythm game that replaces "tap a circle around a
 * square" with actual mechanic:
 *
 *   1. A circle expands (INHALE 4s) and contracts (EXHALE 6s) with
 *      a 1s hold between.
 *   2. The player HOLDS the circle while it's expanding (inhale) and
 *      RELEASES it while it's contracting (exhale).
 *   3. Every correctly-timed full cycle = +5 Sparks (RANK XP).
 *   4. A combo meter rewards consecutive perfect cycles with a 2x
 *      multiplier at 3-combo, 3x at 5-combo.
 *   5. Drift out of sync = combo resets, cycle still rewards +1 Spark
 *      so the session always feels generous, never punishing.
 *
 * Sparks are credited server-side through the existing
 * POST /api/sparks/immersion endpoint (earned-only, never currency).
 *
 * Props:
 *   open        — boolean. When true, the pacer overlays the chamber
 *   onClose     — callback when the user exits
 *   color       — accent colour (default #D8B4FE)
 */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { useSensory } from '../../context/SensoryContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const INHALE_MS = 4000;
const HOLD_MS   = 1000;
const EXHALE_MS = 6000;
const CYCLE_MS  = INHALE_MS + HOLD_MS + EXHALE_MS;

const phaseOf = (ms) => {
  const t = ms % CYCLE_MS;
  if (t < INHALE_MS) return 'inhale';
  if (t < INHALE_MS + HOLD_MS) return 'hold';
  return 'exhale';
};

export default function BreathPacerGame({ open, onClose, color = '#D8B4FE' }) {
  const sensory = useSensory() || {};
  const reduceFlashing = !!(sensory.prefs && sensory.prefs.reduceFlashing);
  const reduceMotion   = !!(sensory.prefs && sensory.prefs.reduceMotion);
  const [isHolding, setIsHolding]   = useState(false);
  const [phase, setPhase]           = useState('inhale');
  const [cycleScore, setCycleScore] = useState(0); // 0-100 quality meter for current cycle
  const [combo, setCombo]           = useState(0);
  const [totalXP, setTotalXP]       = useState(0);
  const [cyclesDone, setCyclesDone] = useState(0);
  const scoreRef = useRef(0);
  const startRef = useRef(0);
  const holdTrackRef = useRef([]); // array of { t, holding }
  const lastCycleRef = useRef(-1);

  useEffect(() => {
    if (!open) return;
    startRef.current = performance.now();
    scoreRef.current = 0;
    lastCycleRef.current = -1;
    setCycleScore(0);
    setCombo(0);
    setTotalXP(0);
    setCyclesDone(0);
    holdTrackRef.current = [];
    let raf;
    const tick = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;
      const currentPhase = phaseOf(elapsed);
      setPhase(currentPhase);
      // Track hold samples every frame.
      holdTrackRef.current.push({ t: elapsed, holding: isHoldingRef.current });
      // Only keep last ~1 cycle worth of samples.
      if (holdTrackRef.current.length > 1500) holdTrackRef.current.shift();
      // Update live quality meter: +1 score if state matches phase.
      const want = currentPhase === 'inhale' ? true : currentPhase === 'exhale' ? false : null;
      if (want === null) {
        scoreRef.current += 0.3; // hold phase: any state is fine, small credit
      } else if (isHoldingRef.current === want) {
        scoreRef.current += 1;
      }
      setCycleScore(Math.min(100, (scoreRef.current / 500) * 100));
      // Cycle boundary detection
      const currentCycleIdx = Math.floor(elapsed / CYCLE_MS);
      if (currentCycleIdx !== lastCycleRef.current) {
        if (lastCycleRef.current >= 0) {
          // Score the cycle that just ended.
          const pct = Math.min(100, (scoreRef.current / 500) * 100);
          let reward = 1;
          let newCombo = combo;
          if (pct >= 70) {
            newCombo = combo + 1;
            reward = 5;
            if (newCombo >= 5) reward = 15;
            else if (newCombo >= 3) reward = 10;
          } else {
            newCombo = 0;
          }
          setCombo(newCombo);
          setTotalXP((x) => x + reward);
          setCyclesDone((c) => c + 1);
          // Credit Sparks XP via existing immersion endpoint (never currency).
          const token = localStorage.getItem('zen_token');
          if (token && token !== 'guest_token') {
            axios.post(
              `${API}/sparks/immersion`,
              { seconds: 11, zone: 'breath_pacer' },
              { headers: { Authorization: `Bearer ${token}` } },
            ).catch(() => {});
          }
          window.dispatchEvent(new CustomEvent('sovereign:immersion-tick'));
        }
        lastCycleRef.current = currentCycleIdx;
        scoreRef.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Hold state ref so the rAF loop doesn't need to be re-created.
  const isHoldingRef = useRef(false);
  useEffect(() => { isHoldingRef.current = isHolding; }, [isHolding]);

  if (!open) return null;

  const cueText = phase === 'inhale' ? 'HOLD TO INHALE' : phase === 'hold' ? 'PAUSE' : 'RELEASE TO EXHALE';
  // The circle's scale tracks the phase so it breathes for the user.
  const elapsed = performance.now() - startRef.current;
  const t = elapsed % CYCLE_MS;
  let breathScale = 0.5;
  if (t < INHALE_MS) breathScale = 0.5 + (t / INHALE_MS) * 0.5;
  else if (t < INHALE_MS + HOLD_MS) breathScale = 1.0;
  else breathScale = 1.0 - ((t - INHALE_MS - HOLD_MS) / EXHALE_MS) * 0.5;

  return (
    <AnimatePresence>
      <motion.div
        key="breath-pacer"
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
        data-testid="breath-pacer-game"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          data-testid="breath-pacer-close"
          style={{
            position: 'absolute', top: 18, right: 18,
            background: 'rgba(0,0,0,0.5)', border: `1px solid ${color}55`,
            color, borderRadius: 999, padding: 6, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>

        {/* XP + combo readouts */}
        <div style={{
          position: 'absolute', top: 18, left: 18,
          fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, color,
          display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <span data-testid="breath-pacer-xp">+{totalXP} SPARKS · XP</span>
          <span data-testid="breath-pacer-cycles">{cyclesDone} BREATHS</span>
          {combo >= 2 && (
            <span
              data-testid="breath-pacer-combo"
              style={{ color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Flame size={12} /> {combo}× COMBO
            </span>
          )}
        </div>

        {/* Breathing orb — press & hold to play */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setIsHolding(true); }}
          onMouseUp={() => setIsHolding(false)}
          onMouseLeave={() => setIsHolding(false)}
          onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
          onTouchEnd={() => setIsHolding(false)}
          onTouchCancel={() => setIsHolding(false)}
          onKeyDown={(e) => { if (e.code === 'Space') { e.preventDefault(); setIsHolding(true); } }}
          onKeyUp={(e) => { if (e.code === 'Space') { e.preventDefault(); setIsHolding(false); } }}
          data-testid="breath-pacer-orb"
          style={{
            width: 320, height: 320, borderRadius: '50%',
            border: `2px solid ${color}`,
            background: `radial-gradient(circle at center, ${color}44 0%, ${color}11 60%, transparent 100%)`,
            boxShadow: reduceFlashing ? 'none' : `0 0 60px ${color}88`,
            color: '#fff', fontFamily: 'Cormorant Garamond, serif',
            fontSize: 24, letterSpacing: 3, fontWeight: 300,
            cursor: 'pointer', touchAction: 'none',
            transform: reduceMotion ? 'scale(1)' : `scale(${breathScale})`,
            transition: 'transform 120ms ease-out',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: isHolding ? `6px solid ${color}55` : 'none',
          }}
        >
          {cueText}
        </button>

        {/* Phase + sync quality meter */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
            SYNC QUALITY
          </div>
          <div style={{ width: 240, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${cycleScore}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              style={{
                height: '100%',
                background: cycleScore > 70 ? '#22C55E' : cycleScore > 40 ? color : '#F87171',
                boxShadow: reduceFlashing ? 'none' : `0 0 12px ${cycleScore > 70 ? '#22C55E' : color}66`,
              }}
              data-testid="breath-pacer-sync"
            />
          </div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', marginTop: 10, textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
            HOLD THE ORB WHILE IT EXPANDS (INHALE) · RELEASE WHILE IT CONTRACTS (EXHALE) · 70%+ SYNC = BONUS XP · HOLD SPACEBAR ON DESKTOP
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
