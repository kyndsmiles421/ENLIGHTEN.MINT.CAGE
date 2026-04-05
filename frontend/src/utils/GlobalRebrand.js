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
  
  // 3. PHYSICAL MATRIX ERASURE - CLEAN SLATE SCRIPT
  const cleanSlate = () => {
    // Find and hide any element with 'matrix' or 'Matrix' in ID, class, or text
    const matrixGhosts = document.querySelectorAll(
      '[class*="matrix"], [id*="matrix"], [class*="Matrix"], [id*="Matrix"]'
    );
    matrixGhosts.forEach(ghost => {
      ghost.style.setProperty('display', 'none', 'important');
      ghost.style.setProperty('visibility', 'hidden', 'important');
      ghost.style.setProperty('opacity', '0', 'important');
      ghost.style.setProperty('pointer-events', 'none', 'important');
    });
    
    // Force rename any text content containing "Matrix"
    document.querySelectorAll('*').forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        const text = el.textContent;
        if (text.includes('Matrix') && !text.includes('FRICTION')) {
          el.textContent = text.replace(/Matrix/gi, 'Shambhala');
        }
        if (text.includes('MATRIX') && !text.includes('FRICTION')) {
          el.textContent = text.replace(/MATRIX/g, 'SHAMBHALA');
        }
        if (text.includes('Cosmic Collective')) {
          el.textContent = text.replace(/Cosmic Collective/g, 'Enlightenment Cafe');
        }
      }
    });
  };
  
  // Run immediately
  cleanSlate();
  
  // Run again after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanSlate);
  }
  
  // Run again after full load
  window.addEventListener('load', cleanSlate);
  
  // Continuous cleaning every 2 seconds for first 10 seconds
  let cleanCount = 0;
  const cleanInterval = setInterval(() => {
    cleanSlate();
    cleanCount++;
    if (cleanCount >= 5) clearInterval(cleanInterval);
  }, 2000);
  
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
