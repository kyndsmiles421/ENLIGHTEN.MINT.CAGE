import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useNavigate } from 'react-router-dom';
import { useSensory } from '../context/SensoryContext';
import { useMixer, FREQUENCIES as MIXER_FREQUENCIES } from '../context/MixerContext';
import { useLanguage } from '../context/LanguageContext';
import { MantraBanner } from '../components/MantraSystem';
import CosmicPrescription from '../components/CosmicPrescription';
import { FoundingArchitectBadge } from '../components/FoundingArchitect';
import ConsciousnessPanel from '../components/ConsciousnessPanel';
import MantraOfTheDay from '../components/MantraOfTheDay';
import StreakHeatmap from '../components/StreakHeatmap';
import { toast } from 'sonner';
import {
  Flame, BookOpen, Heart, Wind, Timer, Zap, Leaf, Radio,
  Sunrise, Users, Trophy, Sparkles, User, Hand, Triangle,
  Play, GraduationCap, Headphones, Lightbulb, Sprout,
  ChevronRight, Music, HeartHandshake, Map, TrendingUp,
  Gamepad2, UserPlus, Check, Quote, Sun, Eye, Star, Moon,
  Compass, Droplets, UtensilsCrossed, Target, PenTool, Globe,
  Calendar, BarChart3, MessageCircle, Orbit, Atom, HelpCircle,
  Pencil, GripVertical, EyeOff, Plus, X, ArrowUp, ArrowDown,
  Pin, LayoutGrid, Save, ChevronDown, ScrollText, Swords,
  CloudSun, Moon as MoonIcon, Waves,
  Gem as GemIcon, Mountain as MountainIcon, Sprout as SproutIcon
} from 'lucide-react';
import Walkthrough from '../components/Walkthrough';
import TrialBanner from '../components/TrialBanner';

// Extracted section components
import {
  StatsSection, CosmicWeatherSection, NexusIntentSection,
  PinnedSection, SuggestionsSection, ScriptureSection,
  CoherenceSection, ChallengeSection, WisdomSection,
  MoodsSection, RecommendationsSection, ActionsSection,
} from '../components/dashboard/DashboardSections';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── All available actions ─── */
const ALL_ACTIONS = [
  { icon: Sun, label: 'Briefing', path: '/daily-briefing', color: '#FCD34D', group: 'Today' },
  { icon: Sparkles, label: 'My Ritual', path: '/daily-ritual', color: '#FCD34D', group: 'Today' },
  { icon: Calendar, label: 'Calendar', path: '/cosmic-calendar', color: '#FCD34D', group: 'Today' },
  { icon: Heart, label: 'Mood', path: '/mood', color: '#F87171', group: 'Today' },
  { icon: Eye, label: 'Insights', path: '/cosmic-insights', color: '#C084FC', group: 'Today' },
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
  { icon: Sparkles, label: 'Starseed', path: '/starseed', color: '#C084FC', group: 'Divination' },
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
  { icon: Globe, label: 'Realm', path: '/starseed-realm', color: '#C084FC', group: 'Explore' },
  { icon: Compass, label: 'Multiverse', path: '/multiverse-map', color: '#06B6D4', group: 'Explore' },
  { icon: Swords, label: 'Cosmic RPG', path: '/rpg', color: '#EF4444', group: 'Explore' },
  { icon: Star, label: 'Nexus', path: '/nexus', color: '#A855F7', group: 'Explore' },
  { icon: Sparkles, label: 'Journey', path: '/starseed', color: '#818CF8', group: 'Explore' },
];

const SECTION_META = {
  stats:           { label: 'Stats Cards',      tKey: null,                          color: '#FCD34D' },
  cosmic_weather:  { label: 'Cosmic Weather',   tKey: null,                          color: '#E879F9' },
  nexus_intent:    { label: 'Nexus Drift',      tKey: null,                          color: '#A855F7' },
  pinned:          { label: 'My Shortcuts',      tKey: 'dashboard.myShortcuts',       color: '#C084FC' },
  suggestions:     { label: 'Suggested for You', tKey: 'dashboard.suggestedForYou',   color: '#2DD4BF' },
  scripture:       { label: 'Sacred Scriptures', tKey: null,                          color: '#D97706' },
  coherence:       { label: 'Quantum Coherence', tKey: null,                          color: '#00E5FF' },
  challenge:       { label: 'Daily Challenge',   tKey: 'dashboard.dailyChallenge',    color: '#FCD34D' },
  wisdom:          { label: 'Daily Wisdom',      tKey: null,                          color: '#FB923C' },
  moods:           { label: 'Recent Moods',      tKey: 'dashboard.recentMoods',       color: '#FDA4AF' },
  recommendations: { label: 'For You',           tKey: 'dashboard.forYou',            color: '#D8B4FE' },
  actions:         { label: 'Explore & Practice', tKey: 'dashboard.exploreAndPractice', color: '#86EFAC' },
  mantra_day:      { label: 'Mantra of the Day',  tKey: null,                          color: '#8B5CF6' },
  streak_heatmap:  { label: 'Activity Heatmap',  tKey: null,                          color: '#FB923C' },
};

const DEFAULT_ORDER = ["stats", "mantra_day", "streak_heatmap", "cosmic_weather", "nexus_intent", "pinned", "suggestions", "scripture", "coherence", "challenge", "wisdom", "moods", "recommendations", "actions"];
const DEFAULT_PINNED = ["/breathing", "/mood", "/journal", "/meditation", "/oracle", "/star-chart", "/blessings", "/bible"];

export default function Dashboard() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const { avatarB64 } = useAvatar();
  const navigate = useNavigate();
  const { prefs } = useSensory();
  const { toggleFreq } = useMixer();
  const { t } = useLanguage();
  const isLight = prefs.theme === 'light';

  const playFrequency = useCallback(async (hz) => {
    const freq = MIXER_FREQUENCIES.find(f => f.hz === hz) || { hz, label: `${hz} Hz`, desc: 'Healing Frequency', color: '#8B5CF6' };
    await toggleFreq(freq);
    toast(`Playing ${hz} Hz`, { description: freq.desc || 'Healing frequency activated' });
  }, [toggleFreq]);

  const [stats, setStats] = useState(null);
  const [recs, setRecs] = useState(null);
  const [streak, setStreak] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyWisdom, setDailyWisdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [coherence, setCoherence] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [cosmicWeather, setCosmicWeather] = useState(null);
  const [nexusIntent, setNexusIntent] = useState(null);

  // Layout state
  const [editMode, setEditMode] = useState(false);
  const [sectionsOrder, setSectionsOrder] = useState(DEFAULT_ORDER);
  const [hiddenSections, setHiddenSections] = useState([]);
  const [pinnedShortcuts, setPinnedShortcuts] = useState(DEFAULT_PINNED);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // Drag state for pointer-based reorder
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const listRef = useRef(null);
  const itemRectsRef = useRef([]);

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
        axios.get(`${API}/reports/cosmic-weather`, { headers: authHeaders }).then(r => setCosmicWeather(r.data)).catch(() => {}),
        axios.get(`${API}/nexus/intent`, { headers: authHeaders }).then(r => setNexusIntent(r.data)).catch(() => {}),
        axios.get(`${API}/dashboard/layout`, { headers: authHeaders }).then(r => {
          const savedOrder = r.data.sections_order || DEFAULT_ORDER;
          const merged = [...savedOrder];
          DEFAULT_ORDER.forEach((section, idx) => {
            if (!merged.includes(section)) {
              const insertAt = Math.min(idx, merged.length);
              merged.splice(insertAt, 0, section);
            }
          });
          setSectionsOrder(merged);
          setHiddenSections(r.data.hidden_sections || []);
          setPinnedShortcuts(r.data.pinned_shortcuts || DEFAULT_PINNED);
          setLayoutLoaded(true);
        }).catch(() => setLayoutLoaded(true)),
      ]).finally(() => setLoading(false));
    }
  }, [user, authLoading, authHeaders, navigate]);

  const saveLayout = useCallback(async (order, hidden, pinned) => {
    try {
      await axios.put(`${API}/dashboard/layout`, { sections_order: order, hidden_sections: hidden, pinned_shortcuts: pinned }, { headers: authHeaders });
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
    setHiddenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const togglePin = (path) => {
    setPinnedShortcuts(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

  const finishEditing = () => {
    setEditMode(false);
    setShowAddSheet(false);
    saveLayout(sectionsOrder, hiddenSections, pinnedShortcuts);
  };

  const captureItemRects = useCallback(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-reorder-item]');
    itemRectsRef.current = Array.from(items).map(el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, mid: r.top + r.height / 2 };
    });
  }, []);

  const onReorderPointerDown = useCallback((idx, e) => {
    e.preventDefault();
    setDragIdx(idx);
    setDragOverIdx(idx);
    dragItem.current = idx;
    dragOverItem.current = idx;
    captureItemRects();
    document.body.style.userSelect = 'none';

    const onMove = (ev) => {
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (cy == null) return;
      const rects = itemRectsRef.current;
      for (let i = 0; i < rects.length; i++) {
        if (cy < rects[i].mid) { setDragOverIdx(i); dragOverItem.current = i; return; }
      }
      setDragOverIdx(rects.length - 1);
      dragOverItem.current = rects.length - 1;
    };

    const onUp = () => {
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const from = dragItem.current;
      const to = dragOverItem.current;
      if (from !== null && to !== null && from !== to) {
        setSectionsOrder(prev => {
          const next = [...prev];
          const dragged = next.splice(from, 1)[0];
          next.splice(to, 0, dragged);
          return next;
        });
      }
      setDragIdx(null);
      setDragOverIdx(null);
      dragItem.current = null;
      dragOverItem.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [captureItemRects]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p style={{ color: 'var(--text-muted)' }}>Aligning your energies...</p>
      </div>
    );
  }

  const visibleSections = sectionsOrder.filter(s => !hiddenSections.includes(s));

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'stats': return <StatsSection key="stats" stats={stats} streak={streak} navigate={navigate} />;
      case 'mantra_day': return <MantraOfTheDay key="mantra-day" />;
      case 'streak_heatmap': return <StreakHeatmap key="streak-heatmap" />;
      case 'cosmic_weather': return cosmicWeather ? <CosmicWeatherSection key="weather" weather={cosmicWeather} navigate={navigate} /> : null;
      case 'nexus_intent': return nexusIntent ? <NexusIntentSection key="nexus-intent" intent={nexusIntent} navigate={navigate} playFrequency={playFrequency} /> : null;
      case 'pinned': return pinnedShortcuts.length > 0 ? <PinnedSection key="pinned" pinned={pinnedShortcuts} navigate={navigate} editMode={editMode} onRemove={togglePin} allActions={ALL_ACTIONS} /> : null;
      case 'suggestions': return suggestions.length > 0 ? <SuggestionsSection key="suggestions" suggestions={suggestions} navigate={navigate} playFrequency={playFrequency} /> : null;
      case 'scripture': return stats?.scripture ? <ScriptureSection key="scripture" scripture={stats.scripture} navigate={navigate} /> : null;
      case 'coherence': return coherence ? <CoherenceSection key="coherence" coherence={coherence} isLight={isLight} navigate={navigate} /> : null;
      case 'challenge': return dailyChallenge?.challenge ? <ChallengeSection key="challenge" dailyChallenge={dailyChallenge} isLight={isLight} navigate={navigate} /> : null;
      case 'wisdom': return dailyWisdom ? <WisdomSection key="wisdom" dailyWisdom={dailyWisdom} navigate={navigate} /> : null;
      case 'moods': return stats?.recent_moods?.length > 0 ? <MoodsSection key="moods" stats={stats} navigate={navigate} /> : null;
      case 'recommendations': return recs?.recommendations?.length > 0 ? <RecommendationsSection key="recs" recs={recs} isLight={isLight} navigate={navigate} playFrequency={playFrequency} /> : null;
      case 'actions': return <ActionsSection key="actions" navigate={navigate} allActions={ALL_ACTIONS} />;
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
              <MantraBanner className="mt-1" />
              <FoundingArchitectBadge authHeaders={authHeaders} compact />
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

        {/* Trial Banner */}
        <div className="mb-4"><TrialBanner /></div>

        {/* Cosmic Prescription */}
        <div className="mb-4"><CosmicPrescription authHeaders={authHeaders} /></div>

        {/* Consciousness Level */}
        <div className="mb-4"><ConsciousnessPanel /></div>

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
              <button onClick={() => setShowAddSheet(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}
                data-testid="add-shortcut-btn">
                <Plus size={10} /> Add Shortcuts
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sections */}
        {editMode ? (
          <div className="space-y-2 mb-8" ref={listRef} data-testid="edit-sections-list">
            {sectionsOrder.map((sectionId, idx) => {
              const meta = SECTION_META[sectionId];
              const isHidden = hiddenSections.includes(sectionId);
              const isBeingDragged = dragIdx === idx;
              const isDropTarget = dragOverIdx === idx && dragIdx !== null && dragIdx !== idx;
              return (
                <motion.div key={sectionId} layout data-reorder-item={sectionId}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    background: isBeingDragged ? 'rgba(192,132,252,0.08)' : isDropTarget ? 'rgba(192,132,252,0.04)' : isHidden ? 'rgba(248,250,252,0.01)' : 'rgba(248,250,252,0.03)',
                    border: `1px solid ${isBeingDragged ? 'rgba(192,132,252,0.25)' : isDropTarget ? 'rgba(192,132,252,0.15)' : isHidden ? 'rgba(248,250,252,0.03)' : `${meta?.color || '#fff'}15`}`,
                    opacity: isHidden ? 0.4 : isBeingDragged ? 0.85 : 1,
                    transform: isBeingDragged ? 'scale(1.02)' : isDropTarget ? 'translateY(4px)' : 'none',
                    boxShadow: isBeingDragged ? '0 4px 20px rgba(192,132,252,0.15)' : 'none',
                    transition: 'background 0.2s, border 0.2s, opacity 0.2s, transform 0.15s, box-shadow 0.2s',
                  }}
                  data-testid={`edit-section-${sectionId}`}>
                  <div onPointerDown={(e) => onReorderPointerDown(idx, e)}
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -m-1 rounded-lg hover:bg-white/5"
                    style={{ touchAction: 'none' }} data-testid={`drag-handle-${sectionId}`} title="Drag to reorder">
                    <GripVertical size={14} style={{ color: isBeingDragged ? 'rgba(192,132,252,0.6)' : 'rgba(248,250,252,0.25)' }} />
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta?.color || '#fff' }} />
                  <span className="text-xs font-medium flex-1" style={{ color: isHidden ? 'rgba(248,250,252,0.3)' : 'rgba(248,250,252,0.8)' }}>
                    {meta?.tKey ? t(meta.tKey, meta.label) : (meta?.label || sectionId)}
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
                      className="p-1 rounded-lg hover:bg-white/5" data-testid={`toggle-${sectionId}`}>
                      {isHidden ? <EyeOff size={12} style={{ color: 'rgba(248,250,252,0.3)' }} /> : <Eye size={12} style={{ color: meta?.color || '#fff' }} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div>{visibleSections.map((sectionId) => renderSection(sectionId))}</div>
        )}

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
              onClick={e => e.stopPropagation()} data-testid="add-shortcuts-sheet">
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
