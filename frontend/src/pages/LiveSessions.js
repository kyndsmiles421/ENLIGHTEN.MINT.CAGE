import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Radio, Users, Timer, Flame, Wind, Music, BookOpen, Heart,
  Zap, Plus, ChevronRight, Calendar, Crown, Sparkles,
  Play, Clock, X, Bell, BellOff, Repeat, CalendarClock,
  CheckCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  timer: Timer, flame: Flame, wind: Wind, music: Music,
  'book-open': BookOpen, heart: Heart, zap: Zap, users: Users,
};

const RECURRENCE_OPTIONS = [
  { id: 'daily', label: 'Every Day', desc: 'Runs every single day' },
  { id: 'weekdays', label: 'Weekdays', desc: 'Mon through Fri' },
  { id: 'weekends', label: 'Weekends', desc: 'Sat & Sun' },
  { id: 'weekly', label: 'Weekly', desc: 'Once per week' },
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function LiveSessions() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [types, setTypes] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [recurringSeries, setRecurringSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'schedule'

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const promises = [
        axios.get(`${API}/live/session-types`).catch(() => ({ data: { types: [], scenes: [] } })),
      ];
      if (user) {
        promises.push(
          axios.get(`${API}/live/sessions`, { headers: authHeaders }).catch(() => ({ data: { sessions: [] } })),
          axios.get(`${API}/live/recurring`, { headers: authHeaders }).catch(() => ({ data: { series: [] } })),
        );
        // Try spawning any due recurring sessions
        axios.post(`${API}/live/recurring/spawn`, {}, { headers: authHeaders }).catch(() => {});
      } else {
        promises.push(Promise.resolve({ data: { sessions: [] } }), Promise.resolve({ data: { series: [] } }));
      }
      const [typesRes, sessRes, recurRes] = await Promise.all(promises);
      setTypes(typesRes.data.types || []);
      setScenes(typesRes.data.scenes || []);
      setSessions(sessRes.data.sessions || []);
      setRecurringSeries(recurRes.data.series || []);
    } catch {}
    setLoading(false);
  };

  const toggleSubscription = async (seriesId, isSubscribed) => {
    try {
      if (isSubscribed) {
        await axios.delete(`${API}/live/recurring/${seriesId}/subscribe`, { headers: authHeaders });
      } else {
        await axios.post(`${API}/live/recurring/${seriesId}/subscribe`, {}, { headers: authHeaders });
      }
      setRecurringSeries(prev => prev.map(s =>
        s.id === seriesId
          ? { ...s, is_subscribed: !isSubscribed, subscriber_count: s.subscriber_count + (isSubscribed ? -1 : 1) }
          : s
      ));
    } catch {}
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const TABS = [
    { id: 'live', label: 'Live & Upcoming', count: activeSessions.length + upcomingSessions.length },
    { id: 'schedule', label: 'Recurring Schedule', count: recurringSeries.length },
  ];

  return (
    <div className="min-h-screen immersive-page px-4 md:px-12 lg:px-24 py-10" style={{ background: 'transparent' }} data-testid="live-sessions-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio size={14} style={{ color: '#EF4444' }} className="animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#EF4444' }}>Live</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Live Sessions
              </h1>
            </div>
            {user && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                data-testid="create-session-btn">
                <Plus size={14} /> Host Session
              </button>
            )}
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Join live group meditations, yoga flows, and spiritual practices with fellow seekers.
          </p>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.05)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(192,132,252,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#C084FC' : 'rgba(248,250,252,0.45)',
                border: activeTab === tab.id ? '1px solid rgba(192,132,252,0.15)' : '1px solid transparent',
              }}
              data-testid={`tab-${tab.id}`}>
              {tab.id === 'live' ? <Radio size={12} /> : <CalendarClock size={12} />}
              {tab.label}
              {tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: 'rgba(248,250,252,0.06)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'live' ? (
            <motion.div key="live" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#EF4444' }}>Live Now</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSessions.map((s, i) => (
                      <SessionCard key={s.id} session={s} types={types} scenes={scenes} isLive navigate={navigate} delay={i * 0.05} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Sessions */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
                  {upcomingSessions.length > 0 ? 'Upcoming Sessions' : 'No Sessions Scheduled'}
                </p>
                {upcomingSessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingSessions.map((s, i) => (
                      <SessionCard key={s.id} session={s} types={types} scenes={scenes} navigate={navigate} delay={0.1 + i * 0.05} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <Radio size={28} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto 12px' }} />
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>No live sessions right now</p>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Be the first to host a session for the community</p>
                    {user && (
                      <button onClick={() => setShowCreate(true)}
                        className="px-4 py-2 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}>
                        Host a Session
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Session Types */}
              <div className="mt-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Session Types</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {types.map((t, i) => {
                    const Icon = ICON_MAP[t.icon] || Sparkles;
                    return (
                      <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.03 }}
                        className="glass-card p-4 text-center">
                        <Icon size={20} style={{ color: t.color, margin: '0 auto 8px' }} />
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="schedule" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Recurring Schedule Tab */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-muted)' }}>
                    Recurring Schedule
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Subscribe to get notified before each session starts
                  </p>
                </div>
              </div>

              {recurringSeries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recurringSeries.map((s, i) => (
                    <RecurringCard key={s.id} series={s} types={types} delay={i * 0.05}
                      onToggleSubscribe={() => toggleSubscription(s.id, s.is_subscribed)} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <CalendarClock size={28} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto 12px' }} />
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>No recurring sessions yet</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Create a recurring session to build a consistent community practice</p>
                  {user && (
                    <button onClick={() => setShowCreate(true)}
                      className="px-4 py-2 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}>
                      Create Recurring Session
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateSessionModal
            types={types} scenes={scenes} authHeaders={authHeaders}
            onClose={() => setShowCreate(false)}
            onCreated={(s) => { setSessions(prev => [s, ...prev]); setShowCreate(false); navigate(`/live/${s.id}`); }}
            onRecurringCreated={(s) => { setRecurringSeries(prev => [s, ...prev]); setShowCreate(false); setActiveTab('schedule'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Session Card (Live/Upcoming) ─── */
function SessionCard({ session, types, scenes, isLive, navigate, delay }) {
  const type = types.find(t => t.id === session.session_type) || {};
  const scene = scenes.find(s => s.id === session.scene) || {};
  const Icon = ICON_MAP[type.icon] || Sparkles;
  const scheduledDate = session.scheduled_at ? new Date(session.scheduled_at) : null;

  return (
    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      onClick={() => navigate(`/live/${session.id}`)}
      className="glass-card p-5 text-left group hover:scale-[1.01] transition-all relative overflow-hidden"
      style={{ border: isLive ? '1px solid rgba(239,68,68,0.15)' : undefined }}
      data-testid={`session-card-${session.id}`}>
      <div className="absolute inset-0 opacity-30" style={{ background: scene.bg || 'transparent' }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${type.color || '#C084FC'}12`, border: `1px solid ${type.color || '#C084FC'}20` }}>
              <Icon size={16} style={{ color: type.color || '#C084FC' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {isLive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isLive ? '#EF4444' : type.color || 'var(--text-muted)' }}>
                  {isLive ? 'Live' : type.label}
                </span>
              </div>
            </div>
          </div>
          {session.recurring_series_id && (
            <Repeat size={11} style={{ color: 'rgba(192,132,252,0.4)' }} title="Part of a recurring series" />
          )}
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{session.title}</h3>
        {session.description && <p className="text-[10px] mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{session.description}</p>}
        <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Crown size={9} /> {session.host_name}</span>
          <span className="flex items-center gap-1"><Users size={9} /> {session.participant_count || 0}</span>
          <span className="flex items-center gap-1"><Clock size={9} /> {session.duration_minutes}m</span>
          {scheduledDate && !isLive && (
            <span className="flex items-center gap-1"><Calendar size={9} /> {scheduledDate.toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Recurring Session Card ─── */
function RecurringCard({ series, types, delay, onToggleSubscribe }) {
  const type = types.find(t => t.id === series.session_type) || {};
  const Icon = ICON_MAP[type.icon] || Sparkles;
  const nextDate = series.next_occurrence ? new Date(series.next_occurrence) : null;

  const recurrenceLabel = {
    daily: 'Every Day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    weekly: `Every ${DAY_NAMES[series.day_of_week] || 'Week'}`,
  }[series.recurrence] || series.recurrence;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-card p-5 relative overflow-hidden"
      data-testid={`recurring-card-${series.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${type.color || '#C084FC'}12`, border: `1px solid ${type.color || '#C084FC'}20` }}>
            <Icon size={16} style={{ color: type.color || '#C084FC' }} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{series.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.12)' }}>
                <Repeat size={8} /> {recurrenceLabel}
              </span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {series.time_utc} UTC
              </span>
            </div>
          </div>
        </div>
      </div>

      {series.description && (
        <p className="text-[10px] mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{series.description}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Crown size={9} /> {series.host_name}</span>
          <span className="flex items-center gap-1"><Users size={9} /> {series.subscriber_count || 0} subscribed</span>
          <span className="flex items-center gap-1"><Clock size={9} /> {series.duration_minutes}m</span>
        </div>

        <button onClick={onToggleSubscribe}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
          style={{
            background: series.is_subscribed ? 'rgba(34,197,94,0.1)' : 'rgba(192,132,252,0.08)',
            border: `1px solid ${series.is_subscribed ? 'rgba(34,197,94,0.2)' : 'rgba(192,132,252,0.15)'}`,
            color: series.is_subscribed ? '#22C55E' : '#C084FC',
          }}
          data-testid={`subscribe-btn-${series.id}`}>
          {series.is_subscribed ? <><CheckCircle size={10} /> Subscribed</> : <><Bell size={10} /> Subscribe</>}
        </button>
      </div>

      {nextDate && (
        <div className="mt-3 pt-3 flex items-center gap-1.5 text-[9px]"
          style={{ borderTop: '1px solid rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.35)' }}>
          <CalendarClock size={10} />
          Next: {nextDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} at {nextDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Create Session Modal ─── */
function CreateSessionModal({ types, scenes, authHeaders, onClose, onCreated, onRecurringCreated }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [sessionType, setSessionType] = useState('meditation');
  const [scene, setScene] = useState('cosmic-temple');
  const [duration, setDuration] = useState(20);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('daily');
  const [timeUtc, setTimeUtc] = useState('07:00');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      if (isRecurring) {
        const res = await axios.post(`${API}/live/recurring`, {
          title, description: desc, session_type: sessionType, scene,
          duration_minutes: duration, recurrence, time_utc: timeUtc, day_of_week: dayOfWeek,
        }, { headers: authHeaders });
        onRecurringCreated(res.data);
      } else {
        const res = await axios.post(`${API}/live/sessions`, {
          title, description: desc, session_type: sessionType, scene, duration_minutes: duration,
        }, { headers: authHeaders });
        onCreated(res.data);
      }
    } catch {
      setCreating(false);
    }
  };

  const modalContent = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-2xl overflow-y-auto max-h-[85vh] p-6"
        style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(192,132,252,0.1)', backdropFilter: 'blur(20px)' }}
        onClick={e => e.stopPropagation()} data-testid="create-session-modal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Host a Live Session</h2>
          <button onClick={onClose} className="p-1"><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
        </div>

        <div className="space-y-4">
          {/* One-Time vs Recurring Toggle */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Session Mode</label>
            <div className="flex gap-2">
              <button onClick={() => setIsRecurring(false)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: !isRecurring ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${!isRecurring ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.04)'}`,
                  color: !isRecurring ? '#C084FC' : 'rgba(248,250,252,0.5)',
                }}
                data-testid="mode-onetime">
                <Play size={12} /> One-Time
              </button>
              <button onClick={() => setIsRecurring(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: isRecurring ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${isRecurring ? 'rgba(45,212,191,0.25)' : 'rgba(248,250,252,0.04)'}`,
                  color: isRecurring ? '#2DD4BF' : 'rgba(248,250,252,0.5)',
                }}
                data-testid="mode-recurring">
                <Repeat size={12} /> Recurring
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Session Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Morning Meditation Circle"
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none' }}
              data-testid="session-title-input" />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What will this session focus on?"
              className="w-full px-3 py-2.5 rounded-xl text-xs h-16 resize-none"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none' }} />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {types.map(t => {
                const Icon = ICON_MAP[t.icon] || Sparkles;
                return (
                  <button key={t.id} onClick={() => setSessionType(t.id)}
                    className="p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-center"
                    style={{
                      background: sessionType === t.id ? `${t.color}12` : 'rgba(248,250,252,0.02)',
                      border: `1px solid ${sessionType === t.id ? `${t.color}30` : 'rgba(248,250,252,0.04)'}`,
                    }}
                    data-testid={`type-${t.id}`}>
                    <Icon size={14} style={{ color: sessionType === t.id ? t.color : 'rgba(248,250,252,0.4)' }} />
                    <span className="text-[8px]" style={{ color: sessionType === t.id ? t.color : 'rgba(248,250,252,0.5)' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Virtual Scene</label>
            <div className="grid grid-cols-3 gap-2">
              {scenes.map(s => (
                <button key={s.id} onClick={() => setScene(s.id)}
                  className="p-3 rounded-xl text-center transition-all relative overflow-hidden"
                  style={{
                    border: `1px solid ${scene === s.id ? 'rgba(192,132,252,0.3)' : 'rgba(248,250,252,0.04)'}`,
                  }}
                  data-testid={`scene-${s.id}`}>
                  <div className="absolute inset-0" style={{ background: s.bg, opacity: 0.6 }} />
                  <span className="relative text-[9px] font-medium" style={{ color: scene === s.id ? '#C084FC' : 'rgba(248,250,252,0.6)' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Duration</label>
            <div className="flex items-center gap-2">
              {[10, 15, 20, 30, 45, 60].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                  style={{
                    background: duration === d ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.02)',
                    border: `1px solid ${duration === d ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.04)'}`,
                    color: duration === d ? '#C084FC' : 'rgba(248,250,252,0.5)',
                  }}>
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Recurring options */}
          {isRecurring && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2" style={{ borderTop: '1px solid rgba(45,212,191,0.1)' }}>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: '#2DD4BF' }}>Recurrence</label>
                <div className="grid grid-cols-2 gap-2">
                  {RECURRENCE_OPTIONS.map(r => (
                    <button key={r.id} onClick={() => setRecurrence(r.id)}
                      className="p-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: recurrence === r.id ? 'rgba(45,212,191,0.08)' : 'rgba(248,250,252,0.02)',
                        border: `1px solid ${recurrence === r.id ? 'rgba(45,212,191,0.2)' : 'rgba(248,250,252,0.04)'}`,
                      }}
                      data-testid={`recurrence-${r.id}`}>
                      <p className="text-[10px] font-medium" style={{ color: recurrence === r.id ? '#2DD4BF' : 'rgba(248,250,252,0.6)' }}>{r.label}</p>
                      <p className="text-[8px] mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {recurrence === 'weekly' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: '#2DD4BF' }}>Day of Week</label>
                  <div className="flex gap-1.5">
                    {DAY_NAMES.map((d, i) => (
                      <button key={i} onClick={() => setDayOfWeek(i)}
                        className="flex-1 py-2 rounded-lg text-[10px] font-medium transition-all text-center"
                        style={{
                          background: dayOfWeek === i ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.02)',
                          border: `1px solid ${dayOfWeek === i ? 'rgba(45,212,191,0.25)' : 'rgba(248,250,252,0.04)'}`,
                          color: dayOfWeek === i ? '#2DD4BF' : 'rgba(248,250,252,0.4)',
                        }}
                        data-testid={`day-${i}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block" style={{ color: '#2DD4BF' }}>Time (UTC)</label>
                <input type="time" value={timeUtc} onChange={e => setTimeUtc(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none', colorScheme: 'dark' }}
                  data-testid="time-utc-input" />
              </div>
            </motion.div>
          )}
        </div>

        <button onClick={create} disabled={!title.trim() || creating}
          className="w-full mt-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
          style={{
            background: isRecurring ? 'rgba(45,212,191,0.12)' : 'rgba(192,132,252,0.12)',
            border: `1px solid ${isRecurring ? 'rgba(45,212,191,0.25)' : 'rgba(192,132,252,0.25)'}`,
            color: isRecurring ? '#2DD4BF' : '#C084FC',
            opacity: !title.trim() || creating ? 0.5 : 1,
          }}
          data-testid="create-session-submit">
          {creating ? 'Creating...' : isRecurring ? 'Create Recurring Series' : 'Create & Enter Session'}
        </button>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
