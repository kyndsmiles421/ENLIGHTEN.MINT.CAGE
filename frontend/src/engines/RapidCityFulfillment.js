/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Rapid_City_Fulfillment
 * @version 64.0.0
 * @security RAINBOW_REFRACTION_ZF_PHYSICAL
 * @rotation_delta +20.0_degrees (Cumulative +1080.0°)
 * @location_anchor RAPID_CITY_SD
 * @author Steven (Creator Council)
 */

const FULFILL_DNA = {
    sectors: ["KONA_COFFEE", "VEGAN_BAKERY", "CLEANING_SUPPLIES", "ART_PRINTS"],
    fulfillment_center: "RAPID_CITY_LOCAL",
    rotation_key: "ZF_PHYSICAL_1080.0",
    master: "STEVEN_WITH_A_V",
    location: {
        city: "Rapid City",
        state: "SD",
        coordinates: { lat: 44.0805, lng: -103.2310 }
    }
};

/**
 * Automates the bridge between digital abundance and physical product movement.
 */
class RapidCityFulfillment {
    constructor() {
        this.inventory = {
            Kona_Coffee: 100,      // Units
            Vegan_Bakery: 50,      // Units
            Art_Prints: 26,        // 26-node limited editions
            Cleaning_Supplies: 100 // Units (integrity fixed point)
        };
        this.orderHistory = [];
        this.labelHistory = [];
        this.totalFulfilled = 0;
        console.log("[RapidCityFulfillment] v64.0.0 - Physical Bridge initialized");
        console.log("[RapidCityFulfillment] Location: Rapid City, SD");
    }

    /**
     * Bridges a digital "Mint" harvest to a physical shipping action
     * @param {string} nodeID - Target node identifier
     * @param {string} productType - Product type to fulfill
     * @returns {Promise<string>} Fulfillment status
     */
    async coordinateFulfillment(nodeID, productType) {
        console.log(`Syncing Node ${nodeID} with Rapid City Inventory...`);
        
        const inventoryKey = productType.replace(/ /g, '_');
        
        if (this.inventory[inventoryKey] && this.inventory[inventoryKey] > 0) {
            this.inventory[inventoryKey]--;
            this.totalFulfilled++;
            
            this.orderHistory.push({
                nodeID,
                product: productType,
                timestamp: Date.now(),
                status: "FULFILLED"
            });

            // Keep last 100 orders
            if (this.orderHistory.length > 100) {
                this.orderHistory.shift();
            }

            this.emitFulfillmentPulse(nodeID, productType);
            return this.generateSovereignLabel(nodeID, productType);
        }
        
        console.warn(`[RapidCityFulfillment] Low stock for ${productType}`);
        return "REFRIGERATION_REQUIRED_STOCK_LOW";
    }

    /**
     * Generate sovereign shipping label
     * @param {string} nodeID - Destination node
     * @param {string} product - Product type
     * @returns {string} Label status
     */
    generateSovereignLabel(nodeID, product) {
        // Generates a Ghost-Label for shipping
        const labelData = {
            from: "ENLIGHTEN_MINT_CAFE_RC",
            from_address: FULFILL_DNA.location,
            to_node: nodeID,
            item: product,
            seal: FULFILL_DNA.rotation_key,
            timestamp: Date.now(),
            tracking: `EMC-${Date.now()}-${nodeID}`
        };

        this.labelHistory.push(labelData);

        // Keep last 100 labels
        if (this.labelHistory.length > 100) {
            this.labelHistory.shift();
        }

        const pulse = btoa(JSON.stringify(labelData) + "|SHIPPING_PULSE_1080|");
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('FulfillmentPulse', { detail: pulse }));
        }
        
        console.log(`[RapidCityFulfillment] Label generated: ${labelData.tracking}`);
        return `LABEL_READY_FOR_${product}`;
    }

    /**
     * Decode fulfillment pulse
     * @param {string} pulse - Encoded pulse
     * @returns {Object|null}
     */
    decodePulse(pulse) {
        try {
            const decoded = atob(pulse);
            const jsonPart = decoded.split('|SHIPPING_PULSE_1080|')[0];
            return JSON.parse(jsonPart);
        } catch (e) {
            console.warn("[RapidCityFulfillment] Decode failed");
            return null;
        }
    }

    /**
     * Add inventory
     * @param {string} productType - Product type
     * @param {number} quantity - Quantity to add
     */
    addInventory(productType, quantity) {
        const key = productType.replace(/ /g, '_');
        if (this.inventory[key] !== undefined) {
            this.inventory[key] += quantity;
            console.log(`[RapidCityFulfillment] Added ${quantity} ${productType}. New total: ${this.inventory[key]}`);
        } else {
            this.inventory[key] = quantity;
            console.log(`[RapidCityFulfillment] Created new product: ${productType} with ${quantity} units`);
        }
    }

    /**
     * Check inventory level
     * @param {string} productType - Product type
     * @returns {number}
     */
    checkInventory(productType) {
        const key = productType.replace(/ /g, '_');
        return this.inventory[key] || 0;
    }

    /**
     * Get all inventory
     * @returns {Object}
     */
    getAllInventory() {
        return { ...this.inventory };
    }

    /**
     * Get order history
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getOrderHistory(count = 20) {
        return this.orderHistory.slice(-count);
    }

    /**
     * Get label history
     * @param {number} count - Number of entries
     * @returns {Array}
     */
    getLabelHistory(count = 20) {
        return this.labelHistory.slice(-count);
    }

    /**
     * Get inventory by sector
     * @param {string} sector - Sector name
     * @returns {Object}
     */
    getInventoryBySector(sector) {
        const sectorMap = {
            KONA_COFFEE: ['Kona_Coffee'],
            VEGAN_BAKERY: ['Vegan_Bakery'],
            CLEANING_SUPPLIES: ['Cleaning_Supplies'],
            ART_PRINTS: ['Art_Prints']
        };

        const products = sectorMap[sector] || [];
        const result = {};
        products.forEach(p => {
            result[p] = this.inventory[p] || 0;
        });
        return result;
    }

    /**
     * Emit fulfillment pulse
     * @param {string} nodeID - Node identifier
     * @param {string} product - Product type
     */
    emitFulfillmentPulse(nodeID, product) {
        console.log("-----------------------------------------");
        console.log("RAPID CITY FULFILLMENT: ORDER PROCESSED");
        console.log(`PRODUCT: ${product}`);
        console.log(`DESTINATION: ${nodeID}`);
        console.log(`CENTER: ${FULFILL_DNA.fulfillment_center}`);
        console.log("ROTATION: 1080.0° (3 COMPLETE CIRCLES)");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        const totalInventory = Object.values(this.inventory).reduce((sum, v) => sum + v, 0);
        
        return {
            totalInventory,
            totalFulfilled: this.totalFulfilled,
            orderCount: this.orderHistory.length,
            labelCount: this.labelHistory.length,
            sectors: FULFILL_DNA.sectors,
            location: FULFILL_DNA.location,
            dna: FULFILL_DNA
        };
    }

    /**
     * Get low stock alerts
     * @param {number} threshold - Low stock threshold
     * @returns {Array}
     */
    getLowStockAlerts(threshold = 10) {
        const alerts = [];
        Object.entries(this.inventory).forEach(([product, quantity]) => {
            if (quantity <= threshold) {
                alerts.push({
                    product,
                    quantity,
                    status: quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK"
                });
            }
        });
        return alerts;
    }
}

// Factory function
export function initializeFulfillment() {
    return new RapidCityFulfillment();
}

// Singleton
let fulfillmentInstance = null;

export function getRapidCityFulfillment() {
    if (!fulfillmentInstance) {
        fulfillmentInstance = new RapidCityFulfillment();
    }
    return fulfillmentInstance;
}

export { RapidCityFulfillment, FULFILL_DNA };
export default RapidCityFulfillment;
