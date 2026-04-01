import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Mountain, Droplets, Flame, Wind, Sparkles,
  Play, Pause, RotateCcw, Coins, Zap,
  Timer, TrendingUp, Award, Check, Target
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = {
  earth: Mountain,
  water: Droplets,
  fire: Flame,
  air: Wind,
  ether: Sparkles,
};

function PracticeCard({ practice, onStart, disabled }) {
  const ElIcon = ELEMENT_ICONS[practice.element] || Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-transform"
      style={{
        background: `${practice.color}06`,
        border: `1px solid ${practice.color}15`,
      }}
      onClick={() => !disabled && onStart(practice)}
      data-testid={`practice-card-${practice.id}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `${practice.color}10`, border: `1px solid ${practice.color}20` }}>
          <ElIcon size={18} style={{ color: practice.color }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            {practice.name}
          </h3>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            {practice.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: practice.color }}>
            {practice.dust_range.min}-{practice.dust_range.max}
          </p>
          <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Dust</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${practice.color}08` }}>
        <span className="text-[8px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Timer size={8} /> Min {practice.min_duration_seconds}s
        </span>
        <span className="text-[8px] flex items-center gap-1" style={{ color: '#FBBF24' }}>
          <Sparkles size={8} /> +{practice.xp} XP
        </span>
        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
          {practice.sessions_completed} completed
        </span>
      </div>
    </motion.div>
  );
}

function ResonanceTimer({ practice, onComplete, onCancel }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [taps, setTaps] = useState([]);
  const [quality, setQuality] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const minDuration = practice.min_duration_seconds;
  const ElIcon = ELEMENT_ICONS[practice.element] || Sparkles;

  // Timer
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      setPulsePhase(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Quality: tap rhythm consistency (mini-game)
  const handleTap = useCallback(() => {
    const now = Date.now();
    setTaps(prev => {
      const newTaps = [...prev, now];
      if (newTaps.length < 3) return newTaps;
      // Calculate rhythm consistency from last 10 taps
      const recent = newTaps.slice(-10);
      const intervals = recent.slice(1).map((t, i) => t - recent[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.abs(b - avg), 0) / intervals.length;
      const consistency = Math.max(0, 1 - variance / avg);
      setQuality(Math.round(consistency * 100) / 100);
      return newTaps;
    });
  }, []);

  const canComplete = elapsed >= minDuration;
  const progress = Math.min(1, elapsed / minDuration);

  const handleComplete = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    const finalQuality = taps.length >= 3 ? quality : 0.5;
    onComplete(elapsed, finalQuality);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-6 text-center relative overflow-hidden"
      style={{
        background: `${practice.color}04`,
        border: `1px solid ${practice.color}15`,
      }}
      data-testid="resonance-timer"
    >
      {/* Pulsing aura */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(circle, ${practice.color}05, transparent 60%)`,
            `radial-gradient(circle, ${practice.color}12, transparent 70%)`,
            `radial-gradient(circle, ${practice.color}05, transparent 60%)`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10">
        {/* Element icon with progress ring */}
        <div className="mx-auto w-28 h-28 mb-4 relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke={`${practice.color}10`} strokeWidth="3" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={practice.color} strokeWidth="3"
              strokeDasharray={`${progress * 283} 283`}
              strokeLinecap="round" className="transition-all duration-300" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ElIcon size={24} style={{ color: practice.color }} className="mb-1" />
            <span className="text-xl font-light" style={{ color: practice.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        <p className="text-sm font-light mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          {practice.name}
        </p>
        <p className="text-[9px] mb-4" style={{ color: 'var(--text-muted)' }}>
          {canComplete ? 'You may complete your practice' : `${minDuration - elapsed}s until minimum reached`}
        </p>

        {/* Tap zone for quality mini-game */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleTap}
          className="w-full py-6 rounded-xl mb-3 transition-all"
          style={{
            background: `${practice.color}08`,
            border: `1px solid ${practice.color}12`,
          }}
          data-testid="resonance-tap-zone"
        >
          <Target size={20} className="mx-auto mb-1" style={{ color: practice.color, opacity: 0.6 }} />
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            Tap rhythmically to build resonance quality
          </p>
          {taps.length >= 3 && (
            <p className="text-[11px] font-medium mt-1" style={{ color: practice.color }}>
              Quality: {Math.round(quality * 100)}%
            </p>
          )}
        </motion.button>

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}
            data-testid="cancel-practice-btn">
            <RotateCcw size={11} /> Cancel
          </button>
          <button onClick={() => setRunning(!running)}
            className="px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1"
            style={{ background: `${practice.color}10`, color: practice.color, border: `1px solid ${practice.color}20` }}
            data-testid="pause-practice-btn">
            {running ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
          </button>
          <motion.button
            whileHover={canComplete ? { scale: 1.03 } : {}}
            whileTap={canComplete ? { scale: 0.97 } : {}}
            onClick={handleComplete}
            disabled={!canComplete}
            className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            style={{
              background: canComplete ? `${practice.color}15` : 'rgba(248,250,252,0.03)',
              color: canComplete ? practice.color : 'var(--text-muted)',
              border: `1px solid ${canComplete ? `${practice.color}25` : 'rgba(248,250,252,0.06)'}`,
              opacity: canComplete ? 1 : 0.5,
            }}
            data-testid="complete-practice-btn">
            <Check size={11} /> Complete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResonancePractice() {
  const { authHeaders } = useAuth();
  const [practices, setPractices] = useState([]);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePractice, setActivePractice] = useState(null);

  const fetchPractices = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/resonance/practices`, { headers: authHeaders });
      setPractices(res.data.practices || []);
      setStats(res.data.stats);
      setMeta({
        level: res.data.consciousness_level,
        levelMult: res.data.level_multiplier,
        streakBonus: res.data.streak_bonus,
        remaining: res.data.remaining_today,
        maxDaily: res.data.max_daily_sessions,
      });
    } catch {
      toast.error('Failed to load practices');
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchPractices(); }, [fetchPractices]);

  const handleComplete = async (durationSeconds, qualityScore) => {
    try {
      const res = await axios.post(`${API}/resonance/complete`, {
        practice_type: activePractice.id,
        duration_seconds: durationSeconds,
        quality_score: qualityScore,
      }, { headers: authHeaders });

      const r = res.data.rewards;
      toast.success(`${res.data.practice} complete!`, {
        description: `+${r.dust} Dust, +${r.xp} XP${res.data.streak.bonus ? ` (${res.data.streak.bonus})` : ''}`,
        duration: 5000,
      });
      setActivePractice(null);
      fetchPractices();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Practice failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="resonance-practice-panel">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap size={18} style={{ color: '#8B5CF6' }} />
          <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Resonance Practice
          </h2>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Generate Cosmic Dust through mindful practice. Quality and duration increase yield.
        </p>
      </div>

      {/* Stats row */}
      {stats && meta && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Streak', value: stats.current_streak, icon: TrendingUp, color: '#FB923C', sub: `${stats.longest_streak} best` },
            { label: 'Dust Earned', value: stats.total_dust_earned, icon: Coins, color: '#2DD4BF' },
            { label: 'Sessions', value: stats.total_sessions, icon: Timer, color: '#8B5CF6' },
            { label: 'Today', value: `${meta.remaining}/${meta.maxDaily}`, icon: Award, color: '#FBBF24', sub: 'remaining' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-2 text-center"
              style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
              data-testid={`resonance-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
              <s.icon size={12} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-sm font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
              <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              {s.sub && <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Level & streak bonus */}
      {meta && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.15)' }}>
            Level {meta.level} ({meta.levelMult}x yield)
          </span>
          {meta.streakBonus && (
            <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.15)' }}>
              {meta.streakBonus.label} ({meta.streakBonus.multiplier}x)
            </span>
          )}
        </div>
      )}

      {/* Active practice or practice list */}
      <AnimatePresence mode="wait">
        {activePractice ? (
          <ResonanceTimer
            key="timer"
            practice={activePractice}
            onComplete={handleComplete}
            onCancel={() => setActivePractice(null)}
          />
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {meta?.remaining === 0 ? (
              <div className="text-center py-8 rounded-xl" style={{ background: 'rgba(248,250,252,0.02)' }}>
                <Timer size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Daily practice limit reached</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Rest now. Your energy replenishes tomorrow.</p>
              </div>
            ) : (
              practices.map(p => (
                <PracticeCard key={p.id} practice={p} onStart={setActivePractice}
                  disabled={meta?.remaining === 0} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>How Resonance Works</p>
        <div className="space-y-1.5">
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <Timer size={8} className="inline mr-1" style={{ color: '#8B5CF6' }} />
            <strong>Duration:</strong> Longer sessions yield more Dust (diminishing returns after 5 min).
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <Target size={8} className="inline mr-1" style={{ color: '#F472B6' }} />
            <strong>Quality:</strong> Tap rhythmically during practice. Consistency = higher quality score.
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <TrendingUp size={8} className="inline mr-1" style={{ color: '#FB923C' }} />
            <strong>Streak:</strong> Daily practice builds streak bonuses (up to 2x at 90 days).
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={8} className="inline mr-1" style={{ color: '#FBBF24' }} />
            <strong>Consciousness:</strong> Higher levels unlock better multipliers (up to 2.5x at Level 5).
          </p>
        </div>
      </div>
    </div>
  );
}
