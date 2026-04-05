import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * EnlightenmentCafeContext — The Digital Sanctuary Theme Engine
 * 
 * Philosophy: A "Social Mesh" where every user is an autonomous node,
 * but the "Cafe" provides collective warmth and guidance.
 * 
 * Two Visualization Tiers:
 * - "Parchment" (Essential): High-performance SVG, minimalist, hand-drawn aesthetic
 * - "Nebula" (Premium): WebGL-powered 3D with floating islands and volumetric fog
 * 
 * IMPORTANT: Nothing is automatic. All visual changes are user-triggered.
 */

const EnlightenmentCafeContext = createContext(null);

// ─── Parchment Palette (Essential Tier) ───
export const PARCHMENT_PALETTE = {
  // Light Mode (Cream & Ink)
  light: {
    background: '#FAF8F5',        // Warm cream/vellum
    backgroundAlt: '#F5F2ED',     // Slightly darker cream
    surface: '#FFFFFF',           // Pure white cards
    surfaceElevated: '#FFFFFE',
    ink: '#2A2A2A',              // Charcoal ink
    inkMuted: '#5A5A5A',         // Lighter ink
    inkFaint: '#8A8A8A',         // Faint ink
    gold: '#C9A962',             // Aged gold accent
    goldMuted: '#D4BC7D',        // Lighter gold
    copper: '#B87333',           // Warm copper accent
    sepia: '#704214',            // Deep sepia
    border: '#E8E4DC',           // Soft border
    borderStrong: '#D4CFC4',
    shadow: 'rgba(42, 42, 42, 0.08)',
    // Cluster colors (muted, ink-like)
    practice: '#2D5A4A',         // Forest ink
    divination: '#5A3D6A',       // Plum ink
    sanctuary: '#4A5A2D',        // Olive ink
    explore: '#2D4A5A',          // Teal ink
    today: '#6A5A2D',            // Ochre ink
  },
  // Dark Mode (Charcoal & Gold)
  dark: {
    background: '#1A1A1D',        // Deep charcoal
    backgroundAlt: '#222225',     // Slightly lighter
    surface: '#2A2A2E',          // Card surface
    surfaceElevated: '#323236',
    ink: '#F5F2ED',              // Cream ink (inverted)
    inkMuted: '#C4C0B8',
    inkFaint: '#8A8680',
    gold: '#C9A962',             // Aged gold (same)
    goldMuted: '#A08A4A',
    copper: '#CD853F',
    sepia: '#DEB887',
    border: '#3A3A3E',
    borderStrong: '#4A4A4E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    // Cluster colors (luminous)
    practice: '#5AEBC2',
    divination: '#D8A4F9',
    sanctuary: '#A4E95A',
    explore: '#5AC2EB',
    today: '#EBC25A',
  },
};

// ─── Nebula Palette (Premium Tier) ───
export const NEBULA_PALETTE = {
  background: 'linear-gradient(180deg, #0A0A12 0%, #12121A 50%, #0A0812 100%)',
  surface: 'rgba(20, 20, 30, 0.8)',
  glow: {
    primary: '#818CF8',
    secondary: '#C084FC',
    tertiary: '#2DD4BF',
  },
  fog: 'rgba(129, 140, 248, 0.03)',
  // Cluster colors (cosmic)
  practice: '#2DD4BF',
  divination: '#E879F9',
  sanctuary: '#86EFAC',
  explore: '#38BDF8',
  today: '#FCD34D',
};

// ─── Typography ───
export const CAFE_TYPOGRAPHY = {
  parchment: {
    heading: '"Cormorant Garamond", "Georgia", serif',
    body: '"Inter", "Helvetica Neue", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  nebula: {
    heading: '"Space Grotesk", "Inter", sans-serif',
    body: '"Inter", "Helvetica Neue", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
};

// ─── The Five Cafe Zones ───
export const CAFE_ZONES = {
  practice: {
    id: 'practice',
    label: 'The Practice Room',
    description: 'Breathing, meditation, and movement',
    icon: 'Wind',
    modules: ['breathing', 'meditation', 'yoga', 'exercises', 'mudras', 'mantras', 'affirmations'],
  },
  divination: {
    id: 'divination',
    label: 'The Oracle Chamber',
    description: 'Tarot, astrology, and cosmic insights',
    icon: 'Sparkles',
    modules: ['oracle', 'star-chart', 'numerology', 'dreams', 'forecasts', 'cosmic-profile'],
  },
  sanctuary: {
    id: 'sanctuary',
    label: 'The Sanctuary',
    description: 'Journaling, mood, and soundscapes',
    icon: 'Heart',
    modules: ['journal', 'mood', 'soundscapes', 'frequencies', 'zen-garden', 'light-therapy'],
  },
  explore: {
    id: 'explore',
    label: 'The Explorer\'s Lounge',
    description: 'AI guidance, council, and community',
    icon: 'Compass',
    modules: ['coach', 'sovereigns', 'challenges', 'community', 'blessings'],
  },
  today: {
    id: 'today',
    label: 'Today\'s Ritual',
    description: 'Daily briefing, rituals, and calendar',
    icon: 'Sun',
    modules: ['daily-briefing', 'daily-ritual', 'cosmic-calendar'],
  },
};

export function EnlightenmentCafeProvider({ children }) {
  // View tier: 'parchment' (Essential) or 'nebula' (Premium)
  const [viewTier, setViewTier] = useState('parchment');
  
  // Color mode within parchment: 'light' or 'dark'
  const [colorMode, setColorMode] = useState('dark');
  
  // Active zone focus (user can focus on one zone)
  const [activeZone, setActiveZone] = useState(null);
  
  // Cafe atmosphere settings (user-controlled)
  const [atmosphere, setAtmosphere] = useState({
    ambientSound: false,       // Cafe ambiance audio
    particleEffects: false,    // Floating particles (steam, dust)
    depthBlur: false,          // Background blur for focus
    warmGlow: true,            // Subtle warm overlay
  });

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('enlightenment_cafe_prefs') || '{}');
      if (stored.viewTier) setViewTier(stored.viewTier);
      if (stored.colorMode) setColorMode(stored.colorMode);
      if (stored.atmosphere) setAtmosphere(prev => ({ ...prev, ...stored.atmosphere }));
    } catch (e) {
      console.warn('Failed to load Cafe preferences:', e);
    }
  }, []);

  // Persist preferences
  const savePreferences = useCallback(() => {
    try {
      localStorage.setItem('enlightenment_cafe_prefs', JSON.stringify({
        viewTier,
        colorMode,
        atmosphere,
      }));
    } catch (e) {}
  }, [viewTier, colorMode, atmosphere]);

  useEffect(() => {
    savePreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTier, colorMode, atmosphere]); // Remove savePreferences to prevent infinite loop

  // Get current palette
  const getPalette = useCallback(() => {
    if (viewTier === 'nebula') {
      return NEBULA_PALETTE;
    }
    return PARCHMENT_PALETTE[colorMode];
  }, [viewTier, colorMode]);

  // Get typography
  const getTypography = useCallback(() => {
    return viewTier === 'nebula' ? CAFE_TYPOGRAPHY.nebula : CAFE_TYPOGRAPHY.parchment;
  }, [viewTier]);

  // Toggle view tier (user-triggered)
  const toggleViewTier = useCallback(() => {
    setViewTier(prev => prev === 'parchment' ? 'nebula' : 'parchment');
  }, []);

  // Toggle color mode (user-triggered, parchment only)
  const toggleColorMode = useCallback(() => {
    setColorMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Update atmosphere setting (user-triggered)
  const updateAtmosphere = useCallback((key, value) => {
    setAtmosphere(prev => ({ ...prev, [key]: value }));
  }, []);

  // Focus on a zone (user-triggered)
  const focusZone = useCallback((zoneId) => {
    setActiveZone(zoneId);
  }, []);

  // Clear zone focus
  const clearZoneFocus = useCallback(() => {
    setActiveZone(null);
  }, []);

  // Apply CSS variables to document
  useEffect(() => {
    const palette = getPalette();
    const typography = getTypography();
    const root = document.documentElement;
    const body = document.body;
    
    // Apply palette
    Object.entries(palette).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--cafe-${key}`, value);
      }
    });
    
    // Apply typography
    root.style.setProperty('--cafe-font-heading', typography.heading);
    root.style.setProperty('--cafe-font-body', typography.body);
    root.style.setProperty('--cafe-font-mono', typography.mono);
    
    // Apply tier class
    root.classList.remove('cafe-parchment', 'cafe-nebula');
    root.classList.add(`cafe-${viewTier}`);
    body.classList.remove('cafe-parchment', 'cafe-nebula');
    body.classList.add(`cafe-${viewTier}`);
    
    // Apply color mode class (parchment only)
    root.classList.remove('cafe-light', 'cafe-dark');
    body.classList.remove('cafe-light', 'cafe-dark');
    if (viewTier === 'parchment') {
      root.classList.add(`cafe-${colorMode}`);
      body.classList.add(`cafe-${colorMode}`);
    }
    
    // Apply body background directly for parchment light
    if (viewTier === 'parchment' && colorMode === 'light') {
      body.style.background = '#FAF8F5';
      body.style.color = '#2A2A2A';
    } else if (viewTier === 'parchment' && colorMode === 'dark') {
      body.style.background = '#1A1A1D';
      body.style.color = '#F5F2ED';
    } else {
      body.style.background = '';
      body.style.color = '';
    }
    
    // Apply atmosphere effects
    if (atmosphere.warmGlow) {
      root.setAttribute('data-cafe-warmglow', 'true');
    } else {
      root.removeAttribute('data-cafe-warmglow');
    }
  }, [viewTier, colorMode, atmosphere.warmGlow, getPalette, getTypography]);

  const value = {
    // State
    viewTier,
    colorMode,
    activeZone,
    atmosphere,
    
    // Getters
    getPalette,
    getTypography,
    
    // Actions (All User-Triggered)
    toggleViewTier,
    toggleColorMode,
    updateAtmosphere,
    focusZone,
    clearZoneFocus,
    setViewTier,
    setColorMode,
    
    // Constants
    PARCHMENT_PALETTE,
    NEBULA_PALETTE,
    CAFE_TYPOGRAPHY,
    CAFE_ZONES,
  };

  return (
    <EnlightenmentCafeContext.Provider value={value}>
      {children}
    </EnlightenmentCafeContext.Provider>
  );
}

export function useEnlightenmentCafe() {
  const ctx = useContext(EnlightenmentCafeContext);
  if (!ctx) {
    throw new Error('useEnlightenmentCafe must be used within EnlightenmentCafeProvider');
  }
  return ctx;
}

export default EnlightenmentCafeContext;
