import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Atom, Layers, Sparkles, Zap, Lock, Eye, Radio, ArrowRight,
  Mountain, Flame, Droplets, ChevronRight, Compass, Grid3X3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DIM_ICONS = { '3d': Mountain, '4d': Eye, '5d': Sparkles };
const DEPTH_LABELS = { crust: 'Crust', mantle: 'Mantle', outer_core: 'Core', hollow_earth: 'Hollow' };
const DEPTH_COLORS = { crust: '#D97706', mantle: '#EF4444', outer_core: '#8B5CF6', hollow_earth: '#FBBF24' };

function GridCell({ cell, onSelect }) {
  const dimColor = cell.color;
  const depthColor = DEPTH_COLORS[cell.depth];
  const blendColor = cell.is_current ? dimColor : depthColor;

  return (
    <motion.div
      whileHover={cell.accessible ? { scale: 1.08, zIndex: 10 } : {}}
      whileTap={cell.accessible ? { scale: 0.95 } : {}}
      onClick={() => cell.accessible && !cell.is_current && onSelect(cell)}
      className="relative rounded-lg cursor-pointer transition-all overflow-hidden"
      style={{
        background: cell.is_current
          ? `${blendColor}18`
          : cell.accessible ? `${blendColor}06` : 'rgba(248,250,252,0.01)',
        border: cell.is_current
          ? `2px solid ${blendColor}50`
          : `1px solid ${cell.accessible ? `${blendColor}12` : 'rgba(248,250,252,0.03)'}`,
        opacity: cell.accessible ? 1 : 0.3,
        aspectRatio: '1',
      }}
      data-testid={`grid-cell-${cell.cell_id}`}
    >
      {cell.is_current && (
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle, ${blendColor}20 0%, transparent 70%)` }}
        />
      )}
      <div className="relative h-full flex flex-col items-center justify-center p-1">
        {cell.is_current && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: blendColor, boxShadow: `0 0 6px ${blendColor}` }} />
        )}
        {!cell.accessible && <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
      </div>
    </motion.div>
  );
}

function DimensionInfoPanel({ dimensions, currentDim, level }) {
  return (
    <div className="space-y-2" data-testid="dimension-info-panel">
      {dimensions.map(dim => {
        const Icon = DIM_ICONS[dim.id] || Atom;
        const isCurrent = dim.id === currentDim;
        const accessible = level >= dim.consciousness_required;
        return (
          <div key={dim.id} className="rounded-lg p-3 transition-all"
            style={{
              background: isCurrent ? `${dim.color}08` : 'rgba(248,250,252,0.015)',
              border: `1px solid ${isCurrent ? `${dim.color}20` : 'rgba(248,250,252,0.04)'}`,
              opacity: accessible ? 1 : 0.4,
            }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={12} style={{ color: dim.color }} />
              <span className="text-[10px] font-medium" style={{ color: dim.color }}>{dim.name}</span>
              {isCurrent && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                  style={{ background: `${dim.color}12`, color: dim.color }}>Current</span>
              )}
              {!accessible && <Lock size={8} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{dim.description}</p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {dim.mechanics?.map((m, i) => (
                <span key={i} className="text-[7px] px-1.5 py-0.5 rounded-full"
                  style={{ background: `${dim.color}06`, color: dim.color, border: `1px solid ${dim.color}08` }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhaseShiftModal({ currentDim, dimensions, level, dust, onShift, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,2,8,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="w-full max-w-sm rounded-xl p-5 space-y-3"
        style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(139,92,246,0.15)' }}
        onClick={e => e.stopPropagation()}
        data-testid="phase-shift-modal"
      >
        <h2 className="text-sm font-light text-center" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Phase-Shift
        </h2>
        <p className="text-[8px] text-center" style={{ color: 'var(--text-muted)' }}>
          Tune your vibrational frequency to shift dimensions
        </p>
        <div className="space-y-2">
          {dimensions.filter(d => d.id !== currentDim).map(dim => {
            const Icon = DIM_ICONS[dim.id] || Atom;
            const accessible = level >= dim.consciousness_required;
            const currentFreq = dimensions.find(d => d.id === currentDim)?.frequency || 3;
            const shiftUp = dim.frequency > currentFreq;
            const cost = shiftUp ? Math.abs(dim.frequency - currentFreq) * 30 : 0;
            const affordable = dust >= cost;

            return (
              <button key={dim.id}
                disabled={!accessible || !affordable}
                onClick={() => onShift(dim.id)}
                className="w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-30"
                style={{ background: `${dim.color}06`, border: `1px solid ${dim.color}10` }}
                data-testid={`shift-to-${dim.id}`}
              >
                <Icon size={16} style={{ color: dim.color }} />
                <div className="flex-1">
                  <p className="text-[10px] font-medium" style={{ color: dim.color }}>{dim.name}</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{dim.key_attribute}</p>
                </div>
                <div className="text-right">
                  {cost > 0 ? (
                    <span className="text-[9px]" style={{ color: affordable ? '#2DD4BF' : '#EF4444' }}>
                      {cost} Dust
                    </span>
                  ) : (
                    <span className="text-[8px]" style={{ color: '#2DD4BF' }}>Free</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full text-[9px] py-1.5" style={{ color: 'var(--text-muted)' }}>Cancel</button>
      </motion.div>
    </motion.div>
  );
}

export default function DimensionalSpace() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [position, setPosition] = useState({ depth: 'crust', dimension: '3d' });
  const [level, setLevel] = useState(1);
  const [totalShifts, setTotalShifts] = useState(0);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [dust, setDust] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [gridRes, statusRes] = await Promise.all([
        axios.get(`${API}/dimensions/grid`, { headers: authHeaders }),
        axios.get(`${API}/quantum/tunneling-costs`, { headers: authHeaders }),
      ]);
      setGrid(gridRes.data.grid || []);
      setDimensions(gridRes.data.dimensions || []);
      setPosition(gridRes.data.current_position || { depth: 'crust', dimension: '3d' });
      setLevel(gridRes.data.consciousness_level || 1);
      setTotalShifts(gridRes.data.total_shifts || 0);
      setDust(statusRes.data.dust_balance || 0);
    } catch (e) { console.error('Dimensional fetch failed', e); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleShift = async (targetDim) => {
    try {
      await axios.post(`${API}/dimensions/phase-shift`, { target_dimension: targetDim }, { headers: authHeaders });
      setShowShiftModal(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || 'Phase-shift failed');
    }
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

  const depths = ['crust', 'mantle', 'outer_core', 'hollow_earth'];
  const dims = ['3d', '4d', '5d'];

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-5" data-testid="dimensional-space-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Dimensional Space
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          The Multiverse Grid — {totalShifts} phase-shifts
        </p>
      </motion.div>

      {/* Current position */}
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
        <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Current Position</p>
        <p className="text-sm font-light" style={{ color: '#8B5CF6', fontFamily: 'Cormorant Garamond, serif' }}>
          {DEPTH_LABELS[position.depth]} × {dimensions.find(d => d.id === position.dimension)?.name || position.dimension}
        </p>
        <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Cell: {position.cell_id} | Level {level} | {dust} Dust
        </p>
      </div>

      {/* 12-Cell Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-2 mb-2">
          <Grid3X3 size={11} style={{ color: '#8B5CF6' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Multiverse Grid (4×3)
          </span>
        </div>

        {/* Column headers (dimensions) */}
        <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-1 mb-1">
          <div />
          {dims.map(d => {
            const dim = dimensions.find(dm => dm.id === d);
            const Icon = DIM_ICONS[d] || Atom;
            return (
              <div key={d} className="text-center">
                <Icon size={10} className="mx-auto mb-0.5" style={{ color: dim?.color || '#8B5CF6' }} />
                <span className="text-[7px] uppercase tracking-widest" style={{ color: dim?.color || '#8B5CF6' }}>
                  {d}
                </span>
              </div>
            );
          })}
        </div>

        {/* Grid rows (depths) */}
        {depths.map(depth => (
          <div key={depth} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-1 mb-1">
            {/* Row label */}
            <div className="flex items-center justify-end pr-2">
              <span className="text-[7px] uppercase tracking-widest text-right" style={{ color: DEPTH_COLORS[depth] }}>
                {DEPTH_LABELS[depth]}
              </span>
            </div>
            {/* Cells */}
            {dims.map(dim => {
              const cell = grid.find(c => c.depth === depth && c.dimension === dim);
              return cell ? (
                <GridCell key={cell.cell_id} cell={cell} onSelect={() => setShowShiftModal(true)} />
              ) : (
                <div key={`${depth}_${dim}`} className="rounded-lg" style={{ background: 'rgba(248,250,252,0.01)', aspectRatio: '1' }} />
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* Phase-Shift button */}
      <button
        onClick={() => setShowShiftModal(true)}
        className="w-full py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.15)' }}
        data-testid="phase-shift-btn"
      >
        <Atom size={12} /> Phase-Shift Dimension
      </button>

      {/* Dimension descriptions */}
      <DimensionInfoPanel dimensions={dimensions} currentDim={position.dimension} level={level} />

      {/* Navigation links */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => navigate('/planetary-depths')}
          className="py-2 rounded-lg text-[9px] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(217,119,6,0.06)', color: '#D97706', border: '1px solid rgba(217,119,6,0.1)' }}
          data-testid="nav-planetary">
          <Layers size={10} /> Planetary Depths
        </button>
        <button onClick={() => navigate('/quantum-field')}
          className="py-2 rounded-lg text-[9px] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.1)' }}
          data-testid="nav-quantum">
          <Eye size={10} /> Quantum Field
        </button>
      </div>

      {/* Phase-Shift Modal */}
      <AnimatePresence>
        {showShiftModal && (
          <PhaseShiftModal
            currentDim={position.dimension}
            dimensions={dimensions}
            level={level}
            dust={dust}
            onShift={handleShift}
            onClose={() => setShowShiftModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
