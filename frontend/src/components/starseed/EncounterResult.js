import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { STAT_ICONS } from './constants';

export function EncounterResult({ result, onContinue }) {
  if (!result) return null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-8 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(252,211,77,0.15)' }}
      data-testid="encounter-result">
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}>
        <Trophy size={32} className="mx-auto mb-3" style={{ color: '#FCD34D' }} />
      </motion.div>
      <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>Encounter Resolved</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{result.result}</p>
      <div className="flex items-center justify-center gap-4 mb-4">
        {Object.entries(result.stat_changes || {}).map(([stat, delta]) => {
          const Icon = STAT_ICONS[stat] || Star;
          return (
            <span key={stat} className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
              style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
              <Icon size={11} /> +{delta} {stat}
            </span>
          );
        })}
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
          +{result.xp_earned} XP
        </span>
      </div>
      {result.leveled_up && (
        <p className="text-sm font-bold mb-3" style={{ color: '#FCD34D' }}>Level Up! Now Level {result.new_level}</p>
      )}
      {result.new_achievements?.map(a => (
        <div key={a.id} className="flex items-center justify-center gap-2 mb-2">
          <Trophy size={12} style={{ color: '#C084FC' }} />
          <span className="text-xs" style={{ color: '#C084FC' }}>{a.title} — {a.desc}</span>
        </div>
      ))}
      <button onClick={onContinue} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
        style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.2)', color: '#FCD34D' }}
        data-testid="encounter-continue-btn">
        Return to Realm
      </button>
    </motion.div>
  );
}
