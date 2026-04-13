import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Star, Flame, ChevronRight, ChevronDown,
  Loader2, Globe, Package, User, Crown
} from 'lucide-react';
import { useSensory } from '../../context/SensoryContext';
import { InventoryPanel, AvatarGenerator, AvatarBadge } from '../StarseedInventory';

export function CharacterSelect({ origins, existingCharacters, onSelect, onResume, loading, authHeaders }) {
  const [selected, setSelected] = useState(null);
  const [charName, setCharName] = useState('');
  const [expandedChar, setExpandedChar] = useState(null);
  const { reduceMotion } = useSensory();

  return (
    <div data-testid="character-select" className="relative z-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.8 }}
        className="text-center mb-12">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, rgba(129,140,248,0.05) 70%)', border: '1px solid rgba(192,132,252,0.2)' }}>
            <Sparkles size={32} style={{ color: '#C084FC' }} />
          </div>
        </motion.div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#C084FC' }}>
          Choose Your Cosmic Origin
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif', background: 'linear-gradient(135deg, #E0E7FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Starseed Adventure
        </h1>
        <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          An AI-powered cosmic RPG. Select your starseed origin and embark on a branching journey through the stars. Every choice shapes your destiny.
        </p>
        {existingCharacters.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              onClick={() => window.location.href = '/starseed-realm'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
              data-testid="enter-realm-btn">
              <Globe size={13} /> Cosmic Realm
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              onClick={() => window.location.href = '/starseed-worlds'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38BDF8' }}
              data-testid="enter-multiverse-btn">
              <Star size={13} /> Multiverse
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              onClick={() => window.location.href = '/spiritual-avatar'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#EC4899' }}
              data-testid="avatar-creator-btn">
              <User size={13} /> Avatar Creator
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              onClick={() => window.location.href = '/cosmic-ledger'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.2)', color: '#FCD34D' }}
              data-testid="cosmic-ledger-btn">
              <Crown size={13} /> Cosmic Ledger
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Continue existing adventures */}
      {existingCharacters.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3 flex items-center gap-2" style={{ color: '#FCD34D' }}>
            <Flame size={11} /> Continue Your Journey
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingCharacters.map((ch, i) => {
              const origin = origins.find(o => o.id === ch.origin_id);
              if (!origin) return null;
              const isExpanded = expandedChar === ch.origin_id;
              return (
                <motion.div key={ch.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
                  className="relative overflow-hidden rounded-2xl border transition-all"
                  style={{ background: `linear-gradient(135deg, ${origin.color}08, rgba(0,0,0,0.3))`, borderColor: `${origin.color}20` }}>
                  <div
                    onClick={() => setExpandedChar(isExpanded ? null : ch.origin_id)}
                    className="w-full p-4 text-left flex items-center gap-3 cursor-pointer"
                    data-testid={`continue-${ch.origin_id}`}>
                    <AvatarBadge originId={ch.origin_id} authHeaders={authHeaders} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: origin.color }}>{ch.character_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{origin.name} &middot; {origin.star_system}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
                          Lvl {ch.level}
                        </span>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Ch.{ch.chapter} &middot; Scene {ch.scene}</span>
                        {(ch.inventory?.length || 0) > 0 && (
                          <span className="text-[9px] flex items-center gap-0.5" style={{ color: '#A855F7' }}>
                            <Package size={8} /> {ch.inventory.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); onResume(ch.origin_id); }}
                        className="text-[9px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                        style={{ background: `${origin.color}15`, color: origin.color, border: `1px solid ${origin.color}25` }}>
                        Play
                      </button>
                      <ChevronDown size={14} style={{ color: origin.color, opacity: 0.5, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${origin.color}10` }}>
                          <div className="pt-3">
                            <AvatarGenerator originId={ch.origin_id} authHeaders={authHeaders} />
                          </div>
                          <InventoryPanel originId={ch.origin_id} authHeaders={authHeaders} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Origin Grid */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Star size={10} /> {existingCharacters.length > 0 ? 'Begin New Adventure' : 'Select Your Starseed Origin'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(origins || []).map((origin, i) => {
            const isSelected = selected?.id === origin.id;
            return (
              <motion.button key={origin.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => setSelected(isSelected ? null : origin)}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] border"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${origin.color}15, rgba(0,0,0,0.4))`
                    : 'rgba(255,255,255,0.02)',
                  borderColor: isSelected ? `${origin.color}40` : 'rgba(255,255,255,0.05)',
                  boxShadow: isSelected ? `0 0 40px ${origin.color}10, inset 0 0 30px ${origin.color}05` : 'none',
                }}
                data-testid={`origin-${origin.id}`}>
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${origin.color}, transparent 70%)` }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${origin.color}12`, border: `1px solid ${origin.color}20` }}>
                      <Star size={20} style={{ color: origin.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: origin.color }}>{origin.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{origin.star_system}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{origin.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(origin.traits || []).map(t => (
                      <span key={t} className="text-[8px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${origin.color}10`, color: origin.color, border: `1px solid ${origin.color}15` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Flame size={9} style={{ color: origin.color, opacity: 0.5 }} />
                    <span className="text-[8px]" style={{ color: `${origin.color}80` }}>Element: {origin.element}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Origin Detail + Start */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden">
            <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6 border"
              style={{ background: `linear-gradient(135deg, ${selected.color}08, rgba(0,0,0,0.3))`, borderColor: `${selected.color}20` }}
              data-testid="origin-detail-panel">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ background: `radial-gradient(ellipse at 20% 30%, ${selected.color}, transparent 60%)` }} />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: selected.color }}>
                  {selected.name} Lore
                </p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: '1.8' }}>
                  {selected.lore}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="Name your character..." maxLength={24}
                    value={charName} onChange={e => setCharName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm transition-all focus:ring-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${selected.color}20`,
                      color: 'var(--text-primary)', outline: 'none',
                      focusRingColor: selected.color,
                    }}
                    data-testid="character-name-input" />
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => !loading && onSelect(selected.id, charName || 'Traveler')}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${selected.gradient[0]}, ${selected.gradient[1]})`,
                      color: '#fff',
                      boxShadow: `0 4px 20px ${selected.color}30`,
                      opacity: loading ? 0.6 : 1,
                    }}
                    data-testid="start-adventure-btn">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {loading ? 'Channeling...' : 'Begin Adventure'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
