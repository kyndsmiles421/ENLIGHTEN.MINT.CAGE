import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Radio, Play, Pause, Info, Square } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_LABELS = {
  solfeggio: 'Solfeggio',
  earth: 'Earth Tones',
  binaural: 'Binaural Beats',
};

const CHAKRA_COLORS = {
  Root: '#EF4444',
  Sacral: '#F97316',
  'Solar Plexus': '#FCD34D',
  Heart: '#22C55E',
  Throat: '#3B82F6',
  'Third Eye': '#8B5CF6',
  Crown: '#D8B4FE',
};

export default function Frequencies() {
  const [frequencies, setFrequencies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [playing, setPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/frequencies`)
      .then(res => setFrequencies(res.data))
      .catch(() => toast.error('Could not load frequencies'));
  }, []);

  const filtered = filter === 'all' ? frequencies : frequencies.filter(f => f.category === filter);

  const stopAudio = useCallback(() => {
    if (oscRef.current) { try { oscRef.current.stop(); } catch {} oscRef.current = null; }
    if (gainRef.current) { try { gainRef.current.disconnect(); } catch {} gainRef.current = null; }
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
  }, []);

  const startAudio = useCallback((freq) => {
    stopAudio();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Gentle envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);

    // Subtle tremolo for richness
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    lfo.start();
    oscRef.current = osc;
    gainRef.current = gain;
  }, [stopAudio]);

  const togglePlay = useCallback((id) => {
    if (playing === id) {
      stopAudio();
      setPlaying(null);
    } else {
      const freq = frequencies.find(f => f.id === id);
      if (freq) {
        startAudio(freq.frequency);
        setPlaying(id);
      }
    }
  }, [playing, frequencies, startAudio, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#8B5CF6' }}>
            <Radio size={14} className="inline mr-2" />
            Biometric Frequencies
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Sacred Frequencies
          </h1>
          <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
            Solfeggio tones, Earth resonances, and binaural beats that harmonize your biofield and expand consciousness.
          </p>
          <p className="text-xs mb-12" style={{ color: playing ? '#2DD4BF' : 'var(--text-muted)' }}>
            {playing ? `Now playing: ${frequencies.find(f => f.id === playing)?.name || ''} (${frequencies.find(f => f.id === playing)?.frequency}Hz)` : 'Tap play to hear each frequency tone.'}
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {[{ k: 'all', l: 'All Frequencies' }, { k: 'solfeggio', l: 'Solfeggio' }, { k: 'earth', l: 'Earth Tones' }, { k: 'binaural', l: 'Binaural' }].map(f => (
            <button
              key={f.k}
              onClick={() => { setFilter(f.k); setSelected(null); }}
              className="px-5 py-2 rounded-full text-sm"
              style={{
                background: filter === f.k ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${filter === f.k ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === f.k ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
              }}
              data-testid={`freq-filter-${f.k}`}
            >
              {f.l}
            </button>
          ))}
        </div>

        {/* Frequency Visualization */}
        <div className="glass-card p-8 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Frequency Spectrum</p>
          <div className="flex items-end gap-1 h-32">
            {filtered.map((freq) => {
              const isActive = selected?.id === freq.id || playing === freq.id;
              const height = Math.min(100, Math.max(15, (freq.frequency / 10)));
              return (
                <button
                  key={freq.id}
                  onClick={() => setSelected(freq)}
                  className="flex-1 rounded-t-lg relative group"
                  style={{
                    height: `${height}%`,
                    minHeight: '20px',
                    background: isActive
                      ? `linear-gradient(to top, ${freq.color}60, ${freq.color}20)`
                      : `linear-gradient(to top, ${freq.color}25, ${freq.color}08)`,
                    border: `1px solid ${isActive ? freq.color + '50' : freq.color + '15'}`,
                    borderBottom: 'none',
                    transition: 'background 0.3s, border-color 0.3s',
                    boxShadow: isActive ? `0 -10px 30px ${freq.color}15` : 'none',
                  }}
                  data-testid={`freq-bar-${freq.id}`}
                >
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100"
                    style={{ color: freq.color, transition: 'opacity 0.2s' }}
                  >
                    {freq.frequency}Hz
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-white/5 mt-8 pt-2">
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Low Frequency</span>
              <span>High Frequency</span>
            </div>
          </div>
        </div>

        {/* Frequency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((freq, i) => {
            const chakraColor = CHAKRA_COLORS[freq.chakra] || '#94A3B8';
            const isPlaying = playing === freq.id;
            return (
              <motion.div
                key={freq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-6"
                style={{
                  borderColor: isPlaying ? `${freq.color}40` : selected?.id === freq.id ? `${freq.color}25` : 'rgba(255,255,255,0.08)',
                  transition: 'border-color 0.3s',
                }}
                data-testid={`freq-card-${freq.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: freq.color }}>
                      {freq.frequency}<span className="text-sm ml-1">Hz</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {CATEGORY_LABELS[freq.category]}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePlay(freq.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: isPlaying ? `${freq.color}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isPlaying ? freq.color + '40' : 'rgba(255,255,255,0.1)'}`,
                      transition: 'background 0.3s, border-color 0.3s',
                    }}
                    data-testid={`freq-play-${freq.id}`}
                  >
                    {isPlaying ? <Square size={12} style={{ color: freq.color }} fill={freq.color} /> : <Play size={14} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {freq.name}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: chakraColor }} />
                  <span className="text-xs" style={{ color: chakraColor }}>
                    {freq.chakra} Chakra
                  </span>
                </div>

                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {freq.description.substring(0, 150)}...
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {freq.benefits.slice(0, 3).map(b => (
                    <span key={b} className="text-xs px-2 py-1 rounded-full" style={{ background: `${freq.color}10`, color: freq.color }}>
                      {b}
                    </span>
                  ))}
                </div>

                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2"
                  >
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ height: [4, 16, 4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.15 }}
                          className="w-1 rounded-full"
                          style={{ background: freq.color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs ml-2" style={{ color: freq.color }}>Playing {freq.frequency}Hz</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 md:p-10"
            >
              <div className="flex items-start gap-3 mb-6">
                <Info size={18} style={{ color: selected.color, marginTop: '2px' }} />
                <div>
                  <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {selected.frequency}Hz — {selected.name}
                  </h2>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{CATEGORY_LABELS[selected.category]}</span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: CHAKRA_COLORS[selected.chakra] }} />
                      {selected.chakra} Chakra
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {selected.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {selected.benefits.map(b => (
                  <span key={b} className="text-xs px-3 py-1.5 rounded-full" style={{ background: `${selected.color}12`, color: selected.color, border: `1px solid ${selected.color}20` }}>
                    {b}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlay(selected.id)}
                  className="btn-glass px-6 py-3 text-sm flex items-center gap-2"
                  style={{ borderColor: playing === selected.id ? `${selected.color}40` : 'rgba(255,255,255,0.1)' }}
                  data-testid="freq-detail-play"
                >
                  {playing === selected.id ? <><Square size={12} fill={selected.color} style={{ color: selected.color }} /> Stop</> : <><Play size={14} /> Listen to {selected.frequency}Hz</>}
                </button>
                <NarrationPlayer
                  text={`${selected.frequency} Hertz. ${selected.name}. This is a ${CATEGORY_LABELS[selected.category]} frequency associated with the ${selected.chakra} chakra. ${selected.description}. Benefits include ${selected.benefits.join(', ')}. Close your eyes and allow this frequency to resonate through your being.`}
                  label="About this Frequency"
                  color={selected.color}
                />
                <DeepDive topic={`${selected.frequency}Hz ${selected.name}`} category="frequency" color={selected.color} label="AI Deep Dive" />
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs underline"
                  style={{ color: 'var(--text-muted)' }}
                  data-testid="freq-close-detail"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <FeaturedVideos category="frequencies" color="#8B5CF6" title="Frequency & Sound Healing Videos" />
      </div>
    </div>
  );
}