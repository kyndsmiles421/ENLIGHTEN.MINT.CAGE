/**
 * CRYSTAL RESONANCE PANEL
 * =======================
 * 
 * Visual display of the Central Crystal's current state.
 * Shows frequency, active source, and real-time transition animations.
 * 
 * Features:
 * - Pulsing frequency visualization
 * - Source button grid with active highlight
 * - Transition progress bar during pulses
 * - Guardrail status indicator
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Shield, AlertTriangle, Radio, 
  Moon, Wind, Sparkles, Eye, Compass, 
  Layers, Music, Star, BookOpen
} from 'lucide-react';
import { useCrystalResonance } from '../hooks/useCrystalResonance';

// Icon mapping for sources
const SOURCE_ICONS = {
  Void: Moon,
  Breathing: Wind,
  Sanctuary: Sparkles,
  Star_Chart: Star,
  Oracle: Eye,
  I_Ching: BookOpen,
  Tarot: Layers,
  Divination: Compass,
  Tesseract: Layers,
  Mixer: Music,
};

// Frequency to color mapping
const getFrequencyColor = (freq) => {
  if (freq === 0) return '#1a1a2e'; // Void - deep purple
  if (freq < 200) return '#3B82F6'; // Low - blue
  if (freq < 500) return '#10B981'; // Mid - green
  if (freq < 700) return '#F59E0B'; // High - amber
  if (freq < 900) return '#8B5CF6'; // Very high - purple
  return '#EC4899'; // Ultra - pink
};

export default function CrystalResonancePanel({ 
  compact = false,
  showSources = true,
  onSourceClick,
}) {
  const {
    freq,
    activeSource,
    isTransitioning,
    transitionProgress,
    sourceInfo,
    isConnected,
    error,
    guardrailResult,
    pulse,
    fetchSources,
  } = useCrystalResonance({ pollInterval: 100 });

  const [sources, setSources] = useState([]);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Fetch available sources on mount
  useEffect(() => {
    fetchSources().then(setSources);
  }, [fetchSources]);

  const handleSourceClick = async (source) => {
    if (onSourceClick) {
      onSourceClick(source);
    }
    
    // Pulse to the selected source
    const result = await pulse(source.id, `Navigate to ${source.label}`);
    
    if (!result.success && result.guardrail_result) {
      console.log('Guardrail blocked:', result.guardrail_result);
    }
  };

  const frequencyColor = getFrequencyColor(freq);
  const Icon = SOURCE_ICONS[activeSource] || Radio;

  return (
    <motion.div
      className="crystal-resonance-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(10, 10, 18, 0.85)',
        backdropFilter: 'none',
        borderRadius: 16,
        border: `1px solid ${frequencyColor}33`,
        padding: compact ? 12 : 20,
        minWidth: compact ? 180 : 280,
        boxShadow: `0 0 40px ${frequencyColor}22`,
      }}
      data-testid="crystal-resonance-panel"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {/* Animated Crystal Icon */}
          <motion.div
            animate={{
              scale: isTransitioning ? [1, 1.2, 1] : 1,
              rotate: isTransitioning ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: isTransitioning ? 0.5 : 0,
              repeat: isTransitioning ? Infinity : 0,
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${frequencyColor}44 0%, ${frequencyColor}11 70%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${frequencyColor}66`,
            }}
          >
            <Icon size={16} color={frequencyColor} />
          </motion.div>

          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              Crystal
            </div>
            <div 
              className="text-sm font-semibold"
              style={{ color: frequencyColor }}
            >
              {sourceInfo?.name || activeSource}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isConnected ? '#10B981' : '#EF4444',
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Frequency Display */}
            <div className="mt-4 text-center">
              <motion.div
                key={freq}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold"
                style={{ 
                  color: frequencyColor,
                  textShadow: `0 0 20px ${frequencyColor}66`,
                }}
              >
                {freq.toFixed(1)} <span className="text-sm opacity-60">Hz</span>
              </motion.div>

              {/* Transition Progress */}
              {isTransitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div className="text-xs text-gray-400 mb-1">
                    Transitioning...
                  </div>
                  <div 
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: frequencyColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${transitionProgress * 100}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Guardrail Status */}
            {guardrailResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 rounded-lg text-xs"
                style={{
                  background: guardrailResult.allowed 
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${guardrailResult.allowed ? '#10B98144' : '#EF444444'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  {guardrailResult.allowed ? (
                    <Shield size={12} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={12} className="text-red-400" />
                  )}
                  <span className={guardrailResult.allowed ? 'text-emerald-300' : 'text-red-300'}>
                    {guardrailResult.state.toUpperCase()}
                  </span>
                  <span className="text-gray-400 ml-auto">
                    {(guardrailResult.resonance * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            )}

            {/* Source Grid */}
            {showSources && sources.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Sources
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {sources.map((source) => {
                    const SourceIcon = SOURCE_ICONS[source.id] || Radio;
                    const isActive = source.id === activeSource;
                    
                    return (
                      <motion.button
                        key={source.id}
                        onClick={() => handleSourceClick(source)}
                        className="relative p-2 rounded-lg transition-colors"
                        style={{
                          background: isActive 
                            ? `${source.color}33` 
                            : 'rgba(255,255,255,0.05)',
                          border: isActive 
                            ? `1px solid ${source.color}66`
                            : '1px solid transparent',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`${source.label} (${source.frequency}Hz)`}
                        data-testid={`crystal-source-${source.id}`}
                      >
                        <SourceIcon 
                          size={16} 
                          color={isActive ? source.color : '#666'} 
                        />
                        
                        {isActive && (
                          <motion.div
                            layoutId="activeSource"
                            className="absolute inset-0 rounded-lg"
                            style={{
                              border: `2px solid ${source.color}`,
                              boxShadow: `0 0 10px ${source.color}44`,
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-2 rounded-lg text-xs bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center gap-2 text-red-300">
                  <Zap size={12} />
                  {error.message}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Compact Badge variant for minimal display
export function CrystalBadge() {
  const { freq, activeSource, isTransitioning, sourceInfo } = useCrystalResonance({ 
    pollInterval: 200 
  });
  
  const frequencyColor = getFrequencyColor(freq);
  const Icon = SOURCE_ICONS[activeSource] || Radio;

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(10, 10, 18, 0.8)',
        border: `1px solid ${frequencyColor}44`,
      }}
      animate={{
        boxShadow: isTransitioning 
          ? [`0 0 10px ${frequencyColor}00`, `0 0 20px ${frequencyColor}44`, `0 0 10px ${frequencyColor}00`]
          : `0 0 10px ${frequencyColor}22`,
      }}
      transition={{ duration: 0.5, repeat: isTransitioning ? Infinity : 0 }}
      data-testid="crystal-badge"
    >
      <Icon size={14} color={frequencyColor} />
      <span 
        className="text-xs font-medium"
        style={{ color: frequencyColor }}
      >
        {freq.toFixed(0)} Hz
      </span>
    </motion.div>
  );
}
