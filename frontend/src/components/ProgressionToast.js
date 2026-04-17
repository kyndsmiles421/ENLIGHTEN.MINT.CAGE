/**
 * ProgressionToast.js — V56.0 Vitality Pulse Overlay
 * 
 * Renders floating 3D progression feedback in the spatial room.
 * Listens to the global 'vitality-pulse' event fired by useWorkAccrual.
 * Shows Stardust gains, level-ups, milestone unlocks, and quest triggers.
 * 
 * Events:
 *   vitality-pulse: { earned, dustBalance, source, levelUp, levelsGained, milestone }
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Award, ChevronUp, Shield } from 'lucide-react';

const PHI = 1.618033988749895;
const MAX_VISIBLE = 4;
const TOAST_DURATION = 3800;

// Map activity sources to readable names + colors
const SOURCE_META = {
  meditation_session:  { label: 'Meditation',      color: '#D8B4FE', icon: Star },
  breathing_exercise:  { label: 'Breathwork',       color: '#2DD4BF', icon: Zap },
  sacred_breathing:    { label: 'Sacred Breath',     color: '#2DD4BF', icon: Zap },
  oracle_reading:      { label: 'Oracle Divination', color: '#E879F9', icon: Sparkles },
  dream_journal:       { label: 'Dream Journal',     color: '#C084FC', icon: Star },
  mood_log:            { label: 'Mood Check-in',     color: '#FB923C', icon: Star },
  daily_ritual:        { label: 'Daily Ritual',      color: '#FCD34D', icon: Award },
  herbology:           { label: 'Herbology',         color: '#84CC16', icon: Star },
  affirmations:        { label: 'Affirmations',      color: '#22C55E', icon: Star },
  frequencies:         { label: 'Frequencies',       color: '#8B5CF6', icon: Zap },
  mantras:             { label: 'Mantras',           color: '#FCD34D', icon: Star },
  wisdom_journal:      { label: 'Wisdom Journal',    color: '#D4AF37', icon: Star },
  yoga_practice:       { label: 'Yoga',              color: '#FCD34D', icon: Star },
  module_interaction:  { label: 'Exploration',       color: '#A78BFA', icon: Sparkles },
  heartbeat_sync:      { label: 'Vitality Sync',     color: '#FBBF24', icon: Zap },
  exit_sync:           { label: 'Session Close',     color: '#9CA3AF', icon: Star },
  masonry_build:       { label: 'Masonry Craft',     color: '#FB923C', icon: Shield },
  Masonry_Skill:       { label: 'Masonry Strike',    color: '#94A3B8', icon: Shield },
  masonry_dive:        { label: 'Material Dive',     color: '#4169E1', icon: Sparkles },
  masonry_inspect:     { label: 'Stone Study',       color: '#D4C5A9', icon: Star },
  Carpentry_Skill:     { label: 'Carpentry Work',    color: '#92400E', icon: Shield },
  carpentry_dive:      { label: 'Grain Dive',        color: '#22C55E', icon: Sparkles },
  carpentry_inspect:   { label: 'Wood Study',        color: '#D4A76A', icon: Star },
  Electrical_Skill:    { label: 'Electrical Work',   color: '#B87333', icon: Shield },
  Plumbing_Skill:      { label: 'Plumbing Work',     color: '#3B82F6', icon: Shield },
  Landscaping_Skill:   { label: 'Landscaping Work',  color: '#22C55E', icon: Shield },
  Nursing_Skill:       { label: 'Nursing Practice',  color: '#EF4444', icon: Shield },
  Bible_Study_Skill:   { label: 'Scripture Study',   color: '#D4AF37', icon: Shield },
  Childcare_Skill:     { label: 'Child Care',        color: '#F472B6', icon: Shield },
  Eldercare_Skill:     { label: 'Elderly Care',      color: '#A78BFA', icon: Shield },
  Welding_Skill:       { label: 'Welding Work',      color: '#6B7280', icon: Shield },
  Automotive_Skill:    { label: 'Automotive Work',   color: '#6B7280', icon: Shield },
  Nutrition_Skill:     { label: 'Nutrition Study',   color: '#22C55E', icon: Shield },
  Meditation_Skill:    { label: 'Meditation',        color: '#6366F1', icon: Shield },
  exploration:         { label: 'Exploration',       color: '#38BDF8', icon: Sparkles },
  vr_sanctuary:        { label: 'VR Sanctuary',      color: '#D8B4FE', icon: Star },
  animal_totems:       { label: 'Animal Totems',     color: '#22C55E', icon: Star },
  sage_coach:          { label: 'Sage Counsel',      color: '#FBBF24', icon: Award },
  cosmic_profile:      { label: 'Cosmic Profile',    color: '#6366F1', icon: Star },
  meal_planning:       { label: 'Meal Alchemy',      color: '#22C55E', icon: Star },
};

function getSourceMeta(source) {
  return SOURCE_META[source] || { label: source?.replace(/_/g, ' ') || 'Activity', color: '#A78BFA', icon: Sparkles };
}

let toastIdCounter = 0;

export default function ProgressionToast() {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef({});

  const addToast = useCallback((detail) => {
    const id = ++toastIdCounter;
    const toast = { id, ...detail, createdAt: Date.now() };

    setToasts(prev => {
      const next = [toast, ...prev];
      return next.slice(0, MAX_VISIBLE + 2);
    });

    timeoutRefs.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timeoutRefs.current[id];
    }, TOAST_DURATION);
  }, []);

  useEffect(() => {
    const handler = (e) => addToast(e.detail);
    window.addEventListener('vitality-pulse', handler);
    return () => {
      window.removeEventListener('vitality-pulse', handler);
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, [addToast]);

  return (
    <div
      className="pointer-events-none"
      style={{ display: 'none' }}
      data-testid="progression-toast-container"
    >
      <AnimatePresence>
        {toasts.slice(0, MAX_VISIBLE).map((toast, i) => {
          const meta = getSourceMeta(toast.source);
          const Icon = meta.icon;
          const isLevelUp = toast.levelUp;
          const isMilestone = toast.milestone;

          return (
            <motion.div
              key={toast.id}
              initial={{
                opacity: 0,
                x: 60,
                scale: 0.7,
                rotateY: 25,
                z: -40,
              }}
              animate={{
                opacity: 1 - i * 0.15,
                x: 0,
                scale: 1 - i * 0.04,
                rotateY: 0,
                z: -i * 20,
              }}
              exit={{
                opacity: 0,
                x: 80,
                scale: 0.5,
                rotateY: -20,
                z: -60,
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
              style={{
                background: isLevelUp
                  ? `linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,70,239,0.12))`
                  : isMilestone
                  ? `linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.1))`
                  : `rgba(0,0,0,0.65)`,
                border: `1px solid ${isLevelUp ? '#FBBF2440' : meta.color + '30'}`,
                backdropFilter: 'blur(16px)',
                boxShadow: isLevelUp
                  ? `0 0 24px rgba(251,191,36,0.2), 0 0 48px rgba(217,70,239,0.1)`
                  : `0 0 16px ${meta.color}15`,
                transformStyle: 'preserve-3d',
              }}
              data-testid={`progression-toast-${toast.id}`}
            >
              {/* Icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${meta.color}18`,
                  border: `1px solid ${meta.color}30`,
                }}
              >
                {isLevelUp ? (
                  <ChevronUp size={14} style={{ color: '#FBBF24' }} />
                ) : (
                  <Icon size={13} style={{ color: meta.color }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isLevelUp ? (
                  <>
                    <p className="text-xs font-bold" style={{ color: '#FBBF24' }}>
                      Level Up!
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      +{toast.levelsGained || 1} level{(toast.levelsGained || 1) > 1 ? 's' : ''} | +{toast.statPoints || 3} stat points
                    </p>
                  </>
                ) : isMilestone ? (
                  <>
                    <p className="text-xs font-bold" style={{ color: '#22C55E' }}>
                      {toast.milestone}
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Milestone Unlocked
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold" style={{ color: meta.color }}>
                      +{toast.earned || 0} Stardust
                    </p>
                    <p className="text-[8px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {meta.label} Sync
                    </p>
                  </>
                )}
              </div>

              {/* Phi glow ring */}
              {isLevelUp && (
                <motion.div
                  animate={{ scale: [1, PHI, 1], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ border: '1px solid rgba(251,191,36,0.2)' }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Fire a vitality pulse from anywhere in the app.
 * Used by useWorkAccrual after successful sync.
 */
export function fireVitalityPulse(detail) {
  window.dispatchEvent(new CustomEvent('vitality-pulse', { detail }));
}
