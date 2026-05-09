import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronRight, ChevronLeft, X, Play, Sun, Flame, Eye, Leaf,
  Heart, Compass, Star, BookOpen, Music, Sparkles, Globe, Brain,
  Waves, Trophy, Loader2, Volume2, VolumeX
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const TOUR_STEPS = [
  {
    id: 'welcome', title: 'Welcome to The ENLIGHTEN.MINT.CAFE',
    desc: 'Your immersive portal to spiritual wellness, ancient wisdom, and cosmic discovery. Let us show you everything this platform has to offer.',
    icon: Sparkles, color: '#D8B4FE', category: 'Introduction',
    bg: 'radial-gradient(ellipse at 30% 40%, rgba(216,180,254,0.15) 0%, transparent 60%)',
  },
  {
    id: 'today', title: 'Today — Your Daily Sanctuary',
    desc: 'Start each day with a personalized briefing, mood check-ins, custom rituals, and cosmic calendar alignments.',
    icon: Sun, color: '#FCD34D', category: 'Pillar 1', path: '/daily-briefing',
    bg: 'radial-gradient(ellipse at 30% 40%, rgba(252,211,77,0.12) 0%, transparent 60%)',
    features: ['Daily Briefing', 'Mood Tracking', 'Growth Timeline', 'Soul Reports'],
  },
  {
    id: 'practice', title: 'Practice — Sacred Techniques',
    desc: 'Explore breathing, meditation, yoga, mudras, mantras, affirmations, and ancient healing practices.',
    icon: Flame, color: '#2DD4BF', category: 'Pillar 2', path: '/breathing',
    bg: 'radial-gradient(ellipse at 70% 30%, rgba(45,212,191,0.12) 0%, transparent 60%)',
    features: ['Breathing', 'Meditation', 'Yoga', 'Mantras', 'Mudras'],
  },
  {
    id: 'divination', title: 'Divination — Cosmic Guidance',
    desc: 'Oracles, tarot, a 3D star chart with 8 world sky traditions, numerology, dream journaling, and the Akashic Records.',
    icon: Eye, color: '#E879F9', category: 'Pillar 3', path: '/oracle',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(232,121,249,0.12) 0%, transparent 60%)',
    features: ['Oracle & Tarot', '3D Star Chart', 'Akashic Records', 'Dream Journal'],
  },
  {
    id: 'sanctuary', title: 'Sanctuary — Rest & Restore',
    desc: 'Soundscapes, resonant frequencies, music lounge, Zen garden, journal, and the Cosmic Mixer for layered experiences.',
    icon: Leaf, color: '#86EFAC', category: 'Pillar 4', path: '/soundscapes',
    bg: 'radial-gradient(ellipse at 40% 60%, rgba(134,239,172,0.12) 0%, transparent 60%)',
    features: ['Soundscapes', 'Music Lounge', 'Frequencies', 'Cosmic Mixer'],
  },
  {
    id: 'nourish', title: 'Nourish — Mind, Body & Spirit',
    desc: 'Herbology, aromatherapy, sacred nourishment, and Reiki healing — feed your body as intentionally as your soul.',
    icon: Heart, color: '#FDA4AF', category: 'Pillar 5', path: '/nourishment',
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(253,164,175,0.12) 0%, transparent 60%)',
    features: ['Herbology', 'Aromatherapy', 'Nourishment', 'Reiki'],
  },
  {
    id: 'explore', title: 'Explore — Infinite Discovery',
    desc: 'Sacred Encyclopedia, 24 sacred texts, creation stories, crystals, community, and quantum meditations.',
    icon: Compass, color: '#FB923C', category: 'Pillar 6', path: '/encyclopedia',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(251,146,60,0.12) 0%, transparent 60%)',
    features: ['Encyclopedia', 'Reading List', 'Crystals', 'Community'],
  },
  {
    id: 'starchart', title: '3D Star Chart — World Skies',
    desc: 'Interactive 3D constellation map with 8 cultural sky traditions, 15,000 stars, Milky Way, and gaming-level bloom effects.',
    icon: Star, color: '#818CF8', category: 'Spotlight', path: '/star-chart',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(129,140,248,0.14) 0%, transparent 60%)',
  },
  {
    id: 'akashic', title: 'Akashic Records — Your Soul\'s Library',
    desc: 'A guided AI experience through 6 gateways — Soul Purpose, Past Lives, Karmic Patterns, and more.',
    icon: BookOpen, color: '#D8B4FE', category: 'Spotlight', path: '/akashic-records',
    bg: 'radial-gradient(ellipse at 30% 50%, rgba(216,180,254,0.14) 0%, transparent 60%)',
  },
  {
    id: 'mixer', title: 'Cosmic Mixer — Layer Your Experience',
    desc: 'Combine resonant frequencies, ambient sounds, sacred mantras, color light therapy, and vibration — all at once.',
    icon: Waves, color: '#A855F7', category: 'Spotlight',
    bg: 'radial-gradient(ellipse at 60% 50%, rgba(168,85,247,0.14) 0%, transparent 60%)',
  },
  {
    id: 'ai', title: 'AI-Powered Throughout',
    desc: 'Spiritual AI coach, natural TTS voices, AI deep dives, personalized recommendations, and monthly Soul Reports.',
    icon: Brain, color: '#38BDF8', category: 'Technology',
    bg: 'radial-gradient(ellipse at 40% 40%, rgba(56,189,248,0.12) 0%, transparent 60%)',
  },
  {
    // V1.0.10 — Ritual Forge / Omni-Agent tour step. Surfaces the
    // Wand pill so new users discover it instead of bouncing past
    // the most powerful global feature.
    id: 'ritual_forge',
    title: 'Ritual Forge — The Omni-Agent',
    desc: 'Tap the wand pill in the top-right corner from any page. Type what you want — "Ground me, breathe deep, capture one insight" — and Sage compiles a 2–6 step ritual that runs automatically. A progress chip stays in the corner so you can skip or end from anywhere.',
    icon: Sparkles, color: '#A78BFA', category: 'Spotlight',
    bg: 'radial-gradient(ellipse at 70% 30%, rgba(167,139,250,0.16) 0%, transparent 60%)',
    features: ['Natural-language intent', 'Background runner', 'One-tap recall', 'Calm-mode aware'],
  },
  {
    id: 'finish', title: 'Your Journey Begins Now',
    desc: 'The ENLIGHTEN.MINT.CAFE evolves with you. Explore at your own pace — there\'s always something new to discover.',
    icon: Sparkles, color: '#D8B4FE', category: 'Begin',
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(216,180,254,0.18) 0%, rgba(129,140,248,0.06) 50%, transparent 80%)',
  },
];

/* ═══════════════════════════════════════════════
   VIDEO INTRO PHASE
   ═══════════════════════════════════════════════ */

function VideoIntro({ onComplete, onSkip }) {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setMuted(next);
      if (!next && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`${API}/api/ai-visuals/intro-video`);
        if (res.data.status === 'ready' && res.data.video_url) {
          setVideoUrl(res.data.video_url);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchVideo();
  }, []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [error, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[350] flex flex-col items-center justify-center"
      style={{ background: 'transparent' }}
      data-testid="tour-video-phase"
    >
      {loading && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="animate-spin" style={{ color: '#D8B4FE' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>
            Preparing your cosmic journey...
          </p>
        </div>
      )}

      {videoUrl && !loading && (
        <>
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el) el.muted = muted;
            }}
            src={videoUrl}
            autoPlay
            playsInline
            onEnded={onComplete}
            className="w-full h-full object-cover"
            style={{ maxHeight: '100vh' }}
            data-testid="tour-video-element"
          />
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            data-testid="tour-video-mute-toggle"
            className="absolute bottom-8 left-8 p-2.5 rounded-lg transition-all hover:scale-110 z-10"
            style={{ background: 'transparent', backdropFilter: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
            {muted
              ? <VolumeX size={16} style={{ color: '#F8FAFC' }} />
              : <Volume2 size={16} style={{ color: '#D8B4FE' }} />
            }
          </button>
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute bottom-8 right-8 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'none',
            }}
            data-testid="tour-video-skip"
          >
            Skip to Tour <ChevronRight size={12} className="inline ml-1" />
          </button>
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-6 right-6 p-2 rounded-xl transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.85)' }}
            data-testid="tour-video-close"
          >
            <X size={20} />
          </button>
        </>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   GUIDED CARD WALKTHROUGH PHASE
   ═══════════════════════════════════════════════ */

function CardWalkthrough({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = TOUR_STEPS[step];
  const total = TOUR_STEPS.length;
  const progress = ((step + 1) / total) * 100;
  const touchStart = useRef(null);

  const next = useCallback(() => {
    if (step < total - 1) setStep(s => s + 1);
    else { onFinish?.(); onClose(); }
  }, [step, total, onClose, onFinish]);

  const prev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const goToFeature = (path) => { onClose(); navigate(path); };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, onClose]);

  // Swipe gesture for mobile
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff < -50) next();
    else if (diff > 50) prev();
    touchStart.current = null;
  };

  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[350]"
      style={{ background: '#0B0C15', touchAction: 'pan-y', overscrollBehavior: 'none' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      data-testid="guided-tour-overlay"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: current.bg, transition: 'background 0.6s ease' }} />

      {/* Close */}
      <button onClick={onClose} data-testid="tour-close-btn"
        className="absolute top-6 right-6 p-2 rounded-xl z-20 transition-all hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.9)' }}>
        <X size={20} />
      </button>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
          className="h-full" style={{ background: `linear-gradient(90deg, ${current.color}, ${current.color}80)` }} />
      </div>

      {/* Step counter */}
      <div className="absolute top-6 left-6 text-[10px] font-medium z-20" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {step + 1} / {total}
      </div>

      {/* Center card — absolutely positioned, no scroll */}
      <div className="absolute inset-0 flex items-center justify-center px-4 z-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md px-8 py-10 sm:px-10 sm:py-12 text-center rounded-2xl"
          style={{
            background: 'rgba(20,22,45,0.98)',
            border: `1px solid ${current.color}18`,
            boxShadow: `0 0 80px ${current.color}08, 0 24px 60px rgba(0,0,0,0.1)`,
          }}
          data-testid={`tour-step-${current.id}`}
        >
          {/* Category */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-[10px] font-medium"
            style={{ background: `${current.color}10`, border: `1px solid ${current.color}20`, color: current.color }}>
            {current.category}
          </div>

          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: `${current.color}10`, border: `1px solid ${current.color}15`, boxShadow: `0 0 50px ${current.color}12` }}>
            <Icon size={30} style={{ color: current.color }} />
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-light mb-3"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F8FAFC' }}>
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {current.desc}
          </p>

          {/* Feature pills */}
          {current.features && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-5">
              {current.features.map((f, i) => (
                <span key={i} className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}>
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Try it button */}
          {current.path && (
            <button onClick={() => goToFeature(current.path)}
              data-testid={`tour-try-${current.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all hover:scale-[1.03]"
              style={{ background: `${current.color}12`, border: `1px solid ${current.color}20`, color: current.color }}>
              Try it now <ChevronRight size={12} />
            </button>
          )}
        </motion.div>
      </div>

      {/* Navigation — fixed at bottom */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 px-6 z-20">
        <button onClick={prev} disabled={step === 0}
          data-testid="tour-prev-btn"
          className="p-2.5 sm:p-3 rounded-xl transition-all"
          style={{ background: step > 0 ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: step > 0 ? 1 : 0.2 }}>
          <ChevronLeft size={18} style={{ color: '#F8FAFC' }} />
        </button>

        <div className="flex gap-1">
          {TOUR_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 16 : 5,
                height: 5,
                background: i === step ? current.color : i < step ? `${current.color}40` : 'rgba(255,255,255,0.08)',
              }} />
          ))}
        </div>

        <button onClick={next}
          data-testid="tour-next-btn"
          className="p-2.5 sm:p-3 rounded-xl transition-all hover:scale-105"
          style={{ background: `${current.color}15`, border: `1px solid ${current.color}25` }}>
          {step === total - 1 ? (
            <span className="text-xs px-2 font-medium" style={{ color: current.color }}>Begin</span>
          ) : (
            <ChevronRight size={18} style={{ color: current.color }} />
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN GUIDED TOUR — VIDEO FIRST, THEN CARDS
   ═══════════════════════════════════════════════ */

export default function GuidedTour({ isOpen, onClose, onFinish }) {
  // Skip video phase entirely — go straight to card walkthrough
  // The Sora 2 video is available separately on the landing page
  // Video autoplay is unreliable across browsers/mobile and was causing
  // users to get stuck on a black screen

  // Lock body scroll while tour is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    localStorage.setItem('zen_tour_seen', '1');
    onClose();
  };
  const handleFinish = () => {
    localStorage.setItem('zen_tour_seen', '1');
    onFinish?.();
  };

  return createPortal(
    <CardWalkthrough
      onClose={handleClose}
      onFinish={handleFinish}
    />,
    document.body
  );
}
