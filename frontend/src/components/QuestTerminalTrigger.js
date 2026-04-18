/**
 * QuestTerminalTrigger.js — V68.4 Phase D
 *
 * Drops an inline "terminal action" button on a zone page (Tesseract,
 * Dream Realms, Observatory) ONLY when the user has an active quest whose
 * next step matches the provided `signal`. Otherwise renders nothing.
 *
 * When tapped:
 *   1. Fires window.SovereignUniverse.checkQuestLogic(signal)
 *   2. If the signal advances the step, ActiveMissionHUD shows the toast
 *      and (if quest_complete) triggers the Solfeggio chord + card drop.
 *
 * Inline only. No modal, no overlay, no z-index trap.
 */
import React, { useMemo, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useSovereignUniverse } from '../context/SovereignUniverseContext';

export default function QuestTerminalTrigger({ signal, label, hint, color = '#8B5CF6' }) {
  const { quests, checkQuestLogic } = useSovereignUniverse();
  const [firing, setFiring] = useState(false);
  const [fired, setFired] = useState(false);

  // Find a quest whose NEXT undone step has this auto_signal's matching step_id logic.
  // We expose "signal" directly; the backend knows step.auto_signal mappings.
  // Show trigger if any quest has this signal as its first undone step's target.
  const matchingQuest = useMemo(() => {
    if (!quests || quests.length === 0) return null;
    // Heuristic: signal maps to a specific step by action keyword.
    // We simply check if there is any quest where the current undone step's
    // `target` route begins with the path implied by the signal, or the signal
    // literally appears in the step's id. Since the backend is the source of truth,
    // we err on the side of "show when unsure" but only for quests with prior
    // steps already completed (so we don't prematurely flash terminal triggers).
    const SIGNAL_TO_STEP = {
      'tesseract:activate': 'wake_tesseract',
      'dream_realms:fire_extinguish': 'save_realm',
      'observatory:decode': 'decode_signal',
    };
    const targetStepId = SIGNAL_TO_STEP[signal];
    if (!targetStepId) return null;
    for (const q of quests) {
      if (q.completed) continue;
      const step = q.steps.find(s => s.id === targetStepId);
      if (!step || step.done) continue;
      // Ensure prior steps are done
      const idx = q.steps.findIndex(s => s.id === targetStepId);
      const priorDone = q.steps.slice(0, idx).every(s => s.done);
      if (!priorDone) continue;
      return { quest: q, step };
    }
    return null;
  }, [quests, signal]);

  if (!matchingQuest || fired) return null;

  const handleFire = async () => {
    if (firing) return;
    setFiring(true);
    try {
      const res = await checkQuestLogic(signal, signal.split(':')[0]);
      if (res?.count > 0) setFired(true);
    } catch {}
    setFiring(false);
  };

  const c = matchingQuest.quest.color || color;

  return (
    <div className="flex justify-center px-4 py-3" data-testid={`terminal-trigger-${signal.replace(/[:]/g, '-')}`}>
      <button
        type="button"
        onClick={handleFire}
        disabled={firing}
        className="group relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${c}1c, ${c}0a)`,
          border: `1px solid ${c}55`,
          boxShadow: `0 0 18px ${c}2a, inset 0 0 12px ${c}15`,
          cursor: firing ? 'wait' : 'pointer',
        }}
        data-testid="quest-terminal-fire"
      >
        {firing
          ? <Loader2 size={14} className="animate-spin" style={{ color: c }} />
          : <Sparkles size={14} style={{ color: c }} />
        }
        <div className="text-left">
          <div className="text-[9px] uppercase tracking-[0.22em]" style={{ color: `${c}cc` }}>
            Quest Terminal · {matchingQuest.quest.name}
          </div>
          <div className="text-sm font-medium text-white/90">
            {label || matchingQuest.step.action}
          </div>
          {hint && <div className="text-[10px] text-white/50 mt-0.5">{hint}</div>}
        </div>
        <span className="text-[9px] uppercase tracking-wider ml-2 px-2 py-0.5 rounded"
          style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>
          +{matchingQuest.quest.reward_sparks} Sparks
        </span>
      </button>
    </div>
  );
}
