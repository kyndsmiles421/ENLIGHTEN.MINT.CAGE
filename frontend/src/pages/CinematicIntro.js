import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mountain, Droplets, Flame, Wind, Sparkles,
  ChevronRight, Play, ArrowRight, Crown, Gem,
  Eye, Zap, ShoppingBag, Star, MapPin, Globe,
  Shield, Swords, Music, Brain, Heart, Lock, Unlock
} from 'lucide-react';

const LEVELS = [
  {
    level: 1, name: 'Physical', subtitle: 'The Grit', element: 'Earth',
    color: '#D97706', bg: 'rgba(217,119,6,0.04)',
    gradient: 'linear-gradient(135deg, #1a0f00 0%, #2d1600 50%, #0d0e1a 100%)',
    icon: Mountain,
    desc: 'Ground yourself in the physical realm. Master basic RPG mechanics and survival resource gathering.',
    features: ['RPG Quests', 'Resource Gathering', 'Basic Forge'],
    showcase: [
      { label: 'Rock Hounding', desc: 'Find and collect raw gems in the wild', icon: Gem, color: '#D97706' },
      { label: 'RPG Battles', desc: 'Fight NPC rivals and bosses for XP', icon: Swords, color: '#EF4444' },
      { label: 'Daily Quests', desc: 'Complete challenges to level up', icon: Star, color: '#FBBF24' },
    ],
  },
  {
    level: 2, name: 'Emotional', subtitle: 'The Flow', element: 'Water',
    color: '#F472B6', secondary: '#2DD4BF', bg: 'rgba(244,114,182,0.04)',
    gradient: 'linear-gradient(135deg, #1a0014 0%, #001a1a 50%, #0d0e1a 100%)',
    icon: Droplets,
    desc: 'Open the emotional channels. Unlock the Social Hub and mood-resonance tracking.',
    features: ['Social Hub', 'Mood Tracking', 'Community'],
    showcase: [
      { label: 'Dream Realms', desc: 'Explore cosmic dreamscapes and log visions', icon: Eye, color: '#F472B6' },
      { label: 'Living Journal', desc: 'AI-powered journaling that responds to you', icon: Brain, color: '#2DD4BF' },
      { label: 'Mood Tracker', desc: 'Map your emotional tides across time', icon: Heart, color: '#FB7185' },
    ],
  },
  {
    level: 3, name: 'Mental', subtitle: 'The Logic', element: 'Fire',
    color: '#94A3B8', secondary: '#3B82F6', bg: 'rgba(148,163,184,0.04)',
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0d0e1a 100%)',
    icon: Flame,
    desc: 'Sharpen the mind. Unlock the AI Forge for tool and skill customization.',
    features: ['AI Forge', 'Trade Circle', 'Content Broker'],
    showcase: [
      { label: 'Cosmic Forge', desc: 'AI-generate custom tools, lenses, and skills', icon: Zap, color: '#94A3B8' },
      { label: 'Trade Circle', desc: 'Barter goods and services with the collective', icon: ShoppingBag, color: '#C084FC' },
      { label: 'Energy Gates', desc: 'Unlock dimensional gateways with polished gems', icon: Lock, color: '#D97706' },
    ],
  },
  {
    level: 4, name: 'Intuitive', subtitle: 'The Frequency', element: 'Air',
    color: '#8B5CF6', secondary: '#6366F1', bg: 'rgba(139,92,246,0.04)',
    gradient: 'linear-gradient(135deg, #0f0520 0%, #1a0a30 50%, #0d0e1a 100%)',
    icon: Wind,
    desc: 'Tune into the unseen. Predictive wellness and 8D Solfeggio audio unlock.',
    features: ['Predictive Wellness', '8D Audio', 'Skill Generator'],
    showcase: [
      { label: 'Cosmic Mixer', desc: '8D Solfeggio frequencies and ambient soundscapes', icon: Music, color: '#8B5CF6' },
      { label: 'GPS Hotspots', desc: 'Sacred sites and dynamic energy nodes in the real world', icon: MapPin, color: '#2DD4BF' },
      { label: 'Refinement Lab', desc: 'Polish raw gems into powerful gate materials', icon: Gem, color: '#F472B6' },
    ],
  },
  {
    level: 5, name: 'Pure Consciousness', subtitle: 'The Source', element: 'Ether',
    color: '#FBBF24', secondary: '#FFFBEB', bg: 'rgba(251,191,36,0.04)',
    gradient: 'linear-gradient(135deg, #1a1500 0%, #2d2200 30%, #FFFBEB08 100%)',
    icon: Sparkles,
    desc: 'Become the source. Master content creation, God Mode analytics, and Founding Architect trade status.',
    features: ['God Mode', 'Genesis Minting', 'Master Creation'],
    showcase: [
      { label: 'God Mode', desc: 'Real-time economy feeds and system analytics', icon: Crown, color: '#FBBF24' },
      { label: 'Genesis Mint', desc: 'Create a 1-of-1 legendary item as a Founding Architect', icon: Star, color: '#FBBF24' },
      { label: 'Gate of Source', desc: 'The final Ether Gate — become the cosmos itself', icon: Unlock, color: '#FFFBEB' },
    ],
  },
];

function FeatureShowcase({ features, color, active }) {
  if (!features || !active) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.6 }}
      className="grid grid-cols-3 gap-3 mt-6 max-w-lg mx-auto"
    >
      {features.map((f, i) => {
        const FIcon = f.icon;
        return (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.0 + i * 0.15, duration: 0.5 }}
            className="rounded-xl p-3 text-center relative overflow-hidden group"
            style={{
              background: `${f.color}08`,
              border: `1px solid ${f.color}18`,
            }}
          >
            {/* Glow pulse */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
              style={{ background: `radial-gradient(circle, ${f.color}15, transparent 70%)` }}
            />
            <FIcon size={18} className="mx-auto mb-2 relative z-10" style={{ color: f.color }} />
            <p className="text-[10px] font-medium relative z-10" style={{ color: f.color }}>
              {f.label}
            </p>
            <p className="text-[8px] mt-0.5 leading-relaxed relative z-10" style={{ color: 'rgba(248,250,252,0.5)' }}>
              {f.desc}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function LevelScene({ level, direction }) {
  const Icon = level.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'forward' ? 80 : -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'forward' ? -80 : 80 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 overflow-y-auto"
      style={{ background: level.gradient }}
      data-testid={`cinematic-level-${level.level}`}
    >
      {/* Aura background effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(circle at 50% 40%, ${level.color}08 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 40%, ${level.color}14 0%, transparent 60%)`,
            `radial-gradient(circle at 50% 40%, ${level.color}08 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles for Level 5 */}
      {level.level === 5 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ background: '#FBBF24', left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 text-center max-w-lg">
        {/* Level indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-3"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold px-3 py-1 rounded-full"
            style={{ background: `${level.color}12`, color: level.color, border: `1px solid ${level.color}25` }}>
            Level {level.level} — {level.element}
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{
            background: `radial-gradient(circle, ${level.color}15 0%, transparent 70%)`,
            boxShadow: `0 0 60px ${level.color}20, inset 0 0 30px ${level.color}10`,
            border: `2px solid ${level.color}30`,
          }}
        >
          <Icon size={28} style={{ color: level.color }} />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-light mb-1"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: level.color }}
        >
          {level.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm mb-2 italic"
          style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}
        >
          {level.subtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xs leading-relaxed mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {level.desc}
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {level.features.map((f, i) => (
            <motion.span
              key={f}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-[10px] px-2.5 py-1 rounded-full"
              style={{ background: `${level.color}10`, color: level.color, border: `1px solid ${level.color}20` }}
            >
              {f}
            </motion.span>
          ))}
        </motion.div>

        {/* Gameplay showcase cards */}
        <FeatureShowcase features={level.showcase} color={level.color} active={true} />
      </div>
    </motion.div>
  );
}

export default function CinematicIntro() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [direction, setDirection] = useState('forward');
  const [showCTA, setShowCTA] = useState(false);

  // Auto-advance through levels (6 seconds per level to accommodate showcase cards)
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentLevel(prev => {
        if (prev >= 4) {
          setAutoPlay(false);
          setShowCTA(true);
          return 4;
        }
        setDirection('forward');
        return prev + 1;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const goToLevel = (idx) => {
    setDirection(idx > currentLevel ? 'forward' : 'backward');
    setCurrentLevel(idx);
    setAutoPlay(false);
    if (idx === 4) setShowCTA(true);
  };

  const level = LEVELS[currentLevel];

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0d0e1a', zIndex: 9999, width: '100vw', height: '100vh', top: 0, left: 0 }} data-testid="cinematic-intro">
      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => navigate('/auth')}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-full text-[10px] font-medium"
        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
        data-testid="skip-intro-btn"
      >
        Skip
      </motion.button>

      {/* Level scenes */}
      <AnimatePresence mode="wait">
        <LevelScene key={currentLevel} level={LEVELS[currentLevel]} direction={direction} />
      </AnimatePresence>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-6" style={{ background: 'linear-gradient(transparent, rgba(13,14,26,0.9))' }}>
        {/* Level dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {LEVELS.map((lvl, idx) => (
            <button
              key={idx}
              onClick={() => goToLevel(idx)}
              className="transition-all duration-300"
              style={{
                width: idx === currentLevel ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: idx <= currentLevel ? lvl.color : 'rgba(255,255,255,0.1)',
              }}
              data-testid={`level-dot-${idx}`}
            />
          ))}
        </div>

        {/* CTA or Next button */}
        <AnimatePresence mode="wait">
          {showCTA ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth?trial=true')}
                className="px-8 py-3 rounded-full text-sm font-semibold mx-auto flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))',
                  color: '#FBBF24',
                  border: '1px solid rgba(251,191,36,0.3)',
                  boxShadow: '0 0 30px rgba(251,191,36,0.1)',
                }}
                data-testid="start-trial-btn"
              >
                <Play size={14} />
                Start 7-Day Free Ultra Trial
                <ArrowRight size={14} />
              </motion.button>
              <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                Experience all 5 levels of consciousness. No credit card required.
              </p>
            </motion.div>
          ) : (
            <motion.button
              key="next"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => goToLevel(Math.min(currentLevel + 1, 4))}
              className="mx-auto flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium"
              style={{
                background: `${level.color}12`,
                color: level.color,
                border: `1px solid ${level.color}20`,
              }}
              data-testid="next-level-btn"
            >
              Next: {LEVELS[Math.min(currentLevel + 1, 4)].name}
              <ChevronRight size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
