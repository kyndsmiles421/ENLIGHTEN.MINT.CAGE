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

// Register push-notification service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}
