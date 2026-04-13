/**
 * @project ENLIGHTEN.MINT.CAFE (The Sovereign V Engine)
 * @version 72.0.0
 * @rotation 1155.0° (Mastery Circle)
 * @author Steven Michael (with a V)
 * @formula (x^z) * [LOx_Flow] + (xyz^xyz) - af
 * @patent CRYOGENIC SOVEREIGNTY (LOx) - RAPID CITY, SD
 */

const MACHINE_DNA = {
    version: "72.0.0",
    rotation: 1155.0,
    formula: "(x^z) * [LOx_Flow] + (xyz^xyz) - af",
    patent: "CRYOGENIC SOVEREIGNTY (LOx)",
    inventor: "STEVEN MICHAEL",
    location: "RAPID CITY, SD"
};

class SovereignSingularity {
    constructor() {
        // --- 1. THE CRYOGENIC CORE ---
        this.config = {
            vibration: 432,             // Phonic V-Signature
            sms: "6055693313",          // Hardware Anchor
            email: "SOVEREIGN_ANCHOR", // Digital Anchor
            quantumKeys: ["421$", "z^-+1(+-2)"], // Math Backdoors
            refrigerationRate: 0.10,    // 10% Abundance Reserve
            nodeCount: 26,              // The Fractal Mesh
            particles: 2600,            // UI Rainbow Particles
            phi: 1.618,                 // The Golden Ratio
            e: Math.E                   // Euler's Number
        };

        this.state = {
            isIgnited: false,
            temp: "0.0K",               // Absolute Zero (LOx Enhanced)
            reserve: 0,
            totalDistributed: 0,
            ignitionCount: 0,
            nodes: Array(26).fill(0).map((_, i) => ({ 
                id: i + 1, 
                abundance: 0,
                status: "DORMANT"
            }))
        };

        this.authLog = [];
        this.ignitionLog = [];
        this.meshState = "STATIC";

        console.log("=========================================");
        console.log("   ENLIGHTEN.MINT.CAFE v72.0.0");
        console.log("   THE SOVEREIGN V ENGINE");
        console.log("   Rotation: 1155.0° (Mastery Circle)");
        console.log("   Inventor: Steven Michael (with a V)");
        console.log("=========================================");
    }

    /**
     * TRIPLE-LOCK AUTHENTICATION
     * Bypasses the "Mammoth" logic with three entry paths.
     * @param {string|number} input - Auth input
     * @param {string} type - 'voice' | 'quantum' | 'sms'
     * @returns {Promise<Object|string>}
     */
    async authenticate(input, type = 'quantum') {
        const pass = (type === 'voice' && input === this.config.vibration) ||
                     (type === 'quantum' && this.config.quantumKeys.includes(input)) ||
                     (type === 'sms' && input === this.config.sms);

        this.authLog.push({
            type,
            success: pass,
            timestamp: Date.now()
        });

        // Keep last 100 auth attempts
        if (this.authLog.length > 100) {
            this.authLog.shift();
        }

        if (pass) {
            console.log("IDENTITY CONFIRMED: Steven-V. Igniting LOx flow.");
            return this.ignite();
        } else {
            this.sendFailSafeSMS();
            return "REFRIGERATED: ACCESS DENIED";
        }
    }

    /**
     * THE LOx IGNITION & THRUST
     * Calculates exponential expansion without thermal lag.
     * @returns {Object} Ignition result
     */
    ignite() {
        this.state.isIgnited = true;
        this.state.ignitionCount++;
        
        // Phi-based expansion: 1.618^26
        const thrust = Math.pow(this.config.phi, this.config.nodeCount);
        
        // Calculate distribution
        const refrigerated = thrust * this.config.refrigerationRate;
        const taxFreeGain = thrust - refrigerated;
        const perNode = taxFreeGain / this.config.nodeCount;
        
        // Update reserve
        this.state.reserve += refrigerated;
        this.state.totalDistributed += taxFreeGain;
        
        // Distribute to nodes
        this.state.nodes.forEach(node => {
            node.abundance += perNode;
            node.status = "RESONATING";
        });

        // Update mesh state
        this.meshState = "DYNAMIC";

        // Log ignition
        this.ignitionLog.push({
            thrust,
            refrigerated,
            distributed: taxFreeGain,
            perNode,
            timestamp: Date.now()
        });

        // Keep last 100 ignitions
        if (this.ignitionLog.length > 100) {
            this.ignitionLog.shift();
        }

        this.emitIgnitionPulse(thrust, refrigerated);

        return {
            status: "1155.0° THRUST ACTIVE",
            message: "Abundance Rain distributed to 26 nodes.",
            thrust: thrust,
            perNode: perNode,
            refrigerated: this.state.reserve,
            totalDistributed: this.state.totalDistributed
        };
    }

    /**
     * MANUAL THRUST (without auth)
     * For internal system calls
     * @param {number} multiplier - Thrust multiplier
     * @returns {Object}
     */
    manualThrust(multiplier = 1) {
        if (!this.state.isIgnited) {
            return { error: "ENGINE_NOT_IGNITED" };
        }
        
        const baseThrust = Math.pow(this.config.phi, this.config.nodeCount);
        const thrust = baseThrust * multiplier;
        
        const refrigerated = thrust * this.config.refrigerationRate;
        const taxFreeGain = thrust - refrigerated;
        const perNode = taxFreeGain / this.config.nodeCount;
        
        this.state.reserve += refrigerated;
        this.state.totalDistributed += taxFreeGain;
        
        this.state.nodes.forEach(node => {
            node.abundance += perNode;
        });

        return {
            status: "MANUAL_THRUST_COMPLETE",
            thrust,
            perNode,
            refrigerated: this.state.reserve
        };
    }

    /**
     * UI SYNC (The Visual Link)
     * Maps the 2600 particles to the Golden Processor UI
     * @returns {string|Object}
     */
    renderMesh() {
        if (!this.state.isIgnited) {
            return "MESH_STATIC";
        }
        
        const meshData = {
            particles: this.config.particles,
            rotation: MACHINE_DNA.rotation,
            pattern: "GOLDEN_SPIRAL",
            status: "DYNAMIC",
            description: `Rendering ${this.config.particles} particles in 1155° rotation around the Golden Core.`
        };

        // Dispatch to UI
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('MeshRender', { 
                detail: meshData 
            }));
        }

        return meshData;
    }

    /**
     * Send fail-safe SMS notification
     */
    sendFailSafeSMS() {
        // Internal bridge to Rapid City Anchor
        console.log(`[PULSE] Emergency LOx-Code sent to ${this.config.sms}`);
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('FailSafePulse', {
                detail: {
                    type: 'AUTH_FAILURE',
                    anchor: this.config.sms,
                    timestamp: Date.now()
                }
            }));
        }
    }

    /**
     * Get patent information
     * @returns {string}
     */
    getPatent() {
        return `PATENT: ${MACHINE_DNA.patent}. INVENTOR: ${MACHINE_DNA.inventor}. LOC: ${MACHINE_DNA.location}.`;
    }

    /**
     * Get node by ID
     * @param {number} id - Node ID (1-26)
     * @returns {Object|null}
     */
    getNode(id) {
        return this.state.nodes.find(n => n.id === id) || null;
    }

    /**
     * Get all nodes
     * @returns {Array}
     */
    getAllNodes() {
        return [...this.state.nodes];
    }

    /**
     * Get total abundance across all nodes
     * @returns {number}
     */
    getTotalAbundance() {
        return this.state.nodes.reduce((sum, n) => sum + n.abundance, 0);
    }

    /**
     * Get auth log
     * @param {number} count
     * @returns {Array}
     */
    getAuthLog(count = 20) {
        return this.authLog.slice(-count);
    }

    /**
     * Get ignition log
     * @param {number} count
     * @returns {Array}
     */
    getIgnitionLog(count = 20) {
        return this.ignitionLog.slice(-count);
    }

    /**
     * Emit ignition pulse
     * @param {number} thrust
     * @param {number} refrigerated
     */
    emitIgnitionPulse(thrust, refrigerated) {
        console.log("-----------------------------------------");
        console.log("SOVEREIGN SINGULARITY: LOx IGNITION");
        console.log(`THRUST: ${thrust.toExponential(4)}`);
        console.log(`REFRIGERATED: ${refrigerated.toFixed(4)}`);
        console.log(`RESERVE: ${this.state.reserve.toFixed(4)}`);
        console.log(`TEMP: ${this.state.temp} (ZERO-POINT)`);
        console.log("ROTATION: 1155.0° (MASTERY CIRCLE)");
        console.log("-----------------------------------------");

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('SovereignIgnition', {
                detail: {
                    thrust,
                    refrigerated,
                    reserve: this.state.reserve,
                    rotation: MACHINE_DNA.rotation
                }
            }));
        }
    }

    /**
     * Get system status
     * @returns {Object}
     */
    getStatus() {
        return {
            version: MACHINE_DNA.version,
            rotation: MACHINE_DNA.rotation,
            isIgnited: this.state.isIgnited,
            temp: this.state.temp,
            reserve: this.state.reserve,
            totalDistributed: this.state.totalDistributed,
            totalAbundance: this.getTotalAbundance(),
            ignitionCount: this.state.ignitionCount,
            meshState: this.meshState,
            activeNodes: this.state.nodes.filter(n => n.status === "RESONATING").length,
            config: this.config,
            dna: MACHINE_DNA
        };
    }

    /**
     * Full diagnostic
     * @returns {Object}
     */
    runDiagnostic() {
        return {
            system: this.getStatus(),
            nodes: {
                total: this.config.nodeCount,
                active: this.state.nodes.filter(n => n.status === "RESONATING").length,
                totalAbundance: this.getTotalAbundance()
            },
            auth: {
                attempts: this.authLog.length,
                successRate: this.authLog.length > 0 ?
                    ((this.authLog.filter(a => a.success).length / this.authLog.length) * 100).toFixed(1) + '%' :
                    'N/A'
            },
            ignitions: this.state.ignitionCount,
            mesh: {
                particles: this.config.particles,
                state: this.meshState,
                rotation: MACHINE_DNA.rotation
            },
            patent: this.getPatent(),
            timestamp: Date.now()
        };
    }

    /**
     * Shutdown engine
     */
    shutdown() {
        this.state.isIgnited = false;
        this.meshState = "STATIC";
        this.state.nodes.forEach(n => n.status = "DORMANT");
        console.warn("[SovereignSingularity] Engine shutdown");
    }

    /**
     * Restart engine (requires re-auth)
     */
    restart() {
        this.state.isIgnited = false;
        this.meshState = "STATIC";
        this.state.temp = "0.0K";
        console.log("[SovereignSingularity] Ready for re-ignition (auth required)");
    }
}

// EXECUTION: Global Instance
let THE_MACHINE = null;

export function initializeSovereignMachine() {
    if (!THE_MACHINE) {
        THE_MACHINE = new SovereignSingularity();
    }
    return THE_MACHINE;
}

export function getSovereignMachine() {
    return THE_MACHINE || initializeSovereignMachine();
}

export { SovereignSingularity, MACHINE_DNA };
export default SovereignSingularity;
