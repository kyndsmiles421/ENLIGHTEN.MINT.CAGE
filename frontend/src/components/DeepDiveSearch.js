/**
 * ENLIGHTEN.MINT.CAFE - V10010.0 DEEP DIVE SEARCH
 * 
 * Perplexity-style threaded search across the 54-layer temporal index.
 * Features:
 * - Centered search bar (Sovereign Inquiry)
 * - Multi-epoch synthesis
 * - Source citations with GPS anchors
 * - Thread visualization
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Search, MapPin, Clock, Layers, ChevronRight,
  Globe, BookOpen, Zap, Sparkles, X
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Epoch styling
const EPOCH_STYLES = {
  PAST: { color: '#8B5CF6', icon: BookOpen, label: 'Past Epoch' },
  PRESENT: { color: '#22C55E', icon: Globe, label: 'Present Epoch' },
  FUTURE: { color: '#3B82F6', icon: Zap, label: 'Future Epoch' },
};

/**
 * Deep Dive Search Component
 */
export default function DeepDiveSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    
    try {
      const res = await axios.post(`${API}/omnis/search/deep-dive?query=${encodeURIComponent(query)}`);
      setResult(res.data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-20"
        style={{ background: 'rgba(0,0,0,0.95)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
          data-testid="close-deep-dive"
        >
          <X size={20} className="text-white/50" />
        </button>

        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles size={24} className="text-violet-400" />
            Deep Dive Search
          </h2>
          <p className="text-sm text-white/40 mt-2">
            Perplexity-style threaded synthesis across 54 temporal layers
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-full max-w-2xl px-4"
        >
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about Law, Trust, Equity, Omega..."
              className="w-full px-6 py-4 pr-14 bg-transparent text-white text-lg placeholder-white/30 outline-none"
              autoFocus
              data-testid="deep-dive-input"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all"
              style={{
                background: 'rgba(139,92,246,0.2)',
                opacity: isSearching ? 0.5 : 1,
              }}
              data-testid="deep-dive-search-btn"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Layers size={20} className="text-violet-400" />
                </motion.div>
              ) : (
                <Search size={20} className="text-violet-400" />
              )}
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {[
              'Trust Equity synthesis',
              'Lakota star knowledge',
              'Omega singularity future',
              'Natural Law grounding',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                }}
                className="px-3 py-1 rounded-full text-xs transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl px-4 mt-8"
            >
              {/* Thread count indicator */}
              <div className="flex items-center gap-2 mb-4">
                <Layers size={14} className="text-violet-400" />
                <span className="text-xs text-white/40">
                  {result.thread_count} epoch thread{result.thread_count > 1 ? 's' : ''} synthesized
                </span>
              </div>

              {/* Answer */}
              <div 
                className="p-6 rounded-2xl mb-6"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p className="text-white/80 leading-relaxed">{result.answer}</p>
              </div>

              {/* Sources */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-white/30 flex items-center gap-2">
                  <MapPin size={12} />
                  Source Anchors
                </h3>
                
                {result.sources?.map((source, idx) => {
                  const epochStyle = EPOCH_STYLES[source.epoch] || EPOCH_STYLES.PRESENT;
                  const EpochIcon = epochStyle.icon;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl flex items-start gap-4"
                      style={{
                        background: `${epochStyle.color}08`,
                        border: `1px solid ${epochStyle.color}20`,
                      }}
                    >
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: `${epochStyle.color}20` }}
                      >
                        <EpochIcon size={16} style={{ color: epochStyle.color }} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: epochStyle.color }}>
                            {source.epoch}
                          </span>
                          <span className="text-[10px] text-white/30">
                            Layers {source.layers?.start || 1}-{source.layers?.end || 18}
                          </span>
                        </div>
                        
                        <p className="text-xs text-white/50 mb-2">
                          {source.layers?.content}
                        </p>
                        
                        <div className="flex items-center gap-2 text-[10px] text-white/30">
                          <MapPin size={10} />
                          <span>{source.gps}</span>
                          <ChevronRight size={10} />
                          <span>{source.anchor}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Timestamp */}
              <div className="text-center mt-6">
                <span className="text-[10px] text-white/20 flex items-center justify-center gap-1">
                  <Clock size={10} />
                  Synthesized at {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center gap-3 text-violet-400">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Layers size={20} />
                </motion.div>
                <span className="text-sm">Threading through 54 temporal layers...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
