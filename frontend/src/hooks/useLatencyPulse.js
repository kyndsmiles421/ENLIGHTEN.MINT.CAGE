import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LatencyContext = createContext(null);

// Threshold configs (ms)
const THRESHOLDS = { instant: 150, fast: 300, normal: 800 };

function getLatencyColor(ms) {
  if (ms <= THRESHOLDS.instant) return '#22C55E';   // green — instant
  if (ms <= THRESHOLDS.fast) return '#3B82F6';       // blue — fast
  if (ms <= THRESHOLDS.normal) return '#F59E0B';     // amber — acceptable
  return '#EF4444';                                   // red — slow
}

function getLatencyLabel(ms) {
  if (ms <= THRESHOLDS.instant) return 'instant';
  if (ms <= THRESHOLDS.fast) return 'fast';
  if (ms <= THRESHOLDS.normal) return 'ok';
  return 'slow';
}

export function LatencyProvider({ children }) {
  const [pulses, setPulses] = useState({});
  const timers = useRef({});

  // Start tracking latency for a specific action
  const startPulse = useCallback((id) => {
    timers.current[id] = performance.now();
    setPulses(prev => ({ ...prev, [id]: { state: 'loading', ms: 0 } }));
  }, []);

  // End tracking — record the latency
  const endPulse = useCallback((id, success = true) => {
    const start = timers.current[id];
    if (!start) return;
    const ms = Math.round(performance.now() - start);
    delete timers.current[id];
    setPulses(prev => ({
      ...prev,
      [id]: { state: success ? 'done' : 'error', ms, color: getLatencyColor(ms), label: getLatencyLabel(ms) }
    }));
    // Auto-clear after 4s
    setTimeout(() => {
      setPulses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 4000);
  }, []);

  // Wrap an async function with latency tracking
  const tracked = useCallback((id, asyncFn) => {
    return async (...args) => {
      startPulse(id);
      try {
        const result = await asyncFn(...args);
        endPulse(id, true);
        return result;
      } catch (err) {
        endPulse(id, false);
        throw err;
      }
    };
  }, [startPulse, endPulse]);

  return (
    <LatencyContext.Provider value={{ pulses, startPulse, endPulse, tracked }}>
      {children}
    </LatencyContext.Provider>
  );
}

export function useLatency() {
  return useContext(LatencyContext);
}

// Visual pulse dot — attach near any button
export function LatencyDot({ id, size = 6, className = '' }) {
  const { pulses } = useLatency() || {};
  const pulse = pulses?.[id];
  if (!pulse) return null;

  return (
    <AnimatePresence>
      <motion.span
        key={`${id}-${pulse.state}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`inline-flex items-center gap-1 ${className}`}
        style={{ lineHeight: 1 }}>
        {pulse.state === 'loading' ? (
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              width: size, height: size, borderRadius: '50%',
              background: '#818CF8', display: 'inline-block',
            }} />
        ) : (
          <>
            <span style={{
              width: size, height: size, borderRadius: '50%',
              background: pulse.color, display: 'inline-block',
              boxShadow: `0 0 ${size}px ${pulse.color}60`,
            }} />
            <span style={{
              fontSize: size + 2, color: pulse.color,
              fontFamily: 'monospace', fontWeight: 700,
            }}>{pulse.ms}ms</span>
          </>
        )}
      </motion.span>
    </AnimatePresence>
  );
}

// Global floating latency HUD — shows recent action latencies
export function LatencyHUD() {
  const { pulses } = useLatency() || {};
  const entries = Object.entries(pulses || {}).filter(([, p]) => p.state !== 'loading').slice(-5);
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-16 right-3 z-40 flex flex-col gap-1"
      style={{ pointerEvents: 'none' }}>
      {entries.map(([id, p]) => (
        <motion.div key={id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{
            background: 'rgba(3,4,10,0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${p.color}30`,
          }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 4px ${p.color}80`,
          }} />
          <span className="text-[7px] font-mono" style={{ color: p.color }}>
            {p.ms}ms
          </span>
          <span className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.3)' }}>
            {id.replace(/_/g, ' ')}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
