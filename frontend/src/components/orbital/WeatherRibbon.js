import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Droplets, Sparkles, Wind, Thermometer, Eye, Volume2 } from 'lucide-react';

const COND_ICON = { clear: Sun, cloudy: Cloud, rain: Droplets, snow: Sparkles, thunderstorm: Sparkles, fog: Cloud, wind: Wind };

export function WeatherRibbon({ weather, ambienceActive }) {
  if (!weather || weather.fallback) return null;
  const Icon = COND_ICON[weather.category] || Cloud;

  return (
    <motion.div
      className="absolute top-4 left-1/2 z-20 flex items-center gap-4 px-5 py-2 rounded-full"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(10,10,18,0.35)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(248,250,252,0.06)',
      }}
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      data-testid="weather-ribbon"
    >
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
        <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.5)' }}>{weather.description}</span>
      </div>
      {weather.temperature_f != null && (
        <div className="flex items-center gap-1">
          <Thermometer size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
          <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.45)' }}>{weather.temperature_f}°F</span>
        </div>
      )}
      {weather.humidity != null && (
        <div className="flex items-center gap-1">
          <Droplets size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
          <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.45)' }}>{weather.humidity}%</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Eye size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
        <span className="text-[8px]" style={{ color: weather.seeing_quality === 'excellent' ? 'rgba(45,212,191,0.6)' : weather.seeing_quality === 'good' ? 'rgba(251,191,36,0.5)' : 'rgba(248,250,252,0.35)' }}>
          {weather.seeing_quality}
        </span>
      </div>
      {ambienceActive && (
        <motion.div className="flex items-center gap-1"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <Volume2 size={8} style={{ color: 'rgba(192,132,252,0.5)' }} />
          <span className="text-[7px] font-mono" style={{ color: 'rgba(192,132,252,0.4)' }}>synced</span>
        </motion.div>
      )}
    </motion.div>
  );
}
