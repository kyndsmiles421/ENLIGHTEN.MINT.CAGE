/**
 * AgentHUD.jsx — V1.0.9 Global Ritual Progress Chip
 *
 * Lives inside App.js's top sticky strip. Renders only when
 * ProcessorState has an active ritualChain. The chip shows
 *   step 2/4 · Deep Breathing  [skip] [end]
 * and lets the user advance or abort from anywhere in the app —
 * the runner itself lives in ProcessorState.
 *
 * Flatland: inline-flex pill, no portals, no fixed positioning,
 * no z-index trap. Calm immersion → 0.25 opacity (becomes a
 * "ghost in the machine"). Full immersion → 1.
 */
import React from 'react';
import { Sparkles, SkipForward, X, Loader2 } from 'lucide-react';
import { useProcessorState } from '../state/ProcessorState';
import { useSensory } from '../context/SensoryContext';

export default function AgentHUD() {
  const { ritualChain, skipRitualStep, abortRitualChain } = useProcessorState();
  const { immersion } = useSensory();

  if (!ritualChain || !ritualChain.steps?.length) return null;

  const idx = Math.max(0, Math.min(ritualChain.stepIndex | 0, ritualChain.steps.length - 1));
  const step = ritualChain.steps[idx];
  const total = ritualChain.steps.length;

  const opacity = immersion === 'calm' ? 0.25 : immersion === 'standard' ? 0.7 : 1;
  const accent = '#A78BFA';

  return (
    <div
      data-testid="agent-hud"
      data-immersion={immersion}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        background: `linear-gradient(135deg, ${accent}22, rgba(10,10,18,0.65))`,
        border: `1px solid ${accent}55`,
        color: '#F8FAFC',
        fontSize: 10,
        fontFamily: 'monospace',
        letterSpacing: '0.10em',
        opacity,
        transition: 'opacity 0.4s ease',
        maxWidth: 320,
      }}
    >
      <Loader2 size={11} className="animate-spin" style={{ color: accent }} />
      <span
        data-testid="agent-hud-progress"
        style={{ color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}
      >
        {idx + 1}/{total}
      </span>
      <span
        data-testid="agent-hud-label"
        style={{
          color: '#F8FAFC',
          maxWidth: 140,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={step?.label || step?.module_id}
      >
        {step?.label || step?.module_id || 'ritual'}
      </span>
      <button
        type="button"
        onClick={skipRitualStep}
        data-testid="agent-hud-skip"
        title="Next step"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.85)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <SkipForward size={10} />
      </button>
      <button
        type="button"
        onClick={abortRitualChain}
        data-testid="agent-hud-abort"
        title="End ritual"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <X size={10} />
      </button>
      <Sparkles size={10} style={{ color: accent, opacity: 0.7 }} />
    </div>
  );
}
