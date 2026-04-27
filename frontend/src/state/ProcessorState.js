/**
 * ProcessorState.js — Direct State Substitution Engine
 *
 * The Sovereign Engine never unmounts. Tools are not "pages" — they are
 * RENDER MODES of the same matrix. When the user activates a tool, we
 * do NOT navigate. We swap the active processor state, and the matrix's
 * render switch projects the tool's logic into the same coordinate
 * system, same parent stacking context.
 *
 *   IDLE          → MiniLattice (the 9×9 crystalline gear)
 *   AVATAR_GEN    → AvatarCreator's body (its own page chrome stripped)
 *   STARSEED      → StarseedAdventureEngine
 *   ...
 *
 * This is NOT React Router. There is no URL change, no history push,
 * no DOM teardown. The engine remains alive — only its render-mode
 * mutates. WebXR camera locked to the matrix coordinate system stays
 * locked when the mode flips.
 *
 * Module Registry:
 *   Each entry maps a state-id to a render component AND defines
 *   whether it should consume the entire matrix viewport or just the
 *   lattice slot.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ProcessorStateContext = createContext(null);

/**
 * MODULE_REGISTRY
 *
 * Each module is loaded lazily so the IDLE bundle stays under the
 * 800 KB Metabolic Seal. When pulled, the module renders inside the
 * MiniLattice slot using the lattice's existing stacking context —
 * no portal, no overlay, no fixed positioning.
 */
export const MODULE_REGISTRY = {
  IDLE:       null,
  AVATAR_GEN: React.lazy(() => import('../engines/AvatarGeneratorEngine')),
  // Future: STARSEED, FORECAST_GEN, COSMIC_PORTRAIT, DREAM_VIZ, etc.
};

export function ProcessorStateProvider({ children }) {
  // Single source of truth for the engine's active render-mode.
  const [activeModule, setActiveModule] = useState('IDLE');

  const pull = useCallback((moduleId) => {
    if (!Object.prototype.hasOwnProperty.call(MODULE_REGISTRY, moduleId)) {
      // Unknown module — stay IDLE, no-op.
      return;
    }
    setActiveModule(moduleId);
  }, []);

  const release = useCallback(() => setActiveModule('IDLE'), []);

  const value = useMemo(
    () => ({ activeModule, pull, release }),
    [activeModule, pull, release],
  );

  return (
    <ProcessorStateContext.Provider value={value}>
      {children}
    </ProcessorStateContext.Provider>
  );
}

export function useProcessorState() {
  const ctx = useContext(ProcessorStateContext);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g., during early SSR).
    return { activeModule: 'IDLE', pull: () => {}, release: () => {} };
  }
  return ctx;
}
