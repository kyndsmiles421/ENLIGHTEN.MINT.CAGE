import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };

// Ambient grain overlay for low-harmony visual distortion
function GrainOverlay({ opacity }) {
  if (opacity < 0.005) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// Harmony-based ambient glow
function HarmonyGlow({ element, intensity }) {
  const color = EL_COLORS[element] || '#A855F7';
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      animate={{ opacity: [intensity * 0.03, intensity * 0.08, intensity * 0.03] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${color}15, transparent 70%)`,
      }}
    />
  );
}

// Glitch stripe effect for very low harmony
function GlitchStripes({ intensity }) {
  if (intensity < 0.1) return null;
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      animate={{ opacity: [0, intensity * 0.15, 0] }}
      transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 + Math.random() * 5 }}
      style={{
        background: `repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,0,0,0.03) 4px, rgba(255,0,0,0.03) 5px)`,
      }}
    />
  );
}

export default function GameModuleWrapper({ children, distortions, dominantElement, harmonyScore, moduleName }) {
  const elementColor = EL_COLORS[dominantElement] || '#F59E0B';

  const wrapperStyle = useMemo(() => ({
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    position: 'relative',
    overflow: 'hidden',
  }), []);

  return (
    <div style={wrapperStyle} data-testid={`game-module-${moduleName || 'unknown'}`}>
      <HarmonyGlow element={dominantElement} intensity={harmonyScore / 100} />
      <GrainOverlay opacity={distortions?.grainOpacity || 0} />
      <GlitchStripes intensity={distortions?.glitchIntensity || 0} />
      <div className="relative z-10" style={{
        filter: distortions?.blur > 0.5
          ? `blur(${distortions.blur * 0.2}px) saturate(${distortions.saturation})`
          : undefined,
        transition: 'filter 2s ease',
      }}>
        {children}
      </div>
    </div>
  );
}
