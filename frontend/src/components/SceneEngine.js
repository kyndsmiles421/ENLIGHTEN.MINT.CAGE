/**
 * V42.0 REALM SKIN ENGINE
 * 
 * Each skin is a REALM — visual theme + accent colors + contextual scenes.
 * Modules auto-load their contextual scene (herbology = herb garden, etc.)
 * User can lock a global skin to override, or let it flow with each module.
 * Skins transform: background, accent color, card tint, mixer glow.
 */

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Lock, Unlock } from 'lucide-react';

// ═══ REALM SKINS — Each is a full visual identity ═══
const SKINS = [
  // Meditation & Chakra
  { id: 'chakra-meditation', name: 'Chakra Meditation', category: 'Meditation', accent: '#C084FC', cardTint: 'rgba(192,132,252,0.06)', borderTint: 'rgba(192,132,252,0.15)', url: 'https://images.unsplash.com/photo-1633434896425-715c2c82509a?w=1200&q=80', overlay: 'rgba(0,0,0,0.25)' },
  { id: 'cosmic-silhouette', name: 'Cosmic Silhouette', category: 'Meditation', accent: '#A78BFA', cardTint: 'rgba(167,139,250,0.06)', borderTint: 'rgba(167,139,250,0.15)', url: 'https://images.unsplash.com/photo-1612890877530-85a8c47d968b?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'golden-meditation', name: 'Golden Meditation', category: 'Meditation', accent: '#F59E0B', cardTint: 'rgba(245,158,11,0.06)', borderTint: 'rgba(245,158,11,0.15)', url: 'https://images.unsplash.com/photo-1633942941070-0fb66452f4f7?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  // Aurora
  { id: 'aurora-green', name: 'Emerald Aurora', category: 'Aurora', accent: '#10B981', cardTint: 'rgba(16,185,129,0.06)', borderTint: 'rgba(16,185,129,0.15)', url: 'https://images.unsplash.com/photo-1610989432929-9769f3cf8006?w=1200&q=80', overlay: 'rgba(0,0,0,0.15)' },
  { id: 'aurora-pink', name: 'Pink Aurora', category: 'Aurora', accent: '#EC4899', cardTint: 'rgba(236,72,153,0.06)', borderTint: 'rgba(236,72,153,0.15)', url: 'https://images.unsplash.com/photo-1716155705161-fcf2e13da07a?w=1200&q=80', overlay: 'rgba(0,0,0,0.18)' },
  // Crystals
  { id: 'amethyst-glow', name: 'Amethyst Glow', category: 'Crystals', accent: '#8B5CF6', cardTint: 'rgba(139,92,246,0.08)', borderTint: 'rgba(139,92,246,0.18)', url: 'https://images.unsplash.com/photo-1728934140045-8b849067e0a8?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'crystal-cave', name: 'Crystal Cave', category: 'Crystals', accent: '#6366F1', cardTint: 'rgba(99,102,241,0.06)', borderTint: 'rgba(99,102,241,0.15)', url: 'https://images.unsplash.com/photo-1636548974452-7217d5eab8dc?w=1200&q=80', overlay: 'rgba(0,0,0,0.18)' },
  // Sacred
  { id: 'lotus-bloom', name: 'Lotus Bloom', category: 'Sacred', accent: '#F472B6', cardTint: 'rgba(244,114,182,0.06)', borderTint: 'rgba(244,114,182,0.15)', url: 'https://images.unsplash.com/photo-1603368565782-aedb588ab683?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'buddha-garden', name: 'Buddha Garden', category: 'Sacred', accent: '#D4AF37', cardTint: 'rgba(212,175,55,0.06)', borderTint: 'rgba(212,175,55,0.15)', url: 'https://images.unsplash.com/photo-1771613934266-0f474dc34245?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  // Cosmos
  { id: 'nebula-purple', name: 'Purple Nebula', category: 'Cosmos', accent: '#A855F7', cardTint: 'rgba(168,85,247,0.07)', borderTint: 'rgba(168,85,247,0.15)', url: 'https://images.unsplash.com/photo-1709141428125-fa4c35fa99cc?w=1200&q=80', overlay: 'rgba(0,0,0,0.15)' },
  { id: 'cosmic-dust', name: 'Cosmic Dust', category: 'Cosmos', accent: '#3B82F6', cardTint: 'rgba(59,130,246,0.06)', borderTint: 'rgba(59,130,246,0.15)', url: 'https://images.unsplash.com/photo-1767188789418-6d531d8a89f7?w=1200&q=80', overlay: 'rgba(0,0,0,0.12)' },
  // Ocean
  { id: 'jellyfish-purple', name: 'Jellyfish Depths', category: 'Ocean', accent: '#06B6D4', cardTint: 'rgba(6,182,212,0.06)', borderTint: 'rgba(6,182,212,0.15)', url: 'https://images.unsplash.com/photo-1771864808299-d380c14eecdb?w=1200&q=80', overlay: 'rgba(0,0,0,0.15)' },
  { id: 'deep-blue', name: 'Deep Blue', category: 'Ocean', accent: '#0EA5E9', cardTint: 'rgba(14,165,233,0.06)', borderTint: 'rgba(14,165,233,0.15)', url: 'https://images.unsplash.com/photo-1744366071461-983202aa41c5?w=1200&q=80', overlay: 'rgba(0,0,0,0.12)' },
  // Forest
  { id: 'sunbeam-forest', name: 'Sunbeam Forest', category: 'Forest', accent: '#22C55E', cardTint: 'rgba(34,197,94,0.06)', borderTint: 'rgba(34,197,94,0.15)', url: 'https://images.unsplash.com/photo-1768903709732-11743cca896c?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'misty-woods', name: 'Misty Woods', category: 'Forest', accent: '#059669', cardTint: 'rgba(5,150,105,0.06)', borderTint: 'rgba(5,150,105,0.15)', url: 'https://images.unsplash.com/photo-1767948156141-42785b949ed6?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  // Stars
  { id: 'milky-way', name: 'Milky Way', category: 'Stars', accent: '#818CF8', cardTint: 'rgba(129,140,248,0.06)', borderTint: 'rgba(129,140,248,0.15)', url: 'https://images.unsplash.com/photo-1773760008677-938aece4d407?w=1200&q=80', overlay: 'rgba(0,0,0,0.12)' },
  { id: 'stargazer', name: 'Stargazer', category: 'Stars', accent: '#E0E7FF', cardTint: 'rgba(224,231,255,0.04)', borderTint: 'rgba(224,231,255,0.1)', url: 'https://images.unsplash.com/photo-1580734829638-25f80443ff4f?w=1200&q=80', overlay: 'rgba(0,0,0,0.15)' },
  // Nature
  { id: 'zen-pond', name: 'Zen Pond', category: 'Nature', accent: '#2DD4BF', cardTint: 'rgba(45,212,191,0.06)', borderTint: 'rgba(45,212,191,0.15)', url: 'https://images.unsplash.com/photo-1769973418397-4e2289f885c5?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'waterfall', name: 'Jungle Waterfall', category: 'Nature', accent: '#34D399', cardTint: 'rgba(52,211,153,0.06)', borderTint: 'rgba(52,211,153,0.15)', url: 'https://images.unsplash.com/photo-1682965742213-a6017eb1f750?w=1200&q=80', overlay: 'rgba(0,0,0,0.18)' },
  // Contextual (module-specific)
  { id: 'herb-garden', name: 'Herb Garden', category: 'Contextual', accent: '#84CC16', cardTint: 'rgba(132,204,22,0.06)', borderTint: 'rgba(132,204,22,0.15)', url: 'https://images.unsplash.com/photo-1719294552069-6aee7e529f46?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'yoga-summit', name: 'Yoga Summit', category: 'Contextual', accent: '#F97316', cardTint: 'rgba(249,115,22,0.06)', borderTint: 'rgba(249,115,22,0.15)', url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=1200&q=80', overlay: 'rgba(0,0,0,0.18)' },
  { id: 'oracle-temple', name: 'Oracle Temple', category: 'Contextual', accent: '#D97706', cardTint: 'rgba(217,119,6,0.07)', borderTint: 'rgba(217,119,6,0.15)', url: 'https://images.unsplash.com/photo-1699817674427-d053cf057c0b?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'aromatherapy-spa', name: 'Aromatherapy Spa', category: 'Contextual', accent: '#F59E0B', cardTint: 'rgba(245,158,11,0.05)', borderTint: 'rgba(245,158,11,0.12)', url: 'https://images.unsplash.com/photo-1581514439794-f9777f7c22eb?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'star-observatory', name: 'Star Observatory', category: 'Contextual', accent: '#F97316', cardTint: 'rgba(249,115,22,0.06)', borderTint: 'rgba(249,115,22,0.15)', url: 'https://images.unsplash.com/photo-1604423477447-70dd36d47c61?w=1200&q=80', overlay: 'rgba(0,0,0,0.12)' },
  { id: 'ancient-library', name: 'Ancient Library', category: 'Contextual', accent: '#B45309', cardTint: 'rgba(180,83,9,0.06)', borderTint: 'rgba(180,83,9,0.15)', url: 'https://images.unsplash.com/photo-1722182877533-7378b60bf1e8?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'nourish-bowl', name: 'Nourish Kitchen', category: 'Contextual', accent: '#65A30D', cardTint: 'rgba(101,163,13,0.06)', borderTint: 'rgba(101,163,13,0.12)', url: 'https://images.unsplash.com/photo-1567575990843-105a1c70d76e?w=1200&q=80', overlay: 'rgba(0,0,0,0.2)' },
  { id: 'lavender-field', name: 'Lavender Field', category: 'Contextual', accent: '#A855F7', cardTint: 'rgba(168,85,247,0.06)', borderTint: 'rgba(168,85,247,0.15)', url: 'https://images.unsplash.com/photo-1633527912957-ef20ddcb9d1d?w=1200&q=80', overlay: 'rgba(0,0,0,0.18)' },
  // Void
  { id: 'void', name: 'Void (Default)', category: 'Minimal', accent: '#8B5CF6', cardTint: 'rgba(255,255,255,0.02)', borderTint: 'rgba(255,255,255,0.06)', url: null, overlay: null },
];

// ═══ MODULE → DEFAULT SKIN MAPPING ═══
// Each module auto-loads its contextual scene unless user locks a global skin
const MODULE_SKINS = {
  '/breathing': 'chakra-meditation',
  '/meditation': 'cosmic-silhouette',
  '/yoga': 'yoga-summit',
  '/mudras': 'golden-meditation',
  '/mantras': 'buddha-garden',
  '/light-therapy': 'aurora-green',
  '/affirmations': 'lotus-bloom',
  '/daily-ritual': 'sunbeam-forest',
  '/mood': 'aurora-pink',
  '/oracle': 'oracle-temple',
  '/akashic-records': 'ancient-library',
  '/star-chart': 'star-observatory',
  '/numerology': 'nebula-purple',
  '/dreams': 'cosmic-dust',
  '/mayan': 'oracle-temple',
  '/cosmic-calendar': 'milky-way',
  '/cardology': 'oracle-temple',
  '/animal-totems': 'sunbeam-forest',
  '/zen-garden': 'zen-pond',
  '/soundscapes': 'deep-blue',
  '/music-lounge': 'jellyfish-purple',
  '/frequencies': 'nebula-purple',
  '/vr': 'cosmic-dust',
  '/journal': 'misty-woods',
  '/wisdom-journal': 'ancient-library',
  '/green-journal': 'herb-garden',
  '/nourishment': 'nourish-bowl',
  '/aromatherapy': 'aromatherapy-spa',
  '/herbology': 'herb-garden',
  '/elixirs': 'lavender-field',
  '/acupressure': 'buddha-garden',
  '/reiki': 'chakra-meditation',
  '/meal-planning': 'nourish-bowl',
  '/wellness-reports': 'aurora-green',
  '/discover': 'stargazer',
  '/encyclopedia': 'ancient-library',
  '/reading-list': 'ancient-library',
  '/creation-stories': 'oracle-temple',
  '/teachings': 'ancient-library',
  '/community': 'sunbeam-forest',
  '/blessings': 'lotus-bloom',
  '/sacred-texts': 'ancient-library',
  '/cosmic-profile': 'milky-way',
  '/coach': 'cosmic-silhouette',
  '/crystals': 'amethyst-glow',
  '/daily-briefing': 'aurora-green',
  '/forecasts': 'star-observatory',
  '/sovereigns': 'nebula-purple',
  '/economy': 'cosmic-dust',
  '/academy': 'ancient-library',
  '/trade-circle': 'deep-blue',
  '/crystal-skins': 'crystal-cave',
  '/archives': 'ancient-library',
  '/cosmic-ledger': 'stargazer',
  '/resource-alchemy': 'amethyst-glow',
  '/gravity-well': 'nebula-purple',
  '/cryptic-quest': 'misty-woods',
  '/games': 'aurora-pink',
};

const CATEGORIES = ['All', 'Meditation', 'Aurora', 'Crystals', 'Sacred', 'Cosmos', 'Ocean', 'Forest', 'Stars', 'Nature', 'Contextual', 'Minimal'];

const SceneContext = createContext(null);
export const useScene = () => useContext(SceneContext);

export function SceneProvider({ children }) {
  const location = useLocation();
  const [lockedSkinId, setLockedSkinId] = useState(() => localStorage.getItem('sovereign_skin_lock') || null);
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('sovereign_skin_locked') === 'true');
  const [pickerOpen, setPickerOpen] = useState(false);

  // Determine active skin: locked global OR contextual per-module
  const contextualSkinId = MODULE_SKINS[location.pathname] || 'void';
  const activeSkinId = isLocked && lockedSkinId ? lockedSkinId : contextualSkinId;
  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[SKINS.length - 1];

  const setScene = useCallback((id) => {
    setLockedSkinId(id);
    setIsLocked(true);
    localStorage.setItem('sovereign_skin_lock', id);
    localStorage.setItem('sovereign_skin_locked', 'true');
    localStorage.setItem('sovereign_scene', id);
  }, []);

  const unlockSkin = useCallback(() => {
    setIsLocked(false);
    localStorage.setItem('sovereign_skin_locked', 'false');
  }, []);

  const lockSkin = useCallback(() => {
    setIsLocked(true);
    localStorage.setItem('sovereign_skin_locked', 'true');
  }, []);

  // Inject CSS variables for accent colors — used by cards, borders, glows
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--skin-accent', activeSkin.accent);
    root.style.setProperty('--skin-card-tint', activeSkin.cardTint);
    root.style.setProperty('--skin-border-tint', activeSkin.borderTint);
    root.style.setProperty('--skin-accent-10', activeSkin.accent + '1A');
    root.style.setProperty('--skin-accent-20', activeSkin.accent + '33');
  }, [activeSkin]);

  // Manage scene-active class and style overrides
  useEffect(() => {
    const hasScene = activeSkin.url !== null;
    document.body.classList.toggle('scene-active', hasScene);
    const stage = document.getElementById('app-stage');
    if (stage) stage.style.background = hasScene ? 'transparent' : '';

    let styleEl = document.getElementById('scene-override-styles');
    if (hasScene) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'scene-override-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        body.scene-active [data-testid="content-area"] > * {
          background: rgba(0,0,0,0.1) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
        }
        body.scene-active [data-testid="sovereign-organism"],
        body.scene-active #app-stage,
        body.scene-active #root {
          background: transparent !important;
        }
        /* Sovereign Glass — All interactive cards get glass treatment */
        body.scene-active .immersive-page [class*="rounded-xl"][class*="p-4"],
        body.scene-active .immersive-page [class*="rounded-xl"][class*="p-3"],
        body.scene-active .immersive-page [class*="rounded-lg"][class*="p-4"],
        body.scene-active .immersive-page [class*="rounded-lg"][class*="p-3"] {
          background: rgba(0,0,0,0) !important;
          backdrop-filter: blur(10px) saturate(140%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
          cursor: pointer;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        body.scene-active .immersive-page [class*="rounded-xl"][class*="p-4"]:hover,
        body.scene-active .immersive-page [class*="rounded-xl"][class*="p-3"]:hover,
        body.scene-active .immersive-page [class*="rounded-lg"][class*="p-4"]:hover,
        body.scene-active .immersive-page [class*="rounded-lg"][class*="p-3"]:hover {
          background: rgba(0,0,0,0) !important;
          border-color: rgba(255,255,255,0.12) !important;
          box-shadow: 0 0 20px rgba(var(--skin-accent-rgb, 99,102,241), 0.08);
        }
      `;
    } else if (styleEl) {
      styleEl.remove();
    }
  }, [activeSkin]);

  const ctx = {
    activeSkin, activeScene: activeSkin, // backwards compat
    setScene, isLocked, lockSkin, unlockSkin,
    scenes: SKINS, categories: CATEGORIES,
    pickerOpen, setPickerOpen,
    contextualSkinId, lockedSkinId,
  };

  return (
    <SceneContext.Provider value={ctx}>
      {activeSkin.url && (
        <div data-testid="realm-scene-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', transition: 'opacity 0.5s ease' }}>
          <img src={activeSkin.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1, transition: 'opacity 0.8s ease' }} />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      <AnimatePresence>
        {pickerOpen && <SkinPicker onClose={() => setPickerOpen(false)} />}
      </AnimatePresence>
    </SceneContext.Provider>
  );
}

function SkinPicker({ onClose }) {
  const { activeSkin, setScene, isLocked, lockSkin, unlockSkin, scenes, categories, contextualSkinId } = useScene();
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? scenes : scenes.filter(s => s.category === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'transparent', display: 'flex', flexDirection: 'column' }}
      data-testid="scene-picker">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-sm font-bold text-white/90">Realm Skins</h2>
          <p className="text-[9px] text-white/30">{scenes.length} realms · {isLocked ? 'Locked to ' + activeSkin.name : 'Auto-contextual'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => isLocked ? unlockSkin() : lockSkin()}
            className="p-2 rounded-lg active:scale-90 flex items-center gap-1"
            style={{ background: isLocked ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isLocked ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}` }}
            data-testid="skin-lock-toggle">
            {isLocked ? <Lock size={12} className="text-purple-400" /> : <Unlock size={12} className="text-white/40" />}
            <span className="text-[8px] font-bold" style={{ color: isLocked ? '#A78BFA' : 'rgba(255,255,255,0.65)' }}>{isLocked ? 'Locked' : 'Auto'}</span>
          </button>
          <button onClick={onClose} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={16} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <p className="text-[8px] text-white/25">
          {isLocked
            ? `Global skin locked: "${activeSkin.name}" on every page`
            : `Auto mode: each module loads its own world. Currently: "${activeSkin.name}"`}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-3 py-1 rounded-full text-[9px] font-medium whitespace-nowrap active:scale-95"
            style={{ background: filter === cat ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${filter === cat ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`, color: filter === cat ? '#A78BFA' : 'rgba(255,255,255,0.4)' }}
            data-testid={`scene-cat-${cat.toLowerCase()}`}>{cat}</button>
        ))}
      </div>

      {/* Skin grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(skin => {
            const isActive = activeSkin.id === skin.id;
            const isContextual = contextualSkinId === skin.id && !isLocked;
            return (
              <button key={skin.id} onClick={() => { setScene(skin.id); onClose(); }}
                className="rounded-xl overflow-hidden active:scale-95 transition-all text-left"
                style={{ border: `2px solid ${isActive ? skin.accent : 'rgba(255,255,255,0.06)'}`, boxShadow: isActive ? `0 0 20px ${skin.accent}30` : 'none' }}
                data-testid={`scene-${skin.id}`}>
                <div style={{ height: 90, background: '#111', position: 'relative' }}>
                  {skin.url ? (
                    <img src={skin.url} alt={skin.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-[10px] text-white/15">VOID</span>
                    </div>
                  )}
                  {isActive && (
                    <div style={{ position: 'absolute', top: 4, right: 4, background: skin.accent, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} color="#fff" />
                    </div>
                  )}
                  {isContextual && !isActive && (
                    <div style={{ position: 'absolute', top: 4, left: 4, background: 'transparent', borderRadius: 4, padding: '1px 4px' }}>
                      <span className="text-[6px] text-white/50">THIS PAGE</span>
                    </div>
                  )}
                </div>
                <div className="p-2" style={{ background: 'transparent' }}>
                  <div className="text-[10px] font-medium" style={{ color: isActive ? skin.accent : 'rgba(255,255,255,0.7)' }}>{skin.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: skin.accent }} />
                    <span className="text-[7px] text-white/25">{skin.category}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export { SKINS, MODULE_SKINS, CATEGORIES };
