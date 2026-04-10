/**
 * ENLIGHTEN.MINT.CAFE - V-FINAL CRYSTAL PHYSICS API HOOK
 * useCrystalPhysics.js
 * 
 * React hook for interacting with the Crystal Marketplace and Sentinel Physics Engine.
 * Provides real-time IPC telemetry and mineral/refraction controls.
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Custom hook for Crystal Physics interactions
 */
export const useCrystalPhysics = (userId = 'default_user') => {
  const [physicsState, setPhysicsState] = useState({
    coreState: 'STANDBY',
    aesthetic: 'RAINBOW_OPAL_VORTEX',
    magneticFlux: 0,
    cavitationRisk: 0,
    rotationSpeed: 0,
    loxTemp: -183,
    primaryColor: '#8B5CF6',
    secondaryColor: '#22C55E',
    stabilityCoefficient: 0,
    loading: true,
  });

  const [minerals, setMinerals] = useState([]);
  const [mathRefractions, setMathRefractions] = useState([]);
  const [userLicenses, setUserLicenses] = useState({
    activeMineral: 'CLEAR_QUARTZ',
    ownedMinerals: [],
    activeMath: null,
    ownedMath: [],
  });

  // Fetch physics status
  const fetchPhysicsStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/crystal/physics/status`);
      const data = await response.json();
      
      const core = data.core || {};
      const telemetry = core.telemetry || {};
      const visuals = core.visual_mapping || {};
      
      setPhysicsState({
        coreState: core.core_state || 'STANDBY',
        aesthetic: core.aesthetic || 'RAINBOW_OPAL_VORTEX',
        magneticFlux: telemetry.magnetic_flux || 0,
        cavitationRisk: telemetry.cavitation_risk || 0,
        rotationSpeed: telemetry.rotation_speed || 0,
        loxTemp: telemetry.lox_temp_celsius || -183,
        primaryColor: visuals.primary_color || '#8B5CF6',
        secondaryColor: visuals.secondary_color || '#22C55E',
        stabilityCoefficient: data.stability?.stability_coefficient || 0,
        loading: false,
      });
    } catch (error) {
      console.error('CRYSTAL_HOOK: Physics fetch failed', error);
    }
  }, []);

  // Fetch mineral catalog
  const fetchMinerals = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/crystal/minerals`);
      const data = await response.json();
      setMinerals(data.minerals || []);
    } catch (error) {
      console.error('CRYSTAL_HOOK: Minerals fetch failed', error);
    }
  }, []);

  // Fetch math refraction catalog
  const fetchMathRefractions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/crystal/math`);
      const data = await response.json();
      setMathRefractions(data.refractions || []);
    } catch (error) {
      console.error('CRYSTAL_HOOK: Math fetch failed', error);
    }
  }, []);

  // Fetch user licenses
  const fetchUserLicenses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/crystal/licenses?user_id=${userId}`);
      const data = await response.json();
      setUserLicenses({
        activeMineral: data.active_mineral || 'CLEAR_QUARTZ',
        ownedMinerals: data.owned_minerals || [],
        activeMath: data.active_math,
        ownedMath: data.owned_math || [],
      });
    } catch (error) {
      console.error('CRYSTAL_HOOK: Licenses fetch failed', error);
    }
  }, [userId]);

  // Inject inverse pressure
  const injectPressure = useCallback(async (systemLoad) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/crystal/physics/inject?system_load=${systemLoad}`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      // Update physics state with new telemetry
      setPhysicsState(prev => ({
        ...prev,
        magneticFlux: data.magnetic_flux_tesla || prev.magneticFlux,
        cavitationRisk: data.cavitation_risk || prev.cavitationRisk,
        coreState: data.status === 'ZERO_POINT_ACHIEVED' ? 'ZERO_POINT' : 'ACTIVE',
      }));
      
      return data;
    } catch (error) {
      console.error('CRYSTAL_HOOK: Pressure injection failed', error);
      return null;
    }
  }, []);

  // Set centrifuge rotation
  const setRotation = useCallback(async (rpm) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/crystal/physics/rotation?rpm=${rpm}`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      setPhysicsState(prev => ({
        ...prev,
        rotationSpeed: data.rotation_speed_rpm || prev.rotationSpeed,
        coreState: rpm > 0 ? 'MAGNETIC_REUTILIZATION_ACTIVE' : 'STANDBY',
      }));
      
      return data;
    } catch (error) {
      console.error('CRYSTAL_HOOK: Rotation set failed', error);
      return null;
    }
  }, []);

  // Equip mineral
  const equipMineral = useCallback(async (mineralId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/crystal/minerals/equip?mineral_id=${mineralId}&user_id=${userId}`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setUserLicenses(prev => ({ ...prev, activeMineral: mineralId }));
      }
      return data;
    } catch (error) {
      console.error('CRYSTAL_HOOK: Equip failed', error);
      return { status: 'error', message: error.message };
    }
  }, [userId]);

  // Activate math refraction
  const activateMath = useCallback(async (mathId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/crystal/math/activate?math_id=${mathId || ''}&user_id=${userId}`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setUserLicenses(prev => ({ ...prev, activeMath: mathId }));
      }
      return data;
    } catch (error) {
      console.error('CRYSTAL_HOOK: Activate math failed', error);
      return { status: 'error', message: error.message };
    }
  }, [userId]);

  // Get shader injection code
  const getShaderCode = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/crystal/shader?user_id=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('CRYSTAL_HOOK: Shader fetch failed', error);
      return null;
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchPhysicsStatus();
    fetchMinerals();
    fetchMathRefractions();
    fetchUserLicenses();
  }, [fetchPhysicsStatus, fetchMinerals, fetchMathRefractions, fetchUserLicenses]);

  // Refresh telemetry periodically
  useEffect(() => {
    const interval = setInterval(fetchPhysicsStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchPhysicsStatus]);

  return {
    // Physics State
    ...physicsState,
    
    // Catalogs
    minerals,
    mathRefractions,
    
    // User Licenses
    ...userLicenses,
    
    // Actions
    injectPressure,
    setRotation,
    equipMineral,
    activateMath,
    getShaderCode,
    refresh: fetchPhysicsStatus,
    refreshLicenses: fetchUserLicenses,
  };
};

export default useCrystalPhysics;
