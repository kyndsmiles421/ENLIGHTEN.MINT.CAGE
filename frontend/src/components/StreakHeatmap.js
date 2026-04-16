import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  CalendarDays, Flame, TrendingUp, Coins,
  Mountain, Droplets, Wind, Sparkles, Zap, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_COLORS = {
  earth: '#D97706',
  water: '#F472B6',
  fire: '#94A3B8',
  air: '#8B5CF6',
  ether: '#FBBF24',
};

const ELEMENT_ICONS = {
  earth: Mountain,
  water: Droplets,
  fire: Flame,
  air: Wind,
  ether: Sparkles,
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getIntensity(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function getIntensityColor(intensity, element) {
  const base = ELEMENT_COLORS[element] || '#8B5CF6';
  const alphas = ['04', '12', '22', '35', '50'];
  return `${base}${alphas[intensity]}`;
}

function ActivityLoopMini({ loops }) {
  const navigate = useNavigate();
  if (!loops || loops.length === 0) return null;

  return (
    <div className="space-y-1.5 mt-3">
      <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
        Engagement Loops
      </p>
      {loops.map(loop => (
        <div key={loop.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:scale-[1.01] transition-transform"
          style={{
            background: loop.active ? `${loop.color}06` : 'rgba(248,250,252,0.01)',
            border: `1px solid ${loop.active ? `${loop.color}12` : 'rgba(248,250,252,0.03)'}`,
          }}
          onClick={() => navigate('/trade-circle')}
          data-testid={`loop-${loop.id}`}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: loop.active ? loop.color : 'rgba(248,250,252,0.1)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] truncate" style={{ color: loop.active ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              <span style={{ color: loop.color }}>{loop.from_system}</span>
              {' \u2192 '}
              <span style={{ color: 'var(--text-primary)' }}>{loop.to_system}</span>
            </p>
          </div>
          <span className="text-[8px] font-medium shrink-0" style={{ color: loop.active ? loop.color : 'var(--text-muted)' }}>
            {loop.metric}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function StreakHeatmap() {
  const { authHeaders } = useAuth();
  const [heatmap, setHeatmap] = useState([]);
  const [activeDays, setActiveDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loops, setLoops] = useState([]);
  const [overview, setOverview] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [heatRes, loopRes] = await Promise.all([
        axios.get(`${API}/activity-loop/heatmap?days=91`, { headers: authHeaders }),
        axios.get(`${API}/activity-loop/progress`, { headers: authHeaders }),
      ]);
      setHeatmap(heatRes.data.heatmap || []);
      setActiveDays(heatRes.data.active_days || 0);
      setStreak(heatRes.data.current_streak || 0);
      setLoops(loopRes.data.loops || []);
      setOverview(loopRes.data.overview || null);
    } catch {}
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return null;

  // Organize heatmap into weeks (columns) for calendar grid
  const weeks = [];
  let currentWeek = [];
  const firstDate = heatmap.length > 0 ? new Date(heatmap[0].date) : new Date();
  const startPad = firstDate.getDay();

  // Pad start
  for (let i = 0; i < startPad; i++) {
    currentWeek.push(null);
  }

  heatmap.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'rgba(248,250,252,0.015)',
        border: '1px solid rgba(248,250,252,0.04)',
      }}
      data-testid="streak-heatmap"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} style={{ color: '#8B5CF6' }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Activity Heatmap
          </span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.15)' }}
              data-testid="streak-badge">
              <Flame size={9} /> {streak}-day streak
            </span>
          )}
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            {activeDays} active / 91 days
          </span>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-0.5 mb-1">
        <div className="w-4" /> {/* spacer for month labels */}
        {DAYS.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[7px]" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-0.5 items-center">
            {/* Month label on first day of month */}
            <div className="w-4 text-[7px] shrink-0" style={{ color: 'var(--text-muted)' }}>
              {week[0] && new Date(week[0].date).getDate() <= 7
                ? new Date(week[0].date).toLocaleDateString('en', { month: 'short' }).slice(0, 3)
                : ''}
            </div>
            {week.map((day, di) => {
              if (!day) return <div key={di} className="flex-1 aspect-square" />;
              const intensity = getIntensity(day.total_activities);
              const elem = day.dominant_element || 'ether';
              const isHovered = hoveredDay === day.date;

              return (
                <div key={di} className="flex-1 aspect-square relative"
                  onMouseEnter={() => setHoveredDay(day.date)}
                  onMouseLeave={() => setHoveredDay(null)}
                  data-testid={`heatmap-cell-${day.date}`}>
                  <div
                    className="w-full h-full rounded-sm transition-all duration-150"
                    style={{
                      background: getIntensityColor(intensity, elem),
                      border: isHovered ? `1px solid ${ELEMENT_COLORS[elem]}40` : '1px solid transparent',
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                      zIndex: isHovered ? 10 : 0,
                      position: 'relative',
                    }}
                  />
                  {/* Tooltip */}
                  {isHovered && day.total_activities > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg whitespace-nowrap z-50"
                      style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.1)' }}>
                      <p className="text-[8px] font-medium" style={{ color: ELEMENT_COLORS[elem] }}>
                        {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[7px]" style={{ color: 'var(--text-secondary)' }}>
                        {day.resonance > 0 && `${day.resonance} practice `}
                        {day.hotspot > 0 && `${day.hotspot} hotspot `}
                        {day.dust_earned > 0 && `+${day.dust_earned} dust`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Less</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-sm"
              style={{ background: getIntensityColor(i, 'ether') }} />
          ))}
          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>More</span>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(ELEMENT_COLORS).map(([elem, color]) => {
            const EIcon = ELEMENT_ICONS[elem];
            return (
              <span key={elem} className="text-[7px] flex items-center gap-0.5" style={{ color }}>
                <EIcon size={7} /> {elem}
              </span>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      {overview && (
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {[
            { label: 'Level', value: overview.consciousness_level, color: '#F472B6', icon: Sparkles },
            { label: 'Dust', value: overview.dust, color: '#2DD4BF', icon: Coins },
            { label: 'Gates', value: `${overview.gates_unlocked}/5`, color: '#FBBF24', icon: Zap },
            { label: 'Gems', value: overview.polished_gems, color: '#D97706', icon: Mountain },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-1.5 text-center"
              style={{ background: `${s.color}04`, border: `1px solid ${s.color}08` }}>
              <s.icon size={9} className="mx-auto mb-0.5" style={{ color: s.color }} />
              <p className="text-[10px] font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
              <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Activity Loops */}
      <ActivityLoopMini loops={loops} />

      {/* CTA */}
      <button onClick={() => navigate('/trade-circle')}
        className="w-full mt-3 py-2 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.1)' }}
        data-testid="heatmap-cta">
        <TrendingUp size={10} /> Keep the loops active <ArrowRight size={10} />
      </button>
    </motion.div>
  );
}
