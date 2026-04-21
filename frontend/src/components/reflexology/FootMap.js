import React from 'react';
import { motion } from 'framer-motion';
import { FOOT_ZONES, ELEMENT_COLOR } from '../../data/reflexologyData';

/**
 * FootMap — an SVG rendering of both feet with every reflex zone as a
 * clickable hotspot. The outline is a simplified medically-correct silhouette
 * (top-down plantar view, toes at the top, heel at the bottom).
 *
 * Props:
 *   onZoneClick(zone, foot)   — callback when a zone is tapped
 *   highlightZoneId           — id of a zone to pulse (practice game)
 *   revealAll                 — show labels at all times (study mode)
 *   mutedFootOpacity          — fade one foot when the other is active
 */
export default function FootMap({ onZoneClick, highlightZoneId, revealAll = false, practiceTargetId = null }) {
  const renderFoot = (side) => {
    // Zones that should render on this foot:
    // - zones with sideOnly === side
    // - zones with sideOnly === null (both feet)
    const zones = FOOT_ZONES.filter(z => !z.sideOnly || z.sideOnly === side);

    return (
      <g transform={side === 'right' ? 'translate(160, 0)' : 'translate(0, 0)'}
         data-testid={`foot-${side}`}>
        {/* Foot silhouette — top-down plantar view. Path traced to resemble
            a real footprint: wide ball, tapering arch, rounded heel. */}
        <path
          d="
            M 70 12
            C 55 10, 40 16, 34 30
            C 28 46, 24 72, 26 110
            C 28 148, 28 184, 30 222
            C 31 248, 34 280, 42 310
            C 50 340, 66 352, 80 352
            C 94 352, 110 340, 118 310
            C 126 280, 129 248, 130 222
            C 132 184, 132 148, 134 110
            C 136 72, 132 46, 126 30
            C 120 16, 105 10, 90 12
            C 82 13, 78 13, 70 12 Z
          "
          fill="rgba(15, 14, 25, 0.75)"
          stroke="rgba(244,213,141,0.25)"
          strokeWidth="0.8"
        />

        {/* Toe divisions — small arcs to separate the 5 toes */}
        {[0, 1, 2, 3].map(i => {
          const x = 44 + i * 18;
          return <line key={i} x1={x} y1="18" x2={x} y2="32"
            stroke="rgba(244,213,141,0.12)" strokeWidth="0.5" />;
        })}

        {/* Zone hotspots */}
        {zones.map(zone => {
          const cx = (zone.x / 100) * 160;
          const cy = (zone.y / 100) * 360;
          const r = zone.r * 1.2;
          const color = ELEMENT_COLOR[zone.element] || '#F4D58D';
          const isHighlight = highlightZoneId === zone.id;
          const isPractice = practiceTargetId === zone.id;

          return (
            <g key={`${side}-${zone.id}`}
               onClick={() => onZoneClick?.(zone, side)}
               style={{ cursor: 'pointer' }}
               data-testid={`zone-${side}-${zone.id}`}>
              {/* Pulse ring for active / highlight */}
              {isHighlight && (
                <circle cx={cx} cy={cy} r={r + 4}
                  fill="none" stroke={color} strokeWidth="1.2"
                  opacity="0.9">
                  <animate attributeName="r" values={`${r+4};${r+10};${r+4}`} dur="1.618s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.618s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Practice target — subtle gold halo, *no label* (user must find it) */}
              {isPractice && (
                <circle cx={cx} cy={cy} r={r + 6}
                  fill="none" stroke="#F4D58D" strokeWidth="0.6" opacity="0.35" strokeDasharray="2 3" />
              )}
              {/* Hotspot */}
              <circle cx={cx} cy={cy} r={r}
                fill={color} fillOpacity="0.35"
                stroke={color} strokeWidth="0.8" strokeOpacity="0.8" />
              <circle cx={cx} cy={cy} r={r * 0.35}
                fill={color} opacity="0.9" />
              {/* Hover halo is always-on at low alpha so taps feel discoverable */}
              <circle cx={cx} cy={cy} r={r + 2}
                fill="transparent" stroke={color} strokeWidth="0.3" strokeOpacity="0.2" />

              {/* Label — shown in revealAll mode OR when hovered */}
              {revealAll && (
                <text x={cx} y={cy - r - 3} textAnchor="middle"
                  fontSize="6" fontFamily="JetBrains Mono, monospace"
                  fill={color} opacity="0.75"
                  style={{ letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none' }}>
                  {zone.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Side label */}
        <text x="80" y="362" textAnchor="middle"
          fontSize="7" fontFamily="JetBrains Mono, monospace"
          fill="rgba(148,163,184,0.6)" style={{ letterSpacing: '0.3em' }}>
          {side.toUpperCase()}
        </text>
      </g>
    );
  };

  return (
    <motion.svg
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewBox="0 0 320 380"
      width="100%"
      height="auto"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      data-testid="foot-map-svg"
    >
      {renderFoot('left')}
      {renderFoot('right')}
    </motion.svg>
  );
}
