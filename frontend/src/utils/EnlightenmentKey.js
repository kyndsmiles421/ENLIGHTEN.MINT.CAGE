/**
 * THE ENLIGHTENMENT PASS KEY (Layer 0)
 * RUN ONCE AT STARTUP
 * Connects the Shambhala event system to the Golden Ratio Spiral
 */
const EnlightenmentKey = (() => {
  const init = () => {
    // Listener for UNLOCK
    window.addEventListener('SHAMBHALA_ASCEND', (e) => {
      document.querySelectorAll('.emergent-layer').forEach(layer => {
        layer.style.pointerEvents = 'auto'; // Re-enable interaction
        layer.style.opacity = '1';
        layer.classList.add('refracted-state'); // Triggers Golden Ratio expansion
      });
      console.log(`%c [UNLOCKED]: ${e.detail?.origin || 'Unknown'} via ${e.detail?.frequency || 'Crystal Light'}`, "color: cyan; font-weight: bold;");
    });

    // Listener for LOCK
    window.addEventListener('SHAMBHALA_STASIS', () => {
      document.querySelectorAll('.emergent-layer').forEach(layer => {
        layer.style.pointerEvents = 'none'; // Prevent background clicks
        layer.style.opacity = '0.7';
        layer.classList.remove('refracted-state');
      });
      console.log("%c [LOCKED]: Returning to Stasis", "color: red;");
    });
    
    console.log('[EnlightenmentKey] Layer 0 Pass Key activated. Listening for Rapid City Hub.');
  };

  return { activate: init };
})();

// Call this to turn the key on
EnlightenmentKey.activate();

// Expose globally
if (typeof window !== 'undefined') {
  window.EnlightenmentKey = EnlightenmentKey;
}

export default EnlightenmentKey;
