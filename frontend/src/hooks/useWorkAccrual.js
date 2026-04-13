/**
 * useWorkAccrual — V34.0 INVERSE EXPONENTIAL SURGE
 * Silent Dust Accumulation with Resonance + Session Duration tracking.
 * 
 * Frontend calculates:
 *   resonance_score = engagement quality (0.0 - 1.0)
 *   session_duration = seconds since module entered
 * Backend applies:
 *   exponential_accrual = base * e^(resonance * time/3600) * φ
 *   inverse_multiplier = φ^(-1 / (pool + 1))
 */
import { useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

function notifyListeners() {
  globalListeners.forEach(fn => fn(globalBuffer));
}

// Resonance builds with interaction frequency (capped at 1.0)
function updateResonance() {
  const elapsed = (Date.now() - globalSessionStart) / 1000;
  const freq = globalInteractionCount / Math.max(1, elapsed / 60); // interactions per minute
  // Resonance = tanh(freq * φ^-1) — approaches 1.0 asymptotically
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

    const payload = {
      module: 'heartbeat_sync',
      interaction_weight: globalBuffer,
      session_duration: Math.round(sessionDuration),
      resonance_score: parseFloat(globalResonance.toFixed(4)),
    };

    try {
      await axios.post(`${API}/transmuter/work-submit`, payload, {
        headers: authHeaders(),
      });
      globalBuffer = 0;
      globalLastSync = Date.now();
      notifyListeners();
    } catch {
      // Retention — buffer preserved for next heartbeat
    }
  }, [authHeaders, user]);

  const accrue = useCallback((module, weight = 10) => {
    globalBuffer += weight;
    globalInteractionCount++;
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
            module: 'exit_sync',
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
  };
}
