/**
 * InteractiveModule.js — V56.0 DISCOVERY EXPLORATION ENGINE
 * 
 * Every module is now a gamified exploration. Items start as fog-shrouded
 * nodes on a visual grid. Tap to discover, revealing the knowledge within.
 * Each discovery awards XP, fills a mastery meter, and progresses quests.
 * 
 * Modes:
 *   - DISCOVER: Items are foggy until tapped. First tap = discovery XP.
 *   - STUDY: Expanded view with full details, narration, AI deep-dive.
 *   - CHALLENGE: Random quiz from discovered items. Correct = bonus XP.
 *   
 * 8 pages use this: Crystals, Herbology, Aromatherapy, Elixirs,
 *                    Mudras, Nourishment, Reiki, Acupressure
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, Sparkles, BookOpen, Star, Headphones,
  Flame, Eye, Lock, Zap, Award, HelpCircle, Check, X as XIcon,
  Map, Grid3X3, Trophy
} from 'lucide-react';
import DeepDive from './DeepDive';
import NarrationPlayer from './NarrationPlayer';
import { ProximityItem } from './SpatialRoom';
import OmniBridge from './OmniBridge';
import TraditionLens from './TraditionLens';

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════
// IMMERSIVE MODULE SCENES — Each module is a visual world
// ═══════════════════════════════════════════════════════════════
const MODULE_SCENES = {
  crystals: {
    image: 'https://images.unsplash.com/photo-1673879279182-76be6b52075c?w=800&q=60',
    ambience: 'You descend into the crystalline depths. Amethyst and quartz formations pulse with ancient energy...',
    gradient: 'linear-gradient(180deg, rgba(13,13,26,0.15) 0%, rgba(13,13,26,0.85) 50%, rgba(13,13,26,0.98) 70%)',
  },
  herbology: {
    image: 'https://images.unsplash.com/photo-1547318114-eff5ea85ede9?w=800&q=60',
    ambience: 'The apothecary shelves are lined with dried roots, leaves and flower essences...',
    gradient: 'linear-gradient(180deg, rgba(15,26,13,0.15) 0%, rgba(15,26,13,0.85) 50%, rgba(15,26,13,0.98) 70%)',
  },
  aromatherapy: {
    image: 'https://images.unsplash.com/photo-1560521166-99f8bed834f5?w=800&q=60',
    ambience: 'Amber glass bottles line the essence temple. Lavender, frankincense, and myrrh fill the air...',
    gradient: 'linear-gradient(180deg, rgba(26,13,26,0.15) 0%, rgba(26,13,26,0.85) 50%, rgba(26,13,26,0.98) 70%)',
  },
  elixirs: {
    image: 'https://images.unsplash.com/photo-1508014861016-f37cdf89e94d?w=800&q=60',
    ambience: 'The alchemy lab glows with candlelight. Teapots simmer with golden moon milk and fire cider...',
    gradient: 'linear-gradient(180deg, rgba(26,22,13,0.15) 0%, rgba(26,22,13,0.85) 50%, rgba(26,22,13,0.98) 70%)',
  },
  mudras: {
    image: 'https://images.unsplash.com/photo-1556760678-794ee0436167?w=800&q=60',
    ambience: 'Stillness fills the mudra studio. Each hand gesture unlocks energy gates within...',
    gradient: 'linear-gradient(180deg, rgba(24,21,13,0.15) 0%, rgba(24,21,13,0.85) 50%, rgba(24,21,13,0.98) 70%)',
  },
  nourishment: {
    image: 'https://images.unsplash.com/photo-1771830938706-dda943a87246?w=800&q=60',
    ambience: 'The living kitchen is stocked with sacred foods. Every meal is medicine, every bite an offering...',
    gradient: 'linear-gradient(180deg, rgba(13,26,15,0.15) 0%, rgba(13,26,15,0.85) 50%, rgba(13,26,15,0.98) 70%)',
  },
  reiki: {
    image: 'https://images.unsplash.com/photo-1719674572258-565976e1fe01?w=800&q=60',
    ambience: 'Warm light gathers between open palms. The universal life force awaits your intention...',
    gradient: 'linear-gradient(180deg, rgba(24,13,21,0.15) 0%, rgba(24,13,21,0.85) 50%, rgba(24,13,21,0.98) 70%)',
  },
  acupressure: {
    image: 'https://images.unsplash.com/photo-1739971714008-ce6d363cb90d?w=800&q=60',
    ambience: 'The meridian map unfolds before you. Invisible rivers of energy course through every point...',
    gradient: 'linear-gradient(180deg, rgba(13,21,24,0.15) 0%, rgba(13,21,24,0.85) 50%, rgba(13,21,24,0.98) 70%)',
  },
};

// Cross-module connections — "The Sage Recommends"
const CROSS_LINKS = {
  crystals: [
    { text: 'Amethyst pairs with lavender oil for deep relaxation', path: '/aromatherapy', module: 'Aromatherapy' },
    { text: 'Clear Quartz amplifies meditation intention', path: '/meditation', module: 'Meditation' },
    { text: 'Rose Quartz enhances heart chakra yoga flows', path: '/yoga', module: 'Yoga' },
  ],
  herbology: [
    { text: 'Chamomile tea synergizes with breathing exercises', path: '/breathing', module: 'Breathwork' },
    { text: 'Ashwagandha supports the Warrior yoga sequence', path: '/yoga', module: 'Yoga' },
    { text: 'Combine herbs with crystal grids for amplified healing', path: '/crystals', module: 'Crystals' },
  ],
  aromatherapy: [
    { text: 'Frankincense deepens oracle readings', path: '/oracle', module: 'Oracle' },
    { text: 'Peppermint oil awakens focus for mudra practice', path: '/mudras', module: 'Mudras' },
    { text: 'Lavender creates the ideal meditation atmosphere', path: '/meditation', module: 'Meditation' },
  ],
  elixirs: [
    { text: 'Golden Milk before meditation enhances stillness', path: '/meditation', module: 'Meditation' },
    { text: 'Fire Cider activates the solar plexus for breathwork', path: '/breathing', module: 'Breathwork' },
    { text: 'Moon Milk pairs with dream journaling for lucid work', path: '/dreams', module: 'Dreams' },
  ],
  mudras: [
    { text: 'Gyan Mudra deepens pranayama breathing', path: '/breathing', module: 'Breathwork' },
    { text: 'Combine mudras with mantra chanting', path: '/mantras', module: 'Mantras' },
    { text: 'Prithvi Mudra grounds crystal energy healing', path: '/crystals', module: 'Crystals' },
  ],
  nourishment: [
    { text: 'Turmeric activates with the Fire element yoga flows', path: '/yoga', module: 'Yoga' },
    { text: 'Fasting enhances meditation depth', path: '/meditation', module: 'Meditation' },
    { text: 'Sacred foods pair with Ayurvedic herbology', path: '/herbology', module: 'Herbology' },
  ],
  reiki: {
    0: { text: 'Reiki Hand positions enhance acupressure work', path: '/acupressure', module: 'Acupressure' },
    1: { text: 'Crystal grids amplify Reiki energy channels', path: '/crystals', module: 'Crystals' },
    2: { text: 'Combine Reiki with guided meditation for deep healing', path: '/meditation', module: 'Meditation' },
  },
  acupressure: [
    { text: 'Meridian points align with yoga asanas', path: '/yoga', module: 'Yoga' },
    { text: 'Acupressure enhances herb absorption pathways', path: '/herbology', module: 'Herbology' },
    { text: 'Combine with Reiki for full energy body work', path: '/reiki', module: 'Reiki' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// DISCOVERY NODE — Each item is a discoverable node on the map
// ═══════════════════════════════════════════════════════════════
function DiscoveryNode({ item, color, category, index, discovered, onDiscover, onStudy }) {
  const [hovering, setHovering] = useState(false);
  const [justDiscovered, setJustDiscovered] = useState(false);
  const itemColor = item.color || color;
  const title = item.name || item.title;
  const element = item.element || item.chakra || '';

  const ELEMENT_SHAPES = {
    Fire: '🔥', Water: '💧', Air: '🌬', Earth: '🌿', Metal: '⚡',
    All: '✦', Wood: '🌳', Ether: '◯',
  };

  const handleTap = () => {
    if (!discovered) {
      setJustDiscovered(true);
      onDiscover(item, index);
      if (typeof window.__workAccrue === 'function') window.__workAccrue(category, 8);
      setTimeout(() => setJustDiscovered(false), 2000);
    } else {
      onStudy(item, index);
    }
  };

  return (
    <motion.button
      onClick={handleTap}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="relative text-center flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300"
      style={{
        background: discovered
          ? `${itemColor}08`
          : hovering ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
        border: `1px solid ${discovered ? `${itemColor}25` : 'rgba(255,255,255,0.04)'}`,
        boxShadow: justDiscovered
          ? `0 0 30px ${itemColor}40, inset 0 0 20px ${itemColor}10`
          : discovered && hovering
          ? `0 0 20px ${itemColor}20`
          : 'none',
        cursor: 'pointer',
        minHeight: 100,
      }}
      data-testid={`node-${item.id || index}`}
    >
      {/* Fog overlay for undiscovered */}
      {!discovered && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(8,8,14,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 2,
          }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Eye size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </motion.div>
        </div>
      )}

      {/* Discovery flash */}
      <AnimatePresence>
        {justDiscovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${itemColor}40, transparent 70%)`,
              zIndex: 5,
            }}
          />
        )}
      </AnimatePresence>

      {/* Element icon OR item image if provided (mudras, crystals, etc.) */}
      {item.image_url && discovered ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${itemColor}25, ${itemColor}08)`,
            border: `1px solid ${itemColor}30`,
            backgroundImage: `url(${item.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
      ) : (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${itemColor}25, ${itemColor}08)`,
            border: `1px solid ${itemColor}30`,
            fontSize: 20,
          }}>
          {ELEMENT_SHAPES[element] || '✦'}
        </div>
      )}

      {/* Title */}
      <p className="text-xs font-medium leading-tight" style={{
        color: discovered ? itemColor : 'rgba(255,255,255,0.3)',
      }}>
        {discovered ? title : '???'}
      </p>

      {/* Discovery XP popup */}
      <AnimatePresence>
        {justDiscovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full pointer-events-none"
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              zIndex: 10,
            }}
          >
            <Sparkles size={10} style={{ color: '#22C55E' }} />
            <span className="text-[10px] font-bold" style={{ color: '#22C55E' }}>+8 XP</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDY PANEL — Expanded detail view when studying a discovered item
// ═══════════════════════════════════════════════════════════════
function StudyPanel({ item, color, category, onClose }) {
  const itemColor = item.color || color;
  const title = item.name || item.title;
  const subtitle = item.latin || item.aka || item.tradition || item.energy_type || '';
  const description = item.description || item.core_principle || '';
  const tags = item.properties || item.benefits || item.uses || [];

  // V68.5 Thin-Client: Action-First priority.
  // Lore (description + tags + lore-blocks) is collapsed by default.
  // Global flag `global_lore_default` can force it open/closed across the app.
  const [showLore, setShowLore] = useState(() => {
    try {
      const pref = localStorage.getItem('global_lore_default');
      return pref === 'open';
    } catch { return false; }
  });

  // Action data = what the user DOES (render first, always)
  const hasActionData = Boolean(item.hand_position || item.practice || item.duration || item.video_url);
  // Lore data = contextual text/tags (render second, behind toggle)
  const hasLore = Boolean(
    description || tags.length > 0 || item.ingredients || item.systems ||
    item.preparations || item.spiritual || item.healing
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="p-5 rounded-2xl mb-6"
      style={{
        background: `linear-gradient(135deg, ${itemColor}08, rgba(10,10,18,0.9))`,
        border: `1px solid ${itemColor}20`,
        boxShadow: `0 0 30px ${itemColor}10`,
      }}
      data-testid="study-panel"
    >
      {/* Header — minimal, Action-First */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <div
              className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
              style={{
                background: `${itemColor}12`,
                border: `1px solid ${itemColor}35`,
                backgroundImage: `url(${item.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              data-testid="item-image"
              aria-label={`${title} visual`}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${itemColor}15`, border: `1px solid ${itemColor}30` }}>
              {item.element === 'Fire' ? '🔥' : item.element === 'Water' ? '💧' : item.chakra ? '💎' : '✦'}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>{title}</h3>
            {subtitle && <p className="text-xs" style={{ color: itemColor }}>{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} data-testid="study-close">
          <XIcon size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* ═══ ACTION STREAM (rendered first, always visible) ═══ */}
      {hasActionData && (
        <div className="mb-3" data-testid="action-stream">
          {item.hand_position && (
            <div className="mb-3 px-3 py-2.5 rounded-lg" style={{ background: `${itemColor}08`, border: `1px solid ${itemColor}20` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: itemColor }}>Hand Position</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.hand_position}</p>
            </div>
          )}
          {item.practice && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: itemColor }}>How to Practice</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.practice}</p>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {item.duration && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: `${itemColor}99` }}>Duration</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.duration}</span>
              </div>
            )}
            {item.video_url && (
              <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95"
                style={{ background: `${itemColor}15`, border: `1px solid ${itemColor}35`, color: itemColor }}
                data-testid="item-video-link">
                ▶ {item.video_title || 'Demo video'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ═══ LORE TOGGLE (default collapsed — kilobyte budget) ═══ */}
      {hasLore && (
        <button
          type="button"
          onClick={() => setShowLore(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
          style={{
            background: showLore ? `${itemColor}10` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showLore ? `${itemColor}25` : 'rgba(255,255,255,0.05)'}`,
            color: showLore ? itemColor : 'rgba(255,255,255,0.45)',
          }}
          data-testid="study-lore-toggle"
        >
          <span>{showLore ? 'Hide Lore' : 'Show Lore & Context'}</span>
          <span className="text-[9px] opacity-60">{showLore ? '−' : '+'}</span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {showLore && hasLore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
            data-testid="study-lore-panel"
          >
            <div className="pt-3">
              {description && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  {description}
                </p>
              )}
              {tags.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: itemColor }}>
                    {item.properties ? 'Properties' : item.benefits ? 'Benefits' : 'Uses'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: `${itemColor}12`, color: itemColor, border: `1px solid ${itemColor}20` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.ingredients && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#FCD34D' }}>Ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.ingredients.map((ing, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(252,211,77,0.1)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)' }}>{ing}</span>
                    ))}
                  </div>
                </div>
              )}
              {item.systems && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#2DD4BF' }}>Body Systems</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.systems.map((sys, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}>{sys}</span>
                    ))}
                  </div>
                </div>
              )}
              {item.preparations && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#A78BFA' }}>How to Use</p>
                  {item.preparations.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#A78BFA' }} />
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{p}</p>
                    </div>
                  ))}
                </div>
              )}
              {item.spiritual && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#C084FC' }}>Spiritual</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.spiritual}</p>
                </div>
              )}
              {item.healing && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#22C55E' }}>Healing</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.healing}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caution always visible — safety trumps lore toggle */}
      {item.caution && (
        <div className="mt-3 py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: '#EF4444' }}>Caution</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.caution}</p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NarrationPlayer
          text={`${title}. ${item.hand_position || ''} ${item.practice || description}`}
          label="Listen" color={itemColor} context={category}
        />
        <DeepDive topic={title} category={category} context={subtitle} color={itemColor} label={`Explore deeper`} />
        <OmniBridge module={category} topic={title} context={subtitle} />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE CHALLENGE — Quiz from discovered items
// ═══════════════════════════════════════════════════════════════
function KnowledgeChallenge({ items, discoveredSet, color, category, onComplete }) {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // 'correct' | 'wrong'
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);

  const discovered = items.filter((_, i) => discoveredSet.has(i));

  const generateQuestion = useCallback(() => {
    if (discovered.length < 3) return;
    const target = discovered[Math.floor(Math.random() * discovered.length)];
    const questionTypes = [];

    if (target.properties?.length) questionTypes.push('properties');
    if (target.chakra) questionTypes.push('chakra');
    if (target.element) questionTypes.push('element');
    if (target.systems?.length) questionTypes.push('systems');
    questionTypes.push('name');

    const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let q = '', answer = '', wrongAnswers = [];

    if (qType === 'name') {
      const desc = (target.description || '').substring(0, 120);
      q = `Which item matches: "${desc}..."?`;
      answer = target.name || target.title;
      wrongAnswers = discovered
        .filter(d => (d.name || d.title) !== answer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(d => d.name || d.title);
    } else if (qType === 'chakra') {
      q = `What chakra is "${target.name}" associated with?`;
      answer = target.chakra;
      const allChakras = [...new Set(items.map(i => i.chakra).filter(Boolean))];
      wrongAnswers = allChakras.filter(c => c !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
    } else if (qType === 'element') {
      q = `What element governs "${target.name}"?`;
      answer = target.element;
      const allElements = [...new Set(items.map(i => i.element).filter(Boolean))];
      wrongAnswers = allElements.filter(e => e !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
      const prop = target.properties?.[0] || target.systems?.[0] || 'healing';
      q = `"${target.name}" is known for which property?`;
      answer = prop;
      const allProps = [...new Set(items.flatMap(i => i.properties || i.systems || []))];
      wrongAnswers = allProps.filter(p => p !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
    }

    if (wrongAnswers.length < 2) wrongAnswers = ['Unknown', 'None', 'Other'].slice(0, 3 - wrongAnswers.length).concat(wrongAnswers);
    const allOptions = [answer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);

    setQuestion({ text: q, answer, target });
    setOptions(allOptions);
    setSelected(null);
    setResult(null);
  }, [discovered, items]);

  useEffect(() => { generateQuestion(); }, [round, generateQuestion]);

  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === question?.answer) {
      setResult('correct');
      setStreak(s => s + 1);
      if (typeof window.__workAccrue === 'function') window.__workAccrue(category, 15);
    } else {
      setResult('wrong');
      setStreak(0);
    }
  };

  if (discovered.length < 3) {
    return (
      <div className="text-center py-8">
        <Lock size={24} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 8px' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Discover at least 3 items to unlock challenges
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      data-testid="knowledge-challenge">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} style={{ color }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>Knowledge Challenge</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Flame size={10} style={{ color: '#FBBF24' }} />
            <span className="text-[10px] font-bold" style={{ color: '#FBBF24' }}>{streak} streak</span>
          </div>
        )}
      </div>

      {question && (
        <>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>{question.text}</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {options.map((opt, i) => {
              const isCorrect = result && opt === question.answer;
              const isWrong = result === 'wrong' && opt === selected;
              return (
                <button key={i} onClick={() => handleAnswer(opt)}
                  className="p-3 rounded-xl text-xs text-left transition-all"
                  style={{
                    background: isCorrect ? 'rgba(34,197,94,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : selected ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: isCorrect ? '#22C55E' : isWrong ? '#EF4444' : 'rgba(255,255,255,0.7)',
                    boxShadow: isCorrect ? '0 0 15px rgba(34,197,94,0.2)' : 'none',
                  }}
                  data-testid={`challenge-opt-${i}`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect && <Check size={12} />}
                    {isWrong && <XIcon size={12} />}
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {result && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between">
              <p className="text-xs" style={{ color: result === 'correct' ? '#22C55E' : '#EF4444' }}>
                {result === 'correct' ? 'Correct! +15 XP' : `The answer was: ${question.answer}`}
              </p>
              <button onClick={() => setRound(r => r + 1)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}
                data-testid="challenge-next">
                Next Challenge
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MASTERY PROGRESS — Visual mastery meter
// ═══════════════════════════════════════════════════════════════
function ModuleMastery({ explored, total, color }) {
  const pct = total > 0 ? Math.round((explored / total) * 100) : 0;
  const level = pct >= 80 ? 'Master' : pct >= 50 ? 'Adept' : pct >= 20 ? 'Student' : 'Novice';
  const levelColor = pct >= 80 ? '#FBBF24' : pct >= 50 ? '#A855F7' : pct >= 20 ? '#3B82F6' : '#9CA3AF';
  return (
    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" data-testid="module-mastery"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${levelColor}15`, border: `1px solid ${levelColor}25` }}>
        <Trophy size={16} style={{ color: levelColor }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color: levelColor }}>{level}</span>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{explored}/{total} discovered</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}, ${levelColor})` }} />
        </div>
      </div>
    </div>
  );
}

// Filter tabs
function FilterTabs({ tabs, active, onSelect, color }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onSelect(tab.key)}
          className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            background: active === tab.key ? `${color}20` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active === tab.key ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
            color: active === tab.key ? color : 'rgba(255,255,255,0.5)',
          }}
          data-testid={`filter-${tab.key}`}>
          {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-60">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}

// Search
function SearchBar({ value, onChange, placeholder, color }) {
  return (
    <div className="relative mb-4">
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="w-full px-4 py-3 rounded-xl text-sm"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#fff', outline: 'none',
        }}
        data-testid="module-search"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SAGE BOARD — Cross-module suggestions, inline message board
// Shows connections to other modules based on what you've explored
// ═══════════════════════════════════════════════════════════════
function SageBoard({ category, color, discoveredCount }) {
  const navigate = useNavigate();
  const links = Array.isArray(CROSS_LINKS[category]) ? CROSS_LINKS[category] : Object.values(CROSS_LINKS[category] || {});
  // Only show after user has discovered at least 1 item
  if (discoveredCount < 1 || links.length === 0) return null;
  // Rotate which suggestion shows based on discovered count
  const visibleLinks = links.slice(0, Math.min(discoveredCount, links.length));

  return (
    <div className="mt-8 mb-4" data-testid="sage-board">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={12} style={{ color: '#FBBF24' }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#FBBF24' }}>
          The Sage Recommends
        </span>
      </div>
      <div className="space-y-2">
        {visibleLinks.map((link, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(link.path)}
            className="w-full text-left p-3 rounded-xl flex items-center gap-3 group"
            style={{
              background: 'rgba(251,191,36,0.03)',
              border: '1px solid rgba(251,191,36,0.08)',
            }}
            data-testid={`sage-link-${i}`}
          >
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: `${color}40` }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {link.text}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: `${color}60` }}>
                Continue in {link.module}
              </p>
            </div>
            <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }}
              className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN: InteractiveModule — Discovery Exploration Engine
// ═══════════════════════════════════════════════════════════════
export default function InteractiveModule({
  title, subtitle, icon: Icon, color = '#A78BFA',
  category = 'knowledge', items = [],
  filters, filterFn, searchFn,
  children, headerExtra,
}) {
  const [mode, setMode] = useState('discover'); // discover | challenge
  const [filter, setFilter] = useState(filters?.[0]?.key || 'all');
  const [search, setSearch] = useState('');
  const [discoveredSet, setDiscoveredSet] = useState(new Set());
  const [studyItem, setStudyItem] = useState(null);

  // Load discovered state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`discovered_${category}`);
    if (saved) {
      try { setDiscoveredSet(new Set(JSON.parse(saved))); } catch {}
    }
  }, [category]);

  const handleDiscover = useCallback((item, index) => {
    setDiscoveredSet(prev => {
      const next = new Set(prev);
      next.add(index);
      localStorage.setItem(`discovered_${category}`, JSON.stringify([...next]));
      return next;
    });
  }, [category]);

  const handleStudy = useCallback((item) => {
    setStudyItem(item);
  }, []);

  // Shuffle items on each mount so order varies per visit
  // Re-shuffle when items change (e.g., async load)
  const [shuffledItems, setShuffledItems] = useState([]);
  
  useEffect(() => {
    if (items.length > 0) {
      const arr = [...items];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledItems(arr);
    }
  }, [items]);

  let filtered = shuffledItems;
  if (filterFn && filter !== 'all') {
    filtered = shuffledItems.filter(item => filterFn(item, filter));
  }
  if (search.trim() && searchFn) {
    filtered = filtered.filter(item => searchFn(item, search));
  } else if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(item =>
      (item.name || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-4xl mx-auto" data-testid={`${category}-page`}>
      {/* V56.2 — IMMERSIVE SCENE HEADER */}
      {(() => {
        const scene = MODULE_SCENES[category];
        if (!scene) return null;
        return (
          <div className="relative -mx-0 mb-6 overflow-hidden" style={{ minHeight: 200 }}>
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
              style={{ backgroundImage: `url(${scene.image})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }}
            />
            <div className="absolute inset-0" style={{ background: scene.gradient }} />
            <div className="relative px-5 pt-16 pb-5" style={{ zIndex: 2 }}>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-[10px] italic mb-4" style={{ color: `${color}70` }}>
                {scene.ambience}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-1">
                {Icon && <Icon size={14} style={{ color }} />}
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color }}>{subtitle || category}</p>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
                {title}
              </motion.h1>
            </div>
          </div>
        );
      })()}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5">
        {/* Header fallback when no scene */}
        {!MODULE_SCENES[category] && (
          <>
            <div className="flex items-center gap-2 mb-1 pt-20">
              {Icon && <Icon size={14} style={{ color }} />}
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color }}>{subtitle || category}</p>
            </div>
            <h1 className="text-3xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
              {title}
            </h1>
          </>
        )}

        {/* Mastery */}
        <ModuleMastery explored={discoveredSet.size} total={items.length} color={color} />

        {/* Mode tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setMode('discover')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: mode === 'discover' ? `${color}15` : 'transparent',
              border: `1px solid ${mode === 'discover' ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
              color: mode === 'discover' ? color : 'rgba(255,255,255,0.4)',
            }} data-testid="mode-discover">
            <Grid3X3 size={12} /> Explore
          </button>
          <button onClick={() => setMode('challenge')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: mode === 'challenge' ? `${color}15` : 'transparent',
              border: `1px solid ${mode === 'challenge' ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
              color: mode === 'challenge' ? color : 'rgba(255,255,255,0.4)',
            }} data-testid="mode-challenge">
            <Zap size={12} /> Challenge
          </button>
          <div className="flex-1" />
        </div>

        {/* Cultural Lens */}
        <div className="mb-3">
          <TraditionLens module={category || title.toLowerCase()} topic={title} />
        </div>

        {headerExtra}

        {/* Study panel — when tapping a discovered item */}
        <AnimatePresence>
          {studyItem && (
            <StudyPanel item={studyItem} color={color} category={category} onClose={() => setStudyItem(null)} />
          )}
        </AnimatePresence>

        {mode === 'discover' && (
          <>
            <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} color={color} />
            {filters && filters.length > 1 && (
              <FilterTabs tabs={filters} active={filter} onSelect={setFilter} color={color} />
            )}

            {/* Discovery Grid — items as nodes to explore */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filtered.map((item, i) => {
                const originalIndex = items.indexOf(item);
                return (
                  <ProximityItem key={item.id || i} index={i} totalItems={filtered.length}>
                    <DiscoveryNode
                      item={item}
                      color={color}
                      category={category}
                      index={originalIndex}
                      discovered={discoveredSet.has(originalIndex)}
                      onDiscover={handleDiscover}
                      onStudy={handleStudy}
                    />
                  </ProximityItem>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No results found</p>
            )}
          </>
        )}

        {mode === 'challenge' && (
          <KnowledgeChallenge items={items} discoveredSet={discoveredSet} color={color} category={category} />
        )}

        {/* V56.2 — SAGE BOARD: Cross-module suggestions */}
        <SageBoard category={category} color={color} discoveredCount={discoveredSet.size} />

        {children}
      </motion.div>
    </div>
  );
}

export { ModuleMastery, FilterTabs, SearchBar };
