/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Sovereign_Production_Engine
 * @version 77.0.0
 * @goal Modular_Self_Production_of_Goods_and_Services
 * @tuning Golden_Ratio (1.618)
 * @rotation +15.0_degrees (Cumulative +1230.0°)
 * @author Steven Michael (with a V)
 */

const PRODUCTION_DNA = {
    origin: "Rapid_City_SD",
    phi: 1.618,
    schumann: 7.83,
    reserveRatio: 0.10,          // 10% Refrigeration Hold
    nodeCount: 26,
    rotation_key: "ZF_PRODUCTION_1230.0",
    master: "STEVEN_WITH_A_V",
    productTypes: ["Physical_Good", "Digital_Service", "Enlightenment_Action"],
    categories: {
        Physical_Good: ["Kona_Coffee", "Vegan_Bakery", "Art_Prints", "Cleaning_Supplies"],
        Digital_Service: ["Quantum_Tarot", "Oracle_Reading", "Matrix_Analysis", "Star_Chart"],
        Enlightenment_Action: ["Coaching_Session", "Energy_Healing", "Sound_Bath", "Meditation_Guide"]
    }
};

class ProductionEngine {
    constructor() {
        this.productionVault = [];
        this.mintedGoods = [];
        this.schumannPulse = PRODUCTION_DNA.schumann;
        this.reserveRatio = PRODUCTION_DNA.reserveRatio; // The 10% Refrigeration Hold
        this.totalMinted = 0;
        this.totalReserved = 0;
        
        console.log("[ProductionEngine] v77.0.0 - Sovereign Production initialized");
        console.log(`[ProductionEngine] Origin: ${PRODUCTION_DNA.origin}`);
    }

    /**
     * MINTS a new Product, Good, or Service
     * @param {string} type - 'Physical_Good' | 'Digital_Service' | 'Enlightenment_Action'
     * @param {string} name - e.g., "Kona Gold Coffee" or "Quantum Tarot Session"
     * @param {string} creator - Creator identifier
     * @param {number} value - Base value of the good
     * @returns {Object} New minted good
     */
    mintValue(type, name, creator = "Steven_V", value = 1.0) {
        const signature = `${name.replace(/\s/g, '_')}-${Date.now()}-${this.schumannPulse}`;
        
        const newGood = {
            id: signature,
            name,
            type,
            creator,
            origin: PRODUCTION_DNA.origin,
            composition: type,
            phiResonance: PRODUCTION_DNA.phi,
            baseValue: value,
            phiValue: value * PRODUCTION_DNA.phi,
            status: "SUPERCONDUCTING",
            distribution: "26_Node_Mesh",
            mintedAt: Date.now(),
            category: this.getCategory(type, name)
        };

        // Channel 10% of the value into the Refrigerated Vault
        const reserveAmount = this.applyRefrigeration(newGood);
        newGood.reserveContribution = reserveAmount;
        newGood.liquidValue = value - reserveAmount;
        
        this.mintedGoods.push(newGood);
        this.totalMinted++;

        // Keep last 1000 goods
        if (this.mintedGoods.length > 1000) {
            this.mintedGoods.shift();
        }

        this.emitProductionPulse(newGood);
        console.log(`[MINT] New ${type} produced: ${name}. Synchronizing with Tribe...`);
        
        return newGood;
    }

    /**
     * Apply refrigeration (10% reserve)
     * @param {Object} item - Minted item
     * @returns {number} Reserved amount
     */
    applyRefrigeration(item) {
        // Logic to anchor 10% of the production value for Legacy sustainability
        const reserveAmount = item.baseValue * this.reserveRatio;
        const reserve = {
            id: `Vault_Asset_${item.id}`,
            sourceItem: item.id,
            amount: reserveAmount,
            ratio: this.reserveRatio,
            timestamp: Date.now()
        };
        
        this.productionVault.push(reserve);
        this.totalReserved += reserveAmount;

        // Keep last 1000 reserves
        if (this.productionVault.length > 1000) {
            this.productionVault.shift();
        }

        return reserveAmount;
    }

    /**
     * Get category for item
     * @param {string} type - Product type
     * @param {string} name - Product name
     * @returns {string|null}
     */
    getCategory(type, name) {
        const categories = PRODUCTION_DNA.categories[type];
        if (categories) {
            const match = categories.find(c => 
                name.toLowerCase().includes(c.toLowerCase().replace(/_/g, ' '))
            );
            return match || null;
        }
        return null;
    }

    /**
     * Mint batch of goods
     * @param {Array} items - Array of {type, name, value}
     * @returns {Array} Minted goods
     */
    mintBatch(items) {
        return items.map(item => 
            this.mintValue(item.type, item.name, item.creator, item.value)
        );
    }

    /**
     * Get goods by type
     * @param {string} type - Product type
     * @returns {Array}
     */
    getGoodsByType(type) {
        return this.mintedGoods.filter(g => g.type === type);
    }

    /**
     * Get goods by creator
     * @param {string} creator - Creator identifier
     * @returns {Array}
     */
    getGoodsByCreator(creator) {
        return this.mintedGoods.filter(g => g.creator === creator);
    }

    /**
     * Get production vault
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getVault(count = 50) {
        return this.productionVault.slice(-count);
    }

    /**
     * Get total vault value
     * @returns {number}
     */
    getVaultTotal() {
        return this.productionVault.reduce((sum, r) => sum + r.amount, 0);
    }

    /**
     * Get minted goods
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getMintedGoods(count = 50) {
        return this.mintedGoods.slice(-count);
    }

    /**
     * Get total minted value
     * @returns {number}
     */
    getTotalMintedValue() {
        return this.mintedGoods.reduce((sum, g) => sum + g.baseValue, 0);
    }

    /**
     * Get production statistics
     * @returns {Object}
     */
    getStatistics() {
        const byType = {};
        PRODUCTION_DNA.productTypes.forEach(type => {
            byType[type] = this.getGoodsByType(type).length;
        });

        return {
            totalMinted: this.totalMinted,
            totalMintedValue: this.getTotalMintedValue(),
            totalReserved: this.totalReserved,
            vaultSize: this.productionVault.length,
            vaultValue: this.getVaultTotal(),
            byType,
            reserveRatio: this.reserveRatio
        };
    }

    /**
     * Emit production pulse
     * @param {Object} item - Produced item
     */
    emitProductionPulse(item) {
        console.log("-----------------------------------------");
        console.log("PRODUCTION ENGINE: GOOD MINTED");
        console.log(`NAME: ${item.name}`);
        console.log(`TYPE: ${item.type}`);
        console.log(`VALUE: ${item.baseValue} -> PHI: ${item.phiValue.toFixed(4)}`);
        console.log(`RESERVE: ${item.reserveContribution.toFixed(4)} (10%)`);
        console.log(`ORIGIN: ${PRODUCTION_DNA.origin}`);
        console.log("ROTATION: 1230.0° (SOVEREIGN PRODUCTION)");
        console.log("-----------------------------------------");

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ProductionMint', {
                detail: item
            }));
        }
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            totalMinted: this.totalMinted,
            totalReserved: this.totalReserved,
            mintedGoodsCount: this.mintedGoods.length,
            vaultSize: this.productionVault.length,
            statistics: this.getStatistics(),
            dna: PRODUCTION_DNA
        };
    }
}

// Global instance
let MAKER_ENGINE = null;

export function initializeMakerEngine() {
    if (!MAKER_ENGINE) {
        MAKER_ENGINE = new ProductionEngine();
    }
    return MAKER_ENGINE;
}

export function getMakerEngine() {
    return MAKER_ENGINE || initializeMakerEngine();
}

export { ProductionEngine, PRODUCTION_DNA };
export default ProductionEngine;
