/**
 * useWorkAccrual — V56.0 VITALITY HEARTBEAT
 * 
 * Silent Dust Accumulation with Resonance + Session Duration tracking.
 * NOW BRIDGES TO RPG XP and fires visual ProgressionToast on every sync.
 * 
 * Flow:
 *   1. Page calls window.__workAccrue(module, weight)
 *   2. Buffer accumulates locally
 *   3. On threshold or heartbeat → POST /transmuter/work-submit → earns Dust
 *   4. Simultaneously POST /rpg/character/gain-xp → earns XP
 *   5. Fire 'vitality-pulse' event → ProgressionToast renders feedback
 *   6. Check milestones → fire unlock toasts
 */
import { useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { fireVitalityPulse } from '../components/ProgressionToast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PHI = 1.618033988749895;
const SYNC_THRESHOLD = 50;
const HEARTBEAT_MS = 30000;
const PHI_ENTROPY = 0.01618;

let globalBuffer = 0;
let globalResonance = 0.5;
let globalSessionStart = Date.now();
let globalLastSync = Date.now();
let globalInteractionCount = 0;
let globalListeners = new Set();
let globalLastSource = 'activity';
let globalActivityCounts = {};

function notifyListeners() {
  globalListeners.forEach(fn => fn(globalBuffer));
}

function updateResonance() {
  const elapsed = (Date.now() - globalSessionStart) / 1000;
  const freq = globalInteractionCount / Math.max(1, elapsed / 60);
  globalResonance = Math.tanh(freq * (1 / PHI));
}

export default function useWorkAccrual() {
  const { authHeaders, user } = useAuth();
  const heartbeatRef = useRef(null);
  const mountedRef = useRef(true);

  const syncToBackend = useCallback(async () => {
    if (globalBuffer <= 0) return;
    if (!user) return;

    const sessionDuration = (Date.now() - globalSessionStart) / 1000;
    const currentSource = globalLastSource;
    const bufferAmount = globalBuffer;

    const payload = {
      module: currentSource || 'heartbeat_sync',
      interaction_weight: bufferAmount,
      session_duration: Math.round(sessionDuration),
      resonance_score: parseFloat(globalResonance.toFixed(4)),
    };

    try {
      // 1. Dust accrual via Transmuter
      const dustRes = await axios.post(`${API}/transmuter/work-submit`, payload, {
        headers: authHeaders,
      });
      const earned = dustRes.data?.earned || 0;
      const dustBalance = dustRes.data?.dust_balance || 0;

      globalBuffer = 0;
      globalLastSync = Date.now();
      notifyListeners();

      // 2. Bridge to RPG XP system — parallel
      let rpgResult = null;
      try {
        const xpAmount = Math.max(1, Math.round(earned * PHI));
        const xpRes = await axios.post(`${API}/rpg/character/gain-xp`, {
          amount: xpAmount,
          source: currentSource,
        }, { headers: authHeaders });
        rpgResult = xpRes.data;
      } catch {
        // RPG bridge failure is non-fatal
      }

      // 3. Fire the Vitality Pulse for visual feedback
      if (earned > 0) {
        fireVitalityPulse({
          earned,
          dustBalance,
          source: currentSource,
          xpGained: rpgResult?.xp_gained || 0,
          levelUp: rpgResult?.level_up || false,
          levelsGained: rpgResult?.levels_gained || 0,
          statPoints: rpgResult?.stat_points_earned || 0,
          totalXp: rpgResult?.total_xp || 0,
          level: rpgResult?.level || 0,
        });
      }

      // 4. Level-up gets its own special toast
      if (rpgResult?.level_up) {
        setTimeout(() => {
          fireVitalityPulse({
            earned: 0,
            source: currentSource,
            levelUp: true,
            levelsGained: rpgResult.levels_gained,
            statPoints: rpgResult.stat_points_earned,
            level: rpgResult.level,
          });
        }, 600);
      }

      // 5. Track activity counts for milestone checks
      globalActivityCounts[currentSource] = (globalActivityCounts[currentSource] || 0) + 1;
      checkMilestones(currentSource, authHeaders);

    } catch {
      // Retention — buffer preserved for next heartbeat
    }
  }, [authHeaders, user]);

  const accrue = useCallback((module, weight = 10) => {
    globalBuffer += weight;
    globalInteractionCount++;
    globalLastSource = module;
    updateResonance();
    notifyListeners();

    if (globalBuffer >= SYNC_THRESHOLD) {
      syncToBackend();
    }
  }, [syncToBackend]);

  // Expose globally
  useEffect(() => {
    window.__workAccrue = accrue;
    globalSessionStart = Date.now();
    globalInteractionCount = 0;
    return () => { delete window.__workAccrue; };
  }, [accrue]);

  // Heartbeat with PHI entropy
  useEffect(() => {
    mountedRef.current = true;
    const jitter = 1 + (Math.random() * PHI_ENTROPY * 2 - PHI_ENTROPY);
    const interval = Math.round(HEARTBEAT_MS * jitter);

    heartbeatRef.current = setInterval(() => {
      if (mountedRef.current) syncToBackend();
    }, interval);

    return () => {
      mountedRef.current = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [syncToBackend]);

  // Beacon sync on exit
  useEffect(() => {
    return () => {
      if (globalBuffer > 0 && user) {
        const sessionDuration = (Date.now() - globalSessionStart) / 1000;
        navigator.sendBeacon?.(
          `${API}/transmuter/work-submit`,
          new Blob([JSON.stringify({
            module: globalLastSource || 'exit_sync',
            interaction_weight: globalBuffer,
            session_duration: Math.round(sessionDuration),
            resonance_score: parseFloat(globalResonance.toFixed(4)),
          })], { type: 'application/json' })
        );
      }
    };
  }, [authHeaders, user]);

  return {
    accrue,
    getBuffer: () => globalBuffer,
    getLastSync: () => globalLastSync,
    getResonance: () => globalResonance,
    getSessionDuration: () => (Date.now() - globalSessionStart) / 1000,
  };
}

/**
 * Milestone checker — fires unlock toasts for cross-system progression.
 * Runs locally to avoid extra API calls, with periodic backend validation.
 */
const MILESTONES = [
  { source: 'breathing_exercise', count: 3, milestone: 'Air Temple Unlocked', reward: 'air_temple_quest' },
  { source: 'sacred_breathing', count: 3, milestone: 'Air Temple Unlocked', reward: 'air_temple_quest' },
  { source: 'meditation_session', count: 5, milestone: 'Crystal Skin Earned', reward: 'crystal_skin_001' },
  { source: 'oracle_reading', count: 3, milestone: 'Mystic Cloak Unlocked', reward: 'mystic_cloak_001' },
  { source: 'dream_journal', count: 3, milestone: 'Dream Realms Opened', reward: 'dream_realms_access' },
  { source: 'daily_ritual', count: 7, milestone: 'Sovereign Ritual Master', reward: 'ritual_master_badge' },
  { source: 'mood_log', count: 10, milestone: 'Emotional Cartographer', reward: 'mood_master_badge' },
];

const triggeredMilestones = new Set();

async function checkMilestones(source, authHeadersFn) {
  const count = globalActivityCounts[source] || 0;
  for (const m of MILESTONES) {
    if (m.source !== source) continue;
    if (count < m.count) continue;
    const key = `${m.source}_${m.count}`;
    if (triggeredMilestones.has(key)) continue;

    triggeredMilestones.add(key);

    // Fire milestone toast
    setTimeout(() => {
      fireVitalityPulse({
        earned: 0,
        source,
        milestone: m.milestone,
        reward: m.reward,
      });
    }, 1200);

    // Record milestone in backend
    try {
      await axios.post(`${API}/rpg/character/gain-xp`, {
        amount: 50,
        source: `milestone_${m.reward}`,
      }, { headers: authHeadersFn() });
    } catch {
      // Non-fatal
    }
  }
}

export function subscribeBuffer(fn) {
  globalListeners.add(fn);
  return () => globalListeners.delete(fn);
}

export function getBufferState() {
  return {
    buffer: globalBuffer,
    lastSync: globalLastSync,
    resonance: globalResonance,
    sessionDuration: (Date.now() - globalSessionStart) / 1000,
    activityCounts: { ...globalActivityCounts },
  };
}
