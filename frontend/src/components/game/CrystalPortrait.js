import React from 'react';
import { motion } from 'framer-motion';

/**
 * CrystalPortrait — renders a unique SVG crystal for every specimen.
 *
 * The geometry is deterministic from `specimen.id`: the same rock always
 * yields the same silhouette, facet count, and sparkle pattern. No network
 * calls, no LLM — pure SVG so it respects the Metabolic Seal (<2KB each).
 *
 * Facet count scales with rarity (common→6 → mythic→12). Hue comes from
 * element color, shimmer overlay from rarity color.
 */

const ELEMENT_HUE = {
  wood:   '#22C55E',
  fire:   '#EF4444',
  earth:  '#F59E0B',
  metal:  '#94A3B8',
  water:  '#3B82F6',
  light:  '#F4D58D',
  air:    '#A5B4FC',
};

const RARITY_FACETS = {
  common:     6,
  uncommon:   7,
  rare:       8,
  epic:       9,
  legendary: 10,
  mythic:    12,
};

const RARITY_GLOW = {
  common:    '#9CA3AF',
  uncommon:  '#22C55E',
  rare:      '#3B82F6',
  epic:      '#A855F7',
  legendary: '#FCD34D',
  mythic:    '#EF4444',
};

// Deterministic hash → pseudo-random [0,1)
function hash01(seed, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = (h >>> 0) / 4294967295;
  return h;
}

function polygonPath(cx, cy, r, sides, rotation = 0, jitterSeed = '') {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2 - Math.PI / 2;
    const jitter = jitterSeed ? 0.82 + hash01(jitterSeed, i) * 0.28 : 1;
    pts.push(`${(cx + Math.cos(a) * r * jitter).toFixed(2)},${(cy + Math.sin(a) * r * jitter).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

export default function CrystalPortrait({ specimen, size = 56 }) {
  if (!specimen) return null;
  const id = specimen.id || specimen.name || 'unknown';
  const element = specimen.element || 'earth';
  const rarity = specimen.actual_rarity || specimen.rarity_base || 'common';

  const hue = ELEMENT_HUE[element] || '#94A3B8';
  const glow = RARITY_GLOW[rarity] || '#9CA3AF';
  const facets = RARITY_FACETS[rarity] || 6;

  const rotation = hash01(id, 7) * Math.PI * 2;
  const cx = size / 2;
  const cy = size / 2;

  const outerR = size * 0.42;
  const innerR = size * 0.22;

  // Outer silhouette — jagged polygon unique per specimen
  const outerPath = polygonPath(cx, cy, outerR, facets, rotation, id);
  // Inner highlight — smaller rotated polygon for depth
  const innerPath = polygonPath(cx, cy, innerR, Math.max(4, Math.floor(facets / 2)), rotation + 0.6, id + '-inner');

  // Specular highlight — one or two bright facets on the upper-left
  const highlightAngle = rotation - Math.PI * 0.35;
  const hx = cx + Math.cos(highlightAngle) * outerR * 0.55;
  const hy = cy + Math.sin(highlightAngle) * outerR * 0.55;

  // Sparkles — 0..3 scaled by rarity
  const sparkleCount = { common: 0, uncommon: 1, rare: 2, epic: 2, legendary: 3, mythic: 4 }[rarity] || 0;
  const sparkles = Array.from({ length: sparkleCount }).map((_, i) => ({
    x: cx + (hash01(id, 100 + i) - 0.5) * size * 0.7,
    y: cy + (hash01(id, 200 + i) - 0.5) * size * 0.7,
    r: 0.5 + hash01(id, 300 + i) * 1.2,
    d: 1.2 + hash01(id, 400 + i) * 1.6,
  }));

  const gradId = `cp-grad-${id.replace(/[^a-z0-9]/gi, '')}`;
  const glowFilterId = `cp-glow-${id.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 180 }}
      data-testid={`crystal-portrait-${specimen.id}`}
      aria-label={specimen.name}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.95" />
          <stop offset="55%" stopColor={hue} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={rarity === 'mythic' ? 2.2 : rarity === 'legendary' ? 1.5 : 0.8} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background halo */}
      <circle cx={cx} cy={cy} r={outerR * 1.15} fill={glow} opacity="0.08" />

      {/* Main silhouette with glow filter */}
      <g filter={`url(#${glowFilterId})`}>
        <path d={outerPath} fill={`url(#${gradId})`} stroke={glow} strokeWidth="0.6" strokeOpacity="0.55" strokeLinejoin="round" />
        <path d={innerPath} fill={hue} fillOpacity="0.25" stroke={glow} strokeWidth="0.4" strokeOpacity="0.35" strokeLinejoin="round" />
      </g>

      {/* Specular highlight */}
      <ellipse cx={hx} cy={hy} rx={outerR * 0.22} ry={outerR * 0.11} fill="#FFFFFF" opacity="0.45" transform={`rotate(${(highlightAngle * 180 / Math.PI).toFixed(1)} ${hx} ${hy})`} />

      {/* Rarity sparkles */}
      {sparkles.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={s.r} fill={glow} opacity="0.85">
            <animate attributeName="opacity" values="0.2;0.95;0.2" dur={`${s.d}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </motion.svg>
  );
}
