/**
 * SpatialRouter.js — Global Spatial Room Auto-Wrapper
 * 
 * Automatically wraps ALL page content in the correct SpatialRoom
 * based on the current route. This eliminates the need to manually
 * import SpatialRoom into every single page file.
 * 
 * Route → Room mapping uses the 9x9 grid math:
 *   Each route maps to a room theme with realm, zDepth, and mode.
 *   The fold/extrude transition fires on route change.
 */
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialRoom, { ROOM_THEMES } from './SpatialRoom';

// Route → Room key mapping
const ROUTE_TO_ROOM = {
  '/breathing': 'breathing',
  '/meditation': 'meditation',
  '/yoga': 'yoga',
  '/mudras': 'mudras',
  '/mantras': 'mantras',
  '/light-therapy': 'default',
  '/affirmations': 'default',
  '/daily-ritual': 'default',
  '/mood': 'default',
  '/oracle': 'oracle',
  '/akashic-records': 'oracle',
  '/star-chart': 'star_chart',
  '/numerology': 'oracle',
  '/dreams': 'oracle',
  '/mayan': 'oracle',
  '/cosmic-calendar': 'star_chart',
  '/cardology': 'oracle',
  '/animal-totems': 'default',
  '/zen-garden': 'meditation',
  '/soundscapes': 'frequencies',
  '/music-lounge': 'frequencies',
  '/frequencies': 'frequencies',
  '/vr': 'meditation',
  '/journal': 'default',
  '/wisdom-journal': 'teachings',
  '/green-journal': 'herbology',
  '/nourishment': 'nourishment',
  '/aromatherapy': 'aromatherapy',
  '/herbology': 'herbology',
  '/elixirs': 'elixirs',
  '/acupressure': 'acupressure',
  '/reiki': 'reiki',
  '/meal-planning': 'nourishment',
  '/wellness-reports': 'default',
  '/encyclopedia': 'encyclopedia',
  '/reading-list': 'teachings',
  '/creation-stories': 'default',
  '/teachings': 'teachings',
  '/community': 'community',
  '/blessings': 'teachings',
  '/sacred-texts': 'sacred_texts',
  '/coach': 'default',
  '/crystals': 'crystals',
  '/daily-briefing': 'default',
  '/forecasts': 'star_chart',
  '/sovereign-circle': 'community',
  '/sovereigns': 'community',
  '/economy': 'default',
  '/academy': 'teachings',
  '/cosmic-profile': 'default',
  '/games': 'default',
  '/starseed': 'star_chart',
};

// Routes that should NOT get a SpatialRoom wrapper
const EXCLUDED_ROUTES = [
  '/', '/landing', '/auth', '/intro', '/sovereign-hub',
  '/cosmic-mixer', '/creator-console', '/admin',
];

/**
 * SpatialRouter — Wraps children in SpatialRoom based on current route.
 * Handles fold/extrude transition on route change.
 */
export default function SpatialRouter({ children }) {
  const location = useLocation();
  const [prevRoom, setPrevRoom] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const prevPathRef = useRef(location.pathname);

  const currentPath = location.pathname;
  const isExcluded = EXCLUDED_ROUTES.some(r => currentPath === r || currentPath.startsWith(r + '/'));
  const roomKey = ROUTE_TO_ROOM[currentPath] || 'default';

  // Detect route change for fold/extrude transition
  useEffect(() => {
    if (prevPathRef.current !== currentPath && !isExcluded) {
      const prevRoomKey = ROUTE_TO_ROOM[prevPathRef.current];
      if (prevRoomKey && prevRoomKey !== roomKey) {
        setPrevRoom(prevRoomKey);
        setTransitioning(true);
        const t = setTimeout(() => {
          setTransitioning(false);
          setPrevRoom(null);
        }, 400);
        prevPathRef.current = currentPath;
        return () => clearTimeout(t);
      }
    }
    prevPathRef.current = currentPath;
  }, [currentPath, isExcluded, roomKey]);

  // Excluded routes render without spatial wrapper
  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPath}
        initial={{ opacity: 0, scaleZ: 0.8 }}
        animate={{ opacity: 1, scaleZ: 1 }}
        exit={{ opacity: 0, scaleZ: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <SpatialRoom room={roomKey}>
          {children}
        </SpatialRoom>
      </motion.div>
    </AnimatePresence>
  );
}

export { ROUTE_TO_ROOM, EXCLUDED_ROUTES };
