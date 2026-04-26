import React, { useRef, useEffect, useState } from 'react';

/* ─── Visual Filter Definitions ─── */
export const VISUAL_FILTERS = [
  {
    id: 'bloom',
    label: 'Bloom',
    color: '#FBBF24',
    css: (i) => `brightness(${1 + i * 0.6}) contrast(${1 + i * 0.2}) saturate(${1 + i * 0.3})`,
  },
  {
    id: 'film-grain',
    label: 'Film Grain',
    color: '#A8A29E',
    css: () => 'none',
    hasCanvas: true,
  },
  {
    id: 'chromatic',
    label: 'Chromatic',
    color: '#F472B6',
    css: () => 'none',
    hasCanvas: true,
  },
  {
    id: 'sepia',
    label: 'Sepia',
    color: '#D97706',
    css: (i) => `sepia(${i * 0.9}) saturate(${0.8 + i * 0.4})`,
  },
  {
    id: 'neon-glow',
    label: 'Neon Glow',
    color: '#34D399',
    css: (i) => `brightness(${1 + i * 0.4}) saturate(${1 + i * 1.5}) contrast(${1 + i * 0.3})`,
  },
  {
    id: 'dream-haze',
    label: 'Dream Haze',
    color: '#C4B5FD',
    css: (i) => `blur(${i * 2}px) brightness(${1 + i * 0.2}) saturate(${1.2 + i * 0.3})`,
  },
  {
    id: 'vhs-retro',
    label: 'VHS Retro',
    color: '#FB923C',
    css: (i) => `saturate(${1.4 + i * 0.8}) contrast(${1.1 + i * 0.3}) hue-rotate(${i * 15}deg)`,
    hasCanvas: true,
  },
  {
    id: 'ethereal',
    label: 'Ethereal',
    color: '#818CF8',
    css: (i) => `brightness(${1.1 + i * 0.3}) blur(${i * 0.8}px) saturate(${0.7 + i * 0.5})`,
  },
  {
    id: 'kaleidoscope',
    label: 'Kaleidoscope',
    color: '#F43F5E',
    css: (i) => `hue-rotate(${i * 180}deg) saturate(${1.5 + i})`,
    hasCanvas: true,
  },
  {
    id: 'infrared',
    label: 'Infrared',
    color: '#EF4444',
    css: (i) => `hue-rotate(${-30 + i * 40}deg) saturate(${2 + i * 2}) contrast(${1.2 + i * 0.3})`,
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    color: '#06B6D4',
    css: (i) => `contrast(${1.3 + i * 0.4}) saturate(${1.5 + i * 1.5}) hue-rotate(${i * -20}deg) brightness(${0.9 + i * 0.2})`,
  },
  {
    id: 'vintage',
    label: 'Vintage',
    color: '#92400E',
    css: (i) => `sepia(${i * 0.5}) saturate(${0.6 + i * 0.3}) brightness(${0.9 + i * 0.1}) contrast(${1.1})`,
  },
];

/* ─── Filter Overlay Component ─── */
export function FilterOverlay({ activeFilters }) {
  // activeFilters: [{id, intensity (0-1)}]
  if (!activeFilters?.length) return null;

  const combinedCSS = activeFilters
    .map(af => {
      const def = VISUAL_FILTERS.find(f => f.id === af.id);
      if (!def) return '';
      return def.css(af.intensity);
    })
    .filter(Boolean)
    .join(' ');

  const hasCanvasFilters = activeFilters.some(af => {
    const def = VISUAL_FILTERS.find(f => f.id === af.id);
    return def?.hasCanvas;
  });

  return (
    <>
      {/* CSS-based filter overlay */}
      {combinedCSS && combinedCSS !== 'none' && (
        <div
          className="fixed inset-0 pointer-events-none z-29"
          style={{ filter: combinedCSS, mixBlendMode: 'overlay' }}
          data-testid="filter-css-overlay"
        />
      )}
      {/* Canvas-based effects */}
      {hasCanvasFilters && activeFilters.map(af => {
        const def = VISUAL_FILTERS.find(f => f.id === af.id);
        if (!def?.hasCanvas) return null;
        if (af.id === 'film-grain') return <FilmGrainCanvas key={af.id} intensity={af.intensity} />;
        if (af.id === 'chromatic') return <ChromaticCanvas key={af.id} intensity={af.intensity} />;
        if (af.id === 'vhs-retro') return <VHSCanvas key={af.id} intensity={af.intensity} />;
        if (af.id === 'kaleidoscope') return <KaleidoscopeCanvas key={af.id} intensity={af.intensity} />;
        return null;
      })}
    </>
  );
}

/* ─── Canvas-based filter effects ─── */

function FilmGrainCanvas({ intensity }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;

    const render = () => {
      const w = canvas.width, h = canvas.height;
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;
      const grainStrength = intensity * 80;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() - 0.5) * grainStrength;
        data[i] = 128 + v;
        data[i + 1] = 128 + v;
        data[i + 2] = 128 + v;
        data[i + 3] = Math.abs(v) * 1.5;
      }
      ctx.putImageData(imgData, 0, 0);
      frameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, [intensity]);

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-31"
      style={{ width: '100%', height: '100%', opacity: intensity * 0.6, mixBlendMode: 'overlay' }}
      data-testid="filter-grain-canvas" />
  );
}

function ChromaticCanvas({ intensity }) {
  const offset = Math.round(intensity * 6);

  return (
    <div className="fixed inset-0 pointer-events-none z-31" data-testid="filter-chromatic">
      <div className="absolute inset-0" style={{
        background: `rgba(255,0,0,${intensity * 0.05})`,
        transform: `translateX(${offset}px)`,
        mixBlendMode: 'screen',
      }} />
      <div className="absolute inset-0" style={{
        background: `rgba(0,0,255,${intensity * 0.05})`,
        transform: `translateX(${-offset}px)`,
        mixBlendMode: 'screen',
      }} />
    </div>
  );
}

function VHSCanvas({ intensity }) {
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setScanLine(Math.random() * 100);
    }, 100);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-31" data-testid="filter-vhs">
      {/* Scanlines */}
      <div className="absolute inset-0" style={{
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${intensity * 0.08}) 2px, rgba(0,0,0,${intensity * 0.08}) 4px)`,
      }} />
      {/* Glitch bar */}
      <div className="absolute left-0 right-0 h-1" style={{
        top: `${scanLine}%`,
        background: `rgba(255,255,255,${intensity * 0.15})`,
        filter: 'blur(1px)',
      }} />
    </div>
  );
}

function KaleidoscopeCanvas({ intensity }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;

    const render = () => {
      tRef.current += 0.02;
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      const segments = 8 + Math.floor(intensity * 8);
      const r = Math.min(w, h) * 0.45;

      for (let s = 0; s < segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        const endX = r * Math.cos(tRef.current + s * 0.5);
        const endY = r * Math.sin(tRef.current * 1.3 + s * 0.3);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `hsla(${s * (360 / segments) + tRef.current * 30}, 80%, 60%, ${0.3 + intensity * 0.3})`;
        ctx.lineWidth = 1 + intensity * 2;
        ctx.stroke();

        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, [intensity]);

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-31 m-auto"
      style={{ width: '100%', height: '100%', opacity: intensity * 0.5, mixBlendMode: 'screen' }}
      data-testid="filter-kaleidoscope-canvas" />
  );
}
