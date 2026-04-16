/**
 * RitualCycleControl.js — The Digital Prayer Wheel
 * 
 * Auto-animated journey through all 9 hexagram states.
 * Creates a meditative experience where users watch the full
 * descent-and-return cycle without manual slider manipulation.
 * 
 * Features:
 * - Play/Pause/Stop controls
 * - Progress indicator ring
 * - Auto-pause at Source State (Hexagram 63)
 * - Haptic pulse at each transition
 * - Current hexagram display
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { HEXAGRAM_REGISTRY, HEXAGRAM_SEQUENCE } from '../config/hexagramRegistry';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROGRESS RING SVG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ProgressRing = ({ progress, size = 60, strokeWidth = 3, color = '#FFD700' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  
  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      
      {/* Progress ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.3 }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEXAGRAM DOTS INDICATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HexagramDots = ({ currentIndex, total = 9 }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const hex = HEXAGRAM_REGISTRY[HEXAGRAM_SEQUENCE[i]];
        const isActive = i === currentIndex;
        const isPast = i < currentIndex;
        
        return (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: isActive 
                ? hex?.glowColor || '#FFD700'
                : isPast 
                  ? 'rgba(255,255,255,0.4)' 
                  : 'rgba(255,255,255,0.15)',
              boxShadow: isActive 
                ? `0 0 6px ${hex?.glowColor || '#FFD700'}` 
                : 'none',
            }}
            animate={{
              scale: isActive ? 1.3 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        );
      })}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN RITUAL CYCLE CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RitualCycleControl({
  active = false,
  paused = false,
  currentIndex = 0,
  currentHexagram = null,
  progress = 0,
  onStart,
  onStop,
  onTogglePause,
  compact = false,
}) {
  const hex = currentHexagram || HEXAGRAM_REGISTRY[HEXAGRAM_SEQUENCE[currentIndex]];
  
  // Compact mode (just a button)
  if (compact) {
    return (
      <button
        onClick={active ? onStop : onStart}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: active 
            ? 'rgba(255,215,0,0.15)' 
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${active ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color: active ? '#FFD700' : 'rgba(255,255,255,0.6)',
        }}
        data-testid="ritual-cycle-compact"
      >
        <RotateCcw size={14} />
        <span className="text-[10px] uppercase tracking-wider">
          {active ? 'Cycling' : 'Ritual'}
        </span>
      </button>
    );
  }
  
  return (
    <div 
      className="relative p-3 rounded-xl"
      style={{
        background: 'rgba(0,0,0,0.1)',
        backdropFilter: 'none',
        border: `1px solid ${active ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span 
          className="text-[10px] uppercase tracking-wider"
          style={{ color: active ? '#FFD700' : 'rgba(255,255,255,0.4)' }}
        >
          Ritual Cycle
        </span>
        
        {active && (
          <span 
            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              background: paused ? 'rgba(255,100,100,0.2)' : 'rgba(100,255,100,0.2)',
              color: paused ? '#FF6B6B' : '#6BFF6B',
            }}
          >
            {paused ? 'Paused' : 'Running'}
          </span>
        )}
      </div>
      
      {/* Main display */}
      <div className="flex items-center gap-4">
        {/* Progress ring with hexagram */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          {active && (
            <ProgressRing 
              progress={progress} 
              size={56} 
              color={hex?.glowColor || '#FFD700'} 
            />
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={hex?.number}
              className="text-2xl"
              style={{
                color: hex?.glowColor || '#FFFFFF',
                textShadow: active 
                  ? `0 0 10px ${hex?.glowColor || '#FFD700'}` 
                  : 'none',
              }}
              initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
              transition={{ duration: 0.3 }}
            >
              {hex?.symbol || '☰'}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Info column */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={hex?.number}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="text-sm font-medium"
                style={{ color: hex?.glowColor || '#FFFFFF' }}
              >
                {hex?.name}
              </div>
              <div 
                className="text-[10px]"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {hex?.meaning}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Dots indicator */}
          <div className="mt-2">
            <HexagramDots currentIndex={currentIndex} />
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {!active ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))',
              border: '1px solid rgba(255,215,0,0.3)',
              color: '#FFD700',
            }}
            data-testid="ritual-start"
          >
            <Play size={14} fill="currentColor" />
            <span className="text-[10px] uppercase tracking-wider">Begin Cycle</span>
          </button>
        ) : (
          <>
            <button
              onClick={onTogglePause}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.6)',
                color: 'rgba(255,255,255,0.7)',
              }}
              data-testid="ritual-pause"
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            
            <button
              onClick={onStop}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: 'rgba(255,100,100,0.1)',
                border: '1px solid rgba(255,100,100,0.2)',
                color: '#FF6B6B',
              }}
              data-testid="ritual-stop"
            >
              <Square size={14} fill="currentColor" />
            </button>
          </>
        )}
      </div>
      
      {/* Source State indicator */}
      <AnimatePresence>
        {active && paused && hex?.number === 63 && (
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider"
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: '#000',
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            Source State
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ProgressRing, HexagramDots };
