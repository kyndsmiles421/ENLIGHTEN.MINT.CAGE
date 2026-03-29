import React, { useState, useEffect, useRef, useCallback } from 'react';
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
   CHAPTER LIST
   ══════════════════════════════════════ */
function ChapterList({ text, chapters, onGenerate, onRead, generating }) {
  return (
    <div className="space-y-2">
      {chapters.map((ch, i) => (
        <motion.div key={ch.id}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          data-testid={`chapter-${ch.id}`}
          className="rounded-xl p-4 cursor-pointer group relative overflow-hidden"
          style={{ background: ch.generated ? `rgba(15,17,28,0.4)` : 'rgba(15,17,28,0.3)', border: `1px solid ${ch.generated ? text.color + '12' : 'rgba(248,250,252,0.04)'}` }}
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
                {ch.generated ? 'Tap to read in VR mode' : 'Tap to generate with AI'}
              </p>
            </div>
            {generating === ch.id ? (
              <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: text.color }} />
            ) : ch.generated ? (
              <div className="flex items-center gap-1.5">
                <Maximize2 size={12} style={{ color: text.color, opacity: 0.6 }} />
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
      ))}
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
          {/* Text grid */}
          <div className={`transition-all duration-300 ${selectedText ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <BookOpen size={28} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No texts match your search</p>
              </div>
            )}
            <div className={`grid gap-4 ${selectedText ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {filtered.map((text, i) => <TextCard key={text.id} text={text} onSelect={selectText} index={i} />)}
            </div>
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
                      <ChapterList text={selectedText} chapters={textDetail.chapters}
                        onGenerate={generateChapter} onRead={openVR} generating={generating} />
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
