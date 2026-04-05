import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useMixer } from './MixerContext';
import { recordSynthesis } from '../utils/sentinel';

const FocusContext = createContext({
  focusMode: false,
  hyperFocus: false,
  synthesisCount: 0,
  enterFocus: () => {},
  exitFocus: () => {},
  toggleFocus: () => {},
});

export function FocusProvider({ children }) {
  const [focusMode, setFocusMode] = useState(false);
  const [hyperFocus, setHyperFocus] = useState(false);
  const [synthesisCount, setSynthesisCount] = useState(() => {
    try { return parseInt(localStorage.getItem('cosmic_synthesis_count') || '0', 10); } catch { return 0; }
  });
  const { activeFreqs, activeSounds, activeDrones } = useMixer();
  const autoTriggered = useRef(false);

  const totalActive = activeFreqs.size + activeSounds.size + activeDrones.size;

  // Auto-trigger: 3+ active modules → suggest/enter focus
  // Hyper-focus: 5+ modules = triple synthesis territory
  // LOOP-FIX: Remove focusMode from dependencies to prevent infinite loop
  useEffect(() => {
    if (totalActive >= 3 && !autoTriggered.current) {
      autoTriggered.current = true;
      setFocusMode(true);
      // Record a synthesis event for progressive disclosure
      const count = recordSynthesis();
      setSynthesisCount(count);
    }
    if (totalActive >= 5) {
      setHyperFocus(true);
    } else {
      setHyperFocus(false);
    }
    if (totalActive === 0) {
      setFocusMode(false);
      setHyperFocus(false);
      autoTriggered.current = false;
    }
  }, [totalActive]); // Removed focusMode - it's already controlled by the effect

  // Sync body class for CSS-based focus hiding
  useEffect(() => {
    document.body.classList.toggle('cosmic-focus-mode', focusMode);
    document.body.classList.toggle('cosmic-hyper-focus', hyperFocus);
    return () => {
      document.body.classList.remove('cosmic-focus-mode', 'cosmic-hyper-focus');
    };
  }, [focusMode, hyperFocus]);

  const enterFocus = useCallback(() => {
    setFocusMode(true);
    autoTriggered.current = true;
  }, []);

  const exitFocus = useCallback(() => {
    setFocusMode(false);
    setHyperFocus(false);
    autoTriggered.current = true; // Don't auto-retrigger after manual exit
  }, []);

  const toggleFocus = useCallback(() => {
    setFocusMode(prev => {
      autoTriggered.current = true;
      return !prev;
    });
  }, []);

  // GATEKEEPER: Memoize context value
  const value = useMemo(() => ({
    focusMode, hyperFocus, synthesisCount, enterFocus, exitFocus, toggleFocus
  }), [focusMode, hyperFocus, synthesisCount, enterFocus, exitFocus, toggleFocus]);

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  return useContext(FocusContext);
}
