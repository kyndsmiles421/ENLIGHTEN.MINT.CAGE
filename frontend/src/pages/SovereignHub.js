/**
 * V31.0 SOVEREIGN HUB — PURE 7-PILLAR DRILL-DOWN
 * No header. No footer. No floating widgets.
 * 7 pillars → expand → tap item → navigate.
 * Every sub-page has a back button to return here.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const PILLARS = [
  { title: 'Practice', color: '#D8B4FE', items: [
    { label: 'Breathwork', route: '/breathing' },
    { label: 'Meditation', route: '/meditation' },
    { label: 'Yoga', route: '/yoga' },
    { label: 'Mudras', route: '/mudras' },
    { label: 'Mantras', route: '/mantras' },
    { label: 'Light Therapy', route: '/light-therapy' },
  ]},
  { title: 'Divination', color: '#E879F9', items: [
    { label: 'Oracle & Tarot', route: '/oracle' },
    { label: 'Akashic Records', route: '/akashic-records' },
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Numerology', route: '/numerology' },
    { label: 'Dream Journal', route: '/dreams' },
    { label: 'Mayan Astrology', route: '/mayan' },
  ]},
  { title: 'Sanctuary', color: '#2DD4BF', items: [
    { label: 'Zen Garden', route: '/zen-garden' },
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Music Lounge', route: '/music-lounge' },
    { label: 'Frequencies', route: '/frequencies' },
    { label: 'VR Sanctuary', route: '/vr' },
    { label: 'Journaling', route: '/journal' },
  ]},
  { title: 'Nourish & Heal', color: '#22C55E', items: [
    { label: 'Nourishment', route: '/nourishment' },
    { label: 'Aromatherapy', route: '/aromatherapy' },
    { label: 'Herbology', route: '/herbology' },
    { label: 'Elixirs', route: '/elixirs' },
    { label: 'Acupressure', route: '/acupressure' },
    { label: 'Reiki', route: '/reiki' },
  ]},
  { title: 'Explore', color: '#FB923C', items: [
    { label: 'Encyclopedia', route: '/encyclopedia' },
    { label: 'Reading List', route: '/reading-list' },
    { label: 'Creation Stories', route: '/creation-stories' },
    { label: 'Teachings', route: '/teachings' },
    { label: 'Community', route: '/community' },
    { label: 'Blessings', route: '/blessings' },
  ]},
  { title: 'Sage AI Coach', color: '#38BDF8', items: [
    { label: 'Voice Conversations', route: '/coach' },
    { label: 'Spiritual Guidance', route: '/coach' },
    { label: 'Crystals & Stones', route: '/crystals' },
    { label: 'Personalized Wisdom', route: '/coach' },
  ]},
  { title: 'Sovereign Council', color: '#C084FC', items: [
    { label: 'Council Advisors', route: '/sovereigns' },
    { label: 'Economy & Dust', route: '/economy' },
    { label: 'Academy', route: '/academy' },
    { label: 'Trade Circle', route: '/trade-circle' },
    { label: 'Crystal Skins', route: '/crystal-skins' },
    { label: 'Archives', route: '/archives' },
    { label: 'Vault', route: '/archives' },
    { label: 'Ledger', route: '/cosmic-ledger' },
    { label: 'Creator Console', route: '/creator-console' },
  ]},
];

export default function SovereignHub() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  // Silent dust accrual
  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 5);
  }, []);

  const togglePillar = (idx) => {
    setExpanded(prev => prev === idx ? null : idx);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#000000' }}
      data-testid="sovereign-hub"
    >
      {/* Title */}
      <div className="pt-10 pb-6 px-5">
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

      {/* 7 Pillars — Accordion */}
      <div className="px-4 pb-20">
        {PILLARS.map((pillar, idx) => {
          const isOpen = expanded === idx;
          return (
            <div key={pillar.title} className="mb-2" data-testid={`pillar-${pillar.title.toLowerCase().replace(/[\s&]/g, '-')}`}>
              {/* Pillar Header */}
              <button
                onClick={() => togglePillar(idx)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all active:scale-[0.98]"
                style={{
                  background: isOpen ? `${pillar.color}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isOpen ? `${pillar.color}30` : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`pillar-btn-${pillar.title.toLowerCase().replace(/[\s&]/g, '-')}`}
              >
                <span
                  className="text-sm font-bold uppercase tracking-[0.15em]"
                  style={{ color: pillar.color }}
                >
                  {pillar.title}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} style={{ color: pillar.color, opacity: 0.6 }} />
                </motion.div>
              </button>

              {/* Expanded Items */}
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
