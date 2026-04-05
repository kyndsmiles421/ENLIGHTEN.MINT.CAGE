import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward, Shuffle, Volume2, VolumeX, Music, Heart, Repeat, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Music Track Definitions ─── */
const CATEGORIES = [
  { id: 'all', label: 'All', color: '#C084FC' },
  { id: 'ambient', label: 'Ambient', color: '#2DD4BF' },
  { id: 'piano', label: 'Piano', color: '#3B82F6' },
  { id: 'nature', label: 'Nature Blends', color: '#22C55E' },
  { id: 'cosmic', label: 'Cosmic', color: '#8B5CF6' },
  { id: 'uplifting', label: 'Uplifting', color: '#FCD34D' },
];

const TRACKS = [
  { id: 'gentle-dawn', name: 'Gentle Dawn', artist: 'ENLIGHTEN.MINT.CAFE', category: 'ambient', color: '#2DD4BF', duration: '∞', mood: 'Calm & Grounding',
    synth: (ctx, g) => {
      const nodes = [];
      [220, 277.18, 329.63].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = 0.08;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + i * 0.02;
        const lg = ctx.createGain(); lg.gain.value = 0.03;
        lfo.connect(lg); lg.connect(og.gain);
        o.connect(og); og.connect(g);
        o.start(); lfo.start(); nodes.push(o, lfo);
      });
      return nodes;
    }},
  { id: 'moonlit-keys', name: 'Moonlit Keys', artist: 'ENLIGHTEN.MINT.CAFE', category: 'piano', color: '#3B82F6', duration: '∞', mood: 'Reflective',
    synth: (ctx, g) => {
      const nodes = [];
      const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
      let idx = 0;
      const play = () => {
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = notes[idx % notes.length];
        const eg = ctx.createGain(); eg.gain.setValueAtTime(0.12, ctx.currentTime);
        eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
        o.connect(eg); eg.connect(g); o.start(); o.stop(ctx.currentTime + 3);
        idx++;
      };
      play();
      const iv = setInterval(play, 2800);
      nodes._interval = iv;
      return nodes;
    }},
  { id: 'forest-rain', name: 'Forest After Rain', artist: 'ENLIGHTEN.MINT.CAFE', category: 'nature', color: '#22C55E', duration: '∞', mood: 'Refreshing',
    synth: (ctx, g) => {
      const nodes = [];
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000;
      const rg = ctx.createGain(); rg.gain.value = 0.06;
      src.connect(hp); hp.connect(lp); lp.connect(rg); rg.connect(g);
      src.start(); nodes.push(src);
      // birds
      const b = ctx.createOscillator(); b.type = 'sine'; b.frequency.value = 3200;
      const bg = ctx.createGain(); bg.gain.value = 0;
      const blfo = ctx.createOscillator(); blfo.frequency.value = 5;
      const blg = ctx.createGain(); blg.gain.value = 0.008;
      blfo.connect(blg); blg.connect(bg.gain);
      b.connect(bg); bg.connect(g); b.start(); blfo.start(); nodes.push(b, blfo);
      return nodes;
    }},
  { id: 'stellar-drift', name: 'Stellar Drift', artist: 'ENLIGHTEN.MINT.CAFE', category: 'cosmic', color: '#8B5CF6', duration: '∞', mood: 'Expansive',
    synth: (ctx, g) => {
      const nodes = [];
      [136.1, 172.06, 204.26].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = 0.07;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.02 + i * 0.01;
        const lg = ctx.createGain(); lg.gain.value = 0.04;
        lfo.connect(lg); lg.connect(og.gain);
        const flfo = ctx.createOscillator(); flfo.frequency.value = 0.008;
        const flg = ctx.createGain(); flg.gain.value = f * 0.01;
        flfo.connect(flg); flg.connect(o.frequency);
        o.connect(og); og.connect(g);
        o.start(); lfo.start(); flfo.start(); nodes.push(o, lfo, flfo);
      });
      return nodes;
    }},
  { id: 'sunrise-hope', name: 'Sunrise Hope', artist: 'ENLIGHTEN.MINT.CAFE', category: 'uplifting', color: '#FCD34D', duration: '∞', mood: 'Joyful',
    synth: (ctx, g) => {
      const nodes = [];
      [392, 493.88, 587.33, 659.25].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = 0.06;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08 + i * 0.03;
        const lg = ctx.createGain(); lg.gain.value = 0.025;
        lfo.connect(lg); lg.connect(og.gain);
        o.connect(og); og.connect(g);
        o.start(); lfo.start(); nodes.push(o, lfo);
      });
      return nodes;
    }},
  { id: 'deep-ocean', name: 'Deep Ocean Floor', artist: 'ENLIGHTEN.MINT.CAFE', category: 'ambient', color: '#06B6D4', duration: '∞', mood: 'Immersive',
    synth: (ctx, g) => {
      const nodes = [];
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 250;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
      const lg = ctx.createGain(); lg.gain.value = 120;
      lfo.connect(lg); lg.connect(lp.frequency);
      const og = ctx.createGain(); og.gain.value = 0.1;
      src.connect(lp); lp.connect(og); og.connect(g);
      lfo.start(); src.start(); nodes.push(src, lfo);
      // deep hum
      const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 55;
      const hg = ctx.createGain(); hg.gain.value = 0.05;
      hum.connect(hg); hg.connect(g); hum.start(); nodes.push(hum);
      return nodes;
    }},
  { id: 'crystal-bells', name: 'Crystal Bells', artist: 'ENLIGHTEN.MINT.CAFE', category: 'piano', color: '#E879F9', duration: '∞', mood: 'Ethereal',
    synth: (ctx, g) => {
      const nodes = [];
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 392];
      let idx = 0;
      const play = () => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = notes[idx % notes.length];
        const eg = ctx.createGain(); eg.gain.setValueAtTime(0.08, ctx.currentTime);
        eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
        o.connect(eg); eg.connect(g); o.start(); o.stop(ctx.currentTime + 4);
        idx++;
      };
      play();
      const iv = setInterval(play, 3500);
      nodes._interval = iv;
      return nodes;
    }},
  { id: 'earth-pulse', name: 'Earth Pulse', artist: 'ENLIGHTEN.MINT.CAFE', category: 'nature', color: '#78716C', duration: '∞', mood: 'Grounding',
    synth: (ctx, g) => {
      const nodes = [];
      // Binaural Schumann resonance: 200 Hz left, 207.83 Hz right
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = 200;
      const gL = ctx.createGain(); gL.gain.value = 0.08;
      oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = 207.83;
      const gR = ctx.createGain(); gR.gain.value = 0.08;
      oscR.connect(gR); gR.connect(merger, 0, 1);
      const binG = ctx.createGain(); binG.gain.value = 0.8;
      merger.connect(binG); binG.connect(g);
      oscL.start(); oscR.start(); nodes.push(oscL, oscR);
      // OM carrier tone
      const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.value = 136.1; // OM
      const cg = ctx.createGain(); cg.gain.value = 0.1;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1;
      const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(cg.gain);
      carrier.connect(cg); cg.connect(g);
      carrier.start(); lfo.start(); nodes.push(carrier, lfo);
      // rumble
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 80;
      const rg = ctx.createGain(); rg.gain.value = 0.04;
      src.connect(lp2); lp2.connect(rg); rg.connect(g);
      src.start(); nodes.push(src);
      return nodes;
    }},
  { id: 'nebula-waltz', name: 'Nebula Waltz', artist: 'ENLIGHTEN.MINT.CAFE', category: 'cosmic', color: '#C084FC', duration: '∞', mood: 'Dreamy',
    synth: (ctx, g) => {
      const nodes = [];
      [174.61, 220, 261.63, 349.23].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = i % 2 === 0 ? 'sine' : 'triangle'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = 0.05;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.04 + i * 0.015;
        const lg = ctx.createGain(); lg.gain.value = 0.03;
        lfo.connect(lg); lg.connect(og.gain);
        o.connect(og); og.connect(g);
        o.start(); lfo.start(); nodes.push(o, lfo);
      });
      return nodes;
    }},
  { id: 'golden-hour', name: 'Golden Hour', artist: 'ENLIGHTEN.MINT.CAFE', category: 'uplifting', color: '#FB923C', duration: '∞', mood: 'Warm',
    synth: (ctx, g) => {
      const nodes = [];
      [329.63, 415.3, 493.88, 622.25].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = 0.055;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06 + i * 0.02;
        const lg = ctx.createGain(); lg.gain.value = 0.028;
        lfo.connect(lg); lg.connect(og.gain);
        o.connect(og); og.connect(g);
        o.start(); lfo.start(); nodes.push(o, lfo);
      });
      return nodes;
    }},
];

export default function MusicLounge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState('all');
  const [playing, setPlaying] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(60);
  const [muted, setMuted] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const gainRef = useRef(null);

  const filtered = category === 'all' ? TRACKS : TRACKS.filter(t => t.category === category);

  const getCtx = useCallback(async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const stopCurrent = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    if (nodesRef.current._interval) clearInterval(nodesRef.current._interval);
    nodesRef.current = [];
  }, []);

  const playTrack = useCallback(async (track) => {
    stopCurrent();
    const ctx = await getCtx();
    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.connect(ctx.destination);
    }
    gainRef.current.gain.value = muted ? 0 : volume / 100;
    const nodes = track.synth(ctx, gainRef.current);
    nodesRef.current = nodes;
    setPlaying(track.id);
  }, [getCtx, stopCurrent, volume, muted]);

  const skipNext = useCallback(() => {
    const list = filtered.length > 0 ? filtered : TRACKS;
    if (shuffle) {
      const rand = list[Math.floor(Math.random() * list.length)];
      playTrack(rand);
    } else {
      const idx = list.findIndex(t => t.id === playing);
      const next = list[(idx + 1) % list.length];
      playTrack(next);
    }
  }, [filtered, playing, shuffle, playTrack]);

  const togglePause = useCallback(async () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'running') {
      await audioCtxRef.current.suspend();
    } else {
      await audioCtxRef.current.resume();
    }
    // Force re-render
    setPlaying(p => p);
  }, []);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  useEffect(() => {
    return () => { stopCurrent(); if (audioCtxRef.current) audioCtxRef.current.close(); };
  }, [stopCurrent]);

  const toggleFav = (id) => {
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const currentTrack = TRACKS.find(t => t.id === playing);
  const isPaused = audioCtxRef.current?.state === 'suspended' && playing;

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 max-w-5xl mx-auto immersive-page" data-testid="music-lounge-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid="music-back-btn">
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Music Lounge
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Decompress with ambient, piano, and cosmic soundscapes
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin" data-testid="music-categories">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: category === c.id ? `${c.color}18` : 'transparent',
              color: category === c.id ? c.color : 'var(--text-muted)',
              border: `1px solid ${category === c.id ? `${c.color}30` : 'var(--text-muted)22'}`,
            }}
            data-testid={`music-cat-${c.id}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="space-y-2 mb-6" data-testid="music-track-list">
        {filtered.map((track, i) => {
          const isPlaying = playing === track.id;
          return (
            <motion.div key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => isPlaying ? togglePause() : playTrack(track)}
              className="glass-card glass-card-hover flex items-center gap-4 p-4 cursor-pointer group"
              style={{ borderColor: isPlaying ? `${track.color}30` : undefined }}
              data-testid={`track-${track.id}`}>
              {/* Play indicator */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: isPlaying ? `${track.color}20` : 'var(--text-muted)08' }}>
                {isPlaying && !isPaused ? (
                  <Pause size={16} style={{ color: track.color }} />
                ) : (
                  <Play size={16} style={{ color: isPlaying ? track.color : 'var(--text-muted)' }} className="ml-0.5" />
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: isPlaying ? track.color : 'var(--text-primary)' }}>
                  {track.name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {track.mood} &middot; {track.artist}
                </p>
              </div>

              {/* Category badge */}
              <span className="hidden sm:block text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${track.color}10`, color: track.color }}>
                {CATEGORIES.find(c => c.id === track.category)?.label}
              </span>

              {/* Favorite */}
              <button onClick={(e) => { e.stopPropagation(); toggleFav(track.id); }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                data-testid={`fav-${track.id}`}>
                <Heart size={14} fill={favorites.includes(track.id) ? '#FDA4AF' : 'none'} style={{ color: favorites.includes(track.id) ? '#FDA4AF' : 'var(--text-muted)' }} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Now Playing Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto glass-card p-4 flex items-center gap-4"
            style={{ borderColor: `${currentTrack.color}20`, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${currentTrack.color}08` }}
            data-testid="now-playing-bar">
            {/* Album art placeholder */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${currentTrack.color}15` }}>
              <Headphones size={20} style={{ color: currentTrack.color }} />
            </div>

            {/* Track name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{currentTrack.name}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{currentTrack.mood}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button onClick={() => setShuffle(s => !s)} className="p-2 rounded-lg transition-all"
                style={{ color: shuffle ? '#C084FC' : 'var(--text-muted)' }}
                data-testid="shuffle-btn">
                <Shuffle size={14} />
              </button>
              <button onClick={togglePause} className="p-2.5 rounded-xl transition-all"
                style={{ background: `${currentTrack.color}15` }}
                data-testid="play-pause-btn">
                {isPaused ? <Play size={16} style={{ color: currentTrack.color }} className="ml-0.5" /> : <Pause size={16} style={{ color: currentTrack.color }} />}
              </button>
              <button onClick={skipNext} className="p-2 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }}
                data-testid="skip-btn">
                <SkipForward size={14} />
              </button>
              <button onClick={() => setMuted(m => !m)} className="p-2 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }}
                data-testid="mute-btn">
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input type="range" min={0} max={100} value={muted ? 0 : volume}
                onChange={e => { setVolume(parseInt(e.target.value)); setMuted(false); }}
                className="w-16 h-1 rounded-full appearance-none cursor-pointer hidden sm:block"
                style={{ background: `linear-gradient(to right, ${currentTrack.color} ${volume}%, var(--text-muted)22 ${volume}%)` }}
                data-testid="volume-slider" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
