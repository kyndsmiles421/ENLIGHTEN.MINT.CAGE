/**
 * Crystal Encryption Controller
 * Global state context + hook for UI skins tied to the Phygital Marketplace.
 * Injects CSS variables across all 64 buttons and 7 pillars.
 * Filter property shifts the entire app's vibe, not just hex codes.
 */
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export const CRYSTAL_SKINS = {
  NONE: {
    id: 'none',
    name: 'Natural',
    primary: '#8B5CF6',
    secondary: '#4B0082',
    glow: 'rgba(139, 92, 246, 0.3)',
    speed: 1.0,
    filter: 'none',
    dust_cost: 0,
    tier: 0,
    description: 'Pure unfiltered — true colors',
  },
  AMETHYST: {
    id: 'amethyst_001',
    name: 'Amethyst Frequency',
    primary: '#9b59b6',
    secondary: '#4b0082',
    glow: 'rgba(155, 89, 182, 0.5)',
    speed: 0.8,
    filter: 'hue-rotate(270deg) brightness(1.1)',
    dust_cost: 500,
    tier: 1,
    description: 'Third eye activation — spiritual pulse',
  },
  OBSIDIAN: {
    id: 'obsidian_001',
    name: 'Obsidian Shield',
    primary: '#1a1a1a',
    secondary: '#000000',
    glow: 'rgba(255, 255, 255, 0.1)',
    speed: 0.4,
    filter: 'grayscale(1) contrast(1.2)',
    dust_cost: 750,
    tier: 2,
    description: 'Grounded stealth — maximum protection',
  },
  CITRINE: {
    id: 'citrine_001',
    name: 'Citrine Radiance',
    primary: '#f1c40f',
    secondary: '#d35400',
    glow: 'rgba(241, 196, 15, 0.4)',
    speed: 1.2,
    filter: 'saturate(200%) sepia(20%)',
    dust_cost: 600,
    tier: 1,
    description: 'Solar abundance — high energy trade mode',
  },
  ROSE_QUARTZ: {
    id: 'rose_quartz_001',
    name: 'Rose Quartz Heart',
    primary: '#e91e8c',
    secondary: '#c0392b',
    glow: 'rgba(233, 30, 140, 0.4)',
    speed: 0.6,
    filter: 'hue-rotate(330deg) saturate(120%)',
    dust_cost: 700,
    tier: 2,
    description: 'Heart-centered — softer transitions',
  },
  CLEAR_QUARTZ: {
    id: 'clear_quartz_001',
    name: 'Clear Quartz Master',
    primary: '#ecf0f1',
    secondary: '#bdc3c7',
    glow: 'rgba(236, 240, 241, 0.6)',
    speed: 1.0,
    filter: 'brightness(110%) contrast(105%)',
    dust_cost: 1000,
    tier: 3,
    description: 'Master amplifier — clarity across all modules',
  },
};

const STORAGE_KEY = 'crystal_encryption_skin';

function applyRootStyles(skin) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--crystal-primary', skin.primary);
  root.style.setProperty('--crystal-secondary', skin.secondary);
  root.style.setProperty('--crystal-glow', skin.glow);
  root.style.setProperty('--ui-speed', `${skin.speed}s`);
  root.style.setProperty('--ui-filter', skin.filter);
}

// Context for global encryption state
const EncryptionContext = createContext(null);

export function EncryptionProvider({ children }) {
  const [activeSkin, setActiveSkin] = useState(() => {
    if (typeof localStorage === 'undefined') return CRYSTAL_SKINS.AMETHYST;
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && CRYSTAL_SKINS[saved]) || CRYSTAL_SKINS.NONE;
  });

  useEffect(() => {
    applyRootStyles(activeSkin);
  }, [activeSkin]);

  const equipSkin = useCallback((skinKey) => {
    const skin = CRYSTAL_SKINS[skinKey];
    if (!skin) return false;
    setActiveSkin(skin);
    applyRootStyles(skin);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, skinKey);
    }
    return true;
  }, []);

  return (
    <EncryptionContext.Provider value={{ activeSkin, equipSkin, allSkins: CRYSTAL_SKINS }}>
      <div style={{ filter: 'var(--ui-filter)', transition: 'filter 0.5s ease' }}>
        {children}
      </div>
    </EncryptionContext.Provider>
  );
}

// Hook for components to access encryption state
export function useCrystalEncryption() {
  const ctx = useContext(EncryptionContext);
  // Fallback for when used outside provider (during init)
  if (!ctx) {
    return {
      activeSkin: CRYSTAL_SKINS.NONE,
      equipSkin: () => {},
      allSkins: CRYSTAL_SKINS,
    };
  }
  return ctx;
}
