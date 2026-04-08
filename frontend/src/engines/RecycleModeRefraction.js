/**
 * @module Enlighten.Mint.Cafe / OmniVitalityEngine
 * @submodule RecycleMode_Refraction
 * @description Encrypts the 1.618 Peak-Frequency and loops it back 
 * into the Foundational Nodules via the Prism Fixed Point.
 */

const API = process.env.REACT_APP_BACKEND_URL || '';

const ENGINE_CONSTANTS = {
    PHI: 1.618,
    SQRT2: 1.414,
    FIXED_POINT: 1.0,           // Prism Anchor
    RECYCLE_COEFFICIENT: 0.618, // The "Echo" return value (1/PHI)
    RAINBOW_SPECTRUM: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
};

/**
 * Simple XOR-based signal encryption for demo
 * @param {number} signal - The signal value to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted hex string
 */
function encryptSignal(signal, key) {
    const signalStr = signal.toFixed(6);
    let encrypted = '';
    for (let i = 0; i < signalStr.length; i++) {
        const charCode = signalStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += charCode.toString(16).padStart(2, '0');
    }
    return encrypted;
}

/**
 * Decrypt signal from hex
 * @param {string} encrypted - Encrypted hex string
 * @param {string} key - Decryption key
 * @returns {number} Decrypted signal value
 */
function decryptSignal(encrypted, key) {
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i += 2) {
        const charCode = parseInt(encrypted.substr(i, 2), 16) ^ key.charCodeAt((i/2) % key.length);
        decrypted += String.fromCharCode(charCode);
    }
    return parseFloat(decrypted);
}

/**
 * Encrypts and Refracts the transition signal
 * @param {Object} vitalityArtifact - The data packet from /api/omni/decrypt
 * @returns {Object} Refracted artifact with recycled energy
 */
async function processRainbowRefraction(vitalityArtifact) {
    console.log("Initializing Encrypted Rainbow Refraction...");

    // 1. Capture the 1.618 Peak from death_transition
    const peakSignal = vitalityArtifact?.nodules?.death_transition?.value || 
                       vitalityArtifact?.scaled_ri || 
                       ENGINE_CONSTANTS.PHI;

    if (peakSignal >= ENGINE_CONSTANTS.PHI) {
        // 2. Pass through the Prism Fixed Point (1.0) for stabilization
        const stabilizedSignal = peakSignal * ENGINE_CONSTANTS.FIXED_POINT;
        console.log(`Stabilized Signal: ${stabilizedSignal}`);

        // 3. Encrypt the frequency (Rainbow Shift)
        const rainbowKey = `RAINBOW_KEY_${new Date().toISOString().slice(0,7).replace('-','')}`;
        const encryptedRefraction = encryptSignal(stabilizedSignal, rainbowKey);
        console.log(`Encrypted Refraction: ${encryptedRefraction}`);

        // 4. Trigger Recycle Mode - Loop back to foundational nodules
        const recycledEnergy = stabilizedSignal * ENGINE_CONSTANTS.RECYCLE_COEFFICIENT;
        console.log(`Recycled Energy (0.618 coefficient): ${recycledEnergy}`);

        // 5. Inject recycled energy into foundational nodules
        const foundationalInjection = await injectFoundationalEnergy(recycledEnergy);

        // 6. Calculate Rainbow Spectrum Distribution
        const spectrumDistribution = calculateSpectrumDistribution(recycledEnergy);

        return {
            header: "RAINBOW_REFRACTION_COMPLETE",
            original_peak: peakSignal,
            stabilized_signal: stabilizedSignal,
            encrypted_refraction: encryptedRefraction,
            rainbow_key: rainbowKey,
            recycled_energy: recycledEnergy,
            recycle_coefficient: ENGINE_CONSTANTS.RECYCLE_COEFFICIENT,
            foundational_injection: foundationalInjection,
            spectrum_distribution: spectrumDistribution,
            status: "VIOLET_LOOP_ACTIVE",
            timestamp: new Date().toISOString()
        };
    } else {
        console.log("Peak signal below PHI threshold - standard processing");
        return {
            header: "STANDARD_PROCESSING",
            signal: peakSignal,
            threshold: ENGINE_CONSTANTS.PHI,
            status: "GROWTH_PHASE",
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Inject recycled energy into foundational nodules via API
 * @param {number} energy - Recycled energy value
 * @returns {Object} Injection results
 */
async function injectFoundationalEnergy(energy) {
    const foundationalNodules = [
        "physiology_anatomy",
        "biochemistry", 
        "genetics",
        "microbiology"
    ];

    const injectionResults = [];

    for (const nodule of foundationalNodules) {
        try {
            const response = await fetch(`${API}/api/omni/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module: nodule,
                    input_data: energy,
                    N: 10,
                    z: 2
                })
            });
            const result = await response.json();
            injectionResults.push({
                nodule,
                scaled_ri: result.scaled_ri,
                status: result.status,
                coherence: result.coherence_percent
            });
        } catch (error) {
            injectionResults.push({
                nodule,
                error: error.message,
                status: "INJECTION_FAILED"
            });
        }
    }

    const successCount = injectionResults.filter(r => r.status !== "INJECTION_FAILED").length;
    
    return {
        total_injections: foundationalNodules.length,
        successful: successCount,
        failed: foundationalNodules.length - successCount,
        results: injectionResults
    };
}

/**
 * Calculate energy distribution across rainbow spectrum
 * @param {number} energy - Total energy to distribute
 * @returns {Object} Spectrum distribution
 */
function calculateSpectrumDistribution(energy) {
    const spectrum = {};
    const baseEnergy = energy / ENGINE_CONSTANTS.RAINBOW_SPECTRUM.length;
    
    ENGINE_CONSTANTS.RAINBOW_SPECTRUM.forEach((color, index) => {
        // PHI-weighted distribution (violet gets most, red gets least)
        const phiWeight = Math.pow(ENGINE_CONSTANTS.RECYCLE_COEFFICIENT, 
                                   ENGINE_CONSTANTS.RAINBOW_SPECTRUM.length - index - 1);
        spectrum[color] = {
            energy: parseFloat((baseEnergy * (1 + phiWeight)).toFixed(4)),
            frequency_nm: 380 + (index * 50), // Approximate wavelength
            weight: parseFloat(phiWeight.toFixed(4))
        };
    });

    return spectrum;
}

/**
 * Full lifecycle recycle - death to birth loop
 * @param {number} deathTransitionRI - RI value from death_transition nodule
 * @returns {Object} Complete recycle analysis
 */
async function executeFullRecycleLoop(deathTransitionRI) {
    console.log("=== INITIATING FULL RECYCLE LOOP ===");
    
    // 1. Process rainbow refraction
    const refraction = await processRainbowRefraction({
        scaled_ri: deathTransitionRI
    });

    // 2. If successful, inject into prenatal_formation (birth)
    if (refraction.status === "VIOLET_LOOP_ACTIVE") {
        const birthInjection = await fetch(`${API}/api/omni/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                module: "prenatal_formation",
                input_data: refraction.recycled_energy * ENGINE_CONSTANTS.PHI,
                N: 10,
                z: 2
            })
        }).then(r => r.json()).catch(e => ({ error: e.message }));

        return {
            header: "FULL_RECYCLE_LOOP_COMPLETE",
            death_to_birth: {
                origin: "death_transition",
                destination: "prenatal_formation",
                energy_transferred: refraction.recycled_energy * ENGINE_CONSTANTS.PHI
            },
            refraction,
            birth_injection: birthInjection,
            loop_status: "ETERNAL_RETURN_ACTIVE",
            timestamp: new Date().toISOString()
        };
    }

    return {
        header: "RECYCLE_LOOP_INCOMPLETE",
        refraction,
        loop_status: "THRESHOLD_NOT_MET",
        timestamp: new Date().toISOString()
    };
}

// Export for module usage
export {
    ENGINE_CONSTANTS,
    encryptSignal,
    decryptSignal,
    processRainbowRefraction,
    injectFoundationalEnergy,
    calculateSpectrumDistribution,
    executeFullRecycleLoop
};

export default {
    ENGINE_CONSTANTS,
    processRainbowRefraction,
    executeFullRecycleLoop
};
