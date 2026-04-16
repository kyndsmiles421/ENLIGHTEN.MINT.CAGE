/**
 * SpatialRoom.js — 9x9 Spatial Grid Engine
 * 
 * Each module is a 3D volume defined by a 9x9 occupancy grid (81 nodes).
 * Scrolling = Z-axis penetration through the grid.
 * Items materialize based on proximity to the avatar's Z-coordinate.
 * The mixer HUD exists at Z:100 (static). Room content flows Z:0 to Z:-1200.
 * 
 * Grid Logic:
 *   X (0-8): Horizontal position across 9 columns
 *   Y (0-8): Vertical position across 9 rows  
 *   Z: Depth layer — scroll maps to translateZ
 *   
 * Proximity Reveal: Items fade in when within 1/9th of total room depth.
 * Avatar Badge: Coordinate pointer showing user's position in the 81-node grid.
 * Room Transitions: Previous room folds, new room extrudes from the grid.
 */
import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Avatar3D from './Avatar3D';
import SacredGeometryOverlay from './SacredGeometrySVG';
import GhostTrails from './GhostTrails';
import VitalityBar from './VitalityBar';
import { useAvatar } from '../context/AvatarContext';
import { PHI, PHI_INV, FIB_DEPTH_STEPS, phiExtrusion, getFibBreathPhase } from '../lib/SacredGeometry';

const GRID_SIZE = 9;
const TOTAL_NODES = GRID_SIZE * GRID_SIZE; // 81
const ROOM_DEPTH = 1200; // Total Z-depth of a room
const OCTANT_DEPTH = ROOM_DEPTH / GRID_SIZE; // ~133px per Z-layer (1/9th)
const MIXER_Z = 100; // Mixer HUD sits at Z:100 (in front of everything)

// ═══ ELEVATION REALMS ═══
// Y-axis determines the "realm" — vertical plane of existence
const REALMS = {
  HOLLOW_EARTH: { yOffset: -1200, atmosphere: 'dense', blur: '2px', label: 'Crystalline Depths' },
  SURFACE:      { yOffset: 0,     atmosphere: 'normal', blur: '0px', label: 'Surface Realm' },
  AIR:          { yOffset: 1200,  atmosphere: 'ethereal', blur: '0px', label: 'Sky Temple' },
};

// Spatial context — any child can read avatar position, realm, room state
const SpatialContext = createContext(null);
export const useSpatial = () => useContext(SpatialContext);

const ROOM_THEMES = {
  nourishment:  { floor: '#0d1a0f', wall: '#0a150c', accent: '#22C55E', particles: '#22C55E', icon: '🍃', name: 'The Living Kitchen', zDepth: -600, realm: 'SURFACE' },
  herbology:    { floor: '#0f1a0d', wall: '#0c150a', accent: '#84CC16', particles: '#84CC16', icon: '🌿', name: 'Herb Garden Sanctum', zDepth: -700, realm: 'SURFACE' },
  crystals:     { floor: '#0d0d1a', wall: '#0a0a15', accent: '#8B5CF6', particles: '#8B5CF6', icon: '💎', name: 'Crystal Chamber', zDepth: -800, realm: 'HOLLOW_EARTH' },
  aromatherapy: { floor: '#1a0d1a', wall: '#150a15', accent: '#C084FC', particles: '#C084FC', icon: '🌸', name: 'Essence Temple', zDepth: -600, realm: 'SURFACE' },
  meditation:   { floor: '#0d0d18', wall: '#0a0a14', accent: '#D8B4FE', particles: '#D8B4FE', icon: '🧘', name: 'Meditation Hall', zDepth: -1200, realm: 'HOLLOW_EARTH', mode: 'stillness' },
  breathing:    { floor: '#0d1518', wall: '#0a1214', accent: '#2DD4BF', particles: '#2DD4BF', icon: '🌬', name: 'Breath Chamber', zDepth: -500, realm: 'AIR', mode: 'rhythmic' },
  yoga:         { floor: '#18150d', wall: '#14120a', accent: '#FCD34D', particles: '#FCD34D', icon: '🕉', name: 'Yoga Studio', zDepth: -700, realm: 'SURFACE' },
  elixirs:      { floor: '#1a160d', wall: '#15120a', accent: '#FCD34D', particles: '#FCD34D', icon: '🧪', name: 'Alchemy Lab', zDepth: -600, realm: 'HOLLOW_EARTH' },
  acupressure:  { floor: '#0d1518', wall: '#0a1214', accent: '#2DD4BF', particles: '#2DD4BF', icon: '🤲', name: 'Meridian Room', zDepth: -500, realm: 'SURFACE' },
  oracle:       { floor: '#150d18', wall: '#120a14', accent: '#E879F9', particles: '#E879F9', icon: '🔮', name: 'Oracle Chamber', zDepth: -800, realm: 'HOLLOW_EARTH' },
  star_chart:   { floor: '#0a0a14', wall: '#080810', accent: '#6366F1', particles: '#6366F1', icon: '✨', name: 'Observatory', zDepth: -1000, realm: 'AIR' },
  teachings:    { floor: '#1a150d', wall: '#15120a', accent: '#D4AF37', particles: '#D4AF37', icon: '📿', name: 'Temple of Wisdom', zDepth: -700, realm: 'SURFACE' },
  encyclopedia: { floor: '#18120d', wall: '#140e0a', accent: '#FB923C', particles: '#FB923C', icon: '📖', name: 'Grand Library', zDepth: -900, realm: 'SURFACE' },
  frequencies:  { floor: '#120d18', wall: '#0e0a14', accent: '#8B5CF6', particles: '#8B5CF6', icon: '🎵', name: 'Frequency Lab', zDepth: -600, realm: 'HOLLOW_EARTH' },
  sacred_texts: { floor: '#1a160d', wall: '#15120a', accent: '#D4AF37', particles: '#D4AF37', icon: '📜', name: 'Sacred Archive', zDepth: -800, realm: 'HOLLOW_EARTH' },
  community:    { floor: '#0d1518', wall: '#0a1214', accent: '#38BDF8', particles: '#38BDF8', icon: '🌐', name: 'Gathering Hall', zDepth: -500, realm: 'SURFACE' },
  reiki:        { floor: '#180d15', wall: '#140a12', accent: '#F472B6', particles: '#F472B6', icon: '🙌', name: 'Reiki Chamber', zDepth: -600, realm: 'SURFACE' },
  mudras:       { floor: '#18150d', wall: '#14120a', accent: '#FDA4AF', particles: '#FDA4AF', icon: '🤲', name: 'Mudra Studio', zDepth: -500, realm: 'SURFACE' },
  mantras:      { floor: '#1a160d', wall: '#15120a', accent: '#FCD34D', particles: '#FCD34D', icon: '🕉', name: 'Mantra Hall', zDepth: -600, realm: 'SURFACE' },
  default:      { floor: '#0a0a12', wall: '#08080e', accent: '#A78BFA', particles: '#A78BFA', icon: '✦', name: 'Sovereign Space', zDepth: -600, realm: 'SURFACE' },
};

/**
 * Calculate proximity visibility.
 * Items within 1 octant (1/9th of room depth) of the avatar are fully visible.
 * Items further away fade to 0.15 opacity.
 */
function calculateProximity(scrollZ, itemZ) {
  const distance = Math.abs(scrollZ - itemZ);
  if (distance < OCTANT_DEPTH) return 1;
  if (distance < OCTANT_DEPTH * 2) return 0.7;
  if (distance < OCTANT_DEPTH * 3) return 0.4;
  return 0.15;
}

/**
 * Map a flat item index to a 9x9 grid coordinate
 */
function indexToGrid(index) {
  return {
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE) % GRID_SIZE,
    z: Math.floor(index / TOTAL_NODES),
  };
}

/**
 * AvatarBadge — Coordinate pointer with Fibonacci depth indicator.
 * Uses FIB_DEPTH_STEPS for natural acceleration depth mapping.
 */
function AvatarBadge({ scrollProgress, theme, nodesExplored, totalNodes }) {
  const fibIndex = Math.min(8, Math.floor(scrollProgress * 8));
  const fibDepth = FIB_DEPTH_STEPS[fibIndex];
  const gridY = Math.floor(fibDepth * (GRID_SIZE - 1));
  const pct = totalNodes > 0 ? Math.round((nodesExplored / totalNodes) * 100) : 0;

  return (
    <div className="flex items-center gap-2" data-testid="avatar-badge">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
        style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}35`, color: theme.accent }}>
        {theme.icon}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono" style={{ color: theme.accent }}>
            [{4},{gridY}]
          </span>
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {pct}% mapped
          </span>
        </div>
        {/* Fibonacci-spaced 9-segment depth indicator */}
        <div className="flex gap-px mt-0.5">
          {FIB_DEPTH_STEPS.map((step, i) => {
            const nextStep = i < FIB_DEPTH_STEPS.length - 1 ? FIB_DEPTH_STEPS[i + 1] : 1;
            const segWidth = Math.max(3, (nextStep - step) * 50);
            return (
              <div key={i} className="h-1 rounded-full"
                style={{
                  width: segWidth,
                  background: i <= fibIndex ? theme.accent : 'rgba(255,255,255,0.06)',
                  opacity: i <= fibIndex ? 0.8 : 0.3,
                }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Ambient depth particles — float in Z-space, not just X/Y
 */
function DepthParticles({ color, count = 16 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const zLayer = (i / count) * GRID_SIZE;
        const size = 1.5 + (1 - zLayer / GRID_SIZE) * 2.5; // Closer = larger
        const opacity = 0.08 + (1 - zLayer / GRID_SIZE) * 0.15;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: color,
              opacity,
              left: `${10 + Math.random() * 80}%`,
              top: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
              x: [0, (Math.random() - 0.5) * 15, 0],
              opacity: [opacity * 0.5, opacity, opacity * 0.5],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 5 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * ProximityItem — V54.9 φ-Ratio Collision Extrusion
 * 
 * Items don't pop forward linearly — they expand at the Golden Ratio (φ = 1.618).
 * Collision radius uses Fibonacci-spaced depth zones.
 * 3-second hover in active octant = auto-extrude with Phi scaling.
 */
export function ProximityItem({ index, children, totalItems, color }) {
  const spatial = useSpatial();
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [collisionActive, setCollisionActive] = useState(false);
  const triggerTimerRef = useRef(null);
  const wasActiveRef = useRef(false);

  const scrollProgress = spatial?.scrollProgress || 0;
  const theme = spatial?.theme;
  const itemProgress = totalItems > 1 ? index / (totalItems - 1) : 0;
  const distance = Math.abs(scrollProgress - itemProgress);
  const itemColor = color || theme?.accent || '#A78BFA';

  // φ-scaled collision zones (tighter than linear)
  const PHI_COLLISION = PHI_INV / GRID_SIZE; // ~0.069
  const isColliding = spatial ? distance < PHI_COLLISION : false;
  const isActive = spatial ? distance < (1 / GRID_SIZE) : false;
  const isNear = spatial ? distance < (2 / GRID_SIZE) : false;

  // Track collision state for unfold animation
  useEffect(() => {
    if (isColliding && !collisionActive) setCollisionActive(true);
    if (!isActive && collisionActive) {
      const t = setTimeout(() => setCollisionActive(false), 600);
      return () => clearTimeout(t);
    }
  }, [isColliding, isActive, collisionActive]);

  // 3-second auto-trigger
  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      wasActiveRef.current = true;
      triggerTimerRef.current = setTimeout(() => {
        setAutoTriggered(true);
        setTimeout(() => setAutoTriggered(false), 4000);
      }, 3000);
    } else if (!isActive && wasActiveRef.current) {
      wasActiveRef.current = false;
      clearTimeout(triggerTimerRef.current);
      setAutoTriggered(false);
    }
    return () => clearTimeout(triggerTimerRef.current);
  }, [isActive]);

  if (!spatial) return <div>{children}</div>;

  // φ-Ratio Extrusion — Golden Ratio scaling instead of linear
  const phi = phiExtrusion(distance);
  const opacity = autoTriggered ? 1 : isColliding ? 1 : phi.opacity;
  const scale = autoTriggered ? PHI_INV + 0.42 : isColliding ? phi.scale + 0.02 : phi.scale;
  const translateZ = autoTriggered ? phi.translateZ + 6 : phi.translateZ;
  const unfoldPad = collisionActive ? 4 : 0;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale.toFixed(4)}) translateZ(${translateZ.toFixed(1)}px)`,
        transition: 'opacity 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease',
        borderLeft: autoTriggered
          ? `3px solid ${itemColor}70`
          : isColliding
          ? `3px solid ${itemColor}50`
          : isActive
          ? `2px solid ${itemColor}35`
          : '2px solid transparent',
        boxShadow: autoTriggered
          ? `0 0 ${Math.round(40 * PHI_INV)}px ${itemColor}18, inset 0 0 20px ${itemColor}08`
          : isColliding
          ? `0 0 30px ${itemColor}12, inset 0 0 16px ${itemColor}06`
          : isActive
          ? `0 0 20px ${itemColor}08`
          : 'none',
        borderRadius: isActive || autoTriggered || isColliding ? '10px' : '0px',
        paddingLeft: unfoldPad + (isActive || autoTriggered ? 4 : 0),
        paddingTop: unfoldPad,
        paddingBottom: unfoldPad,
      }}
      data-proximity={autoTriggered ? 'triggered' : isColliding ? 'collision' : isActive ? 'active' : isNear ? 'near' : 'far'}
      data-testid={`proximity-item-${index}`}
    >
      {children}
      {(autoTriggered || isColliding) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 py-1 px-3 mt-1"
          style={{ color: itemColor }}
        >
          <Sparkles size={10} />
          <span className="text-[9px] font-medium">
            {autoTriggered ? 'Avatar proximity — auto-exploring' : 'Approaching...'}
          </span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * SpatialRoom — The main room wrapper.
 * Transforms a page into a 3D volume with the 9x9 grid math.
 * Supports realm elevation (HOLLOW_EARTH / SURFACE / AIR).
 * Breathing rooms pulse the grid. Meditation rooms reward stillness.
 */
export default function SpatialRoom({ room = 'default', children, nodesExplored = 0, totalNodes = 0 }) {
  const theme = ROOM_THEMES[room] || ROOM_THEMES.default;
  const realm = REALMS[theme.realm || 'SURFACE'];
  const [entered, setEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stillnessTimer, setStillnessTimer] = useState(0);
  const [hiddenRevealed, setHiddenRevealed] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const stillnessRef = useRef(null);
  const lastScrollRef = useRef(0);
  const breathRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Get user's avatar image from context
  const avatarCtx = useAvatar();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fibonacci breathing perspective pulse — replaces simple sine wave
  useEffect(() => {
    if (theme.mode !== 'rhythmic') return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const fibState = getFibBreathPhase(elapsed);
      // Map breath intensity to 0-1 for perspective modulation
      setBreathPhase(fibState.intensity);
      breathRef.current = requestAnimationFrame(animate);
    };
    breathRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(breathRef.current);
  }, [theme.mode]);

  // Map scroll to Z-axis progress
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const el = container.closest('[data-testid="content-area"]') || window;
      const scrollTop = el === window ? window.scrollY : el.scrollTop;
      const scrollHeight = el === window
        ? document.documentElement.scrollHeight - window.innerHeight
        : el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0;
      setScrollProgress(progress);
      lastScrollRef.current = Date.now();
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 200);
    };

    const scrollEl = container.closest('[data-testid="content-area"]') || window;
    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Meditation stillness reward: if user stays still for 30s, reveal hidden octants
  useEffect(() => {
    if (theme.mode !== 'stillness') return;
    stillnessRef.current = setInterval(() => {
      const timeSinceScroll = Date.now() - lastScrollRef.current;
      if (timeSinceScroll > 1000) {
        setStillnessTimer(prev => {
          const next = prev + 1;
          if (next >= 30 && !hiddenRevealed) {
            setHiddenRevealed(true);
          }
          return next;
        });
      } else {
        setStillnessTimer(0);
        setHiddenRevealed(false);
      }
    }, 1000);
    return () => clearInterval(stillnessRef.current);
  }, [theme.mode, hiddenRevealed]);

  // Realm-specific atmosphere
  const isHollowEarth = theme.realm === 'HOLLOW_EARTH';
  const isAir = theme.realm === 'AIR';
  const roomDepth = Math.abs(theme.zDepth);

  const spatialCtx = {
    room,
    theme,
    realm: theme.realm || 'SURFACE',
    scrollProgress,
    isScrolling,
    gridPosition: {
      x: 4,
      y: Math.floor(scrollProgress * (GRID_SIZE - 1)),
    },
    entered,
    nodesExplored,
    totalNodes,
    stillnessTimer,
    hiddenRevealed,
    mode: theme.mode || 'standard',
  };

  // Breathing rooms pulse perspective between zDepth and zDepth*0.6
  const breathingPerspective = theme.mode === 'rhythmic'
    ? roomDepth * (0.6 + breathPhase * 0.4)
    : roomDepth;

  return (
    <SpatialContext.Provider value={spatialCtx}>
      <div
        ref={containerRef}
        className="relative min-h-screen"
        style={{
          perspective: `${breathingPerspective}px`,
          perspectiveOrigin: '50% 40%',
          background: theme.floor,
          overflow: 'hidden',
          transition: theme.mode === 'rhythmic' ? 'none' : 'perspective 0.5s',
        }}
        data-testid={`spatial-room-${room}`}
      >
        {/* Floor plane */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(180deg, ${theme.wall} 0%, ${theme.floor} 25%, ${theme.floor} 75%, ${theme.wall}80 100%)`,
          zIndex: 0,
        }} />

        {/* V55.0 — Sacred Geometry Overlay (Sri Yantra + Metatron's Cube + Flower of Life) */}
        <SacredGeometryOverlay
          realm={theme.realm || 'SURFACE'}
          accent={theme.accent}
          scrollProgress={scrollProgress}
          breathIntensity={breathPhase}
        />

        {/* HOLLOW EARTH: Crystalline tunnel walls — tighter, more contained */}
        {isHollowEarth && (
          <>
            <div className="absolute left-0 top-0 bottom-0 pointer-events-none" style={{
              width: '25%',
              background: `linear-gradient(90deg, ${theme.wall}DD, ${theme.wall}40, transparent)`,
              zIndex: 0,
            }} />
            <div className="absolute right-0 top-0 bottom-0 pointer-events-none" style={{
              width: '25%',
              background: `linear-gradient(-90deg, ${theme.wall}DD, ${theme.wall}40, transparent)`,
              zIndex: 0,
            }} />
            {/* Crystal vein lines on walls */}
            {[15, 35, 55, 75, 90].map((top, i) => (
              <div key={`cl-${i}`} className="absolute pointer-events-none" style={{
                top: `${top}%`, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, ${theme.accent}25, transparent 15%, transparent 85%, ${theme.accent}25)`,
                zIndex: 0,
              }} />
            ))}
            {/* Ambient heat haze for dense atmosphere */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at 50% 80%, ${theme.accent}06, transparent 60%)`,
              filter: realm.blur !== '0px' ? `blur(${realm.blur})` : undefined,
              zIndex: 0,
            }} />
          </>
        )}

        {/* AIR: Open sky — no side walls, lighter top gradient */}
        {isAir && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}08, transparent 70%)`,
            zIndex: 0,
          }} />
        )}

        {/* SURFACE: Standard side walls */}
        {!isHollowEarth && !isAir && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <div className="absolute left-0 top-0 bottom-0 w-16"
              style={{ background: `linear-gradient(90deg, ${theme.wall}80, transparent)` }} />
            <div className="absolute right-0 top-0 bottom-0 w-16"
              style={{ background: `linear-gradient(-90deg, ${theme.wall}80, transparent)` }} />
          </div>
        )}

        {/* Ceiling accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `${theme.accent}20`, zIndex: 1 }} />

        {/* Depth particles */}
        <DepthParticles color={theme.particles} count={isHollowEarth ? 24 : 16} />

        {/* V55.0 — 3D Avatar Presence (User's actual avatar or crystal fallback) */}
        {entered && (
          <Avatar3D
            scrollProgress={scrollProgress}
            realm={theme.realm || 'SURFACE'}
            theme={theme}
            isScrolling={isScrolling}
            stillnessTimer={stillnessTimer}
            hiddenRevealed={hiddenRevealed}
            roomName={theme.name}
            avatarImage={avatarCtx?.activeAvatarB64}
          />
        )}

        {/* V55.0 — Ghost Trails (Community Presence — visible after 30s stillness) */}
        <GhostTrails
          room={room}
          stillnessTimer={stillnessTimer}
          userId={typeof window !== 'undefined' ? window.__userId : undefined}
          avatarColor={theme.accent}
          gridPosition={spatialCtx.gridPosition}
        />

        {/* Room header — name + realm indicator + avatar badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute top-2.5 left-4 right-4 flex items-center justify-between pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{theme.icon}</span>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] block"
                style={{ color: `${theme.accent}50` }}>
                {theme.name}
              </span>
              <span className="text-[6px] uppercase tracking-[0.15em]"
                style={{ color: `${theme.accent}30` }}>
                {realm.label}
              </span>
            </div>
          </div>
          <AvatarBadge scrollProgress={scrollProgress} theme={theme} nodesExplored={nodesExplored} totalNodes={totalNodes} />
          <VitalityBar accent={theme.accent} />
        </motion.div>

        {/* Stillness indicator for meditation rooms */}
        {theme.mode === 'stillness' && stillnessTimer > 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-12 left-0 right-0 text-center pointer-events-none"
            style={{ zIndex: 2 }}
          >
            <span className="text-[9px] font-mono" style={{ color: `${theme.accent}40` }}>
              Stillness: {stillnessTimer}s {hiddenRevealed && '— deeper layers revealed'}
            </span>
          </motion.div>
        )}

        {/* Content — enters from Z-depth */}
        <motion.div
          initial={{ opacity: 0, transform: `translateZ(${theme.zDepth * 0.08}px) rotateX(2deg)` }}
          animate={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateZ(0px) rotateX(0deg)' : `translateZ(${theme.zDepth * 0.08}px) rotateX(2deg)`,
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
          style={{ zIndex: 1, transformStyle: 'preserve-3d' }}
        >
          {children}
        </motion.div>
      </div>
    </SpatialContext.Provider>
  );
}

export { ROOM_THEMES, REALMS, GRID_SIZE, TOTAL_NODES, ROOM_DEPTH, OCTANT_DEPTH, calculateProximity, indexToGrid };
