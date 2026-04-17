/**
 * OracleSearch.js — V64.1 Intent-Based Neural Search
 * 
 * The Nervous System of the Sovereign Hub.
 * Not a list — a BRIDGE between domains.
 * Type "Resistance" and see Circuit Breakers, Fevers, and Spiritual Blocks unite.
 * 
 * Inline expansion only. Zero modals. Zero overlays.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Zap, Droplets, Leaf, Heart, BookOpen, Baby, Flame, Car, Apple, Brain, HandHeart, Wrench, Wind, Cpu, Cross, Eye, Hammer, Axe, Mic, Scale, GraduationCap, Activity, Cog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  Zap, Droplets, Leaf, Heart, BookOpen, Baby, Flame, Car, Apple, Brain, HandHeart, Wrench, Wind, Cpu, Cross, Eye, Hammer, Axe, Mic, Scale, GraduationCap, Activity, Cog,
};

// Domain visual identity — each domain has a color and a symbol
const DOMAIN_COLORS = {
  'Trade & Craft': '#F59E0B',
  'Healing Arts': '#EF4444',
  'Sacred Knowledge': '#A78BFA',
  'Science & Physics': '#3B82F6',
  'Mind & Spirit': '#2DD4BF',
  'Exploration': '#22C55E',
};

const DOMAIN_ORDER = [
  'Trade & Craft',
  'Healing Arts',
  'Sacred Knowledge',
  'Science & Physics',
  'Mind & Spirit',
  'Exploration',
];

export default function OracleSearch({ onActiveDomains }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults([]);
      if (onActiveDomains) onActiveDomains([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(`${API}/workshop/search`, { params: { q } });
      const data = res.data?.results || [];
      setResults(data);
      // Extract active domains for pillar glow
      const domains = [...new Set(data.map(r => r.domain))];
      if (onActiveDomains) onActiveDomains(domains);
    } catch {
      setResults([]);
      if (onActiveDomains) onActiveDomains([]);
    }
    setIsSearching(false);
  }, [onActiveDomains]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 250);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (onActiveDomains) onActiveDomains([]);
    inputRef.current?.focus();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Group results by domain
  const grouped = {};
  for (const r of results) {
    if (!grouped[r.domain]) grouped[r.domain] = [];
    grouped[r.domain].push(r);
  }
  const activeDomains = Object.keys(grouped);
  const hasResults = results.length > 0;
  const showEmpty = query.length >= 2 && !isSearching && !hasResults;

  return (
    <div className="w-full" data-testid="oracle-search">
      {/* Search Input */}
      <div
        className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
        style={{
          background: isFocused ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isFocused ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        <Search size={14} style={{ color: isFocused ? '#A78BFA' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Oracle Search — type an intent..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'rgba(248,250,252,0.9)', caretColor: '#A78BFA' }}
          data-testid="oracle-search-input"
        />
        {query && (
          <button onClick={clearSearch} className="p-1 rounded-full transition-all active:scale-90" data-testid="oracle-clear">
            <X size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        )}
        {isSearching && (
          <div className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        )}
      </div>

      {/* Domain Bridge Bar — shows which domains are lit up */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex flex-wrap gap-1.5 justify-center"
            data-testid="domain-bridge"
          >
            {DOMAIN_ORDER.map(domain => {
              const isActive = activeDomains.includes(domain);
              const color = DOMAIN_COLORS[domain] || '#888';
              const count = grouped[domain]?.length || 0;
              return (
                <motion.div
                  key={domain}
                  animate={{
                    opacity: isActive ? 1 : 0.2,
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: isActive ? `${color}18` : 'transparent',
                    border: `1px solid ${isActive ? `${color}40` : 'rgba(255,255,255,0.04)'}`,
                    color: isActive ? color : 'rgba(255,255,255,0.15)',
                  }}
                  data-testid={`domain-indicator-${domain.toLowerCase().replace(/[\s&]/g, '-')}`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isActive ? color : 'rgba(255,255,255,0.1)',
                      boxShadow: isActive ? `0 0 6px ${color}60` : 'none',
                    }}
                  />
                  {domain.split(' ')[0]}
                  {isActive && <span style={{ opacity: 0.6 }}>{count}</span>}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bridge Lines — visual connections between active domains */}
      <AnimatePresence>
        {activeDomains.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1 flex justify-center"
          >
            <div className="text-[8px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.12)',
                color: 'rgba(167,139,250,0.6)',
              }}
              data-testid="bridge-indicator"
            >
              {activeDomains.length} domains bridged
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped Results — inline, no modals */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-3"
            data-testid="oracle-results"
          >
            {DOMAIN_ORDER.filter(d => grouped[d]).map(domain => (
              <div key={domain} data-testid={`result-domain-${domain.toLowerCase().replace(/[\s&]/g, '-')}`}>
                {/* Domain Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: DOMAIN_COLORS[domain], boxShadow: `0 0 8px ${DOMAIN_COLORS[domain]}40` }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: DOMAIN_COLORS[domain] }}>
                    {domain}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `${DOMAIN_COLORS[domain]}20` }} />
                </div>

                {/* Module Cards */}
                <div className="grid grid-cols-2 gap-1.5">
                  {grouped[domain].map((mod, i) => {
                    const IconComp = ICON_MAP[mod.icon] || Wrench;
                    return (
                      <motion.button
                        key={mod.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { navigate(mod.route); }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all active:scale-95"
                        style={{
                          background: `${mod.accentColor}08`,
                          border: `1px solid ${mod.accentColor}18`,
                        }}
                        data-testid={`result-${mod.id}`}
                      >
                        <IconComp size={14} style={{ color: mod.accentColor, flexShrink: 0 }} />
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium truncate" style={{ color: 'rgba(248,250,252,0.85)' }}>
                            {mod.title.replace(' Workshop', '')}
                          </div>
                          {mod.matchedTags?.length > 0 && (
                            <div className="text-[8px] truncate" style={{ color: `${mod.accentColor}99` }}>
                              {mod.matchedTags.slice(0, 3).join(' · ')}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {showEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center py-4"
            data-testid="oracle-empty"
          >
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No cells resonate with "{query}"
            </p>
            <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Try: foundation, pressure, safety, healing, fire
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
