import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLatency } from '../hooks/useLatencyPulse';
import useGameController from '../hooks/useGameController';
import GameModuleWrapper from '../components/game/GameModuleWrapper';
import { dispatchUnlock, onUnlock } from '../utils/UnlockBus';
import EvolutionGemStage3D from '../components/EvolutionGemStage3D';
import SageVoiceCommand from '../components/SageVoiceCommand';
import {
  ArrowLeft, Gem, Sparkles, Shield, Flame, Droplets, Mountain,
  Sprout, Star, Clock, Zap, TrendingUp, Eye, Activity,
  ChevronRight, RefreshCw, Heart, Radio, Crown, Coins, Wind
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };
const EL_ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Gem, water: Droplets };
const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FCD34D', mythic: '#EF4444' };
const STAGE_COLORS = { raw: '#9CA3AF', refined: '#3B82F6', transcendental: '#FCD34D' };

function SeasonBanner({ season }) {
  if (!season) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-xl p-3 relative overflow-hidden"
      style={{ background: `${season.color}06`, border: `1px solid ${season.color}12` }}
      data-testid="season-banner">
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.01, 0.04, 0.01] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${season.color}15, transparent 70%)` }} />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${season.color}12` }}>
            {season.id === 'compression' ? <Gem size={14} color={season.color} /> :
             season.id === 'eruption' ? <Flame size={14} color={season.color} /> :
             <Wind size={14} color={season.color} />}
          </div>
          <div>
            <p className="text-[10px] font-bold" style={{ color: season.color }}>{season.name}</p>
            <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {season.rock_type} Cycle · {season.days_remaining} days remaining
            </p>
          </div>
        </div>
        <div className="w-16">
          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${season.progress}%` }}
              className="h-full rounded-full" style={{ background: season.color }} />
          </div>
          <p className="text-[6px] text-right mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {season.frequency_base} Hz
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StageOverview({ counts, totalVc }) {
  const stages = [
    { id: 'raw', name: 'Raw', color: '#9CA3AF', icon: Mountain },
    { id: 'refined', name: 'Refined', color: '#3B82F6', icon: Sparkles },
    { id: 'transcendental', name: 'Transcendental', color: '#FCD34D', icon: Crown },
  ];
  return (
    <div className="mx-4 mb-4 grid grid-cols-3 gap-2" data-testid="stage-overview">
      {stages.map(s => {
        const Icon = s.icon;
        const count = counts[s.id] || 0;
        return (
          <div key={s.id} className="rounded-xl p-2.5 text-center"
            style={{ background: `${s.color}04`, border: `1px solid ${s.color}08` }}>
            <Icon size={14} color={s.color} className="mx-auto mb-1" />
            <p className="text-lg font-bold" style={{ color: s.color }}>{count}</p>
            <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.name}</p>
          </div>
        );
      })}
    </div>
  );
}

function EvolutionBar({ vc, stage, progress }) {
  const stageColor = STAGE_COLORS[stage.id] || '#9CA3AF';
  const nextColor = progress.next_stage ? STAGE_COLORS[progress.next_stage] : stageColor;
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[7px] font-bold uppercase" style={{ color: stageColor }}>{stage.name}</span>
        {progress.next_stage && (
          <span className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {progress.vc_needed} VC to {progress.next_stage}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${stageColor}, ${nextColor})` }} />
      </div>
    </div>
  );
}

function SpecimenEvolutionCard({ item, onInteract, interacting, isSelected, onSelect }) {
  const rc = RARITY_COLORS[item.rarity] || '#9CA3AF';
  const sc = STAGE_COLORS[item.stage?.id] || '#9CA3AF';
  const ElIcon = EL_ICONS[item.element] || Gem;
  const [showDetails, setShowDetails] = useState(false);

  const stageVisual = item.stage?.id === 'transcendental' ? 'animate-pulse' :
                       item.stage?.id === 'refined' ? '' : '';

  // raw → polish, refined → refine, transcendental → awaken
  const stageAction = item.stage?.id === 'transcendental'
    ? { type: 'awaken', label: 'Awaken' }
    : item.stage?.id === 'refined'
      ? { type: 'refine', label: 'Refine' }
      : { type: 'polish', label: 'Polish' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect && onSelect(item.specimen_id)}
      className="rounded-xl p-3 mb-2 relative overflow-hidden cursor-pointer"
      style={{
        background: isSelected ? `${rc}10` : `${rc}03`,
        border: `1px solid ${isSelected ? `${rc}30` : `${rc}08`}`,
        boxShadow: isSelected ? `0 0 0 1px ${rc}25, 0 0 22px ${rc}18` : 'none',
        transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
      }}
      data-testid={`evo-specimen-${item.specimen_id}`}>

      {/* Transcendental particle aura */}
      {item.stage?.particle_aura && (
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.02, 0.08, 0.02] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at 50% 50%, ${sc}20, transparent 60%)` }} />
      )}

      <div className="relative">
        <div className="flex items-start gap-3">
          {/* Gem icon with stage-based visual */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative ${stageVisual}`}
            style={{ background: `${rc}10`, border: `1px solid ${sc}20` }}>
            <Gem size={18} style={{ color: rc }} />
            {/* Stage ring */}
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: sc, border: '1px solid rgba(0,0,0,0.3)' }}>
              {item.stage?.id === 'raw' && <Mountain size={6} color="#fff" />}
              {item.stage?.id === 'refined' && <Sparkles size={6} color="#fff" />}
              {item.stage?.id === 'transcendental' && <Crown size={6} color="#fff" />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-sm font-semibold truncate" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
                {item.name}
              </h3>
              <span className="text-[6px] px-1 py-0.5 rounded-md uppercase font-bold"
                style={{ background: `${rc}15`, color: rc }}>{item.rarity}</span>
            </div>

            {/* Evolution bar */}
            <EvolutionBar vc={item.vitality_coefficient} stage={item.stage} progress={item.stage_progress} />

            {/* Metadata row */}
            <div className="flex items-center gap-1.5 text-[7px] flex-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ElIcon size={7} style={{ color: EL_COLORS[item.element] }} />
              <span>{item.element}</span>
              <span>·</span>
              <span>VC {item.vitality_coefficient}</span>
              <span>·</span>
              <span>{item.stage?.multiplier}× mult</span>
              {item.chakra && (
                <>
                  <span>·</span>
                  <Heart size={7} style={{ color: '#EF4444' }} />
                  <span>{item.chakra}</span>
                </>
              )}
              {item.frequency && (
                <>
                  <span>·</span>
                  <Radio size={7} style={{ color: '#A855F7' }} />
                  <span>{item.frequency}Hz</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onInteract(item.specimen_id, stageAction.type); }}
              disabled={interacting}
              className="px-2 py-1 rounded-lg text-[8px] font-bold"
              style={{
                background: `${sc}12`,
                color: sc,
                border: `1px solid ${sc}20`,
                opacity: interacting ? 0.5 : 1,
              }}
              data-testid={`${stageAction.type}-${item.specimen_id}`}>
              {stageAction.label}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
              className="px-2 py-1 rounded-lg text-[8px]"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
              {showDetails ? 'Hide' : 'Info'}
            </button>
          </div>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {item.mantra && (
                  <div className="mb-2 p-2 rounded-lg" style={{ background: `${sc}05` }}>
                    <p className="text-[8px] italic" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      "{item.mantra}"
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1.5 text-[7px]">
                  {item.crystal_system && (
                    <div><span style={{ color: 'rgba(255,255,255,0.65)' }}>Crystal:</span> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.crystal_system}</span></div>
                  )}
                  {item.cleavage && (
                    <div><span style={{ color: 'rgba(255,255,255,0.65)' }}>Cleavage:</span> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.cleavage}</span></div>
                  )}
                  {item.mohs && (
                    <div><span style={{ color: 'rgba(255,255,255,0.65)' }}>Mohs:</span> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.mohs}</span></div>
                  )}
                  <div><span style={{ color: 'rgba(255,255,255,0.65)' }}>Interactions:</span> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.interactions}</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DustConverter({ dust, onConvert }) {
  const [amount, setAmount] = useState(500);
  const creditsOut = Math.floor(amount / 100);
  const presets = [100, 500, 1000, 2000];

  return (
    <div className="mx-4 mb-4 rounded-xl p-3" style={{ background: 'rgba(252,211,77,0.03)', border: '1px solid rgba(252,211,77,0.08)' }}
      data-testid="dust-converter">
      <div className="flex items-center gap-2 mb-2">
        <Coins size={12} color="#FCD34D" />
        <span className="text-[10px] font-bold" style={{ color: '#FCD34D' }}>Alchemical Exchange</span>
        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>100 Dust = 1 Credit</span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {presets.map(p => (
          <button key={p} onClick={() => setAmount(p)}
            className="px-2 py-1 rounded-lg text-[8px] font-medium"
            style={{
              background: amount === p ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.02)',
              color: amount === p ? '#FCD34D' : 'rgba(255,255,255,0.65)',
              border: `1px solid ${amount === p ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.04)'}`,
            }}>
            {p} Dust
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {amount} Dust → <span style={{ color: '#FCD34D' }}>{creditsOut} Credits</span>
          <span className="ml-1" style={{ color: 'rgba(255,255,255,0.6)' }}>(have {dust})</span>
        </div>
        <button onClick={() => onConvert(amount)}
          disabled={dust < 100 || amount > dust}
          className="px-3 py-1 rounded-lg text-[9px] font-bold"
          style={{
            background: dust >= amount ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.03)',
            color: dust >= amount ? '#FCD34D' : 'rgba(255,255,255,0.6)',
            opacity: dust >= amount ? 1 : 0.5,
          }}
          data-testid="convert-dust-btn">
          Convert
        </button>
      </div>
    </div>
  );
}

export default function EvolutionLab() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('evolution', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const latency = useLatency();
  const headers = authHeaders;
  const controller = useGameController('evolution');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [reactionLine, setReactionLine] = useState('');
  // V1.1.13 — Sympathetic Pulse. The Lab's currently-selected gem
  // breathes in colored sympathy when ANY other surface (Tesseract
  // Vault, modifier panel, future Sage voice command) fires an
  // UnlockBus event. The Vault and the Lab are now one organism.
  const [sympathyTint, setSympathyTint] = useState(null);
  useEffect(() => {
    return onUnlock((detail) => {
      // Ignore self-fired evolution events to avoid double-pulses.
      if (detail.kind === 'evolution') return;
      setPulseKey((k) => k + 1);
      setSympathyTint(detail.color || null);
      const label = (detail.id || '').replace(/[-_]/g, ' ');
      const kindLabel = (detail.kind || 'pulse').toUpperCase();
      setReactionLine(`sympathy · ${kindLabel}${label ? ` · ${label}` : ''}`);
      // Auto-clear the tint after the pulse curve completes (~1.5s).
      const t = setTimeout(() => setSympathyTint(null), 1700);
      return () => clearTimeout(t);
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/evolution/collection`, { headers });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load evolution data');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInteract = async (assetId, type) => {
    setInteracting(true);
    setSelectedId(assetId);
    latency?.startPulse('evolve');
    try {
      const res = await axios.post(`${API}/evolution/interact`, { asset_id: assetId, type }, { headers });
      latency?.endPulse('evolve', true);
      // Fire 3D pulse on the gem stage every successful interaction.
      setPulseKey((k) => k + 1);
      if (res.data.evolved) {
        setReactionLine(`evolved → ${res.data.stage?.name || 'next stage'}`);
      } else {
        const mantra = res.data.mantra ? `"${res.data.mantra}"` : '';
        setReactionLine(`+${res.data.rewards?.xp || 0} xp ${mantra}`.trim());
      }
      // V1.1.10 — Every successful interaction (Polish, Refine, Awaken,
      // etc.) now fires the system-wide UnlockBus event. Any HelixNav3D
      // mounted in the OS picks it up and ripples its 81-node lattice.
      try {
        const stageColor = res.data?.stage?.color || res.data?.color || '#2DD4BF';
        dispatchUnlock({
          kind: 'evolution',
          id: `${assetId}:${type}`,
          color: stageColor,
        });
      } catch {}
      fetchData();
      controller.refreshState();
    } catch (err) {
      latency?.endPulse('evolve', false);
      setReactionLine(err.response?.data?.detail || 'interaction failed');
    }
    setInteracting(false);
  };

  const handleConvertDust = async (amount) => {
    latency?.startPulse('convert_dust');
    try {
      const res = await axios.post(`${API}/marketplace/convert-dust`, { dust_amount: amount }, { headers });
      latency?.endPulse('convert_dust', true);
      toast.success(`Converted ${res.data.dust_spent} Dust → ${res.data.credits_earned} Credits`);
      fetchData();
      controller.refreshState();
    } catch (err) {
      latency?.endPulse('convert_dust', false);
      toast.error(err.response?.data?.detail || 'Conversion failed');
    }
  };

  if (loading || controller.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Gem size={24} color="#FCD34D" />
        </motion.div>
      </div>
    );
  }

  const collection = data?.collection || [];
  const filtered = filter === 'all' ? collection :
    filter === 'raw' || filter === 'refined' || filter === 'transcendental'
      ? collection.filter(c => c.stage?.id === filter)
      : collection.filter(c => c.element === filter);

  // Auto-select first visible specimen when filter changes / data loads.
  const selectedAsset = filtered.find(c => c.specimen_id === selectedId) || filtered[0] || null;
  const selectedColor = sympathyTint
    || (selectedAsset ? (RARITY_COLORS[selectedAsset.rarity] || '#A78BFA') : '#A78BFA');

  const dust = controller.coreStats?.currencies?.cosmic_dust || 0;

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
      moduleName="evolution-lab">

      <div className="min-h-screen pb-40" data-testid="evolution-lab-page">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}
            data-testid="evo-back-btn">
            <ArrowLeft size={16} color="#F8FAFC" />
          </button>
          <h1 className="text-base font-bold" style={{ color: '#F8FAFC' }}>Evolution Lab</h1>
          <div className="flex items-center gap-2">
            {/* V1.1.15 — Global Sage Mount. Voice nav lives in the
                persistent chrome of every 3D module so the Architect
                can navigate without scrolling back to the Hub. */}
            <SageVoiceCommand size="compact" />
            <div className="flex items-center gap-1.5">
              <Activity size={10} color="#FCD34D" />
              <span className="text-[10px] font-bold" style={{ color: '#FCD34D' }}>
                {data?.total_vc || 0} VC
              </span>
            </div>
          </div>
        </div>

        {/* Refraction Engine — procedural PHI gem viewer (one Canvas) */}
        {selectedAsset && (
          <div className="mx-4 mb-3" data-testid="evo-refraction-engine">
            <EvolutionGemStage3D asset={selectedAsset} pulseKey={pulseKey} />
            {reactionLine && (
              <motion.div
                key={pulseKey}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: selectedColor,
                  textTransform: 'uppercase',
                  marginTop: -4,
                }}
                data-testid="evo-reaction-line">
                · {reactionLine} ·
              </motion.div>
            )}
          </div>
        )}

        {/* Season Banner */}
        <SeasonBanner season={data?.season} />

        {/* Stage Overview */}
        <StageOverview counts={data?.stage_counts || {}} totalVc={data?.total_vc || 0} />

        {/* Decay Status */}
        {data?.decay_paused && (
          <div className="mx-4 mb-3 px-3 py-1.5 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <Shield size={10} color="#22C55E" />
            <span className="text-[9px] font-medium" style={{ color: '#22C55E' }}>
              Decay Paused — Nexus Subscriber
            </span>
          </div>
        )}

        {/* Dust→Credits Converter */}
        <DustConverter dust={dust} onConvert={handleConvertDust} />

        {/* Filters */}
        <div className="flex gap-1 px-4 mb-3 overflow-x-auto">
          {['all', 'raw', 'refined', 'transcendental', 'wood', 'fire', 'earth', 'metal', 'water'].map(f => {
            const isStage = ['raw', 'refined', 'transcendental'].includes(f);
            const color = isStage ? STAGE_COLORS[f] : EL_COLORS[f] || '#F8FAFC';
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2 py-1 rounded-lg text-[8px] font-medium whitespace-nowrap capitalize"
                style={{
                  background: active ? `${color}10` : 'rgba(255,255,255,0.02)',
                  color: active ? color : 'rgba(255,255,255,0.65)',
                  border: `1px solid ${active ? `${color}18` : 'rgba(255,255,255,0.04)'}`,
                }}
                data-testid={`evo-filter-${f}`}>
                {f}
              </button>
            );
          })}
        </div>

        {/* Collection */}
        <div className="px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Gem size={24} color="rgba(248,250,252,0.1)" className="mx-auto mb-2" />
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {filter === 'all' ? 'No specimens yet. Mine some in Rock Hounding!' : `No ${filter} specimens`}
              </p>
            </div>
          ) : (
            filtered.map(item => (
              <SpecimenEvolutionCard
                key={item.specimen_id}
                item={item}
                onInteract={handleInteract}
                interacting={interacting}
                isSelected={selectedAsset?.specimen_id === item.specimen_id}
                onSelect={(id) => { setSelectedId(id); setReactionLine(''); }}
              />
            ))
          )}
        </div>
      </div>
    </GameModuleWrapper>
  );
}
