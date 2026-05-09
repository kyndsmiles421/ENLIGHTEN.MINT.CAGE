/**
 * AgentHUD.jsx — V1.0.9 Global Ritual Progress Chip · V1.0.10 Recall sub-state
 *
 * Lives inside App.js's top sticky strip. Renders only when
 * ProcessorState has an active ritualChain OR when a chain has just
 * completed (transient 6s "Run again" sub-state). The chip shows:
 *   running:   step 2/4 · Deep Breathing  [skip] [end]
 *   complete:  ✓ Grounding Through Breath · Run again (auto-dismisses)
 * Single chip slot, two states — Flatland-safe ribbon between two
 * surfaces from one event chain.
 *
 * Calm immersion → 0.25 opacity ("ghost in the machine").
 * Full immersion → 1.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, SkipForward, X, Loader2, RotateCcw, CheckCircle2, Volume2, VolumeX, Volume } from 'lucide-react';
import { useProcessorState } from '../state/ProcessorState';
import { useSensory } from '../context/SensoryContext';
import { speak as sageSpeak, stop as sageStop, subscribe as sageSubscribe } from '../services/SageVoiceController';

const RECALL_VISIBLE_MS = 6000;

// V1.0.11 — Voice mode cycle: off → demand → auto → off. The HUD
// speaker icon is the only surface where this can change so the user
// always knows where they stand without diving into Settings.
const VOICE_MODE_CYCLE = ['off', 'demand', 'auto'];
const VOICE_MODE_LABEL = { off: 'Voice off', demand: 'Voice on demand', auto: 'Voice auto' };

export default function AgentHUD() {
  const { ritualChain, skipRitualStep, abortRitualChain, startRitualChain } = useProcessorState();
  const { immersion, sageVoiceMode, prefs, updatePref } = useSensory();
  const [recall, setRecall] = useState(null); // {chain, expiresAt}
  // V1.0.11 — Live voice playback state from SageVoiceController.
  const [voiceState, setVoiceState] = useState({ state: 'idle', reason: null });
  useEffect(() => sageSubscribe(setVoiceState), []);

  const cycleVoiceMode = useCallback(() => {
    const cur = prefs.sageVoiceMode || 'off';
    const next = VOICE_MODE_CYCLE[(VOICE_MODE_CYCLE.indexOf(cur) + 1) % VOICE_MODE_CYCLE.length];
    updatePref('sageVoiceMode', next);
    if (next === 'off') sageStop();
  }, [prefs.sageVoiceMode, updatePref]);

  const speakCurrentStep = useCallback(() => {
    const step = ritualChain?.steps?.[ritualChain?.stepIndex | 0];
    const text = step?.narration || step?.label;
    if (!text) return;
    if (voiceState.state === 'speaking' || voiceState.state === 'loading') {
      sageStop();
      return;
    }
    sageSpeak(text);
  }, [ritualChain, voiceState.state]);

  // V1.0.10 — Listen for chain-complete events and surface a transient
  // "Run again" affordance in the SAME chip slot. Auto-dismisses after
  // RECALL_VISIBLE_MS so it never overstays.
  useEffect(() => {
    const onComplete = (e) => {
      const chain = e.detail?.chain;
      if (!chain || !chain.steps?.length) return;
      setRecall({ chain, expiresAt: Date.now() + RECALL_VISIBLE_MS });
      const t = setTimeout(() => setRecall(null), RECALL_VISIBLE_MS);
      return () => clearTimeout(t);
    };
    const onStart = () => setRecall(null); // a new chain starts → clear recall
    window.addEventListener('ritual:chain-complete', onComplete);
    window.addEventListener('ritual:chain-start', onStart);
    return () => {
      window.removeEventListener('ritual:chain-complete', onComplete);
      window.removeEventListener('ritual:chain-start', onStart);
    };
  }, []);

  const handleRecall = useCallback(() => {
    if (recall?.chain) {
      startRitualChain(recall.chain);
      setRecall(null);
    }
  }, [recall, startRitualChain]);

  const opacity = immersion === 'calm' ? 0.25 : immersion === 'standard' ? 0.7 : 1;
  const accent = '#A78BFA';
  const recallAccent = '#86EFAC';

  // V1.0.10 — Recall sub-state takes precedence visually for its 6s
  // window unless the user starts a new chain.
  if (!ritualChain && recall) {
    return (
      <div
        data-testid="agent-hud"
        data-hud-state="recall"
        data-immersion={immersion}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(10,10,18,0.65))',
          border: `1px solid ${recallAccent}55`,
          color: '#F8FAFC',
          fontSize: 10,
          fontFamily: 'monospace',
          letterSpacing: '0.10em',
          opacity,
          transition: 'opacity 0.4s ease',
          maxWidth: 320,
        }}
      >
        <CheckCircle2 size={11} style={{ color: recallAccent }} />
        <span
          style={{
            color: '#F8FAFC',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={recall.chain.ritual_title}
        >
          {recall.chain.ritual_title}
        </span>
        <button
          type="button"
          onClick={handleRecall}
          data-testid="agent-hud-recall"
          title="Run again"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'rgba(134,239,172,0.18)',
            border: '1px solid rgba(134,239,172,0.4)',
            color: recallAccent,
            cursor: 'pointer',
            fontSize: 9,
            fontFamily: 'monospace',
            letterSpacing: '0.10em',
          }}
        >
          <RotateCcw size={9} /> RUN AGAIN
        </button>
        <button
          type="button"
          onClick={() => setRecall(null)}
          data-testid="agent-hud-recall-dismiss"
          title="Dismiss"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 999,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <X size={10} />
        </button>
      </div>
    );
  }

  if (!ritualChain || !ritualChain.steps?.length) return null;

  const idx = Math.max(0, Math.min(ritualChain.stepIndex | 0, ritualChain.steps.length - 1));
  const step = ritualChain.steps[idx];
  const total = ritualChain.steps.length;

  return (
    <div
      data-testid="agent-hud"
      data-hud-state="running"
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
        onClick={speakCurrentStep}
        data-testid="agent-hud-voice"
        data-voice-mode={sageVoiceMode}
        data-voice-state={voiceState.state}
        title={
          voiceState.state === 'unavailable'
            ? 'Sage Voice resting — tap again in a moment'
            : voiceState.state === 'speaking'
            ? 'Tap to stop Sage'
            : `${VOICE_MODE_LABEL[sageVoiceMode] || 'Voice'} · long-press cycles mode`
        }
        onContextMenu={(e) => { e.preventDefault(); cycleVoiceMode(); }}
        onDoubleClick={cycleVoiceMode}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 999,
          background: voiceState.state === 'speaking'
            ? 'rgba(167,139,250,0.35)'
            : sageVoiceMode === 'auto'
            ? 'rgba(167,139,250,0.20)'
            : sageVoiceMode === 'demand'
            ? 'rgba(167,139,250,0.10)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${
            voiceState.state === 'unavailable'
              ? 'rgba(252,165,165,0.35)'
              : sageVoiceMode === 'off'
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(167,139,250,0.55)'
          }`,
          color: voiceState.state === 'unavailable'
            ? '#FCA5A5'
            : sageVoiceMode === 'off'
            ? 'rgba(255,255,255,0.55)'
            : '#C4B5FD',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {voiceState.state === 'loading'
          ? <Loader2 size={9} className="animate-spin" />
          : voiceState.state === 'speaking'
          ? <Volume2 size={10} />
          : sageVoiceMode === 'off'
          ? <VolumeX size={10} />
          : <Volume size={10} />}
      </button>
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
