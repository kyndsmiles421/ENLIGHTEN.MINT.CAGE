import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Loader2, Search, Star, Heart, Check, Sparkles, ChevronRight, X, MessageCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LEVEL_BADGE = {
  Essential: { bg: '#22C55E12', color: '#22C55E', border: '#22C55E20' },
  Intermediate: { bg: '#FB923C12', color: '#FB923C', border: '#FB923C20' },
  Advanced: { bg: '#E879F912', color: '#E879F9', border: '#E879F920' },
};

function BookCard({ book, onSave, onComplete }) {
  const badge = LEVEL_BADGE[book.level] || LEVEL_BADGE.Essential;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 transition-all"
      style={{ background: 'transparent', border: `1px solid ${book.color}10`, backdropFilter: 'none'}}
      data-testid={`book-card-${book.id}`}>
      <div className="flex items-start gap-4">
        <div className="w-11 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: `${book.color}10`, border: `1px solid ${book.color}15` }}>
          <BookOpen size={18} style={{ color: book.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
          <p className="text-[10px] mb-1" style={{ color: book.color }}>{book.author}</p>
          <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{book.desc}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
              {book.level}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
              {book.tradition}
            </span>
            {book.score >= 10 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.15)' }}>
                <Star size={8} /> For You
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={() => onSave(book)}
            data-testid={`book-save-${book.id}`}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: book.saved ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${book.saved ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            <Heart size={12} style={{ color: book.saved ? '#EF4444' : 'var(--text-muted)', fill: book.saved ? '#EF4444' : 'none' }} />
          </button>
          <button onClick={() => onComplete(book)}
            data-testid={`book-complete-${book.id}`}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: book.completed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${book.completed ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            <Check size={12} style={{ color: book.completed ? '#22C55E' : 'var(--text-muted)' }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReadingList() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterView, setFilterView] = useState('all'); // all, saved, completed, foryou
  const [aiRec, setAiRec] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [interests, setInterests] = useState('');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/reading-list`, { headers });
      setData(res.data);
    } catch {
      toast.error('Could not load reading list');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('reading_list', 8); }, []);
  useEffect(() => { if (token) fetchData(); else setLoading(false); }, [token, fetchData]);

  const handleSave = async (book) => {
    const action = book.saved ? 'unsave' : 'save';
    try {
      await axios.post(`${API}/reading-list/save`, { book_id: book.id, action }, { headers });
      setData(prev => ({
        ...prev,
        all_books: prev.all_books.map(b => b.id === book.id ? { ...b, saved: !b.saved } : b),
        personalized: prev.personalized.map(b => b.id === book.id ? { ...b, saved: !b.saved } : b),
      }));
      toast.success(action === 'save' ? 'Saved to your list' : 'Removed from list');
    } catch { toast.error('Could not update'); }
  };

  const handleComplete = async (book) => {
    const action = book.completed ? 'uncomplete' : 'complete';
    try {
      await axios.post(`${API}/reading-list/save`, { book_id: book.id, action }, { headers });
      setData(prev => ({
        ...prev,
        all_books: prev.all_books.map(b => b.id === book.id ? { ...b, completed: !b.completed, saved: action === 'complete' ? false : b.saved } : b),
        personalized: prev.personalized.map(b => b.id === book.id ? { ...b, completed: !b.completed, saved: action === 'complete' ? false : b.saved } : b),
      }));
      toast.success(action === 'complete' ? 'Marked as read' : 'Unmarked');
    } catch { toast.error('Could not update'); }
  };

  const getAiRecommendation = async () => {
    if (!interests.trim()) { toast.error('Share your interests first'); return; }
    setAiLoading(true);
    setAiRec('');
    try {
      const res = await axios.post(`${API}/reading-list/ai-recommendation`, { interests, mood: 'seeking' }, { headers });
      setAiRec(res.data.recommendation);
    } catch { toast.error('Could not get recommendation'); }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: '#FB923C' }} />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen size={32} style={{ color: '#FB923C', margin: '0 auto 16px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to access your personalized reading list</p>
        </div>
      </div>
    );
  }

  const books = data?.all_books || [];
  let filtered = books.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.tradition.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterLevel && b.level !== filterLevel) return false;
    if (filterView === 'saved' && !b.saved) return false;
    if (filterView === 'completed' && !b.completed) return false;
    if (filterView === 'foryou' && b.score < 10) return false;
    return true;
  });

  const personalizedBooks = data?.personalized || [];

  return (
    <div className="min-h-screen px-4 pt-20 pb-24" data-testid="reading-list-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)', border: '1px solid rgba(251,146,60,0.1)' }}>
            <BookOpen size={32} style={{ color: '#FB923C' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Spiritual Reading List</h1>
          <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Sacred texts and wisdom books curated for your journey. {data?.explored_traditions?.length > 0 &&
              `Personalized based on your interest in ${data.explored_traditions.slice(0, 3).join(', ')}.`}
          </p>
        </div>

        {/* Personalized Section */}
        {personalizedBooks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Star size={14} style={{ color: '#FB923C' }} /> Recommended For You
            </h2>
            <div className="space-y-3">
              {personalizedBooks.slice(0, 4).map(b => (
                <BookCard key={b.id} book={b} onSave={handleSave} onComplete={handleComplete} />
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="rounded-2xl p-5 mb-8"
          style={{ background: 'transparent', border: '1px solid rgba(251,146,60,0.1)' }}>
          <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles size={12} style={{ color: '#FB923C' }} /> Ask the Cosmic Librarian
          </p>
          <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
            Describe your spiritual interests or what you're going through, and receive personalized book recommendations.
          </p>
          <div className="flex gap-2">
            <input value={interests} onChange={e => setInterests(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && getAiRecommendation()}
              placeholder="e.g. I'm drawn to meditation and want to understand consciousness..."
              data-testid="ai-reading-input"
              className="flex-1 text-xs rounded-xl px-4 py-2.5 outline-none"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} />
            <button onClick={getAiRecommendation} disabled={aiLoading}
              data-testid="ai-reading-btn"
              className="px-3 py-2 rounded-xl transition-all"
              style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)' }}>
              {aiLoading ? <Loader2 size={14} className="animate-spin" style={{ color: '#FB923C' }} /> : <Sparkles size={14} style={{ color: '#FB923C' }} />}
            </button>
          </div>
          <AnimatePresence>
            {aiRec && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl p-4" style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.1)' }}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{aiRec}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search books, authors, traditions..."
              data-testid="reading-search"
              className="w-full text-xs rounded-xl pl-10 pr-4 py-3 outline-none"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {['all', 'foryou', 'saved', 'completed'].map(v => (
              <button key={v} onClick={() => setFilterView(v)}
                data-testid={`filter-${v}`}
                className="text-[10px] px-3 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  background: filterView === v ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.03)',
                  color: filterView === v ? '#FB923C' : 'var(--text-muted)',
                  border: `1px solid ${filterView === v ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                {v === 'all' ? 'All' : v === 'foryou' ? 'For You' : v === 'saved' ? 'Saved' : 'Read'}
              </button>
            ))}
            {['Essential', 'Intermediate', 'Advanced'].map(lv => (
              <button key={lv} onClick={() => setFilterLevel(filterLevel === lv ? '' : lv)}
                className="text-[10px] px-3 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  background: filterLevel === lv ? `${LEVEL_BADGE[lv].bg}` : 'rgba(255,255,255,0.03)',
                  color: filterLevel === lv ? LEVEL_BADGE[lv].color : 'var(--text-muted)',
                  border: `1px solid ${filterLevel === lv ? LEVEL_BADGE[lv].border : 'rgba(255,255,255,0.06)'}`,
                }}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        {/* Book List */}
        <div className="space-y-3">
          {filtered.map(b => (
            <BookCard key={b.id} book={b} onSave={handleSave} onComplete={handleComplete} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>No books found for your filters</p>
          )}
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          {books.length} sacred texts &middot; {books.filter(b => b.saved).length} saved &middot; {books.filter(b => b.completed).length} read
        </p>
      </div>
    </div>
  );
}
