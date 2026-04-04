/**
 * TieredNavigation.js — Depth-Sensitive Vertical Navigation
 * 
 * Replaces the flat horizontal navigation with a vertical "Torus Column"
 * that visually represents the three tiers of the app:
 * 
 * ┌─────────────────────┐
 * │   MATRIX (Top)      │  ← Light, prismatic, floating
 * │   Integration       │
 * ├─────────────────────┤
 * │   CORE (Middle)     │  ← Balanced, amber, centered
 * │   Interaction       │
 * ├─────────────────────┤
 * │   HOLLOW (Bottom)   │  ← Dense, obsidian, grounded
 * │   Foundation        │
 * └─────────────────────┘
 * 
 * Features:
 * - Current tier glows brightly, others are dimmed
 * - Gravity affects the "weight" of each tier visually
 * - Smooth transitions with spring physics
 * - Collapsed mode for mobile (shows only current tier)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePolarity } from '../context/PolarityContext';
import { 
  Compass, 
  Mountain, 
  Sun, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Home,
  BookOpen,
  Heart,
  Star,
  Moon,
  Zap,
  Activity,
  Wind,
  Flame,
  Eye,
  Hexagon,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIERS = {
  matrix: {
    name: 'Matrix',
    subtitle: 'Integration',
    icon: Sparkles,
    description: 'Legacy, Vision, Celestial',
    gravityRange: [0.65, 1.0],
    routes: [
      { path: '/oracle', label: 'Oracle', icon: Eye },
      { path: '/tarot', label: 'Tarot', icon: Moon },
      { path: '/iching', label: 'I Ching', icon: Hexagon },
      { path: '/star-chart', label: 'Star Chart', icon: Star },
      { path: '/dreams', label: 'Dreams', icon: Sparkles },
      { path: '/achievements', label: 'Achievements', icon: Zap },
    ],
    colors: {
      bg: 'rgba(20, 20, 35, 0.85)',
      border: 'rgba(255, 215, 0, 0.3)',
      text: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.4)',
      dimmed: 'rgba(255, 215, 0, 0.15)',
    },
  },
  core: {
    name: 'Core',
    subtitle: 'Interaction',
    icon: Sun,
    description: 'Balance, Center, Self',
    gravityRange: [0.35, 0.65],
    routes: [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/journal', label: 'Journal', icon: BookOpen },
      { path: '/mood', label: 'Mood', icon: Heart },
      { path: '/profile', label: 'Profile', icon: Sun },
      { path: '/settings', label: 'Settings', icon: Compass },
    ],
    colors: {
      bg: 'rgba(25, 20, 15, 0.88)',
      border: 'rgba(201, 169, 98, 0.35)',
      text: '#C9A962',
      glow: 'rgba(201, 169, 98, 0.3)',
      dimmed: 'rgba(201, 169, 98, 0.1)',
    },
  },
  hollow: {
    name: 'Hollow',
    subtitle: 'Foundation',
    icon: Mountain,
    description: 'Practice, Mechanics, Ground',
    gravityRange: [0.0, 0.35],
    routes: [
      { path: '/meditation', label: 'Meditation', icon: Wind },
      { path: '/breathing', label: 'Breathing', icon: Activity },
      { path: '/frequencies', label: 'Frequencies', icon: Zap },
      { path: '/mantras', label: 'Mantras', icon: BookOpen },
      { path: '/yoga', label: 'Yoga', icon: Flame },
      { path: '/exercises', label: 'Exercises', icon: Activity },
    ],
    colors: {
      bg: 'rgba(10, 10, 18, 0.92)',
      border: 'rgba(74, 74, 106, 0.4)',
      text: '#6B6B8D',
      glow: 'rgba(74, 74, 106, 0.3)',
      dimmed: 'rgba(74, 74, 106, 0.1)',
    },
  },
};

const TIER_ORDER = ['matrix', 'core', 'hollow']; // Top to bottom

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER SECTION COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TierSection = React.memo(({ 
  tierKey, 
  tier, 
  isActive, 
  isExpanded, 
  onToggle,
  onNavigate,
  currentPath,
  gravity,
}) => {
  const Icon = tier.icon;
  
  // Calculate visual weight based on distance from this tier's center
  const tierCenter = (tier.gravityRange[0] + tier.gravityRange[1]) / 2;
  const distance = Math.abs(gravity - tierCenter);
  const proximity = Math.max(0, 1 - distance * 2); // 1 when at center, 0 when far
  
  const isCurrentRoute = tier.routes.some(r => currentPath.startsWith(r.path));
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Tier Header */}
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all"
        style={{
          background: isActive ? tier.colors.bg : 'transparent',
          border: `1px solid ${isActive ? tier.colors.border : tier.colors.dimmed}`,
          boxShadow: isActive ? `0 0 20px ${tier.colors.glow}` : 'none',
        }}
        whileHover={{ 
          borderColor: tier.colors.border,
          boxShadow: `0 0 15px ${tier.colors.glow}`,
        }}
        whileTap={{ scale: 0.98 }}
        data-testid={`tier-${tierKey}`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: isActive ? 1.1 : 1,
              opacity: isActive ? 1 : 0.5,
            }}
          >
            <Icon size={20} color={tier.colors.text} />
          </motion.div>
          <div className="text-left">
            <div 
              className="text-sm font-semibold tracking-wide"
              style={{ color: isActive ? tier.colors.text : `${tier.colors.text}80` }}
            >
              {tier.name}
            </div>
            <div 
              className="text-[10px] tracking-wider uppercase"
              style={{ color: `${tier.colors.text}60` }}
            >
              {tier.subtitle}
            </div>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} color={tier.colors.text} style={{ opacity: 0.6 }} />
        </motion.div>
      </motion.button>
      
      {/* Expanded Routes */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 px-2 space-y-1">
              {tier.routes.map((route) => {
                const RouteIcon = route.icon;
                const isRouteActive = currentPath.startsWith(route.path);
                
                return (
                  <motion.button
                    key={route.path}
                    onClick={() => onNavigate(route.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all"
                    style={{
                      background: isRouteActive 
                        ? `${tier.colors.text}15` 
                        : 'transparent',
                      borderLeft: isRouteActive 
                        ? `2px solid ${tier.colors.text}` 
                        : '2px solid transparent',
                    }}
                    whileHover={{
                      background: `${tier.colors.text}10`,
                      x: 4,
                    }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`nav-${route.path.slice(1)}`}
                  >
                    <RouteIcon 
                      size={14} 
                      color={tier.colors.text} 
                      style={{ opacity: isRouteActive ? 1 : 0.5 }}
                    />
                    <span 
                      className="text-xs"
                      style={{ 
                        color: isRouteActive ? tier.colors.text : `${tier.colors.text}70`,
                        fontWeight: isRouteActive ? 500 : 400,
                      }}
                    >
                      {route.label}
                    </span>
                    
                    {isRouteActive && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: tier.colors.text }}
                        layoutId="activeIndicator"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Proximity glow bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ background: tier.colors.text }}
        animate={{
          opacity: proximity,
          scaleY: 0.3 + proximity * 0.7,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
});

TierSection.displayName = 'TierSection';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN TIERED NAVIGATION COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function TieredNavigation({ 
  collapsed = false,
  onNavigate: externalNavigate,
  className = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { gravity, layerName, isVoid, colors, supernovaActive } = usePolarity();
  
  const [expandedTier, setExpandedTier] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  
  // Determine current tier based on gravity
  const currentTierKey = useMemo(() => {
    if (gravity >= 0.65) return 'matrix';
    if (gravity >= 0.35) return 'core';
    return 'hollow';
  }, [gravity]);
  
  // Auto-expand current tier
  React.useEffect(() => {
    if (!expandedTier) {
      setExpandedTier(currentTierKey);
    }
  }, [currentTierKey]);
  
  const handleToggle = useCallback((tierKey) => {
    setExpandedTier(prev => prev === tierKey ? null : tierKey);
  }, []);
  
  const handleNavigate = useCallback((path) => {
    if (externalNavigate) {
      externalNavigate(path);
    } else {
      navigate(path);
    }
  }, [navigate, externalNavigate]);
  
  // Gravity position indicator (0-100%)
  const gravityPercent = (gravity * 100).toFixed(0);
  
  return (
    <motion.div
      className={`tiered-navigation ${className}`}
      style={{
        width: isCollapsed ? 60 : 220,
        background: 'rgba(8, 8, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
      }}
      data-testid="tiered-navigation"
    >
      {/* Header with Gravity Meter */}
      <div 
        className="px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: colors.accent }}
          >
            Depth
          </span>
          <span 
            className="text-[10px] font-mono"
            style={{ color: colors.accent, opacity: 0.7 }}
          >
            {gravityPercent}%
          </span>
        </div>
        
        {/* Vertical Gravity Meter */}
        <div 
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, 
                ${TIERS.hollow.colors.text} 0%, 
                ${TIERS.core.colors.text} 50%, 
                ${TIERS.matrix.colors.text} 100%
              )`,
            }}
            animate={{ width: `${gravityPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Current position marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2"
            style={{
              background: colors.lineColor,
              borderColor: 'rgba(0,0,0,0.3)',
              boxShadow: `0 0 8px ${colors.lineEmissive}`,
            }}
            animate={{ left: `calc(${gravityPercent}% - 4px)` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {/* Tier Sections */}
      <div className="p-3 space-y-2">
        {TIER_ORDER.map((tierKey) => (
          <TierSection
            key={tierKey}
            tierKey={tierKey}
            tier={TIERS[tierKey]}
            isActive={currentTierKey === tierKey}
            isExpanded={expandedTier === tierKey}
            onToggle={() => handleToggle(tierKey)}
            onNavigate={handleNavigate}
            currentPath={location.pathname}
            gravity={gravity}
          />
        ))}
      </div>
      
      {/* Supernova indicator */}
      <AnimatePresence>
        {supernovaActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at center, 
                rgba(255, 215, 0, 0.1) 0%, 
                transparent 70%
              )`,
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Void overlay */}
      <AnimatePresence>
        {isVoid && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span 
              className="text-xs font-bold tracking-widest"
              style={{ color: '#EF4444' }}
            >
              VOID
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPACT TIER INDICATOR (For toolbars)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function TierIndicator({ size = 'sm' }) {
  const { gravity, layerName, colors } = usePolarity();
  
  const tier = TIERS[layerName] || TIERS.core;
  const Icon = tier.icon;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
  };
  
  return (
    <motion.div
      className={`flex items-center justify-center rounded-lg ${sizeClasses[size]}`}
      style={{
        background: tier.colors.bg,
        border: `1px solid ${tier.colors.border}`,
        boxShadow: `0 0 10px ${tier.colors.glow}`,
      }}
      title={`${tier.name}: ${tier.description}`}
      data-testid="tier-indicator"
      whileHover={{ scale: 1.05 }}
    >
      <Icon size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} color={tier.colors.text} />
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOATING TIER TOGGLE (Mobile)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function FloatingTierToggle({ onToggle, isOpen }) {
  const { gravity, layerName, colors } = usePolarity();
  const tier = TIERS[layerName] || TIERS.core;
  const Icon = tier.icon;
  
  return (
    <motion.button
      onClick={onToggle}
      className="fixed left-4 top-20 z-[9980] flex items-center gap-2 px-3 py-2 rounded-full"
      style={{
        background: tier.colors.bg,
        border: `1px solid ${tier.colors.border}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 15px ${tier.colors.glow}`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="floating-tier-toggle"
    >
      <Icon size={16} color={tier.colors.text} />
      <span 
        className="text-xs font-medium"
        style={{ color: tier.colors.text }}
      >
        {tier.name}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        <ChevronUp size={14} color={tier.colors.text} style={{ opacity: 0.6 }} />
      </motion.div>
    </motion.button>
  );
}
