import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Mountain, Flame, Droplets, Sparkles, ChevronDown, ChevronUp,
  Lock, Unlock, Zap, Radio, Eye, Layers, ArrowDown, Atom,
  Activity, Shield, User, Heart, Brain, Sun, Waves
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LAYER_ICONS = { earth: Mountain, fire: Flame, water: Droplets, ether: Sparkles };
const PSYCHE_ICONS = { persona: User, shadow: Eye, anima: Heart, self: Sun };

const LAYER_GRADIENTS = {
  crust: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, rgba(217,119,6,0.12) 100%)',
  mantle: 'linear-gradient(180deg, rgba(239,68,68,0.04) 0%, rgba(239,68,68,0.12) 100%)',
  outer_core: 'linear-gradient(180deg, rgba(139,92,246,0.04) 0%, rgba(139,92,246,0.12) 100%)',
  hollow_earth: 'linear-gradient(180deg, rgba(251,191,36,0.04) 0%, rgba(251,191,36,0.14) 100%)',
};

function CrossSectionViz({ layers, currentLayer, onSelect }) {
  return (
    <div className="relative w-full" style={{ height: '340px' }} data-testid="cross-section-viz">
      {/* Planet surface arc */}
      <div className="absolute top-0 left-0 right-0 h-8 rounded-t-[100%] opacity-30"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.2) 0%, transparent 100%)' }} />

      {layers.map((layer, i) => {
        const height = i === 3 ? 100 : 80;
        const topOffset = 8 + i * 83;
        const Icon = LAYER_ICONS[layer.element] || Mountain;
        const isCurrent = layer.is_current;
        const accessible = layer.accessible;

        return (
          <motion.div
            key={layer.id}
            className="absolute left-0 right-0 cursor-pointer group"
            style={{ top: `${topOffset}px`, height: `${height}px` }}
            whileHover={accessible ? { scale: 1.01 } : {}}
            onClick={() => accessible && onSelect(layer)}
            data-testid={`layer-${layer.id}`}
          >
            {/* Layer band */}
            <div className="absolute inset-0 rounded-lg transition-all duration-300 overflow-hidden"
              style={{
                background: LAYER_GRADIENTS[layer.id],
                border: isCurrent
                  ? `1px solid ${layer.color}60`
                  : `1px solid ${layer.color}15`,
                opacity: accessible ? 1 : 0.4,
              }}>
              {/* Animated depth lines */}
              {[...Array(3)].map((_, li) => (
                <div key={li} className="absolute left-0 right-0 h-px"
                  style={{
                    top: `${25 + li * 25}%`,
                    background: `linear-gradient(90deg, transparent, ${layer.color}15, transparent)`,
                  }} />
              ))}

              {/* Current indicator glow */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.05, 0.12, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ background: `radial-gradient(ellipse at center, ${layer.color}15 0%, transparent 70%)` }}
                />
              )}
            </div>

            {/* Layer content */}
            <div className="relative h-full flex items-center px-4 gap-3">
              {/* Depth index */}
              <div className="w-8 text-center shrink-0">
                <span className="text-[9px] font-mono" style={{ color: layer.color }}>
                  {layer.frequency_hz}Hz
                </span>
              </div>

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${layer.color}08`, border: `1px solid ${layer.color}15` }}>
                <Icon size={14} style={{ color: layer.color }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium truncate" style={{ color: accessible ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {layer.name}
                  </h3>
                  {isCurrent && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                      style={{ background: `${layer.color}12`, color: layer.color, border: `1px solid ${layer.color}20` }}>
                      You are here
                    </span>
                  )}
                  {!accessible && <Lock size={9} style={{ color: 'var(--text-muted)' }} />}
                </div>
                <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {layer.subtitle} — {layer.archetype_name}
                </p>
              </div>

              {/* Physics badges */}
              <div className="flex gap-1 shrink-0">
                <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)' }}>
                  G:{layer.physics?.gravity}x
                </span>
                <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)' }}>
                  P:{layer.physics?.pressure}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Drill line */}
      <div className="absolute left-[52px] top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, #D9770620, #EF444420, #8B5CF620, #FBBF2420)' }} />
    </div>
  );
}

function DescentModal({ layer, onDescend, onTunnel, onClose, tunnelCosts, dust }) {
  if (!layer) return null;
  const Icon = LAYER_ICONS[layer.element] || Mountain;
  const PsycheIcon = PSYCHE_ICONS[layer.archetype] || User;
  const tunnelInfo = tunnelCosts?.find(c => c.target === layer.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full flex flex-col p-4"
        style={{ background: 'rgba(2,2,8,0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md rounded-xl p-5 space-y-4"
          style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${layer.color}20` }}
          onClick={e => e.stopPropagation()}
          data-testid="descent-modal"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${layer.color}10`, border: `1px solid ${layer.color}20` }}>
              <Icon size={18} style={{ color: layer.color }} />
            </div>
            <div>
              <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{layer.name}</h2>
              <p className="text-[9px]" style={{ color: layer.color }}>{layer.subtitle} — {layer.frequency_hz} Hz</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {layer.description}
          </p>

          {/* Archetype */}
          <div className="rounded-lg p-3" style={{ background: `${layer.color}04`, border: `1px solid ${layer.color}08` }}>
            <div className="flex items-center gap-2 mb-1">
              <PsycheIcon size={11} style={{ color: layer.color }} />
              <span className="text-[9px] font-medium" style={{ color: layer.color }}>{layer.archetype_name}</span>
            </div>
            <p className="text-[8px] italic" style={{ color: 'var(--text-muted)' }}>{layer.archetype_desc}</p>
          </div>

          {/* Physics */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Gravity', value: `${layer.physics?.gravity}x`, icon: ArrowDown },
              { label: 'Pressure', value: `${layer.physics?.pressure}x`, icon: Activity },
              { label: 'Visibility', value: `${(layer.physics?.visibility * 100).toFixed(0)}%`, icon: Eye },
              { label: 'Frequency', value: `${layer.frequency_hz}Hz`, icon: Radio },
            ].map(p => (
              <div key={p.label} className="text-center p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
                <p.icon size={10} className="mx-auto mb-0.5" style={{ color: layer.color }} />
                <p className="text-[8px] font-medium" style={{ color: 'var(--text-secondary)' }}>{p.value}</p>
                <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{p.label}</p>
              </div>
            ))}
          </div>

          {/* Biome */}
          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            <Layers size={8} className="inline mr-1" />Biome: {layer.biome}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onDescend(layer.id)}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
              style={{ background: `${layer.color}10`, color: layer.color, border: `1px solid ${layer.color}20` }}
              data-testid="descend-btn"
            >
              <ChevronDown size={12} /> Descend
            </button>
            {tunnelInfo && (
              <button
                onClick={() => onTunnel(layer.id)}
                disabled={!tunnelInfo.affordable || !tunnelInfo.consciousness_met}
                className="flex-1 py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-30"
                style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.15)' }}
                data-testid="tunnel-btn"
              >
                <Atom size={12} /> Tunnel ({tunnelInfo.cost} Dust)
              </button>
            )}
          </div>

          <button onClick={onClose} className="w-full text-[9px] py-1.5" style={{ color: 'var(--text-muted)' }}>
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TransitionOverlay({ from, to, onComplete }) {
  const toLayer = to || {};
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(2,2,8,0.95)' }}
      data-testid="transition-overlay"
    >
      {/* Frequency sweep visualization */}
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${toLayer.color || '#8B5CF6'}20 0%, transparent 70%)`,
            border: `2px solid ${toLayer.color || '#8B5CF6'}30`,
          }}
        >
          <Waves size={28} style={{ color: toLayer.color || '#8B5CF6' }} />
        </motion.div>

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-light tracking-wider"
          style={{ color: toLayer.color || '#8B5CF6', fontFamily: 'Cormorant Garamond, serif' }}
        >
          Vibrational Shift
        </motion.p>

        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {from} Hz → {toLayer.frequency_hz || '???'} Hz
        </p>

        <motion.div className="w-48 h-1 mx-auto rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.05)' }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.8 }}
            className="h-full rounded-full"
            style={{ background: toLayer.color || '#8B5CF6' }}
          />
        </motion.div>

        <p className="text-[8px] italic" style={{ color: 'var(--text-muted)' }}>
          {toLayer.archetype_desc || 'Shifting probability density...'}
        </p>
      </div>
    </motion.div>
  );
}

function PsychePanel({ psycheState, psycheInfo }) {
  if (!psycheInfo) return null;
  const Icon = PSYCHE_ICONS[psycheState] || User;
  return (
    <div className="rounded-xl p-3" style={{ background: `${psycheInfo.color}04`, border: `1px solid ${psycheInfo.color}08` }}
      data-testid="psyche-panel">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={12} style={{ color: psycheInfo.color }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: psycheInfo.color }}>
          Current Archetype
        </span>
      </div>
      <h3 className="text-sm font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
        {psycheInfo.name}
      </h3>
      <p className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>
        Depth: {psycheInfo.depth?.replace('_', ' ')} | Element: {psycheInfo.element}
      </p>
    </div>
  );
}

export default function PlanetaryDepths() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [layers, setLayers] = useState([]);
  const [currentLayer, setCurrentLayer] = useState('crust');
  const [psycheState, setPsycheState] = useState('persona');
  const [psycheInfo, setPsycheInfo] = useState(null);
  const [totalDescents, setTotalDescents] = useState(0);
  const [level, setLevel] = useState(1);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [tunnelCosts, setTunnelCosts] = useState([]);
  const [dust, setDust] = useState(0);
  const [transitioning, setTransitioning] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [layerRes, costRes] = await Promise.all([
        axios.get(`${API}/planetary/layers`, { headers: authHeaders }),
        axios.get(`${API}/quantum/tunneling-costs`, { headers: authHeaders }),
      ]);
      setLayers(layerRes.data.layers || []);
      setCurrentLayer(layerRes.data.current_layer);
      setPsycheState(layerRes.data.psyche_state);
      setPsycheInfo(layerRes.data.psyche_info);
      setTotalDescents(layerRes.data.total_descents);
      setLevel(layerRes.data.consciousness_level);
      setTunnelCosts(costRes.data.costs || []);
      setDust(costRes.data.dust_balance || 0);
    } catch (e) {
      console.error('Failed to load planetary data', e);
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDescend = async (layerId) => {
    try {
      const currentInfo = layers.find(l => l.id === currentLayer);
      const targetInfo = layers.find(l => l.id === layerId);
      setSelectedLayer(null);
      setTransitioning({ from: currentInfo?.frequency_hz || 432, to: targetInfo });

      await axios.post(`${API}/planetary/descend`, { target_layer: layerId }, { headers: authHeaders });
    } catch (e) {
      setTransitioning(null);
      alert(e.response?.data?.detail || 'Descent failed');
    }
  };

  const handleTunnel = async (layerId) => {
    try {
      const targetInfo = layers.find(l => l.id === layerId);
      setSelectedLayer(null);
      setTransitioning({ from: layers.find(l => l.id === currentLayer)?.frequency_hz || 432, to: targetInfo });

      await axios.post(`${API}/quantum/tunnel`, { target_layer: layerId }, { headers: authHeaders });
    } catch (e) {
      setTransitioning(null);
      alert(e.response?.data?.detail || 'Tunneling failed');
    }
  };

  const onTransitionComplete = () => {
    setTransitioning(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Atom size={28} style={{ color: '#8B5CF6' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-5" data-testid="planetary-depths-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Planetary Depths
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Stratigraphy of Consciousness — {totalDescents} total descents
        </p>
      </motion.div>

      {/* Psyche Panel */}
      <PsychePanel psycheState={psycheState} psycheInfo={psycheInfo} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Layer', value: currentLayer.replace('_', ' '), color: layers.find(l => l.id === currentLayer)?.color || '#D97706' },
          { label: 'Consciousness', value: `Level ${level}`, color: '#F472B6' },
          { label: 'Dust', value: dust, color: '#2DD4BF' },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: `${s.color}04`, border: `1px solid ${s.color}08` }}>
            <p className="text-[10px] font-medium capitalize" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cross-section visualization */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-2">
          <Layers size={11} style={{ color: '#8B5CF6' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Cross-Section View
          </span>
        </div>
        <CrossSectionViz layers={layers} currentLayer={currentLayer} onSelect={setSelectedLayer} />
      </motion.div>

      {/* Quantum Tunneling quick access */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Atom size={11} style={{ color: '#8B5CF6' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#8B5CF6' }}>
            Quantum Tunneling
          </span>
          {level < 2 && <Lock size={9} style={{ color: 'var(--text-muted)' }} />}
        </div>
        {level >= 2 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {tunnelCosts.map(c => (
              <button
                key={c.target}
                disabled={!c.affordable || !c.consciousness_met}
                onClick={() => handleTunnel(c.target)}
                className="p-2 rounded-lg text-[9px] text-left transition-all hover:scale-[1.02] disabled:opacity-30"
                style={{
                  background: 'rgba(248,250,252,0.02)',
                  border: '1px solid rgba(248,250,252,0.04)',
                  color: c.affordable && c.consciousness_met ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}
                data-testid={`tunnel-to-${c.target}`}
              >
                <span className="capitalize">{c.target.replace('_', ' ')}</span>
                <span className="ml-1 opacity-60">({c.cost} dust)</span>
                {c.direction === 'descend' ? <ChevronDown size={8} className="inline ml-1" /> : <ChevronUp size={8} className="inline ml-1" />}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            Reach Consciousness Level 2 to unlock Quantum Tunneling
          </p>
        )}
      </motion.div>

      {/* Frequency map */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Radio size={11} style={{ color: '#FBBF24' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Frequency Spectrum
          </span>
        </div>
        <div className="flex items-center gap-1 h-6">
          {layers.map((l, i) => (
            <div key={l.id} className="flex-1 h-full rounded-sm relative group"
              style={{
                background: `linear-gradient(90deg, ${l.color}15, ${l.color}08)`,
                border: l.id === currentLayer ? `1px solid ${l.color}30` : '1px solid transparent',
              }}>
              <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono"
                style={{ color: l.color }}>
                {l.frequency_hz}Hz
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Surface (432 Hz)</span>
          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Inner Core (174 Hz)</span>
        </div>
      </div>

      {/* Shadow Sprites CTA */}
      <button
        onClick={() => navigate('/quantum-field')}
        className="w-full py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.12)' }}
        data-testid="shadow-sprites-cta"
      >
        <Eye size={12} /> Observe Shadow Sprites in the Quantum Field
      </button>

      {/* Descent Modal */}
      {selectedLayer && (
        <DescentModal
          layer={selectedLayer}
          onDescend={handleDescend}
          onTunnel={handleTunnel}
          onClose={() => setSelectedLayer(null)}
          tunnelCosts={tunnelCosts}
          dust={dust}
        />
      )}

      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <TransitionOverlay
            from={transitioning.from}
            to={transitioning.to}
            onComplete={onTransitionComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
