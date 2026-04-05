/**
 * RainbowKeyGenerator.js — Back-End Key Script (Client-Side Simulation)
 * Calibration: Rapid City / Black Hills [44.08, -103.23]
 * 
 * Generates the Quadruple Helix Refractive Key from ceremony payload
 */

import SovereignEngine from './SovereignEngine';

const RainbowKeyGenerator = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CALIBRATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  CALIBRATION: {
    lat: 44.08,
    lon: -103.23,
    secret: 'BLACK_HILLS_SOVEREIGN_RAINBOW'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MINT KEY (Core encryption)
  // ═══════════════════════════════════════════════════════════════════════════
  
  async mintKey(payload) {
    console.log('[RainbowKey] Minting key from payload:', payload.hash?.substring(0, 16) + '...');
    
    try {
      // A. Extract strand factors
      const strandFactors = payload.strands.map(s => s.factor);
      
      // B. Get solar offset for temporal variance
      const solarOffset = payload.solarOffset || SovereignEngine.getSolarOffset();
      
      // C. Generate 4-part Rainbow Key
      const keyParts = await Promise.all(strandFactors.map(async (factor, i) => {
        const input = `${payload.hash}:${factor}:${solarOffset}:${this.CALIBRATION.secret}:${i}`;
        const hash = await this.sha256(input);
        return hash.substring(0, 8);
      }));
      
      const rainbowKey = keyParts.join('-');
      
      // D. Generate spectral signature (colors for each node)
      const spectralSignature = this.generateSpectralSignature(rainbowKey);
      
      // E. Return attested response
      return {
        status: 'SOVEREIGN_ATTESTED',
        key: rainbowKey,
        spectralSignature,
        timestamp: Date.now(),
        location: payload.location,
        attestation: {
          solarOffset,
          hashPrefix: payload.hash?.substring(0, 16),
          strandCount: strandFactors.length
        }
      };
    } catch (error) {
      console.error('[RainbowKey] Minting failed:', error);
      return {
        status: 'MINT_FAILED',
        error: error.message
      };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHA-256 HELPER
  // ═══════════════════════════════════════════════════════════════════════════
  
  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECTRAL SIGNATURE (Map key to node colors)
  // ═══════════════════════════════════════════════════════════════════════════
  
  generateSpectralSignature(rainbowKey) {
    const parts = rainbowKey.split('-');
    const signature = {};
    
    // Map each key part to a hue for the 4 primary strands
    parts.forEach((part, i) => {
      const hexValue = parseInt(part.substring(0, 2), 16);
      const hue = (hexValue * 1.4) % 360; // Map 0-255 to 0-360
      signature[`strand_${i}`] = {
        hue,
        color: `hsl(${hue}, 80%, 60%)`,
        glow: `0 0 20px hsla(${hue}, 100%, 50%, 0.6)`
      };
    });
    
    // Map to 12 cycle nodes (distribute across zodiac)
    for (let i = 0; i < 12; i++) {
      const strandIndex = i % 4;
      const baseHue = signature[`strand_${strandIndex}`].hue;
      const offset = (i / 12) * 30; // Slight hue shift per node
      const nodeHue = (baseHue + offset) % 360;
      
      signature[`CYCLE_${i}`] = {
        hue: nodeHue,
        color: `hsl(${nodeHue}, 75%, 55%)`,
        glow: `0 0 15px hsla(${nodeHue}, 100%, 50%, 0.5)`
      };
    }
    
    // Sovereign node (Node 12) gets golden spectrum
    signature['SOURCE_12'] = {
      hue: 45,
      color: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B, #A855F7)',
      glow: '0 0 30px rgba(255, 215, 0, 0.8)'
    };
    
    return signature;
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RainbowKeyGenerator = RainbowKeyGenerator;
}

export default RainbowKeyGenerator;
