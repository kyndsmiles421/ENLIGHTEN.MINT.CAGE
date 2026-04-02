import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCosmicState } from '../context/CosmicStateContext';
import { HexagramBadge, HexagramGlitch } from './ResonancePulse';

const ELEMENT_COLORS = {
  Wood: '#22C55E', Fire: '#EF4444', Earth: '#EAB308',
  Metal: '#94A3B8', Water: '#3B82F6',
};

/**
 * CosmicSparkline — Mini ODE energy curve overlay for the Orbital Hub.
 * Shows a real-time "visual pulse" of system stability.
 */
export function CosmicSparkline({ className = '' }) {
  const { cosmicState, loading, fetchCosmicState } = useCosmicState();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCosmicState();
    }
  }, [fetchCosmicState]);

  const sparkData = useMemo(() => {
    if (!cosmicState?.energies) return null;
    const energies = cosmicState.energies;
    const elements = Object.keys(energies);
    const values = Object.values(energies);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;
    return { elements, values, maxVal, minVal, range };
  }, [cosmicState]);

  const stability = cosmicState?.stability;
  const hexagram = cosmicState?.hexagram;
  const stabilityColor = stability === 'stable' ? '#22C55E' : stability === 'shifting' ? '#FBBF24' : '#EF4444';

  if (!sparkData) return null;

  const w = 160;
  const h = 44;
  const padding = 4;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  // Build sparkline path from energy values
  const points = sparkData.values.map((v, i) => {
    const x = padding + (i / (sparkData.values.length - 1)) * chartW;
    const y = padding + chartH - ((v - sparkData.minVal) / sparkData.range) * chartH;
    return { x, y, elem: sparkData.elements[i] };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillD = `${pathD} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      data-testid="cosmic-sparkline"
    >
      {/* Sparkline SVG */}
      <div className="relative" style={{ width: w, height: h }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stabilityColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={stabilityColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillD} fill="url(#sparkFill)" />
          <path d={pathD} fill="none" stroke={stabilityColor} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          {/* Element dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5}
              fill={ELEMENT_COLORS[p.elem] || '#fff'}
              opacity={0.8}
              style={{ filter: `drop-shadow(0 0 2px ${ELEMENT_COLORS[p.elem]}60)` }}
            />
          ))}
        </svg>
        {/* Stability label */}
        <div className="absolute -bottom-0.5 left-0 right-0 flex justify-between px-1">
          {sparkData.elements.map(e => (
            <span key={e} className="text-[5px] font-mono uppercase"
              style={{ color: `${ELEMENT_COLORS[e]}60` }}>
              {e.charAt(0)}
            </span>
          ))}
        </div>
      </div>

      {/* Status column */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{
            background: stabilityColor,
            boxShadow: `0 0 4px ${stabilityColor}40`,
          }} />
          <span className="text-[8px] font-mono capitalize" style={{ color: stabilityColor }}>
            {stability || 'loading'}
          </span>
        </div>
        {hexagram && (
          <HexagramGlitch active={hexagram.is_transitioning} intensity="low">
            <HexagramBadge hexagram={hexagram} compact />
          </HexagramGlitch>
        )}
      </div>
    </motion.div>
  );
}
