import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '../components/ui/slider';

const SOUNDS = [
  { id: 'rain', name: 'Gentle Rain', desc: 'Soft rainfall on leaves', color: '#3B82F6', icon: 'droplets' },
  { id: 'ocean', name: 'Ocean Waves', desc: 'Rhythmic shoreline waves', color: '#2DD4BF', icon: 'waves' },
  { id: 'forest', name: 'Forest Ambience', desc: 'Birds and rustling leaves', color: '#22C55E', icon: 'trees' },
  { id: 'bowls', name: 'Singing Bowls', desc: 'Tibetan resonance tones', color: '#D8B4FE', icon: 'bell' },
  { id: 'wind', name: 'Mountain Wind', desc: 'High altitude breeze', color: '#94A3B8', icon: 'wind' },
  { id: 'fire', name: 'Crackling Fire', desc: 'Warm hearth flames', color: '#FB923C', icon: 'flame' },
  { id: 'thunder', name: 'Distant Thunder', desc: 'Rolling storm sounds', color: '#8B5CF6', icon: 'cloud' },
  { id: 'stream', name: 'Flowing Stream', desc: 'Mountain brook water', color: '#06B6D4', icon: 'droplet' },
  { id: 'night', name: 'Night Crickets', desc: 'Summer evening chorus', color: '#FCD34D', icon: 'moon' },
];

export default function Soundscapes() {
  const [volumes, setVolumes] = useState(
    SOUNDS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {})
  );

  const activeSounds = Object.entries(volumes).filter(([, v]) => v > 0);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#93C5FD' }}>Soundscapes</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Ambient Worlds
          </h1>
          <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
            Mix your perfect soundscape. Layer sounds to create your unique sanctuary.
          </p>
          <p className="text-xs mb-12" style={{ color: 'var(--text-muted)' }}>
            {activeSounds.length > 0
              ? `${activeSounds.length} sound${activeSounds.length > 1 ? 's' : ''} active — visual mixer mode (audio coming soon)`
              : 'Slide to mix — visual mixer mode'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOUNDS.map((sound, i) => {
            const vol = volumes[sound.id];
            const isActive = vol > 0;
            return (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-6"
                style={{
                  borderColor: isActive ? `${sound.color}30` : 'rgba(255,255,255,0.08)',
                  boxShadow: isActive ? `0 0 40px ${sound.color}10` : 'none',
                  transition: 'border-color 0.5s, box-shadow 0.5s',
                }}
                data-testid={`soundscape-${sound.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium mb-1" style={{ color: isActive ? sound.color : 'var(--text-primary)' }}>
                      {sound.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sound.desc}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: isActive ? `${sound.color}20` : 'rgba(255,255,255,0.04)',
                      transition: 'background 0.3s',
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: sound.color,
                        opacity: isActive ? 0.8 : 0.2,
                        transition: 'opacity 0.3s',
                        boxShadow: isActive ? `0 0 12px ${sound.color}60` : 'none',
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Slider
                    defaultValue={[0]}
                    value={[vol]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => setVolumes({ ...volumes, [sound.id]: v })}
                    className="w-full"
                    data-testid={`slider-${sound.id}`}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>0%</span>
                    <span className="text-xs" style={{ color: isActive ? sound.color : 'var(--text-muted)' }}>{vol}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {activeSounds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Your Mix</p>
                <div className="flex flex-wrap gap-2">
                  {activeSounds.map(([id, v]) => {
                    const s = SOUNDS.find(s => s.id === id);
                    return (
                      <span key={id} className="text-xs px-3 py-1 rounded-full" style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                        {s.name}: {v}%
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setVolumes(SOUNDS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {}))}
                className="btn-glass text-sm"
                data-testid="soundscape-reset-btn"
              >
                Reset All
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
