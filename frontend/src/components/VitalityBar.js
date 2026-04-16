/**
 * VitalityBar.js — V56.0 Real-time Progression Bar
 * 
 * Displays the user's RPG level + XP bar + dust balance
 * directly in the spatial room. Listens to vitality-pulse
 * events for live updates without polling.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PHI = 1.618033988749895;

export default function VitalityBar({ accent = '#FBBF24' }) {
  const { user, authHeaders } = useAuth();
  const [stats, setStats] = useState(null);
  const [flash, setFlash] = useState(false);
  const [lastEarned, setLastEarned] = useState(0);

  // Fetch initial stats
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/rpg/character`, { headers: authHeaders() });
      setStats({
        level: res.data.level || 1,
        xpCurrent: res.data.xp_current || 0,
        xpNext: res.data.xp_next || 100,
        xpTotal: res.data.xp_total || 0,
      });
    } catch {
      // Not critical
    }
  }, [user, authHeaders]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Listen to vitality-pulse for live XP updates
  useEffect(() => {
    const handler = (e) => {
      const d = e.detail;
      if (d.totalXp && d.level) {
        setStats(prev => {
          const xpNext = prev?.xpNext || 100;
          return {
            level: d.level,
            xpCurrent: d.totalXp % xpNext,
            xpNext,
            xpTotal: d.totalXp,
          };
        });
      }
      if (d.earned > 0) {
        setLastEarned(d.earned);
        setFlash(true);
        setTimeout(() => setFlash(false), 1200);
      }
      if (d.levelUp) {
        // Refetch to get accurate data after level-up
        setTimeout(fetchStats, 500);
      }
    };
    window.addEventListener('vitality-pulse', handler);
    return () => window.removeEventListener('vitality-pulse', handler);
  }, [fetchStats]);

  if (!stats || !user) return null;

  const progress = stats.xpNext > 0 ? Math.min(1, stats.xpCurrent / stats.xpNext) : 0;

  return (
    <div className="flex items-center gap-2" data-testid="vitality-bar">
      {/* Level badge */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
        style={{
          background: `${accent}15`,
          border: `1px solid ${accent}35`,
          color: accent,
          boxShadow: flash ? `0 0 12px ${accent}40` : 'none',
          transition: 'box-shadow 0.3s',
        }}
      >
        {stats.level}
      </div>

      {/* XP bar */}
      <div className="flex-1 max-w-[80px]">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[7px] font-mono" style={{ color: `${accent}60` }}>
            Lv.{stats.level}
          </span>
          <AnimatePresence>
            {flash && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[7px] font-bold"
                style={{ color: accent }}
              >
                +{lastEarned}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
