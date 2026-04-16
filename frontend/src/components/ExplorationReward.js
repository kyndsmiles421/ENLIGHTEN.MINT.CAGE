/**
 * ExplorationReward.js — In-place gamification feedback
 * Shows XP earned, streak progress, and cosmic dust when user explores content.
 * Appears inline (NOT as overlay/popup) — respects Zero-Stack.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Flame } from 'lucide-react';

export function useExplorationReward() {
  const [reward, setReward] = useState(null);

  const triggerReward = (action = 'explored', xp = 10) => {
    const messages = {
      explored: [`+${xp} XP — Knowledge unlocked`, `+${xp} XP — Wisdom gained`, `+${xp} XP — Understanding deepened`],
      listened: [`+${xp} XP — Narration absorbed`, `+${xp} XP — Sonic wisdom received`],
      practiced: [`+${xp} XP — Practice logged`, `+${xp} XP — Body-mind connected`],
      created: [`+${xp} XP — Creation manifested`, `+${xp} XP — Expression unlocked`],
      shared: [`+${xp} XP — Collective uplifted`, `+${xp} XP — Community enriched`],
    };
    const pool = messages[action] || messages.explored;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setReward({ msg, xp, id: Date.now() });

    // Auto-dismiss
    setTimeout(() => setReward(null), 3000);

    // Accrue to mixer if available
    if (typeof window.__workAccrue === 'function') {
      window.__workAccrue('exploration', xp);
    }
  };

  return { reward, triggerReward };
}

export function RewardToast({ reward }) {
  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          key={reward.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 py-2 px-3 rounded-full mt-2"
          style={{
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
          data-testid="exploration-reward"
        >
          <Sparkles size={12} style={{ color: '#22C55E' }} />
          <span className="text-xs font-medium" style={{ color: '#22C55E' }}>{reward.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StreakBadge({ streak = 0 }) {
  if (streak < 2) return null;
  return (
    <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full"
      style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)' }}
      data-testid="streak-badge">
      <Flame size={11} style={{ color: '#FB923C' }} />
      <span className="text-[10px] font-bold" style={{ color: '#FB923C' }}>{streak} day streak</span>
    </div>
  );
}

export function XPProgress({ current = 0, nextLevel = 100, level = 1, color = '#22C55E' }) {
  const pct = Math.min(100, (current / nextLevel) * 100);
  return (
    <div className="flex items-center gap-3" data-testid="xp-progress">
      <div className="flex items-center gap-1">
        <Star size={11} style={{ color }} />
        <span className="text-[10px] font-bold" style={{ color }}>Lv.{level}</span>
      </div>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{current}/{nextLevel}</span>
    </div>
  );
}
