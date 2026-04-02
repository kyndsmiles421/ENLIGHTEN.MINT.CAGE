import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Leaf, Search, Sparkles, Lock, X, Plus, Droplets,
  Thermometer, Wind, Flame, Mountain, CircleDot, ChevronRight,
  TreePine, FlaskRound, Loader2, Star
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = {
  Wood: TreePine, Fire: Flame, Earth: Mountain, Metal: CircleDot, Water: Droplets,
};

const NATURE_LABELS = {
  Hot: { icon: Flame, gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' },
  Warm: { icon: Flame, gradient: 'linear-gradient(135deg, #FB923C 0%, #C2410C 100%)' },
  Neutral: { icon: CircleDot, gradient: 'linear-gradient(135deg, #A3A3A3 0%, #525252 100%)' },
  Cool: { icon: Wind, gradient: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)' },
  Cold: { icon: Droplets, gradient: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)' },
};

const RARITY_STYLES = {
  common: { label: 'Common', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', color: '#94A3B8' },
  uncommon: { label: 'Uncommon', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22C55E' },
  rare: { label: 'Rare', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', color: '#C084FC' },
  legendary: { label: 'Legendary', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', color: '#EAB308' },
};

function PlantCard({ plant, onSelect, selected }) {
  const rarity = RARITY_STYLES[plant.rarity] || RARITY_STYLES.common;
  const ElemIcon = ELEMENT_ICONS[plant.element] || Leaf;

  return (
    <motion.button
      className="w-full text-left rounded-xl p-4 transition-all"
      style={{
        background: selected?.id === plant.id
          ? `linear-gradient(135deg, ${plant.element_color}12, ${plant.element_color}06)`
          : 'rgba(10,10,18,0.5)',
        border: `1px solid ${selected?.id === plant.id ? plant.element_color + '40' : 'rgba(248,250,252,0.04)'}`,
        backdropFilter: 'blur(12px)',
        opacity: plant.locked ? 0.5 : 1,
      }}
      whileHover={!plant.locked ? { scale: 1.01, y: -2 } : {}}
      whileTap={!plant.locked ? { scale: 0.99 } : {}}
      onClick={() => !plant.locked && onSelect(plant)}
      data-testid={`plant-card-${plant.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${plant.element_color}15`, border: `1px solid ${plant.element_color}25` }}>
            {plant.locked ? <Lock size={14} style={{ color: 'rgba(248,250,252,0.2)' }} />
              : <ElemIcon size={16} style={{ color: plant.element_color }} />}
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: plant.locked ? 'rgba(248,250,252,0.25)' : 'rgba(248,250,252,0.7)' }}>
              {plant.name}
            </p>
            <p className="text-[9px] italic" style={{ color: 'rgba(248,250,252,0.2)' }}>{plant.latin}</p>
          </div>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: rarity.bg, border: `1px solid ${rarity.border}`, color: rarity.color }}>
          {rarity.label}
        </span>
      </div>

      {!plant.locked && (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[8px] px-1.5 py-0.5 rounded-full"
              style={{ background: `${plant.nature_color}15`, color: plant.nature_color, border: `1px solid ${plant.nature_color}25` }}>
              {plant.nature}
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full"
              style={{ background: `${plant.element_color}15`, color: plant.element_color, border: `1px solid ${plant.element_color}25` }}>
              {plant.element}
            </span>
            <span className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
              {plant.frequency}Hz
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {plant.properties.slice(0, 3).map(p => (
              <span key={p} className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.35)' }}>{p}</span>
            ))}
          </div>
        </>
      )}
      {plant.locked && (
        <p className="text-[9px] mt-1" style={{ color: 'rgba(248,250,252,0.15)' }}>{plant.locked_reason}</p>
      )}
    </motion.button>
  );
}

function PlantDetail({ plant, onClose, onAddToGarden, gardenIds }) {
  const ElemIcon = ELEMENT_ICONS[plant.element] || Leaf;
  const rarity = RARITY_STYLES[plant.rarity] || RARITY_STYLES.common;
  const inGarden = gardenIds.has(plant.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="rounded-xl overflow-hidden" data-testid="plant-detail-panel"
      style={{ background: 'rgba(10,10,18,0.7)', border: `1px solid ${plant.element_color}20`, backdropFilter: 'blur(24px)' }}
    >
      {/* Header bar */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${plant.element_color}10, transparent)`, borderBottom: `1px solid ${plant.element_color}15` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${plant.element_color}20` }}>
            <ElemIcon size={20} style={{ color: plant.element_color }} />
          </div>
          <div>
            <h2 className="text-base font-medium" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif' }}>
              {plant.name}
            </h2>
            <p className="text-[9px] italic" style={{ color: 'rgba(248,250,252,0.3)' }}>{plant.latin} | {plant.family}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!inGarden && (
            <button onClick={() => onAddToGarden(plant.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-medium"
              style={{ background: `${plant.element_color}15`, color: plant.element_color, border: `1px solid ${plant.element_color}30` }}
              data-testid="add-to-garden-btn">
              <Plus size={10} /> Add to Garden
            </button>
          )}
          {inGarden && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-medium"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Leaf size={10} /> In Garden
            </span>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={14} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Energetic Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Element', value: plant.element, color: plant.element_color },
            { label: 'Nature', value: plant.nature, color: plant.nature_color },
            { label: 'Frequency', value: `${plant.frequency}Hz`, color: plant.element_color },
            { label: 'Mass', value: plant.gravity_mass, color: '#C084FC' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-2.5 text-center"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
              <p className="text-[7px] uppercase tracking-[0.15em]" style={{ color: `${s.color}99` }}>{s.label}</p>
              <p className="text-sm font-mono mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tastes & Meridians */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: plant.element_color }}>Tastes</p>
            <div className="flex flex-wrap gap-1">
              {plant.tastes.map(t => (
                <span key={t} className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: `${plant.element_color}10`, color: plant.element_color, border: `1px solid ${plant.element_color}20` }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: plant.element_color }}>Meridians</p>
            <div className="flex flex-wrap gap-1">
              {plant.meridians.map(m => (
                <span key={m} className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.45)' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Energetic Profile */}
        {plant.energetic_profile && (
          <div className="rounded-lg p-3" style={{ background: `${plant.element_color}05`, border: `1px solid ${plant.element_color}12` }}>
            <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: plant.element_color }}>Energetic Profile</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(plant.energetic_profile).map(([k, v]) => (
                <div key={k}>
                  <p className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.2)' }}>{k.replace(/_/g, ' ')}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.5)' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TCM Actions */}
        <div>
          <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: plant.element_color }}>TCM Actions</p>
          <div className="space-y-1">
            {plant.tcm_actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight size={10} className="mt-0.5 shrink-0" style={{ color: plant.element_color }} />
                <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.55)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traditional Use */}
        <div>
          <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: plant.element_color }}>Traditional Use</p>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>{plant.traditional_use}</p>
        </div>

        {/* Spiritual */}
        <div className="rounded-lg p-3" style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.1)' }}>
          <p className="text-[8px] uppercase tracking-[0.15em] mb-1" style={{ color: '#C084FC' }}>Spiritual Resonance</p>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>{plant.spiritual}</p>
        </div>

        {/* Trade Value + Growing */}
        <div className="grid grid-cols-2 gap-3">
          {plant.trade_value && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)' }}>
              <p className="text-[8px] uppercase tracking-[0.15em] mb-1.5" style={{ color: '#EAB308' }}>Trade Value</p>
              <p className="text-lg font-mono" style={{ color: '#EAB308' }}>{plant.trade_value.base_credits}<span className="text-[9px] ml-1">credits</span></p>
              <p className="text-[8px] mt-1" style={{ color: 'rgba(248,250,252,0.25)' }}>
                Season x{plant.trade_value.seasonal_multiplier}
              </p>
            </div>
          )}
          {plant.growing && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
              <p className="text-[8px] uppercase tracking-[0.15em] mb-1.5" style={{ color: 'rgba(248,250,252,0.3)' }}>Growing</p>
              <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Zone {plant.growing.zone}</p>
              <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{plant.growing.sun}</p>
              <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{plant.growing.years_to_harvest}yr harvest</p>
            </div>
          )}
        </div>

        {/* Rarity badge */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
          <span className="text-[8px] px-2 py-1 rounded-full font-medium"
            style={{ background: rarity.bg, color: rarity.color, border: `1px solid ${rarity.border}` }}>
            {rarity.label} | Mass {plant.gravity_mass}
          </span>
          <span className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
            Parts: {plant.parts_used}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function GardenPanel({ garden, summary, onNurture, nurturing }) {
  if (!garden.length) {
    return (
      <div className="rounded-xl p-6 flex flex-col items-center justify-center"
        style={{ background: 'rgba(10,10,18,0.3)', border: '1px dashed rgba(248,250,252,0.05)', minHeight: 300 }}>
        <Leaf size={28} style={{ color: 'rgba(248,250,252,0.08)' }} />
        <p className="text-[10px] mt-3" style={{ color: 'rgba(248,250,252,0.15)' }}>Your garden is empty</p>
        <p className="text-[9px] mt-1" style={{ color: 'rgba(248,250,252,0.1)' }}>Add plants from the catalog</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="garden-panel">
      {/* Garden Summary */}
      {summary && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(10,10,18,0.5)', border: '1px solid rgba(248,250,252,0.04)' }}>
          <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>Garden Energetics</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>Dominant</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>{summary.dominant_element}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>Nature</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>{summary.dominant_nature}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>Frequency</p>
              <p className="text-xs font-mono" style={{ color: 'rgba(248,250,252,0.5)' }}>{summary.garden_frequency}Hz</p>
            </div>
          </div>
        </div>
      )}

      {/* Plant list */}
      {garden.map(g => {
        const nurturedToday = g.last_nurtured === new Date().toISOString().split('T')[0];
        return (
          <div key={g.id} className="rounded-lg p-3 flex items-center justify-between"
            style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
            data-testid={`garden-plant-${g.plant_id}`}>
            <div className="flex items-center gap-2">
              <Leaf size={14} style={{ color: g.element === 'Fire' ? '#EF4444' : g.element === 'Water' ? '#3B82F6' : '#22C55E' }} />
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>{g.plant_name}</p>
                <p className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>{g.stage} | Nurtured {g.nurture_count}x</p>
              </div>
            </div>
            <button
              disabled={nurturedToday || nurturing === g.id}
              onClick={() => onNurture(g.id)}
              className="px-2.5 py-1 rounded-full text-[8px] font-medium transition-all"
              style={{
                background: nurturedToday ? 'rgba(248,250,252,0.02)' : 'rgba(34,197,94,0.1)',
                color: nurturedToday ? 'rgba(248,250,252,0.15)' : '#22C55E',
                border: `1px solid ${nurturedToday ? 'rgba(248,250,252,0.03)' : 'rgba(34,197,94,0.2)'}`,
                cursor: nurturedToday ? 'default' : 'pointer',
              }}
              data-testid={`nurture-btn-${g.plant_id}`}
            >
              {nurturing === g.id ? <Loader2 size={10} className="animate-spin" /> : nurturedToday ? 'Nurtured' : 'Nurture'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function IdentifyPanel({ onIdentify, identifying, result }) {
  const [desc, setDesc] = useState('');

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(10,10,18,0.5)', border: '1px solid rgba(248,250,252,0.04)' }}
      data-testid="identify-panel">
      <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: '#C084FC' }}>
        <Sparkles size={10} className="inline mr-1" /> AI Plant Identification
      </p>
      <div className="flex gap-2 mb-3">
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Describe a plant (name, leaves, flowers...)"
          className="flex-1 px-3 py-2 rounded-lg text-[10px]"
          style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }}
          data-testid="identify-input" />
        <button onClick={() => { if (desc.trim()) onIdentify(desc); }}
          disabled={identifying || !desc.trim()}
          className="px-3 py-2 rounded-lg text-[9px] font-medium"
          style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.25)' }}
          data-testid="identify-btn">
          {identifying ? <Loader2 size={12} className="animate-spin" /> : 'Identify'}
        </button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-lg p-3" style={{ background: `${result.element_color || '#A3A3A3'}08`, border: `1px solid ${result.element_color || '#A3A3A3'}15` }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(248,250,252,0.7)' }}>
              {result.name} {result.latin ? <span className="italic text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>({result.latin})</span> : null}
            </p>
            <div className="flex gap-1.5 mb-2">
              <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${result.element_color}15`, color: result.element_color }}>{result.element}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${result.nature_color}15`, color: result.nature_color }}>{result.nature}</span>
              <span className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.3)' }}>{result.frequency}Hz</span>
            </div>
            {result.tcm_actions && result.tcm_actions.map((a, i) => (
              <p key={i} className="text-[9px] ml-2" style={{ color: 'rgba(248,250,252,0.4)' }}>- {a}</p>
            ))}
            {result.preparation_suggestion && (
              <p className="text-[9px] mt-2 italic" style={{ color: 'rgba(248,250,252,0.35)' }}>{result.preparation_suggestion}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Botany() {
  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const [plants, setPlants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [garden, setGarden] = useState([]);
  const [gardenSummary, setGardenSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState(null);
  const [nurturing, setNurturing] = useState(null);
  const [view, setView] = useState('catalog'); // catalog | garden
  const [elementColors, setElementColors] = useState({});

  const gardenIds = new Set(garden.map(g => g.plant_id));

  const loadData = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const [catRes, gardenRes] = await Promise.all([
        axios.get(`${API}/botany/catalog`, { headers: authHeaders }),
        axios.get(`${API}/botany/garden`, { headers: authHeaders }),
      ]);
      setPlants(catRes.data.plants || []);
      setElementColors(catRes.data.element_colors || {});
      setGarden(gardenRes.data.garden || []);
      setGardenSummary(gardenRes.data.summary || null);
    } catch {
      toast.error('Failed to load botanical data');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddToGarden = useCallback(async (plantId) => {
    try {
      await axios.post(`${API}/botany/garden/add`, { plant_id: plantId }, { headers: authHeaders });
      toast.success('Plant added to your garden');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not add plant');
    }
  }, [authHeaders, loadData]);

  const handleNurture = useCallback(async (gardenId) => {
    setNurturing(gardenId);
    try {
      const res = await axios.post(`${API}/botany/garden/nurture`, { garden_id: gardenId }, { headers: authHeaders });
      if (res.data.grew) {
        toast.success(`Your plant grew to ${res.data.stage}!`);
      } else {
        toast.success(`Nurtured! Next stage in ${res.data.next_stage_in} days`);
      }
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not nurture');
    } finally {
      setNurturing(null);
    }
  }, [authHeaders, loadData]);

  const handleIdentify = useCallback(async (description) => {
    setIdentifying(true);
    setIdentifyResult(null);
    try {
      const res = await axios.post(`${API}/botany/identify`, { description }, { headers: authHeaders });
      setIdentifyResult(res.data.identification);
    } catch {
      toast.error('Identification failed');
    } finally {
      setIdentifying(false);
    }
  }, [authHeaders]);

  const filtered = plants.filter(p => {
    if (elementFilter && p.element !== elementFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.element.toLowerCase().includes(q) ||
      p.nature.toLowerCase().includes(q) || p.properties.some(pr => pr.toLowerCase().includes(q));
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
      <Loader2 className="animate-spin" size={28} style={{ color: '#22C55E' }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#06060e' }} data-testid="botany-page">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
              style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
              data-testid="botany-back-btn">
              <ArrowLeft size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
            </button>
            <div>
              <h1 className="text-xl font-light tracking-[0.2em] uppercase"
                style={{ color: 'rgba(248,250,252,0.3)', fontFamily: 'Cormorant Garamond, serif' }}>
                Botanical Codex
              </h1>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                Five Elements &middot; TCM Energetics &middot; {plants.filter(p => !p.locked).length} Unlocked
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {['catalog', 'garden'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-full text-[9px] font-medium tracking-wider uppercase"
                style={{
                  background: view === v ? 'rgba(34,197,94,0.12)' : 'rgba(248,250,252,0.03)',
                  color: view === v ? '#22C55E' : 'rgba(248,250,252,0.25)',
                  border: `1px solid ${view === v ? 'rgba(34,197,94,0.25)' : 'rgba(248,250,252,0.04)'}`,
                }}
                data-testid={`view-${v}-btn`}>
                {v === 'catalog' ? 'Codex' : `Garden (${garden.length})`}
              </button>
            ))}
          </div>
        </div>

        {view === 'catalog' ? (
          <div className="grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
            {/* Left — Filters + Plant List */}
            <div className="col-span-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.2)' }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search plants, elements, properties..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-[10px]"
                  style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }}
                  data-testid="botany-search" />
              </div>

              {/* Element filter chips */}
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => setElementFilter(null)}
                  className="px-2 py-1 rounded-full text-[8px] font-medium"
                  style={{
                    background: !elementFilter ? 'rgba(248,250,252,0.08)' : 'rgba(248,250,252,0.02)',
                    color: !elementFilter ? 'rgba(248,250,252,0.5)' : 'rgba(248,250,252,0.2)',
                    border: `1px solid ${!elementFilter ? 'rgba(248,250,252,0.12)' : 'rgba(248,250,252,0.04)'}`,
                  }}
                  data-testid="filter-all">All</button>
                {Object.entries(elementColors).map(([elem, color]) => {
                  const EIcon = ELEMENT_ICONS[elem] || Leaf;
                  return (
                    <button key={elem} onClick={() => setElementFilter(elementFilter === elem ? null : elem)}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium"
                      style={{
                        background: elementFilter === elem ? `${color}15` : 'rgba(248,250,252,0.02)',
                        color: elementFilter === elem ? color : 'rgba(248,250,252,0.2)',
                        border: `1px solid ${elementFilter === elem ? `${color}30` : 'rgba(248,250,252,0.04)'}`,
                      }}
                      data-testid={`filter-${elem.toLowerCase()}`}>
                      <EIcon size={9} /> {elem}
                    </button>
                  );
                })}
              </div>

              {/* Plant list */}
              <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                {filtered.map(p => <PlantCard key={p.id} plant={p} onSelect={setSelected} selected={selected} />)}
                {filtered.length === 0 && (
                  <p className="text-center text-[10px] py-8" style={{ color: 'rgba(248,250,252,0.15)' }}>No plants match</p>
                )}
              </div>
            </div>

            {/* Center — Detail + Identify */}
            <div className="col-span-5 space-y-4">
              <AnimatePresence mode="wait">
                {selected ? (
                  <PlantDetail key={selected.id} plant={selected} onClose={() => setSelected(null)}
                    onAddToGarden={handleAddToGarden} gardenIds={gardenIds} />
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-xl p-8 flex flex-col items-center justify-center"
                    style={{ background: 'rgba(10,10,18,0.3)', border: '1px dashed rgba(248,250,252,0.05)', minHeight: 400 }}>
                    <Leaf size={32} style={{ color: 'rgba(248,250,252,0.08)' }} />
                    <p className="text-xs mt-4" style={{ color: 'rgba(248,250,252,0.15)' }}>Select a plant to explore its energetic profile</p>
                    <p className="text-[9px] mt-1" style={{ color: 'rgba(248,250,252,0.1)' }}>
                      TCM Nature &middot; Five Elements &middot; Meridians &middot; Gravity Mass
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right — AI Identify + Garden Quick */}
            <div className="col-span-3 space-y-3">
              <IdentifyPanel onIdentify={handleIdentify} identifying={identifying} result={identifyResult} />

              {/* Quick garden view */}
              <div className="rounded-xl p-3" style={{ background: 'rgba(10,10,18,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[8px] uppercase tracking-[0.15em]" style={{ color: 'rgba(248,250,252,0.2)' }}>My Garden</p>
                  <span className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>{garden.length}/24</span>
                </div>
                {garden.slice(0, 5).map(g => (
                  <div key={g.id} className="flex items-center gap-2 py-1">
                    <Leaf size={10} style={{ color: '#22C55E' }} />
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{g.plant_name}</span>
                    <span className="text-[7px] ml-auto" style={{ color: 'rgba(248,250,252,0.15)' }}>{g.stage}</span>
                  </div>
                ))}
                {garden.length === 0 && (
                  <p className="text-[9px] text-center py-3" style={{ color: 'rgba(248,250,252,0.1)' }}>Empty</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Garden View */
          <div className="max-w-3xl mx-auto">
            <GardenPanel garden={garden} summary={gardenSummary} onNurture={handleNurture} nurturing={nurturing} />
          </div>
        )}
      </div>
    </div>
  );
}
