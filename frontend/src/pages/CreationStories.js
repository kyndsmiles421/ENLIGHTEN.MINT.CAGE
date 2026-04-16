import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Globe, BookOpen, Volume2, VolumeX, Loader2, Pause, Play,
  Sparkles, Star, MapPin, Clock, ChevronRight, Search, X, Film,
  SkipForward, SkipBack, Video, ScrollText, Swords, Heart, Flame,
  Users, Compass, Zap, Eye, Crown, Feather, Shield, Moon, Sun,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const REGION_ICONS = {
  'Africa': '🌍', 'Americas': '🌎', 'Asia': '🌏', 'Europe': '🏰',
  'Oceania': '🌊', 'Arctic & Middle East': '❄️'
};

const MYTH_TYPE_ICONS = {
  creation: Sun, hero_journey: Compass, love: Heart, trickster: Sparkles,
  underworld: Moon, divine_conflict: Swords, origin: Globe,
  prophecy: Eye, transformation: RefreshCw, myth: ScrollText,
};

/* ══════════════════════════════════════════════
   CINEMATIC STORY MODE
   ══════════════════════════════════════════════ */
function CinematicStoryMode({ story, fullStory, authHeaders, onClose }) {
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState('');
  const [narrating, setNarrating] = useState(false);
  const [paused, setPaused] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const paragraphs = fullStory?.story?.split('\n\n') || [];
  const [videoMode, setVideoMode] = useState(false);
  const [videoStatus, setVideoStatus] = useState('idle');
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('creation_stories', 8); }, []);
  useEffect(() => {
    if (!story?.id) return;
    loadScenes();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [story?.id]);

  const loadScenes = async () => {
    setGenerating(true);
    try {
      const r = await axios.post(`${API}/ai-visuals/story-scenes/${story.id}`, {}, { headers: authHeaders });
      const existing = r.data.scenes || [];
      setScenes(existing);
      for (let i = 0; i < existing.length; i++) {
        if (!existing[i].image_b64) {
          setGenProgress(`Painting scene ${i + 1} of ${existing.length}...`);
          try {
            const gen = await axios.post(`${API}/ai-visuals/generate-scene`, { story_id: story.id, scene_index: i }, { headers: authHeaders, timeout: 120000 });
            setScenes(prev => { const u = [...prev]; u[i] = { ...u[i], image_b64: gen.data.image_b64 }; return u; });
          } catch {}
        }
      }
    } catch { toast.error('Failed to prepare cinematic scenes'); }
    setGenerating(false);
    setGenProgress('');
  };

  const startNarration = async () => {
    setNarrating(true);
    setCurrentScene(0);
    try {
      const r = await axios.post(`${API}/creation-stories/${story.id}/narrate`, {}, { headers: authHeaders, timeout: 90000 });
      const audio = new Audio(`data:audio/mp3;base64,${r.data.audio}`);
      audioRef.current = audio;
      audio.play();
      const totalScenes = scenes.length;
      audio.onplay = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          if (audio.duration && audio.currentTime) {
            const pct = audio.currentTime / audio.duration;
            setCurrentScene(Math.min(Math.floor(pct * totalScenes), totalScenes - 1));
          }
        }, 500);
      };
      audio.onended = () => { clearInterval(timerRef.current); setNarrating(false); };
    } catch { toast.error('Failed to start narration'); setNarrating(false); }
  };

  const togglePause = () => {
    if (!audioRef.current) return;
    if (paused) { audioRef.current.play(); setPaused(false); }
    else { audioRef.current.pause(); setPaused(true); }
  };

  const startVideoGeneration = async () => {
    setVideoStatus('generating');
    try {
      const res = await axios.post(`${API}/ai-visuals/generate-video`, { story_id: story.id }, { headers: authHeaders });
      if (res.data.status === 'complete' && res.data.video_url) { setVideoUrl(res.data.video_url); setVideoStatus('complete'); return; }
      if (res.data.job_id) {
        pollRef.current = setInterval(async () => {
          try {
            const poll = await axios.get(`${API}/ai-visuals/video-status/${res.data.job_id}`, { headers: authHeaders });
            if (poll.data.status === 'complete' && poll.data.video_url) { clearInterval(pollRef.current); setVideoUrl(poll.data.video_url); setVideoStatus('complete'); }
            else if (poll.data.status === 'failed') { clearInterval(pollRef.current); setVideoStatus('failed'); toast.error('Video generation failed'); }
          } catch {}
        }, 5000);
      }
    } catch { setVideoStatus('failed'); toast.error('Could not start video generation'); }
  };

  const toggleVideoMode = () => {
    if (!videoMode) { setVideoMode(true); if (!videoUrl && videoStatus === 'idle') startVideoGeneration(); }
    else { setVideoMode(false); if (videoRef.current) videoRef.current.pause(); }
  };

  const currentImg = scenes[currentScene]?.image_b64;
  const currentParagraph = paragraphs[currentScene] || paragraphs[paragraphs.length - 1] || '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col" data-testid="cinematic-mode" style={{ background: '#000' }}>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button onClick={toggleVideoMode} data-testid="toggle-video-mode"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
          style={{ background: videoMode ? `${story.color}20` : 'rgba(255,255,255,0.06)', border: `1px solid ${videoMode ? story.color + '40' : 'rgba(255,255,255,0.1)'}`, color: videoMode ? story.color : 'rgba(255,255,255,0.5)' }}>
          <Video size={12} /> {videoMode ? 'Video On' : 'Video'}
        </button>
        <button onClick={onClose} data-testid="close-cinema"
          className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {videoMode && videoStatus === 'complete' && videoUrl ? (
            <motion.div key="video-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0">
              <video ref={videoRef} src={`${process.env.REACT_APP_BACKEND_URL}${videoUrl}`} className="w-full h-full object-cover" style={{ filter: 'brightness(0.7) saturate(1.2)' }} autoPlay loop muted playsInline data-testid="cinema-video-player" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.8) 100%)' }} />
            </motion.div>
          ) : videoMode && videoStatus === 'generating' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, #000 70%)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}><Video size={32} style={{ color: story.color }} /></motion.div>
              <p className="text-sm mt-4" style={{ color: 'rgba(248,250,252,0.5)' }}>Generating cinematic video with Sora 2...</p>
            </div>
          ) : currentImg ? (
            <motion.div key={`scene-${currentScene}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 1.5 }} className="absolute inset-0">
              <img src={`data:image/png;base64,${currentImg}`} alt={`Scene ${currentScene + 1}`} className="w-full h-full object-cover" style={{ filter: 'brightness(0.7) saturate(1.2)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.8) 100%)' }} />
            </motion.div>
          ) : generating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, #000 70%)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}><Sparkles size={32} style={{ color: story.color }} /></motion.div>
              <p className="text-sm mt-4" style={{ color: 'rgba(248,250,252,0.5)' }}>{genProgress || 'Preparing the cosmic canvas...'}</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, #000 70%)' }}>
              <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No scene generated yet</p>
            </div>
          )}
        </AnimatePresence>
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: story.color, boxShadow: `0 0 8px ${story.color}80` }} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: story.color }}>{story.culture}</span>
          </div>
          <p className="text-lg font-semibold" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{story.title}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-24">
          <AnimatePresence mode="wait">
            <motion.p key={currentScene} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8 }}
              className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto text-center"
              style={{ color: 'rgba(248,250,252,0.85)', fontFamily: 'Cormorant Garamond, serif', textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
              {currentParagraph}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          {scenes.map((_, i) => (
            <button key={i} onClick={() => setCurrentScene(i)} className="transition-all"
              style={{ width: i === currentScene ? 20 : 6, height: 6, borderRadius: 3, background: i === currentScene ? story.color : i < currentScene ? `${story.color}60` : 'rgba(255,255,255,0.15)', boxShadow: i === currentScene ? `0 0 8px ${story.color}60` : 'none' }} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCurrentScene(p => Math.max(0, p - 1))} className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} data-testid="cinema-prev">
            <SkipBack size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
          {narrating ? (
            <button onClick={togglePause} className="p-3 rounded-full" data-testid="cinema-pause"
              style={{ background: `${story.color}20`, border: `1px solid ${story.color}40` }}>
              {paused ? <Play size={18} style={{ color: story.color }} /> : <Pause size={18} style={{ color: story.color }} />}
            </button>
          ) : (
            <button onClick={startNarration} disabled={generating || scenes.every(s => !s.image_b64)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all" data-testid="cinema-play"
              style={{ background: `${story.color}15`, border: `1px solid ${story.color}30`, color: story.color, opacity: generating ? 0.5 : 1 }}>
              <Play size={14} /> Play with Narration
            </button>
          )}
          <button onClick={() => setCurrentScene(p => Math.min(scenes.length - 1, p + 1))} className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} data-testid="cinema-next">
            <SkipForward size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
        <p className="text-[9px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Scene {currentScene + 1} of {scenes.length} &middot; {narrating ? (paused ? 'Paused' : 'Narrating...') : 'Tap play to begin narrated cinema'}
        </p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   STORY NARRATOR — audio waveform player
   ══════════════════════════════════════════════ */
function StoryNarrator({ storyId, color, endpoint = 'creation-stories' }) {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [waveData, setWaveData] = useState(new Array(20).fill(0.3));
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const play = async () => {
    if (state === 'paused' && audioRef.current) { audioRef.current.play(); setState('playing'); return; }
    setState('loading');
    try {
      const url = endpoint === 'myths'
        ? `${API}/myths/${storyId}/narrate`
        : `${API}/creation-stories/${storyId}/narrate`;
      const res = await axios.post(url);
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const source = actx.createMediaElementSource(audio);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser).connect(actx.destination);
      analyserRef.current = analyser;
      audio.onended = () => { setState('idle'); setProgress(0); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.play();
      setState('playing');
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
    } catch { toast.error('Failed to generate narration'); setState('idle'); }
  };

  const pause = () => { if (audioRef.current) audioRef.current.pause(); setState('paused'); };
  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setState('idle'); setProgress(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => () => { stop(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }}
      data-testid={`narrator-${storyId}`}>
      {(state === 'playing' || state === 'paused') && (
        <div className="flex items-end justify-center gap-[2px] h-8 px-3 pt-2">
          {waveData.map((v, i) => (
            <motion.div key={i} animate={{ height: state === 'playing' ? `${Math.max(8, v * 100)}%` : '20%' }} transition={{ duration: 0.1 }}
              className="w-[3px] rounded-full" style={{ background: `${color}${state === 'playing' ? '80' : '30'}`, minHeight: 3 }} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'idle' ? (
          <button onClick={play} data-testid={`play-narrator-${storyId}`}
            className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Volume2 size={10} />
            </div>
            Listen to Story
          </button>
        ) : state === 'loading' ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
            <Loader2 size={12} className="animate-spin" style={{ color }} /> Channeling the ancient voices...
          </div>
        ) : (
          <>
            <button onClick={state === 'playing' ? pause : play}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {state === 'playing' ? <Pause size={10} style={{ color }} /> : <Play size={10} style={{ color }} />}
            </button>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${color}10` }}>
              <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
            <button onClick={stop} className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: 'rgba(248,250,252,0.3)' }}>
              <VolumeX size={10} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CREATION STORY CARD
   ══════════════════════════════════════════════ */
function StoryCard({ story, onSelect, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 200, damping: 25 }}
      onClick={() => onSelect(story)}
      data-testid={`story-card-${story.id}`}
      className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
      style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)', backdropFilter: 'none'}}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {/* Animated glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${story.color}08 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${story.color}10`, border: `1px solid ${story.color}15` }}
              whileHover={{ scale: 1.1, rotate: 5 }}>
              <Globe size={18} style={{ color: story.color }} />
            </motion.div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{story.culture}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.3)' }}><MapPin size={8} /> {story.region}</span>
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.2)' }}><Clock size={8} /> {story.era}</span>
              </div>
            </div>
          </div>
          <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.15)' }} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        <p className="text-xs font-medium mb-2" style={{ color: story.color, fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>{story.title}</p>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(248,250,252,0.35)' }}>{story.story_preview}</p>
        <div className="flex items-center gap-2 mb-2">
          <Star size={9} style={{ color: story.color }} />
          <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Deity: {story.deity}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {story.symbols?.slice(0, 3).map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[9px]"
              style={{ background: `${story.color}08`, border: `1px solid ${story.color}10`, color: `${story.color}90` }}>{s}</span>
          ))}
          {story.symbols?.length > 3 && <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ color: 'rgba(248,250,252,0.2)' }}>+{story.symbols.length - 3}</span>}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   CIVILIZATION CARD — for myths tab
   ══════════════════════════════════════════════ */
function CivilizationCard({ civ, onSelect, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 220, damping: 22 }}
      onClick={() => onSelect(civ)}
      data-testid={`civ-card-${civ.id}`}
      className="rounded-2xl p-4 cursor-pointer group relative overflow-hidden"
      style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)', backdropFilter: 'none'}}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Animated corner glow */}
      <motion.div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${civ.color}15 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center relative"
            style={{ background: `${civ.color}10`, border: `1px solid ${civ.color}20` }}
            whileHover={{ scale: 1.1 }}>
            <ScrollText size={20} style={{ color: civ.color }} />
            {/* Pulse ring */}
            <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
              animate={{ boxShadow: [`0 0 0 0px ${civ.color}00`, `0 0 0 6px ${civ.color}00`] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: index * 0.2 }}
              style={{ border: `1px solid ${civ.color}20` }} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#F8FAFC' }}>{civ.name}</p>
            <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.3)' }}>
              <MapPin size={8} /> {civ.region}
            </p>
          </div>
          <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.12)' }} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen size={9} style={{ color: civ.color }} />
            <span className="text-[10px]" style={{ color: `${civ.color}90` }}>{civ.myth_count} tales</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-1 h-1 rounded-full"
                style={{ background: `${civ.color}${40 + i * 20}` }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }} />
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {civ.myths_preview?.slice(0, 2).map((m, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
              style={{ background: `${civ.color}06`, border: `1px solid ${civ.color}08`, color: 'rgba(248,250,252,0.25)' }}>{m}</span>
          ))}
          {civ.myths_preview?.length > 2 && (
            <span className="text-[9px] px-1.5 py-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>+{civ.myths_preview.length - 2}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MYTH CARD — single myth within a civilization
   ══════════════════════════════════════════════ */
function MythCard({ myth, color, onSelect, onGenerate, index, generating }) {
  const Icon = MYTH_TYPE_ICONS[myth.type] || ScrollText;
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      data-testid={`myth-card-${myth.seed_title?.replace(/\s+/g, '-').toLowerCase()}`}
      className="rounded-xl p-4 cursor-pointer group relative overflow-hidden"
      style={{ background: 'transparent', border: `1px solid ${myth.generated ? color + '12' : 'rgba(248,250,252,0.04)'}`, backdropFilter: 'none'}}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      onClick={() => myth.generated ? onSelect(myth) : onGenerate(myth)}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: myth.generated ? `${color}12` : 'rgba(248,250,252,0.03)', border: `1px solid ${myth.generated ? color + '20' : 'rgba(248,250,252,0.06)'}` }}>
          {myth.generated ? <Icon size={16} style={{ color }} /> : <Sparkles size={14} style={{ color: 'rgba(248,250,252,0.2)' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: myth.generated ? '#F8FAFC' : 'rgba(248,250,252,0.5)' }}>
            {myth.title || myth.seed_title}
          </p>
          {myth.generated && myth.type && (
            <p className="text-[9px] capitalize mt-0.5" style={{ color: `${color}80` }}>{myth.type.replace('_', ' ')}</p>
          )}
          {!myth.generated && (
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.2)' }}>Tap to generate with AI</p>
          )}
        </div>
        {generating === myth.seed_title ? (
          <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color }} />
        ) : myth.generated ? (
          <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.12)' }} className="group-hover:translate-x-1 transition-transform" />
        ) : (
          <motion.div whileHover={{ scale: 1.15 }} className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
            <Sparkles size={11} style={{ color }} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MYTH DETAIL — full narrative view
   ══════════════════════════════════════════════ */
function MythDetail({ myth, color, onBack }) {
  const [revealedParagraphs, setRevealedParagraphs] = useState(0);
  const paragraphs = myth.story?.split('\n\n').filter(Boolean) || [myth.story || ''];

  // Staggered paragraph reveal — narrative effect
  useEffect(() => {
    if (paragraphs.length === 0) return;
    setRevealedParagraphs(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setRevealedParagraphs(i);
      if (i >= paragraphs.length) clearInterval(timer);
    }, 400);
    return () => clearInterval(timer);
  }, [myth.id]);

  const Icon = MYTH_TYPE_ICONS[myth.type] || ScrollText;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl overflow-hidden" data-testid="myth-detail"
      style={{ background: 'transparent', border: `1px solid ${color}15`, backdropFilter: 'none'}}>

      {/* Header with animated gradient */}
      <div className="p-6 pb-4 relative overflow-hidden">
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          style={{ background: `linear-gradient(270deg, ${color}06, ${color}03, ${color}08, ${color}03)`, backgroundSize: '300% 300%' }} />

        <div className="relative z-10">
          <button onClick={onBack} data-testid="myth-detail-back"
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg mb-4 hover:bg-white/5 transition-colors"
            style={{ color: 'rgba(248,250,252,0.4)' }}>
            <ArrowLeft size={10} /> Back to myths
          </button>

          <div className="flex items-center gap-3 mb-3">
            <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
              animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}15`, `0 0 0px ${color}00`] }}
              transition={{ repeat: Infinity, duration: 3 }}>
              <Icon size={22} style={{ color }} />
            </motion.div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{myth.title}</p>
              <div className="flex items-center gap-3 mt-0.5 text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                <span className="flex items-center gap-1"><Globe size={8} /> {myth.culture}</span>
                <span className="flex items-center gap-1 capitalize"><Feather size={8} /> {myth.type?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Voice narration */}
        <div className="mb-4">
          <StoryNarrator storyId={myth.id} color={color} endpoint="myths" />
        </div>

        {/* Characters */}
        {myth.characters?.length > 0 && (
          <div className="mb-5">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
              style={{ color: 'rgba(248,250,252,0.25)' }}><Users size={9} /> Characters</p>
            <div className="grid grid-cols-2 gap-2">
              {myth.characters.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="rounded-lg p-2.5" style={{ background: `${color}04`, border: `1px solid ${color}08` }}>
                  <p className="text-[11px] font-medium" style={{ color: '#F8FAFC' }}>{c.name}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>{c.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Story — with narrative reveal */}
        <div className="mb-5">
          <p className="text-[9px] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5"
            style={{ color: 'rgba(248,250,252,0.25)' }}><BookOpen size={9} /> The Tale</p>
          {paragraphs.map((para, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={i < revealedParagraphs ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(4px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-[13px] leading-[1.85] mb-3"
              style={{ color: 'rgba(248,250,252,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
              {para}
            </motion.p>
          ))}
        </div>

        {/* Lesson */}
        {myth.lesson && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="rounded-xl p-4 mb-4" style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color }}><Crown size={8} className="inline mr-1" />Wisdom</p>
            <p className="text-sm leading-relaxed italic"
              style={{ color: 'rgba(248,250,252,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>"{myth.lesson}"</p>
          </motion.div>
        )}

        {/* Symbols */}
        {myth.symbols?.length > 0 && (
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Symbols</p>
            <div className="flex flex-wrap gap-2">
              {myth.symbols.map((s, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.05 }}
                  className="px-3 py-1.5 rounded-lg text-[10px]"
                  style={{ background: `${color}08`, border: `1px solid ${color}12`, color }}>
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Connected myths */}
        {myth.connected_myths?.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Connected Myths</p>
            <div className="flex flex-wrap gap-2">
              {myth.connected_myths.map((m, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-[9px]"
                  style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.35)' }}>{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   SEARCH RESULTS PANEL
   ══════════════════════════════════════════════ */
function MythSearchResults({ results, onSelectResult, searchQuery }) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search size={24} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.1)' }} />
        <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No myths found for "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] mb-3" style={{ color: 'rgba(248,250,252,0.3)' }}>
        {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
      </p>
      {results.map((r, i) => (
        <motion.div key={`${r.civilization_id}-${r.seed_title}-${i}`}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          onClick={() => onSelectResult(r)}
          className="rounded-xl p-3 cursor-pointer group hover:bg-white/[0.02] transition-colors"
          style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${r.color}10`, border: `1px solid ${r.color}15` }}>
              {r.generated ? <BookOpen size={14} style={{ color: r.color }} /> : <Sparkles size={12} style={{ color: r.color || 'rgba(248,250,252,0.3)' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#F8FAFC' }}>{r.title || r.seed_title}</p>
              <p className="text-[9px]" style={{ color: r.color || 'rgba(248,250,252,0.3)' }}>{r.culture} &middot; {r.region}</p>
            </div>
            {r.generated ? (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${r.color}10`, color: r.color }}>Generated</span>
            ) : (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.2)' }}>Seed</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════ */
export default function CreationStories() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('creation');

  // Creation Stories state
  const [stories, setStories] = useState([]);
  const [regions, setRegions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [fullStory, setFullStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [activeRegion, setActiveRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cinemaMode, setCinemaMode] = useState(null);

  // Myths & Legends state
  const [civilizations, setCivilizations] = useState([]);
  const [civsLoading, setCivsLoading] = useState(false);
  const [selectedCiv, setSelectedCiv] = useState(null);
  const [civMyths, setCivMyths] = useState([]);
  const [mythsLoading, setMythsLoading] = useState(false);
  const [selectedMyth, setSelectedMyth] = useState(null);
  const [generatingMyth, setGeneratingMyth] = useState(null);
  const [mythSearchQuery, setMythSearchQuery] = useState('');
  const [mythSearchResults, setMythSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef(null);

  // Load creation stories
  useEffect(() => {
    axios.get(`${API}/creation-stories`).then(r => {
      setStories(r.data.stories || []);
      setRegions(r.data.regions || {});
    }).catch(() => toast.error('Failed to load creation stories'))
      .finally(() => setLoading(false));
  }, []);

  // Load civilizations when myths tab is selected
  useEffect(() => {
    if (activeTab === 'myths' && civilizations.length === 0) {
      setCivsLoading(true);
      axios.get(`${API}/myths/civilizations`).then(r => {
        setCivilizations(r.data.civilizations || []);
      }).catch(() => toast.error('Failed to load civilizations'))
        .finally(() => setCivsLoading(false));
    }
  }, [activeTab]);

  // Load myths for selected civilization
  const selectCiv = useCallback(async (civ) => {
    setSelectedCiv(civ);
    setSelectedMyth(null);
    setMythsLoading(true);
    try {
      const r = await axios.get(`${API}/myths/${civ.id}`);
      setCivMyths(r.data.myths || []);
    } catch { toast.error('Failed to load myths'); }
    setMythsLoading(false);
  }, []);

  // Generate a myth
  const generateMyth = useCallback(async (myth) => {
    if (!token) { toast.error('Please sign in to generate myths'); return; }
    setGeneratingMyth(myth.seed_title);
    try {
      const r = await axios.post(`${API}/myths/${selectedCiv.id}/generate`, { seed_title: myth.seed_title }, { headers: authHeaders });
      // Update list
      setCivMyths(prev => prev.map(m => m.seed_title === myth.seed_title ? { ...r.data, generated: true } : m));
      setSelectedMyth({ ...r.data, generated: true });
      toast.success('Myth revealed by the cosmos');
    } catch { toast.error('Failed to generate myth'); }
    setGeneratingMyth(null);
  }, [token, authHeaders, selectedCiv]);

  // Search myths with debounce
  useEffect(() => {
    if (!mythSearchQuery.trim()) { setMythSearchResults(null); return; }
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await axios.get(`${API}/myths/search/${encodeURIComponent(mythSearchQuery.trim())}`);
        setMythSearchResults(r.data.results || []);
      } catch { setMythSearchResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [mythSearchQuery]);

  const handleSearchResultSelect = useCallback((result) => {
    if (result.generated && result.id) {
      setSelectedMyth(result);
      // also load the civ
      const civ = civilizations.find(c => c.id === result.civilization_id);
      if (civ) setSelectedCiv(civ);
    } else {
      const civ = civilizations.find(c => c.id === result.civilization_id);
      if (civ) { selectCiv(civ); }
    }
    setMythSearchQuery('');
    setMythSearchResults(null);
  }, [civilizations, selectCiv]);

  // Creation Stories selection
  const selectStory = useCallback(async (story) => {
    setSelected(story);
    setStoryLoading(true);
    try {
      const r = await axios.get(`${API}/creation-stories/${story.id}`);
      setFullStory(r.data);
    } catch { toast.error('Failed to load story'); }
    setStoryLoading(false);
  }, []);

  const filteredStories = stories.filter(s => {
    if (activeRegion !== 'all') {
      const regionIds = regions[activeRegion] || [];
      if (!regionIds.includes(s.id)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.culture.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.deity.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs = [
    { id: 'creation', label: 'Creation Stories', icon: Sun, count: stories.length },
    { id: 'myths', label: 'Myths & Legends', icon: ScrollText, count: civilizations.reduce((a, c) => a + (c.myth_count || 0), 0) },
  ];

  return (
    <div className="min-h-screen immersive-page pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors" data-testid="back-btn">
              <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                Myths & Legends
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Ancient stories from {stories.length} civilizations &middot; {civilizations.reduce((a, c) => a + (c.myth_count || 0), 0)}+ tales
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <Volume2 size={12} style={{ color: '#C084FC' }} />
            <span className="text-[10px]" style={{ color: '#C084FC' }}>HD voice narration on every story</span>
          </div>
        </div>

        {/* Tab Bar with animated underline */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className="flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-300"
                style={{ color: isActive ? '#F8FAFC' : 'rgba(248,250,252,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TabIcon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'creation' ? 'Origins' : 'Myths'}</span>
                  {tab.count > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: isActive ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.04)', color: isActive ? '#C084FC' : 'rgba(248,250,252,0.2)' }}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* ═══ CREATION STORIES TAB ═══ */}
        <AnimatePresence mode="wait">
          {activeTab === 'creation' && (
            <motion.div key="creation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {/* Search + Region Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.2)' }} />
                  <input type="text" placeholder="Search cultures, deities, stories..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)} data-testid="story-search"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs"
                    style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }} />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
                  )}
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  <button onClick={() => setActiveRegion('all')} data-testid="region-all"
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-medium transition-all"
                    style={{ background: activeRegion === 'all' ? 'rgba(192,132,252,0.12)' : 'rgba(0,0,0,0)', border: `1px solid ${activeRegion === 'all' ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.04)'}`, color: activeRegion === 'all' ? '#C084FC' : 'rgba(248,250,252,0.4)' }}>
                    All Regions
                  </button>
                  {Object.keys(regions).map(region => (
                    <button key={region} onClick={() => setActiveRegion(region)}
                      data-testid={`region-${region.toLowerCase().replace(/[^a-z]/g, '-')}`}
                      className="flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap"
                      style={{ background: activeRegion === region ? 'rgba(192,132,252,0.12)' : 'rgba(0,0,0,0)', border: `1px solid ${activeRegion === region ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.04)'}`, color: activeRegion === region ? '#C084FC' : 'rgba(248,250,252,0.4)' }}>
                      {REGION_ICONS[region] || ''} {region}
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin mr-3" size={20} style={{ color: '#C084FC' }} />
                  <span className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading creation stories...</span>
                </div>
              )}

              <div className="flex gap-6">
                <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'} transition-all`}>
                  {!loading && filteredStories.length === 0 && (
                    <div className="text-center py-16">
                      <Globe size={28} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.15)' }} />
                      <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No stories match your search</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredStories.map((story, i) => <StoryCard key={story.id} story={story} onSelect={selectStory} index={i} />)}
                  </div>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                  {selected && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="w-full lg:w-1/2 lg:sticky lg:top-24 lg:max-h-[80vh] lg:overflow-y-auto" data-testid="story-detail-panel">
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'transparent', border: `1px solid ${selected.color}15`, backdropFilter: 'none'}}>
                        <div className="p-6 pb-4" style={{ background: `linear-gradient(180deg, ${selected.color}08 0%, transparent 100%)` }}>
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={() => { setSelected(null); setFullStory(null); }} data-testid="close-story-detail"
                              className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg lg:hidden"
                              style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.4)' }}><ArrowLeft size={10} /> Back</button>
                            <button onClick={() => { setSelected(null); setFullStory(null); }} data-testid="close-story-x"
                              className="hidden lg:block p-1 rounded hover:bg-white/5"><X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${selected.color}12`, border: `1px solid ${selected.color}20` }}>
                              <Globe size={22} style={{ color: selected.color }} />
                            </div>
                            <div>
                              <p className="text-lg font-bold" style={{ color: '#F8FAFC' }}>{selected.culture}</p>
                              <div className="flex items-center gap-3 text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                                <span className="flex items-center gap-1"><MapPin size={8} /> {selected.region}</span>
                                <span className="flex items-center gap-1"><Clock size={8} /> {selected.era}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-base font-semibold leading-snug" style={{ color: selected.color, fontFamily: 'Cormorant Garamond, serif', fontSize: '18px' }}>{selected.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Star size={10} style={{ color: selected.color }} />
                            <span className="text-[11px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Deity: {selected.deity}</span>
                          </div>
                        </div>

                        <div className="px-6 pb-6">
                          {storyLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="animate-spin" size={16} style={{ color: selected.color }} />
                            </div>
                          ) : fullStory ? (
                            <>
                              <div className="mb-4"><StoryNarrator storyId={fullStory.id} color={fullStory.color} /></div>

                              <button onClick={() => setCinemaMode({ story: selected, fullStory })} data-testid="watch-cinema-btn"
                                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all group"
                                style={{ background: `linear-gradient(135deg, ${fullStory.color}10, ${fullStory.color}05)`, border: `1px solid ${fullStory.color}20`, color: fullStory.color }}>
                                <Film size={14} className="group-hover:scale-110 transition-transform" />
                                Watch AI Cinematic Experience
                                <span className="text-[9px] ml-1 px-1.5 py-0.5 rounded-full" style={{ background: `${fullStory.color}15` }}>3 AI scenes</span>
                              </button>

                              <div className="mb-5">
                                <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: 'rgba(248,250,252,0.25)' }}><BookOpen size={9} /> The Creation Story</p>
                                {fullStory.story.split('\n\n').map((para, i) => (
                                  <p key={i} className="text-[13px] leading-[1.8] mb-3" style={{ color: 'rgba(248,250,252,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>{para}</p>
                                ))}
                              </div>

                              <div className="rounded-xl p-4 mb-4" style={{ background: `${fullStory.color}06`, border: `1px solid ${fullStory.color}12` }}>
                                <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: fullStory.color }}>Cosmic Lesson</p>
                                <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(248,250,252,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>"{fullStory.lesson}"</p>
                              </div>

                              <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Sacred Symbols</p>
                                <div className="flex flex-wrap gap-2">
                                  {fullStory.symbols?.map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg text-[10px]" style={{ background: `${fullStory.color}08`, border: `1px solid ${fullStory.color}12`, color: fullStory.color }}>{s}</span>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ═══ MYTHS & LEGENDS TAB ═══ */}
          {activeTab === 'myths' && (
            <motion.div key="myths" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {/* Search */}
              <div className="relative mb-6">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.2)' }} />
                <input type="text" placeholder="Search all myths, legends, and folklore across civilizations..."
                  value={mythSearchQuery} onChange={e => setMythSearchQuery(e.target.value)} data-testid="myth-search"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs"
                  style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }} />
                {mythSearchQuery && (
                  <button onClick={() => { setMythSearchQuery(''); setMythSearchResults(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
                )}
                {searching && <Loader2 size={12} className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin" style={{ color: '#C084FC' }} />}
              </div>

              {/* Search results overlay */}
              {mythSearchResults !== null && (
                <div className="mb-6 rounded-xl p-4" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.06)' }}>
                  <MythSearchResults results={mythSearchResults} onSelectResult={handleSearchResultSelect} searchQuery={mythSearchQuery} />
                </div>
              )}

              {/* Three-column: Civilizations | Myth List | Myth Detail */}
              <div className="flex gap-4">
                {/* Col 1: Civilizations grid */}
                <div className={`transition-all duration-300 ${selectedCiv ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
                  {civsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="animate-spin mr-3" size={20} style={{ color: '#C084FC' }} />
                      <span className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading civilizations...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: 'rgba(248,250,252,0.25)' }}>
                        <Globe size={10} /> {civilizations.length} civilizations
                      </p>
                      <div className={`grid gap-3 ${selectedCiv ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                        {civilizations.map((civ, i) => <CivilizationCard key={civ.id} civ={civ} onSelect={selectCiv} index={i} />)}
                      </div>
                    </>
                  )}
                </div>

                {/* Col 2: Myth list for selected civ */}
                {selectedCiv && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={`transition-all duration-300 ${selectedMyth ? 'hidden lg:block lg:w-1/3' : 'w-full lg:w-2/3'}`}>

                    {/* Civ header */}
                    <div className="rounded-xl p-4 mb-4 relative overflow-hidden"
                      style={{ background: 'transparent', border: `1px solid ${selectedCiv.color}15` }}>
                      <motion.div className="absolute inset-0 pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${selectedCiv.color}06, transparent 60%)` }} />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setSelectedCiv(null); setSelectedMyth(null); setCivMyths([]); }}
                            data-testid="back-to-civs" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors lg:hidden">
                            <ArrowLeft size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />
                          </button>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${selectedCiv.color}12`, border: `1px solid ${selectedCiv.color}25` }}>
                            <ScrollText size={18} style={{ color: selectedCiv.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{selectedCiv.name}</p>
                            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{selectedCiv.region} &middot; {civMyths.length} tales</p>
                          </div>
                        </div>
                        <button onClick={() => { setSelectedCiv(null); setSelectedMyth(null); setCivMyths([]); }}
                          data-testid="close-civ" className="hidden lg:block p-1 rounded hover:bg-white/5">
                          <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
                        </button>
                      </div>
                    </div>

                    {mythsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin" size={16} style={{ color: selectedCiv.color }} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {civMyths.map((myth, i) => (
                          <MythCard key={myth.seed_title} myth={myth} color={selectedCiv.color}
                            onSelect={setSelectedMyth} onGenerate={generateMyth}
                            index={i} generating={generatingMyth} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Col 3: Myth detail */}
                {selectedMyth && selectedMyth.generated && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/3 lg:sticky lg:top-24 lg:max-h-[80vh] lg:overflow-y-auto">
                    <MythDetail myth={selectedMyth} color={selectedCiv?.color || '#C084FC'}
                      onBack={() => setSelectedMyth(null)} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cinematic Story Mode */}
      <AnimatePresence>
        {cinemaMode && (
          <CinematicStoryMode story={cinemaMode.story} fullStory={cinemaMode.fullStory}
            authHeaders={authHeaders} onClose={() => setCinemaMode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
