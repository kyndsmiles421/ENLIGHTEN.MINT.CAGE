import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export function ActiveSatellite({ sat, x, y, isHovered, isSnapped, onHover, onSelect, onDeactivate, onInspect, dimmed, gravityDamping = 20, gravityStiffness = 60 }) {
  const Icon = sat.icon;
  const longPressRef = useRef(null);

  const handleDown = useCallback((e) => {
    e.stopPropagation();
    longPressRef.current = setTimeout(() => {
      longPressRef.current = null;
      if (onInspect) onInspect(sat);
    }, 500);
  }, [sat, onInspect]);

  const handleUp = useCallback((e) => {
    e.stopPropagation();
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
      onSelect(sat);
    }
  }, [sat, onSelect]);

  const scale = isHovered ? 1.25 : isSnapped ? 1.12 : dimmed ? 0.85 : 1;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: '50%', top: '50%', width: 72, height: 72, marginLeft: -36, marginTop: -36, zIndex: dimmed ? 3 : isSnapped ? 12 : 10 }}
      animate={{ x, y, scale, opacity: dimmed ? 0.2 : 1 }}
      transition={{ type: 'spring', stiffness: gravityStiffness, damping: gravityDamping }}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={() => { if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; } }}
      onHoverStart={() => onHover(sat.id)}
      onHoverEnd={() => onHover(null)}
      onContextMenu={(e) => { e.preventDefault(); onDeactivate(sat.id); }}
      data-testid={`satellite-${sat.id}`}
    >
      <div className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300"
        style={{
          background: isSnapped ? `${sat.color}10` : isHovered ? `${sat.color}14` : 'rgba(10,10,18,0.55)',
          border: `${isSnapped ? '1.5px' : '1px'} solid ${isSnapped ? sat.color + '40' : isHovered ? sat.color + '50' : sat.color + '12'}`,
          boxShadow: isSnapped ? `0 0 32px ${sat.color}18, inset 0 0 16px ${sat.color}08`
            : isHovered ? `0 0 28px ${sat.color}20, inset 0 0 12px ${sat.color}08` : 'none',
          backdropFilter: 'blur(10px)',
          filter: dimmed ? 'blur(2px)' : 'none',
        }}>
        <Icon size={isSnapped ? 21 : 19} style={{ color: sat.color }} />
        <p className="text-[7px] mt-0.5 font-medium transition-colors duration-300"
          style={{ color: isSnapped || isHovered ? sat.color : 'rgba(248,250,252,0.35)' }}>{sat.label}</p>
        {isSnapped && (
          <p className="text-[5px] font-mono mt-0 tracking-wider uppercase"
            style={{ color: `${sat.color}50` }}>
            active
          </p>
        )}
      </div>
    </motion.div>
  );
}
