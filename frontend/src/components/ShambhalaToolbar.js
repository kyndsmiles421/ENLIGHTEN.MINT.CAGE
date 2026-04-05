/**
 * SHAMBHALA BOTTOM TOOLBAR
 * A clean horizontal toolbar at the bottom
 * Pull-up panels for navigation and mixer
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Moon, Hexagon, Star, Award, Music, Settings, Home, Compass, Menu, X, ChevronUp } from 'lucide-react';

const ShambhalaToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'oracle', path: '/oracle', icon: Eye, label: 'Oracle' },
    { id: 'tarot', path: '/tarot', icon: Moon, label: 'Tarot' },
    { id: 'iching', path: '/iching', icon: Hexagon, label: 'I Ching' },
    { id: 'stars', path: '/star-chart', icon: Star, label: 'Stars' },
    { id: 'legacy', path: '/achievements', icon: Award, label: 'Legacy' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* PULL-UP NAVIGATION PANEL */}
      {navOpen && (
        <div 
          className="fixed inset-0 z-[99998]"
          onClick={() => setNavOpen(false)}
        >
          <div 
            className="absolute bottom-28 left-0 right-0 bg-black/95 border-t border-gold-500/20 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center gap-4 flex-wrap max-w-md mx-auto">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setNavOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    isActive(item.path)
                      ? 'bg-gold-500/20 text-gold-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PULL-UP MIXER PANEL */}
      {mixerOpen && (
        <div 
          className="fixed inset-0 z-[99998]"
          onClick={() => setMixerOpen(false)}
        >
          <div 
            className="absolute bottom-28 left-0 right-0 bg-black/95 border-t border-teal-500/20 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-teal-400 text-sm font-mono mb-3 text-center">SHAMBHALA MIXER</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <label className="text-xs text-white/50 mb-1">GOLD</label>
                  <input type="range" className="w-full" min="0" max="100" defaultValue="71" />
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-xs text-white/50 mb-1">COPPER</label>
                  <input type="range" className="w-full" min="0" max="100" defaultValue="50" />
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-xs text-white/50 mb-1">TEAL</label>
                  <input type="range" className="w-full" min="0" max="100" defaultValue="80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BOTTOM TOOLBAR - Pushed up above Emergent badge */}
      <div 
        className="fixed left-0 right-0 h-14 bg-black/90 border-t border-gold-500/30 flex items-center justify-between px-4"
        style={{ 
          backdropFilter: 'blur(10px)',
          bottom: '60px',
          zIndex: 2147483647
        }}
      >
        {/* Left: Navigation Toggle */}
        <button
          onClick={() => {
            setNavOpen(!navOpen);
            setMixerOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            navOpen ? 'bg-gold-500/20 text-gold-400' : 'text-white/60 hover:text-white'
          }`}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="text-xs font-mono hidden sm:inline">NAV</span>
        </button>

        {/* Center: App Title */}
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-gold-400" />
          <span className="text-gold-400 font-serif text-sm tracking-wider">SHAMBHALA</span>
        </div>

        {/* Right: Mixer Toggle */}
        <button
          onClick={() => {
            setMixerOpen(!mixerOpen);
            setNavOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            mixerOpen ? 'bg-teal-500/20 text-teal-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Music size={20} />
          <span className="text-xs font-mono hidden sm:inline">MIXER</span>
        </button>
      </div>
    </>
  );
};

export default ShambhalaToolbar;
