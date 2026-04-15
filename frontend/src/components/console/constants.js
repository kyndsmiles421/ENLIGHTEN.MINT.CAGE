/**
 * constants.js — Shared constants for console panels
 * Tab definitions and icon imports centralized here.
 */
import {
  Globe, Sliders, Video, Music, Type, Layers, Wand2,
  Sparkles, Download, User,
} from 'lucide-react';

export const TOOL_TABS = [
  { key: 'torus', label: 'Orbit', icon: Globe, color: '#10B981' },
  { key: 'mix', label: 'Mix', icon: Sliders, color: '#C084FC' },
  { key: 'record', label: 'Rec', icon: Video, color: '#EF4444' },
  { key: 'audio', label: 'Audio', icon: Music, color: '#38BDF8' },
  { key: 'text', label: 'Text', icon: Type, color: '#F8FAFC' },
  { key: 'overlay', label: 'Layer', icon: Layers, color: '#2DD4BF' },
  { key: 'effects', label: 'FX', icon: Wand2, color: '#E879F9' },
  { key: 'ai', label: 'AI', icon: Sparkles, color: '#FB923C' },
  { key: 'export', label: 'Out', icon: Download, color: '#22C55E' },
  { key: 'account', label: 'Me', icon: User, color: '#F8FAFC' },
];
