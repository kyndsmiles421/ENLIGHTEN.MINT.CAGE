import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export function CosmicDust() {
  const p = useRef(Array.from({ length: 35 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5, dur: Math.random() * 20 + 15,
    delay: Math.random() * 8, op: Math.random() * 0.2 + 0.05,
  }))).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {p.map(d => (
        <motion.div key={d.id} className="absolute rounded-full"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, background: `rgba(192,132,252,${d.op})` }}
          animate={{ x: [0, Math.sin(d.id) * 25, 0], y: [0, Math.cos(d.id) * 18, 0], opacity: [d.op, d.op * 2.5, d.op] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
