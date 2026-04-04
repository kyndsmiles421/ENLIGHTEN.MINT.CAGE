import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COSMIC THEME ENGINE — Global Mood-Reactive Color System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages CSS Custom Properties for:
 * - --resonance-primary: Main accent color
 * - --resonance-secondary: Radiance/glow color (Color 2)
 * - --resonance-glow-intensity: Dynamic glow strength
 * - --resonance-surface: Frosted glass background
 * - --resonance-border: Translucent borders
 * 
 * Updates :root CSS variables so the entire app reacts to mood changes.
 */

// ═══ COLOR PALETTES ═══
export const MOOD_PALETTES = {
  // Positive moods
  happy: { primary: '#86EFAC', secondary: '#22C55E', glow: 0.4 },
  peaceful: { primary: '#93C5FD', secondary: '#3B82F6', glow: 0.35 },
  energized: { primary: '#FCD34D', secondary: '#F59E0B', glow: 0.45 },
  grateful: { primary: '#F9A8D4', secondary: '#EC4899', glow: 0.4 },
  curious: { primary: '#A78BFA', secondary: '#8B5CF6', glow: 0.4 },
  inspired: { primary: '#C4B5FD', secondary: '#A78BFA', glow: 0.45 },
  hopeful: { primary: '#6EE7B7', secondary: '#10B981', glow: 0.35 },
  creative: { primary: '#F0ABFC', secondary: '#D946EF', glow: 0.45 },
  connected: { primary: '#67E8F9', secondary: '#06B6D4', glow: 0.4 },
  
  // Challenged moods
  stressed: { primary: '#FCA5A5', secondary: '#EF4444', glow: 0.3 },
  anxious: { primary: '#FDBA74', secondary: '#F97316', glow: 0.3 },
  down: { primary: '#94A3B8', secondary: '#64748B', glow: 0.25 },
  unfocused: { primary: '#CBD5E1', secondary: '#94A3B8', glow: 0.2 },
  
  // Spiritual moods
  brave: { primary: '#FBBF24', secondary: '#D97706', glow: 0.4 },
  lowEnergy: { primary: '#A5B4FC', secondary: '#6366F1', glow: 0.25 },
  
  // Default/Neutral
  neutral: { primary: '#C084FC', secondary: '#A78BFA', glow: 0.35 },
  cosmic: { primary: '#818CF8', secondary: '#6366F1', glow: 0.4 },
};

// ═══ SURFACE PRESETS ═══
const SURFACE_PRESETS = {
  glass: 'rgba(15, 15, 25, 0.6)',
  frosted: 'rgba(15, 15, 25, 0.8)',
  solid: 'rgba(15, 15, 25, 0.95)',
  translucent: 'rgba(15, 15, 25, 0.4)',
};

// ═══ INITIAL THEME ═══
const initialTheme = {
  mood: 'cosmic',
  palette: MOOD_PALETTES.cosmic,
  surface: 'glass',
  glowIntensity: 0.35,
  radianceEnabled: true,
  powerSaveMode: false, // Battery-aware dimming
};

// ═══ POWER SAVE MULTIPLIERS ═══
const POWER_SAVE_CONFIG = {
  glowMultiplier: 0.3,      // Reduce glow to 30% in power save
  blurMultiplier: 0.5,      // Reduce backdrop blur
  animationScale: 0.5,      // Slow down animations
  batteryThreshold: 0.2,    // Trigger at 20% battery
};

// ═══ CONTEXT ═══
const CosmicThemeContext = createContext(null);

// ═══ HELPER: Convert hex to RGB ═══
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '192, 132, 252'; // fallback purple
}

// ═══ PROVIDER ═══
export function CosmicThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('zen_cosmic_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialTheme, ...parsed, palette: MOOD_PALETTES[parsed.mood] || MOOD_PALETTES.cosmic };
      } catch {}
    }
    return initialTheme;
  });

  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(true);

  // ═══ BATTERY MONITORING ═══
  useEffect(() => {
    if (!('getBattery' in navigator)) return;

    let battery = null;

    const updateBattery = () => {
      if (!battery) return;
      setBatteryLevel(battery.level);
      setIsCharging(battery.charging);

      // Auto-enable power save when battery < 20% and not charging
      const shouldPowerSave = battery.level < POWER_SAVE_CONFIG.batteryThreshold && !battery.charging;
      setTheme(prev => {
        if (prev.powerSaveMode !== shouldPowerSave) {
          console.log(`[CosmicTheme] Power save ${shouldPowerSave ? 'ENABLED' : 'DISABLED'} (battery: ${Math.round(battery.level * 100)}%)`);
          return { ...prev, powerSaveMode: shouldPowerSave };
        }
        return prev;
      });
    };

    navigator.getBattery().then(b => {
      battery = b;
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    }).catch(() => {});

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  // ═══ UPDATE CSS VARIABLES ═══
  useEffect(() => {
    const root = document.documentElement;
    const { palette, surface, glowIntensity, radianceEnabled, powerSaveMode } = theme;

    // Calculate effective glow (dimmed in power save)
    const effectiveGlow = powerSaveMode 
      ? glowIntensity * POWER_SAVE_CONFIG.glowMultiplier 
      : glowIntensity;

    // Primary colors
    root.style.setProperty('--resonance-primary', palette.primary);
    root.style.setProperty('--resonance-primary-rgb', hexToRgb(palette.primary));
    
    // Secondary (Color 2 - Radiance)
    root.style.setProperty('--resonance-secondary', palette.secondary);
    root.style.setProperty('--resonance-secondary-rgb', hexToRgb(palette.secondary));
    
    // Glow intensity (power-save aware)
    root.style.setProperty('--resonance-glow-intensity', String(radianceEnabled ? effectiveGlow : 0));
    root.style.setProperty('--resonance-glow', radianceEnabled ? effectiveGlow : 0);
    
    // Surface
    root.style.setProperty('--resonance-surface', SURFACE_PRESETS[surface] || SURFACE_PRESETS.glass);
    
    // Power save indicator
    root.style.setProperty('--resonance-power-save', powerSaveMode ? '1' : '0');
    root.style.setProperty('--resonance-animation-scale', powerSaveMode 
      ? String(POWER_SAVE_CONFIG.animationScale) 
      : '1');
    
    // Computed styles (power-save aware)
    root.style.setProperty('--resonance-border', `rgba(255, 255, 255, 0.1)`);
    root.style.setProperty('--resonance-tint', `rgba(${hexToRgb(palette.secondary)}, ${powerSaveMode ? 0.08 : 0.15})`);
    root.style.setProperty('--resonance-radiance', 
      `radial-gradient(circle, rgba(${hexToRgb(palette.secondary)}, ${effectiveGlow}) 0%, transparent 70%)`
    );
    
    // Text masking layer (prevents glow bleeding into text)
    const textGlowMultiplier = powerSaveMode ? 0.5 : 1;
    root.style.setProperty('--resonance-text-shadow', `0 0 ${20 * textGlowMultiplier}px rgba(${hexToRgb(palette.secondary)}, ${0.3 * textGlowMultiplier})`);
    root.style.setProperty('--resonance-text-glow', `0 0 ${8 * textGlowMultiplier}px rgba(${hexToRgb(palette.primary)}, ${0.4 * textGlowMultiplier})`);

    // Log power save state change
    if (powerSaveMode) {
      console.log('[CosmicTheme] Radiance dimmed to', Math.round(effectiveGlow * 100) + '%');
    }

  }, [theme]);

  // ═══ PERSIST TO LOCALSTORAGE ═══
  useEffect(() => {
    const { mood, surface, glowIntensity, radianceEnabled } = theme;
    localStorage.setItem('zen_cosmic_theme', JSON.stringify({ mood, surface, glowIntensity, radianceEnabled }));
  }, [theme]);

  // ═══ ACTIONS ═══
  const setMood = useCallback((mood) => {
    const palette = MOOD_PALETTES[mood] || MOOD_PALETTES.cosmic;
    setTheme(prev => ({ ...prev, mood, palette }));
  }, []);

  const setGlowIntensity = useCallback((intensity) => {
    setTheme(prev => ({ ...prev, glowIntensity: Math.max(0, Math.min(1, intensity)) }));
  }, []);

  const setSurface = useCallback((surface) => {
    if (SURFACE_PRESETS[surface]) {
      setTheme(prev => ({ ...prev, surface }));
    }
  }, []);

  const toggleRadiance = useCallback(() => {
    setTheme(prev => ({ ...prev, radianceEnabled: !prev.radianceEnabled }));
  }, []);

  const togglePowerSave = useCallback(() => {
    setTheme(prev => ({ ...prev, powerSaveMode: !prev.powerSaveMode }));
  }, []);

  const setPowerSave = useCallback((enabled) => {
    setTheme(prev => ({ ...prev, powerSaveMode: enabled }));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(initialTheme);
  }, []);

  // ═══ COMPUTED STYLES ═══
  const styles = useMemo(() => ({
    // Frosted glass surface
    glassSurface: {
      background: 'var(--resonance-surface)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--resonance-border)',
    },
    // Color 2 radiance glow
    radiance: {
      background: 'var(--resonance-radiance)',
    },
    // Base tint overlay
    tint: {
      background: 'var(--resonance-tint)',
    },
    // Glowing border
    glowBorder: {
      border: `1px solid rgba(var(--resonance-secondary-rgb), 0.3)`,
      boxShadow: `0 0 20px rgba(var(--resonance-secondary-rgb), var(--resonance-glow-intensity))`,
    },
    // Text with glow (use sparingly)
    glowText: {
      textShadow: 'var(--resonance-text-glow)',
    },
  }), []);

  const value = useMemo(() => ({
    // State
    mood: theme.mood,
    palette: theme.palette,
    surface: theme.surface,
    glowIntensity: theme.glowIntensity,
    radianceEnabled: theme.radianceEnabled,
    powerSaveMode: theme.powerSaveMode,
    
    // Battery state
    batteryLevel,
    isCharging,
    
    // Actions
    setMood,
    setGlowIntensity,
    setSurface,
    toggleRadiance,
    togglePowerSave,
    setPowerSave,
    resetTheme,
    
    // Pre-computed styles
    styles,
    
    // Color helpers
    getPrimaryRgb: () => hexToRgb(theme.palette.primary),
    getSecondaryRgb: () => hexToRgb(theme.palette.secondary),
    
    // Power save config (for external use)
    powerSaveConfig: POWER_SAVE_CONFIG,
  }), [theme, batteryLevel, isCharging, setMood, setGlowIntensity, setSurface, toggleRadiance, togglePowerSave, setPowerSave, resetTheme, styles]);

  return (
    <CosmicThemeContext.Provider value={value}>
      {children}
    </CosmicThemeContext.Provider>
  );
}

// ═══ HOOK ═══
export function useCosmicTheme() {
  const context = useContext(CosmicThemeContext);
  if (!context) {
    throw new Error('useCosmicTheme must be used within CosmicThemeProvider');
  }
  return context;
}

// ═══ MOOD PALETTES EXPORT ═══
export { SURFACE_PRESETS };

export default CosmicThemeProvider;
