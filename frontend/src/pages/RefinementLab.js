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
  ArrowLeft, Gem, Sparkles, Timer, Hammer, Paintbrush, Anvil,
  ChevronRight, Lock, CheckCircle, Coins, Zap, Clock,
  Star, Shield, Rocket, Package, Eye, Radio, Crown, Settings
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FCD34D', mythic: '#EF4444' };
const TOOL_ICONS = { brush: Paintbrush, pick: Hammer, chisel: Anvil };

function TumblerSlots({ tumbler, onCollect, onInstantFinish }) {
  if (!tumbler) return null;
  return (
    <div className="mb-4" data-testid="tumbler-section">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer size={12} color="#F59E0B" />
          <span className="text-[10px] font-bold" style={{ color: '#F8FAFC' }}>Digital Tumbler</span>
        </div>
        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {tumbler.slots_used}/{tumbler.slots_max} slots
        </span>
      </div>

      {/* Active tumbling */}
      {tumbler.active?.map(slot => (
        <motion.div key={slot.specimen_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 mb-1.5" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Settings size={12} color="#F59E0B" />
              </motion.div>
              <span className="text-[10px] font-semibold" style={{ color: '#F8FAFC' }}>{slot.specimen_name}</span>
              <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: `${RARITY_COLORS[slot.rarity]}10`, color: RARITY_COLORS[slot.rarity] }}>
                {slot.rarity}
              </span>
            </div>
            <button onClick={() => onInstantFinish(slot.specimen_id)}
              className="px-2 py-0.5 rounded-lg text-[7px] font-bold"
              style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.12)' }}
              data-testid={`instant-finish-${slot.specimen_id}`}>
              <Coins size={8} className="inline mr-0.5" />Skip
            </button>
          </div>
          <div className="h-1 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div animate={{ width: `${slot.progress}%` }} transition={{ duration: 1 }}
              className="h-full rounded-full" style={{ background: '#F59E0B' }} />
          </div>
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {slot.hours_remaining}h remaining · {slot.progress}% complete
          </span>
        </motion.div>
      ))}

      {/* Ready to collect */}
      {tumbler.ready_to_collect?.map(slot => (
        <motion.div key={slot.specimen_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-3 mb-1.5"
          style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={12} color="#22C55E" />
              <span className="text-[10px] font-semibold" style={{ color: '#F8FAFC' }}>{slot.specimen_name}</span>
              <span className="text-[7px] font-bold" style={{ color: '#22C55E' }}>READY</span>
            </div>
            <button onClick={() => onCollect(slot.specimen_id)}
              className="px-3 py-1 rounded-lg text-[9px] font-bold"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
              data-testid={`collect-${slot.specimen_id}`}>
              Collect
            </button>
          </div>
        </motion.div>
      ))}

      {/* Empty slots */}
      {tumbler.slots_used === 0 && !tumbler.ready_to_collect?.length && (
        <div className="text-center py-3 text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Tumbler empty. Extract & tumble specimens below.
        </div>
      )}
    </div>
  );
}

function ToolSelector({ tools, selected, onSelect, mohs }) {
  const optimal = mohs <= 4 ? 'brush' : mohs <= 7 ? 'pick' : 'chisel';
  return (
    <div className="mb-3" data-testid="tool-selector">
      <div className="flex items-center gap-2 mb-2">
        <Hammer size={10} color="#F59E0B" />
        <span className="text-[9px] font-bold" style={{ color: '#F8FAFC' }}>Select Tool</span>
        <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Mohs {mohs}</span>
      </div>
      <div className="flex gap-1.5">
        {tools.map(t => {
          const Icon = TOOL_ICONS[t.id] || Hammer;
          const isOptimal = t.id === optimal;
          const isSelected = t.id === selected;
          return (
            <button key={t.id} onClick={() => onSelect(t.id)}
              className="flex-1 p-2 rounded-xl text-center relative"
              style={{
                background: isSelected ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? `${t.color}25` : 'rgba(255,255,255,0.04)'}`,
              }}
              data-testid={`tool-${t.id}`}>
              {isOptimal && (
                <div className="absolute -top-1 -right-1 px-1 py-0.5 rounded text-[5px] font-bold"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                  BEST
                </div>
              )}
              <Icon size={14} color={t.color} className="mx-auto mb-1" />
              <p className="text-[7px] font-bold" style={{ color: isSelected ? t.color : 'rgba(255,255,255,0.7)' }}>{t.name}</p>
              <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Mohs {t.mohs_range[0]}-{t.mohs_range[1]}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SpecimenCard({ spec, onSelect, selectedId }) {
  const rc = RARITY_COLORS[spec.best_rarity || spec.rarity] || '#9CA3AF';
  const isSelected = spec.specimen_id === selectedId;
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(spec.specimen_id)}
      className="w-full rounded-xl p-2.5 mb-1.5 text-left"
      style={{
        background: isSelected ? `${rc}08` : `${rc}02`,
        border: `1px solid ${isSelected ? `${rc}20` : `${rc}06`}`,
      }}
      data-testid={`refine-specimen-${spec.specimen_id}`}>
      <div className="flex items-center gap-2">
        <Gem size={14} style={{ color: rc }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold truncate" style={{ color: '#F8FAFC' }}>{spec.name}</span>
            <span className="text-[6px] px-1 py-0.5 rounded uppercase font-bold"
              style={{ background: `${rc}12`, color: rc }}>{spec.best_rarity || spec.rarity}</span>
            {spec.polished && <Sparkles size={8} color="#FCD34D" />}
          </div>
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Mohs {spec.mohs} · {spec.element}
          </span>
        </div>
        <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.15)' }} />
      </div>
    </motion.button>
  );
}

function StarSeedPanel({ components }) {
  if (!components || components.length === 0) return null;
  const CATEGORY_ICONS = { defense: Shield, power: Zap, communication: Radio, navigation: Eye, life_support: Star, energy: Zap, knowledge: Crown };

  return (
    <div className="mb-4" data-testid="starseed-panel">
      <div className="flex items-center gap-2 mb-2">
        <Rocket size={12} color="#A855F7" />
        <span className="text-[10px] font-bold" style={{ color: '#F8FAFC' }}>Starseed Components</span>
        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {components.total_components} parts · {components.total_power} power
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {(components.components || []).slice(0, 6).map(c => {
          const Icon = CATEGORY_ICONS[c.category] || Package;
          return (
            <div key={c.specimen_id} className="rounded-lg p-2"
              style={{ background: `${c.color}06`, border: `1px solid ${c.color}10` }}>
              <Icon size={10} style={{ color: c.color }} />
              <p className="text-[8px] font-semibold mt-0.5" style={{ color: c.color }}>{c.component}</p>
              <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Power: {c.power} · {c.category}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RefinementLab() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('refinement', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const latency = useLatency();
  const headers = authHeaders;
  const controller = useGameController('refinement');

  const [tools, setTools] = useState([]);
  const [collection, setCollection] = useState([]);
  const [tumbler, setTumbler] = useState(null);
  const [starseed, setStarseed] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedTool, setSelectedTool] = useState('pick');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [toolsRes, collRes, tumblerRes, starseedRes] = await Promise.all([
        axios.get(`${API}/refinement/tools`, { headers }),
        axios.get(`${API}/rock-hounding/collection`, { headers }),
        axios.get(`${API}/refinement/tumbler`, { headers }),
        axios.get(`${API}/refinement/starseed-inventory`, { headers }),
      ]);
      setTools(toolsRes.data.tools || []);
      setCollection(collRes.data.collection || []);
      setTumbler(tumblerRes.data);
      setStarseed(starseedRes.data);
    } catch (err) {
      toast.error('Failed to load refinement data');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExtractAndTumble = async () => {
    if (!selectedSpec) return;
    setBusy(true);
    try {
      // Step 1: Extract
      const extRes = await axios.post(`${API}/refinement/extract`, {
        specimen_id: selectedSpec, tool: selectedTool
      }, { headers });
      const ext = extRes.data.extraction;
      toast.success(`${ext.message} Quality: ${Math.round(ext.quality * 100)}%`);

      // Step 2: Tumble
      if (extRes.data.can_tumble) {
        const tumRes = await axios.post(`${API}/refinement/tumble`, {
          specimen_id: selectedSpec
        }, { headers });
        toast.success(`${tumRes.data.specimen_name} placed in tumbler! ${tumRes.data.duration_hours}h`);
      }
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Extraction failed');
    }
    setBusy(false);
  };

  const handleCollect = async (specimenId) => {
    try {
      const res = await axios.post(`${API}/refinement/collect`, { specimen_id: specimenId }, { headers });
      const sc = res.data.starseed_component;
      toast.success(
        sc ? `Polished! Unlocked ${sc.component} (Power: ${sc.power})` : 'Specimen polished!'
      );
      fetchAll();
      controller.refreshState();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Collection failed');
    }
  };

  const handleInstantFinish = async (specimenId) => {
    latency?.startPulse('instant_finish');
    try {
      const res = await axios.post(`${API}/refinement/instant-finish`, { specimen_id: specimenId }, { headers });
      latency?.endPulse('instant_finish', true);
      toast.success(`Instant finish! ${res.data.credits_spent} credits spent`);
      fetchAll();
    } catch (err) {
      latency?.endPulse('instant_finish', false);
      toast.error(err.response?.data?.detail || 'Instant finish failed');
    }
  };

  const selectedMohs = collection.find(c => c.specimen_id === selectedSpec)?.mohs || 5;

  if (loading || controller.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Gem size={24} color="#F59E0B" />
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
      moduleName="refinement-lab">

      <div className="min-h-screen pb-40" data-testid="refinement-lab-page">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}
            data-testid="refine-back-btn">
            <ArrowLeft size={16} color="#F8FAFC" />
          </button>
          <h1 className="text-base font-bold" style={{ color: '#F8FAFC' }}>Refinement Lab</h1>
          <div className="flex items-center gap-1.5">
            <Coins size={10} color="#FCD34D" />
            <span className="text-[10px] font-bold" style={{ color: '#FCD34D' }}>{controller.cosmicCredits}</span>
          </div>
        </div>

        <div className="px-4">
          {/* Digital Tumbler */}
          <TumblerSlots tumbler={tumbler} onCollect={handleCollect} onInstantFinish={handleInstantFinish} />

          {/* Starseed Components */}
          <StarSeedPanel components={starseed} />

          {/* Tool Selection */}
          {selectedSpec && (
            <ToolSelector tools={tools} selected={selectedTool} onSelect={setSelectedTool} mohs={selectedMohs} />
          )}

          {/* Extract & Tumble Button */}
          {selectedSpec && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={handleExtractAndTumble}
              disabled={busy || (tumbler?.slots_used >= 3)}
              className="w-full py-2.5 rounded-xl text-sm font-bold mb-4"
              style={{
                background: 'rgba(245,158,11,0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.2)',
                opacity: busy ? 0.5 : 1,
              }}
              data-testid="extract-and-tumble-btn">
              {busy ? 'Processing...' : 'Extract & Tumble'}
            </motion.button>
          )}

          {/* Specimen Selection */}
          <div className="flex items-center gap-2 mb-2">
            <Gem size={12} color="#F59E0B" />
            <span className="text-[10px] font-bold" style={{ color: '#F8FAFC' }}>
              Your Collection ({collection.length})
            </span>
          </div>

          {collection.map(spec => (
            <SpecimenCard key={spec.specimen_id} spec={spec} onSelect={setSelectedSpec} selectedId={selectedSpec} />
          ))}
        </div>
      </div>
    </GameModuleWrapper>
  );
}
