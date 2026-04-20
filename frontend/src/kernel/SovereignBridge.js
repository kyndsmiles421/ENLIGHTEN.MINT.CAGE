/**
 * SovereignBridge — The Bridge Rule, enforced.
 *
 * Every tool, material, and resonance point in ENLIGHTEN.MINT.CAFE MUST be
 * registered here. If it isn't, `assertRegistered(toolId)` throws in dev and
 * logs a loud console.error in production. This makes "random dumping"
 * physically detectable — the console will scream the first time a rogue
 * tool fires.
 *
 * Schema (required per entry):
 *   id           — kebab-case globally unique id
 *   layer        — 2 (Workshop) | 3 (Quest Bridge) | 4 (VR Realm)
 *   domain       — which workshop/realm this belongs to
 *   unlocks      — array of Quest-Bridge keys this tool produces
 *   requires     — array of keys the user must hold to trigger this tool
 *   sparks       — base sparks earned on purposeful engagement (earn-only)
 *   purpose      — one-sentence human description; used by the HUD
 *
 * A missing field = invalid entry = build-time error.
 */

/* eslint-disable no-console */

const REGISTRY = Object.create(null);

const REQUIRED_FIELDS = ['id', 'layer', 'domain', 'unlocks', 'requires', 'sparks', 'purpose'];

function validateEntry(entry) {
  for (const f of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(entry, f)) {
      throw new Error(`[SovereignBridge] Entry "${entry.id || '?'}" missing required field: ${f}`);
    }
  }
  if (![2, 3, 4].includes(entry.layer)) {
    throw new Error(`[SovereignBridge] Entry "${entry.id}" has invalid layer=${entry.layer} (must be 2, 3, or 4).`);
  }
  if (!Array.isArray(entry.unlocks) || !Array.isArray(entry.requires)) {
    throw new Error(`[SovereignBridge] Entry "${entry.id}" unlocks/requires must be arrays.`);
  }
  if (typeof entry.sparks !== 'number' || entry.sparks < 0) {
    throw new Error(`[SovereignBridge] Entry "${entry.id}" sparks must be a non-negative number.`);
  }
}

export function registerTool(entry) {
  validateEntry(entry);
  if (REGISTRY[entry.id]) {
    console.warn(`[SovereignBridge] Duplicate registration for "${entry.id}" — overwriting.`);
  }
  REGISTRY[entry.id] = Object.freeze({ ...entry });
  return REGISTRY[entry.id];
}

export function registerMany(entries) {
  entries.forEach(registerTool);
}

export function getTool(id) {
  return REGISTRY[id] || null;
}

export function isRegistered(id) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, id);
}

export function allTools() {
  return Object.values(REGISTRY);
}

/**
 * Call this whenever a tool-level interaction fires. If the tool isn't
 * registered, we scream in the console and — in dev — throw. This is the
 * runtime fuse that makes the Bridge Rule impossible to bypass silently.
 */
export function assertRegistered(toolId, context = '') {
  if (!isRegistered(toolId)) {
    const msg = `[SovereignBridge] Unregistered tool fired: "${toolId}"${context ? ' at ' + context : ''}. ` +
      `Every tool MUST be registered via registerTool({id, layer, domain, unlocks, requires, sparks, purpose}). ` +
      `This is the Bridge Rule — see /app/frontend/src/kernel/SovereignBridge.js.`;
    if (process.env.NODE_ENV !== 'production') {
      console.error(msg);
      // Throw in dev so the violation blocks the developer immediately.
      throw new Error(msg);
    } else {
      console.error(msg);
    }
    return false;
  }
  return true;
}

/**
 * Pretty-print a summary to the browser console so the Sovereign can
 * verify the registry at any time: `window.__sovereignBridge.audit()`.
 */
export function audit() {
  const byLayer = { 2: [], 3: [], 4: [] };
  for (const e of allTools()) byLayer[e.layer].push(e);
  console.group('%c[SovereignBridge] Registered Tools', 'color:#C084FC;font-weight:bold');
  for (const layer of [2, 3, 4]) {
    console.log(`Layer ${layer}: ${byLayer[layer].length} entries`);
    console.table(byLayer[layer].map(e => ({
      id: e.id, domain: e.domain, sparks: e.sparks,
      unlocks: e.unlocks.join(','), requires: e.requires.join(','),
    })));
  }
  console.groupEnd();
}

if (typeof window !== 'undefined') {
  window.__sovereignBridge = { registerTool, registerMany, getTool, isRegistered, allTools, assertRegistered, audit };
}

export default {
  registerTool, registerMany, getTool, isRegistered, allTools, assertRegistered, audit,
};
