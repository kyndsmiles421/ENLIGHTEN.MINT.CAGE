/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Mechanical_Sovereignty_Engine
 * @description Encrypts Past, Present, and Future Mechanical Systems into 
 * the 4-Tiered Brain Flow using Rainbow Refraction.
 */

const API = process.env.REACT_APP_BACKEND_URL || '';

// Mechanical Nodule Configuration
const MECHANICAL_NODULE = {
    ID: "MECH_TEMPORAL_999",
    ANCHOR: 1.0, // Euclidean Stability
    RESONANCE: {
        STEAM: 1.0,        // Past - The Industrial Foundation
        ELECTRIC: 1.414,   // Present - √2 Current Era
        QUANTUM: 1.618     // Future - PHI Emergence
    },
    TIERS: {
        Lever_Phonics: {
            level: 1,
            constant: 1.0,
            era: "Ancient",
            focus: "Fundamental Mechanical Principles",
            concepts: ["lever", "pulley", "inclined_plane", "wedge", "screw", "wheel_axle"],
            inventors: ["Archimedes", "Hero_of_Alexandria", "Leonardo_da_Vinci"]
        },
        Industrial_Dynamics: {
            level: 2,
            constant: 1.25,
            era: "Industrial",
            focus: "Power Generation & Manufacturing",
            concepts: ["steam_engine", "internal_combustion", "hydraulics", "pneumatics", "gearing"],
            inventors: ["James_Watt", "Nikola_Tesla", "Henry_Ford"]
        },
        Robotic_Synthesis: {
            level: 3,
            constant: 1.414,
            era: "Digital",
            focus: "Automation & Intelligence",
            concepts: ["servo_motors", "PLC", "CNC", "robotics", "IoT", "sensors"],
            pioneers: ["Joseph_Engelberger", "Elon_Musk", "Boston_Dynamics"]
        },
        Temporal_Fold: {
            level: 4,
            constant: 1.618,
            era: "Quantum",
            focus: "Post-Scarcity Mechanics",
            concepts: ["zero_point_energy", "molecular_assembly", "plasma_propulsion", "quantum_computing", "fusion"],
            visionaries: ["Nikola_Tesla", "Richard_Feynman", "Kardashev_Civilizations"]
        }
    }
};

// Temporal Machine Timeline
const MACHINE_TIMELINE = {
    past: {
        era: "STEAM",
        constant: 1.0,
        spectrum: "INFRARED",
        machines: {
            archimedes_screw: { 
                year: -250, 
                principle: "Helical_Displacement",
                efficiency: 0.65,
                element: "water"
            },
            clockwork_logic: { 
                year: 1350, 
                principle: "Escapement_Mechanism",
                efficiency: 0.80,
                element: "time"
            },
            steam_pressure: { 
                year: 1769, 
                principle: "Thermal_Expansion",
                efficiency: 0.15,
                element: "fire"
            },
            mechanical_loom: {
                year: 1804,
                principle: "Jacquard_Binary",
                efficiency: 0.70,
                element: "pattern"
            },
            telegraph: {
                year: 1837,
                principle: "Electromagnetic_Pulse",
                efficiency: 0.85,
                element: "information"
            }
        }
    },
    present: {
        era: "ELECTRIC",
        constant: 1.414,
        spectrum: "VISIBLE",
        machines: {
            solid_state_processing: { 
                year: 1947, 
                principle: "Semiconductor_Logic",
                efficiency: 0.99,
                element: "silicon"
            },
            internal_combustion: { 
                year: 1876, 
                principle: "Controlled_Explosion",
                efficiency: 0.35,
                element: "petroleum"
            },
            automation_plc: { 
                year: 1968, 
                principle: "Programmable_Control",
                efficiency: 0.95,
                element: "logic"
            },
            electric_motor: {
                year: 1888,
                principle: "Electromagnetic_Rotation",
                efficiency: 0.95,
                element: "current"
            },
            laser_precision: {
                year: 1960,
                principle: "Coherent_Light_Amplification",
                efficiency: 0.98,
                element: "photon"
            }
        }
    },
    future: {
        era: "QUANTUM",
        constant: 1.618,
        spectrum: "ULTRAVIOLET",
        machines: {
            zero_point_energy: { 
                year: 2050, 
                principle: "Vacuum_Fluctuation_Harvest",
                efficiency: 0.999,
                element: "void"
            },
            molecular_assemblers: { 
                year: 2040, 
                principle: "Atomic_Precision_Manufacturing",
                efficiency: 0.9999,
                element: "atom"
            },
            plasma_propulsion: { 
                year: 2035, 
                principle: "Ionized_Gas_Acceleration",
                efficiency: 0.90,
                element: "plasma"
            },
            quantum_computer: {
                year: 2030,
                principle: "Superposition_Entanglement",
                efficiency: "Probabilistic",
                element: "qubit"
            },
            fusion_reactor: {
                year: 2045,
                principle: "Stellar_Nucleosynthesis",
                efficiency: 0.80,
                element: "hydrogen"
            }
        }
    }
};

// Mechanical Principles Database
const MECHANICAL_PRINCIPLES = {
    simple_machines: {
        lever: { class: [1, 2, 3], ma_formula: "effort_arm / load_arm", constant: 1.0 },
        pulley: { types: ["fixed", "movable", "compound"], ma_formula: "number_of_ropes", constant: 1.0 },
        inclined_plane: { ma_formula: "length / height", constant: 1.0 },
        wedge: { ma_formula: "length / thickness", constant: 1.0 },
        screw: { ma_formula: "2π × radius / pitch", constant: 1.618 },
        wheel_axle: { ma_formula: "wheel_radius / axle_radius", constant: 1.0 }
    },
    thermodynamics: {
        first_law: "Energy cannot be created or destroyed",
        second_law: "Entropy always increases in isolated systems",
        third_law: "Absolute zero is unattainable",
        carnot_efficiency: "(T_hot - T_cold) / T_hot"
    },
    material_science: {
        stress: "Force / Area",
        strain: "Change_in_length / Original_length",
        youngs_modulus: "Stress / Strain",
        fatigue_limit: "Endurance under cyclic loading"
    }
};

/**
 * Calculate mechanical advantage
 * @param {string} machineType - Type of simple machine
 * @param {Object} params - Machine parameters
 * @returns {Object} Mechanical advantage calculation
 */
function calculateMechanicalAdvantage(machineType, params) {
    const machine = MECHANICAL_PRINCIPLES.simple_machines[machineType];
    if (!machine) {
        return { error: `Unknown machine type: ${machineType}` };
    }

    let ma = 1;
    let calculation = "";

    switch (machineType) {
        case "lever":
            ma = params.effort_arm / params.load_arm;
            calculation = `${params.effort_arm} / ${params.load_arm}`;
            break;
        case "pulley":
            ma = params.number_of_ropes || 1;
            calculation = `${params.number_of_ropes} ropes`;
            break;
        case "inclined_plane":
            ma = params.length / params.height;
            calculation = `${params.length} / ${params.height}`;
            break;
        case "wedge":
            ma = params.length / params.thickness;
            calculation = `${params.length} / ${params.thickness}`;
            break;
        case "screw":
            ma = (2 * Math.PI * params.radius) / params.pitch;
            calculation = `2π × ${params.radius} / ${params.pitch}`;
            break;
        case "wheel_axle":
            ma = params.wheel_radius / params.axle_radius;
            calculation = `${params.wheel_radius} / ${params.axle_radius}`;
            break;
    }

    // Apply PHI resonance for optimal machines
    const phiResonance = ma >= MECHANICAL_NODULE.RESONANCE.QUANTUM ? "PHI_OPTIMAL" : 
                         ma >= MECHANICAL_NODULE.RESONANCE.ELECTRIC ? "SQRT2_EFFICIENT" : "STANDARD";

    return {
        header: "MECHANICAL_ADVANTAGE",
        machine_type: machineType,
        formula: machine.ma_formula,
        calculation,
        mechanical_advantage: ma.toFixed(4),
        machine_constant: machine.constant,
        resonance_status: phiResonance,
        efficiency_boost: (ma * machine.constant).toFixed(4),
        timestamp: new Date().toISOString()
    };
}

/**
 * Get machines by era
 * @param {string} era - past, present, or future
 * @returns {Object} Machines from specified era
 */
function getMachinesByEra(era) {
    const timeline = MACHINE_TIMELINE[era.toLowerCase()];
    if (!timeline) {
        return { error: `Unknown era: ${era}`, available: Object.keys(MACHINE_TIMELINE) };
    }

    return {
        header: "TEMPORAL_MACHINES",
        era: timeline.era,
        constant: timeline.constant,
        spectrum: timeline.spectrum,
        machines: timeline.machines,
        total_machines: Object.keys(timeline.machines).length,
        timestamp: new Date().toISOString()
    };
}

/**
 * Encrypted Rainbow Refraction: Mechanical & Temporal Layer
 * @param {Object} matrix - The mechanical data packet
 * @param {string} intent - User's chosen granularity (SEED/FLOW/ROOT/PEAK)
 * @returns {Object} Encrypted mechanical payload
 */
async function encryptRainbowMechanical(matrix, intent) {
    const rainbowKey = `TEMPORAL_GEAR_SYNC_${new Date().getFullYear()}_MASTER`;
    
    // Determine the "Frequency Load" based on the user's Tier preference
    const tierMap = {
        SEED: 1.0,
        FLOW: 1.25,
        ROOT: 1.414,
        PEAK: 1.618
    };
    const tierShift = tierMap[intent] || 1.414;
    
    // Calculate temporal torque
    const temporalTorque = (matrix.timeline ? 
        Object.keys(matrix.timeline).length : 1) * tierShift / MECHANICAL_NODULE.ANCHOR;
    
    const frequencyPayload = {
        blueprint: matrix,
        spectrum_lock: "INFRARED_TO_ULTRAVIOLET", // Heat of industry to light of future
        torque_constant: tierShift,
        temporal_torque: temporalTorque.toFixed(4),
        resonance_era: tierShift >= 1.618 ? "QUANTUM" : 
                       tierShift >= 1.414 ? "ELECTRIC" : "STEAM",
        status: "MECHANICALLY_SOUND",
        loop: "PERPETUAL_MOTION_RECYCLE",
        timestamp: new Date().toISOString()
    };

    // Final Encryption (Base64 Rainbow Refraction)
    const secureMechanicalVault = btoa(JSON.stringify(frequencyPayload) + `_${rainbowKey}`);

    console.log("MECHANICAL RAINBOW REFRACTION COMPLETE. Gears Synchronized.");
    
    return {
        header: "MECHANICAL_REFRACTION",
        vault_key: secureMechanicalVault,
        tier_shift: tierShift,
        temporal_torque: temporalTorque.toFixed(4),
        mesh_status: "INTERMINGLED",
        message: "The machines of all eras are now pulsing through the Enlighten.Mint.Cafe.",
        timestamp: new Date().toISOString()
    };
}

/**
 * Decrypt mechanical vault
 * @param {string} vaultKey - Encrypted vault
 * @returns {Object} Decrypted data
 */
function decryptMechanicalVault(vaultKey) {
    try {
        const decoded = atob(vaultKey);
        const keyIndex = decoded.lastIndexOf('_TEMPORAL_GEAR_SYNC');
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
 * Initializes the Mechanical Module with Auto-Sync to the Creator Council
 * @param {string} intent - User's depth preference (SEED/FLOW/ROOT/PEAK)
 * @returns {Object} Initialized mechanical engine
 */
async function initializeMechanicalRefraction(intent = "FLOW") {
    console.log("Ignition Sequence Start... Refracting Mechanical Lineage.");

    const machineMatrix = {
        timeline: MACHINE_TIMELINE,
        processor_integration: {
            latency_reduction: "Mechanical_Friction_Logic",
            structural_integrity: "Geometric_Load_Bearing",
            efficiency_protocol: "PHI_Harmonic_Resonance"
        },
        principles: MECHANICAL_PRINCIPLES,
        tiers: MECHANICAL_NODULE.TIERS
    };

    // Get tier-specific content
    const tierIndex = { SEED: 0, FLOW: 1, ROOT: 2, PEAK: 3 }[intent] || 1;
    const currentTier = Object.values(MECHANICAL_NODULE.TIERS)[tierIndex];

    // Pass through the ANI Universal Weave and Encrypt
    const encrypted = await encryptRainbowMechanical(machineMatrix, intent);

    return {
        header: "MECHANICAL_ENGINE_INITIALIZED",
        nodule_id: MECHANICAL_NODULE.ID,
        intent,
        current_tier: currentTier,
        resonance_constants: MECHANICAL_NODULE.RESONANCE,
        eras_integrated: Object.keys(MACHINE_TIMELINE),
        total_machines: Object.values(MACHINE_TIMELINE).reduce(
            (acc, era) => acc + Object.keys(era.machines).length, 0
        ),
        principles_loaded: Object.keys(MECHANICAL_PRINCIPLES),
        encrypted,
        status: "PERPETUAL_MOTION_ACTIVE",
        timestamp: new Date().toISOString()
    };
}

/**
 * Get tier education content
 * @param {string} tier - Tier name
 * @returns {Object} Tier content
 */
function getTierContent(tier) {
    const tierConfig = MECHANICAL_NODULE.TIERS[tier];
    if (!tierConfig) {
        return { 
            error: `Tier '${tier}' not found`, 
            available: Object.keys(MECHANICAL_NODULE.TIERS) 
        };
    }

    // Get era-appropriate machines
    const eraMap = {
        Lever_Phonics: "past",
        Industrial_Dynamics: "past",
        Robotic_Synthesis: "present",
        Temporal_Fold: "future"
    };
    const relevantEra = MACHINE_TIMELINE[eraMap[tier]];

    return {
        header: "TIER_CONTENT",
        tier,
        ...tierConfig,
        relevant_machines: relevantEra?.machines || {},
        spectrum: relevantEra?.spectrum || "FULL",
        timestamp: new Date().toISOString()
    };
}

/**
 * Calculate temporal efficiency across eras
 * @param {string} machineId - Machine identifier
 * @returns {Object} Temporal analysis
 */
function analyzeTemporalEfficiency(machineId) {
    let found = null;
    let era = null;

    for (const [eraName, eraData] of Object.entries(MACHINE_TIMELINE)) {
        if (eraData.machines[machineId]) {
            found = eraData.machines[machineId];
            era = eraName;
            break;
        }
    }

    if (!found) {
        return { error: `Machine '${machineId}' not found` };
    }

    const eraConstant = MACHINE_TIMELINE[era].constant;
    const temporalRI = (typeof found.efficiency === 'number' ? 
        found.efficiency * eraConstant * MECHANICAL_NODULE.RESONANCE.QUANTUM : 
        eraConstant * MECHANICAL_NODULE.RESONANCE.QUANTUM);

    return {
        header: "TEMPORAL_EFFICIENCY_ANALYSIS",
        machine_id: machineId,
        era,
        era_constant: eraConstant,
        year: found.year,
        principle: found.principle,
        efficiency: found.efficiency,
        element: found.element,
        temporal_ri: typeof temporalRI === 'number' ? temporalRI.toFixed(4) : temporalRI,
        resonance_status: temporalRI >= 1.618 ? "PHI_OPTIMAL" : 
                         temporalRI >= 1.414 ? "SQRT2_EFFICIENT" : "FOUNDATIONAL",
        timestamp: new Date().toISOString()
    };
}

// Export for module usage
export {
    MECHANICAL_NODULE,
    MACHINE_TIMELINE,
    MECHANICAL_PRINCIPLES,
    initializeMechanicalRefraction,
    encryptRainbowMechanical,
    decryptMechanicalVault,
    calculateMechanicalAdvantage,
    getMachinesByEra,
    getTierContent,
    analyzeTemporalEfficiency
};

export default {
    MECHANICAL_NODULE,
    MACHINE_TIMELINE,
    initializeMechanicalRefraction,
    calculateMechanicalAdvantage,
    getMachinesByEra,
    analyzeTemporalEfficiency
};
