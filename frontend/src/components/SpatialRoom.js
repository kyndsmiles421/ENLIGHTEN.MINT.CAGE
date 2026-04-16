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
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const PHI = 1.618033988749895;
const GRID_SIZE = 9;
const TOTAL_NODES = GRID_SIZE * GRID_SIZE; // 81
const ROOM_DEPTH = 1200; // Total Z-depth of a room
const OCTANT_DEPTH = ROOM_DEPTH / GRID_SIZE; // ~133px per Z-layer (1/9th)
const MIXER_Z = 100; // Mixer HUD sits at Z:100 (in front of everything)

// Spatial context — any child can read the avatar's position and room state
const SpatialContext = createContext(null);
export const useSpatial = () => useContext(SpatialContext);

const ROOM_THEMES = {
  nourishment:  { floor: '#0d1a0f', wall: '#0a150c', accent: '#22C55E', particles: '#22C55E', icon: '🍃', name: 'The Living Kitchen', zDepth: -600 },
  herbology:    { floor: '#0f1a0d', wall: '#0c150a', accent: '#84CC16', particles: '#84CC16', icon: '🌿', name: 'Herb Garden Sanctum', zDepth: -700 },
  crystals:     { floor: '#0d0d1a', wall: '#0a0a15', accent: '#8B5CF6', particles: '#8B5CF6', icon: '💎', name: 'Crystal Chamber', zDepth: -800 },
  aromatherapy: { floor: '#1a0d1a', wall: '#150a15', accent: '#C084FC', particles: '#C084FC', icon: '🌸', name: 'Essence Temple', zDepth: -600 },
  meditation:   { floor: '#0d0d18', wall: '#0a0a14', accent: '#D8B4FE', particles: '#D8B4FE', icon: '🧘', name: 'Meditation Hall', zDepth: -900 },
  breathing:    { floor: '#0d1518', wall: '#0a1214', accent: '#2DD4BF', particles: '#2DD4BF', icon: '🌬', name: 'Breath Chamber', zDepth: -500 },
  yoga:         { floor: '#18150d', wall: '#14120a', accent: '#FCD34D', particles: '#FCD34D', icon: '🕉', name: 'Yoga Studio', zDepth: -700 },
  elixirs:      { floor: '#1a160d', wall: '#15120a', accent: '#FCD34D', particles: '#FCD34D', icon: '🧪', name: 'Alchemy Lab', zDepth: -600 },
  acupressure:  { floor: '#0d1518', wall: '#0a1214', accent: '#2DD4BF', particles: '#2DD4BF', icon: '🤲', name: 'Meridian Room', zDepth: -500 },
  oracle:       { floor: '#150d18', wall: '#120a14', accent: '#E879F9', particles: '#E879F9', icon: '🔮', name: 'Oracle Chamber', zDepth: -800 },
  star_chart:   { floor: '#0a0a14', wall: '#080810', accent: '#6366F1', particles: '#6366F1', icon: '✨', name: 'Observatory', zDepth: -1000 },
  teachings:    { floor: '#1a150d', wall: '#15120a', accent: '#D4AF37', particles: '#D4AF37', icon: '📿', name: 'Temple of Wisdom', zDepth: -700 },
  encyclopedia: { floor: '#18120d', wall: '#140e0a', accent: '#FB923C', particles: '#FB923C', icon: '📖', name: 'Grand Library', zDepth: -900 },
  frequencies:  { floor: '#120d18', wall: '#0e0a14', accent: '#8B5CF6', particles: '#8B5CF6', icon: '🎵', name: 'Frequency Lab', zDepth: -600 },
  sacred_texts: { floor: '#1a160d', wall: '#15120a', accent: '#D4AF37', particles: '#D4AF37', icon: '📜', name: 'Sacred Archive', zDepth: -800 },
  community:    { floor: '#0d1518', wall: '#0a1214', accent: '#38BDF8', particles: '#38BDF8', icon: '🌐', name: 'Gathering Hall', zDepth: -500 },
  reiki:        { floor: '#180d15', wall: '#140a12', accent: '#F472B6', particles: '#F472B6', icon: '🙌', name: 'Reiki Chamber', zDepth: -600 },
  mudras:       { floor: '#18150d', wall: '#14120a', accent: '#FDA4AF', particles: '#FDA4AF', icon: '🤲', name: 'Mudra Studio', zDepth: -500 },
  mantras:      { floor: '#1a160d', wall: '#15120a', accent: '#FCD34D', particles: '#FCD34D', icon: '🕉', name: 'Mantra Hall', zDepth: -600 },
  default:      { floor: '#0a0a12', wall: '#08080e', accent: '#A78BFA', particles: '#A78BFA', icon: '✦', name: 'Sovereign Space', zDepth: -600 },
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
 * AvatarBadge — Coordinate pointer showing user's position in the room.
 * Not an image — a living data point that tracks scroll-based Z position.
 */
function AvatarBadge({ scrollProgress, theme, nodesExplored, totalNodes }) {
  const gridY = Math.floor(scrollProgress * (GRID_SIZE - 1));
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
        {/* Mini 9-segment depth indicator */}
        <div className="flex gap-px mt-0.5">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div key={i} className="h-1 rounded-full"
              style={{
                width: 6,
                background: i <= gridY ? theme.accent : 'rgba(255,255,255,0.06)',
                opacity: i <= gridY ? 0.8 : 0.3,
              }} />
          ))}
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
 * ProximityRevealWrapper — Wraps each child and fades it based on scroll proximity.
 * Simulates "walking toward" content in Z-space.
 */
export function ProximityItem({ index, children, totalItems }) {
  const spatial = useSpatial();
  if (!spatial) return <div>{children}</div>;

  const { scrollProgress } = spatial;
  const itemProgress = totalItems > 1 ? index / (totalItems - 1) : 0;
  const distance = Math.abs(scrollProgress - itemProgress);
  
  // Items close to current scroll position are fully visible and slightly scaled up
  const opacity = distance < 0.15 ? 1 : distance < 0.3 ? 0.75 : distance < 0.5 ? 0.5 : 0.3;
  const scale = distance < 0.15 ? 1.0 : distance < 0.3 ? 0.98 : 0.96;
  const translateZ = distance < 0.15 ? 0 : distance < 0.3 ? -10 : -20;

  return (
    <motion.div
      style={{
        opacity,
        transform: `scale(${scale}) translateZ(${translateZ}px)`,
        transition: 'opacity 0.4s, transform 0.4s',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SpatialRoom — The main room wrapper.
 * Transforms a page into a 3D volume with the 9x9 grid math.
 */
export default function SpatialRoom({ room = 'default', children, nodesExplored = 0, totalNodes = 0 }) {
  const theme = ROOM_THEMES[room] || ROOM_THEMES.default;
  const [entered, setEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Map scroll to Z-axis progress (0 = room entrance, 1 = deepest point)
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
    };

    const scrollEl = container.closest('[data-testid="content-area"]') || window;
    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  const spatialCtx = {
    room,
    theme,
    scrollProgress,
    gridPosition: {
      x: 4, // Avatar centered
      y: Math.floor(scrollProgress * (GRID_SIZE - 1)),
    },
    entered,
    nodesExplored,
    totalNodes,
  };

  return (
    <SpatialContext.Provider value={spatialCtx}>
      <div
        ref={containerRef}
        className="relative min-h-screen"
        style={{
          perspective: `${ROOM_DEPTH}px`,
          perspectiveOrigin: '50% 40%',
          background: theme.floor,
          overflow: 'hidden',
        }}
        data-testid={`spatial-room-${room}`}
      >
        {/* Floor plane — depth gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(180deg, ${theme.wall} 0%, ${theme.floor} 25%, ${theme.floor} 75%, ${theme.wall}80 100%)`,
          zIndex: 0,
        }} />

        {/* Side walls — peripheral depth cues */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="absolute left-0 top-0 bottom-0 w-16"
            style={{ background: `linear-gradient(90deg, ${theme.wall}80, transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-16"
            style={{ background: `linear-gradient(-90deg, ${theme.wall}80, transparent)` }} />
        </div>

        {/* Ceiling accent — top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `${theme.accent}20`, zIndex: 1 }} />

        {/* Depth particles floating in Z-space */}
        <DepthParticles color={theme.particles} count={18} />

        {/* Room header — name + avatar badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute top-2.5 left-4 right-4 flex items-center justify-between pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{theme.icon}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]"
              style={{ color: `${theme.accent}50` }}>
              {theme.name}
            </span>
          </div>
          <AvatarBadge scrollProgress={scrollProgress} theme={theme} nodesExplored={nodesExplored} totalNodes={totalNodes} />
        </motion.div>

        {/* Content — enters from Z-depth with the 9x9 grid extrusion */}
        <motion.div
          initial={{ opacity: 0, transform: 'translateZ(-100px) rotateX(2deg)' }}
          animate={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateZ(0px) rotateX(0deg)' : 'translateZ(-100px) rotateX(2deg)',
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

export { ROOM_THEMES, GRID_SIZE, TOTAL_NODES, ROOM_DEPTH, OCTANT_DEPTH, calculateProximity, indexToGrid };
