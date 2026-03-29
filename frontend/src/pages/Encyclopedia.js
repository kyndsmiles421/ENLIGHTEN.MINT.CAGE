import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, BookOpen, Loader2, Search, ChevronRight, Globe, Sparkles, ScrollText, Users, Star, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Tradition Card ─── */
function TraditionCard({ t, onClick }) {
  return (
    <motion.button whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={`tradition-card-${t.id}`}
      className="rounded-2xl p-5 text-left w-full transition-all"
      style={{ background: 'rgba(15,17,28,0.5)', border: `1px solid ${t.color}10`, backdropFilter: 'blur(12px)' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: `${t.color}10`, border: `1px solid ${t.color}15` }}>
          <Globe size={20} style={{ color: t.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{t.name}</h3>
          <p className="text-[10px] mb-1.5" style={{ color: t.color }}>{t.origin} &middot; {t.era}</p>
          <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{t.overview}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${t.color}08`, color: t.color }}>
              {t.concept_count} concepts
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
              {t.text_count} sacred texts
            </span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}

/* ─── Tradition Detail View ─── */
function TraditionDetail({ tradition, onBack, onExplore, exploring, exploreResult }) {
  const t = tradition;
  return (
    <div className="max-w-3xl mx-auto" data-testid="tradition-detail">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-1.5 mb-5 text-xs transition-colors hover:opacity-80"
        style={{ color: 'var(--text-muted)' }} data-testid="encyclopedia-back-btn">
        <ArrowLeft size={14} /> All Traditions
      </button>

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(15,17,28,0.5)', border: `1px solid ${t.color}12`, backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: `${t.color}12`, border: `1px solid ${t.color}20` }}>
            <Globe size={24} style={{ color: t.color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</h1>
            <p className="text-xs" style={{ color: t.color }}>{t.origin} &middot; {t.era}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.overview}</p>
      </div>

      {/* Key Concepts */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles size={14} style={{ color: t.color }} /> Key Teachings
        </h2>
        <div className="space-y-2">
          {(t.key_concepts || []).map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl p-4" style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-xs font-semibold mb-1" style={{ color: t.color }}>{c.name}</h3>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.desc}</p>
                </div>
                <button onClick={() => onExplore(t.name, c.name)}
                  data-testid={`explore-concept-${i}`}
                  className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: `${t.color}08`, border: `1px solid ${t.color}15` }}
                  title="Ask deeper">
                  <MessageCircle size={11} style={{ color: t.color }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sacred Texts */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <ScrollText size={14} style={{ color: t.color }} /> Sacred Texts
        </h2>
        <div className="flex flex-wrap gap-2">
          {(t.sacred_texts || []).map((text, i) => (
            <button key={i} onClick={() => onExplore(t.name, null, `Tell me about the sacred text "${text}" in the ${t.name} tradition. What does it contain, why is it important, and what key teachings does it offer?`)}
              data-testid={`sacred-text-${i}`}
              className="text-[10px] px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
              style={{ background: `${t.color}08`, border: `1px solid ${t.color}15`, color: t.color }}>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Notable Figures */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users size={14} style={{ color: t.color }} /> Notable Figures
        </h2>
        <div className="flex flex-wrap gap-2">
          {(t.notable_figures || []).map((fig, i) => (
            <button key={i} onClick={() => onExplore(t.name, null, `Tell me about ${fig} and their role in the ${t.name} tradition. What were their key teachings, experiences, and lasting impact?`)}
              data-testid={`notable-figure-${i}`}
              className="text-[10px] px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
              {fig}
            </button>
          ))}
        </div>
      </div>

      {/* Practices */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Star size={14} style={{ color: t.color }} /> Practices
        </h2>
        <div className="flex flex-wrap gap-2">
          {(t.practices || []).map((p, i) => (
            <button key={i} onClick={() => onExplore(t.name, null, `Explain the practice of "${p}" in the ${t.name} tradition. How is it done, what are its benefits, and how can a beginner start?`)}
              data-testid={`practice-${i}`}
              className="text-[10px] px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* AI Exploration Result */}
      <AnimatePresence>
        {(exploring || exploreResult) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6" id="explore-result"
            style={{ background: `linear-gradient(135deg, ${t.color}08, rgba(15,17,28,0.6))`, border: `1px solid ${t.color}15`, backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} style={{ color: t.color }} />
              <span className="text-xs font-medium" style={{ color: t.color }}>Deep Exploration</span>
            </div>
            {exploring ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="animate-spin" size={14} style={{ color: t.color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Channeling wisdom...</span>
              </div>
            ) : (
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{exploreResult}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Question */}
      <CustomQuestion tradition={t.name} color={t.color} onExplore={onExplore} />
    </div>
  );
}

/* ─── Custom Question Box ─── */
function CustomQuestion({ tradition, color, onExplore }) {
  const [q, setQ] = useState('');
  return (
    <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(15,17,28,0.4)', border: `1px solid ${color}10` }}>
      <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <MessageCircle size={12} style={{ color }} /> Ask anything about {tradition}
      </p>
      <div className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && q.trim()) { onExplore(tradition, null, q.trim()); setQ(''); } }}
          placeholder="e.g. What is the relationship between karma and free will?"
          data-testid="encyclopedia-custom-question"
          className="flex-1 text-xs rounded-xl px-4 py-2.5 outline-none"
          style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} />
        <button onClick={() => { if (q.trim()) { onExplore(tradition, null, q.trim()); setQ(''); } }}
          data-testid="encyclopedia-ask-btn"
          className="px-3 py-2 rounded-xl transition-all"
          style={{ background: `${color}12`, border: `1px solid ${color}20`, opacity: q.trim() ? 1 : 0.4 }}>
          <Sparkles size={14} style={{ color }} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Encyclopedia() {
  const { token } = useAuth();
  const [traditions, setTraditions] = useState([]);
  const [activeTradition, setActiveTradition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [exploring, setExploring] = useState(false);
  const [exploreResult, setExploreResult] = useState('');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    axios.get(`${API}/encyclopedia/traditions`)
      .then(r => setTraditions(r.data.traditions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openTradition = async (id) => {
    try {
      const res = await axios.get(`${API}/encyclopedia/traditions/${id}`);
      setActiveTradition(res.data);
      setExploreResult('');
    } catch {
      toast.error('Could not load tradition');
    }
  };

  const explore = useCallback(async (tradition, concept, question) => {
    if (!token) { toast.error('Sign in to explore deeper'); return; }
    setExploring(true);
    setExploreResult('');
    try {
      const res = await axios.post(`${API}/encyclopedia/explore`, {
        tradition,
        concept: concept || '',
        question: question || '',
      }, { headers });
      setExploreResult(res.data.response);
      // Scroll to result
      setTimeout(() => document.getElementById('explore-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch {
      toast.error('Could not generate exploration');
    }
    setExploring(false);
  }, [token]);

  const filtered = traditions.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen immersive-page flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: '#FB923C' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-24" data-testid="encyclopedia-page">
      {!activeTradition ? (
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)', border: '1px solid rgba(251,146,60,0.1)' }}>
              <BookOpen size={32} style={{ color: '#FB923C' }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>World Spiritual Traditions</h1>
            <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              A living encyclopedia of sacred wisdom from every corner of the Earth. Explore teachings, practices, and the great seekers who illuminated the path.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search traditions..."
              data-testid="encyclopedia-search"
              className="w-full text-xs rounded-xl pl-10 pr-4 py-3 outline-none"
              style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="space-y-3">
            {filtered.map(t => (
              <TraditionCard key={t.id} t={t} onClick={() => openTradition(t.id)} />
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>No traditions found for "{searchQuery}"</p>
            )}
          </div>
        </div>
      ) : (
        <TraditionDetail
          tradition={activeTradition}
          onBack={() => setActiveTradition(null)}
          onExplore={explore}
          exploring={exploring}
          exploreResult={exploreResult}
        />
      )}
    </div>
  );
}
