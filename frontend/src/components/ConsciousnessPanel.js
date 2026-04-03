import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mountain, Droplets, Flame, Wind, Sparkles,
  ChevronRight, Eye, EyeOff, Settings, Check, Lock,
  BookOpen, Heart, Brain, Flower2, Dumbbell, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LEVEL_ICONS = {
  1: Mountain,
  2: Droplets,
  3: Flame,
  4: Wind,
  5: Sparkles,
};

const ELEMENT_LABELS = {
  1: 'Earth',
  2: 'Water',
  3: 'Fire',
  4: 'Air',
  5: 'Ether',
};

const LEVEL_ROUTES = {
  1: '/breathing',
  2: '/mood-tracker',
  3: '/mastery-avenues',
  4: '/suanpan',
  5: '/master-view',
};

const QUICK_ACTIONS = [
  { activity: 'breathing_session', label: 'Breathe', icon: Wind, path: '/breathing', color: '#2DD4BF' },
  { activity: 'mood_log', label: 'Mood', icon: Heart, path: '/mood-tracker', color: '#F472B6' },
  { activity: 'journal_entry', label: 'Journal', icon: BookOpen, path: '/journal', color: '#34D399' },
  { activity: 'meditation_complete', label: 'Meditate', icon: Flower2, path: '/meditation', color: '#8B5CF6' },
];

export function ConsciousnessAura({ level, size = 40, className = '' }) {
  const levels = {
    1: { color: '#D97706', glow: 'rgba(217,119,6,0.25)' },
    2: { color: '#F472B6', glow: 'rgba(244,114,182,0.25)', secondary: '#2DD4BF' },
    3: { color: '#94A3B8', glow: 'rgba(148,163,184,0.25)', secondary: '#3B82F6' },
    4: { color: '#8B5CF6', glow: 'rgba(139,92,246,0.3)', secondary: '#6366F1' },
    5: { color: '#FBBF24', glow: 'rgba(251,191,36,0.35)', secondary: '#FFFBEB' },
  };
  const { color, glow, secondary } = levels[level] || levels[1];
  const isMax = level === 5;

  return (
    <motion.div
      className={`rounded-full flex items-center justify-center ${className}`}
      style={{
        width: size, height: size,
        background: isMax
          ? `radial-gradient(circle, rgba(255,251,235,0.15) 0%, ${glow} 40%, transparent 70%)`
          : `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        boxShadow: isMax
          ? `0 0 ${size}px ${glow}, 0 0 ${size * 1.5}px rgba(255,251,235,0.15), inset 0 0 ${size / 2}px ${glow}`
          : `0 0 ${size / 2}px ${glow}, inset 0 0 ${size / 3}px ${glow}`,
        border: `1.5px solid ${color}40`,
      }}
      animate={{
        boxShadow: isMax ? [
          `0 0 ${size}px ${glow}, 0 0 ${size * 1.5}px rgba(255,251,235,0.15), inset 0 0 ${size / 2}px ${glow}`,
          `0 0 ${size * 1.5}px ${glow}, 0 0 ${size * 2}px rgba(255,251,235,0.25), inset 0 0 ${size}px ${glow}`,
          `0 0 ${size}px ${glow}, 0 0 ${size * 1.5}px rgba(255,251,235,0.15), inset 0 0 ${size / 2}px ${glow}`,
        ] : [
          `0 0 ${size / 2}px ${glow}, inset 0 0 ${size / 3}px ${glow}`,
          `0 0 ${size}px ${glow}, inset 0 0 ${size / 2}px ${glow}`,
          `0 0 ${size / 2}px ${glow}, inset 0 0 ${size / 3}px ${glow}`,
        ],
      }}
      transition={{ duration: isMax ? 2 : 3, repeat: Infinity, ease: 'easeInOut' }}
      data-testid="consciousness-aura"
    >
      {React.createElement(LEVEL_ICONS[level] || Mountain, { size: size * 0.45, style: { color: secondary || color } })}
    </motion.div>
  );
}

export function ConsciousnessRankBadge({ level, name, subtitle, color, compact = false }) {
  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        data-testid="consciousness-rank-badge"
      >
        {React.createElement(LEVEL_ICONS[level] || Mountain, { size: 9 })}
        L{level}
      </span>
    );
  }
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}
      data-testid="consciousness-rank-badge"
    >
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}20` }}>
        {React.createElement(LEVEL_ICONS[level] || Mountain, { size: 13, style: { color } })}
      </div>
      <div>
        <p className="text-[10px] font-bold" style={{ color }}>{name}</p>
        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
    </div>
  );
}

export default function ConsciousnessPanel({ compact = false, onNavigate }) {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/consciousness/status`, { headers: authHeaders });
      setData(res.data);
    } catch {}
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const setDisplayMode = async (mode) => {
    try {
      await axios.post(`${API}/consciousness/display-mode`, { mode }, { headers: authHeaders });
      setData(prev => ({ ...prev, display_mode: mode }));
      toast.success(`Display mode: ${mode}`);
    } catch {}
  };

  const handleLevelClick = (lvl) => {
    if (lvl.level <= (data?.level || 1)) {
      const route = LEVEL_ROUTES[lvl.level] || '/mastery-avenues';
      navigate(route);
    } else {
      toast(`${lvl.name} unlocks at ${lvl.xp_required} XP`, {
        description: lvl.gate_label,
        icon: React.createElement(Lock, { size: 14 }),
      });
    }
  };

  if (loading || !data) {
    return (
      <div className="rounded-xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="h-4 w-32 rounded bg-white/5 mb-2" />
        <div className="h-2 w-full rounded bg-white/5" />
      </div>
    );
  }

  const { level, level_info, xp_total, xp_into_level, xp_for_next, progress_pct, next_level, display_mode, is_max_level, recent_activity } = data;
  const Icon = LEVEL_ICONS[level] || Mountain;
  const showAura = display_mode === 'aura' || display_mode === 'hybrid';
  const showRank = display_mode === 'rank' || display_mode === 'hybrid';

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-2 cursor-pointer"
        data-testid="consciousness-compact"
        onClick={() => navigate('/mastery-avenues')}
        whileTap={{ scale: 0.95 }}
      >
        {showAura && <ConsciousnessAura level={level} size={28} />}
        {showRank && <ConsciousnessRankBadge level={level} name={level_info.name} subtitle={level_info.subtitle} color={level_info.color} compact />}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden relative cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${level_info.color}08, ${level_info.aura_glow.replace('0.3', '0.06')})`,
        border: `1px solid ${level_info.color}15`,
      }}
      data-testid="consciousness-panel"
    >
      {/* Aura glow background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 20% 50%, ${level_info.aura_glow.replace('0.3', '0.08')} 0%, transparent 60%)`,
      }} />

      <div className="relative p-4">
        {/* Header — clickable to navigate */}
        <div
          className="flex items-center justify-between mb-3"
          onClick={() => navigate('/mastery-avenues')}
          data-testid="consciousness-header-link"
        >
          <div className="flex items-center gap-3">
            {showAura && <ConsciousnessAura level={level} size={36} />}
            <div>
              <div className="flex items-center gap-2">
                {showRank && (
                  <span className="text-xs font-bold" style={{ color: level_info.color }}>
                    Level {level}
                  </span>
                )}
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {level_info.name}
                </span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {level_info.subtitle} — {level_info.element}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              data-testid="consciousness-settings-btn"
            >
              <Settings size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
            <ChevronRight size={13} style={{ color: level_info.color, opacity: 0.5 }} />
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {is_max_level ? 'MAX LEVEL' : `${xp_into_level} / ${xp_for_next} XP`}
            </span>
            <span className="text-[9px] font-bold" style={{ color: level_info.color }}>
              {progress_pct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${level_info.aura_color}, ${level_info.color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress_pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Next Level Preview — clickable */}
        {next_level && (
          <motion.div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-3 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.02)' }}
            whileHover={{ background: 'rgba(255,255,255,0.04)' }}
            onClick={() => navigate('/mastery-avenues')}
            data-testid="consciousness-next-level-link"
          >
            <Lock size={10} style={{ color: next_level.color }} />
            <span className="text-[9px] flex-1" style={{ color: 'var(--text-muted)' }}>
              Next: <span style={{ color: next_level.color, fontWeight: 600 }}>{next_level.name}</span> — {next_level.gate_label}
            </span>
            <ChevronRight size={10} style={{ color: next_level.color, opacity: 0.4 }} />
          </motion.div>
        )}

        {/* Level Map — interactive nodes */}
        <div className="flex items-center gap-1 mb-3" data-testid="consciousness-level-map">
          {(data.all_levels || []).map((lvl, i) => {
            const active = lvl.level <= level;
            const LvlIcon = LEVEL_ICONS[lvl.level] || Mountain;
            return (
              <div key={lvl.level} className="flex items-center gap-1 flex-1">
                <motion.button
                  className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: active ? `${lvl.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? lvl.color + '40' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLevelClick(lvl)}
                  title={`${lvl.name} — ${lvl.subtitle}${active ? '' : ' (Locked)'}`}
                  data-testid={`consciousness-level-node-${lvl.level}`}
                >
                  {active ? (
                    <LvlIcon size={10} style={{ color: lvl.color }} />
                  ) : (
                    <Lock size={8} style={{ color: 'var(--text-muted)' }} />
                  )}
                </motion.button>
                {i < 4 && (
                  <div className="flex-1 h-px" style={{
                    background: lvl.level < level
                      ? `linear-gradient(90deg, ${lvl.color}40, ${(data.all_levels[i + 1] || lvl).color}40)`
                      : 'rgba(255,255,255,0.06)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Quick XP Actions */}
        <div className="grid grid-cols-4 gap-1.5" data-testid="consciousness-quick-actions">
          {QUICK_ACTIONS.map(action => (
            <motion.button
              key={action.activity}
              className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg cursor-pointer"
              style={{
                background: `${action.color}06`,
                border: `1px solid ${action.color}10`,
              }}
              whileHover={{ scale: 1.05, borderColor: `${action.color}25` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              data-testid={`consciousness-action-${action.activity}`}
            >
              {React.createElement(action.icon, { size: 12, style: { color: action.color } })}
              <span className="text-[7px]" style={{ color: action.color }}>{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Recent XP Activity (collapsed, togglable) */}
        {recent_activity && recent_activity.length > 0 && (
          <motion.div className="mt-2">
            <button
              className="w-full flex items-center justify-between py-1 text-[8px]"
              style={{ color: 'var(--text-muted)' }}
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
              data-testid="consciousness-toggle-activity"
            >
              <span>Recent XP</span>
              <Zap size={8} style={{ color: level_info.color }} />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {recent_activity.slice(-3).reverse().map((act, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 text-[8px]"
                      style={{ color: 'var(--text-muted)' }}>
                      <span>{act.activity?.replace(/_/g, ' ')}</span>
                      <span style={{ color: level_info.color, fontWeight: 600 }}>+{act.xp} XP</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Display Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Display Mode</p>
              <div className="flex gap-2">
                {['rank', 'aura', 'hybrid'].map(mode => (
                  <button
                    key={mode}
                    onClick={(e) => { e.stopPropagation(); setDisplayMode(mode); }}
                    className="flex-1 px-2 py-1.5 rounded-lg text-[10px] capitalize transition-all"
                    style={{
                      background: display_mode === mode ? `${level_info.color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${display_mode === mode ? level_info.color + '30' : 'rgba(255,255,255,0.05)'}`,
                      color: display_mode === mode ? level_info.color : 'var(--text-muted)',
                      fontWeight: display_mode === mode ? 600 : 400,
                    }}
                    data-testid={`display-mode-${mode}`}
                  >
                    {mode === 'rank' && <Eye size={9} className="inline mr-1" />}
                    {mode === 'aura' && <Sparkles size={9} className="inline mr-1" />}
                    {mode === 'hybrid' && <Check size={9} className="inline mr-1" />}
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
