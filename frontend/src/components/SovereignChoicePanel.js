import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Gem, Sparkles } from 'lucide-react';
import SovereignPreferences from '../kernel/SovereignPreferences';

/**
 * SovereignChoicePanel — three-option user-choice row, mounted in the
 * Sovereign Hub. Honors the Sovereign Choice Protocol: every option the
 * user sees here is explicit, persisted, and broadcast system-wide via
 * the `sovereign:preferences` event.
 */
export default function SovereignChoicePanel() {
  const [prefs, setPrefs] = useState(() => SovereignPreferences.get());
  useEffect(() => SovereignPreferences.subscribe(setPrefs), []);

  const FREQ = [
    { id: 'silence', label: 'Silence',  hint: 'No tone — pure Sovereign quiet', color: '#94a3b8' },
    { id: '432hz',   label: '432 Hz',   hint: 'Healing · natural tuning',       color: '#38BDF8' },
    { id: '528hz',   label: '528 Hz',   hint: 'Transformation · Love',          color: '#22C55E' },
  ];
  const SKIN = [
    { id: 'neo-kyoto',         label: 'Neo-Kyoto Neon',     hint: 'Magenta × cyan cinematic depth', color: '#F0ABFC' },
    { id: 'refracted-crystal', label: 'Refracted Crystal',  hint: 'Gold × white high-vibration geometry', color: '#FBBF24' },
  ];

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 mt-6 mb-6 max-w-3xl mx-auto"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
      }}
      data-testid="sovereign-choice-panel"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: '#C084FC' }} />
        <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: '#C084FC' }}>
          Sovereign Choice
        </p>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          — nothing plays or shifts until you choose.
        </span>
      </div>

      {/* Frequency row */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Radio size={12} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Audio Frequency
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FREQ.map(opt => {
            const active = prefs.audio.frequency === opt.id;
            return (
              <motion.button
                key={opt.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => SovereignPreferences.setAudioFrequency(opt.id)}
                data-testid={`freq-${opt.id}`}
                className="px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? opt.color + '66' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: active ? `0 0 24px ${opt.color}33` : 'none',
                }}
              >
                <div className="text-[12px] font-bold" style={{ color: active ? opt.color : 'var(--text-primary)' }}>
                  {opt.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {opt.hint}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Visual skin row */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Gem size={12} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Visual Skin
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SKIN.map(opt => {
            const active = prefs.visual.skin === opt.id;
            return (
              <motion.button
                key={opt.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => SovereignPreferences.setVisualSkin(opt.id)}
                data-testid={`skin-${opt.id}`}
                className="px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? opt.color + '66' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: active ? `0 0 24px ${opt.color}33` : 'none',
                }}
              >
                <div className="text-[12px] font-bold" style={{ color: active ? opt.color : 'var(--text-primary)' }}>
                  {opt.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {opt.hint}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
