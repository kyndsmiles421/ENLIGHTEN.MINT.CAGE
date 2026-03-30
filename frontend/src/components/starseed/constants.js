import { Brain, Swords, Heart, Eye, Shield, Users, Star } from 'lucide-react';

export const STAT_CONFIG = {
  wisdom:     { icon: Brain,   color: '#A855F7', label: 'WIS' },
  courage:    { icon: Swords,  color: '#EF4444', label: 'CRG' },
  compassion: { icon: Heart,   color: '#EC4899', label: 'CMP' },
  intuition:  { icon: Eye,     color: '#38BDF8', label: 'INT' },
  resilience: { icon: Shield,  color: '#F59E0B', label: 'RES' },
};

export const STAT_ICONS = { wisdom: Brain, courage: Swords, compassion: Heart, intuition: Eye, resilience: Shield };

export const ORIGIN_COLORS = {
  pleiadian: '#818CF8', sirian: '#38BDF8', arcturian: '#A855F7',
  lyran: '#F59E0B', andromedan: '#0EA5E9', orion: '#DC2626',
};

export const ATMOSPHERE_THEMES = {
  mystical:   { glow: '#818CF8', overlay: 'rgba(60,40,120,0.4)' },
  tense:      { glow: '#EF4444', overlay: 'rgba(100,20,20,0.4)' },
  peaceful:   { glow: '#2DD4BF', overlay: 'rgba(20,80,80,0.4)' },
  epic:       { glow: '#F59E0B', overlay: 'rgba(100,70,10,0.4)' },
  dark:       { glow: '#DC2626', overlay: 'rgba(40,10,10,0.5)' },
  ethereal:   { glow: '#C084FC', overlay: 'rgba(70,30,100,0.4)' },
  triumphant: { glow: '#FCD34D', overlay: 'rgba(90,80,20,0.35)' },
};

export const ENCOUNTER_TYPE_ICONS = { alliance: Users, challenge: Swords, revelation: Eye, trade: Star, trial: Shield };
