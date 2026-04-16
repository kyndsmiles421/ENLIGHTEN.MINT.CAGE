/**
 * ENLIGHTEN.MINT.CAFE - V64.0 ALCHEMICAL LAB (UNIFIED MIXER)
 * 
 * The "Proper Mixer" where you blend nodules:
 * - Drag Lakota Star (COSMOS) + Drop into Masonry Plan (CRAFT) = Sovereign Alignment
 * - See the Vesica Piscis intersection and trade impact in real-time
 * - Crystal refraction visualization with Flower of Life geometry
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Hexagon, Star, Compass, Leaf, DollarSign,
  ChevronRight, Zap, RefreshCw, Play, X, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Group colors matching the Commonality Groups
const GROUP_COLORS = {
  COSMOS: '#818CF8',   // Purple
  CRAFT: '#F472B6',    // Pink
  HARVEST: '#22C55E',  // Green
  EXCHANGE: '#FBBF24', // Gold
};

const GROUP_ICONS = {
  COSMOS: Star,
  CRAFT: Compass,
  HARVEST: Leaf,
  EXCHANGE: DollarSign,
};

/**
 * Mixer Preset Card Component
 */
function PresetCard({ preset, isSelected, onSelect, isBlending }) {
  const IconA = GROUP_ICONS[preset.input_a.group] || Hexagon;
  const IconB = GROUP_ICONS[preset.input_b.group] || Hexagon;
  const colorA = GROUP_COLORS[preset.input_a.group] || '#818CF8';
  const colorB = GROUP_COLORS[preset.input_b.group] || '#F472B6';
  
  return (
    <motion.button
      onClick={() => onSelect(preset.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-4 rounded-xl text-left transition-all ${isSelected ? 'ring-2' : ''}`}
      style={{
        background: isSelected 
          ? `linear-gradient(135deg, ${colorA}15, ${colorB}15)`
          : 'rgba(248,250,252,0.02)',
        border: `1px solid ${isSelected ? colorA + '40' : 'rgba(248,250,252,0.08)'}`,
        ringColor: colorA,
      }}
      disabled={isBlending}
      data-testid={`preset-${preset.id}`}
    >
      {/* Preset Name */}
      <p className="font-medium text-sm mb-3" style={{ color: '#F8FAFC' }}>
        {preset.name}
      </p>
      
      {/* Input A + Input B Visual */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{ background: `${colorA}15`, border: `1px solid ${colorA}30` }}
        >
          <IconA size={12} style={{ color: colorA }} />
          <span className="text-[10px]" style={{ color: colorA }}>{preset.input_a.source}</span>
        </div>
        
        <Zap size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
        
        <div 
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{ background: `${colorB}15`, border: `1px solid ${colorB}30` }}
        >
          <IconB size={12} style={{ color: colorB }} />
          <span className="text-[10px]" style={{ color: colorB }}>{preset.input_b.source}</span>
        </div>
      </div>
      
      {/* Output */}
      <div className="flex items-center gap-2">
        <ChevronRight size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
        <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.5)' }}>
          {preset.output}
        </span>
      </div>
    </motion.button>
  );
}

/**
 * Vesica Piscis Visualization
 */
function VesicaPiscisViz({ blendResult, isAnimating }) {
  if (!blendResult) return null;
  
  const bg = blendResult.blend_geometry || {};
  
  return (
    <div className="relative w-48 h-48 mx-auto my-6">
      {/* Circle A */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(129,140,248,0.3) 0%, transparent 70%)',
          border: '1px solid rgba(129,140,248,0.4)',
        }}
      />
      
      {/* Circle B */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(244,114,182,0.3) 0%, transparent 70%)',
          border: '1px solid rgba(244,114,182,0.4)',
        }}
      />
      
      {/* Intersection (Vesica Piscis) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isAnimating ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: isAnimating ? Infinity : 0, duration: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-20 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(129,140,248,0.5), rgba(244,114,182,0.5))',
          boxShadow: '0 0 30px rgba(251,191,36,0.4)',
        }}
      />
      
      {/* Center Value */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-lg font-bold" style={{ color: '#FBBF24' }}>
          {bg.blend_value?.toFixed(2)}
        </p>
        <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.5)' }}>
          Union
        </p>
      </div>
    </div>
  );
}

/**
 * Main Alchemical Lab Component
 */
export function AlchemicalLab({ isOpen, onClose }) {
  const { token, authHeaders } = useAuth();
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('sovereign_alignment');
  const [depth, setDepth] = useState(0.5);
  const [blendResult, setBlendResult] = useState(null);
  const [isBlending, setIsBlending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch presets on mount
  useEffect(() => {
    if (!isOpen) return;
    
    axios.get(`${API}/omnis/mixer/presets`)
      .then(res => setPresets(res.data.presets || []))
      .catch(() => toast.error('Failed to load mixer presets'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Blend function
  const executeBlend = async () => {
    if (!selectedPreset) return;
    
    setIsBlending(true);
    try {
      const res = await axios.post(
        `${API}/omnis/mixer/blend?preset=${selectedPreset}&depth=${depth}`,
        {},
        { headers: token ? authHeaders : {} }
      );
      setBlendResult(res.data);
      toast.success('Blend Complete!', {
        description: `Output Resonance: ${res.data.output_resonance}`,
      });
    } catch {
      toast.error('Blend failed');
    }
    setIsBlending(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.15)' }}
      data-testid="alchemical-lab"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-[90vw] max-w-xl max-h-[85vh] overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0), rgba(15,20,35,0.98))',
          border: '1px solid rgba(129,140,248,0.2)',
          boxShadow: '0 0 60px rgba(129,140,248,0.15)',
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(248,250,252,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)' }}
            >
              <Hexagon size={18} style={{ color: '#818CF8' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#818CF8' }}>
                V61.0 Unified Mixer
              </p>
              <p className="text-lg font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
                Alchemical Lab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            data-testid="close-lab"
          >
            <X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={20} className="animate-spin" style={{ color: '#818CF8' }} />
            </div>
          ) : (
            <>
              {/* Preset Selection */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  Select Blend Preset
                </p>
                <div className="space-y-2">
                  {presets.map(preset => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      isSelected={selectedPreset === preset.id}
                      onSelect={setSelectedPreset}
                      isBlending={isBlending}
                    />
                  ))}
                </div>
              </div>

              {/* Depth Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    Mythology Depth
                  </p>
                  <span className="text-sm font-mono" style={{ color: '#FBBF24' }}>
                    {(depth * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.01"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #818CF8 ${depth * 100}%, rgba(248,250,252,0.1) ${depth * 100}%)`,
                  }}
                  data-testid="depth-slider"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Growing</span>
                  <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Xfinity-Active</span>
                </div>
              </div>

              {/* Blend Button */}
              <button
                onClick={executeBlend}
                disabled={isBlending || !selectedPreset}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #818CF8, #F472B6)',
                  color: '#FFFFFF',
                }}
                data-testid="blend-btn"
              >
                {isBlending ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Blending...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Execute Blend
                  </>
                )}
              </button>

              {/* Blend Result */}
              <AnimatePresence>
                {blendResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 p-4 rounded-xl"
                    style={{
                      background: 'rgba(251,191,36,0.08)',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={14} style={{ color: '#FBBF24' }} />
                      <span className="text-sm font-medium" style={{ color: '#FBBF24' }}>
                        Blend Result: {blendResult.integrity}
                      </span>
                    </div>

                    {/* Vesica Piscis Visualization */}
                    <VesicaPiscisViz blendResult={blendResult} isAnimating={false} />

                    {/* Result Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
                        <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>
                          Output Resonance
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#F8FAFC' }}>
                          {blendResult.output_resonance}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
                        <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>
                          Trade Impact
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#22C55E' }}>
                          {blendResult.trade_impact}
                        </p>
                      </div>
                    </div>

                    {/* Crystal Optics */}
                    <div className="mt-3 p-2 rounded-lg text-center" style={{ background: 'rgba(248,250,252,0.02)' }}>
                      <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                        {blendResult.crystal_optics?.pattern} • Refraction: {blendResult.crystal_optics?.refraction_index}x
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AlchemicalLab;
