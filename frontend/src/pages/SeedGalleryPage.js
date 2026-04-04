/**
 * SeedGalleryPage.js — The Lattice Exchange
 * 
 * THE CRYSTALLINE VAULT
 * 
 * Visual gallery of minted Crystalline Seeds displaying:
 * - Constellation visualizations of 36-bit addresses
 * - Rarity tiers with distinct visual treatments
 * - Filtering by depth, language, rarity
 * - Stats overview of the exchange
 * 
 * "Selling Coordinates to the Truth"
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Gem, 
  ArrowLeft, 
  Filter, 
  TrendingUp, 
  Layers, 
  Globe, 
  Star,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ═══════════════════════════════════════════════════════════════════════════
// RARITY STYLES
// ═══════════════════════════════════════════════════════════════════════════

const RARITY_STYLES = {
  COMMON: {
    gradient: 'from-gray-600 to-gray-800',
    border: 'border-gray-500',
    glow: 'rgba(156, 163, 175, 0.3)',
    text: '#9CA3AF',
    badge: 'bg-gray-700 text-gray-300',
  },
  UNCOMMON: {
    gradient: 'from-green-600 to-green-900',
    border: 'border-green-500',
    glow: 'rgba(34, 197, 94, 0.4)',
    text: '#22C55E',
    badge: 'bg-green-900 text-green-300',
  },
  RARE: {
    gradient: 'from-blue-600 to-blue-900',
    border: 'border-blue-500',
    glow: 'rgba(59, 130, 246, 0.5)',
    text: '#3B82F6',
    badge: 'bg-blue-900 text-blue-300',
  },
  EPIC: {
    gradient: 'from-purple-600 to-purple-900',
    border: 'border-purple-500',
    glow: 'rgba(168, 85, 247, 0.5)',
    text: '#A855F7',
    badge: 'bg-purple-900 text-purple-300',
  },
  LEGENDARY: {
    gradient: 'from-amber-500 to-orange-700',
    border: 'border-amber-400',
    glow: 'rgba(245, 158, 11, 0.6)',
    text: '#F59E0B',
    badge: 'bg-amber-900 text-amber-300',
  },
};

// Language display names
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'ja': 'Japanese',
  'zh-cmn': 'Mandarin',
  'zh-yue': 'Cantonese',
  'sa': 'Sanskrit',
  'hi': 'Hindi',
  'lkt': 'Lakota',
  'dak': 'Dakota',
};

// ═══════════════════════════════════════════════════════════════════════════
// CONSTELLATION VISUALIZER (SVG-based address visualization)
// ═══════════════════════════════════════════════════════════════════════════

const ConstellationVisualizer = React.memo(({ address, path, rarityTier, size = 120 }) => {
  const style = RARITY_STYLES[rarityTier] || RARITY_STYLES.COMMON;
  
  // Parse address to generate star positions
  const stars = useMemo(() => {
    const points = [];
    const segments = address.replace(/\|/g, '').split('');
    const numStars = Math.min(segments.length, 36);
    
    for (let i = 0; i < numStars; i++) {
      const bit = segments[i] === '1';
      const angle = (i / numStars) * Math.PI * 2;
      const radius = bit ? 0.7 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3;
      
      points.push({
        x: 50 + Math.cos(angle) * radius * 40,
        y: 50 + Math.sin(angle) * radius * 40,
        size: bit ? 2.5 : 1.5,
        bright: bit,
      });
    }
    return points;
  }, [address]);
  
  // Generate constellation lines between bright stars
  const lines = useMemo(() => {
    const brightStars = stars.filter(s => s.bright);
    const connections = [];
    
    for (let i = 0; i < brightStars.length - 1; i++) {
      connections.push({
        x1: brightStars[i].x,
        y1: brightStars[i].y,
        x2: brightStars[i + 1].x,
        y2: brightStars[i + 1].y,
      });
    }
    
    // Close the loop
    if (brightStars.length > 2) {
      connections.push({
        x1: brightStars[brightStars.length - 1].x,
        y1: brightStars[brightStars.length - 1].y,
        x2: brightStars[0].x,
        y2: brightStars[0].y,
      });
    }
    
    return connections;
  }, [stars]);
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
      className="rounded-lg"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      {/* Background glow */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={style.text}
        strokeWidth="0.5"
        opacity="0.2"
      />
      
      {/* Constellation lines */}
      {lines.map((line, i) => (
        <line
          key={`line-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={style.text}
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}
      
      {/* Stars */}
      {stars.map((star, i) => (
        <circle
          key={`star-${i}`}
          cx={star.x}
          cy={star.y}
          r={star.size}
          fill={star.bright ? style.text : 'rgba(255,255,255,0.3)'}
        />
      ))}
      
      {/* Center point (depth indicator) */}
      <circle
        cx="50"
        cy="50"
        r="4"
        fill={style.text}
        opacity="0.8"
      />
      <text
        x="50"
        y="53"
        textAnchor="middle"
        fontSize="5"
        fill="black"
        fontWeight="bold"
      >
        {path.length}
      </text>
    </svg>
  );
});

ConstellationVisualizer.displayName = 'ConstellationVisualizer';

// ═══════════════════════════════════════════════════════════════════════════
// SEED CARD
// ═══════════════════════════════════════════════════════════════════════════

const SeedCard = React.memo(({ seed, onClick }) => {
  const style = RARITY_STYLES[seed.rarity_tier] || RARITY_STYLES.COMMON;
  
  return (
    <motion.div
      className={`relative p-4 rounded-xl cursor-pointer overflow-hidden ${style.border} border`}
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,30,0.9))`,
        boxShadow: `0 4px 20px ${style.glow}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 8px 30px ${style.glow}`,
      }}
      onClick={() => onClick?.(seed)}
      data-testid={`seed-card-${seed.seed_id}`}
    >
      {/* Rarity badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${style.badge}`}>
        {seed.rarity_tier}
      </div>
      
      {/* Constellation */}
      <div className="flex justify-center mb-3">
        <ConstellationVisualizer
          address={seed.address_36bit}
          path={seed.path}
          rarityTier={seed.rarity_tier}
          size={100}
        />
      </div>
      
      {/* Seed name */}
      <h3 
        className="text-sm font-medium text-center mb-1 truncate"
        style={{ color: style.text }}
      >
        {seed.constellation_name || `Seed #${seed.seed_id.slice(0, 8)}`}
      </h3>
      
      {/* Stats row */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <Layers size={10} />
          L{seed.depth}
        </span>
        <span className="flex items-center gap-1">
          <Globe size={10} />
          {LANGUAGE_NAMES[seed.linguistic_state] || seed.linguistic_state}
        </span>
        <span className="flex items-center gap-1">
          <Star size={10} />
          {seed.rarity_score}
        </span>
      </div>
    </motion.div>
  );
});

SeedCard.displayName = 'SeedCard';

// ═══════════════════════════════════════════════════════════════════════════
// STATS PANEL
// ═══════════════════════════════════════════════════════════════════════════

const StatsPanel = React.memo(({ stats }) => {
  if (!stats) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Total Seeds */}
      <div className="bg-black/30 rounded-lg p-3 border border-white/10">
        <div className="text-xs text-gray-400 mb-1">Total Seeds</div>
        <div className="text-xl font-bold text-white">{stats.total_seeds}</div>
      </div>
      
      {/* Legendary Count */}
      <div className="bg-black/30 rounded-lg p-3 border border-amber-500/30">
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <Crown size={10} className="text-amber-500" />
          Legendary
        </div>
        <div className="text-xl font-bold text-amber-500">
          {stats.tier_distribution?.LEGENDARY || 0}
        </div>
      </div>
      
      {/* Epic Count */}
      <div className="bg-black/30 rounded-lg p-3 border border-purple-500/30">
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <Sparkles size={10} className="text-purple-500" />
          Epic
        </div>
        <div className="text-xl font-bold text-purple-500">
          {stats.tier_distribution?.EPIC || 0}
        </div>
      </div>
      
      {/* Deep Dives (L4+) */}
      <div className="bg-black/30 rounded-lg p-3 border border-blue-500/30">
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <Layers size={10} className="text-blue-500" />
          Deep Dives (L4+)
        </div>
        <div className="text-xl font-bold text-blue-500">
          {(stats.depth_distribution?.L4 || 0) + (stats.depth_distribution?.L5 || 0)}
        </div>
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';

// ═══════════════════════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════════════════════

const FilterBar = React.memo(({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-black/30 rounded-lg border border-white/10">
      <Filter size={16} className="text-gray-400" />
      
      {/* Rarity filter */}
      <select
        value={filters.rarity || ''}
        onChange={(e) => onFilterChange('rarity', e.target.value || null)}
        className="bg-black/50 text-white text-sm px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-blue-500"
      >
        <option value="">All Rarities</option>
        <option value="LEGENDARY">Legendary</option>
        <option value="EPIC">Epic</option>
        <option value="RARE">Rare</option>
        <option value="UNCOMMON">Uncommon</option>
        <option value="COMMON">Common</option>
      </select>
      
      {/* Depth filter */}
      <select
        value={filters.minDepth ?? ''}
        onChange={(e) => onFilterChange('minDepth', e.target.value ? parseInt(e.target.value) : null)}
        className="bg-black/50 text-white text-sm px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-blue-500"
      >
        <option value="">Any Depth</option>
        <option value="1">L1+</option>
        <option value="2">L2+</option>
        <option value="3">L3+</option>
        <option value="4">L4+</option>
        <option value="5">L5 (Core)</option>
      </select>
      
      {/* Language filter */}
      <select
        value={filters.language || ''}
        onChange={(e) => onFilterChange('language', e.target.value || null)}
        className="bg-black/50 text-white text-sm px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-blue-500"
      >
        <option value="">All Languages</option>
        <option value="sa">Sanskrit</option>
        <option value="lkt">Lakota</option>
        <option value="dak">Dakota</option>
        <option value="ja">Japanese</option>
        <option value="zh-cmn">Mandarin</option>
        <option value="zh-yue">Cantonese</option>
        <option value="hi">Hindi</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
      
      {/* Sort */}
      <select
        value={filters.sortBy || 'timestamp'}
        onChange={(e) => onFilterChange('sortBy', e.target.value)}
        className="bg-black/50 text-white text-sm px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-blue-500"
      >
        <option value="timestamp">Newest</option>
        <option value="rarity_score">Rarest</option>
        <option value="depth">Deepest</option>
      </select>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

// ═══════════════════════════════════════════════════════════════════════════
// SEED DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════

const SeedDetailModal = React.memo(({ seed, onClose }) => {
  if (!seed) return null;
  
  const style = RARITY_STYLES[seed.rarity_tier] || RARITY_STYLES.COMMON;
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto ${style.border} border`}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 40px ${style.glow}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium" style={{ color: style.text }}>
            {seed.constellation_name || `Crystalline Seed`}
          </h2>
          <span className={`px-2 py-0.5 rounded-full text-xs uppercase ${style.badge}`}>
            {seed.rarity_tier}
          </span>
        </div>
        
        {/* Constellation */}
        <div className="flex justify-center mb-4">
          <ConstellationVisualizer
            address={seed.address_36bit}
            path={seed.path}
            rarityTier={seed.rarity_tier}
            size={180}
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-black/30 rounded">
            <div className="text-xs text-gray-400">Rarity</div>
            <div className="text-sm font-bold" style={{ color: style.text }}>{seed.rarity_score}</div>
          </div>
          <div className="text-center p-2 bg-black/30 rounded">
            <div className="text-xs text-gray-400">Depth</div>
            <div className="text-sm font-bold text-white">L{seed.depth}</div>
          </div>
          <div className="text-center p-2 bg-black/30 rounded">
            <div className="text-xs text-gray-400">Language</div>
            <div className="text-sm font-bold text-white">{LANGUAGE_NAMES[seed.linguistic_state] || seed.linguistic_state}</div>
          </div>
        </div>
        
        {/* 36-bit Address */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">36-Bit Address</div>
          <div 
            className="font-mono text-[10px] p-2 bg-black/50 rounded break-all"
            style={{ color: style.text }}
          >
            {seed.address_36bit}
          </div>
        </div>
        
        {/* Path */}
        {seed.path && seed.path.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">Journey Path</div>
            <div className="space-y-1">
              {seed.path.map((node, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 bg-black/30 rounded">
                  <span className="text-gray-500">L{node.depth}</span>
                  <span className="text-white">Hex #{node.hexagram_number}</span>
                  <span className="text-gray-400">[{node.row},{node.col}]</span>
                  <span style={{ color: style.text }}>{node.language_code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Metadata */}
        <div className="text-[10px] text-gray-500">
          <div>Seed ID: {seed.seed_id}</div>
          <div>Minted: {new Date(seed.timestamp).toLocaleString()}</div>
          <div>Minter: {seed.minter_id}</div>
        </div>
        
        {/* Close */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
});

SeedDetailModal.displayName = 'SeedDetailModal';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function SeedGalleryPage() {
  const navigate = useNavigate();
  
  const [seeds, setSeeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [filters, setFilters] = useState({
    rarity: null,
    minDepth: null,
    language: null,
    sortBy: 'timestamp',
  });
  
  // Fetch gallery
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.rarity) params.append('rarity_tier', filters.rarity);
      if (filters.minDepth !== null) params.append('min_depth', filters.minDepth);
      if (filters.language) params.append('linguistic_state', filters.language);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      params.append('sort_order', 'desc');
      
      const response = await fetch(`${API_URL}/api/seeds/gallery?${params}`);
      if (!response.ok) throw new Error('Failed to fetch gallery');
      
      const data = await response.json();
      setSeeds(data.seeds || []);
      setError(null);
    } catch (err) {
      console.error('Gallery fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/seeds/stats/overview`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);
  
  useEffect(() => {
    fetchGallery();
    fetchStats();
  }, [fetchGallery, fetchStats]);
  
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
      }}
      data-testid="seed-gallery-page"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          data-testid="gallery-back-button"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        
        <div>
          <h1 className="text-2xl font-light text-white tracking-wider">
            THE LATTICE EXCHANGE
          </h1>
          <p className="text-sm text-gray-400">Crystalline Seed Gallery</p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Gem className="text-amber-500" size={20} />
          <span className="text-amber-500 font-medium">{stats?.total_seeds || 0}</span>
          <span className="text-gray-400 text-sm">Seeds Minted</span>
        </div>
      </div>
      
      {/* Stats */}
      <StatsPanel stats={stats} />
      
      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          Error loading gallery: {error}
        </div>
      ) : seeds.length === 0 ? (
        <div className="text-center py-20">
          <Gem size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No seeds found</p>
          <p className="text-sm text-gray-500">
            Mint your first Crystalline Seed in the{' '}
            <button 
              onClick={() => navigate('/recursive-dive')}
              className="text-blue-400 hover:underline"
            >
              Recursive Dive
            </button>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {seeds.map(seed => (
            <SeedCard 
              key={seed.seed_id} 
              seed={seed} 
              onClick={setSelectedSeed}
            />
          ))}
        </div>
      )}
      
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSeed && (
          <SeedDetailModal 
            seed={selectedSeed} 
            onClose={() => setSelectedSeed(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
