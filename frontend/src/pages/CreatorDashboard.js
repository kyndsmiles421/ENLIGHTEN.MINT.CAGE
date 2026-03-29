import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, TrendingUp, Download, MessageSquare, Heart,
  BookOpen, MessageCircle, Eye, CheckCircle, Clock, XCircle,
  AlertCircle, ChevronRight, Crown, BarChart3, Flame,
  Trash2, ArrowUpRight, Shield
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CreatorDashboard() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [features, setFeatures] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [comments, setComments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [activeTrend, setActiveTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, feat, fb, cm, usr, trend] = await Promise.all([
        axios.get(`${API}/creator/overview`, { headers: authHeaders }).then(r => r.data).catch(() => null),
        axios.get(`${API}/creator/popular-features`, { headers: authHeaders }).then(r => r.data.features || []).catch(() => []),
        axios.get(`${API}/creator/feedback`, { headers: authHeaders }).then(r => r.data.feedback || []).catch(() => []),
        axios.get(`${API}/creator/comments`, { headers: authHeaders }).then(r => r.data.comments || []).catch(() => []),
        axios.get(`${API}/creator/recent-users`, { headers: authHeaders }).then(r => r.data.users || []).catch(() => []),
        axios.get(`${API}/creator/active-trend`, { headers: authHeaders }).then(r => r.data.trend || []).catch(() => []),
      ]);
      if (!ov) { setError('Creator access only'); setLoading(false); return; }
      setOverview(ov);
      setFeatures(feat);
      setFeedback(fb);
      setComments(cm);
      setRecentUsers(usr);
      setActiveTrend(trend);
    } catch {
      setError('Failed to load creator data');
    }
    setLoading(false);
  };

  const updateFeedbackStatus = async (id, status) => {
    try {
      await axios.put(`${API}/creator/feedback/${id}/status`, { status }, { headers: authHeaders });
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch {}
  };

  const deleteComment = async (id) => {
    try {
      await axios.delete(`${API}/creator/comments/${id}`, { headers: authHeaders });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Loading Creator Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield size={32} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
          <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-xs underline" style={{ color: 'var(--text-muted)' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'feedback', label: `Feedback (${overview?.new_feedback || 0})`, icon: MessageSquare },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'features', label: 'Popular', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-10 immersive-page" style={{ background: 'transparent' }} data-testid="creator-dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <Crown size={18} style={{ color: '#EAB308' }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#EAB308' }}>Creator Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                The Cosmic Collective
              </h1>
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Welcome back, {user?.name}. Here's your platform overview.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: active ? 'rgba(234,179,8,0.1)' : 'rgba(248,250,252,0.03)',
                  border: `1px solid ${active ? 'rgba(234,179,8,0.2)' : 'rgba(248,250,252,0.06)'}`,
                  color: active ? '#EAB308' : 'rgba(248,250,252,0.5)',
                }}
                data-testid={`creator-tab-${tab.id}`}>
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab key="overview" overview={overview} activeTrend={activeTrend} features={features} />
          )}
          {activeTab === 'feedback' && (
            <FeedbackTab key="feedback" feedback={feedback} onStatusChange={updateFeedbackStatus} />
          )}
          {activeTab === 'comments' && (
            <CommentsTab key="comments" comments={comments} onDelete={deleteComment} />
          )}
          {activeTab === 'users' && (
            <UsersTab key="users" users={recentUsers} overview={overview} />
          )}
          {activeTab === 'features' && (
            <FeaturesTab key="features" features={features} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ overview, activeTrend, features }) {
  const o = overview;
  const STATS = [
    { icon: Users, label: 'Total Users', value: o.total_users, color: '#C084FC', sub: `+${o.new_users_week} this week` },
    { icon: Flame, label: 'Active Today', value: o.active_today, color: '#22C55E', sub: `${o.active_week} this week` },
    { icon: TrendingUp, label: 'Active Month', value: o.active_month, color: '#3B82F6', sub: `${o.total_sessions} sage sessions` },
    { icon: Download, label: 'App Installs', value: o.total_installs, color: '#2DD4BF', sub: 'PWA downloads' },
    { icon: Heart, label: 'Mood Logs', value: o.total_moods, color: '#FDA4AF', sub: `${o.total_journals} journal entries` },
    { icon: MessageSquare, label: 'Feedback', value: o.total_feedback, color: '#FB923C', sub: `${o.new_feedback} new, ${o.in_review_feedback} in review` },
  ];

  const maxActive = Math.max(...activeTrend.map(d => d.active), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-overview">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card p-4" data-testid={`creator-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                {s.value}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-[9px] mt-1" style={{ color: s.color }}>{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Active Users Trend */}
      {activeTrend.length > 0 && (
        <div className="glass-card p-5 mb-8" data-testid="creator-active-trend">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
            Daily Active Users — Last 14 Days
          </p>
          <div className="flex items-end gap-1.5 h-32">
            {activeTrend.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md transition-all duration-500 relative group"
                  style={{
                    height: `${Math.max((d.active / maxActive) * 100, 4)}%`,
                    background: `linear-gradient(to top, rgba(34,197,94,0.4), rgba(34,197,94,0.15))`,
                    minHeight: '4px',
                  }}>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#22C55E' }}>{d.active}</div>
                </div>
                <span className="text-[7px] truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>
                  {d.date.split(' ')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Features */}
      {features.length > 0 && (
        <div className="glass-card p-5" data-testid="creator-top-features">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
            Top Features by Usage
          </p>
          <div className="space-y-2">
            {features.slice(0, 8).map((f, i) => {
              const maxVisits = features[0]?.visits || 1;
              return (
                <div key={f.page} className="flex items-center gap-3">
                  <span className="text-[10px] w-4 text-right font-medium" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{f.page}</span>
                      <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>{f.visits}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(f.visits / maxVisits) * 100}%`, background: 'linear-gradient(to right, #C084FC, #2DD4BF)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Feedback Tab ─── */
function FeedbackTab({ feedback, onStatusChange }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.status === filter);

  const STATUS_COLORS = {
    new: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', icon: AlertCircle, label: 'New' },
    in_review: { bg: 'rgba(234,179,8,0.1)', color: '#EAB308', icon: Clock, label: 'In Review' },
    resolved: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', icon: CheckCircle, label: 'Resolved' },
    dismissed: { bg: 'rgba(248,250,252,0.05)', color: 'rgba(248,250,252,0.4)', icon: XCircle, label: 'Dismissed' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-feedback-tab">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['all', 'new', 'in_review', 'resolved', 'dismissed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-[10px] font-medium transition-all"
            style={{
              background: filter === f ? 'rgba(234,179,8,0.1)' : 'rgba(248,250,252,0.03)',
              border: `1px solid ${filter === f ? 'rgba(234,179,8,0.2)' : 'rgba(248,250,252,0.06)'}`,
              color: filter === f ? '#EAB308' : 'rgba(248,250,252,0.5)',
            }}>
            {f === 'all' ? `All (${feedback.length})` : `${f.replace('_', ' ')} (${feedback.filter(x => x.status === f).length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No feedback in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => {
            const s = STATUS_COLORS[f.status] || STATUS_COLORS.new;
            const SIcon = s.icon;
            return (
              <div key={f.id} className="glass-card p-4" data-testid={`feedback-item-${f.id}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                    <SIcon size={14} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.user_name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>{f.type}</span>
                      {f.category && <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{f.category}</span>}
                    </div>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{f.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{new Date(f.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-1 ml-auto">
                        {f.status !== 'in_review' && (
                          <button onClick={() => onStatusChange(f.id, 'in_review')} className="text-[9px] px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(234,179,8,0.08)', color: '#EAB308' }}>Review</button>
                        )}
                        {f.status !== 'resolved' && (
                          <button onClick={() => onStatusChange(f.id, 'resolved')} className="text-[9px] px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>Resolve</button>
                        )}
                        {f.status !== 'dismissed' && (
                          <button onClick={() => onStatusChange(f.id, 'dismissed')} className="text-[9px] px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>Dismiss</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Comments Tab ─── */
function CommentsTab({ comments, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-comments-tab">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
        All Community Comments ({comments.length})
      </p>
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="glass-card p-3 flex items-start gap-3" data-testid={`comment-item-${c.id}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE' }}>
                {c.user_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.user_name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>
                    {c.feature}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
                {c.likes > 0 && <span className="text-[9px] mt-1 inline-block" style={{ color: '#FDA4AF' }}>{c.likes} likes</span>}
              </div>
              <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0"
                title="Delete comment" data-testid={`delete-comment-${c.id}`}>
                <Trash2 size={12} style={{ color: '#EF4444' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Users Tab ─── */
function UsersTab({ users, overview }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-users-tab">
      <div className="flex items-center gap-4 mb-6">
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <Users size={16} style={{ color: '#C084FC' }} />
          <div>
            <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{overview?.total_users || 0}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Registered</p>
          </div>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <Download size={16} style={{ color: '#2DD4BF' }} />
          <div>
            <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{overview?.total_installs || 0}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>PWA Installs</p>
          </div>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <UserPlus size={16} style={{ color: '#22C55E' }} />
          <div>
            <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{overview?.new_users_week || 0}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>New This Week</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
        Recent Signups
      </p>
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No users yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.slice(0, 30).map(u => (
            <div key={u.id} className="glass-card p-3 flex items-center gap-3" data-testid={`user-item-${u.id}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE' }}>
                {u.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'}
                </p>
                {u.role === 'admin' && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308' }}>Creator</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Features Tab ─── */
function FeaturesTab({ features }) {
  const maxVisits = features[0]?.visits || 1;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-features-tab">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
        Feature Usage Rankings ({features.length} tracked)
      </p>
      {features.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No usage data yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={f.page} className="glass-card p-3 flex items-center gap-3" data-testid={`feature-${i}`}>
              <span className="text-sm font-medium w-6 text-center tabular-nums"
                style={{ color: i < 3 ? '#EAB308' : 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{f.page}</span>
                  <span className="text-[10px] tabular-nums font-medium" style={{ color: i < 3 ? '#EAB308' : 'var(--text-muted)' }}>
                    {f.visits} visits
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(f.visits / maxVisits) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.03 }}
                    className="h-full rounded-full"
                    style={{ background: i < 3 ? 'linear-gradient(to right, #EAB308, #FB923C)' : 'linear-gradient(to right, #C084FC, #2DD4BF)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
