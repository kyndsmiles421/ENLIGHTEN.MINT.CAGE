import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Grid3X3, ChevronRight, Lock, Sparkles, Zap,
  Mountain, Flame, Droplets, Radio, Eye, Atom, MapPin
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DEPTH_ICONS = { earth: Mountain, fire: Flame, water: Droplets, ether: Sparkles };

function FractalGrid({ depth, onNavigate }) {
  if (!depth || !depth.sublayers) return null;
  const L = depth.L;
  const rows = [];
  for (let r = 0; r < L; r++) {
    const cols = depth.sublayers.filter(s => s.row === r);
    rows.push(cols);
  }

  return (
    <div className="space-y-1" data-testid={`fractal-grid-${depth.depth_id}`}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map(sub => (
            <motion.button
              key={sub.id}
              whileHover={!sub.explored || sub.is_current ? {} : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(sub)}
              className="flex-1 rounded-lg p-2 text-center transition-all relative overflow-hidden"
              style={{
                background: sub.is_current
                  ? `${depth.color}18`
                  : sub.explored ? `${depth.color}06` : 'rgba(248,250,252,0.015)',
                border: sub.is_current
                  ? `2px solid ${depth.color}50`
                  : `1px solid ${sub.explored ? `${depth.color}12` : 'rgba(248,250,252,0.04)'}`,
                minHeight: L <= 3 ? '70px' : L <= 4 ? '55px' : '44px',
              }}
              data-testid={`sublayer-${sub.id}`}
            >
              {sub.is_current && (
                <motion.div className="absolute inset-0"
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ background: `radial-gradient(circle, ${depth.color}20 0%, transparent 70%)` }} />
              )}
              <div className="relative">
                <p className="text-[7px] font-medium truncate"
                  style={{ color: sub.is_current ? depth.color : sub.explored ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {sub.name}
                </p>
                <p className="text-[6px] font-mono mt-0.5"
                  style={{ color: sub.is_current ? depth.color : 'var(--text-muted)' }}>
                  {sub.frequency_hz}Hz
                </p>
                {sub.is_current && (
                  <div className="w-1 h-1 rounded-full mx-auto mt-0.5"
                    style={{ background: depth.color, boxShadow: `0 0 4px ${depth.color}` }} />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
}

function DepthCard({ depth, isExpanded, onToggle, onNavigate }) {
  const Icon = DEPTH_ICONS[depth.element] || Layers;
  return (
    <motion.div layout className="rounded-xl overflow-hidden"
      style={{ background: `${depth.color}03`, border: `1px solid ${depth.color}08` }}
      data-testid={`depth-card-${depth.depth_id}`}>
      {/* Header */}
      <button onClick={() => depth.accessible && onToggle(depth.depth_id)}
        className="w-full p-3 flex items-center gap-3 text-left"
        disabled={!depth.accessible}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${depth.color}08`, border: `1px solid ${depth.color}15` }}>
          <Icon size={14} style={{ color: depth.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-medium" style={{ color: depth.accessible ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {depth.name}
            </h3>
            {depth.is_current && (
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: `${depth.color}12`, color: depth.color }}>Here</span>
            )}
            {!depth.accessible && <Lock size={8} style={{ color: 'var(--text-muted)' }} />}
          </div>
          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            L²={depth.sub_count} sub-layers | {depth.frequency_hz}Hz | {depth.resonance_quality}
          </p>
        </div>
        {/* Progress */}
        <div className="text-right shrink-0">
          <p className="text-[10px] font-mono" style={{ color: depth.color }}>
            {depth.explored_count}/{depth.sub_count}
          </p>
          <div className="w-16 h-1 rounded-full mt-0.5" style={{ background: `${depth.color}10` }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${depth.completion_pct}%`, background: depth.color,
            }} />
          </div>
        </div>
        <ChevronRight size={12} className="shrink-0 transition-transform"
          style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
      </button>

      {/* Fractal grid (unfolded) */}
      <AnimatePresence>
        {isExpanded && depth.sublayers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3 overflow-hidden"
          >
            <FractalGrid depth={depth} onNavigate={onNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FractalEngine() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [depths, setDepths] = useState([]);
  const [currentDepth, setCurrentDepth] = useState('crust');
  const [currentSub, setCurrentSub] = useState(null);
  const [totalExplored, setTotalExplored] = useState(0);
  const [explorationPct, setExplorationPct] = useState(0);
  const [expandedDepth, setExpandedDepth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/sublayers/fractal-map`, { headers: authHeaders });
      setDepths(res.data.depths || []);
      setCurrentDepth(res.data.current_depth);
      setCurrentSub(res.data.current_sublayer);
      setTotalExplored(res.data.total_explored);
      setExplorationPct(res.data.exploration_pct);
      setExpandedDepth(res.data.current_depth);
    } catch (e) { console.error('Fractal map failed', e); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleNavigate = async (sub) => {
    try {
      await axios.post(`${API}/sublayers/navigate`, { sublayer_id: sub.id }, { headers: authHeaders });
      fetchData();
    } catch (e) { alert(e.response?.data?.detail || 'Navigation failed'); }
  };

  const handleToggle = async (depthId) => {
    if (expandedDepth === depthId) {
      setExpandedDepth(null);
      return;
    }
    // If not current depth, fetch its sublayers
    const depth = depths.find(d => d.depth_id === depthId);
    if (!depth?.sublayers) {
      try {
        const res = await axios.get(`${API}/sublayers/depth/${depthId}`, { headers: authHeaders });
        setDepths(prev => prev.map(d =>
          d.depth_id === depthId ? { ...d, sublayers: res.data.sublayers } : d
        ));
      } catch (e) { alert(e.response?.data?.detail || 'Cannot access this depth'); return; }
    }
    setExpandedDepth(depthId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Grid3X3 size={28} style={{ color: '#8B5CF6' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-5" data-testid="fractal-engine-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Fractal Engine
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          L² Sub-Layer Navigation — 54 Total Layers
        </p>
      </motion.div>

      {/* Overview stats */}
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
        <div className="flex justify-center gap-6">
          <div>
            <p className="text-lg font-light" style={{ color: '#8B5CF6', fontFamily: 'Cormorant Garamond, serif' }}>
              {totalExplored}/54
            </p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Explored</p>
          </div>
          <div>
            <p className="text-lg font-light" style={{ color: '#2DD4BF', fontFamily: 'Cormorant Garamond, serif' }}>
              {explorationPct}%
            </p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Complete</p>
          </div>
        </div>
        {/* Global progress bar */}
        <div className="w-full h-1.5 rounded-full mt-2" style={{ background: 'rgba(248,250,252,0.05)' }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${explorationPct}%` }}
            style={{ background: 'linear-gradient(90deg, #D97706, #EF4444, #8B5CF6, #FBBF24)' }} />
        </div>
        <p className="text-[7px] mt-1" style={{ color: 'var(--text-muted)' }}>
          L² = {'{'}2², 3², 4², 5²{'}'} = {'{'}4, 9, 16, 25{'}'} = 54 sub-layers
        </p>
      </div>

      {/* Depth cards with fractal grids */}
      <div className="space-y-2">
        {depths.map(depth => (
          <DepthCard
            key={depth.depth_id}
            depth={depth}
            isExpanded={expandedDepth === depth.depth_id}
            onToggle={handleToggle}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* Navigation links */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => navigate('/mastery-avenues')}
          className="py-2 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(6,182,212,0.06)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.1)' }}
          data-testid="nav-avenues">
          <Sparkles size={10} /> Mastery Avenues
        </button>
        <button onClick={() => navigate('/master-view')}
          className="py-2 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(45,212,191,0.06)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.1)' }}
          data-testid="nav-master">
          <Eye size={10} /> Master View
        </button>
      </div>
    </div>
  );
}
