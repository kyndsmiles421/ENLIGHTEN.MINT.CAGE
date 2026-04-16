import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Timer, Loader2, Plus, Trash2, Clock, Brain, Star } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TYPES = ['silent', 'guided', 'breath-focused', 'mantra', 'body-scan', 'visualization', 'loving-kindness', 'walking'];
const MOODS = ['calm', 'focused', 'anxious', 'restless', 'peaceful', 'energized', 'tired', 'grateful'];

export default function MeditationHistory() {
  const { token, authHeaders } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ type: 'silent', duration_minutes: 10, focus: 'breath', intention: '', notes: '', mood_before: '', mood_after: '', depth_rating: 5 });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/meditation-history`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [token]);

  const logSession = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/meditation-history/log`, form, { headers: authHeaders });
      toast.success('Session logged');
      setShowLog(false);
      setForm({ type: 'silent', duration_minutes: 10, focus: 'breath', intention: '', notes: '', mood_before: '', mood_after: '', depth_rating: 5 });
      fetch();
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const sessions = [...(data?.sessions || []), ...(data?.guided_sessions || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const stats = data?.stats;
  const inputStyle = { background: 'transparent', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' };

  return (
    <div className="min-h-screen immersive-page pt-24 pb-20 px-4 max-w-3xl mx-auto" data-testid="meditation-history-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D8B4FE' }}>
            <Timer size={12} className="inline mr-1" /> Practice Timeline
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Meditation History
          </h1>
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to view history</p>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={28} style={{ color: '#D8B4FE' }} /></div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(216,180,254,0.06)', border: '1px solid rgba(216,180,254,0.12)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#D8B4FE' }}>{stats.total_sessions}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Sessions</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(216,180,254,0.06)', border: '1px solid rgba(216,180,254,0.12)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#D8B4FE' }}>{stats.total_minutes}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Minutes</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(216,180,254,0.06)', border: '1px solid rgba(216,180,254,0.12)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#D8B4FE' }}>{stats.avg_duration}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Avg Min</p>
                </div>
              </div>
            )}

            {/* Log Button */}
            <button onClick={() => setShowLog(!showLog)} data-testid="toggle-log-form"
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(216,180,254,0.1)', border: '1px solid rgba(216,180,254,0.2)', color: '#D8B4FE' }}>
              <Plus size={16} />{showLog ? 'Cancel' : 'Log Meditation Session'}
            </button>

            {/* Log Form */}
            {showLog && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 mb-6" data-testid="meditation-log-form"
                style={{ background: 'transparent', border: '1px solid rgba(216,180,254,0.1)' }}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} data-testid="med-type"
                      className="w-full px-3 py-2 rounded-xl text-xs capitalize" style={inputStyle}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Duration (min)</label>
                    <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: +e.target.value })}
                      min={1} max={180} className="w-full px-3 py-2 rounded-xl text-xs" style={inputStyle} data-testid="med-duration" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Mood Before</label>
                    <select value={form.mood_before} onChange={e => setForm({ ...form, mood_before: e.target.value })} data-testid="med-mood-before"
                      className="w-full px-3 py-2 rounded-xl text-xs" style={inputStyle}>
                      <option value="">Select...</option>
                      {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Mood After</label>
                    <select value={form.mood_after} onChange={e => setForm({ ...form, mood_after: e.target.value })} data-testid="med-mood-after"
                      className="w-full px-3 py-2 rounded-xl text-xs" style={inputStyle}>
                      <option value="">Select...</option>
                      {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <input type="text" value={form.intention} onChange={e => setForm({ ...form, intention: e.target.value })}
                  placeholder="Your intention..." className="w-full px-3 py-2 rounded-xl text-xs mb-3" style={inputStyle} data-testid="med-intention" />
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Session notes..." rows={2} className="w-full px-3 py-2 rounded-xl text-xs mb-3 resize-none" style={inputStyle} data-testid="med-notes" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={14} style={{ color: '#D8B4FE' }} />
                    <span className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>Depth: {form.depth_rating}/10</span>
                    <input type="range" min={1} max={10} value={form.depth_rating}
                      onChange={e => setForm({ ...form, depth_rating: +e.target.value })} data-testid="med-depth" className="w-24" />
                  </div>
                  <button onClick={logSession} disabled={saving} data-testid="save-meditation"
                    className="px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(216,180,254,0.15)', border: '1px solid rgba(216,180,254,0.3)', color: '#D8B4FE' }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Session'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Session List */}
            {sessions.length > 0 ? (
              <div className="space-y-3" data-testid="session-list">
                {sessions.map(s => (
                  <div key={s.id} className="rounded-xl p-4"
                    style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.06)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Brain size={14} style={{ color: '#D8B4FE' }} />
                        <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{s.type || 'Meditation'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(216,180,254,0.1)', color: '#D8B4FE' }}>
                          {s.duration_minutes || s.duration || '?'} min
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {s.intention && <p className="text-[10px] italic" style={{ color: 'rgba(248,250,252,0.35)' }}>{s.intention}</p>}
                    {s.notes && <p className="text-[10px] mt-1" style={{ color: 'rgba(248,250,252,0.3)' }}>{s.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm py-8" style={{ color: 'rgba(248,250,252,0.3)' }}>No meditation sessions recorded yet</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
