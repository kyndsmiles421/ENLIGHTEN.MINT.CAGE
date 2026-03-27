import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Moon, Sparkles, Loader2, Trash2, Calendar, Eye, Search, ChevronRight, Compass, Star, TrendingUp, Image } from 'lucide-react';
import { toast } from 'sonner';
import { CosmicBanner, CosmicMiniTag } from '../components/CosmicBanner';

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
  const [dreamVisual, setDreamVisual] = useState(null);
  const [genDreamVisual, setGenDreamVisual] = useState(false);

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
          {/* AI Dream Visual */}
          {dreamVisual ? (
            <div className="rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(167,139,250,0.15)' }}>
              <img src={`data:image/png;base64,${dreamVisual}`} alt="Dream visualization" className="w-full h-40 object-cover" style={{ filter: 'saturate(1.15)' }} />
            </div>
          ) : (
            <button onClick={async () => {
              setGenDreamVisual(true);
              try {
                const r = await axios.post(`${API}/ai-visuals/dream`, { description: content.slice(0, 300) }, { headers: authHeaders, timeout: 120000 });
                setDreamVisual(r.data.image_b64);
              } catch {}
              setGenDreamVisual(false);
            }} disabled={genDreamVisual}
              data-testid="gen-dream-visual"
              className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[10px]"
              style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)', color: '#A78BFA' }}>
              {genDreamVisual ? <Loader2 size={10} className="animate-spin" /> : <Image size={10} />}
              {genDreamVisual ? 'Visualizing your dream...' : 'Generate Dream Visualization'}
            </button>
          )}
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

function DreamPatterns({ authHeaders }) {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/dreams/patterns`, { headers: authHeaders })
      .then(r => setPatterns(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={24} style={{ color: '#818CF8' }} /></div>;
  if (!patterns || patterns.total === 0) return (
    <div className="text-center py-12">
      <TrendingUp size={32} className="mx-auto mb-3" style={{ color: 'rgba(129,140,248,0.25)' }} />
      <p className="text-sm mb-1" style={{ color: 'rgba(248,250,252,0.5)' }}>Not enough data yet</p>
      <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>Log more dreams to reveal patterns in your dreamscape</p>
    </div>
  );

  const symbolEntries = Object.entries(patterns.symbol_frequency || {});
  const maxCount = symbolEntries.length > 0 ? symbolEntries[0][1] : 1;

  return (
    <div className="space-y-6" data-testid="dream-patterns">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Dreams Logged', value: patterns.total, color: '#818CF8' },
          { label: 'Lucid Dreams', value: patterns.lucid_count, color: '#22C55E' },
          { label: 'Avg Vividness', value: `${patterns.avg_vividness}/10`, color: '#D8B4FE' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'rgba(248,250,252,0.35)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Insights */}
      {patterns.insights?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#FCD34D' }}>
            <Sparkles size={10} className="inline mr-1" /> Dream Insights
          </p>
          {patterns.insights.map((ins, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4" style={{ background: `${ins.color}06`, border: `1px solid ${ins.color}12` }}>
              <p className="text-xs font-semibold mb-1" style={{ color: ins.color }}>{ins.title}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.55)' }}>{ins.text}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Symbol frequency */}
      {symbolEntries.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#A78BFA' }}>
            Recurring Symbols
          </p>
          <div className="space-y-2">
            {symbolEntries.map(([symbol, count]) => (
              <div key={symbol} className="flex items-center gap-3">
                <span className="text-xs capitalize w-24 truncate" style={{ color: 'rgba(248,250,252,0.6)' }}>{symbol}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #A78BFA, #818CF8)' }} />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color: '#A78BFA' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moon Phase Correlations */}
      {patterns.moon_correlations?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#93C5FD' }}>
            <Moon size={10} className="inline mr-1" /> Moon-Symbol Connections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {patterns.moon_correlations.map((mc, i) => (
              <div key={i} className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'rgba(147,197,253,0.04)', border: '1px solid rgba(147,197,253,0.1)' }}>
                <Moon size={14} style={{ color: '#93C5FD' }} />
                <div>
                  <p className="text-xs font-medium capitalize" style={{ color: '#F8FAFC' }}>{mc.symbol}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{mc.count}x during {mc.moon_phase}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moon Mood Map */}
      {Object.keys(patterns.moon_moods || {}).length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#FCD34D' }}>
            Moon Phase Dream Moods
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(patterns.moon_moods).map(([phase, data]) => (
              <div key={phase} className="rounded-xl px-3 py-2" style={{ background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.1)' }}>
                <p className="text-[10px] font-medium" style={{ color: '#FCD34D' }}>{phase}</p>
                <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{data.count} dreams - {data.dominant_mood}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep analysis CTA */}
      <button onClick={() => navigate('/coach')} data-testid="dream-oracle-cta"
        className="w-full rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.1)' }}>
          <Eye size={18} style={{ color: '#818CF8' }} />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>Deep Dream Analysis with Sage</p>
          <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Get cosmic interpretation through your aura, moon phase, and numerology</p>
        </div>
        <ChevronRight size={16} style={{ color: '#818CF8' }} />
      </button>
    </div>
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
          {[{ id: 'journal', label: 'Journal' }, { id: 'patterns', label: 'Patterns' }, { id: 'symbols', label: 'Symbol Library' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 px-4 py-2.5 text-xs font-medium transition-all"
              style={{ background: tab === t.id ? 'rgba(167,139,250,0.12)' : 'transparent', color: tab === t.id ? '#A78BFA' : 'var(--text-muted)' }}
              data-testid={`dream-tab-${t.id}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Cosmic Banner */}
        <CosmicBanner filter={['dreams', 'meditation', 'journal']} compact />

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
        ) : tab === 'patterns' ? (
          <DreamPatterns authHeaders={authHeaders} />
        ) : (
          <SymbolLibrary symbols={symbols} />
        )}
      </div>
    </div>
  );
}
