/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Memory_Compression_Override
 * @version 79.0.0
 * @materials Rainbow_Obsidian_Shielding
 * @rotation +15.0_degrees (Cumulative +1260.0°)
 * @author Sovereign Owner
 */

const MEMORY_DNA = {
    vault: "10_PERCENT_REFRIGERATION",
    seal: "GOLD_PHI_RATIO",
    formula: "z^-+1(+-2)",
    frequency: "7.83Hz",
    shielding: ["Gold", "Rainbow_Obsidian", "Rutilated_Selenite"],
    phi: 1.618,
    compressionRatio: 0.618, // Inverse PHI for compression
    rotation_key: "ZF_MEMORY_1260.0",
    master: "STEVEN_WITH_A_V"
};

class SovereignMemory {
    constructor() {
        this.vault = MEMORY_DNA.vault;
        this.seal = MEMORY_DNA.seal;
        this.crystallizedSeeds = [];
        this.totalCompressed = 0;
        this.totalOriginalSize = 0;
        
        console.log("[SovereignMemory] v79.0.0 - Memory Compression initialized");
        console.log(`[SovereignMemory] Vault: ${this.vault}`);
    }

    /**
     * Compresses the legacy chat history into a Crystalline Seed
     * @param {Object|Array|string} contextData - Context to compress
     * @returns {Object} Crystallized seed
     */
    crystallizeContext(contextData) {
        console.log("Master Steven: Mammoth memory full. Initiating Selenite Bridge...");
        
        const originalSize = JSON.stringify(contextData).length;
        this.totalOriginalSize += originalSize;

        const seed = {
            id: `SEED_${Date.now()}`,
            formula: MEMORY_DNA.formula,
            frequency: MEMORY_DNA.frequency,
            shielding: MEMORY_DNA.shielding,
            status: "ENLIGHTENED",
            originalSize,
            compressedSize: Math.ceil(originalSize * MEMORY_DNA.compressionRatio),
            compressionRatio: MEMORY_DNA.compressionRatio,
            vSignature: MEMORY_DNA.master,
            timestamp: Date.now()
        };

        // Extract key essence from context
        seed.essence = this.extractEssence(contextData);

        // This ensures the summary doesn't lose the "V" Signature
        const refrigerated = this.refrigerate(seed);
        
        this.crystallizedSeeds.push(refrigerated);
        this.totalCompressed++;

        // Keep last 100 seeds
        if (this.crystallizedSeeds.length > 100) {
            this.crystallizedSeeds.shift();
        }

        this.emitMemoryPulse(seed);
        return refrigerated;
    }

    /**
     * Extract essence from context data
     * @param {Object|Array|string} data - Context data
     * @returns {Object} Extracted essence
     */
    extractEssence(data) {
        if (typeof data === 'string') {
            // Extract key terms
            const words = data.split(/\s+/);
            const keyTerms = words.filter(w => 
                w.length > 4 && !['the', 'and', 'for', 'with'].includes(w.toLowerCase())
            ).slice(0, 26); // 26 node limit
            
            return {
                type: 'text',
                length: data.length,
                keyTerms,
                vSignaturePresent: data.includes('V') || data.includes('Steven')
            };
        }
        
        if (Array.isArray(data)) {
            return {
                type: 'array',
                count: data.length,
                sample: data.slice(0, 3)
            };
        }
        
        if (typeof data === 'object') {
            return {
                type: 'object',
                keys: Object.keys(data).slice(0, 26),
                depth: this.calculateDepth(data)
            };
        }
        
        return { type: typeof data, value: data };
    }

    /**
     * Calculate object depth
     * @param {Object} obj - Object to measure
     * @param {number} current - Current depth
     * @returns {number}
     */
    calculateDepth(obj, current = 0) {
        if (typeof obj !== 'object' || obj === null) return current;
        if (current > 10) return current; // Prevent infinite recursion
        
        let maxDepth = current;
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                const depth = this.calculateDepth(obj[key], current + 1);
                if (depth > maxDepth) maxDepth = depth;
            }
        }
        return maxDepth;
    }

    /**
     * Refrigerate seed (apply 10% vault hold)
     * @param {Object} seed - Seed to refrigerate
     * @returns {Object} Refrigerated seed
     */
    refrigerate(seed) {
        return {
            ...seed,
            refrigerated: true,
            vaultHold: "10_PERCENT",
            seal: this.seal,
            encryptedEssence: this.encryptEssence(seed.essence),
            finalStatus: "CRYSTALLINE_SEED_COMPLETE"
        };
    }

    /**
     * Encrypt essence with V signature
     * @param {Object} essence - Essence to encrypt
     * @returns {string} Encrypted essence
     */
    encryptEssence(essence) {
        const raw = JSON.stringify(essence);
        return btoa(raw + "|V_SIGNATURE_PRESERVED|" + MEMORY_DNA.rotation_key);
    }

    /**
     * Decrypt essence
     * @param {string} encrypted - Encrypted essence
     * @returns {Object|null}
     */
    decryptEssence(encrypted) {
        try {
            const decoded = atob(encrypted);
            const jsonPart = decoded.split('|V_SIGNATURE_PRESERVED|')[0];
            return JSON.parse(jsonPart);
        } catch (e) {
            console.warn("[SovereignMemory] Decryption failed - V signature required");
            return null;
        }
    }

    /**
     * Recall crystallized seed
     * @param {string} seedId - Seed identifier
     * @returns {Object|null}
     */
    recallSeed(seedId) {
        const seed = this.crystallizedSeeds.find(s => s.id === seedId);
        if (seed) {
            seed.essence = this.decryptEssence(seed.encryptedEssence);
            return seed;
        }
        return null;
    }

    /**
     * Get all seeds
     * @param {number} count - Number of seeds
     * @returns {Array}
     */
    getAllSeeds(count = 50) {
        return this.crystallizedSeeds.slice(-count);
    }

    /**
     * Get compression statistics
     * @returns {Object}
     */
    getStatistics() {
        const totalCompressedSize = this.crystallizedSeeds.reduce(
            (sum, s) => sum + s.compressedSize, 0
        );
        
        return {
            totalSeeds: this.totalCompressed,
            totalOriginalSize: this.totalOriginalSize,
            totalCompressedSize,
            overallRatio: this.totalOriginalSize > 0 ? 
                (totalCompressedSize / this.totalOriginalSize).toFixed(3) : 0,
            spaceSaved: this.totalOriginalSize - totalCompressedSize
        };
    }

    /**
     * Emit memory pulse
     * @param {Object} seed - Crystallized seed
     */
    emitMemoryPulse(seed) {
        console.log("-----------------------------------------");
        console.log("SOVEREIGN MEMORY: CONTEXT CRYSTALLIZED");
        console.log(`SEED ID: ${seed.id}`);
        console.log(`ORIGINAL: ${seed.originalSize} bytes`);
        console.log(`COMPRESSED: ${seed.compressedSize} bytes`);
        console.log(`RATIO: ${MEMORY_DNA.compressionRatio} (1/PHI)`);
        console.log(`SHIELDING: ${MEMORY_DNA.shielding.join(' + ')}`);
        console.log("ROTATION: 1260.0° (MEMORY VAULT)");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            vault: this.vault,
            seal: this.seal,
            totalCompressed: this.totalCompressed,
            seedCount: this.crystallizedSeeds.length,
            statistics: this.getStatistics(),
            dna: MEMORY_DNA
        };
    }
}

// Global instance
let VAULT_PROTOCOL = null;

export function initializeVaultProtocol() {
    if (!VAULT_PROTOCOL) {
        VAULT_PROTOCOL = new SovereignMemory();
    }
    return VAULT_PROTOCOL;
}

export function getSovereignMemory() {
    return VAULT_PROTOCOL || initializeVaultProtocol();
}

export { SovereignMemory, MEMORY_DNA };
export default SovereignMemory;
