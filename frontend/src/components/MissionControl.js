import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResolution } from '../context/ResolutionContext';
import {
  X, User, Settings, Globe, Shield, Award, ChevronRight,
  Orbit, Eye, Layers
} from 'lucide-react';
import { NanoGuide } from './NanoGuide';
import { HexagramBadge, HexagramGlitch } from './ResonancePulse';
import { useCosmicState } from '../context/CosmicStateContext';

export default function MissionControl({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { level: resLevel, cycleResolution, config: resConfig } = useResolution();
  const { cosmicState, fetchCosmicState } = useCosmicState();

  useEffect(() => {
    if (isOpen) fetchCosmicState();
  }, [isOpen, fetchCosmicState]);

  const resColors = { low: '#60A5FA', medium: '#FBBF24', high: '#A78BFA' };

  const actions = [
    { label: 'Profile', icon: User, path: '/profile', color: '#A78BFA' },
    { label: 'Dashboard', icon: Layers, path: '/dashboard', color: '#22C55E' },
    { label: 'Settings', icon: Settings, path: '/settings', color: '#94A3B8' },
    { label: 'Mastery Tiers', icon: Award, path: '/mastery-avenues', color: '#FBBF24' },
    { label: 'Analytics', icon: Eye, path: '/analytics', color: '#3B82F6' },
    { label: 'Admin', icon: Shield, path: '/admin/power-spot', color: '#EF4444' },
  ];

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — pointer-events: none so 3D background stays interactive */}
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', pointerEvents: 'none' }}
          />

          {/* Click-capture layer — only covers panel area for close-on-outside-click */}
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ pointerEvents: 'auto', background: 'transparent' }}
          />

          {/* Panel — pointer-events: auto to capture all panel interactions */}
          <motion.div
            className="fixed z-50 rounded-2xl overflow-hidden overflow-y-auto"
            style={{
              left: '50%',
              top: '50%',
              width: 360,
              maxHeight: '80vh',
              background: 'rgba(10,10,18,0.72)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(248,250,252,0.08)',
              boxShadow: '0 0 60px rgba(167,139,250,0.06), 0 24px 80px rgba(0,0,0,0.3)',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.85, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.85, x: '-50%', y: '-50%' }}
            onClick={e => e.stopPropagation()}
            data-testid="mission-control-panel"
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(248,250,252,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <Orbit size={16} style={{ color: '#A78BFA' }} />
                <h2 className="text-sm font-medium tracking-wider uppercase"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.15em' }}>
                  Mission Control
                </h2>
                <NanoGuide guideId="mission-control" position="top-left" />
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                data-testid="mission-control-close">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div className="px-5 py-3 flex items-center gap-3"
                style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <User size={16} style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
              </div>
            )}

            {/* Resolution Toggle */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
              <button onClick={cycleResolution}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all hover:bg-white/[0.03]"
                data-testid="mc-resolution-toggle">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: i <= ['low','medium','high'].indexOf(resLevel) ? resColors[resLevel] : 'rgba(248,250,252,0.1)' }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: resColors[resLevel] }}>
                    {resConfig.label}
                  </span>
                </div>
                <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                  {resConfig.sublabel}
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-3 py-2">
              {actions.map((a, idx) => (
                <button key={a.label} onClick={() => handleNav(a.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white/[0.03]"
                  data-testid={`mc-action-${a.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <div className="relative">
                    <a.icon size={14} style={{ color: a.color }} />
                    <span className="absolute -inset-1 rounded-full animate-ping"
                      style={{ background: a.color, opacity: 0.06, animationDuration: `${2.5 + idx * 0.4}s` }} />
                  </div>
                  <span className="flex-1 text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {a.label}
                  </span>
                  <ChevronRight size={10} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>

            {/* Hexagram State — I Ching Logic Gate */}
            {cosmicState?.hexagram && (
              <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[7px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(248,250,252,0.15)' }}>
                  Logic Gate
                </p>
                <HexagramGlitch active={cosmicState.hexagram.is_transitioning}>
                  <HexagramBadge hexagram={cosmicState.hexagram} />
                </HexagramGlitch>
              </div>
            )}

            {/* Cosmic Collective Link */}
            <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
              <button onClick={() => handleNav('/')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-medium transition-all"
                style={{
                  background: 'rgba(167,139,250,0.06)',
                  color: '#A78BFA',
                  border: '1px solid rgba(167,139,250,0.12)',
                }}
                data-testid="mc-collective-link">
                <Globe size={12} />
                The Cosmic Collective Portal
              </button>
            </div>

            {/* Logout */}
            {user && (
              <div className="px-5 pb-4">
                <button onClick={() => { logout(); onClose(); }}
                  className="w-full text-center py-2 text-[9px] rounded-lg transition-all hover:bg-white/[0.03]"
                  style={{ color: 'var(--text-muted)' }}
                  data-testid="mc-logout">
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
