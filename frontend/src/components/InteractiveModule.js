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
import {
  ChevronDown, Sparkles, BookOpen, Star, Headphones,
  Flame, Eye, Lock, Zap, Award, HelpCircle, Check, X as XIcon,
  Map, Grid3X3, Trophy
} from 'lucide-react';
import DeepDive from './DeepDive';
import NarrationPlayer from './NarrationPlayer';
import { ProximityItem } from './SpatialRoom';
import SpatialRecorderUI, { useSpatialRecorder } from './SpatialRecorder';
import OmniBridge from './OmniBridge';
import TraditionLens from './TraditionLens';

const PHI = 1.618033988749895;

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

      {/* Element icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${itemColor}25, ${itemColor}08)`,
          border: `1px solid ${itemColor}30`,
          fontSize: 20,
        }}>
        {ELEMENT_SHAPES[element] || '✦'}
      </div>

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
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${itemColor}15`, border: `1px solid ${itemColor}30` }}>
            {item.element === 'Fire' ? '🔥' : item.element === 'Water' ? '💧' : item.chakra ? '💎' : '✦'}
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>{title}</h3>
            {subtitle && <p className="text-xs" style={{ color: itemColor }}>{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <XIcon size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
        {description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
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

      {/* Extra fields */}
      {item.ingredients && (
        <div className="mb-4">
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
        <div className="mb-4">
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
        <div className="mb-4">
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
      {item.caution && (
        <div className="mb-3 py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: '#EF4444' }}>Caution</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.caution}</p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NarrationPlayer
          text={`${title}. ${description}. ${item.spiritual || ''} ${item.healing || ''}`}
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
  const recorder = useSpatialRecorder();

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
    <div className="min-h-screen pt-20 pb-24 px-5 max-w-4xl mx-auto" data-testid={`${category}-page`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon size={14} style={{ color }} />}
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color }}>{subtitle || category}</p>
        </div>
        <h1 className="text-3xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
          {title}
        </h1>

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
          <SpatialRecorderUI recorder={recorder} />
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

        {children}
      </motion.div>
    </div>
  );
}

export { ModuleMastery, FilterTabs, SearchBar };
