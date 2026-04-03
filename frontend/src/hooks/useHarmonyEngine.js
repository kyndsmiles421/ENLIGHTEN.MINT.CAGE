import { useState, useEffect, useRef, useCallback } from 'react';
import { useSovereign } from '../context/SovereignContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// Color based on harmony score
export function getHarmonyColor(score) {
  if (score >= 90) return '#A78BFA';
  if (score >= 75) return '#34D399';
  if (score >= 60) return '#60A5FA';
  if (score >= 40) return '#FBBF24';
  if (score >= 20) return '#F97316';
  return 'rgba(248,250,252,0.3)';
}

/**
 * useHarmonyEngine — unified hook for Harmony Score, Resonance Streak, and NPU Queue stats.
 * Consolidates three independent 30s timers into a single batch cycle.
 */
export function useHarmonyEngine() {
  const { getQueueStats, eventBus, tier } = useSovereign();
  const { authHeaders } = useAuth();

  // NPU queue stats
  const [npuStats, setNpuStats] = useState({ enqueued: 0, completed: 0, errors: 0, pending: 0, active: 0, npu_burst: false });
  const [recentTasks, setRecentTasks] = useState([]);

  // Session Harmony Score
  const [harmonyScore, setHarmonyScore] = useState(null);
  const resonanceTrackRef = useRef({ activePairs: [], totalResonances: 0, strongestInterval: 'none', startTime: Date.now() });

  // Resonance Streak
  const [streak, setStreak] = useState({ current_streak: 0, best_streak: 0, streak_active: false, total_xp_earned: 0 });
  const [goldenPulse, setGoldenPulse] = useState(false);
  const [xpFlash, setXpFlash] = useState(null);

  // Subscribe to NPU queue events
  useEffect(() => {
    const refresh = () => setNpuStats(getQueueStats());
    const interval = setInterval(refresh, 800);

    const unsub1 = eventBus.subscribe('task_enqueued', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'enqueued' }, ...prev].slice(0, 8));
    });
    const unsub2 = eventBus.subscribe('task_complete', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'complete' }, ...prev].slice(0, 8));
    });
    const unsub3 = eventBus.subscribe('npu_burst', () => refresh());
    const unsub4 = eventBus.subscribe('task_error', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'error' }, ...prev].slice(0, 8));
    });

    return () => { clearInterval(interval); unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [eventBus, getQueueStats]);

  // Track resonance events
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
    return () => unsubRes();
  }, [eventBus]);

  // Single batch timer — fetches harmony score + streak in one cycle every 30s
  useEffect(() => {
    const batchFetch = async () => {
      if (!authHeaders?.Authorization) return;
      const track = resonanceTrackRef.current;
      const payload = {
        active_pairs: track.activePairs,
        total_resonances: track.totalResonances,
        strongest_interval: track.strongestInterval,
        session_duration_ms: Date.now() - track.startTime,
      };

      try {
        const res = await axios.post(`${API}/api/phonic/harmony-score`, payload, { headers: authHeaders });
        setHarmonyScore(res.data);
      } catch {}

      // Streak check in idle time
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(async () => {
          try {
            const streakRes = await axios.post(`${API}/api/phonic/streak-check`, payload, { headers: authHeaders });
            const s = streakRes.data;
            setStreak(s);
            if (s.streak_triggered) {
              setGoldenPulse(true);
              setXpFlash(s.xp_awarded);
              if (navigator.vibrate) navigator.vibrate([50, 30, 80, 30, 120]);
              setTimeout(() => setGoldenPulse(false), 3000);
              setTimeout(() => setXpFlash(null), 4000);
            }
          } catch {}
        }, { timeout: 5000 });
      }
    };

    const initTimer = setTimeout(batchFetch, 3000);
    const interval = setInterval(batchFetch, 30000);

    return () => { clearTimeout(initTimer); clearInterval(interval); };
  }, [authHeaders]);

  const tierColors = {
    standard: '#94A3B8', apprentice: '#2DD4BF', artisan: '#C084FC', sovereign: '#EAB308',
  };

  return {
    npuStats,
    recentTasks,
    harmonyScore,
    streak,
    goldenPulse,
    xpFlash,
    tier,
    tierColor: tierColors[tier] || '#94A3B8',
  };
}
