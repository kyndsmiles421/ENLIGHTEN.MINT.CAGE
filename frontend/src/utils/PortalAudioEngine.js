/**
 * PORTAL AUDIO ENGINE
 * Spatial Audio for the Vortex Handshake Sequence
 * 
 * Frequencies:
 * - Press: 174Hz (Grounding/Tension Relief)
 * - Zoom: Shepard Tone (80Hz → 528Hz) with circular panning
 * - Dome: 528Hz + 963Hz bloom (Transformation/Pure Consciousness)
 */

const PortalAudioEngine = (() => {
  let audioContext = null;
  let isInitialized = false;
  let activeNodes = [];

  // Solfeggio Frequencies
  const FREQUENCIES = {
    GROUNDING: 174,      // Relieves tension
    ROOT: 396,           // Liberating guilt/fear
    TRANSFORMATION: 528, // DNA repair, miracles
    CONNECTION: 639,     // Relationships
    AWAKENING: 741,      // Expression/solutions
    INTUITION: 852,      // Returning to spiritual order
    CONSCIOUSNESS: 963   // Pure consciousness
  };

  // Initialize AudioContext (requires user interaction)
  const init = () => {
    if (isInitialized) return audioContext;
    
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      isInitialized = true;
      console.log('[PortalAudio] AudioContext initialized. Sample rate:', audioContext.sampleRate);
    } catch (e) {
      console.error('[PortalAudio] Failed to create AudioContext:', e);
    }
    
    return audioContext;
  };

  // Resume context if suspended (mobile requirement)
  const resume = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('[PortalAudio] AudioContext resumed');
    }
  };

  // Create a simple reverb impulse response
  const createReverb = (duration = 2, decay = 2) => {
    const rate = audioContext.sampleRate;
    const length = rate * duration;
    const impulse = audioContext.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    
    const convolver = audioContext.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: THE PRESS - Grounding Hum (174Hz)
  // ═══════════════════════════════════════════════════════════════════════════
  const playPressHum = () => {
    if (!audioContext) init();
    resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(FREQUENCIES.GROUNDING, audioContext.currentTime);
    
    // Soft attack
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    activeNodes.push({ osc, gain, type: 'press' });
    
    console.log('[PortalAudio] Press hum started: 174Hz');
    return { osc, gain };
  };

  // Stop the press hum with fade out
  const stopPressHum = () => {
    const pressNode = activeNodes.find(n => n.type === 'press');
    if (pressNode) {
      pressNode.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
      setTimeout(() => {
        pressNode.osc.stop();
        activeNodes = activeNodes.filter(n => n !== pressNode);
      }, 250);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: THE ZOOM - Shepard Tone with Circular Panning
  // Pan(θ) = (sin(θ), cos(θ)) where θ accelerates from 0 to 4π
  // ═══════════════════════════════════════════════════════════════════════════
  const playShepardZoom = (duration = 1.5) => {
    if (!audioContext) init();
    resume();

    const numVoices = 6;
    const baseFreq = 80;
    const voices = [];
    
    // Create multiple oscillator voices for Shepard illusion
    for (let i = 0; i < numVoices; i++) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const panner = audioContext.createStereoPanner();
      
      osc.type = 'sine';
      
      // Each voice starts at a different octave
      const startFreq = baseFreq * Math.pow(2, i);
      osc.frequency.setValueAtTime(startFreq, audioContext.currentTime);
      
      // Rise to transformation frequency (528Hz range)
      const endFreq = startFreq * (528 / 80);
      osc.frequency.exponentialRampToValueAtTime(
        Math.min(endFreq, 2000), // Cap at 2kHz
        audioContext.currentTime + duration
      );
      
      // Amplitude envelope - bell curve for Shepard effect
      const peakTime = audioContext.currentTime + duration * 0.5;
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.08 / numVoices, peakTime);
      gain.gain.linearRampToValueAtTime(0.02 / numVoices, audioContext.currentTime + duration);
      
      // Connect: osc → gain → panner → destination
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(audioContext.destination);
      
      voices.push({ osc, gain, panner });
    }

    // Circular panning animation: θ from 0 to 4π over duration
    // Pan(θ) = sin(θ) for left-right
    const startTime = audioContext.currentTime;
    const panInterval = setInterval(() => {
      const elapsed = audioContext.currentTime - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        clearInterval(panInterval);
        return;
      }
      
      // θ accelerates: starts slow, ends fast (ease-in)
      const theta = 4 * Math.PI * Math.pow(progress, 1.5);
      const panValue = Math.sin(theta);
      
      voices.forEach(v => {
        v.panner.pan.setValueAtTime(panValue, audioContext.currentTime);
      });
    }, 16); // ~60fps

    // Start all voices
    voices.forEach(v => {
      v.osc.start();
      activeNodes.push({ ...v, type: 'shepard' });
    });

    // Auto-stop after duration
    setTimeout(() => {
      voices.forEach(v => {
        try { v.osc.stop(); } catch (e) {}
      });
      activeNodes = activeNodes.filter(n => n.type !== 'shepard');
      console.log('[PortalAudio] Shepard zoom complete');
    }, duration * 1000 + 100);

    console.log(`[PortalAudio] Shepard zoom started: ${numVoices} voices, ${duration}s`);
    return voices;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: THE DOME - 528Hz + 963Hz Bloom with Wide Stereo
  // ═══════════════════════════════════════════════════════════════════════════
  const playDomeAmbience = () => {
    if (!audioContext) init();
    resume();

    // 528Hz - Transformation
    const osc528 = audioContext.createOscillator();
    const gain528 = audioContext.createGain();
    const pan528 = audioContext.createStereoPanner();
    
    osc528.type = 'sine';
    osc528.frequency.setValueAtTime(FREQUENCIES.TRANSFORMATION, audioContext.currentTime);
    pan528.pan.setValueAtTime(-0.7, audioContext.currentTime); // Left-biased
    
    // 963Hz - Pure Consciousness
    const osc963 = audioContext.createOscillator();
    const gain963 = audioContext.createGain();
    const pan963 = audioContext.createStereoPanner();
    
    osc963.type = 'sine';
    osc963.frequency.setValueAtTime(FREQUENCIES.CONSCIOUSNESS, audioContext.currentTime);
    pan963.pan.setValueAtTime(0.7, audioContext.currentTime); // Right-biased
    
    // Create reverb for spaciousness
    const reverb = createReverb(3, 1.5);
    const reverbGain = audioContext.createGain();
    reverbGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    // Slow bloom envelope
    [gain528, gain963].forEach(g => {
      g.gain.setValueAtTime(0, audioContext.currentTime);
      g.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 2);
    });
    
    // Connect 528Hz path
    osc528.connect(gain528);
    gain528.connect(pan528);
    pan528.connect(audioContext.destination);
    pan528.connect(reverb);
    
    // Connect 963Hz path
    osc963.connect(gain963);
    gain963.connect(pan963);
    pan963.connect(audioContext.destination);
    pan963.connect(reverb);
    
    // Reverb to output
    reverb.connect(reverbGain);
    reverbGain.connect(audioContext.destination);
    
    osc528.start();
    osc963.start();
    
    activeNodes.push(
      { osc: osc528, gain: gain528, panner: pan528, type: 'dome' },
      { osc: osc963, gain: gain963, panner: pan963, type: 'dome' }
    );
    
    console.log('[PortalAudio] Dome ambience started: 528Hz + 963Hz with reverb');
    
    return { osc528, osc963, reverb };
  };

  // Stop dome ambience with fade out
  const stopDomeAmbience = (fadeTime = 2) => {
    const domeNodes = activeNodes.filter(n => n.type === 'dome');
    domeNodes.forEach(node => {
      node.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeTime);
      setTimeout(() => {
        try { node.osc.stop(); } catch (e) {}
      }, fadeTime * 1000 + 100);
    });
    activeNodes = activeNodes.filter(n => n.type !== 'dome');
    console.log('[PortalAudio] Dome ambience fading out');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL PORTAL SEQUENCE
  // ═══════════════════════════════════════════════════════════════════════════
  const playFullSequence = () => {
    if (!audioContext) init();
    resume();

    console.log('[PortalAudio] ═══ FULL PORTAL SEQUENCE INITIATED ═══');
    
    // Phase 1: Press hum
    playPressHum();
    
    // Phase 2: After 300ms, start Shepard zoom and fade press hum
    setTimeout(() => {
      stopPressHum();
      playShepardZoom(1.5);
    }, 300);
    
    // Phase 3: Dome ambience starts as zoom completes
    setTimeout(() => {
      playDomeAmbience();
    }, 1500);
  };

  // Stop all audio
  const stopAll = () => {
    activeNodes.forEach(node => {
      try {
        node.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        setTimeout(() => node.osc.stop(), 350);
      } catch (e) {}
    });
    activeNodes = [];
    console.log('[PortalAudio] All audio stopped');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════
  const setupEventListeners = () => {
    // Hook into portal initiation
    window.addEventListener('INITIATE_PORTAL', () => {
      playFullSequence();
    });

    // Hook into portal exit
    window.addEventListener('EXIT_PORTAL', () => {
      stopDomeAmbience();
    });

    // Hook into stasis for cleanup
    window.addEventListener('SHAMBHALA_STASIS', () => {
      stopAll();
    });

    console.log('[PortalAudio] Event listeners registered');
  };

  // Initialize on load
  if (typeof window !== 'undefined') {
    window.PortalAudioEngine = {
      init,
      resume,
      playPressHum,
      stopPressHum,
      playShepardZoom,
      playDomeAmbience,
      stopDomeAmbience,
      playFullSequence,
      stopAll,
      FREQUENCIES
    };

    // Setup listeners when DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupEventListeners);
    } else {
      setupEventListeners();
    }

    // Initialize on first user interaction (mobile requirement)
    const initOnInteraction = () => {
      init();
      document.removeEventListener('click', initOnInteraction);
      document.removeEventListener('touchstart', initOnInteraction);
    };
    document.addEventListener('click', initOnInteraction);
    document.addEventListener('touchstart', initOnInteraction);

    console.log('[PortalAudio] Engine loaded. Awaiting user interaction to initialize AudioContext.');
  }

  return {
    init,
    resume,
    playPressHum,
    stopPressHum,
    playShepardZoom,
    playDomeAmbience,
    stopDomeAmbience,
    playFullSequence,
    stopAll,
    FREQUENCIES,
    setupEventListeners
  };
})();

export default PortalAudioEngine;
