import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2, X, ChevronRight, Zap, Heart, Eye, Activity } from 'lucide-react';
import { CosmicBanner } from '../components/CosmicBanner';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ChakraBar({ chakra }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: `${chakra.color}08`, border: `1px solid ${chakra.color}12` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: `${chakra.color}25`, boxShadow: `0 0 15px ${chakra.color}20` }}>
        <div className="w-3 h-3 rounded-full" style={{ background: chakra.color }} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{chakra.name}</p>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{chakra.location} | {chakra.frequency}</p>
      </div>
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {chakra.qualities.slice(0, 2).map(q => (
          <span key={q} className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{ background: `${chakra.color}12`, color: chakra.color }}>{q}</span>
        ))}
      </div>
    </div>
  );
}

function ReikiPositionCard({ pos, chakras }) {
  const chakra = chakras.find(c => c.id === pos.chakra);
  const color = chakra?.color || '#C084FC';
  return (
    <div className="rounded-xl p-4" data-testid={`position-${pos.id}`}
      style={{ background: 'transparent', border: `1px solid ${color}12` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: `${color}20` }}>
          <Sparkles size={12} style={{ color }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pos.name}</p>
        <span className="text-[10px] ml-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>{pos.duration}</span>
      </div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{pos.placement}</p>
      <p className="text-[10px] italic" style={{ color: `${color}99` }}>{pos.intention}</p>
    </div>
  );
}

function AuraReading({ reading, onClose }) {
  if (!reading) return null;
  const aura = reading.aura;
  const chakra = reading.chakra;
  const color = chakra?.color || '#C084FC';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl p-6 mb-6 relative overflow-hidden" data-testid="aura-reading"
      style={{ background: 'transparent', border: `1px solid ${color}30`, backdropFilter: 'none'}}>
      <div className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: `${color}20`, boxShadow: `0 0 40px ${color}30` }}>
              <Eye size={24} style={{ color }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{aura?.name || 'Your Aura'}</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Dominant: {chakra?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
            <X size={16} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
            <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color }}>Strengths</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{aura?.strengths}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
            <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color }}>Shadow</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{aura?.shadow}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color }}>Your Reading</p>
          <div className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {reading.reading}
          </div>
        </div>
        <div className="rounded-xl p-3" style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color }}>Guidance</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{aura?.advice}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Reiki() {
  const { token, authHeaders } = useAuth();
  const [chakras, setChakras] = useState([]);
  const [positions, setPositions] = useState([]);
  const [reading, setReading] = useState(null);
  const [tab, setTab] = useState('aura');
  const [loading, setLoading] = useState(true);
  const [readingLoading, setReadingLoading] = useState(false);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('reiki', 8); }, []);
  useEffect(() => {
    Promise.all([
      axios.get(`${API}/reiki/chakras`),
      axios.get(`${API}/reiki/positions`),
    ]).then(([cRes, pRes]) => {
      setChakras(cRes.data.chakras);
      setPositions(pRes.data.positions);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const getAuraReading = async () => {
    if (!token) { toast.error('Sign in for a reading'); return; }
    setReadingLoading(true);
    try {
      const r = await axios.post(`${API}/reiki/aura-reading`, { birth_month: birthMonth, birth_day: birthDay }, { headers: authHeaders });
      setReading(r.data);
      toast.success('Aura reading complete');
    } catch { toast.error('Failed to generate reading'); }
    setReadingLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen immersive-page flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#818CF8' }} />
    </div>
  );

  const TABS = [
    { id: 'aura', label: 'Aura Reading', icon: Eye },
    { id: 'chakras', label: 'Chakra System', icon: Activity },
    { id: 'positions', label: 'Hand Positions', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto" data-testid="reiki-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#818CF8' }}>
            <Sparkles size={12} className="inline mr-1" /> Reiki & Energy Healing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Aura Readings & Reiki Healing
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Channel universal life force energy for deep healing
          </p>
        </div>

        <CosmicBanner filter={['reiki']} compact />

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(129,140,248,0.15)' : 'rgba(0,0,0,0)',
                border: `1px solid ${tab === t.id ? 'rgba(129,140,248,0.3)' : 'rgba(248,250,252,0.06)'}`,
                color: tab === t.id ? '#818CF8' : 'rgba(255,255,255,0.75)',
              }}><t.icon size={14} />{t.label}</button>
          ))}
        </div>

        {tab === 'aura' && (
          <div>
            <AnimatePresence mode="wait">
              {reading && <AuraReading reading={reading} onClose={() => setReading(null)} />}
            </AnimatePresence>
            {!reading && (
              <div className="max-w-md mx-auto rounded-2xl p-6 text-center"
                style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.15)', backdropFilter: 'none'}}>
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(129,140,248,0.1)', boxShadow: '0 0 60px rgba(129,140,248,0.15)' }}>
                  <Eye size={32} style={{ color: '#818CF8' }} />
                </div>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Enter your birth date for a personalized aura reading based on your energy profile and recent moods
                </p>
                <div className="flex gap-3 justify-center mb-5">
                  <select value={birthMonth} onChange={e => setBirthMonth(+e.target.value)}
                    data-testid="aura-birth-month"
                    className="px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</option>
                    ))}
                  </select>
                  <select value={birthDay} onChange={e => setBirthDay(+e.target.value)}
                    data-testid="aura-birth-day"
                    className="px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <button onClick={getAuraReading} disabled={readingLoading || !token}
                  data-testid="get-aura-reading-btn"
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.35)', color: '#818CF8' }}>
                  {readingLoading ? <Loader2 size={16} className="animate-spin inline" /> : 'Read My Aura'}
                </button>
                {!token && <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Sign in for a personalized reading</p>}
              </div>
            )}
          </div>
        )}

        {tab === 'chakras' && (
          <div className="space-y-3 max-w-2xl mx-auto">
            {chakras.map(c => <ChakraBar key={c.id} chakra={c} />)}
          </div>
        )}

        {tab === 'positions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {positions.map(p => <ReikiPositionCard key={p.id} pos={p} chakras={chakras} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}
