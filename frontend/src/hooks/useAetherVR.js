/**
 * AETHER VR LAUNCHER HOOK
 * ========================
 * 
 * Handles VR sanctuary access based on karma and Global Grace.
 * 
 * Flow:
 * 1. Check user karma against grace-lowered threshold
 * 2. Validate rainbow key
 * 3. Trigger white light bloom effect
 * 4. Launch VR experience
 */

import { useState, useCallback, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Hook for VR sanctuary launching with karma/grace checks
 */
export const useAetherVR = (userId) => {
  const [globalGrace, setGlobalGrace] = useState(1.0);
  const [effectiveThreshold, setEffectiveThreshold] = useState(5000);
  const [canAccessVR, setCanAccessVR] = useState(false);
  const [rainbowKey, setRainbowKey] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch global grace on mount
  useEffect(() => {
    fetchGlobalGrace();
  }, []);

  // Check VR access when userId changes
  useEffect(() => {
    if (userId) {
      checkVRAccess();
    }
  }, [userId]);

  const fetchGlobalGrace = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/aether/grace`);
      const data = await res.json();
      setGlobalGrace(data.global_grace);
      setEffectiveThreshold(data.effective_vr_threshold);
    } catch (err) {
      console.error('[AetherVR] Failed to fetch grace:', err);
    }
  }, []);

  const checkVRAccess = useCallback(async () => {
    if (!userId) return;
    
    try {
      const res = await fetch(`${API_URL}/api/aether/vr-access/${userId}`);
      const data = await res.json();
      
      setCanAccessVR(data.can_access);
      setRainbowKey(data.rainbow_key);
      setGlobalGrace(data.global_grace);
      setEffectiveThreshold(data.effective_threshold);
      
      return data;
    } catch (err) {
      console.error('[AetherVR] Failed to check access:', err);
      setError(err.message);
      return null;
    }
  }, [userId]);

  const mintRainbowKey = useCallback(async (karma = 0) => {
    try {
      const res = await fetch(`${API_URL}/api/aether/mint-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, karma }),
      });
      const data = await res.json();
      setRainbowKey(data.rainbow_key);
      return data.rainbow_key;
    } catch (err) {
      console.error('[AetherVR] Failed to mint key:', err);
      return null;
    }
  }, [userId]);

  /**
   * Launch the VR Sanctuary
   * 
   * Requirements:
   * - karma >= effective_threshold
   * - valid rainbow key
   */
  const launchSanctuaryVR = useCallback(async (userKarma, targetMode = 'celestial-dome') => {
    setError(null);
    
    // Check threshold (lowered by Community Perpetual Fund)
    const vrThreshold = effectiveThreshold;
    
    if (userKarma < vrThreshold) {
      setError(`Resonance not yet solidified. Need ${(vrThreshold - userKarma).toFixed(0)} more karma.`);
      return { success: false, error: 'Insufficient karma' };
    }
    
    // Validate rainbow key
    if (!rainbowKey || !rainbowKey.startsWith('RAINBOW')) {
      setError('Invalid sovereign key. Mint a new one.');
      return { success: false, error: 'Invalid key' };
    }
    
    console.log('✨ KEY ACCEPTED: Solidifying the Tesseract...');
    setIsLaunching(true);
    
    // Trigger the White Light bloom effect
    document.body.classList.add('vr-bloom-effect');
    
    // Dispatch launch event for other components
    window.dispatchEvent(new CustomEvent('vr-launch', {
      detail: { mode: targetMode, karma: userKarma, key: rainbowKey }
    }));
    
    // Transition delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLaunching(false);
        document.body.classList.remove('vr-bloom-effect');
        
        // Navigate to VR experience
        window.location.href = `/vr/${targetMode}`;
        
        resolve({ success: true, mode: targetMode });
      }, 1500);
    });
  }, [effectiveThreshold, rainbowKey]);

  return {
    // State
    globalGrace,
    effectiveThreshold,
    canAccessVR,
    rainbowKey,
    isLaunching,
    error,
    
    // Actions
    fetchGlobalGrace,
    checkVRAccess,
    mintRainbowKey,
    launchSanctuaryVR,
  };
};

/**
 * Hook for Global Grace tracking
 */
export const useGlobalGrace = () => {
  const [grace, setGrace] = useState(1.0);
  const [totalPool, setTotalPool] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/aether/status`);
      const data = await res.json();
      setGrace(data.global_grace_multiplier);
      setTotalPool(data.total_recycled_resonance);
      setTotalDonors(data.total_donors);
      return data;
    } catch (err) {
      console.error('[GlobalGrace] Fetch error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const makeDonation = useCallback(async (donorId, amountUsd, message = '') => {
    try {
      const res = await fetch(`${API_URL}/api/aether/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          amount_usd: amountUsd,
          message,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setGrace(data.new_grace);
        setTotalPool(data.total_pool);
      }
      
      return data;
    } catch (err) {
      console.error('[GlobalGrace] Donation error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    grace,
    totalPool,
    totalDonors,
    effectiveThreshold: 5000 / grace,
    thresholdReduction: (1 - (1 / grace)) * 100,
    fetchStatus,
    makeDonation,
  };
};

export default useAetherVR;
