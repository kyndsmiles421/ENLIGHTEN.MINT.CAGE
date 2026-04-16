/**
 * CinematicWalkthrough.js — V56.0 Spatial Cinema Engine
 * 
 * True 3D camera traversal through the spatial grid.
 * Instead of navigate(), physically animates translate3d + rotateY
 * on the #app-stage element, creating a cinematic VR flythrough.
 * 
 * Each waypoint defines a 3D camera transform + room theme data.
 * The camera interpolates between waypoints using cubic-bezier easing.
 * After the sequence completes, snaps back to neutral and navigates
 * to the final destination.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Film, ChevronRight, SkipForward, Compass } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PHI = 1.618033988749895;

// 3D camera waypoints — each has a spatial transform + metadata
const CINEMATIC_SEQUENCES = {
  wellness: {
    name: 'Wellness Journey',
    desc: 'Crystal Chamber → Breath Temple → Meditation Hall → Yoga Dojo',
    color: '#2DD4BF',
    finalRoute: '/breathing',
    waypoints: [
      { name: 'Origin', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 800 },
      { name: 'Crystal Chamber', transform: 'translate3d(0, 0, 600px) rotateY(0deg) rotateX(-2deg)', hold: 2500 },
      { name: 'Turning Gate', transform: 'translate3d(-200px, -50px, 300px) rotateY(25deg) rotateX(0deg)', hold: 1200 },
      { name: 'Breath Temple', transform: 'translate3d(-500px, 0, -400px) rotateY(45deg) rotateX(-3deg)', hold: 2500 },
      { name: 'Descent', transform: 'translate3d(-300px, 100px, -800px) rotateY(20deg) rotateX(5deg)', hold: 1200 },
      { name: 'Meditation Hall', transform: 'translate3d(0, 50px, -1200px) rotateY(0deg) rotateX(-2deg)', hold: 2500 },
      { name: 'Ascent', transform: 'translate3d(300px, -100px, -600px) rotateY(-30deg) rotateX(-5deg)', hold: 1200 },
      { name: 'Yoga Dojo', transform: 'translate3d(500px, -50px, 200px) rotateY(-45deg) rotateX(0deg)', hold: 2500 },
      { name: 'Return', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 600 },
    ],
  },
  divination: {
    name: 'Oracle Path',
    desc: 'Oracle Temple → Observatory → Dream Realms → Numerology Vault',
    color: '#C084FC',
    finalRoute: '/oracle',
    waypoints: [
      { name: 'Origin', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 800 },
      { name: 'Oracle Temple', transform: 'translate3d(-400px, 0, 500px) rotateY(35deg) rotateX(-3deg)', hold: 2800 },
      { name: 'Spiral Up', transform: 'translate3d(-200px, -200px, 0) rotateY(60deg) rotateX(-8deg)', hold: 1500 },
      { name: 'Observatory', transform: 'translate3d(300px, -400px, -600px) rotateY(-20deg) rotateX(-12deg)', hold: 2800 },
      { name: 'Dream Gate', transform: 'translate3d(100px, -200px, -1000px) rotateY(10deg) rotateX(-5deg)', hold: 1200 },
      { name: 'Dream Realms', transform: 'translate3d(-300px, -100px, -1400px) rotateY(40deg) rotateX(0deg)', hold: 2800 },
      { name: 'Number Spiral', transform: 'translate3d(400px, 0, -800px) rotateY(-45deg) rotateX(3deg)', hold: 2000 },
      { name: 'Return', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 600 },
    ],
  },
  nature: {
    name: 'Earth Medicine',
    desc: 'Herb Garden → Crystal Cave → Essence Temple → Living Kitchen',
    color: '#22C55E',
    finalRoute: '/herbology',
    waypoints: [
      { name: 'Origin', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 800 },
      { name: 'Herb Garden', transform: 'translate3d(200px, 50px, 400px) rotateY(-15deg) rotateX(3deg)', hold: 2500 },
      { name: 'Earth Descent', transform: 'translate3d(0, 200px, 100px) rotateY(0deg) rotateX(10deg)', hold: 1200 },
      { name: 'Crystal Cave', transform: 'translate3d(-400px, 300px, -500px) rotateY(35deg) rotateX(8deg)', hold: 2800 },
      { name: 'Essence Rise', transform: 'translate3d(-200px, 0, -200px) rotateY(20deg) rotateX(-3deg)', hold: 1200 },
      { name: 'Essence Temple', transform: 'translate3d(300px, -100px, -800px) rotateY(-30deg) rotateX(-5deg)', hold: 2500 },
      { name: 'Living Kitchen', transform: 'translate3d(100px, 0, -1100px) rotateY(0deg) rotateX(0deg)', hold: 2500 },
      { name: 'Return', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 600 },
    ],
  },
  sovereign: {
    name: 'Sovereign Tour',
    desc: 'Hub → Academy → Economy Vault → Game Arena',
    color: '#FBBF24',
    finalRoute: '/sovereign-hub',
    waypoints: [
      { name: 'Origin', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 800 },
      { name: 'Sovereign Hub', transform: 'translate3d(0, 0, 800px) rotateY(0deg) rotateX(-5deg)', hold: 2500 },
      { name: 'Knowledge Gate', transform: 'translate3d(-600px, -100px, 400px) rotateY(50deg) rotateX(-3deg)', hold: 1500 },
      { name: 'Academy', transform: 'translate3d(-800px, -200px, -200px) rotateY(60deg) rotateX(-8deg)', hold: 2800 },
      { name: 'Vault Descent', transform: 'translate3d(-400px, 200px, -600px) rotateY(30deg) rotateX(5deg)', hold: 1200 },
      { name: 'Economy Vault', transform: 'translate3d(200px, 100px, -1000px) rotateY(-20deg) rotateX(3deg)', hold: 2500 },
      { name: 'Arena Rise', transform: 'translate3d(600px, -100px, -600px) rotateY(-50deg) rotateX(-5deg)', hold: 1500 },
      { name: 'Game Arena', transform: 'translate3d(400px, 0, -200px) rotateY(-30deg) rotateX(0deg)', hold: 2500 },
      { name: 'Return', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 600 },
    ],
  },
  full: {
    name: 'Grand Walkthrough',
    desc: 'The complete sovereign world — all major realms',
    color: '#D946EF',
    finalRoute: '/sovereign-hub',
    waypoints: [
      { name: 'Origin', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 600 },
      { name: 'Sovereign Core', transform: 'translate3d(0, 0, 700px) rotateY(0deg) rotateX(-3deg)', hold: 2000 },
      { name: 'Breath Temple', transform: 'translate3d(-400px, -50px, 300px) rotateY(30deg) rotateX(-2deg)', hold: 2000 },
      { name: 'Meditation Depths', transform: 'translate3d(-200px, 100px, -400px) rotateY(15deg) rotateX(5deg)', hold: 2000 },
      { name: 'Crystal Chamber', transform: 'translate3d(300px, 200px, -800px) rotateY(-25deg) rotateX(8deg)', hold: 2000 },
      { name: 'Oracle Temple', transform: 'translate3d(-500px, 0, -1200px) rotateY(45deg) rotateX(-3deg)', hold: 2000 },
      { name: 'Observatory', transform: 'translate3d(200px, -300px, -800px) rotateY(-15deg) rotateX(-10deg)', hold: 2000 },
      { name: 'Academy Spire', transform: 'translate3d(-300px, -200px, -400px) rotateY(35deg) rotateX(-5deg)', hold: 2000 },
      { name: 'Game Arena', transform: 'translate3d(500px, -100px, 0) rotateY(-40deg) rotateX(0deg)', hold: 2000 },
      { name: 'Sound Frequencies', transform: 'translate3d(200px, 50px, -600px) rotateY(-10deg) rotateX(3deg)', hold: 2000 },
      { name: 'Dream Realms', transform: 'translate3d(-400px, -50px, -1000px) rotateY(30deg) rotateX(-2deg)', hold: 2000 },
      { name: 'Herb Garden', transform: 'translate3d(300px, 100px, -400px) rotateY(-20deg) rotateX(5deg)', hold: 2000 },
      { name: 'Return', transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)', hold: 600 },
    ],
  },
};

/**
 * CinematicWalkthrough — V56.0 True 3D Spatial Cinema
 */
export default function CinematicWalkthrough({ onStart, onEnd }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [waypointName, setWaypointName] = useState('');
  const timerRef = useRef(null);
  const stageRef = useRef(null);
  const overlayRef = useRef(null);

  // Auto-trigger on first TWA launch
  useEffect(() => {
    const isFirstLaunch = !localStorage.getItem('emcafe_walkthrough_seen');
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: standalone)').matches;
    if (isFirstLaunch && isFullscreen && location.pathname === '/sovereign-hub') {
      setTimeout(() => setShowPicker(true), 2000);
      localStorage.setItem('emcafe_walkthrough_seen', '1');
    }
  }, [location.pathname]);

  // Get reference to the stage element
  const getStage = useCallback(() => {
    if (stageRef.current) return stageRef.current;
    stageRef.current = document.getElementById('app-stage');
    return stageRef.current;
  }, []);

  // Apply 3D transform to the stage
  const setCamera = useCallback((transform, duration = 2500) => {
    const stage = getStage();
    if (!stage) return;
    stage.style.transformStyle = 'preserve-3d';
    stage.style.transition = `transform ${duration}ms cubic-bezier(0.45, 0, 0.55, 1)`;
    stage.style.transform = transform;
  }, [getStage]);

  // Reset camera to neutral
  const resetCamera = useCallback(() => {
    const stage = getStage();
    if (!stage) return;
    stage.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    stage.style.transform = 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)';
    setTimeout(() => {
      stage.style.transformStyle = '';
      stage.style.transition = '';
      stage.style.transform = '';
    }, 700);
  }, [getStage]);

  // Play a cinematic sequence
  const play = useCallback((routeKey) => {
    const sequence = CINEMATIC_SEQUENCES[routeKey];
    if (!sequence) return;

    setSelectedRoute(routeKey);
    setCurrentStep(0);
    setIsPlaying(true);
    setShowPicker(false);
    if (onStart) onStart();

    // Set perspective on parent
    const stage = getStage();
    if (stage && stage.parentElement) {
      stage.parentElement.style.perspective = '1200px';
      stage.parentElement.style.perspectiveOrigin = '50% 40%';
    }

    let step = 0;
    const waypoints = sequence.waypoints;

    const advanceStep = () => {
      if (step >= waypoints.length) {
        // Sequence complete
        resetCamera();
        setIsPlaying(false);
        setCurrentStep(0);
        setWaypointName('');
        if (stage && stage.parentElement) {
          stage.parentElement.style.perspective = '';
          stage.parentElement.style.perspectiveOrigin = '';
        }
        // Navigate to the final destination
        if (sequence.finalRoute) {
          navigate(sequence.finalRoute);
        }
        if (onEnd) onEnd();
        return;
      }

      const wp = waypoints[step];
      setCurrentStep(step);
      setWaypointName(wp.name);

      // Calculate transition duration from hold time
      const transitionMs = Math.min(2500, wp.hold * 0.6);
      setCamera(wp.transform, transitionMs);

      timerRef.current = setTimeout(() => {
        step++;
        advanceStep();
      }, wp.hold);
    };

    advanceStep();
  }, [navigate, onStart, onEnd, getStage, setCamera, resetCamera]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    resetCamera();
    setIsPlaying(false);
    setCurrentStep(0);
    setWaypointName('');
    const stage = getStage();
    if (stage && stage.parentElement) {
      stage.parentElement.style.perspective = '';
      stage.parentElement.style.perspectiveOrigin = '';
    }
    if (onEnd) onEnd();
  }, [onEnd, resetCamera, getStage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      resetCamera();
    };
  }, [resetCamera]);

  const activeSequence = selectedRoute ? CINEMATIC_SEQUENCES[selectedRoute] : null;
  const totalWaypoints = activeSequence ? activeSequence.waypoints.length : 0;

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

      {/* Cinema overlay during playback */}
      {isPlaying && activeSequence && (
        <>
          {/* Cinematic letterbox bars */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 40 }}
            exit={{ height: 0 }}
            className="fixed top-0 left-0 right-0"
            style={{ background: 'black', zIndex: 210 }}
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 40 }}
            exit={{ height: 0 }}
            className="fixed bottom-0 left-0 right-0"
            style={{ background: 'black', zIndex: 210 }}
          />

          {/* HUD overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-10 left-0 right-0 flex items-center justify-between px-6 py-2"
            style={{ zIndex: 220, pointerEvents: 'none' }}
            data-testid="cinematic-hud"
          >
            {/* Left: sequence info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#EF4444' }}
                />
                <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: activeSequence.color }}>
                  {activeSequence.name}
                </span>
              </div>
              <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {currentStep + 1}/{totalWaypoints}
              </span>
            </div>

            {/* Center: waypoint name */}
            <AnimatePresence mode="wait">
              <motion.div
                key={waypointName}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-xs font-light tracking-wide" style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  color: 'rgba(255,255,255,0.7)',
                  textShadow: `0 0 20px ${activeSequence.color}40`,
                }}>
                  {waypointName}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Right: stop button */}
            <button
              onClick={stop}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444',
                pointerEvents: 'auto',
              }}
              data-testid="cinematic-stop-btn"
            >
              <div className="flex items-center gap-1.5">
                <Pause size={10} />
                Exit
              </div>
            </button>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="fixed bottom-10 left-6 right-6"
            style={{ zIndex: 220, height: 2 }}
          >
            <div className="w-full h-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: activeSequence.color }}
                animate={{ width: `${((currentStep + 1) / totalWaypoints) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        </>
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
              Choose a cinematic journey
            </p>
            <div className="space-y-2">
              {Object.entries(CINEMATIC_SEQUENCES).map(([key, seq]) => (
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
                    style={{ background: `${seq.color}10`, border: `1px solid ${seq.color}20` }}>
                    <Compass size={14} style={{ color: seq.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: seq.color }}>{seq.name}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{seq.desc}</p>
                    <p className="text-[8px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {seq.waypoints.length} waypoints | ~{Math.round(seq.waypoints.reduce((a, b) => a + b.hold, 0) / 1000)}s
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
