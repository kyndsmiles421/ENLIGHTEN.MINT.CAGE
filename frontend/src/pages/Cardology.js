import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, Sparkles, Star, Sun, Moon, Flame, Compass, ChevronRight, RefreshCw, Calendar, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SUIT_ICONS = { Hearts: Heart, Clubs: Flame, Diamonds: Star, Spades: Compass };
const SUIT_SYMBOLS = { Hearts: '\u2665', Clubs: '\u2663', Diamonds: '\u2666', Spades: '\u2660' };
const SUIT_COLORS = { Hearts: '#FDA4AF', Clubs: '#22C55E', Diamonds: '#FCD34D', Spades: '#93C5FD' };

function CardVisual({ card, size = 'lg' }) {
  if (!card) return null;
  const color = SUIT_COLORS[card.suit] || '#D8B4FE';
  const symbol = SUIT_SYMBOLS[card.suit] || '\u2605';
  const isLg = size === 'lg';
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: isLg ? 200 : 120,
        height: isLg ? 280 : 168,
        background: 'linear-gradient(145deg, rgba(18,20,32,0.95), rgba(30,35,55,0.95))',
        border: `2px solid ${color}30`,
        boxShadow: `0 0 40px ${color}15, inset 0 0 30px ${color}05`,
      }}
      data-testid="card-visual"
    >
      {/* Corner labels */}
      <div className="absolute top-3 left-3 text-center leading-none">
        <p style={{ color, fontSize: isLg ? 18 : 12, fontWeight: 700 }}>{card.value === 'Joker' ? 'JK' : card.value}</p>
        <p style={{ color, fontSize: isLg ? 20 : 14 }}>{symbol}</p>
      </div>
      <div className="absolute bottom-3 right-3 text-center leading-none rotate-180">
        <p style={{ color, fontSize: isLg ? 18 : 12, fontWeight: 700 }}>{card.value === 'Joker' ? 'JK' : card.value}</p>
        <p style={{ color, fontSize: isLg ? 20 : 14 }}>{symbol}</p>
      </div>
      {/* Center symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ color, fontSize: isLg ? 56 : 36, opacity: 0.35, filter: `drop-shadow(0 0 20px ${color}40)` }}>{symbol}</span>
      </div>
      {/* Subtle glow */}
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 40%, ${color}08, transparent 70%)` }} />
    </motion.div>
  );
}

function BirthCardCalculator() {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!month || !day) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/cardology/birth-card?month=${month}&day=${day}`);
      setResult(res.data.card);
    } catch { setResult(null); }
    setLoading(false);
  };

  const SuitIcon = result ? (SUIT_ICONS[result.suit] || Star) : Star;

  return (
    <div data-testid="birth-card-calculator">
      <div className="glass-card p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
          <Sun size={12} className="inline mr-1.5" /> Enter Your Birthday
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="input-glass w-full text-sm" data-testid="birth-month">
              <option value="">---</option>
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Day</label>
            <select value={day} onChange={e => setDay(e.target.value)}
              className="input-glass w-full text-sm" data-testid="birth-day">
              <option value="">---</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <button onClick={calculate} disabled={loading || !month || !day}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE', border: '1px solid rgba(192,132,252,0.2)' }}
            data-testid="calculate-birth-card">
            {loading ? 'Reading...' : 'Reveal'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <CardVisual card={result} size="lg" />
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: result.suit_theme?.color || '#D8B4FE' }}>
                    <SuitIcon size={12} className="inline mr-1" /> Your Birth Card
                  </p>
                  <h2 className="text-2xl md:text-3xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                    {result.title}
                  </h2>
                  <p className="text-sm italic mb-4" style={{ color: result.suit_theme?.color || '#D8B4FE' }}>"{result.keyword}"</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.desc}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4">
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Element</p>
                    <p className="text-sm font-medium" style={{ color: result.suit_theme?.color }}>{result.element}</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Ruling Planet</p>
                    <p className="text-sm font-medium" style={{ color: result.planet?.color || '#FCD34D' }}>{result.planet?.planet}</p>
                  </div>
                </div>

                {result.magi_formula && (
                  <div className="glass-card p-4" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Magi Formula (Robert Lee Camp)</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{result.magi_formula}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Solar Value: {result.solar_value}</p>
                  </div>
                )}

                <div className="glass-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: '#FDA4AF' }}>
                    <Heart size={10} className="inline mr-1" /> Love & Relationships
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.love}</p>
                </div>

                <div className="glass-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: '#22C55E' }}>
                    <Compass size={10} className="inline mr-1" /> Life Path
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.life}</p>
                </div>

                <div className="glass-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-muted)' }}>Suit Theme: {result.suit_theme?.theme}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.suit_theme?.desc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompatibilityChecker() {
  const [p1, setP1] = useState({ month: '', day: '' });
  const [p2, setP2] = useState({ month: '', day: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!p1.month || !p1.day || !p2.month || !p2.day) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/cardology/compatibility?month1=${p1.month}&day1=${p1.day}&month2=${p2.month}&day2=${p2.day}`);
      setResult(res.data);
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div data-testid="compatibility-checker">
      <div className="glass-card p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#FDA4AF' }}>
          <Heart size={12} className="inline mr-1.5" /> Love Compatibility
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {[{ label: 'Person 1', state: p1, set: setP1 }, { label: 'Person 2', state: p2, set: setP2 }].map(({ label, state: s, set }) => (
            <div key={label}>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <div className="flex gap-2">
                <select value={s.month} onChange={e => set(prev => ({ ...prev, month: e.target.value }))}
                  className="input-glass flex-1 text-sm" data-testid={`compat-${label.replace(' ', '-').toLowerCase()}-month`}>
                  <option value="">Month</option>
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                    <option key={i+1} value={i+1}>{m}</option>
                  ))}
                </select>
                <select value={s.day} onChange={e => set(prev => ({ ...prev, day: e.target.value }))}
                  className="input-glass flex-1 text-sm" data-testid={`compat-${label.replace(' ', '-').toLowerCase()}-day`}>
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        <button onClick={check} disabled={loading || !p1.month || !p1.day || !p2.month || !p2.day}
          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(253,164,175,0.1)', color: '#FDA4AF', border: '1px solid rgba(253,164,175,0.2)' }}
          data-testid="check-compatibility">
          {loading ? 'Reading...' : 'Check Compatibility'}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score */}
            <div className="glass-card p-6 mb-6 text-center" data-testid="compatibility-result">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Compatibility Score</p>
              <p className="text-6xl font-light mb-3" style={{
                fontFamily: 'Cormorant Garamond, serif',
                color: result.score >= 80 ? '#22C55E' : result.score >= 60 ? '#FCD34D' : '#FB923C',
              }}>{result.score}%</p>
              {result.messages.map((m, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{m}</p>
              ))}
            </div>
            {/* Cards side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[result.person1, result.person2].map((card, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CardVisual card={card} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Person {i + 1}</p>
                    <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{card.title}</p>
                    <p className="text-xs italic mb-2" style={{ color: card.suit_theme?.color }}>"{card.keyword}"</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.love}</p>
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

function DailyCard() {
  const [card, setCard] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cardology/daily-card`);
      setCard(res.data.card);
      setRevealed(true);
    } catch {}
  }, []);

  const SuitIcon = card ? (SUIT_ICONS[card.suit] || Star) : Sparkles;

  return (
    <div data-testid="daily-card">
      {!revealed ? (
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-28 mx-auto mb-6 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(192,132,252,0.08), rgba(45,212,191,0.05))', border: '2px solid rgba(192,132,252,0.15)' }}>
            <Sparkles size={28} style={{ color: '#D8B4FE', opacity: 0.5 }} />
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Receive guidance from the cards for today. What does the cosmos have in store?
          </p>
          <button onClick={reveal}
            className="px-8 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
            style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE', border: '1px solid rgba(192,132,252,0.2)' }}
            data-testid="reveal-daily-card">
            <Sparkles size={14} /> Draw Today's Card
          </button>
        </div>
      ) : card && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <CardVisual card={card} size="lg" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: card.suit_theme?.color }}>
                  <SuitIcon size={12} className="inline mr-1" /> Today's Guidance
                </p>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  {card.title}
                </h2>
                <p className="text-sm italic mb-3" style={{ color: card.suit_theme?.color }}>"{card.keyword}"</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Element</p>
                  <p className="text-sm font-medium" style={{ color: card.suit_theme?.color }}>{card.element}</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Planet</p>
                  <p className="text-sm font-medium" style={{ color: card.planet?.color }}>{card.planet?.planet}</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Suit</p>
                  <p className="text-sm font-medium" style={{ color: card.suit_theme?.color }}>{card.suit}</p>
                </div>
              </div>
              <div className="glass-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: '#FDA4AF' }}>
                  <Heart size={10} className="inline mr-1" /> Love Message
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.love}</p>
              </div>
              <button onClick={() => setRevealed(false)}
                className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--text-muted)' }}
                data-testid="draw-again">
                <RefreshCw size={12} /> Draw again tomorrow
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function YearlySpread() {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [spread, setSpread] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!month || !day || !birthYear) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/cardology/yearly-spread?month=${month}&day=${day}&birth_year=${birthYear}`);
      setSpread(res.data.spread);
    } catch { }
    setLoading(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div data-testid="yearly-spread">
      <div className="glass-card p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#D8B4FE' }}>
          <Calendar size={12} className="inline mr-1" /> Your Yearly Spread
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Based on Robert Lee Camp's "Cards of Your Destiny" — your birth card moves through 7 planetary periods each year, each lasting 52 days.
        </p>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Month</p>
            <select value={month} onChange={e => setMonth(e.target.value)} className="input-glass text-sm" data-testid="yearly-month">
              <option value="">--</option>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Day</p>
            <select value={day} onChange={e => setDay(e.target.value)} className="input-glass text-sm" data-testid="yearly-day">
              <option value="">--</option>
              {Array.from({ length: 31 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Birth Year</p>
            <select value={birthYear} onChange={e => setBirthYear(e.target.value)} className="input-glass text-sm" data-testid="yearly-year">
              <option value="">--</option>
              {Array.from({ length: 80 }, (_, i) => <option key={i} value={currentYear - i}>{currentYear - i}</option>)}
            </select>
          </div>
          <button onClick={calculate} disabled={loading || !month || !day || !birthYear}
            className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(192,132,252,0.1)', color: '#D8B4FE', border: '1px solid rgba(192,132,252,0.15)' }}
            data-testid="yearly-calculate">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Reveal
          </button>
        </div>
      </div>

      <AnimatePresence>
        {spread && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="yearly-spread-result">
            {/* Birth Card + Year Info */}
            <div className="flex items-center gap-5 mb-8">
              <CardVisual card={spread.birth_card} size="sm" />
              <div>
                <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  Card Year {spread.card_year} &middot; Age {spread.age}
                </p>
                <p className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  {spread.birth_card.title}
                </p>
                <p className="text-xs italic" style={{ color: spread.birth_card.suit_theme?.color }}>
                  "{spread.birth_card.keyword}"
                </p>
              </div>
            </div>

            {/* 7 Planetary Periods */}
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
              7 Planetary Periods
            </p>
            <div className="space-y-4">
              {spread.periods.map((period, i) => {
                const start = new Date(period.start_date);
                const end = new Date(period.end_date);
                const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={`glass-card p-5 ${period.is_current ? 'ring-1' : ''}`}
                    style={{ borderColor: period.is_current ? `${period.planet_color}30` : 'rgba(255,255,255,0.06)',
                      ringColor: period.is_current ? period.planet_color : 'transparent' }}
                    data-testid={`period-${i+1}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 48 }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: `${period.planet_color}15`, color: period.planet_color, border: `1px solid ${period.planet_color}25` }}>
                          {period.period_number}
                        </div>
                        {period.is_current && (
                          <span className="text-[8px] mt-1 px-1.5 py-0.5 rounded-full font-bold uppercase"
                            style={{ background: `${period.planet_color}20`, color: period.planet_color }}>
                            Now
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium" style={{ color: period.planet_color }}>{period.planet}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                            {fmt(start)} — {fmt(end)}
                          </span>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{period.focus}</p>
                        <div className="flex items-start gap-3">
                          <CardVisual card={period.card} size="sm" />
                          <div>
                            <p className="text-sm font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                              {period.card.title}
                            </p>
                            <p className="text-xs italic mb-2" style={{ color: period.card.suit_theme?.color }}>"{period.card.keyword}"</p>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {period.card.desc?.slice(0, 150)}...
                            </p>
                          </div>
                        </div>
                        <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{period.planet_meaning}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Current Period Highlight */}
            {spread.current_period && (
              <div className="glass-card p-6 mt-6" style={{ borderColor: `${spread.current_period.planet_color}20` }}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: spread.current_period.planet_color }}>
                  Your Current Period: {spread.current_period.planet}
                </p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {spread.current_period.planet_meaning}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  <strong style={{ color: spread.current_period.card.suit_theme?.color }}>{spread.current_period.card.title}</strong> governs this period.{' '}
                  {spread.current_period.card.life}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TABS = [
  { id: 'birth', label: 'Birth Card', icon: Sun },
  { id: 'yearly', label: 'Yearly Spread', icon: Calendar },
  { id: 'daily', label: 'Daily Card', icon: Sparkles },
  { id: 'love', label: 'Love Match', icon: Heart },
];

export default function Cardology() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState('birth');

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }} data-testid="cardology-page">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D8B4FE' }}>
            <Star size={14} className="inline mr-2" /> Sacred Cardology
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Cards of Life & Love
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            Discover your birth card, daily guidance, and love compatibility through the ancient system of sacred cardology — based on the Magi Formula from Robert Lee Camp's "Cards of Your Destiny."
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
                  background: tab === t.id ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.02)',
                  color: tab === t.id ? '#D8B4FE' : 'var(--text-muted)',
                  border: `1px solid ${tab === t.id ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}
                data-testid={`cardology-tab-${t.id}`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {tab === 'birth' && <BirthCardCalculator />}
            {tab === 'yearly' && <YearlySpread />}
            {tab === 'daily' && <DailyCard />}
            {tab === 'love' && <CompatibilityChecker />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
