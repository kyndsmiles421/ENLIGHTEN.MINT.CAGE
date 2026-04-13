import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Compass, Star, Sparkles, Loader2, ChevronRight, Flame, Droplets, Wind, Mountain, Eye, Zap, Check, Image } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = { Fire: Flame, Water: Droplets, Air: Wind, Earth: Mountain };
const MOON_EMOJIS = { new_moon: '🌑', waxing_crescent: '🌒', first_quarter: '🌓', waxing_gibbous: '🌔', full_moon: '🌕', waning_gibbous: '🌖', last_quarter: '🌗', waning_crescent: '🌘' };

function Section({ title, icon: Icon, color, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(15,17,28,0.65)', border: `1px solid ${color}12`, backdropFilter: 'blur(16px)' }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ background: `radial-gradient(circle at 20% 30%, ${color}, transparent 60%)` }} />
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color }}>{title}</p>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default function DailyBriefing() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyCard, setDailyCard] = useState(null);
  const [genCard, setGenCard] = useState(false);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('daily_briefing', 8); }, []);
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/daily-briefing`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load briefing'))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return (
    <div className="min-h-screen immersive-page flex items-center justify-center pt-20">
      <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to receive your cosmic briefing</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: '#D8B4FE' }} />
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>Reading the cosmic frequencies...</p>
      </div>
    </div>
  );

  if (!data) return null;

  const ElemIcon = ELEMENT_ICONS[data.element.name] || Sparkles;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-2xl mx-auto" data-testid="daily-briefing-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: '#D8B4FE' }}>
          <Sparkles size={12} className="inline mr-1" /> {data.date}
        </motion.p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {data.greeting}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Your personalized cosmic forecast for today
        </p>
        {data.streak > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full"
            style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)' }}>
            <Zap size={11} style={{ color: '#FCD34D' }} />
            <span className="text-[10px] font-medium" style={{ color: '#FCD34D' }}>{data.streak} day streak</span>
          </motion.div>
        )}
      </motion.div>

      {/* AI Cosmic Card of the Day */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
        className="mb-6">
        {dailyCard ? (
          <div className="rounded-2xl overflow-hidden mx-auto max-w-sm" style={{ border: '1px solid rgba(216,180,254,0.15)', boxShadow: '0 0 40px rgba(216,180,254,0.05)' }}>
            <img src={`data:image/png;base64,${dailyCard}`} alt="Card of the day" className="w-full h-48 object-cover" style={{ filter: 'saturate(1.15)' }} />
            <div className="p-3 text-center" style={{ background: 'rgba(15,17,28,0.9)' }}>
              <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: '#D8B4FE' }}>Your Cosmic Card</p>
            </div>
          </div>
        ) : (
          <button onClick={async () => {
            setGenCard(true);
            try {
              const theme = data?.element?.name || 'cosmic wisdom';
              const affirmation = data?.mayan?.meaning || data?.element?.focus || 'You are aligned with the cosmos';
              const r = await axios.post(`${API}/ai-visuals/daily-card`, { theme, affirmation: affirmation.slice(0, 150) }, { headers: authHeaders, timeout: 120000 });
              setDailyCard(r.data.image_b64);
            } catch {}
            setGenCard(false);
          }} disabled={genCard}
            data-testid="gen-daily-card"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs transition-all"
            style={{ background: 'rgba(216,180,254,0.06)', border: '1px solid rgba(216,180,254,0.12)', color: '#D8B4FE' }}>
            {genCard ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
            {genCard ? 'Channeling your cosmic card...' : 'Reveal AI Cosmic Card of the Day'}
          </button>
        )}
      </motion.div>

      <div className="space-y-4">
        {/* Elemental Energy */}
        <Section title={`${data.element.name} Element Day`} icon={ElemIcon} color={data.element.color} delay={0.1}>
          <div className="rounded-xl p-4 mb-3" style={{ background: `${data.element.color}06`, border: `1px solid ${data.element.color}12` }}>
            <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{data.element.energy}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.6)' }}>{data.element.focus}</p>
          </div>
        </Section>

        {/* Moon Phase */}
        <Section title="Lunar Guidance" icon={Moon} color="#93C5FD" delay={0.2}>
          <div className="flex items-start gap-4">
            <div className="text-center flex-shrink-0">
              <p className="text-4xl mb-1">{MOON_EMOJIS[data.moon.code] || '🌕'}</p>
              <p className="text-xs font-medium" style={{ color: '#93C5FD' }}>{data.moon.phase}</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.25)' }}>
                {data.moon.illumination}% illumination
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.7)' }}>
                {data.moon.guidance}
              </p>
            </div>
          </div>
        </Section>

        {/* Mayan Energy */}
        <Section title="Mayan Tzolk'in" icon={Compass} color="#A78BFA" delay={0.3}>
          <button onClick={() => navigate('/mayan')} className="w-full text-left">
            <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{data.mayan.galactic_signature}</p>
            <p className="text-xs mb-2" style={{ color: '#A78BFA' }}>Kin {data.mayan.kin} — Tone: {data.mayan.tone}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.55)' }}>{data.mayan.meaning}</p>
          </button>
        </Section>

        {/* Numerology */}
        {data.numerology && (
          <Section title="Numerology Cycle" icon={Star} color="#FCD34D" delay={0.35}>
            <button onClick={() => navigate('/numerology')} className="w-full text-left">
              <div className="flex gap-3">
                <div className="rounded-xl p-3 flex-1 text-center" style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.12)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#FCD34D' }}>{data.numerology.personal_year}</p>
                  <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'rgba(248,250,252,0.35)' }}>Personal Year</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.5)' }}>{data.numerology.year_theme}</p>
                </div>
                <div className="rounded-xl p-3 flex-1 text-center" style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.12)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#FCD34D' }}>{data.numerology.personal_day}</p>
                  <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'rgba(248,250,252,0.35)' }}>Personal Day</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.5)' }}>{data.numerology.day_theme}</p>
                </div>
              </div>
            </button>
          </Section>
        )}

        {/* Dream Echoes */}
        {data.dream_symbols.length > 0 && (
          <Section title="Dream Echoes" icon={Eye} color="#818CF8" delay={0.4}>
            <button onClick={() => navigate('/dreams')} className="w-full text-left">
              <p className="text-xs mb-3" style={{ color: 'rgba(248,250,252,0.55)' }}>
                Recurring symbols from your recent dreamscape:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {data.dream_symbols.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs capitalize"
                    style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8' }}>
                    {s}
                  </span>
                ))}
              </div>
              {data.recent_dreams.length > 0 && (
                <div className="space-y-1.5">
                  {data.recent_dreams.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                      <Moon size={9} style={{ color: '#818CF8' }} />
                      <span className="truncate">{d.title || 'Untitled'}</span>
                      <span className="text-[9px] ml-auto">{d.mood}</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          </Section>
        )}

        {/* Aura */}
        {data.aura_color && (
          <Section title="Aura Field" icon={Sparkles} color="#D8B4FE" delay={0.45}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full" style={{
                background: `radial-gradient(circle, ${data.aura_color === 'blue' ? '#3B82F6' : data.aura_color === 'green' ? '#22C55E' : data.aura_color === 'purple' ? '#A855F7' : data.aura_color === 'gold' ? '#EAB308' : data.aura_color === 'red' ? '#EF4444' : '#D8B4FE'}40, transparent)`,
                boxShadow: `0 0 30px ${data.aura_color === 'blue' ? '#3B82F6' : '#D8B4FE'}20`,
              }} />
              <div>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{data.aura_color} Aura</p>
                <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Your current energetic signature</p>
              </div>
            </div>
          </Section>
        )}

        {/* Suggested Practices */}
        <Section title="Today's Practices" icon={Sparkles} color="#22C55E" delay={0.5}>
          <div className="space-y-2">
            {data.practices.map((p, i) => (
              <button key={i} onClick={() => navigate(p.link)}
                data-testid={`briefing-practice-${p.type}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <Sparkles size={14} style={{ color: '#22C55E' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>{p.duration}</p>
                </div>
                <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.15)' }} />
              </button>
            ))}
          </div>
          {data.ritual_status !== 'completed' && (
            <button onClick={() => navigate('/daily-ritual')}
              data-testid="start-ritual-btn"
              className="w-full mt-3 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.08))', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}>
              {data.ritual_status === 'pending' ? <><Check size={14} /> Continue Your Ritual</> : <><Sparkles size={14} /> Start Today's Ritual</>}
            </button>
          )}
          {data.ritual_status === 'completed' && (
            <div className="mt-3 py-3 rounded-xl text-xs text-center flex items-center justify-center gap-2"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: '#22C55E' }}>
              <Check size={14} /> Today's Ritual Complete
            </div>
          )}
        </Section>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2 pt-2">
          {[
            { label: 'Star Chart', path: '/star-chart', icon: Star, color: '#818CF8' },
            { label: 'Calendar', path: '/cosmic-calendar', icon: Sun, color: '#FCD34D' },
            { label: 'Sage', path: '/coach', icon: Sparkles, color: '#D8B4FE' },
          ].map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              data-testid={`quick-link-${l.path.slice(1)}`}
              className="rounded-xl p-3 text-center transition-all hover:scale-[1.02]"
              style={{ background: `${l.color}06`, border: `1px solid ${l.color}10` }}>
              <l.icon size={18} className="mx-auto mb-1.5" style={{ color: l.color }} />
              <p className="text-[10px] font-medium" style={{ color: l.color }}>{l.label}</p>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
