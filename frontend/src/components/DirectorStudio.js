import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film, Play, Pause, Square, ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff,
  Layers, Grid, List, Link2, Scissors, Copy, Clock, Video, Sparkles, Bookmark,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Volume2, VolumeX, RotateCcw,
  Zap, Sliders, Crosshair, RefreshCw,
} from 'lucide-react';

/* ─── Video Library for Director's Cut Studio ─── */
export const DIRECTOR_VIDEO_LIBRARY = [
  // Nature & Elements
  { id: 'ocean-waves', label: 'Ocean Waves', category: 'nature', url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4', color: '#3B82F6', duration: '∞', tier: 'free' },
  { id: 'forest', label: 'Sacred Forest', category: 'nature', url: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4', color: '#22C55E', duration: '∞', tier: 'free' },
  { id: 'northern-lights', label: 'Northern Lights', category: 'celestial', url: 'https://videos.pexels.com/video-files/3214448/3214448-uhd_2560_1440_25fps.mp4', color: '#2DD4BF', duration: '∞', tier: 'player' },
  { id: 'starfield', label: 'Starfield', category: 'celestial', url: 'https://videos.pexels.com/video-files/857195/857195-hd_1280_720_25fps.mp4', color: '#818CF8', duration: '∞', tier: 'player' },
  { id: 'rain-window', label: 'Rain on Glass', category: 'nature', url: 'https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4', color: '#60A5FA', duration: '∞', tier: 'player' },
  { id: 'cosmos-deep', label: 'Deep Cosmos', category: 'celestial', url: 'https://videos.pexels.com/video-files/1851190/1851190-uhd_2560_1440_25fps.mp4', color: '#A78BFA', duration: '∞', tier: 'ultra' },
  { id: 'forest-uhd', label: 'Enchanted Forest 4K', category: 'nature', url: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4', color: '#34D399', duration: '∞', tier: 'ultra' },
  { id: 'aurora-uhd', label: 'Aurora Borealis 4K', category: 'celestial', url: 'https://videos.pexels.com/video-files/3214448/3214448-uhd_2560_1440_25fps.mp4', color: '#FBBF24', duration: '∞', tier: 'sovereign' },
  // Fire & Energy
  { id: 'fire-flames', label: 'Sacred Fire', category: 'energy', url: 'https://videos.pexels.com/video-files/856546/856546-hd_1920_1080_24fps.mp4', color: '#F59E0B', duration: '∞', tier: 'free' },
  { id: 'candle-flame', label: 'Candle Meditation', category: 'energy', url: 'https://videos.pexels.com/video-files/3621205/3621205-uhd_2560_1440_25fps.mp4', color: '#FBBF24', duration: '∞', tier: 'player' },
  // Water
  { id: 'waterfall', label: 'Waterfall', category: 'nature', url: 'https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4', color: '#06B6D4', duration: '∞', tier: 'player' },
  { id: 'underwater', label: 'Underwater Realm', category: 'nature', url: 'https://videos.pexels.com/video-files/2556052/2556052-uhd_2560_1440_25fps.mp4', color: '#0EA5E9', duration: '∞', tier: 'ultra' },
  // Sky & Clouds
  { id: 'clouds-timelapse', label: 'Cloud Journey', category: 'celestial', url: 'https://videos.pexels.com/video-files/1542896/1542896-hd_1920_1080_24fps.mp4', color: '#94A3B8', duration: '∞', tier: 'free' },
  { id: 'sunset-golden', label: 'Golden Sunset', category: 'celestial', url: 'https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_25fps.mp4', color: '#F97316', duration: '∞', tier: 'player' },
];

export const BLEND_MODES = [
  { id: 'normal', label: 'Normal' },
  { id: 'screen', label: 'Screen' },
  { id: 'multiply', label: 'Multiply' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'soft-light', label: 'Soft Light' },
  { id: 'hard-light', label: 'Hard Light' },
  { id: 'difference', label: 'Difference' },
  { id: 'exclusion', label: 'Exclusion' },
  { id: 'color-dodge', label: 'Color Dodge' },
  { id: 'color-burn', label: 'Color Burn' },
  { id: 'luminosity', label: 'Luminosity' },
  { id: 'saturation', label: 'Saturation' },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'nature', label: 'Nature' },
  { id: 'celestial', label: 'Celestial' },
  { id: 'energy', label: 'Energy' },
];

let layerIdCounter = 0;

/* ─────────────────────────────────────────────────────────
   Director's Cut Production Studio Component
   ───────────────────────────────────────────────────────── */
export default function DirectorStudio({ 
  activeVideoLayers = [], 
  onLayersChange,
  crossReferences = [],
  onCrossReferencesChange,
  isExpanded = false,
  onExpandChange,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'timeline'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showLibrary, setShowLibrary] = useState(true);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [masterMuted, setMasterMuted] = useState(true);
  const [showCrossRefPanel, setShowCrossRefPanel] = useState(false);
  const [newCrossRef, setNewCrossRef] = useState({ from: null, to: null, note: '' });

  // Timeline state
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [timelineDuration, setTimelineDuration] = useState(60); // 60 seconds default

  // Video preview refs
  const previewRefs = useRef({});

  const filteredVideos = DIRECTOR_VIDEO_LIBRARY.filter(v => 
    categoryFilter === 'all' || v.category === categoryFilter
  );

  /* ─── Layer Management ─── */
  const addVideoLayer = useCallback((video) => {
    layerIdCounter++;
    const newLayer = {
      uid: `vl-${Date.now()}-${layerIdCounter}`,
      type: 'video',
      videoId: video.id,
      videoData: video,
      opacity: 70,
      blendMode: 'screen',
      visible: true,
      muted: true,
      playbackRate: 1,
      startTime: 0,
      volume: 50,
      transform: { scale: 1, x: 0, y: 0, rotation: 0 },
      effects: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0 },
    };
    onLayersChange(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.uid);
  }, [onLayersChange]);

  const updateLayer = useCallback((uid, updates) => {
    onLayersChange(prev => prev.map(l => l.uid === uid ? { ...l, ...updates } : l));
  }, [onLayersChange]);

  const removeLayer = useCallback((uid) => {
    onLayersChange(prev => prev.filter(l => l.uid !== uid));
    if (selectedLayerId === uid) setSelectedLayerId(null);
  }, [onLayersChange, selectedLayerId]);

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

  const duplicateLayer = useCallback((uid) => {
    const layer = activeVideoLayers.find(l => l.uid === uid);
    if (!layer) return;
    layerIdCounter++;
    const newLayer = {
      ...layer,
      uid: `vl-${Date.now()}-${layerIdCounter}`,
      opacity: Math.max(30, layer.opacity - 20),
    };
    onLayersChange(prev => [...prev, newLayer]);
  }, [activeVideoLayers, onLayersChange]);

  /* ─── Cross-Reference Management ─── */
  const addCrossReference = useCallback(() => {
    if (!newCrossRef.from || !newCrossRef.to) return;
    const ref = {
      id: `xref-${Date.now()}`,
      fromLayerId: newCrossRef.from,
      toLayerId: newCrossRef.to,
      note: newCrossRef.note,
      timestamp: timelinePosition,
    };
    onCrossReferencesChange(prev => [...prev, ref]);
    setNewCrossRef({ from: null, to: null, note: '' });
  }, [newCrossRef, timelinePosition, onCrossReferencesChange]);

  const removeCrossReference = useCallback((id) => {
    onCrossReferencesChange(prev => prev.filter(r => r.id !== id));
  }, [onCrossReferencesChange]);

  /* ─── Playback Control ─── */
  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying);
    Object.values(previewRefs.current).forEach(ref => {
      if (ref) {
        if (isPlaying) ref.pause();
        else ref.play().catch(() => {});
      }
    });
  }, [isPlaying]);

  const resetTimeline = useCallback(() => {
    setTimelinePosition(0);
    Object.values(previewRefs.current).forEach(ref => {
      if (ref) ref.currentTime = 0;
    });
  }, []);

  const selectedLayer = activeVideoLayers.find(l => l.uid === selectedLayerId);

  return (
    <div className="rounded-2xl overflow-hidden" 
      style={{ 
        background: 'linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(0,0,0,0) 100%)',
        border: '1px solid rgba(129,140,248,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
      data-testid="director-studio">

      {/* ─── Studio Header ─── */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(129,140,248,0.08)', background: 'rgba(129,140,248,0.02)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Film size={16} style={{ color: '#818CF8' }} />
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#818CF8' }}>
              Director's Cut Studio
            </span>
          </div>
          {activeVideoLayers.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" 
              style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>
              {activeVideoLayers.length} layer{activeVideoLayers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Cross-Reference Toggle */}
          <button onClick={() => setShowCrossRefPanel(!showCrossRefPanel)}
            className="p-1.5 rounded-lg transition-all hover:scale-105"
            style={{ 
              background: showCrossRefPanel ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showCrossRefPanel ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
              color: showCrossRefPanel ? '#F59E0B' : 'var(--text-muted)',
            }}
            data-testid="toggle-crossref"
            title="Cross-Reference Panel">
            <Link2 size={14} />
          </button>
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { id: 'grid', icon: Grid },
              { id: 'list', icon: List },
              { id: 'timeline', icon: Sliders },
            ].map(mode => (
              <button key={mode.id} onClick={() => setViewMode(mode.id)}
                className="p-1.5 transition-all"
                style={{ 
                  background: viewMode === mode.id ? 'rgba(129,140,248,0.15)' : 'transparent',
                  color: viewMode === mode.id ? '#818CF8' : 'var(--text-muted)',
                }}
                data-testid={`view-${mode.id}`}>
                <mode.icon size={12} />
              </button>
            ))}
          </div>
          {/* Expand/Collapse */}
          <button onClick={() => onExpandChange?.(!isExpanded)}
            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ─── Main Studio Content ─── */}
      <div className={`flex ${isExpanded ? 'flex-col lg:flex-row' : 'flex-col'}`}>
        
        {/* ─── Video Library Browser ─── */}
        <div className={`${isExpanded ? 'lg:w-1/3' : 'w-full'} p-3`}
          style={{ borderRight: isExpanded ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          
          {/* Library Header */}
          <button onClick={() => setShowLibrary(!showLibrary)}
            className="w-full flex items-center justify-between mb-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-all">
            <div className="flex items-center gap-2">
              <Video size={12} style={{ color: '#818CF8' }} />
              <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#818CF8' }}>
                Video Library
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                {filteredVideos.length}
              </span>
            </div>
            {showLibrary ? <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />}
          </button>

          <AnimatePresence>
            {showLibrary && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                {/* Category Filter */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
                      className="px-2.5 py-1 rounded-full text-[9px] font-medium transition-all"
                      style={{
                        background: categoryFilter === cat.id ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${categoryFilter === cat.id ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.04)'}`,
                        color: categoryFilter === cat.id ? '#818CF8' : 'var(--text-muted)',
                      }}
                      data-testid={`filter-${cat.id}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Video Grid */}
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1.5'} max-h-[280px] overflow-y-auto pr-1`}
                  style={{ scrollbarWidth: 'thin' }}>
                  {filteredVideos.map(video => {
                    const isActive = activeVideoLayers.some(l => l.videoId === video.id);
                    return (
                      <motion.button
                        key={video.id}
                        onClick={() => addVideoLayer(video)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`text-left rounded-xl overflow-hidden transition-all ${viewMode === 'grid' ? 'aspect-video' : 'flex items-center gap-3 p-2'}`}
                        style={{
                          background: isActive ? `${video.color}10` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isActive ? `${video.color}30` : 'rgba(255,255,255,0.04)'}`,
                          boxShadow: isActive ? `0 0 12px ${video.color}10` : 'none',
                        }}
                        data-testid={`video-${video.id}`}>
                        {viewMode === 'grid' ? (
                          <div className="relative w-full h-full">
                            <video
                              src={video.url}
                              muted
                              loop
                              playsInline
                              autoPlay
                              className="w-full h-full object-cover"
                              style={{ filter: 'brightness(0.7)' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <span className="text-[10px] font-medium block" style={{ color: video.color }}>{video.label}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full capitalize"
                                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                                  {video.category}
                                </span>
                                {isActive && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${video.color}25`, color: video.color }}>
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                <Plus size={24} style={{ color: '#fff' }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${video.color}20` }}>
                              <video src={video.url} muted loop playsInline autoPlay className="w-full h-full object-cover" style={{ filter: 'brightness(0.7)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-medium block truncate" style={{ color: isActive ? video.color : 'var(--text-primary)' }}>{video.label}</span>
                              <span className="text-[9px] capitalize" style={{ color: 'var(--text-muted)' }}>{video.category}</span>
                            </div>
                            <Plus size={14} style={{ color: isActive ? video.color : 'var(--text-muted)' }} />
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Active Layers & Controls ─── */}
        <div className={`${isExpanded ? 'lg:flex-1' : 'w-full'} p-3`}>
          
          {/* Playback Controls */}
          <div className="flex items-center justify-between mb-3 px-2 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <button onClick={togglePlayback}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{ 
                  background: isPlaying ? 'rgba(34,197,94,0.15)' : 'rgba(129,140,248,0.15)',
                  color: isPlaying ? '#22C55E' : '#818CF8',
                }}
                data-testid="playback-toggle">
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button onClick={resetTimeline}
                className="p-2 rounded-lg transition-all hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
                data-testid="reset-timeline">
                <RotateCcw size={12} />
              </button>
              <button onClick={() => setMasterMuted(!masterMuted)}
                className="p-2 rounded-lg transition-all hover:bg-white/5"
                style={{ color: masterMuted ? 'var(--text-muted)' : '#818CF8' }}
                data-testid="master-mute">
                {masterMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {Math.floor(timelinePosition / 60)}:{String(Math.floor(timelinePosition % 60)).padStart(2, '0')} / {Math.floor(timelineDuration / 60)}:{String(timelineDuration % 60).padStart(2, '0')}
            </span>
          </div>

          {/* Active Layers Stack */}
          {activeVideoLayers.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <Film size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Select videos from the library to build your composition
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}
              data-testid="active-layers">
              {[...activeVideoLayers].reverse().map((layer, reversedIdx) => {
                const realIdx = activeVideoLayers.length - 1 - reversedIdx;
                const video = layer.videoData;
                const isSelected = selectedLayerId === layer.uid;

                return (
                  <motion.div key={layer.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${isSelected ? 'ring-1' : ''}`}
                    style={{
                      background: isSelected ? `${video.color}08` : 'rgba(255,255,255,0.015)',
                      border: `1px solid ${isSelected ? `${video.color}25` : 'rgba(255,255,255,0.04)'}`,
                      ringColor: video.color,
                      opacity: layer.visible ? 1 : 0.4,
                    }}
                    onClick={() => setSelectedLayerId(layer.uid)}
                    data-testid={`layer-${layer.uid}`}>
                    
                    <div className="flex items-center gap-2">
                      {/* Reorder Controls */}
                      <div className="flex flex-col gap-0.5">
                        <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.uid, 1); }}
                          className="p-0.5 hover:bg-white/10 rounded transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          disabled={realIdx === activeVideoLayers.length - 1}>
                          <ChevronUp size={10} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.uid, -1); }}
                          className="p-0.5 hover:bg-white/10 rounded transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          disabled={realIdx === 0}>
                          <ChevronDown size={10} />
                        </button>
                      </div>

                      {/* Video Preview Thumbnail */}
                      <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${video.color}20` }}>
                        <video
                          ref={el => previewRefs.current[layer.uid] = el}
                          src={video.url}
                          muted={layer.muted || masterMuted}
                          loop
                          playsInline
                          autoPlay={isPlaying}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Layer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: video.color }} />
                          <span className="text-[10px] font-medium truncate" style={{ color: video.color }}>{video.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                            {layer.blendMode}
                          </span>
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div className="flex items-center gap-1.5 w-24">
                        <input type="range" min={0} max={100} value={layer.opacity}
                          onChange={(e) => { e.stopPropagation(); updateLayer(layer.uid, { opacity: parseInt(e.target.value) }); }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${video.color} ${layer.opacity}%, rgba(255,255,255,0.06) ${layer.opacity}%)`,
                            accentColor: video.color,
                          }}
                          data-testid={`opacity-${layer.uid}`} />
                        <span className="text-[8px] w-6 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {layer.opacity}%
                        </span>
                      </div>

                      {/* Layer Actions */}
                      <div className="flex items-center gap-0.5">
                        <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.uid, { visible: !layer.visible }); }}
                          className="p-1 rounded hover:bg-white/5 transition-all"
                          style={{ color: layer.visible ? 'var(--text-muted)' : 'rgba(255,255,255,0.2)' }}
                          data-testid={`vis-${layer.uid}`}>
                          {layer.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.uid); }}
                          className="p-1 rounded hover:bg-white/5 transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          data-testid={`dup-${layer.uid}`}>
                          <Copy size={10} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.uid); }}
                          className="p-1 rounded hover:bg-red-500/10 transition-all"
                          style={{ color: 'rgba(239,68,68,0.6)' }}
                          data-testid={`remove-${layer.uid}`}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Layer Controls (when selected) */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="mt-2 pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          
                          {/* Blend Mode */}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-14 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Blend</span>
                            <select
                              value={layer.blendMode}
                              onChange={(e) => updateLayer(layer.uid, { blendMode: e.target.value })}
                              className="flex-1 px-2 py-1 rounded-lg text-[9px]"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', outline: 'none' }}
                              data-testid={`blend-${layer.uid}`}>
                              {BLEND_MODES.map(mode => (
                                <option key={mode.id} value={mode.id}>{mode.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Effect Sliders */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: 'brightness', label: 'Bright', min: 0, max: 200, color: '#FBBF24' },
                              { key: 'contrast', label: 'Contrast', min: 0, max: 200, color: '#818CF8' },
                              { key: 'saturation', label: 'Satur', min: 0, max: 200, color: '#EC4899' },
                              { key: 'blur', label: 'Blur', min: 0, max: 20, color: '#06B6D4' },
                            ].map(effect => (
                              <div key={effect.key} className="flex items-center gap-1">
                                <span className="text-[8px] w-10 flex-shrink-0" style={{ color: `${effect.color}80` }}>{effect.label}</span>
                                <input type="range" min={effect.min} max={effect.max}
                                  value={layer.effects[effect.key]}
                                  onChange={(e) => updateLayer(layer.uid, { 
                                    effects: { ...layer.effects, [effect.key]: parseInt(e.target.value) } 
                                  })}
                                  className="flex-1 h-0.5 rounded-full appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, ${effect.color} ${(layer.effects[effect.key] / effect.max) * 100}%, rgba(255,255,255,0.04) ${(layer.effects[effect.key] / effect.max) * 100}%)`,
                                  }}
                                  data-testid={`${effect.key}-${layer.uid}`} />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Cross-Reference Panel ─── */}
        <AnimatePresence>
          {showCrossRefPanel && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }} 
              animate={{ width: isExpanded ? 280 : '100%', opacity: 1 }} 
              exit={{ width: 0, opacity: 0 }}
              className={`p-3 ${isExpanded ? '' : 'border-t'}`}
              style={{ 
                borderLeft: isExpanded ? '1px solid rgba(245,158,11,0.1)' : 'none',
                borderTop: !isExpanded ? '1px solid rgba(245,158,11,0.1)' : 'none',
                background: 'rgba(245,158,11,0.02)',
              }}>
              
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={12} style={{ color: '#F59E0B' }} />
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#F59E0B' }}>
                  Cross-References
                </span>
              </div>

              {/* Add New Cross-Reference */}
              {activeVideoLayers.length >= 2 && (
                <div className="p-2 rounded-xl mb-3" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <span className="text-[9px] uppercase tracking-wider mb-2 block" style={{ color: 'rgba(245,158,11,0.6)' }}>
                    Link Layers
                  </span>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={newCrossRef.from || ''}
                      onChange={(e) => setNewCrossRef(prev => ({ ...prev, from: e.target.value }))}
                      className="flex-1 px-2 py-1 rounded-lg text-[9px]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', outline: 'none' }}>
                      <option value="">From...</option>
                      {activeVideoLayers.map(l => (
                        <option key={l.uid} value={l.uid}>{l.videoData.label}</option>
                      ))}
                    </select>
                    <Zap size={12} style={{ color: '#F59E0B' }} className="self-center" />
                    <select
                      value={newCrossRef.to || ''}
                      onChange={(e) => setNewCrossRef(prev => ({ ...prev, to: e.target.value }))}
                      className="flex-1 px-2 py-1 rounded-lg text-[9px]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', outline: 'none' }}>
                      <option value="">To...</option>
                      {activeVideoLayers.filter(l => l.uid !== newCrossRef.from).map(l => (
                        <option key={l.uid} value={l.uid}>{l.videoData.label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Add note (optional)..."
                    value={newCrossRef.note}
                    onChange={(e) => setNewCrossRef(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-2 py-1 rounded-lg text-[9px] mb-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button
                    onClick={addCrossReference}
                    disabled={!newCrossRef.from || !newCrossRef.to}
                    className="w-full py-1.5 rounded-lg text-[9px] font-medium transition-all disabled:opacity-30"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
                    data-testid="add-crossref">
                    <Plus size={10} className="inline mr-1" /> Add Link
                  </button>
                </div>
              )}

              {/* Cross-References List */}
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {crossReferences.length === 0 ? (
                  <p className="text-[9px] text-center py-3" style={{ color: 'var(--text-muted)' }}>
                    No cross-references yet
                  </p>
                ) : (
                  crossReferences.map(ref => {
                    const fromLayer = activeVideoLayers.find(l => l.uid === ref.fromLayerId);
                    const toLayer = activeVideoLayers.find(l => l.uid === ref.toLayerId);
                    if (!fromLayer || !toLayer) return null;
                    return (
                      <div key={ref.id} className="flex items-center gap-2 p-2 rounded-lg group"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[9px]">
                            <span style={{ color: fromLayer.videoData.color }}>{fromLayer.videoData.label}</span>
                            <Zap size={8} style={{ color: '#F59E0B' }} />
                            <span style={{ color: toLayer.videoData.color }}>{toLayer.videoData.label}</span>
                          </div>
                          {ref.note && <span className="text-[8px] block truncate" style={{ color: 'var(--text-muted)' }}>{ref.note}</span>}
                        </div>
                        <button
                          onClick={() => removeCrossReference(ref.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 rounded hover:bg-red-500/10 transition-all"
                          style={{ color: 'rgba(239,68,68,0.6)' }}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
