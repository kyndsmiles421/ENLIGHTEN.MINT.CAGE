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
  '/masonry-workbench': [
    { label: 'Carpentry Workshop', route: '/carpentry-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
    { label: 'Workshop', route: '/workshop' },
    { label: 'Trade Circle', route: '/trade-circle' },
  ],
  '/carpentry-workbench': [
    { label: 'Masonry Workshop', route: '/masonry-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
    { label: 'Workshop', route: '/workshop' },
    { label: 'Trade Circle', route: '/trade-circle' },
  ],
  '/trade-passport': [
    { label: 'Masonry Workshop', route: '/masonry-workbench' },
    { label: 'Carpentry Workshop', route: '/carpentry-workbench' },
    { label: 'RPG Character', route: '/rpg' },
    { label: 'Trade Circle', route: '/trade-circle' },
  ],
  '/electrical-workbench': [
    { label: 'Plumbing Workshop', route: '/plumbing-workbench' },
    { label: 'Landscaping Workshop', route: '/landscaping-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
    { label: 'Masonry Workshop', route: '/masonry-workbench' },
  ],
  '/plumbing-workbench': [
    { label: 'Electrical Workshop', route: '/electrical-workbench' },
    { label: 'Landscaping Workshop', route: '/landscaping-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
    { label: 'Carpentry Workshop', route: '/carpentry-workbench' },
  ],
  '/landscaping-workbench': [
    { label: 'Plumbing Workshop', route: '/plumbing-workbench' },
    { label: 'Electrical Workshop', route: '/electrical-workbench' },
    { label: 'Herbology', route: '/herbology' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/nursing-workbench': [
    { label: 'Elderly Care', route: '/eldercare-workbench' },
    { label: 'Child Care', route: '/childcare-workbench' },
    { label: 'Herbology', route: '/herbology' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/eldercare-workbench': [
    { label: 'Nursing Workshop', route: '/nursing-workbench' },
    { label: 'Child Care', route: '/childcare-workbench' },
    { label: 'Meditation', route: '/meditation' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/childcare-workbench': [
    { label: 'Nursing Workshop', route: '/nursing-workbench' },
    { label: 'Elderly Care', route: '/eldercare-workbench' },
    { label: 'Bible Study', route: '/bible-study-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/bible-study-workbench': [
    { label: 'Meditation', route: '/workshop/meditation' },
    { label: 'Oracle', route: '/oracle' },
    { label: 'Child Care', route: '/childcare-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/workshop/welding': [
    { label: 'Masonry Workshop', route: '/masonry-workbench' },
    { label: 'Automotive Workshop', route: '/workshop/automotive' },
    { label: 'Electrical Workshop', route: '/electrical-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/workshop/automotive': [
    { label: 'Welding Workshop', route: '/workshop/welding' },
    { label: 'Electrical Workshop', route: '/electrical-workbench' },
    { label: 'Plumbing Workshop', route: '/plumbing-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/workshop/nutrition': [
    { label: 'Herbology', route: '/herbology' },
    { label: 'Nursing Workshop', route: '/nursing-workbench' },
    { label: 'Meal Planning', route: '/meal-planning' },
    { label: 'Trade Passport', route: '/trade-passport' },
  ],
  '/workshop/meditation': [
    { label: 'Yoga', route: '/yoga' },
    { label: 'Breathing', route: '/breathing' },
    { label: 'Bible Study', route: '/bible-study-workbench' },
    { label: 'Trade Passport', route: '/trade-passport' },
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
      <div className="sticky top-0 left-0 right-0 z-10 flex items-center gap-1.5 px-3 pt-3 pb-2" style={{ background: 'linear-gradient(to bottom, rgba(10,10,18,0.95), rgba(10,10,18,0.8), transparent)' }} data-testid="nav-controls">
        <button
          onClick={() => navigate('/sovereign-hub')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.85)',
            backdropFilter: 'none',
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
              background: showRelated ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.15)',
              border: `1px solid ${showRelated ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
              color: showRelated ? '#C4B5FD' : 'rgba(255,255,255,0.75)',
              backdropFilter: 'none',
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
            className="absolute top-full left-0 mt-2 flex flex-wrap gap-1.5 max-w-[300px]"
            style={{ zIndex: 4 }}
            data-testid="related-modules"
          >
            {related.map((item) => (
              <button
                key={item.route}
                onClick={() => { navigate(item.route); setShowRelated(false); }}
                className="px-3 py-1.5 rounded-lg text-[11px] transition-all active:scale-95"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(139,92,246,0.15)',
                  color: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'none',
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
