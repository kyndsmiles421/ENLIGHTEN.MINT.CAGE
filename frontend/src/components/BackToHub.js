import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RELATED = {
  '/breathing': [
    { label: 'Meditation', route: '/meditation' },
    { label: 'Yoga', route: '/yoga' },
    { label: 'Mood Tracker', route: '/mood' },
    { label: 'Soundscapes', route: '/soundscapes' },
  ],
  '/meditation': [
    { label: 'Breathwork', route: '/breathing' },
    { label: 'Mantras', route: '/mantras' },
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Zen Garden', route: '/zen-garden' },
  ],
  '/yoga': [
    { label: 'Breathwork', route: '/breathing' },
    { label: 'Mudras', route: '/mudras' },
    { label: 'Acupressure', route: '/acupressure' },
    { label: 'Reiki', route: '/reiki' },
  ],
  '/mudras': [
    { label: 'Yoga', route: '/yoga' },
    { label: 'Meditation', route: '/meditation' },
    { label: 'Mantras', route: '/mantras' },
  ],
  '/mantras': [
    { label: 'Meditation', route: '/meditation' },
    { label: 'Frequencies', route: '/frequencies' },
    { label: 'Soundscapes', route: '/soundscapes' },
  ],
  '/light-therapy': [
    { label: 'Frequencies', route: '/frequencies' },
    { label: 'Mood Tracker', route: '/mood' },
    { label: 'Zen Garden', route: '/zen-garden' },
  ],
  '/affirmations': [
    { label: 'Daily Ritual', route: '/daily-ritual' },
    { label: 'Journaling', route: '/journal' },
    { label: 'Sage AI Coach', route: '/coach' },
  ],
  '/daily-ritual': [
    { label: 'Affirmations', route: '/affirmations' },
    { label: 'Breathwork', route: '/breathing' },
    { label: 'Daily Briefing', route: '/daily-briefing' },
  ],
  '/mood': [
    { label: 'Journaling', route: '/journal' },
    { label: 'Wellness Reports', route: '/wellness-reports' },
    { label: 'Sage AI Coach', route: '/coach' },
  ],
  '/oracle': [
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Numerology', route: '/numerology' },
    { label: 'Daily Briefing', route: '/daily-briefing' },
    { label: 'Cosmic Profile', route: '/cosmic-profile' },
  ],
  '/akashic-records': [
    { label: 'Oracle & Tarot', route: '/oracle' },
    { label: 'Dream Journal', route: '/dreams' },
    { label: 'Sacred Texts', route: '/sacred-texts' },
  ],
  '/star-chart': [
    { label: 'Oracle & Tarot', route: '/oracle' },
    { label: 'Cosmic Calendar', route: '/cosmic-calendar' },
    { label: 'Numerology', route: '/numerology' },
    { label: 'Forecasts', route: '/forecasts' },
  ],
  '/numerology': [
    { label: 'Cardology', route: '/cardology' },
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Cosmic Profile', route: '/cosmic-profile' },
  ],
  '/dreams': [
    { label: 'Journaling', route: '/journal' },
    { label: 'Sage AI Coach', route: '/coach' },
    { label: 'Akashic Records', route: '/akashic-records' },
  ],
  '/mayan': [
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Cosmic Calendar', route: '/cosmic-calendar' },
    { label: 'Animal Totems', route: '/animal-totems' },
  ],
  '/soundscapes': [
    { label: 'Frequencies', route: '/frequencies' },
    { label: 'Meditation', route: '/meditation' },
    { label: 'Zen Garden', route: '/zen-garden' },
    { label: 'Music Lounge', route: '/music-lounge' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
  ],
  '/zen-garden': [
    { label: 'Meditation', route: '/meditation' },
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'VR Sanctuary', route: '/vr' },
  ],
  '/journal': [
    { label: 'Dream Journal', route: '/dreams' },
    { label: 'Mood Tracker', route: '/mood' },
    { label: 'Wisdom Journal', route: '/wisdom-journal' },
  ],
  '/coach': [
    { label: 'Daily Briefing', route: '/daily-briefing' },
    { label: 'Cosmic Profile', route: '/cosmic-profile' },
    { label: 'Crystals & Stones', route: '/crystals' },
    { label: 'Oracle & Tarot', route: '/oracle' },
  ],
  '/crystals': [
    { label: 'Crystal Skins', route: '/crystal-skins' },
    { label: 'Sage AI Coach', route: '/coach' },
    { label: 'Encyclopedia', route: '/encyclopedia' },
  ],
  '/daily-briefing': [
    { label: 'Star Chart', route: '/star-chart' },
    { label: 'Oracle & Tarot', route: '/oracle' },
    { label: 'Daily Ritual', route: '/daily-ritual' },
    { label: 'Forecasts', route: '/forecasts' },
  ],
  '/academy': [
    { label: 'Teachings', route: '/teachings' },
    { label: 'Encyclopedia', route: '/encyclopedia' },
    { label: 'Sacred Texts', route: '/sacred-texts' },
  ],
  '/economy': [
    { label: 'Trade Circle', route: '/trade-circle' },
    { label: 'Liquidity Trader', route: '/liquidity-trader' },
    { label: 'Cosmic Ledger', route: '/cosmic-ledger' },
  ],
  '/trade-circle': [
    { label: 'Economy & Dust', route: '/economy' },
    { label: 'Gravity Well', route: '/gravity-well' },
    { label: 'Resource Alchemy', route: '/resource-alchemy' },
  ],
  '/resource-alchemy': [
    { label: 'Gravity Well', route: '/gravity-well' },
    { label: 'Cryptic Quest', route: '/cryptic-quest' },
    { label: 'Economy & Dust', route: '/economy' },
  ],
  '/gravity-well': [
    { label: 'Resource Alchemy', route: '/resource-alchemy' },
    { label: 'Trade Circle', route: '/trade-circle' },
    { label: 'Liquidity Trader', route: '/liquidity-trader' },
  ],
  '/games': [
    { label: 'Cryptic Quest', route: '/cryptic-quest' },
    { label: 'Resource Alchemy', route: '/resource-alchemy' },
    { label: 'Gravity Well', route: '/gravity-well' },
  ],
  '/nourishment': [
    { label: 'Herbology', route: '/herbology' },
    { label: 'Elixirs', route: '/elixirs' },
    { label: 'Meal Planning', route: '/meal-planning' },
  ],
  '/herbology': [
    { label: 'Aromatherapy', route: '/aromatherapy' },
    { label: 'Elixirs', route: '/elixirs' },
    { label: 'Nourishment', route: '/nourishment' },
  ],
  '/encyclopedia': [
    { label: 'Teachings', route: '/teachings' },
    { label: 'Sacred Texts', route: '/sacred-texts' },
    { label: 'Reading List', route: '/reading-list' },
  ],
  '/community': [
    { label: 'Trade Circle', route: '/trade-circle' },
    { label: 'Blessings', route: '/blessings' },
    { label: 'Council Advisors', route: '/sovereigns' },
  ],
  '/archives': [
    { label: 'Cosmic Ledger', route: '/cosmic-ledger' },
    { label: 'Settings', route: '/settings' },
    { label: 'Economy & Dust', route: '/economy' },
  ],
  '/cosmic-ledger': [
    { label: 'Economy & Dust', route: '/economy' },
    { label: 'Archives & Vault', route: '/archives' },
    { label: 'Trade Circle', route: '/trade-circle' },
  ],
  '/creator-console': [
    { label: 'Master Engine', route: '/master-engine' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
    { label: 'Fabricator', route: '/fabricator' },
    { label: 'Creator Dashboard', route: '/creator' },
    { label: 'Crystal Skins', route: '/crystal-skins' },
    { label: 'Economy & Dust', route: '/economy' },
  ],
  '/master-engine': [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
    { label: 'Fabricator', route: '/fabricator' },
    { label: 'Cosmic Ledger', route: '/cosmic-ledger' },
  ],
  '/cosmic-mixer': [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Master Engine', route: '/master-engine' },
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Frequencies', route: '/frequencies' },
  ],
  '/fabricator': [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Creator Dashboard', route: '/creator' },
    { label: 'Crystal Skins', route: '/crystal-skins' },
    { label: 'Resource Alchemy', route: '/resource-alchemy' },
  ],
  '/creator': [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Fabricator', route: '/fabricator' },
    { label: 'Master Engine', route: '/master-engine' },
    { label: 'Economy & Dust', route: '/economy' },
  ],
  '/suanpan': [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
    { label: 'Frequencies', route: '/frequencies' },
  ],
  '/crystal-skins': [
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Crystals & Stones', route: '/crystals' },
    { label: 'Fabricator', route: '/fabricator' },
    { label: 'Economy & Dust', route: '/economy' },
  ],
  '/frequencies': [
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
    { label: 'Mantras', route: '/mantras' },
    { label: 'Meditation', route: '/meditation' },
  ],
  '/music-lounge': [
    { label: 'Soundscapes', route: '/soundscapes' },
    { label: 'Cosmic Mixer', route: '/cosmic-mixer' },
    { label: 'Frequencies', route: '/frequencies' },
  ],
  '/settings': [
    { label: 'Archives & Vault', route: '/archives' },
    { label: 'Creator Console', route: '/creator-console' },
    { label: 'Cosmic Profile', route: '/cosmic-profile' },
  ],
};

export default function BackToHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRelated, setShowRelated] = useState(false);
  const related = RELATED[location.pathname] || [];

  const isCreatorPage = location.pathname === '/creator-console';

  return (
    <>
      {/* Back + Related */}
      <div className="fixed top-3 left-3 z-50 flex items-center gap-1.5" data-testid="nav-controls">
        <button
          onClick={() => navigate('/sovereign-hub')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(248,250,252,0.6)',
            backdropFilter: 'blur(12px)',
          }}
          data-testid="back-to-hub"
        >
          <ArrowLeft size={13} />
          <span className="text-xs">Hub</span>
        </button>

        {related.length > 0 && (
          <button
            onClick={() => setShowRelated(!showRelated)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl transition-all active:scale-95"
            style={{
              background: showRelated ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.7)',
              border: `1px solid ${showRelated ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
              color: showRelated ? '#C4B5FD' : 'rgba(248,250,252,0.5)',
              backdropFilter: 'blur(12px)',
            }}
            data-testid="related-toggle"
          >
            <motion.div animate={{ rotate: showRelated ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronUp size={13} />
            </motion.div>
            <span className="text-[10px]">Related</span>
          </button>
        )}
      </div>

      {/* Related modules dropdown */}
      <AnimatePresence>
        {showRelated && related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-3 z-50 flex flex-wrap gap-1.5 max-w-[300px]"
            data-testid="related-modules"
          >
            {related.map((item) => (
              <button
                key={item.route}
                onClick={() => { navigate(item.route); setShowRelated(false); }}
                className="px-3 py-1.5 rounded-lg text-[11px] transition-all active:scale-95"
                style={{
                  background: 'rgba(0,0,0,0.85)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  color: 'rgba(248,250,252,0.7)',
                  backdropFilter: 'blur(16px)',
                }}
                data-testid={`related-${item.label.toLowerCase().replace(/[\s&]/g, '-')}`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
