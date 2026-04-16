import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMeshNetwork } from '../context/MeshNetworkContext';
import { 
  Wind, Timer, Flame, Hand, Music, Sun, Sparkles, Star, Moon, Eye,
  BookOpen, Heart, Headphones, Radio, Leaf, MessageCircle, Users, Zap,
  Calendar, Compass, Globe, Brain, Crown, ChevronRight, X, Link,
} from 'lucide-react';

// Icon mapping for nodes
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
 * GlowPortal — Contextual lateral navigation that appears at screen edges
 * 
 * When a trigger fires (e.g., session_complete), related modules "glow" at 
 * the edge of the screen, offering instant lateral movement without returning
 * to a central hub.
 * 
 * Enhanced with Node Sympathy:
 * - Learned connections glow brighter
 * - Sympathy weight shown as intensity
 * - Strong connections have thicker pulse rings
 */
export default function GlowPortal() {
  const navigate = useNavigate();
  const { glowPortals, dismissGlow, currentNode, getSymPathyWeight, SYMPATHY_CONFIG } = useMeshNetwork();
  const [hoveredPortal, setHoveredPortal] = useState(null);

  if (!glowPortals || glowPortals.length === 0) return null;

  // Position portals along the right edge
  const getPortalPosition = (index, total) => {
    const startY = 35; // Start 35% from top
    const spacing = Math.min(15, 40 / total);
    return startY + (index * spacing);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9990]" data-testid="glow-portals">
      <AnimatePresence>
        {glowPortals.map((portal, index) => {
          const Icon = NODE_ICONS[portal.id] || Sparkles;
          const yPosition = getPortalPosition(index, glowPortals.length);
          const isHovered = hoveredPortal === portal.id;
          
          // Calculate sympathy-enhanced intensity
          const sympathyWeight = portal.sympathyWeight || 
            (currentNode ? getSymPathyWeight?.(currentNode, portal.id) : 0) || 0;
          const isSympathetic = portal.trigger === 'sympathy' || sympathyWeight >= (SYMPATHY_CONFIG?.SYMPATHY_THRESHOLD || 1.0);
          const isStrongSympathy = sympathyWeight >= (SYMPATHY_CONFIG?.STRONG_SYMPATHY_THRESHOLD || 2.0);
          
          // Intensity based on sympathy (0.4 base, up to 1.0 for strong sympathy)
          const glowIntensity = Math.min(1, 0.4 + (sympathyWeight * 0.15));

          return (
            <motion.div
              key={portal.id}
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ 
                x: isHovered ? 0 : isSympathetic ? 8 : 12, 
                opacity: 1, 
                scale: isHovered ? 1.05 : 1,
              }}
              exit={{ x: 100, opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed right-0 pointer-events-auto"
              style={{ top: `${yPosition}%` }}
              onMouseEnter={() => setHoveredPortal(portal.id)}
              onMouseLeave={() => setHoveredPortal(null)}
              data-testid={`glow-portal-${portal.id}`}
            >
              {/* Outer Sympathy Ring (for strong connections) */}
              {isStrongSympathy && (
                <motion.div
                  className="absolute -inset-2 rounded-l-3xl"
                  style={{
                    background: `radial-gradient(ellipse at right, ${portal.color}30 0%, transparent 60%)`,
                    filter: 'blur(12px)',
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-l-2xl"
                style={{
                  background: `radial-gradient(ellipse at right, ${portal.color}${Math.round(glowIntensity * 60).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
                animate={{
                  opacity: [glowIntensity * 0.4, glowIntensity * 0.7, glowIntensity * 0.4],
                }}
                transition={{
                  duration: isSympathetic ? 1.5 : 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Portal Button */}
              <motion.button
                onClick={() => {
                  dismissGlow(portal.id);
                  navigate(portal.path);
                }}
                className="relative flex items-center gap-2 pl-4 pr-3 py-3 rounded-l-2xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${portal.color}${isSympathetic ? '20' : '15'} 0%, ${portal.color}08 100%)`,
                  border: `1px solid ${portal.color}${isSympathetic ? '40' : '30'}`,
                  borderRight: 'none',
                  boxShadow: `0 4px 24px ${portal.color}${Math.round(glowIntensity * 40).toString(16).padStart(2, '0')}, inset 0 1px 0 ${portal.color}10`,
                }}
                whileHover={{ x: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Sympathy Indicator */}
                {isSympathetic && (
                  <motion.div
                    className="absolute -top-1 -left-1 w-3 h-3 rounded-full flex items-center justify-center"
                    style={{ 
                      background: isStrongSympathy ? portal.color : `${portal.color}80`,
                      boxShadow: `0 0 8px ${portal.color}`,
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Link size={6} color="#fff" />
                  </motion.div>
                )}

                {/* Pulsing Icon */}
                <motion.div
                  className="relative"
                  animate={{
                    scale: isSympathetic ? [1, 1.2, 1] : [1, 1.15, 1],
                  }}
                  transition={{
                    duration: isSympathetic ? 1.2 : 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon size={18} style={{ color: portal.color }} />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: portal.color }}
                    animate={{ scale: [1, 2, 1], opacity: [glowIntensity * 0.5, 0, glowIntensity * 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>

                {/* Label (visible on hover) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      <span className="text-[11px] font-medium" style={{ color: portal.color }}>
                        {portal.label}
                      </span>
                      {isSympathetic && (
                        <span className="text-[9px] ml-1 opacity-60" style={{ color: portal.color }}>
                          •{Math.round(sympathyWeight * 100)}%
                        </span>
                      )}
                      <ChevronRight size={12} style={{ color: portal.color }} className="inline ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dismiss Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissGlow(portal.id);
                  }}
                  className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'rgba(0,0,0,0.15)', 
                    border: `1px solid ${portal.color}40`,
                  }}
                  whileHover={{ scale: 1.2 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered && !isSympathetic ? 1 : 0 }}
                >
                  <X size={8} style={{ color: 'rgba(255,255,255,0.7)' }} />
                </motion.button>
              </motion.button>

              {/* Connection Line to Current Context */}
              <motion.div
                className="absolute right-full top-1/2 h-px"
                style={{ 
                  background: `linear-gradient(to left, ${portal.color}${isSympathetic ? '60' : '40'}, transparent)`,
                  width: isHovered ? '60px' : isSympathetic ? '45px' : '30px',
                }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Ambient Glow Indicator */}
      {glowPortals.length > 0 && (
        <motion.div
          className="fixed right-0 top-1/2 -translate-y-1/2 w-1 rounded-l-full pointer-events-none"
          style={{
            height: `${Math.min(30, glowPortals.length * 12)}%`,
            background: `linear-gradient(to bottom, ${glowPortals[0]?.color}60, transparent)`,
            filter: 'blur(8px)',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </div>
  );
}

/**
 * GlowTrigger — Hook to trigger glow portals from within modules
 */
export function useGlowTrigger() {
  const { triggerGlow, sendPulse, sendPulseEcho, PULSE_TYPES, currentNode } = useMeshNetwork();

  const onSessionComplete = (sessionType) => {
    triggerGlow('session_complete');
    sendPulse(PULSE_TYPES.SESSION_COMPLETE, { sessionType, completedAt: Date.now() });
    // Send pulse echo to visualize the ripple
    if (currentNode) {
      sendPulseEcho(currentNode, { sessionType, intensity: 0.9 });
    }
  };

  const onInsightGenerated = (insight) => {
    triggerGlow('insight_generated');
    sendPulse(PULSE_TYPES.INSIGHT_GENERATED, { insight });
    if (currentNode) {
      sendPulseEcho(currentNode, { type: 'insight', intensity: 0.7 });
    }
  };

  const onMoodChanged = (mood) => {
    if (mood <= 3) {
      triggerGlow('mood_low');
    }
    sendPulse(PULSE_TYPES.MOOD_CHANGED, { mood });
    if (currentNode) {
      sendPulseEcho(currentNode, { mood, intensity: 0.6 });
    }
  };

  const onQuestionAsked = (question) => {
    triggerGlow('question_asked');
    sendPulse(PULSE_TYPES.QUESTION_ASKED, { question });
  };

  const onMorningRoutine = () => {
    triggerGlow('morning_routine');
  };

  const onStressDetected = () => {
    triggerGlow('stress_detected');
  };

  return {
    onSessionComplete,
    onInsightGenerated,
    onMoodChanged,
    onQuestionAsked,
    onMorningRoutine,
    onStressDetected,
    triggerGlow,
    sendPulseEcho,
  };
}
