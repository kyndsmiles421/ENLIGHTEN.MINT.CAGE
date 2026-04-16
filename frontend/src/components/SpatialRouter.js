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
import { useAvatar } from '../context/AvatarContext';

// Route → Room key mapping (V55.0 — ALL 160+ routes mapped)
const ROUTE_TO_ROOM = {
  // ═══ BODY & BREATH ═══
  '/breathing': 'breathing',
  '/meditation': 'meditation',
  '/yoga': 'yoga',
  '/mudras': 'mudras',
  '/mantras': 'mantras',
  '/exercises': 'default',
  '/hooponopono': 'meditation',
  '/tantra': 'teachings',
  '/yantra': 'teachings',
  '/light-therapy': 'default',
  '/zen-garden': 'meditation',

  // ═══ DIVINATION & ORACLE ═══
  '/oracle': 'oracle',
  '/akashic-records': 'oracle',
  '/star-chart': 'star_chart',
  '/numerology': 'oracle',
  '/dreams': 'oracle',
  '/mayan': 'oracle',
  '/cosmic-calendar': 'star_chart',
  '/cardology': 'oracle',
  '/animal-totems': 'default',
  '/forecasts': 'star_chart',
  '/starseed': 'star_chart',
  '/hexagram-journal': 'oracle',
  '/dream-realms': 'oracle',

  // ═══ NOURISHMENT & HEALING ═══
  '/nourishment': 'nourishment',
  '/aromatherapy': 'aromatherapy',
  '/herbology': 'herbology',
  '/elixirs': 'elixirs',
  '/acupressure': 'acupressure',
  '/reiki': 'reiki',
  '/meal-planning': 'nourishment',
  '/crystals': 'crystals',
  '/crystal-skins': 'crystals',
  '/botany': 'herbology',
  '/botany-orbital': 'herbology',
  '/rock-hounding': 'crystals',

  // ═══ MUSIC & FREQUENCIES ═══
  '/soundscapes': 'frequencies',
  '/music-lounge': 'frequencies',
  '/frequencies': 'frequencies',
  '/theory': 'frequencies',
  '/dance-music-studio': 'frequencies',

  // ═══ MIND & JOURNAL ═══
  '/affirmations': 'default',
  '/daily-ritual': 'default',
  '/mood': 'default',
  '/journal': 'default',
  '/wisdom-journal': 'teachings',
  '/green-journal': 'herbology',
  '/wellness-reports': 'default',
  '/soul-reports': 'default',
  '/meditation-history': 'meditation',
  '/growth-timeline': 'default',

  // ═══ ACADEMY & TEACHINGS ═══
  '/academy': 'teachings',
  '/teachings': 'teachings',
  '/sacred-texts': 'sacred_texts',
  '/blessings': 'teachings',
  '/encyclopedia': 'encyclopedia',
  '/reading-list': 'teachings',
  '/creation-stories': 'default',
  '/certifications': 'teachings',
  '/classes': 'teachings',
  '/learn': 'teachings',
  '/tutorial': 'teachings',
  '/workshop': 'teachings',
  '/codex': 'teachings',
  '/codex-orbital': 'teachings',
  '/mastery-path': 'teachings',
  '/mastery-avenues': 'teachings',
  '/forgotten-languages': 'teachings',

  // ═══ COMMUNITY & SOVEREIGN ═══
  '/community': 'community',
  '/sovereign-circle': 'community',
  '/sovereigns': 'community',
  '/friends': 'community',
  '/live-room': 'community',
  '/live-sessions': 'community',
  '/trade-circle': 'community',
  '/trade-orbital': 'community',
  '/collective-shadow-map': 'community',
  '/coach': 'default',

  // ═══ GAMES & RPG ═══
  '/games': 'default',
  '/starseed-adventure': 'star_chart',
  '/rpg': 'default',
  '/cryptic-quest': 'default',
  '/challenges': 'default',

  // ═══ SOVEREIGN ECONOMY ═══
  '/economy': 'default',
  '/cosmic-store': 'default',
  '/pricing': 'default',
  '/membership': 'default',
  '/liquidity-trader': 'default',
  '/gravity-well': 'default',
  '/resource-alchemy': 'default',
  '/mint': 'default',
  '/minting-ceremony': 'default',

  // ═══ COSMIC & VR ═══
  '/cosmic-profile': 'default',
  '/cosmic-map': 'star_chart',
  '/vr': 'meditation',
  '/vr/celestial-dome': 'meditation',
  '/observatory': 'star_chart',
  '/ar-portal': 'default',
  '/dimensional-space': 'default',
  '/tesseract': 'default',
  '/entanglement': 'oracle',

  // ═══ CREATION & LAB ═══
  '/create': 'default',
  '/avatar': 'default',
  '/avatar-gallery': 'default',
  '/creator-console': 'default',
  '/lab': 'default',
  '/physics-lab': 'default',
  '/sovereign-canvas': 'default',
  '/fabricator': 'default',
  '/evolution-lab': 'default',
  '/refinement-lab': 'default',
  '/quantum-loom': 'default',
  '/quantum-field': 'default',
  '/fractal-engine': 'default',
  '/crystalline-engine': 'crystals',
  '/refractor': 'default',
  '/metatron': 'crystals',
  '/suanpan': 'default',

  // ═══ NAVIGATION & SYSTEM ═══
  '/hub': 'default',
  '/sovereign-hub': 'default',
  '/ether-hub': 'default',
  '/daily-briefing': 'default',
  '/analytics': 'default',
  '/settings': 'default',
  '/profile': 'default',
  '/discover': 'default',
  '/media-library': 'default',
  '/archives': 'default',
  '/lattice-view': 'default',
  '/master-view': 'default',
  '/master-engine': 'default',
  '/recursive-dive': 'oracle',
  '/seed-gallery': 'default',
  '/smartdock': 'default',
  '/sovereign': 'default',
  '/sovereignty': 'default',
  '/enlightenment-os': 'default',
  '/sanctuary': 'meditation',
  '/silent-sanctuary': 'meditation',
  '/void': 'meditation',
  '/cosmic-insights': 'star_chart',
  '/cosmic-ledger': 'default',
  '/videos': 'default',
  '/feedback': 'default',
  '/help': 'default',
  '/terms': 'default',
  '/replant': 'default',
  '/sovereign-admin': 'default',
  '/journey': 'default',
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
  const avatarCtx = useAvatar();

  const currentPath = location.pathname;
  const isExcluded = EXCLUDED_ROUTES.some(r => currentPath === r || currentPath.startsWith(r + '/'));
  const roomKey = ROUTE_TO_ROOM[currentPath] || 'default';

  // Track world exploration
  useEffect(() => {
    if (!isExcluded && avatarCtx?.visitRoom) {
      avatarCtx.visitRoom(currentPath);
    }
  }, [currentPath, isExcluded, avatarCtx]);

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
        initial={{
          opacity: 0,
          rotateY: transitioning ? 15 : 0,
          scale: 0.92,
          filter: 'blur(4px)',
        }}
        animate={{
          opacity: 1,
          rotateY: 0,
          scale: 1,
          filter: 'blur(0px)',
        }}
        exit={{
          opacity: 0,
          rotateY: -15,
          scale: 0.92,
          filter: 'blur(4px)',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
      >
        <SpatialRoom room={roomKey}>
          {children}
        </SpatialRoom>
      </motion.div>
    </AnimatePresence>
  );
}

export { ROUTE_TO_ROOM, EXCLUDED_ROUTES };
