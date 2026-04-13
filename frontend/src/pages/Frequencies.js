import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Radio, Play, Pause, Info, Square } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';
import GuidedExperience from '../components/GuidedExperience';
import FeaturedVideos from '../components/FeaturedVideos';
import { useMixer, FREQUENCIES as MIXER_FREQUENCIES } from '../context/MixerContext';
import { initSpectrum } from '../engines/SpectrumVisualizer';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeFreqs, toggleFreq: ctxToggleFreq } = useMixer();

  // Track which backend freq ID maps to which Hz for display
  const [idToHz, setIdToHz] = useState({});

  // Fallback frequencies in case API fails
  const FALLBACK_FREQUENCIES = [
    { id: 'freq-432', frequency: 432, name: 'Universal Harmony', category: 'earth', description: 'The universal harmony frequency.', benefits: ['Universal alignment', 'Heart resonance'], chakra: 'Heart', color: '#22C55E' },
    { id: 'freq-528', frequency: 528, name: 'Miracle Tone', category: 'solfeggio', description: 'The Love Frequency for DNA repair.', benefits: ['DNA repair', 'Transformation'], chakra: 'Solar Plexus', color: '#FCD34D' },
    { id: 'freq-396', frequency: 396, name: 'Liberation from Fear', category: 'solfeggio', description: 'Liberates fear and guilt.', benefits: ['Fear release', 'Goal achievement'], chakra: 'Root', color: '#EF4444' },
    { id: 'freq-741', frequency: 741, name: 'Awakening Intuition', category: 'solfeggio', description: 'Awakens intuition and self-expression.', benefits: ['Intuition awakening', 'Self-expression'], chakra: 'Throat', color: '#3B82F6' },
    { id: 'freq-852', frequency: 852, name: 'Return to Spiritual Order', category: 'solfeggio', description: 'Opens third eye and raises awareness.', benefits: ['Third eye activation', 'Spiritual awareness'], chakra: 'Third Eye', color: '#8B5CF6' },
    { id: 'freq-963', frequency: 963, name: 'Divine Consciousness', category: 'solfeggio', description: 'Crown chakra activation for divine connection.', benefits: ['Crown activation', 'Enlightenment'], chakra: 'Crown', color: '#D8B4FE' },
    { id: 'freq-7_83', frequency: 7.83, name: 'Schumann Resonance', category: 'earth', description: 'Earth\'s fundamental frequency.', benefits: ['Earth grounding', 'Deep meditation'], chakra: 'Root', color: '#854D0E' },
    { id: 'freq-40', frequency: 40, name: 'Gamma Consciousness', category: 'binaural', description: '40Hz gamma waves for peak consciousness.', benefits: ['Peak performance', 'Enhanced cognition'], chakra: 'Crown', color: '#E879F9' },
  ];

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('frequencies', 8); }, []);
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API}/frequencies`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setFrequencies(res.data);
          const map = {};
          res.data.forEach(f => { map[f.id] = f.frequency; });
          setIdToHz(map);
        } else {
          // API returned empty, use fallback
          console.warn('[Frequencies] API returned empty, using fallback');
          setFrequencies(FALLBACK_FREQUENCIES);
          const map = {};
          FALLBACK_FREQUENCIES.forEach(f => { map[f.id] = f.frequency; });
          setIdToHz(map);
        }
      })
      .catch((err) => {
        console.error('[Frequencies] API error:', err);
        setError('Could not load frequencies from server');
        // Use fallback frequencies
        setFrequencies(FALLBACK_FREQUENCIES);
        const map = {};
        FALLBACK_FREQUENCIES.forEach(f => { map[f.id] = f.frequency; });
        setIdToHz(map);
        toast.error('Using offline frequency data');
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for mainframe sync events
  useEffect(() => {
    const handleMainframeSync = (event) => {
      const data = event.detail;
      if (data && data.length > 0) {
        console.log('[Frequencies] Mainframe sync received:', data.length);
        setFrequencies(data);
        const map = {};
        data.forEach(f => { map[f.id] = f.frequency; });
        setIdToHz(map);
        setError(null);
        toast.success('Frequencies synced from mainframe');
      }
    };
    
    window.addEventListener('mainframeSyncComplete', handleMainframeSync);
    return () => window.removeEventListener('mainframeSyncComplete', handleMainframeSync);
  }, []);

  // V-ENGINE: Force spectrum bars visible after data loads
  useEffect(() => {
    if (frequencies.length > 0 && !loading) {
      // Give DOM time to render, then force visibility
      setTimeout(() => initSpectrum(), 300);
    }
  }, [frequencies, loading]);

  const filtered = filter === 'all' ? frequencies : frequencies.filter(f => f.category === filter);

  const togglePlay = useCallback((id) => {
    const freq = frequencies.find(f => f.id === id);
    if (!freq) return;
    // Use global MixerContext — find or create a freq object
    const mixerFreq = MIXER_FREQUENCIES.find(mf => mf.hz === freq.frequency) || { hz: freq.frequency, label: `${freq.frequency} Hz`, desc: freq.name, color: freq.color || '#8B5CF6' };
    ctxToggleFreq(mixerFreq);
  }, [frequencies, ctxToggleFreq]);

  // Check if a backend frequency is currently playing via MixerContext
  const isFreqPlaying = useCallback((id) => {
    const hz = idToHz[id];
    return hz != null && activeFreqs.has(hz);
  }, [activeFreqs, idToHz]);

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
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
          <p className="text-xs mb-12" style={{ color: activeFreqs.size > 0 ? '#2DD4BF' : 'var(--text-muted)' }}>
            {activeFreqs.size > 0 ? `Now playing: ${Array.from(activeFreqs).map(hz => `${hz}Hz`).join(', ')}` : 'Tap play to hear each frequency tone.'}
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading frequencies...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No frequencies found. Try refreshing the page.</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {filtered.map((freq) => {
                const isActive = selected?.id === freq.id || isFreqPlaying(freq.id);
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
          )}
          <div className="border-t border-white/5 mt-8 pt-2">
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Low Frequency</span>
              <span>High Frequency</span>
            </div>
          </div>
        </div>

        {/* Frequency Grid */}
        {loading ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((freq, i) => {
            const chakraColor = CHAKRA_COLORS[freq.chakra] || '#94A3B8';
            const isPlaying = isFreqPlaying(freq.id);
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
        )}

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
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => togglePlay(selected.id)}
                  className="btn-glass px-6 py-3 text-sm flex items-center gap-2"
                  style={{ borderColor: isFreqPlaying(selected.id) ? `${selected.color}40` : 'rgba(255,255,255,0.1)' }}
                  data-testid="freq-detail-play"
                >
                  {isFreqPlaying(selected.id) ? <><Square size={12} fill={selected.color} style={{ color: selected.color }} /> Stop</> : <><Play size={14} /> Listen to {selected.frequency}Hz</>}
                </button>
                <NarrationPlayer
                  text={`${selected.frequency} Hertz. ${selected.name}. This is a ${CATEGORY_LABELS[selected.category]} frequency associated with the ${selected.chakra} chakra. ${selected.description}. Benefits include ${selected.benefits.join(', ')}. Close your eyes and allow this frequency to resonate through your being.`}
                  label="Quick Narration"
                  color={selected.color}
                  context="frequency"
                />
                <GuidedExperience
                  practiceName={`${selected.frequency}Hz ${selected.name}`}
                  description={`${selected.description}. This frequency is associated with the ${selected.chakra} chakra.`}
                  instructions={[
                    `Close your eyes and take three deep breaths to settle.`,
                    `Begin listening to the ${selected.frequency}Hz frequency.`,
                    `Feel the vibration resonating with your ${selected.chakra} chakra.`,
                    ...selected.benefits.map(b => `Allow the frequency to support: ${b}`),
                    `Let the sound wash through you completely, dissolving tension.`,
                  ]}
                  category="frequency"
                  color={selected.color}
                  durationMinutes={8}
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