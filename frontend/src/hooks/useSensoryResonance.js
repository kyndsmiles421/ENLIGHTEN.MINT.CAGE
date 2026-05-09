import { useCallback, useRef, useEffect, useState } from 'react';
import { useSensory } from '../context/SensoryContext';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useSensoryResonance — Unified Haptic + Visual + Audio Feedback System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Combines three sensory channels into synchronized feedback:
 * 1. Haptic Pulse: navigator.vibrate() patterns
 * 2. Sensory Bloom: CSS filter transitions (brightness/blur)
 * 3. Audio Resonance: Low-frequency sine wave swells
 * 
 * Respects:
 * - Emergency Shut-Off state (kills all feedback)
 * - Global mute state (kills audio but keeps haptics)
 * - Battery conservation mode (throttles intensity)
 * - User preference (zen_haptics_enabled in localStorage)
 */

// ═══ HAPTIC PATTERNS ═══
export const HAPTIC_PATTERNS = {
  // Orbital interactions
  orbExtract: [10, 30, 10],          // Crisp "click" for extraction
  orbTap: [8],                        // Subtle tap acknowledgment
  orbBloom: [15, 10, 25],            // Bloom expansion feel
  orbCollapse: [5, 10, 5],           // Gentle collapse
  orbNavigate: [30, 15, 50],         // Strong confirmation for navigation
  
  // UI interactions
  buttonTap: [10],                   // Standard button press
  toggleOn: [15, 8, 15],             // Toggle activation
  toggleOff: [8, 5, 8],              // Toggle deactivation
  
  // Feedback patterns
  success: [20, 30, 20, 30, 40],     // Ascending success
  error: [50, 30, 50],               // Sharp error alert
  warning: [30, 20, 30],             // Moderate warning
  
  // Ambient patterns
  heartbeat: [40, 80, 40, 200],      // Calm heartbeat rhythm
  breath: [20, 100, 20, 100, 20, 200], // Breathing rhythm
  
  // Emergency
  killAll: [50, 30, 50],             // Emergency stop confirmation
};

// ═══ AUDIO RESONANCE FREQUENCIES ═══
const RESONANCE_FREQS = {
  extract: 65.41,    // C2 - deep extraction rumble
  bloom: 130.81,     // C3 - bloom expansion
  tap: 261.63,       // C4 - tap acknowledgment
  navigate: 196.00,  // G3 - navigation confirmation
  success: 329.63,   // E4 - success chime
  error: 73.42,      // D2 - error rumble
};

// ═══ BLOOM FILTER PRESETS ═══
const BLOOM_EFFECTS = {
  extract: { brightness: 1.15, blur: 0, duration: 200 },
  bloom: { brightness: 1.25, blur: 2, duration: 400 },
  tap: { brightness: 1.08, blur: 0, duration: 100 },
  navigate: { brightness: 1.3, blur: 4, duration: 300 },
  pulse: { brightness: 1.1, blur: 1, duration: 150 },
};

export function useSensoryResonance() {
  const { isMuted } = useSensory();
  const audioCtxRef = useRef(null);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const lastHapticTime = useRef(0);
  const HAPTIC_THROTTLE_MS = 50; // Minimum time between haptics

  // ═══ INITIALIZATION ═══
  useEffect(() => {
    // Check user preference
    const pref = localStorage.getItem('zen_haptics_enabled');
    setHapticsEnabled(pref !== 'false');

    // Battery conservation check
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const checkBattery = () => {
          // Enable low power mode if battery < 20% and not charging
          setLowPowerMode(battery.level < 0.2 && !battery.charging);
        };
        checkBattery();
        battery.addEventListener('levelchange', checkBattery);
        battery.addEventListener('chargingchange', checkBattery);
      }).catch(() => {});
    }
  }, []);

  // ═══ EMERGENCY SHUT-OFF CHECK ═══
  const isEmergencyActive = useCallback(() => {
    // Check if ambient soundscape was killed (indicates emergency stop)
    return localStorage.getItem('zen_ambient_soundscape') === 'off' && 
           localStorage.getItem('zen_emergency_active') === 'true';
  }, []);

  // ═══ HAPTIC PULSE ═══
  const haptic = useCallback((pattern = 'buttonTap') => {
    // Skip if disabled, emergency active, or throttled
    if (!hapticsEnabled) return;
    if (isEmergencyActive()) return;
    if (!navigator.vibrate) return;
    
    const now = Date.now();
    if (now - lastHapticTime.current < HAPTIC_THROTTLE_MS) return;
    lastHapticTime.current = now;

    // Get pattern or use custom array
    const vibrationPattern = Array.isArray(pattern) 
      ? pattern 
      : HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.buttonTap;

    // In low power mode, reduce intensity by shortening durations
    const finalPattern = lowPowerMode 
      ? vibrationPattern.map(v => Math.round(v * 0.6))
      : vibrationPattern;

    try {
      navigator.vibrate(finalPattern);
    } catch (e) {
      console.warn('Haptic vibration failed:', e);
    }
  }, [hapticsEnabled, lowPowerMode, isEmergencyActive]);

  // ═══ AUDIO RESONANCE ═══
  const audioResonance = useCallback((type = 'tap', options = {}) => {
    // Skip if muted or emergency active
    if (isMuted) return;
    if (isEmergencyActive()) return;
    if (lowPowerMode) return; // Skip audio in low power mode

    const { volume = 0.08, duration = 150 } = options;
    const freq = RESONANCE_FREQS[type] || RESONANCE_FREQS.tap;

    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Register for emergency shut-off
        if (!window.__cosmicAudioContexts) window.__cosmicAudioContexts = [];
        window.__cosmicAudioContexts.push(audioCtxRef.current);
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Create oscillator for resonance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // ADSR envelope for natural swell
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02); // Attack
      gain.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + 0.05); // Decay
      gain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + (duration / 1000) * 0.8); // Sustain
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000); // Release

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000 + 0.05);
    } catch (e) {
      console.warn('Audio resonance failed:', e);
    }
  }, [isMuted, lowPowerMode, isEmergencyActive]);

  // ═══ SENSORY BLOOM (CSS FILTER) ═══
  const bloomRef = useRef(null);
  
  const triggerBloom = useCallback((type = 'tap', targetElement = null) => {
    if (isEmergencyActive()) return;

    const effect = BLOOM_EFFECTS[type] || BLOOM_EFFECTS.tap;
    const el = targetElement || document.body;

    // Store original filter
    const originalFilter = el.style.filter || 'none';
    const originalTransition = el.style.transition || '';

    // Apply bloom effect
    el.style.transition = `filter ${effect.duration}ms ease-out`;
    el.style.filter = `brightness(${effect.brightness}) blur(${effect.blur}px)`;

    // Clear any pending timeout
    if (bloomRef.current) clearTimeout(bloomRef.current);

    // Restore original after duration
    bloomRef.current = setTimeout(() => {
      el.style.transition = `filter ${effect.duration}ms ease-in`;
      el.style.filter = originalFilter;
      
      // Clean up transition after animation
      setTimeout(() => {
        el.style.transition = originalTransition;
      }, effect.duration);
    }, effect.duration);
  }, [isEmergencyActive]);

  // ═══ COMBINED RESONANCE (All Three Channels) ═══
  const resonate = useCallback((type, options = {}) => {
    const { element = null, skipHaptic = false, skipAudio = false, skipBloom = false } = options;

    if (!skipHaptic) haptic(type);
    if (!skipAudio) audioResonance(type, options);
    if (!skipBloom) triggerBloom(type, element);
  }, [haptic, audioResonance, triggerBloom]);

  // ═══ ORBITAL-SPECIFIC RESONANCES ═══
  const orbitalResonance = {
    extract: (el) => resonate('extract', { element: el, volume: 0.1, duration: 200 }),
    bloom: (el) => resonate('bloom', { element: el, volume: 0.06, duration: 400 }),
    tap: (el) => resonate('tap', { element: el, volume: 0.05, duration: 100 }),
    navigate: (el) => resonate('navigate', { element: el, volume: 0.12, duration: 300 }),
    collapse: (el) => {
      haptic('orbCollapse');
      triggerBloom('tap', el);
    },
  };

  // ═══ GHOST LAYER CLEANUP — Track active audio nodes for proper GC ═══
  const activeNodesRef = useRef([]);
  
  const cleanupAudioNode = useCallback((osc, gain) => {
    // Disconnect and nullify to help GC
    try {
      osc.disconnect();
      gain.disconnect();
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    
    // Remove from active nodes
    activeNodesRef.current = activeNodesRef.current.filter(
      n => n.osc !== osc && n.gain !== gain
    );
  }, []);

  // ═══ SETTINGS ═══
  const setHapticsPreference = useCallback((enabled) => {
    setHapticsEnabled(enabled);
    localStorage.setItem('zen_haptics_enabled', enabled ? 'true' : 'false');
  }, []);

  // ═══ AUTO-RESUME after unmute ═══
  const resumeAudio = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, []);

  // Listen for unmute events
  useEffect(() => {
    const handleUnmute = () => {
      // Clear emergency flag if it was set
      localStorage.removeItem('zen_emergency_active');
      resumeAudio();
    };
    
    window.addEventListener('zen-unmute', handleUnmute);
    return () => window.removeEventListener('zen-unmute', handleUnmute);
  }, [resumeAudio]);

  // ═══ CLEANUP ═══
  useEffect(() => {
    return () => {
      // Clear bloom timeout
      if (bloomRef.current) clearTimeout(bloomRef.current);
      
      // Disconnect all active audio nodes (Ghost Layer cleanup)
      activeNodesRef.current.forEach(({ osc, gain }) => {
        try { osc.stop(); osc.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        try { gain.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      });
      activeNodesRef.current = [];
      
      // Close audio context
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      }
      
      // Remove from global registry
      if (window.__cosmicAudioContexts && audioCtxRef.current) {
        window.__cosmicAudioContexts = window.__cosmicAudioContexts.filter(
          ctx => ctx !== audioCtxRef.current
        );
      }
      
      audioCtxRef.current = null;
    };
  }, []);

  return {
    // Core functions
    haptic,
    audioResonance,
    triggerBloom,
    resonate,
    
    // Orbital-specific
    orbitalResonance,
    
    // Patterns reference
    patterns: HAPTIC_PATTERNS,
    
    // State
    hapticsEnabled,
    lowPowerMode,
    
    // Settings
    setHapticsPreference,
    
    // Control
    resumeAudio,
    
    // Cleanup helper (for manual use)
    cleanupAudioNode,
  };
}

export default useSensoryResonance;
