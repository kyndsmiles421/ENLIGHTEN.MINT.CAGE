/**
 * PrewarmRoutes.js — V1.1.13 Predictive Chunk Pre-warm
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * When the user hovers a Hub pillar, kick off the dynamic import()
 * for that route's chunk so by the time they tap, the JS is already
 * fetched + parsed. Zero-latency transitions on the most-hit routes.
 *
 * Why a curated map vs. trying to mirror App.js's 176 lazy() calls?
 * Because the goal is one surgical optimization for the routes a
 * user is most likely to tap from the Hub. Adding a route here has
 * no cost — webpack splits chunks the same way; we just kick off
 * the fetch a few hundred ms earlier.
 *
 * The map is intentionally small. Add a route only if it's:
 *   1. Reachable from a Hub pillar
 *   2. A heavy chunk (R3F canvases, AI integrations)
 *   3. High-traffic (Evolution Lab, Vault, Pricing)
 */

// Each value is a thunk so the actual import() is deferred until
// prewarm() is called. Webpack tracks each thunk independently.
const PREWARM_REGISTRY = {
  '/evolution-lab':       () => import(/* webpackPrefetch: true */ '../pages/EvolutionLab'),
  '/vault':               () => import(/* webpackPrefetch: true */ '../components/TesseractVault'),
  '/tesseract-vault':     () => import(/* webpackPrefetch: true */ '../components/TesseractVault'),
  '/tesseract':           () => import(/* webpackPrefetch: true */ '../pages/TesseractExperience'),
  '/forgotten-languages': () => import(/* webpackPrefetch: true */ '../pages/ForgottenLanguages'),
  '/pricing':             () => import(/* webpackPrefetch: true */ '../pages/Pricing'),
  '/observatory':         () => import(/* webpackPrefetch: true */ '../pages/Observatory'),
  '/spiritual-coach':     () => import(/* webpackPrefetch: true */ '../pages/SpiritualCoach'),
  '/meditation':          () => import(/* webpackPrefetch: true */ '../pages/Meditation'),
  '/breathing':           () => import(/* webpackPrefetch: true */ '../pages/Breathing'),
  '/herbology':           () => import(/* webpackPrefetch: true */ '../pages/Herbology'),
  '/oracle':              () => import(/* webpackPrefetch: true */ '../pages/Oracle'),
};

const PREWARMED = new Set();
const READY = new Set();
const READY_LISTENERS = new Set();

function notifyReady(route) {
  READY.add(route);
  for (const l of READY_LISTENERS) {
    try { l(route); } catch { /* noop */ }
  }
}

/**
 * Subscribe to chunk-ready events. Called with the route string each
 * time a prewarm fetch resolves. Returns a cleanup function.
 */
export function onPrewarmReady(handler) {
  READY_LISTENERS.add(handler);
  // Replay already-ready routes so late subscribers don't miss them.
  for (const r of READY) {
    try { handler(r); } catch { /* noop */ }
  }
  return () => READY_LISTENERS.delete(handler);
}

/** Synchronous check — has this route's chunk finished pre-warming? */
export function isPrewarmed(route) {
  return READY.has(route);
}

/**
 * Kick off the chunk import for a route. Idempotent — calling
 * prewarm('/x') 50 times still only fetches once. Silent on missing
 * routes (most pillars aren't in the registry).
 */
export function prewarmRoute(route) {
  if (!route || typeof route !== 'string') return;
  if (PREWARMED.has(route)) return;
  const thunk = PREWARM_REGISTRY[route];
  if (!thunk) return;
  PREWARMED.add(route);
  try {
    thunk()
      .then(() => notifyReady(route))
      .catch(() => {
        // If a chunk fails (lazy module deleted, network), drop the
        // memo so a future hover can retry. No console noise — the
        // actual click will surface a real error if the route is gone.
        PREWARMED.delete(route);
      });
  } catch {
    PREWARMED.delete(route);
  }
}

export default { prewarmRoute, onPrewarmReady, isPrewarmed };
