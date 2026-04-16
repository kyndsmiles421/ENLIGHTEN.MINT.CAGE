/**
 * CinematicWalkthrough.js — Scripted Auto-Walk Through 3D Rooms
 * 
 * A pre-scripted Z-Axis sequence that moves the camera through the 9x9 grid.
 * Users create "trailers" of their progress without manual scrolling.
 * Works with SpatialRecorder to capture cinematic journeys.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Film, Eye, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Cinematic route sequences
const WALKTHROUGH_ROUTES = {
  wellness: {
    name: 'Wellness Journey',
    desc: 'Breathwork → Meditation → Yoga → Crystals',
    routes: ['/breathing', '/meditation', '/yoga', '/crystals'],
    durations: [4000, 5000, 4000, 5000],
    color: '#2DD4BF',
  },
  divination: {
    name: 'Oracle Path',
    desc: 'Oracle → Star Chart → Dreams → Numerology',
    routes: ['/oracle', '/star-chart', '/dreams', '/numerology'],
    durations: [5000, 4000, 5000, 4000],
    color: '#C084FC',
  },
  nature: {
    name: 'Earth Medicine',
    desc: 'Herbology → Crystals → Aromatherapy → Nourishment',
    routes: ['/herbology', '/crystals', '/aromatherapy', '/nourishment'],
    durations: [4000, 4000, 4000, 5000],
    color: '#22C55E',
  },
  sovereign: {
    name: 'Sovereign Tour',
    desc: 'Hub → Academy → Economy → Games',
    routes: ['/sovereign-hub', '/academy', '/economy', '/games'],
    durations: [3000, 5000, 4000, 5000],
    color: '#FBBF24',
  },
  full: {
    name: 'Grand Walkthrough',
    desc: 'All major realms — the complete 160-page world',
    routes: [
      '/sovereign-hub', '/breathing', '/meditation', '/crystals',
      '/oracle', '/star-chart', '/academy', '/games',
      '/soundscapes', '/dreams', '/herbology', '/economy',
    ],
    durations: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 4000],
    color: '#D946EF',
  },
};

/**
 * CinematicWalkthrough — Auto-navigate + scroll through rooms
 */
export default function CinematicWalkthrough({ onStart, onEnd }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-trigger on first TWA launch (display-mode: fullscreen)
  useEffect(() => {
    const isFirstLaunch = !localStorage.getItem('emcafe_walkthrough_seen');
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: standalone)').matches;
    if (isFirstLaunch && isFullscreen && location.pathname === '/sovereign-hub') {
      // Show picker automatically on first app launch
      setTimeout(() => setShowPicker(true), 2000);
      localStorage.setItem('emcafe_walkthrough_seen', '1');
    }
  }, [location.pathname]);

  // Auto-scroll simulation within each room
  const simulateScroll = useCallback((duration) => {
    const start = Date.now();
    const el = document.querySelector('[data-testid="content-area"]') || window;
    const scrollTarget = el === window
      ? document.documentElement.scrollHeight - window.innerHeight
      : el.scrollHeight - el.clientHeight;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      // Ease-in-out scroll
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (el === window) {
        window.scrollTo(0, eased * scrollTarget);
      } else {
        el.scrollTop = eased * scrollTarget;
      }

      if (progress < 1) {
        scrollRef.current = requestAnimationFrame(tick);
      }
    };
    scrollRef.current = requestAnimationFrame(tick);
  }, []);

  // Play a walkthrough sequence
  const play = useCallback((routeKey) => {
    const route = WALKTHROUGH_ROUTES[routeKey];
    if (!route) return;
    setSelectedRoute(routeKey);
    setCurrentStep(0);
    setIsPlaying(true);
    setShowPicker(false);
    if (onStart) onStart();

    // Navigate to first route
    navigate(route.routes[0]);
    window.scrollTo(0, 0);

    let step = 0;
    const advanceStep = () => {
      // Scroll through current room
      simulateScroll(route.durations[step] * 0.7);

      // After duration, move to next
      timerRef.current = setTimeout(() => {
        step++;
        if (step < route.routes.length) {
          setCurrentStep(step);
          navigate(route.routes[step]);
          window.scrollTo(0, 0);
          advanceStep();
        } else {
          // Walkthrough complete
          setIsPlaying(false);
          setCurrentStep(0);
          if (onEnd) onEnd();
        }
      }, route.durations[step]);
    };

    advanceStep();
  }, [navigate, simulateScroll, onStart, onEnd]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(scrollRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    if (onEnd) onEnd();
  }, [onEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(scrollRef.current);
    };
  }, []);

  const activeRoute = selectedRoute ? WALKTHROUGH_ROUTES[selectedRoute] : null;

  return (
    <>
      {/* Trigger button */}
      {!isPlaying && (
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
          Cinematic Walkthrough
        </button>
      )}

      {/* Playing HUD */}
      {isPlaying && activeRoute && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-2xl"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${activeRoute.color}30`,
            backdropFilter: 'blur(12px)',
            zIndex: 200,
          }}
          data-testid="cinematic-hud"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
            <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: activeRoute.color }}>
              {activeRoute.name}
            </span>
          </div>
          <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {currentStep + 1}/{activeRoute.routes.length}
          </span>
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {activeRoute.routes[currentStep]}
          </span>
          <button onClick={stop} className="ml-2 p-1 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            data-testid="cinematic-stop-btn">
            <Pause size={10} style={{ color: '#EF4444' }} />
          </button>
        </motion.div>
      )}

      {/* Route picker */}
      <AnimatePresence>
        {showPicker && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3"
            data-testid="cinematic-picker"
          >
            <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Choose a journey
            </p>
            <div className="space-y-2">
              {Object.entries(WALKTHROUGH_ROUTES).map(([key, route]) => (
                <button
                  key={key}
                  onClick={() => play(key)}
                  className="w-full text-left p-3 rounded-xl flex items-center gap-3 group"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  data-testid={`walkthrough-${key}`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${route.color}10`, border: `1px solid ${route.color}20` }}>
                    <Play size={14} style={{ color: route.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: route.color }}>{route.name}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{route.desc}</p>
                    <p className="text-[8px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {route.routes.length} rooms | ~{Math.round(route.durations.reduce((a, b) => a + b, 0) / 1000)}s
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }}
                    className="group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
