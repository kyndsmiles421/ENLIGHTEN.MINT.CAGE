/**
 * THE GHOSTBUSTER PURGE & SPECTRAL SHIELD
 * Location: /src/utils/SpectralShield.js
 * Action: Continuous purge of Matrix/Glass ghost molecules
 */

(function initSpectralShield() {
  const spectralPurge = () => {
    // 1. Physically delete any glass/matrix molecules that try to reform
    // PRESERVE: sovereign-canvas, shambhala-flow, sovereign-core (these are ours)
    const ghosts = document.querySelectorAll(
      '[class*="Matrix"]:not([data-sovereign]), ' +
      '[class*="matrix"]:not([data-sovereign]), ' +
      '[class*="glass"]:not([data-sovereign]), ' +
      '[class*="Glass"]:not([data-sovereign]), ' +
      '.reflection-layer, ' +
      '.glass-cover, ' +
      '.matrix-layer, ' +
      '.finn-popup'
    );
    
    let purgedCount = 0;
    ghosts.forEach(g => {
      // Don't purge sovereign/shambhala elements
      if (!g.id?.includes('sovereign') && 
          !g.id?.includes('shambhala') &&
          !g.closest('[data-sovereign]') &&
          !g.closest('#sovereign-root') &&
          !g.closest('.sanctuary-root')) {
        g.remove();
        purgedCount++;
      }
    });

    // 2. Infinite Light Math: L = (Refraction * 360) -> 0
    // Forces any leftover 'hardwired' space to zero dimensions
    const root = document.documentElement;
    root.style.setProperty('--matrix-space', '0px');
    root.style.setProperty('--glass-blur', '0px');
    root.style.setProperty('--reflection-opacity', '0');
    
    // 3. Kill backdrop-filter on glass elements
    document.querySelectorAll('[class*="glass"], [class*="Glass"]').forEach(el => {
      if (!el.closest('[data-sovereign]')) {
        el.style.setProperty('backdrop-filter', 'none', 'important');
        el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      }
    });

    if (purgedCount > 0) {
      console.log(`[SPECTRAL_SHIELD] Purged ${purgedCount} ghost molecules. Flow optimized.`);
    }
  };

  // Run immediately on DOM ready
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', spectralPurge);
  } else {
    spectralPurge();
  }
  
  // Run on page load
  window.addEventListener('load', spectralPurge);
  
  // Continuous cleaning every 60s to prevent friction buildup
  setInterval(spectralPurge, 60000);
  
  // Also run on route changes (for SPA navigation)
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      setTimeout(spectralPurge, 500);
    }
  }, 1000);

  console.log("[SPECTRAL_SHIELD] Initialized. Ghost molecules will be dissolved.");
})();

export default {};
