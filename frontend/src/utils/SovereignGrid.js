/**
 * ENLIGHTEN.MINT.CAFE - Sovereign Grid Controller (V1.0)
 * Architecture: Temporal Staircase (Past/Present/Future)
 * Guard: MutationObserver for Auto-Docking
 */

const SovereignGrid = (() => {
  // 1. Temporal Identity Definitions
  const TEMPORAL_MAP = {
    past: { id: 'archives', color: '#22d3ee', anchor: 'top' },    // Cyan
    present: { id: 'hub', color: 'iridescent', anchor: 'center' }, // Pulse
    future: { id: 'manifest', color: '#a855f7', anchor: 'bottom' } // Purple
  };

  // 2. The Sovereign Guard (MutationObserver)
  // Intercepts unauthorized "floating" boxes and forces them into the dock
  const enforceHierarchy = () => {
    const stage = document.getElementById('app-stage');
    const topBar = document.querySelector('.bar-top');
    const bottomBar = document.getElementById('bottom-dock-future');
    
    if (!bottomBar) return; // Not yet rendered
    
    // Targets any element that isn't part of the core Hub or Bars
    // Also catch elements with extremely high z-indexes floating outside the stage
    const rogueSelectors = [
      '.unauthorized-utility',
      '.floating-action-btn',
      '#shambhala-mission-control',
      '[data-testid="quick-meditation-widget"]',
    ];
    
    const rogueElements = document.querySelectorAll(rogueSelectors.join(', '));
    
    rogueElements.forEach(el => {
      // Check if it's already properly nested in stage or bars
      if (!el.closest('#app-stage') && !el.closest('.sovereign-toolbar')) {
        console.log("Sovereign Guard: Purging UI friction. Docking to Future/Manifest.");
        bottomBar.appendChild(el);
        el.className = 'docked-nodule'; // Strips rogue styling
      }
    });
    
    // Special handling: Hide ShambhalaToolbar on hub page (conflicts with SovereignGrid)
    const pathname = window.location.pathname;
    const shambhalaToolbar = document.querySelector('[data-testid="shambhala-toolbar"]');
    if (shambhalaToolbar && pathname === '/hub') {
      shambhalaToolbar.style.display = 'none';
    }
  };

  // 3. Radial Glow & Relation Mapping
  const applyThematicGlow = () => {
    Object.entries(TEMPORAL_MAP).forEach(([key, config]) => {
      const bar = document.querySelector(`.bar-${config.anchor}`);
      if (bar) {
        bar.style.boxShadow = `0 0 25px 3px ${config.color}`;
        bar.style.borderBottom = config.anchor === 'top' ? `2px solid ${config.color}` : 'none';
        bar.style.borderTop = config.anchor === 'bottom' ? `2px solid ${config.color}` : 'none';
      }
    });
  };

  // Track observer instance for cleanup
  let observer = null;

  return {
    init: () => {
      applyThematicGlow();
      enforceHierarchy();
      
      // The "Live" Watcher: Watches the entire body for unauthorized UI shifts
      observer = new MutationObserver(enforceHierarchy);
      observer.observe(document.body, { childList: true, subtree: true });
      
      console.log("SovereignGrid: Temporal Architecture initialized. No-Fly Zone active.");
    },
    
    destroy: () => {
      if (observer) {
        observer.disconnect();
        observer = null;
        console.log("SovereignGrid: Observer disconnected.");
      }
    },
    
    // Expose for external access
    TEMPORAL_MAP,
    enforceHierarchy,
    applyThematicGlow
  };
})();

export default SovereignGrid;
