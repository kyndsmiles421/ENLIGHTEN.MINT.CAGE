import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Trophy, TrendingUp, BarChart3, Calendar,
  Wind, Timer, Heart, BookOpen, Star, MessageCircle,
  Eye, Zap, Sparkles, Atom, Moon, Flame, Users
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  wind: Wind, timer: Timer, heart: Heart, 'book-open': BookOpen,
  star: Star, 'message-circle': MessageCircle, eye: Eye, zap: Zap,
  sparkles: Sparkles, atom: Atom, moon: Moon, flame: Flame, users: Users,
};

export default function Analytics() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [achRes, anaRes] = await Promise.all([
          axios.get(`${API}/achievements`, { headers: authHeaders }),
          axios.get(`${API}/achievements/analytics`, { headers: authHeaders }),
        ]);
        setAchievements(achRes.data);
        setAnalytics(anaRes.data);
        // Record today's coherence
        axios.post(`${API}/achievements/record-coherence`, {}, { headers: authHeaders }).catch(() => {});
      } catch {}
      setLoading(false);
    };
    load();
  }, [authHeaders]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'activity', label: 'Activity', icon: Calendar },
  ];

  const maxActivity = analytics?.daily_activity ? Math.max(...analytics.daily_activity.map(d => d.total), 1) : 1;

  return (
    <div className="min-h-screen immersive-page pt-20 pb-24 px-4" style={{ background: 'var(--bg-primary)' }} data-testid="analytics-page">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 group" data-testid="analytics-back-btn">
          <ArrowLeft size={14} style={{ color: 'var(--text-muted)' }} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Back</span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-light mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Your Journey
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Practice analytics, achievements, and growth</p>
          </div>

          {analytics && (
            <div className="flex gap-4">
              {[
                { label: 'Sessions', value: analytics.totals.all_sessions, color: '#C084FC' },
                { label: 'Streak', value: analytics.streak.current, color: '#FCD34D' },
                { label: 'Longest', value: analytics.streak.longest, color: '#2DD4BF' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 p-1 rounded-xl" style={{ background: 'rgba(248,250,252,0.02)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.08)' : 'transparent',
                color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(192,132,252,0.15)' : '1px solid transparent',
              }}
              data-testid={`analytics-tab-${t.id}`}
            >
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {tab === 'overview' && analytics && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Feature Usage */}
                <div className="p-6 mb-6" data-testid="analytics-feature-usage">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Feature Usage</p>
                  <div className="space-y-3">
                    {analytics.feature_usage.map(f => {
                      const maxCount = Math.max(...analytics.feature_usage.map(x => x.count), 1);
                      const Icon = ICON_MAP[f.icon] || Star;
                      return (
                        <div key={f.name} className="flex items-center gap-3">
                          <Icon size={14} style={{ color: f.color }} className="flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.name}</span>
                              <span className="text-xs font-medium" style={{ color: f.color }}>{f.count}</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: f.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(f.count / maxCount) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coherence History */}
                <div className="p-6 mb-6" data-testid="analytics-coherence-history">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Coherence History</p>
                  {analytics.coherence_history.length > 0 ? (
                    <div className="flex items-end gap-1 h-32">
                      {analytics.coherence_history.slice().reverse().map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{h.score}</span>
                          <motion.div
                            className="w-full rounded-t"
                            style={{
                              background: h.score >= 80 ? '#00E5FF' : h.score >= 55 ? '#C084FC' : h.score >= 30 ? '#FCD34D' : 'rgba(248,250,252,0.1)',
                              minHeight: 4,
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${(h.score / 100) * 96}px` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                          />
                          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{h.date?.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
                      Coherence history will appear as you practice daily
                    </p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Sessions', value: analytics.totals.all_sessions, color: '#C084FC' },
                    { label: 'Divinations', value: analytics.totals.all_divinations, color: '#E879F9' },
                    { label: 'Sage Chats', value: analytics.totals.all_coaching, color: '#38BDF8' },
                  ].map(s => (
                    <div key={s.label} className="p-4 text-center">
                      <p className="text-2xl font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
                      <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Achievements Tab */}
            {tab === 'achievements' && achievements && (
              <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#FCD34D' }}>{achievements.earned}</span> / {achievements.total} unlocked
                  </p>
                  <div className="h-1.5 w-32 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                    <div className="h-full rounded-full" style={{ background: '#FCD34D', width: `${(achievements.earned / achievements.total) * 100}%` }} />
                  </div>
                </div>

                {achievements.newly_unlocked.length > 0 && (
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                    className="p-4 mb-6 text-center"
                    style={{ border: '1px solid rgba(252,211,77,0.2)', background: 'rgba(252,211,77,0.03)' }}>
                    <Trophy size={20} className="mx-auto mb-2" style={{ color: '#FCD34D' }} />
                    <p className="text-sm font-medium" style={{ color: '#FCD34D' }}>New Achievement{achievements.newly_unlocked.length > 1 ? 's' : ''} Unlocked!</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {achievements.newly_unlocked.map(id => achievements.achievements.find(a => a.id === id)?.name).join(', ')}
                    </p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="achievements-grid">
                  {achievements.achievements.map((a, i) => {
                    const Icon = ICON_MAP[a.icon] || Trophy;
                    return (
                      <motion.div key={a.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-4 flex items-center gap-3 transition-all"
                        style={{
                          opacity: a.earned ? 1 : 0.35,
                          border: a.earned ? `1px solid ${a.color}18` : undefined,
                        }}
                        data-testid={`achievement-${a.id}`}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: a.earned ? `${a.color}12` : 'rgba(248,250,252,0.03)',
                            border: `1px solid ${a.earned ? `${a.color}25` : 'rgba(248,250,252,0.05)'}`,
                          }}>
                          <Icon size={16} style={{ color: a.earned ? a.color : 'var(--text-muted)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium" style={{ color: a.earned ? a.color : 'var(--text-muted)' }}>{a.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
                        </div>
                        {a.earned && (
                          <div className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${a.color}15`, color: a.color }}>
                            Earned
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Activity Tab */}
            {tab === 'activity' && analytics && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="p-6 mb-6" data-testid="analytics-daily-activity">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                    Daily Activity — Last 14 Days
                  </p>
                  <div className="flex items-end gap-1.5 h-36">
                    {analytics.daily_activity.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px]" style={{ color: d.total > 0 ? '#C084FC' : 'var(--text-muted)' }}>{d.total || ''}</span>
                        <div className="w-full flex flex-col-reverse gap-px" style={{ height: `${Math.max((d.total / maxActivity) * 112, d.total > 0 ? 8 : 2)}px` }}>
                          {d.moods > 0 && <div className="rounded-t" style={{ height: `${(d.moods / d.total) * 100}%`, background: '#FDA4AF', minHeight: 2 }} />}
                          {d.journals > 0 && <div style={{ height: `${(d.journals / d.total) * 100}%`, background: '#86EFAC', minHeight: 2 }} />}
                          {d.meditations > 0 && <div style={{ height: `${(d.meditations / d.total) * 100}%`, background: '#C084FC', minHeight: 2 }} />}
                          {d.breathwork > 0 && <div className="rounded-b" style={{ height: `${(d.breathwork / d.total) * 100}%`, background: '#2DD4BF', minHeight: 2 }} />}
                          {d.total === 0 && <div className="rounded" style={{ height: 2, background: 'rgba(248,250,252,0.06)' }} />}
                        </div>
                        <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                          {d.date.slice(8)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {[
                      { label: 'Moods', color: '#FDA4AF' },
                      { label: 'Journal', color: '#86EFAC' },
                      { label: 'Meditate', color: '#C084FC' },
                      { label: 'Breathe', color: '#2DD4BF' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Streak Card */}
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Streak</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { label: 'Current', value: analytics.streak.current, color: '#FCD34D' },
                      { label: 'Longest', value: analytics.streak.longest, color: '#FB923C' },
                      { label: 'Total Days', value: analytics.streak.total_days, color: '#2DD4BF' },
                    ].map(s => (
                      <div key={s.label}>
                        <p className="text-3xl font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
                        <p className="text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
