import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Moon, Sparkles, Loader2, Trash2, Calendar, Eye, Search, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const MOODS = ['peaceful','joyful','anxious','confused','mysterious','frightening','neutral','profound'];

function NewDreamForm({ onSaved, symbols }) {
  const { authHeaders } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [vividness, setVividness] = useState(5);
  const [lucid, setLucid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState('');

  const interpret = async () => {
    if (!content.trim()) { toast.error('Write your dream first'); return; }
    setInterpreting(true);
    try {
      const r = await axios.post(`${API}/dreams/interpret`, { content }, { headers: authHeaders });
      setInterpretation(r.data.interpretation);
    } catch { toast.error('Interpretation failed'); }
    setInterpreting(false);
  };

  const save = async () => {
    if (!content.trim()) { toast.error('Describe your dream'); return; }
    setSaving(true);
    const found = Object.keys(symbols).filter(k => content.toLowerCase().includes(k));
    try {
      await axios.post(`${API}/dreams`, {
        title: title.trim() || 'Untitled Dream', content: content.trim(), mood, vividness, lucid, symbols: found, interpretation,
      }, { headers: authHeaders });
      toast.success('Dream saved');
      setTitle(''); setContent(''); setMood('neutral'); setVividness(5); setLucid(false); setInterpretation('');
      onSaved();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <div className="glass-card p-6 mb-8" data-testid="dream-form">
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#A78BFA' }}>
        <Moon size={12} className="inline mr-1" /> Record a Dream
      </p>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Dream title (optional)"
        className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent mb-3"
        style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="dream-title" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your dream in as much detail as you can remember..."
        rows={5} className="w-full px-4 py-3 rounded-xl text-sm bg-transparent resize-none leading-relaxed mb-3"
        style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="dream-content" />

      <div className="flex gap-4 flex-wrap mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Mood</p>
          <select value={mood} onChange={e => setMood(e.target.value)} className="input-glass text-sm" data-testid="dream-mood">
            {MOODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Vividness (1-10)</p>
          <input type="range" min={1} max={10} value={vividness} onChange={e => setVividness(parseInt(e.target.value))}
            className="w-32" data-testid="dream-vividness" />
          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{vividness}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={lucid} onChange={e => setLucid(e.target.checked)} className="rounded" data-testid="dream-lucid" />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Lucid dream</span>
        </label>
      </div>

      {interpretation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-4" style={{ borderColor: 'rgba(167,139,250,0.15)' }} data-testid="dream-interpretation">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A78BFA' }}>AI Interpretation</p>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{interpretation}</p>
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={interpret} disabled={interpreting || !content.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.15)', opacity: content.trim() ? 1 : 0.4 }}
          data-testid="dream-interpret-btn">
          {interpreting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {interpreting ? 'Interpreting...' : 'AI Interpret'}
        </button>
        <button onClick={save} disabled={saving || !content.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.15)', opacity: content.trim() ? 1 : 0.4 }}
          data-testid="dream-save-btn">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Moon size={12} />}
          Save Dream
        </button>
      </div>
    </div>
  );
}

function DreamEntry({ dream, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(dream.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const moodColors = { peaceful: '#22C55E', joyful: '#FCD34D', anxious: '#FB923C', confused: '#06B6D4', mysterious: '#A78BFA', frightening: '#EF4444', neutral: '#6B7280', profound: '#D4AF37' };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden" data-testid={`dream-${dream.id}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left flex items-start gap-3">
        <Moon size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dream.title}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${moodColors[dream.mood] || '#6B7280'}10`, color: moodColors[dream.mood] || '#6B7280' }}>{dream.mood}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{dream.moon_phase}</span>
            {dream.lucid && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.1)', color: '#A78BFA' }}>Lucid</span>}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <p className="text-sm leading-relaxed mt-3 mb-3 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{dream.content}</p>
              {dream.symbols?.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Symbols Found</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {dream.symbols.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.08)', color: '#A78BFA' }}>{s}</span>)}
                  </div>
                </div>
              )}
              {dream.interpretation && (
                <div className="glass-card p-4 mb-3" style={{ borderColor: 'rgba(167,139,250,0.1)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#A78BFA' }}>Interpretation</p>
                  <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{dream.interpretation}</p>
                </div>
              )}
              <button onClick={() => onDelete(dream.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all" style={{ color: 'var(--text-muted)' }} data-testid={`delete-dream-${dream.id}`}>
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SymbolLibrary({ symbols }) {
  const [search, setSearch] = useState('');
  const filtered = search ? Object.entries(symbols).filter(([k]) => k.includes(search.toLowerCase())) : Object.entries(symbols);

  return (
    <div data-testid="symbol-library">
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbols..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent" style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="symbol-search" />
      </div>
      <div className="space-y-2">
        {filtered.map(([key, sym]) => (
          <div key={key} className="glass-card p-4">
            <p className="text-sm font-medium capitalize mb-1" style={{ color: 'var(--text-primary)' }}>{key.replace('_', ' ')}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sym.meaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dreams() {
  const { authHeaders, user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [symbols, setSymbols] = useState({});
  const [moonPhase, setMoonPhase] = useState(null);
  const [tab, setTab] = useState('journal');
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      axios.get(`${API}/dreams`, { headers: authHeaders }).then(r => setDreams(r.data.dreams)),
      axios.get(`${API}/dream-symbols`).then(r => setSymbols(r.data.symbols)),
      axios.get(`${API}/moon-phase`).then(r => setMoonPhase(r.data.phase)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/dreams/${id}`, { headers: authHeaders });
      setDreams(prev => prev.filter(d => d.id !== id));
      toast.success('Dream deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: 'var(--text-muted)' }} /></div>;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" data-testid="dreams-page">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#A78BFA' }}>
                <Moon size={14} className="inline mr-2" /> Dream Journal
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                The Dreamscape
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Record your dreams, discover their symbols, and receive AI-powered spiritual interpretations.
              </p>
            </div>
            {moonPhase && (
              <div className="glass-card p-3 text-center flex-shrink-0" data-testid="moon-phase-display">
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Moon</p>
                <p className="text-xs font-medium" style={{ color: '#FCD34D' }}>{moonPhase.name}</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex rounded-xl overflow-hidden mb-8" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ id: 'journal', label: 'Journal' }, { id: 'symbols', label: 'Symbol Library' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 px-4 py-2.5 text-xs font-medium transition-all"
              style={{ background: tab === t.id ? 'rgba(167,139,250,0.12)' : 'transparent', color: tab === t.id ? '#A78BFA' : 'var(--text-muted)' }}
              data-testid={`dream-tab-${t.id}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'journal' ? (
          <>
            <NewDreamForm onSaved={load} symbols={symbols} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
              {dreams.length} Dream{dreams.length !== 1 ? 's' : ''} Recorded
            </p>
            <div className="space-y-3" data-testid="dream-list">
              {dreams.map(d => <DreamEntry key={d.id} dream={d} onDelete={handleDelete} />)}
              {dreams.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No dreams recorded yet. Start by writing one above.</p>}
            </div>
          </>
        ) : (
          <SymbolLibrary symbols={symbols} />
        )}
      </div>
    </div>
  );
}
