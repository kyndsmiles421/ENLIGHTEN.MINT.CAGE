/**
 * QuestHUD.js — "Current Objective" Display
 * 
 * Minimalist HUD pinned at the top-left showing active quests.
 * Part of The Enlightenment Cafe's gamification layer.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, ChevronUp, Star, Check, Clock } from 'lucide-react';
import { useSages, SAGES } from '../context/SageContext';
import { useLocation } from 'react-router-dom';

export default function QuestHUD() {
  const location = useLocation();
  const { activeQuests, completeQuest, progress } = useSages();
  const [expanded, setExpanded] = useState(false);
  
  // Hide on certain pages
  const hiddenPaths = ['/auth', '/cinematic-intro', '/vr'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  // Don't show if no quests
  if (activeQuests.length === 0) {
    return null;
  }

  // Get primary quest (most recently added)
  const primaryQuest = activeQuests[0];
  const sage = SAGES[primaryQuest?.sage_id];

  const handleComplete = async (questId) => {
    // For demo purposes - in real app, would check objective completion
    await completeQuest(questId);
  };

  return (
    <motion.div
      className="fixed top-16 left-4 z-[9970] max-w-[280px]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      data-testid="quest-hud"
    >
      {/* Main Quest Card */}
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 18, 0.9)',
          backdropFilter: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
        layout
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: sage ? `${sage.color}20` : 'rgba(201,169,98,0.2)',
              border: `1px solid ${sage?.color || '#C9A962'}30`,
            }}
          >
            <Target size={14} style={{ color: sage?.color || '#C9A962' }} />
          </div>
          
          <div className="flex-1 text-left">
            <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
              <Clock size={10} />
              Current Quest
            </p>
            <p className="text-xs text-white/90 font-medium truncate">
              {primaryQuest?.title || 'No active quest'}
            </p>
          </div>
          
          {expanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Primary Quest Details */}
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: sage ? `${sage.color}10` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${sage?.color || '#ffffff'}15`,
                  }}
                >
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    {primaryQuest?.description}
                  </p>
                  
                  {/* Objective */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/40">
                      Objective: {primaryQuest?.objective?.target} {primaryQuest?.objective?.unit}
                    </span>
                    <span style={{ color: sage?.color || '#C9A962' }}>
                      +{primaryQuest?.rewards?.lumens || 0} Lumens
                    </span>
                  </div>

                  {/* Complete button (for testing) */}
                  <button
                    onClick={() => handleComplete(primaryQuest.id)}
                    className="mt-3 w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${sage?.color || '#C9A962'}30, ${sage?.color || '#C9A962'}10)`,
                      border: `1px solid ${sage?.color || '#C9A962'}30`,
                      color: sage?.color || '#C9A962',
                    }}
                    data-testid="complete-quest-btn"
                  >
                    <Check size={12} />
                    Mark Complete
                  </button>
                </div>

                {/* Other Quests */}
                {activeQuests.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">
                      Other Quests ({activeQuests.length - 1})
                    </p>
                    {activeQuests.slice(1, 4).map(quest => {
                      const questSage = SAGES[quest.sage_id];
                      return (
                        <div
                          key={quest.id}
                          className="flex items-center gap-2 p-2 rounded-lg"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ background: `${questSage?.color || '#888'}20` }}
                          >
                            <Target size={10} style={{ color: questSage?.color || '#888' }} />
                          </div>
                          <span className="text-[11px] text-white/60 flex-1 truncate">
                            {quest.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-white/40">Level {progress.level}</span>
                    <span className="text-white/40 flex items-center gap-1">
                      <Star size={10} className="text-amber-400" />
                      {progress.lumens} Lumens
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #C9A962, #F97316)',
                        width: `${(progress.lumens % 100)}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress.lumens % 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-white/30 mt-1 text-right">
                    {100 - (progress.lumens % 100)} to next level
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
