import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Leaf, Sparkles, Loader2 } from 'lucide-react';
import DeepDive from '../components/DeepDive';
import NarrationPlayer from '../components/NarrationPlayer';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = {
  Fire: { symbol: 'F', bg: '#B91C1C20', border: '#B91C1C40', text: '#EF4444' },
  Wood: { symbol: 'W', bg: '#15803D20', border: '#15803D40', text: '#22C55E' },
  Earth: { symbol: 'E', bg: '#92400E20', border: '#92400E40', text: '#D97706' },
  Water: { symbol: 'Wa', bg: '#1E40AF20', border: '#1E40AF40', text: '#3B82F6' },
  Air: { symbol: 'A', bg: '#6D28D920', border: '#6D28D940', text: '#A78BFA' },
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'drinks', label: 'Elixirs & Drinks' },
  { key: 'meals', label: 'Sacred Meals' },
];

export default function Nourishment() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('boost energy before meditation');

  useEffect(() => {
    axios.get(`${API}/nourishment`)
      .then(res => setItems(res.data))
      .catch(() => toast.error('Could not load nourishment data'));
  }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const getAISuggestion = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await axios.post(`${API}/nourishment/suggest`, { topic: aiTopic });
      setAiSuggestion(res.data.suggestion);
    } catch {
      toast.error('Could not get suggestion');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#22C55E' }}>
            <Leaf size={14} className="inline mr-2" />
            Sacred Nourishment
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Food for the Spirit
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Ancient recipes and healing foods that uplift your energy, nourish your body, and elevate your consciousness.
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 mb-10">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className="px-5 py-2 rounded-full text-sm"
              style={{
                background: filter === c.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${filter === c.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === c.key ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
              }}
              data-testid={`nourish-filter-${c.key}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((item, i) => {
            const elem = ELEMENT_ICONS[item.element] || ELEMENT_ICONS.Earth;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
                className="glass-card glass-card-hover p-6 cursor-pointer"
                style={{
                  borderColor: selected?.id === item.id ? `${item.color}40` : 'rgba(255,255,255,0.08)',
                }}
                data-testid={`nourish-item-${item.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: elem.bg, border: `1px solid ${elem.border}`, color: elem.text }}
                  >
                    {elem.symbol}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      {item.energy_type}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-normal mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  {item.name}
                </h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {item.description.substring(0, 120)}...
                </p>

                <AnimatePresence>
                  {selected?.id === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 pt-4 mt-2">
                        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                          {item.description}
                        </p>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Key Ingredients</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {item.ingredients.map(ing => (
                            <span key={ing} className="text-xs px-2 py-1 rounded-full" style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}25` }}>
                              {ing}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Benefits</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {item.benefits.map(b => (
                            <span key={b} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                              {b}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <NarrationPlayer text={`${item.name}. ${item.description}. Key ingredients: ${item.ingredients.join(', ')}. Benefits include: ${item.benefits.join(', ')}.`} label="Listen" color={item.color} />
                          <DeepDive topic={item.name} category="nourishment" color={item.color} label="AI Deep Dive" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* AI Suggestion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-8 md:p-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              AI Nutrition Guide
            </p>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Ask our AI nutrition guide for personalized food suggestions based on your spiritual and energy goals.
          </p>
          <div className="flex gap-3 mb-6">
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="input-glass flex-1"
              placeholder="e.g., boost energy before meditation, calm anxiety, open heart chakra..."
              data-testid="nourish-ai-input"
            />
            <button
              onClick={getAISuggestion}
              disabled={aiLoading}
              className="btn-glass flex items-center gap-2"
              data-testid="nourish-ai-btn"
              style={{ opacity: aiLoading ? 0.6 : 1 }}
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {aiLoading ? 'Channeling...' : 'Get Suggestion'}
            </button>
          </div>
          {aiSuggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card p-6"
              style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'var(--text-secondary)' }} data-testid="nourish-ai-result">
                {aiSuggestion}
              </p>
              <NarrationPlayer text={aiSuggestion} label="Listen" color="#22C55E" />
            </motion.div>
          )}
        </motion.div>
        <FeaturedVideos category="nourishment" color="#22C55E" title="Mindful Eating Videos" />
      </div>
    </div>
  );
}