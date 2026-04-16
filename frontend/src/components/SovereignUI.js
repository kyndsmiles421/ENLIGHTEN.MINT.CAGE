import React, { forwardRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSensoryResonance } from '../hooks/useSensoryResonance';
import { useCosmicTheme } from '../context/CosmicThemeContext';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOVEREIGN UI LIBRARY — Resonance-Wrapped Interactive Components
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Pre-built components that automatically inherit:
 * - Haptic feedback on interaction
 * - Color 2 radiance styling
 * - Consistent glass-morphism surfaces
 * - Accessibility-friendly focus states
 * 
 * Usage:
 * import { ResonanceButton, ResonanceCard, ResonanceOrb } from './SovereignUI';
 */

// ═══ RESONANCE BUTTON ═══
export const ResonanceButton = forwardRef(({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  hapticPattern = 'buttonTap',
  withRadiance = true,
  disabled = false,
  className = '',
  style = {},
  ...props
}, ref) => {
  const { haptic, triggerBloom } = useSensoryResonance();
  const { palette, styles } = useCosmicTheme();

  const handleClick = useCallback((e) => {
    if (disabled) return;
    haptic(hapticPattern);
    if (withRadiance) triggerBloom('tap', e.currentTarget);
    onClick?.(e);
  }, [disabled, haptic, hapticPattern, withRadiance, triggerBloom, onClick]);

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 11 },
    md: { padding: '10px 18px', fontSize: 13 },
    lg: { padding: '14px 24px', fontSize: 15 },
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${palette.primary}20, ${palette.secondary}15)`,
      border: `1.5px solid ${palette.primary}40`,
      color: palette.primary,
    },
    secondary: {
      background: 'var(--resonance-surface)',
      border: '1px solid var(--resonance-border)',
      color: 'rgba(248, 250, 252, 0.8)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'rgba(248, 250, 252, 0.6)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1.5px solid rgba(239, 68, 68, 0.4)',
      color: '#EF4444',
    },
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      className={`rounded-lg font-medium transition-all ${className}`}
      style={{
        ...styles.glassSurface,
        ...sizeStyles[size],
        ...variantStyles[variant],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      whileHover={!disabled ? { scale: 1.02, boxShadow: `0 0 20px ${palette.secondary}25` } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
});
ResonanceButton.displayName = 'ResonanceButton';

// ═══ RESONANCE CARD ═══
export const ResonanceCard = forwardRef(({
  children,
  onClick,
  withRadiance = true,
  interactive = true,
  className = '',
  style = {},
  ...props
}, ref) => {
  const { haptic, triggerBloom } = useSensoryResonance();
  const { palette, styles } = useCosmicTheme();

  const handleClick = useCallback((e) => {
    if (!interactive || !onClick) return;
    haptic('buttonTap');
    if (withRadiance) triggerBloom('tap', e.currentTarget);
    onClick?.(e);
  }, [interactive, onClick, haptic, withRadiance, triggerBloom]);

  return (
    <motion.div
      ref={ref}
      onClick={handleClick}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        ...styles.glassSurface,
        cursor: interactive && onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
      whileHover={interactive && onClick ? { 
        scale: 1.01, 
        boxShadow: `0 0 30px ${palette.secondary}20` 
      } : {}}
      whileTap={interactive && onClick ? { scale: 0.99 } : {}}
      {...props}
    >
      {/* Radiance glow layer */}
      {withRadiance && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            ...styles.radiance,
            opacity: 0.5,
            mixBlendMode: 'screen',
          }}
        />
      )}
      {/* Content with z-index above radiance */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});
ResonanceCard.displayName = 'ResonanceCard';

// ═══ RESONANCE ORB ═══
export const ResonanceOrb = forwardRef(({
  size = 60,
  color,
  icon: Icon,
  label,
  onClick,
  extracted = false,
  hapticPattern = 'orbTap',
  className = '',
  style = {},
  ...props
}, ref) => {
  const { orbitalResonance } = useSensoryResonance();
  const { palette } = useCosmicTheme();
  const orbColor = color || palette.primary;

  const handleClick = useCallback((e) => {
    if (extracted) {
      orbitalResonance.navigate(e.currentTarget);
    } else {
      orbitalResonance.tap(e.currentTarget);
    }
    onClick?.(e);
  }, [extracted, orbitalResonance, onClick]);

  return (
    <motion.div
      ref={ref}
      onClick={handleClick}
      className={`rounded-full flex flex-col items-center justify-center cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
        background: extracted 
          ? `${orbColor}1A`
          : 'rgba(10, 10, 18, 0.6)',
        border: `1.5px solid ${extracted ? orbColor + '55' : orbColor + '20'}`,
        boxShadow: extracted
          ? `0 0 ${size * 0.3}px ${orbColor}40, inset 0 0 ${size * 0.15}px ${orbColor}15`
          : `0 0 ${size * 0.1}px ${orbColor}10`,
        backdropFilter: 'none',
        ...style,
      }}
      whileHover={{ 
        scale: 1.08, 
        boxShadow: `0 0 ${size * 0.4}px ${orbColor}50` 
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {Icon && <Icon size={size * 0.35} style={{ color: orbColor }} />}
      {label && (
        <span 
          className="text-center font-medium mt-1"
          style={{ 
            fontSize: Math.max(8, size * 0.12), 
            color: extracted ? orbColor : 'rgba(248,250,252,0.6)',
          }}
        >
          {label}
        </span>
      )}
    </motion.div>
  );
});
ResonanceOrb.displayName = 'ResonanceOrb';

// ═══ RESONANCE SURFACE ═══
export const ResonanceSurface = forwardRef(({
  children,
  as = 'div',
  blur = 12,
  withRadiance = false,
  className = '',
  style = {},
  ...props
}, ref) => {
  const { styles, palette } = useCosmicTheme();
  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      className={`${className}`}
      style={{
        background: 'var(--resonance-surface)',
        backdropFilter: 'none',
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: '1px solid var(--resonance-border)',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {withRadiance && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${palette.secondary}20 0%, transparent 70%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
});
ResonanceSurface.displayName = 'ResonanceSurface';

// ═══ RESONANCE GLOW TEXT ═══
export const ResonanceText = forwardRef(({
  children,
  as = 'span',
  glow = true,
  color,
  className = '',
  style = {},
  ...props
}, ref) => {
  const { palette } = useCosmicTheme();
  const textColor = color || palette.primary;
  const Component = as;

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        color: textColor,
        textShadow: glow ? `0 0 12px ${textColor}60, 0 0 4px ${textColor}30` : 'none',
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
});
ResonanceText.displayName = 'ResonanceText';

// ═══ EXPORTS ═══
export default {
  Button: ResonanceButton,
  Card: ResonanceCard,
  Orb: ResonanceOrb,
  Surface: ResonanceSurface,
  Text: ResonanceText,
};
