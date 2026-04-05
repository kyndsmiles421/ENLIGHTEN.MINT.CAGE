/**
 * THE ENLIGHTENMENT CAFE - ROOT ANCHOR
 * Version: 2.88_SHAMBHALA (Aether/Mirrorless)
 * Action: Erase Matrix & Cosmic Collective Branding
 */

// IMMEDIATE EXECUTION: Sovereign State Initialization
(function initializeSovereignState() {
  // 1. CLEAR PERSISTENT STORAGE (The "Ghost" Cache)
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("[ROOT_ANCHOR] Storage cleared — Ghost cache purged.");
  } catch (e) {
    console.warn("[ROOT_ANCHOR] Storage clear failed:", e);
  }

  // 2. FORCE BRAND ALIGNMENT
  document.title = "The Enlightenment Cafe";
  
  // 3. PHYSICAL MATRIX ERASURE
  // This finds any element with 'matrix' in the ID or Class and deletes it
  const matrixGhosts = document.querySelectorAll('[class*="matrix"], [id*="matrix"]');
  matrixGhosts.forEach(ghost => ghost.remove());
  
  console.log("SYSTEM: Matrix Erased. Cosmic Collective Purged. Shambhala Active.");
})();

const GlobalRebrand = {
  appName: "The Enlightenment Cafe",
  version: "2.88_SHAMBHALA",
  physics: "AETHER_MIRRORLESS",
  
  // Shambhala background gradient
  SHAMBHALA_GRADIENT: "radial-gradient(circle at center, #1a0b2e 0%, #000000 100%)",
  
  // Force-clear the old Matrix styles
  clearOldStyles: () => {
    // Remove old matrix layer if exists
    const matrixLayer = document.getElementById('matrix-integration');
    if (matrixLayer) {
      matrixLayer.remove();
      console.log("[GlobalRebrand] MATRIX_LAYER_REMOVED");
    }
    
    // Remove any lingering matrix-* classes
    document.querySelectorAll('[class*="matrix-"]').forEach(el => {
      el.classList.forEach(cls => {
        if (cls.startsWith('matrix-')) {
          el.classList.remove(cls);
        }
      });
    });
    
    // Physical deletion of ALL matrix/cosmic-collective references
    const matrixGhosts = document.querySelectorAll('[class*="matrix"], [id*="matrix"], [class*="cosmic-collective"], [id*="cosmic-collective"]');
    matrixGhosts.forEach(ghost => ghost.remove());
    
    // Apply Shambhala background
    document.body.style.background = GlobalRebrand.SHAMBHALA_GRADIENT;
    
    console.log("[GlobalRebrand] MATRIX_ERASED: System aligned to Shambhala.");
    console.log(`[GlobalRebrand] ${GlobalRebrand.appName} v${GlobalRebrand.version} | Physics: ${GlobalRebrand.physics}`);
    
    return true;
  },
  
  // Initialize rebrand on app load
  init: () => {
    // Run on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', GlobalRebrand.clearOldStyles);
    } else {
      GlobalRebrand.clearOldStyles();
    }
    
    // Set document title
    document.title = GlobalRebrand.appName;
    
    // Update meta theme
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = '#1a0b2e'; // Shambhala purple-black
    }
    
    return GlobalRebrand;
  },
  
  // Get current branding info
  getInfo: () => ({
    name: GlobalRebrand.appName,
    version: GlobalRebrand.version,
    physics: GlobalRebrand.physics,
    timestamp: new Date().toISOString()
  })
};

// Auto-initialize on import
GlobalRebrand.init();

// Expose globally
if (typeof window !== 'undefined') {
  window.GlobalRebrand = GlobalRebrand;
}

export default GlobalRebrand;
