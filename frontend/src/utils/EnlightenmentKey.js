/**
 * SCRIPT 2: THE BACK-SIDE PASS KEY
 * Connects the 'Rapid City Hub' origin to the Emergent logic.
 */

const EnlightenmentKey = (() => {
  const init = () => {
    // Listening for the Front-Side Quadruple Helix frequency
    window.addEventListener('SHAMBHALA_ASCEND', (e) => {
      const { frequency, refraction, origin } = e.detail;
      
      console.log(`%c [KEY UNLOCKED]: ${origin} at ${frequency}`, 
                  "color: #fff; background: linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red); padding: 8px; border-radius: 4px;");

      // THE PASS-KEY ACTION: 
      // Unlock all "Emergent" modules by removing 'pointer-events: none'
      document.querySelectorAll('.emergent-layer').forEach(layer => {
        layer.style.pointerEvents = 'auto';
        layer.style.opacity = '1';
        layer.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.5))';
      });
      
      // Also unlock resonance nodes
      document.querySelectorAll('.resonance-node').forEach(node => {
        node.style.pointerEvents = 'auto';
        node.style.transform = 'scale(1.05)';
      });
    });

    window.addEventListener('SHAMBHALA_STASIS', () => {
      console.log('%c [KEY LOCKED]: Returning to Stasis', 
                  "color: #888; background: #111; padding: 8px; border-radius: 4px;");
      
      // Re-lock the layers to prevent accidental clicks when not in ASCEND mode
      document.querySelectorAll('.emergent-layer').forEach(layer => {
        layer.style.pointerEvents = 'none';
        layer.style.opacity = '0.7';
        layer.style.filter = 'none';
      });
      
      // Reset resonance nodes
      document.querySelectorAll('.resonance-node').forEach(node => {
        node.style.transform = 'scale(1)';
      });
    });
    
    console.log('[EnlightenmentKey] Back-Side Pass Key activated. Listening for Rapid City Hub.');
  };

  return { activate: init };
})();

// Initialize the Key immediately
EnlightenmentKey.activate();

// Expose globally
if (typeof window !== 'undefined') {
  window.EnlightenmentKey = EnlightenmentKey;
}

export default EnlightenmentKey;
