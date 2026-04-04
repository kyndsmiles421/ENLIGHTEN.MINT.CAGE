/**
 * SeedHuntWidget.js — The Daily FOMO Loop
 * 
 * INT-03: SEED HUNT DASHBOARD
 * 
 * Displays the current daily hunt with:
 * - Hunt type and difficulty badge
 * - Target hints (partially revealed)
 * - Countdown timer
 * - Leaderboard preview (top 3)
 * - Quick submit button
 * 
 * Creates urgency and engagement through:
 * - Visual timer animation
 * - "Near target" detection glow
 * - XP reward preview
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Clock,
  Trophy,
  Zap,
  ChevronRight,
  Flame,
  Award,
  AlertCircle,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ═══════════════════════════════════════════════════════════════════════════
// DIFFICULTY STYLES
// ═══════════════════════════════════════════════════════════════════════════

const DIFFICULTY_STYLES = {
  LEGENDARY: {
    bg: 'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.5)',
    text: '#F59E0B',
    glow: '0 0 20px rgba(245,158,11,0.3)',
  },
  EPIC: {
    bg: 'rgba(168,85,247,0.2)',
    border: 'rgba(168,85,247,0.5)',
    text: '#A855F7',
    glow: '0 0 20px rgba(168,85,247,0.3)',
  },
  RARE: {
    bg: 'rgba(59,130,246,0.2)',
    border: 'rgba(59,130,246,0.5)',
    text: '#3B82F6',
    glow: '0 0 20px rgba(59,130,246,0.3)',
  },
  UNCOMMON: {
    bg: 'rgba(34,197,94,0.2)',
    border: 'rgba(34,197,94,0.5)',
    text: '#22C55E',
    glow: '0 0 20px rgba(34,197,94,0.3)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TIMER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const CountdownTimer = React.memo(({ secondsRemaining }) => {
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  
  const isUrgent = secondsRemaining < 3600;  // Less than 1 hour
  
  return (
    <motion.div
      className="flex items-center gap-2"
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
    >
      <Clock size={14} className={isUrgent ? 'text-red-400' : 'text-gray-400'} />
      <span 
        className={`font-mono text-sm ${isUrgent ? 'text-red-400' : 'text-gray-300'}`}
      >
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isUrgent && (
        <Flame size={14} className="text-red-400 animate-pulse" />
      )}
    </motion.div>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD PREVIEW
// ═══════════════════════════════════════════════════════════════════════════

const LeaderboardPreview = React.memo(({ winners }) => {
  if (!winners || winners.length === 0) {
    return (
      <div className="text-[10px] text-gray-500 text-center py-2">
        No winners yet — be the first!
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {winners.slice(0, 3).map((winner, i) => (
        <div 
          key={i}
          className="flex items-center justify-between text-[10px] px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            {i === 0 ? (
              <Trophy size={12} className="text-amber-500" />
            ) : i === 1 ? (
              <Award size={12} className="text-gray-400" />
            ) : (
              <Award size={12} className="text-amber-700" />
            )}
            <span className="text-gray-300">
              {winner.hunter_id?.slice(0, 12) || 'Anonymous'}
            </span>
          </div>
          <span className="text-amber-500">+{winner.xp_earned} XP</span>
        </div>
      ))}
    </div>
  );
});

LeaderboardPreview.displayName = 'LeaderboardPreview';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN WIDGET
// ═══════════════════════════════════════════════════════════════════════════

export default function SeedHuntWidget({ 
  currentAddress,
  onNavigateToHunt,
  compact = false,
}) {
  const [hunt, setHunt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isNearTarget, setIsNearTarget] = useState(false);
  
  // Fetch current hunt
  const fetchHunt = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/seed-hunt/current`);
      if (!response.ok) throw new Error('Failed to fetch hunt');
      
      const data = await response.json();
      setHunt(data);
      setTimeRemaining(data.time_remaining_seconds);
      setError(null);
    } catch (err) {
      console.error('Hunt fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchHunt();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHunt, 300000);
    return () => clearInterval(interval);
  }, [fetchHunt]);
  
  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  // Check if current address is near target
  useEffect(() => {
    if (!hunt || !currentAddress) {
      setIsNearTarget(false);
      return;
    }
    
    const target = hunt.target;
    
    // Simple proximity check based on hunt type
    if (target.hunt_type === 'PATTERN' && target.target_pattern) {
      const cleanAddress = currentAddress.replace(/\|/g, '');
      setIsNearTarget(cleanAddress.includes(target.target_pattern.slice(0, 3)));
    } else if (target.hunt_type === 'DEPTH' && target.target_depth) {
      // Check if user is close to target depth
      const addressDepth = (currentAddress.match(/\|/g) || []).length / 2;
      setIsNearTarget(addressDepth >= target.target_depth - 1);
    } else {
      setIsNearTarget(false);
    }
  }, [hunt, currentAddress]);
  
  if (loading) {
    return (
      <div 
        className="rounded-xl p-4 animate-pulse"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      >
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }
  
  if (error || !hunt) {
    return (
      <div 
        className="rounded-xl p-4 text-center"
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,100,100,0.3)' }}
      >
        <AlertCircle size={20} className="mx-auto text-red-400 mb-2" />
        <p className="text-[10px] text-red-400">Hunt unavailable</p>
      </div>
    );
  }
  
  const style = DIFFICULTY_STYLES[hunt.difficulty] || DIFFICULTY_STYLES.UNCOMMON;
  
  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: `1px solid ${style.border}`,
        boxShadow: isNearTarget ? style.glow : 'none',
      }}
      animate={isNearTarget ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1, repeat: isNearTarget ? Infinity : 0 }}
      data-testid="seed-hunt-widget"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ background: style.bg }}
      >
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: style.text }} />
          <span className="text-sm font-medium" style={{ color: style.text }}>
            {hunt.hunt_name}
          </span>
        </div>
        
        <div 
          className="text-[10px] px-2 py-0.5 rounded-full uppercase"
          style={{ 
            background: 'rgba(0,0,0,0.3)',
            color: style.text,
          }}
        >
          {hunt.difficulty}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-[11px] text-gray-400">
          {hunt.description}
        </p>
        
        {/* Hints */}
        {hunt.hints && hunt.hints.length > 0 && !compact && (
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Hints:</span>
            {hunt.hints.slice(0, 2).map((hint, i) => (
              <div 
                key={i}
                className="text-[10px] text-gray-300 pl-2 border-l border-gray-700"
              >
                {hint}
              </div>
            ))}
          </div>
        )}
        
        {/* Near target indicator */}
        <AnimatePresence>
          {isNearTarget && (
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: style.bg }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Zap size={14} style={{ color: style.text }} />
              <span className="text-[11px]" style={{ color: style.text }}>
                You're getting close to the target!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stats row */}
        <div className="flex items-center justify-between">
          <CountdownTimer secondsRemaining={timeRemaining} />
          
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span>{hunt.total_entries}</span>
            <span>entries</span>
          </div>
        </div>
        
        {/* Rewards */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Rewards:</span>
          <div className="flex items-center gap-3">
            <span className="text-amber-500">
              🥇 {hunt.rewards?.winner_bonus + hunt.rewards?.base_xp} XP
            </span>
            <span className="text-gray-400">
              Base: {hunt.rewards?.base_xp} XP
            </span>
          </div>
        </div>
        
        {/* Leaderboard preview */}
        {!compact && (
          <div className="pt-2 border-t border-gray-800">
            <div className="text-[10px] text-gray-500 mb-2">Current Leaders:</div>
            <LeaderboardPreview winners={hunt.winners} />
          </div>
        )}
        
        {/* Action button */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] uppercase tracking-wider transition-all hover:brightness-110"
          style={{
            background: style.bg,
            color: style.text,
            border: `1px solid ${style.border}`,
          }}
          onClick={onNavigateToHunt}
          data-testid="hunt-join-button"
        >
          Join Hunt
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
