import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useSensory } from '../context/SensoryContext';

/* ─── Fractal Types ─── */
const FRACTAL_TYPES = [
  { id: 'mandelbrot', label: 'Mandelbrot', color: '#8B5CF6' },
  { id: 'julia', label: 'Julia Set', color: '#3B82F6' },
  { id: 'sacred-geo', label: 'Sacred Geometry', color: '#22C55E' },
  { id: 'fibonacci', label: 'Fibonacci Spiral', color: '#FCD34D' },
  { id: 'flower-of-life', label: 'Flower of Life', color: '#EC4899' },
  { id: 'sri-yantra', label: 'Sri Yantra', color: '#F59E0B' },
];

export { FRACTAL_TYPES };

export default function FractalVisualizer({ type = 'mandelbrot', audioData, opacity = 0.5, colorShift = 0 }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const timeRef = useRef(0);
  const sensory = useSensory();
  const showFractals = sensory?.showFractals ?? true;

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);

    // Audio reactivity — average amplitude drives scale/intensity
    let amp = 0;
    if (audioData?.length) {
      const sum = audioData.reduce((a, v) => a + v, 0);
      amp = sum / audioData.length / 255;
    }
    const pulse = 1 + amp * 0.4;

    switch (type) {
      case 'mandelbrot':
        drawMandelbrot(ctx, w, h, t, pulse, colorShift);
        break;
      case 'julia':
        drawJulia(ctx, w, h, t, pulse, colorShift);
        break;
      case 'sacred-geo':
        drawSacredGeometry(ctx, w, h, t, pulse, colorShift);
        break;
      case 'fibonacci':
        drawFibonacciSpiral(ctx, w, h, t, pulse, colorShift);
        break;
      case 'flower-of-life':
        drawFlowerOfLife(ctx, w, h, t, pulse, colorShift);
        break;
      case 'sri-yantra':
        drawSriYantra(ctx, w, h, t, pulse, colorShift);
        break;
      default:
        drawMandelbrot(ctx, w, h, t, pulse, colorShift);
    }
  }, [type, audioData, colorShift]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showFractals) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      timeRef.current += 0.008;
      draw(ctx, canvas.width, canvas.height, timeRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw, showFractals]);

  if (!showFractals) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ opacity, mixBlendMode: 'screen' }}
      data-testid="fractal-canvas"
    />
  );
}

/* ─── Fractal Renderers ─── */

function hslColor(h, s, l, a) {
  return `hsla(${h % 360}, ${s}%, ${l}%, ${a})`;
}

function drawMandelbrot(ctx, w, h, t, pulse, cs) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const zoom = 2.5 + Math.sin(t * 0.3) * 0.5 * pulse;
  const cx = -0.5 + Math.sin(t * 0.15) * 0.3;
  const cy = Math.cos(t * 0.12) * 0.3;
  const maxIter = 40;
  const step = 4; // skip pixels for performance

  for (let px = 0; px < w; px += step) {
    for (let py = 0; py < h; py += step) {
      const x0 = (px - w / 2) / (w / zoom) + cx;
      const y0 = (py - h / 2) / (h / zoom) + cy;
      let x = 0, y = 0, iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xt = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xt;
        iter++;
      }
      if (iter < maxIter) {
        const hue = (iter / maxIter * 360 + cs * 60 + t * 20) % 360;
        const brightness = iter / maxIter;
        const r = Math.sin(hue * 0.017) * 128 + 127;
        const g = Math.sin((hue + 120) * 0.017) * 128 + 127;
        const b = Math.sin((hue + 240) * 0.017) * 128 + 127;
        for (let dx = 0; dx < step; dx++) {
          for (let dy = 0; dy < step; dy++) {
            const idx = ((py + dy) * w + (px + dx)) * 4;
            if (idx < data.length - 3) {
              data[idx] = r * brightness;
              data[idx + 1] = g * brightness;
              data[idx + 2] = b * brightness;
              data[idx + 3] = brightness * 180;
            }
          }
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawJulia(ctx, w, h, t, pulse, cs) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const cr = -0.7 + Math.sin(t * 0.2) * 0.15 * pulse;
  const ci = 0.27015 + Math.cos(t * 0.15) * 0.1;
  const zoom = 2.8;
  const maxIter = 35;
  const step = 4;

  for (let px = 0; px < w; px += step) {
    for (let py = 0; py < h; py += step) {
      let x = (px - w / 2) / (w / zoom);
      let y = (py - h / 2) / (h / zoom);
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xt = x * x - y * y + cr;
        y = 2 * x * y + ci;
        x = xt;
        iter++;
      }
      if (iter < maxIter) {
        const hue = (iter / maxIter * 300 + cs * 60 + t * 30) % 360;
        const brightness = iter / maxIter;
        const r = Math.sin(hue * 0.017) * 128 + 127;
        const g = Math.sin((hue + 120) * 0.017) * 128 + 127;
        const b = Math.sin((hue + 240) * 0.017) * 128 + 127;
        for (let dx = 0; dx < step; dx++) {
          for (let dy = 0; dy < step; dy++) {
            const idx = ((py + dy) * w + (px + dx)) * 4;
            if (idx < data.length - 3) {
              data[idx] = r * brightness;
              data[idx + 1] = g * brightness;
              data[idx + 2] = b * brightness;
              data[idx + 3] = brightness * 160;
            }
          }
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawSacredGeometry(ctx, w, h, t, pulse, cs) {
  const cx = w / 2, cy = h / 2;
  const baseR = Math.min(w, h) * 0.3 * pulse;

  // Metatron's Cube
  const layers = 6;
  for (let layer = 0; layer < layers; layer++) {
    const r = baseR * (0.3 + layer * 0.14);
    const n = 6 + layer * 2;
    const rot = t * (0.3 + layer * 0.08) + layer * 0.5;
    const hue = (layer * 50 + cs * 60 + t * 15) % 360;

    ctx.beginPath();
    ctx.strokeStyle = hslColor(hue, 80, 60, 0.4 - layer * 0.04);
    ctx.lineWidth = 1.5;

    const points = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rot;
      points.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }

    // Draw polygon
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();

    // Connect all vertices
    ctx.beginPath();
    ctx.strokeStyle = hslColor(hue + 30, 70, 50, 0.15);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 2; j < points.length; j++) {
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
      }
    }
    ctx.stroke();

    // Vertices
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = hslColor(hue, 90, 70, 0.5);
      ctx.fill();
    });
  }
}

function drawFibonacciSpiral(ctx, w, h, t, pulse, cs) {
  const cx = w / 2, cy = h / 2;
  const maxAngle = 12 * Math.PI;
  const growth = 0.12 * pulse;

  // Golden spiral
  ctx.beginPath();
  for (let a = 0; a < maxAngle; a += 0.02) {
    const r = Math.pow(Math.E, growth * a) * 2;
    const angle = a + t * 0.3;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  const hue1 = (cs * 60 + t * 20) % 360;
  ctx.strokeStyle = hslColor(hue1, 80, 60, 0.5);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Second spiral (mirrored)
  ctx.beginPath();
  for (let a = 0; a < maxAngle; a += 0.02) {
    const r = Math.pow(Math.E, growth * a) * 2;
    const angle = -a - t * 0.3 + Math.PI;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = hslColor(hue1 + 120, 70, 55, 0.35);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Golden ratio dots
  const phi = 1.618033988749;
  for (let i = 0; i < 60; i++) {
    const angle = i * phi * Math.PI * 2 + t * 0.2;
    const r = Math.sqrt(i) * 18 * pulse;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const size = 1.5 + Math.sin(t * 2 + i * 0.3) * 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = hslColor((i * 6 + cs * 60 + t * 10) % 360, 80, 65, 0.6);
    ctx.fill();
  }
}

function drawFlowerOfLife(ctx, w, h, t, pulse, cs) {
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.08 * pulse;
  const rings = 3;
  const hueBase = (cs * 60 + t * 15) % 360;

  const drawCircle = (x, y, radius, hue, alpha) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = hslColor(hue, 75, 60, alpha);
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Center
  drawCircle(cx, cy, r, hueBase, 0.5);

  // Expanding rings
  const drawn = new Set();
  const queue = [{ x: cx, y: cy }];
  drawn.add(`${cx},${cy}`);

  for (let ring = 0; ring < rings; ring++) {
    const nextQueue = [];
    for (const center of queue) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t * 0.15 + ring * 0.1;
        const nx = center.x + Math.cos(a) * r;
        const ny = center.y + Math.sin(a) * r;
        const key = `${Math.round(nx)},${Math.round(ny)}`;
        if (!drawn.has(key)) {
          drawn.add(key);
          drawCircle(nx, ny, r, hueBase + ring * 40 + i * 15, 0.35 - ring * 0.06);
          nextQueue.push({ x: nx, y: ny });
        }
      }
    }
    queue.push(...nextQueue);
  }

  // Rotating outer ring
  const outerR = r * (rings + 1.5);
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = hslColor(hueBase + 180, 60, 55, 0.2);
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawSriYantra(ctx, w, h, t, pulse, cs) {
  const cx = w / 2, cy = h / 2;
  const size = Math.min(w, h) * 0.35 * pulse;
  const hueBase = (cs * 60 + t * 12) % 360;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, size, 0, Math.PI * 2);
  ctx.strokeStyle = hslColor(hueBase, 70, 55, 0.3);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Interlocking triangles (9 main triangles)
  const triangles = [
    { r: 0.95, rot: 0, up: true },
    { r: 0.85, rot: 0, up: false },
    { r: 0.75, rot: 0.05, up: true },
    { r: 0.65, rot: 0.03, up: false },
    { r: 0.55, rot: 0.08, up: true },
    { r: 0.45, rot: 0.06, up: false },
    { r: 0.35, rot: 0.1, up: true },
    { r: 0.25, rot: 0.08, up: false },
    { r: 0.15, rot: 0.12, up: true },
  ];

  triangles.forEach((tri, i) => {
    const r = size * tri.r;
    const rot = tri.rot + t * 0.1;
    const dir = tri.up ? -1 : 1;

    ctx.beginPath();
    for (let j = 0; j < 3; j++) {
      const a = (j / 3) * Math.PI * 2 + rot + (tri.up ? -Math.PI / 2 : Math.PI / 2);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * dir * 0.6;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = hslColor(hueBase + i * 35, 75, 60, 0.35 - i * 0.02);
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Central bindu (dot)
  const binduPulse = 3 + Math.sin(t * 2) * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, binduPulse, 0, Math.PI * 2);
  ctx.fillStyle = hslColor(hueBase + 60, 90, 70, 0.8);
  ctx.fill();

  // Lotus petals (outer ring)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + t * 0.08;
    const pr = size * 1.05;
    const px = cx + Math.cos(a) * pr;
    const py = cy + Math.sin(a) * pr;

    ctx.beginPath();
    ctx.ellipse(px, py, 12 * pulse, 5, a, 0, Math.PI * 2);
    ctx.strokeStyle = hslColor(hueBase + i * 22, 65, 60, 0.25);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}
