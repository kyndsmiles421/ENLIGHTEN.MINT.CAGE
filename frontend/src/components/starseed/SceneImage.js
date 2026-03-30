import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { ATMOSPHERE_THEMES } from './constants';

export function SceneImage({ imageUrl, loading, atmosphere, originColor }) {
  const theme = ATMOSPHERE_THEMES[atmosphere] || ATMOSPHERE_THEMES.mystical;

  return (
    <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-6" data-testid="scene-image"
      style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${originColor}15` }}>
      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(180deg, transparent 30%, ${theme.overlay} 100%)` }} />

      {imageUrl ? (
        <motion.img key={imageUrl} src={imageUrl} alt="Scene" className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}
          style={{ filter: 'brightness(0.8) contrast(1.1)' }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${originColor}15, rgba(0,0,0,0.5))` }}>
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles size={24} style={{ color: originColor }} />
            </motion.div>
          ) : (
            <Star size={28} style={{ color: originColor, opacity: 0.3 }} />
          )}
        </div>
      )}

      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${theme.glow}20, transparent 70%)` }} />
    </div>
  );
}
