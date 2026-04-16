import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sun, Moon, Compass, Heart, Sparkles, RefreshCw, Flame, Droplets, Wind, Mountain, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = { Fire: Flame, Water: Droplets, Air: Wind, Earth: Mountain };
const DIRECTION_LABELS = { East: 'Sunrise', North: 'Midnight', West: 'Sunset', South: 'Noon' };

function GlyphVisual({ sign, tone, size = 'lg' }) {
  if (!sign) return null;
  const isLg = size === 'lg';
  const w = isLg ? 200 : 120;
  const h = isLg ? 200 : 120;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative rounded-full flex items-center justify-center"
      style={{
        width: w, height: h,
        background: `radial-gradient(circle, ${sign.color}12, transparent 70%)`,
        border: `2px solid ${sign.color}25`,
        boxShadow: `0 0 60px ${sign.color}15, inset 0 0 40px ${sign.color}08`,
      }}
      data-testid="glyph-visual"
    >
      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full"
        style={{ border: `1px dashed ${sign.color}20` }}
      />
      {/* Center content */}
      <div className="text-center z-10">
        <p className="font-bold" style={{ fontSize: isLg ? 28 : 16, color: sign.color, fontFamily: 'Cormorant Garamond, serif' }}>{sign.num}</p>
        <p className="text-xs font-medium tracking-wider" style={{ color: sign.color, fontSize: isLg ? 12 : 8 }}>{sign.name}</p>
        {tone && <p className="mt-1" style={{ fontSize: isLg ? 10 : 7, color: `${tone.color}99` }}>Tone {tone.num}</p>}
      </div>
      {/* Decorative dots for the 4 directions */}
      {['top', 'right', 'bottom', 'left'].map((pos, i) => (
        <div key={pos} className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: sign.color,
            opacity: 0.3,
            ...(pos === 'top' ? { top: 4, left: '50%', transform: 'translateX(-50%)' } :
               pos === 'right' ? { right: 4, top: '50%', transform: 'translateY(-50%)' } :
               pos === 'bottom' ? { bottom: 4, left: '50%', transform: 'translateX(-50%)' } :
               { left: 4, top: '50%', transform: 'translateY(-50%)' }),
          }}
        />
      ))}
    </motion.div>
  );
}

function SignDetails({ data }) {
  if (!data) return null;
  const { sign, tone, kin, galactic_signature } = data;
  const ElemIcon = ELEMENT_ICONS[sign.element] || Sparkles;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <GlyphVisual sign={sign} tone={tone} size="lg" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: sign.color }}>
              Kin {kin} — Galactic Signature
            </p>
            <h2 className="text-2xl md:text-3xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              {galactic_signature}
            </h2>
            <p className="text-sm italic mb-3" style={{ color: sign.color }}>"{sign.meaning}"</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sign.desc}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Element</p>
              <ElemIcon size={16} className="mx-auto my-1" style={{ color: sign.color }} />
              <p className="text-sm font-medium" style={{ color: sign.color }}>{sign.element}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Direction</p>
              <Compass size={16} className="mx-auto my-1" style={{ color: sign.color }} />
              <p className="text-sm font-medium" style={{ color: sign.color }}>{sign.direction}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tone</p>
              <p className="text-lg font-light mx-auto my-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', color: tone.color }}>{tone.num}</p>
              <p className="text-sm font-medium" style={{ color: tone.color }}>{tone.name}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Kin</p>
              <p className="text-lg font-light mx-auto my-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#C084FC' }}>{kin}</p>
              <p className="text-sm font-medium" style={{ color: '#C084FC' }}>of 260</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tone Details */}
      <div className="p-5" style={{ borderColor: `${tone.color}15` }}>
        <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: tone.color }}>
          <Sparkles size={10} className="inline mr-1" /> Tone {tone.num}: {tone.name}
        </p>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{tone.desc}</p>
        <div className="flex gap-4 mt-2">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${tone.color}10`, color: tone.color, border: `1px solid ${tone.color}20` }}>
            Purpose: {tone.purpose}
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${tone.color}10`, color: tone.color, border: `1px solid ${tone.color}20` }}>
            Action: {tone.action}
          </span>
        </div>
      </div>

      {/* Shadow & Affirmation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: '#8B5CF6' }}>
            <Moon size={10} className="inline mr-1" /> Shadow Side
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sign.shadow}</p>
        </div>
        <div className="p-5" style={{ borderColor: `${sign.color}12` }}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: sign.color }}>
            <Sun size={10} className="inline mr-1" /> Affirmation
          </p>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{sign.affirmation}"</p>
        </div>
      </div>
    </motion.div>
  );
}

function BirthSignCalc() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!year || !month || !day) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/mayan/birth-sign?year=${year}&month=${month}&day=${day}`);
      setResult(res.data);
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div data-testid="mayan-birth-calc">
      <div className="p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
          <Sun size={12} className="inline mr-1.5" /> Enter Your Birth Date
        </p>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="input-glass w-full text-sm" data-testid="mayan-month">
              <option value="">---</option>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[80px]">
            <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Day</label>
            <select value={day} onChange={e => setDay(e.target.value)}
              className="input-glass w-full text-sm" data-testid="mayan-day">
              <option value="">---</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)}
              placeholder="1990" min="1900" max="2100"
              className="input-glass w-full text-sm" data-testid="mayan-year" />
          </div>
          <button onClick={calculate} disabled={loading || !year || !month || !day}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
            style={{ background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
            data-testid="calculate-mayan-sign">
            {loading ? 'Calculating...' : 'Decode'}
          </button>
        </div>
      </div>
      <AnimatePresence>{result && <SignDetails data={result} />}</AnimatePresence>
    </div>
  );
}

function MayanCompat() {
  const [p1, setP1] = useState({ year: '', month: '', day: '' });
  const [p2, setP2] = useState({ year: '', month: '', day: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!p1.year || !p1.month || !p1.day || !p2.year || !p2.month || !p2.day) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/mayan/compatibility?year1=${p1.year}&month1=${p1.month}&day1=${p1.day}&year2=${p2.year}&month2=${p2.month}&day2=${p2.day}`);
      setResult(res.data);
    } catch { setResult(null); }
    setLoading(false);
  };

  const PersonInput = ({ label, state, set, prefix }) => (
    <div>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex gap-2">
        <select value={state.month} onChange={e => set(p => ({ ...p, month: e.target.value }))}
          className="input-glass flex-1 text-sm" data-testid={`${prefix}-month`}>
          <option value="">Mon</option>
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
            <option key={i+1} value={i+1}>{m}</option>
          ))}
        </select>
        <select value={state.day} onChange={e => set(p => ({ ...p, day: e.target.value }))}
          className="input-glass flex-1 text-sm" data-testid={`${prefix}-day`}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <input type="number" value={state.year} onChange={e => set(p => ({ ...p, year: e.target.value }))}
          placeholder="Year" min="1900" max="2100"
          className="input-glass flex-1 text-sm" data-testid={`${prefix}-year`} />
      </div>
    </div>
  );

  return (
    <div data-testid="mayan-compatibility">
      <div className="p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#FDA4AF' }}>
          <Heart size={12} className="inline mr-1.5" /> Galactic Compatibility
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PersonInput label="Person 1" state={p1} set={setP1} prefix="mayan-p1" />
          <PersonInput label="Person 2" state={p2} set={setP2} prefix="mayan-p2" />
        </div>
        <button onClick={check}
          disabled={loading || !p1.year || !p1.month || !p1.day || !p2.year || !p2.month || !p2.day}
          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(253,164,175,0.1)', color: '#FDA4AF', border: '1px solid rgba(253,164,175,0.2)' }}
          data-testid="check-mayan-compat">
          {loading ? 'Calculating...' : 'Check Galactic Compatibility'}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-6 mb-6 text-center" data-testid="mayan-compat-result">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Galactic Resonance</p>
              <p className="text-6xl font-light mb-3" style={{
                fontFamily: 'Cormorant Garamond, serif',
                color: result.score >= 80 ? '#22C55E' : result.score >= 60 ? '#FCD34D' : '#FB923C',
              }}>{result.score}%</p>
              {result.messages.map((m, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{m}</p>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[result.person1, result.person2].map((p, i) => (
                <div key={i} className="flex items-start gap-4">
                  <GlyphVisual sign={p.sign} tone={p.tone} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Person {i + 1}</p>
                    <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                      {p.galactic_signature}
                    </p>
                    <p className="text-xs italic mb-1" style={{ color: p.sign.color }}>"{p.sign.meaning}"</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {p.sign.element} / {p.sign.direction} / Tone {p.tone.num}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TodaySign() {
  const [data, setData] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/mayan/today`);
      setData(res.data);
      setRevealed(true);
    } catch {}
  }, []);

  return (
    <div data-testid="mayan-today">
      {!revealed ? (
        <div className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ border: '2px dashed rgba(45,212,191,0.2)' }}
          >
            <Sun size={28} style={{ color: '#2DD4BF', opacity: 0.5 }} />
          </motion.div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Discover today's galactic energy from the Tzolk'in calendar — the 260-day sacred count of the Maya.
          </p>
          <button onClick={reveal}
            className="px-8 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
            style={{ background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
            data-testid="reveal-today-sign">
            <Sparkles size={14} /> Reveal Today's Energy
          </button>
        </div>
      ) : data && <SignDetails data={data} />}
    </div>
  );
}

const TABS = [
  { id: 'birth', label: 'Birth Sign', icon: Sun },
  { id: 'today', label: "Today's Energy", icon: Sparkles },
  { id: 'love', label: 'Compatibility', icon: Heart },
];

export default function MayanAstrology() {
  const [tab, setTab] = useState('birth');

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }} data-testid="mayan-page">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#2DD4BF' }}>
            <Compass size={14} className="inline mr-2" /> Mayan Astrology
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Tzolk'in — The Sacred Calendar
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            Decode your galactic signature through the ancient 260-day Mayan calendar. Discover your day sign, galactic tone, and cosmic purpose.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: tab === t.id ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.02)',
                  color: tab === t.id ? '#2DD4BF' : 'var(--text-muted)',
                  border: `1px solid ${tab === t.id ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}
                data-testid={`mayan-tab-${t.id}`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {tab === 'birth' && <BirthSignCalc />}
            {tab === 'today' && <TodaySign />}
            {tab === 'love' && <MayanCompat />}
          </motion.div>
        </AnimatePresence>

        {/* Cross-links to related cosmic systems */}
        <MayanCrossLinks />
      </div>
    </div>
  );
}

function MayanCrossLinks() {
  const navigate = useNavigate();
  const links = [
    { label: 'Cosmic Calendar', desc: 'See how Mayan energy combines with Numerology & Moon phases', path: '/cosmic-calendar', color: '#D8B4FE' },
    { label: 'Dream Journal', desc: 'Explore how today\'s Mayan sign appears in your dreams', path: '/dreams', color: '#818CF8' },
    { label: 'Numerology', desc: 'Cross-reference your life path with your galactic signature', path: '/numerology', color: '#FCD34D' },
    { label: 'Daily Ritual', desc: 'Your ritual is infused with today\'s Mayan element', path: '/daily-ritual', color: '#22C55E' },
  ];
  return (
    <div className="mt-8 rounded-2xl p-5" style={{ background: 'transparent', border: '1px solid rgba(45,212,191,0.08)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
        <Compass size={10} className="inline mr-1" /> Connected Systems
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {links.map(l => (
          <button key={l.path} onClick={() => navigate(l.path)}
            data-testid={`mayan-link-${l.path.slice(1)}`}
            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
            style={{ background: `${l.color}04`, border: `1px solid ${l.color}10` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${l.color}10` }}>
              <Sparkles size={12} style={{ color: l.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{l.label}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{l.desc}</p>
            </div>
            <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.15)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
