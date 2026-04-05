/**
 * SeedVisualizer.js — L² Fractal Layer Visualization
 * 
 * Renders concentric rings as each fractal layer is computed.
 * Creates a "seed growth" animation during minting.
 * 
 * Usage:
 *   <SeedVisualizer layerCount={currentLayer} active={isMinting} total={54} />
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export const SeedVisualizer = ({ 
  layerCount = 0, 
  active = false, 
  total = 54,
  size = 300,
  onComplete
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Animation loop for pulsing effect
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      setPulsePhase(p => (p + 0.02) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [active]);

  // Draw the visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const maxRadius = (size / 2) - 10;
    const layerSpacing = maxRadius / total;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background glow
    if (active && layerCount > 0) {
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, maxRadius);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.1)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 194, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw concentric rings for each computed layer
    for (let i = 0; i < layerCount; i++) {
      const radius = (i + 1) * layerSpacing;
      const progress = i / total;
      
      // Color gradient from purple to cyan
      const r = Math.floor(168 - progress * 168);
      const g = Math.floor(85 + progress * 170);
      const b = Math.floor(247 - progress * 53);
      
      // Opacity fades for outer rings
      const opacity = 0.8 - (progress * 0.5);
      
      // Pulse effect on the newest ring
      const isPulsing = i === layerCount - 1 && active;
      const pulseScale = isPulsing ? 1 + Math.sin(pulsePhase) * 0.1 : 1;
      const lineWidth = isPulsing ? 2 : 1;

      ctx.beginPath();
      ctx.arc(center, center, radius * pulseScale, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    // Center seed core
    if (layerCount > 0) {
      const coreGlow = ctx.createRadialGradient(center, center, 0, center, center, 20);
      coreGlow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      coreGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
      coreGlow.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(center, center, 15 + Math.sin(pulsePhase * 2) * 3, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();
      
      // Inner core
      ctx.beginPath();
      ctx.arc(center, center, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
    }

    // Completion burst effect
    if (layerCount >= total && active) {
      const burstOpacity = 0.3 + Math.sin(pulsePhase * 3) * 0.2;
      ctx.beginPath();
      ctx.arc(center, center, maxRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 194, ${burstOpacity})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      if (onComplete) onComplete();
    }

  }, [layerCount, active, pulsePhase, size, total, onComplete]);

  const percentage = Math.round((layerCount / total) * 100);

  return (
    <div className="seed-visualizer" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        style={{
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.3)',
          boxShadow: active ? '0 0 40px rgba(168, 85, 247, 0.3)' : 'none',
          transition: 'box-shadow 0.3s'
        }}
      />
      
      {active && (
        <div style={{
          textAlign: 'center',
          color: 'white',
          fontFamily: 'monospace'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '300',
            color: layerCount >= total ? '#00FFC2' : '#A855F7'
          }}>
            {percentage}%
          </div>
          <div style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '4px'
          }}>
            LAYER {layerCount} / {total}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * SeedVisualizerMini — Compact inline version
 */
export const SeedVisualizerMini = ({ layerCount = 0, total = 54, size = 60 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const maxRadius = (size / 2) - 4;

    ctx.clearRect(0, 0, size, size);

    // Progress arc
    const progress = layerCount / total;
    ctx.beginPath();
    ctx.arc(center, center, maxRadius, -Math.PI / 2, -Math.PI / 2 + (progress * Math.PI * 2));
    ctx.strokeStyle = progress >= 1 ? '#00FFC2' : '#A855F7';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Background ring
    ctx.beginPath();
    ctx.arc(center, center, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(center, center, 3, 0, Math.PI * 2);
    ctx.fillStyle = progress >= 1 ? '#FFD700' : '#A855F7';
    ctx.fill();

  }, [layerCount, total, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
};

/**
 * Hook for animated layer counting
 */
export function useAnimatedLayerCount(targetCount, duration = 2000) {
  const [displayCount, setDisplayCount] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startCountRef = useRef(0);

  useEffect(() => {
    if (targetCount === displayCount) return;

    startCountRef.current = displayCount;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startCountRef.current + (targetCount - startCountRef.current) * eased);
      
      setDisplayCount(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [targetCount, duration, displayCount]);

  return displayCount;
}

export default SeedVisualizer;
