import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star, Wind, Timer, Sparkles, Eye, Sprout, Map, Zap, Globe, Heart,
  Sun, BookOpen, Headphones, Radio, Lightbulb, Hand, Flame, Moon,
  Compass, Leaf, Droplets, Music, HeartHandshake, MessageCircle,
  Trophy, Users, GraduationCap, Gamepad2, BarChart3, Calendar,
  Target, Play, ChevronRight, Layers, Hash, CreditCard, ArrowRight,
} from 'lucide-react';
import Walkthrough from '../components/Walkthrough';

const SECTIONS = [
  {
    title: 'Getting Started',
    color: '#FCD34D',
    items: [
      { icon: Star, label: 'Dashboard', path: '/dashboard', desc: 'Your home base. View streaks, mood logs, journal entries, daily challenges, and AI-personalized recommendations.' },
      { icon: Sun, label: 'Daily Briefing', path: '/daily-briefing', desc: 'Start each day with your cosmic weather — element energy, lunar phase, planetary influences, and personalized wisdom.' },
      { icon: Sparkles, label: 'Daily Ritual', path: '/daily-ritual', desc: 'Morning and evening practice tracker. Build consistency with guided ritual sequences and completion tracking.' },
    ],
  },
  {
    title: 'Meditation & Breathwork',
    color: '#C084FC',
    items: [
      { icon: Timer, label: 'Meditate', path: '/meditation', desc: '4 modes: Guided sessions, AI Constellation Meditations themed to your zodiac, Build Your Own with AI, and freeform Timer. Completing sessions auto-waters your Zen Garden plants.' },
      { icon: Wind, label: 'Breathwork', path: '/breathing', desc: 'Box breathing, pranayama, 4-7-8 technique, and custom patterns. Visual breath guides with haptic-style timing.' },
      { icon: Headphones, label: 'Soundscapes', path: '/soundscapes', desc: 'Ambient environments — rain, ocean, forest, temple bells, cosmic drone. Layer multiple sounds for custom mixes.' },
      { icon: Radio, label: 'Frequencies', path: '/frequencies', desc: 'Solfeggio frequencies (396-963 Hz), binaural beats, and planetary frequencies. Each with healing descriptions.' },
    ],
  },
  {
    title: 'The Cosmos',
    color: '#3B82F6',
    items: [
      { icon: Globe, label: '3D Star Chart', path: '/star-chart', desc: 'Star Walk–style 3D sky with 16+ constellations. Tap for mythology, start Stargazing Journeys with TTS narration, earn Celestial Badges. Turn on Gyro mode on mobile to point your phone at the sky.' },
      { icon: Eye, label: 'VR Sanctuary', path: '/vr', desc: 'Full-screen 3D space with your avatar at center. Orbit around, click portal orbs to navigate, or click the Meditation portal for an in-VR breathing session with pulsing aura.' },
      { icon: Calendar, label: 'Cosmic Calendar', path: '/cosmic-calendar', desc: 'Track planetary events, eclipses, retrogrades, and auspicious dates. Never miss a cosmic moment.' },
    ],
  },
  {
    title: 'Divination & Prophecy',
    color: '#FDA4AF',
    items: [
      { icon: Eye, label: 'Forecasts', path: '/forecasts', desc: 'AI-powered Daily, Weekly, Monthly, and Yearly forecasts across 6 systems: Astrology, Tarot, Numerology, Cardology, Chinese Astrology, and Mayan Astrology. Smart caching so you get fresh readings each period.' },
      { icon: Sparkles, label: 'Oracle', path: '/oracle', desc: 'Three divination systems: I Ching hexagrams, Tarot card spreads, and Norse Rune castings. Each with AI-interpreted readings.' },
      { icon: BarChart3, label: 'Cosmic Profile', path: '/cosmic-profile', desc: 'Your cosmic fingerprint — tracks recurring lucky numbers, crystals, elements, energy patterns, and favorite constellations across all your readings.' },
      { icon: CreditCard, label: 'Cardology', path: '/cardology', desc: 'Playing card destiny system based on your birth date. Discover your birth card and yearly spreads.' },
      { icon: Star, label: 'Numerology', path: '/numerology', desc: 'Life path numbers, expression numbers, and personal year calculations from your birth date.' },
      { icon: Compass, label: 'Mayan Astrology', path: '/mayan', desc: 'Tzolkin calendar day signs, tone numbers, and galactic energy. Discover your Mayan birth sign.' },
    ],
  },
  {
    title: 'Body & Energy',
    color: '#22C55E',
    items: [
      { icon: Flame, label: 'Yoga', path: '/yoga', desc: 'Yoga pose library with alignment cues, benefits, and practice sequences.' },
      { icon: Zap, label: 'Exercises', path: '/exercises', desc: '6 Qigong and Tai Chi practices with step-by-step instructions and energy cultivation techniques.' },
      { icon: Hand, label: 'Mudras', path: '/mudras', desc: '25 sacred hand gestures with images, videos, guided practice timers, and healing properties.' },
      { icon: Target, label: 'Acupressure', path: '/acupressure', desc: 'Pressure point maps for common ailments — headaches, stress, digestion, sleep. With visual guides.' },
      { icon: Eye, label: 'Reiki & Aura', path: '/reiki', desc: 'Energy healing positions, aura reading, and chakra balancing guides.' },
      { icon: Lightbulb, label: 'Light Therapy', path: '/light-therapy', desc: 'Color frequency healing sessions. Each color targets different chakras and emotional states.' },
    ],
  },
  {
    title: 'Mind & Spirit',
    color: '#FB923C',
    items: [
      { icon: MessageCircle, label: 'Sage AI Coach', path: '/coach', desc: 'Your personal AI spiritual companion. Ask anything — life guidance, dream interpretation, relationship advice, spiritual questions. Remembers your conversation history.' },
      { icon: Moon, label: 'Dream Journal', path: '/dreams', desc: 'Log dreams with AI analysis. Tracks symbols, themes, lucidity, and moon phase correlations over time.' },
      { icon: BookOpen, label: 'Teachings', path: '/teachings', desc: 'Sacred texts and spiritual teachings from multiple traditions. Deep dive with AI explanations.' },
      { icon: Music, label: 'Mantras', path: '/mantras', desc: 'Sacred chants and mantras with meanings, pronunciation guides, and repetition timers.' },
      { icon: HeartHandshake, label: "Ho'oponopono", path: '/hooponopono', desc: 'Hawaiian forgiveness practice. Guided sessions for releasing guilt, anger, and restoring inner peace.' },
      { icon: Map, label: 'Journey', path: '/journey', desc: 'Your spiritual journey map. Track milestones, breakthroughs, and growth across all practices.' },
    ],
  },
  {
    title: 'Nature & Healing',
    color: '#2DD4BF',
    items: [
      { icon: Sprout, label: 'Zen Garden', path: '/zen-garden', desc: '5 tabs: Plant Garden (grow sacred plants auto-watered by your practice), Koi Pond, Sand Drawing, Lantern Release, and Rain Scene.' },
      { icon: Droplets, label: 'Aromatherapy', path: '/aromatherapy', desc: 'Essential oil guide with blending recipes, diffuser suggestions, and mood-based recommendations.' },
      { icon: Leaf, label: 'Herbology', path: '/herbology', desc: 'Medicinal herb encyclopedia with preparations, dosages, and traditional uses.' },
      { icon: Flame, label: 'Elixirs', path: '/elixirs', desc: 'Healing tonic recipes — teas, tinctures, and moon water preparations.' },
      { icon: Leaf, label: 'Animal Totems', path: '/animal-totems', desc: 'Discover your spirit animal guides and their symbolic meanings.' },
    ],
  },
  {
    title: 'Your Avatar & Growth',
    color: '#6366F1',
    items: [
      { icon: Sparkles, label: 'Avatar Creator', path: '/avatar', desc: 'Build your holographic self. Choose body type, aura color, pose, robe, glow style, and particle density. Your avatar dynamically reflects your energy — as you meditate and practice, it visibly changes.' },
      { icon: Heart, label: 'Mood Tracker', path: '/mood', desc: 'Log your emotional state daily. Your moods influence your avatar\'s energy field and help personalize recommendations.' },
      { icon: Trophy, label: 'Games & Badges', path: '/games', desc: 'Earn XP from activities, unlock celestial badges, climb the leaderboard. 12 constellation-themed achievement badges.' },
      { icon: Users, label: 'Community', path: '/community', desc: 'Share your practice milestones, meditation completions, and star chart discoveries. Like and comment on others\' posts.' },
      { icon: GraduationCap, label: 'Learn', path: '/learn', desc: 'Structured courses and certifications across wellness topics.' },
    ],
  },
];

export default function Tutorial() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('tutorial', 8); }, []);

  const navigate = useNavigate();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-24 px-5" data-testid="tutorial-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#C084FC' }}>
            <Compass size={14} className="inline mr-2" />Guide
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            How to Use The ENLIGHTEN.MINT.CAFE
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Everything you need to know — from first steps to mastering every tool.
          </p>

          {/* Quick walkthrough button */}
          <button onClick={() => setShowWalkthrough(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium mb-10 transition-all"
            style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}
            data-testid="start-walkthrough-btn">
            <Play size={14} /> Replay Quick Walkthrough
          </button>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section, si) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 rounded-full" style={{ background: section.color }} />
                <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, ii) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.label}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: si * 0.05 + ii * 0.03 }}
                      className="p-5 cursor-pointer group"
                      onClick={() => navigate(item.path)}
                      data-testid={`tutorial-card-${item.path.replace('/', '')}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{ background: `${section.color}10`, border: `1px solid ${section.color}12` }}>
                          <Icon size={16} style={{ color: section.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</h3>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-12 p-8">
          <h2 className="text-lg font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Pro Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Complete meditations to auto-water your Zen Garden plants — they grow as you grow.', color: '#22C55E' },
              { tip: 'Your Avatar reflects your energy state. Practice regularly and watch it transform.', color: '#C084FC' },
              { tip: 'On mobile, enable Gyro mode in the Star Chart to use your phone like a telescope.', color: '#3B82F6' },
              { tip: 'Check your Cosmic Profile to discover which numbers, crystals, and elements keep appearing in your readings.', color: '#FDA4AF' },
              { tip: 'The VR Sanctuary meditation portal starts a breathing session right inside the 3D space.', color: '#6366F1' },
              { tip: 'Forecasts are cached per period — your daily forecast stays consistent all day.', color: '#FCD34D' },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: `${t.color}04`, border: `1px solid ${t.color}08` }}>
                <ArrowRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: t.color }} />
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Walkthrough overlay */}
      {showWalkthrough && (
        <Walkthrough onComplete={() => setShowWalkthrough(false)} />
      )}
    </div>
  );
}
