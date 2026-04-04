import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getDeviceTier, 
  getEffectiveTier, 
  shouldMountWebGL,
  detectDeviceTierWithBattery,
  RENDER_TIERS,
  TIER_FEATURES,
  PerformanceMonitor,
} from '../utils/renderDelegate';

/**
 * useRenderTier — Hook for managing render tier based on device + user preference
 * 
 * Integrates device capability detection with user's view tier selection.
 * Respects the "User Choice Only" principle: if user selects Parchment,
 * WebGL is never mounted regardless of device capability.
 */
export function useRenderTier(userViewTier = 'parchment') {
  const [deviceTier, setDeviceTier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [batterySaverActive, setBatterySaverActive] = useState(false);

  // Detect device capabilities on mount
  useEffect(() => {
    async function detect() {
      setIsLoading(true);
      try {
        const result = await detectDeviceTierWithBattery();
        setDeviceTier(result);
        setBatterySaverActive(result.batterySaverActive || false);
      } catch (e) {
        // Fallback to basic detection
        setDeviceTier(getDeviceTier());
      }
      setIsLoading(false);
    }
    detect();
  }, []);

  // Calculate effective tier based on user preference + device
  const effectiveTier = useMemo(() => {
    if (!deviceTier) return null;
    return getEffectiveTier(userViewTier, deviceTier);
  }, [userViewTier, deviceTier]);

  // Should WebGL be active?
  const webglEnabled = useMemo(() => {
    if (!deviceTier) return false;
    return shouldMountWebGL(userViewTier, deviceTier);
  }, [userViewTier, deviceTier]);

  // Get feature flags for current tier
  const features = useMemo(() => {
    if (!effectiveTier) return TIER_FEATURES[RENDER_TIERS.ESSENTIAL];
    return effectiveTier.features;
  }, [effectiveTier]);

  // Check if Nebula view is available (device capable + user selected)
  const isNebulaAvailable = useMemo(() => {
    if (!deviceTier) return false;
    return deviceTier.capabilities?.webgl ?? false;
  }, [deviceTier]);

  // Check if current view is Nebula
  const isNebulaActive = userViewTier === 'nebula' && webglEnabled;

  // Force refresh device tier
  const refreshTier = useCallback(async () => {
    setIsLoading(true);
    const result = await detectDeviceTierWithBattery();
    setDeviceTier(result);
    setBatterySaverActive(result.batterySaverActive || false);
    setIsLoading(false);
  }, []);

  return {
    // Loading state
    isLoading,
    
    // Device info
    deviceTier: deviceTier?.tier || RENDER_TIERS.ESSENTIAL,
    deviceCapabilities: deviceTier?.capabilities || {},
    deviceReason: deviceTier?.reason || 'Loading...',
    
    // Effective tier (considering user preference)
    effectiveTier: effectiveTier?.tier || RENDER_TIERS.ESSENTIAL,
    effectiveReason: effectiveTier?.reason || 'Loading...',
    isUserOverride: effectiveTier?.isUserOverride || false,
    
    // Feature flags
    features,
    
    // WebGL state
    webglEnabled,
    isNebulaAvailable,
    isNebulaActive,
    
    // Battery
    batterySaverActive,
    
    // Actions
    refreshTier,
    
    // Constants for external use
    RENDER_TIERS,
  };
}

/**
 * usePerformanceMonitor — Hook for tracking render performance
 */
export function usePerformanceMonitor(enabled = true) {
  const [fps, setFps] = useState(0);
  const [isPerformanceGood, setIsPerformanceGood] = useState(true);
  const [monitor] = useState(() => new PerformanceMonitor());

  useEffect(() => {
    if (!enabled) return;

    let animationId;
    const update = () => {
      monitor.tick();
      setFps(monitor.getAverageFPS());
      setIsPerformanceGood(monitor.isPerformanceGood(24)); // Target 24 FPS minimum
      animationId = requestAnimationFrame(update);
    };
    
    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [enabled, monitor]);

  return { fps, isPerformanceGood };
}

/**
 * useAdaptiveQuality — Auto-downgrade quality if performance drops
 */
export function useAdaptiveQuality(initialQuality = 'high') {
  const [quality, setQuality] = useState(initialQuality);
  const { fps, isPerformanceGood } = usePerformanceMonitor(true);
  const [downgradeCount, setDowngradeCount] = useState(0);

  useEffect(() => {
    // If performance is bad for 3 seconds, downgrade
    if (!isPerformanceGood && downgradeCount < 3) {
      const timeout = setTimeout(() => {
        setQuality(prev => {
          if (prev === 'high') return 'medium';
          if (prev === 'medium') return 'low';
          return prev;
        });
        setDowngradeCount(c => c + 1);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isPerformanceGood, downgradeCount]);

  const resetQuality = useCallback(() => {
    setQuality(initialQuality);
    setDowngradeCount(0);
  }, [initialQuality]);

  return { quality, fps, isPerformanceGood, resetQuality };
}

export default useRenderTier;
