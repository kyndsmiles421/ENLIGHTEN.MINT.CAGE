import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useDepth — Z-Axis Aware Depth System for 3D Orbital Physics
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Provides:
 * - Z-layer calculations for depth-based visual effects
 * - Dynamic blur based on distance from focal plane
 * - Haptic intensity scaling based on Z position
 * - Optional gyroscope integration (DeviceOrientation API)
 * - Device capability detection (progressive enhancement)
 * 
 * Z-Layer Hierarchy:
 * +200px — Front (Active Modal, "Tap to Enter")
 * +50px  — Mid-Front (Extracted Orbs)
 * 0px    — Center (Mission Control Hub)
 * -100px — Mid-Back (Orbiting Sub-Orbs)
 * -500px — Deep Back (Cosmic Map / Background)
 */

// ═══ Z-LAYER CONSTANTS ═══
export const Z_LAYERS = {
  FRONT: 200,         // Active modal, tap prompts
  MID_FRONT: 50,      // Extracted orbs (selected)
  CENTER: 0,          // Mission Control Hub
  MID_BACK: -100,     // Idle orbiting sub-orbs
  DEEP_BACK: -500,    // Background, cosmic map
};

// ═══ DEPTH VISUAL PRESETS ═══
const DEPTH_VISUALS = {
  [Z_LAYERS.FRONT]: { blur: 0, opacity: 1, saturation: 1.1, shadow: 20 },
  [Z_LAYERS.MID_FRONT]: { blur: 0, opacity: 1, saturation: 1, shadow: 12 },
  [Z_LAYERS.CENTER]: { blur: 0, opacity: 1, saturation: 1, shadow: 8 },
  [Z_LAYERS.MID_BACK]: { blur: 2, opacity: 0.6, saturation: 0.9, shadow: 4 },
  [Z_LAYERS.DEEP_BACK]: { blur: 6, opacity: 0.3, saturation: 0.7, shadow: 0 },
};

// ═══ CAPABILITY DETECTION ═══
function detectCapabilities() {
  const capabilities = {
    supports3D: false,
    supportsGyro: false,
    supportsBackdropBlur: false,
    isHighPerformance: false,
  };

  // Check CSS 3D transforms
  if (typeof CSS !== 'undefined' && CSS.supports) {
    capabilities.supports3D = CSS.supports('transform-style', 'preserve-3d');
    capabilities.supportsBackdropBlur = CSS.supports('backdrop-filter', 'blur(1px)');
  }

  // Check DeviceOrientation API
  capabilities.supportsGyro = 'DeviceOrientationEvent' in window;

  // Estimate performance (simple heuristic)
  if (typeof navigator !== 'undefined') {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    capabilities.isHighPerformance = cores >= 4 && memory >= 4;
  }

  return capabilities;
}

// ═══ MAIN HOOK ═══
export function useDepth(options = {}) {
  const {
    enableGyro: initialGyroEnabled = false,
    focalPlaneZ = 0,
    maxBlur = 8,
    hapticMultiplier = 1,
  } = options;

  // ═══ STATE ═══
  const [capabilities, setCapabilities] = useState(() => detectCapabilities());
  const [gyroEnabled, setGyroEnabled] = useState(() => {
    const saved = localStorage.getItem('zen_gyro_enabled');
    return saved === 'true' ? true : initialGyroEnabled;
  });
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [use3D, setUse3D] = useState(false);
  
  const frameRateRef = useRef([]);
  const lastFrameRef = useRef(performance.now());

  // ═══ CAPABILITY CHECK ON MOUNT ═══
  useEffect(() => {
    const caps = detectCapabilities();
    setCapabilities(caps);
    
    // Enable 3D if device supports it and has stable performance
    if (caps.supports3D && caps.isHighPerformance) {
      setUse3D(true);
    }

    // Frame rate monitoring for adaptive quality
    let rafId;
    const measureFrameRate = () => {
      const now = performance.now();
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;
      
      frameRateRef.current.push(1000 / delta);
      if (frameRateRef.current.length > 60) {
        frameRateRef.current.shift();
      }
      
      // If average FPS drops below 30, disable 3D
      if (frameRateRef.current.length >= 30) {
        const avgFps = frameRateRef.current.reduce((a, b) => a + b, 0) / frameRateRef.current.length;
        if (avgFps < 30 && use3D) {
          setUse3D(false);
          console.warn('[useDepth] FPS drop detected, falling back to 2.5D');
        }
      }
      
      rafId = requestAnimationFrame(measureFrameRate);
    };
    
    rafId = requestAnimationFrame(measureFrameRate);
    return () => cancelAnimationFrame(rafId);
  }, [use3D]);

  // ═══ GYROSCOPE HANDLER ═══
  useEffect(() => {
    if (!gyroEnabled || !capabilities.supportsGyro) return;

    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha || 0,  // Z-axis rotation (compass)
        beta: event.beta || 0,    // X-axis tilt (front-back)
        gamma: event.gamma || 0,  // Y-axis tilt (left-right)
      });
    };

    // Request permission on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.warn);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [gyroEnabled, capabilities.supportsGyro]);

  // ═══ PERSIST GYRO PREFERENCE ═══
  useEffect(() => {
    localStorage.setItem('zen_gyro_enabled', gyroEnabled ? 'true' : 'false');
  }, [gyroEnabled]);

  // ═══ CALCULATE DEPTH-BASED BLUR ═══
  const calculateBlur = useCallback((z) => {
    if (!use3D) return 0;
    const distanceFromFocal = Math.abs(z - focalPlaneZ);
    return Math.min(distanceFromFocal / 100 * 2, maxBlur);
  }, [use3D, focalPlaneZ, maxBlur]);

  // ═══ CALCULATE DEPTH-BASED OPACITY ═══
  const calculateOpacity = useCallback((z) => {
    if (z >= Z_LAYERS.CENTER) return 1;
    if (z <= Z_LAYERS.DEEP_BACK) return 0.3;
    // Linear interpolation between center and deep back
    const t = (z - Z_LAYERS.DEEP_BACK) / (Z_LAYERS.CENTER - Z_LAYERS.DEEP_BACK);
    return 0.3 + t * 0.7;
  }, []);

  // ═══ CALCULATE HAPTIC INTENSITY ═══
  const calculateHapticIntensity = useCallback((z) => {
    // Objects closer to the viewer (positive Z) have stronger haptics
    const normalized = (z - Z_LAYERS.DEEP_BACK) / (Z_LAYERS.FRONT - Z_LAYERS.DEEP_BACK);
    return Math.max(0.2, Math.min(1, normalized)) * hapticMultiplier;
  }, [hapticMultiplier]);

  // ═══ GET TRANSFORM STYLE FOR Z POSITION ═══
  const getTransform3D = useCallback((x, y, z, rotation = 0) => {
    if (!use3D) {
      // Fallback 2.5D: Use scale and opacity for depth illusion
      const scale = 1 + (z / 1000);
      return {
        transform: `translate(${x}px, ${y}px) scale(${Math.max(0.5, scale)}) rotate(${rotation}deg)`,
        willChange: 'transform, opacity',
      };
    }
    
    // Full 3D transform
    return {
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rotation}deg)`,
      willChange: 'transform',
    };
  }, [use3D]);

  // ═══ GET GYRO-ADJUSTED ROTATION ═══
  const getGyroRotation = useCallback(() => {
    if (!gyroEnabled || !use3D) {
      return { rotateX: 0, rotateY: 0 };
    }
    
    // Clamp the tilt values for subtle effect (max ±15 degrees)
    const maxTilt = 15;
    return {
      rotateX: Math.max(-maxTilt, Math.min(maxTilt, orientation.beta * 0.3)),
      rotateY: Math.max(-maxTilt, Math.min(maxTilt, orientation.gamma * 0.3)),
    };
  }, [gyroEnabled, use3D, orientation]);

  // ═══ GET CONTAINER 3D STYLE ═══
  const getContainerStyle = useCallback((perspective = 1000) => {
    const gyro = getGyroRotation();
    
    return {
      transformStyle: use3D ? 'preserve-3d' : 'flat',
      perspective: use3D ? `${perspective}px` : 'none',
      transform: use3D && gyroEnabled 
        ? `rotateX(${gyro.rotateX}deg) rotateY(${gyro.rotateY}deg)`
        : 'none',
      transition: 'transform 0.1s ease-out',
    };
  }, [use3D, gyroEnabled, getGyroRotation]);

  // ═══ GET DEPTH VISUAL STYLE ═══
  const getDepthStyle = useCallback((z) => {
    const blur = calculateBlur(z);
    const opacity = calculateOpacity(z);
    
    // Find nearest preset for saturation and shadow
    let preset = DEPTH_VISUALS[Z_LAYERS.CENTER];
    if (z >= Z_LAYERS.FRONT) preset = DEPTH_VISUALS[Z_LAYERS.FRONT];
    else if (z >= Z_LAYERS.MID_FRONT) preset = DEPTH_VISUALS[Z_LAYERS.MID_FRONT];
    else if (z >= Z_LAYERS.CENTER) preset = DEPTH_VISUALS[Z_LAYERS.CENTER];
    else if (z >= Z_LAYERS.MID_BACK) preset = DEPTH_VISUALS[Z_LAYERS.MID_BACK];
    else preset = DEPTH_VISUALS[Z_LAYERS.DEEP_BACK];

    return {
      filter: blur > 0 ? `blur(${blur}px) saturate(${preset.saturation})` : `saturate(${preset.saturation})`,
      opacity,
      boxShadow: preset.shadow > 0 
        ? `0 ${preset.shadow / 2}px ${preset.shadow}px rgba(0,0,0,0.3)`
        : 'none',
    };
  }, [calculateBlur, calculateOpacity]);

  // ═══ RIM LIGHT EFFECT (for orbs passing in front of Hub) ═══
  const getRimLight = useCallback((z, color = '#A78BFA') => {
    if (z <= Z_LAYERS.CENTER) return {};
    
    const intensity = Math.min((z - Z_LAYERS.CENTER) / Z_LAYERS.FRONT, 1);
    return {
      boxShadow: `0 0 ${20 * intensity}px ${color}${Math.round(intensity * 60).toString(16).padStart(2, '0')}`,
    };
  }, []);

  // ═══ TOGGLE FUNCTIONS ═══
  const toggleGyro = useCallback(() => {
    setGyroEnabled(prev => !prev);
  }, []);

  const toggle3D = useCallback(() => {
    if (capabilities.supports3D) {
      setUse3D(prev => !prev);
    }
  }, [capabilities.supports3D]);

  // ═══ RETURN ═══
  return useMemo(() => ({
    // State
    use3D,
    gyroEnabled,
    orientation,
    capabilities,
    
    // Z-Layer constants
    Z_LAYERS,
    
    // Calculation functions
    calculateBlur,
    calculateOpacity,
    calculateHapticIntensity,
    
    // Style generators
    getTransform3D,
    getContainerStyle,
    getDepthStyle,
    getRimLight,
    getGyroRotation,
    
    // Controls
    toggleGyro,
    toggle3D,
    setGyroEnabled,
  }), [
    use3D, gyroEnabled, orientation, capabilities,
    calculateBlur, calculateOpacity, calculateHapticIntensity,
    getTransform3D, getContainerStyle, getDepthStyle, getRimLight, getGyroRotation,
    toggleGyro, toggle3D,
  ]);
}

export default useDepth;
