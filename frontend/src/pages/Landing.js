import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Wind, Timer, Sun, Heart, BookOpen, Headphones, ArrowRight, Sparkles, Sunrise, Zap,
  Leaf, Radio, Users, Flame, Hand, Triangle, Play, GraduationCap, PenTool, Volume2, VolumeX,
  Lightbulb, Sprout, ChevronRight, Quote, MapPin, Mail, Shield, X, Search,
  Brain, Battery, Moon, Frown, Target, Music, HeartHandshake, Map, Globe, Gamepad2,
  Eye, Star, Compass, Droplets, MessageCircle, Orbit, Loader2, GripVertical,
  CloudRain, Angry, Meh, ThumbsDown, Gauge, Coffee, Clock, BatteryWarning,
  Waves, Mountain, TreePine, Flower2, HeartCrack, Ban, AlertTriangle, Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMixer, FREQUENCIES as MIXER_FREQUENCIES, MANTRAS as MIXER_MANTRAS } from '../context/MixerContext';
import ShareButton from '../components/ShareButton';
import GuidedTour from '../components/GuidedTour';
import CosmicMoodRing from '../components/CosmicMoodRing';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── 6 Category Pillars ─── */
const CATEGORY_PILLARS = [
  {
    id: 'practice',
    title: 'Practice',
    subtitle: 'Body, breath & energy',
    icon: Wind,
    color: '#D8B4FE',
    path: '/breathing',
    highlights: [
      { label: 'Breathwork', path: '/breathing' },
      { label: 'Meditation', path: '/meditation' },
      { label: 'Yoga', path: '/yoga' },
      { label: 'Mudras', path: '/mudras' },
      { label: 'Mantras', path: '/mantras' },
      { label: 'Light Therapy', path: '/light-therapy' },
    ],
  },
  {
    id: 'divination',
    title: 'Divination',
    subtitle: 'Cosmic insight & guidance',
    icon: Eye,
    color: '#E879F9',
    path: '/oracle',
    highlights: [
      { label: 'Oracle & Tarot', path: '/oracle' },
      { label: 'Akashic Records', path: '/akashic-records' },
      { label: 'Star Chart', path: '/star-chart' },
      { label: 'Numerology', path: '/numerology' },
      { label: 'Dream Journal', path: '/dreams' },
      { label: 'Mayan Astrology', path: '/mayan' },
    ],
  },
  {
    id: 'sanctuary',
    title: 'Sanctuary',
    subtitle: 'Inner peace & immersion',
    icon: Sprout,
    color: '#2DD4BF',
    path: '/zen-garden',
    highlights: [
      { label: 'Zen Garden', path: '/zen-garden' },
      { label: 'Soundscapes', path: '/soundscapes' },
      { label: 'Music Lounge', path: '/music-lounge' },
      { label: 'Frequencies', path: '/frequencies' },
      { label: 'VR Sanctuary', path: '/vr' },
      { label: 'Journaling', path: '/journal' },
    ],
  },
  {
    id: 'nourish',
    title: 'Nourish & Heal',
    subtitle: 'Holistic body care',
    icon: Leaf,
    color: '#22C55E',
    path: '/nourishment',
    highlights: [
      { label: 'Nourishment', path: '/nourishment' },
      { label: 'Aromatherapy', path: '/aromatherapy' },
      { label: 'Herbology', path: '/herbology' },
      { label: 'Elixirs', path: '/elixirs' },
      { label: 'Acupressure', path: '/acupressure' },
      { label: 'Reiki', path: '/reiki' },
    ],
  },
  {
    id: 'explore',
    title: 'Explore',
    subtitle: 'Learn, play & connect',
    icon: Compass,
    color: '#FB923C',
    path: '/journey',
    highlights: [
      { label: 'Sacred Encyclopedia', path: '/encyclopedia' },
      { label: 'Reading List', path: '/reading-list' },
      { label: 'Creation Stories', path: '/creation-stories' },
      { label: 'Teachings', path: '/teachings' },
      { label: 'Community', path: '/community' },
      { label: 'Blessings', path: '/blessings' },
    ],
  },
  {
    id: 'sage',
    title: 'Sage AI Coach',
    subtitle: 'Voice & text guidance',
    icon: MessageCircle,
    color: '#38BDF8',
    path: '/coach',
    highlights: [
      { label: 'Voice Conversations', path: '/coach' },
      { label: 'Spiritual Guidance', path: '/coach' },
      { label: 'Personalized Wisdom', path: '/coach' },
      { label: 'Crystals & Stones', path: '/crystals' },
    ],
  },
  {
    id: 'council',
    title: 'Sovereign Council',
    subtitle: '10 AI experts & Dust economy',
    icon: Shield,
    color: '#C084FC',
    path: '/sovereigns',
    highlights: [
      { label: 'Council Advisors', path: '/sovereigns' },
      { label: 'Economy & Dust', path: '/economy' },
      { label: 'Academy', path: '/academy' },
      { label: 'Trade Circle', path: '/trade-circle' },
      { label: 'Cosmic Map', path: '/cosmic-map' },
      { label: 'Archives', path: '/archives' },
    ],
  },
];

const FEELINGS = [
  // Positive
  { id: 'happy', label: 'Happy', icon: Sparkles, color: '#FCD34D' },
  { id: 'peaceful', label: 'Peaceful', icon: Sun, color: '#2DD4BF' },
  { id: 'energized', label: 'Energized', icon: Zap, color: '#FB923C' },
  { id: 'grateful', label: 'Grateful', icon: Heart, color: '#FDA4AF' },
  { id: 'curious', label: 'Curious', icon: Target, color: '#8B5CF6' },
  { id: 'inspired', label: 'Inspired', icon: Lightbulb, color: '#FCD34D' },
  { id: 'hopeful', label: 'Hopeful', icon: Sunrise, color: '#86EFAC' },
  { id: 'creative', label: 'Creative', icon: Flower2, color: '#C084FC' },
  { id: 'connected', label: 'Connected', icon: HeartHandshake, color: '#FDA4AF' },
  { id: 'brave', label: 'Brave', icon: Shield, color: '#FB923C' },
  // Challenged
  { id: 'stressed', label: 'Stressed', icon: Brain, color: '#EF4444' },
  { id: 'anxious', label: 'Anxious', icon: Wind, color: '#FB923C' },
  { id: 'tired', label: 'Low Energy', icon: Battery, color: '#FCD34D' },
  { id: 'sad', label: 'Down / Sad', icon: Frown, color: '#3B82F6' },
  { id: 'unfocused', label: 'Unfocused', icon: Target, color: '#8B5CF6' },
  { id: 'restless', label: "Can't Sleep", icon: Moon, color: '#2DD4BF' },
  { id: 'angry', label: 'Angry', icon: Angry, color: '#EF4444' },
  { id: 'lonely', label: 'Lonely', icon: CloudRain, color: '#3B82F6' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: Waves, color: '#8B5CF6' },
  { id: 'grief', label: 'Grieving', icon: HeartCrack, color: '#6366F1' },
  { id: 'numb', label: 'Numb / Empty', icon: Meh, color: '#94A3B8' },
  { id: 'fearful', label: 'Fearful', icon: AlertTriangle, color: '#F59E0B' },
  { id: 'frustrated', label: 'Frustrated', icon: Ban, color: '#EF4444' },
  { id: 'burnout', label: 'Burned Out', icon: BatteryWarning, color: '#FB923C' },
  { id: 'disconnected', label: 'Disconnected', icon: Orbit, color: '#94A3B8' },
  { id: 'jealous', label: 'Jealous / Envious', icon: Eye, color: '#22C55E' },
  { id: 'impatient', label: 'Impatient', icon: Clock, color: '#F59E0B' },
  { id: 'bored', label: 'Bored', icon: Coffee, color: '#94A3B8' },
  { id: 'nostalgic', label: 'Nostalgic', icon: Compass, color: '#C084FC' },
  // Spiritual
  { id: 'awakening', label: 'Spiritually Awakening', icon: Star, color: '#FCD34D' },
  { id: 'seeking', label: 'Seeking Purpose', icon: Mountain, color: '#2DD4BF' },
  { id: 'grounding', label: 'Need Grounding', icon: TreePine, color: '#22C55E' },
  { id: 'expansive', label: 'Expansive', icon: Globe, color: '#8B5CF6' },
];

const TESTIMONIALS = [
  { name: 'Steve R.', role: 'Beta Tester', text: "Noticed my focus doubled after using the 528Hz frequency during my morning coffee. It's like a reset button for my brain.", color: '#2DD4BF' },
  { name: 'Maya K.', role: 'Early Adopter', text: "The Zen Garden became my evening ritual. Releasing lanterns with my worries written on them — sounds silly, but it genuinely helps me sleep.", color: '#D8B4FE' },
  { name: 'James T.', role: 'Beta Tester', text: "Box breathing before meetings changed my entire work life. 4 seconds in, 4 hold, 4 out. Simple, but the guided tool makes it easy.", color: '#FCD34D' },
  { name: 'Priya S.', role: 'Beta Tester', text: "I was skeptical about mudras until I felt the actual tingling during Gyan Mudra. Combined with the frequency player — incredible.", color: '#FDA4AF' },
  { name: 'Alex M.', role: 'Early Adopter', text: "The Beginner's Journey walked me through everything without overwhelm. Now I have a daily practice that actually sticks.", color: '#86EFAC' },
  { name: 'Devon L.', role: 'Community Member', text: "Golden Milk recipe from the Nourishment section + 396Hz frequency = best sleep of my life. The science behind it makes sense.", color: '#FB923C' },
];

/* ─── Category Pillar Card ─── */
function PillarCard({ pillar, index }) {
  const navigate = useNavigate();
  const Icon = pillar.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="glass-card glass-card-hover p-8 group relative"
      style={{ borderColor: `${pillar.color}12` }}
      data-testid={`pillar-${pillar.id}`}
    >
      {/* Accent glow — dual layer for depth */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-700"
        style={{ background: pillar.color, filter: 'blur(50px)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700"
        style={{ background: pillar.color, filter: 'blur(40px)', transform: 'translate(-30%, 30%)' }} />
      <div className="flex items-start justify-between mb-6 cursor-pointer" onClick={() => navigate(pillar.path)}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{ 
            background: `${pillar.color}10`, 
            border: `1px solid ${pillar.color}18`,
            boxShadow: `0 0 20px ${pillar.color}08`,
          }}>
          <Icon size={24} style={{ color: pillar.color }} />
        </div>
        <ArrowRight size={16} className="opacity-0 group-hover:opacity-60 transition-all duration-300 group-hover:translate-x-1" style={{ color: pillar.color }} />
      </div>
      <h3 className="text-xl font-light mb-1 cursor-pointer" onClick={() => navigate(pillar.path)} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {pillar.title}
      </h3>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>{pillar.subtitle}</p>
      <div className="flex flex-wrap gap-1.5">
        {pillar.highlights.map(h => (
          <span key={h.label} onClick={(e) => { e.stopPropagation(); navigate(h.path); }}
            className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
            style={{ 
              background: `${pillar.color}0a`, 
              color: `${pillar.color}cc`, 
              border: `1px solid ${pillar.color}12`,
            }}
            data-testid={`pillar-link-${h.path.slice(1)}`}>
            {h.label}
          </span>
        ))}
      </div>
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${pillar.color}30, transparent)` }} />
    </motion.div>
  );
}

/* ─── Mantra Card with Natural TTS ─── */
function MantraCard({ mantra, accentColor }) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const speakMantra = async () => {
    if (speaking) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setSpeaking(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mantras' });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.volume = 0.8;
      audio.onended = () => { setSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { setSpeaking(false); audioRef.current = null; };
      audioRef.current = audio;
      setSpeaking(true);
      setLoading(false);
      audio.play().catch(() => { setSpeaking(false); });
    } catch {
      setLoading(false);
      setSpeaking(false);
    }
  };

  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  return (
    <div className="glass-card p-4 relative overflow-hidden" data-testid="reset-mantra">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.06]"
        style={{ background: accentColor, filter: 'blur(20px)', transform: 'translate(30%, -30%)' }} />
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: mantra.type === 'protective' ? 'rgba(139,92,246,0.1)' : 'rgba(252,211,77,0.1)' }}>
          <Shield size={16} style={{ color: mantra.type === 'protective' ? '#8B5CF6' : '#FCD34D' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: mantra.type === 'protective' ? '#8B5CF6' : '#FCD34D' }}>
              {mantra.type === 'protective' ? 'Protective' : 'Uplifting'} Mantra
            </p>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--text-muted)08', color: 'var(--text-muted)' }}>
              {mantra.tradition}
            </span>
          </div>
          <p className="text-sm italic leading-relaxed" style={{ color: '#F1F0F5', fontFamily: 'Cormorant Garamond, serif', textShadow: '0 1px 8px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.4)' }}>
            "{mantra.text}"
          </p>
          <button onClick={speakMantra}
            disabled={loading}
            className="mt-2 flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
            style={{
              background: speaking ? `${accentColor}15` : 'var(--text-muted)08',
              color: speaking ? accentColor : 'var(--text-muted)',
              border: `1px solid ${speaking ? `${accentColor}30` : 'var(--text-muted)15'}`,
              opacity: loading ? 0.6 : 1,
            }}
            data-testid="mantra-speak-btn">
            {loading ? <Loader2 size={12} className="animate-spin" /> : speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
            {loading ? 'Loading...' : speaking ? 'Stop' : 'Hear Mantra'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable Widget Wrapper ─── */
function SortableWidget({ id, children, editMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}
      className={`relative group/drag ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...(editMode ? listeners : {})}>
      {editMode && (
        <div className="drag-handle absolute top-3 right-3 z-10 p-1.5 rounded-lg cursor-grab active:cursor-grabbing"
          style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.2)' }}
          data-testid={`drag-handle-${id}`}>
          <GripVertical size={14} style={{ color: 'rgba(192,132,252,0.7)' }} />
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Personalized Dashboard (for logged-in returning users) ─── */
function PersonalizedDashboard({ user, onQuickReset }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('zen_widget_order');
    return saved ? JSON.parse(saved) : ['mood-ring', 'wisdom', 'actions', 'continue', 'new-for-you', 'progress'];
  });
  const [editMode, setEditMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setWidgetOrder(prev => {
        const oldIdx = prev.indexOf(active.id);
        const newIdx = prev.indexOf(over.id);
        const updated = arrayMove(prev, oldIdx, newIdx);
        localStorage.setItem('zen_widget_order', JSON.stringify(updated));
        return updated;
      });
    }
  };

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/dashboard/personalized`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !data) return null;

  const { greeting, wisdom, continue_items, new_for_you, progress, featured_tradition } = data;

  const widgetMap = {
    'mood-ring': <CosmicMoodRing />,
    'wisdom': (
      <div className="glass-card p-6 relative overflow-hidden animate-portal-pulse" data-testid="daily-wisdom">
        <div className="absolute top-3 right-10 opacity-10">
          <Quote size={36} style={{ color: wisdom.color }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: wisdom.color }}>
          Today's Cosmic Insight
        </p>
        <p className="text-sm md:text-base font-light leading-relaxed mb-3 max-w-2xl"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F1F0F5', textShadow: '0 1px 8px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.4)' }}>
          "{wisdom.text}"
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          — {wisdom.source} <span style={{ color: wisdom.color }}>&middot; {wisdom.tradition}</span>
        </p>
      </div>
    ),
    'actions': (
      <div className="flex gap-3 flex-wrap" data-testid="dashboard-actions">
        {[
          { label: 'Quick Reset', icon: Zap, color: '#D8B4FE', action: onQuickReset, bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.18)', id: 'dashboard-quick-reset' },
          { label: 'Full Dashboard', icon: ArrowRight, color: '#2DD4BF', action: () => navigate('/dashboard'), bg: 'rgba(45,212,191,0.06)', border: 'rgba(45,212,191,0.15)', id: 'dashboard-continue' },
          { label: 'Talk to Sage', icon: Sparkles, color: '#D8B4FE', action: () => navigate('/coach'), bg: 'rgba(216,180,254,0.06)', border: 'rgba(216,180,254,0.15)', id: 'dashboard-sage' },
          { label: 'My Journey', icon: Star, color: '#FCD34D', action: () => navigate('/growth-timeline'), bg: 'rgba(252,211,77,0.06)', border: 'rgba(252,211,77,0.15)', id: 'dashboard-timeline' },
        ].map(btn => {
          const BIcon = btn.icon;
          return (
            <motion.button key={btn.id} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={btn.action}
              className="btn-glass group flex items-center gap-2 text-sm"
              style={{ background: btn.bg, borderColor: btn.border }}
              data-testid={btn.id}>
              <span style={{ color: btn.color }} className="flex items-center gap-2">
                {btn.label} <BIcon size={14} />
              </span>
            </motion.button>
          );
        })}
      </div>
    ),
    'continue': continue_items.length > 0 ? (
      <div data-testid="continue-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
          Continue Where You Left Off
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {continue_items.map((item, i) => (
            <motion.button key={i} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.page)}
              data-testid={`continue-item-${i}`}
              className="glass-card p-4 text-left group transition-all"
              style={{ borderColor: `${item.color}0a` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${item.color}10`, boxShadow: `0 0 12px ${item.color}08` }}>
                <ChevronRight size={14} style={{ color: item.color }} />
              </div>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
              <p className="text-[9px]" style={{ color: item.color }}>{item.category}</p>
            </motion.button>
          ))}
        </div>
      </div>
    ) : null,
    'new-for-you': new_for_you.length > 0 ? (
      <div data-testid="new-for-you-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#FB923C' }}>
          <Sparkles size={10} className="inline mr-1" /> New For You
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {new_for_you.map((item, i) => (
            <motion.button key={i} whileHover={{ y: -3 }}
              onClick={() => navigate(item.page)}
              data-testid={`new-item-${i}`}
              className="glass-card p-4 min-w-[160px] flex-shrink-0 text-left transition-all hover:scale-[1.02]"
              style={{ borderColor: `${item.color}0a` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${item.color}10`, boxShadow: `0 0 12px ${item.color}08` }}>
                <Star size={14} style={{ color: item.color }} />
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
              <p className="text-[9px]" style={{ color: item.color }}>{item.category}</p>
            </motion.button>
          ))}
        </div>
      </div>
    ) : null,
    'progress': (
      <div data-testid="progress-stats">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
          Your Journey So Far
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'Sessions', value: progress.total_sessions, color: '#D8B4FE' },
            { label: 'AI Conversations', value: progress.ai_sessions, color: '#818CF8' },
            { label: 'Mood Entries', value: progress.mood_entries, color: '#FDA4AF' },
            { label: 'Journal Entries', value: progress.journal_entries, color: '#86EFAC' },
            { label: 'Features Found', value: `${progress.features_discovered}/${progress.total_features}`, color: '#FB923C' },
            { label: 'Streak Days', value: progress.streak_days, color: '#FCD34D' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -2, scale: 1.03 }} className="glass-card p-3 text-center transition-all cursor-default"
              style={{ borderColor: `${stat.color}08` }}>
              <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: stat.color }}>{stat.value}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-24 pb-12" data-testid="personalized-dashboard">
      <div className="max-w-5xl mx-auto">
        {/* Greeting + Wisdom */}
        <div className="mb-8">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            {greeting}
          </motion.p>
          {progress.streak_days > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[11px] flex items-center gap-1.5 mb-4" style={{ color: '#FCD34D' }}>
              <Flame size={12} /> {progress.streak_days}-day streak
            </motion.p>
          )}
          <p className="text-[10px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <button onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
              style={{
                background: editMode ? 'rgba(192,132,252,0.1)' : 'transparent',
                border: `1px solid ${editMode ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.06)'}`,
                color: editMode ? '#C084FC' : 'var(--text-muted)',
              }}
              data-testid="edit-layout-toggle">
              <GripVertical size={10} />
              {editMode ? 'Done' : 'Rearrange'}
            </button>
          </p>
        </div>

        {/* Draggable Widget Grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div className="space-y-6">
              {widgetOrder.map(id => widgetMap[id] ? (
                <SortableWidget key={id} id={id} editMode={editMode}>
                  {widgetMap[id]}
                </SortableWidget>
              ) : null)}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

/* ─── Quick Reset Modal ─── */
function QuickResetModal({ open, onClose }) {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const { toggleFreq, activeFreqs, toggleMantra, activeMantra, mantraLoading } = useMixer();
  const [feeling, setFeeling] = useState(null);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [freqPlaying, setFreqPlaying] = useState(false);

  const filteredFeelings = search.trim()
    ? FEELINGS.filter(f => f.label.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase()))
    : FEELINGS;

  const selectFeeling = async (f) => {
    setFeeling(f);
    setLoading(true);
    try {
      const res = await axios.get(`${API}/quick-reset/${f.id}`);
      setFlow(res.data);
    } catch {
      toast.error('Could not load reset flow');
    } finally {
      setLoading(false);
    }
  };

  const playFrequency = useCallback(async (hz) => {
    const freq = MIXER_FREQUENCIES.find(f => f.hz === hz) || { hz, label: `${hz} Hz`, desc: 'Healing Frequency', color: '#8B5CF6' };
    await toggleFreq(freq);
    setFreqPlaying(prev => !prev);
    toast(activeFreqs.has(hz) ? `Stopped ${hz} Hz` : `Playing ${hz} Hz`, { description: freq.desc || 'Healing frequency activated' });
  }, [toggleFreq, activeFreqs]);

  const playMantra = useCallback(async (mantraText) => {
    const match = MIXER_MANTRAS.find(m => mantraText.includes(m.text.split('...')[0]));
    if (match) {
      await toggleMantra(match, authHeaders);
    } else {
      toast('Mantra text loaded', { description: 'Open the Cosmic Mixer for voice morphing' });
    }
  }, [toggleMantra, authHeaders]);

  const reset = () => { setFeeling(null); setFlow(null); setSearch(''); setFreqPlaying(false); };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-lg p-8 relative rounded-3xl overflow-hidden"
          style={{ background: 'rgba(13,14,26,0.97)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(28px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(192,132,252,0.06)' }}
          data-testid="quick-reset-modal"
        >
          <button onClick={() => { onClose(); reset(); }} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>

          {!feeling ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#2DD4BF' }}>Quick Reset</p>
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                How are you feeling right now?
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                We'll build a personalized 5-minute reset just for you.
              </p>
              {/* Search bar */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search feelings..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                  data-testid="feeling-search"
                />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto pr-1 overscroll-contain" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
                {filteredFeelings.map(f => {
                  const FIcon = f.icon;
                  return (
                    <button key={f.id} onClick={() => selectFeeling(f)}
                      className="glass-card p-3 flex flex-col items-center gap-1.5 hover:scale-[1.03] transition-all"
                      style={{ border: `1px solid ${f.color}15`, touchAction: 'pan-y' }}
                      data-testid={`feeling-${f.id}`}>
                      <FIcon size={18} style={{ color: f.color }} />
                      <span className="text-[9px] font-medium text-center leading-tight" style={{ color: 'var(--text-primary)' }}>{f.label}</span>
                    </button>
                  );
                })}
                {filteredFeelings.length === 0 && (
                  <div className="col-span-full text-center py-6">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No matching feelings. Try a different word.</p>
                  </div>
                )}
              </div>
            </>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full animate-pulse mx-auto mb-4" style={{ background: `${feeling.color}20` }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Building your reset...</p>
            </div>
          ) : flow ? (
            <>
              <button onClick={reset} className="text-xs flex items-center gap-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                <ChevronRight size={12} className="rotate-180" /> Change feeling
              </button>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: feeling.color }}>
                Your 5-Minute Reset
              </p>
              <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Feeling {flow.label}? Try this:
              </h2>
              <div className="space-y-3">
                <button onClick={() => playFrequency(flow.frequency.hz)}
                  className="w-full glass-card p-4 flex items-start gap-3 text-left hover:scale-[1.01] transition-all group"
                  style={{ borderColor: activeFreqs.has(flow.frequency.hz) ? `${feeling.color}30` : undefined }}
                  data-testid="reset-frequency">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${feeling.color}12` }}>
                    {activeFreqs.has(flow.frequency.hz) ? (
                      <Volume2 size={16} style={{ color: feeling.color }} className="animate-pulse" />
                    ) : (
                      <Radio size={16} style={{ color: feeling.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flow.frequency.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{flow.frequency.desc}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] px-2 py-0.5 rounded-full"
                      style={{ background: activeFreqs.has(flow.frequency.hz) ? `${feeling.color}15` : `${feeling.color}08`, color: feeling.color }}>
                      {activeFreqs.has(flow.frequency.hz) ? <><Volume2 size={8} /> Playing — tap to stop</> : <><Play size={8} /> Tap to play instantly</>}
                    </span>
                  </div>
                </button>
                <button onClick={() => { navigate(flow.tool.path); onClose(); reset(); }}
                  className="w-full glass-card p-4 flex items-start gap-3 text-left hover:scale-[1.01] transition-all group"
                  data-testid="reset-tool">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,212,191,0.1)' }}>
                    <Wind size={16} style={{ color: '#2DD4BF' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flow.tool.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{flow.tool.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button onClick={() => { navigate('/nourishment'); onClose(); reset(); }}
                  className="w-full glass-card p-4 flex items-start gap-3 text-left hover:scale-[1.01] transition-all group"
                  data-testid="reset-nourishment">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Leaf size={16} style={{ color: '#22C55E' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flow.nourishment.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{flow.nourishment.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                {flow.mantra && (
                  <MantraCard mantra={flow.mantra} accentColor={feeling.color} />
                )}
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/* ─── Waitlist Section ─── */
function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/waitlist/count`).then(res => setCount(res.data.count)).catch(() => {});
  }, []);

  const join = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/waitlist/join`, { email, name });
      setStatus(res.data);
      if (res.data.status === 'joined') setCount(res.data.position);
      toast.success(res.data.message);
    } catch {
      toast.error('Could not join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 px-6 md:px-12 lg:px-24 py-24" data-testid="waitlist-section">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin size={14} style={{ color: '#FB923C' }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#FB923C' }}>Coming Soon</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Bringing <span style={{ color: '#2DD4BF' }}>Positive Energy</span> to Your City
          </h2>
          <p className="text-sm md:text-base mb-2 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            The Cosmic Collective Enlightenment Cafe — a physical sanctuary where frequencies, nourishment, and community converge. Opening Late 2026.
          </p>
          <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
            Join the Founding 100 for exclusive updates, early access events, and mobile unit schedules.
          </p>

          {status?.status === 'joined' || status?.status === 'already_joined' ? (
            <div className="glass-card p-6 max-w-md mx-auto">
              <Sparkles size={24} style={{ color: '#FCD34D', margin: '0 auto 12px' }} />
              <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {status.status === 'joined' ? "You're in!" : "You're already on the list!"}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {count > 0 ? `${count} souls and counting` : "Welcome to the founding crew"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
                className="input-glass text-sm flex-1" data-testid="waitlist-name" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                className="input-glass text-sm flex-1" data-testid="waitlist-email" />
              <button onClick={join} disabled={loading}
                className="btn-glass px-6 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                style={{ background: 'rgba(45,212,191,0.1)', borderColor: 'rgba(45,212,191,0.2)', color: '#2DD4BF' }}
                data-testid="waitlist-join-btn">
                <Mail size={14} /> {loading ? 'Joining...' : 'Join Founding 100'}
              </button>
            </div>
          )}
          {count > 0 && !status && (
            <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>{count} already joined</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Footer ─── */
function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      <footer className="relative z-10 px-6 md:px-12 lg:px-24 py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.6), rgba(124,58,237,0.2))' }} />
            <span className="text-sm font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
              The Cosmic Collective &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowPrivacy(true)} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }} data-testid="privacy-link">
              <Shield size={10} className="inline mr-1" /> Privacy Policy
            </button>
            <button onClick={() => setShowDisclaimer(true)} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }} data-testid="disclaimer-link">
              Wellness Disclaimer
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showPrivacy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowPrivacy(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              <Shield size={24} style={{ color: '#2DD4BF', marginBottom: 12 }} />
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Privacy Policy</h2>
              <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Your Data is Sacred.</strong> We treat your personal information with the same care we bring to every tool on this platform.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>What We Collect:</strong> Account info (name, email), mood logs, journal entries, and practice history. This data powers personalized recommendations and progress tracking.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>What We Don't Do:</strong> We never sell your data. We never share your journal entries, mood logs, or personal reflections with third parties. Your inner world stays private.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Security:</strong> All data is encrypted in transit and at rest. Authentication uses industry-standard JWT tokens. Passwords are bcrypt-hashed and never stored in plain text.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>AI Features:</strong> When you use AI-powered features, your prompts are processed by our AI partner to generate content. We do not store or train on these interactions beyond delivering the immediate response.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Your Rights:</strong> You can request deletion of your account and all associated data at any time by contacting us.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDisclaimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowDisclaimer(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowDisclaimer(false)} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              <Heart size={24} style={{ color: '#FDA4AF', marginBottom: 12 }} />
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Digital Wellness Disclaimer</h2>
              <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>For Wellness & Relaxation Only.</strong> The Cosmic Collective provides tools for personal wellness, stress relief, and relaxation. These tools are not medical devices and are not intended to diagnose, treat, cure, or prevent any disease or medical condition.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Not a Substitute for Professional Care.</strong> If you are experiencing a mental health crisis, severe anxiety, depression, or any medical condition, please seek professional help immediately. Our tools complement — but never replace — professional medical or psychological care.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Frequency & Light Therapy:</strong> Some users may be sensitive to certain frequencies or light patterns. If you experience discomfort, dizziness, or any adverse effects, discontinue use immediately. Those with photosensitive epilepsy should consult a healthcare provider before using light therapy features.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Nourishment Information:</strong> Recipe and nutritional information is provided for educational purposes. Individual dietary needs vary. Consult a healthcare provider or registered dietitian for personalized nutrition advice, especially if you have food allergies or medical conditions.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>The Engineer's Promise:</strong> Every tool on this platform is designed with care, precision, and genuine intention to help. We built this because we believe in the power of these practices — and we want to share them responsibly.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main Landing ─── */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [breathScale, setBreathScale] = useState(1);
  const [showQuickReset, setShowQuickReset] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const animRef = useRef(null);

  // Tour only opens when user clicks "Take the Tour" button
  // No auto-launch — first-time visitors should be able to navigate freely

  const handleTourFinish = () => {
    localStorage.setItem('zen_tour_seen', 'true');
  };

  const animateBreath = useCallback(() => {
    const duration = 8000;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = (now - start) % duration;
      const progress = elapsed / duration;
      const scale = 1 + 0.5 * Math.sin(progress * Math.PI * 2);
      setBreathScale(scale);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    animateBreath();
    return () => cancelAnimationFrame(animRef.current);
  }, [animateBreath]);

  return (
    <div className="min-h-screen immersive-page relative" style={{ background: 'transparent' }}>
      <QuickResetModal open={showQuickReset} onClose={() => setShowQuickReset(false)} />
      <GuidedTour isOpen={showTour} onClose={() => { setShowTour(false); handleTourFinish(); }} onFinish={handleTourFinish} />

      {/* Share Button */}
      <div className="fixed top-4 right-4 z-50">
        <ShareButton />
      </div>

      {/* Aurora overlays — immersive portal layers */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full animate-aurora"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, rgba(217,70,239,0.04) 40%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.10) 0%, rgba(45,212,191,0.03) 40%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora 12s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(234,179,8,0.07) 0%, transparent 60%)', filter: 'blur(100px)', animation: 'aurora 16s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(253,164,175,0.06) 0%, transparent 60%)', filter: 'blur(90px)', animation: 'aurora 20s ease-in-out infinite reverse' }} />
      </div>

      {/* ═══ Personalized Dashboard for returning users ═══ */}
      {user && (
        <PersonalizedDashboard user={user} onQuickReset={() => setShowQuickReset(true)} />
      )}

      {/* ═══ Hero (shown for everyone, adjusted padding for logged-in) ═══ */}
      <div className={`relative z-10 px-6 md:px-12 lg:px-24 ${user ? 'pt-8 pb-12' : 'pt-28 pb-20'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--secondary)' }}>
              <Sparkles size={14} className="inline mr-2" style={{ color: 'var(--accent-gold)' }} />
              Ancient Wisdom, Modern Practice
            </motion.p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>The Cosmic</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="block animate-text-shimmer" style={{ lineHeight: 1.2 }}>Collective</motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="text-base md:text-lg leading-relaxed max-w-md mb-6" style={{ color: '#C8C5D0', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              Your sanctuary for breathwork, meditation, divination, and spiritual growth — guided by ancient wisdom and modern technology.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="flex items-center gap-3 mb-8">
              <button
                onClick={() => navigate('/intro')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:scale-105 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.05))',
                  border: '1px solid rgba(251,191,36,0.18)',
                  color: '#FBBF24',
                }}
                data-testid="watch-intro-btn"
              >
                <Play size={13} className="transition-transform group-hover:scale-110" />
                Watch the Journey
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4">
              <button onClick={() => setShowQuickReset(true)}
                onTouchEnd={(e) => { e.preventDefault(); setShowQuickReset(true); }}
                className="group py-3 px-6 rounded-full cursor-pointer glow-primary"
                style={{
                  background: 'rgba(192,132,252,0.08)',
                  border: '1px solid rgba(192,132,252,0.18)',
                  backdropFilter: 'blur(12px)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'rgba(192,132,252,0.1)',
                }}
                data-testid="quick-reset-btn">
                <span className="relative z-10 flex items-center gap-2" style={{ color: '#D8B4FE' }}>
                  Quick Reset
                  <Zap size={16} className="transition-transform duration-300 group-hover:scale-110" />
                </span>
              </button>
              <button onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="btn-glass group"
                style={{ background: 'rgba(45,212,191,0.06)', borderColor: 'rgba(45,212,191,0.15)' }}
                data-testid="begin-journey-btn">
                <span className="flex items-center gap-2" style={{ color: '#2DD4BF' }}>
                  {user ? 'Continue Journey' : 'Begin Journey'} <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <button onClick={() => setShowTour(true)}
                onTouchEnd={(e) => { e.preventDefault(); setShowTour(true); }}
                className="group py-3 px-6 rounded-full cursor-pointer"
                style={{
                  background: 'rgba(216,180,254,0.08)',
                  border: '1px solid rgba(216,180,254,0.2)',
                  backdropFilter: 'blur(12px)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'rgba(216,180,254,0.1)',
                }}
                data-testid="take-tour-btn">
                <span className="flex items-center gap-2" style={{ color: '#D8B4FE' }}>
                  Take the Tour <Play size={14} className="transition-transform duration-300 group-hover:scale-110" />
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Breathing orb — immersive cosmic sphere */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {/* Orbital particles */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const radius = 42 + (i % 3) * 8;
                const colors = ['#D8B4FE', '#2DD4BF', '#FCD34D', '#FDA4AF', '#818CF8', '#FB923C'];
                return (
                  <motion.div key={i} className="absolute rounded-full"
                    style={{
                      width: i % 4 === 0 ? 3 : 2,
                      height: i % 4 === 0 ? 3 : 2,
                      background: colors[i % colors.length],
                      left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                      top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                      boxShadow: `0 0 8px ${colors[i % colors.length]}40`,
                    }}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.4, 0.6] }}
                    transition={{ duration: 3 + i * 0.2, repeat: Infinity, delay: i * 0.15 }} />
                );
              })}
              {/* Multi-layered aura rings */}
              {[
                { size: 55, color1: 'rgba(124,58,237,0.12)', color2: 'rgba(6,182,212,0.04)', border: 'rgba(192,132,252,0.08)' },
                { size: 70, color1: 'rgba(6,182,212,0.08)', color2: 'rgba(234,179,8,0.03)', border: 'rgba(6,182,212,0.06)' },
                { size: 85, color1: 'rgba(217,70,239,0.06)', color2: 'rgba(253,164,175,0.02)', border: 'rgba(217,70,239,0.05)' },
                { size: 100, color1: 'rgba(192,132,252,0.04)', color2: 'transparent', border: 'rgba(192,132,252,0.03)' },
              ].map((ring, i) => (
                <div key={i} className="absolute rounded-full"
                  style={{
                    width: `${ring.size}%`, height: `${ring.size}%`,
                    background: `radial-gradient(circle, ${ring.color1} 0%, ${ring.color2} 70%)`,
                    border: `1px solid ${ring.border}`,
                    transform: `scale(${breathScale * (0.92 + i * 0.03)})`, transition: 'transform 0.1s linear',
                  }} />
              ))}
              {/* Inner core */}
              <div className="relative z-10 w-20 h-20 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(217,70,239,0.7) 0%, rgba(124,58,237,0.35) 40%, rgba(6,182,212,0.15) 70%, transparent 100%)',
                  boxShadow: `0 0 ${40 + breathScale * 30}px rgba(192,132,252,${0.25 + breathScale * 0.15}), 0 0 ${80 + breathScale * 40}px rgba(124,58,237,0.1), 0 0 ${120 + breathScale * 50}px rgba(6,182,212,0.06)`,
                  transform: `scale(${breathScale})`, transition: 'transform 0.1s linear',
                }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Category Pillars (replaces 24-card grid) ═══ */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pb-20" data-testid="category-pillars-section">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--text-muted)' }}>
              Explore Your Path
            </p>
            <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Six Pillars of <span className="animate-text-shimmer">Transformation</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORY_PILLARS.map((pillar, i) => (
              <PillarCard key={pillar.id} pillar={pillar} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Testimonials ═══ */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 py-20" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--text-muted)' }}>
              <Quote size={12} className="inline mr-2" /> What Our Community Says
            </p>
            <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Real Results from Real Practitioners
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.06 }}
                className="glass-card glass-card-hover p-6 relative"
                style={{ borderColor: `${item.color}0a` }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-6 right-6 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.color}25, transparent)` }} />
                <div className="absolute top-4 right-4 opacity-[0.08]">
                  <Quote size={28} style={{ color: item.color }} />
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  "{item.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${item.color}15`, color: item.color, boxShadow: `0 0 12px ${item.color}10` }}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ How it Works ═══ */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 py-20" data-testid="how-it-works-section">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: '#2DD4BF' }}>Our Story</p>
            <h2 className="text-2xl md:text-3xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              High-Frequency Wellness, Delivered to You
            </h2>
            <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The Cosmic Collective is a mobile wellness experience that brings healing frequencies, guided meditations, and ancient wisdom directly to you — wherever you are, whenever you need it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {[
              { step: '01', title: 'Choose Your Frequency', desc: 'Select from healing soundscapes, guided meditations, breathwork, or sacred practices tailored to your current state.', color: '#D8B4FE' },
              { step: '02', title: 'Immerse & Transform', desc: 'Our 3D holographic guided experiences use AI narration, binaural frequencies, and ancient techniques to shift your energy in minutes.', color: '#2DD4BF' },
              { step: '03', title: 'Track Your Evolution', desc: 'Daily challenges, streaks, and your personal wellness journey build momentum. Watch yourself grow with every session.', color: '#FCD34D' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card glass-card-hover p-8 text-center relative overflow-hidden"
                style={{ borderColor: `${item.color}08` }}
              >
                {/* Glow accent */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-[0.06]"
                  style={{ background: item.color, filter: 'blur(30px)' }} />
                <p className="text-4xl font-light mb-4 relative" style={{ fontFamily: 'Cormorant Garamond, serif', color: item.color, opacity: 0.4 }}>{item.step}</p>
                <h3 className="text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                {/* Bottom accent */}
                <div className="absolute bottom-0 left-6 right-6 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.color}20, transparent)` }} />
              </motion.div>
            ))}
          </div>

          {/* Mobile Unit CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-10 text-center relative overflow-hidden"
            style={{ borderColor: 'rgba(45,212,191,0.12)' }}
          >
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-[0.03]"
              style={{ background: '#2DD4BF', filter: 'blur(60px)', transform: 'translate(30%, -40%)' }} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#2DD4BF' }}>Mobile Wellness Unit</p>
            <h3 className="text-xl md:text-2xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              We Come to You
            </h3>
            <p className="text-sm max-w-lg mx-auto mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Experience The Cosmic Collective in person. Our mobile unit brings sound healing, frequency therapy, and guided meditation sessions directly to your location.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => navigate('/auth')}
                className="px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
                data-testid="book-session-btn">
                Book a Session <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate('/auth')}
                className="px-8 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}
                data-testid="find-mobile-unit-btn">
                Find the Mobile Unit
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <WaitlistSection />
      <Footer />
    </div>
  );
}
