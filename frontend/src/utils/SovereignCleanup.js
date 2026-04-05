/**
 * THE SOVEREIGN CLEANUP SCRIPT (V2.88 Final)
 * Purpose: Purge legacy Matrix DOM, optimize Three.js memory, and set PWA hooks.
 */

const SovereignCleanup = (() => {
  const purgeLegacy = () => {
    // 1. Remove all unused 'Matrix' elements that were hidden via CSS
    const legacySelectors = [
      '.matrix-legacy',
      '.old-ui-hidden',
      '[class*="matrix-"]',
      '[class*="Matrix"]',
      '[id*="matrix"]',
      '[data-legacy="true"]'
    ];
    
    let totalPurged = 0;
    legacySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Don't remove if it's part of the active Shambhala system
          if (!el.closest('#shambhala-ui-container') && 
              !el.closest('.emergent-layer') &&
              !el.closest('[data-sovereign="true"]')) {
            el.remove();
            totalPurged++;
          }
        });
      } catch (e) {
        // Selector may be invalid, skip silently
      }
    });
    
    console.log(`%c[CLEANUP]: Purged ${totalPurged} legacy Matrix components.`, 
                'color: #4ade80; background: #0a0a0a; padding: 4px 8px; border-radius: 4px;');
  };

  const optimizePerformance = () => {
    // 2. Ensure Three.js context is handled for mobile battery life
    let wasAscended = false;
    
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause the Golden Spiral rendering when the user switches apps
        // Store current state to restore when visible
        wasAscended = window.__shambhalaAscended || false;
        window.dispatchEvent(new CustomEvent('SHAMBHALA_STASIS', {
          detail: { reason: 'visibility_hidden', preserveState: true }
        }));
        console.log('[CLEANUP]: App hidden - Golden Spiral paused for battery optimization.');
      } else {
        // Restore previous state when app becomes visible
        if (wasAscended) {
          window.dispatchEvent(new CustomEvent('SHAMBHALA_ASCEND', {
            detail: { 
              frequency: 'Crystal White Light',
              refraction: 'Full Rainbow Spectrum',
              origin: 'Visibility Restore'
            }
          }));
        }
        console.log('[CLEANUP]: App visible - Golden Spiral resumed.');
      }
    });

    // 3. Reduce animation frame rate when page is not focused
    let animationThrottle = false;
    window.addEventListener('blur', () => {
      animationThrottle = true;
      console.log('[CLEANUP]: Window blurred - reducing animation frame rate.');
    });
    window.addEventListener('focus', () => {
      animationThrottle = false;
      console.log('[CLEANUP]: Window focused - restoring animation frame rate.');
    });
    
    // Expose throttle state globally for animation loops
    window.__sovereignAnimationThrottle = () => animationThrottle;
  };

  const initPWA = () => {
    // 4. Register the Service Worker for the Capacitor Wrapper
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            console.log('%c[PWA]: Sanctuary Service Worker Registered.', 
                        'color: #a78bfa; background: #0a0a0a; padding: 4px 8px; border-radius: 4px;');
            
            // Check for updates periodically
            setInterval(() => {
              reg.update();
            }, 60 * 60 * 1000); // Check every hour
          })
          .catch(err => {
            console.log('[PWA]: Service Worker registration failed:', err.message);
          });
      });
    }

    // 5. Handle PWA install prompt
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      window.__pwaInstallPrompt = deferredPrompt;
      console.log('[PWA]: Install prompt captured. Use window.__pwaInstallPrompt to trigger.');
    });

    // 6. Track successful installation
    window.addEventListener('appinstalled', () => {
      console.log('%c[PWA]: The Enlightenment Cafe installed successfully!', 
                  'color: #fbbf24; background: #0a0a0a; padding: 4px 8px; border-radius: 4px;');
      deferredPrompt = null;
      window.__pwaInstallPrompt = null;
    });
  };

  const cleanupMemory = () => {
    // 7. Periodic memory cleanup for long sessions
    setInterval(() => {
      // Force garbage collection hint (browser may ignore)
      if (window.gc) {
        window.gc();
      }
      
      // Clear any orphaned event listeners on removed elements
      const orphanedCanvases = document.querySelectorAll('canvas:not(#golden-spiral-canvas):not([data-sovereign="true"])');
      orphanedCanvases.forEach(canvas => {
        const ctx = canvas.getContext('2d') || canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (ctx && ctx.getExtension) {
          const loseContext = ctx.getExtension('WEBGL_lose_context');
          if (loseContext) loseContext.loseContext();
        }
      });
      
      console.log('[CLEANUP]: Periodic memory optimization complete.');
    }, 5 * 60 * 1000); // Every 5 minutes
  };

  return { 
    execute: () => { 
      purgeLegacy(); 
      optimizePerformance(); 
      initPWA();
      cleanupMemory();
      console.log('%c[SOVEREIGN CLEANUP V2.88]: All systems optimized for Rapid City deployment.', 
                  'color: #fff; background: linear-gradient(to right, #6366f1, #a78bfa); padding: 8px 12px; border-radius: 4px; font-weight: bold;');
    },
    purgeLegacy,
    optimizePerformance,
    initPWA
  };
})();

// Auto-execute when DOM is ready
if (typeof window !== 'undefined') {
  window.SovereignCleanup = SovereignCleanup;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SovereignCleanup.execute());
  } else {
    SovereignCleanup.execute();
  }
}

export default SovereignCleanup;
