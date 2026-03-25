import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wind, Timer, Sun, Heart, BookOpen, Headphones, ArrowRight, Sparkles, Sunrise, Zap, Leaf, Radio, Users, Flame, Hand, Triangle, Play, GraduationCap, PenTool, Volume2 } from 'lucide-react';

const FEATURES = [
  { icon: Wind, title: 'Breathing', desc: 'Guided breathwork to center your being', path: '/breathing', color: '#2DD4BF' },
  { icon: Timer, title: 'Meditation', desc: 'Timed sessions with ambient sound', path: '/meditation', color: '#D8B4FE' },
  { icon: Headphones, title: 'Soundscapes', desc: 'Layer ambient sounds into your sanctuary', path: '/soundscapes', color: '#38BDF8' },
  { icon: Radio, title: 'Frequencies', desc: 'Solfeggio & biometric healing tones', path: '/frequencies', color: '#8B5CF6' },
  { icon: Hand, title: 'Mudras', desc: 'Sacred hand gestures for healing', path: '/mudras', color: '#FDA4AF' },
  { icon: Triangle, title: 'Yantras', desc: 'Sacred geometric meditation diagrams', path: '/yantra', color: '#EF4444' },
  { icon: Flame, title: 'Tantra', desc: 'Expand consciousness through energy work', path: '/tantra', color: '#FCD34D' },
  { icon: Sparkles, title: 'Oracle', desc: 'Tarot, I Ching, astrology & divination', path: '/oracle', color: '#E879F9' },
  { icon: PenTool, title: 'Create', desc: 'Write your own meditations & affirmations', path: '/create', color: '#E879F9' },
  { icon: Zap, title: 'Exercises', desc: 'Qigong & Tai Chi energy cultivation', path: '/exercises', color: '#FB923C' },
  { icon: Sunrise, title: 'Daily Rituals', desc: 'Build your personalized daily practice', path: '/rituals', color: '#FCD34D' },
  { icon: Sun, title: 'Affirmations', desc: 'AI-powered mantras for your soul', path: '/affirmations', color: '#93C5FD' },
  { icon: Heart, title: 'Mood Tracker', desc: 'Map your emotional landscape', path: '/mood', color: '#F87171' },
  { icon: BookOpen, title: 'Journal', desc: 'Sacred space for your thoughts', path: '/journal', color: '#86EFAC' },
  { icon: Users, title: 'Community', desc: 'Share, connect, and inspire others', path: '/community', color: '#FDA4AF' },
  { icon: Play, title: 'Videos', desc: 'Guided practices from masters', path: '/videos', color: '#2DD4BF' },
  { icon: GraduationCap, title: 'Classes', desc: 'Structured courses with certifications', path: '/classes', color: '#FCD34D' },
  { icon: Leaf, title: 'Nourishment', desc: 'Foods that uplift energy & spirit', path: '/nourishment', color: '#22C55E' },
];

function FeatureCard({ feature, index }) {
  const navigate = useNavigate();
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onClick={() => navigate(feature.path)}
      className="glass-card glass-card-hover p-7 cursor-pointer group"
      data-testid={`feature-card-${feature.title.toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${feature.color}12`,
            boxShadow: `0 0 0 rgba(0,0,0,0)`,
          }}>
          <Icon size={20} style={{ color: feature.color, transition: 'filter 0.3s', filter: 'drop-shadow(0 0 0 transparent)' }}
            className="group-hover:drop-shadow-lg" />
        </div>
        <ArrowRight size={16} className="transition-all duration-300"
          style={{ color: 'rgba(255,255,255,0.1)' }}
        />
      </div>
      <h3 className="text-lg font-normal mb-1.5 transition-all duration-300"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [breathScale, setBreathScale] = useState(1);
  const animRef = useRef(null);

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
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      {/* Aurora gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full animate-aurora"
          style={{
            background: 'radial-gradient(ellipse, rgba(192,132,252,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(45,212,191,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'aurora 12s ease-in-out infinite reverse',
          }} />
      </div>

      {/* Hero */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold uppercase tracking-[0.3em] mb-6"
              style={{ color: 'var(--secondary)' }}
            >
              <Sparkles size={14} className="inline mr-2" style={{ color: 'var(--accent-gold)' }} />
              A Gathering Place for Conscious Minds
            </motion.p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                The Cosmic
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="block animate-text-shimmer"
                style={{ lineHeight: 1.2 }}
              >
                Collective
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-base md:text-lg leading-relaxed max-w-md mb-10"
              style={{ color: 'var(--text-secondary)' }}
            >
              A sacred digital space for breathing, meditation, journaling, sound healing, and expanding your awareness alongside like-minded souls.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => navigate('/breathing')}
                className="btn-glass glow-primary group"
                data-testid="begin-journey-btn"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Begin Your Journey
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="btn-glass"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }}
                data-testid="sign-in-btn"
              >
                Sign In
              </button>
            </motion.div>

            {/* Audio hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-2 mt-8"
            >
              <Volume2 size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Enable ambient sound for the full experience
              </span>
            </motion.div>
          </motion.div>

          {/* Breathing orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {/* Outer ring particles */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 48;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      background: i % 3 === 0 ? '#D8B4FE' : i % 3 === 1 ? '#2DD4BF' : '#FCD34D',
                      left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                      top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                    }}
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 3 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                );
              })}

              {/* Glow rings */}
              {[0.3, 0.5, 0.7, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${60 + i * 20}%`,
                    height: `${60 + i * 20}%`,
                    background: `radial-gradient(circle, rgba(192,132,252,${opacity * 0.12}) 0%, transparent 70%)`,
                    border: `1px solid rgba(192,132,252,${opacity * 0.08})`,
                    transform: `scale(${breathScale * (0.9 + i * 0.05)})`,
                    transition: 'transform 0.1s linear',
                  }}
                />
              ))}

              {/* Core orb */}
              <div
                className="relative z-10 w-20 h-20 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(192,132,252,0.7) 0%, rgba(192,132,252,0.15) 60%, transparent 100%)',
                  boxShadow: `0 0 ${40 + breathScale * 30}px rgba(192,132,252,${0.2 + breathScale * 0.15}), 0 0 ${80 + breathScale * 40}px rgba(192,132,252,0.08)`,
                  transform: `scale(${breathScale})`,
                  transition: 'transform 0.1s linear',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.3em] mb-12"
            style={{ color: 'var(--text-muted)' }}
          >
            Explore Your Path
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
