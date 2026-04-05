/**
 * HARMONIC RESONANCE SYSTEM
 * 
 * Synchronizes all nodule vibrations to Solfeggio frequencies.
 * Each frequency has unique healing/spiritual properties.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Solfeggio Frequency Map with properties
export const SOLFEGGIO_FREQUENCIES = {
  174: { name: 'Foundation', pulse: '5s', color: 'rgba(139, 69, 19, 0.6)', description: 'Pain relief, security' },
  285: { name: 'Quantum', pulse: '4.5s', color: 'rgba(128, 0, 128, 0.6)', description: 'Tissue regeneration' },
  396: { name: 'Liberation', pulse: '4.2s', color: 'rgba(255, 0, 0, 0.6)', description: 'Release fear & guilt' },
  417: { name: 'Change', pulse: '4s', color: 'rgba(255, 165, 0, 0.6)', description: 'Facilitate change' },
  432: { name: 'Earth', pulse: '4s', color: 'rgba(139, 195, 74, 0.6)', description: 'Universal harmony' },
  528: { name: 'Love', pulse: '2.5s', color: 'rgba(0, 255, 0, 0.6)', description: 'DNA repair, miracles' },
  639: { name: 'Connection', pulse: '3s', color: 'rgba(0, 191, 255, 0.6)', description: 'Relationships, harmony' },
  741: { name: 'Awakening', pulse: '2s', color: 'rgba(75, 0, 130, 0.6)', description: 'Problem solving, cleansing' },
  852: { name: 'Intuition', pulse: '1.5s', color: 'rgba(138, 43, 226, 0.6)', description: 'Spiritual order' },
  963: { name: 'Divine', pulse: '1.2s', color: 'rgba(255, 255, 255, 0.8)', description: 'Pineal activation, oneness' },
};

/**
 * Set the global harmonic resonance for all nodules
 * @param {number} hertzValue - Solfeggio frequency (432, 528, 963, etc.)
 */
export const setGlobalResonance = (hertzValue) => {
  const root = document.documentElement;
  const freq = SOLFEGGIO_FREQUENCIES[hertzValue];
  
  if (freq) {
    root.style.setProperty('--master-pulse', freq.pulse);
    root.setAttribute('data-resonance', hertzValue.toString());
    
    // Dispatch event for React components to listen
    window.dispatchEvent(new CustomEvent('resonance-change', { 
      detail: { frequency: hertzValue, ...freq } 
    }));
    
    console.log(`🎵 Harmonic Resonance: ${hertzValue}Hz (${freq.name}) - ${freq.description}`);
    return freq;
  } else {
    // Reset to default
    root.style.setProperty('--master-pulse', '4s');
    root.removeAttribute('data-resonance');
    return null;
  }
};

/**
 * Get current resonance state
 */
export const getCurrentResonance = () => {
  const root = document.documentElement;
  const resonance = root.getAttribute('data-resonance');
  return resonance ? parseInt(resonance, 10) : null;
};

/**
 * Clear all resonance (return to individual nodule rhythms)
 */
export const clearResonance = () => {
  const root = document.documentElement;
  root.style.removeProperty('--master-pulse');
  root.removeAttribute('data-resonance');
  window.dispatchEvent(new CustomEvent('resonance-change', { detail: null }));
};

/**
 * Cycle through frequencies (useful for meditation progression)
 */
export const cycleResonance = (direction = 'up') => {
  const frequencies = Object.keys(SOLFEGGIO_FREQUENCIES).map(Number).sort((a, b) => a - b);
  const current = getCurrentResonance();
  const currentIndex = current ? frequencies.indexOf(current) : -1;
  
  let nextIndex;
  if (direction === 'up') {
    nextIndex = (currentIndex + 1) % frequencies.length;
  } else {
    nextIndex = currentIndex <= 0 ? frequencies.length - 1 : currentIndex - 1;
  }
  
  return setGlobalResonance(frequencies[nextIndex]);
};

/**
 * React Hook for harmonic resonance
 */

export const useHarmonicResonance = () => {
  const [resonance, setResonance] = useState(getCurrentResonance());
  const [frequencyData, setFrequencyData] = useState(
    resonance ? SOLFEGGIO_FREQUENCIES[resonance] : null
  );

  useEffect(() => {
    const handleChange = (e) => {
      if (e.detail) {
        setResonance(e.detail.frequency);
        setFrequencyData(e.detail);
      } else {
        setResonance(null);
        setFrequencyData(null);
      }
    };

    window.addEventListener('resonance-change', handleChange);
    return () => window.removeEventListener('resonance-change', handleChange);
  }, []);

  const setFrequency = useCallback((hz) => {
    const result = setGlobalResonance(hz);
    setResonance(hz);
    setFrequencyData(result);
    return result;
  }, []);

  const clear = useCallback(() => {
    clearResonance();
    setResonance(null);
    setFrequencyData(null);
  }, []);

  const cycle = useCallback((direction = 'up') => {
    const result = cycleResonance(direction);
    if (result) {
      const hz = Object.entries(SOLFEGGIO_FREQUENCIES)
        .find(([_, v]) => v.pulse === result.pulse)?.[0];
      if (hz) setResonance(parseInt(hz, 10));
      setFrequencyData(result);
    }
    return result;
  }, []);

  return {
    resonance,
    frequencyData,
    frequencies: SOLFEGGIO_FREQUENCIES,
    setFrequency,
    clear,
    cycle,
    isActive: resonance !== null,
  };
};

/**
 * GOLDEN RATIO GEAR SYSTEM
 * 
 * Deterministic rotation system using Phi (φ = 1.618) for the "webbed" interlocking effect.
 * Uses refs to avoid triggering React re-renders on every frame.
 * 
 * @param {number} initialSpeed - Base rotation speed in radians per frame
 * @returns {Object} - { getRotation, startGears, stopGears }
 */
export const useGearSystem = (initialSpeed = 0.01) => {
  const rotationRef = useRef({ cw: 0, ccw: 0 });
  const frameIdRef = useRef(null);
  const callbacksRef = useRef(new Set());
  const PHI = 1.618033988749895; // Golden Ratio
  
  const startGears = useCallback(() => {
    if (frameIdRef.current) return; // Already running
    
    const tick = () => {
      // Update rotation values (no React state = no re-renders)
      rotationRef.current = {
        cw: (rotationRef.current.cw + initialSpeed) % (Math.PI * 2),
        ccw: (rotationRef.current.ccw - (initialSpeed * PHI)) % (Math.PI * 2)
      };
      
      // Notify subscribers (for DOM updates)
      callbacksRef.current.forEach(cb => cb(rotationRef.current));
      
      frameIdRef.current = requestAnimationFrame(tick);
    };
    
    frameIdRef.current = requestAnimationFrame(tick);
  }, [initialSpeed]);
  
  const stopGears = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
  }, []);
  
  // Subscribe to rotation updates for DOM manipulation
  const subscribeToGears = useCallback((callback) => {
    callbacksRef.current.add(callback);
    return () => callbacksRef.current.delete(callback);
  }, []);
  
  // Get current rotation (for one-off reads)
  const getRotation = useCallback(() => rotationRef.current, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stopGears();
  }, [stopGears]);
  
  return {
    getRotation,
    startGears,
    stopGears,
    subscribeToGears,
    PHI,
  };
};

export default {
  SOLFEGGIO_FREQUENCIES,
  setGlobalResonance,
  getCurrentResonance,
  clearResonance,
  cycleResonance,
  useHarmonicResonance,
  useGearSystem,
};
