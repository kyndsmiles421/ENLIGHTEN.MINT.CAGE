import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Slider } from '../components/ui/slider';
import { Volume2, VolumeX, Save, Trash2, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SOUNDS = [
  { id: 'rain', name: 'Gentle Rain', desc: 'Soft rainfall on leaves', color: '#3B82F6' },
  { id: 'ocean', name: 'Ocean Waves', desc: 'Rhythmic shoreline waves', color: '#2DD4BF' },
  { id: 'forest', name: 'Forest Ambience', desc: 'Birds and rustling leaves', color: '#22C55E' },
  { id: 'bowls', name: 'Singing Bowls', desc: 'Tibetan resonance tones', color: '#D8B4FE' },
  { id: 'wind', name: 'Mountain Wind', desc: 'High altitude breeze', color: '#94A3B8' },
  { id: 'fire', name: 'Crackling Fire', desc: 'Warm hearth flames', color: '#FB923C' },
  { id: 'thunder', name: 'Distant Thunder', desc: 'Rolling storm sounds', color: '#8B5CF6' },
  { id: 'stream', name: 'Flowing Stream', desc: 'Mountain brook water', color: '#06B6D4' },
  { id: 'night', name: 'Night Crickets', desc: 'Summer evening chorus', color: '#FCD34D' },
];

function createNoiseBuffer(ctx, seconds = 2) {
  const size = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function createSoundNodes(ctx, soundId, masterGain) {
  const nodes = [];
  if (soundId === 'rain') {
    const buf = createNoiseBuffer(ctx, 2);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    src.connect(hp); hp.connect(lp); lp.connect(masterGain);
    src.start(); nodes.push(src);
  } else if (soundId === 'ocean') {
    const buf = createNoiseBuffer(ctx, 4);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lfoG = ctx.createGain(); lfoG.gain.value = 200;
    lfo.connect(lfoG); lfoG.connect(lp.frequency);
    src.connect(lp); lp.connect(masterGain);
    lfo.start(); src.start(); nodes.push(src, lfo);
  } else if (soundId === 'forest') {
    const buf = createNoiseBuffer(ctx, 2);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 1.5;
    src.connect(bp); bp.connect(masterGain);
    src.start(); nodes.push(src);
    const bird = ctx.createOscillator(); bird.type = 'sine'; bird.frequency.value = 2500;
    const bG = ctx.createGain(); bG.gain.value = 0;
    const bLfo = ctx.createOscillator(); bLfo.frequency.value = 4;
    const bLfoG = ctx.createGain(); bLfoG.gain.value = 0.015;
    bLfo.connect(bLfoG); bLfoG.connect(bG.gain);
    bird.connect(bG); bG.connect(masterGain);
    bird.start(); bLfo.start(); nodes.push(bird, bLfo);
  } else if (soundId === 'bowls') {
    [396, 528, 639].forEach((freq, i) => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = 0.3;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15 + i * 0.08;
      const lG = ctx.createGain(); lG.gain.value = 0.15;
      lfo.connect(lG); lG.connect(g.gain);
      osc.connect(g); g.connect(masterGain);
      osc.start(); lfo.start(); nodes.push(osc, lfo);
    });
  } else if (soundId === 'wind') {
    const buf = createNoiseBuffer(ctx, 3);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lG = ctx.createGain(); lG.gain.value = 500;
    lfo.connect(lG); lG.connect(bp.frequency);
    src.connect(bp); bp.connect(masterGain);
    lfo.start(); src.start(); nodes.push(src, lfo);
  } else if (soundId === 'fire') {
    const buf = createNoiseBuffer(ctx, 2);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.8;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 6;
    const lG = ctx.createGain(); lG.gain.value = 300;
    lfo.connect(lG); lG.connect(bp.frequency);
    src.connect(bp); bp.connect(lp); lp.connect(masterGain);
    lfo.start(); src.start(); nodes.push(src, lfo);
  } else if (soundId === 'thunder') {
    const buf = createNoiseBuffer(ctx, 4);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.03;
    const lG = ctx.createGain(); lG.gain.value = 100;
    lfo.connect(lG); lG.connect(lp.frequency);
    src.connect(lp); lp.connect(masterGain);
    lfo.start(); src.start(); nodes.push(src, lfo);
  } else if (soundId === 'stream') {
    const buf = createNoiseBuffer(ctx, 2);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 1;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.5;
    const lG = ctx.createGain(); lG.gain.value = 800;
    lfo.connect(lG); lG.connect(bp.frequency);
    src.connect(bp); bp.connect(masterGain);
    lfo.start(); src.start(); nodes.push(src, lfo);
  } else if (soundId === 'night') {
    [4200, 4800].forEach((freq, i) => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 20 + i * 5;
      const lG = ctx.createGain(); lG.gain.value = 0.06;
      lfo.connect(lG); lG.connect(g.gain);
      const envLfo = ctx.createOscillator(); envLfo.frequency.value = 0.3 + i * 0.15;
      const envG = ctx.createGain(); envG.gain.value = 0.04;
      envLfo.connect(envG); envG.connect(g.gain);
      osc.connect(g); g.connect(masterGain);
      osc.start(); lfo.start(); envLfo.start();
      nodes.push(osc, lfo, envLfo);
    });
  }
  return nodes;
}

export default function Soundscapes() {
  const { user, authHeaders } = useAuth();
  const [volumes, setVolumes] = useState(
    SOUNDS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {})
  );
  const audioCtxRef = useRef(null);
  const channelsRef = useRef({});
  const [savedMixes, setSavedMixes] = useState([]);
  const [mixName, setMixName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);

  const loadSavedMixes = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/soundscapes/my-mixes`, { headers: authHeaders });
      setSavedMixes(res.data);
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { loadSavedMixes(); }, [loadSavedMixes]);

  const getAudioCtx = useCallback(async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const startSound = useCallback(async (soundId) => {
    const ctx = await getAudioCtx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volumes[soundId] / 100 * 0.25, ctx.currentTime);
    gain.connect(ctx.destination);
    const nodes = createSoundNodes(ctx, soundId, gain);
    channelsRef.current[soundId] = { gain, nodes };
  }, [getAudioCtx, volumes]);

  const stopSound = useCallback((soundId) => {
    const ch = channelsRef.current[soundId];
    if (!ch) return;
    ch.nodes.forEach(n => { try { n.stop?.(); } catch {} });
    try { ch.gain.disconnect(); } catch {}
    delete channelsRef.current[soundId];
  }, []);

  useEffect(() => {
    SOUNDS.forEach(s => {
      const vol = volumes[s.id];
      const ch = channelsRef.current[s.id];
      if (vol > 0 && !ch) {
        startSound(s.id);
      } else if (vol === 0 && ch) {
        stopSound(s.id);
      } else if (vol > 0 && ch) {
        ch.gain.gain.setValueAtTime(vol / 100 * 0.25, audioCtxRef.current?.currentTime || 0);
      }
    });
  }, [volumes, startSound, stopSound]);

  useEffect(() => {
    return () => {
      Object.keys(channelsRef.current).forEach(id => stopSound(id));
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
    };
  }, [stopSound]);

  const activeSounds = Object.entries(volumes).filter(([, v]) => v > 0);

  const saveMix = async () => {
    if (!user) { toast.error('Sign in to save mixes'); return; }
    if (activeSounds.length === 0) { toast.error('No sounds active to save'); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/soundscapes/save-mix`, {
        name: mixName || `Mix with ${activeSounds.length} sounds`,
        volumes,
      }, { headers: authHeaders });
      setSavedMixes(prev => [res.data, ...prev]);
      toast.success('Soundscape mix saved!');
      setMixName('');
      setShowSavePanel(false);
    } catch { toast.error('Could not save mix'); }
    setSaving(false);
  };

  const loadMix = (mix) => {
    const newVolumes = SOUNDS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {});
    Object.entries(mix.volumes).forEach(([id, v]) => { newVolumes[id] = v; });
    setVolumes(newVolumes);
    toast.success(`Loaded "${mix.name}"`);
  };

  const deleteMix = async (id) => {
    try {
      await axios.delete(`${API}/soundscapes/mix/${id}`, { headers: authHeaders });
      setSavedMixes(prev => prev.filter(m => m.id !== id));
      toast.success('Deleted');
    } catch {}
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#93C5FD' }}>Soundscapes</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Ambient Worlds
          </h1>
          <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
            Mix your perfect soundscape. Layer sounds to create your unique sanctuary.
          </p>
          <p className="text-xs mb-12 flex items-center gap-2" style={{ color: activeSounds.length > 0 ? '#2DD4BF' : 'var(--text-muted)' }}>
            {activeSounds.length > 0 ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {activeSounds.length > 0
              ? `${activeSounds.length} sound${activeSounds.length > 1 ? 's' : ''} playing`
              : 'Slide to mix and play'}
          </p>
        </motion.div>

        {/* Saved Mixes */}
        {savedMixes.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Your Saved Mixes</p>
            <div className="flex gap-3 flex-wrap">
              {savedMixes.map((mix) => {
                const soundNames = Object.keys(mix.volumes).map(id => SOUNDS.find(s => s.id === id)?.name).filter(Boolean);
                return (
                  <div key={mix.id} className="glass-card p-4 group flex items-center gap-3" data-testid={`saved-mix-${mix.id}`}>
                    <button onClick={() => loadMix(mix)} className="text-left" data-testid={`load-mix-${mix.id}`}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{mix.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{soundNames.join(', ')}</p>
                    </button>
                    <button onClick={() => deleteMix(mix.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      data-testid={`delete-mix-${mix.id}`}>
                      <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                    onValueChange={([v]) => setVolumes(prev => ({ ...prev, [sound.id]: v }))}
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
            <div className="flex items-center justify-between flex-wrap gap-4">
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
              <div className="flex items-center gap-3">
                {user && !showSavePanel && (
                  <button
                    onClick={() => setShowSavePanel(true)}
                    className="btn-glass text-sm flex items-center gap-2"
                    style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#93C5FD' }}
                    data-testid="soundscape-save-mix-btn"
                  >
                    <Save size={14} /> Save This Mix
                  </button>
                )}
                <button
                  onClick={() => setVolumes(SOUNDS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {}))}
                  className="btn-glass text-sm"
                  data-testid="soundscape-reset-btn"
                >
                  Reset All
                </button>
              </div>
            </div>

            {showSavePanel && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <input value={mixName} onChange={e => setMixName(e.target.value)}
                  placeholder="Name your mix..."
                  className="input-glass flex-1 text-sm" data-testid="soundscape-mix-name-input" />
                <button onClick={saveMix} disabled={saving}
                  className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
                  style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)', color: '#93C5FD' }}
                  data-testid="soundscape-save-confirm">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
                <button onClick={() => setShowSavePanel(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Cancel
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
        <FeaturedVideos category="soundscapes" color="#3B82F6" title="Ambient Sound Videos" />
      </div>
    </div>
  );
}
