import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2, Star, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ── Ambient Cosmic Drone Generator (Web Audio API) ── */
export function useCosmicAmbient() {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const gainRef = useRef(null);
  const activeRef = useRef(false);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    
    // Register globally for EmergencyShutOff
    if (!window.__cosmicAudioContexts) window.__cosmicAudioContexts = [];
    window.__cosmicAudioContexts.push(ctx);
    
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);
    master.connect(ctx.destination);
    gainRef.current = master;

    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(65.41, ctx.currentTime);
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.3, ctx.currentTime);
    drone.connect(droneGain).connect(master);
    drone.start();
    nodesRef.current.push(drone);

    const fifth = ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.setValueAtTime(98.0, ctx.currentTime);
    const fifthGain = ctx.createGain();
    fifthGain.gain.setValueAtTime(0.15, ctx.currentTime);
    fifth.connect(fifthGain).connect(master);
    fifth.start();
    nodesRef.current.push(fifth);

    const pad = ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(196.0, ctx.currentTime);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(3, ctx.currentTime);
    lfo.connect(lfoGain).connect(pad.frequency);
    lfo.start();
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.06, ctx.currentTime);
    pad.connect(padGain).connect(master);
    pad.start();
    nodesRef.current.push(pad, lfo);

    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(523.25, ctx.currentTime);
    shimmer.frequency.linearRampToValueAtTime(659.25, ctx.currentTime + 20);
    const shimGain = ctx.createGain();
    shimGain.gain.setValueAtTime(0.03, ctx.currentTime);
    shimmer.connect(shimGain).connect(master);
    shimmer.start();
    nodesRef.current.push(shimmer);
  }, []);

  const stop = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1.5);
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
        nodesRef.current = [];
        try { ctxRef.current.close(); } catch {}
        ctxRef.current = null;
      }, 2000);
    }
  }, []);

  useEffect(() => () => { if (activeRef.current) stop(); }, [stop]);
  return { start, stop };
}

/* ── Constellation Story Narrator ── */
export function CosmicNarrator({ text, constellationName, color, authHeaders, token, ELEMENT_COLORS }) {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [waveData, setWaveData] = useState(new Array(20).fill(0.3));
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const ambient = useCosmicAmbient();

  const fullText = `The story of ${constellationName}. ${text}`;

  const play = async () => {
    if (state === 'paused' && audioRef.current) {
      audioRef.current.play().catch(() => { setState('idle'); ambient.stop(); });
      ambient.start();
      setState('playing');
      return;
    }
    setState('loading');
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: fullText, context: 'constellation' });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;

      const actx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Register globally for EmergencyShutOff
      if (!window.__cosmicAudioContexts) window.__cosmicAudioContexts = [];
      window.__cosmicAudioContexts.push(actx);
      
      const source = actx.createMediaElementSource(audio);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser).connect(actx.destination);
      analyserRef.current = analyser;

      audio.onended = () => { setState('idle'); setProgress(0); ambient.stop(); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.play().catch(() => { setState('idle'); ambient.stop(); });
      ambient.start();
      setState('playing');
      if (token) {
        axios.post(`${API}/star-chart/award-xp`, { action: 'story_listened', constellation_name: constellationName }, { headers: authHeaders }).catch(() => {});
      }

      const updateWave = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = [];
        const step = Math.floor(data.length / 20);
        for (let i = 0; i < 20; i++) bars.push((data[i * step] || 0) / 255);
        setWaveData(bars);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch {
      toast.error('Failed to generate narration');
      setState('idle');
    }
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
    ambient.stop();
    setState('paused');
  };

  const stopNarration = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    ambient.stop();
    setState('idle');
    setProgress(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => () => { stopNarration(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }} data-testid="cosmic-narrator">
      {(state === 'playing' || state === 'paused') && (
        <div className="flex items-end justify-center gap-[2px] h-8 px-3 pt-2">
          {waveData.map((v, i) => (
            <motion.div key={i}
              animate={{ height: state === 'playing' ? `${Math.max(8, v * 100)}%` : '20%' }}
              transition={{ duration: 0.1 }}
              className="w-[3px] rounded-full"
              style={{ background: `${color}${state === 'playing' ? '80' : '30'}`, minHeight: 3 }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'idle' ? (
          <button onClick={play} data-testid="narrator-play-btn"
            className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Volume2 size={10} />
            </div>
            Listen to Story
          </button>
        ) : state === 'loading' ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Loader2 size={12} className="animate-spin" style={{ color }} />
            Channeling the cosmos...
          </div>
        ) : (
          <>
            <button onClick={state === 'playing' ? pause : play}
              data-testid="narrator-pause-btn"
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {state === 'playing' ? <Pause size={10} style={{ color }} /> : <Play size={10} style={{ color }} />}
            </button>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${color}10` }}>
              <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
            <button onClick={stopNarration} className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <VolumeX size={10} />
            </button>
          </>
        )}
      </div>
      {(state === 'playing' || state === 'paused') && (
        <div className="px-3 pb-2 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color }} />
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Cosmic ambient active</span>
        </div>
      )}
    </div>
  );
}
