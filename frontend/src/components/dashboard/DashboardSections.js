import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame, BookOpen, Heart, Wind, Timer, Zap, Sparkles, Star, Moon,
  ChevronRight, Music, Trophy, Play, Check, Quote, Eye,
  Gamepad2, Atom, Map, ScrollText, Pin, X,
  CloudSun, Moon as MoonIcon, Waves, TrendingUp, Sprout,
  Headphones, Radio, Lightbulb, Hand, Sunrise, GraduationCap, Compass
} from 'lucide-react';

/* ─── MiniSparkline ─── */
export function MiniSparkline({ data, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const h = 40, w = 100;
  const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - (v / max) * h * 0.8 - 2 }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = line + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg className="absolute bottom-0 right-0 opacity-[0.12]" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace('#','')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Stats ─── */
export function StatsSection({ stats, streak, navigate }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8" data-testid="stats-section">
      {[
        { icon: Flame, color: '#FCD34D', label: 'Streak', value: streak?.current_streak || stats?.streak || 0, sub: `${streak?.longest_streak || 0} best | ${streak?.total_active_days || 0} total`, testId: 'dashboard-streak', link: '/growth-timeline', sparkline: stats?.sparkline?.activity },
        { icon: Heart, color: '#FDA4AF', label: 'Mood Logs', value: stats?.mood_count || 0, sub: 'emotions tracked', testId: 'dashboard-moods', link: '/mood', sparkline: stats?.sparkline?.moods },
        { icon: BookOpen, color: '#86EFAC', label: 'Journal', value: stats?.journal_count || 0, sub: 'reflections written', testId: 'dashboard-journals', link: '/journal', sparkline: stats?.sparkline?.journals },
        { icon: Gamepad2, color: '#FB923C', label: 'Games', value: '', sub: 'Play to earn', testId: 'dashboard-games', link: '/games' },
      ].map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.button key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}
            onClick={() => navigate(card.link)}
            onTouchEnd={(e) => { e.preventDefault(); navigate(card.link); }}
            className="glass-card p-4 text-left group active:scale-[0.97] transition-all duration-200 relative overflow-hidden"
            style={{ touchAction: 'manipulation' }}
            data-testid={card.testId}>
            {card.sparkline && <MiniSparkline data={card.sparkline} color={card.color} />}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}12` }}>
                    <Icon size={14} style={{ color: card.color, filter: `drop-shadow(0 0 4px ${card.color}60)` }} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                </div>
                <ChevronRight size={12} style={{ color: card.color, opacity: 0.5 }} className="group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
              </div>
              {card.value !== '' ? (
                <p className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{card.value}</p>
              ) : (
                <p className="text-sm font-medium" style={{ color: card.color }}>Play Now</p>
              )}
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{card.sub}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Cosmic Weather ─── */
export function CosmicWeatherSection({ weather, navigate }) {
  const LUNAR_ICONS = {
    'New Moon': MoonIcon, 'Full Moon': CloudSun, 'Waxing Crescent': MoonIcon,
    'Waning Crescent': MoonIcon, 'First Quarter': MoonIcon, 'Last Quarter': MoonIcon,
    'Waxing Gibbous': MoonIcon, 'Waning Gibbous': MoonIcon,
  };
  const LunarIcon = LUNAR_ICONS[weather.lunar?.phase] || MoonIcon;
  const elColor = { Fire: '#EF4444', Water: '#3B82F6', Earth: '#F59E0B', Air: '#94A3B8' }[weather.element] || '#C084FC';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="mb-8" data-testid="cosmic-weather-widget">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CloudSun size={11} style={{ color: '#E879F9' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Cosmic Weather</p>
        </div>
        <button onClick={() => navigate('/cosmic-insights')}
          className="text-[10px] flex items-center gap-1 transition-all hover:gap-2"
          style={{ color: '#E879F9' }}
          data-testid="weather-see-all">
          Full Report <ChevronRight size={10} />
        </button>
      </div>
      <div className="glass-card p-4 relative overflow-hidden group cursor-pointer hover:scale-[1.005] transition-transform"
        onClick={() => navigate('/cosmic-insights')}
        data-testid="cosmic-weather-card">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
          style={{ background: `radial-gradient(circle, ${elColor}, transparent)`, transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${elColor}10`, border: `1px solid ${elColor}18` }}>
              <Waves size={18} style={{ color: elColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {weather.zodiac?.sign} Season
                </p>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${elColor}10`, color: elColor }}>
                  {weather.element}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <LunarIcon size={9} style={{ color: 'var(--text-muted)' }} />
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {weather.lunar?.phase} — {weather.lunar?.energy}
                </p>
              </div>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            {weather.forecast?.length > 200 ? weather.forecast.slice(0, 200) + '...' : weather.forecast}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {weather.tool_recommendations?.mixer && (
              <span className="text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.1)' }}>
                <Music size={7} /> {weather.tool_recommendations.mixer.freq}
              </span>
            )}
            {weather.rpg_bonuses?.lunar_xp_bonus > 0 && (
              <span className="text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(251,146,60,0.06)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.1)' }}>
                <Zap size={7} /> +{weather.rpg_bonuses.lunar_xp_bonus} XP
              </span>
            )}
            {weather.tool_recommendations?.reset_pulse && (
              <span className="text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.1)' }}>
                <Flame size={7} /> Reset Pulse
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Nexus Intent ─── */
const INTENT_ICONS = { wind: Wind, timer: Timer, heart: Heart, 'book-open': BookOpen, map: Compass, zap: Zap, star: Star };

export function NexusIntentSection({ intent, navigate, playFrequency }) {
  if (intent.state === 'balanced') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="mb-8" data-testid="nexus-intent-widget">
        <div className="relative overflow-hidden rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.03), rgba(13,14,26,0.8))', border: '1px solid rgba(34,197,94,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.08)' }}>
              <Check size={18} style={{ color: '#22C55E' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: '#22C55E' }}>Elements in Harmony</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Harmony: {intent.harmony} | Your practices are creating balance
              </p>
            </div>
            <button onClick={() => navigate('/dream-realms')}
              className="text-[9px] px-2 py-1 rounded-lg"
              style={{ background: 'rgba(168,85,247,0.06)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.1)' }}
              data-testid="enter-dream-realm">
              Dream Realm
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const color = intent.element_color || '#A855F7';
  const ActionIcon = INTENT_ICONS[intent.action?.icon] || Star;
  const confidence = intent.confidence || 0;
  const freq = intent.frequency;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
      className="mb-8" data-testid="nexus-intent-widget">
      <div className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg, ${color}06, rgba(13,14,26,0.85))`,
          border: `1px solid ${color}12`, backdropFilter: 'blur(16px)',
          boxShadow: `0 0 ${confidence * 30}px ${color}08`,
        }}>
        <motion.div className="absolute inset-0 rounded-2xl"
          animate={{ boxShadow: [`inset 0 0 ${confidence * 15}px ${color}03`, `inset 0 0 ${confidence * 30}px ${color}06`, `inset 0 0 ${confidence * 15}px ${color}03`] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
              <motion.div className="absolute inset-0 rounded-xl"
                animate={{ opacity: [0.2 * confidence, 0.5 * confidence, 0.2 * confidence] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ border: `1px solid ${color}`, boxShadow: `0 0 8px ${color}30` }} />
              <Zap size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold" style={{ color }}>
                  {intent.element_name} {intent.direction === 'excess' ? 'Excess' : 'Deficiency'}
                </p>
                <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase"
                  style={{ background: `${color}10`, color }}>
                  {(confidence * 100).toFixed(0)}% drift
                </span>
              </div>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{intent.warning || intent.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { if (freq?.hz) playFrequency(freq.hz); navigate(intent.action?.path || '/nexus'); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-semibold"
              style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
              data-testid="nexus-intent-action">
              <ActionIcon size={12} />
              {intent.action?.label || 'Align'}
              {freq && <span className="text-[8px] opacity-70">| {freq.hz} Hz</span>}
            </motion.button>
            {[
              { path: '/rock-hounding', label: 'Mine', color: '#F59E0B', testId: 'enter-rock-hounding' },
              { path: '/forgotten-languages', label: 'Decode', color: '#3B82F6', testId: 'enter-forgotten-languages' },
              { path: '/dream-realms', label: 'Dream', color: '#A855F7', testId: 'enter-dream-realm', icon: Eye },
              { path: '/cosmic-store', label: 'Store', color: '#FCD34D', testId: 'enter-cosmic-store' },
              { path: '/evolution-lab', label: 'Evolve', color: '#22C55E', testId: 'enter-evolution-lab' },
              { path: '/refinement-lab', label: 'Refine', color: '#F59E0B', testId: 'enter-refinement-lab' },
              { path: '/smartdock', label: 'Dock', color: '#A855F7', testId: 'enter-smartdock' },
            ].map(btn => (
              <button key={btn.path} onClick={() => navigate(btn.path)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-medium"
                style={{ background: `${btn.color}06`, color: btn.color, border: `1px solid ${btn.color}10` }}
                data-testid={btn.testId}>
                {btn.icon && React.createElement(btn.icon, { size: 10 })}
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Pinned ─── */
export function PinnedSection({ pinned, navigate, editMode, onRemove, allActions }) {
  const pinnedActions = pinned.map(path => allActions.find(a => a.path === path)).filter(Boolean);
  if (pinnedActions.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8" data-testid="pinned-section">
      <div className="flex items-center gap-2 mb-3">
        <Pin size={11} style={{ color: '#C084FC' }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>My Shortcuts</p>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {pinnedActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
              className="relative">
              <button onClick={() => navigate(action.path)}
                className="w-full glass-card p-3 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 hover:scale-105"
                data-testid={`pinned-${action.label.toLowerCase()}`}
                style={{ touchAction: 'manipulation' }}>
                <div className="transition-all duration-300 group-hover:scale-110">
                  <Icon size={18} style={{ color: action.color, transition: 'filter 0.3s' }} className="group-hover:drop-shadow-lg" />
                </div>
                <span className="text-[10px] transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
              </button>
              {editMode && (
                <button onClick={(e) => { e.stopPropagation(); onRemove(action.path); }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(239,68,68,0.9)' }}>
                  <X size={9} style={{ color: '#fff' }} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Suggestions ─── */
export function SuggestionsSection({ suggestions, navigate, playFrequency }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="mb-8" data-testid="smart-suggestions">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Suggested for You</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((s, i) => {
          const isFreqAction = s.action === 'play_frequency' && s.frequency_hz;
          return (
            <motion.button key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
              onClick={() => { isFreqAction ? playFrequency(s.frequency_hz) : navigate(s.path); }}
              className="glass-card p-3.5 flex items-center gap-3 text-left group hover:scale-[1.01] transition-all"
              data-testid={`suggestion-${s.id}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                {isFreqAction ? <Play size={15} style={{ color: s.color }} /> : <Sparkles size={15} style={{ color: s.color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
              <ChevronRight size={11} style={{ color: s.color, opacity: 0.5 }} />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Scripture ─── */
export function ScriptureSection({ scripture, navigate }) {
  const { chapters_read, active_journeys, recent_chapters } = scripture;
  if (chapters_read === 0 && active_journeys === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="mb-8" data-testid="scripture-section">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScrollText size={11} style={{ color: '#D97706' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Sacred Scriptures</p>
        </div>
        <button onClick={() => navigate('/bible')} className="text-[10px] flex items-center gap-1 transition-all hover:gap-2" style={{ color: '#D97706' }} data-testid="scripture-browse-all">
          Browse Library <ChevronRight size={10} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button onClick={() => navigate('/bible')} className="glass-card p-3.5 text-left group hover:scale-[1.01] transition-all" data-testid="scripture-chapters-card">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(217,119,6,0.1)' }}><BookOpen size={13} style={{ color: '#D97706' }} /></div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Chapters</p>
          </div>
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{chapters_read}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>chapters explored</p>
        </button>
        <button onClick={() => navigate('/bible?tab=journeys')} className="glass-card p-3.5 text-left group hover:scale-[1.01] transition-all" data-testid="scripture-journeys-card">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.1)' }}><Map size={13} style={{ color: '#818CF8' }} /></div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Journeys</p>
          </div>
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{active_journeys}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>guided paths started</p>
        </button>
      </div>
      {recent_chapters && recent_chapters.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(217,119,6,0.6)' }}>Continue Reading</p>
          {recent_chapters.map((ch, i) => (
            <motion.button key={`${ch.book_id}-${ch.chapter_num}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
              onClick={() => navigate(`/bible?book=${ch.book_id}&chapter=${ch.chapter_num}`)}
              className="w-full glass-card p-3 flex items-center gap-3 text-left group hover:scale-[1.01] transition-all" data-testid={`scripture-recent-${i}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.12)' }}>
                <ScrollText size={13} style={{ color: '#D97706' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{ch.book_title || ch.book_id} — Chapter {ch.chapter_num}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Pick up where you left off</p>
              </div>
              <ChevronRight size={11} style={{ color: '#D97706', opacity: 0.5 }} className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Coherence ─── */
export function CoherenceSection({ coherence, isLight, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="glass-card p-5 mb-6 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => navigate('/analytics')} data-testid="quantum-coherence-widget">
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="absolute bottom-0 left-0 right-0"
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
            transition={{ duration: coherence.phase === 'coherent' ? 4 : 6, repeat: Infinity, delay: i * 0.5 }} />
        ))}
      </div>
      <div className="relative z-10 flex items-center gap-6">
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
              style={{ filter: `drop-shadow(0 0 6px ${coherence.phase === 'coherent' ? '#00E5FF' : '#C084FC'}60)` }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-lg font-light" style={{ color: coherence.phase === 'coherent' ? '#00E5FF' : coherence.phase === 'aligning' ? '#C084FC' : 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{coherence.coherence_score}</span>
            <span className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Atom size={12} style={{ color: coherence.phase === 'coherent' ? '#00E5FF' : '#C084FC' }} />
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{
              color: coherence.phase === 'coherent' ? (isLight ? '#0891B2' : '#00E5FF') : coherence.phase === 'aligning' ? (isLight ? '#7C3AED' : '#C084FC') : (isLight ? '#B45309' : '#FCD34D'),
            }}>{coherence.state}</p>
          </div>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{coherence.description}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Moods', val: coherence.signals.mood_logs, color: '#FDA4AF', lightColor: '#DB2777' },
              { label: 'Journal', val: coherence.signals.journal_entries, color: '#86EFAC', lightColor: '#16A34A' },
              { label: 'Meditate', val: coherence.signals.meditations, color: '#D8B4FE', lightColor: '#7C3AED' },
              { label: 'Breathe', val: coherence.signals.breathwork, color: '#2DD4BF', lightColor: '#0D9488' },
              { label: 'Streak', val: coherence.signals.streak, color: '#FCD34D', lightColor: '#B45309' },
            ].map(s => {
              const c = isLight ? s.lightColor : s.color;
              return <span key={s.label} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${c}12`, color: c, border: `1px solid ${c}20` }}>{s.label}: {s.val}</span>;
            })}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}

/* ─── Challenge ─── */
export function ChallengeSection({ dailyChallenge, isLight, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass-card p-5 mb-6 cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => navigate('/friends')} data-testid="dashboard-challenge-card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${dailyChallenge.challenge.color}12` }}>
          <Trophy size={22} style={{ color: dailyChallenge.challenge.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: isLight ? '#B45309' : '#FCD34D' }}>Today's Challenge</p>
          <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{dailyChallenge.challenge.title}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{dailyChallenge.challenge.description}</p>
        </div>
        {dailyChallenge.challenge.completed ? (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}><Check size={12} /> Done</span>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: `${dailyChallenge.challenge.color}12`, color: dailyChallenge.challenge.color }}>+{dailyChallenge.challenge.xp} XP</span>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Wisdom ─── */
export function WisdomSection({ dailyWisdom, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
      className="glass-card p-5 mb-6 cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => navigate('/teachings')} data-testid="dashboard-daily-wisdom">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${dailyWisdom.color}12`, border: `1px solid ${dailyWisdom.color}15` }}>
          <Quote size={20} style={{ color: dailyWisdom.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: dailyWisdom.color }}>Daily Wisdom &middot; {dailyWisdom.teacher_name}</p>
          <p className="text-sm italic leading-relaxed mb-2" style={{ color: '#F1F0F5', fontFamily: 'Cormorant Garamond, serif', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>"{dailyWisdom.quote}"</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${dailyWisdom.color}08`, color: dailyWisdom.color }}>{dailyWisdom.tradition}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{dailyWisdom.teaching_title}</span>
          </div>
          {dailyWisdom.practice && <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{dailyWisdom.practice}</p>}
        </div>
        <ChevronRight size={14} className="flex-shrink-0 mt-1" style={{ color: 'var(--text-muted)' }} />
      </div>
    </motion.div>
  );
}

/* ─── Moods ─── */
export function MoodsSection({ stats, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="glass-card p-6 mb-6 cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => navigate('/mood')}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Recent Mood Flow</p>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="flex items-end gap-3 h-24">
        {stats.recent_moods.map((m, i) => (
          <motion.div key={i} className="flex-1 flex flex-col items-center gap-2"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
            <div className="w-full rounded-lg transition-all duration-500"
              style={{ height: `${(m.intensity / 10) * 100}%`, minHeight: '8px', background: 'linear-gradient(to top, rgba(192,132,252,0.3), rgba(45,212,191,0.3))', boxShadow: '0 0 10px rgba(192,132,252,0.1)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.mood?.substring(0, 3)}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Recommendations ─── */
const REC_ICON_MAP = {
  wind: Wind, timer: Timer, sun: Sparkles, 'book-open': BookOpen,
  heart: Heart, headphones: Headphones, radio: Radio, sprout: Sprout,
  lightbulb: Lightbulb, hand: Hand, music: Music, 'heart-handshake': Heart,
  zap: Zap, sunrise: Sunrise, map: Map, 'graduation-cap': GraduationCap,
};

export function RecommendationsSection({ recs, isLight, navigate, playFrequency }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
      className="mb-8" data-testid="recommendations-section">
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
        <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{recs.time_period} picks</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recs.recommendations.map((rec, i) => {
          const Icon = REC_ICON_MAP[rec.icon] || Sparkles;
          const isFreqAction = rec.action === 'play_frequency' && rec.frequency_hz;
          return (
            <motion.button key={rec.id + '-' + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
              onClick={() => { isFreqAction ? playFrequency(rec.frequency_hz) : navigate(rec.path); }}
              className="glass-card p-4 flex items-start gap-3 text-left group hover:scale-[1.02] transition-all cursor-pointer"
              style={{ borderColor: isFreqAction ? `${rec.color}25` : `${rec.color}08` }}
              data-testid={`rec-${rec.id}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${rec.color}10`, border: `1px solid ${rec.color}18` }}>
                {isFreqAction ? <Play size={16} style={{ color: rec.color }} /> : <Icon size={16} style={{ color: rec.color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rec.name}</p>
                <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: rec.color }}>{rec.reason}</p>
                <p className="text-[10px] mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{rec.desc}</p>
                {isFreqAction && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] px-2 py-0.5 rounded-full"
                    style={{ background: `${rec.color}10`, color: rec.color, border: `1px solid ${rec.color}20` }}>
                    <Play size={8} /> Tap to play instantly
                  </span>
                )}
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Actions ─── */
export function ActionsSection({ navigate, allActions }) {
  const CATEGORIZED = [
    { label: 'Today', color: '#FCD34D', items: allActions.filter(a => a.group === 'Today') },
    { label: 'Practice', color: '#D8B4FE', items: allActions.filter(a => a.group === 'Practice') },
    { label: 'Divination', color: '#E879F9', items: allActions.filter(a => a.group === 'Divination') },
    { label: 'Sanctuary', color: '#2DD4BF', items: allActions.filter(a => a.group === 'Sanctuary') },
    { label: 'Explore', color: '#FB923C', items: allActions.filter(a => a.group === 'Explore') },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Explore & Practice</p>
      <div className="space-y-6">
        {CATEGORIZED.map((group, gi) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: group.color }}>
              <span className="w-4 h-px" style={{ background: group.color, opacity: 0.3 }} />
              {group.label}
            </p>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {group.items.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button key={action.label + action.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + gi * 0.05 + i * 0.02 }}
                    onClick={() => navigate(action.path)}
                    className="glass-card p-3 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 hover:scale-105"
                    data-testid={`dashboard-action-${action.label.toLowerCase()}`}>
                    <div className="transition-all duration-300 group-hover:scale-110">
                      <Icon size={18} style={{ color: action.color, transition: 'filter 0.3s' }} className="group-hover:drop-shadow-lg" />
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
  );
}
