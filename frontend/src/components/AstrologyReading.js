import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, X, Sparkles, Moon, Flame, Droplets, Wind, Leaf, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = { Fire: Flame, Water: Droplets, Air: Wind, Earth: Leaf };
const ELEMENT_COLORS = { Fire: '#EF4444', Water: '#3B82F6', Air: '#A78BFA', Earth: '#22C55E' };
const INTENSITY_LABELS = ['', 'Gentle', 'Calm', 'Mild', 'Moderate', 'Active', 'Strong', 'Powerful', 'Intense', 'Blazing', 'Cosmic'];

export function AstrologyReadingButton({ constellation, onReadingReady }) {
  const { token, authHeaders } = useAuth();
  const [loading, setLoading] = useState(false);

  const requestReading = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/star-chart/astrology-reading`, {
        constellation_id: constellation.id,
        constellation_name: constellation.name,
        constellation_element: constellation.element,
        constellation_meaning: constellation.meaning || '',
      }, { headers: authHeaders });
      onReadingReady(res.data);
    } catch {
      toast.error('Could not generate astrology reading');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={requestReading}
      disabled={loading}
      data-testid="astrology-reading-btn"
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(236,72,153,0.12))',
        border: '1px solid rgba(167,139,250,0.3)',
        color: '#C084FC',
        boxShadow: '0 0 12px rgba(192,132,252,0.1)',
      }}
    >
      {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
      {loading ? 'Reading the stars...' : 'Astrology Reading'}
    </button>
  );
}

export function AstrologyReadingPanel({ readingData, onClose }) {
  const [activeSection, setActiveSection] = useState('influence');

  if (!readingData) return null;

  const { reading, constellation, user_zodiac, is_own_constellation, moon_phase, moon_energy, active_transits } = readingData;
  const color = ELEMENT_COLORS[constellation.element] || '#A78BFA';
  const powerColor = ELEMENT_COLORS[reading.power_element] || color;
  const PowerIcon = ELEMENT_ICONS[reading.power_element] || Sparkles;
  const intensity = reading.intensity || 7;

  const sections = [
    { key: 'influence', label: 'Cosmic', icon: Star },
    { key: 'planets', label: 'Planets', icon: Moon },
    { key: 'guidance', label: 'Guidance', icon: Sparkles },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      className="absolute top-20 right-4 w-[380px] max-w-[88vw] max-h-[80vh] overflow-y-auto rounded-2xl z-30"
      style={{
        background: 'rgba(6,6,18,0.97)',
        border: `1px solid ${color}25`,
        backdropFilter: 'blur(30px)',
        boxShadow: `0 0 60px ${color}10, inset 0 1px 0 ${color}08`,
      }}
      data-testid="astrology-reading-panel"
    >
      {/* Header with cosmic gradient */}
      <div className="relative px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${color}12` }}>
        <div className="absolute inset-0 opacity-30" style={{
          background: `radial-gradient(ellipse at 30% 20%, ${color}15, transparent 60%)`,
        }} />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center relative"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              <Star size={18} style={{ color }} />
              {is_own_constellation && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#F59E0B', border: '2px solid rgba(6,6,18,0.97)' }}>
                  <Sparkles size={8} style={{ color: '#FFF' }} />
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${color}CC` }}>
                {is_own_constellation ? 'Your Birth Constellation' : 'Stellar Reading'}
              </p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
                {constellation.name}
              </p>
              {user_zodiac && (
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.35)' }}>
                  Your sign: {user_zodiac}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} data-testid="close-astrology-panel"
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
          </button>
        </div>

        {/* Cosmic Intensity Meter */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.3)' }}>
                Cosmic Intensity
              </span>
              <span className="text-[9px] font-medium" style={{ color: powerColor }}>
                {INTENSITY_LABELS[intensity] || 'Active'}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intensity * 10}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}80, ${powerColor})` }}
              />
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${powerColor}12`, border: `1px solid ${powerColor}20` }}>
            <PowerIcon size={14} style={{ color: powerColor }} />
          </div>
        </div>
      </div>

      {/* Moon Phase + Transits strip */}
      <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${color}08` }}>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}>
          <Moon size={10} style={{ color: '#E2E8F0' }} />
          <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.5)' }}>{moon_phase}</span>
        </div>
        {active_transits && active_transits.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {active_transits.map((p, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[8px]"
                style={{ background: `${color}08`, color: `${color}AA`, border: `1px solid ${color}12` }}>
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="px-5 pt-3 flex gap-1">
        {sections.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.key;
          return (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              data-testid={`reading-tab-${s.key}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: active ? `${color}12` : 'transparent',
                color: active ? color : 'rgba(248,250,252,0.35)',
                border: `1px solid ${active ? `${color}20` : 'rgba(248,250,252,0.06)'}`,
              }}>
              <Icon size={10} /> {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <AnimatePresence mode="wait">
          {activeSection === 'influence' && (
            <motion.div key="influence" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color }}>Cosmic Influence</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>
                {reading.cosmic_influence}
              </p>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#F59E0B' }}>Energy Forecast</p>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div className="flex items-start gap-2">
                  <Zap size={12} style={{ color: '#F59E0B', marginTop: 2, flexShrink: 0 }} />
                  <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.6)' }}>
                    {reading.energy_forecast}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'planets' && (
            <motion.div key="planets" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color }}>Planetary Message</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>
                {reading.planetary_message}
              </p>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.3)' }}>Moon Energy</p>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Moon size={12} style={{ color: '#E2E8F0' }} />
                  <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>{moon_phase}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.45)' }}>
                  The current lunar phase invites {moon_energy}.
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'guidance' && (
            <motion.div key="guidance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color }}>Personal Guidance</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>
                {reading.personal_guidance}
              </p>
              {/* Affirmation card */}
              <div className="p-4 rounded-xl text-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${color}08, ${powerColor}08)`, border: `1px solid ${color}15` }}>
                <div className="absolute inset-0 opacity-20" style={{
                  background: `radial-gradient(circle at 50% 50%, ${color}12, transparent 70%)`,
                }} />
                <Sparkles size={14} className="mx-auto mb-2 relative z-10" style={{ color }} />
                <p className="text-[10px] uppercase tracking-wider mb-2 relative z-10" style={{ color: `${color}AA` }}>Your Cosmic Affirmation</p>
                <p className="text-sm font-medium italic leading-relaxed relative z-10"
                  style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif', fontSize: '15px' }}>
                  "{reading.affirmation}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
