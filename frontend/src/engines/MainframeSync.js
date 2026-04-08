/**
 * ENLIGHTEN.MINT.CAFE - Mainframe Force-Connect Script
 * Target: Frequencies.js State Sync
 * 
 * @directive MAINFRAME_SYNC
 * @author Steven_with_a_V
 */

const API = process.env.REACT_APP_BACKEND_URL || 'https://zero-scale-physics.preview.emergentagent.com';

/**
 * @function syncMainframe
 * Force-connect to mainframe and sync frequency state
 */
export async function syncMainframe() {
    console.log("[V-ENGINE] Establishing connection to the mainframe...");
    
    const API_ENDPOINT = `${API}/api/frequencies`;
    
    try {
        const token = localStorage.getItem('zen_token') || localStorage.getItem('access_token');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        if (!response.ok) throw new Error(`Mainframe link failed: ${response.status}`);

        const data = await response.json();

        // VALIDATION: Ensure the data is not empty before injecting
        if (data && data.length > 0) {
            console.log("[V-ENGINE] Data retrieved. Injecting into frequency state...");
            
            // Force update the application state
            window.appState = window.appState || {};
            window.appState.frequencies = data;
            
            // Trigger a global custom event so the UI knows to re-render
            window.dispatchEvent(new CustomEvent('mainframeSyncComplete', { detail: data }));
            
            console.log("[V-ENGINE] System fully connected. Frequencies mapped:", data.length);
            return { success: true, data };
        } else {
            console.error("[V-ENGINE] Mainframe returned empty. Using fallback data.");
            return { success: false, error: 'Empty response' };
        }
    } catch (err) {
        console.error("[V-ENGINE] Critical Connection Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * @function forceReconnect
 * Nuclear option - clear cache and reload
 */
export function forceReconnect() {
    console.log("[V-ENGINE] Force reconnect initiated...");
    
    // Clear frequency-related cache
    sessionStorage.removeItem('frequencies_cache');
    localStorage.removeItem('frequencies_cache');
    
    // Trigger sync then reload
    syncMainframe().then(() => {
        location.reload();
    });
}

/**
 * @function injectFrequencies
 * Manually inject frequencies into app state
 */
export function injectFrequencies(data) {
    if (!data || data.length === 0) {
        console.warn("[V-ENGINE] Cannot inject empty frequency data");
        return false;
    }
    
    window.appState = window.appState || {};
    window.appState.frequencies = data;
    window.dispatchEvent(new CustomEvent('mainframeSyncComplete', { detail: data }));
    
    console.log("[V-ENGINE] Frequencies manually injected:", data.length);
    return true;
}

/**
 * @function getMainframeStatus
 * Check mainframe connection status
 */
export async function getMainframeStatus() {
    const API_ENDPOINT = `${API}/api/frequencies`;
    
    try {
        const start = Date.now();
        const response = await fetch(API_ENDPOINT, { method: 'HEAD' });
        const latency = Date.now() - start;
        
        return {
            connected: response.ok,
            latency,
            status: response.status,
            endpoint: API_ENDPOINT
        };
    } catch (err) {
        return {
            connected: false,
            error: err.message,
            endpoint: API_ENDPOINT
        };
    }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
    window.V_ENGINE = window.V_ENGINE || {};
    window.V_ENGINE.syncMainframe = syncMainframe;
    window.V_ENGINE.forceReconnect = forceReconnect;
    window.V_ENGINE.injectFrequencies = injectFrequencies;
    window.V_ENGINE.getMainframeStatus = getMainframeStatus;
    
    console.log("[V-ENGINE] Mainframe Sync module loaded. Commands: V_ENGINE.syncMainframe(), V_ENGINE.forceReconnect()");
}

export default {
    syncMainframe,
    forceReconnect,
    injectFrequencies,
    getMainframeStatus
};
