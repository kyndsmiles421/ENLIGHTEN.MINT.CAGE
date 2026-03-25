import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Zap, ChevronRight, Sparkles, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [aiGuide, setAiGuide] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/exercises`)
      .then(res => setExercises(res.data))
      .catch(() => toast.error('Could not load exercises'));
  }, []);

  const filtered = filter === 'all' ? exercises : exercises.filter(e => e.category === filter);

  const getAIGuide = async (exerciseName) => {
    setAiLoading(true);
    setAiGuide(null);
    try {
      const res = await axios.post(`${API}/exercises/ai-guide`, { topic: exerciseName });
      setAiGuide(res.data.guide);
    } catch {
      toast.error('Could not generate guide');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FCD34D' }}>
            <Zap size={14} className="inline mr-2" />
            Energy Practices
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Qigong & Tai Chi
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Ancient movement arts for cultivating life force energy and harmonizing body, mind, and spirit.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-10">
          {[{ k: 'all', l: 'All Practices' }, { k: 'qigong', l: 'Qigong' }, { k: 'tai_chi', l: 'Tai Chi' }].map(f => (
            <button
              key={f.k}
              onClick={() => { setFilter(f.k); setSelected(null); }}
              className="px-5 py-2 rounded-full text-sm"
              style={{
                background: filter === f.k ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${filter === f.k ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === f.k ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
              }}
              data-testid={`exercise-filter-${f.k}`}
            >
              {f.l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercise List */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((ex, i) => (
              <motion.button
                key={ex.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelected(ex); setAiGuide(null); }}
                className="glass-card w-full text-left p-5 flex items-center gap-4 group"
                style={{
                  borderColor: selected?.id === ex.id ? `${ex.color}40` : 'rgba(255,255,255,0.08)',
                  transition: 'border-color 0.3s',
                }}
                data-testid={`exercise-${ex.id}`}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ex.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{ex.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      {ex.category === 'qigong' ? 'Qigong' : 'Tai Chi'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ex.duration}</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-1" />
              </motion.button>
            ))}
          </div>

          {/* Exercise Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-8 md:p-10"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-4 h-4 rounded-full" style={{ background: selected.color }} />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: selected.color }}>
                          {selected.category === 'qigong' ? 'Qigong' : 'Tai Chi'}
                        </span>
                      </div>
                      <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        {selected.name}
                      </h2>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{selected.duration}</span>
                        <span>{selected.level}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                    {selected.description}
                  </p>

                  {/* Benefits */}
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.benefits.map(b => (
                        <span key={b} className="text-xs px-3 py-1.5 rounded-full" style={{ background: `${selected.color}15`, color: selected.color, border: `1px solid ${selected.color}25` }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Practice Steps</p>
                    <div className="space-y-3">
                      {selected.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${selected.color}15`, color: selected.color, fontSize: '0.7rem', fontWeight: 700 }}
                          >
                            {i + 1}
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Guide */}
                  <div className="border-t border-white/5 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                        <Sparkles size={12} className="inline mr-2" style={{ color: 'var(--accent-gold)' }} />
                        AI-Guided Practice
                      </p>
                      <button
                        onClick={() => getAIGuide(selected.name)}
                        disabled={aiLoading}
                        className="btn-glass text-sm px-4 py-2 flex items-center gap-2"
                        data-testid="exercise-ai-guide-btn"
                        style={{ opacity: aiLoading ? 0.6 : 1 }}
                      >
                        {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {aiLoading ? 'Generating...' : 'Get AI Guide'}
                      </button>
                    </div>
                    {aiGuide && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="glass-card p-6 mt-4"
                        style={{ background: 'rgba(252,211,77,0.03)', borderColor: 'rgba(252,211,77,0.1)' }}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="exercise-ai-guide-text">
                          {aiGuide}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center"
                >
                  <Zap size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                  <p className="text-lg mt-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                    Select a practice to begin
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    Each exercise cultivates different aspects of your energy body
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
