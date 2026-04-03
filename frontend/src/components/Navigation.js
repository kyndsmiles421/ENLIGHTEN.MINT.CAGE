import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind, Timer, Sun, Heart, BookOpen, Headphones,
  LayoutDashboard, LogOut, LogIn, Menu, X, Zap, Leaf, Radio,
  Sunrise, Users, Flame, Sparkles, User, Hand, Triangle,
  Play, GraduationCap, ChevronDown, PenTool,
  Volume2, VolumeX, Lightbulb, Sprout, Music, HeartHandshake, Map, Moon,
  Gamepad2, Globe, Star, Compass, Target, Eye, UtensilsCrossed, Droplets,
  Calendar, BarChart3, Award, Upload, MessageCircle, Orbit, Search, Bell, TrendingUp,
  CreditCard, Crown, Settings, Gem, Link2, FileText, MapPin
} from 'lucide-react';
import SearchCommand from './SearchCommand';
import ShareButton from './ShareButton';
import { SplitScreenLauncher } from './SplitScreen';
import NotificationSettings from './NotificationSettings';
import { useResolution } from '../context/ResolutionContext';
import { setAmbientEnabled, getAmbientEnabled } from '../hooks/useAmbientSoundscape';
import { ImmersionToggle } from './ImmersionToggle';
import { useCreditsContext } from '../context/CreditContext';
import { useAvatar } from '../context/AvatarContext';
import DevConsole, { useTripleTap } from './DevConsole';
import FidelityHUD from './FidelityHUD';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* Soundscape on/off toggle */
function SoundscapeToggle() {
  const [on, setOn] = React.useState(getAmbientEnabled());
  const toggle = () => {
    const next = !on;
    setOn(next);
    setAmbientEnabled(next);
  };
  return (
    <button onClick={toggle}
      className="p-2 rounded-full transition-all duration-300 relative"
      style={{ color: on ? '#2DD4BF' : 'var(--text-muted)', background: on ? 'rgba(45,212,191,0.1)' : 'transparent' }}
      data-testid="nav-soundscape-toggle"
      title={on ? 'Celestial Soundscape on' : 'Celestial Soundscape off'}>
      <Music size={14} />
      {on && (
        <motion.div className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ border: '1px solid rgba(45,212,191,0.4)' }} />
      )}
    </button>
  );
}

/* ─── Category definitions ─── */
const NAV_CATEGORIES = [
  {
    id: 'today', label: 'Today', icon: Sun, color: '#FCD34D',
    items: [
      { path: '/daily-briefing', label: 'Daily Briefing', icon: Sun },
      { path: '/daily-ritual', label: 'My Ritual', icon: Sparkles },
      { path: '/growth-timeline', label: 'Growth Timeline', icon: BarChart3 },
      { path: '/soul-reports', label: 'Soul Reports', icon: FileText },
      { path: '/cosmic-calendar', label: 'Cosmic Calendar', icon: Calendar },
      { path: '/mood', label: 'Mood Check', icon: Heart },
    ],
  },
  {
    id: 'practice', label: 'Practice', icon: Wind, color: '#D8B4FE',
    items: [
      { path: '/breathing', label: 'Breathwork', icon: Wind },
      { path: '/meditation', label: 'Meditation', icon: Timer },
      { path: '/yoga', label: 'Yoga', icon: Flame },
      { path: '/exercises', label: 'Qigong & Tai Chi', icon: Zap },
      { path: '/mudras', label: 'Mudras', icon: Hand },
      { path: '/mantras', label: 'Mantras', icon: Music },
      { path: '/light-therapy', label: 'Light Therapy', icon: Lightbulb },
      { path: '/affirmations', label: 'Affirmations', icon: Sun },
      { path: '/rituals', label: 'Sacred Rituals', icon: Sunrise },
      { path: '/yantra', label: 'Yantras', icon: Triangle },
      { path: '/tantra', label: 'Tantra', icon: Flame },
      { path: '/hooponopono', label: "Ho'oponopono", icon: HeartHandshake },
    ],
  },
  {
    id: 'divination', label: 'Divination', icon: Eye, color: '#E879F9',
    items: [
      { path: '/oracle', label: 'Oracle', icon: Sparkles },
      { path: '/akashic-records', label: 'Akashic Records', icon: BookOpen },
      { path: '/star-chart', label: 'Star Chart', icon: Star },
      { path: '/forecasts', label: 'Forecasts', icon: Eye },
      { path: '/numerology', label: 'Numerology', icon: Star },
      { path: '/cardology', label: 'Cardology', icon: Star },
      { path: '/mayan', label: 'Mayan Astrology', icon: Compass },
      { path: '/dreams', label: 'Dream Journal', icon: Moon },
      { path: '/animal-totems', label: 'Animal Totems', icon: Leaf },
      { path: '/cosmic-profile', label: 'Cosmic Profile', icon: BarChart3 },
    ],
  },
  {
    id: 'sanctuary', label: 'Sanctuary', icon: Sprout, color: '#2DD4BF',
    items: [
      { path: '/zen-garden', label: 'Zen Garden', icon: Sprout },
      { path: '/soundscapes', label: 'Soundscapes', icon: Headphones },
      { path: '/music-lounge', label: 'Music Lounge', icon: Music },
      { path: '/dance-music', label: 'Dance & Music Studio', icon: Music },
      { path: '/my-creations', label: 'My Creations', icon: Music },
      { path: '/frequencies', label: 'Frequencies', icon: Radio },
      { path: '/theory', label: 'Conservatory', icon: GraduationCap },
      { path: '/vr', label: 'VR Sanctuary', icon: Orbit },
      { path: '/journal', label: 'Journal', icon: BookOpen },
      { path: '/wisdom-journal', label: 'Wisdom Log', icon: PenTool },
      { path: '/green-journal', label: 'Green Log', icon: Sprout },
    ],
  },
  {
    id: 'nourish', label: 'Nourish', icon: Leaf, color: '#22C55E',
    items: [
      { path: '/nourishment', label: 'Nourishment', icon: Leaf },
      { path: '/aromatherapy', label: 'Aromatherapy', icon: Droplets },
      { path: '/herbology', label: 'Herbology', icon: Leaf },
      { path: '/elixirs', label: 'Elixirs', icon: Flame },
      { path: '/meal-planning', label: 'Meal Planning', icon: UtensilsCrossed },
      { path: '/acupressure', label: 'Acupressure', icon: Target },
      { path: '/reiki', label: 'Reiki & Aura', icon: Eye },
    ],
  },
  {
    id: 'explore', label: 'Explore', icon: Compass, color: '#FB923C',
    items: [
      { path: '/encyclopedia', label: 'Sacred Encyclopedia', icon: Globe },
      { path: '/reading-list', label: 'Spiritual Reading List', icon: BookOpen },
      { path: '/creation-stories', label: 'Myths & Legends', icon: Globe },
      { path: '/sacred-texts', label: 'Sacred Texts', icon: BookOpen },
      { path: '/bible', label: 'Sacred Scriptures', icon: BookOpen },
      { path: '/teachings', label: 'Teachings', icon: BookOpen },
      { path: '/learn', label: 'Learn', icon: GraduationCap },
      { path: '/journey', label: 'Journey', icon: Map },
      { path: '/discover', label: 'Try Something New', icon: Compass },
      { path: '/games', label: 'Games', icon: Gamepad2 },
      { path: '/videos', label: 'Videos', icon: Play },
      { path: '/classes', label: 'Classes', icon: GraduationCap },
      { path: '/community', label: 'Community', icon: Users },
      { path: '/trade-circle', label: 'Trade Circle', icon: HeartHandshake },
      { path: '/hotspots', label: 'Energy Hotspots', icon: MapPin },
      { path: '/cosmic-map', label: 'Cosmic Map', icon: Map },
      { path: '/crystals', label: 'Crystals & Stones', icon: Gem },
      { path: '/entanglement', label: 'Entanglement', icon: Link2 },
      { path: '/blessings', label: 'Send a Blessing', icon: Heart },
      { path: '/live', label: 'Live Sessions', icon: Radio },
      { path: '/friends', label: 'Friends', icon: Users },
      { path: '/challenges', label: 'Challenges', icon: Flame },
      { path: '/create', label: 'Create', icon: PenTool },
      { path: '/workshop', label: 'Architect\'s Workshop', icon: Compass },
    ],
  },
];

const PROFILE_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/pricing', label: 'Subscription', icon: Crown },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/avatar', label: 'Avatar', icon: Sparkles },
  { path: '/wellness-reports', label: 'Wellness Reports', icon: BarChart3 },
  { path: '/certifications', label: 'Certifications', icon: Award },
  { path: '/meditation-history', label: 'Med. History', icon: Timer },
  { path: '/media-library', label: 'My Media', icon: Upload },
  { path: '/tutorial', label: 'Tutorial', icon: GraduationCap },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const CREATOR_ITEM = { path: '/creator', label: 'Creator Studio', icon: Crown };

const ALL_PATHS = NAV_CATEGORIES.flatMap(c => c.items.map(i => i.path));

/* ─── Mega Menu Dropdown (Desktop) ─── */
function MegaDropdown({ category, onClose }) {
  const location = useLocation();
  const { playClick, prefs } = useSensory();
  const cols = category.items.length > 6 ? 'grid-cols-2' : 'grid-cols-1';
  const isLight = prefs.theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-2xl overflow-hidden"
      style={{
        background: isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(13, 14, 26, 0.96)',
        border: `1px solid ${isLight ? 'rgba(30,27,46,0.08)' : 'rgba(192,132,252,0.08)'}`,
        backdropFilter: 'blur(32px)',
        boxShadow: isLight
          ? '0 16px 48px rgba(30,27,46,0.12), 0 0 0 1px rgba(30,27,46,0.04)'
          : '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(192,132,252,0.04)',
        minWidth: category.items.length > 6 ? '340px' : '200px',
      }}
      data-testid={`mega-menu-${category.id}`}
    >
      <div className="px-3 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 mb-1" style={{ color: category.color }}>
          {category.label}
        </p>
      </div>
      <div className={`grid ${cols} gap-0.5 p-2`}>
        {category.items.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { onClose(); playClick(); }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'}`}
              style={{
                color: active ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-secondary)',
                background: active ? (isLight ? 'rgba(124,58,237,0.06)' : 'rgba(192,132,252,0.08)') : 'transparent',
              }}
              data-testid={`nav-item-${item.path.slice(1)}`}
            >
              <Icon size={14} style={active ? { color: category.color, filter: `drop-shadow(0 0 4px ${category.color}80)` } : { color: 'var(--text-muted)' }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Category Button (Desktop) ─── */
function CategoryButton({ category, isOpen, onOpen, onClose }) {
  const location = useLocation();
  const { playClick, prefs } = useSensory();
  const timeoutRef = useRef(null);
  const Icon = category.icon;
  const hasActiveChild = category.items.some(i => location.pathname === i.path);
  const isLight = prefs.theme === 'light';

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    onOpen();
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(onClose, 200);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => { isOpen ? onClose() : onOpen(); playClick(); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all duration-300"
        style={{
          color: hasActiveChild || isOpen ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-muted)',
          background: hasActiveChild ? `${category.color}12` : isOpen ? (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)') : 'transparent',
        }}
        data-testid={`nav-cat-${category.id}`}
      >
        <Icon size={13} style={hasActiveChild ? { color: category.color } : {}} />
        <span>{category.label}</span>
        <ChevronDown size={10} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
      </button>
      <AnimatePresence>
        {isOpen && <MegaDropdown category={category} onClose={onClose} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile Accordion Category ─── */
function MobileCategory({ category, expanded, onToggle, onNavigate }) {
  const location = useLocation();
  const { prefs } = useSensory();
  const Icon = category.icon;
  const hasActiveChild = category.items.some(i => location.pathname === i.path);
  const isLight = prefs.theme === 'light';

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
        style={{
          color: hasActiveChild ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-secondary)',
          background: expanded ? (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)') : 'transparent',
        }}
        data-testid={`mobile-cat-${category.id}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${category.color}10` }}>
            <Icon size={16} style={{ color: category.color }} />
          </div>
          <span className="text-sm font-medium">{category.label}</span>
          {hasActiveChild && <div className="w-1.5 h-1.5 rounded-full" style={{ background: category.color }} />}
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1 px-2 py-2">
              {category.items.map(item => {
                const ItemIcon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all"
                    style={{
                      color: active ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-muted)',
                      background: active ? `${category.color}12` : 'transparent',
                    }}
                  >
                    <ItemIcon size={13} style={active ? { color: category.color } : {}} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Navigation ─── */
export default function Navigation() {
  const { user, logout, authHeaders } = useAuth();
  const { ambientOn, toggleAmbient, playClick, prefs } = useSensory();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [mobileCat, setMobileCat] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [inboxNotifs, setInboxNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { creditInfo } = useCreditsContext();
  const { avatarB64 } = useAvatar();
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const profileTimeout = useRef(null);
  const isLight = prefs.theme === 'light';
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const handleTripleTap = useTripleTap(() => setDevConsoleOpen(prev => !prev));
  const { level: resLevel, cycleResolution, config: resConfig } = useResolution();

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Cmd+K / Ctrl+K shortcut */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); setMobileCat(null); }, [location.pathname]);

  /* Fetch in-app notifications */
  useEffect(() => {
    if (!user) return;
    const fetchInbox = () => {
      axios.get(`${API}/notifications/inbox`, { headers: authHeaders })
        .then(r => { setInboxNotifs(r.data.notifications || []); setUnreadCount(r.data.unread_count || 0); })
        .catch(() => {});
    };
    fetchInbox();
    const iv = setInterval(fetchInbox, 30000);
    return () => clearInterval(iv);
  }, [user, authHeaders]);

  /* Hide nav on landing, auth, VR, hub */
  if (location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/vr' || location.pathname === '/intro' || location.pathname === '/hub') return null;

  const isSageActive = location.pathname === '/coach';

  return (
    <div data-testid="cosmic-navigation">
      {/* ═══ Desktop Nav ═══ */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-5 py-2.5"
        style={{
          background: isLight ? 'rgba(248, 246, 243, 0.88)' : 'rgba(11, 12, 21, 0.8)',
          backdropFilter: 'blur(28px)',
          borderBottom: `1px solid ${isLight ? 'rgba(30,27,46,0.06)' : 'rgba(192,132,252,0.05)'}`,
        }}
        data-testid="desktop-nav"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group" data-testid="nav-logo"
          onClick={(e) => { e.preventDefault(); handleTripleTap(); playClick(); }}
          onDoubleClick={(e) => e.preventDefault()}>
          <div className="w-7 h-7 rounded-full animate-orbit-glow relative"
            style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }}>
            <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ opacity: 0.4 }} />
          </div>
          <span className="group-hover:animate-text-shimmer transition-all text-sm" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Cosmic Collective
          </span>
        </Link>

        {/* Category Menus */}
        <div className="flex items-center gap-0.5">
          {NAV_CATEGORIES.map(cat => (
            <CategoryButton
              key={cat.id}
              category={cat}
              isOpen={openCat === cat.id}
              onOpen={() => setOpenCat(cat.id)}
              onClose={() => setOpenCat(null)}
            />
          ))}
          {/* Sage — Direct Link */}
          <Link
            to="/coach"
            onClick={playClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ml-1"
            style={{
              color: isSageActive ? '#fff' : '#2DD4BF',
              background: isSageActive ? 'rgba(45,212,191,0.15)' : 'rgba(45,212,191,0.06)',
              border: '1px solid rgba(45,212,191,0.12)',
            }}
            data-testid="nav-sage"
          >
            <MessageCircle size={13} />
            <span className="font-medium">Sage</span>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Search */}
          <button
            onClick={() => { setSearchOpen(true); playClick(); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs transition-all duration-300 hover:bg-white/[0.04]"
            style={{ color: 'var(--text-muted)' }}
            data-testid="nav-search-btn"
          >
            <Search size={13} />
            <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono"
              style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}` }}>
              &#8984;K
            </kbd>
          </button>

          {/* Share */}
          <ShareButton />

          {/* Split Screen */}
          <SplitScreenLauncher />

          {/* Immersion Level */}
          <ImmersionToggle />

          {/* Fidelity HUD Boost */}
          {user && <FidelityHUD authHeaders={authHeaders} />}

          {/* Ambient Toggle */}
          <button
            onClick={toggleAmbient}
            className="p-2 rounded-full transition-all duration-300 relative"
            style={{
              color: ambientOn ? 'var(--primary)' : 'var(--text-muted)',
              background: ambientOn ? 'rgba(192,132,252,0.1)' : 'transparent',
            }}
            data-testid="nav-ambient-toggle"
            title={ambientOn ? 'Ambient on' : 'Ambient off'}
          >
            {ambientOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {ambientOn && (
              <motion.div className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ border: '1px solid var(--primary)' }} />
            )}
          </button>

          {/* Celestial Soundscape Toggle */}
          <SoundscapeToggle />

          {/* Notification Bell */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); playClick(); }}
                className="p-2 rounded-full transition-all duration-300 relative"
                style={{
                  color: notifOpen ? '#C084FC' : 'var(--text-muted)',
                  background: notifOpen ? 'rgba(192,132,252,0.1)' : 'transparent',
                }}
                data-testid="nav-notification-btn"
                title="Notifications"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ background: '#EF4444', color: '#fff' }} data-testid="notif-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <div className="absolute top-full right-0 mt-2 z-[100]">
                    <NotificationInbox
                      notifications={inboxNotifs}
                      onClose={() => setNotifOpen(false)}
                      onMarkRead={(id) => {
                        axios.post(`${API}/notifications/read/${id}`, {}, { headers: authHeaders }).catch(() => {});
                        setInboxNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                        setUnreadCount(prev => Math.max(0, prev - 1));
                      }}
                      onMarkAllRead={() => {
                        axios.post(`${API}/notifications/read-all`, {}, { headers: authHeaders }).catch(() => {});
                        setInboxNotifs(prev => prev.map(n => ({ ...n, read: true })));
                        setUnreadCount(0);
                      }}
                      navigate={navigate}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Credits & Upgrade */}
          {user && creditInfo && (
            <Link
              to="/pricing"
              onClick={playClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] transition-all hover:scale-105"
              style={{
                background: creditInfo.is_admin
                  ? 'rgba(234,179,8,0.08)'
                  : creditInfo.credits_per_month === -1 && creditInfo.subscription_active
                    ? 'rgba(192,132,252,0.08)'
                    : creditInfo.balance <= 10
                      ? 'rgba(239,68,68,0.08)'
                      : 'rgba(45,212,191,0.08)',
                color: creditInfo.is_admin
                  ? '#EAB308'
                  : creditInfo.credits_per_month === -1 && creditInfo.subscription_active
                    ? '#C084FC'
                    : creditInfo.balance <= 10
                      ? '#EF4444'
                      : '#2DD4BF',
                border: `1px solid ${creditInfo.is_admin ? 'rgba(234,179,8,0.15)' : creditInfo.credits_per_month === -1 && creditInfo.subscription_active ? 'rgba(192,132,252,0.15)' : creditInfo.balance <= 10 ? 'rgba(239,68,68,0.12)' : 'rgba(45,212,191,0.12)'}`,
              }}
              data-testid="nav-credits-badge"
            >
              {creditInfo.is_admin ? (
                <>
                  <Crown size={10} />
                  <span>Creator</span>
                </>
              ) : creditInfo.credits_per_month === -1 && creditInfo.subscription_active ? (
                <>
                  <Crown size={10} />
                  <span>{creditInfo.tier_name}</span>
                </>
              ) : (
                <>
                  <CreditCard size={10} />
                  <span>{creditInfo.balance}</span>
                </>
              )}
            </Link>
          )}

          {/* User Area */}
          {user ? (
            <div className="relative" ref={profileRef}
              onMouseEnter={() => { clearTimeout(profileTimeout.current); setProfileOpen(true); }}
              onMouseLeave={() => { profileTimeout.current = setTimeout(() => setProfileOpen(false), 200); }}
            >
              <button
                onClick={() => { setProfileOpen(!profileOpen); playClick(); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all duration-300"
                style={{
                  color: profileOpen ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-secondary)',
                  background: profileOpen ? (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(192,132,252,0.1)') : 'transparent',
                }}
                data-testid="nav-profile-btn"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold overflow-hidden"
                  style={{ background: avatarB64 ? 'transparent' : 'rgba(192,132,252,0.2)', color: '#D8B4FE' }}>
                  {avatarB64 ? (
                    <img src={`data:image/png;base64,${avatarB64}`} alt="" className="w-full h-full object-cover" data-testid="nav-avatar-img" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <span className="max-w-[60px] truncate">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={10} style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden"
                    style={{
                      background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(13, 14, 26, 0.96)',
                      border: `1px solid ${isLight ? 'rgba(30,27,46,0.08)' : 'rgba(192,132,252,0.08)'}`,
                      backdropFilter: 'blur(32px)',
                      boxShadow: isLight ? '0 16px 48px rgba(30,27,46,0.12)' : '0 24px 80px rgba(0,0,0,0.5)',
                    }}
                    data-testid="nav-profile-dropdown"
                  >
                    <div className="py-1.5">
                      {/* Creator Studio — only for admin */}
                      {creditInfo?.is_admin && (() => {
                        const CIcon = CREATOR_ITEM.icon;
                        const cActive = location.pathname === CREATOR_ITEM.path;
                        return (
                          <>
                            <Link
                              to={CREATOR_ITEM.path}
                              onClick={() => { setProfileOpen(false); playClick(); }}
                              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'}`}
                              style={{ color: '#EAB308', background: cActive ? 'rgba(234,179,8,0.08)' : 'transparent' }}
                              data-testid="nav-creator-link"
                            >
                              <CIcon size={13} style={{ color: '#EAB308' }} />
                              <span className="font-medium">{CREATOR_ITEM.label}</span>
                            </Link>
                            <div className="my-1 mx-3 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(234,179,8,0.08)' }} />
                          </>
                        );
                      })()}
                      {PROFILE_ITEMS.map(item => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => { setProfileOpen(false); playClick(); }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'}`}
                            style={{ color: active ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-secondary)', background: active ? (isLight ? 'rgba(124,58,237,0.06)' : 'rgba(192,132,252,0.08)') : 'transparent' }}
                          >
                            <Icon size={13} style={active ? { color: 'var(--primary)' } : { color: 'var(--text-muted)' }} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      <div className="my-1 mx-3 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} />

                      {/* Resolution Nodule */}
                      {(() => {
                          const levelColors = { low: '#60A5FA', medium: '#FBBF24', high: '#A78BFA' };
                          const c = levelColors[resLevel];
                          return (
                            <button
                              onClick={(e) => { e.stopPropagation(); cycleResolution(); }}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'}`}
                              data-testid="resolution-nodule">
                              <div className="relative w-3.5 h-3.5">
                                {/* Seed of Life geometry */}
                                <svg viewBox="0 0 24 24" width={14} height={14}>
                                  <circle cx="12" cy="12" r="4" fill="none" stroke={c} strokeWidth="1" opacity={resLevel === 'low' ? 0.3 : 0.6} />
                                  {resLevel !== 'low' && <circle cx="12" cy="8" r="4" fill="none" stroke={c} strokeWidth="0.5" opacity="0.3" />}
                                  {resLevel === 'high' && (
                                    <>
                                      <circle cx="15.5" cy="14" r="4" fill="none" stroke={c} strokeWidth="0.5" opacity="0.3" />
                                      <circle cx="8.5" cy="14" r="4" fill="none" stroke={c} strokeWidth="0.5" opacity="0.3" />
                                    </>
                                  )}
                                </svg>
                              </div>
                              <div className="flex-1 text-left">
                                <span style={{ color: c }}>{resConfig.label}</span>
                                <span className="ml-1.5 text-[9px]" style={{ color: 'var(--text-muted)' }}>{resConfig.sublabel}</span>
                              </div>
                            </button>
                          );
                      })()}

                      <div className="my-1 mx-3 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} />
                      <button
                        onClick={() => { logout(); navigate('/'); setProfileOpen(false); playClick(); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'}`}
                        style={{ color: 'var(--text-muted)' }}
                        data-testid="nav-logout"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={playClick}
              className="btn-glass text-xs px-4 py-2"
              data-testid="nav-signin"
            >
              <LogIn size={12} className="inline mr-1.5" />
              Begin Journey
            </Link>
          )}
        </div>
      </nav>

      {/* ═══ Mobile Nav Bar ═══ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: isLight ? 'rgba(248, 246, 243, 0.88)' : 'rgba(11, 12, 21, 0.85)',
          backdropFilter: 'blur(28px)',
          borderBottom: `1px solid ${isLight ? 'rgba(30,27,46,0.06)' : 'rgba(192,132,252,0.05)'}`,
        }}
      >
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo-mobile" onClick={playClick}>
          <div className="w-7 h-7 rounded-full animate-orbit-glow" style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Cosmic Collective</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSearchOpen(true); playClick(); }} className="p-2 rounded-full" style={{ color: 'var(--text-muted)' }} data-testid="nav-search-btn-mobile">
            <Search size={18} />
          </button>
          <button onClick={toggleAmbient} className="p-2 rounded-full" style={{ color: ambientOn ? 'var(--primary)' : 'var(--text-muted)' }} data-testid="nav-ambient-toggle-mobile">
            {ambientOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => { setMobileOpen(!mobileOpen); playClick(); }} data-testid="mobile-menu-btn" style={{ color: 'var(--text-primary)' }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ═══ Mobile Fullscreen Menu ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 pt-16 overflow-y-auto"
            style={{ background: isLight ? 'rgba(248, 246, 243, 0.98)' : 'rgba(11, 12, 21, 0.98)', backdropFilter: 'blur(24px)' }}
            data-testid="mobile-menu-overlay"
          >
            <div className="p-4 pb-24">
              {/* Sage CTA */}
              <Link
                to="/coach"
                onClick={() => { setMobileOpen(false); playClick(); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-3 transition-all"
                style={{
                  background: 'rgba(45,212,191,0.08)',
                  border: '1px solid rgba(45,212,191,0.15)',
                  color: '#2DD4BF',
                }}
                data-testid="mobile-sage-link"
              >
                <MessageCircle size={18} />
                <div>
                  <span className="text-sm font-medium block">Sage — AI Coach</span>
                  <span className="text-[10px] opacity-60">Voice & text guidance</span>
                </div>
              </Link>

              {/* Category Accordions */}
              {NAV_CATEGORIES.map(cat => (
                <MobileCategory
                  key={cat.id}
                  category={cat}
                  expanded={mobileCat === cat.id}
                  onToggle={() => setMobileCat(mobileCat === cat.id ? null : cat.id)}
                  onNavigate={() => { setMobileOpen(false); playClick(); }}
                />
              ))}

              {/* User Section */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(192,132,252,0.06)' }}>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
                        style={{ background: avatarB64 ? 'transparent' : 'rgba(192,132,252,0.15)', color: '#D8B4FE' }}>
                        {avatarB64 ? (
                          <img src={`data:image/png;base64,${avatarB64}`} alt="" className="w-full h-full object-cover" data-testid="nav-avatar-img-mobile" />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                      {creditInfo && (
                        <Link to="/pricing" onClick={() => { setMobileOpen(false); playClick(); }}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]"
                          style={{
                            background: creditInfo.credits_per_month === -1 && creditInfo.subscription_active ? 'rgba(192,132,252,0.08)' : 'rgba(45,212,191,0.08)',
                            color: creditInfo.credits_per_month === -1 && creditInfo.subscription_active ? '#C084FC' : '#2DD4BF',
                            border: `1px solid ${creditInfo.credits_per_month === -1 && creditInfo.subscription_active ? 'rgba(192,132,252,0.15)' : 'rgba(45,212,191,0.12)'}`,
                          }}
                          data-testid="mobile-credits-badge">
                          {creditInfo.credits_per_month === -1 && creditInfo.subscription_active ? (
                            <><Crown size={10} /> {creditInfo.tier_name}</>
                          ) : (
                            <><CreditCard size={10} /> {creditInfo.balance}</>
                          )}
                        </Link>
                      )}
                    </div>
                    {/* Creator Studio — mobile, admin only */}
                    {creditInfo?.is_admin && (() => {
                      const CIcon = CREATOR_ITEM.icon;
                      return (
                        <Link to={CREATOR_ITEM.path} onClick={() => { setMobileOpen(false); playClick(); }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all"
                          style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)', color: '#EAB308' }}
                          data-testid="mobile-creator-link">
                          <CIcon size={16} />
                          <div>
                            <span className="text-sm font-medium block">Creator Studio</span>
                            <span className="text-[10px] opacity-60">Analytics & management</span>
                          </div>
                        </Link>
                      );
                    })()}
                    {PROFILE_ITEMS.map(item => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.path} to={item.path} onClick={() => { setMobileOpen(false); playClick(); }}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all"
                          style={{ color: location.pathname === item.path ? (isLight ? '#1E1B2E' : '#fff') : 'var(--text-secondary)' }}>
                          <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); playClick(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs mt-2"
                      style={{ color: 'var(--text-muted)' }}>
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => { setMobileOpen(false); playClick(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--primary)' }}>
                    <LogIn size={18} />
                    <span className="text-sm font-medium">Begin Journey</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Command Palette */}
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Hidden Dev Console */}
      <DevConsole isOpen={devConsoleOpen} onClose={() => setDevConsoleOpen(false)} authHeaders={authHeaders} />

      {/* Spacer */}
      <div className="h-14" />
    </div>
  );
}


function NotificationInbox({ notifications, onClose, onMarkRead, onMarkAllRead, navigate }) {
  const unread = notifications.filter(n => !n.read);
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
      className="w-80 max-h-[420px] rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(192,132,252,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
      data-testid="notification-inbox">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Bell size={13} style={{ color: '#C084FC' }} />
          <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Notifications</span>
          {unread.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>{unread.length} new</span>}
        </div>
        {unread.length > 0 && (
          <button onClick={onMarkAllRead} className="text-[9px] px-2 py-1 rounded-lg"
            style={{ background: 'rgba(192,132,252,0.06)', color: '#C084FC' }} data-testid="mark-all-read">
            Read all
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell size={20} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto 8px' }} />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 20).map(n => (
            <button key={n.id}
              onClick={() => { if (!n.read) onMarkRead(n.id); if (n.link) navigate(n.link); onClose(); }}
              className="w-full px-4 py-3 flex items-start gap-3 text-left transition-all hover:bg-white/[0.02]"
              style={{ borderBottom: '1px solid rgba(248,250,252,0.02)', background: n.read ? 'transparent' : 'rgba(192,132,252,0.03)' }}
              data-testid={`notif-item-${n.id}`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${n.color || '#C084FC'}12` }}>
                <HeartHandshake size={12} style={{ color: n.color || '#C084FC' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-medium truncate" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</p>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C084FC' }} />}
                </div>
                <p className="text-[9px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                <p className="text-[8px] mt-1" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <NotificationSettings onClose={onClose} />
      </div>
    </motion.div>
  );
}
