/**
 * WEBXR PORTAL ENGINE
 * Seamless transition from Golden Spiral → Immersive Dome
 * Rapid City Hub | The Enlightenment Cafe V2.88
 */

const WebXRPortal = (() => {
  let xrSession = null;
  let isSupported = false;

  // Check WebXR availability
  const checkSupport = async () => {
    if ('xr' in navigator) {
      try {
        isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!isSupported) {
          // Fallback to inline AR if VR not available
          isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        }
        console.log(`[WebXRPortal] Immersive mode supported: ${isSupported}`);
      } catch (e) {
        console.log('[WebXRPortal] WebXR check failed:', e.message);
        isSupported = false;
      }
    } else {
      console.log('[WebXRPortal] WebXR not available in this browser');
      isSupported = false;
    }
    return isSupported;
  };

  // Initialize the WebXR Dome Session
  const initializeWebXRDome = async () => {
    if (!isSupported) {
      console.log('[WebXRPortal] Falling back to fullscreen dome mode');
      enterFullscreenDome();
      return;
    }

    try {
      const sessionType = await navigator.xr.isSessionSupported('immersive-vr') 
        ? 'immersive-vr' 
        : 'immersive-ar';
      
      xrSession = await navigator.xr.requestSession(sessionType, {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking']
      });

      xrSession.addEventListener('end', () => {
        console.log('[WebXRPortal] XR Session ended');
        xrSession = null;
        exitPortal();
      });

      console.log('[WebXRPortal] XR Session started successfully');
      
      // Dispatch event for other systems to hook into
      window.dispatchEvent(new CustomEvent('WEBXR_SESSION_START', {
        detail: { session: xrSession, type: sessionType }
      }));

    } catch (e) {
      console.error('[WebXRPortal] Failed to start XR session:', e);
      enterFullscreenDome();
    }
  };

  // Fullscreen fallback for non-XR devices
  const enterFullscreenDome = () => {
    const domeContainer = document.getElementById('celestial-dome') || document.body;
    
    if (domeContainer.requestFullscreen) {
      domeContainer.requestFullscreen();
    } else if (domeContainer.webkitRequestFullscreen) {
      domeContainer.webkitRequestFullscreen();
    }

    // Navigate to the dome page
    if (window.location.pathname !== '/vr/celestial-dome') {
      window.location.href = '/vr/celestial-dome';
    }

    console.log('[WebXRPortal] Entered fullscreen dome mode');
  };

  // The Portal Transition - Zoom into the Golden Spiral
  const initiatePortal = () => {
    const spiral = document.getElementById('golden-spiral-canvas');
    const emergentLayer = document.querySelector('.emergent-layer');
    
    if (!spiral && !emergentLayer) {
      console.log('[WebXRPortal] No spiral element found, direct transition');
      initializeWebXRDome();
      return;
    }

    const targetElement = spiral || emergentLayer;

    // 1. Trigger ASCEND state first for rainbow effect
    window.dispatchEvent(new CustomEvent('SHAMBHALA_ASCEND', {
      detail: { 
        frequency: 'Portal Frequency',
        origin: 'WebXR Portal',
        mode: 'portal-transition'
      }
    }));

    // 2. Add portal loading pulse
    targetElement.classList.add('portal-loading');
    
    // 3. Start the zoom after a brief pause
    setTimeout(() => {
      targetElement.classList.remove('portal-loading');
      targetElement.classList.add('spiral-zoom-active');
      console.log('[WebXRPortal] Portal zoom initiated');
    }, 300);

    // 4. Sync WebXR start with the peak of the zoom
    setTimeout(() => {
      initializeWebXRDome();
    }, 1200); // Trigger slightly before the animation ends for a seamless handoff
  };

  // Exit portal and reset state
  const exitPortal = () => {
    const spiral = document.getElementById('golden-spiral-canvas');
    const emergentLayer = document.querySelector('.emergent-layer');
    
    [spiral, emergentLayer].forEach(el => {
      if (el) {
        el.classList.remove('spiral-zoom-active', 'portal-loading');
      }
    });

    // Return to stasis
    window.dispatchEvent(new CustomEvent('SHAMBHALA_STASIS', {
      detail: { reason: 'portal_exit' }
    }));

    console.log('[WebXRPortal] Portal closed, returned to stasis');
  };

  // End the XR session
  const endSession = async () => {
    if (xrSession) {
      await xrSession.end();
      xrSession = null;
    }
    exitPortal();
  };

  // Listen for portal trigger events
  const init = () => {
    checkSupport();

    // Listen for custom portal events
    window.addEventListener('INITIATE_PORTAL', initiatePortal);
    window.addEventListener('EXIT_PORTAL', exitPortal);

    // Keyboard shortcut: Press 'V' for VR
    document.addEventListener('keydown', (e) => {
      if (e.key === 'v' && e.ctrlKey) {
        e.preventDefault();
        initiatePortal();
      }
    });

    console.log('[WebXRPortal] Initialized. Press Ctrl+V or dispatch INITIATE_PORTAL to enter.');
  };

  return {
    init,
    initiatePortal,
    exitPortal,
    endSession,
    checkSupport,
    isSupported: () => isSupported,
    getSession: () => xrSession
  };
})();

// Auto-initialize
if (typeof window !== 'undefined') {
  window.WebXRPortal = WebXRPortal;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', WebXRPortal.init);
  } else {
    WebXRPortal.init();
  }
}

export default WebXRPortal;
