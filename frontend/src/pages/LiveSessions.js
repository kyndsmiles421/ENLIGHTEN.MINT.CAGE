import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Radio, Users, Timer, Flame, Wind, Music, BookOpen, Heart,
  Zap, Plus, ChevronRight, Calendar, MapPin, Crown, Sparkles,
  Play, Clock, X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  timer: Timer, flame: Flame, wind: Wind, music: Music,
  'book-open': BookOpen, heart: Heart, zap: Zap, users: Users,
};

export default function LiveSessions() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [types, setTypes] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [sessRes, typesRes] = await Promise.all([
        user ? axios.get(`${API}/live/sessions`, { headers: authHeaders }).catch(() => ({ data: { sessions: [] } })) : Promise.resolve({ data: { sessions: [] } }),
        axios.get(`${API}/live/session-types`).catch(() => ({ data: { types: [], scenes: [] } })),
      ]);
      setSessions(sessRes.data.sessions || []);
      setTypes(typesRes.data.types || []);
      setScenes(typesRes.data.scenes || []);
    } catch {}
    setLoading(false);
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="min-h-screen immersive-page px-4 md:px-12 lg:px-24 py-10" style={{ background: 'transparent' }} data-testid="live-sessions-page">
      <div className="max-w-5xl mx-auto">
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
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join live group meditations, yoga flows, and spiritual practices with fellow seekers.
          </p>
        </motion.div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#EF4444' }}>Live Now</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSessions.map((s, i) => (
                <SessionCard key={s.id} session={s} types={types} scenes={scenes} isLive navigate={navigate} delay={i * 0.05} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Sessions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
            {upcomingSessions.length > 0 ? 'Upcoming Sessions' : 'No Sessions Scheduled'}
          </p>
          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map((s, i) => (
                <SessionCard key={s.id} session={s} types={types} scenes={scenes} navigate={navigate} delay={0.15 + i * 0.05} />
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
        </motion.div>

        {/* Session Types */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Session Types</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {types.map((t, i) => {
              const Icon = ICON_MAP[t.icon] || Sparkles;
              return (
                <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  className="glass-card p-4 text-center">
                  <Icon size={20} style={{ color: t.color, margin: '0 auto 8px' }} />
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateSessionModal
            types={types} scenes={scenes} authHeaders={authHeaders}
            onClose={() => setShowCreate(false)}
            onCreated={(s) => { setSessions([s, ...sessions]); setShowCreate(false); navigate(`/live/${s.id}`); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
      {/* Scene gradient background */}
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

function CreateSessionModal({ types, scenes, authHeaders, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [sessionType, setSessionType] = useState('meditation');
  const [scene, setScene] = useState('cosmic-temple');
  const [duration, setDuration] = useState(20);
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(`${API}/live/sessions`, {
        title, description: desc, session_type: sessionType, scene, duration_minutes: duration,
      }, { headers: authHeaders });
      onCreated(res.data);
    } catch {
      setCreating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
        </div>

        <button onClick={create} disabled={!title.trim() || creating}
          className="w-full mt-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)', color: '#C084FC', opacity: !title.trim() || creating ? 0.5 : 1 }}
          data-testid="create-session-submit">
          {creating ? 'Creating...' : 'Create & Enter Session'}
        </button>
      </motion.div>
    </motion.div>
  );
}
