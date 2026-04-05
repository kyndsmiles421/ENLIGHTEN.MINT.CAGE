import React, { createContext, useReducer, useContext, useCallback, useMemo } from 'react';

/**
 * EnlightenmentContext.js — The Sovereign State Machine
 * 
 * ARCHITECTURE:
 * - useReducer prevents infinite loops (discrete actions only)
 * - SHA-256 Witness Deed generation for karma tracking
 * - Stripe tier integration (SEEKER → ARCHITECT → SOVEREIGN → ORACLE)
 * - Memoized context value for stable references
 * 
 * Usage:
 *   const { state, extract, seal, pay, toggleMeditation, reset } = useSanctuary();
 */

const API = process.env.REACT_APP_BACKEND_URL;

const EnlightenmentContext = createContext(null);

// 1. THE REDUCER: Prevents the Infinite Loop by managing discrete actions
const initialState = {
  nodules: 0,
  resonance: false,
  tier: 'SEEKER', // Default Tier: SEEKER → ARCHITECT → SOVEREIGN → ORACLE
  karmaHash: null,
  karmaBalance: 0,
  isMeditationActive: false,
  sessionStartTime: null,
  deedsSealed: 0,
};

function cafeReducer(state, action) {
  switch (action.type) {
    case 'EXTRACT_NODULE':
      const nextCount = Math.min(state.nodules + 1, 15);
      return { 
        ...state, 
        nodules: nextCount, 
        resonance: nextCount === 15 
      };
    
    case 'SEAL_DEED':
      return { 
        ...state, 
        karmaHash: action.payload,
        deedsSealed: state.deedsSealed + 1,
        karmaBalance: state.karmaBalance + (action.karmaValue || 100)
      };
    
    case 'SET_MEDITATION':
      return { 
        ...state, 
        isMeditationActive: action.payload,
        sessionStartTime: action.payload ? Date.now() : null
      };
    
    case 'UPDATE_TIER':
      return { ...state, tier: action.payload };
    
    case 'SYNC_KARMA':
      return { ...state, karmaBalance: action.payload };
    
    case 'RESET':
      return { ...initialState, tier: state.tier, karmaBalance: state.karmaBalance };
    
    case 'FULL_RESET':
      return initialState;
    
    default:
      return state;
  }
}

export const EnlightenmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cafeReducer, initialState);

  // 2. THE WITNESS: Generating the Crystalline Karma Hash
  const generateWitnessDeed = useCallback(async (deedType = 'MINT-01', description = 'Restoration Commemorative Seed') => {
    const timestamp = Date.now();
    const rawData = `SOVEREIGN_WITNESS_${timestamp}_${state.nodules}_${deedType}`;
    
    // Encrypting the skeleton into the White Light Hash (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Persist to backend
    try {
      const token = localStorage.getItem('zen_token');
      if (token) {
        await fetch(`${API}/api/sanctuary/deed-simple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            deed_type: deedType,
            description,
            karma_value: 100,
            witness_hash: hashHex
          })
        });
      }
    } catch (e) {
      console.warn('[Witness] Backend sync failed:', e);
    }
    
    dispatch({ type: 'SEAL_DEED', payload: hashHex, karmaValue: 100 });
    return hashHex;
  }, [state.nodules]);

  // 3. THE ECONOMY: Stripe Four-Tiered Integration
  const initiateAetherFlow = useCallback(async (tier) => {
    try {
      const token = localStorage.getItem('zen_token');
      
      // Use backend checkout session creation
      const res = await fetch(`${API}/api/subscriptions/checkout-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tier,
          success_url: `${window.location.origin}/void?witnessed=true&tier=${tier}`,
          cancel_url: window.location.href
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      } else {
        // Fallback to membership page
        window.location.href = '/membership';
      }
    } catch (e) {
      console.error('[Aether] Stripe checkout failed:', e);
      window.location.href = '/membership';
    }
  }, []);

  // 4. KARMA SYNC: Fetch from backend
  const syncKarma = useCallback(async () => {
    try {
      const token = localStorage.getItem('zen_token');
      if (!token) return;
      
      const res = await fetch(`${API}/api/sanctuary/karma`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SYNC_KARMA', payload: data.karma || 0 });
      }
    } catch (e) {
      console.warn('[Karma] Sync failed:', e);
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    state,
    nodules: state.nodules,
    resonance: state.resonance,
    tier: state.tier,
    karmaHash: state.karmaHash,
    karmaBalance: state.karmaBalance,
    isMeditationActive: state.isMeditationActive,
    deedsSealed: state.deedsSealed,
    
    // Actions
    extract: () => dispatch({ type: 'EXTRACT_NODULE' }),
    seal: generateWitnessDeed,
    pay: initiateAetherFlow,
    toggleMeditation: (val) => dispatch({ type: 'SET_MEDITATION', payload: val }),
    updateTier: (tier) => dispatch({ type: 'UPDATE_TIER', payload: tier }),
    syncKarma,
    reset: () => dispatch({ type: 'RESET' }),
    fullReset: () => dispatch({ type: 'FULL_RESET' }),
    
    // Direct dispatch for advanced usage
    dispatch
  }), [state, generateWitnessDeed, initiateAetherFlow, syncKarma]);

  return (
    <EnlightenmentContext.Provider value={value}>
      {children}
    </EnlightenmentContext.Provider>
  );
};

// Hook for consuming the context
export function useSanctuary() {
  const ctx = useContext(EnlightenmentContext);
  if (!ctx) {
    // Return safe defaults if used outside provider
    return {
      state: initialState,
      nodules: 0,
      resonance: false,
      tier: 'SEEKER',
      karmaHash: null,
      karmaBalance: 0,
      isMeditationActive: false,
      deedsSealed: 0,
      extract: () => {},
      seal: async () => null,
      pay: async () => {},
      toggleMeditation: () => {},
      updateTier: () => {},
      syncKarma: async () => {},
      reset: () => {},
      fullReset: () => {},
      dispatch: () => {}
    };
  }
  return ctx;
}

// Tier configuration for UI display
export const ENLIGHTENMENT_TIERS = {
  SEEKER: {
    label: 'Seeker',
    color: '#00FFC2',
    price: 9.99,
    features: ['Basic Oracle Access', 'Daily Briefings', 'Community Forums']
  },
  ARCHITECT: {
    label: 'Architect',
    color: '#A855F7',
    price: 29.99,
    features: ['Full Oracle Suite', 'VR Dome Access', 'Priority AI Guidance', 'Karma Multiplier 2x']
  },
  SOVEREIGN: {
    label: 'Sovereign',
    color: '#FFD700',
    price: 99.99,
    features: ['Unlimited Everything', 'Private Sessions', 'Witness Attestation', 'Karma Multiplier 5x']
  },
  ORACLE: {
    label: 'Oracle',
    color: '#EF4444',
    price: 299.99,
    features: ['Creator Tools', 'Revenue Share', 'Council Seat', 'Karma Multiplier 10x']
  }
};

export default EnlightenmentContext;
