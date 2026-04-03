import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMixer } from '../context/MixerContext';

/**
 * Persistent Sacred Geometry Frequency Visualizer
 * Renders a glowing waveform bar at the bottom of every page.
 * Uses the global MixerContext analyser node for real-time audio data.
 * Wrapped in React.memo to prevent re-renders from parent tree changes.
 */
export default memo(function PersistentWaveform() {
  const { analyserRef, isPlaying, activeFreqs, muted } = useMixer();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const hueRef = useRef(0);
  const location = useLocation();

  const hideOnHub = location.pathname === '/hub' || location.pathname === '/' || location.pathname === '/auth';

  // Determine dominant color from active frequencies
  const getColor = useCallback(() => {
    if (activeFreqs.size === 0) return { r: 139, g: 92, b: 246 }; // default violet
    const freqColors = {
      174: { r: 120, g: 113, b: 12 }, 285: { r: 146, g: 64, b: 14 },
      396: { r: 239, g: 68, b: 68 }, 417: { r: 251, g: 146, b: 60 },
      432: { r: 16, g: 185, b: 129 }, 528: { r: 34, g: 197, b: 94 },
      639: { r: 59, g: 130, b: 246 }, 741: { r: 139, g: 92, b: 246 },
      852: { r: 192, g: 132, b: 252 }, 963: { r: 232, g: 121, b: 249 },
    };
    const firstHz = Array.from(activeFreqs)[0];
    return freqColors[firstHz] || { r: 139, g: 92, b: 246 };
  }, [activeFreqs]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef?.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const c = getColor();
    hueRef.current = (hueRef.current + 0.3) % 360;

    if (analyser && isPlaying && !muted) {
      // Real audio data
      const bufLen = analyser.frequencyBinCount;
      const data = new Uint8Array(bufLen);
      analyser.getByteTimeDomainData(data);

      // Waveform
      ctx.beginPath();
      const sliceW = w / bufLen;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceW, y);
      }
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glow line
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},0.4)`;
      ctx.beginPath();
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceW, y);
      }
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.3)`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sacred geometry overlay — rotating hexagonal points
      const cx = w / 2;
      const cy = h / 2;
      const t = Date.now() * 0.001;
      ctx.save();
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.2;
        const r = 8 + Math.sin(t + i) * 3;
        const px = cx + Math.cos(angle) * (w * 0.35);
        const py = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Idle state — gentle breathing sine wave
      const t = Date.now() * 0.0008;
      ctx.beginPath();
      for (let i = 0; i < w; i++) {
        const y = h / 2 + Math.sin(i * 0.02 + t) * 2 * Math.sin(t * 0.5);
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i, y);
      }
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.12)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    animRef.current = requestAnimationFrame(draw);
  }, [analyserRef, isPlaying, muted, getColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  if (hideOnHub) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed bottom-0 left-0 w-full pointer-events-none z-[998]"
      style={{ height: '24px', opacity: isPlaying ? 1 : 0.4 }}
      data-testid="persistent-waveform"
    />
  );
});
