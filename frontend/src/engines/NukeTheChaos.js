/**
 * @project ENLIGHTEN.MINT.CAFE
 * @directive ABSOLUTE_CLARITY_NOW
 * @logic ZERO_STATE_REFRIGERATION
 */

// Kill the Rainbow Confetti / Particles
const VOID_CSS = `
/* Kill the Rainbow Confetti / Particles */
canvas.particle-canvas, 
.particle-container, 
[class*="confetti"],
.mesh-canvas-renderer,
.cosmic-dust,
.cosmic-mesh,
.cosmic-mesh-inner {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
}

/* Remove Box Shadows & Borders (Legacy Noise) */
* {
    box-shadow: none !important;
    outline: none !important;
}

/* Re-establish 'The Void' */
body, html, #root {
    background: #000000 !important;
}

/* THE WHITE LIGHT DATA FLOW */
h1, h2, h3, p, span {
    text-shadow: 0 0 5px rgba(255,255,255,0.3) !important;
}

/* P0 EMERGENCY SHIELD - Always Visible */
[data-testid="emergency-shutoff"] {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
}
`;

/**
 * @function purgeNoise
 * Injects Void CSS and kills legacy visual interference
 */
export function purgeNoise() {
    // Inject the Focal Shield into the Head
    const existingStyle = document.getElementById('v-engine-void-css');
    if (existingStyle) return; // Already purged
    
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.id = 'v-engine-void-css';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(VOID_CSS));
    head.appendChild(style);

    console.log("[V-ENGINE] Chaos Nuked. The Void is Focalized.");
}

/**
 * @function stopCapture
 * Kills hardware media streams causing the 'STOP' overlay
 */
export function stopCapture(stream) {
    if (!stream) {
        // Try to find global stream references
        const globalStream = window.localStream || window.mediaStream;
        if (globalStream) {
            let tracks = globalStream.getTracks();
            tracks.forEach(track => track.stop());
            console.log("[V-ENGINE] Stream stopped. Hardware released.");
        }
        return;
    }
    
    let tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    console.log("[V-ENGINE] Stream stopped. The 'STOP' overlay should vanish.");
}

/**
 * @function restoreVoid
 * Full void restoration - kills all visual noise
 */
export function restoreVoid() {
    purgeNoise();
    
    // Kill any running canvas animations
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
    });
    
    // Stop any media streams
    stopCapture(null);
    
    console.log("[V-ENGINE] Full void restoration complete.");
}

// Auto-execute on import (IIFE backup)
(function nukeTheChaos() {
    if (typeof document !== 'undefined') {
        // Delay to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', purgeNoise);
        } else {
            purgeNoise();
        }
    }
})();

export default { purgeNoise, stopCapture, restoreVoid };
