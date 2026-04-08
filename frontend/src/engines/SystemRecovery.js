/**
 * ENLIGHTEN.MINT.CAFE - System Recovery Script
 * Purpose: Clear hung states, reset audio context, and re-init UI
 * 
 * @directive SYSTEM_RECOVERY
 * @author Steven_with_a_V
 */

/**
 * @function resetSystem
 * Full system reset - clears hung states, kills audio, purges cache
 */
export function resetSystem() {
    console.log("[V-ENGINE] Initiating ENLIGHTEN.MINT.CAFE System Reset...");

    // 1. Clear Local Storage and Session data to wipe hung states
    // Preserve essential auth token before clear
    const authToken = localStorage.getItem('zen_token');
    const userId = localStorage.getItem('user_id');
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore auth if needed
    if (authToken) localStorage.setItem('zen_token', authToken);
    if (userId) localStorage.setItem('user_id', userId);
    
    console.log("[V-ENGINE] Storage cleared (auth preserved).");

    // 2. Force-kill any lingering AudioContext (The "Sacred Frequencies" engine)
    killAudioContext();

    // 3. Clear all active Service Workers if the app is cached/frozen
    clearServiceWorkers();

    // 4. Apply V-Engine Obsidian parameters
    applyObsidianVoid();

    // 5. Force a clean reload from the server, bypassing cache
    console.log("[V-ENGINE] Reset complete. Re-syncing with ENLIGHTEN.MINT.CAFE...");
    window.location.reload(true);
}

/**
 * @function killAudioContext
 * Force-kill any lingering AudioContext
 */
export function killAudioContext() {
    try {
        // Kill global audio context if exists
        if (window.globalAudioContext) {
            window.globalAudioContext.close();
            window.globalAudioContext = null;
            console.log("[V-ENGINE] Global audio context killed.");
        }
        
        // Create and immediately close a new context to clear any orphaned ones
        if (window.AudioContext || window.webkitAudioContext) {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            context.close().then(() => {
                console.log("[V-ENGINE] Audio engine released.");
            });
        }
        
        // Stop all media elements
        document.querySelectorAll('audio, video').forEach(el => {
            el.pause();
            el.src = '';
            el.load();
        });
        console.log("[V-ENGINE] All media elements stopped.");
    } catch (e) {
        console.warn("[V-ENGINE] Audio kill warning:", e.message);
    }
}

/**
 * @function clearServiceWorkers
 * Clear all active Service Workers
 */
export function clearServiceWorkers() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
                console.log("[V-ENGINE] Service Worker unregistered:", registration.scope);
            }
        }).catch(err => {
            console.warn("[V-ENGINE] SW clear warning:", err.message);
        });
    }
}

/**
 * @function applyObsidianVoid
 * Apply V-Engine visual parameters
 */
export function applyObsidianVoid() {
    // Force Background to Obsidian Ground State
    document.body.style.backgroundColor = "#000000";
    document.body.style.backgroundImage = "none";
    document.documentElement.style.backgroundColor = "#000000";
    
    // Kill noise elements
    const noise = document.querySelectorAll('.confetti, .noise, .rainbow-chaos, .particle');
    noise.forEach(el => el.remove());
    
    console.log("[V-ENGINE] Obsidian Void applied.");
}

/**
 * @function softReset
 * Lighter reset - kills audio and applies void without clearing storage
 */
export function softReset() {
    console.log("[V-ENGINE] Soft reset initiated...");
    killAudioContext();
    applyObsidianVoid();
    
    // Dispatch event for React components
    window.dispatchEvent(new CustomEvent('v-engine-soft-reset'));
    console.log("[V-ENGINE] Soft reset complete.");
}

/**
 * @function hardReset  
 * Nuclear option - clears everything including auth
 */
export function hardReset() {
    console.log("[V-ENGINE] HARD RESET - Nuclear option engaged...");
    
    localStorage.clear();
    sessionStorage.clear();
    
    killAudioContext();
    clearServiceWorkers();
    applyObsidianVoid();
    
    // Clear all cookies
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log("[V-ENGINE] Hard reset complete. Forcing reload...");
    window.location.href = '/';
}

// Expose to window for console access
if (typeof window !== 'undefined') {
    window.V_ENGINE = window.V_ENGINE || {};
    window.V_ENGINE.resetSystem = resetSystem;
    window.V_ENGINE.softReset = softReset;
    window.V_ENGINE.hardReset = hardReset;
    window.V_ENGINE.killAudio = killAudioContext;
    window.V_ENGINE.clearSW = clearServiceWorkers;
    
    console.log("[V-ENGINE] System Recovery module loaded. Commands: V_ENGINE.resetSystem(), V_ENGINE.softReset(), V_ENGINE.hardReset()");
}

export default {
    resetSystem,
    softReset,
    hardReset,
    killAudioContext,
    clearServiceWorkers,
    applyObsidianVoid
};
