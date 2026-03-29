import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, X, Play, Sun, Flame, Eye, Leaf,
  Heart, Compass, Star, BookOpen, Music, Sparkles, Globe, Brain,
  Waves, Trophy, FileText, MessageCircle, Gem, Smartphone, Share2
} from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to The Cosmic Collective',
    desc: 'Your immersive portal to spiritual wellness, ancient wisdom, and cosmic discovery. Let us show you everything this platform has to offer.',
    icon: Sparkles,
    color: '#D8B4FE',
    bg: 'radial-gradient(ellipse at 30% 40%, rgba(216,180,254,0.12) 0%, transparent 60%)',
    category: 'Introduction',
  },
  {
    id: 'today',
    title: 'Today — Your Daily Sanctuary',
    desc: 'Start each day with a personalized briefing, mood check-ins, custom rituals, and cosmic calendar alignments. Track your growth over time with visual timelines and monthly AI-generated Soul Reports.',
    icon: Sun,
    color: '#FCD34D',
    bg: 'radial-gradient(ellipse at 30% 40%, rgba(252,211,77,0.1) 0%, transparent 60%)',
    category: 'Pillar 1',
    features: ['Daily Briefing', 'Mood Tracking', 'Growth Timeline', 'Soul Reports'],
    path: '/daily-briefing',
  },
  {
    id: 'practice',
    title: 'Practice — Sacred Techniques',
    desc: 'Explore breathing exercises, guided meditations, yoga flows, mudras, mantras, affirmations, and ancient practices like Ho\'oponopono and Tantra. Each session is designed to deepen your practice.',
    icon: Flame,
    color: '#2DD4BF',
    bg: 'radial-gradient(ellipse at 70% 30%, rgba(45,212,191,0.1) 0%, transparent 60%)',
    category: 'Pillar 2',
    features: ['Breathing Exercises', 'Meditation', 'Yoga', 'Mantras', 'Mudras', 'Affirmations'],
    path: '/breathing',
  },
  {
    id: 'divination',
    title: 'Divination — Cosmic Guidance',
    desc: 'Access oracles, tarot, a multi-cultural 3D star chart with 8 world sky traditions, numerology, Mayan astrology, cardology, dream journaling, and the Akashic Records — a guided AI session into your soul\'s eternal library.',
    icon: Eye,
    color: '#E879F9',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(232,121,249,0.1) 0%, transparent 60%)',
    category: 'Pillar 3',
    features: ['Oracle & Tarot', 'Akashic Records', '3D Star Chart', 'Numerology', 'Dream Journal'],
    path: '/oracle',
  },
  {
    id: 'sanctuary',
    title: 'Sanctuary — Rest & Restore',
    desc: 'Your personal space for healing. Immerse in soundscapes, healing frequencies, a Zen garden, music lounge with ambient tracks, and a private journal. The Cosmic Mixer lets you layer frequencies, sounds, mantras, light therapy, and vibration.',
    icon: Leaf,
    color: '#86EFAC',
    bg: 'radial-gradient(ellipse at 40% 60%, rgba(134,239,172,0.1) 0%, transparent 60%)',
    category: 'Pillar 4',
    features: ['Soundscapes', 'Music Lounge', 'Zen Garden', 'Healing Frequencies', 'Journal', 'Cosmic Mixer'],
    path: '/soundscapes',
  },
  {
    id: 'nourish',
    title: 'Nourish — Mind, Body & Spirit',
    desc: 'Holistic wellness for your whole being. Explore herbology, aromatherapy, sacred nourishment guides, and Reiki & aura healing. Feed your body as intentionally as you feed your soul.',
    icon: Heart,
    color: '#FDA4AF',
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(253,164,175,0.1) 0%, transparent 60%)',
    category: 'Pillar 5',
    features: ['Herbology', 'Aromatherapy', 'Nourishment', 'Reiki & Aura'],
    path: '/nourishment',
  },
  {
    id: 'explore',
    title: 'Explore — Infinite Discovery',
    desc: 'Dive into a Sacred Encyclopedia of 12 world spiritual traditions, a curated reading list of 24 sacred texts, creation stories, community features, crystals & rock hounding, quantum entanglement meditations, and more.',
    icon: Compass,
    color: '#FB923C',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(251,146,60,0.1) 0%, transparent 60%)',
    category: 'Pillar 6',
    features: ['Sacred Encyclopedia', 'Reading List', 'Crystals & Stones', 'Community', 'Trade Circle'],
    path: '/encyclopedia',
  },
  {
    id: 'starchart',
    title: '3D Star Chart — World Skies',
    desc: 'An interactive 3D constellation map featuring 8 cultural sky traditions — Mayan, Egyptian, Aboriginal, Lakota, Chinese, Vedic, Norse, and Polynesian. Toggle gyroscope mode, explore mythology, and earn stargazer badges.',
    icon: Star,
    color: '#818CF8',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(129,140,248,0.12) 0%, transparent 60%)',
    category: 'Spotlight',
    path: '/star-chart',
  },
  {
    id: 'akashic',
    title: 'Akashic Records — Your Soul\'s Library',
    desc: 'A guided AI experience where you access the cosmic memory field. Choose from 6 gateways — Soul Purpose, Past Lives, Karmic Patterns, Soul Relationships, Soul Healing, and Soul Gifts. The Keeper of Records responds with deep, personalized wisdom.',
    icon: BookOpen,
    color: '#D8B4FE',
    bg: 'radial-gradient(ellipse at 30% 50%, rgba(216,180,254,0.12) 0%, transparent 60%)',
    category: 'Spotlight',
    path: '/akashic-records',
  },
  {
    id: 'mixer',
    title: 'Cosmic Mixer — Layer Your Experience',
    desc: 'A floating multi-layer tool that lets you combine healing frequencies (432Hz, 528Hz, 741Hz), ambient sounds (rain, ocean, forest), sacred mantras with natural AI voice, color light therapy, and device vibration — all at once.',
    icon: Waves,
    color: '#A855F7',
    bg: 'radial-gradient(ellipse at 60% 50%, rgba(168,85,247,0.12) 0%, transparent 60%)',
    category: 'Spotlight',
  },
  {
    id: 'ai',
    title: 'AI-Powered Throughout',
    desc: 'A spiritual AI coach (Sage) for personalized guidance, natural-sounding TTS mantras, AI deep dives into any spiritual teaching, personalized reading recommendations, and monthly Soul Reports that analyze your growth patterns.',
    icon: Brain,
    color: '#38BDF8',
    bg: 'radial-gradient(ellipse at 40% 40%, rgba(56,189,248,0.1) 0%, transparent 60%)',
    category: 'Technology',
  },
  {
    id: 'personalized',
    title: 'It Learns & Grows With You',
    desc: 'Every visit is different. The app tracks your journey and delivers personalized greetings, daily wisdom that rotates, "Continue Where You Left Off" shortcuts, "New For You" recommendations, milestone badges, and progress tracking.',
    icon: Trophy,
    color: '#FCD34D',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(252,211,77,0.1) 0%, transparent 60%)',
    category: 'Experience',
  },
  {
    id: 'finish',
    title: 'Your Journey Begins Now',
    desc: 'The Cosmic Collective is a living, breathing platform that evolves with you. Explore at your own pace — there\'s always something new to discover. Welcome to the collective.',
    icon: Sparkles,
    color: '#D8B4FE',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(216,180,254,0.15) 0%, rgba(129,140,248,0.05) 50%, transparent 80%)',
    category: 'Begin',
  },
];

export default function GuidedTour({ isOpen, onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = TOUR_STEPS[step];
  const total = TOUR_STEPS.length;
  const progress = ((step + 1) / total) * 100;

  const next = useCallback(() => {
    if (step < total - 1) setStep(s => s + 1);
    else { onFinish?.(); onClose(); }
  }, [step, total, onClose, onFinish]);

  const prev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const goToFeature = (path) => {
    onClose();
    navigate(path);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, next, prev, onClose]);

  if (!isOpen) return null;

  const Icon = current.icon;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ background: '#0B0C15' }}
        data-testid="guided-tour-overlay">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: current.bg, transition: 'background 0.6s ease' }} />

        {/* Close button */}
        <button onClick={onClose} data-testid="tour-close-btn"
          className="absolute top-6 right-6 p-2 rounded-xl z-10 transition-all hover:bg-white/10"
          style={{ color: 'rgba(248,250,252,0.7)' }}>
          <X size={20} />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
            className="h-full" style={{ background: `linear-gradient(90deg, ${current.color}, ${current.color}80)` }} />
        </div>

        {/* Step counter */}
        <div className="absolute top-6 left-6 text-[10px] font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>
          {step + 1} / {total}
        </div>

        {/* Main content */}
          <motion.div key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-lg w-full mx-4 px-10 py-12 text-center relative z-10 rounded-2xl"
            style={{ background: 'rgba(25,27,50,1)', border: '1px solid rgba(192,132,252,0.2)', boxShadow: `0 0 100px ${current.color}15, 0 0 40px rgba(0,0,0,0.4)` }}
            data-testid={`tour-step-${current.id}`}>

            {/* Category pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-6 text-[10px] font-medium"
              style={{ background: `${current.color}10`, border: `1px solid ${current.color}20`, color: current.color }}>
              {current.category}
            </div>

            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              style={{
                background: `${current.color}10`,
                border: `1px solid ${current.color}15`,
                boxShadow: `0 0 60px ${current.color}15, 0 0 120px ${current.color}08`,
              }}>
              <Icon size={36} style={{ color: current.color }} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-light mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F8FAFC' }}>
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-6 max-w-md mx-auto" style={{ color: 'rgba(248,250,252,0.8)' }}>
              {current.desc}
            </p>

            {/* Feature pills */}
            {current.features && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {current.features.map((f, i) => (
                  <span key={i} className="text-[10px] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.5)' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Try it button */}
            {current.path && (
              <button onClick={() => goToFeature(current.path)}
                data-testid={`tour-try-${current.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all hover:scale-[1.03] mb-2"
                style={{ background: `${current.color}12`, border: `1px solid ${current.color}20`, color: current.color }}>
                Try it now <ChevronRight size={12} />
              </button>
            )}
          </motion.div>

        {/* Navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-8">
          <button onClick={prev} disabled={step === 0}
            data-testid="tour-prev-btn"
            className="p-3 rounded-xl transition-all"
            style={{ background: step > 0 ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: step > 0 ? 1 : 0.2 }}>
            <ChevronLeft size={20} style={{ color: '#F8FAFC' }} />
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  background: i === step ? current.color : i < step ? `${current.color}40` : 'rgba(255,255,255,0.08)',
                }} />
            ))}
          </div>

          <button onClick={next}
            data-testid="tour-next-btn"
            className="p-3 rounded-xl transition-all hover:scale-105"
            style={{ background: `${current.color}15`, border: `1px solid ${current.color}25` }}>
            {step === total - 1 ? (
              <span className="text-xs px-2 font-medium" style={{ color: current.color }}>Begin</span>
            ) : (
              <ChevronRight size={20} style={{ color: current.color }} />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
