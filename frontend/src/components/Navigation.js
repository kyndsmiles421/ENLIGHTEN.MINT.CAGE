import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind, Timer, Sun, Heart, BookOpen, Headphones,
  LayoutDashboard, LogOut, LogIn, Menu, X, Zap, Leaf, Radio,
  Sunrise, Users, Flame, Sparkles, User, Hand, Triangle,
  Flame as TantraIcon, Play, GraduationCap, ChevronDown, PenTool,
  Volume2, VolumeX, Lightbulb, Sprout, Music, HeartHandshake, Map,
  Gamepad2, Globe, Star, Compass
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

const PRIMARY_NAV = [
  { path: '/journey', label: 'Journey', icon: Map },
  { path: '/breathing', label: 'Breathe', icon: Wind },
  { path: '/meditation', label: 'Meditate', icon: Timer },
  { path: '/soundscapes', label: 'Sounds', icon: Headphones },
  { path: '/frequencies', label: 'Hz', icon: Radio },
  { path: '/exercises', label: 'Exercises', icon: Zap },
  { path: '/mudras', label: 'Mudras', icon: Hand },
  { path: '/light-therapy', label: 'Light', icon: Lightbulb },
  { path: '/zen-garden', label: 'Zen', icon: Sprout },
];

const MORE_NAV = [
  { path: '/yoga', label: 'Yoga', icon: Flame },
  { path: '/teachings', label: 'Teachings', icon: BookOpen },
  { path: '/wisdom-journal', label: 'Wisdom Log', icon: PenTool },
  { path: '/numerology', label: 'Numerology', icon: Star },
  { path: '/avatar', label: 'Avatar', icon: Sparkles },
  { path: '/friends', label: 'Friends', icon: Users },
  { path: '/learn', label: 'Learn', icon: GraduationCap },
  { path: '/games', label: 'Games', icon: Gamepad2 },
  { path: '/mantras', label: 'Mantras', icon: Music },
  { path: '/hooponopono', label: "Ho'oponopono", icon: HeartHandshake },
  { path: '/oracle', label: 'Oracle', icon: Sparkles },
  { path: '/cardology', label: 'Cardology', icon: Star },
  { path: '/mayan', label: 'Mayan', icon: Compass },
  { path: '/create', label: 'Create', icon: PenTool },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/yantra', label: 'Yantra', icon: Triangle },
  { path: '/tantra', label: 'Tantra', icon: TantraIcon },
  { path: '/rituals', label: 'Rituals', icon: Sunrise },
  { path: '/challenges', label: 'Challenges', icon: Flame },
  { path: '/affirmations', label: 'Affirm', icon: Sun },
  { path: '/mood', label: 'Mood', icon: Heart },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/nourishment', label: 'Nourish', icon: Leaf },
  { path: '/videos', label: 'Videos', icon: Play },
  { path: '/classes', label: 'Classes', icon: GraduationCap },
];

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];

export default function Navigation() {
  const { user, logout } = useAuth();
  const { ambientOn, toggleAmbient, playClick } = useSensory();
  const { lang, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const moreRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (location.pathname === '/' || location.pathname === '/auth') return null;

  const moreActive = MORE_NAV.some(item => location.pathname === item.path);

  const handleNav = () => {
    playClick();
  };

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(11, 12, 21, 0.75)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(192,132,252,0.06)',
        }}
      >
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group" data-testid="nav-logo" onClick={handleNav}>
          <div className="w-8 h-8 rounded-full animate-orbit-glow relative"
            style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }}>
            <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ opacity: 0.5 }} />
          </div>
          <span className="group-hover:animate-text-shimmer transition-all duration-300" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            Cosmic Collective
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {PRIMARY_NAV.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNav}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs nav-glow transition-all duration-300"
                style={{
                  color: active ? '#fff' : 'var(--text-muted)',
                  background: active ? 'rgba(192,132,252,0.12)' : 'transparent',
                  boxShadow: active ? '0 0 15px rgba(192,132,252,0.15)' : 'none',
                }}
              >
                <Icon size={13} style={active ? { filter: 'drop-shadow(0 0 4px rgba(192,132,252,0.6))' } : {}} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => { setMoreOpen(!moreOpen); playClick(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs nav-glow transition-all duration-300"
              style={{
                color: moreActive ? '#fff' : 'var(--text-muted)',
                background: moreActive || moreOpen ? 'rgba(192,132,252,0.12)' : 'transparent',
              }}
              data-testid="nav-more-btn"
            >
              <span>More</span>
              <ChevronDown size={12} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute top-full right-0 mt-2 w-52 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(13, 14, 26, 0.95)',
                    border: '1px solid rgba(192,132,252,0.1)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 0 40px rgba(192,132,252,0.06), 0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="py-2">
                    {MORE_NAV.map((item, i) => {
                      const Icon = item.icon;
                      const active = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => { setMoreOpen(false); playClick(); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs transition-all duration-200"
                          style={{
                            color: active ? '#fff' : 'var(--text-secondary)',
                            background: active ? 'rgba(192,132,252,0.1)' : 'transparent',
                          }}
                          data-testid={`nav-more-${item.label.toLowerCase()}`}
                        >
                          <Icon size={14} style={active ? { filter: 'drop-shadow(0 0 4px rgba(192,132,252,0.5))' } : {}} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setLangOpen(!langOpen); playClick(); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs transition-all duration-300"
              style={{ color: 'var(--text-muted)', background: langOpen ? 'rgba(192,132,252,0.08)' : 'transparent' }}
              data-testid="nav-lang-btn"
            >
              <Globe size={13} />
              <span className="uppercase text-[10px] font-bold">{lang}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-36 rounded-xl overflow-hidden z-[100]"
                  style={{ background: 'rgba(22, 24, 38, 0.98)', border: '1px solid rgba(192,132,252,0.1)', backdropFilter: 'blur(24px)' }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLanguage(l.code); setLangOpen(false); playClick(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all"
                      style={{ color: lang === l.code ? '#fff' : 'var(--text-secondary)', background: lang === l.code ? 'rgba(192,132,252,0.1)' : 'transparent' }}
                      data-testid={`lang-${l.code}`}>
                      <span className="text-[10px] font-bold uppercase w-5">{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Ambient Audio Toggle */}
          <button
            onClick={toggleAmbient}
            className="p-2 rounded-full transition-all duration-300 relative"
            style={{
              color: ambientOn ? 'var(--primary)' : 'var(--text-muted)',
              background: ambientOn ? 'rgba(192,132,252,0.1)' : 'transparent',
              boxShadow: ambientOn ? '0 0 15px rgba(192,132,252,0.2)' : 'none',
            }}
            data-testid="nav-ambient-toggle"
            title={ambientOn ? 'Ambient sound on' : 'Ambient sound off'}
          >
            {ambientOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {ambientOn && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ border: '1px solid var(--primary)' }}
              />
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={handleNav}
                data-testid="nav-profile"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs nav-glow transition-all duration-300"
                style={{
                  color: location.pathname === '/profile' ? '#fff' : 'var(--text-secondary)',
                  background: location.pathname === '/profile' ? 'rgba(192,132,252,0.12)' : 'transparent',
                }}
              >
                <User size={13} />
                <span>Profile</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={handleNav}
                data-testid="nav-dashboard"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs nav-glow transition-all duration-300"
                style={{
                  color: location.pathname === '/dashboard' ? '#fff' : 'var(--text-secondary)',
                  background: location.pathname === '/dashboard' ? 'rgba(192,132,252,0.12)' : 'transparent',
                }}
              >
                <LayoutDashboard size={13} />
                <span>{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); playClick(); }}
                className="p-1.5 rounded-full transition-all duration-300"
                style={{ color: 'var(--text-muted)' }}
                data-testid="nav-logout"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={handleNav}
              className="btn-glass text-xs px-4 py-2"
              data-testid="nav-signin"
            >
              <LogIn size={12} className="inline mr-1.5" />
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(11, 12, 21, 0.8)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(192,132,252,0.06)',
        }}
      >
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo-mobile" onClick={handleNav}>
          <div className="w-7 h-7 rounded-full animate-orbit-glow" style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Cosmic Collective</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAmbient}
            className="p-2 rounded-full"
            style={{ color: ambientOn ? 'var(--primary)' : 'var(--text-muted)' }}
            data-testid="nav-ambient-toggle-mobile"
          >
            {ambientOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => { setMobileOpen(!mobileOpen); playClick(); }} data-testid="mobile-menu-btn" style={{ color: 'var(--text-primary)' }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-0 z-40 pt-16 overflow-y-auto"
            style={{ background: 'rgba(11, 12, 21, 0.97)', backdropFilter: 'blur(24px)' }}
          >
            <div className="p-6 space-y-1 pb-24">
              {ALL_NAV.map((item, i) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link
                      to={item.path}
                      onClick={() => { setMobileOpen(false); playClick(); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                      style={{
                        color: active ? '#fff' : 'var(--text-secondary)',
                        background: active ? 'rgba(192,132,252,0.1)' : 'transparent',
                      }}
                    >
                      <Icon size={18} style={active ? { filter: 'drop-shadow(0 0 4px rgba(192,132,252,0.5))' } : {}} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
              <div className="border-t pt-4 mt-4" style={{ borderColor: 'rgba(192,132,252,0.08)' }}>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => { setMobileOpen(false); playClick(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                      <User size={18} />
                      <span className="text-sm">Profile</span>
                    </Link>
                    <Link to="/dashboard" onClick={() => { setMobileOpen(false); playClick(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                      <LayoutDashboard size={18} />
                      <span className="text-sm">Dashboard</span>
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); playClick(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full" style={{ color: 'var(--text-muted)' }}>
                      <LogOut size={18} />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => { setMobileOpen(false); playClick(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--primary)' }}>
                    <LogIn size={18} />
                    <span className="text-sm">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-14" />
    </>
  );
}
