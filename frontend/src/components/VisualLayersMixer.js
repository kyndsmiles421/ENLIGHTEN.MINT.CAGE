import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Film, Hexagon, Sparkles, Layers, Plus, Trash2, Eye, EyeOff,
  ChevronDown, ChevronUp, GripVertical,
} from 'lucide-react';

/* ─── Layer Type Definitions ─── */

export const LIGHT_MODES = [
  { id: 'sunrise', label: 'Sunrise Glow', colors: ['#FCD34D', '#FB923C', '#EF4444'], speed: 4000 },
  { id: 'aurora', label: 'Aurora', colors: ['#22C55E', '#2DD4BF', '#3B82F6', '#8B5CF6'], speed: 3000 },
  { id: 'calm-blue', label: 'Calm Blue', colors: ['#1E3A5F', '#3B82F6', '#06B6D4'], speed: 5000 },
  { id: 'healing-green', label: 'Healing Green', colors: ['#064E3B', '#22C55E', '#2DD4BF'], speed: 4500 },
  { id: 'violet-flame', label: 'Violet Flame', colors: ['#4C1D95', '#8B5CF6', '#C084FC', '#E879F9'], speed: 3500 },
  { id: 'golden', label: 'Golden Light', colors: ['#78350F', '#F59E0B', '#FCD34D'], speed: 5000 },
];

export const VIDEO_OVERLAYS = [
  { id: 'stars', label: 'Starfield', url: 'https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_25fps.mp4', color: '#818CF8' },
  { id: 'northern-lights', label: 'Northern Lights', url: 'https://videos.pexels.com/video-files/3214448/3214448-uhd_2560_1440_25fps.mp4', color: '#2DD4BF' },
  { id: 'ocean-waves', label: 'Ocean', url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4', color: '#3B82F6' },
  { id: 'forest', label: 'Forest', url: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4', color: '#22C55E' },
  { id: 'fire', label: 'Campfire', url: 'https://videos.pexels.com/video-files/855535/855535-hd_1920_1080_30fps.mp4', color: '#F59E0B' },
];

export const FRACTAL_TYPES = [
  { id: 'mandelbrot', label: 'Mandelbrot', color: '#8B5CF6' },
  { id: 'julia', label: 'Julia Set', color: '#3B82F6' },
  { id: 'sacred-geo', label: 'Sacred Geometry', color: '#22C55E' },
  { id: 'fibonacci', label: 'Fibonacci Spiral', color: '#FCD34D' },
  { id: 'flower-of-life', label: 'Flower of Life', color: '#EC4899' },
  { id: 'sri-yantra', label: 'Sri Yantra', color: '#F59E0B' },
];

export const VISUAL_FILTERS = [
  { id: 'bloom', label: 'Bloom', color: '#FBBF24', css: (i) => `brightness(${1 + i * 0.6}) contrast(${1 + i * 0.2})` },
  { id: 'film-grain', label: 'Film Grain', color: '#A8A29E', hasCanvas: true, css: () => '' },
  { id: 'chromatic', label: 'Chromatic', color: '#F472B6', hasCanvas: true, css: () => '' },
  { id: 'sepia', label: 'Sepia', color: '#D97706', css: (i) => `sepia(${i * 0.9}) saturate(${0.8 + i * 0.4})` },
  { id: 'neon-glow', label: 'Neon Glow', color: '#34D399', css: (i) => `brightness(${1 + i * 0.4}) saturate(${1 + i * 1.5})` },
  { id: 'dream-haze', label: 'Dream Haze', color: '#C4B5FD', css: (i) => `blur(${i * 2}px) brightness(${1 + i * 0.2})` },
  { id: 'vhs-retro', label: 'VHS Retro', color: '#FB923C', hasCanvas: true, css: (i) => `saturate(${1.4 + i * 0.8}) contrast(${1.1 + i * 0.3})` },
  { id: 'ethereal', label: 'Ethereal', color: '#818CF8', css: (i) => `brightness(${1.1 + i * 0.3}) blur(${i * 0.8}px)` },
  { id: 'kaleidoscope', label: 'Kaleidoscope', color: '#F43F5E', hasCanvas: true, css: (i) => `hue-rotate(${i * 180}deg) saturate(${1.5 + i})` },
  { id: 'infrared', label: 'Infrared', color: '#EF4444', css: (i) => `hue-rotate(${-30 + i * 40}deg) saturate(${2 + i * 2})` },
  { id: 'cyberpunk', label: 'Cyberpunk', color: '#06B6D4', css: (i) => `contrast(${1.3 + i * 0.4}) saturate(${1.5 + i * 1.5})` },
  { id: 'vintage', label: 'Vintage', color: '#92400E', css: (i) => `sepia(${i * 0.5}) saturate(${0.6 + i * 0.3}) brightness(${0.9 + i * 0.1})` },
];

const TYPE_META = {
  light:   { icon: Sun,      label: 'Light',   accent: '#FCD34D', items: LIGHT_MODES },
  video:   { icon: Film,     label: 'Video',   accent: '#818CF8', items: VIDEO_OVERLAYS },
  fractal: { icon: Hexagon,  label: 'Fractal', accent: '#8B5CF6', items: FRACTAL_TYPES },
  filter:  { icon: Sparkles, label: 'Filter',  accent: '#F472B6', items: VISUAL_FILTERS },
};

const LAYER_TYPES = ['light', 'video', 'fractal', 'filter'];

let layerCounter = 0;

/* ─── Visual Layers Mixer Board ─── */
export function VisualLayersMixer({ layers, onLayersChange }) {
  const [addingType, setAddingType] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const addLayer = useCallback((type, itemId) => {
    layerCounter++;
    const newLayer = {
      uid: `vl-${Date.now()}-${layerCounter}`,
      type,
      itemId,
      opacity: type === 'filter' ? 50 : 60,
      visible: true,
      colorShift: 0,
    };
    onLayersChange(prev => [...prev, newLayer]);
    setAddingType(null);
  }, [onLayersChange]);

  const updateLayer = useCallback((uid, updates) => {
    onLayersChange(prev => prev.map(l => l.uid === uid ? { ...l, ...updates } : l));
  }, [onLayersChange]);

  const removeLayer = useCallback((uid) => {
    onLayersChange(prev => prev.filter(l => l.uid !== uid));
  }, [onLayersChange]);

  const moveLayer = useCallback((uid, direction) => {
    onLayersChange(prev => {
      const idx = prev.findIndex(l => l.uid === uid);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }, [onLayersChange]);

  const clearAll = useCallback(() => {
    onLayersChange([]);
  }, [onLayersChange]);

  const activeCount = layers.length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
      data-testid="visual-layers-mixer">

      {/* Header */}
      <button onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2.5 transition-all hover:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Layers size={12} style={{ color: activeCount > 0 ? '#C084FC' : 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: activeCount > 0 ? '#C084FC' : 'var(--text-muted)' }}>
            Visual Stack
          </span>
          {activeCount > 0 && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC' }}>
              {activeCount} layer{activeCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {collapsed ? <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">

              {/* Add Layer Buttons */}
              <div className="flex items-center gap-1.5" data-testid="add-layer-buttons">
                {LAYER_TYPES.map(type => {
                  const meta = TYPE_META[type];
                  const Icon = meta.icon;
                  return (
                    <button key={type}
                      onClick={() => setAddingType(addingType === type ? null : type)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-all hover:scale-[1.03]"
                      style={{
                        background: addingType === type ? `${meta.accent}12` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${addingType === type ? `${meta.accent}25` : 'rgba(255,255,255,0.04)'}`,
                        color: addingType === type ? meta.accent : 'var(--text-muted)',
                      }}
                      data-testid={`add-${type}-btn`}>
                      <Plus size={8} /> <Icon size={9} /> {meta.label}
                    </button>
                  );
                })}
                {activeCount > 0 && (
                  <button onClick={clearAll}
                    className="ml-auto px-2 py-1.5 rounded-lg text-[9px] transition-all hover:bg-red-500/10"
                    style={{ color: 'var(--text-muted)' }}
                    data-testid="clear-all-layers">
                    <Trash2 size={8} />
                  </button>
                )}
              </div>

              {/* Item Picker (when adding) */}
              <AnimatePresence>
                {addingType && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="flex flex-wrap gap-1.5 py-1.5 px-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.015)' }}
                      data-testid={`picker-${addingType}`}>
                      {TYPE_META[addingType].items.map(item => (
                        <button key={item.id} onClick={() => addLayer(addingType, item.id)}
                          className="text-[9px] px-2.5 py-1.5 rounded-full transition-all hover:scale-105 flex items-center gap-1"
                          style={{
                            background: `${item.color || TYPE_META[addingType].accent}10`,
                            border: `1px solid ${item.color || TYPE_META[addingType].accent}25`,
                            color: item.color || TYPE_META[addingType].accent,
                          }}
                          data-testid={`pick-${addingType}-${item.id}`}>
                          {item.colors && (
                            <div className="flex -space-x-0.5">
                              {item.colors.slice(0, 3).map((c, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                              ))}
                            </div>
                          )}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Layers Stack */}
              {layers.length > 0 && (
                <div className="space-y-1" data-testid="active-layers-stack">
                  {[...layers].reverse().map((layer, reversedIdx) => {
                    const realIdx = layers.length - 1 - reversedIdx;
                    const meta = TYPE_META[layer.type];
                    const items = meta?.items || [];
                    const item = items.find(i => i.id === layer.itemId);
                    const Icon = meta?.icon || Layers;
                    const itemColor = item?.color || item?.colors?.[0] || meta?.accent || '#888';

                    return (
                      <div key={layer.uid}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg group transition-all"
                        style={{
                          background: layer.visible ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.005)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          opacity: layer.visible ? 1 : 0.5,
                        }}
                        data-testid={`layer-${layer.uid}`}>

                        {/* Reorder */}
                        <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveLayer(layer.uid, 1)} className="p-0"
                            style={{ color: 'var(--text-muted)' }} disabled={realIdx === layers.length - 1}>
                            <ChevronUp size={8} />
                          </button>
                          <button onClick={() => moveLayer(layer.uid, -1)} className="p-0"
                            style={{ color: 'var(--text-muted)' }} disabled={realIdx === 0}>
                            <ChevronDown size={8} />
                          </button>
                        </div>

                        {/* Type + Name */}
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: itemColor }} />
                        <Icon size={9} style={{ color: meta?.accent }} className="flex-shrink-0" />
                        <span className="text-[9px] flex-shrink-0 w-20 truncate" style={{ color: 'var(--text-secondary)' }}>
                          {item?.label || layer.itemId}
                        </span>

                        {/* Opacity Fader */}
                        <input type="range" min={0} max={100} value={layer.opacity}
                          onChange={e => updateLayer(layer.uid, { opacity: parseInt(e.target.value) })}
                          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${itemColor} ${layer.opacity}%, rgba(255,255,255,0.06) ${layer.opacity}%)`,
                            accentColor: itemColor,
                          }}
                          data-testid={`layer-opacity-${layer.uid}`} />
                        <span className="text-[8px] w-6 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {layer.opacity}%
                        </span>

                        {/* Visibility toggle */}
                        <button onClick={() => updateLayer(layer.uid, { visible: !layer.visible })}
                          className="p-0.5 transition-all"
                          style={{ color: layer.visible ? 'var(--text-muted)' : 'rgba(255,255,255,0.15)' }}
                          data-testid={`layer-vis-${layer.uid}`}>
                          {layer.visible ? <Eye size={9} /> : <EyeOff size={9} />}
                        </button>

                        {/* Remove */}
                        <button onClick={() => removeLayer(layer.uid)}
                          className="p-0.5 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
                          style={{ color: 'var(--text-muted)' }}
                          data-testid={`layer-remove-${layer.uid}`}>
                          <Trash2 size={9} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {layers.length === 0 && (
                <p className="text-[9px] text-center py-2" style={{ color: 'var(--text-muted)' }}>
                  Tap + to add visual layers — stack fractals, videos, lights & filters
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
