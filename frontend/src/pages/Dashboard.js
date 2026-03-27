import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Flame, BookOpen, Heart, Wind, Timer, Zap, Leaf, Radio,
  Sunrise, Users, Trophy, Sparkles, User, Hand, Triangle,
  Play, GraduationCap, Headphones, Lightbulb, Sprout,
  ChevronRight, Music, HeartHandshake, Map, TrendingUp,
  Gamepad2, UserPlus, Check, Quote, Sun, Eye, Star, Moon,
  Compass, Droplets, UtensilsCrossed, Target, PenTool, Globe,
  Calendar, BarChart3, MessageCircle, Orbit, Atom
} from 'lucide-react';
import Walkthrough from '../components/Walkthrough';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const REC_ICON_MAP = {
  wind: Wind, timer: Timer, sun: Sparkles, 'book-open': BookOpen,
  heart: Heart, headphones: Headphones, radio: Radio, sprout: Sprout,
  lightbulb: Lightbulb, hand: Hand, music: Music, 'heart-handshake': HeartHandshake,
  zap: Zap, sunrise: Sunrise, map: Map, 'graduation-cap': GraduationCap,
};

const CATEGORIZED_ACTIONS = [
  {
    label: 'Today', color: '#FCD34D', items: [
      { icon: Sun, label: 'Briefing', path: '/daily-briefing', color: '#FCD34D' },
      { icon: Sparkles, label: 'My Ritual', path: '/daily-ritual', color: '#FCD34D' },
      { icon: Calendar, label: 'Calendar', path: '/cosmic-calendar', color: '#FCD34D' },
      { icon: Heart, label: 'Mood', path: '/mood', color: '#F87171' },
    ],
  },
  {
    label: 'Practice', color: '#D8B4FE', items: [
      { icon: Wind, label: 'Breathe', path: '/breathing', color: '#2DD4BF' },
      { icon: Timer, label: 'Meditate', path: '/meditation', color: '#D8B4FE' },
      { icon: Flame, label: 'Yoga', path: '/yoga', color: '#FB923C' },
      { icon: Zap, label: 'Qigong', path: '/exercises', color: '#FB923C' },
      { icon: Hand, label: 'Mudras', path: '/mudras', color: '#FDA4AF' },
      { icon: Music, label: 'Mantras', path: '/mantras', color: '#FB923C' },
      { icon: Lightbulb, label: 'Light', path: '/light-therapy', color: '#A855F7' },
      { icon: Sun, label: 'Affirm', path: '/affirmations', color: '#93C5FD' },
    ],
  },
  {
    label: 'Divination', color: '#E879F9', items: [
      { icon: Sparkles, label: 'Oracle', path: '/oracle', color: '#E879F9' },
      { icon: Star, label: 'Stars', path: '/star-chart', color: '#E879F9' },
      { icon: Eye, label: 'Forecasts', path: '/forecasts', color: '#E879F9' },
      { icon: Star, label: 'Numerology', path: '/numerology', color: '#E879F9' },
      { icon: Moon, label: 'Dreams', path: '/dreams', color: '#E879F9' },
      { icon: BarChart3, label: 'Cosmic', path: '/cosmic-profile', color: '#E879F9' },
    ],
  },
  {
    label: 'Sanctuary', color: '#2DD4BF', items: [
      { icon: Sprout, label: 'Zen', path: '/zen-garden', color: '#22C55E' },
      { icon: Headphones, label: 'Sounds', path: '/soundscapes', color: '#3B82F6' },
      { icon: Radio, label: 'Hz', path: '/frequencies', color: '#8B5CF6' },
      { icon: Orbit, label: 'VR', path: '/vr', color: '#2DD4BF' },
      { icon: BookOpen, label: 'Journal', path: '/journal', color: '#86EFAC' },
    ],
  },
  {
    label: 'Explore', color: '#FB923C', items: [
      { icon: MessageCircle, label: 'Sage', path: '/coach', color: '#38BDF8' },
      { icon: Globe, label: 'Stories', path: '/creation-stories', color: '#FB923C' },
      { icon: Map, label: 'Journey', path: '/journey', color: '#2DD4BF' },
      { icon: Gamepad2, label: 'Games', path: '/games', color: '#FB923C' },
      { icon: Users, label: 'Community', path: '/community', color: '#FDA4AF' },
      { icon: Flame, label: 'Challenges', path: '/challenges', color: '#FB923C' },
    ],
  },
];

export default function Dashboard() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recs, setRecs] = useState(null);
  const [streak, setStreak] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyWisdom, setDailyWisdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [coherence, setCoherence] = useState(null);

  useEffect(() => {
    // Check if first visit
    const seen = localStorage.getItem('cosmic_walkthrough_seen');
    if (!seen) setShowWalkthrough(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers: authHeaders }).then(res => setStats(res.data)).catch(() => {}),
        axios.get(`${API}/recommendations`, { headers: authHeaders }).then(res => setRecs(res.data)).catch(() => {}),
        axios.post(`${API}/streak/checkin`, {}, { headers: authHeaders }).then(res => setStreak(res.data)).catch(() => axios.get(`${API}/streak`, { headers: authHeaders }).then(r => setStreak(r.data)).catch(() => {})),
        axios.get(`${API}/daily-challenge`, { headers: authHeaders }).then(res => setDailyChallenge(res.data)).catch(() => {}),
        axios.get(`${API}/teachings/daily-wisdom`).then(res => setDailyWisdom(res.data)).catch(() => {}),
        axios.get(`${API}/notifications/quantum-coherence`, { headers: authHeaders }).then(res => setCoherence(res.data)).catch(() => {}),
      ]).finally(() => setLoading(false));
    }
  }, [user, authLoading, authHeaders, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p style={{ color: 'var(--text-muted)' }}>Aligning your energies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12 relative" style={{ background: 'transparent' }} data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--primary)' }}>Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Welcome back, <span className="animate-text-shimmer">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Your consciousness practice at a glance.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-12">
          {[
            { icon: Flame, color: '#FCD34D', label: 'Streak', value: streak?.current_streak || stats?.streak || 0, sub: `${streak?.longest_streak || 0} best | ${streak?.total_active_days || 0} total`, testId: 'dashboard-streak' },
            { icon: Heart, color: '#FDA4AF', label: 'Mood Logs', value: stats?.mood_count || 0, sub: 'emotions tracked', testId: 'dashboard-moods' },
            { icon: BookOpen, color: '#86EFAC', label: 'Journal', value: stats?.journal_count || 0, sub: 'reflections written', testId: 'dashboard-journals' },
            { icon: Gamepad2, color: '#FB923C', label: 'Games', value: '', sub: 'Play to earn', testId: 'dashboard-games', link: '/games' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card p-6 animate-breathe-border group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                onClick={() => card.link && navigate(card.link)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${card.color}12` }}>
                    <Icon size={18} style={{ color: card.color, filter: `drop-shadow(0 0 6px ${card.color}60)` }} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                </div>
                {card.value !== '' ? (
                  <p className="text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }} data-testid={card.testId}>
                    {card.value}
                  </p>
                ) : (
                  <p className="text-sm font-medium" style={{ color: card.color }} data-testid={card.testId}>
                    Play Now
                  </p>
                )}
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quantum Coherence Widget */}
        {coherence && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="glass-card p-6 mb-12 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform"
            onClick={() => navigate('/analytics')}
            data-testid="quantum-coherence-widget"
          >
            {/* Animated background wave */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i}
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${30 + i * 15}%`,
                    background: coherence.phase === 'coherent'
                      ? `linear-gradient(to top, rgba(0,229,255,${0.08 - i * 0.02}), transparent)`
                      : coherence.phase === 'aligning'
                      ? `linear-gradient(to top, rgba(192,132,252,${0.08 - i * 0.02}), transparent)`
                      : `linear-gradient(to top, rgba(248,250,252,${0.03 - i * 0.01}), transparent)`,
                    borderRadius: '50% 50% 0 0',
                  }}
                  animate={{
                    x: coherence.phase === 'coherent' ? [0, 5, 0, -5, 0] : [0, 15, -10, 20, 0],
                    scaleY: coherence.phase === 'coherent' ? [1, 1.05, 1] : [1, 1.15, 0.9, 1.1, 1],
                  }}
                  transition={{ duration: coherence.phase === 'coherent' ? 4 : 6, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>

            <div className="relative z-10 flex items-center gap-6">
              {/* Coherence ring */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(248,250,252,0.04)" strokeWidth="2" />
                  <motion.circle cx="18" cy="18" r="16" fill="none"
                    stroke={coherence.phase === 'coherent' ? '#00E5FF' : coherence.phase === 'aligning' ? '#C084FC' : '#FCD34D'}
                    strokeWidth="2" strokeLinecap="round"
                    strokeDasharray={`${coherence.coherence_score} ${100 - coherence.coherence_score}`}
                    initial={{ strokeDasharray: '0 100' }}
                    animate={{ strokeDasharray: `${coherence.coherence_score} ${100 - coherence.coherence_score}` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 6px ${coherence.phase === 'coherent' ? '#00E5FF' : '#C084FC'}60)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-light" style={{
                    color: coherence.phase === 'coherent' ? '#00E5FF' : coherence.phase === 'aligning' ? '#C084FC' : 'var(--text-primary)',
                    fontFamily: 'Cormorant Garamond, serif',
                  }}>{coherence.coherence_score}</span>
                  <span className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Atom size={12} style={{ color: coherence.phase === 'coherent' ? '#00E5FF' : '#C084FC' }} />
                  <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{
                    color: coherence.phase === 'coherent' ? '#00E5FF' : coherence.phase === 'aligning' ? '#C084FC' : '#FCD34D',
                  }}>
                    {coherence.state}
                  </p>
                </div>
                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{coherence.description}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Moods', val: coherence.signals.mood_logs, color: '#FDA4AF' },
                    { label: 'Journal', val: coherence.signals.journal_entries, color: '#86EFAC' },
                    { label: 'Meditate', val: coherence.signals.meditations, color: '#D8B4FE' },
                    { label: 'Breathe', val: coherence.signals.breathwork, color: '#2DD4BF' },
                    { label: 'Streak', val: coherence.signals.streak, color: '#FCD34D' },
                  ].map(s => (
                    <span key={s.label} className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: `${s.color}08`, color: s.color, border: `1px solid ${s.color}12` }}>
                      {s.label}: {s.val}
                    </span>
                  ))}
                </div>
              </div>

              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        )}

        {/* Daily Challenge Card */}
        {dailyChallenge?.challenge && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-12 cursor-pointer hover:scale-[1.01] transition-transform"
            onClick={() => navigate('/friends')}
            data-testid="dashboard-challenge-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${dailyChallenge.challenge.color}12` }}>
                <Trophy size={22} style={{ color: dailyChallenge.challenge.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: '#FCD34D' }}>Today's Challenge</p>
                <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{dailyChallenge.challenge.title}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{dailyChallenge.challenge.description}</p>
              </div>
              {dailyChallenge.challenge.completed ? (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                  <Check size={12} /> Done
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{ background: `${dailyChallenge.challenge.color}12`, color: dailyChallenge.challenge.color }}>
                  +{dailyChallenge.challenge.xp} XP
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Moods */}
        {dailyWisdom && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="glass-card p-6 mb-12 cursor-pointer hover:scale-[1.01] transition-transform"
            onClick={() => navigate('/teachings')}
            data-testid="dashboard-daily-wisdom">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${dailyWisdom.color}12`, border: `1px solid ${dailyWisdom.color}15` }}>
                <Quote size={20} style={{ color: dailyWisdom.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: dailyWisdom.color }}>
                  Daily Wisdom &middot; {dailyWisdom.teacher_name}
                </p>
                <p className="text-sm italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                  "{dailyWisdom.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${dailyWisdom.color}08`, color: dailyWisdom.color }}>
                    {dailyWisdom.tradition}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {dailyWisdom.teaching_title}
                  </span>
                </div>
                {dailyWisdom.practice && (
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {dailyWisdom.practice}
                  </p>
                )}
              </div>
              <ChevronRight size={14} className="flex-shrink-0 mt-1" style={{ color: 'var(--text-muted)' }} />
            </div>
          </motion.div>
        )}

        {/* Recent Moods */}
        {stats?.recent_moods?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-8 mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Recent Mood Flow</p>
            <div className="flex items-end gap-3 h-24">
              {stats.recent_moods.map((m, i) => (
                <motion.div key={i} className="flex-1 flex flex-col items-center gap-2"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <div
                    className="w-full rounded-lg transition-all duration-500"
                    style={{
                      height: `${(m.intensity / 10) * 100}%`,
                      minHeight: '8px',
                      background: `linear-gradient(to top, rgba(192,132,252,0.3), rgba(45,212,191,0.3))`,
                      boxShadow: '0 0 10px rgba(192,132,252,0.1)',
                    }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.mood?.substring(0, 3)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* For You — Personalized Recommendations */}
        {recs?.recommendations?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="mb-12" data-testid="recommendations-section"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>For You</p>
                {recs.engagement_score > 0 && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.15)' }}>
                    <TrendingUp size={9} /> {recs.engagement_score} awareness
                  </span>
                )}
              </div>
              <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
                {recs.time_period} picks
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recs.recommendations.map((rec, i) => {
                const Icon = REC_ICON_MAP[rec.icon] || Sparkles;
                return (
                  <motion.button
                    key={rec.id + '-' + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    onClick={() => navigate(rec.path)}
                    className="glass-card p-4 flex items-start gap-3 text-left group hover:scale-[1.02] transition-all cursor-pointer"
                    style={{ borderColor: `${rec.color}08` }}
                    whileHover={{ borderColor: `${rec.color}25`, boxShadow: `0 0 20px ${rec.color}10` }}
                    data-testid={`rec-${rec.id}`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${rec.color}10`, border: `1px solid ${rec.color}18` }}>
                      <Icon size={16} style={{ color: rec.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rec.name}</p>
                      <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: rec.color }}>{rec.reason}</p>
                      <p className="text-[10px] mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{rec.desc}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }}
                      className="mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Categorized Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Explore & Practice</p>
          <div className="space-y-6">
            {CATEGORIZED_ACTIONS.map((group, gi) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
                  style={{ color: group.color }}>
                  <span className="w-4 h-px" style={{ background: group.color, opacity: 0.3 }} />
                  {group.label}
                </p>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {group.items.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.label + action.path}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + gi * 0.05 + i * 0.02 }}
                        onClick={() => navigate(action.path)}
                        className="glass-card p-3 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 hover:scale-105"
                        style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                        data-testid={`dashboard-action-${action.label.toLowerCase()}`}
                        whileHover={{ borderColor: `${action.color}30`, boxShadow: `0 0 20px ${action.color}15` }}
                      >
                        <div className="transition-all duration-300 group-hover:scale-110">
                          <Icon size={18} style={{ color: action.color, transition: 'filter 0.3s' }}
                            className="group-hover:drop-shadow-lg" />
                        </div>
                        <span className="text-[10px] transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {showWalkthrough && (
        <Walkthrough onComplete={() => {
          setShowWalkthrough(false);
          localStorage.setItem('cosmic_walkthrough_seen', 'true');
        }} />
      )}
    </div>
  );
}
