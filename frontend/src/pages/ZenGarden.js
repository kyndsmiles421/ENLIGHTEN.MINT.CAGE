import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';
import CelebrationBurst from '../components/CelebrationBurst';
import { Sprout, Droplets, CloudRain, Send, Pencil, Fish, TreePine, Flower2, Leaf, Sun, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ========== PLANT DATA ========== */
const PLANT_TYPES = [
  { id: 'lotus', name: 'Sacred Lotus', icon: Flower2, color: '#FDA4AF', stages: ['Seed', 'Sprout', 'Bud', 'Bloom', 'Full Bloom'], growth_time: 5, desc: 'Symbol of purity and spiritual awakening' },
  { id: 'bamboo', name: 'Lucky Bamboo', icon: TreePine, color: '#22C55E', stages: ['Seed', 'Shoot', 'Young', 'Tall', 'Flourishing'], growth_time: 4, desc: 'Resilience, flexibility, and good fortune' },
  { id: 'bonsai', name: 'Zen Bonsai', icon: TreePine, color: '#86EFAC', stages: ['Seed', 'Seedling', 'Sapling', 'Shaped', 'Ancient'], growth_time: 7, desc: 'Patience, harmony, and inner balance' },
  { id: 'fern', name: 'Peace Fern', icon: Leaf, color: '#2DD4BF', stages: ['Spore', 'Fiddlehead', 'Unfurling', 'Lush', 'Majestic'], growth_time: 3, desc: 'New beginnings and shelter from negativity' },
  { id: 'sage', name: 'White Sage', icon: Sprout, color: '#C084FC', stages: ['Seed', 'Sprout', 'Growing', 'Mature', 'Sacred'], growth_time: 5, desc: 'Purification, wisdom, and spiritual cleansing' },
];

/* ========== PLANT CARE SECTION ========== */
function PlantCare({ user, authHeaders }) {
  const [plants, setPlants] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const { playChime } = useSensory();

  const loadPlants = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/zen-garden/plants`, { headers: authHeaders });
      setPlants(res.data);
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { loadPlants(); }, [loadPlants]);

  const addPlant = async (type) => {
    try {
      await axios.post(`${API}/zen-garden/plants`, { plant_type: type.id }, { headers: authHeaders });
      setShowAdd(false);
      loadPlants();
      toast.success(`${type.name} planted!`);
      playChime();
    } catch { toast.error('Could not plant'); }
  };

  const waterPlant = async (plantId) => {
    try {
      const res = await axios.post(`${API}/zen-garden/plants/${plantId}/water`, {}, { headers: authHeaders });
      if (res.data.grew) {
        setCelebrating(true);
        toast.success(`Your plant grew to ${res.data.stage}!`);
      } else {
        toast.success('Watered with love');
      }
      loadPlants();
    } catch { toast.error('Could not water'); }
  };

  if (!user) return (
    <div className="glass-card p-8 text-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to nurture your garden</p>
    </div>
  );

  return (
    <div>
      <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Your Garden</p>
        <button onClick={() => setShowAdd(!showAdd)} className="text-xs px-3 py-1.5 rounded-full transition-all"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
          data-testid="plant-add-btn">
          <Sprout size={12} className="inline mr-1" /> Plant New
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {PLANT_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => addPlant(t)} className="glass-card p-4 text-left group hover:scale-[1.02] transition-transform"
                  data-testid={`plant-type-${t.id}`}>
                  <Icon size={20} style={{ color: t.color }} className="mb-2" />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {plants.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Sprout size={32} style={{ color: 'rgba(34,197,94,0.3)', margin: '0 auto 12px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your garden is empty. Plant your first seed above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plants.map((p, i) => {
            const type = PLANT_TYPES.find(t => t.id === p.plant_type) || PLANT_TYPES[0];
            const Icon = type.icon;
            const stageIdx = type.stages.indexOf(p.stage);
            const progress = ((stageIdx + 1) / type.stages.length) * 100;
            const canWater = !p.watered_today;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-6 relative overflow-hidden group" data-testid={`plant-card-${p.id}`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
                  background: `radial-gradient(circle, ${type.color}08 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }} />
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${type.color}12`, border: `1px solid ${type.color}20` }}>
                    <Icon size={24} style={{ color: type.color, filter: `drop-shadow(0 0 8px ${type.color}60)` }} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{type.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: type.color }}>{p.stage}</p>
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${type.color}60, ${type.color})` }}
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      Stage {stageIdx + 1} of {type.stages.length} &middot; Watered {p.water_count}x
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => canWater && waterPlant(p.id)}
                  disabled={!canWater}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    background: canWater ? `${type.color}12` : 'rgba(255,255,255,0.02)',
                    color: canWater ? type.color : 'var(--text-muted)',
                    border: `1px solid ${canWater ? `${type.color}25` : 'rgba(255,255,255,0.04)'}`,
                    opacity: canWater ? 1 : 0.5,
                    cursor: canWater ? 'pointer' : 'default',
                  }}
                  data-testid={`plant-water-${p.id}`}
                >
                  <Droplets size={13} /> {canWater ? 'Water Plant' : 'Watered Today'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========== SAND DRAWING ========== */
const SAND_COLORS = [
  { id: 'purple', label: 'Amethyst', stroke: 'rgba(216, 180, 254, 0.5)', glow: 'rgba(216, 180, 254, 0.15)', hex: '#D8B4FE' },
  { id: 'teal', label: 'Ocean', stroke: 'rgba(45, 212, 191, 0.5)', glow: 'rgba(45, 212, 191, 0.15)', hex: '#2DD4BF' },
  { id: 'gold', label: 'Sunlight', stroke: 'rgba(252, 211, 77, 0.5)', glow: 'rgba(252, 211, 77, 0.15)', hex: '#FCD34D' },
  { id: 'rose', label: 'Rose', stroke: 'rgba(253, 164, 175, 0.5)', glow: 'rgba(253, 164, 175, 0.15)', hex: '#FDA4AF' },
  { id: 'blue', label: 'Sapphire', stroke: 'rgba(59, 130, 246, 0.5)', glow: 'rgba(59, 130, 246, 0.15)', hex: '#3B82F6' },
  { id: 'green', label: 'Emerald', stroke: 'rgba(34, 197, 94, 0.5)', glow: 'rgba(34, 197, 94, 0.15)', hex: '#22C55E' },
  { id: 'white', label: 'Moonlight', stroke: 'rgba(248, 250, 252, 0.45)', glow: 'rgba(248, 250, 252, 0.12)', hex: '#F8FAFC' },
  { id: 'orange', label: 'Ember', stroke: 'rgba(251, 146, 60, 0.5)', glow: 'rgba(251, 146, 60, 0.15)', hex: '#FB923C' },
];

function SandCanvas() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const points = useRef([]);
  const [colorIdx, setColorIdx] = useState(0);
  const colorRef = useRef(SAND_COLORS[0]);

  useEffect(() => { colorRef.current = SAND_COLORS[colorIdx]; }, [colorIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(11, 12, 21, 0.015)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    const x = (touch ? touch.clientX : e.clientX) - rect.left;
    const y = (touch ? touch.clientY : e.clientY) - rect.top;
    return { x, y };
  };

  const startDraw = (e) => {
    drawing.current = true;
    const p = getPos(e);
    points.current = [p];
  };

  const moveDraw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const p = getPos(e);
    points.current.push(p);
    const ctx = canvasRef.current.getContext('2d');
    const prev = points.current[points.current.length - 2];
    const c = colorRef.current;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = c.glow;
    ctx.fill();
  };

  const endDraw = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  };

  return (
    <div className="relative">
      {/* Color picker */}
      <div className="flex items-center gap-2 mb-4 flex-wrap" data-testid="sand-color-picker">
        {SAND_COLORS.map((c, i) => (
          <button key={c.id} onClick={() => setColorIdx(i)}
            className="w-7 h-7 rounded-full transition-all duration-200 flex-shrink-0"
            style={{
              background: c.hex,
              border: colorIdx === i ? '2px solid #fff' : '2px solid transparent',
              boxShadow: colorIdx === i ? `0 0 12px ${c.hex}80` : 'none',
              transform: colorIdx === i ? 'scale(1.15)' : 'scale(1)',
            }}
            title={c.label}
            data-testid={`sand-color-${c.id}`}
          />
        ))}
        <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>{SAND_COLORS[colorIdx].label}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl cursor-crosshair touch-none"
        style={{ height: 300, background: 'rgba(11,12,21,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
        onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
        data-testid="sand-canvas"
      />
      <button onClick={clear} className="absolute top-14 right-3 text-xs px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
        data-testid="sand-clear">Clear</button>
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Draw patterns in the sand. They will fade peacefully over time.
      </p>
    </div>
  );
}

/* ========== KOI POND ========== */
function KoiPond() {
  const canvasRef = useRef(null);
  const fishRef = useRef([]);
  const animRef = useRef(null);
  const ripples = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');

    const colors = ['#FDA4AF', '#FCD34D', '#fff', '#FB923C', '#D8B4FE'];
    fishRef.current = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      size: 8 + Math.random() * 8, color: colors[i % colors.length],
      tailPhase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(11, 12, 21, 0.15)';
      ctx.fillRect(0, 0, w, h);

      // Ripples
      ripples.current = ripples.current.filter(r => {
        r.radius += 1.5;
        r.opacity -= 0.008;
        if (r.opacity <= 0) return false;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${r.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        return true;
      });

      // Fish
      fishRef.current.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        f.tailPhase += 0.08;
        if (f.x < 0 || f.x > w) f.vx *= -1;
        if (f.y < 0 || f.y > h) f.vy *= -1;
        // Gentle direction changes
        if (Math.random() < 0.01) { f.vx += (Math.random() - 0.5) * 0.5; f.vy += (Math.random() - 0.5) * 0.5; }
        f.vx = Math.max(-2, Math.min(2, f.vx));
        f.vy = Math.max(-2, Math.min(2, f.vy));

        const angle = Math.atan2(f.vy, f.vx);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(angle);

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        // Tail
        const tailWag = Math.sin(f.tailPhase) * f.size * 0.4;
        ctx.beginPath();
        ctx.moveTo(-f.size, 0);
        ctx.lineTo(-f.size * 1.6, tailWag);
        ctx.lineTo(-f.size * 1.6, -tailWag * 0.3);
        ctx.closePath();
        ctx.fill();
        // Glow
        ctx.beginPath();
        ctx.arc(0, 0, f.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.globalAlpha = 0.06;
        ctx.fill();

        ctx.restore();
        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * 2;
    const y = (e.clientY - rect.top) * 2;
    ripples.current.push({ x, y, radius: 0, opacity: 0.5 });
    // Attract fish
    fishRef.current.forEach(f => {
      const dx = x - f.x; const dy = y - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 400) { f.vx += (dx / dist) * 0.8; f.vy += (dy / dist) * 0.8; }
    });
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl cursor-pointer"
        style={{ height: 300, background: 'rgba(11,12,21,0.5)', border: '1px solid rgba(45,212,191,0.08)' }}
        onClick={handleClick}
        data-testid="koi-pond"
      />
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Tap the pond to create ripples. The koi will swim toward you.
      </p>
    </div>
  );
}

/* ========== LANTERN RELEASE ========== */
function LanternRelease() {
  const [worry, setWorry] = useState('');
  const [lanterns, setLanterns] = useState([]);
  const { playChime } = useSensory();

  const release = () => {
    if (!worry.trim()) return;
    const newLantern = {
      id: Date.now(), text: worry.trim(),
      x: 30 + Math.random() * 40,
      color: ['#FCD34D', '#FDA4AF', '#D8B4FE', '#FB923C', '#2DD4BF'][Math.floor(Math.random() * 5)],
    };
    setLanterns(prev => [...prev, newLantern]);
    setWorry('');
    playChime();
    // Remove after animation
    setTimeout(() => {
      setLanterns(prev => prev.filter(l => l.id !== newLantern.id));
    }, 8000);
  };

  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 350, background: 'rgba(11,12,21,0.5)', border: '1px solid rgba(252,211,77,0.08)' }}
        data-testid="lantern-area">
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(11,12,21,0.8) 0%, rgba(30,20,60,0.4) 40%, rgba(11,12,21,0.2) 100%)',
        }} />

        {/* Lanterns floating up */}
        <AnimatePresence>
          {lanterns.map(l => (
            <motion.div
              key={l.id}
              initial={{ bottom: 40, left: `${l.x}%`, opacity: 0, scale: 0.5 }}
              animate={{ bottom: 400, opacity: [0, 1, 1, 0.5, 0], scale: [0.5, 1, 1, 0.8, 0.6] }}
              transition={{ duration: 7, ease: 'easeOut' }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{ transform: 'translateX(-50%)' }}
            >
              <div className="relative">
                {/* Lantern body */}
                <div className="w-12 h-16 rounded-lg flex items-center justify-center p-1"
                  style={{
                    background: `linear-gradient(to top, ${l.color}40, ${l.color}15)`,
                    border: `1px solid ${l.color}30`,
                    boxShadow: `0 0 20px ${l.color}30, 0 0 40px ${l.color}10`,
                  }}>
                  <p className="text-[6px] text-center overflow-hidden leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {l.text.substring(0, 30)}
                  </p>
                </div>
                {/* Glow underneath */}
                <div className="w-4 h-4 rounded-full mx-auto -mt-1" style={{
                  background: `radial-gradient(circle, ${l.color}80, transparent)`,
                  filter: 'blur(4px)',
                }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-4">
        <input
          value={worry}
          onChange={e => setWorry(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && release()}
          placeholder="Write a worry, then let it go..."
          className="input-glass flex-1 text-sm"
          data-testid="lantern-input"
        />
        <button onClick={release} className="btn-glass px-5 flex items-center gap-2 text-sm"
          style={{ background: 'rgba(252,211,77,0.08)', borderColor: 'rgba(252,211,77,0.2)', color: '#FCD34D' }}
          data-testid="lantern-release-btn">
          <Send size={14} /> Release
        </button>
      </div>
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Write what weighs on your mind and release it as a glowing lantern into the sky.
      </p>
    </div>
  );
}

/* ========== RAIN SCENE ========== */
function RainScene() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [intensity, setIntensity] = useState(0.5);
  const intensityRef = useRef(0.5);
  const audioRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => { intensityRef.current = intensity; }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');

    const drops = Array.from({ length: 200 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      speed: 4 + Math.random() * 8, length: 10 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.3,
    }));

    const splashes = [];

    const draw = () => {
      ctx.fillStyle = 'rgba(11, 12, 21, 0.3)';
      ctx.fillRect(0, 0, w, h);

      const dropCount = Math.floor(drops.length * intensityRef.current);
      for (let i = 0; i < dropCount; i++) {
        const d = drops[i];
        d.y += d.speed * intensityRef.current;
        if (d.y > h) {
          d.y = -d.length;
          d.x = Math.random() * w;
          if (Math.random() < 0.3) splashes.push({ x: d.x, y: h - 4, radius: 0, opacity: 0.3 });
        }
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length * intensityRef.current);
        ctx.strokeStyle = `rgba(148, 163, 184, ${d.opacity * intensityRef.current})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.radius += 0.8;
        s.opacity -= 0.015;
        if (s.opacity <= 0) { splashes.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${s.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    // Rain audio
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx2 = new AC();
      audioRef.current = ctx2;
      const bufferSize = ctx2.sampleRate * 2;
      const buf = ctx2.createBuffer(1, bufferSize, ctx2.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx2.createBufferSource();
      src.buffer = buf; src.loop = true;
      const filt = ctx2.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 2000; filt.Q.value = 0.5;
      const g = ctx2.createGain();
      g.gain.value = intensity * 0.12;
      src.connect(filt); filt.connect(g); g.connect(ctx2.destination);
      src.start();
      nodesRef.current = [src, g];
    } catch {}

    return () => {
      cancelAnimationFrame(animRef.current);
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch(e) {} });
      try { audioRef.current?.close(); } catch(e) {}
    };
  }, []);

  useEffect(() => {
    const g = nodesRef.current[1];
    if (g?.gain) g.gain.value = intensity * 0.12;
  }, [intensity]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full rounded-2xl" style={{ height: 300, background: 'rgba(11,12,21,0.5)', border: '1px solid rgba(148,163,184,0.08)' }} data-testid="rain-canvas" />
      <div className="mt-4 flex items-center gap-4">
        <CloudRain size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="range" min="0.1" max="1" step="0.1" value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))}
          className="flex-1 accent-blue-400" data-testid="rain-intensity" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(intensity * 100)}%</span>
      </div>
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Adjust the rain intensity. Let the sound wash your thoughts away.
      </p>
    </div>
  );
}

/* ========== MAIN ZEN GARDEN PAGE ========== */
const TABS = [
  { id: 'plants', label: 'Plant Garden', icon: Sprout, color: '#22C55E' },
  { id: 'koi', label: 'Koi Pond', icon: Fish, color: '#2DD4BF' },
  { id: 'sand', label: 'Sand Drawing', icon: Pencil, color: '#D8B4FE' },
  { id: 'lanterns', label: 'Lantern Release', icon: Sun, color: '#FCD34D' },
  { id: 'rain', label: 'Rain Scene', icon: CloudRain, color: '#94A3B8' },
];

export default function ZenGarden() {
  const { user, authHeaders } = useAuth();
  const [tab, setTab] = useState('plants');

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#22C55E' }}>
            <Sprout size={14} className="inline mr-2" /> Decompression
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Zen Garden
          </h1>
          <p className="text-base mb-10 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            A sanctuary of calm. Nurture plants, feed koi, draw in sand, release lanterns, or simply listen to the rain.
          </p>
        </motion.div>

        {/* Tab selector */}
        <div className="flex flex-wrap gap-2 mb-8" data-testid="zen-garden-tabs">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  background: active ? `${t.color}12` : 'rgba(255,255,255,0.02)',
                  color: active ? t.color : 'var(--text-muted)',
                  border: `1px solid ${active ? `${t.color}30` : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: active ? `0 0 15px ${t.color}15` : 'none',
                }}
                data-testid={`zen-tab-${t.id}`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {tab === 'plants' && <PlantCare user={user} authHeaders={authHeaders} />}
            {tab === 'koi' && <KoiPond />}
            {tab === 'sand' && <SandCanvas />}
            {tab === 'lanterns' && <LanternRelease />}
            {tab === 'rain' && <RainScene />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
