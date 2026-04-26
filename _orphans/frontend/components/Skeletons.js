import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: 'linear',
  },
};

const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
  backgroundSize: '200% 100%',
};

export function SkeletonCard({ height = 180, className = '' }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ ...shimmerStyle, height, border: '1px solid rgba(255,255,255,0.03)' }}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  );
}

export function SkeletonText({ width = '100%', height = 12, className = '' }) {
  return (
    <motion.div
      className={`rounded-lg ${className}`}
      style={{ ...shimmerStyle, width, height }}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  );
}

export function SkeletonGrid({ count = 6, cardHeight = 200 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonCard height={cardHeight} />
          <SkeletonText width="60%" height={14} />
          <SkeletonText width="40%" height={10} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 px-6 md:px-12 lg:px-24 py-12">
      <div className="flex items-center gap-4">
        <motion.div className="w-16 h-16 rounded-full" style={shimmerStyle} animate={shimmer.animate} transition={shimmer.transition} />
        <div className="space-y-2 flex-1">
          <SkeletonText width="200px" height={18} />
          <SkeletonText width="140px" height={12} />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} height={100} />)}
      </div>
      <SkeletonGrid count={6} cardHeight={120} />
    </div>
  );
}
