/**
 * HARMONIC RESONANCE SYSTEM
 * 
 * Synchronizes all nodule vibrations to Solfeggio frequencies.
 * Each frequency has unique healing/spiritual properties.
 */

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
import { useState, useEffect, useCallback } from 'react';

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

export default {
  SOLFEGGIO_FREQUENCIES,
  setGlobalResonance,
  getCurrentResonance,
  clearResonance,
  cycleResonance,
  useHarmonicResonance,
};
