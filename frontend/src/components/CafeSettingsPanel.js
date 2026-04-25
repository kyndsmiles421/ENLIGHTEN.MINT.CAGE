import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Sun, Moon, Sparkles, BookOpen, Eye, Volume2, VolumeX,
  Wind, Compass, X, ChevronRight, Coffee, Palette, Layers, Focus,
} from 'lucide-react';
import { useEnlightenmentCafe, CAFE_ZONES } from '../context/EnlightenmentCafeContext';
import { useMeshNetwork } from '../context/MeshNetworkContext';

/**
 * CafeSettingsPanel — User-Controlled Visualization Settings
 * 
 * This is the ONLY place where users can change visual settings.
 * Nothing is automatic — every change is an explicit user choice.
 * 
 * Options:
 * - View Tier: Parchment (Essential) vs Nebula (Premium)
 * - Color Mode: Light vs Dark (Parchment only)
 * - Atmosphere: Ambient sound, particles, depth blur, warm glow
 * - Show Suggested Paths: Explicitly request learned navigation suggestions
 * - Lore Default: Action-First (collapsed) or Open (expanded) across all modules
 */

// ─── V68.5: Global Lore Toggle (Thin-Client Action-First) ───
function LoreDefaultToggle({ palette }) {
  const [pref, setPref] = useState(() => {
    try { return localStorage.getItem('global_lore_default') || 'closed'; }
    catch { return 'closed'; }
  });
  const set = (v) => {
    try { localStorage.setItem('global_lore_default', v); } catch {}
    setPref(v);
  };
  const opts = [
    { id: 'closed', label: 'Action-First', desc: 'Collapsed by default' },
    { id: 'open', label: 'Lore-Open', desc: 'Expanded by default' },
  ];
  return (
    <div className="grid grid-cols-2 gap-1.5" data-testid="lore-default-toggle">
      {opts.map(o => (
        <button
          key={o.id}
          onClick={() => set(o.id)}
          className="px-3 py-2 rounded-lg text-left transition-all"
          style={{
            background: pref === o.id ? `${palette.gold}18` : 'transparent',
            border: `1px solid ${pref === o.id ? palette.gold : 'rgba(255,255,255,0.08)'}`,
          }}
          data-testid={`lore-default-${o.id}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: pref === o.id ? palette.gold : palette.inkMuted }}>
            {o.label}
          </div>
          <div className="text-[8px]" style={{ color: palette.inkMuted }}>{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

export default function CafeSettingsPanel({ isOpen, onClose }) {
  const {
    viewTier,
    colorMode,
    atmosphere,
    toggleViewTier,
    toggleColorMode,
    updateAtmosphere,
    focusZone,
    activeZone,
    clearZoneFocus,
    getPalette,
  } = useEnlightenmentCafe();

  const { showSuggestedPaths, sympathyMap, currentNode } = useMeshNetwork();
  const [showingPaths, setShowingPaths] = useState(false);

  const palette = getPalette();

  const handleShowPaths = () => {
    const paths = showSuggestedPaths();
    setShowingPaths(paths.length > 0);
    setTimeout(() => setShowingPaths(false), 12000);
  };

  // Count learned paths
  const learnedPathCount = Object.keys(sympathyMap).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full max-w-md mx-auto rounded-2xl overflow-hidden my-4"
        style={{
          // Flatland-compliant: inline panel, no fixed/inset/z-index modal.
          position: 'relative',
          background: viewTier === 'parchment'
            ? (colorMode === 'light' ? '#FAF8F5' : '#1A1A1D')
            : 'rgba(20, 20, 30, 0.98)',
          border: `1px solid ${viewTier === 'parchment'
            ? (colorMode === 'light' ? '#E8E4DC' : '#3A3A3E')
            : 'rgba(129, 140, 248, 0.15)'}`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.1)',
        }}
        data-testid="cafe-settings-panel"
      >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ 
              borderBottom: `1px solid ${viewTier === 'parchment' 
                ? (colorMode === 'light' ? '#E8E4DC' : '#3A3A3E')
                : 'rgba(129, 140, 248, 0.1)'}` 
            }}>
            <div className="flex items-center gap-3">
              <Coffee size={18} style={{ color: palette.gold || '#C9A962' }} />
              <div>
                <h2 className="text-sm font-semibold" 
                  style={{ 
                    color: viewTier === 'parchment' ? palette.ink : '#F5F2ED',
                    fontFamily: 'var(--cafe-font-heading)',
                  }}>
                  Enlightenment Cafe
                </h2>
                <p className="text-[10px]" style={{ color: palette.inkMuted || 'rgba(255,255,255,0.5)' }}>
                  Your Digital Sanctuary Settings
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X size={16} style={{ color: palette.inkMuted }} />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* View Tier Selection */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                style={{ color: palette.inkMuted }}>
                Visualization
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleViewTier()}
                  className={`p-3 rounded-xl text-left transition-all ${viewTier === 'parchment' ? 'ring-2' : ''}`}
                  style={{
                    background: viewTier === 'parchment' 
                      ? `${palette.gold}15` 
                      : (colorMode === 'light' ? '#F5F2ED' : '#2A2A2E'),
                    border: `1px solid ${viewTier === 'parchment' ? `${palette.gold}40` : 'transparent'}`,
                    ringColor: palette.gold,
                  }}
                  data-testid="tier-parchment"
                >
                  <BookOpen size={16} style={{ color: viewTier === 'parchment' ? palette.gold : palette.inkMuted }} />
                  <span className="text-xs font-medium block mt-1.5" 
                    style={{ color: viewTier === 'parchment' ? palette.gold : palette.ink }}>
                    Parchment
                  </span>
                  <span className="text-[9px] block" style={{ color: palette.inkMuted }}>
                    Essential • Fast
                  </span>
                </button>
                <button
                  disabled={true}
                  className={`p-3 rounded-xl text-left transition-all opacity-60 cursor-not-allowed relative`}
                  style={{
                    background: colorMode === 'light' ? '#F5F2ED' : '#2A2A2E',
                    border: '1px solid transparent',
                  }}
                  data-testid="tier-nebula"
                >
                  <div className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                    Soon
                  </div>
                  <Sparkles size={16} style={{ color: palette.inkMuted }} />
                  <span className="text-xs font-medium block mt-1.5" 
                    style={{ color: palette.ink }}>
                    Nebula
                  </span>
                  <span className="text-[9px] block" style={{ color: palette.inkMuted }}>
                    Premium • 3D
                  </span>
                </button>
              </div>
            </div>

            {/* Color Mode (Parchment only) */}
            {viewTier === 'parchment' && (
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                  style={{ color: palette.inkMuted }}>
                  Color Mode
                </label>
                <button
                  onClick={toggleColorMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{
                    background: colorMode === 'light' ? '#F5F2ED' : '#2A2A2E',
                    border: `1px solid ${colorMode === 'light' ? '#E8E4DC' : '#3A3A3E'}`,
                  }}
                  data-testid="toggle-color-mode"
                >
                  <div className="flex items-center gap-3">
                    {colorMode === 'light' ? (
                      <Sun size={16} style={{ color: '#C9A962' }} />
                    ) : (
                      <Moon size={16} style={{ color: '#C9A962' }} />
                    )}
                    <span className="text-xs font-medium" style={{ color: palette.ink }}>
                      {colorMode === 'light' ? 'Light (Cream & Ink)' : 'Dark (Charcoal & Gold)'}
                    </span>
                  </div>
                  <ChevronRight size={14} style={{ color: palette.inkMuted }} />
                </button>
              </div>
            )}

            {/* Atmosphere Settings */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                style={{ color: palette.inkMuted }}>
                Atmosphere
              </label>
              <div className="space-y-2">
                {[
                  { key: 'ambientSound', label: 'Cafe Ambiance', icon: atmosphere.ambientSound ? Volume2 : VolumeX, desc: 'Soft background audio' },
                  { key: 'particleEffects', label: 'Particle Effects', icon: Wind, desc: 'Floating dust/steam' },
                  { key: 'depthBlur', label: 'Depth Focus', icon: Focus, desc: 'Blur non-active areas' },
                  { key: 'warmGlow', label: 'Warm Glow', icon: Sun, desc: 'Subtle golden overlay' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <button
                    key={key}
                    onClick={() => updateAtmosphere(key, !atmosphere[key])}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
                    style={{
                      background: atmosphere[key] 
                        ? `${palette.gold}10` 
                        : (colorMode === 'light' ? '#F5F2ED' : '#2A2A2E'),
                      border: `1px solid ${atmosphere[key] ? `${palette.gold}30` : 'transparent'}`,
                    }}
                    data-testid={`atmosphere-${key}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} style={{ color: atmosphere[key] ? palette.gold : palette.inkMuted }} />
                      <div className="text-left">
                        <span className="text-xs font-medium block" style={{ color: palette.ink }}>{label}</span>
                        <span className="text-[9px]" style={{ color: palette.inkMuted }}>{desc}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-all ${atmosphere[key] ? '' : ''}`}
                      style={{
                        background: atmosphere[key] ? palette.gold : (colorMode === 'light' ? '#D4CFC4' : '#4A4A4E'),
                      }}>
                      <motion.div
                        className="w-3 h-3 rounded-full mt-0.5"
                        style={{ background: colorMode === 'light' ? '#FFFFFF' : '#1A1A1D' }}
                        animate={{ x: atmosphere[key] ? 17 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Show Learned Paths (User-Triggered) */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                style={{ color: palette.inkMuted }}>
                Navigation Suggestions
              </label>
              <div className="p-3 rounded-xl"
                style={{
                  background: colorMode === 'light' ? '#F5F2ED' : '#2A2A2E',
                  border: `1px solid ${colorMode === 'light' ? '#E8E4DC' : '#3A3A3E'}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Compass size={14} style={{ color: palette.gold }} />
                    <span className="text-xs font-medium" style={{ color: palette.ink }}>
                      Learned Paths
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ background: `${palette.gold}15`, color: palette.gold }}>
                    {learnedPathCount} paths
                  </span>
                </div>
                <p className="text-[10px] mb-3" style={{ color: palette.inkMuted }}>
                  The Cafe learns which modules you use together. Request suggestions when you want them.
                </p>
                <button
                  onClick={handleShowPaths}
                  disabled={!currentNode || showingPaths}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  style={{
                    background: showingPaths ? `${palette.gold}20` : palette.gold,
                    color: showingPaths ? palette.gold : (colorMode === 'light' ? '#1A1A1D' : '#FAF8F5'),
                  }}
                  data-testid="show-suggested-paths"
                >
                  {showingPaths ? 'Paths Shown (12s)' : 'Show Suggested Paths'}
                </button>
              </div>
            </div>

            {/* V68.5 — Global Lore Toggle (Sovereign Thin-Client Mode) */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                style={{ color: palette.inkMuted }}>
                Lore Default
              </label>
              <LoreDefaultToggle palette={palette} />
              <p className="text-[9px] mt-1.5" style={{ color: palette.inkMuted }}>
                Action-First: gestures & practice render first. Lore (descriptions, properties) stays collapsed by default to keep the UI lean.
              </p>
            </div>

            {/* Zone Focus */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                style={{ color: palette.inkMuted }}>
                Focus Zone
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={clearZoneFocus}
                  className={`p-2 rounded-lg text-center transition-all ${!activeZone ? 'ring-1' : ''}`}
                  style={{
                    background: !activeZone ? `${palette.gold}15` : 'transparent',
                    ringColor: palette.gold,
                  }}
                >
                  <Layers size={12} className="mx-auto" style={{ color: !activeZone ? palette.gold : palette.inkMuted }} />
                  <span className="text-[8px] block mt-0.5" style={{ color: !activeZone ? palette.gold : palette.inkMuted }}>All</span>
                </button>
                {Object.entries(CAFE_ZONES).map(([id, zone]) => (
                  <button
                    key={id}
                    onClick={() => focusZone(id)}
                    className={`p-2 rounded-lg text-center transition-all ${activeZone === id ? 'ring-1' : ''}`}
                    style={{
                      background: activeZone === id ? `${palette[id] || palette.gold}15` : 'transparent',
                      ringColor: palette[id] || palette.gold,
                    }}
                  >
                    <span className="text-[8px] block" 
                      style={{ color: activeZone === id ? (palette[id] || palette.gold) : palette.inkMuted }}>
                      {zone.label.split(' ')[1] || zone.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 text-center"
            style={{ 
              borderTop: `1px solid ${viewTier === 'parchment' 
                ? (colorMode === 'light' ? '#E8E4DC' : '#3A3A3E')
                : 'rgba(129, 140, 248, 0.1)'}`,
              background: viewTier === 'parchment'
                ? (colorMode === 'light' ? '#F5F2ED' : '#222225')
                : 'rgba(0,0,0,0.2)',
            }}>
            <span className="text-[9px]" style={{ color: palette.inkMuted }}>
              enlightenment.cafe • Your choices, your flow
            </span>
          </div>
      </motion.section>
    </AnimatePresence>
  );
}

/**
 * CafeSettingsToggle — Small button to open settings
 */
export function CafeSettingsToggle({ onClick }) {
  const { viewTier, colorMode, getPalette } = useEnlightenmentCafe();
  const palette = getPalette();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed z-[9980] p-3 rounded-xl backdrop-blur-xl"
      style={{
        bottom: 250,
        left: 'calc(50% - 22px)',
        background: viewTier === 'parchment'
          ? (colorMode === 'light' ? 'rgba(250,248,245,0.9)' : 'rgba(26,26,29,0.9)')
          : 'rgba(20, 20, 30, 0.9)',
        border: `1px solid ${palette.border || 'rgba(255,255,255,0.1)'}`,
        boxShadow: `0 4px 20px ${palette.shadow || 'rgba(0,0,0,0.2)'}`,
      }}
      data-testid="cafe-settings-toggle"
    >
      <Coffee size={18} style={{ color: palette.gold || '#C9A962' }} />
    </motion.button>
  );
}
