/**
 * SacredGeometrySVG.js — V55.0 Visual Sacred Geometry Overlays
 * 
 * SVG components rendering the cascading sacred geometry layers:
 * 1. Sri Yantra (apex focus — converging triangles)
 * 2. Metatron's Cube (structural grid)
 * 3. Flower of Life (foundational vitality, breathing guide)
 * 
 * These render as subtle, translucent overlays within the SpatialRoom,
 * responding to scroll depth, stillness, and breathing state.
 */
import React, { memo } from 'react';
import { PHI, TAU } from '../lib/SacredGeometry';

/**
 * Sri Yantra — 9 interlocking triangles (4 upward Shiva + 5 downward Shakti)
 * Used as the "Apex Focus" geometry that converges toward the avatar's target.
 */
export const SriYantra = memo(function SriYantra({ size = 200, color = '#D4AF37', opacity = 0.08 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.42;

  // Generate concentric triangle rings
  const upTriangles = [0.95, 0.75, 0.55, 0.35].map((s, i) => {
    const tr = r * s;
    return `${cx},${cy - tr} ${cx - tr * 0.866},${cy + tr * 0.5} ${cx + tr * 0.866},${cy + tr * 0.5}`;
  });
  const downTriangles = [0.88, 0.68, 0.48, 0.28, 0.12].map((s, i) => {
    const tr = r * s;
    return `${cx},${cy + tr} ${cx - tr * 0.866},${cy - tr * 0.5} ${cx + tr * 0.866},${cy - tr * 0.5}`;
  });

  // Lotus petals (outer ring)
  const petalCount = 16;
  const petalPaths = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * TAU - Math.PI / 2;
    const nextAngle = ((i + 1) / petalCount) * TAU - Math.PI / 2;
    const midAngle = (angle + nextAngle) / 2;
    const innerR = r * 1.05;
    const outerR = r * 1.25;
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(nextAngle) * innerR;
    const y2 = cy + Math.sin(nextAngle) * innerR;
    const cpx = cx + Math.cos(midAngle) * outerR;
    const cpy = cy + Math.sin(midAngle) * outerR;
    petalPaths.push(`M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`);
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ opacity }}
      data-testid="sri-yantra"
    >
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r * 1.05} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />

      {/* Lotus petals */}
      {petalPaths.map((d, i) => (
        <path key={`petal-${i}`} d={d} fill="none" stroke={color} strokeWidth="0.4" opacity="0.3" />
      ))}

      {/* Upward triangles (Shiva) */}
      {upTriangles.map((pts, i) => (
        <polygon key={`up-${i}`} points={pts} fill="none" stroke={color} strokeWidth={0.6 - i * 0.1} opacity={0.6 - i * 0.1} />
      ))}

      {/* Downward triangles (Shakti) */}
      {downTriangles.map((pts, i) => (
        <polygon key={`dn-${i}`} points={pts} fill="none" stroke={color} strokeWidth={0.6 - i * 0.08} opacity={0.5 - i * 0.08} />
      ))}

      {/* Bindu (center point) */}
      <circle cx={cx} cy={cy} r={2} fill={color} opacity="0.6">
        <animate attributeName="r" values="2;3;2" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={r * 0.1} fill="none" stroke={color} strokeWidth="0.4" opacity="0.4" />
    </svg>
  );
});

/**
 * Flower of Life — Overlapping circles in sacred tessellation.
 * Used as the breathing guide: circles bloom as Fibonacci numbers grow.
 * @param {number} level - How many rings to show (1=seed, 2=flower, 3=full)
 * @param {number} breathProgress - 0-1 animation progress for bloom
 */
export const FlowerOfLife = memo(function FlowerOfLife({
  size = 200,
  color = '#22C55E',
  opacity = 0.12,
  level = 2,
  breathProgress = 0,
}) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.12; // Radius per circle

  // Generate circle positions for Flower of Life
  const circles = [{ x: 0, y: 0, ring: 0 }]; // Center (Seed)

  // Ring 1: 6 circles at 60° intervals
  if (level >= 1) {
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      circles.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, ring: 1 });
    }
  }

  // Ring 2: 12 circles (Flower of Life)
  if (level >= 2) {
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      circles.push({ x: Math.cos(angle) * r * 2, y: Math.sin(angle) * r * 2, ring: 2 });
    }
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 + 30) * Math.PI / 180;
      circles.push({ x: Math.cos(angle) * r * Math.sqrt(3), y: Math.sin(angle) * r * Math.sqrt(3), ring: 2 });
    }
  }

  // Ring 3: Full Flower
  if (level >= 3) {
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180;
      circles.push({ x: Math.cos(angle) * r * 3, y: Math.sin(angle) * r * 3, ring: 3 });
    }
  }

  // Breath-driven bloom scale
  const bloomScale = 0.7 + breathProgress * 0.3;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ opacity }}
      data-testid="flower-of-life"
    >
      {circles.map((c, i) => {
        const ringOpacity = c.ring === 0 ? 0.6 : c.ring === 1 ? 0.5 : c.ring === 2 ? 0.35 : 0.2;
        const ringScale = c.ring <= Math.ceil(breathProgress * 3) ? bloomScale : 0.5;
        const circleR = r * ringScale;
        return (
          <circle
            key={i}
            cx={cx + c.x}
            cy={cy + c.y}
            r={circleR}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity={ringOpacity}
          >
            {c.ring > 0 && (
              <animate
                attributeName="r"
                values={`${circleR * 0.95};${circleR};${circleR * 0.95}`}
                dur={`${3 + c.ring}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        );
      })}
    </svg>
  );
});

/**
 * Metatron's Cube — 13 circles connected by lines forming Platonic Solids.
 * Used as the structural grid for Academy/Masonry modules.
 */
export const MetatronsCube = memo(function MetatronsCube({ size = 200, color = '#8B5CF6', opacity = 0.1 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.18;

  // 13 vertices: center + 6 inner ring + 6 outer ring
  const vertices = [{ x: cx, y: cy }];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    vertices.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 + 30) * Math.PI / 180;
    vertices.push({ x: cx + Math.cos(angle) * r * PHI, y: cy + Math.sin(angle) * r * PHI });
  }

  // Connect all 13 vertices to each other (78 lines)
  const lines = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      lines.push({ x1: vertices[i].x, y1: vertices[i].y, x2: vertices[j].x, y2: vertices[j].y });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ opacity }}
      data-testid="metatrons-cube"
    >
      {/* Connection lines */}
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={color} strokeWidth="0.3" opacity="0.3" />
      ))}

      {/* Vertex circles */}
      {vertices.map((v, i) => (
        <circle key={`v-${i}`} cx={v.x} cy={v.y} r={i === 0 ? 3 : 2}
          fill="none" stroke={color} strokeWidth="0.6" opacity={i === 0 ? 0.6 : 0.4} />
      ))}
    </svg>
  );
});

/**
 * SacredGeometryOverlay — Cascading layers responding to room realm.
 * Renders subtle geometry behind content based on realm type.
 */
export default function SacredGeometryOverlay({ realm, accent, scrollProgress = 0, breathIntensity = 0 }) {
  const overlayOpacity = 0.04 + scrollProgress * 0.03;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-0"
      style={{ zIndex: 0, opacity: overlayOpacity }}
      data-testid="sacred-geometry-overlay"
    >
      {/* Sri Yantra — top (apex focus) */}
      <div style={{ marginBottom: -20, transform: `scale(${0.8 + scrollProgress * 0.2})`, transition: 'transform 1s' }}>
        <SriYantra size={160} color={accent} opacity={realm === 'HOLLOW_EARTH' ? 0.12 : 0.06} />
      </div>

      {/* Metatron's Cube — middle (structural) */}
      <div style={{ transform: `rotate(${scrollProgress * 30}deg)`, transition: 'transform 2s' }}>
        <MetatronsCube size={140} color={accent} opacity={realm === 'SURFACE' ? 0.1 : 0.05} />
      </div>

      {/* Flower of Life — bottom (vitality) */}
      <div style={{ marginTop: -20 }}>
        <FlowerOfLife
          size={120}
          color={accent}
          opacity={realm === 'AIR' ? 0.12 : 0.06}
          level={Math.ceil(breathIntensity * 3)}
          breathProgress={breathIntensity}
        />
      </div>
    </div>
  );
}
