/**
 * renderDelegate.js — Device Capability Detection & Tier Classification
 * 
 * The Gatekeeper for Enlightenment Cafe visual experiences.
 * Ensures the app never crashes on low-end devices while providing
 * premium experiences on capable hardware.
 * 
 * Tiers:
 * - ESSENTIAL: SVG/Canvas only, no WebGL (older devices, battery saver)
 * - STANDARD: Basic WebGL, simple shaders, reduced particle count
 * - PREMIUM: Full WebGL2, volumetric fog, complex shaders, high particle count
 * 
 * CRITICAL: User choice always overrides device capability.
 * If user selects "Parchment" view, WebGL context should be fully unmounted.
 */

// ─── Tier Definitions ───
export const RENDER_TIERS = {
  ESSENTIAL: 'essential',
  STANDARD: 'standard',
  PREMIUM: 'premium',
};

// ─── Capability Thresholds ───
const THRESHOLDS = {
  // Minimum for STANDARD tier
  STANDARD: {
    minCores: 2,
    minPixelRatio: 1,
    requiresWebGL: true,
    requiresWebGL2: false,
  },
  // Minimum for PREMIUM tier
  PREMIUM: {
    minCores: 4,
    minPixelRatio: 1.5,
    requiresWebGL: true,
    requiresWebGL2: true,
    minVRAMEstimate: 512, // MB (estimated)
  },
};

// ─── Feature Flags by Tier ───
export const TIER_FEATURES = {
  [RENDER_TIERS.ESSENTIAL]: {
    webgl: false,
    particles: false,
    volumetricFog: false,
    complexShaders: false,
    postProcessing: false,
    shadowMaps: false,
    maxParticles: 0,
    maxLights: 0,
    textureQuality: 'low',
    geometryDetail: 'minimal',
    animationFPS: 30,
  },
  [RENDER_TIERS.STANDARD]: {
    webgl: true,
    particles: true,
    volumetricFog: false,
    complexShaders: false,
    postProcessing: false,
    shadowMaps: false,
    maxParticles: 100,
    maxLights: 2,
    textureQuality: 'medium',
    geometryDetail: 'low',
    animationFPS: 30,
  },
  [RENDER_TIERS.PREMIUM]: {
    webgl: true,
    particles: true,
    volumetricFog: true,
    complexShaders: true,
    postProcessing: true,
    shadowMaps: true,
    maxParticles: 500,
    maxLights: 4,
    textureQuality: 'high',
    geometryDetail: 'high',
    animationFPS: 60,
  },
};

/**
 * Check if WebGL is supported
 */
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * Check if WebGL2 is supported
 */
function checkWebGL2Support() {
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    return !!gl2;
  } catch (e) {
    return false;
  }
}

/**
 * Get WebGL renderer info (GPU name)
 */
function getGPUInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return { vendor: 'unknown', renderer: 'unknown' };
    
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    };
  } catch (e) {
    return null;
  }
}

/**
 * Estimate if GPU is integrated or dedicated
 */
function isIntegratedGPU(gpuInfo) {
  if (!gpuInfo) return true; // Assume integrated if can't detect
  
  const renderer = (gpuInfo.renderer || '').toLowerCase();
  
  // Known integrated GPU patterns
  const integratedPatterns = [
    'intel', 'hd graphics', 'uhd graphics', 'iris',
    'adreno', 'mali', 'powervr', 'tegra',
    'apple gpu', 'apple m1', 'apple m2', 'apple m3',
  ];
  
  // Known dedicated GPU patterns
  const dedicatedPatterns = [
    'nvidia', 'geforce', 'rtx', 'gtx', 'quadro',
    'radeon', 'rx ', 'vega', 'firepro',
  ];
  
  for (const pattern of dedicatedPatterns) {
    if (renderer.includes(pattern)) return false;
  }
  
  for (const pattern of integratedPatterns) {
    if (renderer.includes(pattern)) return true;
  }
  
  return true; // Default to integrated (safer)
}

/**
 * Estimate available VRAM (very rough)
 */
function estimateVRAM(gpuInfo) {
  if (!gpuInfo) return 256;
  
  const renderer = (gpuInfo.renderer || '').toLowerCase();
  
  // High-end dedicated GPUs
  if (renderer.includes('rtx') || renderer.includes('rx 6') || renderer.includes('rx 7')) {
    return 8192;
  }
  
  // Mid-range dedicated GPUs
  if (renderer.includes('gtx') || renderer.includes('radeon')) {
    return 4096;
  }
  
  // Apple Silicon
  if (renderer.includes('apple')) {
    return 4096; // Unified memory, but well optimized
  }
  
  // Integrated GPUs
  if (renderer.includes('intel') || renderer.includes('hd graphics')) {
    return 512;
  }
  
  // Mobile GPUs
  if (renderer.includes('adreno') || renderer.includes('mali')) {
    return 256;
  }
  
  return 512; // Default
}

/**
 * Check if device is mobile
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is in battery saver mode (if available)
 */
async function checkBatterySaver() {
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      // Consider battery saver if below 20% and not charging
      return battery.level < 0.2 && !battery.charging;
    }
  } catch (e) {}
  return false;
}

/**
 * Get the number of logical CPU cores
 */
function getCPUCores() {
  return navigator.hardwareConcurrency || 2;
}

/**
 * Get device pixel ratio
 */
function getPixelRatio() {
  return window.devicePixelRatio || 1;
}

/**
 * Check if device prefers reduced motion
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check available memory (if supported)
 */
function getDeviceMemory() {
  return navigator.deviceMemory || 4; // Default to 4GB if not available
}

/**
 * Main function: Detect device tier
 */
export function detectDeviceTier() {
  const capabilities = {
    webgl: checkWebGLSupport(),
    webgl2: checkWebGL2Support(),
    gpuInfo: getGPUInfo(),
    cores: getCPUCores(),
    pixelRatio: getPixelRatio(),
    memory: getDeviceMemory(),
    isMobile: isMobileDevice(),
    prefersReducedMotion: prefersReducedMotion(),
  };
  
  capabilities.isIntegratedGPU = isIntegratedGPU(capabilities.gpuInfo);
  capabilities.estimatedVRAM = estimateVRAM(capabilities.gpuInfo);
  
  // Determine tier
  let tier = RENDER_TIERS.ESSENTIAL;
  let reason = 'Default fallback';
  
  // Check for PREMIUM tier
  if (
    capabilities.webgl2 &&
    capabilities.cores >= THRESHOLDS.PREMIUM.minCores &&
    capabilities.pixelRatio >= THRESHOLDS.PREMIUM.minPixelRatio &&
    capabilities.estimatedVRAM >= THRESHOLDS.PREMIUM.minVRAMEstimate &&
    !capabilities.prefersReducedMotion &&
    capabilities.memory >= 4
  ) {
    tier = RENDER_TIERS.PREMIUM;
    reason = 'High-capability device detected';
  }
  // Check for STANDARD tier
  else if (
    capabilities.webgl &&
    capabilities.cores >= THRESHOLDS.STANDARD.minCores &&
    !capabilities.prefersReducedMotion
  ) {
    tier = RENDER_TIERS.STANDARD;
    reason = 'Standard-capability device detected';
  }
  // ESSENTIAL tier (fallback)
  else {
    tier = RENDER_TIERS.ESSENTIAL;
    reason = capabilities.prefersReducedMotion 
      ? 'Reduced motion preference detected'
      : !capabilities.webgl 
        ? 'WebGL not supported'
        : 'Low-capability device detected';
  }
  
  // Mobile devices cap at STANDARD unless very high-end
  if (capabilities.isMobile && tier === RENDER_TIERS.PREMIUM) {
    // Only keep PREMIUM for high-end mobile (8+ cores, high memory)
    if (capabilities.cores < 8 || capabilities.memory < 6) {
      tier = RENDER_TIERS.STANDARD;
      reason = 'Mobile device capped at STANDARD tier';
    }
  }
  
  return {
    tier,
    reason,
    capabilities,
    features: TIER_FEATURES[tier],
    timestamp: Date.now(),
  };
}

/**
 * Check battery status and potentially downgrade tier
 */
export async function detectDeviceTierWithBattery() {
  const result = detectDeviceTier();
  
  const isBatterySaver = await checkBatterySaver();
  if (isBatterySaver && result.tier !== RENDER_TIERS.ESSENTIAL) {
    return {
      ...result,
      tier: RENDER_TIERS.ESSENTIAL,
      reason: 'Battery saver mode active',
      features: TIER_FEATURES[RENDER_TIERS.ESSENTIAL],
      batterySaverActive: true,
    };
  }
  
  return { ...result, batterySaverActive: false };
}

/**
 * Get effective tier considering user preference
 * USER CHOICE ALWAYS OVERRIDES DEVICE CAPABILITY
 */
export function getEffectiveTier(userPreference, deviceTier) {
  // If user explicitly chooses Parchment (essential), respect that
  if (userPreference === 'parchment') {
    return {
      tier: RENDER_TIERS.ESSENTIAL,
      reason: 'User selected Parchment view',
      isUserOverride: true,
      features: TIER_FEATURES[RENDER_TIERS.ESSENTIAL],
    };
  }
  
  // If user explicitly chooses Nebula, use device tier but cap if needed
  if (userPreference === 'nebula') {
    return {
      tier: deviceTier.tier,
      reason: `User selected Nebula view (device: ${deviceTier.tier})`,
      isUserOverride: false,
      features: TIER_FEATURES[deviceTier.tier],
      deviceCapabilities: deviceTier.capabilities,
    };
  }
  
  // Auto mode: use device tier
  return {
    tier: deviceTier.tier,
    reason: 'Auto-detected based on device',
    isUserOverride: false,
    features: TIER_FEATURES[deviceTier.tier],
    deviceCapabilities: deviceTier.capabilities,
  };
}

/**
 * Should WebGL be mounted based on current settings?
 */
export function shouldMountWebGL(userViewTier, deviceTier) {
  // User selected Parchment = NO WebGL
  if (userViewTier === 'parchment') {
    return false;
  }
  
  // User selected Nebula = YES WebGL (if device supports it)
  if (userViewTier === 'nebula') {
    return deviceTier.capabilities?.webgl ?? false;
  }
  
  // Auto = depends on device
  return deviceTier.tier !== RENDER_TIERS.ESSENTIAL;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.maxSamples = 60;
    this.lastTime = performance.now();
  }
  
  tick() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    this.frames.push(delta);
    if (this.frames.length > this.maxSamples) {
      this.frames.shift();
    }
  }
  
  getAverageFPS() {
    if (this.frames.length === 0) return 0;
    const avgDelta = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    return Math.round(1000 / avgDelta);
  }
  
  isPerformanceGood(targetFPS = 30) {
    return this.getAverageFPS() >= targetFPS;
  }
}

// Export singleton for easy access
let cachedDeviceTier = null;

export function getDeviceTier(forceRefresh = false) {
  if (!cachedDeviceTier || forceRefresh) {
    cachedDeviceTier = detectDeviceTier();
  }
  return cachedDeviceTier;
}

export default {
  RENDER_TIERS,
  TIER_FEATURES,
  detectDeviceTier,
  detectDeviceTierWithBattery,
  getEffectiveTier,
  shouldMountWebGL,
  getDeviceTier,
  PerformanceMonitor,
};
