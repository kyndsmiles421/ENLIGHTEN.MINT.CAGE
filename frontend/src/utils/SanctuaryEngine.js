/**
 * SANCTUARY ENGINE - Pure Light Resonance
 * Mission Control: Legacy Matrix Purged, Shambhala UI Preserved
 */

const SanctuaryEngine = {
  // Purge legacy elements but PRESERVE active Shambhala UI
  purgeLegacy() {
    // Only purge legacy elements, not active UI components
    const legacySelectors = [
      '[class*="matrix"]',
      '[class*="Matrix"]',
      '[id*="matrix"]',
      '[data-legacy="true"]',
      '.old-cosmic-collective'
    ];
    
    let purged = 0;
    legacySelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          // Don't remove if it's an active UI component
          if (!el.closest('#shambhala-mission-control') && 
              !el.closest('.shambhala-toolbar') &&
              !el.closest('[data-sovereign="true"]')) {
            el.remove();
            purged++;
          }
        });
      } catch (e) { /* Skip invalid selectors */ }
    });
    
    console.log(`[SanctuaryEngine] Purged ${purged} legacy elements. Shambhala UI preserved.`);
  },

  // Initialize sanctuary mode
  init() {
    this.purgeLegacy();
    MissionControlKey.ghostEmergent();
    document.body.style.background = 'radial-gradient(circle at center, #0a0a1a 0%, #000000 100%)';
    document.body.style.overflow = 'hidden';
    document.body.style.cursor = 'crosshair';
    console.log("[SanctuaryEngine] Pure Light Resonance Active.");
  }
};

// Mission Control: KILL the Badge — not ghost, KILL
const MissionControlKey = {
  ghostEmergent() {
    const selectors = [
      '#emergent-badge',
      '[class*="emergent"]',
      '[id*="emergent"]',
      'a[href*="emergentagent"]',
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('height', '0', 'important');
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('z-index', '-1', 'important');
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('left', '-9999px', 'important');
      });
    });
    console.log("[MissionControlKey] Emergent badge eliminated.");
  }
};

// Auto-run on load
if (typeof window !== 'undefined') {
  window.SanctuaryEngine = SanctuaryEngine;
  window.MissionControlKey = MissionControlKey;
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      SanctuaryEngine.purgeLegacy();
      MissionControlKey.ghostEmergent();
    });
  } else {
    SanctuaryEngine.purgeLegacy();
    MissionControlKey.ghostEmergent();
  }
  
  // Also run after full page load and on interval to catch re-injections
  window.addEventListener('load', () => {
    MissionControlKey.ghostEmergent();
  });
  // Recurring purge — badge script re-injects, we re-kill
  setInterval(() => MissionControlKey.ghostEmergent(), 3000);
}

export { SanctuaryEngine, MissionControlKey };
export default SanctuaryEngine;
