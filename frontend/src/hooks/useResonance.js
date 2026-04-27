/**
 * useResonance.js — Universal Wiring Hook
 *
 * Single hook every tool imports. Exposes `triggerPulse(data, moduleId)`
 * which routes through the ResonanceAnalyzer + global tuning settings,
 * then dispatches `sovereign:pulse` on the existing event bus.
 *
 * No new listener. No new component. Existing ResonanceField receives
 * the pulse exactly as if it came from the audio analyser. The vector
 * is now data-aware — generating a dark battle scene paints the world
 * differently from generating a sunrise haiku.
 *
 * Usage:
 *   const { triggerPulse, settings } = useResonance();
 *   const story = await api.generate(...);
 *   triggerPulse(story.text, 'STORY_GEN');
 */
import { useCallback, useEffect, useState } from 'react';
import { analyzeResonance, blendVectors } from '../services/ResonanceAnalyzer';
import {
  initResonanceSettings, getResonanceSettings, setResonanceSettings,
} from '../state/ResonanceSettings';
import { MODULE_FREQUENCIES } from '../state/ProcessorState';

initResonanceSettings();

function applyGain(vec, gain) {
  const k = Math.max(0, Math.min(2, gain || 1));
  return {
    bass:   Math.min(1, vec.bass   * k),
    mid:    Math.min(1, vec.mid    * k),
    treble: Math.min(1, vec.treble * k),
    peak:   Math.min(1, (vec.peak ?? 0.5) * k),
  };
}

export function useResonance() {
  const [settings, setSettingsLocal] = useState(getResonanceSettings());

  // Stay in sync if the Tuning panel writes new values
  useEffect(() => {
    const onChange = (e) => {
      if (e?.detail) setSettingsLocal(e.detail);
    };
    window.addEventListener('sovereign:resonance-settings', onChange);
    return () => window.removeEventListener('sovereign:resonance-settings', onChange);
  }, []);

  const triggerPulse = useCallback((data, moduleId) => {
    const live = getResonanceSettings();
    // Data-derived signature
    const semantic = analyzeResonance(data, { mode: live.mode });
    // Module steady-state signature
    const base = MODULE_FREQUENCIES[moduleId] || MODULE_FREQUENCIES.IDLE;
    // 60/40 weighted toward content so the field paints WHAT was made,
    // anchored by the module's signature so the user still feels which
    // tool produced it.
    const blended = blendVectors(base, semantic, 0.6);
    const final = applyGain(blended, live.gain);

    try {
      window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: final }));
      window.dispatchEvent(new CustomEvent('sovereign:state-shift', {
        detail: { moduleId, signature: final, source: 'output', t: Date.now() },
      }));
      // Decay back to module steady-state after 700ms — one-shot accent
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: applyGain(base, live.gain) }));
      }, 700);
    } catch { /* noop */ }

    return final;
  }, []);

  return { triggerPulse, settings, setSettings: setResonanceSettings };
}
