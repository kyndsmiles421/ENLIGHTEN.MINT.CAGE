/**
 * CRYSTAL RESONANCE HOOK
 * ======================
 * 
 * Real-time connection to the Central Crystal backend.
 * Provides frequency state, torque-based 3D transforms, and pulse control.
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                        Frontend Component                               │
 * │                              │                                          │
 * │                    useCrystalResonance()                                │
 * │                      │           │           │                          │
 * │              poll (150ms)    pulse()    latticeStyle                   │
 * │                      │           │           │                          │
 * │                      ▼           ▼           ▼                          │
 * │              /api/crystal/*    Backend    CSS Transform                │
 * │                                                                         │
 * │   TORQUE MECHANICS:                                                     │
 * │   - Heavier (theological) data creates tighter spirals                  │
 * │   - Torque drives 3D Lattice rotation: rotateY(torque°)                │
 * │   - Scale contracts during transition: scale(1 - torque/500)           │
 * │   - Blur applied during harmonizing: blur(2px)                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * KEITH WRIGHT'S PRINCIPLE:
 * The hook creates a real-time "resonance link" between the UI
 * and the Crystal's frequency. Changes propagate as harmonic waves.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Default crystal state
const DEFAULT_STATE = {
  freq: 0,
  isTransitioning: false,
  activeSource: 'Void',
  torque: 0,
  sourceInfo: null,
  transition: null,
  seed: null,
};

/**
 * Hook for real-time crystal resonance tracking
 * 
 * @param {Object} options Configuration options
 * @param {number} options.pollInterval Polling interval in ms (default: 150ms for smooth 3D)
 * @param {boolean} options.autoConnect Start polling immediately (default: true)
 * @returns {Object} Crystal state, control functions, and latticeStyle for 3D transforms
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
  const [lastSeed, setLastSeed] = useState(null);
  
  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  // ─────────────────────────────────────────────────────────────────────────
  // LATTICE STYLE: 3D Transform based on Torque (for Spherical Codex)
  // ─────────────────────────────────────────────────────────────────────────
  
  const latticeStyle = useMemo(() => ({
    transform: `rotateY(${resonance.torque}deg) scale(${1 - (resonance.torque / 500)})`,
    filter: `blur(${resonance.isTransitioning ? '2px' : '0px'})`,
    transition: 'transform 0.1s ease-out, filter 0.3s ease',
  }), [resonance.torque, resonance.isTransitioning]);

  // ─────────────────────────────────────────────────────────────────────────
  // VISUAL GROUNDING: Effect when signal is blocked
  // ─────────────────────────────────────────────────────────────────────────
  
  const triggerVisualLeadShed = useCallback(() => {
    // Dispatch custom event for visual feedback components to listen
    window.dispatchEvent(new CustomEvent('crystal-grounded', {
      detail: { guardrailResult }
    }));
  }, [guardrailResult]);

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
        triggerVisualLeadShed();
        return { success: false, status: 'GROUNDED', ...data };
      }

      // Store seed from successful transition
      if (data.seed) {
        setLastSeed(data.seed);
      }

      console.log(`[CrystalResonance] ${data.status}: Pulsed to ${target}`, {
        seed: data.seed,
        torque: data.max_torque,
        duration: data.duration_seconds
      });
      
      return { success: true, ...data };
      
    } catch (err) {
      console.error('[CrystalResonance] Pulse error:', err);
      setError({ type: 'network', message: err.message });
      return { success: false, error: err.message };
    }
  }, [triggerVisualLeadShed]);

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
          seed: data.transition?.seed || null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]); // Remove startPolling/stopPolling - they use refs internally

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
    lastSeed,
    
    // 3D Lattice Transform (for Spherical Codex)
    latticeStyle,
    
    // Actions
    pulse,
    instantShift,
    reset,
    analyzeIntent,
    fetchSources,
    triggerVisualLeadShed,
    
    // Connection control
    startPolling,
    stopPolling,
  };
};

export default useCrystalResonance;
