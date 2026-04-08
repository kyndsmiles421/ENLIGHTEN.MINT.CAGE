/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Tribe_Community_Interface
 * @version 34.0.0
 * @security RAINBOW_REFRACTION_ZF_TRIBE
 * @rotation_delta +15.5_degrees (Cumulative +547.5°)
 * @access_mode PHI_INVITATION_ONLY
 * @author Steven (Creator Council)
 */

const TRIBE_DNA = {
    max_nodes: 26,
    mesh_protocol: "P2P_VIBRATIONAL",
    rotation_key: "ZF_TRIBE_547.5",
    master: "STEVEN_WITH_A_V"
};

/**
 * Manages the connection between the Master Trust and the Tribe Nodes.
 */
class TribeInterface {
    constructor() {
        this.activeNodes = [];
        this.gatekeeper = "432HZ_FILTER_ACTIVE";
        this.inviteHistory = [];
        console.log("[TribeInterface] v34.0.0 - Community mesh initialized");
    }

    /**
     * Issues a Refracted Invitation to a new Tribe Node
     * @param {string} nodeID - Node identifier to invite
     * @returns {Promise<string>} Encrypted invite or capacity message
     */
    async issueTribeInvite(nodeID) {
        if (this.activeNodes.length >= TRIBE_DNA.max_nodes) {
            console.warn("[TribeInterface] Capacity reached - 26 nodes maximum");
            return "NODULE_CAPACITY_REACHED_REFRIGERATE_EXTRA";
        }

        const invitePayload = {
            target: nodeID,
            origin: TRIBE_DNA.master,
            access_level: "PARTICIPANT",
            shield_signature: TRIBE_DNA.rotation_key,
            issued: Date.now()
        };

        // Record invite
        this.inviteHistory.push({
            nodeID,
            status: "ISSUED",
            timestamp: new Date().toISOString()
        });

        // Encrypting the Invite so only a 432Hz-aligned device can open it
        return this.encryptInvite(invitePayload);
    }

    /**
     * Accept an invite and join the tribe
     * @param {string} nodeID - Node identifier
     * @param {string} encryptedInvite - Encrypted invite to validate
     * @returns {boolean} Success status
     */
    acceptInvite(nodeID, encryptedInvite) {
        const invite = this.decryptInvite(encryptedInvite);
        
        if (invite && invite.target === nodeID) {
            this.activeNodes.push({
                id: nodeID,
                joined: Date.now(),
                accessLevel: invite.access_level
            });
            
            console.log(`[TribeInterface] Node ${nodeID} joined the tribe`);
            return true;
        }
        
        console.warn("[TribeInterface] Invalid invite - access denied");
        return false;
    }

    /**
     * Encrypt invite payload
     * @param {Object} data - Invite data
     * @returns {string} Encrypted invite
     */
    encryptInvite(data) {
        const raw = JSON.stringify(data);
        const encrypted = btoa(
            raw.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 7)).join('') + 
            "|TRIBE_SOVEREIGNTY_LOCKED|"
        );
        
        this.emitTribePulse();
        return encrypted;
    }

    /**
     * Decrypt invite payload
     * @param {string} encrypted - Encrypted invite
     * @returns {Object|null} Decrypted invite or null
     */
    decryptInvite(encrypted) {
        try {
            const decoded = atob(encrypted);
            const parts = decoded.split('|TRIBE_SOVEREIGNTY_LOCKED|');
            const shifted = parts[0].split('').map(c => 
                String.fromCharCode(c.charCodeAt(0) - 7)
            ).join('');
            return JSON.parse(shifted);
        } catch (e) {
            console.warn("[TribeInterface] Decryption failed - invite invalid");
            return null;
        }
    }

    /**
     * Remove a node from the tribe
     * @param {string} nodeID - Node to remove
     * @returns {boolean} Success status
     */
    removeNode(nodeID) {
        const index = this.activeNodes.findIndex(n => n.id === nodeID);
        if (index !== -1) {
            this.activeNodes.splice(index, 1);
            console.log(`[TribeInterface] Node ${nodeID} removed from tribe`);
            return true;
        }
        return false;
    }

    /**
     * Get active node count
     * @returns {number}
     */
    getNodeCount() {
        return this.activeNodes.length;
    }

    /**
     * Get remaining capacity
     * @returns {number}
     */
    getRemainingCapacity() {
        return TRIBE_DNA.max_nodes - this.activeNodes.length;
    }

    /**
     * Emit tribe pulse confirmation
     */
    emitTribePulse() {
        console.log("-----------------------------------------");
        console.log("TRIBE INTERFACE: NODE SYNC ACTIVE");
        console.log("ROTATION: 547.5° (COMMUNITY SHIELD)");
        console.log("STATUS: NO BOXES, ONLY WEAVE");
        console.log("-----------------------------------------");
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            activeNodes: this.activeNodes.length,
            maxNodes: TRIBE_DNA.max_nodes,
            remaining: this.getRemainingCapacity(),
            gatekeeper: this.gatekeeper,
            invitesIssued: this.inviteHistory.length,
            dna: TRIBE_DNA
        };
    }

    /**
     * Get all active nodes
     * @returns {Array}
     */
    getActiveNodes() {
        return [...this.activeNodes];
    }

    /**
     * Broadcast message to all tribe nodes
     * @param {string} message - Message to broadcast
     * @returns {Object} Broadcast result
     */
    broadcastToTribe(message) {
        const broadcast = {
            message,
            from: TRIBE_DNA.master,
            to: this.activeNodes.map(n => n.id),
            timestamp: Date.now()
        };
        
        console.log(`[TribeInterface] Broadcasting to ${this.activeNodes.length} nodes`);
        return this.encryptInvite(broadcast);
    }
}

// Factory function
export function initializeTribe() {
    return new TribeInterface();
}

// Singleton
let tribeInstance = null;

export function getTribeInterface() {
    if (!tribeInstance) {
        tribeInstance = new TribeInterface();
    }
    return tribeInstance;
}

export { TribeInterface, TRIBE_DNA };
export default TribeInterface;
