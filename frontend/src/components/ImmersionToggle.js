import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory } from '../context/SensoryContext';
import { Zap, Eye, EyeOff, Sparkles, Shield, Sun, Moon, Monitor, AlertTriangle, Check } from 'lucide-react';

const LEVELS = [
  {
    id: 'calm',
    label: 'Calm',
    icon: Shield,
    color: '#22C55E',
    description: 'Minimal animations, no particles or visual effects. Safe for photosensitive users.',
    features: ['No particles or fractals', 'No flashing effects', 'Reduced motion', 'Clean text-focused UI'],
  },
  {
    id: 'standard',
    label: 'Standard',
    icon: Sun,
    color: '#F59E0B',
    description: 'Moderate animations and gentle visual enhancements. A balanced experience.',
    features: ['Gentle animations', 'Subtle visual effects', 'Standard transitions', 'Optional Vision Mode'],
  },
  {
    id: 'full',
    label: 'Full Immersive',
    icon: Sparkles,
    color: '#A78BFA',
    description: 'Maximum visual experience — particles, fractals, Vision Mode, and all effects enabled.',
    features: ['Full particle systems', 'Audio-reactive fractals', 'Vision Mode for scriptures', 'All visual effects'],
  },
];

export function ImmersionToggle() {
  const { prefs, updatePref, immersion } = useSensory();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LEVELS.find(l => l.id === immersion) || LEVELS[2];
  const Icon = current.icon;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const setLevel = (id) => {
    updatePref('immersionLevel', id);
    // Auto-set related prefs based on level
    if (id === 'calm') {
      updatePref('reduceMotion', true);
      updatePref('reduceParticles', true);
      updatePref('reduceFlashing', true);
    } else if (id === 'standard') {
      updatePref('reduceMotion', false);
      updatePref('reduceParticles', false);
      updatePref('reduceFlashing', true);
    } else {
      updatePref('reduceMotion', false);
      updatePref('reduceParticles', false);
      updatePref('reduceFlashing', false);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        data-testid="immersion-toggle"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
        style={{
          background: `${current.color}12`,
          border: `1px solid ${current.color}25`,
          color: current.color,
        }}
        title={`Immersion: ${current.label}`}
      >
        <Icon size={13} />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(6,6,18,0.97)',
              border: '1px solid rgba(248,250,252,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            data-testid="immersion-panel"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Monitor size={14} style={{ color: 'rgba(248,250,252,0.5)' }} />
                <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Experience Level</span>
              </div>
              <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                Control the visual intensity across the entire app
              </p>
            </div>

            {/* Level options */}
            <div className="p-3 space-y-1.5">
              {LEVELS.map(level => {
                const LIcon = level.icon;
                const active = immersion === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setLevel(level.id)}
                    data-testid={`immersion-${level.id}`}
                    className="w-full text-left p-3 rounded-xl transition-all"
                    style={{
                      background: active ? `${level.color}10` : 'rgba(248,250,252,0.02)',
                      border: `1px solid ${active ? `${level.color}25` : 'rgba(248,250,252,0.04)'}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${level.color}${active ? '18' : '08'}`, border: `1px solid ${level.color}${active ? '30' : '12'}` }}>
                        <LIcon size={15} style={{ color: level.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: active ? level.color : '#F8FAFC' }}>
                            {level.label}
                          </span>
                          {active && <Check size={12} style={{ color: level.color }} />}
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.4)' }}>
                          {level.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {level.features.map((f, i) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded"
                              style={{
                                background: active ? `${level.color}08` : 'rgba(248,250,252,0.03)',
                                color: active ? `${level.color}CC` : 'rgba(248,250,252,0.3)',
                                border: `1px solid ${active ? `${level.color}12` : 'rgba(248,250,252,0.04)'}`,
                              }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Accessibility note */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(248,250,252,0.06)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={11} style={{ color: '#F59E0B', marginTop: 2, flexShrink: 0 }} />
                <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  If you have photosensitive epilepsy or motion sensitivity, we recommend <strong style={{ color: '#22C55E' }}>Calm</strong> mode for a safe, comfortable experience.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
