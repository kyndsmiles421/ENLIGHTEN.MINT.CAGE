/**
 * Crystal Encryption Controller
 * Manages global UI skins tied to the Phygital Marketplace.
 * Each skin modifies CSS variables across all 64 buttons and 7 pillars.
 */
import { useState, useEffect, useCallback } from 'react';

export const CRYSTAL_SKINS = {
  AMETHYST: {
    id: 'amethyst_enc',
    name: 'Amethyst Encryption',
    primary: '#9b59b6',
    secondary: '#8e44ad',
    glow: 'rgba(155, 89, 182, 0.6)',
    animationSpeed: '2s',
    fontFilter: 'sepia(10%) contrast(110%)',
    dust_cost: 500,
    tier: 1,
    description: 'Third eye activation — intuitive UI shifts',
  },
  OBSIDIAN: {
    id: 'obsidian_enc',
    name: 'Obsidian Shield',
    primary: '#2c3e50',
    secondary: '#000000',
    glow: 'rgba(44, 62, 80, 0.8)',
    animationSpeed: '1.5s',
    fontFilter: 'grayscale(100%) brightness(80%)',
    dust_cost: 800,
    tier: 2,
    description: 'Maximum stealth — ultra-dark protective mode',
  },
  CITRINE: {
    id: 'citrine_enc',
    name: 'Citrine Radiance',
    primary: '#f1c40f',
    secondary: '#f39c12',
    glow: 'rgba(241, 196, 15, 0.5)',
    animationSpeed: '3s',
    fontFilter: 'saturate(150%)',
    dust_cost: 600,
    tier: 1,
    description: 'Abundance frequency — high-contrast trade mode',
  },
  ROSE_QUARTZ: {
    id: 'rose_quartz_enc',
    name: 'Rose Quartz Heart',
    primary: '#e91e8c',
    secondary: '#c0392b',
    glow: 'rgba(233, 30, 140, 0.4)',
    animationSpeed: '2.5s',
    fontFilter: 'hue-rotate(330deg) saturate(120%)',
    dust_cost: 700,
    tier: 2,
    description: 'Heart-centered — softer transitions and prompts',
  },
  CLEAR_QUARTZ: {
    id: 'clear_quartz_enc',
    name: 'Clear Quartz Master',
    primary: '#ecf0f1',
    secondary: '#bdc3c7',
    glow: 'rgba(236, 240, 241, 0.6)',
    animationSpeed: '1.8s',
    fontFilter: 'brightness(110%) contrast(105%)',
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
  root.style.setProperty('--ui-speed', skin.animationSpeed);
  root.style.setProperty('--ui-filter', skin.fontFilter);
}

export function useCrystalEncryption() {
  const [activeSkin, setActiveSkin] = useState(() => {
    if (typeof localStorage === 'undefined') return CRYSTAL_SKINS.AMETHYST;
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && CRYSTAL_SKINS[saved]) || CRYSTAL_SKINS.AMETHYST;
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

  return { activeSkin, equipSkin, allSkins: CRYSTAL_SKINS };
}
