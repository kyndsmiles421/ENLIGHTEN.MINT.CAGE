/**
 * ActiveMissionHUD.js — V68.4 Phase D
 *
 * Inline, minimalist HUD that sits BELOW the Spark Wallet in the Sovereign Hub.
 * Shows the user's currently active quest + next step + progress bar.
 * Expands INLINE (no modal, no fixed overlay, no z-index trap) to reveal
 * all steps and the hint when tapped.
 *
 * Respects the "No Boxes on Boxes" rule: renders as part of the page flow.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, ChevronDown, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { useSovereignUniverse } from '../context/SovereignUniverseContext';

export default function ActiveMissionHUD() {
  const { activeQuest, toastQueue, dismissToast } = useSovereignUniverse();
  const [expanded, setExpanded] = useState(false);

  // Toast banners (inline, above HUD) for quest auto-detect fires
  const toasts = toastQueue.slice(0, 3);

  if (!activeQuest && toasts.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 pb-3" data-testid="active-mission-hud">
      {/* Auto-detect toast ribbons (inline — not fixed) */}
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-md flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
            style={{
              background: `${t.color || '#8B5CF6'}14`,
              border: `1px solid ${t.color || '#8B5CF6'}40`,
            }}
            onClick={() => dismissToast(t.id)}
            data-testid={`mission-toast-${t.step_id}`}
          >
            <Sparkles size={12} style={{ color: t.color || '#8B5CF6' }} />
            <div className="flex-1 text-left">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: `${t.color || '#8B5CF6'}b0` }}>
                {t.quest_complete ? 'Quest Complete' : 'Step Advanced'}
              </div>
              <div className="text-xs text-white/90 truncate">
                {t.quest_complete ? t.quest_name : t.step_action}
              </div>
            </div>
            {t.reward_sparks > 0 && (
              <span className="text-[10px] font-mono font-bold" style={{ color: '#FBBF24' }}>
                +{t.reward_sparks}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Active Mission pill */}
      {activeQuest && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="w-full max-w-md flex items-center gap-2 px-3 py-2 rounded-lg transition-all active:scale-[0.98]"
            style={{
              background: `${activeQuest.color || '#8B5CF6'}08`,
              border: `1px solid ${activeQuest.color || '#8B5CF6'}25`,
            }}
            data-testid="active-mission-toggle"
          >
            <Target size={12} style={{ color: activeQuest.color || '#8B5CF6' }} />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[9px] uppercase tracking-[0.18em]" style={{ color: `${activeQuest.color || '#8B5CF6'}b0` }}>
                Active Mission
              </div>
              <div className="text-[11px] text-white/80 truncate">
                {(() => {
                  const nextStep = activeQuest.steps.find(s => !s.done);
                  return nextStep ? nextStep.action : activeQuest.name;
                })()}
              </div>
            </div>
            {/* progress */}
            <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.round((activeQuest.progress || 0) * 100)}%`,
                background: activeQuest.color || '#8B5CF6',
              }} />
            </div>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} style={{ color: `${activeQuest.color || '#8B5CF6'}99` }} />
            </motion.div>
          </button>

          {/* Inline expansion: step list + hint + jump-to link */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="w-full max-w-md overflow-hidden"
                data-testid="active-mission-detail"
              >
                <div className="mt-1 px-3 py-2.5 rounded-lg" style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: activeQuest.color || '#8B5CF6' }}>
                    {activeQuest.name}
                  </div>
                  <p className="text-[11px] text-white/60 leading-snug mb-2">{activeQuest.desc}</p>
                  {activeQuest.hint && (
                    <div className="text-[10px] italic text-white/50 mb-2.5 pl-2" style={{ borderLeft: `1px solid ${activeQuest.color || '#8B5CF6'}40` }}>
                      {activeQuest.hint}
                    </div>
                  )}
                  <ol className="space-y-1">
                    {activeQuest.steps.map((s, i) => {
                      const isNext = !s.done && activeQuest.steps.findIndex(x => !x.done) === i;
                      return (
                        <li key={s.id} className="flex items-start gap-2 text-[11px]">
                          {s.done
                            ? <CheckCircle2 size={12} style={{ color: '#22C55E', marginTop: 2 }} />
                            : <Circle size={12} style={{ color: isNext ? (activeQuest.color || '#8B5CF6') : 'rgba(255,255,255,0.2)', marginTop: 2 }} />
                          }
                          <div className={`flex-1 ${s.done ? 'line-through text-white/40' : isNext ? 'text-white/90' : 'text-white/60'}`}>
                            {s.action}
                          </div>
                          {!s.done && s.target && isNext && (
                            <Link
                              to={s.target}
                              className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{
                                background: `${activeQuest.color || '#8B5CF6'}18`,
                                color: activeQuest.color || '#8B5CF6',
                                border: `1px solid ${activeQuest.color || '#8B5CF6'}30`,
                              }}
                              data-testid={`mission-goto-${s.id}`}
                            >
                              Go
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-white/40">
                      Reward: <span style={{ color: '#FBBF24' }}>{activeQuest.reward_sparks} sparks</span>
                    </span>
                    <Link
                      to="/trade-passport"
                      className="text-[9px] uppercase tracking-wider text-white/50 hover:text-white/80"
                      data-testid="mission-all-quests-link"
                    >
                      All missions →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
