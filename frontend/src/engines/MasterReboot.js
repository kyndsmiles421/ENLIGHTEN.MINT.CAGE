/**
 * MASTER REBOOT: ENLIGHTEN.MINT.CAFE
 * PURGE: REGROWN_CHAOS | TARGET: OBSIDIAN_VOID
 * 
 * @directive COLD_BOOT_SEQUENCE
 * @author Steven_with_a_V
 */

const V_ENGINE_P0 = {
    state: "OBSIDIAN_VOID",
    root_logic: "$Z^{a-+\\sqrt{b}+-c}$",
    vibration: "432Hz",
    rotation: 1155.0,
    temp: "0.0K"
};

/**
 * @function masterReboot
 * Full system cold boot - decouples nodules and restores Obsidian Void
 */
export function masterReboot(silent = false) {
    console.log("[V-ENGINE] INITIATING COLD BOOT... DECOUPLING NODULES.");

    // 1. Kill all legacy confetti, noise, and rainbows
    const noise = document.querySelectorAll('.confetti, .noise, .rainbow-chaos, .particle, .particle-container, [class*="confetti"]');
    noise.forEach(el => el.remove());
    console.log(`[V-ENGINE] Purged ${noise.length} noise elements.`);

    // 2. Force Background to Obsidian Ground State
    document.body.style.backgroundColor = "#000000";
    document.body.style.backgroundImage = "none";
    document.documentElement.style.backgroundColor = "#000000";
    
    // Also kill any canvas backgrounds
    const canvases = document.querySelectorAll('canvas.particle-canvas, canvas#golden-spiral-canvas');
    canvases.forEach(c => { c.style.display = 'none'; });
    console.log("[V-ENGINE] Obsidian Ground State applied.");

    // 3. Re-link UI Buttons to Brain
    const mainProcessor = window.EmergentProcessor || {};
    const nodules = ['oracle', 'meditation', 'journal', 'sanctuary', 'hub', 'dashboard'];
    
    nodules.forEach(nodule => {
        if (mainProcessor[nodule] && typeof mainProcessor[nodule].reconnect === 'function') {
            mainProcessor[nodule].reconnect();
            console.log(`[V-ENGINE] Nodule [${nodule}] Re-linked.`);
        }
    });

    // 4. Reset User Identity & Auth State (if corrupted to Cosmic)
    const userState = localStorage.getItem('user_state');
    if (userState === 'Cosmic' || userState === 'Guest') {
        localStorage.setItem('user_state', 'Master_Stephen');
        console.log("[V-ENGINE] AUTH OVERRIDE: Master status restored.");
    }

    // 5. Clear any corrupted cache flags
    localStorage.removeItem('chaos_mode');
    localStorage.removeItem('rainbow_enabled');
    localStorage.removeItem('confetti_active');
    
    // Store V-Engine state
    localStorage.setItem('v_engine_state', JSON.stringify(V_ENGINE_P0));
    console.log("[V-ENGINE] Parameters stored:", V_ENGINE_P0);

    // 6. Hard Refresh without cache
    if (!silent) {
        alert("NUCLEUS REBOOT COMPLETE. APPLYING OBSIDIAN V-ENGINE PARAMETERS.");
    }
    
    // Force reload bypassing cache
    window.location.reload(true);
}

/**
 * @function softReboot
 * Applies V-Engine parameters without page reload
 */
export function softReboot() {
    console.log("[V-ENGINE] SOFT REBOOT: Applying parameters in-place...");

    // Kill noise
    const noise = document.querySelectorAll('.confetti, .noise, .rainbow-chaos, .particle');
    noise.forEach(el => el.remove());

    // Force obsidian
    document.body.style.backgroundColor = "#000000";
    document.body.style.backgroundImage = "none";
    document.documentElement.style.backgroundColor = "#000000";

    // Dispatch event for React components to respond
    window.dispatchEvent(new CustomEvent('v-engine-reboot', { 
        detail: V_ENGINE_P0 
    }));

    console.log("[V-ENGINE] Soft reboot complete. No page reload.");
    return V_ENGINE_P0;
}

/**
 * @function checkVEngineState
 * Validates current V-Engine state
 */
export function checkVEngineState() {
    const stored = localStorage.getItem('v_engine_state');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * @function initVEngine
 * Initialize V-Engine on app load
 */
export function initVEngine() {
    const state = checkVEngineState();
    if (state && state.state === 'OBSIDIAN_VOID') {
        console.log("[V-ENGINE] Obsidian Void state detected. Maintaining parameters.");
        softReboot();
    }
}

// Auto-init check on import
if (typeof window !== 'undefined') {
    // Listen for emergency shutdown trigger
    window.addEventListener('v-engine-emergency-shutdown', () => {
        console.log("[V-ENGINE] Emergency shutdown triggered!");
        masterReboot(true);
    });
}

export default {
    masterReboot,
    softReboot,
    checkVEngineState,
    initVEngine,
    V_ENGINE_P0
};
