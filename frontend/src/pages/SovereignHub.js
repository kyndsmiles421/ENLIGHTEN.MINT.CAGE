/**
 * V31.1 SOVEREIGN HUB — COMPLETE 7-PILLAR DRILL-DOWN
 * Every module has a home. Every function is accessible.
 * Broadcast + Sever + Discover integrated into pillars.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Share2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
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
  ]},
  { title: 'Divination', color: '#E879F9', items: [
    { label: 'Oracle & Tarot', route: '/oracle' },
    { label: 'Akashic Records', route: '/akashic-records' },
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Numerology', route: '/numerology' },
    { label: 'Dream Journal', route: '/dreams' },
    { label: 'Mayan Astrology', route: '/mayan' },
    { label: 'Cosmic Calendar', route: '/cosmic-calendar' },
    { label: 'Cardology', route: '/cardology' },
    { label: 'Animal Totems', route: '/animal-totems' },
  ]},
  { title: 'Sanctuary', color: '#2DD4BF', items: [
    { label: 'Zen Garden', route: '/zen-garden' },
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Music Lounge', route: '/music-lounge' },
    { label: 'Frequencies', route: '/frequencies' },
    { label: 'VR Sanctuary', route: '/vr' },
    { label: 'Journaling', route: '/journal' },
    { label: 'Wisdom Journal', route: '/wisdom-journal' },
    { label: 'Green Journal', route: '/green-journal' },
  ]},
  { title: 'Nourish & Heal', color: '#22C55E', items: [
    { label: 'Nourishment', route: '/nourishment' },
    { label: 'Aromatherapy', route: '/aromatherapy' },
    { label: 'Herbology', route: '/herbology' },
    { label: 'Elixirs', route: '/elixirs' },
    { label: 'Acupressure', route: '/acupressure' },
    { label: 'Reiki', route: '/reiki' },
    { label: 'Meal Planning', route: '/meal-planning' },
    { label: 'Wellness Reports', route: '/wellness-reports' },
  ]},
  { title: 'Explore', color: '#FB923C', items: [
    { label: 'Discover', route: '/discover' },
    { label: 'Encyclopedia', route: '/encyclopedia' },
    { label: 'Reading List', route: '/reading-list' },
    { label: 'Creation Stories', route: '/creation-stories' },
    { label: 'Teachings', route: '/teachings' },
    { label: 'Community', route: '/community' },
    { label: 'Blessings', route: '/blessings' },
    { label: 'Sacred Texts', route: '/sacred-texts' },
    { label: 'Cosmic Profile', route: '/cosmic-profile' },
  ]},
  { title: 'Sage AI Coach', color: '#38BDF8', items: [
    { label: 'Voice Conversations', route: '/coach' },
    { label: 'Spiritual Guidance', route: '/coach' },
    { label: 'Crystals & Stones', route: '/crystals' },
    { label: 'Daily Briefing', route: '/daily-briefing' },
    { label: 'Forecasts', route: '/forecasts' },
  ]},
  { title: 'Sovereign Council', color: '#C084FC', items: [
    { label: 'Council Advisors', route: '/sovereigns' },
    { label: 'Economy & Dust', route: '/economy' },
    { label: 'Academy', route: '/academy' },
    { label: 'Trade Circle', route: '/trade-circle' },
    { label: 'Crystal Skins', route: '/crystal-skins' },
    { label: 'Archives & Vault', route: '/archives' },
    { label: 'Cosmic Ledger', route: '/cosmic-ledger' },
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Liquidity Trader', route: '/liquidity-trader' },
    { label: 'Resource Alchemy', route: '/resource-alchemy' },
    { label: 'Gravity Well', route: '/gravity-well' },
    { label: 'Cryptic Quest', route: '/cryptic-quest' },
    { label: 'Starseed Games', route: '/games' },
    { label: 'Settings', route: '/settings' },
  ]},
];

export default function SovereignHub() {
  const navigate = useNavigate();
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

      {/* Utility Row: Broadcast + Sever */}
      <div className="flex justify-center gap-3 px-4 pb-6">
        <button
          onClick={handleBroadcast}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
          data-testid="hub-broadcast"
        >
          <Share2 size={12} /> Broadcast
        </button>
        <button
          onClick={handleSever}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all active:scale-95"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.5)' }}
          data-testid="hub-sever"
        >
          <LogOut size={12} /> Sever
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
