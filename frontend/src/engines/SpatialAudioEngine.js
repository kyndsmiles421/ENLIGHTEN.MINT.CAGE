/**
 * SpatialAudioEngine.js — HRTF Positional Audio System
 * 
 * THE SPATIAL ARCHITECTURE:
 * - Listener: Tracks camera position/orientation
 * - Panner Nodes: HRTF model for realistic 3D positioning
 * - Distance Model: Inverse falloff for natural attenuation
 * 
 * HARMONIC POINTS:
 * - Create localized sound sources in 3D space
 * - Bio-sync integration for breath-based modulation
 * - Solfeggio frequency presets for healing tones
 * 
 * Web Audio API with modern AudioParam automation.
 */

// Solfeggio frequency presets (Hz)
export const SOLFEGGIO_FREQUENCIES = {
  UT: 396,   // Liberation from fear
  RE: 417,   // Facilitating change
  MI: 528,   // Transformation, DNA repair
  FA: 639,   // Connecting, relationships
  SOL: 741,  // Awakening intuition
  LA: 852,   // Returning to spiritual order
  TI: 963,   // Divine consciousness
};

// Ambient sound types
export const AMBIENT_TYPES = {
  RESONANCE: 'resonance',  // Continuous drone
  CRYSTAL: 'crystal',      // Crystalline chimes
  BREATH: 'breath',        // Bio-sync breathing
  COSMIC: 'cosmic',        // Space ambiance
  WATER: 'water',          // Flowing water
};

/**
 * SpatialAudioEngine - HRTF 3D Audio System
 */
class SpatialAudioEngine {
  constructor() {
    this.audioContext = null;
    this.listener = null;
    this.sources = new Map();
    this.masterGain = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.masterVolume = 0.7;
    
    // Bio-sync state
    this.breathPhase = 0;
    this.breathSpeed = 0.001; // 5.5s cycle
  }

  /**
   * Initialize audio context (must be called after user gesture)
   */
  async init() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.listener = this.audioContext.listener;
      
      // Master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      console.log('[SpatialAudio] Initialized');
      
      return true;
    } catch (err) {
      console.error('[SpatialAudio] Failed to initialize:', err);
      return false;
    }
  }

  /**
   * Update listener position from Three.js camera
   * @param {THREE.Camera} camera - The active camera
   */
  updateListener(camera) {
    if (!this.isInitialized || !this.listener) return;

    const pos = camera.position;
    
    // Calculate forward and up vectors from camera quaternion
    const forward = { x: 0, y: 0, z: -1 };
    const up = { x: 0, y: 1, z: 0 };
    
    // Apply quaternion rotation (simplified for non-Three.js use)
    if (camera.quaternion) {
      const q = camera.quaternion;
      // Forward vector
      forward.x = 2 * (q.x * q.z + q.w * q.y);
      forward.y = 2 * (q.y * q.z - q.w * q.x);
      forward.z = 1 - 2 * (q.x * q.x + q.y * q.y);
      // Up vector
      up.x = 2 * (q.x * q.y - q.w * q.z);
      up.y = 1 - 2 * (q.x * q.x + q.z * q.z);
      up.z = 2 * (q.y * q.z + q.w * q.x);
    }

    // Modern Web Audio API (AudioParam)
    if (this.listener.positionX) {
      this.listener.positionX.setValueAtTime(pos.x, this.audioContext.currentTime);
      this.listener.positionY.setValueAtTime(pos.y, this.audioContext.currentTime);
      this.listener.positionZ.setValueAtTime(pos.z, this.audioContext.currentTime);
      this.listener.forwardX.setValueAtTime(forward.x, this.audioContext.currentTime);
      this.listener.forwardY.setValueAtTime(forward.y, this.audioContext.currentTime);
      this.listener.forwardZ.setValueAtTime(forward.z, this.audioContext.currentTime);
      this.listener.upX.setValueAtTime(up.x, this.audioContext.currentTime);
      this.listener.upY.setValueAtTime(up.y, this.audioContext.currentTime);
      this.listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime);
    } else {
      // Legacy API fallback
      this.listener.setPosition(pos.x, pos.y, pos.z);
      this.listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  /**
   * Create a localized harmonic point in 3D space
   * @param {string} id - Unique identifier
   * @param {string} url - Audio file URL (optional for oscillator-based)
   * @param {Object} position - {x, y, z} coordinates
   * @param {Object} options - Configuration options
   */
  createHarmonicPoint(id, url, position, options = {}) {
    if (!this.isInitialized) {
      console.warn('[SpatialAudio] Not initialized');
      return null;
    }

    const {
      volume = 0.5,
      loop = true,
      refDistance = 1,
      maxDistance = 100,
      rolloffFactor = 1,
      coneInnerAngle = 360,
      coneOuterAngle = 360,
      coneOuterGain = 0,
    } = options;

    // Create panner node with HRTF
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = refDistance;
    panner.maxDistance = maxDistance;
    panner.rolloffFactor = rolloffFactor;
    panner.coneInnerAngle = coneInnerAngle;
    panner.coneOuterAngle = coneOuterAngle;
    panner.coneOuterGain = coneOuterGain;

    // Set position
    if (panner.positionX) {
      panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
    } else {
      panner.setPosition(position.x, position.y, position.z);
    }

    // Gain node for this source
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    let sourceNode = null;
    let audioElement = null;

    if (url) {
      // Media element source
      audioElement = new Audio(url);
      audioElement.loop = loop;
      audioElement.crossOrigin = 'anonymous';
      sourceNode = this.audioContext.createMediaElementSource(audioElement);
    }

    // Connect: source -> gain -> panner -> master
    if (sourceNode) {
      sourceNode.connect(gainNode);
    }
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    // Store reference
    const harmonicPoint = {
      id,
      panner,
      gainNode,
      sourceNode,
      audioElement,
      position: { ...position },
      isPlaying: false,
    };

    this.sources.set(id, harmonicPoint);

    return harmonicPoint;
  }

  /**
   * Create an oscillator-based harmonic point (no audio file needed)
   * @param {string} id - Unique identifier
   * @param {number} frequency - Frequency in Hz
   * @param {Object} position - {x, y, z} coordinates
   * @param {Object} options - Configuration options
   */
  createOscillatorPoint(id, frequency, position, options = {}) {
    if (!this.isInitialized) {
      console.warn('[SpatialAudio] Not initialized');
      return null;
    }

    const {
      volume = 0.1,
      waveform = 'sine', // sine, square, sawtooth, triangle
      refDistance = 1,
      maxDistance = 50,
    } = options;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Create panner
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = refDistance;
    panner.maxDistance = maxDistance;

    if (panner.positionX) {
      panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
    }

    // Gain
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    // Connect
    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    const point = {
      id,
      oscillator,
      panner,
      gainNode,
      frequency,
      position: { ...position },
      isPlaying: false,
    };

    this.sources.set(id, point);

    return point;
  }

  /**
   * Create ambient Solfeggio tones at strategic positions
   * @param {number} domeRadius - Radius for positioning
   */
  createSolfeggioField(domeRadius = 10) {
    const frequencies = Object.entries(SOLFEGGIO_FREQUENCIES);
    
    frequencies.forEach(([name, freq], index) => {
      // Position in a ring around the listener
      const angle = (index / frequencies.length) * Math.PI * 2;
      const position = {
        x: Math.cos(angle) * domeRadius * 0.8,
        y: (index - 3) * 2, // Vertical spread
        z: Math.sin(angle) * domeRadius * 0.8,
      };

      this.createOscillatorPoint(`solfeggio-${name}`, freq, position, {
        volume: 0.05,
        waveform: 'sine',
        refDistance: 2,
        maxDistance: domeRadius * 2,
      });
    });

    return frequencies.length;
  }

  /**
   * Play a harmonic point
   * @param {string} id - Point identifier
   */
  play(id) {
    const point = this.sources.get(id);
    if (!point) return false;

    if (point.audioElement && !point.isPlaying) {
      point.audioElement.play().catch(e => console.warn('Playback failed:', e));
      point.isPlaying = true;
    } else if (point.oscillator && !point.isPlaying) {
      point.oscillator.start();
      point.isPlaying = true;
    }

    return true;
  }

  /**
   * Stop a harmonic point
   * @param {string} id - Point identifier
   */
  stop(id) {
    const point = this.sources.get(id);
    if (!point) return false;

    if (point.audioElement) {
      point.audioElement.pause();
      point.audioElement.currentTime = 0;
      point.isPlaying = false;
    } else if (point.oscillator && point.isPlaying) {
      point.oscillator.stop();
      point.isPlaying = false;
      // Oscillators can only be started once, remove reference
      this.sources.delete(id);
    }

    return true;
  }

  /**
   * Update point position (for moving sounds)
   * @param {string} id - Point identifier
   * @param {Object} position - New {x, y, z} position
   */
  updatePosition(id, position) {
    const point = this.sources.get(id);
    if (!point || !point.panner) return false;

    const time = this.audioContext.currentTime;

    if (point.panner.positionX) {
      point.panner.positionX.setValueAtTime(position.x, time);
      point.panner.positionY.setValueAtTime(position.y, time);
      point.panner.positionZ.setValueAtTime(position.z, time);
    } else {
      point.panner.setPosition(position.x, position.y, position.z);
    }

    point.position = { ...position };
    return true;
  }

  /**
   * Set volume for a specific point
   * @param {string} id - Point identifier
   * @param {number} volume - Volume (0-1)
   */
  setVolume(id, volume) {
    const point = this.sources.get(id);
    if (!point || !point.gainNode) return false;

    point.gainNode.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.audioContext.currentTime
    );
    return true;
  }

  /**
   * Set master volume
   * @param {number} volume - Volume (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVolume,
        this.audioContext.currentTime
      );
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVolume,
        this.audioContext.currentTime
      );
    }
    return this.isMuted;
  }

  /**
   * Apply bio-sync modulation to all sources
   * @param {number} breathPhase - Current breath phase (0-1)
   */
  applyBioSync(breathPhase) {
    this.breathPhase = breathPhase;
    const modulation = 0.7 + breathPhase * 0.3; // Volume varies 70%-100%

    this.sources.forEach((point) => {
      if (point.gainNode && point.isPlaying) {
        const baseVolume = point.baseVolume || 0.5;
        point.gainNode.gain.setValueAtTime(
          baseVolume * modulation,
          this.audioContext.currentTime
        );
      }
    });
  }

  /**
   * Stop all sounds and cleanup
   */
  stopAll() {
    this.sources.forEach((point, id) => {
      this.stop(id);
    });
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    this.stopAll();
    this.sources.clear();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    console.log('[SpatialAudio] Disposed');
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      sourceCount: this.sources.size,
      contextState: this.audioContext?.state || 'closed',
    };
  }
}

// Singleton instance
export const SpatialAudio = new SpatialAudioEngine();

/**
 * React Hook for Spatial Audio
 */
export function useSpatialAudio() {
  const initAudio = async () => {
    return await SpatialAudio.init();
  };

  const createPoint = (id, url, position, options) => {
    return SpatialAudio.createHarmonicPoint(id, url, position, options);
  };

  const createOscillator = (id, frequency, position, options) => {
    return SpatialAudio.createOscillatorPoint(id, frequency, position, options);
  };

  const updateListener = (camera) => {
    SpatialAudio.updateListener(camera);
  };

  const play = (id) => SpatialAudio.play(id);
  const stop = (id) => SpatialAudio.stop(id);
  const setVolume = (id, vol) => SpatialAudio.setVolume(id, vol);
  const setMasterVolume = (vol) => SpatialAudio.setMasterVolume(vol);
  const toggleMute = () => SpatialAudio.toggleMute();
  const applyBioSync = (phase) => SpatialAudio.applyBioSync(phase);
  const createSolfeggioField = (radius) => SpatialAudio.createSolfeggioField(radius);
  const stopAll = () => SpatialAudio.stopAll();
  const dispose = () => SpatialAudio.dispose();
  const getState = () => SpatialAudio.getState();

  return {
    initAudio,
    createPoint,
    createOscillator,
    updateListener,
    play,
    stop,
    setVolume,
    setMasterVolume,
    toggleMute,
    applyBioSync,
    createSolfeggioField,
    stopAll,
    dispose,
    getState,
    SOLFEGGIO_FREQUENCIES,
  };
}

export default SpatialAudio;
