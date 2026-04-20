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
  console.log('%cENLIGHTEN.MINT.CAFE — Sovereign v1.0.0', bigGold);
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
