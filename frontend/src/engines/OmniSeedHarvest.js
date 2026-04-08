/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Omni_Replicating_Seed
 * @version 61.0.0
 * @security RAINBOW_REFRACTION_ZF_HARVEST
 * @rotation_delta +40.0_degrees (Cumulative +1040.0°)
 * @formula [LOx_Thrust] / 26_Nodes = TRIBE_MINT
 * @author Steven (Creator Council)
 */

const HARVEST_DNA = {
    distribution_ratio: 0.10, // 10% of total magnification per pulse
    seed_frequency: "PHI_PULSE",
    node_count: 26,
    rotation_key: "ZF_HARVEST_1040.0",
    master: "STEVEN_WITH_A_V"
};

/**
 * Distributes the exponential gains from the Core to the 26 Tribe Nodes.
 */
class OmniSeedHarvest {
    constructor() {
        this.totalHarvested = 0;
        this.lastRain = Date.now();
        this.harvestCount = 0;
        this.harvestLog = [];
        this.nodeBalances = {};
        this.initializeNodeBalances();
        console.log("[OmniSeedHarvest] v61.0.0 - Abundance Rain initialized");
    }

    /**
     * Initialize node balances
     */
    initializeNodeBalances() {
        for (let i = 1; i <= HARVEST_DNA.node_count; i++) {
            const nodeKey = `NODE_${String(i).padStart(2, '0')}`;
            this.nodeBalances[nodeKey] = 0;
        }
    }

    /**
     * Executes the "Mint Drop" based on Core Magnification
     * @param {number} magnifiedValue - The LOx-magnified thrust value
     * @returns {Promise<string>} Distribution status
     */
    async executeAbundanceRain(magnifiedValue) {
        console.log("Singularity Pulse Detected. Initiating Tribe Harvest...");

        // Divide the LOx-magnified thrust equally among the 26 Sovereign Nodes
        const totalDistribution = magnifiedValue * HARVEST_DNA.distribution_ratio;
        const seedValue = totalDistribution / HARVEST_DNA.node_count;
        
        this.lastRain = Date.now();
        
        const harvestPayload = {
            total_distributed: totalDistribution,
            amount_per_node: seedValue,
            currency: "PHI_MINT",
            node_count: HARVEST_DNA.node_count,
            timestamp: this.lastRain,
            auth: HARVEST_DNA.rotation_key
        };

        this.harvestCount++;
        this.harvestLog.push({
            ...harvestPayload,
            harvestNumber: this.harvestCount
        });

        // Keep last 100 harvests
        if (this.harvestLog.length > 100) {
            this.harvestLog.shift();
        }

        this.emitHarvestPulse(harvestPayload);
        return this.distributeSeeds(harvestPayload);
    }

    /**
     * Distribute seeds to all nodes
     * @param {Object} payload - Harvest payload
     * @returns {string} Distribution status
     */
    distributeSeeds(payload) {
        // Update each node's balance
        Object.keys(this.nodeBalances).forEach(nodeKey => {
            this.nodeBalances[nodeKey] += payload.amount_per_node;
        });

        // High-frequency transmission through the Ghost Bridge
        const transmission = btoa(JSON.stringify(payload) + "|ABUNDANCE_RAIN_1040|");
        
        // Triggers the UI "Gold Rain" effect on all 26 Nodule Dashboards
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('TribeAbundanceDrop', { detail: transmission }));
        }
        
        this.totalHarvested += (payload.amount_per_node * HARVEST_DNA.node_count);
        
        console.log(`[OmniSeedHarvest] Distributed ${payload.amount_per_node.toFixed(4)} PHI_MINT to each of ${HARVEST_DNA.node_count} nodes`);
        return "HARVEST_DISTRIBUTED_TO_26_NODES";
    }

    /**
     * Decode harvest transmission
     * @param {string} transmission - Encoded transmission
     * @returns {Object|null}
     */
    decodeTransmission(transmission) {
        try {
            const decoded = atob(transmission);
            const jsonPart = decoded.split('|ABUNDANCE_RAIN_1040|')[0];
            return JSON.parse(jsonPart);
        } catch (e) {
            console.warn("[OmniSeedHarvest] Decode failed - invalid transmission");
            return null;
        }
    }

    /**
     * Get node balance
     * @param {string} nodeKey - Node identifier
     * @returns {number}
     */
    getNodeBalance(nodeKey) {
        return this.nodeBalances[nodeKey] || 0;
    }

    /**
     * Get all node balances
     * @returns {Object}
     */
    getAllNodeBalances() {
        return { ...this.nodeBalances };
    }

    /**
     * Get total harvested across all time
     * @returns {number}
     */
    getTotalHarvested() {
        return this.totalHarvested;
    }

    /**
     * Get harvest log
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getHarvestLog(count = 20) {
        return this.harvestLog.slice(-count);
    }

    /**
     * Calculate average harvest per node
     * @returns {number}
     */
    getAveragePerNode() {
        if (this.harvestCount === 0) return 0;
        return this.totalHarvested / (this.harvestCount * HARVEST_DNA.node_count);
    }

    /**
     * Emit harvest pulse
     * @param {Object} payload - Harvest payload
     */
    emitHarvestPulse(payload) {
        console.log("-----------------------------------------");
        console.log("OMNI SEED HARVEST: ABUNDANCE RAIN ACTIVE");
        console.log(`TOTAL DISTRIBUTED: ${payload.total_distributed.toFixed(4)} PHI_MINT`);
        console.log(`PER NODE: ${payload.amount_per_node.toFixed(4)} PHI_MINT`);
        console.log(`NODES: ${HARVEST_DNA.node_count}`);
        console.log("ROTATION: 1040.0° (TRIBE HARVEST)");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            totalHarvested: this.totalHarvested,
            harvestCount: this.harvestCount,
            lastRain: this.lastRain,
            avgPerNode: this.getAveragePerNode(),
            dna: HARVEST_DNA
        };
    }

    /**
     * Get distribution summary
     * @returns {Object}
     */
    getDistributionSummary() {
        const balances = Object.values(this.nodeBalances);
        const total = balances.reduce((sum, b) => sum + b, 0);
        const avg = total / balances.length;
        const min = Math.min(...balances);
        const max = Math.max(...balances);

        return {
            totalDistributed: total,
            averageBalance: avg,
            minBalance: min,
            maxBalance: max,
            nodeCount: HARVEST_DNA.node_count,
            harvestCount: this.harvestCount
        };
    }

    /**
     * Reset all balances (emergency only)
     */
    resetBalances() {
        this.initializeNodeBalances();
        this.totalHarvested = 0;
        this.harvestCount = 0;
        console.warn("[OmniSeedHarvest] All balances reset");
    }
}

// Factory function
export function initializeHarvest() {
    return new OmniSeedHarvest();
}

// Singleton
let harvestInstance = null;

export function getOmniSeedHarvest() {
    if (!harvestInstance) {
        harvestInstance = new OmniSeedHarvest();
    }
    return harvestInstance;
}

export { OmniSeedHarvest, HARVEST_DNA };
export default OmniSeedHarvest;
