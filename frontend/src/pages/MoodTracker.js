import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MOODS = [
  { name: 'Blissful', color: '#FCD34D', gradient: 'mood-blissful' },
  { name: 'Peaceful', color: '#2DD4BF', gradient: 'mood-peaceful' },
  { name: 'Content', color: '#86EFAC', gradient: 'mood-content' },
  { name: 'Neutral', color: '#94A3B8', gradient: 'mood-neutral' },
  { name: 'Anxious', color: '#FDA4AF', gradient: 'mood-anxious' },
  { name: 'Melancholy', color: '#C084FC', gradient: 'mood-melancholy' },
  { name: 'Restless', color: '#FB923C', gradient: 'mood-restless' },
];

export default function MoodTracker() {
  const { user, authHeaders } = useAuth();
  const [selected, setSelected] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/moods`, { headers: authHeaders })
        .then(res => setHistory(res.data))
        .catch(() => {});
    }
  }, [user, authHeaders]);

  const submit = async () => {
    if (!user) { toast.error('Sign in to track your mood'); return; }
    if (!selected) { toast.error('Select a mood first'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/moods`, {
        mood: selected.name,
        intensity,
        note: note || null,
      }, { headers: authHeaders });
      setHistory([res.data, ...history]);
      setSelected(null);
      setNote('');
      setIntensity(5);
      toast.success('Mood captured');
    } catch {
      toast.error('Could not save mood');
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.slice(0, 14).reverse().map((m, i) => ({
    name: new Date(m.created_at).toLocaleDateString('en', { weekday: 'short' }),
    intensity: m.intensity,
    fill: MOODS.find(mood => mood.name === m.mood)?.color || '#94A3B8',
  }));

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--accent-rose)' }}>Mood Tracker</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Emotional Landscape
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Observe your emotions without judgment. Each feeling is a teacher.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mood Selection */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>How are you feeling?</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {MOODS.map(mood => (
                <button
                  key={mood.name}
                  onClick={() => setSelected(mood)}
                  className="glass-card p-5 text-left group"
                  style={{
                    borderColor: selected?.name === mood.name ? `${mood.color}50` : 'rgba(255,255,255,0.08)',
                    transition: 'border-color 0.3s',
                  }}
                  data-testid={`mood-${mood.name.toLowerCase()}`}
                >
                  <div className={`w-8 h-8 rounded-full mb-3 ${mood.gradient}`} />
                  <p className="text-sm font-medium" style={{ color: selected?.name === mood.name ? mood.color : 'var(--text-primary)' }}>
                    {mood.name}
                  </p>
                </button>
              ))}
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--text-muted)' }}>
                    Intensity: {intensity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full accent-purple-400"
                    data-testid="mood-intensity-slider"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--text-muted)' }}>Note (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input-glass w-full h-24 resize-none"
                    placeholder="What's on your mind?"
                    data-testid="mood-note-input"
                  />
                </div>
                <button
                  onClick={submit}
                  disabled={loading}
                  className="btn-glass glow-primary"
                  data-testid="mood-submit-btn"
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Saving...' : 'Log Mood'}
                </button>
              </motion.div>
            )}
          </div>

          {/* Mood History */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Your Journey</p>
            {chartData.length > 0 ? (
              <div className="glass-card p-6 mb-8">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(22,24,38,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }}
                    />
                    <Bar dataKey="intensity" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="glass-card p-8 text-center mb-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {user ? 'No moods logged yet. Start tracking above.' : 'Sign in to track your emotional journey.'}
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {history.slice(0, 10).map(m => {
                const moodObj = MOODS.find(mood => mood.name === m.mood);
                return (
                  <div key={m.id} className="glass-card p-4 flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${moodObj?.gradient || 'mood-neutral'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: moodObj?.color || 'var(--text-primary)' }}>{m.mood}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(m.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {m.note && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{m.note}</p>}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      {m.intensity}/10
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
