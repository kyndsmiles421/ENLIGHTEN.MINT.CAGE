import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, Sparkles, Loader2, X, ChevronRight, Search } from 'lucide-react';
import { CosmicBanner } from '../components/CosmicBanner';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function HerbCard({ herb, onSelect, selected }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(herb)} className="cursor-pointer rounded-2xl p-5 transition-all"
      data-testid={`herb-card-${herb.id}`}
      style={{
        background: selected?.id === herb.id ? `linear-gradient(135deg, ${herb.color}22, ${herb.color}08)` : 'rgba(15,17,28,0.6)',
        border: `1px solid ${selected?.id === herb.id ? herb.color + '55' : 'rgba(248,250,252,0.06)'}`,
        backdropFilter: 'blur(12px)',
      }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${herb.color}20`, boxShadow: `0 0 20px ${herb.color}15` }}>
          <Leaf size={18} style={{ color: herb.color }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{herb.name}</p>
          <p className="text-[10px] italic" style={{ color: 'rgba(248,250,252,0.35)' }}>{herb.latin}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {herb.properties.slice(0, 3).map(p => (
          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${herb.color}15`, color: herb.color, border: `1px solid ${herb.color}25` }}>{p}</span>
        ))}
      </div>
      <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>Parts: {herb.parts_used} | Energy: {herb.energy}</p>
    </motion.div>
  );
}

function HerbDetail({ herb, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 mb-6" data-testid="herb-detail"
      style={{ background: 'rgba(15,17,28,0.8)', border: `1px solid ${herb.color}30`, backdropFilter: 'blur(24px)' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{herb.name}</h3>
          <p className="text-xs italic mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>{herb.latin} | {herb.family} family</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: `${herb.color}08`, border: `1px solid ${herb.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: herb.color }}>Taste</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{herb.taste}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: `${herb.color}08`, border: `1px solid ${herb.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: herb.color }}>Energy</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{herb.energy}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: `${herb.color}08`, border: `1px solid ${herb.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: herb.color }}>Parts</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{herb.parts_used}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: herb.color }}>Traditional Use</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.65)' }}>{herb.traditional_use}</p>
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: herb.color }}>Body Systems</p>
        <div className="flex flex-wrap gap-1.5">
          {herb.systems.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${herb.color}12`, color: herb.color, border: `1px solid ${herb.color}20` }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: herb.color }}>Preparations</p>
        {herb.preparations.map((p, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <ChevronRight size={12} style={{ color: herb.color, marginTop: 2 }} />
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.7)' }}>{p}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: herb.color }}>Dosage</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{herb.dosage}</p>
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: herb.color }}>Spiritual</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{herb.spiritual}</p>
      </div>

      <div className="rounded-xl p-3" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: '#EAB308' }}>Caution</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{herb.caution}</p>
      </div>
    </motion.div>
  );
}

export default function Herbology() {
  const [herbs, setHerbs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/herbology/herbs`)
      .then(r => setHerbs(r.data.herbs))
      .catch(() => toast.error('Failed to load herbs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = herbs.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.properties.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
    h.systems.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#22C55E' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto" data-testid="herbology-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#22C55E' }}>
            <Leaf size={12} className="inline mr-1" /> Sacred Herbology
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            The Healing Herb Garden
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ancient plant wisdom for modern wellness
          </p>
        </div>

        <CosmicBanner filter={['herbology']} compact />

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.3)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search herbs, properties, or body systems..."
              data-testid="herb-search"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected && <HerbDetail herb={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(herb => <HerbCard key={herb.id} herb={herb} onSelect={setSelected} selected={selected} />)}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.3)' }}>No herbs match your search</p>
        )}
      </motion.div>
    </div>
  );
}
