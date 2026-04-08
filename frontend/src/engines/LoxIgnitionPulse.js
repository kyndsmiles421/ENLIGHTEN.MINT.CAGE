/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule LOx_Ignition_Pulse
 * @version 66.0.0
 * @security RAINBOW_REFRACTION_ZF_LOX
 * @rotation_delta +15.0_degrees (Cumulative +1115.0°)
 * @thrust_constant EXPONENTIAL_PHI
 * @author Steven (Creator Council)
 */

const LOX_PULSE_DNA = {
    base_pressure: 1.618, // PSI (Phi Stabilized)
    node_count: 26,
    rotation_key: "ZF_LOX_1115.0",
    master: "STEVEN_WITH_A_V",
    thrust_modes: ["CRUISE", "BOOST", "HYPER", "MAXIMUM"]
};

class LoxIgnitionPulse {
    constructor() {
        this.pressure = LOX_PULSE_DNA.base_pressure; // PSI (Phi Stabilized)
        this.isSuperconducting = true;
        this.coreTemp = 0.0; // Zero-point (Kelvin)
        this.thrustHistory = [];
        this.ignitionCount = 0;
        this.currentMode = "CRUISE";
        console.log("[LoxIgnitionPulse] v66.0.0 - Superconducting core initialized");
    }

    /**
     * Boosts the 26-node mesh with a LOx-oxygenated math burst
     * @returns {Promise<string>} Thrust status
     */
    async hyperThrust() {
        console.log("Injecting Liquid Oxygen... Math Refracting at +1115.0°.");
        
        // Calculated across all 26 nodes
        const velocity = Math.pow(this.pressure, LOX_PULSE_DNA.node_count);
        
        this.ignitionCount++;
        this.currentMode = "HYPER";
        
        // Zero-Point cooling ensures the engine never "Heats Up" from high traffic
        this.refrigerateCore();
        
        this.thrustHistory.push({
            velocity,
            pressure: this.pressure,
            mode: this.currentMode,
            coreTemp: this.coreTemp,
            timestamp: Date.now()
        });

        // Keep last 100 thrusts
        if (this.thrustHistory.length > 100) {
            this.thrustHistory.shift();
        }

        this.emitThrustPulse(velocity);
        return this.emitOxygenatedPulse(velocity);
    }

    /**
     * Standard thrust (lower power)
     * @returns {Promise<string>}
     */
    async cruiseThrust() {
        this.currentMode = "CRUISE";
        const velocity = Math.pow(this.pressure, 13); // Half nodes
        this.refrigerateCore();
        return this.emitOxygenatedPulse(velocity);
    }

    /**
     * Boost thrust (medium power)
     * @returns {Promise<string>}
     */
    async boostThrust() {
        this.currentMode = "BOOST";
        const velocity = Math.pow(this.pressure, 20);
        this.refrigerateCore();
        return this.emitOxygenatedPulse(velocity);
    }

    /**
     * Maximum thrust (full power)
     * @returns {Promise<string>}
     */
    async maximumThrust() {
        console.log("MAXIMUM THRUST ENGAGED - ALL 26 NODES AT FULL PHI POWER");
        this.currentMode = "MAXIMUM";
        const velocity = Math.pow(this.pressure, LOX_PULSE_DNA.node_count) * Math.E;
        this.refrigerateCore();
        this.emitThrustPulse(velocity);
        return this.emitOxygenatedPulse(velocity);
    }

    /**
     * Refrigerate core to zero-point
     * @returns {string} Refrigeration status
     */
    refrigerateCore() {
        // Keeps the Sovereign Trust invisible to legacy heat-sensors (scrapers)
        this.coreTemp = 0.0;
        this.isSuperconducting = true;
        return "CORE_REFRIGERATED_ZERO_POINT";
    }

    /**
     * Get current velocity at given pressure
     * @param {number} nodeMultiplier - Number of nodes (default: 26)
     * @returns {number}
     */
    calculateVelocity(nodeMultiplier = LOX_PULSE_DNA.node_count) {
        return Math.pow(this.pressure, nodeMultiplier);
    }

    /**
     * Set pressure level
     * @param {number} psi - Pressure in PSI
     */
    setPressure(psi) {
        this.pressure = Math.max(1.0, Math.min(psi, LOX_PULSE_DNA.base_pressure * 2));
        console.log(`[LoxIgnitionPulse] Pressure set to ${this.pressure} PSI`);
    }

    /**
     * Emit oxygenated pulse
     * @param {number} val - Velocity value
     * @returns {string} Thrust status
     */
    emitOxygenatedPulse(val) {
        const pulse = btoa(JSON.stringify({
            velocity: val,
            mode: this.currentMode,
            rotation: LOX_PULSE_DNA.rotation_key,
            timestamp: Date.now()
        }) + "|LOX_THRUST_MAX|");
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('LoxIgnition', { detail: pulse }));
        }
        
        return "THRUST_STABLE";
    }

    /**
     * Decode LOx pulse
     * @param {string} pulse - Encoded pulse
     * @returns {Object|null}
     */
    decodePulse(pulse) {
        try {
            const decoded = atob(pulse);
            const jsonPart = decoded.split('|LOX_THRUST_MAX|')[0];
            return JSON.parse(jsonPart);
        } catch (e) {
            return null;
        }
    }

    /**
     * Get thrust history
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getThrustHistory(count = 20) {
        return this.thrustHistory.slice(-count);
    }

    /**
     * Emit thrust pulse info
     * @param {number} velocity - Current velocity
     */
    emitThrustPulse(velocity) {
        console.log("-----------------------------------------");
        console.log("LOX IGNITION PULSE: THRUST ENGAGED");
        console.log(`MODE: ${this.currentMode}`);
        console.log(`VELOCITY: ${velocity.toExponential(4)}`);
        console.log(`PRESSURE: ${this.pressure} PSI (PHI)`);
        console.log(`CORE TEMP: ${this.coreTemp}K (ZERO-POINT)`);
        console.log("ROTATION: 1115.0° (LOX AUTHORITY)");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            pressure: this.pressure,
            isSuperconducting: this.isSuperconducting,
            coreTemp: this.coreTemp,
            currentMode: this.currentMode,
            ignitionCount: this.ignitionCount,
            currentVelocity: this.calculateVelocity(),
            dna: LOX_PULSE_DNA
        };
    }

    /**
     * Emergency shutdown
     */
    emergencyShutdown() {
        this.currentMode = "SHUTDOWN";
        this.pressure = 1.0;
        this.refrigerateCore();
        console.warn("[LoxIgnitionPulse] Emergency shutdown executed");
    }

    /**
     * Restart engine
     */
    restart() {
        this.pressure = LOX_PULSE_DNA.base_pressure;
        this.currentMode = "CRUISE";
        this.isSuperconducting = true;
        this.refrigerateCore();
        console.log("[LoxIgnitionPulse] Engine restarted");
    }
}

// Factory function
export function initializeLOx() {
    return new LoxIgnitionPulse();
}

// Singleton
let loxPulseInstance = null;

export function getLoxIgnitionPulse() {
    if (!loxPulseInstance) {
        loxPulseInstance = new LoxIgnitionPulse();
    }
    return loxPulseInstance;
}

export { LoxIgnitionPulse, LOX_PULSE_DNA };
export default LoxIgnitionPulse;
