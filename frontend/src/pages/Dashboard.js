import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Flame, BookOpen, Heart, Wind, Timer, Zap, Leaf, Radio, Sunrise } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_ACTIONS = [
  { icon: Sunrise, label: 'Rituals', path: '/rituals', color: '#FCD34D' },
  { icon: Wind, label: 'Breathe', path: '/breathing', color: '#2DD4BF' },
  { icon: Timer, label: 'Meditate', path: '/meditation', color: '#D8B4FE' },
  { icon: Zap, label: 'Exercise', path: '/exercises', color: '#FB923C' },
  { icon: Heart, label: 'Mood', path: '/mood', color: '#FDA4AF' },
  { icon: BookOpen, label: 'Journal', path: '/journal', color: '#86EFAC' },
  { icon: Leaf, label: 'Nourish', path: '/nourishment', color: '#22C55E' },
  { icon: Radio, label: 'Frequencies', path: '/frequencies', color: '#8B5CF6' },
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-default)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Aligning your energies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }} data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--primary)' }}>Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Your consciousness practice at a glance.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Flame size={20} style={{ color: '#FCD34D' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Streak</p>
            </div>
            <p className="text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }} data-testid="dashboard-streak">
              {stats?.streak || 0}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>consecutive days</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart size={20} style={{ color: '#FDA4AF' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Mood Logs</p>
            </div>
            <p className="text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }} data-testid="dashboard-moods">
              {stats?.mood_count || 0}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>emotions tracked</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={20} style={{ color: '#86EFAC' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Journal Entries</p>
            </div>
            <p className="text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }} data-testid="dashboard-journals">
              {stats?.journal_count || 0}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>reflections written</p>
          </motion.div>
        </div>

        {/* Recent Moods */}
        {stats?.recent_moods?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-8 mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Recent Mood Flow</p>
            <div className="flex items-end gap-3 h-24">
              {stats.recent_moods.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-lg"
                    style={{
                      height: `${(m.intensity / 10) * 100}%`,
                      minHeight: '8px',
                      background: `linear-gradient(to top, rgba(192,132,252,0.3), rgba(45,212,191,0.3))`,
                      transition: 'height 0.3s',
                    }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.mood?.substring(0, 3)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Continue Your Practice</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="glass-card glass-card-hover p-5 flex flex-col items-center gap-3"
                  data-testid={`dashboard-action-${action.label.toLowerCase()}`}
                >
                  <Icon size={22} style={{ color: action.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
