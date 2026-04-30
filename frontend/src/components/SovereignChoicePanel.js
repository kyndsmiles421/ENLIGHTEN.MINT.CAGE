import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Gem, Sparkles, Brain, Gauge, Layers, Gamepad2 } from 'lucide-react';
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
  const DIFF = [
    { id: 'easy',     label: 'Easy',     hint: 'Guided · conceptual',            color: '#86EFAC' },
    { id: 'medium',   label: 'Medium',   hint: 'Manual tools · domain bridges',  color: '#FCD34D' },
    { id: 'hard',     label: 'Hard',     hint: 'No hints · frequency precision', color: '#F87171' },
    { id: 'adaptive', label: 'Adaptive', hint: 'System reads your mastery curve', color: '#C084FC' },
  ];
  const WEIGHT = [
    { id: 'precision', label: 'Precision-Weighted', hint: 'Mastery = 70% precision · 30% speed', color: '#38BDF8' },
    { id: 'speed',     label: 'Speed-Weighted',     hint: 'Mastery = 30% precision · 70% speed', color: '#FBBF24' },
  ];
  const FIDEL = [
    { id: '2d', label: '2D · Lean',       hint: 'Refracted Crystal SVG · fast', color: '#94a3b8' },
    { id: '3d', label: '3D · Full Depth', hint: 'R3F specular crystals (opt-in)', color: '#C084FC' },
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
      <div className="mb-4">
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

      {/* Crystal fidelity row */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers size={12} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Crystal Fidelity
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FIDEL.map(opt => {
            const active = prefs.visual.crystalFidelity === opt.id;
            return (
              <motion.button
                key={opt.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => SovereignPreferences.setCrystalFidelity(opt.id)}
                data-testid={`fidelity-${opt.id}`}
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

      {/* Interface Mode — Omni multi-select.
          Scholar and Gamer are independent; turning BOTH on = Sovereign Omni. */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Gamepad2 size={12} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Interface Mode
          </p>
          {prefs.visual.scholarMode && prefs.visual.gamerMode && (
            <span
              data-testid="omni-mode-indicator"
              className="ml-2 text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #38BDF822, #F472B622)',
                border: '1px solid #EAB30866',
                color: '#EAB308',
              }}
            >
              ✦ Sovereign Omni
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              key: 'scholar',
              label: 'Scholar Mode',
              hint: 'Full telemetry · readouts · tradition tabs',
              color: '#38BDF8',
              isActive: prefs.visual.scholarMode,
              toggle: () => SovereignPreferences.setScholarMode(!prefs.visual.scholarMode),
              testid: 'mode-scholar',
            },
            {
              key: 'gamer',
              label: 'Gamer Mode',
              hint: 'Cinematic · avatar · collectibles',
              color: '#F472B6',
              isActive: prefs.visual.gamerMode,
              toggle: () => SovereignPreferences.setGamerMode(!prefs.visual.gamerMode),
              testid: 'mode-gamer',
            },
          ].map(opt => (
            <motion.button
              key={opt.key}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={opt.toggle}
              data-testid={opt.testid}
              aria-pressed={opt.isActive}
              className="px-3 py-2.5 rounded-xl text-left transition-all"
              style={{
                background: opt.isActive ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${opt.isActive ? opt.color + '66' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: opt.isActive ? `0 0 24px ${opt.color}33` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-[12px] font-bold" style={{ color: opt.isActive ? opt.color : 'var(--text-primary)' }}>
                  {opt.label}
                </div>
                <div
                  className="text-[9px] font-mono"
                  style={{
                    color: opt.isActive ? opt.color : 'var(--text-muted)',
                    opacity: opt.isActive ? 1 : 0.5,
                  }}
                >
                  {opt.isActive ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {opt.hint}
              </div>
            </motion.button>
          ))}
        </div>
        <p className="mt-2 text-[9px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          Toggle both for Omni-Mode · Scholar's data layered over Gamer's cinematic world.
        </p>
      </div>

      {/* Difficulty row */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Brain size={12} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Difficulty
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {DIFF.map(opt => {
            const active = prefs.learning.difficulty === opt.id;
            return (
              <motion.button
                key={opt.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => SovereignPreferences.setDifficulty(opt.id)}
                data-testid={`difficulty-${opt.id}`}
                className="px-2 py-2 rounded-xl text-left transition-all"
                style={{
                  background: active ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? opt.color + '66' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: active ? `0 0 18px ${opt.color}33` : 'none',
                }}
              >
                <div className="text-[11px] font-bold" style={{ color: active ? opt.color : 'var(--text-primary)' }}>
                  {opt.label}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {opt.hint}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Adaptive weighting row */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Gauge size={12} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Adaptive Weighting
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {WEIGHT.map(opt => {
            const active = prefs.learning.weighting === opt.id;
            return (
              <motion.button
                key={opt.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => SovereignPreferences.setLearningWeighting(opt.id)}
                data-testid={`weighting-${opt.id}`}
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
