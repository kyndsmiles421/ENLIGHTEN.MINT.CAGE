import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export function AbyssSatellite({ sat, index, total, onActivate, abyssRadius }) {
  const Icon = sat.icon;
  const [dragProgress, setDragProgress] = useState(0);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const r = Math.sqrt(index / Math.max(total, 1)) * (abyssRadius * 0.38);
  const homeX = Math.cos(angle) * r;
  const homeY = Math.sin(angle) * r;
  const surfaceRadius = abyssRadius * 0.44;

  const handleDrag = useCallback((_, info) => {
    const cx = homeX + info.offset.x;
    const cy = homeY + info.offset.y;
    const dist = Math.sqrt(cx * cx + cy * cy);
    setDragProgress(Math.min(1, dist / surfaceRadius));
  }, [homeX, homeY, surfaceRadius]);

  const handleDragEnd = useCallback((_, info) => {
    const cx = homeX + info.offset.x;
    const cy = homeY + info.offset.y;
    const dist = Math.sqrt(cx * cx + cy * cy);
    if (dist > surfaceRadius) {
      if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
      onActivate(sat.id);
    }
    setDragProgress(0);
  }, [homeX, homeY, surfaceRadius, onActivate, sat.id]);

  const broken = dragProgress > 0.85;
  const scaleBoost = 1 + dragProgress * 0.3;
  const glowAlpha = Math.round(dragProgress * 0.35 * 255).toString(16).padStart(2, '0');

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{ left: '50%', top: '50%', width: 56, height: 56, marginLeft: -28, marginTop: -28, zIndex: 20 }}
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x: homeX, y: homeY }}
      exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: index * 0.06 }}
      drag
      dragMomentum={false}
      dragSnapToOrigin
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={(e) => { e.stopPropagation(); onActivate(sat.id); }}
      data-testid={`dormant-${sat.id}`}
    >
      <motion.div
        className="w-full h-full rounded-full flex flex-col items-center justify-center"
        style={{
          background: broken ? `${sat.color}30` : `${sat.color}0A`,
          border: `1px solid ${broken ? sat.color + '60' : sat.color + '20'}`,
          backdropFilter: 'blur(6px)',
          transform: `scale(${scaleBoost})`,
          boxShadow: dragProgress > 0.1 ? `0 0 ${12 + dragProgress * 24}px ${sat.color}${glowAlpha}` : 'none',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        whileHover={{ scale: 1.2, boxShadow: `0 0 24px ${sat.color}30` }}
        whileTap={{ scale: 0.85 }}
      >
        <Icon size={16 + dragProgress * 6} style={{ color: sat.color, opacity: 0.8 + dragProgress * 0.2 }} />
        <p className="text-[6px] mt-0.5 font-medium" style={{ color: broken ? sat.color : `${sat.color}90` }}>{sat.label}</p>
      </motion.div>
    </motion.div>
  );
}
