import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind, Timer, Sun, Heart, BookOpen, Headphones,
  LayoutDashboard, LogOut, LogIn, Menu, X, Zap, Leaf, Radio,
  Sunrise, Users, Flame, Sparkles, User, Hand, Triangle,
  Flame as TantraIcon, Play, GraduationCap, ChevronDown, PenTool
} from 'lucide-react';

const PRIMARY_NAV = [
  { path: '/breathing', label: 'Breathe', icon: Wind },
  { path: '/meditation', label: 'Meditate', icon: Timer },
  { path: '/soundscapes', label: 'Sounds', icon: Headphones },
  { path: '/frequencies', label: 'Hz', icon: Radio },
  { path: '/exercises', label: 'Exercises', icon: Zap },
  { path: '/mudras', label: 'Mudras', icon: Hand },
  { path: '/oracle', label: 'Oracle', icon: Sparkles },
  { path: '/create', label: 'Create', icon: PenTool },
];

const MORE_NAV = [
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
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close "More" dropdown when clicking outside
  // IMPORTANT: This useEffect must be called BEFORE any early returns to maintain hook order
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Early return AFTER all hooks are called
  if (location.pathname === '/' || location.pathname === '/auth') return null;

  const moreActive = MORE_NAV.some(item => location.pathname === item.path);

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(11, 12, 21, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link to="/" className="flex items-center gap-3 flex-shrink-0" data-testid="nav-logo">
          <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            Cosmic Zen
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
                data-testid={`nav-${item.label.toLowerCase()}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transition: 'color 0.3s, background 0.3s',
                }}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs"
              style={{
                color: moreActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: moreActive || moreOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}
              data-testid="nav-more-btn"
            >
              <span>More</span>
              <ChevronDown size={12} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full right-0 mt-2 w-52 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(18, 20, 32, 0.97)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="py-2">
                    {MORE_NAV.map(item => {
                      const Icon = item.icon;
                      const active = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs"
                          style={{
                            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                            background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                          }}
                          data-testid={`nav-more-${item.label.toLowerCase()}`}
                        >
                          <Icon size={14} />
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
          {user ? (
            <>
              <Link
                to="/profile"
                data-testid="nav-profile"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                style={{
                  color: location.pathname === '/profile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: location.pathname === '/profile' ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                <User size={13} />
                <span>Profile</span>
              </Link>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                style={{
                  color: location.pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                <LayoutDashboard size={13} />
                <span>{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-1.5 rounded-full"
                style={{ color: 'var(--text-muted)' }}
                data-testid="nav-logout"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
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
          background: 'rgba(11, 12, 21, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo-mobile">
          <div className="w-7 h-7 rounded-full" style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Cosmic Zen</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} data-testid="mobile-menu-btn" style={{ color: 'var(--text-primary)' }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-0 z-40 pt-16 overflow-y-auto"
            style={{ background: 'rgba(11, 12, 21, 0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-6 space-y-1 pb-24">
              {ALL_NAV.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    }}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-white/10 pt-4 mt-4">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                      <User size={18} />
                      <span className="text-sm">Profile</span>
                    </Link>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                      <LayoutDashboard size={18} />
                      <span className="text-sm">Dashboard</span>
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full" style={{ color: 'var(--text-muted)' }}>
                      <LogOut size={18} />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--primary)' }}>
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
