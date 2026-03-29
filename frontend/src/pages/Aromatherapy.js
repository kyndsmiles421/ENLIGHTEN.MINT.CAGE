import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Droplets, Heart, Sparkles, Loader2, Star, X, ChevronRight } from 'lucide-react';
import { CosmicBanner } from '../components/CosmicBanner';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function OilCard({ oil, onSelect, selected }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(oil)}
      className="cursor-pointer rounded-2xl p-5 transition-all"
      style={{
        background: selected?.id === oil.id
          ? `linear-gradient(135deg, ${oil.color}22, ${oil.color}08)`
          : 'rgba(15,17,28,0.6)',
        border: `1px solid ${selected?.id === oil.id ? oil.color + '55' : 'rgba(248,250,252,0.06)'}`,
        backdropFilter: 'blur(12px)',
      }}
      data-testid={`oil-card-${oil.id}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${oil.color}20`, boxShadow: `0 0 20px ${oil.color}15` }}>
          <Droplets size={18} style={{ color: oil.color }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{oil.name}</p>
          <p className="text-[10px] italic" style={{ color: 'rgba(248,250,252,0.35)' }}>{oil.latin}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {oil.properties.slice(0, 3).map(p => (
          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${oil.color}15`, color: oil.color, border: `1px solid ${oil.color}25` }}>{p}</span>
        ))}
      </div>
    </motion.div>
  );
}

function OilDetail({ oil, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 mb-6" data-testid="oil-detail"
      style={{ background: 'rgba(15,17,28,0.8)', border: `1px solid ${oil.color}30`, backdropFilter: 'blur(24px)' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{oil.name}</h3>
          <p className="text-xs italic" style={{ color: 'rgba(248,250,252,0.4)' }}>{oil.latin}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: `${oil.color}08`, border: `1px solid ${oil.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: oil.color }}>Chakra</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{oil.chakra}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: `${oil.color}08`, border: `1px solid ${oil.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: oil.color }}>Element</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{oil.element}</p>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: oil.color }}>How to Use</p>
        {oil.uses.map((u, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <ChevronRight size={12} style={{ color: oil.color, marginTop: 2 }} />
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.7)' }}>{u}</p>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: oil.color }}>Emotional</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.65)' }}>{oil.emotional}</p>
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: oil.color }}>Spiritual</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.65)' }}>{oil.spiritual}</p>
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: '#EAB308' }}>Caution</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{oil.caution}</p>
      </div>
    </motion.div>
  );
}

function BlendCard({ blend, oils }) {
  return (
    <div className="rounded-2xl p-5" data-testid={`blend-${blend.name.toLowerCase().replace(/\s/g, '-')}`}
      style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', backdropFilter: 'blur(12px)' }}>
      <p className="font-semibold text-sm mb-2" style={{ color: '#F8FAFC' }}>{blend.name}</p>
      <div className="flex gap-2 mb-3">
        {blend.oils.map(oilId => {
          const oil = oils.find(o => o.id === oilId);
          return oil ? (
            <div key={oilId} className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: `${oil.color}12`, border: `1px solid ${oil.color}20` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: oil.color }} />
              <span className="text-[10px]" style={{ color: oil.color }}>{oil.name}</span>
            </div>
          ) : null;
        })}
      </div>
      <p className="text-[10px] mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>Ratio: {blend.ratio}</p>
      <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Method: {blend.method}</p>
    </div>
  );
}

export default function Aromatherapy() {
  const { token } = useAuth();
  const [oils, setOils] = useState([]);
  const [blends, setBlends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('oils');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/aromatherapy/oils`),
      axios.get(`${API}/aromatherapy/blends`),
    ]).then(([oilRes, blendRes]) => {
      setOils(oilRes.data.oils);
      setBlends(blendRes.data.blends);
    }).catch(() => toast.error('Failed to load aromatherapy data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen immersive-page flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#C084FC' }} />
    </div>
  );

  const TABS = [
    { id: 'oils', label: 'Essential Oils', icon: Droplets },
    { id: 'blends', label: 'Blend Recipes', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto" data-testid="aromatherapy-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#C084FC' }}>
            <Droplets size={12} className="inline mr-1" /> Sacred Aromatherapy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Essential Oils & Blends
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Explore the healing power of nature's aromatic essences
          </p>
        </div>

        <CosmicBanner filter={['aromatherapy']} compact />

        <div className="flex gap-2 mb-8 justify-center">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              data-testid={`tab-${t.id}`}
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.15)' : 'rgba(15,17,28,0.4)',
                border: `1px solid ${tab === t.id ? 'rgba(192,132,252,0.3)' : 'rgba(248,250,252,0.06)'}`,
                color: tab === t.id ? '#C084FC' : 'rgba(248,250,252,0.5)',
              }}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selected && <OilDetail oil={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>

        {tab === 'oils' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {oils.map(oil => <OilCard key={oil.id} oil={oil} onSelect={setSelected} selected={selected} />)}
          </div>
        )}

        {tab === 'blends' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {blends.map((b, i) => <BlendCard key={i} blend={b} oils={oils} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}
