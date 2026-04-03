import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useMixer } from './MixerContext';

const FocusContext = createContext({
  focusMode: false,
  hyperFocus: false,
  enterFocus: () => {},
  exitFocus: () => {},
  toggleFocus: () => {},
});

export function FocusProvider({ children }) {
  const [focusMode, setFocusMode] = useState(false);
  const [hyperFocus, setHyperFocus] = useState(false);
  const { activeFreqs, activeSounds, activeDrones } = useMixer();
  const autoTriggered = useRef(false);

  const totalActive = activeFreqs.size + activeSounds.size + activeDrones.size;

  // Auto-trigger: 3+ active modules → suggest/enter focus
  // Hyper-focus: 5+ modules = triple synthesis territory
  useEffect(() => {
    if (totalActive >= 3 && !focusMode && !autoTriggered.current) {
      autoTriggered.current = true;
      setFocusMode(true);
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
  }, [totalActive, focusMode]);

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

  return (
    <FocusContext.Provider value={{ focusMode, hyperFocus, enterFocus, exitFocus, toggleFocus }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  return useContext(FocusContext);
}
