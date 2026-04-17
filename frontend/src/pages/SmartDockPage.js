import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLatency } from '../hooks/useLatencyPulse';
import useGameController from '../hooks/useGameController';
import GameModuleWrapper from '../components/game/GameModuleWrapper';
import {
  ArrowLeft, Gem, Sparkles, Radio, Heart, Crown, Eye, Star,
  Volume2, Palette, BookOpen, ChevronRight, X, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FCD34D', mythic: '#EF4444' };

function PedestalDisplay({ state }) {
  if (!state?.slotted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
        data-testid="pedestal-empty">
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(168,85,247,0.05)', '0 0 40px rgba(168,85,247,0.12)', '0 0 20px rgba(168,85,247,0.05)'] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)' }}>
          <Gem size={32} color="rgba(168,85,247,0.3)" />
        </motion.div>
        <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Slot a stone to activate the SmartDock
        </p>
      </motion.div>
    );
  }

  const { specimen, resonance_effect, visual_palette, audio_blend, active_mantra } = state;
  const color = visual_palette?.primary || '#A855F7';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-8 relative"
      data-testid="pedestal-active">

      {/* Chakra glow */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.02, 0.08, 0.02] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: visual_palette?.glow || 'rgba(168,85,247,0.05)' }} />

      {/* Stone on pedestal */}
      <motion.div
        animate={{
          boxShadow: [`0 0 30px ${color}15`, `0 0 60px ${color}30`, `0 0 30px ${color}15`],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-28 h-28 rounded-full flex items-center justify-center mb-4 relative"
        style={{ background: `${color}08`, border: `2px solid ${color}25` }}>

        {/* Stage-specific visual */}
        {specimen?.stage?.particle_aura && (
          <motion.div className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)` }} />
        )}

        <Gem size={36} style={{ color }} />

        {/* Stage badge */}
        <div className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[6px] font-bold uppercase"
          style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}>
          {specimen?.stage?.name || 'Raw'}
        </div>
      </motion.div>

      {/* Stone info */}
      <h2 className="text-lg font-bold mb-1" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
        {specimen?.name}
      </h2>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[8px] px-1.5 py-0.5 rounded-md font-bold"
          style={{ background: `${RARITY_COLORS[specimen?.rarity]}12`, color: RARITY_COLORS[specimen?.rarity] }}>
          {specimen?.rarity}
        </span>
        {specimen?.polished && <Sparkles size={10} color="#FCD34D" />}
      </div>

      {/* Resonance Effects */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2.5 rounded-xl" style={{ background: `${color}04`, border: `1px solid ${color}08` }}>
          <Heart size={14} color={color} className="mx-auto mb-1" />
          <p className="text-[9px] font-bold" style={{ color }}>{resonance_effect?.chakra}</p>
          <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Chakra</p>
        </div>
        <div className="text-center p-2.5 rounded-xl" style={{ background: `${color}04`, border: `1px solid ${color}08` }}>
          <Radio size={14} color={color} className="mx-auto mb-1" />
          <p className="text-[9px] font-bold" style={{ color }}>{resonance_effect?.frequency} Hz</p>
          <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Frequency</p>
        </div>
        <div className="text-center p-2.5 rounded-xl" style={{ background: `${color}04`, border: `1px solid ${color}08` }}>
          <Volume2 size={14} color={color} className="mx-auto mb-1" />
          <p className="text-[9px] font-bold" style={{ color }}>{audio_blend?.blend_mode}</p>
          <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Audio</p>
        </div>
      </div>

      {/* Mantra */}
      {active_mantra && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-3 rounded-xl text-center"
          style={{ background: `${color}04`, border: `1px solid ${color}08` }}>
          <BookOpen size={10} color={color} className="mx-auto mb-1.5" />
          <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.85)' }}>
            "{active_mantra}"
          </p>
        </motion.div>
      )}

      {/* Color palette preview */}
      {visual_palette && (
        <div className="flex items-center gap-2 mt-4">
          <Palette size={8} color="rgba(255,255,255,0.65)" />
          <div className="flex gap-1">
            {[visual_palette.primary, visual_palette.secondary, visual_palette.accent].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full" style={{ background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Active Palette</span>
        </div>
      )}
    </motion.div>
  );
}

function StonePickerModal({ stones, onSlot, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex items-end justify-center"
      style={{ background: 'transparent' }}
      onClick={onClose}>
      <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
        className="w-full max-w-lg rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto"
        style={{ background: '#0A0E14', border: '1px solid rgba(255,255,255,0.05)' }}
        onClick={e => e.stopPropagation()}
        data-testid="stone-picker-modal">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Select a Stone</h3>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <X size={14} color="rgba(255,255,255,0.7)" />
          </button>
        </div>
        {stones.map(stone => {
          const rc = RARITY_COLORS[stone.rarity] || '#9CA3AF';
          return (
            <button key={stone.specimen_id} onClick={() => onSlot(stone.specimen_id)}
              className="w-full rounded-xl p-3 mb-1.5 text-left"
              style={{ background: `${rc}04`, border: `1px solid ${rc}08` }}
              data-testid={`slot-stone-${stone.specimen_id}`}>
              <div className="flex items-center gap-2">
                <Gem size={14} style={{ color: rc }} />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold" style={{ color: '#F8FAFC' }}>{stone.name}</span>
                    <span className="text-[6px] px-1 py-0.5 rounded" style={{ background: `${rc}12`, color: rc }}>{stone.rarity}</span>
                    {stone.polished && <Sparkles size={8} color="#FCD34D" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {stone.chakra && (
                      <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <Heart size={6} className="inline mr-0.5" />{stone.chakra}
                      </span>
                    )}
                    {stone.frequency && (
                      <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <Radio size={6} className="inline mr-0.5" />{stone.frequency}Hz
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.15)' }} />
              </div>
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default function SmartDockPage() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('smartdock', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const latency = useLatency();
  const headers = authHeaders;
  const controller = useGameController('smartdock');

  const [dockState, setDockState] = useState(null);
  const [eligibleStones, setEligibleStones] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const [stateRes, eligibleRes] = await Promise.all([
        axios.get(`${API}/smartdock/state`, { headers }),
        axios.get(`${API}/smartdock/eligible`, { headers }),
      ]);
      setDockState(stateRes.data);
      setEligibleStones(eligibleRes.data.stones || []);
    } catch (err) {
      toast.error('Failed to load SmartDock');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchState(); }, [fetchState]);

  const handleSlot = async (specimenId) => {
    latency?.startPulse('slot_stone');
    try {
      const res = await axios.post(`${API}/smartdock/slot`, { specimen_id: specimenId }, { headers });
      latency?.endPulse('slot_stone', true);
      toast.success(`${res.data.resonance_effect.chakra} resonance activated at ${res.data.resonance_effect.frequency}Hz`);
      setShowPicker(false);
      fetchState();
      controller.refreshState();
    } catch (err) {
      latency?.endPulse('slot_stone', false);
      toast.error(err.response?.data?.detail || 'Slotting failed');
    }
  };

  const handleUnslot = async () => {
    try {
      await axios.post(`${API}/smartdock/unslot`, {}, { headers });
      toast.success('Stone removed from pedestal');
      fetchState();
      controller.refreshState();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to unslot');
    }
  };

  if (loading || controller.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Gem size={24} color="#A855F7" />
        </motion.div>
      </div>
    );
  }

  return (
    <GameModuleWrapper
      harmonyScore={controller.harmonyScore}
      dominantElement={controller.dominantElement}
      dominantPercentage={controller.dominantPercentage}
      harmonyCycle={controller.harmonyCycle}
      decayActivity={controller.decayActivity}
      layerData={controller.layerData}
      activeLayer={controller.activeLayer}
      visualDirectives={controller.visualDirectives}
      biomeContext={controller.biomeContext}
      clearVisionActive={controller.clearVisionActive}
      moduleName="smartdock">

      <div className="min-h-screen pb-24" data-testid="smartdock-page">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}
            data-testid="dock-back-btn">
            <ArrowLeft size={16} color="#F8FAFC" />
          </button>
          <h1 className="text-base font-bold" style={{ color: '#F8FAFC' }}>SmartDock</h1>
          <div className="w-8" />
        </div>

        {/* Subtitle */}
        <p className="text-center text-[9px] mb-4 px-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
          The Relic Pedestal. Slot a stone to shift audio, visuals, and teachings.
        </p>

        {/* Pedestal */}
        <PedestalDisplay state={dockState} />

        {/* Actions */}
        <div className="px-4 mt-6 flex gap-2">
          <button onClick={() => setShowPicker(true)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: 'rgba(168,85,247,0.12)',
              color: '#A855F7',
              border: '1px solid rgba(168,85,247,0.2)',
            }}
            data-testid="slot-stone-btn">
            {dockState?.slotted ? 'Change Stone' : 'Slot a Stone'}
          </button>
          {dockState?.slotted && (
            <button onClick={handleUnslot}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}
              data-testid="unslot-btn">
              Remove
            </button>
          )}
        </div>

        {/* Quick links */}
        <div className="px-4 mt-6 grid grid-cols-3 gap-2">
          <button onClick={() => navigate('/evolution-lab')}
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)' }}>
            <Star size={14} color="#22C55E" className="mx-auto mb-1" />
            <span className="text-[8px] font-medium" style={{ color: '#22C55E' }}>Evolve</span>
          </button>
          <button onClick={() => navigate('/refinement-lab')}
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
            <Zap size={14} color="#F59E0B" className="mx-auto mb-1" />
            <span className="text-[8px] font-medium" style={{ color: '#F59E0B' }}>Refine</span>
          </button>
          <button onClick={() => navigate('/cosmic-store')}
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.08)' }}>
            <Crown size={14} color="#FCD34D" className="mx-auto mb-1" />
            <span className="text-[8px] font-medium" style={{ color: '#FCD34D' }}>Store</span>
          </button>
        </div>

        {/* Stone Picker Modal */}
        <AnimatePresence>
          {showPicker && (
            <StonePickerModal
              stones={eligibleStones}
              onSlot={handleSlot}
              onClose={() => setShowPicker(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </GameModuleWrapper>
  );
}
