/**
 * useRouteAudioCleanup.js — Route-based Audio Kill Switch
 * 
 * THE MANDATE: Exiting a room automatically kills all active audio streams.
 * This hook listens for route changes and terminates any playing audio
 * when the user navigates away from a room/page.
 * 
 * This ensures no audio "leaks" between rooms in The Enlightenment Cafe.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSensory } from '../context/SensoryContext';
import { useMixer } from '../context/MixerContext';

export function useRouteAudioCleanup() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const { sovereignKillAll, isMuted } = useSensory();
  const { stopAll: stopMixer } = useMixer();

  useEffect(() => {
    // Only trigger cleanup when the path actually changes
    if (previousPath.current !== location.pathname) {
      console.log(`[RouteAudioCleanup] Navigating from ${previousPath.current} to ${location.pathname}`);
      
      // Kill all audio on route change (room exit)
      try {
        // 1. Stop mixer layers
        stopMixer?.();
        
        // 2. Kill sensory audio
        sovereignKillAll?.();
        
        // 3. Close any orphaned AudioContexts
        const contexts = window.__cosmicAudioContexts || [];
        contexts.forEach((ctx) => {
          if (ctx && ctx.state !== 'closed') {
            try { 
              ctx.close();
            } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
          }
        });
        window.__cosmicAudioContexts = [];
        
        // 4. Stop HTML5 media
        document.querySelectorAll('audio, video').forEach(el => {
          if (!el.dataset.keepPlaying) {
            el.pause();
            el.currentTime = 0;
          }
        });
        
        console.log('[RouteAudioCleanup] All audio stopped on route exit');
      } catch (e) {
        console.warn('[RouteAudioCleanup] Cleanup error:', e);
      }
      
      // Update previous path
      previousPath.current = location.pathname;
    }
  }, [location.pathname, stopMixer, sovereignKillAll, isMuted]);
}

export default useRouteAudioCleanup;
