/**
 * V31.1 SOVEREIGN HUB — COMPLETE 7-PILLAR DRILL-DOWN
 * Every module has a home. Every function is accessible.
 * Broadcast + Sever + Discover integrated into pillars.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, Share2, LogOut, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import Onboarding from '../components/Onboarding';
import CinematicWalkthrough from '../components/CinematicWalkthrough';
import DailyChallenges from '../components/DailyChallenges';

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
    { label: 'Masonry Workbench', route: '/masonry-workbench' },
    { label: 'Carpentry Workbench', route: '/carpentry-workbench' },
    { label: 'Sovereign Passport', route: '/trade-passport' },
    { label: 'Electrical Workshop', route: '/electrical-workbench' },
    { label: 'Plumbing Workshop', route: '/plumbing-workbench' },
    { label: 'Landscaping Workshop', route: '/landscaping-workbench' },
    { label: 'Nursing Workshop', route: '/nursing-workbench' },
    { label: 'Bible Study Workshop', route: '/bible-study-workbench' },
    { label: 'Child Care Workshop', route: '/childcare-workbench' },
    { label: 'Elderly Care Workshop', route: '/eldercare-workbench' },
    { label: 'Welding Workshop', route: '/workshop/welding' },
    { label: 'Automotive Workshop', route: '/workshop/automotive' },
    { label: 'Nutrition Workshop', route: '/workshop/nutrition' },
    { label: 'Meditation Workshop', route: '/workshop/meditation' },
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
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 5);
  }, []);

  const togglePillar = (idx) => {
    setExpanded(prev => prev === idx ? null : idx);
  };

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
      </div>

      {/* Cinematic Walkthrough */}
      <div className="flex justify-center px-4 pb-4">
        <CinematicWalkthrough />
      </div>

      {/* V56.1 — Daily Elemental Challenges */}
      <div className="px-4 pb-4">
        <DailyChallenges compact />
      </div>

      {/* 7 Pillars — Accordion */}
      <div className="px-4 pb-20">
        {PILLARS.map((pillar, idx) => {
          const isOpen = expanded === idx;
          return (
            <div key={pillar.title} className="mb-2" data-testid={`pillar-${pillar.title.toLowerCase().replace(/[\s&]/g, '-')}`}>
              <button
                onClick={() => togglePillar(idx)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all active:scale-[0.98]"
                style={{
                  background: isOpen ? `${pillar.color}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isOpen ? `${pillar.color}30` : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`pillar-btn-${pillar.title.toLowerCase().replace(/[\s&]/g, '-')}`}
              >
                <span className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: pillar.color }}>
                  {pillar.title}
                  <span className="text-[10px] font-normal ml-2 opacity-40">{pillar.items.length}</span>
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} style={{ color: pillar.color, opacity: 0.6 }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-1.5 px-1 pt-2 pb-1">
                      {pillar.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => navigate(item.route)}
                          className="py-3 px-3 rounded-lg text-left transition-all active:scale-95"
                          style={{
                            background: `${pillar.color}08`,
                            border: `1px solid ${pillar.color}15`,
                            color: 'rgba(248,250,252,0.8)',
                          }}
                          data-testid={`nav-${item.label.toLowerCase().replace(/[\s&]/g, '-')}`}
                        >
                          <span className="text-xs">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
