import {
  Music, Map, Triangle, Heart, Wind, Sun, GraduationCap,
  Eye, Star, Telescope, HeartHandshake, Gamepad2, BookOpen,
  ScrollText, Calculator
} from 'lucide-react';

export const ALL_SATELLITES = [
  { id: 'mood', label: 'Mood Engine', icon: Heart, path: '/mood', color: '#EC4899', desc: 'Track your emotional frequencies' },
  { id: 'mixer', label: 'Soundscape', icon: Music, path: '/cosmic-mixer', color: '#A78BFA', desc: 'Synthesize healing frequencies' },
  { id: 'map', label: 'Cosmic Map', icon: Map, path: '/cosmic-map', color: '#22C55E', desc: 'Explore the resonance grid' },
  { id: 'breathing', label: 'Breathwork', icon: Wind, path: '/breathing', color: '#60A5FA', desc: 'Guided breathing patterns' },
  { id: 'meditation', label: 'Meditation', icon: Sun, path: '/meditation', color: '#FBBF24', desc: 'Deep stillness practices' },
  { id: 'theory', label: 'Conservatory', icon: GraduationCap, path: '/theory', color: '#2DD4BF', desc: 'Music theory & phonics' },
  { id: 'workshop', label: 'Workshop', icon: Triangle, path: '/workshop', color: '#F59E0B', desc: 'Sacred architecture & physics' },
  { id: 'star-chart', label: 'Star Chart', icon: Star, path: '/star-chart', color: '#818CF8', desc: 'Celestial navigation' },
  { id: 'observatory', label: 'Observatory', icon: Telescope, path: '/observatory', color: '#6366F1', desc: 'Live sky & data sonification' },
  { id: 'trade', label: 'Trade Circle', icon: HeartHandshake, path: '/trade-circle', color: '#FB923C', desc: 'Exchange resonant assets' },
  { id: 'oracle', label: 'Oracle', icon: Eye, path: '/oracle', color: '#C084FC', desc: 'Divination & insight' },
  { id: 'games', label: 'Games', icon: Gamepad2, path: '/games', color: '#34D399', desc: 'Starseed adventures' },
  { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal', color: '#FDA4AF', desc: 'Wisdom journal' },
  { id: 'archives', label: 'Archives', icon: ScrollText, path: '/archives', color: '#F59E0B', desc: 'Deep-dive multi-civilization texts' },
  { id: 'suanpan', label: 'Suanpan', icon: Calculator, path: '/suanpan', color: '#EF4444', desc: 'Ancient abacus frequency mixer' },
];

export const ZONE_AUDIO = {
  'star-chart': { hz: 852, type: 'sine', gain: 0.06 },
  'observatory': { hz: 963, type: 'sine', gain: 0.05 },
  'oracle': { hz: 741, type: 'sine', gain: 0.05 },
  'workshop': { hz: 256, type: 'triangle', gain: 0.06 },
  'trade': { hz: 324, type: 'triangle', gain: 0.05 },
  'games': { hz: 396, type: 'triangle', gain: 0.04 },
  'mood': { hz: 528, type: 'sine', gain: 0.05 },
  'breathing': { hz: 432, type: 'sine', gain: 0.06 },
  'meditation': { hz: 639, type: 'sine', gain: 0.05 },
  'mixer': { hz: 369, type: 'sine', gain: 0.05 },
  'theory': { hz: 417, type: 'sine', gain: 0.05 },
  'map': { hz: 285, type: 'triangle', gain: 0.04 },
  'journal': { hz: 396, type: 'sine', gain: 0.04 },
  'archives': { hz: 174, type: 'sine', gain: 0.05 },
  'suanpan': { hz: 256, type: 'triangle', gain: 0.05 },
};

export const WEATHER_AUDIO_MAP = {
  clear:        { hz: 528, type: 'sine',     gain: 0.025, lfoRate: 0 },
  cloudy:       { hz: 396, type: 'sine',     gain: 0.020, lfoRate: 0.3 },
  fog:          { hz: 369, type: 'sine',     gain: 0.015, lfoRate: 0.15 },
  rain:         { hz: 285, type: 'triangle', gain: 0.025, lfoRate: 2.0 },
  snow:         { hz: 432, type: 'sine',     gain: 0.012, lfoRate: 0.5 },
  thunderstorm: { hz: 174, type: 'sawtooth', gain: 0.030, lfoRate: 4.0 },
  wind:         { hz: 256, type: 'triangle', gain: 0.018, lfoRate: 1.2 },
  default:      { hz: 396, type: 'sine',     gain: 0.015, lfoRate: 0.2 },
};

export const WEATHER_EFFECTS = {
  clear:        { pulseSpeed: 5,   tint: '#FBBF24' },
  cloudy:       { pulseSpeed: 7,   tint: '#94A3B8' },
  fog:          { pulseSpeed: 10,  tint: '#CBD5E1' },
  rain:         { pulseSpeed: 3,   tint: '#60A5FA' },
  snow:         { pulseSpeed: 8,   tint: '#E2E8F0' },
  thunderstorm: { pulseSpeed: 1.5, tint: '#818CF8' },
  wind:         { pulseSpeed: 4,   tint: '#2DD4BF' },
};
