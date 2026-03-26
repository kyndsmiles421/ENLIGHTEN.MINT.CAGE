import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Wine, Sparkles, Loader2, X, ChevronRight, Heart, Clock } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      <button onClick={() => onSelect(null)}
        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
        data-testid="filter-all"
        style={{
          background: !active ? 'rgba(192,132,252,0.15)' : 'rgba(15,17,28,0.4)',
          border: `1px solid ${!active ? 'rgba(192,132,252,0.3)' : 'rgba(248,250,252,0.06)'}`,
          color: !active ? '#C084FC' : 'rgba(248,250,252,0.5)',
        }}>All</button>
      {categories.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          data-testid={`filter-${c.id}`}
          style={{
            background: active === c.id ? `${c.color}18` : 'rgba(15,17,28,0.4)',
            border: `1px solid ${active === c.id ? c.color + '35' : 'rgba(248,250,252,0.06)'}`,
            color: active === c.id ? c.color : 'rgba(248,250,252,0.5)',
          }}>{c.name}</button>
      ))}
    </div>
  );
}

function ElixirCard({ elixir, onSelect }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(elixir)} className="cursor-pointer rounded-2xl p-5 transition-all"
      data-testid={`elixir-card-${elixir.id}`}
      style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${elixir.color}18`, boxShadow: `0 0 25px ${elixir.color}12` }}>
          <Wine size={20} style={{ color: elixir.color }} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{elixir.name}</p>
          <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{elixir.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
          <Clock size={10} />{elixir.prep_time}
        </span>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
          Best: {elixir.best_time}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {elixir.benefits.slice(0, 3).map(b => (
          <span key={b} className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${elixir.color}12`, color: elixir.color, border: `1px solid ${elixir.color}20` }}>{b}</span>
        ))}
      </div>
    </motion.div>
  );
}

function ElixirDetail({ elixir, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 mb-6" data-testid="elixir-detail"
      style={{ background: 'rgba(15,17,28,0.85)', border: `1px solid ${elixir.color}30`, backdropFilter: 'blur(24px)' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{elixir.name}</h3>
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>{elixir.subtitle}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: elixir.color }}>Ingredients</p>
        <div className="rounded-xl p-4" style={{ background: `${elixir.color}06`, border: `1px solid ${elixir.color}12` }}>
          {elixir.ingredients.map((ing, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: elixir.color }} />
              <p className="text-xs" style={{ color: 'rgba(248,250,252,0.7)' }}>{ing}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: elixir.color }}>Instructions</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.65)' }}>{elixir.instructions}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-3" style={{ background: `${elixir.color}08`, border: `1px solid ${elixir.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: elixir.color }}>Tradition</p>
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.65)' }}>{elixir.tradition}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: `${elixir.color}08`, border: `1px solid ${elixir.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: elixir.color }}>Intention</p>
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.65)' }}>{elixir.intention}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: elixir.color }}>Benefits</p>
        <div className="flex flex-wrap gap-1.5">
          {elixir.benefits.map(b => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${elixir.color}12`, color: elixir.color, border: `1px solid ${elixir.color}20` }}>{b}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Elixirs() {
  const [elixirs, setElixirs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/elixirs/all`)
      .then(r => { setElixirs(r.data.elixirs); setCategories(r.data.categories); })
      .catch(() => toast.error('Failed to load elixirs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory ? elixirs.filter(e => e.category === activeCategory) : elixirs;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#FB923C' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto" data-testid="elixirs-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#FB923C' }}>
            <Wine size={12} className="inline mr-1" /> Sacred Elixirs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
            Healing Elixirs & Drinks
          </h1>
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
            Ancient recipes for body, mind, and spirit
          </p>
        </div>

        <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />

        <AnimatePresence mode="wait">
          {selected && <ElixirDetail elixir={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => <ElixirCard key={e.id} elixir={e} onSelect={setSelected} />)}
        </div>
      </motion.div>
    </div>
  );
}
