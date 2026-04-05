import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Trophy, Flame, Calendar, Star, BookOpen, Heart, Brain, Sparkles, ChevronRight, Lock, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Heatmap Bar ─── */
function WeeklyHeatmap({ weeks }) {
  const maxCount = Math.max(...weeks.map(w => w.count), 1);
  return (
    <div data-testid="weekly-heatmap">
      <div className="flex items-end gap-1.5 h-32 mb-2">
        {weeks.map((w, i) => {
          const height = w.count > 0 ? Math.max(12, (w.count / maxCount) * 100) : 4;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="w-full rounded-t-md transition-all group-hover:opacity-80"
                style={{
                  background: w.count > 0
                    ? `linear-gradient(to top, ${w.top_color}40, ${w.top_color})`
                    : 'rgba(255,255,255,0.03)',
                  border: w.count > 0 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  minHeight: '4px',
                }}
              />
              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                style={{ background: 'rgba(8,10,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                <span className="font-medium">{w.count}</span> activities &middot; <span style={{ color: w.top_color }}>{w.top_category || 'None'}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 text-center text-[8px]" style={{ color: 'var(--text-muted)' }}>
            {i % 2 === 0 ? w.label : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Category Ring ─── */
function CategoryBreakdown({ categories, total }) {
  if (!categories.length) return null;
  return (
    <div data-testid="category-breakdown">
      <div className="space-y-2">
        {categories.map((c, i) => {
          const pct = total > 0 ? (c.count / total * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 text-[10px] text-right flex-shrink-0" style={{ color: c.color }}>{c.category}</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="h-full rounded-full" style={{ background: c.color }} />
              </div>
              <div className="w-8 text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{c.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Milestone Badge ─── */
function MilestoneBadge({ m, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl p-4 text-center transition-all ${m.earned ? '' : 'opacity-30'}`}
      style={{
        background: m.earned ? `${m.color}08` : 'rgba(255,255,255,0.01)',
        border: `1px solid ${m.earned ? `${m.color}20` : 'rgba(255,255,255,0.03)'}`,
      }}
      data-testid={`milestone-${m.type}-${m.threshold}`}>
      <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
        style={{
          background: m.earned ? `${m.color}15` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${m.earned ? `${m.color}25` : 'rgba(255,255,255,0.05)'}`,
        }}>
        {m.earned ? (
          <Trophy size={16} style={{ color: m.color }} />
        ) : (
          <Lock size={14} style={{ color: 'rgba(255,255,255,0.15)' }} />
        )}
      </div>
      <p className="text-[10px] font-semibold mb-0.5" style={{ color: m.earned ? m.color : 'var(--text-muted)' }}>{m.title}</p>
      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
    </motion.div>
  );
}

/* ─── Main Timeline Page ─── */
export default function GrowthTimeline() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/timeline`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => toast.error('Could not load timeline'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleShare = async () => {
    if (!data) return;
    const text = `My ENLIGHTEN.MINT.CAFE Journey:\n${data.stats.days_active} days active | ${data.milestones_earned} milestones earned | ${data.stats.unique_features} features explored | ${data.stats.ai_sessions} AI sessions\n\nJoin the collective!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Spiritual Growth', text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Journey copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen immersive-page flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: '#D8B4FE' }} />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Sparkles size={32} style={{ color: '#D8B4FE', margin: '0 auto 16px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to view your spiritual growth timeline</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { weeks, category_breakdown, milestones, stats, recent_highlights } = data;

  return (
    <div className="min-h-screen px-4 pt-20 pb-24" data-testid="growth-timeline-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Your Spiritual Journey</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stats.journey_start ? `Since ${new Date(stats.journey_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Your journey begins now'}
            </p>
          </div>
          <button onClick={handleShare} data-testid="timeline-share-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(216,180,254,0.08)', border: '1px solid rgba(216,180,254,0.15)', color: '#D8B4FE' }}>
            <Share2 size={11} /> Share Journey
          </button>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8" data-testid="timeline-stats">
          {[
            { label: 'Days Active', value: stats.days_active, color: '#D8B4FE', icon: Calendar },
            { label: 'Activities', value: stats.total_activities, color: '#818CF8', icon: Sparkles },
            { label: 'Features', value: stats.unique_features, color: '#FB923C', icon: Star },
            { label: 'AI Sessions', value: stats.ai_sessions, color: '#38BDF8', icon: Brain },
            { label: 'Best Streak', value: `${stats.max_streak}d`, color: '#FCD34D', icon: Flame },
            { label: 'Milestones', value: `${data.milestones_earned}/${data.milestones_total}`, color: '#2DD4BF', icon: Trophy },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-3 text-center">
              <s.icon size={14} style={{ color: s.color, margin: '0 auto 4px' }} />
              <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: s.color }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Activity Heatmap */}
        <div className="glass-card p-5 mb-6" data-testid="heatmap-section">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Calendar size={14} style={{ color: '#D8B4FE' }} /> 12-Week Activity
          </h2>
          <WeeklyHeatmap weeks={weeks} />
        </div>

        {/* Category Breakdown */}
        {category_breakdown.length > 0 && (
          <div className="glass-card p-5 mb-6" data-testid="categories-section">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Star size={14} style={{ color: '#FB923C' }} /> Where You Spend Time
            </h2>
            <CategoryBreakdown categories={category_breakdown} total={stats.total_activities} />
          </div>
        )}

        {/* Milestones */}
        <div className="mb-6" data-testid="milestones-section">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={14} style={{ color: '#FCD34D' }} /> Milestones
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
              {data.milestones_earned}/{data.milestones_total}
            </span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {milestones.map((m, i) => (
              <MilestoneBadge key={i} m={m} index={i} />
            ))}
          </div>
        </div>

        {/* Recent Highlights */}
        {recent_highlights.length > 0 && (
          <div className="mb-6" data-testid="highlights-section">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Sparkles size={14} style={{ color: '#818CF8' }} /> Recent Highlights
            </h2>
            <div className="space-y-2">
              {recent_highlights.map((h, i) => (
                <motion.button key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(h.page)}
                  data-testid={`highlight-${i}`}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.005]"
                  style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{h.label}</p>
                    <p className="text-[9px]" style={{ color: h.color }}>{h.category}</p>
                  </div>
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Counts */}
        <div className="glass-card p-5 mb-8" data-testid="detailed-stats">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BookOpen size={14} style={{ color: '#86EFAC' }} /> Full Journey Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Mood Check-ins', value: stats.mood_entries, color: '#FDA4AF' },
              { label: 'Journal Entries', value: stats.journal_entries, color: '#86EFAC' },
              { label: 'Blessings Sent', value: stats.blessings_sent, color: '#FDA4AF' },
              { label: 'AI Conversations', value: stats.ai_sessions, color: '#38BDF8' },
              { label: 'Books Saved', value: stats.books_saved, color: '#FB923C' },
              { label: 'Books Completed', value: stats.books_completed, color: '#22C55E' },
              { label: 'Traditions Explored', value: stats.traditions_explored, color: '#FB923C' },
              { label: 'Current Streak', value: `${stats.current_streak} days`, color: '#FCD34D' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <span className="text-sm font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA: Soul Reports */}
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          onClick={() => navigate('/soul-reports')}
          data-testid="soul-reports-cta"
          className="w-full glass-card p-5 mb-8 text-left transition-all hover:scale-[1.005] group"
          style={{ borderColor: 'rgba(216,180,254,0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(216,180,254,0.1)', border: '1px solid rgba(216,180,254,0.15)' }}>
                <Sparkles size={16} style={{ color: '#D8B4FE' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Monthly Soul Reports</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>AI-generated reflections on your spiritual journey</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#D8B4FE' }} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
