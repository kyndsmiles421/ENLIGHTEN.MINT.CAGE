import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sword, Shield, Map, Users, Package, Star, Sparkles,
  ChevronRight, Plus, Minus, Zap, Heart, Eye, Music, Brain,
  Lock, Gift, Compass, Globe, X, Crown, Wind, PenLine, CheckCircle2,
  Flame, Target, ShoppingBag, Gem, ArrowRightLeft, Unlock, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import { useLatency, LatencyDot } from '../hooks/useLatencyPulse';
import { toast } from 'sonner';
import axios from 'axios';

// Lazy-loaded 3D avatar previewer — only downloaded when the Character tab renders.
// Keeps the RPG core bundle well under the 800KB Metabolic Seal.
const CosmicAvatarPreview = lazy(() => import('../components/rpg/CosmicAvatarPreview'));

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STAT_ICONS = { wisdom: Brain, vitality: Heart, resonance: Music, harmony: Sparkles, focus: Eye };
const STAT_COLORS = { wisdom: '#C084FC', vitality: '#EF4444', resonance: '#818CF8', harmony: '#22C55E', focus: '#F59E0B' };
const SLOT_ICONS = { head: Crown, body: Shield, conduit: Sword, trinket: Star };
const RARITY_BG = {
  common: 'rgba(156,163,175,0.06)', uncommon: 'rgba(34,197,94,0.06)', rare: 'rgba(59,130,246,0.06)',
  epic: 'rgba(168,85,247,0.06)', legendary: 'rgba(245,158,11,0.06)', mythic: 'rgba(239,68,68,0.06)',
};
const RARITY_COLORS = {
  common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6',
  epic: '#A855F7', legendary: '#F59E0B', mythic: '#EF4444',
};
const QUEST_ICONS = { brain: Brain, pen: PenLine, heart: Heart, wind: Wind, music: Music, zap: Zap };
const QUEST_PATHS = { meditation: '/meditation', journal: '/journal', mood: '/mood', breathing: '/breathing', soundscape: '/soundscapes', breath_reset: null };

// ── Extracted Sub-Components ──
function StatBar({ name, value, bonus, icon: Icon, color, onAllocate, canAllocate }) {
  const total = value + bonus;
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] capitalize" style={{ color: 'var(--text-secondary)' }}>{name}</span>
          <span className="text-[10px] font-semibold" style={{ color }}>
            {total}{bonus > 0 && <span className="text-[8px] opacity-60"> (+{bonus})</span>}
          </span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, total * 4)}%` }}
            className="h-full rounded-full" style={{ background: color }} />
        </div>
      </div>
      {canAllocate && (
        <button onClick={() => onAllocate(name)} className="p-1 rounded hover:bg-white/5"
          data-testid={`allocate-${name}`}>
          <Plus size={10} style={{ color }} />
        </button>
      )}
    </div>
  );
}

function ItemCard({ item, onEquip, onUse, compact }) {
  const SlotIcon = item.slot ? (SLOT_ICONS[item.slot] || Star) : (item.category === 'specimen' ? Gem : Package);
  const stateLabel = item.state === 'polished' ? 'Polished' : item.state === 'raw' ? 'Raw' : null;
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl p-2.5 cursor-pointer group"
      style={{ background: RARITY_BG[item.rarity] || RARITY_BG.common, border: `1px solid ${item.rarity_color || '#9CA3AF'}15` }}
      data-testid={`item-${item.id}`}>
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${item.rarity_color || '#9CA3AF'}12`, border: `1px solid ${item.rarity_color || '#9CA3AF'}20` }}>
          <SlotIcon size={14} style={{ color: item.rarity_color || '#9CA3AF' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-[11px] font-medium truncate" style={{ color: item.rarity_color || '#F8FAFC' }}>{item.name}</p>
            {stateLabel && <span className="text-[6px] px-1 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
              style={{ background: item.state === 'polished' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: item.state === 'polished' ? '#22C55E' : '#F59E0B' }}>{stateLabel}</span>}
          </div>
          <p className="text-[8px] capitalize" style={{ color: 'var(--text-muted)' }}>{item.rarity} {item.category}</p>
          {!compact && item.stats && <div className="flex flex-wrap gap-1 mt-1">{Object.entries(item.stats).map(([s, v]) => <span key={s} className="text-[7px] px-1 py-0.5 rounded" style={{ background: `${STAT_COLORS[s] || '#818CF8'}10`, color: STAT_COLORS[s] || '#818CF8' }}>+{v} {s}</span>)}</div>}
          {!compact && item.element && <span className="text-[7px] px-1 py-0.5 rounded mt-1 inline-block capitalize" style={{ background: 'rgba(129,140,248,0.06)', color: '#818CF8' }}>{item.element}</span>}
        </div>
        <div className="flex flex-col gap-1">
          {item.slot && onEquip && <button onClick={(e) => { e.stopPropagation(); onEquip(item.id); }} className="px-2 py-1 rounded text-[9px] font-medium" style={{ background: 'rgba(129,140,248,0.15)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.25)' }} data-testid={`equip-${item.id}`}>Equip</button>}
          {item.category === 'consumable' && onUse && <button onClick={(e) => { e.stopPropagation(); onUse(item.id); }} className="px-2 py-1 rounded text-[9px] font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }} data-testid={`use-${item.id}`}>Use</button>}
        </div>
      </div>
    </motion.div>
  );
}

function EquipSlot({ slot, item, onUnequip, onTapEmpty }) {
  const Icon = SLOT_ICONS[slot] || Star;
  const isEmpty = !item;
  return (
    <div
      role={isEmpty && onTapEmpty ? 'button' : undefined}
      tabIndex={isEmpty && onTapEmpty ? 0 : undefined}
      onClick={isEmpty && onTapEmpty ? () => onTapEmpty(slot) : undefined}
      onKeyDown={isEmpty && onTapEmpty ? (e) => { if (e.key === 'Enter' || e.key === ' ') onTapEmpty(slot); } : undefined}
      className="rounded-xl p-3 text-center group transition-all"
      style={{
        background: item ? `${item.rarity_color}08` : 'rgba(129,140,248,0.04)',
        border: `1px solid ${item ? `${item.rarity_color}15` : 'rgba(129,140,248,0.15)'}`,
        cursor: isEmpty && onTapEmpty ? 'pointer' : 'default',
        touchAction: 'manipulation',
      }}
      data-testid={`slot-${slot}`}>
      <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1.5" style={{ background: item ? `${item.rarity_color}10` : 'rgba(129,140,248,0.08)' }}>
        <Icon size={18} style={{ color: item ? item.rarity_color : '#818CF8' }} />
      </div>
      <p className="text-[9px] capitalize mb-0.5" style={{ color: 'var(--text-muted)' }}>{slot}</p>
      {item ? (
        <><p className="text-[10px] font-medium truncate" style={{ color: item.rarity_color }}>{item.name}</p>
          {onUnequip && <button onClick={(e) => { e.stopPropagation(); onUnequip(slot); }} className="mt-1 text-[7px] px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }} data-testid={`unequip-${slot}`}>Remove</button>}</>
      ) : <p className="text-[8px] font-medium" style={{ color: '#818CF8' }}>Tap to equip</p>}
    </div>
  );
}

function RegionNode({ region, onExplore }) {
  return (
    <motion.button whileHover={region.accessible ? { scale: 1.05 } : {}} whileTap={region.accessible ? { scale: 0.95 } : {}}
      onClick={() => region.accessible && onExplore(region.id)} disabled={!region.accessible}
      className="absolute rounded-xl p-2.5 text-left transition-all"
      style={{ left: `${region.x}%`, top: `${region.y}%`, transform: 'translate(-50%, -50%)', width: '120px', background: region.discovered ? `${region.color}08` : 'rgba(255,255,255,0.01)', border: `1px solid ${region.discovered ? `${region.color}20` : 'rgba(255,255,255,0.03)'}`, opacity: region.discovered ? 1 : 0.3, cursor: region.accessible ? 'pointer' : 'default' }}
      data-testid={`region-${region.id}`}>
      {!region.discovered ? <div className="flex items-center justify-center py-1"><Lock size={14} style={{ color: 'rgba(255,255,255,0.1)' }} /></div> : (
        <><div className="w-5 h-5 rounded flex items-center justify-center mb-1" style={{ background: `${region.color}15` }}><Compass size={10} style={{ color: region.color }} /></div>
          <p className="text-[9px] font-medium truncate" style={{ color: region.accessible ? region.color : 'var(--text-muted)' }}>{region.name}</p>
          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Lv {region.level_req}+</p></>
      )}
    </motion.button>
  );
}

function BossCard({ boss, onJoin }) {
  const hpPct = boss.active_encounter ? (boss.active_encounter.current_hp / boss.active_encounter.max_hp * 100) : 100;
  const participants = boss.active_encounter?.participants?.length || 0;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden" style={{ background: `${boss.color}06`, border: `1px solid ${boss.color}15` }} data-testid={`boss-${boss.id}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div><p className="text-sm font-medium" style={{ color: boss.color === '#1F2937' ? '#9CA3AF' : boss.color }}>{boss.name}</p><p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Level {boss.level} | {boss.region}</p></div>
          <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: boss.accessible ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: boss.accessible ? '#22C55E' : '#EF4444' }}>{boss.accessible ? 'Available' : 'Locked'}</span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: 'var(--text-secondary)' }}>{boss.description}</p>
        <div className="mb-2"><div className="flex items-center justify-between mb-1"><span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>HP</span><span className="text-[8px]" style={{ color: boss.color }}>{boss.active_encounter ? `${boss.active_encounter.current_hp.toLocaleString()} / ${boss.hp.toLocaleString()}` : `${boss.hp.toLocaleString()}`}</span></div><div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}><div className="h-full rounded-full transition-all" style={{ width: `${hpPct}%`, background: boss.color }} /></div></div>
        <div className="flex gap-1 mb-3">{boss.phases.map((p, i) => <span key={i} className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: boss.active_encounter?.phase >= i ? `${boss.color}15` : 'rgba(255,255,255,0.02)', color: boss.active_encounter?.phase >= i ? boss.color : 'var(--text-muted)', border: `1px solid ${boss.active_encounter?.phase >= i ? `${boss.color}20` : 'rgba(255,255,255,0.03)'}` }}>{p.name}</span>)}</div>
        <div className="flex items-center justify-between">{participants > 0 && <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{participants} warriors joined</span>}
          <button onClick={() => onJoin(boss.id)} disabled={!boss.accessible} className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105 disabled:opacity-30" style={{ background: `${boss.color}12`, border: `1px solid ${boss.color}20`, color: boss.color }} data-testid={`join-boss-${boss.id}`}>{boss.active_encounter ? 'Join Battle' : 'Awaken Boss'}</button></div>
      </div>
      <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}><p className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Possible Drops</p><div className="flex gap-1 flex-wrap">{boss.loot.map((l, i) => <span key={i} className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: RARITY_BG[l.rarity], border: `1px solid ${l.rarity_color || '#9CA3AF'}15`, color: l.rarity_color || '#9CA3AF' }}>{l.name}</span>)}</div></div>
    </motion.div>
  );
}

function QuestCard({ quest, onComplete, onNavigate }) {
  const Icon = QUEST_ICONS[quest.icon] || Star;
  const done = quest.completed;
  const questPath = QUEST_PATHS[quest.id];
  const handleClick = () => { if (done) return; if (onComplete) { onComplete(quest.id); return; } if (questPath && onNavigate) { onNavigate(questPath); } };
  return (
    <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onClick={handleClick}
      className="w-full rounded-xl p-3 flex items-center gap-3 group transition-all text-left"
      style={{ background: done ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)'}`, cursor: done ? 'default' : 'pointer', touchAction: 'manipulation' }}
      data-testid={`quest-${quest.id}`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: done ? 'rgba(34,197,94,0.1)' : 'rgba(129,140,248,0.06)' }}>
        {done ? <CheckCircle2 size={16} style={{ color: '#22C55E' }} /> : <Icon size={16} style={{ color: '#818CF8' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5"><p className="text-[11px] font-medium" style={{ color: done ? '#22C55E' : 'var(--text-primary)' }}>{quest.name}</p>{quest.pillar && <span className="text-[6px] px-1 py-0.5 rounded uppercase tracking-wider" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>Pillar</span>}</div>
        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{quest.description}</p>
      </div>
      <div className="text-right flex-shrink-0">{done ? <span className="text-[9px] font-medium" style={{ color: '#22C55E' }}>Done</span> : <div className="flex items-center gap-1.5"><p className="text-[10px] font-semibold" style={{ color: '#818CF8' }}>+{quest.xp_with_multiplier} XP</p>{questPath && !onComplete && <ChevronRight size={12} style={{ color: '#818CF8', opacity: 0.5 }} />}</div>}</div>
    </motion.button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TABS = [
  { id: 'quests', label: 'Quests', icon: Target },
  { id: 'character', label: 'Character', icon: Star },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'world', label: 'World', icon: Map },
  { id: 'bosses', label: 'Bosses', icon: Sword },
  { id: 'party', label: 'Circle', icon: Users },
];

export default function RPGPage() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('rpg', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const latency = useLatency();
  const [tab, setTab] = useState('quests');
  const [character, setCharacter] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [world, setWorld] = useState(null);
  const [bosses, setBosses] = useState(null);
  const [party, setParty] = useState(null);
  const [quests, setQuests] = useState(null);
  const [shop, setShop] = useState(null);
  const [shopView, setShopView] = useState('dust');
  const [convertAmount, setConvertAmount] = useState(10);
  const [dustTransmuteAmt, setDustTransmuteAmt] = useState(150);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [encounter, setEncounter] = useState(null);
  const [attacking, setAttacking] = useState(false);
  const [worldVeins, setWorldVeins] = useState([]);
  const [rival, setRival] = useState(null);

  const headers = authHeaders;

  const fetchData = useCallback(async () => {
    if (!headers?.Authorization) return;
    setLoading(true);
    setError(null);
    try {
      const [charRes, invRes, worldRes, bossRes, partyRes, questRes, shopRes] = await Promise.all([
        axios.get(`${API}/rpg/character`, { headers }),
        axios.get(`${API}/rpg/inventory`, { headers }),
        axios.get(`${API}/rpg/world`, { headers }),
        axios.get(`${API}/rpg/bosses`, { headers }),
        axios.get(`${API}/rpg/party`, { headers }),
        axios.get(`${API}/rpg/quests/daily`, { headers }),
        axios.get(`${API}/rpg/shop`, { headers }),
      ]);
      setCharacter(charRes.data);
      setInventory(invRes.data);
      setWorld(worldRes.data);
      setBosses(bossRes.data);
      setParty(partyRes.data.party);
      setQuests(questRes.data);
      setShop(shopRes.data);
      // Encounters — fire & forget (non-critical)
      axios.get(`${API}/encounters/world-veins`, { headers }).then(r => setWorldVeins(r.data.active_veins || [])).catch(() => {});
      axios.get(`${API}/encounters/rival`, { headers }).then(r => setRival(r.data)).catch(() => {});
    } catch (err) {
      setError(getCosmicErrorMessage(err));
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handle Stripe redirect for gem purchases
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const type = params.get('type');
    if (sessionId && type === 'gems') {
      (async () => {
        try {
          const res = await axios.get(`${API}/rpg/shop/checkout-status/${sessionId}`, { headers });
          if (res.data.payment_status === 'paid') {
            toast(`${res.data.gems_added} Celestial Gems added to your account!`);
            setTab('shop');
            fetchData();
          }
        } catch { /* ignore */ }
        window.history.replaceState({}, '', '/rpg');
      })();
    }
  }, []);

  const allocateStat = async (stat) => {
    try {
      await axios.post(`${API}/rpg/character/allocate-stat`, { stat }, { headers });
      toast(`+1 ${stat}!`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const equipItem = async (itemId) => {
    try {
      const res = await axios.post(`${API}/rpg/equip`, { item_id: itemId }, { headers });
      toast(`Equipped ${res.data.equipped}`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const unequipItem = async (slot) => {
    try {
      const res = await axios.post(`${API}/rpg/unequip`, { slot }, { headers });
      toast(`Removed ${res.data.unequipped}`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const useConsumable = async (itemId) => {
    try {
      const res = await axios.post(`${API}/rpg/inventory/use-consumable`, { item_id: itemId }, { headers });
      toast(`Used ${res.data.used}!`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const exploreRegion = async (regionId) => {
    try {
      const res = await axios.post(`${API}/rpg/world/explore`, { region_id: regionId }, { headers });
      const d = res.data;
      let msg = `Explored ${d.region}! +${d.xp_gained} XP, +${d.cosmic_dust_earned} dust`;
      if (d.loot) msg += ` — Found: ${d.loot.name} (${d.loot.rarity})!`;
      if (d.newly_discovered?.length) msg += ` — Discovered: ${d.newly_discovered.join(', ')}`;
      toast(msg);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const joinBoss = async (bossId) => {
    try {
      const res = await axios.post(`${API}/rpg/bosses/join`, { boss_id: bossId }, { headers });
      setEncounter(res.data);
      toast(`Joined battle against ${res.data.boss}!`);
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const attackBoss = async (attackType) => {
    if (!encounter || attacking) return;
    setAttacking(true);
    latency?.startPulse('boss_attack');
    try {
      const res = await axios.post(`${API}/rpg/bosses/attack`, {
        encounter_id: encounter.encounter_id, attack_type: attackType,
      }, { headers });
      latency?.endPulse('boss_attack', true);
      setEncounter(prev => ({ ...prev, current_hp: res.data.boss_hp, phase: res.data.phase }));
      let msg = `${res.data.damage} damage (${attackType})!`;
      if (res.data.defeated) {
        msg = `BOSS DEFEATED! ${res.data.damage} final blow!`;
        if (res.data.loot_drop) msg += ` LOOT: ${res.data.loot_drop.name}!`;
        setEncounter(null);
      }
      toast(msg);
      fetchData();
    } catch (err) { latency?.endPulse('boss_attack', false); toast.error(err.response?.data?.detail || 'Failed'); }
    setAttacking(false);
  };

  const claimStarterKit = async () => {
    try {
      await axios.post(`${API}/rpg/character/starter-kit`, {}, { headers });
      toast('Starter kit claimed!');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Already claimed'); }
  };

  const createParty = async () => {
    const name = prompt('Name your Circle:');
    if (!name) return;
    try {
      const res = await axios.post(`${API}/rpg/party/create`, { name }, { headers });
      toast(`Circle "${name}" created! Code: ${res.data.invite_code}`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const joinParty = async () => {
    const code = prompt('Enter invite code:');
    if (!code) return;
    try {
      const res = await axios.post(`${API}/rpg/party/join`, { invite_code: code }, { headers });
      toast(`Joined ${res.data.joined}!`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Invalid code'); }
  };

  const leaveParty = async () => {
    try {
      await axios.post(`${API}/rpg/party/leave`, {}, { headers });
      toast('Left the Circle');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const completeQuest = async (questId) => {
    latency?.startPulse('quest_complete');
    try {
      const res = await axios.post(`${API}/rpg/quests/complete`, { quest_id: questId }, { headers });
      latency?.endPulse('quest_complete', true);
      let msg = `${res.data.quest} +${res.data.xp_awarded} XP`;
      if (res.data.perfect_day) msg += ` | PERFECT DAY! +${res.data.perfect_day_xp} bonus XP`;
      if (res.data.level_up) msg += ` | LEVEL UP!`;
      toast(msg);
      if (res.data.generated_asset) {
        setTimeout(() => {
          toast.success(`Victory Mantra generated: "${res.data.generated_asset.name}"`, { description: 'Listed in the Trade Circle' });
        }, 1500);
      }
      fetchData();
    } catch (err) { latency?.endPulse('quest_complete', false); toast.error(err.response?.data?.detail || 'Already completed'); }
  };

  const doBreathReset = async () => {
    try {
      const res = await axios.post(`${API}/rpg/quests/breath-reset`, {}, { headers });
      toast(`3-Breath Reset! +${res.data.xp_awarded} XP`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Already done today'); }
  };

  const buyShopItem = async (itemId) => {
    latency?.startPulse('shop_buy');
    try {
      const res = await axios.post(`${API}/rpg/shop/buy`, { item_id: itemId }, { headers });
      latency?.endPulse('shop_buy', true);
      let msg = `Purchased ${res.data.purchased} for ${res.data.cost} ${res.data.currency === 'gems' ? 'Gems' : 'Dust'}`;
      if (res.data.bonus) msg += ` | ${res.data.bonus}`;
      toast(msg);
      fetchData();
    } catch (err) { latency?.endPulse('shop_buy', false); toast.error(err.response?.data?.detail || 'Purchase failed'); }
  };

  const convertGems = async () => {
    if (convertAmount < 1) return;
    try {
      const res = await axios.post(`${API}/rpg/shop/convert`, { gems: convertAmount }, { headers });
      toast(`Converted ${res.data.gems_spent} Gems → ${res.data.dust_gained} Dust`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Conversion failed'); }
  };

  const unlockSlot = async (slotId) => {
    try {
      const res = await axios.post(`${API}/rpg/shop/unlock-slot`, { slot_id: slotId }, { headers });
      toast(`Unlocked ${res.data.unlocked} slot!`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Unlock failed'); }
  };

  const purchaseGems = async (packId) => {
    try {
      const origin = window.location.origin;
      const res = await axios.post(`${API}/rpg/shop/purchase-gems`,
        { pack_id: packId, origin_url: origin }, { headers });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) { toast.error(err.response?.data?.detail || 'Checkout failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><CosmicInlineLoader message="Loading your cosmic adventure..." /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><CosmicError title={error.title} message={error.message} onRetry={fetchData} /></div>;

  const c = character;
  const equipMap = c?.equipped || {};
  const equipBonuses = {};
  Object.values(equipMap).forEach(item => {
    Object.entries(item.stats || {}).forEach(([s, v]) => { equipBonuses[s] = (equipBonuses[s] || 0) + v; });
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }} data-testid="rpg-page">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: 'rgba(8,8,16,0.9)', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-white/5"><ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} /></button>
            <div>
              <h1 className="text-base font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>Cosmic Realm</h1>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Level {c?.level} {c?.title}</p>
            </div>
          </div>
          {/* XP Bar */}
          <div className="flex items-center gap-2">
            <div className="w-24">
              <div className="flex justify-between text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
                <span>XP</span><span>{c?.xp_current}/{c?.xp_next}</span>
              </div>
              <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-full rounded-full" style={{ width: `${(c?.xp_current / c?.xp_next) * 100}%`, background: '#818CF8' }} />
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              onTouchEnd={(e) => { e.preventDefault(); setTab(t.id); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all relative flex-shrink-0"
              style={{
                background: tab === t.id ? 'rgba(129,140,248,0.1)' : 'transparent',
                color: tab === t.id ? '#818CF8' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(129,140,248,0.15)' : '1px solid transparent',
                touchAction: 'manipulation',
              }}
              data-testid={`tab-${t.id}`}>
              <t.icon size={11} /> {t.label}
              {t.id === 'quests' && quests && quests.completed_count < quests.total_count && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
                  style={{ background: '#818CF8', color: '#fff' }}>
                  {quests.total_count - quests.completed_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game Modules Quick Access */}
      <div className="px-4 py-2 flex gap-2" data-testid="rpg-game-modules">
        <button onClick={() => navigate('/rock-hounding')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium"
          style={{ background: 'rgba(245,158,11,0.06)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.1)' }}
          data-testid="rpg-rock-hounding-link">
          <Compass size={10} /> Mine
        </button>
        <button onClick={() => navigate('/forgotten-languages')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium"
          style={{ background: 'rgba(59,130,246,0.06)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.1)' }}
          data-testid="rpg-forgotten-languages-link">
          <BookOpen size={10} /> Decode
        </button>
        <button onClick={() => navigate('/nexus')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium"
          style={{ background: 'rgba(168,85,247,0.06)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.1)' }}
          data-testid="rpg-nexus-link">
          <Zap size={10} /> Nexus
        </button>
        <button onClick={() => navigate('/dream-realms')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium"
          style={{ background: 'rgba(129,140,248,0.06)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.1)' }}
          data-testid="rpg-dream-realms-link">
          <Eye size={10} /> Dreams
        </button>
      </div>

      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {/* QUESTS TAB */}
          {tab === 'quests' && (
            <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Streak & Summary Bar */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}>
                  <p className="text-lg font-semibold" style={{ color: '#818CF8' }}>{quests?.streak?.days || 0}</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <p className="text-lg font-semibold" style={{ color: '#F59E0B' }}>{quests?.streak?.multiplier || 1}x</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>XP Multiplier</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                  <p className="text-lg font-semibold" style={{ color: '#22C55E' }}>{quests?.xp_earned_today || 0}</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>XP Today</p>
                </div>
              </div>

              {/* Perfect Day Progress */}
              <div className="rounded-xl p-3 mb-4" style={{
                background: quests?.perfect_day ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${quests?.perfect_day ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)'}`,
              }} data-testid="perfect-day-progress">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Flame size={13} style={{ color: quests?.perfect_day ? '#F59E0B' : 'var(--text-muted)' }} />
                    <span className="text-[10px] font-medium" style={{ color: quests?.perfect_day ? '#F59E0B' : 'var(--text-primary)' }}>
                      {quests?.perfect_day ? 'Perfect Day Achieved!' : 'Perfect Day'}
                    </span>
                  </div>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {quests?.pillars_done || 0}/{quests?.pillars_total || 5} pillars
                    {!quests?.perfect_day && ` | +${quests?.perfect_day_bonus || 100} XP bonus`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((quests?.pillars_done || 0) / (quests?.pillars_total || 5)) * 100}%` }}
                    className="h-full rounded-full"
                    style={{ background: quests?.perfect_day ? '#F59E0B' : '#818CF8' }} />
                </div>
              </div>

              {/* Quest List */}
              <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Daily Quests ({quests?.completed_count || 0}/{quests?.total_count || 6})
              </p>
              <div className="space-y-2 mb-4">
                {quests?.quests?.map(q => (
                  <QuestCard key={q.id} quest={q}
                    onNavigate={navigate}
                    onComplete={['breath_reset', 'breathing', 'soundscape'].includes(q.id) && !q.completed ? completeQuest : null} />
                ))}
              </div>

              {/* 3-Breath Reset Quick Action */}
              {!quests?.quests?.find(q => q.id === 'breath_reset')?.completed && (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                  onClick={doBreathReset}
                  className="w-full rounded-xl p-4 text-center transition-all"
                  style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}
                  data-testid="breath-reset-btn">
                  <Zap size={20} style={{ color: '#818CF8' }} className="mx-auto mb-1" />
                  <p className="text-[11px] font-medium" style={{ color: '#818CF8' }}>3-Breath Reset</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Quick center yourself — +{quests?.quests?.find(q => q.id === 'breath_reset')?.xp_with_multiplier || 10} XP</p>
                </motion.button>
              )}

              {/* Streak Tip */}
              <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {quests?.streak?.days >= 7
                    ? `${quests.streak.days}-day streak! You're earning ${quests.streak.multiplier}x XP on all quests.`
                    : quests?.streak?.days >= 3
                    ? `${quests.streak.days}-day streak! 1.5x XP active. Reach 7 days for 2x!`
                    : 'Complete quests daily to build a streak. 3 days = 1.5x XP, 7 days = 2x XP!'}
                </p>
              </div>
            </motion.div>
          )}

          {/* CHARACTER TAB */}
          {tab === 'character' && (
            <motion.div key="char" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* 3D Avatar Preview — gear colors tint the model */}
              <Suspense fallback={
                <div style={{
                  width: 260, height: 260, margin: '0 auto 12px', borderRadius: 16,
                  background: 'radial-gradient(circle at 50% 55%, rgba(129,140,248,0.08) 0%, rgba(6,3,18,0.9) 70%)',
                  border: '1px solid rgba(129,140,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CosmicInlineLoader size={18} />
                </div>
              }>
                <CosmicAvatarPreview equipped={equipMap} size={260} />
              </Suspense>

              {/* Equipment Slots */}
              <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Equipment</p>
              {(() => {
                const unequippedGear = (inventory?.items || []).filter(i => i?.slot && ['head','body','conduit','trinket'].includes(i.slot) && !equipMap[i.slot]);
                const emptySlots = ['head','body','conduit','trinket'].filter(s => !equipMap[s]);
                return unequippedGear.length > 0 && emptySlots.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 mb-3 flex items-center justify-between gap-3"
                    style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)' }}
                    data-testid="gear-ready-cta">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package size={16} style={{ color: '#818CF8', flexShrink: 0 }} />
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-primary)' }}>
                        <span style={{ color: '#818CF8', fontWeight: 600 }}>{unequippedGear.length}</span> item{unequippedGear.length > 1 ? 's' : ''} ready to equip
                      </p>
                    </div>
                    <button
                      onClick={() => setTab('inventory')}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-medium flex-shrink-0"
                      style={{ background: '#818CF8', color: '#fff' }}
                      data-testid="jump-to-inventory">
                      Open Inventory →
                    </button>
                  </motion.div>
                ) : null;
              })()}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {['head', 'body', 'conduit', 'trinket'].map(slot => (
                  <EquipSlot
                    key={slot}
                    slot={slot}
                    item={equipMap[slot]}
                    onUnequip={unequipItem}
                    onTapEmpty={() => {
                      const match = (inventory?.items || []).find(i => i?.slot === slot);
                      if (match) {
                        equipItem(match.id);
                      } else {
                        setTab('inventory');
                        toast.info(`No ${slot} gear found. Earn items via Rock Hounding, Bosses, or Shop.`);
                      }
                    }}
                  />
                ))}
              </div>
              {/* Stats */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Stats</p>
                {c?.stat_points > 0 && <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>{c.stat_points} points</span>}
              </div>
              <div className="space-y-2.5 mb-5">
                {Object.entries(c?.stats || {}).map(([name, val]) => (
                  <StatBar key={name} name={name} value={val} bonus={equipBonuses[name] || 0}
                    icon={STAT_ICONS[name] || Star} color={STAT_COLORS[name] || '#818CF8'}
                    onAllocate={allocateStat} canAllocate={c?.stat_points > 0} />
                ))}
              </div>
              {/* Currencies */}
              <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Currencies</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Cosmic Dust', val: inventory?.currencies?.cosmic_dust, color: '#F59E0B' },
                  { name: 'Stardust', val: inventory?.currencies?.stardust_shards, color: '#818CF8' },
                  { name: 'Soul Fragments', val: inventory?.currencies?.soul_fragments, color: '#EF4444' },
                ].map(cur => (
                  <div key={cur.name} className="rounded-xl p-3 text-center" style={{ background: `${cur.color}06`, border: `1px solid ${cur.color}10` }}>
                    <p className="text-lg font-semibold" style={{ color: cur.color }}>{cur.val || 0}</p>
                    <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{cur.name}</p>
                  </div>
                ))}
              </div>
              {/* Passive XP */}
              {c?.passive_xp_rate > 0 && (
                <p className="text-[8px] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  Passive: +{c.passive_xp_rate} XP/hr from equipped trinkets
                </p>
              )}
            </motion.div>
          )}

          {/* INVENTORY TAB */}
          {tab === 'inventory' && (
            <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Items ({inventory?.count}/{inventory?.capacity})
                </p>
                {inventory?.count === 0 && (
                  <button onClick={claimStarterKit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px]"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)', color: '#22C55E' }}
                    data-testid="claim-starter-kit">
                    <Gift size={11} /> Claim Starter Kit
                  </button>
                )}
              </div>
              {inventory?.items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inventory.items.map(item => (
                    <ItemCard key={item.id} item={item} onEquip={equipItem} onUse={useConsumable} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package size={32} style={{ color: 'rgba(255,255,255,0.06)' }} className="mx-auto mb-3" />
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Your inventory is empty</p>
                </div>
              )}
            </motion.div>
          )}


          {/* SHOP TAB */}
          {tab === 'shop' && shop && (
            <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Currency Bar */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)' }}>
                  <Gem size={14} className="mx-auto mb-0.5" style={{ color: '#A855F7' }} />
                  <p className="text-lg font-semibold" style={{ color: '#A855F7' }}>{shop.currencies.gems}</p>
                  <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Celestial Gems</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <Sparkles size={14} className="mx-auto mb-0.5" style={{ color: '#F59E0B' }} />
                  <p className="text-lg font-semibold" style={{ color: '#F59E0B' }}>{shop.currencies.dust}</p>
                  <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cosmic Dust</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <Flame size={14} className="mx-auto mb-0.5" style={{ color: '#EF4444' }} />
                  <p className="text-lg font-semibold" style={{ color: '#EF4444' }}>{shop.currencies.soul_fragments}</p>
                  <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Soul Fragments</p>
                </div>
              </div>

              {/* Shop View Toggle */}
              <div className="flex gap-1 mb-4 p-1 rounded-lg overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', scrollbarWidth: 'none' }}>
                {[
                  { id: 'dust', label: 'Dust Shop', icon: Sparkles, color: '#F59E0B' },
                  { id: 'gems', label: 'Gem Shop', icon: Gem, color: '#A855F7' },
                  { id: 'packs', label: 'Buy Gems', icon: ShoppingBag, color: '#22C55E' },
                  { id: 'convert', label: 'Transmute', icon: ArrowRightLeft, color: '#FCD34D' },
                  { id: 'slots', label: 'Slots', icon: Unlock, color: '#3B82F6' },
                ].map(v => (
                  <button key={v.id} onClick={() => setShopView(v.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[9px] transition-all flex-shrink-0"
                    style={{
                      background: shopView === v.id ? `${v.color}12` : 'transparent',
                      color: shopView === v.id ? v.color : 'var(--text-muted)',
                      border: shopView === v.id ? `1px solid ${v.color}22` : '1px solid transparent',
                      touchAction: 'manipulation',
                    }}
                    data-testid={`shop-view-${v.id}`}>
                    <v.icon size={10} /> {v.label}
                  </button>
                ))}
              </div>

              {/* TRANSMUTE - Dust to Credits */}
              {shopView === 'convert' && (
                <div className="space-y-3" data-testid="transmute-panel">
                  <div className="rounded-xl p-4" style={{ background: 'rgba(252,211,77,0.03)', border: '1px solid rgba(252,211,77,0.1)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft size={14} style={{ color: '#FCD34D' }} />
                      <p className="text-[11px] font-semibold" style={{ color: '#FCD34D' }}>Alchemical Exchange</p>
                    </div>
                    <p className="text-[9px] mb-3" style={{ color: 'var(--text-muted)' }}>
                      Transmute Cosmic Dust into Credits. Current rate: <span style={{ color: '#FCD34D' }}>150 Dust = 1 Credit</span>
                    </p>
                    <div className="flex gap-2 mb-3">
                      {[150, 300, 450, 750].map(amt => (
                        <button key={amt} onClick={() => setDustTransmuteAmt(amt)}
                          className="flex-1 py-1.5 rounded-lg text-[9px] font-medium transition-all"
                          style={{
                            background: dustTransmuteAmt === amt ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.02)',
                            color: dustTransmuteAmt === amt ? '#FCD34D' : 'var(--text-muted)',
                            border: `1px solid ${dustTransmuteAmt === amt ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.04)'}`,
                            touchAction: 'manipulation',
                          }}
                          data-testid={`convert-preset-${amt}`}>
                          {amt}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg mb-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: '#F59E0B' }}>{dustTransmuteAmt} Dust</span> → <span style={{ color: '#FCD34D' }}>{Math.floor(dustTransmuteAmt / 150)} Credits</span>
                      </div>
                      <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Balance: {shop.currencies.dust} Dust
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        latency?.startPulse('transmute');
                        try {
                          const res = await axios.post(`${API}/marketplace/convert-dust`, { dust_amount: dustTransmuteAmt }, { headers });
                          latency?.endPulse('transmute', true);
                          toast.success(`Transmuted ${res.data.dust_spent} Dust → ${res.data.credits_earned} Credits`);
                          fetchData();
                        } catch (err) {
                          latency?.endPulse('transmute', false);
                          toast.error(err.response?.data?.detail || 'Conversion failed');
                        }
                      }}
                      disabled={shop.currencies.dust < dustTransmuteAmt || dustTransmuteAmt < 150}
                      className="w-full py-2.5 rounded-xl text-[11px] font-bold transition-all"
                      style={{
                        background: shop.currencies.dust >= dustTransmuteAmt ? 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(245,158,11,0.1))' : 'rgba(255,255,255,0.02)',
                        color: shop.currencies.dust >= dustTransmuteAmt ? '#FCD34D' : 'rgba(255,255,255,0.6)',
                        border: `1px solid ${shop.currencies.dust >= dustTransmuteAmt ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        touchAction: 'manipulation',
                      }}
                      data-testid="transmute-dust-btn">
                      Transmute {dustTransmuteAmt} Dust
                    </motion.button>
                  </div>
                </div>
              )}

              {/* DUST SHOP */}
              {shopView === 'dust' && (
                <div className="space-y-2">
                  {shop.dust_shop.map(item => (
                    <div key={item.id} className="rounded-xl p-3 flex items-center gap-3 group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      data-testid={`shop-item-${item.id}`}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${RARITY_COLORS[item.rarity] || '#9CA3AF'}10`, border: `1px solid ${RARITY_COLORS[item.rarity] || '#9CA3AF'}20` }}>
                        <Package size={14} style={{ color: RARITY_COLORS[item.rarity] || '#9CA3AF' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium" style={{ color: RARITY_COLORS[item.rarity] || 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                        {item.stats && <p className="text-[7px] mt-0.5" style={{ color: '#818CF8' }}>
                          {Object.entries(item.stats).map(([k,v]) => `+${v} ${k}`).join(', ')}
                        </p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[9px] font-semibold" style={{ color: '#F59E0B' }}>{item.cost} Dust</p>
                        {item.owned ? (
                          <span className="text-[7px]" style={{ color: '#22C55E' }}>Owned</span>
                        ) : (
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => buyShopItem(item.id)}
                            className="mt-0.5 text-[7px] px-2 py-0.5 rounded"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
                            data-testid={`buy-${item.id}`}>Buy</motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GEM SHOP */}
              {shopView === 'gems' && (
                <div className="space-y-2">
                  {shop.gem_shop.map(item => (
                    <div key={item.id} className="rounded-xl p-3 flex items-center gap-3"
                      style={{ background: 'rgba(168,85,247,0.02)', border: `1px solid ${RARITY_COLORS[item.rarity] || '#A855F7'}15` }}
                      data-testid={`shop-item-${item.id}`}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${RARITY_COLORS[item.rarity] || '#A855F7'}10`, border: `1px solid ${RARITY_COLORS[item.rarity] || '#A855F7'}20` }}>
                        <Gem size={14} style={{ color: RARITY_COLORS[item.rarity] || '#A855F7' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[10px] font-medium" style={{ color: RARITY_COLORS[item.rarity] || '#A855F7' }}>{item.name}</p>
                          <span className="text-[6px] px-1 py-0.5 rounded uppercase" style={{
                            background: `${RARITY_COLORS[item.rarity]}10`, color: RARITY_COLORS[item.rarity]
                          }}>{item.rarity}</span>
                        </div>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                        {item.stats && <p className="text-[7px] mt-0.5" style={{ color: '#818CF8' }}>
                          {Object.entries(item.stats).map(([k,v]) => `+${v} ${k}`).join(', ')}
                        </p>}
                        {item.passive_xp > 0 && <p className="text-[7px]" style={{ color: '#22C55E' }}>+{item.passive_xp} XP/hr passive</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[9px] font-semibold" style={{ color: '#A855F7' }}>{item.cost} <Gem size={8} className="inline" /></p>
                        {item.owned ? (
                          <span className="text-[7px]" style={{ color: '#22C55E' }}>Owned</span>
                        ) : (
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => buyShopItem(item.id)}
                            className="mt-0.5 text-[7px] px-2 py-0.5 rounded"
                            style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7' }}
                            data-testid={`buy-${item.id}`}>Buy</motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* BUY GEM PACKS */}
              {shopView === 'packs' && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    Purchase Celestial Gems
                  </p>
                  <div className="space-y-2 mb-5">
                    {shop.gem_packs.map((pack, i) => (
                      <motion.button key={pack.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => purchaseGems(pack.id)}
                        className="w-full rounded-xl p-4 flex items-center gap-3 text-left transition-all"
                        style={{
                          background: i === 2 ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${i === 2 ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)'}`,
                        }}
                        data-testid={`buy-pack-${pack.id}`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(168,85,247,0.1)' }}>
                          <Gem size={18} style={{ color: '#A855F7' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-medium" style={{ color: '#A855F7' }}>{pack.label}</p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            {pack.gems} gems{pack.bonus > 0 && <span style={{ color: '#22C55E' }}> +{pack.bonus} bonus!</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>${pack.price.toFixed(2)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Currency Conversion */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.08)' }}
                    data-testid="gem-conversion">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft size={13} style={{ color: '#818CF8' }} />
                      <p className="text-[10px] font-medium" style={{ color: '#818CF8' }}>Convert Gems to Dust</p>
                      <span className="text-[7px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                        1 Gem = {shop.conversion_rate} Dust
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <button onClick={() => setConvertAmount(Math.max(1, convertAmount - 5))}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <Minus size={10} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <input type="number" value={convertAmount}
                          onChange={e => setConvertAmount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center text-sm bg-transparent rounded py-1"
                          style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                          data-testid="convert-amount-input" />
                        <button onClick={() => setConvertAmount(convertAmount + 5)}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <Plus size={10} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                      <div className="text-[9px] px-2" style={{ color: 'var(--text-muted)' }}>
                        = {convertAmount * shop.conversion_rate} Dust
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={convertGems}
                        className="px-3 py-1.5 rounded-lg text-[9px] font-medium"
                        style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.15)' }}
                        data-testid="convert-gems-btn">
                        Convert
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* SLOT UNLOCKS */}
              {shopView === 'slots' && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                    Equipment Slot Upgrades
                  </p>
                  <p className="text-[8px] mb-3" style={{ color: 'var(--text-muted)' }}>
                    Unlock additional equipment slots with Celestial Gems
                  </p>
                  <div className="space-y-2">
                    {shop.slot_unlocks.map(slot => (
                      <div key={slot.id} className="rounded-xl p-3 flex items-center gap-3"
                        style={{
                          background: slot.unlocked ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${slot.unlocked ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)'}`,
                        }}
                        data-testid={`slot-unlock-${slot.id}`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: slot.unlocked ? 'rgba(34,197,94,0.08)' : 'rgba(129,140,248,0.06)' }}>
                          {slot.unlocked ? <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
                            : <Lock size={16} style={{ color: '#818CF8' }} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-medium" style={{ color: slot.unlocked ? '#22C55E' : 'var(--text-primary)' }}>
                            {slot.name} Slot
                          </p>
                          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{slot.description}</p>
                        </div>
                        <div className="text-right">
                          {slot.unlocked ? (
                            <span className="text-[9px] font-medium" style={{ color: '#22C55E' }}>Unlocked</span>
                          ) : (
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => unlockSlot(slot.id)}
                              className="text-[9px] px-3 py-1.5 rounded-lg font-medium"
                              style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.15)' }}
                              data-testid={`unlock-${slot.id}`}>
                              <Gem size={9} className="inline mr-1" />{slot.gem_cost} Gems
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}


          {/* WORLD MAP TAB */}
          {tab === 'world' && (
            <motion.div key="world" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-[9px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                World Map — {world?.regions?.filter(r => r.discovered).length}/{world?.regions?.length} discovered
              </p>
              <div className="relative rounded-2xl overflow-hidden" style={{ height: '400px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                  {world?.regions?.filter(r => r.discovered).flatMap(r =>
                    r.connections?.map(connId => {
                      const conn = world.regions.find(rr => rr.id === connId);
                      if (!conn || !conn.discovered) return null;
                      return (
                        <line key={`${r.id}-${connId}`}
                          x1={`${r.x}%`} y1={`${r.y}%`} x2={`${conn.x}%`} y2={`${conn.y}%`}
                          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
                      );
                    })
                  )}
                </svg>
                {/* Regions */}
                {world?.regions?.map(r => (
                  <RegionNode key={r.id} region={r} onExplore={exploreRegion} />
                ))}
              </div>
              {/* Secrets */}
              {world?.secrets?.length > 0 && (
                <>
                  <p className="text-[9px] uppercase tracking-widest mt-5 mb-2" style={{ color: 'var(--text-muted)' }}>Secret Locations</p>
                  <div className="space-y-2">
                    {world.secrets.map(s => (
                      <div key={s.id} className="rounded-xl p-3" style={{ background: s.unlocked ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.01)', border: `1px solid ${s.unlocked ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)'}` }}>
                        <div className="flex items-center gap-2">
                          {s.unlocked ? <Star size={12} style={{ color: '#F59E0B' }} /> : <Lock size={12} style={{ color: 'rgba(255,255,255,0.15)' }} />}
                          <div>
                            <p className="text-[10px] font-medium" style={{ color: s.unlocked ? '#F59E0B' : 'var(--text-muted)' }}>{s.unlocked ? s.name : '???'}</p>
                            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{s.unlock_condition}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* BOSSES TAB */}
          {tab === 'bosses' && (
            <motion.div key="bosses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {encounter ? (
                /* Active Battle */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>Battle in Progress</p>
                    <button onClick={() => setEncounter(null)} className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Exit</button>
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-base font-medium mb-2" style={{ color: '#EF4444' }}>{encounter.boss}</p>
                    <div className="mb-3">
                      <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div animate={{ width: `${(encounter.current_hp / encounter.max_hp) * 100}%` }}
                          className="h-full rounded-full" style={{ background: '#EF4444' }} />
                      </div>
                      <p className="text-[8px] text-right mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {encounter.current_hp?.toLocaleString()} / {encounter.max_hp?.toLocaleString()} HP
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'meditate', label: 'Meditate', icon: Brain, color: '#C084FC', desc: 'Focus + Wisdom' },
                        { type: 'frequency', label: 'Frequency', icon: Music, color: '#818CF8', desc: 'Resonance + Harmony' },
                        { type: 'breathe', label: 'Breathe', icon: Heart, color: '#22C55E', desc: 'Harmony + Vitality' },
                      ].map(atk => (
                        <motion.button key={atk.type} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                          onClick={() => attackBoss(atk.type)} disabled={attacking}
                          className="rounded-xl p-3 text-center transition-all disabled:opacity-40"
                          style={{ background: `${atk.color}08`, border: `1px solid ${atk.color}15` }}
                          data-testid={`attack-${atk.type}`}>
                          <atk.icon size={20} style={{ color: atk.color }} className="mx-auto mb-1" />
                          <p className="text-[10px] font-medium" style={{ color: atk.color }}>{atk.label}</p>
                          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{atk.desc}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Boss List + World Veins + Rival */
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Cosmic Threats</p>
                    <div className="space-y-2">
                      {bosses?.map(b => <BossCard key={b.id} boss={b} onJoin={joinBoss} />)}
                    </div>
                  </div>

                  {/* World Veins — Collective Bosses */}
                  {worldVeins.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#3B82F6' }}>
                        World Veins — Collective Encounters
                      </p>
                      <div className="space-y-2">
                        {worldVeins.map(vein => {
                          const pct = Math.min((vein.current_resonance / vein.required_resonance) * 100, 100);
                          const expired = new Date(vein.expires_at) < new Date();
                          return (
                            <motion.div key={vein.id} whileHover={{ scale: 1.01 }}
                              className="rounded-xl p-3 relative overflow-hidden"
                              style={{ background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.08)' }}
                              data-testid={`vein-${vein.id}`}>
                              <motion.div className="absolute inset-0"
                                animate={{ opacity: [0.02, 0.06, 0.02] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ background: `radial-gradient(circle at 50% 50%, rgba(59,130,246,0.1), transparent 70%)` }} />
                              <div className="relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Globe size={12} style={{ color: '#3B82F6' }} />
                                    <p className="text-[10px] font-medium" style={{ color: '#3B82F6' }}>{vein.name}</p>
                                  </div>
                                  {expired ? (
                                    <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>Expired</span>
                                  ) : (
                                    <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>Active</span>
                                  )}
                                </div>
                                <p className="text-[8px] mb-2" style={{ color: 'var(--text-muted)' }}>{vein.description}</p>
                                <div className="w-full h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  <motion.div animate={{ width: `${pct}%` }}
                                    className="h-full rounded-full" style={{ background: pct >= 100 ? '#22C55E' : '#3B82F6' }} />
                                </div>
                                <div className="flex items-center justify-between text-[7px]" style={{ color: 'var(--text-muted)' }}>
                                  <span>{vein.contributors || 0} contributors</span>
                                  <span>{Math.round(pct)}% resonance</span>
                                </div>
                                {!expired && pct < 100 && (
                                  <motion.button whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                      latency?.startPulse('contribute_vein');
                                      try {
                                        const res = await axios.post(`${API}/encounters/contribute-vein`, { vein_id: vein.id }, { headers });
                                        latency?.endPulse('contribute_vein', true);
                                        toast.success(`Contributed! +${res.data.resonance_added} resonance. ${res.data.rewards?.xp ? `+${res.data.rewards.xp} XP` : ''}`);
                                        fetchData();
                                      } catch (err) {
                                        latency?.endPulse('contribute_vein', false);
                                        toast.error(err.response?.data?.detail || 'Failed');
                                      }
                                    }}
                                    className="w-full mt-2 py-1.5 rounded-lg text-[9px] font-medium"
                                    style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.12)', touchAction: 'manipulation' }}
                                    data-testid={`contribute-vein-${vein.id}`}>
                                    Contribute Resonance
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* NPC Rival */}
                  {rival && !rival.expired && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: rival.color || '#A855F7' }}>
                        Rival NPC — {rival.archetype?.title || 'Unknown'}
                      </p>
                      <div className="rounded-xl p-3 relative overflow-hidden"
                        style={{ background: `${rival.color || '#A855F7'}04`, border: `1px solid ${rival.color || '#A855F7'}10` }}
                        data-testid="npc-rival">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${rival.color || '#A855F7'}10` }}>
                            {rival.archetype?.icon === 'zap' ? <Zap size={18} style={{ color: rival.color }} /> : <Eye size={18} style={{ color: rival.color }} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-medium" style={{ color: rival.color || '#A855F7', fontFamily: 'Cormorant Garamond, serif' }}>
                              {rival.archetype?.name || rival.npc_type}
                            </p>
                            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{rival.archetype?.description}</p>
                          </div>
                        </div>
                        {rival.dialogue && (
                          <p className="text-[9px] italic mb-2 p-2 rounded-lg"
                            style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif' }}>
                            "{rival.dialogue}"
                          </p>
                        )}
                        <div className="flex gap-2">
                          <motion.button whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              latency?.startPulse('rival_action');
                              try {
                                const res = await axios.post(`${API}/encounters/rival-action`, { action: 'compete' }, { headers });
                                latency?.endPulse('rival_action', true);
                                if (res.data.success) {
                                  toast.success(`You beat ${rival.archetype?.name}! +${res.data.rewards?.xp || 0} XP`);
                                } else {
                                  toast.error(`${rival.archetype?.name} got the specimen first!`);
                                }
                                fetchData();
                              } catch (err) {
                                latency?.endPulse('rival_action', false);
                                toast.error(err.response?.data?.detail || 'Failed');
                              }
                            }}
                            className="flex-1 py-2 rounded-lg text-[9px] font-medium"
                            style={{ background: `${rival.color}10`, color: rival.color, border: `1px solid ${rival.color}15`, touchAction: 'manipulation' }}
                            data-testid="rival-compete">
                            Compete
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              latency?.startPulse('rival_action');
                              try {
                                const res = await axios.post(`${API}/encounters/rival-action`, { action: 'evade' }, { headers });
                                latency?.endPulse('rival_action', true);
                                toast(res.data.success ? 'Evaded successfully. Rival moves on.' : 'Failed to evade!');
                                fetchData();
                              } catch (err) {
                                latency?.endPulse('rival_action', false);
                                toast.error(err.response?.data?.detail || 'Failed');
                              }
                            }}
                            className="flex-1 py-2 rounded-lg text-[9px] font-medium"
                            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)', touchAction: 'manipulation' }}
                            data-testid="rival-evade">
                            Evade
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* PARTY / CIRCLE TAB */}
          {tab === 'party' && (
            <motion.div key="party" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {party ? (
                <div>
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#818CF8' }}>{party.name}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Invite: {party.invite_code}</p>
                      </div>
                      <button onClick={leaveParty} className="text-[9px] px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>Leave</button>
                    </div>
                    <div className="space-y-2">
                      {party.members?.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <Users size={12} style={{ color: m.role === 'leader' ? '#F59E0B' : '#818CF8' }} />
                          <span className="text-[10px]" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                          {m.role === 'leader' && <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>Leader</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users size={32} style={{ color: 'rgba(255,255,255,0.06)' }} className="mx-auto mb-3" />
                  <p className="text-sm font-light mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>No Circle Yet</p>
                  <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>Create or join a Circle to fight bosses together</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={createParty} className="px-4 py-2 rounded-lg text-[10px]"
                      style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8' }}
                      data-testid="create-party">Create Circle</button>
                    <button onClick={joinParty} className="px-4 py-2 rounded-lg text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
                      data-testid="join-party">Join with Code</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
