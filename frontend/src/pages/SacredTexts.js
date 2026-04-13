import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, BookOpen, Volume2, VolumeX, Loader2, Pause, Play,
  Sparkles, ChevronRight, Search, X, Globe, Eye, Maximize2, Minimize2,
  Headphones, BookMarked, Layers, Wind, Droplets, Flame, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FixedSizeList } from 'react-window';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const THEME_PARTICLES = {
  golden_particles: { colors: ['#F59E0B', '#FBBF24', '#D97706'], shape: 'circle', count: 40, bg: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.04) 0%, transparent 70%)' },
  water_ink: { colors: ['#10B981', '#34D399', '#059669'], shape: 'circle', count: 25, bg: 'radial-gradient(ellipse at 30% 60%, rgba(16,185,129,0.03) 0%, transparent 60%)' },
  hieroglyph_reveal: { colors: ['#8B5CF6', '#A78BFA', '#7C3AED'], shape: 'square', count: 30, bg: 'radial-gradient(ellipse at 70% 40%, rgba(139,92,246,0.04) 0%, transparent 60%)' },
  jungle_mist: { colors: ['#22C55E', '#4ADE80', '#16A34A'], shape: 'circle', count: 35, bg: 'radial-gradient(ellipse at 40% 70%, rgba(34,197,94,0.03) 0%, transparent 60%)' },
  lotus_bloom: { colors: ['#F97316', '#FB923C', '#EA580C'], shape: 'circle', count: 20, bg: 'radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.03) 0%, transparent 60%)' },
  whirling_stars: { colors: ['#D946EF', '#E879F9', '#C026D3'], shape: 'circle', count: 45, bg: 'radial-gradient(ellipse at 60% 30%, rgba(217,70,239,0.04) 0%, transparent 60%)' },
  rune_frost: { colors: ['#64748B', '#94A3B8', '#475569'], shape: 'square', count: 25, bg: 'radial-gradient(ellipse at 50% 50%, rgba(100,116,139,0.04) 0%, transparent 60%)' },
  mandala_pulse: { colors: ['#EF4444', '#F87171', '#DC2626'], shape: 'circle', count: 30, bg: 'radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.03) 0%, transparent 60%)' },
  emerald_glow: { colors: ['#14B8A6', '#2DD4BF', '#0D9488'], shape: 'circle', count: 30, bg: 'radial-gradient(ellipse at 40% 50%, rgba(20,184,166,0.04) 0%, transparent 60%)' },
  sakura_drift: { colors: ['#EC4899', '#F472B6', '#DB2777'], shape: 'circle', count: 35, bg: 'radial-gradient(ellipse at 60% 40%, rgba(236,72,153,0.03) 0%, transparent 60%)' },
};

/* ══════════════════════════════════════
   AMBIENT PARTICLES — canvas animation
   ══════════════════════════════════════ */
function AmbientParticles({ theme, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const config = THEME_PARTICLES[theme] || THEME_PARTICLES.golden_particles;

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('sacred_texts', 8); }, []);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = Array.from({ length: config.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.x += p.speedX + Math.sin(p.phase) * 0.2;
        p.y += p.speedY;
        p.phase += 0.01;
        p.opacity = 0.1 + Math.sin(p.phase) * 0.15;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (config.shape === 'square') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [active, theme]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" style={{ opacity: 0.6 }} />;
}

/* ══════════════════════════════════════
   VR IMMERSIVE READER
   ══════════════════════════════════════ */
function VRImmersiveReader({ chapter, text, onClose, authHeaders }) {
  const [revealedParagraphs, setRevealedParagraphs] = useState(0);
  const [narrating, setNarrating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  const [showParticles, setShowParticles] = useState(true);
  const audioRef = useRef(null);
  const contentRef = useRef(null);

  const paragraphs = chapter.content?.split('\n\n').filter(Boolean) || [];
  const excerptParagraphs = chapter.excerpt?.split('\n\n').filter(Boolean) || [];
  const commentaryParagraphs = chapter.commentary?.split('\n\n').filter(Boolean) || [];

  const speedMs = { slow: 800, normal: 400, fast: 150 };

  useEffect(() => {
    setRevealedParagraphs(0);
    let i = 0;
    const total = paragraphs.length + excerptParagraphs.length + commentaryParagraphs.length;
    const timer = setInterval(() => {
      i++;
      setRevealedParagraphs(i);
      if (i >= total) clearInterval(timer);
    }, speedMs[animationSpeed]);
    return () => clearInterval(timer);
  }, [chapter.chapter_id, animationSpeed]);

  const startNarration = async () => {
    setNarrating(true);
    try {
      const r = await axios.post(
        `${API}/sacred-texts/${text.id}/chapters/${chapter.chapter_id}/narrate`,
        {}, { headers: authHeaders, timeout: 120000 }
      );
      const audio = new Audio(`data:audio/mp3;base64,${r.data.audio}`);
      audioRef.current = audio;
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.onended = () => { setNarrating(false); setPaused(false); setProgress(0); };
      audio.play();
    } catch { toast.error('Failed to generate narration'); setNarrating(false); }
  };

  const togglePause = () => {
    if (!audioRef.current) return;
    if (paused) { audioRef.current.play(); setPaused(false); }
    else { audioRef.current.pause(); setPaused(true); }
  };

  const stopNarration = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setNarrating(false); setPaused(false); setProgress(0);
  };

  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  let paraIdx = 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      data-testid="vr-reader"
      style={{ background: '#06070E' }}>

      <AmbientParticles theme={text.animation_theme} active={showParticles} />

      {/* Ambient bg gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: THEME_PARTICLES[text.animation_theme]?.bg || '' }} />

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(6,7,14,0.9) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} data-testid="close-vr-reader"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Minimize2 size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: text.color }}>{text.tradition}</p>
            <p className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif' }}>
              {chapter.chapter_title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Animation speed */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {['slow', 'normal', 'fast'].map(s => (
              <button key={s} onClick={() => setAnimationSpeed(s)}
                className="px-2 py-0.5 rounded text-[9px] capitalize transition-all"
                style={{ background: animationSpeed === s ? `${text.color}15` : 'transparent', color: animationSpeed === s ? text.color : 'rgba(248,250,252,0.25)' }}>
                {s}
              </button>
            ))}
          </div>
          {/* Particles toggle */}
          <button onClick={() => setShowParticles(p => !p)} data-testid="toggle-particles"
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: showParticles ? `${text.color}10` : 'rgba(255,255,255,0.04)', color: showParticles ? text.color : 'rgba(248,250,252,0.2)' }}>
            <Sparkles size={14} />
          </button>
        </div>
      </div>

      {/* Narration controls — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-50 px-4 py-4"
        style={{ background: 'linear-gradient(0deg, rgba(6,7,14,0.95) 0%, transparent 100%)' }}>
        {narrating && (
          <div className="mb-2 h-0.5 rounded-full overflow-hidden mx-4" style={{ background: `${text.color}15` }}>
            <motion.div className="h-full rounded-full" style={{ background: text.color }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          {!narrating ? (
            <button onClick={startNarration} data-testid="vr-narrate"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all group"
              style={{ background: `${text.color}12`, border: `1px solid ${text.color}25`, color: text.color }}>
              <Headphones size={14} className="group-hover:scale-110 transition-transform" />
              Listen to Sacred Reading
            </button>
          ) : (
            <>
              <button onClick={togglePause} className="p-2.5 rounded-full" data-testid="vr-pause"
                style={{ background: `${text.color}12`, border: `1px solid ${text.color}25` }}>
                {paused ? <Play size={14} style={{ color: text.color }} /> : <Pause size={14} style={{ color: text.color }} />}
              </button>
              <button onClick={stopNarration} className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <VolumeX size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
              </button>
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {narrating ? (paused ? 'Paused' : 'Narrating...') : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content — immersive scroll */}
      <div ref={contentRef} className="flex-1 overflow-y-auto relative z-10 px-6 pt-20 pb-28"
        style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-12">
            <motion.div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${text.color}10`, border: `1px solid ${text.color}20` }}
              animate={{ boxShadow: [`0 0 0px ${text.color}00`, `0 0 30px ${text.color}12`, `0 0 0px ${text.color}00`] }}
              transition={{ repeat: Infinity, duration: 4 }}>
              <BookOpen size={28} style={{ color: text.color }} />
            </motion.div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: text.color }}>
              {text.title} &middot; Chapter {chapter.chapter_number}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
              {chapter.chapter_title}
            </h1>
          </motion.div>

          {/* Retelling */}
          {paragraphs.length > 0 && (
            <div className="mb-10">
              <p className="text-[9px] uppercase tracking-[0.2em] mb-4 text-center"
                style={{ color: 'rgba(248,250,252,0.2)' }}>The Retelling</p>
              {paragraphs.map((para, i) => {
                const idx = paraIdx++;
                return (
                  <motion.p key={`r-${i}`}
                    initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
                    animate={idx < revealedParagraphs ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-base md:text-lg leading-[2] mb-5 text-center"
                    style={{ color: 'rgba(248,250,252,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {para}
                  </motion.p>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {excerptParagraphs.length > 0 && (
            <motion.div className="flex items-center gap-4 my-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
              <BookMarked size={14} style={{ color: text.color }} />
              <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
            </motion.div>
          )}

          {/* Excerpts */}
          {excerptParagraphs.length > 0 && (
            <div className="mb-10">
              <p className="text-[9px] uppercase tracking-[0.2em] mb-4 text-center"
                style={{ color: 'rgba(248,250,252,0.2)' }}>Sacred Passages</p>
              {excerptParagraphs.map((para, i) => {
                const idx = paraIdx++;
                return (
                  <motion.div key={`e-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={idx < revealedParagraphs ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-5 pl-4 py-2"
                    style={{ borderLeft: `2px solid ${text.color}30` }}>
                    <p className="text-sm md:text-base leading-[1.9] italic"
                      style={{ color: 'rgba(248,250,252,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>
                      {para}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Commentary */}
          {commentaryParagraphs.length > 0 && (
            <div className="mb-10">
              <motion.div className="flex items-center gap-4 my-10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
                <Eye size={14} style={{ color: text.color }} />
                <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
              </motion.div>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-4 text-center"
                style={{ color: 'rgba(248,250,252,0.2)' }}>Deeper Meaning</p>
              {commentaryParagraphs.map((para, i) => {
                const idx = paraIdx++;
                return (
                  <motion.p key={`c-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={idx < revealedParagraphs ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-sm leading-[1.9] mb-4 text-center"
                    style={{ color: 'rgba(248,250,252,0.5)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {para}
                  </motion.p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   TEXT CARD
   ══════════════════════════════════════ */
function TextCard({ text, onSelect, index }) {
  const TRADITION_ICONS = {
    'Hindu': Flame, 'Taoist': Wind, 'Ancient Egyptian': Moon, 'Mayan': Globe,
    'Buddhist': Droplets, 'Sufi / Islamic': Sparkles, 'Norse': Layers,
    'Tibetan Buddhist': Moon, 'Chinese / Confucian / Taoist': Wind,
    'Hermetic / Alchemical': Eye, 'Hindu / Yogic': Flame, 'Shinto / Japanese': Sparkles,
    'Yoruba / Ifa': Globe, 'Finnish / Nordic': Layers, 'Hindu / Vedantic': Flame,
  };
  const Icon = TRADITION_ICONS[text.tradition] || BookOpen;
  const progressPct = text.chapter_count > 0 ? Math.round((text.generated_count / text.chapter_count) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 200, damping: 25 }}
      onClick={() => onSelect(text)}
      data-testid={`text-card-${text.id}`}
      className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
      style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.04)', backdropFilter: 'blur(8px)' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${text.color}08 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${text.color}10`, border: `1px solid ${text.color}15` }}
            whileHover={{ scale: 1.1, rotate: 5 }}>
            <Icon size={18} style={{ color: text.color }} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{text.title}</p>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
              <span>{text.tradition}</span>
              <span>&middot;</span>
              <span>{text.era}</span>
            </div>
          </div>
          <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.12)' }} className="group-hover:translate-x-1 transition-transform" />
        </div>

        <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(248,250,252,0.3)' }}>
          {text.description.length > 120 ? text.description.slice(0, 120) + '...' : text.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.2)' }}>
            <BookOpen size={9} /> {text.chapter_count} chapters
          </span>
          {progressPct > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: `${text.color}10` }}>
                <div className="h-full rounded-full" style={{ background: text.color, width: `${progressPct}%` }} />
              </div>
              <span className="text-[9px]" style={{ color: text.color }}>{progressPct}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   INLINE READER — Read text directly on page
   ══════════════════════════════════════ */
function InlineReader({ chapter, text, textDetail, onClose, onVR, authHeaders }) {
  const [narrating, setNarrating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const readerRef = useRef(null);

  const paragraphs = chapter.content?.split('\n\n').filter(Boolean) || [];
  const excerptParagraphs = chapter.excerpt?.split('\n\n').filter(Boolean) || [];
  const commentaryParagraphs = chapter.commentary?.split('\n\n').filter(Boolean) || [];
  const hasContent = paragraphs.length > 0 || excerptParagraphs.length > 0;

  // Scroll into view when opened
  useEffect(() => {
    setTimeout(() => {
      readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [chapter.chapter_id]);

  const startNarration = async () => {
    setNarrating(true);
    try {
      const r = await axios.post(
        `${API}/sacred-texts/${text.id}/chapters/${chapter.chapter_id || chapter.id}/narrate`,
        {}, { headers: authHeaders, timeout: 120000 }
      );
      const audio = new Audio(`data:audio/mp3;base64,${r.data.audio}`);
      audioRef.current = audio;
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.onended = () => { setNarrating(false); setPaused(false); setProgress(0); };
      audio.play();
    } catch { toast.error('Failed to generate narration'); setNarrating(false); }
  };

  const togglePause = () => {
    if (!audioRef.current) return;
    if (paused) { audioRef.current.play(); setPaused(false); }
    else { audioRef.current.pause(); setPaused(true); }
  };

  const stopNarration = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setNarrating(false); setPaused(false); setProgress(0);
  };

  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  // Navigate to next/prev chapter
  const chapters = textDetail?.chapters || [];
  const currentIdx = chapters.findIndex(c => c.id === chapter.id);
  const prevCh = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextCh = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  return (
    <div ref={readerRef} className="mt-4 rounded-2xl overflow-hidden" data-testid="inline-reader"
      style={{ background: 'rgba(8,10,18,0.7)', border: `1px solid ${text.color}15`, backdropFilter: 'blur(8px)' }}>

      {/* Reader header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${text.color}10` }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] mb-0.5" style={{ color: `${text.color}70` }}>{text.tradition}</p>
          <p className="text-base font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
            {chapter.title || chapter.chapter_title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onVR(chapter)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-all hover:bg-white/5"
            style={{ background: `${text.color}08`, border: `1px solid ${text.color}15`, color: text.color }}
            data-testid="inline-to-vr">
            <Maximize2 size={10} /> VR Mode
          </button>
          <button onClick={() => { stopNarration(); onClose(); }}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" data-testid="close-inline-reader">
            <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
          </button>
        </div>
      </div>

      {/* Narration controls */}
      <div className="px-5 py-3 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${text.color}08`, background: `${text.color}03` }}>
        {!narrating ? (
          <button onClick={startNarration}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all hover:bg-white/5"
            style={{ background: `${text.color}08`, border: `1px solid ${text.color}15`, color: text.color }}
            data-testid="inline-narrate">
            <Volume2 size={10} /> Listen
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <button onClick={togglePause}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: `${text.color}12`, color: text.color }}>
              {paused ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <button onClick={stopNarration}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
              style={{ color: 'rgba(248,250,252,0.4)' }}>
              <X size={12} />
            </button>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${text.color}10` }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ background: text.color, width: `${progress * 100}%` }} />
            </div>
            <span className="text-[9px]" style={{ color: `${text.color}80` }}>{Math.round(progress * 100)}%</span>
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="px-5 py-6 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {!hasContent ? (
          <p className="text-center text-sm py-8" style={{ color: 'rgba(248,250,252,0.25)' }}>
            This chapter has not been generated yet. Tap it from the chapter list to generate.
          </p>
        ) : (
          <>
            {/* Main content */}
            {paragraphs.map((para, i) => (
              <motion.p key={`p-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="text-sm leading-[2] mb-5"
                style={{ color: 'rgba(248,250,252,0.75)', fontFamily: 'Cormorant Garamond, serif', fontSize: '15px' }}>
                {para}
              </motion.p>
            ))}

            {/* Excerpt / Key verses */}
            {excerptParagraphs.length > 0 && (
              <div className="my-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
                  <Sparkles size={12} style={{ color: text.color }} />
                  <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: `${text.color}60` }}>Key Passages</span>
                  <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
                </div>
                {excerptParagraphs.map((para, i) => (
                  <motion.div key={`e-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="pl-4 mb-4"
                    style={{ borderLeft: `2px solid ${text.color}30` }}>
                    <p className="text-sm leading-[1.9] italic"
                      style={{ color: `${text.color}CC`, fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>
                      {para}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Commentary */}
            {commentaryParagraphs.length > 0 && (
              <div className="my-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
                  <Eye size={12} style={{ color: text.color }} />
                  <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: `${text.color}60` }}>Deeper Meaning</span>
                  <div className="flex-1 h-px" style={{ background: `${text.color}15` }} />
                </div>
                {commentaryParagraphs.map((para, i) => (
                  <motion.p key={`c-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="text-xs leading-[1.9] mb-4"
                    style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {para}
                  </motion.p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Chapter navigation */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: `1px solid ${text.color}08`, background: `${text.color}03` }}>
        {prevCh ? (
          <button
            onClick={() => prevCh.generated ? onClose() || setTimeout(() => document.querySelector(`[data-testid="chapter-${prevCh.id}"]`)?.click(), 100) : null}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: prevCh.generated ? 'rgba(248,250,252,0.5)' : 'rgba(248,250,252,0.15)' }}
            disabled={!prevCh.generated}
            data-testid="prev-chapter">
            <ArrowLeft size={10} /> {prevCh.title?.slice(0, 20)}{prevCh.title?.length > 20 ? '...' : ''}
          </button>
        ) : <div />}
        {nextCh ? (
          <button
            onClick={() => nextCh.generated ? onClose() || setTimeout(() => document.querySelector(`[data-testid="chapter-${nextCh.id}"]`)?.click(), 100) : null}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: nextCh.generated ? 'rgba(248,250,252,0.5)' : 'rgba(248,250,252,0.15)' }}
            disabled={!nextCh.generated}
            data-testid="next-chapter">
            {nextCh.title?.slice(0, 20)}{nextCh.title?.length > 20 ? '...' : ''} <ChevronRight size={10} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   CHAPTER LIST (Virtualized with react-window)
   ══════════════════════════════════════ */
function ChapterRowItem({ index, style, text, chapters, onGenerate, onRead, onVR, generating }) {
  const ch = chapters[index];
  if (!ch) return null;
  return (
    <div style={style}>
      <div style={{ paddingBottom: 8 }}>
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(index * 0.03, 0.3) }}
          data-testid={`chapter-${ch.id}`}
          className="rounded-xl p-4 cursor-pointer group relative overflow-hidden"
          style={{ background: ch.generated ? 'rgba(15,17,28,0.4)' : 'rgba(15,17,28,0.3)', border: `1px solid ${ch.generated ? text.color + '12' : 'rgba(248,250,252,0.04)'}`, height: 64 }}
          onClick={() => ch.generated ? onRead(ch) : onGenerate(ch)}
          whileHover={{ x: 4, transition: { duration: 0.15 } }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: ch.generated ? `${text.color}12` : 'rgba(248,250,252,0.03)', border: `1px solid ${ch.generated ? text.color + '20' : 'rgba(248,250,252,0.06)'}`, color: ch.generated ? text.color : 'rgba(248,250,252,0.2)' }}>
              {ch.number}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: ch.generated ? '#F8FAFC' : 'rgba(248,250,252,0.5)' }}>
                {ch.title}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: ch.generated ? `${text.color}80` : 'rgba(248,250,252,0.2)' }}>
                {ch.generated ? 'Tap to read' : 'Tap to generate with AI'}
              </p>
            </div>
            {generating === ch.id ? (
              <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: text.color }} />
            ) : ch.generated ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onVR(ch); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ border: `1px solid ${text.color}15` }}
                  title="Open in VR immersive mode"
                  data-testid={`vr-btn-${ch.id}`}
                >
                  <Maximize2 size={12} style={{ color: text.color, opacity: 0.6 }} />
                </button>
                <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.12)' }} className="group-hover:translate-x-1 transition-transform" />
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.15 }} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${text.color}10`, border: `1px solid ${text.color}20` }}>
                <Sparkles size={11} style={{ color: text.color }} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ChapterList({ text, chapters, onGenerate, onRead, onVR, generating }) {
  const ITEM_HEIGHT = 72;
  const listHeight = Math.min(chapters.length * ITEM_HEIGHT, 420);

  // For small lists, render directly without virtualization
  if (chapters.length <= 6) {
    return (
      <div className="space-y-2">
        {chapters.map((ch, i) => (
          <ChapterRowItem key={ch.id} index={i} style={{}}
            text={text} chapters={chapters}
            onGenerate={onGenerate} onRead={onRead} onVR={onVR} generating={generating} />
        ))}
      </div>
    );
  }

  return (
    <FixedSizeList
      height={listHeight}
      itemCount={chapters.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
      style={{ scrollbarWidth: 'thin' }}
    >
      {({ index, style }) => (
        <ChapterRowItem index={index} style={style}
          text={text} chapters={chapters}
          onGenerate={onGenerate} onRead={onRead} onVR={onVR} generating={generating} />
      )}
    </FixedSizeList>
  );
}

/* ══════════════════════════════════════
   VIRTUALIZED TEXT GRID — renders only visible rows
   ══════════════════════════════════════ */
function VirtualizedTextGrid({ items, onSelect, columns: forceCols }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    setContainerWidth(containerRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const cols = forceCols || (containerWidth >= 1024 ? 3 : containerWidth >= 640 ? 2 : 1);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += cols) {
      result.push(items.slice(i, i + cols));
    }
    return result;
  }, [items, cols]);

  const ROW_HEIGHT = 180;

  // For small lists (≤ 9 items), skip virtualization
  if (items.length <= 9) {
    return (
      <div ref={containerRef}
        className={`grid gap-4 ${forceCols === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((text, i) => <TextCard key={text.id} text={text} onSelect={onSelect} index={i} />)}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {containerWidth > 0 && (
        <FixedSizeList
          height={Math.min(rows.length * ROW_HEIGHT, 800)}
          itemCount={rows.length}
          itemSize={ROW_HEIGHT}
          width={containerWidth}
          style={{ scrollbarWidth: 'thin' }}
        >
          {({ index, style }) => {
            const row = rows[index];
            if (!row) return null;
            return (
              <div style={{ ...style, display: 'flex', gap: 16 }}>
                {row.map((text, i) => (
                  <div key={text.id} style={{ flex: `1 1 ${100 / cols}%`, minWidth: 0 }}>
                    <TextCard text={text} onSelect={onSelect} index={index * cols + i} />
                  </div>
                ))}
                {Array.from({ length: cols - row.length }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ flex: `1 1 ${100 / cols}%` }} />
                ))}
              </div>
            );
          }}
        </FixedSizeList>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════ */
export default function SacredTexts() {
  const { token, authHeaders, user } = useAuth();
  const navigate = useNavigate();

  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedText, setSelectedText] = useState(null);
  const [textDetail, setTextDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [vrChapter, setVrChapter] = useState(null);
  const [readingChapter, setReadingChapter] = useState(null);

  useEffect(() => {
    axios.get(`${API}/sacred-texts`).then(r => setTexts(r.data.texts || []))
      .catch(() => toast.error('Failed to load sacred texts'))
      .finally(() => setLoading(false));
  }, []);

  const selectText = useCallback(async (text) => {
    setSelectedText(text);
    setDetailLoading(true);
    try {
      const r = await axios.get(`${API}/sacred-texts/${text.id}`);
      setTextDetail(r.data);
    } catch { toast.error('Failed to load text details'); }
    setDetailLoading(false);
  }, []);

  const generateChapter = useCallback(async (chapter) => {
    if (!token) { toast.error('Please sign in to generate chapters'); return; }
    setGenerating(chapter.id);
    try {
      const r = await axios.post(
        `${API}/sacred-texts/${selectedText.id}/chapters/${chapter.id}/generate`,
        {}, { headers: authHeaders, timeout: 120000 }
      );
      setTextDetail(prev => ({
        ...prev,
        chapters: prev.chapters.map(ch =>
          ch.id === chapter.id ? { ...ch, generated: true, content: r.data.content, excerpt: r.data.excerpt, commentary: r.data.commentary } : ch
        )
      }));
      toast.success('Sacred wisdom revealed');
    } catch { toast.error('Failed to generate chapter'); }
    setGenerating(null);
  }, [token, authHeaders, selectedText]);

  const openVR = useCallback((chapter) => {
    setVrChapter(chapter);
    // Save progress
    if (user && selectedText) {
      axios.post(`${API}/sacred-texts/progress`, {
        user_id: user.id || user.email,
        text_id: selectedText.id,
        chapter_id: chapter.id,
      }).catch(() => {});
    }
  }, [user, selectedText]);

  const filtered = texts.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.tradition.toLowerCase().includes(q) || t.region.toLowerCase().includes(q);
  });

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
              <h1 className="text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                Sacred Texts
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {texts.length} ancient scriptures &middot; VR immersive reading &middot; HD voice narration
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <Maximize2 size={12} style={{ color: '#C084FC' }} />
            <span className="text-[10px]" style={{ color: '#C084FC' }}>VR immersive reading mode</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.2)' }} />
          <input type="text" placeholder="Search by title, tradition, or region..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} data-testid="sacred-search"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin mr-3" size={20} style={{ color: '#C084FC' }} />
            <span className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading sacred library...</span>
          </div>
        )}

        {/* Content */}
        <div className="flex gap-6">
          {/* Text grid — virtualized for performance */}
          <div className={`transition-all duration-300 ${selectedText ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <BookOpen size={28} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No texts match your search</p>
              </div>
            )}
            <VirtualizedTextGrid
              items={filtered}
              onSelect={selectText}
              columns={selectedText ? 1 : undefined}
            />
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedText && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="w-full lg:w-2/3 lg:sticky lg:top-24 lg:max-h-[80vh] lg:overflow-y-auto">
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,17,28,0.6)', border: `1px solid ${selectedText.color}15`, backdropFilter: 'blur(12px)' }}>
                  {/* Header */}
                  <div className="p-6 pb-4 relative overflow-hidden"
                    style={{ background: `linear-gradient(180deg, ${selectedText.color}08 0%, transparent 100%)` }}>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => { setSelectedText(null); setTextDetail(null); }}
                        className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg lg:hidden hover:bg-white/5 transition-colors"
                        style={{ color: 'rgba(248,250,252,0.4)' }} data-testid="close-text-mobile">
                        <ArrowLeft size={10} /> Back
                      </button>
                      <button onClick={() => { setSelectedText(null); setTextDetail(null); }}
                        className="hidden lg:block p-1 rounded hover:bg-white/5" data-testid="close-text-desktop">
                        <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${selectedText.color}12`, border: `1px solid ${selectedText.color}25` }}
                        animate={{ boxShadow: [`0 0 0px ${selectedText.color}00`, `0 0 20px ${selectedText.color}15`, `0 0 0px ${selectedText.color}00`] }}
                        transition={{ repeat: Infinity, duration: 3 }}>
                        <BookOpen size={22} style={{ color: selectedText.color }} />
                      </motion.div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
                          {selectedText.title}
                        </p>
                        <div className="flex items-center gap-3 text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                          <span>{selectedText.tradition}</span>
                          <span>&middot;</span>
                          <span>{selectedText.region}</span>
                          <span>&middot;</span>
                          <span>{selectedText.era}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.45)' }}>
                      {selectedText.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${selectedText.color}08`, border: `1px solid ${selectedText.color}12` }}>
                        <Maximize2 size={10} style={{ color: selectedText.color }} />
                        <span className="text-[9px]" style={{ color: selectedText.color }}>VR Immersive Mode</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${selectedText.color}08`, border: `1px solid ${selectedText.color}12` }}>
                        <Volume2 size={10} style={{ color: selectedText.color }} />
                        <span className="text-[9px]" style={{ color: selectedText.color }}>HD Narration</span>
                      </div>
                    </div>
                  </div>

                  {/* Chapters */}
                  <div className="px-6 pb-6">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5 mt-2"
                      style={{ color: 'rgba(248,250,252,0.25)' }}>
                      <Layers size={9} /> Chapters
                    </p>

                    {detailLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin" size={16} style={{ color: selectedText.color }} />
                      </div>
                    ) : textDetail ? (
                      <div>
                        <ChapterList text={selectedText} chapters={textDetail.chapters}
                          onGenerate={generateChapter} onRead={setReadingChapter} onVR={openVR} generating={generating} />

                        {/* Inline Reader — shows text content below chapter list */}
                        <AnimatePresence>
                          {readingChapter && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <InlineReader
                                chapter={readingChapter}
                                text={selectedText}
                                textDetail={textDetail}
                                onClose={() => setReadingChapter(null)}
                                onVR={(ch) => { setReadingChapter(null); openVR(ch); }}
                                authHeaders={authHeaders}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* VR Immersive Reader */}
      <AnimatePresence>
        {vrChapter && textDetail && (
          <VRImmersiveReader
            chapter={vrChapter}
            text={textDetail}
            onClose={() => setVrChapter(null)}
            authHeaders={authHeaders}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
