import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLE_COUNT = 40;
const COLORS = ['#D8B4FE', '#2DD4BF', '#FCD34D', '#FDA4AF', '#86EFAC', '#C084FC', '#38BDF8'];

function Particle({ index, total }) {
  const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
  const distance = 80 + Math.random() * 120;
  const size = 2 + Math.random() * 4;
  const color = COLORS[index % COLORS.length];
  const duration = 0.8 + Math.random() * 0.6;

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0.2,
      }}
      transition={{ duration, ease: 'easeOut' }}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    />
  );
}

function RingWave({ delay }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      className="absolute rounded-full"
      style={{
        width: 60,
        height: 60,
        border: '2px solid rgba(192, 132, 252, 0.4)',
        left: '50%',
        top: '50%',
        marginLeft: -30,
        marginTop: -30,
      }}
    />
  );
}

export default function CelebrationBurst({ active, onComplete }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(() => {
        onComplete?.();
      }, 1800);
    }
    return () => clearTimeout(timerRef.current);
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          data-testid="celebration-burst"
        >
          {/* Dim overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'transparent' }}
          />

          {/* Center glow */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0.8] }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(252,211,77,0.5) 0%, rgba(192,132,252,0.3) 40%, transparent 70%)',
              boxShadow: '0 0 80px rgba(192,132,252,0.4), 0 0 160px rgba(252,211,77,0.2)',
            }}
          />

          {/* Ring waves */}
          <RingWave delay={0} />
          <RingWave delay={0.15} />
          <RingWave delay={0.3} />

          {/* Particles */}
          <div className="relative">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
              <Particle key={i} index={i} total={PARTICLE_COUNT} />
            ))}
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.9], y: [20, 0, 0, -20] }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }}
            className="absolute text-center"
          >
            <p className="text-2xl font-light tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D', textShadow: '0 0 30px rgba(252,211,77,0.5)' }}>
              Namaste
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
