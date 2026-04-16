/**
 * YogaGuidedFlow.js — V56.1 Timed Pose Sequence with Breath Sync
 * 
 * A guided yoga session that:
 * 1. Displays poses one at a time with a countdown timer
 * 2. Syncs breathing cues (inhale/exhale) for each pose
 * 3. Awards XP per completed pose, bonus for full sequence
 * 4. Visual breath ring that pulses with the breathing rhythm
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, ChevronRight, Timer, Wind, Award } from 'lucide-react';

const PHI = 1.618033988749895;

// Breath patterns for different pose types
const BREATH_PATTERNS = {
  default: { inhale: 4, hold: 2, exhale: 4, rest: 1 },
  restorative: { inhale: 5, hold: 3, exhale: 6, rest: 2 },
  power: { inhale: 3, hold: 1, exhale: 3, rest: 0.5 },
  meditation: { inhale: 6, hold: 4, exhale: 8, rest: 2 },
};

function BreathRing({ phase, progress, color }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="absolute">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <motion.div
        animate={{
          scale: phase === 'inhale' ? [1, 1.15] : phase === 'exhale' ? [1.15, 1] : 1,
        }}
        transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 4 : 0.5 }}
        className="text-center"
      >
        <Wind size={16} style={{ color, margin: '0 auto 2px' }} />
        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
          {phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : phase === 'exhale' ? 'Breathe Out' : 'Rest'}
        </p>
      </motion.div>
    </div>
  );
}

export default function YogaGuidedFlow({ sequence, style, color = '#FCD34D', onComplete }) {
  const [active, setActive] = useState(false);
  const [poseIndex, setPoseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathPhase, setBreathPhase] = useState('rest');
  const [breathProgress, setBreathProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [posesCompleted, setPosesCompleted] = useState(0);
  const timerRef = useRef(null);
  const breathRef = useRef(null);

  const poses = sequence?.poses || [];
  const currentPose = poses[poseIndex];
  const breathPattern = BREATH_PATTERNS[style?.difficulty === 'advanced' ? 'power' : 'default'];

  // Parse pose duration (e.g. "30 seconds" → 30)
  const parseDuration = (dur) => {
    if (!dur) return 30;
    const num = parseInt(dur);
    return isNaN(num) ? 30 : num;
  };

  const startFlow = useCallback(() => {
    setActive(true);
    setPoseIndex(0);
    setPosesCompleted(0);
    setCompleted(false);
    if (poses[0]) {
      setTimeLeft(parseDuration(poses[0].duration));
    }
  }, [poses]);

  const stopFlow = useCallback(() => {
    setActive(false);
    clearInterval(timerRef.current);
    clearInterval(breathRef.current);
  }, []);

  const skipPose = useCallback(() => {
    if (poseIndex + 1 < poses.length) {
      setPoseIndex(i => i + 1);
      setPosesCompleted(c => c + 1);
      setTimeLeft(parseDuration(poses[poseIndex + 1]?.duration));
      if (typeof window.__workAccrue === 'function') window.__workAccrue('yoga_practice', 5);
    } else {
      setCompleted(true);
      setActive(false);
      setPosesCompleted(c => c + 1);
      if (typeof window.__workAccrue === 'function') window.__workAccrue('yoga_practice', 25);
      onComplete?.();
    }
  }, [poseIndex, poses, onComplete]);

  // Pose timer
  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          skipPose();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, skipPose]);

  // Breath cycle
  useEffect(() => {
    if (!active) { setBreathPhase('rest'); return; }
    const cycle = breathPattern.inhale + breathPattern.hold + breathPattern.exhale + breathPattern.rest;
    let elapsed = 0;

    breathRef.current = setInterval(() => {
      elapsed += 0.1;
      const pos = elapsed % cycle;
      
      if (pos < breathPattern.inhale) {
        setBreathPhase('inhale');
        setBreathProgress(pos / breathPattern.inhale);
      } else if (pos < breathPattern.inhale + breathPattern.hold) {
        setBreathPhase('hold');
        setBreathProgress(1);
      } else if (pos < breathPattern.inhale + breathPattern.hold + breathPattern.exhale) {
        setBreathPhase('exhale');
        setBreathProgress(1 - (pos - breathPattern.inhale - breathPattern.hold) / breathPattern.exhale);
      } else {
        setBreathPhase('rest');
        setBreathProgress(0);
      }
    }, 100);

    return () => clearInterval(breathRef.current);
  }, [active, breathPattern]);

  if (!sequence || poses.length === 0) return null;

  const totalDuration = poses.reduce((sum, p) => sum + parseDuration(p.duration), 0);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}15` }}
      data-testid="yoga-guided-flow">
      
      {!active && !completed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer size={14} style={{ color }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
              {sequence.name} — Guided Flow
            </span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {poses.length} poses | ~{Math.round(totalDuration / 60)} min | {sequence.level || 'All Levels'}
          </p>
          <button onClick={startFlow}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-sm font-medium"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
            data-testid="start-flow-btn">
            <Play size={16} /> Begin Flow
          </button>
        </motion.div>
      )}

      {active && currentPose && (
        <motion.div
          key={poseIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Pose {poseIndex + 1}/{poses.length}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={stopFlow} className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Pause size={12} style={{ color: '#EF4444' }} />
              </button>
              <button onClick={skipPose} className="p-1.5 rounded-lg" style={{ background: `${color}10` }}>
                <SkipForward size={12} style={{ color }} />
              </button>
            </div>
          </div>

          {/* Pose + Breath */}
          <div className="flex items-center gap-6">
            <BreathRing phase={breathPhase} progress={breathProgress} color={color} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>{currentPose.name}</h3>
              {currentPose.sanskrit && (
                <p className="text-xs" style={{ color }}>{currentPose.sanskrit}</p>
              )}
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {currentPose.description?.substring(0, 150)}
              </p>
            </div>
          </div>

          {/* Timer bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {timeLeft}s remaining
              </span>
              <span className="text-[10px]" style={{ color }}>
                +5 XP per pose
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                animate={{ width: `${(timeLeft / parseDuration(currentPose.duration)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {completed && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3 py-4">
          <Award size={32} style={{ color, margin: '0 auto' }} />
          <p className="text-sm font-bold" style={{ color }}>Flow Complete!</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {posesCompleted} poses | +{posesCompleted * 5 + 25} XP earned
          </p>
          <button onClick={() => { setCompleted(false); setPoseIndex(0); }}
            className="text-xs px-4 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Start Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
