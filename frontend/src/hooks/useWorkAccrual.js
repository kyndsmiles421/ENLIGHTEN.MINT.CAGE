/**
 * useWorkAccrual — Silent Dust Accumulation Hook
 * SOVEREIGN ENGINE v2.1 — Local Heartbeat Buffer
 * 
 * Accumulates Digital Dust locally, syncs to /api/transmuter/work-submit
 * when buffer exceeds threshold OR on heartbeat interval.
 * 
 * Anti-Seizure: Alpha-wave pulse (slow, 0.5Hz) — no flashing.
 * Silent: Zero pop-ups. Values update in Liquidity Trader only.
 */
import { useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SYNC_THRESHOLD = 50;
const HEARTBEAT_MS = 30000;
const PHI_ENTROPY = 0.01618; // Slight randomness to prevent network sync storms

let globalBuffer = 0;
let globalLastSync = Date.now();
let globalListeners = new Set();

function notifyListeners() {
  globalListeners.forEach(fn => fn(globalBuffer));
}

export default function useWorkAccrual() {
  const { authHeaders, user } = useAuth();
  const heartbeatRef = useRef(null);
  const mountedRef = useRef(true);

  const syncToBackend = useCallback(async () => {
    if (globalBuffer <= 0) return;
    if (!user) return;

    const payload = {
      module: 'heartbeat_sync',
      interaction_weight: globalBuffer,
    };

    try {
      await axios.post(`${API}/transmuter/work-submit`, payload, {
        headers: authHeaders(),
      });
      globalBuffer = 0;
      globalLastSync = Date.now();
      notifyListeners();
    } catch {
      // Retention active — buffer preserved for next heartbeat
    }
  }, [authHeaders, user]);

  const accrue = useCallback((module, weight = 10) => {
    globalBuffer += weight;
    notifyListeners();

    // Auto-sync if buffer exceeds threshold
    if (globalBuffer >= SYNC_THRESHOLD) {
      syncToBackend();
    }
  }, [syncToBackend]);

  // Expose globally for modules that don't import the hook directly
  useEffect(() => {
    window.__workAccrue = accrue;
    return () => { delete window.__workAccrue; };
  }, [accrue]);

  // Heartbeat interval with PHI entropy
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

  // Sync on unmount (page navigation)
  useEffect(() => {
    return () => {
      if (globalBuffer > 0 && user) {
        // Fire-and-forget sync on exit
        const headers = authHeaders();
        navigator.sendBeacon?.(
          `${API}/transmuter/work-submit`,
          new Blob([JSON.stringify({
            module: 'exit_sync',
            interaction_weight: globalBuffer,
          })], { type: 'application/json' })
        );
      }
    };
  }, [authHeaders, user]);

  return {
    accrue,
    getBuffer: () => globalBuffer,
    getLastSync: () => globalLastSync,
  };
}

// Subscribe to buffer changes (for UI indicators)
export function subscribeBuffer(fn) {
  globalListeners.add(fn);
  return () => globalListeners.delete(fn);
}

export function getBufferState() {
  return { buffer: globalBuffer, lastSync: globalLastSync };
}
