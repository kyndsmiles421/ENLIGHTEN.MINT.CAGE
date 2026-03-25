import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind, Timer, Sun, Heart, BookOpen, Headphones,
  LayoutDashboard, LogOut, LogIn, Menu, X, Zap, Leaf, Radio, Sunrise, Users, Flame
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/breathing', label: 'Breathe', icon: Wind },
  { path: '/meditation', label: 'Meditate', icon: Timer },
  { path: '/exercises', label: 'Exercises', icon: Zap },
  { path: '/rituals', label: 'Rituals', icon: Sunrise },
  { path: '/challenges', label: 'Challenges', icon: Flame },
  { path: '/affirmations', label: 'Affirm', icon: Sun },
  { path: '/mood', label: 'Mood', icon: Heart },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/soundscapes', label: 'Sounds', icon: Headphones },
  { path: '/nourishment', label: 'Nourish', icon: Leaf },
  { path: '/frequencies', label: 'Hz', icon: Radio },
  { path: '/community', label: 'Community', icon: Users },
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (location.pathname === '/' || location.pathname === '/auth') return null;

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(11, 12, 21, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
          <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            Cosmic Zen
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transition: 'color 0.3s, background 0.3s',
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm"
                style={{
                  color: location.pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                <LayoutDashboard size={15} />
                <span>{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-full"
                style={{ color: 'var(--text-muted)' }}
                data-testid="nav-logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="btn-glass text-sm px-4 py-2"
              data-testid="nav-signin"
            >
              <LogIn size={14} className="inline mr-1.5" />
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
            className="lg:hidden fixed inset-0 z-40 pt-16"
            style={{ background: 'rgba(11, 12, 21, 0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-6 space-y-2">
              {NAV_ITEMS.map(item => {
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-white/10 pt-4 mt-4">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full" style={{ color: 'var(--text-muted)' }}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ color: 'var(--primary)' }}>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
