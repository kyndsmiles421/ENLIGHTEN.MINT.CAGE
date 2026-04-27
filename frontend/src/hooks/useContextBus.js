/**
 * useContextBus.js — React hook over the ContextBus singleton.
 *
 * Returns:
 *   bus      — current snapshot, re-renders on every commit
 *   commit   — write a key/value (and auto-pulse the field)
 *   primer   — string ready to prepend to any generator prompt
 *   readKey  — peek a single key without subscribing
 */
import { useEffect, useState, useCallback } from 'react';
import {
  commit as busCommit, read, readKey as busReadKey, subscribe, primerForPrompt,
} from '../state/ContextBus';

export function useContextBus() {
  const [bus, setBus] = useState(read());

  useEffect(() => {
    const unsub = subscribe((next) => setBus({ ...next }));
    return unsub;
  }, []);

  const commit = useCallback((key, data, meta) => busCommit(key, data, meta), []);
  const primer = useCallback((activeKey) => primerForPrompt(activeKey), []);
  const readKey = useCallback((k) => busReadKey(k), []);

  return { bus, commit, primer, readKey };
}
