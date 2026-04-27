/**
 * constants.js — Shared constants for console panels
 * Tab definitions, tier gating, and icon imports centralized here.
 * 
 * TIER HIERARCHY: BASE(0) → SEED(1) → ARTISAN(2) → SOVEREIGN(3) → CREATOR(4)
 * Each tool has a minTier — users below that tier see it locked.
 */
import {
  Globe, Sliders, Video, Music, Type, Layers, Wand2,
  Sparkles, Download, User, Compass, Radio,
} from 'lucide-react';

// Tier numeric values (match backend TIERS dict)
export const TIER_LEVELS = {
  BASE: 0,
  SEED: 1,
  ARTISAN: 2,
  SOVEREIGN: 3,
  CREATOR: 4,
};

export const TIER_NAMES = ['BASE', 'SEED', 'ARTISAN', 'SOVEREIGN', 'CREATOR'];

export const TIER_COLORS = {
  BASE: '#6B7280',
  SEED: '#A78BFA',
  ARTISAN: '#F59E0B',
  SOVEREIGN: '#22C55E',
  CREATOR: '#EF4444',
};

export const TOOL_TABS = [
  { key: 'torus', label: 'Orbit', icon: Globe, color: '#10B981', minTier: 0 },
  { key: 'mix', label: 'Mix', icon: Sliders, color: '#C084FC', minTier: 0 },
  { key: 'culture', label: 'Culture', icon: Compass, color: '#D946EF', minTier: 1 },
  { key: 'audio', label: 'Audio', icon: Music, color: '#38BDF8', minTier: 1 },
  { key: 'text', label: 'Text', icon: Type, color: '#F8FAFC', minTier: 2 },
  { key: 'overlay', label: 'Layer', icon: Layers, color: '#2DD4BF', minTier: 2 },
  { key: 'record', label: 'Rec', icon: Video, color: '#EF4444', minTier: 2 },
  { key: 'effects', label: 'FX', icon: Wand2, color: '#E879F9', minTier: 3 },
  { key: 'ai', label: 'AI', icon: Sparkles, color: '#FB923C', minTier: 3 },
  { key: 'tuning', label: 'Tune', icon: Radio, color: '#FBBF24', minTier: 0 },
  { key: 'export', label: 'Out', icon: Download, color: '#22C55E', minTier: 3 },
  { key: 'account', label: 'Me', icon: User, color: '#F8FAFC', minTier: 0 },
];

// What tier unlocks what — for upgrade prompts
export const TIER_UNLOCK_MAP = {
  0: ['Orbit', 'Mix', 'Me'],
  1: ['Culture', 'Audio'],
  2: ['Text', 'Layer', 'Rec'],
  3: ['FX', 'AI', 'Out'],
  4: ['Full Creator Access'],
};
