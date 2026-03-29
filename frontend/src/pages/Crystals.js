import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommunityComments from '../components/CommunityComments';
import {
  ArrowLeft, Search, X, Loader2, Volume2, VolumeX, Play, Pause,
  Sparkles, ChevronRight, Maximize2, Minimize2, Gem, Heart, Shield,
  Sun, Moon, Droplets, Wind, Eye, Flame, Star, Zap, Compass,
  Plus, Pickaxe, MapPin, Package, Headphones, RefreshCw, Brain, Share2, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CHAKRA_COLORS = {
  Root: '#EF4444', Sacral: '#F97316', 'Solar Plexus': '#EAB308',
  Heart: '#22C55E', Throat: '#3B82F6', 'Third Eye': '#8B5CF6', Crown: '#A855F7',
};

const ELEMENT_ICONS = {
  Fire: Flame, Water: Droplets, Air: Wind, Earth: Compass,
  'Fire, Earth': Flame, 'Water': Droplets, 'Earth, Air, Fire': Compass,
  'Earth, Fire': Flame, Wind: Wind, All: Star,
};

/* ═══════════════════════════════════════
   CRYSTAL PARTICLES
   ═══════════════════════════════════════ */
function CrystalParticles({ color, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1, speedX: (Math.random() - 0.5) * 0.2,
      speedY: -Math.random() * 0.25 - 0.05, opacity: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2, facets: Math.floor(Math.random() * 3) + 4,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX + Math.sin(p.phase) * 0.1; p.y += p.speedY; p.phase += 0.006;
        p.opacity = 0.06 + Math.sin(p.phase) * 0.1;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.globalAlpha = p.opacity; ctx.fillStyle = color; ctx.strokeStyle = color;
        ctx.beginPath();
        // Diamond/crystal shape
        const s = p.size;
        ctx.moveTo(p.x, p.y - s * 1.5);
        ctx.lineTo(p.x + s, p.y);
        ctx.lineTo(p.x, p.y + s * 0.8);
        ctx.lineTo(p.x - s, p.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = p.opacity * 0.5;
        ctx.stroke();
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [active, color]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" style={{ opacity: 0.6 }} />;
}

/* ═══════════════════════════════════════
   AUDIO NARRATOR
   ═══════════════════════════════════════ */
function CrystalNarrator({ crystalId, color }) {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const play = async () => {
    if (state === 'paused' && audioRef.current) { audioRef.current.play(); setState('playing'); return; }
    setState('loading');
    try {
      const res = await axios.post(`${API}/crystals/${crystalId}/narrate`, {}, { timeout: 90000 });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;
      audio.onended = () => { setState('idle'); setProgress(0); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.play(); setState('playing');
    } catch { toast.error('Failed to generate crystal narration'); setState('idle'); }
  };
  const pause = () => { if (audioRef.current) audioRef.current.pause(); setState('paused'); };
  const stop = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setState('idle'); setProgress(0); };
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }}
      data-testid={`narrator-${crystalId}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'idle' ? (
          <button onClick={play} className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Volume2 size={10} />
            </div>
            Listen to Crystal Guide
          </button>
        ) : state === 'loading' ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
            <Loader2 size={12} className="animate-spin" style={{ color }} /> Channeling crystal energy...
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
            <button onClick={stop} className="p-1"><VolumeX size={10} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   VR CRYSTAL MEDITATION VIEW
   ═══════════════════════════════════════ */
function VRCrystalView({ crystal, onClose }) {
  const [revealed, setRevealed] = useState(0);
  const [showParticles, setShowParticles] = useState(true);
  const sections = ['desc', 'spiritual', 'healing', 'uses', 'info'];

  useEffect(() => {
    setRevealed(0);
    let i = 0;
    const timer = setInterval(() => { i++; setRevealed(i); if (i >= sections.length) clearInterval(timer); }, 500);
    return () => clearInterval(timer);
  }, [crystal.id]);

  const chakras = crystal.chakra.split(', ');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden" data-testid="vr-crystal-view"
      style={{ background: '#06070E' }}>
      <CrystalParticles color={crystal.color} active={showParticles} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${crystal.color}08 0%, transparent 60%)` }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(6,7,14,0.9) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} data-testid="close-vr-crystal" className="p-2 rounded-lg hover:bg-white/5">
            <Minimize2 size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: crystal.color }}>{crystal.aka}</p>
            <p className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif' }}>{crystal.name}</p>
          </div>
        </div>
        <button onClick={() => setShowParticles(p => !p)} className="p-1.5 rounded-lg"
          style={{ background: showParticles ? `${crystal.color}10` : 'rgba(255,255,255,0.04)', color: showParticles ? crystal.color : 'rgba(248,250,252,0.2)' }}>
          <Sparkles size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6 pt-20 pb-20" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-xl mx-auto">
          {/* Crystal orb */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1, type: 'spring' }}
            className="text-center mb-10">
            <motion.div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative"
              style={{ background: `${crystal.color}15`, border: `2px solid ${crystal.color}30`, boxShadow: `0 0 60px ${crystal.color}15, inset 0 0 30px ${crystal.color}10` }}
              animate={{ boxShadow: [`0 0 60px ${crystal.color}10, inset 0 0 30px ${crystal.color}05`, `0 0 80px ${crystal.color}20, inset 0 0 40px ${crystal.color}15`, `0 0 60px ${crystal.color}10, inset 0 0 30px ${crystal.color}05`] }}
              transition={{ repeat: Infinity, duration: 3 }}>
              <Gem size={40} style={{ color: crystal.color }} />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{crystal.name}</h1>
            <p className="text-xs" style={{ color: crystal.color }}>"{crystal.aka}"</p>
            {/* Chakras */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {chakras.map((ch, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-[9px]"
                  style={{ background: `${CHAKRA_COLORS[ch.trim()] || crystal.color}15`, border: `1px solid ${CHAKRA_COLORS[ch.trim()] || crystal.color}25`, color: CHAKRA_COLORS[ch.trim()] || crystal.color }}>
                  {ch.trim()} Chakra
                </span>
              ))}
            </div>
          </motion.div>

          {/* Narration */}
          <div className="mb-6">
            <CrystalNarrator crystalId={crystal.id} color={crystal.color} />
          </div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
            animate={0 < revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8 }} className="mb-8">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: 'rgba(248,250,252,0.2)' }}>Essence</p>
            <p className="text-base leading-[1.9] text-center"
              style={{ color: 'rgba(248,250,252,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
              {crystal.description}
            </p>
          </motion.div>

          {/* Spiritual */}
          <motion.div initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
            animate={1 < revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8 }}
            className="rounded-xl p-5 mb-5" style={{ background: `${crystal.color}04`, border: `1px solid ${crystal.color}10` }}>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: crystal.color }}>
              <Eye size={9} /> Spiritual Significance
            </p>
            <p className="text-sm leading-[1.85] italic" style={{ color: 'rgba(248,250,252,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
              {crystal.spiritual}
            </p>
          </motion.div>

          {/* Healing */}
          <motion.div initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
            animate={2 < revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8 }}
            className="rounded-xl p-5 mb-5" style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: 'rgba(248,250,252,0.3)' }}>
              <Heart size={9} /> Healing Properties
            </p>
            <p className="text-sm leading-[1.85]" style={{ color: 'rgba(248,250,252,0.55)', fontFamily: 'Cormorant Garamond, serif' }}>
              {crystal.healing}
            </p>
          </motion.div>

          {/* Uses */}
          <motion.div initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
            animate={3 < revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8 }} className="mb-8">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: 'rgba(248,250,252,0.2)' }}>Best Used For</p>
            <div className="flex flex-wrap justify-center gap-2">
              {crystal.uses?.map((u, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="px-4 py-2 rounded-xl text-xs"
                  style={{ background: `${crystal.color}08`, border: `1px solid ${crystal.color}15`, color: crystal.color }}>
                  {u}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Info grid */}
          <motion.div initial={{ opacity: 0 }}
            animate={4 < revealed ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Element', value: crystal.element, icon: Flame },
              { label: 'Zodiac', value: crystal.zodiac, icon: Star },
              { label: 'Hardness', value: `${crystal.hardness}/10`, icon: Shield },
              { label: 'Rarity', value: crystal.rarity, icon: Gem },
            ].map((item, i) => (
              <div key={i} className="rounded-lg p-3 text-center" style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <item.icon size={12} className="mx-auto mb-1" style={{ color: 'rgba(248,250,252,0.2)' }} />
                <p className="text-[9px] uppercase mb-0.5" style={{ color: 'rgba(248,250,252,0.2)' }}>{item.label}</p>
                <p className="text-xs capitalize" style={{ color: 'rgba(248,250,252,0.6)' }}>{item.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   CRYSTAL CARD
   ═══════════════════════════════════════ */
function CrystalCard({ crystal, onClick, onVR, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 200, damping: 25 }}
      data-testid={`crystal-card-${crystal.id}`}
      className="rounded-2xl p-4 group relative overflow-hidden"
      style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.04)', backdropFilter: 'blur(8px)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${crystal.color}06 0%, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${crystal.color}10`, border: `1px solid ${crystal.color}15` }}
            whileHover={{ scale: 1.1, rotate: 5 }}>
            <Gem size={18} style={{ color: crystal.color }} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#F8FAFC' }}>{crystal.name}</p>
            <p className="text-[10px]" style={{ color: crystal.color }}>{crystal.aka}</p>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ color: 'rgba(248,250,252,0.35)' }}>{crystal.description}</p>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {crystal.chakra.split(', ').slice(0, 2).map((ch, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[8px]"
              style={{ background: `${CHAKRA_COLORS[ch.trim()] || crystal.color}10`, color: CHAKRA_COLORS[ch.trim()] || crystal.color }}>{ch.trim()}</span>
          ))}
          <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.2)' }}>{crystal.element}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onClick(crystal)} data-testid={`view-crystal-${crystal.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all hover:bg-white/[0.02]"
            style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.5)' }}>
            <ChevronRight size={10} /> Details
          </button>
          <button onClick={() => onVR(crystal)} data-testid={`vr-crystal-${crystal.id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all group/vr"
            style={{ background: `${crystal.color}08`, border: `1px solid ${crystal.color}15`, color: crystal.color }}>
            <Maximize2 size={10} className="group-hover/vr:scale-110 transition-transform" /> VR
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   CRYSTAL DETAIL (INLINE)
   ═══════════════════════════════════════ */
function CrystalDetail({ crystal, onClose, onVR, onAddCollection }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="w-full lg:w-2/5 lg:sticky lg:top-24 lg:max-h-[80vh] lg:overflow-y-auto" data-testid="crystal-detail">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,17,28,0.6)', border: `1px solid ${crystal.color}15`, backdropFilter: 'blur(12px)' }}>
        <div className="p-5 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${crystal.color}06 0%, transparent 100%)` }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={onClose} className="lg:hidden flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg hover:bg-white/5"
              style={{ color: 'rgba(248,250,252,0.4)' }}><ArrowLeft size={10} /> Back</button>
            <button onClick={onClose} className="hidden lg:block p-1 rounded hover:bg-white/5"><X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <motion.div className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: `${crystal.color}12`, border: `1px solid ${crystal.color}25` }}
              animate={{ boxShadow: [`0 0 0px ${crystal.color}00`, `0 0 20px ${crystal.color}15`, `0 0 0px ${crystal.color}00`] }}
              transition={{ repeat: Infinity, duration: 3 }}>
              <Gem size={26} style={{ color: crystal.color }} />
            </motion.div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{crystal.name}</p>
              <p className="text-[11px]" style={{ color: crystal.color }}>{crystal.aka}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onVR(crystal)} data-testid="enter-vr-crystal-detail"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium group"
              style={{ background: `${crystal.color}10`, border: `1px solid ${crystal.color}20`, color: crystal.color }}>
              <Maximize2 size={10} className="group-hover:scale-110 transition-transform" /> VR Meditation Mode
            </button>
            <button onClick={() => onAddCollection(crystal.id)} data-testid="add-collection-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px]"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.4)' }}>
              <Plus size={10} /> Collection
            </button>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="mb-4"><CrystalNarrator crystalId={crystal.id} color={crystal.color} /></div>
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Description</p>
            <p className="text-sm leading-[1.8]" style={{ color: 'rgba(248,250,252,0.55)', fontFamily: 'Cormorant Garamond, serif' }}>{crystal.description}</p>
          </div>
          <div className="rounded-xl p-4 mb-4" style={{ background: `${crystal.color}04`, border: `1px solid ${crystal.color}08` }}>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: crystal.color }}>Spiritual</p>
            <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(248,250,252,0.6)' }}>{crystal.spiritual}</p>
          </div>
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Healing</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.45)' }}>{crystal.healing}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {crystal.uses?.map((u, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[9px]"
                style={{ background: `${crystal.color}06`, border: `1px solid ${crystal.color}10`, color: crystal.color }}>{u}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Chakra', value: crystal.chakra },
              { label: 'Element', value: crystal.element },
              { label: 'Zodiac', value: crystal.zodiac },
              { label: 'Hardness', value: `${crystal.hardness}/10 (${crystal.rarity})` },
            ].map((item, i) => (
              <div key={i} className="rounded-lg p-2.5" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[8px] uppercase" style={{ color: 'rgba(248,250,252,0.2)' }}>{item.label}</p>
                <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.5)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   ROCK HOUND PANEL
   ═══════════════════════════════════════ */
function RockHoundPanel({ token, headers }) {
  const [environments, setEnvironments] = useState([]);
  const [digging, setDigging] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/crystals/rockhound/environments`, { headers }).then(r => setEnvironments(r.data.environments || [])).catch(() => {});
  }, [token]);

  const dig = async (envId) => {
    setDigging(true); setResult(null);
    try {
      const r = await axios.post(`${API}/crystals/rockhound/dig`, { environment_id: envId }, { headers });
      setResult(r.data);
      if (r.data.found) toast.success(`Found ${r.data.crystal?.name}!`);
      else toast('Nothing this time...keep digging!');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Dig failed');
    }
    setDigging(false);
  };

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,250,252,0.25)' }}>
        <Pickaxe size={9} className="inline mr-1" /> Virtual Rock Hounding
      </p>
      {!token ? (
        <p className="text-xs text-center py-6" style={{ color: 'rgba(248,250,252,0.3)' }}>Sign in to go rock hounding</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {environments.map(env => (
            <motion.div key={env.id} whileHover={{ y: -2 }}
              className="rounded-xl p-4 cursor-pointer group" onClick={() => !digging && dig(env.id)}
              data-testid={`env-${env.id}`}
              style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={12} style={{ color: '#C084FC' }} />
                <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{env.name}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded ml-auto capitalize" style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.25)' }}>{env.difficulty}</span>
              </div>
              <p className="text-[10px] mb-2" style={{ color: 'rgba(248,250,252,0.3)' }}>{env.description}</p>
              <button disabled={digging}
                className="w-full py-2 rounded-lg text-[10px] font-medium transition-all"
                style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC', opacity: digging ? 0.5 : 1 }}>
                {digging ? <Loader2 size={12} className="animate-spin mx-auto" /> : <><Pickaxe size={10} className="inline mr-1" /> Dig Here</>}
              </button>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 rounded-xl p-4 text-center"
            style={{ background: result.found ? 'rgba(34,197,94,0.04)' : 'rgba(248,250,252,0.02)', border: `1px solid ${result.found ? 'rgba(34,197,94,0.15)' : 'rgba(248,250,252,0.06)'}` }}>
            {result.found ? (
              <>
                <Gem size={24} className="mx-auto mb-2" style={{ color: result.crystal?.color || '#22C55E' }} />
                <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{result.crystal?.name}</p>
                <p className="text-[10px] mt-1" style={{ color: result.crystal?.color }}>{result.crystal?.aka}</p>
                {result.is_new && <p className="text-[9px] mt-2 px-2 py-0.5 rounded inline-block" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>New Discovery!</p>}
              </>
            ) : (
              <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>No crystals found... try again!</p>
            )}
            <p className="text-[9px] mt-2" style={{ color: 'rgba(248,250,252,0.2)' }}>{result.digs_remaining} digs remaining today</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   CRYSTAL PAIRING AI
   ═══════════════════════════════════════ */
function CrystalPairingPanel({ token, headers }) {
  const [moods, setMoods] = useState([]);
  const [intentions, setIntentions] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedIntention, setSelectedIntention] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [narrating, setNarrating] = useState(false);
  const [audioRef] = useState({ current: null });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/crystals/pairing/options`).then(r => {
      setMoods(r.data.moods || []);
      setIntentions(r.data.intentions || []);
    }).catch(() => {});
    if (token) {
      axios.get(`${API}/crystals/pairing/history`, { headers }).then(r => setHistory(r.data.pairings || [])).catch(() => {});
    }
  }, [token]);

  const generatePairing = async () => {
    if (!selectedMood && !selectedIntention) { toast.error('Select a mood or intention'); return; }
    setLoading(true); setResult(null);
    try {
      const r = await axios.post(`${API}/crystals/pairing`, {
        mood: selectedMood, intention: selectedIntention, custom_note: customNote,
      }, { headers });
      setResult(r.data);
      // Refresh history
      axios.get(`${API}/crystals/pairing/history`, { headers }).then(r2 => setHistory(r2.data.pairings || [])).catch(() => {});
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to generate pairing'); }
    setLoading(false);
  };

  const narratePairing = async () => {
    if (!result?.explanation) return;
    setNarrating(true);
    try {
      const r = await axios.post(`${API}/crystals/pairing/narrate`, { text: result.explanation }, { headers });
      if (r.data.audio) {
        if (audioRef.current) { audioRef.current.pause(); }
        const audio = new Audio(`data:audio/mp3;base64,${r.data.audio}`);
        audioRef.current = audio;
        audio.play();
      }
    } catch { toast.error('Narration unavailable'); }
    setNarrating(false);
  };

  return (
    <div data-testid="crystal-pairing-panel">
      <p className="text-[9px] uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(248,250,252,0.25)' }}>
        <Brain size={9} className="inline mr-1" /> AI Crystal Pairing
      </p>

      {!token ? (
        <p className="text-xs text-center py-6" style={{ color: 'rgba(248,250,252,0.3)' }}>Sign in to get personalized crystal pairings</p>
      ) : (
        <div className="space-y-4">
          {/* Mood selection */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'rgba(248,250,252,0.25)' }}>
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-1.5" data-testid="mood-picker">
              {moods.map(m => (
                <button key={m} onClick={() => setSelectedMood(selectedMood === m ? '' : m)}
                  className="px-3 py-1.5 rounded-full text-[10px] transition-all"
                  style={{
                    background: selectedMood === m ? 'rgba(168,85,247,0.12)' : 'rgba(15,17,28,0.6)',
                    color: selectedMood === m ? '#A855F7' : 'rgba(248,250,252,0.35)',
                    border: `1px solid ${selectedMood === m ? 'rgba(168,85,247,0.25)' : 'rgba(248,250,252,0.04)'}`,
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Intention selection */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'rgba(248,250,252,0.25)' }}>
              What is your intention?
            </label>
            <div className="flex flex-wrap gap-1.5" data-testid="intention-picker">
              {intentions.map(i => (
                <button key={i} onClick={() => setSelectedIntention(selectedIntention === i ? '' : i)}
                  className="px-3 py-1.5 rounded-full text-[10px] transition-all"
                  style={{
                    background: selectedIntention === i ? 'rgba(45,212,191,0.12)' : 'rgba(15,17,28,0.6)',
                    color: selectedIntention === i ? '#2DD4BF' : 'rgba(248,250,252,0.35)',
                    border: `1px solid ${selectedIntention === i ? 'rgba(45,212,191,0.25)' : 'rgba(248,250,252,0.04)'}`,
                  }}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Custom note */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'rgba(248,250,252,0.25)' }}>
              Additional context (optional)
            </label>
            <input value={customNote} onChange={e => setCustomNote(e.target.value)}
              placeholder="E.g., preparing for a new job, healing from heartbreak..."
              className="w-full px-4 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }}
              data-testid="pairing-custom-note" />
          </div>

          {/* Generate button */}
          <button onClick={generatePairing} disabled={loading || (!selectedMood && !selectedIntention)}
            className="w-full py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}
            data-testid="generate-pairing-btn">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
            {loading ? 'Consulting the crystals...' : 'Find My Crystal Match'}
          </button>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3" data-testid="pairing-result">
                {/* Matched crystals */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(result.crystals || []).map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl p-4 text-center"
                      style={{ background: 'rgba(15,17,28,0.5)', border: `1px solid ${c.color}20` }}>
                      <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                        style={{ background: `${c.color}15`, boxShadow: `0 0 30px ${c.color}10` }}>
                        <Gem size={20} style={{ color: c.color }} />
                      </div>
                      <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{c.name}</p>
                      <p className="text-[9px]" style={{ color: c.color }}>{c.aka}</p>
                      <p className="text-[8px] mt-1" style={{ color: 'rgba(248,250,252,0.3)' }}>{c.chakra} Chakra</p>
                    </motion.div>
                  ))}
                </div>

                {/* AI explanation */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#A855F7' }}>Crystal Guidance</p>
                    <div className="flex items-center gap-1.5">
                      <SharePairingButton result={result} />
                      <button onClick={narratePairing} disabled={narrating}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] transition-all"
                        style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', color: '#A855F7' }}
                        data-testid="narrate-pairing-btn">
                        {narrating ? <Loader2 size={10} className="animate-spin" /> : <Headphones size={10} />}
                        Listen
                      </button>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {result.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] mb-2 mt-4" style={{ color: 'rgba(248,250,252,0.2)' }}>
                Recent Pairings
              </p>
              <div className="space-y-2">
                {history.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="rounded-lg p-3 flex items-center gap-3"
                    style={{ background: 'rgba(15,17,28,0.3)', border: '1px solid rgba(248,250,252,0.03)' }}
                    data-testid={`history-pairing-${i}`}>
                    <div className="flex -space-x-1">
                      {(p.crystals || []).slice(0, 3).map(c => (
                        <div key={c.id} className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `${c.color}20`, border: `1px solid ${c.color}30` }}>
                          <Gem size={10} style={{ color: c.color }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] truncate" style={{ color: 'rgba(248,250,252,0.6)' }}>
                        {(p.crystals || []).map(c => c.name).join(', ')}
                      </p>
                      <p className="text-[8px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                        {p.mood && `Mood: ${p.mood}`}{p.mood && p.intention && ' · '}{p.intention && `Intent: ${p.intention}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Crystals() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [crystals, setCrystals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [vrCrystal, setVrCrystal] = useState(null);
  const [activeTab, setActiveTab] = useState('encyclopedia');
  const [collection, setCollection] = useState([]);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    axios.get(`${API}/crystals`).then(r => {
      setCrystals(r.data.crystals || []);
      setCategories(r.data.categories || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (token && activeTab === 'collection') {
      axios.get(`${API}/crystals/collection/mine`, { headers }).then(r => setCollection(r.data.collection || [])).catch(() => {});
    }
  }, [token, activeTab]);

  const searchCrystals = useCallback(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (searchQuery) params.set('search', searchQuery);
    axios.get(`${API}/crystals?${params}`).then(r => setCrystals(r.data.crystals || []));
  }, [category, searchQuery]);

  useEffect(() => { searchCrystals(); }, [category, searchQuery]);

  const addToCollection = async (crystalId) => {
    if (!token) { toast.error('Sign in to add to collection'); return; }
    try {
      await axios.post(`${API}/crystals/collection/add`, { crystal_id: crystalId }, { headers });
      toast.success('Added to your collection');
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to add'); }
  };

  const tabs = [
    { id: 'encyclopedia', label: 'Crystal Guide', icon: Gem },
    { id: 'pairing', label: 'Crystal Pairing', icon: Brain },
    { id: 'collection', label: 'My Collection', icon: Package },
    { id: 'rockhound', label: 'Rock Hounding', icon: Pickaxe },
  ];

  return (
    <div className="min-h-screen immersive-page pt-20 pb-12 px-4" data-testid="crystals-page" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5" data-testid="back-btn">
              <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                Crystals & Stones
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                12 sacred crystals &middot; VR meditation mode &middot; HD voice guide
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
            <Maximize2 size={12} style={{ color: '#A855F7' }} />
            <span className="text-[10px]" style={{ color: '#A855F7' }}>VR crystal meditation</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.04)' }}>
          {tabs.map(tab => {
            const TIcon = tab.icon; const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}
                className="flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: isActive ? '#F8FAFC' : 'rgba(248,250,252,0.35)' }}>
                {isActive && <motion.div layoutId="crystalTab" className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <span className="relative z-10 flex items-center gap-2"><TIcon size={14} />{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ENCYCLOPEDIA TAB */}
          {activeTab === 'encyclopedia' && (
            <motion.div key="enc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              {/* Search + Category */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.2)' }} />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search crystals..."
                    data-testid="crystal-search"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none"
                    style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }} />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>}
                </div>
                <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} data-testid={`cat-${cat}`}
                      className="px-3 py-2 rounded-xl text-[10px] font-medium capitalize whitespace-nowrap transition-all"
                      style={{ background: category === cat ? 'rgba(168,85,247,0.12)' : 'rgba(15,17,28,0.6)', border: `1px solid ${category === cat ? 'rgba(168,85,247,0.25)' : 'rgba(248,250,252,0.04)'}`, color: category === cat ? '#A855F7' : 'rgba(248,250,252,0.4)' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <div className={`transition-all ${selected ? 'hidden lg:block lg:w-3/5' : 'w-full'}`}>
                  {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={20} style={{ color: '#A855F7' }} /></div>
                  ) : crystals.length === 0 ? (
                    <div className="text-center py-16"><Gem size={28} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.15)' }} /><p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No crystals found</p></div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {crystals.map((c, i) => <CrystalCard key={c.id} crystal={c} onClick={setSelected} onVR={setVrCrystal} index={i} />)}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {selected && <CrystalDetail crystal={selected} onClose={() => setSelected(null)} onVR={setVrCrystal} onAddCollection={addToCollection} />}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* COLLECTION TAB */}
          {activeTab === 'collection' && (
            <motion.div key="coll" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              {!token ? (
                <p className="text-center text-xs py-12" style={{ color: 'rgba(248,250,252,0.3)' }}>Sign in to view your crystal collection</p>
              ) : collection.length === 0 ? (
                <div className="text-center py-16"><Package size={28} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.15)' }} /><p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>Your collection is empty</p><p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.2)' }}>Browse the Crystal Guide or go Rock Hounding</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.map((entry, i) => {
                    const crystal = crystals.find(c => c.id === entry.crystal_id);
                    if (!crystal) return null;
                    return <CrystalCard key={entry.id} crystal={crystal} onClick={setSelected} onVR={setVrCrystal} index={i} />;
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ROCK HOUNDING TAB */}
          {activeTab === 'rockhound' && (
            <motion.div key="rock" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <RockHoundPanel token={token} headers={headers} />
            </motion.div>
          )}

          {/* CRYSTAL PAIRING TAB */}
          {activeTab === 'pairing' && (
            <motion.div key="pair" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <CrystalPairingPanel token={token} headers={headers} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Community Comments */}
        <CommunityComments feature="crystals" title="Crystal Community" />
      </div>

      <AnimatePresence>
        {vrCrystal && <VRCrystalView crystal={vrCrystal} onClose={() => setVrCrystal(null)} />}
      </AnimatePresence>
    </div>
  );
}


function SharePairingButton({ result }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!result) return;
    const crystalNames = (result.crystals || []).map(c => c.name).join(', ');
    const text = `My Crystal Pairing from The Cosmic Collective:\n${crystalNames}\n\n"${result.explanation?.substring(0, 150)}..."\n\nDiscover your cosmic crystals at ${window.location.origin}/crystals`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Crystal Pairing', text });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button onClick={handleShare}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] transition-all"
      style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}
      data-testid="share-pairing-btn">
      {copied ? <Check size={10} /> : <Share2 size={10} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
