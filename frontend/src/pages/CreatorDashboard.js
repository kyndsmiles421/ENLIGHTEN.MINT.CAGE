import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users, UserPlus, TrendingUp, Download, MessageSquare, Heart,
  BookOpen, MessageCircle, Eye, CheckCircle, Clock, XCircle,
  AlertCircle, ChevronRight, Crown, BarChart3, Flame,
  Trash2, Shield, Send, Search, X, Radio, UserX, UserCheck,
  Bell, FileDown, Megaphone, ChevronDown, ExternalLink, Activity
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
  const [growthData, setGrowthData] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const feedIntervalRef = React.useRef(null);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('creator_dashboard', 12); }, []);
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, feat, fb, cm, usr, trend, growth, bc] = await Promise.all([
        axios.get(`${API}/creator/overview`, { headers: authHeaders }).then(r => r.data).catch(() => null),
        axios.get(`${API}/creator/popular-features`, { headers: authHeaders }).then(r => r.data.features || []).catch(() => []),
        axios.get(`${API}/creator/feedback`, { headers: authHeaders }).then(r => r.data.feedback || []).catch(() => []),
        axios.get(`${API}/creator/comments`, { headers: authHeaders }).then(r => r.data.comments || []).catch(() => []),
        axios.get(`${API}/creator/recent-users`, { headers: authHeaders }).then(r => r.data.users || []).catch(() => []),
        axios.get(`${API}/creator/active-trend`, { headers: authHeaders }).then(r => r.data.trend || []).catch(() => []),
        axios.get(`${API}/creator/user-growth`, { headers: authHeaders }).then(r => r.data.growth || []).catch(() => []),
        axios.get(`${API}/creator/broadcasts`, { headers: authHeaders }).then(r => r.data.broadcasts || []).catch(() => []),
      ]);
      if (!ov) { setError('Creator access only'); setLoading(false); return; }
      setOverview(ov); setFeatures(feat); setFeedback(fb); setComments(cm);
      setRecentUsers(usr); setActiveTrend(trend); setGrowthData(growth); setBroadcasts(bc);
    } catch { setError('Failed to load creator data'); }
    setLoading(false);
  };

  const updateFeedbackStatus = async (id, status) => {
    try {
      await axios.put(`${API}/creator/feedback/${id}/status`, { status }, { headers: authHeaders });
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      toast.success(`Feedback ${status.replace('_', ' ')}`);
    } catch {}
  };

  const deleteComment = async (id) => {
    try {
      await axios.delete(`${API}/creator/comments/${id}`, { headers: authHeaders });
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('Comment deleted');
    } catch {}
  };

  const searchUsers = useCallback(async (q) => {
    setUserSearch(q);
    if (q.length < 2) { setSearchResults(null); return; }
    try {
      const r = await axios.get(`${API}/creator/search-users?q=${encodeURIComponent(q)}`, { headers: authHeaders });
      setSearchResults(r.data.users || []);
    } catch { setSearchResults([]); }
  }, [authHeaders]);

  // Live feed polling
  const loadLiveFeed = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/creator/live-feed`, { headers: authHeaders });
      setLiveFeed(r.data.events || []);
    } catch {}
  }, [authHeaders]);

  useEffect(() => {
    if (activeTab === 'livefeed') {
      loadLiveFeed();
      feedIntervalRef.current = setInterval(loadLiveFeed, 5000);
    }
    return () => { if (feedIntervalRef.current) clearInterval(feedIntervalRef.current); };
  }, [activeTab, loadLiveFeed]);

  const exportData = async (collection) => {
    try {
      const res = await axios.get(`${API}/creator/export/${collection}`, { headers: authHeaders, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${collection}_export.json`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${collection} exported`);
    } catch {}
  };

  const viewUserDetail = async (userId) => {
    try {
      const r = await axios.get(`${API}/creator/user/${userId}`, { headers: authHeaders });
      setShowUserDetail(r.data);
    } catch { toast.error('Failed to load user details'); }
  };

  const toggleUserStatus = async (userId, disabled) => {
    try {
      await axios.post(`${API}/creator/user/${userId}/toggle-status`, { disabled }, { headers: authHeaders });
      setShowUserDetail(prev => prev ? { ...prev, disabled } : null);
      setRecentUsers(prev => prev.map(u => u.id === userId ? { ...u, disabled } : u));
      toast.success(disabled ? 'User disabled' : 'User enabled');
    } catch {}
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Loading Creator Dashboard...</p></div>;
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield size={32} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
          <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 text-xs underline" style={{ color: 'var(--text-muted)' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'livefeed', label: 'Live Feed', icon: Radio },
    { id: 'feedback', label: `Feedback (${overview?.new_feedback || 0})`, icon: MessageSquare },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'features', label: 'Popular', icon: TrendingUp },
    { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-10 immersive-page" style={{ background: 'transparent' }} data-testid="creator-dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <Crown size={18} style={{ color: '#EAB308' }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#EAB308' }}>Creator Dashboard</p>
                <h1 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>The ENLIGHTEN.MINT.CAFE</h1>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowBroadcast(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }}
                data-testid="broadcast-btn">
                <Bell size={12} /> Broadcast
              </button>
              <div className="relative">
                <button onClick={() => {}} className="p-2 rounded-xl" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}
                  data-testid="export-menu-btn">
                  <FileDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}.</p>
        </motion.div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'Users', val: overview?.total_users, color: '#C084FC' },
            { label: 'Active', val: overview?.active_today, color: '#22C55E' },
            { label: 'Installs', val: overview?.total_installs, color: '#2DD4BF' },
            { label: 'Feedback', val: overview?.new_feedback, color: '#FB923C', suffix: ' new' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}12` }}>
              <span className="text-sm font-medium tabular-nums" style={{ color: s.color }}>{s.val || 0}</span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.label}{s.suffix || ''}</span>
            </div>
          ))}
        </div>

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
                <Icon size={12} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="ov" overview={overview} activeTrend={activeTrend} growthData={growthData} features={features} onExport={exportData} />}
          {activeTab === 'livefeed' && <LiveFeedTab key="lf" events={liveFeed} onRefresh={loadLiveFeed} />}
          {activeTab === 'feedback' && <FeedbackTab key="fb" feedback={feedback} onStatusChange={updateFeedbackStatus} onExport={() => exportData('feedback')} />}
          {activeTab === 'comments' && <CommentsTab key="cm" comments={comments} onDelete={deleteComment} />}
          {activeTab === 'users' && <UsersTab key="us" users={recentUsers} overview={overview} userSearch={userSearch} searchResults={searchResults} onSearch={searchUsers} onViewUser={viewUserDetail} onExport={() => exportData('users')} />}
          {activeTab === 'features' && <FeaturesTab key="ft" features={features} />}
          {activeTab === 'broadcasts' && <BroadcastsTab key="bc" broadcasts={broadcasts} onNew={() => setShowBroadcast(true)} />}
        </AnimatePresence>
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcast && <BroadcastModal authHeaders={authHeaders} onClose={() => setShowBroadcast(false)} onSent={(b) => { setBroadcasts(prev => [b, ...prev]); setShowBroadcast(false); }} />}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserDetail && <UserDetailModal user={showUserDetail} onClose={() => setShowUserDetail(null)} onToggleStatus={toggleUserStatus} />}
      </AnimatePresence>
    </div>
  );
}


/* ─── Live Feed Tab ─── */
function LiveFeedTab({ events, onRefresh }) {
  const ACTION_ICONS = {
    visit: { icon: Eye, color: '#3B82F6' },
    interact: { icon: Flame, color: '#FB923C' },
    complete: { icon: CheckCircle, color: '#22C55E' },
  };
  const formatPage = (page) => {
    if (!page) return 'Unknown';
    return page.replace(/^\//, '').replace(/-/g, ' ').replace(/\//g, ' > ') || 'Home';
  };
  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-livefeed-tab">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            Real-time Activity ({events.length} events)
          </p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px]"
          style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-muted)' }}
          data-testid="livefeed-refresh">
          <Activity size={10} /> Refresh
        </button>
      </div>
      <p className="text-[9px] mb-4" style={{ color: 'var(--text-muted)' }}>Auto-refreshes every 5 seconds</p>
      {events.length === 0 ? (
        <div className="p-8 text-center">
          <Radio size={28} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto 12px' }} />
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>No recent activity</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>User actions will appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {events.map((e, i) => {
            const ai = ACTION_ICONS[e.action] || ACTION_ICONS.visit;
            const AIcon = ai.icon;
            return (
              <motion.div key={`${e.timestamp}-${i}`}
                initial={i < 5 ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i < 5 ? i * 0.03 : 0 }}
                className="px-4 py-2.5 flex items-center gap-3"
                data-testid={`feed-event-${i}`}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${ai.color}12` }}>
                  <AIcon size={11} style={{ color: ai.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{e.user_name}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{e.action === 'visit' ? 'visited' : e.action === 'interact' ? 'used' : 'completed'}</span>
                    <span className="text-[10px] font-medium truncate" style={{ color: ai.color }}>{formatPage(e.page)}</span>
                  </div>
                  {e.label && <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{e.label}</p>}
                </div>
                <span className="text-[8px] flex-shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>{timeAgo(e.timestamp)}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}


/* ─── Overview Tab ─── */
function OverviewTab({ overview, activeTrend, growthData, features, onExport }) {
  const o = overview;
  const STATS = [
    { icon: Users, label: 'Total Users', value: o.total_users, color: '#C084FC', sub: `+${o.new_users_week} this week`, action: () => onExport('users') },
    { icon: Flame, label: 'Active Today', value: o.active_today, color: '#22C55E', sub: `${o.active_week} this week` },
    { icon: TrendingUp, label: 'Active Month', value: o.active_month, color: '#3B82F6', sub: `${o.total_sessions} sage sessions` },
    { icon: Download, label: 'App Installs', value: o.total_installs, color: '#2DD4BF', sub: 'PWA downloads' },
    { icon: Heart, label: 'Mood Logs', value: o.total_moods, color: '#FDA4AF', sub: `${o.total_journals} journal entries`, action: () => onExport('mood_entries') },
    { icon: MessageSquare, label: 'Feedback', value: o.total_feedback, color: '#FB923C', sub: `${o.new_feedback} new`, action: () => onExport('feedback') },
  ];
  const maxActive = Math.max(...activeTrend.map(d => d.active), 1);
  const maxGrowth = Math.max(...growthData.map(d => d.count), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-overview">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={s.action} disabled={!s.action}
              className="p-4 text-left transition-all hover:scale-[1.02] group"
              style={{ cursor: s.action ? 'pointer' : 'default' }}
              data-testid={`creator-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                {s.action && <FileDown size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }} />}
              </div>
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-[9px] mt-1" style={{ color: s.color }}>{s.sub}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Active Users Trend */}
        {activeTrend.length > 0 && (
          <div className="p-5" data-testid="creator-active-trend">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
              <Activity size={10} className="inline mr-1" /> Daily Active Users — 14 Days
            </p>
            <div className="flex items-end gap-1.5 h-28">
              {activeTrend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md relative group cursor-pointer hover:opacity-80 transition-all"
                    style={{ height: `${Math.max((d.active / maxActive) * 100, 4)}%`, background: 'linear-gradient(to top, rgba(34,197,94,0.4), rgba(34,197,94,0.15))', minHeight: '4px' }}>
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#22C55E' }}>{d.active}</div>
                  </div>
                  <span className="text-[7px] truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>{d.date.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Growth Chart */}
        {growthData.length > 0 && (
          <div className="p-5" data-testid="creator-user-growth">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
              <UserPlus size={10} className="inline mr-1" /> New Users — 30 Days
            </p>
            <div className="flex items-end gap-0.5 h-28">
              {growthData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md relative group cursor-pointer hover:opacity-80 transition-all"
                    style={{ height: `${Math.max((d.count / Math.max(maxGrowth, 1)) * 100, 3)}%`, background: 'linear-gradient(to top, rgba(192,132,252,0.4), rgba(192,132,252,0.15))', minHeight: '3px' }}>
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#C084FC' }}>{d.count}</div>
                  </div>
                  {i % 5 === 0 && <span className="text-[6px] truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>{d.date.split(' ')[1]}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Features */}
      {features.length > 0 && (
        <div className="p-5" data-testid="creator-top-features">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Top Features by Usage</p>
          <div className="space-y-2">
            {features.slice(0, 8).map((f, i) => (
              <div key={f.page} className="flex items-center gap-3">
                <span className="text-[10px] w-4 text-right font-medium" style={{ color: i < 3 ? '#EAB308' : 'var(--text-muted)' }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{f.page}</span>
                    <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>{f.visits}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(f.visits / (features[0]?.visits || 1)) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.03 }} className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #C084FC, #2DD4BF)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Feedback Tab ─── */
function FeedbackTab({ feedback, onStatusChange, onExport }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.status === filter);
  const STATUS = {
    new: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', icon: AlertCircle, label: 'New' },
    in_review: { bg: 'rgba(234,179,8,0.1)', color: '#EAB308', icon: Clock, label: 'In Review' },
    resolved: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', icon: CheckCircle, label: 'Resolved' },
    dismissed: { bg: 'rgba(248,250,252,0.05)', color: 'rgba(248,250,252,0.4)', icon: XCircle, label: 'Dismissed' },
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-feedback-tab">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'new', 'in_review', 'resolved', 'dismissed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-[10px] font-medium transition-all"
              style={{ background: filter === f ? 'rgba(234,179,8,0.1)' : 'rgba(248,250,252,0.03)', border: `1px solid ${filter === f ? 'rgba(234,179,8,0.2)' : 'rgba(248,250,252,0.06)'}`, color: filter === f ? '#EAB308' : 'rgba(248,250,252,0.5)' }}>
              {f === 'all' ? `All (${feedback.length})` : `${f.replace('_', ' ')} (${feedback.filter(x => x.status === f).length})`}
            </button>
          ))}
        </div>
        <button onClick={onExport} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px]" style={{ color: 'var(--text-muted)' }} data-testid="export-feedback">
          <FileDown size={10} /> Export
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>No feedback in this category.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => {
            const s = STATUS[f.status] || STATUS.new;
            const SIcon = s.icon;
            return (
              <div key={f.id} className="p-4" data-testid={`feedback-item-${f.id}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}><SIcon size={14} style={{ color: s.color }} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.user_name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      {f.type && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>{f.type}</span>}
                    </div>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{f.message}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{new Date(f.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-1 ml-auto">
                        {f.status !== 'in_review' && <button onClick={() => onStatusChange(f.id, 'in_review')} className="text-[9px] px-2 py-1 rounded-lg hover:scale-105 transition-all" style={{ background: 'rgba(234,179,8,0.08)', color: '#EAB308' }} data-testid={`fb-review-${f.id}`}>Review</button>}
                        {f.status !== 'resolved' && <button onClick={() => onStatusChange(f.id, 'resolved')} className="text-[9px] px-2 py-1 rounded-lg hover:scale-105 transition-all" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }} data-testid={`fb-resolve-${f.id}`}>Resolve</button>}
                        {f.status !== 'dismissed' && <button onClick={() => onStatusChange(f.id, 'dismissed')} className="text-[9px] px-2 py-1 rounded-lg hover:scale-105 transition-all" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }} data-testid={`fb-dismiss-${f.id}`}>Dismiss</button>}
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
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>All Community Comments ({comments.length})</p>
      {comments.length === 0 ? (
        <div className="text-center py-12"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>No comments yet.</p></div>
      ) : (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="p-3 flex items-start gap-3" data-testid={`comment-item-${c.id}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE' }}>{c.user_name?.charAt(0)?.toUpperCase() || '?'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.user_name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>{c.feature}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
              </div>
              <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0" data-testid={`delete-comment-${c.id}`}>
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
function UsersTab({ users, overview, userSearch, searchResults, onSearch, onViewUser, onExport }) {
  const displayUsers = searchResults !== null ? searchResults : users;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-users-tab">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {[
          { icon: Users, val: overview?.total_users, label: 'Total', color: '#C084FC' },
          { icon: Download, val: overview?.total_installs, label: 'Installs', color: '#2DD4BF' },
          { icon: UserPlus, val: overview?.new_users_week, label: 'New/Week', color: '#22C55E' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 flex items-center gap-3">
            <s.icon size={16} style={{ color: s.color }} />
            <div>
              <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{s.val || 0}</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={userSearch} onChange={e => onSearch(e.target.value)} placeholder="Search users by name or email..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs outline-none"
            style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }}
            data-testid="user-search-input" />
        </div>
        <button onClick={onExport} className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[10px]"
          style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-muted)' }}
          data-testid="export-users">
          <FileDown size={10} /> Export
        </button>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
        {searchResults !== null ? `Search Results (${searchResults.length})` : `Recent Users (${users.length})`}
      </p>

      {displayUsers.length === 0 ? (
        <div className="text-center py-12"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{searchResults !== null ? 'No users found' : 'No users yet.'}</p></div>
      ) : (
        <div className="space-y-2">
          {displayUsers.slice(0, 30).map(u => (
            <button key={u.id} onClick={() => onViewUser(u.id)} className="w-full p-3 flex items-center gap-3 text-left hover:scale-[1.005] transition-all" data-testid={`user-item-${u.id}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: u.disabled ? 'rgba(239,68,68,0.12)' : 'rgba(192,132,252,0.12)', color: u.disabled ? '#EF4444' : '#D8B4FE' }}>
                {u.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: u.disabled ? '#EF4444' : 'var(--text-primary)' }}>{u.name}{u.disabled ? ' (disabled)' : ''}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</p>
                  {u.role === 'admin' && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308' }}>Creator</span>}
                </div>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Features Tab ─── */
function FeaturesTab({ features }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-features-tab">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Feature Usage Rankings ({features.length} tracked)</p>
      {features.length === 0 ? (
        <div className="text-center py-12"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>No usage data yet.</p></div>
      ) : (
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={f.page} className="p-3 flex items-center gap-3" data-testid={`feature-${i}`}>
              <span className="text-sm font-medium w-6 text-center tabular-nums" style={{ color: i < 3 ? '#EAB308' : 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{f.page}</span>
                  <span className="text-[10px] tabular-nums font-medium" style={{ color: i < 3 ? '#EAB308' : 'var(--text-muted)' }}>{f.visits} visits</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(f.visits / (features[0]?.visits || 1)) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.03 }} className="h-full rounded-full"
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

/* ─── Broadcasts Tab ─── */
function BroadcastsTab({ broadcasts, onNew }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="creator-broadcasts-tab">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Broadcast History ({broadcasts.length})</p>
        <button onClick={onNew} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }}
          data-testid="new-broadcast-btn"><Megaphone size={10} /> New Broadcast</button>
      </div>
      {broadcasts.length === 0 ? (
        <div className="p-8 text-center">
          <Megaphone size={28} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto 12px' }} />
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>No broadcasts sent yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Send announcements to your community</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b, i) => (
            <motion.div key={b.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-4" data-testid={`broadcast-${b.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{b.body}</p>
                  <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Users size={9} /> {b.sent_to} recipients</span>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF' }}>{b.target}</span>
                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Broadcast Modal ─── */
function BroadcastModal({ authHeaders, onClose, onSent }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [url, setUrl] = useState('/');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`${API}/creator/broadcast`, { title, body, target, url }, { headers: authHeaders });
      toast.success(`Broadcast sent to ${res.data.recipients} users`);
      onSent({ title, body, target, sent_to: res.data.recipients, created_at: new Date().toISOString(), id: Date.now().toString() });
    } catch { toast.error('Failed to send'); setSending(false); }
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'transparent' }} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(234,179,8,0.12)', backdropFilter: 'none'}}
        onClick={e => e.stopPropagation()} data-testid="broadcast-modal">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Send Broadcast</h2>
          <button onClick={onClose} className="p-1"><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Audience</label>
            <div className="flex gap-2">
              {[{ id: 'all', label: 'All Users' }, { id: 'active', label: 'Active (7d)' }, { id: 'new', label: 'New (7d)' }].map(t => (
                <button key={t.id} onClick={() => setTarget(t.id)} className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ background: target === t.id ? 'rgba(234,179,8,0.1)' : 'rgba(248,250,252,0.02)', border: `1px solid ${target === t.id ? 'rgba(234,179,8,0.2)' : 'rgba(248,250,252,0.05)'}`, color: target === t.id ? '#EAB308' : 'rgba(248,250,252,0.5)' }}
                  data-testid={`broadcast-target-${t.id}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New Feature Announcement"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }}
              data-testid="broadcast-title" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Exciting news for our community..."
              className="w-full px-3 py-2.5 rounded-xl text-xs h-20 resize-none outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }}
              data-testid="broadcast-body" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Link (optional)</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="/"
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }} />
          </div>
        </div>
        <button onClick={send} disabled={!title.trim() || !body.trim() || sending}
          className="w-full mt-5 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', color: '#EAB308', opacity: !title.trim() || !body.trim() || sending ? 0.5 : 1 }}
          data-testid="broadcast-send">{sending ? 'Sending...' : 'Send Broadcast'}</button>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ─── User Detail Modal ─── */
function UserDetailModal({ user: u, onClose, onToggleStatus }) {
  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'transparent' }} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(192,132,252,0.12)', backdropFilter: 'none'}}
        onClick={e => e.stopPropagation()} data-testid="user-detail-modal">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>User Details</h2>
          <button onClick={onClose} className="p-1"><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE' }}>
            {u.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Mood Logs', val: u.mood_count || 0, color: '#FDA4AF' },
            { label: 'Journal Entries', val: u.journal_count || 0, color: '#818CF8' },
            { label: 'AI Sessions', val: u.session_count || 0, color: '#C084FC' },
            { label: 'Activity (7d)', val: u.activity_this_week || 0, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="p-3 text-center">
              <p className="text-lg font-light tabular-nums" style={{ fontFamily: 'Cormorant Garamond, serif', color: s.color }}>{s.val}</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
        {u.last_active && <p className="text-[9px] mb-4" style={{ color: 'var(--text-muted)' }}>Last active: {new Date(u.last_active).toLocaleString()}</p>}
        <div className="flex gap-2">
          <button onClick={() => onToggleStatus(u.id, !u.disabled)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.01]"
            style={{
              background: u.disabled ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${u.disabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
              color: u.disabled ? '#22C55E' : '#EF4444',
            }}
            data-testid="toggle-user-status">
            {u.disabled ? <><UserCheck size={12} /> Enable Account</> : <><UserX size={12} /> Disable Account</>}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
