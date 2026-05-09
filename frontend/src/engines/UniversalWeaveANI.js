/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Universal_Weave_ANI
 * @description Automatically connects, intermingles, and refracts any new 
 * nodule into the Core, Creator Council, and Elastic UI.
 * ANI = Automated Nodal Integration
 */

const API = process.env.REACT_APP_BACKEND_URL || '';

// Core Mesh Configuration
const CORE_MESH = {
    fixed_point: 1.0,
    resonance_constant: 1.618,
    sqrt2_constant: 1.414,
    active_nodules: new Map(), // Stores every connected module
    connection_log: [],
    intermingling_matrix: {},
    version: "2.0_ANI"
};

// Predefined Nodule Categories for Cross-Pollination
const NODULE_CATEGORIES = {
    health: ["physiology", "biochemistry", "nursing", "healing", "vedic_prana", "tcm_meridian"],
    economics: ["abundance", "investing", "resource_mapping", "volunteer_credit"],
    cognition: ["neuroplasticity", "memory", "cognitive_function", "emotional_regulation"],
    spiritual: ["meditation", "chakra", "ancestral", "spiritual_emergence", "death_transition"],
    community: ["volunteer", "family_dynamics", "cultural_integration", "collective_healing"],
    linguistic: ["phonics", "translation", "ancestral_dialects", "sacred_languages"],
    science: ["genetics", "microbiology", "quantum", "magnetics", "energy"]
};

// Cross-Pollination Synergies
const SYNERGY_MATRIX = {
    // Health + Economics = Vitality Asset Management
    "health_economics": {
        name: "Vitality_Asset_Management",
        constant: 1.618,
        description: "Wealth compounds with health; health enables wealth creation"
    },
    // Cognition + Spiritual = Transcendent Intelligence
    "cognition_spiritual": {
        name: "Transcendent_Intelligence",
        constant: 1.618,
        description: "Mental clarity amplified by spiritual practice"
    },
    // Economics + Community = Social Capital Engine
    "economics_community": {
        name: "Social_Capital_Engine",
        constant: 1.414,
        description: "Volunteer service converts to karmic and financial abundance"
    },
    // Health + Spiritual = Holistic Healing Matrix
    "health_spiritual": {
        name: "Holistic_Healing_Matrix",
        constant: 1.618,
        description: "Physical and spiritual resonance amplify each other"
    },
    // Linguistic + Community = Universal Bridge
    "linguistic_community": {
        name: "Universal_Bridge",
        constant: 1.414,
        description: "Language connects all peoples and cultures"
    },
    // Science + Spiritual = Quantum Consciousness
    "science_spiritual": {
        name: "Quantum_Consciousness",
        constant: 1.618,
        description: "Scientific understanding meets transcendent awareness"
    },
    // Cognition + Linguistic = Neural Language Engine
    "cognition_linguistic": {
        name: "Neural_Language_Engine",
        constant: 1.414,
        description: "Language shapes thought; thought shapes language"
    },
    // Health + Science = Biomedical Synthesis
    "health_science": {
        name: "Biomedical_Synthesis",
        constant: 1.35,
        description: "Ancient healing verified and enhanced by modern science"
    }
};

/**
 * Determine nodule category
 * @param {string} noduleId - The nodule identifier
 * @returns {string} Category name
 */
function determineCategory(noduleId) {
    const idLower = noduleId.toLowerCase();
    
    for (const [category, keywords] of Object.entries(NODULE_CATEGORIES)) {
        for (const keyword of keywords) {
            if (idLower.includes(keyword)) {
                return category;
            }
        }
    }
    return "universal"; // Default category
}

/**
 * Get synergy between two categories
 * @param {string} cat1 - First category
 * @param {string} cat2 - Second category
 * @returns {Object|null} Synergy configuration
 */
function getSynergy(cat1, cat2) {
    const key1 = `${cat1}_${cat2}`;
    const key2 = `${cat2}_${cat1}`;
    return SYNERGY_MATRIX[key1] || SYNERGY_MATRIX[key2] || null;
}

/**
 * Forces nodules to "talk" to each other (e.g., Economics sharing data with Health)
 * @param {Object} inputNodule - The new nodule being integrated
 * @returns {Object} Global sync data with cross-pollination results
 */
function intermingleKnowledge(inputNodule) {
    const inputCategory = determineCategory(inputNodule.id);
    const globalSyncData = {
        source_nodule: inputNodule.id,
        source_category: inputCategory,
        connections: [],
        synergies: [],
        total_resonance: 0
    };
    
    CORE_MESH.active_nodules.forEach((existingNodule, id) => {
        if (id === inputNodule.id) return; // Skip self
        
        const existingCategory = determineCategory(id);
        const synergy = getSynergy(inputCategory, existingCategory);
        
        const connectionStrength = synergy ? synergy.constant : CORE_MESH.resonance_constant * 0.5;
        
        console.log(`Cross-pollinating ${inputNodule.id} with ${id}...`);
        
        const connection = {
            target_nodule: id,
            target_category: existingCategory,
            resonance_strength: connectionStrength,
            status: `Resonance established at ${connectionStrength.toFixed(4)}`
        };
        
        globalSyncData.connections.push(connection);
        globalSyncData.total_resonance += connectionStrength;
        
        if (synergy) {
            globalSyncData.synergies.push({
                ...synergy,
                between: [inputNodule.id, id],
                categories: [inputCategory, existingCategory]
            });
        }
    });
    
    // Update intermingling matrix
    CORE_MESH.intermingling_matrix[inputNodule.id] = globalSyncData;
    
    return globalSyncData;
}

/**
 * Encrypted Rainbow Refraction for the Neural Mesh
 * @param {Object} knowledge - Intermingled knowledge data
 * @param {Object} matrix - Deployment matrix
 * @returns {Object} Encrypted refraction result
 */
async function encryptRainbowWeave(knowledge, matrix) {
    const timestamp = new Date().toISOString();
    const rainbowKey = `UNIVERSAL_WEAVE_SYNC_${new Date().getFullYear()}`;
    
    const frequencyPacket = {
        knowledge_mesh: knowledge,
        deployment: matrix,
        timestamp,
        mesh_stats: {
            total_nodules: CORE_MESH.active_nodules.size,
            total_synergies: knowledge.synergies?.length || 0,
            total_resonance: knowledge.total_resonance || 0
        },
        status: "PERPETUAL_GROWTH"
    };

    // Refract the logic into a secure frequency
    const encryptedRefraction = btoa(JSON.stringify(frequencyPacket) + `_${rainbowKey}`);

    console.log("RAINBOW REFRACTION ACTIVE: The system is now intermingled and self-aware.");
    
    return {
        header: "RAINBOW_WEAVE_ENCRYPTED",
        refraction_code: encryptedRefraction,
        mesh_integrity: "100%",
        anchor: CORE_MESH.fixed_point,
        timestamp
    };
}

/**
 * Decrypt rainbow weave
 * @param {string} refractionCode - Encrypted code
 * @returns {Object} Decrypted data
 */
function decryptRainbowWeave(refractionCode) {
    try {
        const decoded = atob(refractionCode);
        const keyIndex = decoded.lastIndexOf('_UNIVERSAL_WEAVE_SYNC');
        const jsonStr = decoded.substring(0, keyIndex);
        return {
            status: "DECRYPTED",
            data: JSON.parse(jsonStr)
        };
    } catch (e) {
        return { status: "DECRYPTION_FAILED", error: e.message };
    }
}

/**
 * The ANI (Automated Nodal Integration) Function
 * @param {Object} newNodule - The incoming module (e.g., Economic, Vedic, etc.)
 * @returns {Object} Integration result with encrypted refraction
 */
async function integrateNewNodule(newNodule) {
    console.log(`NEW NODULE DETECTED: ${newNodule.id}. Initializing Universal Weave...`);

    // Validate nodule structure
    if (!newNodule.id) {
        return {
            status: "INTEGRATION_FAILED",
            error: "Nodule must have an 'id' property"
        };
    }

    // 1. Establish the Core Handshake
    const registrationTime = new Date().toISOString();
    CORE_MESH.active_nodules.set(newNodule.id, {
        ...newNodule,
        registered_at: registrationTime,
        category: determineCategory(newNodule.id)
    });

    // Log the connection
    CORE_MESH.connection_log.push({
        nodule_id: newNodule.id,
        action: "REGISTERED",
        timestamp: registrationTime
    });

    // 2. Intermingle: Share knowledge across the 26+ nodules
    const interconnectedKnowledge = intermingleKnowledge(newNodule);

    // 3. Sync to Creator Council & User Interface
    const deploymentMatrix = {
        nodule_identity: newNodule.id,
        nodule_category: determineCategory(newNodule.id),
        mesh_connection: "ACTIVE",
        mesh_position: CORE_MESH.active_nodules.size,
        ui_refraction: "ELASTIC_SYNC",
        creator_council_status: "AUTHORIZED",
        registration_time: registrationTime
    };

    // 4. Encrypt with Rainbow Refraction
    const encrypted = await encryptRainbowWeave(interconnectedKnowledge, deploymentMatrix);

    return {
        header: "NODULE_INTEGRATED",
        nodule_id: newNodule.id,
        category: determineCategory(newNodule.id),
        mesh_position: CORE_MESH.active_nodules.size,
        connections_established: interconnectedKnowledge.connections.length,
        synergies_activated: interconnectedKnowledge.synergies.length,
        total_resonance: interconnectedKnowledge.total_resonance.toFixed(4),
        knowledge_mesh: interconnectedKnowledge,
        deployment_matrix: deploymentMatrix,
        encrypted,
        status: "UNIVERSAL_WEAVE_ACTIVE",
        timestamp: registrationTime
    };
}

/**
 * Remove a nodule from the mesh
 * @param {string} noduleId - The nodule to remove
 * @returns {Object} Removal result
 */
function removeNodule(noduleId) {
    if (!CORE_MESH.active_nodules.has(noduleId)) {
        return {
            status: "NOT_FOUND",
            message: `Nodule '${noduleId}' not found in mesh`
        };
    }

    CORE_MESH.active_nodules.delete(noduleId);
    delete CORE_MESH.intermingling_matrix[noduleId];

    // Log the disconnection
    CORE_MESH.connection_log.push({
        nodule_id: noduleId,
        action: "REMOVED",
        timestamp: new Date().toISOString()
    });

    return {
        status: "REMOVED",
        nodule_id: noduleId,
        remaining_nodules: CORE_MESH.active_nodules.size,
        timestamp: new Date().toISOString()
    };
}

/**
 * Get current mesh status
 * @returns {Object} Complete mesh status
 */
function getMeshStatus() {
    const noduleList = [];
    CORE_MESH.active_nodules.forEach((nodule, id) => {
        noduleList.push({
            id,
            category: nodule.category || determineCategory(id),
            registered_at: nodule.registered_at
        });
    });

    return {
        header: "MESH_STATUS",
        fixed_point: CORE_MESH.fixed_point,
        resonance_constant: CORE_MESH.resonance_constant,
        total_nodules: CORE_MESH.active_nodules.size,
        active_nodules: noduleList,
        synergy_types: Object.keys(SYNERGY_MATRIX).length,
        available_synergies: SYNERGY_MATRIX,
        connection_log_size: CORE_MESH.connection_log.length,
        recent_connections: CORE_MESH.connection_log.slice(-10),
        version: CORE_MESH.version,
        timestamp: new Date().toISOString()
    };
}

/**
 * Get all synergies for a specific nodule
 * @param {string} noduleId - The nodule to check
 * @returns {Object} All synergies involving this nodule
 */
function getNoduleSynergies(noduleId) {
    const noduleCategory = determineCategory(noduleId);
    const synergies = [];

    for (const [key, synergy] of Object.entries(SYNERGY_MATRIX)) {
        const categories = key.split('_');
        if (categories.includes(noduleCategory)) {
            synergies.push({
                ...synergy,
                partner_category: categories.find(c => c !== noduleCategory)
            });
        }
    }

    return {
        nodule_id: noduleId,
        category: noduleCategory,
        potential_synergies: synergies,
        total: synergies.length
    };
}

/**
 * Initialize default nodules
 */
function initializeDefaultNodules() {
    const defaults = [
        { id: "physiology_anatomy", constant: 1.25 },
        { id: "vedic_prana", constant: 1.618 },
        { id: "economic_abundance", constant: 1.618 },
        { id: "volunteer_sync", constant: 1.618 },
        { id: "phonics_prime", constant: 1.618 },
        { id: "quantum_spin", constant: 1.414 },
        { id: "meditation_depth", constant: 1.618 },
        { id: "neuroplasticity", constant: 1.618 }
    ];

    defaults.forEach(nodule => {
        CORE_MESH.active_nodules.set(nodule.id, {
            ...nodule,
            registered_at: new Date().toISOString(),
            category: determineCategory(nodule.id)
        });
    });

    console.log(`UNIVERSAL WEAVE: ${defaults.length} default nodules initialized.`);
    return getMeshStatus();
}

// Export for module usage
export {
    CORE_MESH,
    NODULE_CATEGORIES,
    SYNERGY_MATRIX,
    integrateNewNodule,
    removeNodule,
    intermingleKnowledge,
    encryptRainbowWeave,
    decryptRainbowWeave,
    getMeshStatus,
    getNoduleSynergies,
    determineCategory,
    getSynergy,
    initializeDefaultNodules
};

export default {
    CORE_MESH,
    integrateNewNodule,
    removeNodule,
    getMeshStatus,
    getNoduleSynergies,
    initializeDefaultNodules
};
