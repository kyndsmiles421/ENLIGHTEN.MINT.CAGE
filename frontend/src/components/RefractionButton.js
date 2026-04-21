import React from 'react';

/**
 * RefractionButton — procedural glass-morphism CTA
 *
 * Maps a Solfeggio frequency to a Hue (red→violet across 396→963 Hz),
 * paints a glass-gradient pill with a matching neon glow. Zero assets,
 * one React component, respects the Obsidian Void palette.
 *
 * @param {number}   frequency   Solfeggio Hz (e.g. 396, 528, 963). Falls back to 440.
 * @param {string}   label       Headline text on the button.
 * @param {string}   [sublabel]  Optional secondary line. If omitted, shows "{freq}Hz".
 * @param {string}   [as]        Element to render: 'button' | 'a'. Defaults to 'button'.
 * @param {string}   [href]      Passed when `as='a'`.
 * @param {function} [onClick]
 * @param {object}   [style]     Extra inline styles merged over defaults.
 * @param {string}   [testId]    data-testid hook.
 */
const RefractionButton = ({
  frequency = 440,
  label,
  sublabel,
  as = 'button',
  href,
  onClick,
  style: extraStyle = {},
  testId,
  children,
}) => {
  // Hue mapping — 396 Hz → 0 (red), 528 Hz → 80 (gold-green), 963 Hz → 280 (violet)
  const calculateHue = (freq) => {
    const minFreq = 396;
    const maxFreq = 963;
    const clamped = Math.max(minFreq, Math.min(maxFreq, freq));
    return ((clamped - minFreq) / (maxFreq - minFreq)) * 280;
  };

  const hue = calculateHue(frequency);
  const ringColor = `hsla(${hue}, 78%, 62%, 0.55)`;
  const glowColor = `hsla(${hue}, 88%, 54%, 0.35)`;
  const textGlow  = `hsla(${hue}, 90%, 80%, 0.9)`;

  const baseStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '14px 26px',
    minHeight: 60,
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.05rem',
    fontWeight: 500,
    color: '#F5F3EC',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
    border: `1px solid ${ringColor}`,
    borderRadius: 14,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: `0 6px 22px -6px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`,
    transition:
      'transform 0.32s cubic-bezier(0.22, 1.618, 0.36, 1), ' +
      'box-shadow .28s ease, background .28s ease',
    letterSpacing: '0.04em',
    ...extraStyle,
  };

  const handleEnter = (e) => {
    e.currentTarget.style.boxShadow = `0 0 32px ${ringColor}, inset 0 1px 0 rgba(255,255,255,0.1)`;
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.background =
      'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))';
  };
  const handleLeave = (e) => {
    e.currentTarget.style.boxShadow = baseStyle.boxShadow;
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.background = baseStyle.background;
  };
  // Damped-compression on press: φ-ratio squeeze → small overshoot → settle.
  const handleDown = (e) => {
    e.currentTarget.style.transition = 'transform .08s ease-out, box-shadow .15s ease';
    e.currentTarget.style.transform = 'translateY(1px) scale(0.985)';
  };
  const handleUp = (e) => {
    e.currentTarget.style.transition = baseStyle.transition;
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const inner = children ?? (
    <>
      <span style={{ textShadow: `0 0 12px ${textGlow}` }}>{label}</span>
      <small style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.62rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        opacity: 0.65,
      }}>
        {sublabel ?? `${frequency} Hz`}
      </small>
    </>
  );

  const commonProps = {
    style: baseStyle,
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    onFocus: handleEnter,
    onBlur: handleLeave,
    onMouseDown: handleDown,
    onMouseUp: handleUp,
    onTouchStart: handleDown,
    onTouchEnd: handleUp,
    'data-testid': testId,
  };

  if (as === 'a') {
    return <a href={href} onClick={onClick} {...commonProps}>{inner}</a>;
  }
  return <button type="button" onClick={onClick} {...commonProps}>{inner}</button>;
};

export default RefractionButton;
