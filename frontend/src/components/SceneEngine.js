/**
 * V41.0 IMMERSIVE SCENE ENGINE
 * 
 * Full-screen visual environments that wrap every module.
 * Users pick a scene → it becomes the background across the entire app.
 * Stored in localStorage so it persists.
 */

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Check } from 'lucide-react';

const SCENES = [
  // Cosmic & Meditation
  { id: 'chakra-meditation', name: 'Chakra Meditation', category: 'Meditation', url: 'https://images.unsplash.com/photo-1633434896425-715c2c82509a?w=1200&q=80', overlay: 'rgba(0,0,0,0.55)' },
  { id: 'cosmic-silhouette', name: 'Cosmic Silhouette', category: 'Meditation', url: 'https://images.unsplash.com/photo-1612890877530-85a8c47d968b?w=1200&q=80', overlay: 'rgba(0,0,0,0.45)' },
  { id: 'golden-meditation', name: 'Golden Meditation', category: 'Meditation', url: 'https://images.unsplash.com/photo-1633942941070-0fb66452f4f7?w=1200&q=80', overlay: 'rgba(0,0,0,0.5)' },

  // Aurora & Northern Lights
  { id: 'aurora-pink', name: 'Pink Aurora', category: 'Aurora', url: 'https://images.unsplash.com/photo-1716155705161-fcf2e13da07a?w=1200&q=80', overlay: 'rgba(0,0,0,0.4)' },
  { id: 'aurora-green', name: 'Emerald Aurora', category: 'Aurora', url: 'https://images.unsplash.com/photo-1610989432929-9769f3cf8006?w=1200&q=80', overlay: 'rgba(0,0,0,0.35)' },
  { id: 'aurora-reflect', name: 'Aurora Reflection', category: 'Aurora', url: 'https://images.unsplash.com/photo-1711117479224-e9b123f52dcb?w=1200&q=80', overlay: 'rgba(0,0,0,0.4)' },

  // Crystals
  { id: 'amethyst-glow', name: 'Amethyst Glow', category: 'Crystals', url: 'https://images.unsplash.com/photo-1728934140045-8b849067e0a8?w=1200&q=80', overlay: 'rgba(0,0,0,0.5)' },
  { id: 'crystal-cave', name: 'Crystal Cave', category: 'Crystals', url: 'https://images.unsplash.com/photo-1636548974452-7217d5eab8dc?w=1200&q=80', overlay: 'rgba(0,0,0,0.4)' },
  { id: 'crystal-cluster', name: 'Crystal Cluster', category: 'Crystals', url: 'https://images.unsplash.com/photo-1635491108115-f843a860cebb?w=1200&q=80', overlay: 'rgba(0,0,0,0.45)' },

  // Sacred Water & Lotus
  { id: 'buddha-garden', name: 'Buddha Garden', category: 'Sacred', url: 'https://images.unsplash.com/photo-1771613934266-0f474dc34245?w=1200&q=80', overlay: 'rgba(0,0,0,0.5)' },
  { id: 'lotus-bloom', name: 'Lotus Bloom', category: 'Sacred', url: 'https://images.unsplash.com/photo-1603368565782-aedb588ab683?w=1200&q=80', overlay: 'rgba(0,0,0,0.5)' },
  { id: 'pink-lotus', name: 'Pink Lotus', category: 'Sacred', url: 'https://images.pexels.com/photos/28825581/pexels-photo-28825581.jpeg?auto=compress&w=1200', overlay: 'rgba(0,0,0,0.45)' },

  // Cosmic & Nebula
  { id: 'nebula-purple', name: 'Purple Nebula', category: 'Cosmos', url: 'https://images.unsplash.com/photo-1709141428125-fa4c35fa99cc?w=1200&q=80', overlay: 'rgba(0,0,0,0.35)' },
  { id: 'heart-nebula', name: 'Heart Nebula', category: 'Cosmos', url: 'https://images.unsplash.com/photo-1765120298918-e9932c6c0332?w=1200&q=80', overlay: 'rgba(0,0,0,0.35)' },
  { id: 'cosmic-dust', name: 'Cosmic Dust', category: 'Cosmos', url: 'https://images.unsplash.com/photo-1767188789418-6d531d8a89f7?w=1200&q=80', overlay: 'rgba(0,0,0,0.3)' },

  // Deep Ocean
  { id: 'jellyfish-purple', name: 'Jellyfish Depths', category: 'Ocean', url: 'https://images.unsplash.com/photo-1771864808299-d380c14eecdb?w=1200&q=80', overlay: 'rgba(0,0,0,0.35)' },
  { id: 'deep-blue', name: 'Deep Blue', category: 'Ocean', url: 'https://images.unsplash.com/photo-1744366071461-983202aa41c5?w=1200&q=80', overlay: 'rgba(0,0,0,0.3)' },
  { id: 'bioluminescent', name: 'Bioluminescent', category: 'Ocean', url: 'https://images.unsplash.com/photo-1767145097475-0d16ec184a8c?w=1200&q=80', overlay: 'rgba(0,0,0,0.35)' },

  // Enchanted Forest
  { id: 'sunbeam-forest', name: 'Sunbeam Forest', category: 'Forest', url: 'https://images.unsplash.com/photo-1768903709732-11743cca896c?w=1200&q=80', overlay: 'rgba(0,0,0,0.45)' },
  { id: 'misty-woods', name: 'Misty Woods', category: 'Forest', url: 'https://images.unsplash.com/photo-1767948156141-42785b949ed6?w=1200&q=80', overlay: 'rgba(0,0,0,0.45)' },
  { id: 'forest-rays', name: 'Forest Rays', category: 'Forest', url: 'https://images.unsplash.com/photo-1604521431514-eb6ed76c977a?w=1200&q=80', overlay: 'rgba(0,0,0,0.5)' },

  // Desert & Stars
  { id: 'milky-way', name: 'Milky Way', category: 'Stars', url: 'https://images.unsplash.com/photo-1773760008677-938aece4d407?w=1200&q=80', overlay: 'rgba(0,0,0,0.3)' },
  { id: 'desert-stars', name: 'Desert Stars', category: 'Stars', url: 'https://images.unsplash.com/photo-1568405336404-1fefdca58699?w=1200&q=80', overlay: 'rgba(0,0,0,0.3)' },
  { id: 'stargazer', name: 'Stargazer', category: 'Stars', url: 'https://images.unsplash.com/photo-1580734829638-25f80443ff4f?w=1200&q=80', overlay: 'rgba(0,0,0,0.35)' },

  // Zen & Nature
  { id: 'zen-pond', name: 'Zen Pond', category: 'Nature', url: 'https://images.unsplash.com/photo-1769973418397-4e2289f885c5?w=1200&q=80', overlay: 'rgba(0,0,0,0.45)' },
  { id: 'japanese-garden', name: 'Japanese Garden', category: 'Nature', url: 'https://images.unsplash.com/photo-1759891093227-ab392b148730?w=1200&q=80', overlay: 'rgba(0,0,0,0.45)' },
  { id: 'waterfall', name: 'Jungle Waterfall', category: 'Nature', url: 'https://images.unsplash.com/photo-1682965742213-a6017eb1f750?w=1200&q=80', overlay: 'rgba(0,0,0,0.4)' },

  // Sacred Geometry
  { id: 'mandala', name: 'Sacred Mandala', category: 'Sacred', url: 'https://images.unsplash.com/photo-1773037317299-c9cf9b28c5d1?w=1200&q=80', overlay: 'rgba(0,0,0,0.5)' },

  // Void — pure black (default)
  { id: 'void', name: 'Void (Default)', category: 'Minimal', url: null, overlay: null },
];

const CATEGORIES = ['All', 'Meditation', 'Aurora', 'Crystals', 'Sacred', 'Cosmos', 'Ocean', 'Forest', 'Stars', 'Nature', 'Minimal'];

const SceneContext = createContext(null);
export const useScene = () => useContext(SceneContext);

export function SceneProvider({ children }) {
  const [activeSceneId, setActiveSceneId] = useState(() => localStorage.getItem('sovereign_scene') || 'void');
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeScene = SCENES.find(s => s.id === activeSceneId) || SCENES[SCENES.length - 1];

  const setScene = useCallback((id) => {
    setActiveSceneId(id);
    localStorage.setItem('sovereign_scene', id);
  }, []);

  // When a scene is active, make backgrounds transparent so scene shows through
  useEffect(() => {
    const hasScene = activeScene.url !== null;
    document.body.classList.toggle('scene-active', hasScene);
    const stage = document.getElementById('app-stage');
    if (stage) {
      stage.style.background = hasScene ? 'transparent' : '';
    }
    // Override ALL inline backgrounds on content pages
    let styleEl = document.getElementById('scene-override-styles');
    if (hasScene) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'scene-override-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        body.scene-active [data-testid="content-area"] > * {
          background: rgba(0,0,0,0.4) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
        }
        body.scene-active [data-testid="sovereign-organism"] {
          background: transparent !important;
        }
        body.scene-active #app-stage {
          background: transparent !important;
        }
        body.scene-active #root {
          background: transparent !important;
        }
      `;
    } else if (styleEl) {
      styleEl.remove();
    }
  }, [activeScene]);

  return (
    <SceneContext.Provider value={{ activeScene, setScene, scenes: SCENES, categories: CATEGORIES, pickerOpen, setPickerOpen }}>
      {/* Full-screen background layer — same plane, behind content */}
      {activeScene.url && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        }}>
          <img src={activeScene.url} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8,
          }} />
          {/* Overlay for readability */}
          <div style={{ position: 'absolute', inset: 0, background: activeScene.overlay || 'rgba(0,0,0,0.5)' }} />
        </div>
      )}
      {/* Content on top */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      {/* Scene Picker */}
      <AnimatePresence>
        {pickerOpen && <ScenePicker onClose={() => setPickerOpen(false)} />}
      </AnimatePresence>
    </SceneContext.Provider>
  );
}

function ScenePicker({ onClose }) {
  const { activeScene, setScene, scenes, categories } = useScene();
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? scenes : scenes.filter(s => s.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}
      data-testid="scene-picker">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-sm font-bold text-white/90">Choose Your Environment</h2>
          <p className="text-[9px] text-white/30">{scenes.length} immersive scenes</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <X size={16} className="text-white/60" />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-3 py-1 rounded-full text-[9px] font-medium whitespace-nowrap active:scale-95"
            style={{
              background: filter === cat ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === cat ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
              color: filter === cat ? '#A78BFA' : 'rgba(255,255,255,0.4)',
            }}
            data-testid={`scene-cat-${cat.toLowerCase()}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Scene grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(scene => {
            const isActive = activeScene.id === scene.id;
            return (
              <button key={scene.id}
                onClick={() => { setScene(scene.id); onClose(); }}
                className="rounded-xl overflow-hidden active:scale-95 transition-all"
                style={{
                  border: `2px solid ${isActive ? '#A78BFA' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive ? '0 0 20px rgba(139,92,246,0.2)' : 'none',
                }}
                data-testid={`scene-${scene.id}`}>
                <div style={{ height: 100, background: '#111', position: 'relative' }}>
                  {scene.url ? (
                    <img src={scene.url} alt={scene.name} loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-[10px] text-white/15">VOID</span>
                    </div>
                  )}
                  {isActive && (
                    <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(139,92,246,0.9)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#fff" />
                    </div>
                  )}
                </div>
                <div className="p-2" style={{ background: 'rgba(0,0,0,0.8)' }}>
                  <div className="text-[10px] font-medium text-white/70">{scene.name}</div>
                  <div className="text-[7px] text-white/25">{scene.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export { SCENES, CATEGORIES };
