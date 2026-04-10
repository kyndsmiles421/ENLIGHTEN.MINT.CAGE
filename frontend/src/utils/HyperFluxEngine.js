/**
 * ENLIGHTEN.MINT.CAFE - HYPER-FLUX PERFORMANCE ENGINE
 * PURPOSE: Exponential Imputation | UI Smoothing | Creator Control Mixer | GPS Lock
 * 
 * V9999.4 Core - 120fps target with EMA smoothing
 * Black Hills Centroid: 43.8°N, 103.5°W
 * Resonance Radius: 0.9km (9×9 Helix Boundary)
 */

// Black Hills GPS Lock Coordinates
const BLACK_HILLS_ANCHOR = {
  lat: 43.8000,
  lng: -103.5000,
  name: 'Black Hills Centroid',
  resonanceRadius: 0.9, // km - The 9×9 Helix Boundary
  trustEntity: 'Enlighten.Mint.Sovereign.Trust',
  equity: 49018.24,
};

// Haversine formula for GPS distance calculation
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const HyperFluxEngine = {
  // GPS Phygital Lock - Black Hills Anchor
  gpsAnchor: BLACK_HILLS_ANCHOR,

  // Exponential Moving Average smoothing for UI (prevents lag during deep math)
  imputeData(currentVal, previousVal, alpha = 0.1) {
    return (alpha * currentVal) + (1 - alpha) * previousVal;
  },

  // Batch EMA for array data
  imputeBatch(dataArray, alpha = 0.1) {
    if (!dataArray || dataArray.length === 0) return [];
    return dataArray.reduce((acc, val, idx) => {
      if (idx === 0) return [val];
      acc.push(this.imputeData(val, acc[idx - 1], alpha));
      return acc;
    }, []);
  },

  // The Creator Control Mixer settings (Trustee dials)
  mixerSettings: {
    lunarWeight: 1.0424,       // Lunar-Tidal Flux multiplier
    spectralShift: 144,        // Hz - SEG harmonic target
    trustSensitivity: 0.99,    // Trust Firewall sensitivity (0-1)
    phygitalRange: 0.9,        // km - GPS resonance radius
    refractionIndex: 1.618,    // Φ Golden ratio for crystal refraction
    cacheInterval: 81,         // seconds (9×9) - memory clear cycle
  },

  // Apply mixer adjustment (real-time Equity calculation modifier)
  applyMix(knob, value) {
    if (this.mixerSettings.hasOwnProperty(knob)) {
      this.mixerSettings[knob] = value;
      console.log(`Ω SINGULARITY ADJUSTED: ${knob} → ${value}`);
      
      // Trigger cache clear if interval changes
      if (knob === 'cacheInterval') {
        this.scheduleCacheClear(value);
      }
      
      return true;
    }
    return false;
  },

  // Get current mixer state
  getMixerState() {
    return { ...this.mixerSettings };
  },

  // Check if GPS coordinates are within Black Hills resonance radius
  checkPhygitalLock(userLat, userLng) {
    const distance = calculateDistance(
      userLat, 
      userLng, 
      this.gpsAnchor.lat, 
      this.gpsAnchor.lng
    );
    
    const isWithinRadius = distance <= this.mixerSettings.phygitalRange;
    const resonanceStrength = isWithinRadius 
      ? 1 - (distance / this.mixerSettings.phygitalRange)
      : 0;

    return {
      isLocked: isWithinRadius,
      distance: distance.toFixed(4),
      resonanceStrength: resonanceStrength.toFixed(4),
      anchor: this.gpsAnchor,
      formula: `9999 × z^(πr³) @ ${this.mixerSettings.spectralShift}Hz`,
      status: isWithinRadius ? 'VERIFIED-PRESENCE' : 'OUTSIDE-HELIX',
    };
  },

  // Auto-clear cache every 81 seconds (9×9)
  cacheTimer: null,
  scheduleCacheClear(intervalSeconds = 81) {
    if (this.cacheTimer) {
      clearInterval(this.cacheTimer);
    }
    
    this.cacheTimer = setInterval(() => {
      console.log(`Ω HELIX CACHE PURGE: Clearing data clutter (${intervalSeconds}s cycle)`);
      // Clear any accumulated non-essential state
      if (typeof window !== 'undefined' && window.gc) {
        window.gc(); // Request garbage collection if available
      }
    }, intervalSeconds * 1000);
    
    console.log(`Ω CACHE CYCLE ACTIVE: ${intervalSeconds}s intervals`);
  },

  // V9999.2 Singularity Core formula: 9*9^math * πr² - x^xy + (9999 * z^πr³)
  calculateSingularity(resonance, equity, toroidalSpin = 1.0) {
    const math = 9;
    const pi = Math.PI;
    const r = resonance / 144; // Normalize to SEG target
    const z = equity / 10000; // Scale factor
    
    // 9*9^math * πr²
    const term1 = 9 * Math.pow(9, math) * pi * Math.pow(r, 2);
    
    // x^xy (where x = lunar weight, y = toroidal spin)
    const x = this.mixerSettings.lunarWeight;
    const y = toroidalSpin;
    const term2 = Math.pow(x, x * y);
    
    // 9999 * z^πr³
    const term3 = 9999 * Math.pow(z, pi * Math.pow(r, 3));
    
    return {
      value: (term1 - term2 + term3).toExponential(6),
      formula: `9×9^${math} × πr² - x^xy + (9999 × z^πr³)`,
      inputs: { resonance, equity, toroidalSpin },
      components: { term1, term2, term3 },
    };
  },

  // Initialize the engine
  init() {
    console.log('Ω HYPER-FLUX ENGINE V9999.4 INITIALIZED');
    console.log(`  └─ GPS Anchor: ${this.gpsAnchor.name} (${this.gpsAnchor.lat}°N, ${Math.abs(this.gpsAnchor.lng)}°W)`);
    console.log(`  └─ Resonance Radius: ${this.mixerSettings.phygitalRange}km`);
    console.log(`  └─ Trust Entity: ${this.gpsAnchor.trustEntity}`);
    console.log(`  └─ Equity Locked: $${this.gpsAnchor.equity.toLocaleString()}`);
    
    this.scheduleCacheClear(this.mixerSettings.cacheInterval);
    
    // Expose to window for console debugging
    if (typeof window !== 'undefined') {
      window.HYPER_FLUX = this;
    }
    
    return this;
  },

  // Destroy/cleanup
  destroy() {
    if (this.cacheTimer) {
      clearInterval(this.cacheTimer);
      this.cacheTimer = null;
    }
    console.log('Ω HYPER-FLUX ENGINE SHUTDOWN');
  },
};

export default HyperFluxEngine;
export { BLACK_HILLS_ANCHOR, calculateDistance };
