import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import { useMixer } from '../context/MixerContext';
import { usePolarity } from '../context/PolarityContext';
import { useLanguage } from '../context/LanguageContext';
import { masterReboot } from '../engines/MasterReboot';
import { triggerEmergencyStop } from '../utils/SovereignRouter';

/**
 * Emergency Shut-Off Button — GRAVITATIONAL COLLAPSE
 * 
 * The Iron Law in its purest form — total authority over the ecosystem.
 * 
 * - Fixed position: absolute top-left corner
 * - Maximum z-index: 99999
 * - GRAVITATIONAL COLLAPSE: Hexagram implodes to 000000
 * - Cuts ALL audio, freezes ALL Sages, stops ALL visual loops
 * - Always visible, never covered by any other element
 */
export default function EmergencyShutOff() {
  const { sovereignKillAll, isMuted, sovereignMuteToggle } = useSensory();
  const { stopAll: stopMixer, isPlaying } = useMixer();
  const { activateVoid, isVoid, audioFlavor, freezeCompass, isAtZeroPoint } = usePolarity();
  const { vibrate, t } = useLanguage();
  
  // Collapse animation state
  const [isCollapsing, setIsCollapsing] = useState(false);
  
  // Long-press state for Master Reboot (5 second hold)
  const longPressTimer = useRef(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  
  const handleLongPressStart = useCallback(() => {
    let progress = 0;
    longPressTimer.current = setInterval(() => {
      progress += 2; // 2% every 100ms = 5 seconds total
      setLongPressProgress(progress);
      
      if (progress >= 100) {
        clearInterval(longPressTimer.current);
        console.log('[V-ENGINE] LONG PRESS COMPLETE - INITIATING MASTER REBOOT');
        vibrate([100, 50, 100, 50, 200]); // Distinct vibration pattern
        masterReboot();
      }
    }, 100);
  }, [vibrate]);
  
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearInterval(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressProgress(0);
  }, []);

  const handleEmergencyStop = useCallback(async () => {
    console.log('[EmergencyShutOff] GRAVITATIONAL COLLAPSE INITIATED');
    
    // Start collapse animation
    setIsCollapsing(true);
    
    // 0. ACTIVATE VOID STATE - Implode hexagram to 000000
    try {
      activateVoid();
      freezeCompass();
    } catch (e) {
      console.warn('Polarity void activation failed:', e);
    }
    
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

    // 10. GRAVITATIONAL COLLAPSE HAPTIC — Language-aware
    vibrate('collapse');
    
    // 11. BACKEND KILL SWITCH — Notify server of emergency stop
    try {
      const backendResult = await triggerEmergencyStop();
      console.log('[EmergencyShutOff] Backend kill switch result:', backendResult);
    } catch (err) {
      console.warn('[EmergencyShutOff] Backend kill switch call failed (continuing):', err);
    }
    
    // End collapse animation
    setTimeout(() => setIsCollapsing(false), 800);

    console.log('[EmergencyShutOff] GRAVITATIONAL COLLAPSE COMPLETE - All systems zeroed');
  }, [sovereignKillAll, stopMixer, isMuted, sovereignMuteToggle, activateVoid, freezeCompass, vibrate]);

  // Expose globally for debugging/console access
  useEffect(() => {
    window.__emergencyStop = handleEmergencyStop;
    return () => { delete window.__emergencyStop; };
  }, [handleEmergencyStop]);

  return (
    <>
      {/* Gravitational Collapse Overlay */}
      <AnimatePresence>
        {isCollapsing && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 99998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Implosion effect - edges pulling toward center */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, rgba(239, 68, 68, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%)',
              }}
              animate={{
                background: [
                  'radial-gradient(circle at center, transparent 0%, rgba(239, 68, 68, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%)',
                  'radial-gradient(circle at center, rgba(239, 68, 68, 0.5) 0%, transparent 30%, rgba(0, 0, 0, 0.9) 60%)',
                  'radial-gradient(circle at center, transparent 0%, transparent 10%, rgba(0, 0, 0, 0.95) 30%)',
                ],
              }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            />
            
            {/* VOID text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.8 }}
            >
              <span
                className="text-4xl font-bold tracking-[0.5em]"
                style={{ color: '#EF4444', textShadow: '0 0 30px rgba(239, 68, 68, 0.8)' }}
              >
                VOID
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* STOP Button - Compact, positioned to not overlap */}
      {/* Long-press (5 sec) triggers MASTER REBOOT */}
      <button
        onClick={handleEmergencyStop}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        className="emergency-shutoff-btn floating-stop-button flex items-center justify-center gap-1"
        style={{
          position: 'fixed',
          top: 15,
          left: 15,
          zIndex: 999999,  // V51.1: Maximum z-index — NEVER covered
          width: 'auto',
          minWidth: 32,
          height: 28,
          padding: '0 12px',
          borderRadius: 25,
          background: longPressProgress > 0
            ? `linear-gradient(90deg, rgba(239,68,68,0.6) ${longPressProgress}%, rgba(30,30,30,0.8) ${longPressProgress}%)`
            : isVoid 
              ? 'rgba(60, 60, 60, 0.9)' 
              : isAtZeroPoint 
                ? 'rgba(60, 60, 60, 0.8)'
                : 'rgba(30, 30, 30, 0.85)',
          border: longPressProgress > 0
            ? '1px solid rgba(239, 68, 68, 0.8)'
            : isVoid
              ? '1px solid rgba(100, 100, 100, 0.5)'
              : '1px solid rgba(80, 80, 80, 0.4)',
          color: isVoid ? '#888' : isAtZeroPoint ? '#666' : '#EF4444',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          transition: 'all 0.15s ease',
          transform: isCollapsing ? 'scale(1.05)' : 'scale(1)',
          pointerEvents: 'auto',  // V51.1: Always touchable
        }}
        data-testid="emergency-stop-btn-v31"
        title="Emergency Stop (tap) | Master Reboot (hold 5s)"
      >
        <Square size={14} fill="currentColor" />
        <span>{longPressProgress > 0 ? 'HOLD...' : isVoid ? 'VOID' : 'STOP'}</span>
      </button>
    </>
  );
}
