import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Star, Swords, Shield, Heart, ChevronRight, Loader2,
  Skull, Target, AlertTriangle, Flame, Trophy
} from 'lucide-react';
import { ORIGIN_COLORS, STAT_ICONS } from './constants';
import { LootDropReveal } from '../StarseedInventory';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function BossEncounterPanel({ activeOrigin, authHeaders, userId }) {
  const [bosses, setBosses] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [lootDrop, setLootDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/starseed/realm/bosses`, { headers: authHeaders })
      .then(r => setBosses(r.data.bosses))
      .catch(() => {})
      .finally(() => setInitLoading(false));
  }, [authHeaders]);

  const initiateBoss = useCallback(async (bossId) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    setBattleResult(null);
    try {
      const res = await axios.post(`${API}/starseed/realm/boss/initiate`, {
        boss_id: bossId, origin_id: activeOrigin,
      }, { headers: authHeaders });
      setActiveBattle(res.data);
      toast.success('Boss encounter initiated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start boss fight');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, authHeaders, loading]);

  const bossAction = useCallback(async (choiceIndex) => {
    if (!activeBattle || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/realm/boss/action`, {
        battle_id: activeBattle.id, choice_index: choiceIndex,
      }, { headers: authHeaders });

      if (res.data.battle_over) {
        setBattleResult(res.data);
        setActiveBattle(null);
        if (res.data.boss_defeated && res.data.reward?.loot_drop) {
          setLootDrop(res.data.reward.loot_drop);
        }
      } else {
        const equipBonus = res.data.equipment_bonus || 0;
        const resMult = res.data.resonance_multiplier || 1.0;
        const gemFx = res.data.active_gem_effects || [];
        const dmg = res.data.damage_dealt || 0;

        if (resMult > 1.0) {
          toast(`RESONANCE x${resMult}`, {
            description: `${dmg} damage dealt${equipBonus > 0 ? ` (+${equipBonus} gear)` : ''}${gemFx.length > 0 ? ` — ${gemFx.join(', ')} glowing` : ''}`,
            style: {
              background: 'linear-gradient(135deg, rgba(168,85,247,0.92), rgba(252,211,77,0.88))',
              border: '1px solid rgba(252,211,77,0.5)',
              color: '#FFF',
              boxShadow: '0 0 24px rgba(168,85,247,0.4), 0 0 60px rgba(252,211,77,0.15)',
              animation: 'pulse 1.5s ease-in-out',
            },
          });
        } else if (res.data.was_weakness) {
          toast(`WEAKNESS HIT!`, {
            description: `${dmg} damage dealt${equipBonus > 0 ? ` (+${equipBonus} gear)` : ''}`,
            style: {
              background: 'rgba(220,38,38,0.92)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#FFF',
              boxShadow: '0 0 24px rgba(220,38,38,0.4)',
            },
          });
        } else if (equipBonus > 0) {
          toast(`${dmg} damage dealt`, {
            description: `+${equipBonus} from gear${gemFx.length > 0 ? ` — ${gemFx.join(', ')} active` : ''}`,
            style: {
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: '#E0F2FE',
              boxShadow: '0 0 16px rgba(56,189,248,0.2)',
            },
          });
        } else {
          toast.success(`${dmg} damage dealt${gemFx.length > 0 ? ` — ${gemFx.join(', ')} active` : ''}`);
        }

        setActiveBattle(prev => ({
          ...prev,
          boss_current_hp: res.data.boss_hp,
          phase: res.data.phase,
          current_scene: res.data.next_scene,
        }));
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  }, [activeBattle, authHeaders, loading]);

  if (initLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={20} style={{ color: '#DC2626' }} /></div>;

  const lootOverlay = (
    <AnimatePresence>
      {lootDrop && <LootDropReveal loot={lootDrop} onClose={() => setLootDrop(null)} />}
    </AnimatePresence>
  );

  // Battle Result Screen
  if (battleResult) {
    const won = battleResult.boss_defeated;
    return (
      <>
        {lootOverlay}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 text-center" style={{ background: won ? 'rgba(252,211,77,0.05)' : 'rgba(220,38,38,0.05)', border: `1px solid ${won ? 'rgba(252,211,77,0.2)' : 'rgba(220,38,38,0.2)'}` }}
        data-testid="boss-result">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}>
          {won ? <Trophy size={36} className="mx-auto mb-3" style={{ color: '#FCD34D' }} /> : <Skull size={36} className="mx-auto mb-3" style={{ color: '#DC2626' }} />}
        </motion.div>
        <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: won ? '#FCD34D' : '#DC2626' }}>
          {won ? 'Victory!' : 'Defeat'}
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {won ? 'The cosmic threat has been vanquished! Your power echoes across the realm.' : 'The enemy proved too powerful this time. Regroup and try again.'}
        </p>
        {battleResult.reward && (
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
              +{battleResult.reward.xp_earned} XP
            </span>
            {battleResult.reward.stat_bonus && (
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                {battleResult.reward.stat_bonus}
              </span>
            )}
            {battleResult.reward.leveled_up && (
              <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(252,211,77,0.12)', color: '#FCD34D' }}>
                Level Up! Lvl {battleResult.reward.new_level}
              </span>
            )}
          </div>
        )}
        {(battleResult.equipment_bonus > 0 || battleResult.resonance_multiplier > 1.0 || (battleResult.active_gem_effects?.length > 0)) && (
          <div className="rounded-xl p-3 mb-4 text-center"
            style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <p className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C084FC' }}>Combat Resonance</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {battleResult.equipment_bonus > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.08)', color: '#38BDF8' }}>
                  +{battleResult.equipment_bonus} Gear Bonus
                </span>
              )}
              {battleResult.resonance_multiplier > 1.0 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.08)', color: '#A855F7' }}>
                  x{battleResult.resonance_multiplier} Resonance
                </span>
              )}
              {battleResult.active_gem_effects?.map((gem, i) => (
                <motion.span key={i}
                  animate={{ boxShadow: ['0 0 4px rgba(192,132,252,0.2)', '0 0 12px rgba(192,132,252,0.4)', '0 0 4px rgba(192,132,252,0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(240,171,252,0.08)', color: '#F0ABFC' }}>
                  {gem}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        {battleResult.reward?.new_achievements?.map(a => (
          <div key={a.id} className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={12} style={{ color: '#C084FC' }} />
            <span className="text-xs" style={{ color: '#C084FC' }}>{a.title} — {a.desc}</span>
          </div>
        ))}
        <button onClick={() => setBattleResult(null)}
          className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
          data-testid="boss-return-btn">
          Return to Bosses
        </button>
      </motion.div>
      </>
    );
  }

  // Active Battle
  if (activeBattle) {
    const scene = activeBattle.current_scene || {};
    const hpPct = (activeBattle.boss_current_hp / activeBattle.boss_hp) * 100;
    const bossColor = activeBattle.boss_color || '#DC2626';
    const atm = { epic: '#F59E0B', dark: '#DC2626', tense: '#EF4444', triumphant: '#FCD34D', mystical: '#818CF8' };
    const sceneColor = atm[scene.atmosphere] || '#DC2626';
    const ArrowLeft = require('lucide-react').ArrowLeft;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="boss-battle">
        {lootOverlay}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setActiveBattle(null)} className="text-xs flex items-center gap-1 group" style={{ color: 'var(--text-muted)' }}
            data-testid="boss-exit-btn">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Exit
          </button>
          <span className="text-[9px] px-3 py-1 rounded-full uppercase font-bold"
            style={{ background: `${bossColor}10`, color: bossColor, border: `1px solid ${bossColor}20` }}>
            Phase {activeBattle.phase}/{activeBattle.max_phases}
          </span>
        </div>

        <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${bossColor}15` }}
          data-testid="boss-hp-bar">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Skull size={16} style={{ color: bossColor }} />
              <span className="text-sm font-bold" style={{ color: bossColor }}>{activeBattle.boss_name}</span>
            </div>
            <span className="text-xs tabular-nums" style={{ color: bossColor }}>
              {activeBattle.boss_current_hp}/{activeBattle.boss_hp} HP
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${hpPct}%` }} transition={{ duration: 0.8 }}
              style={{
                background: hpPct > 50 ? `linear-gradient(90deg, ${bossColor}80, ${bossColor})` : hpPct > 25 ? 'linear-gradient(90deg, #F59E0B80, #F59E0B)' : 'linear-gradient(90deg, #EF444480, #EF4444)',
                boxShadow: `0 0 12px ${bossColor}30`,
              }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
          {activeBattle.participants?.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: `${ORIGIN_COLORS[p.origin_id] || '#818CF8'}08`, border: `1px solid ${ORIGIN_COLORS[p.origin_id] || '#818CF8'}15` }}>
              <Star size={8} style={{ color: ORIGIN_COLORS[p.origin_id] || '#818CF8' }} />
              <span style={{ color: ORIGIN_COLORS[p.origin_id] || '#818CF8' }}>{p.character_name}</span>
              {p.is_npc && <span className="opacity-40">(NPC)</span>}
            </div>
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-3" style={{ color: sceneColor }}>
          {scene.phase_title}
        </p>

        {scene.boss_action && (
          <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{ background: `${bossColor}08`, border: `1px solid ${bossColor}12` }}>
            <AlertTriangle size={14} style={{ color: bossColor }} />
            <p className="text-xs" style={{ color: bossColor }}>{scene.boss_action}</p>
            <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded" style={{ background: `${bossColor}15`, color: bossColor }}>
              -{scene.boss_damage_to_party} DMG
            </span>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${sceneColor}12`, backdropFilter: 'blur(12px)' }}
          data-testid="boss-narrative">
          <p className="text-base md:text-lg leading-loose" style={{
            fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '18px', lineHeight: '2',
          }}>{scene.narrative}</p>
        </motion.div>

        <div className="space-y-3" data-testid="boss-choices">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${sceneColor}30, transparent)` }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] px-3" style={{ color: sceneColor }}>Rally Your Forces</p>
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${sceneColor}30, transparent)` }} />
          </div>
          {scene.choices?.map((choice, i) => {
            const StatIcon = STAT_ICONS[choice.stat_used] || Star;
            return (
              <motion.button key={i}
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => !loading && bossAction(i)}
                disabled={loading}
                className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.01] group border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: loading ? 0.5 : 1 }}
                data-testid={`boss-choice-${i}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-sm font-bold" style={{ color: sceneColor }}>{String.fromCharCode(65 + i)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{choice.text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                        <Target size={8} /> {choice.damage} DMG
                      </span>
                      {choice.team_heal > 0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                          <Heart size={8} /> +{choice.team_heal} HEAL
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: `rgba(255,255,255,0.04)` }}>
                        <StatIcon size={8} /> {choice.stat_used}
                      </span>
                      <span className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>{choice.outcome_hint}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: sceneColor }} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-6 gap-3">
            <Loader2 className="animate-spin" size={16} style={{ color: bossColor }} />
            <span className="text-xs" style={{ color: bossColor }}>Resolving battle phase...</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Boss Selection Grid
  return (
    <div data-testid="boss-select">
      {lootOverlay}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: '#DC2626' }}>
        <Skull size={11} /> Cosmic Threats
      </p>
      <div className="space-y-3">
        {bosses.map((boss, i) => (
          <motion.div key={boss.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 border relative overflow-hidden group"
            style={{ background: `linear-gradient(135deg, ${boss.color}06, rgba(0,0,0,0.3))`, borderColor: `${boss.color}15` }}
            data-testid={`boss-card-${boss.id}`}>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ background: `radial-gradient(ellipse at 20% 50%, ${boss.color}, transparent 60%)` }} />
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${boss.color}12`, border: `1px solid ${boss.color}20` }}>
                <Skull size={24} style={{ color: boss.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: boss.color }}>{boss.name}</h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold"
                    style={{ background: `${boss.color}10`, color: boss.color, border: `1px solid ${boss.color}15` }}>
                    {boss.difficulty}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{boss.description}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Heart size={8} /> HP: {boss.hp}
                  </span>
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Flame size={8} /> {boss.element}
                  </span>
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Target size={8} /> {boss.phases} phases
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                    Weak: {boss.weakness}
                  </span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                    Resists: {boss.resistance}
                  </span>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => initiateBoss(boss.id)}
                disabled={loading || !activeOrigin}
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${boss.color}20, ${boss.color}10)`,
                  border: `1px solid ${boss.color}30`,
                  color: boss.color,
                  opacity: (loading || !activeOrigin) ? 0.4 : 1,
                }}
                data-testid={`boss-fight-${boss.id}`}>
                <Swords size={12} /> Fight
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
