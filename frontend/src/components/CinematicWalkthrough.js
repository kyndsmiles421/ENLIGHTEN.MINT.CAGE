/**
 * CinematicWalkthrough.js — V56.2 Guided Tour
 * 
 * Instead of transforming the page (which looks glitchy on mobile),
 * this provides a step-by-step guided tour that actually NAVIGATES
 * to each room, shows the room name, and auto-advances.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Film, ChevronRight, SkipForward, Compass, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOUR_SEQUENCES = {
  wellness: {
    name: 'Wellness Journey',
    desc: 'Breathing, Meditation, Yoga, Crystals',
    color: '#2DD4BF',
    stops: [
      { path: '/breathing', name: 'Breath Chamber', hold: 4000 },
      { path: '/meditation', name: 'Meditation Hall', hold: 4000 },
      { path: '/yoga', name: 'Yoga Studio', hold: 4000 },
      { path: '/crystals', name: 'Crystal Chamber', hold: 4000 },
    ],
  },
  divination: {
    name: 'Oracle Path',
    desc: 'Oracle, Star Chart, Dreams, Numerology',
    color: '#C084FC',
    stops: [
      { path: '/oracle', name: 'Oracle Chamber', hold: 4000 },
      { path: '/star-chart', name: 'Observatory', hold: 4000 },
      { path: '/dreams', name: 'Dream Journal', hold: 4000 },
      { path: '/numerology', name: 'Numerology Vault', hold: 4000 },
    ],
  },
  nature: {
    name: 'Earth Medicine',
    desc: 'Herbology, Crystals, Aromatherapy, Nourishment',
    color: '#22C55E',
    stops: [
      { path: '/herbology', name: 'Herb Garden', hold: 4000 },
      { path: '/crystals', name: 'Crystal Cave', hold: 4000 },
      { path: '/aromatherapy', name: 'Essence Temple', hold: 4000 },
      { path: '/nourishment', name: 'Living Kitchen', hold: 4000 },
    ],
  },
  full: {
    name: 'Grand Tour',
    desc: 'Every major realm in one journey',
    color: '#FBBF24',
    stops: [
      { path: '/breathing', name: 'Breath Chamber', hold: 3500 },
      { path: '/meditation', name: 'Meditation Hall', hold: 3500 },
      { path: '/oracle', name: 'Oracle Chamber', hold: 3500 },
      { path: '/crystals', name: 'Crystal Chamber', hold: 3500 },
      { path: '/herbology', name: 'Herb Garden', hold: 3500 },
      { path: '/games', name: 'Game Arena', hold: 3500 },
      { path: '/frequencies', name: 'Frequency Lab', hold: 3500 },
      { path: '/yoga', name: 'Yoga Studio', hold: 3500 },
    ],
  },
};

export default function CinematicWalkthrough() {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [stopIndex, setStopIndex] = useState(0);
  const timerRef = useRef(null);

  const sequence = activeKey ? TOUR_SEQUENCES[activeKey] : null;
  const currentStop = sequence?.stops[stopIndex];

  const play = useCallback((key) => {
    const seq = TOUR_SEQUENCES[key];
    if (!seq) return;
    setActiveKey(key);
    setStopIndex(0);
    setPlaying(true);
    setShowPicker(false);
    navigate(seq.stops[0].path);
  }, [navigate]);

  const advance = useCallback(() => {
    if (!sequence) return;
    const next = stopIndex + 1;
    if (next >= sequence.stops.length) {
      setPlaying(false);
      setActiveKey(null);
      setStopIndex(0);
      navigate('/sovereign-hub');
      return;
    }
    setStopIndex(next);
    navigate(sequence.stops[next].path);
  }, [sequence, stopIndex, navigate]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    setPlaying(false);
    setActiveKey(null);
    setStopIndex(0);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!playing || !currentStop) return;
    timerRef.current = setTimeout(advance, currentStop.hold);
    return () => clearTimeout(timerRef.current);
  }, [playing, stopIndex, currentStop, advance]);

  return (
    <>
      {/* Tour HUD — shows during playback */}
      <AnimatePresence>
        {playing && currentStop && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5"
            style={{
              background: 'rgba(0,0,0,0.85)',
              borderBottom: `1px solid ${sequence.color}25`,
              backdropFilter: 'blur(8px)',
            }}
            data-testid="tour-hud"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#EF4444' }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sequence.color }}>
                {sequence.name}
              </span>
              <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {stopIndex + 1}/{sequence.stops.length}
              </span>
            </div>

            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Cormorant Garamond, serif' }}>
              {currentStop.name}
            </span>

            <div className="flex items-center gap-2">
              <button onClick={advance} className="p-1.5 rounded-md" style={{ background: `${sequence.color}15` }}>
                <SkipForward size={12} style={{ color: sequence.color }} />
              </button>
              <button onClick={stop} className="p-1.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <X size={12} style={{ color: '#EF4444' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger + Picker */}
      {!playing && (
        <>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: 'rgba(217,70,239,0.08)',
              border: '1px solid rgba(217,70,239,0.15)',
              color: '#D946EF',
            }}
            data-testid="cinematic-walkthrough-btn"
          >
            <Film size={12} />
            Guided Tour
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 space-y-2"
                data-testid="tour-picker"
              >
                {Object.entries(TOUR_SEQUENCES).map(([key, seq]) => (
                  <button key={key} onClick={() => play(key)}
                    className="w-full text-left p-3 rounded-xl flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    data-testid={`tour-${key}`}
                  >
                    <Compass size={14} style={{ color: seq.color }} />
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: seq.color }}>{seq.name}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {seq.desc} | {seq.stops.length} stops
                      </p>
                    </div>
                    <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
