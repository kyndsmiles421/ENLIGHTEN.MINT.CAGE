import React from 'react';
import { motion } from 'framer-motion';

export function ActiveSatellite({ sat, x, y, isHovered, onHover, onSelect, onDeactivate, dimmed, gravityDamping = 20, gravityStiffness = 60 }) {
  const Icon = sat.icon;
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: '50%', top: '50%', width: 68, height: 68, marginLeft: -34, marginTop: -34, zIndex: dimmed ? 3 : 10 }}
      animate={{ x, y, scale: isHovered ? 1.2 : dimmed ? 0.85 : 1, opacity: dimmed ? 0.2 : 1 }}
      transition={{ type: 'spring', stiffness: gravityStiffness, damping: gravityDamping }}
      whileTap={{ scale: 0.88 }}
      onClick={() => onSelect(sat)}
      onHoverStart={() => onHover(sat.id)}
      onHoverEnd={() => onHover(null)}
      onContextMenu={(e) => { e.preventDefault(); onDeactivate(sat.id); }}
      data-testid={`satellite-${sat.id}`}
    >
      <div className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-500"
        style={{
          background: isHovered ? `${sat.color}14` : 'rgba(10,10,18,0.55)',
          border: `1px solid ${isHovered ? sat.color + '50' : sat.color + '12'}`,
          boxShadow: isHovered ? `0 0 28px ${sat.color}20, inset 0 0 12px ${sat.color}08` : 'none',
          backdropFilter: 'blur(10px)',
          filter: dimmed ? 'blur(2px)' : 'none',
        }}>
        <Icon size={19} style={{ color: sat.color }} />
        <p className="text-[7px] mt-0.5 font-medium transition-colors duration-300"
          style={{ color: isHovered ? sat.color : 'rgba(248,250,252,0.35)' }}>{sat.label}</p>
      </div>
    </motion.div>
  );
}
