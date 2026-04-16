import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

export function StrokeTracer({ character, strokes, size = 280, onComplete, color = '#A78BFA' }) {
  const canvasRef = useRef(null);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPath, setUserPath] = useState([]);
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  const drawReference = useCallback((ctx) => {
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(248,250,252,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i / 4) * size, 0);
      ctx.lineTo((i / 4) * size, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (i / 4) * size);
      ctx.lineTo(size, (i / 4) * size);
      ctx.stroke();
    }

    ctx.font = `${size * 0.55}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(248,250,252,0.06)';
    ctx.fillText(character, size / 2, size / 2);

    completedStrokes.forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = `${color}60`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      stroke.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x * size, p.y * size);
        else ctx.lineTo(p.x * size, p.y * size);
      });
      ctx.stroke();
    });

    if (currentStroke < strokes.length) {
      const target = strokes[currentStroke];
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(248,250,252,0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.lineCap = 'round';
      target.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x * size, p.y * size);
        else ctx.lineTo(p.x * size, p.y * size);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      const start = target[0];
      ctx.beginPath();
      ctx.arc(start.x * size, start.y * size, 4, 0, Math.PI * 2);
      ctx.fillStyle = `${color}80`;
      ctx.fill();

      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillText(`${currentStroke + 1}/${strokes.length}`, start.x * size + 10, start.y * size - 8);
    }

    if (userPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      userPath.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }, [character, strokes, size, currentStroke, completedStrokes, userPath, color]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawReference(ctx);
  }, [drawReference]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (currentStroke >= strokes.length) return;
    setIsDrawing(true);
    setUserPath([getPos(e)]);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    setUserPath(prev => [...prev, getPos(e)]);
  };

  const handleEnd = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);

    const target = strokes[currentStroke];
    const score = calculateAccuracy(userPath, target, size);

    if (score >= 50) {
      const newCompleted = [...completedStrokes, target];
      setCompletedStrokes(newCompleted);

      if (currentStroke + 1 >= strokes.length) {
        const totalAcc = Math.round(score);
        setAccuracy(totalAcc);
        if (totalAcc >= 70) setUnlocked(true);
        if (onComplete) onComplete(totalAcc);
      } else {
        setCurrentStroke(currentStroke + 1);
      }
    }
    setUserPath([]);
  };

  const reset = () => {
    setCurrentStroke(0);
    setCompletedStrokes([]);
    setUserPath([]);
    setAccuracy(null);
    setUnlocked(false);
  };

  return (
    <div className="flex flex-col items-center gap-3" data-testid="stroke-tracer">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-lg cursor-crosshair"
          style={{ border: `1px solid ${color}15`, touchAction: 'none' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          data-testid="stroke-canvas"
        />

        {accuracy !== null && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-lg"
            style={{ background: 'rgba(0,0,0,0)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: unlocked ? '#2DD4BF' : '#F59E0B', fontFamily: 'Cormorant Garamond, serif' }}>
                {accuracy}%
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {unlocked ? 'Character Mastered' : 'Keep Practicing'}
              </p>
              <button
                className="mt-3 px-4 py-1.5 rounded-full text-[10px] font-medium tracking-wider uppercase"
                style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                onClick={reset}
                data-testid="stroke-retry-btn"
              >
                Trace Again
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {strokes.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i < completedStrokes.length ? color : i === currentStroke ? `${color}60` : 'rgba(248,250,252,0.1)',
              boxShadow: i === currentStroke ? `0 0 8px ${color}40` : 'none',
            }} />
        ))}
      </div>
    </div>
  );
}

function calculateAccuracy(userPath, targetStroke, canvasSize) {
  if (userPath.length < 3 || targetStroke.length < 2) return 0;

  const normalized = userPath.map(p => ({ x: p.x / canvasSize, y: p.y / canvasSize }));
  let totalDist = 0;
  const samples = Math.min(normalized.length, 20);

  for (let i = 0; i < samples; i++) {
    const idx = Math.floor((i / samples) * normalized.length);
    const up = normalized[idx];
    let minDist = Infinity;

    for (let j = 0; j < targetStroke.length - 1; j++) {
      const a = targetStroke[j];
      const b = targetStroke[j + 1];
      const dist = pointToSegmentDist(up, a, b);
      if (dist < minDist) minDist = dist;
    }
    totalDist += minDist;
  }

  const avgDist = totalDist / samples;
  const score = Math.max(0, Math.min(100, (1 - avgDist * 5) * 100));
  return Math.round(score);
}

function pointToSegmentDist(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
}
