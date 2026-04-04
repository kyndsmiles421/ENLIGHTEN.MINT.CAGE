import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COSMIC THEME ENGINE — Global Mood-Reactive Color System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Now supports TWO aesthetic modes:
 * 
 * 1. COSMIC MODE (Default): Deep blacks, neon glows, space atmosphere
 *    - For: Hub, Mixer, Orbital navigation
 *    - Feel: "Cockpit" - operational, immersive
 * 
 * 2. CAFÉ MODE (Enlightenment Athenaeum): Warm intellectual study aesthetic
 *    - For: Research, Study pages, Angels & Aliens content
 *    - Feel: "Library" - invites lingering and learning
 *    - Palette: Vellum, Charcoal, Aged Gold
 * 
 * Manages CSS Custom Properties for:
 * - --resonance-primary: Main accent color
 * - --resonance-secondary: Radiance/glow color (Color 2)
 * - --resonance-glow-intensity: Dynamic glow strength
 * - --resonance-surface: Frosted glass background
 * - --resonance-border: Translucent borders
 * - --cafe-*: Café mode specific variables
 * 
 * Updates :root CSS variables so the entire app reacts to mode/mood changes.
 */

// ═══ THEME MODES ═══
export const THEME_MODES = {
  COSMIC: 'cosmic',
  CAFE: 'cafe',
};

// ═══ CAFÉ PALETTE (Enlightenment Athenaeum) ═══
export const CAFE_PALETTE = {
  // Core colors
  vellum: '#F5F0E6',           // Aged paper background
  charcoal: '#2C2C2C',         // Deep readable text
  agedGold: '#C4A35A',         // Accent highlights
  espresso: '#3D2B1F',         // Dark accents
  cream: '#FDF8F0',            // Light surfaces
  inkBlack: '#1A1A1A',         // Headers, strong text
  
  // Semantic colors
  primary: '#C4A35A',          // Aged Gold - primary accent
  secondary: '#8B7355',        // Warm brown - secondary
  background: '#F5F0E6',       // Vellum
  surface: '#FDFBF7',          // Slightly lighter paper
  text: '#2C2C2C',             // Charcoal
  textMuted: '#6B5B4F',        // Softer brown-gray
  border: '#E5DED3',           // Subtle warm border
  
  // Reading-optimized
  paperWhite: '#FFFEF9',       // Pure reading surface
  marginalia: '#9B8B7A',       // Notes, secondary info
  highlight: '#F7E8C4',        // Highlighted passages
  link: '#6B4423',             // Hyperlink brown
};

// ═══ CAFÉ SURFACE PRESETS ═══
const CAFE_SURFACES = {
  paper: 'rgba(245, 240, 230, 0.98)',      // Main reading surface
  parchment: 'rgba(253, 248, 240, 0.95)',  // Elevated cards
  sidebar: 'rgba(60, 50, 40, 0.95)',       // Dark sidebar (glossary)
  overlay: 'rgba(44, 44, 44, 0.85)',       // Modal overlays
};

// ═══ COLOR PALETTES (Cosmic Mode) ═══
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
  mode: THEME_MODES.COSMIC,   // 'cosmic' | 'cafe'
  mood: 'cosmic',
  palette: MOOD_PALETTES.cosmic,
  surface: 'glass',
  glowIntensity: 0.35,
  radianceEnabled: true,
  powerSaveMode: false,
};

// ═══ POWER SAVE MULTIPLIERS ═══
const POWER_SAVE_CONFIG = {
  glowMultiplier: 0.3,
  blurMultiplier: 0.5,
  animationScale: 0.5,
  batteryThreshold: 0.2,
};

// ═══ CONTEXT ═══
const CosmicThemeContext = createContext(null);

// ═══ HELPER: Convert hex to RGB ═══
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '192, 132, 252';
}

// ═══ PROVIDER ═══
export function CosmicThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
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
    const { mode, palette, surface, glowIntensity, radianceEnabled, powerSaveMode } = theme;
    const isCafeMode = mode === THEME_MODES.CAFE;

    // Calculate effective glow (dimmed in power save)
    const effectiveGlow = powerSaveMode 
      ? glowIntensity * POWER_SAVE_CONFIG.glowMultiplier 
      : glowIntensity;

    // ═══ MODE INDICATOR ═══
    root.style.setProperty('--theme-mode', mode);
    root.setAttribute('data-theme-mode', mode);

    if (isCafeMode) {
      // ═══ CAFÉ MODE (Enlightenment Athenaeum) ═══
      root.style.setProperty('--resonance-primary', CAFE_PALETTE.primary);
      root.style.setProperty('--resonance-primary-rgb', hexToRgb(CAFE_PALETTE.primary));
      root.style.setProperty('--resonance-secondary', CAFE_PALETTE.secondary);
      root.style.setProperty('--resonance-secondary-rgb', hexToRgb(CAFE_PALETTE.secondary));
      
      // Café surfaces
      root.style.setProperty('--resonance-surface', CAFE_SURFACES.paper);
      root.style.setProperty('--resonance-border', CAFE_PALETTE.border);
      
      // Café-specific variables
      root.style.setProperty('--cafe-background', CAFE_PALETTE.background);
      root.style.setProperty('--cafe-surface', CAFE_PALETTE.surface);
      root.style.setProperty('--cafe-text', CAFE_PALETTE.text);
      root.style.setProperty('--cafe-text-muted', CAFE_PALETTE.textMuted);
      root.style.setProperty('--cafe-vellum', CAFE_PALETTE.vellum);
      root.style.setProperty('--cafe-charcoal', CAFE_PALETTE.charcoal);
      root.style.setProperty('--cafe-gold', CAFE_PALETTE.agedGold);
      root.style.setProperty('--cafe-espresso', CAFE_PALETTE.espresso);
      root.style.setProperty('--cafe-cream', CAFE_PALETTE.cream);
      root.style.setProperty('--cafe-paper-white', CAFE_PALETTE.paperWhite);
      root.style.setProperty('--cafe-marginalia', CAFE_PALETTE.marginalia);
      root.style.setProperty('--cafe-highlight', CAFE_PALETTE.highlight);
      root.style.setProperty('--cafe-link', CAFE_PALETTE.link);
      root.style.setProperty('--cafe-sidebar', CAFE_SURFACES.sidebar);
      
      // Disable cosmic glow effects in café mode
      root.style.setProperty('--resonance-glow-intensity', '0');
      root.style.setProperty('--resonance-glow', '0');
      root.style.setProperty('--resonance-radiance', 'none');
      root.style.setProperty('--resonance-tint', CAFE_PALETTE.highlight);
      root.style.setProperty('--resonance-text-shadow', 'none');
      root.style.setProperty('--resonance-text-glow', 'none');
      
    } else {
      // ═══ COSMIC MODE (Original) ═══
      root.style.setProperty('--resonance-primary', palette.primary);
      root.style.setProperty('--resonance-primary-rgb', hexToRgb(palette.primary));
      root.style.setProperty('--resonance-secondary', palette.secondary);
      root.style.setProperty('--resonance-secondary-rgb', hexToRgb(palette.secondary));
      
      // Glow intensity (power-save aware)
      root.style.setProperty('--resonance-glow-intensity', String(radianceEnabled ? effectiveGlow : 0));
      root.style.setProperty('--resonance-glow', radianceEnabled ? effectiveGlow : 0);
      
      // Surface
      root.style.setProperty('--resonance-surface', SURFACE_PRESETS[surface] || SURFACE_PRESETS.glass);
      root.style.setProperty('--resonance-border', 'rgba(255, 255, 255, 0.1)');
      
      // Computed styles (power-save aware)
      root.style.setProperty('--resonance-tint', `rgba(${hexToRgb(palette.secondary)}, ${powerSaveMode ? 0.08 : 0.15})`);
      root.style.setProperty('--resonance-radiance', 
        `radial-gradient(circle, rgba(${hexToRgb(palette.secondary)}, ${effectiveGlow}) 0%, transparent 70%)`
      );
      
      // Text effects
      const textGlowMultiplier = powerSaveMode ? 0.5 : 1;
      root.style.setProperty('--resonance-text-shadow', `0 0 ${20 * textGlowMultiplier}px rgba(${hexToRgb(palette.secondary)}, ${0.3 * textGlowMultiplier})`);
      root.style.setProperty('--resonance-text-glow', `0 0 ${8 * textGlowMultiplier}px rgba(${hexToRgb(palette.primary)}, ${0.4 * textGlowMultiplier})`);
    }

    // Power save indicator (both modes)
    root.style.setProperty('--resonance-power-save', powerSaveMode ? '1' : '0');
    root.style.setProperty('--resonance-animation-scale', powerSaveMode 
      ? String(POWER_SAVE_CONFIG.animationScale) 
      : '1');

    console.log(`[CosmicTheme] Mode: ${mode.toUpperCase()}${powerSaveMode ? ' (Power Save)' : ''}`);

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

  // ═══ MODE SWITCHING ═══
  const setMode = useCallback((mode) => {
    if (mode === THEME_MODES.COSMIC || mode === THEME_MODES.CAFE) {
      setTheme(prev => ({ ...prev, mode }));
    }
  }, []);

  const toggleMode = useCallback(() => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === THEME_MODES.COSMIC ? THEME_MODES.CAFE : THEME_MODES.COSMIC,
    }));
  }, []);

  const isCafeMode = theme.mode === THEME_MODES.CAFE;
  const isCosmicMode = theme.mode === THEME_MODES.COSMIC;

  // ═══ COMPUTED STYLES ═══
  const styles = useMemo(() => ({
    // Frosted glass surface (adapts to mode)
    glassSurface: isCafeMode ? {
      background: CAFE_SURFACES.parchment,
      border: `1px solid ${CAFE_PALETTE.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    } : {
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
    // Glowing border (cosmic only)
    glowBorder: isCafeMode ? {
      border: `1px solid ${CAFE_PALETTE.border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    } : {
      border: `1px solid rgba(var(--resonance-secondary-rgb), 0.3)`,
      boxShadow: `0 0 20px rgba(var(--resonance-secondary-rgb), var(--resonance-glow-intensity))`,
    },
    // Text with glow (cosmic only)
    glowText: {
      textShadow: 'var(--resonance-text-glow)',
    },
    // ═══ CAFÉ-SPECIFIC STYLES ═══
    cafeCard: {
      background: CAFE_PALETTE.paperWhite,
      border: `1px solid ${CAFE_PALETTE.border}`,
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    cafeSidebar: {
      background: CAFE_SURFACES.sidebar,
      color: CAFE_PALETTE.cream,
      borderLeft: `1px solid ${CAFE_PALETTE.espresso}`,
    },
    cafeText: {
      color: CAFE_PALETTE.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
    },
    cafeHeading: {
      color: CAFE_PALETTE.inkBlack,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontWeight: 600,
    },
    cafeLink: {
      color: CAFE_PALETTE.link,
      textDecoration: 'underline',
      textDecorationColor: CAFE_PALETTE.agedGold,
    },
    cafeHighlight: {
      background: CAFE_PALETTE.highlight,
      padding: '2px 4px',
      borderRadius: 2,
    },
  }), [isCafeMode]);

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
