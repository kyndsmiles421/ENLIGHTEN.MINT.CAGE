import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';
import CelebrationBurst from '../components/CelebrationBurst';
import { Sprout, Droplets, CloudRain, Send, Pencil, Fish, TreePine, Flower2, Leaf, Sun } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ========== PLANT DATA ========== */
const PLANT_TYPES = [
  { id: 'lotus', name: 'Sacred Lotus', icon: Flower2, color: '#FDA4AF', stages: ['Seed', 'Sprout', 'Bud', 'Bloom', 'Full Bloom'], growth_time: 5, desc: 'Symbol of purity and spiritual awakening' },
  { id: 'bamboo', name: 'Lucky Bamboo', icon: TreePine, color: '#22C55E', stages: ['Seed', 'Shoot', 'Young', 'Tall', 'Flourishing'], growth_time: 4, desc: 'Resilience, flexibility, and good fortune' },
  { id: 'bonsai', name: 'Zen Bonsai', icon: TreePine, color: '#86EFAC', stages: ['Seed', 'Seedling', 'Sapling', 'Shaped', 'Ancient'], growth_time: 7, desc: 'Patience, harmony, and inner balance' },
  { id: 'fern', name: 'Peace Fern', icon: Leaf, color: '#2DD4BF', stages: ['Spore', 'Fiddlehead', 'Unfurling', 'Lush', 'Majestic'], growth_time: 3, desc: 'New beginnings and shelter from negativity' },
  { id: 'sage', name: 'White Sage', icon: Sprout, color: '#C084FC', stages: ['Seed', 'Sprout', 'Growing', 'Mature', 'Sacred'], growth_time: 5, desc: 'Purification, wisdom, and spiritual cleansing' },
];

/* ========== SVG PLANT VISUALS ========== */
function PlantVisual({ type, stageIdx }) {
  const maxStage = 4;
  const s = stageIdx / maxStage; // 0 to 1
  const c = type.color;

  if (type.id === 'lotus') {
    const petalCount = Math.max(0, Math.floor(s * 8));
    const stemH = 20 + s * 40;
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Water surface */}
        <ellipse cx="50" cy="85" rx="40" ry="6" fill="rgba(45,212,191,0.1)" />
        {/* Stem */}
        <path d={`M50,85 Q${48 + Math.sin(Date.now()/2000)*2},${85 - stemH/2} 50,${85 - stemH}`} stroke="#2D6A4F" strokeWidth="1.5" fill="none" opacity="0.6" />
        {/* Lily pad */}
        {s > 0 && <ellipse cx="50" cy="83" rx={12 + s * 8} ry={4 + s * 2} fill="#22C55E" opacity="0.3" />}
        {/* Petals */}
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
          const px = 50 + Math.cos(angle) * (6 + s * 8);
          const py = (85 - stemH) + Math.sin(angle) * (4 + s * 5);
          return <ellipse key={i} cx={px} cy={py} rx={3 + s * 3} ry={5 + s * 4} fill={c} opacity={0.6 + s * 0.3}
            transform={`rotate(${(angle * 180 / Math.PI) + 90}, ${px}, ${py})`} />;
        })}
        {/* Center */}
        {s > 0.3 && <circle cx="50" cy={85 - stemH} r={2 + s * 2} fill="#FCD34D" opacity="0.8" />}
      </svg>
    );
  }
  if (type.id === 'bamboo') {
    const segments = Math.max(1, Math.floor(1 + s * 5));
    const segH = 10;
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Ground */}
        <ellipse cx="50" cy="92" rx="20" ry="3" fill="rgba(34,197,94,0.08)" />
        {/* Segments */}
        {Array.from({ length: segments }).map((_, i) => {
          const y = 90 - i * segH;
          return <g key={i}>
            <rect x="47" y={y - segH} width="6" height={segH} rx="2" fill="#2D6A4F" opacity={0.5 + s * 0.4} />
            <line x1="47" y1={y} x2="53" y2={y} stroke="#22C55E" strokeWidth="1" opacity="0.5" />
            {/* Leaves on alternating sides */}
            {i > 0 && i % 2 === 0 && <path d={`M53,${y - 4} Q${65 + s * 10},${y - 8} ${58 + s * 8},${y - 12}`} stroke="#22C55E" strokeWidth="1" fill="#22C55E" opacity={0.3 + s * 0.3} />}
            {i > 0 && i % 2 === 1 && <path d={`M47,${y - 4} Q${35 - s * 10},${y - 8} ${42 - s * 8},${y - 12}`} stroke="#22C55E" strokeWidth="1" fill="#22C55E" opacity={0.3 + s * 0.3} />}
          </g>;
        })}
      </svg>
    );
  }
  if (type.id === 'bonsai') {
    const branchScale = 0.3 + s * 0.7;
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Pot */}
        <rect x="35" y="82" width="30" height="12" rx="3" fill="#8B7355" opacity="0.4" />
        <rect x="32" y="80" width="36" height="4" rx="2" fill="#A0896C" opacity="0.4" />
        {/* Trunk */}
        <path d={`M50,82 Q45,${70 - s * 10} 48,${60 - s * 10}`} stroke="#5C4033" strokeWidth={2 + s * 1.5} fill="none" opacity="0.7" strokeLinecap="round" />
        {/* Branches */}
        <path d={`M48,${65 - s * 8} Q${35 - s * 5},${55 - s * 5} ${30 - s * 5},${52 - s * 8}`} stroke="#5C4033" strokeWidth={1 + s * 0.5} fill="none" opacity={0.5 * branchScale} strokeLinecap="round" />
        <path d={`M49,${60 - s * 10} Q${60 + s * 5},${48 - s * 5} ${65 + s * 5},${45 - s * 8}`} stroke="#5C4033" strokeWidth={1 + s * 0.5} fill="none" opacity={0.5 * branchScale} strokeLinecap="round" />
        {/* Foliage clouds */}
        {s > 0.2 && <>
          <circle cx={30 - s * 5} cy={50 - s * 8} r={6 + s * 5} fill={c} opacity={0.25 + s * 0.2} />
          <circle cx={65 + s * 5} cy={43 - s * 8} r={5 + s * 5} fill={c} opacity={0.25 + s * 0.2} />
          <circle cx="48" cy={55 - s * 12} r={7 + s * 6} fill={c} opacity={0.3 + s * 0.2} />
        </>}
      </svg>
    );
  }
  if (type.id === 'fern') {
    const frondCount = Math.max(1, Math.floor(1 + s * 5));
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="92" rx="15" ry="3" fill="rgba(45,212,191,0.08)" />
        {Array.from({ length: frondCount }).map((_, i) => {
          const angle = -30 + (i / Math.max(1, frondCount - 1)) * 60 - 30;
          const len = 20 + s * 30;
          return <g key={i} transform={`rotate(${angle}, 50, 90)`}>
            <path d={`M50,90 Q50,${90 - len / 2} 50,${90 - len}`} stroke={c} strokeWidth="1.5" fill="none" opacity={0.4 + s * 0.4} />
            {Array.from({ length: Math.floor(3 + s * 4) }).map((_, j) => {
              const py = 90 - (j + 1) * (len / (4 + s * 4));
              const leafLen = 4 + s * 6;
              return <g key={j}>
                <path d={`M50,${py} Q${50 + leafLen},${py - 2} ${50 + leafLen * 0.8},${py + 1}`} fill={c} opacity={0.3 + s * 0.3} />
                <path d={`M50,${py} Q${50 - leafLen},${py - 2} ${50 - leafLen * 0.8},${py + 1}`} fill={c} opacity={0.3 + s * 0.3} />
              </g>;
            })}
          </g>;
        })}
      </svg>
    );
  }
  // Sage
  const stemCount = Math.max(1, Math.floor(1 + s * 3));
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="50" cy="92" rx="12" ry="3" fill="rgba(192,132,252,0.08)" />
      {Array.from({ length: stemCount }).map((_, i) => {
        const x = 44 + i * 6;
        const h = 20 + s * 35 + (i % 2) * 5;
        return <g key={i}>
          <line x1={x} y1="90" x2={x + (i - 1) * 2} y2={90 - h} stroke="#6B5B73" strokeWidth="1.2" opacity="0.5" />
          {Array.from({ length: Math.floor(2 + s * 3) }).map((_, j) => {
            const ly = 90 - (j + 1) * (h / (3 + s * 3));
            return <ellipse key={j} cx={x + (i - 1) * 1.5} cy={ly} rx={3 + s * 2} ry={1.5 + s * 1} fill={c} opacity={0.3 + s * 0.4}
              transform={`rotate(${(j % 2 === 0 ? 20 : -20)}, ${x}, ${ly})`} />;
          })}
        </g>;
      })}
    </svg>
  );
}

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
            {PLANT_TYPES.map(t => (
              <button key={t.id} onClick={() => addPlant(t)} className="glass-card p-4 text-left group hover:scale-[1.02] transition-transform"
                data-testid={`plant-type-${t.id}`}>
                <div className="w-12 h-12 mb-2"><PlantVisual type={t} stageIdx={2} /></div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
              </button>
            ))}
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
            const stageIdx = type.stages.indexOf(p.stage);
            const progress = ((stageIdx + 1) / type.stages.length) * 100;
            const canWater = !p.watered_today;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-6 relative overflow-hidden group" data-testid={`plant-card-${p.id}`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
                  background: `radial-gradient(circle, ${type.color}08 0%, transparent 70%)`, filter: 'blur(20px)',
                }} />
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 flex-shrink-0">
                    <PlantVisual type={type} stageIdx={stageIdx} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{type.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: type.color }}>{p.stage}</p>
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${type.color}60, ${type.color})` }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      Stage {stageIdx + 1} of {type.stages.length} &middot; Watered {p.water_count}x
                    </p>
                  </div>
                </div>
                <button onClick={() => canWater && waterPlant(p.id)} disabled={!canWater}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    background: canWater ? `${type.color}12` : 'rgba(255,255,255,0.02)',
                    color: canWater ? type.color : 'var(--text-muted)',
                    border: `1px solid ${canWater ? `${type.color}25` : 'rgba(255,255,255,0.04)'}`,
                    opacity: canWater ? 1 : 0.5, cursor: canWater ? 'pointer' : 'default',
                  }} data-testid={`plant-water-${p.id}`}>
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
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const interval = setInterval(() => { ctx.fillStyle = 'rgba(11, 12, 21, 0.015)'; ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight); }, 100);
    return () => clearInterval(interval);
  }, []);

  const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); const t = e.touches?.[0]; return { x: (t ? t.clientX : e.clientX) - rect.left, y: (t ? t.clientY : e.clientY) - rect.top }; };
  const startDraw = (e) => { drawing.current = true; points.current = [getPos(e)]; };
  const moveDraw = (e) => { if (!drawing.current) return; e.preventDefault(); const p = getPos(e); points.current.push(p); const ctx = canvasRef.current.getContext('2d'); const prev = points.current[points.current.length - 2]; const c = colorRef.current; ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = c.glow; ctx.fill(); };
  const endDraw = () => { drawing.current = false; };
  const clear = () => { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0, 0, canvasRef.current.offsetWidth, canvasRef.current.offsetHeight); };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4 flex-wrap" data-testid="sand-color-picker">
        {SAND_COLORS.map((c, i) => (
          <button key={c.id} onClick={() => setColorIdx(i)} className="w-7 h-7 rounded-full transition-all duration-200 flex-shrink-0"
            style={{ background: c.hex, border: colorIdx === i ? '2px solid #fff' : '2px solid transparent', boxShadow: colorIdx === i ? `0 0 12px ${c.hex}80` : 'none', transform: colorIdx === i ? 'scale(1.15)' : 'scale(1)' }}
            title={c.label} data-testid={`sand-color-${c.id}`} />
        ))}
        <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>{SAND_COLORS[colorIdx].label}</span>
      </div>
      <canvas ref={canvasRef} className="w-full rounded-2xl cursor-crosshair touch-none"
        style={{ height: 300, background: 'rgba(11,12,21,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
        onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw} data-testid="sand-canvas" />
      <button onClick={clear} className="absolute top-14 right-3 text-xs px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="sand-clear">Clear</button>
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>Draw patterns in the sand. They will fade peacefully over time.</p>
    </div>
  );
}

/* ========== REALISTIC KOI POND ========== */
function KoiPond() {
  const canvasRef = useRef(null);
  const fishRef = useRef([]);
  const animRef = useRef(null);
  const ripples = useRef([]);
  const lilyPads = useRef([]);
  const bubbles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');

    // Initialize lily pads
    lilyPads.current = Array.from({ length: 4 }, () => ({
      x: 80 + Math.random() * (w - 160), y: 60 + Math.random() * (h - 120),
      size: 20 + Math.random() * 15, rotation: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.002,
    }));

    // Initialize koi fish with more realistic properties
    const koiPatterns = [
      { base: '#FF6B6B', spots: '#fff', belly: '#FFDADA', name: 'Kohaku' },
      { base: '#FFA500', spots: '#000', belly: '#FFE0A0', name: 'Sanke' },
      { base: '#fff', spots: '#FF4500', belly: '#F8F8F8', name: 'Tancho' },
      { base: '#FFD700', spots: '#FF8C00', belly: '#FFF5CC', name: 'Yamabuki' },
      { base: '#E0E0E0', spots: '#1a1a1a', belly: '#F5F5F5', name: 'Shiro' },
      { base: '#FF7F50', spots: '#fff', belly: '#FFE4CC', name: 'Hariwake' },
      { base: '#C0C0C0', spots: '#FF4444', belly: '#E8E8E8', name: 'Platinum' },
    ];

    fishRef.current = Array.from({ length: 7 }, (_, i) => {
      const pattern = koiPatterns[i % koiPatterns.length];
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
        size: 14 + Math.random() * 10,
        tailPhase: Math.random() * Math.PI * 2,
        finPhase: Math.random() * Math.PI * 2,
        ...pattern,
        targetX: null, targetY: null,
        turnSpeed: 0.03 + Math.random() * 0.02,
      };
    });

    // Helper to convert hex to rgba for canvas compatibility
    const hexToRgba = (hex, alpha) => {
      let r, g, b;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const drawFish = (f) => {
      const angle = Math.atan2(f.vy, f.vx);
      const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
      const tailWag = Math.sin(f.tailPhase) * 0.3 * (0.5 + speed * 0.5);
      const finWag = Math.sin(f.finPhase) * 0.2;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(angle);

      // Shadow
      ctx.beginPath();
      ctx.ellipse(3, 3, f.size * 0.9, f.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fill();

      // Tail fin (flowing)
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.7, 0);
      const tw = tailWag * f.size;
      ctx.bezierCurveTo(-f.size * 1.1, -f.size * 0.5 + tw, -f.size * 1.5, -f.size * 0.3 + tw * 1.5, -f.size * 1.6, tw * 2);
      ctx.bezierCurveTo(-f.size * 1.5, f.size * 0.3 + tw * 1.5, -f.size * 1.1, f.size * 0.5 + tw, -f.size * 0.7, 0);
      ctx.fillStyle = f.base;
      ctx.globalAlpha = 0.6;
      ctx.fill();

      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(f.size * 0.1, -f.size * 0.3);
      ctx.quadraticCurveTo(f.size * -0.1, -f.size * 0.6 + finWag * f.size, -f.size * 0.3, -f.size * 0.3);
      ctx.fillStyle = f.base;
      ctx.globalAlpha = 0.4;
      ctx.fill();

      // Pectoral fins
      ctx.beginPath();
      ctx.moveTo(f.size * 0.2, f.size * 0.25);
      ctx.quadraticCurveTo(f.size * 0.1, f.size * 0.55 + finWag * f.size * 0.5, -f.size * 0.1, f.size * 0.4);
      ctx.fillStyle = f.belly;
      ctx.globalAlpha = 0.35;
      ctx.fill();

      // Main body
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 0.38, 0, 0, Math.PI * 2);
      const bodyGrad = ctx.createRadialGradient(0, -f.size * 0.1, 0, 0, 0, f.size);
      bodyGrad.addColorStop(0, f.belly);
      bodyGrad.addColorStop(0.5, f.base);
      bodyGrad.addColorStop(1, f.base);
      ctx.fillStyle = bodyGrad;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Spots/markings
      ctx.globalAlpha = 0.35;
      const spotCount = 3 + Math.floor(f.size / 6);
      for (let j = 0; j < spotCount; j++) {
        const sx = (Math.sin(j * 2.3 + f.size) * 0.6) * f.size;
        const sy = (Math.cos(j * 1.7 + f.size) * 0.25) * f.size;
        ctx.beginPath();
        ctx.ellipse(sx, sy, f.size * 0.12 + Math.sin(j) * f.size * 0.06, f.size * 0.08, j * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = f.spots;
        ctx.fill();
      }

      // Shimmer
      ctx.beginPath();
      ctx.ellipse(f.size * 0.15, -f.size * 0.08, f.size * 0.3, f.size * 0.1, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.globalAlpha = 0.4 + Math.sin(f.tailPhase * 0.5) * 0.15;
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(f.size * 0.7, -f.size * 0.05, f.size * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(f.size * 0.72, -f.size * 0.07, f.size * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.6;
      ctx.fill();

      ctx.restore();
      ctx.globalAlpha = 1;

      // Underwater glow
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 1.8, 0, Math.PI * 2);
      const glowGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 1.8);
      glowGrad.addColorStop(0, hexToRgba(f.base, 0.07));
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.fill();
    };

    const drawLilyPad = (pad) => {
      ctx.save();
      ctx.translate(pad.x, pad.y);
      ctx.rotate(pad.rotation);

      // Shadow
      ctx.beginPath();
      ctx.ellipse(2, 2, pad.size, pad.size * 0.7, 0, 0.15, Math.PI * 2 - 0.15);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fill();

      // Pad
      ctx.beginPath();
      ctx.ellipse(0, 0, pad.size, pad.size * 0.7, 0, 0.15, Math.PI * 2 - 0.15);
      ctx.lineTo(0, 0);
      const padGrad = ctx.createRadialGradient(-pad.size * 0.2, -pad.size * 0.1, 0, 0, 0, pad.size);
      padGrad.addColorStop(0, 'rgba(34,197,94,0.35)');
      padGrad.addColorStop(1, 'rgba(22,163,74,0.2)');
      ctx.fillStyle = padGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(34,197,94,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Veins
      for (let v = 0; v < 5; v++) {
        const a = 0.3 + v * 1.1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * pad.size * 0.85, Math.sin(a) * pad.size * 0.6);
        ctx.strokeStyle = 'rgba(34,197,94,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.restore();
    };

    const draw = () => {
      // Water background with subtle gradient
      ctx.fillStyle = 'rgba(8, 10, 18, 0.12)';
      ctx.fillRect(0, 0, w, h);

      // Subtle caustic light patterns
      const time = Date.now() * 0.001;
      for (let i = 0; i < 3; i++) {
        const cx = w * 0.3 + Math.sin(time * 0.3 + i * 2) * w * 0.3;
        const cy = h * 0.3 + Math.cos(time * 0.4 + i * 1.5) * h * 0.3;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        grad.addColorStop(0, 'rgba(45,212,191,0.015)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Bubbles
      if (Math.random() < 0.02) {
        bubbles.current.push({ x: Math.random() * w, y: h, size: 1 + Math.random() * 3, speed: 0.3 + Math.random() * 0.5, opacity: 0.2 + Math.random() * 0.2 });
      }
      bubbles.current = bubbles.current.filter(b => {
        b.y -= b.speed;
        b.x += Math.sin(b.y * 0.05) * 0.3;
        b.opacity -= 0.001;
        if (b.y < 0 || b.opacity <= 0) return false;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,230,255,${b.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.5})`;
        ctx.fill();
        return true;
      });

      // Ripples
      ripples.current = ripples.current.filter(r => {
        r.radius += 1.2;
        r.opacity -= 0.006;
        if (r.opacity <= 0) return false;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 220, 240, ${r.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (r.radius > 10) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180, 220, 240, ${r.opacity * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        return true;
      });

      // Lily pads
      lilyPads.current.forEach(pad => {
        pad.rotation += pad.drift;
        pad.x += Math.sin(time + pad.size) * 0.1;
        drawLilyPad(pad);
      });

      // Fish
      fishRef.current.forEach(f => {
        f.tailPhase += 0.06 + Math.sqrt(f.vx * f.vx + f.vy * f.vy) * 0.04;
        f.finPhase += 0.04;

        // Avoid lily pads
        lilyPads.current.forEach(pad => {
          const dx = f.x - pad.x;
          const dy = f.y - pad.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pad.size * 2) {
            f.vx += (dx / dist) * 0.05;
            f.vy += (dy / dist) * 0.05;
          }
        });

        // Gentle wandering
        if (Math.random() < 0.008) {
          f.vx += (Math.random() - 0.5) * 0.4;
          f.vy += (Math.random() - 0.5) * 0.4;
        }

        f.x += f.vx;
        f.y += f.vy;

        // Boundary avoidance (smooth)
        const margin = 40;
        if (f.x < margin) f.vx += 0.08;
        if (f.x > w - margin) f.vx -= 0.08;
        if (f.y < margin) f.vy += 0.08;
        if (f.y > h - margin) f.vy -= 0.08;

        // Speed limit
        const maxSpeed = 1.5;
        const spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (spd > maxSpeed) { f.vx = (f.vx / spd) * maxSpeed; f.vy = (f.vy / spd) * maxSpeed; }

        // Friction
        f.vx *= 0.998;
        f.vy *= 0.998;

        drawFish(f);
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
    ripples.current.push({ x, y, radius: 0, opacity: 0.4 });
    fishRef.current.forEach(f => {
      const dx = x - f.x;
      const dy = y - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 500) { f.vx += (dx / dist) * 0.6; f.vy += (dy / dist) * 0.6; }
    });
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full rounded-2xl cursor-pointer"
        style={{ height: 380, background: 'linear-gradient(180deg, rgba(8,15,25,0.9) 0%, rgba(12,20,35,0.95) 50%, rgba(8,15,25,0.9) 100%)', border: '1px solid rgba(45,212,191,0.08)' }}
        onClick={handleClick} data-testid="koi-pond" />
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Tap the pond to create ripples. Watch the koi glide through the water.
      </p>
    </div>
  );
}

/* ========== REALISTIC LANTERN RELEASE ========== */
function LanternRelease() {
  const [worry, setWorry] = useState('');
  const [lanterns, setLanterns] = useState([]);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const { playChime } = useSensory();

  // Starry sky canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');

    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.7,
      size: 0.3 + Math.random() * 1.2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, 'rgba(5,8,20,0.95)');
      skyGrad.addColorStop(0.4, 'rgba(15,12,35,0.9)');
      skyGrad.addColorStop(0.7, 'rgba(20,15,40,0.85)');
      skyGrad.addColorStop(1, 'rgba(30,20,50,0.7)');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      const time = Date.now() * 0.001;
      starsRef.current.forEach(s => {
        const alpha = 0.3 + Math.sin(time * s.twinkleSpeed + s.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        // Star glow
        if (s.size > 0.8) {
          const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
          glow.addColorStop(0, `rgba(200,220,255,${alpha * 0.15})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(s.x - s.size * 4, s.y - s.size * 4, s.size * 8, s.size * 8);
        }
      });

      // Distant treeline silhouette
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let px = 0; px <= w; px += 8) {
        const treeH = h * 0.88 + Math.sin(px * 0.008) * 15 + Math.sin(px * 0.025) * 8 + Math.sin(px * 0.05) * 4;
        ctx.lineTo(px, treeH);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(5,8,15,0.9)';
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const release = () => {
    if (!worry.trim()) return;
    const newLantern = {
      id: Date.now(), text: worry.trim(),
      x: 25 + Math.random() * 50,
      color: ['#FCD34D', '#FDA4AF', '#FB923C', '#FFB347', '#FFCC66'][Math.floor(Math.random() * 5)],
      drift: (Math.random() - 0.5) * 8,
      flickerSpeed: 2 + Math.random() * 2,
    };
    setLanterns(prev => [...prev, newLantern]);
    setWorry('');
    playChime();
    setTimeout(() => setLanterns(prev => prev.filter(l => l.id !== newLantern.id)), 10000);
  };

  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 400, border: '1px solid rgba(252,211,77,0.08)' }} data-testid="lantern-area">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />
        {/* Lanterns */}
        <AnimatePresence>
          {lanterns.map(l => (
            <motion.div key={l.id}
              initial={{ bottom: 20, left: `${l.x}%`, opacity: 0, scale: 0.3 }}
              animate={{
                bottom: [20, 120, 250, 380, 450],
                left: [`${l.x}%`, `${l.x + l.drift * 0.3}%`, `${l.x + l.drift * 0.6}%`, `${l.x + l.drift}%`, `${l.x + l.drift * 1.2}%`],
                opacity: [0, 0.9, 1, 0.8, 0],
                scale: [0.3, 1, 1, 0.9, 0.7],
              }}
              transition={{ duration: 9, ease: 'easeOut', times: [0, 0.15, 0.5, 0.8, 1] }}
              exit={{ opacity: 0 }}
              className="absolute" style={{ transform: 'translateX(-50%)' }}>
              <div className="relative">
                {/* Warm glow above */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full" style={{
                  background: `radial-gradient(ellipse, ${l.color}30 0%, transparent 70%)`, filter: 'blur(8px)',
                }} />
                {/* Lantern body */}
                <div className="w-14 h-18 relative">
                  {/* Top frame */}
                  <div className="w-6 h-1 mx-auto rounded" style={{ background: `${l.color}50` }} />
                  {/* Paper body */}
                  <div className="w-14 h-16 rounded-lg mx-auto relative overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, ${l.color}25 0%, ${l.color}15 40%, ${l.color}08 100%)`,
                      border: `1px solid ${l.color}20`,
                      boxShadow: `inset 0 0 15px ${l.color}15, 0 0 30px ${l.color}20, 0 0 60px ${l.color}10`,
                    }}>
                    {/* Wire frame lines */}
                    <div className="absolute inset-0" style={{ borderLeft: `1px solid ${l.color}10`, borderRight: `1px solid ${l.color}10` }}>
                      <div className="absolute top-1/3 left-0 right-0 h-px" style={{ background: `${l.color}08` }} />
                      <div className="absolute top-2/3 left-0 right-0 h-px" style={{ background: `${l.color}08` }} />
                    </div>
                    {/* Inner flame glow */}
                    <motion.div
                      animate={{ opacity: [0.4, 0.7, 0.5, 0.8, 0.4], scale: [0.9, 1.1, 0.95, 1.05, 0.9] }}
                      transition={{ duration: l.flickerSpeed, repeat: Infinity }}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-6 rounded-full"
                      style={{ background: `radial-gradient(ellipse, ${l.color} 0%, ${l.color}60 40%, transparent 70%)`, filter: 'blur(2px)' }} />
                    {/* Text */}
                    <p className="absolute inset-0 flex items-center justify-center text-[5px] text-center px-1 leading-tight"
                      style={{ color: `${l.color}60` }}>
                      {l.text.substring(0, 40)}
                    </p>
                  </div>
                  {/* Bottom frame */}
                  <div className="w-5 h-0.5 mx-auto rounded" style={{ background: `${l.color}40` }} />
                </div>
                {/* Glow underneath */}
                <div className="w-10 h-6 rounded-full mx-auto" style={{
                  background: `radial-gradient(ellipse, ${l.color}40 0%, transparent 70%)`, filter: 'blur(6px)',
                }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-4">
        <input value={worry} onChange={e => setWorry(e.target.value)} onKeyDown={e => e.key === 'Enter' && release()}
          placeholder="Write a worry, then let it go..." className="input-glass flex-1 text-sm" data-testid="lantern-input" />
        <button onClick={release} className="btn-glass px-5 flex items-center gap-2 text-sm"
          style={{ background: 'rgba(252,211,77,0.08)', borderColor: 'rgba(252,211,77,0.2)', color: '#FCD34D' }}
          data-testid="lantern-release-btn">
          <Send size={14} /> Release
        </button>
      </div>
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Write what weighs on your mind and release it as a glowing lantern into the night sky.
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
    const drops = Array.from({ length: 200 }, () => ({ x: Math.random() * w, y: Math.random() * h, speed: 4 + Math.random() * 8, length: 10 + Math.random() * 20, opacity: 0.1 + Math.random() * 0.3 }));
    const splashes = [];
    const draw = () => {
      ctx.fillStyle = 'rgba(11, 12, 21, 0.3)'; ctx.fillRect(0, 0, w, h);
      const dropCount = Math.floor(drops.length * intensityRef.current);
      for (let i = 0; i < dropCount; i++) {
        const d = drops[i]; d.y += d.speed * intensityRef.current;
        if (d.y > h) { d.y = -d.length; d.x = Math.random() * w; if (Math.random() < 0.3) splashes.push({ x: d.x, y: h - 4, radius: 0, opacity: 0.3 }); }
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y + d.length * intensityRef.current);
        ctx.strokeStyle = `rgba(148, 163, 184, ${d.opacity * intensityRef.current})`; ctx.lineWidth = 1; ctx.stroke();
      }
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i]; s.radius += 0.8; s.opacity -= 0.015;
        if (s.opacity <= 0) { splashes.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${s.opacity})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const actx = new AC(); audioRef.current = actx;
      const buf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = actx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 2000; filt.Q.value = 0.5;
      const g = actx.createGain(); g.gain.value = intensity * 0.12;
      src.connect(filt); filt.connect(g); g.connect(actx.destination); src.start();
      nodesRef.current = [src, g];
    } catch {}
    return () => { cancelAnimationFrame(animRef.current); nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} }); try { audioRef.current?.close(); } catch {} };
  }, []);

  useEffect(() => { const g = nodesRef.current[1]; if (g?.gain) g.gain.value = intensity * 0.12; }, [intensity]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full rounded-2xl" style={{ height: 300, background: 'rgba(11,12,21,0.5)', border: '1px solid rgba(148,163,184,0.08)' }} data-testid="rain-canvas" />
      <div className="mt-4 flex items-center gap-4">
        <CloudRain size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="range" min="0.1" max="1" step="0.1" value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))}
          className="flex-1 accent-blue-400" data-testid="rain-intensity" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(intensity * 100)}%</span>
      </div>
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>Adjust the rain intensity. Let the sound wash your thoughts away.</p>
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
