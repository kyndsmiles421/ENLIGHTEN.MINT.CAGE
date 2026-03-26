import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Moon, Star, Compass, Sparkles, Loader2, Sun, ChevronRight, Flame, Wind, Target, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MOON_EMOJIS = { new_moon: '🌑', waxing_crescent: '🌒', first_quarter: '🌓', waxing_gibbous: '🌔', full_moon: '🌕', waning_gibbous: '🌖', last_quarter: '🌗', waning_crescent: '🌘' };

const SUGGESTION_ICONS = { yoga: Flame, aromatherapy: Sparkles, herbology: Sparkles, acupressure: Target, journal: Star, meditation: Moon, dreams: Moon, reiki: Sparkles, breathing: Wind, elixir: Sparkles };

function CosmicCard({ title, icon: Icon, color, link, children }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl p-5 h-full relative group"
      style={{ background: 'rgba(15,17,28,0.65)', border: `1px solid ${color}15`, backdropFilter: 'blur(16px)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>{title}</p>
        </div>
        {link && (
          <button onClick={() => navigate(link)} data-testid={`card-link-${title.toLowerCase().replace(/[^a-z]/g, '-')}`}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
            Explore <ChevronRight size={10} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function CosmicCalendar() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cosmicCtx, setCosmicCtx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [birthMonth, setBirthMonth] = useState(3);
  const [birthDay, setBirthDay] = useState(15);
  const [birthYear, setBirthYear] = useState(1990);

  const fetchCalendar = () => {
    setLoading(true);
    axios.get(`${API}/cosmic-calendar/today?birth_month=${birthMonth}&birth_day=${birthDay}&birth_year=${birthYear}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load cosmic data'))
      .finally(() => setLoading(false));
  };

  const fetchContext = () => {
    if (!token) return;
    axios.get(`${API}/cosmic-context`, { headers: authHeaders })
      .then(r => setCosmicCtx(r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchCalendar(); }, [birthMonth, birthDay, birthYear]);
  useEffect(() => { fetchContext(); }, [token]);

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#D8B4FE' }} />
    </div>
  );

  const n = data?.numerology;
  const m = data?.moon;
  const my = data?.mayan;
  const c = data?.cardology;
  const inputStyle = { background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-5xl mx-auto" data-testid="cosmic-calendar-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D8B4FE' }}>
            <Calendar size={12} className="inline mr-1" /> {data?.date}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#F8FAFC' }}>
            Cosmic Calendar
          </h1>
        </div>

        {/* Birth date inputs */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          <select value={birthMonth} onChange={e => setBirthMonth(+e.target.value)} data-testid="cal-month"
            className="px-3 py-2 rounded-xl text-xs" style={inputStyle}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</option>
            ))}
          </select>
          <select value={birthDay} onChange={e => setBirthDay(+e.target.value)} data-testid="cal-day"
            className="px-3 py-2 rounded-xl text-xs" style={inputStyle}>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <input type="number" value={birthYear} onChange={e => setBirthYear(+e.target.value)} data-testid="cal-year"
            min={1920} max={2010} className="px-3 py-2 rounded-xl text-xs w-20" style={inputStyle} />
        </div>

        {/* Energy Summary */}
        {data && (
          <div className="rounded-2xl p-5 mb-6 text-center relative overflow-hidden"
            style={{ background: 'rgba(15,17,28,0.7)', border: '1px solid rgba(216,180,254,0.15)', backdropFilter: 'blur(24px)' }}>
            <div className="absolute inset-0 opacity-5"
              style={{ background: 'radial-gradient(circle at 50% 50%, #D8B4FE, transparent 70%)' }} />
            <p className="text-sm leading-relaxed relative z-10" style={{ color: 'rgba(248,250,252,0.75)' }}>{data.energy_summary}</p>
          </div>
        )}

        {/* Personalized Suggestions (from Cosmic Context) */}
        {cosmicCtx?.suggestions?.length > 0 && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(216,180,254,0.08)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#D8B4FE' }}>
              <Sparkles size={10} className="inline mr-1" /> Today's Cosmic Practices
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cosmicCtx.suggestions.map((s, i) => {
                const Icon = SUGGESTION_ICONS[s.type] || Sparkles;
                return (
                  <button key={i} onClick={() => navigate(s.link)}
                    data-testid={`suggestion-${s.type}`}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(216,180,254,0.08)' }}>
                      <Icon size={12} style={{ color: '#D8B4FE' }} />
                    </div>
                    <span className="text-[11px] leading-snug" style={{ color: 'rgba(248,250,252,0.6)' }}>{s.text}</span>
                    <ChevronRight size={12} className="ml-auto flex-shrink-0" style={{ color: 'rgba(248,250,252,0.15)' }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid of cosmic systems */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Numerology */}
            <CosmicCard title="Numerology" icon={Star} color={n?.personal_day?.color || '#FCD34D'} link="/numerology">
              <div className="space-y-3">
                {[{label: 'Personal Year', data: n?.personal_year}, {label: 'Personal Month', data: n?.personal_month}, {label: 'Personal Day', data: n?.personal_day}].map(item => (
                  <div key={item.label} className="rounded-xl p-3" style={{ background: `${item.data?.color || '#FCD34D'}06`, border: `1px solid ${item.data?.color || '#FCD34D'}12` }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: item.data?.color }}>{item.label}</p>
                      <span className="text-lg font-bold" style={{ color: item.data?.color }}>{item.data?.number}</span>
                    </div>
                    <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{item.data?.theme}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(248,250,252,0.4)' }}>{item.data?.advice}</p>
                  </div>
                ))}
              </div>
            </CosmicCard>

            {/* Moon Phase */}
            <CosmicCard title="Moon Phase" icon={Moon} color="#93C5FD" link="/dreams">
              <div className="text-center py-4">
                <p className="text-5xl mb-3">{MOON_EMOJIS[m?.code] || '🌕'}</p>
                <p className="text-lg font-bold mb-1" style={{ color: '#F8FAFC' }}>{m?.phase}</p>
                <p className="text-xs mb-2" style={{ color: 'rgba(248,250,252,0.4)' }}>Moon age: {m?.age} days</p>
                <div className="rounded-xl p-3 mt-3 text-left" style={{ background: 'rgba(147,197,253,0.06)', border: '1px solid rgba(147,197,253,0.12)' }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#93C5FD' }}>Guidance</p>
                  <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{m?.guidance}</p>
                </div>
              </div>
            </CosmicCard>

            {/* Mayan */}
            <CosmicCard title="Mayan Tzolk'in" icon={Compass} color="#A78BFA" link="/mayan">
              <div className="text-center py-3">
                <p className="text-xs mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>Kin {my?.kin}</p>
                <p className="text-lg font-bold mb-1" style={{ color: '#F8FAFC' }}>{my?.galactic_signature}</p>
                <div className="flex gap-2 justify-center mt-3">
                  <div className="rounded-xl p-3 flex-1" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#A78BFA' }}>Day Sign</p>
                    <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{my?.glyph}</p>
                  </div>
                  <div className="rounded-xl p-3 flex-1" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#A78BFA' }}>Tone</p>
                    <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{my?.tone?.number} - {my?.tone?.name}</p>
                  </div>
                </div>
              </div>
            </CosmicCard>

            {/* Cardology */}
            <CosmicCard title="Daily Card" icon={Sparkles} color={c?.color || '#FCD34D'} link="/cardology">
              <div className="text-center py-3">
                <div className="w-20 h-28 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${c?.color || '#FCD34D'}12`, border: `2px solid ${c?.color || '#FCD34D'}30` }}>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: c?.color }}>{c?.value}</p>
                    <p className="text-[10px]" style={{ color: c?.color }}>{c?.suit}</p>
                  </div>
                </div>
                <p className="text-lg font-bold" style={{ color: '#F8FAFC' }}>{c?.card}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.4)' }}>Your energetic card for today</p>
              </div>
            </CosmicCard>
          </div>
        )}

        {/* Recent Dreams (from Cosmic Context) */}
        {cosmicCtx?.recent_dreams?.length > 0 && (
          <div className="mt-6 rounded-2xl p-5" style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(129,140,248,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#818CF8' }}>
                <Eye size={10} className="inline mr-1" /> Recent Dreams
              </p>
              <button onClick={() => navigate('/dreams')} className="text-[10px] flex items-center gap-1"
                data-testid="view-all-dreams"
                style={{ color: '#818CF8' }}>View All <ChevronRight size={10} /></button>
            </div>
            <div className="space-y-2">
              {cosmicCtx.recent_dreams.slice(0, 3).map(d => (
                <button key={d.id} onClick={() => navigate('/dreams')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  <Moon size={12} style={{ color: '#818CF8' }} />
                  <span className="text-xs truncate flex-1" style={{ color: 'rgba(248,250,252,0.6)' }}>{d.title || 'Untitled'}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(129,140,248,0.08)', color: '#818CF8' }}>{d.moon_phase}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
