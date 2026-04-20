import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, ArrowRight } from 'lucide-react';
import SovereignPreferences from '../kernel/SovereignPreferences';

/**
 * CalibrationLens — the Living Lens.
 *
 * A portal that opens anywhere (Hub, Observatory, Tool Drawer) and asks
 * the Sovereign to place themselves on 4 material axes:
 *   Metal · Glass · Oil · Gold
 *
 * The Sovereign moves each slider 0..1 and writes back to the
 * SovereignPreferences calibration ledger. No "one right answer." The
 * values tune: HUD telemetry density, Recursive Dive copy tone,
 * Arsenal blade glow brightness, and cross-domain resonance unlocks.
 *
 * Re-openable at any time — the Lens is LIVING.
 */

const AXES = [
  {
    key: 'metal',
    label: 'Metal',
    subtitle: 'Technical · Structural · Engineering',
    probe: 'Do you see the logic in the framework, or the beauty in the finish?',
    leftLabel: 'Finish',
    rightLabel: 'Framework',
    color: '#94a3b8',
  },
  {
    key: 'glass',
    label: 'Glass',
    subtitle: 'Aesthetic · Sacred Geometry · Arts',
    probe: 'Do you prioritize the precision of the recipe, or the sensory vibe of the plate?',
    leftLabel: 'Precision',
    rightLabel: 'Sensory',
    color: '#C084FC',
  },
  {
    key: 'oil',
    label: 'Oil',
    subtitle: 'Culinary · Health · Biochem',
    probe: 'Are you tracking the movement of the stars, or the composition of the soil?',
    leftLabel: 'Cosmos',
    rightLabel: 'Soil',
    color: '#22C55E',
  },
  {
    key: 'gold',
    label: 'Gold',
    subtitle: 'Economy · Sovereignty · Trade',
    probe: 'Is success measured in accrued Dust, or in the growth of community Fans?',
    leftLabel: 'Dust',
    rightLabel: 'Fans',
    color: '#FBBF24',
  },
];

export default function CalibrationLens({ open, onClose }) {
  const [prefs, setPrefs] = useState(() => SovereignPreferences.get());
  useEffect(() => SovereignPreferences.subscribe(setPrefs), []);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const cal = prefs.calibration;
  const handleSlider = (axisKey, val) => {
    SovereignPreferences.setCalibration({ [axisKey]: val });
  };
  const reset = () => {
    SovereignPreferences.setCalibration({ metal: 0.5, glass: 0.5, oil: 0.5, gold: 0.5 });
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(4,6,15,0.94)', backdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        data-testid="calibration-lens"
      >
        <motion.div
          initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative rounded-2xl max-w-2xl w-full p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,32,0.95), rgba(12,12,22,0.95))',
            border: '1px solid rgba(192,132,252,0.22)',
            boxShadow: '0 40px 120px rgba(192,132,252,0.12)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition"
            data-testid="calibration-lens-close"
          >
            <X size={18} style={{ color: '#cbd5e1' }} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Compass size={14} style={{ color: '#C084FC' }} />
            <p className="text-[10px] uppercase tracking-[0.36em]" style={{ color: '#C084FC' }}>
              The Living Lens
            </p>
          </div>
          <h2
            className="text-3xl font-light mt-0.5 mb-1"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}
          >
            Calibrate your grip
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>
            Four materials of the Swiss Army Knife. Place yourself. You can re-open
            this Lens anytime — as you move between blades, your grip may shift.
          </p>

          <div className="space-y-5">
            {AXES.map(axis => {
              const val = cal[axis.key];
              return (
                <div key={axis.key} data-testid={`lens-axis-${axis.key}`}>
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="text-[13px] font-bold" style={{ color: axis.color }}>
                      {axis.label}
                      <span className="ml-2 text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
                        {axis.subtitle}
                      </span>
                    </p>
                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                  <p className="text-[13px] italic mb-2" style={{ color: '#cbd5e1', fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}>
                    "{axis.probe}"
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] min-w-[60px]" style={{ color: 'var(--text-muted)' }}>
                      {axis.leftLabel}
                    </span>
                    <input
                      type="range"
                      min="0" max="1" step="0.01"
                      value={val}
                      onChange={(e) => handleSlider(axis.key, parseFloat(e.target.value))}
                      data-testid={`lens-slider-${axis.key}`}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(90deg, ${axis.color}88 0%, ${axis.color}88 ${val * 100}%, rgba(255,255,255,0.08) ${val * 100}%)`,
                      }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.2em] min-w-[60px] text-right" style={{ color: 'var(--text-muted)' }}>
                      {axis.rightLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-7 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={reset}
              className="text-[10px] uppercase tracking-[0.28em] hover:text-white transition"
              style={{ color: 'var(--text-muted)' }}
              data-testid="lens-reset"
            >
              Reset to centre
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.28em] font-bold flex items-center gap-2 transition"
              style={{
                background: 'rgba(192,132,252,0.18)',
                border: '1px solid rgba(192,132,252,0.5)',
                color: '#E9D5FF',
              }}
              data-testid="lens-apply"
            >
              Apply calibration <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
