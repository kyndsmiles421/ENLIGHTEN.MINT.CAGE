import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSensory } from '../context/SensoryContext';
import { useMixer } from '../context/MixerContext';
import {
  Sun, Moon, Sunset, CloudMoon, Music, Zap, Sparkles, ArrowRight, ScrollText
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MIXER_FREQUENCIES = [
  { hz: 174, label: '174 Hz', desc: 'Pain Reduction', color: '#EC4899' },
  { hz: 285, label: '285 Hz', desc: 'Tissue Resonance', color: '#8B5CF6' },
  { hz: 396, label: '396 Hz', desc: 'Liberation', color: '#EF4444' },
  { hz: 417, label: '417 Hz', desc: 'Transformation', color: '#F59E0B' },
  { hz: 432, label: '432 Hz', desc: 'Universal Harmony', color: '#22C55E' },
  { hz: 528, label: '528 Hz', desc: 'DNA Repair', color: '#3B82F6' },
  { hz: 639, label: '639 Hz', desc: 'Connection', color: '#06B6D4' },
  { hz: 741, label: '741 Hz', desc: 'Expression', color: '#6366F1' },
  { hz: 852, label: '852 Hz', desc: 'Intuition', color: '#A855F7' },
  { hz: 963, label: '963 Hz', desc: 'Pineal Activation', color: '#C084FC' },
];

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
  const { toggleFreq } = useMixer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    axios.get(`${API}/wellness/prescription`, { headers: authHeaders })
      .then(r => setRx(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authHeaders]);

  if (loading || !rx) return null;

  const tod = TOD_CONFIG[rx.time_of_day] || TOD_CONFIG.morning;
  const TodIcon = tod.icon;

  const playFrequency = async () => {
    const hz = rx.recommended_frequency;
    const freq = MIXER_FREQUENCIES.find(f => f.hz === hz) || { hz, label: `${hz} Hz`, desc: 'Resonant Frequency', color: '#8B5CF6' };
    await toggleFreq(freq);
    toast(`Playing ${hz} Hz`, { description: freq.desc || 'Resonant frequency activated' });
  };

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
          <div className="flex-1">
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

        {/* Frequency + actions — all wired to live systems */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Frequency — plays immediately */}
          <button
            onClick={playFrequency}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
            style={{ background: `${tod.color}08`, border: `1px solid ${tod.color}12` }}
            data-testid="prescription-play-freq"
          >
            <Music size={10} style={{ color: tod.color }} />
            <span className="text-[10px] font-mono font-medium" style={{ color: tod.color }}>
              {rx.recommended_frequency}Hz
            </span>
          </button>

          {/* Binaural — opens mixer */}
          <button
            onClick={() => navigate('/cosmic-mixer')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
            style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.1)' }}
            data-testid="prescription-open-mixer"
          >
            <Sparkles size={10} style={{ color: '#C084FC' }} />
            <span className="text-[10px] capitalize" style={{ color: '#C084FC' }}>
              {rx.recommended_binaural?.replace('_', ' ')}
            </span>
          </button>

          {/* Mood */}
          <span className="text-[9px] px-2 py-1 rounded-lg capitalize"
            style={{ background: 'rgba(34,197,94,0.06)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.1)' }}>
            {rx.mood}
          </span>
        </div>

        {/* Deep-dive links to live modules */}
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
          <button
            onClick={() => navigate('/archives')}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium tracking-wider uppercase transition-all hover:scale-105"
            style={{ background: 'rgba(245,158,11,0.06)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.1)' }}
            data-testid="prescription-open-archives"
          >
            <ScrollText size={8} /> Archives
          </button>
          <button
            onClick={() => navigate('/suanpan')}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium tracking-wider uppercase transition-all hover:scale-105"
            style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.1)' }}
            data-testid="prescription-open-suanpan"
          >
            <Music size={8} /> Suanpan
          </button>
          <button
            onClick={() => navigate('/hub')}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium tracking-wider uppercase transition-all hover:scale-105"
            style={{ background: 'rgba(192,132,252,0.06)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.1)' }}
            data-testid="prescription-open-hub"
          >
            <ArrowRight size={8} /> Enter Abyss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
