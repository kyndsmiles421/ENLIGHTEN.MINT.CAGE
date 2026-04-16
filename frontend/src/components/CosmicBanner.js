import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Moon, Compass, Star, Sparkles, Wind, Flame, Target, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MOON_ICONS = { new_moon: 'N', waxing_crescent: 'W', first_quarter: 'Q', waxing_gibbous: 'G', full_moon: 'F', waning_gibbous: 'g', last_quarter: 'q', waning_crescent: 'w' };

const TYPE_ICONS = {
  yoga: Flame, aromatherapy: Sparkles, herbology: Sparkles, acupressure: Target,
  journal: Star, meditation: Moon, dreams: Moon, reiki: Sparkles, breathing: Wind, elixir: Sparkles,
};

export function useCosmicContext() {
  const { token, authHeaders } = useAuth();
  const [cosmic, setCosmic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/cosmic-context`, { headers: authHeaders })
      .then(r => setCosmic(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return { cosmic, loading };
}

export function CosmicBanner({ filter, compact = false }) {
  const { cosmic, loading } = useCosmicContext();
  const navigate = useNavigate();

  if (loading || !cosmic) return null;

  const suggestions = filter
    ? cosmic.suggestions.filter(s => filter.includes(s.type))
    : cosmic.suggestions.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      data-testid="cosmic-banner"
      className="rounded-2xl p-4 mb-6 relative overflow-hidden"
      style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(216,180,254,0.08)', backdropFilter: 'blur(12px)' }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ background: 'radial-gradient(circle at 30% 50%, #818CF8, transparent 60%)' }} />

      {/* Top row: cosmic alignment at a glance */}
      <div className="flex items-center gap-3 flex-wrap mb-3 relative z-10">
        <span className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(248,250,252,0.25)' }}>
          Cosmic Alignment
        </span>
        <button onClick={() => navigate('/cosmic-calendar')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all hover:scale-105"
          data-testid="cosmic-moon-link"
          style={{ background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.12)' }}>
          <Moon size={10} style={{ color: '#93C5FD' }} />
          <span className="text-[10px]" style={{ color: '#93C5FD' }}>{cosmic.moon.phase}</span>
        </button>
        <button onClick={() => navigate('/mayan')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all hover:scale-105"
          data-testid="cosmic-mayan-link"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.12)' }}>
          <Compass size={10} style={{ color: '#A78BFA' }} />
          <span className="text-[10px]" style={{ color: '#A78BFA' }}>{cosmic.mayan.glyph}</span>
        </button>
        {cosmic.numerology && (
          <button onClick={() => navigate('/numerology')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all hover:scale-105"
            data-testid="cosmic-numerology-link"
            style={{ background: `${cosmic.numerology.personal_day.color}08`, border: `1px solid ${cosmic.numerology.personal_day.color}12` }}>
            <Star size={10} style={{ color: cosmic.numerology.personal_day.color }} />
            <span className="text-[10px]" style={{ color: cosmic.numerology.personal_day.color }}>Day {cosmic.numerology.personal_day.number}</span>
          </button>
        )}
        {cosmic.aura_color && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px]"
            style={{ background: 'rgba(216,180,254,0.08)', border: '1px solid rgba(216,180,254,0.12)', color: '#D8B4FE' }}>
            Aura: {cosmic.aura_color}
          </span>
        )}
      </div>

      {/* Mayan energy summary */}
      {!compact && (
        <p className="text-[11px] mb-3 relative z-10" style={{ color: 'rgba(248,250,252,0.5)' }}>
          Today's Mayan energy: <span style={{ color: '#A78BFA' }}>{cosmic.mayan.galactic_signature}</span> — {cosmic.mayan.meaning}.
          {cosmic.mayan.element && <> Element: <span style={{ color: '#93C5FD' }}>{cosmic.mayan.element}</span>.</>}
        </p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 relative z-10">
          {suggestions.map((s, i) => {
            const Icon = TYPE_ICONS[s.type] || Sparkles;
            return (
              <button key={i} onClick={() => navigate(s.link)}
                data-testid={`cosmic-suggestion-${s.type}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.55)' }}>
                <Icon size={10} />
                <span className="truncate max-w-[200px]">{s.text.split(' — ')[0]}</span>
                <ChevronRight size={9} style={{ opacity: 0.4 }} />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export function CosmicMiniTag({ type, text, link }) {
  const navigate = useNavigate();
  const colors = {
    mayan: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)', text: '#A78BFA' },
    moon: { bg: 'rgba(147,197,253,0.08)', border: 'rgba(147,197,253,0.15)', text: '#93C5FD' },
    numerology: { bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.15)', text: '#FCD34D' },
    aura: { bg: 'rgba(216,180,254,0.08)', border: 'rgba(216,180,254,0.15)', text: '#D8B4FE' },
  };
  const c = colors[type] || colors.mayan;
  return (
    <button onClick={() => link && navigate(link)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] transition-all hover:scale-105"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {type === 'moon' && <Moon size={8} />}
      {type === 'mayan' && <Compass size={8} />}
      {type === 'numerology' && <Star size={8} />}
      {type === 'aura' && <Sparkles size={8} />}
      {text}
    </button>
  );
}
