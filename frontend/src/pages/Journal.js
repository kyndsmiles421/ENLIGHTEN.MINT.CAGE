import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import CelebrationBurst from '../components/CelebrationBurst';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Journal() {
  const { user, authHeaders } = useAuth();
  const { playCelebration } = useSensory();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/journal`, { headers: authHeaders })
        .then(res => setEntries(res.data))
        .catch(() => {});
    }
  }, [user, authHeaders]);

  const submit = async () => {
    if (!user) { toast.error('Sign in to write in your journal'); return; }
    if (!title.trim() || !content.trim()) { toast.error('Title and content are needed'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/journal`, {
        title, content, mood: mood || null,
      }, { headers: authHeaders });
      setEntries([res.data, ...entries]);
      setTitle('');
      setContent('');
      setMood('');
      setShowForm(false);
      setCelebrating(true);
      playCelebration();
      toast.success('Entry saved to your sacred journal');
    } catch {
      toast.error('Could not save entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`${API}/journal/${id}`, { headers: authHeaders });
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry released');
    } catch {
      toast.error('Could not delete');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#86EFAC' }}>Journal</p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Sacred Reflections
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Pour your thoughts into this vessel. Writing is the alchemy of the soul.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-glass flex items-center gap-2 mt-2"
              data-testid="journal-new-entry-btn"
            >
              <Plus size={16} />
              New Entry
            </button>
          </div>
        </motion.div>

        {/* New Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="glass-card p-8 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-glass w-full"
                    placeholder="What's this reflection about?"
                    data-testid="journal-title-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Your Thoughts</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="input-glass w-full h-48 resize-none"
                    placeholder="Let your thoughts flow freely..."
                    data-testid="journal-content-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Current Mood (optional)</label>
                  <input
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="input-glass w-full"
                    placeholder="Peaceful, Reflective, Grateful..."
                    data-testid="journal-mood-input"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="btn-glass glow-primary"
                    data-testid="journal-save-btn"
                    style={{ opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Saving...' : 'Save Reflection'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn-glass" style={{ background: 'transparent' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries */}
        {!user ? (
          <div className="glass-card p-12 text-center">
            <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
              Sign in to begin your journal practice.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
              Your journal awaits its first words.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="w-full p-6 text-left flex items-center justify-between"
                  data-testid={`journal-entry-${i}`}
                >
                  <div>
                    <h3 className="text-lg font-normal mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                      {entry.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(entry.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.mood && (
                      <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {entry.mood}
                      </span>
                    )}
                    {expanded === entry.id ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </button>
                <AnimatePresence>
                  {expanded === entry.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-white/5 pt-4">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                            {entry.content}
                          </p>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="mt-4 flex items-center gap-2 text-xs"
                            style={{ color: 'var(--text-muted)' }}
                            data-testid={`journal-delete-${i}`}
                          >
                            <Trash2 size={12} /> Release this entry
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
