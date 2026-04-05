import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const RESOLUTION_LEVELS = {
  low: {
    label: 'Low',
    sublabel: 'Battery Saver',
    particleCount: 8,
    blurQuality: 4,
    animationScale: 0.3,
    enableMoire: false,
    enableAuraWake: false,
    audioQuality: 'synthetic',
    icon: 'wireframe',
  },
  medium: {
    label: 'Medium',
    sublabel: 'Balanced',
    particleCount: 24,
    blurQuality: 12,
    animationScale: 0.7,
    enableMoire: true,
    enableAuraWake: true,
    audioQuality: 'compressed',
    icon: 'solid',
  },
  high: {
    label: 'High',
    sublabel: 'Unified Field',
    particleCount: 64,
    blurQuality: 24,
    animationScale: 1.0,
    enableMoire: true,
    enableAuraWake: true,
    audioQuality: 'lossless',
    icon: 'radiant',
  },
};

const ResolutionContext = createContext(null);

export function ResolutionProvider({ children }) {
  const [level, setLevel] = useState('medium');

  const config = RESOLUTION_LEVELS[level];

  const cycleResolution = useCallback(() => {
    setLevel(prev => {
      if (prev === 'low') return 'medium';
      if (prev === 'medium') return 'high';
      return 'low';
    });
  }, []);

  const contextValue = useMemo(() => ({
    level, setLevel, config, cycleResolution, RESOLUTION_LEVELS
  }), [level, config, cycleResolution]);

  return (
    <ResolutionContext.Provider value={contextValue}>
      {children}
    </ResolutionContext.Provider>
  );
}

export function useResolution() {
  const ctx = useContext(ResolutionContext);
  if (!ctx) throw new Error('useResolution must be inside ResolutionProvider');
  return ctx;
}
