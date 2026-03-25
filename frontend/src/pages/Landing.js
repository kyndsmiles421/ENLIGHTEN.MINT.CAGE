import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wind, Timer, Sun, Heart, BookOpen, Headphones, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Wind, title: 'Breathing', desc: 'Guided breathwork to center your being', path: '/breathing', color: '#2DD4BF' },
  { icon: Timer, title: 'Meditation', desc: 'Timed sessions for deeper awareness', path: '/meditation', color: '#D8B4FE' },
  { icon: Sun, title: 'Affirmations', desc: 'AI-powered mantras for your soul', path: '/affirmations', color: '#FCD34D' },
  { icon: Heart, title: 'Mood Tracker', desc: 'Map your emotional landscape', path: '/mood', color: '#FDA4AF' },
  { icon: BookOpen, title: 'Journal', desc: 'Sacred space for your thoughts', path: '/journal', color: '#86EFAC' },
  { icon: Headphones, title: 'Soundscapes', desc: 'Immersive ambient environments', path: '/soundscapes', color: '#93C5FD' },
];

function Star({ style }) {
  return <div className="absolute rounded-full bg-white" style={style} />;
}

function StarField() {
  const [stars] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.6 + 0.1,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <Star key={i} style={s} />
      ))}
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const navigate = useNavigate();
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
      onClick={() => navigate(feature.path)}
      className="glass-card glass-card-hover p-8 cursor-pointer group"
      data-testid={`feature-card-${feature.title.toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${feature.color}15` }}>
          <Icon size={22} style={{ color: feature.color }} />
        </div>
        <ArrowRight size={18} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1" style={{ transition: 'color 0.3s, transform 0.3s' }} />
      </div>
      <h3 className="text-xl font-normal mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{feature.title}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
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
    <div className="min-h-screen relative" style={{ background: 'var(--bg-default)' }}>
      <StarField />

      {/* Hero */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-6" style={{ color: 'var(--secondary)' }}>
              <Sparkles size={14} className="inline mr-2" style={{ color: 'var(--accent-gold)' }} />
              Your Daily Sanctuary
            </p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Elevate Your
              <span className="block text-glow" style={{ color: 'var(--primary)' }}> Consciousness</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-md mb-10" style={{ color: 'var(--text-secondary)' }}>
              A sacred digital space for breathing, meditation, journaling, and expanding your awareness. Let the cosmos guide your inner journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/breathing')}
                className="btn-glass glow-primary"
                data-testid="begin-journey-btn"
              >
                Begin Your Journey
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="btn-glass"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}
                data-testid="sign-in-btn"
              >
                Sign In
              </button>
            </div>
          </motion.div>

          {/* Breathing orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {[0.3, 0.5, 0.7, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${60 + i * 20}%`,
                    height: `${60 + i * 20}%`,
                    background: `radial-gradient(circle, rgba(192,132,252,${opacity * 0.15}) 0%, transparent 70%)`,
                    border: `1px solid rgba(192,132,252,${opacity * 0.1})`,
                    transform: `scale(${breathScale * (0.9 + i * 0.05)})`,
                    transition: 'transform 0.1s linear',
                  }}
                />
              ))}
              <div
                className="relative z-10 w-20 h-20 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(192,132,252,0.6) 0%, rgba(192,132,252,0.1) 70%)',
                  boxShadow: '0 0 60px rgba(192,132,252,0.3)',
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
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs font-bold uppercase tracking-[0.25em] mb-12"
            style={{ color: 'var(--text-muted)' }}
          >
            Explore Your Path
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
