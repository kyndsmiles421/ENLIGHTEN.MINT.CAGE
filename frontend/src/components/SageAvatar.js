/**
 * SageAvatar.js — The "Holographic Presence" Floating Sage Avatar
 * 
 * A pulsing crystalline form that appears in the UtilityDock area
 * when entering a Sage's zone. Clicking opens the Audience modal.
 * 
 * Part of The Enlightenment Cafe's Expert Advisor System.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSages, getZoneSage } from '../context/SageContext';

export default function SageAvatar() {
  const location = useLocation();
  const { 
    sageGreeting, 
    currentSage, 
    summonSage, 
    openAudience, 
    dismissGreeting,
    isLoading,
  } = useSages();
  
  const [visible, setVisible] = useState(false);
  const [lastZone, setLastZone] = useState(null);

  // Detect zone changes and summon appropriate Sage
  useEffect(() => {
    const sage = getZoneSage(location.pathname);
    
    // Only summon if entering a new zone
    if (sage && sage.id !== lastZone) {
      setLastZone(sage.id);
      summonSage(sage.id);
      setVisible(true);
    }
  }, [location.pathname, lastZone, summonSage]);

  // Auto-hide after 10 seconds if not interacted with
  useEffect(() => {
    if (sageGreeting && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [sageGreeting, visible]);

  const handleOpenAudience = () => {
    if (currentSage) {
      openAudience(currentSage.id);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissGreeting();
    setVisible(false);
  };

  if (!currentSage || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-[9985] flex items-end gap-3"
        style={{ bottom: 240, right: 16 }}
        initial={{ opacity: 0, x: 50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.8 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        data-testid="sage-avatar"
      >
        {/* Greeting Bubble */}
        {sageGreeting && (
          <motion.div
            className="max-w-[260px] p-4 rounded-2xl relative"
            style={{
              background: 'rgba(10, 10, 18, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentSage.color}30`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 60px ${currentSage.color}15`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X size={12} className="text-white" />
            </button>
            
            {/* Sage name */}
            <div 
              className="text-xs font-semibold mb-2 flex items-center gap-1.5"
              style={{ color: currentSage.color }}
            >
              <Sparkles size={12} />
              {currentSage.name}
            </div>
            
            {/* Greeting text */}
            <p className="text-sm text-white/90 leading-relaxed">
              {isLoading ? (
                <span className="text-white/50 italic">The Sage stirs...</span>
              ) : (
                sageGreeting
              )}
            </p>
            
            {/* Action button */}
            <button
              onClick={handleOpenAudience}
              className="mt-3 w-full py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${currentSage.color}30, ${currentSage.color}10)`,
                border: `1px solid ${currentSage.color}40`,
                color: currentSage.color,
              }}
              data-testid="sage-audience-btn"
            >
              Request Audience
            </button>
            
            {/* Speech bubble tail */}
            <div
              className="absolute -right-2 bottom-6 w-4 h-4"
              style={{
                background: 'rgba(10, 10, 18, 0.95)',
                borderRight: `1px solid ${currentSage.color}30`,
                borderBottom: `1px solid ${currentSage.color}30`,
                transform: 'rotate(-45deg)',
              }}
            />
          </motion.div>
        )}

        {/* Sage Crystal Avatar */}
        <motion.button
          onClick={handleOpenAudience}
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentSage.color}40, ${currentSage.color}10)`,
            border: `2px solid ${currentSage.color}50`,
            boxShadow: `0 0 30px ${currentSage.color}30, inset 0 0 20px ${currentSage.color}20`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              `0 0 30px ${currentSage.color}30, inset 0 0 20px ${currentSage.color}20`,
              `0 0 50px ${currentSage.color}50, inset 0 0 30px ${currentSage.color}30`,
              `0 0 30px ${currentSage.color}30, inset 0 0 20px ${currentSage.color}20`,
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          data-testid="sage-crystal"
        >
          {/* Inner crystal glow */}
          <div
            className="w-8 h-8 rounded-lg rotate-45"
            style={{
              background: `linear-gradient(135deg, ${currentSage.color}60, ${currentSage.color}20)`,
              boxShadow: `0 0 15px ${currentSage.color}50`,
            }}
          />
          
          {/* Sparkle effects */}
          <motion.div
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: currentSage.color }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
            style={{ background: currentSage.color }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
