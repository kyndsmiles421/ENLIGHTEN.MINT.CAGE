import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// V68.31 — Sovereign Bridge Rule bootstraps BEFORE any component mounts.
// This registers every sanctioned tool in the system. `SovereignKernel.interact`
// will throw in dev if a rogue tool fires without being registered here.
import "@/kernel/toolRegistry";
// V68.31 — Mastery Ledger listens for sovereign:interact events. Importing
// here guarantees the listener attaches before any component fires.
import "@/kernel/MasteryLedger";

// V68.11 — R3F v9 + React 19 compatibility guard.
// React DevTools injects `__source` / `data-line-number` debug props into
// every JSX element; R3F v9's stricter `applyProps` reconciler cannot handle
// them and throws "Cannot set 'x-line-number'" recursively.
// Ref: https://github.com/pmndrs/react-three-fiber/issues/3494
if (typeof window !== "undefined") {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  // eslint-disable-next-line no-unused-vars
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {};
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber = true;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = () => {};

  // V57.2 — Webpack ChunkLoadError auto-recover.
  // When a lazy-loaded chunk fails (stale hash after redeploy, intermittent
  // network, Cloudflare bot challenge), webpack throws "ChunkLoadError" and
  // CRA's overlay shows a giant red wall of text. Detect it once and force
  // a single hard reload — same behaviour every PWA expects on update.
  const handleChunkError = (msg) => {
    if (typeof msg !== "string") return false;
    if (!/ChunkLoadError|Loading chunk .* failed/i.test(msg)) return false;
    if (sessionStorage.getItem("__chunk_reload__")) {
      // Already tried once this session — stop the loop, just log.
      return false;
    }
    sessionStorage.setItem("__chunk_reload__", "1");
    setTimeout(() => window.location.reload(), 100);
    return true;
  };
  window.addEventListener("error", (e) => {
    if (handleChunkError(e?.message || e?.error?.message)) e.preventDefault();
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (handleChunkError(e?.reason?.message || String(e?.reason))) e.preventDefault();
  });
  // Clear the reload-once flag after 30 s so future stale chunks recover too.
  setTimeout(() => sessionStorage.removeItem("__chunk_reload__"), 30000);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ── Sovereign Easter Egg ──────────────────────────────────────────────
// For the first 100 who open DevTools. If you are reading this,
// you have already earned your first Spark. The instrument is yours.
if (typeof window !== 'undefined') {
  const bigGold = 'font: 700 22px "Cormorant Garamond", serif; color: #D4AF37; text-shadow: 0 0 8px rgba(212,175,55,0.35);';
  const mono    = 'font: 11px "JetBrains Mono", monospace; color: #94a3b8; letter-spacing: 0.18em;';
  const glyph   = 'font: 40px serif; color: #F472B6;';
  // eslint-disable-next-line no-console
  console.log('%cॐ', glyph);
  // eslint-disable-next-line no-console
  console.log('%cENLIGHTEN.MINT.CAFE — Sovereign v1.0.5', bigGold);
  // eslint-disable-next-line no-console
  console.log('%c// to the first hundred — you are the Sovereigns. 528Hz is the heartbeat. Forge, do not spend.', mono);
}
// ──────────────────────────────────────────────────────────────────────

// Register push-notification service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}
