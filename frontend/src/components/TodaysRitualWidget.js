import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCelestialEvents, useGhostNodes, MOON_PHASES } from '../hooks/useCelestialEvents';
import { useEnlightenmentCafe } from '../context/EnlightenmentCafeContext';
import { 
  Moon, Sun, Sparkles, Clock, ChevronRight, ChevronDown, ChevronUp,
  Timer, BookOpen, Heart, Zap,
} from 'lucide-react';

/**
 * TodaysRitualWidget — Displays current celestial state and ritual suggestions
 * 
 * This is the visual representation of Sprint 3: The Ghost Layer.
 * Shows:
 * - Current Moon Phase + Sign
 * - Today's suggested ritual based on celestial positions
 * - Upcoming celestial events (Full Moon, New Moon, Mercury Rx)
 * - Ghost Nodes that appear during special events
 */
export default function TodaysRitualWidget({ compact = false }) {
  const navigate = useNavigate();
  const celestial = useCelestialEvents();
  const { ghostNodes } = useGhostNodes();
  const { viewTier, colorMode, getPalette } = useEnlightenmentCafe();
  const [expanded, setExpanded] = useState(!compact);

  const palette = getPalette();
  const isParchment = viewTier === 'parchment';
  const isLight = colorMode === 'light';

  const cardStyle = isParchment
    ? {
        background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(42, 42, 46, 0.95)',
        border: `1px solid ${isLight ? '#E8E4DC' : '#3A3A3E'}`,
        boxShadow: isLight 
          ? '0 4px 12px rgba(42, 42, 42, 0.06)' 
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
      }
    : {
        background: 'rgba(20, 20, 30, 0.9)',
        border: '1px solid rgba(129, 140, 248, 0.15)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      };

  const textPrimary = isParchment 
    ? (isLight ? '#2A2A2A' : '#F5F2ED')
    : '#F8FAFC';

  const textMuted = isParchment
    ? (isLight ? '#5A5A5A' : '#C4C0B8')
    : 'rgba(255, 255, 255, 0.6)';

  const gold = palette.gold || '#C9A962';

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={cardStyle}
      data-testid="todays-ritual-widget"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ borderBottom: expanded ? `1px solid ${isLight ? '#E8E4DC' : '#3A3A3E'}` : 'none' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="text-2xl"
            title={celestial.moon.phase.name}
          >
            {celestial.moon.phase.emoji}
          </div>
          <div className="text-left">
            <h3 
              className="text-sm font-semibold"
              style={{ 
                color: textPrimary,
                fontFamily: isParchment ? "'Playfair Display', serif" : 'inherit',
              }}
            >
              Today's Ritual
            </h3>
            <p className="text-[10px]" style={{ color: textMuted }}>
              {celestial.moon.phase.name} in {celestial.moon.sign.symbol} {celestial.moon.sign.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ghostNodes.length > 0 && (
            <span 
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: `${gold}20`, color: gold }}
            >
              {ghostNodes.length} event{ghostNodes.length !== 1 ? 's' : ''}
            </span>
          )}
          {expanded ? (
            <ChevronUp size={14} style={{ color: textMuted }} />
          ) : (
            <ChevronDown size={14} style={{ color: textMuted }} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            {/* Moon Info Grid */}
            <div className="grid grid-cols-3 gap-2 py-3">
              {/* Moon Phase */}
              <div className="text-center">
                <div className="text-3xl mb-1">{celestial.moon.phase.emoji}</div>
                <p className="text-[9px] font-medium" style={{ color: textPrimary }}>
                  {celestial.moon.phase.name}
                </p>
                <p className="text-[8px]" style={{ color: textMuted }}>
                  {celestial.moon.illumination}% illuminated
                </p>
              </div>

              {/* Moon Sign */}
              <div className="text-center">
                <div className="text-3xl mb-1">{celestial.moon.sign.symbol}</div>
                <p className="text-[9px] font-medium" style={{ color: textPrimary }}>
                  {celestial.moon.sign.name}
                </p>
                <p className="text-[8px]" style={{ color: textMuted }}>
                  {celestial.moon.sign.element} sign
                </p>
              </div>

              {/* Sun Sign */}
              <div className="text-center">
                <div className="text-3xl mb-1">{celestial.sun.sign.symbol}</div>
                <p className="text-[9px] font-medium" style={{ color: textPrimary }}>
                  {celestial.sun.sign.name}
                </p>
                <p className="text-[8px]" style={{ color: textMuted }}>
                  Sun position
                </p>
              </div>
            </div>

            {/* Daily Ritual Suggestion */}
            <div 
              className="p-3 rounded-xl mb-3"
              style={{ 
                background: isParchment
                  ? (isLight ? '#FAF8F5' : '#222225')
                  : 'rgba(129, 140, 248, 0.05)',
                border: `1px solid ${isParchment ? (isLight ? '#E8E4DC' : '#3A3A3E') : 'rgba(129, 140, 248, 0.1)'}`,
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <Sparkles size={14} style={{ color: gold, marginTop: 2 }} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: gold }}>
                    Suggested Practice
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: textPrimary }}>
                    {celestial.ritual.primary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[9px]" style={{ color: textMuted }}>
                  <Timer size={10} />
                  {celestial.ritual.duration}
                </span>
                <span 
                  className="text-[9px] px-1.5 py-0.5 rounded capitalize"
                  style={{ 
                    background: `${gold}15`, 
                    color: gold,
                  }}
                >
                  {celestial.ritual.intensity}
                </span>
              </div>
            </div>

            {/* Ghost Nodes (Active Celestial Events) */}
            {ghostNodes.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: textMuted }}>
                  Active Celestial Events
                </p>
                {ghostNodes.map(ghost => (
                  <motion.div
                    key={ghost.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{
                      background: `${ghost.color}10`,
                      border: `1px solid ${ghost.color}25`,
                    }}
                  >
                    <span className="text-lg">{ghost.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium" style={{ color: ghost.color }}>
                        {ghost.label}
                      </p>
                      <p className="text-[9px] truncate" style={{ color: textMuted }}>
                        {ghost.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Upcoming Events */}
            {celestial.upcomingEvents.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: textMuted }}>
                  Coming Soon
                </p>
                {celestial.upcomingEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-sm">{event.emoji}</span>
                    <span className="text-[10px] flex-1" style={{ color: textPrimary }}>
                      {event.name}
                    </span>
                    {event.daysAway > 0 && (
                      <span className="text-[9px]" style={{ color: textMuted }}>
                        in {event.daysAway} day{event.daysAway !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${isLight ? '#E8E4DC' : '#3A3A3E'}` }}>
              <button
                onClick={() => navigate('/meditation')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                style={{ 
                  background: `${gold}15`,
                  color: gold,
                }}
              >
                <Timer size={12} />
                Meditate
              </button>
              <button
                onClick={() => navigate('/journal')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                style={{ 
                  background: isParchment ? (isLight ? '#F5F2ED' : '#2A2A2E') : 'rgba(255,255,255,0.05)',
                  color: textPrimary,
                }}
              >
                <BookOpen size={12} />
                Journal
              </button>
              <button
                onClick={() => navigate('/oracle')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                style={{ 
                  background: isParchment ? (isLight ? '#F5F2ED' : '#2A2A2E') : 'rgba(255,255,255,0.05)',
                  color: textPrimary,
                }}
              >
                <Sparkles size={12} />
                Oracle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * MoonPhaseIcon — Compact moon phase indicator
 */
export function MoonPhaseIcon({ size = 24 }) {
  const celestial = useCelestialEvents();
  
  return (
    <span 
      className="inline-block" 
      style={{ fontSize: size }}
      title={`${celestial.moon.phase.name} in ${celestial.moon.sign.name}`}
    >
      {celestial.moon.phase.emoji}
    </span>
  );
}

/**
 * CelestialBadge — Small badge showing current celestial state
 */
export function CelestialBadge() {
  const celestial = useCelestialEvents();
  const { ghostNodes } = useGhostNodes();
  
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span>{celestial.moon.phase.emoji}</span>
      <span>{celestial.moon.sign.symbol}</span>
      {ghostNodes.length > 0 && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      )}
    </div>
  );
}
