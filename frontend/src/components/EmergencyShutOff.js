import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import { useMixer } from '../context/MixerContext';

/**
 * Emergency Shut-Off Button
 * - Fixed position: absolute top-left corner
 * - Maximum z-index: 99999
 * - Stops ALL audio, music, and visual loops instantly
 * - Always visible, never covered by any other element
 */
export default function EmergencyShutOff() {
  const { sovereignKillAll, isMuted, sovereignMuteToggle } = useSensory();
  const { stopAll: stopMixer, isPlaying } = useMixer();

  const handleEmergencyStop = useCallback(() => {
    // 1. Kill all sensory audio (SensoryContext)
    try {
      sovereignKillAll();
    } catch (e) {
      console.warn('SensoryContext killAll failed:', e);
    }

    // 2. Stop all mixer layers (MixerContext)
    try {
      stopMixer();
    } catch (e) {
      console.warn('MixerContext stopAll failed:', e);
    }

    // 3. Mute if not already muted
    if (!isMuted) {
      try {
        sovereignMuteToggle();
      } catch (e) {
        console.warn('Mute toggle failed:', e);
      }
    }

    // 4. Stop any Web Audio API contexts globally
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        const contexts = window.__cosmicAudioContexts || [];
        contexts.forEach(ctx => {
          if (ctx && ctx.state !== 'closed') {
            ctx.suspend();
          }
        });
      }
    } catch (e) {
      console.warn('Global audio context suspend failed:', e);
    }

    // 5. Stop all HTML5 audio/video elements
    try {
      document.querySelectorAll('audio, video').forEach(el => {
        el.pause();
        el.currentTime = 0;
      });
    } catch (e) {
      console.warn('HTML5 media stop failed:', e);
    }

    // 6. Cancel any running animations
    try {
      const animations = document.getAnimations?.() || [];
      animations.forEach(anim => anim.cancel());
    } catch (e) {
      // getAnimations not supported in all browsers
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    console.log('[EmergencyShutOff] All audio/visual stopped');
  }, [sovereignKillAll, stopMixer, isMuted, sovereignMuteToggle]);

  return (
    <motion.button
      onClick={handleEmergencyStop}
      className="fixed flex items-center justify-center gap-1.5"
      style={{
        top: 8,
        left: 8,
        zIndex: 99999, // Maximum z-index - above everything
        width: 'auto',
        minWidth: 36,
        height: 36,
        padding: '0 12px',
        borderRadius: 8,
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1.5px solid rgba(239, 68, 68, 0.4)',
        color: '#EF4444',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 2px 12px rgba(239, 68, 68, 0.2)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
      whileHover={{
        scale: 1.05,
        background: 'rgba(239, 68, 68, 0.25)',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.35)',
      }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="emergency-shutoff"
      title="Emergency Stop - Kills all audio and visual loops"
    >
      <Square size={14} fill="currentColor" />
      <span>STOP</span>
    </motion.button>
  );
}
