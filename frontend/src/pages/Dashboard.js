import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useNavigate } from 'react-router-dom';
import { useSensory } from '../context/SensoryContext';
import {
  Flame, BookOpen, Heart, Wind, Timer, Zap, Leaf, Radio,
  Sunrise, Users, Trophy, Sparkles, User, Hand, Triangle,
  Play, GraduationCap, Headphones, Lightbulb, Sprout,
  ChevronRight, Music, HeartHandshake, Map, TrendingUp,
  Gamepad2, UserPlus, Check, Quote, Sun, Eye, Star, Moon,
  Compass, Droplets, UtensilsCrossed, Target, PenTool, Globe,
  Calendar, BarChart3, MessageCircle, Orbit, Atom, HelpCircle,
  Pencil, GripVertical, EyeOff, Plus, X, ArrowUp, ArrowDown,
  Pin, LayoutGrid, Save, ChevronDown, ScrollText
} from 'lucide-react';
import Walkthrough from '../components/Walkthrough';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Sparkline ─── */
function MiniSparkline({ data, color }) {
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

/* ─── All available actions ─── */
const ALL_ACTIONS = [
  { icon: Sun, label: 'Briefing', path: '/daily-briefing', color: '#FCD34D', group: 'Today' },
  { icon: Sparkles, label: 'My Ritual', path: '/daily-ritual', color: '#FCD34D', group: 'Today' },
  { icon: Calendar, label: 'Calendar', path: '/cosmic-calendar', color: '#FCD34D', group: 'Today' },
  { icon: Heart, label: 'Mood', path: '/mood', color: '#F87171', group: 'Today' },
  { icon: Wind, label: 'Breathe', path: '/breathing', color: '#2DD4BF', group: 'Practice' },
  { icon: Timer, label: 'Meditate', path: '/meditation', color: '#D8B4FE', group: 'Practice' },
  { icon: Flame, label: 'Yoga', path: '/yoga', color: '#FB923C', group: 'Practice' },
  { icon: Zap, label: 'Qigong', path: '/exercises', color: '#FB923C', group: 'Practice' },
  { icon: Hand, label: 'Mudras', path: '/mudras', color: '#FDA4AF', group: 'Practice' },
  { icon: Music, label: 'Mantras', path: '/mantras', color: '#FB923C', group: 'Practice' },
  { icon: Lightbulb, label: 'Light', path: '/light-therapy', color: '#A855F7', group: 'Practice' },
  { icon: Sun, label: 'Affirm', path: '/affirmations', color: '#93C5FD', group: 'Practice' },
  { icon: Sparkles, label: 'Oracle', path: '/oracle', color: '#E879F9', group: 'Divination' },
  { icon: Star, label: 'Stars', path: '/star-chart', color: '#E879F9', group: 'Divination' },
  { icon: Eye, label: 'Forecasts', path: '/forecasts', color: '#E879F9', group: 'Divination' },
  { icon: Star, label: 'Numerology', path: '/numerology', color: '#E879F9', group: 'Divination' },
  { icon: Moon, label: 'Dreams', path: '/dreams', color: '#E879F9', group: 'Divination' },
  { icon: BarChart3, label: 'Cosmic', path: '/cosmic-profile', color: '#E879F9', group: 'Divination' },
  { icon: Sprout, label: 'Zen', path: '/zen-garden', color: '#22C55E', group: 'Sanctuary' },
  { icon: Headphones, label: 'Sounds', path: '/soundscapes', color: '#3B82F6', group: 'Sanctuary' },
  { icon: Radio, label: 'Hz', path: '/frequencies', color: '#8B5CF6', group: 'Sanctuary' },
  { icon: Orbit, label: 'VR', path: '/vr', color: '#2DD4BF', group: 'Sanctuary' },
  { icon: BookOpen, label: 'Journal', path: '/journal', color: '#86EFAC', group: 'Sanctuary' },
  { icon: MessageCircle, label: 'Sage', path: '/coach', color: '#38BDF8', group: 'Explore' },
  { icon: Globe, label: 'Stories', path: '/creation-stories', color: '#FB923C', group: 'Explore' },
  { icon: Map, label: 'Journey', path: '/journey', color: '#2DD4BF', group: 'Explore' },
  { icon: Gamepad2, label: 'Games', path: '/games', color: '#FB923C', group: 'Explore' },
  { icon: Users, label: 'Community', path: '/community', color: '#FDA4AF', group: 'Explore' },
  { icon: Flame, label: 'Challenges', path: '/challenges', color: '#FB923C', group: 'Explore' },
  { icon: HeartHandshake, label: 'Blessings', path: '/blessings', color: '#2DD4BF', group: 'Explore' },
  { icon: Atom, label: 'Crystals', path: '/crystals', color: '#8B5CF6', group: 'Explore' },
  { icon: Globe, label: 'Myths', path: '/encyclopedia', color: '#FB923C', group: 'Explore' },
  { icon: BookOpen, label: 'Sacred', path: '/sacred-texts', color: '#FCD34D', group: 'Explore' },
  { icon: ScrollText, label: 'Scriptures', path: '/bible', color: '#D97706', group: 'Explore' },
  { icon: Star, label: 'Starseed', path: '/starseed-adventure', color: '#818CF8', group: 'Explore' },
];

const REC_ICON_MAP = {
  wind: Wind, timer: Timer, sun: Sparkles, 'book-open': BookOpen,
  heart: Heart, headphones: Headphones, radio: Radio, sprout: Sprout,
  lightbulb: Lightbulb, hand: Hand, music: Music, 'heart-handshake': HeartHandshake,
  zap: Zap, sunrise: Sunrise, map: Map, 'graduation-cap': GraduationCap,
};

const SECTION_META = {
  stats:           { label: 'Stats Cards',      color: '#FCD34D' },
  pinned:          { label: 'My Shortcuts',      color: '#C084FC' },
  suggestions:     { label: 'Suggested for You', color: '#2DD4BF' },
  scripture:       { label: 'Sacred Scriptures', color: '#D97706' },
  coherence:       { label: 'Quantum Coherence', color: '#00E5FF' },
  challenge:       { label: 'Daily Challenge',   color: '#FCD34D' },
  wisdom:          { label: 'Daily Wisdom',      color: '#FB923C' },
  moods:           { label: 'Recent Moods',      color: '#FDA4AF' },
  recommendations: { label: 'For You',           color: '#D8B4FE' },
  actions:         { label: 'Explore & Practice', color: '#86EFAC' },
};

const DEFAULT_ORDER = ["stats", "pinned", "suggestions", "scripture", "coherence", "challenge", "wisdom", "moods", "recommendations", "actions"];
const DEFAULT_PINNED = ["/breathing", "/mood", "/journal", "/meditation", "/oracle", "/star-chart", "/blessings", "/bible"];

export default function Dashboard() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const { avatarB64 } = useAvatar();
  const navigate = useNavigate();
  const { prefs } = useSensory();
  const isLight = prefs.theme === 'light';

  const [stats, setStats] = useState(null);
  const [recs, setRecs] = useState(null);
  const [streak, setStreak] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyWisdom, setDailyWisdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [coherence, setCoherence] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Layout state
  const [editMode, setEditMode] = useState(false);
  const [sectionsOrder, setSectionsOrder] = useState(DEFAULT_ORDER);
  const [hiddenSections, setHiddenSections] = useState([]);
  const [pinnedShortcuts, setPinnedShortcuts] = useState(DEFAULT_PINNED);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // Drag state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (user) {
      Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers: authHeaders }).then(r => setStats(r.data)).catch(() => {}),
        axios.get(`${API}/recommendations`, { headers: authHeaders }).then(r => setRecs(r.data)).catch(() => {}),
        axios.post(`${API}/streak/checkin`, {}, { headers: authHeaders }).then(r => setStreak(r.data)).catch(() =>
          axios.get(`${API}/streak`, { headers: authHeaders }).then(r => setStreak(r.data)).catch(() => {})
        ),
        axios.get(`${API}/daily-challenge`, { headers: authHeaders }).then(r => setDailyChallenge(r.data)).catch(() => {}),
        axios.get(`${API}/teachings/daily-wisdom`).then(r => setDailyWisdom(r.data)).catch(() => {}),
        axios.get(`${API}/notifications/quantum-coherence`, { headers: authHeaders }).then(r => setCoherence(r.data)).catch(() => {}),
        axios.get(`${API}/dashboard/suggestions`, { headers: authHeaders }).then(r => setSuggestions(r.data.suggestions || [])).catch(() => {}),
        axios.get(`${API}/dashboard/layout`, { headers: authHeaders }).then(r => {
          setSectionsOrder(r.data.sections_order || DEFAULT_ORDER);
          setHiddenSections(r.data.hidden_sections || []);
          setPinnedShortcuts(r.data.pinned_shortcuts || DEFAULT_PINNED);
          setLayoutLoaded(true);
        }).catch(() => setLayoutLoaded(true)),
      ]).finally(() => setLoading(false));
    }
  }, [user, authLoading, authHeaders, navigate]);

  const saveLayout = useCallback(async (order, hidden, pinned) => {
    try {
      await axios.put(`${API}/dashboard/layout`, {
        sections_order: order,
        hidden_sections: hidden,
        pinned_shortcuts: pinned,
      }, { headers: authHeaders });
    } catch {}
  }, [authHeaders]);

  const moveSection = (idx, dir) => {
    const next = [...sectionsOrder];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSectionsOrder(next);
  };

  const toggleSectionVisibility = (id) => {
    setHiddenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const togglePin = (path) => {
    setPinnedShortcuts(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const finishEditing = () => {
    setEditMode(false);
    setShowAddSheet(false);
    saveLayout(sectionsOrder, hiddenSections, pinnedShortcuts);
  };

  // Drag handlers for sections
  const onDragStart = (idx) => { dragItem.current = idx; };
  const onDragEnter = (idx) => { dragOverItem.current = idx; };
  const onDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const next = [...sectionsOrder];
    const dragged = next.splice(dragItem.current, 1)[0];
    next.splice(dragOverItem.current, 0, dragged);
    setSectionsOrder(next);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p style={{ color: 'var(--text-muted)' }}>Aligning your energies...</p>
      </div>
    );
  }

  const visibleSections = sectionsOrder.filter(s => !hiddenSections.includes(s));

  /* ─── Section Renderers ─── */
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'stats': return <StatsSection key="stats" stats={stats} streak={streak} navigate={navigate} />;
      case 'pinned': return pinnedShortcuts.length > 0 ? <PinnedSection key="pinned" pinned={pinnedShortcuts} navigate={navigate} editMode={editMode} onRemove={togglePin} /> : null;
      case 'suggestions': return suggestions.length > 0 ? <SuggestionsSection key="suggestions" suggestions={suggestions} navigate={navigate} /> : null;
      case 'scripture': return stats?.scripture ? <ScriptureSection key="scripture" scripture={stats.scripture} navigate={navigate} /> : null;
      case 'coherence': return coherence ? <CoherenceSection key="coherence" coherence={coherence} isLight={isLight} navigate={navigate} /> : null;
      case 'challenge': return dailyChallenge?.challenge ? <ChallengeSection key="challenge" dailyChallenge={dailyChallenge} isLight={isLight} navigate={navigate} /> : null;
      case 'wisdom': return dailyWisdom ? <WisdomSection key="wisdom" dailyWisdom={dailyWisdom} navigate={navigate} /> : null;
      case 'moods': return stats?.recent_moods?.length > 0 ? <MoodsSection key="moods" stats={stats} navigate={navigate} /> : null;
      case 'recommendations': return recs?.recommendations?.length > 0 ? <RecommendationsSection key="recs" recs={recs} isLight={isLight} navigate={navigate} /> : null;
      case 'actions': return <ActionsSection key="actions" navigate={navigate} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-10 relative immersive-page" style={{ background: 'transparent' }} data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-1">
            {avatarB64 && (
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                onClick={() => navigate('/avatar')}
                className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: '2px solid rgba(192,132,252,0.3)', boxShadow: '0 0 20px rgba(192,132,252,0.1)' }}
                data-testid="dashboard-avatar">
                <img src={`data:image/png;base64,${avatarB64}`} alt="" className="w-full h-full object-cover" />
              </motion.button>
            )}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--primary)' }}>Dashboard</p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Welcome back, <span className="animate-text-shimmer">{user?.name?.split(' ')[0]}</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => editMode ? finishEditing() : setEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: editMode ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.04)',
                  border: `1px solid ${editMode ? 'rgba(192,132,252,0.3)' : 'rgba(248,250,252,0.08)'}`,
                  color: editMode ? '#C084FC' : 'rgba(248,250,252,0.6)',
                }}
                data-testid="dashboard-edit-btn">
                {editMode ? <><Save size={11} /> Done</> : <><LayoutGrid size={11} /> Customize</>}
              </button>
              <button onClick={() => setShowWalkthrough(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)' }}
                data-testid="dashboard-help-btn" title="App guide">
                <HelpCircle size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {(streak?.current_streak || 0) > 0 && (
              <span style={{ color: '#FCD34D' }}><Flame size={11} className="inline" /> {streak?.current_streak}-day streak &middot; </span>
            )}
            Your consciousness practice at a glance.
          </p>
        </motion.div>

        {/* Edit Mode Banner */}
        <AnimatePresence>
          {editMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl p-3 flex items-center justify-between"
              style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.12)' }}
              data-testid="edit-mode-banner">
              <div className="flex items-center gap-2">
                <LayoutGrid size={14} style={{ color: '#C084FC' }} />
                <span className="text-xs" style={{ color: '#C084FC' }}>Drag sections to reorder, toggle visibility, or add shortcuts</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAddSheet(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}
                  data-testid="add-shortcut-btn">
                  <Plus size={10} /> Add Shortcuts
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sections */}
        {editMode ? (
          <div className="space-y-2 mb-8" data-testid="edit-sections-list">
            {sectionsOrder.map((sectionId, idx) => {
              const meta = SECTION_META[sectionId];
              const isHidden = hiddenSections.includes(sectionId);
              return (
                <motion.div key={sectionId} layout
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragEnter={() => onDragEnter(idx)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                  style={{
                    background: isHidden ? 'rgba(248,250,252,0.01)' : 'rgba(248,250,252,0.03)',
                    border: `1px solid ${isHidden ? 'rgba(248,250,252,0.03)' : `${meta?.color || '#fff'}15`}`,
                    opacity: isHidden ? 0.4 : 1,
                  }}
                  data-testid={`edit-section-${sectionId}`}>
                  <GripVertical size={14} style={{ color: 'rgba(248,250,252,0.25)' }} className="flex-shrink-0" />
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta?.color || '#fff' }} />
                  <span className="text-xs font-medium flex-1" style={{ color: isHidden ? 'rgba(248,250,252,0.3)' : 'rgba(248,250,252,0.8)' }}>
                    {meta?.label || sectionId}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                      className="p-1 rounded-lg disabled:opacity-20 hover:bg-white/5" data-testid={`move-up-${sectionId}`}>
                      <ArrowUp size={12} style={{ color: 'rgba(248,250,252,0.5)' }} />
                    </button>
                    <button onClick={() => moveSection(idx, 1)} disabled={idx === sectionsOrder.length - 1}
                      className="p-1 rounded-lg disabled:opacity-20 hover:bg-white/5" data-testid={`move-down-${sectionId}`}>
                      <ArrowDown size={12} style={{ color: 'rgba(248,250,252,0.5)' }} />
                    </button>
                    <button onClick={() => toggleSectionVisibility(sectionId)}
                      className="p-1 rounded-lg hover:bg-white/5"
                      data-testid={`toggle-${sectionId}`}>
                      {isHidden ? <EyeOff size={12} style={{ color: 'rgba(248,250,252,0.3)' }} /> : <Eye size={12} style={{ color: meta?.color || '#fff' }} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div>
            {visibleSections.map((sectionId) => renderSection(sectionId))}
          </div>
        )}

        {/* Edit mode: still show preview below the reorder list */}
        {editMode && (
          <div className="opacity-60 pointer-events-none">
            {visibleSections.map((sectionId) => renderSection(sectionId))}
          </div>
        )}
      </div>

      {/* Add Shortcuts Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowAddSheet(false)}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-t-2xl overflow-hidden max-h-[70vh] flex flex-col"
              style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(192,132,252,0.1)', borderBottom: 'none', backdropFilter: 'blur(20px)' }}
              onClick={e => e.stopPropagation()}
              data-testid="add-shortcuts-sheet">
              <div className="px-4 py-3 flex items-center justify-between sticky top-0 z-10"
                style={{ background: 'inherit', borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                <div className="flex items-center gap-2">
                  <Pin size={13} style={{ color: '#C084FC' }} />
                  <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Add Shortcuts</span>
                </div>
                <button onClick={() => setShowAddSheet(false)} className="p-1 rounded-lg hover:bg-white/5">
                  <X size={14} style={{ color: 'rgba(248,250,252,0.5)' }} />
                </button>
              </div>
              <p className="px-4 py-2 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                Tap to pin or unpin shortcuts to your dashboard
              </p>
              <div className="px-4 pb-6 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {['Today', 'Practice', 'Divination', 'Sanctuary', 'Explore'].map(group => (
                  <div key={group}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.4)' }}>{group}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_ACTIONS.filter(a => a.group === group).map(action => {
                        const Icon = action.icon;
                        const isPinned = pinnedShortcuts.includes(action.path);
                        return (
                          <button key={action.path} onClick={() => togglePin(action.path)}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
                            style={{
                              background: isPinned ? `${action.color}12` : 'rgba(248,250,252,0.02)',
                              border: `1px solid ${isPinned ? `${action.color}30` : 'rgba(248,250,252,0.04)'}`,
                            }}
                            data-testid={`pin-${action.label.toLowerCase()}`}>
                            <div className="relative">
                              <Icon size={16} style={{ color: isPinned ? action.color : 'rgba(248,250,252,0.4)' }} />
                              {isPinned && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                                  style={{ background: action.color }}>
                                  <Check size={7} style={{ color: '#fff' }} />
                                </div>
                              )}
                            </div>
                            <span className="text-[9px]" style={{ color: isPinned ? action.color : 'rgba(248,250,252,0.5)' }}>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showWalkthrough && (
        <Walkthrough onComplete={() => { setShowWalkthrough(false); localStorage.setItem('cosmic_walkthrough_seen', 'true'); }} />
      )}
    </div>
  );
}

/* ─── Section Components ─── */

function StatsSection({ stats, streak, navigate }) {
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

function PinnedSection({ pinned, navigate, editMode, onRemove }) {
  const pinnedActions = pinned.map(path => ALL_ACTIONS.find(a => a.path === path)).filter(Boolean);
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

function SuggestionsSection({ suggestions, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="mb-8" data-testid="smart-suggestions">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Suggested for You</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((s, i) => (
          <motion.button key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
            onClick={() => navigate(s.path)}
            className="glass-card p-3.5 flex items-center gap-3 text-left group hover:scale-[1.01] transition-all"
            data-testid={`suggestion-${s.id}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
              <Sparkles size={15} style={{ color: s.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
              <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
            <ChevronRight size={11} style={{ color: s.color, opacity: 0.5 }} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ScriptureSection({ scripture, navigate }) {
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
        <button onClick={() => navigate('/bible')}
          className="text-[10px] flex items-center gap-1 transition-all hover:gap-2"
          style={{ color: '#D97706' }}
          data-testid="scripture-browse-all">
          Browse Library <ChevronRight size={10} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button onClick={() => navigate('/bible')}
          className="glass-card p-3.5 text-left group hover:scale-[1.01] transition-all"
          data-testid="scripture-chapters-card">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(217,119,6,0.1)' }}>
              <BookOpen size={13} style={{ color: '#D97706' }} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Chapters</p>
          </div>
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{chapters_read}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>chapters explored</p>
        </button>
        <button onClick={() => navigate('/bible?tab=journeys')}
          className="glass-card p-3.5 text-left group hover:scale-[1.01] transition-all"
          data-testid="scripture-journeys-card">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.1)' }}>
              <Map size={13} style={{ color: '#818CF8' }} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Journeys</p>
          </div>
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{active_journeys}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>guided paths started</p>
        </button>
      </div>

      {/* Continue Reading */}
      {recent_chapters && recent_chapters.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(217,119,6,0.6)' }}>Continue Reading</p>
          {recent_chapters.map((ch, i) => (
            <motion.button key={`${ch.book_id}-${ch.chapter_num}`}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
              onClick={() => navigate(`/bible?book=${ch.book_id}&chapter=${ch.chapter_num}`)}
              className="w-full glass-card p-3 flex items-center gap-3 text-left group hover:scale-[1.01] transition-all"
              data-testid={`scripture-recent-${i}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.12)' }}>
                <ScrollText size={13} style={{ color: '#D97706' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {ch.book_title || ch.book_id} — Chapter {ch.chapter_num}
                </p>
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

function CoherenceSection({ coherence, isLight, navigate }) {
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
            <span className="text-lg font-light" style={{
              color: coherence.phase === 'coherent' ? '#00E5FF' : coherence.phase === 'aligning' ? '#C084FC' : 'var(--text-primary)',
              fontFamily: 'Cormorant Garamond, serif',
            }}>{coherence.coherence_score}</span>
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
              return (
                <span key={s.label} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${c}12`, color: c, border: `1px solid ${c}20` }}>
                  {s.label}: {s.val}
                </span>
              );
            })}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}

function ChallengeSection({ dailyChallenge, isLight, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass-card p-5 mb-6 cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => navigate('/friends')} data-testid="dashboard-challenge-card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${dailyChallenge.challenge.color}12` }}>
          <Trophy size={22} style={{ color: dailyChallenge.challenge.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: isLight ? '#B45309' : '#FCD34D' }}>Today's Challenge</p>
          <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{dailyChallenge.challenge.title}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{dailyChallenge.challenge.description}</p>
        </div>
        {dailyChallenge.challenge.completed ? (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}><Check size={12} /> Done</span>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: `${dailyChallenge.challenge.color}12`, color: dailyChallenge.challenge.color }}>+{dailyChallenge.challenge.xp} XP</span>
        )}
      </div>
    </motion.div>
  );
}

function WisdomSection({ dailyWisdom, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
      className="glass-card p-5 mb-6 cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => navigate('/teachings')} data-testid="dashboard-daily-wisdom">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${dailyWisdom.color}12`, border: `1px solid ${dailyWisdom.color}15` }}>
          <Quote size={20} style={{ color: dailyWisdom.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: dailyWisdom.color }}>
            Daily Wisdom &middot; {dailyWisdom.teacher_name}
          </p>
          <p className="text-sm italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>"{dailyWisdom.quote}"</p>
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

function MoodsSection({ stats, navigate }) {
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
              style={{
                height: `${(m.intensity / 10) * 100}%`, minHeight: '8px',
                background: 'linear-gradient(to top, rgba(192,132,252,0.3), rgba(45,212,191,0.3))',
                boxShadow: '0 0 10px rgba(192,132,252,0.1)',
              }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.mood?.substring(0, 3)}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RecommendationsSection({ recs, isLight, navigate }) {
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
          return (
            <motion.button key={rec.id + '-' + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
              onClick={() => navigate(rec.path)}
              className="glass-card p-4 flex items-start gap-3 text-left group hover:scale-[1.02] transition-all cursor-pointer"
              style={{ borderColor: `${rec.color}08` }}
              data-testid={`rec-${rec.id}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${rec.color}10`, border: `1px solid ${rec.color}18` }}>
                <Icon size={16} style={{ color: rec.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rec.name}</p>
                <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: rec.color }}>{rec.reason}</p>
                <p className="text-[10px] mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{rec.desc}</p>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ActionsSection({ navigate }) {
  const CATEGORIZED = [
    { label: 'Today', color: '#FCD34D', items: ALL_ACTIONS.filter(a => a.group === 'Today') },
    { label: 'Practice', color: '#D8B4FE', items: ALL_ACTIONS.filter(a => a.group === 'Practice') },
    { label: 'Divination', color: '#E879F9', items: ALL_ACTIONS.filter(a => a.group === 'Divination') },
    { label: 'Sanctuary', color: '#2DD4BF', items: ALL_ACTIONS.filter(a => a.group === 'Sanctuary') },
    { label: 'Explore', color: '#FB923C', items: ALL_ACTIONS.filter(a => a.group === 'Explore') },
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
