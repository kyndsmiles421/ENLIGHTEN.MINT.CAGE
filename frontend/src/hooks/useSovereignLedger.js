/**
 * ENLIGHTEN.MINT.CAFE - V-FINAL SOVEREIGN LEDGER API HOOK
 * useSovereignLedger.js
 * 
 * React hook for interacting with the Cosmic Ledger and Math Licensing Engine.
 * Provides real-time license checking for Math-Lock gated UI features.
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Custom hook for Sovereign Ledger interactions
 * @param {string} userId - User identifier
 */
export const useSovereignLedger = (userId = 'default_user') => {
  const [ledgerState, setLedgerState] = useState({
    equity: 0,
    gems: 0,
    dust: 0,
    totalPurchasingPower: 0,
    licenses: [],
    volunteerCredits: 0,
    volunteerDiscount: 0,
    tier: 0,
    loading: true,
    error: null,
  });

  const [marketPrices, setMarketPrices] = useState({});

  // Fetch ledger status
  const fetchLedgerStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sovereign-ledger/status?user_id=${userId}`);
      const data = await response.json();
      
      setLedgerState(prev => ({
        ...prev,
        equity: data.balances?.equity || 0,
        gems: data.balances?.gems || 0,
        dust: data.balances?.dust || 0,
        totalPurchasingPower: data.balances?.total_purchasing_power || 0,
        licenses: data.vault?.unlocked_assets || [],
        volunteerCredits: data.volunteer?.credits || 0,
        volunteerDiscount: parseFloat(data.volunteer?.discount_rate || '0'),
        tier: data.tier || 0,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('LEDGER_HOOK: Failed to fetch status', error);
      setLedgerState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [userId]);

  // Fetch market prices
  const fetchMarketPrices = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sovereign-ledger/market`);
      const data = await response.json();
      setMarketPrices(data.prices || {});
    } catch (error) {
      console.error('LEDGER_HOOK: Failed to fetch market', error);
    }
  }, []);

  // Purchase a math refraction license
  const purchaseLicense = useCallback(async (artifactId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/sovereign-ledger/license?user_id=${userId}&math_artifact_id=${artifactId}`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        // Refresh ledger state
        await fetchLedgerStatus();
        return { success: true, data };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('LEDGER_HOOK: Purchase failed', error);
      return { success: false, error: error.message };
    }
  }, [userId, fetchLedgerStatus]);

  // Log volunteer hours
  const logVolunteerHours = useCallback(async (hours, activity = 'learning') => {
    try {
      const response = await fetch(
        `${API_BASE}/api/sovereign-ledger/volunteer?user_id=${userId}&hours=${hours}&activity=${activity}`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        await fetchLedgerStatus();
        return { success: true, data };
      }
      return { success: false, error: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [userId, fetchLedgerStatus]);

  // Check if user has a specific license
  const hasLicense = useCallback((licenseId) => {
    return ledgerState.licenses.includes(licenseId.toUpperCase());
  }, [ledgerState.licenses]);

  // Get price for an artifact
  const getPrice = useCallback((artifactId) => {
    return marketPrices[artifactId.toUpperCase()] || null;
  }, [marketPrices]);

  // Initial fetch
  useEffect(() => {
    fetchLedgerStatus();
    fetchMarketPrices();
  }, [fetchLedgerStatus, fetchMarketPrices]);

  return {
    // State
    equity: ledgerState.equity,
    gems: ledgerState.gems,
    dust: ledgerState.dust,
    totalPurchasingPower: ledgerState.totalPurchasingPower,
    licenses: ledgerState.licenses,
    volunteerCredits: ledgerState.volunteerCredits,
    volunteerDiscount: ledgerState.volunteerDiscount,
    tier: ledgerState.tier,
    loading: ledgerState.loading,
    error: ledgerState.error,
    marketPrices,
    
    // Actions
    purchaseLicense,
    logVolunteerHours,
    refresh: fetchLedgerStatus,
    
    // Helpers
    hasLicense,
    getPrice,
  };
};

export default useSovereignLedger;
