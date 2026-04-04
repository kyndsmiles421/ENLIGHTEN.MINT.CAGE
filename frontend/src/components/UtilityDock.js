/**
 * UtilityDock.js — Unified Bottom-Right Floating Toolbar
 * 
 * Consolidates all bottom-right utility buttons into one clean,
 * collapsible vertical toolbar with the 360° Hexagram Compass.
 * 
 * Features:
 * - The Gyroscopic Hexagram Compass (replaces Quick Actions)
 * - Collapsible/expandable vertical toolbar
 * - Draggable to reposition
 * - Contains: Assistant, Mixer, Compass
 * - Respects Emergency Stop and Polarity state
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Sliders, 
  GripVertical,
  X,
  Compass,
  RotateCcw
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import HexagramCompass, { HexagramIndicator, SupernovaOverlay } from './HexagramCompass';
import { usePolarity } from '../context/PolarityContext';
import RitualCycleControl from './RitualCycleControl';
import { useSentientRegistryV2 } from '../hooks/useSentientRegistryV2';

const DOCK_ITEMS = [
  { id: 'assistant', icon: MessageCircle, label: 'AI Assistant', color: '#818CF8' },
  { id: 'mixer', icon: Sliders, label: 'Sound Mixer', color: '#FB923C' },
];

export default function UtilityDock({ 
  onOpenAssistant, 
  onOpenMixer, 
  onOpenCommand,
  assistantOpen = false,
  mixerOpen = false,
}) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [compassExpanded, setCompassExpanded] = useState(false);
  const [position, setPosition] = useState({ bottom: 160, right: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  const { 
    colors, 
    gravity, 
    hexagram,
    hexagramBinary,
    isVoid,
    supernovaActive,
    layerName,
    isInHollow,
    isInMatrix,
    isAtZeroPoint,
    manualGravityEnabled,
    manualGravityValue,
    enableManualGravity,
    setManualGravity,
    toggleZeroPointMode,
  } = usePolarity();

  // Ritual Cycle from Sentient Registry V2
  const {
    ritualActive,
    ritualIndex,
    ritualPaused,
    currentRitualHexagram,
    ritualProgress,
    startRitualCycle,
    stopRitualCycle,
  } = useSentientRegistryV2({
    gravity,
    isAtZeroPoint,
    isVoid,
  });
  
  // Toggle ritual pause
  const toggleRitualPause = useCallback(() => {
    // This would need to be implemented in the registry
    // For now, stop acts as toggle when active
    if (ritualActive) {
      stopRitualCycle();
    }
  }, [ritualActive, stopRitualCycle]);

  // Hide on certain pages (hub, fullscreen experiences)
  const hiddenPaths = ['/hub', '/vr', '/cinematic-intro', '/intro'];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));

  // Calculate safe position (above SmartDock, below Emergency Stop)
  const safeBottom = Math.max(position.bottom, 160);
  const safeRight = Math.max(position.right, 16);

  const handleAction = useCallback((id) => {
    switch (id) {
      case 'assistant':
        onOpenAssistant?.();
        break;
      case 'mixer':
        onOpenMixer?.();
        break;
      default:
        break;
    }
  }, [onOpenAssistant, onOpenMixer]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPosRef.current = { 
      x: clientX, 
      y: clientY,
      bottom: position.bottom,
      right: position.right,
    };
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = startPosRef.current.x - clientX;
    const deltaY = clientY - startPosRef.current.y;
    
    setPosition({
      bottom: Math.max(160, Math.min(window.innerHeight - 200, startPosRef.current.bottom - deltaY)),
      right: Math.max(16, Math.min(window.innerWidth - 100, startPosRef.current.right + deltaX)),
    });
  }, [isDragging]);

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove]);

  // Return null if we should hide (after all hooks are called)
  if (shouldHide) {
    return <SupernovaOverlay />;
  }

  // Dynamic border color based on layer
  const borderColor = isVoid 
    ? 'rgba(239, 68, 68, 0.3)' 
    : isInHollow 
      ? 'rgba(74, 74, 106, 0.4)' 
      : isInMatrix 
        ? 'rgba(255, 215, 0, 0.3)' 
        : 'rgba(201, 169, 98, 0.25)';

  return (
    <>
      {/* Supernova Overlay - renders full-screen during transition */}
      <SupernovaOverlay />
      
      <motion.div
        className="fixed z-[9990] flex flex-col items-center gap-2"
        style={{
          bottom: safeBottom,
          right: safeRight,
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        data-testid="utility-dock"
      >
        {/* Expanded Actions */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="flex flex-col gap-2 mb-2"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {DOCK_ITEMS.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleAction(item.id)}
                  className="relative w-12 h-12 rounded-full flex items-center justify-center group"
                  style={{
                    background: colors.background,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${borderColor}`,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 15px ${colors.glow}`,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.1,
                    borderColor: `${item.color}50`,
                    boxShadow: `0 4px 24px ${item.color}30`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`utility-dock-${item.id}`}
                >
                  <item.icon size={20} color={item.color} />
                  
                  {/* Tooltip */}
                  <div
                    className="absolute right-full mr-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: colors.background,
                      color: item.color,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    {item.label}
                  </div>
                </motion.button>
              ))}
              
              {/* Hexagram Compass (expanded view) */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className="p-2 rounded-xl"
                  style={{
                    background: colors.background,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${borderColor}`,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 15px ${colors.glow}`,
                  }}
                >
                  <HexagramCompass 
                    size={70} 
                    showLabels={true}
                    interactive={true}
                  />
                </div>
                
                {/* Layer indicator */}
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase"
                  style={{
                    background: colors.background,
                    color: isAtZeroPoint ? '#888888' : colors.accent,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  {isAtZeroPoint ? 'ZERO' : layerName}
                </div>
              </motion.div>
              
              {/* Gravity Slider — Manual Zero Point Control */}
              <motion.div
                className="relative w-full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.15 }}
              >
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: colors.background,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isAtZeroPoint ? 'rgba(255,255,255,0.3)' : borderColor}`,
                    boxShadow: isAtZeroPoint 
                      ? '0 0 20px rgba(255,255,255,0.2)' 
                      : `0 4px 20px rgba(0,0,0,0.4)`,
                  }}
                >
                  {/* Zero Point Toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-[9px] uppercase tracking-wider"
                      style={{ color: manualGravityEnabled ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                    >
                      Manual Gravity
                    </span>
                    <button
                      onClick={toggleZeroPointMode}
                      className="px-2 py-0.5 rounded text-[8px] uppercase tracking-wider transition-all"
                      style={{
                        background: isAtZeroPoint ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        color: isAtZeroPoint ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${isAtZeroPoint ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                      data-testid="zero-point-toggle"
                    >
                      {isAtZeroPoint ? 'ZERO POINT' : 'GO TO 0.50'}
                    </button>
                  </div>
                  
                  {/* Gravity Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={manualGravityEnabled ? manualGravityValue * 100 : gravity * 100}
                      onChange={(e) => {
                        enableManualGravity(true);
                        setManualGravity(parseFloat(e.target.value) / 100);
                      }}
                      className="w-full h-2 appearance-none cursor-pointer rounded-full"
                      style={{
                        background: `linear-gradient(to right, 
                          #8B4513 0%, 
                          #C9A962 48%, 
                          ${isAtZeroPoint ? '#FFFFFF' : '#888888'} 50%, 
                          #C9A962 52%, 
                          #FFD700 100%)`,
                        accentColor: isAtZeroPoint ? '#FFFFFF' : colors.accent,
                      }}
                      data-testid="gravity-slider"
                    />
                    
                    {/* Zero Point marker */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 pointer-events-none"
                      style={{
                        left: '50%',
                        background: isAtZeroPoint ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                        boxShadow: isAtZeroPoint ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                      }}
                    />
                  </div>
                  
                  {/* Gravity Value Display */}
                  <div className="flex justify-between mt-1 text-[8px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>Hollow</span>
                    <span style={{ 
                      color: isAtZeroPoint ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                      fontWeight: isAtZeroPoint ? 'bold' : 'normal',
                    }}>
                      {(gravity * 100).toFixed(1)}%
                    </span>
                    <span>Matrix</span>
                  </div>
                  
                  {/* Reset to Route button */}
                  {manualGravityEnabled && (
                    <button
                      onClick={() => enableManualGravity(false)}
                      className="w-full mt-2 py-1 rounded text-[8px] uppercase tracking-wider transition-all hover:bg-opacity-20"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      data-testid="reset-gravity"
                    >
                      Reset to Route Gravity
                    </button>
                  )}
                </div>
              </motion.div>
              
              {/* Ritual Cycle Control — Digital Prayer Wheel */}
              <motion.div
                className="relative w-full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
              >
                <RitualCycleControl
                  active={ritualActive}
                  paused={ritualPaused}
                  currentIndex={ritualIndex}
                  currentHexagram={currentRitualHexagram}
                  progress={ritualProgress}
                  onStart={startRitualCycle}
                  onStop={stopRitualCycle}
                  onTogglePause={toggleRitualPause}
                  compact={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button with Hexagram Indicator */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className="w-14 h-14 rounded-full flex items-center justify-center relative"
          style={{
            background: expanded 
              ? `linear-gradient(135deg, ${colors.background} 0%, rgba(201, 169, 98, 0.15) 100%)`
              : colors.background,
            backdropFilter: 'blur(24px)',
            border: expanded 
              ? `1px solid ${colors.accent}40` 
              : `1px solid ${borderColor}`,
            boxShadow: expanded
              ? `0 8px 32px ${colors.glow}, 0 0 20px ${colors.glow}`
              : `0 4px 24px rgba(0,0,0,0.5), 0 0 10px ${colors.glow}`,
            cursor: isDragging ? 'grabbing' : 'pointer',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="utility-dock-toggle"
        >
          {/* Drag handle indicator */}
          {!expanded && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <GripVertical size={12} style={{ color: colors.accent, opacity: 0.3 }} />
            </div>
          )}
          
          {expanded ? (
            <X size={22} style={{ color: colors.accent }} />
          ) : (
            <HexagramIndicator size={28} />
          )}
          
          {/* Active indicator dots */}
          {!expanded && (assistantOpen || mixerOpen) && (
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
              style={{
                background: '#22C55E',
                borderColor: colors.background,
              }}
            />
          )}
          
          {/* Supernova glow effect */}
          <AnimatePresence>
            {supernovaActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)`,
                }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 1 }}
              />
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* Gravity indicator bar */}
        <div
          className="w-10 h-1 rounded-full overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.1)',
          }}
          title={`Gravity: ${(gravity * 100).toFixed(0)}%`}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.lineEmissive} 0%, ${colors.lineColor} 100%)`,
            }}
            animate={{
              width: `${gravity * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </>
  );
}
