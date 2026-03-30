import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, Zap } from 'lucide-react';

export function WorldEventBanner({ event }) {
  if (!event) return null;
  const atm = { mystical: '#818CF8', epic: '#F59E0B', dark: '#DC2626', peaceful: '#2DD4BF', ethereal: '#C084FC' };
  const color = atm[event.atmosphere] || '#818CF8';

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5 mb-6 border"
      style={{ background: `linear-gradient(135deg, ${color}08, rgba(0,0,0,0.3))`, borderColor: `${color}20` }}
      data-testid="world-event-banner">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ background: `radial-gradient(ellipse at 20% 50%, ${color}, transparent 70%)` }} />
      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Globe size={22} style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}>
              World Event
            </span>
            <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock size={9} /> {event.time_remaining} remaining
            </span>
          </div>
          <h3 className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>{event.title}</h3>
          <p className="text-xs leading-relaxed mb-1.5" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
            <Zap size={8} className="inline mr-1" />{event.bonus}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
