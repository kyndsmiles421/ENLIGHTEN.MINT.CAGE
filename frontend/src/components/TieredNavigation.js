/**
 * TieredNavigation.js — The Vertical Ascension HUD
 * 
 * A floating left-side vertical navigation that makes users FEEL the climb.
 * 
 * KEY FEATURES:
 * - Color-Shift Blur: Inactive tiers blur out, active tier glows with prismatic border
 * - Gravity-reactive: Icons shift weight/opacity as you ascend
 * - Zero-Point Lexicon Flicker: Labels cycle through languages at 0.48-0.52
 * - Minimal animations for speed — pure state changes
 * 
 * VISUAL HIERARCHY:
 * ┌─────────────────────┐
 * │   MATRIX (Top)      │  ← Prismatic, floating, blur(0) when active
 * ├─────────────────────┤
 * │   CORE (Middle)     │  ← Amber, balanced
 * ├─────────────────────┤
 * │   HOLLOW (Bottom)   │  ← Obsidian, dense, blur(8) when inactive
 * └─────────────────────┘
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePolarity } from '../context/PolarityContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles,
  Sun, 
  Mountain,
  ChevronRight,
  Home,
  BookOpen,
  Heart,
  Star,
  Moon,
  Zap,
  Activity,
  Wind,
  Eye,
  Hexagon,
  Compass,
  Users,
  Target,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER CONFIGURATION — The Mountain to Climb
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIERS = {
  shambhala: {
    id: 'shambhala',
    name: 'Shambhala',
    subtitle: 'Integration',
    icon: Sparkles,
    gravityRange: [0.65, 1.0],
    routes: [
      { path: '/oracle', label: 'Oracle', labelKey: 'nav.oracle', icon: Eye },
      { path: '/tarot', label: 'Tarot', labelKey: 'nav.tarot', icon: Moon },
      { path: '/iching', label: 'I Ching', labelKey: 'nav.iching', icon: Hexagon },
      { path: '/star-chart', label: 'Stars', labelKey: 'nav.stars', icon: Star },
      { path: '/achievements', label: 'Legacy', labelKey: 'nav.legacy', icon: Zap },
    ],
    colors: {
      active: '#FFD700',
      inactive: 'rgba(255, 215, 0, 0.25)',
      bg: 'rgba(255, 215, 0, 0.08)',
      glow: 'rgba(255, 215, 0, 0.5)',
    },
  },
  core: {
    id: 'core',
    name: 'Core',
    subtitle: 'Interaction',
    icon: Sun,
    gravityRange: [0.35, 0.65],
    routes: [
      { path: '/dashboard', label: 'Today', labelKey: 'nav.today', icon: Home },
      { path: '/journal', label: 'Journal', labelKey: 'nav.journal', icon: BookOpen },
      { path: '/mood', label: 'Mood', labelKey: 'nav.mood', icon: Heart },
      { path: '/community', label: 'Circle', labelKey: 'nav.circle', icon: Users },
    ],
    colors: {
      active: '#C9A962',
      inactive: 'rgba(201, 169, 98, 0.25)',
      bg: 'rgba(201, 169, 98, 0.08)',
      glow: 'rgba(201, 169, 98, 0.4)',
    },
  },
  hollow: {
    id: 'hollow',
    name: 'Hollow',
    subtitle: 'Foundation',
    icon: Mountain,
    gravityRange: [0.0, 0.35],
    routes: [
      { path: '/meditation', label: 'Meditate', labelKey: 'nav.meditate', icon: Wind },
      { path: '/breathing', label: 'Breathe', labelKey: 'nav.breathe', icon: Activity },
      { path: '/frequencies', label: 'Frequency', labelKey: 'nav.frequency', icon: Zap },
      { path: '/yoga', label: 'Move', labelKey: 'nav.move', icon: Target },
    ],
    colors: {
      active: '#6B6B8D',
      inactive: 'rgba(107, 107, 141, 0.25)',
      bg: 'rgba(107, 107, 141, 0.08)',
      glow: 'rgba(107, 107, 141, 0.3)',
    },
  },
};

const TIER_ORDER = ['shambhala', 'core', 'hollow']; // Top to bottom (ascending order reversed)

// Lexicon flicker languages for Zero-Point
const FLICKER_LANGS = ['en', 'es', 'ja', 'zh'];
const FLICKER_LABELS = {
  'nav.oracle': { en: 'Oracle', es: 'Oráculo', ja: '神託', zh: '神谕' },
  'nav.tarot': { en: 'Tarot', es: 'Tarot', ja: 'タロット', zh: '塔罗' },
  'nav.iching': { en: 'I Ching', es: 'I Ching', ja: '易経', zh: '易经' },
  'nav.stars': { en: 'Stars', es: 'Estrellas', ja: '星', zh: '星辰' },
  'nav.legacy': { en: 'Legacy', es: 'Legado', ja: '遺産', zh: '遗产' },
  'nav.today': { en: 'Today', es: 'Hoy', ja: '今日', zh: '今天' },
  'nav.journal': { en: 'Journal', es: 'Diario', ja: '日記', zh: '日记' },
  'nav.mood': { en: 'Mood', es: 'Ánimo', ja: '気分', zh: '心情' },
  'nav.circle': { en: 'Circle', es: 'Círculo', ja: '輪', zh: '圈' },
  'nav.meditate': { en: 'Meditate', es: 'Meditar', ja: '瞑想', zh: '冥想' },
  'nav.breathe': { en: 'Breathe', es: 'Respirar', ja: '呼吸', zh: '呼吸' },
  'nav.frequency': { en: 'Frequency', es: 'Frecuencia', ja: '周波数', zh: '频率' },
  'nav.move': { en: 'Move', es: 'Mover', ja: '動く', zh: '运动' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER BUTTON COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TierButton = React.memo(({ 
  tier, 
  isActive, 
  isExpanded,
  onToggle,
  blurAmount,
  flickerLang,
}) => {
  const Icon = tier.icon;
  
  return (
    <motion.button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all relative overflow-hidden"
      style={{
        background: isActive ? tier.colors.bg : 'transparent',
        borderLeft: isActive ? `3px solid ${tier.colors.active}` : '3px solid transparent',
        filter: `blur(${blurAmount}px)`,
        opacity: isActive ? 1 : 0.6 + (1 - blurAmount / 8) * 0.4,
      }}
      whileHover={{ 
        opacity: 1,
        filter: 'blur(0px)',
        background: tier.colors.bg,
      }}
      whileTap={{ scale: 0.98 }}
      data-testid={`tier-btn-${tier.id}`}
    >
      {/* Glow effect for active tier */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at left, ${tier.colors.glow} 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      <Icon 
        size={18} 
        color={isActive ? tier.colors.active : tier.colors.inactive}
        style={{ position: 'relative', zIndex: 1 }}
      />
      
      <div className="flex-1 text-left relative z-10">
        <div 
          className="text-xs font-semibold"
          style={{ color: isActive ? tier.colors.active : tier.colors.inactive }}
        >
          {tier.name}
        </div>
        <div 
          className="text-[9px] uppercase tracking-wider"
          style={{ color: isActive ? `${tier.colors.active}80` : `${tier.colors.inactive}60` }}
        >
          {tier.subtitle}
        </div>
      </div>
      
      <motion.div
        animate={{ rotate: isExpanded ? 90 : 0 }}
        transition={{ duration: 0.15 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <ChevronRight size={14} color={isActive ? tier.colors.active : tier.colors.inactive} />
      </motion.div>
    </motion.button>
  );
});

TierButton.displayName = 'TierButton';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE BUTTON COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RouteButton = React.memo(({ 
  route, 
  tier, 
  isRouteActive,
  onNavigate,
  flickerLang,
}) => {
  const Icon = route.icon;
  
  // Get label - use flicker if active, otherwise current language
  const label = flickerLang && FLICKER_LABELS[route.labelKey]
    ? FLICKER_LABELS[route.labelKey][flickerLang] || route.label
    : route.label;
  
  return (
    <motion.button
      onClick={() => onNavigate(route.path)}
      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
      style={{
        background: isRouteActive ? `${tier.colors.active}15` : 'transparent',
        borderLeft: isRouteActive ? `2px solid ${tier.colors.active}` : '2px solid transparent',
      }}
      whileHover={{
        background: `${tier.colors.active}10`,
        x: 2,
      }}
      whileTap={{ scale: 0.98 }}
      data-testid={`nav-${route.path.slice(1)}`}
    >
      <Icon 
        size={14} 
        color={tier.colors.active}
        style={{ opacity: isRouteActive ? 1 : 0.5 }}
      />
      <span 
        className="text-[11px] flex-1 text-left"
        style={{ 
          color: isRouteActive ? tier.colors.active : `${tier.colors.active}70`,
          fontWeight: isRouteActive ? 500 : 400,
        }}
      >
        {label}
      </span>
      {isRouteActive && (
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: tier.colors.active }}
        />
      )}
    </motion.button>
  );
});

RouteButton.displayName = 'RouteButton';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN VERTICAL HUD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function TieredNavigation({ className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    gravity, 
    layerName, 
    isVoid, 
    isAtZeroPoint,
    supernovaActive,
  } = usePolarity();
  const { language } = useLanguage();
  
  const [expandedTier, setExpandedTier] = useState(null);
  const [flickerLang, setFlickerLang] = useState(null);
  const flickerIntervalRef = useRef(null);
  
  // Determine current tier
  const currentTierKey = useMemo(() => {
    if (gravity >= 0.65) return 'shambhala';
    if (gravity >= 0.35) return 'core';
    return 'hollow';
  }, [gravity]);
  
  // Auto-expand current tier on change
  useEffect(() => {
    setExpandedTier(currentTierKey);
  }, [currentTierKey]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEXICON FLICKER — Zero-Point Spark (0.48-0.52)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    if (isAtZeroPoint && !isVoid) {
      // Start flickering through languages at 50ms
      let langIndex = 0;
      flickerIntervalRef.current = setInterval(() => {
        setFlickerLang(FLICKER_LANGS[langIndex]);
        langIndex = (langIndex + 1) % FLICKER_LANGS.length;
      }, 50);
      
      return () => {
        if (flickerIntervalRef.current) {
          clearInterval(flickerIntervalRef.current);
          setFlickerLang(null);
        }
      };
    } else {
      // Stop flickering, lock to current language
      if (flickerIntervalRef.current) {
        clearInterval(flickerIntervalRef.current);
        flickerIntervalRef.current = null;
      }
      setFlickerLang(null);
    }
  }, [isAtZeroPoint, isVoid, language]);
  
  // Calculate blur for inactive tiers (Color-Shift Blur)
  const getBlurAmount = useCallback((tierKey) => {
    if (tierKey === currentTierKey) return 0;
    // Distance from current tier determines blur
    const tierIndex = TIER_ORDER.indexOf(tierKey);
    const currentIndex = TIER_ORDER.indexOf(currentTierKey);
    const distance = Math.abs(tierIndex - currentIndex);
    return distance * 3; // 0, 3, or 6px blur
  }, [currentTierKey]);
  
  const handleToggle = useCallback((tierKey) => {
    setExpandedTier(prev => prev === tierKey ? null : tierKey);
  }, []);
  
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);
  
  // Gravity percentage for the climb meter
  const gravityPercent = Math.round(gravity * 100);
  
  return (
    <motion.div
      className={`tiered-nav-hud ${className}`}
      style={{
        position: 'fixed',
        left: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 160,
        zIndex: 9980,
        background: 'rgba(8, 8, 15, 0.92)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isVoid ? 0.5 : 1, x: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="tiered-navigation-hud"
    >
      {/* Climb Meter Header */}
      <div 
        className="px-3 py-2 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <Compass 
            size={12} 
            color={TIERS[currentTierKey].colors.active}
            style={{ opacity: 0.8 }}
          />
          <span 
            className="text-[9px] font-medium uppercase tracking-widest"
            style={{ color: TIERS[currentTierKey].colors.active }}
          >
            {isAtZeroPoint ? 'ZERO POINT' : currentTierKey.toUpperCase()}
          </span>
        </div>
        <span 
          className="text-[9px] font-mono"
          style={{ 
            color: isAtZeroPoint 
              ? '#888888' 
              : TIERS[currentTierKey].colors.active,
            opacity: 0.7,
          }}
        >
          {gravityPercent}%
        </span>
      </div>
      
      {/* Vertical Gravity Bar */}
      <div 
        className="mx-3 my-2 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isAtZeroPoint 
              ? '#666666'
              : `linear-gradient(90deg, 
                  ${TIERS.hollow.colors.active} 0%, 
                  ${TIERS.core.colors.active} 50%, 
                  ${TIERS.shambhala.colors.active} 100%
                )`,
          }}
          animate={{ width: `${gravityPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Tier Sections */}
      <div className="p-2 space-y-1">
        {TIER_ORDER.map((tierKey) => {
          const tier = TIERS[tierKey];
          const isActive = currentTierKey === tierKey;
          const isExpanded = expandedTier === tierKey;
          const blurAmount = getBlurAmount(tierKey);
          
          return (
            <div key={tierKey}>
              <TierButton
                tier={tier}
                isActive={isActive}
                isExpanded={isExpanded}
                onToggle={() => handleToggle(tierKey)}
                blurAmount={blurAmount}
                flickerLang={flickerLang}
              />
              
              {/* Expanded Routes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-3 py-1 space-y-0.5">
                      {tier.routes.map((route) => {
                        const isRouteActive = location.pathname.startsWith(route.path);
                        return (
                          <RouteButton
                            key={route.path}
                            route={route}
                            tier={tier}
                            isRouteActive={isRouteActive}
                            onNavigate={handleNavigate}
                            flickerLang={isAtZeroPoint ? flickerLang : null}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Zero-Point Flicker Overlay */}
      <AnimatePresence>
        {isAtZeroPoint && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'rgba(128, 128, 128, 0.1)',
              mixBlendMode: 'overlay',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
      
      {/* Supernova Glow */}
      <AnimatePresence>
        {supernovaActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, 
                rgba(255, 215, 0, 0.2) 0%, 
                transparent 70%
              )`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      {/* VOID Overlay */}
      <AnimatePresence>
        {isVoid && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'transparent' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span 
              className="text-[10px] font-bold tracking-[0.3em]"
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
// COMPACT TIER INDICATOR (For status bars)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function TierIndicator({ size = 'sm' }) {
  const { gravity, layerName, isAtZeroPoint, isVoid } = usePolarity();
  
  const tier = TIERS[layerName] || TIERS.core;
  const Icon = tier.icon;
  
  const sizeConfig = {
    sm: { box: 'w-7 h-7', icon: 12 },
    md: { box: 'w-9 h-9', icon: 16 },
    lg: { box: 'w-11 h-11', icon: 20 },
  };
  
  const config = sizeConfig[size] || sizeConfig.sm;
  
  return (
    <motion.div
      className={`flex items-center justify-center rounded-lg ${config.box}`}
      style={{
        background: isAtZeroPoint ? 'rgba(128,128,128,0.2)' : tier.colors.bg,
        border: `1px solid ${isAtZeroPoint ? 'rgba(128,128,128,0.4)' : tier.colors.glow}`,
        opacity: isVoid ? 0.5 : 1,
      }}
      title={isAtZeroPoint ? 'Zero Point' : `${tier.name}: ${tier.subtitle}`}
      data-testid="tier-indicator"
    >
      <Icon 
        size={config.icon} 
        color={isAtZeroPoint ? '#888888' : tier.colors.active} 
      />
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOBILE FLOATING TOGGLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function FloatingTierToggle({ onToggle, isOpen }) {
  const { gravity, layerName, isAtZeroPoint } = usePolarity();
  const tier = TIERS[layerName] || TIERS.core;
  const Icon = tier.icon;
  
  return (
    <motion.button
      onClick={onToggle}
      className="fixed left-4 bottom-48 z-[9975] flex items-center gap-2 px-3 py-2 rounded-full"
      style={{
        background: isAtZeroPoint ? 'rgba(80,80,80,0.9)' : 'rgba(8,8,15,0.9)',
        backdropFilter: 'none',
        border: `1px solid ${isAtZeroPoint ? 'rgba(128,128,128,0.4)' : tier.colors.glow}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="floating-tier-toggle"
    >
      <Icon size={16} color={isAtZeroPoint ? '#888888' : tier.colors.active} />
      <span 
        className="text-xs font-medium"
        style={{ color: isAtZeroPoint ? '#888888' : tier.colors.active }}
      >
        {isAtZeroPoint ? 'ZERO' : tier.name}
      </span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
        <ChevronRight size={14} color={isAtZeroPoint ? '#888888' : tier.colors.active} />
      </motion.div>
    </motion.button>
  );
}
