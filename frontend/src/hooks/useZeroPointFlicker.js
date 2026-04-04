/**
 * useZeroPointFlicker.js — The Gravity-Reactive Language Flicker Engine
 * 
 * PHASE 2: The Logic Engine (RULE OF NINES)
 * 
 * Detects when user reaches Zero-Point (0.48-0.52 gravity) and:
 * 1. Cycles through language registry at gravity-reactive speed
 * 2. Applies CSS glitch filter (blur + brightness) 
 * 3. Triggers haptic bursts synced to 50ms visual swap
 * 4. Generates phonetic audio textures via Web Audio API
 * 5. Follows the 9-Hexagram ritual sequence (descent and return)
 * 6. Detects SOURCE STATE at exactly 0.5000 gravity
 * 
 * THE THREE LAYERS:
 * - Visual "Strobe" (Matrix Layer): Persistence of Vision flicker
 * - Haptic "Tuning Fork" (Somatic Layer): 6-bit binary pulses
 * - "Source" State (Enlightenment Moment): White-out and silence
 * 
 * GRAVITY-REACTIVE SPEED:
 * - At edges (0.48 or 0.52): ~120ms interval (slow, steady)
 * - At exact center (0.50): ~35ms interval (rapid, intense)
 * - At precision 0.5000: STOP (Source State engaged)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePolarity } from '../context/PolarityContext';
import { 
  LANGUAGE_REGISTRY,
  ZERO_POINT_CONFIG,
  getFlickerRotation,
  calculateFlickerInterval,
  getHapticCategory,
} from '../config/languageRegistry';
import {
  HEXAGRAM_REGISTRY,
  HEXAGRAM_SEQUENCE,
  LANGUAGE_HEXAGRAM_MAP,
  getHexagram,
  getSourceHexagram,
  getNextInSequence,
} from '../config/hexagramRegistry';
import { usePhoneticSynthesizer } from './usePhoneticSynthesizer';

// Source State precision threshold (requires more precision to trigger)
// At 0.001 precision, only values between 0.4995 and 0.5005 trigger Source State
// This allows flicker to show at 0.49, 0.50, 0.51 while Source only triggers at exact 0.500
const SOURCE_PRECISION = 0.001;
const SOURCE_GRAVITY = 0.500;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ZERO-POINT FLICKER HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useZeroPointFlicker(options = {}) {
  const {
    enabled = true,
    hapticEnabled = true,
    audioEnabled = true,
    excludeCategories = [],
    chineseDialect = 'zh-cmn', // User's selected Chinese dialect
    requireManualGravity = true, // Only trigger Source State when manual gravity is active
  } = options;
  
  const { gravity, isAtZeroPoint, isVoid, manualGravityEnabled } = usePolarity();
  const phonetic = usePhoneticSynthesizer({ enabled: audioEnabled });
  
  // Flicker state
  const [isFlickering, setIsFlickering] = useState(false);
  const [currentFlickerLang, setCurrentFlickerLang] = useState(null);
  const [flickerIndex, setFlickerIndex] = useState(0);
  const [glitchStyle, setGlitchStyle] = useState({});
  
  // Hexagram state (Rule of Nines)
  const [currentHexagram, setCurrentHexagram] = useState(null);
  const [hexagramIndex, setHexagramIndex] = useState(0);
  
  // Source State (The Hidden Tenth)
  const [isSourceState, setIsSourceState] = useState(false);
  const [sourceStateActive, setSourceStateActive] = useState(false);
  const sourceStateTimeoutRef = useRef(null);
  
  // Refs for animation control
  const flickerIntervalRef = useRef(null);
  const lastFlickerTimeRef = useRef(0);
  const flickerCountRef = useRef(0);
  
  // Build rotation array (memoized, respects Chinese dialect selection)
  const flickerRotation = useMemo(() => {
    let rotation = getFlickerRotation({ excludeCategories, includeDialects: true });
    
    // Filter Chinese dialects to only include the selected one
    rotation = rotation.filter(lang => {
      if (lang.parentLanguage === 'zh') {
        return lang.code === chineseDialect;
      }
      return true;
    });
    
    return rotation;
  }, [excludeCategories, chineseDialect]);
  
  // Calculate current flicker interval based on gravity
  const currentInterval = useMemo(() => {
    if (!isAtZeroPoint) return ZERO_POINT_CONFIG.baseIntervalMs;
    if (isSourceState) return Infinity; // Stop at Source State
    return calculateFlickerInterval(gravity);
  }, [gravity, isAtZeroPoint, isSourceState]);
  
  // Calculate glitch intensity based on gravity proximity to center
  const glitchIntensity = useMemo(() => {
    if (!isAtZeroPoint) return 0;
    if (isSourceState) return 1; // Max at Source
    const { gravityCenter, gravityLow, gravityHigh } = ZERO_POINT_CONFIG;
    const distanceFromCenter = Math.abs(gravity - gravityCenter);
    const maxDistance = gravityHigh - gravityCenter;
    // Invert: closer to center = higher intensity
    return 1 - (distanceFromCenter / maxDistance);
  }, [gravity, isAtZeroPoint, isSourceState]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOURCE STATE DETECTION (Precision Trigger at 0.5000)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    // Check for precision match to Source gravity
    const isAtSource = Math.abs(gravity - SOURCE_GRAVITY) < SOURCE_PRECISION;
    
    // Only trigger Source State if:
    // 1. Gravity is at precise 0.500
    // 2. We're in Zero Point range
    // 3. Not in Void state
    // 4. Source isn't already active
    // 5. Either manual gravity is enabled OR requireManualGravity is false
    const canTriggerSource = !requireManualGravity || manualGravityEnabled;
    
    if (isAtSource && isAtZeroPoint && !isVoid && !sourceStateActive && canTriggerSource) {
      // ENGAGE SOURCE STATE
      setIsSourceState(true);
      setSourceStateActive(true);
      setIsFlickering(false);
      
      // Set hexagram to 63 (After Completion)
      setCurrentHexagram(getSourceHexagram());
      
      // Stop all flicker audio, start resonant hum
      phonetic.stopAll();
      if (audioEnabled) {
        phonetic.playResonantHum();
      }
      
      // Heavy haptic confirmation (the "home frequency" hum)
      if (hapticEnabled && navigator.vibrate) {
        // Extended "resonant hum" pattern
        navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
      }
      
      console.log('[ZeroPoint] SOURCE STATE ENGAGED at gravity:', gravity);
      
    } else if (!isAtSource && sourceStateActive) {
      // EXIT SOURCE STATE (user moved)
      
      // Clear any pending timeout
      if (sourceStateTimeoutRef.current) {
        clearTimeout(sourceStateTimeoutRef.current);
      }
      
      // Gradual exit
      sourceStateTimeoutRef.current = setTimeout(() => {
        setIsSourceState(false);
        setSourceStateActive(false);
        phonetic.stopResonantHum();
      }, 500);
    }
  }, [gravity, isAtZeroPoint, isVoid, sourceStateActive, audioEnabled, hapticEnabled, phonetic, manualGravityEnabled, requireManualGravity]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GLITCH STYLE CALCULATOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const calculateGlitchStyle = useCallback((lang, intensity) => {
    if (!lang) return {};
    
    const langGlitch = lang.zeroPoint?.glitchIntensity || 0.5;
    const combinedIntensity = intensity * langGlitch;
    
    const { blurRange, brightnessRange, hueShift } = ZERO_POINT_CONFIG;
    
    // Calculate filter values
    const blur = blurRange[0] + (blurRange[1] - blurRange[0]) * combinedIntensity;
    const brightness = brightnessRange[0] + 
      (brightnessRange[1] - brightnessRange[0]) * combinedIntensity;
    const hue = hueShift[0] + (hueShift[1] - hueShift[0]) * Math.random();
    
    return {
      filter: `blur(${blur.toFixed(1)}px) brightness(${brightness.toFixed(2)}) hue-rotate(${hue.toFixed(0)}deg)`,
      transition: 'filter 0.05s ease-out',
      willChange: 'filter',
    };
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HAPTIC BURST (6-bit binary patterns from hexagrams)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const triggerHapticBurst = useCallback((lang, hex) => {
    if (!hapticEnabled || !navigator.vibrate) return;
    
    // Prefer hexagram's 6-bit pattern if available
    if (hex && hex.hapticPattern) {
      navigator.vibrate(hex.hapticPattern);
      return;
    }
    
    // Fallback to language's zero-point burst
    const pattern = lang?.haptics?.zeroPointBurst || [10, 8, 12];
    const category = getHapticCategory(lang?.code);
    
    // Apply category multiplier
    const scaledPattern = pattern.map(ms => 
      Math.round(ms * category.flickerMultiplier)
    );
    
    navigator.vibrate(scaledPattern);
  }, [hapticEnabled]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FLICKER TICK (Core animation frame - follows Hexagram sequence)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Store latest values in refs to avoid dependency issues
  const flickerRotationRef = useRef(flickerRotation);
  const glitchIntensityRef = useRef(glitchIntensity);
  const isSourceStateRef = useRef(isSourceState);
  const currentIntervalRef = useRef(currentInterval);
  
  useEffect(() => {
    flickerRotationRef.current = flickerRotation;
    glitchIntensityRef.current = glitchIntensity;
    isSourceStateRef.current = isSourceState;
    currentIntervalRef.current = currentInterval;
  }, [flickerRotation, glitchIntensity, isSourceState, currentInterval]);
  
  const flickerTick = useCallback(() => {
    if (flickerRotationRef.current.length === 0 || isSourceStateRef.current) return;
    
    // Advance language and hexagram in sync
    setFlickerIndex(prev => {
      const next = (prev + 1) % flickerRotationRef.current.length;
      const nextLang = flickerRotationRef.current[next];
      
      // Get paired hexagram for this language
      const hexNumber = LANGUAGE_HEXAGRAM_MAP[nextLang.code];
      const hex = hexNumber ? getHexagram(hexNumber) : null;
      
      // Update current language
      setCurrentFlickerLang(nextLang);
      
      // Update current hexagram (follows language pairing)
      if (hex) {
        setCurrentHexagram(hex);
        setHexagramIndex(HEXAGRAM_SEQUENCE.indexOf(hexNumber));
      }
      
      // Calculate and apply glitch style
      setGlitchStyle(calculateGlitchStyle(nextLang, glitchIntensityRef.current));
      
      // Trigger haptic burst (synced to visual, using hexagram pattern)
      triggerHapticBurst(nextLang, hex);
      
      // Trigger phonetic audio
      if (audioEnabled && phonetic.isReady) {
        phonetic.playPhoneticBurst(nextLang.code);
        // Also play hexagram signature
        if (hex) {
          phonetic.playHexagramSignature(hex.number);
        }
      }
      
      flickerCountRef.current++;
      
      return next;
    });
  }, [calculateGlitchStyle, triggerHapticBurst, audioEnabled, phonetic]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FLICKER LOOP (Variable-rate using setTimeout)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    // Start/stop flicker based on Zero-Point state
    if (!enabled || isVoid || !isAtZeroPoint || isSourceState) {
      if (flickerIntervalRef.current) {
        clearTimeout(flickerIntervalRef.current);
        flickerIntervalRef.current = null;
      }
      
      // Only reset flicker state if not in Source State
      if (!isSourceState) {
        setIsFlickering(false);
        setCurrentFlickerLang(null);
        setGlitchStyle({});
      }
      return;
    }
    
    // Start flickering
    setIsFlickering(true);
    
    const runFlickerLoop = () => {
      flickerTick();
      
      // Schedule next tick with current gravity-reactive interval from ref
      flickerIntervalRef.current = setTimeout(runFlickerLoop, currentIntervalRef.current);
    };
    
    // Initial tick
    runFlickerLoop();
    
    return () => {
      if (flickerIntervalRef.current) {
        clearTimeout(flickerIntervalRef.current);
        flickerIntervalRef.current = null;
      }
    };
  // flickerTick is now stable thanks to refs, so we can safely include it
  }, [enabled, isVoid, isAtZeroPoint, isSourceState, flickerTick]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MANUAL CONTROLS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const forceFlickerStart = useCallback(() => {
    if (flickerRotationRef.current.length === 0 || isSourceStateRef.current) return;
    setIsFlickering(true);
    flickerTick();
  }, [flickerTick]);
  
  const forceFlickerStop = useCallback(() => {
    if (flickerIntervalRef.current) {
      clearTimeout(flickerIntervalRef.current);
      flickerIntervalRef.current = null;
    }
    setIsFlickering(false);
    setCurrentFlickerLang(null);
    setGlitchStyle({});
    phonetic.stopAll();
  }, [phonetic]);
  
  // Force exit from Source State
  const exitSourceState = useCallback(() => {
    if (sourceStateTimeoutRef.current) {
      clearTimeout(sourceStateTimeoutRef.current);
    }
    setIsSourceState(false);
    setSourceStateActive(false);
    phonetic.stopResonantHum();
  }, [phonetic]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RETURN VALUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    // State
    isFlickering,
    isAtZeroPoint,
    currentFlickerLang,
    flickerIndex,
    flickerCount: flickerCountRef.current,
    
    // Hexagram state (Rule of Nines)
    currentHexagram,
    hexagramIndex,
    
    // Source State (The Hidden Tenth)
    isSourceState,
    sourceHexagram: isSourceState ? getSourceHexagram() : null,
    
    // Computed
    currentInterval,
    glitchIntensity,
    glitchStyle,
    flickerRotation,
    
    // Display helpers
    currentGlyph: isSourceState 
      ? getSourceHexagram()?.symbol || '☵'
      : currentFlickerLang?.zeroPoint?.flickerGlyph || '∞',
    currentNative: isSourceState 
      ? 'SOURCE' 
      : currentFlickerLang?.native || '',
    currentCategory: currentFlickerLang?.category || 'modern',
    currentHexagramSymbol: currentHexagram?.symbol || '',
    
    // Controls
    forceFlickerStart,
    forceFlickerStop,
    exitSourceState,
    
    // Audio controller
    phonetic,
    
    // Config
    ZERO_POINT_CONFIG,
    HEXAGRAM_SEQUENCE,
  };
}

export default useZeroPointFlicker;
