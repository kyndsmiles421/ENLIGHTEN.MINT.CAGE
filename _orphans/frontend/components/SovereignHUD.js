import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereign } from '../context/SovereignContext';
import { useAuth } from '../context/AuthContext';
import { Zap, Activity, Cpu, Radio, Music } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const CHANNEL_META = {
  0: { label: 'Nexus Path', color: '#EAB308', icon: Zap },
  1: { label: 'Sensory Stream', color: '#C084FC', icon: Radio },
  2: { label: 'Background Orbit', color: '#60A5FA', icon: Cpu },
};

// ━━━ Sovereign NPU HUD — Priority Queue Visibility ━━━
// Color based on harmony score
function getHarmonyColor(score) {
  if (score >= 90) return '#A78BFA'; // Purple — transcendent
  if (score >= 75) return '#34D399'; // Emerald — harmonious
  if (score >= 60) return '#60A5FA'; // Blue — resonant
  if (score >= 40) return '#FBBF24'; // Amber — awakening
  if (score >= 20) return '#F97316'; // Orange — seeking
  return 'rgba(255,255,255,0.65)';    // Gray — dormant
}

export default function SovereignHUD() {
  const { getQueueStats, eventBus, tier } = useSovereign();
  const { authHeaders } = useAuth();
  const [stats, setStats] = useState({ enqueued: 0, completed: 0, errors: 0, pending: 0, active: 0, npu_burst: false });
  const [recentTasks, setRecentTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dataRef = useRef({ streams: [[], [], []] });

  // Session Harmony Score
  const [harmonyScore, setHarmonyScore] = useState(null);
  const harmonyTimerRef = useRef(null);
  const resonanceTrackRef = useRef({ activePairs: [], totalResonances: 0, strongestInterval: 'none', startTime: Date.now() });

  // Resonance Streak
  const [streak, setStreak] = useState({ current_streak: 0, best_streak: 0, streak_active: false, total_xp_earned: 0 });
  const [goldenPulse, setGoldenPulse] = useState(false);
  const [xpFlash, setXpFlash] = useState(null);

  // Subscribe to queue events
  useEffect(() => {
    const refresh = () => setStats(getQueueStats());
    const interval = setInterval(refresh, 500);

    const unsub1 = eventBus.subscribe('task_enqueued', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'enqueued' }, ...prev].slice(0, 8));
      // Animate stream
      const ch = data.priority ?? 2;
      dataRef.current.streams[ch].push({ value: 1, age: 0 });
    });

    const unsub2 = eventBus.subscribe('task_complete', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'complete' }, ...prev].slice(0, 8));
    });

    const unsub3 = eventBus.subscribe('npu_burst', (data) => {
      setPulseActive(data.active);
      refresh();
    });

    const unsub4 = eventBus.subscribe('task_error', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'error' }, ...prev].slice(0, 8));
    });

    return () => { clearInterval(interval); unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [eventBus, getQueueStats]);

  // Track resonance events and periodically calculate harmony score
  useEffect(() => {
    const unsubRes = eventBus.subscribe('sphere_resonance', (data) => {
      if (data?.pairKey) {
        resonanceTrackRef.current.totalResonances++;
        if (!resonanceTrackRef.current.activePairs.includes(data.pairKey)) {
          resonanceTrackRef.current.activePairs.push(data.pairKey);
        }
        if (data.interval) resonanceTrackRef.current.strongestInterval = data.interval;
      }
    });

    // Fetch harmony score every 30 seconds
    const fetchScore = async () => {
      if (!authHeaders?.Authorization) return;
      try {
        const track = resonanceTrackRef.current;
        const payload = {
          active_pairs: track.activePairs,
          total_resonances: track.totalResonances,
          strongest_interval: track.strongestInterval,
          session_duration_ms: Date.now() - track.startTime,
        };
        const res = await axios.post(`${API}/api/phonic/harmony-score`, payload, { headers: authHeaders });
        setHarmonyScore(res.data);

        // Streak check (low-priority background task)
        requestIdleCallback(async () => {
          try {
            const streakRes = await axios.post(`${API}/api/phonic/streak-check`, payload, { headers: authHeaders });
            const s = streakRes.data;
            setStreak(s);
            if (s.streak_triggered) {
              // Golden Pulse!
              setGoldenPulse(true);
              setXpFlash(s.xp_awarded);
              if (navigator.vibrate) navigator.vibrate([50, 30, 80, 30, 120]);
              setTimeout(() => setGoldenPulse(false), 3000);
              setTimeout(() => setXpFlash(null), 4000);
            }
          } catch {}
        }, { timeout: 5000 });
      } catch {}
    };

    const initTimer = setTimeout(fetchScore, 3000);
    harmonyTimerRef.current = setInterval(fetchScore, 30000);

    return () => {
      unsubRes();
      clearTimeout(initTimer);
      if (harmonyTimerRef.current) clearInterval(harmonyTimerRef.current);
    };
  }, [eventBus, authHeaders]);

  // Canvas data stream visualization
  const drawStreams = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw 3 priority streams converging to center
    const centerX = w / 2;
    const centerY = h;

    [0, 1, 2].forEach(ch => {
      const meta = CHANNEL_META[ch];
      const stream = dataRef.current.streams[ch];

      // Draw stream line
      const startX = (ch / 2) * w;
      const startY = 0;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX, h * 0.6, centerX, centerY);
      ctx.strokeStyle = `${meta.color}15`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Animate data packets flowing down stream
      stream.forEach((packet, i) => {
        packet.age += 0.02;
        if (packet.age > 1) return;

        const t = packet.age;
        const px = startX + (centerX - startX) * t * t;
        const py = startY + (centerY - startY) * t;

        ctx.beginPath();
        ctx.arc(px, py, 2 + (1 - t) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${meta.color}${Math.round((1 - t) * 180).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });

      // Clean old packets
      dataRef.current.streams[ch] = stream.filter(p => p.age < 1);
    });

    // Center convergence glow
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 12);
    grad.addColorStop(0, `rgba(234,179,8,${stats.active > 0 ? 0.3 : 0.05})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(centerX - 15, centerY - 15, 30, 30);

    animRef.current = requestAnimationFrame(drawStreams);
  }, [stats.active]);

  useEffect(() => {
    if (expanded) {
      drawStreams();
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
  }, [expanded, drawStreams]);

  const tierColors = {
    standard: '#94A3B8', apprentice: '#2DD4BF', artisan: '#C084FC', sovereign: '#EAB308',
  };
  const hColor = tierColors[tier] || '#94A3B8';

  return (
    <motion.div
      className="fixed bottom-20 left-4 z-[150]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      data-testid="sovereign-hud"
    >
      {/* Golden Pulse Overlay — triggers on 3+ streak */}
      <AnimatePresence>
        {goldenPulse && (
          <motion.div
            className="absolute inset-[-12px] rounded-2xl pointer-events-none z-10"
            style={{
              background: 'transparent',
              boxShadow: '0 0 30px rgba(251,191,36,0.4), inset 0 0 20px rgba(251,191,36,0.1)',
              border: '2px solid rgba(251,191,36,0.6)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 0.6, 1, 0], scale: [0.9, 1.05, 1, 1.02, 0.95] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            data-testid="golden-pulse"
          />
        )}
      </AnimatePresence>

      {/* XP Flash — shows earned XP on streak trigger */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.5 }}
            data-testid="xp-flash"
          >
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}>
              +{xpFlash} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact widget */}
      <motion.button
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer"
        style={{
          background: stats.npu_burst ? 'rgba(234,179,8,0.12)' : 'rgba(6,6,14,0.85)',
          backdropFilter: 'none',
          border: `1px solid ${stats.npu_burst ? 'rgba(234,179,8,0.3)' : 'rgba(248,250,252,0.06)'}`,
          boxShadow: stats.npu_burst ? `0 0 20px rgba(234,179,8,0.15)` : 'none',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        data-testid="hud-toggle"
      >
        {/* NPU pulse indicator */}
        {stats.npu_burst && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: '1px solid rgba(234,179,8,0.4)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <Activity size={9} style={{ color: stats.active > 0 ? '#EAB308' : 'rgba(255,255,255,0.6)' }} />
        <span className="text-[7px] font-mono" style={{ color: stats.active > 0 ? hColor : 'rgba(255,255,255,0.6)' }}>
          {stats.active > 0 ? `${stats.active} active` : 'idle'}
        </span>
        {stats.pending > 0 && (
          <span className="text-[6px] px-1 py-0.5 rounded-full font-mono"
            style={{ background: `${hColor}15`, color: hColor }}>
            +{stats.pending}
          </span>
        )}
        {/* Compact harmony score badge */}
        {harmonyScore && (
          <span className="text-[6px] px-1 py-0.5 rounded-full font-mono"
            style={{ background: `${getHarmonyColor(harmonyScore.score)}12`, color: getHarmonyColor(harmonyScore.score) }}
            data-testid="harmony-score-badge">
            {harmonyScore.score}
          </span>
        )}
        {/* Streak counter */}
        {streak.current_streak > 0 && (
          <span className="text-[6px] px-1 py-0.5 rounded-full font-mono"
            style={{
              background: streak.streak_active ? 'rgba(251,191,36,0.15)' : 'rgba(248,250,252,0.04)',
              color: streak.streak_active ? '#FBBF24' : 'rgba(255,255,255,0.65)',
              border: streak.streak_active ? '1px solid rgba(251,191,36,0.2)' : 'none',
            }}
            data-testid="streak-counter">
            {streak.current_streak}x
          </span>
        )}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(6,6,14,0.95)',
              backdropFilter: 'none',
              border: '1px solid rgba(248,250,252,0.06)',
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            data-testid="hud-panel"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(248,250,252,0.04)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[7px] tracking-wider uppercase font-medium" style={{ color: hColor }}>
                  Sovereign NPU
                </p>
                {stats.npu_burst && (
                  <motion.span
                    className="text-[6px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308' }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    NPU BURST
                  </motion.span>
                )}
              </div>
            </div>

            {/* Stream visualization */}
            <div className="relative h-20">
              <canvas
                ref={canvasRef}
                width={224}
                height={80}
                className="w-full h-full"
              />
              {/* Channel labels overlaid */}
              <div className="absolute top-1 left-0 right-0 flex justify-between px-2">
                {[0, 1, 2].forEach(() => null)}
                {Object.entries(CHANNEL_META).map(([ch, meta]) => {
                  const ChannelIcon = meta.icon;
                  return (
                    <div key={ch} className="flex items-center gap-0.5">
                      <ChannelIcon size={6} style={{ color: `${meta.color}60` }} />
                      <span className="text-[5px] font-mono" style={{ color: `${meta.color}40` }}>
                        {meta.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats grid */}
            <div className="px-3 py-2 grid grid-cols-3 gap-2 border-t" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold" style={{ color: '#22C55E' }}>{stats.completed}</p>
                <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.15)' }}>Done</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold" style={{ color: '#EAB308' }}>{stats.pending}</p>
                <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.15)' }}>Queue</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold" style={{ color: stats.errors > 0 ? '#EF4444' : 'rgba(255,255,255,0.6)' }}>{stats.errors}</p>
                <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.15)' }}>Errors</p>
              </div>
            </div>

            {/* Session Harmony Score */}
            {harmonyScore && (
              <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(248,250,252,0.03)' }} data-testid="harmony-score-panel">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <Music size={8} style={{ color: getHarmonyColor(harmonyScore.score) }} />
                    <span className="text-[6px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Harmony
                    </span>
                  </div>
                  <span className="text-[8px] font-mono" style={{ color: getHarmonyColor(harmonyScore.score) }}>
                    {harmonyScore.grade}
                  </span>
                </div>

                {/* Score ring */}
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      {/* Background ring */}
                      <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(248,250,252,0.04)" strokeWidth="3" />
                      {/* Score arc */}
                      <circle cx="20" cy="20" r="16" fill="none"
                        stroke={getHarmonyColor(harmonyScore.score)}
                        strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${(harmonyScore.score / 100) * 100.5} 100.5`}
                        transform="rotate(-90 20 20)"
                        style={{ filter: `drop-shadow(0 0 3px ${getHarmonyColor(harmonyScore.score)}40)` }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold"
                      style={{ color: getHarmonyColor(harmonyScore.score) }} data-testid="harmony-score-value">
                      {harmonyScore.score}
                    </span>
                  </div>
                  {/* Breakdown bars */}
                  <div className="flex-1 space-y-1">
                    {[
                      { label: 'Align', value: harmonyScore.breakdown.resonance_alignment, max: 40, color: '#818CF8' },
                      { label: 'Explore', value: harmonyScore.breakdown.exploration_diversity, max: 30, color: '#34D399' },
                      { label: 'Depth', value: harmonyScore.breakdown.harmonic_depth, max: 30, color: '#F59E0B' },
                    ].map(bar => (
                      <div key={bar.label} className="flex items-center gap-1">
                        <span className="text-[5px] font-mono w-7 text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {bar.label}
                        </span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                          <motion.div className="h-full rounded-full"
                            style={{ background: bar.color, width: `${(bar.value / bar.max) * 100}%` }}
                            initial={{ width: 0 }} animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }} />
                        </div>
                        <span className="text-[5px] font-mono w-4" style={{ color: `${bar.color}80` }}>
                          {bar.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insight */}
                <p className="text-[6px] mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {harmonyScore.insight}
                </p>
              </div>
            )}

            {/* Resonance Streak */}
            {streak.current_streak > 0 && (
              <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(248,250,252,0.03)' }} data-testid="streak-panel">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Zap size={8} style={{ color: streak.streak_active ? '#FBBF24' : 'rgba(255,255,255,0.65)' }} />
                    <span className="text-[6px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Streak
                    </span>
                  </div>
                  <motion.span className="text-[10px] font-mono font-bold"
                    style={{ color: streak.streak_active ? '#FBBF24' : 'rgba(255,255,255,0.7)' }}
                    animate={streak.streak_active ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    data-testid="streak-value">
                    {streak.current_streak}x
                  </motion.span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Streak dots */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(9, Math.max(3, streak.current_streak)) }, (_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: i < streak.current_streak
                            ? (i >= 2 ? '#FBBF24' : 'rgba(251,191,36,0.4)')
                            : 'rgba(248,250,252,0.06)',
                          boxShadow: i < streak.current_streak && i >= 2 ? '0 0 4px rgba(251,191,36,0.3)' : 'none',
                        }} />
                    ))}
                  </div>
                  <div className="flex-1" />
                  <div className="text-right">
                    <p className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                      Best: {streak.best_streak}x
                    </p>
                    {streak.total_xp_earned > 0 && (
                      <p className="text-[5px] font-mono" style={{ color: 'rgba(251,191,36,0.4)' }}>
                        +{streak.total_xp_earned} XP
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent tasks feed */}
            {recentTasks.length > 0 && (
              <div className="px-3 py-1.5 border-t max-h-24 overflow-y-auto" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
                <p className="text-[5px] uppercase tracking-wider mb-1" style={{ color: 'rgba(248,250,252,0.1)' }}>
                  Recent
                </p>
                {recentTasks.slice(0, 5).map((task, i) => {
                  const meta = CHANNEL_META[task.priority] || CHANNEL_META[2];
                  return (
                    <div key={`${task.id}-${i}`} className="flex items-center gap-1 mb-0.5">
                      <div className="w-1 h-1 rounded-full" style={{
                        background: task.type === 'complete' ? '#22C55E' : task.type === 'error' ? '#EF4444' : meta.color,
                      }} />
                      <span className="text-[5px] font-mono truncate flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {task.label || task.channel}
                      </span>
                      <span className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.1)' }}>
                        {task.type === 'complete' ? 'done' : task.type === 'error' ? 'err' : 'queued'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
