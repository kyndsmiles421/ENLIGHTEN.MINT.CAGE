import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import CelebrationBurst from '../components/CelebrationBurst';
import {
  Sparkles, Sun, Zap, Heart, Target, Lightbulb, Sunrise, Shield,
  Brain, Wind, Battery, Frown, Moon, Angry, CloudRain, Waves,
  HeartCrack, Meh, AlertTriangle, Ban, BatteryWarning, Orbit,
  Eye, Clock, Coffee, Compass, Star, Mountain, TreePine, Globe,
  Search, ChevronRight, Flower2, HeartHandshake, X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MOODS = [
  // Positive
  { id: 'happy', name: 'Happy', icon: Sparkles, color: '#FCD34D', group: 'positive' },
  { id: 'peaceful', name: 'Peaceful', icon: Sun, color: '#2DD4BF', group: 'positive' },
  { id: 'energized', name: 'Energized', icon: Zap, color: '#FB923C', group: 'positive' },
  { id: 'grateful', name: 'Grateful', icon: Heart, color: '#FDA4AF', group: 'positive' },
  { id: 'curious', name: 'Curious', icon: Target, color: '#8B5CF6', group: 'positive' },
  { id: 'inspired', name: 'Inspired', icon: Lightbulb, color: '#FCD34D', group: 'positive' },
  { id: 'hopeful', name: 'Hopeful', icon: Sunrise, color: '#86EFAC', group: 'positive' },
  { id: 'creative', name: 'Creative', icon: Flower2, color: '#C084FC', group: 'positive' },
  { id: 'connected', name: 'Connected', icon: HeartHandshake, color: '#FDA4AF', group: 'positive' },
  { id: 'brave', name: 'Brave', icon: Shield, color: '#FB923C', group: 'positive' },
  // Challenged
  { id: 'stressed', name: 'Stressed', icon: Brain, color: '#EF4444', group: 'challenged' },
  { id: 'anxious', name: 'Anxious', icon: Wind, color: '#FB923C', group: 'challenged' },
  { id: 'tired', name: 'Low Energy', icon: Battery, color: '#FCD34D', group: 'challenged' },
  { id: 'sad', name: 'Down / Sad', icon: Frown, color: '#3B82F6', group: 'challenged' },
  { id: 'unfocused', name: 'Unfocused', icon: Target, color: '#8B5CF6', group: 'challenged' },
  { id: 'restless', name: "Can't Sleep", icon: Moon, color: '#2DD4BF', group: 'challenged' },
  { id: 'angry', name: 'Angry', icon: Angry, color: '#EF4444', group: 'challenged' },
  { id: 'lonely', name: 'Lonely', icon: CloudRain, color: '#3B82F6', group: 'challenged' },
  { id: 'overwhelmed', name: 'Overwhelmed', icon: Waves, color: '#8B5CF6', group: 'challenged' },
  { id: 'grief', name: 'Grieving', icon: HeartCrack, color: '#6366F1', group: 'challenged' },
  { id: 'numb', name: 'Numb / Empty', icon: Meh, color: '#94A3B8', group: 'challenged' },
  { id: 'fearful', name: 'Fearful', icon: AlertTriangle, color: '#F59E0B', group: 'challenged' },
  { id: 'frustrated', name: 'Frustrated', icon: Ban, color: '#EF4444', group: 'challenged' },
  { id: 'burnout', name: 'Burned Out', icon: BatteryWarning, color: '#FB923C', group: 'challenged' },
  { id: 'disconnected', name: 'Disconnected', icon: Orbit, color: '#94A3B8', group: 'challenged' },
  { id: 'jealous', name: 'Jealous', icon: Eye, color: '#22C55E', group: 'challenged' },
  { id: 'impatient', name: 'Impatient', icon: Clock, color: '#F59E0B', group: 'challenged' },
  { id: 'bored', name: 'Bored', icon: Coffee, color: '#94A3B8', group: 'challenged' },
  { id: 'nostalgic', name: 'Nostalgic', icon: Compass, color: '#C084FC', group: 'challenged' },
  // Spiritual
  { id: 'awakening', name: 'Spiritually Awakening', icon: Star, color: '#FCD34D', group: 'spiritual' },
  { id: 'seeking', name: 'Seeking Purpose', icon: Mountain, color: '#2DD4BF', group: 'spiritual' },
  { id: 'grounding', name: 'Need Grounding', icon: TreePine, color: '#22C55E', group: 'spiritual' },
  { id: 'expansive', name: 'Expansive', icon: Globe, color: '#8B5CF6', group: 'spiritual' },
];

const GROUP_META = {
  positive: { label: 'Positive', color: '#22C55E' },
  challenged: { label: 'Challenged', color: '#FB923C' },
  spiritual: { label: 'Spiritual', color: '#C084FC' },
};

export default function MoodTracker() {
  const { user, authHeaders } = useAuth();
  const { playCelebration } = useSensory();
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [recipe, setRecipe] = useState(null); // frequency stack from last submit

  useEffect(() => {
    if (user) {
      axios.get(`${API}/moods`, { headers: authHeaders })
        .then(res => setHistory(res.data))
        .catch(() => {});
      setInsightsLoading(true);
      axios.get(`${API}/moods/insights`, { headers: authHeaders })
        .then(res => setInsights(res.data))
        .catch(() => {})
        .finally(() => setInsightsLoading(false));
      axios.get(`${API}/moods/frequency-recipe`, { headers: authHeaders })
        .then(res => setRecipe(res.data))
        .catch(() => {});
    }
  }, [user, authHeaders]);

  const filteredMoods = useMemo(() => {
    let list = MOODS;
    if (activeGroup !== 'all') list = list.filter(m => m.group === activeGroup);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.id.includes(q));
    }
    return list;
  }, [search, activeGroup]);

  const toggleMood = (mood) => {
    setSelectedMoods(prev => {
      const exists = prev.find(m => m.id === mood.id);
      if (exists) return prev.filter(m => m.id !== mood.id);
      return [...prev, mood];
    });
  };

  const submit = async () => {
    if (!user) { toast.error('Sign in to track your mood'); return; }
    if (selectedMoods.length === 0) { toast.error('Select at least one mood'); return; }
    setLoading(true);
    try {
      const primary = selectedMoods[0];
      const res = await axios.post(`${API}/moods`, {
        mood: primary.name,
        moods: selectedMoods.map(m => m.id),
        intensity,
        note: note || null,
      }, { headers: authHeaders });
      setHistory([res.data, ...history]);
      setLastResult(res.data);
      setSelectedMoods([]);
      setNote('');
      setIntensity(5);
      setSearch('');
      setCelebrating(true);
      playCelebration();
      // Refresh recipe
      axios.get(`${API}/moods/frequency-recipe`, { headers: authHeaders })
        .then(r => setRecipe(r.data)).catch(() => {});
      toast.success(
        res.data.resonance_type === 'chorded'
          ? `Chorded resonance: ${res.data.frequency_stack?.join('Hz + ')}Hz`
          : 'Mood captured'
      );
      // Silent dust accrual for mood logging
      if (typeof window.__workAccrue === 'function') window.__workAccrue('mood_log', 5);
    } catch {
      toast.error('Could not save mood');
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.slice(0, 14).reverse().map((m) => ({
    name: new Date(m.created_at).toLocaleDateString('en', { weekday: 'short' }),
    intensity: m.intensity,
    fill: MOODS.find(mood => mood.name === m.mood)?.color || '#94A3B8',
  }));

  return (
    <div className="min-h-screen immersive-page px-4 md:px-12 lg:px-24 py-10" style={{ background: 'transparent' }} data-testid="mood-tracker-page">
      <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--accent-rose)' }}>Mood Tracker</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Emotional Landscape
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Observe your emotions without judgment. Each feeling is a teacher.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Mood Selection */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>How are you feeling?</p>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search emotions..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs"
                style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none' }}
                data-testid="mood-search" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>

            {/* Group Filters */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {[{ id: 'all', label: 'All', color: '#F8FAFC' }, ...Object.entries(GROUP_META).map(([k, v]) => ({ id: k, ...v }))].map(g => (
                <button key={g.id} onClick={() => setActiveGroup(g.id)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all"
                  style={{
                    background: activeGroup === g.id ? `${g.color}15` : 'rgba(248,250,252,0.03)',
                    border: `1px solid ${activeGroup === g.id ? `${g.color}30` : 'rgba(248,250,252,0.06)'}`,
                    color: activeGroup === g.id ? g.color : 'rgba(248,250,252,0.5)',
                  }}
                  data-testid={`mood-group-${g.id}`}>
                  {g.label}
                </button>
              ))}
            </div>

            {/* Mood Grid — Multi-Select */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1 overscroll-contain" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
              {filteredMoods.map(mood => {
                const Icon = mood.icon;
                const isSelected = selectedMoods.some(m => m.id === mood.id);
                const selIndex = selectedMoods.findIndex(m => m.id === mood.id);
                return (
                  <motion.button key={mood.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleMood(mood)}
                    className="glass-card p-3 flex flex-col items-center gap-1.5 transition-all hover:scale-[1.03] relative overflow-hidden"
                    style={{
                      border: `1px solid ${isSelected ? `${mood.color}50` : 'rgba(255,255,255,0.06)'}`,
                      background: isSelected ? `${mood.color}10` : undefined,
                      touchAction: 'pan-y',
                    }}
                    data-testid={`mood-${mood.id}`}>
                    {isSelected && (
                      <span className="absolute top-1 right-1.5 text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center"
                        style={{ background: mood.color, color: '#0A0A12' }}>
                        {selIndex + 1}
                      </span>
                    )}
                    <Icon size={18} style={{ color: isSelected ? mood.color : 'rgba(248,250,252,0.5)', transition: 'color 0.2s' }} />
                    <span className="text-[9px] font-medium text-center leading-tight" style={{ color: isSelected ? mood.color : 'var(--text-primary)' }}>
                      {mood.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {filteredMoods.length === 0 && (
              <p className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>No emotions match "{search}"</p>
            )}

            {/* Intensity + Frequency Stack + Submit */}
            <AnimatePresence>
              {selectedMoods.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mt-6 space-y-4 glass-card p-5 rounded-2xl relative overflow-hidden"
                  style={{ border: `1px solid ${selectedMoods[0].color}20` }}>

                  {/* Moiré Shimmer for multi-select */}
                  {selectedMoods.length > 1 && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden" data-testid="moire-shimmer">
                      {selectedMoods.map((m, i) => (
                        <motion.div key={m.id}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                          <div style={{
                            width: `${120 + i * 40}px`, height: `${120 + i * 40}px`,
                            border: `1px solid ${m.color}`,
                            borderRadius: i % 2 === 0 ? '30% 70% 70% 30%' : '50%',
                          }} />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Selected mood pills */}
                  <div className="flex flex-wrap gap-1.5 relative z-10">
                    {selectedMoods.map(m => {
                      const SIcon = m.icon;
                      return (
                        <motion.span key={m.id} layout
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium cursor-pointer"
                          style={{ background: `${m.color}12`, border: `1px solid ${m.color}25`, color: m.color }}
                          onClick={() => toggleMood(m)}
                          data-testid={`selected-mood-${m.id}`}>
                          <SIcon size={10} /> {m.name} <X size={8} />
                        </motion.span>
                      );
                    })}
                  </div>

                  {/* Frequency Stack */}
                  <div className="relative z-10 flex items-center gap-2 py-2 px-3 rounded-lg"
                    style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
                    data-testid="frequency-stack">
                    <Zap size={10} style={{ color: '#FBBF24' }} />
                    <div className="flex-1">
                      <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {selectedMoods.length > 1 ? 'Chorded Resonance' : 'Pure Resonance'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {selectedMoods.map((m, i) => {
                          const FREQ_MAP = {
                            happy: 528, peaceful: 432, energized: 741, grateful: 639,
                            curious: 852, inspired: 963, hopeful: 528, creative: 741,
                            connected: 639, brave: 396, stressed: 396, anxious: 417,
                            tired: 174, sad: 285, unfocused: 741, restless: 417,
                            angry: 396, lonely: 639, overwhelmed: 285, grief: 174,
                            numb: 285, fearful: 396, frustrated: 417, burnout: 174,
                            disconnected: 285, jealous: 417, impatient: 396, bored: 528,
                            nostalgic: 639, awakening: 963, seeking: 852, grounding: 174, expansive: 963,
                          };
                          const hz = FREQ_MAP[m.id] || 432;
                          return (
                            <React.Fragment key={m.id}>
                              {i > 0 && <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>+</span>}
                              <span className="text-[9px] font-mono" style={{ color: m.color }}>{hz}Hz</span>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Tesla 3-6-9 Nodal Resonance */}
                  {[3, 6, 9].includes(selectedMoods.length) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative z-10 py-2.5 px-3 rounded-lg overflow-hidden"
                      style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)' }}
                      data-testid="tesla-harmony">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i}
                          animate={{ opacity: [0.05, 0.2, 0.05], x: ['-10%', '110%'] }}
                          transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                          className="absolute top-0 h-full w-px"
                          style={{ background: `linear-gradient(180deg, transparent, #FBBF24, transparent)` }} />
                      ))}
                      <div className="flex items-center gap-2">
                        <Zap size={12} style={{ color: '#FBBF24' }} />
                        <div>
                          <p className="text-[9px] font-medium" style={{ color: '#FBBF24' }}>
                            Tesla {selectedMoods.length}-Node Harmony
                          </p>
                          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                            "If you knew the magnificence of {selectedMoods.length}..." — 369Hz unlocked
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                        Intensity
                      </label>
                      <span className="text-sm font-light tabular-nums" style={{ color: selectedMoods[0].color, fontFamily: 'Cormorant Garamond, serif' }}>
                        {intensity}/10
                      </span>
                    </div>
                    <input type="range" min="1" max="10" value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, ${selectedMoods[0].color} ${(intensity / 10) * 100}%, rgba(255,255,255,0.06) ${(intensity / 10) * 100}%)` }}
                      data-testid="mood-intensity-slider" />
                  </div>

                  <div className="relative z-10">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Note (optional)
                    </label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)}
                      className="w-full h-20 resize-none rounded-xl p-3 text-xs"
                      style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none' }}
                      placeholder="What's on your mind?"
                      data-testid="mood-note-input" />
                  </div>

                  <button onClick={submit} disabled={loading}
                    className="w-full py-3 rounded-xl text-xs font-medium transition-all hover:scale-[1.01] relative z-10"
                    style={{
                      background: selectedMoods.length > 1
                        ? `linear-gradient(135deg, ${selectedMoods[0].color}15, ${selectedMoods[selectedMoods.length - 1].color}15)`
                        : `${selectedMoods[0].color}15`,
                      border: `1px solid ${selectedMoods[0].color}30`,
                      color: selectedMoods[0].color,
                      opacity: loading ? 0.6 : 1,
                    }}
                    data-testid="mood-submit-btn">
                    {loading ? 'Capturing...' : selectedMoods.length > 1 ? `Capture ${selectedMoods.length} Layers` : 'Capture Mood'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Recipe + Insights + History + Chart */}
          <div>
            {/* Frequency Recipe (Culinary Mode) */}
            {recipe?.has_recipe && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 glass-card p-4 rounded-2xl space-y-3"
                style={{ border: '1px solid rgba(251,191,36,0.1)' }}
                data-testid="frequency-recipe">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Your Frequency Recipe</p>
                    <p className="text-sm font-medium" style={{ color: '#FBBF24', fontFamily: 'Cormorant Garamond, serif' }}>
                      {recipe.recipe_name}
                    </p>
                  </div>
                  {recipe.is_tesla_harmony && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}>
                      Tesla 3-6-9
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {recipe.ingredients?.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg"
                      style={{ background: 'rgba(248,250,252,0.02)' }}>
                      <span className="text-[8px] w-12 font-mono" style={{ color: '#FBBF24' }}>{ing.frequency}Hz</span>
                      <span className="text-[9px] flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{ing.name}</span>
                      <span className="text-[7px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>
                        {ing.type}
                      </span>
                      <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{ing.flavor}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Insights Panel */}
            {insights?.has_data && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-3" data-testid="mood-insights">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass-card p-3 text-center">
                    <p className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>{insights.logging_streak}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FDA4AF' }}>{insights.total_entries}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Logged</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2DD4BF' }}>{insights.avg_intensity}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg Feel</p>
                  </div>
                </div>

                {/* Top Moods */}
                {insights.top_moods?.length > 0 && (
                  <div className="glass-card p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>Most Frequent Emotions</p>
                    <div className="space-y-1.5">
                      {insights.top_moods.slice(0, 5).map((tm, i) => {
                        const moodObj = MOODS.find(m => m.name === tm.mood);
                        const MIcon = moodObj?.icon || Meh;
                        const maxCount = insights.top_moods[0]?.count || 1;
                        return (
                          <div key={tm.mood} className="flex items-center gap-2">
                            <MIcon size={12} style={{ color: moodObj?.color || '#94A3B8' }} />
                            <span className="text-[10px] w-20 truncate" style={{ color: 'var(--text-primary)' }}>{tm.mood}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(tm.count / maxCount) * 100}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className="h-full rounded-full" style={{ background: moodObj?.color || '#94A3B8' }} />
                            </div>
                            <span className="text-[9px] tabular-nums w-4 text-right" style={{ color: moodObj?.color || 'var(--text-muted)' }}>{tm.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weekly Activity */}
                {insights.weekly?.some(d => d.count > 0) && (
                  <div className="glass-card p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>This Week</p>
                    <div className="flex items-end gap-1.5 h-16">
                      {insights.weekly.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-md transition-all" style={{
                            height: d.count > 0 ? `${Math.max(d.count * 20, 8)}px` : '3px',
                            background: d.count > 0
                              ? `linear-gradient(to top, ${d.avg_intensity > 6 ? 'rgba(34,197,94,0.4)' : d.avg_intensity > 3 ? 'rgba(192,132,252,0.3)' : 'rgba(251,146,60,0.3)'}, transparent)`
                              : 'rgba(248,250,252,0.04)',
                            minHeight: '3px',
                          }} />
                          <span className="text-[7px]" style={{ color: d.count > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{d.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Insight */}
                {insights.ai_insight && (
                  <div className="glass-card p-4" style={{ border: '1px solid rgba(192,132,252,0.1)' }} data-testid="mood-ai-insight">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} style={{ color: '#C084FC' }} />
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: '#C084FC' }}>AI Insight</p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insights.ai_insight}</p>
                  </div>
                )}
              </motion.div>
            )}

            {insightsLoading && !insights && (
              <div className="glass-card p-6 mb-6 text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyzing your emotional patterns...</p>
              </div>
            )}

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Your Journey</p>

            {chartData.length > 0 ? (
              <div className="glass-card p-5 mb-6">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,14,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F8FAFC', fontSize: '11px' }}
                    />
                    <Bar dataKey="intensity" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="glass-card p-8 text-center mb-6">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {user ? 'No moods logged yet. Start tracking to see your journey.' : 'Sign in to track your emotional journey.'}
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {history.slice(0, 20).map(m => {
                const moodObj = MOODS.find(mood => mood.name === m.mood);
                const MIcon = moodObj?.icon || Meh;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${moodObj?.color || '#94A3B8'}12` }}>
                      <MIcon size={14} style={{ color: moodObj?.color || '#94A3B8' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium" style={{ color: moodObj?.color || 'var(--text-primary)' }}>{m.mood}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          {new Date(m.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {m.note && <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{m.note}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0 tabular-nums"
                      style={{ background: `${moodObj?.color || '#94A3B8'}10`, color: moodObj?.color || 'var(--text-muted)' }}>
                      {m.intensity}/10
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
