import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSensory } from '../context/SensoryContext';
import {
  Sun, Moon, Sunset, CloudMoon, Music, Zap, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TOD_CONFIG = {
  morning: { icon: Sun, color: '#F59E0B', gradient: 'rgba(245,158,11,0.08)', label: 'Morning' },
  afternoon: { icon: Zap, color: '#3B82F6', gradient: 'rgba(59,130,246,0.08)', label: 'Afternoon' },
  evening: { icon: Sunset, color: '#FB923C', gradient: 'rgba(251,146,60,0.08)', label: 'Evening' },
  night: { icon: Moon, color: '#818CF8', gradient: 'rgba(129,140,248,0.08)', label: 'Night' },
};

export default function CosmicPrescription({ authHeaders }) {
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const { immersion } = useSensory();

  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/wellness/prescription`, { headers: authHeaders })
      .then(r => setRx(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authHeaders]);

  if (loading || !rx) return null;

  const tod = TOD_CONFIG[rx.time_of_day] || TOD_CONFIG.morning;
  const TodIcon = tod.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: tod.gradient,
        border: `1px solid ${tod.color}15`,
      }}
      data-testid="cosmic-prescription"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${tod.color}12`, border: `1px solid ${tod.color}20` }}>
            <TodIcon size={16} style={{ color: tod.color }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tod.color }}>
              {tod.label} Prescription
            </p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              Your cosmic wellness for right now
            </p>
          </div>
        </div>

        {/* Mantra */}
        <p className="text-sm italic font-light mb-3 leading-relaxed"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Cormorant Garamond, serif',
            textShadow: immersion === 'full' ? `0 0 20px ${tod.color}15` : 'none',
          }}>
          "{rx.mantra}"
        </p>

        {/* Frequency recommendation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: `${tod.color}08`, border: `1px solid ${tod.color}12` }}>
            <Music size={10} style={{ color: tod.color }} />
            <span className="text-[10px] font-mono font-medium" style={{ color: tod.color }}>
              {rx.recommended_frequency}Hz
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <Sparkles size={10} style={{ color: '#C084FC' }} />
            <span className="text-[10px] capitalize" style={{ color: '#C084FC' }}>
              {rx.recommended_binaural?.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[9px] px-2 py-1 rounded-lg capitalize"
            style={{ background: 'rgba(34,197,94,0.06)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.1)' }}>
            {rx.mood}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
