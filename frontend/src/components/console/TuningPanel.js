/**
 * TuningPanel.js — Frequency Tuning console tab
 *
 * Lets the user tune the resonance loop's global gain + mode without
 * leaving the dock. Writes through `setResonanceSettings`, which
 * persists to localStorage and broadcasts `sovereign:resonance-settings`
 * so every active tool's `useResonance` hook re-reads on the next pulse.
 *
 * No portal, no overlay — renders inline as a normal panel inside
 * UnifiedCreatorConsole's panel slot.
 */
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  RESONANCE_MODES, getResonanceSettings, setResonanceSettings,
} from '../../state/ResonanceSettings';

const MODE_DESC = {
  RAW:      'Direct data → pulse · no shaping (fastest, most erratic)',
  STANDARD: "Analyzer's natural curve · balanced",
  CALM:     'Low-pass · dampens bass + treble · smooths peaks',
  INTENSE:  'High-pass · amplifies bass + treble + peaks',
};

const MODE_COLOR = {
  RAW:      '#EF4444',
  STANDARD: '#A78BFA',
  CALM:     '#2DD4BF',
  INTENSE:  '#FBBF24',
};

export default function TuningPanel() {
  const [settings, setSettings] = useState(getResonanceSettings());

  // Stay in sync with external writes
  useEffect(() => {
    const onChange = (e) => { if (e?.detail) setSettings(e.detail); };
    window.addEventListener('sovereign:resonance-settings', onChange);
    return () => window.removeEventListener('sovereign:resonance-settings', onChange);
  }, []);

  const updateGain = (g) => {
    setResonanceSettings({ gain: Number(g) });
  };
  const updateMode = (m) => {
    setResonanceSettings({ mode: m });
  };

  const previewPulse = () => {
    // Fire a one-shot test burst at current settings so the user can
    // visually confirm what the field will look like.
    const live = getResonanceSettings();
    const k = live.gain;
    const sample = {
      RAW:      { bass: 0.6, mid: 0.5, treble: 0.6, peak: 0.7 },
      STANDARD: { bass: 0.5, mid: 0.5, treble: 0.5, peak: 0.6 },
      CALM:     { bass: 0.3, mid: 0.5, treble: 0.3, peak: 0.4 },
      INTENSE:  { bass: 0.85, mid: 0.6, treble: 0.85, peak: 0.95 },
    }[live.mode] || { bass: 0.5, mid: 0.5, treble: 0.5, peak: 0.6 };
    const out = {
      bass:   Math.min(1, sample.bass   * k),
      mid:    Math.min(1, sample.mid    * k),
      treble: Math.min(1, sample.treble * k),
      peak:   Math.min(1, sample.peak   * k),
    };
    try {
      window.dispatchEvent(new CustomEvent('sovereign:pulse', { detail: out }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sovereign:pulse', {
          detail: { bass: 0.10, mid: 0.18, treble: 0.20, peak: 0.05 },
        }));
      }, 800);
    } catch { /* noop */ }
  };

  return (
    <div className="p-3 space-y-3" data-testid="tuning-panel">
      <div className="flex items-center gap-2">
        <Sparkles size={11} style={{ color: '#FBBF24' }} />
        <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: '#FBBF24' }}>
          Resonance Tuning · Engine Feedback Loop
        </span>
      </div>
      <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Every tool's output now flows through the Resonance Analyzer before
        it paints the field. Gain controls how loudly the field reacts;
        Mode shapes the curve.
      </p>

      {/* GAIN */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Global Gain
          </span>
          <span className="text-[10px] font-mono" style={{ color: '#FBBF24' }} data-testid="tuning-gain-value">
            {settings.gain.toFixed(2)}×
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={settings.gain}
          onChange={(e) => updateGain(e.target.value)}
          data-testid="tuning-gain-slider"
          className="w-full"
          style={{ accentColor: '#FBBF24' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>SILENT</span>
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>UNITY</span>
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>MAX</span>
        </div>
      </div>

      {/* MODE */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Filter Mode
        </span>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {RESONANCE_MODES.map((m) => {
            const sel = settings.mode === m;
            const c = MODE_COLOR[m];
            return (
              <button
                key={m}
                type="button"
                onClick={() => updateMode(m)}
                data-testid={`tuning-mode-${m.toLowerCase()}`}
                className="px-2 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider active:scale-95 transition-all"
                style={{
                  background: sel ? `${c}22` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${sel ? `${c}66` : 'rgba(255,255,255,0.06)'}`,
                  color: sel ? c : 'rgba(255,255,255,0.4)',
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
        <p className="text-[8px] mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {MODE_DESC[settings.mode]}
        </p>
      </div>

      {/* PREVIEW */}
      <button
        type="button"
        onClick={previewPulse}
        data-testid="tuning-preview-btn"
        className="w-full px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider active:scale-95"
        style={{
          background: 'rgba(251, 191, 36, 0.10)',
          border: '1px solid rgba(251, 191, 36, 0.30)',
          color: '#FBBF24',
        }}
      >
        ⌁ Fire Preview Pulse
      </button>
    </div>
  );
}
