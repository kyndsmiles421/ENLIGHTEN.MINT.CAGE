import React from 'react';
import { motion } from 'framer-motion';
import {
  Star, Swords, ChevronRight, Loader2, ArrowLeft
} from 'lucide-react';
import { ORIGIN_COLORS, STAT_ICONS, ENCOUNTER_TYPE_ICONS } from './constants';

export function EncounterScene({ encounter, onChoice, loading, onBack }) {
  const scene = encounter?.scene;
  const p1 = encounter?.player_1;
  const p2 = encounter?.player_2;
  const etIcon = ENCOUNTER_TYPE_ICONS[scene?.encounter_type] || Star;
  const EncTypeIcon = etIcon;

  if (!scene) return null;

  const atm = { mystical: '#818CF8', epic: '#F59E0B', dark: '#DC2626', peaceful: '#2DD4BF', ethereal: '#C084FC', tense: '#EF4444', triumphant: '#FCD34D' };
  const color = atm[scene.atmosphere] || '#818CF8';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10" data-testid="encounter-scene">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs group" style={{ color: 'var(--text-muted)' }}
          data-testid="encounter-back-btn">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Realm
        </button>
        <span className="text-[9px] px-3 py-1 rounded-full uppercase font-bold flex items-center gap-1.5"
          style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
          <EncTypeIcon size={10} /> {scene.encounter_type}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1"
            style={{ background: `${ORIGIN_COLORS[p1?.origin_id] || '#818CF8'}15`, border: `2px solid ${ORIGIN_COLORS[p1?.origin_id] || '#818CF8'}40` }}>
            <Star size={22} style={{ color: ORIGIN_COLORS[p1?.origin_id] || '#818CF8' }} />
          </div>
          <p className="text-xs font-medium" style={{ color: ORIGIN_COLORS[p1?.origin_id] || '#818CF8' }}>{p1?.character_name}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lvl {p1?.level}</p>
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Swords size={24} style={{ color }} />
        </motion.div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1"
            style={{ background: `${ORIGIN_COLORS[p2?.origin_id] || '#DC2626'}15`, border: `2px solid ${ORIGIN_COLORS[p2?.origin_id] || '#DC2626'}40` }}>
            <Star size={22} style={{ color: ORIGIN_COLORS[p2?.origin_id] || '#DC2626' }} />
          </div>
          <p className="text-xs font-medium" style={{ color: ORIGIN_COLORS[p2?.origin_id] || '#DC2626' }}>
            {p2?.character_name} {p2?.is_npc && <span className="text-[8px] opacity-60">(NPC)</span>}
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lvl {p2?.level}</p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-3" style={{ color }}>{scene.scene_title}</p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
        className="rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${color}12`, backdropFilter: 'blur(12px)' }}
        data-testid="encounter-narrative">
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}10, transparent)` }} />
        <p className="text-base md:text-lg leading-loose relative" style={{
          fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '18px', lineHeight: '2',
        }}>{scene.narrative}</p>
      </motion.div>

      <div className="space-y-3" data-testid="encounter-choices">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] px-3" style={{ color }}>Choose Your Path</p>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
        </div>
        {scene.choices?.map((choice, i) => {
          const statKey = Object.keys(choice.stat_effect || {})[0];
          const StatIcon = STAT_ICONS[statKey] || Star;
          const statDelta = choice.stat_effect?.[statKey] || 0;

          return (
            <motion.button key={i}
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12 }}
              onClick={() => !loading && onChoice(i)}
              disabled={loading}
              className="w-full relative overflow-hidden rounded-xl p-4 md:p-5 text-left transition-all hover:scale-[1.01] group border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: loading ? 0.5 : 1 }}
              data-testid={`encounter-choice-${i}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-sm font-bold" style={{ color }}>{String.fromCharCode(65 + i)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{choice.text}</p>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                      style={{ background: `${color}12`, color }}>
                      <StatIcon size={9} /> +{statDelta} {statKey?.toUpperCase()?.slice(0, 3)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
                      +{choice.xp || 20} XP
                    </span>
                    <span className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>{choice.outcome_hint}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <Loader2 className="animate-spin" size={16} style={{ color }} />
          <span className="text-xs" style={{ color }}>Resolving encounter...</span>
        </div>
      )}
    </motion.div>
  );
}
