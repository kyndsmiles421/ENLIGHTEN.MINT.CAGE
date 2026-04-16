/**
 * InteractiveModule.js — Universal interactive learning module
 * 
 * ZERO-STACK. No overlays. No modals. Content IS the interface.
 * Each item is a visual tile with its own color identity.
 * Tap → expand in-place → deeper info → DeepDive AI → earn XP.
 * Gamification: XP per interaction, progress tracking, mastery levels.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, BookOpen, Star, Headphones, Flame } from 'lucide-react';
import DeepDive from './DeepDive';
import NarrationPlayer from './NarrationPlayer';
import { ProximityItem } from './SpatialRoom';
import SpatialRecorderUI, { useSpatialRecorder } from './SpatialRecorder';
import OmniBridge from './OmniBridge';

// Visual element icon based on item properties
function ItemVisual({ color, element, size = 56 }) {
  const ELEMENT_SHAPES = {
    Fire: '🔥', Water: '💧', Air: '🌬', Earth: '🌿', Metal: '⚡',
    All: '✦', Wood: '🌳', Ether: '◯',
  };
  return (
    <div className="rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
        border: `2px solid ${color}40`,
        fontSize: size * 0.4,
      }}>
      <span>{ELEMENT_SHAPES[element] || '✦'}</span>
    </div>
  );
}

// XP reward inline notification
function XPReward({ xp, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="inline-flex items-center gap-1 ml-2 text-[10px] font-bold"
          style={{ color: '#22C55E' }}>
          <Sparkles size={10} /> +{xp} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// Single interactive item — tap to expand, explore deeper, earn XP
function InteractiveItem({ item, color, category, index }) {
  const [expanded, setExpanded] = useState(false);
  const [xpVisible, setXpVisible] = useState(false);

  const handleExpand = () => {
    if (!expanded) {
      setXpVisible(true);
      setTimeout(() => setXpVisible(false), 2000);
      if (typeof window.__workAccrue === 'function') window.__workAccrue(category, 5);
    }
    setExpanded(!expanded);
  };

  const itemColor = item.color || color;
  const title = item.name || item.title;
  const subtitle = item.latin || item.aka || item.tradition || item.energy_type || '';
  const description = item.description || item.core_principle || '';
  const tags = item.properties || item.benefits || item.uses || [];
  const element = item.element || item.chakra || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-testid={`item-${item.id || index}`}
    >
      {/* Tap target */}
      <button onClick={handleExpand} className="w-full text-left py-4 flex items-start gap-4 active:opacity-80"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        data-testid={`item-btn-${item.id || index}`}>
        <ItemVisual color={itemColor} element={element} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold" style={{ color: '#fff' }}>{title}</p>
            <XPReward xp={5} visible={xpVisible} />
          </div>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: itemColor }}>{subtitle}</p>}
          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {description.substring(0, 100)}{description.length > 100 ? '...' : ''}
          </p>
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: `${itemColor}15`, color: itemColor, border: `1px solid ${itemColor}25` }}>
                  {tag}
                </span>
              ))}
              {tags.length > 4 && <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>+{tags.length - 4} more</span>}
            </div>
          )}
        </div>
        <ChevronDown size={16} style={{
          color: expanded ? itemColor : 'rgba(255,255,255,0.2)',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.25s',
          marginTop: 4, flexShrink: 0,
        }} />
      </button>

      {/* In-place expansion — full detail + DeepDive + narration */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="py-4 pl-[72px]">
              {/* Full description */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {description}
              </p>

              {/* All tags */}
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

              {/* Extra fields — ingredients, systems, preparations, etc. */}
              {item.ingredients && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#FCD34D' }}>Ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.ingredients.map((ing, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(252,211,77,0.1)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)' }}>
                        {ing}
                      </span>
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
                        style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}>
                        {sys}
                      </span>
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
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#C084FC' }}>Spiritual</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.spiritual}</p>
                </div>
              )}

              {item.healing && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#22C55E' }}>Healing</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.healing}</p>
                </div>
              )}

              {item.emotional && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#F472B6' }}>Emotional</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.emotional}</p>
                </div>
              )}

              {item.caution && (
                <div className="mb-4 py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: '#EF4444' }}>Caution</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.caution}</p>
                </div>
              )}

              {/* Action bar — Listen + Explore Deeper */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <NarrationPlayer
                  text={`${title}. ${description}. ${item.spiritual || ''} ${item.healing || ''}`}
                  label="Listen"
                  color={itemColor}
                  context={category}
                />
                <DeepDive
                  topic={title}
                  category={category}
                  context={subtitle}
                  color={itemColor}
                  label={`Explore ${title} deeper`}
                />
                {/* OmniBridge — Cross-cultural intelligence for this item */}
                <OmniBridge module={category} topic={title} context={subtitle} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Mastery progress bar for the module
function ModuleMastery({ explored, total, color }) {
  const pct = total > 0 ? Math.round((explored / total) * 100) : 0;
  const level = pct >= 80 ? 'Master' : pct >= 50 ? 'Adept' : pct >= 20 ? 'Student' : 'Novice';
  return (
    <div className="flex items-center gap-3 mb-6" data-testid="module-mastery">
      <Star size={14} style={{ color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold" style={{ color }}>{level}</span>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{explored}/{total} explored</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full" style={{ background: color }} />
        </div>
      </div>
    </div>
  );
}

// Filter tabs
function FilterTabs({ tabs, active, onSelect, color }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
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
    <div className="relative mb-6">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="w-full px-4 py-3 rounded-xl text-sm"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid rgba(255,255,255,0.08)`,
          color: '#fff',
          outline: 'none',
        }}
        data-testid="module-search"
      />
    </div>
  );
}

/**
 * InteractiveModule — The complete module wrapper
 * 
 * Usage:
 *   <InteractiveModule
 *     title="Sacred Herbology"
 *     subtitle="Ancient plant wisdom"
 *     icon={Leaf}
 *     color="#84CC16"
 *     category="herbology"
 *     items={herbs}
 *     filters={[{key:'all',label:'All'},{key:'adaptogen',label:'Adaptogens'}]}
 *     filterFn={(item, filter) => filter === 'all' || item.properties?.includes(filter)}
 *   />
 */
export default function InteractiveModule({
  title, subtitle, icon: Icon, color = '#A78BFA',
  category = 'knowledge', items = [],
  filters, filterFn, searchFn,
  children, headerExtra,
}) {
  const [filter, setFilter] = useState(filters?.[0]?.key || 'all');
  const [search, setSearch] = useState('');
  const [exploredItems, setExploredItems] = useState(new Set());
  const recorder = useSpatialRecorder();

  let filtered = items;
  if (filterFn && filter !== 'all') {
    filtered = items.filter(item => filterFn(item, filter));
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
    <div className="min-h-screen pt-20 pb-24 px-5 max-w-3xl mx-auto" data-testid={`${category}-page`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon size={14} style={{ color }} />}
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color }}>{subtitle || category}</p>
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
          {title}
        </h1>

        {/* Mastery progress */}
        <ModuleMastery explored={exploredItems.size} total={items.length} color={color} />

        {/* Avatar Journey Recorder */}
        <SpatialRecorderUI recorder={recorder} />

        {headerExtra}

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} color={color} />

        {/* Filters */}
        {filters && filters.length > 1 && (
          <FilterTabs tabs={filters} active={filter} onSelect={setFilter} color={color} />
        )}

        {/* Items — proximity-revealed in Z-space */}
        <div>
          {filtered.map((item, i) => (
            <ProximityItem key={item.id || i} index={i} totalItems={filtered.length}>
              <InteractiveItem item={item} color={color} category={category} index={i} />
            </ProximityItem>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              No results found
            </p>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
}

export { InteractiveItem, ModuleMastery, FilterTabs, SearchBar, ItemVisual };
