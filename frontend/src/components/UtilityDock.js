/**
 * UtilityDock.js — Unified Bottom-Right Floating Toolbar
 * 
 * Consolidates all bottom-right utility buttons into one clean,
 * collapsible vertical toolbar. Replaces the cluttered overlapping widgets.
 * 
 * Features:
 * - Collapsible/expandable (vertical or horizontal)
 * - Draggable to reposition
 * - Contains: Assistant, Mixer, Quick Actions
 * - Respects other fixed elements (Emergency Stop, SmartDock)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Sliders, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  GripVertical,
  X 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DOCK_ITEMS = [
  { id: 'assistant', icon: MessageCircle, label: 'AI Assistant', color: '#818CF8' },
  { id: 'mixer', icon: Sliders, label: 'Sound Mixer', color: '#FB923C' },
  { id: 'command', icon: Zap, label: 'Quick Actions', color: '#8B5CF6' },
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
  const [position, setPosition] = useState({ bottom: 160, right: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Hide on certain pages (hub, fullscreen experiences)
  const hiddenPaths = ['/hub', '/vr', '/cinematic-intro'];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));

  // Calculate safe position (above SmartDock, below Emergency Stop)
  const safeBottom = Math.max(position.bottom, 160); // At least 160px from bottom for SmartDock
  const safeRight = Math.max(position.right, 16);

  const handleAction = useCallback((id) => {
    switch (id) {
      case 'assistant':
        onOpenAssistant?.();
        break;
      case 'mixer':
        onOpenMixer?.();
        break;
      case 'command':
        onOpenCommand?.();
        break;
      default:
        break;
    }
    // Don't collapse after action - user might want multiple
  }, [onOpenAssistant, onOpenMixer, onOpenCommand]);

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
      right: Math.max(16, Math.min(window.innerWidth - 80, startPosRef.current.right + deltaX)),
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
    return null;
  }

  return (
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
                  background: 'rgba(10, 10, 18, 0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
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
                    background: 'rgba(10, 10, 18, 0.95)',
                    color: item.color,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  {item.label}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className="w-14 h-14 rounded-full flex items-center justify-center relative"
        style={{
          background: expanded 
            ? 'linear-gradient(135deg, rgba(129,140,248,0.2) 0%, rgba(139,92,246,0.2) 100%)'
            : 'rgba(10, 10, 18, 0.9)',
          backdropFilter: 'blur(24px)',
          border: expanded 
            ? '1px solid rgba(129,140,248,0.3)' 
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow: expanded
            ? '0 8px 32px rgba(129,140,248,0.25)'
            : '0 4px 24px rgba(0,0,0,0.5)',
          cursor: isDragging ? 'grabbing' : 'pointer',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="utility-dock-toggle"
      >
        {/* Drag handle indicator */}
        {!expanded && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
            <GripVertical size={12} className="text-white/30" />
          </div>
        )}
        
        {expanded ? (
          <X size={22} className="text-indigo-300" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          </div>
        )}
        
        {/* Active indicator dots */}
        {!expanded && (assistantOpen || mixerOpen) && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a12]" />
        )}
      </motion.button>
    </motion.div>
  );
}
