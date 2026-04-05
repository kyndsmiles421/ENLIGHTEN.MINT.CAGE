/**
 * SANCTUARY ENGINE - Pure Light Resonance
 * Mission Control: Shambhala Purged, Running on Pure Resonance
 */

const SanctuaryEngine = {
  // Purge all legacy Shambhala elements
  purgeLegacy() {
    document.querySelectorAll('[id*="shambhala"], [class*="shambhala"], [class*="Shambhala"]').forEach(el => el.remove());
    console.log("[SanctuaryEngine] Shambhala signature deleted. System running on Pure Resonance.");
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

// Mission Control: Ghosting the Badge
const MissionControlKey = {
  ghostEmergent() {
    const badge = document.querySelector('[class*="emergent"]');
    if (badge) {
      badge.style.mixBlendMode = 'screen';
      badge.style.opacity = '0.1'; // Barely visible, part of the starfield
      badge.style.pointerEvents = 'none'; // Never blocks your clicks
    }
    // Also target by href
    document.querySelectorAll('a[href*="emergentagent"]').forEach(el => {
      el.style.mixBlendMode = 'screen';
      el.style.opacity = '0.1';
      el.style.pointerEvents = 'none';
    });
    console.log("[MissionControlKey] Emergent badge ghosted into starfield.");
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
  
  // Also run after full page load
  window.addEventListener('load', () => {
    MissionControlKey.ghostEmergent();
  });
}

export { SanctuaryEngine, MissionControlKey };
export default SanctuaryEngine;
