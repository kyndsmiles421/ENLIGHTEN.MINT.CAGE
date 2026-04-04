import React, { useCallback, useEffect } from 'react';
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
    console.log('[EmergencyShutOff] HARD KILL INITIATED');
    
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

    // 4. Stop ambient soundscape (the background hum)
    try {
      if (typeof window.__stopAmbientSoundscape === 'function') {
        window.__stopAmbientSoundscape();
      }
    } catch (e) {
      console.warn('Ambient soundscape stop failed:', e);
    }

    // 5. HARD KILL: Close ALL AudioContexts (not just suspend)
    try {
      const contexts = window.__cosmicAudioContexts || [];
      console.log(`[EmergencyShutOff] Closing ${contexts.length} registered AudioContexts`);
      
      contexts.forEach((ctx, i) => {
        if (ctx && ctx.state !== 'closed') {
          try { 
            // Disconnect all nodes first
            if (ctx.destination) {
              ctx.destination.disconnect?.();
            }
            // Force close the context
            ctx.close().then(() => {
              console.log(`[EmergencyShutOff] Closed context ${i}`);
            }).catch(() => {});
          } catch (e) {
            console.warn(`[EmergencyShutOff] Failed to close context ${i}:`, e);
          }
        }
      });
      
      // Clear and null the array
      window.__cosmicAudioContexts = [];
    } catch (e) {
      console.warn('Global audio context close failed:', e);
    }

    // 6. NUCLEAR: Kill any orphaned AudioContexts via React refs
    try {
      ['audioCtxRef', 'ctxRef', 'audioRef', 'oscillatorRef', 'gainRef', 'nodeRef'].forEach(refName => {
        if (window[refName]?.current) {
          const ref = window[refName].current;
          try { 
            if (ref.stop) ref.stop();
            if (ref.disconnect) ref.disconnect();
            if (ref.close) ref.close();
          } catch {}
          window[refName].current = null; // NULL the reference
        }
      });
    } catch (e) {
      console.warn('Reference cleanup failed:', e);
    }

    // 7. Set emergency flag to prevent auto-restart
    localStorage.setItem('zen_emergency_active', 'true');
    localStorage.setItem('zen_audio_muted', 'true');

    // 8. Stop ALL HTML5 audio/video elements and clear sources
    try {
      document.querySelectorAll('audio, video').forEach(el => {
        el.pause();
        el.currentTime = 0;
        el.src = ''; // Clear the source
        el.load(); // Reset the element
      });
    } catch (e) {
      console.warn('HTML5 media stop failed:', e);
    }

    // 9. Cancel any running CSS animations
    try {
      const animations = document.getAnimations?.() || [];
      animations.forEach(anim => anim.cancel());
    } catch (e) {
      // getAnimations not supported in all browsers
    }

    // 10. Haptic feedback to confirm kill
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // Double pulse = confirmed
    }

    console.log('[EmergencyShutOff] HARD KILL COMPLETE - All audio/visual terminated');
  }, [sovereignKillAll, stopMixer, isMuted, sovereignMuteToggle]);

  // Expose globally for debugging/console access
  useEffect(() => {
    window.__emergencyStop = handleEmergencyStop;
    return () => { delete window.__emergencyStop; };
  }, [handleEmergencyStop]);

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
