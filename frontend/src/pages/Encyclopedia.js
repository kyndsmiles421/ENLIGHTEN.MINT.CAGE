import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, BookOpen, Volume2, VolumeX, Loader2, Pause, Play,
  Sparkles, ChevronRight, Search, X, Globe, Eye, Maximize2, Minimize2,
  Headphones, Users, ScrollText, Compass, Feather, Star, Flame, Moon, Wind, Droplets
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const TRADITION_THEMES = {
  hinduism: { colors: ['#FB923C', '#FBBF24', '#F59E0B'], icon: Flame },
  buddhism: { colors: ['#FCD34D', '#FBBF24', '#F59E0B'], icon: Droplets },
  taoism: { colors: ['#22C55E', '#34D399', '#10B981'], icon: Wind },
  sufism: { colors: ['#E879F9', '#D946EF', '#C026D3'], icon: Sparkles },
  kabbalah: { colors: ['#818CF8', '#A78BFA', '#7C3AED'], icon: Star },
  indigenous: { colors: ['#DC2626', '#EF4444', '#F87171'], icon: Globe },
  mystical_christianity: { colors: ['#3B82F6', '#60A5FA', '#2563EB'], icon: Moon },
  egyptian: { colors: ['#EAB308', '#FACC15', '#CA8A04'], icon: Eye },
  greek_philosophy: { colors: ['#06B6D4', '#22D3EE', '#0891B2'], icon: Compass },
  zen: { colors: ['#78716C', '#A8A29E', '#57534E'], icon: Feather },
  yoga_tantra: { colors: ['#A855F7', '#C084FC', '#9333EA'], icon: Flame },
  african: { colors: ['#F97316', '#FB923C', '#EA580C'], icon: Globe },
};

/* ═══════════════════════════════════════
   AMBIENT PARTICLES
   ═══════════════════════════════════════ */
function AmbientParticles({ colors, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('encyclopedia', 8); }, []);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5, speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.3 - 0.05, opacity: Math.random() * 0.35 + 0.05,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX + Math.sin(p.phase) * 0.15; p.y += p.speedY; p.phase += 0.008;
        p.opacity = 0.08 + Math.sin(p.phase) * 0.12;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [active, colors]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" style={{ opacity: 0.6 }} />;
}

/* ═══ INTERACTIVE CONCEPT CARD ═══ */
function ConceptCard({ concept, color, index, revealedItems, tradition, compact }) {
  const [expanded, setExpanded] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [insight, setInsight] = useState(null);

  const deepExplore = async () => {
    setExploring(true);
    try {
      const res = await axios.post(`${API}/encyclopedia/explore`, {
        tradition: tradition.name || tradition.id, concept: concept.name, question: ''
      });
      setInsight(res.data);
    } catch { toast.error('Could not explore deeper'); }
    setExploring(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: compact ? 0 : -15, filter: 'blur(4px)' }}
      animate={index + 1 < revealedItems ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      onClick={() => setExpanded(!expanded)}
      className="rounded-xl p-4 cursor-pointer transition-all"
      style={{
        background: expanded ? `${color}08` : `${color}04`,
        border: `1px solid ${expanded ? `${color}20` : `${color}08`}`,
        boxShadow: expanded ? `0 0 20px ${color}06` : 'none',
      }}
      data-testid={`concept-${concept.name?.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium mb-1`}
            style={{ color, fontFamily: compact ? 'inherit' : 'Cormorant Garamond, serif' }}>
            {concept.name}
          </p>
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} leading-relaxed`} style={{ color: 'rgba(255,255,255,0.75)' }}>
            {concept.desc}
          </p>
        </div>
        <ChevronRight size={12} style={{
          color: expanded ? color : 'rgba(248,250,252,0.15)',
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s',
          flexShrink: 0, marginTop: 4,
        }} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${color}12` }}>
              {insight ? (
                <div className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {insight.exploration || insight.content || JSON.stringify(insight)}
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); deepExplore(); }}
                  disabled={exploring}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                  style={{ background: `${color}08`, border: `1px solid ${color}15`, color, opacity: exploring ? 0.5 : 1 }}
                  data-testid={`explore-${concept.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {exploring ? <Loader2 size={10} className="animate-spin" /> : <Eye size={10} />}
                  {exploring ? 'Exploring...' : `Explore ${concept.name} deeper`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


/* ═══════════════════════════════════════
   AUDIO NARRATOR
   ═══════════════════════════════════════ */
function AudioNarrator({ endpoint, payload, color, label = 'Listen' }) {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const play = async () => {
    if (state === 'paused' && audioRef.current) { audioRef.current.play(); setState('playing'); return; }
    setState('loading');
    try {
      const res = typeof payload === 'object'
        ? await axios.post(`${API}${endpoint}`, payload, { timeout: 90000 })
        : await axios.post(`${API}${endpoint}`, {}, { timeout: 90000 });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;
      audio.onended = () => { setState('idle'); setProgress(0); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.play(); setState('playing');
    } catch { toast.error('Failed to generate narration'); setState('idle'); }
  };

  const pause = () => { if (audioRef.current) audioRef.current.pause(); setState('paused'); };
  const stop = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setState('idle'); setProgress(0); };

  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'idle' ? (
          <button onClick={play} data-testid="play-narrator"
            className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Volume2 size={10} />
            </div>
            {label}
          </button>
        ) : state === 'loading' ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Loader2 size={12} className="animate-spin" style={{ color }} /> Channeling the voice...
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
            <button onClick={stop} className="p-1"><VolumeX size={10} style={{ color: 'rgba(255,255,255,0.65)' }} /></button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   VR IMMERSIVE TRADITION VIEW
   ═══════════════════════════════════════ */
function VRTraditionView({ tradition, exploreResult, onClose, onExplore, exploring }) {
  const [revealedItems, setRevealedItems] = useState(0);
  const [showParticles, setShowParticles] = useState(true);
  const [question, setQuestion] = useState('');
  const theme = TRADITION_THEMES[tradition.id] || { colors: ['#C084FC', '#A78BFA', '#8B5CF6'], icon: BookOpen };

  useEffect(() => {
    setRevealedItems(0);
    let i = 0;
    const total = tradition.key_concepts.length + 3;
    const timer = setInterval(() => { i++; setRevealedItems(i); if (i >= total) clearInterval(timer); }, 300);
    return () => clearInterval(timer);
  }, [tradition.id]);

  const handleExplore = () => {
    if (question.trim()) { onExplore(tradition.name, '', question); setQuestion(''); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden" data-testid="vr-tradition-view"
      style={{ background: '#06070E' }}>
      <AmbientParticles colors={theme.colors} active={showParticles} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 30%, ${tradition.color}06 0%, transparent 70%)` }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(6,7,14,0.9) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} data-testid="close-vr-tradition" className="p-2 rounded-lg hover:bg-white/5"><Minimize2 size={16} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: tradition.color }}>{tradition.origin}</p>
            <p className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif' }}>{tradition.name}</p>
          </div>
        </div>
        <button onClick={() => setShowParticles(p => !p)} className="p-1.5 rounded-lg"
          style={{ background: showParticles ? `${tradition.color}10` : 'rgba(255,255,255,0.04)', color: showParticles ? tradition.color : 'rgba(255,255,255,0.6)' }}>
          <Sparkles size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6 pt-20 pb-24" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-center mb-10">
            <motion.div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${tradition.color}10`, border: `1px solid ${tradition.color}20` }}
              animate={{ boxShadow: [`0 0 0px ${tradition.color}00`, `0 0 30px ${tradition.color}12`, `0 0 0px ${tradition.color}00`] }}
              transition={{ repeat: Infinity, duration: 4 }}>
              {React.createElement(theme.icon, { size: 28, style: { color: tradition.color } })}
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{tradition.name}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.65)' }}>{tradition.era} &middot; {tradition.origin}</p>
          </motion.div>

          {/* Narration */}
          <div className="mb-6">
            <AudioNarrator endpoint={`/encyclopedia/traditions/${tradition.id}/narrate`} color={tradition.color} label="Listen to Overview" />
          </div>

          {/* Overview */}
          <motion.p initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={0 < revealedItems ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8 }}
            className="text-base leading-[1.9] mb-8 text-center"
            style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, serif' }}>
            {tradition.overview}
          </motion.p>

          {/* Key Concepts — Interactive */}
          <div className="mb-8">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-4 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>Core Teachings</p>
            <div className="space-y-3">
              {tradition.key_concepts.map((concept, i) => (
                <ConceptCard key={i} concept={concept} color={tradition.color} index={i} revealedItems={revealedItems} tradition={tradition} />
              ))}
            </div>
          </div>

          {/* Sacred Texts & Figures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="rounded-xl p-4" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <ScrollText size={9} /> Sacred Texts
              </p>
              {tradition.sacred_texts?.map((t, i) => (
                <p key={i} className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{t}</p>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
              className="rounded-xl p-4" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Users size={9} /> Notable Figures
              </p>
              {tradition.notable_figures?.map((f, i) => (
                <p key={i} className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</p>
              ))}
            </motion.div>
          </div>

          {/* Practices */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mb-8">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>Practices</p>
            <div className="flex flex-wrap justify-center gap-2">
              {tradition.practices?.map((p, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-[10px]"
                  style={{ background: `${tradition.color}06`, border: `1px solid ${tradition.color}10`, color: `${tradition.color}90` }}>{p}</span>
              ))}
            </div>
          </motion.div>

          {/* AI Exploration */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
            className="rounded-xl p-5" style={{ background: `${tradition.color}04`, border: `1px solid ${tradition.color}12` }}>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: tradition.color }}>
              <Eye size={9} /> Ask the Oracle
            </p>
            <div className="flex gap-2">
              <input value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleExplore()}
                placeholder={`Ask anything about ${tradition.name}...`}
                data-testid="vr-explore-input"
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'rgba(6,7,14,0.6)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }} />
              <button onClick={handleExplore} disabled={exploring || !question.trim()}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                data-testid="vr-explore-btn"
                style={{ background: `${tradition.color}15`, border: `1px solid ${tradition.color}25`, color: tradition.color, opacity: exploring ? 0.5 : 1 }}>
                {exploring ? <Loader2 size={14} className="animate-spin" /> : 'Explore'}
              </button>
            </div>
            {exploreResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="mb-3">
                  <AudioNarrator endpoint="/encyclopedia/narrate-text"
                    payload={{ text: exploreResult, voice: 'fable' }}
                    color={tradition.color} label="Listen to Response" />
                </div>
                {exploreResult.split('\n\n').map((para, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="text-sm leading-[1.85] mb-3"
                    style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {para}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   TRADITION CARD
   ═══════════════════════════════════════ */
function TraditionCard({ t, onClick }) {
  const theme = TRADITION_THEMES[t.id] || { icon: BookOpen };
  const Icon = theme.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      data-testid={`tradition-card-${t.id}`}
      className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
      style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)', backdropFilter: 'none'}}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${t.color}08 0%, transparent 70%)` }} />
      <div className="relative z-10 flex items-center gap-4">
        <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${t.color}10`, border: `1px solid ${t.color}15` }}
          whileHover={{ scale: 1.1, rotate: 5 }}>
          <Icon size={22} style={{ color: t.color }} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{t.name}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <span>{t.origin}</span><span>&middot;</span><span>{t.era}</span>
          </div>
          <p className="text-[11px] mt-1.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{t.overview}</p>
          <div className="flex items-center gap-3 mt-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span>{t.concept_count} teachings</span><span>{t.text_count} texts</span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'rgba(248,250,252,0.1)' }} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Encyclopedia() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [traditions, setTraditions] = useState([]);
  const [activeTradition, setActiveTradition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [exploring, setExploring] = useState(false);
  const [exploreResult, setExploreResult] = useState('');
  const [vrMode, setVrMode] = useState(false);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    axios.get(`${API}/encyclopedia/traditions`)
      .then(r => setTraditions(r.data.traditions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openTradition = async (id) => {
    try {
      const res = await axios.get(`${API}/encyclopedia/traditions/${id}`);
      setActiveTradition(res.data);
      setExploreResult('');
    } catch { toast.error('Could not load tradition'); }
  };

  const explore = useCallback(async (tradition, concept, question) => {
    if (!token) { toast.error('Sign in to explore deeper'); return; }
    setExploring(true); setExploreResult('');
    try {
      const res = await axios.post(`${API}/encyclopedia/explore`, { tradition, concept: concept || '', question: question || '' }, { headers });
      setExploreResult(res.data.response);
    } catch { toast.error('Could not generate exploration'); }
    setExploring(false);
  }, [token]);

  const filtered = traditions.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen immersive-page pt-20 pb-12 px-4" data-testid="encyclopedia-page" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        {!activeTradition ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5" data-testid="back-btn">
                  <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                    World Spiritual Traditions
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {traditions.length} living traditions &middot; VR immersive learning &middot; HD voice narration
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.1)' }}>
                <Maximize2 size={12} style={{ color: '#FB923C' }} />
                <span className="text-[10px]" style={{ color: '#FB923C' }}>VR immersive mode on every tradition</span>
              </div>
            </div>

            <div className="relative mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.6)' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search traditions..." data-testid="encyclopedia-search"
                className="w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none"
                style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }} />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: 'rgba(255,255,255,0.65)' }} /></button>}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" size={20} style={{ color: '#FB923C' }} /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(t => <TraditionCard key={t.id} t={t} onClick={() => openTradition(t.id)} />)}
                {filtered.length === 0 && <p className="text-center text-xs py-8 col-span-2" style={{ color: 'var(--text-muted)' }}>No traditions found</p>}
              </div>
            )}
          </>
        ) : (
          <div>
            {/* Detail Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => { setActiveTradition(null); setExploreResult(''); }} className="p-2 rounded-xl hover:bg-white/5" data-testid="back-to-traditions">
                  <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{activeTradition.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{activeTradition.origin} &middot; {activeTradition.era}</p>
                </div>
              </div>
              <button onClick={() => setVrMode(true)} data-testid="enter-vr-tradition"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all group"
                style={{ background: `${activeTradition.color}10`, border: `1px solid ${activeTradition.color}20`, color: activeTradition.color }}>
                <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                Enter VR Mode
              </button>
            </div>

            {/* Narration */}
            <div className="mb-4">
              <AudioNarrator endpoint={`/encyclopedia/traditions/${activeTradition.id}/narrate`} color={activeTradition.color} label="Listen to Overview" />
            </div>

            {/* Overview */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm leading-[1.8] mb-6"
              style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, serif' }}>
              {activeTradition.overview}
            </motion.p>

            {/* Key Concepts — Interactive */}
            <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Core Teachings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {activeTradition.key_concepts?.map((c, i) => (
                <ConceptCard key={i} concept={c} color={activeTradition.color} index={i} revealedItems={999} tradition={activeTradition} compact />
              ))}
            </div>

            {/* Texts, Figures, Practices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl p-4" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Sacred Texts</p>
                {activeTradition.sacred_texts?.map((t, i) => <p key={i} className="text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{t}</p>)}
              </div>
              <div className="rounded-xl p-4" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Notable Figures</p>
                {activeTradition.notable_figures?.map((f, i) => <p key={i} className="text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</p>)}
              </div>
              <div className="rounded-xl p-4" style={{ background: 'transparent', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Practices</p>
                {activeTradition.practices?.map((p, i) => <p key={i} className="text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{p}</p>)}
              </div>
            </div>

            {/* AI Exploration */}
            <div className="rounded-xl p-5" style={{ background: `${activeTradition.color}04`, border: `1px solid ${activeTradition.color}12` }}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: activeTradition.color }}>
                <Eye size={9} className="inline mr-1" /> Explore Deeper with AI
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {activeTradition.key_concepts?.slice(0, 4).map((c, i) => (
                  <button key={i} onClick={() => explore(activeTradition.name, c.name, '')}
                    className="px-3 py-1.5 rounded-lg text-[10px] transition-all hover:scale-105"
                    style={{ background: `${activeTradition.color}08`, border: `1px solid ${activeTradition.color}12`, color: `${activeTradition.color}90` }}>
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input placeholder={`Ask about ${activeTradition.name}...`}
                  data-testid="explore-input"
                  onKeyDown={e => e.key === 'Enter' && e.target.value && explore(activeTradition.name, '', e.target.value) && (e.target.value = '')}
                  className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'rgba(6,7,14,0.6)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }} />
              </div>
              {exploring && (
                <div className="flex items-center gap-2 mt-4">
                  <Loader2 size={14} className="animate-spin" style={{ color: activeTradition.color }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Channeling ancient wisdom...</span>
                </div>
              )}
              {exploreResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4" id="explore-result">
                  <div className="mb-3">
                    <AudioNarrator endpoint="/encyclopedia/narrate-text" payload={{ text: exploreResult, voice: 'fable' }}
                      color={activeTradition.color} label="Listen to Response" />
                  </div>
                  {exploreResult.split('\n\n').map((p, i) => (
                    <p key={i} className="text-sm leading-[1.8] mb-3" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, serif' }}>{p}</p>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {vrMode && activeTradition && (
          <VRTraditionView tradition={activeTradition} exploreResult={exploreResult}
            onClose={() => setVrMode(false)} onExplore={explore} exploring={exploring} />
        )}
      </AnimatePresence>
    </div>
  );
}
