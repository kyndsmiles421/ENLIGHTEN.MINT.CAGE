import React, { useMemo } from 'react';
import { useEnlightenmentCafe } from '../context/EnlightenmentCafeContext';

/**
 * VellumOverlay — Subtle grain texture that breaks "digital flatness"
 * 
 * This creates the tactile, physical feel of a vintage notebook or
 * high-end cafe menu. Uses SVG noise at very low opacity (2-3%).
 * 
 * The grain adapts based on the current view tier:
 * - Parchment Light: Warm sepia-tinted grain
 * - Parchment Dark: Cool charcoal grain
 * - Nebula: Cosmic particle noise
 */
export default function VellumOverlay() {
  const { viewTier, colorMode, atmosphere } = useEnlightenmentCafe();

  const grainConfig = useMemo(() => {
    if (colorMode === 'light') {
      return {
        opacity: 0.025,
        blendMode: 'multiply',
        baseFrequency: 0.75,
        color: 'rgba(112, 66, 20, 0.4)', // Sepia tint
      };
    }
    return {
      opacity: 0.018,
      blendMode: 'overlay',
      baseFrequency: 0.65,
      color: 'rgba(245, 242, 237, 0.15)', // Cream tint
    };
  }, [colorMode]);

  // Only show in Parchment mode
  if (viewTier === 'nebula') return null;

  return (
    <>
      {/* Primary Grain Layer */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,  // BACKGROUND layer
          opacity: grainConfig.opacity,
          mixBlendMode: grainConfig.blendMode,
        }}
        data-testid="vellum-grain"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="vellum-noise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={grainConfig.baseFrequency}
                numOctaves="4"
                seed="42"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="saturate"
                values="0"
                in="noise"
                result="mono"
              />
              <feComponentTransfer in="mono" result="final">
                <feFuncR type="linear" slope="1.2" intercept="-0.1" />
                <feFuncG type="linear" slope="1.2" intercept="-0.1" />
                <feFuncB type="linear" slope="1.2" intercept="-0.1" />
                <feFuncA type="linear" slope="1" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            filter="url(#vellum-noise)"
            fill={grainConfig.color}
          />
        </svg>
      </div>

      {/* Vignette Edge (subtle darkening at corners) */}
      {colorMode === 'light' && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 3,  // BACKGROUND layer
            background: `radial-gradient(ellipse at center, transparent 50%, rgba(112, 66, 20, 0.03) 100%)`,
          }}
          data-testid="vellum-vignette"
        />
      )}

      {/* Paper Edge Highlight (top and left light source) */}
      {colorMode === 'light' && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 4,  // BACKGROUND layer
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 30%)`,
          }}
          data-testid="vellum-highlight"
        />
      )}

      {/* Warm Glow Atmosphere (when enabled) */}
      {atmosphere.warmGlow && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 5,  // BACKGROUND layer
            background: colorMode === 'light'
              ? `radial-gradient(ellipse at 50% 0%, rgba(201, 169, 98, 0.04) 0%, transparent 60%)`
              : `radial-gradient(ellipse at 50% 0%, rgba(201, 169, 98, 0.02) 0%, transparent 60%)`,
            mixBlendMode: 'overlay',
          }}
          data-testid="vellum-warmglow"
        />
      )}
    </>
  );
}

/**
 * ParchmentCard — A card component with paper-like styling
 */
export function ParchmentCard({ children, className = '', elevated = false, ...props }) {
  const { viewTier, colorMode } = useEnlightenmentCafe();

  if (viewTier !== 'parchment') {
    return <div className={className} {...props}>{children}</div>;
  }

  const cardStyle = colorMode === 'light'
    ? {
        background: elevated ? '#FFFFFE' : '#FFFFFF',
        border: '1px solid #E8E4DC',
        boxShadow: elevated
          ? '0 4px 12px rgba(42, 42, 42, 0.08), 0 1px 2px rgba(42, 42, 42, 0.04)'
          : '0 1px 3px rgba(42, 42, 42, 0.05)',
      }
    : {
        background: elevated ? '#323236' : '#2A2A2E',
        border: '1px solid #3A3A3E',
        boxShadow: elevated
          ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.2)',
      };

  return (
    <div
      className={`rounded-xl ${className}`}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ParchmentHeading — Typography component for elegant headers
 */
export function ParchmentHeading({ level = 1, children, className = '', serif = true, ...props }) {
  const { viewTier, colorMode } = useEnlightenmentCafe();

  const Tag = `h${level}`;
  const isParchment = viewTier === 'parchment';

  const fontFamily = isParchment && serif
    ? "'Playfair Display', 'Cormorant Garamond', Georgia, serif"
    : "'Manrope', 'Inter', sans-serif";

  const fontSize = {
    1: 'text-3xl sm:text-4xl lg:text-5xl',
    2: 'text-2xl sm:text-3xl',
    3: 'text-xl sm:text-2xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm',
  }[level];

  const fontWeight = serif ? 'font-normal' : 'font-semibold';
  const letterSpacing = serif ? 'tracking-wide' : 'tracking-normal';

  const color = isParchment
    ? colorMode === 'light' ? '#2A2A2A' : '#F5F2ED'
    : '#F8FAFC';

  return (
    <Tag
      className={`${fontSize} ${fontWeight} ${letterSpacing} ${className}`}
      style={{ fontFamily, color }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * ParchmentText — Body text with typewriter feel
 */
export function ParchmentText({ children, mono = false, muted = false, className = '', ...props }) {
  const { viewTier, colorMode } = useEnlightenmentCafe();

  const isParchment = viewTier === 'parchment';

  const fontFamily = mono
    ? "'JetBrains Mono', 'Fira Code', monospace"
    : "'Manrope', 'Inter', sans-serif";

  const color = isParchment
    ? muted
      ? colorMode === 'light' ? '#5A5A5A' : '#C4C0B8'
      : colorMode === 'light' ? '#2A2A2A' : '#F5F2ED'
    : muted ? 'rgba(255,255,255,0.6)' : '#F8FAFC';

  return (
    <span
      className={className}
      style={{ fontFamily, color }}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * GoldAccent — Inline element with aged gold styling
 */
export function GoldAccent({ children, className = '', ...props }) {
  return (
    <span
      className={className}
      style={{ color: '#C9A962', fontWeight: 500 }}
      {...props}
    >
      {children}
    </span>
  );
}
