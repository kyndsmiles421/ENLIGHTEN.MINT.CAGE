import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Star, Wind, Timer, Sparkles, Eye, Sprout, Map, Zap, Globe } from 'lucide-react';

const WALKTHROUGH_STEPS = [
  {
    title: 'Welcome to The ENLIGHTEN.MINT.CAFE',
    description: 'Your immersive spiritual and wellness companion. Let me show you around — this will only take a moment.',
    icon: Star,
    color: '#C084FC',
    position: 'center',
  },
  {
    title: 'Your Dashboard',
    description: 'This is your home base. Track your streak, mood logs, journal entries, and get AI-personalized recommendations for your practice.',
    icon: Sparkles,
    color: '#FCD34D',
    position: 'center',
    highlight: '[data-testid="dashboard-page"]',
    nav: '/dashboard',
  },
  {
    title: 'Daily Briefing & Rituals',
    description: 'Start each day with "Today" — your personalized cosmic briefing with element energy, lunar guidance, and wisdom. "My Ritual" tracks your morning and evening practices.',
    icon: Star,
    color: '#FB923C',
    position: 'center',
    navHint: 'Today & My Ritual in the top nav',
  },
  {
    title: 'Meditation & Breathwork',
    description: 'Guided meditations, AI-generated constellation meditations themed to your zodiac, a breathing lab, and a freeform timer. Complete sessions to auto-water your Zen Garden plants.',
    icon: Timer,
    color: '#D8B4FE',
    position: 'center',
    navHint: 'Meditate & Breathe in the top nav',
  },
  {
    title: '3D Star Chart',
    description: 'Explore the cosmos in a Star Walk–style 3D sky. Tap constellations for mythology, start a guided stargazing journey, earn celestial badges, or turn on Gyro mode to point your phone at the real sky.',
    icon: Globe,
    color: '#3B82F6',
    position: 'center',
    navHint: 'Stars in the top nav',
  },
  {
    title: 'VR Cosmic Sanctuary',
    description: 'Enter an immersive 3D space with your avatar at the center. Orbit around, click portal orbs to jump to any section, or click the Meditation portal for an in-VR breathing session.',
    icon: Eye,
    color: '#6366F1',
    position: 'center',
    navHint: 'Sanctuary in the More menu',
  },
  {
    title: 'Cosmic Forecasts & Profile',
    description: 'Get daily, weekly, monthly, or yearly readings across 6 systems — Astrology, Tarot, Numerology, Cardology, Chinese & Mayan. Your Cosmic Profile tracks recurring patterns across all your readings.',
    icon: Eye,
    color: '#FDA4AF',
    position: 'center',
    navHint: 'Forecasts & Cosmic Profile in More menu',
  },
  {
    title: 'Zen Garden & Avatar',
    description: 'Grow plants in your Zen Garden — they get auto-watered when you meditate or complete challenges. Your Avatar reflects your energy state, changing visually as your wellness improves.',
    icon: Sprout,
    color: '#22C55E',
    position: 'center',
    navHint: 'Zen & Avatar in the nav',
  },
  {
    title: 'Explore Everything Else',
    description: 'The "More" menu holds 30+ tools: Oracle readings, Sage AI coach, dream journal, yoga, mudras, mantras, sound healing, frequencies, light therapy, herbology, and much more. Explore at your own pace.',
    icon: Map,
    color: '#2DD4BF',
    position: 'center',
    navHint: 'Tap ••• More in the nav bar',
  },
  {
    title: 'You\'re Ready',
    description: 'That\'s the overview! You can always revisit this from the Tutorial page in the More menu. Now go explore — the cosmos awaits.',
    icon: Zap,
    color: '#FCD34D',
    position: 'center',
    final: true,
  },
];

export default function Walkthrough({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const current = WALKTHROUGH_STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / WALKTHROUGH_STEPS.length) * 100;

  const next = useCallback(() => {
    if (step < WALKTHROUGH_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }
  }, [step, onComplete]);

  const prev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const skip = useCallback(() => {
    setVisible(false);
    setTimeout(() => onComplete?.(), 300);
  }, [onComplete]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, skip]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          data-testid="walkthrough-overlay"
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(3,3,8,0.85)', backdropFilter: 'none'}} />

          {/* Content card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-lg w-full mx-6"
          >
            <div className="rounded-2xl p-8 md:p-10" style={{ background: 'rgba(12,12,20,0.95)', border: `1px solid ${current.color}15`, boxShadow: `0 0 80px ${current.color}08` }}>
              {/* Skip button */}
              <button onClick={skip} className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                data-testid="walkthrough-skip">
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${current.color}12`, border: `1px solid ${current.color}20` }}>
                <Icon size={24} style={{ color: current.color, filter: `drop-shadow(0 0 8px ${current.color}40)` }} />
              </div>

              {/* Step indicator */}
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: current.color }}>
                Step {step + 1} of {WALKTHROUGH_STEPS.length}
              </p>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                {current.title}
              </h2>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {current.description}
              </p>

              {/* Nav hint */}
              {current.navHint && (
                <div className="px-3 py-2 rounded-lg mb-6" style={{ background: `${current.color}06`, border: `1px solid ${current.color}10` }}>
                  <p className="text-[11px]" style={{ color: `${current.color}BB` }}>
                    Find it: {current.navHint}
                  </p>
                </div>
              )}

              {/* Progress bar */}
              <div className="h-0.5 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: current.color }}
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button onClick={prev} disabled={step === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all"
                  style={{ background: step === 0 ? 'transparent' : 'rgba(255,255,255,0.03)', color: step === 0 ? 'transparent' : 'var(--text-muted)', border: `1px solid ${step === 0 ? 'transparent' : 'rgba(255,255,255,0.06)'}` }}
                  data-testid="walkthrough-prev">
                  <ChevronLeft size={12} /> Back
                </button>

                <button onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: `${current.color}15`, color: current.color, border: `1px solid ${current.color}25` }}
                  data-testid="walkthrough-next">
                  {current.final ? 'Start Exploring' : 'Next'} <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Floating stars decoration */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ background: current.color, left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.15 }}
              animate={{ y: [0, -10, 0], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
