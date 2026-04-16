import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory } from '../context/SensoryContext';
import { Zap, Eye, EyeOff, Sparkles, Shield, Sun, Moon, Monitor, AlertTriangle, Check } from 'lucide-react';

const LEVELS = [
  {
    id: 'calm',
    label: 'Simplified',
    icon: Shield,
    color: '#22C55E',
    description: 'Flat UI, zero transparency, maximum speed. Perfect for older devices or quick utility tasks.',
    features: ['No 3D shaders', 'Flat colors & clean icons', 'Zero battery drain', 'Max speed'],
    device: '$50 phone friendly',
  },
  {
    id: 'standard',
    label: 'Standard',
    icon: Sun,
    color: '#F59E0B',
    description: 'The baseline Cosmic experience. Smooth gradients, glowing elements, standard transparency.',
    features: ['Smooth gradients', 'Glowing UI elements', 'Standard animations', 'Balanced performance'],
    device: 'Modern smartphones',
  },
  {
    id: 'full',
    label: 'Ultra-Immersive',
    icon: Sparkles,
    color: '#A78BFA',
    description: 'Full engine unlocked. 3D particle effects, realistic light refraction, and maximum visual fidelity.',
    features: ['3D particle effects', 'Light refraction on gems', '4K-style projections', 'Full immersion'],
    device: 'High-end hardware',
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
              backdropFilter: 'none',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            data-testid="immersion-panel"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Monitor size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
                <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Atmosphere Switch</span>
              </div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Control the rendering resolution across the entire app
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
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {level.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {level.features.map((f, i) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded"
                              style={{
                                background: active ? `${level.color}08` : 'rgba(248,250,252,0.03)',
                                color: active ? `${level.color}CC` : 'rgba(255,255,255,0.65)',
                                border: `1px solid ${active ? `${level.color}12` : 'rgba(248,250,252,0.04)'}`,
                              }}>
                              {f}
                            </span>
                          ))}
                        </div>
                        {level.device && (
                          <p className="text-[8px] mt-1.5 italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {level.device}
                          </p>
                        )}
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
                <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
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
