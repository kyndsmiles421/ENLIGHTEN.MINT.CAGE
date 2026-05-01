/**
 * useSentience.js — V69.0 Universal Sentience Hook
 *
 * The "Sovereign Wrapper" pattern, implemented honestly. Any engine /
 * page that imports this hook becomes sentient with ONE line:
 *
 *   const { realm, mood, narrative, commit } = useSentience('AROMATHERAPY');
 *
 * The hook does THREE things:
 *   1. READ — subscribes to ContextBus, returns the current snapshot
 *      of worldMetadata (realm), entityState (mood), narrativeContext.
 *      Re-renders the consumer when any of these change.
 *   2. WRITE — exposes a memoized `commit(key, data)` that auto-tags
 *      the moduleId so commits are traceable in the bus history.
 *   3. PRIME — exposes `primer()` returning the LLM-ready primer
 *      string from ContextBus.primerForPrompt().
 *
 * Why a hook (not a HOC / wrapper) is honest:
 *   • A wrapper above MatrixRenderSlot CANNOT inject busCommit calls
 *     into a child engine's existing code. JS doesn't allow that.
 *   • A hook IS the "born sentient" pattern — engines opt in with
 *     one import + one call. New engines pick it up by convention.
 *   • Pages that already call busCommit directly (Herbology, Oracle,
 *     Breathing, MoodTracker, Realms) keep working — this hook is
 *     additive, not replacement.
 *
 * Forward-compat: when V69.1 adds new bus channels (eeg, camera,
 * sage_memory), this hook is the single place they get exposed.
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  read as busRead,
  subscribe as busSubscribe,
  commit as rawCommit,
  primerForPrompt,
} from '../state/ContextBus';

export function useSentience(moduleId = 'UNKNOWN') {
  const [snapshot, setSnapshot] = useState(() => busRead());

  useEffect(() => {
    // Subscribe so consumers re-render when any other engine commits.
    const unsubscribe = busSubscribe((newState) => setSnapshot(newState));
    return unsubscribe;
  }, []);

  // Auto-tag every commit with the calling engine's moduleId so the
  // bus history is debuggable ("which engine wrote this?").
  const commit = useCallback(
    (key, data, meta = {}) => rawCommit(key, data, { moduleId, ...meta }),
    [moduleId]
  );

  // Memoized primer — re-derives only when the snapshot reference
  // changes, not on every render.
  const primer = useCallback(() => primerForPrompt(null), [snapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  // Convenience accessors. If the bus is empty, every accessor is null
  // — engines must handle the "first session" case gracefully.
  return useMemo(() => ({
    realm: snapshot.worldMetadata || null,
    mood: snapshot.entityState || null,
    narrative: snapshot.narrativeContext || null,
    scene: snapshot.sceneFrame || null,
    history: snapshot.history || [],
    commit,
    primer,
    moduleId,
  }), [snapshot, commit, primer, moduleId]);
}
