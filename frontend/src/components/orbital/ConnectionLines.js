import React from 'react';

export function ConnectionLines({ positions, hoveredSat, activeSats, cx, cy, dimmed }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
      {positions.map((pos, i) => {
        const sat = activeSats[i];
        if (!sat) return null;
        const isH = hoveredSat === sat.id;
        return (
          <line key={sat.id} x1={cx} y1={cy} x2={cx + pos.x} y2={cy + pos.y}
            stroke={isH ? sat.color : 'rgba(248,250,252,0.025)'}
            strokeWidth={isH ? 1.5 : 0.4}
            strokeDasharray={isH ? 'none' : '3,10'}
            strokeOpacity={dimmed ? 0.15 : 1}
            style={{ transition: 'all 0.5s ease' }} />
        );
      })}
    </svg>
  );
}
