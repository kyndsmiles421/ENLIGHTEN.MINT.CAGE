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
  CheckCircle, Archive, Download, Eye, MessageCircle, Pause,
  Volume2
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
  const [pastRecordings, setPastRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'schedule' | 'past'
  const [replaySession, setReplaySession] = useState(null);

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
          axios.get(`${API}/live/past`, { headers: authHeaders }).catch(() => ({ data: { recordings: [] } })),
        );
        // Try spawning any due recurring sessions
        axios.post(`${API}/live/recurring/spawn`, {}, { headers: authHeaders }).catch(() => {});
      } else {
        promises.push(
          Promise.resolve({ data: { sessions: [] } }),
          Promise.resolve({ data: { series: [] } }),
          Promise.resolve({ data: { recordings: [] } }),
        );
      }
      const [typesRes, sessRes, recurRes, pastRes] = await Promise.all(promises);
      setTypes(typesRes.data.types || []);
      setScenes(typesRes.data.scenes || []);
      setSessions(sessRes.data.sessions || []);
      setRecurringSeries(recurRes.data.series || []);
      setPastRecordings(pastRes.data.recordings || []);
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
    { id: 'past', label: 'Past Sessions', count: pastRecordings.length },
  ];

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-10" style={{ background: 'transparent' }} data-testid="live-sessions-page">
      <div className="max-w-3xl mx-auto">
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
                color: activeTab === tab.id ? '#C084FC' : 'rgba(255,255,255,0.75)',
                border: activeTab === tab.id ? '1px solid rgba(192,132,252,0.15)' : '1px solid transparent',
              }}
              data-testid={`tab-${tab.id}`}>
              {tab.id === 'live' ? <Radio size={12} /> : tab.id === 'schedule' ? <CalendarClock size={12} /> : <Archive size={12} />}
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
                  <div className="p-8 text-center">
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
                        className="p-4 text-center">
                        <Icon size={20} style={{ color: t.color, margin: '0 auto 8px' }} />
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'schedule' ? (
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
                <div className="p-8 text-center">
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
          ) : (
            <motion.div key="past" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Past Sessions Tab */}
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-muted)' }}>
                  Session Recordings
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Replay past sessions or download them to your device
                </p>
              </div>

              {pastRecordings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastRecordings.map((rec, i) => (
                    <PastSessionCard key={rec.id} recording={rec} types={types} delay={i * 0.05}
                      onReplay={() => setReplaySession(rec)}
                      authHeaders={authHeaders} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Archive size={28} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto 12px' }} />
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>No recordings yet</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>When live sessions end, their guided commands and chat are saved here for replay</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replay Modal */}
      <AnimatePresence>
        {replaySession && (
          <ReplayModal recording={replaySession} types={types}
            onClose={() => setReplaySession(null)}
            authHeaders={authHeaders} />
        )}
      </AnimatePresence>

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
      className="p-5 text-left group hover:scale-[1.01] transition-all relative overflow-hidden"
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
      className="p-5 relative overflow-hidden"
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
          style={{ borderTop: '1px solid rgba(248,250,252,0.04)', color: 'rgba(255,255,255,0.65)' }}>
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
      <div className="absolute inset-0" style={{ background: 'transparent' }} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-2xl overflow-y-auto max-h-[85vh] p-6"
        style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(192,132,252,0.1)', backdropFilter: 'none'}}
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
                  color: !isRecurring ? '#C084FC' : 'rgba(255,255,255,0.75)',
                }}
                data-testid="mode-onetime">
                <Play size={12} /> One-Time
              </button>
              <button onClick={() => setIsRecurring(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: isRecurring ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${isRecurring ? 'rgba(45,212,191,0.25)' : 'rgba(248,250,252,0.04)'}`,
                  color: isRecurring ? '#2DD4BF' : 'rgba(255,255,255,0.75)',
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
                    <Icon size={14} style={{ color: sessionType === t.id ? t.color : 'rgba(255,255,255,0.7)' }} />
                    <span className="text-[8px]" style={{ color: sessionType === t.id ? t.color : 'rgba(255,255,255,0.75)' }}>{t.label}</span>
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
                  <span className="relative text-[9px] font-medium" style={{ color: scene === s.id ? '#C084FC' : 'rgba(255,255,255,0.85)' }}>{s.label}</span>
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
                    color: duration === d ? '#C084FC' : 'rgba(255,255,255,0.75)',
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
                      <p className="text-[10px] font-medium" style={{ color: recurrence === r.id ? '#2DD4BF' : 'rgba(255,255,255,0.85)' }}>{r.label}</p>
                      <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{r.desc}</p>
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
                          color: dayOfWeek === i ? '#2DD4BF' : 'rgba(255,255,255,0.7)',
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


/* ─── Past Session Card ─── */
function PastSessionCard({ recording, types, delay, onReplay, authHeaders }) {
  const type = types.find(t => t.id === recording.session_type) || {};
  const Icon = ICON_MAP[type.icon] || Sparkles;
  const endedDate = recording.ended_at ? new Date(recording.ended_at) : null;
  const startedDate = recording.started_at ? new Date(recording.started_at) : null;
  const [audioInfo, setAudioInfo] = useState(null);

  useEffect(() => {
    if (recording.session_id && authHeaders) {
      axios.get(`${API}/live/sessions/${recording.session_id}/audio`, { headers: authHeaders })
        .then(r => { if (r.data.has_audio) setAudioInfo(r.data); })
        .catch(() => {});
    }
  }, [recording.session_id, authHeaders]);

  const downloadRecording = async () => {
    try {
      const res = await axios.get(
        `${API}/live/sessions/${recording.session_id}/download`,
        { headers: authHeaders, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${recording.session_id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="p-5 relative overflow-hidden"
      data-testid={`past-card-${recording.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${type.color || '#C084FC'}12`, border: `1px solid ${type.color || '#C084FC'}20` }}>
            <Icon size={16} style={{ color: type.color || '#C084FC' }} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{recording.title}</h3>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {type.label || recording.session_type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[9px] mb-3" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><Crown size={9} /> {recording.host_name}</span>
        <span className="flex items-center gap-1"><Users size={9} /> {recording.participant_count} joined</span>
        <span className="flex items-center gap-1"><Clock size={9} /> {recording.duration_minutes}m</span>
        {endedDate && (
          <span className="flex items-center gap-1">
            <Calendar size={9} /> {endedDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onReplay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC' }}
          data-testid={`replay-btn-${recording.id}`}>
          <Eye size={10} /> Replay
        </button>
        {audioInfo && (
          <a href={`${process.env.REACT_APP_BACKEND_URL}${audioInfo.audio_url}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }}
            data-testid={`audio-btn-${recording.id}`}>
            <Volume2 size={10} /> Audio
          </a>
        )}
        <button onClick={downloadRecording}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}
          data-testid={`download-btn-${recording.id}`}>
          <Download size={10} /> Download
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Replay Modal ─── */
function ReplayModal({ recording, types, onClose, authHeaders }) {
  const [fullRecording, setFullRecording] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentCommandIdx, setCurrentCommandIdx] = useState(-1);
  const [showChat, setShowChat] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const timerRef = React.useRef(null);

  const type = types.find(t => t.id === recording.session_type) || {};

  React.useEffect(() => {
    axios.get(`${API}/live/sessions/${recording.session_id}/recording`, { headers: authHeaders })
      .then(r => setFullRecording(r.data))
      .catch(() => {});
    axios.get(`${API}/live/sessions/${recording.session_id}/audio`, { headers: authHeaders })
      .then(r => { if (r.data.has_audio) setAudioUrl(`${process.env.REACT_APP_BACKEND_URL}${r.data.audio_url}`); })
      .catch(() => {});
  }, [recording.session_id, authHeaders]);

  const commands = fullRecording?.command_log || [];
  const chatLog = (fullRecording?.chat_log || []).filter(m => m.type === 'chat');

  // Auto-play commands with timing
  React.useEffect(() => {
    if (!playing || commands.length === 0) return;
    const idx = currentCommandIdx + 1;
    if (idx >= commands.length) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentCommandIdx(idx);
    }, idx === 0 ? 500 : 4000); // 4s between commands
    return () => clearTimeout(timerRef.current);
  }, [playing, currentCommandIdx, commands.length]);

  const startReplay = () => {
    setCurrentCommandIdx(-1);
    setPlaying(true);
  };

  const downloadRecording = async () => {
    try {
      const res = await axios.get(
        `${API}/live/sessions/${recording.session_id}/download`,
        { headers: authHeaders, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${recording.session_id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  const modalContent = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'transparent' }} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,11,20,0.98)', border: '1px solid rgba(192,132,252,0.1)', backdropFilter: 'none', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()} data-testid="replay-modal">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(248,250,252,0.05)' }}>
          <div>
            <h2 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              {recording.title}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Crown size={9} /> {recording.host_name}</span>
              <span className="flex items-center gap-1"><Users size={9} /> {recording.participant_count}</span>
              <span className="flex items-center gap-1"><Clock size={9} /> {recording.duration_minutes}m</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadRecording}
              className="p-2 rounded-lg hover:bg-white/5 transition-all"
              title="Download Recording"
              data-testid="replay-download">
              <Download size={14} style={{ color: '#2DD4BF' }} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        <div className="flex overflow-hidden" style={{ height: '60vh' }}>
          {/* Command Timeline */}
          <div className="flex-1 flex flex-col">
            {/* Guided Command Display */}
            <div className="flex-1 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {currentCommandIdx >= 0 && currentCommandIdx < commands.length ? (
                  <motion.div key={currentCommandIdx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center px-8">
                    <p className="text-3xl md:text-4xl font-light"
                      style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F8FAFC', textShadow: '0 0 40px rgba(192,132,252,0.3)' }}>
                      {commands[currentCommandIdx].label || commands[currentCommandIdx].command}
                    </p>
                    <p className="text-[9px] mt-3" style={{ color: 'var(--text-muted)' }}>
                      Step {currentCommandIdx + 1} of {commands.length}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-8">
                    {commands.length > 0 ? (
                      <>
                        <p className="text-lg font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
                          {playing ? 'Preparing...' : 'Ready to replay'}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {commands.length} guided commands recorded
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
                          No guided commands
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          This was a free-form session — check the chat log
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="px-6 py-3 flex items-center justify-center gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
              {commands.length > 0 && (
                <button onClick={() => { playing ? setPlaying(false) : startReplay(); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                  style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                  data-testid="replay-play-btn">
                  {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> {currentCommandIdx >= 0 ? 'Resume' : 'Play Replay'}</>}
                </button>
              )}
              <button onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all"
                style={{
                  background: showChat ? 'rgba(45,212,191,0.08)' : 'rgba(248,250,252,0.03)',
                  border: `1px solid ${showChat ? 'rgba(45,212,191,0.15)' : 'rgba(248,250,252,0.05)'}`,
                  color: showChat ? '#2DD4BF' : 'var(--text-muted)',
                }}
                data-testid="replay-toggle-chat">
                <MessageCircle size={10} /> Chat ({chatLog.length})
              </button>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="px-6 py-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                <Volume2 size={12} style={{ color: '#EAB308', flexShrink: 0 }} />
                <audio controls src={audioUrl} className="flex-1 h-8" style={{ filter: 'invert(1) hue-rotate(180deg)', opacity: 0.7 }} data-testid="replay-audio-player" />
              </div>
            )}

            {/* Command Timeline Steps */}
            {commands.length > 0 && (
              <div className="px-6 py-3 flex items-center gap-1 overflow-x-auto" style={{ borderTop: '1px solid rgba(248,250,252,0.03)' }}>
                {commands.map((cmd, i) => (
                  <button key={i}
                    onClick={() => { setCurrentCommandIdx(i); setPlaying(false); }}
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] transition-all"
                    style={{
                      background: i === currentCommandIdx ? 'rgba(192,132,252,0.15)' : i < currentCommandIdx ? 'rgba(192,132,252,0.05)' : 'rgba(248,250,252,0.03)',
                      border: `1px solid ${i === currentCommandIdx ? 'rgba(192,132,252,0.3)' : 'rgba(248,250,252,0.04)'}`,
                      color: i === currentCommandIdx ? '#C084FC' : i < currentCommandIdx ? 'rgba(192,132,252,0.5)' : 'var(--text-muted)',
                    }}>
                    {cmd.label || cmd.command}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <AnimatePresence>
            {showChat && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden flex-shrink-0 flex flex-col"
                style={{ borderLeft: '1px solid rgba(248,250,252,0.04)' }}>
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Chat Log ({chatLog.length} messages)
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                  {chatLog.length > 0 ? chatLog.map((msg, i) => (
                    <div key={i}>
                      <span className="text-[9px] font-medium mr-1.5" style={{ color: '#2DD4BF' }}>{msg.name}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                    </div>
                  )) : (
                    <p className="text-[9px] text-center py-4" style={{ color: 'var(--text-muted)' }}>No chat messages</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
