/**
 * V43.0 UNIFIED FIELD TRANSITION ENGINE
 * 
 * ∞^(∞^∞) - 1 ± (input · inv) + z
 * 
 * No slide left/right. Modules exist on different z-depths.
 * Navigate = refocus the lens. Current realm recedes (inverse fade),
 * new realm arrives from z-infinity (phi-scaled zoom).
 * 
 * Touch = multiply (light surge at point), rest = inverse (shadow).
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PHI = 1.618033988749895;

// ═══ TOUCH LIGHT ENGINE ═══
// Touch point = multiply (light), rest of screen = inverse (shadow)
// Immersive modules get fluid trails, technical modules get haptic glow

const IMMERSIVE_ROUTES = new Set([
  '/breathing', '/meditation', '/yoga', '/zen-garden', '/soundscapes',
  '/light-therapy', '/frequencies', '/vr', '/oracle', '/star-chart',
  '/crystals', '/dreams', '/affirmations', '/mantras', '/mudras',
  '/daily-ritual', '/music-lounge', '/reiki', '/acupressure',
]);

export function TouchLightEngine() {
  const canvasRef = useRef(null);
  const touchesRef = useRef([]);
  const frameRef = useRef(null);
  const location = useLocation();
  const isImmersive = IMMERSIVE_ROUTES.has(location.pathname);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const addTouch = (x, y) => {
      touchesRef.current.push({
        x, y,
        birth: Date.now(),
        maxRadius: isImmersive ? 200 : 80,
        duration: isImmersive ? 1200 : 400,
      });
    };

    const onPointer = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      addTouch(x, y);
    };

    window.addEventListener('touchstart', onPointer, { passive: true });
    window.addEventListener('mousedown', onPointer, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      // Get skin accent from CSS variable
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--skin-accent').trim() || '#8B5CF6';

      // Filter alive touches
      touchesRef.current = touchesRef.current.filter(t => now - t.birth < t.duration);

      for (const t of touchesRef.current) {
        const age = now - t.birth;
        const progress = age / t.duration;
        const radius = t.maxRadius * Math.pow(progress, 0.5); // sqrt expansion
        const opacity = (1 - progress) * (isImmersive ? 0.25 : 0.12);

        // Multiply: radial light at touch point
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, radius);
        grad.addColorStop(0, accent + Math.round(opacity * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(0.4, accent + Math.round(opacity * 128).toString(16).padStart(2, '0'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inverse: subtle vignette darkening away from touch (immersive only)
        if (isImmersive && opacity > 0.05) {
          const invGrad = ctx.createRadialGradient(t.x, t.y, radius * 0.8, t.x, t.y, Math.max(canvas.width, canvas.height));
          invGrad.addColorStop(0, 'rgba(0,0,0,0)');
          invGrad.addColorStop(1, `rgba(0,0,0,${opacity * 0.3})`);
          ctx.fillStyle = invGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('touchstart', onPointer);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [isImmersive, location.pathname]);

  return (
    <canvas ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 2, // Above scene (0), below content (relative z:1 but stacking context)
        pointerEvents: 'none',
        opacity: 1,
      }}
      data-testid="touch-light-canvas" />
  );
}


// ═══ Z-DEPTH TRANSITION ENGINE ═══
// Replaces flat page swaps with z-axis zoom transitions.
// Current content recedes (scale down + fade), new content arrives (scale up from distance).
// Phi ratio governs the scale.

export function ZDepthTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'exiting' | 'entering'
  const prevPathRef = useRef(location.pathname);
  const containerRef = useRef(null);

  useEffect(() => {
    if (location.pathname === prevPathRef.current) {
      setDisplayChildren(children);
      return;
    }

    // Route changed — start z-depth transition
    prevPathRef.current = location.pathname;
    setTransitionState('exiting');

    // Phase 1: Current content recedes (inverse)
    const exitTimer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionState('entering');

      // Phase 2: New content arrives from z-depth
      const enterTimer = setTimeout(() => {
        setTransitionState('idle');
      }, 350);

      return () => clearTimeout(enterTimer);
    }, 200);

    return () => clearTimeout(exitTimer);
  }, [location.pathname, children]);

  const getStyle = () => {
    switch (transitionState) {
      case 'exiting':
        return {
          transform: `scale(${1 / PHI}) translateZ(-100px)`,
          opacity: 0,
          filter: 'blur(4px)',
          transition: 'transform 0.2s ease-in, opacity 0.2s ease-in, filter 0.2s ease-in',
        };
      case 'entering':
        return {
          transform: 'scale(1) translateZ(0)',
          opacity: 1,
          filter: 'none',
          transition: `transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease-out, filter 0.35s ease-out`,
        };
      default:
        return {
          transform: 'scale(1) translateZ(0)',
          opacity: 1,
          filter: 'none',
          transition: 'none',
        };
    }
  };

  return (
    <div ref={containerRef} style={{
      ...getStyle(),
      transformOrigin: 'center center',
      perspective: '1000px',
      width: '100%',
      minHeight: '100%',
    }} data-testid="z-depth-container">
      {displayChildren}
    </div>
  );
}
