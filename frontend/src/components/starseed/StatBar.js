import React from 'react';
import { motion } from 'framer-motion';
import { STAT_CONFIG } from './constants';

export function StatBar({ statKey, value, prevValue, maxVal = 15, compact }) {
  const cfg = STAT_CONFIG[statKey];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const pct = Math.min(100, (value / maxVal) * 100);
  const delta = (prevValue !== undefined && prevValue !== null) ? value - prevValue : 0;

  return (
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'mb-1.5'}`} data-testid={`stat-${statKey}`}>
      <Icon size={compact ? 10 : 13} style={{ color: cfg.color, flexShrink: 0 }} />
      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: cfg.color, minWidth: 22 }}>{cfg.label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`, boxShadow: `0 0 10px ${cfg.color}40` }} />
      </div>
      <span className="text-[10px] tabular-nums w-4 text-right" style={{ color: cfg.color }}>{value}</span>
      {delta !== 0 && (
        <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-[9px] font-bold"
          style={{ color: delta > 0 ? '#4ADE80' : '#EF4444' }}>
          {delta > 0 ? `+${delta}` : delta}
        </motion.span>
      )}
    </div>
  );
}
