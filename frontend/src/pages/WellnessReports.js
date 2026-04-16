import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Loader2, TrendingUp, Activity, Calendar, Flame, Heart, BookOpen, Moon as MoonIcon } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function StatBox({ label, value, color, icon: Icon }) {
  return (
    <div className="rounded-xl p-4 text-center" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}
      style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
      {Icon && <Icon size={16} className="mx-auto mb-1" style={{ color }} />}
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
    </div>
  );
}

function InsightCard({ insight }) {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3"
      style={{ background: `${insight.color}06`, border: `1px solid ${insight.color}12` }}>
      <TrendingUp size={14} style={{ color: insight.color, marginTop: 2, flexShrink: 0 }} />
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>{insight.text}</p>
    </div>
  );
}

function MoodBar({ mood, count, max, color }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-16 text-right capitalize" style={{ color: 'rgba(255,255,255,0.75)' }}>{mood}</span>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.05)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-full" style={{ background: color || '#D8B4FE' }} />
      </div>
      <span className="text-xs w-6" style={{ color: 'rgba(255,255,255,0.7)' }}>{count}</span>
    </div>
  );
}

export default function WellnessReports() {
  const { token, authHeaders } = useAuth();
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('wellness_reports', 8); }, []);
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    axios.get(`${API}/wellness-reports/${period}`, { headers: authHeaders })
      .then(r => setReport(r.data))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, [token, period]);

  const s = report?.summary;
  const a = report?.activities;
  const moodColors = { happy: '#FCD34D', peaceful: '#22C55E', grateful: '#D8B4FE', stressed: '#EF4444', anxious: '#FB923C', sad: '#3B82F6', angry: '#EF4444', tired: '#6B7280', neutral: '#9CA3AF' };
  const maxMood = s?.mood_breakdown ? Math.max(...Object.values(s.mood_breakdown), 1) : 1;

  return (
    <div className="min-h-screen immersive-page pt-24 pb-20 px-4 max-w-4xl mx-auto" data-testid="wellness-reports-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#818CF8' }}>
            <BarChart3 size={12} className="inline mr-1" /> Wellness Insights
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Wellness Reports
          </h1>
        </div>

        <div className="flex gap-2 justify-center mb-8">
          {['weekly', 'monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} data-testid={`period-${p}`}
              className="px-5 py-2 rounded-xl text-xs font-medium transition-all capitalize"
              style={{
                background: period === p ? 'rgba(129,140,248,0.15)' : 'rgba(0,0,0,0)',
                border: `1px solid ${period === p ? 'rgba(129,140,248,0.3)' : 'rgba(248,250,252,0.06)'}`,
                color: period === p ? '#818CF8' : 'rgba(255,255,255,0.75)',
              }}>{p}</button>
          ))}
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(255,255,255,0.7)' }}>Sign in to view reports</p>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={28} style={{ color: '#818CF8' }} /></div>
        ) : report ? (
          <div className="space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Activities" value={s?.total_activities || 0} color="#818CF8" icon={Activity} />
              <StatBox label="Streak" value={`${s?.current_streak || 0}d`} color="#FB923C" icon={Flame} />
              <StatBox label="Mood Avg" value={s?.avg_intensity || 0} color="#22C55E" icon={Heart} />
              <StatBox label="Moods Logged" value={s?.mood_entries || 0} color="#D8B4FE" icon={Heart} />
            </div>

            {/* Activity breakdown */}
            <div className="rounded-2xl p-5" style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.1)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#818CF8' }}>Activity Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Journals', val: a?.journals, icon: BookOpen, color: '#3B82F6' },
                  { label: 'Meditations', val: a?.meditations, icon: Activity, color: '#D8B4FE' },
                  { label: 'Yoga', val: a?.yoga_sessions, icon: Flame, color: '#FB923C' },
                  { label: 'Meals', val: a?.meals_logged, icon: Calendar, color: '#22C55E' },
                  { label: 'Dreams', val: a?.dreams_logged, icon: MoonIcon, color: '#6366F1' },
                  { label: 'Reiki', val: a?.reiki_sessions, icon: Activity, color: '#818CF8' },
                  { label: 'Acupressure', val: a?.acupressure_sessions, icon: Activity, color: '#EF4444' },
                  { label: 'Rituals', val: a?.rituals_completed, icon: Flame, color: '#FCD34D' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${item.color}06` }}>
                    <item.icon size={12} style={{ color: item.color }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.label}</span>
                    <span className="text-xs font-bold ml-auto" style={{ color: item.color }}>{item.val || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood breakdown */}
            {s?.mood_breakdown && Object.keys(s.mood_breakdown).length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: 'transparent', border: '1px solid rgba(216,180,254,0.1)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#D8B4FE' }}>Mood Distribution</p>
                <div className="space-y-2">
                  {Object.entries(s.mood_breakdown).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                    <MoodBar key={mood} mood={mood} count={count} max={maxMood} color={moodColors[mood] || '#D8B4FE'} />
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {report.insights && report.insights.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>Insights</p>
                <div className="space-y-2">
                  {report.insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
