import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory } from '../context/SensoryContext';

/**
 * ResonancePulse — Rhythmic glow ring on audio-producing nodes.
 * Opacity/scale mapped to audio amplitude. Mounts near any component
 * whose audioSourceId matches a registered audio source.
 */
export function ResonancePulse({ sourceId, color = '#A78BFA', size = 48, className = '' }) {
  const { audioSources, isMuted } = useSensory();
  const [amplitude, setAmplitude] = useState(0);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const source = audioSources.find(s => s.id === sourceId);
  const isActive = !!source && !isMuted;

  // Connect to audio analyser if available
  useEffect(() => {
    if (!isActive || !source?.analyser) return;
    analyserRef.current = source.analyser;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAmplitude(Math.min(1, rms * 4));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isActive, source]);

  // Fallback: CSS-driven pulse when no analyser is available
  const hasAnalyser = isActive && source?.analyser;

  if (!isActive) return null;

  const pulseScale = hasAnalyser ? 1 + amplitude * 0.4 : 1;
  const pulseOpacity = hasAnalyser ? 0.2 + amplitude * 0.5 : undefined;

  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${className}`}>
      {/* Outer rhythmic ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 ${8 + amplitude * 12}px ${color}30, inset 0 0 ${4 + amplitude * 8}px ${color}15`,
        }}
        animate={hasAnalyser ? {
          scale: pulseScale,
          opacity: pulseOpacity,
        } : {
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={hasAnalyser ? {
          duration: 0.05,
        } : {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Inner glow core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        }}
        animate={hasAnalyser ? {
          scale: 1 + amplitude * 0.3,
          opacity: 0.3 + amplitude * 0.4,
        } : {
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={hasAnalyser ? {
          duration: 0.05,
        } : {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
    </div>
  );
}

/**
 * HexagramGlitch — CSS glitch/flicker effect for I Ching state transitions.
 * Shows when the hexagram has "changing lines" (conditions about to flip).
 */
export function HexagramGlitch({ active, children, intensity = 'medium' }) {
  if (!active) return <>{children}</>;

  const flickerDuration = intensity === 'high' ? '0.08s' : intensity === 'medium' ? '0.15s' : '0.25s';

  return (
    <div className="relative">
      <div
        style={{
          animation: `hexGlitch ${flickerDuration} infinite steps(2)`,
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes hexGlitch {
          0%, 100% {
            opacity: 1;
            transform: translate(0, 0);
            filter: none;
          }
          25% {
            opacity: 0.85;
            transform: translate(-1px, 0.5px);
            filter: hue-rotate(15deg) saturate(1.4);
          }
          50% {
            opacity: 0.92;
            transform: translate(0.5px, -0.5px);
            filter: brightness(1.3) contrast(1.1);
          }
          75% {
            opacity: 0.88;
            transform: translate(-0.5px, -1px);
            filter: hue-rotate(-10deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * HexagramBadge — Compact display of current I Ching hexagram state.
 */
export function HexagramBadge({ hexagram, compact = false }) {
  if (!hexagram) return null;

  const lineChars = hexagram.bits?.map(b => b ? '━' : '╍') || [];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" data-testid="hexagram-badge-compact">
        <span className="text-[10px] font-mono" style={{ color: 'rgba(248,250,252,0.3)' }}>
          {hexagram.chinese}
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.15)' }}>
          #{hexagram.number}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg"
      style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
      data-testid="hexagram-badge">
      {/* Hexagram lines */}
      <div className="flex flex-col gap-[1px] items-center" style={{ width: 20 }}>
        {lineChars.slice().reverse().map((ch, i) => (
          <div key={i} className="text-[8px] font-mono leading-none"
            style={{ color: hexagram.is_transitioning ? '#FBBF24' : 'rgba(248,250,252,0.3)' }}>
            {ch}
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>
          {hexagram.chinese} {hexagram.pinyin}
        </p>
        <p className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
          {hexagram.name} &middot; #{hexagram.number}
        </p>
        {hexagram.is_transitioning && (
          <p className="text-[7px] mt-0.5" style={{ color: '#FBBF24' }}>
            {hexagram.changing_lines_count} changing line{hexagram.changing_lines_count > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
