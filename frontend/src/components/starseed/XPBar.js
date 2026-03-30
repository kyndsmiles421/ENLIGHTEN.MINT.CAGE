import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function XPBar({ xp, xpToNext, level }) {
  const pct = xpToNext > 0 ? (xp / xpToNext) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5" data-testid="xp-bar">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)' }}>
        <Star size={10} style={{ color: '#FCD34D' }} />
        <span className="text-[10px] font-bold tabular-nums" style={{ color: '#FCD34D' }}>LVL {level}</span>
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          style={{ background: 'linear-gradient(90deg, #FCD34D, #F59E0B)', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }} />
      </div>
      <span className="text-[9px] tabular-nums font-medium" style={{ color: 'rgba(252,211,77,0.7)' }}>{xp}/{xpToNext}</span>
    </div>
  );
}
