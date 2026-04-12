/**
 * ENLIGHTEN.MINT.CAFE - V29.2 OMNIS-NEXUS
 * 
 * PURPOSE: Nodal Projection | Tiered UI Morphing | Time Usage Tracking
 * 
 * FEATURES:
 * - Decentralized Academy into Global Nodal Network
 * - GPS-AR Live Portals adapting to proximity, Tier, and Mixer settings
 * - Creator Mixer cross-pollination with UI Mixer
 * - Gamified Credit System (10 Fans/hr) — NO USD VALUES
 */

import { PHI, HELIX, SEG_HZ } from './OmegaSingularity';

// ═══════════════════════════════════════════════════════════════════════════════
// TIER STRUCTURE & CONSTANTS — GAMIFIED CREDITS (NO USD)
// ═══════════════════════════════════════════════════════════════════════════════

export const ACTIVE_TIERS = ['APPRENTICE', 'TRUSTEE', 'ARCHITECT'];
export const CREDIT_RATE = 10; // Fans/hour — Gamified internal credits
export const CREDIT_UNIT = 'Fans';
export const USAGE_RATE = CREDIT_RATE; // Alias for backward compatibility

// Tier Access Matrix — Credit-based (no USD)
export const TIER_ACCESS = {
  0: {
    name: 'Apprentice',
    epoch: 'PRESENT',
    features: ['High-contrast text', 'Basic Sacred Geometry'],
    creditRate: 10,
    description: 'Access to the Present epoch. UI is high-contrast, text-guided.',
  },
  1: {
    name: 'Trustee',
    epoch: 'PAST_PRESENT',
    features: ['Circular Protocol Ledger', 'Sacred Geometry wireframes'],
    creditRate: 10,
    description: 'Access to Past/Present. Unlocks the Circular Protocol Ledger.',
  },
  2: {
    name: 'Grand Architect',
    epoch: 'FULL',
    features: ['Future epoch', 'Creator Mixer', 'Gesture navigation', 'Obsidian Void'],
    creditRate: 10,
    description: 'Full access to Future epoch + Creator Mixer. Pure gesture navigation.',
  },
};

// GPS Nodal Anchors (Academy Portals)
export const NODAL_ANCHORS = {
  MASONRY_SCHOOL: {
    id: 'masonry_school',
    name: 'Masonry School Node',
    lat: 43.8,
    lng: -103.5,
    radius: 0.9, // km
    epoch: 'PAST', // Violet Epoch
    curriculum: ['Sacred Geometry', 'Stone Craft', 'Hermetic Architecture'],
    color: '#8B5CF6', // Violet
    description: 'Unlocks the Past (Violet Epoch) — Focuses on Sacred Geometry & Stone Craft',
  },
  BLACK_HILLS_PRIMARY: {
    id: 'black_hills_primary',
    name: 'Black Hills Primary Anchor',
    lat: 44.0805,
    lng: -103.2310,
    radius: 1.8, // km
    epoch: 'CORE', // Singularity
    curriculum: ['Engineering', 'Trust Equity', '9×9 Helix Math'],
    color: '#22C55E', // Green
    description: 'Unlocks the Singularity (Core) — Focuses on Engineering & Trust Equity',
  },
};

// Mixer Dial System Impact
export const MIXER_IMPACTS = {
  SPECTRAL_RESONANCE: {
    name: 'Spectral Resonance',
    impact: 'Shifts the portal epoch (Past/Present/Future)',
    visualization: 'Changes color refraction from Violet to Blue',
  },
  TRUST_FIREWALL: {
    name: 'Trust Firewall',
    impact: 'Adjusts the GPS radius of the geofence',
    visualization: 'Visualizes the "Helix Boundary" in AR',
  },
  LUNAR_FLUX: {
    name: 'Lunar-Tidal Flux',
    impact: 'Modifies the "Learning Pace" (Adaptive Speed)',
    visualization: 'Smooths or accelerates the L² Fractal zoom',
  },
  UI_TIER: {
    name: 'User Interface Tier',
    impact: 'Switches between "Apprentice" and "Grand Architect"',
    visualization: 'Morphs HUD from simple icons to Geometric Gestures',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// OMNIS-NEXUS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const OmnisNexus = {
  activeTiers: ACTIVE_TIERS,
  usageRate: USAGE_RATE,
  phi: PHI,
  helix: HELIX,
  segHz: SEG_HZ,
  
  // Session tracking
  sessionState: {
    startTime: null,
    activeNode: null,
    equityConsumed: 0,
    totalSessionTime: 0,
  },

  /**
   * Apply Creator Mixer settings to UI
   * Connects the Creator Mixer to the UI morphing system
   * @param {Object} settings - Mixer dial settings
   */
  applyMixerSettings(settings) {
    const { resonance = 144, flux = 1.0424, tierIndex = 0, holographicOpacity = 0.88 } = settings;
    
    const currentTier = this.activeTiers[Math.min(tierIndex, this.activeTiers.length - 1)];
    const tierAccess = TIER_ACCESS[tierIndex] || TIER_ACCESS[0];
    
    // Calculate epoch based on resonance
    let epoch = 'PRESENT';
    if (resonance < 100) epoch = 'PAST';
    else if (resonance > 180) epoch = 'FUTURE';
    
    console.log(`Ω UI MORPHED TO: ${currentTier} | EPOCH: ${epoch} | RESONANCE: ${resonance}Hz`);
    
    return {
      tier: currentTier,
      tierIndex,
      epoch,
      resonance,
      lunarFlux: flux,
      holographicOpacity,
      access: tierAccess,
      mixerState: 'APPLIED',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Start a learning session (time tracking)
   * @param {string} nodeId - Active node identifier
   */
  startLearningSession(nodeId = 'default') {
    this.sessionState.startTime = Date.now();
    this.sessionState.activeNode = nodeId;
    
    console.log(`Ω LEARNING SESSION STARTED: ${nodeId}`);
    
    return {
      sessionId: `SES-${Date.now().toString(16).toUpperCase()}`,
      nodeId,
      startTime: new Date(this.sessionState.startTime).toISOString(),
      usageRate: `$${this.usageRate}/hr`,
    };
  },

  /**
   * Track and complete learning session
   * Deducts from Knowledge Equity based on time spent
   * @param {number} endTime - Session end timestamp (optional, defaults to now)
   */
  trackLearningSession(endTime = Date.now()) {
    if (!this.sessionState.startTime) {
      return { error: 'No active session', status: 'IDLE' };
    }
    
    const startTime = this.sessionState.startTime;
    const hours = (endTime - startTime) / 3600000; // Convert ms to hours
    const cost = hours * this.usageRate;
    
    // Update session state
    this.sessionState.equityConsumed += cost;
    this.sessionState.totalSessionTime += hours;
    this.sessionState.startTime = null;
    
    const result = {
      sessionComplete: true,
      duration: {
        hours: parseFloat(hours.toFixed(4)),
        minutes: parseFloat((hours * 60).toFixed(2)),
      },
      equityConsumed: `$${cost.toFixed(2)}`,
      totalEquityConsumed: `$${this.sessionState.equityConsumed.toFixed(2)}`,
      totalSessionTime: `${this.sessionState.totalSessionTime.toFixed(2)} hours`,
      node: this.sessionState.activeNode,
      timestamp: new Date().toISOString(),
    };
    
    this.sessionState.activeNode = null;
    
    console.log(`Ω SESSION COMPLETE: ${result.duration.hours}hrs | EQUITY CONSUMED: ${result.equityConsumed}`);
    
    return result;
  },

  /**
   * Check GPS proximity to nodal anchors
   * @param {number} lat - User latitude
   * @param {number} lng - User longitude
   */
  checkNodalProximity(lat, lng) {
    const results = [];
    
    for (const [key, anchor] of Object.entries(NODAL_ANCHORS)) {
      const distance = this.haversineDistance(lat, lng, anchor.lat, anchor.lng);
      const inRange = distance <= anchor.radius;
      
      results.push({
        node: key,
        name: anchor.name,
        distance: `${distance.toFixed(2)} km`,
        inRange,
        epoch: anchor.epoch,
        curriculum: anchor.curriculum,
        color: anchor.color,
        action: inRange ? 'INJECT_PORTAL' : 'STANDBY',
      });
    }
    
    // Sort by distance
    results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    
    const nearestActive = results.find(r => r.inRange);
    
    return {
      userLocation: { lat, lng },
      nodalStatus: results,
      activePortal: nearestActive || null,
      portalInjected: !!nearestActive,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Haversine formula for distance calculation
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Claim a wildcard GPS node (seed school anywhere)
   * @param {Object} nodeData - Node creation data
   */
  claimWildcardNode(nodeData) {
    const { lat, lng, name, curriculum = [], creatorEmail } = nodeData;
    
    if (!lat || !lng || !name || !creatorEmail) {
      return { error: 'Missing required fields: lat, lng, name, creatorEmail' };
    }
    
    const nodeId = `WILD-${Date.now().toString(16).toUpperCase()}`;
    
    return {
      nodeId,
      name,
      lat,
      lng,
      radius: 0.5, // Default radius for wildcard nodes
      epoch: 'CUSTOM',
      curriculum,
      createdBy: creatorEmail,
      createdAt: new Date().toISOString(),
      status: 'PENDING_VERIFICATION',
      color: '#F59E0B', // Amber for wildcard
    };
  },

  /**
   * Get tier-based UI configuration
   * @param {number} tierIndex - User's tier (0-2)
   */
  getTierUI(tierIndex) {
    const tier = TIER_ACCESS[Math.min(tierIndex, 2)] || TIER_ACCESS[0];
    
    const uiConfig = {
      0: {
        layout: 'STANDARD',
        navigation: 'BUTTONS',
        contrast: 'HIGH',
        geometry: 'BASIC',
        hudOpacity: 1.0,
      },
      1: {
        layout: 'ENHANCED',
        navigation: 'MIXED',
        contrast: 'MEDIUM',
        geometry: 'WIREFRAME',
        hudOpacity: 0.9,
      },
      2: {
        layout: 'OBSIDIAN_VOID',
        navigation: 'GESTURES_ONLY',
        contrast: 'LOW',
        geometry: 'FLOATING_NODES',
        hudOpacity: 0.7,
      },
    };
    
    return {
      tierIndex,
      tierName: tier.name,
      epoch: tier.epoch,
      features: tier.features,
      uiConfig: uiConfig[tierIndex] || uiConfig[0],
      navigationMode: tierIndex >= 2 ? 'ZEN_FLOW_HUD' : 'STANDARD_BUTTONS',
    };
  },

  /**
   * Initialize the Omnis-Nexus system
   */
  init() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Ω OMNIS-NEXUS V10000.3 INITIALIZED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  └─ Nodal Architecture: ACTIVE');
    console.log('  └─ GPS-AR Portals: BROADCASTING');
    console.log(`  └─ Usage Rate: $${this.usageRate}/hr`);
    console.log('  └─ Tier System: 3-Level Morphing');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (typeof window !== 'undefined') {
      window.OMNIS_NEXUS = this;
    }
    
    return this;
  },
};

export default OmnisNexus;
