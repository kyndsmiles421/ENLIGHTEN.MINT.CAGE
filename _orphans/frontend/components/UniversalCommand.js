import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMeshNetwork, CONSTELLATION_NODES, CATEGORY_COLORS } from '../context/MeshNetworkContext';
import {
  Search, Command, ArrowRight, Clock, Star, Zap, Sparkles,
  Wind, Timer, Flame, Hand, Music, Sun, Moon, Eye, BookOpen, Heart,
  Headphones, Radio, Leaf, MessageCircle, Users, Calendar, Compass,
  Crown, Globe, Brain, X,
} from 'lucide-react';

// Icon mapping
const NODE_ICONS = {
  breathing: Wind, meditation: Timer, yoga: Flame, exercises: Zap,
  mudras: Hand, mantras: Music, affirmations: Sun, oracle: Sparkles,
  'star-chart': Star, numerology: Star, dreams: Moon, forecasts: Eye,
  'cosmic-profile': Compass, journal: BookOpen, mood: Heart,
  soundscapes: Headphones, frequencies: Radio, 'zen-garden': Leaf,
  'light-therapy': Sun, coach: MessageCircle, sovereigns: Crown,
  challenges: Flame, community: Users, blessings: Heart,
  'daily-briefing': Sun, 'daily-ritual': Sparkles, 'cosmic-calendar': Calendar,
};

/**
 * UniversalCommand — Spotlight-style command palette for instant navigation
 * 
 * Triggered by:
 * - Cmd+K / Ctrl+K
 * - Long-press gesture (mobile)
 * - Pinch gesture (tablet)
 * 
 * Features:
 * - Fuzzy search across all constellation nodes
 * - Recent navigation history
 * - Quick actions (mood check, start meditation, etc.)
 * - Category filtering
 */
export default function UniversalCommand() {
  const navigate = useNavigate();
  const { commandOverlayOpen, setCommandOverlayOpen, meshHistory, currentNode } = useMeshNetwork();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Build searchable items
  const allNodes = useMemo(() => Object.values(CONSTELLATION_NODES), []);
  
  // Quick actions (common shortcuts)
  const quickActions = useMemo(() => [
    { id: 'qa-breathe', label: 'Start Breathing Exercise', path: '/breathing', icon: Wind, color: '#2DD4BF', keywords: 'breathe calm relax quick' },
    { id: 'qa-mood', label: 'Log Mood', path: '/mood', icon: Heart, color: '#F87171', keywords: 'mood feeling emotion check' },
    { id: 'qa-journal', label: 'Write in Journal', path: '/journal', icon: BookOpen, color: '#86EFAC', keywords: 'write journal note thought' },
    { id: 'qa-oracle', label: 'Ask the Oracle', path: '/oracle', icon: Sparkles, color: '#E879F9', keywords: 'oracle question tarot guidance' },
    { id: 'qa-meditate', label: 'Start Meditation', path: '/meditation', icon: Timer, color: '#D8B4FE', keywords: 'meditate focus calm session' },
  ], []);

  // Recent history (deduplicated)
  const recentNodes = useMemo(() => {
    const unique = [...new Set(meshHistory.slice().reverse())].slice(0, 5);
    return unique.map(id => CONSTELLATION_NODES[id]).filter(Boolean);
  }, [meshHistory]);

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent + quick actions when no query
      return [
        ...(recentNodes.length > 0 ? [{ type: 'header', label: 'Recent' }] : []),
        ...recentNodes.map(n => ({ ...n, type: 'recent' })),
        { type: 'header', label: 'Quick Actions' },
        ...quickActions.map(a => ({ ...a, type: 'action' })),
        { type: 'header', label: 'All Destinations' },
        ...allNodes.slice(0, 8).map(n => ({ ...n, type: 'node' })),
      ];
    }

    const q = query.toLowerCase();
    
    // Search all nodes
    const nodeMatches = allNodes.filter(n => 
      n.label.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q)
    );

    // Search quick actions
    const actionMatches = quickActions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      a.keywords.toLowerCase().includes(q)
    );

    return [
      ...(actionMatches.length > 0 ? [{ type: 'header', label: 'Actions' }] : []),
      ...actionMatches.map(a => ({ ...a, type: 'action' })),
      ...(nodeMatches.length > 0 ? [{ type: 'header', label: 'Destinations' }] : []),
      ...nodeMatches.map(n => ({ ...n, type: 'node' })),
    ];
  }, [query, allNodes, quickActions, recentNodes]);

  // Selectable items (excluding headers)
  const selectableResults = results.filter(r => r.type !== 'header');

  // Handle keyboard navigation
  useEffect(() => {
    if (!commandOverlayOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, selectableResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = selectableResults[selectedIndex];
        if (selected?.path) {
          navigate(selected.path);
          setCommandOverlayOpen(false);
          setQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandOverlayOpen, selectedIndex, selectableResults, navigate, setCommandOverlayOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandOverlayOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
      setQuery('');
    }
  }, [commandOverlayOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!commandOverlayOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh]"
        onClick={() => setCommandOverlayOpen(false)}
        data-testid="universal-command-overlay"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'transparent', backdropFilter: 'none'}}
        />

        {/* Command Panel */}
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(20,20,30,0.98) 0%, rgba(0,0,0,0) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.1)',
          }}
          onClick={e => e.stopPropagation()}
          data-testid="universal-command-panel"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Search size={18} style={{ color: 'rgba(255,255,255,0.65)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Navigate anywhere..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
              data-testid="command-search-input"
            />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Command size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>K</span>
            </div>
            <button
              onClick={() => setCommandOverlayOpen(false)}
              className="p-1 rounded hover:bg-white/5"
            >
              <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
            {results.map((item, index) => {
              if (item.type === 'header') {
                return (
                  <div key={`header-${item.label}`} className="px-4 py-2 mt-1 first:mt-0">
                    <span className="text-[9px] uppercase tracking-widest font-semibold" 
                      style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {item.label}
                    </span>
                  </div>
                );
              }

              const selectableIndex = selectableResults.indexOf(item);
              const isSelected = selectableIndex === selectedIndex;
              const Icon = NODE_ICONS[item.id] || item.icon || Sparkles;
              const color = item.color || CATEGORY_COLORS[item.category] || '#818CF8';

              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setCommandOverlayOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                  style={{
                    background: isSelected ? `${color}10` : 'transparent',
                  }}
                  onMouseEnter={() => setSelectedIndex(selectableIndex)}
                  whileHover={{ x: 4 }}
                  data-testid={`command-item-${item.id}`}
                >
                  {/* Icon */}
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `${color}15`,
                      border: `1px solid ${color}20`,
                    }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium block truncate" 
                      style={{ color: isSelected ? color : 'rgba(255,255,255,0.85)' }}>
                      {item.label}
                    </span>
                    {item.category && (
                      <span className="text-[10px] capitalize" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Type Badge */}
                  {item.type === 'recent' && (
                    <Clock size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  )}
                  {item.type === 'action' && (
                    <Zap size={12} style={{ color }} />
                  )}

                  {/* Arrow */}
                  <ArrowRight size={14} style={{ color: isSelected ? color : 'rgba(255,255,255,0.15)' }} />
                </motion.button>
              );
            })}

            {selectableResults.length === 0 && query && (
              <div className="px-4 py-8 text-center">
                <Sparkles size={24} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  No destinations found for "{query}"
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2" 
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" 
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>↑↓</kbd>
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" 
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>↵</kbd>
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Open</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" 
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>esc</kbd>
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Close</span>
              </div>
            </div>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Mesh Network v1
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
