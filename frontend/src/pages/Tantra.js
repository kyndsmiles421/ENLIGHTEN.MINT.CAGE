import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Flame, Clock, ChevronRight, Activity } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_LABELS = {
  energy: { label: 'Energy Work', color: '#D8B4FE' },
  breathwork: { label: 'Breathwork', color: '#2DD4BF' },
  mantra: { label: 'Mantra', color: '#FCD34D' },
};

const CHAKRA_COLORS = {
  Root: '#EF4444', Sacral: '#FB923C', 'Solar Plexus': '#FCD34D',
  Heart: '#22C55E', Throat: '#3B82F6', 'Third Eye': '#8B5CF6', Crown: '#D8B4FE',
};

export default function Tantra() {
  const [practices, setPractices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/tantra`)
      .then(r => setPractices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? practices : practices.filter(p => p.category === filter);
  const active = selected ? practices.find(p => p.id === selected) : null;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#EF4444' }}>
            <Flame size={14} className="inline mr-2" /> The Path of Expansion
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Tantra
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Ancient practices for expanding consciousness through energy work, breathwork, and sacred sound.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {[{ id: 'all', label: 'All Practices' }, ...Object.entries(CATEGORY_LABELS).map(([id, v]) => ({ id, label: v.label }))].map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setSelected(null); }}
              className="px-4 py-2 rounded-full text-sm"
              style={{
                background: filter === f.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: `1px solid ${filter === f.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === f.id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              data-testid={`tantra-filter-${f.id}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><p style={{ color: 'var(--text-muted)' }}>Awakening practices...</p></div>
        ) : (
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <button onClick={() => setSelected(null)} className="text-sm mb-6 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}
                  data-testid="tantra-back-btn">
                  &larr; Back to practices
                </button>
                <div className="glass-card p-8 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: `${active.color}15`, border: `1px solid ${active.color}25` }}>
                      <Activity size={24} style={{ color: active.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{active.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${CATEGORY_LABELS[active.category]?.color}15`, color: CATEGORY_LABELS[active.category]?.color }}>
                          {CATEGORY_LABELS[active.category]?.label}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={10} /> {active.duration}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{active.level}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>{active.description}</p>

                  {/* Chakras */}
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Chakras Activated</p>
                    <div className="flex gap-2 flex-wrap">
                      {active.chakras.map(c => (
                        <span key={c} className="text-xs px-3 py-1.5 rounded-full"
                          style={{ background: `${CHAKRA_COLORS[c]}15`, color: CHAKRA_COLORS[c], border: `1px solid ${CHAKRA_COLORS[c]}20` }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Step-by-Step Practice</p>
                    <div className="mb-4 flex items-center gap-3 flex-wrap">
                      <NarrationPlayer
                        text={`${active.name}. ${active.description}. Let us begin. ${active.instructions.join('. ')}. Take a moment to rest in stillness and integrate this practice.`}
                        label="Guided Narration"
                        color={active.color}
                      />
                      <DeepDive topic={active.name} category="tantra" color={active.color} label="AI Deep Dive" />
                    </div>
                    <div className="space-y-3">
                      {active.instructions.map((step, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex gap-4 items-start">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{ background: `${active.color}15`, color: active.color, border: `1px solid ${active.color}25` }}>
                            {i + 1}
                          </div>
                          <p className="text-sm leading-relaxed pt-1" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p, i) => (
                  <motion.button key={p.id} onClick={() => setSelected(p.id)}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="glass-card glass-card-hover p-6 text-left"
                    data-testid={`tantra-${p.id}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                        <Activity size={20} style={{ color: p.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs" style={{ color: CATEGORY_LABELS[p.category]?.color }}>{CATEGORY_LABELS[p.category]?.label}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.duration}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {p.chakras.slice(0, 3).map(c => (
                        <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: CHAKRA_COLORS[c] }} title={c} />
                      ))}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.level}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
