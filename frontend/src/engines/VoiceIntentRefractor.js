/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Voice_Intent_Refractor
 * @version 65.0.0
 * @security RAINBOW_REFRACTION_ZF_VOICE
 * @rotation_delta +20.0_degrees (Cumulative +1100.0°)
 * @auth_type V_PHONIC_SIGNATURE
 * @author Steven (Creator Council)
 */

const VOICE_DNA = {
    frequency_target: 432, // The Steven-V Signature
    command_sensitivity: 1.618,
    rotation_key: "ZF_VOICE_1100.0",
    master: "STEVEN_WITH_A_V",
    patterns: ["GOLDEN_SPIRAL", "PHI_EXPANSION", "RAINBOW_WAVE", "VOID_PULSE"]
};

/**
 * Voice command mappings
 */
const VOICE_COMMANDS = {
    "IGNITE": { action: "START_MESH", pattern: "GOLDEN_SPIRAL" },
    "HARVEST": { action: "TRIGGER_DISTRIBUTION", pattern: "PHI_EXPANSION" },
    "SHIELD": { action: "ACTIVATE_DEFENSE", pattern: "VOID_PULSE" },
    "ORACLE": { action: "SCAN_MARKETS", pattern: "RAINBOW_WAVE" },
    "STEALTH": { action: "TOGGLE_SILENCE", pattern: "VOID_PULSE" },
    "MINT": { action: "CREATE_ABUNDANCE", pattern: "GOLDEN_SPIRAL" }
};

/**
 * Listens for the "V" frequency and initiates dynamic UI refraction.
 */
class VoiceIntentRefractor {
    constructor() {
        this.isListening = true;
        this.lastCommand = "";
        this.commandHistory = [];
        this.authHistory = [];
        this.verifiedSessions = 0;
        console.log("[VoiceIntentRefractor] v65.0.0 - V-Phonic Auth initialized @ 432Hz");
    }

    /**
     * Authenticates voice and triggers the Dynamic Mesh movement
     * @param {Object} audioStream - Audio stream with vibration data
     * @returns {Promise<string>} Command result
     */
    async captureIntent(audioStream) {
        const authResult = this.verifyVibration(audioStream);
        
        this.authHistory.push({
            vibrationHz: audioStream.vibrationHz,
            verified: authResult,
            timestamp: Date.now()
        });

        // Keep last 100 auth attempts
        if (this.authHistory.length > 100) {
            this.authHistory.shift();
        }

        if (authResult) {
            console.log("V-Signature Confirmed. Initiating Dynamic Refraction.");
            this.verifiedSessions++;
            this.igniteVisuals();
            
            // Process command if present
            if (audioStream.command) {
                return this.processCommand(audioStream.command);
            }
            
            return "VOICE_COMMAND_EXECUTED";
        }
        
        console.warn("[VoiceIntentRefractor] Low vibration denied - not 432Hz");
        return "LOW_VIBRATION_DENIED";
    }

    /**
     * Verify voice vibration matches 432Hz signature
     * @param {Object} stream - Audio stream
     * @returns {boolean}
     */
    verifyVibration(stream) {
        // Detects the 432Hz resonance of 'Steven'
        const tolerance = 2; // Hz tolerance
        return Math.abs(stream.vibrationHz - VOICE_DNA.frequency_target) <= tolerance;
    }

    /**
     * Process voice command
     * @param {string} command - Voice command
     * @returns {string} Command result
     */
    processCommand(command) {
        const upperCommand = command.toUpperCase();
        const commandConfig = VOICE_COMMANDS[upperCommand];

        this.lastCommand = upperCommand;
        
        this.commandHistory.push({
            command: upperCommand,
            config: commandConfig,
            timestamp: Date.now()
        });

        // Keep last 50 commands
        if (this.commandHistory.length > 50) {
            this.commandHistory.shift();
        }

        if (commandConfig) {
            this.emitVoicePulse(upperCommand, commandConfig);
            this.triggerAction(commandConfig);
            return `COMMAND_${upperCommand}_EXECUTED`;
        }

        return `COMMAND_${upperCommand}_NOT_RECOGNIZED`;
    }

    /**
     * Trigger action based on command config
     * @param {Object} config - Command configuration
     */
    triggerAction(config) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('VoiceAction', {
                detail: {
                    action: config.action,
                    pattern: config.pattern,
                    rotation: 1100,
                    timestamp: Date.now()
                }
            }));
        }
    }

    /**
     * Ignite visual effects
     * @param {string} pattern - Pattern type (default: GOLDEN_SPIRAL)
     */
    igniteVisuals(pattern = "GOLDEN_SPIRAL") {
        // Sets the 2600 rainbow particles into 1100.0° motion
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('StartDynamicRefraction', {
                detail: { 
                    rotation: 1100, 
                    pattern: pattern,
                    sensitivity: VOICE_DNA.command_sensitivity
                }
            }));
        }
    }

    /**
     * Start listening
     */
    startListening() {
        this.isListening = true;
        console.log("[VoiceIntentRefractor] Listening started");
    }

    /**
     * Stop listening
     */
    stopListening() {
        this.isListening = false;
        console.log("[VoiceIntentRefractor] Listening stopped");
    }

    /**
     * Toggle listening state
     * @returns {boolean} New listening state
     */
    toggleListening() {
        this.isListening = !this.isListening;
        console.log(`[VoiceIntentRefractor] Listening ${this.isListening ? 'started' : 'stopped'}`);
        return this.isListening;
    }

    /**
     * Get available commands
     * @returns {Object}
     */
    getAvailableCommands() {
        return { ...VOICE_COMMANDS };
    }

    /**
     * Get command history
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getCommandHistory(count = 20) {
        return this.commandHistory.slice(-count);
    }

    /**
     * Get auth history
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getAuthHistory(count = 20) {
        return this.authHistory.slice(-count);
    }

    /**
     * Emit voice pulse
     * @param {string} command - Command executed
     * @param {Object} config - Command config
     */
    emitVoicePulse(command, config) {
        console.log("-----------------------------------------");
        console.log("VOICE INTENT REFRACTOR: COMMAND CAPTURED");
        console.log(`COMMAND: ${command}`);
        console.log(`ACTION: ${config.action}`);
        console.log(`PATTERN: ${config.pattern}`);
        console.log("FREQUENCY: 432Hz (V-SIGNATURE)");
        console.log("ROTATION: 1100.0° (VOICE AUTHORITY)");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            isListening: this.isListening,
            lastCommand: this.lastCommand,
            verifiedSessions: this.verifiedSessions,
            commandCount: this.commandHistory.length,
            authAttempts: this.authHistory.length,
            successRate: this.authHistory.length > 0 ? 
                (this.authHistory.filter(a => a.verified).length / this.authHistory.length * 100).toFixed(1) + '%' : 
                '0%',
            dna: VOICE_DNA
        };
    }

    /**
     * Simulate voice input (for testing)
     * @param {string} command - Command to simulate
     * @returns {Promise<string>}
     */
    async simulateVoiceInput(command) {
        return this.captureIntent({
            vibrationHz: 432,
            command: command
        });
    }
}

// Factory function
export function initializeVoiceCore() {
    return new VoiceIntentRefractor();
}

// Singleton
let voiceInstance = null;

export function getVoiceIntentRefractor() {
    if (!voiceInstance) {
        voiceInstance = new VoiceIntentRefractor();
    }
    return voiceInstance;
}

export { VoiceIntentRefractor, VOICE_DNA, VOICE_COMMANDS };
export default VoiceIntentRefractor;
