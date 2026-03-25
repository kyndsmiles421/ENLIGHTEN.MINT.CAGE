import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Flame, BookOpen, Heart, Wind, Timer, Zap, Leaf, Radio,
  Sunrise, Users, Trophy, Sparkles, User, Hand, Triangle,
  Play, GraduationCap, Headphones
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'Oracle', path: '/oracle', color: '#D8B4FE' },
  { icon: Wind, label: 'Breathe', path: '/breathing', color: '#2DD4BF' },
  { icon: Timer, label: 'Meditate', path: '/meditation', color: '#D8B4FE' },
  { icon: Headphones, label: 'Sounds', path: '/soundscapes', color: '#3B82F6' },
  { icon: Radio, label: 'Frequencies', path: '/frequencies', color: '#8B5CF6' },
  { icon: Hand, label: 'Mudras', path: '/mudras', color: '#FDA4AF' },
  { icon: Triangle, label: 'Yantra', path: '/yantra', color: '#EF4444' },
  { icon: Flame, label: 'Tantra', path: '/tantra', color: '#FCD34D' },
  { icon: Zap, label: 'Exercise', path: '/exercises', color: '#FB923C' },
  { icon: Sunrise, label: 'Rituals', path: '/rituals', color: '#FCD34D' },
  { icon: Trophy, label: 'Challenges', path: '/challenges', color: '#FB923C' },
  { icon: Heart, label: 'Mood', path: '/mood', color: '#F87171' },
  { icon: BookOpen, label: 'Journal', path: '/journal', color: '#86EFAC' },
  { icon: Users, label: 'Community', path: '/community', color: '#FDA4AF' },
  { icon: Play, label: 'Videos', path: '/videos', color: '#2DD4BF' },
  { icon: GraduationCap, label: 'Classes', path: '/classes', color: '#FCD34D' },
  { icon: User, label: 'Profile', path: '/profile', color: '#E879F9' },
];

export default function Dashboard() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      axios.get(`${API}/dashboard/stats`, { headers: authHeaders })
        .then(res => setStats(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Flame, color: '#FCD34D', label: 'Streak', value: stats?.streak || 0, sub: 'consecutive days', testId: 'dashboard-streak' },
            { icon: Heart, color: '#FDA4AF', label: 'Mood Logs', value: stats?.mood_count || 0, sub: 'emotions tracked', testId: 'dashboard-moods' },
            { icon: BookOpen, color: '#86EFAC', label: 'Journal Entries', value: stats?.journal_count || 0, sub: 'reflections written', testId: 'dashboard-journals' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card p-8 animate-breathe-border group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${card.color}12` }}>
                    <Icon size={18} style={{ color: card.color, filter: `drop-shadow(0 0 6px ${card.color}60)` }} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                </div>
                <p className="text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }} data-testid={card.testId}>
                  {card.value}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{card.sub}</p>
              </motion.div>
            );
          })}
        </div>

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

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Explore & Practice</p>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.02 }}
                  onClick={() => navigate(action.path)}
                  className="glass-card p-4 flex flex-col items-center gap-2.5 group cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                  data-testid={`dashboard-action-${action.label.toLowerCase()}`}
                  whileHover={{ borderColor: `${action.color}30`, boxShadow: `0 0 20px ${action.color}15` }}
                >
                  <div className="transition-all duration-300 group-hover:scale-110">
                    <Icon size={20} style={{ color: action.color, transition: 'filter 0.3s' }}
                      className="group-hover:drop-shadow-lg" />
                  </div>
                  <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
