/**
 * ENLIGHTEN.MINT.CAFE - V-FINAL MIXER V27.0
 * MixerV27.js
 * 
 * THE CRYSTAL & PHYSICS INTERFACE
 * A Mathematical Dashboard that connects Trade Tab licenses to physics sliders.
 * 
 * MATH-LOCK LOGIC:
 * - Unlocked: UI glows with Refracted Crystal Rainbow
 * - Locked: Flat "Standard Euclidean" grayscale until license purchased
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSovereignLedger } from '../hooks/useSovereignLedger';
import { useCrystalPhysics } from '../hooks/useCrystalPhysics';
import { useAuth } from '../context/AuthContext';

// PHI constant for calculations
const PHI = 1.618033988749895;

// 🛡️ OBSIDIAN SHIELD: Master Authority Configuration
const SOVEREIGN_CONFIG = {
  master_email: 'SOVEREIGN_MASTER',
  master_print: '708B8ED1E974D85585BBBD8E06E0291E',
  resonance_hz: 432,
  lox_temp: -183,
};

const MixerV27 = ({ userId = 'default_user', onClose }) => {
  // 🛡️ OBSIDIAN SHIELD: Get user auth for Master Authority check
  const { user } = useAuth();
  const isMasterAuthority = user?.email === SOVEREIGN_CONFIG.master_email;
  
  // Sovereign Ledger state
  const {
    equity,
    gems,
    licenses,
    volunteerDiscount,
    purchaseLicense,
    hasLicense,
    getPrice,
    marketPrices,
  } = useSovereignLedger(userId);

  // Crystal Physics state
  const {
    coreState,
    aesthetic,
    magneticFlux,
    cavitationRisk,
    rotationSpeed,
    primaryColor,
    secondaryColor,
    stabilityCoefficient,
    activeMineral,
    activeMath,
    ownedMinerals,
    ownedMath,
    minerals,
    mathRefractions,
    injectPressure,
    setRotation,
    equipMineral,
    activateMath,
  } = useCrystalPhysics(userId);

  // Local slider states
  const [pressureValue, setPressureValue] = useState(50);
  const [rpmValue, setRpmValue] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [notification, setNotification] = useState(null);

  // 🔊 432Hz Haptic Resonance Trigger (Master Authority only)
  useEffect(() => {
    if (isMasterAuthority && window.navigator?.vibrate) {
      // 432Hz Phonic Key - Triple pulse pattern
      window.navigator.vibrate([432, 100, 432]);
      console.log('🔊 432Hz Phonic Key Engaged. Master Authority Verified.');
    }
  }, [isMasterAuthority]);

  // License checks
  const hasInfinityMath = hasLicense('INFINITY_EDGE');
  const hasPrismaticDispersion = hasLicense('PRISMATIC_DISPERSION');
  const hasL2Fractal = hasLicense('L2_FRACTAL_RECURSION');
  const hasPhiBloom = hasLicense('PHI_SPIRAL_BLOOM');
  const hasObsidianVoid = hasLicense('OBSIDIAN_VOID_RENDER');

  // Determine crystal theme based on licenses
  const getCrystalTheme = () => {
    if (hasObsidianVoid) return 'OMEGA_OBSIDIAN_VOID';
    if (hasL2Fractal || hasPhiBloom) return 'LEGENDARY_L2_FRACTAL';
    if (hasInfinityMath || hasPrismaticDispersion) return 'PREMIUM_INFINITY_EDGE';
    return 'STANDARD_QUARTZ';
  };

  const crystalTheme = getCrystalTheme();

  // Handle pressure slider change
  const handlePressureChange = useCallback(async (value) => {
    setPressureValue(value);
    
    // Only allow advanced pressure if licensed
    if (value > 80 && !hasInfinityMath) {
      setNotification({
        type: 'locked',
        message: 'Advanced Pressure Control requires INFINITY_EDGE license',
      });
      return;
    }
    
    await injectPressure(value);
  }, [hasInfinityMath, injectPressure]);

  // Handle RPM slider change
  const handleRpmChange = useCallback(async (value) => {
    setRpmValue(value);
    
    // High RPM requires L2 Fractal license
    if (value > 25000 && !hasL2Fractal) {
      setNotification({
        type: 'locked',
        message: 'High-speed Centrifuge requires L2_FRACTAL_RECURSION license',
      });
      return;
    }
    
    await setRotation(value);
  }, [hasL2Fractal, setRotation]);

  // Handle license purchase
  const handlePurchase = useCallback(async (artifactId) => {
    setPurchasing(true);
    const result = await purchaseLicense(artifactId);
    setPurchasing(false);
    
    if (result.success) {
      setNotification({
        type: 'success',
        message: `${artifactId} licensed! L² Fractal Engine script injected.`,
      });
    } else {
      setNotification({
        type: 'error',
        message: result.error?.message || 'Purchase failed',
      });
    }
  }, [purchaseLicense]);

  // Clear notification after delay
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Dynamic styles based on license status
  const containerStyle = {
    background: hasObsidianVoid 
      ? 'linear-gradient(135deg, #000000 0%, #0a0a0f 100%)'
      : hasL2Fractal
        ? 'linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 100%)'
        : 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    filter: hasInfinityMath ? 'none' : 'grayscale(30%)',
    borderColor: primaryColor,
  };

  const glowStyle = hasInfinityMath ? {
    boxShadow: `0 0 30px ${primaryColor}40, inset 0 0 20px ${secondaryColor}20`,
  } : {};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      data-testid="mixer-v27-overlay"
    >
      <div 
        className="relative w-full max-w-4xl mx-4 rounded-2xl border-2 overflow-hidden"
        style={{ ...containerStyle, ...glowStyle }}
        data-testid="mixer-v27-container"
      >
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wider">
                MIXER V27.0 — SENTINEL CORE
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Mathematical Dashboard • Theme: {crystalTheme}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-mono" style={{ color: primaryColor }}>
                Aether Fund: ${equity.toFixed(2)}
              </p>
              <p className="text-sm text-white/60">
                {gems} Gems • {licenses.length} Licenses
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition-colors"
              data-testid="mixer-close-btn"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Notification */}
        {notification && (
          <div 
            className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
              notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
              notification.type === 'locked' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Physics Controls */}
          <div className="space-y-6">
            
            {/* Core Status */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white/80 mb-3">
                IPC CORE STATUS
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-white/50">STATE</p>
                  <p className="text-lg font-mono" style={{ color: primaryColor }}>
                    {coreState}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">AESTHETIC</p>
                  <p className="text-sm text-white/80">{aesthetic}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">MAGNETIC FLUX</p>
                  <p className="text-lg font-mono text-blue-400">
                    {magneticFlux.toFixed(4)} T
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">STABILITY</p>
                  <p className="text-lg font-mono text-green-400">
                    {(stabilityCoefficient * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {/* Live Color Preview */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full animate-pulse"
                  style={{ 
                    background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor})`,
                    boxShadow: `0 0 20px ${primaryColor}60`
                  }}
                />
                <div className="text-xs text-white/60">
                  <p>Primary: {primaryColor}</p>
                  <p>Secondary: {secondaryColor}</p>
                </div>
              </div>
            </div>

            {/* Inverse Pressure Slider */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-white/80">
                  INVERSE PRESSURE INJECTION (φ/π)
                </label>
                {!hasInfinityMath && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                    MATH-LOCKED
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={pressureValue}
                  onChange={(e) => handlePressureChange(parseFloat(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: hasInfinityMath
                      ? `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                      : 'linear-gradient(to right, #333, #555)',
                  }}
                  data-testid="pressure-slider"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>0 PSI</span>
                  <span className="font-mono text-white">{pressureValue.toFixed(1)} PSI</span>
                  <span>φ×100 PSI</span>
                </div>
              </div>
              
              {!hasInfinityMath && (
                <button
                  onClick={() => handlePurchase('INFINITY_EDGE')}
                  disabled={purchasing}
                  className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                  data-testid="unlock-infinity-btn"
                >
                  {purchasing ? 'Processing...' : `Unlock Infinity Edge Math (${getPrice('INFINITY_EDGE')?.total_gems || 80.9} gems)`}
                </button>
              )}
            </div>

            {/* Centrifuge RPM Slider */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-white/80">
                  CENTRIFUGE ROTATION (RPM)
                </label>
                {!hasL2Fractal && rpmValue > 20000 && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                    HIGH-SPEED LOCKED
                  </span>
                )}
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="100"
                value={rpmValue}
                onChange={(e) => handleRpmChange(parseFloat(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: hasL2Fractal
                    ? `linear-gradient(to right, #22C55E, #3B82F6, #8B5CF6)`
                    : 'linear-gradient(to right, #333, #555)',
                }}
                data-testid="rpm-slider"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>0</span>
                <span className="font-mono text-white">{rpmValue.toLocaleString()} RPM</span>
                <span>50,000</span>
              </div>
              
              {/* Cavitation Risk Indicator */}
              {cavitationRisk > 0 && (
                <div className="mt-2 p-2 rounded bg-red-500/20 text-red-400 text-xs">
                  ⚠️ Cavitation Risk: {(cavitationRisk * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: License Management */}
          <div className="space-y-6">
            
            {/* Active Configuration */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white/80 mb-3">
                ACTIVE CONFIGURATION
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-white/60">Mineral:</span>
                  <span className="font-mono text-white">{activeMineral}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-white/60">Math Layer:</span>
                  <span className="font-mono" style={{ color: activeMath ? primaryColor : '#666' }}>
                    {activeMath || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Math Refraction Licenses */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white/80 mb-3">
                L² FRACTAL ENGINE LICENSES
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mathRefractions.map((math) => {
                  const owned = ownedMath.includes(math.id);
                  const active = activeMath === math.id;
                  const price = getPrice(math.id);
                  
                  return (
                    <div 
                      key={math.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        active ? 'border-purple-500 bg-purple-500/10' :
                        owned ? 'border-green-500/30 bg-green-500/5' :
                        'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{math.name}</p>
                          <p className="text-xs text-white/50">
                            {math.formula} • {math.tier}
                          </p>
                        </div>
                        {owned ? (
                          <button
                            onClick={() => activateMath(active ? null : math.id)}
                            className={`px-3 py-1 rounded text-xs ${
                              active 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                          >
                            {active ? 'ACTIVE' : 'ACTIVATE'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(math.id)}
                            disabled={purchasing}
                            className="px-3 py-1 rounded text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50"
                          >
                            {price?.total_gems || '?'} gems
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volunteer Discount */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white/80 mb-2">
                VOLUNTEER DISCOUNT
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Current Rate:</span>
                <span className="text-2xl font-mono text-green-400">
                  {volunteerDiscount}%
                </span>
              </div>
              <p className="text-xs text-white/40 mt-2">
                Log volunteer hours to earn up to 25% off all licenses
              </p>
            </div>
          </div>
        </div>

        {/* 🛡️ SUB-ZERO FOOTER: OBSIDIAN SHIELD */}
        <footer 
          className="p-4 border-t border-white/10"
          style={{ 
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,20,0.8) 100%)',
          }}
          data-testid="sub-zero-footer"
        >
          {/* Main Footer Text */}
          <p className="text-xs text-white/40 text-center mb-3">
            V-FINAL ETERNAL SENTINEL • Proof of Math Economy • φ = {PHI.toFixed(6)}
          </p>
          
          {/* 🛡️ OBSIDIAN SHIELD: Conditional Master Print Display */}
          <div className="mt-2 pt-3 border-t border-white/5">
            {isMasterAuthority ? (
              /* 💉 MASTER VIEW: Blood-Red Master Print (kyndsmiles@gmail.com only) */
              <div 
                className="text-center"
                data-testid="obsidian-shield-master"
              >
                <p 
                  className="text-[9px] uppercase tracking-[0.3em] mb-1"
                  style={{ color: 'rgba(139, 0, 0, 0.6)' }}
                >
                  MASTER PRINT ID
                </p>
                <p 
                  className="font-mono text-xs tracking-wider"
                  style={{ 
                    color: '#8B0000',
                    textShadow: '0 0 10px rgba(255, 0, 0, 0.4), 0 0 20px rgba(139, 0, 0, 0.2)',
                    fontWeight: 'bold',
                  }}
                >
                  {SOVEREIGN_CONFIG.master_print}
                </p>
                <p 
                  className="text-[8px] mt-1 uppercase tracking-widest"
                  style={{ color: 'rgba(255, 255, 255, 0.3)' }}
                >
                  [AUTHORITY_MODE_ACTIVE] • LOx: {SOVEREIGN_CONFIG.lox_temp}°C
                </p>
              </div>
            ) : (
              /* 💎 PUBLIC VIEW: Prismatic Sovereign Seal (everyone else) */
              <div 
                className="text-center"
                data-testid="obsidian-shield-public"
              >
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,242,254,0.1), rgba(79,172,254,0.1))',
                    border: '1px solid rgba(79,172,254,0.2)',
                  }}
                >
                  <span 
                    className="text-xs font-medium tracking-wider"
                    style={{
                      background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 50%, #a78bfa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    🛡️ VERIFIED_SOVEREIGN_LEDGER_ACTIVE
                  </span>
                  <span 
                    className="text-[9px] text-white/30"
                  >
                    [72° REFRACTION]
                  </span>
                </div>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MixerV27;
