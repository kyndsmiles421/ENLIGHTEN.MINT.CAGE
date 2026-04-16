/**
 * ENLIGHTEN.MINT.CAFE - V10010.0 DIRECTOR'S TIMELINE
 * 
 * The PowerDirector-style multi-track timeline for scrubbing through reality.
 * Features:
 * - 4 draggable tracks (Law/Art/Logic/Wellness)
 * - Timeline scrubber (Past/Present/Future)
 * - Keyframe markers
 * - Render meter ($15/hr usage tracker)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Play, Pause, SkipBack, SkipForward, Film, Clock, 
  DollarSign, Scale, Paintbrush, Triangle, Heart,
  ChevronLeft, ChevronRight, Bookmark, Zap, CircleDot
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Track definitions
const TRACKS = [
  { id: 'law', name: 'World Law Library', icon: Scale, color: '#8B5CF6', epoch: 'PAST' },
  { id: 'art', name: 'Art Academy Holographics', icon: Paintbrush, color: '#3B82F6', epoch: 'PRESENT' },
  { id: 'logic', name: 'Engineering & Math', icon: Triangle, color: '#22C55E', epoch: 'FUTURE' },
  { id: 'wellness', name: 'Biometric Wellness', icon: Heart, color: '#F472B6', epoch: 'CORE' },
];

// Epoch colors
const EPOCH_COLORS = {
  PAST: '#8B5CF6',
  PRESENT: '#22C55E',
  FUTURE: '#3B82F6',
};

/**
 * Main Director Timeline Component
 */
export default function DirectorTimeline({ isOpen, onClose }) {
  const [position, setPosition] = useState(0.5);
  const [scrubData, setScrubData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderMeter, setRenderMeter] = useState({ is_active: false, current_cost: '0.00' });
  const [keyframes, setKeyframes] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [movieRendering, setMovieRendering] = useState(false);
  const [movie, setMovie] = useState(null);
  
  const timelineRef = useRef(null);
  const playIntervalRef = useRef(null);

  // Fetch initial state
  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      fetchKeyframes();
    }
  }, [isOpen]);

  // Handle scrub updates
  useEffect(() => {
    if (isOpen && position !== undefined) {
      scrubTimeline(position);
    }
  }, [position, isOpen]);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPosition(prev => {
          const next = prev + 0.01;
          if (next >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return next;
        });
      }, 100);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/omnis/director/status`);
      if (res.data.render_meter) {
        setRenderMeter(res.data.render_meter);
      }
    } catch (err) {
      console.log('Director status fetch skipped');
    }
  };

  const fetchKeyframes = async () => {
    try {
      const res = await axios.get(`${API}/omnis/director/keyframes`);
      setKeyframes(res.data.keyframes || []);
    } catch (err) {
      console.log('Keyframes fetch skipped');
    }
  };

  const scrubTimeline = async (pos) => {
    try {
      const res = await axios.post(`${API}/omnis/director/timeline/scrub?position=${pos}`);
      setScrubData(res.data);
    } catch (err) {
      console.log('Scrub skipped');
    }
  };

  const handleTimelineClick = useCallback((e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPos = Math.max(0, Math.min(1, clickX / rect.width));
    setPosition(newPos);
  }, []);

  const toggleRenderMeter = async () => {
    try {
      if (renderMeter.is_active) {
        const res = await axios.post(`${API}/omnis/director/render-meter/stop`);
        setRenderMeter({ ...renderMeter, is_active: false, ...res.data });
        toast.success('Render Meter Stopped', { description: `Session cost: ${res.data.session_cost}` });
      } else {
        await axios.post(`${API}/omnis/director/render-meter/start`);
        setRenderMeter({ ...renderMeter, is_active: true });
        toast.success('Render Meter Started', { description: '$15/hr Knowledge Equity tracking' });
      }
    } catch (err) {
      console.log('Render meter toggle skipped');
    }
  };

  const addKeyframe = async () => {
    try {
      const res = await axios.post(
        `${API}/omnis/director/keyframe/add?position=${position}&action_type=MARKER&action_data={}`
      );
      setKeyframes(prev => [...prev, res.data]);
      toast.success('Keyframe Added', { description: `At position ${(position * 100).toFixed(0)}%` });
    } catch (err) {
      toast.error('Failed to add keyframe');
    }
  };

  const renderSovereignMovie = async () => {
    setMovieRendering(true);
    toast.info('Rendering 54-Layer Sovereign Movie...', { duration: 5000 });
    
    try {
      const res = await axios.post(`${API}/omnis/director/movie/render`);
      setMovie(res.data);
      setMovieRendering(false);
      toast.success('Sovereign Movie Rendered!', { 
        description: res.data.title,
        duration: 10000,
      });
    } catch (err) {
      setMovieRendering(false);
      toast.error('Movie render failed');
    }
  };

  if (!isOpen) return null;

  const currentEpoch = scrubData?.epoch || 'PRESENT';
  const currentLayer = scrubData?.current_layer || 27;
  const epochColor = EPOCH_COLORS[currentEpoch] || '#22C55E';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full flex items-end justify-center"
        style={{ background: 'transparent' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-sm"
          data-testid="close-director-timeline"
        >
          Close Timeline
        </button>

        {/* Header */}
        <div className="absolute top-4 left-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Film size={20} style={{ color: epochColor }} />
            V10010.0 Director's Cut
          </h2>
          <p className="text-xs text-white/40 mt-1">Multi-Track Intelligence Timeline</p>
        </div>

        {/* Render Meter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <button
            onClick={toggleRenderMeter}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              background: renderMeter.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${renderMeter.is_active ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
            data-testid="render-meter-toggle"
          >
            <DollarSign size={14} style={{ color: renderMeter.is_active ? '#22C55E' : '#666' }} />
            <span className="text-sm" style={{ color: renderMeter.is_active ? '#86EFAC' : '#888' }}>
              {renderMeter.is_active ? `${renderMeter.current_cost || '0.00'}` : 'Start Meter'}
            </span>
            <Clock size={12} style={{ color: renderMeter.is_active ? '#22C55E' : '#666' }} />
          </button>
        </div>

        {/* Movie Preview (if rendered) */}
        {movie && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-4 right-4 p-4 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <h3 className="text-sm font-medium text-violet-300 flex items-center gap-2">
              <Film size={14} />
              {movie.title}
            </h3>
            <p className="text-xs text-white/40 mt-1">{movie.visual}</p>
            <div className="flex gap-4 mt-2 text-[10px] text-white/30">
              <span>{movie.total_layers} layers</span>
              <span>{movie.audio}</span>
              <span>{movie.wealth?.multiplied}</span>
            </div>
          </motion.div>
        )}

        {/* Main Timeline Container */}
        <div className="w-full max-w-6xl p-6 pb-8">
          {/* Epoch Indicator */}
          <div className="text-center mb-4">
            <div 
              className="inline-block px-4 py-1 rounded-full text-sm font-medium"
              style={{ 
                background: `${epochColor}20`,
                color: epochColor,
                border: `1px solid ${epochColor}40`,
              }}
            >
              {currentEpoch} EPOCH • Layer {currentLayer}/54
            </div>
            {scrubData?.epoch_content && (
              <p className="text-xs text-white/30 mt-2">{scrubData.epoch_content}</p>
            )}
          </div>

          {/* Track Layers */}
          <div className="space-y-2 mb-6">
            {TRACKS.map((track) => (
              <div 
                key={track.id}
                onClick={() => setSelectedTrack(track.id === selectedTrack ? null : track.id)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedTrack === track.id ? `${track.color}20` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedTrack === track.id ? track.color : 'rgba(255,255,255,0.05)'}`,
                }}
                data-testid={`track-${track.id}`}
              >
                <track.icon size={16} style={{ color: track.color }} />
                <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {track.name}
                </span>
                <span className="text-[10px] uppercase" style={{ color: track.color }}>
                  {track.epoch}
                </span>
                
                {/* Track visualization bar */}
                <div 
                  className="w-48 h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${position * 100}%`,
                      background: `linear-gradient(90deg, ${track.color}40, ${track.color})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Main Scrubber */}
          <div className="relative">
            {/* Timeline labels */}
            <div className="flex justify-between text-[10px] text-white/30 mb-2">
              <span>PAST (Lakota)</span>
              <span>PRESENT (Trust)</span>
              <span>FUTURE (Omega)</span>
            </div>

            {/* Timeline track */}
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              className="relative h-12 rounded-lg cursor-pointer overflow-hidden"
              style={{ 
                background: 'linear-gradient(90deg, #8B5CF620, #22C55E20, #3B82F620)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              data-testid="timeline-scrubber"
            >
              {/* Epoch divisions */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 border-r border-white/10" style={{ background: 'rgba(139,92,246,0.1)' }} />
                <div className="flex-1 border-r border-white/10" style={{ background: 'rgba(34,197,94,0.1)' }} />
                <div className="flex-1" style={{ background: 'rgba(59,130,246,0.1)' }} />
              </div>

              {/* Keyframe markers */}
              {keyframes.map((kf, idx) => (
                <div
                  key={kf.id || idx}
                  className="absolute top-0 w-1 h-full"
                  style={{ 
                    left: `${kf.position * 100}%`,
                    background: '#F59E0B',
                  }}
                  title={`Keyframe at ${(kf.position * 100).toFixed(0)}%`}
                />
              ))}

              {/* Playhead */}
              <div
                className="absolute top-0 w-0.5 h-full"
                style={{ 
                  left: `${position * 100}%`,
                  background: epochColor,
                  boxShadow: `0 0 10px ${epochColor}`,
                }}
              />
              <div
                className="absolute -top-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ 
                  left: `calc(${position * 100}% - 8px)`,
                  background: epochColor,
                }}
              >
                <CircleDot size={8} className="text-black" />
              </div>
            </div>

            {/* Position indicator */}
            <div className="text-center mt-2">
              <span className="text-xs font-mono" style={{ color: epochColor }}>
                {(position * 100).toFixed(0)}% • Layer {currentLayer} • {scrubData?.haptic_frequency || 144}Hz
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPosition(0)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              data-testid="timeline-rewind"
            >
              <SkipBack size={20} className="text-white/60" />
            </button>
            
            <button
              onClick={() => setPosition(Math.max(0, position - 0.1))}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={20} className="text-white/60" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full transition-all"
              style={{ 
                background: isPlaying ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
              }}
              data-testid="timeline-play-pause"
            >
              {isPlaying ? (
                <Pause size={24} className="text-red-400" />
              ) : (
                <Play size={24} className="text-green-400" />
              )}
            </button>
            
            <button
              onClick={() => setPosition(Math.min(1, position + 0.1))}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <ChevronRight size={20} className="text-white/60" />
            </button>
            
            <button
              onClick={() => setPosition(1)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              data-testid="timeline-forward"
            >
              <SkipForward size={20} className="text-white/60" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            <button
              onClick={addKeyframe}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              title="Add Keyframe"
              data-testid="add-keyframe"
            >
              <Bookmark size={20} className="text-amber-400" />
            </button>

            <button
              onClick={renderSovereignMovie}
              disabled={movieRendering}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                background: movieRendering ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.4)',
                opacity: movieRendering ? 0.5 : 1,
              }}
              data-testid="render-movie-button"
            >
              <Film size={16} className="text-violet-400" />
              <span className="text-sm text-violet-300">
                {movieRendering ? 'Rendering...' : 'Render Movie'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { TRACKS, EPOCH_COLORS };
