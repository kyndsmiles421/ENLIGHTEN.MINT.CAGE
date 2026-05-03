/**
 * RitualChainPanel.jsx — V1.0.9 Intent-to-Ritual Forge
 *
 * Flatland-safe: no modals, no fixed positioning, no z-index traps.
 * Lives inline inside the active realm view as a normal flow card.
 *
 * Flow:
 *   1. User types a natural-language intent.
 *   2. POST /api/forge/ritual-chain → Sage returns {steps:[...]}
 *   3. Vertical pathway renders below the input, in-flow.
 *   4. "Begin" dispatches `ritual:chain-start` — ProcessorState's
 *      Background Agent Runner advances through the steps,
 *      pulling each module_id into the matrix slot.
 *
 * Reads `ritualChain` from useProcessorState() so the active step
 * highlights itself live, no parallel state.
 */
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Wand2, Play, SkipForward, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProcessorState } from '../state/ProcessorState';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Modules that emit visuals — used only for the "skipped" hint badge.
const VISUAL_MODULES = new Set([
  'SCENE_GEN', 'COSMIC_PORTRAIT', 'AVATAR_GEN', 'DREAM_VIZ', 'STORY_GEN',
]);

export default function RitualChainPanel({ realm, accentColor = '#A78BFA' }) {
  const { authHeaders } = useAuth();
  const { ritualChain, startRitualChain, skipRitualStep, abortRitualChain } = useProcessorState();
  const { immersion, autoVisualsEnabled } = useSensory();

  const [intent, setIntent] = useState('');
  const [chain, setChain] = useState(null);     // forged-but-not-yet-running chain
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedNotice, setCompletedNotice] = useState(null);

  // Hear chain-complete from the runner so we can surface the result
  // inline without a popup.
  useEffect(() => {
    const onComplete = (e) => {
      const c = e.detail?.chain;
      if (!c) return;
      setCompletedNotice(c.ritual_title || 'Ritual complete');
      setChain(null);
      if (immersion !== 'calm') {
        toast.success('Ritual chain complete', { description: c.ritual_title });
      }
    };
    const onAbort = () => { setCompletedNotice(null); };
    window.addEventListener('ritual:chain-complete', onComplete);
    window.addEventListener('ritual:chain-aborted', onAbort);
    return () => {
      window.removeEventListener('ritual:chain-complete', onComplete);
      window.removeEventListener('ritual:chain-aborted', onAbort);
    };
  }, [immersion]);

  const forge = useCallback(async () => {
    if (!authHeaders?.Authorization) { toast('Sign in to forge a ritual chain'); return; }
    const text = intent.trim();
    if (text.length < 5) { setError('Tell the forge what you want — at least 5 characters.'); return; }
    setLoading(true);
    setError(null);
    setCompletedNotice(null);
    try {
      const res = await axios.post(`${API}/forge/ritual-chain`, {
        intent: text,
        realm_id: realm?.id || '',
        biome: realm?.element || '',
        max_steps: 4,
      }, { headers: authHeaders });
      setChain(res.data);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'The forge faltered. Try a clearer intent.';
      setError(msg);
    }
    setLoading(false);
  }, [authHeaders, intent, realm]);

  const begin = useCallback(() => {
    if (!chain || !chain.steps?.length) return;
    setCompletedNotice(null);
    startRitualChain(chain);
    if (immersion !== 'calm') {
      toast(`Beginning ${chain.ritual_title || 'ritual chain'}`);
    }
  }, [chain, startRitualChain, immersion]);

  const liveIdx = ritualChain?.stepIndex ?? -1;
  const isRunning = !!ritualChain;
  const renderedChain = isRunning ? ritualChain : chain;

  return (
    <div
      data-testid="ritual-chain-panel"
      className="p-4 rounded-2xl mb-4"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10, rgba(0,0,0,0.18))`,
        border: `1px solid ${accentColor}25`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Wand2 size={14} style={{ color: accentColor }} />
        <p className="text-[9px] uppercase tracking-widest" style={{ color: accentColor }}>
          Ritual Forge · Intent → Path
        </p>
        {!autoVisualsEnabled && (
          <span
            data-testid="ritual-auto-visuals-off"
            className="text-[8px] px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            title="Auto-Visuals off — visual steps will be skipped"
          >
            visuals · off
          </span>
        )}
      </div>

      {/* Intent input — only when no chain is forged or running */}
      {!renderedChain && (
        <>
          <textarea
            data-testid="ritual-chain-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value.slice(0, 400))}
            placeholder="Describe what you want… e.g. 'Ground me, then breathe deep, then capture one insight'"
            rows={2}
            className="w-full p-3 rounded-xl text-sm transition-all outline-none"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${accentColor}22`,
              color: 'rgba(255,255,255,0.85)',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {intent.length}/400
            </span>
            <button
              type="button"
              onClick={forge}
              disabled={loading || intent.trim().length < 5}
              data-testid="ritual-chain-forge-btn"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
                border: `1px solid ${accentColor}55`,
                color: accentColor,
              }}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading ? 'Forging…' : 'Forge Path'}
            </button>
          </div>
          {error && (
            <p
              data-testid="ritual-chain-error"
              className="text-[10px] mt-2"
              style={{ color: '#FCA5A5' }}
            >
              {error}
            </p>
          )}
          {completedNotice && (
            <div
              data-testid="ritual-chain-completed"
              className="mt-3 p-2 rounded-lg flex items-center gap-2"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              <CheckCircle2 size={12} style={{ color: '#22C55E' }} />
              <p className="text-[10px]" style={{ color: '#86EFAC' }}>
                {completedNotice} — chain complete.
              </p>
            </div>
          )}
        </>
      )}

      {/* Forged-or-running chain pathway */}
      {renderedChain && (
        <div data-testid="ritual-chain-path">
          <div className="mb-3">
            <p className="text-sm font-medium" style={{ color: accentColor }}>
              {renderedChain.ritual_title}
            </p>
            {renderedChain.ritual_description && (
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {renderedChain.ritual_description}
              </p>
            )}
          </div>

          <ol className="space-y-2 mb-3">
            {(renderedChain.steps || []).map((step, i) => {
              const state = !isRunning
                ? 'pending'
                : i < liveIdx ? 'done'
                : i === liveIdx ? 'active'
                : 'pending';
              const isVisual = VISUAL_MODULES.has(step.module_id);
              const skipped = isRunning && isVisual && !autoVisualsEnabled;
              return (
                <li
                  key={`${step.module_id}-${i}`}
                  data-testid={`ritual-step-${i}`}
                  data-step-state={state}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg transition-all"
                  style={{
                    background: state === 'active'
                      ? `${accentColor}1A`
                      : state === 'done'
                      ? 'rgba(34,197,94,0.06)'
                      : 'rgba(0,0,0,0.18)',
                    border: state === 'active'
                      ? `1px solid ${accentColor}66`
                      : state === 'done'
                      ? '1px solid rgba(34,197,94,0.18)'
                      : '1px solid rgba(255,255,255,0.06)',
                    opacity: skipped ? 0.5 : 1,
                  }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                    style={{
                      background: state === 'active' ? accentColor : 'rgba(255,255,255,0.08)',
                      color: state === 'active' ? '#0B0C15' : 'rgba(255,255,255,0.7)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {state === 'done' ? '✓' : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {step.label || step.module_id}
                      </p>
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.45)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {step.module_id}
                      </span>
                      {skipped && (
                        <span
                          className="text-[8px]"
                          style={{ color: 'rgba(255,255,255,0.35)' }}
                          title="Auto-Visuals off — runner will skip this step"
                        >
                          · skipped
                        </span>
                      )}
                    </div>
                    {step.narration && (
                      <p
                        className="text-[10px] mt-1 leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        {step.narration}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[9px] flex-shrink-0"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
                  >
                    {Math.round((step.duration || 180) / 60)}m
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isRunning && (
              <>
                <button
                  type="button"
                  onClick={begin}
                  data-testid="ritual-chain-begin-btn"
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}15)`,
                    border: `1px solid ${accentColor}66`,
                    color: '#F8FAFC',
                  }}
                >
                  <Play size={11} /> Begin Ritual
                </button>
                <button
                  type="button"
                  onClick={() => { setChain(null); setIntent(''); }}
                  data-testid="ritual-chain-discard-btn"
                  className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  <X size={11} /> Discard
                </button>
              </>
            )}
            {isRunning && (
              <>
                <button
                  type="button"
                  onClick={skipRitualStep}
                  data-testid="ritual-chain-skip-btn"
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  <SkipForward size={11} /> Next Step
                </button>
                <button
                  type="button"
                  onClick={abortRitualChain}
                  data-testid="ritual-chain-abort-btn"
                  className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  <X size={11} /> End Ritual
                </button>
                <span
                  data-testid="ritual-chain-progress"
                  className="text-[10px] ml-auto"
                  style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                >
                  step {Math.min((liveIdx | 0) + 1, renderedChain.steps.length)}/{renderedChain.steps.length}
                  {immersion === 'calm' && ' · calm'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
