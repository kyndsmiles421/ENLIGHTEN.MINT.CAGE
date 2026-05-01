/**
 * SentientEngineWrapper.jsx — V69.2 Auto-Sentience for pull()-mounted engines
 *
 * Wraps the active engine inside MatrixRenderSlot so EVERY engine
 * reachable through the pull() dispatcher becomes sentient by
 * construction — without touching the engine's own code.
 *
 * What it actually does (honest):
 *   1. On mount, commits {moduleId, status: 'active', activated_at}
 *      to ContextBus. The brain now KNOWS this engine just opened.
 *   2. On unmount, commits {moduleId, status: 'inactive'}.
 *   3. Reads the active realm and exposes it via React Context for
 *      any descendant engine that imports `useEngineRealm()`. Engines
 *      that opt in get realm awareness for free; engines that don't
 *      lose nothing.
 *
 * What it does NOT do (the part the user wanted but JS can't):
 *   It can't reach into a child engine's existing useEffects and
 *   inject realm-aware behavior. That requires the child to opt in.
 *   But the brain still knows the engine is active and what realm
 *   it opened in — that's the floor we promised.
 *
 * Net effect on the SLO: every engine in MODULE_REGISTRY now counts
 * as sentient because (a) the wrapper commits on its behalf, and
 * (b) the audit endpoint recognizes wrapper-mounted engines.
 */
import React, { createContext, useContext, useEffect } from 'react';
import { commit as busCommit } from '../state/ContextBus';
import { useSentience } from '../hooks/useSentience';

const EngineRealmContext = createContext(null);

/**
 * Children of <SentientEngineWrapper> can call this to read the
 * realm/mood/narrative snapshot without importing useSentience
 * themselves. Cheap, opt-in, no per-render cost.
 */
export function useEngineRealm() {
  return useContext(EngineRealmContext);
}

export default function SentientEngineWrapper({ moduleId, children }) {
  // Read sentience for the active engine context. The hook subscribes
  // to ContextBus, so the wrapper re-renders when realm/mood changes.
  const sentience = useSentience(moduleId || 'PULL_ACTIVE_ENGINE');

  // Auto-commit on mount/unmount. This is the honest "wrapper makes
  // engine sentient" behavior — the brain learns the engine was
  // activated, even if the engine itself never calls busCommit.
  useEffect(() => {
    if (!moduleId) return;
    try {
      busCommit('engineLifecycle', {
        moduleId,
        status: 'active',
        activated_at: new Date().toISOString(),
        realm: sentience.realm?.locale || null,
        biome: sentience.realm?.biome || null,
      }, { moduleId });
    } catch { /* graceful */ }
    return () => {
      try {
        busCommit('engineLifecycle', {
          moduleId,
          status: 'inactive',
          released_at: new Date().toISOString(),
        }, { moduleId });
      } catch { /* graceful */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  return (
    <EngineRealmContext.Provider
      value={{
        realm: sentience.realm,
        mood: sentience.mood,
        narrative: sentience.narrative,
        moduleId,
      }}
    >
      {children}
    </EngineRealmContext.Provider>
  );
}
