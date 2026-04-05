/**
 * CRYSTAL RESONANCE HOOK
 * ======================
 * 
 * Real-time connection to the Central Crystal backend.
 * Provides frequency state, transition status, and pulse control.
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    Frontend Component                    │
 * │                           │                              │
 * │                    useCrystalResonance()                 │
 * │                      │           │                       │
 * │              poll (150ms)    pulse(intent)               │
 * │                      │           │                       │
 * │                      ▼           ▼                       │
 * │              /api/crystal/state  /api/crystal/pulse      │
 * │                      │           │                       │
 * │                      ▼           ▼                       │
 * │              ┌───────────────────────────┐               │
 * │              │     Central Crystal       │               │
 * │              │   (Backend State Engine)  │               │
 * │              └───────────────────────────┘               │
 * └─────────────────────────────────────────────────────────┘
 * 
 * KEITH WRIGHT'S PRINCIPLE:
 * The hook creates a real-time "resonance link" between the UI
 * and the Crystal's frequency. Changes propagate as harmonic waves.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Default crystal state
const DEFAULT_STATE = {
  freq: 0,
  isTransitioning: false,
  activeSource: 'Void',
  torque: 0,
  sourceInfo: null,
  transition: null,
};

/**
 * Hook for real-time crystal resonance tracking
 * 
 * @param {Object} options Configuration options
 * @param {number} options.pollInterval Polling interval in ms (default: 150ms for smooth 3D)
 * @param {boolean} options.autoConnect Start polling immediately (default: true)
 * @returns {Object} Crystal state and control functions
 */
export const useCrystalResonance = (options = {}) => {
  const { 
    pollInterval = 150,  // High-frequency for smooth 3D motion
    autoConnect = true,
  } = options;

  const [resonance, setResonance] = useState(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [guardrailResult, setGuardrailResult] = useState(null);
  
  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  // ─────────────────────────────────────────────────────────────────────────
  // PULSE: Send intent to crystal (triggers harmonic transition)
  // ─────────────────────────────────────────────────────────────────────────
  
  const pulse = useCallback(async (target, intent = null, options = {}) => {
    try {
      setError(null);
      
      const body = {
        target,
        intent,
        skip_guardrail: options.skipGuardrail || false,
        skip_resistance: options.skipResistance || false,
        frequency: options.frequency,
        resistance: options.resistance,
      };

      const response = await fetch(`${API_URL}/api/crystal/pulse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.guardrail_result) {
        setGuardrailResult(data.guardrail_result);
      }

      if (!data.success) {
        // Signal was grounded by guardrail
        console.warn('[CrystalResonance] Pulse blocked:', data.message);
        setError({ type: 'grounded', message: data.message, guardrail: data.guardrail_result });
        return { success: false, ...data };
      }

      console.log(`[CrystalResonance] Pulsed to ${target}:`, data);
      return { success: true, ...data };
      
    } catch (err) {
      console.error('[CrystalResonance] Pulse error:', err);
      setError({ type: 'network', message: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // INSTANT: Immediate shift without transition animation
  // ─────────────────────────────────────────────────────────────────────────
  
  const instantShift = useCallback(async (target, frequency = null) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/crystal/instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, frequency }),
      });

      const data = await response.json();
      console.log(`[CrystalResonance] Instant shift to ${target}:`, data);
      return data;
      
    } catch (err) {
      console.error('[CrystalResonance] Instant shift error:', err);
      setError({ type: 'network', message: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RESET: Return to Void state
  // ─────────────────────────────────────────────────────────────────────────
  
  const reset = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/crystal/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log('[CrystalResonance] Reset to Void');
      return data;
    } catch (err) {
      console.error('[CrystalResonance] Reset error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYZE: Test intent through guardrail (doesn't pulse)
  // ─────────────────────────────────────────────────────────────────────────
  
  const analyzeIntent = useCallback(async (text) => {
    try {
      const response = await fetch(`${API_URL}/api/crystal/guardrail/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    } catch (err) {
      console.error('[CrystalResonance] Analyze error:', err);
      return { allowed: false, error: err.message };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH SOURCES: Get available crystal sources
  // ─────────────────────────────────────────────────────────────────────────
  
  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/crystal/sources`);
      return await response.json();
    } catch (err) {
      console.error('[CrystalResonance] Fetch sources error:', err);
      return [];
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // POLLING: High-frequency state synchronization
  // ─────────────────────────────────────────────────────────────────────────
  
  const fetchState = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const response = await fetch(`${API_URL}/api/crystal/state`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (mountedRef.current) {
        setResonance({
          freq: data.frequency,
          isTransitioning: data.is_transitioning,
          activeSource: data.active_module,
          torque: data.torque || 0,
          sourceInfo: data.source_info,
          transition: data.transition,
        });
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setIsConnected(false);
        // Don't spam errors on every poll failure
        if (!error) {
          setError({ type: 'connection', message: err.message });
        }
      }
    }
  }, [error]);

  // Start/Stop polling
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    
    // Initial fetch
    fetchState();
    
    // Start interval
    pollRef.current = setInterval(fetchState, pollInterval);
    console.log(`[CrystalResonance] Polling started (${pollInterval}ms interval)`);
  }, [fetchState, pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      console.log('[CrystalResonance] Polling stopped');
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true;
    
    if (autoConnect) {
      startPolling();
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [autoConnect, startPolling, stopPolling]);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────
  
  const isVoid = resonance.activeSource === 'Void';
  const frequencyHz = resonance.freq;
  const transitionProgress = resonance.transition?.progress || 0;

  return {
    // State
    ...resonance,
    frequencyHz,
    isVoid,
    isConnected,
    error,
    guardrailResult,
    transitionProgress,
    
    // Actions
    pulse,
    instantShift,
    reset,
    analyzeIntent,
    fetchSources,
    
    // Connection control
    startPolling,
    stopPolling,
  };
};

export default useCrystalResonance;
