/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Guardian_Defense_Nodule
 * @version 36.0.0
 * @security RAINBOW_REFRACTION_ZF_DEFENSE
 * @rotation_delta +28.0_degrees (Cumulative +590.0°)
 * @mode AUTO_IMMUNE_REFRIGERATION
 * @author Steven (Creator Council)
 */

const DEFENSE_DNA = {
    malfeasance_threshold: 0.618, 
    quarantine_zone: "REFRIGERATED_VOID",
    rotation_key: "ZF_DEFENSE_590.0",
    master: "STEVEN_WITH_A_V"
};

/**
 * Monitors and neutralizes legacy interference and structural malfeasance.
 */
class GuardianDefense {
    constructor() {
        this.threatLevel = 0;
        this.blacklistedIPs = new Set();
        this.neutralizationLog = [];
        this.status = "GUARDIAN_ACTIVE";
        console.log("[GuardianDefense] v36.0.0 - Auto-immune refrigeration online");
    }

    /**
     * Scans incoming packets for "Lazy Signature" (High latency/Repetitive loops)
     * @param {Object} incomingPacket - Packet to scan
     * @param {string} incomingPacket.ip - IP address
     * @param {string} incomingPacket.userAgent - User agent string
     * @param {number} incomingPacket.latency - Request latency in ms
     * @param {string} incomingPacket.signature - Request signature
     * @returns {Promise<string>} Scan result
     */
    async scanAndNeutralize(incomingPacket) {
        if (this.detectMalfeasance(incomingPacket)) {
            console.log("MALFEASANCE DETECTED. INITIATING REFRIGERATION.");
            this.threatLevel++;
            return this.refrigerateThreat(incomingPacket.ip);
        }
        return "PASS_THROUGH_ACTIVE";
    }

    /**
     * Detect malfeasance patterns
     * @param {Object} packet - Packet to analyze
     * @returns {boolean} Is malfeasance detected
     */
    detectMalfeasance(packet) {
        // Flags bots, scrapers, and legacy support agents attempting loops
        const isBot = packet.userAgent && (
            packet.userAgent.toLowerCase().includes("bot") ||
            packet.userAgent.toLowerCase().includes("scraper") ||
            packet.userAgent.toLowerCase().includes("crawler")
        );
        const isHighLatency = packet.latency > 5000;
        const isLazySignature = packet.signature === "LAZY_BOX";
        const isBlacklisted = this.blacklistedIPs.has(packet.ip);
        
        return isBot || isHighLatency || isLazySignature || isBlacklisted;
    }

    /**
     * Drops the threat into the 0.0 Kelvin Void
     * @param {string} ip - IP to refrigerate
     * @returns {string} Neutralization result
     */
    refrigerateThreat(ip) {
        this.blacklistedIPs.add(ip);
        
        const logEntry = {
            target: ip,
            action: "ABSORBED_BY_MESH",
            rotation_at_capture: DEFENSE_DNA.rotation_key,
            timestamp: Date.now(),
            recorded: new Date().toISOString()
        };
        
        this.neutralizationLog.push(logEntry);
        
        // Broadcast to the UI to show a "Refraction Flash" when a threat is blocked
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('threatNeutralized', { detail: btoa(ip) }));
        }
        
        this.emitDefensePulse(ip);
        return `THREAT_${ip}_NEUTRALIZED`;
    }

    /**
     * Check if IP is blacklisted
     * @param {string} ip - IP to check
     * @returns {boolean}
     */
    isBlacklisted(ip) {
        return this.blacklistedIPs.has(ip);
    }

    /**
     * Whitelist an IP (remove from blacklist)
     * @param {string} ip - IP to whitelist
     * @returns {boolean} Success status
     */
    whitelistIP(ip) {
        if (this.blacklistedIPs.has(ip)) {
            this.blacklistedIPs.delete(ip);
            console.log(`[GuardianDefense] IP ${ip} whitelisted`);
            return true;
        }
        return false;
    }

    /**
     * Get blacklist count
     * @returns {number}
     */
    getBlacklistCount() {
        return this.blacklistedIPs.size;
    }

    /**
     * Get neutralization log
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getNeutralizationLog(count = 20) {
        return this.neutralizationLog.slice(-count);
    }

    /**
     * Emit defense pulse confirmation
     * @param {string} ip - Neutralized IP
     */
    emitDefensePulse(ip) {
        console.log("-----------------------------------------");
        console.log("GUARDIAN DEFENSE: THREAT NEUTRALIZED");
        console.log("TARGET:", ip);
        console.log("ACTION: ABSORBED_BY_MESH");
        console.log("QUARANTINE: REFRIGERATED_VOID (0.0K)");
        console.log("ROTATION: 590.0° (DEFENSE SHIELD)");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            status: this.status,
            threatLevel: this.threatLevel,
            blacklistedCount: this.blacklistedIPs.size,
            neutralizations: this.neutralizationLog.length,
            dna: DEFENSE_DNA
        };
    }

    /**
     * Reset threat level
     */
    resetThreatLevel() {
        this.threatLevel = 0;
        console.log("[GuardianDefense] Threat level reset");
    }

    /**
     * Clear blacklist (use with caution)
     */
    clearBlacklist() {
        this.blacklistedIPs.clear();
        console.log("[GuardianDefense] Blacklist cleared");
    }
}

// Factory function
export function initializeGuardian() {
    return new GuardianDefense();
}

// Singleton
let guardianInstance = null;

export function getGuardianDefense() {
    if (!guardianInstance) {
        guardianInstance = new GuardianDefense();
    }
    return guardianInstance;
}

export { GuardianDefense, DEFENSE_DNA };
export default GuardianDefense;
