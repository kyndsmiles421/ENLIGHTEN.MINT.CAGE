import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory } from '../context/SensoryContext';
import {
  Search, X, Wind, Timer, Sun, Heart, BookOpen, Headphones,
  LayoutDashboard, Zap, Leaf, Radio, Sunrise, Users, Flame,
  Sparkles, Hand, Triangle, Play, GraduationCap, PenTool,
  Lightbulb, Sprout, Music, HeartHandshake, Map, Moon,
  Gamepad2, Globe, Star, Compass, Target, Eye, UtensilsCrossed, Droplets,
  Calendar, BarChart3, Award, Upload, MessageCircle, Orbit, User,
  ArrowUp, ArrowDown, CornerDownLeft, TrendingUp
} from 'lucide-react';

/* ─── Complete searchable index ─── */
const SEARCH_INDEX = [
  // Today
  { path: '/daily-briefing', label: 'Daily Briefing', keywords: 'today daily briefing morning overview cosmic', icon: Sun, category: 'Today', color: '#FCD34D' },
  { path: '/daily-ritual', label: 'My Ritual', keywords: 'today ritual morning routine practice daily', icon: Sparkles, category: 'Today', color: '#FCD34D' },
  { path: '/cosmic-calendar', label: 'Cosmic Calendar', keywords: 'today calendar events celestial moon phases astrology', icon: Calendar, category: 'Today', color: '#FCD34D' },
  { path: '/mood', label: 'Mood Check', keywords: 'today mood tracker emotions feelings check-in', icon: Heart, category: 'Today', color: '#FCD34D' },

  // Practice
  { path: '/breathing', label: 'Breathwork', keywords: 'practice breathwork breathing box wim hof pranayama', icon: Wind, category: 'Practice', color: '#D8B4FE' },
  { path: '/meditation', label: 'Meditation', keywords: 'practice meditation meditate mindfulness timer', icon: Timer, category: 'Practice', color: '#D8B4FE' },
  { path: '/yoga', label: 'Yoga', keywords: 'practice yoga asana poses stretch', icon: Flame, category: 'Practice', color: '#D8B4FE' },
  { path: '/exercises', label: 'Qigong & Tai Chi', keywords: 'practice exercises qigong tai chi energy cultivation movement', icon: Zap, category: 'Practice', color: '#D8B4FE' },
  { path: '/mudras', label: 'Mudras', keywords: 'practice mudras hand gestures resonance sacred alignment', icon: Hand, category: 'Practice', color: '#D8B4FE' },
  { path: '/mantras', label: 'Mantras', keywords: 'practice mantras chanting sacred sound vibration', icon: Music, category: 'Practice', color: '#D8B4FE' },
  { path: '/light-therapy', label: 'Light Resonance', keywords: 'practice light resonance chromatic color frequency alignment', icon: Lightbulb, category: 'Practice', color: '#D8B4FE' },
  { path: '/affirmations', label: 'Affirmations', keywords: 'practice affirmations positive mantras self love', icon: Sun, category: 'Practice', color: '#D8B4FE' },
  { path: '/rituals', label: 'Sacred Rituals', keywords: 'practice rituals sacred ceremony daily', icon: Sunrise, category: 'Practice', color: '#D8B4FE' },
  { path: '/yantra', label: 'Yantras', keywords: 'practice yantra sacred geometry diagram meditation', icon: Triangle, category: 'Practice', color: '#D8B4FE' },
  { path: '/tantra', label: 'Tantra', keywords: 'practice tantra energy consciousness expand', icon: Flame, category: 'Practice', color: '#D8B4FE' },
  { path: '/hooponopono', label: "Ho'oponopono", keywords: 'practice hooponopono hawaiian forgiveness alignment love', icon: HeartHandshake, category: 'Practice', color: '#D8B4FE' },

  // Divination
  { path: '/oracle', label: 'Oracle', keywords: 'divination oracle tarot i ching astrology cards reading', icon: Sparkles, category: 'Divination', color: '#E879F9' },
  { path: '/star-chart', label: 'Star Chart', keywords: 'divination star chart constellations sky map astronomy 3d', icon: Star, category: 'Divination', color: '#E879F9' },
  { path: '/forecasts', label: 'Forecasts', keywords: 'divination forecasts horoscope astrology predictions zodiac', icon: Eye, category: 'Divination', color: '#E879F9' },
  { path: '/numerology', label: 'Numerology', keywords: 'divination numerology numbers life path destiny', icon: Star, category: 'Divination', color: '#E879F9' },
  { path: '/cardology', label: 'Cardology', keywords: 'divination cardology playing cards destiny', icon: Star, category: 'Divination', color: '#E879F9' },
  { path: '/mayan', label: 'Mayan Astrology', keywords: 'divination mayan astrology calendar tzolkin', icon: Compass, category: 'Divination', color: '#E879F9' },
  { path: '/dreams', label: 'Dream Journal', keywords: 'divination dreams journal interpretation sleep', icon: Moon, category: 'Divination', color: '#E879F9' },
  { path: '/animal-totems', label: 'Animal Totems', keywords: 'divination animal totems spirit guide power', icon: Leaf, category: 'Divination', color: '#E879F9' },
  { path: '/cosmic-profile', label: 'Cosmic Profile', keywords: 'divination cosmic profile analytics zodiac chart', icon: BarChart3, category: 'Divination', color: '#E879F9' },

  // Sanctuary
  { path: '/zen-garden', label: 'Zen Garden', keywords: 'sanctuary zen garden plants koi fish lanterns peaceful', icon: Sprout, category: 'Sanctuary', color: '#2DD4BF' },
  { path: '/soundscapes', label: 'Soundscapes', keywords: 'sanctuary soundscapes ambient sounds nature rain ocean', icon: Headphones, category: 'Sanctuary', color: '#2DD4BF' },
  { path: '/frequencies', label: 'Frequencies', keywords: 'sanctuary frequencies solfeggio binaural hz resonance tones', icon: Radio, category: 'Sanctuary', color: '#2DD4BF' },
  { path: '/vr', label: 'VR Sanctuary', keywords: 'sanctuary vr virtual reality immersive 3d experience', icon: Orbit, category: 'Sanctuary', color: '#2DD4BF' },
  { path: '/journal', label: 'Journal', keywords: 'sanctuary journal writing thoughts reflection diary', icon: BookOpen, category: 'Sanctuary', color: '#2DD4BF' },
  { path: '/wisdom-journal', label: 'Wisdom Log', keywords: 'sanctuary wisdom journal log insights', icon: PenTool, category: 'Sanctuary', color: '#2DD4BF' },
  { path: '/green-journal', label: 'Green Log', keywords: 'sanctuary green journal nature eco plant log', icon: Sprout, category: 'Sanctuary', color: '#2DD4BF' },

  // Nourish
  { path: '/nourishment', label: 'Nourishment', keywords: 'nourish nourishment food recipes golden milk energy', icon: Leaf, category: 'Nourish', color: '#22C55E' },
  { path: '/aromatherapy', label: 'Aromatic Resonance', keywords: 'nourish aromatic resonance essential oils scent smell', icon: Droplets, category: 'Nourish', color: '#22C55E' },
  { path: '/herbology', label: 'Herbology', keywords: 'nourish herbology herbs plants botanical herbal', icon: Leaf, category: 'Nourish', color: '#22C55E' },
  { path: '/elixirs', label: 'Elixirs', keywords: 'nourish elixirs drinks potions recipes', icon: Flame, category: 'Nourish', color: '#22C55E' },
  { path: '/meal-planning', label: 'Meal Planning', keywords: 'nourish meal planning food diet nutrition', icon: UtensilsCrossed, category: 'Nourish', color: '#22C55E' },
  { path: '/acupressure', label: 'Acupressure', keywords: 'nourish acupressure pressure points alignment body', icon: Target, category: 'Nourish', color: '#22C55E' },
  { path: '/reiki', label: 'Reiki & Aura', keywords: 'nourish reiki aura energy alignment chakra resonance', icon: Eye, category: 'Nourish', color: '#22C55E' },

  // Explore
  { path: '/creation-stories', label: 'Creation Stories', keywords: 'explore creation stories myths cultures world origins', icon: Globe, category: 'Explore', color: '#FB923C' },
  { path: '/teachings', label: 'Teachings', keywords: 'explore teachings wisdom teachers philosophy', icon: BookOpen, category: 'Explore', color: '#FB923C' },
  { path: '/learn', label: 'Learn', keywords: 'explore learn modules progressive education', icon: GraduationCap, category: 'Explore', color: '#FB923C' },
  { path: '/journey', label: 'Journey', keywords: 'explore journey beginner guided pathway onboarding', icon: Map, category: 'Explore', color: '#FB923C' },
  { path: '/discover', label: 'Try Something New', keywords: 'explore discover try new random suggestion', icon: Compass, category: 'Explore', color: '#FB923C' },
  { path: '/games', label: 'Games', keywords: 'explore games mindful fun play focus', icon: Gamepad2, category: 'Explore', color: '#FB923C' },
  { path: '/videos', label: 'Videos', keywords: 'explore videos guided practices watch', icon: Play, category: 'Explore', color: '#FB923C' },
  { path: '/classes', label: 'Classes', keywords: 'explore classes courses structured learning', icon: GraduationCap, category: 'Explore', color: '#FB923C' },
  { path: '/community', label: 'Community', keywords: 'explore community feed share connect inspire social', icon: Users, category: 'Explore', color: '#FB923C' },
  { path: '/trade-circle', label: 'Trade Circle', keywords: 'trade barter exchange goods services swap marketplace', icon: HeartHandshake, category: 'Explore', color: '#FB923C' },
  { path: '/friends', label: 'Friends', keywords: 'explore friends challenges social connect', icon: Users, category: 'Explore', color: '#FB923C' },
  { path: '/challenges', label: 'Challenges', keywords: 'explore challenges daily streak xp gamification', icon: Flame, category: 'Explore', color: '#FB923C' },
  { path: '/create', label: 'Create', keywords: 'explore create write meditation affirmation custom', icon: PenTool, category: 'Explore', color: '#FB923C' },

  // Sage
  { path: '/coach', label: 'Sage AI Coach', keywords: 'sage coach ai spiritual guidance voice conversation wisdom', icon: MessageCircle, category: 'Sage', color: '#38BDF8' },

  // Profile
  { path: '/dashboard', label: 'Dashboard', keywords: 'dashboard home stats streak overview', icon: LayoutDashboard, category: 'Profile', color: '#D8B4FE' },
  { path: '/profile', label: 'Profile', keywords: 'profile account settings user info', icon: User, category: 'Profile', color: '#D8B4FE' },
  { path: '/avatar', label: 'Avatar', keywords: 'avatar creator 3d character customize', icon: Sparkles, category: 'Profile', color: '#D8B4FE' },
  { path: '/wellness-reports', label: 'Wellness Reports', keywords: 'wellness reports analytics progress tracking', icon: BarChart3, category: 'Profile', color: '#D8B4FE' },
  { path: '/analytics', label: 'Analytics & Achievements', keywords: 'analytics achievements badges streaks coherence journey activity trends', icon: TrendingUp, category: 'Profile', color: '#D8B4FE' },
  { path: '/certifications', label: 'Certifications', keywords: 'certifications achievements badges earned', icon: Award, category: 'Profile', color: '#D8B4FE' },
  { path: '/meditation-history', label: 'Meditation History', keywords: 'meditation history sessions log time', icon: Timer, category: 'Profile', color: '#D8B4FE' },
  { path: '/media-library', label: 'My Media', keywords: 'media library uploads files images', icon: Upload, category: 'Profile', color: '#D8B4FE' },
  { path: '/tutorial', label: 'Tutorial', keywords: 'tutorial guide walkthrough help onboarding', icon: GraduationCap, category: 'Profile', color: '#D8B4FE' },
];

export default function SearchCommand({ open, onClose }) {
  const navigate = useNavigate();
  const { playClick, prefs } = useSensory();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const isLight = prefs.theme === 'light';

  /* Filter results */
  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX;
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [query]);

  /* Group by category */
  const grouped = useMemo(() => {
    const groups = {};
    results.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [results]);

  /* Flat list for keyboard navigation */
  const flatResults = useMemo(() => {
    const flat = [];
    Object.values(grouped).forEach(items => flat.push(...items));
    return flat;
  }, [grouped]);

  /* Auto-focus input */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* Scroll active item into view */
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-search-idx="${activeIdx}"]`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  /* Keyboard handler */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[activeIdx]) {
      e.preventDefault();
      navigate(flatResults[activeIdx].path);
      playClick();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [flatResults, activeIdx, navigate, playClick, onClose]);

  /* Reset active index on query change */
  useEffect(() => { setActiveIdx(0); }, [query]);

  const selectItem = (item) => {
    navigate(item.path);
    playClick();
    onClose();
  };

  if (!open) return null;

  let flatIdx = -1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
        style={{ background: 'transparent', backdropFilter: 'none'}}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        data-testid="search-overlay"
      >
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-xl rounded-2xl overflow-hidden"
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(13, 14, 26, 0.97)',
            border: `1px solid ${isLight ? 'rgba(30,27,46,0.1)' : 'rgba(192,132,252,0.1)'}`,
            boxShadow: isLight ? '0 24px 60px rgba(30,27,46,0.15)' : '0 24px 80px rgba(0,0,0,0.15), 0 0 60px rgba(192,132,252,0.04)',
          }}
          data-testid="search-palette"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }}>
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search features, tools, pages..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              data-testid="search-input"
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono"
              style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
              esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" data-testid="search-results">
            {flatResults.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</p>
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="mb-1">
                  <p className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: items[0]?.color || 'var(--text-muted)' }}>
                    {category}
                  </p>
                  {items.map(item => {
                    flatIdx++;
                    const idx = flatIdx;
                    const Icon = item.icon;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={item.path}
                        data-search-idx={idx}
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-100"
                        style={{
                          background: isActive ? (isLight ? 'rgba(124,58,237,0.06)' : 'rgba(192,132,252,0.08)') : 'transparent',
                          color: isActive ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-secondary)',
                        }}
                        data-testid={`search-result-${item.path.slice(1)}`}
                      >
                        <Icon size={15} style={{ color: isActive ? item.color : 'var(--text-muted)', flexShrink: 0 }} />
                        <span className="text-sm flex-1">{item.label}</span>
                        {isActive && (
                          <CornerDownLeft size={12} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                <kbd className="flex items-center justify-center w-5 h-5 rounded text-[10px]"
                  style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
                  <ArrowUp size={9} />
                </kbd>
                <kbd className="flex items-center justify-center w-5 h-5 rounded text-[10px]"
                  style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
                  <ArrowDown size={9} />
                </kbd>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="flex items-center justify-center px-1.5 h-5 rounded text-[10px]"
                style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
                <CornerDownLeft size={9} />
              </kbd>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Open</span>
            </div>
            <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
              {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
