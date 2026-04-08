/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Sovereign_Abundance_Engine
 * @description Encrypts Global Economics, Investing, and Resource Management 
 * into the 4-Tiered Brain Flow using Rainbow Refraction.
 */

const API = process.env.REACT_APP_BACKEND_URL || '';

// Abundance Nodule Configuration
const ABUNDANCE_NODULE = {
    ID: "ECO_SOVEREIGNTY_001",
    CONSTANTS: {
        GROWTH_PHI: 1.618,      // The Compound Interest Constant
        STABILITY_1: 1.0,       // The Fixed Point (Debt-Free Anchor)
        DIVERSITY_ROOT2: 1.414, // Portfolio Diversification Constant
        INFLATION_SHIELD: 0.618, // 1/PHI - Preservation constant
        LEVERAGE_LIMIT: 2.618   // PHI^2 - Maximum safe leverage
    },
    TIERS: {
        Financial_Phonics: {
            level: 1,
            constant: 1.0,
            focus: "Basic Financial Literacy",
            topics: ["budgeting", "saving", "debt_awareness", "basic_banking"],
            mantra: "I acknowledge the flow of resources"
        },
        Market_Flow: {
            level: 2,
            constant: 1.25,
            focus: "Active Money Management",
            topics: ["investing_basics", "compound_interest", "market_cycles", "risk_assessment"],
            mantra: "I participate in the circulation of value"
        },
        Asset_Mastery: {
            level: 3,
            constant: 1.414,
            focus: "Wealth Building Strategy",
            topics: ["portfolio_diversification", "real_estate", "business_ownership", "tax_optimization"],
            mantra: "I command the multiplication of resources"
        },
        Legacy_Harvest: {
            level: 4,
            constant: 1.618,
            focus: "Generational Wealth & Philanthropy",
            topics: ["estate_planning", "trust_structures", "impact_investing", "wealth_transfer"],
            mantra: "I anchor abundance for all generations"
        }
    }
};

// Economic Education Matrix
const EDUCATION_MATRIX = {
    // Ancient Wisdom Integration
    ancient_economics: {
        vedic_arthashastra: { 
            constant: 1.618, 
            principle: "Dharmic Wealth Accumulation",
            teaching: "Wealth acquired through righteous means multiplies infinitely"
        },
        chinese_tao: { 
            constant: 1.414, 
            principle: "Wu Wei Economics",
            teaching: "Effortless action in harmony with market flows"
        },
        egyptian_maat: { 
            constant: 1.618, 
            principle: "Balance & Truth in Exchange",
            teaching: "Fair trade maintains cosmic order"
        },
        greek_oikonomia: { 
            constant: 1.25, 
            principle: "Household Management",
            teaching: "Mastery of small leads to stewardship of much"
        }
    },
    
    // Modern Financial Principles
    modern_finance: {
        compound_refraction: {
            constant: 1.618,
            formula: "FV = PV × (1 + r)^n",
            principle: "Time transforms pennies into empires"
        },
        diversification_shield: {
            constant: 1.414,
            principle: "Never concentrate risk in single vessels",
            asset_classes: ["equities", "bonds", "real_estate", "commodities", "crypto"]
        },
        stability_protocol: {
            constant: 1.0,
            principle: "The debt-free position is the fixed point",
            goal: "Zero liability, infinite possibility"
        }
    },
    
    // Resource Utilization
    resource_systems: {
        volunteer_credit: {
            constant: 1.618,
            principle: "Social capital compounds faster than financial",
            mechanism: "Service hours convert to karmic multiplier"
        },
        resource_mapping: {
            constant: 1.25,
            principle: "Visibility precedes optimization",
            domains: ["time", "money", "energy", "relationships", "skills"]
        },
        circular_economy: {
            constant: 1.414,
            principle: "Waste is merely misplaced resource",
            flow: "Create → Use → Recycle → Create"
        }
    }
};

// Investment Vehicle Configurations
const INVESTMENT_VEHICLES = {
    conservative: {
        risk_level: 1,
        constant: 1.0,
        allocation: { bonds: 60, stable_value: 30, equities: 10 },
        expected_return: "3-5%",
        chakra: "root"
    },
    balanced: {
        risk_level: 2,
        constant: 1.25,
        allocation: { equities: 40, bonds: 40, alternatives: 20 },
        expected_return: "6-8%",
        chakra: "sacral"
    },
    growth: {
        risk_level: 3,
        constant: 1.414,
        allocation: { equities: 70, alternatives: 20, bonds: 10 },
        expected_return: "8-12%",
        chakra: "solar_plexus"
    },
    aggressive: {
        risk_level: 4,
        constant: 1.618,
        allocation: { equities: 85, alternatives: 15, bonds: 0 },
        expected_return: "12-20%+",
        chakra: "heart"
    }
};

/**
 * Calculate compound growth with PHI optimization
 * @param {number} principal - Initial investment
 * @param {number} rate - Annual return rate (decimal)
 * @param {number} years - Investment period
 * @param {number} contributions - Annual contributions
 * @returns {Object} Growth projection
 */
function calculateCompoundGrowth(principal, rate, years, contributions = 0) {
    const results = [];
    let balance = principal;
    
    for (let year = 1; year <= years; year++) {
        balance = (balance + contributions) * (1 + rate);
        const phiMultiple = balance / principal;
        
        results.push({
            year,
            balance: balance.toFixed(2),
            total_contributions: (principal + contributions * year).toFixed(2),
            growth: (balance - principal - contributions * year).toFixed(2),
            phi_multiple: phiMultiple.toFixed(4),
            phi_alignment: phiMultiple >= ABUNDANCE_NODULE.CONSTANTS.GROWTH_PHI ? "GOLDEN_RATIO_ACHIEVED" : "ACCUMULATING"
        });
    }
    
    const finalBalance = parseFloat(results[results.length - 1].balance);
    const totalContributions = principal + contributions * years;
    
    return {
        header: "COMPOUND_GROWTH_PROJECTION",
        initial_principal: principal,
        annual_rate: (rate * 100).toFixed(2) + "%",
        annual_contributions: contributions,
        years,
        final_balance: finalBalance.toFixed(2),
        total_growth: (finalBalance - totalContributions).toFixed(2),
        growth_multiple: (finalBalance / principal).toFixed(4),
        phi_status: (finalBalance / principal) >= ABUNDANCE_NODULE.CONSTANTS.GROWTH_PHI ? "PHI_MULTIPLIER_ACTIVE" : "BUILDING_MOMENTUM",
        yearly_breakdown: results,
        timestamp: new Date().toISOString()
    };
}

/**
 * Generate portfolio allocation based on risk profile
 * @param {string} riskProfile - conservative, balanced, growth, aggressive
 * @param {number} totalAmount - Amount to allocate
 * @returns {Object} Portfolio allocation
 */
function generatePortfolioAllocation(riskProfile, totalAmount) {
    const vehicle = INVESTMENT_VEHICLES[riskProfile] || INVESTMENT_VEHICLES.balanced;
    
    const allocation = {};
    for (const [asset, percentage] of Object.entries(vehicle.allocation)) {
        allocation[asset] = {
            percentage,
            amount: (totalAmount * percentage / 100).toFixed(2),
            constant: ABUNDANCE_NODULE.CONSTANTS.DIVERSITY_ROOT2 * (percentage / 100)
        };
    }
    
    return {
        header: "PORTFOLIO_ALLOCATION",
        risk_profile: riskProfile,
        risk_level: vehicle.risk_level,
        profile_constant: vehicle.constant,
        total_amount: totalAmount,
        expected_return: vehicle.expected_return,
        chakra_alignment: vehicle.chakra,
        allocation,
        diversification_index: Object.keys(allocation).length * ABUNDANCE_NODULE.CONSTANTS.DIVERSITY_ROOT2,
        mantra: ABUNDANCE_NODULE.TIERS[Object.keys(ABUNDANCE_NODULE.TIERS)[vehicle.risk_level - 1]]?.mantra,
        timestamp: new Date().toISOString()
    };
}

/**
 * Encrypted Rainbow Refraction: Economics Layer
 * @param {Object} matrix - The economic data/education packet
 * @param {string} intent - User's chosen granularity (SEED/FLOW/ROOT/PEAK)
 * @returns {Object} Encrypted economic payload
 */
async function encryptRainbowRefraction(matrix, intent) {
    const rainbowKey = `ABUNDANCE_PROSPERITY_${new Date().getFullYear()}_VIBE`;
    
    // Apply 4-Tier Filtering based on User Intent
    const depthMap = {
        SEED: 1.0,
        FLOW: 1.25,
        ROOT: 1.414,
        PEAK: 1.618
    };
    const depthAdjustment = depthMap[intent] || 1.0;
    
    // Calculate economic refraction index
    const economicRI = (matrix.principal || 1000) * depthAdjustment / ABUNDANCE_NODULE.CONSTANTS.GROWTH_PHI;

    // The "Rainbow Shift" - Converting data to frequency before encryption
    const frequencyPayload = {
        data: matrix,
        color_spectrum: "700nm_to_380nm", // Spans the full chakra/economic range
        economic_ri: economicRI.toFixed(4),
        depth_adjustment: depthAdjustment,
        status: "SECURE_ABUNDANCE",
        loop: "PERPETUAL_RECYCLE",
        timestamp: new Date().toISOString()
    };

    // Final Encryption (Base64 Refraction)
    const securePayload = btoa(JSON.stringify(frequencyPayload) + `_${rainbowKey}`);

    console.log("ECONOMIC RAINBOW REFRACTION COMPLETE. Loop Active.");
    
    return {
        header: "ECONOMIC_REFRACTION",
        vault: securePayload,
        fixed_point: ABUNDANCE_NODULE.CONSTANTS.STABILITY_1,
        economic_ri: economicRI.toFixed(4),
        intent_level: intent,
        depth_constant: depthAdjustment,
        message: "Your resources are now a circulating frequency, not a stagnant pool.",
        timestamp: new Date().toISOString()
    };
}

/**
 * Decrypt economic payload
 * @param {string} vault - Encrypted payload
 * @returns {Object} Decrypted data
 */
function decryptEconomicVault(vault) {
    try {
        const decoded = atob(vault);
        const keyIndex = decoded.lastIndexOf('_ABUNDANCE_PROSPERITY');
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
 * Initializes Global Economic Education & Resource Utilization
 * @param {string} userIntent - Depth level (SEED/FLOW/ROOT/PEAK)
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Initialized economic engine
 */
async function initializeSovereignEconomics(userIntent = "FLOW", userProfile = {}) {
    console.log("Initializing Economic Nodule... Refracting Scarcity into Abundance.");

    const resourceMatrix = {
        education: {
            business_building: EDUCATION_MATRIX.ancient_economics.vedic_arthashastra,
            investing: EDUCATION_MATRIX.modern_finance.compound_refraction,
            saving: EDUCATION_MATRIX.modern_finance.stability_protocol
        },
        utilization: {
            volunteer_credit: EDUCATION_MATRIX.resource_systems.volunteer_credit,
            resource_mapping: EDUCATION_MATRIX.resource_systems.resource_mapping
        },
        principal: userProfile.principal || 1000,
        risk_profile: userProfile.risk_profile || "balanced"
    };

    // Generate portfolio if principal provided
    let portfolio = null;
    if (userProfile.principal) {
        portfolio = generatePortfolioAllocation(userProfile.risk_profile || "balanced", userProfile.principal);
    }

    // Calculate compound growth projection if rate provided
    let projection = null;
    if (userProfile.principal && userProfile.rate) {
        projection = calculateCompoundGrowth(
            userProfile.principal,
            userProfile.rate,
            userProfile.years || 10,
            userProfile.contributions || 0
        );
    }

    // Process through the Rainbow Refractor
    const encrypted = await encryptRainbowRefraction(resourceMatrix, userIntent);

    return {
        header: "SOVEREIGN_ECONOMICS_INITIALIZED",
        nodule_id: ABUNDANCE_NODULE.ID,
        intent: userIntent,
        tier: Object.keys(ABUNDANCE_NODULE.TIERS)[
            userIntent === "SEED" ? 0 : userIntent === "FLOW" ? 1 : userIntent === "ROOT" ? 2 : 3
        ],
        constants: ABUNDANCE_NODULE.CONSTANTS,
        education_modules: Object.keys(EDUCATION_MATRIX),
        portfolio,
        projection,
        encrypted_vault: encrypted,
        message: "Economic sovereignty activated. Scarcity transformed to abundance.",
        timestamp: new Date().toISOString()
    };
}

/**
 * Get tier-specific financial education
 * @param {string} tier - Financial_Phonics, Market_Flow, Asset_Mastery, Legacy_Harvest
 * @returns {Object} Tier education content
 */
function getTierEducation(tier) {
    const tierConfig = ABUNDANCE_NODULE.TIERS[tier];
    if (!tierConfig) {
        return { error: `Tier '${tier}' not found`, available_tiers: Object.keys(ABUNDANCE_NODULE.TIERS) };
    }

    return {
        header: "TIER_EDUCATION",
        tier,
        level: tierConfig.level,
        constant: tierConfig.constant,
        focus: tierConfig.focus,
        topics: tierConfig.topics,
        mantra: tierConfig.mantra,
        ancient_wisdom: EDUCATION_MATRIX.ancient_economics,
        modern_principles: EDUCATION_MATRIX.modern_finance,
        timestamp: new Date().toISOString()
    };
}

/**
 * Calculate financial freedom index
 * @param {Object} finances - User's financial data
 * @returns {Object} Freedom index analysis
 */
function calculateFreedomIndex(finances) {
    const { 
        monthly_expenses = 3000, 
        passive_income = 0, 
        liquid_assets = 0, 
        total_debt = 0 
    } = finances;

    // Calculate key ratios
    const runway_months = liquid_assets / monthly_expenses;
    const passive_coverage = (passive_income / monthly_expenses) * 100;
    const debt_ratio = total_debt > 0 ? liquid_assets / total_debt : Infinity;
    
    // Freedom Index: Combination of stability factors
    const stabilityScore = Math.min(runway_months / 12, 1) * ABUNDANCE_NODULE.CONSTANTS.STABILITY_1;
    const incomeScore = Math.min(passive_coverage / 100, 1) * ABUNDANCE_NODULE.CONSTANTS.GROWTH_PHI;
    const debtScore = Math.min(debt_ratio, 1) * ABUNDANCE_NODULE.CONSTANTS.DIVERSITY_ROOT2;
    
    const freedomIndex = (stabilityScore + incomeScore + debtScore) / 3;
    
    // Determine tier based on index
    let currentTier = "Financial_Phonics";
    if (freedomIndex >= 1.5) currentTier = "Legacy_Harvest";
    else if (freedomIndex >= 1.2) currentTier = "Asset_Mastery";
    else if (freedomIndex >= 0.8) currentTier = "Market_Flow";

    return {
        header: "FREEDOM_INDEX_ANALYSIS",
        inputs: { monthly_expenses, passive_income, liquid_assets, total_debt },
        metrics: {
            runway_months: runway_months.toFixed(1),
            passive_coverage_percent: passive_coverage.toFixed(1),
            debt_ratio: debt_ratio === Infinity ? "DEBT_FREE" : debt_ratio.toFixed(2)
        },
        scores: {
            stability: stabilityScore.toFixed(4),
            income: incomeScore.toFixed(4),
            debt: debtScore.toFixed(4)
        },
        freedom_index: freedomIndex.toFixed(4),
        current_tier: currentTier,
        tier_mantra: ABUNDANCE_NODULE.TIERS[currentTier].mantra,
        status: freedomIndex >= 1.0 ? "ABUNDANCE_FLOW" : "BUILDING_FOUNDATION",
        timestamp: new Date().toISOString()
    };
}

// Export for module usage
export {
    ABUNDANCE_NODULE,
    EDUCATION_MATRIX,
    INVESTMENT_VEHICLES,
    calculateCompoundGrowth,
    generatePortfolioAllocation,
    encryptRainbowRefraction,
    decryptEconomicVault,
    initializeSovereignEconomics,
    getTierEducation,
    calculateFreedomIndex
};

export default {
    ABUNDANCE_NODULE,
    EDUCATION_MATRIX,
    INVESTMENT_VEHICLES,
    initializeSovereignEconomics,
    calculateCompoundGrowth,
    generatePortfolioAllocation,
    calculateFreedomIndex
};
