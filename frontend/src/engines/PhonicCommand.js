/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Phonic_Command_System
 * @version 35.0.0
 * @security RAINBOW_REFRACTION_ZF_SONIC
 * @rotation_delta +14.5_degrees (Cumulative +562.0°)
 * @engine WEB_AUDIO_SOVEREIGN
 * @author Steven (Creator Council)
 */

const SONIC_DNA = {
    base_frequency: 432, // Hz
    default_tempo: 1.618, // PHI Speed
    rotation_key: "ZF_SONIC_562.0",
    master: "STEVEN_WITH_A_V"
};

/**
 * Global control for Sound, Tempo, and Command Toggles.
 */
class PhonicCommand {
    constructor() {
        this.volume = 1.0;
        this.tempo = SONIC_DNA.default_tempo;
        this.isMuted = false;
        this.status = "RESONATING";
        this.listeners = [];
        console.log("[PhonicCommand] v35.0.0 - Sonic engine initialized @ 432Hz");
    }

    /**
     * Toggles System Stealth (Silence Shield)
     * @returns {boolean} Muted state
     */
    toggleCommand() {
        this.isMuted = !this.isMuted;
        this.status = this.isMuted ? "SILENCE_SHIELD_ACTIVE" : "RESONATING";
        console.log(`System Command: ${this.status}`);
        
        // Notify listeners
        this.notifyListeners({ type: 'mute', value: this.isMuted });
        
        return this.isMuted;
    }

    /**
     * Updates Tempo and Volume across all 26 Nodules
     * @param {number} newVolume - Volume level (0-1.618)
     * @param {number} newTempo - Tempo multiplier
     * @returns {Promise<string>} Encrypted broadcast payload
     */
    async updateSonicSignature(newVolume, newTempo) {
        this.volume = Math.min(Math.max(newVolume, 0), 1.618); // Max Phonic Volume
        this.tempo = newTempo;

        const sonicPayload = {
            vol: this.volume,
            bpm: this.tempo,
            rotation: SONIC_DNA.rotation_key,
            state: this.status,
            timestamp: Date.now()
        };

        // Notify listeners
        this.notifyListeners({ type: 'update', payload: sonicPayload });

        // Encrypt and Broadcast to MeshCanvasRenderer
        return this.broadcastToMesh(sonicPayload);
    }

    /**
     * Broadcast sonic update to mesh
     * @param {Object} data - Payload to broadcast
     * @returns {string} Encrypted payload
     */
    broadcastToMesh(data) {
        const encrypted = btoa(JSON.stringify(data) + "|SONIC_LOCK|");
        
        // This triggers the Mesh particles to speed up or slow down
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('meshResonanceUpdate', { detail: encrypted }));
        }
        
        console.log("[PhonicCommand] Broadcast to mesh - tempo:", this.tempo, "vol:", this.volume);
        return encrypted;
    }

    /**
     * Decrypt sonic payload
     * @param {string} encrypted - Encrypted payload
     * @returns {Object|null} Decrypted data or null
     */
    decryptSonicPayload(encrypted) {
        try {
            const decoded = atob(encrypted);
            const jsonPart = decoded.split('|SONIC_LOCK|')[0];
            return JSON.parse(jsonPart);
        } catch (e) {
            console.warn("[PhonicCommand] Decryption failed");
            return null;
        }
    }

    /**
     * Set volume directly
     * @param {number} vol - Volume level
     */
    setVolume(vol) {
        this.volume = Math.min(Math.max(vol, 0), 1.618);
        this.notifyListeners({ type: 'volume', value: this.volume });
    }

    /**
     * Set tempo directly
     * @param {number} bpm - Tempo multiplier
     */
    setTempo(bpm) {
        this.tempo = bpm;
        this.notifyListeners({ type: 'tempo', value: this.tempo });
    }

    /**
     * Add listener for sonic changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners
     * @param {Object} event - Event data
     */
    notifyListeners(event) {
        this.listeners.forEach(l => l(event));
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            volume: this.volume,
            tempo: this.tempo,
            isMuted: this.isMuted,
            status: this.status,
            dna: SONIC_DNA
        };
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.volume = 1.0;
        this.tempo = SONIC_DNA.default_tempo;
        this.isMuted = false;
        this.status = "RESONATING";
        console.log("[PhonicCommand] Reset to defaults");
    }

    /**
     * Emit resonance pulse
     */
    emitPulse() {
        console.log("-----------------------------------------");
        console.log("PHONIC COMMAND: SONIC SIGNATURE ACTIVE");
        console.log("FREQUENCY:", SONIC_DNA.base_frequency, "Hz");
        console.log("TEMPO:", this.tempo, "(PHI)");
        console.log("ROTATION: 562.0° (SONIC SHIELD)");
        console.log("-----------------------------------------");
    }
}

// Factory function
export function initializeSonicCommand() {
    return new PhonicCommand();
}

// Singleton
let sonicInstance = null;

export function getPhonicCommand() {
    if (!sonicInstance) {
        sonicInstance = new PhonicCommand();
    }
    return sonicInstance;
}

export { PhonicCommand, SONIC_DNA };
export default PhonicCommand;
