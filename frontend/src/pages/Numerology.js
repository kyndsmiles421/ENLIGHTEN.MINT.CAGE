import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Hash, Heart, Sparkles, Loader2, ChevronRight, Star, ArrowLeft, Compass, Moon } from 'lucide-react';
import { toast } from 'sonner';
import TranslateChip from '../components/TranslateChip';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function NumberDisplay({ number, title, color, size = 'lg' }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-full flex items-center justify-center font-light ${size === 'lg' ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-xl'}`}
        style={{ background: `${color}12`, border: `1px solid ${color}20`, color, fontFamily: 'Cormorant Garamond, serif' }}>
        {number}
      </div>
      <p className="text-[10px] mt-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</p>
    </div>
  );
}

function ResultView({ result, onBack }) {
  const lp = result.life_path;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="numerology-result">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6 group" style={{ color: 'var(--text-muted)' }}
        data-testid="numerology-back-btn">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> New Reading
      </button>

      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: lp.color }}>Numerology Reading for</p>
        <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
          {result.name}
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.birth_date}</p>
      </div>

      {/* Core Numbers */}
      <div className="flex justify-center gap-6 md:gap-10 mb-10 flex-wrap">
        <NumberDisplay number={lp.number} title="Life Path" color={lp.color} />
        <NumberDisplay number={result.destiny.number} title="Destiny" color="#3B82F6" />
        <NumberDisplay number={result.soul_urge.number} title="Soul Urge" color="#EC4899" />
        <NumberDisplay number={result.personality.number} title="Personality" color="#FB923C" />
        <NumberDisplay number={result.birthday.number} title="Birthday" color="#22C55E" size="sm" />
      </div>

      {/* Life Path Detail */}
      <div className="p-6 mb-6" style={{ borderColor: `${lp.color}15` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-light"
            style={{ background: `${lp.color}12`, color: lp.color, fontFamily: 'Cormorant Garamond, serif' }}>
            {lp.number}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: lp.color }}>Life Path {lp.number}</p>
            <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              {lp.title}
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{lp.element} Element</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>{lp.meaning}<TranslateChip text={lp.meaning} compact /></p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#22C55E' }}>Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {lp.strengths.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#FB923C' }}>Challenges</p>
            <div className="flex flex-wrap gap-1.5">
              {lp.challenges.map((c, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4" style={{ borderColor: `${lp.color}10` }}>
          <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: lp.color }}>Spiritual Lesson</p>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>{lp.spiritual_lesson}</p>
        </div>
      </div>

      {/* Other Numbers */}
      <div className="space-y-4">
        {[
          { label: 'Destiny Number', num: result.destiny.number, text: result.destiny.meaning, color: '#3B82F6' },
          { label: 'Soul Urge Number', num: result.soul_urge.number, text: result.soul_urge.meaning, color: '#EC4899' },
          { label: 'Personality Number', num: result.personality.number, text: result.personality.meaning, color: '#FB923C' },
          { label: 'Birthday Number', num: result.birthday.number, text: result.birthday.meaning, color: '#22C55E' },
        ].map(item => (
          <div key={item.label} className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-light flex-shrink-0"
              style={{ background: `${item.color}12`, color: item.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {item.num}
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: item.color }}>{item.label}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CompatibilityResult({ result, onBack }) {
  const score = result.harmony_score;
  const color = score >= 85 ? '#22C55E' : score >= 70 ? '#FCD34D' : '#FB923C';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="numerology-compat-result">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6 group" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> New Reading
      </button>

      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color }}>Numerology Compatibility</p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-light mx-auto mb-2"
              style={{ background: `${result.person1.color}12`, border: `1px solid ${result.person1.color}20`, color: result.person1.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {result.person1.life_path}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{result.person1.name}</p>
            <p className="text-[10px]" style={{ color: result.person1.color }}>{result.person1.title}</p>
          </div>
          <Heart size={24} style={{ color }} />
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-light mx-auto mb-2"
              style={{ background: `${result.person2.color}12`, border: `1px solid ${result.person2.color}20`, color: result.person2.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {result.person2.life_path}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{result.person2.name}</p>
            <p className="text-[10px]" style={{ color: result.person2.color }}>{result.person2.title}</p>
          </div>
        </div>
      </div>

      <div className="p-6 text-center" style={{ borderColor: `${color}15` }}>
        <p className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>{score}%</p>
        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Harmony Score</p>
        <div className="w-full h-2 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: color }} />
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.dynamic}</p>
      </div>
    </motion.div>
  );
}



export default function Numerology() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('numerology', 8); }, []);

  const [tab, setTab] = useState('reading'); // 'reading' | 'compatibility'
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [name1, setName1] = useState('');
  const [date1, setDate1] = useState('');
  const [name2, setName2] = useState('');
  const [date2, setDate2] = useState('');
  const [result, setResult] = useState(null);
  const [compatResult, setCompatResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!name.trim() || !birthDate) { toast.error('Enter your name and birth date'); return; }
    setLoading(true);
    try {
      const r = await axios.post(`${API}/numerology/calculate`, { name: name.trim(), birth_date: birthDate });
      setResult(r.data);
    } catch (e) { toast.error(e.response?.data?.detail || 'Calculation failed'); }
    setLoading(false);
  };

  const calcCompat = async () => {
    if (!name1.trim() || !date1 || !name2.trim() || !date2) { toast.error('Fill in both names and dates'); return; }
    setLoading(true);
    try {
      const r = await axios.post(`${API}/numerology/compatibility`, { name1: name1.trim(), date1, name2: name2.trim(), date2 });
      setCompatResult(r.data);
    } catch (e) { toast.error(e.response?.data?.detail || 'Calculation failed'); }
    setLoading(false);
  };

  return (
    
      <div className="pt-20 pb-40 px-5" data-testid="numerology-page">
      <div className="max-w-3xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {result ? (
            <ResultView key="result" result={result} onBack={() => setResult(null)} />
          ) : compatResult ? (
            <CompatibilityResult key="compat" result={compatResult} onBack={() => setCompatResult(null)} />
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D4AF37' }}>
                  <Hash size={14} className="inline mr-2" /> Numerology
                </p>
                <h1 className="text-3xl md:text-3xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  The Sacred Numbers
                </h1>
                <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
                  Discover the hidden vibrations encoded in your name and birth date. Each number carries a frequency that shapes your life path, destiny, and soul purpose.
                </p>
              </motion.div>

              {/* Tabs */}
              <div className="flex rounded-xl overflow-hidden mb-8" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => setTab('reading')}
                  className="flex-1 px-4 py-3 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: tab === 'reading' ? 'rgba(212,175,55,0.12)' : 'transparent', color: tab === 'reading' ? '#D4AF37' : 'var(--text-muted)' }}
                  data-testid="numerology-reading-tab">
                  <Sparkles size={14} /> Personal Reading
                </button>
                <button onClick={() => setTab('compatibility')}
                  className="flex-1 px-4 py-3 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: tab === 'compatibility' ? 'rgba(236,72,153,0.12)' : 'transparent', color: tab === 'compatibility' ? '#EC4899' : 'var(--text-muted)' }}
                  data-testid="numerology-compat-tab">
                  <Heart size={14} /> Compatibility
                </button>
              </div>

              {tab === 'reading' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6" data-testid="numerology-reading-form">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#D4AF37' }}>Your Details</p>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Birth Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Enter your full name as given at birth"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-transparent"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        data-testid="numerology-name-input" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Birth Date</label>
                      <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-transparent"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        data-testid="numerology-date-input" />
                    </div>
                  </div>
                  <button onClick={calculate} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                    data-testid="numerology-calculate-btn">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {loading ? 'Calculating...' : 'Reveal My Numbers'}
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6" data-testid="numerology-compat-form">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#EC4899' }}>Compatibility Reading</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: '#EC4899' }}>Person 1</p>
                      <input type="text" value={name1} onChange={e => setName1(e.target.value)}
                        placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        data-testid="compat-name1" />
                      <input type="date" value={date1} onChange={e => setDate1(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        data-testid="compat-date1" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: '#EC4899' }}>Person 2</p>
                      <input type="text" value={name2} onChange={e => setName2(e.target.value)}
                        placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        data-testid="compat-name2" />
                      <input type="date" value={date2} onChange={e => setDate2(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        data-testid="compat-date2" />
                    </div>
                  </div>
                  <button onClick={calcCompat} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background: 'rgba(236,72,153,0.12)', color: '#EC4899', border: '1px solid rgba(236,72,153,0.2)' }}
                    data-testid="numerology-compat-btn">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
                    {loading ? 'Calculating...' : 'Check Compatibility'}
                  </button>
                </motion.div>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-10">
                {[
                  { num: 'LP', label: 'Life Path', desc: 'Your core purpose', color: '#D4AF37' },
                  { num: 'DN', label: 'Destiny', desc: 'What you\'re meant to achieve', color: '#3B82F6' },
                  { num: 'SU', label: 'Soul Urge', desc: 'Your deepest desire', color: '#EC4899' },
                  { num: 'PN', label: 'Personality', desc: 'How others see you', color: '#FB923C' },
                  { num: 'BN', label: 'Birthday', desc: 'Special talent', color: '#22C55E' },
                ].map(item => (
                  <div key={item.label} className="p-3 text-center">
                    <p className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: item.color }}>{item.num}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected Systems */}
        <NumerologyCrossLinks />
      </div>
      </div>
    
  );
}

function NumerologyCrossLinks() {
  const navigate = useNavigate();
  const links = [
    { label: 'Cosmic Calendar', desc: 'See your personal year, month & day numerology in context', path: '/cosmic-calendar', color: '#D8B4FE' },
    { label: 'Mayan Astrology', desc: 'Cross-reference your life path with your galactic signature', path: '/mayan', color: '#2DD4BF' },
    { label: 'Dream Oracle', desc: 'Get dream interpretations through your numerological lens', path: '/coach', color: '#818CF8' },
    { label: 'Daily Ritual', desc: 'Your ritual adapts to your numerology cycle', path: '/daily-ritual', color: '#22C55E' },
  ];
  return (
    <div className="mt-8 rounded-2xl p-5" style={{ background: 'transparent', border: '1px solid rgba(212,175,55,0.08)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
        <Star size={10} className="inline mr-1" /> Connected Systems
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {links.map(l => (
          <button key={l.path} onClick={() => navigate(l.path)}
            data-testid={`numerology-link-${l.path.slice(1)}`}
            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
            style={{ background: `${l.color}04`, border: `1px solid ${l.color}10` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${l.color}10` }}>
              {l.path === '/mayan' ? <Compass size={12} style={{ color: l.color }} /> :
               l.path === '/sage' ? <Moon size={12} style={{ color: l.color }} /> :
               <Sparkles size={12} style={{ color: l.color }} />}
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
