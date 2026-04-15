/**
 * V43.1 UNIFIED FIELD TRANSITION ENGINE
 * 
 * ∞^(∞^∞) - 1 ± (input · inv) + z
 * 
 * Three systems:
 * 1. Touch Light — Multiply at touch point, inverse shadow everywhere else
 * 2. Z-Depth Transitions — Realm-specific spring physics (zen=ripple, oracle=snap, herb=organic)
 * 3. Sovereign Observer — Center pixel stays sharp during transition (the -1 zero point)
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PHI = 1.618033988749895;

// ═══ REALM TRANSITION PHYSICS ═══
// Each realm has its own spring feel for z-depth arrival
const REALM_PHYSICS = {
  // Zen: slow, watery ripple settling
  '/zen-garden': { exitDuration: 300, enterDuration: 600, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 6 },
  '/soundscapes': { exitDuration: 300, enterDuration: 600, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 6 },
  '/music-lounge': { exitDuration: 300, enterDuration: 600, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 6 },
  '/frequencies': { exitDuration: 300, enterDuration: 500, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 5 },
  // Oracle: sudden crisp snap — camera lens locking focus
  '/oracle': { exitDuration: 150, enterDuration: 250, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 8 },
  '/akashic-records': { exitDuration: 150, enterDuration: 250, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 8 },
  '/star-chart': { exitDuration: 150, enterDuration: 300, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 7 },
  '/numerology': { exitDuration: 150, enterDuration: 280, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 7 },
  '/cardology': { exitDuration: 150, enterDuration: 250, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 8 },
  '/dreams': { exitDuration: 200, enterDuration: 400, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 6 },
  // Herbology/Nature: organic slow-growth expansion
  '/herbology': { exitDuration: 250, enterDuration: 500, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 5 },
  '/aromatherapy': { exitDuration: 250, enterDuration: 500, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 5 },
  '/nourishment': { exitDuration: 250, enterDuration: 450, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 4 },
  '/elixirs': { exitDuration: 250, enterDuration: 500, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 5 },
  '/green-journal': { exitDuration: 250, enterDuration: 450, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 5 },
  // Meditation/Breath: ethereal float
  '/breathing': { exitDuration: 200, enterDuration: 450, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 6 },
  '/meditation': { exitDuration: 250, enterDuration: 500, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 6 },
  '/yoga': { exitDuration: 200, enterDuration: 400, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 5 },
  '/affirmations': { exitDuration: 200, enterDuration: 400, enterEase: 'cubic-bezier(0.22, 1, 0.36, 1)', blur: 5 },
  // Crystals: prismatic refraction
  '/crystals': { exitDuration: 180, enterDuration: 350, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 7 },
  '/crystal-skins': { exitDuration: 180, enterDuration: 350, enterEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)', blur: 7 },
};

const DEFAULT_PHYSICS = { exitDuration: 200, enterDuration: 350, enterEase: 'cubic-bezier(0.16, 1, 0.3, 1)', blur: 4 };

function getPhysics(path) {
  return REALM_PHYSICS[path] || DEFAULT_PHYSICS;
}

// ═══ IMMERSIVE vs TECHNICAL routes ═══
const IMMERSIVE_ROUTES = new Set([
  '/breathing', '/meditation', '/yoga', '/zen-garden', '/soundscapes',
  '/light-therapy', '/frequencies', '/vr', '/oracle', '/star-chart',
  '/crystals', '/dreams', '/affirmations', '/mantras', '/mudras',
  '/daily-ritual', '/music-lounge', '/reiki', '/acupressure',
  '/herbology', '/aromatherapy', '/elixirs', '/sacred-texts',
]);

// ═══ TOUCH LIGHT ENGINE ═══
// Touch = multiply (radial light). Rest = inverse (1/x brightness dip).
// Like holding a candle behind frosted glass.

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
        maxRadius: isImmersive ? 220 : 80,
        duration: isImmersive ? 1400 : 400,
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

      const accent = getComputedStyle(document.documentElement).getPropertyValue('--skin-accent').trim() || '#8B5CF6';

      touchesRef.current = touchesRef.current.filter(t => now - t.birth < t.duration);

      for (const t of touchesRef.current) {
        const age = now - t.birth;
        const progress = age / t.duration;
        const radius = t.maxRadius * Math.pow(progress, 0.5);
        const opacity = (1 - progress) * (isImmersive ? 0.3 : 0.12);

        // MULTIPLY: radial light at touch point
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, radius);
        grad.addColorStop(0, accent + Math.round(opacity * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(0.3, accent + Math.round(opacity * 140).toString(16).padStart(2, '0'));
        grad.addColorStop(0.7, accent + Math.round(opacity * 50).toString(16).padStart(2, '0'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // INVERSE: screen brightness dips by 1/x away from touch
        // Creates the "shadow opposite your finger" — candle behind frosted glass
        if (isImmersive && opacity > 0.04) {
          const invOpacity = opacity * 0.35;
          const invGrad = ctx.createRadialGradient(t.x, t.y, radius * 0.6, t.x, t.y, Math.max(canvas.width, canvas.height) * 0.8);
          invGrad.addColorStop(0, 'rgba(0,0,0,0)');
          invGrad.addColorStop(0.3, `rgba(0,0,0,${invOpacity * 0.3})`);
          invGrad.addColorStop(1, `rgba(0,0,0,${invOpacity})`);
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
      style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}
      data-testid="touch-light-canvas" />
  );
}


// ═══ Z-DEPTH TRANSITION ENGINE ═══
// Realm-specific spring physics.
// The Sovereign Observer: center pixel stays sharp (radial blur mask).
// New realm is visible as a tiny sharp point behind the blurred old realm.

export function ZDepthTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState('idle');
  const [targetPhysics, setTargetPhysics] = useState(DEFAULT_PHYSICS);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPathRef.current) {
      setDisplayChildren(children);
      return;
    }

    const physics = getPhysics(location.pathname);
    setTargetPhysics(physics);
    prevPathRef.current = location.pathname;
    setTransitionState('exiting');

    const exitTimer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionState('entering');

      const enterTimer = setTimeout(() => {
        setTransitionState('idle');
      }, physics.enterDuration);

      return () => clearTimeout(enterTimer);
    }, physics.exitDuration);

    return () => clearTimeout(exitTimer);
  }, [location.pathname, children]);

  const getStyle = () => {
    const p = targetPhysics;
    switch (transitionState) {
      case 'exiting':
        return {
          transform: `scale(${(1 / PHI).toFixed(4)})`,
          opacity: 0,
          filter: `blur(${p.blur}px)`,
          transition: `transform ${p.exitDuration}ms ease-in, opacity ${p.exitDuration}ms ease-in, filter ${p.exitDuration}ms ease-in`,
          // Sovereign Observer: radial mask keeps center sharp
          maskImage: 'radial-gradient(circle at center, black 5%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 5%, transparent 60%)',
        };
      case 'entering':
        return {
          transform: 'scale(1)',
          opacity: 1,
          filter: 'none',
          transition: `transform ${p.enterDuration}ms ${p.enterEase}, opacity ${p.enterDuration * 0.6}ms ease-out, filter ${p.enterDuration * 0.8}ms ease-out`,
          maskImage: 'none',
          WebkitMaskImage: 'none',
        };
      default:
        return {
          transform: 'scale(1)',
          opacity: 1,
          filter: 'none',
          transition: 'none',
          maskImage: 'none',
          WebkitMaskImage: 'none',
        };
    }
  };

  return (
    <div style={{
      ...getStyle(),
      transformOrigin: 'center center',
      width: '100%',
      minHeight: '100%',
      willChange: transitionState !== 'idle' ? 'transform, opacity, filter' : 'auto',
    }} data-testid="z-depth-container">
      {displayChildren}
    </div>
  );
}
