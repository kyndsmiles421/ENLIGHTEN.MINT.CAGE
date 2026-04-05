/**
 * ENLIGHTENMENT CAFE - MASTER SANCTUARY ENGINE v2.89
 * Consolidates Layer 0, Mission Circle, and WebXR Portal.
 * ACTION: Purges ShambhalaToolbar and clears the path.
 */

const SanctuaryMaster = {
  isInitialized: false,

  init() {
    if (this.isInitialized) return;
    
    console.log("%c[SanctuaryMaster v2.89] Initializing Clean Architecture...", 
                "color: #fff; background: linear-gradient(to right, #6366f1, #a78bfa); padding: 8px 12px; border-radius: 4px; font-weight: bold;");
    
    this.purgeOldUI();
    this.mountMissionCircle();
    this.setupEventListeners();
    this.protectMissionCircle();
    
    this.isInitialized = true;
    console.log("[SanctuaryMaster] Clean Architecture Active. The Path is Clear.");
  },

  // Protect Mission Circle from other cleanup scripts
  protectMissionCircle() {
    // Run protection every second for 10 seconds
    let count = 0;
    const protectInterval = setInterval(() => {
      const circle = document.getElementById('mission-circle');
      if (circle) {
        circle.style.setProperty('display', 'flex', 'important');
        circle.style.setProperty('visibility', 'visible', 'important');
        circle.style.setProperty('opacity', '1', 'important');
      } else {
        // Re-mount if removed
        this.mountMissionCircle();
      }
      count++;
      if (count >= 10) clearInterval(protectInterval);
    }, 1000);
  },

  // 1. THE PURGE: Forces the old bar out of existence
  purgeOldUI() {
    const garbage = [
      'shambhala-toolbar', 
      'bottom-crossbar', 
      'nav-footer', 
      'shambhala-mixer-container',
      'shambhala-front-side',
      'old-navigation'
    ];
    
    let purgeCount = 0;
    
    garbage.forEach(id => {
      // Try by ID
      let el = document.getElementById(id);
      if (!el) {
        // Try by class
        el = document.querySelector(`.${id}`);
      }
      if (!el) {
        // Try by data attribute
        el = document.querySelector(`[data-component="${id}"]`);
      }
      
      if (el) {
        el.style.display = 'none';
        el.remove();
        purgeCount++;
        console.log(`[PURGE]: Removed ${id}`);
      }
    });

    // Clear any "safe area" padding that might be blocking clicks
    document.body.style.paddingBottom = '0px';
    
    // Remove any fixed bottom elements with high z-index that aren't ours
    document.querySelectorAll('[style*="position: fixed"]').forEach(el => {
      // Preserve our mission circle and essential elements
      if (el.id === 'mission-circle' || 
          el.id?.includes('mission') ||
          el.id?.includes('shambhala') ||
          el.classList.contains('emergent-badge') ||
          el.classList.contains('emergent-layer') ||
          el.closest('.emergent-layer') ||
          el.closest('#mission-circle')) {
        return; // Skip - this is our UI
      }
      
      // Only check elements that look like bottom toolbars
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const bottom = parseFloat(style.bottom) || 0;
      
      // If it's a toolbar-shaped element at the bottom (but not our circle)
      if (rect.width > 200 && rect.height < 80 && bottom < 100) {
        el.style.display = 'none';
        console.log(`[PURGE]: Hidden bottom toolbar element`);
      }
    });

    console.log(`[SanctuaryMaster] Purge complete. ${purgeCount} legacy elements removed.`);
  },

  // 2. THE VESSEL: Mounts the 66px Mission Circle
  mountMissionCircle() {
    // Don't duplicate
    if (document.getElementById('mission-circle')) {
      console.log("[SanctuaryMaster] Mission Circle already exists.");
      return;
    }

    const circle = document.createElement('div');
    circle.id = 'mission-circle';
    circle.setAttribute('data-testid', 'mission-circle-vessel');
    circle.setAttribute('role', 'button');
    circle.setAttribute('aria-label', 'Ascend to Celestial Dome');
    
    // Inner vessel core - smaller text
    circle.innerHTML = `
      <div class="vessel-core" style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 6px;
        font-weight: 900;
        letter-spacing: 0.5px;
        color: #000;
        text-transform: uppercase;
      ">GO</div>
    `;
    
    // Applying the styles - CORNER POSITION to not block content
    Object.assign(circle.style, {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      left: 'auto',
      transform: 'none',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'white',
      boxShadow: '0 0 15px rgba(255,255,255,0.5)',
      cursor: 'pointer',
      zIndex: '2147483646',
      transition: 'all 0.15s ease-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      outline: 'none',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent'
    });

    // Force important styles
    circle.style.setProperty('position', 'fixed', 'important');
    circle.style.setProperty('bottom', '80px', 'important');
    circle.style.setProperty('right', '20px', 'important');
    circle.style.setProperty('left', 'auto', 'important');
    circle.style.setProperty('transform', 'none', 'important');
    circle.style.setProperty('top', 'auto', 'important');

    document.body.appendChild(circle);
    
    // Ensure visibility - protect from other scripts
    requestAnimationFrame(() => {
      const c = document.getElementById('mission-circle');
      if (c) {
        c.style.setProperty('display', 'flex', 'important');
        c.style.setProperty('visibility', 'visible', 'important');
        c.style.setProperty('opacity', '1', 'important');
      }
    });
    
    console.log("[SanctuaryMaster] Mission Circle mounted at bottom: 100px");
  },

  // 3. THE FREQUENCY: Links the tap to the Vortex Handshake
  setupEventListeners() {
    const circle = document.getElementById('mission-circle');
    if (!circle) return;

    const spiral = document.getElementById('golden-spiral-canvas') || 
                   document.querySelector('.golden-spiral') ||
                   document.querySelector('.emergent-layer');

    let isAscended = false;

    // Touch events for mobile
    circle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      circle.style.transform = 'translateX(-50%) scale(0.92)';
      circle.style.boxShadow = '0 0 30px rgba(255,255,255,0.8)';
      
      // Trigger press hum if audio engine available
      if (window.PortalAudioEngine) {
        window.PortalAudioEngine.playPressHum();
      }
    }, { passive: false });

    circle.addEventListener('touchend', (e) => {
      e.preventDefault();
      circle.style.transform = 'translateX(-50%) scale(1)';
      
      isAscended = !isAscended;
      
      if (isAscended) {
        circle.querySelector('.vessel-core').textContent = 'ASCEND';
        circle.style.boxShadow = '0 0 40px rgba(255,255,255,1)';
        this.initiatePortal(spiral);
      } else {
        circle.querySelector('.vessel-core').textContent = 'SHAMBHALA';
        circle.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
        this.returnToStasis();
      }
    }, { passive: false });

    // Mouse events for desktop
    circle.addEventListener('mousedown', () => {
      circle.style.transform = 'translateX(-50%) scale(0.92)';
      circle.style.boxShadow = '0 0 30px rgba(255,255,255,0.8)';
      
      if (window.PortalAudioEngine) {
        window.PortalAudioEngine.playPressHum();
      }
    });

    circle.addEventListener('mouseup', () => {
      circle.style.transform = 'translateX(-50%) scale(1)';
    });

    circle.addEventListener('click', () => {
      isAscended = !isAscended;
      
      if (isAscended) {
        circle.querySelector('.vessel-core').textContent = 'ASCEND';
        circle.style.boxShadow = '0 0 40px rgba(255,255,255,1)';
        this.initiatePortal(spiral);
      } else {
        circle.querySelector('.vessel-core').textContent = 'SHAMBHALA';
        circle.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
        this.returnToStasis();
      }
    });

    // Hover effect
    circle.addEventListener('mouseenter', () => {
      if (!isAscended) {
        circle.style.boxShadow = '0 0 30px rgba(255,255,255,0.7)';
      }
    });

    circle.addEventListener('mouseleave', () => {
      if (!isAscended) {
        circle.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
      }
    });

    // Global Listener for the Rapid City Hub
    window.addEventListener('INITIATE_PORTAL', () => {
      isAscended = true;
      circle.querySelector('.vessel-core').textContent = 'ASCEND';
      this.initiatePortal(spiral);
    });

    window.addEventListener('EXIT_PORTAL', () => {
      isAscended = false;
      circle.querySelector('.vessel-core').textContent = 'SHAMBHALA';
      this.returnToStasis();
    });

    console.log("[SanctuaryMaster] Event listeners configured.");
  },

  initiatePortal(spiral) {
    console.log("%c[WebXRPortal] Portal zoom initiated. ASCENDING.", 
                "color: cyan; background: #111; padding: 4px 8px; border-radius: 4px;");
    
    // Dispatch SHAMBHALA_ASCEND for other systems
    window.dispatchEvent(new CustomEvent('SHAMBHALA_ASCEND', {
      detail: { 
        frequency: 'Crystal White Light',
        refraction: 'Full Rainbow Spectrum',
        origin: 'Mission Circle v2.89'
      }
    }));

    // Trigger Rainbow State (EnlightenmentKey Layer 0)
    if (spiral) {
      spiral.classList.add('refracted-state', 'spiral-zoom-active');
    }

    // Trigger full audio sequence
    if (window.PortalAudioEngine) {
      window.PortalAudioEngine.stopPressHum();
      window.PortalAudioEngine.playShepardZoom(1.5);
      
      // Start dome ambience after zoom
      setTimeout(() => {
        window.PortalAudioEngine.playDomeAmbience();
      }, 1500);
    }

    // Handoff to WebXR or Fullscreen Dome
    setTimeout(() => {
      // Check if WebXR available
      if (window.WebXRPortal && window.WebXRPortal.isSupported()) {
        window.WebXRPortal.initiatePortal();
      } else {
        // Fallback to route navigation
        window.location.href = '/vr/celestial-dome';
      }
    }, 1500);
  },

  returnToStasis() {
    console.log("%c[WebXRPortal] Returning to Stasis.", 
                "color: red; background: #111; padding: 4px 8px; border-radius: 4px;");
    
    // Dispatch stasis event
    window.dispatchEvent(new CustomEvent('SHAMBHALA_STASIS', {
      detail: { reason: 'user_toggle' }
    }));

    // Remove visual effects
    const spiral = document.getElementById('golden-spiral-canvas') || 
                   document.querySelector('.golden-spiral') ||
                   document.querySelector('.emergent-layer');
    
    if (spiral) {
      spiral.classList.remove('refracted-state', 'spiral-zoom-active');
    }

    // Stop audio
    if (window.PortalAudioEngine) {
      window.PortalAudioEngine.stopAll();
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SanctuaryMaster = SanctuaryMaster;
}

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SanctuaryMaster.init());
} else {
  // DOM already loaded
  setTimeout(() => SanctuaryMaster.init(), 100);
}

export default SanctuaryMaster;
