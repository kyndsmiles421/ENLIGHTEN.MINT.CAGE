/**
 * V31.1 SOVEREIGN HUB — COMPLETE 7-PILLAR DRILL-DOWN
 * Every module has a home. Every function is accessible.
 * Broadcast + Sever + Discover integrated into pillars.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, Share2, LogOut, LogIn, User, Swords } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSovereignUniverse } from '../context/SovereignUniverseContext';
import Onboarding from '../components/Onboarding';
import DailyChallenges from '../components/DailyChallenges';
import OracleSearch from '../components/OracleSearch';
import SovereignChoicePanel from '../components/SovereignChoicePanel';
import ToolDrawer from '../components/ToolDrawer';
import CalibrationLens from '../components/CalibrationLens';
import SignaturePill from '../components/SignaturePill';
import ActiveMissionHUD from '../components/ActiveMissionHUD';
import WalletPills from '../components/WalletPills';
import MiniLattice from '../components/MiniLattice';

const PILLARS = [
  { title: 'Practice', color: '#D8B4FE', items: [
    { label: 'Breathwork', route: '/breathing' },
    { label: 'Meditation', route: '/meditation' },
    { label: 'Yoga', route: '/yoga' },
    { label: 'Mudras', route: '/mudras' },
    { label: 'Mantras', route: '/mantras' },
    { label: 'Light Therapy', route: '/light-therapy' },
    { label: 'Affirmations', route: '/affirmations' },
    { label: 'Daily Ritual', route: '/daily-ritual' },
    { label: 'Mood Tracker', route: '/mood' },
    { label: 'Exercises', route: '/exercises' },
    { label: 'Hooponopono', route: '/hooponopono' },
    { label: 'Tantra', route: '/tantra' },
    { label: 'Silent Sanctuary', route: '/silent-sanctuary' },
    { label: 'Challenges', route: '/challenges' },
    { label: 'Rituals', route: '/rituals' },
  ]},
  { title: 'Divination', color: '#E879F9', items: [
    { label: 'Oracle & Tarot', route: '/oracle' },
    { label: 'Akashic Records', route: '/akashic-records' },
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Numerology', route: '/numerology' },
    { label: 'Dream Journal', route: '/dreams' },
    { label: 'Dream Realms', route: '/dream-realms' },
    { label: 'Mayan Astrology', route: '/mayan' },
    { label: 'Cosmic Calendar', route: '/cosmic-calendar' },
    { label: 'Cardology', route: '/cardology' },
    { label: 'Animal Totems', route: '/animal-totems' },
    { label: 'Hexagram Journal', route: '/hexagram-journal' },
    { label: 'Forecasts', route: '/forecasts' },
    { label: 'Cosmic Insights', route: '/cosmic-insights' },
    { label: 'Soul Reports', route: '/soul-reports' },
    { label: 'Collective Shadow Map', route: '/collective-shadow-map' },
  ]},
  { title: 'Sanctuary', color: '#2DD4BF', items: [
    { label: 'Zen Garden', route: '/zen-garden' },
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Music Lounge', route: '/music-lounge' },
    { label: 'Dance & Music Studio', route: '/dance-music' },
    { label: 'Frequencies', route: '/frequencies' },
    { label: 'VR Sanctuary', route: '/vr' },
    { label: 'Journaling', route: '/journal' },
    { label: 'Wisdom Journal', route: '/wisdom-journal' },
    { label: 'Green Journal', route: '/green-journal' },
    { label: 'Meditation History', route: '/meditation-history' },
    { label: 'Sanctuary Room', route: '/sanctuary' },
    { label: 'Media Library', route: '/media-library' },
  ]},
  { title: 'Nourish & Heal', color: '#22C55E', items: [
    { label: 'Nourishment', route: '/nourishment' },
    { label: 'Aromatherapy', route: '/aromatherapy' },
    { label: 'Herbology', route: '/herbology' },
    { label: 'Elixirs', route: '/elixirs' },
    { label: 'Crystals & Stones', route: '/crystals' },
    { label: 'Acupressure', route: '/acupressure' },
    { label: 'Reiki', route: '/reiki' },
    { label: 'Meal Planning', route: '/meal-planning' },
    { label: 'Botany', route: '/botany' },
    { label: 'Botany Orbital', route: '/botany-orbital' },
    { label: 'Rock Hounding', route: '/rock-hounding' },
    { label: 'Wellness Reports', route: '/wellness-reports' },
    { label: 'Replant', route: '/replant' },
  ]},
  { title: 'Knowledge', color: '#FB923C', items: [
    { label: 'Teachings', route: '/teachings' },
    { label: 'Sacred Texts', route: '/sacred-texts' },
    { label: 'Bible Studies', route: '/bible' },
    { label: 'Encyclopedia', route: '/encyclopedia' },
    { label: 'Creation Stories', route: '/creation-stories' },
    { label: 'Forgotten Languages', route: '/forgotten-languages' },
    { label: 'Reading List', route: '/reading-list' },
    { label: 'Learn', route: '/learn' },
    { label: 'Tutorial', route: '/tutorial' },
    { label: 'Discover', route: '/discover' },
    { label: 'Videos', route: '/videos' },
    { label: 'Blessings', route: '/blessings' },
    { label: 'Yantra', route: '/yantra' },
    { label: 'Codex', route: '/codex' },
    { label: 'Codex Orbital', route: '/codex-orbital' },
    { label: 'Music Theory', route: '/theory' },
  ]},
  { title: 'Creators & Generators', color: '#FBBF24', items: [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
    { label: 'Fabricator', route: '/fabricator' },
    { label: 'Create', route: '/create' },
    { label: 'My Creations', route: '/my-creations' },
    { label: 'Avatar Creator', route: '/avatar' },
    { label: 'Spiritual Avatar', route: '/spiritual-avatar' },
    { label: 'Avatar Gallery', route: '/avatar-gallery' },
    { label: 'Sovereign Canvas', route: '/sovereign-canvas' },
    { label: 'Seed Gallery', route: '/seed-gallery' },
    { label: 'Minting Ceremony', route: '/minting-ceremony' },
    { label: 'Workshop', route: '/workshop' },
    { label: 'Refinement Lab', route: '/refinement-lab' },
    { label: 'SmartDock', route: '/smartdock' },
    { label: 'Nexus', route: '/nexus' },
  ]},
  { title: 'Sage AI Coach', color: '#38BDF8', items: [
    { label: 'My Sanctuary (Profile)', route: '/profile' },
    { label: 'Friends', route: '/friends' },
    { label: 'Voice Conversations', route: '/coach' },
    { label: 'Daily Briefing', route: '/daily-briefing' },
    { label: 'Cosmic Profile', route: '/cosmic-profile' },
    { label: 'Certifications', route: '/certifications' },
    { label: 'Growth Timeline', route: '/growth-timeline' },
    { label: 'Journey Map', route: '/journey' },
    { label: 'Mastery Path', route: '/mastery-path' },
    { label: 'Mastery Avenues', route: '/mastery-avenues' },
    { label: 'Analytics', route: '/analytics' },
    { label: 'Hotspots', route: '/hotspots' },
  ]},
  { title: 'RPG & Adventure', color: '#EF4444', items: [
    { label: 'RPG Character', route: '/rpg' },
    { label: 'Starseed Games', route: '/games' },
    { label: 'Starseed Adventure', route: '/starseed-adventure' },
    { label: 'Starseed Realm', route: '/starseed-realm' },
    { label: 'Starseed Worlds', route: '/starseed-worlds' },
    { label: 'Cryptic Quest', route: '/cryptic-quest' },
    { label: 'Evolution Lab', route: '/evolution-lab' },
    { label: 'Entanglement', route: '/entanglement' },
    { label: 'Starseed Origin', route: '/starseed' },
    { label: 'Void', route: '/void' },
  ]},
  { title: 'Cosmos & Physics', color: '#6366F1', items: [
    { label: 'Observatory', route: '/observatory' },
    { label: 'Fractal Engine', route: '/fractal-engine' },
    { label: 'Quantum Field', route: '/quantum-field' },
    { label: 'Quantum Loom', route: '/quantum-loom' },
    { label: 'Dimensional Space', route: '/dimensional-space' },
    { label: 'Tesseract', route: '/tesseract' },
    { label: 'Metatron Cube', route: '/metatron' },
    { label: 'Planetary Depths', route: '/planetary-depths' },
    { label: 'Multiverse Map', route: '/multiverse-map' },
    { label: 'Celestial Dome', route: '/vr/celestial-dome' },
    { label: 'AR Portal', route: '/ar-portal' },
    { label: 'Physics Lab', route: '/physics-lab' },
    { label: 'Crystalline Engine', route: '/crystalline-engine' },
    { label: 'Lattice View', route: '/lattice-view' },
    { label: 'Recursive Dive', route: '/recursive-dive' },
    { label: 'Refractor', route: '/refractor' },
    { label: 'Suanpan Core', route: '/suanpan' },
    { label: 'Cosmic Map', route: '/cosmic-map' },
    { label: 'Multiverse Realms', route: '/multiverse-realms' },
    { label: 'Enlightenment OS', route: '/enlightenment-os' },
  ]},
  { title: 'Sovereign Council', color: '#C084FC', items: [
    { label: 'Council Advisors', route: '/sovereigns' },
    { label: 'Economy & Dust', route: '/economy' },
    { label: 'Academy', route: '/academy' },
    { label: 'Trade Circle', route: '/trade-circle' },
    { label: 'Trade Orbital', route: '/trade-orbital' },
    { label: 'Masonry Workshop', route: '/workshop/masonry' },
    { label: 'Carpentry Workshop', route: '/workshop/carpentry' },
    { label: 'Sovereign Passport', route: '/trade-passport' },
    { label: 'Electrical Workshop', route: '/workshop/electrical' },
    { label: 'Plumbing Workshop', route: '/workshop/plumbing' },
    { label: 'Landscaping Workshop', route: '/workshop/landscaping' },
    { label: 'Nursing Workshop', route: '/workshop/nursing' },
    { label: 'Bible Study Workshop', route: '/workshop/bible' },
    { label: 'Child Care Workshop', route: '/workshop/childcare' },
    { label: 'Elderly Care Workshop', route: '/workshop/eldercare' },
    { label: 'Welding Workshop', route: '/workshop/welding' },
    { label: 'Automotive Workshop', route: '/workshop/automotive' },
    { label: 'Nutrition Workshop', route: '/workshop/nutrition' },
    { label: 'Meditation Workshop', route: '/workshop/meditation' },
    { label: 'HVAC Workshop', route: '/workshop/hvac' },
    { label: 'Robotics Workshop', route: '/workshop/robotics' },
    { label: 'First Aid Workshop', route: '/workshop/first_aid' },
    { label: 'Hermetics Workshop', route: '/workshop/hermetics' },
    { label: 'Public Speaking', route: '/workshop/speaking' },
    { label: 'Philosophy Workshop', route: '/workshop/philosophy' },
    { label: 'Pedagogy Workshop', route: '/workshop/pedagogy' },
    { label: 'Anatomy Workshop', route: '/workshop/anatomy' },
    { label: 'Machining Workshop', route: '/workshop/machining' },
    { label: 'Crystal Skins', route: '/crystal-skins' },
    { label: 'Archives & Vault', route: '/archives' },
    { label: 'Cosmic Ledger', route: '/cosmic-ledger' },
    { label: 'Liquidity Trader', route: '/liquidity-trader' },
    { label: 'Resource Alchemy', route: '/resource-alchemy' },
    { label: 'Gravity Well', route: '/gravity-well' },
    { label: 'Community', route: '/community' },
    { label: 'Friends', route: '/friends' },
    { label: 'Classes', route: '/classes' },
    { label: 'Live Sessions', route: '/live' },
    { label: 'Cosmic Store', route: '/cosmic-store' },
    { label: 'Membership', route: '/membership' },
    { label: 'Sovereign Circle', route: '/sovereign-circle' },
    { label: 'Master Engine', route: '/master-engine' },
    { label: 'Master View', route: '/master-view' },
    { label: 'Sovereignty', route: '/sovereignty' },
    { label: 'Sovereign Engine', route: '/sovereign' },
    { label: 'Console', route: '/console' },
    { label: 'Mint', route: '/mint' },
    { label: 'Lab', route: '/lab' },
    { label: 'Creator Tools', route: '/creator' },
    { label: 'Settings', route: '/settings' },
  ]},
];

export default function SovereignHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useSovereignUniverse();
  const [expanded, setExpanded] = useState(null);
  const [glowDomains, setGlowDomains] = useState([]);
  const [toolDrawerOpen, setToolDrawerOpen] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);

  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 5);
  }, []);

  const togglePillar = (idx) => {
    setExpanded(prev => prev === idx ? null : idx);
  };

  // Map backend domain names to pillar titles for glow bridging
  const DOMAIN_TO_PILLAR = {
    'Trade & Craft': 'Sovereign Council',
    'Healing Arts': 'Nourish & Heal',
    'Sacred Knowledge': 'Knowledge',
    'Science & Physics': 'Cosmos & Physics',
    'Mind & Spirit': 'Practice',
    'Exploration': 'Knowledge',
  };

  const handleActiveDomains = useCallback((domains) => {
    setGlowDomains(domains);
  }, []);

  const handleBroadcast = async () => {
    const shareData = {
      title: 'ENLIGHTEN.MINT.CAFE',
      text: 'Sovereign Wellness Engine — breathwork, divination, alchemy, and more.',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('Link copied to clipboard');
      }
    } catch {}
  };

  const handleSever = () => {
    const root = document.documentElement;
    root.style.transition = 'filter 1.5s ease-in-out';
    root.style.filter = 'brightness(0) blur(10px)';
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      window.location.href = '/landing';
    }, 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }} data-testid="sovereign-hub">
      <Onboarding />
      {/* Title */}
      <div className="pt-10 pb-4 px-5">
        <h1
          className="text-2xl font-bold text-center"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #22C55E, #EAB308)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Cormorant Garamond, serif',
          }}
          data-testid="hub-title"
        >
          ENLIGHTEN.MINT.CAFE
        </h1>
      </div>

      {/* V68.5 — Sovereign Wallet: RANK (Merit/Sparks) + DUST (Economy) pills */}
      <WalletPills />

      {/* V68.4 — Active Mission HUD (inline, below wallet pills) */}
      <ActiveMissionHUD />

      {/* V68.6 — Sovereign Mini-Lattice (9x9 crystalline journey) */}
      <MiniLattice />

      {/* Utility Row: Sign In / Share / Sign Out */}
      <div className="flex justify-center gap-3 px-4 pb-6">
        {!user ? (
          <Link
            to="/auth"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)', color: '#C084FC' }}
            data-testid="hub-signin"
          >
            <LogIn size={14} /> Sign In
          </Link>
        ) : (
          <button
            onClick={handleSever}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all active:scale-95"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.5)' }}
            data-testid="hub-sever"
          >
            <LogOut size={12} /> Sign Out
          </button>
        )}
        <button
          onClick={handleBroadcast}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
          data-testid="hub-share"
        >
          <Share2 size={14} /> Share
        </button>
        <Link
          to="/realms"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))',
            border: '1px solid rgba(168,85,247,0.5)',
            color: '#C084FC',
            boxShadow: '0 0 18px rgba(168,85,247,0.25)',
            letterSpacing: '1px',
          }}
          data-testid="hub-realms"
        >
          <Swords size={14} /> REALMS
        </Link>
        {user && (
          <Link
            to="/profile"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
            data-testid="hub-my-sanctuary"
          >
            <User size={14} /> My Sanctuary
          </Link>
        )}
      </div>

      {/* V56.1 — Daily Elemental Challenges */}
      <div className="px-4 pb-4">
        <DailyChallenges compact />
      </div>

      {/* V68.31 — Sovereign Choice Protocol Panel (audio frequency + visual skin) */}
      <div className="px-4 pb-4">
        <SovereignChoicePanel />
      </div>

      {/* V68.32 — Blade Signature pill (live truth or pinned) */}
      <div className="px-4 pb-3 flex justify-center">
        <SignaturePill />
      </div>

      {/* V68.31 — Sovereign Arsenal (Swiss Army Knife) opener */}
      <div className="px-4 pb-4 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setToolDrawerOpen(true)}
          data-testid="open-tool-drawer"
          className="group px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.28em] font-bold transition-all"
          style={{
            background: 'rgba(192, 132, 252, 0.12)',
            border: '1px solid rgba(192, 132, 252, 0.35)',
            color: '#E9D5FF',
            boxShadow: '0 0 24px rgba(192,132,252,0.15)',
          }}
        >
          ⌁ Open the Sovereign Arsenal
        </button>
        <button
          onClick={() => setLensOpen(true)}
          data-testid="open-calibration-lens"
          className="group px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.28em] font-bold transition-all"
          style={{
            background: 'rgba(251, 191, 36, 0.10)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            color: '#FDE68A',
            boxShadow: '0 0 24px rgba(251, 191, 36, 0.12)',
          }}
        >
          ✧ Living Lens · Calibrate
        </button>
      </div>
      <ToolDrawer open={toolDrawerOpen} onClose={() => setToolDrawerOpen(false)} />
      <CalibrationLens open={lensOpen} onClose={() => setLensOpen(false)} />

      {/* V64.1 — Oracle: Intent-Based Neural Search */}
      <div className="px-4 pb-4">
        <OracleSearch onActiveDomains={handleActiveDomains} />
      </div>

      {/* V68.32 — 7 Pillars · Sacred Geometry Crystalline Grid
          (killed the flat accordion bars. Each pillar is now a faceted
          crystal card with refraction, rim-light, and motion depth.
          Expansion still works — but in situ as a radial unfold, not a
          stacked accordion.) */}
      <div className="px-4 pb-24">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {PILLARS.map((pillar, idx) => {
            const isOpen = expanded === idx;
            const isGlowing = glowDomains.some(d => DOMAIN_TO_PILLAR[d] === pillar.title);
            return (
              <motion.div
                key={pillar.title}
                layout
                transition={{ layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  gridColumn: isOpen ? '1 / -1' : 'auto',
                  background:
                    `radial-gradient(circle at 20% 0%, ${pillar.color}22 0%, transparent 55%),` +
                    `radial-gradient(circle at 100% 100%, ${pillar.color}14 0%, transparent 60%),` +
                    'rgba(10,10,18,0.85)',
                  border: `1px solid ${isOpen ? `${pillar.color}66` : isGlowing ? `${pillar.color}44` : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isOpen || isGlowing
                    ? `0 20px 60px ${pillar.color}22, inset 0 0 32px ${pillar.color}10`
                    : '0 10px 30px rgba(0,0,0,0.35)',
                }}
                data-testid={`pillar-${pillar.title.toLowerCase().replace(/[\s&]/g, '-')}`}
              >
                {/* Refracted prismatic grid (Refracted Crystal skin lights this more) */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    background:
                      `repeating-linear-gradient(45deg, transparent 0 28px, ${pillar.color}0A 28px 29px),` +
                      `repeating-linear-gradient(-45deg, transparent 0 28px, rgba(255,255,255,0.03) 28px 29px)`,
                    mixBlendMode: 'screen',
                  }}
                />
                {/* Rim light sweep */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ backgroundPositionX: ['0%', '200%'] }}
                  transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
                  style={{
                    backgroundImage: `linear-gradient(110deg, transparent 40%, ${pillar.color}28 50%, transparent 60%)`,
                    backgroundSize: '200% 100%',
                    mixBlendMode: 'screen',
                    opacity: isOpen || isGlowing ? 0.55 : 0.22,
                  }}
                />

                <button
                  onClick={() => togglePillar(idx)}
                  className="relative w-full text-left px-5 py-4"
                  data-testid={`pillar-btn-${pillar.title.toLowerCase().replace(/[\s&]/g, '-')}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: `${pillar.color}cc` }}>
                        Pillar · {pillar.items.length} blades
                      </p>
                      <p
                        className="text-2xl font-light leading-tight"
                        style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          background: `linear-gradient(135deg, #fff, ${pillar.color})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {pillar.title}
                      </p>
                    </div>
                    {/* Hexagonal crystal indicator */}
                    <motion.svg
                      width="44" height="44" viewBox="0 0 48 48"
                      animate={{ rotate: isOpen ? 60 : 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <defs>
                        <linearGradient id={`hex-${idx}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                          <stop offset="100%" stopColor={pillar.color} stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="24,4 42,14 42,34 24,44 6,34 6,14"
                        fill={`url(#hex-${idx})`}
                        stroke={pillar.color}
                        strokeWidth="1.2"
                        opacity="0.92"
                      />
                      <polygon points="24,4 42,14 24,24" fill="#fff" opacity="0.18" />
                      <polygon points="24,24 42,14 42,34" fill={pillar.color} opacity="0.2" />
                    </motion.svg>
                  </div>

                  {!isOpen && (
                    <p className="text-[11px] mt-2" style={{ color: 'rgba(203,213,225,0.65)' }}>
                      Tap to unfold — {pillar.items.slice(0, 3).map(i => i.label).join(' · ')} …
                    </p>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="relative px-5 pb-5"
                    >
                      <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
                      >
                        {pillar.items.map((item, i) => (
                          <motion.button
                            key={item.label}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 * i, duration: 0.3 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(item.route)}
                            className="relative rounded-xl px-3 py-3 text-left overflow-hidden group"
                            style={{
                              background: `linear-gradient(135deg, ${pillar.color}18 0%, rgba(10,10,18,0.5) 100%)`,
                              border: `1px solid ${pillar.color}33`,
                              color: '#F1F5F9',
                            }}
                            data-testid={`nav-${item.label.toLowerCase().replace(/[\s&]/g, '-')}`}
                          >
                            {/* Mini crystal facet */}
                            <svg className="absolute top-1 right-1 opacity-70" width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                              <polygon points="8,1 14,6 12,14 4,14 2,6" fill={pillar.color} opacity="0.5" />
                            </svg>
                            <span className="block text-[12px] font-semibold leading-tight">{item.label}</span>
                            <span className="block text-[9px] uppercase tracking-[0.2em] mt-1 opacity-60" style={{ color: pillar.color }}>
                              Enter
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
