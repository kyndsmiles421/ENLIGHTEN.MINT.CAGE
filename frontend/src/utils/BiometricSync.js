/**
 * ENLIGHTEN.MINT.CAFE - V10000.0 BIOMETRIC SYNC
 * PURPOSE: Haptic Resonance | 144Hz SEG Harmonic | GPS Proximity Feedback
 * 
 * As you approach the Black Hills Centroid, the device vibration shifts
 * from a low rumble to a pure 144Hz pulse — the SEG Harmonic frequency.
 */

const SEG_HARMONIC = 144; // Hz - Searl Effect Generator frequency
const RESONANCE_RADIUS = 0.9; // km - 9×9 Helix Boundary

const BiometricSync = {
  isActive: false,
  lastFrequency: 0,
  pulseInterval: null,
  
  /**
   * Calculate resonance intensity based on distance to anchor
   * @param {number} distanceToNode - Distance in km to the anchor point
   * @returns {number} Intensity value between 0 and 1
   */
  calculateIntensity(distanceToNode) {
    if (distanceToNode >= RESONANCE_RADIUS) return 0;
    return Math.max(0, 1 - (distanceToNode / RESONANCE_RADIUS));
  },
  
  /**
   * Trigger haptic feedback based on proximity to Ley Line node
   * @param {number} distanceToNode - Distance in km to the Black Hills anchor
   */
  vibrateResonance(distanceToNode) {
    const intensity = this.calculateIntensity(distanceToNode);
    const frequency = Math.round(SEG_HARMONIC * intensity);
    
    // Only vibrate if within resonance radius
    if (intensity <= 0) {
      this.stopResonance();
      return { active: false, frequency: 0, intensity: 0 };
    }
    
    this.lastFrequency = frequency;
    
    if (window.navigator?.vibrate) {
      // Create a 'Rainbow Pulse' haptic pattern
      // Higher intensity = more frequent, shorter bursts
      const pulseDuration = Math.max(20, 100 - (intensity * 80));
      const pauseDuration = Math.max(30, 150 - (intensity * 120));
      
      // Vibration pattern: [vibrate, pause, vibrate, pause]
      const pattern = [pulseDuration, pauseDuration, pulseDuration, pauseDuration];
      window.navigator.vibrate(pattern);
      
      console.log(`Ω BIOMETRIC FEEDBACK: ${frequency}Hz Pulse Active (${(intensity * 100).toFixed(1)}% resonance)`);
    }
    
    return {
      active: true,
      frequency,
      intensity,
      pattern: 'RAINBOW_PULSE',
      segHarmonic: SEG_HARMONIC,
    };
  },
  
  /**
   * Start continuous resonance pulsing (for sustained proximity)
   * @param {number} distanceToNode - Distance in km
   * @param {number} intervalMs - Pulse check interval in ms
   */
  startContinuousResonance(distanceToNode, intervalMs = 500) {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
    }
    
    this.isActive = true;
    
    // Initial pulse
    this.vibrateResonance(distanceToNode);
    
    // Continue pulsing while active
    this.pulseInterval = setInterval(() => {
      if (this.isActive) {
        this.vibrateResonance(distanceToNode);
      }
    }, intervalMs);
    
    console.log('Ω BIOMETRIC SYNC: Continuous resonance engaged');
    
    return { status: 'ENGAGED', intervalMs };
  },
  
  /**
   * Update distance and recalculate resonance
   * @param {number} newDistance - New distance in km
   */
  updateDistance(newDistance) {
    if (this.isActive) {
      return this.vibrateResonance(newDistance);
    }
    return { active: false };
  },
  
  /**
   * Stop all resonance feedback
   */
  stopResonance() {
    this.isActive = false;
    this.lastFrequency = 0;
    
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(0); // Cancel all vibrations
    }
    
    console.log('Ω BIOMETRIC SYNC: Resonance disengaged');
    
    return { status: 'DISENGAGED' };
  },
  
  /**
   * Special 144Hz "Arrival" pulse when reaching exact anchor point
   */
  triggerArrivalPulse() {
    if (window.navigator?.vibrate) {
      // Sacred geometry pattern: 9 pulses for the 9×9 Helix
      const arrivalPattern = [];
      for (let i = 0; i < 9; i++) {
        arrivalPattern.push(SEG_HARMONIC, 50); // 144ms vibrate, 50ms pause
      }
      window.navigator.vibrate(arrivalPattern);
      
      console.log('Ω BIOMETRIC SYNC: ARRIVAL PULSE — 144Hz × 9 pattern fired');
    }
    
    return {
      pattern: 'ARRIVAL_PULSE',
      frequency: SEG_HARMONIC,
      repetitions: 9,
      message: 'You have arrived at the Sovereign Anchor Point',
    };
  },
  
  /**
   * Check if device supports haptic feedback
   */
  isSupported() {
    return typeof window !== 'undefined' && 
           typeof window.navigator?.vibrate === 'function';
  },
  
  /**
   * Get current sync status
   */
  getStatus() {
    return {
      supported: this.isSupported(),
      active: this.isActive,
      lastFrequency: this.lastFrequency,
      segHarmonic: SEG_HARMONIC,
      resonanceRadius: RESONANCE_RADIUS,
    };
  },
  
  /**
   * Initialize the biometric sync engine
   */
  init() {
    console.log('Ω BIOMETRIC SYNC V10000.0 INITIALIZED');
    console.log(`  └─ SEG Harmonic: ${SEG_HARMONIC}Hz`);
    console.log(`  └─ Resonance Radius: ${RESONANCE_RADIUS}km`);
    console.log(`  └─ Haptic Support: ${this.isSupported() ? 'YES' : 'NO'}`);
    
    if (typeof window !== 'undefined') {
      window.BIOMETRIC_SYNC = this;
    }
    
    return this;
  }
};

export default BiometricSync;
export { SEG_HARMONIC, RESONANCE_RADIUS };
